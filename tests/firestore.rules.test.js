const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment
} = require('@firebase/rules-unit-testing');
const { collection, deleteDoc, doc, documentId, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, updateDoc, where } = require('firebase/firestore');

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
        await setDoc(doc(firestore, 'schools/SCH-TEST/members/teacher-results-1'), {
            role: 'teacher',
            status: 'active',
            assignedClassIds: ['CLASS-A'],
            permissions: {
                reportCards: { view: true, edit: true },
                examResults: { view: true, edit: true }
            }
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
                examResults: { view: true },
                fees: { view: true },
                notices: { view: true }
            }
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/members/bursar-1'), {
            role: 'bursar',
            status: 'active',
            permissions: { fees: { view: true, edit: true } }
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
        await setDoc(doc(firestore, 'schools/SCH-TEST/members/parent-2'), {
            role: 'parent',
            status: 'active',
            permissions: { notices: { view: true } }
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/members/parent-2/linkedStudents/STUDENT-B'), {
            studentId: 'STUDENT-B'
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/members/parent-1/notifications/NOTICE-1'), {
            title: 'Attendance update',
            body: 'An attendance update is ready to review.',
            route: 'Attendance',
            read: false,
            createdAt: new Date('2026-10-17T00:00:00.000Z')
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
        await setDoc(doc(firestore, 'schools/SCH-TEST/fees/FEE-EDIT'), {
            data: { studentId: 'STUDENT-A', balance: 100 },
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
        await setDoc(doc(firestore, 'schools/SCH-TEST/examResults/RESULT-PUBLISHED'), {
            data: { studentId: 'STUDENT-A', classId: 'CLASS-A', subjectName: 'Mathematics', status: 'Published' },
            version: 1,
            updatedBy: 'teacher-results-1',
            updatedAt: '2026-01-01T00:00:00.000Z'
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/examResults/RESULT-DRAFT'), {
            data: { studentId: 'STUDENT-A', classId: 'CLASS-A', subjectName: 'Science', status: 'Draft' },
            version: 1,
            updatedBy: 'teacher-results-1',
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

test('teachers can save results only for their assigned classes', async () => {
    const firestore = testEnvironment.authenticatedContext('teacher-results-1').firestore();
    const examResult = {
        data: {
            studentId: 'STUDENT-A',
            classId: 'CLASS-A',
            subjectName: 'Mathematics',
            assessmentName: 'Term 1 test',
            maxMarks: 100,
            obtainedMarks: 85,
            status: 'Draft',
            isPublished: false
        },
        version: 1,
        updatedBy: 'teacher-results-1',
        updatedAt: '2026-10-17T00:00:00.000Z'
    };
    await assertSucceeds(setDoc(doc(firestore, 'schools/SCH-TEST/examResults/RESULT-TEACHER-A'), examResult));
    await assertFails(setDoc(doc(firestore, 'schools/SCH-TEST/examResults/RESULT-TEACHER-B'), {
        ...examResult,
        data: { ...examResult.data, studentId: 'STUDENT-B', classId: 'CLASS-B' }
    }));
    await assertSucceeds(getDoc(doc(firestore, 'schools/SCH-TEST/examResults/RESULT-DRAFT')));

    const reportCard = {
        data: {
            studentId: 'STUDENT-A',
            classId: 'CLASS-A',
            status: 'Published',
            subjectResults: [{
                subjectName: 'Mathematics',
                assessmentName: 'Term 1 test',
                assessmentType: 'test',
                maxMarks: 100,
                obtainedMarks: 85,
                percentage: 85,
                isPublished: true
            }]
        },
        version: 1,
        updatedBy: 'teacher-results-1',
        updatedAt: '2026-10-17T00:00:00.000Z'
    };
    await assertSucceeds(setDoc(doc(firestore, 'schools/SCH-TEST/reportCards/RESULT-A'), reportCard));
    await assertFails(setDoc(doc(firestore, 'schools/SCH-TEST/reportCards/RESULT-B'), {
        ...reportCard,
        data: { ...reportCard.data, studentId: 'STUDENT-B', classId: 'CLASS-B' }
    }));
});

test('legacy teachers without exam-results permissions can access assigned-class marks', async () => {
    const firestore = testEnvironment.authenticatedContext('teacher-1').firestore();
    const assignedClassResults = query(
        collection(firestore, 'schools/SCH-TEST/examResults'),
        where('data.classId', '==', 'CLASS-A')
    );
    await assertSucceeds(getDocs(assignedClassResults));
    await assertSucceeds(setDoc(doc(firestore, 'schools/SCH-TEST/examResults/RESULT-LEGACY-TEACHER'), {
        data: {
            studentId: 'STUDENT-A',
            classId: 'CLASS-A',
            subjectName: 'Mathematics',
            assessmentName: 'Term 1 test',
            status: 'Draft'
        },
        version: 1,
        updatedBy: 'teacher-1',
        updatedAt: '2026-10-17T00:00:00.000Z'
    }));
    await assertFails(getDocs(query(
        collection(firestore, 'schools/SCH-TEST/examResults'),
        where('data.classId', '==', 'CLASS-B')
    )));
});

test('parents can read linked published exam results but not drafts', async () => {
    const firestore = testEnvironment.authenticatedContext('parent-1').firestore();
    await assertSucceeds(getDoc(doc(firestore, 'schools/SCH-TEST/examResults/RESULT-PUBLISHED')));
    await assertFails(getDoc(doc(firestore, 'schools/SCH-TEST/examResults/RESULT-DRAFT')));
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

test('specific-parent notices are readable only by their target parent', async () => {
    await testEnvironment.withSecurityRulesDisabled(async context => {
        const firestore = context.firestore();
        await setDoc(doc(firestore, 'schools/SCH-TEST/notices/NOTICE-PARENT-A'), {
            data: {
                title: 'Student A notice',
                audience: 'Parents',
                targetParentUid: 'parent-1',
                targetStudentId: 'STUDENT-A'
            },
            version: 1,
            updatedBy: 'admin-1',
            updatedAt: '2026-10-18T00:00:00.000Z'
        });
        await setDoc(doc(firestore, 'schools/SCH-TEST/notices/NOTICE-GENERAL'), {
            data: { title: 'General parent notice', audience: 'General' },
            version: 1,
            updatedBy: 'admin-1',
            updatedAt: '2026-10-18T00:00:00.000Z'
        });
    });
    const parentOne = testEnvironment.authenticatedContext('parent-1').firestore();
    const parentTwo = testEnvironment.authenticatedContext('parent-2').firestore();
    const administrator = administratorContext().firestore();
    await assertSucceeds(getDoc(doc(parentOne, 'schools/SCH-TEST/notices/NOTICE-PARENT-A')));
    await assertFails(getDoc(doc(parentTwo, 'schools/SCH-TEST/notices/NOTICE-PARENT-A')));
    await assertSucceeds(getDoc(doc(parentTwo, 'schools/SCH-TEST/notices/NOTICE-GENERAL')));
    await assertSucceeds(getDoc(doc(administrator, 'schools/SCH-TEST/notices/NOTICE-PARENT-A')));
});

test('bursars can update and remove fee records', async () => {
    const firestore = testEnvironment.authenticatedContext('bursar-1').firestore();
    const feeRef = doc(firestore, 'schools/SCH-TEST/fees/FEE-EDIT');
    await assertSucceeds(getDoc(doc(firestore, 'schools/SCH-TEST/fees/FEE-B')));
    await assertSucceeds(getDocs(collection(firestore, 'schools/SCH-TEST/fees')));
    await assertSucceeds(updateDoc(feeRef, {
        data: { studentId: 'STUDENT-A', balance: 75 },
        version: 2,
        updatedBy: 'bursar-1',
        updatedAt: new Date('2026-01-03T00:00:00.000Z')
    }));
    await assertSucceeds(updateDoc(feeRef, {
        data: { deleted: true },
        version: 3,
        updatedBy: 'bursar-1',
        updatedAt: new Date('2026-01-04T00:00:00.000Z')
    }));
});

test('members can only read their own notifications and mark them as read', async () => {
    const parentDb = testEnvironment.authenticatedContext('parent-1').firestore();
    const notificationRef = doc(parentDb, 'schools/SCH-TEST/members/parent-1/notifications/NOTICE-1');
    await assertSucceeds(getDoc(notificationRef));
    await assertSucceeds(getDocs(query(
        collection(parentDb, 'schools/SCH-TEST/members/parent-1/notifications'),
        orderBy('createdAt', 'desc'),
        limit(100)
    )));
    await assertSucceeds(updateDoc(notificationRef, { read: true, readAt: serverTimestamp() }));
    await assertFails(updateDoc(notificationRef, {
        title: 'Changed title',
        read: true,
        readAt: serverTimestamp()
    }));
    await assertFails(setDoc(doc(parentDb, 'schools/SCH-TEST/members/parent-1/notifications/NOTICE-2'), {
        title: 'Forged notification',
        read: false
    }));
    await assertFails(deleteDoc(notificationRef));

    const teacherDb = testEnvironment.authenticatedContext('teacher-1').firestore();
    await assertFails(getDoc(doc(teacherDb, 'schools/SCH-TEST/members/parent-1/notifications/NOTICE-1')));
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

test('staff with certificate edit permission can create and update certificates', async () => {
    await testEnvironment.withSecurityRulesDisabled(async context => {
        await setDoc(doc(context.firestore(), 'schools/SCH-TEST/members/certificate-editor'), {
            role: 'teacher',
            status: 'active',
            permissions: { certificates: { view: true, edit: true } }
        });
    });
    const firestore = testEnvironment.authenticatedContext('certificate-editor').firestore();
    const certificateRef = doc(firestore, 'schools/SCH-TEST/certificates/CERT-1');
    await assertSucceeds(setDoc(certificateRef, {
        data: { recipientName: 'A. Student', status: 'Draft' },
        version: 1,
        updatedBy: 'certificate-editor',
        updatedAt: '2026-01-01T00:00:00.000Z'
    }));
    await assertSucceeds(updateDoc(certificateRef, {
        data: { recipientName: 'A. Student', status: 'Published' },
        version: 2,
        updatedBy: 'certificate-editor',
        updatedAt: '2026-01-02T00:00:00.000Z'
    }));
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
