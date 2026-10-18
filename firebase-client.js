import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {
    browserLocalPersistence,
    EmailAuthProvider,
    initializeAuth,
    onAuthStateChanged,
    reauthenticateWithCredential,
    signInWithEmailAndPassword,
    signOut
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {
    doc,
    collection,
    getDoc,
    getDocs,
    getFirestore,
    initializeFirestore,
    limit,
    onSnapshot,
    orderBy,
    persistentLocalCache,
    persistentMultipleTabManager,
    query,
    serverTimestamp,
    updateDoc,
    writeBatch
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js';
import { deleteToken, getMessaging, getToken, isSupported, onMessage } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging.js';
import { webPushVapidKey } from './firebase-config.js';

const firebaseConfig = {
    apiKey: 'AIzaSyBZ_7aveKKu7UsIi03wSzjptuZ38XqfJvc',
    authDomain: 'delivery-app-6a47f.firebaseapp.com',
    databaseURL: 'https://delivery-app-6a47f-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'delivery-app-6a47f',
    storageBucket: 'delivery-app-6a47f.firebasestorage.app',
    messagingSenderId: '525706344286',
    appId: '1:525706344286:web:fe40713a989479569d81cf',
    measurementId: 'G-JWV2EWL0XL'
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, { persistence: [browserLocalPersistence] });
let db;
try {
    db = initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
} catch (error) {
    console.warn('Firestore persistent cache initialization failed; using the default cache.', error);
    db = getFirestore(app);
}

const functions = getFunctions(app);
const storage = getStorage(app);
function schoolRecordOption(item) {
    const document = item.data();
    const record = document.data || document;
    if (document.deleted === true || record.deleted === true) return null;
    const name = String(
        record.fullName
        || record.name
        || record.studentName
        || record.staffName
        || [record.firstName, record.middleName, record.lastName].filter(Boolean).join(' ')
        || item.id
    ).trim();
    return {
        id: item.id,
        displayId: String(record.admissionNo || record.studentId || record.staffId || record.employeeId || item.id),
        name,
        department: String(record.department || record.departmentName || record.staffDepartment || '').trim(),
        group: String(record.className || record.class || record.section || '').trim()
    };
}

async function listAssignableSchoolClasses(schoolId) {
    const normalizedSchoolId = normalizeSchoolId(schoolId);
    if (!validSchoolId(normalizedSchoolId)) throw new Error('A valid School ID is required.');
    if (!auth.currentUser) throw new Error('Sign in to view this school\'s classes.');

    const snapshot = await getDocs(collection(db, 'schools', normalizedSchoolId, 'classes'));
    return snapshot.docs
        .filter(item => item.data().data?.deleted !== true)
        .map(item => {
            const record = item.data().data || item.data();
            return {
                id: item.id,
                name: String(record.name || record.className || record.streamName || item.id)
            };
        })
        .sort((left, right) => left.name.localeCompare(right.name));
}

async function listAssignableSchoolRecords(schoolId, recordType) {
    const normalizedSchoolId = normalizeSchoolId(schoolId);
    if (!validSchoolId(normalizedSchoolId)) throw new Error('A valid School ID is required.');
    if (!auth.currentUser) throw new Error('Sign in to view this school\'s records.');
    if (!['students', 'staff'].includes(recordType)) throw new Error('Choose student or staff records.');
    const snapshot = await getDocs(collection(db, 'schools', normalizedSchoolId, recordType));
    return snapshot.docs
        .map(schoolRecordOption)
        .filter(Boolean)
        .sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id));
}

const authReady = new Promise(resolve => onAuthStateChanged(auth, resolve, error => {
    console.error('Unable to restore Firebase Authentication state.', error);
    resolve(null);
}));

const normalizeSchoolId = value => String(value || '').trim().toUpperCase();
const validSchoolId = value => /^[A-Z0-9][A-Z0-9_-]{1,63}$/.test(value);
const memberPath = (schoolId, uid) => doc(db, 'schools', schoolId, 'members', uid);

async function getSchool(schoolCode) {
    const schoolId = normalizeSchoolId(schoolCode);
    if (!validSchoolId(schoolId)) throw new Error('Enter a valid School ID.');
    const snapshot = await getDoc(doc(db, 'schools', schoolId));
    if (!snapshot.exists() || snapshot.data().status !== 'active') {
        throw new Error('School ID not recognized or the school is inactive.');
    }
    const school = snapshot.data();
    const logoURL = [
        school.logoURL,
        school.logoUrl,
        school.logo,
        school.branding?.logoURL,
        school.branding?.logoUrl
    ].find(value => typeof value === 'string' && value.trim()) || '';
    return {
        id: schoolId,
        schoolName: school.name || school.schoolName || schoolId,
        logoURL
    };
}

async function getMembership(schoolId, uid) {
    const snapshot = await getDoc(memberPath(schoolId, uid));
    if (!snapshot.exists()) return null;
    const member = snapshot.data();
    return member.status === 'active' ? { uid, ...member } : null;
}

async function updateProfile(schoolId, uid, profile) {
    const safeProfile = {
        fullName: String(profile.fullName || '').trim(),
        contactEmail: String(profile.contactEmail || '').trim(),
        phone: String(profile.phone || '').trim(),
        notificationPreferences: profile.notificationPreferences || {},
        photoURL: profile.photoURL || '',
        updatedAt: serverTimestamp()
    };
    await updateDoc(memberPath(schoolId, uid), safeProfile);
    return safeProfile;
}

async function listMembers(schoolId) {
    const snapshot = await getDocs(collection(db, 'schools', schoolId, 'members'));
    return snapshot.docs.map(item => ({ uid: item.id, ...item.data() }));
}

async function uploadProfilePhoto(schoolId, uid, file) {
    const imageRef = ref(storage, `schools/${schoolId}/members/${uid}/profile/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
    await uploadBytes(imageRef, file, { contentType: file.type });
    return getDownloadURL(imageRef);
}

async function uploadMemberPhoto(schoolId, uid, file) {
    const imageRef = ref(storage, `schools/${schoolId}/members/${uid}/profile/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
    await uploadBytes(imageRef, file, { contentType: file.type });
    return getDownloadURL(imageRef);
}

async function uploadStudentPhoto(schoolId, studentId, dataUrl) {
    const blob = await (await fetch(dataUrl)).blob();
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(blob.type)) {
        throw new Error('Student photos must be JPEG, PNG, or WebP images.');
    }
    const extension = blob.type.split('/')[1];
    const imageRef = ref(storage, `schools/${schoolId}/students/${encodeURIComponent(studentId)}/photo.${extension}`);
    await uploadBytes(imageRef, blob, { contentType: blob.type });
    return getDownloadURL(imageRef);
}

async function uploadSchoolAsset(schoolId, collectionName, recordId, fieldPath, dataUrl) {
    const blob = await (await fetch(dataUrl)).blob();
    if (!blob.type || blob.size > 20 * 1024 * 1024) {
        throw new Error('Record attachments must have a content type and be smaller than 20 MB.');
    }
    const contentType = blob.type.split(';', 1)[0].trim().toLowerCase();
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(contentType)) {
        throw new Error('Record attachments must be JPEG, PNG, WebP, or SVG images.');
    }
    const safe = value => encodeURIComponent(String(value)).replace(/%/g, '_');
    const extensionByType = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/svg+xml': 'svg'
    };
    const extension = extensionByType[contentType];
    const imageRef = ref(storage, `schools/${schoolId}/schoolAssets/${safe(collectionName)}/${safe(recordId)}/${safe(fieldPath)}.${extension}`);
    await uploadBytes(imageRef, new Blob([blob], { type: contentType }), { contentType });
    return getDownloadURL(imageRef);
}

async function signIn(schoolCode, email, password, verifiedSchool) {
    const schoolId = normalizeSchoolId(schoolCode);
    const school = verifiedSchool?.id === schoolId ? verifiedSchool : await getSchool(schoolId);
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const membership = await getMembership(school.id, credential.user.uid);
    if (!membership) {
        await signOut(auth);
        throw new Error('This account does not have active access to this school.');
    }
    return { school, user: credential.user, membership };
}

async function signOutCurrentUser(schoolId) {
    const user = auth.currentUser;
    const savedToken = schoolId && user
        ? localStorage.getItem(pushTokenStorageKey(schoolId, user.uid))
        : null;
    if (schoolId && user && savedToken) {
        void removePushToken({ schoolId, token: savedToken })
            .then(() => localStorage.removeItem(pushTokenStorageKey(schoolId, user.uid)))
            .catch(error => console.warn('This device push token could not be removed.', error));
    }
    if ('Notification' in window && Notification.permission === 'granted' && webPushVapidKey) {
        void isSupported().then(supported => {
            if (supported) return deleteToken(getMessaging(app));
        }).catch(error => console.warn('This device push token could not be deleted.', error));
    }
    await signOut(auth);
}

async function changeOwnPassword(schoolId, currentPassword, newPassword) {
    const user = auth.currentUser;
    if (!user?.email) throw new Error('Sign in again before changing your password.');
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await user.getIdToken(true);
    await completeOwnPasswordChange({ schoolId, password: newPassword });
}

const createSchoolUser = httpsCallable(functions, 'createSchoolUser');
const getAssignableSchoolPermissions = httpsCallable(functions, 'getAssignableSchoolPermissions');
const getAssignableNoticeRecipients = httpsCallable(functions, 'getAssignableNoticeRecipients');
const updateSchoolUser = httpsCallable(functions, 'updateSchoolUser');
const generateSchoolUserPasswordResetLink = httpsCallable(functions, 'generateSchoolUserPasswordResetLink');
const setSchoolUserStatus = httpsCallable(functions, 'setSchoolUserStatus');
const deleteSchoolUser = httpsCallable(functions, 'deleteSchoolUser');
const setSchoolUserTemporaryPassword = httpsCallable(functions, 'setSchoolUserTemporaryPassword');
const completeOwnPasswordChange = httpsCallable(functions, 'completeOwnPasswordChange');
const getPublicPlatformStats = httpsCallable(functions, 'getPublicPlatformStats');
const getLinkedSchoolRecords = httpsCallable(functions, 'getLinkedSchoolRecords');
const getParentPortalDashboardSummary = httpsCallable(functions, 'getParentPortalDashboardSummary');
const savePushToken = httpsCallable(functions, 'savePushToken');
const removePushToken = httpsCallable(functions, 'removePushToken');
let foregroundMessagingListenerRegistered = false;

function pushTokenStorageKey(schoolId, uid) {
    return `schoolPushToken:${encodeURIComponent(schoolId)}:${encodeURIComponent(uid)}`;
}

function subscribeToNotifications(schoolId, onNotifications, onError) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Sign in to view notifications.');
    const notifications = query(
        collection(db, 'schools', schoolId, 'members', uid, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(100)
    );
    return onSnapshot(notifications, snapshot => {
        onNotifications(snapshot.docs.map(item => {
            const data = item.data();
            return {
                id: item.id,
                ...data,
                createdAt: typeof data.createdAt?.toDate === 'function'
                    ? data.createdAt.toDate().toISOString()
                    : ''
            };
        }));
    }, onError);
}

async function markNotificationsRead(schoolId, notificationIds) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Sign in to update notifications.');
    const ids = [...new Set(notificationIds.filter(id => typeof id === 'string' && id))].slice(0, 100);
    if (!ids.length) return;
    const batch = writeBatch(db);
    ids.forEach(id => batch.update(
        doc(db, 'schools', schoolId, 'members', uid, 'notifications', id),
        { read: true, readAt: serverTimestamp() }
    ));
    await batch.commit();
}

async function enablePushNotifications(schoolId) {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        throw new Error('Push notifications are not supported by this browser.');
    }
    if (!webPushVapidKey) {
        throw new Error('Push notifications are not configured yet. Ask your administrator to add the Firebase Web Push key.');
    }
    if (!await isSupported()) throw new Error('Firebase push notifications are not supported by this browser.');

    const permission = Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Allow notifications in your browser settings to receive school updates.');

    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    const messagingClient = getMessaging(app);
    const token = await getToken(messagingClient, {
        vapidKey: webPushVapidKey,
        serviceWorkerRegistration
    });
    if (!token) throw new Error('Firebase did not return a device notification token.');
    await savePushToken({ schoolId, token });
    const uid = auth.currentUser?.uid;
    if (uid) localStorage.setItem(pushTokenStorageKey(schoolId, uid), token);

    if (!foregroundMessagingListenerRegistered) {
        foregroundMessagingListenerRegistered = true;
        onMessage(messagingClient, payload => {
            window.dispatchEvent(new CustomEvent('school-portal-push-message', {
                detail: payload.data || {}
            }));
        });
    }
    return token;
}

async function disablePushNotifications(schoolId) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Sign in to manage notifications.');
    const storageKey = pushTokenStorageKey(schoolId, uid);
    const savedToken = localStorage.getItem(storageKey);
    if (savedToken) await removePushToken({ schoolId, token: savedToken });

    if ('Notification' in window && 'serviceWorker' in navigator
        && Notification.permission === 'granted' && await isSupported()) {
        const serviceWorkerRegistration = await navigator.serviceWorker.ready;
        const messagingClient = getMessaging(app);
        const token = await getToken(messagingClient, {
            vapidKey: webPushVapidKey,
            serviceWorkerRegistration
        });
        if (token && token !== savedToken) await removePushToken({ schoolId, token });
        await deleteToken(messagingClient);
    }
    localStorage.removeItem(storageKey);
}

window.schoolPortalFirebase = {
    app,
    auth,
    db,
    storage,
    authReady,
    getSchool,
    getMembership,
    listMembers,
    subscribeToNotifications,
    markNotificationsRead,
    updateProfile,
    uploadProfilePhoto,
    uploadMemberPhoto,
    uploadStudentPhoto,
    uploadSchoolAsset,
    signIn,
    signOut: signOutCurrentUser,
    changeOwnPassword,
    enablePushNotifications,
    disablePushNotifications,
    getAssignableSchoolClasses: listAssignableSchoolClasses,
    getAssignableSchoolRecords: listAssignableSchoolRecords,
    getAssignableNoticeRecipients: async schoolId =>
        (await getAssignableNoticeRecipients({ schoolId: normalizeSchoolId(schoolId) })).data,
    getLinkedSchoolRecords: async (schoolId, collectionName) =>
        (await getLinkedSchoolRecords({ schoolId, collectionName })).data.records,
    getParentPortalDashboardSummary: async schoolId =>
        (await getParentPortalDashboardSummary({ schoolId })).data,
    createSchoolUser,
    getAssignableSchoolPermissions: async schoolId => (await getAssignableSchoolPermissions({ schoolId })).data,
    updateSchoolUser,
    generateSchoolUserPasswordResetLink,
    setSchoolUserStatus,
    deleteSchoolUser,
    setSchoolUserTemporaryPassword,
    getPublicPlatformStats: async () => (await getPublicPlatformStats()).data
};

await import('./firebase-data.js');
window.dispatchEvent(new CustomEvent('school-portal-firebase-ready'));
