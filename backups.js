function createBackupsModule() {
    const section = document.createElement('section');
    section.className = 'module backups-module hidden';
    section.id = 'backupsModule';
    section.innerHTML = `
        <header class="bk-header"><div><h2>Backups</h2><p>System Department · Manage database backups, schedules, storage and recovery</p></div><div class="bk-header-actions"><button class="bk-button bk-light" type="button" data-bk-refresh><i class="fas fa-rotate"></i> Refresh</button><button class="bk-button bk-light" type="button" data-bk-print><i class="fas fa-print"></i> Print / PDF</button><button class="bk-button bk-primary" type="button" data-bk-create><i class="fas fa-plus"></i> Create Backup</button></div></header>
        <div class="bk-filters"><label for="bk-search">Search</label><input id="bk-search" class="bk-search" data-bk-search placeholder="Search backup, server, storage..."><label for="bk-type-filter">Type</label><select id="bk-type-filter" data-bk-type><option value="all">All Types</option><option>Full</option><option>Incremental</option><option>Differential</option><option>Database</option><option>Files</option></select><label for="bk-status-filter">Status</label><select id="bk-status-filter" data-bk-status><option value="all">All Status</option><option>Completed</option><option>Running</option><option>Failed</option><option>Scheduled</option><option>Paused</option><option>Cancelled</option></select><label for="bk-storage-filter">Storage</label><select id="bk-storage-filter" data-bk-storage><option value="all">All Storage</option><option>Cloud</option><option>Local</option><option>NAS</option></select></div>
        <section class="bk-stats" aria-label="Backup summary"><article class="bk-stat"><div><span>Total Backups</span><strong>1,284</strong><small class="bk-trend up">▲ 8.4%</small></div><i class="fas fa-box-archive"></i></article><article class="bk-stat"><div><span>Successful</span><strong>1,267</strong><small class="bk-trend up">98.7%</small></div><i class="fas fa-circle-check"></i></article><article class="bk-stat"><div><span>Storage Used</span><strong>7.8 TB</strong><small class="bk-trend neutral">of 10 TB</small></div><i class="fas fa-database"></i></article><article class="bk-stat"><div><span>Last Backup</span><strong>12m</strong><small class="bk-trend up">Healthy</small></div><i class="fas fa-clock"></i></article><article class="bk-stat"><div><span>Failed Backups</span><strong>17</strong><small class="bk-trend down">Needs review</small></div><i class="fas fa-triangle-exclamation"></i></article></section>
        <section class="bk-grid"><article class="bk-card"><header class="bk-card-head"><div><h3>Backup Storage</h3><p>Current storage distribution</p></div><span class="bk-badge info">78% Used</span></header><div class="bk-card-body"><div class="bk-storage"><div class="bk-donut"><div><strong>7.8 TB</strong><span>of 10 TB</span></div></div><div class="bk-storage-info"><div class="bk-legend"><i class="bk-dot primary"></i><span>Cloud Storage</span></div><div class="bk-storage-line"><b>Cloud</b><span>5.4 TB · 68%</span></div><div class="bk-legend"><i class="bk-dot green"></i><span>NAS Storage</span></div><div class="bk-storage-line"><b>NAS</b><span>1.8 TB · 18%</span></div><div class="bk-legend"><i class="bk-dot orange"></i><span>Local Storage</span></div><div class="bk-storage-line"><b>Local</b><span>0.6 TB · 6%</span></div><div class="bk-legend"><i class="bk-dot gray"></i><span>Available</span></div><div class="bk-storage-line"><b>Free Space</b><span>2.2 TB · 22%</span></div></div></div></div></article>
            <article class="bk-card"><header class="bk-card-head"><div><h3>Backup Health</h3><p>Current status of critical backup jobs</p></div><span class="bk-badge success">All Systems Normal</span></header><div class="bk-card-body"><div class="bk-health"><div class="bk-health-row"><i class="bk-health-icon success fas fa-check"></i><span><b>Primary Database</b><small><i class="bk-status-dot green"></i>Running normally</small></span><span class="bk-health-time"><b>12 min ago</b><small>2.4 GB</small></span></div><div class="bk-health-row"><i class="bk-health-icon info fas fa-cloud"></i><span><b>Cloud Storage</b><small><i class="bk-status-dot green"></i>Sync completed</small></span><span class="bk-health-time"><b>28 min ago</b><small>8.6 GB</small></span></div><div class="bk-health-row"><i class="bk-health-icon warning fas fa-clock"></i><span><b>File Server</b><small><i class="bk-status-dot orange"></i>Scheduled</small></span><span class="bk-health-time"><b>Tonight</b><small>11:00 PM</small></span></div><div class="bk-health-row"><i class="bk-health-icon danger fas fa-triangle-exclamation"></i><span><b>Archive Server</b><small><i class="bk-status-dot red"></i>Backup failed</small></span><span class="bk-health-time"><b>2 hrs ago</b><small>Retry pending</small></span></div></div></div></article></section>
        <section class="bk-table-card"><header class="bk-card-head"><div><h3>Backup Jobs</h3><p>Monitor and manage all backup operations</p></div><span class="bk-badge success"><i class="fas fa-circle"></i> Backup Service Active</span></header><div class="bk-table-wrap"><table class="bk-table"><thead><tr><th>Backup ID</th><th>Backup Name</th><th>Type</th><th>Source</th><th>Destination</th><th>Size / Progress</th><th>Schedule</th><th>Last Run</th><th>Status</th><th>Actions</th></tr></thead><tbody data-bk-rows></tbody></table></div></section>
        <div class="bk-overlay" data-bk-create-overlay><section class="bk-modal" role="dialog" aria-modal="true" aria-labelledby="bk-create-title"><header class="bk-modal-head"><h3 id="bk-create-title">Create Backup</h3><button class="bk-close" type="button" data-bk-close-create aria-label="Close">&times;</button></header><form class="bk-form" data-bk-form><div class="bk-form-grid"><label>Backup Name<input name="name" required placeholder="e.g. Main Database Backup"></label><label>Backup Type<select name="type" required><option value="">Select Type</option><option>Full</option><option>Incremental</option><option>Differential</option><option>Database</option><option>Files</option></select></label><label>Source Server<select name="source" required><option value="">Select Source</option><option>DB-SERVER-01</option><option>APP-SERVER-01</option><option>FILE-SERVER-01</option><option>FIN-SERVER-01</option><option>HR-SERVER-01</option><option>ARCHIVE-01</option></select></label><label>Destination<select name="destination" required><option value="">Select Destination</option><option>Cloud Vault</option><option>NAS-01</option><option>NAS-02</option><option>Local Backup</option></select></label><label>Schedule<select name="schedule" required><option value="">Select Schedule</option><option>Manual</option><option>Hourly</option><option>Every 6 Hours</option><option>Daily · 01:00 AM</option><option>Daily · 02:00 AM</option><option>Daily · 11:00 PM</option><option>Weekly · Sunday</option></select></label><label>Retention Period<select name="retention"><option>7 Days</option><option selected>30 Days</option><option>60 Days</option><option>90 Days</option><option>1 Year</option></select></label><fieldset class="bk-full"><legend>Backup Options</legend><div class="bk-check-grid"><label><input name="verify" type="checkbox" checked> Verify backup after completion</label><label><input name="compress" type="checkbox" checked> Compress backup</label><label><input name="encrypt" type="checkbox" checked> Encrypt backup</label></div></fieldset><label class="bk-full">Description<textarea name="description" placeholder="Enter backup description..."></textarea></label></div><footer class="bk-modal-actions"><button class="bk-button bk-light" type="button" data-bk-cancel>Create later</button><button class="bk-button bk-primary" type="submit"><i class="fas fa-check"></i> Create Backup</button></footer></form></section></div>
        <div class="bk-overlay" data-bk-view-overlay><section class="bk-modal" role="dialog" aria-modal="true" aria-labelledby="bk-view-title"><header class="bk-modal-head"><h3 id="bk-view-title">Backup Details</h3><button class="bk-close" type="button" data-bk-close-view aria-label="Close">&times;</button></header><div class="bk-view"><div class="bk-detail-grid"><div><span>Backup ID</span><strong data-bk-detail="id"></strong></div><div><span>Backup Name</span><strong data-bk-detail="name"></strong></div><div><span>Type</span><strong data-bk-detail="type"></strong></div><div><span>Source</span><strong data-bk-detail="source"></strong></div><div><span>Destination</span><strong data-bk-detail="destination"></strong></div><div><span>Status</span><strong data-bk-detail="status"></strong></div><div><span>Backup Size</span><strong data-bk-detail="size"></strong></div><div><span>Last Run</span><strong data-bk-detail="lastRun"></strong></div><div><span>Schedule</span><strong data-bk-detail="schedule"></strong></div><div class="bk-full"><span>Description</span><strong data-bk-detail="description"></strong></div></div><div class="bk-info"><b>Backup Information</b><p data-bk-detail="info"></p></div></div><footer class="bk-modal-actions"><button class="bk-button bk-light" type="button" data-bk-close-view>Close</button><button class="bk-button bk-warning" type="button" data-bk-restore-current><i class="fas fa-rotate"></i> Restore</button><button class="bk-button bk-primary" type="button" data-bk-download-current><i class="fas fa-download"></i> Download Info</button></footer></section></div>
        <div class="bk-toast" role="status" aria-live="polite" data-bk-toast></div>`;

    const storageKey = 'schoolBackupJobs';
    const seed = [
        { id: 'BKP-1284', name: 'Main Database', subtype: 'Production database', type: 'Full', source: 'DB-SERVER-01', destination: 'Cloud Vault', storage: 'Cloud', size: '2.4 GB', progress: 100, schedule: 'Daily · 02:00 AM', lastRun: 'Today · 02:12 AM', status: 'Completed', description: 'Full production database backup.', info: 'Backup completed successfully and is available for restoration. The backup is verified and stored securely.', retention: '30 Days', verify: true, compress: true, encrypt: true },
        { id: 'BKP-1283', name: 'Student Records', subtype: 'Student management database', type: 'Incremental', source: 'APP-SERVER-01', destination: 'NAS-01', storage: 'NAS', size: '846 MB', progress: 100, schedule: 'Every 6 Hours', lastRun: 'Today · 06:05 AM', status: 'Completed', description: 'Incremental backup of student management records.', info: 'Latest incremental backup completed successfully.', retention: '30 Days', verify: true, compress: true, encrypt: true },
        { id: 'BKP-1282', name: 'Finance Database', subtype: 'Finance & accounting records', type: 'Database', source: 'FIN-SERVER-01', destination: 'Cloud Vault', storage: 'Cloud', size: '1.8 GB', progress: 73, schedule: 'Daily · 03:00 AM', lastRun: 'Running now', status: 'Running', description: 'Finance and accounting database backup.', info: 'Backup operation is currently running. Do not shut down the source server until completion.', retention: '30 Days', verify: true, compress: true, encrypt: true },
        { id: 'BKP-1281', name: 'Document Files', subtype: 'Shared department documents', type: 'Files', source: 'FILE-SERVER-01', destination: 'Local Backup', storage: 'Local', size: '--', progress: 0, schedule: 'Daily · 11:00 PM', lastRun: 'Yesterday · 11:04 PM', status: 'Scheduled', description: 'Department shared document backup.', info: 'This backup is scheduled to run automatically tonight.', retention: '30 Days', verify: true, compress: true, encrypt: true },
        { id: 'BKP-1280', name: 'Archive Server', subtype: 'Historical records archive', type: 'Differential', source: 'ARCHIVE-01', destination: 'NAS-02', storage: 'NAS', size: '4.1 GB', progress: 41, schedule: 'Daily · 01:00 AM', lastRun: 'Today · 01:34 AM', status: 'Failed', description: 'Historical records archive backup.', info: 'Backup failed during transfer. A retry is recommended after verifying NAS connectivity and available storage.', retention: '90 Days', verify: true, compress: true, encrypt: true },
        { id: 'BKP-1279', name: 'HR & Payroll', subtype: 'Employee and payroll records', type: 'Full', source: 'HR-SERVER-01', destination: 'Cloud Vault', storage: 'Cloud', size: '3.7 GB', progress: 100, schedule: 'Weekly · Sun 02:00 AM', lastRun: '02 Oct · 02:18 AM', status: 'Completed', description: 'Employee and payroll records backup.', info: 'Weekly full backup completed successfully and is available for recovery.', retention: '1 Year', verify: true, compress: true, encrypt: true }
    ];
    let jobs;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        jobs = Array.isArray(stored) ? stored : seed;
    } catch (error) {
        jobs = seed;
    }
    let currentId = null;
    let toastTimer;
    const q = selector => section.querySelector(selector);
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    const save = () => localStorage.setItem(storageKey, JSON.stringify(jobs));
    const toast = message => {
        const element = q('[data-bk-toast]');
        element.textContent = message;
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 2400);
    };
    const statusClass = status => String(status || '').toLowerCase();
    const filteredJobs = () => {
        const search = q('[data-bk-search]').value.trim().toLowerCase();
        const type = q('[data-bk-type]').value;
        const status = q('[data-bk-status]').value;
        const storage = q('[data-bk-storage]').value;
        return jobs.filter(job => (!search || JSON.stringify(job).toLowerCase().includes(search)) && (type === 'all' || job.type === type) && (status === 'all' || job.status === status) && (storage === 'all' || job.storage === storage));
    };
    const render = () => {
        const filtered = filteredJobs();
        q('[data-bk-rows]').innerHTML = filtered.length ? filtered.map(job => `<tr><td><strong class="bk-id">${escape(job.id)}</strong></td><td><b>${escape(job.name)}</b><small>${escape(job.subtype || '')}</small></td><td><span class="bk-badge purple-badge">${escape(job.type)}</span></td><td>${escape(job.source)}</td><td>${escape(job.destination)}</td><td><div class="bk-progress-wrap"><div class="bk-progress"><span class="${job.status === 'Failed' ? 'danger-fill' : job.status === 'Completed' ? 'success-fill' : 'running-fill'}" style="width:${Math.max(0, Math.min(100, Number(job.progress) || 0))}%"></span></div><div class="bk-progress-label"><span>${escape(job.size)}</span><span>${Number(job.progress) || 0}%</span></div></div></td><td>${escape(job.schedule)}</td><td>${escape(job.lastRun)}</td><td><span class="bk-badge ${escape(statusClass(job.status))}">${escape(job.status)}</span></td><td><div class="bk-actions"><button class="bk-action" type="button" title="View" aria-label="View ${escape(job.id)}" data-bk-action="view" data-id="${escape(job.id)}"><i class="fas fa-eye"></i></button>${job.status === 'Failed' ? `<button class="bk-action bk-primary-action" type="button" title="Retry" aria-label="Retry ${escape(job.id)}" data-bk-action="retry" data-id="${escape(job.id)}"><i class="fas fa-rotate"></i></button><button class="bk-action bk-delete" type="button" title="Delete" aria-label="Delete ${escape(job.id)}" data-bk-action="delete" data-id="${escape(job.id)}"><i class="fas fa-trash"></i></button>` : job.status === 'Running' ? `<button class="bk-action" type="button" title="Pause" aria-label="Pause ${escape(job.id)}" data-bk-action="pause" data-id="${escape(job.id)}"><i class="fas fa-pause"></i></button><button class="bk-action bk-delete" type="button" title="Cancel" aria-label="Cancel ${escape(job.id)}" data-bk-action="cancel" data-id="${escape(job.id)}"><i class="fas fa-xmark"></i></button>` : job.status === 'Scheduled' ? `<button class="bk-action bk-primary-action" type="button" title="Run now" aria-label="Run ${escape(job.id)}" data-bk-action="run" data-id="${escape(job.id)}"><i class="fas fa-play"></i></button>` : `<button class="bk-action bk-primary-action" type="button" title="Restore" aria-label="Restore ${escape(job.id)}" data-bk-action="restore" data-id="${escape(job.id)}"><i class="fas fa-rotate"></i></button><button class="bk-action" type="button" title="Download backup information" aria-label="Download details for ${escape(job.id)}" data-bk-action="download" data-id="${escape(job.id)}"><i class="fas fa-download"></i></button>`}</div></td></tr>`).join('') : '<tr><td colspan="10"><div class="bk-empty">No backup jobs match these filters.</div></td></tr>';
    };
    const closeCreate = () => q('[data-bk-create-overlay]').classList.remove('is-open');
    const closeView = () => { q('[data-bk-view-overlay]').classList.remove('is-open'); currentId = null; };
    const openView = job => {
        currentId = job.id;
        const values = { id: job.id, name: job.name, type: job.type, source: job.source, destination: job.destination, status: job.status, size: job.size, lastRun: job.lastRun, schedule: job.schedule, description: job.description };
        Object.entries(values).forEach(([key, value]) => { q(`[data-bk-detail="${key}"]`).textContent = value || '—'; });
        q('[data-bk-detail="info"]').textContent = job.info || 'Backup information is unavailable.';
        q('[data-bk-view-overlay]').classList.add('is-open');
    };
    const downloadInfo = job => {
        const content = `BACKUP INFORMATION\n\nBackup ID: ${job.id}\nName: ${job.name}\nType: ${job.type}\nSource: ${job.source}\nDestination: ${job.destination}\nStatus: ${job.status}\nSize: ${job.size}\nLast Run: ${job.lastRun}\nSchedule: ${job.schedule}\nDescription: ${job.description}\n\nThis file contains backup metadata only. It is not a backup archive.`;
        const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `${job.id}-backup-information.txt`;
        link.click();
        URL.revokeObjectURL(url);
        toast('Backup information downloaded.');
    };
    const runJob = job => {
        job.status = 'Running';
        job.progress = 0;
        job.size = '--';
        job.lastRun = 'Starting now';
        job.info = 'Backup job queued in the local prototype. No backup service is connected.';
        save();
        render();
        toast(`Backup job ${job.id} started in prototype mode.`);
    };

    q('[data-bk-cancel]').textContent = 'Cancel';
    q('[data-bk-search]').addEventListener('input', render);
    q('[data-bk-type]').addEventListener('change', render);
    q('[data-bk-status]').addEventListener('change', render);
    q('[data-bk-storage]').addEventListener('change', render);
    q('[data-bk-refresh]').addEventListener('click', () => { render(); toast('Backup dashboard refreshed.'); });
    q('[data-bk-create]').addEventListener('click', () => q('[data-bk-create-overlay]').classList.add('is-open'));
    q('[data-bk-print]').addEventListener('click', () => {
        const rows = filteredJobs();
        if (!rows.length) return toast('No backups available to print.');
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast('Allow pop-ups to print backup reports.');
        const content = rows.map(job => `<tr><td>${escape(job.id)}</td><td>${escape(job.name)}</td><td>${escape(job.type)}</td><td>${escape(job.source)}</td><td>${escape(job.destination)}</td><td>${escape(job.size)}</td><td>${escape(job.schedule)}</td><td>${escape(job.lastRun)}</td><td>${escape(job.status)}</td></tr>`).join('');
        printWindow.document.write(`<!doctype html><html><head><title>Backup Report</title><meta charset="utf-8"><style>body{font:12px Arial,sans-serif;padding:30px;color:#172033}h1{margin:0 0 6px;font-size:22px}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{border:1px solid #aaa;padding:7px;text-align:left;font-size:9px}th{background:#eee}.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:60px}.sign span{border-top:1px solid #333;padding-top:7px}</style></head><body><h1>Backup Report</h1><p>System Department · Backup Management · Generated ${new Date().toLocaleDateString()}</p><table><thead><tr><th>Backup ID</th><th>Name</th><th>Type</th><th>Source</th><th>Destination</th><th>Size</th><th>Schedule</th><th>Last Run</th><th>Status</th></tr></thead><tbody>${content}</tbody></table><div class="sign"><span>Prepared By</span><span>System Administrator</span><span>Department Head</span></div></body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    });
    q('[data-bk-form]').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = Object.fromEntries(new FormData(form).entries());
        const sequence = Math.max(1284, ...jobs.map(job => Number(job.id.match(/^BKP-(\d+)$/)?.[1]) || 0)) + 1;
        const isManual = data.schedule === 'Manual';
        const job = { id: `BKP-${sequence}`, name: data.name.trim(), subtype: data.description.trim() || `${data.type} backup`, type: data.type, source: data.source, destination: data.destination, storage: data.destination.startsWith('NAS') ? 'NAS' : data.destination === 'Local Backup' ? 'Local' : 'Cloud', size: '--', progress: 0, schedule: data.schedule, lastRun: isManual ? 'Starting now' : 'Not yet run', status: isManual ? 'Running' : 'Scheduled', description: data.description.trim() || 'New system backup.', info: 'Backup job was created in the local prototype. No backup service is connected.', retention: data.retention, verify: Boolean(form.elements.verify.checked), compress: Boolean(form.elements.compress.checked), encrypt: Boolean(form.elements.encrypt.checked) };
        jobs.unshift(job);
        save();
        form.reset();
        closeCreate();
        render();
        toast(`Backup ${job.id} created in prototype mode.`);
    });
    q('[data-bk-rows]').addEventListener('click', event => {
        const button = event.target.closest('[data-bk-action]');
        if (!button) return;
        const job = jobs.find(item => item.id === button.dataset.id);
        if (!job) return;
        switch (button.dataset.bkAction) {
            case 'view': openView(job); break;
            case 'download': downloadInfo(job); break;
            case 'restore':
                if (confirm(`Request restore for backup ${job.id}? This prototype will not modify real data.`)) toast(`Restore simulation requested for ${job.id}.`);
                break;
            case 'run':
            case 'retry': runJob(job); break;
            case 'pause':
                job.status = 'Paused';
                job.info = 'Backup job paused in the local prototype.';
                save(); render(); toast(`Backup job ${job.id} paused.`);
                break;
            case 'cancel':
                if (confirm(`Cancel backup job ${job.id}?`)) { job.status = 'Cancelled'; job.info = 'Backup job cancelled in the local prototype.'; save(); render(); toast(`Backup job ${job.id} cancelled.`); }
                break;
            case 'delete':
                if (confirm(`Delete backup record ${job.id}?`)) { jobs = jobs.filter(item => item.id !== job.id); save(); render(); toast('Backup record deleted.'); }
                break;
        }
    });
    q('[data-bk-close-create]').addEventListener('click', closeCreate);
    q('[data-bk-cancel]').addEventListener('click', closeCreate);
    q('[data-bk-close-view]').addEventListener('click', closeView);
    q('[data-bk-restore-current]').addEventListener('click', () => {
        const job = jobs.find(item => item.id === currentId);
        if (job && confirm(`Request restore for backup ${job.id}? This prototype will not modify real data.`)) toast(`Restore simulation requested for ${job.id}.`);
    });
    q('[data-bk-download-current]').addEventListener('click', () => {
        const job = jobs.find(item => item.id === currentId);
        if (job) downloadInfo(job);
    });
    section.querySelectorAll('.bk-overlay').forEach(overlay => overlay.addEventListener('click', event => { if (event.target === overlay) overlay.classList.remove('is-open'); }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') { closeCreate(); closeView(); }
    });
    render();
    return section;
}