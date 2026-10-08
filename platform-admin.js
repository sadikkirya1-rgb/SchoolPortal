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
const call = name => httpsCallable(functions, name);
const createSchool = call('createSchool');
const listPlatformSchools = call('listPlatformSchools');
const listPlatformSchoolAccounts = call('listPlatformSchoolAccounts');
const setPlatformSchoolStatus = call('setPlatformSchoolStatus');
const createSchoolUser = call('createSchoolUser');
const updateSchoolUser = call('updateSchoolUser');
const setSchoolUserStatus = call('setSchoolUserStatus');
const deleteSchoolUser = call('deleteSchoolUser');
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
const schoolTableBody = document.getElementById('schoolTableBody');
const accountTableBody = document.getElementById('accountTableBody');
const schoolAccountsSection = document.getElementById('schoolAccountsSection');
const accountForm = document.getElementById('schoolAccountForm');
const accountMessage = document.getElementById('accountMessage');
const schoolAdminLoginLink = document.getElementById('schoolAdminLoginLink');

let schools = [];
let accounts = [];
let selectedSchool = null;
let schoolAfterId = null;
let accountAfterUid = null;
let schoolPageCursor = null;
let accountPageCursor = null;
let schoolCursorHistory = [];
let accountCursorHistory = [];
let accountEditUid = null;
let schoolCount = 0;
let accountCount = 0;

const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
}[character]));

function setBusy(form, busy, buttonText) {
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    button.disabled = busy;
    button.dataset.originalText ||= button.textContent;
    button.textContent = busy ? buttonText : button.dataset.originalText;
}

function showError(target, error, fallback) {
    console.error(fallback, error);
    target.textContent = error.message || fallback;
}

function renderSchools() {
    const term = document.getElementById('schoolSearch').value.trim().toLowerCase();
    const visibleSchools = schools.filter(school =>
        `${school.name} ${school.id} ${school.countryCode} ${school.status}`.toLowerCase().includes(term)
    );
    schoolTableBody.innerHTML = visibleSchools.length ? visibleSchools.map(school => `
        <tr>
            <td><div class="school-name-cell">${school.logoURL
                ? `<img src="${escapeHTML(school.logoURL)}" alt="" loading="lazy">`
                : '<span class="school-logo-fallback" aria-hidden="true">SCH</span>'}
                <strong>${escapeHTML(school.name)}</strong></div></td>
            <td><code>${escapeHTML(school.id)}</code></td>
            <td><span class="status-pill ${escapeHTML(school.status)}">${escapeHTML(school.status)}</span></td>
            <td>${school.memberCount}</td>
            <td>${escapeHTML(school.createdAt ? new Date(school.createdAt).toLocaleDateString() : '—')}</td>
            <td><div class="table-actions">
                <button class="table-action" type="button" data-school-action="accounts" data-school-id="${escapeHTML(school.id)}">Accounts</button>
                <button class="table-action ${school.status === 'active' ? 'danger' : ''}" type="button" data-school-action="status" data-school-id="${escapeHTML(school.id)}" data-status="${school.status === 'active' ? 'suspended' : 'active'}">${school.status === 'active' ? 'Suspend' : 'Activate'}</button>
            </div></td>
        </tr>`).join('') : '<tr><td colspan="6">No schools match this search.</td></tr>';
    document.getElementById('schoolTotal').textContent = String(schoolCount);
    document.getElementById('activeSchoolTotal').textContent = String(schools.filter(school => school.status === 'active').length);
    document.getElementById('nextSchoolsButton').disabled = !schoolAfterId;
    document.getElementById('previousSchoolsButton').disabled = schoolCursorHistory.length === 0;
}

async function loadSchools(afterSchoolId = schoolPageCursor) {
    schoolTableBody.innerHTML = '<tr><td colspan="6">Loading schools…</td></tr>';
    const response = await listPlatformSchools({ afterSchoolId: afterSchoolId || '' });
    schoolPageCursor = afterSchoolId || null;
    schools = response.data.schools;
    schoolAfterId = response.data.nextAfterSchoolId;
    schoolCount = response.data.totalCount;
    renderSchools();
}

function renderAccounts() {
    const term = document.getElementById('accountSearch').value.trim().toLowerCase();
    const visibleAccounts = accounts.filter(account =>
        `${account.fullName} ${account.email} ${account.role} ${account.userId} ${account.status}`.toLowerCase().includes(term)
    );
    accountTableBody.innerHTML = visibleAccounts.length ? visibleAccounts.map(account => `
        <tr>
            <td><strong>${escapeHTML(account.fullName || 'Unnamed account')}</strong><small class="sub-cell">${escapeHTML(account.uid)}</small></td>
            <td>${escapeHTML(account.email || '—')}</td>
            <td>${escapeHTML(account.role)}</td>
            <td>${escapeHTML(account.userId || '—')}</td>
            <td><span class="status-pill ${escapeHTML(account.status)}">${escapeHTML(account.status)}</span></td>
            <td><div class="table-actions">
                <button class="table-action" type="button" data-account-action="edit" data-uid="${escapeHTML(account.uid)}">Edit</button>
                <button class="table-action ${account.status === 'active' ? 'danger' : ''}" type="button" data-account-action="status" data-uid="${escapeHTML(account.uid)}" data-status="${account.status === 'active' ? 'disabled' : 'active'}">${account.status === 'active' ? 'Suspend' : 'Activate'}</button>
                <button class="table-action danger" type="button" data-account-action="delete" data-uid="${escapeHTML(account.uid)}">Delete</button>
            </div></td>
        </tr>`).join('') : '<tr><td colspan="6">No accounts match this search.</td></tr>';
    document.getElementById('accountTotal').textContent = String(accountCount);
    document.getElementById('nextAccountsButton').disabled = !accountAfterUid;
    document.getElementById('previousAccountsButton').disabled = accountCursorHistory.length === 0;
}

async function loadAccounts(afterUid = accountPageCursor) {
    if (!selectedSchool) return;
    accountTableBody.innerHTML = '<tr><td colspan="6">Loading school accounts…</td></tr>';
    const response = await listPlatformSchoolAccounts({
        schoolId: selectedSchool.id,
        afterUid: afterUid || ''
    });
    accountPageCursor = afterUid || null;
    accounts = response.data.accounts;
    accountAfterUid = response.data.nextAfterUid;
    accountCount = response.data.totalCount;
    renderAccounts();
}

function openSchoolAccounts(school) {
    selectedSchool = school;
    accountCursorHistory = [];
    accountPageCursor = null;
    accountAfterUid = null;
    accounts = [];
    accountForm.classList.add('hidden');
    schoolAdminLoginLink.classList.add('hidden');
    schoolAdminLoginLink.removeAttribute('href');
    accountMessage.textContent = '';
    accountEditUid = null;
    schoolAccountsSection.classList.remove('hidden');
    document.getElementById('selectedSchoolHeading').textContent = `${school.name} accounts`;
    document.getElementById('selectedSchoolSummary').textContent = `School ID: ${school.id} · ${school.status}`;
    schoolAccountsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    loadAccounts().catch(error => showError(accountMessage, error, 'Unable to load school accounts.'));
}

function resetAccountForm() {
    accountForm.reset();
    accountEditUid = null;
    accountForm.elements.uid.value = '';
    accountForm.elements.role.disabled = false;
    accountForm.elements.linkedRecordId.readOnly = false;
    accountForm.elements.password.required = true;
    document.getElementById('accountPasswordHint').textContent = 'Required for a new account; minimum 8 characters.';
    accountForm.querySelector('button[type="submit"]').textContent = 'Create account';
    accountForm.classList.add('hidden');
}

function editAccount(account) {
    accountEditUid = account.uid;
    accountForm.elements.uid.value = account.uid;
    accountForm.elements.fullName.value = account.fullName;
    accountForm.elements.userId.value = account.userId;
    accountForm.elements.email.value = account.email;
    accountForm.elements.phone.value = account.phone;
    accountForm.elements.role.value = account.role;
    accountForm.elements.role.disabled = true;
    accountForm.elements.linkedRecordId.value = account.linkedRecordId;
    accountForm.elements.linkedRecordId.readOnly = true;
    accountForm.elements.password.value = '';
    accountForm.elements.password.required = false;
    document.getElementById('accountPasswordHint').textContent = 'Leave blank to keep the current password.';
    accountForm.querySelector('button[type="submit"]').textContent = 'Save account changes';
    accountForm.classList.remove('hidden');
    accountForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    try {
        await loadSchools();
    } catch (error) {
        showError(document.getElementById('createMessage'), error, 'Unable to load registered schools.');
    }
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

document.getElementById('showCreateSchoolButton').addEventListener('click', () => {
    createForm.classList.toggle('hidden');
    createForm.elements.name.focus();
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
        await loadSchools();
        const school = schools.find(item => item.id === response.data.schoolId) || {
            id: response.data.schoolId,
            name: response.data.name,
            status: 'active'
        };
        openSchoolAccounts(school);
        resetAccountForm();
        accountForm.elements.role.value = 'schoolAdmin';
        accountForm.classList.remove('hidden');
        accountForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        accountForm.elements.fullName.focus();
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

schoolTableBody.addEventListener('click', async event => {
    const button = event.target.closest('button[data-school-action]');
    if (!button) return;
    const school = schools.find(item => item.id === button.dataset.schoolId);
    if (!school) return;
    if (button.dataset.schoolAction === 'accounts') {
        openSchoolAccounts(school);
        return;
    }
    const nextStatus = button.dataset.status;
    if (!confirm(`${nextStatus === 'suspended' ? 'Suspend' : 'Reactivate'} ${school.name}?`)) return;
    button.disabled = true;
    try {
        await setPlatformSchoolStatus({ schoolId: school.id, status: nextStatus });
        await loadSchools(schoolPageCursor);
        if (selectedSchool?.id === school.id) {
            selectedSchool = { ...selectedSchool, status: nextStatus };
            document.getElementById('selectedSchoolSummary').textContent = `School ID: ${school.id} · ${nextStatus}`;
        }
    } catch (error) {
        showError(createMessage, error, 'Unable to update school status.');
    }
});

document.getElementById('schoolSearch').addEventListener('input', renderSchools);
document.getElementById('previousSchoolsButton').addEventListener('click', async () => {
    const previous = schoolCursorHistory.pop() || null;
    try {
        await loadSchools(previous);
    } catch (error) {
        showError(createMessage, error, 'Unable to load the previous school page.');
    }
});
document.getElementById('nextSchoolsButton').addEventListener('click', async () => {
    if (!schoolAfterId) return;
    schoolCursorHistory.push(schoolPageCursor || '');
    try {
        await loadSchools(schoolAfterId);
    } catch (error) {
        schoolCursorHistory.pop();
        showError(createMessage, error, 'Unable to load the next school page.');
    }
});

document.getElementById('closeSchoolAccountsButton').addEventListener('click', () => {
    schoolAccountsSection.classList.add('hidden');
    selectedSchool = null;
});

document.getElementById('showAccountFormButton').addEventListener('click', () => {
    resetAccountForm();
    accountForm.classList.remove('hidden');
    accountForm.elements.fullName.focus();
});
document.getElementById('cancelAccountEditButton').addEventListener('click', resetAccountForm);
document.getElementById('accountSearch').addEventListener('input', renderAccounts);

accountForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!selectedSchool) return;
    setBusy(accountForm, true, accountEditUid ? 'Saving…' : 'Creating…');
    accountMessage.textContent = '';
    const data = new FormData(accountForm);
    const account = {
        schoolId: selectedSchool.id,
        uid: accountEditUid,
        fullName: data.get('fullName').trim(),
        userId: data.get('userId').trim().toLowerCase(),
        email: data.get('email').trim().toLowerCase(),
        phone: data.get('phone').trim(),
        role: data.get('role'),
        linkedRecordId: data.get('linkedRecordId').trim(),
        password: data.get('password')
    };
    try {
        if (accountEditUid) await updateSchoolUser(account);
        else await createSchoolUser(account);
        if (!accountEditUid && account.role === 'schoolAdmin') {
            schoolAdminLoginLink.href = `./index.html?schoolId=${encodeURIComponent(selectedSchool.id)}`;
            schoolAdminLoginLink.classList.remove('hidden');
            accountMessage.textContent = 'School administrator account created. Continue to school sign-in to open the main dashboard.';
        }
        resetAccountForm();
        await loadAccounts(accountPageCursor);
    } catch (error) {
        showError(accountMessage, error, 'Unable to save the school account.');
    } finally {
        setBusy(accountForm, false);
    }
});

accountTableBody.addEventListener('click', async event => {
    const button = event.target.closest('button[data-account-action]');
    if (!button || !selectedSchool) return;
    const account = accounts.find(item => item.uid === button.dataset.uid);
    if (!account) return;
    if (button.dataset.accountAction === 'edit') {
        editAccount(account);
        return;
    }
    button.disabled = true;
    try {
        if (button.dataset.accountAction === 'status') {
            const status = button.dataset.status;
            if (!confirm(`${status === 'disabled' ? 'Suspend' : 'Reactivate'} ${account.fullName || account.email}?`)) return;
            await setSchoolUserStatus({ schoolId: selectedSchool.id, uid: account.uid, status: status === 'active' });
        } else if (button.dataset.accountAction === 'delete') {
            if (!confirm(`Permanently delete ${account.fullName || account.email}'s account? This cannot be undone.`)) return;
            await deleteSchoolUser({ schoolId: selectedSchool.id, uid: account.uid });
        }
        await loadAccounts(accountPageCursor);
        await loadSchools(schoolPageCursor);
    } catch (error) {
        showError(accountMessage, error, 'Unable to update the school account.');
    } finally {
        button.disabled = false;
    }
});

document.getElementById('previousAccountsButton').addEventListener('click', async () => {
    const previous = accountCursorHistory.pop() || null;
    try {
        await loadAccounts(previous);
    } catch (error) {
        showError(accountMessage, error, 'Unable to load the previous account page.');
    }
});
document.getElementById('nextAccountsButton').addEventListener('click', async () => {
    if (!accountAfterUid) return;
    accountCursorHistory.push(accountPageCursor || '');
    const nextPageCursor = accountAfterUid;
    try {
        await loadAccounts(nextPageCursor);
    } catch (error) {
        accountCursorHistory.pop();
        showError(accountMessage, error, 'Unable to load the next account page.');
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
