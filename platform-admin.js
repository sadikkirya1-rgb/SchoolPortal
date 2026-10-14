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
const setSchoolUserTemporaryPassword = call('setSchoolUserTemporaryPassword');
const deleteSchoolUser = call('deleteSchoolUser');
const getAssignableSchoolClasses = call('getAssignableSchoolClasses');
const getAssignableSchoolRecords = call('getAssignableSchoolRecords');
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
const accountInvitationPanel = document.getElementById('accountInvitationPanel');
const accountInvitationLink = document.getElementById('accountInvitationLink');
const passwordResetDialog = document.getElementById('passwordResetDialog');
const passwordResetForm = document.getElementById('passwordResetForm');
const passwordResetInput = document.getElementById('passwordResetInput');
const passwordResetTitle = document.getElementById('passwordResetTitle');
const passwordResetDescription = document.getElementById('passwordResetDescription');
const passwordResetMessage = document.getElementById('passwordResetMessage');

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
let selectedSchoolClasses = [];
let passwordResetAccount = null;
let linkedRecordRequest = 0;
const selectedSchoolRecords = new Map();

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

function renderAssignedClassOptions(selectedClassIds = []) {
    const role = accountForm.elements.role.value;
    const assignments = document.getElementById('adminClassAssignments');
    const list = document.getElementById('adminClassAssignmentsList');
    const allowedRole = ['teacher', 'deputyHeadTeacher'].includes(role);
    assignments.classList.toggle('hidden', !allowedRole);
    if (!allowedRole) return;
    list.replaceChildren();
    if (!selectedSchoolClasses.length) {
        list.textContent = 'No classes are available in this school yet.';
        return;
    }
    const selected = new Set(selectedClassIds);
    selectedSchoolClasses.forEach(item => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'assignedClassIds';
        checkbox.value = item.id;
        checkbox.checked = selected.has(item.id);
        const name = document.createElement('span');
        name.textContent = `${item.name} (${item.id})`;
        label.append(checkbox, name);
        list.appendChild(label);
    });
}

async function renderLinkedRecordOptions(role, selectedId = '') {
    const requestId = ++linkedRecordRequest;
    const select = accountForm.elements.linkedRecordId;
    const manualInput = accountForm.elements.manualLinkedRecordId;
    const help = document.getElementById('adminLinkedRecordHelp');
    const field = select.closest('.account-linked-record');
    const recordType = ['student', 'parent'].includes(role) ? 'students' : role === 'schoolAdmin' ? '' : 'staff';
    const required = ['student', 'parent'].includes(role);
    field.classList.toggle('hidden', !recordType);
    select.required = required;
    select.disabled = !recordType || Boolean(accountEditUid);
    if (!recordType) {
        select.replaceChildren(new Option('Not applicable', ''));
        manualInput.classList.add('hidden');
        manualInput.required = false;
        manualInput.value = '';
        help.textContent = 'School administrators do not need a linked record.';
        return;
    }
    select.replaceChildren(new Option('Loading records…', ''));
    help.textContent = required
        ? 'Select the student record this account belongs to.'
        : 'Select the matching staff record, if one exists.';
    const schoolId = selectedSchool.id;
    const cacheKey = `${schoolId}:${recordType}`;
    if (!selectedSchoolRecords.has(cacheKey)) {
        const response = await getAssignableSchoolRecords({
            schoolId,
            recordType
        });
        selectedSchoolRecords.set(cacheKey, response.data);
    }
    if (requestId !== linkedRecordRequest || selectedSchool?.id !== schoolId) return;
    const records = selectedSchoolRecords.get(cacheKey);
    select.replaceChildren(new Option(required ? 'Select a record…' : 'No linked record', ''));
    records.forEach(record => {
        const details = [
            record.department ? `Department: ${record.department}` : '',
            record.group ? `Class/Section: ${record.group}` : ''
        ].filter(Boolean);
        select.add(new Option(
            `${record.displayId || record.id}${record.displayId && record.displayId !== record.id ? ` (record key: ${record.id})` : ''} — ${record.name}${details.length ? ` — ${details.join(' — ')}` : ''}`,
            record.id
        ));
    });
    if (recordType === 'staff') {
        select.add(new Option('Enter staff record ID manually…', '__manual__'));
    }
    if (selectedId && !records.some(record => record.id === selectedId)) {
        select.add(new Option(`${selectedId} — linked record unavailable`, selectedId));
    }
    select.value = selectedId;
    manualInput.classList.toggle('hidden', select.value !== '__manual__');
    manualInput.required = select.value === '__manual__';
    if (!records.length) {
        help.textContent = required
            ? 'No student records are available. Add a student record before creating this account.'
            : 'No staff records are available. Choose manual entry to add a staff record ID, or leave it unlinked.';
    }
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
                   <button class="table-action" type="button" data-account-action="reset-password" data-uid="${escapeHTML(account.uid)}" ${account.status !== 'active' ? 'disabled' : ''}>Set temporary password</button>
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
    selectedSchoolClasses = [];
    selectedSchoolRecords.clear();
    accountCursorHistory = [];
    accountPageCursor = null;
    accountAfterUid = null;
    accounts = [];
    accountForm.classList.add('hidden');
    schoolAdminLoginLink.classList.add('hidden');
    schoolAdminLoginLink.removeAttribute('href');
    accountInvitationPanel.classList.add('hidden');
    accountInvitationLink.value = '';
    accountMessage.textContent = '';
    accountEditUid = null;
    schoolAccountsSection.classList.remove('hidden');
    document.getElementById('selectedSchoolHeading').textContent = `${school.name} accounts`;
    document.getElementById('selectedSchoolSummary').textContent = `School ID: ${school.id} · ${school.status}`;
    schoolAccountsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    loadAccounts().catch(error => showError(accountMessage, error, 'Unable to load school accounts.'));
    getAssignableSchoolClasses({ schoolId: school.id }).then(response => {
        selectedSchoolClasses = response.data;
        renderAssignedClassOptions();
    }).catch(error => showError(accountMessage, error, 'Unable to load assignable classes.'));
}

function resetAccountForm() {
    accountForm.reset();
    accountEditUid = null;
    accountForm.elements.uid.value = '';
    accountForm.elements.role.disabled = false;
    accountForm.elements.linkedRecordId.disabled = false;
    accountForm.elements.manualLinkedRecordId.value = '';
    accountForm.elements.manualLinkedRecordId.required = false;
    accountForm.elements.manualLinkedRecordId.classList.add('hidden');
    accountForm.elements.temporaryPassword.required = true;
    accountForm.querySelector('.account-temporary-password').classList.remove('hidden');
    accountForm.querySelector('button[type="submit"]').textContent = 'Create account';
    accountForm.classList.add('hidden');
    accountInvitationPanel.classList.add('hidden');
    accountInvitationLink.value = '';
}

async function editAccount(account) {
    accountEditUid = account.uid;
    accountForm.elements.uid.value = account.uid;
    accountForm.elements.fullName.value = account.fullName;
    accountForm.elements.userId.value = account.userId;
    accountForm.elements.email.value = account.email;
    accountForm.elements.phone.value = account.phone;
    accountForm.elements.role.value = account.role;
    accountForm.elements.role.disabled = true;
    await renderLinkedRecordOptions(account.role, account.linkedRecordId);
    accountForm.elements.temporaryPassword.required = false;
    accountForm.querySelector('.account-temporary-password').classList.add('hidden');
    renderAssignedClassOptions(account.assignedClassIds || []);
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
        await signInWithEmailAndPassword(auth, data.get('email').trim(), data.get('password'));
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
        void renderLinkedRecordOptions('schoolAdmin');
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
    selectedSchoolRecords.clear();
    renderAssignedClassOptions();
    void renderLinkedRecordOptions(accountForm.elements.role.value).catch(error => {
        showError(accountMessage, error, 'Unable to load linked records.');
    });
    accountForm.classList.remove('hidden');
    accountForm.elements.fullName.focus();
});
document.getElementById('cancelAccountEditButton').addEventListener('click', resetAccountForm);
accountForm.elements.role.addEventListener('change', () => {
    renderAssignedClassOptions();
    void renderLinkedRecordOptions(accountForm.elements.role.value).catch(error => {
        showError(accountMessage, error, 'Unable to load linked records.');
    });
});
accountForm.elements.linkedRecordId.addEventListener('change', () => {
    const manualMode = accountForm.elements.linkedRecordId.value === '__manual__';
    const manualInput = accountForm.elements.manualLinkedRecordId;
    manualInput.classList.toggle('hidden', !manualMode);
    manualInput.required = manualMode;
    if (!manualMode) manualInput.value = '';
    document.getElementById('adminLinkedRecordHelp').textContent = manualMode
        ? 'Enter the staff record ID. This does not create a staff profile; it only stores the ID on this account.'
        : 'Choose an existing record or leave the staff account unlinked.';
});
document.getElementById('accountSearch').addEventListener('input', renderAccounts);

accountForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!selectedSchool) return;
    const data = new FormData(accountForm);
    const temporaryPassword = accountEditUid ? '' : String(data.get('temporaryPassword') || '');
    if (!accountEditUid && (temporaryPassword.length < 8 || temporaryPassword.length > 128)) {
        accountMessage.textContent = 'Temporary passwords must be between 8 and 128 characters. Letters or numbers alone are accepted.';
        return;
    }
    setBusy(accountForm, true, accountEditUid ? 'Saving…' : 'Creating…');
    accountMessage.textContent = '';
    const linkedRecordId = accountForm.elements.linkedRecordId.value === '__manual__'
        ? accountForm.elements.manualLinkedRecordId.value.trim()
        : accountForm.elements.linkedRecordId.value.trim();
    if (accountForm.elements.linkedRecordId.value === '__manual__' && !linkedRecordId) {
        accountMessage.textContent = 'Enter the staff record ID or choose an existing record.';
        return;
    }
    const account = {
        schoolId: selectedSchool.id,
        uid: accountEditUid,
        fullName: data.get('fullName').trim(),
        userId: data.get('userId').trim().toLowerCase(),
        email: data.get('email').trim().toLowerCase(),
        phone: data.get('phone').trim(),
        role: accountEditUid ? accountForm.elements.role.value : data.get('role'),
        linkedRecordId,
        assignedClassIds: ['teacher', 'deputyHeadTeacher'].includes(accountEditUid
            ? accountForm.elements.role.value
            : data.get('role'))
            ? data.getAll('assignedClassIds')
            : [],
        ...(!accountEditUid ? { temporaryPassword } : {})
    };
    try {
        if (accountEditUid) await updateSchoolUser(account);
        else await createSchoolUser(account);
        if (!accountEditUid && account.role === 'schoolAdmin') {
            schoolAdminLoginLink.href = `./index.html?schoolId=${encodeURIComponent(selectedSchool.id)}`;
            schoolAdminLoginLink.classList.remove('hidden');
            accountMessage.textContent = 'School administrator account created. Share the temporary password privately, then continue to school sign-in.';
        }
        resetAccountForm();
        if (!accountEditUid) {
            accountInvitationLink.value = temporaryPassword;
            accountInvitationPanel.classList.remove('hidden');
        }
        await loadAccounts(accountPageCursor);
    } catch (error) {
        showError(accountMessage, error, 'Unable to save the school account.');
    } finally {
        setBusy(accountForm, false);
    }
});

document.getElementById('copyAccountInvitation').addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(accountInvitationLink.value);
        document.getElementById('copyAccountInvitation').textContent = 'Copied';
    } catch (error) {
        console.error('Unable to copy the temporary password.', error);
        accountInvitationLink.focus();
        accountInvitationLink.select();
        showError(accountMessage, error, 'Select and copy the temporary password manually.');
    }
});

function closePasswordResetDialog() {
    passwordResetDialog.classList.add('hidden');
    passwordResetForm.reset();
    passwordResetMessage.textContent = '';
    passwordResetAccount = null;
}

document.getElementById('cancelPasswordReset').addEventListener('click', closePasswordResetDialog);

passwordResetForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!selectedSchool || !passwordResetAccount) return;
    const temporaryPassword = passwordResetInput.value;
    if (temporaryPassword.length < 8 || temporaryPassword.length > 128) {
        passwordResetMessage.textContent = 'Temporary passwords must be between 8 and 128 characters. Letters or numbers alone are accepted.';
        return;
    }
    setBusy(passwordResetForm, true, 'Setting…');
    passwordResetMessage.textContent = '';
    try {
        await setSchoolUserTemporaryPassword({
            schoolId: selectedSchool.id,
            uid: passwordResetAccount.uid,
            temporaryPassword
        });
        const accountName = passwordResetAccount.fullName || passwordResetAccount.email;
        closePasswordResetDialog();
        accountMessage.textContent = `Temporary password set for ${accountName}. Share it privately; they must change it at their next sign-in.`;
    } catch (error) {
        showError(passwordResetMessage, error, 'Unable to set a temporary password.');
    } finally {
        setBusy(passwordResetForm, false);
    }
});

accountTableBody.addEventListener('click', async event => {
    const button = event.target.closest('button[data-account-action]');
    if (!button || !selectedSchool) return;
    const account = accounts.find(item => item.uid === button.dataset.uid);
    if (!account) return;
    if (button.dataset.accountAction === 'edit') {
        editAccount(account).catch(error => showError(accountMessage, error, 'Unable to load linked records.'));
        return;
    }
    if (button.dataset.accountAction === 'reset-password') {
        passwordResetAccount = account;
        passwordResetTitle.textContent = `Set a temporary password for ${account.fullName || account.email}`;
        passwordResetDescription.textContent = 'Share the temporary password privately. The user must change it at their next sign-in.';
        passwordResetMessage.textContent = '';
        passwordResetForm.reset();
        passwordResetDialog.classList.remove('hidden');
        passwordResetInput.focus();
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
