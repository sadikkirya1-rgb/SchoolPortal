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
            <div class="po-toolbar"><label class="po-search"><i class="fas fa-search" aria-hidden="true"></i><span class="po-sr-only">Search purchase orders</span><input type="search" data-po-search placeholder="Search PO, vendor, buyer..."></label><select class="po-filter" data-po-filter aria-label="Filter by status"><option value="">All Statuses</option><option>Draft</option><option>Pending Approval</option><option>Approved</option><option>Rejected</option><option>Sent</option><option>Confirmed</option><option>Received</option><option>Cancelled</option></select><button class="po-button po-light" type="button" data-po-print-list><i class="fas fa-print"></i> Print PO List</button></div>
            <div class="po-table-wrap"><table class="po-table"><thead><tr><th>PO Number</th><th>Vendor</th><th>Buyer</th><th>Items</th><th>PO Value</th><th>Order Date</th><th>Delivery Date</th><th>Attachments</th><th>Order / Approval Status</th><th>Actions</th></tr></thead><tbody data-po-rows></tbody></table></div>
        </section>
        <div class="po-overlay" data-po-form-overlay><section class="po-modal" role="dialog" aria-modal="true" aria-labelledby="po-form-title"><header class="po-modal-head"><h3 id="po-form-title">Create Purchase Order</h3><button class="po-close" type="button" data-po-close-form aria-label="Close">&times;</button></header>
            <form class="po-form" data-po-form><div class="po-grid">
                <label>Vendor / Supplier<select name="vendor" required><option value="">Select supplier</option></select></label><label>Buyer / Purchaser<input name="buyer" required placeholder="e.g. Ahmed Khan"></label>
                <label>Purchase Request<select name="sourceRequestId"><option value="">No linked purchase request</option></select></label>
                <label>Quotation<select name="quotationId"><option value="">No linked quotation</option></select></label>
                <label>Purchase Comparison<select name="comparisonId"><option value="">No linked comparison</option></select></label>
                <label>PO Date<input name="date" type="date" required></label><label>Expected Delivery Date<input name="delivery" type="date" required></label>
                <label>Payment Terms<select name="payment"><option>Net 30</option><option>Net 15</option><option>Net 60</option><option>Due on Delivery</option><option>Advance Payment</option></select></label>
                <label>Shipping Method<select name="shipping"><option>Standard Delivery</option><option>Express Delivery</option><option>Courier</option><option>Vendor Delivery</option><option>Pickup</option></select></label>
                <label>Currency<select name="currency"><option value="UGX" selected>UGX - Ugandan Shilling</option><option value="USD">USD - US Dollar</option><option value="AED">AED - UAE Dirham</option><option value="EUR">EUR - Euro</option><option value="GBP">GBP - British Pound</option></select></label>
                <label>Department<select name="department"><option>Procurement</option><option>IT</option><option>Finance</option><option>HR</option><option>Operations</option><option>Marketing</option><option>Administration</option></select></label>
                <label class="po-full">Delivery Address<textarea name="address" placeholder="Enter delivery address..."></textarea></label><label class="po-full">Notes / Special Instructions<textarea name="notes" placeholder="Enter notes, terms or special instructions..."></textarea></label>
            </div>
            <div class="po-items"><div class="po-items-head"><h4>Purchase Order Items</h4><button class="po-button po-light" type="button" data-po-add-item><i class="fas fa-plus"></i> Add Item</button></div><div data-po-items></div>
                <div class="po-totals"><div><span>Subtotal</span><strong data-po-subtotal>UGX 0</strong></div><div><span>Discount</span><strong data-po-discount>UGX 0</strong></div><div><span>Tax (5%)</span><strong data-po-tax>UGX 0</strong></div><div class="po-grand"><span>Grand Total</span><strong data-po-total>UGX 0</strong></div></div>
            </div><footer class="po-modal-actions"><button class="po-button po-light" type="button" data-po-cancel>Cancel</button><button class="po-button po-light" type="submit" data-po-submit="Draft">Save Draft</button><button class="po-button po-primary" type="submit" data-po-submit="Pending">Submit for Approval</button></footer></form>
        </section></div>
        <div class="po-overlay" data-po-view-overlay><section class="po-modal" role="dialog" aria-modal="true" aria-labelledby="po-view-title"><header class="po-modal-head"><h3 id="po-view-title">Purchase Order Details</h3><button class="po-close" type="button" data-po-close-view aria-label="Close">&times;</button></header><div class="po-view" data-po-view-content></div><footer class="po-modal-actions"><button class="po-button po-light" type="button" data-po-close-view>Close</button><button class="po-button po-primary" type="button" data-po-print-current><i class="fas fa-print"></i> Print / PDF</button></footer></section></div>
        <div class="po-overlay" data-po-attachments-overlay><section class="po-modal po-attachments-modal" role="dialog" aria-modal="true" aria-labelledby="po-attachments-title"><header class="po-modal-head"><h3 data-po-attachments-title id="po-attachments-title">Purchase Order Attachments</h3><button class="po-close" type="button" data-po-close-attachments aria-label="Close">&times;</button></header><div class="po-attachments-content" data-po-attachments-content></div><footer class="po-modal-actions"><button class="po-button po-light" type="button" data-po-close-attachments>Close</button></footer></section></div>
        <div class="po-toast" role="status" aria-live="polite" data-po-toast></div>`;

    const storageKey = 'schoolPurchaseOrders';
    const approvalStages = [
        { title: 'Department Head', role: 'deputyHeadTeacher' },
        { title: 'Procurement Officer', role: 'storeManager' },
        { title: 'Finance Manager', role: 'bursar' },
        { title: 'Principal', role: 'headTeacher' },
        { title: 'Director', role: 'director' }
    ];

    let orders;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        orders = Array.isArray(stored) ? stored : [];
    } catch (error) {
        orders = [];
    }
    let editingId = null;
    let viewingId = null;
    let toastTimer;
    let purchaseRequests = [];
    let suppliers = [];
    let quotations = [];
    let comparisons = [];
    const q = selector => section.querySelector(selector);
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    const money = (value, currency = 'UGX') => new Intl.NumberFormat('en-UG', { style: 'currency', currency }).format(Number(value) || 0);
    const identity = () => window.schoolPortalData?.getIdentity?.();
    const roleKey = role => String(role || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const isApprovalAdmin = () => ['schooladmin', 'superadmin'].includes(roleKey(identity()?.role));
    const canEditOrders = () => ['schooladmin', 'superadmin', 'director', 'headteacher'].includes(roleKey(identity()?.role))
        || identity()?.permissions?.purchaseOrders?.edit === true
        || (['deputyheadteacher', 'storemanager', 'bursar'].includes(roleKey(identity()?.role))
            && identity()?.permissions?.purchaseOrders === undefined);
    const createApprovalStages = () => approvalStages.map((stage, index) => ({
        ...stage, status: index === 0 ? 'Pending' : 'Waiting', decidedBy: '', decidedByUid: '', approvedAt: '', rejectionReason: ''
    }));
    const currentStageIndex = order => Number.isInteger(order.currentApprovalStage)
        ? order.currentApprovalStage : (order.approvalStages || []).findIndex(stage => stage.status === 'Pending');
    const canDecideCurrentStage = order => {
        const stage = order.approvalStages?.[currentStageIndex(order)];
        return order.approvalStatus === 'Pending' && stage?.status === 'Pending' && canEditOrders()
            && (isApprovalAdmin() || roleKey(identity()?.role) === roleKey(stage.role));
    };
    const approvalProgress = order => {
        if (order.approvalStatus === 'Draft') return 'Not submitted';
        if (order.approvalStatus === 'Rejected') {
            const rejected = (order.approvalStages || []).find(stage => stage.status === 'Rejected');
            return rejected ? `Rejected · ${rejected.title}` : 'Rejected';
        }
        if (order.approvalStatus === 'Approved') return '5/5 approvals';
        const index = currentStageIndex(order);
        return index >= 0 ? `${index + 1}/5 · ${order.approvalStages[index].title}` : 'Approval stages not recorded';
    };
    const archiveApprovalRound = order => {
        const history = Array.isArray(order.approvalHistory) ? [...order.approvalHistory] : [];
        if (order.approvalStages?.some(stage => stage.status === 'Rejected')) {
            history.push({ approvalStages: order.approvalStages.map(stage => ({ ...stage })), rejectionReason: order.rejectionReason || '', decisionAt: order.decisionAt || '', decisionBy: order.decisionBy || '' });
        }
        return history;
    };
    const subtotal = order => order.items.reduce((sum, item) => sum + Number(item[1]) * Number(item[2]), 0);
    const total = order => subtotal(order) * 1.05;
    const formatDate = value => {
        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime()) ? escape(value) : date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };
    const save = () => localStorage.setItem(storageKey, JSON.stringify(orders));
    const readProcurementList = key => {
        try {
            const stored = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(stored) ? stored.filter(record => record && record.deleted !== true) : [];
        } catch (error) {
            console.error(`Unable to load ${key} records for purchase order linking.`, error);
            return [];
        }
    };
    const setSelectOptions = (selector, placeholder, records, getId, getLabel, selected) => {
        const select = q(selector);
        select.replaceChildren(new Option(placeholder, ''));
        records.filter(record => getId(record)).forEach(record => {
            select.add(new Option(getLabel(record), String(getId(record))));
        });
        if (selected && !Array.from(select.options).some(option => option.value === String(selected))) {
            select.add(new Option(`${selected} — Record unavailable`, String(selected)));
        }
        select.value = selected || '';
    };
    const refreshProcurementOptions = () => {
        const selected = {
            vendor: q('[name="vendor"]').value,
            request: q('[name="sourceRequestId"]').value,
            quotation: q('[name="quotationId"]').value,
            comparison: q('[name="comparisonId"]').value
        };
        purchaseRequests = readProcurementList('schoolPurchaseRequests');
        suppliers = readProcurementList('schoolSupplierDirectory');
        quotations = readProcurementList('schoolQuotations');
        comparisons = readProcurementList('schoolPurchaseComparisons');
        setSelectOptions('[name="vendor"]', 'Select supplier', suppliers,
            supplier => supplier.name || supplier.companyName || supplier.supplierName,
            supplier => `${supplier.name || supplier.companyName || supplier.supplierName}${supplier.id ? ` (${supplier.id})` : ''}${supplier.status ? ` — ${supplier.status}` : ''}`,
            selected.vendor);
        setSelectOptions('[name="sourceRequestId"]', 'No linked purchase request', purchaseRequests,
            request => request.id,
            request => `${request.id} — ${request.requester || request.department || 'Purchase request'}`,
            selected.request);
        setSelectOptions('[name="quotationId"]', 'No linked quotation', quotations,
            quotation => quotation.id,
            quotation => `${quotation.id} — ${quotation.supplier || 'Supplier'}${quotation.request ? ` · ${quotation.request}` : ''}`,
            selected.quotation);
        setSelectOptions('[name="comparisonId"]', 'No linked comparison', comparisons,
            comparison => comparison.id,
            comparison => `${comparison.id} — ${comparison.requirement || comparison.request || 'Purchase comparison'}`,
            selected.comparison);
    };
    const normalizeReference = value => String(value || '').trim().toLowerCase();
    const poDocuments = order => {
        if (!order) return [];
        const quotation = quotations.find(item => normalizeReference(item.id) === normalizeReference(order.quotationId));
        const comparison = comparisons.find(item => normalizeReference(item.id) === normalizeReference(order.comparisonId));
        const requestIds = new Set([
            order.sourceRequestId || order.requestId,
            quotation?.request || quotation?.requestId,
            comparison?.request || comparison?.requestId
        ].map(normalizeReference).filter(Boolean));
        const relatedRequests = purchaseRequests.filter(request => requestIds.has(normalizeReference(request.id)));
        const receipts = readProcurementList('schoolGoodsReceipts').filter(receipt =>
            normalizeReference(receipt.po || receipt.purchaseOrder || receipt.poNumber) === normalizeReference(order.id));
        const documents = [
            { type: 'Purchase Order', record: order },
            ...relatedRequests.map(record => ({ type: 'Purchase Request', record })),
            ...(quotation ? [{ type: 'Quotation', record: quotation }] : []),
            ...(comparison ? [{ type: 'Purchase Comparison', record: comparison }] : []),
            ...receipts.map(record => ({ type: 'Goods Receipt', record }))
        ];
        return documents.filter((document, index, list) =>
            list.findIndex(item => item.type === document.type && item.record === document.record) === index);
    };
    const attachmentFiles = record => [record.attachments, record.documents, record.files, record.attachment]
        .flatMap(value => Array.isArray(value) ? value : value ? [value] : [])
        .map((file, index) => {
            const entry = typeof file === 'string' ? { url: file } : file || {};
            const url = String(entry.url || entry.fileUrl || entry.downloadURL || entry.downloadUrl || entry.href || '').trim();
            if (!url) return null;
            try {
                const parsed = new URL(url, window.location.href);
                if (['https:', 'http:'].includes(parsed.protocol)
                    || (parsed.protocol === 'data:' && /^data:(application\/pdf|image\/(?:png|jpe?g|gif|webp));/i.test(url))) {
                    return { name: String(entry.name || entry.fileName || entry.title || `Attached document ${index + 1}`), url: parsed.href };
                }
            } catch (error) {
                console.warn('Skipping an invalid purchase order attachment URL.', error);
            }
            return null;
        }).filter(Boolean);
    const showAttachments = order => {
        const documents = poDocuments(order);
        q('[data-po-attachments-title]').textContent = `Attachments for ${order.id}`;
        q('[data-po-attachments-content]').innerHTML = documents.map(({ type, record }) => {
            const files = attachmentFiles(record);
            const identifier = record.id || record.poNumber || record.grnNumber || type;
            return `<article class="po-attachment-record"><header><strong>${escape(type)} · ${escape(identifier)}</strong><span>${escape(record.status || 'Record')}</span></header>${files.length
                ? `<ul>${files.map(file => `<li><a href="${escape(file.url)}" target="_blank" rel="noopener noreferrer"><i class="fas fa-paperclip" aria-hidden="true"></i> ${escape(file.name)}</a></li>`).join('')}</ul>`
                : '<p>No attached files in this record.</p>'}</article>`;
        }).join('') || '<p class="po-attachment-empty">No linked procurement documents were found.</p>';
        q('[data-po-attachments-overlay]').classList.add('is-open');
    };
    const showToast = message => {
        const toast = q('[data-po-toast]');
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
    };
    const updateStats = () => {
        q('[data-po-stat="count"]').textContent = orders.length;
        q('[data-po-stat="pending"]').textContent = orders.filter(order => order.approvalStatus === 'Pending' || ['Draft', 'Sent', 'Confirmed'].includes(order.status)).length;
        q('[data-po-stat="received"]').textContent = orders.filter(order => order.status === 'Received').length;
        q('[data-po-stat="value"]').textContent = money(orders.reduce((sum, order) => sum + total(order), 0)).replace(/\.00$/, '');
    };
    const render = () => {
        const search = q('[data-po-search]').value.trim().toLowerCase();
        const status = q('[data-po-filter]').value;
        const filtered = orders.filter(order => {
            const matchesStatus = !status || order.status === status
                || (status === 'Pending Approval' && order.approvalStatus === 'Pending')
                || (status === 'Approved' && order.approvalStatus === 'Approved')
                || (status === 'Rejected' && order.approvalStatus === 'Rejected');
            return matchesStatus && (!search || JSON.stringify(order).toLowerCase().includes(search));
        });
        q('[data-po-rows]').innerHTML = filtered.length ? filtered.map(order => {
            const initials = order.vendor.split(/\s+/).map(part => part[0] || '').slice(0, 2).join('').toUpperCase();
            const itemCount = order.items.reduce((sum, item) => sum + Number(item[1]), 0);
            const attachmentCount = poDocuments(order).reduce((count, document) => count + attachmentFiles(document.record).length, 0);
            const attachmentAction = `<button class="po-action po-preview-attachments" type="button" title="Preview ${attachmentCount} attached file(s)" aria-label="Preview ${attachmentCount} attachments for ${escape(order.id)}" data-po-action="attachments" data-id="${escape(order.id)}"><i class="fas fa-paperclip"></i><span>Preview (${attachmentCount})</span></button>`;
            const receiveAction = order.status === 'Received' || order.status === 'Cancelled' || (order.approvalStatus && order.approvalStatus !== 'Approved') ? '' : `<button class="po-action po-receive" type="button" title="Mark as received" aria-label="Mark ${escape(order.id)} as received" data-po-action="receive" data-id="${escape(order.id)}"><i class="fas fa-check"></i><span>Receive</span></button>`;
            const approvalActions = canDecideCurrentStage(order) ? `<button class="po-action po-approve" type="button" title="Approve current stage" aria-label="Approve ${escape(order.id)} at ${escape(order.approvalStages[currentStageIndex(order)].title)} stage" data-po-action="approve" data-id="${escape(order.id)}"><i class="fas fa-check"></i><span>Approve</span></button><button class="po-action po-reject" type="button" title="Reject" aria-label="Reject ${escape(order.id)}" data-po-action="reject" data-id="${escape(order.id)}"><i class="fas fa-xmark"></i><span>Reject</span></button>` : '';
            const submitAction = ['Draft', 'Rejected'].includes(order.approvalStatus || 'Draft') && canEditOrders() ? `<button class="po-action po-receive" type="button" title="Submit for approval" aria-label="Submit ${escape(order.id)} for approval" data-po-action="submit" data-id="${escape(order.id)}"><i class="fas fa-paper-plane"></i><span>Submit</span></button>` : '';
            const editAction = ['Draft', 'Rejected'].includes(order.approvalStatus || 'Draft') && canEditOrders() ? `<button class="po-action" type="button" title="Edit" aria-label="Edit ${escape(order.id)}" data-po-action="edit" data-id="${escape(order.id)}"><i class="fas fa-pen"></i></button>` : '';
            return `<tr><td><strong class="po-id">${escape(order.id)}</strong></td><td><span class="po-vendor"><span class="po-vendor-logo">${escape(initials)}</span><b>${escape(order.vendor)}</b></span></td><td>${escape(order.buyer)}</td><td>${itemCount} item(s)</td><td><strong>${money(total(order), order.currency)}</strong></td><td>${formatDate(order.date)}</td><td>${formatDate(order.delivery)}</td><td>${attachmentAction}</td><td><span class="po-badge ${escape(order.status.toLowerCase())}">${escape(order.status)}</span><span class="po-approval-state ${escape((order.approvalStatus || 'Draft').toLowerCase())}">${escape(order.approvalStatus || 'Approval Draft')}</span><small class="po-approval-progress">${escape(approvalProgress(order))}</small></td><td><div class="po-actions"><button class="po-action" type="button" title="View" aria-label="View ${escape(order.id)}" data-po-action="view" data-id="${escape(order.id)}"><i class="fas fa-eye"></i></button>${editAction}<button class="po-action" type="button" title="Print" aria-label="Print ${escape(order.id)}" data-po-action="print" data-id="${escape(order.id)}"><i class="fas fa-print"></i></button>${submitAction}${approvalActions}${receiveAction}<button class="po-action po-delete" type="button" title="Delete" aria-label="Delete ${escape(order.id)}" data-po-action="delete" data-id="${escape(order.id)}"><i class="fas fa-trash"></i></button></div></td></tr>`;
        }).join('') : '<tr><td colspan="10"><div class="po-empty">No purchase orders found.</div></td></tr>';
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
        refreshProcurementOptions();
        form.reset();
        q('[data-po-items]').replaceChildren();
        editingId = order?.id ?? null;
        q('#po-form-title').textContent = order ? 'Edit Purchase Order' : 'Create Purchase Order';
        const today = new Date().toISOString().slice(0, 10);
        form.elements.date.value = order?.date || today;
        form.elements.delivery.value = order?.delivery || today;
        const linkedRequestId = order?.sourceRequestId || order?.requestId;
        if (linkedRequestId && !Array.from(form.elements.sourceRequestId.options).some(option => option.value === String(linkedRequestId))) {
            form.elements.sourceRequestId.add(new Option(`${linkedRequestId} — Purchase request record unavailable`, linkedRequestId));
        }
        [
            ['vendor', order?.vendor, 'Supplier'],
            ['quotationId', order?.quotationId || order?.quotation, 'Quotation'],
            ['comparisonId', order?.comparisonId || order?.comparison, 'Purchase comparison']
        ].forEach(([field, value, label]) => {
            if (value && !Array.from(form.elements[field].options).some(option => option.value === String(value))) {
                form.elements[field].add(new Option(`${value} — ${label} record unavailable`, value));
            }
        });
        form.elements.sourceRequestId.value = order?.sourceRequestId || order?.requestId || '';
        form.elements.quotationId.value = order?.quotationId || order?.quotation || '';
        form.elements.comparisonId.value = order?.comparisonId || order?.comparison || '';
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
    const approvalTracker = order => {
        const current = (order.approvalStages || []).map((stage, index) => `<tr><td>${index + 1}</td><td>${escape(stage.title)}</td><td>${escape(stage.status)}</td><td>${escape(stage.decidedBy || '—')}</td><td>${stage.approvedAt ? formatDate(stage.approvedAt.slice(0, 10)) : escape(stage.rejectionReason || '—')}</td></tr>`).join('');
        const history = (order.approvalHistory || []).map((round, index) => `<details class="po-approval-history"><summary>Previous submission ${index + 1}</summary><div class="po-table-wrap"><table class="po-table po-approval-table"><thead><tr><th>Stage</th><th>Signatory</th><th>Status</th><th>Signer</th><th>Date / Reason</th></tr></thead><tbody>${(round.approvalStages || []).map((stage, stageIndex) => `<tr><td>${stageIndex + 1}</td><td>${escape(stage.title)}</td><td>${escape(stage.status)}</td><td>${escape(stage.decidedBy || '—')}</td><td>${stage.approvedAt ? formatDate(stage.approvedAt.slice(0, 10)) : escape(stage.rejectionReason || '—')}</td></tr>`).join('')}</tbody></table></div></details>`).join('');
        return `<div class="po-table-wrap"><table class="po-table po-approval-table"><thead><tr><th>Stage</th><th>Signatory</th><th>Status</th><th>Signer</th><th>Date / Reason</th></tr></thead><tbody>${current || '<tr><td colspan="5">No approval stages recorded.</td></tr>'}</tbody></table></div>${history}`;
    };
    const details = order => `<div class="po-detail-grid">
        ${[['PO Number', order.id], ['Order Status', order.status], ['Approval Status', approvalProgress(order)], ['Vendor', order.vendor], ['Buyer', order.buyer], ['Purchase Request', order.sourceRequestId || order.requestId || 'Not linked'], ['Quotation', order.quotationId || order.quotation || 'Not linked'], ['Purchase Comparison', order.comparisonId || order.comparison || 'Not linked'], ['Order Date', formatDate(order.date)], ['Expected Delivery', formatDate(order.delivery)], ['Payment Terms', order.payment], ['Shipping Method', order.shipping], ['Currency', order.currency], ['Department', order.department], ['Delivery Address', order.address || 'Not provided'], ['Notes', order.notes || 'Not provided'], ['Rejection Reason', order.rejectionReason || 'Not applicable']].map(([label, value]) => `<div class="po-info-box"><h4>${escape(label)}</h4><p>${label === 'Order Status' ? `<span class="po-badge ${escape(String(value).toLowerCase())}">${escape(value)}</span>` : escape(value)}</p></div>`).join('')}
        </div><h4 class="po-details-title">Approval Workflow</h4>${approvalTracker(order)}<h4 class="po-details-title">Order Items</h4><div class="po-table-wrap"><table class="po-table po-details-table"><thead><tr><th>Item</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${order.items.map(item => `<tr><td>${escape(item[0])}</td><td>${escape(item[3] || '—')}</td><td>${Number(item[1])}</td><td>${money(item[2], order.currency)}</td><td>${money(item[1] * item[2], order.currency)}</td></tr>`).join('')}</tbody></table></div><div class="po-totals"><div><span>Subtotal</span><strong>${money(subtotal(order), order.currency)}</strong></div><div><span>Discount</span><strong>${money(0, order.currency)}</strong></div><div><span>Tax (5%)</span><strong>${money(subtotal(order) * 0.05, order.currency)}</strong></div><div class="po-grand"><span>Grand Total</span><strong>${money(total(order), order.currency)}</strong></div></div>`;
    const printDocument = (title, html) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return showToast('Allow pop-ups to print purchase orders.');
        printWindow.document.write(`<!doctype html><html><head><title>${escape(title)}</title><meta charset="utf-8"><style>body{font:14px Arial,sans-serif;color:#172033;padding:32px}h1{font-size:24px;margin:0}p{color:#475569}.head{display:flex;justify-content:space-between;border-bottom:2px solid #172033;padding-bottom:14px;margin-bottom:20px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0}.meta strong{display:block;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #cbd5e1;padding:9px;text-align:left}th{background:#f1f5f9}.totals{width:280px;margin:18px 0 0 auto}.totals div{display:flex;justify-content:space-between;padding:6px;border-bottom:1px solid #e2e8f0}.grand{font-size:17px;font-weight:bold}.notes{margin-top:24px}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:35px;margin-top:70px}.signatures span{border-top:1px solid #475569;padding-top:8px}@media print{body{padding:0}}</style></head><body>${html}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    const printOrder = order => {
        const approvals = (order.approvalStages || []).map((stage, index) => `<tr><td>${index + 1}</td><td>${escape(stage.title)}</td><td>${escape(stage.status)}</td><td>${escape(stage.decidedBy || '—')}</td><td>${stage.approvedAt ? formatDate(stage.approvedAt.slice(0, 10)) : escape(stage.rejectionReason || '—')}</td></tr>`).join('');
        const html = `<header class="head"><div><h1>Purchase Order</h1><p>Procurement Department</p></div><div><strong>${escape(order.id)}</strong><br>Order Date: ${formatDate(order.date)}<br>Delivery: ${formatDate(order.delivery)}</div></header><div class="meta"><div><strong>Vendor</strong>${escape(order.vendor)}</div><div><strong>Buyer</strong>${escape(order.buyer)}</div><div><strong>Purchase Request</strong>${escape(order.sourceRequestId || order.requestId || 'Not linked')}</div><div><strong>Department</strong>${escape(order.department)}</div><div><strong>Order / Approval Status</strong>${escape(order.status)} / ${escape(approvalProgress(order))}</div><div><strong>Payment Terms</strong>${escape(order.payment)}</div><div><strong>Shipping</strong>${escape(order.shipping)}</div><div><strong>Currency</strong>${escape(order.currency)}</div><div><strong>Delivery Address</strong>${escape(order.address || '—')}</div></div><table><thead><tr><th>#</th><th>Item Description</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${order.items.map((item, index) => `<tr><td>${index + 1}</td><td>${escape(item[0])}</td><td>${escape(item[3] || '—')}</td><td>${Number(item[1])}</td><td>${money(item[2], order.currency)}</td><td>${money(item[1] * item[2], order.currency)}</td></tr>`).join('')}</tbody></table><div class="totals"><div><span>Subtotal</span><strong>${money(subtotal(order), order.currency)}</strong></div><div><span>Discount</span><strong>${money(0, order.currency)}</strong></div><div><span>Tax (5%)</span><strong>${money(subtotal(order) * 0.05, order.currency)}</strong></div><div class="grand"><span>Grand Total</span><strong>${money(total(order), order.currency)}</strong></div></div><h2>Approval Workflow</h2><table><thead><tr><th>Stage</th><th>Signatory</th><th>Status</th><th>Signer</th><th>Date / Reason</th></tr></thead><tbody>${approvals || '<tr><td colspan="5">No approval stages recorded.</td></tr>'}</tbody></table><div class="notes"><strong>Notes / Special Instructions</strong><p>${escape(order.notes || 'No special instructions.')}</p></div>`;
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
        if (!canEditOrders()) return showToast('Your account cannot edit Purchase Orders.');
        const form = event.currentTarget;
        const items = [...section.querySelectorAll('.po-item-row')].map(row => [row.querySelector('[name="itemName"]').value.trim(), Number(row.querySelector('[name="quantity"]').value), Number(row.querySelector('[name="price"]').value), row.querySelector('[name="code"]').value.trim()]);
        if (!items.length || items.some(item => !item[0] || item[1] < 1 || item[2] < 0)) return showToast('Please add at least one valid order item.');
        const existing = orders.find(order => order.id === editingId);
        const sequence = Math.max(0, ...orders.map(order => Number(order.id.match(/^PO-\d{4}-(\d+)$/)?.[1]) || 0)) + 1;
        const submitForApproval = event.submitter?.dataset.poSubmit === 'Pending';
        const nextStatus = submitForApproval ? 'Pending' : 'Draft';
        const order = {
            ...existing,
            id: existing?.id || `PO-${new Date().getFullYear()}-${String(sequence).padStart(3, '0')}`,
            vendor: form.elements.vendor.value.trim(), buyer: form.elements.buyer.value.trim(),
            date: form.elements.date.value, delivery: form.elements.delivery.value,
            status: existing?.status || 'Draft',
            approvalStatus: nextStatus,
            approvalStages: submitForApproval ? createApprovalStages() : existing?.approvalStages || [],
            currentApprovalStage: submitForApproval ? 0 : existing?.currentApprovalStage,
            approvalHistory: submitForApproval && existing ? archiveApprovalRound(existing) : existing?.approvalHistory || [],
            rejectionReason: submitForApproval ? '' : existing?.rejectionReason || '',
            decisionAt: submitForApproval ? '' : existing?.decisionAt || '',
            decisionBy: submitForApproval ? '' : existing?.decisionBy || '',
            sourceRequestId: form.elements.sourceRequestId.value,
            quotationId: form.elements.quotationId.value,
            comparisonId: form.elements.comparisonId.value,
            payment: form.elements.payment.value, shipping: form.elements.shipping.value,
            currency: form.elements.currency.value, department: form.elements.department.value,
            address: form.elements.address.value.trim(), notes: form.elements.notes.value.trim(), items
        };
        if (existing) orders = orders.map(item => item.id === editingId ? order : item);
        else orders.unshift(order);
        save();
        closeForm();
        render();
        if (submitForApproval) window.dispatchEvent(new CustomEvent('school-portal-approval-update'));
        showToast(submitForApproval ? 'Purchase order submitted for approval.' : existing ? 'Purchase order draft saved.' : 'Purchase order draft created.');
    });
    q('[data-po-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-po-action]');
        if (!button) return;
        const order = orders.find(item => item.id === button.dataset.id);
        if (!order) return;
        if (button.dataset.poAction === 'attachments') {
            showAttachments(order);
        } else if (button.dataset.poAction === 'view') {
            viewingId = order.id;
            q('[data-po-view-content]').innerHTML = details(order);
            q('[data-po-view-overlay]').classList.add('is-open');
        } else if (button.dataset.poAction === 'edit') {
            if (!canEditOrders() || !['Draft', 'Rejected'].includes(order.approvalStatus || 'Draft')) return;
            openForm(order);
        } else if (button.dataset.poAction === 'print') {
            printOrder(order);
        } else if (button.dataset.poAction === 'submit') {
            if (!canEditOrders() || !['Draft', 'Rejected'].includes(order.approvalStatus || 'Draft')) return;
            order.approvalHistory = archiveApprovalRound(order);
            order.approvalStatus = 'Pending';
            order.approvalStages = createApprovalStages();
            order.currentApprovalStage = 0;
            order.rejectionReason = '';
            order.decisionAt = '';
            order.decisionBy = '';
            save();
            render();
            window.dispatchEvent(new CustomEvent('school-portal-approval-update'));
            showToast('Purchase order submitted for approval.');
        } else if (button.dataset.poAction === 'approve' || button.dataset.poAction === 'reject') {
            if (!canDecideCurrentStage(order)) return showToast('Only the assigned signatory for the current approval step can decide this order.');
            const isApproval = button.dataset.poAction === 'approve';
            const stageIndex = currentStageIndex(order);
            const stage = order.approvalStages[stageIndex];
            const reason = isApproval ? '' : window.prompt(`Why is ${stage.title} rejecting ${order.id}?`);
            if (!isApproval && reason === null) return;
            if (!isApproval && !reason.trim()) return showToast('Enter a reason before rejecting this order.');
            const signer = isApprovalAdmin() ? 'Admin (on behalf)' : window.schoolPortalFirebase?.auth?.currentUser?.displayName || identity()?.displayName || identity()?.fullName || identity()?.uid || 'Approver';
            const timestamp = new Date().toISOString();
            stage.decidedBy = signer;
            stage.decidedByUid = identity()?.uid || '';
            stage.approvedAt = timestamp;
            if (isApproval) {
                stage.status = 'Approved';
                order.currentApprovalStage = stageIndex + 1;
                if (order.currentApprovalStage === order.approvalStages.length) {
                    order.approvalStatus = 'Approved';
                    order.decisionAt = timestamp;
                    order.decisionBy = signer;
                } else {
                    order.approvalStages[order.currentApprovalStage].status = 'Pending';
                }
            } else {
                stage.status = 'Rejected';
                stage.rejectionReason = reason.trim();
                order.approvalStatus = 'Rejected';
                order.rejectionReason = reason.trim();
                order.decisionAt = timestamp;
                order.decisionBy = signer;
                order.approvalStages.slice(stageIndex + 1).forEach(next => { next.status = 'Not required'; });
            }
            save();
            render();
            window.dispatchEvent(new CustomEvent('school-portal-approval-update'));
            showToast(isApproval
                ? isApprovalAdmin() ? `Admin approved for ${stage.title} on behalf.` : `${stage.title} approved.`
                : isApprovalAdmin() ? `Admin rejected for ${stage.title} on behalf.` : `${stage.title} rejected the purchase order.`);
        } else if (button.dataset.poAction === 'receive') {
            if (order.approvalStatus && order.approvalStatus !== 'Approved') return showToast('This order must receive all five approvals before receipt.');
            order.status = 'Received';
            save();
            render();
            showToast(`${order.id} marked as received. Find it under Closed POs.`);
        } else if (button.dataset.poAction === 'delete') {
            if (!canEditOrders()) return showToast('Your account cannot delete Purchase Orders.');
            if (!confirm(`Delete purchase order ${order.id}?`)) return;
            orders = orders.filter(item => item.id !== order.id);
            save();
            render();
            showToast('Purchase order deleted.');
        }
    });
    q('[data-po-form]').elements.currency.addEventListener('change', calculate);
    refreshProcurementOptions();
    window.addEventListener('school-portal-cloud-data-update', event => {
        if (['purchaseRequests', 'suppliers', 'quotations', 'purchaseComparisons', 'goodsReceipts'].includes(event.detail?.collection)) {
            refreshProcurementOptions();
            render();
        }
    });
    window.addEventListener('storage', event => {
        if (['schoolPurchaseRequests', 'schoolSupplierDirectory', 'schoolQuotations', 'schoolPurchaseComparisons', 'schoolGoodsReceipts'].includes(event.key)) {
            refreshProcurementOptions();
            render();
        }
    });
    q('[data-po-close-form]').addEventListener('click', closeForm);
    q('[data-po-cancel]').addEventListener('click', closeForm);
    section.querySelectorAll('[data-po-close-view]').forEach(button => button.addEventListener('click', closeView));
    section.querySelectorAll('[data-po-close-attachments]').forEach(button => button.addEventListener('click', () => q('[data-po-attachments-overlay]').classList.remove('is-open')));
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
            q('[data-po-attachments-overlay]').classList.remove('is-open');
        }
    });
    render();
    return section;
}