function createAuditLogsModule() {
    const section = document.createElement('section');
    section.className = 'module audit-logs-module hidden';
    section.id = 'auditLogsModule';
    section.innerHTML = `
        <header class="al-header"><div><h2>Audit Logs</h2><p>System Department · Monitor system activity, security events and user actions</p></div><div class="al-header-actions"><button class="al-button al-light" type="button" data-al-refresh><i class="fas fa-rotate"></i> Refresh</button><button class="al-button al-light" type="button" data-al-clear><i class="fas fa-filter-circle-xmark"></i> Clear Filters</button><button class="al-button al-light" type="button" data-al-print><i class="fas fa-print"></i> Print / PDF</button><button class="al-button al-primary" type="button" data-al-export><i class="fas fa-download"></i> Export Logs</button></div></header>
        <div class="al-filters"><label for="al-search">Search</label><input id="al-search" class="al-search-input" data-al-search placeholder="Search user, action, module, IP..."><label for="al-action">Action</label><select id="al-action" data-al-action-filter><option value="all">All Actions</option><option value="login">Login</option><option value="logout">Logout</option><option value="create">Create</option><option value="update">Update</option><option value="delete">Delete</option><option value="view">View</option><option value="export">Export</option><option value="security">Security</option></select><label for="al-module">Module</label><select id="al-module" data-al-module-filter><option value="all">All Modules</option><option>System</option><option>Users</option><option>Finance</option><option>Procurement</option><option>Communication</option><option>Students</option><option>Reports</option></select><label for="al-date">Date</label><select id="al-date" data-al-date-filter><option value="all">All Dates</option><option value="today">Today</option><option value="week">Last 7 Days</option><option value="month">This Month</option></select></div>
        <section class="al-stats" aria-label="Audit summary"><article class="al-stat"><div><span>Total Events</span><strong>8,642</strong><small class="al-trend up">▲ 12.4%</small></div><i class="fas fa-list-check"></i></article><article class="al-stat"><div><span>Today's Events</span><strong>428</strong><small class="al-trend up">▲ 8.6%</small></div><i class="fas fa-clock"></i></article><article class="al-stat"><div><span>Successful Actions</span><strong>99.2%</strong><small class="al-trend up">▲ 0.4%</small></div><i class="fas fa-circle-check"></i></article><article class="al-stat"><div><span>Security Events</span><strong>17</strong><small class="al-trend down">▼ 3 this week</small></div><i class="fas fa-shield-halved"></i></article><article class="al-stat"><div><span>Failed Attempts</span><strong>23</strong><small class="al-trend down">▼ 11.5%</small></div><i class="fas fa-triangle-exclamation"></i></article></section>
        <section class="al-analytics"><article class="al-card"><header class="al-card-head"><div><h3>Activity Overview</h3><p>System events during the last 7 days</p></div><button class="al-button al-light" type="button" data-al-redraw title="Refresh activity chart"><i class="fas fa-rotate"></i></button></header><div class="al-card-body"><div class="al-chart" data-al-chart aria-label="Daily activity bar chart"></div></div></article>
            <article class="al-card"><header class="al-card-head"><div><h3>Action Breakdown</h3><p>Distribution of recorded activities</p></div><span class="al-badge view">Live</span></header><div class="al-card-body"><div class="al-event-list" data-al-action-summary></div></div></article></section>
        <section class="al-table-card"><header class="al-card-head"><div><h3>System Audit Trail</h3><p>Complete history of user and system activities</p></div><span class="al-badge success"><i class="fas fa-circle"></i> System Monitoring Active</span></header><div class="al-table-wrap"><table class="al-table"><thead><tr><th>Log ID</th><th>User</th><th>Action</th><th>Module</th><th>Description</th><th>IP Address</th><th>Date &amp; Time</th><th>Status</th><th>Actions</th></tr></thead><tbody data-al-rows></tbody></table></div></section>
        <div class="al-overlay" data-al-view-overlay><section class="al-modal" role="dialog" aria-modal="true" aria-labelledby="al-view-title"><header class="al-modal-head"><h3 id="al-view-title">Audit Log Details</h3><button class="al-close" type="button" data-al-close aria-label="Close">&times;</button></header><div class="al-view"><div class="al-detail-grid"><div><span>Log ID</span><strong data-al-detail="id"></strong></div><div><span>User</span><strong data-al-detail="user"></strong></div><div><span>Role</span><strong data-al-detail="role"></strong></div><div><span>Action</span><strong data-al-detail="action"></strong></div><div><span>Module</span><strong data-al-detail="module"></strong></div><div><span>Status</span><strong data-al-detail="status"></strong></div><div><span>IP Address</span><strong data-al-detail="ip"></strong></div><div><span>Date &amp; Time</span><strong data-al-detail="time"></strong></div><div><span>Device</span><strong data-al-detail="device"></strong></div><div class="al-detail-full"><span>Description</span><strong data-al-detail="description"></strong></div></div><div class="al-security-info"><b>Security Information</b><p data-al-detail="security"></p></div></div><footer class="al-modal-actions"><button class="al-button al-light" type="button" data-al-close>Close</button><button class="al-button al-primary" type="button" data-al-print-current><i class="fas fa-print"></i> Print / PDF</button></footer></section></div>
        <div class="al-toast" role="status" aria-live="polite" data-al-toast></div>`;

    const logs = [
        { id: 'AUD-8642', user: 'Ahmed Saleh', role: 'Administrator', action: 'Login', module: 'System', description: 'User successfully logged into the system.', ip: '192.168.1.24', timestamp: '2026-10-04T10:42:00', timeLabel: '04 Oct 2026 · 10:42 AM', status: 'Success', device: 'Chrome / Windows', security: 'Authentication was completed successfully. No suspicious activity was detected for this event.' },
        { id: 'AUD-8641', user: 'Maria Khan', role: 'HR Manager', action: 'Update', module: 'Users', description: 'Updated user role and access permissions.', ip: '192.168.1.31', timestamp: '2026-10-04T10:28:00', timeLabel: '04 Oct 2026 · 10:28 AM', status: 'Success', device: 'Edge / Windows', security: 'Authorized administrative change detected.' },
        { id: 'AUD-8640', user: 'Omar Malik', role: 'Procurement Officer', action: 'Create', module: 'Procurement', description: 'Created purchase order PO-2026-0187.', ip: '192.168.1.44', timestamp: '2026-10-04T10:14:00', timeLabel: '04 Oct 2026 · 10:14 AM', status: 'Success', device: 'Chrome / Windows', security: 'Transaction was created by an authorized procurement user.' },
        { id: 'AUD-8639', user: 'Sarah Ali', role: 'Auditor', action: 'Export', module: 'Reports', description: 'Exported monthly financial audit report.', ip: '192.168.1.58', timestamp: '2026-10-04T09:56:00', timeLabel: '04 Oct 2026 · 09:56 AM', status: 'Success', device: 'Chrome / macOS', security: 'Report export was performed by an authorized auditor.' },
        { id: 'AUD-8638', user: 'Rashid Khan', role: 'Administrator', action: 'Delete', module: 'Students', description: 'Deleted duplicate student record.', ip: '192.168.1.19', timestamp: '2026-10-04T09:42:00', timeLabel: '04 Oct 2026 · 09:42 AM', status: 'Success', device: 'Chrome / Windows', security: 'Deletion was performed under an administrator account.' },
        { id: 'AUD-8637', user: 'Security Monitor', role: 'System', action: 'Security', module: 'System', description: 'Multiple failed login attempts detected.', ip: '185.44.21.87', timestamp: '2026-10-04T09:31:00', timeLabel: '04 Oct 2026 · 09:31 AM', status: 'Alert', device: 'Security Service', security: 'Security monitoring detected repeated authentication failures from the same external IP address.' },
        { id: 'AUD-8636', user: 'Fatima Ahmed', role: 'Finance Officer', action: 'View', module: 'Finance', description: 'Viewed supplier invoice INV-2026-0048.', ip: '192.168.1.62', timestamp: '2026-10-03T16:18:00', timeLabel: '03 Oct 2026 · 04:18 PM', status: 'Success', device: 'Chrome / Windows', security: 'Invoice access was completed by an authorized finance user.' },
        { id: 'AUD-8635', user: 'John Adams', role: 'Teacher', action: 'Logout', module: 'System', description: 'User logged out successfully.', ip: '192.168.1.75', timestamp: '2026-10-03T15:51:00', timeLabel: '03 Oct 2026 · 03:51 PM', status: 'Success', device: 'Firefox / Windows', security: 'Normal session termination.' },
        { id: 'AUD-8634', user: 'Nadia Ahmed', role: 'Communication Officer', action: 'Update', module: 'Communication', description: 'Updated notice board announcement.', ip: '192.168.1.42', timestamp: '2026-10-03T14:22:00', timeLabel: '03 Oct 2026 · 02:22 PM', status: 'Success', device: 'Chrome / Windows', security: 'Content modification was performed by an authorized communication user.' }
    ];
    const q = selector => section.querySelector(selector);
    let currentLogId = null;
    let toastTimer;
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    const toast = message => {
        const element = q('[data-al-toast]');
        element.textContent = message;
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 2300);
    };
    const actionClass = action => String(action).toLowerCase().replace(/\s+/g, '-');
    const initials = name => String(name).split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase();
    const matchesDate = (log, dateFilter) => {
        if (dateFilter === 'all') return true;
        const timestamp = new Date(log.timestamp);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dateFilter === 'today') return timestamp.toDateString() === today.toDateString();
        if (dateFilter === 'month') return timestamp.getFullYear() === today.getFullYear() && timestamp.getMonth() === today.getMonth();
        const start = new Date(today);
        start.setDate(start.getDate() - 6);
        return timestamp >= start;
    };
    const filteredLogs = () => {
        const search = q('[data-al-search]').value.trim().toLowerCase();
        const action = q('[data-al-action-filter]').value;
        const module = q('[data-al-module-filter]').value;
        const date = q('[data-al-date-filter]').value;
        return logs.filter(log => (!search || JSON.stringify(log).toLowerCase().includes(search)) && (action === 'all' || actionClass(log.action) === action) && (module === 'all' || log.module === module) && matchesDate(log, date));
    };
    const updateTable = () => {
        const filtered = filteredLogs();
        q('[data-al-rows]').innerHTML = filtered.length ? filtered.map(log => `<tr><td><strong class="al-log-id">${escape(log.id)}</strong></td><td><span class="al-user"><i>${escape(initials(log.user))}</i><span><b>${escape(log.user)}</b><small>${escape(log.role)}</small></span></span></td><td><span class="al-badge ${escape(actionClass(log.action))}">${escape(log.action)}</span></td><td class="al-module">${escape(log.module)}</td><td>${escape(log.description)}</td><td>${escape(log.ip)}</td><td class="al-time">${escape(log.timeLabel)}</td><td><span class="al-badge ${log.status === 'Success' ? 'success' : 'danger'}">${escape(log.status)}</span></td><td><div class="al-actions"><button class="al-action" type="button" title="View" aria-label="View ${escape(log.id)}" data-al-action="view" data-id="${escape(log.id)}"><i class="fas fa-eye"></i></button><button class="al-action" type="button" title="Print" aria-label="Print ${escape(log.id)}" data-al-action="print" data-id="${escape(log.id)}"><i class="fas fa-print"></i></button></div></td></tr>`).join('') : '<tr><td colspan="9"><div class="al-empty">No audit logs match these filters.</div></td></tr>';
    };
    const actionBreakdown = [
        ['Login', 'Authentication events', 78, '3,420', 'blue', 'fa-right-to-bracket'],
        ['Create', 'New records created', 42, '1,830', 'green', 'fa-plus'],
        ['Update', 'Records modified', 34, '1,482', 'orange', 'fa-pen'],
        ['View', 'Records accessed', 29, '1,214', 'purple', 'fa-eye'],
        ['Delete', 'Records removed', 6, '214', 'red', 'fa-trash']
    ];
    const renderBreakdown = () => {
        q('[data-al-action-summary]').innerHTML = actionBreakdown.map(([name, summary, percent, count, color, icon]) => `<div class="al-event-row"><i class="al-event-icon ${color} fas ${icon}"></i><div class="al-event-info"><b>${name}</b><small>${summary}</small></div><div class="al-event-bar"><span class="${color}" style="width:${percent}%"></span></div><strong class="al-event-count">${count}</strong></div>`).join('');
    };
    const renderChart = () => {
        const values = [612, 794, 541, 911, 726, 458, 365];
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        q('[data-al-chart]').innerHTML = values.map((value, index) => `<div class="al-bar-group"><div class="al-bar" style="height:${Math.max(8, value / Math.max(...values) * 88)}%"><b>${value}</b></div><span>${labels[index]}</span></div>`).join('');
    };
    const closeView = () => q('[data-al-view-overlay]').classList.remove('is-open');
    const openView = log => {
        currentLogId = log.id;
        const fields = { id: log.id, user: log.user, role: log.role, action: log.action, module: log.module, status: log.status, ip: log.ip, time: log.timeLabel, device: log.device, description: log.description, security: log.security };
        Object.entries(fields).forEach(([key, value]) => { q(`[data-al-detail="${key}"]`).textContent = value; });
        q('[data-al-view-overlay]').classList.add('is-open');
    };
    const printDocument = (title, html) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast('Allow pop-ups to print audit logs.');
        printWindow.document.write(`<!doctype html><html><head><title>${escape(title)}</title><meta charset="utf-8"><style>body{font:12px Arial,sans-serif;color:#172033;padding:30px}h1{font-size:22px;margin:0}.head{display:flex;justify-content:space-between;border-bottom:2px solid #222;padding-bottom:14px;margin-bottom:18px}table{width:100%;border-collapse:collapse;margin:15px 0}th,td{border:1px solid #aaa;padding:7px;text-align:left;font-size:9px}th{background:#eee}.detail{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0}.detail div{border:1px solid #ccc;padding:8px}.detail b{display:block;margin-bottom:3px}.signature{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:65px}.signature span{border-top:1px solid #222;padding-top:7px;font-size:10px}@media print{body{padding:0}}</style></head><body>${html}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    const printLog = log => printDocument(`Audit ${log.id}`, `<header class="head"><div><h1>Audit Log Report</h1><p>System Department · Security &amp; Activity Monitoring</p></div><div>Generated: ${new Date().toLocaleDateString()}</div></header><div class="detail">${[['Log ID', log.id], ['User', log.user], ['Role', log.role], ['Action', log.action], ['Module', log.module], ['IP Address', log.ip], ['Date & Time', log.timeLabel], ['Device', log.device], ['Status', log.status], ['Description', log.description], ['Security Information', log.security]].map(([label, value]) => `<div><b>${label}</b>${escape(value)}</div>`).join('')}</div><div class="signature"><span>Prepared By</span><span>System Administrator</span><span>Department Head</span></div>`);
    const printLogs = filtered => {
        const rows = filtered.map(log => `<tr><td>${escape(log.id)}</td><td>${escape(log.user)}<br>${escape(log.role)}</td><td>${escape(log.action)}</td><td>${escape(log.module)}</td><td>${escape(log.description)}</td><td>${escape(log.ip)}</td><td>${escape(log.timeLabel)}</td><td>${escape(log.status)}</td></tr>`).join('');
        printDocument('Audit Logs Report', `<header class="head"><div><h1>Audit Logs Report</h1><p>System Department · User &amp; System Activity Trail</p></div><div>Generated: ${new Date().toLocaleDateString()}</div></header><table><thead><tr><th>Log ID</th><th>User</th><th>Action</th><th>Module</th><th>Description</th><th>IP</th><th>Date &amp; Time</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table><div class="signature"><span>Prepared By</span><span>System Administrator</span><span>Department Head</span></div>`);
    };
    const exportCsv = () => {
        const rows = [['Log ID', 'User', 'Role', 'Action', 'Module', 'Description', 'IP Address', 'Date & Time', 'Status'], ...filteredLogs().map(log => [log.id, log.user, log.role, log.action, log.module, log.description, log.ip, log.timeLabel, log.status])];
        const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'audit-logs.csv';
        link.click();
        URL.revokeObjectURL(url);
        toast('Audit logs exported successfully.');
    };

    [q('[data-al-search]'), q('[data-al-action-filter]'), q('[data-al-module-filter]'), q('[data-al-date-filter]')].forEach(control => control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', updateTable));
    q('[data-al-clear]').addEventListener('click', () => {
        q('[data-al-search]').value = '';
        q('[data-al-action-filter]').value = 'all';
        q('[data-al-module-filter]').value = 'all';
        q('[data-al-date-filter]').value = 'all';
        updateTable();
        toast('Audit log filters cleared.');
    });
    q('[data-al-refresh]').addEventListener('click', () => { updateTable(); toast('Audit logs refreshed successfully.'); });
    q('[data-al-redraw]').addEventListener('click', () => { renderChart(); toast('Activity chart refreshed.'); });
    q('[data-al-export]').addEventListener('click', exportCsv);
    q('[data-al-print]').addEventListener('click', () => {
        const filtered = filteredLogs();
        if (!filtered.length) return toast('No audit logs available to print.');
        printLogs(filtered);
    });
    q('[data-al-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-al-action]');
        if (!button) return;
        const log = logs.find(item => item.id === button.dataset.id);
        if (!log) return;
        if (button.dataset.alAction === 'view') openView(log);
        if (button.dataset.alAction === 'print') printLog(log);
    });
    q('[data-al-close]').addEventListener('click', closeView);
    q('[data-al-print-current]').addEventListener('click', () => {
        const log = logs.find(item => item.id === currentLogId);
        if (log) printLog(log);
    });
    q('[data-al-view-overlay]').addEventListener('click', event => { if (event.target === event.currentTarget) closeView(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeView(); });
    renderChart();
    renderBreakdown();
    updateTable();
    return section;
}