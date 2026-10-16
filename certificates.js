const certificateSheetMarkup = `<div class="certificate-sheet"><div class="cert-corner tl"></div><div class="cert-corner tr"></div><div class="cert-corner bl"></div><div class="cert-corner br"></div><img class="cert-watermark" data-cert-watermark><div class="cert-content"><img class="cert-logo" data-cert-logo-preview><div class="cert-school-name" data-cert-school></div><div class="cert-school-address" data-cert-address></div><div class="cert-divider"></div><div class="cert-title" data-cert-title></div><div class="cert-presented">Proudly Presented To</div><div class="cert-recipient" data-cert-recipient></div><div class="cert-description" data-cert-description></div><div class="cert-meta" data-cert-meta></div></div><div class="cert-bottom"><div class="cert-signature"><div class="cert-signature-line"></div><div class="cert-signature-name" data-cert-principal></div><div class="cert-signature-title">Principal / Headteacher</div></div><div class="cert-seal">★ EXCELLENCE ★<small>ABC SCHOOL</small></div><div class="cert-signature"><div class="cert-signature-line"></div><div class="cert-signature-name" data-cert-director></div><div class="cert-signature-title">Director / Authorized Officer</div></div></div><div class="cert-qr"></div><div class="cert-number">CERTIFICATE NO. <strong data-cert-number></strong></div></div>`;

window.createCertificateSheetPreview = record => {
    const template = document.createElement('template');
    template.innerHTML = certificateSheetMarkup;
    const sheet = template.content.firstElementChild;
    sheet.classList.toggle('is-portrait', String(record.orientation || '').toLowerCase() === 'portrait');
    const setText = (selector, value) => {
        const element = sheet.querySelector(selector);
        if (element) element.textContent = value || '';
    };
    const color = (value, fallback) => /^#[\da-f]{6}$/i.test(String(value || '')) ? value : fallback;
    const logo = String(record.logo || '');
    sheet.style.setProperty('--cert-primary', color(record.primary, '#071b3a'));
    sheet.style.setProperty('--cert-gold', color(record.gold, '#c9a24d'));
    setText('[data-cert-school]', record.schoolName);
    setText('[data-cert-address]', String(record.schoolAddress || '').toUpperCase());
    setText('[data-cert-title]', record.certificateType);
    setText('[data-cert-recipient]', record.recipientName || 'RECIPIENT NAME');
    setText('[data-cert-description]', record.description);
    setText('[data-cert-principal]', record.principal);
    setText('[data-cert-director]', record.director);
    setText('[data-cert-number]', record.certificateNumber);
    const issueDate = record.issueDate ? new Date(`${record.issueDate}T00:00:00`) : null;
    const issueText = issueDate && !Number.isNaN(issueDate.getTime())
        ? issueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
        : '—';
    setText('[data-cert-meta]', `Academic Year ${record.academicYear || ''} • Issued ${issueText}`);
    if (/^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(logo)
        || /^data:image\/svg\+xml(?:;charset=[^;,]+)?,/i.test(logo)
        || /^https?:\/\//i.test(logo)) {
        sheet.querySelector('[data-cert-logo-preview]').src = logo;
        sheet.querySelector('[data-cert-watermark]').src = logo;
    }
    return sheet;
};

function createCertificateModule(category) {
    const sec = document.createElement('section');
    sec.className = 'module certificate-module';
    sec.id = 'certificateModule';
    sec.innerHTML = `
        <div class="cert-header"><div class="cert-brand"><div class="cert-brand-icon"><i class="fas fa-certificate"></i></div><div><h2>Premium Certificates</h2><p>Universal School Certificate Management</p></div></div><button class="cert-btn cert-btn-primary" type="button" data-cert-new><i class="fas fa-plus"></i> New Certificate</button></div>
        <div class="cert-panel cert-editor" data-cert-editor><div class="cert-heading"><div class="cert-heading-left"><div class="cert-section-icon"><i class="fas fa-award"></i></div><div><h3>Certificate Entry</h3><p class="cert-subtitle">Create professional certificates for any school member</p></div></div><div><span class="cert-badge" data-cert-editing>New Certificate</span> <button class="cert-btn cert-btn-light" type="button" data-cert-close>Close</button></div></div>
        <div class="cert-fields"><div class="cert-field"><label>Certificate Type</label><select name="certificateType" data-cert-field><option>Certificate of Graduation</option><option>Certificate of Completion</option><option selected>Certificate of Excellence</option><option>Certificate of Achievement</option><option>Certificate of Merit</option><option>Certificate of Participation</option><option>Certificate of Attendance</option><option>Certificate of Appreciation</option><option>Certificate of Conduct</option><option>Certificate of Training</option><option>Transfer Certificate</option><option>Custom Certificate</option></select></div><div class="cert-field"><label>Recipient / Member Type</label><select name="memberType" data-cert-field><option>Student</option><option>Teacher</option><option>Staff</option><option>Administrator</option><option>Principal / Headteacher</option><option>Parent</option><option>Volunteer</option><option>Other</option></select></div><div class="cert-field"><label>Recipient Name</label><input name="recipientName" value="JOHN DOE" data-cert-field></div><div class="cert-field"><label>Certificate Number</label><input name="certificateNumber" value="CERT-2026-00452" data-cert-field></div><div class="cert-field"><label>Academic Year</label><input name="academicYear" value="2026 / 2027" data-cert-field></div><div class="cert-field"><label>Issue Date</label><input name="issueDate" type="date" data-cert-field></div><div class="cert-field"><label>Orientation</label><select name="orientation" data-cert-field><option selected>Landscape</option><option>Portrait</option></select></div><div class="cert-field"><label>Paper Size</label><select name="paperSize" data-cert-field><option selected>A4</option><option>Letter</option><option>A3</option></select></div><div class="cert-field"><label>Language</label><select name="language" data-cert-field><option selected>English</option><option>Arabic</option><option>French</option><option>Spanish</option></select></div><div class="cert-field"><label>Status</label><select name="status" data-cert-field><option selected>Draft</option><option>Generated</option><option>Published</option><option>Archived</option></select></div><div class="cert-field full"><label>Achievement / Certificate Statement</label><textarea name="description" data-cert-field>For outstanding academic achievement and exceptional performance during the academic year.</textarea></div><div class="cert-field"><label>School Name</label><input name="schoolName" value="ABC INTERNATIONAL SCHOOL" data-cert-field></div><div class="cert-field"><label>School Address</label><input name="schoolAddress" value="Abu Dhabi, United Arab Emirates" data-cert-field></div><div class="cert-field"><label>Principal Name</label><input name="principal" value="Dr. Michael Anderson" data-cert-field></div><div class="cert-field"><label>Director / Teacher</label><input name="director" value="Mrs. Sarah Williams" data-cert-field></div><div class="cert-field"><label>School Logo</label><label class="cert-upload"><i class="fas fa-school"></i>&nbsp; Upload School Logo<input type="file" accept="image/*" data-cert-logo></label></div><div class="cert-field"><label>Primary Colour</label><input name="primary" type="color" value="#071b3a" data-cert-field></div><div class="cert-field"><label>Gold Accent</label><input name="gold" type="color" value="#c9a24d" data-cert-field></div></div><div class="cert-form-actions"><button class="cert-btn cert-btn-light" type="button" data-cert-clear>Clear</button><button class="cert-btn cert-btn-gold" type="button" data-cert-print><i class="fas fa-print"></i> Print / PDF</button><button class="cert-btn cert-btn-primary" type="button" data-cert-save><i class="fas fa-save"></i> Save Certificate</button></div></div>
        <div class="cert-panel" data-cert-preview-panel style="display:none"><div class="cert-panel-heading cert-preview-heading"><div class="cert-heading-left"><div class="cert-section-icon"><i class="fas fa-eye"></i></div><div><h3>Live Certificate Preview</h3><p class="cert-subtitle">Royal Gold • Premium Universal Certificate</p></div></div></div><div class="cert-preview-area" data-cert-preview><div class="certificate-sheet"><div class="cert-corner tl"></div><div class="cert-corner tr"></div><div class="cert-corner bl"></div><div class="cert-corner br"></div><img class="cert-watermark" data-cert-watermark><div class="cert-content"><img class="cert-logo" data-cert-logo-preview><div class="cert-school-name" data-cert-school>ABC INTERNATIONAL SCHOOL</div><div class="cert-school-address" data-cert-address>ABU DHABI, UNITED ARAB EMIRATES</div><div class="cert-divider"></div><div class="cert-title" data-cert-title>CERTIFICATE OF EXCELLENCE</div><div class="cert-presented">Proudly Presented To</div><div class="cert-recipient" data-cert-recipient>JOHN DOE</div><div class="cert-description" data-cert-description>For outstanding academic achievement and exceptional performance during the academic year.</div><div class="cert-meta" data-cert-meta></div></div><div class="cert-bottom"><div class="cert-signature"><div class="cert-signature-line"></div><div class="cert-signature-name" data-cert-principal></div><div class="cert-signature-title">Principal / Headteacher</div></div><div class="cert-seal">★ EXCELLENCE ★<small>ABC SCHOOL</small></div><div class="cert-signature"><div class="cert-signature-line"></div><div class="cert-signature-name" data-cert-director></div><div class="cert-signature-title">Director / Authorized Officer</div></div></div><div class="cert-qr"></div><div class="cert-number">CERTIFICATE NO. <strong data-cert-number></strong></div></div></div></div>
        <div class="cert-panel cert-records"><div class="cert-panel-heading cert-records-heading"><div class="cert-heading-left"><div class="cert-section-icon"><i class="fas fa-clipboard-list"></i></div><div><h3>Certificate Records</h3><p class="cert-subtitle">All certificates issued by the school</p></div></div><div class="cert-tools"><input class="cert-search" type="search" placeholder="Search recipient, number, type..." data-cert-search><button class="cert-btn cert-btn-light" type="button" data-cert-export><i class="fas fa-download"></i> CSV</button></div></div><div class="cert-table-wrap"><table class="cert-table"><thead><tr><th>#</th><th>Recipient</th><th>Certificate No.</th><th>Type</th><th>Member ID</th><th>Academic Year</th><th>Issue Date</th><th>Status</th><th>Actions</th></tr></thead><tbody data-cert-table></tbody></table><div class="cert-empty" data-cert-empty>No certificate records found.</div></div></div><div class="cert-toast" data-cert-toast></div>`;
    const defaultLogo = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" fill="#fff"/><circle cx="100" cy="100" r="82" fill="#071b3a"/><path d="M42 78 100 48l58 30-58 30z" fill="#fff"/><path d="M63 91v33c21 16 53 16 74 0V91l-37 20z" fill="#d4ad52"/><text x="100" y="160" text-anchor="middle" font-family="Arial" font-size="21" font-weight="bold" fill="#fff">ABC</text></svg>');
    let records = []; let editingRecordId = ''; let logo = defaultLogo;
    const fields = () => Object.fromEntries([...sec.querySelectorAll('[data-cert-field]')].map(field => [field.name, field.value]));
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
    const dateText = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}) : '—';
    const toast = message => { const el=sec.querySelector('[data-cert-toast]'); el.textContent=message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove('show'),2400); };
    const previewClose = document.createElement('button');
    previewClose.className = 'cert-btn cert-btn-light';
    previewClose.type = 'button';
    previewClose.textContent = 'Back to certificates';
    previewClose.dataset.certViewClose = '';
    sec.querySelector('.cert-preview-heading').append(previewClose);
    const memberTypeSelect = sec.querySelector('[name="memberType"]');
    const memberRecords = { students: [], teachers: [], staff: [], parents: [] };
    const memberRecordsLoaded = { students: false, teachers: false, staff: false, parents: false };
    const memberSubscriptions = [];
    let selectedMemberRecordId = '';
    let memberIdentityKey = '';
    const memberRecordSelect = document.createElement('select');
    memberRecordSelect.id = 'certMemberRecordSelect';
    memberRecordSelect.setAttribute('aria-label', 'Select member ID');
    memberRecordSelect.add(new Option('Select a member type first', ''));
    const memberSelectField = document.createElement('div');
    memberSelectField.className = 'cert-field';
    const memberSelectLabel = document.createElement('label');
    memberSelectLabel.htmlFor = memberRecordSelect.id;
    memberSelectLabel.textContent = 'Select Member ID';
    memberSelectField.append(memberSelectLabel, memberRecordSelect);
    const memberIdInput = document.createElement('input');
    memberIdInput.name = 'memberId';
    memberIdInput.setAttribute('data-cert-field', '');
    const memberIdField = document.createElement('div');
    memberIdField.className = 'cert-field';
    const memberIdLabel = document.createElement('label');
    memberIdLabel.htmlFor = 'certMemberId';
    memberIdLabel.textContent = 'Member ID';
    memberIdInput.id = memberIdLabel.htmlFor;
    memberIdField.append(memberIdLabel, memberIdInput);
    const recipientNameField = sec.querySelector('[name="recipientName"]').closest('.cert-field');
    recipientNameField.before(memberSelectField);
    recipientNameField.after(memberIdField);
    const memberCollection = type => type === 'Student' ? 'students'
        : type === 'Teacher' ? 'teachers'
            : type === 'Parent' ? 'parents' : 'staff';
    const memberRecordKey = record => String(record.id || record.recordId || '');
    const memberRecordNumber = (record, type) => String(type === 'Student'
        ? record.admissionNo || record.admissionNumber || record.studentId || memberRecordKey(record)
        : type === 'Parent'
            ? record.parentId || record.guardianId || record.memberId || memberRecordKey(record)
            : record.employeeNo || record.staffId || record.employeeId || record.teacherId || record.memberId || memberRecordKey(record));
    const memberRecordName = record => String(record.fullName || record.name || record.studentName || record.teacherName
        || record.staffName || record.parentName || record.guardianName
        || [record.firstName, record.middleName, record.lastName].filter(Boolean).join(' ') || '');
    const recordsForMemberType = type => {
        const records = memberRecords[memberCollection(type)];
        const rolePatterns = {
            Administrator: /admin|administrator/i,
            'Principal / Headteacher': /principal|head.?teacher|head.?master/i,
            Volunteer: /volunteer/i
        };
        const rolePattern = rolePatterns[type];
        return rolePattern ? records.filter(record =>
            rolePattern.test([record.designation, record.role, record.jobTitle, record.staffType, record.memberType].join(' '))
        ) : records;
    };
    const refreshMemberOptions = () => {
        const type = memberTypeSelect.value;
        const collection = memberCollection(type);
        const items = recordsForMemberType(type);
        const placeholder = !memberRecordsLoaded[collection]
            ? `Loading ${type.toLowerCase()} IDs...`
            : items.length ? `Select ${type.toLowerCase()} ID` : `No ${type.toLowerCase()} IDs available`;
        memberRecordSelect.replaceChildren(new Option(placeholder, ''));
        items.forEach(record => {
            const id = memberRecordKey(record);
            if (!id) return;
            const number = memberRecordNumber(record, type);
            memberRecordSelect.add(new Option(`${number} — ${memberRecordName(record) || number}`, id));
        });
        memberRecordSelect.dataset.collection = collection;
        memberRecordSelect.value = items.some(record => memberRecordKey(record) === selectedMemberRecordId)
            ? selectedMemberRecordId : '';
        if (!memberRecordSelect.value && selectedMemberRecordId && memberRecordsLoaded[collection]) selectedMemberRecordId = '';
    };
    const clearMemberSelection = () => {
        selectedMemberRecordId = '';
        memberRecordSelect.value = '';
        memberIdInput.value = '';
    };
    const fillFromSelectedMember = () => {
        const collection = memberRecordSelect.dataset.collection;
        const record = memberRecords[collection]?.find(item => memberRecordKey(item) === memberRecordSelect.value);
        if (!record) {
            selectedMemberRecordId = '';
            return;
        }
        selectedMemberRecordId = memberRecordKey(record);
        sec.querySelector('[name="recipientName"]').value = memberRecordName(record);
        memberIdInput.value = memberRecordNumber(record, memberTypeSelect.value);
        update();
    };
    const connectMemberRecords = async () => {
        const api = window.schoolPortalData;
        const identity = api?.getIdentity?.();
        if (typeof api?.subscribe !== 'function' || !identity) return;
        const identityKey = `${identity.schoolId}:${identity.uid}`;
        if (memberIdentityKey === identityKey) return;
        memberSubscriptions.splice(0).forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') unsubscribe();
        });
        memberIdentityKey = identityKey;
        Object.keys(memberRecords).forEach(collection => {
            memberRecords[collection] = [];
            memberRecordsLoaded[collection] = false;
        });
        refreshMemberOptions();
        try {
            const unsubscribe = await api.subscribe('certificates', loadedRecords => {
                if (memberIdentityKey !== identityKey) return;
                records = loadedRecords.filter(record => record.deleted !== true);
                render();
            });
            if (memberIdentityKey === identityKey && typeof unsubscribe === 'function') memberSubscriptions.push(unsubscribe);
            else if (typeof unsubscribe === 'function') unsubscribe();
        } catch (error) {
            console.error('Unable to load certificate records from the school cloud.', error);
        }
        await Promise.all(Object.keys(memberRecords).map(async collection => {
            try {
                const unsubscribe = await api.subscribe(collection, loadedRecords => {
                    if (memberIdentityKey !== identityKey) return;
                    memberRecords[collection] = loadedRecords.filter(record => record.deleted !== true);
                    memberRecordsLoaded[collection] = true;
                    refreshMemberOptions();
                });
                if (memberIdentityKey === identityKey && typeof unsubscribe === 'function') memberSubscriptions.push(unsubscribe);
                else if (typeof unsubscribe === 'function') unsubscribe();
            } catch (error) {
                if (memberIdentityKey !== identityKey) return;
                memberRecordsLoaded[collection] = true;
                refreshMemberOptions();
                console.error(`Unable to load ${collection} records for certificates.`, error);
            }
        }));
    };
    window.addEventListener('school-portal-identity-ready', connectMemberRecords);
    memberTypeSelect.addEventListener('change', () => {
        clearMemberSelection();
        sec.querySelector('[name="recipientName"]').value = '';
        refreshMemberOptions();
        update();
    });
    memberRecordSelect.addEventListener('change', fillFromSelectedMember);
    memberIdInput.addEventListener('input', () => {
        if (!memberRecordSelect.value) return;
        selectedMemberRecordId = '';
        memberRecordSelect.value = '';
    });
    window.addEventListener('school-portal-identity-cleared', () => {
        memberSubscriptions.splice(0).forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') unsubscribe();
        });
        memberIdentityKey = '';
        Object.keys(memberRecords).forEach(collection => {
            memberRecords[collection] = [];
            memberRecordsLoaded[collection] = false;
        });
        clearMemberSelection();
        refreshMemberOptions();
    });
    const update = () => {
        sec.querySelector('.certificate-sheet')?.replaceWith(window.createCertificateSheetPreview({ ...fields(), logo }));
    };
    const clear = () => { editingRecordId=''; selectedMemberRecordId=''; const defaults={certificateType:'Certificate of Excellence',memberType:'Student',recipientName:'',memberId:'',certificateNumber:'CERT-2026-00452',academicYear:'2026 / 2027',issueDate:new Date().toISOString().slice(0,10),orientation:'Landscape',paperSize:'A4',language:'English',status:'Draft',description:'For outstanding academic achievement and exceptional performance during the academic year.',schoolName:'ABC INTERNATIONAL SCHOOL',schoolAddress:'Abu Dhabi, United Arab Emirates',principal:'Dr. Michael Anderson',director:'Mrs. Sarah Williams',primary:'#071b3a',gold:'#c9a24d'}; sec.querySelectorAll('[data-cert-field]').forEach(field=>{if(defaults[field.name]!==undefined) field.value=defaults[field.name];}); memberRecordSelect.value=''; refreshMemberOptions(); logo=defaultLogo; sec.querySelector('[data-cert-editing]').textContent='New Certificate'; update(); };
    const render = () => { const query=sec.querySelector('[data-cert-search]').value.toLowerCase(); const filtered=records.map((record,index)=>({record,index})).filter(({record})=>[record.recipientName,record.certificateNumber,record.certificateType,record.memberType,record.memberId].some(value=>String(value||'').toLowerCase().includes(query))); sec.querySelector('[data-cert-table]').innerHTML=filtered.map(({record,index},row)=>`<tr><td>${row+1}</td><td><strong>${escape(record.recipientName)}</strong></td><td>${escape(record.certificateNumber)}</td><td><span class="cert-type">${escape(record.certificateType)}</span></td><td>${escape(record.memberId)}</td><td>${escape(record.academicYear)}</td><td>${dateText(record.issueDate)}</td><td><span class="cert-status">${escape(record.status)}</span></td><td><div class="cert-actions"><button class="cert-action cert-view" data-action="view" data-index="${index}">View</button><button class="cert-action cert-edit" data-action="edit" data-index="${index}">Edit</button><button class="cert-action cert-delete" data-action="delete" data-index="${index}">Delete</button></div></td></tr>`).join(''); sec.querySelector('[data-cert-empty]').style.display=filtered.length?'none':'block'; };
    const setRecord = record => { sec.querySelectorAll('[data-cert-field]').forEach(field=>{if(record[field.name]!==undefined) field.value=record[field.name];}); const matchingMember=recordsForMemberType(memberTypeSelect.value).find(item=>memberRecordNumber(item,memberTypeSelect.value)===String(record.memberId||'')&&memberRecordName(item)===String(record.recipientName||'')); selectedMemberRecordId=String(record.memberRecordId||record.studentId||memberRecordKey(matchingMember||{})); refreshMemberOptions(); logo=record.logo||defaultLogo; update(); };
    sec.querySelectorAll('[data-cert-field]').forEach(field=>{field.addEventListener('input',update);field.addEventListener('change',update);});
    const saveButton = sec.querySelector('[data-cert-save]');
    saveButton.addEventListener('click', () => {
        void (async () => {
            const data = { ...fields(), memberRecordId: selectedMemberRecordId, logo, createdAt: new Date().toISOString() };
            if (!data.recipientName.trim()) return toast('Please enter the recipient name.');
            if (!data.certificateNumber.trim()) return toast('Please enter a certificate number.');
            const api = window.schoolPortalData;
            if (typeof api?.saveRecord !== 'function') return toast('Certificate storage is unavailable. Try again after reloading.');
            if (saveButton.disabled) return;
            saveButton.disabled = true;
            const existing = editingRecordId ? records.find(record => String(record.id) === editingRecordId) : null;
            const recordId = editingRecordId || existing?.id || crypto.randomUUID();
            const savedRecord = {
                ...data,
                id: recordId,
                ...(data.memberType === 'Student' && selectedMemberRecordId ? { studentId: selectedMemberRecordId } : {}),
                createdAt: existing?.createdAt || data.createdAt
            };
            try {
                await api.saveRecord('certificates', recordId, savedRecord);
                records = [savedRecord, ...records.filter(record => record.id !== recordId)];
                render();
                editingRecordId = '';
                toast('Certificate saved successfully.');
                sec.querySelector('[data-cert-editing]').textContent = 'New Certificate';
            } catch (error) {
                console.error('Unable to save the certificate.', error);
                toast(error.message || 'Certificate could not be saved. Please try again.');
            } finally {
                saveButton.disabled = false;
            }
        })();
    });
    sec.querySelector('[data-cert-search]').addEventListener('input', render);
    const readFile=event=>{const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{logo=reader.result;update();};reader.readAsDataURL(file);}; sec.querySelector('[data-cert-logo]').addEventListener('change',readFile); sec.querySelector('[data-cert-print]').addEventListener('click',()=>{document.body.classList.add('cert-printing');window.print();setTimeout(()=>document.body.classList.remove('cert-printing'),500);});
    sec.querySelector('[data-cert-export]').addEventListener('click',()=>{if(!records.length)return toast('No certificate records available.');const rows=[['Recipient','Certificate Number','Certificate Type','Member Type','Academic Year','Issue Date','Status'],...records.map(record=>[record.recipientName,record.certificateNumber,record.certificateType,record.memberType,record.academicYear,record.issueDate,record.status])];const csv=rows.map(row=>row.map(value=>`"${String(value??'').replace(/"/g,'""')}"`).join(',')).join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));const link=document.createElement('a');link.href=url;link.download='school-certificates.csv';link.click();URL.revokeObjectURL(url);});
    previewClose.hidden = true;
    previewClose.addEventListener('click', () => {
        sec.querySelector('[data-cert-preview-panel]').style.display = 'none';
        previewClose.hidden = true;
    });
    sec.querySelector('[data-cert-new]').addEventListener('click', () => {
        previewClose.hidden = true;
        sec.querySelector('[data-cert-preview-panel]').style.display = 'block';
        sec.querySelector('[data-cert-editor]').classList.add('is-open');
        clear();
        sec.querySelector('[data-cert-editor]').scrollIntoView({ behavior: 'smooth' });
    });
    sec.querySelector('[data-cert-close]').addEventListener('click', () => {
        sec.querySelector('[data-cert-editor]').classList.remove('is-open');
        sec.querySelector('[data-cert-preview-panel]').style.display = 'none';
        previewClose.hidden = true;
    });
    sec.querySelector('[data-cert-clear]').addEventListener('click', clear);
    sec.querySelector('[data-cert-table]').addEventListener('click', event => {
        const button = event.target.closest('[data-action]');
        if (!button) return;
        const index = Number(button.dataset.index);
        const record = records[index];
        if (!record) return;
        if (button.dataset.action === 'delete') {
            if (!confirm(`Delete certificate for ${record.recipientName}?`)) return;
            void (async () => {
                try {
                    if (record.id) await window.schoolPortalData?.deleteRecord('certificates', record.id);
                    records.splice(index, 1);
                    render();
                    toast('Certificate deleted.');
                } catch (error) {
                    console.error('Unable to delete the certificate.', error);
                    toast('Certificate could not be deleted. Please try again.');
                }
            })();
            return;
        }
        setRecord(record);
        if (button.dataset.action === 'view') {
            editingRecordId = '';
            previewClose.hidden = false;
            sec.querySelector('[data-cert-editor]').classList.remove('is-open');
            sec.querySelector('[data-cert-preview-panel]').style.display = 'block';
            sec.querySelector('[data-cert-preview-panel]').scrollIntoView({ behavior: 'smooth' });
            return;
        }
        if (button.dataset.action !== 'edit') return;
        editingRecordId = String(record.id || '');
        previewClose.hidden = true;
        sec.querySelector('[data-cert-preview-panel]').style.display = 'block';
        sec.querySelector('[data-cert-editor]').classList.add('is-open');
        sec.querySelector('[data-cert-editing]').textContent = 'Editing Certificate';
        sec.querySelector('[data-cert-editor]').scrollIntoView({ behavior: 'smooth' });
    });
    clear(); refreshMemberOptions(); void connectMemberRecords(); sec.querySelector('[data-cert-logo-preview]').src=logo; render(); return sec;
}