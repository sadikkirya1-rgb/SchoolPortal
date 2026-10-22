function createAssessmentModule(category) {
    const section = document.createElement('section');
    section.className = 'module assessment-module';
    section.id = 'assessmentModule';
    section.innerHTML = `
        <div class="assessment-container">
            <header class="assessment-header">
                <div><h1>Assignments</h1><p>Create, manage, monitor and track school assignments.</p></div>
                <div class="assessment-actions"><button class="assessment-btn" type="button" data-assessment-new><i class="fas fa-plus"></i> New Assignment</button></div>
            </header>
            <div class="assessment-card assessment-form" data-assessment-form>
                <div class="assessment-form-title"><div><h2>Create Assignment</h2><span>Enter assignment details below</span></div><button class="assessment-btn assessment-btn-small assessment-btn-dark" type="button" data-assessment-close><i class="fas fa-xmark"></i> Close</button></div>
                <form data-assessment-entry><div class="assessment-grid">
                    <div class="assessment-field"><label>Assignment Title *</label><input name="title" required placeholder="e.g. Mathematics Algebra Exercise"></div>
                    <div class="assessment-field"><label>Subject *</label><select name="subject" required data-assessment-subject><option value="">Loading subjects…</option></select><input name="subjectOther" aria-label="Enter a subject" placeholder="Enter subject name" hidden></div>
                    <div class="assessment-field"><label>Class / Grade *</label><select name="className" required data-assessment-class><option value="">Loading classes…</option></select></div>
                    <div class="assessment-field"><label>Section</label><select name="section"><option>A</option><option>B</option><option>C</option><option>D</option><option>All Sections</option></select></div>
                    <div class="assessment-field"><label>Teacher *</label><select name="teacher" required data-assessment-teacher><option value="">Loading teachers…</option></select><input name="teacherOther" aria-label="Enter a teacher name" placeholder="Enter teacher name" hidden></div><div class="assessment-field"><label>Academic Year</label><input name="academicYear" value="2026/27"></div>
                    <div class="assessment-field"><label>Academic Period</label><select name="period"><option>Term 1</option><option>Term 2</option><option>Term 3</option><option>Semester 1</option><option>Semester 2</option></select></div><div class="assessment-field"><label>Assignment Type</label><select name="type"><option>Homework</option><option>Classwork</option><option>Project</option><option>Research</option><option>Quiz</option><option>Practical</option><option>Coursework</option></select></div>
                    <div class="assessment-field"><label>Assigned Date *</label><input type="date" name="assignedDate" required></div><div class="assessment-field"><label>Due Date *</label><input type="date" name="dueDate" required></div><div class="assessment-field"><label>Maximum Marks</label><input type="number" name="marks" value="100" min="1"></div><div class="assessment-field"><label>Priority</label><select name="priority"><option>Normal</option><option>High</option><option>Urgent</option></select></div>
                    <div class="assessment-field"><label>Status</label><select name="status"><option>Published</option><option>Draft</option><option>Pending</option><option>Closed</option></select></div><div class="assessment-field"><label>Submission Method</label><select name="submission"><option>Online</option><option>Physical</option><option>Online + Physical</option><option>Class Presentation</option></select></div><div class="assessment-field"><label>Attachment</label><input type="file" name="attachment"></div>
                    <div class="assessment-field full"><label>Assignment Instructions / Description</label><textarea name="description" placeholder="Enter assignment instructions, requirements and details..."></textarea></div><div class="assessment-field full"><label>Learning Objectives</label><textarea name="objectives" placeholder="What should students learn or demonstrate?"></textarea></div>
                </div><div class="assessment-form-actions"><button class="assessment-btn assessment-btn-dark" type="reset">Reset</button><button class="assessment-btn assessment-btn-light" type="button" data-assessment-close>Cancel</button><button class="assessment-btn assessment-btn-primary" type="submit"><i class="fas fa-floppy-disk"></i> Save Assignment</button></div></form>
            </div>
            <div class="assessment-card assessment-table-card"><div class="assessment-table-header"><div><h2>Assignment Records</h2><span>Manage all assignments</span></div><input class="assessment-search" placeholder="Search assignments..." data-assessment-search></div><div class="assessment-table-wrap"><table class="assessment-table"><thead><tr><th>Assignment No.</th><th>Assignment</th><th>Subject</th><th>Class</th><th>Teacher</th><th>Assigned</th><th>Due Date</th><th>Marks</th><th>Submissions</th><th>Status</th><th>Actions</th></tr></thead><tbody data-assessment-table></tbody></table><div class="assessment-empty" data-assessment-empty>No assignments found.</div></div></div>
        </div>`;

    const form = section.querySelector('[data-assessment-entry]');
    const field = name => form.elements[name];
    const key = 'schoolAssignments';
    const identity = window.schoolPortalData?.getIdentity?.();
    const administratorRoles = new Set(['schoolAdmin', 'superAdmin', 'director', 'headTeacher']);
    const canViewCollection = collection => administratorRoles.has(identity?.role)
        || identity?.permissions?.[collection]?.view === true;
    const subjectSelect = section.querySelector('[data-assessment-subject]');
    const classSelect = section.querySelector('[data-assessment-class]');
    const teacherSelect = section.querySelector('[data-assessment-teacher]');
    const otherOptionValue = '__other__';
    const subjectOther = field('subjectOther');
    const teacherOther = field('teacherOther');
    const fallbackSubjects = ['Mathematics', 'English', 'Science', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'Social Studies', 'Geography', 'History', 'Arabic'];
    const fallbackClasses = Array.from({ length: 12 }, (_, index) => `Grade ${index + 1}`);
    const sectionSelect = field('section');
    let subjects = [];
    let classes = [];
    let teachers = [];
    let timetables = [];
    let optionsDisposed = false;
    const optionUnsubscribers = [];
    const addSelectOptions = (select, placeholder, options, selectedValue = '') => {
        select.replaceChildren(new Option(placeholder, ''));
        options.forEach(option => {
            const value = typeof option === 'string' ? option : option.value;
            const label = typeof option === 'string' ? option : option.label;
            if (value) select.add(new Option(label, value));
        });
        if (selectedValue && !Array.from(select.options).some(option => option.value === selectedValue)) {
            select.add(new Option(selectedValue, selectedValue));
        }
        if (selectedValue) select.value = selectedValue;
    };
    const subjectOptions = () => [...new Set([
        ...fallbackSubjects,
        ...subjects.map(subject => String(subject.subjectName || subject.name || '').trim()).filter(Boolean),
        ...teachers.map(teacher => String(teacher.subject || '').trim()).filter(Boolean),
        ...timetables.map(record => String(record.subject || '').trim()).filter(Boolean)
    ])].sort((left, right) => left.localeCompare(right));
    const classOptions = () => [...new Set([
        ...fallbackClasses,
        ...classes.map(record => String(record.name || record.className || record.class || record.streamName || '').trim()).filter(Boolean),
        ...subjects.map(subject => String(subject.className || subject.class || '').trim()).filter(Boolean),
        ...teachers.map(teacher => String(teacher.className || teacher.class || '').trim()).filter(Boolean),
        ...timetables.map(record => String(record.className || record.class || '').trim()).filter(Boolean)
    ])].sort((left, right) => left.localeCompare(right));
    const teacherOptions = () => {
        const options = new Map();
        teachers.forEach(teacher => {
            const name = String(teacher.fullName || teacher.name || teacher.teacherName
                || [teacher.firstName, teacher.lastName].filter(Boolean).join(' ')).trim();
            if (name && !['inactive', 'resigned', 'retired'].includes(String(teacher.status || '').toLowerCase())) {
                options.set(name, { value: name, label: name, subject: String(teacher.subject || '').trim() });
            }
        });
        timetables.forEach(record => {
            const name = String(record.teacher || '').trim();
            if (name && !options.has(name)) options.set(name, { value: name, label: name, subject: String(record.subject || '').trim() });
        });
        const currentTeacher = String(identity?.fullName || identity?.name || identity?.displayName || '').trim();
        if (currentTeacher && !options.has(currentTeacher)) {
            options.set(currentTeacher, { value: currentTeacher, label: currentTeacher, subject: '' });
        }
        return [...options.values()].sort((left, right) => left.label.localeCompare(right.label));
    };
    const refreshAssignmentOptions = () => {
        const selectedSubject = field('subject')?.value || '';
        const selectedClass = field('className')?.value || '';
        const selectedTeacher = field('teacher')?.value || '';
        addSelectOptions(subjectSelect, 'Select Subject', [
            ...subjectOptions().map(value => ({ value, label: value })),
            { value: otherOptionValue, label: 'Other…' }
        ], selectedSubject);
        addSelectOptions(classSelect, 'Select Class', classOptions(), selectedClass);
        addSelectOptions(teacherSelect, 'Select Teacher', [
            ...teacherOptions(),
            { value: otherOptionValue, label: 'Other…' }
        ], selectedTeacher);
        const selectedClassRecord = classes.find(record =>
            String(record.name || record.className || record.class || record.streamName || '').trim() === classSelect.value);
        const sections = [...new Set([
            ...(Array.isArray(selectedClassRecord?.sections) ? selectedClassRecord.sections : []),
            ...timetables.filter(record => String(record.className || record.class || '').trim() === classSelect.value)
                .map(record => record.section),
            'A', 'B', 'C', 'D', 'All Sections'
        ].map(value => String(value || '').trim()).filter(Boolean))];
        addSelectOptions(sectionSelect, 'Select Section', sections, sectionSelect.value || 'A');
        subjectOther.hidden = subjectSelect.value !== otherOptionValue;
        subjectOther.required = !subjectOther.hidden;
        teacherOther.hidden = teacherSelect.value !== otherOptionValue;
        teacherOther.required = !teacherOther.hidden;
    };
    const normalizeOptionText = value => String(value || '').trim().toLocaleLowerCase();
    let autoFilledTeacher = '';
    const autoFillTeacherForSubject = subjectName => {
        const matchingTeachers = teacherOptions().filter(teacher =>
            normalizeOptionText(teacher.subject) === normalizeOptionText(subjectName));
        if (matchingTeachers.length === 1) {
            teacherSelect.value = matchingTeachers[0].value;
            autoFilledTeacher = matchingTeachers[0].value;
        } else if (autoFilledTeacher && teacherSelect.value === autoFilledTeacher) {
            teacherSelect.value = '';
            autoFilledTeacher = '';
        }
    };
    const autoFillForSubject = () => {
        const subjectName = subjectSelect.value === otherOptionValue ? subjectOther.value : subjectSelect.value;
        const matchingSubject = subjects.find(subject =>
            normalizeOptionText(subject.subjectName || subject.name) === normalizeOptionText(subjectName));
        const subjectClass = String(matchingSubject?.className || matchingSubject?.class || '').trim();
        if (subjectClass && classOptions().includes(subjectClass)) classSelect.value = subjectClass;
        autoFillTeacherForSubject(subjectName);
        refreshAssignmentOptions();
    };
    const subscribeOptions = async (collection, onRecords) => {
        const api = window.schoolPortalData;
        if (!api?.subscribe || !canViewCollection(collection)) return;
        try {
            const unsubscribe = await api.subscribe(collection, onRecords);
            if (optionsDisposed) unsubscribe();
            else optionUnsubscribers.push(unsubscribe);
        } catch (error) {
            console.warn(`Unable to load assignment ${collection} options.`, error);
        }
    };
    const readLegacyRecords = storageKey => {
        try {
            const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
            return Array.isArray(stored) ? stored : [];
        } catch (error) {
            console.warn(`Saved ${storageKey} options could not be read.`, error);
            return [];
        }
    };
    teachers = readLegacyRecords('school_teachers');
    timetables = readLegacyRecords('school_timetables');
    refreshAssignmentOptions();
    void subscribeOptions('subjects', incoming => {
        subjects = incoming.filter(record => record.deleted !== true
            && !['inactive', 'deleted'].includes(String(record.status || '').toLowerCase()));
        refreshAssignmentOptions();
    });
    void subscribeOptions('classes', incoming => {
        classes = incoming.filter(record => record.deleted !== true
            && !['inactive', 'deleted'].includes(String(record.status || '').toLowerCase()));
        refreshAssignmentOptions();
    });
    void subscribeOptions('teachers', incoming => {
        teachers = incoming.filter(record => record.deleted !== true
            && !['inactive', 'resigned', 'retired'].includes(String(record.status || '').toLowerCase()));
        refreshAssignmentOptions();
    });
    void subscribeOptions('timetables', incoming => {
        timetables = incoming.filter(record => record.deleted !== true);
        refreshAssignmentOptions();
    });
    section.addEventListener('remove', () => {
        optionsDisposed = true;
        optionUnsubscribers.forEach(unsubscribe => unsubscribe());
    }, { once: true });
    let records = JSON.parse(localStorage.getItem(key) || '[]') || [];
    let counter = records.length + 1;
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
    const formatDate = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—';
    const badgeClass = status => status === 'Published' ? 'assessment-published' : status === 'Pending' ? 'assessment-pending' : status === 'Draft' ? 'assessment-draft' : 'assessment-late';
    const render = () => { const query = section.querySelector('[data-assessment-search]').value.toLowerCase(); const rows = records.filter(record => Object.values(record).join(' ').toLowerCase().includes(query));     section.querySelector('[data-assessment-table]').innerHTML = rows.map(record => `<tr><td>${escape(record.id)}</td><td><b>${escape(record.title)}</b></td><td>${escape(record.subject)}</td><td>${escape(record.className)} - ${escape(record.section)}</td><td>${escape(record.teacher)}</td><td>${formatDate(record.assignedDate)}</td><td>${formatDate(record.dueDate)}</td><td>${escape(record.marks)}</td><td>${escape(record.submissions || '0 / 0')}</td><td><span class="assessment-badge ${badgeClass(record.status)}">${escape(record.status)}</span></td><td><div class="assessment-row-actions"><button class="assessment-btn assessment-btn-small" data-action="view" data-id="${escape(record.id)}">View</button><button class="assessment-btn assessment-btn-small assessment-btn-light" data-action="edit" data-id="${escape(record.id)}">Edit</button><button class="assessment-btn assessment-btn-small assessment-btn-danger" data-action="delete" data-id="${escape(record.id)}">Delete</button></div></td></tr>`).join(''); section.querySelector('[data-assessment-empty]').style.display = rows.length ? 'none' : 'block'; };
    const formValues = () => Object.fromEntries([...form.elements]
        .filter(element => element.name && element.type !== 'file'
            && !['subjectOther', 'teacherOther'].includes(element.name))
        .map(element => [element.name, ['subject', 'teacher'].includes(element.name) && element.value === otherOptionValue
            ? field(`${element.name}Other`).value.trim()
            : element.value]));
    let resetting = false;
    const reset = () => { resetting = true; form.reset(); resetting = false; refreshAssignmentOptions(); subjectOther.value = ''; teacherOther.value = ''; const today = new Date(); const due = new Date(today); due.setDate(today.getDate() + 7); field('assignedDate').value = today.toISOString().slice(0,10); field('dueDate').value = due.toISOString().slice(0,10); field('academicYear').value = '2026/27'; field('marks').value = '100'; };
    section.querySelector('[data-assessment-new]').addEventListener('click', () => { reset(); section.querySelector('[data-assessment-form]').classList.add('is-open'); section.querySelector('[data-assessment-form]').scrollIntoView({behavior:'smooth'}); field('title').focus(); });
    section.querySelectorAll('[data-assessment-close]').forEach(button => button.addEventListener('click', () => section.querySelector('[data-assessment-form]').classList.remove('is-open')));
    subjectSelect.addEventListener('change', () => {
        subjectOther.value = '';
        autoFillForSubject();
        if (subjectSelect.value === otherOptionValue) subjectOther.focus();
    });
    subjectOther.addEventListener('input', () => {
        autoFillTeacherForSubject(subjectOther.value);
        refreshAssignmentOptions();
    });
    teacherSelect.addEventListener('change', () => {
        teacherOther.value = '';
        if (teacherSelect.value !== autoFilledTeacher) autoFilledTeacher = '';
        refreshAssignmentOptions();
        if (teacherSelect.value === otherOptionValue) teacherOther.focus();
    });
    classSelect.addEventListener('change', () => {
        refreshAssignmentOptions();
    });
    section.querySelector('[data-assessment-search]').addEventListener('input', render);
    form.addEventListener('reset', () => { if (!resetting) setTimeout(reset, 0); });
    form.addEventListener('submit', event => { event.preventDefault(); const data = formValues(); const id = `ASG-2026-${String(counter++).padStart(3,'0')}`; records.unshift({...data,id,marks:Number(data.marks || 100),submissions:'0 / 0'}); localStorage.setItem(key,JSON.stringify(records)); render(); section.querySelector('[data-assessment-form]').classList.remove('is-open'); alert('Assignment saved successfully.'); });
    section.querySelector('[data-assessment-table]').addEventListener('click', event => { const button = event.target.closest('[data-action]'); if (!button) return; const record = records.find(item => item.id === button.dataset.id); if (!record) return; if (button.dataset.action === 'delete') { if (confirm('Are you sure you want to delete this assignment?')) { records = records.filter(item => item.id !== record.id); localStorage.setItem(key,JSON.stringify(records)); render(); } return; } if (button.dataset.action === 'view') { alert(`Assignment Details\n\nAssignment: ${record.title}\nSubject: ${record.subject}\nClass: ${record.className} - ${record.section}\nTeacher: ${record.teacher}\nDue Date: ${formatDate(record.dueDate)}`); return; } Object.entries(record).forEach(([name,value]) => { if (field(name) && !['subjectOther', 'teacherOther'].includes(name)) field(name).value = value; }); refreshAssignmentOptions(); section.querySelector('[data-assessment-form]').classList.add('is-open'); });
    reset(); render(); return section;
}
