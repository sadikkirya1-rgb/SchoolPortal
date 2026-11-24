const { test } = require('node:test');
const assert = require('node:assert/strict');
const functions = require('../functions');

const unauthenticatedRequest = { auth: null, data: {} };

for (const functionName of [
    'createSchool',
    'getLinkedSchoolRecords',
    'savePushToken',
    'removePushToken',
    'completeOwnPasswordChange'
]) {
    test(`${functionName} rejects unauthenticated callers`, async () => {
        await assert.rejects(
            functions[functionName].run(unauthenticatedRequest),
            error => error.code === 'unauthenticated'
        );
    });
}

test('createSchoolUser rejects unauthenticated callers before account provisioning', async () => {
    await assert.rejects(
        functions.createSchoolUser.run({
            auth: null,
            data: { schoolId: 'SCH-TEST', temporaryPassword: 'TemporaryPass123' }
        }),
        error => error.code === 'unauthenticated'
    );
});

test('scheduled Firestore exports fail closed when no backup bucket is configured', async () => {
    const previousBucket = process.env.FIRESTORE_BACKUP_BUCKET;
    delete process.env.FIRESTORE_BACKUP_BUCKET;
    try {
        await assert.rejects(
            functions.startScheduledFirestoreExport.run({ scheduleTime: '2026-11-24T02:00:00.000Z' }),
            /Set FIRESTORE_BACKUP_BUCKET/
        );
    } finally {
        if (previousBucket === undefined) delete process.env.FIRESTORE_BACKUP_BUCKET;
        else process.env.FIRESTORE_BACKUP_BUCKET = previousBucket;
    }
});
