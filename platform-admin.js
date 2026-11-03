import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {
    browserSessionPersistence,
    EmailAuthProvider,
    getAuth,
    multiFactor,
    onAuthStateChanged,
    PhoneAuthProvider,
    PhoneMultiFactorGenerator,
    reauthenticateWithCredential,
    RecaptchaVerifier,
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
const updatePlatformSchool = call('updatePlatformSchool');
const generateSchoolUserPasswordResetLink = call('generateSchoolUserPasswordResetLink');
const createSchoolUser = call('createSchoolUser');
const updateSchoolUser = call('updateSchoolUser');
const setSchoolUserStatus = call('setSchoolUserStatus');
const setSchoolUserTemporaryPassword = call('setSchoolUserTemporaryPassword');
const deleteSchoolUser = call('deleteSchoolUser');
const getAssignableSchoolClasses = call('getAssignableSchoolClasses');
const getAssignableSchoolRecords = call('getAssignableSchoolRecords');
const getPlatformAdminOverview = call('getPlatformAdminOverview');
const listPlatformAdminAudit = call('listPlatformAdminAudit');
const registerPlatformAdminSession = call('registerPlatformAdminSession');
const listPlatformAdminSessions = call('listPlatformAdminSessions');
const revokePlatformAdminSessions = call('revokePlatformAdminSessions');
const endPlatformAdminSession = call('endPlatformAdminSession');
const signInForm = document.getElementById('adminSignInForm');
const signInCard = document.getElementById('signInCard');
const schoolCreateCard = document.getElementById('schoolCreateCard');
const signInMessage = document.getElementById('signInMessage');
const createMessage = document.getElementById('createMessage');
const createForm = document.getElementById('createSchoolForm');
const schoolEditorForm = document.getElementById('schoolEditorForm');
const createdSchool = document.getElementById('createdSchool');
const schoolIdOutput = document.getElementById('createdSchoolId');
const schoolNameOutput = document.getElementById('createdSchoolName');
const copySchoolIdButton = document.getElementById('copySchoolIdButton');
const signOutButton = document.getElementById('signOutButton');
const signedInAs = document.getElementById('signedInAs');
const schoolTableBody = document.getElementById('schoolTableBody');
const schoolSearch = document.getElementById('schoolSearch');
const accountSearch = document.getElementById('accountSearch');
const schoolSearchSummary = document.getElementById('schoolSearchSummary');
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
const planChart = document.getElementById('planChart');
const accountSchoolSelect = document.getElementById('accountSchoolSelect');
const schoolStatusFilter = document.getElementById('schoolStatusFilter');
const schoolPlanFilter = document.getElementById('schoolPlanFilter');
const schoolSubscriptionFilter = document.getElementById('schoolSubscriptionFilter');
const publicHeading = document.querySelector('.admin-heading');
const returnLink = document.querySelector('.back-link');
const accountRoleFilter = document.getElementById('accountRoleFilter');
const accountStatusFilter = document.getElementById('accountStatusFilter');
const auditTableBody = document.getElementById('auditTableBody');
const sessionsTableBody = document.getElementById('sessionsTableBody');

let schools = [];
let accounts = [];
let selectedSchool = null;
let schoolAfterId = null;
let schoolNextPageOffset = null;
let schoolCurrentPageOffset = 0;
let accountAfterUid = null;
let accountNextPageOffset = null;
let accountCurrentPageOffset = 0;
let schoolPageCursor = null;
let accountPageCursor = null;
let schoolCursorHistory = [];
let accountCursorHistory = [];
let schoolPageSize = 25;
let accountPageSize = 25;
let accountEditUid = null;
let schoolCount = 0;
let schoolMatchCount = 0;
let activeSchoolCount = 0;
let accountCount = 0;
let platformOverview = null;
let schoolProfileRecord = null;
let adminSessionId = sessionStorage.getItem('appAdminSessionId');
let adminMfaVerifier = null;
let adminMfaVerificationId = '';
let adminSessionHeartbeat = null;
let selectedSchoolClasses = [];
let passwordResetAccount = null;
let lastCreatedAccount = null;
let linkedRecordRequest = 0;
const selectedSchoolRecords = new Map();

function setActivePanel(panelName, persist = true) {
    document.querySelectorAll('[data-content-panel]').forEach(panel => {
        panel.classList.toggle('hidden', panel.dataset.contentPanel !== panelName);
    });
    document.querySelectorAll('[data-admin-nav]').forEach(button => {
        const active = button.dataset.adminNav === panelName;
        button.classList.toggle('active', active);
        button.setAttribute('aria-current', active ? 'page' : 'false');
    });
    const titles = { overview: 'Overview', schools: 'Schools', accounts: 'Accounts', audit: 'Audit log', security: 'Security' };
    document.getElementById('currentSectionTitle').textContent = titles[panelName] || 'Overview';
    if (persist) sessionStorage.setItem('appAdminLastPanel', panelName);
}

setActivePanel('overview', false);

const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
}[character]));

function formatAdminDate(value) {
    return value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}

function renderPlatformOverview(data) {
    platformOverview = data;
    document.getElementById('schoolTotal').textContent = String(data.totalSchools);
    document.getElementById('activeSchoolTotal').textContent = String(data.activeSchools);
    document.getElementById('platformAccountTotal').textContent = String(data.totalAccounts);
    document.getElementById('activeAccountTotal').textContent = String(data.activeAccounts);
    document.getElementById('trialSchoolTotal').textContent = String(data.trialSchools);
    document.getElementById('suspendedSchoolTotal').textContent = String(data.suspendedSchools);
    document.getElementById('schoolsNeedingAdminTotal').textContent = String(data.schoolsNeedingAdmin);
    const planChart = document.getElementById('planChart');
    planChart.replaceChildren();
    const planEntries = Object.entries(data.plans || {}).sort((a, b) => a[0].localeCompare(b[0]));
    const maxPlanCount = Math.max(1, ...planEntries.map(([, count]) => count));
    planEntries.forEach(([plan, count]) => {
        const row = document.createElement('div');
        row.className = 'plan-row';
        row.setAttribute('role', 'listitem');
        const label = document.createElement('span');
        label.className = 'plan-label';
        label.textContent = plan;
        const track = document.createElement('span');
        track.className = 'plan-track';
        track.setAttribute('aria-hidden', 'true');
        const bar = document.createElement('span');
        bar.className = 'plan-bar';
        bar.style.width = `${Math.max(4, count / maxPlanCount * 100)}%`;
        track.append(bar);
        const total = document.createElement('span');
        total.className = 'plan-count';
        total.textContent = String(count);
        row.append(label, track, total);
        planChart.append(row);
    });
    if (!planEntries.length) planChart.innerHTML = '<p class="chart-empty">No schools to display.</p>';

    const registrations = document.getElementById('registrationChart');
    registrations.replaceChildren();
    const months = data.registrationsByMonth || [];
    const maxRegistrations = Math.max(1, ...months.map(month => month.count));
    months.forEach(month => {
        const column = document.createElement('div');
        column.className = 'registration-column';
        column.setAttribute('role', 'listitem');
        column.setAttribute('aria-label', `${month.label}: ${month.count} schools`);
        const barArea = document.createElement('div');
        barArea.className = 'registration-bar-area';
        const bar = document.createElement('span');
        bar.className = 'registration-bar';
        bar.style.height = `${Math.max(3, month.count / maxRegistrations * 100)}%`;
        barArea.append(bar);
        const meta = document.createElement('span');
        meta.className = 'registration-label';
        meta.textContent = month.label;
        column.append(barArea, meta);
        registrations.append(column);
    });

    const subscriptions = document.getElementById('subscriptionSummary');
    subscriptions.replaceChildren();
    const statusEntries = Object.entries(data.subscriptionStatuses || {});
    const maxStatusCount = Math.max(1, ...statusEntries.map(([, count]) => count));
    statusEntries.forEach(([status, count]) => {
        const row = document.createElement('div');
        row.className = 'subscription-row';
        row.setAttribute('role', 'listitem');
        const label = document.createElement('span');
        label.className = 'subscription-label';
        label.textContent = status.replaceAll('_', ' ');
        const track = document.createElement('span');
        track.className = 'subscription-track';
        track.setAttribute('aria-hidden', 'true');
        const bar = document.createElement('span');
        bar.className = 'subscription-bar';
        bar.style.width = `${Math.max(4, count / maxStatusCount * 100)}%`;
        track.append(bar);
        const total = document.createElement('span');
        total.className = 'subscription-count';
        total.textContent = String(count);
        row.append(label, track, total);
        subscriptions.append(row);
    });
    if (!statusEntries.length) subscriptions.innerHTML = '<p class="chart-empty">No subscription data.</p>';

    const activityList = document.getElementById('recentActivityList');
    activityList.replaceChildren();
    (data.recentActivity || []).forEach(item => {
        const row = document.createElement('div');
        row.className = 'activity-item';
        const icon = document.createElement('span');
        icon.className = 'activity-dot';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '•';
        const description = document.createElement('span');
        description.className = 'activity-description';
        const action = document.createElement('strong');
        action.textContent = item.action.replaceAll('.', ' ');
        description.append(action, document.createTextNode(item.schoolId ? ` · ${item.schoolId}` : ''));
        const time = document.createElement('time');
        time.className = 'activity-time';
        time.textContent = item.createdAt ? formatAdminDate(item.createdAt) : 'Just now';
        row.append(icon, description, time);
        activityList.append(row);
    });
    if (!data.recentActivity?.length) activityList.innerHTML = '<p class="chart-empty">No recent platform activity.</p>';
}

async function loadPlatformOverview() {
    const response = await getPlatformAdminOverview();
    renderPlatformOverview(response.data);
}

async function refreshOverviewSafely() {
    try {
        await loadPlatformOverview();
    } catch (error) {
        showError(createMessage, error, 'The operation succeeded, but dashboard metrics could not be refreshed.');
    }
}

async function loadAuditLog() {
    const message = document.getElementById('auditMessage');
    message.textContent = '';
    auditTableBody.innerHTML = '<tr><td colspan="5">Loading audit events…</td></tr>';
    try {
        const response = await listPlatformAdminAudit({ limit: 100 });
        auditTableBody.innerHTML = response.data.entries.length ? response.data.entries.map(item => `
            <tr>
                <td><span class="status-pill">${escapeHTML(item.action.replaceAll('.', ' '))}</span></td>
                <td>${escapeHTML(item.schoolId || '—')}</td>
                <td><code>${escapeHTML(item.targetId || '—')}</code></td>
                <td>${escapeHTML(item.actorEmail || item.actorUid)}</td>
                <td>${escapeHTML(formatAdminDate(item.createdAt))}</td>
            </tr>`).join('') : '<tr><td colspan="5">No audit activity has been recorded yet.</td></tr>';
    } catch (error) {
        auditTableBody.innerHTML = '<tr><td colspan="5">Unable to load audit events.</td></tr>';
        showError(message, error, 'Unable to load platform audit events.');
    }
}

function browserSessionId() {
    if (!adminSessionId) {
        adminSessionId = Array.from(crypto.getRandomValues(new Uint8Array(24)), byte => byte.toString(16).padStart(2, '0')).join('');
        sessionStorage.setItem('appAdminSessionId', adminSessionId);
    }
    return adminSessionId;
}

async function registerCurrentAdminSession() {
    await registerPlatformAdminSession({
        sessionId: browserSessionId(),
        userAgent: navigator.userAgent
    });
}

async function loadAdminSecurity() {
    const user = auth.currentUser;
    if (!user) return;
    const factors = multiFactor(user).enrolledFactors;
    const mfaStatus = document.getElementById('adminMfaStatus');
    mfaStatus.textContent = factors.length ? `${factors.length} factor${factors.length === 1 ? '' : 's'} enrolled` : 'Not enabled';
    mfaStatus.classList.toggle('disabled', !factors.length);
    if (factors.length) {
        document.getElementById('adminMfaPhone').disabled = true;
        document.getElementById('adminMfaPassword').disabled = true;
        document.getElementById('sendAdminMfaCode').disabled = true;
    }
    const response = await listPlatformAdminSessions();
    sessionsTableBody.innerHTML = response.data.sessions.length ? response.data.sessions.map(item => {
        const current = item.id === adminSessionId && !item.endedAt;
        const recentlyActive = Date.now() - new Date(item.lastSeenAt).getTime() < 5 * 60 * 1000;
        const label = item.userAgent.slice(0, 140) || 'Unknown browser';
        return `<tr><td>${escapeHTML(label)}</td><td>${escapeHTML(formatAdminDate(item.createdAt))}</td><td>${escapeHTML(formatAdminDate(item.lastSeenAt))}</td><td class="${current ? 'session-current' : ''}">${current ? 'This browser' : recentlyActive ? 'Recently active' : item.endedAt ? 'Signed out' : 'Inactive'}</td></tr>`;
    }).join('') : '<tr><td colspan="4">No browser sessions recorded.</td></tr>';
}

function csvCell(value) {
    const text = String(value ?? '');
    const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safeText.replaceAll('"', '""')}"`;
}

async function exportSchoolsCsv() {
    const button = document.getElementById('exportSchoolsButton');
    button.disabled = true;
    button.textContent = 'Preparing…';
    try {
        const allSchools = [];
        let afterSchoolId = '';
        do {
            const response = await listPlatformSchools({ afterSchoolId, pageSize: 200 });
            allSchools.push(...response.data.schools);
            afterSchoolId = response.data.nextAfterSchoolId || '';
        } while (afterSchoolId);
        const columns = ['School ID', 'School', 'Country', 'Status', 'Plan', 'Subscription status', 'Billing cycle', 'Renewal date', 'Members', 'School admins', 'Created'];
        const rows = allSchools.map(school => [
            school.id, school.name, school.countryCode, school.status, school.subscriptionPlan,
            school.subscriptionStatus, school.billingCycle, school.renewalDate,
            school.memberCount, school.schoolAdminCount, school.createdAt
        ]);
        const csv = [columns, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
        const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `smartskool-schools-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        createMessage.textContent = `Exported ${allSchools.length} schools.`;
    } catch (error) {
        showError(createMessage, error, 'Unable to export the school directory.');
    } finally {
        button.disabled = false;
        button.textContent = 'Export CSV';
    }
}

function setBusy(form, busy, buttonText) {
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    button.disabled = busy;
    button.dataset.originalText ||= button.textContent;
    button.textContent = busy ? buttonText : button.dataset.originalText;
}

function makeTemporaryPassword() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(bytes, byte => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[byte % 62]).join('');
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
    const visibleSchools = schools.filter(school =>
        (!schoolStatusFilter.value || school.status === schoolStatusFilter.value)
        && (!schoolPlanFilter.value || school.subscriptionPlan === schoolPlanFilter.value)
        && (!schoolSubscriptionFilter.value || school.subscriptionStatus === schoolSubscriptionFilter.value)
    );
    schoolTableBody.innerHTML = visibleSchools.length ? visibleSchools.map((school, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><div class="school-name-cell">${school.logoURL
                ? `<img src="${escapeHTML(school.logoURL)}" alt="" loading="lazy">`
                : '<span class="school-logo-fallback" aria-hidden="true">SCH</span>'}
                <strong>${escapeHTML(school.name)}</strong></div></td>
            <td><code>${escapeHTML(school.id)}</code></td>
            <td><span class="status-pill ${escapeHTML(school.status)}">${escapeHTML(school.status)}</span></td>
            <td><span class="status-pill ${escapeHTML(school.subscriptionStatus)}">${escapeHTML(school.subscriptionPlan)} · ${escapeHTML(school.subscriptionStatus)}</span><small class="sub-cell">${school.renewalDate ? `Renewal: ${escapeHTML(school.renewalDate)}` : 'No renewal date set'}</small></td>
            <td><span class="school-setup-state ${school.schoolAdminCount > 0 ? 'ready' : ''}">${school.schoolAdminCount > 0 ? 'Admin ready' : 'Needs admin'}</span></td>
            <td>${school.memberCount}</td>
            <td>${escapeHTML(school.createdAt ? new Date(school.createdAt).toLocaleDateString() : '—')}</td>
            <td><div class="table-actions">
                <button class="table-action" type="button" data-school-action="profile" data-school-id="${escapeHTML(school.id)}">Profile</button>
                <button class="table-action" type="button" data-school-action="accounts" data-school-id="${escapeHTML(school.id)}">Accounts</button>
                <button class="table-action" type="button" data-school-action="edit" data-school-id="${escapeHTML(school.id)}">Edit</button>
                <button class="table-action" type="button" data-school-action="subscription" data-school-id="${escapeHTML(school.id)}">Plan</button>
                <button class="table-action ${school.status === 'active' ? 'danger' : ''}" type="button" data-school-action="status" data-school-id="${escapeHTML(school.id)}" data-status="${school.status === 'active' ? 'suspended' : 'active'}">${school.status === 'active' ? 'Suspend' : 'Activate'}</button>
            </div></td>
        </tr>`).join('') : `<tr><td colspan="9">${schools.length ? 'No schools match these filters on this page.' : 'No schools match this search.'}</td></tr>`;
    if (platformOverview) {
        document.getElementById('schoolTotal').textContent = String(platformOverview.totalSchools);
        document.getElementById('activeSchoolTotal').textContent = String(platformOverview.activeSchools);
    } else {
        document.getElementById('schoolTotal').textContent = String(schoolCount);
        document.getElementById('activeSchoolTotal').textContent = String(activeSchoolCount);
        renderPlanChart(schools);
    }
    const filtersActive = Boolean(schoolStatusFilter.value || schoolPlanFilter.value || schoolSubscriptionFilter.value);
    const totalLabel = schoolSearch.value.trim()
        ? `${schoolMatchCount} total matching the search`
        : `${schoolCount} total registered`;
    schoolSearchSummary.textContent = filtersActive
        ? `Showing ${visibleSchools.length} of ${schools.length} schools on this page (${totalLabel}).`
        : schoolSearch.value.trim()
            ? `Showing ${schools.length ? schoolCurrentPageOffset + 1 : 0}–${schoolCurrentPageOffset + schools.length} of ${schoolMatchCount} matching schools.`
            : `${schoolCount} registered schools`;
    document.getElementById('nextSchoolsButton').disabled = schoolSearch.value.trim()
        ? schoolNextPageOffset === null
        : !schoolAfterId;
    document.getElementById('previousSchoolsButton').disabled = schoolCursorHistory.length === 0;
    renderAccountSchoolOptions();
}

function renderAccountSchoolOptions() {
    const selectedId = selectedSchool?.id || accountSchoolSelect.value;
    accountSchoolSelect.replaceChildren(new Option('Select a school…', ''));
    schools.forEach(school => {
        accountSchoolSelect.add(new Option(`${school.name} · ${school.id}`, school.id));
    });
    if (selectedId && !schools.some(school => school.id === selectedId)) {
        accountSchoolSelect.add(new Option(`${selectedSchool.name} · ${selectedSchool.id}`, selectedSchool.id));
    }
    accountSchoolSelect.value = selectedId || '';
}

function renderPlanChart(schoolList) {
    const planCounts = new Map();
    schoolList.forEach(school => {
        const plan = school.subscriptionPlan || 'Unassigned';
        planCounts.set(plan, (planCounts.get(plan) || 0) + 1);
    });
    const preferredOrder = ['Starter', 'Standard', 'Enterprise'];
    const plans = [...planCounts].sort(([first], [second]) => {
        const firstRank = preferredOrder.indexOf(first);
        const secondRank = preferredOrder.indexOf(second);
        if (firstRank !== -1 || secondRank !== -1) {
            return (firstRank === -1 ? preferredOrder.length : firstRank)
                - (secondRank === -1 ? preferredOrder.length : secondRank);
        }
        return first.localeCompare(second);
    });
    planChart.replaceChildren();
    if (!plans.length) {
        const empty = document.createElement('p');
        empty.className = 'chart-empty';
        empty.textContent = 'No schools to display on this page.';
        planChart.append(empty);
        return;
    }
    const maxCount = Math.max(...plans.map(([, count]) => count));
    plans.forEach(([plan, count]) => {
        const row = document.createElement('div');
        row.className = 'plan-row';
        row.setAttribute('role', 'listitem');
        row.setAttribute('aria-label', `${plan}: ${count} ${count === 1 ? 'school' : 'schools'}`);
        const label = document.createElement('span');
        label.className = 'plan-label';
        label.textContent = plan;
        const track = document.createElement('span');
        track.className = 'plan-track';
        track.setAttribute('aria-hidden', 'true');
        const bar = document.createElement('span');
        bar.className = 'plan-bar';
        bar.style.width = `${Math.max(4, count / maxCount * 100)}%`;
        track.append(bar);
        const total = document.createElement('span');
        total.className = 'plan-count';
        total.textContent = String(count);
        row.append(label, track, total);
        planChart.append(row);
    });
}

async function loadSchools(afterSchoolId = schoolPageCursor, pageOffset = 0) {
    schoolTableBody.innerHTML = '<tr><td colspan="9">Loading schools…</td></tr>';
    const searchTerm = schoolSearch.value.trim();
    const response = await listPlatformSchools({
        afterSchoolId: searchTerm ? '' : afterSchoolId || '',
        pageOffset: searchTerm ? pageOffset : 0,
        searchTerm,
        pageSize: schoolPageSize
    });
    schoolPageCursor = afterSchoolId || null;
    schoolCurrentPageOffset = searchTerm ? pageOffset : 0;
    schools = response.data.schools;
    schoolAfterId = response.data.nextAfterSchoolId;
    schoolNextPageOffset = response.data.nextPageOffset;
    schoolCount = response.data.totalCount;
    schoolMatchCount = response.data.matchingCount;
    activeSchoolCount = response.data.activeSchoolCount;
    renderSchools();
}

function renderAccounts() {
    accountTableBody.innerHTML = accounts.length ? accounts.map((account, index) => `
        <tr>
            <td>${index + 1}</td>
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
        </tr>`).join('') : '<tr><td colspan="7">No accounts match this search.</td></tr>';
    document.getElementById('accountTotal').textContent = String(accountCount);
    document.getElementById('nextAccountsButton').disabled = accountUsesOffsetPaging()
        ? accountNextPageOffset === null
        : !accountAfterUid;
    document.getElementById('previousAccountsButton').disabled = accountCursorHistory.length === 0;
}

function accountUsesOffsetPaging() {
    return Boolean(accountSearch.value.trim() || accountRoleFilter.value || accountStatusFilter.value);
}

async function loadAccounts(afterUid = accountPageCursor, pageOffset = 0) {
    if (!selectedSchool) return;
    accountTableBody.innerHTML = '<tr><td colspan="7">Loading school accounts…</td></tr>';
    const searchTerm = accountSearch.value.trim();
    const useOffsetPaging = accountUsesOffsetPaging();
    const response = await listPlatformSchoolAccounts({
        schoolId: selectedSchool.id,
        afterUid: useOffsetPaging ? '' : afterUid || '',
        pageOffset: useOffsetPaging ? pageOffset : 0,
        searchTerm,
        role: accountRoleFilter.value,
        status: accountStatusFilter.value,
        pageSize: accountPageSize
    });
    accountPageCursor = afterUid || null;
    accountCurrentPageOffset = useOffsetPaging ? pageOffset : 0;
    accounts = response.data.accounts;
    accountAfterUid = response.data.nextAfterUid;
    accountNextPageOffset = response.data.nextPageOffset;
    accountCount = response.data.totalCount;
    renderAccounts();
}

function openSchoolAccounts(school) {
    selectedSchool = school;
    selectedSchoolClasses = [];
    selectedSchoolRecords.clear();
    accountCursorHistory = [];
    accountPageCursor = null;
    accountCurrentPageOffset = 0;
    accountAfterUid = null;
    accountNextPageOffset = null;
    accountSearch.value = '';
    accounts = [];
    accountForm.classList.add('hidden');
    schoolAdminLoginLink.classList.add('hidden');
    schoolAdminLoginLink.removeAttribute('href');
    accountInvitationPanel.classList.add('hidden');
    accountInvitationLink.value = '';
    accountInvitationLink.classList.add('hidden');
    document.getElementById('copyAccountInvitation').classList.add('hidden');
    lastCreatedAccount = null;
    accountMessage.textContent = '';
    accountEditUid = null;
    accountSchoolSelect.value = school.id;
    schoolAccountsSection.classList.remove('hidden');
    setActivePanel('accounts');
    document.getElementById('selectedSchoolHeading').textContent = `${school.name} accounts`;
    document.getElementById('selectedSchoolSummary').textContent = `School ID: ${school.id} · ${school.status}`;
    schoolAccountsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    loadAccounts().catch(error => showError(accountMessage, error, 'Unable to load school accounts.'));
    getAssignableSchoolClasses({ schoolId: school.id }).then(response => {
        selectedSchoolClasses = response.data;
        renderAssignedClassOptions();
    }).catch(error => showError(accountMessage, error, 'Unable to load assignable classes.'));
}

function openSchoolEditor(school) {
    schoolEditorForm.elements.schoolId.value = school.id;
    schoolEditorForm.elements.name.value = school.name || '';
    schoolEditorForm.elements.countryCode.value = school.countryCode || 'UG';
    schoolEditorForm.elements.logoURL.value = school.logoURL || '';
    schoolEditorForm.elements.subscriptionPlan.value = school.subscriptionPlan || 'Starter';
    schoolEditorForm.elements.subscriptionStatus.value = school.subscriptionStatus || 'trialing';
    schoolEditorForm.elements.billingCycle.value = school.billingCycle || 'annual';
    schoolEditorForm.elements.renewalDate.value = school.renewalDate || '';
    schoolEditorForm.classList.remove('hidden');
    schoolEditorForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    schoolEditorForm.elements.name.focus();
}

function showSchoolProfile(school) {
    schoolProfileRecord = school;
    const profile = document.getElementById('schoolProfile');
    document.getElementById('schoolProfileName').textContent = school.name || 'School details';
    document.getElementById('schoolProfileSubtitle').textContent = `School ID: ${school.id}${school.countryCode ? ` · ${school.countryCode}` : ''}`;
    const metrics = [
        ['Workspace status', school.status || 'unknown'],
        ['Subscription plan', school.subscriptionPlan || 'Unassigned'],
        ['Subscription status', (school.subscriptionStatus || 'trialing').replaceAll('_', ' ')],
        ['Accounts', school.memberCount ?? 0],
        ['School admins', school.schoolAdminCount ?? 0],
        ['Created', school.createdAt ? new Date(school.createdAt).toLocaleDateString() : '—'],
        ['Billing cycle', school.billingCycle || '—'],
        ['Renewal date', school.renewalDate || '—']
    ];
    const metricContainer = document.getElementById('schoolProfileMetrics');
    metricContainer.replaceChildren(...metrics.map(([label, value]) => {
        const card = document.createElement('div');
        card.className = 'profile-metric';
        const title = document.createElement('span');
        title.textContent = label;
        const detail = document.createElement('strong');
        detail.textContent = String(value);
        card.append(title, detail);
        return card;
    }));
    profile.dataset.schoolId = school.id;
    profile.classList.remove('hidden');
    profile.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    accountForm.querySelector('button[type="submit"]').textContent = 'Create account';
    accountForm.classList.add('hidden');
    accountInvitationPanel.classList.add('hidden');
    accountInvitationLink.value = '';
    accountInvitationLink.classList.add('hidden');
    document.getElementById('copyAccountInvitation').classList.add('hidden');
    document.getElementById('generateAccountInvitation').textContent = 'Generate secure setup link';
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
    renderAssignedClassOptions(account.assignedClassIds || []);
    accountForm.querySelector('button[type="submit"]').textContent = 'Save account changes';
    accountForm.classList.remove('hidden');
    accountForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function displayAdmin(user) {
    if (!user) {
        document.body.classList.remove('admin-auth-checking');
        document.body.classList.add('admin-sign-in');
        publicHeading.classList.remove('hidden');
        returnLink.classList.remove('hidden');
        signInCard.classList.remove('hidden');
        schoolCreateCard.classList.add('hidden');
        return;
    }
    const token = await user.getIdTokenResult(true);
    if (token.claims.appAdmin !== true) {
        await signOut(auth);
        document.body.classList.remove('admin-auth-checking');
        document.body.classList.add('admin-sign-in');
        publicHeading.classList.remove('hidden');
        returnLink.classList.remove('hidden');
        signInCard.classList.remove('hidden');
        schoolCreateCard.classList.add('hidden');
        signInMessage.textContent = 'This account is not authorized as an App Admin.';
        return;
    }
    signedInAs.textContent = `Signed in as ${user.email || 'authorized App Admin'}`;
    document.body.classList.remove('admin-sign-in');
    publicHeading.classList.add('hidden');
    returnLink.classList.add('hidden');
    signInCard.classList.add('hidden');
    schoolCreateCard.classList.remove('hidden');
    signInMessage.textContent = '';
    try {
        await loadSchools();
        const lastPanel = sessionStorage.getItem('appAdminLastPanel');
        setActivePanel(['overview', 'schools', 'accounts', 'audit', 'security'].includes(lastPanel) ? lastPanel : 'overview');
        await Promise.allSettled([
            loadPlatformOverview().catch(error => showError(createMessage, error, 'Unable to load platform-wide dashboard metrics.')),
            registerCurrentAdminSession().catch(error => showError(createMessage, error, 'Unable to register this browser session.'))
        ]);
        if (adminSessionHeartbeat) clearInterval(adminSessionHeartbeat);
        adminSessionHeartbeat = setInterval(() => {
            if (document.visibilityState === 'visible' && auth.currentUser) {
                registerCurrentAdminSession().catch(error => showError(createMessage, error, 'Unable to refresh this browser session.'));
            }
        }, 4 * 60 * 1000);
        if (lastPanel === 'audit') await loadAuditLog();
        if (lastPanel === 'security') await loadAdminSecurity();
    } catch (error) {
        showError(document.getElementById('createMessage'), error, 'Unable to load registered schools.');
    } finally {
        document.body.classList.remove('admin-auth-checking');
    }
}

onAuthStateChanged(auth, user => {
    displayAdmin(user).catch(error => {
        document.body.classList.remove('admin-auth-checking');
        signInCard.classList.remove('hidden');
        schoolCreateCard.classList.add('hidden');
        document.body.classList.add('admin-sign-in');
        showError(signInMessage, error, 'Unable to verify App Admin access.');
    });
}, error => {
    document.body.classList.remove('admin-auth-checking');
    signInCard.classList.remove('hidden');
    schoolCreateCard.classList.add('hidden');
    document.body.classList.add('admin-sign-in');
    showError(signInMessage, error, 'Unable to restore App Admin sign-in.');
});

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

function showSchoolCreateForm() {
    setActivePanel('schools');
    createForm.classList.remove('hidden');
    createForm.elements.name.focus();
}

document.getElementById('showCreateSchoolButton').addEventListener('click', showSchoolCreateForm);
document.getElementById('createSchoolFromDirectory').addEventListener('click', showSchoolCreateForm);

document.getElementById('quickCreateSchoolButton').addEventListener('click', () => {
    setActivePanel('schools');
    createForm.classList.remove('hidden');
    createForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    createForm.elements.name.focus({ preventScroll: true });
});

document.getElementById('browseSchoolsButton').addEventListener('click', () => setActivePanel('schools'));
document.getElementById('manageSchoolsButton').addEventListener('click', () => setActivePanel('schools'));
document.getElementById('adminHomeButton').addEventListener('click', () => setActivePanel('overview'));

document.querySelectorAll('[data-admin-nav]').forEach(button => {
    button.addEventListener('click', () => {
        setActivePanel(button.dataset.adminNav);
        if (button.dataset.adminNav === 'audit') loadAuditLog().catch(error => showError(document.getElementById('auditMessage'), error, 'Unable to load platform audit events.'));
        if (button.dataset.adminNav === 'security') loadAdminSecurity().catch(error => showError(document.getElementById('securityMessage'), error, 'Unable to load security settings.'));
        if (button.dataset.adminNav === 'accounts' && !selectedSchool) {
            accountSchoolSelect.focus();
        }
    });
});

document.getElementById('openAuditLogButton').addEventListener('click', () => {
    setActivePanel('audit');
    loadAuditLog().catch(error => showError(document.getElementById('auditMessage'), error, 'Unable to load platform audit events.'));
});
document.getElementById('refreshAuditButton').addEventListener('click', () => {
    loadAuditLog().catch(error => showError(document.getElementById('auditMessage'), error, 'Unable to refresh platform audit events.'));
});
document.getElementById('exportSchoolsButton').addEventListener('click', exportSchoolsCsv);
document.getElementById('schoolProfileAccounts').addEventListener('click', () => {
    if (schoolProfileRecord) openSchoolAccounts(schoolProfileRecord);
});
document.getElementById('schoolProfileEdit').addEventListener('click', () => {
    if (schoolProfileRecord) openSchoolEditor(schoolProfileRecord);
});
document.getElementById('schoolProfilePlan').addEventListener('click', () => {
    if (schoolProfileRecord) {
        openSchoolEditor(schoolProfileRecord);
        schoolEditorForm.elements.subscriptionPlan.focus();
    }
});
document.getElementById('closeSchoolProfile').addEventListener('click', () => {
    document.getElementById('schoolProfile').classList.add('hidden');
    schoolProfileRecord = null;
});
document.getElementById('refreshSessionsButton').addEventListener('click', () => {
    loadAdminSecurity().catch(error => showError(document.getElementById('securityMessage'), error, 'Unable to refresh App Admin sessions.'));
});

document.getElementById('sendAdminMfaCode').addEventListener('click', async event => {
    const button = event.currentTarget;
    const user = auth.currentUser;
    const message = document.getElementById('securityMessage');
    if (!user?.email) {
        message.textContent = 'Sign in with an email-based App Admin account to enroll a phone factor.';
        return;
    }
    if (multiFactor(user).enrolledFactors.length) {
        message.textContent = 'A multi-factor sign-in method is already enrolled for this account.';
        return;
    }
    const password = document.getElementById('adminMfaPassword').value;
    const phoneNumber = document.getElementById('adminMfaPhone').value.trim();
    if (!password || !/^\+[1-9]\d{7,14}$/.test(phoneNumber)) {
        message.textContent = 'Enter your current password and a valid phone number in international format.';
        return;
    }
    button.disabled = true;
    message.textContent = '';
    try {
        await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
        if (!adminMfaVerifier) {
            adminMfaVerifier = new RecaptchaVerifier(auth, 'adminMfaRecaptcha', { size: 'normal' });
        }
        await adminMfaVerifier.render();
        const session = await multiFactor(user).getSession();
        adminMfaVerificationId = await new PhoneAuthProvider(auth).verifyPhoneNumber({
            phoneNumber,
            session
        }, adminMfaVerifier);
        document.getElementById('adminMfaCodeField').classList.remove('hidden');
        document.getElementById('verifyAdminMfaCode').classList.remove('hidden');
        document.getElementById('adminMfaCode').focus();
        message.textContent = 'Verification code sent. Enter the SMS code to finish enrollment.';
    } catch (error) {
        adminMfaVerifier?.clear();
        adminMfaVerifier = null;
        showError(message, error, 'Unable to send an MFA verification code.');
    } finally {
        button.disabled = false;
    }
});

document.getElementById('adminMfaForm').addEventListener('submit', async event => {
    event.preventDefault();
    const user = auth.currentUser;
    const code = document.getElementById('adminMfaCode').value.trim();
    const message = document.getElementById('securityMessage');
    const button = document.getElementById('verifyAdminMfaCode');
    if (!user || !adminMfaVerificationId || !code) {
        message.textContent = 'Request a verification code and enter it before enabling MFA.';
        return;
    }
    button.disabled = true;
    try {
        const phoneCredential = PhoneAuthProvider.credential(adminMfaVerificationId, code);
        const assertion = PhoneMultiFactorGenerator.assertion(phoneCredential);
        await multiFactor(user).enroll(assertion, document.getElementById('adminMfaPhone').value.trim());
        message.textContent = 'Multi-factor authentication is enabled for this App Admin account.';
        document.getElementById('adminMfaPassword').value = '';
        adminMfaVerificationId = '';
        adminMfaVerifier?.clear();
        adminMfaVerifier = null;
        await loadAdminSecurity();
    } catch (error) {
        showError(message, error, 'Unable to enable multi-factor authentication.');
    } finally {
        button.disabled = false;
    }
});

document.getElementById('revokeSessionsButton').addEventListener('click', async event => {
    if (!confirm('Sign out this App Admin account on every device, including this browser? You will need to sign in again.')) return;
    const button = event.currentTarget;
    button.disabled = true;
    try {
        await revokePlatformAdminSessions();
        await signOut(auth);
        adminSessionId = null;
        sessionStorage.removeItem('appAdminSessionId');
        document.getElementById('securityMessage').textContent = 'All App Admin refresh tokens were revoked. Sign in again to continue.';
    } catch (error) {
        showError(document.getElementById('securityMessage'), error, 'Unable to revoke App Admin sessions.');
    } finally {
        button.disabled = false;
    }
});

accountSchoolSelect.addEventListener('change', () => {
    const school = schools.find(item => item.id === accountSchoolSelect.value)
        || (selectedSchool?.id === accountSchoolSelect.value ? selectedSchool : null);
    if (school) openSchoolAccounts(school);
    else {
        schoolAccountsSection.classList.add('hidden');
        selectedSchool = null;
    }
});

document.getElementById('clearSchoolFilters').addEventListener('click', () => {
    schoolStatusFilter.value = '';
    schoolPlanFilter.value = '';
    schoolSubscriptionFilter.value = '';
    schoolSearch.value = '';
    schoolCursorHistory = [];
    loadSchools(null, 0).catch(error => showError(createMessage, error, 'Unable to clear school filters.'));
});
schoolStatusFilter.addEventListener('change', renderSchools);
schoolPlanFilter.addEventListener('change', renderSchools);
schoolSubscriptionFilter.addEventListener('change', renderSchools);

document.getElementById('cancelSchoolEditButton').addEventListener('click', () => {
    schoolEditorForm.reset();
    schoolEditorForm.classList.add('hidden');
});

schoolEditorForm.addEventListener('submit', async event => {
    event.preventDefault();
    setBusy(schoolEditorForm, true, 'Saving…');
    createMessage.textContent = '';
    const data = new FormData(schoolEditorForm);
    try {
        await updatePlatformSchool({
            schoolId: data.get('schoolId'),
            name: data.get('name').trim(),
            countryCode: data.get('countryCode').trim().toUpperCase(),
            logoURL: data.get('logoURL').trim(),
            subscriptionPlan: data.get('subscriptionPlan'),
            subscriptionStatus: data.get('subscriptionStatus'),
            billingCycle: data.get('billingCycle'),
            renewalDate: data.get('renewalDate')
        });
        schoolEditorForm.classList.add('hidden');
        await loadSchools(schoolPageCursor, schoolCurrentPageOffset);
        createMessage.textContent = 'School details and subscription tracking were updated.';
        await refreshOverviewSafely();
        if (schoolProfileRecord?.id === data.get('schoolId')) {
            schoolProfileRecord = schools.find(item => item.id === schoolProfileRecord.id) || schoolProfileRecord;
            showSchoolProfile(schoolProfileRecord);
        }
    } catch (error) {
        showError(createMessage, error, 'Unable to save school changes.');
    } finally {
        setBusy(schoolEditorForm, false);
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
        schoolSearch.value = '';
        schoolCursorHistory = [];
        schoolCurrentPageOffset = 0;
        await loadSchools(null, 0);
        await refreshOverviewSafely();
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
    if (button.dataset.schoolAction === 'profile') {
        showSchoolProfile(school);
        return;
    }
    if (button.dataset.schoolAction === 'accounts') {
        openSchoolAccounts(school);
        return;
    }
    if (button.dataset.schoolAction === 'edit') {
        openSchoolEditor(school);
        return;
    }
    if (button.dataset.schoolAction === 'subscription') {
        openSchoolEditor(school);
        schoolEditorForm.elements.subscriptionPlan.focus();
        return;
    }
    const nextStatus = button.dataset.status;
    if (!confirm(`${nextStatus === 'suspended' ? 'Suspend' : 'Reactivate'} ${school.name}?`)) return;
    button.disabled = true;
    try {
        await setPlatformSchoolStatus({ schoolId: school.id, status: nextStatus });
        await loadSchools(schoolPageCursor, schoolCurrentPageOffset);
        await refreshOverviewSafely();
        if (selectedSchool?.id === school.id) {
            selectedSchool = { ...selectedSchool, status: nextStatus };
            document.getElementById('selectedSchoolSummary').textContent = `School ID: ${school.id} · ${nextStatus}`;
        }
    } catch (error) {
        showError(createMessage, error, 'Unable to update school status.');
    }
});

let schoolSearchTimer;
schoolSearch.addEventListener('input', () => {
    clearTimeout(schoolSearchTimer);
    schoolCursorHistory = [];
    schoolPageCursor = null;
    schoolCurrentPageOffset = 0;
    schoolSearchTimer = setTimeout(() => {
        loadSchools(null, 0).catch(error => showError(createMessage, error, 'Unable to search all schools.'));
    }, 250);
});
document.getElementById('schoolPageSize').addEventListener('change', async event => {
    schoolPageSize = Number(event.target.value);
    schoolCursorHistory = [];
    schoolPageCursor = null;
    schoolCurrentPageOffset = 0;
    try {
        await loadSchools(null, 0);
    } catch (error) {
        showError(createMessage, error, 'Unable to load schools for the selected page size.');
    }
});
document.getElementById('previousSchoolsButton').addEventListener('click', async () => {
    const previous = schoolCursorHistory.pop();
    if (!previous) return;
    try {
        await loadSchools(previous.cursor, previous.offset);
    } catch (error) {
        showError(createMessage, error, 'Unable to load the previous school page.');
    }
});
document.getElementById('nextSchoolsButton').addEventListener('click', async () => {
    const searching = Boolean(schoolSearch.value.trim());
    if (searching ? schoolNextPageOffset === null : !schoolAfterId) return;
    schoolCursorHistory.push({ cursor: schoolPageCursor || null, offset: schoolCurrentPageOffset });
    try {
        await loadSchools(searching ? null : schoolAfterId, searching ? schoolNextPageOffset : 0);
    } catch (error) {
        schoolCursorHistory.pop();
        showError(createMessage, error, 'Unable to load the next school page.');
    }
});

document.getElementById('closeSchoolAccountsButton').addEventListener('click', () => {
    schoolAccountsSection.classList.add('hidden');
    selectedSchool = null;
    accountSchoolSelect.value = '';
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
let accountSearchTimer;
accountSearch.addEventListener('input', () => {
    clearTimeout(accountSearchTimer);
    accountCursorHistory = [];
    accountPageCursor = null;
    accountCurrentPageOffset = 0;
    accountSearchTimer = setTimeout(() => {
        loadAccounts(null, 0).catch(error => showError(accountMessage, error, 'Unable to search school accounts.'));
    }, 250);
});
for (const filter of [accountRoleFilter, accountStatusFilter]) {
    filter.addEventListener('change', () => {
        accountCursorHistory = [];
        accountPageCursor = null;
        accountCurrentPageOffset = 0;
        loadAccounts(null, 0).catch(error => showError(accountMessage, error, 'Unable to filter school accounts.'));
    });
}
document.getElementById('accountPageSize').addEventListener('change', async event => {
    accountPageSize = Number(event.target.value);
    accountCursorHistory = [];
    accountPageCursor = null;
    accountCurrentPageOffset = 0;
    if (!selectedSchool) return;
    try {
        await loadAccounts();
    } catch (error) {
        showError(accountMessage, error, 'Unable to load accounts for the selected page size.');
    }
});

accountForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!selectedSchool) return;
    const data = new FormData(accountForm);
    const creatingAccount = !accountEditUid;
    const temporaryPassword = creatingAccount ? makeTemporaryPassword() : '';
    const linkedRecordId = accountForm.elements.linkedRecordId.value === '__manual__'
        ? accountForm.elements.manualLinkedRecordId.value.trim()
        : accountForm.elements.linkedRecordId.value.trim();
    if (accountForm.elements.linkedRecordId.value === '__manual__' && !linkedRecordId) {
        accountMessage.textContent = 'Enter the staff record ID or choose an existing record.';
        return;
    }
    setBusy(accountForm, true, accountEditUid ? 'Saving…' : 'Creating…');
    accountMessage.textContent = '';
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
        if (creatingAccount) await createSchoolUser(account);
        else await updateSchoolUser(account);
        if (creatingAccount && account.role === 'schoolAdmin') {
            schoolAdminLoginLink.href = `./index.html?schoolId=${encodeURIComponent(selectedSchool.id)}`;
            schoolAdminLoginLink.classList.remove('hidden');
            accountMessage.textContent = 'School administrator account created. Generate a secure password setup link, then continue to school sign-in.';
        }
        resetAccountForm();
        if (creatingAccount) {
            lastCreatedAccount = { email: account.email, role: account.role };
            accountInvitationPanel.classList.remove('hidden');
        }
        accountSearch.value = creatingAccount ? account.email : accountSearch.value;
        accountCursorHistory = [];
        await loadAccounts(null, 0);
        if (creatingAccount) await loadSchools(schoolPageCursor, schoolCurrentPageOffset);
        await refreshOverviewSafely();
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
        setTimeout(() => { document.getElementById('copyAccountInvitation').textContent = 'Copy setup link'; }, 1800);
    } catch (error) {
        console.error('Unable to copy the secure setup link.', error);
        accountInvitationLink.focus();
        accountInvitationLink.select();
        showError(accountMessage, error, 'Select and copy the secure setup link manually.');
    }
});

document.getElementById('generateAccountInvitation').addEventListener('click', async event => {
    if (!selectedSchool || !lastCreatedAccount) return;
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = 'Generating…';
    accountMessage.textContent = '';
    try {
        const searchTerm = accountSearch.value;
        accountSearch.value = lastCreatedAccount.email;
        await loadAccounts(null, 0);
        const createdAccount = accounts.find(account => account.email.toLowerCase() === lastCreatedAccount.email);
        if (!createdAccount) throw new Error('The newly created account could not be located. Refresh the account list and try again.');
        const response = await generateSchoolUserPasswordResetLink({
            schoolId: selectedSchool.id,
            uid: createdAccount.uid
        });
        accountInvitationLink.value = response.data.invitationUrl;
        accountInvitationLink.classList.remove('hidden');
        document.getElementById('copyAccountInvitation').classList.remove('hidden');
        button.textContent = 'Generate a new setup link';
        accountMessage.textContent = `Secure password setup link generated for ${lastCreatedAccount.email}. Deliver it privately.`;
        accountSearch.value = searchTerm;
        await loadAccounts(null, 0);
    } catch (error) {
        showError(accountMessage, error, 'Unable to generate the secure setup link.');
        button.textContent = 'Retry setup link';
    } finally {
        button.disabled = false;
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
        await refreshOverviewSafely();
    } catch (error) {
        showError(accountMessage, error, 'Unable to update the school account.');
    } finally {
        button.disabled = false;
    }
});

document.getElementById('previousAccountsButton').addEventListener('click', async () => {
    const previous = accountCursorHistory.pop();
    if (!previous) return;
    try {
        await loadAccounts(previous.cursor, previous.offset);
    } catch (error) {
        showError(accountMessage, error, 'Unable to load the previous account page.');
    }
});
document.getElementById('nextAccountsButton').addEventListener('click', async () => {
    const useOffsetPaging = accountUsesOffsetPaging();
    if (useOffsetPaging ? accountNextPageOffset === null : !accountAfterUid) return;
    accountCursorHistory.push({ cursor: accountPageCursor || null, offset: accountCurrentPageOffset });
    try {
        await loadAccounts(useOffsetPaging ? null : accountAfterUid, useOffsetPaging ? accountNextPageOffset : 0);
    } catch (error) {
        accountCursorHistory.pop();
        showError(accountMessage, error, 'Unable to load the next account page.');
    }
});

signOutButton.addEventListener('click', async () => {
    signOutButton.disabled = true;
    try {
        if (auth.currentUser && adminSessionId) {
            try {
                await endPlatformAdminSession({ sessionId: adminSessionId });
            } catch (error) {
                showError(createMessage, error, 'Unable to mark this browser session as signed out.');
            }
        }
        await signOut(auth);
        if (adminSessionHeartbeat) clearInterval(adminSessionHeartbeat);
        adminSessionHeartbeat = null;
        adminSessionId = null;
        sessionStorage.removeItem('appAdminSessionId');
    } catch (error) {
        showError(createMessage, error, 'Unable to sign out.');
    } finally {
        signOutButton.disabled = false;
    }
});
