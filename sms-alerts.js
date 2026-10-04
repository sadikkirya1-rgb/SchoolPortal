function createSmsAlertsModule() {
    const section = document.createElement('section');
    section.className = 'module sms-alerts-module hidden';
    section.id = 'smsAlertsModule';
    section.innerHTML = `
        <header class="sms-header"><div><h2>SMS Alerts</h2><p>Communication Department · Create, schedule, monitor and manage SMS alerts</p></div><button class="sms-button sms-primary" type="button" data-sms-new><i class="fas fa-plus"></i> Create SMS Alert</button></header>
        <section class="sms-stats" aria-label="SMS alert summary"><article class="sms-stat"><div><span>Total Alerts</span><strong data-sms-stat="total">0</strong></div><i class="fas fa-envelope"></i></article><article class="sms-stat"><div><span>Sent</span><strong data-sms-stat="sent">0</strong></div><i class="fas fa-circle-check"></i></article><article class="sms-stat"><div><span>Scheduled</span><strong data-sms-stat="scheduled">0</strong></div><i class="fas fa-clock"></i></article><article class="sms-stat"><div><span>Failed</span><strong data-sms-stat="failed">0</strong></div><i class="fas fa-triangle-exclamation"></i></article><article class="sms-stat"><div><span>SMS Delivered</span><strong data-sms-stat="delivered">0</strong></div><i class="fas fa-tower-broadcast"></i></article><article class="sms-stat"><div><span>Credits Used</span><strong data-sms-stat="credits">0</strong></div><i class="fas fa-coins"></i></article></section>
        <section class="sms-content" aria-label="SMS alert campaigns"><div class="sms-toolbar"><label class="sms-search"><i class="fas fa-search" aria-hidden="true"></i><span class="sms-sr-only">Search SMS alerts</span><input type="search" data-sms-search placeholder="Search alert, recipient, message, campaign..."></label><select class="sms-filter" data-sms-status aria-label="Filter by status"><option value="">All Statuses</option><option>Sent</option><option>Scheduled</option><option>Draft</option><option>Failed</option><option>Cancelled</option><option>Pending</option></select><select class="sms-filter" data-sms-priority aria-label="Filter by priority"><option value="">All Priorities</option><option>Urgent</option><option>High</option><option>Normal</option><option>Low</option></select><select class="sms-filter" data-sms-type aria-label="Filter by type"><option value="">All Types</option><option>Bulk</option><option>Individual</option></select><button class="sms-button sms-light" type="button" data-sms-print-report><i class="fas fa-print"></i> Print / PDF</button></div>
            <div class="sms-table-wrap"><table class="sms-table"><thead><tr><th>Alert</th><th>Campaign / Subject</th><th>Recipients</th><th>Message Preview</th><th>Type</th><th>Priority</th><th>Scheduled / Sent</th><th>Delivery</th><th>Status</th><th>Actions</th></tr></thead><tbody data-sms-rows></tbody></table></div></section>
        <div class="sms-overlay" data-sms-form-overlay><section class="sms-modal" role="dialog" aria-modal="true" aria-labelledby="sms-form-title"><header class="sms-modal-head"><h3 id="sms-form-title">Create SMS Alert</h3><button class="sms-close" type="button" data-sms-close-form aria-label="Close">&times;</button></header>
            <form class="sms-form" data-sms-form>
                <h4 class="sms-section-title">Alert Information</h4><div class="sms-grid">
                    <label>Alert ID<input name="alertId" required placeholder="SMS-2026-001"></label><label>Campaign / Subject<input name="campaign" required placeholder="Parent Meeting Reminder"></label><label>Alert Type<select name="alertType"><option>Bulk</option><option>Individual</option></select></label>
                    <label>Priority<select name="priority"><option>Normal</option><option>Urgent</option><option>High</option><option>Low</option></select></label><label>Category<select name="category"><option>School Announcement</option><option>Emergency Alert</option><option>Attendance</option><option>Fee Reminder</option><option>Event Reminder</option><option>Parent Communication</option><option>General Notice</option><option>Other</option></select></label><label>Status<select name="status"><option>Draft</option><option>Scheduled</option><option>Pending</option><option>Sent</option><option>Failed</option><option>Cancelled</option></select></label>
                </div>
                <h4 class="sms-section-title">Recipients</h4><div class="sms-grid">
                    <label>Recipient Group<select name="recipientGroup"><option>All Parents</option><option>Parents - Grade 1</option><option>Parents - Grade 2</option><option>Parents - Grade 3</option><option>Parents - Grade 4</option><option>Parents - Grade 5</option><option>Parents - Grade 6</option><option>Parents - Grade 7</option><option>Parents - Grade 8</option><option>Parents - Grade 9</option><option>Parents - Grade 10</option><option>Staff</option><option>Custom Recipients</option></select></label><label>Total Recipients<input name="recipients" type="number" min="1" value="100" required></label><label>Sender / Department<input name="sender" value="Communication Department" placeholder="Sender name"></label>
                    <label>Reply Number<input name="replyNumber" type="tel" placeholder="+971 50 XXX XXXX"></label><label class="sms-full">Custom Recipient Numbers<textarea name="customRecipients" placeholder="Enter mobile numbers separated by commas..."></textarea></label>
                </div>
                <div class="sms-section-heading"><h4 class="sms-section-title">SMS Content</h4><span class="sms-counter">Characters: <b data-sms-chars>0</b> · SMS Parts: <b data-sms-parts>0</b></span></div><div class="sms-grid">
                    <label class="sms-full">Message<textarea name="message" maxlength="1000" required placeholder="Type your SMS message here..."></textarea></label><label>Template<select name="template"><option value="">Select Template</option><option value="meeting">Parent Meeting Reminder</option><option value="attendance">Attendance Alert</option><option value="fee">Fee Payment Reminder</option><option value="event">Event Reminder</option><option value="emergency">Emergency Alert</option></select></label><label>Language<select name="language"><option>English</option><option>Arabic</option><option>English + Arabic</option><option>Other</option></select></label><label>Character Encoding<select name="encoding"><option>GSM-7</option><option>Unicode</option></select></label>
                </div>
                <h4 class="sms-section-title">Scheduling</h4><div class="sms-grid">
                    <label>Send Mode<select name="sendMode"><option>Send Immediately</option><option>Schedule</option></select></label><label>Scheduled Date<input name="scheduledDate" type="date"></label><label>Scheduled Time<input name="scheduledTime" type="time"></label><label>Timezone<select name="timezone"><option>Asia/Dubai (GMT+4)</option><option>Asia/Riyadh (GMT+3)</option><option>Asia/Kolkata (GMT+5:30)</option><option>UTC</option></select></label><label>Retry Failed Messages<select name="retry"><option>Yes</option><option>No</option></select></label><label>Delivery Report<select name="deliveryReport"><option>Enabled</option><option>Disabled</option></select></label>
                </div>
                <h4 class="sms-section-title">Notes</h4><div class="sms-grid"><label class="sms-full">Internal Notes<textarea name="notes" placeholder="Internal communication department notes..."></textarea></label></div>
                <footer class="sms-modal-actions"><button class="sms-button sms-light" type="button" data-sms-cancel>Cancel</button><button class="sms-button sms-primary" type="submit">Save SMS Alert</button></footer>
            </form>
        </section></div>
        <div class="sms-overlay" data-sms-view-overlay><section class="sms-modal" role="dialog" aria-modal="true" aria-labelledby="sms-view-title"><header class="sms-modal-head"><h3 id="sms-view-title">SMS Alert Details</h3><button class="sms-close" type="button" data-sms-close-view aria-label="Close">&times;</button></header><div class="sms-view" data-sms-view-content></div><footer class="sms-modal-actions"><button class="sms-button sms-light" type="button" data-sms-close-view>Close</button><button class="sms-button sms-primary" type="button" data-sms-print-current><i class="fas fa-print"></i> Print / PDF</button></footer></section></div>
        <div class="sms-toast" role="status" aria-live="polite" data-sms-toast></div>`;

    const storageKey = 'schoolSmsAlerts';
    const seed = [
        { alertId: 'SMS-2026-001', campaign: 'Parent Meeting Reminder', alertType: 'Bulk', priority: 'Normal', category: 'Event Reminder', status: 'Sent', recipientGroup: 'All Parents', recipients: 850, sender: 'Communication Department', replyNumber: '+971 50 123 4567', customRecipients: '', message: 'Dear Parent, this is a reminder that the Parent-Teacher Meeting will be held on 10 October 2026 from 3:00 PM to 6:00 PM. We look forward to meeting you.', template: 'Parent Meeting Reminder', language: 'English', encoding: 'GSM-7', sendMode: 'Send Immediately', scheduledDate: '2026-10-01', scheduledTime: '09:00', timezone: 'Asia/Dubai (GMT+4)', retry: 'Yes', deliveryReport: 'Enabled', delivered: 842, failed: 8, credits: 850, notes: 'Sent to all active parents.' },
        { alertId: 'SMS-2026-002', campaign: 'School Holiday Announcement', alertType: 'Bulk', priority: 'Normal', category: 'School Announcement', status: 'Scheduled', recipientGroup: 'All Parents', recipients: 920, sender: 'Communication Department', replyNumber: '+971 50 123 4567', customRecipients: '', message: 'Dear Parents, please be informed that the school will remain closed on 15 October 2026 due to the scheduled public holiday. Classes will resume on the next working day.', template: 'School Holiday', language: 'English + Arabic', encoding: 'Unicode', sendMode: 'Schedule', scheduledDate: '2026-10-12', scheduledTime: '08:00', timezone: 'Asia/Dubai (GMT+4)', retry: 'Yes', deliveryReport: 'Enabled', delivered: 0, failed: 0, credits: 0, notes: 'Scheduled announcement.' },
        { alertId: 'SMS-2026-003', campaign: 'Attendance Alert - Grade 8', alertType: 'Bulk', priority: 'High', category: 'Attendance', status: 'Sent', recipientGroup: 'Parents - Grade 8', recipients: 115, sender: 'Communication Department', replyNumber: '+971 50 123 4567', customRecipients: '', message: 'Dear Parent, your child was marked absent from school today. If this absence is authorized, please contact the school administration.', template: 'Attendance Alert', language: 'English', encoding: 'GSM-7', sendMode: 'Send Immediately', scheduledDate: '2026-10-02', scheduledTime: '10:30', timezone: 'Asia/Dubai (GMT+4)', retry: 'Yes', deliveryReport: 'Enabled', delivered: 113, failed: 2, credits: 115, notes: 'Attendance notification for Grade 8.' },
        { alertId: 'SMS-2026-004', campaign: 'Fee Payment Reminder', alertType: 'Bulk', priority: 'High', category: 'Fee Reminder', status: 'Pending', recipientGroup: 'All Parents', recipients: 340, sender: 'Finance & Communication', replyNumber: '+971 50 123 4567', customRecipients: '', message: 'Dear Parent, this is a friendly reminder that your outstanding school fee payment is due. Please contact the accounts department for assistance.', template: 'Fee Payment Reminder', language: 'English', encoding: 'GSM-7', sendMode: 'Schedule', scheduledDate: '2026-10-05', scheduledTime: '11:00', timezone: 'Asia/Dubai (GMT+4)', retry: 'Yes', deliveryReport: 'Enabled', delivered: 0, failed: 0, credits: 0, notes: 'Awaiting final recipient verification.' },
        { alertId: 'SMS-2026-005', campaign: 'Emergency Safety Alert', alertType: 'Bulk', priority: 'Urgent', category: 'Emergency Alert', status: 'Sent', recipientGroup: 'All Parents', recipients: 950, sender: 'School Emergency', replyNumber: '+971 50 123 4567', customRecipients: '', message: "URGENT: Dear Parents, please note that today's school dismissal has been changed. Kindly follow the instructions provided by the school administration.", template: 'Emergency Alert', language: 'English', encoding: 'GSM-7', sendMode: 'Send Immediately', scheduledDate: '2026-09-30', scheduledTime: '12:15', timezone: 'Asia/Dubai (GMT+4)', retry: 'Yes', deliveryReport: 'Enabled', delivered: 947, failed: 3, credits: 950, notes: 'Emergency communication successfully completed.' },
        { alertId: 'SMS-2026-006', campaign: 'Sports Day Reminder', alertType: 'Bulk', priority: 'Normal', category: 'Event Reminder', status: 'Draft', recipientGroup: 'Parents - Grade 5', recipients: 90, sender: 'Communication Department', replyNumber: '+971 50 123 4567', customRecipients: '', message: 'Dear Parents, Sports Day will be held next week. Please ensure your child arrives at school wearing the required sports uniform and brings a water bottle.', template: 'Event Reminder', language: 'English', encoding: 'GSM-7', sendMode: 'Schedule', scheduledDate: '2026-10-08', scheduledTime: '08:30', timezone: 'Asia/Dubai (GMT+4)', retry: 'Yes', deliveryReport: 'Enabled', delivered: 0, failed: 0, credits: 0, notes: 'Draft pending approval.' }
    ];
    let alerts;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        alerts = Array.isArray(stored) ? stored : seed;
    } catch (error) {
        alerts = seed;
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
    const smsParts = (message, encoding) => {
        if (!message) return 0;
        if (encoding === 'Unicode') {
            const units = [...message].reduce((count, char) => count + char.length, 0);
            return units <= 70 ? 1 : Math.ceil(units / 67);
        }
        const extension = new Set(['^', '{', '}', '\\', '[', ']', '~', '|', '€', '\f']);
        const units = [...message].reduce((count, char) => count + (extension.has(char) ? 2 : 1), 0);
        return units <= 160 ? 1 : Math.ceil(units / 153);
    };
    const save = () => localStorage.setItem(storageKey, JSON.stringify(alerts));
    const toast = message => {
        const element = q('[data-sms-toast]');
        element.textContent = message;
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 2400);
    };
    const nextId = () => {
        const max = Math.max(0, ...alerts.map(alert => Number(alert.alertId.match(/^SMS-\d{4}-(\d+)$/)?.[1]) || 0));
        return `SMS-${new Date().getFullYear()}-${String(max + 1).padStart(3, '0')}`;
    };
    const updateCounter = () => {
        const message = q('[name="message"]').value;
        const encoding = q('[name="encoding"]').value;
        q('[data-sms-chars]').textContent = [...message].length;
        q('[data-sms-parts]').textContent = smsParts(message, encoding);
    };
    const updateStats = () => {
        q('[data-sms-stat="total"]').textContent = alerts.length;
        q('[data-sms-stat="sent"]').textContent = alerts.filter(alert => alert.status === 'Sent').length;
        q('[data-sms-stat="scheduled"]').textContent = alerts.filter(alert => alert.status === 'Scheduled').length;
        q('[data-sms-stat="failed"]').textContent = alerts.filter(alert => alert.status === 'Failed').length;
        q('[data-sms-stat="delivered"]').textContent = alerts.reduce((sum, alert) => sum + Number(alert.delivered || 0), 0).toLocaleString();
        q('[data-sms-stat="credits"]').textContent = alerts.reduce((sum, alert) => sum + Number(alert.credits || 0), 0).toLocaleString();
    };
    const render = () => {
        const search = q('[data-sms-search]').value.trim().toLowerCase();
        const status = q('[data-sms-status]').value;
        const priority = q('[data-sms-priority]').value;
        const type = q('[data-sms-type]').value;
        const filtered = alerts.filter(alert => (!status || alert.status === status) && (!priority || alert.priority === priority) && (!type || alert.alertType === type) && (!search || JSON.stringify(alert).toLowerCase().includes(search)));
        q('[data-sms-rows]').innerHTML = filtered.length ? filtered.map(alert => {
            const delivery = Number(alert.recipients) > 0 ? Math.round(Number(alert.delivered || 0) / Number(alert.recipients) * 100) : 0;
            return `<tr><td><strong class="sms-code">${escape(alert.alertId)}</strong><small class="sms-small">${escape(alert.category)}</small></td><td><b>${escape(alert.campaign)}</b><small class="sms-small">${escape(alert.sender)}</small></td><td><b>${Number(alert.recipients).toLocaleString()}</b><small class="sms-small">${escape(alert.recipientGroup)}</small></td><td><div class="sms-message-preview">${escape(alert.message)}</div></td><td><span class="sms-badge ${escape(statusClass(alert.alertType))}">${escape(alert.alertType)}</span></td><td><span class="sms-badge ${escape(statusClass(alert.priority))}">${escape(alert.priority)}</span></td><td><b>${formatDate(alert.scheduledDate)}</b><small class="sms-small">${escape(alert.scheduledTime || '—')}</small></td><td><b>${delivery}%</b><div class="sms-delivery-bar"><span style="width:${Math.max(0, Math.min(100, delivery))}%"></span></div><small class="sms-small">${Number(alert.delivered || 0).toLocaleString()} / ${Number(alert.recipients).toLocaleString()}</small></td><td><span class="sms-badge ${escape(statusClass(alert.status))}">${escape(alert.status)}</span></td><td><div class="sms-actions"><button class="sms-action" type="button" title="View" aria-label="View ${escape(alert.alertId)}" data-sms-action="view" data-id="${escape(alert.alertId)}"><i class="fas fa-eye"></i></button><button class="sms-action" type="button" title="Edit" aria-label="Edit ${escape(alert.alertId)}" data-sms-action="edit" data-id="${escape(alert.alertId)}"><i class="fas fa-pen"></i></button><button class="sms-action" type="button" title="Duplicate" aria-label="Duplicate ${escape(alert.alertId)}" data-sms-action="duplicate" data-id="${escape(alert.alertId)}"><i class="fas fa-copy"></i></button><button class="sms-action" type="button" title="Print" aria-label="Print ${escape(alert.alertId)}" data-sms-action="print" data-id="${escape(alert.alertId)}"><i class="fas fa-print"></i></button><button class="sms-action sms-delete" type="button" title="Delete" aria-label="Delete ${escape(alert.alertId)}" data-sms-action="delete" data-id="${escape(alert.alertId)}"><i class="fas fa-trash"></i></button></div></td></tr>`;
        }).join('') : '<tr><td colspan="10"><div class="sms-empty">No SMS alerts found.</div></td></tr>';
        updateStats();
    };
    const closeForm = () => q('[data-sms-form-overlay]').classList.remove('is-open');
    const closeView = () => q('[data-sms-view-overlay]').classList.remove('is-open');
    const openForm = alert => {
        const form = q('[data-sms-form]');
        form.reset();
        editingId = alert?.alertId ?? null;
        q('#sms-form-title').textContent = alert ? 'Edit SMS Alert' : 'Create SMS Alert';
        form.elements.alertId.value = alert?.alertId || nextId();
        if (alert) {
            ['campaign', 'alertType', 'priority', 'category', 'status', 'recipientGroup', 'recipients', 'sender', 'replyNumber', 'customRecipients', 'message', 'template', 'language', 'encoding', 'sendMode', 'scheduledDate', 'scheduledTime', 'timezone', 'retry', 'deliveryReport', 'notes'].forEach(field => { form.elements[field].value = alert[field] ?? ''; });
        } else {
            form.elements.sender.value = 'Communication Department';
        }
        updateCounter();
        q('[data-sms-form-overlay]').classList.add('is-open');
        form.elements.campaign.focus();
    };
    const templates = {
        meeting: 'Dear Parent, this is a reminder that the Parent-Teacher Meeting will be held on [DATE] from [TIME]. We look forward to meeting you.',
        attendance: 'Dear Parent, your child was marked absent from school today. If this absence is authorized, please contact the school administration.',
        fee: 'Dear Parent, this is a friendly reminder that your outstanding school fee payment is due. Please contact the accounts department for assistance.',
        event: 'Dear Parents, this is a reminder about the upcoming school event. Please check the school communication for complete details.',
        emergency: "URGENT: Dear Parents, please note an important change regarding today's school arrangements. Kindly follow the instructions provided by the school administration."
    };
    const detailContent = alert => {
        const delivery = Number(alert.recipients) > 0 ? Math.round(Number(alert.delivered || 0) / Number(alert.recipients) * 100) : 0;
        const canSend = ['Draft', 'Pending', 'Scheduled'].includes(alert.status);
        return `<header class="sms-detail-header"><div class="sms-profile"><span class="sms-avatar"><i class="fas fa-envelope"></i></span><div><h2>${escape(alert.campaign)}</h2><p>${escape(alert.alertId)} · ${escape(alert.category)} · ${escape(alert.alertType)}</p></div></div><span class="sms-badge ${escape(statusClass(alert.status))}">${escape(alert.status)}</span></header>
            <div class="sms-summary-grid">${[['Alert ID', alert.alertId], ['Recipients', Number(alert.recipients).toLocaleString()], ['Delivered', Number(alert.delivered || 0).toLocaleString()], ['Delivery Rate', `${delivery}%`], ['Priority', alert.priority], ['Channel', 'SMS'], ['Scheduled / Sent', formatDate(alert.scheduledDate)], ['SMS Credits', Number(alert.credits || 0).toLocaleString()]].map(([label, value]) => `<div class="sms-summary-box"><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`).join('')}</div>
            <h4 class="sms-section-title">Alert Information</h4><table class="sms-info-table"><tbody>${[['Campaign / Subject', alert.campaign], ['Alert Type', alert.alertType], ['Category', alert.category], ['Priority', alert.priority], ['Recipient Group', alert.recipientGroup], ['Total Recipients', Number(alert.recipients).toLocaleString()], ['Sender', alert.sender], ['Reply Number', alert.replyNumber], ['Language', alert.language], ['Encoding', alert.encoding], ['Send Mode', alert.sendMode], ['Timezone', alert.timezone], ['Retry Failed Messages', alert.retry], ['Delivery Report', alert.deliveryReport], ['Delivered', Number(alert.delivered || 0).toLocaleString()], ['Failed', Number(alert.failed || 0).toLocaleString()], ['SMS Credits Used', Number(alert.credits || 0).toLocaleString()]].map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value || '—')}</td></tr>`).join('')}</tbody></table>
            <div class="sms-message-box"><h4>SMS Message</h4><p>${escape(alert.message)}</p></div><div class="sms-progress"><div><b>Delivery Progress</b><strong>${delivery}%</strong></div><div class="sms-delivery-bar"><span style="width:${Math.max(0, Math.min(100, delivery))}%"></span></div><small>${Number(alert.delivered || 0).toLocaleString()} delivered · ${Number(alert.failed || 0).toLocaleString()} failed</small></div><div class="sms-notes"><strong>Internal Notes</strong><p>${escape(alert.notes || 'No internal notes.')}</p></div>${canSend ? `<div class="sms-quick-actions"><button class="sms-button sms-primary" type="button" data-sms-send-now="${escape(alert.alertId)}"><i class="fas fa-paper-plane"></i> Send Now</button><button class="sms-button sms-light" type="button" data-sms-edit-current="${escape(alert.alertId)}"><i class="fas fa-pen"></i> Edit</button><button class="sms-button sms-light" type="button" data-sms-duplicate-current="${escape(alert.alertId)}"><i class="fas fa-copy"></i> Duplicate</button></div>` : ''}`;
    };
    const printDocument = (title, html) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast('Allow pop-ups to print SMS alerts.');
        printWindow.document.write(`<!doctype html><html><head><title>${escape(title)}</title><meta charset="utf-8"><style>body{font:13px Arial,sans-serif;color:#172033;padding:32px}h1{font-size:23px;margin:0}p{color:#475569}.head{display:flex;justify-content:space-between;border-bottom:2px solid #172033;padding-bottom:14px;margin-bottom:20px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:16px 0;font-size:12px}.meta strong{display:block;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:11px}th{background:#f1f5f9}.message{margin-top:20px;border:1px solid #cbd5e1;padding:15px;white-space:pre-wrap;font-size:12px;line-height:1.6}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:35px;margin-top:65px}.signatures span{border-top:1px solid #475569;padding-top:8px}@media print{body{padding:0}}</style></head><body>${html}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    const printAlert = alert => {
        const fields = [['Campaign', alert.campaign], ['Category', alert.category], ['Alert Type', alert.alertType], ['Priority', alert.priority], ['Recipient Group', alert.recipientGroup], ['Recipients', Number(alert.recipients).toLocaleString()], ['Sender', alert.sender], ['Reply Number', alert.replyNumber], ['Scheduled Date', formatDate(alert.scheduledDate)], ['Scheduled Time', alert.scheduledTime], ['Language', alert.language], ['Encoding', alert.encoding], ['Timezone', alert.timezone], ['Status', alert.status], ['Delivered', Number(alert.delivered || 0).toLocaleString()], ['Failed', Number(alert.failed || 0).toLocaleString()], ['SMS Credits', Number(alert.credits || 0).toLocaleString()]];
        printDocument(alert.alertId, `<header class="head"><div><h1>SMS Alert Record</h1><p>Communication Department</p></div><div><strong>${escape(alert.alertId)}</strong><br>Status: ${escape(alert.status)}</div></header><div class="meta">${fields.map(([label, value]) => `<div><strong>${escape(label)}</strong>${escape(value || '—')}</div>`).join('')}</div><div class="message"><strong>SMS Message</strong><br><br>${escape(alert.message)}</div><p><strong>Internal Notes:</strong> ${escape(alert.notes || '—')}</p><div class="signatures"><span>Prepared By</span><span>Checked By</span><span>Communication Manager</span></div>`);
    };
    const duplicateAlert = alert => {
        const copy = { ...alert, alertId: nextId(), campaign: `${alert.campaign} - Copy`, status: 'Draft', delivered: 0, failed: 0, credits: 0 };
        alerts.unshift(copy);
        save();
        render();
        toast('SMS alert duplicated as a draft.');
    };
    const sendNow = alert => {
        if (!['Draft', 'Pending', 'Scheduled'].includes(alert.status)) return;
        if (!confirm(`Send SMS alert "${alert.campaign}" to ${Number(alert.recipients).toLocaleString()} recipients?`)) return;
        alert.status = 'Sent';
        alert.delivered = Number(alert.recipients) || 0;
        alert.failed = 0;
        alert.credits = alert.delivered * smsParts(alert.message, alert.encoding);
        save();
        render();
        if (viewingId === alert.alertId) q('[data-sms-view-content]').innerHTML = detailContent(alert);
        toast('SMS alert marked as sent successfully.');
    };

    q('[data-sms-new]').addEventListener('click', () => openForm());
    q('[data-sms-search]').addEventListener('input', render);
    q('[data-sms-status]').addEventListener('change', render);
    q('[data-sms-priority]').addEventListener('change', render);
    q('[data-sms-type]').addEventListener('change', render);
    q('[name="message"]').addEventListener('input', updateCounter);
    q('[name="encoding"]').addEventListener('change', updateCounter);
    q('[name="template"]').addEventListener('change', event => {
        if (templates[event.target.value]) {
            q('[name="message"]').value = templates[event.target.value];
            updateCounter();
        }
    });
    q('[data-sms-print-report]').addEventListener('click', () => {
        if (!alerts.length) return toast('No SMS alerts available.');
        const rows = alerts.map(alert => `<tr><td>${escape(alert.alertId)}</td><td>${escape(alert.campaign)}</td><td>${Number(alert.recipients).toLocaleString()}</td><td>${escape(alert.alertType)}</td><td>${escape(alert.priority)}</td><td>${formatDate(alert.scheduledDate)} ${escape(alert.scheduledTime || '')}</td><td>${Number(alert.delivered || 0).toLocaleString()}</td><td>${Number(alert.failed || 0).toLocaleString()}</td><td>${escape(alert.status)}</td></tr>`).join('');
        printDocument('SMS Alert Register', `<header class="head"><div><h1>SMS Alert Register</h1><p>Communication Department</p></div><div>Total Alerts: <strong>${alerts.length}</strong></div></header><table><thead><tr><th>Alert ID</th><th>Campaign</th><th>Recipients</th><th>Type</th><th>Priority</th><th>Scheduled</th><th>Delivered</th><th>Failed</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table><div class="signatures"><span>Prepared By</span><span>Checked By</span><span>Communication Manager</span></div>`);
    });
    q('[data-sms-form]').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const alert = Object.fromEntries(new FormData(form).entries());
        alert.alertId = alert.alertId.trim();
        alert.recipients = Math.max(0, Number(alert.recipients) || 0);
        if (alert.recipients < 1) return toast('Recipient count must be at least one.');
        if (alerts.some(item => item.alertId.toLowerCase() === alert.alertId.toLowerCase() && item.alertId !== editingId)) return toast('Alert ID already exists.');
        const existing = alerts.find(item => item.alertId === editingId);
        alert.delivered = existing ? Number(existing.delivered || 0) : 0;
        alert.failed = existing ? Number(existing.failed || 0) : 0;
        alert.credits = existing ? Number(existing.credits || 0) : 0;
        if (existing) alerts = alerts.map(item => item.alertId === editingId ? alert : item);
        else alerts.unshift(alert);
        save();
        closeForm();
        render();
        toast(existing ? 'SMS alert updated successfully.' : 'SMS alert created successfully.');
    });
    q('[data-sms-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-sms-action]');
        if (!button) return;
        const alert = alerts.find(item => item.alertId === button.dataset.id);
        if (!alert) return;
        if (button.dataset.smsAction === 'view') {
            viewingId = alert.alertId;
            q('[data-sms-view-content]').innerHTML = detailContent(alert);
            q('[data-sms-view-overlay]').classList.add('is-open');
        } else if (button.dataset.smsAction === 'edit') {
            openForm(alert);
        } else if (button.dataset.smsAction === 'duplicate') {
            duplicateAlert(alert);
        } else if (button.dataset.smsAction === 'print') {
            printAlert(alert);
        } else if (button.dataset.smsAction === 'delete' && confirm(`Delete "${alert.campaign}"?`)) {
            alerts = alerts.filter(item => item.alertId !== alert.alertId);
            save();
            render();
            toast('SMS alert deleted.');
        }
    });
    q('[data-sms-view-content]').addEventListener('click', event => {
        const sendButton = event.target.closest('[data-sms-send-now]');
        const editButton = event.target.closest('[data-sms-edit-current]');
        const duplicateButton = event.target.closest('[data-sms-duplicate-current]');
        const alert = alerts.find(item => item.alertId === (sendButton?.dataset.smsSendNow || editButton?.dataset.smsEditCurrent || duplicateButton?.dataset.smsDuplicateCurrent));
        if (!alert) return;
        if (sendButton) sendNow(alert);
        if (editButton) { closeView(); openForm(alert); }
        if (duplicateButton) duplicateAlert(alert);
    });
    q('[data-sms-close-form]').addEventListener('click', closeForm);
    q('[data-sms-cancel]').addEventListener('click', closeForm);
    section.querySelectorAll('[data-sms-close-view]').forEach(button => button.addEventListener('click', closeView));
    q('[data-sms-print-current]').addEventListener('click', () => {
        const alert = alerts.find(item => item.alertId === viewingId);
        if (alert) printAlert(alert);
    });
    section.querySelectorAll('.sms-overlay').forEach(overlay => overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('is-open'); }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            q('[data-sms-form-overlay]').classList.remove('is-open');
            closeView();
        }
    });
    render();
    updateCounter();
    return section;
}