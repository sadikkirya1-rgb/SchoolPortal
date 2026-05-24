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