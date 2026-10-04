function createSuppliersModule() {
    const section = document.createElement('section');
    section.className = 'module suppliers-module hidden';
    section.id = 'suppliersModule';
    section.innerHTML = `
        <header class="sp-header"><div><h2>Suppliers</h2><p>Manage supplier profiles, contacts, categories, performance and procurement information</p></div><button class="sp-button sp-primary" type="button" data-sp-new><i class="fas fa-plus"></i> Add Supplier</button></header>
        <section class="sp-stats" aria-label="Supplier summary"><article class="sp-stat"><div><span>Total Suppliers</span><strong data-sp-stat="total">0</strong></div><i class="fas fa-users"></i></article><article class="sp-stat"><div><span>Active Suppliers</span><strong data-sp-stat="active">0</strong></div><i class="fas fa-circle-check"></i></article><article class="sp-stat"><div><span>Preferred Suppliers</span><strong data-sp-stat="preferred">0</strong></div><i class="fas fa-star"></i></article><article class="sp-stat"><div><span>Pending Approval</span><strong data-sp-stat="pending">0</strong></div><i class="fas fa-clock"></i></article><article class="sp-stat"><div><span>Inactive / Suspended</span><strong data-sp-stat="inactive">0</strong></div><i class="fas fa-ban"></i></article></section>
        <section class="sp-content" aria-label="Supplier directory"><div class="sp-toolbar"><label class="sp-search"><i class="fas fa-search" aria-hidden="true"></i><span class="sp-sr-only">Search suppliers</span><input type="search" data-sp-search placeholder="Search supplier, contact, email, category..."></label><select class="sp-filter" data-sp-status aria-label="Filter by status"><option value="">All Statuses</option><option>Active</option><option>Preferred</option><option>Pending Approval</option><option>Inactive</option><option>Suspended</option></select><select class="sp-filter" data-sp-category aria-label="Filter by category"><option value="">All Categories</option></select><button class="sp-button sp-light" type="button" data-sp-print-report><i class="fas fa-print"></i> Print Report</button></div>
            <div class="sp-table-wrap"><table class="sp-table"><thead><tr><th>Supplier</th><th>Contact Person</th><th>Category</th><th>Location</th><th>Payment Terms</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead><tbody data-sp-rows></tbody></table></div></section>
        <div class="sp-overlay" data-sp-form-overlay><section class="sp-modal" role="dialog" aria-modal="true" aria-labelledby="sp-form-title"><header class="sp-modal-head"><h3 id="sp-form-title">Add Supplier</h3><button class="sp-close" type="button" data-sp-close-form aria-label="Close">&times;</button></header>
            <form class="sp-form" data-sp-form><div class="sp-grid">
                <label>Supplier / Company Name<input name="name" required placeholder="Enter company name"></label><label>Supplier Code<input name="id" required placeholder="e.g. SUP-001"></label><label>Supplier Type<select name="type"><option>Local Supplier</option><option>International Supplier</option><option>Manufacturer</option><option>Distributor</option><option>Service Provider</option><option>Contractor</option></select></label>
                <label>Category<select name="category"><option>IT &amp; Technology</option><option>Office Supplies</option><option>Construction</option><option>Industrial</option><option>Facilities</option><option>Transportation</option><option>Professional Services</option><option>Hospitality</option><option>Medical</option><option>Other</option></select></label><label>Contact Person<input name="contact" required placeholder="Full name"></label><label>Job Title<input name="jobTitle" placeholder="e.g. Sales Manager"></label>
                <label>Email Address<input name="email" type="email" required placeholder="supplier@example.com"></label><label>Phone Number<input name="phone" type="tel" required placeholder="+971 50 000 0000"></label><label>Alternative Phone<input name="altPhone" type="tel" placeholder="+971..."></label>
                <label>Country<input name="country" value="United Arab Emirates" placeholder="Country"></label><label>City<input name="city" placeholder="City"></label><label>Website<input name="website" type="url" placeholder="https://company.com"></label>
                <label>Payment Terms<select name="paymentTerms"><option>Immediate</option><option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Net 60</option><option>Net 90</option></select></label><label>Currency<select name="currency"><option>USD</option><option>AED</option><option>EUR</option><option>GBP</option><option>SAR</option></select></label><label>Credit Limit<input name="creditLimit" type="number" min="0" step="0.01" placeholder="0.00"></label>
                <label>Supplier Rating<select name="rating"><option value="5">5 - Excellent</option><option value="4">4 - Very Good</option><option value="3">3 - Good</option><option value="2">2 - Fair</option><option value="1">1 - Poor</option></select></label><label>Status<select name="status"><option>Active</option><option>Preferred</option><option>Pending Approval</option><option>Inactive</option><option>Suspended</option></select></label><label>Tax / VAT Number<input name="taxNumber" placeholder="Tax registration number"></label>
                <label>Registration / License No.<input name="registration" placeholder="Business registration"></label><label class="sp-full">Address<textarea name="address" placeholder="Complete supplier address"></textarea></label><label class="sp-full">Products / Services Provided<textarea name="products" placeholder="Describe the products or services supplied"></textarea></label><label class="sp-full">Supplier Notes<textarea name="notes" placeholder="Internal notes, special conditions, delivery information, etc."></textarea></label>
            </div><footer class="sp-modal-actions"><button class="sp-button sp-light" type="button" data-sp-cancel>Cancel</button><button class="sp-button sp-primary" type="submit">Save Supplier</button></footer></form>
        </section></div>
        <div class="sp-overlay" data-sp-view-overlay><section class="sp-modal" role="dialog" aria-modal="true" aria-labelledby="sp-view-title"><header class="sp-modal-head"><h3 id="sp-view-title">Supplier Profile</h3><button class="sp-close" type="button" data-sp-close-view aria-label="Close">&times;</button></header><div class="sp-view" data-sp-view-content></div><footer class="sp-modal-actions"><button class="sp-button sp-light" type="button" data-sp-close-view>Close</button><button class="sp-button sp-primary" type="button" data-sp-print-current><i class="fas fa-print"></i> Print / PDF</button></footer></section></div>
        <div class="sp-toast" role="status" aria-live="polite" data-sp-toast></div>`;

    const storageKey = 'schoolSupplierDirectory';
    const seed = [
        { id: 'SUP-001', name: 'Gulf Technology LLC', type: 'Distributor', category: 'IT & Technology', contact: 'Ahmed Hassan', jobTitle: 'Sales Manager', email: 'ahmed@gulftech.example', phone: '+971 50 123 4567', altPhone: '+971 2 555 1234', country: 'United Arab Emirates', city: 'Abu Dhabi', website: 'www.gulftech.example', paymentTerms: 'Net 30', currency: 'AED', creditLimit: 150000, rating: 5, status: 'Preferred', taxNumber: '100234567800003', registration: 'CN-154821', address: 'Mussafah Industrial Area, Abu Dhabi, UAE', products: 'Laptops, networking equipment, printers and IT accessories.', notes: 'Strategic technology supplier with excellent delivery performance.' },
        { id: 'SUP-002', name: 'Al Noor Office Supplies', type: 'Local Supplier', category: 'Office Supplies', contact: 'Fatima Ali', jobTitle: 'Account Manager', email: 'fatima@alnoor.example', phone: '+971 50 245 8812', altPhone: '', country: 'United Arab Emirates', city: 'Dubai', website: 'www.alnoor.example', paymentTerms: 'Net 30', currency: 'AED', creditLimit: 80000, rating: 4, status: 'Active', taxNumber: '100456789100003', registration: 'CN-258741', address: 'Al Quoz, Dubai, UAE', products: 'Office furniture, stationery, printers and consumables.', notes: 'Reliable office supplies partner.' },
        { id: 'SUP-003', name: 'Smart Business Solutions', type: 'Service Provider', category: 'Professional Services', contact: 'Michael Thomas', jobTitle: 'Business Development Manager', email: 'michael@sbs.example', phone: '+971 52 998 1122', altPhone: '', country: 'United Arab Emirates', city: 'Abu Dhabi', website: 'www.sbs.example', paymentTerms: 'Net 45', currency: 'USD', creditLimit: 200000, rating: 5, status: 'Preferred', taxNumber: '100784521300003', registration: 'CN-365214', address: 'Al Reem Island, Abu Dhabi, UAE', products: 'Business consulting, managed services and software solutions.', notes: 'Preferred strategic services provider.' },
        { id: 'SUP-004', name: 'Prime Industrial Trading', type: 'Manufacturer', category: 'Industrial', contact: 'Omar Khalid', jobTitle: 'Key Account Manager', email: 'omar@primeindustrial.example', phone: '+971 55 654 3321', altPhone: '', country: 'United Arab Emirates', city: 'Sharjah', website: 'www.primeindustrial.example', paymentTerms: 'Net 60', currency: 'AED', creditLimit: 250000, rating: 3, status: 'Pending Approval', taxNumber: '100654789200003', registration: 'CN-487512', address: 'Industrial Area 10, Sharjah, UAE', products: 'Industrial tools, safety equipment and protective products.', notes: 'New supplier currently undergoing procurement approval.' },
        { id: 'SUP-005', name: 'Modern Facilities Trading', type: 'Distributor', category: 'Facilities', contact: 'Sara Wilson', jobTitle: 'Sales Executive', email: 'sara@modernfacilities.example', phone: '+971 50 785 4421', altPhone: '', country: 'United Arab Emirates', city: 'Dubai', website: 'www.modernfacilities.example', paymentTerms: 'Net 30', currency: 'AED', creditLimit: 100000, rating: 4, status: 'Active', taxNumber: '100521478900003', registration: 'CN-512478', address: 'Ras Al Khor, Dubai, UAE', products: 'Cleaning equipment, janitorial supplies and facility products.', notes: 'Good supplier with consistent product availability.' },
        { id: 'SUP-006', name: 'Global Medical Solutions', type: 'International Supplier', category: 'Medical', contact: 'Daniel George', jobTitle: 'Regional Sales Director', email: 'daniel@gms.example', phone: '+971 56 111 9090', altPhone: '', country: 'United Arab Emirates', city: 'Abu Dhabi', website: 'www.gms.example', paymentTerms: 'Net 45', currency: 'USD', creditLimit: 300000, rating: 5, status: 'Active', taxNumber: '100987451200003', registration: 'CN-625874', address: 'Khalifa City, Abu Dhabi, UAE', products: 'Medical equipment, consumables and laboratory supplies.', notes: 'Certified international medical supplier.' }
    ];
    let suppliers;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        suppliers = Array.isArray(stored) ? stored : seed;
    } catch (error) {
        suppliers = seed;
    }
    let editingId = null;
    let viewingId = null;
    let toastTimer;
    const q = selector => section.querySelector(selector);
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    const statusClass = status => status.toLowerCase().replace(/\s+/g, '-');
    const stars = rating => '★'.repeat(Math.max(0, Math.min(5, Number(rating) || 0))) + '☆'.repeat(5 - Math.max(0, Math.min(5, Number(rating) || 0)));
    const save = () => localStorage.setItem(storageKey, JSON.stringify(suppliers));
    const toast = message => {
        const element = q('[data-sp-toast]');
        element.textContent = message;
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 2400);
    };
    const updateCategoryFilter = () => {
        const select = q('[data-sp-category]');
        const current = select.value;
        const categories = [...new Set(suppliers.map(supplier => supplier.category).filter(Boolean))].sort();
        select.replaceChildren(new Option('All Categories', ''), ...categories.map(category => new Option(category, category)));
        if (categories.includes(current)) select.value = current;
    };
    const updateStats = () => {
        q('[data-sp-stat="total"]').textContent = suppliers.length;
        q('[data-sp-stat="active"]').textContent = suppliers.filter(supplier => ['Active', 'Preferred'].includes(supplier.status)).length;
        q('[data-sp-stat="preferred"]').textContent = suppliers.filter(supplier => supplier.status === 'Preferred').length;
        q('[data-sp-stat="pending"]').textContent = suppliers.filter(supplier => supplier.status === 'Pending Approval').length;
        q('[data-sp-stat="inactive"]').textContent = suppliers.filter(supplier => ['Inactive', 'Suspended'].includes(supplier.status)).length;
    };
    const render = () => {
        updateCategoryFilter();
        const search = q('[data-sp-search]').value.trim().toLowerCase();
        const status = q('[data-sp-status]').value;
        const category = q('[data-sp-category]').value;
        const filtered = suppliers.filter(supplier => (!status || supplier.status === status) && (!category || supplier.category === category) && (!search || JSON.stringify(supplier).toLowerCase().includes(search)));
        q('[data-sp-rows]').innerHTML = filtered.length ? filtered.map(supplier => `<tr><td><strong class="sp-id">${escape(supplier.id)}</strong><b class="sp-name">${escape(supplier.name)}</b><small class="sp-small">${escape(supplier.type)}</small></td><td><b>${escape(supplier.contact)}</b><small class="sp-small">${escape(supplier.jobTitle || '')}</small><small class="sp-small">${escape(supplier.email)}</small></td><td><b>${escape(supplier.category)}</b><small class="sp-small">${escape(supplier.products).slice(0, 55)}${supplier.products.length > 55 ? '...' : ''}</small></td><td><b>${escape(supplier.city)}</b><small class="sp-small">${escape(supplier.country)}</small></td><td><b>${escape(supplier.paymentTerms)}</b><small class="sp-small">${escape(supplier.currency)}</small></td><td><span class="sp-rating" aria-label="${Number(supplier.rating)} out of 5 stars">${stars(supplier.rating)}</span><small class="sp-small">${Number(supplier.rating)}/5</small></td><td><span class="sp-badge ${escape(statusClass(supplier.status))}">${escape(supplier.status)}</span></td><td><div class="sp-actions"><button class="sp-action" type="button" title="View" aria-label="View ${escape(supplier.name)}" data-sp-action="view" data-id="${escape(supplier.id)}"><i class="fas fa-eye"></i></button><button class="sp-action" type="button" title="Edit" aria-label="Edit ${escape(supplier.name)}" data-sp-action="edit" data-id="${escape(supplier.id)}"><i class="fas fa-pen"></i></button><button class="sp-action" type="button" title="Print" aria-label="Print ${escape(supplier.name)}" data-sp-action="print" data-id="${escape(supplier.id)}"><i class="fas fa-print"></i></button><button class="sp-action sp-delete" type="button" title="Delete" aria-label="Delete ${escape(supplier.name)}" data-sp-action="delete" data-id="${escape(supplier.id)}"><i class="fas fa-trash"></i></button></div></td></tr>`).join('') : '<tr><td colspan="8"><div class="sp-empty">No suppliers found.</div></td></tr>';
        updateStats();
    };
    const closeForm = () => q('[data-sp-form-overlay]').classList.remove('is-open');
    const closeView = () => q('[data-sp-view-overlay]').classList.remove('is-open');
    const openForm = supplier => {
        const form = q('[data-sp-form]');
        form.reset();
        editingId = supplier?.id ?? null;
        q('#sp-form-title').textContent = supplier ? 'Edit Supplier' : 'Add Supplier';
        if (supplier) {
            ['name', 'id', 'type', 'category', 'contact', 'jobTitle', 'email', 'phone', 'altPhone', 'country', 'city', 'website', 'paymentTerms', 'currency', 'creditLimit', 'rating', 'status', 'taxNumber', 'registration', 'address', 'products', 'notes'].forEach(field => { form.elements[field].value = supplier[field] ?? ''; });
        }
        q('[data-sp-form-overlay]').classList.add('is-open');
        form.elements.name.focus();
    };
    const detailContent = supplier => {
        const initials = supplier.name.split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase();
        const info = [['Website', supplier.website], ['Tax / VAT Number', supplier.taxNumber], ['Registration No.', supplier.registration], ['Alternative Phone', supplier.altPhone], ['Address', supplier.address], ['Products / Services', supplier.products]];
        return `<header class="sp-detail-header"><div class="sp-profile"><span class="sp-avatar">${escape(initials)}</span><div><h2>${escape(supplier.name)}</h2><p>${escape(supplier.id)} · ${escape(supplier.category)}</p></div></div><span class="sp-badge ${escape(statusClass(supplier.status))}">${escape(supplier.status)}</span></header>
            <div class="sp-summary-grid">${[['Supplier Code', supplier.id], ['Supplier Type', supplier.type], ['Category', supplier.category], ['Rating', `${stars(supplier.rating)} (${Number(supplier.rating)}/5)`], ['Contact Person', supplier.contact], ['Job Title', supplier.jobTitle || '—'], ['Email', supplier.email], ['Phone', supplier.phone], ['Location', `${supplier.city || '—'}, ${supplier.country || '—'}`], ['Payment Terms', supplier.paymentTerms], ['Currency', supplier.currency], ['Credit Limit', `${supplier.currency} ${Number(supplier.creditLimit || 0).toLocaleString()}`]].map(([label, value]) => `<div class="sp-summary-box"><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`).join('')}</div>
            <h4 class="sp-section-title">Business Information</h4><table class="sp-info-table"><tbody>${info.map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value || '—')}</td></tr>`).join('')}</tbody></table><div class="sp-notes"><strong>Internal Notes</strong><p>${escape(supplier.notes || 'No additional notes.')}</p></div>`;
    };
    const printDocument = (title, html) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast('Allow pop-ups to print supplier profiles.');
        printWindow.document.write(`<!doctype html><html><head><title>${escape(title)}</title><meta charset="utf-8"><style>body{font:13px Arial,sans-serif;color:#172033;padding:32px}h1{font-size:23px;margin:0}p{color:#475569}.head{display:flex;justify-content:space-between;border-bottom:2px solid #172033;padding-bottom:14px;margin-bottom:20px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:16px 0;font-size:12px}.meta strong{display:block;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:11px}th{background:#f1f5f9}.notes{margin-top:24px}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:35px;margin-top:65px}.signatures span{border-top:1px solid #475569;padding-top:8px}@media print{body{padding:0}}</style></head><body>${html}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    const printSupplier = supplier => {
        const html = `<header class="head"><div><h1>Supplier Profile</h1><p>Procurement &amp; Supplier Management</p></div><div><strong>${escape(supplier.id)}</strong><br>Status: ${escape(supplier.status)}</div></header><div class="meta"><div><strong>Company</strong>${escape(supplier.name)}</div><div><strong>Supplier Code</strong>${escape(supplier.id)}</div><div><strong>Type</strong>${escape(supplier.type)}</div><div><strong>Category</strong>${escape(supplier.category)}</div><div><strong>Contact</strong>${escape(supplier.contact)} · ${escape(supplier.jobTitle || '—')}</div><div><strong>Email</strong>${escape(supplier.email)}</div><div><strong>Phone</strong>${escape(supplier.phone)}</div><div><strong>Location</strong>${escape(supplier.city)}, ${escape(supplier.country)}</div><div><strong>Payment Terms</strong>${escape(supplier.paymentTerms)}</div><div><strong>Currency</strong>${escape(supplier.currency)}</div><div><strong>Credit Limit</strong>${escape(supplier.currency)} ${Number(supplier.creditLimit || 0).toLocaleString()}</div><div><strong>Rating</strong>${stars(supplier.rating)} (${Number(supplier.rating)}/5)</div><div><strong>Tax / VAT</strong>${escape(supplier.taxNumber || '—')}</div><div><strong>Registration</strong>${escape(supplier.registration || '—')}</div></div><table><thead><tr><th>Field</th><th>Supplier Information</th></tr></thead><tbody><tr><td>Website</td><td>${escape(supplier.website || '—')}</td></tr><tr><td>Alternative Phone</td><td>${escape(supplier.altPhone || '—')}</td></tr><tr><td>Address</td><td>${escape(supplier.address || '—')}</td></tr><tr><td>Products / Services</td><td>${escape(supplier.products || '—')}</td></tr></tbody></table><div class="notes"><strong>Notes</strong><p>${escape(supplier.notes || 'No additional notes.')}</p></div><div class="signatures"><span>Prepared By</span><span>Verified By</span><span>Approved By</span></div>`;
        printDocument(supplier.name, html);
    };

    q('[data-sp-new]').addEventListener('click', () => openForm());
    q('[data-sp-search]').addEventListener('input', render);
    q('[data-sp-status]').addEventListener('change', render);
    q('[data-sp-category]').addEventListener('change', render);
    q('[data-sp-print-report]').addEventListener('click', () => {
        if (!suppliers.length) return toast('No suppliers available.');
        const rows = suppliers.map(supplier => `<tr><td>${escape(supplier.id)}</td><td>${escape(supplier.name)}</td><td>${escape(supplier.contact)}<br>${escape(supplier.email)}</td><td>${escape(supplier.category)}</td><td>${escape(supplier.city)}, ${escape(supplier.country)}</td><td>${escape(supplier.paymentTerms)}</td><td>${stars(supplier.rating)}</td><td>${escape(supplier.status)}</td></tr>`).join('');
        printDocument('Supplier Directory', `<header class="head"><div><h1>Supplier Directory</h1><p>Procurement &amp; Supplier Management</p></div><div>Total Suppliers: <strong>${suppliers.length}</strong></div></header><table><thead><tr><th>Code</th><th>Supplier</th><th>Contact</th><th>Category</th><th>Location</th><th>Terms</th><th>Rating</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table><div class="signatures"><span>Prepared By</span><span>Checked By</span><span>Approved By</span></div>`);
    });
    q('[data-sp-form]').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const supplier = Object.fromEntries(new FormData(form).entries());
        supplier.id = supplier.id.trim();
        supplier.name = supplier.name.trim();
        supplier.creditLimit = Number(supplier.creditLimit) || 0;
        supplier.rating = Number(supplier.rating) || 0;
        const existing = suppliers.find(item => item.id === editingId);
        if (suppliers.some(item => item.id.toLowerCase() === supplier.id.toLowerCase() && item.id !== editingId)) return toast('Supplier code already exists.');
        if (existing) suppliers = suppliers.map(item => item.id === editingId ? supplier : item);
        else suppliers.unshift(supplier);
        save();
        closeForm();
        render();
        toast(existing ? 'Supplier updated successfully.' : 'Supplier added successfully.');
    });
    q('[data-sp-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-sp-action]');
        if (!button) return;
        const supplier = suppliers.find(item => item.id === button.dataset.id);
        if (!supplier) return;
        if (button.dataset.spAction === 'view') {
            viewingId = supplier.id;
            q('[data-sp-view-content]').innerHTML = detailContent(supplier);
            q('[data-sp-view-overlay]').classList.add('is-open');
        } else if (button.dataset.spAction === 'edit') {
            openForm(supplier);
        } else if (button.dataset.spAction === 'print') {
            printSupplier(supplier);
        } else if (button.dataset.spAction === 'delete' && confirm(`Delete supplier "${supplier.name}"?`)) {
            suppliers = suppliers.filter(item => item.id !== supplier.id);
            save();
            render();
            toast('Supplier deleted successfully.');
        }
    });
    q('[data-sp-close-form]').addEventListener('click', closeForm);
    q('[data-sp-cancel]').addEventListener('click', closeForm);
    section.querySelectorAll('[data-sp-close-view]').forEach(button => button.addEventListener('click', closeView));
    q('[data-sp-print-current]').addEventListener('click', () => {
        const supplier = suppliers.find(item => item.id === viewingId);
        if (supplier) printSupplier(supplier);
    });
    section.querySelectorAll('.sp-overlay').forEach(overlay => overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('is-open'); }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            q('[data-sp-form-overlay]').classList.remove('is-open');
            closeView();
        }
    });
    render();
    return section;
}