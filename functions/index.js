const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { FieldPath, FieldValue, getFirestore } = require('firebase-admin/firestore');
const { HttpsError, onCall } = require('firebase-functions/v2/https');

initializeApp();

const db = getFirestore();
const auth = getAuth();
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
    deputyHeadTeacher: ['students', 'parents', 'staff', 'classes', 'subjects', 'attendance', 'assessments', 'reportCards', 'timetables', 'notices', 'studyMaterials', 'quizzes', 'libraryBooks', 'libraryLoans', 'disciplineCases', 'clubs', 'healthRecords', 'transportRoutes'],
    bursar: ['students', 'parents', 'fees', 'feeInvoices', 'expenses', 'notices'],
    teacher: ['students', 'classes', 'subjects', 'attendance', 'assessments', 'reportCards', 'timetables', 'notices', 'studyMaterials', 'quizzes', 'libraryBooks', 'libraryLoans', 'disciplineCases', 'clubs'],
    librarian: ['students', 'classes', 'libraryBooks', 'libraryLoans', 'notices'],
    hrOfficer: ['staff', 'staffAttendance', 'leaveRequests', 'payroll', 'notices'],
    storeManager: ['inventory', 'assets', 'suppliers', 'purchaseOrders', 'purchaseRequests', 'notices'],
    parent: ['students', 'attendance', 'assessments', 'reportCards', 'timetables', 'notices', 'studyMaterials', 'quizzes', 'fees', 'libraryLoans', 'transportRoutes'],
    student: ['students', 'attendance', 'assessments', 'reportCards', 'timetables', 'notices', 'studyMaterials', 'quizzes', 'libraryLoans']
};
const normalizeRole = role => roleAliases[String(role || '').trim().toLowerCase().replace(/[\s_-]+/g, '')] || '';
const assignableRoles = new Set(Object.keys(rolePermissions));
const buildPermissions = role => Object.fromEntries((rolePermissions[role] || []).map(collection => [
    collection,
    { view: true, edit: ['teacher', 'deputyHeadTeacher'].includes(role) && ['attendance', 'assessments', 'studyMaterials', 'quizzes'].includes(collection) }
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
    if (isPlatformAdmin(request)) return { platformAdmin: true };
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
    const password = String(data.password || '');
    if (!email || !fullName || !userId || password.length < 8) {
        throw new HttpsError('invalid-argument', 'Name, User ID, email, and a password of at least 8 characters are required.');
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
        password,
        linkedRecordId,
        linkedRecordType,
        phone: String(data.phone || '').trim(),
        sections: Array.isArray(data.sections) ? data.sections.filter(section => typeof section === 'string').slice(0, 32) : [],
        notificationPreferences: {
            WhatsApp: data.notificationPreferences?.WhatsApp === true,
            SMS: data.notificationPreferences?.SMS === true,
            Email: data.notificationPreferences?.Email === true,
            Push: data.notificationPreferences?.Push === true
        },
        profile: { name: fullName }
    };
}

exports.createSchoolUser = onCall(async request => {
    const schoolId = validateSchoolId(request.data?.schoolId);
    const caller = await requireSchoolAdmin(request, schoolId);
    if (!(await db.doc(`schools/${schoolId}`).get()).exists) {
        throw new HttpsError('not-found', 'The school has not been provisioned.');
    }
    const account = sanitizeAccount(request.data, { allowSchoolAdmin: caller.platformAdmin === true });
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
            password: account.password,
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
            permissions: buildPermissions(account.role),
            perms: { view: true },
            notificationPreferences: account.notificationPreferences,
            profile: account.profile,
            photoURL: '',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };
        const batch = db.batch();
        batch.set(db.doc(`schools/${schoolId}/members/${createdUser.uid}`), member);
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
    return { uid: createdUser.uid, email: account.email, role: account.role };
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
    const fullName = String(request.data?.fullName || '').trim();
    const email = String(request.data?.email || '').trim().toLowerCase();
    const userId = String(request.data?.userId || '').trim().toLowerCase();
    if (!fullName || !email) throw new HttpsError('invalid-argument', 'Name and email are required.');
    if (!userId) throw new HttpsError('invalid-argument', 'A User ID is required.');
    const linkedRecordId = String(request.data?.linkedRecordId || '').trim();
    if (linkedRecordId !== (memberSnapshot.data().linkedRecordId || '')) {
        throw new HttpsError('failed-precondition', 'Linked student, parent, or staff records must be changed through an approved linking workflow.');
    }
    const duplicateUserId = await db.collection(`schools/${schoolId}/members`)
        .where('userId', '==', userId).limit(2).get();
    if (duplicateUserId.docs.some(snapshot => snapshot.id !== uid)) {
        throw new HttpsError('already-exists', 'That User ID is already used at this school.');
    }
    const password = String(request.data?.password || '');
    if (password && password.length < 8) throw new HttpsError('invalid-argument', 'Passwords must be at least 8 characters.');
    const profile = {
        fullName,
        userId,
        email,
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
    try {
        await auth.updateUser(uid, { email, displayName: fullName, ...(password ? { password } : {}) });
        await memberRef.update(profile);
        if (isPlatformAdmin(request)) {
            try {
                await writePlatformAudit(request, 'account.updated', schoolId, uid);
            } catch (auditError) {
                console.error('Platform account update audit entry failed.', auditError);
            }
        }
    } catch (error) {
        console.error('Unable to update school member account.', error);
        throw new HttpsError('internal', 'Unable to update the account.');
    }
    return { uid };
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
    await memberRef.update({ status: status ? 'active' : 'disabled', updatedAt: FieldValue.serverTimestamp() });
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
