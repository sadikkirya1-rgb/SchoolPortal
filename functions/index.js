const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
const { HttpsError, onCall } = require('firebase-functions/v2/https');

initializeApp();

const db = getFirestore();
const auth = getAuth();
const privilegedRoles = new Set(['schoolAdmin', 'superAdmin', 'director', 'headTeacher']);
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

async function requireSchoolAdmin(request, schoolId) {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in to manage school accounts.');
    const callerRef = db.doc(`schools/${schoolId}/members/${request.auth.uid}`);
    const callerSnapshot = await callerRef.get();
    const caller = callerSnapshot.data();
    if (!callerSnapshot.exists || caller.status !== 'active' || !privilegedRoles.has(caller.role)) {
        throw new HttpsError('permission-denied', 'Only an active school administrator can manage accounts.');
    }
    return caller;
}

function sanitizeAccount(data) {
    const role = normalizeRole(data.role);
    if (!assignableRoles.has(role)) throw new HttpsError('invalid-argument', 'Choose a supported non-administrator role.');
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
    await requireSchoolAdmin(request, schoolId);
    if (!(await db.doc(`schools/${schoolId}`).get()).exists) {
        throw new HttpsError('not-found', 'The school has not been provisioned.');
    }
    const account = sanitizeAccount(request.data);
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
    if (privilegedRoles.has(memberSnapshot.data().role)) {
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
    if (!memberSnapshot.exists || privilegedRoles.has(memberSnapshot.data().role)) {
        throw new HttpsError('permission-denied', 'This account cannot be changed from this form.');
    }
    await auth.updateUser(uid, { disabled: !status });
    await memberRef.update({ status: status ? 'active' : 'disabled', updatedAt: FieldValue.serverTimestamp() });
    return { uid, status };
});

exports.deleteSchoolUser = onCall(async request => {
    const schoolId = validateSchoolId(request.data?.schoolId);
    await requireSchoolAdmin(request, schoolId);
    const uid = String(request.data?.uid || '');
    if (!uid || uid === request.auth.uid) throw new HttpsError('failed-precondition', 'Choose another account to delete.');
    const memberRef = db.doc(`schools/${schoolId}/members/${uid}`);
    const memberSnapshot = await memberRef.get();
    if (!memberSnapshot.exists || privilegedRoles.has(memberSnapshot.data().role)) {
        throw new HttpsError('permission-denied', 'This account cannot be deleted from this form.');
    }
    try {
        await auth.deleteUser(uid);
    } catch (error) {
        if (error.code !== 'auth/user-not-found') throw error;
    }
    const linkedStudents = await memberRef.collection('linkedStudents').get();
    const batch = db.batch();
    linkedStudents.docs.forEach(link => batch.delete(link.ref));
    batch.delete(memberRef);
    await batch.commit();
    return { uid };
});
