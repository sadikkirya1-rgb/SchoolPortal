function createVisitorLogsModule() {
    const section = document.createElement('section');
    section.className = 'module visitor-logs-module hidden';
    section.id = 'visitorLogsModule';
    section.innerHTML = `
        <header class="vl-header"><div><h2>Visitor Logs</h2><p>Manage visitor registrations, check-ins, check-outs, appointments and access records</p></div><button class="vl-button vl-primary" type="button" data-vl-new><i class="fas fa-plus"></i> Add Visitor</button></header>
        <section class="vl-stats" aria-label="Visitor log summary"><article class="vl-stat"><div><span>Total Visitors</span><strong data-vl-stat="total">0</strong></div><i class="fas fa-users"></i></article><article class="vl-stat"><div><span>Currently Inside</span><strong data-vl-stat="inside">0</strong></div><i class="fas fa-person-circle-check"></i></article><article class="vl-stat"><div><span>Expected Today</span><strong data-vl-stat="expected">0</strong></div><i class="fas fa-calendar-check"></i></article><article class="vl-stat"><div><span>Checked Out</span><strong data-vl-stat="checkedOut">0</strong></div><i class="fas fa-right-from-bracket"></i></article><article class="vl-stat"><div><span>Overdue</span><strong data-vl-stat="overdue">0</strong></div><i class="fas fa-triangle-exclamation"></i></article><article class="vl-stat"><div><span>Companies</span><strong data-vl-stat="companies">0</strong></div><i class="fas fa-building"></i></article></section>
        <section class="vl-content" aria-label="Visitor records"><div class="vl-toolbar"><label class="vl-search"><i class="fas fa-search" aria-hidden="true"></i><span class="vl-sr-only">Search visitor records</span><input type="search" data-vl-search placeholder="Search visitor, company, host, badge..."></label><select class="vl-filter" data-vl-status aria-label="Filter by status"><option value="">All Statuses</option><option>Expected</option><option>Checked In</option><option>Checked Out</option><option>Overdue</option><option>Cancelled</option></select><select class="vl-filter" data-vl-type aria-label="Filter by visitor type"><option value="">All Visitor Types</option><option>Client</option><option>Vendor</option><option>Contractor</option><option>Interview</option><option>Delivery</option><option>Employee</option></select><select class="vl-filter" data-vl-location aria-label="Filter by location"><option value="">All Locations</option><option>Head Office</option><option>Warehouse</option><option>Branch Office</option><option>Meeting Room</option><option>Reception</option></select><button class="vl-button vl-light" type="button" data-vl-print-report><i class="fas fa-print"></i> Print / PDF</button></div>
            <div class="vl-table-wrap"><table class="vl-table"><thead><tr><th>Visitor</th><th>Company</th><th>Visit Type</th><th>Host / Department</th><th>Visit Date</th><th>Check In</th><th>Check Out</th><th>Badge</th><th>Status</th><th>Actions</th></tr></thead><tbody data-vl-rows></tbody></table></div></section>
        <div class="vl-overlay" data-vl-form-overlay><section class="vl-modal" role="dialog" aria-modal="true" aria-labelledby="vl-form-title"><header class="vl-modal-head"><h3 id="vl-form-title">Add Visitor</h3><button class="vl-close" type="button" data-vl-close-form aria-label="Close">&times;</button></header>
            <form class="vl-form" data-vl-form>
                <h4 class="vl-section-title">Visitor Information</h4><div class="vl-grid">
                    <label>Visitor ID<input name="visitorId" required placeholder="VIS-2026-001"></label><label>Full Name<input name="visitorName" required placeholder="Visitor full name"></label><label>Visitor Type<select name="visitorType"><option>Client</option><option>Vendor</option><option>Contractor</option><option>Interview</option><option>Delivery</option><option>Employee</option></select></label>
                    <label>Company / Organization<input name="company" required placeholder="Company name"></label><label>Job Title<input name="jobTitle" placeholder="Position / designation"></label><label>Phone Number<input name="phone" type="tel" placeholder="+971 XX XXX XXXX"></label>
                    <label>Email Address<input name="email" type="email" placeholder="visitor@example.com"></label><label>Identification Type<select name="idType"><option>Emirates ID</option><option>Passport</option><option>Driving License</option><option>Company ID</option><option>Other</option></select></label><label>ID / Document Number<input name="idNumber" placeholder="Identification number"></label>
                </div>
                <h4 class="vl-section-title">Visit Details</h4><div class="vl-grid">
                    <label>Visit Date<input name="visitDate" type="date" required></label><label>Expected Arrival Time<input name="arrivalTime" type="time" required></label><label>Expected Departure Time<input name="departureTime" type="time"></label>
                    <label>Check-In Time<input name="checkIn" type="time"></label><label>Check-Out Time<input name="checkOut" type="time"></label><label>Status<select name="status"><option>Expected</option><option>Checked In</option><option>Checked Out</option><option>Overdue</option><option>Cancelled</option></select></label>
                    <label>Location<select name="location"><option>Head Office</option><option>Warehouse</option><option>Branch Office</option><option>Meeting Room</option><option>Reception</option></select></label><label>Purpose of Visit<input name="purpose" required placeholder="Meeting, delivery, interview..."></label><label>Number of Guests<input name="guests" type="number" min="1" value="1"></label>
                </div>
                <h4 class="vl-section-title">Host &amp; Access</h4><div class="vl-grid">
                    <label>Host Name<input name="host" required placeholder="Employee / host name"></label><label>Host Department<input name="department" placeholder="Department"></label><label>Host Contact<input name="hostContact" type="tel" placeholder="Host phone number"></label>
                    <label>Badge Number<input name="badge" placeholder="V-001"></label><label>Access Level<select name="accessLevel"><option>General</option><option>Restricted</option><option>Warehouse</option><option>Office Only</option><option>Meeting Area</option></select></label><label>Parking Required<select name="parking"><option>No</option><option>Yes</option></select></label>
                    <label>Vehicle Plate No.<input name="vehicle" placeholder="ABC 12345"></label><label>Security Officer<input name="securityOfficer" placeholder="Security staff"></label><label>Appointment Reference<input name="appointment" placeholder="Appointment / booking number"></label>
                </div>
                <h4 class="vl-section-title">Security &amp; Notes</h4><div class="vl-grid">
                    <label>Photo Captured<select name="photoCaptured"><option>Yes</option><option>No</option></select></label><label>ID Verified<select name="idVerified"><option>Yes</option><option>No</option><option>Pending</option></select></label><label>Escort Required<select name="escort"><option>No</option><option>Yes</option></select></label>
                    <label class="vl-full">Visit Notes<textarea name="notes" placeholder="Additional visitor information, security notes or instructions..."></textarea></label><label class="vl-full">Internal Remarks<textarea name="remarks" placeholder="Internal remarks..."></textarea></label>
                </div><footer class="vl-modal-actions"><button class="vl-button vl-light" type="button" data-vl-cancel>Cancel</button><button class="vl-button vl-primary" type="submit">Save Visitor</button></footer>
            </form>
        </section></div>
        <div class="vl-overlay" data-vl-view-overlay><section class="vl-modal" role="dialog" aria-modal="true" aria-labelledby="vl-view-title"><header class="vl-modal-head"><h3 id="vl-view-title">Visitor Details</h3><button class="vl-close" type="button" data-vl-close-view aria-label="Close">&times;</button></header><div class="vl-view" data-vl-view-content></div><footer class="vl-modal-actions"><button class="vl-button vl-light" type="button" data-vl-close-view>Close</button><button class="vl-button vl-primary" type="button" data-vl-print-current><i class="fas fa-print"></i> Print / PDF</button></footer></section></div>
        <div class="vl-toast" role="status" aria-live="polite" data-vl-toast></div>`;

    const storageKey = 'schoolVisitorLogs';
    const seed = [
        { visitorId: 'VIS-2026-001', visitorName: 'Ahmed Hassan', visitorType: 'Client', company: 'Al Noor Trading LLC', jobTitle: 'Operations Manager', phone: '+971 50 123 4567', email: 'ahmed@alnoortrading.ae', idType: 'Emirates ID', idNumber: '784-1988-XXXXXXX-X', visitDate: '2026-10-04', arrivalTime: '09:00', departureTime: '11:00', checkIn: '09:04', checkOut: '', status: 'Checked In', location: 'Head Office', purpose: 'Business Meeting', guests: 1, host: 'Mohammed Ali', department: 'Procurement', hostContact: '+971 50 555 2211', badge: 'V-001', accessLevel: 'General', parking: 'Yes', vehicle: 'DXB 45821', securityOfficer: 'Khalid', appointment: 'APT-2026-104', photoCaptured: 'Yes', idVerified: 'Yes', escort: 'No', notes: 'Meeting with Procurement Manager.', remarks: 'Regular client.' },
        { visitorId: 'VIS-2026-002', visitorName: 'Sarah Williams', visitorType: 'Vendor', company: 'Tech Solutions Middle East', jobTitle: 'Account Manager', phone: '+971 55 222 1133', email: 'sarah@techsolutions.ae', idType: 'Passport', idNumber: 'PXXXXXXX', visitDate: '2026-10-04', arrivalTime: '10:30', departureTime: '12:30', checkIn: '', checkOut: '', status: 'Expected', location: 'Meeting Room', purpose: 'Software Demonstration', guests: 1, host: 'Fatima Noor', department: 'IT', hostContact: '+971 52 444 1122', badge: 'V-002', accessLevel: 'Office Only', parking: 'No', vehicle: '', securityOfficer: '', appointment: 'APT-2026-105', photoCaptured: 'No', idVerified: 'Pending', escort: 'Yes', notes: 'Vendor product presentation.', remarks: 'IT department to escort visitor.' },
        { visitorId: 'VIS-2026-003', visitorName: 'John Mathew', visitorType: 'Contractor', company: 'Modern Facilities Services', jobTitle: 'Maintenance Engineer', phone: '+971 56 333 8899', email: 'john@modernfacilities.ae', idType: 'Emirates ID', idNumber: '784-1990-XXXXXXX-X', visitDate: '2026-10-04', arrivalTime: '08:00', departureTime: '17:00', checkIn: '08:01', checkOut: '', status: 'Checked In', location: 'Warehouse', purpose: 'AC Maintenance', guests: 2, host: 'Khalid Ahmed', department: 'Facilities', hostContact: '+971 50 888 3321', badge: 'C-018', accessLevel: 'Warehouse', parking: 'Yes', vehicle: 'AUH 88291', securityOfficer: 'Rashid', appointment: 'WO-2026-002', photoCaptured: 'Yes', idVerified: 'Yes', escort: 'Yes', notes: 'Maintenance team working on HVAC equipment.', remarks: 'Access restricted to service areas.' },
        { visitorId: 'VIS-2026-004', visitorName: 'Maria Santos', visitorType: 'Interview', company: 'Individual', jobTitle: 'Candidate', phone: '+971 50 777 2211', email: 'maria@example.com', idType: 'Passport', idNumber: 'PXXXXXXX', visitDate: '2026-10-04', arrivalTime: '13:00', departureTime: '14:30', checkIn: '', checkOut: '', status: 'Expected', location: 'Meeting Room', purpose: 'Job Interview', guests: 1, host: 'HR Manager', department: 'Human Resources', hostContact: '+971 50 333 9988', badge: 'V-004', accessLevel: 'Meeting Area', parking: 'No', vehicle: '', securityOfficer: '', appointment: 'INT-2026-028', photoCaptured: 'No', idVerified: 'Pending', escort: 'Yes', notes: 'Interview for Administration position.', remarks: 'HR to collect candidate from reception.' },
        { visitorId: 'VIS-2026-005', visitorName: 'Raj Kumar', visitorType: 'Delivery', company: 'Fast Logistics', jobTitle: 'Delivery Driver', phone: '+971 52 888 1122', email: '', idType: 'Driving License', idNumber: 'DL-XXXXXX', visitDate: '2026-10-03', arrivalTime: '15:00', departureTime: '16:00', checkIn: '15:08', checkOut: '15:47', status: 'Checked Out', location: 'Warehouse', purpose: 'Material Delivery', guests: 1, host: 'Warehouse Supervisor', department: 'Logistics', hostContact: '+971 55 111 7733', badge: 'D-031', accessLevel: 'Warehouse', parking: 'Yes', vehicle: 'AUH 44122', securityOfficer: 'Salim', appointment: 'DO-2026-341', photoCaptured: 'Yes', idVerified: 'Yes', escort: 'Yes', notes: 'Delivered electrical materials.', remarks: 'Delivery completed successfully.' },
        { visitorId: 'VIS-2026-006', visitorName: 'Omar Khalid', visitorType: 'Client', company: 'Gulf Engineering', jobTitle: 'Project Director', phone: '+971 54 111 8822', email: 'omar@gulfengineering.ae', idType: 'Emirates ID', idNumber: '784-1985-XXXXXXX-X', visitDate: '2026-10-04', arrivalTime: '14:00', departureTime: '16:00', checkIn: '', checkOut: '', status: 'Expected', location: 'Head Office', purpose: 'Project Review', guests: 2, host: 'Project Manager', department: 'Projects', hostContact: '+971 50 222 8899', badge: 'V-006', accessLevel: 'General', parking: 'Yes', vehicle: 'AUH 77312', securityOfficer: '', appointment: 'PRJ-2026-118', photoCaptured: 'No', idVerified: 'Pending', escort: 'No', notes: 'Quarterly project review meeting.', remarks: 'Visitor may arrive with one colleague.' }
    ];
    let visitors;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        visitors = Array.isArray(stored) ? stored : seed;
    } catch (error) {
        visitors = seed;
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
    const save = () => localStorage.setItem(storageKey, JSON.stringify(visitors));
    const toast = message => {
        const element = q('[data-vl-toast]');
        element.textContent = message;
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 2400);
    };
    const updateStats = () => {
        const today = new Date().toISOString().slice(0, 10);
        q('[data-vl-stat="total"]').textContent = visitors.length;
        q('[data-vl-stat="inside"]').textContent = visitors.filter(visitor => visitor.status === 'Checked In').length;
        q('[data-vl-stat="expected"]').textContent = visitors.filter(visitor => visitor.status === 'Expected' && visitor.visitDate === today).length;
        q('[data-vl-stat="checkedOut"]').textContent = visitors.filter(visitor => visitor.status === 'Checked Out').length;
        q('[data-vl-stat="overdue"]').textContent = visitors.filter(visitor => visitor.status === 'Overdue').length;
        q('[data-vl-stat="companies"]').textContent = new Set(visitors.map(visitor => visitor.company).filter(Boolean)).size;
    };
    const render = () => {
        const search = q('[data-vl-search]').value.trim().toLowerCase();
        const status = q('[data-vl-status]').value;
        const type = q('[data-vl-type]').value;
        const location = q('[data-vl-location]').value;
        const filtered = visitors.filter(visitor => (!status || visitor.status === status) && (!type || visitor.visitorType === type) && (!location || visitor.location === location) && (!search || JSON.stringify(visitor).toLowerCase().includes(search)));
        q('[data-vl-rows]').innerHTML = filtered.length ? filtered.map(visitor => `<tr><td><b>${escape(visitor.visitorName)}</b><small class="vl-small">${escape(visitor.visitorId)}</small></td><td><b>${escape(visitor.company)}</b><small class="vl-small">${escape(visitor.jobTitle || '—')}</small></td><td><span class="vl-badge ${escape(statusClass(visitor.visitorType))}">${escape(visitor.visitorType)}</span><small class="vl-small">${escape(visitor.purpose)}</small></td><td><b>${escape(visitor.host)}</b><small class="vl-small">${escape(visitor.department || '—')}</small></td><td><b>${formatDate(visitor.visitDate)}</b><small class="vl-small">Expected ${escape(visitor.arrivalTime || '—')}</small></td><td>${escape(visitor.checkIn || '—')}</td><td>${escape(visitor.checkOut || '—')}</td><td><span class="vl-badge employee">${escape(visitor.badge || 'Not Issued')}</span></td><td><span class="vl-badge ${escape(statusClass(visitor.status))}">${escape(visitor.status)}</span></td><td><div class="vl-actions"><button class="vl-action" type="button" title="View" aria-label="View ${escape(visitor.visitorName)}" data-vl-action="view" data-id="${escape(visitor.visitorId)}"><i class="fas fa-eye"></i></button><button class="vl-action" type="button" title="Edit" aria-label="Edit ${escape(visitor.visitorName)}" data-vl-action="edit" data-id="${escape(visitor.visitorId)}"><i class="fas fa-pen"></i></button><button class="vl-action" type="button" title="Print" aria-label="Print ${escape(visitor.visitorName)}" data-vl-action="print" data-id="${escape(visitor.visitorId)}"><i class="fas fa-print"></i></button><button class="vl-action vl-delete" type="button" title="Delete" aria-label="Delete ${escape(visitor.visitorName)}" data-vl-action="delete" data-id="${escape(visitor.visitorId)}"><i class="fas fa-trash"></i></button></div></td></tr>`).join('') : '<tr><td colspan="10"><div class="vl-empty">No visitor records found.</div></td></tr>';
        updateStats();
    };
    const closeForm = () => q('[data-vl-form-overlay]').classList.remove('is-open');
    const closeView = () => q('[data-vl-view-overlay]').classList.remove('is-open');
    const openForm = visitor => {
        const form = q('[data-vl-form]');
        form.reset();
        editingId = visitor?.visitorId ?? null;
        q('#vl-form-title').textContent = visitor ? 'Edit Visitor' : 'Add Visitor';
        if (visitor) {
            ['visitorId', 'visitorName', 'visitorType', 'company', 'jobTitle', 'phone', 'email', 'idType', 'idNumber', 'visitDate', 'arrivalTime', 'departureTime', 'checkIn', 'checkOut', 'status', 'location', 'purpose', 'guests', 'host', 'department', 'hostContact', 'badge', 'accessLevel', 'parking', 'vehicle', 'securityOfficer', 'appointment', 'photoCaptured', 'idVerified', 'escort', 'notes', 'remarks'].forEach(field => { form.elements[field].value = visitor[field] ?? ''; });
        } else {
            form.elements.visitDate.value = new Date().toISOString().slice(0, 10);
        }
        q('[data-vl-form-overlay]').classList.add('is-open');
        form.elements.visitorId.focus();
    };
    const details = visitor => `<header class="vl-detail-header"><div class="vl-profile"><span class="vl-avatar">${escape(initials(visitor.visitorName))}</span><div><h2>${escape(visitor.visitorName)}</h2><p>${escape(visitor.company)} · ${escape(visitor.visitorType)} · ${escape(visitor.purpose)}</p></div></div><span class="vl-badge ${escape(statusClass(visitor.status))}">${escape(visitor.status)}</span></header>
        <div class="vl-summary-grid">${[['Visitor ID', visitor.visitorId], ['Visit Type', visitor.visitorType], ['Visit Date', formatDate(visitor.visitDate)], ['Status', visitor.status], ['Host', visitor.host], ['Department', visitor.department || '—'], ['Check In', visitor.checkIn || '—'], ['Check Out', visitor.checkOut || '—'], ['Badge', visitor.badge || 'Not Issued'], ['Location', visitor.location], ['Guests', visitor.guests], ['Access Level', visitor.accessLevel]].map(([label, value]) => `<div class="vl-summary-box"><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`).join('')}</div>
        <h4 class="vl-section-title">Visitor Information</h4><table class="vl-info-table"><tbody>${[['Full Name', visitor.visitorName], ['Company / Organization', visitor.company], ['Job Title', visitor.jobTitle], ['Phone', visitor.phone], ['Email', visitor.email], ['Identification', `${visitor.idType} · ${visitor.idNumber || '—'}`], ['Purpose', visitor.purpose], ['Expected Arrival', visitor.arrivalTime], ['Expected Departure', visitor.departureTime], ['Host Contact', visitor.hostContact], ['Parking Required', visitor.parking], ['Vehicle Plate', visitor.vehicle], ['Security Officer', visitor.securityOfficer], ['Appointment Reference', visitor.appointment], ['Photo Captured', visitor.photoCaptured], ['ID Verified', visitor.idVerified], ['Escort Required', visitor.escort]].map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value || '—')}</td></tr>`).join('')}</tbody></table><div class="vl-notes"><strong>Visit Notes</strong><p>${escape(visitor.notes || 'No additional notes.')}</p></div><div class="vl-notes"><strong>Internal Remarks</strong><p>${escape(visitor.remarks || 'No internal remarks.')}</p></div>`;
    const printDocument = (title, html) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast('Allow pop-ups to print visitor records.');
        printWindow.document.write(`<!doctype html><html><head><title>${escape(title)}</title><meta charset="utf-8"><style>body{font:13px Arial,sans-serif;color:#172033;padding:32px}h1{font-size:23px;margin:0}p{color:#475569}.head{display:flex;justify-content:space-between;border-bottom:2px solid #172033;padding-bottom:14px;margin-bottom:20px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:16px 0;font-size:12px}.meta strong{display:block;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:11px}th{background:#f1f5f9}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:35px;margin-top:65px}.signatures span{border-top:1px solid #475569;padding-top:8px}@media print{body{padding:0}}</style></head><body>${html}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    const printVisitor = visitor => {
        const fields = [['Visitor', visitor.visitorName], ['Company', visitor.company], ['Visitor Type', visitor.visitorType], ['Visit Date', formatDate(visitor.visitDate)], ['Expected Arrival', visitor.arrivalTime], ['Expected Departure', visitor.departureTime], ['Check In', visitor.checkIn], ['Check Out', visitor.checkOut], ['Host', visitor.host], ['Department', visitor.department], ['Location', visitor.location], ['Purpose', visitor.purpose], ['Badge', visitor.badge || 'Not Issued'], ['Access Level', visitor.accessLevel], ['ID Verified', visitor.idVerified], ['Security Officer', visitor.securityOfficer]];
        const html = `<header class="head"><div><h1>Visitor Pass / Visit Record</h1><p>Security &amp; Reception Department</p></div><div><strong>${escape(visitor.visitorId)}</strong><br>Status: ${escape(visitor.status)}</div></header><div class="meta">${fields.map(([label, value]) => `<div><strong>${escape(label)}</strong>${escape(value || '—')}</div>`).join('')}</div><table><thead><tr><th>Visitor Detail</th><th>Information</th></tr></thead><tbody>${[['Phone', visitor.phone], ['Email', visitor.email], ['Identification', `${visitor.idType} · ${visitor.idNumber || '—'}`], ['Job Title', visitor.jobTitle], ['Guests', visitor.guests], ['Parking', visitor.parking], ['Vehicle', visitor.vehicle], ['Photo Captured', visitor.photoCaptured], ['Escort Required', visitor.escort], ['Appointment Reference', visitor.appointment], ['Notes', visitor.notes], ['Remarks', visitor.remarks]].map(([label, value]) => `<tr><td>${escape(label)}</td><td>${escape(value || '—')}</td></tr>`).join('')}</tbody></table><div class="signatures"><span>Visitor Signature</span><span>Host / Employee Signature</span><span>Security Verification</span></div>`;
        printDocument(visitor.visitorId, html);
    };

    q('[data-vl-new]').addEventListener('click', () => openForm());
    q('[data-vl-search]').addEventListener('input', render);
    q('[data-vl-status]').addEventListener('change', render);
    q('[data-vl-type]').addEventListener('change', render);
    q('[data-vl-location]').addEventListener('change', render);
    q('[data-vl-print-report]').addEventListener('click', () => {
        if (!visitors.length) return toast('No visitor records available.');
        const rows = visitors.map(visitor => `<tr><td>${escape(visitor.visitorId)}</td><td>${escape(visitor.visitorName)}</td><td>${escape(visitor.company)}</td><td>${escape(visitor.visitorType)}</td><td>${escape(visitor.host)}</td><td>${formatDate(visitor.visitDate)}</td><td>${escape(visitor.checkIn || '—')}</td><td>${escape(visitor.checkOut || '—')}</td><td>${escape(visitor.badge || '—')}</td><td>${escape(visitor.status)}</td></tr>`).join('');
        printDocument('Visitor Log Register', `<header class="head"><div><h1>Visitor Log Register</h1><p>Security &amp; Reception Department</p></div><div>Total Records: <strong>${visitors.length}</strong></div></header><table><thead><tr><th>Visitor ID</th><th>Visitor</th><th>Company</th><th>Type</th><th>Host</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Badge</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table><div class="signatures"><span>Prepared By</span><span>Checked By</span><span>Security Manager</span></div>`);
    });
    q('[data-vl-form]').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const visitor = Object.fromEntries(new FormData(form).entries());
        visitor.visitorId = visitor.visitorId.trim();
        visitor.guests = Math.max(1, Number(visitor.guests) || 1);
        const existing = visitors.find(item => item.visitorId === editingId);
        if (visitors.some(item => item.visitorId.toLowerCase() === visitor.visitorId.toLowerCase() && item.visitorId !== editingId)) return toast('Visitor ID already exists.');
        if (existing) visitors = visitors.map(item => item.visitorId === editingId ? visitor : item);
        else visitors.unshift(visitor);
        save();
        closeForm();
        render();
        toast(existing ? 'Visitor record updated successfully.' : 'Visitor added successfully.');
    });
    q('[data-vl-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-vl-action]');
        if (!button) return;
        const visitor = visitors.find(item => item.visitorId === button.dataset.id);
        if (!visitor) return;
        if (button.dataset.vlAction === 'view') {
            viewingId = visitor.visitorId;
            q('[data-vl-view-content]').innerHTML = details(visitor);
            q('[data-vl-view-overlay]').classList.add('is-open');
        } else if (button.dataset.vlAction === 'edit') {
            openForm(visitor);
        } else if (button.dataset.vlAction === 'print') {
            printVisitor(visitor);
        } else if (button.dataset.vlAction === 'delete' && confirm(`Delete visitor "${visitor.visitorName}"?`)) {
            visitors = visitors.filter(item => item.visitorId !== visitor.visitorId);
            save();
            render();
            toast('Visitor record deleted.');
        }
    });
    q('[data-vl-close-form]').addEventListener('click', closeForm);
    q('[data-vl-cancel]').addEventListener('click', closeForm);
    section.querySelectorAll('[data-vl-close-view]').forEach(button => button.addEventListener('click', closeView));
    q('[data-vl-print-current]').addEventListener('click', () => {
        const visitor = visitors.find(item => item.visitorId === viewingId);
        if (visitor) printVisitor(visitor);
    });
    section.querySelectorAll('.vl-overlay').forEach(overlay => overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('is-open'); }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            q('[data-vl-form-overlay]').classList.remove('is-open');
            closeView();
        }
    });
    render();
    return section;
}