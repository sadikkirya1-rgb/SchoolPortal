document.addEventListener('DOMContentLoaded', () => {
    let restoreSavedSection = () => {};
    let deferredInstallPrompt = null;

    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        deferredInstallPrompt = event;
        const installButton = document.getElementById('installPortalButton');
        installButton?.classList.remove('hidden');
    });
    const installButton = document.getElementById('installPortalButton');
    const alreadyInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (installButton && !alreadyInstalled && window.matchMedia('(max-width: 768px)').matches) {
        installButton.classList.remove('hidden');
    }
    window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;
        document.getElementById('installPortalButton')?.classList.add('hidden');
    });
    document.getElementById('installPortalButton')?.addEventListener('click', async () => {
        if (!deferredInstallPrompt) {
            alert('To install on iPhone or iPad, open this portal in Safari, tap Share, then choose Add to Home Screen. On other devices, use your browser menu and choose Install app or Add to Home Screen.');
            return;
        }
        await deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        document.getElementById('installPortalButton')?.classList.add('hidden');
    });

    const removeDashboardHeaderAddButtons = () => {
        const selectors = [
            '.dashboard-header button',
            '.dashboard-header a',
            '.module-header button',
            '.module-header a',
            '.section-header button',
            '.section-header a',
            '.panel-header button',
            '.panel-header a',
            '.table-header button',
            '.table-header a',
            '.header-actions button',
            '.header-actions a',
            '.toolbar button',
            '.toolbar a'
        ];

        const isAddAction = (element) => {
            if (!element) return false;
            if (element.closest('#userRolesSection') || element.matches('[data-open-user-form]')) return false;

            const getTextValue = (value) => (value || '').replace(/\s+/g, ' ').trim().toLowerCase();
            const rawText = getTextValue(
                element.textContent ||
                element.getAttribute('aria-label') ||
                element.getAttribute('title') ||
                element.dataset.action ||
                ''
            );

            const className = getTextValue(element.className || '');
            const parentClasses = getTextValue(element.closest('[class]')?.className || '');

            if (!rawText && !className && !parentClasses) return false;

            const addPatterns = [
                /^add(?:\s|$)/,
                /(^|\s)add(?:\s|$)/,
                /\badd\s+new\b/,
                /\bnew\s+(?:entry|record|student|teacher|user|class|subject|invoice|payment|expense|request|announcement|notice|event)\b/,
                /\b(?:new|create)\b.*\b(?:entry|record|student|teacher|user|class|subject|invoice|payment|expense|request|announcement|notice|event)\b/
            ];

            if (addPatterns.some((pattern) => pattern.test(rawText))) return true;
            if (className.includes('add') || parentClasses.includes('add')) return true;
            if ((element.getAttribute('data-action') || '').toLowerCase().includes('add')) return true;
            return false;
        };

        selectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((element) => {
                if (isAddAction(element)) {
                    element.remove();
                }
            });
        });
    };

    const dashboardHeaderAddObserver = new MutationObserver(() => {
        removeDashboardHeaderAddButtons();
    });
    dashboardHeaderAddObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
    removeDashboardHeaderAddButtons();

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
    const referenceLoginPage = document.querySelector('.reference-login-page');
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

    let currentSchool = null;
    let resetReferenceLogin = () => {};
    const appBaseTitle = document.title;
    const schoolLabelElement = document.querySelector('.logo-copy h2');
    const defaultSchoolName = schoolLabelElement?.textContent.trim() || 'EduMaster UG';
    const schoolLogoMark = document.getElementById('schoolLogoMark');
    const defaultSchoolLogo = schoolLogoMark?.querySelector('i')?.cloneNode(true);
    const setApplicationPage = (section = 'Dashboard') => {
        const schoolName = currentSchool?.schoolName || defaultSchoolName;
        const title = document.querySelector('.welcome h1');
        if (title) title.textContent = section === 'Dashboard' ? `${schoolName} Dashboard` : section;
        if (schoolLabelElement) schoolLabelElement.textContent = schoolName;
        document.title = section === 'Dashboard'
            ? `${schoolName} | Dashboard`
            : `${section} | ${schoolName || appBaseTitle}`;

        const logoUrl = currentSchool?.logoURL;
        if (schoolLogoMark && logoUrl) {
            let safeLogoUrl = '';
            try {
                const parsedLogoUrl = new URL(logoUrl, window.location.href);
                if (parsedLogoUrl.protocol === 'https:' || parsedLogoUrl.origin === window.location.origin) {
                    safeLogoUrl = parsedLogoUrl.href;
                }
            } catch (error) {
                console.warn('The school logo URL is invalid.', error);
            }
            if (safeLogoUrl) {
                let logoImage = schoolLogoMark.querySelector('img');
                if (!logoImage) {
                    logoImage = document.createElement('img');
                    logoImage.loading = 'eager';
                    schoolLogoMark.replaceChildren(logoImage);
                    logoImage.addEventListener('error', () => {
                        if (schoolLogoMark.querySelector('img') !== logoImage) return;
                        console.warn(`Unable to load the logo for ${schoolName}.`);
                        if (defaultSchoolLogo) schoolLogoMark.replaceChildren(defaultSchoolLogo.cloneNode(true));
                    }, { once: true });
                }
                logoImage.alt = `${schoolName} logo`;
                logoImage.src = safeLogoUrl;
                return;
            }
        }
        const logoImage = schoolLogoMark?.querySelector('img');
        if (logoImage && defaultSchoolLogo) schoolLogoMark.replaceChildren(defaultSchoolLogo.cloneNode(true));
    };

    const logoutBtn = document.getElementById('logoutBtn');
    const storageKey = 'edumasterAdminSession';

    const normalizeSchoolId = (value) => {
        return value
            .replace(/[\u200B-\u200D\uFEFF]/g, '') // strip hidden unicode chars
            .replace(/\s+/g, '')
            .toUpperCase();
    };

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

    const landingStatElements = new Map(
        Array.from(document.querySelectorAll('[data-stat-count]'), element => [element.dataset.statCount, element])
    );
    const loadLandingStats = async () => {
        if (!landingStatElements.size) return;
        try {
            const response = await fetch('https://us-central1-delivery-app-6a47f.cloudfunctions.net/getPublicPlatformStats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: {} })
            });
            if (!response.ok) throw new Error(`Cloud statistics request failed with HTTP ${response.status}.`);
            const payload = await response.json();
            const stats = payload.result;
            if (!stats || typeof stats !== 'object') throw new Error('Cloud statistics response was invalid.');
            for (const [name, element] of landingStatElements) {
                const count = stats[name];
                if (!Number.isSafeInteger(count) || count < 0) {
                    throw new Error(`Cloud statistics returned an invalid ${name} count.`);
                }
                element.textContent = count.toLocaleString();
            }
        } catch (error) {
            console.error('Unable to load live cloud statistics.', error);
            landingStatElements.forEach(element => { element.textContent = '0'; });
        }
    };
    loadLandingStats();

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
        showError(schoolError, '');
        showError(adminError, '');
    };

    const getFirebase = () => {
        if (!window.schoolPortalFirebase) throw new Error('Firebase is not ready yet. Check your connection and try again.');
        return window.schoolPortalFirebase;
    };
    const waitForFirebase = () => {
        const isReady = () => window.schoolPortalFirebase && window.schoolPortalData;
        if (isReady()) return Promise.resolve(window.schoolPortalFirebase);
        return new Promise((resolve, reject) => {
            const cleanup = () => {
                clearTimeout(timeoutId);
                window.removeEventListener('school-portal-firebase-ready', onReady);
                window.removeEventListener('school-portal-firebase-error', onError);
            };
            const finish = (error, firebase) => {
                cleanup();
                if (error) reject(error);
                else resolve(firebase);
            };
            const onReady = () => {
                if (!isReady()) {
                    finish(new Error('Firebase finished loading without initializing school data.'));
                    return;
                }
                finish(null, window.schoolPortalFirebase);
            };
            const onError = event => finish(event.detail || new Error('Firebase failed to initialize.'));
            const timeoutId = setTimeout(
                () => finish(new Error('Timed out while waiting for Firebase to initialize.')),
                15000
            );
            window.addEventListener('school-portal-firebase-ready', onReady, { once: true });
            window.addEventListener('school-portal-firebase-error', onError, { once: true });
        });
    };
    const isPrivilegedRole = role => ['schoolAdmin', 'superAdmin', 'director', 'headTeacher'].includes(role);
    const normalizeMember = (membership, authUser) => ({
        ...membership,
        fullName: membership.fullName || membership.profile?.name || authUser.displayName || authUser.email || 'User',
        userId: membership.userId || authUser.email,
        email: membership.email || authUser.email,
        role: membership.role || 'student',
        perms: membership.perms || { view: true },
        photo: membership.photoURL || membership.photo || membership.profile?.photoURL || authUser.photoURL || ''
    });

    const dashboardCollections = ['students', 'teachers', 'parents', 'fees', 'expenses', 'notices', 'calendarEvents', 'attendance'];
    const dashboardData = Object.fromEntries(dashboardCollections.map(name => [name, { loaded: false, records: [], error: false }]));
    let dashboardSubscriptions = [];
    let dashboardIdentityKey = '';
    let notificationUnsubscribe = null;
    let notificationIdentityKey = '';
    let notificationItems = [];
    let notificationStatus = 'Sign in to view notifications.';
    let notificationError = false;
    let dashboardSubscribedCollections = new Set();
    let dashboardLastUpdated = null;
    const dashboardToday = new Date();
    let calendarViewMonth = new Date(dashboardToday.getFullYear(), dashboardToday.getMonth(), 1);
    let calendarSelectedDate = new Date(dashboardToday.getFullYear(), dashboardToday.getMonth(), dashboardToday.getDate());
    let chartViewYear = dashboardToday.getFullYear();
    let selectedChartMonth = null;
    let selectedGender = null;
    let selectedDashboardPeriod = 'month';

    const dashboardNumber = value => {
        const number = typeof value === 'number' ? value : Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
        return Number.isFinite(number) ? number : 0;
    };
    const dashboardDateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const parseDashboardDate = value => {
        if (typeof value?.toDate === 'function') return value.toDate();
        if (value instanceof Date) return new Date(value.getTime());
        if (typeof value === 'string') {
            const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (dateOnly) {
                const year = Number(dateOnly[1]);
                const month = Number(dateOnly[2]) - 1;
                const day = Number(dateOnly[3]);
                const date = new Date(year, month, day);
                return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
                    ? date
                    : new Date(Number.NaN);
            }
        }
        return new Date(value);
    };
    const dashboardDate = record => {
        const value = record.paymentDate || record.expenseDate || record.eventDate || record.scheduledDate || record.dueDate
            || record.startDate || record.publishDate || record.date || record.createdAt || '';
        const date = parseDashboardDate(value);
        return Number.isNaN(date.getTime()) ? null : date;
    };
    const dashboardDateLabel = value => {
        const date = value ? parseDashboardDate(value) : null;
        return date && !Number.isNaN(date.getTime())
            ? date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Date not set';
    };
    const dashboardEscape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
    const dashboardMoney = value => `UGX ${value.toLocaleString('en-UG', { maximumFractionDigits: 0 })}`;
    const feePaidAmount = fee => dashboardNumber(fee.amountPaid ?? fee.paidAmount ?? fee.amountCollected);
    const feeBilledAmount = fee => {
        const billed = fee.totalFee ?? fee.totalAmount ?? fee.amountDue;
        if (billed !== undefined && billed !== null) return dashboardNumber(billed);
        const balance = fee.balance ?? fee.balanceDue;
        return balance !== undefined && balance !== null ? feePaidAmount(fee) + dashboardNumber(balance) : 0;
    };
    const feeOutstandingAmount = fee => {
        const balance = fee.balance ?? fee.balanceDue;
        return balance !== undefined && balance !== null
            ? Math.max(0, dashboardNumber(balance))
            : Math.max(0, feeBilledAmount(fee) - feePaidAmount(fee));
    };
    const feeIsFullyPaid = fee => {
        const status = String(fee.status || '').trim().toLowerCase();
        const billed = feeBilledAmount(fee);
        return ['paid', 'complete', 'completed', 'fully paid'].includes(status)
            && billed > 0
            && feePaidAmount(fee) >= billed
            && feeOutstandingAmount(fee) === 0;
    };
    const parentPortalCollections = ['students', 'attendance', 'assessments', 'reportCards', 'examResults', 'fees', 'timetables', 'studyMaterials', 'notices'];
    const parentPortalPersonalCollections = new Set(['students', 'attendance', 'assessments', 'reportCards', 'examResults', 'fees']);
    const parentPortalData = Object.fromEntries(parentPortalCollections.map(collection => [
        collection,
        { loaded: false, records: [], error: false }
    ]));
    let parentDashboardSummary = { loaded: false, records: null, error: false };
    let parentPortalIdentityKey = '';
    let activeParentPortalView = '';
    let parentCertificatesExpanded = false;
    const parentStudentId = record => String(record.studentId || record.studentID || record.student_id
        || record.linkedStudentId || record.linkedRecordId || record.linkedChildId
        || record.childId || record.childID || record.learnerId
        || (record.student && typeof record.student === 'object'
            ? record.student.id || record.student.studentId || record.student.studentID || ''
            : '') || '');
    const parentStudentRecordId = record => String(record.id || record.studentId || record.studentID || record.student_id || '');
    const parentPortalMatchesChild = (record, collection, childId) => collection === 'students'
        ? parentStudentRecordId(record) === childId
        : parentStudentId(record) === childId
            || (collection === 'attendance' && String(record.memberId || '') === childId)
            || (!parentStudentId(record) && String(record.id || '') === childId);
    const parentPortalMatchesStudentContext = (record, collection, child) => {
        const childId = parentStudentRecordId(child);
        if (parentPortalPersonalCollections.has(collection)) return parentPortalMatchesChild(record, collection, childId);
        const linkedStudentId = parentStudentId(record);
        if (linkedStudentId) return linkedStudentId === childId;
        const recordClassId = String(record.classId || record.classID || '');
        const childClassId = String(child.classId || child.classID || '');
        if (recordClassId) return Boolean(childClassId && recordClassId === childClassId);
        const recordClass = record.className || record.class || record.grade || '';
        const childClass = child.className || child.class || child.grade || '';
        const recordSection = String(record.section || record.sectionName || '');
        const childSection = String(child.section || child.sectionName || '');
        if (recordClass) {
            const normalize = value => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
            const recordNames = [recordClass, `${recordClass} ${recordSection}`].map(normalize);
            const childNames = [childClass, `${childClass} ${childSection}`].map(normalize);
            return recordNames.some(name => childNames.includes(name));
        }
        if (recordSection && childSection && recordSection !== childSection) return false;
        if (collection === 'notices') {
            const audience = record.audienceRoles || record.targetRoles || record.targetAudience || record.audience;
            if (audience) {
                const text = (Array.isArray(audience) ? audience : [audience]).join(' ').toLowerCase();
                const parentFacing = /\b(parent|parents|family|families|guardian|guardians)\b/.test(text);
                const broadlyVisible = /^(all|everyone|whole school|schoolwide|all users)$/i.test(text.trim());
                if (!parentFacing && !broadlyVisible) return false;
            }
        }
        return true;
    };
    const parentNumber = value => {
        const parsed = Number.parseFloat(String(value ?? '').replace(/,/g, '').replace('%', '').trim());
        return Number.isFinite(parsed) ? parsed : null;
    };
    const parentFirstNumber = (record, fields) => {
        for (const field of fields) {
            const value = parentNumber(record?.[field]);
            if (value !== null) return value;
        }
        return null;
    };
    const parentResultRows = (record, collection) => {
        const nestedFields = ['subjectResults', 'subjectMarks', 'marksDetails', 'scores', 'results', 'marks'];
        const nestedRows = nestedFields.map(field => record?.[field]).find(Array.isArray) || [];
        const candidates = nestedRows.length ? nestedRows.map(row => ({ ...record, ...row })) : [record];
        return candidates.flatMap(row => {
            const subject = row.subjectName || row.subject || row.paperName || row.courseName || row.course;
            if (!subject) return [];
            const maximum = parentFirstNumber(row, ['maxMarks', 'maximumMarks', 'totalMarks', 'maxScore', 'outOf', 'fullMarks', 'max', 'marks']);
            const score = parentFirstNumber(row, ['obtainedMarks', 'marksObtained', 'marksScored', 'score', 'obtained', 'achievedMarks', 'value']);
            const explicitPercentage = parentFirstNumber(row, ['percentage', 'percent', 'scorePercent', 'marksPercentage', 'averagePercentage']);
            const percentage = explicitPercentage ?? (maximum > 0 && score !== null ? score / maximum * 100 : null);
            if (percentage === null) return [];
            const status = String(row.status || row.publicationStatus || row.publication || '').trim().toLowerCase();
            if (status && !['published', 'released', 'completed', 'graded', 'closed', 'final'].includes(status)) return [];
            if (row.isPublished === false || row.published === false || String(row.visibility || '').toLowerCase() === 'private') return [];
            const typeLabel = [row.assessmentType, row.examType, row.type, row.period, row.academicPeriod, row.term]
                .filter(Boolean).join(' ').toLowerCase();
            const explicitAssessmentType = [row.assessmentType, row.examType, row.type]
                .filter(Boolean).join(' ').toLowerCase();
            const isExam = explicitAssessmentType
                ? /exam|term|semester|final/.test(explicitAssessmentType)
                : /term|exam|semester|final|report/.test(typeLabel) || collection === 'reportCards';
            return [{
                subject: String(subject),
                maximum,
                score,
                percentage: Math.min(100, Math.max(0, percentage)),
                assessment: String(row.assessmentName || row.examName || row.testName || row.title || ''),
                remarks: String(row.remarks || row.teacherRemarks || ''),
                type: isExam ? 'Term exam' : 'Test',
                date: row.assessmentDate || row.examDate || row.date || row.publishedAt || row.createdAt || '',
                period: row.period || row.academicPeriod || row.term || '',
                studentId: parentStudentId(record)
            }];
        });
    };
    const parentPortalViewConfig = {
        Students: { collection: 'students', title: 'My Children', description: 'Profiles linked to your parent account.', icon: 'fa-child' },
        'Report Cards': { collection: 'reportCards', title: 'Report Cards', description: 'Published academic results for linked students.', icon: 'fa-square-poll-vertical' },
        'Exam Results': { collection: 'examResults', title: 'Exam & Test Results', description: 'Published exam and test marks for linked students.', icon: 'fa-clipboard-check' },
        Assignments: { collection: 'assessments', title: 'Assignments', description: 'Learning tasks and assessment details for the selected student.', icon: 'fa-book-open' },
        Timetables: { collection: 'timetables', title: 'Timetable', description: 'Class schedule associated with the selected student.', icon: 'fa-calendar-days' },
        'Study Materials': { collection: 'studyMaterials', title: 'Study Materials', description: 'Learning resources shared with the selected student or class.', icon: 'fa-folder-open' },
        Attendance: { collection: 'attendance', title: 'Attendance', description: 'Attendance records for the selected student.', icon: 'fa-calendar-check' },
        Fees: { collection: 'fees', title: 'Fees', description: 'Fee balances and payment records for the selected student.', icon: 'fa-receipt' },
        'Notice Board': { collection: 'notices', title: 'School Notices', description: 'Notices available to parents and linked classes.', icon: 'fa-bullhorn' }
    };
    const parentPortalRecordValue = (record, fields) => {
        for (const field of fields) {
            const value = record?.[field];
            if (value !== undefined && value !== null && value !== '') {
                return Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? value.name || value.title || '' : value;
            }
        }
        return '';
    };
    const parentPortalRecordIsVisible = (record, collection) => {
        if (record.deleted === true || record.isPublished === false || record.published === false
            || String(record.visibility || '').toLowerCase() === 'private') return false;
        const status = String(record.status || record.publicationStatus || '').trim().toLowerCase();
        if (['reportCards', 'examResults'].includes(collection) && status && !['published', 'released'].includes(status)) return false;
        return !['draft', 'archived', 'deleted', 'private'].includes(status);
    };
    function renderParentPortalDetailView(container, children, selectedChild, permissions, adminPreview) {
        const detail = container.querySelector('[data-parent-detail-view]');
        const content = container.querySelector('[data-parent-detail-content]');
        const config = parentPortalViewConfig[activeParentPortalView];
        const isDocumentsView = activeParentPortalView === 'Documents';
        const isOpen = Boolean(config) || isDocumentsView;
        const recordsSection = container.querySelector('.parent-records-section');
        const idCardsSection = container.querySelector('.parent-id-cards-section');
        const certificatesSection = container.querySelector('.parent-certificates-section');
        const reportCardsGroup = container.querySelector('[data-parent-record-cards="reportCards"]')?.closest('.parent-record-group');
        const documentsHeading = container.querySelector('[data-parent-documents-heading]');
        [
            container.querySelector('.parent-portal-overview'),
            container.querySelector('.parent-attendance-panel'),
            container.querySelector('[data-parent-attendance-calendar-section]'),
            recordsSection,
            idCardsSection,
            certificatesSection,
            container.querySelector('.parent-portal-attendance-summary'),
            container.querySelector('[data-parent-student-section]'),
            container.querySelector('[data-parent-results-section]'),
            ...container.querySelectorAll(':scope > .parent-portal-section')
        ].filter(Boolean).forEach(section => {
            const visibleInDocuments = isDocumentsView
                && [recordsSection, idCardsSection, certificatesSection].includes(section);
            section.classList.toggle('hidden', isOpen && !visibleInDocuments);
        });
        recordsSection?.querySelectorAll(':scope > .parent-record-groups > .parent-record-group').forEach(group => {
            group.classList.toggle('hidden', isDocumentsView
                ? group !== reportCardsGroup
                : group === reportCardsGroup);
        });
        idCardsSection?.classList.toggle('hidden', !isDocumentsView);
        certificatesSection?.classList.toggle('hidden', !isDocumentsView);
        documentsHeading?.classList.toggle('hidden', !isDocumentsView);
        if (isDocumentsView) {
            const idCardList = idCardsSection?.querySelector('[data-parent-id-cards]');
            idCardList?.classList.remove('hidden');
            idCardsSection?.querySelector('[data-parent-id-cards-toggle]')?.setAttribute('aria-expanded', 'true');
        }
        detail?.classList.toggle('hidden', !isOpen || isDocumentsView);
        if (!isOpen || !detail || !content) return;
        if (isDocumentsView) return;

        const title = detail.querySelector('[data-parent-detail-title]');
        const description = detail.querySelector('[data-parent-detail-description]');
        const icon = detail.querySelector('[data-parent-detail-icon]');
        if (title) title.textContent = config.title;
        if (description) description.textContent = config.description;
        if (icon) icon.innerHTML = `<i class="fas ${config.icon}" aria-hidden="true"></i>`;
        const canView = adminPreview || canViewParentPortalCollection(config.collection);
        if (!canView) {
            content.innerHTML = '<p class="parent-detail-message" role="status"><i class="fas fa-lock" aria-hidden="true"></i><span>This section has not been enabled for your account. Contact your school administrator for access.</span></p>';
            return;
        }
        if (config.collection === 'students') {
            const studentData = parentPortalData.students;
            if (studentData.error && !studentData.loaded) {
                content.innerHTML = '<p class="parent-detail-message" role="status"><i class="fas fa-triangle-exclamation" aria-hidden="true"></i><span>Linked student profiles could not be loaded. Please try again later.</span></p>';
                return;
            }
            if (!studentData.loaded) {
                content.innerHTML = '<p class="parent-detail-message" role="status"><i class="fas fa-spinner" aria-hidden="true"></i><span>Loading linked student profiles…</span></p>';
                return;
            }
            const visibleChildren = selectedChild === 'all' ? children
                : children.filter(child => parentStudentRecordId(child) === selectedChild);
            content.innerHTML = visibleChildren.length ? `<div class="parent-detail-student-grid">${visibleChildren.map(child => {
                const id = parentStudentRecordId(child);
                const name = child.fullName || child.name || child.studentName || child.displayName || 'Student';
                const initials = String(name).split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase();
                const fields = [
                    ['Student ID', child.admissionNumber || child.studentCode || id],
                    ['Class', [child.className || child.class, child.section].filter(Boolean).join(' · ')],
                    ['Academic year', child.academicYear || child.year],
                    ['Status', child.status]
                ].filter(([, value]) => value);
                return `<article class="parent-detail-student-card"><span class="parent-student-avatar parent-student-avatar-large" aria-hidden="true">${dashboardEscape(initials || 'S')}</span><div class="parent-detail-student-copy"><h4>${dashboardEscape(name)}</h4><dl>${fields.map(([label, value]) => `<div><dt>${dashboardEscape(label)}</dt><dd>${dashboardEscape(value)}</dd></div>`).join('')}</dl></div></article>`;
            }).join('')}</div>` : '<p class="parent-detail-message" role="status">No linked student profiles are available.</p>';
            return;
        }

        const dataset = parentPortalData[config.collection];
        if (dataset.error && !dataset.loaded) {
            content.innerHTML = '<p class="parent-detail-message" role="status"><i class="fas fa-triangle-exclamation" aria-hidden="true"></i><span>This information could not be loaded. Please try again later.</span></p>';
            return;
        }
        if (!dataset.loaded) {
            content.innerHTML = '<p class="parent-detail-message" role="status"><i class="fas fa-spinner" aria-hidden="true"></i><span>Loading information for linked students…</span></p>';
            return;
        }
        const matchedChildren = children.filter(child => selectedChild === 'all' || parentStudentRecordId(child) === selectedChild);
        const records = dataset.records.filter(record => parentPortalRecordIsVisible(record, config.collection)
            && matchedChildren.some(child => parentPortalMatchesStudentContext(record, config.collection, child)));
        const columnsByCollection = {
            reportCards: [
                ['Report', record => parentPortalRecordValue(record, ['reportName', 'title', 'name', 'no', 'reportNo']) || 'Report card'],
                ['Student', record => parentPortalRecordValue(record, ['studentName', 'student', 'fullName']) || matchedChildren.find(child => parentPortalMatchesStudentContext(record, config.collection, child))?.fullName || matchedChildren[0]?.fullName || matchedChildren[0]?.name || 'Student'],
                ['Period', record => parentPortalRecordValue(record, ['period', 'academicPeriod', 'term', 'year']) || '—'],
                ['Average', record => parentPortalRecordValue(record, ['average', 'percentage', 'averagePercentage']) || '—'],
                ['Subject results', record => (Array.isArray(record.subjectResults) ? record.subjectResults : [])
                    .map(result => `${result.assessmentName || 'Assessment'} · ${result.subjectName || result.subject || 'Subject'}: ${result.obtainedMarks ?? result.score ?? '—'}/${result.maxMarks ?? result.maximumMarks ?? '—'} (${Number(result.percentage ?? 0).toFixed(1)}%)`)
                    .join(' | ') || '—'],
                ['Grade', record => parentPortalRecordValue(record, ['grade', 'overallGrade']) || '—'],
                ['Status', record => parentPortalRecordValue(record, ['status', 'publicationStatus']) || 'Published']
            ],
            assessments: [
                ['Assignment', record => parentPortalRecordValue(record, ['title', 'name', 'assessmentName']) || 'Assessment'],
                ['Subject', record => parentPortalRecordValue(record, ['subjectName', 'subject']) || '—'],
                ['Type', record => parentPortalRecordValue(record, ['type', 'assessmentType', 'category']) || 'Assessment'],
                ['Due date', record => parentPortalRecordValue(record, ['dueDate', 'deadline', 'date']) || '—'],
                ['Maximum', record => parentPortalRecordValue(record, ['maxMarks', 'maximumMarks', 'marks', 'totalMarks']) || '—'],
                ['Status', record => parentPortalRecordValue(record, ['status']) || '—']
            ],
            timetables: [
                ['Day / date', record => parentPortalRecordValue(record, ['day', 'date', 'dayOfWeek']) || '—'],
                ['Time', record => [parentPortalRecordValue(record, ['startTime', 'from']), parentPortalRecordValue(record, ['endTime', 'to'])].filter(Boolean).join(' – ') || parentPortalRecordValue(record, ['time', 'period']) || '—'],
                ['Subject', record => parentPortalRecordValue(record, ['subjectName', 'subject']) || '—'],
                ['Teacher', record => parentPortalRecordValue(record, ['teacherName', 'teacher']) || '—'],
                ['Room', record => parentPortalRecordValue(record, ['room', 'classroom', 'venue']) || '—']
            ],
            studyMaterials: [
                ['Resource', record => parentPortalRecordValue(record, ['title', 'name', 'fileName']) || 'Study material'],
                ['Subject', record => parentPortalRecordValue(record, ['subjectName', 'subject']) || '—'],
                ['Type', record => parentPortalRecordValue(record, ['type', 'fileType', 'category']) || '—'],
                ['Updated', record => parentPortalRecordValue(record, ['updatedAt', 'uploadedAt', 'date', 'createdAt']) || '—'],
                ['Description', record => parentPortalRecordValue(record, ['description', 'notes']) || '—'],
                ['Open', record => {
                    const url = parentPortalRecordValue(record, ['url', 'resourceUrl', 'fileUrl', 'downloadUrl']);
                    if (!url) return '—';
                    try {
                        const safeUrl = new URL(url, window.location.href);
                        return ['http:', 'https:'].includes(safeUrl.protocol) ? `<a class="parent-resource-link" href="${dashboardEscape(safeUrl.href)}" target="_blank" rel="noopener noreferrer">Open resource <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></a>` : '—';
                    } catch (error) {
                        return '—';
                    }
                }, true]
            ],
            attendance: [
                ['Date', record => parentPortalRecordValue(record, ['date', 'attendanceDate', 'day']) || '—'],
                ['Status', record => parentPortalRecordValue(record, ['status', 'attendanceStatus']) || '—'],
                ['Check in', record => parentPortalRecordValue(record, ['checkIn', 'arrivalTime', 'timeIn']) || '—'],
                ['Check out', record => parentPortalRecordValue(record, ['checkOut', 'departureTime', 'timeOut']) || '—'],
                ['Notes', record => parentPortalRecordValue(record, ['remarks', 'notes', 'comment']) || '—']
            ],
            fees: [
                ['Fee item', record => parentPortalRecordValue(record, ['feeName', 'feeType', 'description', 'name']) || 'School fee'],
                ['Total', record => dashboardMoney(feeBilledAmount(record))],
                ['Paid', record => dashboardMoney(feePaidAmount(record))],
                ['Balance', record => dashboardMoney(feeOutstandingAmount(record))],
                ['Due date', record => parentPortalRecordValue(record, ['dueDate', 'date']) || '—'],
                ['Status', record => parentPortalRecordValue(record, ['status']) || '—']
            ],
            notices: [
                ['Notice', record => parentPortalRecordValue(record, ['title', 'subject', 'name']) || 'School notice'],
                ['Category', record => parentPortalRecordValue(record, ['category', 'type']) || 'General'],
                ['Published', record => parentPortalRecordValue(record, ['publishedAt', 'date', 'createdAt']) || '—'],
                ['Message', record => parentPortalRecordValue(record, ['summary', 'message', 'description', 'body']) || '—']
            ]
        };
        const columns = columnsByCollection[config.collection] || [];
        if (!records.length) {
            content.innerHTML = '<p class="parent-detail-message" role="status">No records are available for the selected student.</p>';
            return;
        }
        const showStudent = matchedChildren.length > 1;
        const tableColumns = showStudent
            ? [['Student', record => {
                const studentId = parentStudentId(record);
                const student = matchedChildren.find(child => parentStudentRecordId(child) === studentId) || matchedChildren[0];
                return student?.fullName || student?.name || student?.studentName || 'Linked student';
            }], ...columns]
            : columns;
        content.innerHTML = `<div class="parent-detail-table-wrap"><table class="parent-detail-table"><thead><tr>${tableColumns.map(([label]) => `<th>${dashboardEscape(label)}</th>`).join('')}</tr></thead><tbody>${records.map(record => `<tr>${tableColumns.map(([label, getter, isHtml]) => {
            const value = getter(record);
            return `<td data-label="${dashboardEscape(label)}">${isHtml ? value : dashboardEscape(value || '—')}</td>`;
        }).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    function renderParentPortalDashboard() {
        const container = document.getElementById('parentPortalHome');
        if (!container) return;
        const childSelect = document.getElementById('parentChildSelector');
        const childSelectorWrap = document.getElementById('parentChildSelectorWrap');
        const studentRecords = parentPortalData.students.records;
        const children = parentPortalData.students.loaded
            ? studentRecords
            : parentDashboardSummary.records?.children || studentRecords;
        const previousChild = childSelect?.value || 'all';
        const parentIdentity = window.schoolPortalData?.getIdentity?.() || activeAccountPermissions || {};
        const parentName = String(parentIdentity.parentName || parentIdentity.fullName || parentIdentity.name || parentIdentity.displayName
            || parentIdentity.adminUser || parentIdentity.email || '').trim();
        const welcomeTitle = container.querySelector('[data-parent-welcome-title]');
        if (welcomeTitle) welcomeTitle.textContent = parentName || 'Parent';
        const permissions = window.schoolPortalData?.getIdentity()?.permissions
            || activeAccountPermissions?.permissions
            || {};
        const adminPreview = isPrivilegedRole(activeAccountPermissions?.role);
        const canViewChildren = adminPreview || canViewParentPortalCollection('students');
        const canSelectChildren = canViewChildren && parentPortalData.students.loaded
            || parentDashboardSummary.loaded && children.length > 0;
        if (childSelect) {
            childSelect.replaceChildren();
            if (children.length > 1) childSelect.add(new Option('All children', 'all'));
            children.forEach(child => {
                const fullName = child.fullName || child.name || child.studentName || child.displayName || child.id;
                const firstName = child.firstName || String(fullName).trim().split(/\s+/)[0];
                const studentId = child.displayId || child.admissionNumber || child.admissionNo
                    || child.studentCode || child.studentId || parentStudentRecordId(child);
                childSelect.add(new Option(`${firstName} · ID: ${studentId}`, parentStudentRecordId(child)));
            });
            const onlyChildId = children.length === 1 ? parentStudentRecordId(children[0]) : '';
            const preferredChild = onlyChildId || previousChild;
            childSelect.value = children.some(child => parentStudentRecordId(child) === preferredChild)
                ? preferredChild
                : children.length > 1 ? 'all' : onlyChildId;
            childSelect.disabled = false;
            if (childSelectorWrap) childSelectorWrap.classList.toggle('hidden',
                !canSelectChildren || children.length === 0);
        }
        const selectedChild = childSelect?.value || 'all';
        const noChildren = document.getElementById('parentPortalNoChildren');
        noChildren?.classList.toggle('hidden',
            !canViewChildren || !parentPortalData.students.loaded || children.length > 0 || parentPortalData.students.error);
        const dataStatus = document.getElementById('parentPortalDataStatus');
        if (dataStatus) {
            const activeCollectionErrors = parentPortalCollections.some(collection =>
                parentPortalData[collection].error && parentPortalData[collection].loaded === false
            );
            dataStatus.textContent = adminPreview
                ? 'Admin preview · Sign in as a parent linked to students to view family data.'
                : parentPortalData.students.error
                ? 'Linked child information could not be loaded. Contact your school administrator if this continues.'
                : !canViewChildren
                    ? ''
                : activeCollectionErrors
                    ? 'Some linked records could not be loaded. Please try again later.'
                    : !parentPortalData.students.loaded
                        ? 'Loading secure linked-child overview…'
                        : children.length
                            ? ''
                            : 'No linked child records are available yet.';
            dataStatus.classList.toggle('hidden', !dataStatus.textContent);
            container.querySelector('.parent-portal-overview-heading')?.classList.toggle('hidden',
                !dataStatus.textContent && childSelectorWrap?.classList.contains('hidden'));
        }
        const selectedChildren = selectedChild === 'all'
            ? children
            : children.filter(child => parentStudentRecordId(child) === selectedChild);
        const familyRecordsFor = collection => parentPortalData[collection].records
            .filter(record => parentPortalRecordIsVisible(record, collection))
            .filter(record => selectedChildren.some(child => collection === 'notices'
                ? parentPortalMatchesStudentContext(record, collection, child)
                : parentPortalMatchesChild(record, collection, parentStudentRecordId(child))));
        const summaryRecordsFor = collection => (parentDashboardSummary.records?.[collection] || [])
            .filter(record => selectedChildren.some(child =>
                parentPortalMatchesChild(record, collection, parentStudentRecordId(child))));
        const cardRecordsFor = collection => adminPreview || canViewParentPortalCollection(collection)
            ? familyRecordsFor(collection)
            : summaryRecordsFor(collection);
        const setParentMetric = (key, collection, metric, detail) => {
            const card = container.querySelector(`[data-parent-stat-card="${key}"]`);
            const value = container.querySelector(`[data-parent-stat="${key}"]`);
            const description = container.querySelector(`[data-parent-stat-detail="${key}"]`);
            const dataset = parentPortalData[collection];
            if (!card || !value || !dataset) return;
            const allowed = adminPreview || canViewParentPortalCollection(collection);
            card.classList.remove('hidden');
            if (!allowed) {
                if (parentDashboardSummary.error) {
                    value.textContent = 'Unavailable';
                    if (description) description.textContent = 'Summary data could not be loaded';
                } else if (!parentDashboardSummary.loaded) {
                    value.textContent = '…';
                    if (description) description.textContent = 'Loading linked-student summary';
                } else {
                    value.textContent = metric;
                    if (description) description.textContent = detail;
                }
                return;
            }
            if (dataset.error && !dataset.loaded) {
                value.textContent = 'Unavailable';
                if (description) description.textContent = 'Data could not be loaded';
            } else if (!dataset.loaded) {
                value.textContent = '…';
                if (description) description.textContent = 'Loading linked records';
            } else {
                value.textContent = metric;
                if (description) description.textContent = detail;
            }
        };
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const dateFromRecord = (record, fields) => {
            for (const field of fields) {
                if (!record[field]) continue;
                const date = parseDashboardDate(record[field]);
                if (!Number.isNaN(date.getTime())) return date;
            }
            return null;
        };
        const attendanceRecords = familyRecordsFor('attendance');
        const attendanceCardRecords = cardRecordsFor('attendance');
        const canViewAttendance = adminPreview || canViewParentPortalCollection('attendance');
        const attendanceDashboardRecords = canViewAttendance ? attendanceRecords : attendanceCardRecords;
        const canViewFees = adminPreview || canViewParentPortalCollection('fees');
        container.querySelector('[data-parent-attendance-section]')?.classList.remove('hidden');
        const attendanceCounts = { present: 0, late: 0, absent: 0, excused: 0 };
        const attendanceStatusFor = record => String(record.status || record.attendanceStatus || '').trim().toLowerCase();
        attendanceCardRecords.forEach(record => {
            const status = attendanceStatusFor(record);
            if (Object.hasOwn(attendanceCounts, status)) attendanceCounts[status] += 1;
        });
        const attendanceTotal = attendanceCounts.present + attendanceCounts.late + attendanceCounts.absent;
        const attendanceRate = attendanceTotal
            ? `${Math.round((attendanceCounts.present + attendanceCounts.late) / attendanceTotal * 100)}%`
            : '—';
        const attendanceDetail = attendanceTotal
            ? `Across ${attendanceTotal} recorded days · excused and other statuses excluded`
            : 'No classified attendance records';
        setParentMetric('attendance', 'attendance', attendanceRate, attendanceDetail);

        const reportCardRecords = cardRecordsFor('reportCards').filter(record =>
            parentPortalRecordIsVisible(record, 'reportCards'));
        const linkedDocumentIdCards = parentDashboardSummary.records?.idCards || [];
        const linkedDocumentCertificates = parentDashboardSummary.records?.certificates || [];
        const summaryReportCardCount = parentDashboardSummary.records?.reportCards?.length || 0;
        const linkedReportCardCount = Math.max(
            summaryReportCardCount,
            parentPortalData.reportCards.records.filter(record =>
                parentPortalRecordIsVisible(record, 'reportCards')).length
        );
        const documentCount = document.querySelector('[data-mobile-documents-count]');
        if (documentCount) {
            const count = linkedReportCardCount + linkedDocumentIdCards.length + linkedDocumentCertificates.length;
            documentCount.textContent = String(count);
            documentCount.setAttribute('aria-label', `${count} documents`);
        }
        const childScope = selectedChild === 'all' ? 'Across linked children' : 'For the selected child';
        setParentMetric('results', 'reportCards', String(reportCardRecords.length), childScope);
        const assignments = cardRecordsFor('assessments');
        const completedAssignmentStatuses = new Set(['completed', 'complete', 'submitted', 'graded', 'closed', 'done']);
        const upcomingAssignments = assignments.map(assignment => ({
            assignment,
            dueDate: dateFromRecord(assignment, ['dueDate', 'deadline', 'date'])
        })).filter(({ assignment, dueDate }) => {
            const status = String(assignment.status || '').trim().toLowerCase();
            return dueDate && dueDate >= todayStart && !completedAssignmentStatuses.has(status);
        });
        const nextAssignmentDue = upcomingAssignments
            .map(({ dueDate }) => dueDate)
            .sort((left, right) => left - right)[0];
        setParentMetric('assignments', 'assessments', String(upcomingAssignments.length),
            upcomingAssignments.length
                ? `Next due ${dashboardDateLabel(nextAssignmentDue)}`
                : 'No upcoming assignments');
        const feeRecords = familyRecordsFor('fees');
        const feeCardRecords = cardRecordsFor('fees');
        const unpaidFeeRecords = feeCardRecords.filter(fee => feeOutstandingAmount(fee) > 0);
        setParentMetric('fees', 'fees', dashboardMoney(unpaidFeeRecords.reduce((sum, fee) => sum + feeOutstandingAmount(fee), 0)), `${unpaidFeeRecords.length} outstanding ${unpaidFeeRecords.length === 1 ? 'balance' : 'balances'}`);
        const noticeRecords = familyRecordsFor('notices');
        const noticeCount = !(adminPreview || canViewParentPortalCollection('notices'))
            && parentDashboardSummary.loaded
            ? parentDashboardSummary.records.noticeCount
            : noticeRecords.length;
        setParentMetric('notices', 'notices', String(noticeCount), 'School updates for linked children');

        const parentRecordStudent = record => selectedChildren.find(child =>
            parentStudentRecordId(child) === parentStudentId(record));
        const parentRecordDate = (record, fields) => {
            const date = dateFromRecord(record, fields);
            return date ? dashboardDateLabel(date) : '';
        };
        const recordCard = (record, collection, definition, recordIndex) => {
            const child = parentRecordStudent(record);
            const studentName = collection === 'notices'
                ? 'For parent community'
                : child?.fullName || child?.name || child?.studentName || 'Linked student';
            const title = definition.title(record);
            const fields = definition.fields(record).filter(([, value]) =>
                value !== undefined && value !== null && value !== '');
            const fieldIcons = {
                Date: 'fa-calendar-day',
                Status: 'fa-circle-check',
                Period: 'fa-calendar-week',
                Average: 'fa-chart-line',
                Grade: 'fa-award',
                Published: 'fa-clock',
                Subject: 'fa-book-open',
                Due: 'fa-hourglass-half',
                Outstanding: 'fa-wallet',
                Category: 'fa-tag',
                Details: 'fa-align-left'
            };
            const recordIconShapes = {
                'fa-calendar-check': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18l-3 3-2-2-4 4"/>',
                'fa-square-poll-vertical': '<path d="M4 20V5M4 20h17M8 16v-3M12 16V8M16 16v-5M20 16V4"/>',
                'fa-book-open': '<path d="M12 7v14M12 7C9 4 5 4 3 5v13c3-1 6-1 9 2M12 7c3-3 7-3 9-2v13c-3-1-6-1-9 2"/>',
                'fa-receipt': '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3"/>',
                'fa-bullhorn': '<path d="M3 11v4h4l11 5V5L7 10H3zM7 15l2 6h4l-3-7M18 9h3v8h-3"/>',
                'fa-calendar-day': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h3v3H8z"/>',
                'fa-circle-check': '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
                'fa-calendar-week': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h2M14 14h2M8 17h2M14 17h2"/>',
                'fa-chart-line': '<path d="M3 3v18h18M6 15l5-5 4 3 6-7M17 6h4v4"/>',
                'fa-award': '<circle cx="12" cy="9" r="6"/><path d="m8 14-1 8 5-3 5 3-1-8"/>',
                'fa-clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
                'fa-hourglass-half': '<path d="M6 3h12M6 21h12M7 3c0 5 2 7 5 9-3 2-5 4-5 9M17 3c0 5-2 7-5 9 3 2 5 4 5 9"/>',
                'fa-wallet': '<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 9h18M16 15h2"/><path d="M5 6V4h13"/>',
                'fa-tag': '<path d="M3 12V4h8l10 10-7 7L3 12z"/><circle cx="8" cy="8" r="1"/>',
                'fa-align-left': '<path d="M4 5h16M4 9h10M4 13h16M4 17h10"/>',
                'fa-user': '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3-7 8-7s8 3 8 7"/>',
                'fa-circle-info': '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
            };
            const recordIcon = name => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${recordIconShapes[name] || recordIconShapes['fa-circle-info']}</g></svg>`;
            const summary = fields[0];
            const documentAction = collection === 'reportCards'
                ? `<button class="parent-document-action parent-document-action-report" type="button" data-parent-document-preview="reportCard" data-parent-document-index="${recordIndex}" aria-label="Preview report card"><i class="fas fa-file-lines" aria-hidden="true"></i> Preview report card</button>`
                : collection === 'fees' && feeIsFullyPaid(record)
                    ? `<button class="parent-document-action" type="button" data-parent-document-preview="feeReceipt" data-parent-document-index="${recordIndex}"><i class="fas fa-receipt" aria-hidden="true"></i> View receipt</button>`
                    : '';
            return `<article class="parent-record-card parent-record-card-${collection}">
                <div class="parent-record-card-heading"><small>${recordIcon('fa-user')} ${dashboardEscape(studentName)}</small></div>
                <div class="parent-record-card-title-row"><span class="parent-record-card-icon">${recordIcon(definition.icon)}</span><h3>${dashboardEscape(title)}</h3></div>
                ${summary ? `<div class="parent-record-card-summary"><span class="parent-record-card-summary-icon">${recordIcon(fieldIcons[summary[0]] || 'fa-circle-info')}</span><span><small>${dashboardEscape(summary[0])}</small><strong>${dashboardEscape(summary[1])}</strong></span></div>` : ''}
                ${fields.length > 1 ? `<dl>${fields.slice(1).map(([label, value]) => `<div><dt>${recordIcon(fieldIcons[label] || 'fa-circle-info')}${dashboardEscape(label)}</dt><dd>${dashboardEscape(value)}</dd></div>`).join('')}</dl>` : ''}
                ${documentAction ? `<div class="parent-record-card-actions">${documentAction}</div>` : ''}
            </article>`;
        };
        const recordCardDefinitions = {
            attendance: {
                icon: 'fa-calendar-check',
                title: record => `${record.status || record.attendanceStatus || 'Attendance'} record`,
                fields: record => [
                    ['Status', record.status || record.attendanceStatus],
                    ['Date', parentRecordDate(record, ['attendanceDate', 'date', 'day'])]
                ]
            },
            reportCards: {
                icon: 'fa-square-poll-vertical',
                title: record => parentPortalRecordValue(record, ['reportName', 'title', 'name']) || 'Report card',
                fields: record => [
                    ['Average', parentPortalRecordValue(record, ['average', 'percentage', 'averagePercentage'])],
                    ['Grade', parentPortalRecordValue(record, ['grade', 'overallGrade'])],
                    ['Period', parentPortalRecordValue(record, ['period', 'academicPeriod', 'term', 'year'])],
                    ['Published', parentRecordDate(record, ['publishedAt', 'publicationDate', 'date'])]
                ]
            },
            assessments: {
                icon: 'fa-book-open',
                title: record => parentPortalRecordValue(record, ['title', 'name', 'assessmentName']) || 'Assignment',
                fields: record => [
                    ['Due', parentRecordDate(record, ['dueDate', 'deadline', 'date'])],
                    ['Subject', parentPortalRecordValue(record, ['subjectName', 'subject'])],
                    ['Status', parentPortalRecordValue(record, ['status', 'type', 'assessmentType'])]
                ]
            },
            fees: {
                icon: 'fa-receipt',
                title: record => parentPortalRecordValue(record, ['feeName', 'feeType', 'name']) || 'Fee record',
                fields: record => [
                    ['Outstanding', dashboardMoney(feeOutstandingAmount(record))],
                    ['Due', parentRecordDate(record, ['dueDate', 'paymentDueDate', 'deadline'])],
                    ['Status', parentPortalRecordValue(record, ['status'])]
                ]
            },
            notices: {
                icon: 'fa-bullhorn',
                title: record => parentPortalRecordValue(record, ['title', 'subject', 'name']) || 'School notice',
                fields: record => [
                    ['Category', parentPortalRecordValue(record, ['category', 'priority'])],
                    ['Published', parentRecordDate(record, ['publishDate', 'publishedAt', 'date'])],
                    ['Details', String(parentPortalRecordValue(record, ['contentText', 'content']) || '').slice(0, 240)]
                ]
            }
        };
        const recordSets = {
            attendance: attendanceCardRecords,
            reportCards: reportCardRecords,
            assessments: assignments.filter(record => parentPortalRecordIsVisible(record, 'assessments')),
            fees: feeCardRecords,
            notices: parentDashboardSummary.records?.noticeCards
                || (canViewParentPortalCollection('notices') ? noticeRecords : [])
        };
        const documentPreviewModal = container.querySelector('[data-parent-document-preview-modal]');
        const documentPreviewTitle = container.querySelector('[data-parent-document-title]');
        const documentPreviewSubtitle = container.querySelector('[data-parent-document-subtitle]');
        const documentPreviewPaper = container.querySelector('[data-parent-document-paper]');
        let documentPreviewReturnFocus = null;
        const prepareParentReportPreview = markup => {
            const template = document.createElement('template');
            template.innerHTML = markup;
            const sheet = template.content.querySelector('.parent-report-preview-sheet');
            if (!sheet) return markup;
            const hasLiveValue = value => value !== undefined && value !== null
                && !['', '—', '-', '–'].includes(String(value).trim());

            const schoolName = String(currentSchool?.schoolName || '').trim();
            let logoUrl = '';
            try {
                const parsedLogoUrl = new URL(currentSchool?.logoURL || '', window.location.href);
                if (currentSchool?.logoURL && (parsedLogoUrl.protocol === 'https:' || parsedLogoUrl.origin === window.location.origin)) {
                    logoUrl = parsedLogoUrl.href;
                }
            } catch (error) {
                console.warn('The school logo URL is invalid.', error);
            }
            const schoolHeader = sheet.querySelector('.report-sheet-header');
            if (schoolHeader) {
                schoolHeader.replaceChildren();
                if (schoolName || logoUrl) {
                    if (logoUrl) {
                        const logo = document.createElement('div');
                        logo.className = 'report-school-logo';
                        const image = document.createElement('img');
                        image.src = logoUrl;
                        image.alt = '';
                        logo.append(image);
                        schoolHeader.append(logo);
                    }
                    if (schoolName) {
                        const name = document.createElement('div');
                        const heading = document.createElement('strong');
                        heading.textContent = schoolName;
                        name.append(heading);
                        schoolHeader.append(name);
                    }
                } else {
                    schoolHeader.remove();
                }
            }

            const period = sheet.querySelector('.report-sheet-title p');
            if (period) {
                const values = period.textContent.replace(/^Academic Year\s*/, '').split('•')
                    .map(value => value.trim()).filter(value => value && value !== '—');
                period.textContent = values.join(' · ');
                if (!period.textContent) period.remove();
            }

            sheet.querySelector('.report-student-photo')?.remove();
            const detailGrid = sheet.querySelector('.report-detail-grid');
            detailGrid?.querySelectorAll('div').forEach(detail => {
                const label = detail.querySelector('span')?.textContent.trim();
                const value = detail.querySelector('strong')?.textContent.trim();
                if (['Date of Birth', 'Academic Year'].includes(label) || !hasLiveValue(value)) {
                    detail.remove();
                } else if (label === 'Student Name') {
                    detail.querySelector('span').textContent = 'Student';
                }
            });
            if (detailGrid && !detailGrid.children.length) detailGrid.remove();

            const marksTable = sheet.querySelector('.report-marks-table');
            const marksBody = marksTable?.querySelector('tbody');
            if (marksTable && marksBody) {
                const rows = [...marksBody.rows];
                if (!rows.length || rows.some(row => row.querySelector('[colspan]'))) {
                    marksTable.remove();
                } else {
                    const columns = ['Subject', 'Score / max', 'Percentage', 'Remark'];
                    marksTable.querySelector('thead tr').replaceChildren(...columns.map(label => {
                        const heading = document.createElement('th');
                        heading.textContent = label;
                        return heading;
                    }));
                    rows.forEach(row => {
                        const cells = [...row.cells];
                        const values = cells.map(cell => {
                            const value = cell.textContent.trim();
                            return hasLiveValue(value) ? value : '';
                        });
                        row.replaceChildren(...values.map((value, index) => {
                            const cell = document.createElement('td');
                            cell.dataset.label = columns[index];
                            cell.textContent = value;
                            return cell;
                        }));
                    });
                }
            }

            sheet.querySelectorAll('.report-sheet-summary').forEach(summary => {
                [...summary.children].forEach(item => {
                    const label = item.querySelector('span')?.textContent.trim().toLowerCase();
                    const value = item.querySelector('strong')?.textContent.trim();
                    if (label !== 'overall grade' || !hasLiveValue(value)) item.remove();
                });
                if (!summary.children.length) summary.remove();
            });
            sheet.querySelectorAll('.report-remarks').forEach(remarks => {
                remarks.querySelectorAll(':scope > div').forEach(item => {
                    const value = item.querySelector('p')?.textContent.trim();
                    if (!hasLiveValue(value)) item.remove();
                });
                if (!remarks.children.length) remarks.remove();
            });
            sheet.querySelector('.report-sheet-footer')?.remove();
            return sheet.outerHTML;
        };
        const openParentDocumentPreview = (title, subtitle, markup, trigger) => {
            if (!documentPreviewModal || !documentPreviewTitle || !documentPreviewPaper) return;
            documentPreviewReturnFocus = trigger;
            documentPreviewTitle.textContent = title;
            if (documentPreviewSubtitle) documentPreviewSubtitle.textContent = subtitle;
            documentPreviewModal.classList.toggle('parent-report-card-preview', title === 'Report Card');
            documentPreviewModal.classList.toggle('parent-fee-statement-preview', title === 'Fee Statement');
            documentPreviewPaper.innerHTML = title === 'Report Card' ? prepareParentReportPreview(markup) : markup;
            documentPreviewModal.classList.remove('hidden');
            container.querySelector('[data-parent-document-close]')?.focus();
        };
        const reportCardPreviewMarkup = record => {
            const child = parentRecordStudent(record);
            const subjectRows = parentResultRows(record, 'reportCards');
            const studentName = child?.fullName || child?.name || child?.studentName
                || parentPortalRecordValue(record, ['studentName', 'student', 'fullName']) || '';
            const year = parentPortalRecordValue(record, ['year', 'academicYear']) || '—';
            const period = parentPortalRecordValue(record, ['period', 'academicPeriod', 'term']) || '—';
            const rows = subjectRows.map(row => {
                const score = row.score === null ? '' : [row.score, row.maximum].filter(value => value !== null && value !== '').join(' / ');
                return `<tr><td data-label="Subject">${dashboardEscape(row.subject)}</td><td data-label="Score / max">${dashboardEscape(score)}</td><td data-label="Percentage">${dashboardEscape(row.percentage.toFixed(1))}%</td><td data-label="Remark">${dashboardEscape(row.remarks)}</td></tr>`;
            }).join('');
            const details = [
                ['Student Name', studentName],
                ['Admission No.', parentPortalRecordValue(record, ['studentAdmissionNo', 'admissionNo', 'admissionNumber']) || child?.admissionNumber || child?.studentCode || '—'],
                ['Class / Section', [parentPortalRecordValue(record, ['class', 'className']) || child?.className || child?.class || '', parentPortalRecordValue(record, ['section']) || child?.section || ''].filter(Boolean).join(' / ') || '—'],
                ['Report Card No.', parentPortalRecordValue(record, ['no', 'reportNo', 'reportNumber']) || '—']
            ];
            const summary = [
                ['Overall Grade', parentPortalRecordValue(record, ['grade', 'overallGrade']) || '—']
            ];
            const teacherRemarks = parentPortalRecordValue(record, ['teacherRemarks', 'classTeacherRemarks']) || '—';
            const principalRemarks = parentPortalRecordValue(record, ['principalRemarks', 'headTeacherRemarks']) || '—';
            return `<div class="report-preview-sheet parent-report-preview-sheet"><div class="report-sheet-header"></div><div class="report-sheet-title"><h2>Student Report Card</h2><p>Academic Year <strong>${dashboardEscape(year)}</strong> • ${dashboardEscape(period)}</p></div><div class="report-detail-grid">${details.map(([label, value]) => `<div><span>${dashboardEscape(label)}</span><strong>${dashboardEscape(value)}</strong></div>`).join('')}</div>${rows ? `<div class="report-marks-table-wrap"><table class="report-marks-table"><thead><tr><th>Subject</th><th>Score / max</th><th>Percentage</th><th>Remark</th></tr></thead><tbody>${rows}</tbody></table></div>` : ''}<div class="report-remarks parent-teacher-remark"><div><h4>Teacher&apos;s Remarks</h4><p>${dashboardEscape(teacherRemarks)}</p></div></div><div class="report-sheet-summary">${summary.map(([label, value]) => `<div><span>${dashboardEscape(label)}</span><strong>${dashboardEscape(value)}</strong></div>`).join('')}</div><div class="report-remarks"><div><h4>Principal&apos;s Remarks</h4><p>${dashboardEscape(principalRemarks)}</p></div></div><div class="report-signatures"><span>Class Teacher</span><span>Head Teacher</span><span>Parent / Guardian</span></div></div>`;
        };
        const feeStatementPreviewMarkup = fees => {
            const schoolName = dashboardEscape(parentPortalRecordValue(fees[0], ['schoolName'])
                || currentSchool?.schoolName || 'School');
            const documentHeader = `<header class="fee-document-header"><div class="fee-document-brand"><span class="fee-document-brand-mark"><i class="fas fa-graduation-cap" aria-hidden="true"></i></span><div><strong>${schoolName}</strong><span>Finance Department · Student Accounts</span></div></div><div class="fee-document-title"><span>Account overview</span><h2>Fee Statement</h2><p>Prepared ${dashboardEscape(new Date().toLocaleDateString())} · ${dashboardEscape(selectedChild === 'all' ? 'All linked students' : 'Selected student')}</p></div></header>`;
            if (!fees.length) return `<article class="fee-document fee-document-statement">${documentHeader}<p class="parent-document-empty">Fee records will appear here when the school adds them to the cloud.</p></article>`;
            const billedTotal = fees.reduce((sum, fee) => sum + feeBilledAmount(fee), 0);
            const paidTotal = fees.reduce((sum, fee) => sum + feePaidAmount(fee), 0);
            const outstandingTotal = fees.reduce((sum, fee) => sum + feeOutstandingAmount(fee), 0);
            const lines = fees.map(fee => {
                const child = parentRecordStudent(fee);
                const title = parentPortalRecordValue(fee, ['feeName', 'feeType', 'name']) || 'Fee item';
                const details = [
                    ['Student', child?.fullName || child?.name || child?.studentName || fee.studentName || 'Linked student'],
                    ['Student ID', fee.studentAdmissionNo || fee.studentId || child?.admissionNo || child?.admissionNumber || child?.studentCode || '—'],
                    ['Class', fee.studentClass || child?.className || child?.class || '—'],
                    ['Academic year', parentPortalRecordValue(fee, ['academicYear', 'year']) || '—']
                ];
                const columns = [
                    ['Fee description', title],
                    ['Due date', parentRecordDate(fee, ['dueDate', 'paymentDueDate', 'deadline']) || '—'],
                    ['Billed', dashboardMoney(feeBilledAmount(fee))],
                    ['Paid', dashboardMoney(feePaidAmount(fee))],
                    ['Balance', dashboardMoney(feeOutstandingAmount(fee))],
                    ['Status', parentPortalRecordValue(fee, ['status']) || '—']
                ];
                return `<tr>${columns.map(([label, value]) => `<td data-label="${dashboardEscape(label)}">${label === 'Status' ? `<span class="fee-document-status">${dashboardEscape(value)}</span>` : dashboardEscape(value)}</td>`).join('')}</tr><tr class="fee-document-statement-student"><td colspan="6"><dl>${details.map(([label, value]) => `<div><dt>${dashboardEscape(label)}</dt><dd>${dashboardEscape(value)}</dd></div>`).join('')}</dl></td></tr>`;
            }).join('');
            return `<article class="fee-document fee-document-statement">${documentHeader}<dl class="fee-document-summary"><div><dt>Total billed</dt><dd>${dashboardEscape(dashboardMoney(billedTotal))}</dd></div><div><dt>Total paid</dt><dd>${dashboardEscape(dashboardMoney(paidTotal))}</dd></div><div><dt>Outstanding balance</dt><dd>${dashboardEscape(dashboardMoney(outstandingTotal))}</dd></div></dl><section class="fee-document-section"><h3>Fee account details</h3><div class="fee-document-table-wrap"><table class="fee-document-table"><thead><tr><th>Fee description</th><th>Due date</th><th>Billed</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead><tbody>${lines}</tbody></table></div></section><footer class="fee-document-footer"><span>Statement generated from the school fee records.</span></footer></article>`;
        };
        const feeReceiptPreviewMarkup = fee => {
            const child = parentRecordStudent(fee);
            const schoolName = parentPortalRecordValue(fee, ['schoolName']) || currentSchool?.schoolName || 'School';
            const studentName = child?.fullName || child?.name || child?.studentName || fee.studentName || 'Linked student';
            const studentId = fee.studentAdmissionNo || fee.studentId || child?.admissionNo
                || child?.admissionNumber || child?.studentCode || '—';
            const details = [
                ['Student name', studentName],
                ['Student ID', studentId],
                ['Class', fee.studentClass || child?.className || child?.class || '—'],
                ['Academic year', parentPortalRecordValue(fee, ['academicYear', 'year']) || '—']
            ];
            return `<article class="fee-document fee-document-receipt"><header class="fee-document-header"><div class="fee-document-brand"><span class="fee-document-brand-mark"><i class="fas fa-graduation-cap" aria-hidden="true"></i></span><div><strong>${dashboardEscape(schoolName)}</strong><span>Finance Department · Student Accounts</span></div></div><div class="fee-document-title"><span>Official payment record</span><h2>Fee Payment Receipt</h2><p>Receipt No. <strong>${dashboardEscape(parentPortalRecordValue(fee, ['receiptNo', 'receiptNumber', 'receiptId']) || '—')}</strong></p></div></header><section class="fee-document-section"><h3>Student information</h3><dl class="fee-document-grid">${details.map(([label, value]) => `<div><dt>${dashboardEscape(label)}</dt><dd>${dashboardEscape(value)}</dd></div>`).join('')}</dl></section><section class="fee-document-section"><h3>Fee details</h3><table class="fee-document-table"><thead><tr><th>Description</th><th>Due date</th><th>Amount billed</th></tr></thead><tbody><tr><td>${dashboardEscape(parentPortalRecordValue(fee, ['feeName', 'feeType', 'name']) || 'Fee payment')}</td><td>${dashboardEscape(parentRecordDate(fee, ['dueDate', 'paymentDueDate', 'deadline']) || '—')}</td><td>${dashboardEscape(dashboardMoney(feeBilledAmount(fee)))}</td></tr></tbody></table><div class="fee-document-totals"><div><span>Amount paid</span><strong>${dashboardEscape(dashboardMoney(feePaidAmount(fee)))}</strong></div><div><span>Outstanding balance</span><strong>${dashboardEscape(dashboardMoney(feeOutstandingAmount(fee)))}</strong></div></div></section><section class="fee-document-section"><h3>Payment information</h3><dl class="fee-document-grid">${[['Payment date', parentRecordDate(fee, ['paymentDate', 'paidDate', 'updatedAt']) || '—'], ['Payment method', parentPortalRecordValue(fee, ['paymentMethod']) || '—'], ['Payment status', parentPortalRecordValue(fee, ['status']) || 'Paid']].map(([label, value]) => `<div><dt>${dashboardEscape(label)}</dt><dd>${dashboardEscape(value)}</dd></div>`).join('')}</dl></section>${fee.notes ? `<section class="fee-document-section"><h3>Notes</h3><p class="fee-document-notes">${dashboardEscape(fee.notes)}</p></section>` : ''}<footer class="fee-document-footer"><span>This receipt was generated from the school fee record.</span><div><span>Accounts officer</span><span>Authorized signature</span></div></footer></article>`;
        };
        const attendanceSummaryPreviewMarkup = records => {
            if (!selectedChildren.length || !records.length) return '<div class="parent-document-sheet-heading"><h3>Attendance Summary</h3></div><p class="parent-document-empty">No attendance records are available for the selected child scope.</p>';
            const sections = selectedChildren.map(child => {
                const childId = parentStudentRecordId(child);
                const childRecords = records.filter(record => parentPortalMatchesChild(record, 'attendance', childId));
                const months = new Map();
                childRecords.forEach(record => {
                    const date = dateFromRecord(record, ['attendanceDate', 'date', 'day']);
                    const key = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : 'undated';
                    if (!months.has(key)) months.set(key, { date, present: 0, late: 0, absent: 0, excused: 0, other: 0 });
                    const bucket = months.get(key);
                    const status = String(record.status || record.attendanceStatus || '').trim().toLowerCase();
                    if (status.includes('excused')) bucket.excused += 1;
                    else if (status.includes('late')) bucket.late += 1;
                    else if (status.includes('absent')) bucket.absent += 1;
                    else if (status.includes('present')) bucket.present += 1;
                    else bucket.other += 1;
                });
                const monthRows = [...months.entries()].sort(([left], [right]) => right.localeCompare(left)).map(([key, bucket]) => {
                    const total = bucket.present + bucket.late + bucket.absent;
                    const rate = total ? `${Math.round((bucket.present + bucket.late) / total * 100)}%` : '—';
                    const month = bucket.date
                        ? bucket.date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
                        : 'Undated records';
                    return `<div class="parent-document-month-row"><strong>${dashboardEscape(month)}</strong><dl>${[['Present', bucket.present], ['Late', bucket.late], ['Absent', bucket.absent], ['Excused', bucket.excused], ['Other', bucket.other], ['Rate', rate]].map(([label, value]) => `<div><dt>${dashboardEscape(label)}</dt><dd>${dashboardEscape(value)}</dd></div>`).join('')}</dl></div>`;
                }).join('');
                return `<section class="parent-document-section"><h4>${dashboardEscape(child.fullName || child.name || child.studentName || 'Student')}</h4>${monthRows || '<p class="parent-document-empty">No attendance records are available.</p>'}</section>`;
            }).join('');
            return `<div class="parent-document-sheet-heading"><h3>Attendance Summary</h3><p>Monthly attendance for linked children</p></div>${sections}`;
        };
        Object.entries(recordCardDefinitions).forEach(([collection, definition]) => {
            const target = container.querySelector(`[data-parent-record-cards="${collection}"]`);
            const count = container.querySelector(`[data-parent-record-count="${collection}"]`);
            const records = recordSets[collection] || [];
            if (!target) return;
            if (parentDashboardSummary.error && !parentDashboardSummary.loaded
                && !parentPortalData[collection]?.loaded) {
                target.innerHTML = '<p class="parent-record-empty" role="status">Records could not be loaded.</p>';
                if (count) count.textContent = 'Unavailable';
                return;
            }
            if (!parentDashboardSummary.loaded && !parentPortalData[collection]?.loaded) {
                target.innerHTML = '<p class="parent-record-empty" role="status">Loading linked-student records…</p>';
                if (count) count.textContent = 'Loading';
                return;
            }
            target.innerHTML = records.length
                ? records.map((record, index) => recordCard(record, collection, definition, index)).join('')
                : '<p class="parent-record-empty" role="status">No linked records are available.</p>';
            if (count) count.textContent = `${records.length} ${records.length === 1 ? 'record' : 'records'}`;
        });
        const recordGroups = container.querySelector('.parent-records-section');
        if (recordGroups) {
            recordGroups.onclick = event => {
                const target = event.target;
                if (!(target instanceof Element)) return;
                const preview = target.closest('[data-parent-document-preview]');
                if (preview) {
                    const type = preview.dataset.parentDocumentPreview;
                    const index = Number(preview.dataset.parentDocumentIndex);
                    if (type === 'reportCard' && reportCardRecords[index]) {
                        const record = reportCardRecords[index];
                        const child = parentRecordStudent(record);
                        openParentDocumentPreview('Report Card', child?.fullName || '', reportCardPreviewMarkup(record), preview);
                    } else if (type === 'feeReceipt' && feeCardRecords[index] && feeIsFullyPaid(feeCardRecords[index])) {
                        const fee = feeCardRecords[index];
                        const child = parentRecordStudent(fee);
                        openParentDocumentPreview('Fee Payment Receipt', child?.fullName || 'Paid fee', feeReceiptPreviewMarkup(fee), preview);
                    } else if (type === 'feeStatement') {
                        openParentDocumentPreview('Fee Statement', selectedChild === 'all' ? 'Across linked children' : 'For the selected child', feeStatementPreviewMarkup(feeCardRecords), preview);
                    } else if (type === 'attendanceSummary') {
                        openParentDocumentPreview('Attendance Summary', selectedChild === 'all' ? 'Across linked children' : 'For the selected child', attendanceSummaryPreviewMarkup(attendanceCardRecords), preview);
                    }
                    return;
                }
                const toggle = target.closest('[data-parent-record-group-toggle]');
                if (!toggle) return;
                const grid = toggle.closest('.parent-record-group')?.querySelector('.parent-record-grid');
                if (!grid) return;
                const expanded = grid.classList.toggle('hidden') === false;
                toggle.setAttribute('aria-expanded', String(expanded));
            };
        }
        const closeParentDocumentPreview = () => {
            documentPreviewModal?.classList.add('hidden');
            documentPreviewModal?.classList.remove('parent-report-card-preview');
            if (documentPreviewReturnFocus?.isConnected) documentPreviewReturnFocus.focus();
        };
        if (documentPreviewModal) {
            documentPreviewModal.onclick = event => {
                const target = event.target;
                if (target === documentPreviewModal
                    || target instanceof Element && target.closest('[data-parent-document-close]')) {
                    closeParentDocumentPreview();
                }
            };
            documentPreviewModal.onkeydown = event => {
                if (event.key === 'Escape') closeParentDocumentPreview();
            };
        }
        const documentPrintButton = container.querySelector('[data-parent-document-print]');
        if (documentPrintButton) {
            documentPrintButton.onclick = () => {
                const clearPrintMode = () => document.body.classList.remove('parent-document-printing');
                document.body.classList.add('parent-document-printing');
                window.addEventListener('afterprint', clearPrintMode, { once: true });
                window.print();
                window.setTimeout(clearPrintMode, 1500);
            };
        }

        const idCards = container.querySelector('[data-parent-id-cards]');
        if (idCards) {
            const idCardsSection = idCards.closest('.parent-id-cards-section');
            const idCardsTrigger = idCardsSection?.querySelector('[data-parent-id-cards-toggle]');
            const idCardCount = idCardsSection?.querySelector('[data-parent-id-card-count]');
            const previewModal = idCardsSection?.querySelector('[data-parent-id-card-preview-modal]');
            const previewContent = idCardsSection?.querySelector('[data-parent-id-card-preview-content]');
            const flipButton = idCardsSection?.querySelector('[data-parent-id-card-flip]');
            const saveJpgButton = idCardsSection?.querySelector('[data-parent-id-card-save]');
            const downloadStatus = idCardsSection?.querySelector('[data-parent-id-card-download-status]');
            let previewCard = null;
            let previewSide = 'front';
            const linkedIdCards = (parentDashboardSummary.records?.idCards || [])
                .filter(card => selectedChildren.some(child => parentStudentRecordId(child) === String(card.studentId || '')));
            const closePreview = () => {
                previewModal?.classList.add('hidden');
                idCardsTrigger?.focus();
            };
            const safeIdCardImage = value => {
                const image = String(value || '').trim();
                if (!image || image.length > 4096) return '';
                if (/^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(image)) return image;
                if (/^data:image\/svg\+xml(?:;charset=[^;,]+)?,/i.test(image)) return image;
                try {
                    const url = new URL(image, window.location.href);
                    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
                } catch (error) {
                    return '';
                }
            };
            const idCardColor = (value, fallback) => /^#[\da-f]{6}$/i.test(String(value || ''))
                ? String(value)
                : fallback;
            const renderIdCard = (card, side) => {
                const name = card.memberName || 'MEMBER NAME';
                const photo = safeIdCardImage(card.photo);
                const logo = safeIdCardImage(card.logo);
                const primary = idCardColor(card.primary, '#071b3a');
                const secondary = idCardColor(card.secondary, '#1459d9');
                const schoolName = dashboardEscape(card.schoolName || '');
                const memberId = dashboardEscape(card.memberId || '');
                const cardBackground = `radial-gradient(circle at 90% 0%,${secondary},transparent 30%),linear-gradient(145deg,${primary},${secondary})`;
                if (side === 'back') {
                    return `<div class="id-card" style="background:${cardBackground}">
                        <div class="idc-card-content idc-back-content">
                            <div class="idc-back-title">${schoolName}</div>
                            <div class="idc-gold-line"></div>
                            <div class="idc-return-title">If this card is found</div>
                            <div class="idc-address">Please return this identification card to:<br><br><strong>${schoolName}<br>${dashboardEscape(card.schoolAddress || '')}</strong><br><br>Tel: +971 00 000 0000<br>Email: admin@school.edu</div>
                            <div class="idc-emergency"><div class="idc-emergency-title">Emergency Contact</div><div class="idc-emergency-number">${dashboardEscape(card.emergency || '')}</div></div>
                            <div class="idc-signature">Authorized Signature / Principal</div>
                            <div class="idc-card-number">CARD NO: <strong>${memberId}</strong></div>
                            <div class="idc-barcode"></div>
                            <div class="idc-barcode-number">${memberId}</div>
                        </div>
                    </article>`;
                }
                const validUntil = card.validUntil
                    ? new Date(`${card.validUntil}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—';
                return `<div class="id-card" style="background:${cardBackground}">
                    <div class="idc-card-content">
                        <div class="idc-school-head">${logo ? `<img class="idc-logo" src="${dashboardEscape(logo)}" alt="">` : ''}<div><div class="idc-school-name">${schoolName}</div><div class="idc-school-sub">OFFICIAL SCHOOL IDENTIFICATION</div></div></div>
                        <div class="idc-card-title">SCHOOL IDENTIFICATION CARD</div>
                        <div class="idc-photo">${photo ? `<img src="${dashboardEscape(photo)}" alt="">` : '👤'}</div>
                        <div class="idc-member-name">${dashboardEscape(name)}</div>
                        <div class="idc-member-type">${dashboardEscape(card.memberType || 'Student').toUpperCase()}</div>
                        <div class="idc-details">
                            <div class="idc-detail"><span class="idc-detail-label">Admission No.</span><span class="idc-detail-value">${memberId}</span></div>
                            <div class="idc-detail"><span class="idc-detail-label">Designation</span><span class="idc-detail-value">${dashboardEscape(card.designation || '')}</span></div>
                            <div class="idc-detail"><span class="idc-detail-label">Department / Class</span><span class="idc-detail-value">${dashboardEscape(card.department || '')}</span></div>
                            <div class="idc-detail"><span class="idc-detail-label">Division / House</span><span class="idc-detail-value">${dashboardEscape(card.division || '')}</span></div>
                        </div>
                        <div class="idc-card-bottom"><div class="idc-validity">VALID UNTIL<strong>${dashboardEscape(validUntil)}</strong></div><div class="idc-qr"></div></div>
                    </div>
                </div>`;
            };
            const renderPreviewCard = () => {
                if (!previewCard || !previewContent) return;
                previewContent.innerHTML = renderIdCard(previewCard, previewSide);
                if (flipButton) {
                    flipButton.querySelector('span').textContent = previewSide === 'front' ? 'Show back' : 'Show front';
                    flipButton.setAttribute('aria-pressed', String(previewSide === 'back'));
                }
            };
            const loadPreviewImage = source => new Promise(resolve => {
                if (!source) return resolve(null);
                const image = new Image();
                image.crossOrigin = 'anonymous';
                image.onload = () => resolve(image);
                image.onerror = () => resolve(null);
                image.src = source;
            });
            const savePreviewAsJpg = async () => {
                if (!previewCard || !saveJpgButton) return;
                saveJpgButton.disabled = true;
                if (downloadStatus) downloadStatus.textContent = 'Preparing JPG…';
                try {
                    const width = 960;
                    const height = 1500;
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const context = canvas.getContext('2d');
                    if (!context) throw new Error('Image export is unavailable in this browser.');
                    const primary = idCardColor(previewCard.primary, '#071b3a');
                    const secondary = idCardColor(previewCard.secondary, '#1459d9');
                    const gradient = context.createLinearGradient(0, 0, width, height);
                    gradient.addColorStop(0, primary);
                    gradient.addColorStop(1, secondary);
                    context.fillStyle = gradient;
                    context.fillRect(0, 0, width, height);
                    context.strokeStyle = 'rgba(255,255,255,.35)';
                    context.lineWidth = 4;
                    context.strokeRect(12, 12, width - 24, height - 24);
                    context.fillStyle = 'rgba(255,255,255,.08)';
                    context.beginPath();
                    context.arc(width + 80, -40, 350, 0, Math.PI * 2);
                    context.fill();

                    const drawText = (text, x, y, size, color = '#ffffff', align = 'left', weight = '600') => {
                        context.fillStyle = color;
                        context.font = `${weight} ${size}px Arial, sans-serif`;
                        context.textAlign = align;
                        context.fillText(String(text || ''), x, y, width - 100);
                    };
                    const drawImageContained = (image, x, y, maxWidth, maxHeight) => {
                        const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
                        const imageWidth = image.width * scale;
                        const imageHeight = image.height * scale;
                        context.drawImage(image, x + (maxWidth - imageWidth) / 2, y + (maxHeight - imageHeight) / 2, imageWidth, imageHeight);
                    };
                    const logo = await loadPreviewImage(safeIdCardImage(previewCard.logo));
                    if (logo) {
                        context.fillStyle = '#ffffff';
                        context.beginPath();
                        context.roundRect(58, 55, 112, 112, 16);
                        context.fill();
                        drawImageContained(logo, 68, 65, 92, 92);
                    }
                    drawText(previewCard.schoolName || 'STUDENT ID CARD', logo ? 195 : width / 2, 112, 34, '#ffffff', logo ? 'left' : 'center', '700');
                    context.strokeStyle = 'rgba(255,255,255,.45)';
                    context.lineWidth = 2;
                    context.beginPath();
                    context.moveTo(56, 195);
                    context.lineTo(width - 56, 195);
                    context.stroke();

                    if (previewSide === 'front') {
                        const photo = await loadPreviewImage(safeIdCardImage(previewCard.photo));
                        const photoX = 336;
                        const photoY = 240;
                        const photoWidth = 288;
                        const photoHeight = 350;
                        context.fillStyle = 'rgba(255,255,255,.18)';
                        context.beginPath();
                        context.roundRect(photoX, photoY, photoWidth, photoHeight, 24);
                        context.fill();
                        if (photo) {
                            context.save();
                            context.beginPath();
                            context.roundRect(photoX + 8, photoY + 8, photoWidth - 16, photoHeight - 16, 18);
                            context.clip();
                            const scale = Math.max((photoWidth - 16) / photo.width, (photoHeight - 16) / photo.height);
                            const photoDrawWidth = photo.width * scale;
                            const photoDrawHeight = photo.height * scale;
                            context.drawImage(photo, photoX + (photoWidth - photoDrawWidth) / 2, photoY + (photoHeight - photoDrawHeight) / 2, photoDrawWidth, photoDrawHeight);
                            context.restore();
                        } else {
                            drawText(String(previewCard.memberName || 'S').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(), width / 2, photoY + 200, 76, '#ffffff', 'center', '700');
                        }
                        drawText(previewCard.memberName || 'Student', width / 2, 665, 43, '#ffffff', 'center', '700');
                        drawText(previewCard.designation || previewCard.memberType || 'Student', width / 2, 715, 24, '#dbeafe', 'center');
                        const details = [
                            ['STUDENT ID', previewCard.memberId],
                            ['CLASS', previewCard.department],
                            ['DIVISION', previewCard.division],
                            ['VALID UNTIL', previewCard.validUntil],
                            ['STATUS', previewCard.status]
                        ];
                        details.forEach(([label, value], index) => {
                            const row = Math.floor(index / 2);
                            const column = index % 2;
                            const x = 80 + column * 420;
                            const y = 825 + row * 145;
                            drawText(label, x, y, 17, '#bfdbfe');
                            drawText(value || '—', x, y + 45, 26, '#ffffff', 'left', '700');
                        });
                    } else {
                        drawText('IF THIS CARD IS FOUND', width / 2, 360, 32, '#dbeafe', 'center', '700');
                        drawText('Please return this card to the school.', width / 2, 415, 22, '#ffffff', 'center');
                        [
                            ['SCHOOL', previewCard.schoolName],
                            ['ADDRESS', previewCard.schoolAddress],
                            ['EMERGENCY CONTACT', previewCard.emergency]
                        ].forEach(([label, value], index) => {
                            const y = 545 + index * 190;
                            context.fillStyle = 'rgba(0,0,0,.12)';
                            context.beginPath();
                            context.roundRect(64, y - 45, width - 128, 140, 18);
                            context.fill();
                            drawText(label, 92, y, 18, '#bfdbfe');
                            drawText(value || '—', 92, y + 48, 24, '#ffffff', 'left', '700');
                        });
                        context.strokeStyle = 'rgba(255,255,255,.45)';
                        context.beginPath();
                        context.moveTo(64, 1225);
                        context.lineTo(width - 64, 1225);
                        context.stroke();
                        drawText(`CARD NO. ${previewCard.memberId || '—'}`, width / 2, 1280, 22, '#ffffff', 'center', '700');
                    }

                    const blob = await new Promise((resolve, reject) => canvas.toBlob(
                        value => value ? resolve(value) : reject(new Error('The JPG image could not be created.')),
                        'image/jpeg',
                        0.92
                    ));
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    const safeName = String(previewCard.memberName || 'student-id').trim().replace(/[^a-z0-9_-]+/gi, '-');
                    link.href = url;
                    link.download = `${safeName}-${previewSide}.jpg`;
                    link.click();
                    URL.revokeObjectURL(url);
                    if (downloadStatus) downloadStatus.textContent = 'JPG downloaded.';
                } catch (error) {
                    console.error('Unable to export the student ID card as JPG.', error);
                    if (downloadStatus) downloadStatus.textContent = error.message || 'Unable to download the JPG.';
                } finally {
                    saveJpgButton.disabled = false;
                }
            };
            if (!parentDashboardSummary.loaded) {
                idCards.innerHTML = `<p class="parent-id-cards-empty" role="status">${parentDashboardSummary.error
                    ? 'Linked student ID cards could not be loaded.'
                    : 'Loading linked student ID cards…'}</p>`;
                if (idCardCount) idCardCount.textContent = parentDashboardSummary.error
                    ? 'Linked student IDs could not be loaded'
                    : 'Loading linked student IDs…';
            } else if (!linkedIdCards.length) {
                idCards.innerHTML = '<p class="parent-id-cards-empty" role="status">No student ID cards have been created for your linked children.</p>';
                if (idCardCount) idCardCount.textContent = 'No issued ID cards available';
            } else {
                idCards.innerHTML = linkedIdCards.map((card, index) => {
                    const name = card.memberName || 'Student';
                    return `<button class="parent-id-card-option" type="button" data-parent-id-card-index="${index}">
                        <span class="parent-id-card-option-icon" aria-hidden="true"><i class="fas fa-id-card"></i></span>
                        <span class="parent-id-card-option-copy"><strong>${dashboardEscape(name)}</strong><small>${dashboardEscape(card.schoolName || 'Student ID card')}</small></span>
                        <span class="parent-id-card-option-action">Preview <i class="fas fa-chevron-right" aria-hidden="true"></i></span>
                    </button>`;
                }).join('');
                if (idCardCount) idCardCount.textContent = `${linkedIdCards.length} ${linkedIdCards.length === 1 ? 'issued ID card' : 'issued ID cards'}`;
            }
            if (idCardsSection) {
                idCardsSection.onclick = event => {
                    const target = event.target;
                    if (!(target instanceof Element)) return;
                    if (target.closest('[data-parent-id-cards-toggle]')) {
                        const expanded = idCards.classList.toggle('hidden') === false;
                        idCardsTrigger?.setAttribute('aria-expanded', String(expanded));
                        return;
                    }
                    if (target.closest('[data-parent-id-card-close]') || target === previewModal) {
                        closePreview();
                        return;
                    }
                    if (target.closest('[data-parent-id-card-flip]')) {
                        previewSide = previewSide === 'front' ? 'back' : 'front';
                        renderPreviewCard();
                        return;
                    }
                    if (target.closest('[data-parent-id-card-save]')) {
                        void savePreviewAsJpg();
                        return;
                    }
                    const previewButton = target.closest('[data-parent-id-card-index]');
                    if (previewButton && previewContent && previewModal) {
                        previewCard = linkedIdCards[Number(previewButton.dataset.parentIdCardIndex)] || null;
                        if (!previewCard) return;
                        previewSide = 'front';
                        if (downloadStatus) downloadStatus.textContent = '';
                        renderPreviewCard();
                        previewModal.classList.remove('hidden');
                        idCardsSection.querySelector('[data-parent-id-card-close]')?.focus();
                    }
                };
                idCardsSection.onkeydown = event => {
                    if (event.key === 'Escape' && previewModal && !previewModal.classList.contains('hidden')) {
                        closePreview();
                    }
                };
            }
        }

        const certificates = container.querySelector('[data-parent-certificates]');
        if (certificates) {
            const certificatesSection = certificates.closest('.parent-certificates-section');
            const certificatesTrigger = certificatesSection?.querySelector('[data-parent-certificates-toggle]');
            const certificateCount = certificatesSection?.querySelector('[data-parent-certificate-count]');
            const previewModal = certificatesSection?.querySelector('[data-parent-certificate-preview-modal]');
            const previewContent = certificatesSection?.querySelector('[data-parent-certificate-preview-content]');
            const previewSubtitle = certificatesSection?.querySelector('[data-parent-certificate-preview-subtitle]');
            const previewTitle = certificatesSection?.querySelector('#parentCertificatePreviewTitle');
            certificates.classList.toggle('hidden', !parentCertificatesExpanded);
            certificatesTrigger?.setAttribute('aria-expanded', String(parentCertificatesExpanded));
            const linkedCertificates = (parentDashboardSummary.records?.certificates || [])
                .filter(certificate => selectedChildren.some(child =>
                    parentStudentRecordId(child) === String(certificate.studentId || '')));
            const closeCertificatePreview = () => {
                previewModal?.classList.add('hidden');
                certificatesTrigger?.focus();
            };
            const safeCertificateImage = value => {
                const image = String(value || '').trim();
                if (!image || image.length > 4096) return '';
                if (/^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(image)) return image;
                try {
                    const url = new URL(image, window.location.href);
                    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
                } catch (error) {
                    return '';
                }
            };
            const renderCertificatePreview = certificate => {
                if (!previewContent || typeof window.createCertificateSheetPreview !== 'function') return;
                previewContent.replaceChildren(window.createCertificateSheetPreview({
                    ...certificate,
                    logo: safeCertificateImage(certificate.logo)
                }));
            };
            if (!parentDashboardSummary.loaded) {
                certificates.innerHTML = `<p class="parent-certificates-empty" role="status">${parentDashboardSummary.error
                    ? 'Linked student certificates could not be loaded.'
                    : 'Loading linked student certificates…'}</p>`;
                if (certificateCount) certificateCount.textContent = parentDashboardSummary.error
                    ? 'Certificates unavailable'
                    : 'Loading certificates…';
            } else if (!linkedCertificates.length) {
                certificates.innerHTML = '<p class="parent-certificates-empty" role="status">No generated certificates are available for your linked children.</p>';
                if (certificateCount) certificateCount.textContent = 'No available certificates';
            } else {
                certificates.innerHTML = linkedCertificates.map((certificate, index) => {
                    const child = children.find(item => parentStudentRecordId(item) === String(certificate.studentId || ''));
                    const studentName = child?.fullName || child?.name || 'Student';
                    return `<button class="parent-certificate-option" type="button" data-parent-certificate-index="${index}">
                        <span class="parent-certificate-option-icon" aria-hidden="true"><i class="fas fa-award"></i></span>
                        <span class="parent-certificate-option-copy"><strong>${dashboardEscape(certificate.certificateType || 'Certificate')}</strong><small>${dashboardEscape(studentName)} · ${dashboardEscape(certificate.academicYear || '')}</small></span>
                        <span class="parent-certificate-option-action">Preview <i class="fas fa-chevron-right" aria-hidden="true"></i></span>
                    </button>`;
                }).join('');
                if (certificateCount) certificateCount.textContent = `${linkedCertificates.length} ${linkedCertificates.length === 1 ? 'available certificate' : 'available certificates'}`;
            }
            if (certificatesSection) {
                certificatesSection.onclick = event => {
                    const target = event.target;
                    if (!(target instanceof Element)) return;
                    if (target.closest('[data-parent-certificates-toggle]')) {
                        parentCertificatesExpanded = !parentCertificatesExpanded;
                        const expanded = parentCertificatesExpanded;
                        certificates.classList.toggle('hidden', !expanded);
                        certificatesTrigger?.setAttribute('aria-expanded', String(expanded));
                        const identity = window.schoolPortalData?.getIdentity?.();
                        const identityKey = identity ? `${identity.schoolId}:${identity.uid}` : '';
                        if (expanded && !adminPreview && identityKey && typeof window.schoolPortalFirebase?.getParentPortalDashboardSummary === 'function') {
                            if (certificateCount) certificateCount.textContent = 'Refreshing certificates…';
                            void window.schoolPortalFirebase.getParentPortalDashboardSummary(identity.schoolId).then(summary => {
                                if (parentPortalIdentityKey !== identityKey) return;
                                parentDashboardSummary = {
                                    ...parentDashboardSummary,
                                    loaded: true,
                                    error: false,
                                    records: {
                                        ...(parentDashboardSummary.records || {}),
                                        certificates: summary.certificates || []
                                    }
                                };
                                renderParentPortalDashboard();
                            }).catch(error => {
                                console.error('Unable to refresh linked student certificates.', error);
                                if (certificateCount) certificateCount.textContent = 'Certificates could not be refreshed';
                            });
                        }
                        return;
                    }
                    if (target.closest('[data-parent-certificate-close]') || target === previewModal) {
                        closeCertificatePreview();
                        return;
                    }
                    const previewButton = target.closest('[data-parent-certificate-index]');
                    if (!previewButton || !previewModal || !previewContent) return;
                    const certificate = linkedCertificates[Number(previewButton.dataset.parentCertificateIndex)];
                    if (!certificate) return;
                    if (previewTitle) previewTitle.textContent = certificate.certificateType || 'Certificate preview';
                    if (previewSubtitle) {
                        const child = children.find(item => parentStudentRecordId(item) === String(certificate.studentId || ''));
                        previewSubtitle.textContent = child?.fullName || child?.name || 'Linked student certificate';
                    }
                    renderCertificatePreview(certificate);
                    previewModal.classList.remove('hidden');
                    certificatesSection.querySelector('[data-parent-certificate-close]')?.focus();
                };
                certificatesSection.onkeydown = event => {
                    if (event.key === 'Escape' && previewModal && !previewModal.classList.contains('hidden')) {
                        closeCertificatePreview();
                    }
                };
            }
        }

        const attention = container.querySelector('[data-parent-attention]');
        const attentionItems = container.querySelector('[data-parent-attention-items]');
        const todayKey = dashboardDateKey(todayStart);
        const absencesToday = parentPortalData.attendance.loaded
            && canViewAttendance
            ? attendanceRecords.filter(record => attendanceStatusFor(record) === 'absent'
                && dashboardDateKey(dateFromRecord(record, ['attendanceDate', 'date', 'day']) || new Date(Number.NaN)) === todayKey)
            : [];
        const dueFeeRecords = parentPortalData.fees.loaded
            && canViewFees
            ? feeRecords.map(fee => ({
                fee,
                dueDate: dateFromRecord(fee, ['dueDate', 'paymentDueDate', 'deadline'])
            })).filter(({ fee, dueDate }) => {
                if (!dueDate || feeOutstandingAmount(fee) <= 0) return false;
                const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
                return Math.floor((dueDay - todayStart) / 86400000) <= 7;
            })
            : [];
        const attentionMessages = [];
        if (absencesToday.length) {
            attentionMessages.push(`<li><i class="fas fa-user-clock" aria-hidden="true"></i><span><strong>${absencesToday.length} ${absencesToday.length === 1 ? 'absence' : 'absences'} recorded today</strong><small>Review the attendance details for the selected child${selectedChild === 'all' ? 'ren' : ''}.</small></span></li>`);
        }
        const overdueFees = dueFeeRecords.filter(({ dueDate }) => dueDate < todayStart);
        const upcomingFees = dueFeeRecords.filter(({ dueDate }) => dueDate >= todayStart);
        if (overdueFees.length) {
            const amount = overdueFees.reduce((sum, { fee }) => sum + feeOutstandingAmount(fee), 0);
            attentionMessages.push(`<li><i class="fas fa-receipt" aria-hidden="true"></i><span><strong>${overdueFees.length} fee ${overdueFees.length === 1 ? 'balance is' : 'balances are'} overdue</strong><small>${dashboardMoney(amount)} outstanding ${selectedChild === 'all' ? 'across linked children' : 'for the selected child'}.</small></span></li>`);
        }
        if (upcomingFees.length) {
            const amount = upcomingFees.reduce((sum, { fee }) => sum + feeOutstandingAmount(fee), 0);
            attentionMessages.push(`<li><i class="fas fa-receipt" aria-hidden="true"></i><span><strong>${upcomingFees.length} fee ${upcomingFees.length === 1 ? 'balance is' : 'balances are'} due within seven days</strong><small>${dashboardMoney(amount)} due ${selectedChild === 'all' ? 'across linked children' : 'for the selected child'}.</small></span></li>`);
        }
        if (attentionItems) attentionItems.innerHTML = attentionMessages.join('');
        attention?.classList.toggle('hidden', !attentionMessages.length);

        const attendanceChart = container.querySelector('[data-parent-attendance-chart]');
        if (attendanceChart) {
            const now = new Date();
            const months = Array.from({ length: 6 }, (_, index) => {
                const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
                return {
                    date,
                    label: date.toLocaleDateString(undefined, { month: 'short' }),
                    counts: { present: 0, late: 0, absent: 0, excused: 0 }
                };
            });
            attendanceDashboardRecords.forEach(record => {
                const date = dateFromRecord(record, ['attendanceDate', 'date', 'day']);
                const status = attendanceStatusFor(record);
                if (!date || !Object.hasOwn(attendanceCounts, status)) return;
                const month = months.find(item => item.date.getFullYear() === date.getFullYear()
                    && item.date.getMonth() === date.getMonth());
                if (month) month.counts[status] += 1;
            });
            const chartHasData = months.some(month => Object.values(month.counts).some(count => count));
            const attendanceChartLoaded = canViewAttendance
                ? parentPortalData.attendance.loaded
                : parentDashboardSummary.loaded;
            const attendanceChartError = canViewAttendance
                ? parentPortalData.attendance.error && !parentPortalData.attendance.loaded
                : parentDashboardSummary.error;
            if (!attendanceChartLoaded && !attendanceChartError) {
                attendanceChart.setAttribute('aria-label', 'Attendance chart loading');
                attendanceChart.innerHTML = '<p class="parent-chart-empty">Loading linked attendance records…</p>';
            } else if (attendanceChartError) {
                attendanceChart.setAttribute('aria-label', 'Attendance history unavailable');
                attendanceChart.innerHTML = '<p class="parent-chart-empty">Attendance history could not be loaded. Please try again later.</p>';
            } else if (!chartHasData) {
                attendanceChart.setAttribute('aria-label', 'No attendance records in the last six months');
                attendanceChart.innerHTML = '<p class="parent-chart-empty">Attendance history will appear here when records are available.</p>';
            } else {
                const summary = months.filter(month => Object.values(month.counts).some(count => count))
                    .map(month => `${month.label}: ${month.counts.present} present, ${month.counts.late} late, ${month.counts.absent} absent, ${month.counts.excused} excused`)
                    .join('; ');
                attendanceChart.setAttribute('aria-label', `Attendance records over the last six months. ${summary}`);
                attendanceChart.innerHTML = months.map(month => {
                    const total = Object.values(month.counts).reduce((sum, count) => sum + count, 0);
                    const segments = Object.entries(month.counts).filter(([, count]) => count > 0).map(([status, count]) =>
                        `<span class="parent-attendance-segment ${status}" style="width:${(count / total * 100).toFixed(2)}%" title="${status}: ${count}"></span>`
                    ).join('');
                    return `<div class="parent-attendance-month"><span>${month.label}</span><div class="parent-attendance-track" aria-hidden="true">${segments || '<span class="parent-attendance-empty-track"></span>'}</div><strong>${total || '—'}</strong></div>`;
                }).join('');
            }
        }
        const attendanceCalendar = container.querySelector('[data-parent-attendance-calendar]');
        const attendanceCalendarMonth = container.querySelector('[data-parent-attendance-calendar-month-filter]');
        const attendanceCalendarStatus = container.querySelector('[data-parent-attendance-calendar-status]');
        const attendanceCalendarTitle = container.querySelector('[data-parent-attendance-calendar-month]');
        const attendanceCalendarMessage = container.querySelector('[data-parent-attendance-calendar-message]');
        if (attendanceCalendar && attendanceCalendarMonth && attendanceCalendarStatus) {
            if (!attendanceCalendarMonth.value) {
                attendanceCalendarMonth.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            }
            const renderAttendanceCalendar = () => {
                const [year, monthNumber] = attendanceCalendarMonth.value.split('-').map(Number);
                if (!year || !monthNumber) return;
                const monthStart = new Date(year, monthNumber - 1, 1);
                const dayCount = new Date(year, monthNumber, 0).getDate();
                const mondayOffset = (monthStart.getDay() + 6) % 7;
                const statusFilter = attendanceCalendarStatus.value;
                if (attendanceCalendarTitle) {
                    attendanceCalendarTitle.textContent = monthStart.toLocaleDateString(undefined, {
                        month: 'long', year: 'numeric'
                    });
                }
                const statusLabels = {
                    present: 'Present',
                    late: 'Late',
                    absent: 'Absent',
                    excused: 'Excused'
                };
                const statusMarks = { present: 'P', late: 'L', absent: 'A', excused: 'E' };
                const cards = Array.from({ length: mondayOffset }, () =>
                    '<span class="parent-attendance-calendar-blank" aria-hidden="true"></span>');
                for (let day = 1; day <= dayCount; day += 1) {
                    const date = new Date(year, monthNumber - 1, day);
                    const dateKey = dashboardDateKey(date);
                    const dayRecords = attendanceDashboardRecords.filter(record => {
                        const recordDate = dateFromRecord(record, ['attendanceDate', 'date', 'day']);
                        return recordDate && dashboardDateKey(recordDate) === dateKey;
                    });
                    const matchedRecords = statusFilter === 'all' || statusFilter === 'no-record'
                        ? dayRecords
                        : dayRecords.filter(record => attendanceStatusFor(record) === statusFilter);
                    const counts = Object.fromEntries(Object.keys(statusLabels).map(status => [status,
                        matchedRecords.filter(record => attendanceStatusFor(record) === status).length
                    ]));
                    const statuses = Object.entries(counts).filter(([, count]) => count > 0);
                    const statusMarkup = statuses.length && statusFilter !== 'no-record'
                        ? statuses.map(([status, count]) => `<span class="parent-attendance-day-status ${status}" title="${statusLabels[status]}: ${count}">${statusFilter === 'all' && selectedChild === 'all' ? `${statusMarks[status]} ${count}` : statusLabels[status].slice(0, 4)}</span>`).join('')
                        : `<small class="parent-attendance-day-empty">${dayRecords.length ? 'No matching status' : 'No Re'}</small>`;
                    const weekday = date.toLocaleDateString(undefined, { weekday: 'short' });
                    cards.push(`<article class="parent-attendance-day-card${statuses.length ? ' has-records' : ''}" role="listitem" aria-label="${dashboardEscape(`${weekday}, ${date.toLocaleDateString()}${statuses.length ? `: ${statuses.map(([status, count]) => `${statusLabels[status]} ${count}`).join(', ')}` : ': no matching attendance record'}`)}"><span class="parent-attendance-day-heading"><small>${weekday}</small><strong>${day}</strong></span><span class="parent-attendance-day-statuses">${statusMarkup}</span></article>`);
                }
                attendanceCalendar.innerHTML = cards.join('');
                attendanceCalendar.setAttribute('aria-label', `Attendance calendar for ${monthStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`);
                const loaded = canViewAttendance
                    ? parentPortalData.attendance.loaded
                    : parentDashboardSummary.loaded;
                const error = canViewAttendance
                    ? parentPortalData.attendance.error && !parentPortalData.attendance.loaded
                    : parentDashboardSummary.error;
                if (attendanceCalendarMessage) {
                    attendanceCalendarMessage.textContent = error
                        ? 'Attendance details are unavailable right now.'
                        : !loaded
                            ? 'Loading attendance details…'
                            : !attendanceDashboardRecords.some(record => {
                                const recordDate = dateFromRecord(record, ['attendanceDate', 'date', 'day']);
                                return recordDate && recordDate.getFullYear() === year
                                    && recordDate.getMonth() === monthNumber - 1;
                            })
                                ? 'No attendance records for this month and student filter.'
                                : '';
                }
            };
            attendanceCalendarMonth.onchange = renderAttendanceCalendar;
            attendanceCalendarStatus.onchange = renderAttendanceCalendar;
            renderAttendanceCalendar();
        }
        updateDashboardActionAccess();
        const visibleFeatureCards = [...document.querySelectorAll('.parent-sidebar-navigation [data-parent-nav]')].some(button => {
            const collection = button.dataset.parentCollection;
            return adminPreview || canViewParentPortalCollection(collection);
        });
        document.getElementById('parentPortalNoFeatures')?.classList.toggle('hidden', visibleFeatureCards);

        const resultsSection = container.querySelector('[data-parent-results-section]');
        const canViewResults = adminPreview || canViewParentPortalSection('reportCards')
            && (permissions.reportCards?.view === true
                || permissions.assessments?.view === true
                || activeAccountPermissions?.permissions?.reportCards?.view === true
                || activeAccountPermissions?.permissions?.assessments?.view === true);
        resultsSection?.classList.toggle('hidden', !canViewChildren || !canViewResults || !parentPortalData.students.loaded || !children.length);
        const selectedStudent = children.find(child => parentStudentRecordId(child) === selectedChild);
        if (resultsSection && canViewChildren && canViewResults && parentPortalData.students.loaded && children.length) {
            const childById = new Map(children.map(child => [parentStudentRecordId(child), child]));
            const allowedCollections = ['reportCards', 'examResults', 'assessments'].filter(collection =>
                adminPreview || canViewParentPortalSection('reportCards')
                    && (permissions[collection]?.view === true
                        || activeAccountPermissions?.permissions?.[collection]?.view === true)
            );
            const resultsPending = allowedCollections.some(collection =>
                !parentPortalData[collection].loaded && !parentPortalData[collection].error
            );
            const resultsUnavailable = allowedCollections.some(collection => parentPortalData[collection].error);
            const resultRows = allowedCollections.flatMap(collection => parentPortalData[collection].records.flatMap(record => {
                const matchedId = parentStudentId(record);
                const child = childById.get(matchedId);
                if (!child || (selectedChild !== 'all' && matchedId !== selectedChild)) return [];
                return parentResultRows(record, collection).map(result => ({
                    ...result,
                    student: child.fullName || child.name || child.studentName || child.displayName || 'Student'
                }));
            }));
            const filter = container.querySelector('[data-parent-results-filter]');
            const filteredRows = resultRows.filter(result => filter?.value === 'all' || result.type.toLowerCase().startsWith(filter?.value || ''));
            const average = filteredRows.length
                ? filteredRows.reduce((sum, result) => sum + result.percentage, 0) / filteredRows.length
                : null;
            const pendingLabel = resultsPending && !filteredRows.length ? '…' : null;
            const summary = container.querySelector('[data-parent-results-summary]');
            if (summary) summary.innerHTML = `<article class="parent-result-stat"><span>Published scores</span><strong>${pendingLabel || filteredRows.length}</strong></article><article class="parent-result-stat"><span>Average percentage</span><strong>${pendingLabel || (average === null ? '—' : `${average.toFixed(1)}%`)}</strong></article><article class="parent-result-stat"><span>Assessment types</span><strong>${pendingLabel || (new Set(filteredRows.map(result => result.type)).size || '—')}</strong></article>`;
            const groupedSubjects = new Map();
            filteredRows.forEach(result => {
                const group = groupedSubjects.get(result.subject) || { total: 0, count: 0 };
                group.total += result.percentage;
                group.count += 1;
                groupedSubjects.set(result.subject, group);
            });
            const chart = container.querySelector('[data-parent-results-chart]');
            if (chart) {
                const subjects = [...groupedSubjects.entries()].map(([subject, values]) => ({
                    subject,
                    percentage: values.total / values.count
                })).sort((left, right) => right.percentage - left.percentage);
                chart.setAttribute('aria-label', subjects.length
                    ? `Average subject performance: ${subjects.map(item => `${item.subject} ${item.percentage.toFixed(1)} percent`).join(', ')}`
                    : 'No subject scores available to chart');
                chart.innerHTML = subjects.length ? subjects.map(item => `<div class="parent-chart-row"><span class="parent-chart-subject">${dashboardEscape(item.subject)}</span><div class="parent-chart-track"><span style="width:${item.percentage.toFixed(1)}%"></span></div><strong>${item.percentage.toFixed(1)}%</strong></div>`).join('')
                    : '<p class="parent-chart-empty">Published subject scores will appear here when available.</p>';
            }
            const rows = container.querySelector('[data-parent-results-rows]');
            if (rows) rows.innerHTML = filteredRows.length ? filteredRows.map(result => `<tr><td data-label="Student">${dashboardEscape(result.student)}</td><td data-label="Subject"><strong>${dashboardEscape(result.subject)}</strong></td><td data-label="Exam / test">${dashboardEscape(result.assessment || '—')}</td><td data-label="Type"><span class="parent-assessment-type ${result.type === 'Term exam' ? 'term' : 'test'}">${dashboardEscape(result.type)}</span></td><td data-label="Date">${dashboardEscape(result.date || '—')}</td><td data-label="Maximum">${result.maximum === null ? '—' : dashboardEscape(result.maximum)}</td><td data-label="Score">${result.score === null ? '—' : dashboardEscape(result.score)}</td><td data-label="Percentage"><strong>${result.percentage.toFixed(1)}%</strong></td><td data-label="Teacher remarks">${dashboardEscape(result.remarks || '—')}</td></tr>`).join('')
                : '<tr><td colspan="9" class="parent-results-empty-cell">No published subject-level scores are available for this selection.</td></tr>';
            const caption = container.querySelector('[data-parent-results-caption]');
            if (caption) caption.textContent = selectedChild === 'all'
                ? 'Published scores across linked students'
                : `Published scores for ${selectedStudent?.fullName || selectedStudent?.name || selectedStudent?.studentName || 'this student'}`;
            const count = container.querySelector('[data-parent-results-count]');
            if (count) count.textContent = resultsPending && !filteredRows.length
                ? 'Loading results…'
                : `${filteredRows.length} ${filteredRows.length === 1 ? 'assessment' : 'assessments'}${resultsPending ? ' · loading more' : resultsUnavailable ? ' · some data unavailable' : ''}`;
            const emptyState = container.querySelector('[data-parent-results-empty]');
            if (emptyState) {
                emptyState.textContent = resultsPending
                    ? 'Loading linked assessment results…'
                    : resultsUnavailable
                        ? 'Some assessment results could not be loaded. Please try again later.'
                        : 'No published subject-level scores are available for this selection.';
                emptyState.classList.toggle('hidden', filteredRows.length > 0);
            }
        }
        renderParentPortalDetailView(container, children, selectedChild, permissions, adminPreview);
    }
    document.getElementById('parentChildSelector')?.addEventListener('change', event => {
        const selectedChild = event.target.value === 'all' ? '' : event.target.value;
        window.schoolPortalData?.setParentChildFilter?.(selectedChild);
        renderParentPortalDashboard();
    });
    document.getElementById('parentPortalHome')?.addEventListener('change', event => {
        if (event.target.matches('[data-parent-results-filter]')) renderParentPortalDashboard();
    });

    const dashboardRange = () => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (selectedDashboardPeriod === 'today') {
            return { start: todayStart, end: new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate(), 23, 59, 59, 999) };
        }
        if (selectedDashboardPeriod === 'yesterday') {
            const yesterday = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() - 1);
            return { start: yesterday, end: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999) };
        }
        if (selectedDashboardPeriod === 'lastWeek') {
            const thisWeekStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() - ((todayStart.getDay() + 6) % 7));
            const lastWeekStart = new Date(thisWeekStart.getFullYear(), thisWeekStart.getMonth(), thisWeekStart.getDate() - 7);
            return {
                start: lastWeekStart,
                end: new Date(thisWeekStart.getFullYear(), thisWeekStart.getMonth(), thisWeekStart.getDate() - 1, 23, 59, 59, 999)
            };
        }
        if (selectedDashboardPeriod === 'month') {
            return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999) };
        }
        if (selectedDashboardPeriod === 'year') {
            return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999) };
        }
        if (selectedDashboardPeriod === 'custom') {
            const startValue = document.getElementById('dashboardStartDate')?.value;
            const endValue = document.getElementById('dashboardEndDate')?.value;
            const start = startValue ? parseDashboardDate(startValue) : null;
            const end = endValue ? parseDashboardDate(endValue) : null;
            if (start && !Number.isNaN(start.getTime())) start.setHours(0, 0, 0, 0);
            if (end && !Number.isNaN(end.getTime())) end.setHours(23, 59, 59, 999);
            return { start, end, invalid: !start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end };
        }
        return { start: null, end: null };
    };
    const dashboardPeriodLabel = range => ({
        today: 'Today',
        yesterday: 'Yesterday',
        lastWeek: 'Last week',
        month: 'Current month',
        year: 'This year',
        all: 'All time'
    })[selectedDashboardPeriod] || (range.invalid
        ? 'Invalid range'
        : `${range.start ? dashboardDateLabel(range.start) : 'Any date'} – ${range.end ? dashboardDateLabel(range.end) : 'Any date'}`);
    const dashboardDateInRange = (date, range, includeUndated = false) => {
        if (!date) return includeUndated && !range.start && !range.end;
        return (!range.start || date >= range.start) && (!range.end || date <= range.end);
    };

    function renderDashboardData() {
        const recordsFor = collection => dashboardData[collection].records;
        const setStat = (name, value) => {
            const element = document.querySelector(`[data-dashboard-stat="${name}"]`);
            if (element) element.textContent = value;
        };
        const availableCount = collection => dashboardData[collection].loaded
            ? recordsFor(collection).length.toLocaleString()
            : '—';

        setStat('students', availableCount('students'));
        setStat('teachers', availableCount('teachers'));
        setStat('parents', availableCount('parents'));

        const fees = recordsFor('fees');
        const expenses = recordsFor('expenses');
        const attendance = recordsFor('attendance');
        const range = dashboardRange();
        const periodLabel = dashboardPeriodLabel(range);
        const periodLabelElement = document.getElementById('dashboardPeriodLabel');
        const periodElement = document.getElementById('dashboardPeriod');
        const customRangeElement = document.getElementById('dashboardDateRange');
        if (periodLabelElement) periodLabelElement.textContent = periodLabel;
        if (periodElement && periodElement.value !== selectedDashboardPeriod) periodElement.value = selectedDashboardPeriod;
        customRangeElement?.classList.toggle('hidden', selectedDashboardPeriod !== 'custom');

        const collectedInPeriod = fees.reduce((sum, fee) => {
            const paymentDate = fee.paymentDate ? parseDashboardDate(fee.paymentDate) : null;
            return dashboardDateInRange(paymentDate && !Number.isNaN(paymentDate.getTime()) ? paymentDate : null, range, true)
                ? sum + feePaidAmount(fee)
                : sum;
        }, 0);
        const outstanding = fees.reduce((sum, fee) => sum + feeOutstandingAmount(fee), 0);
        const overdueFees = fees.filter(fee => {
            const dueDate = fee.dueDate ? parseDashboardDate(fee.dueDate) : null;
            return feeOutstandingAmount(fee) > 0 && (
                String(fee.status || '').toLowerCase() === 'overdue'
                || (dueDate && !Number.isNaN(dueDate.getTime()) && dueDate < new Date(new Date().setHours(0, 0, 0, 0)))
            );
        });
        const periodBilledFees = fees.filter(fee => {
            const billedDateValue = fee.dueDate || fee.paymentDate || fee.date;
            const billedDate = billedDateValue ? parseDashboardDate(billedDateValue) : null;
            return dashboardDateInRange(billedDate && !Number.isNaN(billedDate.getTime()) ? billedDate : null, range, true);
        });
        const billedInPeriod = periodBilledFees.reduce((sum, fee) => sum + feeBilledAmount(fee), 0);
        const collectedAgainstBilled = periodBilledFees.reduce((sum, fee) => sum + Math.min(feePaidAmount(fee), feeBilledAmount(fee)), 0);
        const expensesInPeriod = expenses.reduce((sum, expense) => {
            const expenseDate = expense.expenseDate ? parseDashboardDate(expense.expenseDate) : null;
            return dashboardDateInRange(expenseDate && !Number.isNaN(expenseDate.getTime()) ? expenseDate : null, range, true)
                ? sum + dashboardNumber(expense.amount)
                : sum;
        }, 0);
        const todayKey = dashboardDateKey(new Date());
        const attendanceToday = attendance.filter(record => {
            const date = record.date ? parseDashboardDate(record.date) : null;
            return date && !Number.isNaN(date.getTime()) && dashboardDateKey(date) === todayKey;
        });
        const attendedToday = attendanceToday.filter(record => ['present', 'late', 'excused'].includes(String(record.status || '').toLowerCase())).length;
        setStat('earnings', dashboardData.fees.loaded && !range.invalid ? dashboardMoney(collectedInPeriod) : '—');
        setStat('outstanding', dashboardData.fees.loaded ? dashboardMoney(outstanding) : '—');
        setStat('collectionRate', dashboardData.fees.loaded && !range.invalid && billedInPeriod > 0
            ? `${Math.round(collectedAgainstBilled / billedInPeriod * 100)}%`
            : '—');
        setStat('overdueFees', dashboardData.fees.loaded ? overdueFees.length.toLocaleString() : '—');
        setStat('expenses', dashboardData.expenses.loaded && !range.invalid ? dashboardMoney(expensesInPeriod) : '—');
        setStat('attendanceRate', dashboardData.attendance.loaded && attendanceToday.length
            ? `${Math.round(attendedToday / attendanceToday.length * 100)}%`
            : '—');
        setStat('attendanceRecords', dashboardData.attendance.loaded ? attendanceToday.length.toLocaleString() : '—');

        const dateRangeInputs = [document.getElementById('dashboardStartDate'), document.getElementById('dashboardEndDate')];
        dateRangeInputs.forEach(input => input?.setAttribute('aria-invalid', String(Boolean(range.invalid))));

        const schoolContext = document.getElementById('dashboardSchoolContext');
        if (schoolContext) {
            const academicYears = [...new Set(fees.map(fee => fee.academicYear).filter(Boolean))].sort();
            schoolContext.textContent = [currentSchool?.schoolName || 'School dashboard', academicYears.at(-1)].filter(Boolean).join(' · ');
        }
        const dataStatus = document.getElementById('dashboardDataStatus');
        if (dataStatus) {
            const loadedCount = [...dashboardSubscribedCollections].filter(collection => dashboardData[collection]?.loaded).length;
            const hasErrors = [...dashboardSubscribedCollections].some(collection => dashboardData[collection]?.error);
            const syncIndicator = document.querySelector('.portal-sync-indicator');
            const syncState = syncIndicator?.dataset.state;
            const lastUpdatedLabel = dashboardLastUpdated
                ? ` · Updated ${dashboardLastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                : '';
            dataStatus.textContent = range.invalid ? 'Choose a valid date range.'
                : !navigator.onLine ? `Offline · Showing available local data${lastUpdatedLabel}`
                    : hasErrors ? `Some data is unavailable${lastUpdatedLabel}`
                        : dashboardSubscribedCollections.size
                            ? `${loadedCount} of ${dashboardSubscribedCollections.size} permitted data sources loaded${lastUpdatedLabel}${syncState === 'pending' ? ' · Syncing' : ''}`
                            : 'No dashboard data sources are available for this account.';
            dataStatus.dataset.state = !navigator.onLine ? 'offline' : hasErrors ? 'error' : 'ready';
        }
        const queue = [];
        if (dashboardData.fees.loaded && overdueFees.length) {
            queue.push({
                title: `${overdueFees.length} fee ${overdueFees.length === 1 ? 'balance is' : 'balances are'} overdue`,
                detail: `Outstanding total: ${dashboardMoney(overdueFees.reduce((sum, fee) => sum + feeOutstandingAmount(fee), 0))}`,
                section: 'Fees'
            });
        }
        if (dashboardData.notices.loaded) {
            const drafts = recordsFor('notices').filter(notice => ['draft', 'pending', 'awaiting approval'].includes(String(notice.status || '').toLowerCase()));
            if (drafts.length) {
                queue.push({
                    title: `${drafts.length} notice ${drafts.length === 1 ? 'needs' : 'need'} review`,
                    detail: 'Draft or pending notices are not yet published.',
                    section: 'Notice Board'
                });
            }
        }
        const absentToday = attendanceToday.filter(record => String(record.status || '').toLowerCase() === 'absent').length;
        if (dashboardData.attendance.loaded && absentToday) {
            queue.push({
                title: `${absentToday} ${absentToday === 1 ? 'absence is' : 'absences are'} recorded today`,
                detail: 'Review today’s attendance register.',
                section: 'Attendance'
            });
        }
        const queueContainer = document.getElementById('dashboardActionQueue');
        const queueCount = document.getElementById('dashboardQueueCount');
        if (queueCount) queueCount.textContent = String(queue.length);
        if (queueContainer) {
            const loadedActionSources = [...dashboardSubscribedCollections].some(collection => dashboardData[collection].loaded);
            const actionSourceError = [...dashboardSubscribedCollections].some(collection => dashboardData[collection].error);
            queueContainer.innerHTML = queue.length
                ? queue.map(item => `<article class="dashboard-queue-item"><div><strong>${dashboardEscape(item.title)}</strong><span>${dashboardEscape(item.detail)}</span></div><button type="button" data-dashboard-open="${dashboardEscape(item.section)}">Review <i class="fas fa-arrow-right" aria-hidden="true"></i></button></article>`).join('')
                : `<p class="dashboard-empty">${actionSourceError ? 'Some action items are unavailable because a permitted data source could not be loaded.' : loadedActionSources ? 'Nothing currently needs attention based on available records.' : 'No action items are available to this account.'}</p>`;
        }
        updateDashboardActionAccess();

        const students = recordsFor('students');
        if (dashboardData.students.loaded) {
            const maleCount = students.filter(student => String(student.gender || '').toLowerCase() === 'male').length;
            const femaleCount = students.filter(student => String(student.gender || '').toLowerCase() === 'female').length;
            const totalGenderRecords = maleCount + femaleCount;
            const malePercent = totalGenderRecords ? Math.round(maleCount / totalGenderRecords * 100) : 0;
            const femalePercent = totalGenderRecords ? 100 - malePercent : 0;
            setStat('maleShare', `${malePercent}%`);
            setStat('femaleShare', `${femalePercent}%`);
            const genderChart = document.getElementById('dashboardGenderChart');
            if (genderChart) {
                genderChart.style.background = `conic-gradient(#d4a080 0 ${malePercent}%, #5f6d9c ${malePercent}% 100%)`;
                genderChart.classList.toggle('is-male-selected', selectedGender === 'male');
                genderChart.classList.toggle('is-female-selected', selectedGender === 'female');
            }
            const genderDetail = document.getElementById('dashboardGenderDetail');
            if (genderDetail) {
                const selectedCount = selectedGender === 'male' ? maleCount : selectedGender === 'female' ? femaleCount : students.length;
                const detailText = selectedGender
                    ? `${selectedGender === 'male' ? 'Male' : 'Female'} · ${selectedCount}`
                    : `Students · ${students.length}`;
                genderDetail.textContent = detailText;
            }
            document.querySelectorAll('[data-gender-select]').forEach(button => {
                button.setAttribute('aria-pressed', String(button.dataset.genderSelect === selectedGender));
            });
        } else {
            setStat('maleShare', '—');
            setStat('femaleShare', '—');
        }

        const year = chartViewYear;
        const monthlyFees = Array(12).fill(0);
        const monthlyExpenses = Array(12).fill(0);
        fees.forEach(fee => {
            const date = fee.paymentDate ? parseDashboardDate(fee.paymentDate) : null;
            if (date && !Number.isNaN(date.getTime()) && date.getFullYear() === year) {
                monthlyFees[date.getMonth()] += dashboardNumber(fee.amountPaid ?? fee.paidAmount ?? fee.amountCollected);
            }
        });
        recordsFor('expenses').forEach(expense => {
            const date = expense.expenseDate ? parseDashboardDate(expense.expenseDate) : null;
            if (date && !Number.isNaN(date.getTime()) && date.getFullYear() === year) {
                monthlyExpenses[date.getMonth()] += dashboardNumber(expense.amount);
            }
        });
        const barChart = document.getElementById('dashboardEarningsChart');
        const monthLabels = document.getElementById('dashboardChartMonths');
        const chartYear = document.getElementById('dashboardChartYear');
        const chartDetail = document.getElementById('dashboardChartDetail');
        const feesLoaded = dashboardData.fees.loaded;
        const expensesLoaded = dashboardData.expenses.loaded;
        if (chartYear) chartYear.textContent = String(year);
        if (barChart && monthLabels) {
            document.querySelectorAll('[data-dashboard-series="fees"]').forEach(element => { element.hidden = !feesLoaded; });
            document.querySelectorAll('[data-dashboard-series="expenses"]').forEach(element => { element.hidden = !expensesLoaded; });
            if (!feesLoaded && !expensesLoaded) {
                barChart.innerHTML = '<p class="dashboard-empty">Financial data unavailable for this account.</p>';
                monthLabels.replaceChildren();
                if (chartDetail) chartDetail.textContent = '';
            } else {
                const months = Array.from({ length: 12 }, (_, index) => new Date(year, index, 1).toLocaleString(undefined, { month: 'short' }));
                const max = Math.max(0, ...(feesLoaded ? monthlyFees : []), ...(expensesLoaded ? monthlyExpenses : []));
                barChart.innerHTML = months.map((month, index) => {
                    const feesHeight = feesLoaded && max ? Math.max(2, monthlyFees[index] / max * 100) : 0;
                    const expenseHeight = expensesLoaded && max ? Math.max(2, monthlyExpenses[index] / max * 100) : 0;
                    const isSelected = selectedChartMonth === index;
                    return `<button type="button" class="bar-group${isSelected ? ' selected' : ''}" data-chart-month="${index}" aria-pressed="${isSelected}" aria-label="${month} ${year}: fees ${feesLoaded ? `UGX ${monthlyFees[index].toLocaleString()}` : 'unavailable'}, expenses ${expensesLoaded ? `UGX ${monthlyExpenses[index].toLocaleString()}` : 'unavailable'}"><span class="bar primary" style="--h:${feesHeight}%"></span><span class="bar secondary" style="--h:${expenseHeight}%"></span></button>`;
                }).join('');
                monthLabels.innerHTML = months.map((month, index) => `<button type="button" data-chart-month="${index}" aria-pressed="${selectedChartMonth === index}">${dashboardEscape(month)}</button>`).join('');
                const detailMonth = selectedChartMonth ?? dashboardToday.getMonth();
                if (chartDetail) {
                    const monthName = months[detailMonth];
                    const feeSummary = feesLoaded ? `Fees collected: UGX ${monthlyFees[detailMonth].toLocaleString('en-UG')}` : 'Fees: unavailable';
                    const expenseSummary = expensesLoaded ? `Expenses: UGX ${monthlyExpenses[detailMonth].toLocaleString('en-UG')}` : 'Expenses: unavailable';
                    chartDetail.textContent = `${monthName} ${year} · ${feeSummary} · ${expenseSummary}`;
                }
            }
        }

        const noticesContainer = document.getElementById('dashboardNotices');
        if (noticesContainer) {
            const notices = recordsFor('notices')
                .filter(notice => String(notice.status || '').toLowerCase() === 'published')
                .sort((left, right) => (dashboardDate(right)?.getTime() || 0) - (dashboardDate(left)?.getTime() || 0))
                .slice(0, 4);
            noticesContainer.innerHTML = notices.length
                ? notices.map(notice => `<article class="notice-item"><div class="notice-thumb"></div><div class="notice-text"><p>${dashboardEscape(notice.title || notice.subject || 'School notice')}</p></div><div class="notice-meta"><span>${dashboardEscape(dashboardDateLabel(notice.publishDate || notice.date || notice.createdAt))}</span></div></article>`).join('')
                : `<p class="dashboard-empty">${dashboardData.notices.loaded ? 'No published notices.' : 'Notice data unavailable for this account.'}</p>`;
        }

        const eventRecords = recordsFor('calendarEvents');
        const today = new Date();
        const currentMonth = calendarViewMonth;
        const calendarMonth = document.getElementById('dashboardCalendarMonth');
        const calendarGrid = document.getElementById('dashboardCalendarGrid');
        if (calendarMonth) calendarMonth.textContent = currentMonth.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        if (calendarGrid) {
            const firstDayOffset = (currentMonth.getDay() + 6) % 7;
            const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
            const eventDays = new Set(eventRecords.map(event => dashboardDate(event))
                .filter(date => date && date.getFullYear() === currentMonth.getFullYear() && date.getMonth() === currentMonth.getMonth())
                .map(date => date.getDate()));
            const weekdayLabels = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
            calendarGrid.innerHTML = weekdayLabels.map(day => `<span>${day}</span>`).join('')
                + Array.from({ length: firstDayOffset }, () => '<span class="mute"></span>').join('')
                + Array.from({ length: daysInMonth }, (_, index) => {
                    const day = index + 1;
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const isToday = date.toDateString() === today.toDateString();
                    const isSelected = date.toDateString() === calendarSelectedDate.toDateString();
                    const classes = [eventDays.has(day) ? 'has-event' : '', isToday ? 'today' : '', isSelected ? 'selected' : ''].filter(Boolean).join(' ');
                    const dateKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    return `<button type="button" class="${classes}" data-calendar-date="${dateKey}" aria-pressed="${isSelected}" aria-label="${date.toLocaleDateString(undefined, { dateStyle: 'full' })}${eventDays.has(day) ? ', has events' : ''}">${day}</button>`;
                }).join('');
        }

        const eventsContainer = document.getElementById('dashboardEvents');
        if (eventsContainer) {
            const selectedDay = new Date(calendarSelectedDate.getFullYear(), calendarSelectedDate.getMonth(), calendarSelectedDate.getDate());
            const selectedEvents = eventRecords.map(event => ({ event, date: dashboardDate(event) }))
                .filter(item => item.date && item.date.toDateString() === selectedDay.toDateString())
                .sort((left, right) => left.date - right.date);
            const eventsTitle = document.querySelector('.upcoming-events-panel .panel-header h3');
            if (eventsTitle) eventsTitle.textContent = `Events · ${dashboardDateLabel(selectedDay)}`;
            eventsContainer.innerHTML = selectedEvents.length
                ? selectedEvents.map(({ event, date }) => `<div class="dashboard-event"><span>${dashboardEscape(dashboardDateLabel(date))}</span><strong>${dashboardEscape(event.title || event.eventName || event.name || 'School event')}</strong></div>`).join('')
                : `<p class="dashboard-empty">${dashboardData.calendarEvents.loaded ? `No events on ${dashboardEscape(dashboardDateLabel(selectedDay))}.` : 'Event data unavailable for this account.'}</p>`;
        }

        const recentFees = document.getElementById('dashboardRecentFees');
        if (recentFees) {
            const payments = fees.map(fee => ({
                fee,
                amount: feePaidAmount(fee),
                date: fee.paymentDate ? parseDashboardDate(fee.paymentDate) : null
            })).filter(item => item.amount > 0 && !range.invalid
                && dashboardDateInRange(item.date && !Number.isNaN(item.date.getTime()) ? item.date : null, range, true))
                .sort((left, right) => (right.date?.getTime() || 0) - (left.date?.getTime() || 0))
                .slice(0, 5);
            recentFees.innerHTML = payments.length
                ? payments.map(({ fee, amount, date }) => `<tr><td>${dashboardEscape(fee.studentName || fee.name || 'Student')}</td><td>${dashboardEscape(fee.studentClass || fee.className || '—')}</td><td>UGX ${amount.toLocaleString('en-UG', { maximumFractionDigits: 0 })}</td><td><span class="badge ${String(fee.status || '').toLowerCase() === 'paid' ? 'paid' : 'pending'}">${dashboardEscape(fee.status || 'Received')}</span></td><td>${dashboardEscape(dashboardDateLabel(date))}</td></tr>`).join('')
                : `<tr><td colspan="5" class="dashboard-empty">${!dashboardData.fees.loaded ? 'Fee data unavailable for this account.' : range.invalid ? 'Choose a valid date range.' : 'No fee payments recorded in this period.'}</td></tr>`;
            const tableTitle = document.querySelector('.table-title');
            if (tableTitle) tableTitle.textContent = `Recent Fee Payments · ${periodLabel}`;
        }
    }

    const reportingPeriodSelect = document.getElementById('dashboardPeriod');
    reportingPeriodSelect?.addEventListener('change', () => {
        selectedDashboardPeriod = reportingPeriodSelect.value;
        renderDashboardData();
    });
    ['dashboardStartDate', 'dashboardEndDate'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', renderDashboardData);
    });

    let activeAccountPermissions = null;
    const findDashboardNavLink = section => Array.from(document.querySelectorAll('.nav-links a')).find(link => {
        const label = link.querySelector('span')?.textContent.trim() || link.textContent.trim();
        return label === section && !link.closest('.account-access-hidden');
    });
    const parentPortalSectionByCollection = {
        students: ['academic', 'module:academic:students'],
        attendance: ['operations', 'module:operations:attendance'],
        reportCards: ['academic', 'module:academic:reportcards'],
        assessments: ['elearning', 'module:elearning:assignments'],
        fees: ['finance', 'module:finance:fees'],
        notices: ['communication', 'module:communication:noticeboard']
    };
    const parentPortalSectionIsGranted = (collection, identity) => {
        const sectionAccess = parentPortalSectionByCollection[collection];
        if (!sectionAccess) return true;
        const sections = Array.isArray(identity?.sections)
            ? identity.sections
            : Array.isArray(activeAccountPermissions?.sections)
                ? activeAccountPermissions.sections
                : null;
        if (!sections) return true;
        const [department, module] = sectionAccess;
        const normalizedDepartment = value => String(value || '')
            .trim()
            .toLowerCase()
            .replace(/\s+department$/, '')
            .replace(/[^a-z0-9]+/g, '');
        return sections.some(grant => grant === module
            || grant === `department:${department}`
            || normalizedDepartment(grant) === department);
    };
    const canViewParentPortalSection = (collection, identity = window.schoolPortalData?.getIdentity?.()) => {
        const role = identity?.role || activeAccountPermissions?.role;
        return String(role || '').toLowerCase() !== 'parent'
            || parentPortalSectionIsGranted(collection, identity);
    };
    const canViewParentPortalCollection = (collection, identity = window.schoolPortalData?.getIdentity?.()) => {
        const role = identity?.role || activeAccountPermissions?.role;
        if (isPrivilegedRole(role)) return true;
        const permissions = identity?.permissions || activeAccountPermissions?.permissions || activeAccountPermissions?.perms || {};
        return permissions[collection]?.view === true && canViewParentPortalSection(collection, identity);
    };
    const updateDashboardActionAccess = () => {
        const identity = window.schoolPortalData?.getIdentity?.();
        const sidebarAccountControls = document.getElementById('parentSidebarAccountControls');
        const headerActions = document.querySelector('.top-actions');
        const actionTarget = document.querySelector('.topbar');
        const logoutButton = document.getElementById('logoutBtn');
        const isParentAccount = String(identity?.role || activeAccountPermissions?.role || '').toLowerCase() === 'parent';
        if (sidebarAccountControls) {
            sidebarAccountControls.hidden = !isParentAccount;
            if (isParentAccount && logoutButton) sidebarAccountControls.append(logoutButton);
            else if (logoutButton) document.getElementById('headerProfile')?.append(logoutButton);
        }
        if (headerActions && actionTarget && headerActions.parentElement !== actionTarget) actionTarget.append(headerActions);
        document.querySelectorAll('[data-dashboard-nav]').forEach(button => {
            button.hidden = !findDashboardNavLink(button.dataset.dashboardNav);
        });
        document.querySelectorAll('[data-dashboard-open]').forEach(button => {
            button.hidden = !findDashboardNavLink(button.dataset.dashboardOpen);
        });
        document.querySelectorAll('[data-parent-nav]').forEach(button => {
            const canView = canViewParentPortalCollection(button.dataset.parentCollection, identity);
            const isParentSidebarItem = Boolean(button.closest('.parent-sidebar-navigation'));
            const isParentAccount = String(identity?.role || activeAccountPermissions?.role || '').toLowerCase() === 'parent';
            const isParentPreview = document.documentElement.classList.contains('parent-portal-preview-active');
            button.hidden = isParentSidebarItem
                ? (!isParentAccount && !isParentPreview) || (!canView && !isParentPreview)
                : !canView;
            if (isParentSidebarItem && isParentPreview) {
                button.setAttribute('aria-disabled', String(!canView));
                button.classList.toggle('access-restricted', !canView);
                button.title = canView ? '' : 'Access not enabled by your school administrator';
            }
        });
        const parentSidebarNavigation = document.querySelector('.parent-sidebar-navigation');
        if (parentSidebarNavigation) {
            const hasVisibleParentSections = [...parentSidebarNavigation.querySelectorAll('[data-parent-home], [data-parent-nav]')]
                .some(button => !button.hidden);
            parentSidebarNavigation.hidden = !hasVisibleParentSections;
        }
        document.querySelectorAll('#parentPortalHome > .parent-portal-section').forEach(section => {
            const cards = [...section.querySelectorAll('.parent-portal-card[data-parent-collection]')];
            section.hidden = !cards.some(card => canViewParentPortalCollection(card.dataset.parentCollection, identity));
        });
        document.querySelectorAll('[data-parent-home]').forEach(button => {
            button.hidden = !['parent', 'schoolAdmin', 'superAdmin', 'director', 'headTeacher']
                .includes(identity?.role || '');
        });
    };
    updateDashboardActionAccess();
    document.addEventListener('click', event => {
        const detailBackButton = event.target.closest('[data-parent-detail-back]');
        if (detailBackButton) {
            activeParentPortalView = '';
            updateParentPortalNavActive(document.querySelector('.parent-sidebar-navigation [data-parent-home]'));
            renderParentPortalDashboard();
            return;
        }
        const homeButton = event.target.closest('[data-parent-home]');
        if (homeButton) {
            if (homeButton.closest('.parent-sidebar-navigation')) {
                event.preventDefault();
                if (window.matchMedia('(max-width: 768px)').matches) setMobileSidebarOpen(false);
            }
            activeParentPortalView = '';
            updateParentPortalNavActive(homeButton);
            const role = window.schoolPortalData?.getIdentity()?.role || activeAccountPermissions?.role;
            if (role === 'parent') document.getElementById('dashboardBtn')?.click();
            else if (isPrivilegedRole(role)) showParentPortalHome({ preview: true });
            return;
        }
        const actionButton = event.target.closest('[data-parent-nav]');
        if (!actionButton) return;
        if (actionButton.disabled || actionButton.getAttribute('aria-disabled') === 'true') return;
        const parentSidebarAction = actionButton.closest('.parent-sidebar-navigation');
        if (actionButton.closest('#parentPortalHome') || parentSidebarAction) {
            if (parentSidebarAction) {
                event.preventDefault();
                if (window.matchMedia('(max-width: 768px)').matches) setMobileSidebarOpen(false);
                const parentPortalHome = document.getElementById('parentPortalHome');
                const isParentPreview = parentPortalHome?.classList.contains('parent-portal-preview');
                hideAllContentAreas();
                parentPortalHome?.classList.remove('hidden');
                if (isParentPreview) document.documentElement.classList.add('parent-portal-preview-active');
            }
            activeParentPortalView = actionButton.dataset.parentNav;
            const activeButton = [...document.querySelectorAll('.parent-sidebar-navigation [data-parent-nav]')]
                .find(button => button.dataset.parentNav === activeParentPortalView);
            updateParentPortalNavActive(activeButton || actionButton);
            renderParentPortalDashboard();
            return;
        }
        const link = findDashboardNavLink(actionButton.dataset.parentNav);
        if (link) link.click();
    });
    document.addEventListener('click', event => {
        const actionButton = event.target.closest('[data-dashboard-nav]');
        if (!actionButton) return;
        const section = actionButton.dataset.dashboardNav;
        const link = findDashboardNavLink(section);
        if (!link) return;
        const addButton = document.getElementById('addStudentBtn');
        if (addButton) {
            addButton.dataset.section = section;
            addButton.click();
        } else {
            link.click();
        }
    });
    document.addEventListener('click', event => {
        const openButton = event.target.closest('[data-dashboard-open]');
        if (!openButton) return;
        findDashboardNavLink(openButton.dataset.dashboardOpen)?.click();
    });
    document.getElementById('dashboardExport')?.addEventListener('click', () => {
        const range = dashboardRange();
        if (range.invalid) {
            const status = document.getElementById('dashboardDataStatus');
            if (status) status.textContent = 'Choose a valid date range before exporting.';
            return;
        }
        if (!dashboardData.fees.loaded && !dashboardData.expenses.loaded) {
            const status = document.getElementById('dashboardDataStatus');
            if (status) status.textContent = 'No permitted fee or expense data is available to export.';
            return;
        }
        const periodLabel = dashboardPeriodLabel(range);
        const fees = dashboardData.fees.records;
        const expenses = dashboardData.expenses.records;
        const collectedInPeriod = fees.reduce((sum, fee) => {
            const date = fee.paymentDate ? parseDashboardDate(fee.paymentDate) : null;
            return dashboardDateInRange(date && !Number.isNaN(date.getTime()) ? date : null, range, true)
                ? sum + feePaidAmount(fee)
                : sum;
        }, 0);
        const outstanding = fees.reduce((sum, fee) => sum + feeOutstandingAmount(fee), 0);
        const periodBilledFees = fees.filter(fee => {
            const value = fee.dueDate || fee.paymentDate || fee.date;
            const date = value ? parseDashboardDate(value) : null;
            return dashboardDateInRange(date && !Number.isNaN(date.getTime()) ? date : null, range, true);
        });
        const billedInPeriod = periodBilledFees.reduce((sum, fee) => sum + feeBilledAmount(fee), 0);
        const collectedAgainstBilled = periodBilledFees.reduce((sum, fee) => sum + Math.min(feePaidAmount(fee), feeBilledAmount(fee)), 0);
        const expensesInPeriod = expenses.reduce((sum, expense) => {
            const date = expense.expenseDate ? parseDashboardDate(expense.expenseDate) : null;
            return dashboardDateInRange(date && !Number.isNaN(date.getTime()) ? date : null, range, true)
                ? sum + dashboardNumber(expense.amount)
                : sum;
        }, 0);
        const csvValue = value => {
            const text = String(value ?? '');
            const safeText = typeof value === 'string' && /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
            return `"${safeText.replace(/"/g, '""')}"`;
        };
        const rows = [
            ['School dashboard report', currentSchool?.schoolName || 'School'],
            ['Date range', periodLabel],
            ['Generated', new Date().toLocaleString()],
            [],
            ['Summary', 'Metric', 'Value'],
            ...(dashboardData.fees.loaded ? [['', 'Fees collected', collectedInPeriod], ['', 'Fee balance', outstanding], ['', 'Collection rate', billedInPeriod ? `${Math.round(collectedAgainstBilled / billedInPeriod * 100)}%` : 'Not available']] : []),
            ...(dashboardData.expenses.loaded ? [['', 'Expenses', expensesInPeriod]] : []),
            [],
            ['Type', 'Date', 'Name / Description', 'Class / Category', 'Amount', 'Status']
        ];
        if (dashboardData.fees.loaded) {
            fees.filter(fee => {
                const date = fee.paymentDate ? parseDashboardDate(fee.paymentDate) : null;
                return dashboardDateInRange(date && !Number.isNaN(date.getTime()) ? date : null, range, true);
            }).forEach(fee => rows.push([
                'Fee payment',
                dashboardDateLabel(fee.paymentDate),
                fee.studentName || fee.name || 'Student',
                fee.studentClass || fee.className || '',
                feePaidAmount(fee),
                fee.status || 'Received'
            ]));
        }
        if (dashboardData.expenses.loaded) {
            expenses.filter(expense => {
                const date = expense.expenseDate ? parseDashboardDate(expense.expenseDate) : null;
                return dashboardDateInRange(date && !Number.isNaN(date.getTime()) ? date : null, range, true);
            }).forEach(expense => rows.push([
                'Expense',
                dashboardDateLabel(expense.expenseDate),
                expense.description || expense.name || 'Expense',
                expense.category || '',
                dashboardNumber(expense.amount),
                expense.status || ''
            ]));
        }
        const csv = rows.map(row => row.map(csvValue).join(',')).join('\r\n');
        const downloadUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = `school-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.append(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    });
    document.getElementById('dashboardPrint')?.addEventListener('click', () => window.print());

    document.getElementById('dashboardCalendarPrev')?.addEventListener('click', () => {
        calendarViewMonth = new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth() - 1, 1);
        calendarSelectedDate = new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth(), 1);
        renderDashboardData();
    });
    document.getElementById('dashboardCalendarNext')?.addEventListener('click', () => {
        calendarViewMonth = new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth() + 1, 1);
        calendarSelectedDate = new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth(), 1);
        renderDashboardData();
    });
    document.getElementById('dashboardCalendarGrid')?.addEventListener('click', event => {
        const dateButton = event.target.closest('[data-calendar-date]');
        if (!dateButton) return;
        const selectedDate = parseDashboardDate(dateButton.dataset.calendarDate);
        if (Number.isNaN(selectedDate.getTime())) return;
        calendarSelectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        calendarViewMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        renderDashboardData();
    });

    document.getElementById('dashboardEarningsChart')?.addEventListener('click', event => {
        const monthButton = event.target.closest('[data-chart-month]');
        if (!monthButton) return;
        selectedChartMonth = Number(monthButton.dataset.chartMonth);
        if (!Number.isInteger(selectedChartMonth) || selectedChartMonth < 0 || selectedChartMonth > 11) return;
        renderDashboardData();
    });
    document.getElementById('dashboardChartMonths')?.addEventListener('click', event => {
        const monthButton = event.target.closest('[data-chart-month]');
        if (!monthButton) return;
        selectedChartMonth = Number(monthButton.dataset.chartMonth);
        if (!Number.isInteger(selectedChartMonth) || selectedChartMonth < 0 || selectedChartMonth > 11) return;
        renderDashboardData();
    });
    document.getElementById('dashboardChartPrevYear')?.addEventListener('click', () => {
        chartViewYear -= 1;
        selectedChartMonth = null;
        renderDashboardData();
    });
    document.getElementById('dashboardChartNextYear')?.addEventListener('click', () => {
        chartViewYear += 1;
        selectedChartMonth = null;
        renderDashboardData();
    });

    const chooseGender = gender => {
        selectedGender = selectedGender === gender ? null : gender;
        renderDashboardData();
    };
    document.querySelectorAll('[data-gender-select]').forEach(button => {
        button.addEventListener('click', () => chooseGender(button.dataset.genderSelect));
    });
    document.getElementById('dashboardGenderToggle')?.addEventListener('click', () => {
        chooseGender(selectedGender === 'male' ? 'female' : 'male');
    });

    const calendarMenu = document.getElementById('dashboardCalendarMenu');
    const calendarMenuToggle = document.getElementById('dashboardCalendarMenuToggle');
    const closeCalendarMenu = () => {
        calendarMenu?.classList.add('hidden');
        calendarMenuToggle?.setAttribute('aria-expanded', 'false');
    };
    calendarMenuToggle?.addEventListener('click', () => {
        const isOpen = calendarMenu?.classList.toggle('hidden') === false;
        calendarMenuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    document.getElementById('dashboardCalendarToday')?.addEventListener('click', () => {
        calendarSelectedDate = new Date(dashboardToday.getFullYear(), dashboardToday.getMonth(), dashboardToday.getDate());
        calendarViewMonth = new Date(dashboardToday.getFullYear(), dashboardToday.getMonth(), 1);
        closeCalendarMenu();
        renderDashboardData();
    });
    document.getElementById('dashboardCalendarNextEvent')?.addEventListener('click', () => {
        const nextEvent = dashboardData.calendarEvents.records.map(event => ({ event, date: dashboardDate(event) }))
            .filter(item => item.date && item.date >= new Date(dashboardToday.getFullYear(), dashboardToday.getMonth(), dashboardToday.getDate()))
            .sort((left, right) => left.date - right.date)[0];
        closeCalendarMenu();
        if (!nextEvent) {
            renderDashboardData();
            return;
        }
        calendarSelectedDate = new Date(nextEvent.date.getFullYear(), nextEvent.date.getMonth(), nextEvent.date.getDate());
        calendarViewMonth = new Date(nextEvent.date.getFullYear(), nextEvent.date.getMonth(), 1);
        renderDashboardData();
    });
    document.addEventListener('click', event => {
        if (!event.target.closest('.calendar-menu-wrap')) closeCalendarMenu();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeCalendarMenu();
    });

    async function startDashboardData(userData) {
        const api = window.schoolPortalData;
        const identity = api?.getIdentity();
        if (!api || !identity) return;
        const identityKey = `${identity.schoolId}:${identity.uid}`;
        subscribeToAccountNotifications(identity, identityKey);
        if (String(userData.role || '').toLowerCase() === 'parent') {
            if (dashboardIdentityKey === `${identityKey}:parent-portal`) return;
            dashboardSubscriptions.forEach(unsubscribe => unsubscribe());
            dashboardSubscriptions = [];
            dashboardIdentityKey = `${identityKey}:parent-portal`;
            parentPortalIdentityKey = identityKey;
            parentCertificatesExpanded = false;
            dashboardSubscribedCollections = new Set();
            dashboardLastUpdated = null;
            dashboardCollections.forEach(collection => {
                dashboardData[collection] = { loaded: false, records: [], error: false };
            });
            parentPortalCollections.forEach(collection => {
                parentPortalData[collection] = { loaded: false, records: [], error: false };
            });
            parentDashboardSummary = { loaded: false, records: null, error: false };
            const loadParentDashboardSummary = async () => {
                try {
                    if (typeof window.schoolPortalFirebase?.getParentPortalDashboardSummary !== 'function') {
                        throw new Error('Parent dashboard summary service is unavailable.');
                    }
                    const records = await window.schoolPortalFirebase.getParentPortalDashboardSummary(identity.schoolId);
                    if (dashboardIdentityKey !== `${identityKey}:parent-portal`) return;
                    parentDashboardSummary = { loaded: true, records, error: false };
                } catch (error) {
                    if (dashboardIdentityKey !== `${identityKey}:parent-portal`) return;
                    parentDashboardSummary = { loaded: false, records: null, error: true };
                    console.error('Unable to load linked-student parent dashboard summaries.', error);
                }
                renderParentPortalDashboard();
            };
            void loadParentDashboardSummary();
            const permissions = identity.permissions || userData.permissions || {};
            const permittedCollections = parentPortalCollections.filter(collection =>
                permissions[collection]?.view === true
            );
            const subscriptions = permittedCollections.map(async collection => {
                const unsubscribe = await api.subscribe(collection, records => {
                    parentPortalData[collection] = { loaded: true, records, error: false };
                    renderParentPortalDashboard();
                });
                if (dashboardIdentityKey === `${identityKey}:parent-portal`) {
                    dashboardSubscriptions.push(unsubscribe);
                } else {
                    unsubscribe();
                }
            });
            const results = await Promise.allSettled(subscriptions);
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    const collection = permittedCollections[index];
                    parentPortalData[collection] = { loaded: false, records: [], error: true };
                    console.error(`Unable to load parent portal ${collection} records.`, result.reason);
                }
            });
            renderParentPortalDashboard();
            return;
        }
        if (dashboardIdentityKey === identityKey && dashboardSubscriptions.length) return;
        dashboardSubscriptions.forEach(unsubscribe => unsubscribe());
        dashboardSubscriptions = [];
        dashboardIdentityKey = identityKey;
        dashboardLastUpdated = null;

        const adminRole = isPrivilegedRole(userData.role);
        const permissions = identity.permissions || userData.permissions || userData.perms || {};
        dashboardCollections.forEach(collection => {
            dashboardData[collection] = { loaded: false, records: [], error: false };
        });

        const permittedCollections = dashboardCollections
            .filter(collection => adminRole || permissions[collection]?.view === true);
        dashboardSubscribedCollections = new Set(permittedCollections);
        renderDashboardData();
        const subscriptions = permittedCollections.map(async collection => {
            const unsubscribe = await api.subscribe(collection, (records, metadata) => {
                dashboardData[collection] = { loaded: true, records, error: false };
                if (metadata?.source === 'cloud') dashboardLastUpdated = new Date();
                renderDashboardData();
            });
            if (dashboardIdentityKey === identityKey) {
                dashboardSubscriptions.push(unsubscribe);
            } else {
                unsubscribe();
            }
        });
        const results = await Promise.allSettled(subscriptions);
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                dashboardData[permittedCollections[index]] = { loaded: false, records: [], error: true };
                console.error(`Unable to load dashboard ${permittedCollections[index]} data.`, result.reason);
            }
        });
        renderDashboardData();
    }

    window.addEventListener('school-portal-sync-error', event => {
        const collection = event.detail?.collection;
        if (parentPortalIdentityKey && parentPortalCollections.includes(collection)) {
            parentPortalData[collection] = { ...parentPortalData[collection], error: true };
            renderParentPortalDashboard();
        }
        if (!navigator.onLine || !dashboardCollections.includes(collection)) return;
        dashboardData[collection] = { loaded: false, records: [], error: true };
        renderDashboardData();
    });
    window.addEventListener('school-portal-sync-update', () => {
        dashboardLastUpdated = new Date();
        renderDashboardData();
    });
    window.addEventListener('online', renderDashboardData);
    window.addEventListener('offline', renderDashboardData);
    window.addEventListener('school-portal-sync-status', renderDashboardData);

    window.addEventListener('school-portal-identity-cleared', () => {
        document.documentElement.classList.remove('parent-portal-active');
        dashboardSubscriptions.forEach(unsubscribe => unsubscribe());
        dashboardSubscriptions = [];
        notificationUnsubscribe?.();
        notificationUnsubscribe = null;
        notificationIdentityKey = '';
        notificationItems = [];
        notificationStatus = 'Sign in to view notifications.';
        notificationError = false;
        renderNotificationUi();
        dashboardIdentityKey = '';
        parentPortalIdentityKey = '';
        parentCertificatesExpanded = false;
        dashboardSubscribedCollections = new Set();
        dashboardLastUpdated = null;
        dashboardCollections.forEach(collection => {
            dashboardData[collection] = { loaded: false, records: [], error: false };
        });
        parentPortalCollections.forEach(collection => {
            parentPortalData[collection] = { loaded: false, records: [], error: false };
        });
        parentDashboardSummary = { loaded: false, records: null, error: false };
        renderDashboardData();
        renderParentPortalDashboard();
    });

    const sidebarSearchInput = document.querySelector('.topbar-search input');
    const sidebarSearchEmpty = document.createElement('p');
    sidebarSearchEmpty.className = 'sidebar-search-empty hidden';
    sidebarSearchEmpty.setAttribute('role', 'status');
    sidebarSearchEmpty.textContent = 'No matching navigation items.';
    const sidebarElement = document.getElementById('appSidebar');
    const firstSidebarHeading = sidebarElement?.querySelector('.menu-title');
    if (firstSidebarHeading) firstSidebarHeading.before(sidebarSearchEmpty);
    const updateNavigationSearch = () => {
        const query = sidebarSearchInput?.value.trim().toLocaleLowerCase() || '';
        let visibleCount = 0;
        document.querySelectorAll('.sidebar > .nav-links').forEach(group => {
            const heading = group.previousElementSibling;
            let groupVisibleCount = 0;
            group.querySelectorAll(':scope > li').forEach(item => {
                const link = item.querySelector('a');
                const accessHidden = item.hidden
                    || item.classList.contains('hidden')
                    || item.classList.contains('account-access-hidden')
                    || group.classList.contains('account-access-hidden')
                    || heading?.classList.contains('account-access-hidden');
                const label = link?.textContent.trim().toLocaleLowerCase() || '';
                const visible = !accessHidden && (!query || label.includes(query));
                item.classList.toggle('nav-search-hidden', !visible);
                if (visible) {
                    groupVisibleCount += 1;
                    visibleCount += 1;
                }
            });
            const hideGroup = Boolean(query) && groupVisibleCount === 0;
            group.classList.toggle('nav-search-group-hidden', hideGroup);
            heading?.classList.toggle('nav-search-group-hidden', hideGroup);
        });
        sidebarSearchEmpty.classList.toggle('hidden', !query || visibleCount > 0);
    };
    updateNavigationSearch();
    sidebarSearchInput?.addEventListener('input', updateNavigationSearch);
    document.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            sidebarSearchInput?.focus();
            sidebarSearchInput?.select();
        } else if (event.key === 'Escape' && document.activeElement === sidebarSearchInput) {
            if (sidebarSearchInput.value) {
                sidebarSearchInput.value = '';
                updateNavigationSearch();
            } else {
                sidebarSearchInput.blur();
            }
        }
    });

    const normalizeSectionKey = value => String(value || '')
            .trim()
            .toLowerCase()
            .replace(/\s+department$/, '')
            .replace(/[^a-z0-9]+/g, '');
    const sectionDepartmentKey = title =>
        `department:${normalizeSectionKey(title.dataset.accessSection || title.innerText.trim())}`;
    const sectionModuleKey = (title, link) => {
        const label = link.querySelector('.menu-item-label, span:not(.menu-item-icon)')?.textContent || link.textContent;
        return `module:${normalizeSectionKey(title.dataset.accessSection || title.innerText.trim())}:${normalizeSectionKey(link.dataset.menuId || label)}`;
    };
    const parentRecommendedSectionGrants = [
        'module:academic:students',
        'module:academic:reportcards',
        'module:operations:attendance',
        'module:elearning:assignments',
        'module:communication:noticeboard',
        'module:finance:fees'
    ];
    const sectionGrantSet = userData => {
        const sections = Array.isArray(userData.sections) ? userData.sections : [];
        if (Array.isArray(userData.sections) || String(userData.role || '').toLowerCase() !== 'parent') return new Set(sections);
        return new Set(parentRecommendedSectionGrants);
    };
    const isSectionGranted = (grants, title, link = null) => {
        const departmentKey = sectionDepartmentKey(title);
        const legacyDepartmentGrant = [...grants].some(grant => normalizeSectionKey(grant) === normalizeSectionKey(title.dataset.accessSection || title.innerText.trim()));
        return grants.has(departmentKey)
            || legacyDepartmentGrant
            || Boolean(link && grants.has(sectionModuleKey(title, link)));
    };

    function applyAccountSectionAccess(userData) {
        activeAccountPermissions = userData;
        const grants = sectionGrantSet(userData);
        const unrestrictedRole = isPrivilegedRole(userData.role);
        const canView = unrestrictedRole || userData.perms?.view !== false;
        const isParentAccount = String(userData.role || '').toLowerCase() === 'parent';
        document.documentElement.classList.toggle('parent-portal-active', isParentAccount);
        const dashboardLink = document.getElementById('dashboardBtn');
        const dashboardHeading = dashboardLink?.closest('.nav-links')?.previousElementSibling;
        if (dashboardLink && dashboardHeading) {
            dashboardHeading.dataset.defaultLabel ||= Array.from(dashboardHeading.childNodes)
                .find(node => node.nodeType === Node.TEXT_NODE)?.textContent.trim() || 'Main';
            dashboardLink.dataset.defaultLabel ||= dashboardLink.querySelector('span')?.textContent.trim() || 'Dashboard';
            const headingText = Array.from(dashboardHeading.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
            if (headingText) headingText.textContent = ` ${isParentAccount ? 'Parent Portal' : dashboardHeading.dataset.defaultLabel}`;
            const dashboardLabel = dashboardLink.querySelector('span');
            if (dashboardLabel) dashboardLabel.textContent = isParentAccount ? 'Home' : dashboardLink.dataset.defaultLabel;
        }
        document.querySelectorAll('.sidebar > .menu-title').forEach(title => {
            const group = title.nextElementSibling;
            if (!group?.classList.contains('nav-links')) return;
            const departmentAllowed = unrestrictedRole || grants.has(sectionDepartmentKey(title))
                || [...grants].some(grant => normalizeSectionKey(grant) === normalizeSectionKey(title.dataset.accessSection || title.innerText.trim()));
            let visibleLinks = 0;
            group.querySelectorAll(':scope > li').forEach(item => {
                const link = item.querySelector('a');
                if (!link) return;
                const isParentHomeLink = String(userData.role || '').toLowerCase() === 'parent'
                    && link.id === 'dashboardBtn';
                const adminOnlyPortalLink = link.dataset.portalAdminOnly === 'true' && unrestrictedRole;
                const canShow = canView && (isParentHomeLink || adminOnlyPortalLink
                    || (link.dataset.portalAdminOnly !== 'true'
                        && (unrestrictedRole || departmentAllowed || isSectionGranted(grants, title, link))));
                item.classList.toggle('account-access-hidden', !canShow);
                if (canShow) visibleLinks += 1;
            });
            const canShowGroup = canView && (unrestrictedRole || visibleLinks > 0);
            title.classList.toggle('account-access-hidden', !canShowGroup);
            group.classList.toggle('account-access-hidden', !canShowGroup);
        });
        updateNavigationSearch();
        updateDashboardActionAccess();
    }

    const collectionForNavigationLabel = new Map([
        ['students', 'students'], ['children', 'students'], ['teachers', 'teachers'], ['staff directory', 'staffDirectory'],
        ['curriculum', 'curriculum'], ['streams', 'streams'], ['subjects', 'subjects'], ['timetables', 'timetables'],
        ['assignments', 'assessments'], ['study materials', 'studyMaterials'], ['online quizzes', 'quizzes'],
        ['attendance', 'attendance'], ['health/infirmary', 'healthRecords'], ['boarding', 'boardingRecords'],
        ['transport', 'transportRoutes'], ['inventory', 'inventory'], ['discipline case', 'disciplineCases'],
        ['clubs & societies', 'clubs'], ['sports & activities', 'sportsActivities'], ['counseling', 'counseling'],
        ['report cards', 'reportCards'], ['analytics', 'learningAnalytics'], ['certificates', 'certificates'],
        ['staff attendance', 'staffAttendance'], ['leave management', 'leaveRequests'], ['recruitment', 'recruitment'],
        ['run payroll', 'payroll'], ['pay slips', 'paySlips'], ['statutory returns', 'statutoryReturns'],
        ['payroll reports', 'payrollReports'], ['fees', 'fees'], ['expenses', 'expenses'],
        ['closed pos', 'purchaseOrders'], ['fee invoices', 'feeInvoices'], ['purchase request', 'purchaseRequests'],
        ['quotations', 'quotations'], ['purchase comparisons', 'purchaseComparisons'], ['purchase orders', 'purchaseOrders'],
        ['goods receipt', 'goodsReceipts'], ['supplier invoices', 'supplierInvoices'], ['suppliers', 'suppliers'],
        ['fixed assets', 'assets'], ['maintenance', 'maintenanceWorkOrders'], ['visitor logs', 'visitorLogs'],
        ['parents', 'parents'], ['sms alerts', 'smsAlerts'], ['notice board', 'notices'], ['notices', 'notices'],
        ['enquiries', 'enquiries'], ['visitors', 'visitors'], ['appointments', 'appointments'],
        ['call logs', 'callLogs'], ['documents', 'schoolDocuments'], ['user roles', 'members'],
        ['audit logs', 'auditEvents'], ['library', 'libraryBooks'], ['library books', 'libraryBooks'],
        ['library loans', 'libraryLoans']
    ]);
    const mutationActionPattern = /\b(add|new|create|edit|delete|remove|save|submit|update|send|issue|record|mark|approve|reject|pay|post|invite|upload|import)\b/i;
    let activeNavigationCollection = '';
    const updateVisibleModuleActions = () => {
        const role = activeAccountPermissions?.role;
        const unrestrictedRole = isPrivilegedRole(role);
        const canEdit = unrestrictedRole || activeAccountPermissions?.permissions?.[activeNavigationCollection]?.edit === true
            || activeAccountPermissions?.perms?.edit === true;
        document.querySelectorAll('.main button, #addStudentBtn').forEach(button => {
            const label = [
                button.textContent,
                button.getAttribute('aria-label'),
                button.getAttribute('title'),
                button.dataset.action
            ].filter(Boolean).join(' ');
            button.classList.toggle('account-action-hidden',
                Boolean(role && !canEdit && mutationActionPattern.test(label)));
        });
    };
    const navigationActionObserver = new MutationObserver(updateVisibleModuleActions);
    navigationActionObserver.observe(document.querySelector('.main') || document.body, { childList: true, subtree: true });
    document.addEventListener('click', event => {
        const restrictedAction = event.target.closest('.account-action-hidden');
        if (restrictedAction) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }, true);

    const mobileNavPresets = {
        student: [
            ['Dashboard', 'Home', 'fa-house'],
            ['Timetables', 'Timetable', 'fa-calendar-days'],
            ['Assignments', 'Assignments', 'fa-book-open'],
            ['Report Cards', 'Results', 'fa-square-poll-vertical'],
        ],
        teacher: [
            ['Dashboard', 'Home', 'fa-house'],
            ['Students', 'Students', 'fa-user-graduate'],
            ['Attendance', 'Attendance', 'fa-calendar-check'],
            ['Assignments', 'Assignments', 'fa-book-open']
        ],
        default: [
            ['Dashboard', 'Home', 'fa-house'],
            ['Students', 'Students', 'fa-user-graduate'],
            ['Attendance', 'Attendance', 'fa-calendar-check'],
            ['Report Cards', 'Results', 'fa-square-poll-vertical']
        ]
    };

    function updateMobileRoleNavActive(activeLink) {
        const nav = document.getElementById('mobileRoleNav');
        const activeKey = activeLink
            ? `${activeLink.id || activeLink.dataset.menuId || ''}::${activeLink.innerText.trim().toLowerCase()}`
            : '';
        nav?.querySelectorAll('[data-mobile-nav-key]').forEach(button => {
            const active = button.dataset.mobileNavKey === activeKey;
            button.classList.toggle('active', active);
            if (active) button.setAttribute('aria-current', 'page');
            else button.removeAttribute('aria-current');
        });
        const parentHomeActive = activeLink?.id === 'dashboardBtn'
            && String(activeAccountPermissions?.role || '').toLowerCase() === 'parent'
            || activeLink?.id === 'parentPortalPreviewBtn';
        const activeParentNav = parentHomeActive
            ? document.querySelector('.parent-sidebar-navigation [data-parent-home]')
            : [...document.querySelectorAll('.parent-sidebar-navigation [data-parent-nav]')].find(button =>
                activeLink && button.dataset.parentNav.toLowerCase()
                    === (activeLink.querySelector('span')?.textContent.trim() || activeLink.textContent.trim()).toLowerCase()
            );
        updateParentPortalNavActive(activeParentNav);
    }

    function updateParentPortalNavActive(activeButton) {
        document.querySelectorAll('.parent-sidebar-navigation [data-parent-home], .parent-sidebar-navigation [data-parent-nav]').forEach(button => {
            const active = button === activeButton;
            button.classList.toggle('active', active);
            if (active) button.setAttribute('aria-current', 'page');
            else button.removeAttribute('aria-current');
        });
        if (activeButton?.hasAttribute('data-parent-home')) {
            const dashboardLink = document.getElementById('dashboardBtn');
            dashboardLink?.classList.add('active');
            dashboardLink?.setAttribute('aria-current', 'page');
        } else if (activeButton?.dataset.parentNav) {
            const dashboardLink = document.getElementById('dashboardBtn');
            dashboardLink?.classList.remove('active');
            dashboardLink?.removeAttribute('aria-current');
        } else if (activeParentPortalView === 'Documents') {
            const dashboardLink = document.getElementById('dashboardBtn');
            dashboardLink?.classList.remove('active');
            dashboardLink?.removeAttribute('aria-current');
        }
        const activeKey = activeParentPortalView === 'Documents'
            ? 'Documents'
            : activeButton?.dataset.parentNav || (activeButton?.hasAttribute('data-parent-home') ? 'Home' : '');
        document.querySelectorAll('#mobileRoleNav [data-mobile-parent-nav]').forEach(button => {
                const active = button.dataset.mobileParentNav === activeKey;
                button.classList.toggle('active', active);
                if (active) button.setAttribute('aria-current', 'page');
                else button.removeAttribute('aria-current');
        });
    }

    function openParentDocuments() {
        const parentPortalHome = document.getElementById('parentPortalHome');
        if (!parentPortalHome) return;
        const isPreview = parentPortalHome.classList.contains('parent-portal-preview');
        activeParentPortalView = 'Documents';
        parentCertificatesExpanded = true;
        hideAllContentAreas();
        parentPortalHome.classList.remove('hidden');
        document.documentElement.classList.toggle('parent-portal-preview-active', isPreview);
        updateParentPortalNavActive(null);
        renderParentPortalDashboard();
        setApplicationPage('Parent Documents');
    }

    function renderMobileRoleNav(userData) {
        const nav = document.getElementById('mobileRoleNav');
        if (!nav) return;
        const role = String(userData.role || '').toLowerCase().replace(/[\s_-]+/g, '');
        if (role.includes('parent')) {
                const parentActions = [
                    { label: 'Home', icon: 'fa-house', source: document.querySelector('.parent-sidebar-navigation [data-parent-home]') },
                    { label: 'Documents', icon: 'fa-folder', source: null },
                    { label: 'Notifications', icon: 'fa-bell', source: document.getElementById('enablePushNotifications') },
                    { label: 'Profile', icon: 'fa-user-circle', source: document.getElementById('headerProfile') }
                ];
                nav.replaceChildren();
                nav.classList.add('mobile-role-nav-parent', 'mobile-role-nav-actions');
                parentActions.forEach(({ label, icon, source }) => {
                    if (!source && label !== 'Documents') return;
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'mobile-role-nav-item';
                    button.setAttribute('aria-label', label);
                    button.innerHTML = `<i class="fas ${icon}" aria-hidden="true"></i>`;
                    if (label === 'Documents') {
                        button.dataset.mobileParentNav = 'Documents';
                        const count = document.createElement('small');
                        count.className = 'mobile-role-nav-count';
                        count.dataset.mobileDocumentsCount = '';
                        count.textContent = '0';
                        button.append(count);
                    } else if (label === 'Home') {
                        button.dataset.mobileParentNav = 'Home';
                    } else if (label === 'Notifications') {
                        button.dataset.mobileNotifications = '';
                        button.setAttribute('aria-haspopup', 'dialog');
                        button.setAttribute('aria-controls', 'notificationPanel');
                        button.setAttribute('aria-expanded', 'false');
                        const count = document.createElement('small');
                        count.className = 'mobile-role-nav-count';
                        count.dataset.mobileNotificationCount = '';
                        count.hidden = true;
                        button.append(count);
                    }
                    const text = document.createElement('span');
                    text.textContent = label;
                    button.append(text);
                    button.addEventListener('click', () => {
                        if (label === 'Documents') openParentDocuments();
                        else if (label === 'Notifications') toggleNotificationPanel();
                        else source.click();
                    });
                    nav.append(button);
                });
                nav.hidden = nav.childElementCount === 0;
                return;
        }
        nav.classList.remove('mobile-role-nav-parent');
        nav.classList.remove('mobile-role-nav-actions');
        const preset = role.includes('student') ? mobileNavPresets.student
                : role.includes('teacher') ? mobileNavPresets.teacher
                    : mobileNavPresets.default;
        const sidebarLinks = [...document.querySelectorAll('.nav-links a:not(.parent-sidebar-link)')];
        const visibleLinkFor = label => sidebarLinks.find(link => {
                const linkLabel = (link.querySelector('.menu-item-label, span:not(.menu-item-icon)')?.textContent || link.textContent).trim();
                return linkLabel.toLowerCase() === label.toLowerCase()
                && !link.closest('.account-access-hidden')
                && !link.closest('[hidden]')
                && !link.closest('.nav-links')?.classList.contains('account-access-hidden');
        });
        const items = preset.map(([target, label, icon]) => {
            const link = target === 'Dashboard'
                ? sidebarLinks.find(item => (item.id === 'dashboardBtn' || item.dataset.menuId === 'dashboard')
                    && !item.closest('.account-access-hidden')
                    && !item.closest('[hidden]')
                    && !item.closest('.nav-links')?.classList.contains('account-access-hidden'))
                : visibleLinkFor(target);
            return link ? { link, label, icon } : null;
        }).filter(Boolean);
        if (!items.length) {
            nav.replaceChildren();
            nav.hidden = true;
            return;
        }

        nav.replaceChildren();
        items.forEach(({ link, label, icon }) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'mobile-role-nav-item';
            button.dataset.mobileNavKey = `${link.id || link.dataset.menuId || ''}::${link.innerText.trim().toLowerCase()}`;
            button.setAttribute('aria-label', label);
            button.innerHTML = `<i class="fas ${icon}" aria-hidden="true"></i><span>${label}</span>`;
            button.addEventListener('click', () => {
                link.click();
                updateMobileRoleNavActive(link);
            });
            nav.append(button);
        });

        if (!role.includes('parent')) {
            const more = document.createElement('button');
            more.type = 'button';
            more.className = 'mobile-role-nav-item';
            more.innerHTML = '<i class="fas fa-ellipsis" aria-hidden="true"></i><span>More</span>';
            more.setAttribute('aria-label', 'Open all sections');
            more.addEventListener('click', () => setMobileSidebarOpen(true));
            nav.append(more);
        }
        nav.hidden = false;
        updateMobileRoleNavActive(sidebarLinks.find(link => link.classList.contains('active')));
    }

    function notificationPreferenceKey(identity) {
        return `schoolPushEnabled:${encodeURIComponent(identity.schoolId)}:${encodeURIComponent(identity.uid)}`;
    }

    function notificationPermissionMessage(error) {
        if (error?.code === 'permission-denied') {
            return 'Notification access is blocked by Firestore Rules. Ask your administrator to deploy the updated Firestore rules.';
        }
        return 'Notifications could not be loaded. Check your connection or contact your school administrator.';
    }

    function renderNotificationUi() {
        const session = loadSession();
        const unreadCount = notificationItems.filter(item => item.read !== true).length;
        document.querySelectorAll('[data-notification-count]').forEach(badge => {
            badge.hidden = unreadCount === 0;
            badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
            badge.setAttribute('aria-label', `${unreadCount} unread notifications`);
        });
        document.querySelectorAll('[data-mobile-notification-count]').forEach(badge => {
            badge.hidden = unreadCount === 0;
            badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
        });

        const status = document.querySelector('[data-notification-status]');
        const list = document.querySelector('[data-notification-list]');
        const markAll = document.querySelector('[data-notification-mark-all]');
        if (status) {
            status.textContent = notificationStatus || (unreadCount
                ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                : 'You are all caught up.');
        }
        if (markAll) markAll.disabled = unreadCount === 0 || notificationError;
        if (list) {
            list.replaceChildren();
            if (notificationError) {
                const message = document.createElement('li');
                message.className = 'notification-error';
                message.textContent = notificationStatus || 'Notifications could not be loaded.';
                list.append(message);
            } else if (!notificationItems.length) {
                const message = document.createElement('li');
                message.className = 'notification-empty';
                message.textContent = notificationStatus || 'No notifications yet.';
                list.append(message);
            } else {
                notificationItems.forEach(item => {
                    const row = document.createElement('li');
                    row.className = `notification-list-item${item.read === true ? '' : ' unread'}`;
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'notification-item-button';
                    const title = document.createElement('span');
                    title.className = 'notification-item-title';
                    title.textContent = String(item.title || 'School update');
                    const body = document.createElement('span');
                    body.className = 'notification-item-body';
                    body.textContent = String(item.body || '');
                    button.append(title, body);
                    if (item.createdAt) {
                        const time = document.createElement('time');
                        time.className = 'notification-item-time';
                        const date = new Date(item.createdAt);
                        if (!Number.isNaN(date.getTime())) {
                            time.dateTime = date.toISOString();
                            time.textContent = date.toLocaleString();
                        }
                        if (time.textContent) button.append(time);
                    }
                    button.addEventListener('click', () => openNotification(item));
                    row.append(button);
                    list.append(row);
                });
            }
        }

        const pushStatus = document.querySelector('[data-push-status]');
        const pushToggle = document.querySelector('[data-notification-push-toggle]');
        const pushEnabled = session?.schoolId && session?.userId
            && localStorage.getItem(notificationPreferenceKey({ schoolId: session.schoolId, uid: session.userId })) === 'true';
        if (pushStatus) pushStatus.textContent = pushEnabled
            ? 'Push notifications are enabled on this device.'
            : 'Push notifications are off on this device.';
        if (pushToggle) pushToggle.textContent = pushEnabled ? 'Disable push' : 'Enable push';
    }

    function subscribeToAccountNotifications(identity, identityKey) {
        if (notificationIdentityKey === identityKey) return;
        notificationUnsubscribe?.();
        notificationUnsubscribe = null;
        notificationIdentityKey = identityKey;
        notificationItems = [];
        notificationStatus = 'Loading notifications…';
        notificationError = false;
        renderNotificationUi();
        void waitForFirebase().then(firebase => {
            if (notificationIdentityKey !== identityKey) return;
            notificationUnsubscribe = firebase.subscribeToNotifications(identity.schoolId, items => {
                if (notificationIdentityKey !== identityKey) return;
                notificationItems = items;
                notificationStatus = '';
                notificationError = false;
                renderNotificationUi();
            }, error => {
                if (notificationIdentityKey !== identityKey) return;
                notificationStatus = notificationPermissionMessage(error);
                notificationError = true;
                console.error('Unable to load the notification inbox.', error);
                renderNotificationUi();
            });
        }).catch(error => {
            if (notificationIdentityKey !== identityKey) return;
            notificationStatus = notificationPermissionMessage(error);
            notificationError = true;
            console.error('Unable to start the notification inbox.', error);
            renderNotificationUi();
        });
    }

    async function openNotification(item) {
        const identity = window.schoolPortalData?.getIdentity();
        if (!identity) return;
        if (item.read !== true) {
            try {
                await getFirebase().markNotificationsRead(identity.schoolId, [item.id]);
            } catch (error) {
                notificationStatus = 'This notification could not be marked as read.';
                console.error('Unable to mark a notification as read.', error);
                renderNotificationUi();
            }
        }
        document.getElementById('notificationPanel')?.classList.add('hidden');
        document.querySelectorAll('#enablePushNotifications, [data-mobile-notifications]').forEach(button =>
            button.setAttribute('aria-expanded', 'false')
        );
        const route = String(item.route || '');
        if (route === 'Documents' && String(identity.role || '').toLowerCase() === 'parent') {
            openParentDocuments();
            return;
        }
        if (String(identity.role || '').toLowerCase() === 'parent') {
            const parentLink = [...document.querySelectorAll('.parent-sidebar-navigation [data-parent-nav]')]
                .find(link => link.dataset.parentNav === route);
            if (parentLink) {
                parentLink.click();
                return;
            }
        }
        const routeLink = [...document.querySelectorAll('.nav-links a')].find(link => {
            const label = (link.querySelector('.menu-item-label, span:not(.menu-item-icon)')?.textContent || link.textContent).trim();
            return label.toLowerCase() === route.toLowerCase()
                && !link.closest('.account-access-hidden')
                && !link.closest('[hidden]');
        });
        routeLink?.click();
    }

    function handleNotificationRoute() {
        const url = new URL(window.location.href);
        const destination = url.searchParams.get('openSection');
        if (!destination) return;
        window.setTimeout(() => {
            const link = [...document.querySelectorAll('.nav-links a')].find(item => {
                const label = (item.querySelector('.menu-item-label, span:not(.menu-item-icon)')?.textContent || item.textContent).trim();
                return label === destination && !item.closest('.account-access-hidden') && !item.closest('[hidden]');
            });
            if (link) link.click();
            url.searchParams.delete('openSection');
            window.history.replaceState({}, '', url);
        }, 0);
    }

    const pushNotificationsButton = document.getElementById('enablePushNotifications');
    const notificationPanel = document.getElementById('notificationPanel');
    function toggleNotificationPanel() {
        const isOpen = !notificationPanel?.classList.contains('hidden');
        notificationPanel?.classList.toggle('hidden', isOpen);
        document.querySelectorAll('#enablePushNotifications, [data-mobile-notifications]').forEach(button =>
            button.setAttribute('aria-expanded', String(!isOpen))
        );
        renderNotificationUi();
    }
    pushNotificationsButton?.addEventListener('click', toggleNotificationPanel);
    document.addEventListener('click', event => {
        if (!event.target.closest('.notification-menu')
            && !event.target.closest('[data-mobile-notifications]')
            && !event.target.closest('#notificationPanel')) {
            notificationPanel?.classList.add('hidden');
            document.querySelectorAll('#enablePushNotifications, [data-mobile-notifications]').forEach(button =>
                button.setAttribute('aria-expanded', 'false')
            );
        }
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !notificationPanel?.classList.contains('hidden')) {
            notificationPanel.classList.add('hidden');
            document.querySelectorAll('#enablePushNotifications, [data-mobile-notifications]').forEach(button =>
                button.setAttribute('aria-expanded', 'false')
            );
            (document.querySelector('[data-mobile-notifications]') || pushNotificationsButton)?.focus();
        }
    });

    document.querySelector('[data-notification-mark-all]')?.addEventListener('click', async event => {
        const identity = window.schoolPortalData?.getIdentity();
        const unread = notificationItems.filter(item => item.read !== true).map(item => item.id);
        if (!identity || !unread.length) return;
        const markAllButton = event.currentTarget;
        markAllButton.disabled = true;
        try {
            await getFirebase().markNotificationsRead(identity.schoolId, unread);
        } catch (error) {
            notificationStatus = 'Notifications could not be marked as read. Please try again.';
            console.error('Unable to mark notifications as read.', error);
            renderNotificationUi();
        } finally {
            markAllButton.disabled = false;
        }
    });

    document.querySelector('[data-notification-push-toggle]')?.addEventListener('click', async event => {
        const session = loadSession();
        if (!session?.schoolId || !session?.userId) return;
        const preferenceKey = notificationPreferenceKey({ schoolId: session.schoolId, uid: session.userId });
        const enabled = localStorage.getItem(preferenceKey) === 'true';
        const pushToggle = event.currentTarget;
        pushToggle.disabled = true;
        try {
            const firebase = await waitForFirebase();
            if (enabled) {
                await firebase.disablePushNotifications(session.schoolId);
                localStorage.removeItem(preferenceKey);
                notificationStatus = '';
            } else {
                await firebase.enablePushNotifications(session.schoolId);
                localStorage.setItem(preferenceKey, 'true');
                notificationStatus = '';
            }
            renderNotificationUi();
        } catch (error) {
            const pushStatus = document.querySelector('[data-push-status]');
            if (pushStatus) pushStatus.textContent = error.message || 'Unable to update push notification settings.';
            console.error('Unable to update push notification settings.', error);
        } finally {
            pushToggle.disabled = false;
        }
    });
    renderNotificationUi();

    window.addEventListener('school-portal-push-message', event => {
        const detail = event.detail || {};
        const toast = document.createElement('div');
        toast.className = 'push-message-toast';
        toast.setAttribute('role', 'status');
        toast.textContent = [detail.title, detail.body].filter(Boolean).join(': ');
        document.body.append(toast);
        window.setTimeout(() => toast.remove(), 7000);
    });

    const passwordChangeModal = document.getElementById('passwordChangeModal');
    const passwordChangeForm = document.getElementById('passwordChangeForm');
    const passwordDialogTitle = document.getElementById('passwordDialogTitle');
    const passwordDialogDescription = document.getElementById('passwordDialogDescription');
    const passwordChangeError = document.getElementById('passwordChangeError');
    const currentPasswordField = document.getElementById('currentPasswordField');
    const currentAccountPassword = document.getElementById('currentAccountPassword');
    const newAccountPassword = document.getElementById('newAccountPassword');
    const confirmAccountPassword = document.getElementById('confirmAccountPassword');
    const cancelPasswordChange = document.getElementById('cancelPasswordChange');
    let pendingPasswordChange = null;

    const openPasswordChangeDialog = (mode, userData = null, uid = '') => {
        const requiresCurrentPassword = mode !== 'admin-reset';
        const isRequiredChange = mode === 'first-login';
        pendingPasswordChange = {
            mode,
            userData,
            uid,
            schoolId: loadSession()?.schoolId
        };
        passwordDialogTitle.textContent = mode === 'admin-reset'
            ? 'Set a temporary password'
            : isRequiredChange ? 'Change your temporary password' : 'Change password';
        passwordDialogDescription.textContent = mode === 'admin-reset'
            ? 'The user must change this password the next time they sign in.'
            : isRequiredChange
                ? 'Your administrator set a temporary password. Choose a new password to continue.'
                : 'Enter your current password and choose a new one.';
        currentPasswordField.hidden = !requiresCurrentPassword;
        currentAccountPassword.required = requiresCurrentPassword;
        cancelPasswordChange.hidden = isRequiredChange;
        passwordChangeError.textContent = '';
        passwordChangeForm.reset();
        passwordChangeModal.classList.remove('hidden');
        window.setTimeout(() => (requiresCurrentPassword ? currentAccountPassword : newAccountPassword).focus(), 0);
    };

    const closePasswordChangeDialog = () => {
        if (pendingPasswordChange?.mode === 'first-login') return;
        passwordChangeModal.classList.add('hidden');
        passwordChangeForm.reset();
        passwordChangeError.textContent = '';
        pendingPasswordChange = null;
    };

    cancelPasswordChange?.addEventListener('click', closePasswordChangeDialog);
    document.getElementById('profileChangePasswordButton')?.addEventListener('click', () => {
        if (!loadSession()?.authenticated) return;
        document.getElementById('profileModal')?.classList.remove('active');
        openPasswordChangeDialog('self');
    });
    document.getElementById('profileLogoutButton')?.addEventListener('click', () => {
        document.getElementById('profileModal')?.classList.remove('active');
        document.getElementById('logoutBtn')?.click();
    });

    passwordChangeForm?.addEventListener('submit', async event => {
        event.preventDefault();
        if (!pendingPasswordChange) return;
        const newPassword = newAccountPassword.value;
        if (newPassword.length < 8
            || !/[a-z]/.test(newPassword)
            || !/[A-Z]/.test(newPassword)
            || !/[0-9]/.test(newPassword)
            || !/[^A-Za-z0-9]/.test(newPassword)) {
            passwordChangeError.textContent = 'Use at least 8 characters, including uppercase, lowercase, a number, and a symbol.';
            return;
        }
        if (newPassword !== confirmAccountPassword.value) {
            passwordChangeError.textContent = 'The new passwords do not match.';
            return;
        }
        if (pendingPasswordChange.mode !== 'admin-reset'
            && newPassword === currentAccountPassword.value) {
            passwordChangeError.textContent = 'Choose a password different from your current password.';
            return;
        }

        const submitButton = passwordChangeForm.querySelector('[type="submit"]');
        submitButton.disabled = true;
        passwordChangeError.textContent = '';
        try {
            const firebase = getFirebase();
            if (pendingPasswordChange.mode === 'admin-reset') {
                await firebase.setSchoolUserTemporaryPassword({
                    schoolId: pendingPasswordChange.schoolId,
                    uid: pendingPasswordChange.uid,
                    temporaryPassword: newPassword
                });
                closePasswordChangeDialog();
                alert('Temporary password set. Share it privately; the user must change it at their next sign-in.');
                return;
            }

            await firebase.changeOwnPassword(
                pendingPasswordChange.schoolId,
                currentAccountPassword.value,
                newPassword
            );
            const wasRequired = pendingPasswordChange.mode === 'first-login';
            const userData = pendingPasswordChange.userData;
            passwordChangeModal.classList.add('hidden');
            passwordChangeForm.reset();
            passwordChangeError.textContent = '';
            pendingPasswordChange = null;
            if (wasRequired && userData) unlockDashboard(userData);
            else alert('Your password has been changed.');
        } catch (error) {
            console.error('Unable to change the account password.', error);
            passwordChangeError.textContent = error.message || 'Unable to change the password. Please try again.';
        } finally {
            submitButton.disabled = false;
        }
    });

    const unlockDashboard = (userData) => {
        applyAccountSectionAccess(userData);
        renderMobileRoleNav(userData);
        referenceLoginPage?.classList.add('hidden');
        if (loginScreen) {
            loginScreen.classList.remove('active');
            loginScreen.classList.add('hidden');
        }
        container.classList.remove('hidden');

        const welcomeSubheading = document.querySelector('.welcome p');
        const accountName = userData.fullName || userData.adminUser || userData.email || 'there';
        setApplicationPage('Dashboard');
        if (welcomeSubheading) welcomeSubheading.textContent = `Welcome back, ${accountName}.`;

        const profileNameEl = document.querySelector('.profile-meta strong') || document.querySelector('.profile h4');
        const profileRoleEl = document.querySelector('.profile-meta span') || document.querySelector('.profile-role');
        const profilePhotoEl = document.querySelector('.profile img');
        if (profileNameEl) profileNameEl.textContent = userData.fullName || userData.adminUser || 'Administrator';
        if (profileRoleEl) profileRoleEl.textContent = userData.role || 'Administrator';
        if (profilePhotoEl) profilePhotoEl.src = userData.photo || userData.photoURL || 'https://i.pravatar.cc/100?img=12';

        const grants = sectionGrantSet(userData);
        const dashboardLink = document.getElementById('dashboardBtn');
        const dashboardTitle = dashboardLink?.closest('.nav-links')?.previousElementSibling;
        const dashboardAllowed = isPrivilegedRole(userData.role)
            || (dashboardTitle && dashboardLink && isSectionGranted(grants, dashboardTitle, dashboardLink));
        if (String(userData.role || '').toLowerCase() === 'parent') {
            showParentPortalHome({ persist: false });
        } else if (dashboardAllowed) {
            showDashboard({ persist: false });
            restoreSavedSection();
        } else {
            const firstAllowedLink = Array.from(document.querySelectorAll('.nav-links a')).find(link =>
                !link.closest('.account-access-hidden')
                && !link.closest('[hidden]')
                && !link.closest('.nav-links')?.classList.contains('account-access-hidden')
            );
            if (firstAllowedLink) firstAllowedLink.click();
            else {
                showSection('accountNoSectionAccess');
                setApplicationPage('Access Not Assigned');
                updateBreadcrumb(['Account', 'Access']);
            }
        }
        handleNotificationRoute();
        void startDashboardData(userData);
    };

    const restoreSession = async () => {
        const session = loadSession();
        if (!session?.schoolId || !session.authenticated) {
            document.documentElement.classList.remove('session-restoring');
            return;
        }
        try {
            const firebase = await waitForFirebase();
            const authUser = await firebase.authReady;
            if (!authUser) {
                clearSession();
                return;
            }
            currentSchool = await firebase.getSchool(session.schoolId);
            const membership = await firebase.getMembership(currentSchool.id, authUser.uid);
            if (!membership || (membership.perms?.view === false && !isPrivilegedRole(membership.role))) {
                clearSession();
                await firebase.signOut(session.schoolId);
                resetLoginScreen();
                window.location.reload();
                return;
            }
            const user = normalizeMember(membership, authUser);
            schoolIdInput.value = currentSchool.id;
            saveSession({ schoolId: currentSchool.id, userId: authUser.uid, authenticated: true, user });
            window.schoolPortalData?.setIdentity(currentSchool.id, authUser.uid, membership);
            if (membership.mustChangePassword) openPasswordChangeDialog('first-login', user);
            else unlockDashboard(user);
        } catch (error) {
            const cachedUser = session?.user;
            const authenticatedUid = window.schoolPortalFirebase?.auth?.currentUser?.uid;
            if (!navigator.onLine && cachedUser && authenticatedUid === session.userId) {
                currentSchool = { id: session.schoolId, schoolName: cachedUser.schoolName || 'School' };
                schoolIdInput.value = currentSchool.id;
                window.schoolPortalData?.setIdentity(session.schoolId, authenticatedUid, cachedUser);
                if (cachedUser.mustChangePassword) openPasswordChangeDialog('first-login', cachedUser);
                else unlockDashboard(cachedUser);
                return;
            }
            console.error('Unable to restore Firebase session.', error);
            const message = document.getElementById('referenceLoginMessage');
            if (message) message.textContent = 'Could not verify your saved school access. Check your connection and sign in again.';
        } finally {
            document.documentElement.classList.remove('session-restoring');
        }
    };

    schoolNextBtn.addEventListener('click', async () => {
        const schoolId = normalizeSchoolId(schoolIdInput.value);
        if (!schoolId) {
            showError(schoolError, 'Please enter your school ID.');
            return;
        }
        if (schoolId.includes(',')) {
            showError(schoolError, 'Enter only one School ID at a time. Example: SCH-UG-0001-08102026.');
            return;
        }
        schoolNextBtn.disabled = true;
        try {
            currentSchool = await getFirebase().getSchool(schoolId);
            schoolIdInput.value = currentSchool.id;
            showError(schoolError, '');
            showError(adminError, '');
            saveSession({ schoolId: currentSchool.id, step: 1, authenticated: false });
            updateStep(1);
            setTimeout(() => adminUserInput.focus(), 100);
        } catch (error) {
            showError(schoolError, error.message || 'Unable to verify this School ID.');
        } finally {
            schoolNextBtn.disabled = false;
        }
    });

    const authenticateAdmin = async (rawEmail, rawPassword, schoolId = schoolIdInput.value) => {
        const email = String(rawEmail || '').trim();
        const password = String(rawPassword || '');
        if (!email || !password) {
            showError(adminError, 'Please enter your email and password.');
            return false;
        }
        if (!schoolId) {
            showError(adminError, 'Enter and verify your School ID first.');
            return false;
        }
        try {
            const { school, user: authUser, membership } = await getFirebase().signIn(schoolId, email, password);
            if (membership.perms?.view === false && !isPrivilegedRole(membership.role)) {
                throw new Error('This account does not have dashboard access. Contact your school administrator.');
            }
            currentSchool = school;
            const user = normalizeMember(membership, authUser);
            saveSession({ schoolId: school.id, userId: authUser.uid, step: 2, authenticated: true, user });
            window.schoolPortalData?.setIdentity(school.id, authUser.uid, membership);
            showError(adminError, '');
            if (membership.mustChangePassword) openPasswordChangeDialog('first-login', user);
            else unlockDashboard(user);
            return true;
        } catch (error) {
            console.error('Firebase sign-in failed.', error);
            showError(adminError, error.code === 'auth/invalid-credential'
                ? 'Email or password is incorrect.'
                : error.message || 'Unable to sign in. Check your connection and try again.');
            return false;
        }
    };

    adminLoginBtn.addEventListener('click', () => {
        authenticateAdmin(adminUserInput.value, adminPassInput.value);
    });

    backToSchoolBtn.addEventListener('click', () => {
        showError(adminError, '');
        saveSession({ schoolId: schoolIdInput.value.trim().toUpperCase(), step: 0, authenticated: false });
        updateStep(0);
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            const session = loadSession();
            try {
                if (window.schoolPortalFirebase) {
                    const result = await window.schoolPortalFirebase.signOut(session?.schoolId);
                    if (result?.pushCleanupWarning) alert(result.pushCleanupWarning);
                }
                if (session?.schoolId && session?.userId) {
                    localStorage.removeItem(`schoolPushEnabled:${encodeURIComponent(session.schoolId)}:${encodeURIComponent(session.userId)}`);
                }
            } catch (error) {
                console.error('Firebase sign-out failed.', error);
                showError(adminError, 'Could not sign out. Please try again.');
                return;
            }
            window.schoolPortalData?.clearIdentity();
            clearSession();
            if (session?.schoolId) {
                saveSession({
                    schoolId: session.schoolId,
                    schoolName: currentSchool?.schoolName || session.schoolName || 'School',
                    logoURL: currentSchool?.logoURL || session.logoURL || '',
                    step: 1,
                    authenticated: false
                });
            }
            resetLoginScreen();
            container.classList.add('hidden');
            referenceLoginPage?.classList.remove('hidden');
            loginScreen?.classList.remove('active');
            loginScreen?.classList.add('hidden');
            window.location.reload();
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

    const referenceLoginForm = document.getElementById('referenceLoginForm');
    const referenceSchoolId = document.getElementById('referenceSchoolId');
    const referenceSchoolInformation = document.getElementById('referenceSchoolInformation');
    const referenceSchoolIdentity = document.getElementById('referenceSchoolIdentity');
    const referenceVerifiedSchoolName = document.getElementById('referenceVerifiedSchoolName');
    const referenceVerifiedSchoolId = document.getElementById('referenceVerifiedSchoolId');
    const referenceSchoolLogo = document.getElementById('referenceSchoolLogo');
    const referenceSchoolLogoFallback = document.getElementById('referenceSchoolLogoFallback');
    const referenceUsername = document.getElementById('referenceLoginUsername');
    const referencePassword = document.getElementById('referenceLoginPassword');
    const referenceUserLogin = document.getElementById('referenceUserLogin');
    const referenceBackToSchool = document.getElementById('referenceBackToSchool');
    const referenceRemember = referenceLoginForm?.elements.namedItem('remember');
    const referenceMessage = document.getElementById('referenceLoginMessage');
    const referenceSchoolMessage = document.getElementById('referenceSchoolMessage');
    const showReferenceMessage = (message) => {
        if (referenceMessage) referenceMessage.textContent = message;
    };
    const rememberedUsernameKey = 'schoolPortalRememberedUsername';

    if (referenceLoginForm && referenceSchoolId && referenceSchoolInformation && referenceSchoolIdentity
        && referenceVerifiedSchoolName && referenceVerifiedSchoolId && referenceSchoolLogo
        && referenceSchoolLogoFallback && referenceUsername && referencePassword && referenceUserLogin
        && referenceBackToSchool
        && referenceRemember instanceof HTMLInputElement) {
        const hideReferenceUserLogin = () => {
            referenceUserLogin.classList.add('hidden');
            referenceUserLogin.setAttribute('aria-hidden', 'true');
            referenceUserLogin.querySelectorAll('input, button').forEach(control => {
                control.disabled = true;
            });
            showReferenceMessage('');
        };
        const setReferenceSchoolIdentity = school => {
            referenceVerifiedSchoolName.textContent = school.schoolName || 'School';
            referenceVerifiedSchoolId.textContent = school.id;
            if (school.logoURL) {
                referenceSchoolLogo.src = school.logoURL;
                referenceSchoolLogo.alt = `${school.schoolName || 'School'} logo`;
                referenceSchoolLogo.classList.remove('hidden');
                referenceSchoolLogoFallback.classList.add('hidden');
                referenceSchoolLogo.onerror = () => {
                    referenceSchoolLogo.classList.add('hidden');
                    referenceSchoolLogoFallback.classList.remove('hidden');
                };
            } else {
                referenceSchoolLogo.removeAttribute('src');
                referenceSchoolLogo.classList.add('hidden');
                referenceSchoolLogoFallback.classList.remove('hidden');
            }
        };
        resetReferenceLogin = () => {
            currentSchool = null;
            schoolIdInput.value = '';
            referenceSchoolId.value = '';
            referenceSchoolId.disabled = false;
            referenceSchoolId.required = true;
            referenceUsername.value = '';
            referencePassword.value = '';
            referencePassword.type = 'password';
            referenceSchoolIdentity.classList.add('hidden');
            referenceVerifiedSchoolName.textContent = '';
            referenceVerifiedSchoolId.textContent = '';
            referenceSchoolLogo.removeAttribute('src');
            referenceSchoolLogo.alt = '';
            referenceSchoolLogo.classList.add('hidden');
            referenceSchoolLogoFallback.classList.remove('hidden');
            referenceSchoolInformation.classList.remove('hidden');
            hideReferenceUserLogin();
            referenceSchoolMessage.textContent = '';
            showReferenceMessage('');
            referenceLoginForm.classList.remove('hidden');
        };
        const revealReferenceUserLogin = () => {
            referenceSchoolId.disabled = true;
            referenceSchoolId.required = false;
            referenceSchoolInformation.classList.add('hidden');
            referenceSchoolIdentity.classList.remove('hidden');
            referenceUserLogin.classList.remove('hidden');
            referenceUserLogin.setAttribute('aria-hidden', 'false');
            referenceUserLogin.querySelectorAll('input, button').forEach(control => {
                control.disabled = false;
            });
            referenceSchoolMessage.textContent = 'School information confirmed. Enter your user details.';
            referenceUsername.focus();
        };
        const verifyReferenceSchool = async () => {
            const schoolId = normalizeSchoolId(referenceSchoolId.value);
            if (!schoolId) {
                referenceSchoolMessage.textContent = 'Enter your School ID.';
                return;
            }
            const continueButton = document.getElementById('referenceSchoolContinue');
            continueButton.disabled = true;
            try {
                const school = await getFirebase().getSchool(schoolId);
                currentSchool = school;
                schoolIdInput.value = school.id;
                referenceSchoolId.value = school.id;
                setReferenceSchoolIdentity(school);
                saveSession({
                    schoolId: school.id,
                    schoolName: school.schoolName,
                    logoURL: school.logoURL || '',
                    step: 1,
                    authenticated: false
                });
                referenceSchoolMessage.textContent = '';
                showReferenceMessage('');
                revealReferenceUserLogin();
                return true;
            } catch (error) {
                const message = error.message || 'Unable to verify school information.';
                if (referenceUserLogin.classList.contains('hidden')) referenceSchoolMessage.textContent = message;
                else showReferenceMessage(message);
                return;
            } finally {
                continueButton.disabled = false;
            }
        };
        hideReferenceUserLogin();
        document.getElementById('referenceSchoolContinue')?.addEventListener('click', verifyReferenceSchool);
        referenceBackToSchool.addEventListener('click', () => {
            clearSession();
            currentSchool = null;
            referenceSchoolId.disabled = false;
            referenceSchoolId.required = true;
            referenceUsername.value = '';
            referencePassword.value = '';
            referencePassword.type = 'password';
            referenceSchoolIdentity.classList.add('hidden');
            referenceSchoolInformation.classList.remove('hidden');
            hideReferenceUserLogin();
            referenceSchoolMessage.textContent = '';
            referenceSchoolId.focus();
        });
        referenceSchoolId.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                verifyReferenceSchool();
            }
        });
        referenceSchoolId.addEventListener('input', () => {
            hideReferenceUserLogin();
            referenceSchoolIdentity.classList.add('hidden');
            referenceSchoolMessage.textContent = '';
        });
        const savedSchoolSession = loadSession();
        const linkedSchoolId = new URLSearchParams(window.location.search).get('schoolId');
        if (linkedSchoolId && !savedSchoolSession?.authenticated) {
            referenceSchoolId.value = normalizeSchoolId(linkedSchoolId);
            const verifyRestoredSchool = () => {
                verifyReferenceSchool();
            };
            if (window.schoolPortalFirebase) {
                verifyRestoredSchool();
            } else {
                window.addEventListener('school-portal-firebase-ready', verifyRestoredSchool, { once: true });
            }
        } else if (savedSchoolSession?.schoolId && savedSchoolSession.step === 1 && !savedSchoolSession.authenticated) {
            referenceSchoolId.value = normalizeSchoolId(savedSchoolSession.schoolId);
            setReferenceSchoolIdentity({
                id: referenceSchoolId.value,
                schoolName: savedSchoolSession.schoolName,
                logoURL: savedSchoolSession.logoURL
            });
            referenceSchoolInformation.classList.add('hidden');
            referenceSchoolIdentity.classList.remove('hidden');
            revealReferenceUserLogin();
        }

        try {
            const rememberedUsername = localStorage.getItem(rememberedUsernameKey);
            if (rememberedUsername) {
                referenceUsername.value = rememberedUsername;
                referenceRemember.checked = true;
            }
        } catch (error) {
            console.warn('Unable to load the remembered login name.', error);
        }

        document.getElementById('referenceForgotPassword')?.addEventListener('click', () => {
            showReferenceMessage('Please contact your school administrator if you need help signing in.');
            referenceUsername.focus();
        });

        document.getElementById('referencePasswordToggle')?.addEventListener('click', (event) => {
            const button = event.currentTarget;
            const isVisible = referencePassword.type === 'text';
            referencePassword.type = isVisible ? 'password' : 'text';
            button.setAttribute('aria-pressed', String(!isVisible));
            button.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
            button.innerHTML = `<i class="fa-regular ${isVisible ? 'fa-eye' : 'fa-eye-slash'}" aria-hidden="true"></i>`;
        });

        document.getElementById('referenceContactAdmin')?.addEventListener('click', () => {
            showReferenceMessage('Please contact your school administrator to request or recover your account.');
        });

        referenceLoginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const verified = currentSchool?.id === normalizeSchoolId(referenceSchoolId.value) || await verifyReferenceSchool();
            if (!verified) return;
            const signedIn = await authenticateAdmin(referenceUsername.value, referencePassword.value, currentSchool.id);
            if (!signedIn) {
                showReferenceMessage(adminError.textContent);
                return;
            }
            try {
                if (referenceRemember.checked) {
                    localStorage.setItem(rememberedUsernameKey, referenceUsername.value.trim());
                } else {
                    localStorage.removeItem(rememberedUsernameKey);
                }
            } catch (error) {
                console.warn('Unable to save the remembered email address.', error);
            }
        });
    }

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
            'Parents': { text: 'Add Parent', icon: 'fa-users' },
            'SMS Alerts': { text: 'Create SMS Alert', icon: 'fa-bell' },
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
            'Recruitment': { text: 'Add Applicant', icon: 'fa-user-plus' },
            'Run Payroll': { text: 'Process Payroll', icon: 'fa-money-bill-wave' },
            'Fees': { text: 'Collect Fee', icon: 'fa-money-bill-transfer' },
            'Fee Invoices': { text: 'Create Invoice', icon: 'fa-file-invoice-dollar' },
            'Expenses': { text: 'Add Expense', icon: 'fa-receipt' },
            'Purchase Request': { text: 'New Request', icon: 'fa-cart-plus' },
            'Purchase Requests': { text: 'New Request', icon: 'fa-cart-plus' },
            'Purchase Orders': { text: 'Create Purchase Order', icon: 'fa-cart-shopping' },
            'Purchase Comparisons': { text: 'New Comparison', icon: 'fa-code-compare' },
            'Quotations': { text: 'New Quotation', icon: 'fa-file-invoice-dollar' },
            'Goods Receipt (GRN)': { text: 'New GRN', icon: 'fa-truck-ramp-box' },
            'Supplier Invoices': { text: 'New Invoice', icon: 'fa-file-invoice-dollar' },
            'Suppliers': { text: 'Add Supplier', icon: 'fa-truck-fast' },
            'Fixed Assets': { text: 'Add Fixed Asset', icon: 'fa-building-circle-check' },
            'Maintenance': { text: 'Add Maintenance', icon: 'fa-screwdriver-wrench' },
            'Users': { text: 'Add User', icon: 'fa-user-shield' },
            'Assignments': { text: 'Post Assignment', icon: 'fa-clipboard-list' },
            'Online Quizzes': { text: 'Create Quiz', icon: 'fa-stopwatch' },
            'Notice Board': { text: 'Create Notice', icon: 'fa-bullhorn' },
            'User Roles': { text: 'Add Role', icon: 'fa-user-shield' }
        };

        const config = actionConfigs[sectionLabel] || { text: `New ${sectionLabel}`, icon: 'fa-plus' };
        
        addBtn.innerHTML = `<i class="fas ${config.icon}"></i> ${config.text}`;
        addBtn.setAttribute('data-section', sectionLabel);
        
        // Visibility Logic: Hide button on sections with their own actions or no record creation
        const hideOn = ['Audit Logs', 'Backups', 'Analytics', 'Settings', 'System Settings', 'School Branding', 'School Statistics', 'EMIS Reports'];
        addBtn.style.display = hideOn.includes(sectionLabel) ? 'none' : 'flex';
    };

    // --- Profile Modal Logic ---
    const headerProfile = document.getElementById('headerProfile');
    const profileModal = document.getElementById('profileModal');
    const closeProfileModal = document.getElementById('closeProfileModal');

    const profileForm = document.getElementById('profileForm');
    const profileSaveMessage = document.getElementById('profileSaveMessage');
    const profilePhotoEdit = document.getElementById('profilePhotoEdit');
    const notificationChannels = ['WhatsApp', 'SMS', 'Email', 'Push'];
    const readNotificationPreferences = form => ({
        WhatsApp: !!form.querySelector('[name="notifyWhatsApp"], #accountNotifyWhatsApp')?.checked,
        SMS: !!form.querySelector('[name="notifySms"], #accountNotifySms')?.checked,
        Email: !!form.querySelector('[name="notifyEmail"], #accountNotifyEmail')?.checked,
        Push: !!form.querySelector('[name="notifyPush"], #accountNotifyPush')?.checked
    });
    const fillNotificationPreferences = (form, preferences = {}) => {
        const ids = { WhatsApp: 'notifyWhatsApp', SMS: 'notifySms', Email: 'notifyEmail', Push: 'notifyPush' };
        const accountIds = { WhatsApp: 'accountNotifyWhatsApp', SMS: 'accountNotifySms', Email: 'accountNotifyEmail', Push: 'accountNotifyPush' };
        notificationChannels.forEach(channel => {
            const control = form.querySelector(`[name="${ids[channel]}"], #${accountIds[channel]}`);
            if (control) control.checked = preferences[channel] === true;
        });
    };
    const readImageFile = file => new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('Choose an image file.'));
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            reject(new Error('Choose an image smaller than 2 MB.'));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') resolve(reader.result);
            else reject(new Error('The selected image could not be read.'));
        };
        reader.onerror = () => reject(reader.error || new Error('The selected image could not be read.'));
        reader.readAsDataURL(file);
    });
    const updateProfileSummary = user => {
        const modalProfilePhoto = document.getElementById('modalProfilePhoto');
        const modalProfileName = document.getElementById('modalProfileName');
        const modalProfileRole = document.getElementById('modalProfileRole');
        const modalProfileId = document.getElementById('modalProfileId');

        if (modalProfilePhoto) modalProfilePhoto.src = user.photoURL || user.photo || 'https://i.pravatar.cc/100?img=12';
        if (modalProfileName) modalProfileName.textContent = user.fullName || '';
        if (modalProfileRole) modalProfileRole.textContent = user.role || '';
        if (modalProfileId) modalProfileId.textContent = user.userId || '';

        const headerName = document.querySelector('.profile-meta strong') || document.querySelector('.profile h4');
        const headerRole = document.querySelector('.profile-meta span') || document.querySelector('.profile-role');
        const headerPhoto = document.querySelector('.profile img');
        if (headerName) headerName.textContent = user.fullName || '';
        if (headerRole) headerRole.textContent = user.role || '';
        if (headerPhoto) headerPhoto.src = user.photoURL || user.photo || 'https://i.pravatar.cc/100?img=12';
    };

    headerProfile?.addEventListener('click', (e) => {
        if (e.target.closest('#logoutBtn')) return;
        
        const session = loadSession();
        const currentUser = session?.user;
        if (currentUser) {
            updateProfileSummary(currentUser);
            profileForm.elements.fullName.value = currentUser.fullName || '';
            profileForm.elements.contactEmail.value = currentUser.contactEmail || '';
            profileForm.elements.phone.value = currentUser.phone || '';
            profileForm.elements.linkedRecordId.value = currentUser.linkedRecordId || '';
            fillNotificationPreferences(profileForm, currentUser.notificationPreferences);
            profilePhotoEdit.value = '';
            profileSaveMessage.textContent = '';
            profileModal.classList.add('active');
        }
    });

    closeProfileModal?.addEventListener('click', () => profileModal.classList.remove('active'));
    profileModal?.addEventListener('click', event => {
        if (event.target === profileModal) profileModal.classList.remove('active');
    });
    profileForm?.addEventListener('submit', async event => {
        event.preventDefault();
        const session = loadSession();
        const currentUser = session?.user;
        if (!session?.schoolId || !session?.userId || !currentUser) {
            profileSaveMessage.textContent = 'Your school account could not be verified. Sign in again.';
            return;
        }
        const updatedUser = {
            ...currentUser,
            fullName: profileForm.elements.fullName.value.trim(),
            contactEmail: profileForm.elements.contactEmail.value.trim(),
            phone: profileForm.elements.phone.value.trim(),
            notificationPreferences: readNotificationPreferences(profileForm)
        };
        try {
            const firebase = getFirebase();
            if (profilePhotoEdit.files?.[0]) {
                await readImageFile(profilePhotoEdit.files[0]);
                updatedUser.photoURL = await firebase.uploadProfilePhoto(session.schoolId, session.userId, profilePhotoEdit.files[0]);
            }
            await firebase.updateProfile(session.schoolId, session.userId, updatedUser);
            session.user = updatedUser;
            saveSession(session);
            updateProfileSummary(updatedUser);
            profileSaveMessage.textContent = 'Profile saved to your school account.';
        } catch (error) {
            console.error('Unable to update Firebase profile.', error);
            profileSaveMessage.textContent = error.message || 'Unable to save profile changes.';
        }
    });

    // --- User Roles Management ---
    const userRolesBtn = document.getElementById('userRolesBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const userRolesSection = document.getElementById('userRolesSection');

    const roleSelectEl = document.getElementById('roleSelect');
    const sectionsContainerEl = document.getElementById('sectionsContainer');
    const assignedClassesContainerEl = document.getElementById('assignedClassesContainer');
    const assignedClassesGroupEl = document.getElementById('assignedClassesGroup');
    const sectionsGroupEl = document.querySelector('.sections-group');
    const permissionsGroupEl = document.querySelector('.perms-group');
    const adminAccountAccessNotice = document.getElementById('adminAccountAccessNotice');
    const dataPermissionsContainerEl = document.getElementById('dataPermissionsContainer');
    const accountRecordSelect = document.getElementById('accountRecordId');
    const manualAccountRecordId = document.getElementById('manualAccountRecordId');
    const accountRecordHelp = document.getElementById('accountRecordHelp');
    const accountRecordGroup = accountRecordSelect?.closest('.form-group');
    const addUserForm = document.getElementById('addUserForm');
    const usersTableBody = document.getElementById('usersTableBody');
    const toggleAddUserFormBtn = document.getElementById('toggleAddUserFormBtn');
    const cancelUserFormBtn = document.getElementById('cancelUserFormBtn');
    const invitationPanel = document.getElementById('accountInvitationPanel');
    const invitationLinkInput = document.getElementById('accountInvitationLink');
    const invitationHeading = document.getElementById('accountInvitationHeading');
    const invitationMessage = document.getElementById('accountInvitationMessage');
    const invitationScopeNotice = document.getElementById('accountInvitationScopeNotice');
    const temporaryPasswordField = document.querySelector('.temporary-password-field');
    const temporaryAccountPassword = document.getElementById('temporaryAccountPassword');
    let assignablePermissionOptions = null;
    let permissionOptionsSchoolId = '';
    let assignableClasses = null;
    let classOptionsSchoolId = '';
    let linkedRecordRequest = 0;
    const assignableRecords = new Map();
    const roleKeysByLabel = {
        'School Admin': 'schoolAdmin',
        'Deputy Head Teacher': 'deputyHeadTeacher',
        Bursar: 'bursar',
        Teacher: 'teacher',
        Librarian: 'librarian',
        'HR Officer': 'hrOfficer',
        'Store Manager': 'storeManager',
        Parent: 'parent',
        Student: 'student'
    };
    const roleKeyForSelection = role => roleKeysByLabel[role] || role;
    const recordCollectionForRole = role => ['student', 'parent'].includes(roleKeyForSelection(role))
        ? 'students'
        : roleKeyForSelection(role) === 'schoolAdmin' ? '' : 'staff';
    const updateLinkedRecordOptions = async (role, selectedId = accountRecordSelect?.value || '') => {
        if (!accountRecordSelect) return;
        const requestId = ++linkedRecordRequest;
        const roleKey = roleKeyForSelection(role);
        const recordType = recordCollectionForRole(role);
        const isRequired = ['student', 'parent'].includes(roleKey);
        accountRecordGroup?.classList.toggle('hidden', !recordType);
        accountRecordSelect.required = isRequired;
        accountRecordSelect.disabled = !recordType;
        if (!recordType) {
            accountRecordSelect.replaceChildren(new Option('Not applicable', ''));
            manualAccountRecordId.classList.add('hidden');
            manualAccountRecordId.required = false;
            manualAccountRecordId.value = '';
            accountRecordHelp.textContent = 'School administrators do not need a linked record.';
            return;
        }
        accountRecordSelect.replaceChildren(new Option('Loading records…', ''));
        accountRecordHelp.textContent = isRequired
            ? 'Select the student record this account belongs to.'
            : 'Select the matching staff record, if one exists.';
        const schoolId = loadSession()?.schoolId;
        if (!schoolId) {
            accountRecordSelect.replaceChildren(new Option('Sign in to load records', ''));
            return;
        }
        const cacheKey = `${schoolId}:${recordType}`;
        if (!assignableRecords.has(cacheKey)) {
            assignableRecords.set(cacheKey, await getFirebase().getAssignableSchoolRecords(schoolId, recordType));
        }
        if (requestId !== linkedRecordRequest) return;
        const records = assignableRecords.get(cacheKey);
        accountRecordSelect.replaceChildren(new Option(
            isRequired ? 'Select a record…' : 'No linked record',
            ''
        ));
        records.forEach(record => {
            const details = [
                record.department ? `Department: ${record.department}` : '',
                record.group ? `Class/Section: ${record.group}` : ''
            ].filter(Boolean);
            accountRecordSelect.add(new Option(
                `${record.displayId || record.id}${record.displayId && record.displayId !== record.id ? ` (record key: ${record.id})` : ''} — ${record.name}${details.length ? ` — ${details.join(' — ')}` : ''}`,
                record.id
            ));
        });
        if (recordType === 'staff') {
            accountRecordSelect.add(new Option('Enter staff record ID manually…', '__manual__'));
        }
        if (selectedId && !records.some(record => record.id === selectedId)) {
            accountRecordSelect.add(new Option(`${selectedId} — linked record unavailable`, selectedId));
        }
        accountRecordSelect.value = selectedId;
        manualAccountRecordId.classList.toggle('hidden', accountRecordSelect.value !== '__manual__');
        manualAccountRecordId.required = accountRecordSelect.value === '__manual__';
        if (!records.length) {
            accountRecordHelp.textContent = isRequired
                ? 'No student records are available. Add a student record before creating this account.'
                : 'No staff records are available. Choose manual entry to add a staff record ID, or leave it unlinked.';
        }
    };
    accountRecordSelect?.addEventListener('change', () => {
        const manualMode = accountRecordSelect.value === '__manual__';
        manualAccountRecordId.classList.toggle('hidden', !manualMode);
        manualAccountRecordId.required = manualMode;
        if (!manualMode) manualAccountRecordId.value = '';
        accountRecordHelp.textContent = manualMode
            ? 'Enter the staff record ID. This does not create a staff profile; it only stores the ID on this account.'
            : 'Choose an existing record or leave the staff account unlinked.';
    });
    const updateAccountRoleFields = role => {
        const isAdministrator = roleKeyForSelection(role) === 'schoolAdmin';
        sectionsGroupEl?.classList.toggle('hidden', isAdministrator);
        permissionsGroupEl?.classList.toggle('hidden', isAdministrator);
        assignedClassesGroupEl?.classList.toggle('hidden', isAdministrator);
        adminAccountAccessNotice?.classList.toggle('hidden', !isAdministrator);
        if (isAdministrator) {
            assignedClassesContainerEl?.replaceChildren();
            dataPermissionsContainerEl?.replaceChildren();
        } else {
            renderDataPermissions(role);
            renderAssignedClasses(role);
        }
    };
    const loadAssignablePermissionOptions = async schoolId => {
        if (assignablePermissionOptions && permissionOptionsSchoolId === schoolId) return assignablePermissionOptions;
        assignablePermissionOptions = null;
        permissionOptionsSchoolId = '';
        const options = await getFirebase().getAssignableSchoolPermissions(schoolId);
        assignablePermissionOptions = options;
        permissionOptionsSchoolId = schoolId;
        return assignablePermissionOptions;
    };
    const loadAssignableClasses = async schoolId => {
        if (assignableClasses && classOptionsSchoolId === schoolId) return assignableClasses;
        assignableClasses = await getFirebase().getAssignableSchoolClasses(schoolId);
        classOptionsSchoolId = schoolId;
        return assignableClasses;
    };
    const renderAssignedClasses = (role, selectedClassIds = []) => {
        const isTeachingRole = ['teacher', 'deputyHeadTeacher'].includes(roleKeyForSelection(role));
        assignedClassesGroupEl?.classList.toggle('hidden', !isTeachingRole);
        if (!isTeachingRole || !assignedClassesContainerEl) {
            assignedClassesContainerEl?.replaceChildren();
            return;
        }
        if (!assignableClasses) {
            assignedClassesContainerEl.textContent = 'Loading available classes…';
            return;
        }
        if (!assignableClasses.length) {
            assignedClassesContainerEl.textContent = 'Create classes before assigning them to teaching accounts.';
            return;
        }
        assignedClassesContainerEl.replaceChildren();
        const selected = new Set(selectedClassIds);
        assignableClasses.forEach(item => {
            const label = document.createElement('label');
            label.className = 'assigned-class-option';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = item.id;
            checkbox.checked = selected.has(item.id);
            const name = document.createElement('span');
            name.textContent = item.name;
            label.append(checkbox, name);
            assignedClassesContainerEl.appendChild(label);
        });
    };
    const readAssignedClassIds = role => {
        if (!['teacher', 'deputyHeadTeacher'].includes(roleKeyForSelection(role))) return [];
        return Array.from(
        assignedClassesContainerEl?.querySelectorAll('input[type="checkbox"]:checked') || [],
        checkbox => checkbox.value
        );
    };
    const renderDataPermissions = (role, selectedPermissions) => {
        if (!dataPermissionsContainerEl) return;
        const roleOptions = assignablePermissionOptions?.[roleKeyForSelection(role)];
        if (!roleOptions) {
            dataPermissionsContainerEl.innerHTML = '<p class="data-permissions-empty">Load the role permission options to configure access.</p>';
            return;
        }
        const selected = selectedPermissions || Object.fromEntries(roleOptions.view.map(collection => [
            collection,
            { view: true, edit: roleOptions.edit.includes(collection), delete: false }
        ]));
        dataPermissionsContainerEl.innerHTML = `
            <div class="data-permissions-table-wrap">
                <table class="data-permissions-table">
                    <thead><tr><th>Data area</th><th>View</th><th>Edit</th><th>Delete</th></tr></thead>
                    <tbody>${roleOptions.view.map(collection => {
                        const access = selected[collection] || {};
                        const canEdit = roleOptions.edit.includes(collection);
                        return `<tr class="data-permission-row" data-collection="${escapeUserHTML(collection)}">
                            <th scope="row">${escapeUserHTML(collection.replace(/([A-Z])/g, ' $1'))}</th>
                            <td><input type="checkbox" data-permission="view" aria-label="View ${escapeUserHTML(collection)}" ${access.view === true ? 'checked' : ''}></td>
                            <td><input type="checkbox" data-permission="edit" aria-label="Edit ${escapeUserHTML(collection)}" ${canEdit && access.edit === true ? 'checked' : ''} ${canEdit ? '' : 'disabled'}></td>
                            <td><input type="checkbox" data-permission="delete" aria-label="Delete ${escapeUserHTML(collection)}" ${canEdit && access.delete === true ? 'checked' : ''} ${canEdit ? '' : 'disabled'}></td>
                        </tr>`;
                    }).join('')}</tbody>
                </table>
            </div>`;
        dataPermissionsContainerEl.querySelectorAll('.data-permission-row').forEach(row => {
            const viewCheckbox = row.querySelector('[data-permission="view"]');
            const editCheckbox = row.querySelector('[data-permission="edit"]');
            const deleteCheckbox = row.querySelector('[data-permission="delete"]');
            const updateDependencies = () => {
                if (!viewCheckbox.checked) {
                    editCheckbox.checked = false;
                    deleteCheckbox.checked = false;
                }
                editCheckbox.disabled = !viewCheckbox.checked || !roleOptions.edit.includes(row.dataset.collection);
                deleteCheckbox.disabled = !viewCheckbox.checked || !roleOptions.edit.includes(row.dataset.collection) || !editCheckbox.checked;
                if (!editCheckbox.checked) deleteCheckbox.checked = false;
            };
            viewCheckbox.addEventListener('change', updateDependencies);
            editCheckbox.addEventListener('change', updateDependencies);
            updateDependencies();
        });
    };
    const readDataPermissions = () => Object.fromEntries(
        Array.from(dataPermissionsContainerEl.querySelectorAll('.data-permission-row')).map(row => [
            row.dataset.collection,
            Object.fromEntries(Array.from(row.querySelectorAll('[data-permission]')).map(input => [
                input.dataset.permission,
                input.checked
            ]))
        ])
    );
    const permissionSummary = permissions => {
        if (!permissions || !Object.keys(permissions).length) return 'Role defaults';
        const entries = Object.values(permissions || {});
        const count = level => entries.filter(access => access?.[level] === true).length;
        return `${count('view')} view · ${count('edit')} edit · ${count('delete')} delete`;
    };
    const formatSectionGrants = sections => (sections || []).map(grant => {
        const parts = String(grant).split(':');
        if (parts[0] === 'department') {
            const title = Array.from(document.querySelectorAll('.sidebar > .menu-title'))
                .find(item => sectionDepartmentKey(item) === grant);
            return title?.innerText.trim() || parts[1];
        }
        if (parts[0] === 'module' && parts.length === 3) {
            const title = Array.from(document.querySelectorAll('.sidebar > .menu-title'))
                .find(item => normalizeSectionKey(item.dataset.accessSection || item.innerText.trim()) === parts[1]);
            const link = title?.nextElementSibling?.querySelectorAll('a');
            const module = Array.from(link || []).find(item => sectionModuleKey(title, item) === grant);
            return module ? `${title.innerText.trim()} · ${(module.querySelector('span')?.textContent || module.textContent).trim()}` : `${parts[1]} · ${parts[2]}`;
        }
        return String(grant).replace(/\s+Department$/, '');
    }).join(', ');

    const showUserRolesAddButton = () => {
        userRolesSection?.querySelectorAll('button').forEach(button => {
            if (/back to dashboard/i.test(button.textContent)) button.remove();
        });
        if (toggleAddUserFormBtn) {
            toggleAddUserFormBtn.hidden = false;
            toggleAddUserFormBtn.disabled = false;
            toggleAddUserFormBtn.style.pointerEvents = 'auto';
        }
    };

    toggleAddUserFormBtn?.addEventListener('click', async () => {
        const isHidden = addUserForm.classList.contains('hidden');
        if (isHidden) {
            assignableRecords.clear();
            addUserForm.classList.remove('hidden');
            clearForm();
            const session = loadSession();
            try {
                await Promise.all([
                    loadAssignablePermissionOptions(session.schoolId),
                    loadAssignableClasses(session.schoolId)
                ]);
                updateAccountRoleFields(roleSelectEl.value);
                await updateLinkedRecordOptions(roleSelectEl.value, '');
            } catch (error) {
                console.error('Unable to load account form options.', error);
                accountRecordHelp.textContent = error.message || 'Unable to load linked records.';
                dataPermissionsContainerEl.innerHTML = `<p class="data-permissions-error">${escapeUserHTML(error.message || 'Unable to load role permissions.')}</p>`;
            }
        } else {
            addUserForm.classList.add('hidden');
        }
    });

    document.getElementById('copyAccountInvitation')?.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(invitationLinkInput.value);
            document.getElementById('copyAccountInvitation').textContent = 'Copied';
        } catch (error) {
            console.error('Unable to copy the temporary password.', error);
            invitationLinkInput.focus();
            invitationLinkInput.select();
            alert('The password could not be copied automatically. Select and copy it manually.');
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

    let editingUserId = null;

    const activeSession = loadSession();
    if (activeSession?.authenticated && activeSession.user) applyAccountSectionAccess(activeSession.user);

    function updateBreadcrumb(items) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;
        breadcrumb.innerHTML = items.map((item, index) => {
            const isLast = index === items.length - 1;
            return `<span class="${isLast ? 'active-crumb' : ''}">${item}</span>`;
        }).join('');
    }

    function hideAllContentAreas(){
        document.querySelectorAll('.main > section, .main > .modules, .main > .charts').forEach(section => {
            section.classList.add('hidden');
        });
        document.documentElement.classList.remove('parent-portal-preview-active');
        updateDashboardActionAccess();
    }

    function showSection(sectionId){
        hideAllContentAreas();
        const el = document.getElementById(sectionId);
        if (el) el.classList.remove('hidden');
    }

    function showParentPortalHome({ persist = true, preview = false } = {}) {
        activeParentPortalView = '';
        hideAllContentAreas();
        document.getElementById('parentPortalHome')?.classList.remove('hidden');
        updateParentPortalNavActive(document.querySelector('.parent-sidebar-navigation [data-parent-home]'));
        document.getElementById('parentPortalHome')?.classList.toggle('parent-portal-preview', preview);
        document.documentElement.classList.toggle('parent-portal-preview-active', preview);
        updateDashboardActionAccess();
        renderParentPortalDashboard();
        if (preview) setApplicationPage('Parent Portal Preview');
        setApplicationPage(preview ? 'Parent Portal Preview' : 'Parent Home');
        updateBreadcrumb(preview ? ['Portals', 'Parent Portal Preview'] : ['Parent Portal', 'Home']);
        if (persist) persistDashboardSection();
    }

    function showDashboard({ persist = true } = {}){
        hideAllContentAreas();
        document.querySelectorAll('.main > .dashboard-toolbar, .main > .dashboard-quick-actions, .main > .dashboard-shell, .main > .table-card, .main > .modules, .main > .charts').forEach(section => {
            section.classList.remove('hidden');
        });
        setApplicationPage('Dashboard');
        updateBreadcrumb(['Main', 'Dashboard']);
        if (persist) persistDashboardSection();
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

    const frontOfficeStatIcons = {
        'Total Enquiries': 'fa-inbox',
        New: 'fa-circle-plus',
        'In Progress': 'fa-bars-progress',
        Waiting: 'fa-hourglass-half',
        Resolved: 'fa-circle-check',
        Closed: 'fa-circle-xmark',
        Appointments: 'fa-calendar-check',
        'Follow-up Due': 'fa-bell',
        Open: 'fa-folder-open',
        'Due Today': 'fa-calendar-day',
        Overdue: 'fa-triangle-exclamation',
        Completed: 'fa-check-double',
        "Today's Mail": 'fa-envelope',
        'Pending Delivery': 'fa-box',
        Delivered: 'fa-box-open',
        'Official / Important': 'fa-star',
        Returned: 'fa-arrow-rotate-left',
        "Today's Appointments": 'fa-calendar-day',
        Requested: 'fa-clipboard-list',
        Confirmed: 'fa-circle-check',
        'Checked In': 'fa-right-to-bracket',
        'Cancelled / No Show': 'fa-calendar-xmark',
        "Today's Visitors": 'fa-users',
        'Currently Inside': 'fa-person-circle-check',
        'Expected Today': 'fa-user-clock',
        'Checked Out': 'fa-right-from-bracket',
        'Active Visits': 'fa-person-walking',
        'Total Dispatches': 'fa-truck',
        Pending: 'fa-hourglass-half',
        'In Transit': 'fa-truck-fast',
        Urgent: 'fa-triangle-exclamation',
        'Total Calls': 'fa-phone-volume',
        Incoming: 'fa-phone',
        Outgoing: 'fa-phone-flip',
        'Follow-ups': 'fa-calendar-check'
    };

    function addFrontOfficeStatIcons(section) {
        section.querySelectorAll('.enquiry-stat').forEach(card => {
            const label = card.querySelector('span')?.textContent.trim();
            const iconName = frontOfficeStatIcons[label];
            if (!iconName || card.querySelector(':scope > i')) return;
            const icon = document.createElement('i');
            icon.className = `fas ${iconName}`;
            icon.setAttribute('aria-hidden', 'true');
            card.append(icon);
        });
    }

    function createEnquiriesModule(category) {
        const sec = document.createElement('section');
        sec.className = 'module enquiries-module enquiry-workflow-module';
        sec.id = 'module_enquiries';
        sec.innerHTML = `
            <div class="module-header">
                <div>
                    <h2>Enquiries</h2>
                    <p>Department: ${category}</p>
                </div>
                <button class="btn-secondary" type="button" data-enquiry-new><i class="fas fa-plus"></i> New Enquiry</button>
            </div>
            <div class="enquiries-stats enquiry-workflow-stats">
                <div class="enquiry-stat"><span>Total Enquiries</span><strong data-enquiry-total>0</strong></div>
                <div class="enquiry-stat"><span>New</span><strong data-enquiry-count="New">0</strong></div>
                <div class="enquiry-stat"><span>In Progress</span><strong data-enquiry-count="In Progress">0</strong></div>
                <div class="enquiry-stat"><span>Waiting</span><strong data-enquiry-count="Waiting for Visitor">0</strong></div>
                <div class="enquiry-stat"><span>Resolved</span><strong data-enquiry-count="Resolved">0</strong></div>
                <div class="enquiry-stat"><span>Closed</span><strong data-enquiry-count="Closed">0</strong></div>
                <div class="enquiry-stat"><span>Appointments</span><strong data-enquiry-appointments>0</strong></div>
                <div class="enquiry-stat"><span>Follow-up Due</span><strong data-enquiry-followups-due>0</strong></div>
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
                                <div class="enquiry-form-group full"><label>Address</label><textarea name="address" placeholder="Visitor's home or postal address"></textarea></div>
                                <div class="enquiry-form-group"><label>Student ID</label><select name="studentId"><option value="">Select student (optional)</option></select></div>
                                <div class="enquiry-form-group"><label>Department / Person</label><select name="department"><option value="">Select department</option><option>Principal's Office</option><option>Administration</option><option>Admissions</option><option>Accounts / Finance</option><option>Human Resources</option><option>Academic</option><option>Student Affairs</option><option>Transport</option><option>IT</option><option>Reception</option><option>Other</option></select></div>
                                <div class="enquiry-form-group"><label>Appointment Date</label><input name="appointmentDate" type="date"></div>
                                <div class="enquiry-form-group"><label>Assigned To</label><input name="assignedTo" placeholder="Staff member responsible"></div>
                                <div class="enquiry-form-group"><label>Next Follow-up</label><input name="followUpDate" type="date"></div>
                                <div class="enquiry-form-group"><label>Enquiry Status</label><select name="status"><option>New</option><option>In Progress</option><option>Waiting for Visitor</option><option>Resolved</option><option>Closed</option></select></div>
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
                        <div class="enquiry-summary-row"><span>Mobile</span><strong data-summary="mobile">-</strong></div>
                        <div class="enquiry-summary-row"><span>Address</span><strong data-summary="address">-</strong></div>
                        <div class="enquiry-summary-row"><span>Purpose</span><strong data-summary="purpose">-</strong></div>
                        <div class="enquiry-summary-row"><span>Student ID</span><strong data-summary="studentId">-</strong></div>
                        <div class="enquiry-summary-row"><span>Department</span><strong data-summary="department">-</strong></div>
                        <div class="enquiry-summary-row"><span>Assigned To</span><strong data-summary="assignedTo">-</strong></div>
                        <div class="enquiry-summary-row"><span>Next Follow-up</span><strong data-summary="followUpDate">-</strong></div>
                        <div class="enquiry-summary-row"><span>Status</span><strong data-summary="status">New</strong></div>
                        <div class="enquiry-summary-row"><span>Appointment Date</span><strong data-summary="appointmentDate">-</strong></div>
                        <div class="enquiry-summary-row"><span>Priority</span><strong data-summary="priority">Normal</strong></div>
                        <div class="enquiry-summary-row"><span>Notes</span><strong data-summary="notes">-</strong></div>
                    </div>
                </aside>
            </div>
            <div class="enquiry-date-filter">
                <label for="enquiryDatePeriod">Filter enquiries by date</label>
                <select id="enquiryDatePeriod" data-enquiry-date-period>
                    <option value="all">All</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="lastWeek">Last week</option>
                    <option value="lastMonth">Last Month</option>
                    <option value="custom">Custom</option>
                </select>
                <div class="enquiry-custom-date-range hidden" data-enquiry-custom-range>
                    <label>From <input type="date" data-enquiry-date-start></label>
                    <label>To <input type="date" data-enquiry-date-end></label>
                </div>
                <span class="enquiry-date-filter-message" data-enquiry-date-message aria-live="polite"></span>
            </div>
            <div class="enquiries-table"><div class="table-card"><h3 class="table-title">Saved Enquiry Records</h3><table><thead><tr><th>Name</th><th>Contact</th><th>Address</th><th>Type</th><th>Purpose</th><th>Student ID</th><th>Department</th><th>Assigned To</th><th>Follow-up</th><th>Appointment</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead><tbody data-enquiry-table></tbody></table></div></div>`;

        const form = sec.querySelector('[data-enquiry-form]');
        const table = sec.querySelector('[data-enquiry-table]');
        const datePeriod = sec.querySelector('[data-enquiry-date-period]');
        const customDateRange = sec.querySelector('[data-enquiry-custom-range]');
        const dateStart = sec.querySelector('[data-enquiry-date-start]');
        const dateEnd = sec.querySelector('[data-enquiry-date-end]');
        const dateMessage = sec.querySelector('[data-enquiry-date-message]');
        const storageKey = 'edumasterEnquiries';
        let editingIndex = null;
        const readEntries = () => {
            try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch (error) { return []; }
        };
        const escape = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
        const studentIdSelect = form.elements.studentId;
        const refreshStudentOptions = selectedId => {
            let students = [];
            try {
                const stored = JSON.parse(localStorage.getItem('school_students'));
                students = Array.isArray(stored) ? stored : [];
            } catch (error) {}
            const studentOptions = students.filter(student => student.admissionNo).map(student => {
                const name = [student.firstName, student.lastName].filter(Boolean).join(' ');
                return `<option value="${escape(student.admissionNo)}">${escape(student.admissionNo)}${name ? ` - ${escape(name)}` : ''}</option>`;
            });
            studentIdSelect.innerHTML = `<option value="">${studentOptions.length ? 'Select student (optional)' : 'No student records available'}</option>${studentOptions.join('')}`;
            if (selectedId && !students.some(student => student.admissionNo === selectedId)) {
                studentIdSelect.insertAdjacentHTML('beforeend', `<option value="${escape(selectedId)}">${escape(selectedId)} (not in student records)</option>`);
            }
            studentIdSelect.value = selectedId || '';
        };
        const enquiryStatuses = ['New', 'In Progress', 'Waiting for Visitor', 'Resolved', 'Closed'];
        const normalizeEnquiryStatus = status => status === 'Open' ? 'New' : status === 'Completed' ? 'Resolved' : enquiryStatuses.includes(status) ? status : 'New';
        const currentActor = () => {
            try {
                const session = JSON.parse(localStorage.getItem('edumasterAdminSession')) || {};
                return session.name || session.userId || session.role || 'Front Desk';
            } catch (error) {
                return 'Front Desk';
            }
        };
        const formatWorkflowTime = value => {
            const date = new Date(value);
            return Number.isNaN(date.getTime()) ? '' : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
        };
        const addStatusHistory = (entry, status, by, at) => {
            entry.statusHistory = Array.isArray(entry.statusHistory) ? entry.statusHistory : [];
            entry.statusHistory.push({ status, by, at });
        };
        const localDateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const selectedEnquiryDateRange = () => {
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            if (datePeriod.value === 'today') return { start: localDateKey(todayStart), end: localDateKey(todayStart) };
            if (datePeriod.value === 'yesterday') {
                const yesterday = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() - 1);
                return { start: localDateKey(yesterday), end: localDateKey(yesterday) };
            }
            if (datePeriod.value === 'lastWeek') {
                const thisWeekStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() - ((todayStart.getDay() + 6) % 7));
                const lastWeekStart = new Date(thisWeekStart.getFullYear(), thisWeekStart.getMonth(), thisWeekStart.getDate() - 7);
                const lastWeekEnd = new Date(thisWeekStart.getFullYear(), thisWeekStart.getMonth(), thisWeekStart.getDate() - 1);
                return { start: localDateKey(lastWeekStart), end: localDateKey(lastWeekEnd) };
            }
            if (datePeriod.value === 'lastMonth') {
                const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                return { start: localDateKey(lastMonth), end: localDateKey(lastMonthEnd) };
            }
            if (datePeriod.value === 'custom') {
                const startDate = dateStart.value ? new Date(`${dateStart.value}T00:00:00`) : null;
                const endDate = dateEnd.value ? new Date(`${dateEnd.value}T00:00:00`) : null;
                if (!startDate || !endDate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
                    return { start: null, end: null, invalid: true, message: 'Choose both a start and end date.' };
                }
                if (startDate > endDate) return { start: null, end: null, invalid: true, message: 'The end date must be on or after the start date.' };
                return { start: dateStart.value, end: dateEnd.value };
            }
            return { start: null, end: null };
        };
        const render = () => {
            const entries = readEntries();
            sec.querySelector('[data-enquiry-total]').textContent = entries.length;
            const counts = Object.fromEntries(enquiryStatuses.map(status => [status, 0]));
            entries.forEach(entry => { counts[normalizeEnquiryStatus(entry.status)] += 1; });
            enquiryStatuses.forEach(status => { sec.querySelector(`[data-enquiry-count="${status}"]`).textContent = counts[status]; });
            sec.querySelector('[data-enquiry-appointments]').textContent = entries.filter(entry => entry.appointmentDate).length;
            const today = new Date().toISOString().slice(0, 10);
            sec.querySelector('[data-enquiry-followups-due]').textContent = entries.filter(entry => entry.followUpDate && entry.followUpDate <= today && !['Resolved', 'Closed'].includes(normalizeEnquiryStatus(entry.status))).length;
            const dateRange = selectedEnquiryDateRange();
            customDateRange.classList.toggle('hidden', datePeriod.value !== 'custom');
            dateStart.required = datePeriod.value === 'custom';
            dateEnd.required = datePeriod.value === 'custom';
            dateStart.setAttribute('aria-invalid', String(Boolean(dateRange.invalid && datePeriod.value === 'custom')));
            dateEnd.setAttribute('aria-invalid', String(Boolean(dateRange.invalid && datePeriod.value === 'custom')));
            dateMessage.textContent = dateRange.message || '';
            const visibleEntries = entries.map((entry, index) => ({ entry, index })).filter(({ entry }) => {
                if (datePeriod.value === 'all') return true;
                if (dateRange.invalid || !entry.createdAt) return false;
                const createdAt = new Date(entry.createdAt);
                if (Number.isNaN(createdAt.getTime())) return false;
                const createdDate = localDateKey(createdAt);
                return createdDate >= dateRange.start && createdDate <= dateRange.end;
            });
            const actionButton = (index, action, icon, label) => `<button class="enquiry-action workflow-action" type="button" data-enquiry-transition="${action}" data-enquiry-index="${index}" title="${label}" aria-label="${label} enquiry"><i class="fas ${icon}"></i></button>`;
            table.innerHTML = visibleEntries.length ? visibleEntries.map(({ entry, index }) => {
                const status = normalizeEnquiryStatus(entry.status);
                const statusClass = status.toLowerCase().replace(/[^a-z]+/g, '-');
                const history = Array.isArray(entry.statusHistory) ? entry.statusHistory : [];
                const lastChange = history[history.length - 1];
                let workflowActions = '';
                if (status === 'New') workflowActions = actionButton(index, 'start', 'fa-play', 'Start work') + actionButton(index, 'resolve', 'fa-circle-check', 'Resolve');
                if (status === 'In Progress') workflowActions = actionButton(index, 'wait', 'fa-hourglass-half', 'Wait for visitor') + actionButton(index, 'resolve', 'fa-circle-check', 'Resolve');
                if (status === 'Waiting for Visitor') workflowActions = actionButton(index, 'resume', 'fa-play', 'Resume work') + actionButton(index, 'resolve', 'fa-circle-check', 'Resolve');
                if (status === 'Resolved') workflowActions = actionButton(index, 'close', 'fa-lock', 'Close enquiry') + actionButton(index, 'reopen', 'fa-rotate-left', 'Reopen enquiry');
                if (status === 'Closed') workflowActions = actionButton(index, 'reopen', 'fa-rotate-left', 'Reopen enquiry');
                const historyLabel = lastChange ? `${escape(lastChange.by || 'Staff')} · ${escape(formatWorkflowTime(lastChange.at))}` : '';
                const appointmentAction = entry.appointmentDate && !entry.appointmentId ? `<button class="enquiry-action" type="button" data-enquiry-action="appointment" data-enquiry-index="${index}" title="Create linked appointment" aria-label="Create appointment from enquiry"><i class="fas fa-calendar-plus"></i></button>` : '';
                const appointmentLabel = entry.appointmentId ? `${escape(entry.appointmentId)}<br><small>${escape(entry.appointmentStatus || 'Requested')} · ${escape(entry.appointmentDate || '')}</small>` : escape(entry.appointmentDate || '-');
                return `<tr><td>${escape(entry.name)}</td><td>${escape(entry.mobile || '-')}</td><td>${escape(entry.address || '-')}</td><td>${escape(entry.visitorType)}</td><td>${escape(entry.purpose)}</td><td>${escape(entry.studentId || '-')}</td><td>${escape(entry.department || '-')}</td><td>${escape(entry.assignedTo || 'Unassigned')}</td><td>${escape(entry.followUpDate || '-')}</td><td>${appointmentLabel}</td><td>${escape(entry.priority || 'Normal')}</td><td><span class="enquiry-status-badge status-${statusClass}">${escape(status)}</span><small class="enquiry-status-meta">${historyLabel}</small></td><td><div class="enquiry-actions">${workflowActions}${appointmentAction}<button class="enquiry-action" type="button" data-enquiry-action="preview" data-enquiry-index="${index}" title="Preview" aria-label="Preview enquiry"><i class="fas fa-eye"></i></button><button class="enquiry-action" type="button" data-enquiry-action="edit" data-enquiry-index="${index}" title="Edit" aria-label="Edit enquiry"><i class="fas fa-pen"></i></button><button class="enquiry-action" type="button" data-enquiry-action="print" data-enquiry-index="${index}" title="Print" aria-label="Print enquiry"><i class="fas fa-print"></i></button><button class="enquiry-action" type="button" data-enquiry-action="delete" data-enquiry-index="${index}" title="Delete" aria-label="Delete enquiry"><i class="fas fa-trash"></i></button></div></td></tr>`;
            }).join('') : `<tr><td colspan="13" style="text-align:center;padding:25px;color:#94a3b8;">${dateRange.message ? escape(dateRange.message) : datePeriod.value === 'all' ? 'No saved enquiries yet. Complete the form above to create a record.' : 'No enquiries found for this date range.'}</td></tr>`;
        };
        datePeriod.addEventListener('change', render);
        dateStart.addEventListener('change', render);
        dateEnd.addEventListener('change', render);
        window.addEventListener('school:enquiry-updated', render);
        window.addEventListener('storage', event => { if (event.key === storageKey) render(); });
        const openEnquiryDocument = (entry, autoPrint = false) => {
            const printWindow = window.open('', '_blank', 'width=960,height=900');
            if (!printWindow) return;
            const formatDate = value => {
                if (!value) return 'Not scheduled';
                const date = new Date(`${value}T00:00:00`);
                return Number.isNaN(date.getTime()) ? escape(value) : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
            };
            const recordedAt = entry.createdAt ? new Date(entry.createdAt) : new Date();
            const recordedLabel = Number.isNaN(recordedAt.getTime()) ? '-' : recordedAt.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
            const reference = entry.id || `ENQ-${recordedAt.getFullYear()}-${String(Date.now()).slice(-6)}`;
            const documentHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(reference)} | Enquiry Record</title><style>
                *{box-sizing:border-box}body{margin:0;background:#edf2f5;color:#172b3a;font-family:Arial,Helvetica,sans-serif}.preview-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;max-width:900px;margin:24px auto 12px;color:#526575;font-size:13px}.preview-toolbar button{border:0;border-radius:6px;background:#087f8c;color:#fff;padding:10px 16px;font-weight:700;cursor:pointer}.preview-toolbar button:hover{background:#066a75}.document{max-width:900px;min-height:1120px;margin:0 auto 30px;padding:52px 58px;background:#fff;box-shadow:0 14px 38px rgba(20,40,55,.12)}.document-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:22px;border-bottom:2px solid #0b7d88}.brand{display:flex;align-items:center;gap:13px}.brand-mark{display:grid;place-items:center;width:44px;height:44px;border-radius:8px;background:#0b7d88;color:#fff;font-weight:800;font-size:13px}.brand strong,.brand small,.reference span,.reference strong{display:block}.brand strong{font-size:14px;letter-spacing:1px;color:#163548}.brand small{margin-top:4px;color:#687c89;font-size:9px}.reference{text-align:right}.reference span,.eyebrow{color:#0b7d88;font-size:9px;font-weight:700;letter-spacing:1.2px}.reference strong{margin-top:5px;font-size:12px;color:#203b4b}.document-title{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;padding:30px 0 24px}.document-title h1{margin:7px 0 5px;font-size:27px;color:#163548}.document-title p{margin:0;color:#6c7f8b;font-size:11px}.priority{min-width:112px;padding:10px 14px;border:1px solid #d8e5e8;border-radius:6px;background:#f3f8f8}.priority span,.priority strong{display:block}.priority span{font-size:9px;color:#687c89;text-transform:uppercase}.priority strong{margin-top:5px;color:#0b7d88;font-size:12px}.document-section{margin-top:22px}.document-section h2{margin:0 0 10px;padding-bottom:8px;border-bottom:1px solid #dce5e9;color:#254354;font-size:11px;text-transform:uppercase;letter-spacing:.8px}.details-grid{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #edf1f3;border-left:1px solid #edf1f3}.detail{min-height:58px;padding:11px 13px;border-right:1px solid #edf1f3;border-bottom:1px solid #edf1f3}.detail span,.detail strong{display:block}.detail span{margin-bottom:6px;color:#70828d;font-size:9px;text-transform:uppercase;letter-spacing:.4px}.detail strong{color:#203b4b;font-size:11px;white-space:pre-wrap;overflow-wrap:anywhere}.purpose{padding:14px;border:1px solid #edf1f3;border-radius:5px;color:#304c5c;font-size:11px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}.document-footer{display:flex;justify-content:space-between;margin-top:40px;padding-top:12px;border-top:1px solid #dce5e9;color:#758791;font-size:9px}@page{size:A4;margin:0}@media(max-width:640px){.preview-toolbar{margin:12px;padding:0 4px}.document{min-height:0;margin:0;padding:28px 22px}.document-title{align-items:flex-start;flex-direction:column}.details-grid{grid-template-columns:1fr}}@media print{body{background:#fff}.preview-toolbar{display:none}.document{width:210mm;max-width:none;min-height:297mm;margin:0;padding:18mm;box-shadow:none}.document-section,.details-grid,.purpose{break-inside:avoid}}
            </style></head><body><div class="preview-toolbar"><span>Enquiry document preview</span><button type="button" onclick="window.print()">Print / Save PDF</button></div><main class="document"><header class="document-header"><div class="brand"><div class="brand-mark">FO</div><div><strong>SCHOOL FRONT OFFICE</strong><small>VISITOR &amp; ENQUIRY MANAGEMENT</small></div></div><div class="reference"><span>RECORD REFERENCE</span><strong>${escape(reference)}</strong></div></header><section class="document-title"><div><span class="eyebrow">ENQUIRY RECORD</span><h1>${escape(entry.name || 'Visitor enquiry')}</h1><p>Recorded ${escape(recordedLabel)}</p></div><div class="priority"><span>Priority</span><strong>${escape(entry.priority || 'Normal')}</strong></div></section><section class="document-section"><h2>Visitor details</h2><div class="details-grid"><div class="detail"><span>Visitor name</span><strong>${escape(entry.name || '-')}</strong></div><div class="detail"><span>Visitor type</span><strong>${escape(entry.visitorType || '-')}</strong></div><div class="detail"><span>Mobile number</span><strong>${escape(entry.mobile || '-')}</strong></div><div class="detail"><span>Student ID</span><strong>${escape(entry.studentId || '-')}</strong></div><div class="detail"><span>Department / person</span><strong>${escape(entry.department || '-')}</strong></div><div class="detail"><span>Status</span><strong>${escape(entry.status || 'Open')}</strong></div></div></section><section class="document-section"><h2>Appointment &amp; purpose</h2><div class="details-grid"><div class="detail"><span>Appointment date</span><strong>${escape(formatDate(entry.appointmentDate))}</strong></div><div class="detail"><span>Enquiry purpose</span><strong>${escape(entry.purpose || '-')}</strong></div></div></section><section class="document-section"><h2>Notes</h2><div class="purpose">${escape(entry.notes || 'No additional notes provided.')}</div></section><footer class="document-footer"><span>Generated by School Front Office</span><span>${escape(reference)}</span></footer></main></body></html>`;
            const historyRows = (Array.isArray(entry.statusHistory) ? entry.statusHistory : []).map(item => `<div class="detail"><span>${escape(item.status)}</span><strong>${escape(item.by || 'Staff')} · ${escape(formatWorkflowTime(item.at))}</strong></div>`).join('');
            const workflowSection = `<section class="document-section"><h2>Handling &amp; history</h2><div class="details-grid"><div class="detail"><span>Assigned to</span><strong>${escape(entry.assignedTo || 'Unassigned')}</strong></div><div class="detail"><span>Next follow-up</span><strong>${escape(formatDate(entry.followUpDate))}</strong></div></div><div class="details-grid">${historyRows || '<div class="detail"><span>Status history</span><strong>No changes recorded.</strong></div>'}</div></section>`;
            const addressHtml = documentHtml.replace(`<div class="detail"><span>Mobile number</span><strong>${escape(entry.mobile || '-')}</strong></div>`, `<div class="detail"><span>Mobile number</span><strong>${escape(entry.mobile || '-')}</strong></div><div class="detail"><span>Address</span><strong>${escape(entry.address || '-')}</strong></div>`);
            const printableHtml = addressHtml.replace('<footer class="document-footer">', `${workflowSection}<footer class="document-footer">`);
            if (autoPrint) printWindow.addEventListener('load', () => { printWindow.focus(); printWindow.print(); }, { once: true });
            printWindow.document.write(printableHtml);
            printWindow.document.close();
            if (!autoPrint) printWindow.focus();
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
            const entries = readEntries();
            const existing = editingIndex === null ? null : entries[editingIndex];
            const timestamp = new Date().toISOString();
            data.id = existing?.id || data.id || Date.now().toString();
            data.status = existing ? normalizeEnquiryStatus(data.status || existing.status) : 'New';
            data.assignedTo = (data.assignedTo || '').trim() || existing?.assignedTo || currentActor();
            data.createdAt = existing?.createdAt || timestamp;
            data.updatedAt = timestamp;
            data.statusHistory = Array.isArray(existing?.statusHistory) ? existing.statusHistory : existing ? [{ status: normalizeEnquiryStatus(existing.status), by: existing.createdBy || 'Front Desk', at: existing.createdAt || timestamp }] : [];
            if (!existing) addStatusHistory(data, 'New', currentActor(), timestamp);
            else if (data.status !== normalizeEnquiryStatus(existing.status)) addStatusHistory(data, data.status, currentActor(), timestamp);
            if (data.status === 'Resolved') data.resolvedAt = existing?.resolvedAt || timestamp;
            if (data.status === 'Closed') data.closedAt = existing?.closedAt || timestamp;
            if (editingIndex === null) {
                entries.unshift(data);
            } else {
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
            form.elements.status.disabled = true;
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
            form.elements.status.value = 'New';
            form.elements.status.disabled = true;
            form.elements.assignedTo.value = currentActor();
            refreshStudentOptions();
            form.querySelector('[name="name"]').focus();
            updateSummary();
        });
        sec.querySelector('[data-enquiry-cancel]').addEventListener('click', closeForm);
        table.addEventListener('click', event => {
            const transitionButton = event.target.closest('[data-enquiry-transition]');
            if (transitionButton) {
                const entries = readEntries();
                const index = Number(transitionButton.dataset.enquiryIndex);
                const entry = entries[index];
                if (!entry) return;
                const transitions = { start: 'In Progress', resume: 'In Progress', wait: 'Waiting for Visitor', resolve: 'Resolved', close: 'Closed', reopen: 'In Progress' };
                const nextStatus = transitions[transitionButton.dataset.enquiryTransition];
                if (!nextStatus) return;
                const previousStatus = normalizeEnquiryStatus(entry.status);
                if (nextStatus === 'Resolved' && !confirm(`Mark the enquiry for ${entry.name || 'this visitor'} as resolved?`)) return;
                const timestamp = new Date().toISOString();
                entry.status = nextStatus;
                entry.updatedAt = timestamp;
                if (nextStatus === 'In Progress' && !entry.assignedTo) entry.assignedTo = currentActor();
                if (nextStatus === 'Resolved') entry.resolvedAt = timestamp;
                if (nextStatus === 'Closed') entry.closedAt = timestamp;
                addStatusHistory(entry, nextStatus, currentActor(), timestamp);
                entries[index] = entry;
                localStorage.setItem(storageKey, JSON.stringify(entries));
                render();
                return;
            }
            const actionButton = event.target.closest('[data-enquiry-action]');
            if (!actionButton) return;
            const entries = readEntries();
            const entry = entries[Number(actionButton.dataset.enquiryIndex)];
            if (!entry) return;

            if (actionButton.dataset.enquiryAction === 'appointment') {
                window.pendingAppointmentRequest = {
                    enquiryId: entry.id,
                    name: entry.name,
                    visitorType: entry.visitorType,
                    mobile: entry.mobile,
                    studentId: entry.studentId,
                    department: entry.department,
                    appointmentDate: entry.appointmentDate,
                    purpose: entry.purpose,
                    priority: entry.priority,
                    notes: entry.notes
                };
                const appointmentLink = [...document.querySelectorAll('.nav-links a')].find(link => link.querySelector('span')?.textContent.trim() === 'Appointments');
                if (!appointmentLink) return alert('The Appointments module is not available in the current navigation.');
                appointmentLink.click();
                window.setTimeout(() => document.getElementById('module_appointments')?.querySelector('[data-enquiry-new]')?.click(), 0);
                return;
            }

            if (actionButton.dataset.enquiryAction === 'delete') {
                if (!confirm(`Delete the enquiry for ${entry.name || 'this visitor'}?`)) return;
                entries.splice(Number(actionButton.dataset.enquiryIndex), 1);
                localStorage.setItem(storageKey, JSON.stringify(entries));
                render();
                return;
            }

            if (actionButton.dataset.enquiryAction === 'edit') {
                refreshStudentOptions(entry.studentId);
                Object.entries(entry).forEach(([name, value]) => {
                    const field = form.elements[name];
                    if (field) field.value = value;
                });
                form.elements.status.value = normalizeEnquiryStatus(entry.status);
                form.elements.status.disabled = false;
                form.elements.assignedTo.value = entry.assignedTo || '';
                entryCard.classList.remove('hidden');
                sec.querySelector('.enquiry-summary-card').classList.remove('hidden');
                form.querySelector('[name="name"]').focus();
                updateSummary();
                editingIndex = Number(actionButton.dataset.enquiryIndex);
                return;
            }

            openEnquiryDocument(entry, actionButton.dataset.enquiryAction === 'print');
        });
        render();
        addFrontOfficeStatIcons(sec);
        return sec;
    }

    function createReportCardsModule(category) {
        const sec = document.createElement('section');
        const api = window.schoolPortalData;
        sec.className = 'module report-cards-module';
        sec.id = 'module_report_cards';
        sec.innerHTML = `
            <div class="module-header report-cards-header"><div><h2>Report Cards</h2><p>After marking an exam or test, add a result for each subject, review the calculated percentages, then publish for linked parents and students.</p></div><div class="report-cards-user"><span>Administrator</span><small>Super Admin</small></div></div>
            <div class="report-cards-stats"><div><span>Total Report Cards</span><strong data-report-stat="total">0</strong><i class="fas fa-clipboard-list"></i></div><div><span>Published</span><strong data-report-stat="published">0</strong><i class="fas fa-check"></i></div><div><span>Generated</span><strong data-report-stat="generated">0</strong><i class="fas fa-bolt"></i></div><div><span>Draft</span><strong data-report-stat="draft">0</strong><i class="fas fa-pen"></i></div></div>
            <div class="report-cards-panel"><div class="report-cards-toolbar"><div><h3>Report Cards List</h3><p>Academic Year 2026/27</p></div><div class="report-cards-actions"><label class="report-search"><i class="fas fa-search"></i><input type="search" data-report-search placeholder="Search student or report no..."></label><button class="btn-secondary" type="button" data-report-filter><i class="fas fa-filter"></i> Filter</button><button class="btn-primary" type="button" data-report-new><i class="fas fa-plus"></i> New Report Card</button></div></div><div class="report-cards-table-wrap"><table><thead><tr><th>Report Card No.</th><th>Student</th><th>Class</th><th>Section</th><th>Academic Year</th><th>Period</th><th>Average</th><th>Grade</th><th>GPA</th><th>Attendance</th><th>Status</th><th>Generated</th><th>Actions</th></tr></thead><tbody data-report-table></tbody></table></div></div>
            <div class="report-card-modal hidden" data-report-modal><div class="report-card-dialog" role="dialog" aria-modal="true" aria-labelledby="report-card-form-title"><div class="report-card-dialog-header"><div><h3 id="report-card-form-title">Report Card Setup</h3><p>Configure report card information and display options</p></div><button class="icon-button" type="button" data-report-close aria-label="Close"><i class="fas fa-times"></i></button></div><form data-report-form><input type="hidden" name="editIndex"><div class="report-form-section"><h4>General Information</h4><div class="report-form-grid"><label>Report Card Name<input name="reportName" value="Student Academic Report Card" required></label><label>Academic Year<input name="year" value="2026/27" required></label><label>Academic Period<select name="period"><option>Term 1</option><option>Term 2</option><option>Term 3</option><option>Semester 1</option><option>Semester 2</option></select></label><label>Class / Grade<select name="class"><option>Grade 6</option><option>Grade 7</option><option selected>Grade 8</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select></label><label>Section<select name="section"><option>A</option><option>B</option><option>C</option><option>D</option></select></label><label>Report Card Type<select name="reportType"><option>Standard</option><option>Detailed</option><option>Progress Report</option><option>Final Report</option></select></label><label>Grading System<select name="grading"><option>Percentage & Letter Grade</option><option>GPA 4.0 Scale</option><option>GPA 5.0 Scale</option><option>Custom School Grading</option></select></label><label>Status<select name="status"><option>Draft</option><option>Generated</option><option>Published</option><option>Archived</option></select></label></div></div><div class="report-form-section"><h4>Display Options</h4><div class="report-checkbox-grid">${['School Logo','Student Photo','Admission Number','Date of Birth','Class / Section','Attendance','Position / Rank','GPA','Overall Grade','Teacher Remarks','Principal Remarks','Parent Signature','Teacher Signature','Principal Signature'].map(label => `<label><input type="checkbox" checked> ${label}</label>`).join('')}</div></div><div class="report-form-section"><h4>Publication</h4><div class="report-form-grid"><label>Publication Status<select name="publication"><option>Draft</option><option>Generated</option><option>Published</option><option>Archived</option></select></label><label>Generated Date<input type="date" name="generatedDate"></label></div></div><div class="report-card-dialog-footer"><button class="btn-secondary" type="button" data-report-close>Cancel</button><button class="btn-primary" type="submit"><i class="fas fa-save"></i> Save Report Card</button></div></form></div></div>
            <div class="report-card-preview-modal hidden" data-report-preview><div class="report-card-preview"><div class="report-card-dialog-header"><div><h3>Report Card Preview</h3><p>Official student academic report</p></div><div><button class="btn-secondary" type="button" data-report-print><i class="fas fa-print"></i> Print</button><button class="icon-button" type="button" data-report-preview-close aria-label="Close"><i class="fas fa-times"></i></button></div></div><div class="report-preview-sheet" data-report-preview-sheet></div></div></div>`;
        const reportRole = window.schoolPortalData?.getIdentity()?.role || 'Staff';
        sec.querySelector('.report-cards-user span').textContent = reportRole.replace(/([a-z])([A-Z])/g, '$1 $2');
        sec.querySelector('.report-cards-user small').textContent = 'Academic results access';
        const previewActions = sec.querySelector('[data-report-preview] .report-card-dialog-header > div:last-child');
        const previewCloseButton = sec.querySelector('[data-report-preview-close]');
        previewCloseButton.insertAdjacentHTML('beforebegin', '<button class="btn-primary" type="button" data-report-download><i class="fas fa-download"></i> Download</button>');
        const storageKey = 'edumasterReportCards';
        const seed = [];
        const read = () => { try { const saved = JSON.parse(localStorage.getItem(storageKey)); if (Array.isArray(saved)) return saved; } catch (error) { /* use defaults */ } localStorage.setItem(storageKey, JSON.stringify(seed)); return seed.slice(); };
        const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
        const table = sec.querySelector('[data-report-table]'); const form = sec.querySelector('[data-report-form]'); const modal = sec.querySelector('[data-report-modal]'); const preview = sec.querySelector('[data-report-preview]'); let showingPublished = false; let currentIndex = 0;
        const initials = name => name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase(); const formatDate = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
        const render = () => { const query = sec.querySelector('[data-report-search]').value.toLowerCase(); const records = read(); const filtered = records.map((record, index) => ({ record, index })).filter(({ record }) => (!showingPublished || record.status === 'Published') && [record.student, record.no, record.class, record.section].some(value => String(value).toLowerCase().includes(query))); table.innerHTML = filtered.length ? filtered.map(({ record, index }) => `<tr><td><strong>${escape(record.no)}</strong></td><td><div class="report-student"><span>${escape(initials(record.student))}</span><strong>${escape(record.student)}</strong></div></td><td>${escape(record.class)}</td><td>${escape(record.section)}</td><td>${escape(record.year)}</td><td>${escape(record.period)}</td><td><strong>${escape(record.average)}</strong></td><td><strong class="report-grade">${escape(record.grade)}</strong></td><td><strong>${escape(record.gpa)}</strong></td><td>${escape(record.attendance)}</td><td><span class="report-status ${escape(record.status.toLowerCase())}">${escape(record.status)}</span></td><td>${escape(record.generated)}</td><td><div class="report-row-actions"><button class="icon-button" type="button" data-report-action="view" data-index="${index}" title="View"><i class="fas fa-eye"></i></button><button class="icon-button" type="button" data-report-action="edit" data-index="${index}" title="Edit"><i class="fas fa-pen"></i></button><button class="icon-button" type="button" data-report-action="publish" data-index="${index}" title="Publish"><i class="fas fa-check"></i></button><button class="icon-button" type="button" data-report-action="archive" data-index="${index}" title="Archive"><i class="fas fa-box-archive"></i></button></div></td></tr>`).join('') : '<tr><td colspan="13" class="report-empty">No report cards found.</td></tr>'; sec.querySelector('[data-report-stat="total"]').textContent = records.length; ['published', 'generated', 'draft'].forEach(status => { sec.querySelector(`[data-report-stat="${status}"]`).textContent = records.filter(record => record.status.toLowerCase() === status).length; }); };
        const closeModal = () => { modal.classList.add('hidden'); form.reset(); form.elements.editIndex.value = ''; };
        const openForm = index => {
            form.reset();
            form.elements.editIndex.value = index ?? '';
            const record = index === undefined ? null : read()[index];
            if (record) {
                form.elements.year.value = record.year || '';
                form.elements.period.value = record.period || '';
                form.elements.class.value = record.class || '';
                form.elements.section.value = record.section || '';
                form.elements.status.value = record.status || '';
                form.elements.publication.value = record.status || '';
            } else {
                form.elements.year.value = '';
                form.elements.generatedDate.value = new Date().toISOString().slice(0, 10);
            }
            modal.classList.remove('hidden');
            form.elements.year.focus();
        };
        const renderReportPreview = record => {
            const student = studentRecords.find(item => String(item.id) === String(record.studentId));
            const schoolName = String(currentSchool?.schoolName || '').trim();
            let schoolLogoUrl = '';
            try {
                const logoUrl = new URL(currentSchool?.logoURL || '', window.location.href);
                if (currentSchool?.logoURL && (logoUrl.protocol === 'https:' || logoUrl.origin === window.location.origin)) {
                    schoolLogoUrl = logoUrl.href;
                }
            } catch (error) {
                console.warn('The school logo URL is invalid.', error);
            }
            const schoolHeader = schoolName || schoolLogoUrl
                ? `<div class="report-sheet-header">${schoolLogoUrl ? `<div class="report-school-logo"><img src="${escape(schoolLogoUrl)}" alt=""></div>` : ''}<div>${schoolName ? `<strong>${escape(schoolName)}</strong>` : ''}</div></div>`
                : '';
            const studentName = record.student || (student && getStudentName(student)) || '';
            const admissionNumber = record.studentAdmissionNo || (student && getStudentAdmission(student)) || '';
            const className = [record.class || student?.className || student?.class, record.section || student?.section]
                .filter(Boolean).join(' / ');
            const details = [
                ['Student', studentName],
                ['Admission No.', admissionNumber],
                ['Class', className],
                ['Report No.', record.no]
            ].filter(([, value]) => value !== undefined && value !== null
                && !['', '—', '-', '–'].includes(String(value).trim()));
            const period = [record.year, record.period].filter(Boolean).join(' · ');
            const results = (record.subjectResults || []).filter(result => result.subjectName || result.subject);
            const resultRows = results.map(result => {
                const subject = result.subjectName || result.subject;
                const maximum = result.maxMarks ?? result.maximumMarks;
                const score = result.obtainedMarks ?? result.score;
                const percentage = Number(result.percentage ?? (Number(maximum) > 0 && score !== undefined ? Number(score) / Number(maximum) * 100 : NaN));
                const scoreText = [score, maximum].filter(value => value !== undefined && value !== null && value !== '').join(' / ');
                const scoreWithPercentage = scoreText && Number.isFinite(percentage) ? `${scoreText} (${percentage.toFixed(1)}%)` : scoreText;
                const grade = result.grade || result.letterGrade || '';
                const remarks = result.remarks || result.teacherRemarks || '';
                return `<tr><td data-label="Subject">${escape(subject)}</td><td data-label="Score">${escape(scoreWithPercentage)}</td><td data-label="Grade">${escape(grade)}</td><td data-label="Remark">${escape(remarks)}</td></tr>`;
            }).join('');
            const summary = [
                ['Overall grade', record.grade || record.overallGrade]
            ].filter(([, value]) => value !== undefined && value !== null
                && !['', '—', '-', '–'].includes(String(value).trim()));
            const remarks = [
                ['Teacher remarks', record.teacherRemarks || record.classTeacherRemarks],
                ['Principal remarks', record.principalRemarks || record.headTeacherRemarks]
            ].filter(([, value]) => value !== undefined && value !== null
                && !['', '—', '-', '–'].includes(String(value).trim()));
            const sheet = sec.querySelector('[data-report-preview-sheet]');
            sheet.innerHTML = `${schoolHeader}<div class="report-sheet-title"><h2>Student Report Card</h2>${period ? `<p>${escape(period)}</p>` : ''}</div>${details.length ? `<div class="report-detail-grid">${details.map(([label, value]) => `<div><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`).join('')}</div>` : ''}${resultRows ? `<div class="report-marks-table-wrap"><table class="report-marks-table"><thead><tr><th>Subject</th><th>Score</th><th>Grade</th><th>Remark</th></tr></thead><tbody>${resultRows}</tbody></table></div>` : ''}${summary.length ? `<div class="report-sheet-summary">${summary.map(([label, value]) => `<div><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`).join('')}</div>` : ''}${remarks.length ? `<div class="report-remarks">${remarks.map(([label, value]) => `<div><h4>${escape(label)}</h4><p>${escape(value)}</p></div>`).join('')}</div>` : ''}`;
            preview.classList.remove('hidden');
        };
        const openPreview = index => {
            const record = read()[index];
            if (!record) return;
            currentIndex = index;
            renderReportPreview(record);
        };
        const openFullPreview = openPreview;
        sec.querySelector('[data-report-new]').addEventListener('click', () => openForm()); sec.querySelector('[data-report-filter]').addEventListener('click', () => { showingPublished = !showingPublished; render(); }); sec.querySelector('[data-report-search]').addEventListener('input', render); sec.querySelectorAll('[data-report-close]').forEach(button => button.addEventListener('click', closeModal)); sec.querySelector('[data-report-preview-close]').addEventListener('click', () => preview.classList.add('hidden')); sec.querySelector('[data-report-print]').addEventListener('click', () => window.print());
        form.addEventListener('submit', event => { event.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; } const records = read(); const data = Object.fromEntries(new FormData(form).entries()); const index = data.editIndex; const existing = index === '' ? {} : records[Number(index)]; const status = data.publication; const record = { ...existing, no: existing?.no || `RC-${new Date().getFullYear()}-${String(records.length + 126).padStart(5, '0')}`, student: existing?.student || 'New Student', class: data.class, section: data.section, year: data.year, period: data.period, average: existing?.average || '0%', grade: existing?.grade || '-', gpa: existing?.gpa || '0.0', attendance: existing?.attendance || '0%', status, generated: formatDate(data.generatedDate) }; if (index === '') records.unshift(record); else records[Number(index)] = record; localStorage.setItem(storageKey, JSON.stringify(records)); closeModal(); render(); });
        table.addEventListener('click', event => { const button = event.target.closest('[data-report-action]'); if (!button) return; const index = Number(button.dataset.index); const records = read(); if (!records[index]) return; if (button.dataset.reportAction === 'edit') openForm(index); if (button.dataset.reportAction === 'view') openFullPreview(index); if (button.dataset.reportAction === 'publish') { records[index].status = 'Published'; localStorage.setItem(storageKey, JSON.stringify(records)); render(); } if (button.dataset.reportAction === 'archive') { records[index].status = 'Archived'; localStorage.setItem(storageKey, JSON.stringify(records)); render(); } });
        const addReportActions = () => { table.querySelectorAll('.report-row-actions').forEach(actions => { if (actions.querySelector('[data-report-action="generate"]')) return; const index = actions.querySelector('[data-report-action]')?.dataset.index; actions.insertAdjacentHTML('beforeend', `<button class="icon-button" type="button" data-report-action="generate" data-index="${index}" title="Generate PDF"><i class="fas fa-file-pdf"></i></button><button class="icon-button" type="button" data-report-action="print" data-index="${index}" title="Print"><i class="fas fa-print"></i></button><button class="icon-button" type="button" data-report-action="download" data-index="${index}" title="Download"><i class="fas fa-download"></i></button>`); }); };
        const downloadReport = index => { const record = read()[index]; if (!record) return; openFullPreview(index); const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escape(record.no)} Report Card</title></head><body>${sec.querySelector('[data-report-preview-sheet]').innerHTML}</body></html>`; const url = URL.createObjectURL(new Blob([html], { type: 'text/html' })); const link = document.createElement('a'); link.href = url; link.download = `${record.no}-Report-Card.html`; link.click(); URL.revokeObjectURL(url); };
        previewActions.querySelector('[data-report-download]').addEventListener('click', () => downloadReport(currentIndex)); const actionObserver = new MutationObserver(addReportActions); actionObserver.observe(table, { childList: true }); addReportActions();
        table.addEventListener('click', event => { const button = event.target.closest('[data-report-action]'); if (!button || !['generate', 'print', 'download'].includes(button.dataset.reportAction)) return; const index = Number(button.dataset.index); if (button.dataset.reportAction === 'generate') openFullPreview(index); if (button.dataset.reportAction === 'print') { openFullPreview(index); setTimeout(() => window.print(), 150); } if (button.dataset.reportAction === 'download') downloadReport(index); });
        const reportFeedback = document.createElement('p');
        reportFeedback.className = 'report-cards-feedback';
        reportFeedback.setAttribute('role', 'status');
        reportFeedback.setAttribute('aria-live', 'polite');
        sec.querySelector('.report-cards-toolbar').append(reportFeedback);
        const studentSelect = document.createElement('select');
        studentSelect.name = 'studentId';
        studentSelect.required = true;
        studentSelect.setAttribute('aria-label', 'Student');
        const studentLabel = document.createElement('label');
        studentLabel.append('Student *', studentSelect);
        form.querySelector('.report-form-grid').prepend(studentLabel);
        const resultsSection = document.createElement('section');
        resultsSection.className = 'report-form-section report-subject-results';
        resultsSection.innerHTML = '<h4>Exam & Test Results</h4><p class="report-subject-help">These results are loaded from published exam and test marks for the selected student, academic year, and period. Enter marks in the Exam & Test Marks tab; this report uses a snapshot of those published scores.</p><div data-report-subject-rows></div><button class="btn-secondary report-add-subject" type="button" data-report-load-results><i class="fas fa-rotate" aria-hidden="true"></i> Reload published marks</button>';
        form.querySelector('.report-form-section').after(resultsSection);
        const subjectRows = resultsSection.querySelector('[data-report-subject-rows]');
        const studentRecords = [];
        const subjectRecords = [];
        const examResultRecords = [];
        const workflowTabs = document.createElement('nav');
        workflowTabs.className = 'report-workflow-tabs';
        workflowTabs.setAttribute('aria-label', 'Academic results workflow');
        workflowTabs.innerHTML = '<button type="button" data-report-workflow-tab="results" aria-selected="true">Exam & Test Marks</button><button type="button" data-report-workflow-tab="cards" aria-selected="false">Report Cards</button>';
        sec.querySelector('.report-cards-stats').after(workflowTabs);
        const cardsPanel = sec.querySelector('.report-cards-panel');
        cardsPanel.hidden = true;
        const examResultsPanel = document.createElement('section');
        examResultsPanel.className = 'report-exam-results-panel';
        examResultsPanel.hidden = false;
        examResultsPanel.innerHTML = '<div class="report-cards-panel report-exam-entry"><header class="report-exam-heading"><div><h3>Enter marks after marking papers</h3><p>Save one result per student, subject, and exam/test. Draft marks are private. Publish after checking; published marks can then be loaded into a report card.</p></div></header><form data-exam-result-form><input type="hidden" name="recordId"><div class="report-exam-form-grid"><label>Student *<select name="studentId" required></select></label><label>Subject *<select name="subjectId" required></select></label><label>Exam / test name *<input name="assessmentName" required maxlength="100" placeholder="e.g. Term 1 Mathematics paper"></label><label>Type *<select name="assessmentType" required><option value="">Choose type</option><option value="test">Test</option><option value="exam">Examination</option></select></label><label>Exam date<input name="assessmentDate" type="date"></label><label>Academic year *<input name="year" required value="2026/27"></label><label>Term / period *<select name="period" required><option>Term 1</option><option>Term 2</option><option>Term 3</option><option>Semester 1</option><option>Semester 2</option></select></label><label>Maximum marks *<input name="maxMarks" type="number" min="0.01" step="any" required placeholder="100"></label><label>Marks obtained *<input name="obtainedMarks" type="number" min="0" step="any" required placeholder="85"></label><label>Percentage (automatic)<input name="percentage" readonly aria-label="Calculated percentage"></label><label class="report-exam-remarks">Teacher remarks<textarea name="remarks" maxlength="500" rows="2" placeholder="Optional feedback"></textarea></label></div><div class="report-exam-actions"><button class="btn-secondary" type="button" data-exam-save="Draft">Save draft</button><button class="btn-primary" type="button" data-exam-save="Published">Publish result</button><button class="btn-secondary" type="button" data-exam-reset>Clear form</button></div><p class="report-exam-feedback" data-exam-feedback role="status" aria-live="polite"></p></form></div><div class="report-cards-panel report-exam-list"><header class="report-exam-heading"><div><h3>Saved exam and test marks</h3><p>Review drafts and published marks. Select a row to update or publish it.</p></div></header><div class="report-cards-table-wrap"><table><thead><tr><th>Student ID</th><th>Student</th><th>Subject</th><th>Exam / test</th><th>Type</th><th>Period</th><th>Score</th><th>Percentage</th><th>Status</th><th>Actions</th></tr></thead><tbody data-exam-result-rows><tr><td colspan="10" class="report-empty">Loading saved results…</td></tr></tbody></table></div></div>';
        cardsPanel.after(examResultsPanel);
        const examResultForm = examResultsPanel.querySelector('[data-exam-result-form]');
        const examResultRows = examResultsPanel.querySelector('[data-exam-result-rows]');
        const examResultFeedback = examResultsPanel.querySelector('[data-exam-feedback]');
        const getStudentName = student => student.fullName || student.name || student.studentName
            || [student.firstName, student.lastName].filter(Boolean).join(' ') || 'Student';
        const getStudentAdmission = student => String(student.admissionNo || student.admissionNumber
            || student.studentCode || student.id || '');
        const refreshStudentOptions = selectedId => {
            const currentId = selectedId ?? studentSelect.value;
            studentSelect.replaceChildren(new Option(studentRecords.length ? 'Select a student' : 'No student records available', ''));
            studentRecords.forEach(student => {
                const option = new Option(`${getStudentAdmission(student)} — ${getStudentName(student)}`, student.id);
                studentSelect.add(option);
            });
            studentSelect.value = studentRecords.some(student => String(student.id) === String(currentId)) ? currentId : '';
            studentSelect.disabled = !studentRecords.length;
            form.querySelector('[data-report-save]')?.toggleAttribute('disabled', !studentRecords.length);
        };
        const refreshSubjectOptions = (select, selectedName) => {
            select.replaceChildren(new Option(subjectRecords.length ? 'Choose a subject' : 'No school subjects available', ''));
            subjectRecords.forEach(subject => {
                const name = subject.subjectName || subject.name || subject.title || subject.subject || '';
                if (!name) return;
                const option = new Option(name, name);
                option.dataset.subjectId = String(subject.id || subject.subjectId || '');
                select.add(option);
            });
            if (selectedName && ![...select.options].some(option => option.value === selectedName)) {
                select.add(new Option(`${selectedName} (not in subject records)`, selectedName));
            }
            select.value = selectedName || '';
        };
        const refreshExamStudentOptions = selectedId => {
            const select = examResultForm.elements.studentId;
            const currentId = selectedId ?? select.value;
            select.replaceChildren(new Option(studentRecords.length ? 'Choose a student' : 'No students available', ''));
            studentRecords.forEach(student => {
                select.add(new Option(`${getStudentAdmission(student)} — ${getStudentName(student)}`, student.id));
            });
            select.value = studentRecords.some(student => String(student.id) === String(currentId)) ? currentId : '';
        };
        const refreshExamSubjectOptions = selectedId => {
            const select = examResultForm.elements.subjectId;
            const currentId = selectedId ?? select.value;
            select.replaceChildren(new Option(subjectRecords.length ? 'Choose a subject' : 'No school subjects available', ''));
            subjectRecords.forEach(subject => {
                const id = String(subject.id || subject.subjectId || subject.subjectCode || subject.subjectName || subject.name || '');
                const name = subject.subjectName || subject.name || subject.title || subject.subject || '';
                if (id && name) select.add(new Option(name, id));
            });
            select.value = [...select.options].some(option => option.value === String(currentId)) ? String(currentId) : '';
        };
        const renderExamResults = () => {
            const visibleRecords = examResultRecords.filter(record => record.deleted !== true)
                .sort((left, right) => String(right.assessmentDate || '').localeCompare(String(left.assessmentDate || '')));
            examResultRows.innerHTML = visibleRecords.length ? visibleRecords.map(record => {
                const student = studentRecords.find(item => String(item.id) === String(record.studentId));
                return `<tr><td>${escape(record.studentAdmissionNo || record.studentId || '—')}</td><td>${escape(record.studentName || (student && getStudentName(student)) || 'Student')}</td><td>${escape(record.subjectName || '—')}</td><td>${escape(record.assessmentName || '—')}</td><td>${String(record.assessmentType).toLowerCase() === 'exam' ? 'Examination' : 'Test'}</td><td>${escape([record.period, record.year].filter(Boolean).join(' · ') || '—')}</td><td>${escape(record.obtainedMarks ?? '—')} / ${escape(record.maxMarks ?? '—')}</td><td>${Number(record.percentage ?? 0).toFixed(1)}%</td><td><span class="report-status ${escape(String(record.status || 'Draft').toLowerCase())}">${escape(record.status || 'Draft')}</span></td><td><div class="report-row-actions"><button class="icon-button" type="button" data-exam-result-action="edit" data-record-id="${escape(record.id)}" aria-label="Edit marks"><i class="fas fa-pen" aria-hidden="true"></i></button>${String(record.status).toLowerCase() === 'published' ? '' : `<button class="icon-button" type="button" data-exam-result-action="publish" data-record-id="${escape(record.id)}" aria-label="Publish marks"><i class="fas fa-check" aria-hidden="true"></i></button>`}</div></td></tr>`;
            }).join('') : '<tr><td colspan="10" class="report-empty">No exam or test marks entered yet.</td></tr>';
        };
        const clearExamResultForm = () => {
            examResultForm.reset();
            examResultForm.elements.recordId.value = '';
            examResultForm.elements.assessmentDate.value = new Date().toISOString().slice(0, 10);
            examResultForm.elements.year.value = form.elements.year.value || '2026/27';
            examResultForm.elements.period.value = form.elements.period.value || 'Term 1';
            examResultFeedback.textContent = '';
            refreshExamStudentOptions('');
            refreshExamSubjectOptions('');
            updateExamPercentage();
        };
        const updateExamPercentage = () => {
            const maxValue = examResultForm.elements.maxMarks.value;
            const scoreValue = examResultForm.elements.obtainedMarks.value;
            const maximum = Number(maxValue);
            const score = Number(scoreValue);
            examResultForm.elements.percentage.value = maxValue && scoreValue && maximum > 0
                && Number.isFinite(score) && score >= 0 && score <= maximum
                ? `${(score / maximum * 100).toFixed(1)}%`
                : '';
            examResultForm.elements.obtainedMarks.max = maxValue;
        };
        const updateSubjectPercentage = row => {
            const maximumValue = row.querySelector('[data-subject-max]').value;
            const scoreValue = row.querySelector('[data-subject-score]').value;
            const maximum = Number(maximumValue);
            const score = Number(scoreValue);
            const percentage = row.querySelector('[data-subject-percentage]');
            percentage.value = maximumValue !== '' && scoreValue !== ''
                && maximum > 0 && Number.isFinite(score) && score >= 0 && score <= maximum
                ? `${(score / maximum * 100).toFixed(1)}%`
                : '';
        };
        const addSubjectRow = (result = {}) => {
            const row = document.createElement('div');
            row.className = 'report-subject-row';
            row.innerHTML = '<label>Subject<select data-subject-name required></select></label><label>Exam / test name<input type="text" data-assessment-name required maxlength="100" placeholder="e.g. Term 1 Mathematics test"></label><label>Type<select data-assessment-type required><option value="">Choose type</option><option value="test">Test</option><option value="exam">Examination</option></select></label><label>Date<input type="date" data-assessment-date></label><label>Maximum marks<input type="number" data-subject-max required min="0.01" step="any" placeholder="100"></label><label>Marks obtained<input type="number" data-subject-score required min="0" step="any" placeholder="85"></label><label>Percentage (automatic)<input type="text" data-subject-percentage readonly aria-label="Calculated percentage"></label><label>Teacher remarks<input type="text" data-subject-remarks maxlength="300" placeholder="Optional feedback"></label><button class="icon-button" type="button" data-report-remove-subject aria-label="Remove result" title="Remove result"><i class="fas fa-trash" aria-hidden="true"></i></button>';
            const subjectSelect = row.querySelector('[data-subject-name]');
            refreshSubjectOptions(subjectSelect, result.subjectName || result.subject || '');
            subjectSelect.selectedOptions[0]?.setAttribute('data-subject-id', result.subjectId || '');
            row.querySelector('[data-assessment-name]').value = result.assessmentName || result.examName || result.testName || '';
            const savedType = String(result.assessmentType || result.examType || '').toLowerCase();
            row.querySelector('[data-assessment-type]').value = savedType === 'term' ? 'exam' : savedType;
            row.querySelector('[data-assessment-date]').value = result.assessmentDate || result.examDate || '';
            row.querySelector('[data-subject-max]').value = result.maxMarks ?? result.maximumMarks ?? '';
            row.querySelector('[data-subject-score]').value = result.obtainedMarks ?? result.marksObtained ?? result.score ?? '';
            row.querySelector('[data-subject-remarks]').value = result.remarks || result.teacherRemarks || '';
            subjectRows.append(row);
            row.querySelector('[data-subject-score]').max = row.querySelector('[data-subject-max]').value;
            updateSubjectPercentage(row);
        };
        const fillSubjectRows = results => {
            subjectRows.replaceChildren();
            (Array.isArray(results) && results.length ? results : [{}]).forEach(result => {
                addSubjectRow(result);
                const row = subjectRows.lastElementChild;
                row.querySelectorAll('input, select').forEach(input => {
                    if (input.matches('[data-subject-percentage]')) return;
                    if (input.matches('[data-subject-name], [data-assessment-type]')) input.disabled = true;
                    else input.readOnly = true;
                });
                row.querySelector('[data-report-remove-subject]')?.remove();
            });
        };
        const publishedMarksForSelectedStudent = () => {
            const student = selectedStudent();
            if (!student) return [];
            const year = String(form.elements.year.value || '').trim().toLowerCase();
            const period = String(form.elements.period.value || '').trim().toLowerCase();
            return examResultRecords.filter(result =>
                String(result.studentId || '') === String(student.id)
                && ['published', 'released'].includes(String(result.status || result.publicationStatus || '').toLowerCase())
                && result.isPublished !== false && result.published !== false
                && String(result.year || '').trim().toLowerCase() === year
                && String(result.period || '').trim().toLowerCase() === period
            ).map(result => ({
                ...result,
                subjectName: result.subjectName,
                assessmentName: result.assessmentName,
                assessmentType: result.assessmentType,
                assessmentDate: result.assessmentDate,
                maxMarks: result.maxMarks,
                obtainedMarks: result.obtainedMarks,
                percentage: result.percentage,
                remarks: result.remarks,
                status: 'Published',
                publicationStatus: 'Published',
                isPublished: true,
                published: true
            }));
        };
        const loadPublishedMarksIntoReport = () => {
            const marks = publishedMarksForSelectedStudent();
            fillSubjectRows(marks);
            reportFeedback.textContent = marks.length
                ? `Loaded ${marks.length} published exam/test result${marks.length === 1 ? '' : 's'} for this student and period.`
                : 'No published exam/test marks found for this student, academic year, and period.';
        };
        const selectedStudent = () => studentRecords.find(student => String(student.id) === studentSelect.value);
        const collectSubjectResults = status => {
            const rows = [...subjectRows.querySelectorAll('.report-subject-row')];
            if (!rows.length) throw new Error('Add at least one subject result before saving.');
            return rows.map(row => {
                const subjectSelect = row.querySelector('[data-subject-name]');
                const subjectName = subjectSelect.value.trim();
                const assessmentName = row.querySelector('[data-assessment-name]').value.trim();
                const assessmentType = row.querySelector('[data-assessment-type]').value;
                const maxMarks = Number(row.querySelector('[data-subject-max]').value);
                const obtainedMarks = Number(row.querySelector('[data-subject-score]').value);
                if (!subjectName || !assessmentName || !assessmentType || !Number.isFinite(maxMarks) || maxMarks <= 0
                    || !Number.isFinite(obtainedMarks) || obtainedMarks < 0 || obtainedMarks > maxMarks) {
                    throw new Error('For every result, choose a subject and exam/test type, enter its name, and enter marks within the maximum.');
                }
                return {
                    subjectId: subjectSelect.selectedOptions[0]?.dataset.subjectId || '',
                    subjectName,
                    assessmentName,
                    assessmentType,
                    assessmentDate: row.querySelector('[data-assessment-date]').value,
                    maxMarks,
                    obtainedMarks,
                    percentage: obtainedMarks / maxMarks * 100,
                    remarks: row.querySelector('[data-subject-remarks]').value.trim(),
                    status,
                    publicationStatus: status,
                    isPublished: status === 'Published',
                    published: status === 'Published'
                };
            });
        };
        const persistRecords = records => {
            localStorage.setItem(storageKey, JSON.stringify(records));
            render();
        };
        const decorateStudentIds = () => {
            const header = table.closest('table')?.querySelector('thead tr');
            if (header && !header.querySelector('[data-report-student-id-heading]')) {
                const studentHeading = [...header.cells].find(cell => cell.textContent.trim() === 'Student');
                const idHeading = document.createElement('th');
                idHeading.textContent = 'Student ID';
                idHeading.dataset.reportStudentIdHeading = 'true';
                studentHeading?.after(idHeading);
            }
            table.querySelectorAll('tr').forEach(row => {
                if (row.querySelector('[data-report-student-id-cell]')) return;
                const record = read()[Number(row.querySelector('[data-report-action]')?.dataset.index)];
                const studentCell = [...row.cells].find(cell => cell.querySelector('.report-student'));
                if (record && studentCell) {
                    const idCell = document.createElement('td');
                    idCell.textContent = record.studentAdmissionNo || record.studentId || '—';
                    idCell.dataset.reportStudentIdCell = 'true';
                    studentCell.after(idCell);
                } else {
                    const emptyCell = row.querySelector('.report-empty');
                    if (emptyCell) emptyCell.colSpan = 14;
                }
            });
            table.querySelectorAll('[data-report-action]').forEach(button => {
                const labels = { view: 'View report', edit: 'Edit report', publish: 'Publish results', archive: 'Archive report', generate: 'Preview report', print: 'Print report', download: 'Download report' };
                button.setAttribute('aria-label', labels[button.dataset.reportAction] || 'Report action');
            });
        };
        const addReportSubjectControls = new MutationObserver(decorateStudentIds);
        addReportSubjectControls.observe(table, { childList: true });
        decorateStudentIds();
        resultsSection.addEventListener('click', event => {
            if (event.target.closest('[data-report-remove-subject]')) {
                event.target.closest('.report-subject-row')?.remove();
            }
        });
        subjectRows.addEventListener('input', event => {
            const row = event.target.closest('.report-subject-row');
            if (!row) return;
            if (event.target.matches('[data-subject-max]')) {
                row.querySelector('[data-subject-score]').max = event.target.value;
            }
            if (event.target.matches('[data-subject-max], [data-subject-score]')) {
                updateSubjectPercentage(row);
            }
        });
        studentSelect.addEventListener('change', () => {
            const student = selectedStudent();
            if (!student) return;
            const className = student.className || student.class || '';
            if (className) {
                if (![...form.elements.class.options].some(option => option.value === className)) {
                    form.elements.class.add(new Option(className, className));
                }
                form.elements.class.value = className;
            }
            if (student.section) {
                if (![...form.elements.section.options].some(option => option.value === student.section)) {
                    form.elements.section.add(new Option(student.section, student.section));
                }
                form.elements.section.value = student.section;
            }
            const academicYear = student.academicYear || student.year;
            if (academicYear) form.elements.year.value = academicYear;
            loadPublishedMarksIntoReport();
        });
        form.elements.status.addEventListener('change', () => {
            form.elements.publication.value = form.elements.status.value;
        });
        form.elements.publication.addEventListener('change', () => {
            form.elements.status.value = form.elements.publication.value;
        });
        const showReportError = error => {
            reportFeedback.textContent = error?.message || 'Unable to save this report card. Please try again.';
            console.error('Unable to save or load report card data.', error);
        };
        const showExamResultError = error => {
            examResultFeedback.textContent = error?.message || 'Unable to save exam/test marks.';
            console.error('Unable to save or load exam/test marks.', error);
        };
        const saveExamResult = async status => {
            if (!examResultForm.reportValidity()) return;
            const identity = window.schoolPortalData?.getIdentity();
            const student = studentRecords.find(item => String(item.id) === examResultForm.elements.studentId.value);
            const subject = subjectRecords.find(item => String(item.id || item.subjectId || item.subjectCode
                || item.subjectName || item.name) === examResultForm.elements.subjectId.value);
            if (!student || !subject) {
                showExamResultError(new Error('Choose a student and a school subject.'));
                return;
            }
            const maxMarks = Number(examResultForm.elements.maxMarks.value);
            const obtainedMarks = Number(examResultForm.elements.obtainedMarks.value);
            if (!Number.isFinite(maxMarks) || maxMarks <= 0 || !Number.isFinite(obtainedMarks)
                || obtainedMarks < 0 || obtainedMarks > maxMarks) {
                showExamResultError(new Error('Marks obtained must be between zero and the maximum marks.'));
                return;
            }
            const classId = String(student.classId || student.classID || '');
            if (['teacher', 'deputyHeadTeacher'].includes(identity?.role)
                && (!classId || !identity.assignedClassIds?.includes(classId))) {
                showExamResultError(new Error('You can only enter marks for students in your assigned classes.'));
                return;
            }
            const recordId = examResultForm.elements.recordId.value || crypto.randomUUID();
            const existing = examResultRecords.find(record => String(record.id) === recordId) || {};
            const subjectName = subject.subjectName || subject.name || subject.title || subject.subject;
            const record = {
                ...existing,
                id: recordId,
                studentId: String(student.id),
                studentName: getStudentName(student),
                studentAdmissionNo: getStudentAdmission(student),
                classId,
                className: student.className || student.class || '',
                section: student.section || student.sectionName || '',
                subjectId: String(subject.id || subject.subjectId || subject.subjectCode || ''),
                subjectName,
                assessmentName: examResultForm.elements.assessmentName.value.trim(),
                assessmentType: examResultForm.elements.assessmentType.value,
                assessmentDate: examResultForm.elements.assessmentDate.value,
                year: examResultForm.elements.year.value.trim(),
                period: examResultForm.elements.period.value,
                maxMarks,
                obtainedMarks,
                percentage: obtainedMarks / maxMarks * 100,
                remarks: examResultForm.elements.remarks.value.trim(),
                status,
                publicationStatus: status,
                isPublished: status === 'Published',
                published: status === 'Published',
                publishedAt: status === 'Published' ? new Date().toISOString() : existing.publishedAt || ''
            };
            try {
                if (!window.schoolPortalData?.saveRecord) throw new Error('Exam-results cloud saving is unavailable. Reload the page and try again.');
                await window.schoolPortalData.saveRecord('examResults', recordId, record);
                examResultForm.elements.recordId.value = recordId;
                examResultFeedback.textContent = status === 'Published'
                    ? 'Result published. Linked parents and students can now view this mark.'
                    : 'Draft marks saved. They are not visible to parents or students.';
                if (status === 'Published') clearExamResultForm();
            } catch (error) {
                showExamResultError(error);
            }
        };
        examResultsPanel.addEventListener('click', event => {
            const saveButton = event.target.closest('[data-exam-save]');
            if (saveButton) {
                void saveExamResult(saveButton.dataset.examSave);
                return;
            }
            if (event.target.closest('[data-exam-reset]')) {
                clearExamResultForm();
                return;
            }
            const actionButton = event.target.closest('[data-exam-result-action]');
            if (!actionButton) return;
            const record = examResultRecords.find(item => String(item.id) === actionButton.dataset.recordId);
            if (!record) return;
            if (actionButton.dataset.examResultAction === 'edit') {
                examResultForm.elements.recordId.value = record.id;
                refreshExamStudentOptions(record.studentId);
                refreshExamSubjectOptions(record.subjectId || record.subjectName);
                examResultForm.elements.assessmentName.value = record.assessmentName || '';
                examResultForm.elements.assessmentType.value = record.assessmentType || '';
                examResultForm.elements.assessmentDate.value = record.assessmentDate || '';
                examResultForm.elements.year.value = record.year || '';
                examResultForm.elements.period.value = record.period || '';
                examResultForm.elements.maxMarks.value = record.maxMarks ?? '';
                examResultForm.elements.obtainedMarks.value = record.obtainedMarks ?? '';
                examResultForm.elements.remarks.value = record.remarks || '';
                updateExamPercentage();
                examResultForm.elements.assessmentName.focus();
                examResultFeedback.textContent = `Editing ${record.assessmentName || 'saved result'} for ${record.studentName || 'student'}.`;
                return;
            }
            if (actionButton.dataset.examResultAction === 'publish') {
                const published = {
                    ...record,
                    status: 'Published',
                    publicationStatus: 'Published',
                    isPublished: true,
                    published: true,
                    publishedAt: new Date().toISOString()
                };
                void window.schoolPortalData.saveRecord('examResults', record.id, published)
                    .then(() => {
                        examResultFeedback.textContent = 'Result published. Linked parents and students can now view this mark.';
                    })
                    .catch(showExamResultError);
            }
        });
        examResultForm.addEventListener('input', event => {
            if (event.target.matches('[name="maxMarks"], [name="obtainedMarks"]')) updateExamPercentage();
        });
        examResultForm.addEventListener('change', event => {
            if (event.target.matches('[name="studentId"]')) {
                const student = studentRecords.find(item => String(item.id) === event.target.value);
                if (student) {
                    const className = student.className || student.class || '';
                    if (className && ![...form.elements.class.options].some(option => option.value === className)) {
                        form.elements.class.add(new Option(className, className));
                    }
                    if (className) form.elements.class.value = className;
                    if (student.section) form.elements.section.value = student.section;
                }
            }
        });
        workflowTabs.addEventListener('click', event => {
            const tab = event.target.closest('[data-report-workflow-tab]');
            if (!tab) return;
            const showResults = tab.dataset.reportWorkflowTab === 'results';
            cardsPanel.hidden = showResults;
            examResultsPanel.hidden = !showResults;
            workflowTabs.querySelectorAll('[data-report-workflow-tab]').forEach(item => {
                item.setAttribute('aria-selected', String(item === tab));
            });
        });
        form.elements.period.addEventListener('change', loadPublishedMarksIntoReport);
        form.elements.year.addEventListener('change', loadPublishedMarksIntoReport);
        sec.querySelector('[data-report-load-results]').addEventListener('click', loadPublishedMarksIntoReport);
        const canManageExamResults = identity => ['schoolAdmin', 'superAdmin', 'director', 'headTeacher'].includes(identity?.role)
            || identity?.permissions?.examResults?.edit === true
            || ['teacher', 'deputyHeadTeacher'].includes(identity?.role)
                && identity.assignedClassIds?.length > 0
                && identity.permissions?.examResults === undefined;
        if (!canManageExamResults(api?.getIdentity?.())) {
            examResultForm.querySelectorAll('[data-exam-save]').forEach(button => {
                button.disabled = true;
            });
            examResultFeedback.textContent = 'Your account does not have permission to enter exam results. Ask an administrator to enable Exam Results edit access.';
        }
        form.addEventListener('submit', event => {
            event.preventDefault();
            event.stopImmediatePropagation();
            if (!form.reportValidity()) return;
            void (async () => {
                const student = selectedStudent();
                if (!student) {
                    showReportError(new Error('Select a student before saving results.'));
                    return;
                }
                const editIndex = form.elements.editIndex.value;
                const records = read();
                const existing = editIndex === '' ? {} : records[Number(editIndex)];
                const identity = window.schoolPortalData?.getIdentity();
                const classId = String(student.classId || student.classID || existing?.classId || '');
                if (['teacher', 'deputyHeadTeacher'].includes(identity?.role)
                    && (!classId || !identity.assignedClassIds?.includes(classId))) {
                    showReportError(new Error('You can only enter results for a student in one of your assigned classes. Ask an administrator to check the student class and your class assignments.'));
                    return;
                }
                const status = form.elements.publication.value;
                let subjectResults;
                try {
                    subjectResults = collectSubjectResults(status);
                } catch (error) {
                    showReportError(error);
                    return;
                }
                const totalMaximum = subjectResults.reduce((total, result) => total + result.maxMarks, 0);
                const totalScore = subjectResults.reduce((total, result) => total + result.obtainedMarks, 0);
                const reportNo = existing.no || `RC-${new Date().getFullYear()}-${Date.now()}`;
                const record = {
                    ...existing,
                    id: existing.id || reportNo,
                    no: reportNo,
                    studentId: String(student.id),
                    classId,
                    studentAdmissionNo: getStudentAdmission(student),
                    student: getStudentName(student),
                    class: form.elements.class.value || student.className || student.class || '',
                    section: form.elements.section.value || student.section || '',
                    year: form.elements.year.value,
                    period: form.elements.period.value,
                    average: `${(totalScore / totalMaximum * 100).toFixed(1)}%`,
                    grade: existing.grade || '-',
                    gpa: existing.gpa || '—',
                    attendance: existing.attendance || '—',
                    reportName: form.elements.reportName.value,
                    subjectResults,
                    status,
                    publicationStatus: status,
                    isPublished: status === 'Published',
                    published: status === 'Published',
                    publishedAt: status === 'Published' ? new Date().toISOString() : existing.publishedAt || '',
                    generated: formatDate(form.elements.generatedDate.value)
                };
                try {
                    const api = window.schoolPortalData;
                    if (!api?.saveRecord) throw new Error('Report-card cloud saving is unavailable. Reload the page and try again.');
                    await api.saveRecord('reportCards', reportNo, record);
                    if (editIndex === '') records.unshift(record);
                    else records[Number(editIndex)] = record;
                    persistRecords(records);
                    reportFeedback.textContent = status === 'Published'
                        ? 'Results published and available to the linked student and parent.'
                        : 'Report card saved.';
                    modal.classList.add('hidden');
                    form.reset();
                    form.elements.editIndex.value = '';
                    refreshStudentOptions();
                    fillSubjectRows();
                } catch (error) {
                    showReportError(error);
                }
            })();
        }, true);
        table.addEventListener('click', event => {
            const button = event.target.closest('[data-report-action]');
            if (!button) return;
            const index = Number(button.dataset.index);
            const records = read();
            const record = records[index];
            if (!record || !['edit', 'publish', 'view', 'generate', 'print', 'download'].includes(button.dataset.reportAction)) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            if (button.dataset.reportAction === 'edit') {
                openForm(index);
                const student = studentRecords.find(item => String(item.id) === String(record.studentId)
                    || getStudentAdmission(item) === String(record.studentAdmissionNo || record.studentId));
                refreshStudentOptions(student?.id || '');
                studentSelect.value = student?.id || '';
                studentSelect.dispatchEvent(new Event('change'));
                form.elements.reportName.value = record.reportName || 'Student Academic Report Card';
                form.elements.publication.value = record.status || 'Draft';
                form.elements.generatedDate.value = '';
                fillSubjectRows(record.subjectResults);
                return;
            }
            if (button.dataset.reportAction === 'publish') {
                const student = studentRecords.find(item => String(item.id) === String(record.studentId));
                if (!student || !Array.isArray(record.subjectResults) || !record.subjectResults.length) {
                    reportFeedback.textContent = 'Assign this report to a student and enter subject scores before publishing.';
                    openForm(index);
                    refreshStudentOptions(student?.id || '');
                    studentSelect.value = student?.id || '';
                    studentSelect.dispatchEvent(new Event('change'));
                    fillSubjectRows(record.subjectResults);
                    return;
                }
                const published = {
                    ...record,
                    studentId: String(student.id),
                    classId: String(student.classId || student.classID || record.classId || ''),
                    studentAdmissionNo: getStudentAdmission(student),
                    status: 'Published',
                    publicationStatus: 'Published',
                    isPublished: true,
                    published: true,
                    publishedAt: new Date().toISOString(),
                    subjectResults: record.subjectResults.map(result => ({
                        ...result,
                        status: 'Published',
                        publicationStatus: 'Published',
                        isPublished: true,
                        published: true
                    }))
                };
                if (!window.schoolPortalData?.saveRecord) {
                    showReportError(new Error('Report-card cloud saving is unavailable. Reload the page and try again.'));
                    return;
                }
                void window.schoolPortalData.saveRecord('reportCards', published.no, published)
                    .then(() => {
                        records[index] = published;
                        persistRecords(records);
                        reportFeedback.textContent = 'Results published and available to the linked student and parent.';
                    })
                    .catch(showReportError);
                return;
            }
            const showPreview = () => {
                currentIndex = index;
                renderReportPreview(record);
            };
            if (button.dataset.reportAction === 'print') {
                showPreview();
                event.stopPropagation();
                setTimeout(() => window.print(), 150);
            } else if (button.dataset.reportAction === 'download') {
                showPreview();
                event.stopPropagation();
                const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escape(record.no)} Report Card</title></head><body>${sec.querySelector('[data-report-preview-sheet]').innerHTML}</body></html>`;
                const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
                const link = document.createElement('a');
                link.href = url;
                link.download = `${record.no}-Report-Card.html`;
                link.click();
                URL.revokeObjectURL(url);
            } else {
                showPreview();
                event.stopPropagation();
            }
        }, true);
        previewActions.addEventListener('click', event => {
            if (event.target.closest('[data-report-download]')) {
                event.preventDefault();
                event.stopImmediatePropagation();
                const record = read()[currentIndex];
                if (!record) return;
                const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escape(record.no)} Report Card</title></head><body>${sec.querySelector('[data-report-preview-sheet]').innerHTML}</body></html>`;
                const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
                const link = document.createElement('a');
                link.href = url;
                link.download = `${record.no}-Report-Card.html`;
                link.click();
                URL.revokeObjectURL(url);
            }
        }, true);
        form.querySelector('[type="submit"]').dataset.reportSave = 'true';
        if (api?.subscribe) {
            Promise.all([
                api.subscribe('students', records => {
                    studentRecords.splice(0, studentRecords.length, ...records.filter(student => student.deleted !== true));
                    refreshStudentOptions();
                    refreshExamStudentOptions();
                    renderExamResults();
                }),
                api.subscribe('subjects', records => {
                    subjectRecords.splice(0, subjectRecords.length, ...records.filter(subject => subject.deleted !== true
                        && String(subject.status || 'active').toLowerCase() !== 'inactive'));
                    subjectRows.querySelectorAll('[data-subject-name]').forEach(select => {
                        refreshSubjectOptions(select, select.value);
                    });
                    refreshExamSubjectOptions();
                    if (!subjectRecords.length) {
                        reportFeedback.textContent = 'No school subjects were found. Add subjects in the school subject records before entering marks.';
                    }
                }),
                api.subscribe('examResults', records => {
                    examResultRecords.splice(0, examResultRecords.length, ...records.filter(record => record.deleted !== true));
                    renderExamResults();
                    render();
                    if (!modal.classList.contains('hidden') && studentSelect.value) loadPublishedMarksIntoReport();
                }),
                api.subscribe('reportCards', records => {
                    const visibleRecords = records.filter(record => record.deleted !== true).map(record => {
                        const { _syncState, ...visibleRecord } = record;
                        return visibleRecord;
                    });
                    localStorage.setItem(storageKey, JSON.stringify(visibleRecords));
                    render();
                })
            ]).catch(showReportError);
        } else {
            showReportError(new Error('School records are unavailable. Reload the page and try again.'));
        }
        refreshStudentOptions('');
        fillSubjectRows();
        render(); return sec;
    }

    function createReportsModule(category) {
        const sec = document.createElement('section');
        sec.className = 'module enquiries-module reports-module';
        sec.id = 'module_front_office_reports';
        sec.innerHTML = `
            <div class="module-header"><div><h2>Front Office Reports & Analytics</h2><p>Department: ${category}</p></div><button class="btn-primary" type="button" data-report-export><i class="fas fa-file-export"></i> Export Report</button></div>
            <div class="report-filter-bar"><label>Report Period <select data-report-period><option value="today">Today</option><option value="week" selected>This Week</option><option value="month">This Month</option><option value="all">All Records</option></select></label><button class="btn-primary" type="button" data-report-apply><i class="fas fa-filter"></i> Apply Filters</button></div>
            <div class="report-kpis"><div class="report-kpi"><span>Enquiries</span><strong data-report-kpi="enquiries">0</strong><i class="fas fa-inbox" aria-hidden="true"></i></div><div class="report-kpi"><span>Calls</span><strong data-report-kpi="calls">0</strong><i class="fas fa-phone" aria-hidden="true"></i></div><div class="report-kpi"><span>Visitors</span><strong data-report-kpi="visitors">0</strong><i class="fas fa-user-group" aria-hidden="true"></i></div><div class="report-kpi"><span>Appointments</span><strong data-report-kpi="appointments">0</strong><i class="fas fa-calendar-check" aria-hidden="true"></i></div><div class="report-kpi"><span>Follow-ups</span><strong data-report-kpi="followups">0</strong><i class="fas fa-list-check" aria-hidden="true"></i></div><div class="report-kpi"><span>Dispatch</span><strong data-report-kpi="dispatch">0</strong><i class="fas fa-truck-fast" aria-hidden="true"></i></div><div class="report-kpi"><span>Incoming Mail</span><strong data-report-kpi="mail">0</strong><i class="fas fa-envelope-open-text" aria-hidden="true"></i></div></div>
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
        render(); addFrontOfficeStatIcons(sec); return sec;
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
        render(); addFrontOfficeStatIcons(sec); return sec;
    }

    function createAppointmentsModule(category) {
        const sec = document.createElement('section');
        sec.className = 'module enquiries-module appointments-module';
        sec.id = 'module_appointments';
        sec.innerHTML = `
            <div class="module-header"><div><h2>Appointments</h2><p>Department: ${category}</p></div><button class="btn-secondary" type="button" data-enquiry-new><i class="fas fa-plus"></i> New Appointment</button></div>
            <div class="enquiries-stats appointment-workflow-stats">
                <div class="enquiry-stat"><span>Today's Appointments</span><strong data-appointment-today>0</strong></div><div class="enquiry-stat"><span>Requested</span><strong data-appointment-requested>0</strong></div><div class="enquiry-stat"><span>Confirmed</span><strong data-appointment-confirmed>0</strong></div><div class="enquiry-stat"><span>Checked In</span><strong data-appointment-checked>0</strong></div><div class="enquiry-stat"><span>Completed</span><strong data-appointment-completed>0</strong></div><div class="enquiry-stat"><span>Cancelled / No Show</span><strong data-appointment-cancelled>0</strong></div>
            </div>
            <div class="enquiries-grid">
                <div class="enquiry-card enquiry-entry-card hidden"><div class="enquiry-card-header"><h3>Appointment Registration</h3><p>Schedule a meeting, visit, or school appointment.</p></div><div class="enquiry-card-body"><form data-enquiry-form>
                    <div class="enquiry-form-grid">
                        <div class="enquiry-form-group"><label>Appointment ID</label><input name="appointmentId" readonly></div><div class="enquiry-form-group"><label>Linked Enquiry</label><input name="enquiryId" readonly placeholder="Standalone appointment"></div><div class="enquiry-form-group"><label>Appointment Type</label><select name="appointmentType" required><option value="">Select appointment type</option><option>Parent Meeting</option><option>Admission Meeting</option><option>Principal Meeting</option><option>Teacher Meeting</option><option>Student Meeting</option><option>Staff Meeting</option><option>Vendor / Supplier</option><option>Government / Official</option><option>Counselling</option><option>Other</option></select></div>
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
        const readEntries = () => { try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch (error) { return []; } }; const escape = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char])); const today = () => new Date().toISOString().slice(0, 10); const nextId = () => `APT-${new Date().getFullYear()}-${String(readEntries().length + 1).padStart(5, '0')}`; const appointmentStatuses = ['Requested','Confirmed','Checked In','In Progress','Completed','Cancelled','No Show','Rescheduled'];
        form.elements.status.innerHTML = appointmentStatuses.map(status => `<option>${status}</option>`).join('');
        const currentActor = () => { try { const session = JSON.parse(localStorage.getItem('edumasterAdminSession')) || {}; return session.name || session.userId || session.role || 'Front Desk'; } catch (error) { return 'Front Desk'; } };
        const syncLinkedEnquiry = appointment => {
            if (!appointment.enquiryId) return;
            try {
                const enquiries = JSON.parse(localStorage.getItem('edumasterEnquiries')) || [];
                const enquiry = enquiries.find(item => String(item.id) === String(appointment.enquiryId));
                if (!enquiry) return;
                enquiry.appointmentId = appointment.appointmentId;
                enquiry.appointmentStatus = appointment.status;
                enquiry.appointmentDate = appointment.appointmentDate;
                enquiry.updatedAt = new Date().toISOString();
                localStorage.setItem('edumasterEnquiries', JSON.stringify(enquiries));
                window.dispatchEvent(new CustomEvent('school:enquiry-updated'));
            } catch (error) {}
        };
        const recordStatus = (entry, status) => { const at = new Date().toISOString(); entry.status = status; entry.updatedAt = at; entry.statusHistory = Array.isArray(entry.statusHistory) ? entry.statusHistory : []; entry.statusHistory.push({ status, by: currentActor(), at }); if (status === 'Checked In') entry.checkedInAt = at; if (status === 'Completed') entry.completedAt = at; if (status === 'Cancelled') entry.cancelledAt = at; if (status === 'No Show') entry.noShowAt = at; syncLinkedEnquiry(entry); return entry; };
        const updateStats = () => {
            const allEntries = readEntries();
            const todayEntries = allEntries.filter(entry => entry.appointmentDate === today());
            sec.querySelector('[data-appointment-today]').textContent = todayEntries.length;
            sec.querySelector('[data-appointment-requested]').textContent = allEntries.filter(entry => ['Requested', 'Scheduled'].includes(entry.status)).length;
            sec.querySelector('[data-appointment-confirmed]').textContent = allEntries.filter(entry => entry.status === 'Confirmed').length;
            sec.querySelector('[data-appointment-checked]').textContent = allEntries.filter(entry => ['Checked In', 'In Progress'].includes(entry.status)).length;
            sec.querySelector('[data-appointment-completed]').textContent = allEntries.filter(entry => entry.status === 'Completed').length;
            sec.querySelector('[data-appointment-cancelled]').textContent = allEntries.filter(entry => ['Cancelled', 'No Show'].includes(entry.status)).length;
        };
        const render = () => {
            const entries = readEntries();
            updateStats();
            const actionButton = (index, action, icon, label) => `<button class="enquiry-action appointment-action" type="button" data-enquiry-action="${action}" data-enquiry-index="${index}" title="${label}" aria-label="${label} appointment"><i class="fas ${icon}"></i></button>`;
            table.innerHTML = entries.length ? entries.map((entry, index) => {
                const history = Array.isArray(entry.statusHistory) ? entry.statusHistory : [];
                const lastChange = history[history.length - 1];
                const historyLabel = lastChange ? `${escape(lastChange.by || 'Staff')} · ${escape(lastChange.at ? new Date(lastChange.at).toLocaleString() : '')}` : '';
                let actions = '';
                if (['Requested', 'Scheduled', 'Rescheduled'].includes(entry.status)) actions += actionButton(index, 'confirm', 'fa-circle-check', 'Confirm appointment');
                if (entry.status === 'Confirmed') actions += actionButton(index, 'checkin', 'fa-right-to-bracket', 'Check in');
                if (entry.status === 'Checked In') actions += actionButton(index, 'start-meeting', 'fa-play', 'Start meeting');
                if (['Checked In', 'In Progress'].includes(entry.status)) actions += actionButton(index, 'complete', 'fa-flag-checkered', 'Complete appointment');
                if (['Requested', 'Scheduled', 'Confirmed', 'Rescheduled'].includes(entry.status)) actions += actionButton(index, 'reschedule', 'fa-calendar-days', 'Reschedule');
                if (entry.status === 'Confirmed') actions += actionButton(index, 'no-show', 'fa-user-xmark', 'Mark no show');
                if (!['Completed', 'Cancelled', 'No Show'].includes(entry.status)) actions += actionButton(index, 'cancel', 'fa-xmark', 'Cancel');
                actions += actionButton(index, 'edit', 'fa-pen', 'Edit') + actionButton(index, 'delete', 'fa-trash', 'Delete') + actionButton(index, 'print', 'fa-print', 'Print');
                return `<tr><td>${escape(entry.appointmentId)}${entry.enquiryId ? `<br><small>Enquiry ${escape(entry.enquiryId)}</small>` : ''}</td><td>${escape(entry.guestName)}<br><small>${escape(entry.phone)}</small></td><td>${escape(entry.appointmentType)}</td><td>${escape(entry.appointmentDate)}</td><td>${escape(entry.appointmentTime)}</td><td>${escape(entry.personToVisit)}</td><td>${escape(entry.department)}</td><td>${escape(entry.priority)}</td><td><span class="appointment-status-badge status-${escape(String(entry.status || 'Requested').toLowerCase().replace(/[^a-z]+/g, '-'))}">${escape(entry.status || 'Requested')}</span><small class="enquiry-status-meta">${historyLabel}</small></td><td><div class="enquiry-actions">${actions}</div></td></tr>`;
            }).join('') : '<tr><td colspan="10" style="text-align:center;padding:25px;color:#94a3b8;">No appointments yet. Open New Appointment to create a request.</td></tr>';
        };
        const updateSummary = () => form.querySelectorAll('[name]').forEach(field => { const summary = sec.querySelector(`[data-summary="${field.name}"]`); if (summary) summary.textContent = field.value || (field.name === 'status' ? 'Requested' : '-'); });
        const closeForm = () => { entryCard.classList.add('hidden'); summaryCard.classList.add('hidden'); form.reset(); editingIndex = null; updateSummary(); };
        const openForm = () => {
            entryCard.classList.remove('hidden');
            summaryCard.classList.remove('hidden');
            if (editingIndex === null) {
                form.reset();
                form.elements.appointmentId.value = nextId();
                form.elements.appointmentDate.value = today();
                form.elements.appointmentTime.value = '09:00';
                form.elements.duration.value = '30 minutes';
                form.elements.guestCount.value = 1;
                form.elements.status.value = 'Requested';
                form.elements.confirmationMethod.value = 'Not Confirmed';
                form.elements.createdBy.value = currentActor();
                const request = window.pendingAppointmentRequest;
                if (request) {
                    form.elements.enquiryId.value = request.enquiryId || '';
                    form.elements.appointmentType.value = 'Other';
                    form.elements.appointmentDate.value = request.appointmentDate || today();
                    form.elements.guestName.value = request.name || '';
                    const requestedVisitorType = request.visitorType || 'Other';
                    const visitorTypes = [...form.elements.visitorType.options].map(option => option.value);
                    form.elements.visitorType.value = visitorTypes.includes(requestedVisitorType) ? requestedVisitorType : requestedVisitorType.toLowerCase().includes('parent') ? 'Parent / Guardian' : requestedVisitorType.toLowerCase().includes('staff') ? 'Staff' : requestedVisitorType.toLowerCase().includes('guest') ? 'Guest / VIP' : 'Other';
                    form.elements.phone.value = request.mobile || '';
                    form.elements.relatedId.value = request.studentId || '';
                    form.elements.personToVisit.value = request.department || 'Principal';
                    form.elements.department.value = request.department || 'Reception';
                    form.elements.purpose.value = request.purpose || 'Follow-up from enquiry';
                    form.elements.notes.value = request.notes || '';
                    form.elements.priority.value = request.priority === 'Urgent' ? 'VIP' : request.priority === 'Important' ? 'High' : 'Normal';
                    window.pendingAppointmentRequest = null;
                } else {
                    form.elements.enquiryId.value = '';
                }
            }
            updateSummary();
            form.elements.appointmentType.focus();
        };
        form.addEventListener('input', updateSummary);
        form.addEventListener('change', updateSummary);
        form.addEventListener('reset', () => setTimeout(updateSummary));
        form.addEventListener('submit', event => {
            event.preventDefault();
            if (!form.checkValidity()) { form.reportValidity(); return; }
            const data = Object.fromEntries(new FormData(form).entries());
            const entries = readEntries();
            const existing = editingIndex === null ? null : entries[editingIndex];
            const timestamp = new Date().toISOString();
            data.id = existing?.id || data.id || Date.now().toString();
            data.createdAt = existing?.createdAt || timestamp;
            data.updatedAt = timestamp;
            data.status = existing ? (data.status || existing.status) : 'Requested';
            data.statusHistory = Array.isArray(existing?.statusHistory) ? existing.statusHistory : existing ? [{ status: existing.status || 'Requested', by: existing.createdBy || 'Front Desk', at: existing.createdAt || timestamp }] : [];
            if (!existing) data.statusHistory.push({ status: 'Requested', by: currentActor(), at: timestamp });
            else if (data.status !== existing.status) data.statusHistory.push({ status: data.status, by: currentActor(), at: timestamp });
            if (existing && (data.appointmentDate !== existing.appointmentDate || data.appointmentTime !== existing.appointmentTime)) {
                data.rescheduleHistory = Array.isArray(existing.rescheduleHistory) ? existing.rescheduleHistory : [];
                data.rescheduleHistory.push({ fromDate: existing.appointmentDate, fromTime: existing.appointmentTime, toDate: data.appointmentDate, toTime: data.appointmentTime, by: currentActor(), at: timestamp });
                if (data.status !== 'Rescheduled' && !['Cancelled', 'Completed'].includes(data.status)) {
                    data.status = 'Rescheduled';
                    data.statusHistory.push({ status: 'Rescheduled', by: currentActor(), at: timestamp });
                }
            }
            syncLinkedEnquiry(data);
            if (existing) entries[editingIndex] = data;
            else entries.unshift(data);
            localStorage.setItem(storageKey, JSON.stringify(entries));
            closeForm();
            render();
        });
        sec.querySelector('[data-enquiry-new]').addEventListener('click', () => entryCard.classList.contains('hidden') ? openForm() : closeForm());
        sec.querySelector('[data-enquiry-cancel]').addEventListener('click', closeForm);
        table.addEventListener('click', event => {
            const button = event.target.closest('[data-enquiry-action]');
            if (!button) return;
            const entries = readEntries();
            const index = Number(button.dataset.enquiryIndex);
            const entry = entries[index];
            if (!entry) return;
            const action = button.dataset.enquiryAction;
            if (action === 'delete') {
                if (!confirm(`Delete appointment ${entry.appointmentId || ''}?`)) return;
                entries.splice(index, 1);
                localStorage.setItem(storageKey, JSON.stringify(entries));
                render();
                return;
            }
            if (action === 'edit' || action === 'reschedule') {
                Object.entries(entry).forEach(([name, value]) => { if (form.elements[name]) form.elements[name].value = value; });
                editingIndex = index;
                if (action === 'reschedule') form.elements.status.value = 'Rescheduled';
                openForm();
                return;
            }
            const nextStatus = { confirm: 'Confirmed', checkin: 'Checked In', 'start-meeting': 'In Progress', complete: 'Completed', cancel: 'Cancelled', 'no-show': 'No Show' }[action];
            if (nextStatus) {
                if (['Cancelled', 'No Show'].includes(nextStatus) && !confirm(`${nextStatus === 'No Show' ? 'Mark' : 'Cancel'} appointment ${entry.appointmentId || ''} as ${nextStatus}?`)) return;
                recordStatus(entry, nextStatus);
                entries[index] = entry;
                localStorage.setItem(storageKey, JSON.stringify(entries));
                render();
                return;
            }
            const printWindow = window.open('', '_blank', 'width=700,height=700');
            if (!printWindow) return;
            printWindow.document.write(`<html><head><title>Appointment Record</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#172033}h1{font-size:22px;border-bottom:2px solid #4f46e5;padding-bottom:10px}.row{padding:9px 0;border-bottom:1px solid #e2e8f0}.label{font-weight:bold;display:inline-block;width:180px}</style></head><body><h1>Appointment Record</h1>${Object.entries(entry).filter(([name]) => name !== 'id' && name !== 'statusHistory' && name !== 'rescheduleHistory').map(([name, value]) => `<div class="row"><span class="label">${escape(name)}</span>${escape(value || '-')}</div>`).join('')}<h2>Status history</h2>${(entry.statusHistory || []).map(item => `<div class="row"><span class="label">${escape(item.status)}</span>${escape(item.by)} · ${escape(item.at)}</div>`).join('')}</body></html>`);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        });
        render(); addFrontOfficeStatIcons(sec); return sec;
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
                <aside class="enquiry-card enquiry-summary-card hidden"><div class="enquiry-card-header"><h3>Visitor Summary</h3><p>Full registration preview.</p></div><div class="enquiry-card-body enquiry-summary" data-visitor-summary-list></div></aside>
            </div>
            <div class="enquiries-table"><div class="table-card"><h3 class="table-title">Visitor Register</h3><table><thead><tr><th>Visitor ID</th><th>Visitor</th><th>Type</th><th>Visiting</th><th>Department</th><th>Visit Date</th><th>Check-in</th><th>Check-out</th><th>Status</th><th>Actions</th></tr></thead><tbody data-enquiry-table></tbody></table></div></div>`;
        const form = sec.querySelector('[data-enquiry-form]'); const table = sec.querySelector('[data-enquiry-table]'); const entryCard = sec.querySelector('.enquiry-entry-card'); const summaryCard = sec.querySelector('.enquiry-summary-card'); const storageKey = 'edumasterVisitors'; let editingIndex = null;
        const readEntries = () => { try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch (error) { return []; } }; const escape = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char])); const today = () => new Date().toISOString().slice(0, 10); const nextId = () => `VIS-${new Date().getFullYear()}-${String(readEntries().length + 1).padStart(5, '0')}`;
        const updateStats = () => { const entries = readEntries().filter(entry => entry.visitDate === today()); sec.querySelector('[data-visitor-today]').textContent = entries.length; sec.querySelector('[data-visitor-inside]').textContent = entries.filter(entry => entry.status === 'Checked In').length; sec.querySelector('[data-visitor-expected]').textContent = entries.filter(entry => entry.status === 'Expected').length; sec.querySelector('[data-visitor-out]').textContent = entries.filter(entry => entry.status === 'Checked Out').length; sec.querySelector('[data-visitor-active]').textContent = entries.filter(entry => ['Checked In', 'In Meeting'].includes(entry.status)).length; };
        const render = () => { const entries = readEntries(); updateStats(); table.innerHTML = entries.length ? entries.map((entry, index) => `<tr><td>${escape(entry.visitorId)}</td><td>${escape(entry.visitorName)}<br><small>${escape(entry.phone)}</small></td><td>${escape(entry.visitorType)}</td><td>${escape(entry.personToVisit)}</td><td>${escape(entry.department)}</td><td>${escape(entry.visitDate)}</td><td>${escape(entry.checkInTime || '-')}</td><td>${escape(entry.checkOutTime || '-')}</td><td><span class="badge pending">${escape(entry.status)}</span></td><td><div class="enquiry-actions"><button class="enquiry-action" type="button" data-enquiry-action="edit" data-enquiry-index="${index}" title="Edit"><i class="fas fa-pen"></i></button><button class="enquiry-action" type="button" data-enquiry-action="delete" data-enquiry-index="${index}" title="Delete"><i class="fas fa-trash"></i></button><button class="enquiry-action" type="button" data-enquiry-action="checkout" data-enquiry-index="${index}" title="Check out"><i class="fas fa-door-open"></i></button><button class="enquiry-action" type="button" data-enquiry-action="print" data-enquiry-index="${index}" title="Print"><i class="fas fa-print"></i></button></div></td></tr>`).join('') : '<tr><td colspan="10" style="text-align:center;padding:25px;color:#94a3b8;">No visitor records yet. Open New Visitor to create a record.</td></tr>'; };
        const updateSummary = () => { sec.querySelector('[data-visitor-summary-list]').innerHTML = Array.from(form.querySelectorAll('[name]')).map(field => { const label = field.closest('.enquiry-form-group')?.querySelector('label')?.textContent.trim() || field.name; const value = field.value.trim() || (field.name === 'status' ? 'Expected' : '-'); return `<div class="enquiry-summary-row"><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`; }).join(''); }; const closeForm = () => { entryCard.classList.add('hidden'); summaryCard.classList.add('hidden'); form.reset(); editingIndex = null; updateSummary(); }; const openForm = () => { entryCard.classList.remove('hidden'); summaryCard.classList.remove('hidden'); if (editingIndex === null) { form.reset(); form.elements.visitorId.value = nextId(); form.elements.visitDate.value = today(); form.elements.companions.value = 0; form.elements.securityClearance.value = 'Not Required'; } updateSummary(); form.elements.visitorType.focus(); };
        form.addEventListener('input', updateSummary); form.addEventListener('change', updateSummary); form.addEventListener('reset', () => setTimeout(updateSummary)); form.addEventListener('submit', event => { event.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; } const data = Object.fromEntries(new FormData(form).entries()); data.id = data.id || Date.now().toString(); data.createdAt = new Date().toISOString(); const entries = readEntries(); if (editingIndex === null) entries.unshift(data); else { data.id = entries[editingIndex].id || data.id; data.createdAt = entries[editingIndex].createdAt || data.createdAt; entries[editingIndex] = data; } localStorage.setItem(storageKey, JSON.stringify(entries)); closeForm(); render(); });
        sec.querySelector('[data-enquiry-new]').addEventListener('click', () => entryCard.classList.contains('hidden') ? openForm() : closeForm()); sec.querySelector('[data-enquiry-cancel]').addEventListener('click', closeForm);
        table.addEventListener('click', event => { const button = event.target.closest('[data-enquiry-action]'); if (!button) return; const entries = readEntries(); const index = Number(button.dataset.enquiryIndex); const entry = entries[index]; if (!entry) return; if (button.dataset.enquiryAction === 'delete') { if (!confirm(`Delete visitor ${entry.visitorName || ''}?`)) return; entries.splice(index, 1); localStorage.setItem(storageKey, JSON.stringify(entries)); render(); return; } if (button.dataset.enquiryAction === 'checkout') { entry.status = 'Checked Out'; entry.checkOutTime = new Date().toTimeString().slice(0, 5); localStorage.setItem(storageKey, JSON.stringify(entries)); render(); return; } if (button.dataset.enquiryAction === 'edit') { Object.entries(entry).forEach(([name, value]) => { if (form.elements[name]) form.elements[name].value = value; }); editingIndex = index; openForm(); return; } const printWindow = window.open('', '_blank', 'width=700,height=700'); if (!printWindow) return; printWindow.document.write(`<html><head><title>Visitor Record</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#172033}h1{font-size:22px;border-bottom:2px solid #4f46e5;padding-bottom:10px}.row{padding:9px 0;border-bottom:1px solid #e2e8f0}.label{font-weight:bold;display:inline-block;width:170px}</style></head><body><h1>Visitor Record</h1>${Object.entries(entry).filter(([name]) => name !== 'id').map(([name, value]) => `<div class="row"><span class="label">${escape(name)}</span>${escape(value || '-')}</div>`).join('')}</body></html>`); printWindow.document.close(); printWindow.focus(); printWindow.print(); });
        render(); addFrontOfficeStatIcons(sec); return sec;
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
        addFrontOfficeStatIcons(sec);
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
        addFrontOfficeStatIcons(sec);
        return sec;
    }

    const rolePresets = {
        'Super Admin': { sections: null, perms: { view: true, edit: true, delete: true } },
        Administrator: { sections: null, perms: { view: true, edit: true, delete: true } },
        Director: { sections: null, perms: { view: true, edit: true, delete: true } },
        'Head Teacher': { sections: null, perms: { view: true, edit: true, delete: false } },
        'Deputy Head Teacher': { sections: ['Main', 'Front Office Department', 'Academic Department', 'E-Learning Department', 'Student Life Department'], perms: { view: true, edit: true, delete: false } },
        Bursar: { sections: ['Main', 'Finance Department', 'Payroll Department'], perms: { view: true, edit: true, delete: false } },
        Teacher: { sections: ['Main', 'Academic Department', 'E-Learning Department', 'Student Life Department'], perms: { view: true, edit: true, delete: false } },
        Librarian: { sections: ['Main', 'Academic Department', 'E-Learning Department', 'Student Life Department'], perms: { view: true, edit: true, delete: false } },
        'HR Officer': { sections: ['Main', 'Human Resources Department', 'Payroll Department'], perms: { view: true, edit: true, delete: false } },
        'Store Manager': { sections: ['Main', 'Operations Department', 'Procurement Department', 'Assets & Security Department'], perms: { view: true, edit: true, delete: false } },
        Parent: {
            sections: parentRecommendedSectionGrants,
            perms: { view: true, edit: false, delete: false }
        },
        Student: { sections: ['Main', 'Academic Department', 'E-Learning Department', 'Student Life Department', 'Communication Department'], perms: { view: true, edit: false, delete: false } }
    };

    function populateRoleOptions(){
        const roles = ['Deputy Head Teacher', 'Bursar', 'Teacher', 'Librarian', 'HR Officer', 'Store Manager', 'Parent', 'Student'];
        if (loadSession()?.user?.role === 'schoolAdmin') roles.unshift('School Admin');
        roleSelectEl.innerHTML = '';
        roles.forEach(r => {
            const opt = document.createElement('option'); opt.value = r; opt.textContent = r; roleSelectEl.appendChild(opt);
        });
    }

    function applyRoleDefaults(role){
        if (role === 'School Admin') {
            const sectionCheckboxes = Array.from(sectionsContainerEl.querySelectorAll('input[type="checkbox"][value]'));
            sectionCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
                checkbox.dispatchEvent(new Event('change'));
            });
            const selectAllSections = sectionsContainerEl.querySelector('#selectAllSections');
            if (selectAllSections) selectAllSections.checked = false;
            return;
        }
        const preset = rolePresets[role] || rolePresets.Teacher;
        const sectionCheckboxes = Array.from(sectionsContainerEl.querySelectorAll('input[type="checkbox"][value]'));
        const selectedSections = new Set(preset.sections || []);
        sectionCheckboxes.forEach(checkbox => {
            const department = checkbox.dataset.sectionDepartment;
            const legacyDepartmentMatch = department && preset.sections?.some(section =>
                normalizeSectionKey(section) === normalizeSectionKey(checkbox.dataset.departmentLabel || '')
            );
            checkbox.checked = preset.sections === null
                || selectedSections.has(checkbox.value)
                || Boolean(legacyDepartmentMatch);
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        });
        const selectAllSections = sectionsContainerEl.querySelector('#selectAllSections');
        if (selectAllSections) selectAllSections.checked = sectionCheckboxes.length > 0 && sectionCheckboxes.every(checkbox => checkbox.checked);
        Object.entries(preset.perms).forEach(([permission, checked]) => {
            const checkbox = document.getElementById(`can${permission[0].toUpperCase()}${permission.slice(1)}`);
            if (checkbox) {
                checkbox.checked = checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
        const selectAllPermissions = document.getElementById('selectAllPermissions');
        if (selectAllPermissions) selectAllPermissions.checked = Object.values(preset.perms).every(Boolean);
    }

    function populateSectionsList(){
        if (!sectionsContainerEl) return;
        sectionsContainerEl.innerHTML = '';

        const grantsContainer = document.createElement('div');
        grantsContainer.className = 'section-access-grants';
        const groups = Array.from(document.querySelectorAll('.sidebar > .menu-title')).map(title => {
            const nav = title.nextElementSibling;
            if (!nav?.classList.contains('nav-links')) return null;
            const name = title.dataset.accessSection || title.innerText.trim();
            const links = Array.from(nav.querySelectorAll(':scope > li:not([hidden]) > a:not([data-portal-admin-only])')).map(link => ({
                link,
                label: (link.querySelector('.menu-item-label, span:not(.menu-item-icon)')?.textContent || link.textContent).trim()
            })).filter(item => item.label);
            return links.length ? { title, name, links } : null;
        }).filter(Boolean);

        const selectAllLabel = document.createElement('label');
        selectAllLabel.className = 'section-access-select-all';
        const selectAll = document.createElement('input');
        selectAll.type = 'checkbox';
        selectAll.id = 'selectAllSections';
        selectAllLabel.append(selectAll, document.createTextNode(' Select all departments and modules'));
        const selectionSummary = document.createElement('span');
        selectionSummary.id = 'sectionAccessSummary';
        selectionSummary.className = 'section-access-summary';
        selectionSummary.setAttribute('aria-live', 'polite');
        const sectionToolbar = document.createElement('div');
        sectionToolbar.className = 'section-access-toolbar';
        sectionToolbar.append(selectAllLabel, selectionSummary);
        const sectionHeading = document.createElement('div');
        sectionHeading.className = 'section-access-heading';
        sectionHeading.innerHTML = '<div><h4>Portal navigation access</h4><p>Choose which areas this account can open. These settings do not replace record-level data permissions.</p></div>';
        sectionsContainerEl.append(sectionHeading, sectionToolbar);
        const accessHelp = document.createElement('p');
        accessHelp.className = 'section-access-help';
        accessHelp.textContent = 'Select a department to grant all its modules, or expand your selection by choosing individual modules.';
        accessHelp.dataset.defaultHelp = accessHelp.textContent;
        sectionsContainerEl.appendChild(accessHelp);

        groups.forEach(({ title, name, links }, groupIndex) => {
            const departmentKey = sectionDepartmentKey(title);
            const groupCard = document.createElement('fieldset');
            groupCard.className = 'section-access-group';
            const legend = document.createElement('legend');
            const departmentLabel = document.createElement('label');
            departmentLabel.className = 'section-access-department';
            const departmentCheckbox = document.createElement('input');
            departmentCheckbox.type = 'checkbox';
            departmentCheckbox.value = departmentKey;
            departmentCheckbox.dataset.sectionGrant = 'department';
            departmentCheckbox.dataset.sectionDepartment = departmentKey;
            departmentCheckbox.dataset.departmentLabel = name;
            departmentCheckbox.id = `section_department_${groupIndex}`;
            departmentLabel.append(departmentCheckbox, document.createTextNode(` ${name} (all modules)`));
            legend.append(departmentLabel);
            groupCard.append(legend);

            const modules = document.createElement('div');
            modules.className = 'section-access-modules';
            links.forEach(({ link, label }, linkIndex) => {
                const moduleLabel = document.createElement('label');
                moduleLabel.className = 'section-access-module';
                const moduleCheckbox = document.createElement('input');
                moduleCheckbox.type = 'checkbox';
                moduleCheckbox.value = sectionModuleKey(title, link);
                moduleCheckbox.dataset.sectionGrant = 'module';
                moduleCheckbox.dataset.sectionDepartment = departmentKey;
                moduleCheckbox.dataset.departmentLabel = name;
                moduleCheckbox.id = `section_module_${groupIndex}_${linkIndex}`;
                const icon = link.querySelector('i')?.cloneNode(true);
                moduleLabel.append(moduleCheckbox);
                if (icon) moduleLabel.append(icon);
                moduleLabel.append(document.createTextNode(` ${label}`));
                modules.appendChild(moduleLabel);
            });
            const moduleCount = document.createElement('span');
            moduleCount.className = 'section-access-module-count';
            moduleCount.textContent = `${links.length} ${links.length === 1 ? 'module' : 'modules'}`;
            legend.appendChild(moduleCount);
            groupCard.appendChild(modules);

            departmentCheckbox.addEventListener('change', () => {
                modules.querySelectorAll('input[data-section-grant="module"]').forEach(checkbox => {
                    checkbox.checked = departmentCheckbox.checked;
                });
                updateSelectAll();
            });
            modules.addEventListener('change', event => {
                if (event.target.matches('input[data-section-grant="module"]')) {
                    const moduleCheckboxes = Array.from(modules.querySelectorAll('input[data-section-grant="module"]'));
                    departmentCheckbox.checked = moduleCheckboxes.every(checkbox => checkbox.checked);
                    updateSelectAll();
                }
            });
            grantsContainer.appendChild(groupCard);
        });
        sectionsContainerEl.appendChild(grantsContainer);

        function updateSelectAll() {
            const moduleCheckboxes = Array.from(grantsContainer.querySelectorAll('input[data-section-grant="module"]'));
            const selectedCount = moduleCheckboxes.filter(checkbox => checkbox.checked).length;
            selectAll.checked = moduleCheckboxes.length > 0 && selectedCount === moduleCheckboxes.length;
            selectAll.indeterminate = selectedCount > 0 && !selectAll.checked;
            selectionSummary.textContent = `${selectedCount} of ${moduleCheckboxes.length} modules selected`;
        }

        selectAll.addEventListener('change', () => {
            grantsContainer.querySelectorAll('input[data-section-grant]').forEach(checkbox => {
                checkbox.checked = selectAll.checked;
            });
            updateSelectAll();
        });

        const updateRoleHelp = () => {
            accessHelp.textContent = roleSelectEl.value === 'Parent'
                ? 'Selected sections control the parent portal navigation; each section also requires matching record-level view access. Recommended: linked children, attendance, report cards, assignments, fees, and school notices.'
                : accessHelp.dataset.defaultHelp;
        };
        roleSelectEl.addEventListener('change', updateRoleHelp);
        updateRoleHelp();
        updateSelectAll();

        // Ensure Sections and Permissions stack vertically
        const parentRow = sectionsContainerEl.closest('.form-row');
        if (parentRow) parentRow.style.display = 'block';

        const permsGroup = document.querySelector('.perms-group');
        if (permsGroup) permsGroup.style.marginTop = '15px';
    }

    const escapeUserHTML = value => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    async function renderUsersTable(){
        const session = loadSession();
        usersTableBody.innerHTML = '';
        if (!session?.schoolId || !session.userId) {
            usersTableBody.innerHTML = '<tr><td colspan="10">Sign in to view accounts for this school.</td></tr>';
            return;
        }
        if (!['schoolAdmin', 'superAdmin', 'director', 'headTeacher'].includes(session.user?.role)) {
            usersTableBody.innerHTML = '<tr><td colspan="10">Only school administrators can view school accounts.</td></tr>';
            return;
        }
        let users;
        try {
            users = await getFirebase().listMembers(session.schoolId);
        } catch (error) {
            console.error('Unable to load school accounts from Firestore.', error);
            usersTableBody.innerHTML = '<tr><td colspan="10">Unable to load accounts. Check your connection, then sign out and back in if administrator access was recently changed.</td></tr>';
            return;
        }
        if (!users.length) {
            usersTableBody.innerHTML = '<tr><td colspan="10">No accounts were found for this school. Use Add User to create the first account.</td></tr>';
            return;
        }
        users.forEach(u => {
            const tr = document.createElement('tr');
            const isActive = u.status === 'active';
            const isAdministrator = isPrivilegedRole(u.role);
            const isCurrentUser = u.uid === session.userId;

            if (u.uid === session.userId) {
                tr.classList.add('current-user-row');
            }
            if (!isActive) {
                tr.classList.add('deactivated-row');
            }

            const channels = notificationChannels
                .filter(channel => u.notificationPreferences?.[channel])
                .join(', ') || 'None selected';

            tr.innerHTML = `
                <td style="text-align: center; width: 50px;">
                    <img src="${escapeUserHTML(u.photoURL || 'https://i.pravatar.cc/100?img=0')}" class="user-table-photo" alt="">
                </td>
                <td>${escapeUserHTML(u.fullName)} ${u.uid === session.userId ? '<span class="badge" style="margin-left:8px; font-size:9px; padding:2px 6px; background:var(--primary); vertical-align: middle;">You</span>' : ''}</td>
                <td>${escapeUserHTML(u.userId)}</td>
                <td>${escapeUserHTML(u.role)}</td>
                <td>${escapeUserHTML(u.linkedRecordId || '—')}</td>
                <td>${escapeUserHTML([u.email, u.phone].filter(Boolean).join(' · ') || '—')}<small class="user-notification-summary">Notices: ${escapeUserHTML(channels)}</small></td>
                <td>${isAdministrator ? 'All sections' : escapeUserHTML(formatSectionGrants(u.sections) || 'None assigned')}</td>
                <td>${isAdministrator ? 'All classes' : escapeUserHTML((u.assignedClassIds || []).join(', ') || (['teacher', 'deputyHeadTeacher'].includes(u.role) ? 'None assigned' : 'Not applicable'))}</td>
                <td class="small">${isAdministrator ? 'Full school access' : escapeUserHTML(permissionSummary(u.permissions))}</td>
                <td>
                    ${isAdministrator
                        ? '<span class="account-protected-note" title="Only the App Admin can change administrator accounts">Managed by App Admin</span>'
                        : `<div style="display:flex; align-items:center; gap:10px;">
                            <button class="action-btn" data-action="edit" data-id="${escapeUserHTML(u.uid)}" title="Edit User"><i class="fas fa-edit"></i></button>
                            <button class="action-btn" data-action="reset-password" data-id="${escapeUserHTML(u.uid)}" title="Set a temporary password" ${isCurrentUser || !isActive ? 'disabled' : ''}><i class="fas fa-key"></i></button>
                            <button class="action-btn" data-action="delete" data-id="${escapeUserHTML(u.uid)}" title="Delete User" ${isCurrentUser ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
                            <label class="switch" style="transform: scale(0.75); transform-origin: left;" title="${isActive ? 'Deactivate' : 'Activate'}">
                                <input type="checkbox" class="status-toggle" data-id="${escapeUserHTML(u.uid)}" ${isActive ? 'checked' : ''} ${isCurrentUser ? 'disabled' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>`}
                </td>`;
            usersTableBody.appendChild(tr);
        });
    }

    function clearForm(){
        addUserForm.reset(); editingUserId = null;
        manualAccountRecordId.value = '';
        manualAccountRecordId.classList.add('hidden');
        manualAccountRecordId.required = false;
        accountRecordSelect.disabled = false;
        temporaryPasswordField.hidden = false;
        temporaryAccountPassword.required = true;
        if (roleSelectEl) roleSelectEl.disabled = false;
        const submitBtn = document.getElementById('addUserBtn');
        if (submitBtn) submitBtn.textContent = 'Add User';
        if (photoPreview) {
            photoPreview.src = '';
            photoPreview.style.display = 'none';
        }
        if (roleSelectEl) {
            roleSelectEl.value = roleSelectEl.querySelector('option[value="Teacher"]') ? 'Teacher' : roleSelectEl.options[0]?.value;
            applyRoleDefaults(roleSelectEl.value);
            updateAccountRoleFields(roleSelectEl.value);
        }
    }

    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const session = loadSession();
        if (!session?.schoolId || !session.userId) return alert('Sign in to a school before creating accounts.');
        const fullName = document.getElementById('fullNameInput').value.trim();
        const userId = document.getElementById('userIdInputNew').value.trim().toLowerCase();
        const role = document.getElementById('roleSelect').value;
        const sections = Array.from(sectionsContainerEl.querySelectorAll('input[type="checkbox"][value]:checked')).map(i => i.value);
        const assignedClassIds = readAssignedClassIds(role);
        const email = document.getElementById('accountEmail').value.trim().toLowerCase();
        const temporaryPassword = temporaryAccountPassword.value;
        const linkedRecordId = accountRecordSelect.value === '__manual__'
            ? manualAccountRecordId.value.trim()
            : accountRecordSelect.value.trim();
        const isSchoolAdminRole = roleKeyForSelection(role) === 'schoolAdmin';
        if (!fullName || !userId || !email) return alert('Provide the full name, User ID, and email address.');
        if (accountRecordSelect.value === '__manual__' && !linkedRecordId) {
            return alert('Enter the staff record ID or choose an existing record.');
        }
        if (!editingUserId && (temporaryPassword.length < 8 || temporaryPassword.length > 128)) {
            return alert('Temporary passwords must be between 8 and 128 characters. Letters or numbers alone are accepted.');
        }
        if (['Teacher', 'Deputy Head Teacher'].includes(role) && !assignedClassIds.length) {
            return alert('Assign at least one class to a teaching account.');
        }
        if (!isSchoolAdminRole && (!assignablePermissionOptions?.[roleKeyForSelection(role)] || !dataPermissionsContainerEl.querySelector('.data-permission-row'))) {
            return alert('Role permissions are not available. Reopen the user form and try again.');
        }
        const photoInput = document.getElementById('profilePhotoInput');
        try {
            if (photoInput.files?.[0]) await readImageFile(photoInput.files[0]);
        } catch (error) {
            return alert(error.message || 'Unable to read the selected profile image.');
        }

        const accountFields = {
            schoolId: session.schoolId,
            fullName,
            userId,
            email,
            role,
            sections: isSchoolAdminRole ? [] : sections,
            assignedClassIds: isSchoolAdminRole ? [] : assignedClassIds,
            permissions: isSchoolAdminRole ? {} : readDataPermissions(),
            linkedRecordId,
            phone: document.getElementById('accountPhone').value.trim(),
            notificationPreferences: readNotificationPreferences(addUserForm)
        };
        try {
            const firebase = getFirebase();
            let uid = editingUserId;
            if (editingUserId) {
                const result = await firebase.updateSchoolUser({ ...accountFields, uid: editingUserId });
                uid = result.data.uid;
            } else {
                const result = await firebase.createSchoolUser({ ...accountFields, temporaryPassword });
                uid = result.data.uid;
                invitationHeading.textContent = 'Account created — share the temporary password privately.';
                invitationMessage.textContent = 'The user must change this password at first sign-in and can change it again anytime.';
                invitationScopeNotice.classList.add('hidden');
                invitationLinkInput.value = temporaryPassword;
                invitationLinkInput.classList.remove('hidden');
                document.getElementById('copyAccountInvitation').classList.remove('hidden');
                invitationPanel.classList.remove('hidden');
            }
            if (photoInput.files?.[0]) {
                try {
                    const photoURL = await firebase.uploadMemberPhoto(session.schoolId, uid, photoInput.files[0]);
                    await firebase.updateSchoolUser({
                        schoolId: session.schoolId,
                        uid,
                        fullName,
                        userId,
                        email,
                        phone: accountFields.phone,
                        linkedRecordId: accountFields.linkedRecordId,
                        role,
                        sections,
                        assignedClassIds,
                        permissions: accountFields.permissions,
                        notificationPreferences: accountFields.notificationPreferences,
                        photoURL
                    });
                } catch (photoError) {
                    console.error('The account was saved, but the profile photo upload failed.', photoError);
                    alert(`Account saved, but its photo could not be uploaded: ${photoError.message}`);
                }
            }
            await renderUsersTable();
            clearForm();
            addUserForm.classList.add('hidden');
        } catch (error) {
            console.error('Unable to save the Firebase school account.', error);
            alert(error.message || 'Unable to save this school account.');
        }
    });

    usersTableBody.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        if (action === 'reset-password'){
            openPasswordChangeDialog('admin-reset', null, id);
            return;
        }
        if (action === 'delete'){
            if (!confirm('Permanently delete this school account? The account will no longer be able to sign in.')) return;
            try {
                await getFirebase().deleteSchoolUser({ schoolId: loadSession().schoolId, uid: id });
                await renderUsersTable();
            } catch (error) {
                console.error('Unable to delete the Firebase school account.', error);
                alert(error.message || 'Unable to delete this account.');
            }
            return;
        }

        if (action === 'edit'){
            let u;
            try {
                const users = await getFirebase().listMembers(loadSession().schoolId);
                u = users.find(user => user.uid === id);
            } catch (error) {
                console.error('Unable to load the Firebase account for editing.', error);
                alert(error.message || 'Unable to load this account.');
                return;
            }
            if (!u) return alert('This account is no longer available.');
            assignableRecords.clear();
            addUserForm.classList.remove('hidden');
            try {
                await Promise.all([
                    loadAssignablePermissionOptions(loadSession().schoolId),
                    loadAssignableClasses(loadSession().schoolId),
                    updateLinkedRecordOptions(u.role, u.linkedRecordId || '')
                ]);
            } catch (error) {
                console.error('Unable to load role permission options for editing.', error);
                alert(error.message || 'Unable to load role permissions or assigned classes.');
                return;
            }
            addUserForm.classList.remove('hidden');
            temporaryPasswordField.hidden = true;
            temporaryAccountPassword.required = false;
            const submitBtn = document.getElementById('addUserBtn');
            if (submitBtn) submitBtn.textContent = 'Update User';
            document.getElementById('fullNameInput').value = u.fullName;
            document.getElementById('userIdInputNew').value = u.userId || '';
            const roleLabel = Object.entries(roleKeysByLabel).find(([, roleKey]) => roleKey === u.role)?.[0];
            document.getElementById('roleSelect').value = roleLabel || u.role;
            renderDataPermissions(document.getElementById('roleSelect').value, u.permissions || undefined);
            renderAssignedClasses(document.getElementById('roleSelect').value, u.assignedClassIds || []);
            accountRecordSelect.disabled = true;
            document.getElementById('accountEmail').value = u.email || '';
            document.getElementById('accountPhone').value = u.phone || '';
            fillNotificationPreferences(addUserForm, u.notificationPreferences);
            const photoInput = document.getElementById('profilePhotoInput');
            if (photoInput) photoInput.value = '';

            if (u.photoURL && photoPreview) {
                photoPreview.src = u.photoURL;
                photoPreview.style.display = 'block';
            }

            // sections
            const sectionCheckboxes = Array.from(sectionsContainerEl.querySelectorAll('input[type="checkbox"][value]'));
            const savedSectionGrants = sectionGrantSet(u);
            sectionCheckboxes.forEach(ch => {
                const hasDepartmentGrant = savedSectionGrants.has(ch.dataset.sectionDepartment)
                    || [...savedSectionGrants].some(grant => normalizeSectionKey(grant) === normalizeSectionKey(ch.dataset.departmentLabel || ''));
                ch.checked = savedSectionGrants.has(ch.value) || Boolean(hasDepartmentGrant);
                ch.dispatchEvent(new Event('change', { bubbles: true }));
            });
            const selectAllSections = sectionsContainerEl.querySelector('#selectAllSections');
            if (selectAllSections) selectAllSections.checked = sectionCheckboxes.length > 0 && sectionCheckboxes.every(section => section.checked);
            editingUserId = u.uid;
            window.scrollTo({ top: addUserForm.offsetTop - 80, behavior: 'smooth' });
        }
    });

    usersTableBody.addEventListener('change', async (e) => {
        if (e.target.classList.contains('status-toggle')) {
            const id = e.target.getAttribute('data-id');
            try {
                await getFirebase().setSchoolUserStatus({
                    schoolId: loadSession().schoolId,
                    uid: id,
                    status: e.target.checked
                });
                await renderUsersTable();
            } catch (error) {
                console.error('Unable to change Firebase account status.', error);
                alert(error.message || 'Unable to change this account status.');
                await renderUsersTable();
            }
        }
    });

    populateRoleOptions();
    populateSectionsList();
    roleSelectEl.addEventListener('change', () => {
        applyRoleDefaults(roleSelectEl.value);
        updateAccountRoleFields(roleSelectEl.value);
        if (!addUserForm.classList.contains('hidden')) {
            void updateLinkedRecordOptions(roleSelectEl.value, '').catch(error => {
                console.error('Unable to load records for account linking.', error);
                accountRecordSelect.replaceChildren(new Option('Unable to load records', ''));
                accountRecordHelp.textContent = error.message || 'Unable to load records for account linking.';
            });
        }
    });
    clearForm();

    const escapeStaffHTML = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    function createLegacyStaffDirectoryModule(category) {
        const sec = document.createElement('section');
        sec.className = 'module staff-directory-module';
        sec.id = 'module_staff_directory';
        sec.innerHTML = `
            <div class="module-header">
                <div><h2>Staff Directory</h2><p>Department: ${category}</p></div>
                <button class="btn-primary" type="button" data-staff-add><i class="fas fa-user-plus"></i> Add Staff</button>
            </div>
            <div class="staff-directory-form hidden" data-staff-form-wrap>
                <form data-staff-form>
                    <div class="form-row">
                        <div class="form-group"><label>Staff Name *</label><input name="name" required placeholder="e.g. Jane Doe"></div>
                        <div class="form-group"><label>Employee Number</label><input name="employeeNo" placeholder="e.g. STF-001"></div>
                        <div class="form-group"><label>Role</label><input name="role" placeholder="e.g. Teacher"></div>
                        <div class="form-group"><label>Department</label><input name="department" value="${category}"></div>
                        <div class="form-group"><label>Phone</label><input name="phone"></div>
                        <div class="form-group"><label>Email</label><input type="email" name="email"></div>
                        <div class="form-group"><label>Status</label><select name="status"><option>Active</option><option>Inactive</option></select></div>
                    </div>
                    <div class="staff-directory-form-actions"><button class="btn-primary" type="submit">Save Staff</button><button class="btn-secondary" type="button" data-staff-cancel>Cancel</button></div>
                </form>
            </div>
            <div class="table-card staff-directory-table-card"><div class="table-wrap"><table><thead><tr><th>Staff</th><th>Employee No.</th><th>Role</th><th>Department</th><th>Phone</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead><tbody data-staff-table></tbody></table></div></div>`;
        let staff = JSON.parse(localStorage.getItem('school_staff_directory') || 'null') || [
            { id: 1, name: 'Staff Member A', employeeNo: 'STF-001', role: 'Teacher', department: category, phone: '', email: '', status: 'Active' },
            { id: 2, name: 'Staff Member B', employeeNo: 'STF-002', role: 'Administrator', department: category, phone: '', email: '', status: 'Active' }
        ];
        let editingId = null;
        const formWrap = sec.querySelector('[data-staff-form-wrap]');
        const form = sec.querySelector('[data-staff-form]');
        const table = sec.querySelector('[data-staff-table]');
        const persist = () => localStorage.setItem('school_staff_directory', JSON.stringify(staff));
        const closeForm = () => { formWrap.classList.add('hidden'); form.reset(); editingId = null; };
        const render = () => {
            table.innerHTML = staff.map(staff => `
                <tr data-staff-id="${staff.id}">
                    <td><strong data-staff-name>${escapeStaffHTML(staff.name)}</strong></td>
                    <td>${escapeStaffHTML(staff.employeeNo || '-')}</td>
                    <td>${escapeStaffHTML(staff.role || '-')}</td>
                    <td>${escapeStaffHTML(staff.department || '-')}</td>
                    <td>${escapeStaffHTML(staff.phone || '-')}</td>
                    <td>${escapeStaffHTML(staff.email || '-')}</td>
                    <td>${escapeStaffHTML(staff.status || 'Active')}</td>
                    <td>
                        <div class="actions">
                            <!-- Preview -->
                            <button
                                class="action-btn"
                                title="Preview / Print"
                                onclick="previewStaff(${staff.id})">
                                👁️
                            </button>

                            <!-- Edit -->
                            <button
                                class="action-btn"
                                title="Edit Staff"
                                onclick="editStaff(${staff.id})">
                                ✏️
                            </button>

                            <!-- Delete -->
                            <button
                                class="action-btn"
                                title="Delete Staff"
                                onclick="deleteStaff(${staff.id})">
                                🗑️
                            </button>
                        </div>
                    </td>
                </tr>`).join('');
        };
        window.previewStaff = id => { const member = staff.find(item => item.id === id); if (member) alert(`Staff record:\n${member.name}\n${member.role || 'Staff member'}\n${member.department || ''}`); };
        window.editStaff = id => { const member = staff.find(item => item.id === id); if (!member) return; editingId = id; Object.keys(member).forEach(key => { if (form.elements[key]) form.elements[key].value = member[key] || ''; }); formWrap.classList.remove('hidden'); form.elements.name.focus(); };
        window.deleteStaff = id => { const member = staff.find(item => item.id === id); if (!member || !confirm(`Delete ${member.name}?`)) return; staff = staff.filter(item => item.id !== id); persist(); render(); };
        window.addStaff = () => { editingId = null; form.reset(); form.elements.department.value = category; formWrap.classList.remove('hidden'); form.elements.name.focus(); };
        sec.querySelector('[data-staff-add]').addEventListener('click', window.addStaff);
        sec.querySelector('[data-staff-cancel]').addEventListener('click', closeForm);
        form.addEventListener('submit', event => { event.preventDefault(); const data = Object.fromEntries(new FormData(form).entries()); data.id = editingId || Date.now(); if (editingId) staff[staff.findIndex(item => item.id === editingId)] = data; else staff.push(data); persist(); render(); closeForm(); });
        render();
        return sec;
    }

    function createPayrollModule() {
        const sec = document.createElement('section');
        sec.className = 'module payroll-module hidden';
        sec.id = 'payrollModule';
        sec.innerHTML = `<div class="payroll-page-header"><div class="payroll-heading"><div class="payroll-header-icon"><i class="fas fa-money-bill-wave"></i></div><div><h2>Run Payroll</h2><p>Manage employee salaries, deductions and payroll processing</p></div></div><div class="payroll-header-actions"><button class="btn-secondary" type="button" data-payroll-export><i class="fas fa-download"></i> Export CSV</button><button class="btn-primary" type="button" data-payroll-new><i class="fas fa-plus"></i> Run Payroll</button></div></div><div class="payroll-stats"><div><i class="fas fa-users"></i><span>Total Employees</span><strong data-payroll-stat="employees">0</strong><small>Payroll employees</small></div><div><i class="fas fa-credit-card"></i><span>Gross Payroll</span><strong data-payroll-stat="gross">AED 0</strong><small>Current payroll</small></div><div><i class="fas fa-hourglass-half"></i><span>Pending Payroll</span><strong data-payroll-stat="pending">0</strong><small>Awaiting payment</small></div><div><i class="fas fa-check-circle"></i><span>Net Payroll</span><strong data-payroll-stat="net">AED 0</strong><small>Total take-home</small></div></div><div class="payroll-card"><div class="payroll-toolbar"><div><h3>Employee Payroll</h3><p>Review and manage monthly employee payroll</p></div><div class="payroll-filters"><label class="payroll-search"><i class="fas fa-search"></i><input data-payroll-search type="search" placeholder="Search employee..."></label><select data-payroll-filter><option value="">All Status</option><option>Paid</option><option>Pending</option><option>Processing</option></select></div></div><div class="payroll-table-wrap"><table><thead><tr><th>Employee</th><th>Department</th><th>Pay Period</th><th>Basic Salary</th><th>Allowances</th><th>Deductions</th><th>Net Salary</th><th>Status</th><th>Actions</th></tr></thead><tbody data-payroll-table></tbody></table><div class="payroll-empty hidden" data-payroll-empty><i class="fas fa-file-invoice-dollar"></i><strong>No payroll records found</strong><span>Try changing your search or run a new payroll.</span></div></div></div><div class="payroll-overlay hidden" data-payroll-form-overlay><div class="payroll-modal"><div class="payroll-modal-header"><div><h3 data-payroll-form-title>Run Payroll</h3><p>Enter employee payroll information</p></div><button class="payroll-close" type="button" data-payroll-close-form aria-label="Close"><i class="fas fa-times"></i></button></div><form data-payroll-form><input type="hidden" name="id"><div class="payroll-form-grid"><label>Employee Name *<input name="employeeName" required placeholder="e.g. Sarah Johnson"></label><label>Employee ID<input name="employeeId" placeholder="EMP-001"></label><label>Department *<select name="department" required><option value="">Select department</option><option>Academic</option><option>Administration</option><option>Finance</option><option>IT</option><option>Student Services</option><option>Human Resources</option></select></label><label>Pay Period *<input name="payPeriod" type="month" required></label><label>Basic Salary (AED) *<input name="basicSalary" type="number" min="0" step="0.01" required></label><label>Housing Allowance (AED)<input name="housing" type="number" min="0" step="0.01" value="0"></label><label>Transport Allowance (AED)<input name="transport" type="number" min="0" step="0.01" value="0"></label><label>Other Allowances (AED)<input name="otherAllowance" type="number" min="0" step="0.01" value="0"></label><label>Overtime (AED)<input name="overtime" type="number" min="0" step="0.01" value="0"></label><label>Tax / Other Deduction (AED)<input name="tax" type="number" min="0" step="0.01" value="0"></label><label>Loan Deduction (AED)<input name="loan" type="number" min="0" step="0.01" value="0"></label><label>Other Deduction (AED)<input name="otherDeduction" type="number" min="0" step="0.01" value="0"></label><label>Payroll Status<select name="status"><option>Pending</option><option>Processing</option><option>Paid</option></select></label></div><div class="payroll-calculation"><div><span>Gross Salary</span><strong data-payroll-preview="gross">AED 0.00</strong></div><div><span>Total Deductions</span><strong data-payroll-preview="deductions">AED 0.00</strong></div><div><span>Net Salary</span><strong data-payroll-preview="net">AED 0.00</strong></div></div><div class="payroll-form-actions"><button class="btn-secondary" type="button" data-payroll-close-form>Cancel</button><button class="btn-primary" type="submit">Save Payroll</button></div></form></div></div><div class="payroll-overlay hidden" data-payroll-preview-overlay><div class="payroll-modal payroll-preview-modal"><div class="payroll-modal-header"><div><h3>Payroll Preview</h3><p>Preview and print employee payslip</p></div><button class="payroll-close" type="button" data-payroll-close-preview aria-label="Close"><i class="fas fa-times"></i></button></div><div class="payroll-preview-body" data-payroll-preview-content></div><div class="payroll-preview-actions"><button class="btn-secondary" type="button" data-payroll-close-preview>Close</button><button class="btn-primary" type="button" data-payroll-print><i class="fas fa-print"></i> Print Payslip</button></div></div></div>`;
        const key = 'schoolPayroll'; const seed = [{ id: 1, employeeName: 'Sarah Johnson', employeeId: 'EMP-001', department: 'Academic', payPeriod: '2026-08', basicSalary: 12000, housing: 2500, transport: 800, otherAllowance: 300, overtime: 500, tax: 0, loan: 300, otherDeduction: 100, status: 'Paid' }, { id: 2, employeeName: 'Michael Brown', employeeId: 'EMP-002', department: 'IT', payPeriod: '2026-08', basicSalary: 13500, housing: 2800, transport: 900, otherAllowance: 200, overtime: 750, tax: 0, loan: 500, otherDeduction: 150, status: 'Processing' }, { id: 3, employeeName: 'Emma Wilson', employeeId: 'EMP-003', department: 'Academic', payPeriod: '2026-08', basicSalary: 9500, housing: 1800, transport: 600, otherAllowance: 200, overtime: 250, tax: 0, loan: 200, otherDeduction: 50, status: 'Pending' }, { id: 4, employeeName: 'David Miller', employeeId: 'EMP-004', department: 'Administration', payPeriod: '2026-08', basicSalary: 10500, housing: 2200, transport: 700, otherAllowance: 150, overtime: 300, tax: 0, loan: 250, otherDeduction: 100, status: 'Paid' }]; let records; try { records = JSON.parse(localStorage.getItem(key)) || seed; } catch (error) { records = seed; }
        const money = value => `AED ${Number(value || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; const allowance = item => ['housing', 'transport', 'otherAllowance', 'overtime'].reduce((sum, field) => sum + Number(item[field] || 0), 0); const gross = item => Number(item.basicSalary || 0) + allowance(item); const deductions = item => ['tax', 'loan', 'otherDeduction'].reduce((sum, field) => sum + Number(item[field] || 0), 0); const net = item => Math.max(0, gross(item) - deductions(item)); const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char])); const period = value => { if (!value) return '-'; const [year, month] = value.split('-'); return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); };
        const formOverlay = sec.querySelector('[data-payroll-form-overlay]'); const previewOverlay = sec.querySelector('[data-payroll-preview-overlay]'); const form = sec.querySelector('[data-payroll-form]'); const save = () => localStorage.setItem(key, JSON.stringify(records)); const calculate = () => { const item = Object.fromEntries(new FormData(form).entries()); sec.querySelector('[data-payroll-preview="gross"]').textContent = money(gross(item)); sec.querySelector('[data-payroll-preview="deductions"]').textContent = money(deductions(item)); sec.querySelector('[data-payroll-preview="net"]').textContent = money(net(item)); }; const setDefaults = () => { form.reset(); form.elements.id.value = ''; form.elements.payPeriod.value = new Date().toISOString().slice(0, 7); ['housing', 'transport', 'otherAllowance', 'overtime', 'tax', 'loan', 'otherDeduction'].forEach(field => { form.elements[field].value = 0; }); sec.querySelector('[data-payroll-form-title]').textContent = 'Run Payroll'; calculate(); };
        const render = () => { const query = sec.querySelector('[data-payroll-search]').value.toLowerCase(); const filter = sec.querySelector('[data-payroll-filter]').value; const found = records.filter(item => (!filter || item.status === filter) && [item.employeeName, item.employeeId, item.department].join(' ').toLowerCase().includes(query)); sec.querySelector('[data-payroll-table]').innerHTML = found.map(item => `<tr><td><div class="payroll-employee"><span>${escape(item.employeeName.split(' ').map(word => word[0]).join('').slice(0, 2))}</span><div><strong>${escape(item.employeeName)}</strong><small>${escape(item.employeeId || 'No ID')}</small></div></div></td><td>${escape(item.department)}</td><td>${period(item.payPeriod)}</td><td>${money(item.basicSalary)}</td><td>${money(allowance(item))}</td><td>${money(deductions(item))}</td><td class="payroll-net">${money(net(item))}</td><td><span class="payroll-status ${item.status.toLowerCase()}">${escape(item.status)}</span></td><td><div class="payroll-actions"><button type="button" title="Preview" data-payroll-action="preview" data-id="${item.id}"><i class="fas fa-eye"></i></button><button type="button" title="Edit" data-payroll-action="edit" data-id="${item.id}"><i class="fas fa-pen"></i></button><button type="button" title="Delete" data-payroll-action="delete" data-id="${item.id}"><i class="fas fa-trash"></i></button></div></td></tr>`).join(''); sec.querySelector('[data-payroll-empty]').classList.toggle('hidden', found.length > 0); sec.querySelector('[data-payroll-stat="employees"]').textContent = records.length; sec.querySelector('[data-payroll-stat="gross"]').textContent = money(records.reduce((sum, item) => sum + gross(item), 0)); sec.querySelector('[data-payroll-stat="pending"]').textContent = records.filter(item => item.status === 'Pending').length; sec.querySelector('[data-payroll-stat="net"]').textContent = money(records.reduce((sum, item) => sum + net(item), 0)); };
        const openPreview = item => { const rows = [['Basic Salary', item.basicSalary], ['Housing Allowance', item.housing], ['Transport Allowance', item.transport], ['Other Allowances', item.otherAllowance], ['Overtime', item.overtime], ['Gross Salary', gross(item)], ['Tax / Other Deduction', -Number(item.tax || 0)], ['Loan Deduction', -Number(item.loan || 0)], ['Other Deduction', -Number(item.otherDeduction || 0)]]; const salaryRows = rows.map(row => '<tr><td>' + row[0] + '</td><td>' + money(row[1]) + '</td></tr>').join(''); sec.querySelector('[data-payroll-preview-content]').innerHTML = `<div class="payroll-slip"><div class="payroll-slip-header"><strong>GREEN VALLEY INTERNATIONAL SCHOOL</strong><span>School Management & Administration Department</span><b>EMPLOYEE PAYSLIP</b><small>Pay Period: ${period(item.payPeriod)}</small></div><h4>Employee Information</h4><div class="payroll-slip-grid"><div><small>Employee Name</small>${escape(item.employeeName)}</div><div><small>Employee ID</small>${escape(item.employeeId || '-')}</div><div><small>Department</small>${escape(item.department)}</div><div><small>Payroll Status</small>${escape(item.status)}</div></div><h4>Salary Details</h4><table><tbody>${salaryRows}<tr class="payroll-slip-net"><td>NET SALARY</td><td>${money(net(item))}</td></tr></tbody></table><div class="payroll-signatures"><span>Payroll / HR Officer</span><span>Employee Signature</span></div></div>`; previewOverlay.classList.remove('hidden'); }; const openForm = item => { if (!item) setDefaults(); else { Object.keys(item).forEach(field => { if (form.elements[field]) form.elements[field].value = item[field]; }); sec.querySelector('[data-payroll-form-title]').textContent = 'Edit Payroll'; calculate(); } formOverlay.classList.remove('hidden'); form.elements.employeeName.focus(); };
        form.addEventListener('input', calculate); sec.querySelector('[data-payroll-new]').addEventListener('click', () => openForm()); sec.querySelectorAll('[data-payroll-close-form]').forEach(button => button.addEventListener('click', () => formOverlay.classList.add('hidden'))); sec.querySelectorAll('[data-payroll-close-preview]').forEach(button => button.addEventListener('click', () => previewOverlay.classList.add('hidden'))); sec.querySelector('[data-payroll-search]').addEventListener('input', render); sec.querySelector('[data-payroll-filter]').addEventListener('change', render);
        form.addEventListener('submit', event => { event.preventDefault(); const item = Object.fromEntries(new FormData(form).entries()); item.id = item.id ? Number(item.id) : Date.now(); Object.keys(item).forEach(field => { if (!['employeeName', 'employeeId', 'department', 'payPeriod', 'status'].includes(field)) item[field] = Number(item[field] || 0); }); const index = records.findIndex(record => record.id === item.id); if (index === -1) records.unshift(item); else records[index] = item; save(); render(); formOverlay.classList.add('hidden'); alert(index === -1 ? 'Payroll processed successfully.' : 'Payroll updated successfully.'); });
        sec.querySelector('[data-payroll-table]').addEventListener('click', event => { const button = event.target.closest('[data-payroll-action]'); if (!button) return; const item = records.find(record => record.id === Number(button.dataset.id)); if (!item) return; if (button.dataset.payrollAction === 'preview') openPreview(item); if (button.dataset.payrollAction === 'edit') openForm(item); if (button.dataset.payrollAction === 'delete' && confirm(`Delete payroll record for "${item.employeeName}"?`)) { records = records.filter(record => record.id !== item.id); save(); render(); } });
        sec.querySelector('[data-payroll-export]').addEventListener('click', () => { const headers = ['Employee Name', 'Employee ID', 'Department', 'Pay Period', 'Basic Salary', 'Gross Salary', 'Deductions', 'Net Salary', 'Status']; const csv = [headers, ...records.map(item => [item.employeeName, item.employeeId, item.department, item.payPeriod, item.basicSalary, gross(item), deductions(item), net(item), item.status])].map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'school-payroll.csv'; link.click(); URL.revokeObjectURL(link.href); });
        sec.querySelector('[data-payroll-print]').addEventListener('click', () => { const content = sec.querySelector('[data-payroll-preview-content]').innerHTML; const printWindow = window.open('', '_blank'); if (!printWindow) return; printWindow.document.write(`<html><head><title>Employee Payslip</title><link rel="stylesheet" href="payroll.css"></head><body>${content}</body></html>`); printWindow.document.close(); printWindow.focus(); printWindow.print(); }); render(); return sec;
    }

    function createPayslipsModule() {
        const sec = document.createElement('section');
        sec.className = 'module payslips-module hidden';
        sec.id = 'payslipsModule';
        sec.innerHTML = `<div class="payslips-header"><div class="payslips-title"><div class="payslips-icon"><i class="fas fa-file-invoice-dollar"></i></div><div><h2>Pay Slips</h2><p>Generate, manage and print employee salary slips</p></div></div><div class="payslips-actions"><button class="btn-secondary" type="button" data-slip-export><i class="fas fa-download"></i> Export CSV</button><button class="btn-primary" type="button" data-slip-new><i class="fas fa-plus"></i> Generate Pay Slip</button></div></div><div class="payslips-stats"><div><i class="fas fa-file-invoice"></i><span>Total Pay Slips</span><strong data-slip-stat="total">0</strong><small>All generated slips</small></div><div><i class="fas fa-check-circle"></i><span>Generated</span><strong data-slip-stat="generated">0</strong><small>Completed pay slips</small></div><div><i class="fas fa-hourglass-half"></i><span>Draft Slips</span><strong data-slip-stat="draft">0</strong><small>Awaiting completion</small></div><div><i class="fas fa-money-bill-wave"></i><span>Total Net Pay</span><strong data-slip-stat="net">AED 0</strong><small>Current pay slips</small></div></div><div class="payslips-card"><div class="payslips-toolbar"><div><h3>Employee Pay Slips</h3><p>View, print and manage employee salary slips</p></div><div class="payslips-filters"><label><i class="fas fa-search"></i><input data-slip-search type="search" placeholder="Search employee..."></label><select data-slip-filter><option value="">All Status</option><option>Generated</option><option>Draft</option></select></div></div><div class="payslips-table-wrap"><table><thead><tr><th>Employee</th><th>Department</th><th>Pay Slip No.</th><th>Pay Period</th><th>Gross Salary</th><th>Deductions</th><th>Net Salary</th><th>Status</th><th>Actions</th></tr></thead><tbody data-slip-table></tbody></table><div class="payslips-empty hidden" data-slip-empty><i class="fas fa-file-invoice"></i><strong>No pay slips found</strong><span>Try changing your search or generate a new pay slip.</span></div></div></div><div class="slips-overlay hidden" data-slip-form-overlay><div class="slips-modal"><div class="slips-modal-header"><div><h3 data-slip-form-title>Generate Pay Slip</h3><p>Enter employee salary information</p></div><button class="slips-close" type="button" data-slip-close-form aria-label="Close"><i class="fas fa-times"></i></button></div><form data-slip-form><input type="hidden" name="id"><div class="slips-form-grid"><label>Employee Name *<input name="employeeName" required placeholder="e.g. Sarah Johnson"></label><label>Employee ID<input name="employeeId" placeholder="EMP-001"></label><label>Department *<select name="department" required><option value="">Select department</option><option>Academic</option><option>Administration</option><option>Finance</option><option>IT</option><option>Human Resources</option><option>Student Services</option></select></label><label>Pay Period *<input name="payPeriod" type="month" required></label><label>Basic Salary (AED) *<input name="basicSalary" type="number" min="0" step="0.01" required></label><label>Allowances (AED)<input name="allowances" type="number" min="0" step="0.01" value="0"></label><label>Overtime (AED)<input name="overtime" type="number" min="0" step="0.01" value="0"></label><label>Deductions (AED)<input name="deductions" type="number" min="0" step="0.01" value="0"></label><label>Slip Status<select name="status"><option>Generated</option><option>Draft</option></select></label></div><div class="slips-form-actions"><button class="btn-secondary" type="button" data-slip-close-form>Cancel</button><button class="btn-primary" type="submit">Save Pay Slip</button></div></form></div></div><div class="slips-overlay hidden" data-slip-preview-overlay><div class="slips-modal slips-preview-modal"><div class="slips-modal-header"><div><h3>Pay Slip Preview</h3><p>Review and print employee pay slip</p></div><button class="slips-close" type="button" data-slip-close-preview aria-label="Close"><i class="fas fa-times"></i></button></div><div class="slips-preview-body" data-slip-preview-content></div><div class="slips-preview-actions"><button class="btn-secondary" type="button" data-slip-close-preview>Close</button><button class="btn-primary" type="button" data-slip-print><i class="fas fa-print"></i> Print Pay Slip</button></div></div></div>`;
        const key = 'schoolPaySlips'; const seed = [{ id: 1, slipNo: 'PS-2026-001', employeeName: 'Sarah Johnson', employeeId: 'EMP-001', department: 'Academic', payPeriod: '2026-08', basicSalary: 12000, allowances: 3300, overtime: 500, deductions: 400, status: 'Generated' }, { id: 2, slipNo: 'PS-2026-002', employeeName: 'Michael Brown', employeeId: 'EMP-002', department: 'IT', payPeriod: '2026-08', basicSalary: 13500, allowances: 3900, overtime: 750, deductions: 650, status: 'Generated' }, { id: 3, slipNo: 'PS-2026-003', employeeName: 'Emma Wilson', employeeId: 'EMP-003', department: 'Academic', payPeriod: '2026-08', basicSalary: 9500, allowances: 2600, overtime: 250, deductions: 250, status: 'Draft' }, { id: 4, slipNo: 'PS-2026-004', employeeName: 'David Miller', employeeId: 'EMP-004', department: 'Administration', payPeriod: '2026-08', basicSalary: 10500, allowances: 3050, overtime: 300, deductions: 350, status: 'Generated' }]; let slips; try { slips = JSON.parse(localStorage.getItem(key)) || seed; } catch (error) { slips = seed; }
        const money = value => `AED ${Number(value || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; const gross = slip => Number(slip.basicSalary || 0) + Number(slip.allowances || 0) + Number(slip.overtime || 0); const net = slip => Math.max(0, gross(slip) - Number(slip.deductions || 0)); const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char])); const period = value => { if (!value) return '-'; const [year, month] = value.split('-'); return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); }; const formOverlay = sec.querySelector('[data-slip-form-overlay]'); const previewOverlay = sec.querySelector('[data-slip-preview-overlay]'); const form = sec.querySelector('[data-slip-form]'); const save = () => localStorage.setItem(key, JSON.stringify(slips));
        const render = () => { const query = sec.querySelector('[data-slip-search]').value.toLowerCase(); const filter = sec.querySelector('[data-slip-filter]').value; const found = slips.filter(slip => (!filter || slip.status === filter) && [slip.employeeName, slip.employeeId, slip.slipNo, slip.department].join(' ').toLowerCase().includes(query)); sec.querySelector('[data-slip-table]').innerHTML = found.map(slip => `<tr><td><div class="payslip-employee"><span>${escape(slip.employeeName.split(' ').map(word => word[0]).join('').slice(0, 2))}</span><div><strong>${escape(slip.employeeName)}</strong><small>${escape(slip.employeeId || '-')}</small></div></div></td><td>${escape(slip.department)}</td><td><strong>${escape(slip.slipNo)}</strong></td><td>${period(slip.payPeriod)}</td><td>${money(gross(slip))}</td><td>${money(slip.deductions)}</td><td class="payslip-net">${money(net(slip))}</td><td><span class="payslip-badge ${slip.status.toLowerCase()}">${escape(slip.status)}</span></td><td><div class="payslip-row-actions"><button type="button" title="Preview" data-slip-action="preview" data-id="${slip.id}"><i class="fas fa-eye"></i></button><button type="button" title="Edit" data-slip-action="edit" data-id="${slip.id}"><i class="fas fa-pen"></i></button><button type="button" title="Delete" data-slip-action="delete" data-id="${slip.id}"><i class="fas fa-trash"></i></button></div></td></tr>`).join(''); sec.querySelector('[data-slip-empty]').classList.toggle('hidden', found.length > 0); sec.querySelector('[data-slip-stat="total"]').textContent = slips.length; sec.querySelector('[data-slip-stat="generated"]').textContent = slips.filter(slip => slip.status === 'Generated').length; sec.querySelector('[data-slip-stat="draft"]').textContent = slips.filter(slip => slip.status === 'Draft').length; sec.querySelector('[data-slip-stat="net"]').textContent = money(slips.reduce((sum, slip) => sum + net(slip), 0)); };
        const reset = () => { form.reset(); form.elements.id.value = ''; form.elements.payPeriod.value = new Date().toISOString().slice(0, 7); ['allowances', 'overtime', 'deductions'].forEach(field => { form.elements[field].value = 0; }); sec.querySelector('[data-slip-form-title]').textContent = 'Generate Pay Slip'; }; const openForm = slip => { if (!slip) reset(); else { Object.keys(slip).forEach(field => { if (form.elements[field]) form.elements[field].value = slip[field]; }); sec.querySelector('[data-slip-form-title]').textContent = 'Edit Pay Slip'; } formOverlay.classList.remove('hidden'); form.elements.employeeName.focus(); }; const openPreview = slip => { const rows = [['Basic Salary', slip.basicSalary], ['Allowances', slip.allowances], ['Overtime', slip.overtime], ['Gross Salary', gross(slip)], ['Deductions', -Number(slip.deductions || 0)]]; const salaryRows = rows.map(row => '<tr><td>' + row[0] + '</td><td>' + money(row[1]) + '</td></tr>').join(''); sec.querySelector('[data-slip-preview-content]').innerHTML = `<div class="payslip-document"><div class="payslip-document-header"><strong>GREEN VALLEY INTERNATIONAL SCHOOL</strong><span>School Management & Administration Department</span><b>EMPLOYEE PAY SLIP</b><small>Pay Period: ${period(slip.payPeriod)}</small></div><h4>Employee Information</h4><div class="payslip-info-grid"><div><small>Employee Name</small>${escape(slip.employeeName)}</div><div><small>Employee ID</small>${escape(slip.employeeId || '-')}</div><div><small>Department</small>${escape(slip.department)}</div><div><small>Pay Slip Number</small>${escape(slip.slipNo)}</div></div><h4>Salary Details</h4><table><tbody>${salaryRows}<tr class="payslip-net-row"><td>NET SALARY</td><td>${money(net(slip))}</td></tr></tbody></table><div class="payslip-signatures"><span>Payroll / HR Officer</span><span>Employee Signature</span></div></div>`; previewOverlay.classList.remove('hidden'); };
        form.addEventListener('submit', event => { event.preventDefault(); const slip = Object.fromEntries(new FormData(form).entries()); slip.id = slip.id ? Number(slip.id) : Date.now(); slip.slipNo = slip.id && slips.find(item => item.id === slip.id)?.slipNo || `PS-${new Date().getFullYear()}-${String(slips.length + 1).padStart(3, '0')}`; ['basicSalary', 'allowances', 'overtime', 'deductions'].forEach(field => { slip[field] = Number(slip[field] || 0); }); const index = slips.findIndex(item => item.id === slip.id); if (index === -1) slips.unshift(slip); else slips[index] = slip; save(); render(); formOverlay.classList.add('hidden'); }); sec.querySelector('[data-slip-new]').addEventListener('click', () => openForm()); sec.querySelectorAll('[data-slip-close-form]').forEach(button => button.addEventListener('click', () => formOverlay.classList.add('hidden'))); sec.querySelectorAll('[data-slip-close-preview]').forEach(button => button.addEventListener('click', () => previewOverlay.classList.add('hidden'))); sec.querySelector('[data-slip-search]').addEventListener('input', render); sec.querySelector('[data-slip-filter]').addEventListener('change', render);
        sec.querySelector('[data-slip-table]').addEventListener('click', event => { const button = event.target.closest('[data-slip-action]'); if (!button) return; const slip = slips.find(item => item.id === Number(button.dataset.id)); if (!slip) return; if (button.dataset.slipAction === 'preview') openPreview(slip); if (button.dataset.slipAction === 'edit') openForm(slip); if (button.dataset.slipAction === 'delete' && confirm(`Delete pay slip ${slip.slipNo}?`)) { slips = slips.filter(item => item.id !== slip.id); save(); render(); } }); sec.querySelector('[data-slip-export]').addEventListener('click', () => { const rows = [['Pay Slip No', 'Employee Name', 'Employee ID', 'Department', 'Pay Period', 'Basic Salary', 'Allowances', 'Overtime', 'Gross Salary', 'Deductions', 'Net Salary', 'Status'], ...slips.map(slip => [slip.slipNo, slip.employeeName, slip.employeeId, slip.department, slip.payPeriod, slip.basicSalary, slip.allowances, slip.overtime, gross(slip), slip.deductions, net(slip), slip.status])]; const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'school-pay-slips.csv'; link.click(); URL.revokeObjectURL(link.href); }); sec.querySelector('[data-slip-print]').addEventListener('click', () => { const content = sec.querySelector('[data-slip-preview-content]').innerHTML; const printWindow = window.open('', '_blank'); if (!printWindow) return; printWindow.document.write(`<html><head><title>Employee Pay Slip</title><link rel="stylesheet" href="payroll.css"></head><body>${content}</body></html>`); printWindow.document.close(); printWindow.focus(); printWindow.print(); }); render(); return sec;
    }

    function createStatutoryReturnsModule() {
        const sec = document.createElement('section');
        sec.className = 'module statutory-returns-module hidden';
        sec.id = 'statutoryReturnsModule';
        sec.innerHTML = `<div class="statutory-header"><div class="statutory-title"><div class="statutory-icon"><i class="fas fa-scale-balanced"></i></div><div><h2>Statutory Returns</h2><p>Manage, track and monitor statutory payroll returns</p></div></div><div class="statutory-actions"><button class="btn-secondary" type="button" data-return-export><i class="fas fa-download"></i> Export CSV</button><button class="btn-primary" type="button" data-return-new><i class="fas fa-plus"></i> Add Statutory Return</button></div></div><div class="statutory-stats"><div><i class="fas fa-scale-balanced"></i><span>Total Returns</span><strong data-return-stat="total">0</strong><small>All statutory records</small></div><div><i class="fas fa-check-circle"></i><span>Submitted</span><strong data-return-stat="submitted">0</strong><small>Successfully submitted</small></div><div><i class="fas fa-hourglass-half"></i><span>Pending</span><strong data-return-stat="pending">0</strong><small>Awaiting submission</small></div><div><i class="fas fa-money-bill-wave"></i><span>Total Amount</span><strong data-return-stat="amount">AED 0</strong><small>Recorded return amounts</small></div></div><div class="statutory-card"><div class="statutory-toolbar"><div><h3>Statutory Return Records</h3><p>View and manage statutory submissions and deadlines</p></div><div class="statutory-filters"><label><i class="fas fa-search"></i><input data-return-search type="search" placeholder="Search return..."></label><select data-return-filter><option value="">All Status</option><option>Submitted</option><option>Pending</option><option>Overdue</option><option>Draft</option></select></div></div><div class="statutory-table-wrap"><table><thead><tr><th>Return</th><th>Authority</th><th>Period</th><th>Due Date</th><th>Submission Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody data-return-table></tbody></table><div class="statutory-empty hidden" data-return-empty><i class="fas fa-scale-balanced"></i><strong>No statutory returns found</strong><span>Try changing your search or add a new statutory return.</span></div></div></div><div class="returns-overlay hidden" data-return-form-overlay><div class="returns-modal"><div class="returns-modal-header"><div><h3 data-return-form-title>Add Statutory Return</h3><p>Enter statutory return information</p></div><button class="returns-close" type="button" data-return-close-form aria-label="Close"><i class="fas fa-times"></i></button></div><form data-return-form><input type="hidden" name="id"><div class="returns-form-grid"><label>Return Type *<select name="returnType" required><option value="">Select return type</option><option>Pension Contribution</option><option>Social Security</option><option>Income Tax</option><option>Labour Return</option><option>Education Authority Return</option><option>Other Statutory Return</option></select></label><label>Authority *<input name="authority" required placeholder="e.g. Government Authority"></label><label>Reporting Period *<input name="period" type="month" required></label><label>Due Date *<input name="dueDate" type="date" required></label><label>Submission Date<input name="submissionDate" type="date"></label><label>Amount (AED)<input name="amount" type="number" min="0" step="0.01" value="0"></label><label>Reference Number<input name="referenceNumber" placeholder="e.g. REF-2026-001"></label><label>Status<select name="status"><option>Pending</option><option>Submitted</option><option>Overdue</option><option>Draft</option></select></label><label class="returns-full">Notes<textarea name="notes" placeholder="Additional notes or comments..."></textarea></label></div><div class="returns-form-actions"><button class="btn-secondary" type="button" data-return-close-form>Cancel</button><button class="btn-primary" type="submit">Save Return</button></div></form></div></div><div class="returns-overlay hidden" data-return-preview-overlay><div class="returns-modal returns-preview-modal"><div class="returns-modal-header"><div><h3>Statutory Return Preview</h3><p>Review return information before printing</p></div><button class="returns-close" type="button" data-return-close-preview aria-label="Close"><i class="fas fa-times"></i></button></div><div class="returns-preview-body" data-return-preview-content></div><div class="returns-preview-actions"><button class="btn-secondary" type="button" data-return-close-preview>Close</button><button class="btn-primary" type="button" data-return-print><i class="fas fa-print"></i> Print Return</button></div></div></div>`;
        const key = 'schoolStatutoryReturns'; const seed = [{ id: 1, returnNo: 'SR-2026-001', returnType: 'Pension Contribution', authority: 'Government Pension Authority', period: '2026-08', dueDate: '2026-08-20', submissionDate: '2026-08-18', amount: 18450, referenceNumber: 'PEN-45821', status: 'Submitted', notes: 'August pension contribution submitted successfully.' }, { id: 2, returnNo: 'SR-2026-002', returnType: 'Income Tax', authority: 'Tax Authority', period: '2026-08', dueDate: '2026-08-31', submissionDate: '', amount: 27680, referenceNumber: '', status: 'Pending', notes: 'Awaiting payroll reconciliation.' }, { id: 3, returnNo: 'SR-2026-003', returnType: 'Social Security', authority: 'Social Security Authority', period: '2026-07', dueDate: '2026-08-10', submissionDate: '', amount: 12950, referenceNumber: '', status: 'Overdue', notes: 'Submission requires immediate attention.' }, { id: 4, returnNo: 'SR-2026-004', returnType: 'Labour Return', authority: 'Labour Department', period: '2026-08', dueDate: '2026-09-05', submissionDate: '', amount: 0, referenceNumber: '', status: 'Draft', notes: 'Draft prepared for review.' }]; let returns; try { returns = JSON.parse(localStorage.getItem(key)) || seed; } catch (error) { returns = seed; }
        const money = value => `AED ${Number(value || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char])); const period = value => { if (!value) return '-'; const [year, month] = value.split('-'); return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); }; const date = value => { if (!value) return '—'; const parsed = new Date(`${value}T00:00:00`); return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }); }; const formOverlay = sec.querySelector('[data-return-form-overlay]'); const previewOverlay = sec.querySelector('[data-return-preview-overlay]'); const form = sec.querySelector('[data-return-form]'); const save = () => localStorage.setItem(key, JSON.stringify(returns));
        const render = () => { const query = sec.querySelector('[data-return-search]').value.toLowerCase(); const filter = sec.querySelector('[data-return-filter]').value; const found = returns.filter(item => (!filter || item.status === filter) && [item.returnType, item.authority, item.returnNo, item.referenceNumber].join(' ').toLowerCase().includes(query)); sec.querySelector('[data-return-table]').innerHTML = found.map(item => `<tr><td><div class="return-employee"><span><i class="fas fa-scale-balanced"></i></span><div><strong>${escape(item.returnType)}</strong><small>${escape(item.returnNo)}</small></div></div></td><td>${escape(item.authority)}</td><td>${period(item.period)}</td><td>${date(item.dueDate)}</td><td>${date(item.submissionDate)}</td><td><strong>${money(item.amount)}</strong></td><td><span class="return-badge ${item.status.toLowerCase()}">${escape(item.status)}</span></td><td><div class="return-row-actions"><button type="button" title="Preview" data-return-action="preview" data-id="${item.id}"><i class="fas fa-eye"></i></button><button type="button" title="Edit" data-return-action="edit" data-id="${item.id}"><i class="fas fa-pen"></i></button><button type="button" title="Delete" data-return-action="delete" data-id="${item.id}"><i class="fas fa-trash"></i></button></div></td></tr>`).join(''); sec.querySelector('[data-return-empty]').classList.toggle('hidden', found.length > 0); sec.querySelector('[data-return-stat="total"]').textContent = returns.length; sec.querySelector('[data-return-stat="submitted"]').textContent = returns.filter(item => item.status === 'Submitted').length; sec.querySelector('[data-return-stat="pending"]').textContent = returns.filter(item => item.status === 'Pending').length; sec.querySelector('[data-return-stat="amount"]').textContent = money(returns.reduce((sum, item) => sum + Number(item.amount || 0), 0)); };
        const reset = () => { form.reset(); form.elements.id.value = ''; form.elements.period.value = new Date().toISOString().slice(0, 7); form.elements.amount.value = 0; sec.querySelector('[data-return-form-title]').textContent = 'Add Statutory Return'; }; const openForm = item => { if (!item) reset(); else { Object.keys(item).forEach(field => { if (form.elements[field]) form.elements[field].value = item[field]; }); sec.querySelector('[data-return-form-title]').textContent = 'Edit Statutory Return'; } formOverlay.classList.remove('hidden'); form.elements.returnType.focus(); }; const openPreview = item => { sec.querySelector('[data-return-preview-content]').innerHTML = `<div class="return-document"><div class="return-document-header"><strong>GREEN VALLEY INTERNATIONAL SCHOOL</strong><span>Finance & Administration Department</span><b>STATUTORY RETURN RECORD</b></div><h4>Return Information</h4><div class="return-info-grid"><div><small>Return Number</small>${escape(item.returnNo)}</div><div><small>Return Type</small>${escape(item.returnType)}</div><div><small>Authority</small>${escape(item.authority)}</div><div><small>Reporting Period</small>${period(item.period)}</div><div><small>Due Date</small>${date(item.dueDate)}</div><div><small>Submission Date</small>${item.submissionDate ? date(item.submissionDate) : 'Not submitted'}</div><div><small>Reference Number</small>${escape(item.referenceNumber || '—')}</div><div><small>Status</small>${escape(item.status)}</div></div><h4>Financial Information</h4><div class="return-info-grid"><div><small>Return Amount</small>${money(item.amount)}</div></div><h4>Notes</h4><div class="return-notes">${escape(item.notes || 'No additional notes.')}</div><div class="return-signatures"><span>Finance Officer</span><span>Authorized Signatory</span></div></div>`; previewOverlay.classList.remove('hidden'); };
        form.addEventListener('submit', event => { event.preventDefault(); const item = Object.fromEntries(new FormData(form).entries()); item.id = item.id ? Number(item.id) : Date.now(); item.returnNo = item.id && returns.find(record => record.id === item.id)?.returnNo || `SR-${new Date().getFullYear()}-${String(returns.length + 1).padStart(3, '0')}`; item.amount = Number(item.amount || 0); const index = returns.findIndex(record => record.id === item.id); if (index === -1) returns.unshift(item); else returns[index] = item; save(); render(); formOverlay.classList.add('hidden'); }); sec.querySelector('[data-return-new]').addEventListener('click', () => openForm()); sec.querySelectorAll('[data-return-close-form]').forEach(button => button.addEventListener('click', () => formOverlay.classList.add('hidden'))); sec.querySelectorAll('[data-return-close-preview]').forEach(button => button.addEventListener('click', () => previewOverlay.classList.add('hidden'))); sec.querySelector('[data-return-search]').addEventListener('input', render); sec.querySelector('[data-return-filter]').addEventListener('change', render);
        sec.querySelector('[data-return-table]').addEventListener('click', event => { const button = event.target.closest('[data-return-action]'); if (!button) return; const item = returns.find(record => record.id === Number(button.dataset.id)); if (!item) return; if (button.dataset.returnAction === 'preview') openPreview(item); if (button.dataset.returnAction === 'edit') openForm(item); if (button.dataset.returnAction === 'delete' && confirm(`Delete statutory return ${item.returnNo}?`)) { returns = returns.filter(record => record.id !== item.id); save(); render(); } }); sec.querySelector('[data-return-export]').addEventListener('click', () => { const rows = [['Return Number', 'Return Type', 'Authority', 'Period', 'Due Date', 'Submission Date', 'Amount', 'Reference Number', 'Status', 'Notes'], ...returns.map(item => [item.returnNo, item.returnType, item.authority, item.period, item.dueDate, item.submissionDate, item.amount, item.referenceNumber, item.status, item.notes])]; const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'school-statutory-returns.csv'; link.click(); URL.revokeObjectURL(link.href); }); sec.querySelector('[data-return-print]').addEventListener('click', () => { const content = sec.querySelector('[data-return-preview-content]').innerHTML; const printWindow = window.open('', '_blank'); if (!printWindow) return; printWindow.document.write(`<html><head><title>Statutory Return</title><link rel="stylesheet" href="statutory-returns.css"></head><body>${content}</body></html>`); printWindow.document.close(); printWindow.focus(); printWindow.print(); }); render(); return sec;
    }

    function createPayrollReportsModule() {
        const sec = document.createElement('section');
        sec.className = 'module payroll-reports-module hidden';
        sec.id = 'payrollReportsModule';
        sec.innerHTML = `<div class="reports-header"><div class="reports-title"><div class="reports-icon"><i class="fas fa-chart-column"></i></div><div><h2>Payroll Reports</h2><p>Generate, review and manage school payroll reports</p></div></div><div class="reports-actions"><button class="btn-secondary" type="button" data-report-export><i class="fas fa-download"></i> Export CSV</button><button class="btn-primary" type="button" data-report-new><i class="fas fa-plus"></i> Create Payroll Report</button></div></div><div class="reports-stats"><div><i class="fas fa-chart-column"></i><span>Total Reports</span><strong data-report-stat="total">0</strong><small>Payroll reports generated</small></div><div><i class="fas fa-check-circle"></i><span>Completed</span><strong data-report-stat="completed">0</strong><small>Ready for review</small></div><div><i class="fas fa-hourglass-half"></i><span>Processing</span><strong data-report-stat="processing">0</strong><small>Reports in progress</small></div><div><i class="fas fa-money-bill-wave"></i><span>Total Payroll</span><strong data-report-stat="totalPayroll">AED 0</strong><small>Reported payroll value</small></div></div><div class="reports-card"><div class="reports-toolbar"><div><h3>Payroll Report Records</h3><p>Review payroll summaries, deductions and net salary information</p></div><div class="reports-filters"><label><i class="fas fa-search"></i><input data-report-search type="search" placeholder="Search report..."></label><select data-report-period><option value="">All Periods</option><option value="2026-08">August 2026</option><option value="2026-07">July 2026</option><option value="2026-06">June 2026</option></select><select data-report-status><option value="">All Status</option><option>Completed</option><option>Processing</option><option>Draft</option></select></div></div><div class="reports-table-wrap"><table><thead><tr><th>Report</th><th>Period</th><th>Employees</th><th>Gross Salary</th><th>Deductions</th><th>Net Salary</th><th>Generated</th><th>Status</th><th>Actions</th></tr></thead><tbody data-report-table></tbody></table><div class="reports-empty hidden" data-report-empty><i class="fas fa-chart-column"></i><strong>No payroll reports found</strong><span>Try changing your search or create a new payroll report.</span></div></div></div><div class="report-overlay hidden" data-report-form-overlay><div class="report-modal"><div class="report-modal-header"><div><h3 data-report-form-title>Create Payroll Report</h3><p>Enter payroll report information</p></div><button class="report-close" type="button" data-report-close-form aria-label="Close"><i class="fas fa-times"></i></button></div><form data-report-form><input type="hidden" name="id"><div class="report-form-grid"><label>Report Name *<input name="reportName" required placeholder="e.g. Monthly Payroll Summary"></label><label>Report Type *<select name="reportType" required><option value="">Select report type</option><option>Monthly Payroll Summary</option><option>Salary & Deductions Report</option><option>Department Payroll Report</option><option>Employee Payroll Report</option><option>Bank Payment Report</option><option>Payroll Tax Report</option></select></label><label>Payroll Period *<input name="period" type="month" required></label><label>Generated Date *<input name="generatedDate" type="date" required></label><label>Number of Employees *<input name="employees" type="number" min="0" required value="0"></label><label>Gross Salary (AED)<input name="grossSalary" type="number" min="0" step="0.01" value="0"></label><label>Total Deductions (AED)<input name="deductions" type="number" min="0" step="0.01" value="0"></label><label>Net Salary (AED)<input name="netSalary" type="number" readonly value="0"></label><label>Status<select name="status"><option>Completed</option><option>Processing</option><option>Draft</option></select></label><label>Prepared By<input name="preparedBy" placeholder="e.g. Finance Officer"></label><label class="report-full">Notes<textarea name="notes" placeholder="Additional report notes..."></textarea></label></div><div class="report-form-actions"><button class="btn-secondary" type="button" data-report-close-form>Cancel</button><button class="btn-primary" type="submit">Save Report</button></div></form></div></div><div class="report-overlay hidden" data-report-preview-overlay><div class="report-modal report-preview-modal"><div class="report-modal-header"><div><h3>Payroll Report Preview</h3><p>Review the report before printing</p></div><button class="report-close" type="button" data-report-close-preview aria-label="Close"><i class="fas fa-times"></i></button></div><div class="report-preview-body" data-report-preview-content></div><div class="report-preview-actions"><button class="btn-secondary" type="button" data-report-close-preview>Close</button><button class="btn-primary" type="button" data-report-print><i class="fas fa-print"></i> Print Report</button></div></div></div>`;
        const key = 'schoolPayrollReports'; const seed = [{ id: 1, reportNo: 'PR-2026-001', reportName: 'August Monthly Payroll', reportType: 'Monthly Payroll Summary', period: '2026-08', employees: 86, grossSalary: 428500, deductions: 68400, netSalary: 360100, generatedDate: '2026-08-25', status: 'Completed', preparedBy: 'Finance Officer', notes: 'August payroll report completed and approved.' }, { id: 2, reportNo: 'PR-2026-002', reportName: 'July Monthly Payroll', reportType: 'Monthly Payroll Summary', period: '2026-07', employees: 84, grossSalary: 416800, deductions: 65900, netSalary: 350900, generatedDate: '2026-07-26', status: 'Completed', preparedBy: 'Finance Officer', notes: 'July payroll report.' }, { id: 3, reportNo: 'PR-2026-003', reportName: 'August Bank Payment Report', reportType: 'Bank Payment Report', period: '2026-08', employees: 86, grossSalary: 428500, deductions: 68400, netSalary: 360100, generatedDate: '2026-08-26', status: 'Processing', preparedBy: 'Payroll Administrator', notes: 'Awaiting final bank reconciliation.' }, { id: 4, reportNo: 'PR-2026-004', reportName: 'June Payroll Summary', reportType: 'Monthly Payroll Summary', period: '2026-06', employees: 82, grossSalary: 402600, deductions: 63200, netSalary: 339400, generatedDate: '2026-06-25', status: 'Draft', preparedBy: 'Payroll Administrator', notes: 'Draft payroll report.' }]; let reports; try { reports = JSON.parse(localStorage.getItem(key)) || seed; } catch (error) { reports = seed; }
        const money = value => `AED ${Number(value || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char])); const period = value => { if (!value) return '-'; const [year, month] = value.split('-'); return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); }; const date = value => { if (!value) return '—'; const parsed = new Date(`${value}T00:00:00`); return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }); }; const formOverlay = sec.querySelector('[data-report-form-overlay]'); const previewOverlay = sec.querySelector('[data-report-preview-overlay]'); const form = sec.querySelector('[data-report-form]'); const save = () => localStorage.setItem(key, JSON.stringify(reports)); const calculate = () => { form.elements.netSalary.value = Math.max(0, Number(form.elements.grossSalary.value || 0) - Number(form.elements.deductions.value || 0)); }; const reset = () => { form.reset(); form.elements.id.value = ''; form.elements.period.value = new Date().toISOString().slice(0, 7); form.elements.generatedDate.value = new Date().toISOString().slice(0, 10); form.elements.grossSalary.value = 0; form.elements.deductions.value = 0; form.elements.netSalary.value = 0; form.elements.employees.value = 0; sec.querySelector('[data-report-form-title]').textContent = 'Create Payroll Report'; };
        const render = () => { const query = sec.querySelector('[data-report-search]').value.toLowerCase(); const selectedPeriod = sec.querySelector('[data-report-period]').value; const selectedStatus = sec.querySelector('[data-report-status]').value; const found = reports.filter(item => (!selectedPeriod || item.period === selectedPeriod) && (!selectedStatus || item.status === selectedStatus) && [item.reportName, item.reportType, item.reportNo, item.preparedBy].join(' ').toLowerCase().includes(query)); sec.querySelector('[data-report-table]').innerHTML = found.map(item => `<tr><td><div class="report-employee"><span><i class="fas fa-chart-column"></i></span><div><strong>${escape(item.reportName)}</strong><small>${escape(item.reportNo)}</small></div></div></td><td>${period(item.period)}</td><td>${Number(item.employees || 0).toLocaleString()}</td><td>${money(item.grossSalary)}</td><td>${money(item.deductions)}</td><td class="report-net">${money(item.netSalary)}</td><td>${date(item.generatedDate)}</td><td><span class="report-badge ${item.status.toLowerCase()}">${escape(item.status)}</span></td><td><div class="report-row-actions"><button type="button" title="Preview" data-report-action="preview" data-id="${item.id}"><i class="fas fa-eye"></i></button><button type="button" title="Edit" data-report-action="edit" data-id="${item.id}"><i class="fas fa-pen"></i></button><button type="button" title="Delete" data-report-action="delete" data-id="${item.id}"><i class="fas fa-trash"></i></button></div></td></tr>`).join(''); sec.querySelector('[data-report-empty]').classList.toggle('hidden', found.length > 0); sec.querySelector('[data-report-stat="total"]').textContent = reports.length; sec.querySelector('[data-report-stat="completed"]').textContent = reports.filter(item => item.status === 'Completed').length; sec.querySelector('[data-report-stat="processing"]').textContent = reports.filter(item => item.status === 'Processing').length; sec.querySelector('[data-report-stat="totalPayroll"]').textContent = money(reports.reduce((sum, item) => sum + Number(item.netSalary || 0), 0)); };
        const openPreview = item => { sec.querySelector('[data-report-preview-content]').innerHTML = `<div class="report-document"><div class="report-document-header"><strong>GREEN VALLEY INTERNATIONAL SCHOOL</strong><span>Finance & Payroll Department</span><b>PAYROLL REPORT</b></div><h4>Report Information</h4><div class="report-info-grid"><div><small>Report Number</small>${escape(item.reportNo)}</div><div><small>Report Name</small>${escape(item.reportName)}</div><div><small>Report Type</small>${escape(item.reportType)}</div><div><small>Payroll Period</small>${period(item.period)}</div><div><small>Generated Date</small>${date(item.generatedDate)}</div><div><small>Prepared By</small>${escape(item.preparedBy || '—')}</div><div><small>Number of Employees</small>${Number(item.employees || 0).toLocaleString()}</div><div><small>Status</small>${escape(item.status)}</div></div><h4>Payroll Summary</h4><table><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody><tr><td>Gross Salary</td><td>${money(item.grossSalary)}</td></tr><tr><td>Total Deductions</td><td>${money(item.deductions)}</td></tr><tr class="report-net-row"><td>Net Salary</td><td>${money(item.netSalary)}</td></tr></tbody></table><h4>Notes</h4><div class="report-notes">${escape(item.notes || 'No additional notes.')}</div><div class="report-signatures"><span>Payroll Officer</span><span>Finance Manager</span></div></div>`; previewOverlay.classList.remove('hidden'); };
        const openForm = item => { if (!item) reset(); else { Object.keys(item).forEach(field => { if (form.elements[field]) form.elements[field].value = item[field]; }); sec.querySelector('[data-report-form-title]').textContent = 'Edit Payroll Report'; calculate(); } formOverlay.classList.remove('hidden'); form.elements.reportName.focus(); }; form.addEventListener('input', calculate); form.addEventListener('submit', event => { event.preventDefault(); calculate(); const item = Object.fromEntries(new FormData(form).entries()); item.id = item.id ? Number(item.id) : Date.now(); item.reportNo = reports.find(record => record.id === item.id)?.reportNo || `PR-${new Date().getFullYear()}-${String(reports.length + 1).padStart(3, '0')}`; ['employees', 'grossSalary', 'deductions', 'netSalary'].forEach(field => { item[field] = Number(item[field] || 0); }); const index = reports.findIndex(record => record.id === item.id); if (index === -1) reports.unshift(item); else reports[index] = item; save(); render(); formOverlay.classList.add('hidden'); });
        sec.querySelector('[data-report-new]').addEventListener('click', () => openForm()); sec.querySelectorAll('[data-report-close-form]').forEach(button => button.addEventListener('click', () => formOverlay.classList.add('hidden'))); sec.querySelectorAll('[data-report-close-preview]').forEach(button => button.addEventListener('click', () => previewOverlay.classList.add('hidden'))); sec.querySelector('[data-report-search]').addEventListener('input', render); sec.querySelector('[data-report-period]').addEventListener('change', render); sec.querySelector('[data-report-status]').addEventListener('change', render); sec.querySelector('[data-report-table]').addEventListener('click', event => { const button = event.target.closest('[data-report-action]'); if (!button) return; const item = reports.find(record => record.id === Number(button.dataset.id)); if (!item) return; if (button.dataset.reportAction === 'preview') openPreview(item); if (button.dataset.reportAction === 'edit') openForm(item); if (button.dataset.reportAction === 'delete' && confirm(`Delete payroll report ${item.reportNo}?`)) { reports = reports.filter(record => record.id !== item.id); save(); render(); } }); sec.querySelector('[data-report-export]').addEventListener('click', () => { const rows = [['Report Number', 'Report Name', 'Report Type', 'Period', 'Employees', 'Gross Salary', 'Deductions', 'Net Salary', 'Generated Date', 'Status', 'Prepared By', 'Notes'], ...reports.map(item => [item.reportNo, item.reportName, item.reportType, item.period, item.employees, item.grossSalary, item.deductions, item.netSalary, item.generatedDate, item.status, item.preparedBy, item.notes])]; const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'school-payroll-reports.csv'; link.click(); URL.revokeObjectURL(link.href); }); sec.querySelector('[data-report-print]').addEventListener('click', () => { const content = sec.querySelector('[data-report-preview-content]').innerHTML; const printWindow = window.open('', '_blank'); if (!printWindow) return; printWindow.document.write(`<html><head><title>Payroll Report</title><link rel="stylesheet" href="payroll-reports.css"></head><body>${content}</body></html>`); printWindow.document.close(); printWindow.focus(); printWindow.print(); }); render(); return sec;
    }

    function createFeeInvoicesModule() {
        const sec = document.createElement('section');
        sec.className = 'module fee-invoices-module hidden';
        sec.id = 'feeInvoicesModule';
        sec.innerHTML = `
            <style>
                .fee-invoices-module { width: 100%; padding: 0; }
                .fee-invoices-module * { box-sizing: border-box; }
                .fee-invoices-section { max-width: 1400px; margin: 0 auto; padding: 24px 0 0; }
                .invoice-header { display: flex; justify-content: space-between; align-items: center; gap: 15px; margin-bottom: 20px; }
                .invoice-title { display: flex; align-items: center; gap: 13px; }
                .invoice-icon { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #eef2ff, #e0e7ff); color: #4f46e5; display: grid; place-items: center; font-size: 21px; font-weight: 800; }
                .invoice-title h2 { font-size: 22px; letter-spacing: -.4px; margin: 0; }
                .invoice-title p { color: #7b8494; font-size: 12px; margin-top: 4px; }
                .invoice-main-btn { border: 0; color: white; background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 11px 18px; border-radius: 10px; font-size: 12px; font-weight: 750; cursor: pointer; box-shadow: 0 8px 22px rgba(79,70,229,.20); transition: .2s; }
                .invoice-main-btn:hover { transform: translateY(-1px); box-shadow: 0 11px 28px rgba(79,70,229,.28); }
                .invoice-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 17px; overflow: hidden; box-shadow: 0 10px 35px rgba(15,23,42,.06); }
                .filter-bar { padding: 17px; border-bottom: 1px solid #edf0f3; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
                .filter-left, .filter-right { display: flex; gap: 9px; align-items: center; flex-wrap: wrap; }
                .search-box { position: relative; }
                .search-icon { position: absolute; left: 12px; top: 9px; color: #9ca3af; }
                .search { width: 260px; height: 38px; border: 1px solid #e1e5eb; border-radius: 9px; padding: 0 12px 0 35px; outline: none; background: #fafbfc; font-size: 12px; }
                .search:focus, .filter:focus { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }
                .filter { height: 38px; border: 1px solid #e1e5eb; border-radius: 9px; padding: 0 10px; outline: none; background: #fafbfc; color: #4b5563; font-size: 11px; }
                .table-wrapper { overflow-x: auto; }
                .invoice-table { width: 100%; min-width: 1050px; border-collapse: collapse; }
                .invoice-table th { background: #fafbfc; color: #7b8494; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; padding: 13px 17px; text-align: left; border-bottom: 1px solid #e8ebef; white-space: nowrap; }
                .invoice-table td { padding: 14px 17px; font-size: 12px; border-bottom: 1px solid #f0f2f4; white-space: nowrap; }
                .invoice-table tbody tr:hover { background: #fafbff; }
                .invoice-number { color: #4f46e5; font-weight: 750; }
                .student { display: flex; align-items: center; gap: 9px; }
                .student-avatar { width: 34px; height: 34px; border-radius: 10px; background: #eef2ff; color: #4f46e5; display: grid; place-items: center; font-size: 10px; font-weight: 800; }
                .student-name { font-weight: 700; }
                .student-id { color: #929aa8; font-size: 10px; margin-top: 2px; }
                .class-name { color: #64748b; font-size: 11px; }
                .amount { font-weight: 800; }
                .status { display: inline-flex; align-items: center; gap: 5px; padding: 5px 9px; border-radius: 50px; font-size: 9px; font-weight: 750; }
                .status::before { content: ""; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
                .paid { color: #15803d; background: #dcfce7; }
                .pending { color: #b45309; background: #fef3c7; }
                .overdue { color: #dc2626; background: #fee2e2; }
                .partial { color: #0369a1; background: #e0f2fe; }
                .actions { display: flex; gap: 5px; }
                .action-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e6eb; background: white; color: #667085; cursor: pointer; transition: .18s; }
                .action-btn:hover { color: #4f46e5; background: #eef2ff; border-color: #c7d2fe; }
                .action-btn.print:hover { color: #059669; background: #ecfdf5; border-color: #a7f3d0; }
                .action-btn.download:hover { color: #2563eb; background: #eff6ff; border-color: #bfdbfe; }
                .table-footer { padding: 14px 17px; display: flex; justify-content: space-between; align-items: center; color: #7b8494; font-size: 11px; }
                .pagination { display: flex; gap: 5px; }
                .page { width: 30px; height: 30px; border: 1px solid #e1e5eb; background: white; border-radius: 7px; cursor: pointer; font-size: 11px; }
                .page.active { background: #4f46e5; border-color: #4f46e5; color: white; }
                .modal { position: fixed; inset: 0; background: rgba(15,23,42,.58); backdrop-filter: blur(5px); display: none; align-items: center; justify-content: center; padding: 20px; z-index: 9999; }
                .modal.show { display: flex; }
                .modal-box { width: min(900px, 100%); max-height: 92vh; overflow-y: auto; background: white; border-radius: 17px; box-shadow: 0 25px 70px rgba(0,0,0,.2); }
                .modal-header { padding: 17px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; }
                .modal-header h3 { font-size: 16px; margin: 0; }
                .modal-header p { color: #7b8494; font-size: 10px; margin-top: 3px; }
                .close-btn { width: 34px; height: 34px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; font-size: 19px; cursor: pointer; }
                .modal-body { padding: 25px; }
                .invoice-document { border: 1px solid #e1e5eb; padding: 30px; border-radius: 10px; }
                .invoice-top { display: flex; justify-content: space-between; gap: 20px; padding-bottom: 18px; border-bottom: 2px solid #172033; margin-bottom: 20px; }
                .school-info { display: flex; align-items: center; gap: 12px; }
                .school-logo { width: 50px; height: 50px; border-radius: 12px; background: #eef2ff; color: #4f46e5; display: grid; place-items: center; font-weight: 800; }
                .school-info h2 { font-size: 16px; margin: 0; }
                .school-info p { color: #7b8494; font-size: 10px; margin-top: 3px; }
                .invoice-heading { text-align: right; }
                .invoice-heading h1 { font-size: 24px; margin: 0; }
                .invoice-heading span { color: #64748b; font-size: 10px; }
                .invoice-info-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 22px; }
                .info-box { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 11px; }
                .info-box label { display: block; color: #94a3b8; font-size: 8px; text-transform: uppercase; margin-bottom: 5px; }
                .info-box strong { font-size: 11px; }
                .fee-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .fee-table th, .fee-table td { border: 1px solid #e5e7eb; padding: 10px; font-size: 11px; }
                .fee-table th { background: #f8fafc; text-align: left; }
                .invoice-totals { width: 270px; margin-left: auto; }
                .total-row { display: flex; justify-content: space-between; padding: 7px 0; color: #64748b; font-size: 11px; }
                .total-row.final { border-top: 2px solid #172033; padding-top: 10px; color: #172033; font-weight: 800; font-size: 14px; }
                .payment-note { margin-top: 25px; padding: 12px; border-radius: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-size: 10px; }
                .modal-footer { border-top: 1px solid #e5e7eb; padding: 14px 20px; display: flex; justify-content: flex-end; gap: 8px; }
                .btn { border: 0; border-radius: 8px; padding: 9px 14px; font-size: 11px; font-weight: 700; cursor: pointer; }
                .btn-light { background: #f1f5f9; color: #334155; }
                .btn-primary { background: #4f46e5; color: white; }
                @media(max-width:700px) { .invoice-header { flex-direction: column; align-items: flex-start; } .invoice-main-btn { width: 100%; } .filter-left, .filter-right { width: 100%; } .search { width: 100%; } .filter { flex: 1; } .invoice-info-grid { grid-template-columns: 1fr; } .invoice-top { flex-direction: column; } .invoice-heading { text-align: left; } .invoice-document { padding: 15px; } .table-footer { flex-direction: column; gap: 12px; } }
                @media print { body * { visibility: hidden !important; } #invoicePreviewModal, #invoicePreviewModal * { visibility: visible !important; } #invoicePreviewModal { position: absolute; inset: 0; display: block !important; background: white; padding: 0; } .modal-box { width: 100%; max-height: none; box-shadow: none; border-radius: 0; } .modal-header, .modal-footer { display: none !important; } .modal-body { padding: 0; } .invoice-document { border: 0; } }
            </style>
            <div class="fee-invoices-section" id="invoicesSection">
                <div class="invoice-header">
                    <div class="invoice-title">
                        <div class="invoice-icon">₹</div>
                        <div>
                            <h2>Fee Invoices</h2>
                            <p>Manage student fee invoices and payment records</p>
                        </div>
                    </div>
                    <button class="invoice-main-btn" type="button" onclick="openInvoices()">+ Fee Invoices</button>
                </div>
                <div class="invoice-card">
                    <div class="filter-bar">
                        <div class="filter-left">
                            <div class="search-box">
                                <span class="search-icon">⌕</span>
                                <input type="text" id="invoiceSearch" class="search" placeholder="Search invoice or student..." oninput="filterInvoices()">
                            </div>
                            <select id="invoiceStatus" class="filter" onchange="filterInvoices()">
                                <option value="">All Status</option>
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                                <option value="Overdue">Overdue</option>
                                <option value="Partial">Partial</option>
                            </select>
                            <select id="invoiceClass" class="filter" onchange="filterInvoices()">
                                <option value="">All Classes</option>
                                <option value="Grade 10">Grade 10</option>
                                <option value="Grade 9">Grade 9</option>
                                <option value="Grade 8">Grade 8</option>
                                <option value="Grade 7">Grade 7</option>
                            </select>
                        </div>
                        <div class="filter-right">
                            <input type="date" id="invoiceDate" class="filter" onchange="filterInvoices()">
                            <button class="btn btn-light" type="button" onclick="resetInvoiceFilters()">↻ Reset</button>
                        </div>
                    </div>
                    <div class="table-wrapper">
                        <table class="invoice-table" id="invoiceTable">
                            <thead>
                                <tr>
                                    <th>Invoice No.</th>
                                    <th>Student</th>
                                    <th>Class</th>
                                    <th>Invoice Date</th>
                                    <th>Due Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr data-status="Paid" data-class="Grade 10" data-date="2026-08-20">
                                    <td><span class="invoice-number">INV-2026-00125</span></td>
                                    <td>
                                        <div class="student">
                                            <div class="student-avatar">AK</div>
                                            <div>
                                                <div class="student-name">Ahmed Khan</div>
                                                <div class="student-id">STU-10245</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span class="class-name">Grade 10 - A</span></td>
                                    <td>20 Aug 2026</td>
                                    <td>30 Aug 2026</td>
                                    <td class="amount">$2,450.00</td>
                                    <td><span class="status paid">Paid</span></td>
                                    <td>
                                        <div class="actions">
                                            <button class="action-btn" type="button" title="View" onclick="viewInvoice('INV-2026-00125')">👁</button>
                                            <button class="action-btn print" type="button" title="Print" onclick="printInvoice('INV-2026-00125')">🖨</button>
                                            <button class="action-btn download" type="button" title="Download" onclick="downloadInvoice('INV-2026-00125')">↓</button>
                                        </div>
                                    </td>
                                </tr>
                                <tr data-status="Pending" data-class="Grade 9" data-date="2026-08-18">
                                    <td><span class="invoice-number">INV-2026-00124</span></td>
                                    <td>
                                        <div class="student">
                                            <div class="student-avatar">SA</div>
                                            <div>
                                                <div class="student-name">Sara Ali</div>
                                                <div class="student-id">STU-10231</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span class="class-name">Grade 9 - B</span></td>
                                    <td>18 Aug 2026</td>
                                    <td>28 Aug 2026</td>
                                    <td class="amount">$2,150.00</td>
                                    <td><span class="status pending">Pending</span></td>
                                    <td>
                                        <div class="actions">
                                            <button class="action-btn" type="button" onclick="viewInvoice('INV-2026-00124')">👁</button>
                                            <button class="action-btn print" type="button" onclick="printInvoice('INV-2026-00124')">🖨</button>
                                            <button class="action-btn download" type="button" onclick="downloadInvoice('INV-2026-00124')">↓</button>
                                        </div>
                                    </td>
                                </tr>
                                <tr data-status="Overdue" data-class="Grade 8" data-date="2026-08-10">
                                    <td><span class="invoice-number">INV-2026-00123</span></td>
                                    <td>
                                        <div class="student">
                                            <div class="student-avatar">OM</div>
                                            <div>
                                                <div class="student-name">Omar Mohammed</div>
                                                <div class="student-id">STU-10198</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span class="class-name">Grade 8 - A</span></td>
                                    <td>10 Aug 2026</td>
                                    <td>20 Aug 2026</td>
                                    <td class="amount">$1,850.00</td>
                                    <td><span class="status overdue">Overdue</span></td>
                                    <td>
                                        <div class="actions">
                                            <button class="action-btn" type="button" onclick="viewInvoice('INV-2026-00123')">👁</button>
                                            <button class="action-btn print" type="button" onclick="printInvoice('INV-2026-00123')">🖨</button>
                                            <button class="action-btn download" type="button" onclick="downloadInvoice('INV-2026-00123')">↓</button>
                                        </div>
                                    </td>
                                </tr>
                                <tr data-status="Partial" data-class="Grade 7" data-date="2026-08-05">
                                    <td><span class="invoice-number">INV-2026-00122</span></td>
                                    <td>
                                        <div class="student">
                                            <div class="student-avatar">LN</div>
                                            <div>
                                                <div class="student-name">Lina Noor</div>
                                                <div class="student-id">STU-10176</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span class="class-name">Grade 7 - A</span></td>
                                    <td>05 Aug 2026</td>
                                    <td>15 Aug 2026</td>
                                    <td class="amount">$1,650.00</td>
                                    <td><span class="status partial">Partial</span></td>
                                    <td>
                                        <div class="actions">
                                            <button class="action-btn" type="button" onclick="viewInvoice('INV-2026-00122')">👁</button>
                                            <button class="action-btn print" type="button" onclick="printInvoice('INV-2026-00122')">🖨</button>
                                            <button class="action-btn download" type="button" onclick="downloadInvoice('INV-2026-00122')">↓</button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="table-footer">
                        <span>Showing <strong id="invoiceCount">4</strong> invoices</span>
                        <div class="pagination">
                            <button class="page" type="button">‹</button>
                            <button class="page active" type="button">1</button>
                            <button class="page" type="button">2</button>
                            <button class="page" type="button">3</button>
                            <button class="page" type="button">›</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal" id="invoicePreviewModal">
                <div class="modal-box">
                    <div class="modal-header">
                        <div>
                            <h3>Fee Invoice Preview</h3>
                            <p>Student fee invoice document</p>
                        </div>
                        <button class="close-btn" type="button" onclick="closeInvoiceModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="invoice-document">
                            <div class="invoice-top">
                                <div class="school-info">
                                    <div class="school-logo">GV</div>
                                    <div>
                                        <h2>Green Valley International School</h2>
                                        <p>Finance & Accounts Department</p>
                                        <p>Abu Dhabi, UAE</p>
                                    </div>
                                </div>
                                <div class="invoice-heading">
                                    <h1>FEE INVOICE</h1>
                                    <span id="previewInvoiceNumber">INV-2026-00125</span>
                                </div>
                            </div>
                            <div class="invoice-info-grid">
                                <div class="info-box"><label>Student</label><strong id="previewStudent">Ahmed Khan</strong></div>
                                <div class="info-box"><label>Student ID</label><strong id="previewStudentId">STU-10245</strong></div>
                                <div class="info-box"><label>Class</label><strong id="previewClass">Grade 10 - A</strong></div>
                                <div class="info-box"><label>Invoice Date</label><strong id="previewInvoiceDate">20 Aug 2026</strong></div>
                                <div class="info-box"><label>Due Date</label><strong id="previewDueDate">30 Aug 2026</strong></div>
                                <div class="info-box"><label>Status</label><strong id="previewStatus" style="color:#15803d">Paid</strong></div>
                            </div>
                            <table class="fee-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Fee Description</th>
                                        <th>Term</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>1</td><td>Tuition Fee</td><td>Term 1</td><td>$1,800.00</td></tr>
                                    <tr><td>2</td><td>Transportation Fee</td><td>Term 1</td><td>$400.00</td></tr>
                                    <tr><td>3</td><td>Activity Fee</td><td>Term 1</td><td>$250.00</td></tr>
                                </tbody>
                            </table>
                            <div class="invoice-totals">
                                <div class="total-row"><span>Subtotal</span><strong>$2,450.00</strong></div>
                                <div class="total-row"><span>Discount</span><strong>$0.00</strong></div>
                                <div class="total-row final"><span>Total Due</span><strong>$2,450.00</strong></div>
                            </div>
                            <div class="payment-note">✓ Payment status: <strong id="previewPaymentStatus">Paid</strong> — Thank you for keeping your school fee account up to date.</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-light" type="button" onclick="closeInvoiceModal()">Close</button>
                        <button class="btn btn-primary" type="button" onclick="window.print()">🖨 Print Invoice</button>
                    </div>
                </div>
            </div>
        `;

        const invoiceData = {
            'INV-2026-00125': { number: 'INV-2026-00125', student: 'Ahmed Khan', studentId: 'STU-10245', className: 'Grade 10 - A', invoiceDate: '20 Aug 2026', dueDate: '30 Aug 2026', status: 'Paid' },
            'INV-2026-00124': { number: 'INV-2026-00124', student: 'Sara Ali', studentId: 'STU-10231', className: 'Grade 9 - B', invoiceDate: '18 Aug 2026', dueDate: '28 Aug 2026', status: 'Pending' },
            'INV-2026-00123': { number: 'INV-2026-00123', student: 'Omar Mohammed', studentId: 'STU-10198', className: 'Grade 8 - A', invoiceDate: '10 Aug 2026', dueDate: '20 Aug 2026', status: 'Overdue' },
            'INV-2026-00122': { number: 'INV-2026-00122', student: 'Lina Noor', studentId: 'STU-10176', className: 'Grade 7 - A', invoiceDate: '05 Aug 2026', dueDate: '15 Aug 2026', status: 'Partial' }
        };

        window.openInvoices = function () {
            const section = document.getElementById('feeInvoicesModule');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };

        window.viewInvoice = function (invoiceNumber) {
            const invoice = invoiceData[invoiceNumber];
            if (!invoice) {
                console.error('Invoice not found:', invoiceNumber);
                return;
            }
            document.getElementById('previewInvoiceNumber').textContent = invoice.number;
            document.getElementById('previewStudent').textContent = invoice.student;
            document.getElementById('previewStudentId').textContent = invoice.studentId;
            document.getElementById('previewClass').textContent = invoice.className;
            document.getElementById('previewInvoiceDate').textContent = invoice.invoiceDate;
            document.getElementById('previewDueDate').textContent = invoice.dueDate;
            document.getElementById('previewStatus').textContent = invoice.status;
            document.getElementById('previewPaymentStatus').textContent = invoice.status;
            const statusEl = document.getElementById('previewStatus');
            statusEl.style.color = invoice.status === 'Paid' ? '#15803d' : invoice.status === 'Pending' ? '#b45309' : invoice.status === 'Overdue' ? '#dc2626' : '#0369a1';
            document.getElementById('invoicePreviewModal').classList.add('show');
        };

        window.printInvoice = function (invoiceNumber) {
            window.viewInvoice(invoiceNumber);
            setTimeout(() => { window.print(); }, 300);
        };

        window.downloadInvoice = function (invoiceNumber) {
            const invoice = invoiceData[invoiceNumber];
            if (!invoice) return;
            const invoiceText = `
GREEN VALLEY INTERNATIONAL SCHOOL
========================================
FEE INVOICE
Invoice Number: ${invoice.number}
Student: ${invoice.student}
Student ID: ${invoice.studentId}
Class: ${invoice.className}
Invoice Date: ${invoice.invoiceDate}
Due Date: ${invoice.dueDate}
Status: ${invoice.status}
----------------------------------------
FEE DETAILS
----------------------------------------
Tuition Fee              $1,800.00
Transportation Fee       $400.00
Activity Fee             $250.00
----------------------------------------
TOTAL DUE                $2,450.00
----------------------------------------
Thank you.
Green Valley International School
Finance & Accounts Department
`;
            const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${invoice.number}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        };

        window.closeInvoiceModal = function () {
            document.getElementById('invoicePreviewModal').classList.remove('show');
        };

        window.filterInvoices = function () {
            const searchInput = sec.querySelector('#invoiceSearch');
            const statusInput = sec.querySelector('#invoiceStatus');
            const classInput = sec.querySelector('#invoiceClass');
            const dateInput = sec.querySelector('#invoiceDate');
            const countEl = sec.querySelector('#invoiceCount');
            const rows = sec.querySelectorAll('#invoiceTable tbody tr');

            if (!searchInput || !statusInput || !classInput || !dateInput || !countEl) {
                return;
            }

            const search = (searchInput.value || '').toLowerCase();
            const status = statusInput.value;
            const classValue = classInput.value;
            const date = dateInput.value;
            let visibleCount = 0;

            rows.forEach(function (row) {
                const text = row.innerText.toLowerCase();
                const rowStatus = row.dataset.status;
                const rowClass = row.dataset.class;
                const rowDate = row.dataset.date;
                const matchesSearch = !search || text.includes(search);
                const matchesStatus = !status || rowStatus === status;
                const matchesClass = !classValue || rowClass === classValue;
                const matchesDate = !date || rowDate === date;
                const show = matchesSearch && matchesStatus && matchesClass && matchesDate;
                row.style.display = show ? '' : 'none';
                if (show) visibleCount++;
            });
            countEl.textContent = visibleCount;
        };

        window.resetInvoiceFilters = function () {
            const searchInput = sec.querySelector('#invoiceSearch');
            const statusInput = sec.querySelector('#invoiceStatus');
            const classInput = sec.querySelector('#invoiceClass');
            const dateInput = sec.querySelector('#invoiceDate');

            if (!searchInput || !statusInput || !classInput || !dateInput) {
                return;
            }

            searchInput.value = '';
            statusInput.value = '';
            classInput.value = '';
            dateInput.value = '';
            window.filterInvoices();
        };

        const modal = document.getElementById('invoicePreviewModal');
        if (modal) {
            modal.addEventListener('click', function (event) {
                if (event.target === this) {
                    window.closeInvoiceModal();
                }
            });
        }
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                window.closeInvoiceModal();
            }
        });
        window.filterInvoices();
        return sec;
    }

    function createClosedPOsModule() {
        const sec = document.createElement('section');
        sec.className = 'module closed-pos-module hidden';
        sec.id = 'closedPOsModule';
        sec.innerHTML = `
            <style>
                .closed-pos-module { width: 100%; padding: 0; }
                .closed-pos-module * { box-sizing: border-box; }
                .closed-po-section { max-width: 1400px; margin: 0 auto; padding: 24px 0 0; }
                .closed-po-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 15px; }
                .closed-po-title { display: flex; align-items: center; gap: 13px; }
                .closed-po-icon { width: 46px; height: 46px; border-radius: 13px; display: grid; place-items: center; background: #e8f8ef; color: #16a34a; font-size: 21px; font-weight: bold; }
                .closed-po-title h2 { font-size: 22px; letter-spacing: -.4px; margin: 0; }
                .closed-po-title p { color: #7b8494; font-size: 12px; margin-top: 4px; }
                .closed-po-btn { border: 0; background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; padding: 11px 17px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 7px 20px rgba(79,70,229,.20); transition: .2s; }
                .closed-po-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 25px rgba(79,70,229,.27); }
                .po-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 17px; box-shadow: 0 10px 35px rgba(15,23,42,.06); overflow: hidden; }
                .filter-bar { padding: 17px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; border-bottom: 1px solid #edf0f3; }
                .filter-left, .filter-right { display: flex; gap: 9px; align-items: center; flex-wrap: wrap; }
                .search-box { position: relative; }
                .search-box span { position: absolute; left: 12px; top: 10px; color: #9ca3af; }
                .search { width: 250px; height: 38px; border: 1px solid #e1e5eb; border-radius: 9px; padding: 0 12px 0 35px; outline: none; font-size: 12px; background: #fafbfc; }
                .search:focus, .filter:focus { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }
                .filter { height: 38px; border: 1px solid #e1e5eb; border-radius: 9px; padding: 0 10px; outline: none; background: #fafbfc; color: #4b5563; font-size: 11px; }
                .table-wrapper { overflow-x: auto; }
                .closed-pos-module table { width: 100%; min-width: 900px; border-collapse: collapse; }
                .closed-pos-module th { background: #fafbfc; color: #7b8494; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; padding: 13px 17px; text-align: left; border-bottom: 1px solid #e8ebef; white-space: nowrap; }
                .closed-pos-module td { padding: 14px 17px; font-size: 12px; border-bottom: 1px solid #f0f2f4; white-space: nowrap; }
                .closed-pos-module tbody tr:hover { background: #fafbff; }
                .po-number { color: #4f46e5; font-weight: 750; }
                .supplier { display: flex; align-items: center; gap: 9px; }
                .supplier-logo { width: 32px; height: 32px; border-radius: 9px; background: #eef2ff; color: #4f46e5; display: grid; place-items: center; font-size: 10px; font-weight: 800; }
                .supplier-name { font-weight: 650; }
                .supplier-type { color: #929aa8; font-size: 10px; margin-top: 2px; }
                .status { display: inline-flex; align-items: center; gap: 5px; padding: 5px 9px; border-radius: 50px; font-size: 9px; font-weight: 750; }
                .status::before { content: ""; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
                .closed { color: #15803d; background: #dcfce7; }
                .paid { color: #0369a1; background: #e0f2fe; }
                .partial { color: #b45309; background: #fef3c7; }
                .amount { font-weight: 750; }
                .actions { display: flex; gap: 5px; }
                .action-btn { width: 31px; height: 31px; border-radius: 8px; border: 1px solid #e2e6eb; background: white; color: #667085; cursor: pointer; transition: .18s; }
                .action-btn:hover { color: #4f46e5; background: #eef2ff; border-color: #c7d2fe; }
                .action-btn.print:hover { color: #059669; background: #ecfdf5; border-color: #a7f3d0; }
                .action-btn.download:hover { color: #2563eb; background: #eff6ff; border-color: #bfdbfe; }
                .table-footer { display: flex; justify-content: space-between; align-items: center; padding: 14px 17px; color: #7b8494; font-size: 11px; }
                .pagination { display: flex; gap: 5px; }
                .page { width: 30px; height: 30px; border: 1px solid #e1e5eb; background: white; border-radius: 7px; cursor: pointer; font-size: 11px; }
                .page.active { background: #4f46e5; border-color: #4f46e5; color: white; }
                .modal { position: fixed; inset: 0; background: rgba(15,23,42,.58); backdrop-filter: blur(5px); display: none; align-items: center; justify-content: center; padding: 20px; z-index: 100; }
                .modal.show { display: flex; }
                .modal-box { width: min(900px, 100%); max-height: 92vh; overflow-y: auto; background: white; border-radius: 17px; box-shadow: 0 25px 70px rgba(0,0,0,.2); }
                .modal-header { padding: 17px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; }
                .modal-header h3 { font-size: 16px; margin: 0; }
                .modal-header p { color: #7b8494; font-size: 10px; margin-top: 3px; }
                .close { width: 34px; height: 34px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; font-size: 19px; cursor: pointer; }
                .modal-body { padding: 25px; }
                .po-print { border: 1px solid #e1e5eb; padding: 30px; border-radius: 10px; background: white; }
                .po-heading { display: flex; justify-content: space-between; gap: 20px; padding-bottom: 18px; border-bottom: 2px solid #172033; margin-bottom: 20px; }
                .school { display: flex; gap: 12px; align-items: center; }
                .school-logo { width: 48px; height: 48px; border-radius: 11px; display: grid; place-items: center; background: #eef2ff; color: #4f46e5; font-weight: 800; }
                .school h2 { font-size: 16px; margin: 0; }
                .school p { color: #7b8494; font-size: 10px; margin-top: 3px; }
                .po-title { text-align: right; }
                .po-title h1 { font-size: 22px; margin: 0; }
                .po-title span { color: #6b7280; font-size: 10px; }
                .po-info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 22px; }
                .info { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 11px; }
                .info label { display: block; color: #94a3b8; font-size: 8px; text-transform: uppercase; margin-bottom: 5px; }
                .info strong { font-size: 11px; }
                .item-table { width: 100%; min-width: 0; border-collapse: collapse; margin-bottom: 20px; }
                .item-table th, .item-table td { border: 1px solid #e5e7eb; padding: 10px; }
                .item-table th { background: #f8fafc; }
                .totals { width: 260px; margin-left: auto; }
                .total-row { display: flex; justify-content: space-between; padding: 7px 0; color: #64748b; font-size: 11px; }
                .total-row.final { border-top: 2px solid #172033; padding-top: 10px; color: #172033; font-weight: 800; font-size: 14px; }
                .modal-footer { border-top: 1px solid #e5e7eb; padding: 14px 20px; display: flex; justify-content: flex-end; gap: 8px; }
                .btn { border: 0; border-radius: 8px; padding: 9px 14px; font-size: 11px; font-weight: 700; cursor: pointer; }
                .btn-light { background: #f1f5f9; color: #334155; }
                .btn-primary { background: #4f46e5; color: white; }
                @media(max-width:700px) { .closed-po-header { align-items: flex-start; flex-direction: column; } .closed-po-btn { width: 100%; } .search { width: 100%; } .filter-left, .filter-right { width: 100%; } .filter { flex: 1; } .po-info { grid-template-columns: 1fr; } .po-heading { flex-direction: column; } .po-title { text-align: left; } .po-print { padding: 15px; } .table-footer { flex-direction: column; gap: 12px; } }
                @media print { body * { visibility: hidden !important; } #previewModal, #previewModal * { visibility: visible !important; } #previewModal { position: absolute; inset: 0; display: block !important; background: white; padding: 0; } .modal-box { width: 100%; max-height: none; box-shadow: none; border-radius: 0; } .modal-header, .modal-footer { display: none !important; } .modal-body { padding: 0; } .po-print { border: 0; } }
            </style>
            <div class="closed-po-section">
                <div class="closed-po-header">
                    <div class="closed-po-title">
                        <div class="closed-po-icon">✓</div>
                        <div><h2>Closed POs</h2><p>View and manage completed purchase orders</p></div>
                    </div>
                    <button class="closed-po-btn" onclick="openClosedPO()">✓ Closed Purchase Orders</button>
                </div>
                <div class="po-card" id="closedPOContent">
                    <div class="filter-bar">
                        <div class="filter-left">
                            <div class="search-box"><span>⌕</span><input id="search" class="search" type="text" placeholder="Search PO or supplier..." oninput="filterPOs()"></div>
                            <select id="supplier" class="filter" onchange="filterPOs()"><option value="">All Suppliers</option><option>Gulf Office Supplies</option><option>Bright Learning</option><option>TechWorld Solutions</option><option>Campus Furniture</option></select>
                            <select id="payment" class="filter" onchange="filterPOs()"><option value="">All Payments</option><option>Paid</option><option>Partially Paid</option></select>
                        </div>
                        <div class="filter-right">
                            <input id="date" class="filter" type="date" onchange="filterPOs()">
                            <button class="btn btn-light" type="button" onclick="resetFilters()">↻ Reset</button>
                        </div>
                    </div>
                    <div class="table-wrapper">
                        <table id="poTable">
                            <thead><tr><th>PO Number</th><th>Supplier</th><th>PO Date</th><th>Closed Date</th><th>Amount</th><th>Payment</th><th>Closed By</th><th>Actions</th></tr></thead>
                            <tbody>
                                <tr data-supplier="Gulf Office Supplies" data-payment="Paid" data-date="2026-08-21"><td><span class="po-number">PO-2026-0089</span></td><td><div class="supplier"><div class="supplier-logo">GO</div><div><div class="supplier-name">Gulf Office Supplies</div><div class="supplier-type">Office & Stationery</div></div></div></td><td>12 Aug 2026</td><td>21 Aug 2026</td><td class="amount">$4,820.00</td><td><span class="status paid">Paid</span></td><td>Ahmed Khan</td><td><div class="actions"><button class="action-btn" type="button" title="Preview" onclick="viewPO('PO-2026-0089')">👁</button><button class="action-btn print" type="button" title="Print" onclick="printPO('PO-2026-0089')">🖨</button><button class="action-btn download" type="button" title="Download" onclick="downloadPO('PO-2026-0089')">↓</button></div></td></tr>
                                <tr data-supplier="Bright Learning" data-payment="Paid" data-date="2026-08-18"><td><span class="po-number">PO-2026-0088</span></td><td><div class="supplier"><div class="supplier-logo">BL</div><div><div class="supplier-name">Bright Learning</div><div class="supplier-type">Educational Materials</div></div></div></td><td>08 Aug 2026</td><td>18 Aug 2026</td><td class="amount">$7,250.00</td><td><span class="status paid">Paid</span></td><td>Sarah Wilson</td><td><div class="actions"><button class="action-btn" type="button" onclick="viewPO('PO-2026-0088')">👁</button><button class="action-btn print" type="button" onclick="printPO('PO-2026-0088')">🖨</button><button class="action-btn download" type="button" onclick="downloadPO('PO-2026-0088')">↓</button></div></td></tr>
                                <tr data-supplier="TechWorld Solutions" data-payment="Partially Paid" data-date="2026-08-15"><td><span class="po-number">PO-2026-0087</span></td><td><div class="supplier"><div class="supplier-logo">TS</div><div><div class="supplier-name">TechWorld Solutions</div><div class="supplier-type">IT Equipment</div></div></div></td><td>02 Aug 2026</td><td>15 Aug 2026</td><td class="amount">$18,450.00</td><td><span class="status partial">Partially Paid</span></td><td>Michael Lee</td><td><div class="actions"><button class="action-btn" type="button" onclick="viewPO('PO-2026-0087')">👁</button><button class="action-btn print" type="button" onclick="printPO('PO-2026-0087')">🖨</button><button class="action-btn download" type="button" onclick="downloadPO('PO-2026-0087')">↓</button></div></td></tr>
                                <tr data-supplier="Campus Furniture" data-payment="Paid" data-date="2026-08-12"><td><span class="po-number">PO-2026-0086</span></td><td><div class="supplier"><div class="supplier-logo">CF</div><div><div class="supplier-name">Campus Furniture</div><div class="supplier-type">Furniture & Fixtures</div></div></div></td><td>29 Jul 2026</td><td>12 Aug 2026</td><td class="amount">$12,680.00</td><td><span class="status paid">Paid</span></td><td>Ahmed Khan</td><td><div class="actions"><button class="action-btn" type="button" onclick="viewPO('PO-2026-0086')">👁</button><button class="action-btn print" type="button" onclick="printPO('PO-2026-0086')">🖨</button><button class="action-btn download" type="button" onclick="downloadPO('PO-2026-0086')">↓</button></div></td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="table-footer"><span>Showing <strong id="count">4</strong> closed POs</span><div class="pagination"><button class="page" type="button">‹</button><button class="page active" type="button">1</button><button class="page" type="button">2</button><button class="page" type="button">3</button><button class="page" type="button">›</button></div></div>
                </div>
            </div>
            <div class="modal" id="previewModal"><div class="modal-box"><div class="modal-header"><div><h3>Purchase Order Preview</h3><p>Closed purchase order document</p></div><button class="close" type="button" onclick="closePreview()">×</button></div><div class="modal-body"><div class="po-print"><div class="po-heading"><div class="school"><div class="school-logo">S</div><div><h2>Green Valley International School</h2><p>School Procurement Department</p><p>Abu Dhabi, UAE</p></div></div><div class="po-title"><h1>PURCHASE ORDER</h1><span id="previewNumber">PO-2026-0089</span></div></div><div class="po-info"><div class="info"><label>PO Date</label><strong id="previewDate">12 Aug 2026</strong></div><div class="info"><label>Closed Date</label><strong id="previewClosed">21 Aug 2026</strong></div><div class="info"><label>Status</label><strong style="color:#15803d">✓ Closed</strong></div><div class="info"><label>Supplier</label><strong id="previewSupplier">Gulf Office Supplies</strong></div><div class="info"><label>Payment</label><strong id="previewPayment">Paid</strong></div><div class="info"><label>Closed By</label><strong id="previewClosedBy">Ahmed Khan</strong></div></div><table class="item-table"><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody><tr><td>1</td><td>A4 Copy Paper — 80 GSM</td><td>100</td><td>$25.00</td><td>$2,500.00</td></tr><tr><td>2</td><td>Blue Ballpoint Pens</td><td>500</td><td>$1.20</td><td>$600.00</td></tr><tr><td>3</td><td>Whiteboard Markers</td><td>100</td><td>$7.20</td><td>$720.00</td></tr></tbody></table><div class="totals"><div class="total-row"><span>Subtotal</span><strong>$3,820.00</strong></div><div class="total-row"><span>VAT</span><strong>$1,000.00</strong></div><div class="total-row final"><span>Total</span><strong>$4,820.00</strong></div></div></div></div><div class="modal-footer"><button class="btn btn-light" type="button" onclick="closePreview()">Close</button><button class="btn btn-primary" type="button" onclick="window.print()">🖨 Print</button></div></div></div>
        `;

        const poData = {
            'PO-2026-0089': { number: 'PO-2026-0089', date: '12 Aug 2026', closed: '21 Aug 2026', supplier: 'Gulf Office Supplies', payment: 'Paid', closedBy: 'Ahmed Khan' },
            'PO-2026-0088': { number: 'PO-2026-0088', date: '08 Aug 2026', closed: '18 Aug 2026', supplier: 'Bright Learning', payment: 'Paid', closedBy: 'Sarah Wilson' },
            'PO-2026-0087': { number: 'PO-2026-0087', date: '02 Aug 2026', closed: '15 Aug 2026', supplier: 'TechWorld Solutions', payment: 'Partially Paid', closedBy: 'Michael Lee' },
            'PO-2026-0086': { number: 'PO-2026-0086', date: '29 Jul 2026', closed: '12 Aug 2026', supplier: 'Campus Furniture', payment: 'Paid', closedBy: 'Ahmed Khan' }
        };

        window.openClosedPO = function () { const container = sec.querySelector('#closedPOContent'); if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
        window.viewPO = function (number) { const po = poData[number]; if (!po) return; sec.querySelector('#previewNumber').textContent = po.number; sec.querySelector('#previewDate').textContent = po.date; sec.querySelector('#previewClosed').textContent = po.closed; sec.querySelector('#previewSupplier').textContent = po.supplier; sec.querySelector('#previewPayment').textContent = po.payment; sec.querySelector('#previewClosedBy').textContent = po.closedBy; sec.querySelector('#previewModal').classList.add('show'); };
        window.printPO = function (number) { window.viewPO(number); setTimeout(() => window.print(), 300); };
        window.downloadPO = function (number) { const po = poData[number]; if (!po) return; const text = `
GREEN VALLEY INTERNATIONAL SCHOOL
PURCHASE ORDER

PO Number: ${po.number}
PO Date: ${po.date}
Closed Date: ${po.closed}

Supplier: ${po.supplier}
Payment Status: ${po.payment}
Closed By: ${po.closedBy}

Status: CLOSED

------------------------------------
Total Amount: $4,820.00
------------------------------------
        `; const blob = new Blob([text], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${po.number}.txt`; link.click(); URL.revokeObjectURL(url); };
        window.closePreview = function () { sec.querySelector('#previewModal').classList.remove('show'); };
        window.filterPOs = function () { const search = (sec.querySelector('#search').value || '').toLowerCase(); const supplier = sec.querySelector('#supplier').value; const payment = sec.querySelector('#payment').value; const date = sec.querySelector('#date').value; const rows = sec.querySelectorAll('#poTable tbody tr'); let count = 0; rows.forEach(row => { const text = row.innerText.toLowerCase(); const rowSupplier = row.dataset.supplier; const rowPayment = row.dataset.payment; const rowDate = row.dataset.date; const visible = (!search || text.includes(search)) && (!supplier || rowSupplier === supplier) && (!payment || rowPayment === payment) && (!date || rowDate === date); row.style.display = visible ? '' : 'none'; if (visible) count++; }); sec.querySelector('#count').textContent = count; };
        window.resetFilters = function () { sec.querySelector('#search').value = ''; sec.querySelector('#supplier').value = ''; sec.querySelector('#payment').value = ''; sec.querySelector('#date').value = ''; window.filterPOs(); };
        const modal = sec.querySelector('#previewModal'); modal.addEventListener('click', function (event) { if (event.target === this) { window.closePreview(); } });
        document.addEventListener('keydown', function (event) { if (event.key === 'Escape') { window.closePreview(); } });
        window.filterPOs();
        return sec;
    }

    const navLinks = document.querySelectorAll('.nav-links a:not(.parent-sidebar-link)');
    const activeSectionKey = 'edumasterActiveSection';
    const activeSectionStorageKey = () => {
        const session = loadSession();
        return session?.schoolId && session?.userId
            ? `${activeSectionKey}:${encodeURIComponent(session.schoolId)}:${encodeURIComponent(session.userId)}`
            : activeSectionKey;
    };
    const saveActiveSection = value => localStorage.setItem(activeSectionStorageKey(), JSON.stringify(value));
    const sectionKey = link => {
        const heading = link.closest('.nav-links')?.previousElementSibling;
        const group = heading?.dataset.accessSection || heading?.textContent.trim() || '';
        const label = link.querySelector('.menu-item-label, span:not(.menu-item-icon)')?.innerText.trim() || link.innerText.trim();
        return `${group}::${link.id || label}`;
    };
    const sectionIdentity = link => {
        const group = link.closest('.nav-links');
        const heading = group?.previousElementSibling;
        return {
            key: sectionKey(link),
            id: link.dataset.menuId || link.id || '',
            group: (heading?.dataset.accessSection || heading?.textContent.trim() || '').toLowerCase(),
            groupIndex: Array.from(document.querySelectorAll('.nav-links')).indexOf(group),
            itemIndex: group ? Array.from(group.querySelectorAll('a')).indexOf(link) : -1,
            label: (link.querySelector('.menu-item-label, span:not(.menu-item-icon)')?.innerText.trim() || link.innerText.trim()).toLowerCase()
        };
    };
    function persistDashboardSection() {
        const dashboardLink = Array.from(navLinks).find(link =>
            link.id === 'dashboardBtn' || link.dataset.menuId === 'dashboard'
        );
        if (dashboardLink) {
            navLinks.forEach(link => {
                const isActive = link === dashboardLink;
                link.classList.toggle('active', isActive);
                if (isActive) {
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
            saveActiveSection(sectionIdentity(dashboardLink));
        } else {
            saveActiveSection({ key: 'Main::Dashboard', group: 'main', label: 'dashboard', kind: 'dashboard' });
        }
    }

    let collapsedGroups = [];
    try {
        const storedGroups = JSON.parse(localStorage.getItem('edumasterCollapsedGroups'));
        if (Array.isArray(storedGroups)) collapsedGroups = storedGroups;
    } catch (error) {
        collapsedGroups = [];
    }
    document.querySelectorAll('.sidebar > .menu-title').forEach((title, index) => {
        const group = title.nextElementSibling;
        if (!group?.classList.contains('nav-links')) return;
        const groupKey = (title.dataset.accessSection || title.textContent.trim()).toLowerCase().replace(/[^a-z0-9]+/g, '-') || `group-${index}`;
        title.setAttribute('role', 'button');
        title.setAttribute('tabindex', '0');
        title.setAttribute('aria-controls', group.id || `nav-group-${index}`);
        group.id ||= `nav-group-${index}`;

        const setCollapsed = collapsed => {
            title.setAttribute('aria-expanded', String(!collapsed));
            group.classList.toggle('is-collapsed', collapsed);
            collapsedGroups = collapsed
                ? [...new Set([...collapsedGroups, groupKey])]
                : collapsedGroups.filter(key => key !== groupKey);
            localStorage.setItem('edumasterCollapsedGroups', JSON.stringify(collapsedGroups));
        };

        setCollapsed(collapsedGroups.includes(groupKey));
        title.addEventListener('click', () => setCollapsed(title.getAttribute('aria-expanded') === 'true'));
        title.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                title.click();
            }
        });
    });

    navLinks.forEach(link => {
        link.setAttribute('role', 'button');
        link.setAttribute('tabindex', '0');
        if (link.classList.contains('active')) {
            link.setAttribute('aria-current', 'page');
        }

        link.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                link.click();
            }
        });

        link.addEventListener('click', (ev) => {
            ev.preventDefault();
            if (sidebarSearchInput?.value) {
                sidebarSearchInput.value = '';
                updateNavigationSearch();
            }
            if (window.matchMedia('(max-width: 768px)').matches) {
                setMobileSidebarOpen(false);
            }
            navLinks.forEach(n => {
                n.classList.remove('active');
                n.removeAttribute('aria-current');
            });
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
            updateMobileRoleNavActive(link);
            saveActiveSection(sectionIdentity(link));

            const linkText = link.querySelector('span')?.innerText.trim() || link.innerText.trim();
            activeNavigationCollection = collectionForNavigationLabel.get(linkText.toLowerCase()) || '';
            updateVisibleModuleActions();
            if (typeof window.updateHeaderAddButton === 'function') {
                window.updateHeaderAddButton(linkText);
            }
            setApplicationPage(linkText);

            if (link.id === 'dashboardBtn' || link.dataset.menuId === 'dashboard') {
                if (String(activeAccountPermissions?.role || '').toLowerCase() === 'parent') {
                    showParentPortalHome();
                } else {
                    showDashboard();
                }
                return;
            }

            if (link.id === 'parentPortalPreviewBtn') {
                if (!isPrivilegedRole(activeAccountPermissions?.role)) return;
                showParentPortalHome({ preview: true });
                updateBreadcrumb(['Portals', 'Parent Portal Preview']);
                return;
            }

            if (linkText === 'Dashboard' && link.dataset.menuId === 'front_office_dashboard') {
                let frontOfficeDashboard = document.getElementById('module_front_office_dashboard');
                if (!frontOfficeDashboard) {
                    frontOfficeDashboard = createFrontOfficeDashboard('Front Office Department');
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(frontOfficeDashboard, dashboardEl);
                }
                showSection('module_front_office_dashboard');
                updateBreadcrumb(['Front Office Department', 'Dashboard']);
                return;
            }

            if (link.id === 'userRolesBtn') {
                showSection('userRolesSection');
                showUserRolesAddButton();
                renderUsersTable();
                updateBreadcrumb(['System', 'User Roles']);
                return;
            }

            if (linkText === 'Students') {
                showSection('studentsModule');
                updateBreadcrumb(['Academic Department', 'Students']);
                return;
            }

            if (linkText === 'Run Payroll' || linkText === 'Pay Slips') {
                let payslipsModule = document.getElementById('payslipsModule');
                if (!payslipsModule) {
                    payslipsModule = createPayslipsModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(payslipsModule, dashboardEl);
                }
                showSection('payslipsModule');
                updateBreadcrumb(['Payroll Department', linkText]);
                return;
            }

            if (linkText === 'Statutory Returns') {
                let statutoryModule = document.getElementById('statutoryReturnsModule');
                if (!statutoryModule) {
                    statutoryModule = createStatutoryReturnsModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(statutoryModule, dashboardEl);
                }
                showSection('statutoryReturnsModule');
                updateBreadcrumb(['Payroll Department', 'Statutory Returns']);
                return;
            }

            if (linkText === 'Fees') {
                let feesModule = document.getElementById('feesModule');
                if (!feesModule) {
                    feesModule = createFeesModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(feesModule, dashboardEl);
                }
                showSection('feesModule');
                updateBreadcrumb(['Finance Department', 'Fees']);
                return;
            }

            if (linkText === 'Fee Invoices') {
                let feeInvoicesModule = document.getElementById('feeInvoicesModule');
                if (!feeInvoicesModule) {
                    feeInvoicesModule = createFeeInvoicesModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(feeInvoicesModule, dashboardEl);
                }
                showSection('feeInvoicesModule');
                updateBreadcrumb(['Finance Department', 'Fee Invoices']);
                return;
            }

            if (linkText === 'Expenses') {
                let expensesModule = document.getElementById('expensesModule');
                if (!expensesModule) {
                    expensesModule = createExpensesModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(expensesModule, dashboardEl);
                }
                showSection('expensesModule');
                updateBreadcrumb(['Finance Department', 'Expenses']);
                return;
            }

            if (linkText === 'Purchase Request' || linkText === 'Purchase Requests') {
                let purchaseRequestsModule = document.getElementById('purchaseRequestsModule');
                if (!purchaseRequestsModule) {
                    purchaseRequestsModule = createPurchaseRequestsModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(purchaseRequestsModule, dashboardEl);
                }
                showSection('purchaseRequestsModule');
                updateBreadcrumb(['Procurement Department', 'Purchase Requests']);
                return;
            }

            if (linkText === 'Purchase Orders') {
                let purchaseOrdersModule = document.getElementById('purchaseOrdersModule');
                if (!purchaseOrdersModule) {
                    purchaseOrdersModule = createPurchaseOrdersModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(purchaseOrdersModule, dashboardEl);
                }
                showSection('purchaseOrdersModule');
                updateBreadcrumb(['Procurement Department', 'Purchase Orders']);
                return;
            }

            if (linkText === 'Purchase Comparisons') {
                let purchaseComparisonsModule = document.getElementById('purchaseComparisonsModule');
                if (!purchaseComparisonsModule) {
                    purchaseComparisonsModule = createPurchaseComparisonsModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(purchaseComparisonsModule, dashboardEl);
                }
                showSection('purchaseComparisonsModule');
                updateBreadcrumb(['Procurement Department', 'Purchase Comparisons']);
                return;
            }

            if (linkText === 'Quotations') {
                let quotationsModule = document.getElementById('quotationsModule');
                if (!quotationsModule) {
                    quotationsModule = createQuotationsModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(quotationsModule, dashboardEl);
                }
                showSection('quotationsModule');
                updateBreadcrumb(['Procurement Department', 'Quotations']);
                return;
            }

            if (linkText === 'Goods Receipt (GRN)') {
                let goodsReceiptModule = document.getElementById('goodsReceiptModule');
                if (!goodsReceiptModule) {
                    goodsReceiptModule = createGoodsReceiptModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(goodsReceiptModule, dashboardEl);
                }
                showSection('goodsReceiptModule');
                updateBreadcrumb(['Procurement Department', 'Goods Receipt (GRN)']);
                return;
            }

            if (linkText === 'Supplier Invoices') {
                let supplierInvoicesModule = document.getElementById('supplierInvoicesModule');
                if (!supplierInvoicesModule) {
                    supplierInvoicesModule = createSupplierInvoicesModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(supplierInvoicesModule, dashboardEl);
                }
                showSection('supplierInvoicesModule');
                updateBreadcrumb(['Procurement Department', 'Supplier Invoices']);
                return;
            }

            if (linkText === 'Suppliers') {
                let suppliersModule = document.getElementById('suppliersModule');
                if (!suppliersModule) {
                    suppliersModule = createSuppliersModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(suppliersModule, dashboardEl);
                }
                showSection('suppliersModule');
                updateBreadcrumb(['Procurement Department', 'Suppliers']);
                return;
            }

            if (linkText === 'Fixed Assets') {
                let fixedAssetsModule = document.getElementById('fixedAssetsModule');
                if (!fixedAssetsModule) {
                    fixedAssetsModule = createFixedAssetsModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(fixedAssetsModule, dashboardEl);
                }
                showSection('fixedAssetsModule');
                updateBreadcrumb(['Assets & Security Department', 'Fixed Assets']);
                return;
            }

            if (linkText === 'Maintenance') {
                let maintenanceModule = document.getElementById('maintenanceManagementModule');
                if (!maintenanceModule) {
                    maintenanceModule = createMaintenanceManagementModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(maintenanceModule, dashboardEl);
                }
                showSection('maintenanceManagementModule');
                updateBreadcrumb(['Assets & Security Department', 'Maintenance']);
                return;
            }

            if (linkText === 'Visitor Logs') {
                let visitorLogsModule = document.getElementById('visitorLogsModule');
                if (!visitorLogsModule) {
                    visitorLogsModule = createVisitorLogsModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(visitorLogsModule, dashboardEl);
                }
                showSection('visitorLogsModule');
                const visitorDepartment = link.closest('.nav-links')?.previousElementSibling?.textContent.trim() || 'Visitor Management';
                updateBreadcrumb([visitorDepartment, 'Visitor Logs']);
                return;
            }

            if (linkText === 'Parents') {
                let parentsModule = document.getElementById('parentsModule');
                if (!parentsModule) {
                    parentsModule = createParentsModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(parentsModule, dashboardEl);
                }
                showSection('parentsModule');
                const parentDepartment = link.closest('.nav-links')?.previousElementSibling?.textContent.trim() || 'Communication Department';
                updateBreadcrumb([parentDepartment, 'Parents']);
                return;
            }

            if (linkText === 'SMS Alerts') {
                let smsAlertsModule = document.getElementById('smsAlertsModule');
                if (!smsAlertsModule) {
                    smsAlertsModule = createSmsAlertsModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(smsAlertsModule, dashboardEl);
                }
                showSection('smsAlertsModule');
                const communicationDepartment = link.closest('.nav-links')?.previousElementSibling?.textContent.trim() || 'Communication Department';
                updateBreadcrumb([communicationDepartment, 'SMS Alerts']);
                return;
            }

            if (linkText === 'Notice Board') {
                let noticeBoardModule = document.getElementById('noticeBoardModule');
                if (!noticeBoardModule) {
                    noticeBoardModule = createNoticeBoardModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(noticeBoardModule, dashboardEl);
                }
                showSection('noticeBoardModule');
                const noticeDepartment = link.closest('.nav-links')?.previousElementSibling?.textContent.trim() || 'Communication Department';
                updateBreadcrumb([noticeDepartment, 'Notice Board']);
                return;
            }

            if (linkText === 'Analytics') {
                let systemAnalyticsModule = document.getElementById('systemAnalyticsModule');
                if (!systemAnalyticsModule) {
                    systemAnalyticsModule = createSystemAnalyticsModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(systemAnalyticsModule, dashboardEl);
                }
                showSection('systemAnalyticsModule');
                updateBreadcrumb(['System', 'Analytics']);
                systemAnalyticsModule.refreshAnalyticsChart?.();
                return;
            }

            if (linkText === 'Audit Logs') {
                let auditLogsModule = document.getElementById('auditLogsModule');
                if (!auditLogsModule) {
                    auditLogsModule = createAuditLogsModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(auditLogsModule, dashboardEl);
                }
                showSection('auditLogsModule');
                updateBreadcrumb(['System', 'Audit Logs']);
                return;
            }

            if (linkText === 'Backups') {
                let backupsModule = document.getElementById('backupsModule');
                if (!backupsModule) {
                    backupsModule = createBackupsModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(backupsModule, dashboardEl);
                }
                showSection('backupsModule');
                updateBreadcrumb(['System', 'Backups']);
                return;
            }

            if (linkText === 'Closed POs') {
                let closedPOsModule = document.getElementById('closedPOsModule');
                if (!closedPOsModule) {
                    closedPOsModule = createClosedPOsModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(closedPOsModule, dashboardEl);
                }
                showSection('closedPOsModule');
                updateBreadcrumb(['Finance Department', 'Closed POs']);
                return;
            }

            if (linkText === 'Payroll Reports') {
                let reportsModule = document.getElementById('payrollReportsModule');
                if (!reportsModule) {
                    reportsModule = createPayrollReportsModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(reportsModule, dashboardEl);
                }
                showSection('payrollReportsModule');
                updateBreadcrumb(['Payroll Department', 'Payroll Reports']);
                return;
            }

            if (linkText === 'Teachers') {
                let teachersModule = document.getElementById('teachersModule');
                if (!teachersModule) {
                    teachersModule = createTeachersModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(teachersModule, dashboardEl);
                }
                showSection('teachersModule');
                updateBreadcrumb(['Academic Department', 'Teachers']);
                return;
            }

            if (linkText === 'Subjects') {
                let subjectsModule = document.getElementById('subjectsModule');
                if (!subjectsModule) {
                    subjectsModule = window.createSubjectsModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(subjectsModule, dashboardEl);
                }
                showSection('subjectsModule');
                updateBreadcrumb(['Academic Department', 'Subjects']);
                return;
            }

            if (linkText === 'Curriculum') {
                let curriculumModule = document.getElementById('curriculumModule');
                if (!curriculumModule) {
                    curriculumModule = createCurriculumModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(curriculumModule, dashboardEl);
                }
                showSection('curriculumModule');
                updateBreadcrumb(['Academic Department', 'Curriculum']);
                return;
            }

            if (linkText === 'Timetables') {
                let timetablesModule = document.getElementById('timetablesModule');
                if (!timetablesModule) {
                    timetablesModule = createTimetablesModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(timetablesModule, dashboardEl);
                }
                showSection('timetablesModule');
                updateBreadcrumb(['Academic Department', 'Timetables']);
                return;
            }

            if (linkText === 'Enquiries') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Front Office Department';
                let enquiriesModule = document.getElementById('module_enquiries');
                if (!enquiriesModule) {
                    enquiriesModule = createEnquiriesModule(category);
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(attendanceModule, dashboardEl);
                }
                showSection('attendanceModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Staff Attendance') {
                let staffAttendanceModule = document.getElementById('staffAttendanceModule');
                if (!staffAttendanceModule) {
                    staffAttendanceModule = window.createStaffAttendanceModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(staffAttendanceModule, dashboardEl);
                }
                showSection('staffAttendanceModule');
                updateBreadcrumb(['Staff Management', 'Staff Attendance']);
                return;
            }

            if (linkText === 'Health/Infirmary') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Operations Department';
                let healthModule = document.getElementById('healthModule');
                if (!healthModule) {
                    healthModule = createHealthModule(category);
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
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
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(clubsSocietiesModule, dashboardEl);
                }
                showSection('clubsSocietiesModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Sports & Activities') {
                let sportsActivitiesModule = document.getElementById('sportsActivitiesModule');
                if (!sportsActivitiesModule) {
                    sportsActivitiesModule = createSportsActivitiesModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(sportsActivitiesModule, dashboardEl);
                }
                showSection('sportsActivitiesModule');
                updateBreadcrumb(['Student Life Department', 'Sports & Activities']);
                return;
            }

            if (linkText === 'Counseling') {
                let counselingModule = document.getElementById('counselingModule');
                if (!counselingModule) {
                    counselingModule = createCounselingModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(counselingModule, dashboardEl);
                }
                showSection('counselingModule');
                updateBreadcrumb(['Student Life Department', 'Counseling']);
                return;
            }

            if (['Visitor Logs', 'Announcements', 'Calendar', 'Documents', 'Notifications'].includes(linkText)) {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Front Office Department';
                const moduleId = `module_${linkText.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
                let utilityModule = document.getElementById(moduleId);
                if (!utilityModule) {
                    utilityModule = createFrontOfficeRecordsModule(linkText, category);
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(utilityModule, dashboardEl);
                }
                showSection(moduleId);
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Staff Directory') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Administration Department';
                let staffDirectoryModule = document.getElementById('module_staff_directory');
                if (!staffDirectoryModule) {
                    staffDirectoryModule = window.createStaffDirectoryModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(staffDirectoryModule, dashboardEl);
                }
                showSection('module_staff_directory');
                updateBreadcrumb([category, 'Staff Directory']);
                return;
            }

            if (linkText === 'Leave Management') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Human Resources Department';
                let leaveManagementModule = document.getElementById('leaveManagementModule');
                if (!leaveManagementModule) {
                    leaveManagementModule = window.createLeaveManagementModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(leaveManagementModule, dashboardEl);
                }
                showSection('leaveManagementModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Recruitment') {
                const parentUl = link.closest('ul.nav-links');
                const category = parentUl?.previousElementSibling?.innerText.trim() || 'Human Resources Department';
                let recruitmentModule = document.getElementById('recruitmentModule');
                if (!recruitmentModule) {
                    recruitmentModule = window.createRecruitmentModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(recruitmentModule, dashboardEl);
                }
                showSection('recruitmentModule');
                updateBreadcrumb([category, linkText]);
                return;
            }

            if (linkText === 'Settings') {
                const category = link.closest('ul.nav-links')?.previousElementSibling?.innerText.trim() || 'System Department';
                let settingsModule = document.getElementById('settingsModule');
                if (!settingsModule) {
                    settingsModule = window.createSettingsModule();
                    const dashboardEl = document.querySelector('.main > .dashboard-shell');
                    if (dashboardEl) dashboardEl.parentNode.insertBefore(settingsModule, dashboardEl);
                }
                showSection('settingsModule');
                updateBreadcrumb([category, 'Settings']);
                return;
            }

            // Create or show dynamic department modules
            const parentUl = link.closest('ul.nav-links');
            const category = parentUl?.previousElementSibling?.innerText.trim() || 'General';
            const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
            const moduleId = 'module_' + slugify(linkText);
            const isUserRolesModule = link.id === 'userRolesBtn' || /user roles/i.test(linkText);

            if (!document.getElementById(moduleId)) {
                const sec = document.createElement('section');
                sec.className = 'module';
                sec.id = moduleId;
                
                const headers = linkText === 'Staff Directory' ? ['Staff', 'Record ID', 'Category', 'Status', 'Actions'] : ['Record ID', 'Description', 'Category', 'Status'];
                const rows = [
                    ...(linkText === 'Staff Directory' ? [
                        { id: 1, name: 'Staff Member A', recordId: '#001', status: 'Active' },
                        { id: 2, name: 'Staff Member B', recordId: '#002', status: 'Active' },
                        { id: 3, name: 'Staff Member C', recordId: '#003', status: 'Inactive' }
                    ] : [
                        ['#001', `${linkText} Entry A`, category, 'Active'],
                        ['#002', `${linkText} Entry B`, category, 'Pending'],
                        ['#003', `${linkText} Entry C`, category, 'Review']
                    ])
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
                                    ${linkText === 'Staff Directory' ? rows.map(staff => `
                                        <tr data-staff-id="${staff.id}">
                                            <td><strong data-staff-name>${staff.name}</strong></td>
                                            <td>${staff.recordId}</td>
                                            <td>${category}</td>
                                            <td>${staff.status}</td>
                                            <td>
                                                <div class="actions">
                                                    <button class="action-btn" title="Preview / Print" onclick="previewStaff(${staff.id})">👁️</button>
                                                    <button class="action-btn" title="Edit Staff" onclick="editStaff(${staff.id})">✏️</button>
                                                    <button class="action-btn" title="Delete Staff" onclick="deleteStaff(${staff.id})">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>`).join('') : rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
                                </tbody>
                            </table>
                        </div>
                        <div style="margin-top: 25px; display: flex; justify-content: flex-end;">
                            ${isUserRolesModule
                                ? '<button class="btn-primary" type="button" data-open-user-form><i class="fas fa-plus"></i> Add User</button>'
                                : '<button class="btn-primary" type="button" data-back-dashboard>Back to Dashboard</button>'}
                        </div>
                    </div>`;
                sec.querySelector('[data-back-dashboard]')?.addEventListener('click', () => dashboardBtn?.click());
                sec.querySelector('[data-open-user-form]')?.addEventListener('click', () => {
                    userRolesBtn?.click();
                    setTimeout(() => toggleAddUserFormBtn?.click(), 0);
                });
                const dashboardEl = document.querySelector('.main > .dashboard-shell');
                if (dashboardEl) dashboardEl.parentNode.insertBefore(sec, dashboardEl);
            }
            showSection(moduleId);
            updateBreadcrumb([category, linkText]);
        });
    });

    restoreSavedSection = () => {
        const scopedKey = activeSectionStorageKey();
        const savedValue = localStorage.getItem(scopedKey) || localStorage.getItem(activeSectionKey);
        if (!savedValue) {
            persistDashboardSection();
            return;
        }

        let savedIdentity = null;
        try {
            const parsedValue = JSON.parse(savedValue);
            if (parsedValue && typeof parsedValue === 'object') savedIdentity = parsedValue;
        } catch (error) {
            // The previous format stored the section key as plain text.
        }

        const links = Array.from(navLinks).filter(link =>
            !link.classList.contains('account-access-hidden')
            && !link.closest('[hidden]')
            && !link.closest('.nav-links')?.classList.contains('account-access-hidden')
        );
        const savedKey = savedIdentity?.key || savedValue;
        const savedGroup = savedIdentity?.group || savedKey.split('::')[0]?.toLowerCase() || '';
        const savedLabel = savedIdentity?.label || savedKey.split('::').pop()?.toLowerCase() || '';
        const savedLink = links.find(link => sectionKey(link) === savedKey)
            || (savedIdentity?.id && links.find(link => (link.dataset.menuId || link.id) === savedIdentity.id))
            || links.find(link => {
                const identity = sectionIdentity(link);
                return identity.group === savedGroup && identity.label === savedLabel;
            })
            || links.find(link => sectionIdentity(link).label === savedLabel)
            || (savedIdentity && savedIdentity.groupIndex >= 0
                ? Array.from(document.querySelectorAll('.nav-links'))[savedIdentity.groupIndex]?.querySelectorAll('a')[savedIdentity.itemIndex]
                : null);
        if (!savedLink
            || savedLink.classList.contains('account-access-hidden')
            || savedLink.closest('[hidden]')
            || savedLink.closest('.nav-links')?.classList.contains('account-access-hidden')) {
            persistDashboardSection();
            return;
        }
        if (scopedKey !== activeSectionKey && !localStorage.getItem(scopedKey)) {
            saveActiveSection(savedIdentity || savedValue);
        }
        const group = savedLink.closest('.nav-links');
        const heading = group?.previousElementSibling;
        if (heading?.getAttribute('aria-expanded') === 'false') heading.click();
        savedLink.click();
    };
    if (loadSession()?.authenticated && !container.classList.contains('hidden')) {
        requestAnimationFrame(restoreSavedSection);
    }


    // Global Chart Defaults
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Poppins', sans-serif";
        Chart.defaults.font.size = 12;
        Chart.defaults.color = colors.text;
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
    }

    const createChartIfPresent = (canvasId, factory) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas || typeof canvas.getContext !== 'function') return null;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        return factory(ctx);
    };

    let enrollmentChart = null;

    // 1. Enrollment Line Chart
    enrollmentChart = createChartIfPresent('lineChart', (lineCtx) => {
        const lineGradient = lineCtx.createLinearGradient(0, 0, 0, 200);
        lineGradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
        lineGradient.addColorStop(1, 'rgba(79, 70, 229, 0)');

        return new Chart(lineCtx, {
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
            if (!enrollmentChart) return;
            const period = this.getAttribute('data-period');
            const toggleContainer = this.parentElement;
            const activeToggle = toggleContainer?.querySelector('.active');
            if (activeToggle) activeToggle.classList.remove('active');
            this.classList.add('active');
            if (!enrollmentData[period]) return;
            enrollmentChart.data.labels = enrollmentData[period].labels;
            enrollmentChart.data.datasets[0].data = enrollmentData[period].data;
            enrollmentChart.update();
        });
    });

    // 2. Fees Doughnut Chart
    createChartIfPresent('pieChart', (pieCtx) => {
        return new Chart(pieCtx, {
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
    });

    // 3. Attendance Bar Chart
    createChartIfPresent('barChart', (barCtx) => {
        return new Chart(barCtx, {
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
    });

    // 4. Performance Radar Chart
    createChartIfPresent('radarChart', (piePerfCtx) => {
        return new Chart(piePerfCtx, {
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
                if (currentSection === 'Students' && typeof window.openStudentsModal === 'function') {
                    window.openStudentsModal();
                } else {
                    modal.classList.add('active');
                }
            } else if (currentSection === 'User Roles') {
                document.getElementById('userRolesBtn')?.click();
                document.getElementById('roleManagementModule')?.querySelector('[data-rm-new]')?.click();
                return;
            } else if (currentSection === 'Users') {
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
            } else if (currentSection === 'Staff Attendance') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Staff Attendance')?.click();
                document.getElementById('staffAttendanceModule')?.querySelector('[data-add]')?.click();
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
            } else if (currentSection === 'Fees') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Fees')?.click();
                document.getElementById('feesModule')?.querySelector('[data-fee-new]')?.click();
                return;
            } else if (currentSection === 'Expenses') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Expenses')?.click();
                document.getElementById('expensesModule')?.querySelector('[data-expense-new]')?.click();
                return;
            } else if (currentSection === 'Purchase Request' || currentSection === 'Purchase Requests') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => ['Purchase Request', 'Purchase Requests'].includes(link.querySelector('span')?.innerText.trim() || link.innerText.trim()))?.click();
                document.getElementById('purchaseRequestsModule')?.querySelector('[data-pr-new]')?.click();
                return;
            } else if (currentSection === 'Purchase Orders') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Purchase Orders')?.click();
                document.getElementById('purchaseOrdersModule')?.querySelector('[data-po-new]')?.click();
                return;
            } else if (currentSection === 'Purchase Comparisons') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Purchase Comparisons')?.click();
                document.getElementById('purchaseComparisonsModule')?.querySelector('[data-pc-new]')?.click();
                return;
            } else if (currentSection === 'Quotations') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Quotations')?.click();
                document.getElementById('quotationsModule')?.querySelector('[data-qt-new]')?.click();
                return;
            } else if (currentSection === 'Goods Receipt (GRN)') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Goods Receipt (GRN)')?.click();
                document.getElementById('goodsReceiptModule')?.querySelector('[data-grn-new]')?.click();
                return;
            } else if (currentSection === 'Supplier Invoices') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Supplier Invoices')?.click();
                document.getElementById('supplierInvoicesModule')?.querySelector('[data-si-new]')?.click();
                return;
            } else if (currentSection === 'Suppliers') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Suppliers')?.click();
                document.getElementById('suppliersModule')?.querySelector('[data-sp-new]')?.click();
                return;
            } else if (currentSection === 'Fixed Assets') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Fixed Assets')?.click();
                document.getElementById('fixedAssetsModule')?.querySelector('[data-fa-new]')?.click();
                return;
            } else if (currentSection === 'Maintenance') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Maintenance')?.click();
                document.getElementById('maintenanceManagementModule')?.querySelector('[data-mm-new]')?.click();
                return;
            } else if (currentSection === 'Parents') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Parents')?.click();
                document.getElementById('parentsModule')?.querySelector('[data-pa-new]')?.click();
                return;
            } else if (currentSection === 'SMS Alerts') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'SMS Alerts')?.click();
                document.getElementById('smsAlertsModule')?.querySelector('[data-sms-new]')?.click();
                return;
            } else if (currentSection === 'Notice Board') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Notice Board')?.click();
                document.getElementById('noticeBoardModule')?.querySelector('[data-nb-new]')?.click();
                return;
            } else if (currentSection === 'Alumni') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Alumni')?.click();
                document.getElementById('alumniModule')?.querySelector('[data-al-new]')?.click();
                return;
            } else if (currentSection === 'Inventory') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Inventory')?.click();
                document.getElementById('inventoryModule')?.querySelector('[data-inv-new]')?.click();
                return;
            } else if (currentSection === 'Staff Directory') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Staff Directory')?.click();
                window.addStaff?.();
                return;
            } else if (currentSection === 'Recruitment') {
                Array.from(document.querySelectorAll('.nav-links a')).find(link => (link.querySelector('span')?.innerText.trim() || link.innerText.trim()) === 'Recruitment')?.click();
                document.getElementById('recruitmentModule')?.querySelector('[data-add]')?.click();
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
                    if (currentSection === 'Visitor Logs') {
                        document.getElementById('visitorLogsModule')?.querySelector('[data-vl-new]')?.click();
                        return;
                    }
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
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const mobileSidebarMedia = window.matchMedia('(max-width: 768px)');
    const parentPortalHeaderMedia = window.matchMedia('(max-width: 820px)');
    const topbarHeading = document.querySelector('.topbar-heading');
    const parentWelcomeCopy = document.querySelector('.parent-welcome-copy');
    const parentPortalHome = document.getElementById('parentPortalHome');
    const parentWelcomeCard = document.querySelector('.parent-welcome-card');

    const syncSidebarTogglePlacement = () => {
        if (!sidebarToggle || !topbarHeading) return;
        const parentPortalActive = document.documentElement.classList.contains('parent-portal-active')
            || document.documentElement.classList.contains('parent-portal-preview-active');
        if (parentPortalHeaderMedia.matches && parentPortalActive && parentWelcomeCopy) {
            parentWelcomeCopy.insertBefore(sidebarToggle, parentWelcomeCopy.firstChild);
            if (parentPortalHome && parentWelcomeCard && !parentPortalHome.classList.contains('hidden')) {
                parentPortalHome.style.setProperty('--parent-welcome-height', `${parentWelcomeCard.getBoundingClientRect().height}px`);
            }
        } else {
            topbarHeading.insertBefore(sidebarToggle, topbarHeading.firstChild);
            parentPortalHome?.style.removeProperty('--parent-welcome-height');
        }
    };
    const parentPortalModeObserver = new MutationObserver(syncSidebarTogglePlacement);
    parentPortalModeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    if (parentPortalHome) {
        parentPortalModeObserver.observe(parentPortalHome, { attributes: true, attributeFilter: ['class'] });
    }
    if (parentWelcomeCard) {
        new ResizeObserver(syncSidebarTogglePlacement).observe(parentWelcomeCard);
    }
    parentPortalHeaderMedia.addEventListener('change', syncSidebarTogglePlacement);

    const setMobileSidebarOpen = open => {
        const isMobile = mobileSidebarMedia.matches;
        const wasOpen = sidebar.classList.contains('mobile-open');
        sidebar.classList.toggle('mobile-open', open);
        sidebarOverlay?.classList.toggle('is-visible', open);
        document.body.classList.toggle('sidebar-open', open);
        sidebar.setAttribute('aria-hidden', String(isMobile && !open));
        sidebar.inert = isMobile && !open;
        sidebarToggle.setAttribute('aria-expanded', String(isMobile ? open : !sidebar.classList.contains('collapsed')));
        sidebarToggle.setAttribute('aria-label', isMobile
            ? (open ? 'Close navigation' : 'Open navigation')
            : (sidebar.classList.contains('collapsed') ? 'Expand navigation' : 'Collapse navigation'));

        if (isMobile && open) {
            sidebar.querySelector('.nav-links a')?.focus({ preventScroll: true });
        } else if (isMobile && wasOpen) {
            sidebarToggle.focus();
        }
    };

    if (sidebarToggle && sidebar && main) {
        const syncSidebarMode = () => {
            syncSidebarTogglePlacement();
            sidebar.classList.remove('mobile-open');
            sidebarOverlay?.classList.remove('is-visible');
            document.body.classList.remove('sidebar-open');
            if (mobileSidebarMedia.matches) {
                sidebar.classList.remove('collapsed');
                main.classList.remove('expanded');
            }
            sidebar.setAttribute('aria-hidden', String(mobileSidebarMedia.matches));
            sidebar.inert = mobileSidebarMedia.matches;
            sidebarToggle.setAttribute('aria-expanded', String(!mobileSidebarMedia.matches && !sidebar.classList.contains('collapsed')));
            sidebarToggle.setAttribute('aria-label', mobileSidebarMedia.matches
                ? 'Open navigation'
                : (sidebar.classList.contains('collapsed') ? 'Expand navigation' : 'Collapse navigation'));
        };

        syncSidebarMode();
        sidebarToggle.addEventListener('click', () => {
            if (mobileSidebarMedia.matches) {
                setMobileSidebarOpen(!sidebar.classList.contains('mobile-open'));
                return;
            }

            const isCollapsed = sidebar.classList.toggle('collapsed');
            main.classList.toggle('expanded', isCollapsed);
            sidebarToggle.setAttribute('aria-expanded', String(!isCollapsed));
            sidebarToggle.setAttribute('aria-label', isCollapsed ? 'Expand navigation' : 'Collapse navigation');
        });

        sidebarOverlay?.addEventListener('click', () => {
            setMobileSidebarOpen(false);
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
                setMobileSidebarOpen(false);
                return;
            }

            if (event.key === 'Tab' && sidebar.classList.contains('mobile-open')) {
                const focusableItems = Array.from(sidebar.querySelectorAll('a, button, [tabindex="0"]'))
                    .filter(item => item.getClientRects().length > 0);
                const firstItem = focusableItems[0];
                const lastItem = focusableItems[focusableItems.length - 1];

                if (event.shiftKey && (document.activeElement === firstItem || !sidebar.contains(document.activeElement))) {
                    event.preventDefault();
                    lastItem?.focus();
                } else if (!event.shiftKey && (document.activeElement === lastItem || !sidebar.contains(document.activeElement))) {
                    event.preventDefault();
                    firstItem?.focus();
                }
            }
        });

        mobileSidebarMedia.addEventListener('change', syncSidebarMode);
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