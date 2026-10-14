const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { FieldPath, FieldValue, getFirestore } = require('firebase-admin/firestore');
const { randomBytes } = require('node:crypto');
const { HttpsError, onCall } = require('firebase-functions/v2/https');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { GoogleAuth } = require('google-auth-library');

initializeApp();

const db = getFirestore();
const auth = getAuth();
const backupAuth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
const privilegedRoles = new Set(['schoolAdmin', 'superAdmin', 'director', 'headTeacher']);
let publicStatsCache = null;
let publicStatsCacheTime = 0;
const roleAliases = {
    deputyheadteacher: 'deputyHeadTeacher',
    bursar: 'bursar',
    teacher: 'teacher',
    librarian: 'librarian',
    hrofficer: 'hrOfficer',
    storemanager: 'storeManager',
    parent: 'parent',
    student: 'student',
    schooladmin: 'schoolAdmin',
    superadmin: 'superAdmin',
    director: 'director',
    headteacher: 'headTeacher'
};
const rolePermissions = {
    deputyHeadTeacher: ['students', 'parents', 'staff', 'teachers', 'classes', 'subjects', 'attendance', 'assessments', 'reportCards', 'timetables', 'notices', 'announcements', 'smsMessages', 'notifications', 'studyMaterials', 'quizzes', 'libraryBooks', 'libraryLoans', 'disciplineCases', 'clubs', 'healthRecords', 'transportRoutes', 'curriculum', 'streams', 'lessonPlans', 'schemesOfWork', 'admissions', 'applications', 'interviews', 'admissionLetters', 'waitingList', 'studentTransfers', 'enquiries', 'visitors', 'visitorLogs', 'appointments', 'incomingMail', 'followUps', 'dispatches', 'callLogs', 'calendarEvents'],
    bursar: ['students', 'parents', 'fees', 'feeInvoices', 'expenses', 'notices', 'payroll', 'paySlips', 'statutoryReturns', 'payrollReports', 'purchaseRequests', 'purchaseComparisons', 'quotations', 'purchaseOrders', 'goodsReceipts', 'supplierInvoices', 'suppliers'],
    teacher: ['students', 'classes', 'subjects', 'attendance', 'assessments', 'reportCards', 'timetables', 'notices', 'announcements', 'studyMaterials', 'quizzes', 'libraryBooks', 'libraryLoans', 'disciplineCases', 'clubs', 'curriculum', 'lessonPlans', 'schemesOfWork', 'sportsActivities'],
    librarian: ['students', 'classes', 'libraryBooks', 'libraryLoans', 'notices'],
    hrOfficer: ['staff', 'staffDirectory', 'teachers', 'staffAttendance', 'leaveRequests', 'recruitment', 'notices'],
    storeManager: ['inventory', 'assets', 'suppliers', 'purchaseOrders', 'purchaseRequests', 'purchaseComparisons', 'quotations', 'goodsReceipts', 'supplierInvoices', 'maintenanceWorkOrders', 'notices'],
    parent: ['students', 'attendance', 'assessments', 'reportCards', 'timetables', 'notices', 'studyMaterials', 'quizzes', 'fees', 'libraryLoans', 'transportRoutes'],
    student: ['students', 'attendance', 'assessments', 'reportCards', 'timetables', 'notices', 'studyMaterials', 'quizzes', 'libraryLoans']
};
const editableCollections = {
    deputyHeadTeacher: ['attendance', 'assessments', 'disciplineCases', 'clubs', 'healthRecords', 'transportRoutes', 'admissions', 'applications', 'interviews', 'admissionLetters', 'waitingList', 'studentTransfers', 'enquiries', 'visitors', 'visitorLogs', 'appointments', 'incomingMail', 'followUps', 'dispatches', 'callLogs', 'calendarEvents'],
    bursar: ['fees', 'feeInvoices', 'expenses', 'payroll', 'paySlips', 'statutoryReturns', 'payrollReports', 'purchaseRequests', 'purchaseComparisons', 'quotations', 'purchaseOrders', 'goodsReceipts', 'supplierInvoices'],
    teacher: ['attendance', 'assessments', 'studyMaterials', 'quizzes', 'disciplineCases', 'clubs', 'lessonPlans', 'schemesOfWork', 'sportsActivities'],
    librarian: ['libraryBooks', 'libraryLoans'],
    hrOfficer: ['staff', 'staffDirectory', 'teachers', 'staffAttendance', 'leaveRequests', 'recruitment'],
    storeManager: ['inventory', 'assets', 'purchaseOrders', 'purchaseRequests', 'quotations', 'goodsReceipts', 'supplierInvoices', 'maintenanceWorkOrders']
};
const normalizeRole = role => roleAliases[String(role || '').trim().toLowerCase().replace(/[\s_-]+/g, '')] || '';
const assignableRoles = new Set(Object.keys(rolePermissions));
const buildPermissions = role => Object.fromEntries((rolePermissions[role] || []).map(collection => [
    collection,
    { view: true, edit: (editableCollections[role] || []).includes(collection) }
]));

function validateSchoolId(value) {
    const schoolId = String(value || '').trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9_-]{1,63}$/.test(schoolId)) {
        throw new HttpsError('invalid-argument', 'A valid School ID is required.');
    }
    return schoolId;
}

function requirePlatformAdmin(request) {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in to the App Admin panel.');
    if (request.auth.token.appAdmin !== true) {
        throw new HttpsError('permission-denied', 'Only an authorized App Admin can create schools.');
    }
}

function isPlatformAdmin(request) {
    return request.auth?.token?.appAdmin === true;
}

async function writePlatformAudit(request, action, schoolId, subjectUid = null) {
    await db.collection('platformAuditLogs').add({
        actorUid: request.auth.uid,
        action,
        schoolId,
        subjectUid,
        createdAt: FieldValue.serverTimestamp()
    });
}

function schoolIdDate(date) {
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = String(date.getUTCFullYear());
    return `${day}${month}${year}`;
}

exports.getPublicPlatformStats = onCall(async () => {
    const cacheAgeMs = Date.now() - publicStatsCacheTime;
    if (publicStatsCache && cacheAgeMs < 60_000) return publicStatsCache;

    const [schools, parents, students, staff] = await Promise.all([
        db.collection('schools').count().get(),
        db.collectionGroup('parents').count().get(),
        db.collectionGroup('students').count().get(),
        db.collectionGroup('staff').count().get()
    ]);
    publicStatsCache = {
        schools: schools.data().count,
        parents: parents.data().count,
        students: students.data().count,
        staff: staff.data().count
    };
    publicStatsCacheTime = Date.now();
    return publicStatsCache;
});

exports.createSchool = onCall(async request => {
    requirePlatformAdmin(request);
    const name = String(request.data?.name || '').trim();
    const countryCode = String(request.data?.countryCode || '').trim().toUpperCase();
    const logoURL = String(request.data?.logoURL || '').trim();
    if (name.length < 2 || name.length > 120) {
        throw new HttpsError('invalid-argument', 'Enter a school name between 2 and 120 characters.');
    }
    if (!/^[A-Z]{2}$/.test(countryCode)) {
        throw new HttpsError('invalid-argument', 'Enter a two-letter ISO country code, such as UG.');
    }
    if (logoURL) {
        let parsedLogo;
        try {
            parsedLogo = new URL(logoURL);
        } catch {
            throw new HttpsError('invalid-argument', 'Enter a valid HTTPS logo URL.');
        }
        if (parsedLogo.protocol !== 'https:') {
            throw new HttpsError('invalid-argument', 'School logo URLs must use HTTPS.');
        }
    }

    const dateSuffix = schoolIdDate(new Date());
    const counterRef = db.doc('platformMetadata/schoolSequence');
    const schoolId = await db.runTransaction(async transaction => {
        const counterSnapshot = await transaction.get(counterRef);
        let nextSequence = (counterSnapshot.data()?.lastSequence || 0) + 1;
        if (!Number.isSafeInteger(nextSequence) || nextSequence < 1) {
            throw new HttpsError('resource-exhausted', 'The school ID sequence is unavailable.');
        }
        let allocatedId;
        let schoolRef;
        let existingSchool;
        for (let attempt = 0; attempt < 10; attempt += 1) {
            allocatedId = `SCH-${countryCode}-${String(nextSequence).padStart(4, '0')}-${dateSuffix}`;
            schoolRef = db.doc(`schools/${allocatedId}`);
            existingSchool = await transaction.get(schoolRef);
            if (!existingSchool.exists) break;
            nextSequence += 1;
        }
        if (existingSchool?.exists) {
            throw new HttpsError('already-exists', 'The generated School ID is already in use. Please retry.');
        }
        transaction.set(counterRef, {
            lastSequence: nextSequence,
            updatedAt: FieldValue.serverTimestamp()
        });
        transaction.create(schoolRef, {
            schoolId: allocatedId,
            name,
            countryCode,
            logoURL,
            status: 'active',
            createdAt: FieldValue.serverTimestamp(),
            createdBy: request.auth.uid
        });
        const auditRef = db.collection('platformAuditLogs').doc();
        transaction.create(auditRef, {
            actorUid: request.auth.uid,
            action: 'school.created',
            schoolId: allocatedId,
            subjectUid: null,
            createdAt: FieldValue.serverTimestamp()
        });
        return allocatedId;
    });

    return { schoolId, name, countryCode, logoURL };
});

exports.listPlatformSchools = onCall(async request => {
    requirePlatformAdmin(request);
    const pageSize = 50;
    const afterSchoolId = String(request.data?.afterSchoolId || '');
    let query = db.collection('schools').orderBy(FieldPath.documentId()).limit(pageSize + 1);
    if (afterSchoolId) query = query.startAfter(afterSchoolId);
    const snapshot = await query.get();
    const hasMore = snapshot.docs.length > pageSize;
    const schools = snapshot.docs.slice(0, pageSize);
    const result = await Promise.all(schools.map(async schoolSnapshot => {
        const school = schoolSnapshot.data();
        const count = await schoolSnapshot.ref.collection('members').count().get();
        return {
            id: schoolSnapshot.id,
            name: school.name || school.schoolName || schoolSnapshot.id,
            countryCode: school.countryCode || '',
            status: school.status || 'unknown',
            logoURL: school.logoURL || '',
            createdAt: school.createdAt?.toDate?.().toISOString() || '',
            memberCount: count.data().count
        };
    }));
    const totalCount = await db.collection('schools').count().get();
    return {
        schools: result,
        nextAfterSchoolId: hasMore ? schools[schools.length - 1].id : null,
        totalCount: totalCount.data().count
    };
});

exports.listPlatformSchoolAccounts = onCall(async request => {
    requirePlatformAdmin(request);
    const schoolId = validateSchoolId(request.data?.schoolId);
    const schoolSnapshot = await db.doc(`schools/${schoolId}`).get();
    if (!schoolSnapshot.exists) throw new HttpsError('not-found', 'School not found.');
    const pageSize = 200;
    const afterUid = String(request.data?.afterUid || '');
    let query = db.collection(`schools/${schoolId}/members`).orderBy(FieldPath.documentId()).limit(pageSize + 1);
    if (afterUid) query = query.startAfter(db.doc(`schools/${schoolId}/members/${afterUid}`));
    const snapshot = await query.get();
    const hasMore = snapshot.docs.length > pageSize;
    const totalCount = await db.collection(`schools/${schoolId}/members`).count().get();
    const accounts = snapshot.docs.slice(0, pageSize).map(memberSnapshot => {
        const member = memberSnapshot.data();
        return {
            uid: memberSnapshot.id,
            fullName: member.fullName || '',
            userId: member.userId || '',
            email: member.email || '',
            phone: member.phone || '',
            role: member.role || '',
            status: member.status || 'unknown',
            linkedRecordId: member.linkedRecordId || '',
            assignedClassIds: Array.isArray(member.assignedClassIds) ? member.assignedClassIds : [],
            createdAt: member.createdAt?.toDate?.().toISOString() || ''
        };
    });
    return {
        accounts,
        nextAfterUid: hasMore ? accounts[accounts.length - 1].uid : null,
        totalCount: totalCount.data().count
    };
});

exports.setPlatformSchoolStatus = onCall(async request => {
    requirePlatformAdmin(request);
    const schoolId = validateSchoolId(request.data?.schoolId);
    const status = request.data?.status;
    if (!['active', 'suspended'].includes(status)) {
        throw new HttpsError('invalid-argument', 'School status must be active or suspended.');
    }
    const schoolRef = db.doc(`schools/${schoolId}`);
    const schoolSnapshot = await schoolRef.get();
    if (!schoolSnapshot.exists) throw new HttpsError('not-found', 'School not found.');
    await schoolRef.update({ status, updatedAt: FieldValue.serverTimestamp() });
    try {
        await writePlatformAudit(request, `school.${status}`, schoolId);
    } catch (auditError) {
        console.error('Platform school status audit entry failed.', auditError);
    }
    return { schoolId, status };
});

async function requireSchoolAdmin(request, schoolId) {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in to manage school accounts.');
    if (isPlatformAdmin(request)) {
        return { platformAdmin: true };
    }
    const callerRef = db.doc(`schools/${schoolId}/members/${request.auth.uid}`);
    const callerSnapshot = await callerRef.get();
    const caller = callerSnapshot.data();
    if (!callerSnapshot.exists || caller.status !== 'active' || !privilegedRoles.has(caller.role)) {
        throw new HttpsError('permission-denied', 'Only an active school administrator can manage accounts.');
    }
    return caller;
}

function sanitizeAccount(data, { allowSchoolAdmin = false } = {}) {
    const role = normalizeRole(data.role);
    if (!assignableRoles.has(role) && !(allowSchoolAdmin && role === 'schoolAdmin')) {
        throw new HttpsError('invalid-argument', 'Choose a supported role.');
    }
    const email = String(data.email || '').trim().toLowerCase();
    const fullName = String(data.fullName || '').trim();
    const userId = String(data.userId || '').trim().toLowerCase();
    if (!email || !fullName || !userId) {
        throw new HttpsError('invalid-argument', 'Name, User ID, and email are required.');
    }
    const linkedRecordId = String(data.linkedRecordId || '').trim();
    const linkedRecordType = role === 'student' ? 'student' : role === 'parent' ? 'parent' : 'staff';
    if (['student', 'parent'].includes(role) && !linkedRecordId) {
        throw new HttpsError('invalid-argument', `A linked ${role} record ID is required.`);
    }
    return {
        role,
        email,
        fullName,
        userId,
        linkedRecordId,
        linkedRecordType,
        phone: String(data.phone || '').trim(),
        sections: Array.isArray(data.sections) ? data.sections.filter(section => typeof section === 'string').slice(0, 32) : [],
        assignedClassIds: Array.isArray(data.assignedClassIds)
            ? [...new Set(data.assignedClassIds.filter(classId => typeof classId === 'string').map(classId => classId.trim()).filter(Boolean))]
            : [],
        notificationPreferences: {
            WhatsApp: data.notificationPreferences?.WhatsApp === true,
            SMS: data.notificationPreferences?.SMS === true,
            Email: data.notificationPreferences?.Email === true,
            Push: data.notificationPreferences?.Push === true
        },
        profile: { name: fullName }
    };
}

async function validateAssignedClassIds(schoolId, role, classIds) {
    if (!['teacher', 'deputyHeadTeacher'].includes(role)) {
        if (classIds.length) throw new HttpsError('invalid-argument', 'Class assignments are only available for teaching roles.');
        return [];
    }
    if (classIds.length > 30 || classIds.some(classId => classId.length > 128 || classId.includes('/'))) {
        throw new HttpsError('invalid-argument', 'Choose up to 30 valid class assignments.');
    }
    if (role === 'teacher' && !classIds.length) {
        throw new HttpsError('invalid-argument', 'Assign at least one class to a teacher account.');
    }
    const snapshots = await Promise.all(classIds.map(classId =>
        db.doc(`schools/${schoolId}/classes/${classId}`).get()
    ));
    if (snapshots.some(snapshot => !snapshot.exists || snapshot.data()?.data?.deleted === true)) {
        throw new HttpsError('invalid-argument', 'One or more selected classes do not exist or are inactive.');
    }
    return classIds;
}

function accountAuditData(request, action, uid, changes = []) {
    return {
        data: {
            actorUid: request.auth.uid,
            subjectUid: uid,
            action,
            changedFields: changes,
            source: 'account-management',
            occurredAt: FieldValue.serverTimestamp()
        },
        version: 1,
        updatedBy: request.auth.uid,
        updatedAt: FieldValue.serverTimestamp()
    };
}

function rolePermissionOptions() {
    return Object.fromEntries(Object.entries(rolePermissions).map(([role, collections]) => [
        role,
        {
            view: collections,
            edit: editableCollections[role] || []
        }
    ]));
}

function sanitizePermissions(role, permissions) {
    if (permissions === undefined) return buildPermissions(role);
    if (!permissions || typeof permissions !== 'object' || Array.isArray(permissions)) {
        throw new HttpsError('invalid-argument', 'Data permissions must be a collection permission map.');
    }
    const viewableCollections = new Set(rolePermissions[role] || []);
    const editableRoleCollections = new Set(editableCollections[role] || []);
    const sanitized = {};
    for (const [collection, access] of Object.entries(permissions)) {
        if (!viewableCollections.has(collection) || !access || typeof access !== 'object' || Array.isArray(access)) {
            throw new HttpsError('invalid-argument', `The ${collection} permission is not available for this role.`);
        }
        if (Object.keys(access).some(permission => !['view', 'edit', 'delete'].includes(permission))
            || Object.values(access).some(value => typeof value !== 'boolean')) {
            throw new HttpsError('invalid-argument', `The ${collection} permission contains an unsupported access level.`);
        }
        const permission = {
            view: access.view === true,
            edit: access.edit === true,
            delete: access.delete === true
        };
        if ((permission.edit || permission.delete) && !editableRoleCollections.has(collection)) {
            throw new HttpsError('permission-denied', `The ${role} role cannot edit or delete ${collection}.`);
        }
        if ((permission.edit || permission.delete) && !permission.view) {
            throw new HttpsError('invalid-argument', `Edit and delete access to ${collection} require view access.`);
        }
        if (permission.delete && !permission.edit) {
            throw new HttpsError('invalid-argument', `Delete access to ${collection} requires edit access.`);
        }
        if (permission.view || permission.edit || permission.delete) sanitized[collection] = permission;
    }
    return sanitized;
}

exports.getAssignableSchoolPermissions = onCall(async request => {
    const schoolId = validateSchoolId(request.data?.schoolId);
    await requireSchoolAdmin(request, schoolId);
    return rolePermissionOptions();
});

exports.getAssignableSchoolClasses = onCall(async request => {
    const schoolId = validateSchoolId(request.data?.schoolId);
    await requireSchoolAdmin(request, schoolId);
    const snapshot = await db.collection(`schools/${schoolId}/classes`).limit(500).get();
    return snapshot.docs
        .filter(item => item.data().data?.deleted !== true)
        .map(item => {
            const record = item.data().data || item.data();
            return {
                id: item.id,
                name: String(record.name || record.className || record.streamName || item.id)
            };
        })
        .sort((left, right) => left.name.localeCompare(right.name));
});

exports.createSchoolUser = onCall(async request => {
    const schoolId = validateSchoolId(request.data?.schoolId);
    const caller = await requireSchoolAdmin(request, schoolId);
    if (!(await db.doc(`schools/${schoolId}`).get()).exists) {
        throw new HttpsError('not-found', 'The school has not been provisioned.');
    }
    const account = sanitizeAccount(request.data, { allowSchoolAdmin: caller.platformAdmin === true });
    account.assignedClassIds = await validateAssignedClassIds(schoolId, account.role, account.assignedClassIds);
    const matchingUserId = await db.collection(`schools/${schoolId}/members`).where('userId', '==', account.userId).limit(1).get();
    if (!matchingUserId.empty) throw new HttpsError('already-exists', 'That User ID is already used at this school.');
    if (account.role === 'parent') {
        const linkedStudent = await db.doc(`schools/${schoolId}/students/${account.linkedRecordId}`).get();
        if (!linkedStudent.exists) throw new HttpsError('not-found', 'The linked student record was not found in this school.');
    }
    if (account.role === 'student') {
        const linkedStudent = await db.doc(`schools/${schoolId}/students/${account.linkedRecordId}`).get();
        if (!linkedStudent.exists) throw new HttpsError('not-found', 'The linked student record was not found in this school.');
    }

    let createdUser;
    try {
        createdUser = await auth.createUser({
            email: account.email,
            password: randomBytes(32).toString('base64url'),
            displayName: account.fullName,
            disabled: false
        });
        const invitationUrl = await auth.generatePasswordResetLink(account.email);
        const member = {
            role: account.role,
            status: 'active',
            fullName: account.fullName,
            userId: account.userId,
            email: account.email,
            phone: account.phone,
            linkedRecordId: account.linkedRecordId || null,
            linkedRecordType: account.linkedRecordType,
            sections: account.sections,
            assignedClassIds: account.assignedClassIds,
            permissions: sanitizePermissions(account.role, request.data?.permissions),
            perms: { view: true },
            notificationPreferences: account.notificationPreferences,
            profile: account.profile,
            photoURL: '',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };
        const batch = db.batch();
        batch.set(db.doc(`schools/${schoolId}/members/${createdUser.uid}`), member);
        batch.create(db.collection(`schools/${schoolId}/auditEvents`).doc(), accountAuditData(
            request,
            'account.invited',
            createdUser.uid,
            ['role', 'sections', 'assignedClassIds', 'permissions', 'status']
        ));
        if (account.role === 'parent') {
            batch.set(db.doc(`schools/${schoolId}/members/${createdUser.uid}/linkedStudents/${account.linkedRecordId}`), {
                studentId: account.linkedRecordId,
                createdAt: FieldValue.serverTimestamp()
            });
        }
        if (caller.platformAdmin) {
            batch.create(db.collection('platformAuditLogs').doc(), {
                actorUid: request.auth.uid,
                action: 'account.created',
                schoolId,
                subjectUid: createdUser.uid,
                createdAt: FieldValue.serverTimestamp()
            });
        }
        await batch.commit();
    } catch (error) {
        if (createdUser) await auth.deleteUser(createdUser.uid);
        if (error instanceof HttpsError) throw error;
        if (error.code === 'auth/email-already-exists') {
            throw new HttpsError('already-exists', 'That email is already used by a Firebase account.');
        }
        console.error('Unable to create school member account.', error);
        throw new HttpsError('internal', 'Unable to create the account. Check the function logs for details.');
    }
    return { uid: createdUser.uid, email: account.email, role: account.role, invitationUrl };
});

exports.updateSchoolUser = onCall(async request => {
    const schoolId = validateSchoolId(request.data?.schoolId);
    await requireSchoolAdmin(request, schoolId);
    const uid = String(request.data?.uid || '');
    if (!uid) throw new HttpsError('invalid-argument', 'The account UID is required.');
    const memberRef = db.doc(`schools/${schoolId}/members/${uid}`);
    const memberSnapshot = await memberRef.get();
    if (!memberSnapshot.exists) throw new HttpsError('not-found', 'The school account was not found.');
    if (privilegedRoles.has(memberSnapshot.data().role) && !isPlatformAdmin(request)) {
        throw new HttpsError('permission-denied', 'Administrator accounts cannot be changed from this form.');
    }
    const currentMember = memberSnapshot.data();
    const role = normalizeRole(request.data?.role === undefined ? currentMember.role : request.data.role);
    if (!assignableRoles.has(role)) {
        throw new HttpsError('invalid-argument', 'Choose a supported role.');
    }
    const fullName = String(request.data?.fullName || '').trim();
    const email = String(request.data?.email || '').trim().toLowerCase();
    const userId = String(request.data?.userId || '').trim().toLowerCase();
    if (!fullName || !email) throw new HttpsError('invalid-argument', 'Name and email are required.');
    if (!userId) throw new HttpsError('invalid-argument', 'A User ID is required.');
    const linkedRecordId = String(request.data?.linkedRecordId || '').trim();
    if (linkedRecordId !== (memberSnapshot.data().linkedRecordId || '')) {
        throw new HttpsError('failed-precondition', 'Linked student, parent, or staff records must be changed through an approved linking workflow.');
    }
    const linkedRecordType = role === 'student' ? 'student' : role === 'parent' ? 'parent' : 'staff';
    if (linkedRecordId && linkedRecordType !== (currentMember.linkedRecordType || 'staff')) {
        throw new HttpsError('failed-precondition', 'The assigned role is incompatible with this linked record.');
    }
    const permissions = request.data?.permissions === undefined
        ? (role === normalizeRole(currentMember.role) ? currentMember.permissions || buildPermissions(role) : buildPermissions(role))
        : sanitizePermissions(role, request.data.permissions);
    const requestedClassIds = request.data?.assignedClassIds === undefined && role === normalizeRole(currentMember.role)
        ? currentMember.assignedClassIds || []
        : Array.isArray(request.data?.assignedClassIds)
            ? [...new Set(request.data.assignedClassIds.filter(value => typeof value === 'string').map(value => value.trim()).filter(Boolean))]
            : [];
    const assignedClassIds = await validateAssignedClassIds(schoolId, role, requestedClassIds);
    const duplicateUserId = await db.collection(`schools/${schoolId}/members`)
        .where('userId', '==', userId).limit(2).get();
    if (duplicateUserId.docs.some(snapshot => snapshot.id !== uid)) {
        throw new HttpsError('already-exists', 'That User ID is already used at this school.');
    }
    const profile = {
        fullName,
        userId,
        email,
        role,
        permissions,
        assignedClassIds,
        phone: String(request.data?.phone || '').trim(),
        photoURL: String(request.data?.photoURL || ''),
        sections: Array.isArray(request.data?.sections) ? request.data.sections.filter(value => typeof value === 'string').slice(0, 32) : [],
        notificationPreferences: {
            WhatsApp: request.data?.notificationPreferences?.WhatsApp === true,
            SMS: request.data?.notificationPreferences?.SMS === true,
            Email: request.data?.notificationPreferences?.Email === true,
            Push: request.data?.notificationPreferences?.Push === true
        },
        updatedAt: FieldValue.serverTimestamp()
    };
    let authProfileUpdated = false;
    let previousAuthProfile;
    try {
        const authUser = await auth.getUser(uid);
        previousAuthProfile = {
            email: authUser.email,
            displayName: authUser.displayName
        };
        await auth.updateUser(uid, { email, displayName: fullName });
        authProfileUpdated = true;
        const batch = db.batch();
        batch.update(memberRef, profile);
        batch.create(db.collection(`schools/${schoolId}/auditEvents`).doc(), accountAuditData(
            request,
            'account.updated',
            uid,
            Object.keys(profile).filter(key => key !== 'updatedAt')
        ));
        await batch.commit();
        if (isPlatformAdmin(request)) {
            try {
                await writePlatformAudit(request, 'account.updated', schoolId, uid);
            } catch (auditError) {
                console.error('Platform account update audit entry failed.', auditError);
            }
        }
    } catch (error) {
        console.error('Unable to update school member account.', error);
        if (authProfileUpdated) {
            try {
                await auth.updateUser(uid, previousAuthProfile);
            } catch (rollbackError) {
                console.error('Unable to roll back the Firebase Authentication profile after a failed account update.', rollbackError);
                throw new HttpsError('internal', 'The account update was only partially applied. Contact the App Admin to reconcile the account profile.');
            }
        }
        throw new HttpsError('internal', 'Unable to update the account.');
    }
    return { uid };
});

exports.generateSchoolUserPasswordResetLink = onCall(async request => {
    const schoolId = validateSchoolId(request.data?.schoolId);
    const caller = await requireSchoolAdmin(request, schoolId);
    const uid = String(request.data?.uid || '');
    if (!uid) throw new HttpsError('invalid-argument', 'The account UID is required.');
    const memberRef = db.doc(`schools/${schoolId}/members/${uid}`);
    const memberSnapshot = await memberRef.get();
    if (!memberSnapshot.exists) throw new HttpsError('not-found', 'The school account was not found.');
    if (privilegedRoles.has(memberSnapshot.data().role) && !caller.platformAdmin) {
        throw new HttpsError('permission-denied', 'Administrator reset links can only be issued by the App Admin.');
    }
    if (memberSnapshot.data().status !== 'active') {
        throw new HttpsError('failed-precondition', 'Activate the account before issuing a password setup link.');
    }
    try {
        const account = await auth.getUser(uid);
        const invitationUrl = await auth.generatePasswordResetLink(account.email);
        await db.collection(`schools/${schoolId}/auditEvents`).add(accountAuditData(
            request,
            'account.password_reset_link_issued',
            uid,
            ['password']
        ));
        return { invitationUrl };
    } catch (error) {
        if (error instanceof HttpsError) throw error;
        console.error('Unable to create a password reset link.', error);
        throw new HttpsError('internal', 'Unable to create a password reset link.');
    }
});

exports.setSchoolUserStatus = onCall(async request => {
    const schoolId = validateSchoolId(request.data?.schoolId);
    await requireSchoolAdmin(request, schoolId);
    const uid = String(request.data?.uid || '');
    const status = request.data?.status;
    if (!uid || typeof status !== 'boolean') throw new HttpsError('invalid-argument', 'Account ID and active status are required.');
    if (uid === request.auth.uid) throw new HttpsError('failed-precondition', 'You cannot deactivate your own account.');
    const memberRef = db.doc(`schools/${schoolId}/members/${uid}`);
    const memberSnapshot = await memberRef.get();
    if (!memberSnapshot.exists || (privilegedRoles.has(memberSnapshot.data().role) && !isPlatformAdmin(request))) {
        throw new HttpsError('permission-denied', 'This account cannot be changed from this form.');
    }
    if (privilegedRoles.has(memberSnapshot.data().role) && status === false) {
        const activeAdmins = await db.collection(`schools/${schoolId}/members`)
            .where('role', 'in', Array.from(privilegedRoles))
            .where('status', '==', 'active')
            .get();
        if (activeAdmins.docs.filter(admin => admin.id !== uid).length === 0) {
            throw new HttpsError('failed-precondition', 'A school must retain at least one active administrator.');
        }
    }
    const batch = db.batch();
    batch.update(memberRef, { status: status ? 'active' : 'disabled', updatedAt: FieldValue.serverTimestamp() });
    batch.create(db.collection(`schools/${schoolId}/auditEvents`).doc(), accountAuditData(
        request,
        status ? 'account.activated' : 'account.suspended',
        uid,
        ['status']
    ));
    await batch.commit();
    if (isPlatformAdmin(request)) {
        try {
            await writePlatformAudit(request, `account.${status ? 'activated' : 'suspended'}`, schoolId, uid);
        } catch (auditError) {
            console.error('Platform account status audit entry failed.', auditError);
        }
    }
    return { uid, status };
});

exports.deleteSchoolUser = onCall(async request => {
    const schoolId = validateSchoolId(request.data?.schoolId);
    await requireSchoolAdmin(request, schoolId);
    const uid = String(request.data?.uid || '');
    if (!uid || uid === request.auth.uid) throw new HttpsError('failed-precondition', 'Choose another account to delete.');
    const memberRef = db.doc(`schools/${schoolId}/members/${uid}`);
    const memberSnapshot = await memberRef.get();
    if (!memberSnapshot.exists || (privilegedRoles.has(memberSnapshot.data().role) && !isPlatformAdmin(request))) {
        throw new HttpsError('permission-denied', 'This account cannot be deleted from this form.');
    }
    if (privilegedRoles.has(memberSnapshot.data().role)) {
        const activeAdmins = await db.collection(`schools/${schoolId}/members`)
            .where('role', 'in', Array.from(privilegedRoles))
            .where('status', '==', 'active')
            .get();
        if (activeAdmins.docs.filter(admin => admin.id !== uid).length === 0) {
            throw new HttpsError('failed-precondition', 'A school must retain at least one active administrator.');
        }
    }
    const linkedStudents = await memberRef.collection('linkedStudents').get();
    const batch = db.batch();
    linkedStudents.docs.forEach(link => batch.delete(link.ref));
    batch.delete(memberRef);
    batch.create(db.collection(`schools/${schoolId}/auditEvents`).doc(), accountAuditData(
        request,
        'account.deleted',
        uid,
        ['account']
    ));
    await batch.commit();
    if (isPlatformAdmin(request)) {
        try {
            await writePlatformAudit(request, 'account.deleted', schoolId, uid);
        } catch (auditError) {
            console.error('Platform account deletion audit entry failed.', auditError);
        }
    }
    return { uid };
});

const auditedCollections = new Set([
    'students', 'parents', 'staff', 'classes', 'subjects', 'attendance',
    'assessments', 'reportCards', 'fees', 'feeInvoices', 'expenses', 'timetables',
    'notices', 'smsAlerts', 'libraryBooks', 'libraryLoans', 'healthRecords',
    'transportRoutes', 'disciplineCases', 'clubs', 'studyMaterials', 'quizzes',
    'inventory', 'assets', 'visitors', 'appointments', 'staffAttendance',
    'leaveRequests', 'payroll', 'suppliers', 'purchaseOrders', 'purchaseRequests',
    'settings', 'schoolProfile', 'announcements', 'smsMessages', 'notifications',
    'teachers', 'staffDirectory', 'visitorLogs', 'alumni',
    'boardingRecords', 'certificates', 'counseling', 'curriculum', 'idCards',
    'sportsActivities', 'recruitment', 'payrollReports', 'paySlips', 'statutoryReturns',
    'purchaseComparisons', 'quotations', 'goodsReceipts', 'supplierInvoices',
    'maintenanceWorkOrders', 'enquiries', 'incomingMail', 'followUps', 'dispatches',
    'callLogs', 'admissions', 'applications', 'interviews', 'admissionLetters',
    'waitingList', 'studentTransfers', 'questionBank', 'onlineClasses',
    'learningAnalytics', 'transcripts', 'unebExams', 'schemesOfWork', 'streams',
    'lessonPlans', 'schoolDocuments', 'calendarEvents', 'ministryReports', 'emisReports'
]);

exports.auditSchoolRecordChanges = onDocumentWritten(
    'schools/{schoolId}/{collectionName}/{recordId}',
    async event => {
        const { schoolId, collectionName, recordId } = event.params;
        if (collectionName === 'auditEvents' || !auditedCollections.has(collectionName)) return;

        const before = event.data?.before.exists ? event.data.before.data() : null;
        const after = event.data?.after.exists ? event.data.after.data() : null;
        if (!before && !after) return;

        const beforeData = before?.data && typeof before.data === 'object' ? before.data : before || {};
        const afterData = after?.data && typeof after.data === 'object' ? after.data : after || {};
        const action = !before || !afterData.deleted && beforeData.deleted
            ? 'create'
            : !after || afterData.deleted === true && beforeData.deleted !== true
                ? 'delete'
                : 'update';
        const changedFields = Array.from(new Set([...Object.keys(beforeData), ...Object.keys(afterData)]))
            .filter(field => JSON.stringify(beforeData[field]) !== JSON.stringify(afterData[field]))
            .slice(0, 50);
        const actorUid = after?.updatedBy || before?.updatedBy || null;
        const auditRef = db.doc(`schools/${schoolId}/auditEvents/${event.id}`);

        return auditRef.create({
            data: {
                actorUid,
                action,
                collection: collectionName,
                recordId,
                changedFields,
                source: 'firestore-trigger',
                occurredAt: FieldValue.serverTimestamp()
            },
            version: 1,
            updatedBy: actorUid || 'system',
            updatedAt: FieldValue.serverTimestamp()
        }).catch(async error => {
            if (error.code !== 6 && error.code !== 'already-exists') throw error;
        });
    }
);

exports.startScheduledFirestoreExport = onSchedule({
    schedule: '0 2 * * *',
    timeZone: 'Africa/Kampala',
    region: 'us-central1',
    timeoutSeconds: 540,
    maxInstances: 1
}, async event => {
    const bucketName = String(process.env.FIRESTORE_BACKUP_BUCKET || '').trim();
    if (!/^[a-z0-9][a-z0-9._-]{1,220}[a-z0-9]$/.test(bucketName)) {
        throw new Error('Set FIRESTORE_BACKUP_BUCKET to a valid Cloud Storage bucket before enabling scheduled exports.');
    }
    const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
    if (!projectId) throw new Error('The Google Cloud project ID is unavailable.');

    const scheduleDate = new Date(event.scheduleTime || Date.now());
    const backupId = scheduleDate.toISOString().replace(/[-:.]/g, '');
    const outputUriPrefix = `gs://${bucketName}/firestore-exports/${backupId}`;
    const backupRef = db.doc(`platformBackupJobs/${backupId}`);
    const reserved = await db.runTransaction(async transaction => {
        const existing = await transaction.get(backupRef);
        if (existing.exists && existing.data().status !== 'failed') return false;
        transaction.set(backupRef, {
            status: 'starting',
            outputUriPrefix,
            scheduleTime: scheduleDate.toISOString(),
            requestedAt: FieldValue.serverTimestamp()
        });
        return true;
    });
    if (!reserved) return;

    try {
        const client = await backupAuth.getClient();
        const response = await client.request({
            url: `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default):exportDocuments`,
            method: 'POST',
            data: { outputUriPrefix }
        });
        const operationName = response.data?.name;
        if (!operationName) throw new Error('Firestore did not return an export operation name.');
        await backupRef.update({
            status: 'running',
            operationName,
            startedAt: FieldValue.serverTimestamp()
        });
    } catch (error) {
        await backupRef.update({
            status: 'failed',
            errorCode: String(error.code || 'export-start-failed'),
            errorMessage: String(error.message || 'Unable to start Firestore export.').slice(0, 500),
            finishedAt: FieldValue.serverTimestamp()
        });
        throw error;
    }
});

exports.reconcileFirestoreExports = onSchedule({
    schedule: 'every 60 minutes',
    timeZone: 'Africa/Kampala',
    region: 'us-central1',
    timeoutSeconds: 540,
    maxInstances: 1
}, async () => {
    const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
    if (!projectId) throw new Error('The Google Cloud project ID is unavailable.');
    const jobs = await db.collection('platformBackupJobs')
        .where('status', '==', 'running')
        .limit(50)
        .get();
    const client = await backupAuth.getClient();

    for (const job of jobs.docs) {
        const operationName = job.data().operationName;
        if (!operationName) continue;
        try {
            const response = await client.request({
                url: `https://firestore.googleapis.com/v1/${operationName}`,
                method: 'GET'
            });
            const operation = response.data;
            if (!operation.done) continue;
            if (operation.error) {
                await job.ref.update({
                    status: 'failed',
                    errorCode: String(operation.error.code || 'export-failed'),
                    errorMessage: String(operation.error.message || 'Firestore export failed.').slice(0, 500),
                    finishedAt: FieldValue.serverTimestamp()
                });
            } else {
                await job.ref.update({
                    status: 'completed',
                    completedAt: FieldValue.serverTimestamp()
                });
            }
        } catch (error) {
            console.error(`Unable to check Firestore export ${job.id}.`, error);
        }
    }
});
