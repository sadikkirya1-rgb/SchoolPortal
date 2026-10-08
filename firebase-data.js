import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    runTransaction,
    serverTimestamp,
    where
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const db = window.schoolPortalFirebase?.db;
const allowedCollections = new Set([
    'students', 'parents', 'staff', 'classes', 'subjects', 'attendance',
    'assessments', 'reportCards', 'fees', 'feeInvoices', 'expenses',
    'timetables', 'notices', 'smsAlerts', 'libraryBooks', 'libraryLoans',
    'healthRecords', 'transportRoutes', 'disciplineCases', 'clubs',
    'studyMaterials', 'quizzes', 'inventory', 'assets', 'visitors',
    'appointments', 'staffAttendance', 'leaveRequests', 'payroll',
    'suppliers', 'purchaseOrders', 'purchaseRequests', 'auditEvents',
    'settings', 'schoolProfile'
]);
const databaseName = 'school-portal-local-first';
const databaseVersion = 1;
let identity = null;
let databasePromise;
let syncRunning = false;

function openDatabase() {
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, databaseVersion);
        request.onupgradeneeded = () => {
            const database = request.result;
            database.createObjectStore('records', { keyPath: 'key' });
            database.createObjectStore('outbox', { keyPath: 'mutationId' });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('Could not open local offline storage.'));
    });
    return databasePromise;
}

function runStoreTransaction(storeName, mode, operation) {
    return openDatabase().then(database => new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, mode);
        const result = operation(transaction.objectStore(storeName));
        transaction.oncomplete = () => resolve(result?.result);
        transaction.onerror = () => reject(transaction.error || new Error('Local offline storage failed.'));
        transaction.onabort = () => reject(transaction.error || new Error('Local offline storage transaction was aborted.'));
    }));
}

function assertIdentity() {
    if (!identity?.schoolId || !identity?.uid) throw new Error('Sign in to a school before reading or changing school data.');
    return identity;
}

function assertCollection(name) {
    if (!allowedCollections.has(name)) throw new Error(`The school data collection "${name}" is not enabled.`);
}

function makeKey(schoolId, uid, collectionName, recordId) {
    return JSON.stringify([schoolId, uid, collectionName, String(recordId)]);
}

function readLocal(key) {
    return runStoreTransaction('records', 'readonly', store => store.get(key));
}

function writeLocal(record) {
    return runStoreTransaction('records', 'readwrite', store => store.put(record));
}

function deleteOutbox(mutationId) {
    return runStoreTransaction('outbox', 'readwrite', store => store.delete(mutationId));
}

function listOutbox() {
    return runStoreTransaction('outbox', 'readonly', store => store.getAll());
}

function cloudRecordRef(owner, collectionName, recordId) {
    return doc(db, 'schools', owner.schoolId, collectionName, String(recordId));
}

function copyValue(value) {
    return JSON.parse(JSON.stringify(value));
}

async function processMutation(mutation) {
    const owner = assertIdentity();
    if (mutation.schoolId !== owner.schoolId || mutation.uid !== owner.uid) return;
    const recordRef = cloudRecordRef(owner, mutation.collection, mutation.recordId);
    const versionRef = doc(db, 'schools', owner.schoolId, mutation.collection, String(mutation.recordId), 'versions', mutation.mutationId);
    const conflictRef = doc(db, 'schools', owner.schoolId, 'members', owner.uid, 'syncConflicts', mutation.mutationId);

    const result = await runTransaction(db, async transaction => {
        const currentSnapshot = await transaction.get(recordRef);
        const current = currentSnapshot.exists() ? currentSnapshot.data() : null;
        if (current?.lastMutationId === mutation.mutationId) return { state: 'synced', current };

        const currentVersion = current?.version || 0;
        if (currentVersion !== mutation.baseVersion) {
            const existingConflict = await transaction.get(conflictRef);
            if (!existingConflict.exists()) {
                transaction.set(conflictRef, {
                    collection: mutation.collection,
                    recordId: mutation.recordId,
                    baseVersion: mutation.baseVersion,
                    serverVersion: currentVersion,
                    localData: mutation.data,
                    remoteData: current?.data ?? null,
                    createdBy: owner.uid,
                    createdAt: serverTimestamp(),
                    status: 'open'
                });
            }
            return { state: 'conflict', current };
        }

        const nextVersion = currentVersion + 1;
        const next = {
            data: mutation.data,
            version: nextVersion,
            updatedBy: owner.uid,
            updatedAt: new Date().toISOString(),
            lastMutationId: mutation.mutationId
        };
        transaction.set(recordRef, next);
        transaction.set(versionRef, {
            data: mutation.data,
            version: nextVersion,
            createdBy: owner.uid,
            createdAt: serverTimestamp()
        });
        return { state: 'synced', current: next };
    });

    const key = makeKey(owner.schoolId, owner.uid, mutation.collection, mutation.recordId);
    await writeLocal({
        key,
        schoolId: owner.schoolId,
        uid: owner.uid,
        collection: mutation.collection,
        recordId: String(mutation.recordId),
        data: result.current?.data ?? mutation.data,
        version: result.current?.version || mutation.baseVersion,
        syncState: result.state === 'conflict' ? 'conflict' : 'synced',
        updatedAt: Date.now()
    });
    await deleteOutbox(mutation.mutationId);
    window.dispatchEvent(new CustomEvent('school-portal-sync-update', {
        detail: { collection: mutation.collection, recordId: mutation.recordId, state: result.state }
    }));
}

async function syncOutbox() {
    if (!identity || !navigator.onLine || syncRunning) return;
    const owner = identity;
    syncRunning = true;
    let failed = false;
    try {
        while (navigator.onLine) {
            const mutations = (await listOutbox()).filter(mutation =>
                mutation.schoolId === owner.schoolId && mutation.uid === owner.uid
            );
            if (!mutations.length) break;
            mutations.sort((left, right) => left.createdAt - right.createdAt);
            for (const mutation of mutations) {
                try {
                    await processMutation(mutation);
                } catch (error) {
                    console.warn('A local change remains queued for synchronization.', error);
                    failed = true;
                    break;
                }
            }
            if (failed) break;
        }
    } finally {
        syncRunning = false;
        const activeIdentity = identity;
        const identityChanged = activeIdentity
            && (activeIdentity.schoolId !== owner.schoolId || activeIdentity.uid !== owner.uid);
        const activeHasPendingMutations = activeIdentity && (await listOutbox()).some(mutation =>
            mutation.schoolId === activeIdentity.schoolId && mutation.uid === activeIdentity.uid
        );
        if (navigator.onLine && (identityChanged || (!failed && activeHasPendingMutations))) {
            setTimeout(() => void syncOutbox(), 0);
        }
    }
}

async function listLocal(collectionName) {
    const owner = assertIdentity();
    assertCollection(collectionName);
    const all = await runStoreTransaction('records', 'readonly', store => store.getAll());
    return all
        .filter(record => record.schoolId === owner.schoolId && record.uid === owner.uid && record.collection === collectionName)
        .filter(record => record.data?.deleted !== true)
        .map(record => ({ id: record.recordId, ...record.data, _syncState: record.syncState }));
}

async function saveRecord(collectionName, recordId, data) {
    const owner = assertIdentity();
    assertCollection(collectionName);
    if (!recordId || !data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('A record ID and a record object are required.');
    }
    const key = makeKey(owner.schoolId, owner.uid, collectionName, recordId);
    const previous = await readLocal(key);
    const pendingMutations = (await listOutbox()).filter(mutation =>
        mutation.schoolId === owner.schoolId
        && mutation.uid === owner.uid
        && mutation.collection === collectionName
        && mutation.recordId === String(recordId)
    );
    const mutationId = crypto.randomUUID();
    const cleanData = copyValue(data);
    const record = {
        key,
        schoolId: owner.schoolId,
        uid: owner.uid,
        collection: collectionName,
        recordId: String(recordId),
        data: cleanData,
        version: (previous?.version || 0) + pendingMutations.length,
        syncState: 'pending',
        updatedAt: Date.now()
    };
    await openDatabase().then(database => new Promise((resolve, reject) => {
        const transaction = database.transaction(['records', 'outbox'], 'readwrite');
        transaction.objectStore('records').put(record);
        transaction.objectStore('outbox').put({
            mutationId,
            schoolId: owner.schoolId,
            uid: owner.uid,
            collection: collectionName,
            recordId: String(recordId),
            baseVersion: (previous?.version || 0) + pendingMutations.length,
            data: cleanData,
            createdAt: Date.now()
        });
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error || new Error('Unable to save the local change.'));
        transaction.onabort = () => reject(transaction.error || new Error('Local save transaction was aborted.'));
    }));
    window.dispatchEvent(new CustomEvent('school-portal-sync-update', {
        detail: { collection: collectionName, recordId, state: 'pending' }
    }));
    void syncOutbox();
}

async function deleteRecord(collectionName, recordId) {
    return saveRecord(collectionName, recordId, { deleted: true });
}

async function subscribe(collectionName, onRecords, filters = []) {
    const owner = assertIdentity();
    assertCollection(collectionName);
    const local = await listLocal(collectionName);
    onRecords(local, { source: 'local' });
    const constraints = filters.map(filter => where(filter.field, filter.operator || '==', filter.value));
    const collectionQuery = query(collection(db, 'schools', owner.schoolId, collectionName), ...constraints);
    return onSnapshot(collectionQuery, snapshot => {
        const records = snapshot.docs.map(item => ({
            key: makeKey(owner.schoolId, owner.uid, collectionName, item.id),
            schoolId: owner.schoolId,
            uid: owner.uid,
            collection: collectionName,
            recordId: item.id,
            data: item.data().data,
            version: item.data().version,
            syncState: 'synced',
            updatedAt: Date.now()
        }));
        void (async () => {
            const database = await openDatabase();
            const visibleRecords = await new Promise((resolve, reject) => {
                const transaction = database.transaction('records', 'readwrite');
                const store = transaction.objectStore('records');
                let mergedRecords = [];
                const request = store.getAll();
                request.onsuccess = () => {
                    const existingByKey = new Map(request.result.map(record => [record.key, record]));
                    mergedRecords = records.map(record => {
                        const existing = existingByKey.get(record.key);
                        if (existing?.syncState === 'pending' || existing?.syncState === 'conflict') return existing;
                        store.put(record);
                        return record;
                    });
                };
                request.onerror = () => reject(request.error || new Error('Unable to read the local record cache.'));
                transaction.oncomplete = () => resolve(mergedRecords);
                transaction.onerror = () => reject(transaction.error || new Error('Unable to update the local record cache.'));
                transaction.onabort = () => reject(transaction.error || new Error('The local record cache update was aborted.'));
            });
            onRecords(visibleRecords
                .filter(record => record.data?.deleted !== true)
                .map(record => ({ id: record.recordId, ...record.data, _syncState: record.syncState })), { source: 'cloud' });
        })().catch(error => {
            console.error(`Unable to cache the ${collectionName} collection.`, error);
            window.dispatchEvent(new CustomEvent('school-portal-sync-error', { detail: { collection: collectionName, error } }));
        });
    }, error => {
        console.error(`Unable to synchronize the ${collectionName} collection.`, error);
        window.dispatchEvent(new CustomEvent('school-portal-sync-error', { detail: { collection: collectionName, error } }));
    });
}

async function getConflicts() {
    const owner = assertIdentity();
    if (!navigator.onLine) return [];
    const conflicts = query(
        collection(db, 'schools', owner.schoolId, 'members', owner.uid, 'syncConflicts'),
        where('status', '==', 'open')
    );
    const snapshot = await getDocs(conflicts);
    return snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
}

async function resolveConflict(conflictId, choice) {
    const owner = assertIdentity();
    const conflictRef = doc(db, 'schools', owner.schoolId, 'members', owner.uid, 'syncConflicts', conflictId);
    const conflictSnapshot = await getDoc(conflictRef);
    if (!conflictSnapshot.exists() || conflictSnapshot.data().createdBy !== owner.uid) {
        throw new Error('This conflict is unavailable or belongs to another user.');
    }
    const conflict = conflictSnapshot.data();
    if (choice === 'local') {
        await saveRecord(conflict.collection, conflict.recordId, conflict.localData);
        await syncOutbox();
        const record = await readLocal(makeKey(owner.schoolId, owner.uid, conflict.collection, conflict.recordId));
        if (record?.syncState !== 'synced') throw new Error('The local version could not be applied. The conflict remains open.');
    } else if (choice !== 'remote') {
        throw new Error('Choose either the local or cloud version.');
    } else {
        const key = makeKey(owner.schoolId, owner.uid, conflict.collection, conflict.recordId);
        const currentSnapshot = await getDoc(cloudRecordRef(owner, conflict.collection, conflict.recordId));
        if (currentSnapshot.exists()) {
            await writeLocal({
                key,
                schoolId: owner.schoolId,
                uid: owner.uid,
                collection: conflict.collection,
                recordId: conflict.recordId,
                data: currentSnapshot.data().data,
                version: currentSnapshot.data().version,
                syncState: 'synced',
                updatedAt: Date.now()
            });
        }
    }
    await runTransaction(db, async transaction => {
        const current = await transaction.get(conflictRef);
        if (!current.exists() || current.data().status !== 'open') throw new Error('This conflict has already been resolved.');
        transaction.update(conflictRef, { status: 'resolved', resolvedBy: owner.uid, resolvedAt: serverTimestamp() });
    });
}

window.schoolPortalData = {
    setIdentity(schoolId, uid) {
        identity = { schoolId, uid };
        void syncOutbox();
        return identity;
    },
    clearIdentity() {
        identity = null;
    },
    listLocal,
    saveRecord,
    deleteRecord,
    subscribe,
    getConflicts,
    resolveConflict,
    sync: syncOutbox
};

window.addEventListener('online', () => void syncOutbox());
window.dispatchEvent(new CustomEvent('school-portal-data-ready'));
