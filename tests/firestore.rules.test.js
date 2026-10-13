const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment
} = require('@firebase/rules-unit-testing');
const { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } = require('firebase/firestore');

let testEnvironment;

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

test('teachers can read assigned-class students but not other classes', async () => {
    const firestore = testEnvironment.authenticatedContext('teacher-1').firestore();
    await assertSucceeds(getDoc(doc(firestore, 'schools/SCH-TEST/students/STUDENT-A')));
    await assertFails(getDoc(doc(firestore, 'schools/SCH-TEST/students/STUDENT-B')));
});

test('school admins can read server-generated audit events', async () => {
    const firestore = testEnvironment.authenticatedContext('admin-1').firestore();
    await assertSucceeds(getDoc(doc(firestore, 'schools/SCH-TEST/auditEvents/EVENT-1')));
});

test('school admins can sync representative academic, admissions, payroll, and front-office collections', async () => {
    const firestore = testEnvironment.authenticatedContext('admin-1').firestore();
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
    const firestore = testEnvironment.authenticatedContext('admin-1').firestore();
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
    const firestore = testEnvironment.authenticatedContext('admin-1').firestore();
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
