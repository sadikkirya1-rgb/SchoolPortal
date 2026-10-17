(() => {
    const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[character]);
    const administratorRoles = new Set(['schoolAdmin', 'superAdmin', 'director', 'headTeacher']);

    window.createSubjectsModule = function createSubjectsModule() {
        const section = document.createElement('section');
        section.className = 'module subjects-module';
        section.id = 'subjectsModule';
        section.innerHTML = `
            <header class="subjects-header">
                <div>
                    <p class="subjects-eyebrow">Academic Department</p>
                    <h1>School Subjects</h1>
                    <p>Manage the subject catalogue used for recording exam and test marks.</p>
                </div>
                <button class="subjects-primary-button" type="button" data-subject-add>
                    <i class="fas fa-plus" aria-hidden="true"></i> Add Subject
                </button>
            </header>
            <section class="subjects-summary" aria-label="Subject totals">
                <article><span>Total subjects</span><strong data-subject-total>0</strong></article>
                <article><span>Active subjects</span><strong data-subject-active>0</strong></article>
            </section>
            <section class="subjects-content">
                <div class="subjects-toolbar">
                    <div><h2>Subject catalogue</h2><p>Active subjects are available when staff enter exam and test marks.</p></div>
                    <label class="subjects-search"><span class="visually-hidden">Search subjects</span><i class="fas fa-search" aria-hidden="true"></i><input type="search" data-subject-search placeholder="Search name, code, or class"></label>
                </div>
                <form class="subjects-form" data-subject-form hidden>
                    <h3 data-subject-form-title>Add a subject</h3>
                    <div class="subjects-form-grid">
                        <label>Subject name *<input name="subjectName" required maxlength="100" placeholder="e.g. Mathematics"></label>
                        <label>Subject code *<input name="subjectCode" required maxlength="30" placeholder="e.g. MATH"></label>
                        <label>Category<select name="subjectCategory"><option>Core</option><option>Elective</option><option>Optional</option><option>Co-Curricular</option></select></label>
                        <label>Applicable class<select name="className"><option value="">All classes</option>${Array.from({ length: 12 }, (_, index) => `<option>Grade ${index + 1}</option>`).join('')}</select></label>
                        <label>Status<select name="status"><option>Active</option><option>Inactive</option></select></label>
                        <label class="subjects-description">Description<textarea name="description" maxlength="500" rows="2" placeholder="Optional details"></textarea></label>
                    </div>
                    <div class="subjects-form-actions">
                        <button class="subjects-secondary-button" type="button" data-subject-cancel>Cancel</button>
                        <button class="subjects-primary-button" type="submit">Save Subject</button>
                    </div>
                </form>
                <p class="subjects-feedback" data-subject-feedback role="status" aria-live="polite">Loading subjects…</p>
                <div class="subjects-table-wrap">
                    <table>
                        <thead><tr><th>Subject</th><th>Code</th><th>Category</th><th>Class</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody data-subject-rows><tr><td colspan="6">Loading subjects…</td></tr></tbody>
                    </table>
                </div>
            </section>`;

        const api = window.schoolPortalData;
        const identity = api?.getIdentity?.();
        const canEdit = administratorRoles.has(identity?.role)
            || identity?.permissions?.subjects?.edit === true;
        const form = section.querySelector('[data-subject-form]');
        const rows = section.querySelector('[data-subject-rows]');
        const feedback = section.querySelector('[data-subject-feedback]');
        const search = section.querySelector('[data-subject-search]');
        let records = [];
        let editingId = '';
        let unsubscribe = null;
        let destroyed = false;

        if (!canEdit) section.querySelector('[data-subject-add]').hidden = true;

        const render = () => {
            const query = search.value.trim().toLowerCase();
            const visible = records.filter(record => [
                record.subjectName, record.subjectCode, record.subjectCategory,
                record.className, record.status
            ].some(value => String(value || '').toLowerCase().includes(query)));
            section.querySelector('[data-subject-total]').textContent = String(records.length);
            section.querySelector('[data-subject-active]').textContent = String(records.filter(record =>
                String(record.status || 'Active').toLowerCase() === 'active'
            ).length);
            rows.innerHTML = visible.length ? visible.map(record => `
                <tr>
                    <td><strong>${escape(record.subjectName || record.name || 'Unnamed subject')}</strong>${record.description ? `<small>${escape(record.description)}</small>` : ''}</td>
                    <td>${escape(record.subjectCode || '—')}</td>
                    <td>${escape(record.subjectCategory || 'Core')}</td>
                    <td>${escape(record.className || 'All classes')}</td>
                    <td><span class="subjects-status ${String(record.status || 'Active').toLowerCase() === 'active' ? 'is-active' : 'is-inactive'}">${escape(record.status || 'Active')}</span></td>
                    <td>${canEdit ? `<div class="subjects-row-actions"><button type="button" data-subject-edit="${escape(record.id)}" aria-label="Edit ${escape(record.subjectName)}"><i class="fas fa-pen" aria-hidden="true"></i></button>${String(record.status || 'Active').toLowerCase() === 'active' ? `<button type="button" data-subject-deactivate="${escape(record.id)}" aria-label="Deactivate ${escape(record.subjectName)}"><i class="fas fa-ban" aria-hidden="true"></i></button>` : ''}</div>` : '—'}</td>
                </tr>`).join('') : '<tr><td colspan="6" class="subjects-empty">No subjects found. Add your school subjects to use them in marks entry.</td></tr>';
        };

        const closeForm = () => {
            form.reset();
            form.hidden = true;
            editingId = '';
            section.querySelector('[data-subject-form-title]').textContent = 'Add a subject';
        };

        const openForm = record => {
            form.reset();
            editingId = record ? String(record.id) : '';
            section.querySelector('[data-subject-form-title]').textContent = record ? 'Edit subject' : 'Add a subject';
            if (record) {
                Object.entries({
                    subjectName: record.subjectName || record.name || '',
                    subjectCode: record.subjectCode || '',
                    subjectCategory: record.subjectCategory || 'Core',
                    className: record.className || '',
                    status: record.status || 'Active',
                    description: record.description || ''
                }).forEach(([field, value]) => {
                    form.elements[field].value = value;
                });
            }
            form.hidden = false;
            form.elements.subjectName.focus();
        };

        const showError = (message, error) => {
            feedback.textContent = message;
            console.error(message, error);
        };

        section.querySelector('[data-subject-add]').addEventListener('click', () => openForm());
        section.querySelector('[data-subject-cancel]').addEventListener('click', closeForm);
        search.addEventListener('input', render);
        form.addEventListener('submit', async event => {
            event.preventDefault();
            if (!canEdit) return;
            const subjectName = form.elements.subjectName.value.trim();
            const subjectCode = form.elements.subjectCode.value.trim().toUpperCase();
            const duplicate = records.find(record =>
                String(record.id) !== editingId
                && (String(record.subjectName || record.name || '').trim().toLowerCase() === subjectName.toLowerCase()
                    || String(record.subjectCode || '').trim().toUpperCase() === subjectCode));
            if (duplicate) {
                feedback.textContent = 'A subject with this name or code already exists.';
                return;
            }
            const recordId = editingId || crypto.randomUUID();
            const record = {
                ...(records.find(item => String(item.id) === editingId) || {}),
                id: recordId,
                subjectName,
                subjectCode,
                subjectCategory: form.elements.subjectCategory.value,
                className: form.elements.className.value,
                status: form.elements.status.value,
                description: form.elements.description.value.trim()
            };
            try {
                if (!api?.saveRecord) throw new Error('School data storage is unavailable. Reload the app and try again.');
                await api.saveRecord('subjects', recordId, record);
                feedback.textContent = `Subject "${subjectName}" saved.`;
                closeForm();
            } catch (error) {
                showError(error?.message || 'Unable to save the subject.', error);
            }
        });

        section.addEventListener('click', async event => {
            const editButton = event.target.closest('[data-subject-edit]');
            if (editButton) {
                const record = records.find(item => String(item.id) === editButton.dataset.subjectEdit);
                if (record) openForm(record);
                return;
            }
            const deactivateButton = event.target.closest('[data-subject-deactivate]');
            if (!deactivateButton) return;
            const record = records.find(item => String(item.id) === deactivateButton.dataset.subjectDeactivate);
            if (!record || !confirm(`Deactivate "${record.subjectName || record.name}"? It will no longer be offered for new marks.`)) return;
            try {
                await api.saveRecord('subjects', record.id, { ...record, status: 'Inactive' });
                feedback.textContent = `Subject "${record.subjectName || record.name}" deactivated.`;
            } catch (error) {
                showError(error?.message || 'Unable to deactivate the subject.', error);
            }
        });

        const connect = async () => {
            if (!api?.subscribe) {
                rows.innerHTML = '<tr><td colspan="6" class="subjects-empty">School data is unavailable. Reload the app and try again.</td></tr>';
                showError('School data is unavailable. Reload the app and try again.');
                return;
            }
            try {
                unsubscribe = await api.subscribe('subjects', incoming => {
                    if (destroyed) return;
                    records = incoming.filter(record => record.deleted !== true)
                        .sort((left, right) => String(left.subjectName || left.name || '').localeCompare(String(right.subjectName || right.name || '')));
                    render();
                    feedback.textContent = records.length
                        ? `${records.length} subject${records.length === 1 ? '' : 's'} loaded.`
                        : 'No school subjects yet. Add your subjects here, then choose them in Exam & Test Marks.';
                });
            } catch (error) {
                rows.innerHTML = '<tr><td colspan="6" class="subjects-empty">Subjects could not be loaded.</td></tr>';
                showError(error?.message || 'Subjects could not be loaded.', error);
            }
        };

        section.addEventListener('remove', () => {
            destroyed = true;
            unsubscribe?.();
        }, { once: true });
        void connect();
        return section;
    };
})();
