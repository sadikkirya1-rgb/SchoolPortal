function createPurchaseOrdersModule() {
    const section = document.createElement('section');
    section.className = 'module purchase-orders-module hidden';
    section.id = 'purchaseOrdersModule';
    section.innerHTML = `
        <header class="po-header"><div><h2>Purchase Orders</h2><p>Create, manage and track supplier purchase orders</p></div><button class="po-button po-primary" type="button" data-po-new><i class="fas fa-plus"></i> Create Purchase Order</button></header>
        <section class="po-stats" aria-label="Purchase order summary">
            <article class="po-stat"><div><span>Total Purchase Orders</span><strong data-po-stat="count">0</strong></div><i class="fas fa-file-invoice"></i></article>
            <article class="po-stat"><div><span>Pending Orders</span><strong data-po-stat="pending">0</strong></div><i class="fas fa-clock"></i></article>
            <article class="po-stat"><div><span>Received Orders</span><strong data-po-stat="received">0</strong></div><i class="fas fa-circle-check"></i></article>
            <article class="po-stat"><div><span>Total PO Value</span><strong data-po-stat="value">$0</strong></div><i class="fas fa-dollar-sign"></i></article>
        </section>
        <section class="po-content" aria-label="Purchase order records">
            <div class="po-toolbar"><label class="po-search"><i class="fas fa-search" aria-hidden="true"></i><span class="po-sr-only">Search purchase orders</span><input type="search" data-po-search placeholder="Search PO, vendor, buyer..."></label><select class="po-filter" data-po-filter aria-label="Filter by status"><option value="">All Statuses</option><option>Draft</option><option>Sent</option><option>Confirmed</option><option>Received</option><option>Cancelled</option></select><button class="po-button po-light" type="button" data-po-print-list><i class="fas fa-print"></i> Print PO List</button></div>
            <div class="po-table-wrap"><table class="po-table"><thead><tr><th>PO Number</th><th>Vendor</th><th>Buyer</th><th>Items</th><th>PO Value</th><th>Order Date</th><th>Delivery Date</th><th>Status</th><th>Actions</th></tr></thead><tbody data-po-rows></tbody></table></div>
        </section>
        <div class="po-overlay" data-po-form-overlay><section class="po-modal" role="dialog" aria-modal="true" aria-labelledby="po-form-title"><header class="po-modal-head"><h3 id="po-form-title">Create Purchase Order</h3><button class="po-close" type="button" data-po-close-form aria-label="Close">&times;</button></header>
            <form class="po-form" data-po-form><div class="po-grid">
                <label>Vendor / Supplier<input name="vendor" required placeholder="e.g. ABC Trading LLC"></label><label>Buyer / Purchaser<input name="buyer" required placeholder="e.g. Ahmed Khan"></label>
                <label>PO Date<input name="date" type="date" required></label><label>Expected Delivery Date<input name="delivery" type="date" required></label>
                <label>Payment Terms<select name="payment"><option>Net 30</option><option>Net 15</option><option>Net 60</option><option>Due on Delivery</option><option>Advance Payment</option></select></label>
                <label>Shipping Method<select name="shipping"><option>Standard Delivery</option><option>Express Delivery</option><option>Courier</option><option>Vendor Delivery</option><option>Pickup</option></select></label>
                <label>Currency<select name="currency"><option value="USD">USD - US Dollar</option><option value="AED">AED - UAE Dirham</option><option value="EUR">EUR - Euro</option><option value="GBP">GBP - British Pound</option></select></label>
                <label>Department<select name="department"><option>Procurement</option><option>IT</option><option>Finance</option><option>HR</option><option>Operations</option><option>Marketing</option><option>Administration</option></select></label>
                <label class="po-full">Delivery Address<textarea name="address" placeholder="Enter delivery address..."></textarea></label><label class="po-full">Notes / Special Instructions<textarea name="notes" placeholder="Enter notes, terms or special instructions..."></textarea></label>
            </div>
            <div class="po-items"><div class="po-items-head"><h4>Purchase Order Items</h4><button class="po-button po-light" type="button" data-po-add-item><i class="fas fa-plus"></i> Add Item</button></div><div data-po-items></div>
                <div class="po-totals"><div><span>Subtotal</span><strong data-po-subtotal>$0.00</strong></div><div><span>Discount</span><strong data-po-discount>$0.00</strong></div><div><span>Tax (5%)</span><strong data-po-tax>$0.00</strong></div><div class="po-grand"><span>Grand Total</span><strong data-po-total>$0.00</strong></div></div>
            </div><footer class="po-modal-actions"><button class="po-button po-light" type="button" data-po-cancel>Cancel</button><button class="po-button po-primary" type="submit">Save Purchase Order</button></footer></form>
        </section></div>
        <div class="po-overlay" data-po-view-overlay><section class="po-modal" role="dialog" aria-modal="true" aria-labelledby="po-view-title"><header class="po-modal-head"><h3 id="po-view-title">Purchase Order Details</h3><button class="po-close" type="button" data-po-close-view aria-label="Close">&times;</button></header><div class="po-view" data-po-view-content></div><footer class="po-modal-actions"><button class="po-button po-light" type="button" data-po-close-view>Close</button><button class="po-button po-primary" type="button" data-po-print-current><i class="fas fa-print"></i> Print / PDF</button></footer></section></div>
        <div class="po-toast" role="status" aria-live="polite" data-po-toast></div>`;

    const storageKey = 'schoolPurchaseOrders';
    const seed = [
        { id: 'PO-2026-001', vendor: 'Gulf Technology LLC', buyer: 'Ahmed Khan', date: '2026-09-25', delivery: '2026-10-08', status: 'Confirmed', payment: 'Net 30', shipping: 'Standard Delivery', currency: 'USD', department: 'IT', address: 'Abu Dhabi, UAE', notes: 'Please deliver during business hours.', items: [['MacBook Pro 14', 5, 1850, ''], ['USB-C Dock', 5, 145, ''], ['Wireless Mouse', 10, 35, '']] },
        { id: 'PO-2026-002', vendor: 'Al Noor Office Supplies', buyer: 'Sara Ali', date: '2026-09-28', delivery: '2026-10-05', status: 'Sent', payment: 'Net 30', shipping: 'Vendor Delivery', currency: 'USD', department: 'Administration', address: 'Main Office, Abu Dhabi', notes: 'Call reception before delivery.', items: [['Office Chair', 20, 210, ''], ['Desk Organizer', 30, 18, '']] },
        { id: 'PO-2026-003', vendor: 'Prime Industrial Trading', buyer: 'Omar Hassan', date: '2026-09-30', delivery: '2026-10-12', status: 'Received', payment: 'Net 15', shipping: 'Express Delivery', currency: 'USD', department: 'Operations', address: 'Warehouse 4', notes: 'Partial delivery accepted.', items: [['Safety Helmet', 50, 28, ''], ['Safety Gloves', 100, 12, ''], ['Safety Vest', 50, 22, '']] },
        { id: 'PO-2026-004', vendor: 'Smart Business Solutions', buyer: 'Mariam Noor', date: '2026-10-01', delivery: '2026-10-15', status: 'Draft', payment: 'Due on Delivery', shipping: 'Courier', currency: 'USD', department: 'Finance', address: 'Finance Department', notes: 'Awaiting final approval.', items: [['Laser Printer', 3, 490, ''], ['Toner Cartridge', 12, 72, '']] },
        { id: 'PO-2026-005', vendor: 'Creative Media House', buyer: 'Daniel Lee', date: '2026-10-02', delivery: '2026-10-09', status: 'Sent', payment: 'Advance Payment', shipping: 'Express Delivery', currency: 'USD', department: 'Marketing', address: 'Marketing Department', notes: 'Urgent promotional materials.', items: [['Display Banner', 10, 120, ''], ['Brochures', 2000, 0.8, '']] }
    ];
    let orders;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        orders = Array.isArray(stored) ? stored : seed;
    } catch (error) {
        orders = seed;
    }
    let editingId = null;
    let viewingId = null;
    let toastTimer;
    const q = selector => section.querySelector(selector);
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    const money = (value, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value) || 0);
    const subtotal = order => order.items.reduce((sum, item) => sum + Number(item[1]) * Number(item[2]), 0);
    const total = order => subtotal(order) * 1.05;
    const formatDate = value => {
        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime()) ? escape(value) : date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };
    const save = () => localStorage.setItem(storageKey, JSON.stringify(orders));
    const showToast = message => {
        const toast = q('[data-po-toast]');
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
    };
    const updateStats = () => {
        q('[data-po-stat="count"]').textContent = orders.length;
        q('[data-po-stat="pending"]').textContent = orders.filter(order => ['Draft', 'Sent', 'Confirmed'].includes(order.status)).length;
        q('[data-po-stat="received"]').textContent = orders.filter(order => order.status === 'Received').length;
        q('[data-po-stat="value"]').textContent = money(orders.reduce((sum, order) => sum + total(order), 0)).replace(/\.00$/, '');
    };
    const render = () => {
        const search = q('[data-po-search]').value.trim().toLowerCase();
        const status = q('[data-po-filter]').value;
        const filtered = orders.filter(order => (!status || order.status === status) && (!search || JSON.stringify(order).toLowerCase().includes(search)));
        q('[data-po-rows]').innerHTML = filtered.length ? filtered.map(order => {
            const initials = order.vendor.split(/\s+/).map(part => part[0] || '').slice(0, 2).join('').toUpperCase();
            const itemCount = order.items.reduce((sum, item) => sum + Number(item[1]), 0);
            return `<tr><td><strong class="po-id">${escape(order.id)}</strong></td><td><span class="po-vendor"><span class="po-vendor-logo">${escape(initials)}</span><b>${escape(order.vendor)}</b></span></td><td>${escape(order.buyer)}</td><td>${itemCount} item(s)</td><td><strong>${money(total(order), order.currency)}</strong></td><td>${formatDate(order.date)}</td><td>${formatDate(order.delivery)}</td><td><span class="po-badge ${escape(order.status.toLowerCase())}">${escape(order.status)}</span></td><td><div class="po-actions"><button class="po-action" type="button" title="View" aria-label="View ${escape(order.id)}" data-po-action="view" data-id="${escape(order.id)}"><i class="fas fa-eye"></i></button><button class="po-action" type="button" title="Edit" aria-label="Edit ${escape(order.id)}" data-po-action="edit" data-id="${escape(order.id)}"><i class="fas fa-pen"></i></button><button class="po-action" type="button" title="Print" aria-label="Print ${escape(order.id)}" data-po-action="print" data-id="${escape(order.id)}"><i class="fas fa-print"></i></button><button class="po-action po-delete" type="button" title="Delete" aria-label="Delete ${escape(order.id)}" data-po-action="delete" data-id="${escape(order.id)}"><i class="fas fa-trash"></i></button></div></td></tr>`;
        }).join('') : '<tr><td colspan="9"><div class="po-empty">No purchase orders found.</div></td></tr>';
        updateStats();
    };
    const calculate = () => {
        const currency = q('[name="currency"]').value;
        let sum = 0;
        section.querySelectorAll('.po-item-row').forEach(row => {
            const quantity = Number(row.querySelector('[name="quantity"]').value) || 0;
            const price = Number(row.querySelector('[name="price"]').value) || 0;
            const lineTotal = quantity * price;
            sum += lineTotal;
            row.querySelector('[name="lineTotal"]').value = money(lineTotal, currency);
        });
        q('[data-po-subtotal]').textContent = money(sum, currency);
        q('[data-po-discount]').textContent = money(0, currency);
        q('[data-po-tax]').textContent = money(sum * 0.05, currency);
        q('[data-po-total]').textContent = money(sum * 1.05, currency);
    };
    const addItem = (item = ['', 1, 0, '']) => {
        const row = document.createElement('div');
        row.className = 'po-item-row';
        row.innerHTML = `<input name="itemName" aria-label="Item or product" placeholder="Item / product" value="${escape(item[0])}" required><input name="code" aria-label="SKU or code" placeholder="SKU / Code" value="${escape(item[3] || '')}"><input name="quantity" aria-label="Quantity" type="number" min="1" step="1" value="${Number(item[1]) || 1}" required><input name="price" aria-label="Unit price" type="number" min="0" step="0.01" value="${Number(item[2]) || 0}" required><input name="lineTotal" aria-label="Line total" class="po-item-total" readonly><button class="po-remove-item" type="button" aria-label="Remove item"><i class="fas fa-xmark"></i></button>`;
        q('[data-po-items]').appendChild(row);
        row.addEventListener('input', calculate);
        row.querySelector('.po-remove-item').addEventListener('click', () => { row.remove(); calculate(); });
        calculate();
    };
    const closeForm = () => q('[data-po-form-overlay]').classList.remove('is-open');
    const closeView = () => q('[data-po-view-overlay]').classList.remove('is-open');
    const openForm = order => {
        const form = q('[data-po-form]');
        form.reset();
        q('[data-po-items]').replaceChildren();
        editingId = order?.id ?? null;
        q('#po-form-title').textContent = order ? 'Edit Purchase Order' : 'Create Purchase Order';
        const today = new Date().toISOString().slice(0, 10);
        form.elements.date.value = order?.date || today;
        form.elements.delivery.value = order?.delivery || today;
        if (order) {
            ['vendor', 'buyer', 'payment', 'shipping', 'currency', 'department', 'address', 'notes'].forEach(field => { form.elements[field].value = order[field] || ''; });
            order.items.forEach(addItem);
        } else {
            addItem();
        }
        calculate();
        q('[data-po-form-overlay]').classList.add('is-open');
        form.elements.vendor.focus();
    };
    const details = order => `<div class="po-detail-grid">
        ${[['PO Number', order.id], ['Status', order.status], ['Vendor', order.vendor], ['Buyer', order.buyer], ['Order Date', formatDate(order.date)], ['Expected Delivery', formatDate(order.delivery)], ['Payment Terms', order.payment], ['Shipping Method', order.shipping], ['Currency', order.currency], ['Department', order.department], ['Delivery Address', order.address || 'Not provided'], ['Notes', order.notes || 'Not provided']].map(([label, value]) => `<div class="po-info-box"><h4>${escape(label)}</h4><p>${label === 'Status' ? `<span class="po-badge ${escape(String(value).toLowerCase())}">${escape(value)}</span>` : escape(value)}</p></div>`).join('')}
        </div><h4 class="po-details-title">Order Items</h4><div class="po-table-wrap"><table class="po-table po-details-table"><thead><tr><th>Item</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${order.items.map(item => `<tr><td>${escape(item[0])}</td><td>${escape(item[3] || '—')}</td><td>${Number(item[1])}</td><td>${money(item[2], order.currency)}</td><td>${money(item[1] * item[2], order.currency)}</td></tr>`).join('')}</tbody></table></div><div class="po-totals"><div><span>Subtotal</span><strong>${money(subtotal(order), order.currency)}</strong></div><div><span>Discount</span><strong>${money(0, order.currency)}</strong></div><div><span>Tax (5%)</span><strong>${money(subtotal(order) * 0.05, order.currency)}</strong></div><div class="po-grand"><span>Grand Total</span><strong>${money(total(order), order.currency)}</strong></div></div>`;
    const printDocument = (title, html) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return showToast('Allow pop-ups to print purchase orders.');
        printWindow.document.write(`<!doctype html><html><head><title>${escape(title)}</title><meta charset="utf-8"><style>body{font:14px Arial,sans-serif;color:#172033;padding:32px}h1{font-size:24px;margin:0}p{color:#475569}.head{display:flex;justify-content:space-between;border-bottom:2px solid #172033;padding-bottom:14px;margin-bottom:20px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0}.meta strong{display:block;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #cbd5e1;padding:9px;text-align:left}th{background:#f1f5f9}.totals{width:280px;margin:18px 0 0 auto}.totals div{display:flex;justify-content:space-between;padding:6px;border-bottom:1px solid #e2e8f0}.grand{font-size:17px;font-weight:bold}.notes{margin-top:24px}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:35px;margin-top:70px}.signatures span{border-top:1px solid #475569;padding-top:8px}@media print{body{padding:0}}</style></head><body>${html}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    const printOrder = order => {
        const html = `<header class="head"><div><h1>Purchase Order</h1><p>Procurement Department</p></div><div><strong>${escape(order.id)}</strong><br>Order Date: ${formatDate(order.date)}<br>Delivery: ${formatDate(order.delivery)}</div></header><div class="meta"><div><strong>Vendor</strong>${escape(order.vendor)}</div><div><strong>Buyer</strong>${escape(order.buyer)}</div><div><strong>Department</strong>${escape(order.department)}</div><div><strong>Status</strong>${escape(order.status)}</div><div><strong>Payment Terms</strong>${escape(order.payment)}</div><div><strong>Shipping</strong>${escape(order.shipping)}</div><div><strong>Currency</strong>${escape(order.currency)}</div><div><strong>Delivery Address</strong>${escape(order.address || '—')}</div></div><table><thead><tr><th>#</th><th>Item Description</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${order.items.map((item, index) => `<tr><td>${index + 1}</td><td>${escape(item[0])}</td><td>${escape(item[3] || '—')}</td><td>${Number(item[1])}</td><td>${money(item[2], order.currency)}</td><td>${money(item[1] * item[2], order.currency)}</td></tr>`).join('')}</tbody></table><div class="totals"><div><span>Subtotal</span><strong>${money(subtotal(order), order.currency)}</strong></div><div><span>Discount</span><strong>${money(0, order.currency)}</strong></div><div><span>Tax (5%)</span><strong>${money(subtotal(order) * 0.05, order.currency)}</strong></div><div class="grand"><span>Grand Total</span><strong>${money(total(order), order.currency)}</strong></div></div><div class="notes"><strong>Notes / Special Instructions</strong><p>${escape(order.notes || 'No special instructions.')}</p></div><div class="signatures"><span>Prepared By</span><span>Approved By</span><span>Vendor Acceptance</span></div>`;
        printDocument(order.id, html);
    };

    q('[data-po-new]').addEventListener('click', () => openForm());
    q('[data-po-add-item]').addEventListener('click', () => addItem());
    q('[data-po-search]').addEventListener('input', render);
    q('[data-po-filter]').addEventListener('change', render);
    q('[data-po-print-list]').addEventListener('click', () => {
        const rows = orders.map(order => `<tr><td>${escape(order.id)}</td><td>${escape(order.vendor)}</td><td>${escape(order.buyer)}</td><td>${order.items.reduce((sum, item) => sum + Number(item[1]), 0)}</td><td>${money(total(order), order.currency)}</td><td>${formatDate(order.date)}</td><td>${formatDate(order.delivery)}</td><td>${escape(order.status)}</td></tr>`).join('');
        printDocument('Purchase Orders List', `<header class="head"><div><h1>Purchase Orders</h1><p>Purchase Order Summary</p></div><div>${new Date().toLocaleDateString('en-US')}</div></header><table><thead><tr><th>PO Number</th><th>Vendor</th><th>Buyer</th><th>Items</th><th>PO Value</th><th>Order Date</th><th>Delivery Date</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`);
    });
    q('[data-po-form]').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const items = [...section.querySelectorAll('.po-item-row')].map(row => [row.querySelector('[name="itemName"]').value.trim(), Number(row.querySelector('[name="quantity"]').value), Number(row.querySelector('[name="price"]').value), row.querySelector('[name="code"]').value.trim()]);
        if (!items.length || items.some(item => !item[0] || item[1] < 1 || item[2] < 0)) return showToast('Please add at least one valid order item.');
        const existing = orders.find(order => order.id === editingId);
        const sequence = Math.max(0, ...orders.map(order => Number(order.id.match(/^PO-\d{4}-(\d+)$/)?.[1]) || 0)) + 1;
        const order = { id: existing?.id || `PO-${new Date().getFullYear()}-${String(sequence).padStart(3, '0')}`, vendor: form.elements.vendor.value.trim(), buyer: form.elements.buyer.value.trim(), date: form.elements.date.value, delivery: form.elements.delivery.value, status: existing?.status || 'Draft', payment: form.elements.payment.value, shipping: form.elements.shipping.value, currency: form.elements.currency.value, department: form.elements.department.value, address: form.elements.address.value.trim(), notes: form.elements.notes.value.trim(), items };
        if (existing) orders = orders.map(item => item.id === editingId ? order : item);
        else orders.unshift(order);
        save();
        closeForm();
        render();
        showToast(existing ? 'Purchase order updated.' : 'Purchase order created.');
    });
    q('[data-po-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-po-action]');
        if (!button) return;
        const order = orders.find(item => item.id === button.dataset.id);
        if (!order) return;
        if (button.dataset.poAction === 'view') {
            viewingId = order.id;
            q('[data-po-view-content]').innerHTML = details(order);
            q('[data-po-view-overlay]').classList.add('is-open');
        } else if (button.dataset.poAction === 'edit') {
            openForm(order);
        } else if (button.dataset.poAction === 'print') {
            printOrder(order);
        } else if (button.dataset.poAction === 'delete' && confirm(`Delete purchase order ${order.id}?`)) {
            orders = orders.filter(item => item.id !== order.id);
            save();
            render();
            showToast('Purchase order deleted.');
        }
    });
    q('[data-po-form]').elements.currency.addEventListener('change', calculate);
    q('[data-po-close-form]').addEventListener('click', closeForm);
    q('[data-po-cancel]').addEventListener('click', closeForm);
    section.querySelectorAll('[data-po-close-view]').forEach(button => button.addEventListener('click', closeView));
    q('[data-po-print-current]').addEventListener('click', () => {
        const order = orders.find(item => item.id === viewingId);
        if (order) printOrder(order);
    });
    section.querySelectorAll('.po-overlay').forEach(overlay => overlay.addEventListener('click', event => {
        if (event.target === overlay) overlay.classList.remove('is-open');
    }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            q('[data-po-form-overlay]').classList.remove('is-open');
            closeView();
        }
    });
    render();
    return section;
}