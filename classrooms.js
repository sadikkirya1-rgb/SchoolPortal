(() => {
    const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[character]);
    const administratorRoles = new Set(['schoolAdmin', 'superAdmin', 'director', 'headTeacher']);

    window.createClassroomsModule = function createClassroomsModule() {
        const section = document.createElement('section');
        section.className = 'module classrooms-module';
        section.id = 'classroomsModule';
        section.innerHTML = `
            <header class="classrooms-header">
                <div>
                    <h1>Classrooms</h1>
                    <p>Manage the rooms available when scheduling class timetables.</p>
                </div>
            </header>
            <section class="classrooms-summary" aria-label="Classroom totals">
                <article><span>Total classrooms</span><strong data-classroom-total>0</strong></article>
                <article><span>Active classrooms</span><strong data-classroom-active>0</strong></article>
            </section>
            <section class="classrooms-content">
                <div class="classrooms-toolbar">
                    <div><h2>Classroom register</h2><p>Active classrooms are offered in the timetable form.</p></div>
                    <label class="classrooms-search"><span class="visually-hidden">Search classrooms</span><i class="fas fa-search" aria-hidden="true"></i><input type="search" data-classroom-search placeholder="Search name, code, building, or floor"></label>
                    <button class="classrooms-primary-button" type="button" data-classroom-add>
                        <i class="fas fa-plus" aria-hidden="true"></i> Add Classroom
                    </button>
                </div>
                <form class="classrooms-form" data-classroom-form hidden>
                    <h3 data-classroom-form-title>Add a classroom</h3>
                    <div class="classrooms-form-grid">
                        <label>Classroom name *<input name="roomName" required maxlength="100" placeholder="e.g. Room 101"></label>
                        <label>Room code<input name="roomCode" maxlength="30" placeholder="e.g. R101"></label>
                        <label>Building<input name="building" maxlength="100" placeholder="Optional"></label>
                        <label>Floor<input name="floor" maxlength="30" placeholder="Optional"></label>
                        <label>Capacity<input name="capacity" type="number" min="0" step="1" placeholder="Optional"></label>
                        <label>Status<select name="status"><option>Active</option><option>Inactive</option></select></label>
                        <label class="classrooms-description">Description<textarea name="description" maxlength="500" rows="2" placeholder="Optional details"></textarea></label>
                    </div>
                    <div class="classrooms-form-actions">
                        <button class="classrooms-secondary-button" type="button" data-classroom-cancel>Cancel</button>
                        <button class="classrooms-primary-button" type="submit">Save Classroom</button>
                    </div>
                </form>
                <p class="classrooms-feedback" data-classroom-feedback role="status" aria-live="polite">Loading classrooms…</p>
                <div class="classrooms-table-wrap">
                    <table>
                        <thead><tr><th>Classroom</th><th>Code</th><th>Building</th><th>Floor</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody data-classroom-rows><tr><td colspan="7">Loading classrooms…</td></tr></tbody>
                    </table>
                </div>
            </section>`;

        const api = window.schoolPortalData;
        const identity = api?.getIdentity?.();
        const canEdit = administratorRoles.has(identity?.role)
            || identity?.permissions?.classrooms?.edit === true;
        const form = section.querySelector('[data-classroom-form]');
        const rows = section.querySelector('[data-classroom-rows]');
        const feedback = section.querySelector('[data-classroom-feedback]');
        const search = section.querySelector('[data-classroom-search]');
        let records = [];
        let editingId = '';
        let unsubscribe = null;
        let destroyed = false;

        if (!canEdit) section.querySelector('[data-classroom-add]').hidden = true;

        const render = () => {
            const query = search.value.trim().toLowerCase();
            const visible = records.filter(record => [
                record.roomName, record.name, record.classroomName, record.roomCode,
                record.building, record.floor, record.status
            ].some(value => String(value || '').toLowerCase().includes(query)));
            section.querySelector('[data-classroom-total]').textContent = String(records.length);
            section.querySelector('[data-classroom-active]').textContent = String(records.filter(record =>
                String(record.status || 'Active').toLowerCase() === 'active'
            ).length);
            rows.innerHTML = visible.length ? visible.map(record => `
                <tr>
                    <td><strong>${escape(record.roomName || record.name || record.classroomName || 'Unnamed classroom')}</strong>${record.description ? `<small>${escape(record.description)}</small>` : ''}</td>
                    <td>${escape(record.roomCode || '—')}</td>
                    <td>${escape(record.building || '—')}</td>
                    <td>${escape(record.floor || '—')}</td>
                    <td>${record.capacity === '' || record.capacity == null ? '—' : escape(record.capacity)}</td>
                    <td><span class="classrooms-status ${String(record.status || 'Active').toLowerCase() === 'active' ? 'is-active' : 'is-inactive'}">${escape(record.status || 'Active')}</span></td>
                    <td>${canEdit ? `<div class="classrooms-row-actions"><button type="button" data-classroom-edit="${escape(record.id)}" aria-label="Edit ${escape(record.roomName || record.name)}"><i class="fas fa-pen" aria-hidden="true"></i></button>${String(record.status || 'Active').toLowerCase() === 'active' ? `<button type="button" data-classroom-deactivate="${escape(record.id)}" aria-label="Deactivate ${escape(record.roomName || record.name)}"><i class="fas fa-ban" aria-hidden="true"></i></button>` : ''}</div>` : '—'}</td>
                </tr>`).join('') : '<tr><td colspan="7" class="classrooms-empty">No classrooms found. Add your classrooms to use them in timetables.</td></tr>';
        };

        const closeForm = () => {
            form.reset();
            form.hidden = true;
            editingId = '';
            section.querySelector('[data-classroom-form-title]').textContent = 'Add a classroom';
        };

        const openForm = record => {
            form.reset();
            editingId = record ? String(record.id) : '';
            section.querySelector('[data-classroom-form-title]').textContent = record ? 'Edit classroom' : 'Add a classroom';
            if (record) {
                const values = {
                    roomName: record.roomName || record.name || record.classroomName || '',
                    roomCode: record.roomCode || '',
                    building: record.building || '',
                    floor: record.floor || '',
                    capacity: record.capacity ?? '',
                    status: record.status || 'Active',
                    description: record.description || ''
                };
                Object.entries(values).forEach(([name, value]) => {
                    form.elements.namedItem(name).value = value;
                });
            }
            form.hidden = false;
            form.elements.namedItem('roomName').focus();
        };

        const showError = (message, error) => {
            feedback.textContent = message;
            if (error) console.error(message, error);
        };

        section.querySelector('[data-classroom-add]').addEventListener('click', () => openForm());
        section.querySelector('[data-classroom-cancel]').addEventListener('click', closeForm);
        search.addEventListener('input', render);
        form.addEventListener('submit', async event => {
            event.preventDefault();
            if (!canEdit) return;
            const field = name => form.elements.namedItem(name).value.trim();
            const roomName = field('roomName');
            const roomCode = field('roomCode').toUpperCase();
            const duplicate = records.find(record => {
                if (String(record.id) === editingId) return false;
                const existingName = String(record.roomName || record.name || record.classroomName || '').trim().toLowerCase();
                const existingCode = String(record.roomCode || '').trim().toUpperCase();
                return existingName === roomName.toLowerCase()
                    || (roomCode && existingCode === roomCode);
            });
            if (duplicate) {
                feedback.textContent = 'A classroom with this name or code already exists.';
                return;
            }
            const id = editingId || crypto.randomUUID();
            const capacityValue = field('capacity');
            const record = {
                ...(records.find(item => String(item.id) === editingId) || {}),
                id,
                roomName,
                name: roomName,
                roomCode,
                building: field('building'),
                floor: field('floor'),
                capacity: capacityValue ? Number(capacityValue) : '',
                status: field('status'),
                description: field('description')
            };
            try {
                if (!api?.saveRecord) throw new Error('School data storage is unavailable. Reload the app and try again.');
                await api.saveRecord('classrooms', id, record);
                feedback.textContent = `Classroom "${roomName}" saved.`;
                closeForm();
            } catch (error) {
                showError(error?.message || 'Unable to save the classroom.', error);
            }
        });

        section.addEventListener('click', async event => {
            const editButton = event.target.closest('[data-classroom-edit]');
            if (editButton) {
                const record = records.find(item => String(item.id) === editButton.dataset.classroomEdit);
                if (record) openForm(record);
                return;
            }
            const deactivateButton = event.target.closest('[data-classroom-deactivate]');
            if (!deactivateButton) return;
            const record = records.find(item => String(item.id) === deactivateButton.dataset.classroomDeactivate);
            const name = record?.roomName || record?.name || 'this classroom';
            if (!record || !confirm(`Deactivate "${name}"?`)) return;
            try {
                await api.saveRecord('classrooms', record.id, { ...record, status: 'Inactive' });
                feedback.textContent = `Classroom "${name}" deactivated.`;
            } catch (error) {
                showError(error?.message || 'Unable to deactivate the classroom.', error);
            }
        });

        const connect = async () => {
            if (!api?.subscribe) {
                rows.innerHTML = '<tr><td colspan="7" class="classrooms-empty">School data is unavailable. Reload the app and try again.</td></tr>';
                showError('School data is unavailable. Reload the app and try again.');
                return;
            }
            try {
                unsubscribe = await api.subscribe('classrooms', incoming => {
                    if (destroyed) return;
                    records = incoming.filter(record => record.deleted !== true)
                        .sort((left, right) => String(left.roomName || left.name || '').localeCompare(String(right.roomName || right.name || '')));
                    render();
                    feedback.textContent = records.length
                        ? `${records.length} classroom${records.length === 1 ? '' : 's'} loaded.`
                        : 'No classrooms yet. Add your classrooms here.';
                });
            } catch (error) {
                rows.innerHTML = '<tr><td colspan="7" class="classrooms-empty">Classrooms could not be loaded.</td></tr>';
                showError(error?.message || 'Classrooms could not be loaded.', error);
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
