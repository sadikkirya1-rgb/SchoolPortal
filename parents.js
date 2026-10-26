function createParentsModule() {
    const section = document.createElement('section');
    section.className = 'module parents-module hidden';
    section.id = 'parentsModule';
    section.innerHTML = `
        <header class="pa-header"><div><h2>Parents</h2><p>Communication Department · Manage parent contacts, students, communication preferences and engagement</p></div><button class="pa-button pa-primary" type="button" data-pa-new><i class="fas fa-plus"></i> Add Parent</button></header>
        <section class="pa-stats" aria-label="Parent contact summary"><article class="pa-stat"><div><span>Total Parents</span><strong data-pa-stat="total">0</strong></div><i class="fas fa-users"></i></article><article class="pa-stat"><div><span>Active Parents</span><strong data-pa-stat="active">0</strong></div><i class="fas fa-circle-check"></i></article><article class="pa-stat"><div><span>Primary Contacts</span><strong data-pa-stat="primary">0</strong></div><i class="fas fa-star"></i></article><article class="pa-stat"><div><span>WhatsApp Enabled</span><strong data-pa-stat="whatsapp">0</strong></div><i class="fas fa-comment-dots"></i></article><article class="pa-stat"><div><span>Email Enabled</span><strong data-pa-stat="email">0</strong></div><i class="fas fa-envelope"></i></article><article class="pa-stat"><div><span>Pending Verification</span><strong data-pa-stat="pending">0</strong></div><i class="fas fa-triangle-exclamation"></i></article></section>
        <section class="pa-content" aria-label="Parent contact directory"><div class="pa-toolbar"><label class="pa-search"><i class="fas fa-search" aria-hidden="true"></i><span class="pa-sr-only">Search parents</span><input type="search" data-pa-search placeholder="Search parent, student, phone, email..."></label><select class="pa-filter" data-pa-status aria-label="Filter by status"><option value="">All Statuses</option><option>Active</option><option>Inactive</option><option>Pending Verification</option></select><select class="pa-filter" data-pa-relation aria-label="Filter by relationship"><option value="">All Relationships</option><option>Father</option><option>Mother</option><option>Guardian</option><option>Other</option></select><select class="pa-filter" data-pa-channel aria-label="Filter by communication channel"><option value="">All Channels</option><option>WhatsApp</option><option>Email</option><option>SMS</option><option>Phone</option></select><button class="pa-button pa-light" type="button" data-pa-print-report><i class="fas fa-print"></i> Print / PDF</button></div>
            <div class="pa-table-wrap"><table class="pa-table"><thead><tr><th>Parent</th><th>Student(s)</th><th>Relationship</th><th>Contact Details</th><th>Primary</th><th>Status</th><th>Actions</th></tr></thead><tbody data-pa-rows></tbody></table></div></section>
        <div class="pa-overlay" data-pa-form-overlay><section class="pa-modal" role="dialog" aria-modal="true" aria-labelledby="pa-form-title"><header class="pa-modal-head"><h3 id="pa-form-title">Add Parent</h3><button class="pa-close" type="button" data-pa-close-form aria-label="Close">&times;</button></header>
            <form class="pa-form" data-pa-form>
                <div class="pa-form-layout"><div class="pa-form-body">
                <h4 class="pa-section-title">Parent Information</h4><div class="pa-grid">
                    <label>Parent ID<input name="parentId" required placeholder="Auto-generated" readonly></label><label>Full Name<input name="parentName" required placeholder="Parent full name"></label><label>Relationship<select name="relationship"><option>Father</option><option>Mother</option><option>Guardian</option><option>Other</option></select></label>
                    <label>National ID<input name="nationalId" placeholder="Identification number"></label><label>Occupation<input name="occupation" placeholder="Occupation / designation"></label><label>Company<input name="company" placeholder="Company name"></label>
                </div>
                <h4 class="pa-section-title">Student / Family Details</h4><div class="pa-grid">
                    <label>Student Name<input name="studentName" required placeholder="Select a student" readonly></label><label>Student ID<select name="studentRecordId" required disabled><option value="">Loading students...</option></select><input name="studentId" type="hidden"><small data-pa-student-status role="status" aria-live="polite">Loading school student records...</small></label><label>Grade / Class<input name="className" placeholder="Select a student" readonly></label>
                    <label>Additional Students<input name="additionalStudents" placeholder="Other children enrolled"></label><label>Family Reference<input name="familyReference" placeholder="Family reference number"></label><label>Parent Status<select name="status"><option>Active</option><option>Inactive</option><option>Pending Verification</option></select></label>
                </div>
                <h4 class="pa-section-title">Contact Information</h4><div class="pa-grid">
                    <label>Mobile Number<input name="mobile" type="tel" required placeholder="+971 50 XXX XXXX"></label><label>Alternative Phone<input name="altPhone" type="tel" placeholder="+971 XX XXX XXXX"></label><label>Email Address<input name="email" type="email" placeholder="parent@example.com"></label>
                    <label>Home Address<input name="address" placeholder="Residential address"></label><label>City<input name="city" placeholder="City"></label><label>Country<input name="country" value="United Arab Emirates" placeholder="Country"></label>
                </div>
                <h4 class="pa-section-title">Communication Preferences</h4><div class="pa-grid">
                    <label>Preferred Channel<select name="preferredChannel"><option>WhatsApp</option><option>Email</option><option>SMS</option><option>Phone</option></select></label><label>Preferred Language<select name="language"><option>English</option><option>Arabic</option><option>Hindi</option><option>Urdu</option><option>Malayalam</option><option>Tamil</option><option>Other</option></select></label><label>WhatsApp<select name="whatsapp"><option>Enabled</option><option>Disabled</option></select></label>
                    <label>Email Notifications<select name="emailNotifications"><option>Enabled</option><option>Disabled</option></select></label><label>SMS Notifications<select name="smsNotifications"><option>Enabled</option><option>Disabled</option></select></label><label>Phone Calls<select name="phoneCalls"><option>Allowed</option><option>Not Preferred</option></select></label>
                </div>
                <h4 class="pa-section-title">Communication &amp; Consent</h4><div class="pa-grid">
                    <label>Primary Contact<select name="primaryContact"><option>Yes</option><option>No</option></select></label><label>Emergency Contact<select name="emergencyContact"><option>Yes</option><option>No</option></select></label><label>Receive School Announcements<select name="announcements"><option>Yes</option><option>No</option></select></label>
                    <label>Receive Marketing / Events<select name="marketing"><option>No</option><option>Yes</option></select></label><label>Consent Verified<select name="consent"><option>Yes</option><option>Pending</option><option>No</option></select></label><label>Last Contact Date<input name="lastContact" type="date"></label>
                    <label class="pa-full">Communication Notes<textarea name="notes" placeholder="Add communication notes, preferences, concerns or instructions..."></textarea></label><label class="pa-full">Internal Remarks<textarea name="remarks" placeholder="Internal department remarks..."></textarea></label>
                </div></div><aside class="pa-live-summary" aria-label="Parent record summary"><h4>Parent Summary</h4><p>Review the record as you fill out the form.</p><div class="pa-live-summary-list">
                    ${[['Parent ID', 'parentId'], ['Parent Name', 'parentName'], ['Relationship', 'relationship'], ['Student', 'studentName'], ['Student ID', 'studentId'], ['Grade / Class', 'className'], ['Mobile', 'mobile'], ['Email', 'email'], ['Preferred Channel', 'preferredChannel'], ['Language', 'language'], ['Status', 'status']].map(([label, name]) => `<div class="pa-live-summary-row"><span>${label}</span><strong data-pa-summary="${name}">—</strong></div>`).join('')}
                </div></aside><footer class="pa-modal-actions"><button class="pa-button pa-light" type="button" data-pa-cancel>Cancel</button><button class="pa-button pa-primary" type="submit">Save Parent</button></footer></div>
            </form>
        </section></div>
        <div class="pa-overlay" data-pa-view-overlay><section class="pa-modal" role="dialog" aria-modal="true" aria-labelledby="pa-view-title"><header class="pa-modal-head"><h3 id="pa-view-title">Parent Details</h3><button class="pa-close" type="button" data-pa-close-view aria-label="Close">&times;</button></header><div class="pa-view" data-pa-view-content></div><footer class="pa-modal-actions"><button class="pa-button pa-light" type="button" data-pa-close-view>Close</button><button class="pa-button pa-primary" type="button" data-pa-print-current><i class="fas fa-print"></i> Print / PDF</button></footer></section></div>
        <div class="pa-toast" role="status" aria-live="polite" data-pa-toast></div>`;

    const storageKey = 'schoolParentContacts';

    let parents;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        parents = Array.isArray(stored) ? stored : [];
    } catch (error) {
        parents = [];
    }
    let editingId = null;
    let viewingId = null;
    let toastTimer;
    const q = selector => section.querySelector(selector);
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    const formatDate = value => {
        if (!value) return '—';
        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime()) ? escape(value) : date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
    };
    const statusClass = value => String(value || '').toLowerCase().replace(/\s+/g, '-');
    const initials = name => String(name || '').split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase();
    const save = () => localStorage.setItem(storageKey, JSON.stringify(parents));
    const parentIdInput = q('[name="parentId"]');
    const studentSelect = q('[name="studentRecordId"]');
    const studentStatus = q('[data-pa-student-status]');
    const formSummaryFields = ['parentId', 'parentName', 'relationship', 'studentName', 'studentId', 'className', 'mobile', 'email', 'preferredChannel', 'language', 'status'];
    const updateFormSummary = () => {
        const form = q('[data-pa-form]');
        formSummaryFields.forEach(name => {
            q(`[data-pa-summary="${name}"]`).textContent = String(form.elements[name].value || '').trim() || '—';
        });
    };
    let studentRecords = [];
    const studentRecordId = student => String(student.id || student.admissionNo || student.admissionNumber || student.studentId || '').trim();
    const studentDisplayId = student => String(student.admissionNo || student.admissionNumber || student.studentCode || student.studentId || student.id || '').trim();
    const studentName = student => String(student.fullName || student.name || student.studentName || [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') || '').trim();
    const studentForId = value => studentRecords.find(student => studentRecordId(student) === String(value) || studentDisplayId(student) === String(value));
    const nextParentId = () => {
        const year = new Date().getFullYear();
        const prefix = `PAR-${year}-`;
        const highestSequence = parents.reduce((highest, parent) => {
            const match = String(parent.parentId || '').match(new RegExp(`^PAR-${year}-(\\d+)$`, 'i'));
            return match ? Math.max(highest, Number(match[1])) : highest;
        }, 0);
        return `${prefix}${String(highestSequence + 1).padStart(3, '0')}`;
    };
    const applyStudentDetails = student => {
        const form = q('[data-pa-form]');
        form.elements.studentRecordId.value = student ? studentRecordId(student) : '';
        form.elements.studentId.value = student ? studentDisplayId(student) : '';
        form.elements.studentName.value = student ? studentName(student) : '';
        const className = String(student?.className || student?.class || student?.grade || student?.gradeName || '').trim();
        const studentSection = String(student?.section || '').trim();
        const classIncludesSection = className.split(/\s*-\s*/).some(part => part.toLowerCase() === studentSection.toLowerCase());
        form.elements.className.value = studentSection && className && !classIncludesSection
            ? `${className} - ${studentSection}`
            : className || studentSection;
    };
    const refreshStudentOptions = () => {
        const selectedId = studentSelect.value || q('[data-pa-form]').elements.studentRecordId.value;
        studentSelect.replaceChildren(new Option('Select student', ''));
        studentRecords
            .filter(student => studentRecordId(student))
            .sort((left, right) => studentName(left).localeCompare(studentName(right)))
            .forEach(student => {
                studentSelect.add(new Option(`${studentDisplayId(student)} — ${studentName(student) || 'Student'}`, studentRecordId(student)));
            });
        if (selectedId && !Array.from(studentSelect.options).some(option => option.value === selectedId)) {
            const student = studentForId(selectedId);
            studentSelect.add(new Option(`${student ? studentDisplayId(student) : selectedId} — ${student ? studentName(student) : 'Student record unavailable'}`, selectedId));
        }
        studentSelect.value = selectedId;
        studentSelect.disabled = !studentRecords.length && !selectedId;
    };
    const toast = message => {
        const element = q('[data-pa-toast]');
        element.textContent = message;
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 2400);
    };
    const updateStats = () => {
        q('[data-pa-stat="total"]').textContent = parents.length;
        q('[data-pa-stat="active"]').textContent = parents.filter(parent => parent.status === 'Active').length;
        q('[data-pa-stat="primary"]').textContent = parents.filter(parent => parent.primaryContact === 'Yes').length;
        q('[data-pa-stat="whatsapp"]').textContent = parents.filter(parent => parent.whatsapp === 'Enabled').length;
        q('[data-pa-stat="email"]').textContent = parents.filter(parent => parent.emailNotifications === 'Enabled').length;
        q('[data-pa-stat="pending"]').textContent = parents.filter(parent => parent.status === 'Pending Verification').length;
    };
    const render = () => {
        const search = q('[data-pa-search]').value.trim().toLowerCase();
        const status = q('[data-pa-status]').value;
        const relation = q('[data-pa-relation]').value;
        const channel = q('[data-pa-channel]').value;
        const filtered = parents.filter(parent => (!status || parent.status === status) && (!relation || parent.relationship === relation) && (!channel || parent.preferredChannel === channel) && (!search || JSON.stringify(parent).toLowerCase().includes(search)));
        q('[data-pa-rows]').innerHTML = filtered.length ? filtered.map(parent => `<tr><td><b class="pa-name">${escape(parent.parentName)}</b><small class="pa-small">${escape(parent.parentId)}</small></td><td><b>${escape(parent.studentName)}</b><small class="pa-small">${escape(parent.studentId)} · ${escape(parent.className)}</small>${parent.additionalStudents ? `<small class="pa-small">+ ${escape(parent.additionalStudents)}</small>` : ''}</td><td><span class="pa-badge ${escape(statusClass(parent.relationship))}">${escape(parent.relationship)}</span></td><td><b>${escape(parent.mobile)}</b><small class="pa-small">${escape(parent.email || 'No email')}</small></td><td><span class="pa-badge ${parent.primaryContact === 'Yes' ? 'primary-contact' : 'secondary-contact'}">${parent.primaryContact === 'Yes' ? 'Primary' : 'Secondary'}</span></td><td><span class="pa-badge ${escape(statusClass(parent.status))}">${escape(parent.status)}</span></td><td><div class="pa-actions"><button class="pa-action" type="button" title="View" aria-label="View ${escape(parent.parentName)}" data-pa-action="view" data-id="${escape(parent.parentId)}"><i class="fas fa-eye"></i></button><button class="pa-action" type="button" title="Edit" aria-label="Edit ${escape(parent.parentName)}" data-pa-action="edit" data-id="${escape(parent.parentId)}"><i class="fas fa-pen"></i></button><button class="pa-action" type="button" title="Send message" aria-label="Message ${escape(parent.parentName)}" data-pa-action="message" data-id="${escape(parent.parentId)}"><i class="fas fa-envelope"></i></button><button class="pa-action" type="button" title="Print" aria-label="Print ${escape(parent.parentName)}" data-pa-action="print" data-id="${escape(parent.parentId)}"><i class="fas fa-print"></i></button><button class="pa-action pa-delete" type="button" title="Delete" aria-label="Delete ${escape(parent.parentName)}" data-pa-action="delete" data-id="${escape(parent.parentId)}"><i class="fas fa-trash"></i></button></div></td></tr>`).join('') : '<tr><td colspan="7"><div class="pa-empty">No parent records found.</div></td></tr>';
        updateStats();
    };
    const closeForm = () => q('[data-pa-form-overlay]').classList.remove('is-open');
    const closeView = () => q('[data-pa-view-overlay]').classList.remove('is-open');
    const openForm = parent => {
        const form = q('[data-pa-form]');
        form.reset();
        refreshStudentOptions();
        editingId = parent?.parentId ?? null;
        q('#pa-form-title').textContent = parent ? 'Edit Parent' : 'Add Parent';
        parentIdInput.value = parent?.parentId || nextParentId();
        if (parent) {
            ['parentName', 'relationship', 'nationalId', 'occupation', 'company', 'studentName', 'studentId', 'className', 'additionalStudents', 'familyReference', 'status', 'mobile', 'altPhone', 'email', 'address', 'city', 'country', 'preferredChannel', 'language', 'whatsapp', 'emailNotifications', 'smsNotifications', 'phoneCalls', 'primaryContact', 'emergencyContact', 'announcements', 'marketing', 'consent', 'lastContact', 'notes', 'remarks'].forEach(field => { form.elements[field].value = parent[field] ?? ''; });
            const linkedStudent = studentForId(parent.studentRecordId || parent.studentId);
            const savedStudentId = linkedStudent ? studentRecordId(linkedStudent) : parent.studentRecordId || parent.studentId || '';
            if (savedStudentId && !Array.from(studentSelect.options).some(option => option.value === savedStudentId)) {
                studentSelect.add(new Option(`${parent.studentId || savedStudentId} — ${parent.studentName || 'Student record unavailable'}`, savedStudentId));
            }
            studentSelect.value = savedStudentId;
            if (linkedStudent) applyStudentDetails(linkedStudent);
        }
        updateFormSummary();
        q('[data-pa-form-overlay]').classList.add('is-open');
        (parent ? form.elements.parentName : form.elements.parentId).focus();
    };

    const api = window.schoolPortalData;
    if (api?.subscribe) {
        void api.subscribe('students', records => {
            studentRecords = records.filter(student => student.deleted !== true);
            refreshStudentOptions();
            studentStatus.textContent = studentRecords.length
                ? 'Choose a student to fill in their name and class.'
                : 'No student records are available for this school.';
        }).catch(error => {
            console.error('Unable to load student records for parent entry.', error);
            studentStatus.textContent = 'Unable to load student records. Check access and connectivity, then retry.';
        });
    } else {
        studentStatus.textContent = 'Student records are unavailable. Reload the app and try again.';
    }
    window.addEventListener('school-portal-sync-error', event => {
        if (event.detail?.collection !== 'students') return;
        console.error('Unable to synchronize student records for parent entry.', event.detail.error);
        studentStatus.textContent = 'Unable to load student records. Check access and connectivity, then retry.';
    });
    studentSelect.addEventListener('change', () => {
        const student = studentForId(studentSelect.value);
        if (!student) {
            applyStudentDetails(null);
            return;
        }
        applyStudentDetails(student);
    });
    q('[data-pa-form]').addEventListener('input', updateFormSummary);
    q('[data-pa-form]').addEventListener('change', updateFormSummary);
    const detailContent = parent => `<header class="pa-detail-header"><div class="pa-profile"><span class="pa-avatar">${escape(initials(parent.parentName))}</span><div><h2>${escape(parent.parentName)}</h2><p>${escape(parent.relationship)} · Parent ID: ${escape(parent.parentId)} · Student: ${escape(parent.studentName)}</p></div></div><span class="pa-badge ${escape(statusClass(parent.status))}">${escape(parent.status)}</span></header>
        <div class="pa-summary-grid">${[['Parent ID', parent.parentId], ['Relationship', parent.relationship], ['Student', parent.studentName], ['Class', parent.className], ['Primary Contact', parent.primaryContact], ['Preferred Channel', parent.preferredChannel], ['Language', parent.language], ['Last Contact', formatDate(parent.lastContact)]].map(([label, value]) => `<div class="pa-summary-box"><span>${escape(label)}</span><strong>${escape(value || '—')}</strong></div>`).join('')}</div>
        <h4 class="pa-section-title">Parent &amp; Family Information</h4><table class="pa-info-table"><tbody>${[['Full Name', parent.parentName], ['Relationship', parent.relationship], ['National ID', parent.nationalId], ['Occupation', parent.occupation], ['Company', parent.company], ['Student', parent.studentName], ['Student ID', parent.studentId], ['Grade / Class', parent.className], ['Additional Students', parent.additionalStudents], ['Family Reference', parent.familyReference]].map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value || '—')}</td></tr>`).join('')}</tbody></table>
        <h4 class="pa-section-title">Contact Information</h4><table class="pa-info-table"><tbody>${[['Mobile', parent.mobile], ['Alternative Phone', parent.altPhone], ['Email', parent.email], ['Address', parent.address], ['City', parent.city], ['Country', parent.country]].map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value || '—')}</td></tr>`).join('')}</tbody></table>
        <h4 class="pa-section-title">Communication Preferences</h4><table class="pa-info-table"><tbody>${[['Preferred Channel', parent.preferredChannel], ['Preferred Language', parent.language], ['WhatsApp', parent.whatsapp], ['Email Notifications', parent.emailNotifications], ['SMS Notifications', parent.smsNotifications], ['Phone Calls', parent.phoneCalls], ['School Announcements', parent.announcements], ['Marketing / Events', parent.marketing], ['Consent Verified', parent.consent], ['Emergency Contact', parent.emergencyContact]].map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value || '—')}</td></tr>`).join('')}</tbody></table>
        <section class="pa-communication"><h4>Quick Communication</h4><div class="pa-quick-actions"><button class="pa-button pa-primary" type="button" data-pa-message="Email"><i class="fas fa-envelope"></i> Email</button><button class="pa-button pa-success" type="button" data-pa-message="WhatsApp"><i class="fab fa-whatsapp"></i> WhatsApp</button><button class="pa-button pa-light" type="button" data-pa-message="Phone"><i class="fas fa-phone"></i> Call</button></div></section><div class="pa-notes"><strong>Communication Notes</strong><p>${escape(parent.notes || 'No communication notes.')}</p></div><div class="pa-notes"><strong>Internal Remarks</strong><p>${escape(parent.remarks || 'No internal remarks.')}</p></div>`;
    const printDocument = (title, html) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast('Allow pop-ups to print parent records.');
        printWindow.document.write(`<!doctype html><html><head><title>${escape(title)}</title><meta charset="utf-8"><style>body{font:13px Arial,sans-serif;color:#172033;padding:32px}h1{font-size:23px;margin:0}p{color:#475569}.head{display:flex;justify-content:space-between;border-bottom:2px solid #172033;padding-bottom:14px;margin-bottom:20px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:16px 0;font-size:12px}.meta strong{display:block;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:11px}th{background:#f1f5f9}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:35px;margin-top:65px}.signatures span{border-top:1px solid #475569;padding-top:8px}@media print{body{padding:0}}</style></head><body>${html}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    const printParent = parent => {
        const meta = [['Parent', parent.parentName], ['Relationship', parent.relationship], ['Student', parent.studentName], ['Student ID', parent.studentId], ['Class', parent.className], ['Primary Contact', parent.primaryContact], ['Mobile', parent.mobile], ['Email', parent.email], ['Preferred Channel', parent.preferredChannel], ['Language', parent.language], ['WhatsApp', parent.whatsapp], ['Email Notifications', parent.emailNotifications], ['Last Contact', formatDate(parent.lastContact)], ['Consent', parent.consent]];
        const rows = [['Occupation', parent.occupation], ['Company', parent.company], ['National ID', parent.nationalId], ['Additional Students', parent.additionalStudents], ['Address', parent.address], ['Alternative Phone', parent.altPhone], ['SMS Notifications', parent.smsNotifications], ['School Announcements', parent.announcements], ['Emergency Contact', parent.emergencyContact], ['Communication Notes', parent.notes], ['Internal Remarks', parent.remarks]];
        const html = `<header class="head"><div><h1>Parent Information Record</h1><p>Communication Department</p></div><div><strong>${escape(parent.parentId)}</strong><br>Status: ${escape(parent.status)}</div></header><div class="meta">${meta.map(([label, value]) => `<div><strong>${escape(label)}</strong>${escape(value || '—')}</div>`).join('')}</div><table><thead><tr><th>Information</th><th>Details</th></tr></thead><tbody>${rows.map(([label, value]) => `<tr><td>${escape(label)}</td><td>${escape(value || '—')}</td></tr>`).join('')}</tbody></table><div class="signatures"><span>Parent / Guardian</span><span>Communication Officer</span><span>Department Manager</span></div>`;
        printDocument(parent.parentId, html);
    };
    const sendMessage = (parent, channel) => {
        if (channel === 'Email' && parent.email) {
            window.location.href = `mailto:${encodeURIComponent(parent.email)}?subject=${encodeURIComponent('School Communication')}`;
        } else if (channel === 'WhatsApp' && parent.mobile) {
            window.open(`https://wa.me/${parent.mobile.replace(/\D/g, '')}`, '_blank', 'noopener');
        } else if (channel === 'Phone' && parent.mobile) {
            window.location.href = `tel:${parent.mobile}`;
        } else {
            toast(`No ${channel.toLowerCase()} contact available.`);
        }
    };

    q('[data-pa-new]').addEventListener('click', () => openForm());
    q('[data-pa-search]').addEventListener('input', render);
    q('[data-pa-status]').addEventListener('change', render);
    q('[data-pa-relation]').addEventListener('change', render);
    q('[data-pa-channel]').addEventListener('change', render);
    q('[data-pa-print-report]').addEventListener('click', () => {
        if (!parents.length) return toast('No parent records available.');
        const rows = parents.map(parent => `<tr><td>${escape(parent.parentId)}</td><td>${escape(parent.parentName)}</td><td>${escape(parent.studentName)}</td><td>${escape(parent.relationship)}</td><td>${escape(parent.mobile)}</td><td>${escape(parent.email || '—')}</td><td>${escape(parent.primaryContact)}</td><td>${escape(parent.status)}</td></tr>`).join('');
        printDocument('Parent Contact Register', `<header class="head"><div><h1>Parent Contact Register</h1><p>Communication Department</p></div><div>Total Records: <strong>${parents.length}</strong></div></header><table><thead><tr><th>Parent ID</th><th>Parent</th><th>Student</th><th>Relationship</th><th>Mobile</th><th>Email</th><th>Primary</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table><div class="signatures"><span>Prepared By</span><span>Checked By</span><span>Communication Manager</span></div>`);
    });
    q('[data-pa-form]').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const parent = Object.fromEntries(new FormData(form).entries());
        if (!parent.studentRecordId) return toast('Select a student from the school records.');
        const selectedStudent = studentForId(parent.studentRecordId);
        if (!selectedStudent && !editingId) return toast('Select a valid student from the school records.');
        parent.parentId = editingId || nextParentId();
        parent.studentName = selectedStudent ? studentName(selectedStudent) : parent.studentName;
        parent.studentId = selectedStudent ? studentDisplayId(selectedStudent) : parent.studentId;
        parent.className = selectedStudent ? form.elements.className.value : parent.className;
        if (parents.some(item => String(item.parentId || '').toLowerCase() === parent.parentId.toLowerCase() && item.parentId !== editingId)) return toast('Parent ID already exists.');
        const existing = parents.find(item => item.parentId === editingId);
        if (existing) parents = parents.map(item => item.parentId === editingId ? parent : item);
        else parents.unshift(parent);
        save();
        closeForm();
        render();
        toast(existing ? 'Parent record updated successfully.' : 'Parent added successfully.');
    });
    q('[data-pa-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-pa-action]');
        if (!button) return;
        const parent = parents.find(item => item.parentId === button.dataset.id);
        if (!parent) return;
        if (button.dataset.paAction === 'view') {
            viewingId = parent.parentId;
            q('[data-pa-view-content]').innerHTML = detailContent(parent);
            q('[data-pa-view-overlay]').classList.add('is-open');
        } else if (button.dataset.paAction === 'edit') {
            openForm(parent);
        } else if (button.dataset.paAction === 'message') {
            sendMessage(parent, parent.preferredChannel);
        } else if (button.dataset.paAction === 'print') {
            printParent(parent);
        } else if (button.dataset.paAction === 'delete' && confirm(`Delete parent "${parent.parentName}"?`)) {
            parents = parents.filter(item => item.parentId !== parent.parentId);
            save();
            render();
            toast('Parent record deleted.');
        }
    });
    q('[data-pa-view-content]').addEventListener('click', event => {
        const button = event.target.closest('[data-pa-message]');
        if (!button) return;
        const parent = parents.find(item => item.parentId === viewingId);
        if (parent) sendMessage(parent, button.dataset.paMessage);
    });
    q('[data-pa-close-form]').addEventListener('click', closeForm);
    q('[data-pa-cancel]').addEventListener('click', closeForm);
    section.querySelectorAll('[data-pa-close-view]').forEach(button => button.addEventListener('click', closeView));
    q('[data-pa-print-current]').addEventListener('click', () => {
        const parent = parents.find(item => item.parentId === viewingId);
        if (parent) printParent(parent);
    });
    section.querySelectorAll('.pa-overlay').forEach(overlay => overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('is-open'); }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            q('[data-pa-form-overlay]').classList.remove('is-open');
            closeView();
        }
    });
    render();
    return section;
}