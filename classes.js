(() => {
    const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[character]);
    const administratorRoles = new Set(['schoolAdmin', 'superAdmin', 'director', 'headTeacher']);

    window.createClassesModule = function createClassesModule() {
        const section = document.createElement('section');
        section.className = 'module classes-module';
        section.id = 'classesModule';
        section.innerHTML = `
            <header class="classes-header">
                <div>
                    <h1>Classes</h1>
                    <p>Manage school classes. Grade 1 through Grade 12 sample classes are added when missing.</p>
                </div>
            </header>
            <section class="classes-summary" aria-label="Class totals">
                <article><span>Total classes</span><strong data-class-total>0</strong></article>
                <article><span>Active classes</span><strong data-class-active>0</strong></article>
            </section>
            <section class="classes-content">
                <div class="classes-toolbar">
                    <div><h2>Class register</h2><p>Class names are used when assigning students and staff.</p></div>
                    <label class="classes-search"><span class="visually-hidden">Search classes</span><i class="fas fa-search" aria-hidden="true"></i><input type="search" data-class-search placeholder="Search name, code, year, or teacher"></label>
                    <button class="classes-primary-button" type="button" data-class-add>
                        <i class="fas fa-plus" aria-hidden="true"></i> Add Class
                    </button>
                </div>
                <form class="classes-form" data-class-form hidden>
                    <h3 data-class-form-title>Add a class</h3>
                    <div class="classes-form-grid">
                        <label>Class name *<input name="className" required maxlength="100" placeholder="e.g. Primary 1"></label>
                        <label>Class code<input name="classCode" maxlength="30" placeholder="e.g. P1"></label>
                        <label>Academic year<input name="academicYear" maxlength="20" placeholder="e.g. 2026"></label>
                        <label>Class teacher<input name="classTeacherName" maxlength="100" placeholder="Optional"></label>
                        <label>Capacity<input name="capacity" type="number" min="0" step="1" placeholder="Optional"></label>
                        <label>Status<select name="status"><option>Active</option><option>Inactive</option></select></label>
                        <label class="classes-description">Description<textarea name="description" maxlength="500" rows="2" placeholder="Optional details"></textarea></label>
                    </div>
                    <div class="classes-form-actions">
                        <button class="classes-secondary-button" type="button" data-class-cancel>Cancel</button>
                        <button class="classes-primary-button" type="submit">Save Class</button>
                    </div>
                </form>
                <p class="classes-feedback" data-class-feedback role="status" aria-live="polite">Loading classes…</p>
                <div class="classes-table-wrap">
                    <table>
                        <thead><tr><th>Class</th><th>Code</th><th>Academic year</th><th>Class teacher</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody data-class-rows><tr><td colspan="7">Loading classes…</td></tr></tbody>
                    </table>
                </div>
            </section>`;

        const api = window.schoolPortalData;
        const identity = api?.getIdentity?.();
        const canEdit = administratorRoles.has(identity?.role)
            || identity?.permissions?.classes?.edit === true;
        const form = section.querySelector('[data-class-form]');
        const rows = section.querySelector('[data-class-rows]');
        const feedback = section.querySelector('[data-class-feedback]');
        const search = section.querySelector('[data-class-search]');
        let records = [];
        let editingId = '';
        let unsubscribe = null;
        let destroyed = false;
        let sampleSeedStarted = false;

        if (!canEdit) section.querySelector('[data-class-add]').hidden = true;

        const render = () => {
            const query = search.value.trim().toLowerCase();
            const visible = records.filter(record => [
                record.name, record.className, record.classCode, record.academicYear,
                record.classTeacherName, record.status
            ].some(value => String(value || '').toLowerCase().includes(query)));
            section.querySelector('[data-class-total]').textContent = String(records.length);
            section.querySelector('[data-class-active]').textContent = String(records.filter(record =>
                String(record.status || 'Active').toLowerCase() === 'active'
            ).length);
            rows.innerHTML = visible.length ? visible.map(record => `
                <tr>
                    <td><strong>${escape(record.name || record.className || record.id)}</strong>${record.description ? `<small>${escape(record.description)}</small>` : ''}</td>
                    <td>${escape(record.classCode || '—')}</td>
                    <td>${escape(record.academicYear || '—')}</td>
                    <td>${escape(record.classTeacherName || '—')}</td>
                    <td>${record.capacity === '' || record.capacity == null ? '—' : escape(record.capacity)}</td>
                    <td><span class="classes-status ${String(record.status || 'Active').toLowerCase() === 'active' ? 'is-active' : 'is-inactive'}">${escape(record.status || 'Active')}</span></td>
                    <td>${canEdit ? `<div class="classes-row-actions"><button type="button" data-class-edit="${escape(record.id)}" aria-label="Edit ${escape(record.name || record.className)}"><i class="fas fa-pen" aria-hidden="true"></i></button>${String(record.status || 'Active').toLowerCase() === 'active' ? `<button type="button" data-class-deactivate="${escape(record.id)}" aria-label="Deactivate ${escape(record.name || record.className)}"><i class="fas fa-ban" aria-hidden="true"></i></button>` : ''}</div>` : '—'}</td>
                </tr>`).join('') : '<tr><td colspan="7" class="classes-empty">No classes found. Add your school classes to get started.</td></tr>';
        };

        const closeForm = () => {
            form.reset();
            form.hidden = true;
            editingId = '';
            section.querySelector('[data-class-form-title]').textContent = 'Add a class';
        };

        const openForm = record => {
            form.reset();
            editingId = record ? String(record.id) : '';
            section.querySelector('[data-class-form-title]').textContent = record ? 'Edit class' : 'Add a class';
            if (record) {
                const values = {
                    className: record.name || record.className || '',
                    classCode: record.classCode || '',
                    academicYear: record.academicYear || '',
                    classTeacherName: record.classTeacherName || '',
                    capacity: record.capacity ?? '',
                    status: record.status || 'Active',
                    description: record.description || ''
                };
                Object.entries(values).forEach(([name, value]) => {
                    form.elements.namedItem(name).value = value;
                });
            }
            form.hidden = false;
            form.elements.namedItem('className').focus();
        };

        const showError = (message, error) => {
            feedback.textContent = message;
            if (error) console.error(message, error);
        };

        const handleSyncError = event => {
            if (event.detail?.collection === 'classes') {
                showError('Classes could not be loaded or synchronized. Check your access and connection.', event.detail.error);
            }
        };

        const seedDefaultClasses = async () => {
            if (!canEdit || sampleSeedStarted) return;
            sampleSeedStarted = true;
            const normalize = value => String(value || '').trim().toLocaleLowerCase();
            const existingNames = new Set(records.flatMap(record => [
                record.name, record.className, record.class, record.streamName
            ]).map(normalize).filter(Boolean));
            const missingNames = window.schoolPortalDefaultClassNames.filter(name => !existingNames.has(normalize(name)));
            if (!missingNames.length) return;

            feedback.textContent = `Adding ${missingNames.length} sample classes…`;
            const results = await Promise.allSettled(missingNames.map(name => {
                const id = `sample-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                const recordId = records.some(record => String(record.id) === id) ? crypto.randomUUID() : id;
                return api.saveRecord('classes', recordId, {
                    id: recordId,
                    name,
                    className: name,
                    status: 'Active',
                    isSample: true
                });
            }));
            const failed = results.filter(result => result.status === 'rejected');
            const added = results.length - failed.length;
            failed.forEach(result => console.error('Unable to add a default sample class.', result.reason));
            feedback.textContent = failed.length
                ? `${added} sample class${added === 1 ? '' : 'es'} added; ${failed.length} could not be saved. Check your connection and permissions.`
                : `${added} sample classes added.`;
        };

        section.querySelector('[data-class-add]').addEventListener('click', () => openForm());
        section.querySelector('[data-class-cancel]').addEventListener('click', closeForm);
        search.addEventListener('input', render);
        form.addEventListener('submit', async event => {
            event.preventDefault();
            if (!canEdit) return;
            const field = name => form.elements.namedItem(name).value.trim();
            const name = field('className');
            const academicYear = field('academicYear');
            const classCode = field('classCode').toUpperCase();
            const duplicate = records.find(record => {
                if (String(record.id) === editingId) return false;
                const existingName = String(record.name || record.className || '').trim().toLowerCase();
                const existingYear = String(record.academicYear || '').trim().toLowerCase();
                const existingCode = String(record.classCode || '').trim().toUpperCase();
                return (existingName === name.toLowerCase() && existingYear === academicYear.toLowerCase())
                    || (classCode && existingCode === classCode && existingYear === academicYear.toLowerCase());
            });
            if (duplicate) {
                feedback.textContent = 'A class with this name or code already exists for that academic year.';
                return;
            }
            const id = editingId || crypto.randomUUID();
            const capacityValue = field('capacity');
            const record = {
                ...(records.find(item => String(item.id) === editingId) || {}),
                id,
                name,
                className: name,
                classCode,
                academicYear,
                classTeacherName: field('classTeacherName'),
                capacity: capacityValue ? Number(capacityValue) : '',
                status: field('status'),
                description: field('description')
            };
            try {
                if (!api?.saveRecord) throw new Error('School data storage is unavailable. Reload the app and try again.');
                await api.saveRecord('classes', id, record);
                feedback.textContent = `Class "${name}" saved.`;
                closeForm();
            } catch (error) {
                showError(error?.message || 'Unable to save the class.', error);
            }
        });

        section.addEventListener('click', async event => {
            const editButton = event.target.closest('[data-class-edit]');
            if (editButton) {
                const record = records.find(item => String(item.id) === editButton.dataset.classEdit);
                if (record) openForm(record);
                return;
            }
            const deactivateButton = event.target.closest('[data-class-deactivate]');
            if (!deactivateButton) return;
            const record = records.find(item => String(item.id) === deactivateButton.dataset.classDeactivate);
            const name = record?.name || record?.className || 'this class';
            if (!record || !confirm(`Deactivate "${name}"?`)) return;
            try {
                await api.saveRecord('classes', record.id, { ...record, status: 'Inactive' });
                feedback.textContent = `Class "${name}" deactivated.`;
            } catch (error) {
                showError(error?.message || 'Unable to deactivate the class.', error);
            }
        });

        const connect = async () => {
            if (!api?.subscribe) {
                rows.innerHTML = '<tr><td colspan="7" class="classes-empty">School data is unavailable. Reload the app and try again.</td></tr>';
                showError('School data is unavailable. Reload the app and try again.');
                return;
            }
            try {
                unsubscribe = await api.subscribe('classes', incoming => {
                    if (destroyed) return;
                    records = incoming.filter(record => record.deleted !== true)
                        .sort((left, right) => String(left.name || left.className || '').localeCompare(String(right.name || right.className || '')));
                    render();
                    feedback.textContent = records.length
                        ? `${records.length} class${records.length === 1 ? '' : 'es'} loaded.`
                        : 'No classes yet. Add your school classes here.';
                    void seedDefaultClasses().catch(error => {
                        showError(error?.message || 'Unable to add the sample classes.', error);
                    });
                });
            } catch (error) {
                rows.innerHTML = '<tr><td colspan="7" class="classes-empty">Classes could not be loaded.</td></tr>';
                showError(error?.message || 'Classes could not be loaded.', error);
            }
        };

        window.addEventListener('school-portal-sync-error', handleSyncError);
        section.addEventListener('remove', () => {
            destroyed = true;
            unsubscribe?.();
            window.removeEventListener('school-portal-sync-error', handleSyncError);
        }, { once: true });
        void connect();
        return section;
    };
})();
