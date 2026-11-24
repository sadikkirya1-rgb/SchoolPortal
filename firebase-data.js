import {
    collection,
    documentId,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    limit,
    where
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const db = window.schoolPortalFirebase?.db;
const allowedCollections = new Set([
    'students', 'parents', 'staff', 'classes', 'classrooms', 'subjects', 'attendance',
    'assessments', 'reportCards', 'examResults', 'fees', 'feeInvoices', 'expenses',
    'timetables', 'notices', 'smsAlerts', 'libraryBooks', 'libraryLoans',
    'healthRecords', 'transportRoutes', 'disciplineCases', 'clubs',
    'studyMaterials', 'quizzes', 'inventory', 'assets', 'visitors',
    'appointments', 'staffAttendance', 'leaveRequests', 'payroll',
    'suppliers', 'purchaseOrders', 'purchaseRequests',
    'settings', 'inventorySettings', 'schoolProfile', 'alumni', 'boardingRecords', 'certificates',
    'counseling', 'curriculum', 'idCards', 'sportsActivities', 'recruitment',
    'payrollReports', 'paySlips', 'statutoryReturns', 'purchaseComparisons',
    'quotations', 'goodsReceipts', 'supplierInvoices', 'maintenanceWorkOrders',
    'enquiries', 'incomingMail', 'followUps', 'dispatches', 'callLogs',
    'admissions', 'applications', 'interviews', 'admissionLetters', 'waitingList',
    'studentTransfers', 'questionBank', 'onlineClasses', 'learningAnalytics',
    'transcripts', 'unebExams', 'schemesOfWork', 'streams', 'lessonPlans',
    'schoolDocuments', 'calendarEvents', 'announcements', 'smsMessages',
    'ministryReports', 'emisReports', 'teachers', 'staffDirectory', 'visitorLogs', 'notifications'
]);
const personalRecordCollections = new Set([
    'students', 'attendance', 'assessments', 'reportCards', 'examResults', 'fees',
    'feeInvoices', 'healthRecords', 'libraryLoans', 'disciplineCases',
    'idCards', 'transcripts', 'unebExams'
]);
const legacyDataCollections = new Map([
    ['school_teachers', 'teachers'], ['school_staff', 'staff'], ['school_staff_directory', 'staffDirectory'],
    ['school_timetables', 'timetables'],
    ['schoolParentContacts', 'parents'], ['schoolAttendanceRecords', 'attendance'],
    ['staff_attendance', 'staffAttendance'], ['schoolHealthRecords', 'healthRecords'],
    ['schoolBoardingRecords', 'boardingRecords'], ['schoolTransportRecords', 'transportRoutes'],
    ['schoolAlumniRecords', 'alumni'], ['schoolInventoryRecords', 'inventory'],
    ['schoolAssignments', 'assessments'], ['schoolStudyMaterials', 'studyMaterials'],
    ['schoolOnlineQuizzes', 'quizzes'], ['schoolDisciplineCases', 'disciplineCases'],
    ['schoolClubsSocieties', 'clubs'], ['school_curriculum', 'curriculum'],
    ['school_activities', 'sportsActivities'], ['school_counseling', 'counseling'],
    ['school_leaves', 'leaveRequests'], ['schoolRecruitment', 'recruitment'],
    ['schoolFixedAssets', 'assets'], ['schoolGoodsReceipts', 'goodsReceipts'],
    ['schoolMaintenanceWorkOrders', 'maintenanceWorkOrders'], ['schoolCertificates', 'certificates'],
    ['schoolIDRecords', 'idCards'], ['schoolLibraryBooks', 'libraryBooks'],
    ['schoolFeeRecords', 'fees'], ['schoolExpenseRecords', 'expenses'],
    ['schoolPurchaseComparisons', 'purchaseComparisons'], ['schoolPurchaseOrders', 'purchaseOrders'],
    ['schoolPurchaseRequests', 'purchaseRequests'], ['schoolQuotations', 'quotations'],
    ['schoolSupplierInvoices', 'supplierInvoices'], ['schoolSupplierDirectory', 'suppliers'],
    ['schoolNoticeBoard', 'notices'], ['edumasterEnquiries', 'enquiries'],
    ['schoolSmsAlerts', 'smsAlerts'], ['edumasterAnnouncements', 'announcements'],
    ['edumasterCalendar', 'calendarEvents'], ['edumasterDocuments', 'schoolDocuments'],
    ['edumasterNotifications', 'notifications'], ['edumasterVisitorLogs', 'visitorLogs'],
    ['edumasterReportCards', 'reportCards'], ['edumasterFollowUps', 'followUps'],
    ['edumasterIncomingMail', 'incomingMail'], ['edumasterAppointments', 'appointments'],
    ['edumasterVisitors', 'visitors'], ['schoolVisitorLogs', 'visitorLogs'],
    ['edumasterDispatches', 'dispatches'],
    ['edumasterCallLogs', 'callLogs'], ['schoolPayroll', 'payroll'],
    ['schoolPaySlips', 'paySlips'], ['schoolStatutoryReturns', 'statutoryReturns'],
    ['schoolPayrollReports', 'payrollReports']
]);
const databaseName = 'school-portal-local-first';
const databaseVersion = 1;
let identity = null;
let selectedParentStudentId = '';
let databasePromise;
let syncRunning = false;
let syncRetryAttempt = 0;
let syncRetryTimer = null;
let syncIndicator;
let syncConflictDialog;

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

function isClassScopedCollection(collectionName) {
    return personalRecordCollections.has(collectionName);
}

function isTeachingRole(role) {
    return ['teacher', 'deputyHeadTeacher'].includes(role);
}

function canEditCollection(owner, collectionName) {
    if (!owner || ['parent', 'student'].includes(String(owner.role).toLowerCase())) return false;
    const isAdministrator = ['schoolAdmin', 'superAdmin', 'director', 'headTeacher'].includes(owner.role);
    const permissionCollection = collectionName === 'inventorySettings' ? 'inventory' : collectionName;
    const hasLegacyExamResultsAccess = collectionName === 'examResults'
        && isTeachingRole(owner.role)
        && owner.assignedClassIds.length > 0
        && owner.permissions?.examResults === undefined;
    return isAdministrator
        || owner.permissions?.[permissionCollection]?.edit === true
        || (['purchaseRequests', 'purchaseOrders', 'purchaseComparisons'].includes(collectionName)
            && ['deputyHeadTeacher', 'storeManager', 'bursar'].includes(owner.role)
            && owner.permissions?.[collectionName] === undefined)
        || hasLegacyExamResultsAccess;
}

async function linkedStudentIds(owner) {
    if (owner.role === 'student') return owner.linkedRecordId ? [String(owner.linkedRecordId)] : [];
    if (owner.role !== 'parent') return [];
    const snapshot = await getDocs(collection(db, 'schools', owner.schoolId, 'members', owner.uid, 'linkedStudents'));
    return snapshot.docs.map(item => item.id);
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

function putOutbox(mutation) {
    return runStoreTransaction('outbox', 'readwrite', store => store.put(mutation));
}

function listOutbox() {
    return runStoreTransaction('outbox', 'readonly', store => store.getAll());
}

async function quarantineReadOnlyMutations(owner) {
    const mutations = (await listOutbox()).filter(mutation =>
        mutation.schoolId === owner.schoolId
        && mutation.uid === owner.uid
        && !canEditCollection(owner, mutation.collection)
    );
    for (const mutation of mutations) {
        const key = makeKey(owner.schoolId, owner.uid, mutation.collection, mutation.recordId);
        const localRecord = await readLocal(key);
        if (localRecord?.syncState === 'pending') {
            await writeLocal({
                ...localRecord,
                syncState: 'rejected',
                syncError: 'This account is read-only for school records.',
                rejectedMutation: mutation
            });
        }
        await deleteOutbox(mutation.mutationId);
    }
}

function cloudRecordRef(owner, collectionName, recordId) {
    return doc(db, 'schools', owner.schoolId, collectionName, String(recordId));
}

function copyValue(value) {
    return JSON.parse(JSON.stringify(value));
}

async function prepareCloudAssets(value, collectionName, recordId, fieldPath = 'record') {
    if (typeof value === 'string' && value.startsWith('data:')) {
        const uploadAsset = window.schoolPortalFirebase?.uploadSchoolAsset;
        if (!uploadAsset) throw new Error('Firebase Storage is unavailable for record attachments.');
        return uploadAsset(assertIdentity().schoolId, collectionName, recordId, fieldPath, value);
    }
    if (Array.isArray(value)) {
        return Promise.all(value.map((item, index) => prepareCloudAssets(item, collectionName, recordId, `${fieldPath}.${index}`)));
    }
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([key, item]) => [
        key,
        await prepareCloudAssets(item, collectionName, recordId, `${fieldPath}.${key}`)
    ])));
}

let activeCloudWrites = 0;
let cloudWriteErrors = 0;

function isPermanentSyncFailure(error) {
    const message = `${error?.code ?? ''} ${error?.message ?? ''}`.toLowerCase();
    return error?.code === 'permission-denied'
        || error?.code === 'unauthenticated'
        || /permission|insufficient permissions|not authorized|read-only|read only/.test(message);
}

async function rejectQueuedMutation(mutation, error) {
    const key = makeKey(mutation.schoolId, mutation.uid, mutation.collection, mutation.recordId);
    const localRecord = await readLocal(key);
    if (localRecord) {
        await writeLocal({
            ...localRecord,
            syncState: 'rejected',
            syncError: error?.message || 'Cloud sync is blocked by a permissions issue.',
            rejectedMutation: mutation,
            updatedAt: Date.now()
        });
    }
    await deleteOutbox(mutation.mutationId);
}

async function processMutation(mutation) {
    const owner = assertIdentity();
    if (mutation.schoolId !== owner.schoolId || mutation.uid !== owner.uid) return;
    const cloudData = await prepareCloudAssets(mutation.data, mutation.collection, mutation.recordId);
    const recordRef = cloudRecordRef(owner, mutation.collection, mutation.recordId);
    const versionRef = doc(db, 'schools', owner.schoolId, mutation.collection, String(mutation.recordId), 'versions', mutation.mutationId);
    const conflictRef = doc(db, 'schools', owner.schoolId, 'members', owner.uid, 'syncConflicts', mutation.mutationId);
    const result = await runTransaction(db, async transaction => {
        const currentSnapshot = await transaction.get(recordRef);
        const current = currentSnapshot.exists() ? currentSnapshot.data() : null;
        if (current?.lastMutationId === mutation.mutationId) return { state: 'synced', current };

        const currentVersion = current?.version || 0;
        if (Number.isInteger(mutation.baseVersion) && mutation.baseVersion !== currentVersion) {
            transaction.set(conflictRef, {
                collection: mutation.collection,
                recordId: String(mutation.recordId),
                baseVersion: mutation.baseVersion,
                serverVersion: currentVersion,
                localData: cloudData,
                remoteData: current?.data || null,
                createdBy: owner.uid,
                createdAt: serverTimestamp(),
                status: 'open'
            });
            return { state: 'conflict', current };
        }
        const nextVersion = currentVersion + 1;
        const next = {
            data: cloudData,
            version: nextVersion,
            updatedBy: owner.uid,
            updatedAt: new Date().toISOString(),
            lastMutationId: mutation.mutationId
        };
        transaction.set(recordRef, next);
        transaction.set(versionRef, {
            data: cloudData,
            version: nextVersion,
            createdBy: owner.uid,
            createdAt: serverTimestamp()
        });
        return { state: 'synced', current: next };
    });

    const key = makeKey(owner.schoolId, owner.uid, mutation.collection, mutation.recordId);
    if (result.state === 'conflict') {
        await writeLocal({
            key,
            schoolId: owner.schoolId,
            uid: owner.uid,
            collection: mutation.collection,
            recordId: String(mutation.recordId),
            data: mutation.data,
            remoteData: result.current?.data || null,
            conflictId: mutation.mutationId,
            version: result.current?.version || 0,
            syncState: 'conflict',
            updatedAt: Date.now()
        });
        await deleteOutbox(mutation.mutationId);
        window.dispatchEvent(new CustomEvent('school-portal-sync-conflict', {
            detail: { collection: mutation.collection, recordId: mutation.recordId, conflictId: mutation.mutationId }
        }));
        return { state: 'conflict' };
    }

    await writeLocal({
        key,
        schoolId: owner.schoolId,
        uid: owner.uid,
        collection: mutation.collection,
        recordId: String(mutation.recordId),
        data: result.current?.data ?? cloudData,
        version: result.current?.version || mutation.baseVersion,
        syncState: 'synced',
        updatedAt: Date.now()
    });
    await deleteOutbox(mutation.mutationId);
    window.dispatchEvent(new CustomEvent('school-portal-sync-update', {
        detail: { collection: mutation.collection, recordId: mutation.recordId, mutationId: mutation.mutationId, state: result.state }
    }));
    return { state: 'synced', data: result.current?.data ?? cloudData };
}

async function syncOutbox() {
    if (!identity || !navigator.onLine || syncRunning) return;
    const owner = identity;
    syncRunning = true;
    let failed = false;
    let permanentFailure = false;
    try {
        await quarantineReadOnlyMutations(owner);
        while (navigator.onLine) {
            const mutations = (await listOutbox()).filter(mutation =>
                mutation.schoolId === owner.schoolId
                && mutation.uid === owner.uid
                && canEditCollection(owner, mutation.collection)
            );
            if (!mutations.length) break;
            mutations.sort((left, right) => left.createdAt - right.createdAt);
            for (const mutation of mutations) {
                try {
                    const result = await processMutation(mutation);
                    if (result?.state === 'conflict') continue;
                } catch (error) {
                    console.warn('A local change remains queued for synchronization.', error);
                    failed = true;
                    permanentFailure = isPermanentSyncFailure(error);
                    if (permanentFailure) {
                        cloudWriteErrors += 1;
                        await rejectQueuedMutation(mutation, error);
                    }
                    break;
                }
            }
            if (failed) break;
        }
        if (!failed) cloudWriteErrors = 0;
    } finally {
        syncRunning = false;
        const activeIdentity = identity;
        const identityChanged = activeIdentity
            && (activeIdentity.schoolId !== owner.schoolId || activeIdentity.uid !== owner.uid);
        const activeHasPendingMutations = activeIdentity && (await listOutbox()).some(mutation =>
            mutation.schoolId === activeIdentity.schoolId && mutation.uid === activeIdentity.uid
        );
        if (failed && navigator.onLine && !syncRetryTimer && !permanentFailure) {
            const retryDelay = Math.min(60_000, 1000 * 2 ** Math.min(syncRetryAttempt, 6));
            syncRetryAttempt += 1;
            syncRetryTimer = setTimeout(() => {
                syncRetryTimer = null;
                void syncOutbox();
            }, retryDelay);
        } else {
            syncRetryAttempt = 0;
        }
        window.dispatchEvent(new CustomEvent('school-portal-sync-status'));
        if (navigator.onLine && (identityChanged || (!failed && activeHasPendingMutations))) {
            setTimeout(() => void syncOutbox(), 0);
        }
    }
}

async function retryRejectedMutation(collectionName, recordId) {
    const owner = assertIdentity();
    assertCollection(collectionName);
    if (!canEditCollection(owner, collectionName)) {
        throw new Error('This account still does not have permission to edit this collection.');
    }
    const key = makeKey(owner.schoolId, owner.uid, collectionName, recordId);
    const localRecord = await readLocal(key);
    const mutation = localRecord?.rejectedMutation;
    if (localRecord?.syncState !== 'rejected' || !mutation
        || mutation.schoolId !== owner.schoolId || mutation.uid !== owner.uid) {
        throw new Error('This rejected change is unavailable for retry.');
    }
    const { syncError, rejectedMutation, ...record } = localRecord;
    await putOutbox(mutation);
    await writeLocal({ ...record, syncState: 'pending', updatedAt: Date.now() });
    window.dispatchEvent(new CustomEvent('school-portal-sync-status'));
    if (navigator.onLine) void syncOutbox();
}

async function refreshSyncIndicator() {
    if (!syncIndicator) {
        const actions = document.querySelector('.top-actions');
        const languageSelector = actions?.querySelector('.header-badge');
        if (!actions) return;
        syncIndicator = document.createElement('button');
        syncIndicator.type = 'button';
        syncIndicator.className = 'portal-sync-indicator';
        syncIndicator.setAttribute('aria-label', 'View synchronization status and pending conflicts');
        const icon = document.createElement('i');
        icon.className = 'fas fa-cloud';
        icon.setAttribute('aria-hidden', 'true');
        const label = document.createElement('span');
        label.setAttribute('aria-live', 'polite');
        syncIndicator.append(icon, label);
        syncIndicator.addEventListener('click', () => void openSyncConflictReview());
        if (languageSelector) {
            languageSelector.insertAdjacentElement('afterend', syncIndicator);
        } else {
            actions.prepend(syncIndicator);
        }
    }
    const icon = syncIndicator.querySelector('i');
    const label = syncIndicator.querySelector('span');
    if (!identity) {
        syncIndicator.dataset.state = 'idle';
        if (icon) icon.className = 'fas fa-cloud';
        if (label) label.textContent = 'Signed out';
        return;
    }
    if (!navigator.onLine) {
        syncIndicator.dataset.state = 'offline';
        if (icon) icon.className = 'fas fa-cloud-slash';
        if (label) label.textContent = 'Offline';
        return;
    }
    const pending = (await listOutbox()).filter(item => item.schoolId === identity.schoolId && item.uid === identity.uid).length;
    const records = (await runStoreTransaction('records', 'readonly', store => store.getAll()))
        .filter(record => record.schoolId === identity.schoolId
            && record.uid === identity.uid
            && ['conflict', 'rejected'].includes(record.syncState));
    const conflictRecords = records.filter(record => record.syncState === 'conflict');
    const rejectedRecords = records.filter(record => record.syncState === 'rejected');
    if (syncRunning || activeCloudWrites || pending || cloudWriteErrors) {
        if (icon) icon.className = 'fas fa-cloud-arrow-up';
        if (label) label.textContent = activeCloudWrites || syncRunning
            ? 'Syncing'
            : pending ? `Queued: ${pending}` : 'Sync failed';
    } else if (rejectedRecords.length) {
        if (icon) icon.className = 'fas fa-triangle-exclamation';
        if (label) label.textContent = `Retry required (${rejectedRecords.length})`;
    } else if (conflictRecords.length) {
        if (icon) icon.className = 'fas fa-code-compare';
        if (label) label.textContent = `Review conflicts (${conflictRecords.length})`;
    } else {
        if (icon) icon.className = 'fas fa-cloud';
        if (label) label.textContent = 'Synced';
    }
    syncIndicator.dataset.state = syncRunning || activeCloudWrites || pending || cloudWriteErrors
    ? 'pending'
    : rejectedRecords.length || conflictRecords.length ? 'conflict' : 'synced';
}

function getOrCreateSyncConflictDialog() {
    if (syncConflictDialog) return syncConflictDialog;
    syncConflictDialog = document.createElement('dialog');
    syncConflictDialog.className = 'portal-sync-dialog';
    syncConflictDialog.setAttribute('aria-labelledby', 'portalSyncDialogTitle');
    const header = document.createElement('header');
    const title = document.createElement('h2');
    title.id = 'portalSyncDialogTitle';
    title.textContent = 'Synchronization review';
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'portal-sync-dialog-close';
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => syncConflictDialog.close());
    header.append(title, closeButton);
    const status = document.createElement('p');
    status.className = 'portal-sync-dialog-status';
    status.setAttribute('role', 'status');
    const list = document.createElement('div');
    list.className = 'portal-sync-conflict-list';
    syncConflictDialog.append(header, status, list);
    syncConflictDialog.addEventListener('click', event => {
        if (event.target === syncConflictDialog) syncConflictDialog.close();
    });
    document.body.append(syncConflictDialog);
    return syncConflictDialog;
}

async function openSyncConflictReview() {
    const dialog = getOrCreateSyncConflictDialog();
    const status = dialog.querySelector('.portal-sync-dialog-status');
    const list = dialog.querySelector('.portal-sync-conflict-list');
    list.replaceChildren();
    if (!dialog.open) dialog.showModal();
    if (!identity) {
        status.textContent = 'Sign in to review synchronization status.';
        return;
    }
    const owner = identity;
    if (!navigator.onLine) {
        status.textContent = 'You are offline. Queued edits will sync when connectivity returns. Reconnect to review conflicts.';
        return;
    }

    status.textContent = 'Loading synchronization status...';
    try {
        const conflicts = await getConflicts();
        const [mutations, localRecords] = await Promise.all([
            listOutbox(),
            runStoreTransaction('records', 'readonly', store => store.getAll())
        ]);
        if (identity !== owner) throw new Error('Your sign-in changed. Reopen synchronization review.');
        const ownerMutations = mutations.filter(mutation =>
            mutation.schoolId === owner.schoolId && mutation.uid === owner.uid
        );
        const rejectedRecords = localRecords.filter(record =>
            record.schoolId === owner.schoolId && record.uid === owner.uid && record.syncState === 'rejected'
        );
        if (ownerMutations.length) {
            const queuedMessage = document.createElement('p');
            queuedMessage.textContent = `${ownerMutations.length} edit${ownerMutations.length === 1 ? '' : 's'} queued for cloud sync.`;
            list.append(queuedMessage);
        }
        if (rejectedRecords.length) {
            const rejectedHeading = document.createElement('h3');
            rejectedHeading.textContent = 'Changes needing attention';
            list.append(rejectedHeading);
            for (const record of rejectedRecords) {
                const item = document.createElement('section');
                item.className = 'portal-sync-conflict';
                const heading = document.createElement('h4');
                heading.textContent = `${record.collection} - ${record.recordId}`;
                const message = document.createElement('p');
                message.textContent = record.syncError || 'The change was rejected by the cloud.';
                const retryButton = document.createElement('button');
                retryButton.type = 'button';
                retryButton.textContent = 'Retry this change';
                retryButton.addEventListener('click', async () => {
                    retryButton.disabled = true;
                    status.textContent = 'Retrying the rejected change...';
                    try {
                        await retryRejectedMutation(record.collection, record.recordId);
                        await openSyncConflictReview();
                        await refreshSyncIndicator();
                    } catch (error) {
                        console.error('Unable to retry the rejected synchronization change.', error);
                        status.textContent = error?.message || 'Unable to retry this change.';
                        retryButton.disabled = false;
                    }
                });
                item.append(heading, message, retryButton);
                list.append(item);
            }
        }
        if (!conflicts.length) {
            status.textContent = rejectedRecords.length
                ? 'Some changes were rejected. Review their errors and retry after correcting access or data.'
                : ownerMutations.length
                    ? 'Your edits are safely queued and will retry automatically.'
                    : 'Everything is synchronized. There are no conflicts to review.';
            return;
        }

        status.textContent = 'Choose which version to keep for each conflicting record.';
        for (const conflict of conflicts) {
            const card = document.createElement('section');
            card.className = 'portal-sync-conflict';
            const heading = document.createElement('h3');
            heading.textContent = `${conflict.collection} - ${conflict.recordId}`;
            const versions = document.createElement('div');
            versions.className = 'portal-sync-conflict-versions';
            for (const [label, value] of [['Your version', conflict.localData], ['Cloud version', conflict.remoteData]]) {
                const version = document.createElement('section');
                const versionTitle = document.createElement('h4');
                versionTitle.textContent = label;
                const preview = document.createElement('pre');
                preview.textContent = JSON.stringify(value, null, 2) || 'No record data';
                version.append(versionTitle, preview);
                versions.append(version);
            }
            const actions = document.createElement('div');
            actions.className = 'portal-sync-conflict-actions';
            const createChoiceButton = (label, resolution) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = label;
                button.addEventListener('click', async () => {
                    actions.querySelectorAll('button').forEach(item => { item.disabled = true; });
                    status.textContent = 'Saving your choice...';
                    try {
                        await resolveConflict(conflict.id, resolution);
                        await openSyncConflictReview();
                        await refreshSyncIndicator();
                    } catch (error) {
                        console.error('Unable to resolve the synchronization conflict.', error);
                        status.textContent = error?.message || 'Unable to save your choice. Try again.';
                        actions.querySelectorAll('button').forEach(item => { item.disabled = false; });
                    }
                });
                return button;
            };
            actions.append(
                createChoiceButton('Keep my version', 'local'),
                createChoiceButton('Use cloud version', 'remote')
            );
            card.append(heading, versions, actions);
            list.append(card);
        }
    } catch (error) {
        console.error('Unable to load synchronization review.', error);
        status.textContent = error?.message || 'Unable to load synchronization status. Try again.';
    }
}

window.addEventListener('school-portal-sync-status', () => void refreshSyncIndicator());
window.addEventListener('school-portal-sync-update', () => void refreshSyncIndicator());
window.addEventListener('school-portal-sync-conflict', () => void refreshSyncIndicator());
window.addEventListener('school-portal-identity-ready', () => void refreshSyncIndicator());
window.addEventListener('school-portal-identity-cleared', () => {
    syncConflictDialog?.close();
    void refreshSyncIndicator();
});
window.addEventListener('online', () => void refreshSyncIndicator());
window.addEventListener('offline', () => void refreshSyncIndicator());
document.addEventListener('DOMContentLoaded', () => void refreshSyncIndicator());

async function listLocal(collectionName) {
    const owner = assertIdentity();
    assertCollection(collectionName);
    const all = await runStoreTransaction('records', 'readonly', store => store.getAll());
    const linkedIds = ['parent', 'student'].includes(owner.role) && isClassScopedCollection(collectionName)
        ? new Set(await linkedStudentIds(owner))
        : null;
    return all
        .filter(record => record.schoolId === owner.schoolId && record.uid === owner.uid && record.collection === collectionName)
        .filter(record => record.syncState !== 'rejected')
        .filter(record => record.data?.deleted !== true)
        .filter(record => !isTeachingRole(owner.role) || !isClassScopedCollection(collectionName)
            || owner.assignedClassIds.includes(String(record.data?.classId || '')))
        .filter(record => !linkedIds || linkedIds.has(String(
            record.data?.studentId || (collectionName === 'students' ? record.recordId : '')
        )))
        .filter(record => owner.role !== 'parent' || !selectedParentStudentId
            || !isClassScopedCollection(collectionName)
            || String(collectionName === 'students'
                ? record.recordId
                : record.data?.studentId || record.data?.studentID || record.recordId) === selectedParentStudentId)
        .map(record => ({ id: record.recordId, ...record.data, _syncState: record.syncState }));
}

async function saveRecord(collectionName, recordId, data) {
    const owner = assertIdentity();
    assertCollection(collectionName);
    if (!canEditCollection(owner, collectionName)) {
        throw new Error('This account has read-only access to school records.');
    }
    if (!recordId || !data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('A record ID and a record object are required.');
    }
    const key = makeKey(owner.schoolId, owner.uid, collectionName, recordId);
    const currentLocal = await readLocal(key);
    if (currentLocal?.syncState === 'conflict') {
        throw new Error('Resolve the pending cloud conflict before editing this record again.');
    }
    const olderMutations = (await listOutbox()).filter(mutation =>
        mutation.schoolId === owner.schoolId
        && mutation.uid === owner.uid
        && mutation.collection === collectionName
        && mutation.recordId === String(recordId)
    );
    const cleanData = copyValue(data);
    if (!navigator.onLine) {
        const existingMutation = olderMutations.sort((left, right) => left.createdAt - right.createdAt)[0];
        await Promise.all(olderMutations
            .filter(mutation => mutation !== existingMutation)
            .map(mutation => deleteOutbox(mutation.mutationId)));
        const mutation = existingMutation
            ? { ...existingMutation, data: cleanData }
            : {
                mutationId: crypto.randomUUID(),
                schoolId: owner.schoolId,
                uid: owner.uid,
                collection: collectionName,
                recordId: String(recordId),
                data: cleanData,
                baseVersion: currentLocal?.version || 0,
                createdAt: Date.now()
            };
        await putOutbox(mutation);
        await writeLocal({
            ...currentLocal,
            key,
            schoolId: owner.schoolId,
            uid: owner.uid,
            collection: collectionName,
            recordId: String(recordId),
            data: cleanData,
            version: currentLocal?.version || 0,
            syncState: 'pending',
            updatedAt: Date.now()
        });
        window.dispatchEvent(new CustomEvent('school-portal-sync-update', {
            detail: { collection: collectionName, recordId: String(recordId), state: 'pending' }
        }));
        window.dispatchEvent(new CustomEvent('school-portal-sync-status'));
        return cleanData;
    }
    if (olderMutations.length) {
        while (syncRunning) {
            await new Promise(resolve => window.addEventListener('school-portal-sync-status', resolve, { once: true }));
        }
        await syncOutbox();
        const stillPending = (await listOutbox()).some(mutation =>
            mutation.schoolId === owner.schoolId
            && mutation.uid === owner.uid
            && mutation.collection === collectionName
            && mutation.recordId === String(recordId)
        );
        if (stillPending) throw new Error('An earlier update is still waiting for cloud sync. Try again shortly.');
    }
    const latestLocal = await readLocal(key);
    const mutation = {
        mutationId: crypto.randomUUID(),
        schoolId: owner.schoolId,
        uid: owner.uid,
        collection: collectionName,
        recordId: String(recordId),
        data: cleanData,
        baseVersion: latestLocal?.version || 0,
        createdAt: Date.now()
    };
    activeCloudWrites += 1;
    window.dispatchEvent(new CustomEvent('school-portal-sync-update', {
        detail: { collection: collectionName, recordId, state: 'pending' }
    }));
    try {
        const result = await processMutation(mutation);
        if (result?.state === 'conflict') {
            throw new Error('This record changed in the cloud. Review the conflict before choosing a version.');
        }
        cloudWriteErrors = 0;
        return result?.data ?? cleanData;
    } catch (error) {
        if (isPermanentSyncFailure(error) || /changed in the cloud|conflict/i.test(error?.message || '')) throw error;
        await putOutbox(mutation);
        await writeLocal({
            ...latestLocal,
            key,
            schoolId: owner.schoolId,
            uid: owner.uid,
            collection: collectionName,
            recordId: String(recordId),
            data: cleanData,
            version: latestLocal?.version || 0,
            syncState: 'pending',
            syncError: error?.message || 'Cloud sync is temporarily unavailable.',
            updatedAt: Date.now()
        });
        cloudWriteErrors += 1;
        window.dispatchEvent(new CustomEvent('school-portal-sync-update', {
            detail: { collection: collectionName, recordId: String(recordId), state: 'pending' }
        }));
        window.dispatchEvent(new CustomEvent('school-portal-sync-status'));
        setTimeout(() => void syncOutbox(), 1000);
        return cleanData;
    } finally {
        activeCloudWrites = Math.max(0, activeCloudWrites - 1);
        window.dispatchEvent(new CustomEvent('school-portal-sync-status'));
    }
}

async function deleteRecord(collectionName, recordId) {
    return saveRecord(collectionName, recordId, { deleted: true });
}

function legacyRecordId(record, index, key) {
    const stableId = record.id ?? record.recordId ?? record.admissionNo ?? record.receiptNo
        ?? record.employeeId ?? record.memberId ?? record.code ?? record.requestNo
        ?? record.orderNo ?? record.title ?? record.name;
    return String(stableId ?? `${key}-${index}`);
}

function parseLegacyRecords(serialized) {
    try {
        const parsed = JSON.parse(serialized || 'null');
        return Array.isArray(parsed) ? parsed.filter(record => record && typeof record === 'object' && !Array.isArray(record)) : [];
    } catch {
        return [];
    }
}

async function syncLegacyDataset(key, previousSerialized, nextSerialized) {
    const owner = assertIdentity();
    const collectionName = legacyDataCollections.get(key);
    if (!collectionName || !canEditCollection(owner, collectionName)) return;
    const previousRecords = parseLegacyRecords(previousSerialized);
    const nextRecords = parseLegacyRecords(nextSerialized);
    const previousById = new Map(previousRecords.map((record, index) => [legacyRecordId(record, index, key), record]));
    const nextById = new Map(nextRecords.map((record, index) => [legacyRecordId(record, index, key), record]));

    for (const [recordId, record] of nextById) {
        if (JSON.stringify(previousById.get(recordId)) === JSON.stringify(record)) continue;
        await saveRecord(collectionName, recordId, { ...record, id: record.id ?? recordId });
    }
    for (const recordId of previousById.keys()) {
        if (!nextById.has(recordId)) await deleteRecord(collectionName, recordId);
    }
    if (navigator.onLine) void syncOutbox();
}

let legacyMigrationIdentity = '';
async function queueLegacyStorageChange(key, previousSerialized, nextSerialized) {
    const owner = assertIdentity();
    const collectionName = legacyDataCollections.get(key);
    if (!collectionName || !canEditCollection(owner, collectionName)) return;
    try {
        await syncLegacyDataset(key, previousSerialized || '[]', nextSerialized);
        preserveLegacyStorage(owner);
    } catch (error) {
        suppressLegacyStorageBridge = true;
        const scopedKey = scopedLegacyStorageKey(owner, key);
        if (previousSerialized === null) {
            originalStorageRemoveItem.call(localStorage, key);
            originalStorageRemoveItem.call(localStorage, scopedKey);
        } else {
            originalStorageSetItem.call(localStorage, key, previousSerialized);
            originalStorageSetItem.call(localStorage, scopedKey, previousSerialized);
        }
        suppressLegacyStorageBridge = false;
        throw error;
    }
}
async function migrateLegacyLocalData() {
    const owner = assertIdentity();
    const identityKey = `${owner.schoolId}:${owner.uid}`;
    if (legacyMigrationIdentity === identityKey) return;
    if (localStorage.getItem(`schoolPortalMigrationDone:${identityKey}`) === 'true') return;
    legacyMigrationIdentity = identityKey;
    const datasets = Array.from(legacyDataCollections, ([key, collectionName]) => ({
        key,
        collectionName,
        serialized: localStorage.getItem(key),
        count: parseLegacyRecords(localStorage.getItem(key)).length
    })).filter(dataset => dataset.count > 0
        && canEditCollection(owner, dataset.collectionName));
    const total = datasets.reduce((count, dataset) => count + dataset.count, 0);
    if (!total) return;

    for (const dataset of datasets) {
        await syncLegacyDataset(dataset.key, '[]', dataset.serialized);
    }
    originalStorageSetItem.call(localStorage, `schoolPortalMigrationDone:${identityKey}`, 'true');
    preserveLegacyStorage(owner);
    window.dispatchEvent(new CustomEvent('school-portal-legacy-migration-complete', {
        detail: { schoolId: owner.schoolId, count: total }
    }));
}

const originalStorageSetItem = Storage.prototype.setItem;
const originalStorageRemoveItem = Storage.prototype.removeItem;
const legacySchoolOwnerKey = 'schoolPortalLegacySchoolOwner';
const scopedLegacyStorageKey = (owner, key) => `schoolPortalRecords:${owner.schoolId}:${owner.uid}:${key}`;
let suppressLegacyStorageBridge = false;

function preserveLegacyStorage(owner) {
    if (!owner) return;
    legacyDataCollections.forEach((collectionName, key) => {
        const value = localStorage.getItem(key);
        if (value !== null) originalStorageSetItem.call(localStorage, scopedLegacyStorageKey(owner, key), value);
    });
}

function clearLegacyPublicStorage() {
    suppressLegacyStorageBridge = true;
    legacyDataCollections.forEach((collectionName, key) => originalStorageRemoveItem.call(localStorage, key));
    suppressLegacyStorageBridge = false;
}

function activateLegacyStorage(owner) {
    const entries = Array.from(legacyDataCollections.keys(), key => [key, localStorage.getItem(scopedLegacyStorageKey(owner, key))]);
    const hasScopedData = entries.some(([, value]) => value !== null);
    const legacySchoolOwner = localStorage.getItem(legacySchoolOwnerKey);
    const hasUnscopedData = Array.from(legacyDataCollections.keys()).some(key => localStorage.getItem(key) !== null);
    const mayUseUnscopedData = !hasScopedData && (!legacySchoolOwner || legacySchoolOwner === owner.schoolId);
    if (!legacySchoolOwner && hasUnscopedData) originalStorageSetItem.call(localStorage, legacySchoolOwnerKey, owner.schoolId);

    suppressLegacyStorageBridge = true;
    for (const [key, value] of entries) {
        if (value !== null) originalStorageSetItem.call(localStorage, key, value);
        else if (hasScopedData || !mayUseUnscopedData) originalStorageRemoveItem.call(localStorage, key);
    }
    suppressLegacyStorageBridge = false;
}

Storage.prototype.setItem = function (key, value) {
    const previous = this === localStorage && legacyDataCollections.has(String(key))
        ? this.getItem(key)
        : null;
    originalStorageSetItem.call(this, key, value);
    if (this === localStorage && identity && !suppressLegacyStorageBridge
        && legacyDataCollections.has(String(key))) {
        originalStorageSetItem.call(localStorage, scopedLegacyStorageKey(identity, String(key)), String(value));
        if (!canEditCollection(identity, legacyDataCollections.get(String(key))) || previous === String(value)) return;
        void queueLegacyStorageChange(String(key), previous, String(value)).catch(error => {
            console.error(`Unable to queue local ${legacyDataCollections.get(String(key))} changes.`, error);
            window.dispatchEvent(new CustomEvent('school-portal-sync-error', {
                detail: { collection: legacyDataCollections.get(String(key)), error }
            }));
        });
    }
};
Storage.prototype.removeItem = function (key) {
    const previous = this === localStorage && legacyDataCollections.has(String(key))
        ? this.getItem(key)
        : null;
    originalStorageRemoveItem.call(this, key);
    if (previous !== null && this === localStorage && identity && !suppressLegacyStorageBridge
        && legacyDataCollections.has(String(key))) {
        originalStorageRemoveItem.call(localStorage, scopedLegacyStorageKey(identity, String(key)));
        if (!canEditCollection(identity, legacyDataCollections.get(String(key)))) return;
        void queueLegacyStorageChange(String(key), previous, '[]').catch(error => {
            console.error(`Unable to queue local ${legacyDataCollections.get(String(key))} deletions.`, error);
        });
    }
};

async function subscribe(collectionName, onRecords, filters = [], options = {}) {
    const owner = assertIdentity();
    assertCollection(collectionName);
    const constraints = filters.map(filter => where(filter.field, filter.operator || '==', filter.value));
    if (isTeachingRole(owner.role) && isClassScopedCollection(collectionName)) {
        if (!owner.assignedClassIds.length) return () => {};
        constraints.push(where('data.classId', 'in', owner.assignedClassIds));
    }
    if (['parent', 'student'].includes(owner.role) && isClassScopedCollection(collectionName)) {
        let refreshInProgress = false;
        let refreshRequested = false;
        let cancelled = false;
        const refreshLinkedRecords = async () => {
            if (cancelled) return;
            if (refreshInProgress) {
                refreshRequested = true;
                return;
            }
            refreshInProgress = true;
            try {
                if (!navigator.onLine) {
                    onRecords([], { source: 'offline' });
                    return;
                }
                const firebase = window.schoolPortalFirebase;
                if (!firebase?.getLinkedSchoolRecords) {
                    throw new Error('Secure linked-record access is unavailable. Reload the app and try again.');
                }
                const linkedRecords = await firebase.getLinkedSchoolRecords(owner.schoolId, collectionName);
                if (cancelled) return;
                const visibleRecords = [];
                for (const linkedRecord of linkedRecords) {
                    if (cancelled) return;
                    const recordId = String(linkedRecord.id);
                    const key = makeKey(owner.schoolId, owner.uid, collectionName, recordId);
                    const cached = await readLocal(key);
                    if (cached?.syncState === 'pending' || cached?.syncState === 'conflict') {
                        visibleRecords.push(cached);
                        continue;
                    }
                    const record = {
                        key,
                        schoolId: owner.schoolId,
                        uid: owner.uid,
                        collection: collectionName,
                        recordId,
                        data: linkedRecord.data,
                        version: linkedRecord.version,
                        syncState: 'synced',
                        updatedAt: Date.now()
                    };
                    await writeLocal(record);
                    visibleRecords.push(record);
                }
                const linkedRecordsForView = visibleRecords
                    .filter(record => record.data?.deleted !== true)
                    .map(record => ({ id: record.recordId, ...record.data, _syncState: record.syncState }));
                onRecords(linkedRecordsForView.filter(record => !selectedParentStudentId
                    || String(collectionName === 'students'
                        ? record.id || ''
                        : record.studentId || record.studentID || record.id || '') === selectedParentStudentId), { source: 'cloud' });
            } catch (error) {
                console.error(`Unable to synchronize linked ${collectionName} records.`, error);
                window.dispatchEvent(new CustomEvent('school-portal-sync-error', {
                    detail: { collection: collectionName, error }
                }));
            } finally {
                refreshInProgress = false;
                if (refreshRequested && !cancelled) {
                    refreshRequested = false;
                    void refreshLinkedRecords();
                }
            }
        };
        const refreshWhenVisible = () => {
            if (!document.hidden) void refreshLinkedRecords();
        };
        const refreshOnParentChildChange = () => void refreshLinkedRecords();
        void refreshLinkedRecords();
        window.addEventListener('online', refreshLinkedRecords);
        window.addEventListener('focus', refreshLinkedRecords);
        document.addEventListener('visibilitychange', refreshWhenVisible);
        if (owner.role === 'parent') window.addEventListener('school-portal-parent-child-changed', refreshOnParentChildChange);
        return () => {
            cancelled = true;
            window.removeEventListener('online', refreshLinkedRecords);
            window.removeEventListener('focus', refreshLinkedRecords);
            document.removeEventListener('visibilitychange', refreshWhenVisible);
            if (owner.role === 'parent') window.removeEventListener('school-portal-parent-child-changed', refreshOnParentChildChange);
        };
    }
    if (options.orderByField) constraints.push(orderBy(options.orderByField, options.orderDirection || 'asc'));
    if (Number.isInteger(options.limit) && options.limit > 0) constraints.push(limit(options.limit));
    const collectionQuery = query(collection(db, 'schools', owner.schoolId, collectionName), ...constraints);
    return onSnapshot(collectionQuery, { includeMetadataChanges: true }, snapshot => {
        if (snapshot.metadata.fromCache) return;
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

let legacySubscriptions = [];
async function subscribeLegacyCollections() {
    const owner = assertIdentity();
    const isSchoolAdmin = ['schoolAdmin', 'superAdmin', 'director', 'headTeacher'].includes(owner.role);
    legacySubscriptions.forEach(unsubscribe => unsubscribe());
    legacySubscriptions = [];

    const collectionNames = new Set(legacyDataCollections.values());
    for (const collectionName of collectionNames) {
        const mayView = isSchoolAdmin
            || owner.permissions[collectionName]?.view === true
            || (['purchaseRequests', 'purchaseOrders', 'purchaseComparisons'].includes(collectionName)
                && owner.role === 'deputyHeadTeacher'
                && owner.permissions[collectionName] === undefined);
        if (!mayView || (owner.role === 'parent' && collectionName === 'notices')
            || (!isSchoolAdmin && isClassScopedCollection(collectionName))) continue;
        const storageKeys = Array.from(legacyDataCollections)
            .filter(([, mappedCollection]) => mappedCollection === collectionName)
            .map(([key]) => key);
        try {
            const unsubscribe = await subscribe(collectionName, (records, metadata) => {
                if (metadata?.source !== 'cloud') return;
                const cleanRecords = records.map(({ _syncState, ...record }) => record);
                const serialized = JSON.stringify(cleanRecords);
                storageKeys.forEach(key => {
                    originalStorageSetItem.call(localStorage, key, serialized);
                    originalStorageSetItem.call(localStorage, scopedLegacyStorageKey(owner, key), serialized);
                });
                window.dispatchEvent(new CustomEvent('school-portal-cloud-data-update', {
                    detail: { collection: collectionName, count: cleanRecords.length }
                }));
            });
            legacySubscriptions.push(unsubscribe);
        } catch (error) {
            console.error(`Unable to subscribe to ${collectionName} for ${owner.role}.`, error);
        }
    }
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

async function resolveConflict(conflictId, resolution = 'remote') {
    const owner = assertIdentity();
    if (!navigator.onLine) throw new Error('Reconnect to the internet before resolving cloud conflicts.');
    if (!['local', 'remote'].includes(resolution)) {
        throw new Error('Choose either your local version or the cloud version.');
    }
    const conflictRef = doc(db, 'schools', owner.schoolId, 'members', owner.uid, 'syncConflicts', conflictId);
    const initialConflict = await getDoc(conflictRef);
    if (!initialConflict.exists() || initialConflict.data().createdBy !== owner.uid) {
        throw new Error('This conflict is unavailable or belongs to another user.');
    }
    const conflict = initialConflict.data();
    assertCollection(conflict.collection);
    if (!canEditCollection(owner, conflict.collection)) {
        throw new Error('This account no longer has permission to resolve the conflict.');
    }
    const recordRef = cloudRecordRef(owner, conflict.collection, conflict.recordId);
    const newMutationId = crypto.randomUUID();
    const versionRef = doc(db, 'schools', owner.schoolId, conflict.collection, String(conflict.recordId), 'versions', newMutationId);
    const localData = resolution === 'local'
        ? await prepareCloudAssets(conflict.localData, conflict.collection, conflict.recordId)
        : null;
    const result = await runTransaction(db, async transaction => {
        const [currentSnapshot, currentConflictSnapshot] = await Promise.all([
            transaction.get(recordRef),
            transaction.get(conflictRef)
        ]);
        if (!currentConflictSnapshot.exists() || currentConflictSnapshot.data().status !== 'open') {
            throw new Error('This conflict has already been resolved.');
        }
        const current = currentSnapshot.exists() ? currentSnapshot.data() : null;
        if (resolution === 'local' && (current?.version || 0) !== conflict.serverVersion) {
            const nextConflictId = crypto.randomUUID();
            const nextConflictRef = doc(db, 'schools', owner.schoolId, 'members', owner.uid, 'syncConflicts', nextConflictId);
            transaction.set(nextConflictRef, {
                ...conflict,
                serverVersion: current?.version || 0,
                remoteData: current?.data || null,
                createdAt: serverTimestamp(),
                status: 'open'
            });
            transaction.update(conflictRef, {
                status: 'resolved',
                resolvedBy: owner.uid,
                resolvedAt: serverTimestamp()
            });
            return { state: 'changed-again', current, nextConflictId };
        }

        transaction.update(conflictRef, { status: 'resolved', resolvedBy: owner.uid, resolvedAt: serverTimestamp() });
        if (resolution === 'local') {
            const nextVersion = (current?.version || 0) + 1;
            const nextRecord = {
                data: localData,
                version: nextVersion,
                updatedBy: owner.uid,
                updatedAt: new Date().toISOString(),
                lastMutationId: newMutationId
            };
            transaction.set(recordRef, nextRecord);
            transaction.set(versionRef, {
                data: localData,
                version: nextVersion,
                createdBy: owner.uid,
                createdAt: serverTimestamp()
            });
            return { state: 'resolved-local', current: nextRecord };
        }
        return { state: 'resolved-remote', current };
    });
    const key = makeKey(owner.schoolId, owner.uid, conflict.collection, conflict.recordId);
    if (result.state === 'changed-again') {
        await writeLocal({
            key,
            schoolId: owner.schoolId,
            uid: owner.uid,
            collection: conflict.collection,
            recordId: String(conflict.recordId),
            data: conflict.localData,
            remoteData: result.current?.data || null,
            conflictId: result.nextConflictId,
            version: result.current?.version || 0,
            syncState: 'conflict',
            updatedAt: Date.now()
        });
        window.dispatchEvent(new CustomEvent('school-portal-sync-conflict', {
            detail: { collection: conflict.collection, recordId: conflict.recordId, conflictId: result.nextConflictId }
        }));
        return;
    }

    if (!result.current && resolution === 'remote') {
        await runStoreTransaction('records', 'readwrite', store => store.delete(key));
    } else {
        await writeLocal({
            key,
            schoolId: owner.schoolId,
            uid: owner.uid,
            collection: conflict.collection,
            recordId: String(conflict.recordId),
            data: result.current?.data ?? null,
            version: result.current?.version || 0,
            syncState: 'synced',
            updatedAt: Date.now()
        });
    }
    window.dispatchEvent(new CustomEvent('school-portal-sync-update', {
        detail: { collection: conflict.collection, recordId: conflict.recordId, state: 'synced' }
    }));
}

window.schoolPortalData = {
    setIdentity(schoolId, uid, membership = null) {
        const nextIdentity = {
            schoolId,
            uid,
            role: membership?.role || '',
            permissions: membership?.permissions || membership?.perms || {},
            assignedClassIds: Array.isArray(membership?.assignedClassIds) ? membership.assignedClassIds : [],
            linkedRecordId: membership?.linkedRecordId || ''
        };
        selectedParentStudentId = '';
        if (identity && (identity.schoolId !== schoolId || identity.uid !== uid)) {
            preserveLegacyStorage(identity);
            clearLegacyPublicStorage();
        }
        identity = nextIdentity;
        activateLegacyStorage(identity);
        const identityKey = `${schoolId}:${uid}`;
        let loadedIdentity = '';
        let canPersistIdentityMarker = false;
        try {
            loadedIdentity = sessionStorage.getItem('schoolPortalLoadedIdentity') || '';
            sessionStorage.setItem('schoolPortalLoadedIdentity', identityKey);
            canPersistIdentityMarker = true;
        } catch (error) {
            console.warn('Unable to persist the active school identity for this tab.', error);
        }
        if (canPersistIdentityMarker && loadedIdentity && loadedIdentity !== identityKey) {
            window.location.reload();
            return identity;
        }
        void subscribeLegacyCollections().catch(error => {
            console.error('Unable to initialize legacy school data subscriptions.', error);
        });
        void syncOutbox();
        window.dispatchEvent(new CustomEvent('school-portal-identity-ready', { detail: identity }));
        void migrateLegacyLocalData().catch(error => {
            legacyMigrationIdentity = '';
            console.error('Legacy school record migration could not be completed.', error);
        });
        return identity;
    },
    clearIdentity() {
        legacySubscriptions.forEach(unsubscribe => unsubscribe());
        legacySubscriptions = [];
        preserveLegacyStorage(identity);
        identity = null;
        selectedParentStudentId = '';
        clearLegacyPublicStorage();
        window.dispatchEvent(new CustomEvent('school-portal-identity-cleared'));
    },
    getIdentity() { return identity; },
    setParentChildFilter(studentId) {
        if (identity?.role !== 'parent') return;
        selectedParentStudentId = String(studentId || '');
        window.dispatchEvent(new CustomEvent('school-portal-parent-child-changed'));
    },
    migrateLegacyLocalData,
    listLocal,
    saveRecord,
    deleteRecord,
    subscribe,
    getConflicts,
    resolveConflict,
    retryRejectedMutation,
    sync: syncOutbox
};

window.addEventListener('online', () => void syncOutbox());
window.dispatchEvent(new CustomEvent('school-portal-data-ready'));
