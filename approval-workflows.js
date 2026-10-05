(() => {
    const workflows = [
        { key: 'leave', storage: 'school_leaves', module: 'Leave Management', section: 'leaveManagementModule', department: () => 'Human Resources', reference: item => `LEAVE-${item.id}`, title: item => `${item.staffName || 'Staff member'} · ${item.leaveType || 'Leave request'}`, detail: item => `${item.department || 'Staff'} · ${item.startDate || 'No start date'} to ${item.endDate || 'No end date'}`, isPending: item => item.status === 'Pending', approve: 'Approved', reject: 'Rejected' },
        { key: 'purchase-request', storage: 'schoolPurchaseRequests', module: 'Purchase Requests', navLabels: ['Purchase Request'], section: 'purchaseRequestsModule', department: () => 'Procurement', reference: item => item.id, title: item => item.requester || 'Purchase request', detail: item => `${item.department || 'Department not set'} · ${item.purpose || 'Purchase request awaiting approval'}`, isPending: item => item.status === 'Pending', approve: 'Approved', reject: 'Rejected' },
        { key: 'purchase-comparison', storage: 'schoolPurchaseComparisons', module: 'Purchase Comparisons', section: 'purchaseComparisonsModule', department: () => 'Procurement', reference: item => item.id, title: item => item.requirement || 'Purchase comparison', detail: item => `${item.department || 'Department not set'} · ${item.request || 'Comparison awaiting review'}`, isPending: item => item.status === 'Pending', approve: 'Approved', reject: 'Rejected' },
        { key: 'supplier-invoice', storage: 'schoolSupplierInvoices', module: 'Supplier Invoices', section: 'supplierInvoicesModule', department: () => 'Finance', reference: item => item.invoiceNo || item.id, title: item => item.supplier || 'Supplier invoice', detail: item => `${item.invoiceNo || item.id || 'Invoice'} · ${item.currency || ''} ${Number(item.total || item.amount || 0).toLocaleString()}`, isPending: item => item.status === 'Pending Approval', approve: 'Approved', reject: 'Rejected' },
        { key: 'supplier', storage: 'schoolSupplierDirectory', module: 'Suppliers', section: 'suppliersModule', department: () => 'Procurement', reference: item => item.supplierCode || item.id, title: item => item.companyName || item.supplierName || item.name || 'Supplier verification', detail: item => item.category || 'Supplier awaiting verification', isPending: item => item.status === 'Pending Approval', approve: 'Active', reject: 'Inactive' },
        { key: 'parent-verification', storage: 'schoolParentContacts', module: 'Parents', section: 'parentsModule', department: () => 'Admissions', reference: item => item.familyReference || item.id, title: item => item.parentName || item.fullName || item.name || 'Parent contact', detail: item => item.studentName ? `Parent verification · ${item.studentName}` : 'Parent contact awaiting verification', isPending: item => item.status === 'Pending Verification', approve: 'Active', reject: 'Inactive' },
        { key: 'club-registration', storage: 'schoolClubsSocieties', module: 'Clubs & Societies', section: 'clubsSocietiesModule', department: () => 'Student Life', reference: item => item.clubCode, title: item => item.clubName || 'Club registration', detail: item => `${item.clubType || 'Club'} · Advisor: ${item.advisor || 'Not assigned'}`, isPending: item => item.clubStatus === 'Pending', approve: 'Active', reject: 'Inactive' },
        { key: 'notice-publication', storage: 'schoolNoticeBoard', module: 'Notice Board', section: 'noticeBoardModule', department: item => (item.department || 'Communication Department').replace(/ Department$/i, ''), reference: item => item.noticeId, title: item => item.title || 'Notice publication', detail: item => `${item.category || 'Notice'} · Scheduled ${item.publishDate || 'date not set'}`, isPending: item => item.status === 'Pending', approve: 'Published', reject: 'Draft' },
        { key: 'appointment-request', storage: 'edumasterAppointments', module: 'Appointments', section: 'module_appointments', department: item => item.department || "Principal's Office", reference: item => item.appointmentId || item.id, title: item => `${item.guestName || 'Guest'} · ${item.appointmentType || 'Appointment request'}`, detail: item => `${item.appointmentDate || 'Date not set'} ${item.appointmentTime || ''} · ${item.personToVisit || 'Host not set'}`, isPending: item => ['Requested', 'Scheduled'].includes(item.status), approve: 'Confirmed', reject: 'Cancelled' }
    ];

    const read = key => {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return Array.isArray(value) ? value : [];
        } catch (error) {
            return [];
        }
    };
    const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
    const getPending = () => workflows.flatMap(workflow => read(workflow.storage).flatMap((record, index) => workflow.isPending(record) ? [{ workflow, record, index }] : []));
    const pendingKey = item => `${item.workflow.key}:${String(item.record.id ?? item.workflow.reference(item.record) ?? item.index)}`;

    const init = () => {
        const topActions = document.querySelector('.top-actions');
        if (!topActions) return;

        const root = document.createElement('div');
        root.className = 'approval-center';
        root.innerHTML = `<button class="approval-trigger" type="button" aria-label="Pending approvals" aria-expanded="false" title="Pending approvals"><i class="fas fa-bell" aria-hidden="true"></i><span class="approval-trigger-count" hidden>0</span></button><section class="approval-popover" aria-label="Pending department approvals" hidden><header class="approval-popover-header"><div><strong>Approvals</strong><span data-approval-summary>Pending items for review</span></div><button class="approval-close" type="button" aria-label="Close approvals"><i class="fas fa-xmark"></i></button></header><div class="approval-notification-setting"><span data-approval-permission>In-app alerts are active</span><button type="button" data-approval-enable>Enable browser alerts</button></div><div class="approval-department-list" data-approval-list></div></section><div class="approval-toast-stack" aria-live="polite" aria-atomic="false"></div>`;
        const profile = topActions.querySelector('.profile');
        if (profile) topActions.insertBefore(root, profile);
        else topActions.appendChild(root);

        const trigger = root.querySelector('.approval-trigger');
        const popover = root.querySelector('.approval-popover');
        const list = root.querySelector('[data-approval-list]');
        const summary = root.querySelector('[data-approval-summary]');
        const permissionStatus = root.querySelector('[data-approval-permission]');
        const notificationButton = root.querySelector('[data-approval-enable]');
        const knownPending = new Set(getPending().map(pendingKey));
        const departmentTitles = {
            'human resources': 'Human Resources Department',
            'human resources department': 'Human Resources Department',
            'hr department': 'Human Resources Department',
            hr: 'Human Resources Department',
            finance: 'Finance Department',
            'finance department': 'Finance Department',
            'accounts / finance': 'Finance Department',
            procurement: 'Procurement Department',
            'procurement department': 'Procurement Department',
            admissions: 'Admissions Department',
            'admissions department': 'Admissions Department',
            'student life': 'Student Life Department',
            'student affairs': 'Student Life Department',
            'communication department': 'Communication Department',
            "principal's office": "Principal's Office Department",
            'principal office': "Principal's Office Department",
            reception: 'Front Office Department',
            academic: 'Academic Department',
            administration: "Principal's Office Department",
            'academic department': 'Academic Department'
        };

        const navigationLink = workflow => [...document.querySelectorAll('.nav-links a, .menu-item-link, .submenu-link')].find(link => {
            const label = link.querySelector('.menu-item-label, .submenu-label')?.textContent.trim() || link.querySelector('span')?.textContent.trim() || link.textContent.trim();
            return [workflow.module, ...(workflow.navLabels || [])].includes(label);
        });
        const refreshBadges = pending => {
            const departmentCounts = new Map();
            pending.forEach(item => {
                const name = item.workflow.department(item.record).toLowerCase();
                const title = departmentTitles[name];
                if (title) departmentCounts.set(title, (departmentCounts.get(title) || 0) + 1);
            });
            if (pending.length) departmentCounts.set("Principal's Office Department", pending.length);
            document.querySelectorAll('.menu-title').forEach(title => {
                const label = [...title.childNodes].filter(node => !(node.nodeType === 1 && node.classList.contains('approval-group-count'))).map(node => node.textContent).join('').trim();
                const count = departmentCounts.get(label) || 0;
                let badge = title.querySelector('.approval-group-count');
                if (!badge && count) {
                    badge = document.createElement('span');
                    badge.className = 'approval-group-count';
                    title.appendChild(badge);
                }
                if (badge) {
                    badge.textContent = count;
                    badge.hidden = count === 0;
                }
            });
            workflows.forEach(workflow => {
                const link = navigationLink(workflow);
                if (!link) return;
                let badge = link.querySelector('.approval-count-badge');
                const count = pending.filter(item => item.workflow === workflow).length;
                if (!badge && count) {
                    badge = document.createElement('span');
                    badge.className = 'approval-count-badge';
                    link.appendChild(badge);
                }
                if (badge) {
                    badge.textContent = count;
                    badge.hidden = count === 0;
                    link.setAttribute('aria-label', `${workflow.module}: ${count} pending approval${count === 1 ? '' : 's'}`);
                }
            });
        };
        const showInAppAlert = item => {
            const toast = document.createElement('div');
            toast.className = 'approval-toast';
            toast.innerHTML = `<i class="fas fa-bell" aria-hidden="true"></i><div><strong>Approval needed · ${escape(item.workflow.department(item.record))}</strong><span>${escape(item.workflow.title(item.record))}</span></div>`;
            root.querySelector('.approval-toast-stack').appendChild(toast);
            window.setTimeout(() => toast.remove(), 6500);
        };
        const sendBrowserAlert = item => {
            if (!('Notification' in window) || Notification.permission !== 'granted') return;
            const notification = new Notification(`Approval needed · ${item.workflow.department(item.record)}`, {
                body: `${item.workflow.title(item.record)} · ${item.workflow.reference(item.record) || 'Open request'}`,
                tag: pendingKey(item)
            });
            notification.onclick = () => {
                window.focus();
                navigationLink(item.workflow)?.click();
                notification.close();
            };
        };
        const notifyNewApprovals = pending => {
            const currentPending = new Set();
            pending.forEach(item => {
                const key = pendingKey(item);
                currentPending.add(key);
                if (knownPending.has(key)) return;
                knownPending.add(key);
                showInAppAlert(item);
                sendBrowserAlert(item);
            });
            knownPending.forEach(key => {
                if (!currentPending.has(key)) knownPending.delete(key);
            });
        };
        const render = () => {
            const pending = getPending();
            notifyNewApprovals(pending);
            const countBadge = root.querySelector('.approval-trigger-count');
            countBadge.textContent = pending.length > 99 ? '99+' : pending.length;
            countBadge.hidden = pending.length === 0;
            permissionStatus.textContent = !('Notification' in window) ? 'Browser alerts unavailable; in-app alerts are active' : Notification.permission === 'granted' ? 'Browser alerts are enabled' : Notification.permission === 'denied' ? 'Browser alerts are blocked; in-app alerts are active' : 'In-app alerts are active';
            notificationButton.disabled = !('Notification' in window) || Notification.permission !== 'default';
            notificationButton.textContent = !('Notification' in window) ? 'Unavailable' : Notification.permission === 'granted' ? 'Enabled' : Notification.permission === 'denied' ? 'Blocked in browser' : 'Enable browser alerts';
            trigger.setAttribute('aria-label', `${pending.length} pending approval${pending.length === 1 ? '' : 's'}`);
            summary.textContent = pending.length ? `${pending.length} item${pending.length === 1 ? '' : 's'} need review` : 'No approvals are waiting';
            refreshBadges(pending);
            list.innerHTML = pending.length ? pending.map(({ workflow, record, index }) => {
                const reference = workflow.reference(record) || `${workflow.key}-${index + 1}`;
                return `<article class="approval-item"><div class="approval-item-heading"><span class="approval-department">${escape(workflow.department(record))}</span><strong>${escape(reference)}</strong></div><h3>${escape(workflow.title(record))}</h3><p>${escape(workflow.detail(record))}</p><div class="approval-item-actions"><button type="button" class="approval-review" data-approval-action="review" data-approval-key="${workflow.key}" data-approval-index="${index}">Review</button><button type="button" class="approval-approve" data-approval-action="approve" data-approval-key="${workflow.key}" data-approval-index="${index}">Approve</button><button type="button" class="approval-reject" data-approval-action="reject" data-approval-key="${workflow.key}" data-approval-index="${index}">Reject</button></div></article>`;
            }).join('') : '<div class="approval-empty"><i class="fas fa-circle-check" aria-hidden="true"></i><strong>All caught up</strong><span>New approval requests will appear here automatically.</span></div>';
        };
        const close = () => {
            popover.hidden = true;
            trigger.setAttribute('aria-expanded', 'false');
        };

        trigger.addEventListener('click', () => {
            const isOpening = popover.hidden;
            render();
            popover.hidden = !isOpening;
            trigger.setAttribute('aria-expanded', String(isOpening));
        });
        root.querySelector('.approval-close').addEventListener('click', close);
        root.querySelector('[data-approval-enable]').addEventListener('click', async () => {
            if (!('Notification' in window)) {
                permissionStatus.textContent = 'This browser does not support browser alerts';
                return;
            }
            const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
            if (permission === 'granted') {
                getPending().forEach(sendBrowserAlert);
                permissionStatus.textContent = 'Browser alerts are enabled';
            } else {
                permissionStatus.textContent = 'Browser alerts were not enabled; in-app alerts remain active';
            }
        });
        document.addEventListener('click', event => {
            if (!root.contains(event.target)) close();
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') close();
        });
        list.addEventListener('click', event => {
            const button = event.target.closest('[data-approval-action]');
            if (!button) return;
            const workflow = workflows.find(item => item.key === button.dataset.approvalKey);
            if (!workflow) return;
            const index = Number(button.dataset.approvalIndex);
            const records = read(workflow.storage);
            const record = records[index];
            if (!record || !workflow.isPending(record)) {
                render();
                return;
            }
            if (button.dataset.approvalAction === 'review') {
                close();
                navigationLink(workflow)?.click();
                return;
            }
            const decision = button.dataset.approvalAction === 'approve' ? 'Approved' : 'Rejected';
            if (!window.confirm(`${decision} ${workflow.title(record)}?`)) return;
            const session = (() => { try { return JSON.parse(localStorage.getItem('edumasterAdminSession')) || {}; } catch (error) { return {}; } })();
            const timestamp = new Date().toISOString();
            record.status = decision === 'Approved' ? workflow.approve : workflow.reject;
            record.approvalHistory = Array.isArray(record.approvalHistory) ? record.approvalHistory : [];
            record.approvalHistory.push({ decision, by: session.name || session.userId || session.role || 'Department reviewer', at: timestamp });
            record.statusHistory = Array.isArray(record.statusHistory) ? record.statusHistory : [];
            record.statusHistory.push({ status: record.status, by: session.name || session.userId || session.role || 'Department reviewer', at: timestamp });
            if (decision === 'Approved') record.approvedAt = timestamp;
            else record.rejectedAt = timestamp;
            records[index] = record;
            localStorage.setItem(workflow.storage, JSON.stringify(records));
            const section = document.getElementById(workflow.section);
            if (section) section.remove();
            navigationLink(workflow)?.click();
            render();
        });

        render();
        window.addEventListener('storage', render);
        window.setInterval(render, 5000);
        const menu = document.getElementById('mainMenu');
        if (menu) new MutationObserver(mutations => {
            const menuChanged = mutations.some(({ target }) => {
                const element = target.nodeType === 1 ? target : target.parentElement;
                return !element?.closest('.approval-count-badge');
            });
            if (menuChanged) render();
        }).observe(menu, { childList: true, subtree: true });
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();