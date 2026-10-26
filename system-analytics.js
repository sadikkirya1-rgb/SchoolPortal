function createSystemAnalyticsModule() {
    const section = document.createElement('section');
    section.className = 'module system-analytics-module hidden';
    section.id = 'systemAnalyticsModule';
    section.innerHTML = `
        <header class="sa-header"><div><h2>System Analytics</h2><p>School account and cloud record totals</p></div><div class="sa-header-actions"><button class="sa-button sa-light" type="button" data-sa-refresh><i class="fas fa-rotate"></i> Refresh</button><button class="sa-button sa-light" type="button" data-sa-settings><i class="fas fa-gear"></i> Report Settings</button><button class="sa-button sa-primary" type="button" data-sa-print><i class="fas fa-print"></i> Print / PDF</button></div></header>
        <div class="sa-filters"><label for="sa-department">Department</label><select id="sa-department" data-sa-department><option>All Departments</option><option>Admissions</option><option>Academic</option><option>Finance</option><option>Communication</option><option>HR</option><option>Student Affairs</option><option>Operations</option><option>Procurement</option><option>Front Office</option><option>System</option></select><label class="sa-sr-only" for="sa-search">Search reports</label><input id="sa-search" data-sa-search placeholder="Search modules or reports..."><button class="sa-button sa-light" type="button" data-sa-reset>Reset</button><p class="sa-status" data-sa-status role="status" aria-live="polite">Loading school cloud data…</p></div>
        <section class="sa-kpis" aria-label="School cloud metrics"><article class="sa-kpi"><div><span>Total School Accounts</span><strong data-sa-kpi="users">—</strong></div><i class="fas fa-users"></i></article><article class="sa-kpi"><div><span>Active Accounts</span><strong data-sa-kpi="active">—</strong></div><i class="fas fa-user-check"></i></article><article class="sa-kpi"><div><span>Student Records</span><strong data-sa-kpi="students">—</strong></div><i class="fas fa-user-graduate"></i></article><article class="sa-kpi"><div><span>Staff Records</span><strong data-sa-kpi="staff">—</strong></div><i class="fas fa-id-card"></i></article><article class="sa-kpi"><div><span>Total Cloud Records</span><strong data-sa-kpi="records">—</strong></div><i class="fas fa-database"></i></article><article class="sa-kpi"><div><span>Modules With Records</span><strong data-sa-kpi="modules">—</strong></div><i class="fas fa-chart-column"></i></article></section>
        <section class="sa-main-grid"><article class="sa-panel"><header class="sa-panel-head"><div><h3>Cloud Records by Module</h3><p>Current Firestore record totals for this school</p></div></header><div class="sa-chart-area"><canvas data-sa-chart aria-label="Cloud records by module chart"></canvas></div></article>
            <article class="sa-panel"><header class="sa-panel-head"><div><h3>User Distribution</h3><p>Users by account type</p></div></header><div class="sa-donut-layout"><div class="sa-donut"><div><strong>—</strong><span>Total Users</span></div></div><div class="sa-legend"><div><i class="sa-dot" style="--dot:#4f46e5"></i>Administrators<strong>—</strong></div><div><i class="sa-dot" style="--dot:#7c3aed"></i>Teachers<strong>—</strong></div><div><i class="sa-dot" style="--dot:#06b6d4"></i>Students<strong>—</strong></div><div><i class="sa-dot" style="--dot:#16a34a"></i>Parents<strong>—</strong></div><div><i class="sa-dot" style="--dot:#f59e0b"></i>Staff<strong>—</strong></div><div><i class="sa-dot" style="--dot:#ef4444"></i>Other<strong>—</strong></div></div></div></article>
        </section>
        <section class="sa-secondary-grid"><article class="sa-panel"><header class="sa-panel-head"><div><h3>Module Records</h3><p>Stored records by module</p></div></header><div class="sa-panel-body" data-sa-usage></div></article><article class="sa-panel"><header class="sa-panel-head"><div><h3>Activity Tracking</h3></div></header><div class="sa-panel-body"><p class="sa-empty-state">User activity history is unavailable because cloud audit events are not currently recorded.</p></div></article><article class="sa-panel"><header class="sa-panel-head"><div><h3>Operational Metrics</h3></div></header><div class="sa-panel-body"><p class="sa-empty-state">Uptime, API request, and storage metrics are not currently collected.</p></div></article></section>
        <section class="sa-report-panel"><header class="sa-panel-head"><div><h3>School Cloud Data Report</h3><p>Live Firestore record counts by module</p></div><button class="sa-button sa-light" type="button" data-sa-export><i class="fas fa-download"></i> Export CSV</button></header><div class="sa-table-wrap"><table class="sa-table"><thead><tr><th>Module</th><th>Department</th><th>Cloud Records</th><th>Collections</th><th>Action</th></tr></thead><tbody data-sa-report-rows></tbody></table></div></section>
        <div class="sa-overlay" data-sa-settings-overlay><section class="sa-modal" role="dialog" aria-modal="true" aria-labelledby="sa-settings-title"><header class="sa-modal-head"><h3 id="sa-settings-title">Analytics Report Settings</h3><button class="sa-close" type="button" data-sa-close-settings aria-label="Close">&times;</button></header><form class="sa-form" data-sa-settings-form><div class="sa-form-grid"><label>Report Name<input name="reportName" value="School Cloud Data Report"></label><label class="sa-full">Report Notes<input name="reportNotes" placeholder="Optional internal notes"></label></div><footer class="sa-modal-actions"><button class="sa-button sa-light" type="button" data-sa-cancel-settings>Cancel</button><button class="sa-button sa-primary" type="submit">Save Settings</button></footer></form></section></div>
        <div class="sa-overlay" data-sa-module-overlay><section class="sa-modal" role="dialog" aria-modal="true" aria-labelledby="sa-module-title"><header class="sa-modal-head"><h3 data-sa-module-title id="sa-module-title">Module Analytics</h3><button class="sa-close" type="button" data-sa-close-module aria-label="Close">&times;</button></header><div class="sa-form"><div class="sa-module-grid"><div><span>Cloud Records</span><strong data-sa-module="records"></strong></div><div><span>Collections Included</span><strong data-sa-module="collections"></strong></div></div></div><footer class="sa-modal-actions"><button class="sa-button sa-light" type="button" data-sa-close-module>Close</button><button class="sa-button sa-primary" type="button" data-sa-print-module><i class="fas fa-print"></i> Print</button></footer></section></div>
        <div class="sa-toast" role="status" aria-live="polite" data-sa-toast></div>`;

    let analytics = null;
    let modules = [];
    let analyticsError = '';
    let analyticsLoading = false;
    let settings = { reportName: 'School Cloud Data Report', reportNotes: '' };
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
    const visibleModules = () => {
        const search = q('[data-sa-search]').value.trim().toLowerCase();
        const department = q('[data-sa-department]').value;
        return modules.filter(module =>
            (department === 'All Departments' || module.department === department)
            && (!search || `${module.name} ${module.department}`.toLowerCase().includes(search))
        );
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
        const items = visibleModules();
        const pad = { left: 48, right: 18, top: 18, bottom: 48 };
        const graphWidth = width - pad.left - pad.right;
        const graphHeight = height - pad.top - pad.bottom;
        context.clearRect(0, 0, width, height);
        if (!items.length) {
            context.fillStyle = '#64748b';
            context.textAlign = 'center';
            context.fillText(analytics ? 'No matching cloud records' : 'Cloud analytics not loaded', width / 2, height / 2);
            return;
        }
        const max = Math.max(1, ...items.map(module => module.records));
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
            context.textAlign = 'right';
            context.fillText(Math.round(max / 4 * index).toLocaleString(), pad.left - 8, y);
        }
        const slotWidth = graphWidth / items.length;
        const barWidth = Math.min(34, slotWidth * 0.58);
        items.forEach((module, index) => {
            const barHeight = module.records / max * graphHeight;
            const x = pad.left + slotWidth * index + (slotWidth - barWidth) / 2;
            context.fillStyle = ['#4f46e5', '#0891b2', '#16a34a', '#d97706', '#db2777'][index % 5];
            context.fillRect(x, pad.top + graphHeight - barHeight, barWidth, barHeight);
            context.fillStyle = '#64748b';
            context.textAlign = 'center';
            context.textBaseline = 'alphabetic';
            context.fillText(module.name.length > 10 ? `${module.name.slice(0, 9)}…` : module.name, x + barWidth / 2, height - 13);
        });
    };
    const filterReports = () => {
        const matchingModules = new Set(visibleModules().map(module => module.name));
        q('[data-sa-report-rows]').querySelectorAll('tr[data-department]').forEach(row => {
            row.hidden = !matchingModules.has(row.dataset.module);
        });
        renderUsage();
        drawChart();
    };
    const renderUsage = () => {
        const visible = visibleModules();
        const max = Math.max(1, ...visible.map(module => module.records));
        q('[data-sa-usage]').innerHTML = visible.length
            ? visible.map((module, index) => `<div class="sa-progress-item"><div class="sa-progress-top"><b>${escape(module.name)}</b><span>${module.records.toLocaleString()} records</span></div><div class="sa-progress"><span style="width:${module.records / max * 100}%;--progress-color:${['#4f46e5', '#0891b2', '#16a34a', '#d97706', '#db2777'][index % 5]}"></span></div></div>`).join('')
            : '<p class="sa-empty-state">No matching cloud records.</p>';
    };
    const render = () => {
        const emptyState = analytics ? 'No cloud records found.' : 'Cloud analytics have not been loaded.';
        q('[data-sa-kpi="users"]').textContent = analytics ? analytics.totalUsers.toLocaleString() : '—';
        q('[data-sa-kpi="active"]').textContent = analytics ? analytics.activeUsers.toLocaleString() : '—';
        q('[data-sa-kpi="students"]').textContent = analytics ? (analytics.collectionCounts.students || 0).toLocaleString() : '—';
        q('[data-sa-kpi="staff"]').textContent = analytics ? (analytics.collectionCounts.staff || 0).toLocaleString() : '—';
        q('[data-sa-kpi="records"]').textContent = analytics ? analytics.totalRecords.toLocaleString() : '—';
        q('[data-sa-kpi="modules"]').textContent = analytics ? analytics.modulesWithRecords.toLocaleString() : '—';
        q('[data-sa-status]').textContent = analyticsLoading
            ? 'Loading school cloud data…'
            : analyticsError
                ? `${analytics ? 'Refresh failed; showing the last successful data. ' : ''}${analyticsError}`
                : analytics
                    ? `Live school data · Updated ${new Date(analytics.fetchedAt).toLocaleTimeString()}`
                    : emptyState;
        q('[data-sa-report-rows]').innerHTML = modules.length ? modules.map(module => `<tr data-department="${escape(module.department)}" data-module="${escape(module.name)}"><td><b>${escape(module.name)}</b></td><td>${escape(module.department)}</td><td>${module.records.toLocaleString()}</td><td>${module.collectionCount}</td><td><button class="sa-button sa-light" type="button" data-sa-module="${escape(module.name)}">Details</button></td></tr>`).join('') : `<tr><td colspan="5">${escape(emptyState)}</td></tr>`;
        const roles = Object.entries(analytics?.membersByRole || {}).sort((left, right) => right[1] - left[1]);
        q('.sa-donut-layout').innerHTML = analytics
            ? `<div class="sa-donut"><div><strong>${analytics.totalUsers.toLocaleString()}</strong><span>Total Accounts</span></div></div><div class="sa-legend">${roles.length ? roles.map(([role, count], index) => `<div><i class="sa-dot" style="--dot:${['#4f46e5', '#7c3aed', '#06b6d4', '#16a34a', '#f59e0b', '#ef4444'][index % 6]}"></i>${escape(role)}<strong>${count.toLocaleString()}</strong></div>`).join('') : '<p class="sa-empty-state">No school accounts.</p>'}</div>`
            : `<p class="sa-empty-state">${escape(emptyState)}</p>`;
        renderUsage();
        filterReports();
    };
    const loadAnalytics = async () => {
        if (analyticsLoading) return;
        analyticsLoading = true;
        analyticsError = '';
        render();
        try {
            const identity = window.schoolPortalData?.getIdentity();
            if (!identity?.schoolId) throw new Error('Sign in to a school to view its cloud analytics.');
            const fetchAnalytics = window.schoolPortalFirebase?.getSchoolAnalytics;
            if (typeof fetchAnalytics !== 'function') throw new Error('Firebase analytics service is unavailable. Reload the page and try again.');
            analytics = await fetchAnalytics(identity.schoolId);
            analytics.fetchedAt = Date.now();
            modules = analytics.modules;
        } catch (error) {
            console.error('Unable to load school cloud analytics.', error);
            analyticsError = error.message || 'Unable to load school cloud analytics.';
        } finally {
            analyticsLoading = false;
            render();
            requestAnimationFrame(drawChart);
        }
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
    const openModule = module => {
        currentModule = module;
        q('[data-sa-module-title]').textContent = `${module.name} Analytics`;
        q('[data-sa-module="records"]').textContent = module.records.toLocaleString();
        q('[data-sa-module="collections"]').textContent = module.collectionCount.toLocaleString();
        q('[data-sa-module-overlay]').classList.add('is-open');
    };
    const buildPrintReport = () => {
        const rows = [...q('[data-sa-report-rows]').querySelectorAll('tr')].filter(row => !row.hidden).map(row => {
            const cells = [...row.cells].slice(0, 4).map(cell => escape(cell.innerText.replace(/\n/g, ' ').trim()));
            return `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
        }).join('');
        const title = q('[data-sa-settings-form]').elements.reportName.value || settings.reportName;
        const html = `<header class="head"><div><h1>${escape(title)}</h1><p>School Cloud Data Report</p></div><div>Generated: ${new Date().toLocaleDateString()}</div></header><div class="kpis"><div class="kpi"><small>Total School Accounts</small><strong>${escape(q('[data-sa-kpi="users"]').textContent)}</strong></div><div class="kpi"><small>Active Accounts</small><strong>${escape(q('[data-sa-kpi="active"]').textContent)}</strong></div><div class="kpi"><small>Total Cloud Records</small><strong>${escape(q('[data-sa-kpi="records"]').textContent)}</strong></div><div class="kpi"><small>Modules With Records</small><strong>${escape(q('[data-sa-kpi="modules"]').textContent)}</strong></div></div><p>Snapshot as of: <strong>${new Date(analytics?.fetchedAt || Date.now()).toLocaleString()}</strong></p><table><thead><tr><th>Module</th><th>Department</th><th>Cloud Records</th><th>Collections</th></tr></thead><tbody>${rows}</tbody></table><p>${escape(q('[data-sa-settings-form]').elements.reportNotes.value || '')}</p><div class="sign"><span>Prepared By</span><span>System Administrator</span><span>Department Head</span></div>`;
        printDocument(title, html);
    };

    q('[data-sa-department]').addEventListener('change', filterReports);
    q('[data-sa-search]').addEventListener('input', filterReports);
    q('[data-sa-reset]').addEventListener('click', () => {
        q('[data-sa-department]').value = 'All Departments';
        q('[data-sa-search]').value = '';
        filterReports();
        toast('Analytics filters reset.');
    });
    q('[data-sa-refresh]').addEventListener('click', () => void loadAnalytics());
    q('[data-sa-settings]').addEventListener('click', () => {
        const form = q('[data-sa-settings-form]');
        Object.keys(settings).forEach(key => { if (form.elements[key]) form.elements[key].value = settings[key]; });
        q('[data-sa-settings-overlay]').classList.add('is-open');
    });
    q('[data-sa-settings-form]').addEventListener('submit', event => {
        event.preventDefault();
        settings = Object.fromEntries(new FormData(event.currentTarget).entries());
        localStorage.setItem('systemAnalyticsReportSettings', JSON.stringify(settings));
        closeSettings();
        toast('Analytics report settings saved.');
    });
    q('[data-sa-export]').addEventListener('click', () => {
        const rows = [['Module', 'Department', 'Cloud Records', 'Collections'], ...[...q('[data-sa-report-rows]').querySelectorAll('tr')].filter(row => !row.hidden).map(row => [...row.cells].slice(0, 4).map(cell => cell.innerText.replace(/\n/g, ' ').trim()))];
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
        const html = `<header class="head"><div><h1>${escape(module.name)}</h1><p>School Cloud Data</p></div><div>Generated: ${new Date().toLocaleDateString()}</div></header><table><tbody>${[['Department', module.department], ['Cloud Records', module.records], ['Collections Included', module.collectionCount]].map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value)}</td></tr>`).join('')}</tbody></table><div class="sign"><span>Prepared By</span><span>System Administrator</span><span>Department Head</span></div>`;
        printDocument(`${module.name} Analytics`, html);
    });
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
    void loadAnalytics();
    return section;
}