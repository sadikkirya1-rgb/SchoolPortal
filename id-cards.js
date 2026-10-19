function createIDCardsModule(category) {
    const sec = document.createElement('section');
    sec.className = 'module id-cards-module';
    sec.id = 'idCardsModule';
    sec.innerHTML = `
        <div class="idc-header"><div class="idc-brand"><div class="idc-brand-icon"><i class="fas fa-id-card"></i></div><div><h2>Universal School ID Card</h2><p>School Members • ID Management • Records</p></div></div><button class="idc-btn idc-btn-primary" type="button" data-idc-new><i class="fas fa-plus"></i> New ID</button></div>
        <div class="idc-editor hidden" data-idc-editor>
            <section class="idc-panel idc-form"><div class="idc-form-heading"><div class="idc-heading-left"><div class="idc-section-icon"><i class="fas fa-id-badge"></i></div><div><h3>Member ID Entry Form</h3><p class="idc-subtitle">Create identification cards for every school member</p></div></div><div><span class="idc-badge" data-idc-editing>New Record</span> <button class="idc-btn idc-btn-light" type="button" data-idc-close>Close</button></div></div>
                <div class="idc-fields"><div class="idc-field"><label>Member Type</label><select name="memberType" data-idc-field><option>Student</option><option>Teacher</option><option>Staff</option><option>Administrator</option><option>Principal / Headteacher</option><option>Driver</option><option>Security</option><option>Librarian</option><option>Other</option></select></div><div class="idc-field"><label for="idcMemberRecordSelect">Select member ID</label><select id="idcMemberRecordSelect" data-idc-member-record><option value="">Select a member type first</option></select></div><div class="idc-field"><label>Full Name</label><input name="memberName" data-idc-field></div><div class="idc-field"><label>Member ID / Admission No.</label><input name="memberId" data-idc-field></div><div class="idc-field"><label>Designation / Role</label><input name="designation" data-idc-field></div><div class="idc-field"><label>Department / Class</label><input name="department" data-idc-field></div><div class="idc-field"><label>House / Division</label><input name="division" data-idc-field></div><div class="idc-field"><label>Valid Until</label><input name="validUntil" type="date" data-idc-field></div><div class="idc-field"><label>Emergency Contact</label><input name="emergency" data-idc-field></div><div class="idc-field"><label>Member Photo</label><label class="idc-upload"><i class="fas fa-camera"></i> Upload Photo<input type="file" accept="image/*" data-idc-photo></label></div><div class="idc-field"><label>School Logo</label><label class="idc-upload"><i class="fas fa-school"></i> Upload Logo<input type="file" accept="image/*" data-idc-logo></label></div><div class="idc-field"><label>Card Status</label><select name="status" data-idc-field><option>Active</option><option>Inactive</option><option>Expired</option><option>Lost</option><option>Replaced</option></select></div><div class="idc-field"><label>Primary Colour</label><input name="primary" type="color" value="#071b3a" data-idc-field></div><div class="idc-field"><label>Secondary Colour</label><input name="secondary" type="color" value="#1459d9" data-idc-field></div><div class="idc-field idc-full"><label>School Name</label><input name="schoolName" data-idc-field></div><div class="idc-field idc-full"><label>School Address</label><input name="schoolAddress" data-idc-field></div></div>
                <div class="idc-form-actions"><button class="idc-btn idc-btn-light" type="button" data-idc-clear>Clear</button><button class="idc-btn idc-btn-primary" type="button" data-idc-save><i class="fas fa-save"></i> Save Member ID</button></div>
            </section>
            <section class="idc-panel"><div class="idc-panel-heading idc-preview-head"><div class="idc-heading-left"><div class="idc-section-icon"><i class="fas fa-eye"></i></div><div><h3>Live ID Card Preview</h3><p class="idc-subtitle">Front + Back • Premium Universal School Card</p></div></div><button class="idc-btn idc-btn-light" type="button" data-idc-toggle>Hide Preview</button></div><div class="idc-preview-area" data-idc-preview><div class="id-card" data-idc-front><div class="idc-card-content"><div class="idc-school-head"><img class="idc-logo" data-idc-front-logo><div><div class="idc-school-name" data-idc-school></div><div class="idc-school-sub">OFFICIAL SCHOOL IDENTIFICATION</div></div></div><div class="idc-card-title">SCHOOL IDENTIFICATION CARD</div><div class="idc-photo" data-idc-photo-preview>👤</div><div class="idc-member-name" data-idc-name></div><div class="idc-member-type" data-idc-type></div><div class="idc-details"><div class="idc-detail"><span class="idc-detail-label" data-idc-id-label>Admission No.</span><span class="idc-detail-value" data-idc-id></span></div><div class="idc-detail"><span class="idc-detail-label">Designation</span><span class="idc-detail-value" data-idc-role></span></div><div class="idc-detail"><span class="idc-detail-label">Department / Class</span><span class="idc-detail-value" data-idc-department></span></div><div class="idc-detail"><span class="idc-detail-label">Division / House</span><span class="idc-detail-value" data-idc-division></span></div></div><div class="idc-card-bottom"><div class="idc-validity">VALID UNTIL<strong data-idc-valid></strong></div><div class="idc-qr"></div></div></div></div><div class="id-card" data-idc-back><div class="idc-card-content idc-back-content"><div class="idc-back-title" data-idc-back-school></div><div class="idc-gold-line"></div><div class="idc-return-title">If this card is found</div><div class="idc-address">Please return this identification card to:<br><br><strong data-idc-address></strong><br><br>Tel: +971 00 000 0000<br>Email: admin@school.edu</div><div class="idc-emergency"><div class="idc-emergency-title">Emergency Contact</div><div class="idc-emergency-number" data-idc-emergency></div></div><div class="idc-signature">Authorized Signature / Principal</div><div class="idc-card-number">CARD NO: <strong data-idc-back-id></strong></div><div class="idc-barcode"></div><div class="idc-barcode-number" data-idc-barcode></div></div></div></div></section>
        </div>
        <section class="idc-panel"><div class="idc-record-heading"><div class="idc-heading-left"><div class="idc-section-icon"><i class="fas fa-clipboard-list"></i></div><div><h3>School ID Records</h3><p class="idc-subtitle">All issued identification cards and school members</p></div></div></div><div class="idc-record-toolbar"><div class="idc-record-filters"><select class="idc-filter" aria-label="Filter by member type" data-idc-filter-type><option value="">All member types</option><option>Student</option><option>Teacher</option><option>Staff</option><option>Administrator</option><option>Principal / Headteacher</option><option>Driver</option><option>Security</option><option>Librarian</option><option>Other</option></select><select class="idc-filter" aria-label="Filter by card status" data-idc-filter-status><option value="">All statuses</option><option>Active</option><option>Inactive</option><option>Expired</option><option>Lost</option><option>Replaced</option></select></div><input class="idc-search" type="search" placeholder="Search name, ID, type, department..." aria-label="Search ID cards" data-idc-search><button class="idc-btn idc-btn-light idc-export-btn" type="button" data-idc-export><i class="fas fa-download"></i> CSV</button></div><div class="idc-table-wrap"><table class="idc-table"><thead><tr><th>#</th><th>Member</th><th>Member ID</th><th>Type</th><th>Role</th><th>Department / Class</th><th>Division</th><th>Valid Until</th><th>Status</th><th>Actions</th></tr></thead><tbody data-idc-table></tbody></table><div class="idc-empty hidden" data-idc-empty>No ID records found.</div></div></section><div class="idc-view-modal hidden" data-idc-view-modal role="dialog" aria-modal="true" aria-label="Student ID card preview"><div class="idc-view-dialog"><header><div><h3 data-idc-view-title>ID Card Preview</h3><p>Front and back of this card</p></div><button type="button" class="idc-btn idc-btn-light" data-idc-view-close aria-label="Close preview">Close</button></header><div class="idc-view-cards" data-idc-view-cards></div></div></div><div class="idc-toast" data-idc-toast></div>`;
    const qrSurface = document.createElement('div');
    qrSurface.className = 'idc-attendance-qr';
    qrSurface.innerHTML = '<canvas data-idc-qr role="img" aria-label="Member attendance QR code"></canvas><span>SCAN FOR ATTENDANCE</span>';
    const scannerButton = document.createElement('button');
    scannerButton.className = 'idc-btn idc-btn-light';
    scannerButton.type = 'button';
    scannerButton.dataset.idcOpenScanner = '';
    scannerButton.innerHTML = '<i class="fas fa-qrcode" aria-hidden="true"></i> Scan attendance';
    sec.querySelector('.idc-header').prepend(scannerButton);
    sec.querySelector('.idc-qr')?.remove();
    sec.querySelector('.idc-barcode')?.replaceWith(qrSurface);
    sec.querySelector('.idc-return-title')?.before(qrSurface);
    sec.querySelector('.idc-signature')?.remove();
    const returnDetails = sec.querySelector('.idc-address');
    returnDetails.innerHTML = 'Please return this identification card to:<br><strong data-idc-address></strong><br>Tel: +971 00 000 0000<br>Email: admin@school.edu';

    const scannerPanel = document.createElement('section');
    scannerPanel.className = 'idc-panel idc-scan-panel hidden';
    scannerPanel.dataset.idcScanPanel = '';
    scannerPanel.innerHTML = `<div class="idc-scan-heading"><div><h3>QR Attendance Scanner</h3><p>Scan the QR code on the back of a member's ID card using this device's camera.</p></div><button class="idc-btn idc-btn-light" type="button" data-idc-close-scanner aria-label="Close attendance scanner">Close</button></div><div class="idc-scan-controls"><label>Scan action<select data-idc-scan-mode><option value="check-in">Check in</option><option value="check-out">Check out</option></select></label><button class="idc-btn idc-btn-primary" type="button" data-idc-camera-start><i class="fas fa-camera" aria-hidden="true"></i> Start camera</button><button class="idc-btn idc-btn-light" type="button" data-idc-camera-stop disabled><i class="fas fa-stop" aria-hidden="true"></i> Stop camera</button></div><div class="idc-camera-frame" data-idc-camera-frame><video data-idc-camera playsinline muted aria-label="Camera showing the ID card QR code"></video><div class="idc-camera-guide"><span class="idc-camera-guide-label">Keep the full QR code visible</span><div class="idc-camera-guide-box"><div class="idc-camera-scan-line" aria-hidden="true"></div></div><span class="idc-camera-guide-hint">Hold the phone steady; scanning is automatic</span></div><div class="idc-camera-message hidden" data-idc-camera-message role="status" aria-live="polite"></div></div><p class="idc-scan-status" data-idc-scan-status role="status" aria-live="polite">Choose check-in or check-out, then start the camera.</p><div class="idc-scan-result hidden" data-idc-scan-result role="status" aria-live="polite"><strong data-idc-result-action></strong><span class="idc-result-name"><b>Member:</b> <span data-idc-result-name></span></span><span><b>Date:</b> <span data-idc-result-date></span></span><span><b>Time:</b> <span data-idc-result-time></span></span></div>`;
    const cameraZoomControl = document.createElement('label');
    cameraZoomControl.className = 'idc-camera-zoom hidden';
    cameraZoomControl.innerHTML = '<span>Camera zoom <output data-idc-zoom-value>1×</output></span><input type="range" min="1" max="1" step="0.1" value="1" aria-label="Camera zoom" data-idc-camera-zoom>';
    scannerPanel.querySelector('.idc-scan-controls').append(cameraZoomControl);
    sec.querySelector('.idc-header').after(scannerPanel);

    sec.querySelector('[data-idc-open-scanner]')?.addEventListener('click', () => {
        scannerPanel.classList.remove('hidden');
        scannerPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    sec.querySelector('[data-idc-close-scanner]').addEventListener('click', () => {
        scannerPanel.classList.add('hidden');
    });

    const defaultLogo = '';
    let records = []; let editingRecordId = ''; let photo = ''; let logo = defaultLogo; let schoolBrandName = ''; let schoolBrandLogo = ''; let selectedMemberRecordId = ''; const memberRecords = { students: [], teachers: [], staff: [] }; const memberRecordsLoaded = { students: false, teachers: false, staff: false }; const memberSubscriptions = []; const fields = () => Object.fromEntries([...sec.querySelectorAll('[data-idc-field]')].map(field => [field.name, field.value])); const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
    const qrTokenField = document.createElement('input');
    qrTokenField.type = 'hidden';
    qrTokenField.name = 'qrToken';
    qrTokenField.dataset.idcField = '';
    sec.querySelector('.idc-fields').append(qrTokenField);
    const getRecord = () => ({...fields(), memberRecordId: selectedMemberRecordId, ...(fields().memberType === 'Student' && selectedMemberRecordId ? { studentId: selectedMemberRecordId } : {}), photo, logo, createdAt: new Date().toISOString()}); const toast = message => { const el = sec.querySelector('[data-idc-toast]'); el.textContent = message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 2400); };
    const renderQr = (canvas, token) => {
        const identity = window.schoolPortalData?.getIdentity?.();
        if (!canvas || !identity?.schoolId || !token || typeof window.qrcode !== 'function') return;
        const payload = `EDU1|${encodeURIComponent(identity.schoolId)}|${token}`;
        const qr = window.qrcode(0, 'H');
        qr.addData(payload);
        qr.make();
        const size = 224;
        const quietZone = 4;
        const moduleCount = qr.getModuleCount();
        const moduleSize = size / (moduleCount + quietZone * 2);
        const context = canvas.getContext('2d');
        canvas.width = size;
        canvas.height = size;
        context.fillStyle = '#fff';
        context.fillRect(0, 0, size, size);
        context.fillStyle = '#111827';
        for (let row = 0; row < moduleCount; row += 1) {
            for (let column = 0; column < moduleCount; column += 1) {
                if (!qr.isDark(row, column)) continue;
                const left = Math.floor((column + quietZone) * moduleSize);
                const top = Math.floor((row + quietZone) * moduleSize);
                const right = Math.ceil((column + quietZone + 1) * moduleSize);
                const bottom = Math.ceil((row + quietZone + 1) * moduleSize);
                context.fillRect(left, top, right - left, bottom - top);
            }
        }
        canvas.setAttribute('aria-label', `Attendance QR code for ${identity.schoolId}`);
    };
    const update = () => { const data = fields(); const valid = data.validUntil ? new Date(`${data.validUntil}T00:00:00`).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—'; sec.querySelector('[data-idc-school]').textContent = data.schoolName; sec.querySelector('[data-idc-back-school]').textContent = data.schoolName; sec.querySelector('[data-idc-name]').textContent = data.memberName || 'MEMBER NAME'; sec.querySelector('[data-idc-type]').textContent = data.memberType.toUpperCase(); sec.querySelector('[data-idc-id]').textContent = data.memberId; sec.querySelector('[data-idc-role]').textContent = data.designation; sec.querySelector('[data-idc-department]').textContent = data.department; sec.querySelector('[data-idc-division]').textContent = data.division; sec.querySelector('[data-idc-valid]').textContent = valid; sec.querySelector('[data-idc-back-id]').textContent = data.memberId; sec.querySelector('[data-idc-barcode]').textContent = data.memberId; sec.querySelector('[data-idc-emergency]').textContent = data.emergency; sec.querySelector('[data-idc-address]').innerHTML = `${escape(data.schoolName)}<br>${escape(data.schoolAddress)}`; sec.querySelectorAll('.id-card').forEach(card => card.style.background = `radial-gradient(circle at 90% 0%,${data.secondary},transparent 30%),linear-gradient(145deg,${data.primary},${data.secondary})`); };
    const render = () => {
        const query = sec.querySelector('[data-idc-search]').value.trim().toLowerCase();
        const memberType = sec.querySelector('[data-idc-filter-type]').value;
        const status = sec.querySelector('[data-idc-filter-status]').value;
        const filtered = records.map((record, index) => ({ record, index })).filter(({ record }) =>
            (!memberType || record.memberType === memberType)
            && (!status || record.status === status)
            && [record.memberName, record.memberId, record.memberType, record.department, record.designation, record.division]
                .some(value => String(value || '').toLowerCase().includes(query))
        );
        const table = sec.querySelector('[data-idc-table]');
        table.innerHTML = filtered.map(({ record, index }, row) => `<tr><td>${row + 1}</td><td><div class="idc-member-cell">${record.photo ? `<img class="idc-table-photo" src="${record.photo}" alt="">` : '<span class="idc-table-photo">👤</span>'}<strong>${escape(record.memberName)}</strong></div></td><td>${escape(record.memberId)}</td><td><span class="idc-badge">${escape(record.memberType)}</span></td><td>${escape(record.designation)}</td><td>${escape(record.department)}</td><td>${escape(record.division)}</td><td>${escape(record.validUntil || '—')}</td><td><span class="idc-badge idc-status">${escape(record.status)}</span></td><td><div class="idc-actions"><button class="idc-action idc-view" data-action="view" data-index="${index}">View</button><button class="idc-action idc-edit" data-action="edit" data-index="${index}">Edit</button><button class="idc-action idc-delete" data-action="delete" data-index="${index}">Delete</button></div></td></tr>`).join('');
        sec.querySelector('[data-idc-empty]').classList.toggle('hidden', filtered.length > 0);
    };
    const showCardPreview = record => {
        const [front, back] = [...sec.querySelectorAll('[data-idc-preview] .id-card')].map(card => card.cloneNode(true));
        const setText = (card, selector, value) => {
            const element = card.querySelector(selector);
            if (element) element.textContent = value || '';
        };
        setText(front, '[data-idc-school]', record.schoolName);
        setText(front, '[data-idc-name]', record.memberName || 'MEMBER NAME');
        setText(front, '[data-idc-type]', record.memberType?.toUpperCase());
        setText(front, '[data-idc-id]', record.memberId);
        setText(front, '[data-idc-role]', record.designation);
        setText(front, '[data-idc-department]', record.department);
        setText(front, '[data-idc-division]', record.division);
        setText(front, '[data-idc-valid]', record.validUntil
            ? new Date(`${record.validUntil}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—');
        setText(back, '[data-idc-back-school]', record.schoolName);
        setText(back, '[data-idc-address]', [record.schoolName, record.schoolAddress].filter(Boolean).join('\n'));
        setText(back, '[data-idc-emergency]', record.emergency);
        setText(back, '[data-idc-back-id]', record.memberId);
        setText(back, '[data-idc-barcode]', record.memberId);
        [front, back].forEach(card => {
            card.style.background = `radial-gradient(circle at 90% 0%,${record.secondary || '#1459d9'},transparent 30%),linear-gradient(145deg,${record.primary || '#071b3a'},${record.secondary || '#1459d9'})`;
        });
        const logoImage = front.querySelector('[data-idc-front-logo]');
        if (record.logo) logoImage.src = record.logo;
        else logoImage.remove();
        const photoContainer = front.querySelector('[data-idc-photo-preview]');
        photoContainer.replaceChildren();
        if (record.photo) {
            const image = document.createElement('img');
            image.src = record.photo;
            image.alt = 'Member photo';
            photoContainer.append(image);
        } else {
            photoContainer.textContent = '👤';
        }
        const modal = sec.querySelector('[data-idc-view-modal]');
        sec.querySelector('[data-idc-view-title]').textContent = `${record.memberName || 'Member'} ID Card`;
        const cardsContainer = sec.querySelector('[data-idc-view-cards]');
        cardsContainer.replaceChildren(front, back);
        renderQr(back.querySelector('[data-idc-qr]'), record.qrToken);
        modal.classList.remove('hidden');
    };
    const setForm = record => { sec.querySelectorAll('[data-idc-field]').forEach(field => { if (record[field.name] !== undefined) field.value = record[field.name]; }); qrTokenField.value = record.qrToken || crypto.randomUUID(); renderQr(sec.querySelector('[data-idc-qr]'), qrTokenField.value); const type = sec.querySelector('[name="memberType"]').value; const matchedMember = memberRecords[memberCollection(type)]?.find(item => memberRecordNumber(item, type) === String(record.memberId || '') && memberRecordName(item) === String(record.memberName || '')); selectedMemberRecordId = String(record.memberRecordId || record.studentId || memberRecordKey(matchedMember || {})); photo = record.photo || ''; logo = record.logo || schoolBrandLogo; sec.querySelector('[data-idc-photo-preview]').innerHTML = photo ? `<img src="${photo}" alt="Member photo">` : '👤'; sec.querySelector('[data-idc-front-logo]').src = logo; refreshMemberOptions(); update(); };
    const clear = () => { editingRecordId = ''; selectedMemberRecordId = ''; setForm({memberType:'Student',memberName:'',memberId:'',designation:'',department:'',division:'',validUntil:'',emergency:'',status:'Active',primary:'#071b3a',secondary:'#1459d9',schoolName:schoolBrandName,schoolAddress:''}); sec.querySelector('[data-idc-editing]').textContent='New Record'; };
    const memberTypeSelect = sec.querySelector('[name="memberType"]');
    const memberRecordSelect = sec.querySelector('[data-idc-member-record]');
    const memberCollection = type => type === 'Student' ? 'students' : type === 'Teacher' ? 'teachers' : 'staff';
    const memberRecordKey = record => String(record.id || record.recordId || '');
    const memberRecordNumber = (record, type) => String(type === 'Student'
        ? record.admissionNo || record.admissionNumber || record.studentId || memberRecordKey(record)
        : record.employeeNo || record.staffId || record.employeeId || record.memberId || memberRecordKey(record));
    const memberRecordName = record => String(record.fullName || record.name || record.staffName
        || [record.firstName, record.middleName, record.lastName].filter(Boolean).join(' ') || '');
    const recordsForMemberType = type => {
        const collection = memberCollection(type);
        const allRecords = memberRecords[collection];
        if (['Student', 'Teacher', 'Staff'].includes(type)) return allRecords;
        const roleKeywords = {
            Administrator: /admin|administrator/i,
            'Principal / Headteacher': /principal|head.?teacher|head.?master/i,
            Driver: /driver/i,
            Security: /security|guard/i,
            Librarian: /librarian|library/i
        };
        const rolePattern = roleKeywords[type];
        return rolePattern ? allRecords.filter(record =>
            rolePattern.test([record.designation, record.role, record.jobTitle, record.staffType, record.memberType].join(' '))
        ) : allRecords;
    };
    function refreshMemberOptions() {
        if (!memberRecordSelect || !memberTypeSelect) return;
        const type = memberTypeSelect.value;
        const collection = memberCollection(type);
        const items = recordsForMemberType(type);
        memberRecordSelect.replaceChildren(new Option(items.length
            ? `Select ${type.toLowerCase()}`
            : `No ${type.toLowerCase()} records available`, ''));
        items.forEach(record => {
            const id = memberRecordKey(record);
            if (!id) return;
            const number = memberRecordNumber(record, type);
            const name = memberRecordName(record) || number;
            memberRecordSelect.add(new Option(`${number} — ${name}`, id));
        });
        memberRecordSelect.value = items.some(record => memberRecordKey(record) === selectedMemberRecordId)
            ? selectedMemberRecordId
            : '';
        if (!memberRecordSelect.value && selectedMemberRecordId && memberRecordsLoaded[collection]) selectedMemberRecordId = '';
        memberRecordSelect.dataset.collection = collection;
    }
    const fillFromSelectedMember = () => {
        const collection = memberRecordSelect.dataset.collection;
        const record = memberRecords[collection]?.find(item => memberRecordKey(item) === memberRecordSelect.value);
        if (!record) {
            selectedMemberRecordId = '';
            return;
        }
        selectedMemberRecordId = memberRecordKey(record);
        const type = memberTypeSelect.value;
        const name = memberRecordName(record);
        const memberId = memberRecordNumber(record, type);
        const department = type === 'Student'
            ? [record.className || record.class, record.section || record.sectionName].filter(Boolean).join(' - ')
            : record.department || record.departmentName || record.staffDepartment || record.subject || '';
        const values = {
            memberName: name,
            memberId,
            designation: type === 'Student' ? 'Student' : record.designation || record.role || record.jobTitle || type,
            department,
            division: record.division || record.house || record.houseName || record.section || record.sectionName || '',
            emergency: record.emergency || record.emergencyContact || record.guardianPhone || record.phone || '',
            status: record.status || 'Active'
        };
        sec.querySelectorAll('[data-idc-field]').forEach(field => {
            if (Object.hasOwn(values, field.name)) field.value = values[field.name];
        });
        photo = String(record.photo || record.photoUrl || '');
        sec.querySelector('[data-idc-photo-preview]').innerHTML = photo ? `<img src="${escape(photo)}" alt="Member photo">` : '👤';
        update();
    };
    memberTypeSelect.addEventListener('change', () => {
        selectedMemberRecordId = '';
        memberRecordSelect.value = '';
        refreshMemberOptions();
        ['memberName', 'memberId', 'designation', 'department', 'division', 'emergency'].forEach(name => {
            const field = sec.querySelector(`[name="${name}"]`);
            if (field) field.value = '';
        });
        photo = '';
        sec.querySelector('[data-idc-photo-preview]').textContent = '👤';
        update();
    });
    memberRecordSelect.addEventListener('change', fillFromSelectedMember);
    sec.querySelector('[name="memberId"]').addEventListener('input', () => {
        if (!memberRecordSelect.value) return;
        selectedMemberRecordId = '';
        memberRecordSelect.value = '';
    });
    const loadMemberRecords = () => {
        const api = window.schoolPortalData;
        if (typeof api?.subscribe !== 'function') {
            console.error('Unable to load member records for ID cards: school data service is unavailable.');
            toast('Member records are unavailable. Reload and try again.');
            return;
        }
        void api.subscribe('idCards', loadedRecords => {
            records = loadedRecords.filter(record => record.deleted !== true);
            idCardsLoaded = true;
            render();
            const identity = api.getIdentity?.();
            const canEditCards = ['schoolAdmin', 'superAdmin', 'director', 'headTeacher'].includes(identity?.role)
                || identity?.permissions?.idCards?.edit === true;
            if (canEditCards) {
                records.filter(record => record.id && !record.qrToken).forEach(record => {
                    const migratedRecord = { ...record, qrToken: crypto.randomUUID() };
                    void api.saveRecord('idCards', record.id, migratedRecord).then(() => {
                        records = records.map(item => item.id === record.id ? migratedRecord : item);
                        render();
                    }).catch(error => {
                        console.warn(`Unable to add attendance QR to ID card ${record.id}.`, error);
                    });
                });
            }
        }).then(unsubscribe => {
            if (typeof unsubscribe === 'function') memberSubscriptions.push(unsubscribe);
        }).catch(error => {
            console.error('Unable to load saved ID cards.', error);
            toast('Unable to load saved ID cards.');
        });
        Object.keys(memberRecords).forEach(collection => {
            void api.subscribe(collection, loadedRecords => {
                memberRecords[collection] = loadedRecords.filter(record => record.deleted !== true);
                memberRecordsLoaded[collection] = true;
                refreshMemberOptions();
            }).then(unsubscribe => {
                if (typeof unsubscribe === 'function') memberSubscriptions.push(unsubscribe);
            }).catch(error => {
                memberRecordsLoaded[collection] = true;
                console.error(`Unable to load ${collection} records for ID cards.`, error);
                refreshMemberOptions();
            });
        });
    };
    let attendanceRecords = [];
    let attendanceRecordsLoaded = false;
    let idCardsLoaded = false;
    let attendanceSubscription = null;
    let attendanceIdentityKey = '';
    let cameraStream = null;
    let cameraTrack = null;
    let cameraTimer = null;
    let frameScanInProgress = false;
    let cameraMessageTimer = null;
    let scannerAudioContext = null;
    let scanInProgress = false;
    let lastScannedToken = '';
    let lastQrSeenAt = 0;
    const scannerVideo = sec.querySelector('[data-idc-camera]');
    const scannerStatus = sec.querySelector('[data-idc-scan-status]');
    const scannerResult = sec.querySelector('[data-idc-scan-result]');
    const scannerFrame = sec.querySelector('[data-idc-camera-frame]');
    const scannerMessage = sec.querySelector('[data-idc-camera-message]');
    const cameraZoomInput = sec.querySelector('[data-idc-camera-zoom]');
    const cameraZoomValue = sec.querySelector('[data-idc-zoom-value]');
    const cameraZoomControlElement = sec.querySelector('.idc-camera-zoom');
    const scannerCanvas = document.createElement('canvas');
    const scannerContext = scannerCanvas.getContext('2d', { willReadFrequently: true });
    let qrDetector = null;
    if (typeof window.BarcodeDetector === 'function') {
        try {
            qrDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        } catch (error) {
            console.info('Native QR detection is unavailable; using the compatibility decoder.', error);
        }
    }
    const scanStatus = message => {
        if (scannerStatus.textContent === message) return;
        scannerStatus.textContent = message;
        scannerResult.classList.add('hidden');
    };
    const showCameraMessage = message => {
        clearTimeout(cameraMessageTimer);
        scannerMessage.textContent = message;
        scannerMessage.classList.remove('hidden');
        cameraMessageTimer = setTimeout(() => {
            scannerMessage.classList.add('hidden');
            scannerMessage.textContent = '';
        }, 2000);
    };
    cameraZoomInput.addEventListener('input', () => {
        cameraZoomValue.value = `${Number(cameraZoomInput.value).toFixed(1).replace(/\.0$/, '')}×`;
    });
    cameraZoomInput.addEventListener('change', async () => {
        if (!cameraTrack) return;
        try {
            await cameraTrack.applyConstraints({ advanced: [{ zoom: Number(cameraZoomInput.value) }] });
        } catch (error) {
            console.warn('Unable to adjust QR scanner camera zoom.', error);
            scanStatus('This camera could not adjust its zoom. Move closer and keep the QR code in focus.');
        }
    });
    const configureCamera = async stream => {
        const track = stream.getVideoTracks()[0];
        cameraTrack = track;
        const capabilities = track.getCapabilities?.();
        const advanced = [];
        if (capabilities?.focusMode?.includes('continuous')) {
            advanced.push({ focusMode: 'continuous' });
        }
        const zoom = capabilities?.zoom;
        if (zoom && Number(zoom.max) > Number(zoom.min)) {
            const preferredZoom = Math.min(Number(zoom.max), Math.max(Number(zoom.min), 1.5));
            cameraZoomInput.min = String(zoom.min);
            cameraZoomInput.max = String(zoom.max);
            cameraZoomInput.step = String(zoom.step || 0.1);
            cameraZoomInput.value = String(preferredZoom);
            cameraZoomValue.value = `${preferredZoom.toFixed(1).replace(/\.0$/, '')}×`;
            cameraZoomControlElement.classList.remove('hidden');
            advanced.push({ zoom: preferredZoom });
        } else {
            cameraZoomControlElement.classList.add('hidden');
        }
        if (!advanced.length) return;
        try {
            await track.applyConstraints({ advanced });
        } catch (error) {
            console.warn('Unable to configure camera autofocus or zoom for QR scanning.', error);
            if (advanced.length > 1) {
                try {
                    await track.applyConstraints({ advanced: [advanced[0]] });
                } catch (focusError) {
                    console.warn('Continuous autofocus is not available for QR scanning.', focusError);
                }
            }
        }
    };
    const prepareScannerAudio = async () => {
        const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextConstructor) return;
        try {
            scannerAudioContext ||= new AudioContextConstructor();
            if (scannerAudioContext.state === 'suspended') await scannerAudioContext.resume();
        } catch (error) {
            console.warn('Unable to prepare QR scanner audio feedback.', error);
        }
    };
    const playScanSuccessSound = async () => {
        if (!scannerAudioContext) return;
        try {
            if (scannerAudioContext.state === 'suspended') await scannerAudioContext.resume();
            const startTime = scannerAudioContext.currentTime;
            [880, 1175].forEach((frequency, index) => {
                const start = startTime + index * 0.14;
                const oscillator = scannerAudioContext.createOscillator();
                const volume = scannerAudioContext.createGain();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(frequency, start);
                volume.gain.setValueAtTime(0.0001, start);
                volume.gain.exponentialRampToValueAtTime(0.18, start + 0.015);
                volume.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
                oscillator.connect(volume);
                volume.connect(scannerAudioContext.destination);
                oscillator.start(start);
                oscillator.stop(start + 0.13);
            });
        } catch (error) {
            console.warn('Unable to play QR attendance success sound.', error);
        }
    };
    const showScanResult = (record, action, timestamp) => {
        const date = new Date(timestamp);
        sec.querySelector('[data-idc-result-action]').textContent = action === 'check-in' ? 'Signed in successfully' : 'Signed out successfully';
        sec.querySelector('[data-idc-result-name]').textContent = record.memberName;
        sec.querySelector('[data-idc-result-date]').textContent = date.toLocaleDateString(undefined, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        sec.querySelector('[data-idc-result-time]').textContent = date.toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        scannerResult.classList.remove('hidden');
    };
    const stopCamera = () => {
        clearTimeout(cameraTimer);
        cameraTimer = null;
        frameScanInProgress = false;
        cameraStream?.getTracks().forEach(track => track.stop());
        cameraStream = null;
        cameraTrack = null;
        cameraZoomControlElement.classList.add('hidden');
        scannerVideo.srcObject = null;
        scannerFrame.classList.remove('is-scanning');
        scannerFrame.classList.remove('is-qr-detected');
        clearTimeout(cameraMessageTimer);
        scannerMessage.classList.add('hidden');
        sec.querySelector('[data-idc-camera-start]').disabled = false;
        sec.querySelector('[data-idc-camera-stop]').disabled = true;
    };
    const attendanceAccess = identity => {
        const administrator = ['schoolAdmin', 'superAdmin', 'director', 'headTeacher'].includes(identity?.role);
        return administrator || (identity?.permissions?.attendance?.view === true
            && identity?.permissions?.attendance?.edit === true);
    };
    const connectAttendanceRecords = async () => {
        const api = window.schoolPortalData;
        const identity = api?.getIdentity?.();
        if (!identity || !attendanceAccess(identity) || typeof api?.subscribe !== 'function') return;
        const identityKey = `${identity.schoolId}:${identity.uid}`;
        if (attendanceIdentityKey === identityKey) return;
        attendanceSubscription?.();
        attendanceIdentityKey = identityKey;
        attendanceRecordsLoaded = false;
        try {
            attendanceSubscription = await api.subscribe('attendance', loadedRecords => {
                if (attendanceIdentityKey !== identityKey) return;
                attendanceRecords = loadedRecords.filter(record => record.deleted !== true);
                attendanceRecordsLoaded = true;
            });
        } catch (error) {
            console.error('Unable to load attendance for the QR scanner.', error);
            scanStatus('Attendance records could not be loaded. Check your attendance access.');
        }
    };
    const attendanceMemberForCard = card => {
        const collection = memberCollection(card.memberType);
        const roster = memberRecords[collection] || [];
        const linkedRecordId = String(card.memberRecordId || card.studentId || '');
        return roster.find(record => linkedRecordId && memberRecordKey(record) === linkedRecordId)
            || roster.find(record => memberRecordNumber(record, card.memberType) === String(card.memberId || '')
                && memberRecordName(record) === String(card.memberName || ''));
    };
    const localDate = () => {
        const date = new Date();
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 10);
    };
    const formatScanTime = value => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const recordAttendanceScan = async decodedText => {
        const [prefix, encodedSchoolId, token, extra] = decodedText.split('|');
        if (prefix !== 'EDU1' || !encodedSchoolId || !token || extra !== undefined) {
            scanStatus('That QR code is not a school attendance card.');
            return;
        }
        let schoolId;
        try {
            schoolId = decodeURIComponent(encodedSchoolId);
        } catch {
            scanStatus('That QR code is not valid. Try again.');
            return;
        }
        const identity = window.schoolPortalData?.getIdentity?.();
        if (!identity || schoolId !== identity.schoolId || !attendanceAccess(identity)) {
            scanStatus('This card belongs to another school or your account cannot record attendance.');
            return;
        }
        if (!attendanceRecordsLoaded || !idCardsLoaded) {
            scanStatus('School records are still loading. Wait a moment, then scan again.');
            return;
        }
        const card = records.find(record => record.qrToken === token || String(record.id || '') === token);
        if (!card) {
            scanStatus('No saved ID card matches this QR code.');
            return;
        }
        if (String(card.status || 'Active').toLowerCase() !== 'active'
            || (card.validUntil && card.validUntil < localDate())) {
            scanStatus('This ID card is inactive or expired.');
            return;
        }
        const rosterRecord = attendanceMemberForCard(card);
        if (!rosterRecord) {
            scanStatus('Link this ID card to a saved student, teacher, or staff record first.');
            return;
        }
        const memberType = card.memberType === 'Student' ? 'Students'
            : card.memberType === 'Teacher' ? 'Teachers' : 'Staff';
        const memberId = memberRecordKey(rosterRecord);
        const date = localDate();
        const recordId = `ATT-${date}-${encodeURIComponent(memberId)}`;
        const existing = attendanceRecords.find(record => record.date === date
            && String(record.memberId || record.studentId || '') === memberId
            && (!record.memberType || record.memberType === memberType));
        const action = sec.querySelector('[data-idc-scan-mode]').value;
        if (action === 'check-in' && existing?.checkInAt) {
            return {
                recorded: false,
                message: `${card.memberName || memberRecordName(rosterRecord)} already signed in at ${formatScanTime(existing.checkInAt)}.`
            };
        }
        if (action === 'check-in' && existing?.checkOutAt) {
            scanStatus(`${card.memberName} has completed attendance for today.`);
            return;
        }
        if (action === 'check-out' && !existing?.checkInAt) {
            scanStatus(`${card.memberName} must check in before checking out.`);
            return;
        }
        if (action === 'check-out' && existing?.checkOutAt) {
            scanStatus(`${card.memberName} already checked out at ${formatScanTime(existing.checkOutAt)}.`);
            return;
        }
        const timestamp = new Date().toISOString();
        const record = {
            ...(existing || {}),
            id: existing?.id || recordId,
            memberId,
            memberDisplayId: card.memberId || memberRecordNumber(rosterRecord, card.memberType),
            ...(memberType === 'Students' ? { studentId: memberId } : {}),
            memberName: card.memberName || memberRecordName(rosterRecord),
            memberType,
            date,
            classDepartment: rosterRecord.className || rosterRecord.class || rosterRecord.department || '',
            section: rosterRecord.section || rosterRecord.sectionName || 'General',
            subject: existing?.subject || 'General',
            teacher: existing?.teacher || 'QR attendance scanner',
            status: 'Present',
            remarks: existing?.remarks || '',
            ...(action === 'check-in' ? { checkInAt: timestamp } : { checkOutAt: timestamp }),
            createdAt: existing?.createdAt || timestamp
        };
        const api = window.schoolPortalData;
        if (typeof api?.saveRecord !== 'function') {
            scanStatus('Attendance saving is unavailable. Reload the portal and try again.');
            return;
        }
        await api.saveRecord('attendance', record.id, record);
        void api.sync?.();
        attendanceRecords = attendanceRecords.filter(item => item.id !== record.id);
        attendanceRecords.unshift(record);
        const label = action === 'check-in' ? 'Checked in' : 'Checked out';
        scanStatus(`${label}: ${record.memberName}.`);
        showScanResult(record, action, timestamp);
        return true;
    };
    const handleCameraQr = decodedText => {
        if (!decodedText) {
            scannerFrame.classList.remove('is-qr-detected');
            const now = Date.now();
            if (now - lastQrSeenAt > 1500) {
                lastScannedToken = '';
                if (scannerStatus.textContent.startsWith('QR code')) {
                    scanStatus('Looking for a QR code. Align it inside the box to scan automatically.');
                }
            }
            return;
        }
        lastQrSeenAt = Date.now();
        scannerFrame.classList.add('is-qr-detected');
        const token = decodedText.split('|')[2] || decodedText;
        if (token === lastScannedToken) return;
        if (!attendanceRecordsLoaded || !idCardsLoaded) {
            scanStatus('QR code detected. Loading attendance records before registering…');
            return;
        }
        const matchedCard = records.find(record => record.qrToken === token);
        const rosterCollection = matchedCard && memberCollection(matchedCard.memberType);
        if (rosterCollection && !memberRecordsLoaded[rosterCollection]) {
            scanStatus('QR code detected. Loading the member record before registering…');
            return;
        }
        lastScannedToken = token;
        scanStatus('QR code detected. Registering attendance…');
        scanInProgress = true;
        void recordAttendanceScan(decodedText).then(recorded => {
            if (recorded?.recorded) {
                showCameraMessage('Attendance recorded successfully');
                void playScanSuccessSound();
            } else if (recorded?.message) {
                scanStatus(recorded.message);
                showCameraMessage(recorded.message);
                void playScanSuccessSound();
            }
        }).catch(error => {
            console.error('Unable to save QR attendance.', error);
            scanStatus(error.message || 'Attendance could not be saved. Check your access and try again.');
        }).finally(() => { scanInProgress = false; });
    };
    const scanCameraFrame = async () => {
        if (frameScanInProgress || scanInProgress || scannerVideo.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA
            || !scannerVideo.videoWidth) {
            if (cameraStream) cameraTimer = setTimeout(scanCameraFrame, 100);
            return;
        }
        frameScanInProgress = true;
        try {
            let decodedText = '';
            if (qrDetector) {
                try {
                    const detections = await qrDetector.detect(scannerVideo);
                    decodedText = detections[0]?.rawValue || '';
                } catch (error) {
                    console.warn('Native QR detection failed; switching to the compatibility decoder.', error);
                    qrDetector = null;
                }
            }
            if (!qrDetector && typeof window.jsQR === 'function') {
                const width = Math.min(scannerVideo.videoWidth, 1280);
                const height = Math.round(scannerVideo.videoHeight * width / scannerVideo.videoWidth);
                if (scannerCanvas.width !== width || scannerCanvas.height !== height) {
                    scannerCanvas.width = width;
                    scannerCanvas.height = height;
                }
                scannerContext.drawImage(scannerVideo, 0, 0, width, height);
                const image = scannerContext.getImageData(0, 0, width, height);
                decodedText = window.jsQR(image.data, width, height, { inversionAttempts: 'dontInvert' })?.data || '';
            }
            handleCameraQr(decodedText);
        } catch (error) {
            console.error('Unable to read a frame from the attendance camera.', error);
            scanStatus('The camera image could not be read. Stop and restart the camera.');
            stopCamera();
        } finally {
            frameScanInProgress = false;
            if (cameraStream) cameraTimer = setTimeout(scanCameraFrame, qrDetector ? 80 : 120);
        }
    };
    const startCamera = async () => {
        const identity = window.schoolPortalData?.getIdentity?.();
        if (!attendanceAccess(identity)) {
            scanStatus('Your account needs attendance view and edit access to use this scanner.');
            return;
        }
        if (!window.isSecureContext) {
            scanStatus('Camera access requires HTTPS. Open this portal using its secure HTTPS address.');
            return;
        }
        if (!navigator.mediaDevices?.getUserMedia || (!qrDetector && typeof window.jsQR !== 'function')) {
            scanStatus('Camera scanning is unavailable in this browser. Use an up-to-date browser with camera access.');
            return;
        }
        void prepareScannerAudio();
        if (!attendanceRecordsLoaded) await connectAttendanceRecords();
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            await configureCamera(cameraStream);
            scannerVideo.srcObject = cameraStream;
            await scannerVideo.play();
            scannerFrame.classList.add('is-scanning');
            sec.querySelector('[data-idc-camera-start]').disabled = true;
            sec.querySelector('[data-idc-camera-stop]').disabled = false;
            scanStatus('Looking for a QR code. Align it inside the box to scan automatically.');
            cameraTimer = setTimeout(scanCameraFrame, 0);
        } catch (error) {
            stopCamera();
            console.error('Unable to start the attendance camera.', error);
            scanStatus(error.name === 'NotAllowedError'
                ? 'Camera permission was denied. Allow camera access in your browser settings, then try again.'
                : error.name === 'NotFoundError'
                    ? 'No camera was found on this device.'
                    : error.name === 'NotReadableError'
                        ? 'The camera is busy in another app. Close it and try again.'
                        : !window.isSecureContext
                            ? 'Camera access requires HTTPS. Open this portal using its secure HTTPS address.'
                            : 'The camera could not start. Check browser permissions and try again.');
        }
    };
    sec.querySelector('[data-idc-camera-start]').addEventListener('click', startCamera);
    sec.querySelector('[data-idc-camera-stop]').addEventListener('click', stopCamera);
    sec.querySelector('[data-idc-close-scanner]').addEventListener('click', stopCamera);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopCamera();
    });
    window.addEventListener('pagehide', stopCamera);
    window.addEventListener('school-portal-identity-ready', () => {
        renderQr(sec.querySelector('[data-idc-qr]'), qrTokenField.value);
        void connectAttendanceRecords();
    });
    window.addEventListener('school-portal-identity-cleared', () => {
        stopCamera();
        attendanceSubscription?.();
        attendanceSubscription = null;
        attendanceIdentityKey = '';
        attendanceRecordsLoaded = false;
        attendanceRecords = [];
        lastScannedToken = '';
    });
    sec.querySelectorAll('[data-idc-field]').forEach(field => { field.addEventListener('input', update); field.addEventListener('change', update); }); sec.querySelector('[data-idc-new]').addEventListener('click', () => { sec.querySelector('[data-idc-editor]').classList.remove('hidden'); clear(); sec.querySelector('[data-idc-editor]').scrollIntoView({behavior:'smooth'}); }); sec.querySelector('[data-idc-close]').addEventListener('click', () => sec.querySelector('[data-idc-editor]').classList.add('hidden')); sec.querySelector('[data-idc-clear]').addEventListener('click', clear); sec.querySelector('[data-idc-toggle]').addEventListener('click', event => { const area = sec.querySelector('[data-idc-preview]'); const hidden = area.classList.toggle('hidden'); event.currentTarget.textContent = hidden ? 'Show Preview' : 'Hide Preview'; }); sec.querySelector('[data-idc-search]').addEventListener('input', render); sec.querySelector('[data-idc-filter-type]').addEventListener('change', render); sec.querySelector('[data-idc-filter-status]').addEventListener('change', render);
    sec.addEventListener('click', event => {
        const target = event.target.closest('[data-idc-save], [data-action="delete"]');
        if (!target) return;
        event.preventDefault();
        event.stopPropagation();
        if (target.matches('[data-idc-save]')) {
            void (async () => {
                const data = getRecord();
                if (!data.memberName.trim() || !data.memberId.trim()) {
                    toast('Please enter the member name and ID.');
                    return;
                }
                if (!selectedMemberRecordId) {
                    toast('Select a saved student, teacher, or staff record to enable QR attendance.');
                    return;
                }
                const api = window.schoolPortalData;
                if (typeof api?.saveRecord !== 'function') {
                    toast('ID-card storage is unavailable. Try again after reloading.');
                    return;
                }
                const existing = editingRecordId ? records.find(record => record.id === editingRecordId) : null;
                if (editingRecordId && !existing) {
                    toast('This ID card changed while you were editing. Close and reopen it before saving.');
                    return;
                }
                const duplicate = records.find(record => record.id !== existing?.id
                    && record.memberType === data.memberType
                    && (String(record.memberRecordId || record.studentId || '') === selectedMemberRecordId
                        || (!record.memberRecordId && !record.studentId
                            && String(record.memberId || '').trim() === data.memberId.trim()
                            && String(record.memberName || '').trim().toLowerCase() === data.memberName.trim().toLowerCase())));
                if (duplicate) {
                    toast(`${data.memberName} already has an ID card. Edit that card instead.`);
                    return;
                }
                const recordId = existing?.id || crypto.randomUUID();
                const savedRecord = {
                    ...data,
                    id: recordId,
                    createdAt: existing?.createdAt || data.createdAt
                };
                try {
                    await api.saveRecord('idCards', recordId, savedRecord);
                    records = [savedRecord, ...records.filter(record => record.id !== recordId)];
                    render();
                    editingRecordId = '';
                    sec.querySelector('[data-idc-editing]').textContent = 'New Record';
                    toast('ID card saved on this device; cloud sync is pending.');
                } catch (error) {
                    console.error('Unable to save the ID card.', error);
                    toast('ID card could not be saved. Please try again.');
                }
            })();
            return;
        }
        const index = Number(target.dataset.index);
        const record = records[index];
        if (!record || !confirm(`Delete ID record for ${record.memberName}?`)) return;
        const api = window.schoolPortalData;
        if (typeof api?.deleteRecord !== 'function') {
            toast('ID-card storage is unavailable. Try again after reloading.');
            return;
        }
        void api.deleteRecord('idCards', record.id).then(() => {
            records = records.filter(item => item.id !== record.id);
            render();
            toast('ID card deleted; cloud sync is pending.');
        }).catch(error => {
            console.error('Unable to delete the ID card.', error);
            toast('ID card could not be deleted. Please try again.');
        });
    }, true);
    window.addEventListener('school-portal-sync-update', event => {
        if (event.detail?.collection !== 'idCards') return;
        if (event.detail.state === 'synced') toast('ID card synced to the school cloud.');
    });
    const readFile = (event, callback) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => callback(reader.result);
        reader.readAsDataURL(file);
    };
    sec.querySelector('[data-idc-photo]').addEventListener('change', event => readFile(event, value => {
        photo = value;
        sec.querySelector('[data-idc-photo-preview]').innerHTML = `<img src="${value}" alt="Member photo">`;
    }));
    sec.querySelector('[data-idc-logo]').addEventListener('change', event => readFile(event, value => {
        logo = value;
        sec.querySelector('[data-idc-front-logo]').src = value;
    }));
    sec.querySelector('[data-idc-export]').addEventListener('click', () => {
        if (!records.length) return toast('There are no records to export.');
        const rows = [['Member Type', 'Name', 'Member ID', 'Designation', 'Department/Class', 'Division', 'Valid Until', 'Emergency Contact', 'Status'],
            ...records.map(record => [record.memberType, record.memberName, record.memberId, record.designation, record.department, record.division, record.validUntil, record.emergency, record.status])];
        const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'school-id-records.csv';
        link.click();
        URL.revokeObjectURL(url);
    });
    sec.querySelector('[data-idc-table]').addEventListener('click', event => {
        const button = event.target.closest('[data-action="edit"], [data-action="view"]');
        if (!button) return;
        const index = Number(button.dataset.index);
        if (!records[index]) return;
        if (button.dataset.action === 'view') {
            showCardPreview(records[index]);
            return;
        }
        editingRecordId = records[index].id;
        setForm(records[index]);
        sec.querySelector('[data-idc-editor]').classList.remove('hidden');
        sec.querySelector('[data-idc-editing]').textContent = 'Editing Record';
        sec.querySelector('[data-idc-editor]').scrollIntoView({ behavior: 'smooth' });
    });
    const viewModal = sec.querySelector('[data-idc-view-modal]');
    sec.querySelector('[data-idc-view-close]').addEventListener('click', () => viewModal.classList.add('hidden'));
    viewModal.addEventListener('click', event => {
        if (event.target === viewModal) viewModal.classList.add('hidden');
    });
    viewModal.addEventListener('keydown', event => {
        if (event.key === 'Escape') viewModal.classList.add('hidden');
    });
    sec.querySelector('[name="schoolName"]').removeAttribute('value');
    sec.querySelector('[data-idc-front-logo]').src = logo; clear(); render(); refreshMemberOptions(); loadMemberRecords();
    void (async () => {
        const identity = window.schoolPortalData?.getIdentity?.();
        if (!identity?.schoolId || typeof window.schoolPortalFirebase?.getSchool !== 'function') return;
        try {
            const school = await window.schoolPortalFirebase.getSchool(identity.schoolId);
            const schoolName = sec.querySelector('[name="schoolName"]');
            schoolBrandName = school.schoolName || '';
            schoolBrandLogo = school.logoURL || '';
            if (!schoolName.value) schoolName.value = schoolBrandName;
            logo = schoolBrandLogo;
            const logoImage = sec.querySelector('[data-idc-front-logo]');
            if (logo) logoImage.src = logo;
            update();
        } catch (error) {
            console.error('Unable to load school branding for ID cards.', error);
            toast('School branding could not be loaded.');
        }
    })();
    return sec;
}
