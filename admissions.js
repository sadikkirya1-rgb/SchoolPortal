(function () {
    'use strict';

    const sections = {
        Admissions: {
            collection: 'admissions',
            fields: [
                { key: 'applicantName', label: 'Applicant name', required: true },
                { key: 'applicationNo', label: 'Application number' },
                { key: 'className', label: 'Applying for class' },
                { key: 'applicationDate', label: 'Application date', type: 'date' },
                { key: 'parentName', label: 'Parent or guardian' },
                { key: 'phone', label: 'Contact phone', type: 'tel' }
            ],
            columns: ['applicantName', 'applicationNo', 'className', 'applicationDate', 'status']
        },
        Applications: {
            collection: 'applications',
            fields: [
                { key: 'applicantName', label: 'Applicant name', required: true },
                { key: 'applicationNo', label: 'Application number' },
                { key: 'className', label: 'Applying for class' },
                { key: 'applicationDate', label: 'Application date', type: 'date' },
                { key: 'parentName', label: 'Parent or guardian' },
                { key: 'phone', label: 'Contact phone', type: 'tel' }
            ],
            columns: ['applicantName', 'applicationNo', 'className', 'applicationDate', 'status']
        },
        Interviews: {
            collection: 'interviews',
            fields: [
                { key: 'applicantName', label: 'Applicant name', required: true },
                { key: 'applicationNo', label: 'Application number' },
                { key: 'interviewDate', label: 'Interview date', type: 'date' },
                { key: 'interviewer', label: 'Interviewer' },
                { key: 'interviewTime', label: 'Interview time', type: 'time' }
            ],
            columns: ['applicantName', 'applicationNo', 'interviewDate', 'interviewer', 'status']
        },
        'Admission Letters': {
            collection: 'admissionLetters',
            fields: [
                { key: 'applicantName', label: 'Applicant name', required: true },
                { key: 'applicationNo', label: 'Application number' },
                { key: 'className', label: 'Admitted class' },
                { key: 'issueDate', label: 'Issue date', type: 'date' },
                { key: 'responseDueDate', label: 'Response due date', type: 'date' }
            ],
            columns: ['applicantName', 'applicationNo', 'className', 'issueDate', 'status']
        },
        'Waiting List': {
            collection: 'waitingList',
            fields: [
                { key: 'applicantName', label: 'Applicant name', required: true },
                { key: 'applicationNo', label: 'Application number' },
                { key: 'className', label: 'Applying for class' },
                { key: 'position', label: 'Queue position', type: 'number' },
                { key: 'applicationDate', label: 'Application date', type: 'date' }
            ],
            columns: ['applicantName', 'applicationNo', 'className', 'position', 'status']
        },
        'Student Transfers': {
            collection: 'studentTransfers',
            fields: [
                { key: 'studentName', label: 'Student name', required: true },
                { key: 'admissionNo', label: 'Admission number' },
                { key: 'fromSchool', label: 'From school' },
                { key: 'toSchool', label: 'To school' },
                { key: 'requestDate', label: 'Request date', type: 'date' },
                { key: 'className', label: 'Class' }
            ],
            columns: ['studentName', 'admissionNo', 'fromSchool', 'toSchool', 'requestDate', 'status']
        }
    };
    const statusOptions = ['Pending', 'In review', 'Scheduled', 'Approved', 'Rejected', 'Completed'];
    let activeSection = '';
    let records = [];
    let unsubscribe = null;
    let requestId = 0;

    function createAdmissionsModule() {
        let section = document.getElementById('admissionsModule');
        if (section) return section;

        section = document.createElement('section');
        section.id = 'admissionsModule';
        section.className = 'module hidden admissions-module';
        section.innerHTML = `
            <section class="admissions-summary" aria-label="Admissions summary">
                <article class="admissions-summary-card">
                    <span class="admissions-summary-icon" aria-hidden="true"><i class="fas fa-users"></i></span>
                    <div><span>Total records</span><strong data-admissions-total>0</strong></div>
                </article>
                <article class="admissions-summary-card">
                    <span class="admissions-summary-icon admissions-summary-pending" aria-hidden="true"><i class="fas fa-hourglass-half"></i></span>
                    <div><span>Pending</span><strong data-admissions-pending>0</strong></div>
                </article>
                <article class="admissions-summary-card">
                    <span class="admissions-summary-icon admissions-summary-complete" aria-hidden="true"><i class="fas fa-circle-check"></i></span>
                    <div><span>Approved / completed</span><strong data-admissions-approved>0</strong></div>
                </article>
            </section>
            <section class="admissions-section-panel">
                <div class="admissions-toolbar">
                    <label class="admissions-search"><i class="fas fa-search" aria-hidden="true"></i>
                        <span class="sr-only">Search records</span><input type="search" data-admissions-search placeholder="Search records">
                    </label>
                    <button class="btn-primary" type="button" data-admissions-add><i class="fas fa-plus" aria-hidden="true"></i> Add record</button>
                    <span class="admissions-count" data-admissions-count></span>
                </div>
                <p class="admissions-message" data-admissions-message role="status" aria-live="polite"></p>
                <div class="admissions-table-wrap"><table class="admissions-table">
                    <thead><tr data-admissions-head></tr></thead><tbody data-admissions-body></tbody>
                </table></div>
            </section>
            <form class="admissions-modal" data-admissions-form aria-labelledby="admissions-form-title">
                <div class="admissions-modal-card">
                    <div class="admissions-modal-heading"><h2 id="admissions-form-title">Add record</h2>
                        <button class="admissions-close" type="button" data-admissions-cancel aria-label="Close form">&times;</button></div>
                    <div class="admissions-form-fields" data-admissions-fields></div>
                    <label class="admissions-field"><span>Status</span><select name="status">${statusOptions.map(value => `<option>${value}</option>`).join('')}</select></label>
                    <label class="admissions-field"><span>Notes</span><textarea name="notes" rows="3" maxlength="2000"></textarea></label>
                    <p class="admissions-form-error" data-admissions-form-error role="alert"></p>
                    <div class="admissions-modal-actions"><button class="btn-secondary" type="button" data-admissions-cancel>Cancel</button>
                        <button class="btn-primary" type="submit">Save record</button></div>
                </div>
            </form>`;

        section.querySelector('[data-admissions-search]').addEventListener('input', renderRecords);
        section.querySelector('[data-admissions-add]').addEventListener('click', () => openForm());
        section.querySelectorAll('[data-admissions-cancel]').forEach(button =>
            button.addEventListener('click', closeForm));
        section.querySelector('[data-admissions-form]').addEventListener('submit', saveForm);
        const refreshVisibleSection = () => {
            if (activeSection && !section.classList.contains('hidden')) openAdmissionsSection(activeSection);
        };
        window.addEventListener('online', refreshVisibleSection);
        window.addEventListener('offline', refreshVisibleSection);
        window.addEventListener('school-portal-sync-error', event => {
            if (event.detail?.collection !== sections[activeSection]?.collection) return;
            section.querySelector('[data-admissions-message]').textContent =
                `Unable to load records: ${event.detail.error?.message || 'The data service reported an error.'}`;
        });
        return section;
    }

    function canView(collection) {
        const identity = window.schoolPortalData?.getIdentity?.();
        if (!identity) return false;
        const admin = ['schoolAdmin', 'superAdmin', 'director', 'headTeacher'].includes(identity.role);
        return admin || identity.permissions?.[collection]?.view === true;
    }

    function canEdit(collection) {
        const identity = window.schoolPortalData?.getIdentity?.();
        if (!identity || ['parent', 'student'].includes(String(identity.role).toLowerCase())) return false;
        const admin = ['schoolAdmin', 'superAdmin', 'director', 'headTeacher'].includes(identity.role);
        return admin || identity.permissions?.[collection]?.edit === true;
    }

    function openAdmissionsSection(label) {
        if (!Object.hasOwn(sections, label)) return false;
        const section = createAdmissionsModule();
        if (!section.isConnected) {
            const dashboard = document.querySelector('.main > .dashboard-shell');
            if (dashboard) dashboard.parentNode.insertBefore(section, dashboard);
        }
        if (unsubscribe) unsubscribe();
        unsubscribe = null;
        activeSection = label;
        records = [];
        const config = sections[label];
        section.querySelector('[data-admissions-search]').value = '';
        section.querySelector('[data-admissions-add]').hidden = !navigator.onLine || !canEdit(config.collection);
        section.querySelector('[data-admissions-message]').textContent = '';
        renderRecords();
        const currentRequest = ++requestId;
        if (!canView(config.collection)) {
            section.querySelector('[data-admissions-message]').textContent = 'You do not have permission to view this section.';
            renderRecords();
            return true;
        }
        if (!navigator.onLine) {
            section.querySelector('[data-admissions-message]').textContent = 'Loading saved records…';
            Promise.resolve(window.schoolPortalData?.listLocal?.(config.collection)).then(items => {
                if (currentRequest !== requestId || activeSection !== label) return;
                records = Array.isArray(items) ? items : [];
                section.querySelector('[data-admissions-message]').textContent =
                    records.length ? 'Offline mode: showing saved records. Reconnect to make changes.' : 'You are offline and no saved records are available.';
                renderRecords();
            }).catch(error => {
                if (currentRequest !== requestId) return;
                section.querySelector('[data-admissions-message]').textContent =
                    `Unable to load saved records: ${error.message}`;
                renderRecords();
            });
            renderRecords();
            return true;
        }
        if (!window.schoolPortalData?.subscribe) {
            section.querySelector('[data-admissions-message]').textContent = 'School data is unavailable. Reload the page and try again.';
            renderRecords();
            return true;
        }
        section.querySelector('[data-admissions-message]').textContent = 'Loading records…';
        Promise.resolve(window.schoolPortalData.subscribe(config.collection, (items, metadata) => {
            if (currentRequest !== requestId || activeSection !== label) return;
            if (metadata?.source === 'offline') {
                section.querySelector('[data-admissions-message]').textContent = 'You are offline. Reconnect to load school records.';
                return;
            }
            records = Array.isArray(items) ? items : [];
            section.querySelector('[data-admissions-message]').textContent = '';
            renderRecords();
        })).then(stop => {
            if (currentRequest === requestId) unsubscribe = stop;
            else stop?.();
        }).catch(error => {
            if (currentRequest !== requestId) return;
            section.querySelector('[data-admissions-message]').textContent = `Unable to load records: ${error.message}`;
            renderRecords();
        });
        renderRecords();
        return true;
    }

    function renderRecords() {
        const section = document.getElementById('admissionsModule');
        if (!section || !activeSection) return;
        const config = sections[activeSection];
        const head = section.querySelector('[data-admissions-head]');
        const body = section.querySelector('[data-admissions-body]');
        head.replaceChildren();
        body.replaceChildren();
        const columns = config.columns;
        [...columns.map(key => config.fields.find(field => field.key === key)?.label || key), 'Actions']
            .forEach(label => {
                const cell = document.createElement('th');
                cell.scope = 'col';
                cell.textContent = label;
                head.append(cell);
            });
        const search = section.querySelector('[data-admissions-search]').value.trim().toLowerCase();
        const filtered = records.filter(record => !record.deleted && (
            !search || config.fields.some(field => String(record[field.key] ?? '').toLowerCase().includes(search))
            || String(record.status || '').toLowerCase().includes(search)
            || String(record.notes || '').toLowerCase().includes(search)
        ));
        const activeRecords = records.filter(record => !record.deleted);
        const pendingCount = activeRecords.filter(record =>
            String(record.status || '').trim().toLowerCase() === 'pending'
        ).length;
        const approvedCount = activeRecords.filter(record =>
            ['approved', 'completed'].includes(String(record.status || '').trim().toLowerCase())
        ).length;
        section.querySelector('[data-admissions-total]').textContent = String(activeRecords.length);
        section.querySelector('[data-admissions-pending]').textContent = String(pendingCount);
        section.querySelector('[data-admissions-approved]').textContent = String(approvedCount);
        section.querySelector('[data-admissions-count]').textContent =
            `${filtered.length} ${filtered.length === 1 ? 'record' : 'records'}`;
        if (!filtered.length) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = columns.length + 1;
            cell.className = 'admissions-empty';
            cell.textContent = records.length ? 'No records match your search.' : 'No records yet. Add the first record to get started.';
            row.append(cell);
            body.append(row);
            return;
        }
        filtered.forEach(record => {
            const row = document.createElement('tr');
            columns.forEach(key => {
                const cell = document.createElement('td');
                cell.textContent = String(record[key] ?? record.status ?? '—');
                if (key === 'status') cell.className = `admissions-status admissions-status-${String(record.status || 'pending').toLowerCase().replace(/[^a-z]+/g, '-')}`;
                row.append(cell);
            });
            const actions = document.createElement('td');
            actions.className = 'admissions-row-actions';
            if (canEdit(config.collection)) {
                const edit = document.createElement('button');
                edit.type = 'button';
                edit.textContent = 'Edit';
                edit.addEventListener('click', () => openForm(record));
                const remove = document.createElement('button');
                remove.type = 'button';
                remove.textContent = 'Delete';
                remove.addEventListener('click', () => deleteRecord(record));
                actions.append(edit, remove);
            } else {
                actions.textContent = '—';
            }
            row.append(actions);
            body.append(row);
        });
    }

    function openForm(record = null) {
        const section = document.getElementById('admissionsModule');
        const form = section.querySelector('[data-admissions-form]');
        const config = sections[activeSection];
        const fields = section.querySelector('[data-admissions-fields]');
        fields.replaceChildren();
        form.dataset.recordId = record?.id || '';
        section.querySelector('#admissions-form-title').textContent = record ? 'Edit record' : 'Add record';
        section.querySelector('[data-admissions-form-error]').textContent = '';
        config.fields.forEach(field => {
            const label = document.createElement('label');
            label.className = 'admissions-field';
            const caption = document.createElement('span');
            caption.textContent = field.label;
            const input = document.createElement(field.type === 'textarea' ? 'textarea' : 'input');
            if (input instanceof HTMLInputElement) input.type = field.type || 'text';
            input.name = field.key;
            input.required = Boolean(field.required);
            input.maxLength = 200;
            input.value = String(record?.[field.key] ?? '');
            label.append(caption, input);
            fields.append(label);
        });
        form.elements.status.value = record?.status || 'Pending';
        form.elements.notes.value = record?.notes || '';
        form.classList.add('show');
        form.querySelector('input, textarea')?.focus();
    }

    function closeForm() {
        document.querySelector('#admissionsModule [data-admissions-form]')?.classList.remove('show');
    }

    async function saveForm(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const config = sections[activeSection];
        const submit = form.querySelector('[type="submit"]');
        const existing = records.find(record => record.id === form.dataset.recordId);
        const payload = existing
            ? Object.fromEntries(Object.entries(existing).filter(([key]) => key !== 'id' && key !== '_syncState'))
            : {};
        config.fields.forEach(field => {
            const value = String(form.elements[field.key].value || '').trim();
            if (value) payload[field.key] = field.type === 'number' ? Number(value) : value;
        });
        payload.status = form.elements.status.value;
        payload.notes = String(form.elements.notes.value || '').trim();
        payload.updatedAt = new Date().toISOString();
        if (!form.dataset.recordId) payload.createdAt = payload.updatedAt;
        submit.disabled = true;
        form.querySelector('[data-admissions-form-error]').textContent = '';
        try {
            if (!window.schoolPortalData?.saveRecord) throw new Error('School data is unavailable. Reload the page and try again.');
            const id = form.dataset.recordId || crypto.randomUUID();
            await window.schoolPortalData.saveRecord(config.collection, id, payload);
            closeForm();
            document.querySelector('#admissionsModule [data-admissions-message]').textContent = 'Record saved.';
        } catch (error) {
            form.querySelector('[data-admissions-form-error]').textContent = error.message || 'Unable to save this record.';
        } finally {
            submit.disabled = false;
        }
    }

    async function deleteRecord(record) {
        if (!window.confirm(`Delete the record for ${record.applicantName || record.studentName || 'this person'}?`)) return;
        const config = sections[activeSection];
        try {
            await window.schoolPortalData.deleteRecord(config.collection, record.id);
            document.querySelector('#admissionsModule [data-admissions-message]').textContent = 'Record deleted.';
        } catch (error) {
            document.querySelector('#admissionsModule [data-admissions-message]').textContent =
                `Unable to delete this record: ${error.message}`;
        }
    }

    window.createAdmissionsModule = createAdmissionsModule;
    window.openAdmissionsSection = openAdmissionsSection;
})();
