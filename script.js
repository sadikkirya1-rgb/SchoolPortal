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
        saveSession({ schoolId: normalizeSchoolId(schoolIdInput.value), userId: userId, step: 2, authenticated: true });
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
            } else {
                code.textContent = '••••••••';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
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