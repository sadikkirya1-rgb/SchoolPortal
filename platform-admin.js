import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {
    browserSessionPersistence,
    getAuth,
    onAuthStateChanged,
    setPersistence,
    signInWithEmailAndPassword,
    signOut
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig, 'school-portal-app-admin');
const auth = getAuth(app);
const functions = getFunctions(app);
const createSchool = httpsCallable(functions, 'createSchool');
const signInForm = document.getElementById('adminSignInForm');
const signInCard = document.getElementById('signInCard');
const schoolCreateCard = document.getElementById('schoolCreateCard');
const signInMessage = document.getElementById('signInMessage');
const createMessage = document.getElementById('createMessage');
const createForm = document.getElementById('createSchoolForm');
const createdSchool = document.getElementById('createdSchool');
const schoolIdOutput = document.getElementById('createdSchoolId');
const schoolNameOutput = document.getElementById('createdSchoolName');
const copySchoolIdButton = document.getElementById('copySchoolIdButton');
const signOutButton = document.getElementById('signOutButton');
const signedInAs = document.getElementById('signedInAs');

function setBusy(form, busy, buttonText) {
    const button = form.querySelector('button[type="submit"]');
    button.disabled = busy;
    button.dataset.originalText ||= button.textContent;
    button.textContent = busy ? buttonText : button.dataset.originalText;
}

function showError(target, error, fallback) {
    console.error(fallback, error);
    target.textContent = error.message || fallback;
}

async function displayAdmin(user) {
    if (!user) {
        signInCard.classList.remove('hidden');
        schoolCreateCard.classList.add('hidden');
        return;
    }
    const token = await user.getIdTokenResult(true);
    if (token.claims.appAdmin !== true) {
        await signOut(auth);
        signInCard.classList.remove('hidden');
        schoolCreateCard.classList.add('hidden');
        signInMessage.textContent = 'This account is not authorized as an App Admin.';
        return;
    }
    signedInAs.textContent = `Signed in as ${user.email || 'authorized App Admin'}`;
    signInCard.classList.add('hidden');
    schoolCreateCard.classList.remove('hidden');
    signInMessage.textContent = '';
}

onAuthStateChanged(auth, user => {
    displayAdmin(user).catch(error => showError(signInMessage, error, 'Unable to verify App Admin access.'));
}, error => showError(signInMessage, error, 'Unable to restore App Admin sign-in.'));

signInForm.addEventListener('submit', async event => {
    event.preventDefault();
    setBusy(signInForm, true, 'Verifying…');
    signInMessage.textContent = '';
    const data = new FormData(signInForm);
    try {
        await setPersistence(auth, browserSessionPersistence);
        const credential = await signInWithEmailAndPassword(auth, data.get('email').trim(), data.get('password'));
        await displayAdmin(credential.user);
    } catch (error) {
        showError(signInMessage, error, 'Unable to sign in to App Admin.');
    } finally {
        setBusy(signInForm, false);
    }
});

createForm.addEventListener('submit', async event => {
    event.preventDefault();
    setBusy(createForm, true, 'Creating school…');
    createMessage.textContent = '';
    createdSchool.classList.add('hidden');
    const data = new FormData(createForm);
    try {
        const response = await createSchool({
            name: data.get('name').trim(),
            countryCode: data.get('countryCode').trim().toUpperCase(),
            logoURL: data.get('logoURL').trim()
        });
        schoolIdOutput.textContent = response.data.schoolId;
        schoolNameOutput.textContent = response.data.name;
        createdSchool.classList.remove('hidden');
        createForm.reset();
        createForm.elements.countryCode.value = 'UG';
    } catch (error) {
        showError(createMessage, error, 'Unable to create the school. Check your connection and try again.');
    } finally {
        setBusy(createForm, false);
    }
});

copySchoolIdButton.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(schoolIdOutput.textContent);
        copySchoolIdButton.textContent = 'Copied';
        setTimeout(() => { copySchoolIdButton.textContent = 'Copy School ID'; }, 1800);
    } catch (error) {
        showError(createMessage, error, 'Unable to copy the School ID. Select and copy it manually.');
    }
});

signOutButton.addEventListener('click', async () => {
    signOutButton.disabled = true;
    try {
        await signOut(auth);
    } catch (error) {
        showError(createMessage, error, 'Unable to sign out.');
    } finally {
        signOutButton.disabled = false;
    }
});
