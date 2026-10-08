import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {
    browserLocalPersistence,
    getAuth,
    onAuthStateChanged,
    setPersistence,
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
    memoryLocalCache,
    serverTimestamp,
    updateDoc
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js';

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
const auth = getAuth(app);
let db;
try {
    db = initializeFirestore(app, { localCache: memoryLocalCache() });
} catch (error) {
    console.warn('Firestore memory cache initialization failed; using the default cache.', error);
    db = getFirestore(app);
}

const functions = getFunctions(app);
const storage = getStorage(app);
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

async function signIn(schoolCode, email, password) {
    const school = await getSchool(schoolCode);
    await setPersistence(auth, browserLocalPersistence);
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const membership = await getMembership(school.id, credential.user.uid);
    if (!membership) {
        await signOut(auth);
        throw new Error('This account does not have active access to this school.');
    }
    return { school, user: credential.user, membership };
}

async function signOutCurrentUser() {
    await signOut(auth);
}

const createSchoolUser = httpsCallable(functions, 'createSchoolUser');
const updateSchoolUser = httpsCallable(functions, 'updateSchoolUser');
const setSchoolUserStatus = httpsCallable(functions, 'setSchoolUserStatus');
const deleteSchoolUser = httpsCallable(functions, 'deleteSchoolUser');
const getPublicPlatformStats = httpsCallable(functions, 'getPublicPlatformStats');

window.schoolPortalFirebase = {
    app,
    auth,
    db,
    storage,
    authReady,
    getSchool,
    getMembership,
    listMembers,
    updateProfile,
    uploadProfilePhoto,
    uploadMemberPhoto,
    signIn,
    signOut: signOutCurrentUser,
    createSchoolUser,
    updateSchoolUser,
    setSchoolUserStatus,
    deleteSchoolUser,
    getPublicPlatformStats: async () => (await getPublicPlatformStats()).data
};

await import('./firebase-data.js');
window.dispatchEvent(new CustomEvent('school-portal-firebase-ready'));
