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

    const showSampleUser = (schoolData) => {
        if (!sampleUsersContainer || !schoolData) return;
        sampleUserValue.textContent = schoolData.adminUser;
        samplePasswordValue.textContent = schoolData.password;
        sampleUsersContainer.classList.remove('hidden');
    };

    const hideSampleUser = () => {
        sampleUsersContainer?.classList.add('hidden');
    };

    const unlockDashboard = (schoolData) => {
        loginScreen.classList.remove('active');
        container.classList.remove('hidden');
        document.querySelector('.welcome h1').textContent = `${schoolData.schoolName} Admin Dashboard`;
        document.querySelector('.welcome p').textContent = 'Welcome back, School Admin. Your dashboard is ready.';
        document.querySelector('.profile h4').textContent = 'School Admin';
        document.querySelector('.profile-role').textContent = schoolData.role;
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
            currentSchool = schoolData;
            unlockDashboard(schoolData);
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
        showSampleUser(currentSchool);
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
        if (userId !== normalizeUserId(currentSchool.adminUser) || password !== currentSchool.password.trim()) {
            showError(adminError, 'Incorrect user ID or password.');
            return;
        }
        showError(adminError, '');
        saveSession({ schoolId: normalizeSchoolId(schoolIdInput.value), step: 2, authenticated: true });
        unlockDashboard(currentSchool);
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

    cancelUserFormBtn?.addEventListener('click', () => {
        addUserForm.classList.add('hidden');
        clearForm();
    });

    const usersKey = 'edumasterUsers';
    let editingUserId = null;

    function updateBreadcrumb(items) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;
        breadcrumb.innerHTML = items.map((item, index) => {
            const isLast = index === items.length - 1;
            return `<span class="${isLast ? 'active-crumb' : ''}">${item}</span>`;
        }).join('');
    }

    function hideAllContentAreas(){
        const sections = ['.dashboard', '.modules', '.charts', '.table-card', '#userRolesSection'];
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
        document.querySelectorAll('.dashboard, .modules, .charts, .table-card').forEach(el => {
            if (el) el.classList.remove('hidden');
        });
        updateBreadcrumb(['Main', 'Dashboard']);
    }

    rolesBackBtn?.addEventListener('click', () => showDashboard());

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
        sectionsContainerEl.innerHTML = '';
        const titles = Array.from(document.querySelectorAll('.menu-title')).map(t => t.innerText.trim());
        titles.forEach(name => {
            const id = 'sec_' + name.replace(/\s+/g,'_');
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" value="${name}" id="${id}"> ${name}`;
            sectionsContainerEl.appendChild(label);
        });
    }

    function renderUsersTable(){
        const users = loadUsers();
        usersTableBody.innerHTML = '';
        users.forEach(u => {
            const tr = document.createElement('tr');
            const perms = [];
            if (u.perms?.view) perms.push('V');
            if (u.perms?.edit) perms.push('E');
            if (u.perms?.delete) perms.push('D');
            tr.innerHTML = `<td>${u.fullName}</td><td>${u.userId}</td><td>${u.role}</td><td>${(u.sections||[]).join(', ')}</td><td class="small">${perms.join(', ')}</td><td>
                <button class="btn-secondary action-btn" data-action="edit" data-id="${u.id}">Edit</button>
                <button class="btn-secondary action-btn" data-action="delete" data-id="${u.id}">Delete</button>
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
    }

    addUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullNameInput').value.trim();
        const userId = document.getElementById('userIdInputNew').value.trim();
        const password = document.getElementById('passwordInputNew').value;
        const role = document.getElementById('roleSelect').value;
        const sections = Array.from(sectionsContainerEl.querySelectorAll('input[type="checkbox"]:checked')).map(i=>i.value);
        const perms = { view: !!document.getElementById('canView').checked, edit: !!document.getElementById('canEdit').checked, delete: !!document.getElementById('canDelete').checked };
        if (!fullName || !userId) return alert('Please provide name and user ID.');
        const users = loadUsers();
        if (editingUserId){
            const idx = users.findIndex(u=>u.id===editingUserId);
            if (idx>=0){ 
                users[idx] = { ...users[idx], fullName, userId, password, role, sections, perms }; 
                saveUsers(users); renderUsersTable(); clearForm(); addUserForm.classList.add('hidden');
                return; 
            }
        }
        const id = 'u_' + Date.now();
        users.push({ id, fullName, userId, password, role, sections, perms });
        saveUsers(users); renderUsersTable(); clearForm(); addUserForm.classList.add('hidden');
    });

    usersTableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        const users = loadUsers();
        if (action === 'delete'){
            const u = users.find(x=>x.id===id);
            if (!u || !confirm(`Are you sure you want to delete the account for "${u.fullName}"?`)) return;
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
            // sections
            sectionsContainerEl.querySelectorAll('input[type="checkbox"]').forEach(ch => ch.checked = u.sections?.includes(ch.value));
            document.getElementById('canView').checked = !!u.perms.view;
            document.getElementById('canEdit').checked = !!u.perms.edit;
            document.getElementById('canDelete').checked = !!u.perms.delete;
            editingUserId = u.id;
            window.scrollTo({ top: addUserForm.offsetTop - 80, behavior: 'smooth' });
        }
    });

    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (ev) => {
            ev.preventDefault();
            navLinks.forEach(n => n.classList.remove('active'));
            link.classList.add('active');

            if (link.id === 'dashboardBtn') {
                showDashboard();
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

            // Create or show dynamic department modules
            const linkText = link.querySelector('span')?.innerText.trim() || link.innerText.trim();
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
        addBtn.onclick = () => modal.classList.add('active');
        closeBtn.onclick = () => modal.classList.remove('active');
        // Close when clicking outside content
        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.remove('active');
        }
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

    // --- Role-Based Permissions Logic ---
    const rolePermissions = {
        'Head Teacher': ['Main', 'Front Office Department', 'Academic Department', 'E-Learning Department', 'Operations Department', 'Student Life Department', 'Human Resources Department', 'Payroll Department', 'Finance Department', 'Procurement Department', 'Assets & Security Department', 'Communication Department', 'System'],
        'Teacher': ['Main', 'Academic Department', 'E-Learning Department', 'Student Life Department', 'Communication Department', 'System'],
        'Bursar': ['Main', 'Payroll Department', 'Finance Department', 'Procurement Department', 'System'],
        'Secretary': ['Main', 'Front Office Department', 'Communication Department', 'System']
    };

    function applyPermissions(role) {
        // 1. Sidebar Sections Visibility
        const titles = document.querySelectorAll('.menu-title');
        const permitted = rolePermissions[role] || [];

        titles.forEach(title => {
            const sectionName = title.innerText.trim();
            const navList = title.nextElementSibling;
            const isVisible = permitted.includes(sectionName);
            
            title.style.display = isVisible ? 'flex' : 'none';
            if (navList && navList.classList.contains('nav-links')) {
                navList.style.display = isVisible ? 'block' : 'none';
            }
        });
        
        // 2. Dashboard Card Visibility (Sensitive Finance Data)
        const cards = document.querySelectorAll('.dashboard .card');
        if (cards.length >= 3) {
            // Index 2 is the "Fees Collected" card
            cards[2].style.display = (role === 'Head Teacher' || role === 'Bursar') ? 'block' : 'none';
        }

        // 3. Action Button Visibility
        const addBtn = document.getElementById('addStudentBtn');
        if (addBtn) addBtn.style.display = (role === 'Head Teacher' || role === 'Secretary') ? 'flex' : 'none';

        // 4. Update Profile Display
        document.querySelector('.profile-role').textContent = role;
        document.querySelector('.profile h4').textContent = role === 'Head Teacher' ? 'Administrator' : role;
    }

    // Profile click demo removed to prevent accidental role/user switching
});