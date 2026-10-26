const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const { collection, doc, getDocs, query, setDoc, updateDoc, where } = require('firebase/firestore');

let testEnvironment;

before(async () => {
    testEnvironment = await initializeTestEnvironment({
        projectId: 'demo-school-portal',
        firestore: {
            rules: await readFile(path.join(__dirname, '..', 'firestore.rules'), 'utf8')
        }
    });
});

after(async () => {
    await testEnvironment?.cleanup();
});

async function findAuditEvents(recordId) {
    let snapshot;
    await testEnvironment.withSecurityRulesDisabled(async context => {
        snapshot = await getDocs(query(
            collection(context.firestore(), 'schools/SCH-AUDIT-TEST/auditEvents'),
            where('data.recordId', '==', recordId)
        ));
    });
    return snapshot;
}

test('Firestore create and update operations do not produce audit events', async () => {
    const recordId = `ATT-${process.pid}-${Date.now()}`;
    await testEnvironment.withSecurityRulesDisabled(async context => {
        await setDoc(doc(context.firestore(), `schools/SCH-AUDIT-TEST/attendance/${recordId}`), {
            data: { studentId: 'STUDENT-1', status: 'Present' },
            version: 1,
            updatedBy: 'teacher-1',
            updatedAt: '2026-01-01T00:00:00.000Z'
        });
    });

    await testEnvironment.withSecurityRulesDisabled(async context => {
        await updateDoc(doc(context.firestore(), `schools/SCH-AUDIT-TEST/attendance/${recordId}`), {
            data: { studentId: 'STUDENT-1', status: 'Absent' },
            version: 2,
            updatedBy: 'teacher-1',
            updatedAt: '2026-01-01T00:01:00.000Z'
        });
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
    const snapshot = await findAuditEvents(recordId);
    assert.equal(snapshot.size, 0);
});
