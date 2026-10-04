function createPurchaseComparisonsModule() {
    const section = document.createElement('section');
    section.className = 'module purchase-comparisons-module hidden';
    section.id = 'purchaseComparisonsModule';
    section.innerHTML = `
        <header class="pc-header"><div><h2>Purchase Comparisons</h2><p>Compare supplier quotations and select the best purchasing option</p></div><button class="pc-button pc-primary" type="button" data-pc-new><i class="fas fa-plus"></i> New Comparison</button></header>
        <section class="pc-stats" aria-label="Comparison summary"><article class="pc-stat"><div><span>Total Comparisons</span><strong data-pc-stat="total">0</strong></div><i class="fas fa-code-compare"></i></article><article class="pc-stat"><div><span>Pending Review</span><strong data-pc-stat="pending">0</strong></div><i class="fas fa-clock"></i></article><article class="pc-stat"><div><span>Completed</span><strong data-pc-stat="completed">0</strong></div><i class="fas fa-circle-check"></i></article><article class="pc-stat"><div><span>Total Quoted Value</span><strong data-pc-stat="value">$0</strong></div><i class="fas fa-dollar-sign"></i></article></section>
        <section class="pc-content" aria-label="Purchase comparison records"><div class="pc-toolbar"><label class="pc-search"><i class="fas fa-search" aria-hidden="true"></i><span class="pc-sr-only">Search comparisons</span><input type="search" data-pc-search placeholder="Search comparison, request, vendor..."></label><select class="pc-filter" data-pc-filter aria-label="Filter by status"><option value="">All Statuses</option><option>Draft</option><option>Pending</option><option>Completed</option><option>Approved</option><option>Rejected</option></select><button class="pc-button pc-light" type="button" data-pc-print-list><i class="fas fa-print"></i> Print Report</button></div>
            <div class="pc-table-wrap"><table class="pc-table"><thead><tr><th>Comparison No.</th><th>Purchase Request</th><th>Department</th><th>Vendors</th><th>Lowest Quote</th><th>Highest Quote</th><th>Savings</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody data-pc-rows></tbody></table></div></section>
        <div class="pc-overlay" data-pc-form-overlay><section class="pc-modal" role="dialog" aria-modal="true" aria-labelledby="pc-form-title"><header class="pc-modal-head"><h3 id="pc-form-title">Create Purchase Comparison</h3><button class="pc-close" type="button" data-pc-close-form aria-label="Close">&times;</button></header>
            <form class="pc-form" data-pc-form><div class="pc-grid">
                <label>Purchase Request / Reference<input name="request" required placeholder="e.g. PR-2026-014"></label><label>Comparison Date<input name="date" type="date" required></label>
                <label>Item / Requirement<input name="requirement" required placeholder="e.g. Laptop Computers"></label><label>Department<select name="department"><option>Procurement</option><option>IT</option><option>Finance</option><option>HR</option><option>Operations</option><option>Marketing</option><option>Administration</option></select></label>
                <label>Requested Quantity<input name="quantity" type="number" min="1" step="1" value="1" required></label><label>Currency<select name="currency"><option value="USD">USD - US Dollar</option><option value="AED">AED - UAE Dirham</option><option value="EUR">EUR - Euro</option><option value="GBP">GBP - British Pound</option></select></label>
                <label>Evaluation Criteria<select name="criteria"><option>Lowest Price</option><option>Best Value</option><option>Quality &amp; Price</option><option>Technical Compliance</option><option>Delivery &amp; Price</option></select></label><label>Recommended Vendor<select name="recommended"><option value="">Select after comparing</option></select></label>
                <label class="pc-full">Remarks / Evaluation Notes<textarea name="notes" placeholder="Enter comparison notes, technical comments, delivery considerations, etc."></textarea></label>
            </div>
            <div class="pc-vendors"><div class="pc-vendors-head"><h4>Supplier Quotations</h4><button class="pc-button pc-light" type="button" data-pc-add-vendor><i class="fas fa-plus"></i> Add Supplier</button></div><div data-pc-vendors></div></div>
            <footer class="pc-modal-actions"><button class="pc-button pc-light" type="button" data-pc-cancel>Cancel</button><button class="pc-button pc-primary" type="submit">Save Comparison</button></footer></form>
        </section></div>
        <div class="pc-overlay" data-pc-view-overlay><section class="pc-modal" role="dialog" aria-modal="true" aria-labelledby="pc-view-title"><header class="pc-modal-head"><h3 id="pc-view-title">Purchase Comparison Details</h3><button class="pc-close" type="button" data-pc-close-view aria-label="Close">&times;</button></header><div class="pc-view" data-pc-view-content></div><footer class="pc-modal-actions"><button class="pc-button pc-light" type="button" data-pc-close-view>Close</button><button class="pc-button pc-primary" type="button" data-pc-print-current><i class="fas fa-print"></i> Print / PDF</button></footer></section></div>
        <div class="pc-toast" role="status" aria-live="polite" data-pc-toast></div>`;

    const storageKey = 'schoolPurchaseComparisons';
    const seed = [
        { id: 'PC-2026-001', request: 'PR-2026-014', requirement: 'Laptop Computers', department: 'IT', quantity: 10, currency: 'USD', date: '2026-09-22', criteria: 'Best Value', status: 'Completed', recommended: 'Gulf Technology LLC', notes: 'Gulf Technology offered the best overall combination of price, warranty and delivery.', vendors: [{ name: 'Gulf Technology LLC', quote: 18500, delivery: 7, warranty: '3 Years', rating: 4.8 }, { name: 'Smart Business Solutions', quote: 19800, delivery: 10, warranty: '2 Years', rating: 4.5 }, { name: 'Prime Computers', quote: 19200, delivery: 8, warranty: '3 Years', rating: 4.4 }] },
        { id: 'PC-2026-002', request: 'PR-2026-018', requirement: 'Office Furniture', department: 'Administration', quantity: 25, currency: 'USD', date: '2026-09-27', criteria: 'Lowest Price', status: 'Approved', recommended: 'Al Noor Office Supplies', notes: 'Lowest compliant quotation with acceptable delivery schedule.', vendors: [{ name: 'Al Noor Office Supplies', quote: 7600, delivery: 12, warranty: '2 Years', rating: 4.3 }, { name: 'Modern Workspace', quote: 8250, delivery: 9, warranty: '3 Years', rating: 4.6 }, { name: 'Office World', quote: 8900, delivery: 14, warranty: '2 Years', rating: 4.2 }] },
        { id: 'PC-2026-003', request: 'PR-2026-021', requirement: 'Printer & Toner', department: 'Finance', quantity: 8, currency: 'USD', date: '2026-10-01', criteria: 'Quality & Price', status: 'Pending', recommended: '', notes: 'Waiting for technical evaluation from Finance.', vendors: [{ name: 'Smart Business Solutions', quote: 5400, delivery: 5, warranty: '3 Years', rating: 4.7 }, { name: 'Digital Office Systems', quote: 5100, delivery: 8, warranty: '2 Years', rating: 4.5 }] },
        { id: 'PC-2026-004', request: 'PR-2026-025', requirement: 'Safety Equipment', department: 'Operations', quantity: 150, currency: 'USD', date: '2026-10-02', criteria: 'Lowest Price', status: 'Draft', recommended: '', notes: 'Supplier quotations received and awaiting review.', vendors: [{ name: 'Prime Industrial Trading', quote: 4200, delivery: 6, warranty: '1 Year', rating: 4.6 }, { name: 'Industrial Safety LLC', quote: 4550, delivery: 5, warranty: '2 Years', rating: 4.7 }] }
    ];
    let comparisons;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        comparisons = Array.isArray(stored) ? stored : seed;
    } catch (error) {
        comparisons = seed;
    }
    let editingId = null;
    let viewingId = null;
    let toastTimer;
    const q = selector => section.querySelector(selector);
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    const money = (value, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value) || 0);
    const formatDate = value => {
        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime()) ? escape(value) : date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };
    const lowest = comparison => Math.min(...comparison.vendors.map(vendor => Number(vendor.quote)));
    const highest = comparison => Math.max(...comparison.vendors.map(vendor => Number(vendor.quote)));
    const savings = comparison => highest(comparison) - lowest(comparison);
    const save = () => localStorage.setItem(storageKey, JSON.stringify(comparisons));
    const toast = message => {
        const element = q('[data-pc-toast]');
        element.textContent = message;
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 2400);
    };
    const updateStats = () => {
        q('[data-pc-stat="total"]').textContent = comparisons.length;
        q('[data-pc-stat="pending"]').textContent = comparisons.filter(item => ['Draft', 'Pending'].includes(item.status)).length;
        q('[data-pc-stat="completed"]').textContent = comparisons.filter(item => ['Completed', 'Approved'].includes(item.status)).length;
        const values = {};
        comparisons.forEach(item => { values[item.currency] = (values[item.currency] || 0) + item.vendors.reduce((sum, vendor) => sum + Number(vendor.quote), 0); });
        const currencies = Object.entries(values);
        const value = q('[data-pc-stat="value"]');
        value.textContent = currencies.length <= 1 ? money(currencies[0]?.[1] || 0, currencies[0]?.[0] || 'USD').replace(/\.00$/, '') : 'Multiple';
        value.title = currencies.map(([currency, amount]) => money(amount, currency)).join(' · ');
    };
    const render = () => {
        const search = q('[data-pc-search]').value.trim().toLowerCase();
        const status = q('[data-pc-filter]').value;
        const filtered = comparisons.filter(item => (!status || item.status === status) && (!search || JSON.stringify(item).toLowerCase().includes(search)));
        q('[data-pc-rows]').innerHTML = filtered.length ? filtered.map(item => {
            const low = lowest(item);
            const high = highest(item);
            return `<tr><td><strong class="pc-id">${escape(item.id)}</strong></td><td><b>${escape(item.requirement)}</b><small class="pc-request">${escape(item.request)}</small></td><td>${escape(item.department)}</td><td><span class="pc-vendor-count">${item.vendors.length} Supplier${item.vendors.length === 1 ? '' : 's'}</span></td><td><strong class="pc-lowest">${money(low, item.currency)}</strong></td><td>${money(high, item.currency)}</td><td><strong class="pc-savings">${money(high - low, item.currency)}</strong></td><td>${formatDate(item.date)}</td><td><span class="pc-badge ${escape(item.status.toLowerCase())}">${escape(item.status)}</span></td><td><div class="pc-actions"><button class="pc-action" type="button" title="View comparison" aria-label="View ${escape(item.id)}" data-pc-action="view" data-id="${escape(item.id)}"><i class="fas fa-eye"></i></button><button class="pc-action" type="button" title="Edit" aria-label="Edit ${escape(item.id)}" data-pc-action="edit" data-id="${escape(item.id)}"><i class="fas fa-pen"></i></button><button class="pc-action" type="button" title="Print" aria-label="Print ${escape(item.id)}" data-pc-action="print" data-id="${escape(item.id)}"><i class="fas fa-print"></i></button><button class="pc-action pc-delete" type="button" title="Delete" aria-label="Delete ${escape(item.id)}" data-pc-action="delete" data-id="${escape(item.id)}"><i class="fas fa-trash"></i></button></div></td></tr>`;
        }).join('') : '<tr><td colspan="10"><div class="pc-empty">No purchase comparisons found.</div></td></tr>';
        updateStats();
    };
    const updateRecommendedOptions = () => {
        const select = q('[name="recommended"]');
        const oldValue = select.value;
        const names = [...section.querySelectorAll('.pc-vendor-name')].map(input => input.value.trim()).filter(Boolean);
        select.replaceChildren(new Option('Select after comparing', ''));
        names.forEach(name => select.add(new Option(name, name)));
        if (names.includes(oldValue)) select.value = oldValue;
    };
    const addVendor = (vendor = { name: '', quote: 0, delivery: 7, warranty: '1 Year', rating: 4 }) => {
        const row = document.createElement('div');
        row.className = 'pc-vendor-row';
        row.innerHTML = `<input class="pc-vendor-name" aria-label="Supplier name" placeholder="Supplier name" value="${escape(vendor.name)}"><input class="pc-vendor-quote" aria-label="Quotation amount" type="number" min="0" step="0.01" placeholder="Quotation amount" value="${Number(vendor.quote) || 0}"><input class="pc-vendor-delivery" aria-label="Delivery days" type="number" min="0" step="1" placeholder="Days" value="${Number(vendor.delivery) || 0}"><input class="pc-vendor-warranty" aria-label="Warranty" placeholder="Warranty" value="${escape(vendor.warranty)}"><input class="pc-vendor-rating" aria-label="Supplier rating out of five" type="number" min="0" max="5" step="0.1" placeholder="Rating" value="${Number(vendor.rating) || 0}"><button class="pc-remove-vendor" type="button" aria-label="Remove supplier"><i class="fas fa-xmark"></i></button>`;
        q('[data-pc-vendors]').appendChild(row);
        row.querySelector('.pc-vendor-name').addEventListener('input', updateRecommendedOptions);
        row.querySelector('.pc-remove-vendor').addEventListener('click', () => { row.remove(); updateRecommendedOptions(); });
    };
    const closeForm = () => q('[data-pc-form-overlay]').classList.remove('is-open');
    const closeView = () => q('[data-pc-view-overlay]').classList.remove('is-open');
    const openForm = comparison => {
        const form = q('[data-pc-form]');
        form.reset();
        q('[data-pc-vendors]').replaceChildren();
        editingId = comparison?.id ?? null;
        q('#pc-form-title').textContent = comparison ? 'Edit Purchase Comparison' : 'Create Purchase Comparison';
        form.elements.date.value = comparison?.date || new Date().toISOString().slice(0, 10);
        if (comparison) {
            ['request', 'requirement', 'department', 'quantity', 'currency', 'criteria', 'notes'].forEach(field => { form.elements[field].value = comparison[field] ?? ''; });
            comparison.vendors.forEach(addVendor);
            updateRecommendedOptions();
            form.elements.recommended.value = comparison.recommended || '';
        } else {
            addVendor(); addVendor(); addVendor();
            updateRecommendedOptions();
        }
        q('[data-pc-form-overlay]').classList.add('is-open');
        form.elements.request.focus();
    };
    const detailContent = comparison => {
        const low = lowest(comparison);
        return `<div class="pc-compare-header"><div><h2>${escape(comparison.requirement)}</h2><p>${escape(comparison.id)} · ${escape(comparison.request)} · ${escape(comparison.department)}</p></div><span class="pc-best-price">Lowest Quote: ${money(low, comparison.currency)}</span></div>
            <div class="pc-facts"><div class="pc-info-box"><h4>Status</h4><p><span class="pc-badge ${escape(comparison.status.toLowerCase())}">${escape(comparison.status)}</span></p></div><div class="pc-info-box"><h4>Quantity</h4><p>${Number(comparison.quantity)}</p></div><div class="pc-info-box"><h4>Evaluation Criteria</h4><p>${escape(comparison.criteria)}</p></div><div class="pc-info-box"><h4>Comparison Date</h4><p>${formatDate(comparison.date)}</p></div><div class="pc-info-box"><h4>Recommended Vendor</h4><p>${escape(comparison.recommended || 'Not selected')}</p></div></div>
            <h4 class="pc-table-title">Supplier Comparison</h4><div class="pc-table-wrap"><table class="pc-comparison-table"><thead><tr><th>Supplier</th><th>Quotation</th><th>Price / Unit</th><th>Delivery</th><th>Warranty</th><th>Rating</th><th>Recommendation</th></tr></thead><tbody>${comparison.vendors.map(vendor => {
                const isLowest = Number(vendor.quote) === low;
                const recommended = comparison.recommended === vendor.name;
                return `<tr><td><b>${escape(vendor.name)}</b></td><td class="${isLowest ? 'pc-best-cell' : ''}">${money(vendor.quote, comparison.currency)}${isLowest ? ' ✓' : ''}</td><td>${money(Number(vendor.quote) / Math.max(Number(comparison.quantity), 1), comparison.currency)}</td><td>${Number(vendor.delivery)} days</td><td>${escape(vendor.warranty || '—')}</td><td>★ ${Number(vendor.rating).toFixed(1)}</td><td>${recommended ? '<span class="pc-badge approved">Recommended</span>' : isLowest ? '<span class="pc-badge completed">Lowest Price</span>' : '—'}</td></tr>`;
            }).join('')}</tbody></table></div><div class="pc-total-box"><div><span>Lowest Quote</span><b>${money(low, comparison.currency)}</b></div><div><span>Highest Quote</span><b>${money(highest(comparison), comparison.currency)}</b></div><div class="pc-total-grand"><span>Potential Savings</span><b>${money(savings(comparison), comparison.currency)}</b></div></div><div class="pc-info-box pc-notes"><h4>Evaluation Notes</h4><p>${escape(comparison.notes || 'No notes provided.')}</p></div>`;
    };
    const printDocument = (title, html) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast('Allow pop-ups to print comparisons.');
        printWindow.document.write(`<!doctype html><html><head><title>${escape(title)}</title><meta charset="utf-8"><style>body{font:13px Arial,sans-serif;color:#172033;padding:32px}h1{font-size:23px;margin:0}p{color:#475569}.head{display:flex;justify-content:space-between;border-bottom:2px solid #172033;padding-bottom:14px;margin-bottom:20px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0}.meta strong{display:block;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}th{background:#f1f5f9}.best{background:#dcfce7;color:#15803d;font-weight:bold}.totals{width:280px;margin:18px 0 0 auto}.totals div{display:flex;justify-content:space-between;padding:6px;border-bottom:1px solid #e2e8f0}.grand{font-size:16px;font-weight:bold}.notes{margin-top:24px}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:35px;margin-top:65px}.signatures span{border-top:1px solid #475569;padding-top:8px}@media print{body{padding:0}}</style></head><body>${html}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    const printComparison = comparison => {
        const low = lowest(comparison);
        const rows = comparison.vendors.map(vendor => `<tr><td>${escape(vendor.name)}</td><td class="${Number(vendor.quote) === low ? 'best' : ''}">${money(vendor.quote, comparison.currency)}</td><td>${money(Number(vendor.quote) / Math.max(Number(comparison.quantity), 1), comparison.currency)}</td><td>${Number(vendor.delivery)} days</td><td>${escape(vendor.warranty || '—')}</td><td>${Number(vendor.rating).toFixed(1)}/5</td><td>${comparison.recommended === vendor.name ? 'RECOMMENDED' : Number(vendor.quote) === low ? 'LOWEST PRICE' : '—'}</td></tr>`).join('');
        const html = `<header class="head"><div><h1>Purchase Comparison</h1><p>Procurement Department</p></div><div><strong>${escape(comparison.id)}</strong><br>Date: ${formatDate(comparison.date)}</div></header><div class="meta"><div><strong>Purchase Request</strong>${escape(comparison.request)}</div><div><strong>Requirement</strong>${escape(comparison.requirement)}</div><div><strong>Department</strong>${escape(comparison.department)}</div><div><strong>Quantity</strong>${Number(comparison.quantity)}</div><div><strong>Evaluation Criteria</strong>${escape(comparison.criteria)}</div><div><strong>Status</strong>${escape(comparison.status)}</div><div><strong>Recommended Supplier</strong>${escape(comparison.recommended || 'Not selected')}</div><div><strong>Lowest Quote</strong>${money(low, comparison.currency)}</div></div><table><thead><tr><th>Supplier</th><th>Quotation</th><th>Price / Unit</th><th>Delivery</th><th>Warranty</th><th>Rating</th><th>Result</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div><span>Lowest Quote</span><b>${money(low, comparison.currency)}</b></div><div><span>Highest Quote</span><b>${money(highest(comparison), comparison.currency)}</b></div><div class="grand"><span>Potential Savings</span><b>${money(savings(comparison), comparison.currency)}</b></div></div><div class="notes"><strong>Evaluation Notes</strong><p>${escape(comparison.notes || 'No notes provided.')}</p></div><div class="signatures"><span>Prepared By</span><span>Evaluated By</span><span>Approved By</span></div>`;
        printDocument(comparison.id, html);
    };

    q('[data-pc-new]').addEventListener('click', () => openForm());
    q('[data-pc-add-vendor]').addEventListener('click', () => addVendor());
    q('[data-pc-search]').addEventListener('input', render);
    q('[data-pc-filter]').addEventListener('change', render);
    q('[data-pc-print-list]').addEventListener('click', () => {
        if (!comparisons.length) return toast('No comparisons available.');
        const rows = comparisons.map(item => `<tr><td>${escape(item.id)}</td><td>${escape(item.request)}</td><td>${escape(item.requirement)}</td><td>${escape(item.department)}</td><td>${item.vendors.length}</td><td>${money(lowest(item), item.currency)}</td><td>${money(highest(item), item.currency)}</td><td>${money(savings(item), item.currency)}</td><td>${escape(item.status)}</td></tr>`).join('');
        printDocument('Purchase Comparisons Report', `<header class="head"><div><h1>Purchase Comparisons</h1><p>Supplier Quotation Summary</p></div><div>${new Date().toLocaleDateString('en-US')}</div></header><table><thead><tr><th>Comparison</th><th>Request</th><th>Requirement</th><th>Department</th><th>Suppliers</th><th>Lowest</th><th>Highest</th><th>Savings</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`);
    });
    q('[data-pc-form]').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const vendors = [...section.querySelectorAll('.pc-vendor-row')].map(row => ({ name: row.querySelector('.pc-vendor-name').value.trim(), quote: Number(row.querySelector('.pc-vendor-quote').value) || 0, delivery: Number(row.querySelector('.pc-vendor-delivery').value) || 0, warranty: row.querySelector('.pc-vendor-warranty').value.trim(), rating: Number(row.querySelector('.pc-vendor-rating').value) || 0 })).filter(vendor => vendor.name);
        if (vendors.length < 2) return toast('Please add at least two suppliers.');
        if (vendors.some(vendor => vendor.quote < 0 || vendor.delivery < 0 || vendor.rating < 0 || vendor.rating > 5)) return toast('Enter valid supplier quote, delivery and rating values.');
        const existing = comparisons.find(item => item.id === editingId);
        const sequence = Math.max(0, ...comparisons.map(item => Number(item.id.match(/^PC-\d{4}-(\d+)$/)?.[1]) || 0)) + 1;
        const comparison = { id: existing?.id || `PC-${new Date().getFullYear()}-${String(sequence).padStart(3, '0')}`, request: form.elements.request.value.trim(), requirement: form.elements.requirement.value.trim(), department: form.elements.department.value, quantity: Number(form.elements.quantity.value), currency: form.elements.currency.value, date: form.elements.date.value, criteria: form.elements.criteria.value, status: existing?.status || 'Draft', recommended: form.elements.recommended.value, notes: form.elements.notes.value.trim(), vendors };
        if (existing) comparisons = comparisons.map(item => item.id === editingId ? comparison : item);
        else comparisons.unshift(comparison);
        save();
        closeForm();
        render();
        toast(existing ? 'Purchase comparison updated.' : 'Purchase comparison created.');
    });
    q('[data-pc-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-pc-action]');
        if (!button) return;
        const comparison = comparisons.find(item => item.id === button.dataset.id);
        if (!comparison) return;
        if (button.dataset.pcAction === 'view') {
            viewingId = comparison.id;
            q('[data-pc-view-content]').innerHTML = detailContent(comparison);
            q('[data-pc-view-overlay]').classList.add('is-open');
        } else if (button.dataset.pcAction === 'edit') {
            openForm(comparison);
        } else if (button.dataset.pcAction === 'print') {
            printComparison(comparison);
        } else if (button.dataset.pcAction === 'delete' && confirm(`Delete purchase comparison ${comparison.id}?`)) {
            comparisons = comparisons.filter(item => item.id !== comparison.id);
            save();
            render();
            toast('Purchase comparison deleted.');
        }
    });
    q('[data-pc-close-form]').addEventListener('click', closeForm);
    q('[data-pc-cancel]').addEventListener('click', closeForm);
    section.querySelectorAll('[data-pc-close-view]').forEach(button => button.addEventListener('click', closeView));
    q('[data-pc-print-current]').addEventListener('click', () => {
        const comparison = comparisons.find(item => item.id === viewingId);
        if (comparison) printComparison(comparison);
    });
    section.querySelectorAll('.pc-overlay').forEach(overlay => overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('is-open'); }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            q('[data-pc-form-overlay]').classList.remove('is-open');
            closeView();
        }
    });
    render();
    return section;
}