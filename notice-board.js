function createNoticeBoardModule() {
    const section = document.createElement('section');
    section.className = 'module notice-board-module hidden';
    section.id = 'noticeBoardModule';
    section.innerHTML = `
        <header class="nb-header"><div><h2>Notice Board</h2><p>Communication Department · Create, publish, schedule and manage official notices</p></div><button class="nb-button nb-primary" type="button" data-nb-new><i class="fas fa-plus"></i> Create Notice</button></header>
        <section class="nb-stats" aria-label="Notice board summary"><article class="nb-stat"><div><span>Total Notices</span><strong data-nb-stat="total">0</strong></div><i class="fas fa-clipboard-list"></i></article><article class="nb-stat"><div><span>Published</span><strong data-nb-stat="published">0</strong></div><i class="fas fa-circle-check"></i></article><article class="nb-stat"><div><span>Scheduled</span><strong data-nb-stat="scheduled">0</strong></div><i class="fas fa-clock"></i></article><article class="nb-stat"><div><span>Urgent</span><strong data-nb-stat="urgent">0</strong></div><i class="fas fa-triangle-exclamation"></i></article><article class="nb-stat"><div><span>Active Notices</span><strong data-nb-stat="active">0</strong></div><i class="fas fa-bullhorn"></i></article><article class="nb-stat"><div><span>Archived</span><strong data-nb-stat="archived">0</strong></div><i class="fas fa-box-archive"></i></article></section>
        <section class="nb-content" aria-label="Notice records"><div class="nb-toolbar"><label class="nb-search"><i class="fas fa-search" aria-hidden="true"></i><span class="nb-sr-only">Search notices</span><input type="search" data-nb-search placeholder="Search notice, title, category, department..."></label><select class="nb-filter" data-nb-status aria-label="Filter by status"><option value="">All Statuses</option><option>Published</option><option>Scheduled</option><option>Draft</option><option>Pending</option><option>Archived</option><option>Expired</option></select><select class="nb-filter" data-nb-priority aria-label="Filter by priority"><option value="">All Priorities</option><option>Urgent</option><option>High</option><option>Normal</option><option>Low</option></select><select class="nb-filter" data-nb-audience aria-label="Filter by audience"><option value="">All Audiences</option><option>Parents</option><option>Students</option><option>Staff</option><option>Public</option><option>School Community</option></select><button class="nb-button nb-light" type="button" data-nb-print-report><i class="fas fa-print"></i> Print / PDF</button></div>
            <div class="nb-table-wrap"><table class="nb-table"><thead><tr><th>Notice</th><th>Title</th><th>Category</th><th>Audience</th><th>Priority</th><th>Publish Date</th><th>Expiry</th><th>Posted By</th><th>Status</th><th>Actions</th></tr></thead><tbody data-nb-rows></tbody></table></div></section>
        <div class="nb-overlay" data-nb-form-overlay><section class="nb-modal" role="dialog" aria-modal="true" aria-labelledby="nb-form-title"><header class="nb-modal-head"><h3 id="nb-form-title">Create Notice</h3><button class="nb-close" type="button" data-nb-close-form aria-label="Close">&times;</button></header>
            <form class="nb-form" data-nb-form>
                <h4 class="nb-section-title">Notice Information</h4><div class="nb-grid">
                    <label>Notice ID<input name="noticeId" required placeholder="NTC-2026-001"></label><label>Notice Title<input name="title" required placeholder="Important Parent Meeting Announcement"></label><label>Category<select name="category"><option>General Announcement</option><option>Academic</option><option>Events</option><option>Examination</option><option>Holiday</option><option>Emergency</option><option>Finance</option><option>Attendance</option><option>Transport</option><option>Admissions</option><option>Sports</option><option>Other</option></select></label>
                    <label>Audience<select name="audience"><option>School Community</option><option>Parents</option><option>Students</option><option>Staff</option><option>Public</option><option>Parents &amp; Students</option><option>Teachers &amp; Staff</option></select></label><label>Priority<select name="priority"><option>Normal</option><option>Urgent</option><option>High</option><option>Low</option></select></label><label>Status<select name="status"><option>Draft</option><option>Pending</option><option>Scheduled</option><option>Published</option><option>Archived</option><option>Expired</option></select></label>
                </div>
                <h4 class="nb-section-title">Publishing Information</h4><div class="nb-grid">
                    <label>Publish Date<input name="publishDate" type="date" required></label><label>Publish Time<input name="publishTime" type="time" value="08:00"></label><label>Expiry Date<input name="expiryDate" type="date"></label>
                    <label>Expiry Time<input name="expiryTime" type="time" value="23:59"></label><label>Department<select name="department"><option>Communication Department</option><option>Administration</option><option>Academic Department</option><option>Finance Department</option><option>HR Department</option><option>Transport Department</option><option>Admissions Department</option><option>Student Affairs</option></select></label><label>Posted By<input name="postedBy" value="Communication Officer" placeholder="Employee name"></label>
                </div>
                <div class="nb-section-heading"><h4 class="nb-section-title">Notice Content</h4><span class="nb-counter">Characters: <b data-nb-char-count>0</b></span></div><div class="nb-grid">
                    <label>Notice Template<select name="template"><option value="">Select Template</option><option value="meeting">Parent Meeting</option><option value="holiday">Holiday Announcement</option><option value="exam">Examination Notice</option><option value="emergency">Emergency Notice</option><option value="fee">Fee Reminder</option><option value="event">School Event</option></select></label><label>Display Style<select name="displayStyle"><option>Standard</option><option>Highlighted</option><option>Important</option><option>Emergency Banner</option></select></label><label>Attachment<input name="attachment" placeholder="File name or document reference"></label>
                    <label class="nb-full">Notice Content<textarea name="contentText" maxlength="5000" required placeholder="Write the official notice content here..."></textarea></label>
                </div>
                <h4 class="nb-section-title">Communication Channels</h4><div class="nb-grid">
                    <label>Display On Notice Board<select name="displayBoard"><option>Yes</option><option>No</option></select></label><label>Send SMS Alert<select name="sendSMS"><option>No</option><option>Yes</option></select></label><label>Send Email<select name="sendEmail"><option>Yes</option><option>No</option></select></label><label>Website Publication<select name="website"><option>Yes</option><option>No</option></select></label><label>Portal Publication<select name="portal"><option>Yes</option><option>No</option></select></label><label>Pin To Top<select name="pin"><option>No</option><option>Yes</option></select></label>
                </div>
                <h4 class="nb-section-title">Internal Notes</h4><div class="nb-grid"><label class="nb-full">Internal Notes<textarea name="notes" placeholder="Internal communication department notes..."></textarea></label></div>
                <footer class="nb-modal-actions"><button class="nb-button nb-light" type="button" data-nb-cancel>Cancel</button><button class="nb-button nb-primary" type="submit">Save Notice</button></footer>
            </form>
        </section></div>
        <div class="nb-overlay" data-nb-view-overlay><section class="nb-modal" role="dialog" aria-modal="true" aria-labelledby="nb-view-title"><header class="nb-modal-head"><h3 id="nb-view-title">Notice Details</h3><button class="nb-close" type="button" data-nb-close-view aria-label="Close">&times;</button></header><div class="nb-view" data-nb-view-content></div><footer class="nb-modal-actions"><button class="nb-button nb-light" type="button" data-nb-close-view>Close</button><button class="nb-button nb-primary" type="button" data-nb-print-current><i class="fas fa-print"></i> Print / PDF</button></footer></section></div>
        <div class="nb-toast" role="status" aria-live="polite" data-nb-toast></div>`;

    const storageKey = 'schoolNoticeBoard';
    const seed = [
        { noticeId: 'NTC-2026-001', title: 'Parent-Teacher Meeting', category: 'Events', audience: 'Parents', priority: 'High', status: 'Published', publishDate: '2026-10-01', publishTime: '08:00', expiryDate: '2026-10-10', expiryTime: '18:00', department: 'Communication Department', postedBy: 'Communication Officer', displayStyle: 'Highlighted', attachment: 'Parent_Meeting_Schedule.pdf', contentText: "Dear Parents,\n\nThis is to inform you that the Parent-Teacher Meeting will be held on 10 October 2026 from 3:00 PM to 6:00 PM.\n\nParents are kindly requested to attend the meeting and discuss their child's academic progress with the respective teachers.\n\nWe look forward to your presence.", displayBoard: 'Yes', sendSMS: 'Yes', sendEmail: 'Yes', website: 'Yes', portal: 'Yes', pin: 'Yes', notes: 'Important parent communication.' },
        { noticeId: 'NTC-2026-002', title: 'Public Holiday Announcement', category: 'Holiday', audience: 'School Community', priority: 'Normal', status: 'Scheduled', publishDate: '2026-10-12', publishTime: '08:00', expiryDate: '2026-10-16', expiryTime: '23:59', department: 'Administration', postedBy: 'Admin Officer', displayStyle: 'Standard', attachment: '', contentText: 'Dear Parents, Students and Staff,\n\nPlease be informed that the school will remain closed on 15 October 2026 due to the scheduled public holiday.\n\nClasses will resume on the next working day.', displayBoard: 'Yes', sendSMS: 'Yes', sendEmail: 'Yes', website: 'Yes', portal: 'Yes', pin: 'No', notes: 'Scheduled holiday announcement.' },
        { noticeId: 'NTC-2026-003', title: 'Mid-Term Examination Schedule', category: 'Examination', audience: 'Students', priority: 'High', status: 'Published', publishDate: '2026-09-28', publishTime: '09:00', expiryDate: '2026-11-01', expiryTime: '23:59', department: 'Academic Department', postedBy: 'Academic Coordinator', displayStyle: 'Important', attachment: 'Mid_Term_Exam_Schedule.pdf', contentText: 'Students are hereby informed that the Mid-Term Examination will commence from 20 October 2026.\n\nStudents are advised to review the attached examination timetable and prepare accordingly.\n\nFor any clarification, please contact the Academic Department.', displayBoard: 'Yes', sendSMS: 'No', sendEmail: 'Yes', website: 'Yes', portal: 'Yes', pin: 'Yes', notes: 'Exam schedule published after academic approval.' },
        { noticeId: 'NTC-2026-004', title: 'Emergency School Closure', category: 'Emergency', audience: 'School Community', priority: 'Urgent', status: 'Published', publishDate: '2026-09-30', publishTime: '06:30', expiryDate: '2026-10-01', expiryTime: '23:59', department: 'Administration', postedBy: "Principal's Office", displayStyle: 'Emergency Banner', attachment: '', contentText: "URGENT NOTICE\n\nDue to unforeseen circumstances, the school will remain closed today.\n\nParents and students are requested to follow official school communication channels for further updates.\n\nPlease do not travel to the school until further notice.", displayBoard: 'Yes', sendSMS: 'Yes', sendEmail: 'Yes', website: 'Yes', portal: 'Yes', pin: 'Yes', notes: "Emergency notice issued by Principal's Office." },
        { noticeId: 'NTC-2026-005', title: 'Outstanding Fee Reminder', category: 'Finance', audience: 'Parents', priority: 'High', status: 'Pending', publishDate: '2026-10-05', publishTime: '10:00', expiryDate: '2026-10-20', expiryTime: '23:59', department: 'Finance Department', postedBy: 'Accounts Officer', displayStyle: 'Highlighted', attachment: '', contentText: 'Dear Parents,\n\nThis is a friendly reminder to clear any outstanding school fee balances before the due date.\n\nFor account details or payment assistance, please contact the Finance Department.', displayBoard: 'Yes', sendSMS: 'Yes', sendEmail: 'Yes', website: 'No', portal: 'Yes', pin: 'No', notes: 'Pending final approval from Finance Manager.' },
        { noticeId: 'NTC-2026-006', title: 'Annual Sports Day', category: 'Sports', audience: 'Parents & Students', priority: 'Normal', status: 'Draft', publishDate: '2026-10-08', publishTime: '08:30', expiryDate: '2026-10-30', expiryTime: '23:59', department: 'Student Affairs', postedBy: 'Sports Coordinator', displayStyle: 'Standard', attachment: 'Sports_Day_Guidelines.pdf', contentText: 'Dear Parents and Students,\n\nThe Annual Sports Day will be held next month. Students are requested to participate actively and follow the instructions provided by the Sports Department.\n\nFurther details regarding timings, uniforms and transportation will be shared shortly.', displayBoard: 'Yes', sendSMS: 'No', sendEmail: 'Yes', website: 'Yes', portal: 'Yes', pin: 'No', notes: 'Draft awaiting final event confirmation.' }
    ];
    let notices;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        notices = Array.isArray(stored) ? stored : seed;
    } catch (error) {
        notices = seed;
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
    const statusClass = value => String(value || '').toLowerCase().replace(/\s+/g, '-').replace(/&/g, '');
    const save = () => localStorage.setItem(storageKey, JSON.stringify(notices));
    const toast = message => {
        const element = q('[data-nb-toast]');
        element.textContent = message;
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 2400);
    };
    const nextId = () => {
        const max = Math.max(0, ...notices.map(notice => Number(notice.noticeId.match(/^NTC-\d{4}-(\d+)$/)?.[1]) || 0));
        return `NTC-${new Date().getFullYear()}-${String(max + 1).padStart(3, '0')}`;
    };
    const updateCounter = () => { q('[data-nb-char-count]').textContent = q('[name="contentText"]').value.length; };
    const updateStats = () => {
        q('[data-nb-stat="total"]').textContent = notices.length;
        q('[data-nb-stat="published"]').textContent = notices.filter(notice => notice.status === 'Published').length;
        q('[data-nb-stat="scheduled"]').textContent = notices.filter(notice => notice.status === 'Scheduled').length;
        q('[data-nb-stat="urgent"]').textContent = notices.filter(notice => notice.priority === 'Urgent').length;
        q('[data-nb-stat="active"]').textContent = notices.filter(notice => ['Published', 'Scheduled'].includes(notice.status)).length;
        q('[data-nb-stat="archived"]').textContent = notices.filter(notice => notice.status === 'Archived').length;
    };
    const render = () => {
        const search = q('[data-nb-search]').value.trim().toLowerCase();
        const status = q('[data-nb-status]').value;
        const priority = q('[data-nb-priority]').value;
        const audience = q('[data-nb-audience]').value;
        const filtered = notices.filter(notice => (!status || notice.status === status) && (!priority || notice.priority === priority) && (!audience || notice.audience === audience) && (!search || JSON.stringify(notice).toLowerCase().includes(search)));
        q('[data-nb-rows]').innerHTML = filtered.length ? filtered.map(notice => {
            const audienceClass = notice.audience.includes('Parent') ? 'parent' : notice.audience.includes('Student') ? 'student' : notice.audience.includes('Staff') || notice.audience.includes('Teacher') ? 'staff' : notice.audience === 'Public' ? 'public' : 'school';
            return `<tr><td><strong class="nb-code">${escape(notice.noticeId)}</strong><small class="nb-small">${escape(notice.department)}</small></td><td><b>${escape(notice.title)}</b><small class="nb-small">${escape(notice.contentText.slice(0, 65))}${notice.contentText.length > 65 ? '...' : ''}</small></td><td><span class="nb-badge school">${escape(notice.category)}</span></td><td><span class="nb-badge ${audienceClass}">${escape(notice.audience)}</span></td><td><span class="nb-badge ${escape(statusClass(notice.priority))}">${escape(notice.priority)}</span></td><td><b>${formatDate(notice.publishDate)}</b><small class="nb-small">${escape(notice.publishTime || '—')}</small></td><td><b>${formatDate(notice.expiryDate)}</b><small class="nb-small">${escape(notice.expiryTime || '—')}</small></td><td><b>${escape(notice.postedBy)}</b><small class="nb-small">${escape(notice.department)}</small></td><td><span class="nb-badge ${escape(statusClass(notice.status))}">${escape(notice.status)}</span></td><td><div class="nb-actions"><button class="nb-action" type="button" title="View" aria-label="View ${escape(notice.title)}" data-nb-action="view" data-id="${escape(notice.noticeId)}"><i class="fas fa-eye"></i></button><button class="nb-action" type="button" title="Edit" aria-label="Edit ${escape(notice.title)}" data-nb-action="edit" data-id="${escape(notice.noticeId)}"><i class="fas fa-pen"></i></button><button class="nb-action" type="button" title="Duplicate" aria-label="Duplicate ${escape(notice.title)}" data-nb-action="duplicate" data-id="${escape(notice.noticeId)}"><i class="fas fa-copy"></i></button><button class="nb-action" type="button" title="Print" aria-label="Print ${escape(notice.title)}" data-nb-action="print" data-id="${escape(notice.noticeId)}"><i class="fas fa-print"></i></button><button class="nb-action nb-delete" type="button" title="Delete" aria-label="Delete ${escape(notice.title)}" data-nb-action="delete" data-id="${escape(notice.noticeId)}"><i class="fas fa-trash"></i></button></div></td></tr>`;
        }).join('') : '<tr><td colspan="10"><div class="nb-empty">No notices found.</div></td></tr>';
        updateStats();
    };
    const closeForm = () => q('[data-nb-form-overlay]').classList.remove('is-open');
    const closeView = () => q('[data-nb-view-overlay]').classList.remove('is-open');
    const templates = {
        meeting: "Dear Parents,\n\nThis is to inform you that the Parent-Teacher Meeting will be held on [DATE] from [TIME].\n\nParents are kindly requested to attend the meeting and discuss their child's academic progress with the respective teachers.\n\nWe look forward to your presence.",
        holiday: 'Dear Parents, Students and Staff,\n\nPlease be informed that the school will remain closed on [DATE] due to the scheduled public holiday.\n\nClasses will resume on the next working day.',
        exam: 'Dear Students,\n\nThe examination schedule has been released.\n\nPlease review the attached timetable carefully and ensure that you are fully prepared for all examinations.\n\nFor any clarification, please contact the Academic Department.',
        emergency: 'URGENT NOTICE\n\nDear Parents and Students,\n\nDue to unforeseen circumstances, important changes have been made to today\'s school arrangements.\n\nPlease follow official school communication channels for further updates.',
        fee: 'Dear Parents,\n\nThis is a friendly reminder to clear any outstanding school fee balances before the due date.\n\nFor account details or payment assistance, please contact the Finance Department.',
        event: 'Dear Parents and Students,\n\nWe are pleased to announce the upcoming school event.\n\nPlease review the event details and follow all instructions provided by the school.\n\nWe look forward to your participation.'
    };
    const openForm = notice => {
        const form = q('[data-nb-form]');
        form.reset();
        editingId = notice?.noticeId ?? null;
        q('#nb-form-title').textContent = notice ? 'Edit Notice' : 'Create Notice';
        form.elements.noticeId.value = notice?.noticeId || nextId();
        if (notice) {
            ['title', 'category', 'audience', 'priority', 'status', 'publishDate', 'publishTime', 'expiryDate', 'expiryTime', 'department', 'postedBy', 'displayStyle', 'attachment', 'contentText', 'displayBoard', 'sendSMS', 'sendEmail', 'website', 'portal', 'pin', 'notes'].forEach(field => { form.elements[field].value = notice[field] ?? ''; });
        } else {
            form.elements.publishDate.value = new Date().toISOString().slice(0, 10);
            form.elements.postedBy.value = 'Communication Officer';
        }
        updateCounter();
        q('[data-nb-form-overlay]').classList.add('is-open');
        form.elements.title.focus();
    };
    const detailContent = notice => `<header class="nb-detail-header"><div class="nb-profile"><span class="nb-avatar"><i class="fas fa-clipboard-list"></i></span><div><h2>${escape(notice.title)}</h2><p>${escape(notice.noticeId)} · ${escape(notice.category)} · ${escape(notice.department)}</p></div></div><span class="nb-badge ${escape(statusClass(notice.status))}">${escape(notice.status)}</span></header>
        <div class="nb-summary-grid">${[['Notice ID', notice.noticeId], ['Audience', notice.audience], ['Priority', notice.priority], ['Status', notice.status], ['Publish Date', formatDate(notice.publishDate)], ['Expiry Date', formatDate(notice.expiryDate)], ['Posted By', notice.postedBy], ['Pin To Top', notice.pin]].map(([label, value]) => `<div class="nb-summary-box"><span>${escape(label)}</span><strong>${escape(value || '—')}</strong></div>`).join('')}</div>
        <h4 class="nb-section-title">Notice Information</h4><table class="nb-info-table"><tbody>${[['Notice Title', notice.title], ['Category', notice.category], ['Audience', notice.audience], ['Priority', notice.priority], ['Department', notice.department], ['Posted By', notice.postedBy], ['Publish Date / Time', `${formatDate(notice.publishDate)} · ${notice.publishTime || '—'}`], ['Expiry Date / Time', `${formatDate(notice.expiryDate)} · ${notice.expiryTime || '—'}`], ['Display Style', notice.displayStyle], ['Attachment', notice.attachment]].map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value || '—')}</td></tr>`).join('')}</tbody></table>
        <div class="nb-message"><h4>Notice Content</h4><p>${escape(notice.contentText)}</p></div><h4 class="nb-section-title">Communication Channels</h4><table class="nb-info-table"><tbody>${[['Notice Board', notice.displayBoard], ['SMS Alert', notice.sendSMS], ['Email', notice.sendEmail], ['Website', notice.website], ['Parent / Student Portal', notice.portal], ['Pin To Top', notice.pin]].map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value)}</td></tr>`).join('')}</tbody></table><div class="nb-quick-actions">${['Draft', 'Pending', 'Scheduled'].includes(notice.status) ? `<button class="nb-button nb-primary" type="button" data-nb-publish="${escape(notice.noticeId)}"><i class="fas fa-paper-plane"></i> Publish Notice</button>` : ''}<button class="nb-button nb-light" type="button" data-nb-edit-current="${escape(notice.noticeId)}"><i class="fas fa-pen"></i> Edit</button><button class="nb-button nb-light" type="button" data-nb-duplicate-current="${escape(notice.noticeId)}"><i class="fas fa-copy"></i> Duplicate</button></div><div class="nb-notes"><strong>Internal Notes</strong><p>${escape(notice.notes || 'No internal notes.')}</p></div>`;
    const printDocument = (title, html) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast('Allow pop-ups to print notices.');
        printWindow.document.write(`<!doctype html><html><head><title>${escape(title)}</title><meta charset="utf-8"><style>body{font:13px Arial,sans-serif;color:#172033;padding:32px}h1{font-size:23px;margin:0}p{color:#475569}.head{display:flex;justify-content:space-between;border-bottom:2px solid #172033;padding-bottom:14px;margin-bottom:20px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:16px 0;font-size:12px}.meta strong{display:block;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:11px}th{background:#f1f5f9}.notice{margin-top:20px;border:1px solid #cbd5e1;padding:15px;font-size:12px;line-height:1.7;white-space:pre-wrap}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:35px;margin-top:65px}.signatures span{border-top:1px solid #475569;padding-top:8px}@media print{body{padding:0}}</style></head><body>${html}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    const printNotice = notice => {
        const html = `<header class="head"><div><h1>Official Notice</h1><p>Communication Department</p></div><div><strong>${escape(notice.noticeId)}</strong><br>Status: ${escape(notice.status)}</div></header><div class="meta">${[['Notice Title', notice.title], ['Category', notice.category], ['Audience', notice.audience], ['Priority', notice.priority], ['Department', notice.department], ['Posted By', notice.postedBy], ['Publish Date', formatDate(notice.publishDate)], ['Publish Time', notice.publishTime], ['Expiry Date', formatDate(notice.expiryDate)], ['Expiry Time', notice.expiryTime]].map(([label, value]) => `<div><strong>${escape(label)}</strong>${escape(value || '—')}</div>`).join('')}</div><table><thead><tr><th>Field</th><th>Details</th></tr></thead><tbody>${[['Display Style', notice.displayStyle], ['Notice Board', notice.displayBoard], ['SMS Alert', notice.sendSMS], ['Email', notice.sendEmail], ['Website', notice.website], ['Portal', notice.portal], ['Pin To Top', notice.pin], ['Attachment', notice.attachment]].map(([label, value]) => `<tr><td>${escape(label)}</td><td>${escape(value || '—')}</td></tr>`).join('')}</tbody></table><div class="notice"><strong>Notice Content</strong><br><br>${escape(notice.contentText)}</div><p><strong>Internal Notes:</strong> ${escape(notice.notes || '—')}</p><div class="signatures"><span>Prepared By</span><span>Checked By</span><span>Communication Manager</span></div>`;
        printDocument(notice.noticeId, html);
    };
    const duplicateNotice = notice => {
        const copy = { ...notice, noticeId: nextId(), title: `${notice.title} - Copy`, status: 'Draft' };
        notices.unshift(copy);
        save();
        render();
        toast('Notice duplicated as draft.');
    };
    const publishNotice = notice => {
        if (!confirm(`Publish "${notice.title}" now?`)) return;
        notice.status = 'Published';
        save();
        render();
        closeView();
        toast('Notice published successfully.');
    };

    q('[data-nb-new]').addEventListener('click', () => openForm());
    q('[data-nb-search]').addEventListener('input', render);
    q('[data-nb-status]').addEventListener('change', render);
    q('[data-nb-priority]').addEventListener('change', render);
    q('[data-nb-audience]').addEventListener('change', render);
    q('[name="contentText"]').addEventListener('input', updateCounter);
    q('[name="template"]').addEventListener('change', event => {
        if (templates[event.target.value]) {
            q('[name="contentText"]').value = templates[event.target.value];
            updateCounter();
        }
    });
    q('[data-nb-print-report]').addEventListener('click', () => {
        if (!notices.length) return toast('No notices available.');
        const rows = notices.map(notice => `<tr><td>${escape(notice.noticeId)}</td><td>${escape(notice.title)}</td><td>${escape(notice.category)}</td><td>${escape(notice.audience)}</td><td>${escape(notice.priority)}</td><td>${formatDate(notice.publishDate)}</td><td>${formatDate(notice.expiryDate)}</td><td>${escape(notice.status)}</td></tr>`).join('');
        printDocument('Notice Board Register', `<header class="head"><div><h1>Notice Board Register</h1><p>Communication Department</p></div><div>Total Notices: <strong>${notices.length}</strong></div></header><table><thead><tr><th>Notice ID</th><th>Title</th><th>Category</th><th>Audience</th><th>Priority</th><th>Publish Date</th><th>Expiry</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table><div class="signatures"><span>Prepared By</span><span>Checked By</span><span>Communication Manager</span></div>`);
    });
    q('[data-nb-form]').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const notice = Object.fromEntries(new FormData(form).entries());
        notice.noticeId = notice.noticeId.trim();
        notice.title = notice.title.trim();
        if (notices.some(item => item.noticeId.toLowerCase() === notice.noticeId.toLowerCase() && item.noticeId !== editingId)) return toast('Notice ID already exists.');
        const existing = notices.find(item => item.noticeId === editingId);
        if (existing) notices = notices.map(item => item.noticeId === editingId ? notice : item);
        else notices.unshift(notice);
        save();
        closeForm();
        render();
        toast(existing ? 'Notice updated successfully.' : 'Notice created successfully.');
    });
    q('[data-nb-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-nb-action]');
        if (!button) return;
        const notice = notices.find(item => item.noticeId === button.dataset.id);
        if (!notice) return;
        if (button.dataset.nbAction === 'view') {
            viewingId = notice.noticeId;
            q('[data-nb-view-content]').innerHTML = detailContent(notice);
            q('[data-nb-view-overlay]').classList.add('is-open');
        } else if (button.dataset.nbAction === 'edit') {
            openForm(notice);
        } else if (button.dataset.nbAction === 'duplicate') {
            duplicateNotice(notice);
        } else if (button.dataset.nbAction === 'print') {
            printNotice(notice);
        } else if (button.dataset.nbAction === 'delete' && confirm(`Delete "${notice.title}"?`)) {
            notices = notices.filter(item => item.noticeId !== notice.noticeId);
            save();
            render();
            toast('Notice deleted successfully.');
        }
    });
    q('[data-nb-view-content]').addEventListener('click', event => {
        const publishButton = event.target.closest('[data-nb-publish]');
        const editButton = event.target.closest('[data-nb-edit-current]');
        const duplicateButton = event.target.closest('[data-nb-duplicate-current]');
        const notice = notices.find(item => item.noticeId === (publishButton?.dataset.nbPublish || editButton?.dataset.nbEditCurrent || duplicateButton?.dataset.nbDuplicateCurrent));
        if (!notice) return;
        if (publishButton) publishNotice(notice);
        if (editButton) { closeView(); openForm(notice); }
        if (duplicateButton) duplicateNotice(notice);
    });
    q('[data-nb-close-form]').addEventListener('click', closeForm);
    q('[data-nb-cancel]').addEventListener('click', closeForm);
    section.querySelectorAll('[data-nb-close-view]').forEach(button => button.addEventListener('click', closeView));
    q('[data-nb-print-current]').addEventListener('click', () => {
        const notice = notices.find(item => item.noticeId === viewingId);
        if (notice) printNotice(notice);
    });
    section.querySelectorAll('.nb-overlay').forEach(overlay => overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('is-open'); }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            q('[data-nb-form-overlay]').classList.remove('is-open');
            closeView();
        }
    });
    render();
    return section;
}