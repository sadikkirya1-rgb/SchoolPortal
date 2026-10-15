const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { FieldPath, FieldValue, getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { createHash, randomBytes } = require('node:crypto');
const { HttpsError, onCall } = require('firebase-functions/v2/https');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { GoogleAuth } = require('google-auth-library');

initializeApp();

const db = getFirestore();
const auth = getAuth();
const messaging = getMessaging();
const backupAuth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
const privilegedRoles = new Set(['schoolAdmin', 'superAdmin', 'director', 'headTeacher']);
const linkedRecordCollections = new Set([
    'students', 'attendance', 'assessments', 'reportCards', 'fees',
    'feeInvoices', 'healthRecords', 'libraryLoans', 'disciplineCases',
    'certificates', 'idCards', 'transcripts', 'unebExams'
]);
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
    parent: ['students', 'attendance', 'assessments', 'reportCards', 'fees', 'notices'],
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
    if (!callerSnapshot.exists || caller.status !== 'active' || caller.mustChangePassword === true
        || !privilegedRoles.has(caller.role)) {
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
    if (linkedRecordId.length > 120) {
        throw new HttpsError('invalid-argument', 'Linked record IDs must be 120 characters or fewer.');
    }
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

function validateAccountPassword(value) {
    const password = typeof value === 'string' ? value : '';
    if (password.length < 8 || password.length > 128) {
        throw new HttpsError(
            'invalid-argument',
            'Temporary passwords must be between 8 and 128 characters.'
        );
    }
    return password;
}

function validatePermanentPassword(value) {
    const password = validateAccountPassword(value);
    if (!/[a-z]/.test(password)
        || !/[A-Z]/.test(password)
        || !/[0-9]/.test(password)
        || !/[^A-Za-z0-9]/.test(password)) {
        throw new HttpsError(
            'invalid-argument',
            'Your new password must include uppercase, lowercase, a number, and a symbol.'
        );
    }
    return password;
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

exports.getAssignableSchoolRecords = onCall(async request => {
    const schoolId = validateSchoolId(request.data?.schoolId);
    await requireSchoolAdmin(request, schoolId);
    const recordType = request.data?.recordType;
    if (!['students', 'staff'].includes(recordType)) {
        throw new HttpsError('invalid-argument', 'Choose students or staff records.');
    }
    const snapshot = await db.collection(`schools/${schoolId}/${recordType}`).get();
    return snapshot.docs
        .map(item => {
            const document = item.data();
            const record = document.data || document;
            if (document.deleted === true || record.deleted === true) return null;
            const name = String(
                record.fullName
                || record.name
                || record.studentName
                || record.staffName
                || [record.firstName, record.middleName, record.lastName].filter(Boolean).join(' ')
                || item.id
            ).trim();
            return {
                id: item.id,
                displayId: String(
                    record.admissionNo
                    || record.studentId
                    || record.staffId
                    || record.employeeId
                    || item.id
                ),
                name,
                department: String(
                    record.department
                    || record.departmentName
                    || record.staffDepartment
                    || ''
                ).trim(),
                group: String(record.className || record.class || record.section || '').trim()
            };
        })
        .filter(Boolean)
        .sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id));
});

exports.getLinkedSchoolRecords = onCall(async request => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in to view linked student records.');
    const schoolId = validateSchoolId(request.data?.schoolId);
    const collectionName = String(request.data?.collectionName || '');
    if (!linkedRecordCollections.has(collectionName)) {
        throw new HttpsError('invalid-argument', 'Choose a supported student record collection.');
    }

    const schoolRef = db.doc(`schools/${schoolId}`);
    const memberRef = schoolRef.collection('members').doc(request.auth.uid);
    const [schoolSnapshot, memberSnapshot] = await Promise.all([schoolRef.get(), memberRef.get()]);
    if (!schoolSnapshot.exists || schoolSnapshot.data().status !== 'active'
        || !memberSnapshot.exists || memberSnapshot.data().status !== 'active'
        || memberSnapshot.data().mustChangePassword === true) {
        throw new HttpsError('permission-denied', 'This account does not have active access to school records.');
    }

    const member = memberSnapshot.data();
    if (!['parent', 'student'].includes(member.role)
        || member.permissions?.[collectionName]?.view !== true) {
        throw new HttpsError('permission-denied', 'This account does not have permission to view these records.');
    }

    let studentIds;
    if (member.role === 'student') {
        studentIds = member.linkedRecordType === 'student' && member.linkedRecordId
            ? [String(member.linkedRecordId)]
            : [];
    } else {
        const links = await memberRef.collection('linkedStudents').get();
        studentIds = links.docs.map(link => link.id);
    }
    if (studentIds.length > 30) {
        throw new HttpsError('failed-precondition', 'This account is linked to more than 30 students. Contact the school administrator.');
    }
    if (!studentIds.length) return { records: [] };

    const documents = [];
    if (collectionName === 'students') {
        const snapshots = await Promise.all(studentIds.map(studentId =>
            schoolRef.collection('students').doc(studentId).get()
        ));
        documents.push(...snapshots.filter(snapshot => snapshot.exists));
    } else {
        const recordsRef = schoolRef.collection(collectionName);
        const [byStudentId, byMemberId, byDocumentId] = await Promise.all([
            recordsRef.where('data.studentId', 'in', studentIds).get(),
            collectionName === 'attendance'
                ? recordsRef.where('data.memberId', 'in', studentIds).get()
                : Promise.resolve({ docs: [] }),
            recordsRef.where(FieldPath.documentId(), 'in', studentIds).get()
        ]);
        const uniqueRecords = new Map([
            ...byStudentId.docs,
            ...byMemberId.docs,
            ...byDocumentId.docs
        ].map(snapshot => [snapshot.id, snapshot]));
        documents.push(...uniqueRecords.values());
    }
    return {
        records: documents
            .filter(snapshot => snapshot.data().data?.deleted !== true)
            .map(snapshot => ({
                id: snapshot.id,
                data: snapshot.data().data || {},
                version: snapshot.data().version || 0
            }))
    };
});

exports.getParentPortalDashboardSummary = onCall({ cors: true }, async request => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in to view the parent dashboard.');
    const schoolId = validateSchoolId(request.data?.schoolId);
    const schoolRef = db.doc(`schools/${schoolId}`);
    const memberRef = schoolRef.collection('members').doc(request.auth.uid);
    const [schoolSnapshot, memberSnapshot] = await Promise.all([schoolRef.get(), memberRef.get()]);
    if (!schoolSnapshot.exists || schoolSnapshot.data().status !== 'active'
        || !memberSnapshot.exists || memberSnapshot.data().status !== 'active'
        || memberSnapshot.data().mustChangePassword === true) {
        throw new HttpsError('permission-denied', 'This account does not have active access to school records.');
    }
    if (memberSnapshot.data().role !== 'parent') {
        throw new HttpsError('permission-denied', 'Only parent accounts can view the parent dashboard.');
    }

    const links = await memberRef.collection('linkedStudents').get();
    const studentIds = links.docs.map(link => link.id);
    if (studentIds.length > 30) {
        throw new HttpsError('failed-precondition', 'This account is linked to more than 30 students. Contact the school administrator.');
    }
    if (!studentIds.length) {
        return {
            children: [],
            attendance: [],
            reportCards: [],
            assessments: [],
            fees: [],
            idCards: [],
            noticeCount: 0,
            noticeCards: []
        };
    }

    const studentSnapshots = await Promise.all(studentIds.map(studentId =>
        schoolRef.collection('students').doc(studentId).get()
    ));
    const studentById = new Map(studentSnapshots.map(snapshot => [
        snapshot.id,
        snapshot.exists ? snapshot.data().data || {} : {}
    ]));
    const children = studentIds.map(studentId => {
        const record = studentById.get(studentId) || {};
        const admissionNumber = String(record.admissionNo || record.admissionNumber || '');
        return {
            id: studentId,
            fullName: String(record.fullName || record.name || record.studentName
                || [record.firstName, record.lastName].filter(Boolean).join(' ') || 'Student'),
            admissionNo: admissionNumber,
            displayId: admissionNumber,
            className: String(record.className || record.class || ''),
            section: String(record.section || record.sectionName || '')
        };
    });
    const admissionNumbers = [...new Set(children.map(child => child.admissionNo).filter(Boolean))];
    const idCardsRef = schoolRef.collection('idCards');
    const idCardQueries = [];
    if (studentIds.length) {
        idCardQueries.push(idCardsRef.where('data.studentId', 'in', studentIds).get());
    }
    if (admissionNumbers.length) {
        idCardQueries.push(idCardsRef.where('data.memberId', 'in', admissionNumbers).get());
    }
    const idCardSnapshots = idCardQueries.length ? await Promise.all(idCardQueries) : [];
    const linkedIdCards = new Map(idCardSnapshots.flatMap(snapshot => snapshot.docs)
        .map(snapshot => [snapshot.id, snapshot]));
    const idCards = [...linkedIdCards.values()].flatMap(snapshot => {
        const data = snapshot.data().data || {};
        if (snapshot.data().deleted === true || data.deleted === true
            || String(data.memberType || '').trim().toLowerCase() !== 'student'
            || !String(data.memberName || '').trim() || !String(data.memberId || '').trim()) {
            return [];
        }
        const linkedChild = children.find(child =>
            String(data.studentId || '') === child.id
            || (child.admissionNo && String(data.memberId || '').trim() === child.admissionNo)
        );
        if (!linkedChild) return [];
        const card = { id: snapshot.id, studentId: linkedChild.id };
        [
            'memberName', 'memberId', 'memberType', 'designation', 'department',
            'division', 'validUntil', 'emergency', 'status', 'primary', 'secondary',
            'schoolName', 'schoolAddress', 'photo', 'logo'
        ].forEach(field => {
            const value = data[field];
            if (typeof value === 'string' || typeof value === 'number') {
                card[field] = String(value).slice(0, field === 'photo' || field === 'logo' ? 4096 : 300);
            }
        });
        return [card];
    });
    const summaryFields = {
        attendance: ['studentId', 'memberId', 'status', 'attendanceStatus', 'attendanceDate', 'date', 'day'],
        reportCards: ['reportName', 'title', 'name', 'period', 'academicPeriod', 'term', 'year', 'average', 'percentage', 'averagePercentage', 'grade', 'overallGrade', 'status', 'publicationStatus', 'isPublished', 'published', 'visibility', 'publishedAt', 'publicationDate', 'date'],
        assessments: ['title', 'name', 'assessmentName', 'subjectName', 'subject', 'type', 'assessmentType', 'category', 'dueDate', 'deadline', 'date', 'status', 'publicationStatus', 'isPublished', 'published', 'visibility'],
        fees: ['feeName', 'feeType', 'name', 'dueDate', 'paymentDueDate', 'deadline', 'totalFee', 'totalAmount', 'amountDue', 'balance', 'balanceDue', 'amountPaid', 'paidAmount', 'amountCollected', 'status']
    };
    const summaryRecords = await Promise.all(Object.entries(summaryFields).map(async ([collectionName, fields]) => {
        const recordsRef = schoolRef.collection(collectionName);
        const [byStudentId, byMemberId, byDocumentId] = await Promise.all([
            recordsRef.where('data.studentId', 'in', studentIds).get(),
            collectionName === 'attendance'
                ? recordsRef.where('data.memberId', 'in', studentIds).get()
                : Promise.resolve({ docs: [] }),
            recordsRef.where(FieldPath.documentId(), 'in', studentIds).get()
        ]);
        const uniqueRecords = new Map([...byStudentId.docs, ...byMemberId.docs, ...byDocumentId.docs]
            .map(snapshot => [snapshot.id, snapshot]));
        return [collectionName, [...uniqueRecords.values()]
            .filter(snapshot => {
                const data = snapshot.data().data || {};
                if (data.deleted === true || String(data.visibility || '').toLowerCase() === 'private') return false;
                const status = String(data.status || data.publicationStatus || '').trim().toLowerCase();
                if (collectionName === 'reportCards') {
                    return (!status || ['published', 'released'].includes(status))
                        && data.isPublished !== false
                        && data.published !== false;
                }
                return !['draft', 'archived', 'deleted', 'private'].includes(status);
            })
            .map(snapshot => {
                const data = snapshot.data().data || {};
                const studentId = String(data.studentId || (collectionName === 'attendance' ? data.memberId : '') || snapshot.id);
                const summary = { studentId };
                fields.forEach(field => {
                    const value = data[field];
                    if (value === undefined || value === null) return;
                    if (typeof value?.toDate === 'function') {
                        summary[field] = value.toDate().toISOString();
                    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                        summary[field] = value;
                    } else if (Array.isArray(value)) {
                        summary[field] = value.filter(item => typeof item === 'string' || typeof item === 'number')
                            .map(String).join(', ');
                    }
                });
                return summary;
            })
            .filter(record => studentIds.includes(record.studentId))];
    }));

    const noticeSnapshot = await schoolRef.collection('notices')
        .where('data.status', 'in', ['Published', 'published'])
        .get();
    const today = new Date();
    const noticeCards = [];
    noticeSnapshot.docs.forEach(snapshot => {
        const record = snapshot.data().data || {};
        const visibleOnPortal = [record.portal, record.displayBoard]
            .filter(value => value !== undefined && value !== null)
            .every(value => String(value).trim().toLowerCase() !== 'no');
        if (snapshot.data().deleted === true || record.deleted === true
            || String(record.status || '').trim().toLowerCase() !== 'published'
            || !visibleOnPortal) return;
        const audience = String(record.audienceRoles || record.targetRoles
            || record.targetAudience || record.audience || '').toLowerCase();
        if (!audience || !/\b(parent|parents|family|families|guardian|guardians|school community|public|all|everyone)\b/.test(audience)) return;
        const publishDate = record.publishDate?.toDate?.() || record.publishDate;
        if (publishDate && !Number.isNaN(Date.parse(publishDate)) && new Date(publishDate) > today) return;
        const expiry = record.expiryDate || record.expiry || '';
        const expiryDate = expiry?.toDate?.() || expiry;
        if (expiryDate && !Number.isNaN(Date.parse(expiryDate)) && new Date(expiryDate) < today) return;
        noticeCards.push({
            title: String(record.title || record.subject || record.name || 'School notice'),
            category: String(record.category || ''),
            audience: String(record.audience || ''),
            priority: String(record.priority || ''),
            publishDate: publishDate && !Number.isNaN(Date.parse(publishDate))
                ? new Date(publishDate).toISOString()
                : '',
            expiryDate: expiryDate && !Number.isNaN(Date.parse(expiryDate))
                ? new Date(expiryDate).toISOString()
                : '',
            contentText: String(record.contentText || record.content || '').slice(0, 240)
        });
    });

    return {
        children,
        idCards,
        ...Object.fromEntries(summaryRecords),
        noticeCount: noticeCards.length,
        noticeCards
    };
});

exports.createSchoolUser = onCall(async request => {
    const schoolId = validateSchoolId(request.data?.schoolId);
    const temporaryPassword = validateAccountPassword(request.data?.temporaryPassword);
    const caller = await requireSchoolAdmin(request, schoolId);
    if (!(await db.doc(`schools/${schoolId}`).get()).exists) {
        throw new HttpsError('not-found', 'The school has not been provisioned.');
    }
    const account = sanitizeAccount(request.data, {
        allowSchoolAdmin: caller.platformAdmin === true || caller.role === 'schoolAdmin'
    });
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
            password: temporaryPassword,
            displayName: account.fullName,
            disabled: false
        });
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
            mustChangePassword: true,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };
        const batch = db.batch();
        batch.set(db.doc(`schools/${schoolId}/members/${createdUser.uid}`), member);
        batch.create(db.collection(`schools/${schoolId}/auditEvents`).doc(), accountAuditData(
            request,
            'account.invited',
            createdUser.uid,
            ['role', 'sections', 'assignedClassIds', 'permissions', 'status', 'mustChangePassword']
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
        if (['auth/invalid-password', 'auth/password-does-not-meet-requirements'].includes(error.code)) {
            throw new HttpsError('invalid-argument', 'The temporary password does not meet Firebase Authentication requirements.');
        }
        console.error('Unable to create school member account.', error);
        throw new HttpsError('internal', 'Unable to create the account. Check the function logs for details.');
    }
    return { uid: createdUser.uid, email: account.email, role: account.role, mustChangePassword: true };
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

exports.setSchoolUserTemporaryPassword = onCall(async request => {
    const schoolId = validateSchoolId(request.data?.schoolId);
    const caller = await requireSchoolAdmin(request, schoolId);
    const uid = String(request.data?.uid || '');
    const temporaryPassword = validateAccountPassword(request.data?.temporaryPassword);
    if (!uid || uid === request.auth.uid) {
        throw new HttpsError('failed-precondition', 'Choose another account to reset.');
    }
    const memberRef = db.doc(`schools/${schoolId}/members/${uid}`);
    const memberSnapshot = await memberRef.get();
    if (!memberSnapshot.exists) throw new HttpsError('not-found', 'The school account was not found.');
    if (memberSnapshot.data().status !== 'active') {
        throw new HttpsError('failed-precondition', 'Activate the account before setting a temporary password.');
    }
    if (privilegedRoles.has(memberSnapshot.data().role) && !caller.platformAdmin) {
        throw new HttpsError('permission-denied', 'Administrator passwords can only be reset by the App Admin.');
    }

    try {
        await auth.updateUser(uid, { password: temporaryPassword });
        await auth.revokeRefreshTokens(uid);
        const batch = db.batch();
        batch.update(memberRef, {
            mustChangePassword: true,
            updatedAt: FieldValue.serverTimestamp()
        });
        batch.create(db.collection(`schools/${schoolId}/auditEvents`).doc(), accountAuditData(
            request,
            'account.temporary_password_set',
            uid,
            ['mustChangePassword']
        ));
        await batch.commit();
    } catch (error) {
        if (error instanceof HttpsError) throw error;
        if (['auth/invalid-password', 'auth/password-does-not-meet-requirements'].includes(error.code)) {
            throw new HttpsError('invalid-argument', 'The temporary password does not meet Firebase Authentication requirements.');
        }
        if (error.code === 'auth/user-not-found') throw new HttpsError('not-found', 'The Firebase account was not found.');
        console.error('Unable to set a temporary password for a school account.', error);
        throw new HttpsError('internal', 'Unable to set the temporary password. Check the function logs for details.');
    }
    return { uid, mustChangePassword: true };
});

exports.completeOwnPasswordChange = onCall(async request => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in before changing your password.');
    const schoolId = validateSchoolId(request.data?.schoolId);
    const password = validatePermanentPassword(request.data?.password);
    const authTime = Number(request.auth.token.auth_time);
    if (!Number.isFinite(authTime) || Date.now() / 1000 - authTime > 300) {
        throw new HttpsError('failed-precondition', 'Your sign-in has expired. Sign in again before changing your password.');
    }

    const schoolSnapshot = await db.doc(`schools/${schoolId}`).get();
    const memberRef = db.doc(`schools/${schoolId}/members/${request.auth.uid}`);
    const memberSnapshot = await memberRef.get();
    if (!schoolSnapshot.exists || schoolSnapshot.data()?.status !== 'active'
        || !memberSnapshot.exists || memberSnapshot.data()?.status !== 'active') {
        throw new HttpsError('permission-denied', 'An active school account is required.');
    }

    try {
        await auth.updateUser(request.auth.uid, { password });
        const batch = db.batch();
        batch.update(memberRef, {
            mustChangePassword: false,
            passwordChangedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        });
        batch.create(db.collection(`schools/${schoolId}/auditEvents`).doc(), accountAuditData(
            request,
            'account.password_changed',
            request.auth.uid,
            ['mustChangePassword']
        ));
        await batch.commit();
    } catch (error) {
        if (error instanceof HttpsError) throw error;
        console.error('Unable to complete a school account password change.', error);
        throw new HttpsError('internal', 'The password could not be changed. Please try again.');
    }
    return { success: true };
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
    const [linkedStudents, pushTokens] = await Promise.all([
        memberRef.collection('linkedStudents').get(),
        memberRef.collection('pushTokens').get()
    ]);
    const batch = db.batch();
    linkedStudents.docs.forEach(link => batch.delete(link.ref));
    pushTokens.docs.forEach(token => batch.delete(token.ref));
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

function pushTokenId(token) {
    return createHash('sha256').update(token).digest('hex');
}

async function requireActiveSchoolMember(schoolId, uid) {
    const [schoolSnapshot, memberSnapshot] = await Promise.all([
        db.doc(`schools/${schoolId}`).get(),
        db.doc(`schools/${schoolId}/members/${uid}`).get()
    ]);
    if (!schoolSnapshot.exists || schoolSnapshot.data()?.status !== 'active'
        || !memberSnapshot.exists || memberSnapshot.data()?.status !== 'active') {
        throw new HttpsError('permission-denied', 'An active school account is required.');
    }
}

function validatePushToken(value) {
    const token = typeof value === 'string' ? value.trim() : '';
    if (token.length < 30 || token.length > 4096 || /[\u0000-\u001f\u007f]/.test(token)) {
        throw new HttpsError('invalid-argument', 'A valid browser notification token is required.');
    }
    return token;
}

exports.savePushToken = onCall(async request => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in to enable notifications.');
    const schoolId = validateSchoolId(request.data?.schoolId);
    const token = validatePushToken(request.data?.token);
    const uid = request.auth.uid;
    await requireActiveSchoolMember(schoolId, uid);
    const tokenRef = db.doc(`schools/${schoolId}/members/${uid}/pushTokens/${pushTokenId(token)}`);
    const existingTokens = await db.collection(`schools/${schoolId}/members/${uid}/pushTokens`).get();
    if (!existingTokens.docs.some(snapshot => snapshot.id === tokenRef.id) && existingTokens.size >= 10) {
        throw new HttpsError('resource-exhausted', 'This account has reached the limit of 10 registered devices.');
    }
    await tokenRef.set({
        schoolId,
        uid,
        token,
        enabled: true,
        updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    return { success: true };
});

exports.removePushToken = onCall(async request => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in to manage notifications.');
    const schoolId = validateSchoolId(request.data?.schoolId);
    const token = validatePushToken(request.data?.token);
    const uid = request.auth.uid;
    await requireActiveSchoolMember(schoolId, uid);
    await db.doc(`schools/${schoolId}/members/${uid}/pushTokens/${pushTokenId(token)}`).delete();
    return { success: true };
});

const allSchoolRoles = [
    'schoolAdmin', 'superAdmin', 'director', 'headTeacher', 'deputyHeadTeacher',
    'teacher', 'bursar', 'librarian', 'hrOfficer', 'storeManager', 'parent', 'student'
];

async function activeMembersForRoles(schoolId, roles) {
    const uniqueRoles = [...new Set(roles)];
    if (!uniqueRoles.length) return [];
    const snapshots = await Promise.all(
        Array.from({ length: Math.ceil(uniqueRoles.length / 30) }, (_, index) =>
            db.collection(`schools/${schoolId}/members`)
                .where('role', 'in', uniqueRoles.slice(index * 30, index * 30 + 30))
                .get()
        )
    );
    return snapshots.flatMap(snapshot => snapshot.docs)
        .filter(member => member.data().status === 'active')
        .map(member => ({ uid: member.id, ...member.data() }));
}

async function membersLinkedToStudents(schoolId, studentIds) {
    const ids = [...new Set(studentIds.filter(Boolean).map(String))];
    if (!ids.length) return [];
    const linkedStudentSet = new Set(ids);
    const [studentMemberSnapshots, linkedParents] = await Promise.all([
        Promise.all(Array.from({ length: Math.ceil(ids.length / 30) }, (_, index) =>
            db.collection(`schools/${schoolId}/members`)
                .where('linkedRecordId', 'in', ids.slice(index * 30, index * 30 + 30))
                .get()
        )),
        Promise.all(Array.from({ length: Math.ceil(ids.length / 30) }, (_, index) =>
            db.collectionGroup('linkedStudents')
                .where('studentId', 'in', ids.slice(index * 30, index * 30 + 30))
                .get()
        ))
    ]);
    const recipients = studentMemberSnapshots.flatMap(snapshot => snapshot.docs)
        .filter(member => member.data().status === 'active'
            && member.data().role === 'student'
            && member.data().linkedRecordType === 'student'
            && linkedStudentSet.has(String(member.data().linkedRecordId)))
        .map(member => member.uid);
    const parentUids = new Set();
    linkedParents.flatMap(snapshot => snapshot.docs).forEach(link => {
        const path = link.ref.path.split('/');
        if (path.length === 6 && path[0] === 'schools' && path[1] === schoolId
            && path[2] === 'members' && path[4] === 'linkedStudents'
            && linkedStudentSet.has(String(link.data().studentId || link.id))) {
            parentUids.add(path[3]);
        }
    });
    const parentSnapshots = await Promise.all(Array.from(
        { length: Math.ceil(parentUids.size / 30) },
        (_, index) => db.collection(`schools/${schoolId}/members`)
            .where(FieldPath.documentId(), 'in', [...parentUids].slice(index * 30, index * 30 + 30))
            .get()
    ));
    parentSnapshots.flatMap(snapshot => snapshot.docs)
        .filter(member => member.data().status === 'active' && member.data().role === 'parent')
        .forEach(member => recipients.push(member.id));
    return [...new Set(recipients)];
}

async function studentIdsInClasses(schoolId, classIds, section) {
    const records = await Promise.all([...new Set(classIds.filter(Boolean).map(String))].map(classId =>
        db.collection(`schools/${schoolId}/students`).where('data.classId', '==', classId).get()
    ));
    return records.flatMap(snapshot => snapshot.docs
        .filter(record => !section || !record.data().data?.section || String(record.data().data.section) === section)
        .map(record => record.id));
}

async function resolveClassNames(schoolId, classNames) {
    const names = [...new Set(classNames.filter(Boolean).map(value => String(value).trim()).filter(Boolean))];
    if (!names.length) return [];
    const snapshots = await Promise.all(names.flatMap(name => [
        db.collection(`schools/${schoolId}/classes`).where('data.name', '==', name).get(),
        db.collection(`schools/${schoolId}/classes`).where('data.className', '==', name).get()
    ]));
    return [...new Set(snapshots.flatMap(snapshot => snapshot.docs.map(record => record.id)))];
}

async function studentIdsInClassNames(schoolId, classNames, section) {
    const names = [...new Set(classNames.filter(Boolean).map(value => String(value).trim()).filter(Boolean))];
    const snapshots = await Promise.all(names.flatMap(name => [
        db.collection(`schools/${schoolId}/students`).where('data.className', '==', name).get(),
        db.collection(`schools/${schoolId}/students`).where('data.class', '==', name).get()
    ]));
    return snapshots.flatMap(snapshot => snapshot.docs
        .filter(record => !section || !record.data().data?.section || String(record.data().data.section) === section)
        .map(record => record.id));
}

async function resolvePushRecipients(schoolId, {
    roles = [],
    classIds = [],
    classNames = [],
    section = '',
    studentIds = []
} = {}) {
    const resolvedClassIds = [...new Set([
        ...classIds,
        ...(classNames.length ? await resolveClassNames(schoolId, classNames) : [])
    ])];
    const classMembers = resolvedClassIds.length
        ? (await Promise.all(resolvedClassIds.map(classId =>
            db.collection(`schools/${schoolId}/members`)
                .where('assignedClassIds', 'array-contains', classId)
                .get()
        ))).flatMap(snapshot => snapshot.docs)
            .filter(member => member.data().status === 'active'
                && ['teacher', 'deputyHeadTeacher'].includes(member.data().role))
            .map(member => ({ uid: member.id, ...member.data() }))
        : [];
    const students = [...new Set([
        ...studentIds,
        ...(resolvedClassIds.length ? await studentIdsInClasses(schoolId, resolvedClassIds, section) : []),
        ...(classNames.length ? await studentIdsInClassNames(schoolId, classNames, section) : [])
    ])];
    const [roleMembers, linkedMemberIds] = await Promise.all([
        activeMembersForRoles(schoolId, roles),
        students.length ? membersLinkedToStudents(schoolId, students) : Promise.resolve([])
    ]);
    const teachingMemberIds = classMembers
        .filter(member => (member.assignedClassIds || []).some(classId => resolvedClassIds.includes(classId)))
        .map(member => member.uid);
    return [...new Set([
        ...roleMembers.map(member => member.uid),
        ...linkedMemberIds,
        ...teachingMemberIds
    ])];
}

async function sendSchoolPush(schoolId, recipientUids, notification, route, excludedUid) {
    const uids = new Set(recipientUids.filter(uid => uid && uid !== excludedUid));
    if (!uids.size) return;
    const uidList = [...uids];
    const tokenSnapshots = await Promise.all(Array.from({ length: Math.ceil(uidList.length / 30) }, (_, index) =>
        db.collectionGroup('pushTokens')
            .where('schoolId', '==', schoolId)
            .where('uid', 'in', uidList.slice(index * 30, index * 30 + 30))
            .get()
    ));
    const targets = tokenSnapshots.flatMap(snapshot => snapshot.docs)
        .filter(snapshot => snapshot.data().enabled !== false)
        .map(snapshot => ({ ref: snapshot.ref, token: snapshot.data().token }))
        .filter(target => typeof target.token === 'string' && target.token.length >= 30);

    for (let index = 0; index < targets.length; index += 500) {
        const batch = targets.slice(index, index + 500);
        const result = await messaging.sendEachForMulticast({
            tokens: batch.map(target => target.token),
            data: {
                title: notification.title,
                body: notification.body,
                url: `/?schoolId=${encodeURIComponent(schoolId)}&openSection=${encodeURIComponent(route)}`
            },
            webpush: { headers: { TTL: '86400' } }
        });
        const invalidTokens = [];
        result.responses.forEach((response, responseIndex) => {
            if (response.success) return;
            const code = response.error?.code || 'unknown';
            if (code === 'messaging/invalid-registration-token'
                || code === 'messaging/registration-token-not-registered') {
                invalidTokens.push(batch[responseIndex].ref.delete());
            } else {
                console.error('Unable to deliver a school push notification.', {
                    schoolId,
                    code
                });
            }
        });
        await Promise.all(invalidTokens);
    }
}

function recordBusinessData(snapshot) {
    const wrapper = snapshot?.data() || {};
    return wrapper.data && typeof wrapper.data === 'object' ? wrapper.data : wrapper;
}

function isPublishedRecord(data) {
    const status = String(data.status || data.publicationStatus || data.resultStatus || '').trim().toLowerCase();
    return data.isPublished === true || ['published', 'released'].includes(status);
}

async function dispatchSchoolNotification(event, collectionName) {
    if (!event.data?.after.exists) return;
    const { schoolId } = event.params;
    const current = recordBusinessData(event.data.after);
    const previous = event.data.before.exists ? recordBusinessData(event.data.before) : {};
    if (current.deleted === true || current.archived === true) return;
    const classIds = [current.classId || current.classID].filter(Boolean).map(String);
    const studentIds = [current.studentId || current.studentRecordId].filter(Boolean).map(String);
    let recipients;
    let notification;
    let route;

    if (collectionName === 'notices') {
        if (!isPublishedRecord(current) || isPublishedRecord(previous)
            || !['yes', 'true', '1'].includes(String(current.sendPush || '').trim().toLowerCase())) return;
        const rawAudience = current.audience || current.targetAudience || 'all';
        const audience = (Array.isArray(rawAudience) ? rawAudience : String(rawAudience).split(/[,&/]+/))
            .map(value => String(value).trim().toLowerCase());
        const audienceText = audience.join(' ');
        const roles = audienceText.includes('all') || !audienceText
            ? allSchoolRoles
            : [
                ...(audienceText.includes('parent') ? ['parent'] : []),
                ...(audienceText.includes('student') ? ['student'] : []),
                ...(audienceText.includes('staff') || audienceText.includes('teacher')
                    ? allSchoolRoles.filter(role => !['parent', 'student'].includes(role))
                    : [])
            ];
        recipients = await resolvePushRecipients(schoolId, { roles });
        notification = { title: 'New school notice', body: 'A new school notice is available.' };
        route = 'Notice Board';
    } else if (collectionName === 'attendance') {
        const status = String(current.status || current.attendanceStatus || '').trim().toLowerCase();
        const previousStatus = String(previous.status || previous.attendanceStatus || '').trim().toLowerCase();
        if (!studentIds.length || !['absent', 'late', 'tardy'].includes(status) || status === previousStatus) return;
        recipients = await resolvePushRecipients(schoolId, { studentIds });
        notification = { title: 'Attendance update', body: 'An attendance update is ready to review.' };
        route = 'Attendance';
    } else if (collectionName === 'assessments' || collectionName === 'reportCards') {
        const classNames = [current.className || current.class || current.studentClass].filter(Boolean).map(String);
        if (!isPublishedRecord(current) || isPublishedRecord(previous)
            || (!classIds.length && !classNames.length && !studentIds.length)) return;
        recipients = await resolvePushRecipients(schoolId, {
            classIds,
            classNames,
            section: String(current.section || '').trim(),
            studentIds
        });
        notification = collectionName === 'assessments'
            ? { title: 'New assignment or assessment', body: 'A new school assignment or assessment is available.' }
            : { title: 'Results published', body: 'New school results are available.' };
        route = collectionName === 'assessments' ? 'Assignments' : 'Report Cards';
    } else {
        return;
    }

    await sendSchoolPush(schoolId, recipients, notification, route, event.data.after.data()?.updatedBy);
}

exports.notifyPublishedSchoolNotices = onDocumentWritten(
    'schools/{schoolId}/notices/{recordId}',
    event => dispatchSchoolNotification(event, 'notices')
);

exports.notifyAttendanceUpdates = onDocumentWritten(
    'schools/{schoolId}/attendance/{recordId}',
    event => dispatchSchoolNotification(event, 'attendance')
);

exports.notifyPublishedAssessments = onDocumentWritten(
    'schools/{schoolId}/assessments/{recordId}',
    event => dispatchSchoolNotification(event, 'assessments')
);

exports.notifyPublishedResults = onDocumentWritten(
    'schools/{schoolId}/reportCards/{recordId}',
    event => dispatchSchoolNotification(event, 'reportCards')
);

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
