function createRoleManagementModule() {
    const section = document.createElement('section');
    section.className = 'module role-management-module hidden';
    section.id = 'roleManagementModule';
    section.innerHTML = `
        <header class="rm-header"><div><h2>User Roles</h2><p>System Department · Manage roles, permissions and access control</p></div><div class="rm-header-actions"><button class="rm-button rm-light" type="button" data-rm-refresh><i class="fas fa-rotate"></i> Refresh</button><button class="rm-button rm-light" type="button" data-rm-print><i class="fas fa-print"></i> Print / PDF</button><button class="rm-button rm-primary" type="button" data-rm-new><i class="fas fa-plus"></i> Add Role</button></div></header>
        <div class="rm-filters"><label for="rm-search">Search</label><input id="rm-search" data-rm-search class="rm-search-input" placeholder="Search role, description or department..."><label for="rm-status">Status</label><select id="rm-status" data-rm-status><option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select><label for="rm-type">Role Type</label><select id="rm-type" data-rm-type><option value="all">All Types</option><option value="system">System Role</option><option value="custom">Custom Role</option></select><button class="rm-button rm-light" type="button" data-rm-reset>Reset</button></div>
        <section class="rm-stats" aria-label="Role summary"><article class="rm-stat"><div><span>Total Roles</span><strong data-rm-stat="total">0</strong><small>All configured roles</small></div><i class="fas fa-user-shield"></i></article><article class="rm-stat"><div><span>Active Roles</span><strong data-rm-stat="active">0</strong><small>Currently available</small></div><i class="fas fa-circle-check"></i></article><article class="rm-stat"><div><span>System Roles</span><strong data-rm-stat="system">0</strong><small>Protected defaults</small></div><i class="fas fa-gear"></i></article><article class="rm-stat"><div><span>Custom Roles</span><strong data-rm-stat="custom">0</strong><small>Organization-defined</small></div><i class="fas fa-wand-magic-sparkles"></i></article><article class="rm-stat"><div><span>Assigned Users</span><strong data-rm-stat="users">1,284</strong><small>Across the system</small></div><i class="fas fa-users"></i></article></section>
        <section class="rm-grid"><article class="rm-card"><header class="rm-card-head"><div><h3>Role Distribution</h3><p>Users assigned to each major role</p></div><button class="rm-icon-button" type="button" data-rm-refresh-distribution title="Refresh role distribution" aria-label="Refresh role distribution"><i class="fas fa-rotate"></i></button></header><div class="rm-card-body" data-rm-distribution></div></article><article class="rm-card"><header class="rm-card-head"><div><h3>Permission Overview</h3><p>Quick access-control matrix</p></div><button class="rm-button rm-light" type="button" data-rm-manage>Manage</button></header><div class="rm-matrix-wrap"><table class="rm-matrix"><thead><tr><th>Permission</th><th>Admin</th><th>Teacher</th><th>Student</th><th>Parent</th><th>Finance</th></tr></thead><tbody><tr><td>Dashboard</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr><tr><td>View Students</td><td>✓</td><td>✓</td><td>×</td><td>✓</td><td>✓</td></tr><tr><td>Edit Students</td><td>✓</td><td>✓</td><td>×</td><td>×</td><td>×</td></tr><tr><td>Finance</td><td>✓</td><td>×</td><td>×</td><td>×</td><td>✓</td></tr><tr><td>System Settings</td><td>✓</td><td>×</td><td>×</td><td>×</td><td>×</td></tr></tbody></table></div></article></section>
        <section class="rm-table-card"><header class="rm-card-head"><div><h3>Role Management</h3><p>Manage user roles, access levels and permissions</p></div><button class="rm-button rm-light" type="button" data-rm-export><i class="fas fa-download"></i> Export CSV</button></header><div class="rm-table-wrap"><table class="rm-table"><thead><tr><th>Role</th><th>Type</th><th>Department</th><th>Users</th><th>Permissions</th><th>Status</th><th>Last Updated</th><th>Actions</th></tr></thead><tbody data-rm-rows></tbody></table></div></section>
        <div class="rm-overlay" data-rm-form-overlay><section class="rm-modal" role="dialog" aria-modal="true" aria-labelledby="rm-form-title"><header class="rm-modal-head"><h3 id="rm-form-title">Add New User Role</h3><button class="rm-close" type="button" data-rm-close-form aria-label="Close">&times;</button></header><form class="rm-form" data-rm-form><div class="rm-form-grid">
            <label>Role Name<input name="name" required placeholder="e.g. Department Manager"></label><label>Role Type<select name="type"><option value="custom">Custom Role</option><option value="system">System Role</option></select></label><label>Department<select name="department"><option>Administration</option><option>Academic</option><option>Finance</option><option>Communication</option><option>HR</option><option>Student Affairs</option><option>Procurement</option><option>Transport</option><option>System</option><option>General</option></select></label><label>Status<select name="status"><option value="active">Active</option><option value="inactive">Inactive</option></select></label><label class="rm-full">Description<textarea name="description" placeholder="Describe the responsibilities and access level of this role..."></textarea></label>
            <fieldset class="rm-permission-box rm-full"><legend>Assign Permissions</legend><div class="rm-permission-list">${[['Dashboard', 'Dashboard'], ['Users', 'User Management'], ['Students', 'Students'], ['Attendance', 'Attendance'], ['Finance', 'Finance'], ['Procurement', 'Procurement'], ['Communication', 'Communication'], ['HR', 'HR & Payroll'], ['Transport', 'Transport'], ['Reports', 'Reports'], ['Analytics', 'Analytics'], ['Settings', 'System Settings']].map(([value, label]) => `<label><input type="checkbox" value="${value}" data-rm-permission>${label}</label>`).join('')}</div></fieldset>
        </div><footer class="rm-modal-actions"><button class="rm-button rm-light" type="button" data-rm-cancel>Cancel</button><button class="rm-button rm-primary" type="submit">Save Role</button></footer></form></section></div>
        <div class="rm-overlay" data-rm-view-overlay><section class="rm-modal" role="dialog" aria-modal="true" aria-labelledby="rm-view-title"><header class="rm-modal-head"><h3 id="rm-view-title">Role Details</h3><button class="rm-close" type="button" data-rm-close-view aria-label="Close">&times;</button></header><div class="rm-view"><div class="rm-detail-grid"><div><span>Role Type</span><strong data-rm-view="type"></strong></div><div><span>Department</span><strong data-rm-view="department"></strong></div><div><span>Assigned Users</span><strong data-rm-view="users"></strong></div><div><span>Permissions</span><strong data-rm-view="permissions"></strong></div><div><span>Status</span><strong data-rm-view="status"></strong></div><div><span>Last Updated</span><strong data-rm-view="updated"></strong></div></div><div class="rm-view-description"><span>Description</span><p data-rm-view="description"></p></div><div class="rm-view-permissions"><b>Assigned Permissions</b><div data-rm-view-permissions></div></div></div><footer class="rm-modal-actions"><button class="rm-button rm-light" type="button" data-rm-close-view>Close</button><button class="rm-button rm-primary" type="button" data-rm-print-current><i class="fas fa-print"></i> Print</button></footer></section></div>
        <div class="rm-toast" role="status" aria-live="polite" data-rm-toast></div>`;

    const storageKey = 'edumasterRoleRegistry';
    const seed = [
        { name: 'Super Administrator', type: 'system', department: 'System', users: 8, status: 'active', updated: '04 Oct 2026', description: 'Complete system access and configuration control.', permissionList: ['Dashboard', 'User Management', 'Students', 'Finance', 'Procurement', 'Communication', 'HR & Payroll', 'Transport', 'Reports', 'Analytics', 'System Settings'] },
        { name: 'Administrator', type: 'system', department: 'Administration', users: 42, status: 'active', updated: '03 Oct 2026', description: 'Manage users, modules and institutional operations.', permissionList: ['Dashboard', 'User Management', 'Students', 'Attendance', 'Finance', 'Procurement', 'Communication', 'HR & Payroll', 'Reports', 'Analytics'] },
        { name: 'Teacher', type: 'system', department: 'Academic', users: 347, status: 'active', updated: '01 Oct 2026', description: 'Academic, attendance and student management access.', permissionList: ['Dashboard', 'Students', 'Attendance', 'Communication', 'Reports', 'Analytics'] },
        { name: 'Student', type: 'system', department: 'Student Affairs', users: 282, status: 'active', updated: '30 Sep 2026', description: 'Student portal and personal academic information.', permissionList: ['Dashboard', 'Attendance', 'Communication', 'Reports'] },
        { name: 'Parent', type: 'system', department: 'Communication', users: 167, status: 'active', updated: '28 Sep 2026', description: 'Parent portal, attendance and communication access.', permissionList: ['Dashboard', 'Students', 'Attendance', 'Communication', 'Reports'] },
        { name: 'Finance Officer', type: 'system', department: 'Finance', users: 52, status: 'active', updated: '27 Sep 2026', description: 'Finance, invoices, payments and accounting operations.', permissionList: ['Dashboard', 'Finance', 'Reports', 'Analytics'] },
        { name: 'HR Manager', type: 'custom', department: 'HR', users: 21, status: 'active', updated: '26 Sep 2026', description: 'Employee records, leave and payroll management.', permissionList: ['Dashboard', 'HR & Payroll', 'Reports', 'Analytics'] },
        { name: 'Communication Officer', type: 'custom', department: 'Communication', users: 17, status: 'active', updated: '25 Sep 2026', description: 'SMS, notices, announcements and parent communication.', permissionList: ['Dashboard', 'Communication', 'Reports', 'Analytics'] },
        { name: 'Procurement Officer', type: 'custom', department: 'Procurement', users: 14, status: 'active', updated: '24 Sep 2026', description: 'Suppliers, purchase orders, quotations and GRN.', permissionList: ['Dashboard', 'Procurement', 'Finance', 'Reports'] },
        { name: 'Transport Manager', type: 'custom', department: 'Transport', users: 6, status: 'inactive', updated: '20 Sep 2026', description: 'Vehicle, route, driver and transport operations.', permissionList: ['Dashboard', 'Transport', 'Reports'] },
        { name: 'Auditor', type: 'custom', department: 'Administration', users: 4, status: 'active', updated: '18 Sep 2026', description: 'Read-only access to reports and audit trails.', permissionList: ['Dashboard', 'Reports', 'Analytics'] },
        { name: 'Guest', type: 'system', department: 'General', users: 0, status: 'inactive', updated: '15 Sep 2026', description: 'Limited read-only portal access.', permissionList: ['Dashboard'] }
    ];
    let roles;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        roles = Array.isArray(stored) ? stored : seed;
    } catch (error) {
        roles = seed;
    }
    let editingName = null;
    let viewingName = null;
    let toastTimer;
    const q = selector => section.querySelector(selector);
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    const save = () => localStorage.setItem(storageKey, JSON.stringify(roles));
    const toast = message => {
        const element = q('[data-rm-toast]');
        element.textContent = message;
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 2300);
    };
    const updateStats = () => {
        q('[data-rm-stat="total"]').textContent = roles.length;
        q('[data-rm-stat="active"]').textContent = roles.filter(role => role.status === 'active').length;
        q('[data-rm-stat="system"]').textContent = roles.filter(role => role.type === 'system').length;
        q('[data-rm-stat="custom"]').textContent = roles.filter(role => role.type === 'custom').length;
    };
    const renderDistribution = () => {
        const distribution = [['Administrator', 'Full system access', 34, 436, 'purple'], ['Teacher', 'Academic management', 27, 347, 'blue'], ['Student', 'Student portal access', 22, 282, 'green'], ['Parent', 'Parent portal access', 13, 167, 'orange'], ['Finance Officer', 'Finance and accounting', 8, 52, 'pink']];
        q('[data-rm-distribution]').innerHTML = distribution.map(([name, description, percent, count, color]) => `<div class="rm-role-row"><span class="rm-role-icon ${color}">${escape(name[0])}</span><span class="rm-role-info"><b>${escape(name)}</b><small>${escape(description)}</small></span><span class="rm-role-bar"><i style="width:${percent}%"></i></span><strong class="rm-role-count">${count}</strong></div>`).join('');
    };
    const renderRows = () => {
        const search = q('[data-rm-search]').value.trim().toLowerCase();
        const status = q('[data-rm-status]').value;
        const type = q('[data-rm-type]').value;
        const filtered = roles.filter(role => (status === 'all' || role.status === status) && (type === 'all' || role.type === type) && (!search || `${role.name} ${role.department} ${role.description}`.toLowerCase().includes(search)));
        q('[data-rm-rows]').innerHTML = filtered.length ? filtered.map(role => `<tr><td><b>${escape(role.name)}</b><small>${escape(role.description)}</small></td><td><span class="rm-badge ${escape(role.type)}">${role.type === 'system' ? 'System' : 'Custom'}</span></td><td>${escape(role.department)}</td><td><b>${Number(role.users) || 0}</b></td><td>${role.permissions ?? role.permissionList.length}</td><td><span class="rm-badge ${escape(role.status)}">${role.status === 'active' ? 'Active' : 'Inactive'}</span></td><td>${escape(role.updated)}</td><td><div class="rm-actions"><button class="rm-button rm-light" type="button" data-rm-action="view" data-name="${escape(role.name)}">View</button><button class="rm-button rm-light" type="button" data-rm-action="edit" data-name="${escape(role.name)}">Edit</button></div></td></tr>`).join('') : '<tr><td colspan="8"><div class="rm-empty">No roles match these filters.</div></td></tr>';
    };
    const render = () => { updateStats(); renderDistribution(); renderRows(); };
    const closeForm = () => q('[data-rm-form-overlay]').classList.remove('is-open');
    const closeView = () => q('[data-rm-view-overlay]').classList.remove('is-open');
    const openForm = role => {
        const form = q('[data-rm-form]');
        form.reset();
        editingName = role?.name ?? null;
        q('#rm-form-title').textContent = role ? 'Edit User Role' : 'Add New User Role';
        form.elements.name.value = role?.name || '';
        form.elements.type.value = role?.type || 'custom';
        form.elements.department.value = role?.department || 'Administration';
        form.elements.status.value = role?.status || 'active';
        form.elements.description.value = role?.description || '';
        const granted = role?.permissionList || [];
        section.querySelectorAll('[data-rm-permission]').forEach(input => { input.checked = granted.includes(input.value); });
        q('[data-rm-form-overlay]').classList.add('is-open');
        form.elements.name.focus();
    };
    const openView = role => {
        viewingName = role.name;
        [['type', role.type === 'system' ? 'System' : 'Custom'], ['department', role.department], ['users', Number(role.users) || 0], ['permissions', role.permissionList.length], ['status', role.status === 'active' ? 'Active' : 'Inactive'], ['updated', role.updated]].forEach(([key, value]) => { q(`[data-rm-view="${key}"]`).textContent = value; });
        q('[data-rm-view="description"]').textContent = role.description || 'No description provided.';
        q('[data-rm-view-permissions]').innerHTML = role.permissionList.length ? role.permissionList.map(permission => `<span class="rm-permission-tag"><i class="fas fa-check"></i> ${escape(permission)}</span>`).join('') : '<span class="rm-empty-permissions">No permissions assigned.</span>';
        q('[data-rm-view-overlay]').classList.add('is-open');
    };
    const printDocument = (title, body) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast('Allow pop-ups to print role records.');
        printWindow.document.write(`<!doctype html><html><head><title>${escape(title)}</title><meta charset="utf-8"><style>body{font:12px Arial,sans-serif;color:#172033;padding:32px}h1{font-size:22px;margin:0}.head{display:flex;justify-content:space-between;border-bottom:2px solid #222;padding-bottom:14px;margin-bottom:18px}table{width:100%;border-collapse:collapse;margin:15px 0}th,td{border:1px solid #aaa;padding:7px;text-align:left;font-size:10px}th{background:#eee}.signature{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:65px}.signature span{border-top:1px solid #222;padding-top:7px;font-size:10px}@media print{body{padding:0}}</style></head><body>${body}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    const printRole = role => printDocument(role.name, `<header class="head"><div><h1>${escape(role.name)}</h1><p>User Role &amp; Permission Details</p></div><div>Generated: ${new Date().toLocaleDateString()}</div></header><table><tbody>${[['Role Type', role.type === 'system' ? 'System' : 'Custom'], ['Department', role.department], ['Assigned Users', Number(role.users) || 0], ['Total Permissions', role.permissionList.length], ['Status', role.status === 'active' ? 'Active' : 'Inactive'], ['Last Updated', role.updated], ['Description', role.description], ['Permissions', role.permissionList.join(', ') || 'None']].map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value)}</td></tr>`).join('')}</tbody></table><div class="signature"><span>Prepared By</span><span>System Administrator</span><span>Department Head</span></div>`);
    const printRoles = () => {
        const rows = [...q('[data-rm-rows]').querySelectorAll('tr')].filter(row => row.querySelector('td')).map(row => `<tr>${[...row.cells].slice(0, 7).map(cell => `<td>${escape(cell.innerText.replace(/\n/g, ' ').trim())}</td>`).join('')}</tr>`).join('');
        printDocument('User Roles Report', `<header class="head"><div><h1>User Roles Report</h1><p>System Department · User Roles &amp; Access Control</p></div><div>Generated: ${new Date().toLocaleDateString()}</div></header><table><thead><tr><th>Role</th><th>Type</th><th>Department</th><th>Users</th><th>Permissions</th><th>Status</th><th>Last Updated</th></tr></thead><tbody>${rows}</tbody></table><div class="signature"><span>Prepared By</span><span>System Administrator</span><span>Department Head</span></div>`);
    };

    q('[data-rm-new]').addEventListener('click', () => openForm());
    q('[data-rm-search]').addEventListener('input', renderRows);
    q('[data-rm-status]').addEventListener('change', renderRows);
    q('[data-rm-type]').addEventListener('change', renderRows);
    q('[data-rm-reset]').addEventListener('click', () => { q('[data-rm-search]').value = ''; q('[data-rm-status]').value = 'all'; q('[data-rm-type]').value = 'all'; renderRows(); toast('Filters reset.'); });
    q('[data-rm-refresh]').addEventListener('click', () => { render(); toast('User roles refreshed successfully.'); });
    q('[data-rm-refresh-distribution]').addEventListener('click', renderDistribution);
    q('[data-rm-manage]').addEventListener('click', () => openForm());
    q('[data-rm-print]').addEventListener('click', printRoles);
    q('[data-rm-export]').addEventListener('click', () => {
        const rows = [['Role', 'Type', 'Department', 'Users', 'Permissions', 'Status', 'Last Updated'], ...[...q('[data-rm-rows]').querySelectorAll('tr')].filter(row => row.querySelector('td')).map(row => [...row.cells].slice(0, 7).map(cell => cell.innerText.replace(/\n/g, ' ').trim()))];
        const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'user-roles.csv';
        link.click();
        URL.revokeObjectURL(url);
        toast('User roles CSV exported.');
    });
    q('[data-rm-form]').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const name = form.elements.name.value.trim();
        if (!name) return toast('Please enter a role name.');
        if (roles.some(role => role.name.toLowerCase() === name.toLowerCase() && role.name !== editingName)) return toast('A role with this name already exists.');
        const permissionList = [...section.querySelectorAll('[data-rm-permission]:checked')].map(input => input.value);
        const old = roles.find(role => role.name === editingName);
        const role = { name, type: form.elements.type.value, department: form.elements.department.value, users: old?.users ?? 0, permissions: String(permissionList.length), status: form.elements.status.value, updated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), description: form.elements.description.value.trim() || 'No description provided.', permissionList };
        if (old) roles = roles.map(item => item.name === editingName ? role : item);
        else roles.unshift(role);
        save();
        closeForm();
        render();
        toast(old ? 'Role updated successfully.' : 'New role created successfully.');
    });
    q('[data-rm-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-rm-action]');
        if (!button) return;
        const role = roles.find(item => item.name === button.dataset.name);
        if (!role) return;
        if (button.dataset.rmAction === 'view') openView(role);
        if (button.dataset.rmAction === 'edit') openForm(role);
    });
    q('[data-rm-close-form]').addEventListener('click', closeForm);
    q('[data-rm-cancel]').addEventListener('click', closeForm);
    section.querySelectorAll('[data-rm-close-view]').forEach(button => button.addEventListener('click', closeView));
    q('[data-rm-print-current]').addEventListener('click', () => {
        const role = roles.find(item => item.name === viewingName);
        if (role) printRole(role);
    });
    section.querySelectorAll('.rm-overlay').forEach(overlay => overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('is-open'); }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') { closeForm(); closeView(); }
    });
    render();
    return section;
}