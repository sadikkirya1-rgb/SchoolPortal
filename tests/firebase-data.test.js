const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');

class TestStorage {
    constructor() {
        this.values = new Map();
    }

    getItem(key) {
        return this.values.get(String(key)) ?? null;
    }

    setItem(key, value) {
        this.values.set(String(key), String(value));
    }

    removeItem(key) {
        this.values.delete(String(key));
    }
}

async function createDataHarness() {
    const sourcePath = path.join(__dirname, '..', 'firebase-data.js');
    const source = (await readFile(sourcePath, 'utf8'))
        .replace(/^import \{[\s\S]*?\} from 'https:\/\/www\.gstatic\.com\/firebasejs\/[^']+';\s*/, '');
    const stores = new Map();
    let database;
    const indexedDB = {
        open() {
            const request = {};
            setImmediate(() => {
                if (!database) {
                    database = {
                        createObjectStore(name) {
                            stores.set(name, new Map());
                        },
                        transaction(name) {
                            const values = stores.get(name);
                            const transaction = {
                                objectStore() {
                                    return {
                                        get(key) {
                                            return { result: values.get(key) };
                                        },
                                        getAll() {
                                            return { result: Array.from(values.values()) };
                                        },
                                        put(value) {
                                            const key = name === 'records' ? value.key : value.mutationId;
                                            values.set(key, value);
                                            return { result: key };
                                        },
                                        delete(key) {
                                            values.delete(key);
                                            return { result: undefined };
                                        }
                                    };
                                }
                            };
                            setTimeout(() => transaction.oncomplete?.(), 0);
                            return transaction;
                        }
                    };
                    request.result = database;
                    request.onupgradeneeded?.();
                }
                request.result = database;
                request.onsuccess?.();
            });
            return request;
        }
    };
    const listeners = new Map();
    const window = {
        schoolPortalFirebase: { db: {} },
        addEventListener(name, callback) {
            const handlers = listeners.get(name) || [];
            handlers.push(callback);
            listeners.set(name, handlers);
        },
        dispatchEvent(event) {
            for (const callback of listeners.get(event.type) || []) callback(event);
            return true;
        }
    };
    const document = {
        addEventListener() {},
        querySelector() { return null; }
    };
    const context = {
        CustomEvent: class CustomEvent {
            constructor(type, options = {}) {
                this.type = type;
                this.detail = options.detail;
            }
        },
        Storage: TestStorage,
        crypto: require('node:crypto').webcrypto,
        document,
        indexedDB,
        localStorage: new TestStorage(),
        navigator: { onLine: false },
        sessionStorage: new TestStorage(),
        setImmediate,
        setTimeout,
        window
    };
    vm.runInNewContext(`${source}\nglobalThis.__dataTestHooks = { setIdentity: value => { identity = value; }, makeKey, readLocal, listOutbox, writeLocal };`, context);
    context.__dataTestHooks.setIdentity({
        schoolId: 'SCH-TEST',
        uid: 'user-1',
        role: 'schoolAdmin',
        permissions: {},
        assignedClassIds: []
    });
    return { data: window.schoolPortalData, hooks: context.__dataTestHooks };
}

test('offline saves queue a local pending record for automatic sync', async () => {
    const { data, hooks } = await createDataHarness();

    await data.saveRecord('students', 'STUDENT-1', { fullName: 'Amina' });

    const queued = await hooks.listOutbox();
    const local = await hooks.readLocal(hooks.makeKey('SCH-TEST', 'user-1', 'students', 'STUDENT-1'));
    assert.equal(queued.length, 1);
    assert.equal(queued[0].baseVersion, 0);
    assert.deepEqual(JSON.parse(JSON.stringify(queued[0].data)), { fullName: 'Amina' });
    assert.equal(local.syncState, 'pending');
    assert.deepEqual(JSON.parse(JSON.stringify(local.data)), { fullName: 'Amina' });
});

test('repeated offline saves coalesce into the same queued mutation', async () => {
    const { data, hooks } = await createDataHarness();

    await data.saveRecord('students', 'STUDENT-1', { fullName: 'Amina' });
    const firstMutation = (await hooks.listOutbox())[0];
    await data.saveRecord('students', 'STUDENT-1', { fullName: 'Amina N.' });

    const queued = await hooks.listOutbox();
    assert.equal(queued.length, 1);
    assert.equal(queued[0].mutationId, firstMutation.mutationId);
    assert.deepEqual(JSON.parse(JSON.stringify(queued[0].data)), { fullName: 'Amina N.' });
});
