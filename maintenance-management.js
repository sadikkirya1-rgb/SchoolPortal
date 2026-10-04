function createMaintenanceManagementModule() {
    const section = document.createElement('section');
    section.className = 'module maintenance-management-module hidden';
    section.id = 'maintenanceManagementModule';
    section.innerHTML = `
        <header class="mm-header"><div><h2>Maintenance</h2><p>Manage preventive maintenance, corrective repairs, work orders, technicians and maintenance costs</p></div><button class="mm-button mm-primary" type="button" data-mm-new><i class="fas fa-plus"></i> Add Maintenance</button></header>
        <section class="mm-stats" aria-label="Maintenance summary"><article class="mm-stat"><div><span>Total Requests</span><strong data-mm-stat="total">0</strong></div><i class="fas fa-screwdriver-wrench"></i></article><article class="mm-stat"><div><span>In Progress</span><strong data-mm-stat="inProgress">0</strong></div><i class="fas fa-gear"></i></article><article class="mm-stat"><div><span>Scheduled</span><strong data-mm-stat="scheduled">0</strong></div><i class="fas fa-calendar-check"></i></article><article class="mm-stat"><div><span>Completed</span><strong data-mm-stat="completed">0</strong></div><i class="fas fa-circle-check"></i></article><article class="mm-stat"><div><span>Urgent</span><strong data-mm-stat="urgent">0</strong></div><i class="fas fa-triangle-exclamation"></i></article><article class="mm-stat"><div><span>Total Cost</span><strong data-mm-stat="cost">AED 0</strong></div><i class="fas fa-coins"></i></article></section>
        <section class="mm-content" aria-label="Maintenance work orders"><div class="mm-toolbar"><label class="mm-search"><i class="fas fa-search" aria-hidden="true"></i><span class="mm-sr-only">Search work orders</span><input type="search" data-mm-search placeholder="Search work order, asset, technician, location..."></label><select class="mm-filter" data-mm-status aria-label="Filter by status"><option value="">All Statuses</option><option>Scheduled</option><option>Pending</option><option>In Progress</option><option>Completed</option><option>On Hold</option><option>Cancelled</option></select><select class="mm-filter" data-mm-priority aria-label="Filter by priority"><option value="">All Priorities</option><option>Urgent</option><option>High</option><option>Medium</option><option>Low</option></select><select class="mm-filter" data-mm-type aria-label="Filter by type"><option value="">All Types</option><option>Preventive</option><option>Corrective</option><option>Emergency</option><option>Inspection</option><option>Calibration</option></select><button class="mm-button mm-light" type="button" data-mm-print-report><i class="fas fa-print"></i> Print / PDF</button></div>
            <div class="mm-table-wrap"><table class="mm-table"><thead><tr><th>Work Order</th><th>Asset / Equipment</th><th>Type</th><th>Scheduled</th><th>Technician</th><th>Priority</th><th>Estimated Cost</th><th>Status</th><th>Actions</th></tr></thead><tbody data-mm-rows></tbody></table></div></section>
        <div class="mm-overlay" data-mm-form-overlay><section class="mm-modal" role="dialog" aria-modal="true" aria-labelledby="mm-form-title"><header class="mm-modal-head"><h3 id="mm-form-title">Add Maintenance</h3><button class="mm-close" type="button" data-mm-close-form aria-label="Close">&times;</button></header>
            <form class="mm-form" data-mm-form>
                <h4 class="mm-section-title">Maintenance Request</h4><div class="mm-grid">
                    <label>Work Order No.<input name="workOrder" required placeholder="WO-2026-001"></label><label>Maintenance Type<select name="type"><option>Preventive</option><option>Corrective</option><option>Emergency</option><option>Inspection</option><option>Calibration</option></select></label><label>Priority<select name="priority"><option>Urgent</option><option>High</option><option selected>Medium</option><option>Low</option></select></label>
                    <label>Request Date<input name="requestDate" type="date" required></label><label>Scheduled Date<input name="scheduledDate" type="date" required></label><label>Scheduled Time<input name="scheduledTime" type="time"></label>
                </div>
                <h4 class="mm-section-title">Asset &amp; Location</h4><div class="mm-grid">
                    <label>Asset / Equipment<input name="asset" required placeholder="e.g. Generator 500 KVA"></label><label>Asset ID<input name="assetId" placeholder="FA-004"></label><label>Equipment Serial No.<input name="serialNumber" placeholder="Serial number"></label>
                    <label>Location<input name="location" required placeholder="e.g. Warehouse"></label><label>Department<input name="department" placeholder="e.g. Facilities"></label><label>Requested By<input name="requestedBy" placeholder="Employee / Department"></label>
                </div>
                <h4 class="mm-section-title">Technician &amp; Service Details</h4><div class="mm-grid">
                    <label>Technician<input name="technician" required placeholder="Assigned technician"></label><label>Technician Company<input name="technicianCompany" placeholder="Internal / External contractor"></label><label>Contact Number<input name="technicianPhone" type="tel" placeholder="Phone number"></label>
                    <label>Estimated Hours<input name="estimatedHours" type="number" min="0" step="0.5" value="2"></label><label>Actual Hours<input name="actualHours" type="number" min="0" step="0.5" value="0"></label><label>Status<select name="status"><option>Scheduled</option><option>Pending</option><option>In Progress</option><option>Completed</option><option>On Hold</option><option>Cancelled</option></select></label>
                </div>
                <h4 class="mm-section-title">Cost &amp; Materials</h4><div class="mm-grid">
                    <label>Estimated Cost<input name="estimatedCost" type="number" min="0" step="0.01" value="0"></label><label>Actual Cost<input name="actualCost" type="number" min="0" step="0.01" value="0"></label><label>Currency<select name="currency"><option>AED</option><option>USD</option><option>EUR</option><option>GBP</option><option>SAR</option></select></label>
                    <label>Purchase Order No.<input name="poNumber" placeholder="PO-2026-0001"></label><label>Parts / Materials Cost<input name="partsCost" type="number" min="0" step="0.01" value="0"></label><label>Labor Cost<input name="laborCost" type="number" min="0" step="0.01" value="0"></label>
                </div>
                <h4 class="mm-section-title">Completion &amp; Notes</h4><div class="mm-grid">
                    <label>Completion Date<input name="completionDate" type="date"></label><label>Next Maintenance Date<input name="nextMaintenance" type="date"></label><label>Condition After Service<select name="condition"><option>Excellent</option><option>Good</option><option>Fair</option><option>Requires Follow-up</option><option>Out of Service</option></select></label>
                    <label class="mm-full">Maintenance Description<textarea name="description" placeholder="Describe the maintenance requirement, fault or service work..."></textarea></label><label class="mm-full">Work Performed<textarea name="workPerformed" placeholder="Enter work performed, repairs completed and findings..."></textarea></label><label class="mm-full">Notes<textarea name="notes" placeholder="Additional notes, recommendations or follow-up actions..."></textarea></label>
                </div><footer class="mm-modal-actions"><button class="mm-button mm-light" type="button" data-mm-cancel>Cancel</button><button class="mm-button mm-primary" type="submit">Save Maintenance</button></footer>
            </form>
        </section></div>
        <div class="mm-overlay" data-mm-view-overlay><section class="mm-modal" role="dialog" aria-modal="true" aria-labelledby="mm-view-title"><header class="mm-modal-head"><h3 id="mm-view-title">Maintenance Details</h3><button class="mm-close" type="button" data-mm-close-view aria-label="Close">&times;</button></header><div class="mm-view" data-mm-view-content></div><footer class="mm-modal-actions"><button class="mm-button mm-light" type="button" data-mm-close-view>Close</button><button class="mm-button mm-primary" type="button" data-mm-print-current><i class="fas fa-print"></i> Print / PDF</button></footer></section></div>
        <div class="mm-toast" role="status" aria-live="polite" data-mm-toast></div>`;

    const storageKey = 'schoolMaintenanceWorkOrders';
    const seed = [
        { workOrder: 'WO-2026-001', type: 'Preventive', priority: 'High', requestDate: '2026-09-25', scheduledDate: '2026-10-05', scheduledTime: '09:00', asset: 'Industrial Generator 500 KVA', assetId: 'FA-004', serialNumber: 'GEN-500-8821', location: 'Warehouse', department: 'Facilities', requestedBy: 'Facilities Department', technician: 'Mohammed Ali', technicianCompany: 'Internal Maintenance', technicianPhone: '+971 50 123 4567', estimatedHours: 4, actualHours: 0, status: 'Scheduled', estimatedCost: 1800, actualCost: 0, currency: 'AED', poNumber: '', partsCost: 500, laborCost: 1300, completionDate: '', nextMaintenance: '2027-01-05', condition: 'Good', description: 'Quarterly preventive maintenance and full inspection of generator.', workPerformed: '', notes: 'Check oil, coolant, battery and belts.' },
        { workOrder: 'WO-2026-002', type: 'Corrective', priority: 'Urgent', requestDate: '2026-09-29', scheduledDate: '2026-10-02', scheduledTime: '10:30', asset: 'Central Air Conditioning Unit', assetId: 'FA-007', serialNumber: 'AC-992817', location: 'Head Office', department: 'Facilities', requestedBy: 'Administration', technician: 'John Mathew', technicianCompany: 'CoolTech Services LLC', technicianPhone: '+971 55 555 8899', estimatedHours: 5, actualHours: 3.5, status: 'In Progress', estimatedCost: 2500, actualCost: 2100, currency: 'AED', poNumber: 'PO-2026-0142', partsCost: 1200, laborCost: 900, completionDate: '', nextMaintenance: '2026-12-15', condition: 'Good', description: 'AC unit producing insufficient cooling in executive offices.', workPerformed: 'Replaced damaged fan belt and cleaned filters.', notes: 'Monitor cooling performance for 48 hours.' },
        { workOrder: 'WO-2026-003', type: 'Inspection', priority: 'Medium', requestDate: '2026-09-20', scheduledDate: '2026-09-28', scheduledTime: '13:00', asset: 'Toyota Land Cruiser', assetId: 'FA-003', serialNumber: 'VIN-JT123456789', location: 'Vehicle Yard', department: 'Operations', requestedBy: 'Operations', technician: 'Khalid Ahmed', technicianCompany: 'Prime Motors', technicianPhone: '+971 52 444 1122', estimatedHours: 3, actualHours: 2, status: 'Completed', estimatedCost: 950, actualCost: 875, currency: 'AED', poNumber: 'PO-2026-0131', partsCost: 300, laborCost: 575, completionDate: '2026-09-28', nextMaintenance: '2026-12-28', condition: 'Excellent', description: 'Quarterly vehicle inspection and preventive service.', workPerformed: 'Oil and filter changed. Brakes, tires and fluids inspected.', notes: 'Vehicle cleared for operational use.' },
        { workOrder: 'WO-2026-004', type: 'Calibration', priority: 'High', requestDate: '2026-09-30', scheduledDate: '2026-10-07', scheduledTime: '08:30', asset: 'Digital Weighing Scale', assetId: 'FA-021', serialNumber: 'SCALE-82191', location: 'Warehouse', department: 'Logistics', requestedBy: 'Warehouse Manager', technician: 'Precision Calibration Team', technicianCompany: 'Metro Calibration Services', technicianPhone: '+971 56 222 7733', estimatedHours: 2, actualHours: 0, status: 'Pending', estimatedCost: 650, actualCost: 0, currency: 'AED', poNumber: '', partsCost: 0, laborCost: 650, completionDate: '', nextMaintenance: '2027-04-07', condition: 'Good', description: 'Annual calibration and certification of warehouse weighing equipment.', workPerformed: '', notes: 'Calibration certificate required.' },
        { workOrder: 'WO-2026-005', type: 'Emergency', priority: 'Urgent', requestDate: '2026-10-01', scheduledDate: '2026-10-01', scheduledTime: '16:00', asset: 'Forklift', assetId: 'FA-006', serialNumber: 'FLT-77219', location: 'Warehouse', department: 'Logistics', requestedBy: 'Warehouse Supervisor', technician: 'Maintenance Team', technicianCompany: 'Internal Maintenance', technicianPhone: '+971 50 888 3321', estimatedHours: 6, actualHours: 5, status: 'Completed', estimatedCost: 3200, actualCost: 2980, currency: 'AED', poNumber: 'PO-2026-0150', partsCost: 1900, laborCost: 1080, completionDate: '2026-10-01', nextMaintenance: '2026-11-01', condition: 'Good', description: 'Forklift hydraulic system failure.', workPerformed: 'Hydraulic hose replaced and system pressure tested.', notes: 'Operator instructed to report any hydraulic leakage immediately.' },
        { workOrder: 'WO-2026-006', type: 'Preventive', priority: 'Low', requestDate: '2026-09-15', scheduledDate: '2026-10-10', scheduledTime: '11:00', asset: 'Executive Office HVAC', assetId: 'FA-031', serialNumber: 'HVAC-18821', location: 'Head Office', department: 'Administration', requestedBy: 'Administration', technician: 'Service Team', technicianCompany: 'Modern Facilities Trading', technicianPhone: '+971 55 111 8822', estimatedHours: 2, actualHours: 0, status: 'Scheduled', estimatedCost: 500, actualCost: 0, currency: 'AED', poNumber: '', partsCost: 100, laborCost: 400, completionDate: '', nextMaintenance: '2027-01-10', condition: 'Good', description: 'Routine HVAC cleaning and inspection.', workPerformed: '', notes: 'Replace filters if required.' }
    ];
    let records;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        records = Array.isArray(stored) ? stored : seed;
    } catch (error) {
        records = seed;
    }
    let editingId = null;
    let viewingId = null;
    let toastTimer;
    const q = selector => section.querySelector(selector);
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    const money = (value, currency = 'AED') => `${currency} ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = value => {
        if (!value) return '—';
        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime()) ? escape(value) : date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
    };
    const statusClass = value => String(value || '').toLowerCase().replace(/\s+/g, '-');
    const save = () => localStorage.setItem(storageKey, JSON.stringify(records));
    const toast = message => {
        const element = q('[data-mm-toast]');
        element.textContent = message;
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 2400);
    };
    const updateStats = () => {
        q('[data-mm-stat="total"]').textContent = records.length;
        q('[data-mm-stat="inProgress"]').textContent = records.filter(item => item.status === 'In Progress').length;
        q('[data-mm-stat="scheduled"]').textContent = records.filter(item => item.status === 'Scheduled').length;
        q('[data-mm-stat="completed"]').textContent = records.filter(item => item.status === 'Completed').length;
        q('[data-mm-stat="urgent"]').textContent = records.filter(item => item.priority === 'Urgent').length;
        const totals = {};
        records.forEach(item => { totals[item.currency] = (totals[item.currency] || 0) + Number(item.actualCost || item.estimatedCost || 0); });
        const entries = Object.entries(totals);
        const cost = q('[data-mm-stat="cost"]');
        cost.textContent = entries.length <= 1 ? money(entries[0]?.[1] || 0, entries[0]?.[0] || 'AED').replace(/\.00$/, '') : 'Multiple';
        cost.title = entries.map(([currency, amount]) => money(amount, currency)).join(' · ');
    };
    const render = () => {
        const search = q('[data-mm-search]').value.trim().toLowerCase();
        const status = q('[data-mm-status]').value;
        const priority = q('[data-mm-priority]').value;
        const type = q('[data-mm-type]').value;
        const filtered = records.filter(item => (!status || item.status === status) && (!priority || item.priority === priority) && (!type || item.type === type) && (!search || JSON.stringify(item).toLowerCase().includes(search)));
        q('[data-mm-rows]').innerHTML = filtered.length ? filtered.map(item => `<tr><td><strong class="mm-code">${escape(item.workOrder)}</strong><small class="mm-small">Requested ${formatDate(item.requestDate)}</small></td><td><b>${escape(item.asset)}</b><small class="mm-small">${escape(item.assetId || 'No Asset ID')} · ${escape(item.location)}</small></td><td><b>${escape(item.type)}</b><small class="mm-small">${escape(item.department || '')}</small></td><td><b>${formatDate(item.scheduledDate)}</b><small class="mm-small">${escape(item.scheduledTime || '—')}</small></td><td><b>${escape(item.technician)}</b><small class="mm-small">${escape(item.technicianCompany || '')}</small></td><td><span class="mm-badge ${escape(statusClass(item.priority))}">${escape(item.priority)}</span></td><td><b>${money(item.estimatedCost, item.currency)}</b><small class="mm-small">Actual: ${money(item.actualCost, item.currency)}</small></td><td><span class="mm-badge ${escape(statusClass(item.status))}">${escape(item.status)}</span></td><td><div class="mm-actions"><button class="mm-action" type="button" title="View" aria-label="View ${escape(item.workOrder)}" data-mm-action="view" data-id="${escape(item.workOrder)}"><i class="fas fa-eye"></i></button><button class="mm-action" type="button" title="Edit" aria-label="Edit ${escape(item.workOrder)}" data-mm-action="edit" data-id="${escape(item.workOrder)}"><i class="fas fa-pen"></i></button><button class="mm-action" type="button" title="Print" aria-label="Print ${escape(item.workOrder)}" data-mm-action="print" data-id="${escape(item.workOrder)}"><i class="fas fa-print"></i></button><button class="mm-action mm-delete" type="button" title="Delete" aria-label="Delete ${escape(item.workOrder)}" data-mm-action="delete" data-id="${escape(item.workOrder)}"><i class="fas fa-trash"></i></button></div></td></tr>`).join('') : '<tr><td colspan="9"><div class="mm-empty">No maintenance records found.</div></td></tr>';
        updateStats();
    };
    const closeForm = () => q('[data-mm-form-overlay]').classList.remove('is-open');
    const closeView = () => q('[data-mm-view-overlay]').classList.remove('is-open');
    const openForm = record => {
        const form = q('[data-mm-form]');
        form.reset();
        editingId = record?.workOrder ?? null;
        q('#mm-form-title').textContent = record ? 'Edit Maintenance' : 'Add Maintenance';
        if (record) {
            ['workOrder', 'type', 'priority', 'requestDate', 'scheduledDate', 'scheduledTime', 'asset', 'assetId', 'serialNumber', 'location', 'department', 'requestedBy', 'technician', 'technicianCompany', 'technicianPhone', 'estimatedHours', 'actualHours', 'status', 'estimatedCost', 'actualCost', 'currency', 'poNumber', 'partsCost', 'laborCost', 'completionDate', 'nextMaintenance', 'condition', 'description', 'workPerformed', 'notes'].forEach(field => { form.elements[field].value = record[field] ?? ''; });
        } else {
            const today = new Date().toISOString().slice(0, 10);
            form.elements.requestDate.value = today;
            form.elements.scheduledDate.value = today;
        }
        q('[data-mm-form-overlay]').classList.add('is-open');
        form.elements.workOrder.focus();
    };
    const detailContent = record => `<header class="mm-detail-header"><div class="mm-profile"><span class="mm-avatar">${escape(record.asset.split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase())}</span><div><h2>${escape(record.workOrder)}</h2><p>${escape(record.asset)} · ${escape(record.type)} · ${escape(record.location)}</p></div></div><span class="mm-badge ${escape(statusClass(record.status))}">${escape(record.status)}</span></header>
        <div class="mm-summary-grid">${[['Work Order', record.workOrder], ['Priority', record.priority], ['Maintenance Type', record.type], ['Scheduled Date', formatDate(record.scheduledDate)], ['Asset', record.asset], ['Location', record.location], ['Technician', record.technician], ['Estimated Cost', money(record.estimatedCost, record.currency)], ['Actual Cost', money(record.actualCost, record.currency)], ['Estimated Hours', `${record.estimatedHours} hrs`], ['Actual Hours', `${record.actualHours} hrs`], ['Next Maintenance', formatDate(record.nextMaintenance)]].map(([label, value]) => `<div class="mm-summary-box"><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`).join('')}</div>
        <h4 class="mm-section-title">Maintenance Information</h4><table class="mm-info-table"><tbody>${[['Request Date', formatDate(record.requestDate)], ['Scheduled Time', record.scheduledTime || '—'], ['Asset ID', record.assetId], ['Serial Number', record.serialNumber], ['Department', record.department], ['Requested By', record.requestedBy], ['Technician Company', record.technicianCompany], ['Contact Number', record.technicianPhone], ['Purchase Order', record.poNumber], ['Parts Cost', money(record.partsCost, record.currency)], ['Labor Cost', money(record.laborCost, record.currency)], ['Completion Date', formatDate(record.completionDate)], ['Condition After Service', record.condition], ['Description', record.description], ['Work Performed', record.workPerformed]].map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value || '—')}</td></tr>`).join('')}</tbody></table><div class="mm-notes"><strong>Notes</strong><p>${escape(record.notes || 'No additional notes.')}</p></div>`;
    const printDocument = (title, html) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast('Allow pop-ups to print maintenance work orders.');
        printWindow.document.write(`<!doctype html><html><head><title>${escape(title)}</title><meta charset="utf-8"><style>body{font:13px Arial,sans-serif;color:#172033;padding:32px}h1{font-size:23px;margin:0}p{color:#475569}.head{display:flex;justify-content:space-between;border-bottom:2px solid #172033;padding-bottom:14px;margin-bottom:20px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:16px 0;font-size:12px}.meta strong{display:block;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:11px}th{background:#f1f5f9}.notes{margin-top:24px}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:35px;margin-top:65px}.signatures span{border-top:1px solid #475569;padding-top:8px}@media print{body{padding:0}}</style></head><body>${html}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    const printRecord = record => {
        const html = `<header class="head"><div><h1>Maintenance Work Order</h1><p>Maintenance &amp; Facilities Department</p></div><div><strong>${escape(record.workOrder)}</strong><br>Status: ${escape(record.status)}</div></header><div class="meta"><div><strong>Priority</strong>${escape(record.priority)}</div><div><strong>Maintenance Type</strong>${escape(record.type)}</div><div><strong>Request Date</strong>${formatDate(record.requestDate)}</div><div><strong>Scheduled Date</strong>${formatDate(record.scheduledDate)} ${escape(record.scheduledTime || '')}</div><div><strong>Asset</strong>${escape(record.asset)}</div><div><strong>Asset ID</strong>${escape(record.assetId || '—')}</div><div><strong>Serial Number</strong>${escape(record.serialNumber || '—')}</div><div><strong>Location</strong>${escape(record.location)}</div><div><strong>Department</strong>${escape(record.department || '—')}</div><div><strong>Requested By</strong>${escape(record.requestedBy || '—')}</div><div><strong>Technician</strong>${escape(record.technician)}</div><div><strong>Technician Company</strong>${escape(record.technicianCompany || '—')}</div><div><strong>Estimated Cost</strong>${money(record.estimatedCost, record.currency)}</div><div><strong>Actual Cost</strong>${money(record.actualCost, record.currency)}</div><div><strong>Estimated Hours</strong>${Number(record.estimatedHours)} hours</div><div><strong>Actual Hours</strong>${Number(record.actualHours)} hours</div></div><table><thead><tr><th>Maintenance Detail</th><th>Information</th></tr></thead><tbody>${[['Description', record.description], ['Work Performed', record.workPerformed], ['Parts / Materials Cost', money(record.partsCost, record.currency)], ['Labor Cost', money(record.laborCost, record.currency)], ['Completion Date', formatDate(record.completionDate)], ['Next Maintenance', formatDate(record.nextMaintenance)], ['Condition After Service', record.condition], ['Purchase Order', record.poNumber]].map(([label, value]) => `<tr><td>${escape(label)}</td><td>${escape(value || '—')}</td></tr>`).join('')}</tbody></table><div class="notes"><strong>Notes</strong><p>${escape(record.notes || 'No additional notes.')}</p></div><div class="signatures"><span>Technician Signature</span><span>Supervisor Verification</span><span>Manager Approval</span></div>`;
        printDocument(record.workOrder, html);
    };

    q('[data-mm-new]').addEventListener('click', () => openForm());
    q('[data-mm-search]').addEventListener('input', render);
    q('[data-mm-status]').addEventListener('change', render);
    q('[data-mm-priority]').addEventListener('change', render);
    q('[data-mm-type]').addEventListener('change', render);
    q('[data-mm-print-report]').addEventListener('click', () => {
        if (!records.length) return toast('No maintenance records available.');
        const rows = records.map(record => `<tr><td>${escape(record.workOrder)}</td><td>${escape(record.asset)}</td><td>${escape(record.type)}</td><td>${formatDate(record.scheduledDate)}</td><td>${escape(record.technician)}</td><td>${escape(record.priority)}</td><td>${money(record.estimatedCost, record.currency)}</td><td>${money(record.actualCost, record.currency)}</td><td>${escape(record.status)}</td></tr>`).join('');
        printDocument('Maintenance Register', `<header class="head"><div><h1>Maintenance Register</h1><p>Maintenance &amp; Facilities Department</p></div><div>Total Records: <strong>${records.length}</strong></div></header><table><thead><tr><th>Work Order</th><th>Asset</th><th>Type</th><th>Scheduled</th><th>Technician</th><th>Priority</th><th>Estimated Cost</th><th>Actual Cost</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table><div class="signatures"><span>Prepared By</span><span>Checked By</span><span>Approved By</span></div>`);
    });
    q('[data-mm-form]').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const record = Object.fromEntries(new FormData(form).entries());
        ['estimatedHours', 'actualHours', 'estimatedCost', 'actualCost', 'partsCost', 'laborCost'].forEach(field => { record[field] = Number(record[field]) || 0; });
        record.workOrder = record.workOrder.trim();
        const existing = records.find(item => item.workOrder === editingId);
        if (records.some(item => item.workOrder.toLowerCase() === record.workOrder.toLowerCase() && item.workOrder !== editingId)) return toast('Work Order No. already exists.');
        if (['estimatedHours', 'actualHours', 'estimatedCost', 'actualCost', 'partsCost', 'laborCost'].some(field => record[field] < 0)) return toast('Hours and costs cannot be negative.');
        if (existing) records = records.map(item => item.workOrder === editingId ? record : item);
        else records.unshift(record);
        save();
        closeForm();
        render();
        toast(existing ? 'Maintenance record updated successfully.' : 'Maintenance record added successfully.');
    });
    q('[data-mm-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-mm-action]');
        if (!button) return;
        const record = records.find(item => item.workOrder === button.dataset.id);
        if (!record) return;
        if (button.dataset.mmAction === 'view') {
            viewingId = record.workOrder;
            q('[data-mm-view-content]').innerHTML = detailContent(record);
            q('[data-mm-view-overlay]').classList.add('is-open');
        } else if (button.dataset.mmAction === 'edit') {
            openForm(record);
        } else if (button.dataset.mmAction === 'print') {
            printRecord(record);
        } else if (button.dataset.mmAction === 'delete' && confirm(`Delete maintenance work order "${record.workOrder}"?`)) {
            records = records.filter(item => item.workOrder !== record.workOrder);
            save();
            render();
            toast('Maintenance record deleted.');
        }
    });
    q('[data-mm-close-form]').addEventListener('click', closeForm);
    q('[data-mm-cancel]').addEventListener('click', closeForm);
    section.querySelectorAll('[data-mm-close-view]').forEach(button => button.addEventListener('click', closeView));
    q('[data-mm-print-current]').addEventListener('click', () => {
        const record = records.find(item => item.workOrder === viewingId);
        if (record) printRecord(record);
    });
    section.querySelectorAll('.mm-overlay').forEach(overlay => overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('is-open'); }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            q('[data-mm-form-overlay]').classList.remove('is-open');
            closeView();
        }
    });
    render();
    return section;
}