function createFixedAssetsModule() {
    const section = document.createElement('section');
    section.className = 'module fixed-assets-module hidden';
    section.id = 'fixedAssetsModule';
    section.innerHTML = `
        <header class="fa-header"><div><h2>Fixed Assets</h2><p>Manage asset registers, locations, ownership, depreciation, maintenance and disposal</p></div><button class="fa-button fa-primary" type="button" data-fa-new><i class="fas fa-plus"></i> Add Fixed Asset</button></header>
        <section class="fa-stats" aria-label="Fixed asset summary"><article class="fa-stat"><div><span>Total Assets</span><strong data-fa-stat="total">0</strong></div><i class="fas fa-cubes"></i></article><article class="fa-stat"><div><span>Total Asset Value</span><strong data-fa-stat="value">AED 0</strong></div><i class="fas fa-gem"></i></article><article class="fa-stat"><div><span>In Use</span><strong data-fa-stat="inUse">0</strong></div><i class="fas fa-circle-check"></i></article><article class="fa-stat"><div><span>Maintenance</span><strong data-fa-stat="maintenance">0</strong></div><i class="fas fa-screwdriver-wrench"></i></article><article class="fa-stat"><div><span>Available</span><strong data-fa-stat="available">0</strong></div><i class="fas fa-box-open"></i></article><article class="fa-stat"><div><span>Disposed / Lost</span><strong data-fa-stat="disposed">0</strong></div><i class="fas fa-triangle-exclamation"></i></article></section>
        <section class="fa-content" aria-label="Fixed asset register"><div class="fa-toolbar"><label class="fa-search"><i class="fas fa-search" aria-hidden="true"></i><span class="fa-sr-only">Search fixed assets</span><input type="search" data-fa-search placeholder="Search asset, serial number, location, custodian..."></label><select class="fa-filter" data-fa-status aria-label="Filter by status"><option value="">All Statuses</option><option>In Use</option><option>Available</option><option>Maintenance</option><option>Disposed</option><option>Lost</option><option>Pending</option></select><select class="fa-filter" data-fa-category aria-label="Filter by category"><option value="">All Categories</option></select><select class="fa-filter" data-fa-location aria-label="Filter by location"><option value="">All Locations</option></select><button class="fa-button fa-light" type="button" data-fa-print-report><i class="fas fa-print"></i> Print / PDF</button></div>
            <div class="fa-table-wrap"><table class="fa-table"><thead><tr><th>Asset</th><th>Category</th><th>Purchase Date</th><th>Cost</th><th>Book Value</th><th>Location</th><th>Custodian</th><th>Status</th><th>Actions</th></tr></thead><tbody data-fa-rows></tbody></table></div></section>
        <div class="fa-overlay" data-fa-form-overlay><section class="fa-modal" role="dialog" aria-modal="true" aria-labelledby="fa-form-title"><header class="fa-modal-head"><h3 id="fa-form-title">Add Fixed Asset</h3><button class="fa-close" type="button" data-fa-close-form aria-label="Close">&times;</button></header>
            <form class="fa-form" data-fa-form>
                <h4 class="fa-section-title">Asset Identification</h4><div class="fa-grid">
                    <label>Asset ID / Tag Number<input name="id" required placeholder="FA-001"></label><label>Asset Name<input name="name" required placeholder="e.g. Dell Latitude Laptop"></label><label>Asset Category<select name="category"><option>IT Equipment</option><option>Office Furniture</option><option>Vehicles</option><option>Machinery</option><option>Buildings</option><option>Tools &amp; Equipment</option><option>Leasehold Improvements</option><option>Land</option><option>Other</option></select></label>
                    <label>Asset Class<select name="assetClass"><option>Capital Asset</option><option>Operational Asset</option><option>Low Value Asset</option><option>Leased Asset</option></select></label><label>Serial Number<input name="serialNumber" placeholder="Serial / chassis number"></label><label>Model Number<input name="modelNumber" placeholder="Model number"></label>
                    <label>Manufacturer / Brand<input name="manufacturer" placeholder="Manufacturer"></label><label>Purchase Order No.<input name="poNumber" placeholder="PO-0001"></label><label>Supplier<input name="supplier" placeholder="Supplier name"></label>
                </div>
                <h4 class="fa-section-title">Financial Information</h4><div class="fa-grid">
                    <label>Purchase Date<input name="purchaseDate" type="date" required></label><label>Purchase Cost<input name="purchaseCost" type="number" min="0" step="0.01" required placeholder="0.00"></label><label>Currency<select name="currency"><option>AED</option><option>USD</option><option>EUR</option><option>GBP</option><option>SAR</option></select></label>
                    <label>Depreciation Method<select name="depreciationMethod"><option>Straight Line</option><option>Declining Balance</option><option>No Depreciation</option></select></label><label>Useful Life (Years)<input name="usefulLife" type="number" min="0" step="1" value="5"></label><label>Salvage Value<input name="salvageValue" type="number" min="0" step="0.01" value="0"></label>
                    <label>Accumulated Depreciation<input name="accumulatedDepreciation" type="number" min="0" step="0.01" value="0"></label><label>Current Book Value<input name="bookValue" type="number" min="0" step="0.01" value="0"></label><label>Depreciation Start Date<input name="depreciationStart" type="date"></label>
                </div>
                <h4 class="fa-section-title">Location &amp; Assignment</h4><div class="fa-grid">
                    <label>Location<input name="location" required placeholder="e.g. Head Office"></label><label>Department<input name="department" placeholder="e.g. Finance"></label><label>Custodian / Employee<input name="custodian" placeholder="Responsible person"></label>
                    <label>Cost Center<input name="costCenter" placeholder="CC-001"></label><label>Status<select name="status"><option>In Use</option><option>Available</option><option>Maintenance</option><option>Disposed</option><option>Lost</option><option>Pending</option></select></label><label>Condition<select name="condition"><option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option><option>Damaged</option></select></label>
                </div>
                <h4 class="fa-section-title">Warranty &amp; Maintenance</h4><div class="fa-grid">
                    <label>Warranty Start<input name="warrantyStart" type="date"></label><label>Warranty End<input name="warrantyEnd" type="date"></label><label>Last Maintenance<input name="lastMaintenance" type="date"></label><label>Next Maintenance<input name="nextMaintenance" type="date"></label>
                    <label class="fa-full">Asset Description<textarea name="description" placeholder="Asset specifications and description..."></textarea></label><label class="fa-full">Notes<textarea name="notes" placeholder="Internal notes, maintenance information, disposal notes..."></textarea></label>
                </div>
                <footer class="fa-modal-actions"><button class="fa-button fa-light" type="button" data-fa-cancel>Cancel</button><button class="fa-button fa-primary" type="submit">Save Asset</button></footer>
            </form>
        </section></div>
        <div class="fa-overlay" data-fa-view-overlay><section class="fa-modal" role="dialog" aria-modal="true" aria-labelledby="fa-view-title"><header class="fa-modal-head"><h3 id="fa-view-title">Fixed Asset Profile</h3><button class="fa-close" type="button" data-fa-close-view aria-label="Close">&times;</button></header><div class="fa-view" data-fa-view-content></div><footer class="fa-modal-actions"><button class="fa-button fa-light" type="button" data-fa-close-view>Close</button><button class="fa-button fa-primary" type="button" data-fa-print-current><i class="fas fa-print"></i> Print / PDF</button></footer></section></div>
        <div class="fa-toast" role="status" aria-live="polite" data-fa-toast></div>`;

    const storageKey = 'schoolFixedAssets';

    let assets;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        assets = Array.isArray(stored) ? stored : [];
    } catch (error) {
        assets = [];
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
    const statusClass = status => String(status || '').toLowerCase().replace(/\s+/g, '-');
    const save = () => localStorage.setItem(storageKey, JSON.stringify(assets));
    const toast = message => {
        const element = q('[data-fa-toast]');
        element.textContent = message;
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 2400);
    };
    const updateFilters = () => {
        const categoryFilter = q('[data-fa-category]');
        const locationFilter = q('[data-fa-location]');
        const selectedCategory = categoryFilter.value;
        const selectedLocation = locationFilter.value;
        const categories = [...new Set(assets.map(asset => asset.category).filter(Boolean))].sort();
        const locations = [...new Set(assets.map(asset => asset.location).filter(Boolean))].sort();
        categoryFilter.replaceChildren(new Option('All Categories', ''), ...categories.map(category => new Option(category, category)));
        locationFilter.replaceChildren(new Option('All Locations', ''), ...locations.map(location => new Option(location, location)));
        if (categories.includes(selectedCategory)) categoryFilter.value = selectedCategory;
        if (locations.includes(selectedLocation)) locationFilter.value = selectedLocation;
    };
    const updateStats = () => {
        q('[data-fa-stat="total"]').textContent = assets.length;
        const totals = {};
        assets.forEach(asset => { totals[asset.currency] = (totals[asset.currency] || 0) + Number(asset.purchaseCost || 0); });
        const entries = Object.entries(totals);
        const value = q('[data-fa-stat="value"]');
        value.textContent = entries.length <= 1 ? money(entries[0]?.[1] || 0, entries[0]?.[0] || 'AED').replace(/\.00$/, '') : 'Multiple';
        value.title = entries.map(([currency, amount]) => money(amount, currency)).join(' · ');
        q('[data-fa-stat="inUse"]').textContent = assets.filter(asset => asset.status === 'In Use').length;
        q('[data-fa-stat="maintenance"]').textContent = assets.filter(asset => asset.status === 'Maintenance').length;
        q('[data-fa-stat="available"]').textContent = assets.filter(asset => asset.status === 'Available').length;
        q('[data-fa-stat="disposed"]').textContent = assets.filter(asset => ['Disposed', 'Lost'].includes(asset.status)).length;
    };
    const render = () => {
        updateFilters();
        const search = q('[data-fa-search]').value.trim().toLowerCase();
        const status = q('[data-fa-status]').value;
        const category = q('[data-fa-category]').value;
        const location = q('[data-fa-location]').value;
        const filtered = assets.filter(asset => (!status || asset.status === status) && (!category || asset.category === category) && (!location || asset.location === location) && (!search || JSON.stringify(asset).toLowerCase().includes(search)));
        q('[data-fa-rows]').innerHTML = filtered.length ? filtered.map(asset => `<tr><td><strong class="fa-code">${escape(asset.id)}</strong><b class="fa-name">${escape(asset.name)}</b><small class="fa-small">${escape(asset.serialNumber || 'No serial number')}</small></td><td><b>${escape(asset.category)}</b><small class="fa-small">${escape(asset.manufacturer || '')}</small></td><td>${formatDate(asset.purchaseDate)}</td><td><strong>${money(asset.purchaseCost, asset.currency)}</strong></td><td><strong>${money(asset.bookValue, asset.currency)}</strong></td><td><b>${escape(asset.location)}</b><small class="fa-small">${escape(asset.department || '')}</small></td><td><b>${escape(asset.custodian || '—')}</b><small class="fa-small">${escape(asset.costCenter || '')}</small></td><td><span class="fa-badge ${escape(statusClass(asset.status))}">${escape(asset.status)}</span><small class="fa-small">${escape(asset.condition || '')}</small></td><td><div class="fa-actions"><button class="fa-action" type="button" title="View" aria-label="View ${escape(asset.name)}" data-fa-action="view" data-id="${escape(asset.id)}"><i class="fas fa-eye"></i></button><button class="fa-action" type="button" title="Edit" aria-label="Edit ${escape(asset.name)}" data-fa-action="edit" data-id="${escape(asset.id)}"><i class="fas fa-pen"></i></button><button class="fa-action" type="button" title="Print" aria-label="Print ${escape(asset.name)}" data-fa-action="print" data-id="${escape(asset.id)}"><i class="fas fa-print"></i></button><button class="fa-action fa-delete" type="button" title="Delete" aria-label="Delete ${escape(asset.name)}" data-fa-action="delete" data-id="${escape(asset.id)}"><i class="fas fa-trash"></i></button></div></td></tr>`).join('') : '<tr><td colspan="9"><div class="fa-empty">No fixed assets found.</div></td></tr>';
        updateStats();
    };
    const closeForm = () => q('[data-fa-form-overlay]').classList.remove('is-open');
    const closeView = () => q('[data-fa-view-overlay]').classList.remove('is-open');
    const openForm = asset => {
        const form = q('[data-fa-form]');
        form.reset();
        editingId = asset?.id ?? null;
        q('#fa-form-title').textContent = asset ? 'Edit Fixed Asset' : 'Add Fixed Asset';
        if (asset) {
            ['id', 'name', 'category', 'assetClass', 'serialNumber', 'modelNumber', 'manufacturer', 'poNumber', 'supplier', 'purchaseDate', 'purchaseCost', 'currency', 'depreciationMethod', 'usefulLife', 'salvageValue', 'accumulatedDepreciation', 'bookValue', 'depreciationStart', 'location', 'department', 'custodian', 'costCenter', 'status', 'condition', 'warrantyStart', 'warrantyEnd', 'lastMaintenance', 'nextMaintenance', 'description', 'notes'].forEach(field => { form.elements[field].value = asset[field] ?? ''; });
        }
        q('[data-fa-form-overlay]').classList.add('is-open');
        form.elements.id.focus();
    };
    const detailContent = asset => `<header class="fa-detail-header"><div class="fa-profile"><span class="fa-avatar">${escape(asset.name.split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase())}</span><div><h2>${escape(asset.name)}</h2><p>${escape(asset.id)} · ${escape(asset.category)} · ${escape(asset.assetClass)}</p></div></div><span class="fa-badge ${escape(statusClass(asset.status))}">${escape(asset.status)}</span></header>
        <div class="fa-summary-grid">${[['Asset ID', asset.id], ['Category', asset.category], ['Purchase Cost', money(asset.purchaseCost, asset.currency)], ['Book Value', money(asset.bookValue, asset.currency)], ['Purchase Date', formatDate(asset.purchaseDate)], ['Serial Number', asset.serialNumber || '—'], ['Location', asset.location], ['Custodian', asset.custodian || '—'], ['Department', asset.department || '—'], ['Condition', asset.condition || '—'], ['Useful Life', `${asset.usefulLife} Years`], ['Depreciation', asset.depreciationMethod]].map(([label, value]) => `<div class="fa-summary-box"><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`).join('')}</div>
        <h4 class="fa-section-title">Asset Information</h4><table class="fa-info-table"><tbody>${[['Manufacturer', asset.manufacturer], ['Model Number', asset.modelNumber], ['Purchase Order', asset.poNumber], ['Supplier', asset.supplier], ['Cost Center', asset.costCenter], ['Accumulated Depreciation', money(asset.accumulatedDepreciation, asset.currency)], ['Salvage Value', money(asset.salvageValue, asset.currency)], ['Depreciation Start', formatDate(asset.depreciationStart)], ['Warranty', `${formatDate(asset.warrantyStart)} to ${formatDate(asset.warrantyEnd)}`], ['Last Maintenance', formatDate(asset.lastMaintenance)], ['Next Maintenance', formatDate(asset.nextMaintenance)], ['Description', asset.description]].map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value || '—')}</td></tr>`).join('')}</tbody></table><div class="fa-notes"><strong>Asset Notes</strong><p>${escape(asset.notes || 'No additional notes.')}</p></div>`;
    const printDocument = (title, html) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast('Allow pop-ups to print asset records.');
        printWindow.document.write(`<!doctype html><html><head><title>${escape(title)}</title><meta charset="utf-8"><style>body{font:13px Arial,sans-serif;color:#172033;padding:32px}h1{font-size:23px;margin:0}p{color:#475569}.head{display:flex;justify-content:space-between;border-bottom:2px solid #172033;padding-bottom:14px;margin-bottom:20px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:16px 0;font-size:12px}.meta strong{display:block;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:11px}th{background:#f1f5f9}.notes{margin-top:24px}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:35px;margin-top:65px}.signatures span{border-top:1px solid #475569;padding-top:8px}@media print{body{padding:0}}</style></head><body>${html}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    const printAsset = asset => {
        const fields = [['Manufacturer', asset.manufacturer], ['Supplier', asset.supplier], ['Purchase Date', formatDate(asset.purchaseDate)], ['Purchase Cost', money(asset.purchaseCost, asset.currency)], ['Book Value', money(asset.bookValue, asset.currency)], ['Accumulated Depreciation', money(asset.accumulatedDepreciation, asset.currency)], ['Location', asset.location], ['Department', asset.department], ['Custodian', asset.custodian], ['Condition', asset.condition], ['PO Number', asset.poNumber], ['Cost Center', asset.costCenter], ['Depreciation Method', asset.depreciationMethod], ['Useful Life', `${asset.usefulLife} years`], ['Warranty', `${formatDate(asset.warrantyStart)} to ${formatDate(asset.warrantyEnd)}`], ['Last Maintenance', formatDate(asset.lastMaintenance)], ['Next Maintenance', formatDate(asset.nextMaintenance)], ['Description', asset.description]];
        const html = `<header class="head"><div><h1>Fixed Asset Register</h1><p>Asset Management &amp; Finance Department</p></div><div><strong>${escape(asset.id)}</strong><br>Status: ${escape(asset.status)}</div></header><div class="meta">${[['Asset', asset.name], ['Asset ID', asset.id], ['Category', asset.category], ['Asset Class', asset.assetClass], ['Serial Number', asset.serialNumber], ['Model', asset.modelNumber], ...fields].map(([label, value]) => `<div><strong>${escape(label)}</strong>${escape(value || '—')}</div>`).join('')}</div><table><thead><tr><th>Field</th><th>Asset Information</th></tr></thead><tbody>${[['Warranty Start', formatDate(asset.warrantyStart)], ['Warranty End', formatDate(asset.warrantyEnd)], ['Salvage Value', money(asset.salvageValue, asset.currency)], ['Notes', asset.notes]].map(([label, value]) => `<tr><td>${escape(label)}</td><td>${escape(value || '—')}</td></tr>`).join('')}</tbody></table><div class="signatures"><span>Prepared By</span><span>Verified By</span><span>Approved By</span></div>`;
        printDocument(asset.name, html);
    };

    q('[data-fa-new]').addEventListener('click', () => openForm());
    q('[data-fa-search]').addEventListener('input', render);
    q('[data-fa-status]').addEventListener('change', render);
    q('[data-fa-category]').addEventListener('change', render);
    q('[data-fa-location]').addEventListener('change', render);
    q('[data-fa-print-report]').addEventListener('click', () => {
        if (!assets.length) return toast('No fixed assets available.');
        const rows = assets.map(asset => `<tr><td>${escape(asset.id)}</td><td>${escape(asset.name)}</td><td>${escape(asset.category)}</td><td>${formatDate(asset.purchaseDate)}</td><td>${money(asset.purchaseCost, asset.currency)}</td><td>${money(asset.bookValue, asset.currency)}</td><td>${escape(asset.location)}</td><td>${escape(asset.custodian || '—')}</td><td>${escape(asset.status)}</td></tr>`).join('');
        printDocument('Fixed Asset Register', `<header class="head"><div><h1>Fixed Asset Register</h1><p>Asset Management &amp; Finance Department</p></div><div>Total Assets: <strong>${assets.length}</strong></div></header><table><thead><tr><th>Asset ID</th><th>Asset Name</th><th>Category</th><th>Purchase Date</th><th>Purchase Cost</th><th>Book Value</th><th>Location</th><th>Custodian</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table><div class="signatures"><span>Prepared By</span><span>Checked By</span><span>Approved By</span></div>`);
    });
    q('[data-fa-form]').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const asset = Object.fromEntries(new FormData(form).entries());
        ['purchaseCost', 'usefulLife', 'salvageValue', 'accumulatedDepreciation', 'bookValue'].forEach(field => { asset[field] = Number(asset[field]) || 0; });
        asset.id = asset.id.trim();
        asset.name = asset.name.trim();
        asset.purchaseCost = Math.max(0, asset.purchaseCost);
        asset.salvageValue = Math.max(0, asset.salvageValue);
        asset.accumulatedDepreciation = Math.max(0, asset.accumulatedDepreciation);
        asset.bookValue = Math.max(0, asset.bookValue);
        const existing = assets.find(item => item.id === editingId);
        if (assets.some(item => item.id.toLowerCase() === asset.id.toLowerCase() && item.id !== editingId)) return toast('Asset ID already exists.');
        if (asset.salvageValue > asset.purchaseCost || asset.accumulatedDepreciation > asset.purchaseCost) return toast('Salvage value and accumulated depreciation cannot exceed purchase cost.');
        if (existing) assets = assets.map(item => item.id === editingId ? asset : item);
        else assets.unshift(asset);
        save();
        closeForm();
        render();
        toast(existing ? 'Fixed asset updated successfully.' : 'Fixed asset added successfully.');
    });
    q('[data-fa-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-fa-action]');
        if (!button) return;
        const asset = assets.find(item => item.id === button.dataset.id);
        if (!asset) return;
        if (button.dataset.faAction === 'view') {
            viewingId = asset.id;
            q('[data-fa-view-content]').innerHTML = detailContent(asset);
            q('[data-fa-view-overlay]').classList.add('is-open');
        } else if (button.dataset.faAction === 'edit') {
            openForm(asset);
        } else if (button.dataset.faAction === 'print') {
            printAsset(asset);
        } else if (button.dataset.faAction === 'delete' && confirm(`Delete fixed asset "${asset.name}"?`)) {
            assets = assets.filter(item => item.id !== asset.id);
            save();
            render();
            toast('Fixed asset deleted.');
        }
    });
    q('[data-fa-close-form]').addEventListener('click', closeForm);
    q('[data-fa-cancel]').addEventListener('click', closeForm);
    section.querySelectorAll('[data-fa-close-view]').forEach(button => button.addEventListener('click', closeView));
    q('[data-fa-print-current]').addEventListener('click', () => {
        const asset = assets.find(item => item.id === viewingId);
        if (asset) printAsset(asset);
    });
    section.querySelectorAll('.fa-overlay').forEach(overlay => overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('is-open'); }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            q('[data-fa-form-overlay]').classList.remove('is-open');
            closeView();
        }
    });
    render();
    return section;
}