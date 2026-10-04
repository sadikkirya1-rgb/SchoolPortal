function createQuotationsModule() {
    const section = document.createElement('section');
    section.className = 'module quotations-module hidden';
    section.id = 'quotationsModule';
    section.innerHTML = `
        <header class="qt-header"><div><h2>Quotations</h2><p>Manage supplier quotations, pricing, validity and purchasing offers</p></div><button class="qt-button qt-primary" type="button" data-qt-new><i class="fas fa-plus"></i> New Quotation</button></header>
        <section class="qt-stats" aria-label="Quotation summary"><article class="qt-stat"><div><span>Total Quotations</span><strong data-qt-stat="total">0</strong></div><i class="fas fa-file-invoice"></i></article><article class="qt-stat"><div><span>Pending</span><strong data-qt-stat="pending">0</strong></div><i class="fas fa-clock"></i></article><article class="qt-stat"><div><span>Accepted</span><strong data-qt-stat="accepted">0</strong></div><i class="fas fa-circle-check"></i></article><article class="qt-stat"><div><span>Total Quoted Value</span><strong data-qt-stat="value">$0</strong></div><i class="fas fa-dollar-sign"></i></article></section>
        <section class="qt-content" aria-label="Quotation records"><div class="qt-toolbar"><label class="qt-search"><i class="fas fa-search" aria-hidden="true"></i><span class="qt-sr-only">Search quotations</span><input type="search" data-qt-search placeholder="Search quotation, supplier, request..."></label><select class="qt-filter" data-qt-filter aria-label="Filter by status"><option value="">All Statuses</option><option>Draft</option><option>Pending</option><option>Received</option><option>Accepted</option><option>Rejected</option><option>Expired</option></select><button class="qt-button qt-light" type="button" data-qt-print-list><i class="fas fa-print"></i> Print Report</button></div>
            <div class="qt-table-wrap"><table class="qt-table"><thead><tr><th>Quotation No.</th><th>Supplier</th><th>Purchase Request</th><th>Items</th><th>Quotation Date</th><th>Valid Until</th><th>Total Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody data-qt-rows></tbody></table></div></section>
        <div class="qt-overlay" data-qt-form-overlay><section class="qt-modal" role="dialog" aria-modal="true" aria-labelledby="qt-form-title"><header class="qt-modal-head"><h3 id="qt-form-title">Create Quotation</h3><button class="qt-close" type="button" data-qt-close-form aria-label="Close">&times;</button></header>
            <form class="qt-form" data-qt-form><div class="qt-grid">
                <label>Supplier / Vendor<input name="supplier" required placeholder="Enter supplier name"></label><label>Supplier Reference No.<input name="supplierRef" placeholder="Supplier quotation number"></label>
                <label>Purchase Request<input name="request" required placeholder="e.g. PR-2026-014"></label><label>Quotation Date<input name="date" type="date" required></label>
                <label>Valid Until<input name="validUntil" type="date" required></label><label>Currency<select name="currency"><option value="USD">USD - US Dollar</option><option value="AED">AED - UAE Dirham</option><option value="EUR">EUR - Euro</option><option value="GBP">GBP - British Pound</option></select></label>
                <label>Payment Terms<select name="paymentTerms"><option>30 Days Credit</option><option>15 Days Credit</option><option>Cash on Delivery</option><option>Advance Payment</option><option>50% Advance / 50% Delivery</option></select></label><label>Delivery Terms<select name="deliveryTerms"><option>7 Days</option><option>14 Days</option><option>21 Days</option><option>30 Days</option><option>Immediate</option></select></label>
                <label>Tax / VAT %<input name="tax" type="number" value="5" min="0" step="0.01"></label><label>Discount<input name="discount" type="number" value="0" min="0" step="0.01"></label>
                <label>Quotation Status<select name="status"><option>Draft</option><option>Pending</option><option>Received</option><option>Accepted</option><option>Rejected</option><option>Expired</option></select></label><label>Contact Person<input name="contact" placeholder="Supplier contact person"></label>
                <label>Phone / Email<input name="contactInfo" placeholder="Phone or email"></label><label>Delivery Location<input name="deliveryLocation" placeholder="Delivery location"></label>
                <label class="qt-full">Notes / Terms &amp; Conditions<textarea name="notes" placeholder="Additional quotation notes, exclusions, warranty, terms and conditions..."></textarea></label>
            </div>
            <div class="qt-items-section"><div class="qt-items-head"><h4>Quotation Items</h4><button class="qt-button qt-light" type="button" data-qt-add-item><i class="fas fa-plus"></i> Add Item</button></div><div class="qt-item-labels"><span>Description</span><span>Qty</span><span>Unit Price</span><span>Discount</span><span>Total</span><span></span></div><div data-qt-items></div>
                <div class="qt-form-totals"><div><span>Subtotal</span><strong data-qt-subtotal>$0.00</strong></div><div><span>Discount</span><strong data-qt-discount>$0.00</strong></div><div><span>Tax / VAT</span><strong data-qt-tax>$0.00</strong></div><div class="qt-grand"><span>Grand Total</span><strong data-qt-total>$0.00</strong></div></div>
            </div><footer class="qt-modal-actions"><button class="qt-button qt-light" type="button" data-qt-cancel>Cancel</button><button class="qt-button qt-primary" type="submit">Save Quotation</button></footer></form>
        </section></div>
        <div class="qt-overlay" data-qt-view-overlay><section class="qt-modal" role="dialog" aria-modal="true" aria-labelledby="qt-view-title"><header class="qt-modal-head"><h3 id="qt-view-title">Quotation Details</h3><button class="qt-close" type="button" data-qt-close-view aria-label="Close">&times;</button></header><div class="qt-view" data-qt-view-content></div><footer class="qt-modal-actions"><button class="qt-button qt-light" type="button" data-qt-close-view>Close</button><button class="qt-button qt-primary" type="button" data-qt-print-current><i class="fas fa-print"></i> Print / PDF</button></footer></section></div>
        <div class="qt-toast" role="status" aria-live="polite" data-qt-toast></div>`;

    const storageKey = 'schoolQuotations';
    const seed = [
        { id: 'QT-2026-001', supplier: 'Gulf Technology LLC', supplierRef: 'GTL-Q-2488', request: 'PR-2026-014', date: '2026-09-22', validUntil: '2026-10-22', currency: 'USD', paymentTerms: '30 Days Credit', deliveryTerms: '7 Days', tax: 5, discount: 500, status: 'Received', contact: 'Ahmed Khalid', contactInfo: 'sales@gulftech.example', deliveryLocation: 'Main Office', notes: 'Includes 3-year warranty and installation.', items: [{ description: 'Business Laptop', qty: 10, price: 1850, discount: 0 }, { description: 'Laptop Carry Bag', qty: 10, price: 45, discount: 0 }] },
        { id: 'QT-2026-002', supplier: 'Al Noor Office Supplies', supplierRef: 'AN-9045', request: 'PR-2026-018', date: '2026-09-27', validUntil: '2026-10-15', currency: 'USD', paymentTerms: '15 Days Credit', deliveryTerms: '14 Days', tax: 5, discount: 250, status: 'Accepted', contact: 'Sara Ahmed', contactInfo: '+971 50 000 0000', deliveryLocation: 'Administration Building', notes: 'Quotation accepted based on price and delivery.', items: [{ description: 'Executive Office Chair', qty: 10, price: 250, discount: 0 }, { description: 'Office Desk', qty: 5, price: 950, discount: 100 }] },
        { id: 'QT-2026-003', supplier: 'Smart Business Solutions', supplierRef: 'SBS-7754', request: 'PR-2026-021', date: '2026-10-01', validUntil: '2026-10-20', currency: 'USD', paymentTerms: '30 Days Credit', deliveryTerms: '7 Days', tax: 5, discount: 0, status: 'Pending', contact: 'John Mathew', contactInfo: 'john@sbs.example', deliveryLocation: 'Finance Department', notes: 'Awaiting final technical evaluation.', items: [{ description: 'Laser Printer', qty: 8, price: 550, discount: 0 }, { description: 'Toner Cartridge', qty: 24, price: 65, discount: 20 }] },
        { id: 'QT-2026-004', supplier: 'Prime Industrial Trading', supplierRef: 'PIT-1208', request: 'PR-2026-025', date: '2026-10-02', validUntil: '2026-10-12', currency: 'USD', paymentTerms: 'Cash on Delivery', deliveryTerms: 'Immediate', tax: 5, discount: 0, status: 'Draft', contact: 'Michael George', contactInfo: '+971 50 111 2222', deliveryLocation: 'Warehouse', notes: 'Supplier quotation received for review.', items: [{ description: 'Safety Helmet', qty: 100, price: 18, discount: 0 }, { description: 'Safety Vest', qty: 100, price: 12, discount: 0 }] }
    ];
    let quotations;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        quotations = Array.isArray(stored) ? stored : seed;
    } catch (error) {
        quotations = seed;
    }
    let editingId = null;
    let viewingId = null;
    let toastTimer;
    const q = selector => section.querySelector(selector);
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    const money = (value, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value) || 0);
    const date = value => {
        if (!value) return '—';
        const parsed = new Date(`${value}T00:00:00`);
        return Number.isNaN(parsed.getTime()) ? escape(value) : parsed.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };
    const itemTotal = item => Math.max(0, (Number(item.qty) || 0) * (Number(item.price) || 0) - (Number(item.discount) || 0));
    const subtotal = quotation => quotation.items.reduce((sum, item) => sum + itemTotal(item), 0);
    const grandTotal = quotation => {
        const taxable = Math.max(0, subtotal(quotation) - (Number(quotation.discount) || 0));
        return taxable + taxable * (Number(quotation.tax) || 0) / 100;
    };
    const save = () => localStorage.setItem(storageKey, JSON.stringify(quotations));
    const toast = message => {
        const element = q('[data-qt-toast]');
        element.textContent = message;
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 2400);
    };
    const updateStats = () => {
        q('[data-qt-stat="total"]').textContent = quotations.length;
        q('[data-qt-stat="pending"]').textContent = quotations.filter(item => ['Pending', 'Draft'].includes(item.status)).length;
        q('[data-qt-stat="accepted"]').textContent = quotations.filter(item => item.status === 'Accepted').length;
        const values = {};
        quotations.forEach(item => { values[item.currency] = (values[item.currency] || 0) + grandTotal(item); });
        const entries = Object.entries(values);
        const value = q('[data-qt-stat="value"]');
        value.textContent = entries.length <= 1 ? money(entries[0]?.[1] || 0, entries[0]?.[0] || 'USD').replace(/\.00$/, '') : 'Multiple';
        value.title = entries.map(([currency, amount]) => money(amount, currency)).join(' · ');
    };
    const render = () => {
        const search = q('[data-qt-search]').value.trim().toLowerCase();
        const status = q('[data-qt-filter]').value;
        const filtered = quotations.filter(item => (!status || item.status === status) && (!search || JSON.stringify(item).toLowerCase().includes(search)));
        q('[data-qt-rows]').innerHTML = filtered.length ? filtered.map(item => `<tr><td><strong class="qt-id">${escape(item.id)}</strong><small class="qt-small">${escape(item.supplierRef || 'No supplier ref.')}</small></td><td><b>${escape(item.supplier)}</b><small class="qt-small">${escape(item.contact || 'No contact')}</small></td><td><strong>${escape(item.request)}</strong></td><td>${item.items.length} item${item.items.length === 1 ? '' : 's'}</td><td>${date(item.date)}</td><td>${date(item.validUntil)}</td><td><strong class="qt-amount">${money(grandTotal(item), item.currency)}</strong></td><td><span class="qt-badge ${escape(item.status.toLowerCase())}">${escape(item.status)}</span></td><td><div class="qt-actions"><button class="qt-action" type="button" title="View" aria-label="View ${escape(item.id)}" data-qt-action="view" data-id="${escape(item.id)}"><i class="fas fa-eye"></i></button><button class="qt-action" type="button" title="Edit" aria-label="Edit ${escape(item.id)}" data-qt-action="edit" data-id="${escape(item.id)}"><i class="fas fa-pen"></i></button><button class="qt-action" type="button" title="Print" aria-label="Print ${escape(item.id)}" data-qt-action="print" data-id="${escape(item.id)}"><i class="fas fa-print"></i></button><button class="qt-action qt-delete" type="button" title="Delete" aria-label="Delete ${escape(item.id)}" data-qt-action="delete" data-id="${escape(item.id)}"><i class="fas fa-trash"></i></button></div></td></tr>`).join('') : '<tr><td colspan="9"><div class="qt-empty">No quotations found.</div></td></tr>';
        updateStats();
    };
    const calculate = () => {
        const currency = q('[name="currency"]').value;
        let itemsSubtotal = 0;
        section.querySelectorAll('.qt-item-row').forEach(row => {
            const item = { qty: row.querySelector('[name="qty"]').value, price: row.querySelector('[name="price"]').value, discount: row.querySelector('[name="itemDiscount"]').value };
            const total = itemTotal(item);
            itemsSubtotal += total;
            row.querySelector('[data-qt-line-total]').textContent = money(total, currency);
        });
        const discount = Number(q('[name="discount"]').value) || 0;
        const taxRate = Number(q('[name="tax"]').value) || 0;
        const taxable = Math.max(0, itemsSubtotal - discount);
        q('[data-qt-subtotal]').textContent = money(itemsSubtotal, currency);
        q('[data-qt-discount]').textContent = money(discount, currency);
        q('[data-qt-tax]').textContent = money(taxable * taxRate / 100, currency);
        q('[data-qt-total]').textContent = money(taxable * (1 + taxRate / 100), currency);
    };
    const addItem = (item = { description: '', qty: 1, price: 0, discount: 0 }) => {
        const row = document.createElement('div');
        row.className = 'qt-item-row';
        row.innerHTML = `<input name="description" aria-label="Item description" placeholder="Item description" value="${escape(item.description)}" required><input name="qty" aria-label="Quantity" type="number" min="1" step="1" value="${Number(item.qty) || 1}" required><input name="price" aria-label="Unit price" type="number" min="0" step="0.01" placeholder="0.00" value="${Number(item.price) || 0}" required><input name="itemDiscount" aria-label="Item discount" type="number" min="0" step="0.01" placeholder="0.00" value="${Number(item.discount) || 0}"><strong data-qt-line-total>$0.00</strong><button class="qt-remove-item" type="button" aria-label="Remove item"><i class="fas fa-xmark"></i></button>`;
        q('[data-qt-items]').appendChild(row);
        row.addEventListener('input', calculate);
        row.querySelector('.qt-remove-item').addEventListener('click', () => { row.remove(); calculate(); });
        calculate();
    };
    const closeForm = () => q('[data-qt-form-overlay]').classList.remove('is-open');
    const closeView = () => q('[data-qt-view-overlay]').classList.remove('is-open');
    const openForm = quotation => {
        const form = q('[data-qt-form]');
        form.reset();
        q('[data-qt-items]').replaceChildren();
        editingId = quotation?.id ?? null;
        q('#qt-form-title').textContent = quotation ? 'Edit Quotation' : 'Create Quotation';
        const today = new Date();
        form.elements.date.value = quotation?.date || today.toISOString().slice(0, 10);
        const validUntil = new Date(today);
        validUntil.setDate(validUntil.getDate() + 30);
        form.elements.validUntil.value = quotation?.validUntil || validUntil.toISOString().slice(0, 10);
        if (quotation) {
            ['supplier', 'supplierRef', 'request', 'currency', 'paymentTerms', 'deliveryTerms', 'tax', 'discount', 'status', 'contact', 'contactInfo', 'deliveryLocation', 'notes'].forEach(field => { form.elements[field].value = quotation[field] ?? ''; });
            quotation.items.forEach(addItem);
        } else {
            addItem(); addItem();
        }
        calculate();
        q('[data-qt-form-overlay]').classList.add('is-open');
        form.elements.supplier.focus();
    };
    const detailContent = quotation => `<header class="qt-detail-header"><div><h2>${escape(quotation.supplier)}</h2><p>${escape(quotation.id)} · ${escape(quotation.supplierRef || 'No supplier reference')}</p></div><span class="qt-badge ${escape(quotation.status.toLowerCase())}">${escape(quotation.status)}</span></header>
        <div class="qt-summary-grid">${[['Purchase Request', quotation.request], ['Quotation Date', date(quotation.date)], ['Valid Until', date(quotation.validUntil)], ['Payment Terms', quotation.paymentTerms], ['Delivery Terms', quotation.deliveryTerms], ['Contact Person', quotation.contact || '—'], ['Phone / Email', quotation.contactInfo || '—'], ['Delivery Location', quotation.deliveryLocation || '—'], ['Currency', quotation.currency]].map(([label, value]) => `<div class="qt-summary-box"><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`).join('')}</div>
        <h4 class="qt-details-title">Quotation Items</h4><div class="qt-table-wrap"><table class="qt-detail-table"><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Discount</th><th>Total</th></tr></thead><tbody>${quotation.items.map((item, index) => `<tr><td>${index + 1}</td><td><b>${escape(item.description)}</b></td><td>${Number(item.qty)}</td><td>${money(item.price, quotation.currency)}</td><td>${money(item.discount, quotation.currency)}</td><td><b>${money(itemTotal(item), quotation.currency)}</b></td></tr>`).join('')}</tbody></table></div>
        <div class="qt-grand-total"><div><span>Subtotal</span><b>${money(subtotal(quotation), quotation.currency)}</b></div><div><span>Discount</span><b>${money(quotation.discount, quotation.currency)}</b></div><div><span>VAT / Tax (${Number(quotation.tax)}%)</span><b>${money(Math.max(0, subtotal(quotation) - Number(quotation.discount || 0)) * Number(quotation.tax || 0) / 100, quotation.currency)}</b></div><div class="qt-grand"><span>Grand Total</span><b>${money(grandTotal(quotation), quotation.currency)}</b></div></div><div class="qt-notes"><strong>Terms &amp; Notes</strong><p>${escape(quotation.notes || 'No additional notes.')}</p></div>`;
    const printDocument = (title, content) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast('Allow pop-ups to print quotations.');
        printWindow.document.write(`<!doctype html><html><head><title>${escape(title)}</title><meta charset="utf-8"><style>body{font:13px Arial,sans-serif;color:#172033;padding:32px}h1{font-size:23px;margin:0}p{color:#475569}.head{display:flex;justify-content:space-between;border-bottom:2px solid #172033;padding-bottom:14px;margin-bottom:20px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:16px 0;font-size:12px}.meta strong{display:block;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:11px}th{background:#f1f5f9}.totals{width:290px;margin:18px 0 0 auto}.totals div{display:flex;justify-content:space-between;padding:6px;border-bottom:1px solid #e2e8f0}.grand{font-size:16px;font-weight:bold}.notes{margin-top:24px}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:35px;margin-top:65px}.signatures span{border-top:1px solid #475569;padding-top:8px}@media print{body{padding:0}}</style></head><body>${content}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    const printQuotation = quotation => {
        const taxable = Math.max(0, subtotal(quotation) - Number(quotation.discount || 0));
        const rows = quotation.items.map((item, index) => `<tr><td>${index + 1}</td><td>${escape(item.description)}</td><td>${Number(item.qty)}</td><td>${money(item.price, quotation.currency)}</td><td>${money(item.discount, quotation.currency)}</td><td>${money(itemTotal(item), quotation.currency)}</td></tr>`).join('');
        const content = `<header class="head"><div><h1>Supplier Quotation</h1><p>Procurement Department</p></div><div><strong>${escape(quotation.id)}</strong><br>Date: ${date(quotation.date)}</div></header><div class="meta"><div><strong>Supplier</strong>${escape(quotation.supplier)}</div><div><strong>Supplier Reference</strong>${escape(quotation.supplierRef || '—')}</div><div><strong>Purchase Request</strong>${escape(quotation.request)}</div><div><strong>Valid Until</strong>${date(quotation.validUntil)}</div><div><strong>Status</strong>${escape(quotation.status)}</div><div><strong>Payment Terms</strong>${escape(quotation.paymentTerms)}</div><div><strong>Delivery Terms</strong>${escape(quotation.deliveryTerms)}</div><div><strong>Contact</strong>${escape(quotation.contact || '—')} ${escape(quotation.contactInfo || '')}</div><div><strong>Delivery Location</strong>${escape(quotation.deliveryLocation || '—')}</div></div><table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Discount</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div><span>Subtotal</span><b>${money(subtotal(quotation), quotation.currency)}</b></div><div><span>Discount</span><b>${money(quotation.discount, quotation.currency)}</b></div><div><span>VAT / Tax</span><b>${money(taxable * Number(quotation.tax || 0) / 100, quotation.currency)}</b></div><div class="grand"><span>Grand Total</span><b>${money(grandTotal(quotation), quotation.currency)}</b></div></div><div class="notes"><strong>Terms &amp; Notes</strong><p>${escape(quotation.notes || 'No additional notes.')}</p></div><div class="signatures"><span>Prepared By</span><span>Reviewed By</span><span>Approved By</span></div>`;
        printDocument(quotation.id, content);
    };

    q('[data-qt-new]').addEventListener('click', () => openForm());
    q('[data-qt-add-item]').addEventListener('click', () => addItem());
    q('[data-qt-search]').addEventListener('input', render);
    q('[data-qt-filter]').addEventListener('change', render);
    q('[name="currency"]').addEventListener('change', calculate);
    q('[name="discount"]').addEventListener('input', calculate);
    q('[name="tax"]').addEventListener('input', calculate);
    q('[data-qt-print-list]').addEventListener('click', () => {
        if (!quotations.length) return toast('No quotations available.');
        const rows = quotations.map(item => `<tr><td>${escape(item.id)}</td><td>${escape(item.supplier)}</td><td>${escape(item.request)}</td><td>${item.items.length}</td><td>${date(item.date)}</td><td>${date(item.validUntil)}</td><td>${money(grandTotal(item), item.currency)}</td><td>${escape(item.status)}</td></tr>`).join('');
        printDocument('Quotation Report', `<header class="head"><div><h1>Quotation Report</h1><p>Supplier Quotation Summary</p></div><div>${new Date().toLocaleDateString('en-US')}</div></header><table><thead><tr><th>Quotation</th><th>Supplier</th><th>Purchase Request</th><th>Items</th><th>Date</th><th>Valid Until</th><th>Total</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`);
    });
    q('[data-qt-form]').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const items = [...section.querySelectorAll('.qt-item-row')].map(row => ({ description: row.querySelector('[name="description"]').value.trim(), qty: Number(row.querySelector('[name="qty"]').value), price: Number(row.querySelector('[name="price"]').value), discount: Number(row.querySelector('[name="itemDiscount"]').value) || 0 })).filter(item => item.description);
        if (!items.length) return toast('Please add at least one quotation item.');
        if (items.some(item => item.qty < 1 || item.price < 0 || item.discount < 0 || item.discount > item.qty * item.price)) return toast('Check the quantity, price and item discount values.');
        const discount = Number(form.elements.discount.value) || 0;
        if (discount < 0 || discount > items.reduce((sum, item) => sum + itemTotal(item), 0)) return toast('The quotation discount cannot exceed the items subtotal.');
        const existing = quotations.find(item => item.id === editingId);
        const sequence = Math.max(0, ...quotations.map(item => Number(item.id.match(/^QT-\d{4}-(\d+)$/)?.[1]) || 0)) + 1;
        const quotation = { id: existing?.id || `QT-${new Date().getFullYear()}-${String(sequence).padStart(3, '0')}`, supplier: form.elements.supplier.value.trim(), supplierRef: form.elements.supplierRef.value.trim(), request: form.elements.request.value.trim(), date: form.elements.date.value, validUntil: form.elements.validUntil.value, currency: form.elements.currency.value, paymentTerms: form.elements.paymentTerms.value, deliveryTerms: form.elements.deliveryTerms.value, tax: Number(form.elements.tax.value) || 0, discount, status: form.elements.status.value, contact: form.elements.contact.value.trim(), contactInfo: form.elements.contactInfo.value.trim(), deliveryLocation: form.elements.deliveryLocation.value.trim(), notes: form.elements.notes.value.trim(), items };
        if (existing) quotations = quotations.map(item => item.id === editingId ? quotation : item);
        else quotations.unshift(quotation);
        save();
        closeForm();
        render();
        toast(existing ? 'Quotation updated.' : 'Quotation created.');
    });
    q('[data-qt-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-qt-action]');
        if (!button) return;
        const quotation = quotations.find(item => item.id === button.dataset.id);
        if (!quotation) return;
        if (button.dataset.qtAction === 'view') {
            viewingId = quotation.id;
            q('[data-qt-view-content]').innerHTML = detailContent(quotation);
            q('[data-qt-view-overlay]').classList.add('is-open');
        } else if (button.dataset.qtAction === 'edit') {
            openForm(quotation);
        } else if (button.dataset.qtAction === 'print') {
            printQuotation(quotation);
        } else if (button.dataset.qtAction === 'delete' && confirm(`Delete quotation ${quotation.id}?`)) {
            quotations = quotations.filter(item => item.id !== quotation.id);
            save();
            render();
            toast('Quotation deleted.');
        }
    });
    q('[data-qt-close-form]').addEventListener('click', closeForm);
    q('[data-qt-cancel]').addEventListener('click', closeForm);
    section.querySelectorAll('[data-qt-close-view]').forEach(button => button.addEventListener('click', closeView));
    q('[data-qt-print-current]').addEventListener('click', () => {
        const quotation = quotations.find(item => item.id === viewingId);
        if (quotation) printQuotation(quotation);
    });
    section.querySelectorAll('.qt-overlay').forEach(overlay => overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('is-open'); }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            q('[data-qt-form-overlay]').classList.remove('is-open');
            closeView();
        }
    });
    render();
    return section;
}