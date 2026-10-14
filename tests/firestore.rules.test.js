const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment
} = require('@firebase/rules-unit-testing');
const { collection, deleteDoc, doc, documentId, getDoc, getDocs, query, setDoc, updateDoc, where } = require('firebase/firestore');

let testEnvironment;

function administratorContext(uid = 'admin-1') {
    return testEnvironment.authenticatedContext(uid, { email: `${uid}@example.com` });
}

before(async () => {
    testEnvironment = await initializeTestEnvironment({
        projectId: 'demo-school-portal',
        firestore: {
            rules: await readFile(path.join(__dirname, '..', 'firestore.rules'), 'utf8')
        }
    });
    await testEnvironment.withSecurityRulesDisabled(async context => {
        const firestore = context.firestore();
        await setDoc(doc(firestore, 'schools/SCH-TEST'), { status: 'active' });
        await setDoc(doc(firestore, 'schools/SCH-TEST/members/admin-1'), {
            role: 'schoolAdmin',
            status: 'active',
            permissions: {}
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/members/teacher-1'), {
            role: 'teacher',
            status: 'active',
            assignedClassIds: ['CLASS-A'],
            permissions: { students: { view: true, edit: true } }
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/members/admin-password-only'), {
            role: 'schoolAdmin',
            status: 'active',
            permissions: {}
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/members/parent-1'), {
            role: 'parent',
            status: 'active',
            permissions: {
                students: { view: true },
                attendance: { view: true },
                assessments: { view: true },
                reportCards: { view: true },
                fees: { view: true },
                notices: { view: true }
            }
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/members/temporary-password-user'), {
            role: 'student',
            status: 'active',
            mustChangePassword: true,
            permissions: { students: { view: true } }
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/members/parent-1/linkedStudents/STUDENT-A'), {
            studentId: 'STUDENT-A'
        });
        await setDoc(doc(firestore, 'schools/OTHER-SCHOOL'), { status: 'active' });
        await setDoc(doc(firestore, 'schools/OTHER-SCHOOL/students/PRIVATE'), {
            data: { studentId: 'PRIVATE', classId: 'CLASS-A', fullName: 'Other School Student' },
            version: 1,
            updatedBy: 'other-admin',
            updatedAt: '2026-01-01T00:00:00.000Z'
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/members/teacher-reader-1'), {
            role: 'teacher',
            status: 'active',
            permissions: { notices: { view: true } }
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/members/teacher-deleter-1'), {
            role: 'teacher',
            status: 'active',
            assignedClassIds: ['CLASS-A'],
            permissions: { students: { view: true, edit: true, delete: true } }
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/notices/NOTICE-A'), {
            data: { title: 'School notice' },
            version: 1,
            updatedBy: 'admin-1',
            updatedAt: '2026-01-01T00:00:00.000Z'
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/attendance/ATTENDANCE-A'), {
            data: { studentId: 'STUDENT-A', date: '2026-01-02', status: 'Present' },
            version: 1,
            updatedBy: 'admin-1',
            updatedAt: '2026-01-02T00:00:00.000Z'
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/attendance/ATTENDANCE-B'), {
            data: { studentId: 'STUDENT-B', date: '2026-01-02', status: 'Absent' },
            version: 1,
            updatedBy: 'admin-1',
            updatedAt: '2026-01-02T00:00:00.000Z'
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/fees/FEE-A'), {
            data: { studentId: 'STUDENT-A', balance: 100 },
            version: 1,
            updatedBy: 'admin-1',
            updatedAt: '2026-01-02T00:00:00.000Z'
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/fees/FEE-B'), {
            data: { studentId: 'STUDENT-B', balance: 100 },
            version: 1,
            updatedBy: 'admin-1',
            updatedAt: '2026-01-02T00:00:00.000Z'
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/studyMaterials/MATERIAL-A'), {
            data: { studentId: 'STUDENT-A', title: 'Class material' },
            version: 1,
            updatedBy: 'admin-1',
            updatedAt: '2026-01-02T00:00:00.000Z'
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/students/STUDENT-A'), {
            data: { studentId: 'STUDENT-A', classId: 'CLASS-A', fullName: 'Test Student' },
            version: 1,
            updatedBy: 'teacher-1',
            updatedAt: '2026-01-01T00:00:00.000Z'
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/students/STUDENT-B'), {
            data: { studentId: 'STUDENT-B', classId: 'CLASS-B', fullName: 'Other Student' },
            version: 1,
            updatedBy: 'teacher-1',
            updatedAt: '2026-01-01T00:00:00.000Z'
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/students/STUDENT-C'), {
            data: { studentId: 'STUDENT-C', classId: 'CLASS-A', fullName: 'Delete Test Student' },
            version: 1,
            updatedBy: 'teacher-deleter-1',
            updatedAt: '2026-01-01T00:00:00.000Z'
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/auditEvents/EVENT-1'), {
            data: { actorUid: 'teacher-1', action: 'update', collection: 'students' },
            version: 1,
            updatedBy: 'teacher-1',
            updatedAt: '2026-01-01T00:00:00.000Z'
        });
    });
});

after(async () => {
    await testEnvironment?.cleanup();
});

test('a user without school membership cannot read school records', async () => {
    const firestore = testEnvironment.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(firestore, 'schools/SCH-TEST/students/STUDENT-A')));
});

test('school membership never grants access to records in another school', async () => {
    const firestore = testEnvironment.authenticatedContext('teacher-1').firestore();
    await assertFails(getDoc(doc(firestore, 'schools/OTHER-SCHOOL/students/PRIVATE')));
});

test('accounts with a temporary password can read their membership but not school data until changing it', async () => {
    const firestore = testEnvironment.authenticatedContext('temporary-password-user').firestore();
    await assertSucceeds(getDoc(doc(firestore, 'schools/SCH-TEST/members/temporary-password-user')));
    await assertFails(getDoc(doc(firestore, 'schools/SCH-TEST/students/STUDENT-A')));
});

test('teachers can read assigned-class students but not other classes', async () => {
    const firestore = testEnvironment.authenticatedContext('teacher-1').firestore();
    await assertSucceeds(getDoc(doc(firestore, 'schools/SCH-TEST/students/STUDENT-A')));
    await assertFails(getDoc(doc(firestore, 'schools/SCH-TEST/students/STUDENT-B')));
    const assignedClassQuery = query(
        collection(firestore, 'schools/SCH-TEST/students'),
        where('data.classId', 'in', ['CLASS-A'])
    );
    const unassignedClassQuery = query(
        collection(firestore, 'schools/SCH-TEST/students'),
        where('data.classId', 'in', ['CLASS-B'])
    );
    await assertSucceeds(getDocs(assignedClassQuery));
    await assertFails(getDocs(unassignedClassQuery));
    await assertFails(setDoc(doc(firestore, 'schools/SCH-TEST/students/STUDENT-NEW'), {
        data: { studentId: 'STUDENT-NEW', classId: 'CLASS-B', fullName: 'Unassigned Student' },
        version: 1,
        updatedBy: 'teacher-1',
        updatedAt: '2026-01-01T00:00:00.000Z'
    }));
});

test('parent data access is read-only and limited to recommended linked-child collections', async () => {
    const firestore = testEnvironment.authenticatedContext('parent-1').firestore();
    const linkedStudentQuery = query(
        collection(firestore, 'schools/SCH-TEST/students'),
        where(documentId(), 'in', ['STUDENT-A'])
    );
    const otherStudentQuery = query(
        collection(firestore, 'schools/SCH-TEST/students'),
        where('data.studentId', '==', 'STUDENT-B')
    );
    await assertSucceeds(getDoc(doc(firestore, 'schools/SCH-TEST/students/STUDENT-A')));
    await assertFails(getDoc(doc(firestore, 'schools/SCH-TEST/students/STUDENT-B')));
    await assertSucceeds(getDocs(linkedStudentQuery));
    await assertFails(getDocs(otherStudentQuery));
    await assertSucceeds(getDoc(doc(firestore, 'schools/SCH-TEST/attendance/ATTENDANCE-A')));
    await assertFails(getDoc(doc(firestore, 'schools/SCH-TEST/attendance/ATTENDANCE-B')));
    await assertSucceeds(getDoc(doc(firestore, 'schools/SCH-TEST/fees/FEE-A')));
    await assertFails(getDoc(doc(firestore, 'schools/SCH-TEST/fees/FEE-B')));
    await assertSucceeds(getDoc(doc(firestore, 'schools/SCH-TEST/notices/NOTICE-A')));
    await assertFails(getDoc(doc(firestore, 'schools/SCH-TEST/studyMaterials/MATERIAL-A')));
    await assertFails(updateDoc(doc(firestore, 'schools/SCH-TEST/attendance/ATTENDANCE-A'), {
        'data.status': 'Absent'
    }));
});

test('school administrator access works with ordinary email and password authentication', async () => {
    const firestore = administratorContext('admin-password-only').firestore();
    await assertSucceeds(getDoc(doc(firestore, 'schools/SCH-TEST/students/STUDENT-A')));
    await assertSucceeds(getDocs(collection(firestore, 'schools/SCH-TEST/members')));
});

test('assigned data permissions limit accounts to the selected access levels', async () => {
    const readerDb = testEnvironment.authenticatedContext('teacher-reader-1').firestore();
    const noticeRef = doc(readerDb, 'schools/SCH-TEST/notices/NOTICE-A');
    await assertSucceeds(getDoc(noticeRef));
    await assertFails(setDoc(doc(readerDb, 'schools/SCH-TEST/notices/NOTICE-B'), {
        data: { title: 'Unauthorized notice' },
        version: 1,
        updatedBy: 'teacher-reader-1',
        updatedAt: '2026-01-01T00:00:00.000Z'
    }));
    await assertFails(deleteDoc(noticeRef));

    const deleterDb = testEnvironment.authenticatedContext('teacher-deleter-1').firestore();
    await assertSucceeds(deleteDoc(doc(deleterDb, 'schools/SCH-TEST/students/STUDENT-C')));
});

test('school admins can read server-generated audit events', async () => {
    const firestore = administratorContext().firestore();
    await assertSucceeds(getDoc(doc(firestore, 'schools/SCH-TEST/auditEvents/EVENT-1')));
});

test('push notification tokens are inaccessible to school clients', async () => {
    await testEnvironment.withSecurityRulesDisabled(async context => {
        await setDoc(doc(context.firestore(), 'schools/SCH-TEST/members/parent-1/pushTokens/DEVICE-1'), {
            schoolId: 'SCH-TEST',
            uid: 'parent-1',
            token: 'sample-notification-token'
        });
    });
    const firestore = testEnvironment.authenticatedContext('parent-1').firestore();
    const tokenRef = doc(firestore, 'schools/SCH-TEST/members/parent-1/pushTokens/DEVICE-1');
    await assertFails(getDoc(tokenRef));
    await assertFails(setDoc(tokenRef, { token: 'changed-token' }));
});

test('school admins can sync representative academic, admissions, payroll, and front-office collections', async () => {
    const firestore = administratorContext().firestore();
    for (const collectionName of ['curriculum', 'applications', 'payrollReports', 'smsMessages']) {
        await assertSucceeds(setDoc(doc(firestore, `schools/SCH-TEST/${collectionName}/SYNC-1`), {
            data: { name: 'Test record' },
            version: 1,
            updatedBy: 'admin-1',
            updatedAt: '2026-01-01T00:00:00.000Z'
        }));
    }
});

test('school admins can read every collection used by legacy synchronization', async () => {
    const firestore = administratorContext().firestore();
    const collectionNames = [
        'teachers', 'counseling', 'boardingRecords', 'curriculum', 'calendarEvents',
        'alumni', 'sportsActivities', 'staffDirectory', 'visitorLogs', 'schoolDocuments',
        'followUps', 'dispatches', 'payrollReports', 'supplierInvoices',
        'maintenanceWorkOrders', 'purchaseComparisons', 'callLogs', 'goodsReceipts',
        'enquiries', 'incomingMail', 'recruitment', 'notifications', 'paySlips',
        'announcements', 'idCards', 'statutoryReturns', 'certificates', 'quotations'
    ];

    for (const collectionName of collectionNames) {
        await assertSucceeds(getDocs(collection(firestore, `schools/SCH-TEST/${collectionName}`)));
    }
});

test('clients cannot create, modify, or delete audit events', async () => {
    const firestore = administratorContext().firestore();
    const auditRef = doc(firestore, 'schools/SCH-TEST/auditEvents/EVENT-1');
    await assertFails(setDoc(doc(firestore, 'schools/SCH-TEST/auditEvents/FORGED'), {
        data: { actorUid: 'admin-1', action: 'delete' },
        version: 1,
        updatedBy: 'admin-1',
        updatedAt: '2026-01-01T00:00:00.000Z'
    }));
    await assertFails(updateDoc(auditRef, { data: { action: 'forged' } }));
    await assertFails(deleteDoc(auditRef));
});
