(() => {
    const fields = [
        'day', 'startTime', 'endTime', 'periodNo', 'academicYear', 'className',
        'section', 'subject', 'subjectCode', 'teacher', 'room', 'status', 'notes'
    ];
    const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[character]);
    const read = () => {
        try {
            return JSON.parse(localStorage.getItem('school_timetables')) || [];
        } catch {
            return [];
        }
    };
    const save = records => localStorage.setItem('school_timetables', JSON.stringify(records));
    const time = value => {
        if (!value) return '-';
        const [hours, minutes] = value.split(':');
        const hour = Number(hours);
        return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
    };
    const normalize = value => String(value || '').trim().toLocaleLowerCase();
    const isActive = record => !['inactive', 'resigned', 'retired'].includes(
        String(record.status || 'Active').toLowerCase()
    );

    window.createTimetablesModule = function createTimetablesModule() {
        const sec = document.createElement('section');
        sec.className = 'module timetables-module';
        sec.id = 'timetablesModule';
        const grades = window.schoolPortalDefaultClassNames
            .map(name => `<option>${escape(name)}</option>`).join('');
        sec.innerHTML = `<header class="tm-topbar"><div><h1>Timetable Management</h1><p>Manage class schedules, periods, subjects and teachers</p></div><div class="tm-actions"><button class="tm-icon-btn" type="button" data-theme title="Theme">🌙</button><button class="tm-icon-btn" type="button" data-print-current title="Print">🖨️</button><div class="tm-user"><div class="tm-avatar">AD</div><div><strong>Administrator</strong><small>School Admin</small></div></div></div></header><div class="tm-cards"><div class="tm-card tm-stat"><div><p>Total Timetable Entries</p><h2 data-stat="entries">0</h2><span>Scheduled periods</span></div><div class="tm-stat-icon tm-blue">📅</div></div><div class="tm-card tm-stat"><div><p>Classes Covered</p><h2 data-stat="classes">0</h2><span>Active classes</span></div><div class="tm-stat-icon tm-cyan">🏫</div></div><div class="tm-card tm-stat"><div><p>Subjects</p><h2 data-stat="subjects">0</h2><span>Scheduled subjects</span></div><div class="tm-stat-icon tm-green">📚</div></div><div class="tm-card tm-stat"><div><p>Teachers</p><h2 data-stat="teachers">0</h2><span>Assigned teachers</span></div><div class="tm-stat-icon tm-orange">👨‍🏫</div></div></div><div class="tm-section-head"><div><h2>Timetables</h2><p class="tm-subtitle">Class timetable and daily schedule</p></div><div class="tm-toolbar"><div class="tm-search"><span>🔍</span><input type="search" data-search placeholder="Search timetable..."></div><button class="tm-btn tm-btn-light" type="button" data-export>⬇ Export</button><button class="tm-btn tm-btn-primary" type="button" data-add>+ Add Timetable</button></div></div><div class="tm-filters"><label class="tm-filter">Class<select data-filter="className"><option value="">All Classes</option>${grades}</select></label><label class="tm-filter">Day<select data-filter="day"><option value="">All Days</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option></select></label><label class="tm-filter">Section<select data-filter="section"><option value="">All Sections</option><option>A</option><option>B</option><option>C</option><option>D</option></select></label><label class="tm-filter">Academic Year<select data-filter="academicYear"><option value="">All Years</option><option>2026 - 2027</option><option>2025 - 2026</option><option>2024 - 2025</option></select></label></div><div class="tm-card tm-table-card"><div class="tm-table-wrap"><table><thead><tr><th>Day</th><th>Time</th><th>Class</th><th>Subject</th><th>Teacher</th><th>Room</th><th>Academic Year</th><th>Status</th><th>Actions</th></tr></thead><tbody data-table></tbody></table></div></div><div class="tm-modal" data-modal><div class="tm-modal-box"><div class="tm-modal-head"><div><h2 data-modal-title>Add New Timetable</h2><p class="tm-subtitle">Enter timetable schedule information</p></div><button class="tm-close" type="button" data-close>×</button></div><form data-form><div class="tm-form-body"><div class="tm-form-section"><h3>📅 Schedule Information</h3><div class="tm-form-grid"><label class="tm-form-group">Day *<select name="day" required><option value="">Select Day</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option></select></label><label class="tm-form-group">Start Time *<input type="time" name="startTime" required></label><label class="tm-form-group">End Time *<input type="time" name="endTime" required></label><label class="tm-form-group">Period Number<input type="number" name="periodNo" min="1" placeholder="e.g. 1"></label><label class="tm-form-group">Academic Year *<input name="academicYear" value="2026 - 2027" required></label><label class="tm-form-group">Status<select name="status"><option>Active</option><option>Inactive</option></select></label></div></div><div class="tm-form-section"><h3>🏫 Class Information</h3><div class="tm-form-grid"><label class="tm-form-group">Class *<select name="className" required><option value="">Select Class</option>${grades}</select></label><label class="tm-form-group">Section *<select name="section" required><option>A</option><option>B</option><option>C</option><option>D</option></select></label><label class="tm-form-group">Room / Classroom<select name="room"><option value="">No classroom</option></select></label></div></div><div class="tm-form-section"><h3>📚 Subject &amp; Teacher</h3><div class="tm-form-grid"><label class="tm-form-group">Subject *<select name="subject" required><option value="">Loading subjects…</option></select></label><label class="tm-form-group">Teacher *<select name="teacher" required disabled><option value="">Select a subject first</option></select></label><label class="tm-form-group">Subject Code<input name="subjectCode" placeholder="Automatically filled from the selected subject" readonly></label><label class="tm-form-group full">Notes<textarea name="notes" placeholder="Additional timetable notes..."></textarea></label></div><p class="tm-catalog-feedback" data-catalog-feedback role="status" aria-live="polite">Loading subjects, teachers and classrooms…</p></div></div><div class="tm-modal-foot"><button type="button" class="tm-btn tm-btn-light" data-cancel>Cancel</button><button type="submit" class="tm-btn tm-btn-primary">Save Timetable</button></div></form></div></div><div class="tm-print-area" data-print-area></div>`;
        sec.querySelector('.tm-topbar').remove();

        let records = read();
        let editingId = null;
        const $ = selector => sec.querySelector(selector);
        const form = $('[data-form]');
        const modal = $('[data-modal]');
        const subjectSelect = form.elements.subject;
        const teacherSelect = form.elements.teacher;
        const roomSelect = form.elements.room;
        const subjectCodeInput = form.elements.subjectCode;
        const catalog = { subjects: [], teachers: [], classrooms: [] };
        const catalogState = { subjects: 'loading', teachers: 'loading', classrooms: 'loading' };
        const subscriptions = [];
        let destroyed = false;
        const liveSummary = document.createElement('aside');
        liveSummary.className = 'tm-live-summary';
        liveSummary.innerHTML = '<h3>Timetable Summary</h3><p>Review the schedule before saving.</p><div data-timetable-summary></div>';
        form.insertBefore(liveSummary, form.querySelector('.tm-modal-foot'));

        const updateSummary = () => {
            const target = liveSummary.querySelector('[data-timetable-summary]');
            target.replaceChildren(...fields.map(name => {
                const field = form.elements[name];
                const row = document.createElement('div');
                const label = document.createElement('span');
                const value = document.createElement('strong');
                row.className = 'tm-summary-row';
                label.textContent = field.closest('label')?.childNodes[0].textContent.trim() || name;
                value.textContent = name === 'startTime' || name === 'endTime'
                    ? time(field.value)
                    : field.value || '-';
                row.append(label, value);
                return row;
            }));
        };

        const renderSelect = (select, placeholder, options, selected = '') => {
            select.replaceChildren(new Option(placeholder, ''));
            options.forEach(option => select.add(new Option(option.label, option.value)));
            if (selected && !options.some(option => option.value === selected)) {
                select.add(new Option(`${selected} (not in the active catalogue)`, selected));
            }
            select.value = selected;
        };

        const selectedSubject = () => catalog.subjects.find(subject =>
            normalize(subject.subjectName || subject.name) === normalize(subjectSelect.value)
        );
        const refreshSubjects = (selected = subjectSelect.value) => {
            const options = catalog.subjects
                .map(subject => {
                    const name = String(subject.subjectName || subject.name || '').trim();
                    if (!name) return null;
                    const code = String(subject.subjectCode || '').trim();
                    return { value: name, label: code ? `${name} (${code})` : name };
                })
                .filter(Boolean);
            renderSelect(subjectSelect, options.length ? 'Select Subject' : 'No active subjects available', options, selected);
            const subjectCode = selectedSubject()?.subjectCode;
            if (subjectCode) subjectCodeInput.value = subjectCode;
            else if (!selected) subjectCodeInput.value = '';
            refreshTeachers(teacherSelect.value);
        };
        const refreshTeachers = (selected = teacherSelect.value) => {
            const subjectName = normalize(subjectSelect.value);
            const options = catalog.teachers
                .filter(isActive)
                .filter(teacher => normalize(teacher.subject || teacher.subjectName) === subjectName && subjectName)
                .map(teacher => {
                    const name = String(teacher.name || [teacher.firstName, teacher.lastName]
                        .filter(Boolean).join(' ') || teacher.fullName || '').trim();
                    return name ? { value: name, label: name } : null;
                })
                .filter(Boolean);
            renderSelect(
                teacherSelect,
                !subjectName ? 'Select a subject first' : options.length ? 'Select Teacher' : 'No teachers assigned to this subject',
                options,
                selected
            );
            teacherSelect.disabled = !subjectName || (options.length === 0 && !selected);
        };
        const refreshClassrooms = (selected = roomSelect.value) => {
            const options = catalog.classrooms
                .filter(isActive)
                .map(room => {
                    const name = String(room.roomName || room.name || room.classroomName || '').trim();
                    if (!name) return null;
                    const code = String(room.roomCode || '').trim();
                    return { value: name, label: code ? `${name} (${code})` : name };
                })
                .filter(Boolean);
            renderSelect(roomSelect, options.length ? 'No classroom' : 'No active classrooms available', options, selected);
        };
        const updateCatalogFeedback = () => {
            const status = $('[data-catalog-feedback]');
            const errors = Object.entries(catalogState)
                .filter(([, state]) => state === 'error')
                .map(([name]) => name);
            const pending = Object.values(catalogState).some(state => state === 'loading');
            status.textContent = errors.length
                ? `Unable to load ${errors.join(', ')}. Check your connection and permissions.`
                : pending ? 'Loading subjects, teachers and classrooms…'
                    : 'Subjects, teachers and classrooms are up to date.';
        };

        const render = () => {
            const search = $('[data-search]').value.toLowerCase().trim();
            const filters = Object.fromEntries([...sec.querySelectorAll('[data-filter]')]
                .map(select => [select.dataset.filter, select.value]));
            const filtered = records.filter(record =>
                Object.values(record).join(' ').toLowerCase().includes(search)
                && Object.entries(filters).every(([field, value]) => !value || record[field] === value)
            );
            $('[data-table]').innerHTML = filtered.length ? filtered.map(record => `<tr><td><span class="tm-day-badge">${escape(record.day)}</span></td><td><span class="tm-time-badge">${time(record.startTime)} - ${time(record.endTime)}</span></td><td><strong>${escape(record.className)}</strong><div class="tm-muted">Section ${escape(record.section)}</div></td><td><strong>${escape(record.subject)}</strong><div class="tm-muted">${escape(record.subjectCode || '-')}</div></td><td><span class="tm-muted">${escape(record.teacher)}</span></td><td>${escape(record.room || '-')}</td><td>${escape(record.academicYear)}</td><td><span class="tm-status ${record.status === 'Active' ? 'tm-status-active' : 'tm-status-inactive'}">${escape(record.status)}</span></td><td><div class="tm-row-actions"><button class="tm-action-btn" type="button" data-action="preview" data-id="${escape(record.id)}" title="Preview">👁️</button><button class="tm-action-btn" type="button" data-action="edit" data-id="${escape(record.id)}" title="Edit">✏️</button><button class="tm-action-btn" type="button" data-action="delete" data-id="${escape(record.id)}" title="Delete">🗑️</button></div></td></tr>`).join('')
                : '<tr><td colspan="9"><div class="tm-empty"><div style="font-size:40px">📅</div><h3>No timetable entries found</h3><p>Add a timetable or change your filters.</p></div></td></tr>';
            $('[data-stat="entries"]').textContent = records.length;
            $('[data-stat="classes"]').textContent = new Set(records.map(record =>
                `${record.className}-${record.section}`
            )).size;
            $('[data-stat="subjects"]').textContent = new Set(records.map(record => record.subject)).size;
            $('[data-stat="teachers"]').textContent = new Set(records.map(record => record.teacher)).size;
        };

        const openForm = record => {
            editingId = record?.id || null;
            $('[data-modal-title]').textContent = record ? 'Edit Timetable' : 'Add New Timetable';
            form.reset();
            if (!record) {
                form.elements.academicYear.value = '2026 - 2027';
                form.elements.status.value = 'Active';
                form.elements.section.value = 'A';
            } else {
                fields.forEach(field => {
                    if (field !== 'subject' && field !== 'teacher' && field !== 'room' && field !== 'subjectCode') {
                        form.elements[field].value = record[field] || '';
                    }
                });
            }
            refreshSubjects(record?.subject || '');
            refreshTeachers(record?.teacher || '');
            refreshClassrooms(record?.room || '');
            subjectCodeInput.value = selectedSubject()?.subjectCode || record?.subjectCode || '';
            modal.classList.add('show');
            updateSummary();
        };
        const closeForm = () => {
            modal.classList.remove('show');
            editingId = null;
        };
        const printRecord = record => {
            const logo = localStorage.getItem('school_logo');
            $('[data-print-area]').innerHTML = `<div class="tm-print-page"><div class="tm-print-content"><div class="tm-print-header"><div class="tm-print-logo">${logo ? `<img src="${escape(logo)}" alt="School Logo" style="width:100%;height:100%;object-fit:contain">` : 'S'}</div><div class="tm-print-header-text"><h1>SMART SCHOOL</h1><h2>Timetable Schedule</h2><p>Excellence · Character · Knowledge</p></div></div><div class="tm-print-title"><h2>CLASS TIMETABLE</h2></div><div class="tm-print-section">TIMETABLE INFORMATION</div><table class="tm-info-table"><tr><th>Academic Year</th><td>${escape(record.academicYear)}</td><th>Class</th><td>${escape(record.className)}</td></tr><tr><th>Section</th><td>${escape(record.section)}</td><th>Day</th><td>${escape(record.day)}</td></tr></table><div class="tm-print-section">DAILY SCHEDULE</div><table class="tm-print-timetable"><tr><th>Period</th><th>Time</th><th>Subject</th><th>Subject Code</th><th>Teacher</th><th>Room</th><th>Status</th></tr><tr><td>${escape(record.periodNo || '-')}</td><td>${time(record.startTime)} - ${time(record.endTime)}</td><td>${escape(record.subject)}</td><td>${escape(record.subjectCode || '-')}</td><td>${escape(record.teacher)}</td><td>${escape(record.room || '-')}</td><td>${escape(record.status)}</td></tr></table><div class="tm-print-section">NOTES</div><table class="tm-info-table"><tr><td style="height:60px">${escape(record.notes || 'No additional notes.')}</td></tr></table><div class="tm-print-section">OFFICIAL SIGNATORIES</div><div class="tm-signatures"><div class="tm-signature">Class Teacher</div><div class="tm-signature">Timetable Coordinator</div><div class="tm-signature">Principal / Head of School</div></div></div><div class="tm-print-footer">This document is an official timetable record generated by the School Management System.</div></div>`;
            window.print();
        };

        form.addEventListener('input', updateSummary);
        form.addEventListener('change', updateSummary);
        subjectSelect.addEventListener('change', () => {
            const subject = selectedSubject();
            subjectCodeInput.value = subject?.subjectCode || '';
            refreshTeachers('');
            updateSummary();
        });
        $('[data-add]').addEventListener('click', () => openForm());
        $('[data-search]').addEventListener('input', render);
        sec.querySelectorAll('[data-filter]').forEach(select => select.addEventListener('change', render));
        $('[data-close]').addEventListener('click', closeForm);
        $('[data-cancel]').addEventListener('click', closeForm);
        modal.addEventListener('click', event => {
            if (event.target === modal) closeForm();
        });
        $('[data-table]').addEventListener('click', event => {
            const button = event.target.closest('[data-action]');
            if (!button) return;
            const record = records.find(item => String(item.id) === button.dataset.id);
            if (!record) return;
            if (button.dataset.action === 'preview') printRecord(record);
            if (button.dataset.action === 'edit') openForm(record);
            if (button.dataset.action === 'delete'
                && confirm(`Delete ${record.day} timetable for ${record.className} - Section ${record.section}?`)) {
                records = records.filter(item => item.id !== record.id);
                save(records);
                render();
            }
        });
        form.addEventListener('submit', event => {
            event.preventDefault();
            const data = Object.fromEntries(new FormData(form).entries());
            data.subjectCode = selectedSubject()?.subjectCode || subjectCodeInput.value;
            data.id = editingId || Date.now();
            if (editingId) records[records.findIndex(item => item.id === editingId)] = data;
            else records.push(data);
            save(records);
            render();
            closeForm();
        });
        $('[data-export]').addEventListener('click', () => {
            if (!records.length) return alert('No timetable records to export.');
            const headers = ['Day', 'Start Time', 'End Time', 'Period', 'Academic Year', 'Class', 'Section', 'Subject', 'Subject Code', 'Teacher', 'Room', 'Status', 'Notes'];
            const csv = [headers, ...records.map(record => fields.map(field => record[field]))]
                .map(row => row.map(value => `"${String(value || '').replace(/"/g, '""')}"`).join(','))
                .join('\n');
            const link = document.createElement('a');
            link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
            link.download = 'timetables.csv';
            link.click();
            URL.revokeObjectURL(link.href);
        });

        const api = window.schoolPortalData;
        const connectCatalog = async (collection, update) => {
            if (!api?.subscribe) {
                catalogState[collection] = 'error';
                updateCatalogFeedback();
                console.error('School data is unavailable. Reload the app and try again.');
                return;
            }
            try {
                const unsubscribe = await api.subscribe(collection, incoming => {
                    if (destroyed) return;
                    catalog[collection] = incoming.filter(record =>
                        record.deleted !== true
                        && (collection === 'subjects' ? String(record.status || 'Active').toLowerCase() === 'active' : isActive(record))
                    );
                    catalogState[collection] = 'loaded';
                    update();
                    updateCatalogFeedback();
                });
                subscriptions.push(unsubscribe);
            } catch (error) {
                catalogState[collection] = 'error';
                updateCatalogFeedback();
                console.error(`Unable to load ${collection} for the timetable form.`, error);
            }
        };
        void connectCatalog('subjects', () => refreshSubjects());
        void connectCatalog('teachers', () => refreshTeachers());
        void connectCatalog('classrooms', () => refreshClassrooms());
        sec.addEventListener('remove', () => {
            destroyed = true;
            subscriptions.forEach(unsubscribe => unsubscribe?.());
        }, { once: true });

        render();
        return sec;
    };
})();
