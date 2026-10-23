function createPurchaseRequestsModule() {
    const sec = document.createElement('section');
    sec.className = 'module purchase-requests-module hidden';
    sec.id = 'purchaseRequestsModule';
    sec.innerHTML = `
        <header class="pr-header">
            <div><h2>Purchase Requests</h2><p>Manage, review and track procurement requests</p></div>
            <button class="pr-button pr-primary" type="button" data-pr-new><i class="fas fa-plus"></i> Add Purchase Request</button>
        </header>
        <section class="pr-stats" aria-label="Purchase request summary">
            <article class="pr-stat"><div><span>Total Requests</span><strong data-pr-stat="total">0</strong></div><i class="fas fa-file-circle-plus"></i></article>
            <article class="pr-stat"><div><span>Pending Approval</span><strong data-pr-stat="pending">0</strong></div><i class="fas fa-clock"></i></article>
            <article class="pr-stat"><div><span>Approved</span><strong data-pr-stat="approved">0</strong></div><i class="fas fa-circle-check"></i></article>
            <article class="pr-stat"><div><span>Total Value</span><strong data-pr-stat="value">$0</strong></div><i class="fas fa-dollar-sign"></i></article>
        </section>
        <section class="pr-content" aria-label="Purchase request records">
            <div class="pr-toolbar">
                <label class="pr-search"><i class="fas fa-search" aria-hidden="true"></i><span class="sr-only">Search requests</span><input type="search" data-pr-search placeholder="Search requests..."></label>
                <select class="pr-filter" data-pr-filter aria-label="Filter by status"><option value="">All Statuses</option><option>Draft</option><option>Pending</option><option>Approved</option><option>Rejected</option></select>
                <button class="pr-button pr-light" type="button" data-pr-print-list><i class="fas fa-print"></i> Print List</button>
            </div>
            <div class="pr-table-wrap"><table class="pr-table"><thead><tr><th>Request ID</th><th>Requester</th><th>Department</th><th>Items</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody data-pr-rows></tbody></table></div>
        </section>
        <div class="pr-overlay" data-pr-form-overlay>
            <section class="pr-modal" role="dialog" aria-modal="true" aria-labelledby="pr-form-title">
                <header class="pr-modal-head"><h3 id="pr-form-title">New Purchase Request</h3><button class="pr-close" type="button" data-pr-close-form aria-label="Close">&times;</button></header>
                <form class="pr-form" data-pr-form>
                    <div class="pr-grid">
                        <label>Department<select name="department" required><option value="">Select department</option><option>Front Office Department</option><option>Academic Department</option><option>E-Learning Department</option><option>Operations Department</option><option>Student Life Department</option><option>Human Resources Department</option><option>Payroll Department</option><option>Finance Department</option><option>Procurement Department</option><option>Assets &amp; Security Department</option><option>Communication Department</option></select></label>
                        <label class="pr-requester-field">Requester Name<select name="requester" required disabled><option value="">Select department first</option></select></label>
                        <label>Request Date<input name="date" type="date" required></label>
                        <label>Priority<select name="priority"><option>Normal</option><option>High</option><option>Urgent</option></select></label>
                        <label class="pr-full">Purpose / Justification<textarea name="purpose" placeholder="Explain why this purchase is required..."></textarea></label>
                    </div>
                    <div class="pr-items">
                        <div class="pr-items-head"><h4>Purchase Items</h4><button class="pr-button pr-light" type="button" data-pr-add-item><i class="fas fa-plus"></i> Add Item</button></div>
                        <div data-pr-items></div>
                        <div class="pr-totals"><div><span>Subtotal</span><strong data-pr-subtotal>$0.00</strong></div><div><span>Tax (5%)</span><strong data-pr-tax>$0.00</strong></div><div class="pr-grand"><span>Total</span><strong data-pr-total>$0.00</strong></div></div>
                    </div>
                    <footer class="pr-modal-actions"><button class="pr-button pr-light" type="button" data-pr-cancel>Cancel</button><button class="pr-button pr-light" type="submit" data-pr-status="Draft">Save Draft</button><button class="pr-button pr-primary" type="submit" data-pr-status="Pending">Submit for Approval</button></footer>
                </form>
            </section>
        </div>
        <div class="pr-overlay" data-pr-view-overlay>
            <section class="pr-modal" role="dialog" aria-modal="true" aria-labelledby="pr-view-title">
                <header class="pr-modal-head"><h3 id="pr-view-title">Purchase Request Details</h3><button class="pr-close" type="button" data-pr-close-view aria-label="Close">&times;</button></header>
                <div class="pr-view" data-pr-view-content></div>
                <footer class="pr-modal-actions"><button class="pr-button pr-light" type="button" data-pr-close-view>Close</button><button class="pr-button pr-primary" type="button" data-pr-print-current><i class="fas fa-print"></i> Print / PDF</button></footer>
            </section>
        </div>
        <div class="pr-toast" role="status" aria-live="polite" data-pr-toast></div>`;

    const storageKey = 'schoolPurchaseRequests';

    let requests;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        requests = Array.isArray(stored) ? stored : [];
    } catch (error) {
        requests = [];
    }
    let editId = null;
    let viewId = null;
    let toastTimer;

    const q = selector => sec.querySelector(selector);
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);
    const form = q('[data-pr-form]');
    const departmentSelect = form.elements.department;
    const requesterSelect = form.elements.requester;
    const staffBySource = new Map();
    const legacyStaff = [];
    ['school_staff_directory', 'school_staff', 'school_teachers'].forEach(key => {
        try {
            const records = JSON.parse(localStorage.getItem(key) || '[]');
            if (Array.isArray(records)) legacyStaff.push(...records);
        } catch (error) {
            console.error(`Unable to load staff records from ${key}.`, error);
        }
    });
    staffBySource.set('local', legacyStaff);
    const normalizedDepartment = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const departmentMatches = {
        'Front Office Department': ['front office', 'front desk', 'reception', 'receptionist', 'admissions', 'administration'],
        'Academic Department': ['academic', 'academics', 'teaching', 'mathematics', 'science', 'english', 'languages', 'ict', 'it', 'sports', 'library'],
        'E-Learning Department': ['e-learning', 'elearning', 'online learning'],
        'Operations Department': ['operations', 'transport', 'health', 'infirmary', 'boarding', 'inventory'],
        'Student Life Department': ['student life', 'student affairs', 'sports', 'clubs', 'counseling', 'discipline'],
        'Human Resources Department': ['human resources', 'hr'],
        'Payroll Department': ['payroll'],
        'Finance Department': ['finance', 'accounts', 'accounting'],
        'Procurement Department': ['procurement', 'purchasing', 'suppliers'],
        'Assets & Security Department': ['assets', 'security', 'maintenance'],
        'Communication Department': ['communication', 'communications', 'parents', 'sms', 'notice board']
    };
    const departmentForValue = value => {
        const normalized = normalizedDepartment(value);
        return Object.keys(departmentMatches).find(department =>
            normalizedDepartment(department) === normalized
            || departmentMatches[department].some(alias => normalizedDepartment(alias) === normalized)
        ) || '';
    };
    const staffName = staff => String(staff.fullName || staff.name || staff.staffName || [staff.firstName, staff.middleName, staff.lastName].filter(Boolean).join(' ')).trim();
    const staffDepartment = staff => String(staff.department || staff.departmentName || staff.staffDepartment || '').trim();
    const staffForDepartment = department => {
        const accepted = (departmentMatches[department] || []).map(normalizedDepartment);
        return [...staffBySource.values()].flat().filter(staff => {
            const status = normalizedDepartment(staff.status);
            if (['inactive', 'resigned', 'terminated', 'deleted'].includes(status) || staff.deleted === true) return false;
            const normalized = normalizedDepartment(staffDepartment(staff));
            return normalized && (normalized === normalizedDepartment(department) || accepted.includes(normalized));
        }).map(staff => staffName(staff)).filter(Boolean).filter((name, index, names) => names.indexOf(name) === index).sort((left, right) => left.localeCompare(right));
    };
    const refreshRequesterOptions = selectedName => {
        const department = departmentSelect.value;
        const names = staffForDepartment(department);
        requesterSelect.replaceChildren(new Option(
            !department ? 'Select department first' : names.length ? 'Select staff member' : 'No staff found in this department',
            ''
        ));
        names.forEach(name => requesterSelect.add(new Option(name, name)));
        if (selectedName && !names.includes(selectedName)) requesterSelect.add(new Option(`${selectedName} (saved requester)`, selectedName));
        requesterSelect.value = selectedName || '';
        requesterSelect.disabled = !department;
    };
    departmentSelect.addEventListener('change', () => {
        refreshRequesterOptions();
        updateRequestSummary();
    });
    const staffApi = window.schoolPortalData;
    if (staffApi?.subscribe) {
        ['staffDirectory', 'staff', 'teachers'].forEach(collection => {
            void staffApi.subscribe(collection, records => {
                staffBySource.set(collection, records);
                refreshRequesterOptions(requesterSelect.value);
            }).catch(error => {
                console.error(`Unable to load ${collection} records for purchase requesters.`, error);
            });
        });
    }
    const formMain = document.createElement('div');
    formMain.className = 'pr-form-main';
    const formFooter = form.querySelector('.pr-modal-actions');
    const summaryPanel = document.createElement('aside');
    summaryPanel.className = 'pr-live-summary';
    summaryPanel.innerHTML = '<h4>Request Summary</h4><p>Review requester, items, and total before saving.</p><div data-pr-live-fields></div><div class="pr-summary-row"><span>Status</span><strong data-pr-live-status>Draft</strong></div><h5>Items</h5><div data-pr-live-items></div><div class="pr-live-total"><span>Estimated total</span><strong data-pr-live-total>$0.00</strong></div>';
    formMain.append(form.querySelector('.pr-grid'), form.querySelector('.pr-items'));
    form.insertBefore(formMain, formFooter);
    form.insertBefore(summaryPanel, formFooter);
    const subtotal = request => request.items.reduce((sum, item) => sum + Number(item[1]) * Number(item[2]), 0);
    const total = request => subtotal(request) * 1.05;
    const formatDate = value => {
        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime()) ? escape(value) : date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };
    const save = () => localStorage.setItem(storageKey, JSON.stringify(requests));
    const toast = message => {
        const element = q('[data-pr-toast]');
        element.textContent = message;
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 2400);
    };
    const updateStats = () => {
        q('[data-pr-stat="total"]').textContent = requests.length;
        q('[data-pr-stat="pending"]').textContent = requests.filter(request => request.status === 'Pending').length;
        q('[data-pr-stat="approved"]').textContent = requests.filter(request => request.status === 'Approved').length;
        q('[data-pr-stat="value"]').textContent = money(requests.reduce((sum, request) => sum + total(request), 0)).replace(/\.00$/, '');
    };
    const render = () => {
        const search = q('[data-pr-search]').value.trim().toLowerCase();
        const status = q('[data-pr-filter]').value;
        const found = requests.filter(request => (!status || request.status === status) && (!search || JSON.stringify(request).toLowerCase().includes(search)));
        q('[data-pr-rows]').innerHTML = found.length ? found.map(request => {
            const itemCount = request.items.reduce((sum, item) => sum + Number(item[1]), 0);
            const initials = request.requester.split(/\s+/).map(part => part[0] || '').slice(0, 2).join('').toUpperCase();
            const workflowActions = request.status === 'Pending'
                ? `<button class="pr-action pr-approve" type="button" title="Approve request" aria-label="Approve ${escape(request.id)}" data-pr-action="approve" data-id="${escape(request.id)}"><i class="fas fa-check"></i><span>Approve</span></button><button class="pr-action pr-reject" type="button" title="Reject request" aria-label="Reject ${escape(request.id)}" data-pr-action="reject" data-id="${escape(request.id)}"><i class="fas fa-xmark"></i><span>Reject</span></button>`
                : ['Draft', 'Rejected'].includes(request.status)
                    ? `<button class="pr-action pr-submit" type="button" title="Submit for approval" aria-label="Submit ${escape(request.id)} for approval" data-pr-action="submit" data-id="${escape(request.id)}"><i class="fas fa-paper-plane"></i><span>Submit</span></button>`
                    : '';
            const editAction = ['Draft', 'Rejected'].includes(request.status)
                ? `<button class="pr-action" type="button" title="Edit" aria-label="Edit ${escape(request.id)}" data-pr-action="edit" data-id="${escape(request.id)}"><i class="fas fa-pen"></i></button>`
                : '';
            return `<tr><td><strong class="pr-id">${escape(request.id)}</strong></td><td><span class="pr-requester"><span class="pr-avatar">${escape(initials)}</span><b>${escape(request.requester)}</b></span></td><td>${escape(request.department)}</td><td>${itemCount} item(s)</td><td><strong>${money(total(request))}</strong></td><td>${formatDate(request.date)}</td><td><span class="pr-badge ${escape(request.status.toLowerCase())}">${escape(request.status)}</span></td><td><div class="pr-actions"><button class="pr-action" type="button" title="View" aria-label="View ${escape(request.id)}" data-pr-action="view" data-id="${escape(request.id)}"><i class="fas fa-eye"></i></button>${editAction}<button class="pr-action" type="button" title="Print" aria-label="Print ${escape(request.id)}" data-pr-action="print" data-id="${escape(request.id)}"><i class="fas fa-print"></i></button>${workflowActions}<button class="pr-action pr-delete" type="button" title="Delete" aria-label="Delete ${escape(request.id)}" data-pr-action="delete" data-id="${escape(request.id)}"><i class="fas fa-trash"></i></button></div></td></tr>`;
        }).join('') : '<tr><td colspan="8"><div class="pr-empty">No purchase requests found.</div></td></tr>';
        updateStats();
    };
    const updateRequestSummary = () => {
        const fields = summaryPanel.querySelector('[data-pr-live-fields]');
        fields.replaceChildren(...Array.from(formMain.querySelectorAll('.pr-grid input, .pr-grid select, .pr-grid textarea'), field => {
            const label = field.closest('label');
            const row = document.createElement('div');
            const name = document.createElement('span');
            const value = document.createElement('strong');
            row.className = 'pr-summary-row';
            name.textContent = label?.childNodes[0].textContent.trim() || field.name;
            value.textContent = field.value || '-';
            row.append(name, value);
            return row;
        }));
        summaryPanel.querySelector('[data-pr-live-status]').textContent = requests.find(request => request.id === editId)?.status || 'Draft';
        const itemList = summaryPanel.querySelector('[data-pr-live-items]');
        itemList.replaceChildren(...Array.from(form.querySelectorAll('.pr-item-row'), itemRow => {
            const item = document.createElement('div');
            const name = document.createElement('span');
            const details = document.createElement('strong');
            item.className = 'pr-summary-item';
            name.textContent = itemRow.querySelector('[name="itemName"]').value || 'Item';
            details.textContent = `Qty ${itemRow.querySelector('[name="quantity"]').value || '0'} · ${money(itemRow.querySelector('[name="price"]').value)} each · ${money(itemRow.querySelector('[name="lineTotal"]').value.replace(/[^0-9.-]/g, ''))} total`;
            item.append(name, details);
            return item;
        }));
        summaryPanel.querySelector('[data-pr-live-total]').textContent = q('[data-pr-total]').textContent;
    };
    const calculate = () => {
        let sum = 0;
        sec.querySelectorAll('.pr-item-row').forEach(row => {
            const quantity = Number(row.querySelector('[name="quantity"]').value) || 0;
            const price = Number(row.querySelector('[name="price"]').value) || 0;
            const rowTotal = quantity * price;
            sum += rowTotal;
            row.querySelector('[name="lineTotal"]').value = money(rowTotal);
        });
        q('[data-pr-subtotal]').textContent = money(sum);
        q('[data-pr-tax]').textContent = money(sum * 0.05);
        q('[data-pr-total]').textContent = money(sum * 1.05);
        updateRequestSummary();
    };
    const addItem = (item = ['', 1, 0]) => {
        const row = document.createElement('div');
        row.className = 'pr-item-row';
        row.innerHTML = `<input name="itemName" aria-label="Item or product" placeholder="Item / product" value="${escape(item[0])}" required><input name="quantity" aria-label="Quantity" type="number" min="1" step="1" value="${Number(item[1]) || 1}" required><input name="price" aria-label="Unit price" type="number" min="0" step="0.01" value="${Number(item[2]) || 0}" required><input name="lineTotal" aria-label="Line total" value="${money(Number(item[1]) * Number(item[2]))}" readonly><button class="pr-remove-item" type="button" aria-label="Remove item"><i class="fas fa-xmark"></i></button>`;
        q('[data-pr-items]').appendChild(row);
        row.addEventListener('input', calculate);
        row.querySelector('.pr-remove-item').addEventListener('click', () => { row.remove(); calculate(); });
    };
    const closeForm = () => q('[data-pr-form-overlay]').classList.remove('is-open');
    const closeView = () => q('[data-pr-view-overlay]').classList.remove('is-open');
    const openForm = request => {
        form.reset();
        refreshRequesterOptions();
        q('[data-pr-items]').replaceChildren();
        editId = request?.id ?? null;
        q('#pr-form-title').textContent = request ? 'Edit Purchase Request' : 'New Purchase Request';
        form.elements.date.value = request?.date || new Date().toISOString().slice(0, 10);
        if (request) {
            const department = departmentForValue(request.department);
            if (department) {
                form.elements.department.value = department;
            } else if (request.department) {
                departmentSelect.add(new Option(request.department, request.department));
                form.elements.department.value = request.department;
            }
            refreshRequesterOptions(request.requester);
            form.elements.priority.value = request.priority;
            form.elements.purpose.value = request.purpose || '';
            request.items.forEach(addItem);
        } else {
            addItem();
        }
        calculate();
        q('[data-pr-form-overlay]').classList.add('is-open');
        updateRequestSummary();
        form.elements.requester.focus();
    };
    const requestDetails = request => `
        <div class="pr-detail-grid">
            <div><strong>Request ID</strong><p>${escape(request.id)}</p></div><div><strong>Status</strong><p><span class="pr-badge ${escape(request.status.toLowerCase())}">${escape(request.status)}</span></p></div>
            <div><strong>Requester</strong><p>${escape(request.requester)}</p></div><div><strong>Department</strong><p>${escape(request.department)}</p></div>
            <div><strong>Date</strong><p>${formatDate(request.date)}</p></div><div><strong>Priority</strong><p>${escape(request.priority)}</p></div>
            ${request.submittedAt ? `<div><strong>Submitted</strong><p>${formatDate(request.submittedAt.slice(0, 10))}</p></div>` : ''}
            ${request.decisionAt ? `<div><strong>${request.status === 'Approved' ? 'Approved' : 'Rejected'} by</strong><p>${escape(request.decisionBy || 'Approver')} · ${formatDate(request.decisionAt.slice(0, 10))}</p></div>` : ''}
            ${request.rejectionReason ? `<div class="pr-full"><strong>Rejection reason</strong><p>${escape(request.rejectionReason)}</p></div>` : ''}
            <div class="pr-full"><strong>Purpose</strong><p>${escape(request.purpose || 'Not provided')}</p></div>
        </div>
        <h4>Items</h4><div class="pr-table-wrap"><table class="pr-table pr-detail-table"><thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${request.items.map(item => `<tr><td>${escape(item[0])}</td><td>${Number(item[1])}</td><td>${money(item[2])}</td><td>${money(item[1] * item[2])}</td></tr>`).join('')}</tbody></table></div>
        <div class="pr-totals"><div><span>Subtotal</span><strong>${money(subtotal(request))}</strong></div><div><span>Tax (5%)</span><strong>${money(subtotal(request) * 0.05)}</strong></div><div class="pr-grand"><span>Total</span><strong>${money(total(request))}</strong></div></div>`;
    const printDocument = (title, content) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast('Allow pop-ups to print this request.');
        printWindow.document.write(`<!doctype html><html><head><title>${escape(title)}</title><meta charset="utf-8"><style>body{font:14px Arial,sans-serif;color:#172033;padding:32px}h1{font-size:24px;margin:0}p{color:#475569}.head{display:flex;justify-content:space-between;border-bottom:2px solid #172033;padding-bottom:14px;margin-bottom:22px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}.meta strong{display:block;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #cbd5e1;padding:9px;text-align:left}th{background:#f1f5f9}.totals{width:280px;margin:18px 0 0 auto}.totals div{display:flex;justify-content:space-between;padding:6px;border-bottom:1px solid #e2e8f0}.grand{font-size:17px;font-weight:bold}.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:35px;margin-top:70px}.sign span{border-top:1px solid #475569;padding-top:8px}@media print{body{padding:0}}</style></head><body>${content}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    const printRequest = request => {
        const content = `<header class="head"><div><h1>Purchase Request</h1><p>Procurement Request Document</p></div><div><strong>${escape(request.id)}</strong><br>${formatDate(request.date)}</div></header><div class="meta"><div><strong>Requester</strong>${escape(request.requester)}</div><div><strong>Department</strong>${escape(request.department)}</div><div><strong>Priority</strong>${escape(request.priority)}</div><div><strong>Status</strong>${escape(request.status)}</div><div><strong>Purpose</strong>${escape(request.purpose || 'Not provided')}</div></div><table><thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${request.items.map(item => `<tr><td>${escape(item[0])}</td><td>${Number(item[1])}</td><td>${money(item[2])}</td><td>${money(item[1] * item[2])}</td></tr>`).join('')}</tbody></table><div class="totals"><div><span>Subtotal</span><strong>${money(subtotal(request))}</strong></div><div><span>Tax (5%)</span><strong>${money(subtotal(request) * 0.05)}</strong></div><div class="grand"><span>Total</span><strong>${money(total(request))}</strong></div></div><div class="sign"><span>Requested By</span><span>Department Approval</span><span>Procurement Approval</span></div>`;
        printDocument(request.id, content);
    };

    q('[data-pr-new]').addEventListener('click', () => openForm());
    q('[data-pr-add-item]').addEventListener('click', () => addItem());
    q('[data-pr-search]').addEventListener('input', render);
    q('[data-pr-filter]').addEventListener('change', render);
    form.addEventListener('input', updateRequestSummary);
    form.addEventListener('change', updateRequestSummary);
    q('[data-pr-print-list]').addEventListener('click', () => {
        const rows = requests.map(request => `<tr><td>${escape(request.id)}</td><td>${escape(request.requester)}</td><td>${escape(request.department)}</td><td>${request.items.reduce((sum, item) => sum + Number(item[1]), 0)}</td><td>${money(total(request))}</td><td>${formatDate(request.date)}</td><td>${escape(request.status)}</td></tr>`).join('');
        printDocument('Purchase Request List', `<header class="head"><div><h1>Purchase Requests</h1><p>Procurement Request Summary</p></div><div>${new Date().toLocaleDateString('en-US')}</div></header><table><thead><tr><th>Request ID</th><th>Requester</th><th>Department</th><th>Items</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`);
    });
    q('[data-pr-form]').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const items = [...sec.querySelectorAll('.pr-item-row')].map(row => [row.querySelector('[name="itemName"]').value.trim(), Number(row.querySelector('[name="quantity"]').value), Number(row.querySelector('[name="price"]').value)]);
        if (!items.length || items.some(item => !item[0] || item[1] < 1 || item[2] < 0)) return toast('Add at least one valid purchase item.');
        const existing = requests.find(request => request.id === editId);
        const year = new Date().getFullYear();
        const nextNumber = Math.max(0, ...requests.map(request => Number(request.id.match(/^PR-\d{4}-(\d+)$/)?.[1]) || 0)) + 1;
        const nextStatus = event.submitter?.dataset.prStatus || (existing?.status === 'Pending' ? 'Pending' : 'Draft');
        const request = {
            ...existing,
            id: existing?.id || `PR-${year}-${String(nextNumber).padStart(3, '0')}`,
            requester: form.elements.requester.value.trim(),
            department: form.elements.department.value,
            date: form.elements.date.value,
            status: nextStatus,
            priority: form.elements.priority.value,
            purpose: form.elements.purpose.value.trim(),
            items,
            ...(nextStatus === 'Pending' ? { submittedAt: existing?.submittedAt || new Date().toISOString(), rejectionReason: '' } : {})
        };
        if (existing) requests = requests.map(item => item.id === editId ? request : item);
        else requests.unshift(request);
        save();
        closeForm();
        render();
        if (nextStatus === 'Pending' && existing?.status !== 'Pending') {
            window.dispatchEvent(new CustomEvent('school-portal-approval-update'));
        }
        toast(nextStatus === 'Pending'
            ? existing?.status === 'Pending' ? 'Purchase request updated and remains pending approval.' : 'Purchase request submitted for approval.'
            : existing ? 'Purchase request draft saved.' : 'Purchase request draft created.');
    });
    q('[data-pr-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-pr-action]');
        if (!button) return;
        const request = requests.find(item => item.id === button.dataset.id);
        if (!request) return;
        if (button.dataset.prAction === 'view') {
            viewId = request.id;
            q('[data-pr-view-content]').innerHTML = requestDetails(request);
            q('[data-pr-view-overlay]').classList.add('is-open');
        } else if (button.dataset.prAction === 'edit') {
            if (!['Draft', 'Rejected'].includes(request.status)) return;
            openForm(request);
        } else if (button.dataset.prAction === 'print') {
            printRequest(request);
        } else if (button.dataset.prAction === 'submit') {
            request.status = 'Pending';
            request.submittedAt = new Date().toISOString();
            request.rejectionReason = '';
            save();
            render();
            window.dispatchEvent(new CustomEvent('school-portal-approval-update'));
            toast('Purchase request submitted for approval.');
        } else if (button.dataset.prAction === 'approve' || button.dataset.prAction === 'reject') {
            const isApproval = button.dataset.prAction === 'approve';
            const rejectionReason = isApproval ? '' : window.prompt(`Why are you rejecting ${request.id}?`);
            if (!isApproval && rejectionReason === null) return;
            if (!isApproval && !rejectionReason.trim()) return toast('Enter a reason before rejecting this request.');
            request.status = isApproval ? 'Approved' : 'Rejected';
            request.decisionAt = new Date().toISOString();
            request.decisionBy = window.schoolPortalData?.getIdentity?.()?.displayName
                || window.schoolPortalData?.getIdentity?.()?.name
                || window.schoolPortalData?.getIdentity?.()?.uid
                || 'Approver';
            if (!isApproval) request.rejectionReason = rejectionReason.trim();
            save();
            render();
            window.dispatchEvent(new CustomEvent('school-portal-approval-update'));
            toast(isApproval ? 'Purchase request approved.' : 'Purchase request rejected.');
        } else if (button.dataset.prAction === 'delete' && confirm(`Delete purchase request ${request.id}?`)) {
            requests = requests.filter(item => item.id !== request.id);
            save();
            render();
            toast('Purchase request deleted.');
        }
    });
    q('[data-pr-close-form]').addEventListener('click', closeForm);
    q('[data-pr-cancel]').addEventListener('click', closeForm);
    sec.querySelectorAll('[data-pr-close-view]').forEach(button => button.addEventListener('click', closeView));
    q('[data-pr-print-current]').addEventListener('click', () => {
        const request = requests.find(item => item.id === viewId);
        if (request) printRequest(request);
    });
    sec.querySelectorAll('.pr-overlay').forEach(overlay => overlay.addEventListener('click', event => {
        if (event.target === overlay) overlay.classList.remove('is-open');
    }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            q('[data-pr-form-overlay]').classList.remove('is-open');
            closeView();
        }
    });
    render();
    return sec;
}