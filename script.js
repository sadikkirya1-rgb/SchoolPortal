document.addEventListener('DOMContentLoaded', () => {
    // Get colors from CSS variables for consistency
    const style = getComputedStyle(document.documentElement);
    const colors = {
        primary: style.getPropertyValue('--primary').trim(),
        secondary: style.getPropertyValue('--secondary').trim(),
        success: style.getPropertyValue('--success').trim(),
        warning: style.getPropertyValue('--warning').trim(),
        danger: style.getPropertyValue('--danger').trim(),
        text: '#64748b'
    };

    // --- Admin Login Flow ---
    const loginScreen = document.getElementById('loginScreen');
    const container = document.querySelector('.container');
    const schoolStep = document.getElementById('schoolStep');
    const adminStep = document.getElementById('adminStep');
    const schoolIdInput = document.getElementById('schoolIdInput');
    const adminUserInput = document.getElementById('adminUserInput');
    const adminPassInput = document.getElementById('adminPassInput');
    const schoolError = document.getElementById('schoolError');
    const adminError = document.getElementById('adminError');
    const schoolNextBtn = document.getElementById('schoolNextBtn');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const backToSchoolBtn = document.getElementById('backToSchoolBtn');
    const stepIndicators = document.querySelectorAll('.login-steps .step');

    const schoolAccounts = {
        'SCH-UG-2026': { schoolName: 'EduMaster Uganda', adminUser: 'Admin', password: 'admin', role: 'Head Teacher' },
        'SCH-001': { schoolName: 'Central Campus', adminUser: 'Principal', password: 'principal', role: 'Head Teacher' }
    };
    let currentSchool = null;

    const logoutBtn = document.getElementById('logoutBtn');
    const storageKey = 'edumasterAdminSession';

    const normalizeSchoolId = (value) => {
        return value
            .replace(/[\u200B-\u200D\uFEFF]/g, '') // strip hidden unicode chars
            .replace(/\s+/g, '')
            .toUpperCase();
    };

    const sampleUsersContainer = document.getElementById('sampleUsers');
    const sampleUserValue = document.getElementById('sampleUserValue');
    const samplePasswordValue = document.getElementById('samplePasswordValue');

    const loginCard = document.querySelector('.login-card');

    const updateStep = (stepIndex) => {
        stepIndicators.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
            if (index === 1) {
                step.classList.toggle('hidden', stepIndex !== 1);
            }
        });
        loginCard.classList.toggle('show-login-step', stepIndex === 1);
        schoolStep.classList.toggle('hidden', stepIndex !== 0);
        adminStep.classList.toggle('hidden', stepIndex !== 1);
    };

    const showError = (element, message) => {
        element.textContent = message || '';
    };

    const saveSession = (session) => {
        localStorage.setItem(storageKey, JSON.stringify(session));
    };

    const clearSession = () => {
        localStorage.removeItem(storageKey);
    };

    const loadSession = () => {
        try {
            return JSON.parse(localStorage.getItem(storageKey));
        } catch (err) {
            return null;
        }
    };

    const resetLoginScreen = () => {
        updateStep(0);
        schoolIdInput.value = '';
        adminUserInput.value = '';
        adminPassInput.value = '';
        sampleUsersContainer?.classList.add('hidden');
        showError(schoolError, '');
        showError(adminError, '');
    };

    const showSampleUser = () => {
        const users = loadUsers();
        if (!sampleUsersContainer || users.length === 0) return;
        // Show the first available active user as a sample
        const sample = users.find(u => u.status !== false) || users[0];
        sampleUserValue.textContent = sample.userId;
        samplePasswordValue.textContent = sample.password;
        sampleUsersContainer.classList.remove('hidden');
    };

    const hideSampleUser = () => {
        sampleUsersContainer?.classList.add('hidden');
    };

    const unlockDashboard = (userData) => {
        loginScreen.classList.remove('active');
        container.classList.remove('hidden');
        const schoolName = currentSchool?.schoolName || 'EduMaster Uganda';
        document.querySelector('.welcome h1').textContent = `${schoolName} Admin Dashboard`;
        document.querySelector('.welcome p').textContent = 'Welcome back, School Admin. Your dashboard is ready.';
        
        document.querySelector('.profile h4').textContent = userData.fullName || userData.adminUser || 'Administrator';
        document.querySelector('.profile-role').textContent = userData.role;
        document.querySelector('.profile img').src = userData.photo || 'https://i.pravatar.cc/100?img=12';
        showDashboard();
    };

    const restoreSession = () => {
        const session = loadSession();
        if (!session || !session.schoolId) return;

        const schoolId = normalizeSchoolId(session.schoolId);
        const schoolData = schoolAccounts[schoolId];
        if (!schoolData) {
            clearSession();
            return;
        }

        if (session.authenticated) {
            const users = loadUsers();
            const userObj = users.find(u => u.userId === session.userId);
            currentSchool = schoolData;
            unlockDashboard(userObj || schoolData);
            return;
        }

        schoolIdInput.value = session.schoolId;
        if (session.step === 1) {
            currentSchool = schoolData;
            updateStep(1);
            showSampleUser(currentSchool);
            adminUserInput.focus();
        } else {
            updateStep(0);
        }
    };

    schoolNextBtn.addEventListener('click', () => {
        const schoolId = normalizeSchoolId(schoolIdInput.value);
        if (!schoolId) {
            showError(schoolError, 'Please enter your school ID.');
            return;
        }
        if (schoolId.includes(',')) {
            showError(schoolError, 'Enter only one school ID at a time. Examples: SCH-UG-2026 or SCH-001.');
            return;
        }
        const schoolData = schoolAccounts[schoolId];
        if (!schoolData) {
            showError(schoolError, 'School ID not recognized. Please enter a valid registered School ID.');
            return;
        }
        currentSchool = schoolData;
        showError(schoolError, '');
        showError(adminError, '');
        saveSession({ schoolId, step: 1, authenticated: false });
        updateStep(1);
        showSampleUser();
        setTimeout(() => adminUserInput.focus(), 100);
    });

    const normalizeUserId = (value) => value.trim().toLowerCase();

    adminLoginBtn.addEventListener('click', () => {
        const userId = normalizeUserId(adminUserInput.value);
        const password = adminPassInput.value.trim();
        if (!userId || !password) {
            showError(adminError, 'Please enter both user ID and password.');
            return;
        }
        if (!currentSchool) {
            showError(adminError, 'Start with a valid school ID first.');
            return;
        }
        const users = loadUsers();
        const userObj = users.find(u => u.userId === userId && u.password === password);
        if (!userObj) {
            showError(adminError, 'Incorrect user ID or password.');
            return;
        }
        if (userObj.status === false) {
            showError(adminError, 'This account is deactivated. Please contact support.');
            return;
        }
        showError(adminError, '');
        saveSession({ schoolId: normalizeSchoolId(schoolIdInput.value), userId: userId, step: 2, authenticated: true });
        unlockDashboard(userObj);
    });

    backToSchoolBtn.addEventListener('click', () => {
        showError(adminError, '');
        saveSession({ schoolId: schoolIdInput.value.trim().toUpperCase(), step: 0, authenticated: false });
        hideSampleUser();
        updateStep(0);
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            clearSession();
            resetLoginScreen();
            container.classList.add('hidden');
            loginScreen.classList.add('active');
        });
    }

    schoolIdInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            schoolNextBtn.click();
        }
    });

    adminPassInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            adminLoginBtn.click();
        }
    });

    restoreSession();

    /**
     * Contextual Header Button Engine
     * Updates the "Add" button based on the active ERP section
     */
    window.updateHeaderAddButton = function(sectionLabel) {
        const addBtn = document.getElementById('addStudentBtn');
        if (!addBtn) return;

        const actionConfigs = {
            'Dashboard': { text: 'Add Student', icon: 'fa-plus' },
            'Students': { text: 'Add Student', icon: 'fa-user-plus' },
            'Teachers': { text: 'Add Teacher', icon: 'fa-chalkboard-teacher' },
            'Enquiries': { text: 'New Enquiry', icon: 'fa-comment-dots' },
            'Call Logs': { text: 'New Call', icon: 'fa-phone' },
            'Dispatch': { text: 'New Dispatch', icon: 'fa-paper-plane' },
            'Visitors': { text: 'New Visitor', icon: 'fa-user-plus' },
            'Visitor Management': { text: 'New Visitor', icon: 'fa-user-plus' },
            'Appointments': { text: 'New Appointment', icon: 'fa-calendar-plus' },
            'Incoming Mail': { text: 'Register Incoming Mail', icon: 'fa-inbox' },
            'Follow-ups': { text: 'New Follow-up', icon: 'fa-rotate' },
            'Reports': { text: 'Export Report', icon: 'fa-file-export' },
            'Visitor Logs': { text: 'New Visitor Log', icon: 'fa-clipboard-list' },
            'Announcements': { text: 'New Announcement', icon: 'fa-bullhorn' },
            'Calendar': { text: 'New Calendar Event', icon: 'fa-calendar-plus' },
            'Documents': { text: 'Add Document', icon: 'fa-folder-plus' },
            'Notifications': { text: 'New Notification', icon: 'fa-bell' },
            'Applications': { text: 'New Application', icon: 'fa-file-signature' },
            'Admission Letters': { text: 'Generate Letter', icon: 'fa-envelope-open-text' },
            'Library': { text: 'Add Book', icon: 'fa-book' },
            'Attendance': { text: 'New Attendance', icon: 'fa-calendar-check' },
            'Health/Infirmary': { text: 'New Health Record', icon: 'fa-briefcase-medical' },
            'Boarding': { text: 'New Boarding Record', icon: 'fa-house' },
            'Transport': { text: 'New Transport Record', icon: 'fa-bus' },
            'Alumni': { text: 'New Alumni', icon: 'fa-user-graduate' },
            'Inventory': { text: 'New Item', icon: 'fa-boxes-stacked' },
            'ID Cards': { text: 'New ID', icon: 'fa-id-card' },
            'Certificates': { text: 'New Certificate', icon: 'fa-certificate' },
            'Inventory': { text: 'Add Item', icon: 'fa-boxes-stacked' },
            'Staff Directory': { text: 'Add Staff', icon: 'fa-user-tie' },
            'Leave Management': { text: 'Request Leave', icon: 'fa-calendar-minus' },
            'Run Payroll': { text: 'Process Payroll', icon: 'fa-money-bill-wave' },
            'Fees': { text: 'Collect Fee', icon: 'fa-money-bill-transfer' },
            'Fee Invoices': { text: 'Create Invoice', icon: 'fa-file-invoice-dollar' },
            'Expenses': { text: 'Add Expense', icon: 'fa-receipt' },
            'Purchase Requests': { text: 'New Request', icon: 'fa-cart-plus' },
            'Users': { text: 'Add User', icon: 'fa-user-shield' },
            'Assignments': { text: 'Post Assignment', icon: 'fa-clipboard-list' },
            'Online Quizzes': { text: 'Create Quiz', icon: 'fa-stopwatch' },
            'Notice Board': { text: 'Post Notice', icon: 'fa-bullhorn' }
        };

        const config = actionConfigs[sectionLabel] || { text: `New ${sectionLabel}`, icon: 'fa-plus' };
        
        addBtn.innerHTML = `<i class="fas ${config.icon}"></i> ${config.text}`;
        addBtn.setAttribute('data-section', sectionLabel);
        
        // Visibility Logic: Hide button on purely analytical or log sections
        const hideOn = ['Audit Logs', 'Backups', 'Analytics', 'System Settings', 'School Branding', 'School Statistics', 'EMIS Reports'];
        addBtn.style.display = hideOn.includes(sectionLabel) ? 'none' : 'flex';
    };

    // --- Profile Modal Logic ---
    const headerProfile = document.getElementById('headerProfile');
    const profileModal = document.getElementById('profileModal');
    const closeProfileModal = document.getElementById('closeProfileModal');

    headerProfile?.addEventListener('click', (e) => {
        if (e.target.closest('#logoutBtn')) return;
        
        const session = loadSession();
        const users = loadUsers();
        const currentUser = users.find(u => u.userId === session?.userId);
        
        if (currentUser) {
            document.getElementById('modalProfilePhoto').src = currentUser.photo || 'https://i.pravatar.cc/100?img=12';
            document.getElementById('modalProfileName').textContent = currentUser.fullName;
            document.getElementById('modalProfileRole').textContent = currentUser.role;
            document.getElementById('modalProfileId').textContent = currentUser.userId;
            document.getElementById('modalProfilePass').textContent = currentUser.password;
            profileModal.classList.add('active');
        }
    });

    closeProfileModal?.addEventListener('click', () => profileModal.classList.remove('active'));

    // --- User Roles Management ---
    const userRolesBtn = document.getElementById('userRolesBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const userRolesSection = document.getElementById('userRolesSection');
    const rolesBackBtn = document.getElementById('rolesBackBtn');

    const roleSelectEl = document.getElementById('roleSelect');
    const sectionsContainerEl = document.getElementById('sectionsContainer');
    const addUserForm = document.getElementById('addUserForm');
    const usersTableBody = document.getElementById('usersTableBody');
    const toggleAddUserFormBtn = document.getElementById('toggleAddUserFormBtn');
    const generatePassBtn = document.getElementById('generatePassBtn');
    const cancelUserFormBtn = document.getElementById('cancelUserFormBtn');

    toggleAddUserFormBtn?.addEventListener('click', () => {
        const isHidden = addUserForm.classList.contains('hidden');
        if (isHidden) {
            addUserForm.classList.remove('hidden');
            clearForm();
        } else {
            addUserForm.classList.add('hidden');
        }
    });

    generatePassBtn?.addEventListener('click', () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < 12; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        const passInput = document.getElementById('passwordInputNew');
        if (passInput) {
            passInput.value = password;
            passInput.type = 'text';
        }
    });

    const photoInput = document.getElementById('profilePhotoInput');
    const photoPreview = document.getElementById('photoPreview');
    photoInput?.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                photoPreview.src = event.target.result;
                photoPreview.style.display = 'block';
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    cancelUserFormBtn?.addEventListener('click', () => {
        addUserForm.classList.add('hidden');
        clearForm();
    });

    const usersKey = 'edumasterUsers';
    let editingUserId = null;

    // Seed initial admin user if data is empty
    if (!localStorage.getItem(usersKey)) {
        const adminData = schoolAccounts['SCH-UG-2026'];
        const initialUser = {
            id: 'u_admin_default',
            fullName: adminData.adminUser,
            userId: adminData.adminUser.toLowerCase(),
            password: adminData.password,
            role: adminData.role,
            sections: ['Main', 'System'],
            perms: { view: true, edit: true, delete: true },
            status: true,
            photo: 'https://i.pravatar.cc/100?img=12'
        };
        localStorage.setItem(usersKey, JSON.stringify([initialUser]));
    }

    function updateBreadcrumb(items) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;
        breadcrumb.innerHTML = items.map((item, index) => {
            const isLast = index === items.length - 1;
            return `<span class="${isLast ? 'active-crumb' : ''}">${item}</span>`;
        }).join('');
    }

    function hideAllContentAreas(){
        const sections = ['.main > .dashboard', '.main > .modules', '.main > .charts', '.main > .table-card', '#userRolesSection'];
        sections.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.classList.add('hidden'));
        });
        // Hide dynamically created department modules
        document.querySelectorAll('.main > section.module').forEach(m => m.classList.add('hidden'));
    }

    function showSection(sectionId){
        hideAllContentAreas();
        const el = document.getElementById(sectionId);
        if (el) el.classList.remove('hidden');
    }

    function showDashboard(){
        hideAllContentAreas();
        document.querySelectorAll('.main > .dashboard, .main > .modules, .main > .charts, .main > .table-card').forEach(el => {
            if (el) el.classList.remove('hidden');
        });
        updateBreadcrumb(['Main', 'Dashboard']);
    }

    function createFrontOfficeDashboard(category) {
        const sec = document.createElement('section');
        sec.className = 'module front-office-dashboard';
        sec.id = 'module_front_office_dashboard';
        sec.innerHTML = `
            <div class="front-office-dashboard-header"><div><h2>Front Desk Dashboard</h2><p>Department: ${category} | School Reception & Front Office</p></div><div class="front-office-dashboard-actions"><span data-front-office-date></span><button class="btn-secondary" type="button" data-front-office-refresh><i class="fas fa-rotate"></i> Refresh</button></div></div>
            <div class="front-office-welcome"><div><h3>Good morning, Front Desk</h3><p>Today's reception overview and important activities requiring attention.</p></div><div><button class="btn-primary" type="button" data-front-office-open="Enquiries"><i class="fas fa-plus"></i> New Enquiry</button><button class="btn-primary" type="button" data-front-office-open="Visitors"><i class="fas fa-user-plus"></i> Register Visitor</button></div></div>
            <div class="front-office-kpis"><div><i class="fas fa-clipboard-list"></i><span>Enquiries</span><strong data-front-office-count="enquiries">0</strong><small>Today's enquiries</small></div><div><i class="fas fa-phone"></i><span>Calls</span><strong data-front-office-count="calls">0</strong><small>Calls logged today</small></div><div><i class="fas fa-users"></i><span>Visitors</span><strong data-front-office-count="visitors">0</strong><small>Registered today</small></div><div><i class="fas fa-calendar-check"></i><span>Appointments</span><strong data-front-office-count="appointments">0</strong><small>Today's appointments</small></div><div><i class="fas fa-inbox"></i><span>Incoming Mail</span><strong data-front-office-count="mail">0</strong><small>Received today</small></div><div><i class="fas fa-paper-plane"></i><span>Dispatch</span><strong data-front-office-count="dispatches">0</strong><small>Outgoing items</small></div><div><i class="fas fa-rotate"></i><span>Follow-ups</span><strong data-front-office-count="followups">0</strong><small>Pending follow-ups</small></div></div>
            <div class="front-office-main-grid"><div class="front-office-panel"><div class="front-office-panel-header"><div><h3>Quick Actions</h3><p>Frequently used Front Office functions</p></div></div><div class="front-office-quick-actions"><button data-front-office-open="Enquiries"><i class="fas fa-clipboard-list"></i><strong>New Enquiry</strong><small>Record a new enquiry</small></button><button data-front-office-open="Call Logs"><i class="fas fa-phone"></i><strong>Log Call</strong><small>Record incoming or outgoing call</small></button><button data-front-office-open="Visitors"><i class="fas fa-users"></i><strong>Register Visitor</strong><small>Check in a visitor</small></button><button data-front-office-open="Appointments"><i class="fas fa-calendar"></i><strong>Appointment</strong><small>Schedule an appointment</small></button><button data-front-office-open="Incoming Mail"><i class="fas fa-inbox"></i><strong>Receive Mail</strong><small>Register incoming mail</small></button><button data-front-office-open="Dispatch"><i class="fas fa-paper-plane"></i><strong>New Dispatch</strong><small>Record outgoing item</small></button><button data-front-office-open="Follow-ups"><i class="fas fa-rotate"></i><strong>Follow-ups</strong><small>View pending actions</small></button><button data-front-office-open="Reports"><i class="fas fa-chart-column"></i><strong>Reports</strong><small>View Front Office reports</small></button></div></div><div class="front-office-panel"><div class="front-office-panel-header"><div><h3>Today's Appointments</h3><p>Upcoming visitors and meetings</p></div><span class="front-office-badge">TODAY</span></div><div class="front-office-appointments" data-front-office-appointments></div></div></div>
            <div class="front-office-lower-grid"><div class="front-office-panel"><div class="front-office-panel-header"><div><h3>Recent Activity</h3><p>Latest Front Office transactions</p></div></div><div class="front-office-activity" data-front-office-activity></div></div><div class="front-office-panel"><div class="front-office-panel-header"><div><h3>Attention Required</h3><p>Items that may require action</p></div><span class="front-office-badge warning">ALERTS</span></div><div class="front-office-alerts" data-front-office-alerts></div></div></div>
            <div class="front-office-panel"><div class="front-office-panel-header"><div><h3>Today's Front Desk Summary</h3><p>Operational workload at a glance</p></div></div><div class="front-office-summary-grid"><div><span>Enquiries Resolved</span><strong data-front-office-summary="enquiries">0%</strong><i data-front-office-bar="enquiries"></i></div><div><span>Visitor Check-outs</span><strong data-front-office-summary="visitors">0%</strong><i data-front-office-bar="visitors"></i></div><div><span>Dispatch Completed</span><strong data-front-office-summary="dispatches">0%</strong><i data-front-office-bar="dispatches"></i></div><div><span>Follow-ups Completed</span><strong data-front-office-summary="followups">0%</strong><i data-front-office-bar="followups"></i></div></div></div>`;
        const read = key => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch (error) { return []; } };
        const escape = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
        const today = new Date().toISOString().slice(0, 10);
            const refresh = () => {
            const enquiries = read('edumasterEnquiries'); const calls = read('edumasterCallLogs'); const visitors = read('edumasterVisitors'); const appointments = read('edumasterAppointments'); const mail = read('edumasterIncomingMail'); const dispatches = read('edumasterDispatches'); const followups = read('edumasterFollowUps');
            const dated = (items, fields) => items.filter(item => fields.some(field => item[field] === today)); const todayAppointments = dated(appointments, ['appointmentDate']).slice(0, 5); const todayVisitors = dated(visitors, ['visitDate']); const todayMail = dated(mail, ['receivedDate']); const todayDispatches = dated(dispatches, ['dispatchDate']); const todayCalls = dated(calls, ['callDate']); const todayEnquiries = enquiries.filter(item => item.createdAt?.slice(0, 10) === today);
            const counts = { enquiries: todayEnquiries.length, calls: todayCalls.length, visitors: todayVisitors.length, appointments: todayAppointments.length, mail: todayMail.length, dispatches: todayDispatches.length, followups: followups.filter(item => !['Completed', 'Cancelled'].includes(item.status)).length };
            Object.entries(counts).forEach(([name, value]) => { sec.querySelector(`[data-front-office-count="${name}"]`).textContent = value; }); sec.querySelector('[data-front-office-date]').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            sec.querySelector('[data-front-office-appointments]').innerHTML = todayAppointments.length ? todayAppointments.map(item => `<div class="front-office-appointment"><strong>${escape(item.appointmentTime || '--')}</strong><span>${escape(item.guestName || 'Guest')}<small>${escape(item.appointmentType || item.purpose || 'Appointment')}</small></span><em>${escape(item.status || 'Scheduled')}</em></div>`).join('') : '<p class="front-office-empty">No appointments scheduled for today.</p>';
            const activity = [...todayEnquiries.map(item => ['fa-clipboard-list', `New enquiry from ${item.name || 'a visitor'}`]), ...todayCalls.map(item => ['fa-phone', `Call logged from ${item.callerName || 'a contact'}`]), ...todayVisitors.map(item => ['fa-users', `Visitor ${item.status === 'Checked In' ? 'checked in' : 'registered'}`]), ...todayDispatches.map(item => ['fa-paper-plane', `Dispatch ${item.status || 'recorded'}`])].slice(0, 6); sec.querySelector('[data-front-office-activity]').innerHTML = activity.length ? activity.map(item => `<div class="front-office-activity-row"><i class="fas ${item[0]}"></i><span>${escape(item[1])}<small>Today</small></span></div>`).join('') : '<p class="front-office-empty">No activity recorded today.</p>';
            const alerts = []; const pendingFollowups = followups.filter(item => !['Completed', 'Cancelled'].includes(item.status)); const overdue = pendingFollowups.filter(item => item.followUpDate && item.followUpDate < today); const inside = visitors.filter(item => ['Checked In', 'In Meeting'].includes(item.status)); if (pendingFollowups.length) alerts.push(['warning', `${pendingFollowups.length} follow-ups pending`, 'Review pending follow-up actions.']); if (overdue.length) alerts.push(['danger', `${overdue.length} overdue follow-ups`, 'Some follow-ups require immediate attention.']); if (inside.length) alerts.push(['info', `${inside.length} visitors currently inside`, 'Remember to record visitor check-outs.']); if (!alerts.length) alerts.push(['success', 'Front Office is on track', 'No urgent actions require attention.']); sec.querySelector('[data-front-office-alerts]').innerHTML = alerts.map(item => `<div class="front-office-alert ${item[0]}"><i class="fas fa-circle-exclamation"></i><span><strong>${item[1]}</strong><small>${item[2]}</small></span></div>`).join('');
            const metrics = { enquiries: enquiries.length ? Math.round(enquiries.filter(item => ['Completed', 'Resolved', 'Closed'].includes(item.status)).length / enquiries.length * 100) : 0, visitors: visitors.length ? Math.round(visitors.filter(item => item.status === 'Checked Out').length / visitors.length * 100) : 0, dispatches: dispatches.length ? Math.round(dispatches.filter(item => ['Delivered', 'Collected'].includes(item.status)).length / dispatches.length * 100) : 0, followups: followups.length ? Math.round(followups.filter(item => item.status === 'Completed').length / followups.length * 100) : 0 }; Object.entries(metrics).forEach(([name, value]) => { sec.querySelector(`[data-front-office-summary="${name}"]`).textContent = `${value}%`; sec.querySelector(`[data-front-office-bar="${name}"]`).style.width = `${value}%`; });
        };
        sec.querySelector('[data-front-office-refresh]').addEventListener('click', refresh); sec.querySelectorAll('[data-front-office-open]').forEach(button => button.addEventListener('click', () => { const link = Array.from(document.querySelectorAll('.nav-links a')).find(item => (item.querySelector('span')?.innerText.trim() || item.innerText.trim()) === button.dataset.frontOfficeOpen); link?.click(); }));
            window.addEventListener('front-office-data-changed', refresh); refresh();
        return sec;
    }

    rolesBackBtn?.addEventListener('click', () => showDashboard());

    function createEnquiriesModule(category) {
        const sec = document.createElement('section');
        sec.className = 'module enquiries-module';
        sec.id = 'module_enquiries';
        sec.innerHTML = `
            <div class="module-header">
                <div>
                    <h2>Enquiries</h2>
                    <p>Department: ${category}</p>
                </div>
                <button class="btn-secondary" type="button" data-enquiry-new><i class="fas fa-plus"></i> New Enquiry</button>
            </div>
            <div class="enquiries-stats">
                <div class="enquiry-stat"><span>Total Enquiries</span><strong data-enquiry-total>0</strong></div>
                <div class="enquiry-stat"><span>Open</span><strong data-enquiry-open>0</strong></div>
                <div class="enquiry-stat"><span>Appointments</span><strong data-enquiry-appointments>0</strong></div>
                <div class="enquiry-stat"><span>Priority</span><strong data-enquiry-priority>0</strong></div>
            </div>
            <div class="enquiries-grid">
                <div class="enquiry-card enquiry-entry-card hidden">
                    <div class="enquiry-card-header"><h3>New Front Office Enquiry</h3><p>Register a parent, student, visitor or general enquiry.</p></div>
                    <div class="enquiry-card-body">
                        <form data-enquiry-form>
                            <div class="enquiry-form-grid">
                                <div class="enquiry-form-group"><label>Visitor Type</label><select name="visitorType" required><option value="">Select visitor type</option><option>Parent / Guardian</option><option>Student</option><option>Staff Member</option><option>Supplier / Vendor</option><option>Guest</option><option>Other</option></select></div>
                                <div class="enquiry-form-group"><label>Visit Purpose</label><select name="purpose" required><option value="">Select purpose</option><option>Admission Enquiry</option><option>Parent Meeting</option><option>Student Enquiry</option><option>Fee / Accounts</option><option>Document Collection</option><option>General Enquiry</option><option>Other</option></select></div>
                                <div class="enquiry-form-group"><label>Full Name</label><input name="name" placeholder="Enter full name" required></div>
                                <div class="enquiry-form-group"><label>Mobile Number</label><input name="mobile" placeholder="+256 700 000000" required></div>
                                <div class="enquiry-form-group"><label>Student ID</label><input name="studentId" placeholder="e.g. STU-2026-001"></div>
                                <div class="enquiry-form-group"><label>Department / Person</label><input name="department" placeholder="e.g. Admissions or Principal"></div>
                                <div class="enquiry-form-group"><label>Appointment Date</label><input name="appointmentDate" type="date"></div>
                                <div class="enquiry-form-group"><label>Priority</label><select name="priority"><option>Normal</option><option>Important</option><option>Urgent</option></select></div>
                                <div class="enquiry-form-group full"><label>Notes</label><textarea name="notes" placeholder="Enter enquiry details or follow-up notes"></textarea></div>
                            </div>
                            <div class="enquiry-form-actions"><button class="btn-secondary" type="reset" data-enquiry-clear>Clear</button><button class="btn-secondary" type="button" data-enquiry-cancel>Cancel</button><button class="btn-primary" type="submit"><i class="fas fa-save"></i> Save Enquiry</button></div>
                        </form>
                    </div>
                </div>
                <aside class="enquiry-card enquiry-summary-card hidden">
                    <div class="enquiry-card-header"><h3>Live Summary</h3><p>Review before saving</p></div>
                    <div class="enquiry-card-body enquiry-summary">
                        <div class="enquiry-summary-row"><span>Visitor</span><strong data-summary="name">-</strong></div>
                        <div class="enquiry-summary-row"><span>Type</span><strong data-summary="visitorType">-</strong></div>
                        <div class="enquiry-summary-row"><span>Purpose</span><strong data-summary="purpose">-</strong></div>
                        <div class="enquiry-summary-row"><span>Department</span><strong data-summary="department">-</strong></div>
                        <div class="enquiry-summary-row"><span>Priority</span><strong data-summary="priority">Normal</strong></div>
                    </div>
                </aside>
            </div>
            <div class="enquiries-table"><div class="table-card"><h3 class="table-title">Saved Enquiry Records</h3><table><thead><tr><th>Name</th><th>Type</th><th>Purpose</th><th>Student ID</th><th>Department</th><th>Appointment</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead><tbody data-enquiry-table></tbody></table></div></div>`;

        const form = sec.querySelector('[data-enquiry-form]');
        const table = sec.querySelector('[data-enquiry-table]');
        const storageKey = 'edumasterEnquiries';
        let editingIndex = null;
        const readEntries = () => {
            try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch (error) { return []; }
        };
        const escape = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
        const render = () => {
            const entries = readEntries();
            sec.querySelector('[data-enquiry-total]').textContent = entries.length;
            sec.querySelector('[data-enquiry-open]').textContent = entries.filter(entry => entry.status !== 'Completed').length;
            sec.querySelector('[data-enquiry-appointments]').textContent = entries.filter(entry => entry.appointmentDate).length;
            sec.querySelector('[data-enquiry-priority]').textContent = entries.filter(entry => entry.priority !== 'Normal').length;
            table.innerHTML = entries.length ? entries.slice(0, 8).map((entry, index) => `<tr><td>${escape(entry.name)}<br><small>${escape(entry.mobile)}</small></td><td>${escape(entry.visitorType)}</td><td>${escape(entry.purpose)}</td><td>${escape(entry.studentId || '-')}</td><td>${escape(entry.department || '-')}</td><td>${escape(entry.appointmentDate || '-')}</td><td>${escape(entry.priority)}</td><td><span class="badge pending">${escape(entry.status)}</span></td><td><div class="enquiry-actions"><button class="enquiry-action" type="button" data-enquiry-action="edit" data-enquiry-index="${index}" title="Edit"><i class="fas fa-pen"></i></button><button class="enquiry-action" type="button" data-enquiry-action="delete" data-enquiry-index="${index}" title="Delete"><i class="fas fa-trash"></i></button><button class="enquiry-action" type="button" data-enquiry-action="print" data-enquiry-index="${index}" title="Print"><i class="fas fa-print"></i></button></div></td></tr>`).join('') : '<tr><td colspan="9" style="text-align:center;padding:25px;color:#94a3b8;">No saved enquiries yet. Complete the form above to create a record.</td></tr>';
        };
        const updateSummary = () => form.querySelectorAll('[name]').forEach(field => {
            const summary = sec.querySelector(`[data-summary="${field.name}"]`);
            if (summary) summary.textContent = field.value || (field.name === 'priority' ? 'Normal' : '-');
        });
        form.addEventListener('input', updateSummary);
        form.addEventListener('change', updateSummary);
        form.addEventListener('reset', () => setTimeout(updateSummary));
        form.addEventListener('submit', event => {
            event.preventDefault();
            const data = Object.fromEntries(new FormData(form).entries());
            data.id = data.id || Date.now().toString();
            data.status = 'Open';
            data.createdAt = new Date().toISOString();
            const entries = readEntries();
            if (editingIndex === null) {
                entries.unshift(data);
            } else {
                data.id = entries[editingIndex].id || data.id;
                data.createdAt = entries[editingIndex].createdAt || data.createdAt;
                entries[editingIndex] = data;
            }
            localStorage.setItem(storageKey, JSON.stringify(entries));
            form.reset();
            editingIndex = null;
            sec.querySelector('.enquiry-entry-card').classList.add('hidden');
            sec.querySelector('.enquiry-summary-card').classList.add('hidden');
            updateSummary();
            render();
        });
        const entryCard = sec.querySelector('.enquiry-entry-card');
        const closeForm = () => {
            entryCard.classList.add('hidden');
            sec.querySelector('.enquiry-summary-card').classList.add('hidden');
            form.reset();
            editingIndex = null;
            updateSummary();
        };
        sec.querySelector('[data-enquiry-new]').addEventListener('click', () => {
            if (!entryCard.classList.contains('hidden')) {
                closeForm();
                return;
            }
            entryCard.classList.remove('hidden');
            sec.querySelector('.enquiry-summary-card').classList.remove('hidden');
            form.reset();
            form.querySelector('[name="name"]').focus();
            updateSummary();
        });
        sec.querySelector('[data-enquiry-cancel]').addEventListener('click', closeForm);
        table.addEventListener('click', event => {
            const actionButton = event.target.closest('[data-enquiry-action]');
            if (!actionButton) return;
            const entries = readEntries();
            const entry = entries[Number(actionButton.dataset.enquiryIndex)];
            if (!entry) return;

            if (actionButton.dataset.enquiryAction === 'delete') {
                if (!confirm(`Delete the enquiry for ${entry.name || 'this visitor'}?`)) return;
                entries.splice(Number(actionButton.dataset.enquiryIndex), 1);
                localStorage.setItem(storageKey, JSON.stringify(entries));
                render();
                return;
            }

            if (actionButton.dataset.enquiryAction === 'edit') {
                Object.entries(entry).forEach(([name, value]) => {
                    const field = form.elements[name];
                    if (field) field.value = value;
                });
                entryCard.classList.remove('hidden');
                sec.querySelector('.enquiry-summary-card').classList.remove('hidden');
                form.querySelector('[name="name"]').focus();
                updateSummary();
                editingIndex = Number(actionButton.dataset.enquiryIndex);
                return;
            }

            const printWindow = window.open('', '_blank', 'width=700,height=700');
            if (!printWindow) return;
            printWindow.document.write(`<html><head><title>Enquiry Record</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#172033}h1{font-size:22px;border-bottom:2px solid #4f46e5;padding-bottom:10px}.row{padding:9px 0;border-bottom:1px solid #e2e8f0}.label{font-weight:bold;display:inline-block;width:150px}</style></head><body><h1>Front Office Enquiry</h1>${Object.entries(entry).filter(([name]) => name !== 'id').map(([name, value]) => `<div class="row"><span class="label">${escape(name)}</span>${escape(value || '-')}</div>`).join('')}</body></html>`);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        });
        render();
        return sec;
    }

    function createReportCardsModule(category) {
        const sec = document.createElement('section');
        sec.className = 'module report-cards-module';
        sec.id = 'module_report_cards';
        sec.innerHTML = `
            <div class="module-header report-cards-header"><div><h2>Report Cards</h2><p>Manage, generate and publish student report cards</p></div><div class="report-cards-user"><span>Administrator</span><small>Super Admin</small></div></div>
            <div class="report-cards-stats"><div><span>Total Report Cards</span><strong data-report-stat="total">0</strong><i class="fas fa-clipboard-list"></i></div><div><span>Published</span><strong data-report-stat="published">0</strong><i class="fas fa-check"></i></div><div><span>Generated</span><strong data-report-stat="generated">0</strong><i class="fas fa-bolt"></i></div><div><span>Draft</span><strong data-report-stat="draft">0</strong><i class="fas fa-pen"></i></div></div>
            <div class="report-cards-panel"><div class="report-cards-toolbar"><div><h3>Report Cards List</h3><p>Academic Year 2026/27</p></div><div class="report-cards-actions"><label class="report-search"><i class="fas fa-search"></i><input type="search" data-report-search placeholder="Search student or report no..."></label><button class="btn-secondary" type="button" data-report-filter><i class="fas fa-filter"></i> Filter</button><button class="btn-primary" type="button" data-report-new><i class="fas fa-plus"></i> New Report Card</button></div></div><div class="report-cards-table-wrap"><table><thead><tr><th>Report Card No.</th><th>Student</th><th>Class</th><th>Section</th><th>Academic Year</th><th>Period</th><th>Average</th><th>Grade</th><th>GPA</th><th>Attendance</th><th>Status</th><th>Generated</th><th>Actions</th></tr></thead><tbody data-report-table></tbody></table></div></div>
            <div class="report-card-modal hidden" data-report-modal><div class="report-card-dialog" role="dialog" aria-modal="true" aria-labelledby="report-card-form-title"><div class="report-card-dialog-header"><div><h3 id="report-card-form-title">Report Card Setup</h3><p>Configure report card information and display options</p></div><button class="icon-button" type="button" data-report-close aria-label="Close"><i class="fas fa-times"></i></button></div><form data-report-form><input type="hidden" name="editIndex"><div class="report-form-section"><h4>General Information</h4><div class="report-form-grid"><label>Report Card Name<input name="reportName" value="Student Academic Report Card" required></label><label>Academic Year<input name="year" value="2026/27" required></label><label>Academic Period<select name="period"><option>Term 1</option><option>Term 2</option><option>Term 3</option><option>Semester 1</option><option>Semester 2</option></select></label><label>Class / Grade<select name="class"><option>Grade 6</option><option>Grade 7</option><option selected>Grade 8</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select></label><label>Section<select name="section"><option>A</option><option>B</option><option>C</option><option>D</option></select></label><label>Report Card Type<select name="reportType"><option>Standard</option><option>Detailed</option><option>Progress Report</option><option>Final Report</option></select></label><label>Grading System<select name="grading"><option>Percentage & Letter Grade</option><option>GPA 4.0 Scale</option><option>GPA 5.0 Scale</option><option>Custom School Grading</option></select></label><label>Status<select name="status"><option>Draft</option><option>Generated</option><option>Published</option><option>Archived</option></select></label></div></div><div class="report-form-section"><h4>Display Options</h4><div class="report-checkbox-grid">${['School Logo','Student Photo','Admission Number','Date of Birth','Class / Section','Attendance','Position / Rank','GPA','Overall Grade','Teacher Remarks','Principal Remarks','Parent Signature','Teacher Signature','Principal Signature'].map(label => `<label><input type="checkbox" checked> ${label}</label>`).join('')}</div></div><div class="report-form-section"><h4>Publication</h4><div class="report-form-grid"><label>Publication Status<select name="publication"><option>Draft</option><option>Generated</option><option>Published</option><option>Archived</option></select></label><label>Generated Date<input type="date" name="generatedDate"></label></div></div><div class="report-card-dialog-footer"><button class="btn-secondary" type="button" data-report-close>Cancel</button><button class="btn-primary" type="submit"><i class="fas fa-save"></i> Save Report Card</button></div></form></div></div>
            <div class="report-card-preview-modal hidden" data-report-preview><div class="report-card-preview"><div class="report-card-dialog-header"><div><h3>Report Card Preview</h3><p>Official student academic report</p></div><div><button class="btn-secondary" type="button" data-report-print><i class="fas fa-print"></i> Print</button><button class="icon-button" type="button" data-report-preview-close aria-label="Close"><i class="fas fa-times"></i></button></div></div><div class="report-preview-sheet" data-report-preview-sheet></div></div></div>`;
        const previewActions = sec.querySelector('[data-report-preview] .report-card-dialog-header > div:last-child');
        const previewCloseButton = sec.querySelector('[data-report-preview-close]');
        previewCloseButton.insertAdjacentHTML('beforebegin', '<button class="btn-primary" type="button" data-report-download><i class="fas fa-download"></i> Download</button>');
        const storageKey = 'edumasterReportCards';
        const seed = [{ no: 'RC-2026-00125', student: 'Ahmed Ali', class: 'Grade 8', section: 'A', year: '2026/27', period: 'Term 1', average: '84.5%', grade: 'A', gpa: '3.8', attendance: '96%', status: 'Published', generated: '24 Aug 2026' }, { no: 'RC-2026-00124', student: 'Sara Mohammed', class: 'Grade 8', section: 'A', year: '2026/27', period: 'Term 1', average: '91.2%', grade: 'A+', gpa: '4.0', attendance: '98%', status: 'Published', generated: '24 Aug 2026' }, { no: 'RC-2026-00123', student: 'Omar Hassan', class: 'Grade 8', section: 'B', year: '2026/27', period: 'Term 1', average: '78.6%', grade: 'B+', gpa: '3.4', attendance: '93%', status: 'Generated', generated: '23 Aug 2026' }, { no: 'RC-2026-00122', student: 'Fatima Ahmed', class: 'Grade 7', section: 'A', year: '2026/27', period: 'Term 1', average: '88.9%', grade: 'A', gpa: '3.8', attendance: '97%', status: 'Published', generated: '23 Aug 2026' }, { no: 'RC-2026-00121', student: 'Yusuf Ibrahim', class: 'Grade 9', section: 'C', year: '2026/27', period: 'Term 1', average: '74.3%', grade: 'B', gpa: '3.0', attendance: '90%', status: 'Draft', generated: '22 Aug 2026' }];
        const read = () => { try { const saved = JSON.parse(localStorage.getItem(storageKey)); if (Array.isArray(saved)) return saved; } catch (error) { /* use defaults */ } localStorage.setItem(storageKey, JSON.stringify(seed)); return seed.slice(); };
        const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
        const table = sec.querySelector('[data-report-table]'); const form = sec.querySelector('[data-report-form]'); const modal = sec.querySelector('[data-report-modal]'); const preview = sec.querySelector('[data-report-preview]'); let showingPublished = false; let currentIndex = 0;
        const initials = name => name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase(); const formatDate = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '24 Aug 2026';
        const render = () => { const query = sec.querySelector('[data-report-search]').value.toLowerCase(); const records = read(); const filtered = records.map((record, index) => ({ record, index })).filter(({ record }) => (!showingPublished || record.status === 'Published') && [record.student, record.no, record.class, record.section].some(value => String(value).toLowerCase().includes(query))); table.innerHTML = filtered.length ? filtered.map(({ record, index }) => `<tr><td><strong>${escape(record.no)}</strong></td><td><div class="report-student"><span>${escape(initials(record.student))}</span><strong>${escape(record.student)}</strong></div></td><td>${escape(record.class)}</td><td>${escape(record.section)}</td><td>${escape(record.year)}</td><td>${escape(record.period)}</td><td><strong>${escape(record.average)}</strong></td><td><strong class="report-grade">${escape(record.grade)}</strong></td><td><strong>${escape(record.gpa)}</strong></td><td>${escape(record.attendance)}</td><td><span class="report-status ${escape(record.status.toLowerCase())}">${escape(record.status)}</span></td><td>${escape(record.generated)}</td><td><div class="report-row-actions"><button class="icon-button" type="button" data-report-action="view" data-index="${index}" title="View"><i class="fas fa-eye"></i></button><button class="icon-button" type="button" data-report-action="edit" data-index="${index}" title="Edit"><i class="fas fa-pen"></i></button><button class="icon-button" type="button" data-report-action="publish" data-index="${index}" title="Publish"><i class="fas fa-check"></i></button><button class="icon-button" type="button" data-report-action="archive" data-index="${index}" title="Archive"><i class="fas fa-box-archive"></i></button></div></td></tr>`).join('') : '<tr><td colspan="13" class="report-empty">No report cards found.</td></tr>'; sec.querySelector('[data-report-stat="total"]').textContent = records.length; ['published', 'generated', 'draft'].forEach(status => { sec.querySelector(`[data-report-stat="${status}"]`).textContent = records.filter(record => record.status.toLowerCase() === status).length; }); };
        const closeModal = () => { modal.classList.add('hidden'); form.reset(); form.elements.editIndex.value = ''; }; const openForm = index => { form.reset(); form.elements.editIndex.value = index ?? ''; const record = index === undefined ? null : read()[index]; if (record) { form.elements.year.value = record.year; form.elements.period.value = record.period; form.elements.class.value = record.class; form.elements.section.value = record.section; form.elements.status.value = record.status; form.elements.publication.value = record.status; } else form.elements.generatedDate.value = new Date().toISOString().slice(0, 10); modal.classList.remove('hidden'); form.elements.year.focus(); };
        const openPreview = index => { const record = read()[index]; if (!record) return; currentIndex = index; sec.querySelector('[data-report-preview-sheet]').innerHTML = `<div class="report-sheet-heading"><strong>EXCELLENCE INTERNATIONAL SCHOOL</strong><span>Abu Dhabi • United Arab Emirates</span><h2>Student Report Card</h2><small>Academic Year ${escape(record.year)} • ${escape(record.period)}</small></div><div class="report-sheet-info"><b>Student Name</b><strong>${escape(record.student)}</strong><b>Class</b><strong>${escape(record.class)} - ${escape(record.section)}</strong><b>Report Card No.</b><strong>${escape(record.no)}</strong><b>Attendance</b><strong>${escape(record.attendance)}</strong></div><table><thead><tr><th>Subject</th><th>Obtained</th><th>Percentage</th><th>Grade</th><th>Remarks</th></tr></thead><tbody><tr><td>English Language</td><td>88</td><td>88%</td><td>A</td><td>Excellent</td></tr><tr><td>Mathematics</td><td>91</td><td>91%</td><td>A+</td><td>Outstanding</td></tr><tr><td>Science</td><td>86</td><td>86%</td><td>A</td><td>Excellent</td></tr></tbody></table><div class="report-sheet-summary"><span>Average <strong>${escape(record.average)}</strong></span><span>Overall Grade <strong>${escape(record.grade)}</strong></span><span>GPA <strong>${escape(record.gpa)}</strong></span></div>`; preview.classList.remove('hidden'); };
        const openFullPreview = index => { openPreview(index); const record = read()[index]; if (!record) return; sec.querySelector('[data-report-preview-sheet]').innerHTML = `<div class="report-sheet-header"><div class="report-school-logo"><i class="fas fa-graduation-cap"></i></div><div><strong>EXCELLENCE INTERNATIONAL SCHOOL</strong><span>Abu Dhabi • United Arab Emirates</span><small>Excellence in Learning • Character • Leadership</small></div></div><div class="report-sheet-title"><h2>Student Report Card</h2><p>Academic Year <strong>${escape(record.year)}</strong> • ${escape(record.period)}</p></div><div class="report-student-details"><div class="report-detail-grid"><div><span>Student Name</span><strong>${escape(record.student)}</strong></div><div><span>Admission No.</span><strong>ADM-2026-00125</strong></div><div><span>Date of Birth</span><strong>14 March 2013</strong></div><div><span>Class / Section</span><strong>${escape(record.class)} - ${escape(record.section)}</strong></div><div><span>Academic Year</span><strong>${escape(record.year)}</strong></div><div><span>Report Card No.</span><strong>${escape(record.no)}</strong></div></div><div class="report-student-photo"><i class="fas fa-user"></i></div></div><table class="report-marks-table"><thead><tr><th>Subject</th><th>Max Marks</th><th>Obtained</th><th>Percentage</th><th>Grade</th><th>Remarks</th></tr></thead><tbody><tr><td>English Language</td><td>100</td><td>88</td><td>88%</td><td>A</td><td>Excellent</td></tr><tr><td>Mathematics</td><td>100</td><td>91</td><td>91%</td><td>A+</td><td>Outstanding</td></tr><tr><td>Science</td><td>100</td><td>86</td><td>86%</td><td>A</td><td>Excellent</td></tr><tr><td>Social Studies</td><td>100</td><td>81</td><td>81%</td><td>A</td><td>Very Good</td></tr><tr><td>Computer Science</td><td>100</td><td>84</td><td>84%</td><td>A</td><td>Very Good</td></tr><tr><td>Arabic</td><td>100</td><td>77</td><td>77%</td><td>B+</td><td>Good</td></tr></tbody></table><div class="report-sheet-summary"><div><span>Average</span><strong>${escape(record.average)}</strong></div><div><span>Overall Grade</span><strong>${escape(record.grade)}</strong></div><div><span>GPA</span><strong>${escape(record.gpa)}</strong></div><div><span>Attendance</span><strong>${escape(record.attendance)}</strong></div></div><div class="report-sheet-summary report-sheet-secondary-summary"><div><span>Class Position</span><strong>4 / 32</strong></div><div><span>Days Present</span><strong>92 / 96</strong></div></div><div class="report-remarks"><div><h4>Teacher's Remarks</h4><p>${escape(record.student)} has demonstrated excellent academic progress this term. He participates actively and consistently completes assignments.</p></div><div><h4>Principal's Remarks</h4><p>A very strong performance. Continue the excellent effort and maintain this level of commitment in the next term.</p></div></div><div class="report-signatures"><span>Parent / Guardian Signature</span><span>Class Teacher Signature</span><span>Principal / Headteacher Signature</span></div><div class="report-sheet-footer"><span>Generated by EduMaster School Management System</span><span>${escape(record.generated)}</span></div>`; };
        sec.querySelector('[data-report-new]').addEventListener('click', () => openForm()); sec.querySelector('[data-report-filter]').addEventListener('click', () => { showingPublished = !showingPublished; render(); }); sec.querySelector('[data-report-search]').addEventListener('input', render); sec.querySelectorAll('[data-report-close]').forEach(button => button.addEventListener('click', closeModal)); sec.querySelector('[data-report-preview-close]').addEventListener('click', () => preview.classList.add('hidden')); sec.querySelector('[data-report-print]').addEventListener('click', () => window.print());
        form.addEventListener('submit', event => { event.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; } const records = read(); const data = Object.fromEntries(new FormData(form).entries()); const index = data.editIndex; const existing = index === '' ? {} : records[Number(index)]; const status = data.publication; const record = { ...existing, no: existing?.no || `RC-${new Date().getFullYear()}-${String(records.length + 126).padStart(5, '0')}`, student: existing?.student || 'New Student', class: data.class, section: data.section, year: data.year, period: data.period, average: existing?.average || '0%', grade: existing?.grade || '-', gpa: existing?.gpa || '0.0', attendance: existing?.attendance || '0%', status, generated: formatDate(data.generatedDate) }; if (index === '') records.unshift(record); else records[Number(index)] = record; localStorage.setItem(storageKey, JSON.stringify(records)); closeModal(); render(); });
        table.addEventListener('click', event => { const button = event.target.closest('[data-report-action]'); if (!button) return; const index = Number(button.dataset.index); const records = read(); if (!records[index]) return; if (button.dataset.reportAction === 'edit') openForm(index); if (button.dataset.reportAction === 'view') openFullPreview(index); if (button.dataset.reportAction === 'publish') { records[index].status = 'Published'; localStorage.setItem(storageKey, JSON.stringify(records)); render(); } if (button.dataset.reportAction === 'archive') { records[index].status = 'Archived'; localStorage.setItem(storageKey, JSON.stringify(records)); render(); } });
        const addReportActions = () => { table.querySelectorAll('.report-row-actions').forEach(actions => { if (actions.querySelector('[data-report-action="generate"]')) return; const index = actions.querySelector('[data-report-action]')?.dataset.index; actions.insertAdjacentHTML('beforeend', `<button class="icon-button" type="button" data-report-action="generate" data-index="${index}" title="Generate PDF"><i class="fas fa-file-pdf"></i></button><button class="icon-button" type="button" data-report-action="print" data-index="${index}" title="Print"><i class="fas fa-print"></i></button><button class="icon-button" type="button" data-report-action="download" data-index="${index}" title="Download"><i class="fas fa-download"></i></button>`); }); };
        const downloadReport = index => { const record = read()[index]; if (!record) return; openFullPreview(index); const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escape(record.no)} Report Card</title></head><body>${sec.querySelector('[data-report-preview-sheet]').innerHTML}</body></html>`; const url = URL.createObjectURL(new Blob([html], { type: 'text/html' })); const link = document.createElement('a'); link.href = url; link.download = `${record.no}-Report-Card.html`; link.click(); URL.revokeObjectURL(url); };
        previewActions.querySelector('[data-report-download]').addEventListener('click', () => downloadReport(currentIndex)); const actionObserver = new MutationObserver(addReportActions); actionObserver.observe(table, { childList: true }); addReportActions();
        table.addEventListener('click', event => { const button = event.target.closest('[data-report-action]'); if (!button || !['generate', 'print', 'download'].includes(button.dataset.reportAction)) return; const index = Number(button.dataset.index); if (button.dataset.reportAction === 'generate') openFullPreview(index); if (button.dataset.reportAction === 'print') { openFullPreview(index); setTimeout(() => window.print(), 150); } if (button.dataset.reportAction === 'download') downloadReport(index); });
        render(); return sec;
    }

    function createReportsModule(category) {
        const sec = document.createElement('section');
        sec.className = 'module enquiries-module reports-module';
        sec.id = 'module_front_office_reports';
        sec.innerHTML = `
            <div class="module-header"><div><h2>Front Office Reports & Analytics</h2><p>Department: ${category}</p></div><button class="btn-primary" type="button" data-report-export><i class="fas fa-file-export"></i> Export Report</button></div>
            <div class="report-filter-bar"><label>Report Period <select data-report-period><option value="today">Today</option><option value="week" selected>This Week</option><option value="month">This Month</option><option value="all">All Records</option></select></label><button class="btn-primary" type="button" data-report-apply><i class="fas fa-filter"></i> Apply Filters</button></div>
            <div class="report-kpis"><div class="report-kpi"><span>Enquiries</span><strong data-report-kpi="enquiries">0</strong><small>Total recorded</small></div><div class="report-kpi"><span>Calls</span><strong data-report-kpi="calls">0</strong><small>Incoming and outgoing</small></div><div class="report-kpi"><span>Visitors</span><strong data-report-kpi="visitors">0</strong><small>Registered visitors</small></div><div class="report-kpi"><span>Appointments</span><strong data-report-kpi="appointments">0</strong><small>Scheduled visits</small></div><div class="report-kpi"><span>Follow-ups</span><strong data-report-kpi="followups">0</strong><small>Pending actions</small></div><div class="report-kpi"><span>Dispatch</span><strong data-report-kpi="dispatch">0</strong><small>Outgoing items</small></div><div class="report-kpi"><span>Incoming Mail</span><strong data-report-kpi="mail">0</strong><small>Received correspondence</small></div></div>
            <div class="reports-grid"><div class="enquiry-card"><div class="enquiry-card-header"><h3>Front Office Activity</h3><p>Activity distribution across the selected period.</p></div><div class="report-chart" data-report-chart></div></div><div class="enquiry-card"><div class="enquiry-card-header"><h3>Module Activity</h3><p>Activity by Front Office module.</p></div><div class="enquiry-card-body report-module-list" data-report-modules></div></div></div>
            <div class="enquiry-card report-section-card"><div class="enquiry-card-header"><h3>Operational Status</h3><p>Current Front Office workload.</p></div><div class="enquiry-card-body report-status-grid"><div><span>Open Enquiries</span><strong data-report-status="openEnquiries">0</strong></div><div><span>Visitors Inside</span><strong data-report-status="visitorsInside">0</strong></div><div><span>Pending Follow-ups</span><strong data-report-status="pendingFollowups">0</strong></div><div><span>Overdue Follow-ups</span><strong data-report-status="overdueFollowups">0</strong></div></div></div>
            <div class="enquiry-card report-section-card"><div class="enquiry-card-header"><h3>Front Office Activity Report</h3><p>Summary of all major reception activities.</p></div><div class="report-table-wrap"><table><thead><tr><th>Module</th><th>Total</th><th>Completed</th><th>Pending</th><th>Status</th></tr></thead><tbody data-report-table></tbody></table></div></div>
            <div class="enquiry-card report-section-card"><div class="enquiry-card-header"><h3>Quick Reports</h3><p>Common reports for Front Office management.</p></div><div class="enquiry-card-body quick-report-grid"><button type="button" data-quick-report="Daily Reception Register">Daily Reception Register</button><button type="button" data-quick-report="Visitor Report">Visitor Report</button><button type="button" data-quick-report="Enquiry Report">Enquiry Report</button><button type="button" data-quick-report="Call Log Report">Call Log Report</button><button type="button" data-quick-report="Appointment Report">Appointment Report</button><button type="button" data-quick-report="Mail Report">Incoming Mail Report</button><button type="button" data-quick-report="Dispatch Report">Dispatch Report</button><button type="button" data-quick-report="Follow-up Report">Follow-up Report</button></div></div>`;
        const keys = { enquiries: 'edumasterEnquiries', calls: 'edumasterCallLogs', visitors: 'edumasterVisitors', appointments: 'edumasterAppointments', followups: 'edumasterFollowUps', dispatch: 'edumasterDispatches', mail: 'edumasterIncomingMail' };
        const read = key => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch (error) { return []; } };
        const today = new Date().toISOString().slice(0, 10);
        const dataForPeriod = (items, period) => { if (period === 'all') return items; const days = period === 'today' ? 0 : period === 'month' ? 30 : 6; const from = new Date(); from.setDate(from.getDate() - days); return items.filter(item => { const date = item.createdAt || item.receivedDate || item.visitDate || item.appointmentDate || item.followUpDate || item.dispatchDate; return date && date >= from.toISOString().slice(0, 10) && date <= today; }); };
        const render = () => {
            const period = sec.querySelector('[data-report-period]').value; const data = Object.fromEntries(Object.entries(keys).map(([name, key]) => [name, dataForPeriod(read(key), period)]));
            Object.entries(data).forEach(([name, items]) => { sec.querySelector(`[data-report-kpi="${name}"]`).textContent = items.length; });
            const values = [['Enquiries', data.enquiries.length], ['Calls', data.calls.length], ['Visitors', data.visitors.length], ['Appointments', data.appointments.length], ['Mail', data.mail.length], ['Dispatch', data.dispatch.length], ['Follow-ups', data.followups.length]]; const max = Math.max(...values.map(item => item[1]), 1);
            sec.querySelector('[data-report-chart]').innerHTML = values.map(([label, value]) => `<div class="report-bar-item"><strong>${value}</strong><div class="report-bar" style="height:${Math.max(value / max * 180, 5)}px"></div><span>${label}</span></div>`).join(''); sec.querySelector('[data-report-modules]').innerHTML = values.map(([label, value]) => `<div class="report-module-row"><span>${label}</span><div><i style="width:${Math.max(value / max * 100, value ? 4 : 0)}%"></i></div><strong>${value}</strong></div>`).join('');
            const all = name => data[name] || []; const openEnquiries = all('enquiries').filter(item => !['completed', 'closed', 'resolved'].includes(String(item.status || '').toLowerCase())).length; const visitorsInside = all('visitors').filter(item => ['Checked In', 'In Meeting'].includes(item.status)).length; const pendingFollowups = all('followups').filter(item => !['Completed', 'Cancelled'].includes(item.status)).length; const overdueFollowups = all('followups').filter(item => item.followUpDate && item.followUpDate < today && !['Completed', 'Cancelled'].includes(item.status)).length; const statuses = { openEnquiries, visitorsInside, pendingFollowups, overdueFollowups }; Object.entries(statuses).forEach(([name, value]) => { sec.querySelector(`[data-report-status="${name}"]`).textContent = value; });
            const rows = [['Enquiries', data.enquiries], ['Call Logs', data.calls], ['Visitors', data.visitors], ['Appointments', data.appointments], ['Incoming Mail', data.mail], ['Dispatch', data.dispatch], ['Follow-ups', data.followups]]; sec.querySelector('[data-report-table]').innerHTML = rows.map(([name, items]) => { const completed = items.filter(item => ['Completed', 'Delivered', 'Collected', 'Checked Out', 'Resolved'].includes(item.status)).length; const pending = items.length - completed; const percent = items.length ? Math.round(completed / items.length * 100) : 0; return `<tr><td><strong>${name}</strong></td><td>${items.length}</td><td>${completed}</td><td>${pending}</td><td><span class="badge ${percent >= 75 ? 'badge-green' : percent >= 60 ? 'badge-orange' : 'badge-red'}">${percent >= 75 ? 'Good' : percent >= 60 ? 'Monitor' : 'Needs Attention'}</span></td></tr>`; }).join('');
        };
        const exportReport = () => { const rows = [['Front Office Report'], ['Module', 'Total'], ...Object.entries(keys).map(([name, key]) => [name, read(key).length])]; const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'front-office-report.csv'; link.click(); URL.revokeObjectURL(link.href); };
        sec.querySelector('[data-report-period]').addEventListener('change', render); sec.querySelector('[data-report-apply]').addEventListener('click', render); sec.querySelector('[data-report-export]').addEventListener('click', exportReport); sec.querySelectorAll('[data-quick-report]').forEach(button => button.addEventListener('click', () => alert(`${button.dataset.quickReport} selected.`))); render(); return sec;
    }

    function createFrontOfficeRecordsModule(label, category) {
        const moduleId = `module_${label.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
        const storageKey = `edumaster${label.replace(/[^a-z0-9]/gi, '')}`;
        const config = {
            'Visitor Logs': ['Visitor Name', 'Host / Department', 'Visit Date', 'Visit Status', 'Visitor log details'],
            'Announcements': ['Announcement Title', 'Audience', 'Publish Date', 'Status', 'Announcement details'],
            'Calendar': ['Event Title', 'Location / Owner', 'Event Date', 'Event Status', 'Event details'],
            'Documents': ['Document Name', 'Document Category', 'Upload Date', 'Access Status', 'Document notes'],
            'Notifications': ['Notification Title', 'Recipient / Module', 'Due Date', 'Notification Status', 'Notification details']
        }[label];
        const sec = document.createElement('section'); sec.className = 'module enquiries-module utility-module'; sec.id = moduleId;
        sec.innerHTML = `<div class="module-header"><div><h2>${label}</h2><p>Department: ${category}</p></div><button class="${['Visitor Logs', 'Announcements', 'Calendar', 'Documents', 'Notifications'].includes(label) ? 'btn-primary' : 'btn-secondary'}" type="button" data-utility-new><i class="fas fa-plus"></i> ${label === 'Documents' ? 'Add Document' : `New ${label.replace('Logs', 'Log')}`}</button></div><div class="utility-entry-card enquiry-card hidden"><div class="enquiry-card-header"><h3>${label} Entry</h3><p>Capture and manage Front Office records.</p></div><div class="enquiry-card-body"><form data-utility-form><div class="enquiry-form-grid"><div class="enquiry-form-group"><label>${config[0]}</label><input name="title" required></div><div class="enquiry-form-group"><label>${config[1]}</label><input name="owner"></div><div class="enquiry-form-group"><label>${config[2]}</label><input name="date" type="date" required></div><div class="enquiry-form-group"><label>${config[3]}</label><select name="status"><option>Open</option><option>Active</option><option>Published</option><option>Scheduled</option><option>Completed</option><option>Read</option><option>Archived</option></select></div><div class="enquiry-form-group full"><label>${config[4]}</label><textarea name="details"></textarea></div></div><div class="enquiry-form-actions"><button class="btn-secondary" type="reset">Clear</button><button class="btn-secondary" type="button" data-utility-cancel>Cancel</button><button class="btn-primary" type="submit"><i class="fas fa-save"></i> Save Record</button></div></form></div></div><div class="enquiries-table"><div class="table-card"><h3 class="table-title">${label} Register</h3><table><thead><tr><th>Title / Name</th><th>Owner / Recipient</th><th>Date</th><th>Status</th><th>Details</th><th>Actions</th></tr></thead><tbody data-utility-table></tbody></table></div></div>`;
        const form = sec.querySelector('[data-utility-form]'); const card = sec.querySelector('.utility-entry-card'); const table = sec.querySelector('[data-utility-table]'); let editingIndex = null;
        const read = () => { try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch (error) { return []; } }; const escape = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char])); const close = () => { card.classList.add('hidden'); form.reset(); editingIndex = null; };
        const render = () => { const records = read(); table.innerHTML = records.length ? records.map((record, index) => `<tr><td>${escape(record.title)}</td><td>${escape(record.owner || '-')}</td><td>${escape(record.date)}</td><td><span class="badge pending">${escape(record.status)}</span></td><td>${escape(record.details || '-')}</td><td><div class="enquiry-actions"><button class="enquiry-action" type="button" data-utility-action="edit" data-index="${index}" title="Edit"><i class="fas fa-pen"></i></button><button class="enquiry-action" type="button" data-utility-action="delete" data-index="${index}" title="Delete"><i class="fas fa-trash"></i></button><button class="enquiry-action" type="button" data-utility-action="print" data-index="${index}" title="Print"><i class="fas fa-print"></i></button></div></td></tr>`).join('') : `<tr><td colspan="6" style="text-align:center;padding:25px;color:#94a3b8;">No ${label.toLowerCase()} records yet.</td></tr>`; };
        sec.querySelector('[data-utility-new]').addEventListener('click', () => { if (!card.classList.contains('hidden')) { close(); return; } card.classList.remove('hidden'); form.elements.date.value = new Date().toISOString().slice(0, 10); form.elements.title.focus(); }); sec.querySelector('[data-utility-cancel]').addEventListener('click', close);
        form.addEventListener('submit', event => { event.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; } const records = read(); const record = Object.fromEntries(new FormData(form).entries()); record.createdAt = new Date().toISOString(); if (editingIndex === null) records.unshift(record); else records[editingIndex] = record; localStorage.setItem(storageKey, JSON.stringify(records)); close(); render(); window.dispatchEvent(new Event('front-office-data-changed')); });
        table.addEventListener('click', event => { const button = event.target.closest('[data-utility-action]'); if (!button) return; const records = read(); const index = Number(button.dataset.index); const record = records[index]; if (!record) return; if (button.dataset.utilityAction === 'delete') { if (!confirm(`Delete ${record.title || 'this record'}?`)) return; records.splice(index, 1); localStorage.setItem(storageKey, JSON.stringify(records)); render(); return; } if (button.dataset.utilityAction === 'edit') { Object.entries(record).forEach(([name, value]) => { if (form.elements[name]) form.elements[name].value = value; }); editingIndex = index; card.classList.remove('hidden'); return; } const printWindow = window.open('', '_blank', 'width=700,height=600'); if (!printWindow) return; printWindow.document.write(`<html><head><title>${escape(label)}</title></head><body style="font-family:Arial;padding:30px"><h1>${escape(label)}</h1>${Object.entries(record).map(([name, value]) => `<p><strong>${escape(name)}:</strong> ${escape(value || '-')}</p>`).join('')}</body></html>`); printWindow.document.close(); printWindow.print(); }); render(); return sec;
    }

    function createFollowUpsModule(category) {
        const sec = document.createElement('section');
        sec.className = 'module enquiries-module follow-ups-module';
        sec.id = 'module_follow_ups';
        sec.innerHTML = `
            <div class="module-header"><div><h2>Follow-ups</h2><p>Department: ${category}</p></div><button class="btn-secondary" type="button" data-enquiry-new><i class="fas fa-plus"></i> New Follow-up</button></div>
            <div class="enquiries-stats"><div class="enquiry-stat"><span>Open</span><strong data-followup-open>0</strong></div><div class="enquiry-stat"><span>Due Today</span><strong data-followup-today>0</strong></div><div class="enquiry-stat"><span>Overdue</span><strong data-followup-overdue>0</strong></div><div class="enquiry-stat"><span>In Progress</span><strong data-followup-progress>0</strong></div><div class="enquiry-stat"><span>Completed</span><strong data-followup-completed>0</strong></div></div>
            <div class="enquiries-grid"><div class="enquiry-card enquiry-entry-card hidden"><div class="enquiry-card-header"><h3>Follow-up Registration</h3><p>Record and track every pending Front Office action.</p></div><div class="enquiry-card-body"><form data-enquiry-form><div class="enquiry-form-grid">
                <div class="enquiry-form-group"><label>Follow-up ID</label><input name="followUpId" readonly></div><div class="enquiry-form-group"><label>Date Created</label><input name="createdDate" type="date" required></div><div class="enquiry-form-group"><label>Related Module</label><select name="relatedModule" required><option value="">Select module</option><option>Enquiries</option><option>Call Logs</option><option>Dispatch</option><option>Visitors</option><option>Appointments</option><option>Incoming Mail</option><option>General Front Desk</option></select></div><div class="enquiry-form-group"><label>Related Reference</label><input name="relatedReference" placeholder="e.g. ENQ-2026-00015"></div><div class="enquiry-form-group full"><label>Follow-up Subject</label><input name="subject" placeholder="What needs to be followed up?" required></div>
                <div class="enquiry-form-group"><label>Person / Contact Name</label><input name="contactName" placeholder="Full name" required></div><div class="enquiry-form-group"><label>Contact Type</label><select name="contactType"><option>Parent / Guardian</option><option>Student</option><option>Staff</option><option>Visitor</option><option>Supplier / Courier</option><option>Company / Organization</option><option>Government Office</option><option>Other</option></select></div><div class="enquiry-form-group"><label>Phone</label><input name="phone" type="tel" placeholder="+256 700 000000"></div><div class="enquiry-form-group"><label>Email</label><input name="email" type="email" placeholder="example@email.com"></div>
                <div class="enquiry-form-group"><label>Assigned To</label><input name="assignedTo" placeholder="Receptionist / staff member" required></div><div class="enquiry-form-group"><label>Priority</label><select name="priority"><option>Normal</option><option>Important</option><option>Urgent</option><option>VIP</option></select></div><div class="enquiry-form-group"><label>Follow-up Date</label><input name="followUpDate" type="date" required></div><div class="enquiry-form-group"><label>Preferred Time</label><input name="followUpTime" type="time"></div><div class="enquiry-form-group"><label>Follow-up Method</label><select name="followUpMethod"><option>Phone Call</option><option>SMS</option><option>Email</option><option>WhatsApp</option><option>In Person</option><option>Internal Message</option><option>Other</option></select></div><div class="enquiry-form-group"><label>Status</label><select name="status"><option>Open</option><option>In Progress</option><option>Waiting</option><option>Completed</option><option>Cancelled</option></select></div>
                <div class="enquiry-form-group full"><label>Description / Required Action</label><textarea name="description" placeholder="Describe what needs to be done" required></textarea></div><div class="enquiry-form-group full"><label>Last Action Taken</label><textarea name="lastAction" placeholder="What has already been done?"></textarea></div><div class="enquiry-form-group full"><label>Next Action</label><textarea name="nextAction" placeholder="What should happen next?"></textarea></div><div class="enquiry-form-group full"><label>Resolution</label><textarea name="resolution" placeholder="Enter final resolution once completed"></textarea></div><div class="enquiry-form-group full"><label>Notes</label><textarea name="notes" placeholder="Additional notes"></textarea></div>
            </div><div class="enquiry-form-actions"><button class="btn-secondary" type="reset" data-enquiry-clear>Clear</button><button class="btn-secondary" type="button" data-enquiry-cancel>Cancel</button><button class="btn-primary" type="submit"><i class="fas fa-save"></i> Save Follow-up</button></div></form></div></div>
            <aside class="enquiry-card enquiry-summary-card hidden"><div class="enquiry-card-header"><h3>Follow-up Summary</h3><p>Review before saving.</p></div><div class="enquiry-card-body enquiry-summary"><div class="enquiry-summary-row"><span>ID</span><strong data-summary="followUpId">-</strong></div><div class="enquiry-summary-row"><span>Module</span><strong data-summary="relatedModule">-</strong></div><div class="enquiry-summary-row"><span>Subject</span><strong data-summary="subject">-</strong></div><div class="enquiry-summary-row"><span>Contact</span><strong data-summary="contactName">-</strong></div><div class="enquiry-summary-row"><span>Assigned To</span><strong data-summary="assignedTo">-</strong></div><div class="enquiry-summary-row"><span>Due Date</span><strong data-summary="followUpDate">-</strong></div><div class="enquiry-summary-row"><span>Priority</span><strong data-summary="priority">Normal</strong></div><div class="enquiry-summary-row"><span>Status</span><strong data-summary="status">Open</strong></div></div></aside></div>
            <div class="enquiries-table"><div class="table-card"><h3 class="table-title">Follow-up Register</h3><table><thead><tr><th>ID</th><th>Due Date</th><th>Module</th><th>Subject</th><th>Contact</th><th>Assigned To</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead><tbody data-enquiry-table></tbody></table></div></div>`;
        const form = sec.querySelector('[data-enquiry-form]'); const table = sec.querySelector('[data-enquiry-table]'); const entryCard = sec.querySelector('.enquiry-entry-card'); const summaryCard = sec.querySelector('.enquiry-summary-card'); const storageKey = 'edumasterFollowUps'; let editingIndex = null;
        const readEntries = () => { try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch (error) { return []; } }; const escape = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char])); const today = () => new Date().toISOString().slice(0, 10); const nextId = () => `FU-${new Date().getFullYear()}-${String(readEntries().length + 1).padStart(5, '0')}`;
        const isOverdue = entry => !['Completed', 'Cancelled'].includes(entry.status) && entry.followUpDate && entry.followUpDate < today();
        const updateStats = () => { const entries = readEntries(); sec.querySelector('[data-followup-open]').textContent = entries.filter(entry => entry.status === 'Open').length; sec.querySelector('[data-followup-today]').textContent = entries.filter(entry => entry.followUpDate === today() && !['Completed', 'Cancelled'].includes(entry.status)).length; sec.querySelector('[data-followup-overdue]').textContent = entries.filter(isOverdue).length; sec.querySelector('[data-followup-progress]').textContent = entries.filter(entry => entry.status === 'In Progress').length; sec.querySelector('[data-followup-completed]').textContent = entries.filter(entry => entry.status === 'Completed').length; };
        const render = () => { const entries = readEntries(); updateStats(); table.innerHTML = entries.length ? entries.slice(0, 8).map((entry, index) => `<tr><td>${escape(entry.followUpId)}</td><td>${escape(entry.followUpDate)}${isOverdue(entry) ? '<br><span class="badge badge-red">OVERDUE</span>' : ''}</td><td>${escape(entry.relatedModule)}</td><td>${escape(entry.subject)}</td><td>${escape(entry.contactName)}<br><small>${escape(entry.phone)}</small></td><td>${escape(entry.assignedTo)}</td><td>${escape(entry.priority)}</td><td><span class="badge pending">${escape(entry.status)}</span></td><td><div class="enquiry-actions"><button class="enquiry-action" type="button" data-enquiry-action="edit" data-enquiry-index="${index}" title="Edit"><i class="fas fa-pen"></i></button><button class="enquiry-action" type="button" data-enquiry-action="complete" data-enquiry-index="${index}" title="Complete"><i class="fas fa-check"></i></button><button class="enquiry-action" type="button" data-enquiry-action="delete" data-enquiry-index="${index}" title="Delete"><i class="fas fa-trash"></i></button><button class="enquiry-action" type="button" data-enquiry-action="print" data-enquiry-index="${index}" title="Print"><i class="fas fa-print"></i></button></div></td></tr>`).join('') : '<tr><td colspan="9" style="text-align:center;padding:25px;color:#94a3b8;">No follow-ups yet. Open New Follow-up to create a record.</td></tr>'; };
        const updateSummary = () => form.querySelectorAll('[name]').forEach(field => { const summary = sec.querySelector(`[data-summary="${field.name}"]`); if (summary) summary.textContent = field.value || (field.name === 'priority' ? 'Normal' : field.name === 'status' ? 'Open' : '-'); }); const closeForm = () => { entryCard.classList.add('hidden'); summaryCard.classList.add('hidden'); form.reset(); editingIndex = null; updateSummary(); }; const openForm = () => { entryCard.classList.remove('hidden'); summaryCard.classList.remove('hidden'); if (editingIndex === null) { form.reset(); form.elements.followUpId.value = nextId(); form.elements.createdDate.value = today(); form.elements.followUpDate.value = today(); form.elements.priority.value = 'Normal'; form.elements.status.value = 'Open'; } updateSummary(); form.elements.relatedModule.focus(); };
        form.addEventListener('input', updateSummary); form.addEventListener('change', updateSummary); form.addEventListener('reset', () => setTimeout(updateSummary)); form.addEventListener('submit', event => { event.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; } const data = Object.fromEntries(new FormData(form).entries()); data.id = data.id || Date.now().toString(); data.updatedAt = new Date().toISOString(); const entries = readEntries(); if (editingIndex === null) entries.unshift(data); else { data.id = entries[editingIndex].id || data.id; entries[editingIndex] = data; } localStorage.setItem(storageKey, JSON.stringify(entries)); closeForm(); render(); });
        sec.querySelector('[data-enquiry-new]').addEventListener('click', () => entryCard.classList.contains('hidden') ? openForm() : closeForm()); sec.querySelector('[data-enquiry-cancel]').addEventListener('click', closeForm);
        table.addEventListener('click', event => { const button = event.target.closest('[data-enquiry-action]'); if (!button) return; const entries = readEntries(); const index = Number(button.dataset.enquiryIndex); const entry = entries[index]; if (!entry) return; const action = button.dataset.enquiryAction; if (action === 'delete') { if (!confirm(`Delete ${entry.followUpId || 'this follow-up'}?`)) return; entries.splice(index, 1); localStorage.setItem(storageKey, JSON.stringify(entries)); render(); return; } if (action === 'complete') { entry.status = 'Completed'; entry.resolution = entry.resolution || 'Follow-up completed.'; localStorage.setItem(storageKey, JSON.stringify(entries)); render(); return; } if (action === 'edit') { Object.entries(entry).forEach(([name, value]) => { if (form.elements[name]) form.elements[name].value = value; }); editingIndex = index; openForm(); return; } const printWindow = window.open('', '_blank', 'width=700,height=700'); if (!printWindow) return; printWindow.document.write(`<html><head><title>Follow-up Record</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#172033}h1{font-size:22px;border-bottom:2px solid #4f46e5;padding-bottom:10px}.row{padding:9px 0;border-bottom:1px solid #e2e8f0}.label{font-weight:bold;display:inline-block;width:180px}</style></head><body><h1>Follow-up Record</h1>${Object.entries(entry).filter(([name]) => name !== 'id').map(([name, value]) => `<div class="row"><span class="label">${escape(name)}</span>${escape(value || '-')}</div>`).join('')}</body></html>`); printWindow.document.close(); printWindow.focus(); printWindow.print(); });
        render(); return sec;
    }

    function createIncomingMailModule(category) {
        const sec = document.createElement('section');
        sec.className = 'module enquiries-module incoming-mail-module';
        sec.id = 'module_incoming_mail';
        sec.innerHTML = `
            <div class="module-header"><div><h2>Incoming Mail</h2><p>Department: ${category}</p></div><button class="btn-secondary" type="button" data-enquiry-new><i class="fas fa-plus"></i> Register Incoming Mail</button></div>
            <div class="enquiries-stats"><div class="enquiry-stat"><span>Today's Mail</span><strong data-mail-today>0</strong></div><div class="enquiry-stat"><span>Pending Delivery</span><strong data-mail-pending>0</strong></div><div class="enquiry-stat"><span>Delivered</span><strong data-mail-delivered>0</strong></div><div class="enquiry-stat"><span>Official / Important</span><strong data-mail-important>0</strong></div><div class="enquiry-stat"><span>Returned</span><strong data-mail-returned>0</strong></div></div>
            <div class="enquiries-grid"><div class="enquiry-card enquiry-entry-card hidden"><div class="enquiry-card-header"><h3>Incoming Mail Registration</h3><p>Register letters, documents, courier packages and official correspondence.</p></div><div class="enquiry-card-body"><form data-enquiry-form><div class="enquiry-form-grid">
                <div class="enquiry-form-group"><label>Mail Reference No.</label><input name="mailId" readonly></div><div class="enquiry-form-group"><label>Date Received</label><input name="receivedDate" type="date" required></div><div class="enquiry-form-group"><label>Time Received</label><input name="receivedTime" type="time" required></div><div class="enquiry-form-group"><label>Mail Type</label><select name="mailType" required><option value="">Select mail type</option><option>Official Letter</option><option>Parent Letter</option><option>Student Document</option><option>Government Correspondence</option><option>Courier</option><option>Parcel / Package</option><option>Invoice</option><option>Legal Document</option><option>Certificate</option><option>Invitation</option><option>Other</option></select></div><div class="enquiry-form-group"><label>Delivery Method</label><select name="deliveryMethod"><option>Postal Mail</option><option>Courier</option><option>Hand Delivered</option><option>Internal Transfer</option><option>Government Delivery</option><option>Other</option></select></div><div class="enquiry-form-group"><label>Tracking / Reference Number</label><input name="trackingNumber" placeholder="Courier or postal tracking number"></div>
                <div class="enquiry-form-group"><label>Sender Name</label><input name="senderName" placeholder="Full name / organization" required></div><div class="enquiry-form-group"><label>Sender Organization</label><input name="senderOrganization" placeholder="Company or institution"></div><div class="enquiry-form-group"><label>Sender Phone</label><input name="senderPhone" type="tel" placeholder="+256 700 000000"></div><div class="enquiry-form-group"><label>Sender Email</label><input name="senderEmail" type="email" placeholder="sender@example.com"></div><div class="enquiry-form-group full"><label>Sender Address</label><textarea name="senderAddress" placeholder="Sender address"></textarea></div>
                <div class="enquiry-form-group full"><label>Subject / Description</label><input name="subject" placeholder="Brief subject or description" required></div><div class="enquiry-form-group"><label>Number of Documents</label><input name="documentCount" type="number" min="1" value="1"></div><div class="enquiry-form-group"><label>Package Count</label><input name="packageCount" type="number" min="0" value="0"></div><div class="enquiry-form-group"><label>Confidentiality</label><select name="confidentiality"><option>Normal</option><option>Confidential</option><option>Strictly Confidential</option></select></div><div class="enquiry-form-group"><label>Priority</label><select name="priority"><option>Normal</option><option>Important</option><option>Urgent</option><option>VIP</option></select></div><div class="enquiry-form-group full"><label>Additional Description</label><textarea name="description" placeholder="Additional mail details"></textarea></div>
                <div class="enquiry-form-group"><label>Department</label><select name="department" required><option value="">Select department</option><option>Principal's Office</option><option>Administration</option><option>Admissions</option><option>Accounts / Finance</option><option>Human Resources</option><option>Academic</option><option>Student Affairs</option><option>Transport</option><option>IT</option><option>Library</option><option>Reception</option><option>Other</option></select></div><div class="enquiry-form-group"><label>Recipient / Addressee</label><input name="recipient" placeholder="Person who should receive the mail" required></div><div class="enquiry-form-group"><label>Internal Reference</label><input name="internalReference" placeholder="Employee, student or department ref"></div><div class="enquiry-form-group"><label>Expected Delivery Date</label><input name="expectedDate" type="date"></div><div class="enquiry-form-group"><label>Mail Status</label><select name="status"><option>Received</option><option>Pending Delivery</option><option>Delivered</option><option>Collected</option><option>Returned</option><option>Lost / Missing</option></select></div><div class="enquiry-form-group"><label>Notification Method</label><select name="notificationMethod"><option>Phone</option><option>SMS</option><option>Email</option><option>WhatsApp</option><option>Internal Message</option><option>Not Notified</option></select></div>
                <div class="enquiry-form-group"><label>Received By</label><input name="receivedBy" placeholder="Reception staff" required></div><div class="enquiry-form-group"><label>Delivered By</label><input name="deliveredBy" placeholder="Staff member who delivered it"></div><div class="enquiry-form-group"><label>Delivery Date</label><input name="deliveryDate" type="date"></div><div class="enquiry-form-group"><label>Delivery Time</label><input name="deliveryTime" type="time"></div><div class="enquiry-form-group"><label>Recipient Confirmation</label><select name="confirmation"><option>Pending</option><option>Verbal Confirmation</option><option>Signed</option><option>Email Confirmation</option><option>Digital Confirmation</option></select></div><div class="enquiry-form-group"><label>Storage Location</label><input name="storageLocation" placeholder="Reception shelf or cabinet"></div><div class="enquiry-form-group full"><label>Notes</label><textarea name="notes" placeholder="Additional notes or delivery attempts"></textarea></div>
            </div><div class="enquiry-form-actions"><button class="btn-secondary" type="reset" data-enquiry-clear>Clear</button><button class="btn-secondary" type="button" data-enquiry-cancel>Cancel</button><button class="btn-primary" type="submit"><i class="fas fa-save"></i> Register Incoming Mail</button></div></form></div></div>
            <aside class="enquiry-card enquiry-summary-card hidden"><div class="enquiry-card-header"><h3>Mail Summary</h3><p>Review before registering.</p></div><div class="enquiry-card-body enquiry-summary"><div class="enquiry-summary-row"><span>Reference</span><strong data-summary="mailId">-</strong></div><div class="enquiry-summary-row"><span>Sender</span><strong data-summary="senderName">-</strong></div><div class="enquiry-summary-row"><span>Mail Type</span><strong data-summary="mailType">-</strong></div><div class="enquiry-summary-row"><span>Received</span><strong data-summary="receivedDate">-</strong></div><div class="enquiry-summary-row"><span>Subject</span><strong data-summary="subject">-</strong></div><div class="enquiry-summary-row"><span>Recipient</span><strong data-summary="recipient">-</strong></div><div class="enquiry-summary-row"><span>Department</span><strong data-summary="department">-</strong></div><div class="enquiry-summary-row"><span>Priority</span><strong data-summary="priority">Normal</strong></div><div class="enquiry-summary-row"><span>Status</span><strong data-summary="status">Received</strong></div></div></aside></div>
            <div class="enquiries-table"><div class="table-card"><h3 class="table-title">Incoming Mail Register</h3><table><thead><tr><th>Reference</th><th>Received</th><th>Sender</th><th>Type</th><th>Subject</th><th>Recipient</th><th>Department</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead><tbody data-enquiry-table></tbody></table></div></div>`;
        const form = sec.querySelector('[data-enquiry-form]'); const table = sec.querySelector('[data-enquiry-table]'); const entryCard = sec.querySelector('.enquiry-entry-card'); const summaryCard = sec.querySelector('.enquiry-summary-card'); const storageKey = 'edumasterIncomingMail'; let editingIndex = null;
        const readEntries = () => { try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch (error) { return []; } }; const escape = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char])); const today = () => new Date().toISOString().slice(0, 10); const nextId = () => `MAIL-${new Date().getFullYear()}-${String(readEntries().length + 1).padStart(5, '0')}`;
        const updateStats = () => { const entries = readEntries(); sec.querySelector('[data-mail-today]').textContent = entries.filter(entry => entry.receivedDate === today()).length; sec.querySelector('[data-mail-pending]').textContent = entries.filter(entry => ['Received', 'Pending Delivery'].includes(entry.status)).length; sec.querySelector('[data-mail-delivered]').textContent = entries.filter(entry => ['Delivered', 'Collected'].includes(entry.status)).length; sec.querySelector('[data-mail-important]').textContent = entries.filter(entry => ['Important', 'Urgent', 'VIP'].includes(entry.priority)).length; sec.querySelector('[data-mail-returned]').textContent = entries.filter(entry => entry.status === 'Returned').length; };
        const render = () => { const entries = readEntries(); updateStats(); table.innerHTML = entries.length ? entries.slice(0, 8).map((entry, index) => `<tr><td>${escape(entry.mailId)}</td><td>${escape(entry.receivedDate)}<br><small>${escape(entry.receivedTime)}</small></td><td>${escape(entry.senderName)}<br><small>${escape(entry.senderOrganization)}</small></td><td>${escape(entry.mailType)}</td><td>${escape(entry.subject)}</td><td>${escape(entry.recipient)}</td><td>${escape(entry.department)}</td><td>${escape(entry.priority)}</td><td><span class="badge pending">${escape(entry.status)}</span></td><td><div class="enquiry-actions"><button class="enquiry-action" type="button" data-enquiry-action="edit" data-enquiry-index="${index}" title="Edit"><i class="fas fa-pen"></i></button><button class="enquiry-action" type="button" data-enquiry-action="deliver" data-enquiry-index="${index}" title="Mark delivered"><i class="fas fa-check"></i></button><button class="enquiry-action" type="button" data-enquiry-action="return" data-enquiry-index="${index}" title="Return"><i class="fas fa-rotate-left"></i></button><button class="enquiry-action" type="button" data-enquiry-action="delete" data-enquiry-index="${index}" title="Delete"><i class="fas fa-trash"></i></button><button class="enquiry-action" type="button" data-enquiry-action="print" data-enquiry-index="${index}" title="Print"><i class="fas fa-print"></i></button></div></td></tr>`).join('') : '<tr><td colspan="10" style="text-align:center;padding:25px;color:#94a3b8;">No incoming mail records yet. Open Register Incoming Mail to create a record.</td></tr>'; };
        const updateSummary = () => form.querySelectorAll('[name]').forEach(field => { const summary = sec.querySelector(`[data-summary="${field.name}"]`); if (summary) summary.textContent = field.value || (field.name === 'priority' ? 'Normal' : field.name === 'status' ? 'Received' : '-'); }); const closeForm = () => { entryCard.classList.add('hidden'); summaryCard.classList.add('hidden'); form.reset(); editingIndex = null; updateSummary(); }; const openForm = () => { entryCard.classList.remove('hidden'); summaryCard.classList.remove('hidden'); if (editingIndex === null) { form.reset(); form.elements.mailId.value = nextId(); form.elements.receivedDate.value = today(); form.elements.receivedTime.value = new Date().toTimeString().slice(0, 5); form.elements.documentCount.value = 1; form.elements.packageCount.value = 0; form.elements.confidentiality.value = 'Normal'; form.elements.priority.value = 'Normal'; form.elements.status.value = 'Received'; form.elements.notificationMethod.value = 'Not Notified'; form.elements.confirmation.value = 'Pending'; } updateSummary(); form.elements.mailType.focus(); };
        form.addEventListener('input', updateSummary); form.addEventListener('change', updateSummary); form.addEventListener('reset', () => setTimeout(updateSummary)); form.addEventListener('submit', event => { event.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; } const data = Object.fromEntries(new FormData(form).entries()); data.id = data.id || Date.now().toString(); data.createdAt = new Date().toISOString(); const entries = readEntries(); if (editingIndex === null) entries.unshift(data); else { data.id = entries[editingIndex].id || data.id; data.createdAt = entries[editingIndex].createdAt || data.createdAt; entries[editingIndex] = data; } localStorage.setItem(storageKey, JSON.stringify(entries)); closeForm(); render(); });
        sec.querySelector('[data-enquiry-new]').addEventListener('click', () => entryCard.classList.contains('hidden') ? openForm() : closeForm()); sec.querySelector('[data-enquiry-cancel]').addEventListener('click', closeForm);
        table.addEventListener('click', event => { const button = event.target.closest('[data-enquiry-action]'); if (!button) return; const entries = readEntries(); const index = Number(button.dataset.enquiryIndex); const entry = entries[index]; if (!entry) return; const action = button.dataset.enquiryAction; if (action === 'delete') { if (!confirm(`Delete ${entry.mailId || 'this mail record'}?`)) return; entries.splice(index, 1); localStorage.setItem(storageKey, JSON.stringify(entries)); render(); return; } if (action === 'deliver') { entry.status = 'Delivered'; entry.deliveryDate = today(); entry.deliveryTime = new Date().toTimeString().slice(0, 5); entry.deliveredBy = entry.deliveredBy || 'Reception'; localStorage.setItem(storageKey, JSON.stringify(entries)); render(); return; } if (action === 'return') { if (!confirm(`Mark ${entry.mailId || 'this mail'} as returned?`)) return; entry.status = 'Returned'; localStorage.setItem(storageKey, JSON.stringify(entries)); render(); return; } if (action === 'edit') { Object.entries(entry).forEach(([name, value]) => { if (form.elements[name]) form.elements[name].value = value; }); editingIndex = index; openForm(); return; } const printWindow = window.open('', '_blank', 'width=700,height=700'); if (!printWindow) return; printWindow.document.write(`<html><head><title>Incoming Mail Record</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#172033}h1{font-size:22px;border-bottom:2px solid #4f46e5;padding-bottom:10px}.row{padding:9px 0;border-bottom:1px solid #e2e8f0}.label{font-weight:bold;display:inline-block;width:180px}</style></head><body><h1>Incoming Mail Record</h1>${Object.entries(entry).filter(([name]) => name !== 'id').map(([name, value]) => `<div class="row"><span class="label">${escape(name)}</span>${escape(value || '-')}</div>`).join('')}</body></html>`); printWindow.document.close(); printWindow.focus(); printWindow.print(); });
        render(); return sec;
    }

    function createAppointmentsModule(category) {
        const sec = document.createElement('section');
        sec.className = 'module enquiries-module appointments-module';
        sec.id = 'module_appointments';
        sec.innerHTML = `
            <div class="module-header"><div><h2>Appointments</h2><p>Department: ${category}</p></div><button class="btn-secondary" type="button" data-enquiry-new><i class="fas fa-plus"></i> New Appointment</button></div>
            <div class="enquiries-stats">
                <div class="enquiry-stat"><span>Today's Appointments</span><strong data-appointment-today>0</strong></div><div class="enquiry-stat"><span>Scheduled</span><strong data-appointment-scheduled>0</strong></div><div class="enquiry-stat"><span>Checked In</span><strong data-appointment-checked>0</strong></div><div class="enquiry-stat"><span>Completed</span><strong data-appointment-completed>0</strong></div><div class="enquiry-stat"><span>Cancelled</span><strong data-appointment-cancelled>0</strong></div>
            </div>
            <div class="enquiries-grid">
                <div class="enquiry-card enquiry-entry-card hidden"><div class="enquiry-card-header"><h3>Appointment Registration</h3><p>Schedule a meeting, visit, or school appointment.</p></div><div class="enquiry-card-body"><form data-enquiry-form>
                    <div class="enquiry-form-grid">
                        <div class="enquiry-form-group"><label>Appointment ID</label><input name="appointmentId" readonly></div><div class="enquiry-form-group"><label>Appointment Type</label><select name="appointmentType" required><option value="">Select appointment type</option><option>Parent Meeting</option><option>Admission Meeting</option><option>Principal Meeting</option><option>Teacher Meeting</option><option>Student Meeting</option><option>Staff Meeting</option><option>Vendor / Supplier</option><option>Government / Official</option><option>Counselling</option><option>Other</option></select></div>
                        <div class="enquiry-form-group"><label>Appointment Date</label><input name="appointmentDate" type="date" required></div><div class="enquiry-form-group"><label>Appointment Time</label><input name="appointmentTime" type="time" required></div><div class="enquiry-form-group"><label>Duration</label><select name="duration"><option>15 minutes</option><option selected>30 minutes</option><option>45 minutes</option><option>1 hour</option><option>1.5 hours</option><option>2 hours</option></select></div><div class="enquiry-form-group"><label>Priority</label><select name="priority"><option>Normal</option><option>Important</option><option>High</option><option>VIP</option></select></div>
                        <div class="enquiry-form-group"><label>Visitor / Guest Name</label><input name="guestName" placeholder="Enter full name" required></div><div class="enquiry-form-group"><label>Visitor Type</label><select name="visitorType" required><option value="">Select visitor type</option><option>Parent / Guardian</option><option>Prospective Parent</option><option>Student</option><option>Staff</option><option>Supplier / Vendor</option><option>Contractor</option><option>Government Official</option><option>Guest / VIP</option><option>Alumni</option><option>Other</option></select></div>
                        <div class="enquiry-form-group"><label>Phone Number</label><input name="phone" type="tel" placeholder="+256 700 000000" required></div><div class="enquiry-form-group"><label>Email Address</label><input name="email" type="email" placeholder="guest@example.com"></div><div class="enquiry-form-group"><label>Organization / Company</label><input name="organization" placeholder="Organization name"></div><div class="enquiry-form-group"><label>Student / Employee ID</label><input name="relatedId" placeholder="If applicable"></div>
                        <div class="enquiry-form-group"><label>Person to Visit</label><input name="personToVisit" placeholder="Principal, teacher, staff" required></div><div class="enquiry-form-group"><label>Department</label><select name="department" required><option value="">Select department</option><option>Principal's Office</option><option>Administration</option><option>Admissions</option><option>Accounts / Finance</option><option>Human Resources</option><option>Academic</option><option>Student Affairs</option><option>Transport</option><option>IT</option><option>Reception</option><option>Other</option></select></div><div class="enquiry-form-group"><label>Meeting Location</label><input name="location" placeholder="Office / Meeting Room"></div><div class="enquiry-form-group"><label>Number of Guests</label><input name="guestCount" type="number" min="1" value="1"></div>
                        <div class="enquiry-form-group full"><label>Purpose / Meeting Agenda</label><textarea name="purpose" placeholder="Describe the purpose or agenda" required></textarea></div><div class="enquiry-form-group full"><label>Special Requirements</label><textarea name="requirements" placeholder="Accessibility, documents, room setup, equipment"></textarea></div>
                        <div class="enquiry-form-group"><label>Appointment Status</label><select name="status"><option>Scheduled</option><option>Confirmed</option><option>Checked In</option><option>In Progress</option><option>Completed</option><option>Cancelled</option><option>No Show</option><option>Rescheduled</option></select></div><div class="enquiry-form-group"><label>Confirmation Method</label><select name="confirmationMethod"><option>Phone</option><option>Email</option><option>SMS</option><option>WhatsApp</option><option>In Person</option><option>Not Confirmed</option></select></div><div class="enquiry-form-group"><label>Reminder Date</label><input name="reminderDate" type="date"></div><div class="enquiry-form-group"><label>Created By</label><input name="createdBy" placeholder="Reception staff member" required></div><div class="enquiry-form-group"><label>Host Contact</label><input name="hostPhone" type="tel" placeholder="Host contact number"></div><div class="enquiry-form-group"><label>Visitor ID</label><input name="visitorId" placeholder="Linked visitor ID"></div><div class="enquiry-form-group full"><label>Notes</label><textarea name="notes" placeholder="Additional appointment notes"></textarea></div>
                    </div><div class="enquiry-form-actions"><button class="btn-secondary" type="reset" data-enquiry-clear>Clear</button><button class="btn-secondary" type="button" data-enquiry-cancel>Cancel</button><button class="btn-primary" type="submit"><i class="fas fa-save"></i> Save Appointment</button></div>
                </form></div></div>
                <aside class="enquiry-card enquiry-summary-card hidden"><div class="enquiry-card-header"><h3>Appointment Summary</h3><p>Review before saving.</p></div><div class="enquiry-card-body enquiry-summary"><div class="enquiry-summary-row"><span>Appointment ID</span><strong data-summary="appointmentId">-</strong></div><div class="enquiry-summary-row"><span>Guest</span><strong data-summary="guestName">-</strong></div><div class="enquiry-summary-row"><span>Type</span><strong data-summary="appointmentType">-</strong></div><div class="enquiry-summary-row"><span>Date</span><strong data-summary="appointmentDate">-</strong></div><div class="enquiry-summary-row"><span>Time</span><strong data-summary="appointmentTime">-</strong></div><div class="enquiry-summary-row"><span>Visiting</span><strong data-summary="personToVisit">-</strong></div><div class="enquiry-summary-row"><span>Department</span><strong data-summary="department">-</strong></div><div class="enquiry-summary-row"><span>Status</span><strong data-summary="status">Scheduled</strong></div></div></aside>
            </div>
            <div class="enquiries-table"><div class="table-card"><h3 class="table-title">Appointment Register</h3><table><thead><tr><th>Appointment ID</th><th>Guest</th><th>Type</th><th>Date</th><th>Time</th><th>Visiting</th><th>Department</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead><tbody data-enquiry-table></tbody></table></div></div>`;
        const form = sec.querySelector('[data-enquiry-form]'); const table = sec.querySelector('[data-enquiry-table]'); const entryCard = sec.querySelector('.enquiry-entry-card'); const summaryCard = sec.querySelector('.enquiry-summary-card'); const storageKey = 'edumasterAppointments'; let editingIndex = null;
        const readEntries = () => { try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch (error) { return []; } }; const escape = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char])); const today = () => new Date().toISOString().slice(0, 10); const nextId = () => `APT-${new Date().getFullYear()}-${String(readEntries().length + 1).padStart(5, '0')}`;
        const updateStats = () => { const entries = readEntries().filter(entry => entry.appointmentDate === today()); sec.querySelector('[data-appointment-today]').textContent = entries.length; sec.querySelector('[data-appointment-scheduled]').textContent = entries.filter(entry => ['Scheduled', 'Confirmed'].includes(entry.status)).length; sec.querySelector('[data-appointment-checked]').textContent = entries.filter(entry => ['Checked In', 'In Progress'].includes(entry.status)).length; sec.querySelector('[data-appointment-completed]').textContent = entries.filter(entry => entry.status === 'Completed').length; sec.querySelector('[data-appointment-cancelled]').textContent = entries.filter(entry => entry.status === 'Cancelled').length; };
        const render = () => { const entries = readEntries(); updateStats(); table.innerHTML = entries.length ? entries.slice(0, 8).map((entry, index) => `<tr><td>${escape(entry.appointmentId)}</td><td>${escape(entry.guestName)}<br><small>${escape(entry.phone)}</small></td><td>${escape(entry.appointmentType)}</td><td>${escape(entry.appointmentDate)}</td><td>${escape(entry.appointmentTime)}</td><td>${escape(entry.personToVisit)}</td><td>${escape(entry.department)}</td><td>${escape(entry.priority)}</td><td><span class="badge pending">${escape(entry.status)}</span></td><td><div class="enquiry-actions"><button class="enquiry-action" type="button" data-enquiry-action="edit" data-enquiry-index="${index}" title="Edit"><i class="fas fa-pen"></i></button><button class="enquiry-action" type="button" data-enquiry-action="checkin" data-enquiry-index="${index}" title="Check in"><i class="fas fa-check"></i></button><button class="enquiry-action" type="button" data-enquiry-action="cancel" data-enquiry-index="${index}" title="Cancel"><i class="fas fa-xmark"></i></button><button class="enquiry-action" type="button" data-enquiry-action="delete" data-enquiry-index="${index}" title="Delete"><i class="fas fa-trash"></i></button><button class="enquiry-action" type="button" data-enquiry-action="print" data-enquiry-index="${index}" title="Print"><i class="fas fa-print"></i></button></div></td></tr>`).join('') : '<tr><td colspan="10" style="text-align:center;padding:25px;color:#94a3b8;">No appointments yet. Open New Appointment to create a record.</td></tr>'; };
        const updateSummary = () => form.querySelectorAll('[name]').forEach(field => { const summary = sec.querySelector(`[data-summary="${field.name}"]`); if (summary) summary.textContent = field.value || (field.name === 'status' ? 'Scheduled' : '-'); }); const closeForm = () => { entryCard.classList.add('hidden'); summaryCard.classList.add('hidden'); form.reset(); editingIndex = null; updateSummary(); }; const openForm = () => { entryCard.classList.remove('hidden'); summaryCard.classList.remove('hidden'); if (editingIndex === null) { form.reset(); form.elements.appointmentId.value = nextId(); form.elements.appointmentDate.value = today(); form.elements.duration.value = '30 minutes'; form.elements.guestCount.value = 1; form.elements.status.value = 'Scheduled'; form.elements.confirmationMethod.value = 'Not Confirmed'; } updateSummary(); form.elements.appointmentType.focus(); };
        form.addEventListener('input', updateSummary); form.addEventListener('change', updateSummary); form.addEventListener('reset', () => setTimeout(updateSummary)); form.addEventListener('submit', event => { event.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; } const data = Object.fromEntries(new FormData(form).entries()); data.id = data.id || Date.now().toString(); data.createdAt = new Date().toISOString(); const entries = readEntries(); if (editingIndex === null) entries.unshift(data); else { data.id = entries[editingIndex].id || data.id; data.createdAt = entries[editingIndex].createdAt || data.createdAt; entries[editingIndex] = data; } localStorage.setItem(storageKey, JSON.stringify(entries)); closeForm(); render(); });
        sec.querySelector('[data-enquiry-new]').addEventListener('click', () => entryCard.classList.contains('hidden') ? openForm() : closeForm()); sec.querySelector('[data-enquiry-cancel]').addEventListener('click', closeForm);
        table.addEventListener('click', event => { const button = event.target.closest('[data-enquiry-action]'); if (!button) return; const entries = readEntries(); const index = Number(button.dataset.enquiryIndex); const entry = entries[index]; if (!entry) return; const action = button.dataset.enquiryAction; if (action === 'delete') { if (!confirm(`Delete appointment ${entry.appointmentId || ''}?`)) return; entries.splice(index, 1); localStorage.setItem(storageKey, JSON.stringify(entries)); render(); return; } if (action === 'checkin') { entry.status = 'Checked In'; localStorage.setItem(storageKey, JSON.stringify(entries)); render(); return; } if (action === 'cancel') { if (!confirm(`Cancel appointment for ${entry.guestName || ''}?`)) return; entry.status = 'Cancelled'; localStorage.setItem(storageKey, JSON.stringify(entries)); render(); return; } if (action === 'edit') { Object.entries(entry).forEach(([name, value]) => { if (form.elements[name]) form.elements[name].value = value; }); editingIndex = index; openForm(); return; } const printWindow = window.open('', '_blank', 'width=700,height=700'); if (!printWindow) return; printWindow.document.write(`<html><head><title>Appointment Record</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#172033}h1{font-size:22px;border-bottom:2px solid #4f46e5;padding-bottom:10px}.row{padding:9px 0;border-bottom:1px solid #e2e8f0}.label{font-weight:bold;display:inline-block;width:180px}</style></head><body><h1>Appointment Record</h1>${Object.entries(entry).filter(([name]) => name !== 'id').map(([name, value]) => `<div class="row"><span class="label">${escape(name)}</span>${escape(value || '-')}</div>`).join('')}</body></html>`); printWindow.document.close(); printWindow.focus(); printWindow.print(); });
        render(); return sec;
    }

    function createVisitorsModule(category) {
        const sec = document.createElement('section');
        sec.className = 'module enquiries-module visitors-module';
        sec.id = 'module_visitors';
        sec.innerHTML = `
            <div class="module-header"><div><h2>Visitors</h2><p>Department: ${category}</p></div><button class="btn-secondary" type="button" data-enquiry-new><i class="fas fa-plus"></i> New Visitor</button></div>
            <div class="enquiries-stats">
                <div class="enquiry-stat"><span>Today's Visitors</span><strong data-visitor-today>0</strong></div>
                <div class="enquiry-stat"><span>Currently Inside</span><strong data-visitor-inside>0</strong></div>
                <div class="enquiry-stat"><span>Expected Today</span><strong data-visitor-expected>0</strong></div>
                <div class="enquiry-stat"><span>Checked Out</span><strong data-visitor-out>0</strong></div>
                <div class="enquiry-stat"><span>Active Visits</span><strong data-visitor-active>0</strong></div>
            </div>
            <div class="enquiries-grid">
                <div class="enquiry-card enquiry-entry-card hidden">
                    <div class="enquiry-card-header"><h3>Visitor Registration</h3><p>Register and manage school visitors.</p></div>
                    <div class="enquiry-card-body"><form data-enquiry-form>
                        <div class="enquiry-form-grid">
                            <div class="enquiry-form-group"><label>Visitor ID</label><input name="visitorId" readonly></div>
                            <div class="enquiry-form-group"><label>Visitor Type</label><select name="visitorType" required><option value="">Select visitor type</option><option>Parent / Guardian</option><option>Student</option><option>Staff</option><option>Prospective Parent</option><option>Supplier / Vendor</option><option>Contractor</option><option>Government Official</option><option>Guest / VIP</option><option>Alumni</option><option>Other</option></select></div>
                            <div class="enquiry-form-group"><label>Full Name</label><input name="visitorName" placeholder="Enter visitor full name" required></div>
                            <div class="enquiry-form-group"><label>Gender</label><select name="gender"><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select></div>
                            <div class="enquiry-form-group"><label>Phone Number</label><input name="phone" type="tel" placeholder="+256 700 000000" required></div>
                            <div class="enquiry-form-group"><label>Email Address</label><input name="email" type="email" placeholder="visitor@example.com"></div>
                            <div class="enquiry-form-group"><label>ID / Passport Number</label><input name="idNumber" placeholder="Enter ID or passport number"></div>
                            <div class="enquiry-form-group"><label>Organization / Company</label><input name="organization" placeholder="Organization name"></div>
                            <div class="enquiry-form-group"><label>Visit Date</label><input name="visitDate" type="date" required></div>
                            <div class="enquiry-form-group"><label>Expected Arrival Time</label><input name="expectedTime" type="time"></div>
                            <div class="enquiry-form-group"><label>Check-in Time</label><input name="checkInTime" type="time"></div>
                            <div class="enquiry-form-group"><label>Check-out Time</label><input name="checkOutTime" type="time"></div>
                            <div class="enquiry-form-group"><label>Person to Visit</label><input name="personToVisit" placeholder="Teacher, principal, staff member" required></div>
                            <div class="enquiry-form-group"><label>Department</label><select name="department" required><option value="">Select department</option><option>Principal's Office</option><option>Administration</option><option>Admissions</option><option>Accounts / Finance</option><option>Human Resources</option><option>Academic</option><option>Student Affairs</option><option>Transport</option><option>IT</option><option>Reception</option><option>Other</option></select></div>
                            <div class="enquiry-form-group full"><label>Purpose of Visit</label><textarea name="purpose" placeholder="Explain the reason for the visit" required></textarea></div>
                            <div class="enquiry-form-group"><label>Appointment Reference</label><input name="appointmentRef" placeholder="Optional appointment number"></div>
                            <div class="enquiry-form-group"><label>Accompanying Persons</label><input name="companions" type="number" min="0" value="0"></div>
                            <div class="enquiry-form-group"><label>Visitor Badge No.</label><input name="badgeNo" placeholder="Badge / pass number"></div>
                            <div class="enquiry-form-group"><label>Vehicle Number</label><input name="vehicleNo" placeholder="Vehicle registration"></div>
                            <div class="enquiry-form-group"><label>Entry Gate</label><select name="entryGate"><option value="">Select gate</option><option>Main Gate</option><option>Reception Gate</option><option>Staff Gate</option><option>Service Gate</option><option>Other</option></select></div>
                            <div class="enquiry-form-group"><label>Security Clearance</label><select name="securityClearance"><option>Not Required</option><option>Pending</option><option>Approved</option><option>Rejected</option></select></div>
                            <div class="enquiry-form-group full"><label>Items / Equipment Carried</label><textarea name="itemsCarried" placeholder="Laptop, equipment, documents, packages"></textarea></div>
                            <div class="enquiry-form-group full"><label>Security Notes</label><textarea name="securityNotes" placeholder="Security-related notes"></textarea></div>
                            <div class="enquiry-form-group"><label>Visit Status</label><select name="status"><option>Expected</option><option>Checked In</option><option>In Meeting</option><option>Checked Out</option><option>Cancelled</option><option>No Show</option></select></div>
                            <div class="enquiry-form-group"><label>Registered By</label><input name="registeredBy" placeholder="Reception staff member" required></div>
                            <div class="enquiry-form-group"><label>Host / Staff Contact</label><input name="host" placeholder="Staff member responsible"></div>
                            <div class="enquiry-form-group"><label>Contact Phone</label><input name="hostPhone" type="tel" placeholder="Host contact number"></div>
                            <div class="enquiry-form-group full"><label>Additional Remarks</label><textarea name="remarks" placeholder="Additional visitor notes"></textarea></div>
                        </div>
                        <div class="enquiry-form-actions"><button class="btn-secondary" type="reset" data-enquiry-clear>Clear</button><button class="btn-secondary" type="button" data-enquiry-cancel>Cancel</button><button class="btn-primary" type="submit"><i class="fas fa-save"></i> Save Visitor</button></div>
                    </form></div>
                </div>
                <aside class="enquiry-card enquiry-summary-card hidden"><div class="enquiry-card-header"><h3>Visitor Summary</h3><p>Review before saving.</p></div><div class="enquiry-card-body enquiry-summary">
                    <div class="enquiry-summary-row"><span>Visitor ID</span><strong data-summary="visitorId">-</strong></div><div class="enquiry-summary-row"><span>Visitor</span><strong data-summary="visitorName">-</strong></div><div class="enquiry-summary-row"><span>Type</span><strong data-summary="visitorType">-</strong></div><div class="enquiry-summary-row"><span>Visit Date</span><strong data-summary="visitDate">-</strong></div><div class="enquiry-summary-row"><span>Visiting</span><strong data-summary="personToVisit">-</strong></div><div class="enquiry-summary-row"><span>Department</span><strong data-summary="department">-</strong></div><div class="enquiry-summary-row"><span>Status</span><strong data-summary="status">Expected</strong></div>
                </div></aside>
            </div>
            <div class="enquiries-table"><div class="table-card"><h3 class="table-title">Visitor Register</h3><table><thead><tr><th>Visitor ID</th><th>Visitor</th><th>Type</th><th>Visiting</th><th>Department</th><th>Visit Date</th><th>Check-in</th><th>Check-out</th><th>Status</th><th>Actions</th></tr></thead><tbody data-enquiry-table></tbody></table></div></div>`;
        const form = sec.querySelector('[data-enquiry-form]'); const table = sec.querySelector('[data-enquiry-table]'); const entryCard = sec.querySelector('.enquiry-entry-card'); const summaryCard = sec.querySelector('.enquiry-summary-card'); const storageKey = 'edumasterVisitors'; let editingIndex = null;
        const readEntries = () => { try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch (error) { return []; } }; const escape = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char])); const today = () => new Date().toISOString().slice(0, 10); const nextId = () => `VIS-${new Date().getFullYear()}-${String(readEntries().length + 1).padStart(5, '0')}`;
        const updateStats = () => { const entries = readEntries().filter(entry => entry.visitDate === today()); sec.querySelector('[data-visitor-today]').textContent = entries.length; sec.querySelector('[data-visitor-inside]').textContent = entries.filter(entry => entry.status === 'Checked In').length; sec.querySelector('[data-visitor-expected]').textContent = entries.filter(entry => entry.status === 'Expected').length; sec.querySelector('[data-visitor-out]').textContent = entries.filter(entry => entry.status === 'Checked Out').length; sec.querySelector('[data-visitor-active]').textContent = entries.filter(entry => ['Checked In', 'In Meeting'].includes(entry.status)).length; };
        const render = () => { const entries = readEntries(); updateStats(); table.innerHTML = entries.length ? entries.slice(0, 8).map((entry, index) => `<tr><td>${escape(entry.visitorId)}</td><td>${escape(entry.visitorName)}<br><small>${escape(entry.phone)}</small></td><td>${escape(entry.visitorType)}</td><td>${escape(entry.personToVisit)}</td><td>${escape(entry.department)}</td><td>${escape(entry.visitDate)}</td><td>${escape(entry.checkInTime || '-')}</td><td>${escape(entry.checkOutTime || '-')}</td><td><span class="badge pending">${escape(entry.status)}</span></td><td><div class="enquiry-actions"><button class="enquiry-action" type="button" data-enquiry-action="edit" data-enquiry-index="${index}" title="Edit"><i class="fas fa-pen"></i></button><button class="enquiry-action" type="button" data-enquiry-action="delete" data-enquiry-index="${index}" title="Delete"><i class="fas fa-trash"></i></button><button class="enquiry-action" type="button" data-enquiry-action="checkout" data-enquiry-index="${index}" title="Check out"><i class="fas fa-door-open"></i></button><button class="enquiry-action" type="button" data-enquiry-action="print" data-enquiry-index="${index}" title="Print"><i class="fas fa-print"></i></button></div></td></tr>`).join('') : '<tr><td colspan="10" style="text-align:center;padding:25px;color:#94a3b8;">No visitor records yet. Open New Visitor to create a record.</td></tr>'; };
        const updateSummary = () => form.querySelectorAll('[name]').forEach(field => { const summary = sec.querySelector(`[data-summary="${field.name}"]`); if (summary) summary.textContent = field.value || (field.name === 'status' ? 'Expected' : '-'); }); const closeForm = () => { entryCard.classList.add('hidden'); summaryCard.classList.add('hidden'); form.reset(); editingIndex = null; updateSummary(); }; const openForm = () => { entryCard.classList.remove('hidden'); summaryCard.classList.remove('hidden'); if (editingIndex === null) { form.reset(); form.elements.visitorId.value = nextId(); form.elements.visitDate.value = today(); form.elements.companions.value = 0; form.elements.securityClearance.value = 'Not Required'; } updateSummary(); form.elements.visitorType.focus(); };
        form.addEventListener('input', updateSummary); form.addEventListener('change', updateSummary); form.addEventListener('reset', () => setTimeout(updateSummary)); form.addEventListener('submit', event => { event.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; } const data = Object.fromEntries(new FormData(form).entries()); data.id = data.id || Date.now().toString(); data.createdAt = new Date().toISOString(); const entries = readEntries(); if (editingIndex === null) entries.unshift(data); else { data.id = entries[editingIndex].id || data.id; data.createdAt = entries[editingIndex].createdAt || data.createdAt; entries[editingIndex] = data; } localStorage.setItem(storageKey, JSON.stringify(entries)); closeForm(); render(); });
        sec.querySelector('[data-enquiry-new]').addEventListener('click', () => entryCard.classList.contains('hidden') ? openForm() : closeForm()); sec.querySelector('[data-enquiry-cancel]').addEventListener('click', closeForm);
        table.addEventListener('click', event => { const button = event.target.closest('[data-enquiry-action]'); if (!button) return; const entries = readEntries(); const index = Number(button.dataset.enquiryIndex); const entry = entries[index]; if (!entry) return; if (button.dataset.enquiryAction === 'delete') { if (!confirm(`Delete visitor ${entry.visitorName || ''}?`)) return; entries.splice(index, 1); localStorage.setItem(storageKey, JSON.stringify(entries)); render(); return; } if (button.dataset.enquiryAction === 'checkout') { entry.status = 'Checked Out'; entry.checkOutTime = new Date().toTimeString().slice(0, 5); localStorage.setItem(storageKey, JSON.stringify(entries)); render(); return; } if (button.dataset.enquiryAction === 'edit') { Object.entries(entry).forEach(([name, value]) => { if (form.elements[name]) form.elements[name].value = value; }); editingIndex = index; openForm(); return; } const printWindow = window.open('', '_blank', 'width=700,height=700'); if (!printWindow) return; printWindow.document.write(`<html><head><title>Visitor Record</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#172033}h1{font-size:22px;border-bottom:2px solid #4f46e5;padding-bottom:10px}.row{padding:9px 0;border-bottom:1px solid #e2e8f0}.label{font-weight:bold;display:inline-block;width:170px}</style></head><body><h1>Visitor Record</h1>${Object.entries(entry).filter(([name]) => name !== 'id').map(([name, value]) => `<div class="row"><span class="label">${escape(name)}</span>${escape(value || '-')}</div>`).join('')}</body></html>`); printWindow.document.close(); printWindow.focus(); printWindow.print(); });
        render(); return sec;
    }

    function createDispatchModule(category) {
        const sec = document.createElement('section');
        sec.className = 'module enquiries-module dispatch-module';
        sec.id = 'module_dispatch';
        sec.innerHTML = `
            <div class="module-header">
                <div><h2>Dispatch</h2><p>Department: ${category}</p></div>
                <button class="btn-secondary" type="button" data-enquiry-new><i class="fas fa-plus"></i> New Dispatch</button>
            </div>
            <div class="enquiries-stats">
                <div class="enquiry-stat"><span>Total Dispatches</span><strong data-dispatch-total>0</strong></div>
                <div class="enquiry-stat"><span>Pending</span><strong data-dispatch-pending>0</strong></div>
                <div class="enquiry-stat"><span>In Transit</span><strong data-dispatch-transit>0</strong></div>
                <div class="enquiry-stat"><span>Delivered</span><strong data-dispatch-delivered>0</strong></div>
                <div class="enquiry-stat"><span>Urgent</span><strong data-dispatch-urgent>0</strong></div>
            </div>
            <div class="enquiries-grid">
                <div class="enquiry-card enquiry-entry-card hidden">
                    <div class="enquiry-card-header"><h3>New Dispatch Entry</h3><p>Register outgoing letters, documents, parcels and official items.</p></div>
                    <div class="enquiry-card-body">
                        <form data-enquiry-form>
                            <div class="enquiry-form-grid">
                                <div class="enquiry-form-group"><label>Dispatch Number</label><input name="dispatchNo" readonly></div>
                                <div class="enquiry-form-group"><label>Dispatch Date</label><input name="dispatchDate" type="date" required></div>
                                <div class="enquiry-form-group"><label>Dispatch Time</label><input name="dispatchTime" type="time"></div>
                                <div class="enquiry-form-group"><label>Dispatch Type</label><select name="dispatchType" required><option value="">Select type</option><option>Official Letter</option><option>Student Document</option><option>Certificate</option><option>Transcript</option><option>Notice</option><option>Report</option><option>Application</option><option>Parcel / Package</option><option>Courier</option><option>Other</option></select></div>
                                <div class="enquiry-form-group"><label>Subject / Description</label><input name="subject" placeholder="Enter document or item description" required></div>
                                <div class="enquiry-form-group"><label>Number of Items</label><input name="quantity" type="number" min="1" value="1"></div>
                                <div class="enquiry-form-group"><label>Recipient Name</label><input name="recipientName" placeholder="Full recipient name" required></div>
                                <div class="enquiry-form-group"><label>Recipient Type</label><select name="recipientType" required><option value="">Select recipient</option><option>Parent / Guardian</option><option>Student</option><option>Staff Member</option><option>Government Department</option><option>Other School</option><option>University / College</option><option>Company / Organization</option><option>Supplier / Vendor</option><option>Other</option></select></div>
                                <div class="enquiry-form-group"><label>Phone Number</label><input name="recipientPhone" type="tel" placeholder="+256 700 000000"></div>
                                <div class="enquiry-form-group"><label>Email Address</label><input name="recipientEmail" type="email" placeholder="recipient@example.com"></div>
                                <div class="enquiry-form-group"><label>Organization / Institution</label><input name="organization" placeholder="Organization name"></div>
                                <div class="enquiry-form-group"><label>Student ID</label><input name="studentId" placeholder="Optional student reference"></div>
                                <div class="enquiry-form-group full"><label>Delivery Address</label><textarea name="address" placeholder="Enter complete delivery address" required></textarea></div>
                                <div class="enquiry-form-group"><label>Delivery Method</label><select name="deliveryMethod" required><option value="">Select delivery method</option><option>Hand Delivery</option><option>School Messenger</option><option>Courier</option><option>Registered Mail</option><option>Regular Mail</option><option>Email</option><option>Pickup</option><option>Other</option></select></div>
                                <div class="enquiry-form-group"><label>Courier / Delivery Company</label><input name="courier" placeholder="e.g. DHL, FedEx"></div>
                                <div class="enquiry-form-group"><label>Tracking Number</label><input name="trackingNo" placeholder="Enter tracking number"></div>
                                <div class="enquiry-form-group"><label>Expected Delivery Date</label><input name="expectedDate" type="date"></div>
                                <div class="enquiry-form-group"><label>Priority</label><select name="priority"><option>Normal</option><option>Important</option><option>Urgent</option></select></div>
                                <div class="enquiry-form-group"><label>Dispatch Status</label><select name="status"><option>Pending</option><option>Prepared</option><option>Dispatched</option><option>In Transit</option><option>Delivered</option><option>Returned</option><option>Cancelled</option></select></div>
                                <div class="enquiry-form-group"><label>Prepared By</label><input name="preparedBy" placeholder="Staff member" required></div>
                                <div class="enquiry-form-group"><label>Approved By</label><input name="approvedBy" placeholder="Approving officer"></div>
                                <div class="enquiry-form-group"><label>Actual Delivery Date</label><input name="deliveryDate" type="date"></div>
                                <div class="enquiry-form-group"><label>Received By</label><input name="receivedBy" placeholder="Name of receiver"></div>
                                <div class="enquiry-form-group full"><label>Proof of Delivery / Reference</label><input name="proof" placeholder="Receipt or delivery confirmation"></div>
                                <div class="enquiry-form-group full"><label>Notes</label><textarea name="notes" placeholder="Additional dispatch notes"></textarea></div>
                            </div>
                            <div class="enquiry-form-actions"><button class="btn-secondary" type="reset" data-enquiry-clear>Clear</button><button class="btn-secondary" type="button" data-enquiry-cancel>Cancel</button><button class="btn-primary" type="submit"><i class="fas fa-save"></i> Save Dispatch</button></div>
                        </form>
                    </div>
                </div>
                <aside class="enquiry-card enquiry-summary-card hidden">
                    <div class="enquiry-card-header"><h3>Dispatch Summary</h3><p>Review before saving.</p></div>
                    <div class="enquiry-card-body enquiry-summary">
                        <div class="enquiry-summary-row"><span>Dispatch No.</span><strong data-summary="dispatchNo">-</strong></div>
                        <div class="enquiry-summary-row"><span>Recipient</span><strong data-summary="recipientName">-</strong></div>
                        <div class="enquiry-summary-row"><span>Type</span><strong data-summary="dispatchType">-</strong></div>
                        <div class="enquiry-summary-row"><span>Subject</span><strong data-summary="subject">-</strong></div>
                        <div class="enquiry-summary-row"><span>Delivery</span><strong data-summary="deliveryMethod">-</strong></div>
                        <div class="enquiry-summary-row"><span>Tracking</span><strong data-summary="trackingNo">-</strong></div>
                        <div class="enquiry-summary-row"><span>Priority</span><strong data-summary="priority">Normal</strong></div>
                        <div class="enquiry-summary-row"><span>Status</span><strong data-summary="status">Pending</strong></div>
                    </div>
                </aside>
            </div>
            <div class="enquiries-table"><div class="table-card"><h3 class="table-title">Saved Dispatch Records</h3><table><thead><tr><th>Dispatch No.</th><th>Recipient</th><th>Type</th><th>Subject</th><th>Method</th><th>Tracking</th><th>Date</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead><tbody data-enquiry-table></tbody></table></div></div>`;

        const form = sec.querySelector('[data-enquiry-form]');
        const table = sec.querySelector('[data-enquiry-table]');
        const entryCard = sec.querySelector('.enquiry-entry-card');
        const summaryCard = sec.querySelector('.enquiry-summary-card');
        const storageKey = 'edumasterDispatches';
        let editingIndex = null;
        const readEntries = () => { try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch (error) { return []; } };
        const escape = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
        const nextNumber = () => `DSP-${new Date().getFullYear()}-${String(readEntries().length + 1).padStart(5, '0')}`;
        const updateStats = () => {
            const entries = readEntries();
            sec.querySelector('[data-dispatch-total]').textContent = entries.length;
            sec.querySelector('[data-dispatch-pending]').textContent = entries.filter(entry => entry.status === 'Pending').length;
            sec.querySelector('[data-dispatch-transit]').textContent = entries.filter(entry => entry.status === 'In Transit').length;
            sec.querySelector('[data-dispatch-delivered]').textContent = entries.filter(entry => entry.status === 'Delivered').length;
            sec.querySelector('[data-dispatch-urgent]').textContent = entries.filter(entry => entry.priority === 'Urgent').length;
        };
        const render = () => {
            const entries = readEntries();
            updateStats();
            table.innerHTML = entries.length ? entries.slice(0, 8).map((entry, index) => `<tr><td>${escape(entry.dispatchNo)}</td><td>${escape(entry.recipientName)}<br><small>${escape(entry.recipientType)}</small></td><td>${escape(entry.dispatchType)}</td><td>${escape(entry.subject)}</td><td>${escape(entry.deliveryMethod)}</td><td>${escape(entry.trackingNo || '-')}</td><td>${escape(entry.dispatchDate || '-')}<br><small>${escape(entry.dispatchTime || '-')}</small></td><td>${escape(entry.priority)}</td><td><span class="badge pending">${escape(entry.status)}</span></td><td><div class="enquiry-actions"><button class="enquiry-action" type="button" data-enquiry-action="edit" data-enquiry-index="${index}" title="Edit"><i class="fas fa-pen"></i></button><button class="enquiry-action" type="button" data-enquiry-action="delete" data-enquiry-index="${index}" title="Delete"><i class="fas fa-trash"></i></button><button class="enquiry-action" type="button" data-enquiry-action="print" data-enquiry-index="${index}" title="Print"><i class="fas fa-print"></i></button></div></td></tr>`).join('') : '<tr><td colspan="10" style="text-align:center;padding:25px;color:#94a3b8;">No saved dispatch records yet. Open New Dispatch to create a record.</td></tr>';
        };
        const updateSummary = () => form.querySelectorAll('[name]').forEach(field => { const summary = sec.querySelector(`[data-summary="${field.name}"]`); if (summary) summary.textContent = field.value || (field.name === 'priority' ? 'Normal' : field.name === 'status' ? 'Pending' : '-'); });
        const closeForm = () => { entryCard.classList.add('hidden'); summaryCard.classList.add('hidden'); form.reset(); editingIndex = null; updateSummary(); };
        const openForm = () => { entryCard.classList.remove('hidden'); summaryCard.classList.remove('hidden'); if (editingIndex === null) { form.reset(); form.elements.dispatchNo.value = nextNumber(); form.elements.dispatchDate.value = new Date().toISOString().slice(0, 10); form.elements.dispatchTime.value = new Date().toTimeString().slice(0, 5); form.elements.quantity.value = 1; } updateSummary(); form.elements.dispatchType.focus(); };
        form.addEventListener('input', updateSummary); form.addEventListener('change', updateSummary); form.addEventListener('reset', () => setTimeout(updateSummary));
        form.addEventListener('submit', event => { event.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; } const data = Object.fromEntries(new FormData(form).entries()); data.id = data.id || Date.now().toString(); data.createdAt = new Date().toISOString(); const entries = readEntries(); if (editingIndex === null) entries.unshift(data); else { data.id = entries[editingIndex].id || data.id; data.createdAt = entries[editingIndex].createdAt || data.createdAt; entries[editingIndex] = data; } localStorage.setItem(storageKey, JSON.stringify(entries)); closeForm(); render(); });
        sec.querySelector('[data-enquiry-new]').addEventListener('click', () => entryCard.classList.contains('hidden') ? openForm() : closeForm());
        sec.querySelector('[data-enquiry-cancel]').addEventListener('click', closeForm);
        table.addEventListener('click', event => { const button = event.target.closest('[data-enquiry-action]'); if (!button) return; const entries = readEntries(); const index = Number(button.dataset.enquiryIndex); const entry = entries[index]; if (!entry) return; if (button.dataset.enquiryAction === 'delete') { if (!confirm(`Delete dispatch ${entry.dispatchNo || ''}?`)) return; entries.splice(index, 1); localStorage.setItem(storageKey, JSON.stringify(entries)); render(); return; } if (button.dataset.enquiryAction === 'edit') { Object.entries(entry).forEach(([name, value]) => { if (form.elements[name]) form.elements[name].value = value; }); editingIndex = index; openForm(); return; } const printWindow = window.open('', '_blank', 'width=700,height=700'); if (!printWindow) return; printWindow.document.write(`<html><head><title>Dispatch Record</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#172033}h1{font-size:22px;border-bottom:2px solid #4f46e5;padding-bottom:10px}.row{padding:9px 0;border-bottom:1px solid #e2e8f0}.label{font-weight:bold;display:inline-block;width:180px}</style></head><body><h1>Dispatch Record</h1>${Object.entries(entry).filter(([name]) => name !== 'id').map(([name, value]) => `<div class="row"><span class="label">${escape(name)}</span>${escape(value || '-')}</div>`).join('')}</body></html>`); printWindow.document.close(); printWindow.focus(); printWindow.print(); });
        render();
        return sec;
    }

    function createCallLogsModule(category) {
        const sec = document.createElement('section');
        sec.className = 'module enquiries-module call-logs-module';
        sec.id = 'module_call_logs';
        sec.innerHTML = `
            <div class="module-header">
                <div><h2>Call Logs</h2><p>Department: ${category}</p></div>
                <button class="btn-secondary" type="button" data-enquiry-new><i class="fas fa-plus"></i> New Call</button>
            </div>
            <div class="enquiries-stats">
                <div class="enquiry-stat"><span>Total Calls</span><strong data-call-total>0</strong></div>
                <div class="enquiry-stat"><span>Incoming</span><strong data-call-incoming>0</strong></div>
                <div class="enquiry-stat"><span>Outgoing</span><strong data-call-outgoing>0</strong></div>
                <div class="enquiry-stat"><span>Follow-ups</span><strong data-call-followups>0</strong></div>
                <div class="enquiry-stat"><span>Urgent</span><strong data-call-urgent>0</strong></div>
            </div>
            <div class="enquiries-grid">
                <div class="enquiry-card enquiry-entry-card hidden">
                    <div class="enquiry-card-header"><h3>New Call Log Entry</h3><p>Record incoming and outgoing school telephone communication.</p></div>
                    <div class="enquiry-card-body">
                        <form data-enquiry-form>
                            <div class="enquiry-form-grid">
                                <div class="enquiry-form-group"><label>Call Direction</label><select name="direction" required><option>Incoming</option><option>Outgoing</option></select></div>
                                <div class="enquiry-form-group"><label>Call Status</label><select name="status" required><option>Answered</option><option>Missed</option><option>Busy</option><option>No Answer</option><option>Transferred</option></select></div>
                                <div class="enquiry-form-group"><label>Caller / Contact Name</label><input name="callerName" placeholder="Enter caller's full name" required></div>
                                <div class="enquiry-form-group"><label>Phone Number</label><input name="phone" placeholder="+256 700 000000" required></div>
                                <div class="enquiry-form-group"><label>Caller Type</label><select name="callerType" required><option value="">Select caller type</option><option>Parent / Guardian</option><option>Student</option><option>Staff Member</option><option>Applicant</option><option>Supplier / Vendor</option><option>Government / Official</option><option>Other</option></select></div>
                                <div class="enquiry-form-group"><label>Call Date</label><input name="callDate" type="date" required></div>
                                <div class="enquiry-form-group"><label>Call Time</label><input name="callTime" type="time" required></div>
                                <div class="enquiry-form-group"><label>Duration</label><input name="duration" placeholder="e.g. 05:30"></div>
                                <div class="enquiry-form-group"><label>Student ID</label><input name="studentId" placeholder="e.g. STU-2026-001"></div>
                                <div class="enquiry-form-group"><label>Student Name</label><input name="studentName" placeholder="Student full name"></div>
                                <div class="enquiry-form-group"><label>Call Purpose</label><select name="purpose" required><option value="">Select purpose</option><option>Admission Enquiry</option><option>Fee / Accounts</option><option>Attendance</option><option>Academic Matter</option><option>Parent Meeting</option><option>Student Welfare</option><option>Transport</option><option>Examination</option><option>Complaint</option><option>General Enquiry</option><option>Emergency</option><option>Other</option></select></div>
                                <div class="enquiry-form-group"><label>Department</label><select name="department"><option value="">Select department</option><option>Reception</option><option>Admissions</option><option>Accounts / Finance</option><option>Academic Department</option><option>Principal's Office</option><option>HR</option><option>Transport</option><option>IT</option><option>Student Affairs</option><option>School Nurse</option></select></div>
                                <div class="enquiry-form-group"><label>Call Handled By</label><input name="handledBy" placeholder="Staff member name"></div>
                                <div class="enquiry-form-group"><label>Call Outcome</label><select name="outcome"><option value="">Select outcome</option><option>Information Provided</option><option>Appointment Scheduled</option><option>Message Taken</option><option>Transferred to Department</option><option>Callback Required</option><option>Resolved</option><option>Escalated</option><option>No Action Required</option></select></div>
                                <div class="enquiry-form-group"><label>Priority</label><select name="priority"><option>Normal</option><option>Important</option><option>Urgent</option></select></div>
                                <div class="enquiry-form-group"><label>Follow-up Required?</label><select name="followupRequired"><option>No</option><option>Yes</option></select></div>
                                <div class="enquiry-form-group"><label>Follow-up Date</label><input name="followupDate" type="date"></div>
                                <div class="enquiry-form-group"><label>Follow-up By</label><input name="followupBy" placeholder="Staff responsible"></div>
                                <div class="enquiry-form-group full"><label>Call Notes / Message</label><textarea name="notes" placeholder="Record the caller's message or action taken"></textarea></div>
                            </div>
                            <div class="enquiry-form-actions"><button class="btn-secondary" type="reset" data-enquiry-clear>Clear</button><button class="btn-secondary" type="button" data-enquiry-cancel>Cancel</button><button class="btn-primary" type="submit"><i class="fas fa-save"></i> Save Call Log</button></div>
                        </form>
                    </div>
                </div>
                <aside class="enquiry-card enquiry-summary-card hidden">
                    <div class="enquiry-card-header"><h3>Live Call Summary</h3><p>Review call information before saving.</p></div>
                    <div class="enquiry-card-body enquiry-summary">
                        <div class="enquiry-summary-row"><span>Caller</span><strong data-summary="callerName">-</strong></div>
                        <div class="enquiry-summary-row"><span>Phone</span><strong data-summary="phone">-</strong></div>
                        <div class="enquiry-summary-row"><span>Direction</span><strong data-summary="direction">Incoming</strong></div>
                        <div class="enquiry-summary-row"><span>Purpose</span><strong data-summary="purpose">-</strong></div>
                        <div class="enquiry-summary-row"><span>Department</span><strong data-summary="department">-</strong></div>
                        <div class="enquiry-summary-row"><span>Outcome</span><strong data-summary="outcome">-</strong></div>
                        <div class="enquiry-summary-row"><span>Priority</span><strong data-summary="priority">Normal</strong></div>
                        <div class="enquiry-summary-row"><span>Follow-up</span><strong data-summary="followupRequired">No</strong></div>
                    </div>
                </aside>
            </div>
            <div class="enquiries-table"><div class="table-card"><h3 class="table-title">Saved Call Records</h3><table><thead><tr><th>Caller</th><th>Phone</th><th>Direction</th><th>Purpose</th><th>Student</th><th>Date / Time</th><th>Priority</th><th>Follow-up</th><th>Status</th><th>Actions</th></tr></thead><tbody data-enquiry-table></tbody></table></div></div>`;

        const form = sec.querySelector('[data-enquiry-form]');
        const table = sec.querySelector('[data-enquiry-table]');
        const entryCard = sec.querySelector('.enquiry-entry-card');
        const summaryCard = sec.querySelector('.enquiry-summary-card');
        const storageKey = 'edumasterCallLogs';
        let editingIndex = null;
        const readEntries = () => {
            try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch (error) { return []; }
        };
        const escape = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
        const render = () => {
            const entries = readEntries();
            sec.querySelector('[data-call-total]').textContent = entries.length;
            sec.querySelector('[data-call-incoming]').textContent = entries.filter(entry => entry.direction === 'Incoming').length;
            sec.querySelector('[data-call-outgoing]').textContent = entries.filter(entry => entry.direction === 'Outgoing').length;
            sec.querySelector('[data-call-followups]').textContent = entries.filter(entry => entry.followupRequired === 'Yes').length;
            sec.querySelector('[data-call-urgent]').textContent = entries.filter(entry => entry.priority === 'Urgent').length;
            table.innerHTML = entries.length ? entries.slice(0, 8).map((entry, index) => `<tr><td>${escape(entry.callerName)}<br><small>${escape(entry.callerType)}</small></td><td>${escape(entry.phone)}</td><td>${escape(entry.direction)}</td><td>${escape(entry.purpose)}</td><td>${escape(entry.studentName || '-')}</td><td>${escape(entry.callDate || '-')}<br><small>${escape(entry.callTime || '-')}</small></td><td>${escape(entry.priority)}</td><td>${escape(entry.followupRequired || 'No')}</td><td><span class="badge pending">${escape(entry.status)}</span></td><td><div class="enquiry-actions"><button class="enquiry-action" type="button" data-enquiry-action="edit" data-enquiry-index="${index}" title="Edit"><i class="fas fa-pen"></i></button><button class="enquiry-action" type="button" data-enquiry-action="delete" data-enquiry-index="${index}" title="Delete"><i class="fas fa-trash"></i></button><button class="enquiry-action" type="button" data-enquiry-action="print" data-enquiry-index="${index}" title="Print"><i class="fas fa-print"></i></button></div></td></tr>`).join('') : '<tr><td colspan="10" style="text-align:center;padding:25px;color:#94a3b8;">No saved call records yet. Open New Call to create a record.</td></tr>';
        };
        const updateSummary = () => form.querySelectorAll('[name]').forEach(field => {
            const summary = sec.querySelector(`[data-summary="${field.name}"]`);
            if (summary) summary.textContent = field.value || (field.name === 'direction' ? 'Incoming' : field.name === 'priority' ? 'Normal' : field.name === 'followupRequired' ? 'No' : '-');
        });
        const closeForm = () => { entryCard.classList.add('hidden'); summaryCard.classList.add('hidden'); form.reset(); editingIndex = null; updateSummary(); };
        form.addEventListener('input', updateSummary);
        form.addEventListener('change', updateSummary);
        form.addEventListener('reset', () => setTimeout(updateSummary));
        form.addEventListener('submit', event => {
            event.preventDefault();
            if (!form.checkValidity()) { form.reportValidity(); return; }
            const data = Object.fromEntries(new FormData(form).entries());
            data.id = data.id || Date.now().toString();
            data.createdAt = new Date().toISOString();
            const entries = readEntries();
            if (editingIndex === null) entries.unshift(data);
            else { data.id = entries[editingIndex].id || data.id; data.createdAt = entries[editingIndex].createdAt || data.createdAt; entries[editingIndex] = data; }
            localStorage.setItem(storageKey, JSON.stringify(entries));
            closeForm();
            render();
        });
        sec.querySelector('[data-enquiry-new]').addEventListener('click', () => {
            if (!entryCard.classList.contains('hidden')) { closeForm(); return; }
            entryCard.classList.remove('hidden'); summaryCard.classList.remove('hidden'); form.reset(); form.querySelector('[name="callerName"]').focus(); updateSummary();
        });
        sec.querySelector('[data-enquiry-cancel]').addEventListener('click', closeForm);
        table.addEventListener('click', event => {
            const button = event.target.closest('[data-enquiry-action]');
            if (!button) return;
            const entries = readEntries();
            const index = Number(button.dataset.enquiryIndex);
            const entry = entries[index];
            if (!entry) return;
            if (button.dataset.enquiryAction === 'delete') {
                if (!confirm(`Delete the call log for ${entry.callerName || 'this caller'}?`)) return;
                entries.splice(index, 1); localStorage.setItem(storageKey, JSON.stringify(entries)); render(); return;
            }
            if (button.dataset.enquiryAction === 'edit') {
                Object.entries(entry).forEach(([name, value]) => { if (form.elements[name]) form.elements[name].value = value; });
                editingIndex = index; entryCard.classList.remove('hidden'); summaryCard.classList.remove('hidden'); updateSummary(); form.querySelector('[name="callerName"]').focus(); return;
            }
            const printWindow = window.open('', '_blank', 'width=700,height=700');
            if (!printWindow) return;
            printWindow.document.write(`<html><head><title>Call Log Record</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#172033}h1{font-size:22px;border-bottom:2px solid #4f46e5;padding-bottom:10px}.row{padding:9px 0;border-bottom:1px solid #e2e8f0}.label{font-weight:bold;display:inline-block;width:170px}</style></head><body><h1>Call Log Record</h1>${Object.entries(entry).filter(([name]) => name !== 'id').map(([name, value]) => `<div class="row"><span class="label">${escape(name)}</span>${escape(value || '-')}</div>`).join('')}</body></html>`);
            printWindow.document.close(); printWindow.focus(); printWindow.print();
        });
        render();
        return sec;
    }

    function loadUsers(){
        try{ return JSON.parse(localStorage.getItem(usersKey)) || []; }catch(e){return []}
    }
    function saveUsers(users){ localStorage.setItem(usersKey, JSON.stringify(users)); }

    function populateRoleOptions(){
        const roles = Array.from(new Set(Object.keys(rolePermissions).concat(['Administrator'])));
        roleSelectEl.innerHTML = '';
        roles.forEach(r => {
            const opt = document.createElement('option'); opt.value = r; opt.textContent = r; roleSelectEl.appendChild(opt);
        });
    }

    function populateSectionsList(){
        if (!sectionsContainerEl) return;
        sectionsContainerEl.innerHTML = '';

        const syncCard = (cb, lbl) => {
            lbl.style.borderColor = cb.checked ? 'var(--primary)' : '#e2e8f0';
            lbl.style.backgroundColor = cb.checked ? 'rgba(79, 70, 229, 0.04)' : '#ffffff';
        };

        // Extract unique section names and their corresponding icons from the sidebar
        const menuTitles = Array.from(document.querySelectorAll('.menu-title'));
        const uniqueSections = [];
        const seenNames = new Set();

        menuTitles.forEach(titleEl => {
            const name = titleEl.innerText.trim();
            if (name && !seenNames.has(name)) {
                seenNames.add(name);
                const iconHtml = titleEl.querySelector('i')?.outerHTML || '';
                uniqueSections.push({ name, icon: iconHtml });
            }
        });

        // Add "Select All" checkbox for sections
        const selectAllDiv = document.createElement('div');
        Object.assign(selectAllDiv.style, {
            marginBottom: '12px',
            padding: '6px 12px',
            background: 'var(--pill-bg)',
            borderRadius: '8px',
            width: 'fit-content'
        });
        selectAllDiv.innerHTML = `
            <label style="display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 600; cursor: pointer;">
                <span class="switch">
                    <input type="checkbox" id="selectAllSections">
                    <span class="slider"></span>
                </span>
                <span>Select All Sections</span>
            </label>`;
        sectionsContainerEl.appendChild(selectAllDiv);

        // Arrange Sections in a 6-column grid
        const grid = document.createElement('div');
        Object.assign(grid.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '10px',
            marginBottom: '25px'
        });

        selectAllDiv.querySelector('#selectAllSections').addEventListener('change', (e) => {
            grid.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = e.target.checked;
                syncCard(cb, cb.closest('label'));
            });
        });

        uniqueSections.forEach(item => {
            const id = 'sec_' + item.name.replace(/\s+/g, '_');
            const label = document.createElement('label');
            Object.assign(label.style, {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                cursor: 'pointer',
                background: '#ffffff',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                transition: 'all 0.25s ease'
            });
            label.innerHTML = `
                <span class="switch" style="flex-shrink: 0; transform: scale(0.85); transform-origin: left center;">
                    <input type="checkbox" value="${item.name}" id="${id}">
                    <span class="slider"></span>
                </span>
                <span style="color: var(--primary); font-size: 14px; width: 18px; text-align: center; flex-shrink: 0;">${item.icon}</span>
                <span title="${item.name}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</span>`;
            const cb = label.querySelector('input');
            cb.addEventListener('change', () => syncCard(cb, label));
            syncCard(cb, label);
            grid.appendChild(label);
        });
        sectionsContainerEl.appendChild(grid);

        // Ensure Sections and Permissions stack vertically
        const parentRow = sectionsContainerEl.closest('.form-row');
        if (parentRow) parentRow.style.display = 'block';

        // Arrange Permissions (View, Edit, Delete) on one row line inline as a 1-row grid
        const permsGroup = document.querySelector('.perms-group');
        if (permsGroup) {
            // Add "Select All" for permissions
            const existingSelectAll = permsGroup.querySelector('.select-all-perms-wrapper');
            if (existingSelectAll) existingSelectAll.remove();

            const selectAllPermsDiv = document.createElement('div');
            selectAllPermsDiv.className = 'select-all-perms-wrapper';
            Object.assign(selectAllPermsDiv.style, {
                gridColumn: '1 / -1',
                marginBottom: '10px',
                padding: '6px 12px',
                background: 'var(--pill-bg)',
                borderRadius: '8px',
                width: 'fit-content'
            });
            selectAllPermsDiv.innerHTML = `
                <label style="display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 600; cursor: pointer;">
                    <span class="switch">
                        <input type="checkbox" id="selectAllPermissions">
                        <span class="slider"></span>
                    </span>
                    <span>Select All Permissions</span>
                </label>`;

            const groupLabel = permsGroup.querySelector('label');
            if (groupLabel) {
                groupLabel.style.gridColumn = '1 / -1';
                groupLabel.after(selectAllPermsDiv);
            }

            Object.assign(permsGroup.style, {
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid #e2e8f0',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                alignItems: 'center',
                width: '100%'
            });
            permsGroup.querySelectorAll('.perm-row').forEach(row => {
                const cb = row.querySelector('input');
                const text = row.innerText.trim();
                const id = cb.id;
                row.innerHTML = `
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 12px; background: #fff; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0; transition: all 0.25s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.05); width: 100%;">
                        <span class="switch" style="transform: scale(0.85); transform-origin: left center;">
                            <input type="checkbox" id="${id}" ${cb.checked ? 'checked' : ''}>
                            <span class="slider"></span>
                        </span>
                        <span style="font-weight: 500;">${text}</span>
                    </label>`;
                row.style.margin = '0';
                const newLabel = row.querySelector('label');
                const newCb = newLabel.querySelector('input');
                newCb.addEventListener('change', () => syncCard(newCb, newLabel));
                syncCard(newCb, newLabel);
            });

            const selectAllCB = selectAllPermsDiv.querySelector('#selectAllPermissions');
            selectAllCB.addEventListener('change', (e) => {
                permsGroup.querySelectorAll('.perm-row input[type="checkbox"]').forEach(cb => {
                    cb.checked = e.target.checked;
                    syncCard(cb, cb.closest('label'));
                });
            });

            const mainLabel = permsGroup.querySelector('label');
            if (mainLabel) mainLabel.style.marginBottom = '0';
        }
    }

    function renderUsersTable(){
        const users = loadUsers();
        const session = loadSession();
        const currentUserId = session?.userId;

        usersTableBody.innerHTML = '';
        users.forEach(u => {
            const tr = document.createElement('tr');
            const isActive = u.status !== false;

            if (u.userId === currentUserId) {
                tr.classList.add('current-user-row');
            }
            if (!isActive) {
                tr.classList.add('deactivated-row');
            }

            const perms = [];
            if (u.perms?.view) perms.push('V');
            if (u.perms?.edit) perms.push('E');
            if (u.perms?.delete) perms.push('D');

            tr.innerHTML = `
                <td style="text-align: center; width: 50px;">
                    <img src="${u.photo || 'https://i.pravatar.cc/100?img=0'}" class="user-table-photo" alt="profile">
                </td>
                <td>${u.fullName} ${u.userId === currentUserId ? '<span class="badge" style="margin-left:8px; font-size:9px; padding:2px 6px; background:var(--primary); vertical-align: middle;">You</span>' : ''}</td>
                <td>${u.userId}</td>
                <td>
                    <div class="pass-container">
                        <code class="pass-masked">••••••••</code>
                        <button type="button" class="pass-toggle" data-pass="${u.password}"><i class="fas fa-eye"></i></button>
                    </div>
                </td>
                <td>${u.role}</td>
                <td>${(u.sections||[]).join(', ')}</td>
                <td class="small">${perms.join(', ')}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <button class="action-btn" data-action="edit" data-id="${u.id}" title="Edit User"><i class="fas fa-edit"></i></button>
                        <button class="action-btn" data-action="delete" data-id="${u.id}" title="Delete User"><i class="fas fa-trash"></i></button>
                        <label class="switch" style="transform: scale(0.75); transform-origin: left;" title="${isActive ? 'Deactivate' : 'Activate'}">
                            <input type="checkbox" class="status-toggle" data-id="${u.id}" ${isActive ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                </td>`;
            usersTableBody.appendChild(tr);
        });
    }

    function clearForm(){
        addUserForm.reset(); editingUserId = null;
        const passInput = document.getElementById('passwordInputNew');
        if (passInput) passInput.type = 'password';
        const submitBtn = document.getElementById('addUserBtn');
        if (submitBtn) submitBtn.textContent = 'Add User';
        if (photoPreview) {
            photoPreview.src = '';
            photoPreview.style.display = 'none';
        }
    }

    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullNameInput').value.trim();
        const userId = document.getElementById('userIdInputNew').value.trim();
        const password = document.getElementById('passwordInputNew').value;
        const role = document.getElementById('roleSelect').value;
        const sections = Array.from(sectionsContainerEl.querySelectorAll('input[type="checkbox"]:checked')).map(i=>i.value);
        const perms = { view: !!document.getElementById('canView').checked, edit: !!document.getElementById('canEdit').checked, delete: !!document.getElementById('canDelete').checked };
        if (!fullName || !userId) return alert('Please provide name and user ID.');

        const photoInput = document.getElementById('profilePhotoInput');
        let photoData = null;
        
        if (photoInput.files && photoInput.files[0]) {
            photoData = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(photoInput.files[0]);
            });
        }

        const users = loadUsers();
        if (editingUserId){
            const idx = users.findIndex(u=>u.id===editingUserId);
            if (idx>=0){
                const oldUser = users[idx];
                users[idx] = { 
                    ...oldUser, 
                    fullName, 
                    userId, 
                    password, 
                    role, 
                    sections, 
                    perms, 
                    status: oldUser.status !== false,
                    photo: photoData || oldUser.photo 
                }; 
                saveUsers(users); renderUsersTable(); clearForm(); addUserForm.classList.add('hidden');
                return; 
            }
        }
        const id = 'u_' + Date.now();
        users.push({ id, fullName, userId, password, role, sections, perms, status: true, photo: photoData });
        saveUsers(users); renderUsersTable(); clearForm(); addUserForm.classList.add('hidden');
    });

    usersTableBody.addEventListener('click', (e) => {
        // Handle password toggle (Must be outside the data-action guard)
        const passToggleBtn = e.target.closest('.pass-toggle');
        if (passToggleBtn) {
            const code = passToggleBtn.previousElementSibling;
            const icon = passToggleBtn.querySelector('i');
            const isHidden = code.textContent === '••••••••';
            
            if (isHidden) {
                code.textContent = passToggleBtn.getAttribute('data-pass');
                icon.classList.replace('fa-eye', 'fa-eye-slash');
                passToggleBtn.classList.add('pulse-active');
            } else {
                code.textContent = '••••••••';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
                passToggleBtn.classList.remove('pulse-active');
            }
            return;
        }

        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        const users = loadUsers();
        if (action === 'delete'){
            const u = users.find(x=>x.id===id);
            if (!u || !confirm(`⚠️ WARNING: Are you sure you want to permanently delete the account for "${u.fullName}"?\n\nThis action cannot be undone.`)) return;
            const updated = users.filter(u=>u.id!==id); saveUsers(updated); renderUsersTable();
            return;
        }

        if (action === 'edit'){
            const u = users.find(x=>x.id===id); if (!u) return;
            addUserForm.classList.remove('hidden');
            const submitBtn = document.getElementById('addUserBtn');
            if (submitBtn) submitBtn.textContent = 'Update User';
            document.getElementById('fullNameInput').value = u.fullName;
            document.getElementById('userIdInputNew').value = u.userId;
            document.getElementById('passwordInputNew').value = u.password;
            document.getElementById('roleSelect').value = u.role;
            
            if (u.photo && photoPreview) {
                photoPreview.src = u.photo;
                photoPreview.style.display = 'block';
            }

            // sections
            sectionsContainerEl.querySelectorAll('input[type="checkbox"]').forEach(ch => {
                ch.checked = u.sections?.includes(ch.value);
                ch.dispatchEvent(new Event('change'));
            });
            ['canView', 'canEdit', 'canDelete'].forEach(id => {
                const ch = document.getElementById(id);
                if (ch) {
                    ch.checked = !!u.perms[id.replace('can', '').toLowerCase()];
                    ch.dispatchEvent(new Event('change'));
                }
            });
            editingUserId = u.id;
            window.scrollTo({ top: addUserForm.offsetTop - 80, behavior: 'smooth' });
        }
    });

    usersTableBody.addEventListener('change', (e) => {
        if (e.target.classList.contains('status-toggle')) {
            const id = e.target.getAttribute('data-id');
            const users = loadUsers();
            const idx = users.findIndex(u => u.id === id);
            if (idx >= 0) {
                users[idx].status = e.target.checked;
                saveUsers(users);
                renderUsersTable();
            }
        }
    });

    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (ev) => {
            ev.preventDefault();
            navLinks.forEach(n => n.classList.remove('active'));
            link.classList.add('active');

            const linkText = link.querySelector('span')?.innerText.trim() || link.innerText.trim();
            if (typeof window.updateHeaderAddButton === 'function') {
                window.updateHeaderAddButton(linkText);
            }

            if (link.id === 'dashboardBtn' || link.dataset.menuId === 'dashboard') {
                showDashboard();
                return;
            }

            if (linkText === 'Dashboard' && link.dataset.menuId === 'front_office_dashboard') {
                let frontOfficeDashboard = document.getElementById('module_front_office_dashboard');
                if (!frontOfficeDashboard) {
                    frontOfficeDashboard = createFrontOfficeDashboard('Front Office Department');
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(frontOfficeDashboard, dashboardEl);
                }
                showSection('module_front_office_dashboard');
                updateBreadcrumb(['Front Office Department', 'Dashboard']);
                return;
            }

            if (link.id === 'userRolesBtn') {
                populateRoleOptions(); 
                populateSectionsList(); 
                renderUsersTable(); 
                showSection('userRolesSection');
                updateBreadcrumb(['System', 'User Roles']);
                return;
            }

            if (linkText === 'Enquiries') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Front Office Department';
                let enquiriesModule = document.getElementById('module_enquiries');
                if (!enquiriesModule) {
                    enquiriesModule = createEnquiriesModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(enquiriesModule, dashboardEl);
                }
                enquiriesModule.querySelector('.enquiry-entry-card')?.classList.add('hidden');
                enquiriesModule.querySelector('.enquiry-summary-card')?.classList.add('hidden');
                showSection('module_enquiries');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Call Logs') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Front Office Department';
                let callLogsModule = document.getElementById('module_call_logs');
                if (!callLogsModule) {
                    callLogsModule = createCallLogsModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(callLogsModule, dashboardEl);
                }
                showSection('module_call_logs');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Dispatch') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Front Office Department';
                let dispatchModule = document.getElementById('module_dispatch');
                if (!dispatchModule) {
                    dispatchModule = createDispatchModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(dispatchModule, dashboardEl);
                }
                showSection('module_dispatch');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Visitors' || linkText === 'Visitor Management') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Front Office Department';
                let visitorsModule = document.getElementById('module_visitors');
                if (!visitorsModule) {
                    visitorsModule = createVisitorsModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(visitorsModule, dashboardEl);
                }
                showSection('module_visitors');
                updateBreadcrumb([category, 'Visitors']);
                return;
            }

            if (linkText === 'Appointments') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Front Office Department';
                let appointmentsModule = document.getElementById('module_appointments');
                if (!appointmentsModule) {
                    appointmentsModule = createAppointmentsModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(appointmentsModule, dashboardEl);
                }
                showSection('module_appointments');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Incoming Mail') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Front Office Department';
                let incomingMailModule = document.getElementById('module_incoming_mail');
                if (!incomingMailModule) {
                    incomingMailModule = createIncomingMailModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(incomingMailModule, dashboardEl);
                }
                showSection('module_incoming_mail');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Follow-ups') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Front Office Department';
                let followUpsModule = document.getElementById('module_follow_ups');
                if (!followUpsModule) {
                    followUpsModule = createFollowUpsModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(followUpsModule, dashboardEl);
                }
                showSection('module_follow_ups');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Reports') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Front Office Department';
                let reportsModule = document.getElementById('module_front_office_reports');
                if (!reportsModule) {
                    reportsModule = createReportsModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(reportsModule, dashboardEl);
                }
                showSection('module_front_office_reports');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Report Cards') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Academic Department';
                let reportCardsModule = document.getElementById('module_report_cards');
                if (!reportCardsModule) {
                    reportCardsModule = createReportCardsModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(reportCardsModule, dashboardEl);
                }
                showSection('module_report_cards');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'ID Cards') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Academic Department';
                let idCardsModule = document.getElementById('idCardsModule');
                if (!idCardsModule) {
                    idCardsModule = createIDCardsModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(idCardsModule, dashboardEl);
                }
                showSection('idCardsModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Certificates') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Academic Department';
                let certificateModule = document.getElementById('certificateModule');
                if (!certificateModule) {
                    certificateModule = createCertificateModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(certificateModule, dashboardEl);
                }
                showSection('certificateModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Library') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Academic Department';
                let libraryModule = document.getElementById('libraryModule');
                if (!libraryModule) {
                    libraryModule = createLibraryModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(libraryModule, dashboardEl);
                }
                showSection('libraryModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Attendance') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Operations Department';
                let attendanceModule = document.getElementById('attendanceModule');
                if (!attendanceModule) {
                    attendanceModule = createAttendanceModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(attendanceModule, dashboardEl);
                }
                showSection('attendanceModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Health/Infirmary') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Operations Department';
                let healthModule = document.getElementById('healthModule');
                if (!healthModule) {
                    healthModule = createHealthModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(healthModule, dashboardEl);
                }
                showSection('healthModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Boarding') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Operations Department';
                let boardingModule = document.getElementById('boardingModule');
                if (!boardingModule) {
                    boardingModule = createBoardingModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(boardingModule, dashboardEl);
                }
                showSection('boardingModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Transport') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Operations Department';
                let transportModule = document.getElementById('transportModule');
                if (!transportModule) {
                    transportModule = createTransportModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(transportModule, dashboardEl);
                }
                showSection('transportModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Alumni') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Operations Department';
                let alumniModule = document.getElementById('alumniModule');
                if (!alumniModule) {
                    alumniModule = createAlumniModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(alumniModule, dashboardEl);
                }
                showSection('alumniModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Inventory') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Operations Department';
                let inventoryModule = document.getElementById('inventoryModule');
                if (!inventoryModule) {
                    inventoryModule = createInventoryModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(inventoryModule, dashboardEl);
                }
                showSection('inventoryModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Continuous Assessment' || linkText === 'Assignments') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Academic Department';
                let assessmentModule = document.getElementById('assessmentModule');
                if (!assessmentModule) {
                    assessmentModule = createAssessmentModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(assessmentModule, dashboardEl);
                }
                showSection('assessmentModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Study Materials') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'E-Learning Department';
                let studyMaterialsModule = document.getElementById('studyMaterialsModule');
                if (!studyMaterialsModule) {
                    studyMaterialsModule = createStudyMaterialsModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(studyMaterialsModule, dashboardEl);
                }
                showSection('studyMaterialsModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Online Quizzes') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'E-Learning Department';
                let onlineQuizzesModule = document.getElementById('onlineQuizzesModule');
                if (!onlineQuizzesModule) {
                    onlineQuizzesModule = createOnlineQuizzesModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(onlineQuizzesModule, dashboardEl);
                }
                showSection('onlineQuizzesModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Discipline Case' || linkText === 'Discipline Cases') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Student Life Department';
                let disciplineCasesModule = document.getElementById('disciplineCasesModule');
                if (!disciplineCasesModule) {
                    disciplineCasesModule = createDisciplineCasesModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(disciplineCasesModule, dashboardEl);
                }
                showSection('disciplineCasesModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Clubs & Societies') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Student Life Department';
                let clubsSocietiesModule = document.getElementById('clubsSocietiesModule');
                if (!clubsSocietiesModule) {
                    clubsSocietiesModule = createClubsSocietiesModule(category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(clubsSocietiesModule, dashboardEl);
                }
                showSection('clubsSocietiesModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (['Visitor Logs', 'Announcements', 'Calendar', 'Documents', 'Notifications'].includes(linkText)) {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Front Office Department';
                const moduleId = `module_${linkText.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
                let utilityModule = document.getElementById(moduleId);
                if (!utilityModule) {
                    utilityModule = createFrontOfficeRecordsModule(linkText, category);
                    const dashboardEl = document.querySelector('.dashboard');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(utilityModule, dashboardEl);
                }
                showSection(moduleId);
                updateBreadcrumb([category, linkText]);
                return;
            }

            // Create or show dynamic department modules
            const parentUl = link.closest('ul.nav-links');
            const category = parentUl?.previousElementSibling?.innerText.trim() || 'General';
            const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
            const moduleId = 'module_' + slugify(linkText);

            if (!document.getElementById(moduleId)) {
                const sec = document.createElement('section');
                sec.className = 'module';
                sec.id = moduleId;
                
                const headers = ['Record ID', 'Description', 'Category', 'Status'];
                const rows = [
                    ['#001', `${linkText} Entry A`, category, 'Active'],
                    ['#002', `${linkText} Entry B`, category, 'Pending'],
                    ['#003', `${linkText} Entry C`, category, 'Review']
                ];

                sec.innerHTML = `
                    <div class="module-header">
                        <h2>${linkText}</h2>
                        <p>Department: ${category}</p>
                    </div>
                    <div class="module-body">
                        <div class="table-card" style="box-shadow: none; padding: 0; margin-top: 20px;">
                            <table>
                                <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                                <tbody>
                                    ${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
                                </tbody>
                            </table>
                        </div>
                        <div style="margin-top: 25px; display: flex; justify-content: flex-end;">
                            <button class="btn-primary" onclick="document.getElementById('dashboardBtn').click()">Back to Dashboard</button>
                        </div>
                    </div>`;
                const dashboardEl = document.querySelector('.dashboard');
                if (dashboardEl) dashboardEl.parentNode.insertBefore(sec, dashboardEl);
            }
            showSection(moduleId);
            updateBreadcrumb([category, linkText]);
        });
    });


    // Global Chart Defaults
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = colors.text;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;

    // 1. Enrollment Line Chart
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const lineGradient = lineCtx.createLinearGradient(0, 0, 0, 200);
    lineGradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
    lineGradient.addColorStop(1, 'rgba(79, 70, 229, 0)');

    const enrollmentChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
            datasets: [{
                label: 'Students',
                data: [3200, 3550, 3900, 4100, 4400, 4560],
                borderColor: colors.primary,
                backgroundColor: lineGradient,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: colors.primary,
                borderWidth: 3
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(0,0,0,0.03)' }, beginAtZero: false },
                x: { grid: { display: false } }
            }
        }
    });

    // Enrollment Toggle Logic
    const enrollmentData = {
        weekly: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: [4550, 4555, 4558, 4560, 4560, 4560, 4560]
        },
        monthly: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [4100, 4250, 4380, 4420, 4510, 4560]
        },
        yearly: {
            labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
            data: [3200, 3550, 3900, 4100, 4400, 4560]
        }
    };

    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            
            // Update UI
            this.parentElement.querySelector('.active').classList.remove('active');
            this.classList.add('active');
            
            // Update Chart
            enrollmentChart.data.labels = enrollmentData[period].labels;
            enrollmentChart.data.datasets[0].data = enrollmentData[period].data;
            enrollmentChart.update();
        });
    });

    // 2. Fees Doughnut Chart
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Paid', 'Pending'],
            datasets: [{
                data: [82, 18],
                backgroundColor: [colors.success, colors.warning],
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 15
            }]
        },
        options: {
            maintainAspectRatio: true,
            aspectRatio: 1,
            plugins: {
                legend: { position: 'bottom', labels: { padding: 15 } }
            }
        }
    });

    // 3. Attendance Bar Chart
    const barCtx = document.getElementById('barChart').getContext('2d');
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['S.1', 'S.2', 'S.3', 'S.4', 'S.5', 'S.6'],
            datasets: [{
                label: 'Attendance %',
                data: [96, 92, 95, 98, 91, 93],
                backgroundColor: colors.secondary,
                borderRadius: 6,
                barThickness: 18
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                y: { max: 100, grid: { borderDash: [5, 5], color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 4. Performance Radar Chart
    const piePerfCtx = document.getElementById('radarChart').getContext('2d');
    new Chart(piePerfCtx, {
        type: 'pie',
        data: {
            labels: ['Math', 'English', 'Science', 'History', 'Geography', 'Art'],
            datasets: [{
                label: 'Avg Score',
                data: [85, 78, 90, 75, 82, 88],
                backgroundColor: [
                    colors.primary, 
                    colors.secondary, 
                    colors.success, 
                    colors.warning, 
                    colors.danger, 
                    '#8b5cf6'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            maintainAspectRatio: true,
            aspectRatio: 1,
            plugins: {
                legend: { position: 'bottom', labels: { padding: 15 } }
            }
        }
    });

    // Modal Control Logic
    const modal = document.getElementById('studentModal');
    const addBtn = document.getElementById('addStudentBtn');
    const closeBtn = document.querySelector('.close-modal');

    if (addBtn && modal) {
        addBtn.onclick = () => {
            const currentSection = addBtn.getAttribute('data-section') || 'Dashboard';
            
            // Branch functionality based on the current section context
            if (currentSection === 'Dashboard' || currentSection === 'Students') {
                modal.classList.add('active');
            } else if (currentSection === 'Users' || currentSection === 'User Roles') {
                document.getElementById('userRolesBtn')?.click();
                setTimeout(() => document.getElementById('toggleAddUserFormBtn')?.click(), 100);
            } else if (currentSection === 'ID Cards') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'ID Cards')?.click();
                document.getElementById('idCardsModule')?.querySelector('[data-idc-new]')?.click();
                return;
            } else if (currentSection === 'Library') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Library')?.click();
                document.getElementById('libraryModule')?.querySelector('[data-lib-new]')?.click();
                return;
            } else if (currentSection === 'Attendance') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Attendance')?.click();
                document.getElementById('attendanceModule')?.querySelector('[data-att-new]')?.click();
                return;
            } else if (currentSection === 'Health/Infirmary') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Health/Infirmary')?.click();
                document.getElementById('healthModule')?.querySelector('[data-health-new]')?.click();
                return;
            } else if (currentSection === 'Boarding') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Boarding')?.click();
                document.getElementById('boardingModule')?.querySelector('[data-board-new]')?.click();
                return;
            } else if (currentSection === 'Transport') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Transport')?.click();
                document.getElementById('transportModule')?.querySelector('[data-tr-new]')?.click();
                return;
            } else if (currentSection === 'Alumni') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Alumni')?.click();
                document.getElementById('alumniModule')?.querySelector('[data-al-new]')?.click();
                return;
            } else if (currentSection === 'Inventory') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Inventory')?.click();
                document.getElementById('inventoryModule')?.querySelector('[data-inv-new]')?.click();
                return;
            } else if (currentSection === 'Certificates') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Certificates')?.click();
                document.getElementById('certificateModule')?.querySelector('[data-cert-new]')?.click();
                return;
            } else if (currentSection === 'Enquiries' || currentSection === 'Call Logs' || currentSection === 'Dispatch' || currentSection === 'Visitors' || currentSection === 'Visitor Management' || currentSection === 'Appointments' || currentSection === 'Incoming Mail' || currentSection === 'Follow-ups' || currentSection === 'Reports' || currentSection === 'Report Cards' || ['Visitor Logs', 'Announcements', 'Calendar', 'Documents', 'Notifications'].includes(currentSection)) {
                if (currentSection === 'Reports') {
                    Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Reports')?.click();
                    document.getElementById('module_front_office_reports')?.querySelector('[data-report-export]')?.click();
                    return;
                }
                if (currentSection === 'Report Cards') {
                    Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Report Cards')?.click();
                    document.getElementById('module_report_cards')?.querySelector('[data-report-new]')?.click();
                    return;
                }
                if (['Visitor Logs', 'Announcements', 'Calendar', 'Documents', 'Notifications'].includes(currentSection)) {
                    Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === currentSection)?.click();
                    const utilityModuleId = `module_${currentSection.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
                    document.getElementById(utilityModuleId)?.querySelector('[data-utility-new]')?.click();
                    return;
                }
                const moduleId = currentSection === 'Call Logs' ? 'module_call_logs' : currentSection === 'Dispatch' ? 'module_dispatch' : currentSection === 'Visitors' || currentSection === 'Visitor Management' ? 'module_visitors' : currentSection === 'Appointments' ? 'module_appointments' : currentSection === 'Incoming Mail' ? 'module_incoming_mail' : currentSection === 'Follow-ups' ? 'module_follow_ups' : 'module_enquiries';
                const fieldName = currentSection === 'Call Logs' ? 'callerName' : currentSection === 'Dispatch' ? 'dispatchType' : currentSection === 'Visitors' || currentSection === 'Visitor Management' ? 'visitorType' : currentSection === 'Appointments' ? 'appointmentType' : currentSection === 'Incoming Mail' ? 'mailType' : currentSection === 'Follow-ups' ? 'relatedModule' : 'name';
                const module = document.getElementById(moduleId);
                module?.querySelector('[data-enquiry-new]')?.click();
                module?.querySelector(`[name="${fieldName}"]`)?.focus();
            } else {
                // Placeholder for other module forms
                console.log(`Action triggered for ${currentSection}. Form implementation pending.`);
                modal.classList.add('active'); // Default fallback for UI consistency
            }
        };
        closeBtn.onclick = () => modal.classList.remove('active');
        // Close when clicking outside content
        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.remove('active');
        }
    }

    // Form 019 Submission and Handling
    const saveStudentBtn = document.getElementById('saveStudentBtn');
    const studentRegForm = document.getElementById('addStudentForm');
    
    if (saveStudentBtn && studentRegForm) {
        saveStudentBtn.onclick = () => {
            studentRegForm.requestSubmit();
        };

        studentRegForm.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(studentRegForm);
            const studentData = Object.fromEntries(formData.entries());
            console.log("Saving Student Registration (Form 019):", studentData);
            alert(`Student ${studentData.fullName} registered successfully!`);
            modal.classList.remove('active');
            studentRegForm.reset();
        };
    }

    // Dark Mode Toggle Logic
    const darkToggle = document.getElementById('darkToggle');
    if (darkToggle) {
        darkToggle.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.toggle('dark');
            
            const isDark = document.body.classList.contains('dark');
            darkToggle.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            
            // Update Chart Colors for Dark Mode
            const newTextColor = isDark ? '#e2e8f0' : '#64748b';
            Chart.instances.forEach(chart => {
                chart.options.scales?.x && (chart.options.scales.x.ticks.color = newTextColor);
                chart.options.scales?.y && (chart.options.scales.y.ticks.color = newTextColor);
                chart.update();
            });
        });
    }

    // Sidebar Toggle Functionality
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('.main');

    if (sidebarToggle && sidebar && main) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            main.classList.toggle('expanded');
        });
    }

    function applyPermissions(role) {
        // The new SidebarController handles the menu rendering.
        // We just need to trigger a re-render if the role changes.
        if (window.sidebarInstance) {
            window.sidebarInstance.renderSidebar();
        }

        // 4. Update Profile Display
        document.querySelector('.profile-role').textContent = role;
        document.querySelector('.profile h4').textContent = role === 'Head Teacher' ? 'Administrator' : role;
    }
});