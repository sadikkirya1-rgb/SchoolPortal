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
        const toastStack = document.createElement('div');
        toastStack.className = 'approval-toast-stack';
        toastStack.setAttribute('aria-live', 'polite');
        toastStack.setAttribute('aria-atomic', 'false');
        document.body.appendChild(toastStack);
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
            toastStack.appendChild(toast);
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
            refreshBadges(pending);
        };

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