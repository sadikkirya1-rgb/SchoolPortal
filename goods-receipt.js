function createGoodsReceiptModule() {
    const section = document.createElement('section');
    section.className = 'module goods-receipt-module hidden';
    section.id = 'goodsReceiptModule';
    section.innerHTML = `
        <header class="grn-header"><div><h2>Goods Receipt Notes</h2><p>Manage received goods, delivery notes, inspections and warehouse receipts</p></div><button class="grn-button grn-primary" type="button" data-grn-new><i class="fas fa-plus"></i> New GRN</button></header>
        <section class="grn-stats" aria-label="Goods receipt summary"><article class="grn-stat"><div><span>Total GRNs</span><strong data-grn-stat="total">0</strong></div><i class="fas fa-file-lines"></i></article><article class="grn-stat"><div><span>Pending Inspection</span><strong data-grn-stat="pending">0</strong></div><i class="fas fa-clock"></i></article><article class="grn-stat"><div><span>Completed</span><strong data-grn-stat="completed">0</strong></div><i class="fas fa-circle-check"></i></article><article class="grn-stat"><div><span>Total Received Value</span><strong data-grn-stat="value">$0</strong></div><i class="fas fa-dollar-sign"></i></article></section>
        <section class="grn-content" aria-label="Goods receipt records"><div class="grn-toolbar"><label class="grn-search"><i class="fas fa-search" aria-hidden="true"></i><span class="grn-sr-only">Search goods receipts</span><input type="search" data-grn-search placeholder="Search GRN, supplier, PO, delivery note..."></label><select class="grn-filter" data-grn-filter aria-label="Filter by status"><option value="">All Statuses</option><option>Draft</option><option>Pending Inspection</option><option>Partial</option><option>Completed</option><option>Rejected</option></select><button class="grn-button grn-light" type="button" data-grn-print-list><i class="fas fa-print"></i> Print Report</button></div>
            <div class="grn-table-wrap"><table class="grn-table"><thead><tr><th>GRN No.</th><th>Supplier</th><th>Purchase Order</th><th>Delivery Note</th><th>Receipt Date</th><th>Warehouse</th><th>Received Value</th><th>Status</th><th>Actions</th></tr></thead><tbody data-grn-rows></tbody></table></div></section>
        <div class="grn-overlay" data-grn-form-overlay><section class="grn-modal" role="dialog" aria-modal="true" aria-labelledby="grn-form-title"><header class="grn-modal-head"><h3 id="grn-form-title">Create Goods Receipt Note</h3><button class="grn-close" type="button" data-grn-close-form aria-label="Close">&times;</button></header>
            <form class="grn-form" data-grn-form><div class="grn-grid">
                <label>Supplier / Vendor<input name="supplier" required placeholder="Enter supplier name"></label><label>Purchase Order<input name="po" required placeholder="e.g. PO-2026-014"></label>
                <label>Delivery Note No.<input name="deliveryNote" required placeholder="Supplier delivery note"></label><label>Supplier Invoice No.<input name="invoice" placeholder="Invoice reference"></label>
                <label>Receipt Date<input name="receiptDate" type="date" required></label><label>Inspection Date<input name="inspectionDate" type="date"></label>
                <label>Warehouse / Location<select name="warehouse"><option>Main Warehouse</option><option>Central Store</option><option>North Warehouse</option><option>South Warehouse</option><option>IT Store</option><option>Administration Store</option></select></label><label>Received By<input name="receivedBy" placeholder="Warehouse receiver"></label>
                <label>Inspected By<input name="inspectedBy" placeholder="Quality inspector"></label><label>Currency<select name="currency"><option value="USD">USD - US Dollar</option><option value="AED">AED - UAE Dirham</option><option value="EUR">EUR - Euro</option><option value="GBP">GBP - British Pound</option></select></label>
                <label>Receipt Status<select name="status"><option>Draft</option><option>Pending Inspection</option><option>Partial</option><option>Completed</option><option>Rejected</option></select></label><label>Condition<select name="condition"><option>Good Condition</option><option>Minor Damage</option><option>Damaged</option><option>Packaging Damaged</option><option>Rejected on Receipt</option></select></label>
                <label class="grn-full">Receiving Notes<textarea name="notes" placeholder="Enter receiving notes, shortages, damages, inspection remarks, etc."></textarea></label>
            </div>
            <div class="grn-items"><div class="grn-items-head"><h4>Received Items</h4><button class="grn-button grn-light" type="button" data-grn-add-item><i class="fas fa-plus"></i> Add Item</button></div><div class="grn-item-labels"><span>Item Description</span><span>Ordered</span><span>Received</span><span>Rejected</span><span>Unit Price</span><span>Total</span><span></span></div><div data-grn-items></div>
                <div class="grn-totals"><div><span>Total Ordered</span><strong data-grn-ordered>0</strong></div><div><span>Total Received</span><strong data-grn-received>0</strong></div><div><span>Total Rejected</span><strong data-grn-rejected>0</strong></div><div class="grn-grand"><span>Received Value</span><strong data-grn-value>$0.00</strong></div></div>
            </div><footer class="grn-modal-actions"><button class="grn-button grn-light" type="button" data-grn-cancel>Cancel</button><button class="grn-button grn-primary" type="submit">Save GRN</button></footer></form>
        </section></div>
        <div class="grn-overlay" data-grn-view-overlay><section class="grn-modal" role="dialog" aria-modal="true" aria-labelledby="grn-view-title"><header class="grn-modal-head"><h3 id="grn-view-title">Goods Receipt Details</h3><button class="grn-close" type="button" data-grn-close-view aria-label="Close">&times;</button></header><div class="grn-view" data-grn-view-content></div><footer class="grn-modal-actions"><button class="grn-button grn-light" type="button" data-grn-close-view>Close</button><button class="grn-button grn-primary" type="button" data-grn-print-current><i class="fas fa-print"></i> Print / PDF</button></footer></section></div>
        <div class="grn-toast" role="status" aria-live="polite" data-grn-toast></div>`;

    const storageKey = 'schoolGoodsReceipts';
    const seed = [
        { id: 'GRN-2026-001', supplier: 'Gulf Technology LLC', po: 'PO-2026-014', deliveryNote: 'DN-4588', invoice: 'INV-99012', receiptDate: '2026-09-24', inspectionDate: '2026-09-25', warehouse: 'Main Warehouse', receivedBy: 'Ahmed Khalid', inspectedBy: 'Mohammed Ali', currency: 'USD', status: 'Completed', condition: 'Good Condition', notes: 'All items received in good condition and passed inspection.', items: [{ description: 'Business Laptop', ordered: 10, received: 10, rejected: 0, price: 1850 }, { description: 'Laptop Carry Bag', ordered: 10, received: 10, rejected: 0, price: 45 }] },
        { id: 'GRN-2026-002', supplier: 'Al Noor Office Supplies', po: 'PO-2026-018', deliveryNote: 'DN-7712', invoice: 'INV-55124', receiptDate: '2026-09-29', inspectionDate: '', warehouse: 'Central Store', receivedBy: 'Sara Ahmed', inspectedBy: '', currency: 'USD', status: 'Pending Inspection', condition: 'Good Condition', notes: 'Goods received. Awaiting quality inspection.', items: [{ description: 'Executive Office Chair', ordered: 10, received: 8, rejected: 0, price: 250 }, { description: 'Office Desk', ordered: 5, received: 5, rejected: 0, price: 950 }] },
        { id: 'GRN-2026-003', supplier: 'Smart Business Solutions', po: 'PO-2026-021', deliveryNote: 'DN-8820', invoice: 'INV-66422', receiptDate: '2026-10-01', inspectionDate: '2026-10-02', warehouse: 'IT Store', receivedBy: 'John Mathew', inspectedBy: 'David George', currency: 'USD', status: 'Partial', condition: 'Minor Damage', notes: 'Two toner cartridges were damaged during transportation.', items: [{ description: 'Laser Printer', ordered: 8, received: 8, rejected: 0, price: 550 }, { description: 'Toner Cartridge', ordered: 24, received: 22, rejected: 2, price: 65 }] },
        { id: 'GRN-2026-004', supplier: 'Prime Industrial Trading', po: 'PO-2026-025', deliveryNote: 'DN-9014', invoice: 'INV-71220', receiptDate: '2026-10-03', inspectionDate: '', warehouse: 'South Warehouse', receivedBy: 'Michael George', inspectedBy: '', currency: 'USD', status: 'Draft', condition: 'Good Condition', notes: 'Initial receiving entry awaiting confirmation.', items: [{ description: 'Safety Helmet', ordered: 100, received: 100, rejected: 0, price: 18 }, { description: 'Safety Vest', ordered: 100, received: 95, rejected: 0, price: 12 }] }
    ];
    let receipts;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        receipts = Array.isArray(stored) ? stored : seed;
    } catch (error) {
        receipts = seed;
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
    const itemValue = item => (Number(item.received) || 0) * (Number(item.price) || 0);
    const receivedValue = grn => grn.items.reduce((sum, item) => sum + itemValue(item), 0);
    const totalReceived = grn => grn.items.reduce((sum, item) => sum + (Number(item.received) || 0), 0);
    const totalOrdered = grn => grn.items.reduce((sum, item) => sum + (Number(item.ordered) || 0), 0);
    const totalRejected = grn => grn.items.reduce((sum, item) => sum + (Number(item.rejected) || 0), 0);
    const statusClass = status => status.toLowerCase().replace(/\s+/g, '-');
    const save = () => localStorage.setItem(storageKey, JSON.stringify(receipts));
    const toast = message => {
        const element = q('[data-grn-toast]');
        element.textContent = message;
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 2400);
    };
    const updateStats = () => {
        q('[data-grn-stat="total"]').textContent = receipts.length;
        q('[data-grn-stat="pending"]').textContent = receipts.filter(item => item.status === 'Pending Inspection').length;
        q('[data-grn-stat="completed"]').textContent = receipts.filter(item => item.status === 'Completed').length;
        const values = {};
        receipts.forEach(item => { values[item.currency] = (values[item.currency] || 0) + receivedValue(item); });
        const entries = Object.entries(values);
        const value = q('[data-grn-stat="value"]');
        value.textContent = entries.length <= 1 ? money(entries[0]?.[1] || 0, entries[0]?.[0] || 'USD').replace(/\.00$/, '') : 'Multiple';
        value.title = entries.map(([currency, amount]) => money(amount, currency)).join(' · ');
    };
    const render = () => {
        const search = q('[data-grn-search]').value.trim().toLowerCase();
        const status = q('[data-grn-filter]').value;
        const filtered = receipts.filter(item => (!status || item.status === status) && (!search || JSON.stringify(item).toLowerCase().includes(search)));
        q('[data-grn-rows]').innerHTML = filtered.length ? filtered.map(item => `<tr><td><strong class="grn-id">${escape(item.id)}</strong><small class="grn-small">${escape(item.invoice || 'No invoice')}</small></td><td><b>${escape(item.supplier)}</b><small class="grn-small">Received by: ${escape(item.receivedBy || '—')}</small></td><td><strong>${escape(item.po)}</strong></td><td>${escape(item.deliveryNote)}</td><td>${formatDate(item.receiptDate)}</td><td>${escape(item.warehouse)}</td><td><strong class="grn-amount">${money(receivedValue(item), item.currency)}</strong></td><td><span class="grn-badge ${escape(statusClass(item.status))}">${escape(item.status)}</span></td><td><div class="grn-actions"><button class="grn-action" type="button" title="View" aria-label="View ${escape(item.id)}" data-grn-action="view" data-id="${escape(item.id)}"><i class="fas fa-eye"></i></button><button class="grn-action" type="button" title="Edit" aria-label="Edit ${escape(item.id)}" data-grn-action="edit" data-id="${escape(item.id)}"><i class="fas fa-pen"></i></button><button class="grn-action" type="button" title="Print" aria-label="Print ${escape(item.id)}" data-grn-action="print" data-id="${escape(item.id)}"><i class="fas fa-print"></i></button><button class="grn-action grn-delete" type="button" title="Delete" aria-label="Delete ${escape(item.id)}" data-grn-action="delete" data-id="${escape(item.id)}"><i class="fas fa-trash"></i></button></div></td></tr>`).join('') : '<tr><td colspan="9"><div class="grn-empty">No goods receipt notes found.</div></td></tr>';
        updateStats();
    };
    const calculate = () => {
        let ordered = 0;
        let received = 0;
        let rejected = 0;
        let value = 0;
        const currency = q('[name="currency"]').value;
        section.querySelectorAll('.grn-item-row').forEach(row => {
            const itemOrdered = Number(row.querySelector('[name="ordered"]').value) || 0;
            const itemReceived = Number(row.querySelector('[name="received"]').value) || 0;
            const itemRejected = Number(row.querySelector('[name="rejected"]').value) || 0;
            const price = Number(row.querySelector('[name="price"]').value) || 0;
            ordered += itemOrdered;
            received += itemReceived;
            rejected += itemRejected;
            const lineValue = itemReceived * price;
            value += lineValue;
            row.querySelector('[data-grn-line-total]').textContent = money(lineValue, currency);
        });
        q('[data-grn-ordered]').textContent = ordered;
        q('[data-grn-received]').textContent = received;
        q('[data-grn-rejected]').textContent = rejected;
        q('[data-grn-value]').textContent = money(value, currency);
    };
    const addItem = (item = { description: '', ordered: 1, received: 1, rejected: 0, price: 0 }) => {
        const row = document.createElement('div');
        row.className = 'grn-item-row';
        row.innerHTML = `<input name="description" aria-label="Item description" placeholder="Item description" value="${escape(item.description)}" required><input name="ordered" aria-label="Ordered quantity" type="number" min="0" step="1" value="${Number(item.ordered) || 0}" required><input name="received" aria-label="Received quantity" type="number" min="0" step="1" value="${Number(item.received) || 0}" required><input name="rejected" aria-label="Rejected quantity" type="number" min="0" step="1" value="${Number(item.rejected) || 0}" required><input name="price" aria-label="Unit price" type="number" min="0" step="0.01" value="${Number(item.price) || 0}" required><strong data-grn-line-total>$0.00</strong><button class="grn-remove-item" type="button" aria-label="Remove item"><i class="fas fa-xmark"></i></button>`;
        q('[data-grn-items]').appendChild(row);
        row.addEventListener('input', calculate);
        row.querySelector('.grn-remove-item').addEventListener('click', () => { row.remove(); calculate(); });
        calculate();
    };
    const closeForm = () => q('[data-grn-form-overlay]').classList.remove('is-open');
    const closeView = () => q('[data-grn-view-overlay]').classList.remove('is-open');
    const openForm = grn => {
        const form = q('[data-grn-form]');
        form.reset();
        q('[data-grn-items]').replaceChildren();
        editingId = grn?.id ?? null;
        q('#grn-form-title').textContent = grn ? 'Edit Goods Receipt Note' : 'Create Goods Receipt Note';
        form.elements.receiptDate.value = grn?.receiptDate || new Date().toISOString().slice(0, 10);
        if (grn) {
            ['supplier', 'po', 'deliveryNote', 'invoice', 'inspectionDate', 'warehouse', 'receivedBy', 'inspectedBy', 'currency', 'status', 'condition', 'notes'].forEach(field => { form.elements[field].value = grn[field] ?? ''; });
            grn.items.forEach(addItem);
        } else {
            addItem(); addItem();
        }
        calculate();
        q('[data-grn-form-overlay]').classList.add('is-open');
        form.elements.supplier.focus();
    };
    const details = grn => `<header class="grn-detail-header"><div><h2>${escape(grn.id)}</h2><p>${escape(grn.supplier)} · PO: ${escape(grn.po)}</p></div><span class="grn-badge ${escape(statusClass(grn.status))}">${escape(grn.status)}</span></header>
        <div class="grn-summary-grid">${[['Supplier', grn.supplier], ['Purchase Order', grn.po], ['Delivery Note', grn.deliveryNote], ['Invoice', grn.invoice || '—'], ['Receipt Date', formatDate(grn.receiptDate)], ['Inspection Date', formatDate(grn.inspectionDate)], ['Warehouse', grn.warehouse], ['Received By', grn.receivedBy || '—'], ['Inspected By', grn.inspectedBy || '—'], ['Condition', grn.condition], ['Currency', grn.currency]].map(([label, value]) => `<div class="grn-summary-box"><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`).join('')}</div>
        <h4 class="grn-details-title">Received Items</h4><div class="grn-table-wrap"><table class="grn-detail-table"><thead><tr><th>#</th><th>Item Description</th><th>Ordered</th><th>Received</th><th>Rejected</th><th>Unit Price</th><th>Received Value</th></tr></thead><tbody>${grn.items.map((item, index) => `<tr><td>${index + 1}</td><td><b>${escape(item.description)}</b></td><td>${Number(item.ordered)}</td><td><b>${Number(item.received)}</b></td><td>${Number(item.rejected)}</td><td>${money(item.price, grn.currency)}</td><td><b>${money(itemValue(item), grn.currency)}</b></td></tr>`).join('')}</tbody></table></div>
        <div class="grn-grand-total"><div><span>Total Ordered</span><b>${totalOrdered(grn)}</b></div><div><span>Total Received</span><b>${totalReceived(grn)}</b></div><div><span>Total Rejected</span><b>${totalRejected(grn)}</b></div><div class="grn-grand"><span>Received Value</span><b>${money(receivedValue(grn), grn.currency)}</b></div></div><div class="grn-notes"><strong>Receiving Notes</strong><p>${escape(grn.notes || 'No additional notes.')}</p></div>`;
    const printDocument = (title, html) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast('Allow pop-ups to print goods receipt notes.');
        printWindow.document.write(`<!doctype html><html><head><title>${escape(title)}</title><meta charset="utf-8"><style>body{font:13px Arial,sans-serif;color:#172033;padding:32px}h1{font-size:23px;margin:0}p{color:#475569}.head{display:flex;justify-content:space-between;border-bottom:2px solid #172033;padding-bottom:14px;margin-bottom:20px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:16px 0;font-size:12px}.meta strong{display:block;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:11px}th{background:#f1f5f9}.totals{width:290px;margin:18px 0 0 auto}.totals div{display:flex;justify-content:space-between;padding:6px;border-bottom:1px solid #e2e8f0}.grand{font-size:16px;font-weight:bold}.notes{margin-top:24px}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:35px;margin-top:65px}.signatures span{border-top:1px solid #475569;padding-top:8px}@media print{body{padding:0}}</style></head><body>${html}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    const printGRN = grn => {
        const rows = grn.items.map((item, index) => `<tr><td>${index + 1}</td><td>${escape(item.description)}</td><td>${Number(item.ordered)}</td><td>${Number(item.received)}</td><td>${Number(item.rejected)}</td><td>${money(item.price, grn.currency)}</td><td>${money(itemValue(item), grn.currency)}</td></tr>`).join('');
        const html = `<header class="head"><div><h1>Goods Receipt Note</h1><p>Warehouse &amp; Procurement Department</p></div><div><strong>${escape(grn.id)}</strong><br>Receipt Date: ${formatDate(grn.receiptDate)}</div></header><div class="meta"><div><strong>Supplier</strong>${escape(grn.supplier)}</div><div><strong>Purchase Order</strong>${escape(grn.po)}</div><div><strong>Delivery Note</strong>${escape(grn.deliveryNote)}</div><div><strong>Supplier Invoice</strong>${escape(grn.invoice || '—')}</div><div><strong>Receipt Date</strong>${formatDate(grn.receiptDate)}</div><div><strong>Inspection Date</strong>${formatDate(grn.inspectionDate)}</div><div><strong>Warehouse</strong>${escape(grn.warehouse)}</div><div><strong>Status</strong>${escape(grn.status)}</div><div><strong>Received By</strong>${escape(grn.receivedBy || '—')}</div><div><strong>Inspected By</strong>${escape(grn.inspectedBy || '—')}</div><div><strong>Condition</strong>${escape(grn.condition)}</div><div><strong>Currency</strong>${escape(grn.currency)}</div></div><table><thead><tr><th>#</th><th>Item Description</th><th>Ordered</th><th>Received</th><th>Rejected</th><th>Unit Price</th><th>Received Value</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div><span>Total Ordered</span><b>${totalOrdered(grn)}</b></div><div><span>Total Received</span><b>${totalReceived(grn)}</b></div><div><span>Total Rejected</span><b>${totalRejected(grn)}</b></div><div class="grand"><span>Received Value</span><b>${money(receivedValue(grn), grn.currency)}</b></div></div><div class="notes"><strong>Receiving Notes</strong><p>${escape(grn.notes || 'No additional notes.')}</p></div><div class="signatures"><span>Received By</span><span>Inspected By</span><span>Approved By</span></div>`;
        printDocument(grn.id, html);
    };

    q('[data-grn-new]').addEventListener('click', () => openForm());
    q('[data-grn-add-item]').addEventListener('click', () => addItem());
    q('[data-grn-search]').addEventListener('input', render);
    q('[data-grn-filter]').addEventListener('change', render);
    q('[name="currency"]').addEventListener('change', calculate);
    q('[data-grn-print-list]').addEventListener('click', () => {
        if (!receipts.length) return toast('No GRNs available.');
        const rows = receipts.map(grn => `<tr><td>${escape(grn.id)}</td><td>${escape(grn.supplier)}</td><td>${escape(grn.po)}</td><td>${escape(grn.deliveryNote)}</td><td>${formatDate(grn.receiptDate)}</td><td>${escape(grn.warehouse)}</td><td>${money(receivedValue(grn), grn.currency)}</td><td>${escape(grn.status)}</td></tr>`).join('');
        printDocument('Goods Receipt Report', `<header class="head"><div><h1>Goods Receipt Report</h1><p>Warehouse &amp; Procurement Summary</p></div><div>${new Date().toLocaleDateString('en-US')}</div></header><table><thead><tr><th>GRN</th><th>Supplier</th><th>Purchase Order</th><th>Delivery Note</th><th>Receipt Date</th><th>Warehouse</th><th>Received Value</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`);
    });
    q('[data-grn-form]').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const items = [...section.querySelectorAll('.grn-item-row')].map(row => ({ description: row.querySelector('[name="description"]').value.trim(), ordered: Number(row.querySelector('[name="ordered"]').value), received: Number(row.querySelector('[name="received"]').value), rejected: Number(row.querySelector('[name="rejected"]').value), price: Number(row.querySelector('[name="price"]').value) })).filter(item => item.description);
        if (!items.length) return toast('Please add at least one received item.');
        if (items.some(item => item.ordered < 0 || item.received < 0 || item.rejected < 0 || item.price < 0 || item.received + item.rejected > item.ordered)) return toast('Check quantities: received plus rejected must not exceed ordered.');
        const existing = receipts.find(item => item.id === editingId);
        const sequence = Math.max(0, ...receipts.map(item => Number(item.id.match(/^GRN-\d{4}-(\d+)$/)?.[1]) || 0)) + 1;
        const grn = { id: existing?.id || `GRN-${new Date().getFullYear()}-${String(sequence).padStart(3, '0')}`, supplier: form.elements.supplier.value.trim(), po: form.elements.po.value.trim(), deliveryNote: form.elements.deliveryNote.value.trim(), invoice: form.elements.invoice.value.trim(), receiptDate: form.elements.receiptDate.value, inspectionDate: form.elements.inspectionDate.value, warehouse: form.elements.warehouse.value, receivedBy: form.elements.receivedBy.value.trim(), inspectedBy: form.elements.inspectedBy.value.trim(), currency: form.elements.currency.value, status: form.elements.status.value, condition: form.elements.condition.value, notes: form.elements.notes.value.trim(), items };
        if (existing) receipts = receipts.map(item => item.id === editingId ? grn : item);
        else receipts.unshift(grn);
        save();
        closeForm();
        render();
        toast(existing ? 'GRN updated.' : 'GRN created.');
    });
    q('[data-grn-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-grn-action]');
        if (!button) return;
        const grn = receipts.find(item => item.id === button.dataset.id);
        if (!grn) return;
        if (button.dataset.grnAction === 'view') {
            viewingId = grn.id;
            q('[data-grn-view-content]').innerHTML = details(grn);
            q('[data-grn-view-overlay]').classList.add('is-open');
        } else if (button.dataset.grnAction === 'edit') {
            openForm(grn);
        } else if (button.dataset.grnAction === 'print') {
            printGRN(grn);
        } else if (button.dataset.grnAction === 'delete' && confirm(`Delete goods receipt note ${grn.id}?`)) {
            receipts = receipts.filter(item => item.id !== grn.id);
            save();
            render();
            toast('GRN deleted.');
        }
    });
    q('[data-grn-close-form]').addEventListener('click', closeForm);
    q('[data-grn-cancel]').addEventListener('click', closeForm);
    section.querySelectorAll('[data-grn-close-view]').forEach(button => button.addEventListener('click', closeView));
    q('[data-grn-print-current]').addEventListener('click', () => {
        const grn = receipts.find(item => item.id === viewingId);
        if (grn) printGRN(grn);
    });
    section.querySelectorAll('.grn-overlay').forEach(overlay => overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('is-open'); }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            q('[data-grn-form-overlay]').classList.remove('is-open');
            closeView();
        }
    });
    render();
    return section;
}