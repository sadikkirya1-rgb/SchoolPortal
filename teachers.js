(() => {

    const logo = 'https://via.placeholder.com/150x150.png?text=LOGO';
    const fields = ['firstName','lastName','employeeNo','dob','gender','nationality','department','subject','designation','joiningDate','employmentType','status','phone','email','emergency','address','qualification','specialization','experience','academicYear','notes'];
    const schoolDepartments = [
        'Front Office Department', 'Academic Department', 'E-Learning Department',
        'Operations Department', 'Student Life Department', 'Human Resources Department',
        'Payroll Department', 'Finance Department', 'Procurement Department',
        'Assets & Security Department', 'Communication Department',
        'Administration', 'Mathematics', 'Science', 'English', 'Arabic',
        'Social Studies', 'ICT / Computer', 'Physical Education',
        'Islamic Studies', 'Languages'
    ];
    const escape = value => String(value || '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
    const avatar = teacher => teacher.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${teacher.firstName} ${teacher.lastName}`)}&background=4f46e5&color=fff`;
    const isTeacher = teacher => window.schoolStaffRecords
        ? window.schoolStaffRecords.isTeacher(teacher)
        : /teacher|principal|head of department/i.test(String(teacher.designation || '')) || Boolean(teacher.subject);
    const readTeachers = () => {
        const employees = window.schoolStaffRecords
            ? window.schoolStaffRecords.migrateLegacy()
            : (() => { try { return JSON.parse(localStorage.getItem('school_teachers')) || []; } catch { return []; } })();
        return employees.filter(isTeacher);
    };
    const saveTeachers = teachers => {
        if (!window.schoolStaffRecords) {
            localStorage.setItem('school_teachers', JSON.stringify(teachers));
            return;
        }
        const employees = window.schoolStaffRecords.read().filter(employee => !isTeacher(employee));
        window.schoolStaffRecords.save([...employees, ...teachers]);
    };
    const nextEmployeeNo = teachers => {
        if (window.schoolStaffRecords) return window.schoolStaffRecords.nextStaffId(window.schoolStaffRecords.read());
        const usedNumbers = new Set(teachers.map(teacher => teacher.employeeNo));
        const highestNumber = teachers.reduce((highest, teacher) => {
            const match = /^TCH-(\d+)$/.exec(teacher.employeeNo || '');
            return match ? Math.max(highest, Number(match[1])) : highest;
        }, 0);
        let number = highestNumber + 1;
        let employeeNo = `TCH-${String(number).padStart(4, '0')}`;
        while (usedNumbers.has(employeeNo)) {
            number += 1;
            employeeNo = `TCH-${String(number).padStart(4, '0')}`;
        }
        return employeeNo;
    };
    const date = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

    window.createTeachersModule = function createTeachersModule() {
        const sec = document.createElement('section');
        sec.className = 'module teachers-module';
        sec.id = 'teachersModule';
        sec.innerHTML = `
            <div class="teacher-cards"><div class="teacher-card teacher-stat"><div><p>Total Teachers</p><h2 data-stat="total">0</h2><span>All teacher records</span></div><div class="teacher-stat-icon teacher-blue">👨‍🏫</div></div><div class="teacher-card teacher-stat"><div><p>Male Teachers</p><h2 data-stat="male">0</h2><span>Teacher population</span></div><div class="teacher-stat-icon teacher-cyan">👨</div></div><div class="teacher-card teacher-stat"><div><p>Female Teachers</p><h2 data-stat="female">0</h2><span>Teacher population</span></div><div class="teacher-stat-icon teacher-green">👩</div></div><div class="teacher-card teacher-stat"><div><p>Active Teachers</p><h2 data-stat="active">0</h2><span>Currently employed</span></div><div class="teacher-stat-icon teacher-orange">✓</div></div></div>
            <div class="teacher-section-head"><div><h2>Teachers</h2><p class="teachers-subtitle">Teacher directory and records</p></div><div class="teachers-toolbar"><div class="teacher-search"><span>🔍</span><input data-search type="search" placeholder="Search teacher..."></div><button class="teacher-btn teacher-btn-light" type="button" data-export>⬇ Export</button><button class="teacher-btn teacher-btn-primary" type="button" data-add>+ Add Teacher</button></div></div>
            <div class="teacher-card teacher-table-card"><div class="teacher-table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Employee No.</th><th>Department</th><th>Subject</th><th>Phone</th><th>Address</th><th>Status</th><th>Actions</th></tr></thead><tbody data-table></tbody></table></div></div>
            <div class="teacher-modal" data-modal><div class="teacher-modal-box"><div class="teacher-modal-head"><div><h2 data-modal-title>Add New Teacher</h2><p class="teachers-subtitle">Complete the teacher's information</p></div><button class="teacher-close" type="button" data-close>×</button></div><form data-form><div class="teacher-form-body"><div class="teacher-form-section"><h3>👤 Personal Information</h3><div class="teacher-form-grid"><label class="teacher-form-group">First Name *<input name="firstName" required></label><label class="teacher-form-group">Last Name *<input name="lastName" required></label><label class="teacher-form-group">Employee Number *<input name="employeeNo" required></label><label class="teacher-form-group">Date of Birth<input type="date" name="dob"></label><label class="teacher-form-group">Gender<select name="gender"><option>Male</option><option>Female</option><option>Other</option></select></label><label class="teacher-form-group">Nationality<input name="nationality"></label><label class="teacher-form-group">Teacher Photo<div class="teacher-photo-upload"><img class="teacher-preview" data-preview alt="Preview"><input type="file" name="photo" accept="image/*"></div></label></div></div><div class="teacher-form-section"><h3>🏫 Employment Information</h3><div class="teacher-form-grid"><label class="teacher-form-group">Department *<select name="department" required><option value="">Select Department</option><option>Administration</option><option>Mathematics</option><option>Science</option><option>English</option><option>Arabic</option><option>Social Studies</option><option>ICT / Computer</option><option>Physical Education</option><option>Islamic Studies</option><option>Languages</option></select></label><label class="teacher-form-group">Main Subject *<input name="subject" required></label><label class="teacher-form-group">Designation<select name="designation"><option>Teacher</option><option>Senior Teacher</option><option>Head of Department</option><option>Coordinator</option><option>Vice Principal</option><option>Principal</option></select></label><label class="teacher-form-group">Joining Date<input type="date" name="joiningDate"></label><label class="teacher-form-group">Employment Type<select name="employmentType"><option>Full Time</option><option>Part Time</option><option>Contract</option><option>Temporary</option></select></label><label class="teacher-form-group">Status<select name="status"><option>Active</option><option>Inactive</option><option>On Leave</option><option>Resigned</option><option>Retired</option></select></label></div></div><div class="teacher-form-section"><h3>📞 Contact Information</h3><div class="teacher-form-grid"><label class="teacher-form-group">Phone *<input name="phone" required></label><label class="teacher-form-group">Email *<input type="email" name="email" required></label><label class="teacher-form-group">Emergency Contact<input name="emergency"></label><label class="teacher-form-group full">Address<textarea name="address"></textarea></label></div></div><div class="teacher-form-section"><h3>🎓 Qualification & Additional Information</h3><div class="teacher-form-grid"><label class="teacher-form-group">Highest Qualification<input name="qualification"></label><label class="teacher-form-group">Specialization<input name="specialization"></label><label class="teacher-form-group">Experience<input name="experience" placeholder="e.g. 8 Years"></label><label class="teacher-form-group">Academic Year<input name="academicYear" value="2026 - 2027"></label><label class="teacher-form-group full">Professional / Special Notes<textarea name="notes"></textarea></label></div></div></div><div class="teacher-modal-foot"><button type="button" class="teacher-btn teacher-btn-light" data-cancel>Cancel</button><button type="submit" class="teacher-btn teacher-btn-primary">Save Teacher</button></div></form></div></div>
            <div class="teacher-print-area" data-print-area><div class="teacher-print-page"><div class="teacher-print-content"><div class="teacher-print-header"><img class="teacher-print-logo" data-print-logo alt="School Logo"><div class="teacher-print-header-text"><h1 data-print-school>SMART SCHOOL</h1><h2>Teacher Information Record</h2><p>Excellence · Character · Knowledge</p></div></div><div class="teacher-print-title"><h2>TEACHER PROFILE</h2></div><div class="teacher-print-top"><table class="teacher-info-table"><tbody><tr><th>Employee No.</th><td data-p="employeeNo"></td><th>Academic Year</th><td data-p="academicYear"></td></tr><tr><th>Teacher Name</th><td data-p="name"></td><th>Gender</th><td data-p="gender"></td></tr><tr><th>Date of Birth</th><td data-p="dob"></td><th>Nationality</th><td data-p="nationality"></td></tr><tr><th>Department</th><td data-p="department"></td><th>Subject</th><td data-p="subject"></td></tr><tr><th>Designation</th><td data-p="designation"></td><th>Status</th><td data-p="status"></td></tr></tbody></table><img class="teacher-print-photo" data-print-photo alt="Teacher Photo"></div><div class="teacher-print-section-title">EMPLOYMENT INFORMATION</div><table class="teacher-info-table"><tr><th>Joining Date</th><td data-p="joiningDate"></td><th>Employment Type</th><td data-p="employmentType"></td></tr><tr><th>Qualification</th><td data-p="qualification"></td><th>Specialization</th><td data-p="specialization"></td></tr><tr><th>Experience</th><td colspan="3" data-p="experience"></td></tr></table><div class="teacher-print-section-title">CONTACT INFORMATION</div><table class="teacher-info-table"><tr><th>Phone</th><td data-p="phone"></td><th>Email</th><td data-p="email"></td></tr><tr><th>Emergency Contact</th><td data-p="emergency"></td><th>Address</th><td data-p="address"></td></tr></table><div class="teacher-print-section-title">PROFESSIONAL / SPECIAL NOTES</div><table class="teacher-info-table"><tr><td data-p="notes" style="height:60px"></td></tr></table><div class="teacher-print-section-title">OFFICIAL SIGNATORIES</div><div class="teacher-signatures"><div class="teacher-signature">Teacher</div><div class="teacher-signature">Head of Department</div><div class="teacher-signature">Principal / Head of School</div></div></div><div class="teacher-print-footer">This document is an official teacher record generated by the School Management System.</div></div></div>`;

        let teachers = readTeachers(); let editingId = null; let selectedTeacher = null;
        const $ = selector => sec.querySelector(selector); const form = $('[data-form]'); const modal = $('[data-modal]');
        const employeeNoField = form.elements.employeeNo;
        employeeNoField.readOnly = true;
        employeeNoField.closest('label').childNodes[0].textContent = 'Staff ID (auto-generated)';
        sec.querySelector('.teacher-table-wrap thead th:nth-child(3)').textContent = 'Staff ID';
        sec.querySelector('.teacher-print-top th').textContent = 'Staff ID';
        const departmentSelect = form.elements.department;
        const refreshDepartmentOptions = () => {
            const selected = departmentSelect.value;
            const departments = [...new Set([
                ...schoolDepartments,
                ...(window.schoolStaffRecords?.read() || teachers)
                    .map(teacher => String(teacher.department || teacher.departmentName || teacher.staffDepartment || '').trim())
                    .filter(Boolean)
            ])].sort((left, right) => left.localeCompare(right));
            departmentSelect.replaceChildren(
                new Option('Select Department', ''),
                ...departments.map(department => new Option(department, department))
            );
            if (selected && !departments.includes(selected)) {
                departmentSelect.add(new Option(selected, selected));
            }
            departmentSelect.value = selected;
        };
        refreshDepartmentOptions();

        const subjectField = form.elements.subject;
        const subjectLabel = subjectField.closest('label');
        const subjectSelect = document.createElement('select');
        subjectSelect.name = 'subject';
        subjectSelect.required = true;
        subjectSelect.setAttribute('aria-label', 'Main subject');
        subjectSelect.add(new Option('Loading subjects…', ''));
        subjectField.replaceWith(subjectSelect);
        const additionalSubjects = document.createElement('div');
        additionalSubjects.className = 'teacher-additional-subjects';
        const additionalSubjectsLabel = document.createElement('span');
        additionalSubjectsLabel.textContent = 'Additional subjects (optional)';
        const additionalSubjectRows = document.createElement('div');
        additionalSubjectRows.className = 'teacher-additional-subject-rows';
        const addSubjectButton = document.createElement('button');
        addSubjectButton.className = 'teacher-add-subject';
        addSubjectButton.type = 'button';
        addSubjectButton.textContent = '+ Add another subject';
        additionalSubjects.append(additionalSubjectsLabel, additionalSubjectRows, addSubjectButton);
        subjectLabel.after(additionalSubjects);
        let subjectCatalog = [];
        let subjectCatalogLoaded = false;
        let subjectCatalogError = false;
        let subjectUnsubscribe = null;
        let destroyed = false;
        const extraSubjectSelects = () => [...additionalSubjectRows.querySelectorAll('select')];
        const teacherSubjects = teacher => [...new Set([
            String(teacher?.subject || '').trim(),
            ...(Array.isArray(teacher?.subjects) ? teacher.subjects : []),
            ...(Array.isArray(teacher?.additionalSubjects) ? teacher.additionalSubjects : [])
        ].map(subject => String(subject || '').trim()).filter(Boolean))];
        const selectedSubjects = () => [...new Set([
            subjectSelect.value,
            ...extraSubjectSelects().map(select => select.value)
        ].map(subject => String(subject || '').trim()).filter(Boolean))];
        const refreshSubjectOptions = () => {
            const controls = [subjectSelect, ...extraSubjectSelects()];
            const activeCatalog = [...new Map(subjectCatalog
                .filter(subject => subject.deleted !== true
                    && String(subject.status || 'Active').toLowerCase() === 'active')
                .map(subject => {
                    const name = String(subject.subjectName || subject.name || '').trim();
                    return name ? [name.toLowerCase(), name] : null;
                })
                .filter(Boolean)).values()].sort((left, right) => left.localeCompare(right));
            controls.forEach(select => {
                const selected = select.value;
                const selectedElsewhere = new Set(controls
                    .filter(other => other !== select)
                    .map(other => other.value)
                    .filter(Boolean));
                const placeholder = select !== subjectSelect
                    ? 'Select an additional subject'
                    : subjectCatalogError ? 'Unable to load subjects'
                        : subjectCatalogLoaded && !activeCatalog.length
                            ? 'No active subjects available' : 'Select main subject';
                select.replaceChildren(new Option(placeholder, ''));
                activeCatalog
                    .filter(subject => !selectedElsewhere.has(subject) || subject === selected)
                    .forEach(subject => select.add(new Option(subject, subject)));
                if (selected && ![...select.options].some(option => option.value === selected)) {
                    select.add(new Option(`${selected} (not in active catalogue)`, selected));
                }
                select.value = selected;
            });
            const selected = new Set(selectedSubjects().map(subject => subject.toLowerCase()));
            const hasEmptyAdditionalSubject = extraSubjectSelects().some(select => !select.value);
            addSubjectButton.disabled = hasEmptyAdditionalSubject
                || !activeCatalog.some(subject => !selected.has(subject.toLowerCase()));
            if (subjectCatalog.length) subjectSelect.disabled = false;
        };
        const addAdditionalSubject = (selected = '') => {
            const row = document.createElement('div');
            row.className = 'teacher-additional-subject-row';
            const select = document.createElement('select');
            select.setAttribute('aria-label', `Additional subject ${extraSubjectSelects().length + 1}`);
            if (selected) select.add(new Option(selected, selected));
            const remove = document.createElement('button');
            remove.className = 'teacher-remove-subject';
            remove.type = 'button';
            remove.setAttribute('aria-label', 'Remove additional subject');
            remove.textContent = 'Remove';
            row.append(select, remove);
            additionalSubjectRows.append(row);
            select.value = selected;
            remove.addEventListener('click', () => {
                row.remove();
                refreshSubjectOptions();
                updateSummary();
            });
            select.addEventListener('change', () => {
                refreshSubjectOptions();
                updateSummary();
            });
            refreshSubjectOptions();
            return select;
        };
        subjectSelect.addEventListener('change', () => {
            refreshSubjectOptions();
            updateSummary();
        });
        addSubjectButton.addEventListener('click', () => {
            if (addSubjectButton.disabled) return;
            addAdditionalSubject();
            extraSubjectSelects().at(-1)?.focus();
            updateSummary();
        });
        const setSubjectCatalog = records => {
            subjectCatalogLoaded = true;
            subjectCatalogError = false;
            subjectCatalog = records;
            refreshSubjectOptions();
        };
        const handleSubjectSyncError = event => {
            if (event.detail?.collection !== 'subjects') return;
            subjectCatalogError = true;
            refreshSubjectOptions();
        };
        window.addEventListener('school-portal-sync-error', handleSubjectSyncError);
        const dataApi = window.schoolPortalData;
        if (typeof dataApi?.subscribe === 'function') {
            if (typeof dataApi.listLocal === 'function') {
                Promise.resolve().then(() => dataApi.listLocal('subjects')).then(records => {
                    if (!destroyed && !subjectCatalog.length && records.length) setSubjectCatalog(records);
                }).catch(error => {
                    console.warn('Unable to load cached school subjects for the teacher form.', error);
                });
            }
            Promise.resolve().then(() => dataApi.subscribe('subjects', setSubjectCatalog)).then(unsubscribe => {
                if (destroyed) unsubscribe?.();
                else subjectUnsubscribe = unsubscribe;
            }).catch(error => {
                subjectCatalogError = true;
                console.error('Unable to load the school subject catalogue for teachers.', error);
                refreshSubjectOptions();
            });
        } else {
            subjectCatalogError = true;
            console.error('The school subject catalogue is unavailable in the teacher form.');
            refreshSubjectOptions();
        }
        sec.addEventListener('remove', () => {
            destroyed = true;
            subjectUnsubscribe?.();
            window.removeEventListener('school-portal-sync-error', handleSubjectSyncError);
        }, { once: true });
        const photoField = form.elements.photo.closest('.teacher-form-group');
        photoField.classList.add('teacher-photo-field');
        form.querySelector('.teacher-form-body').prepend(photoField);
        const liveSummary = document.createElement('aside');
        liveSummary.className = 'teacher-live-summary';
        liveSummary.innerHTML = '<h3>Teacher Summary</h3><p>Review key details before saving.</p><div data-teacher-summary></div>';
        form.insertBefore(liveSummary, form.querySelector('.teacher-modal-foot'));
        const updateSummary = () => {
            const target = liveSummary.querySelector('[data-teacher-summary]');
            target.replaceChildren(...fields.map(name => {
                const field = form.elements[name];
                const row = document.createElement('div');
                const label = document.createElement('span');
                const value = document.createElement('strong');
                row.className = 'teacher-summary-row';
                label.textContent = field.closest('label')?.childNodes[0].textContent.trim() || name;
                value.textContent = name === 'subject' ? selectedSubjects().join(', ') || '-' : field.value || '-';
                row.append(label, value);
                return row;
            }));
            const photoRow = document.createElement('div');
            const photoLabel = document.createElement('span');
            const photoValue = document.createElement('strong');
            photoRow.className = 'teacher-summary-row';
            photoLabel.textContent = 'Teacher Photo';
            photoValue.textContent = $('[data-preview]').dataset.photo ? 'Uploaded' : 'Not added';
            photoRow.append(photoLabel, photoValue);
            target.append(photoRow);
        };
        const render = () => { const query = $('[data-search]').value.toLowerCase().trim(); const filtered = teachers.filter(t => Object.values(t).join(' ').toLowerCase().includes(query)); $('[data-table]').innerHTML = filtered.length ? filtered.map(t => { const badge = ['Inactive','Resigned','Retired'].includes(t.status) ? 'teacher-badge-red' : t.status === 'On Leave' ? 'teacher-badge-orange' : 'teacher-badge-green'; return `<tr><td><div class="teacher-person"><img class="teacher-img" src="${avatar(t)}" alt="${escape(t.firstName)}"><div><strong>${escape(t.firstName)} ${escape(t.lastName)}</strong></div></div></td><td>${escape(t.email || 'No email')}</td><td><strong>${escape(t.staffId || t.employeeNo)}</strong></td><td>${escape(t.department)}</td><td>${escape(teacherSubjects(t).join(', '))}</td><td>${escape(t.phone || '-')}</td><td>${escape(t.address || '-')}</td><td><span class="teacher-badge ${badge}">${escape(t.status)}</span></td><td><div class="teacher-row-actions"><button class="teacher-action-btn" type="button" data-action="preview" data-id="${t.id}" title="Preview / Print">👁️</button><button class="teacher-action-btn" type="button" data-action="edit" data-id="${t.id}" title="Edit">✏️</button><button class="teacher-action-btn" type="button" data-action="delete" data-id="${t.id}" title="Delete">🗑️</button></div></td></tr>`; }).join('') : '<tr><td colspan="9"><div class="teacher-empty"><div style="font-size:40px">👨‍🏫</div><h3>No teachers found</h3><p>Add a new teacher or change your search.</p></div></td></tr>'; $('[data-stat="total"]').textContent = teachers.length; $('[data-stat="male"]').textContent = teachers.filter(t => t.gender === 'Male').length; $('[data-stat="female"]').textContent = teachers.filter(t => t.gender === 'Female').length; $('[data-stat="active"]').textContent = teachers.filter(t => t.status === 'Active').length; };
        const resetForm = () => { form.reset(); additionalSubjectRows.replaceChildren(); refreshSubjectOptions(); form.elements.academicYear.value = '2026 - 2027'; $('[data-preview]').src = 'https://ui-avatars.com/api/?name=Teacher&background=e5e7eb&color=64748b'; $('[data-preview]').dataset.photo = ''; };
        const openForm = teacher => {
            editingId = teacher?.id || null;
            $('[data-modal-title]').textContent = teacher ? 'Edit Teacher' : 'Add New Teacher';
            resetForm();
            if (teacher) {
                fields.forEach(field => {
                    if (field !== 'subject' && form.elements[field]) form.elements[field].value = teacher[field] || '';
                });
                const subjects = teacherSubjects(teacher);
                const mainSubject = subjects.shift() || '';
                if (mainSubject && ![...subjectSelect.options].some(option => option.value === mainSubject)) {
                    subjectSelect.add(new Option(`${mainSubject} (not in active catalogue)`, mainSubject));
                }
                subjectSelect.value = mainSubject;
                subjects.forEach(subject => addAdditionalSubject(subject));
                employeeNoField.value = teacher.staffId || teacher.employeeNo || '';
                $('[data-preview]').src = avatar(teacher);
                $('[data-preview]').dataset.photo = teacher.photo || '';
            } else {
                employeeNoField.value = nextEmployeeNo(teachers);
            }
            refreshSubjectOptions();
            modal.classList.add('show');
            updateSummary();
        };
        const closeForm = () => { modal.classList.remove('show'); editingId = null; };
        const printTeacher = teacher => { selectedTeacher = teacher; $('[data-print-logo]').src = localStorage.getItem('school_logo') || logo; $('[data-print-photo]').src = avatar(teacher); const values = { ...teacher, subject: teacherSubjects(teacher).join(', '), employeeNo: teacher.staffId || teacher.employeeNo, name: `${teacher.firstName || ''} ${teacher.lastName || ''}`, dob: date(teacher.dob), joiningDate: date(teacher.joiningDate) }; sec.querySelectorAll('[data-p]').forEach(el => { el.textContent = values[el.dataset.p] || '-'; }); window.print(); };
        $('[data-add]').addEventListener('click', () => openForm()); $('[data-search]').addEventListener('input', render); $('[data-close]').addEventListener('click', closeForm); $('[data-cancel]').addEventListener('click', closeForm); modal.addEventListener('click', event => { if (event.target === modal) closeForm(); });
        $('[data-export]').addEventListener('click', () => { if (!teachers.length) return alert('No teacher records to export.'); const headers = ['Staff ID','First Name','Last Name','Gender','Department','Subject','Designation','Joining Date','Employment Type','Phone','Email','Status']; const rows = teachers.map(t => [t.staffId || t.employeeNo,t.firstName,t.lastName,t.gender,t.department,teacherSubjects(t).join(', '),t.designation,t.joiningDate,t.employmentType,t.phone,t.email,t.status]); const csv = [headers, ...rows].map(row => row.map(value => `"${String(value || '').replace(/"/g, '""')}"`).join(',')).join('\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'teachers.csv'; link.click(); URL.revokeObjectURL(link.href); });
        $('[data-table]').addEventListener('click', event => { const button = event.target.closest('[data-action]'); if (!button) return; const teacher = teachers.find(t => String(t.id) === button.dataset.id); if (!teacher) return; if (button.dataset.action === 'edit') openForm(teacher); if (button.dataset.action === 'preview') printTeacher(teacher); if (button.dataset.action === 'delete' && confirm(`Delete ${teacher.firstName} ${teacher.lastName}?`)) { teachers = teachers.filter(t => t.id !== teacher.id); saveTeachers(teachers); render(); } });
        $('[name="photo"]').addEventListener('change', event => { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { $('[data-preview]').src = reader.result; $('[data-preview]').dataset.photo = reader.result; updateSummary(); }; reader.readAsDataURL(file); });
        form.addEventListener('input', updateSummary); form.addEventListener('change', updateSummary);
        form.addEventListener('submit', event => { event.preventDefault(); const formData = Object.fromEntries(new FormData(form).entries()); const existingIndex = teachers.findIndex(teacher => String(teacher.id) === String(editingId)); const existing = existingIndex >= 0 ? teachers[existingIndex] : {}; const data = { ...existing, ...formData }; data.subjects = selectedSubjects(); data.id = existing.id || editingId || Date.now(); data.staffCategory = 'Teaching'; data.staffId = existing.staffId || data.employeeNo || nextEmployeeNo(teachers); data.employeeNo = data.employeeNo || data.staffId; data.photo = $('[data-preview]').dataset.photo || existing.photo || ''; if (existingIndex >= 0) teachers[existingIndex] = data; else teachers.push(data); saveTeachers(teachers); render(); closeForm(); });
        window.addEventListener('school-portal-staff-records-updated', () => { teachers = readTeachers(); refreshDepartmentOptions(); render(); });
        window.addEventListener('school-portal-cloud-data-update', event => {
            if (!['staff', 'teachers', 'staffDirectory'].includes(event.detail?.collection)) return;
            window.schoolStaffRecords?.migrateLegacy();
            teachers = readTeachers();
            refreshDepartmentOptions();
            render();
        });
        if (localStorage.getItem('school_teachers_dark') === 'true') sec.classList.add('dark'); render(); return sec;
    };
})();