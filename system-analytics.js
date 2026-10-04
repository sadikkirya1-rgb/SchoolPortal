function createSystemAnalyticsModule() {
    const section = document.createElement('section');
    section.className = 'module system-analytics-module hidden';
    section.id = 'systemAnalyticsModule';
    section.innerHTML = `
        <header class="sa-header"><div><h2>System Analytics</h2><p>System Department · Performance, usage, security and operational analytics</p></div><div class="sa-header-actions"><button class="sa-button sa-light" type="button" data-sa-refresh><i class="fas fa-rotate"></i> Refresh</button><button class="sa-button sa-light" type="button" data-sa-settings><i class="fas fa-gear"></i> Report Settings</button><button class="sa-button sa-primary" type="button" data-sa-print><i class="fas fa-print"></i> Print / PDF</button></div></header>
        <div class="sa-filters"><label for="sa-period">Analytics Period</label><select id="sa-period" data-sa-period><option value="today">Today</option><option value="week">This Week</option><option value="month" selected>This Month</option><option value="quarter">This Quarter</option><option value="year">This Year</option></select><label for="sa-department">Department</label><select id="sa-department" data-sa-department><option>All Departments</option><option>Administration</option><option>Academic</option><option>Finance</option><option>Communication</option><option>HR</option><option>Student Affairs</option><option>Transport</option><option>System</option></select><label class="sa-sr-only" for="sa-search">Search reports</label><input id="sa-search" data-sa-search placeholder="Search modules or reports..."><button class="sa-button sa-light" type="button" data-sa-reset>Reset</button></div>
        <section class="sa-kpis" aria-label="System key metrics"><article class="sa-kpi"><div><span>Total System Users</span><strong data-sa-kpi="users">1,284</strong><small class="sa-trend up">▲ 8.4%</small></div><i class="fas fa-users"></i></article><article class="sa-kpi"><div><span>Active Users</span><strong data-sa-kpi="active">1,146</strong><small class="sa-trend up">▲ 5.7%</small></div><i class="fas fa-user-check"></i></article><article class="sa-kpi"><div><span>System Uptime</span><strong>99.94%</strong><small class="sa-trend up">▲ 0.12%</small></div><i class="fas fa-bolt"></i></article><article class="sa-kpi"><div><span>API Requests</span><strong data-sa-kpi="api">84.6K</strong><small class="sa-trend up">▲ 12.8%</small></div><i class="fas fa-right-left"></i></article><article class="sa-kpi"><div><span>Security Alerts</span><strong data-sa-kpi="alerts">18</strong><small class="sa-trend down">▼ 22.1%</small></div><i class="fas fa-shield-halved"></i></article><article class="sa-kpi"><div><span>Storage Used</span><strong>68.4%</strong><small class="sa-trend up">▲ 3.2%</small></div><i class="fas fa-database"></i></article></section>
        <section class="sa-main-grid"><article class="sa-panel"><header class="sa-panel-head"><div><h3>System Activity</h3><p>Daily application activity and user sessions</p></div><select data-sa-chart-mode aria-label="Activity chart metric"><option value="sessions">User Sessions</option><option value="requests">API Requests</option><option value="logins">Logins</option></select></header><div class="sa-chart-area"><canvas data-sa-chart aria-label="Daily system activity chart"></canvas></div></article>
            <article class="sa-panel"><header class="sa-panel-head"><div><h3>User Distribution</h3><p>Users by account type</p></div></header><div class="sa-donut-layout"><div class="sa-donut"><div><strong>1,284</strong><span>Total Users</span></div></div><div class="sa-legend"><div><i class="sa-dot" style="--dot:#4f46e5"></i>Administrators<strong>34%</strong></div><div><i class="sa-dot" style="--dot:#7c3aed"></i>Teachers<strong>21%</strong></div><div><i class="sa-dot" style="--dot:#06b6d4"></i>Students<strong>18%</strong></div><div><i class="sa-dot" style="--dot:#16a34a"></i>Parents<strong>13%</strong></div><div><i class="sa-dot" style="--dot:#f59e0b"></i>Staff<strong>8%</strong></div><div><i class="sa-dot" style="--dot:#ef4444"></i>Other<strong>6%</strong></div></div></div></article>
        </section>
        <section class="sa-secondary-grid"><article class="sa-panel"><header class="sa-panel-head"><div><h3>Module Usage</h3><p>Most active system modules</p></div></header><div class="sa-panel-body" data-sa-usage></div></article><article class="sa-panel"><header class="sa-panel-head"><div><h3>System Activity</h3><p>Latest system events</p></div><button class="sa-text-button" type="button" data-sa-activity-all>View All</button></header><div class="sa-panel-body"><div class="sa-activity" data-sa-activity-list></div></div></article><article class="sa-panel"><header class="sa-panel-head"><div><h3>Top Active Users</h3><p>Highest system activity</p></div></header><div class="sa-panel-body" data-sa-top-users></div></article></section>
        <section class="sa-report-panel"><header class="sa-panel-head"><div><h3>Department Analytics Report</h3><p>Detailed performance indicators across system modules</p></div><button class="sa-button sa-light" type="button" data-sa-export><i class="fas fa-download"></i> Export CSV</button></header><div class="sa-table-wrap"><table class="sa-table"><thead><tr><th>Module</th><th>Users</th><th>Transactions</th><th>Usage</th><th>Response Time</th><th>Availability</th><th>Errors</th><th>Performance</th><th>Action</th></tr></thead><tbody data-sa-report-rows></tbody></table></div></section>
        <div class="sa-overlay" data-sa-settings-overlay><section class="sa-modal" role="dialog" aria-modal="true" aria-labelledby="sa-settings-title"><header class="sa-modal-head"><h3 id="sa-settings-title">Analytics Report Settings</h3><button class="sa-close" type="button" data-sa-close-settings aria-label="Close">&times;</button></header><form class="sa-form" data-sa-settings-form><div class="sa-form-grid"><label>Report Name<input name="reportName" value="System Department Analytics Report"></label><label>Reporting Period<select name="reportPeriod"><option>Today</option><option>This Week</option><option selected>This Month</option><option>This Quarter</option><option>This Year</option></select></label><label>Include User Analytics<select name="includeUsers"><option>Yes</option><option>No</option></select></label><label>Include Security Analytics<select name="includeSecurity"><option>Yes</option><option>No</option></select></label><label>Include Performance Data<select name="includePerformance"><option>Yes</option><option>No</option></select></label><label>Include Module Data<select name="includeModules"><option>Yes</option><option>No</option></select></label><label class="sa-full">Report Notes<input name="reportNotes" placeholder="Optional internal notes"></label></div><footer class="sa-modal-actions"><button class="sa-button sa-light" type="button" data-sa-cancel-settings>Cancel</button><button class="sa-button sa-primary" type="submit">Save Settings</button></footer></form></section></div>
        <div class="sa-overlay" data-sa-module-overlay><section class="sa-modal" role="dialog" aria-modal="true" aria-labelledby="sa-module-title"><header class="sa-modal-head"><h3 data-sa-module-title id="sa-module-title">Module Analytics</h3><button class="sa-close" type="button" data-sa-close-module aria-label="Close">&times;</button></header><div class="sa-form"><div class="sa-module-grid"><div><span>Total Users</span><strong data-sa-module="users"></strong></div><div><span>Total Transactions</span><strong data-sa-module="transactions"></strong></div><div><span>Usage Rate</span><strong data-sa-module="usage"></strong></div><div><span>Response Time</span><strong data-sa-module="response"></strong></div><div><span>Availability</span><strong data-sa-module="availability"></strong></div><div><span>Error Count</span><strong data-sa-module="errors"></strong></div></div></div><footer class="sa-modal-actions"><button class="sa-button sa-light" type="button" data-sa-close-module>Close</button><button class="sa-button sa-primary" type="button" data-sa-print-module><i class="fas fa-print"></i> Print</button></footer></section></div>
        <div class="sa-toast" role="status" aria-live="polite" data-sa-toast></div>`;

    const modules = [
        { name: 'Student Management', department: 'Academic', sub: 'Admissions · Profiles · Attendance', users: '684', transactions: '12,480', usage: 91, response: '182 ms', availability: '99.98%', errors: 14, performance: 'Excellent' },
        { name: 'Finance & Accounts', department: 'Finance', sub: 'Fees · Invoices · Payments', users: '423', transactions: '8,725', usage: 84, response: '214 ms', availability: '99.95%', errors: 21, performance: 'Excellent' },
        { name: 'Communication', department: 'Communication', sub: 'SMS · Email · Notices', users: '910', transactions: '18,642', usage: 78, response: '165 ms', availability: '99.97%', errors: 9, performance: 'Excellent' },
        { name: 'HR & Payroll', department: 'HR', sub: 'Employees · Payroll · Leave', users: '216', transactions: '4,284', usage: 67, response: '246 ms', availability: '99.91%', errors: 36, performance: 'Good' },
        { name: 'Procurement', department: 'Administration', sub: 'Suppliers · Orders · GRN', users: '142', transactions: '2,917', usage: 59, response: '288 ms', availability: '99.84%', errors: 57, performance: 'Average' },
        { name: 'Transport', department: 'Transport', sub: 'Routes · Vehicles · Drivers', users: '185', transactions: '3,481', usage: 62, response: '231 ms', availability: '99.89%', errors: 28, performance: 'Good' }
    ];
    const activities = [
        ['Database backup completed', 'System · 8 minutes ago', 'fa-database'],
        ['New administrator account created', 'Security · 21 minutes ago', 'fa-user-plus'],
        ['API synchronization completed', 'Integration · 38 minutes ago', 'fa-right-left'],
        ['Multiple failed login attempts detected', 'Security · 52 minutes ago', 'fa-shield-halved'],
        ['System health check completed', 'Monitoring · 1 hour ago', 'fa-heart-pulse']
    ];
    const topUsers = [
        ['System Admin', 'Administrator', '98%', 'SA'],
        ['Academic Coordinator', 'Academic', '94%', 'AC'],
        ['Finance Officer', 'Finance', '91%', 'FO'],
        ['Communication Officer', 'Communication', '87%', 'CO'],
        ['HR Manager', 'Human Resources', '83%', 'HR']
    ];
    const periodMetrics = {
        today: { users: '1,184', active: '1,036', api: '8.4K', alerts: '7' },
        week: { users: '1,238', active: '1,087', api: '31.8K', alerts: '11' },
        month: { users: '1,284', active: '1,146', api: '84.6K', alerts: '18' },
        quarter: { users: '1,284', active: '1,162', api: '246K', alerts: '46' },
        year: { users: '1,284', active: '1,176', api: '982K', alerts: '164' }
    };
    const chartValues = {
        sessions: [420, 510, 465, 590, 640, 720, 680, 745, 810, 780, 860, 920, 875, 960],
        requests: [2100, 2450, 2380, 2910, 3100, 3450, 3320, 3700, 4020, 3890, 4210, 4550, 4390, 4820],
        logins: [180, 220, 205, 270, 310, 355, 330, 380, 410, 395, 445, 470, 452, 510]
    };
    let settings = { reportName: 'System Department Analytics Report', reportPeriod: 'This Month', includeUsers: 'Yes', includeSecurity: 'Yes', includePerformance: 'Yes', includeModules: 'Yes', reportNotes: '' };
    try { settings = { ...settings, ...JSON.parse(localStorage.getItem('systemAnalyticsReportSettings') || '{}') }; } catch (error) { /* Keep defaults when stored settings are invalid. */ }
    let currentModule = null;
    let toastTimer;
    const q = selector => section.querySelector(selector);
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    const toast = message => {
        const element = q('[data-sa-toast]');
        element.textContent = message;
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 2300);
    };
    const drawChart = () => {
        const canvas = q('[data-sa-chart]');
        const bounds = canvas.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const ratio = window.devicePixelRatio || 1;
        canvas.width = bounds.width * ratio;
        canvas.height = bounds.height * ratio;
        const context = canvas.getContext('2d');
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        const width = bounds.width;
        const height = bounds.height;
        const values = chartValues[q('[data-sa-chart-mode]').value];
        const pad = { left: 48, right: 18, top: 18, bottom: 36 };
        const graphWidth = width - pad.left - pad.right;
        const graphHeight = height - pad.top - pad.bottom;
        const max = Math.max(...values) * 1.15;
        context.clearRect(0, 0, width, height);
        context.font = '10px Arial';
        context.textBaseline = 'middle';
        for (let index = 0; index <= 4; index += 1) {
            const y = pad.top + graphHeight - graphHeight / 4 * index;
            context.beginPath();
            context.strokeStyle = '#edf0f5';
            context.moveTo(pad.left, y);
            context.lineTo(width - pad.right, y);
            context.stroke();
            context.fillStyle = '#94a3b8';
            context.fillText(Math.round(max / 4 * index).toLocaleString(), 4, y);
        }
        const points = values.map((value, index) => ({ x: pad.left + graphWidth / (values.length - 1) * index, y: pad.top + graphHeight - value / max * graphHeight }));
        const gradient = context.createLinearGradient(0, pad.top, 0, height);
        gradient.addColorStop(0, 'rgba(79,70,229,.24)');
        gradient.addColorStop(1, 'rgba(79,70,229,0)');
        context.beginPath();
        points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
        context.lineTo(points.at(-1).x, pad.top + graphHeight);
        context.lineTo(points[0].x, pad.top + graphHeight);
        context.closePath();
        context.fillStyle = gradient;
        context.fill();
        context.beginPath();
        points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
        context.strokeStyle = '#4f46e5';
        context.lineWidth = 3;
        context.lineJoin = 'round';
        context.lineCap = 'round';
        context.stroke();
        points.forEach((point, index) => {
            context.beginPath();
            context.arc(point.x, point.y, 3.5, 0, Math.PI * 2);
            context.fillStyle = '#fff';
            context.fill();
            context.strokeStyle = '#4f46e5';
            context.lineWidth = 2;
            context.stroke();
            if (index % 2 === 0) {
                context.fillStyle = '#94a3b8';
                context.textAlign = 'center';
                context.textBaseline = 'alphabetic';
                context.fillText(String(index + 1), point.x, height - 12);
            }
        });
        context.textAlign = 'start';
    };
    const filterReports = () => {
        const search = q('[data-sa-search]').value.trim().toLowerCase();
        const department = q('[data-sa-department]').value;
        q('[data-sa-report-rows]').querySelectorAll('tr').forEach(row => {
            const matchesText = !search || row.textContent.toLowerCase().includes(search);
            const matchesDepartment = department === 'All Departments' || row.dataset.department === department;
            row.hidden = !(matchesText && matchesDepartment);
        });
    };
    const updateDashboard = () => {
        const values = periodMetrics[q('[data-sa-period]').value];
        q('[data-sa-kpi="users"]').textContent = values.users;
        q('[data-sa-kpi="active"]').textContent = values.active;
        q('[data-sa-kpi="api"]').textContent = values.api;
        q('[data-sa-kpi="alerts"]').textContent = values.alerts;
    };
    const render = () => {
        q('[data-sa-usage]').innerHTML = modules.slice(0, 5).map((module, index) => `<div class="sa-progress-item"><div class="sa-progress-top"><b>${escape(module.name)}</b><span>${module.usage}%</span></div><div class="sa-progress"><span style="width:${module.usage}%;--progress-color:${['#4f46e5', '#0891b2', '#16a34a', '#d97706', '#db2777'][index]}"></span></div></div>`).join('');
        q('[data-sa-activity-list]').innerHTML = activities.map(([title, when, icon]) => `<div class="sa-activity-item"><span class="sa-activity-icon"><i class="fas ${icon}"></i></span><div><b>${escape(title)}</b><small>${escape(when)}</small></div></div>`).join('');
        q('[data-sa-top-users]').innerHTML = topUsers.map(([name, role, score, initials], index) => `<div class="sa-rank"><span class="sa-rank-number">${index + 1}</span><span class="sa-user-avatar">${initials}</span><div class="sa-rank-info"><b>${escape(name)}</b><small>${escape(role)}</small></div><strong>${score}</strong></div>`).join('');
        q('[data-sa-report-rows]').innerHTML = modules.map(module => `<tr data-department="${escape(module.department)}"><td><b>${escape(module.name)}</b><small>${escape(module.sub)}</small></td><td>${module.users}</td><td>${module.transactions}</td><td>${module.usage}%</td><td>${module.response}</td><td>${module.availability}</td><td>${module.errors}</td><td><span class="sa-badge ${module.performance.toLowerCase()}">${escape(module.performance)}</span></td><td><button class="sa-button sa-light sa-view-module" type="button" data-sa-module="${escape(module.name)}">View</button></td></tr>`).join('');
        updateDashboard();
        filterReports();
    };
    const closeSettings = () => q('[data-sa-settings-overlay]').classList.remove('is-open');
    const closeModule = () => q('[data-sa-module-overlay]').classList.remove('is-open');
    const printDocument = (title, html) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast('Allow pop-ups to print analytics reports.');
        printWindow.document.write(`<!doctype html><html><head><title>${escape(title)}</title><meta charset="utf-8"><style>body{font:12px Arial,sans-serif;color:#172033;padding:30px}h1{font-size:22px;margin:0}.head{display:flex;justify-content:space-between;border-bottom:2px solid #222;padding-bottom:14px;margin-bottom:18px}table{width:100%;border-collapse:collapse;margin:15px 0}th,td{border:1px solid #aaa;padding:7px;text-align:left;font-size:10px}th{background:#eee}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:15px 0}.kpi{border:1px solid #aaa;padding:9px}.kpi small,.kpi strong{display:block}.kpi small{font-size:9px;color:#555}.kpi strong{font-size:16px;margin-top:4px}.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:65px}.sign span{border-top:1px solid #333;padding-top:8px}@media print{body{padding:0}}</style></head><body>${html}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    const moduleFromRow = row => modules.find(module => module.name === row.dataset.module);
    const openModule = module => {
        currentModule = module;
        q('[data-sa-module-title]').textContent = `${module.name} Analytics`;
        Object.entries({ users: module.users, transactions: module.transactions, usage: `${module.usage}%`, response: module.response, availability: module.availability, errors: module.errors }).forEach(([key, value]) => { q(`[data-sa-module="${key}"]`).textContent = value; });
        q('[data-sa-module-overlay]').classList.add('is-open');
    };
    const buildPrintReport = () => {
        const rows = [...q('[data-sa-report-rows]').querySelectorAll('tr')].filter(row => !row.hidden).map(row => {
            const cells = [...row.cells].slice(0, 8).map(cell => escape(cell.innerText.replace(/\n/g, ' ').trim()));
            return `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
        }).join('');
        const title = q('[data-sa-settings-form]').elements.reportName.value || settings.reportName;
        const html = `<header class="head"><div><h1>${escape(title)}</h1><p>System Department · Analytics Report</p></div><div>Generated: ${new Date().toLocaleDateString()}</div></header><div class="kpis"><div class="kpi"><small>Total Users</small><strong>${escape(q('[data-sa-kpi="users"]').textContent)}</strong></div><div class="kpi"><small>Active Users</small><strong>${escape(q('[data-sa-kpi="active"]').textContent)}</strong></div><div class="kpi"><small>System Uptime</small><strong>99.94%</strong></div><div class="kpi"><small>API Requests</small><strong>${escape(q('[data-sa-kpi="api"]').textContent)}</strong></div></div><p>Reporting Period: <strong>${escape(q('[data-sa-period]').selectedOptions[0].textContent)}</strong></p><table><thead><tr><th>Module</th><th>Users</th><th>Transactions</th><th>Usage</th><th>Response</th><th>Availability</th><th>Errors</th><th>Performance</th></tr></thead><tbody>${rows}</tbody></table><p>${escape(q('[data-sa-settings-form]').elements.reportNotes.value || '')}</p><div class="sign"><span>Prepared By</span><span>System Administrator</span><span>Department Head</span></div>`;
        printDocument(title, html);
    };

    q('[data-sa-period]').addEventListener('change', updateDashboard);
    q('[data-sa-department]').addEventListener('change', filterReports);
    q('[data-sa-search]').addEventListener('input', filterReports);
    q('[data-sa-chart-mode]').addEventListener('change', drawChart);
    q('[data-sa-reset]').addEventListener('click', () => {
        q('[data-sa-period]').value = 'month';
        q('[data-sa-department]').value = 'All Departments';
        q('[data-sa-search]').value = '';
        q('[data-sa-chart-mode]').value = 'sessions';
        updateDashboard();
        filterReports();
        drawChart();
        toast('Analytics filters reset.');
    });
    q('[data-sa-refresh]').addEventListener('click', () => { updateDashboard(); filterReports(); drawChart(); toast('Analytics data refreshed.'); });
    q('[data-sa-settings]').addEventListener('click', () => {
        const form = q('[data-sa-settings-form]');
        Object.keys(settings).forEach(key => { if (form.elements[key]) form.elements[key].value = settings[key]; });
        q('[data-sa-settings-overlay]').classList.add('is-open');
    });
    q('[data-sa-settings-form]').addEventListener('submit', event => {
        event.preventDefault();
        settings = Object.fromEntries(new FormData(event.currentTarget).entries());
        localStorage.setItem('systemAnalyticsReportSettings', JSON.stringify(settings));
        q('[data-sa-period]').value = ({ 'Today': 'today', 'This Week': 'week', 'This Month': 'month', 'This Quarter': 'quarter', 'This Year': 'year' })[settings.reportPeriod] || 'month';
        updateDashboard();
        closeSettings();
        toast('Analytics report settings saved.');
    });
    q('[data-sa-export]').addEventListener('click', () => {
        const rows = [['Module', 'Users', 'Transactions', 'Usage', 'Response Time', 'Availability', 'Errors', 'Performance'], ...[...q('[data-sa-report-rows]').querySelectorAll('tr')].filter(row => !row.hidden).map(row => [...row.cells].slice(0, 8).map(cell => cell.innerText.replace(/\n/g, ' ').trim()))];
        const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'system-analytics-report.csv';
        link.click();
        URL.revokeObjectURL(url);
        toast('Analytics CSV exported.');
    });
    q('[data-sa-print]').addEventListener('click', buildPrintReport);
    q('[data-sa-report-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-sa-module]');
        if (!button) return;
        const module = modules.find(item => item.name === button.dataset.saModule);
        if (module) openModule(module);
    });
    q('[data-sa-close-settings]').addEventListener('click', closeSettings);
    q('[data-sa-cancel-settings]').addEventListener('click', closeSettings);
    section.querySelectorAll('[data-sa-close-module]').forEach(button => button.addEventListener('click', closeModule));
    q('[data-sa-print-module]').addEventListener('click', () => {
        if (!currentModule) return;
        const module = currentModule;
        const html = `<header class="head"><div><h1>${escape(module.name)}</h1><p>System Department · Module Analytics</p></div><div>Generated: ${new Date().toLocaleDateString()}</div></header><table><tbody>${[['Total Users', module.users], ['Transactions', module.transactions], ['Usage', `${module.usage}%`], ['Response Time', module.response], ['Availability', module.availability], ['Errors', module.errors]].map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value)}</td></tr>`).join('')}</tbody></table><div class="sign"><span>Prepared By</span><span>System Administrator</span><span>Department Head</span></div>`;
        printDocument(`${module.name} Analytics`, html);
    });
    q('[data-sa-activity-all]').addEventListener('click', () => toast('Showing the latest system activity.'));
    section.querySelectorAll('.sa-overlay').forEach(overlay => overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('is-open'); }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeSettings();
            closeModule();
        }
    });
    render();
    section.refreshAnalyticsChart = () => requestAnimationFrame(drawChart);
    window.addEventListener('resize', drawChart);
    requestAnimationFrame(drawChart);
    return section;
}