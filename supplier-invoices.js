function createSupplierInvoicesModule() {
    const section = document.createElement('section');
    section.className = 'module supplier-invoices-module hidden';
    section.id = 'supplierInvoicesModule';
    section.innerHTML = `
        <header class="si-header"><div><h2>Supplier Invoices</h2><p>Manage supplier bills, approvals, payment status and outstanding balances</p></div><button class="si-button si-primary" type="button" data-si-new><i class="fas fa-plus"></i> New Invoice</button></header>
        <section class="si-stats" aria-label="Supplier invoice summary"><article class="si-stat"><div><span>Total Invoices</span><strong data-si-stat="total">0</strong></div><i class="fas fa-file-invoice"></i></article><article class="si-stat"><div><span>Pending Approval</span><strong data-si-stat="pending">0</strong></div><i class="fas fa-clock"></i></article><article class="si-stat"><div><span>Paid</span><strong data-si-stat="paid">0</strong></div><i class="fas fa-circle-check"></i></article><article class="si-stat"><div><span>Outstanding</span><strong data-si-stat="outstanding">$0</strong></div><i class="fas fa-wallet"></i></article><article class="si-stat"><div><span>Overdue</span><strong data-si-stat="overdue">$0</strong></div><i class="fas fa-triangle-exclamation"></i></article></section>
        <section class="si-content" aria-label="Supplier invoice records"><div class="si-toolbar"><label class="si-search"><i class="fas fa-search" aria-hidden="true"></i><span class="si-sr-only">Search supplier invoices</span><input type="search" data-si-search placeholder="Search invoice, supplier, PO..."></label><select class="si-filter" data-si-filter aria-label="Filter by status"><option value="">All Statuses</option><option>Draft</option><option>Pending Approval</option><option>Approved</option><option>Partially Paid</option><option>Paid</option><option>Overdue</option><option>Rejected</option><option>Cancelled</option></select><button class="si-button si-light" type="button" data-si-print-list><i class="fas fa-print"></i> Print Report</button></div>
            <div class="si-table-wrap"><table class="si-table"><thead><tr><th>Invoice No.</th><th>Supplier</th><th>PO / GRN</th><th>Attachments</th><th>Invoice Date</th><th>Due Date</th><th>Total Amount</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead><tbody data-si-rows></tbody></table></div></section>
        <div class="si-overlay" data-si-form-overlay><section class="si-modal" role="dialog" aria-modal="true" aria-labelledby="si-form-title"><header class="si-modal-head"><h3 id="si-form-title">Create Supplier Invoice</h3><button class="si-close" type="button" data-si-close-form aria-label="Close">&times;</button></header>
            <form class="si-form" data-si-form><div class="si-grid">
                <label>Supplier / Vendor<input name="supplier" required placeholder="Select a purchase order"></label><label>Supplier Invoice No.<input name="invoiceNo" required placeholder="e.g. INV-2026-1001"></label><label>Purchase Order<select name="po"><option value="">Select purchase order (optional)</option></select></label>
                <div class="si-po-attachments si-full" data-si-po-attachments aria-live="polite">Select a purchase order to view its related procurement documents.</div>
                <label>Goods Receipt Note<input name="grn" placeholder="e.g. GRN-2026-001"></label><label>Invoice Date<input name="invoiceDate" type="date" required></label><label>Due Date<input name="dueDate" type="date" required></label>
                <label>Currency<select name="currency"><option value="USD">USD - US Dollar</option><option value="AED">AED - UAE Dirham</option><option value="EUR">EUR - Euro</option><option value="GBP">GBP - British Pound</option></select></label><label>Payment Terms<select name="paymentTerms"><option>Immediate</option><option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Net 60</option><option>Net 90</option></select></label><label>Invoice Status<select name="status"><option>Draft</option><option>Pending Approval</option><option>Approved</option><option>Partially Paid</option><option>Paid</option><option>Overdue</option><option>Rejected</option><option>Cancelled</option></select></label>
                <label>Payment Method<select name="paymentMethod"><option>Bank Transfer</option><option>Cheque</option><option>Credit Card</option><option>Cash</option><option>Online Transfer</option></select></label><label>Department<select name="department"><option>Procurement</option><option>Finance</option><option>Administration</option><option>IT</option><option>Operations</option><option>Human Resources</option><option>Warehouse</option><option>Facilities</option></select></label><label>Payment Reference<input name="paymentReference" placeholder="Transaction / cheque reference"></label>
                <label class="si-full">Invoice Notes<textarea name="notes" placeholder="Enter invoice notes, payment remarks, exceptions, etc."></textarea></label>
            </div>
            <div class="si-items"><div class="si-items-head"><h4>Invoice Items</h4><button class="si-button si-light" type="button" data-si-add-item><i class="fas fa-plus"></i> Add Item</button></div><div class="si-item-labels"><span>Description</span><span>Qty</span><span>Unit Price</span><span>Tax %</span><span>Line Total</span><span></span></div><div data-si-items></div>
                <div class="si-totals"><div><span>Subtotal</span><strong data-si-subtotal>$0.00</strong></div><div><span>Tax</span><strong data-si-tax>$0.00</strong></div><div><span>Paid Amount</span><strong data-si-paid>$0.00</strong></div><div class="si-grand"><span>Invoice Total</span><strong data-si-total>$0.00</strong></div></div>
                <label class="si-paid-field">Amount Already Paid<input name="paidAmount" type="number" min="0" step="0.01" value="0"></label>
            </div><footer class="si-modal-actions"><button class="si-button si-light" type="button" data-si-cancel>Cancel</button><button class="si-button si-light" type="submit" data-si-submit="Save" hidden>Save Changes</button><button class="si-button si-light" type="submit" data-si-submit="Draft">Save Draft</button><button class="si-button si-primary" type="submit" data-si-submit="Pending">Submit for Approval</button></footer></form>
        </section></div>
        <div class="si-overlay" data-si-view-overlay><section class="si-modal" role="dialog" aria-modal="true" aria-labelledby="si-view-title"><header class="si-modal-head"><h3 id="si-view-title">Supplier Invoice Details</h3><button class="si-close" type="button" data-si-close-view aria-label="Close">&times;</button></header><div class="si-view" data-si-view-content></div><footer class="si-modal-actions"><button class="si-button si-light" type="button" data-si-close-view>Close</button><button class="si-button si-primary" type="button" data-si-print-current><i class="fas fa-print"></i> Print / PDF</button></footer></section></div>
        <div class="si-overlay" data-si-attachments-overlay><section class="si-modal si-attachments-modal" role="dialog" aria-modal="true" aria-labelledby="si-attachments-title"><header class="si-modal-head"><h3 data-si-attachments-title id="si-attachments-title">Purchase Order Documents</h3><button class="si-close" type="button" data-si-close-attachments aria-label="Close">&times;</button></header><div class="si-attachments-content" data-si-attachments-content></div><footer class="si-modal-actions"><button class="si-button si-light" type="button" data-si-close-attachments>Close</button></footer></section></div>
        <div class="si-toast" role="status" aria-live="polite" data-si-toast></div>`;

    const storageKey = 'schoolSupplierInvoices';

    let invoices;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        invoices = Array.isArray(stored) ? stored : [];
    } catch (error) {
        invoices = [];
    }
    let editingId = null;
    let viewingId = null;
    let toastTimer;
    let purchaseOrders = [];
    let purchaseRequests = [];
    let quotations = [];
    let comparisons = [];
    let goodsReceipts = [];
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
    const approvalStages = [
        { title: 'Department Head', role: 'deputyHeadTeacher' },
        { title: 'Procurement Officer', role: 'storeManager' },
        { title: 'Finance Manager', role: 'bursar' },
        { title: 'Principal', role: 'headTeacher' },
        { title: 'Director', role: 'director' }
    ];
    const identity = () => window.schoolPortalData?.getIdentity?.();
    const roleKey = role => String(role || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const isApprovalAdmin = () => ['schooladmin', 'superadmin'].includes(roleKey(identity()?.role));
    const canManageInvoices = () => ['schooladmin', 'superadmin', 'director', 'headteacher'].includes(roleKey(identity()?.role))
        || identity()?.permissions?.supplierInvoices?.edit === true
        || (['deputyheadteacher', 'storemanager', 'bursar'].includes(roleKey(identity()?.role))
            && identity()?.permissions?.supplierInvoices === undefined);
    const createApprovalStages = () => approvalStages.map((stage, index) => ({
        ...stage, status: index === 0 ? 'Pending' : 'Waiting', decidedBy: '', decidedByUid: '', approvedAt: '', rejectionReason: ''
    }));
    const currentStageIndex = invoice => Number.isInteger(invoice.currentApprovalStage)
        ? invoice.currentApprovalStage : (invoice.approvalStages || []).findIndex(stage => stage.status === 'Pending');
    const approvalStatus = invoice => invoice.approvalStatus
        || (invoice.status === 'Pending Approval' ? 'Pending'
            : ['Approved', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'].includes(invoice.status) ? 'Approved'
                : invoice.status === 'Rejected' ? 'Rejected' : 'Draft');
    const displayedStatus = invoice => {
        const state = approvalStatus(invoice);
        if (state === 'Pending') return 'Pending Approval';
        if (state === 'Rejected') return 'Rejected';
        if (state === 'Draft') return 'Draft';
        return invoice.status === 'Pending Approval' || invoice.status === 'Rejected' || invoice.status === 'Draft'
            ? 'Approved' : invoice.status;
    };
    const approvalProgress = invoice => {
        const state = approvalStatus(invoice);
        if (state === 'Draft') return 'Not submitted';
        if (state === 'Rejected') {
            const rejected = (invoice.approvalStages || []).find(stage => stage.status === 'Rejected');
            return rejected ? `Rejected · ${rejected.title}` : 'Rejected';
        }
        if (state === 'Approved') {
            return invoice.approvalStages?.length ? '5/5 approvals' : 'Previously approved';
        }
        const index = currentStageIndex(invoice);
        return index >= 0 ? `${index + 1}/5 · ${invoice.approvalStages[index].title}` : 'Approval stages not recorded';
    };
    const canDecideCurrentStage = invoice => {
        const stage = invoice.approvalStages?.[currentStageIndex(invoice)];
        return approvalStatus(invoice) === 'Pending' && stage?.status === 'Pending' && canManageInvoices()
            && (isApprovalAdmin() || roleKey(identity()?.role) === roleKey(stage.role));
    };
    const archiveApprovalRound = invoice => {
        const history = Array.isArray(invoice.approvalHistory) ? [...invoice.approvalHistory] : [];
        if (invoice.approvalStages?.length) {
            history.push({
                approvalStages: invoice.approvalStages.map(stage => ({ ...stage })),
                approvalStatus: approvalStatus(invoice),
                rejectionReason: invoice.rejectionReason || '',
                decisionAt: invoice.decisionAt || '',
                decisionBy: invoice.decisionBy || ''
            });
        }
        return history;
    };
    const recordList = key => {
        try {
            const records = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(records) ? records.filter(record => record && record.deleted !== true) : [];
        } catch (error) {
            console.error(`Unable to read ${key} records for supplier invoice attachments.`, error);
            return [];
        }
    };
    const refreshProcurementRecords = () => {
        purchaseOrders = recordList('schoolPurchaseOrders');
        purchaseRequests = recordList('schoolPurchaseRequests');
        quotations = recordList('schoolQuotations');
        comparisons = recordList('schoolPurchaseComparisons');
        goodsReceipts = recordList('schoolGoodsReceipts');
        refreshPurchaseOrderOptions();
    };
    const poId = order => String(order?.id || order?.poNumber || order?.purchaseOrderNumber || '').trim();
    const refreshPurchaseOrderOptions = () => {
        const select = q('[name="po"]');
        const selected = select.value;
        select.replaceChildren(new Option('Select purchase order (optional)', ''));
        purchaseOrders
            .filter(order => poId(order))
            .sort((left, right) => poId(right).localeCompare(poId(left)))
            .forEach(order => select.add(new Option(`${poId(order)} — ${order.vendor || order.supplier || 'Supplier not set'}`, poId(order))));
        if (selected && !Array.from(select.options).some(option => option.value === selected)) {
            select.add(new Option(`${selected} — Purchase order record unavailable`, selected));
        }
        select.value = selected;
    };
    const normalizeReference = value => String(value || '').trim().toLowerCase();
    const documentReferences = order => {
        const fields = {
            request: ['request', 'requestId', 'purchaseRequest', 'purchaseRequestId', 'prNumber', 'sourceRequestId'],
            comparison: ['comparison', 'comparisonId', 'comparisonNo', 'purchaseComparisonId'],
            quotation: ['quotation', 'quotationId', 'quotationNo']
        };
        return Object.fromEntries(Object.entries(fields).map(([key, names]) => [
            key,
            names.map(name => normalizeReference(order?.[name])).filter(Boolean)
        ]));
    };
    const linkedProcurementDocuments = order => {
        if (!order) return [];
        const references = documentReferences(order);
        const vendor = normalizeReference(order.vendor || order.supplier);
        const matchingComparisons = comparisons.filter(comparison => {
            const id = normalizeReference(comparison.id);
            const recommended = normalizeReference(comparison.recommended);
            const comparisonRequest = normalizeReference(comparison.request || comparison.requestId);
            return references.comparison.includes(id)
                || references.request.includes(comparisonRequest)
                || (vendor && (recommended === vendor
                    || (Array.isArray(comparison.vendors) && comparison.vendors.some(item => normalizeReference(item.name) === vendor))));
        });
        const matchingQuotes = quotations.filter(quotation => {
            const id = normalizeReference(quotation.id);
            const quoteRequest = normalizeReference(quotation.request || quotation.requestId);
            const supplierMatch = Boolean(vendor && normalizeReference(quotation.supplier) === vendor);
            return references.quotation.includes(id)
                || references.request.includes(quoteRequest)
                || (supplierMatch && matchingComparisons.some(comparison => normalizeReference(comparison.request || comparison.requestId) === quoteRequest))
                || (supplierMatch && !matchingComparisons.length && !references.request.length);
        });
        const requestReferences = new Set([
            ...references.request,
            ...matchingComparisons.map(comparison => normalizeReference(comparison.request || comparison.requestId)),
            ...matchingQuotes.map(quotation => normalizeReference(quotation.request || quotation.requestId))
        ].filter(Boolean));
        const matchingRequests = purchaseRequests.filter(request =>
            requestReferences.has(normalizeReference(request.id)));
        const matchingReceipts = goodsReceipts.filter(receipt =>
            normalizeReference(receipt.po || receipt.purchaseOrder || receipt.poNumber) === normalizeReference(poId(order)));
        return [
            { type: 'Purchase Order', record: order },
            ...matchingRequests.map(record => ({ type: 'Purchase Request', record })),
            ...matchingQuotes.map(record => ({ type: 'Quotation', record })),
            ...matchingComparisons.map(record => ({ type: 'Purchase Comparison', record })),
            ...matchingReceipts.map(record => ({ type: 'Goods Receipt Note', record }))
        ];
    };
    const documentFiles = record => {
        const values = [record.attachments, record.documents, record.files, record.attachment]
            .flatMap(value => Array.isArray(value) ? value : value ? [value] : []);
        return values.map((file, index) => {
            const entry = typeof file === 'string' ? { url: file } : file || {};
            const url = String(entry.url || entry.fileUrl || entry.downloadURL || entry.downloadUrl || entry.href || '').trim();
            if (!url) return null;
            let safeUrl = '';
            try {
                const parsed = new URL(url, window.location.href);
                if (['https:', 'http:'].includes(parsed.protocol)) safeUrl = parsed.href;
                else if (parsed.protocol === 'data:' && /^data:(application\/pdf|image\/(?:png|jpe?g|gif|webp));/i.test(url)) safeUrl = url;
            } catch (error) {
                console.warn('Skipping an invalid procurement document URL.', error);
            }
            return safeUrl ? {
                name: String(entry.name || entry.fileName || entry.title || `Attached document ${index + 1}`),
                url: safeUrl
            } : null;
        }).filter(Boolean);
    };
    const itemRows = items => {
        if (!Array.isArray(items) || !items.length) return '<p class="si-document-empty">No line items recorded.</p>';
        const rows = items.map(item => {
            const values = Array.isArray(item)
                ? item
                : [item.description || item.name || item.item || item.requirement, item.qty ?? item.quantity, item.price ?? item.unitPrice, item.status];
            return `<tr>${values.slice(0, 4).map(value => `<td>${escape(value ?? '—')}</td>`).join('')}</tr>`;
        }).join('');
        return `<div class="si-table-wrap"><table class="si-document-table"><thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Details</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    };
    const documentPreviewHtml = ({ type, record }) => {
        const fieldsByType = {
            'Purchase Order': [['Vendor', record.vendor], ['Buyer', record.buyer], ['Order Date', record.date], ['Expected Delivery', record.delivery], ['Status', record.status], ['Currency', record.currency], ['Payment Terms', record.payment], ['Department', record.department], ['Notes', record.notes]],
            'Purchase Request': [['Requester', record.requester], ['Department', record.department], ['Request Date', record.date], ['Priority', record.priority], ['Status', record.status], ['Purpose', record.purpose]],
            Quotation: [['Supplier', record.supplier], ['Supplier Reference', record.supplierRef], ['Purchase Request', record.request], ['Quotation Date', record.date], ['Valid Until', record.validUntil], ['Status', record.status], ['Payment Terms', record.paymentTerms], ['Notes', record.notes]],
            'Purchase Comparison': [['Purchase Request', record.request], ['Requirement', record.requirement], ['Department', record.department], ['Recommended Supplier', record.recommended], ['Comparison Date', record.date], ['Status', record.status], ['Notes', record.notes]],
            'Goods Receipt Note': [['Supplier', record.supplier], ['Purchase Order', record.po || record.purchaseOrder || record.poNumber], ['Delivery Note', record.deliveryNote], ['Receipt Date', record.receiptDate], ['Status', record.status], ['Condition', record.condition], ['Notes', record.notes]]
        };
        const reference = record.id || record.poNumber || record.grnNumber || type;
        const fields = fieldsByType[type] || Object.entries(record)
            .filter(([key, value]) => !['items', 'vendors', 'attachment', 'attachments', 'documents', 'files'].includes(key) && ['string', 'number'].includes(typeof value))
            .slice(0, 12);
        const vendors = type === 'Purchase Comparison' && Array.isArray(record.vendors)
            ? `<h5>Supplier Quotations</h5><div class="si-table-wrap"><table class="si-document-table"><thead><tr><th>Supplier</th><th>Quote</th><th>Delivery</th><th>Rating</th></tr></thead><tbody>${record.vendors.map(vendor => `<tr><td>${escape(vendor.name || '—')}</td><td>${escape(vendor.quote ?? '—')}</td><td>${escape(vendor.delivery ?? '—')}</td><td>${escape(vendor.rating ?? '—')}</td></tr>`).join('')}</tbody></table></div>`
            : '';
        const files = documentFiles(record);
        const attachments = files.length
            ? `<h5>Files</h5><ul class="si-document-files">${files.map(file => `<li><a href="${escape(file.url)}" target="_blank" rel="noopener noreferrer"><i class="fas fa-paperclip" aria-hidden="true"></i> ${escape(file.name)}</a></li>`).join('')}</ul>`
            : '';
        return `<article class="si-document-preview"><header><div><span>${escape(type)}</span><strong>${escape(reference)}</strong></div><span class="si-document-state">${escape(record.status || 'Record')}</span></header><dl>${fields.map(([label, value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value || '—')}</dd></div>`).join('')}</dl>${vendors}${record.items ? `<h5>Items</h5>${itemRows(record.items)}` : ''}${attachments}</article>`;
    };
    const showPurchaseOrderDocuments = orderId => {
        const order = purchaseOrders.find(record => poId(record) === String(orderId));
        const documents = linkedProcurementDocuments(order);
        q('[data-si-attachments-title]').textContent = order
            ? `Documents for ${poId(order)}`
            : `Documents for ${orderId || 'Purchase Order'}`;
        q('[data-si-attachments-content]').innerHTML = documents.length
            ? `<p class="si-attachments-intro">${documents.length} related procurement record${documents.length === 1 ? '' : 's'} found. Select linked file names to open attached files.</p>${documents.map(documentPreviewHtml).join('')}`
            : '<p class="si-document-empty">No purchase order or related procurement documents were found in the school records.</p>';
        q('[data-si-attachments-overlay]').classList.add('is-open');
    };
    const updateSelectedPurchaseOrder = () => {
        const select = q('[name="po"]');
        const order = purchaseOrders.find(record => poId(record) === select.value);
        const preview = q('[data-si-po-attachments]');
        if (!select.value) {
            preview.textContent = 'Select a purchase order to view its related procurement documents.';
            return;
        }
        const docs = linkedProcurementDocuments(order);
        if (!order) {
            preview.textContent = 'This saved purchase order is not currently available in the school records.';
            return;
        }
        q('[name="supplier"]').value = order.vendor || order.supplier || q('[name="supplier"]').value;
        preview.innerHTML = `<span>${docs.length} related procurement record${docs.length === 1 ? '' : 's'} found for ${escape(poId(order))}.</span> <button class="si-button si-light" type="button" data-si-preview-selected-po><i class="fas fa-paperclip"></i> Preview Documents</button>`;
    };
    const dueClass = invoice => {
        if (['Draft', 'Pending Approval', 'Rejected', 'Paid', 'Cancelled'].includes(displayedStatus(invoice))) return 'normal';
        const due = new Date(`${invoice.dueDate}T00:00:00`);
        if (Number.isNaN(due.getTime())) return 'normal';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days = Math.ceil((due - today) / 86400000);
        return days < 0 ? 'overdue' : days <= 7 ? 'soon' : 'normal';
    };
    const dueText = invoice => {
        const status = displayedStatus(invoice);
        if (status === 'Draft') return 'Draft';
        if (status === 'Pending Approval') return 'Awaiting approval';
        if (status === 'Rejected') return 'Rejected';
        if (status === 'Paid') return 'Paid';
        if (status === 'Cancelled') return 'Cancelled';
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
    let migratedPendingInvoice = false;
    invoices.forEach(invoice => {
        if (approvalStatus(invoice) === 'Pending' && !invoice.approvalStages?.length) {
            invoice.approvalStatus = 'Pending';
            invoice.approvalStages = createApprovalStages();
            invoice.currentApprovalStage = 0;
            migratedPendingInvoice = true;
        }
    });
    if (migratedPendingInvoice) save();
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
        q('[data-si-stat="pending"]').textContent = invoices.filter(invoice => displayedStatus(invoice) === 'Pending Approval').length;
        q('[data-si-stat="paid"]').textContent = invoices.filter(invoice => displayedStatus(invoice) === 'Paid').length;
        const outstanding = formatCurrencyGroups(invoices.map(invoice => ({ currency: invoice.currency, record: invoice, value: invoiceBalance })));
        q('[data-si-stat="outstanding"]').textContent = outstanding.label;
        q('[data-si-stat="outstanding"]').title = outstanding.title;
        const overdue = formatCurrencyGroups(invoices.filter(invoice => displayedStatus(invoice) === 'Overdue').map(invoice => ({ currency: invoice.currency, record: invoice, value: invoiceBalance })));
        q('[data-si-stat="overdue"]').textContent = overdue.label;
        q('[data-si-stat="overdue"]').title = overdue.title;
    };
    const render = () => {
        const search = q('[data-si-search]').value.trim().toLowerCase();
        const status = q('[data-si-filter]').value;
        const filtered = invoices.filter(invoice => (!status || displayedStatus(invoice) === status) && (!search || JSON.stringify(invoice).toLowerCase().includes(search)));
        q('[data-si-rows]').innerHTML = filtered.length ? filtered.map(invoice => {
            const relatedDocumentCount = linkedProcurementDocuments(purchaseOrders.find(order => poId(order) === String(invoice.po))).length;
            const currentStatus = displayedStatus(invoice);
            const attachments = invoice.po
                ? `<button class="si-button si-light si-attachments-button" type="button" data-si-preview-po="${escape(invoice.po)}" aria-label="Preview ${relatedDocumentCount} documents for purchase order ${escape(invoice.po)}"><i class="fas fa-paperclip"></i> Preview (${relatedDocumentCount})</button>`
                : '<span class="si-small">No PO linked</span>';
            const workflowActions = canDecideCurrentStage(invoice)
                ? `<button class="si-action si-approve" type="button" title="Approve current stage" aria-label="Approve ${escape(invoice.invoiceNo)} at ${escape(invoice.approvalStages[currentStageIndex(invoice)].title)} stage" data-si-action="approve" data-id="${escape(invoice.id)}"><i class="fas fa-check"></i></button><button class="si-action si-reject" type="button" title="Reject" aria-label="Reject ${escape(invoice.invoiceNo)}" data-si-action="reject" data-id="${escape(invoice.id)}"><i class="fas fa-xmark"></i></button>`
                : '';
            const submitAction = ['Draft', 'Rejected'].includes(approvalStatus(invoice)) && canManageInvoices()
                ? `<button class="si-action si-submit" type="button" title="Submit for approval" aria-label="Submit ${escape(invoice.invoiceNo)} for approval" data-si-action="submit" data-id="${escape(invoice.id)}"><i class="fas fa-paper-plane"></i></button>`
                : '';
            const editAction = canManageInvoices() && approvalStatus(invoice) !== 'Pending'
                ? `<button class="si-action" type="button" title="Edit" aria-label="Edit ${escape(invoice.invoiceNo)}" data-si-action="edit" data-id="${escape(invoice.id)}"><i class="fas fa-pen"></i></button>`
                : '';
            return `<tr><td><strong class="si-id">${escape(invoice.invoiceNo)}</strong><small class="si-small">Record: ${escape(invoice.id)}</small></td><td><b>${escape(invoice.supplier)}</b><small class="si-small">${escape(invoice.department)}</small></td><td><strong>${escape(invoice.po || '—')}</strong><small class="si-small">${escape(invoice.grn || 'No GRN')}</small></td><td>${attachments}</td><td>${formatDate(invoice.invoiceDate)}</td><td><span class="si-due ${dueClass(invoice)}">${formatDate(invoice.dueDate)}</span><small class="si-small">${escape(dueText(invoice))}</small></td><td><strong>${money(invoiceTotal(invoice), invoice.currency)}</strong></td><td><strong>${money(invoiceBalance(invoice), invoice.currency)}</strong></td><td><span class="si-badge ${escape(statusClass(currentStatus))}">${escape(currentStatus)}</span><small class="si-small si-approval-progress">${escape(approvalProgress(invoice))}</small></td><td><div class="si-actions">${workflowActions}${submitAction}<button class="si-action" type="button" title="View" aria-label="View ${escape(invoice.invoiceNo)}" data-si-action="view" data-id="${escape(invoice.id)}"><i class="fas fa-eye"></i></button>${editAction}<button class="si-action" type="button" title="Print" aria-label="Print ${escape(invoice.invoiceNo)}" data-si-action="print" data-id="${escape(invoice.id)}"><i class="fas fa-print"></i></button><button class="si-action si-delete" type="button" title="Delete" aria-label="Delete ${escape(invoice.invoiceNo)}" data-si-action="delete" data-id="${escape(invoice.id)}"><i class="fas fa-trash"></i></button></div></td></tr>`;
        }).join('') : '<tr><td colspan="10"><div class="si-empty">No supplier invoices found.</div></td></tr>';
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
        refreshPurchaseOrderOptions();
        form.reset();
        ['supplier', 'invoiceNo', 'po', 'grn', 'invoiceDate', 'dueDate', 'currency', 'paymentTerms', 'status', 'paymentMethod', 'department', 'paymentReference', 'paidAmount', 'notes'].forEach(field => {
            form.elements[field].disabled = false;
        });
        q('[data-si-items]').replaceChildren();
        editingId = invoice?.id ?? null;
        q('#si-form-title').textContent = invoice ? 'Edit Supplier Invoice' : 'Create Supplier Invoice';
        const state = invoice ? approvalStatus(invoice) : 'Draft';
        const isEditableWorkflow = ['Draft', 'Rejected'].includes(state);
        form.querySelector('[data-si-submit="Save"]').hidden = !invoice || isEditableWorkflow;
        form.querySelector('[data-si-submit="Draft"]').hidden = invoice && !isEditableWorkflow;
        form.querySelector('[data-si-submit="Pending"]').hidden = invoice && !isEditableWorkflow;
        const today = new Date();
        form.elements.invoiceDate.value = invoice?.invoiceDate || today.toISOString().slice(0, 10);
        const due = new Date(today);
        due.setDate(due.getDate() + 30);
        form.elements.dueDate.value = invoice?.dueDate || due.toISOString().slice(0, 10);
        if (invoice) {
            ['supplier', 'invoiceNo', 'grn', 'currency', 'paymentTerms', 'paymentMethod', 'department', 'paymentReference', 'paidAmount', 'notes'].forEach(field => { form.elements[field].value = invoice[field] ?? ''; });
            form.elements.status.value = displayedStatus(invoice);
            form.elements.status.disabled = state !== 'Approved';
            form.elements.paidAmount.disabled = state !== 'Approved';
            [...form.elements.status.options].forEach(option => {
                option.disabled = state === 'Approved' && ['Draft', 'Pending Approval', 'Rejected'].includes(option.value);
            });
            if (invoice.po && !Array.from(form.elements.po.options).some(option => option.value === invoice.po)) {
                form.elements.po.add(new Option(`${invoice.po} — Purchase order record unavailable`, invoice.po));
            }
            form.elements.po.value = invoice.po || '';
            invoice.items.forEach(addItem);
        } else {
            form.elements.status.value = 'Draft';
            form.elements.status.disabled = true;
            form.elements.paidAmount.disabled = true;
            addItem(); addItem();
        }
        if (state === 'Approved') {
            ['supplier', 'invoiceNo', 'po', 'grn', 'invoiceDate', 'dueDate', 'currency', 'paymentTerms', 'department'].forEach(field => {
                form.elements[field].disabled = true;
            });
            q('[data-si-items]').querySelectorAll('input, .si-remove-item').forEach(control => { control.disabled = true; });
            q('[data-si-add-item]').disabled = true;
        } else {
            q('[data-si-add-item]').disabled = false;
        }
        updateSelectedPurchaseOrder();
        calculate();
        q('[data-si-form-overlay]').classList.add('is-open');
        form.elements.supplier.focus();
    };
    const details = invoice => {
        const stages = (invoice.approvalStages || []).map((stage, index) => `<tr><td>${index + 1}</td><td>${escape(stage.title)}</td><td>${escape(stage.status)}</td><td>${escape(stage.decidedBy || '—')}</td><td>${stage.approvedAt ? formatDate(stage.approvedAt.slice(0, 10)) : escape(stage.rejectionReason || '—')}</td></tr>`).join('');
        const history = (invoice.approvalHistory || []).map((round, index) => `<details class="si-approval-history"><summary>Previous submission ${index + 1}</summary><div class="si-table-wrap"><table class="si-detail-table"><thead><tr><th>Stage</th><th>Signatory</th><th>Status</th><th>Signer</th><th>Date / Reason</th></tr></thead><tbody>${(round.approvalStages || []).map((stage, stageIndex) => `<tr><td>${stageIndex + 1}</td><td>${escape(stage.title)}</td><td>${escape(stage.status)}</td><td>${escape(stage.decidedBy || '—')}</td><td>${stage.approvedAt ? formatDate(stage.approvedAt.slice(0, 10)) : escape(stage.rejectionReason || '—')}</td></tr>`).join('')}</tbody></table></div></details>`).join('');
        return `<header class="si-detail-header"><div><h2>${escape(invoice.invoiceNo)}</h2><p>${escape(invoice.supplier)} · ${escape(invoice.id)}</p></div><span class="si-badge ${escape(statusClass(displayedStatus(invoice)))}">${escape(displayedStatus(invoice))}</span></header>
        <div class="si-summary-grid">${[['Supplier', invoice.supplier], ['Purchase Order', invoice.po || '—'], ['Goods Receipt Note', invoice.grn || '—'], ['Invoice Date', formatDate(invoice.invoiceDate)], ['Due Date', formatDate(invoice.dueDate)], ['Payment Terms', invoice.paymentTerms], ['Department', invoice.department], ['Payment Method', invoice.paymentMethod], ['Currency', invoice.currency], ['Invoice Total', money(invoiceTotal(invoice), invoice.currency)], ['Paid Amount', money(invoice.paidAmount, invoice.currency)], ['Outstanding', money(invoiceBalance(invoice), invoice.currency)], ['Payment Reference', invoice.paymentReference || '—']].map(([label, value]) => `<div class="si-summary-box"><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`).join('')}</div>
        <h4 class="si-details-title">Approval Workflow · ${escape(approvalProgress(invoice))}</h4><div class="si-table-wrap"><table class="si-detail-table"><thead><tr><th>Stage</th><th>Signatory</th><th>Status</th><th>Approver</th><th>Date / Reason</th></tr></thead><tbody>${stages || '<tr><td colspan="5">No approval history recorded.</td></tr>'}</tbody></table></div>${invoice.rejectionReason ? `<p class="si-rejection-reason"><strong>Rejection reason:</strong> ${escape(invoice.rejectionReason)}</p>` : ''}${history}
        <h4 class="si-details-title">Invoice Items</h4><div class="si-table-wrap"><table class="si-detail-table"><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th>Line Total</th></tr></thead><tbody>${invoice.items.map((item, index) => `<tr><td>${index + 1}</td><td><b>${escape(item.description)}</b></td><td>${Number(item.qty)}</td><td>${money(item.price, invoice.currency)}</td><td>${Number(item.tax)}%</td><td><b>${money(lineSubtotal(item) * (1 + Number(item.tax) / 100), invoice.currency)}</b></td></tr>`).join('')}</tbody></table></div>
        <div class="si-totals si-view-totals"><div><span>Subtotal</span><b>${money(invoiceSubtotal(invoice), invoice.currency)}</b></div><div><span>Tax</span><b>${money(invoiceTax(invoice), invoice.currency)}</b></div><div><span>Invoice Total</span><b>${money(invoiceTotal(invoice), invoice.currency)}</b></div><div><span>Paid</span><b>${money(invoice.paidAmount, invoice.currency)}</b></div><div class="si-grand"><span>Outstanding</span><b>${money(invoiceBalance(invoice), invoice.currency)}</b></div></div><div class="si-notes"><strong>Invoice Notes</strong><p>${escape(invoice.notes || 'No additional notes.')}</p></div>`;
    };
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
        const html = `<header class="head"><div><h1>Supplier Invoice</h1><p>Finance &amp; Procurement Department</p></div><div><strong>${escape(invoice.invoiceNo)}</strong><br>Invoice Date: ${formatDate(invoice.invoiceDate)}<br>Due Date: ${formatDate(invoice.dueDate)}</div></header><div class="meta"><div><strong>Supplier</strong>${escape(invoice.supplier)}</div><div><strong>Record No.</strong>${escape(invoice.id)}</div><div><strong>Purchase Order</strong>${escape(invoice.po || '—')}</div><div><strong>Goods Receipt Note</strong>${escape(invoice.grn || '—')}</div><div><strong>Payment Terms</strong>${escape(invoice.paymentTerms)}</div><div><strong>Status</strong>${escape(displayedStatus(invoice))}</div><div><strong>Approval Progress</strong>${escape(approvalProgress(invoice))}</div><div><strong>Department</strong>${escape(invoice.department)}</div><div><strong>Payment Method</strong>${escape(invoice.paymentMethod)}</div><div><strong>Payment Reference</strong>${escape(invoice.paymentReference || '—')}</div><div><strong>Currency</strong>${escape(invoice.currency)}</div></div><table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th>Line Total</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div><span>Subtotal</span><b>${money(invoiceSubtotal(invoice), invoice.currency)}</b></div><div><span>Tax</span><b>${money(invoiceTax(invoice), invoice.currency)}</b></div><div><span>Invoice Total</span><b>${money(invoiceTotal(invoice), invoice.currency)}</b></div><div><span>Paid Amount</span><b>${money(invoice.paidAmount, invoice.currency)}</b></div><div class="grand"><span>Outstanding Balance</span><b>${money(invoiceBalance(invoice), invoice.currency)}</b></div></div><div class="notes"><strong>Notes</strong><p>${escape(invoice.notes || 'No additional notes.')}</p></div><div class="signatures"><span>Prepared By</span><span>Checked By</span><span>Approved By</span></div>`;
        printDocument(invoice.invoiceNo, html);
    };

    refreshProcurementRecords();
    q('[name="po"]').addEventListener('change', updateSelectedPurchaseOrder);
    q('[data-si-po-attachments]').addEventListener('click', event => {
        if (event.target.closest('[data-si-preview-selected-po]')) showPurchaseOrderDocuments(q('[name="po"]').value);
    });
    q('[data-si-new]').addEventListener('click', () => openForm());
    q('[data-si-add-item]').addEventListener('click', () => addItem());
    q('[data-si-search]').addEventListener('input', render);
    q('[data-si-filter]').addEventListener('change', render);
    q('[name="currency"]').addEventListener('change', calculate);
    q('[name="paidAmount"]').addEventListener('input', calculate);
    q('[data-si-print-list]').addEventListener('click', () => {
        if (!invoices.length) return toast('No invoices available.');
        const rows = invoices.map(invoice => `<tr><td>${escape(invoice.invoiceNo)}</td><td>${escape(invoice.supplier)}</td><td>${escape(invoice.po || '—')} / ${escape(invoice.grn || '—')}</td><td>${formatDate(invoice.invoiceDate)}</td><td>${formatDate(invoice.dueDate)}</td><td>${money(invoiceTotal(invoice), invoice.currency)}</td><td>${money(invoiceBalance(invoice), invoice.currency)}</td><td>${escape(displayedStatus(invoice))}</td></tr>`).join('');
        printDocument('Supplier Invoice Report', `<header class="head"><div><h1>Supplier Invoice Report</h1><p>Invoice and Outstanding Summary</p></div><div>${new Date().toLocaleDateString('en-US')}</div></header><table><thead><tr><th>Invoice No.</th><th>Supplier</th><th>PO / GRN</th><th>Invoice Date</th><th>Due Date</th><th>Total</th><th>Balance</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`);
    });
    q('[data-si-form]').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const submitMode = event.submitter?.dataset.siSubmit || 'Save';
        if (submitMode === 'Pending' && !canManageInvoices()) return toast('You do not have permission to submit supplier invoices for approval.');
        const items = [...section.querySelectorAll('.si-item-row')].map(row => ({ description: row.querySelector('[name="description"]').value.trim(), qty: Number(row.querySelector('[name="qty"]').value), price: Number(row.querySelector('[name="price"]').value), tax: Number(row.querySelector('[name="itemTax"]').value) })).filter(item => item.description);
        if (!items.length) return toast('Please add at least one invoice item.');
        if (items.some(item => item.qty < 0 || item.price < 0 || item.tax < 0 || item.tax > 100)) return toast('Check item quantities, prices and tax rates.');
        const existing = invoices.find(invoice => invoice.id === editingId);
        const invoiceNo = form.elements.invoiceNo.value.trim();
        if (invoices.some(invoice => invoice.invoiceNo.toLowerCase() === invoiceNo.toLowerCase() && invoice.id !== editingId)) return toast('That supplier invoice number already exists.');
        const sequence = Math.max(0, ...invoices.map(invoice => Number(invoice.id.match(/^SI-\d{4}-(\d+)$/)?.[1]) || 0)) + 1;
        const status = submitMode === 'Pending' ? 'Pending Approval'
            : submitMode === 'Draft' ? 'Draft'
                : approvalStatus(existing || {}) === 'Pending' ? 'Pending Approval'
                    : approvalStatus(existing || {}) === 'Approved' && ['Approved', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'].includes(form.elements.status.value)
                        ? form.elements.status.value : existing ? displayedStatus(existing) : 'Draft';
        const invoice = {
            id: existing?.id || `SI-${new Date().getFullYear()}-${String(sequence).padStart(3, '0')}`,
            invoiceNo,
            supplier: form.elements.supplier.value.trim(),
            po: form.elements.po.value.trim(),
            grn: form.elements.grn.value.trim(),
            invoiceDate: form.elements.invoiceDate.value,
            dueDate: form.elements.dueDate.value,
            currency: form.elements.currency.value,
            paymentTerms: form.elements.paymentTerms.value,
            status,
            approvalStatus: submitMode === 'Pending' ? 'Pending' : submitMode === 'Draft' ? 'Draft' : approvalStatus(existing || {}),
            approvalStages: submitMode === 'Pending' ? createApprovalStages()
                : submitMode === 'Draft' && approvalStatus(existing || {}) === 'Rejected' ? [] : existing?.approvalStages || [],
            currentApprovalStage: submitMode === 'Pending' || submitMode === 'Draft' ? 0 : existing?.currentApprovalStage ?? 0,
            approvalHistory: submitMode === 'Draft' && approvalStatus(existing || {}) === 'Rejected'
                ? archiveApprovalRound(existing) : existing?.approvalHistory || [],
            rejectionReason: ['Pending', 'Draft'].includes(submitMode) ? '' : existing?.rejectionReason || '',
            decisionAt: ['Pending', 'Draft'].includes(submitMode) ? '' : existing?.decisionAt || '',
            decisionBy: ['Pending', 'Draft'].includes(submitMode) ? '' : existing?.decisionBy || '',
            paymentMethod: form.elements.paymentMethod.value,
            department: form.elements.department.value,
            paymentReference: form.elements.paymentReference.value.trim(),
            paidAmount: Number(form.elements.paidAmount.value) || 0,
            notes: form.elements.notes.value.trim(),
            items
        };
        if (submitMode === 'Pending') invoice.approvalHistory = archiveApprovalRound(existing || {});
        if (invoice.paidAmount < 0 || invoice.paidAmount > invoiceTotal(invoice)) return toast('Paid amount must be between zero and the invoice total.');
        if (invoice.status === 'Paid') invoice.paidAmount = invoiceTotal(invoice);
        if (invoice.status === 'Partially Paid' && (invoice.paidAmount <= 0 || invoice.paidAmount >= invoiceTotal(invoice))) return toast('A partially paid invoice needs a payment below the invoice total.');
        if (existing) invoices = invoices.map(item => item.id === editingId ? invoice : item);
        else invoices.unshift(invoice);
        save();
        closeForm();
        render();
        if (submitMode === 'Pending') {
            window.dispatchEvent(new CustomEvent('school-portal-approval-update'));
            toast(existing ? 'Supplier invoice resubmitted for approval.' : 'Supplier invoice submitted for approval.');
        } else {
            toast(existing ? 'Supplier invoice updated.' : 'Supplier invoice saved as a draft.');
        }
    });
    q('[data-si-rows]').addEventListener('click', event => {
        const previewButton = event.target.closest('[data-si-preview-po]');
        if (previewButton) {
            showPurchaseOrderDocuments(previewButton.dataset.siPreviewPo);
            return;
        }
        const button = event.target.closest('[data-si-action]');
        if (!button) return;
        const invoice = invoices.find(item => item.id === button.dataset.id);
        if (!invoice) return;
        if (button.dataset.siAction === 'view') {
            viewingId = invoice.id;
            q('[data-si-view-content]').innerHTML = details(invoice);
            q('[data-si-view-overlay]').classList.add('is-open');
        } else if (button.dataset.siAction === 'edit') {
            if (!canManageInvoices() || approvalStatus(invoice) === 'Pending') return;
            openForm(invoice);
        } else if (button.dataset.siAction === 'print') {
            printInvoice(invoice);
        } else if (button.dataset.siAction === 'submit') {
            if (!canManageInvoices() || !['Draft', 'Rejected'].includes(approvalStatus(invoice))) return;
            invoice.approvalHistory = archiveApprovalRound(invoice);
            invoice.approvalStatus = 'Pending';
            invoice.status = 'Pending Approval';
            invoice.approvalStages = createApprovalStages();
            invoice.currentApprovalStage = 0;
            invoice.rejectionReason = '';
            invoice.decisionAt = '';
            invoice.decisionBy = '';
            save();
            render();
            window.dispatchEvent(new CustomEvent('school-portal-approval-update'));
            toast('Supplier invoice submitted for approval.');
        } else if (button.dataset.siAction === 'approve' || button.dataset.siAction === 'reject') {
            if (!canDecideCurrentStage(invoice)) return toast('Only the assigned signatory for the current approval step can decide this invoice.');
            const isApproval = button.dataset.siAction === 'approve';
            const stageIndex = currentStageIndex(invoice);
            const stage = invoice.approvalStages[stageIndex];
            const reason = isApproval ? '' : window.prompt(`Why is ${stage.title} rejecting ${invoice.invoiceNo}?`);
            if (!isApproval && reason === null) return;
            if (!isApproval && !reason.trim()) return toast('Enter a reason before rejecting this invoice.');
            const signer = isApprovalAdmin() ? 'Admin (on behalf)' : window.schoolPortalFirebase?.auth?.currentUser?.displayName || identity()?.displayName || identity()?.fullName || identity()?.uid || 'Approver';
            const timestamp = new Date().toISOString();
            stage.decidedBy = signer;
            stage.decidedByUid = identity()?.uid || '';
            stage.approvedAt = timestamp;
            if (isApproval) {
                stage.status = 'Approved';
                invoice.currentApprovalStage = stageIndex + 1;
                if (invoice.currentApprovalStage === invoice.approvalStages.length) {
                    invoice.approvalStatus = 'Approved';
                    invoice.status = 'Approved';
                    invoice.decisionAt = timestamp;
                    invoice.decisionBy = signer;
                } else {
                    invoice.approvalStages[invoice.currentApprovalStage].status = 'Pending';
                }
            } else {
                stage.status = 'Rejected';
                stage.rejectionReason = reason.trim();
                invoice.approvalStatus = 'Rejected';
                invoice.status = 'Rejected';
                invoice.rejectionReason = reason.trim();
                invoice.decisionAt = timestamp;
                invoice.decisionBy = signer;
                invoice.approvalStages.slice(stageIndex + 1).forEach(next => { next.status = 'Not required'; });
            }
            save();
            render();
            window.dispatchEvent(new CustomEvent('school-portal-approval-update'));
            toast(isApproval
                ? isApprovalAdmin() ? `Admin approved for ${stage.title} on behalf.` : `${stage.title} approved.`
                : isApprovalAdmin() ? `Admin rejected for ${stage.title} on behalf.` : `${stage.title} rejected the supplier invoice.`);
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
    section.querySelectorAll('[data-si-close-attachments]').forEach(button => button.addEventListener('click', () => q('[data-si-attachments-overlay]').classList.remove('is-open')));
    q('[data-si-print-current]').addEventListener('click', () => {
        const invoice = invoices.find(item => item.id === viewingId);
        if (invoice) printInvoice(invoice);
    });
    window.addEventListener('school-portal-cloud-data-update', event => {
        if (!['purchaseOrders', 'purchaseRequests', 'quotations', 'purchaseComparisons', 'goodsReceipts'].includes(event.detail?.collection)) return;
        refreshProcurementRecords();
        render();
        if (q('[data-si-form-overlay]').classList.contains('is-open')) updateSelectedPurchaseOrder();
    });
    window.addEventListener('storage', event => {
        if (!['schoolPurchaseOrders', 'schoolPurchaseRequests', 'schoolQuotations', 'schoolPurchaseComparisons', 'schoolGoodsReceipts'].includes(event.key)) return;
        refreshProcurementRecords();
        render();
        if (q('[data-si-form-overlay]').classList.contains('is-open')) updateSelectedPurchaseOrder();
    });
    section.querySelectorAll('.si-overlay').forEach(overlay => overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('is-open'); }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            q('[data-si-form-overlay]').classList.remove('is-open');
            closeView();
            q('[data-si-attachments-overlay]').classList.remove('is-open');
        }
    });
    render();
    return section;
}