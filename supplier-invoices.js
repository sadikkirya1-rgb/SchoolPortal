function createSupplierInvoicesModule() {
    const section = document.createElement('section');
    section.className = 'module supplier-invoices-module hidden';
    section.id = 'supplierInvoicesModule';
    section.innerHTML = `
        <header class="si-header"><div><h2>Supplier Invoices</h2><p>Manage supplier bills, approvals, payment status and outstanding balances</p></div><button class="si-button si-primary" type="button" data-si-new><i class="fas fa-plus"></i> New Invoice</button></header>
        <section class="si-stats" aria-label="Supplier invoice summary"><article class="si-stat"><div><span>Total Invoices</span><strong data-si-stat="total">0</strong></div><i class="fas fa-file-invoice"></i></article><article class="si-stat"><div><span>Pending Approval</span><strong data-si-stat="pending">0</strong></div><i class="fas fa-clock"></i></article><article class="si-stat"><div><span>Paid</span><strong data-si-stat="paid">0</strong></div><i class="fas fa-circle-check"></i></article><article class="si-stat"><div><span>Outstanding</span><strong data-si-stat="outstanding">$0</strong></div><i class="fas fa-wallet"></i></article><article class="si-stat"><div><span>Overdue</span><strong data-si-stat="overdue">$0</strong></div><i class="fas fa-triangle-exclamation"></i></article></section>
        <section class="si-content" aria-label="Supplier invoice records"><div class="si-toolbar"><label class="si-search"><i class="fas fa-search" aria-hidden="true"></i><span class="si-sr-only">Search supplier invoices</span><input type="search" data-si-search placeholder="Search invoice, supplier, PO..."></label><select class="si-filter" data-si-filter aria-label="Filter by status"><option value="">All Statuses</option><option>Draft</option><option>Pending Approval</option><option>Approved</option><option>Partially Paid</option><option>Paid</option><option>Overdue</option><option>Rejected</option><option>Cancelled</option></select><button class="si-button si-light" type="button" data-si-print-list><i class="fas fa-print"></i> Print Report</button></div>
            <div class="si-table-wrap"><table class="si-table"><thead><tr><th>Invoice No.</th><th>Supplier</th><th>PO / GRN</th><th>Invoice Date</th><th>Due Date</th><th>Total Amount</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead><tbody data-si-rows></tbody></table></div></section>
        <div class="si-overlay" data-si-form-overlay><section class="si-modal" role="dialog" aria-modal="true" aria-labelledby="si-form-title"><header class="si-modal-head"><h3 id="si-form-title">Create Supplier Invoice</h3><button class="si-close" type="button" data-si-close-form aria-label="Close">&times;</button></header>
            <form class="si-form" data-si-form><div class="si-grid">
                <label>Supplier / Vendor<input name="supplier" required placeholder="Enter supplier name"></label><label>Supplier Invoice No.<input name="invoiceNo" required placeholder="e.g. INV-2026-1001"></label><label>Purchase Order<input name="po" placeholder="e.g. PO-2026-014"></label>
                <label>Goods Receipt Note<input name="grn" placeholder="e.g. GRN-2026-001"></label><label>Invoice Date<input name="invoiceDate" type="date" required></label><label>Due Date<input name="dueDate" type="date" required></label>
                <label>Currency<select name="currency"><option value="USD">USD - US Dollar</option><option value="AED">AED - UAE Dirham</option><option value="EUR">EUR - Euro</option><option value="GBP">GBP - British Pound</option></select></label><label>Payment Terms<select name="paymentTerms"><option>Immediate</option><option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Net 60</option><option>Net 90</option></select></label><label>Invoice Status<select name="status"><option>Draft</option><option>Pending Approval</option><option>Approved</option><option>Partially Paid</option><option>Paid</option><option>Overdue</option><option>Rejected</option><option>Cancelled</option></select></label>
                <label>Payment Method<select name="paymentMethod"><option>Bank Transfer</option><option>Cheque</option><option>Credit Card</option><option>Cash</option><option>Online Transfer</option></select></label><label>Department<select name="department"><option>Procurement</option><option>Finance</option><option>Administration</option><option>IT</option><option>Operations</option><option>Human Resources</option><option>Warehouse</option><option>Facilities</option></select></label><label>Payment Reference<input name="paymentReference" placeholder="Transaction / cheque reference"></label>
                <label class="si-full">Invoice Notes<textarea name="notes" placeholder="Enter invoice notes, payment remarks, exceptions, etc."></textarea></label>
            </div>
            <div class="si-items"><div class="si-items-head"><h4>Invoice Items</h4><button class="si-button si-light" type="button" data-si-add-item><i class="fas fa-plus"></i> Add Item</button></div><div class="si-item-labels"><span>Description</span><span>Qty</span><span>Unit Price</span><span>Tax %</span><span>Line Total</span><span></span></div><div data-si-items></div>
                <div class="si-totals"><div><span>Subtotal</span><strong data-si-subtotal>$0.00</strong></div><div><span>Tax</span><strong data-si-tax>$0.00</strong></div><div><span>Paid Amount</span><strong data-si-paid>$0.00</strong></div><div class="si-grand"><span>Invoice Total</span><strong data-si-total>$0.00</strong></div></div>
                <label class="si-paid-field">Amount Already Paid<input name="paidAmount" type="number" min="0" step="0.01" value="0"></label>
            </div><footer class="si-modal-actions"><button class="si-button si-light" type="button" data-si-cancel>Cancel</button><button class="si-button si-primary" type="submit">Save Invoice</button></footer></form>
        </section></div>
        <div class="si-overlay" data-si-view-overlay><section class="si-modal" role="dialog" aria-modal="true" aria-labelledby="si-view-title"><header class="si-modal-head"><h3 id="si-view-title">Supplier Invoice Details</h3><button class="si-close" type="button" data-si-close-view aria-label="Close">&times;</button></header><div class="si-view" data-si-view-content></div><footer class="si-modal-actions"><button class="si-button si-light" type="button" data-si-close-view>Close</button><button class="si-button si-primary" type="button" data-si-print-current><i class="fas fa-print"></i> Print / PDF</button></footer></section></div>
        <div class="si-toast" role="status" aria-live="polite" data-si-toast></div>`;

    const storageKey = 'schoolSupplierInvoices';
    const seed = [
        { id: 'SI-2026-001', invoiceNo: 'INV-GT-4588', supplier: 'Gulf Technology LLC', po: 'PO-2026-014', grn: 'GRN-2026-001', invoiceDate: '2026-09-24', dueDate: '2026-10-24', currency: 'USD', paymentTerms: 'Net 30', status: 'Approved', paymentMethod: 'Bank Transfer', department: 'IT', paymentReference: '', paidAmount: 0, notes: 'Invoice matched against PO and GRN.', items: [{ description: 'Business Laptop', qty: 10, price: 1850, tax: 5 }, { description: 'Laptop Carry Bag', qty: 10, price: 45, tax: 5 }] },
        { id: 'SI-2026-002', invoiceNo: 'INV-AO-7712', supplier: 'Al Noor Office Supplies', po: 'PO-2026-018', grn: 'GRN-2026-002', invoiceDate: '2026-09-29', dueDate: '2026-10-14', currency: 'USD', paymentTerms: 'Net 15', status: 'Pending Approval', paymentMethod: 'Bank Transfer', department: 'Administration', paymentReference: '', paidAmount: 0, notes: 'Awaiting finance approval.', items: [{ description: 'Executive Office Chair', qty: 8, price: 250, tax: 5 }, { description: 'Office Desk', qty: 5, price: 950, tax: 5 }] },
        { id: 'SI-2026-003', invoiceNo: 'INV-SB-8820', supplier: 'Smart Business Solutions', po: 'PO-2026-021', grn: 'GRN-2026-003', invoiceDate: '2026-10-01', dueDate: '2026-10-31', currency: 'USD', paymentTerms: 'Net 30', status: 'Partially Paid', paymentMethod: 'Bank Transfer', department: 'IT', paymentReference: 'TRX-884201', paidAmount: 2000, notes: 'Partial payment processed.', items: [{ description: 'Laser Printer', qty: 8, price: 550, tax: 5 }, { description: 'Toner Cartridge', qty: 22, price: 65, tax: 5 }] },
        { id: 'SI-2026-004', invoiceNo: 'INV-PI-9014', supplier: 'Prime Industrial Trading', po: 'PO-2026-025', grn: 'GRN-2026-004', invoiceDate: '2026-08-20', dueDate: '2026-09-20', currency: 'USD', paymentTerms: 'Net 30', status: 'Overdue', paymentMethod: 'Cheque', department: 'Operations', paymentReference: '', paidAmount: 0, notes: 'Payment pending due to invoice verification.', items: [{ description: 'Safety Helmet', qty: 100, price: 18, tax: 5 }, { description: 'Safety Vest', qty: 95, price: 12, tax: 5 }] },
        { id: 'SI-2026-005', invoiceNo: 'INV-MF-2244', supplier: 'Modern Facilities Trading', po: 'PO-2026-030', grn: 'GRN-2026-007', invoiceDate: '2026-09-05', dueDate: '2026-10-05', currency: 'USD', paymentTerms: 'Net 30', status: 'Paid', paymentMethod: 'Bank Transfer', department: 'Facilities', paymentReference: 'TRX-778521', paidAmount: 3150, notes: 'Paid in full.', items: [{ description: 'Cleaning Equipment', qty: 5, price: 600, tax: 5 }] }
    ];
    let invoices;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        invoices = Array.isArray(stored) ? stored : seed;
    } catch (error) {
        invoices = seed;
    }
    let editingId = null;
    let viewingId = null;
    let toastTimer;
    const q = selector => section.querySelector(selector);
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    const money = (value, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value) || 0);
    const formatDate = value => {
        if (!value) return '—';
        const parsed = new Date(`${value}T00:00:00`);
        return Number.isNaN(parsed.getTime()) ? escape(value) : parsed.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };
    const lineSubtotal = item => (Number(item.qty) || 0) * (Number(item.price) || 0);
    const invoiceSubtotal = invoice => invoice.items.reduce((sum, item) => sum + lineSubtotal(item), 0);
    const invoiceTax = invoice => invoice.items.reduce((sum, item) => sum + lineSubtotal(item) * (Number(item.tax) || 0) / 100, 0);
    const invoiceTotal = invoice => invoiceSubtotal(invoice) + invoiceTax(invoice);
    const invoiceBalance = invoice => Math.max(0, invoiceTotal(invoice) - (Number(invoice.paidAmount) || 0));
    const statusClass = status => status.toLowerCase().replace(/\s+/g, '-');
    const dueClass = invoice => {
        if (['Paid', 'Cancelled'].includes(invoice.status)) return 'normal';
        const due = new Date(`${invoice.dueDate}T00:00:00`);
        if (Number.isNaN(due.getTime())) return 'normal';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days = Math.ceil((due - today) / 86400000);
        return days < 0 ? 'overdue' : days <= 7 ? 'soon' : 'normal';
    };
    const dueText = invoice => {
        if (invoice.status === 'Paid') return 'Paid';
        if (invoice.status === 'Cancelled') return 'Cancelled';
        const due = new Date(`${invoice.dueDate}T00:00:00`);
        if (Number.isNaN(due.getTime())) return 'Due date unavailable';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days = Math.ceil((due - today) / 86400000);
        if (days < 0) return `${Math.abs(days)} days overdue`;
        if (days === 0) return 'Due today';
        if (days === 1) return 'Due tomorrow';
        return `Due in ${days} days`;
    };
    const save = () => localStorage.setItem(storageKey, JSON.stringify(invoices));
    const toast = message => {
        const element = q('[data-si-toast]');
        element.textContent = message;
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 2400);
    };
    const formatCurrencyGroups = records => {
        const values = {};
        records.forEach(invoice => { values[invoice.currency] = (values[invoice.currency] || 0) + invoice.value(invoice.record); });
        const entries = Object.entries(values);
        return { label: entries.length <= 1 ? money(entries[0]?.[1] || 0, entries[0]?.[0] || 'USD').replace(/\.00$/, '') : 'Multiple', title: entries.map(([currency, amount]) => money(amount, currency)).join(' · ') };
    };
    const updateStats = () => {
        q('[data-si-stat="total"]').textContent = invoices.length;
        q('[data-si-stat="pending"]').textContent = invoices.filter(invoice => invoice.status === 'Pending Approval').length;
        q('[data-si-stat="paid"]').textContent = invoices.filter(invoice => invoice.status === 'Paid').length;
        const outstanding = formatCurrencyGroups(invoices.map(invoice => ({ currency: invoice.currency, record: invoice, value: invoiceBalance })));
        q('[data-si-stat="outstanding"]').textContent = outstanding.label;
        q('[data-si-stat="outstanding"]').title = outstanding.title;
        const overdue = formatCurrencyGroups(invoices.filter(invoice => invoice.status === 'Overdue').map(invoice => ({ currency: invoice.currency, record: invoice, value: invoiceBalance })));
        q('[data-si-stat="overdue"]').textContent = overdue.label;
        q('[data-si-stat="overdue"]').title = overdue.title;
    };
    const render = () => {
        const search = q('[data-si-search]').value.trim().toLowerCase();
        const status = q('[data-si-filter]').value;
        const filtered = invoices.filter(invoice => (!status || invoice.status === status) && (!search || JSON.stringify(invoice).toLowerCase().includes(search)));
        q('[data-si-rows]').innerHTML = filtered.length ? filtered.map(invoice => `<tr><td><strong class="si-id">${escape(invoice.invoiceNo)}</strong><small class="si-small">Record: ${escape(invoice.id)}</small></td><td><b>${escape(invoice.supplier)}</b><small class="si-small">${escape(invoice.department)}</small></td><td><strong>${escape(invoice.po || '—')}</strong><small class="si-small">${escape(invoice.grn || 'No GRN')}</small></td><td>${formatDate(invoice.invoiceDate)}</td><td><span class="si-due ${dueClass(invoice)}">${formatDate(invoice.dueDate)}</span><small class="si-small">${escape(dueText(invoice))}</small></td><td><strong>${money(invoiceTotal(invoice), invoice.currency)}</strong></td><td><strong>${money(invoiceBalance(invoice), invoice.currency)}</strong></td><td><span class="si-badge ${escape(statusClass(invoice.status))}">${escape(invoice.status)}</span></td><td><div class="si-actions"><button class="si-action" type="button" title="View" aria-label="View ${escape(invoice.invoiceNo)}" data-si-action="view" data-id="${escape(invoice.id)}"><i class="fas fa-eye"></i></button><button class="si-action" type="button" title="Edit" aria-label="Edit ${escape(invoice.invoiceNo)}" data-si-action="edit" data-id="${escape(invoice.id)}"><i class="fas fa-pen"></i></button><button class="si-action" type="button" title="Print" aria-label="Print ${escape(invoice.invoiceNo)}" data-si-action="print" data-id="${escape(invoice.id)}"><i class="fas fa-print"></i></button><button class="si-action si-delete" type="button" title="Delete" aria-label="Delete ${escape(invoice.invoiceNo)}" data-si-action="delete" data-id="${escape(invoice.id)}"><i class="fas fa-trash"></i></button></div></td></tr>`).join('') : '<tr><td colspan="9"><div class="si-empty">No supplier invoices found.</div></td></tr>';
        updateStats();
    };
    const calculate = () => {
        const currency = q('[name="currency"]').value;
        let subtotal = 0;
        let tax = 0;
        section.querySelectorAll('.si-item-row').forEach(row => {
            const base = (Number(row.querySelector('[name="qty"]').value) || 0) * (Number(row.querySelector('[name="price"]').value) || 0);
            const rate = Number(row.querySelector('[name="itemTax"]').value) || 0;
            const lineTax = base * rate / 100;
            subtotal += base;
            tax += lineTax;
            row.querySelector('[data-si-line-total]').textContent = money(base + lineTax, currency);
        });
        const paid = Number(q('[name="paidAmount"]').value) || 0;
        q('[data-si-subtotal]').textContent = money(subtotal, currency);
        q('[data-si-tax]').textContent = money(tax, currency);
        q('[data-si-paid]').textContent = money(paid, currency);
        q('[data-si-total]').textContent = money(subtotal + tax, currency);
    };
    const addItem = (item = { description: '', qty: 1, price: 0, tax: 5 }) => {
        const row = document.createElement('div');
        row.className = 'si-item-row';
        row.innerHTML = `<input name="description" aria-label="Description" placeholder="Item / service description" value="${escape(item.description)}" required><input name="qty" aria-label="Quantity" type="number" min="0" step="1" value="${Number(item.qty) || 0}" required><input name="price" aria-label="Unit price" type="number" min="0" step="0.01" value="${Number(item.price) || 0}" required><input name="itemTax" aria-label="Tax percentage" type="number" min="0" max="100" step="0.01" value="${Number(item.tax) || 0}" required><strong data-si-line-total>$0.00</strong><button class="si-remove-item" type="button" aria-label="Remove invoice item"><i class="fas fa-xmark"></i></button>`;
        q('[data-si-items]').appendChild(row);
        row.addEventListener('input', calculate);
        row.querySelector('.si-remove-item').addEventListener('click', () => { row.remove(); calculate(); });
        calculate();
    };
    const closeForm = () => q('[data-si-form-overlay]').classList.remove('is-open');
    const closeView = () => q('[data-si-view-overlay]').classList.remove('is-open');
    const openForm = invoice => {
        const form = q('[data-si-form]');
        form.reset();
        q('[data-si-items]').replaceChildren();
        editingId = invoice?.id ?? null;
        q('#si-form-title').textContent = invoice ? 'Edit Supplier Invoice' : 'Create Supplier Invoice';
        const today = new Date();
        form.elements.invoiceDate.value = invoice?.invoiceDate || today.toISOString().slice(0, 10);
        const due = new Date(today);
        due.setDate(due.getDate() + 30);
        form.elements.dueDate.value = invoice?.dueDate || due.toISOString().slice(0, 10);
        if (invoice) {
            ['supplier', 'invoiceNo', 'po', 'grn', 'currency', 'paymentTerms', 'status', 'paymentMethod', 'department', 'paymentReference', 'paidAmount', 'notes'].forEach(field => { form.elements[field].value = invoice[field] ?? ''; });
            invoice.items.forEach(addItem);
        } else {
            addItem(); addItem();
        }
        calculate();
        q('[data-si-form-overlay]').classList.add('is-open');
        form.elements.supplier.focus();
    };
    const details = invoice => `<header class="si-detail-header"><div><h2>${escape(invoice.invoiceNo)}</h2><p>${escape(invoice.supplier)} · ${escape(invoice.id)}</p></div><span class="si-badge ${escape(statusClass(invoice.status))}">${escape(invoice.status)}</span></header>
        <div class="si-summary-grid">${[['Supplier', invoice.supplier], ['Purchase Order', invoice.po || '—'], ['Goods Receipt Note', invoice.grn || '—'], ['Invoice Date', formatDate(invoice.invoiceDate)], ['Due Date', formatDate(invoice.dueDate)], ['Payment Terms', invoice.paymentTerms], ['Department', invoice.department], ['Payment Method', invoice.paymentMethod], ['Currency', invoice.currency], ['Invoice Total', money(invoiceTotal(invoice), invoice.currency)], ['Paid Amount', money(invoice.paidAmount, invoice.currency)], ['Outstanding', money(invoiceBalance(invoice), invoice.currency)], ['Payment Reference', invoice.paymentReference || '—']].map(([label, value]) => `<div class="si-summary-box"><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`).join('')}</div>
        <h4 class="si-details-title">Invoice Items</h4><div class="si-table-wrap"><table class="si-detail-table"><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th>Line Total</th></tr></thead><tbody>${invoice.items.map((item, index) => `<tr><td>${index + 1}</td><td><b>${escape(item.description)}</b></td><td>${Number(item.qty)}</td><td>${money(item.price, invoice.currency)}</td><td>${Number(item.tax)}%</td><td><b>${money(lineSubtotal(item) * (1 + Number(item.tax) / 100), invoice.currency)}</b></td></tr>`).join('')}</tbody></table></div>
        <div class="si-totals si-view-totals"><div><span>Subtotal</span><b>${money(invoiceSubtotal(invoice), invoice.currency)}</b></div><div><span>Tax</span><b>${money(invoiceTax(invoice), invoice.currency)}</b></div><div><span>Invoice Total</span><b>${money(invoiceTotal(invoice), invoice.currency)}</b></div><div><span>Paid</span><b>${money(invoice.paidAmount, invoice.currency)}</b></div><div class="si-grand"><span>Outstanding</span><b>${money(invoiceBalance(invoice), invoice.currency)}</b></div></div><div class="si-notes"><strong>Invoice Notes</strong><p>${escape(invoice.notes || 'No additional notes.')}</p></div>`;
    const printDocument = (title, html) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast('Allow pop-ups to print supplier invoices.');
        printWindow.document.write(`<!doctype html><html><head><title>${escape(title)}</title><meta charset="utf-8"><style>body{font:13px Arial,sans-serif;color:#172033;padding:32px}h1{font-size:23px;margin:0}p{color:#475569}.head{display:flex;justify-content:space-between;border-bottom:2px solid #172033;padding-bottom:14px;margin-bottom:20px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:16px 0;font-size:12px}.meta strong{display:block;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:11px}th{background:#f1f5f9}.totals{width:290px;margin:18px 0 0 auto}.totals div{display:flex;justify-content:space-between;padding:6px;border-bottom:1px solid #e2e8f0}.grand{font-size:16px;font-weight:bold}.notes{margin-top:24px}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:35px;margin-top:65px}.signatures span{border-top:1px solid #475569;padding-top:8px}@media print{body{padding:0}}</style></head><body>${html}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    const printInvoice = invoice => {
        const rows = invoice.items.map((item, index) => `<tr><td>${index + 1}</td><td>${escape(item.description)}</td><td>${Number(item.qty)}</td><td>${money(item.price, invoice.currency)}</td><td>${Number(item.tax)}%</td><td>${money(lineSubtotal(item) * (1 + Number(item.tax) / 100), invoice.currency)}</td></tr>`).join('');
        const html = `<header class="head"><div><h1>Supplier Invoice</h1><p>Finance &amp; Procurement Department</p></div><div><strong>${escape(invoice.invoiceNo)}</strong><br>Invoice Date: ${formatDate(invoice.invoiceDate)}<br>Due Date: ${formatDate(invoice.dueDate)}</div></header><div class="meta"><div><strong>Supplier</strong>${escape(invoice.supplier)}</div><div><strong>Record No.</strong>${escape(invoice.id)}</div><div><strong>Purchase Order</strong>${escape(invoice.po || '—')}</div><div><strong>Goods Receipt Note</strong>${escape(invoice.grn || '—')}</div><div><strong>Payment Terms</strong>${escape(invoice.paymentTerms)}</div><div><strong>Status</strong>${escape(invoice.status)}</div><div><strong>Department</strong>${escape(invoice.department)}</div><div><strong>Payment Method</strong>${escape(invoice.paymentMethod)}</div><div><strong>Payment Reference</strong>${escape(invoice.paymentReference || '—')}</div><div><strong>Currency</strong>${escape(invoice.currency)}</div></div><table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th>Line Total</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div><span>Subtotal</span><b>${money(invoiceSubtotal(invoice), invoice.currency)}</b></div><div><span>Tax</span><b>${money(invoiceTax(invoice), invoice.currency)}</b></div><div><span>Invoice Total</span><b>${money(invoiceTotal(invoice), invoice.currency)}</b></div><div><span>Paid Amount</span><b>${money(invoice.paidAmount, invoice.currency)}</b></div><div class="grand"><span>Outstanding Balance</span><b>${money(invoiceBalance(invoice), invoice.currency)}</b></div></div><div class="notes"><strong>Notes</strong><p>${escape(invoice.notes || 'No additional notes.')}</p></div><div class="signatures"><span>Prepared By</span><span>Checked By</span><span>Approved By</span></div>`;
        printDocument(invoice.invoiceNo, html);
    };

    q('[data-si-new]').addEventListener('click', () => openForm());
    q('[data-si-add-item]').addEventListener('click', () => addItem());
    q('[data-si-search]').addEventListener('input', render);
    q('[data-si-filter]').addEventListener('change', render);
    q('[name="currency"]').addEventListener('change', calculate);
    q('[name="paidAmount"]').addEventListener('input', calculate);
    q('[data-si-print-list]').addEventListener('click', () => {
        if (!invoices.length) return toast('No invoices available.');
        const rows = invoices.map(invoice => `<tr><td>${escape(invoice.invoiceNo)}</td><td>${escape(invoice.supplier)}</td><td>${escape(invoice.po || '—')} / ${escape(invoice.grn || '—')}</td><td>${formatDate(invoice.invoiceDate)}</td><td>${formatDate(invoice.dueDate)}</td><td>${money(invoiceTotal(invoice), invoice.currency)}</td><td>${money(invoiceBalance(invoice), invoice.currency)}</td><td>${escape(invoice.status)}</td></tr>`).join('');
        printDocument('Supplier Invoice Report', `<header class="head"><div><h1>Supplier Invoice Report</h1><p>Invoice and Outstanding Summary</p></div><div>${new Date().toLocaleDateString('en-US')}</div></header><table><thead><tr><th>Invoice No.</th><th>Supplier</th><th>PO / GRN</th><th>Invoice Date</th><th>Due Date</th><th>Total</th><th>Balance</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`);
    });
    q('[data-si-form]').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const items = [...section.querySelectorAll('.si-item-row')].map(row => ({ description: row.querySelector('[name="description"]').value.trim(), qty: Number(row.querySelector('[name="qty"]').value), price: Number(row.querySelector('[name="price"]').value), tax: Number(row.querySelector('[name="itemTax"]').value) })).filter(item => item.description);
        if (!items.length) return toast('Please add at least one invoice item.');
        if (items.some(item => item.qty < 0 || item.price < 0 || item.tax < 0 || item.tax > 100)) return toast('Check item quantities, prices and tax rates.');
        const existing = invoices.find(invoice => invoice.id === editingId);
        const invoiceNo = form.elements.invoiceNo.value.trim();
        if (invoices.some(invoice => invoice.invoiceNo.toLowerCase() === invoiceNo.toLowerCase() && invoice.id !== editingId)) return toast('That supplier invoice number already exists.');
        const sequence = Math.max(0, ...invoices.map(invoice => Number(invoice.id.match(/^SI-\d{4}-(\d+)$/)?.[1]) || 0)) + 1;
        const invoice = { id: existing?.id || `SI-${new Date().getFullYear()}-${String(sequence).padStart(3, '0')}`, invoiceNo, supplier: form.elements.supplier.value.trim(), po: form.elements.po.value.trim(), grn: form.elements.grn.value.trim(), invoiceDate: form.elements.invoiceDate.value, dueDate: form.elements.dueDate.value, currency: form.elements.currency.value, paymentTerms: form.elements.paymentTerms.value, status: form.elements.status.value, paymentMethod: form.elements.paymentMethod.value, department: form.elements.department.value, paymentReference: form.elements.paymentReference.value.trim(), paidAmount: Number(form.elements.paidAmount.value) || 0, notes: form.elements.notes.value.trim(), items };
        if (invoice.paidAmount < 0 || invoice.paidAmount > invoiceTotal(invoice)) return toast('Paid amount must be between zero and the invoice total.');
        if (invoice.status === 'Paid') invoice.paidAmount = invoiceTotal(invoice);
        if (invoice.status === 'Partially Paid' && (invoice.paidAmount <= 0 || invoice.paidAmount >= invoiceTotal(invoice))) return toast('A partially paid invoice needs a payment below the invoice total.');
        if (existing) invoices = invoices.map(item => item.id === editingId ? invoice : item);
        else invoices.unshift(invoice);
        save();
        closeForm();
        render();
        toast(existing ? 'Supplier invoice updated.' : 'Supplier invoice created.');
    });
    q('[data-si-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-si-action]');
        if (!button) return;
        const invoice = invoices.find(item => item.id === button.dataset.id);
        if (!invoice) return;
        if (button.dataset.siAction === 'view') {
            viewingId = invoice.id;
            q('[data-si-view-content]').innerHTML = details(invoice);
            q('[data-si-view-overlay]').classList.add('is-open');
        } else if (button.dataset.siAction === 'edit') {
            openForm(invoice);
        } else if (button.dataset.siAction === 'print') {
            printInvoice(invoice);
        } else if (button.dataset.siAction === 'delete' && confirm(`Delete supplier invoice ${invoice.invoiceNo}?`)) {
            invoices = invoices.filter(item => item.id !== invoice.id);
            save();
            render();
            toast('Supplier invoice deleted.');
        }
    });
    q('[data-si-close-form]').addEventListener('click', closeForm);
    q('[data-si-cancel]').addEventListener('click', closeForm);
    section.querySelectorAll('[data-si-close-view]').forEach(button => button.addEventListener('click', closeView));
    q('[data-si-print-current]').addEventListener('click', () => {
        const invoice = invoices.find(item => item.id === viewingId);
        if (invoice) printInvoice(invoice);
    });
    section.querySelectorAll('.si-overlay').forEach(overlay => overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('is-open'); }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            q('[data-si-form-overlay]').classList.remove('is-open');
            closeView();
        }
    });
    render();
    return section;
}