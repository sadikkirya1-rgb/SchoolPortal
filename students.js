(() => {
  const escape = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const avatar = student => `https://ui-avatars.com/api/?name=${encodeURIComponent(`${student.firstName} ${student.lastName}`)}&background=4f46e5&color=fff`;
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };
  let students = read('school_students', []);
  if (!localStorage.getItem('school_students')) students = [];
  let editingId = null;
  const fields = ['firstName','lastName','admissionNo','dob','gender','bloodGroup','className','section','academicYear','rollNo','admissionDate','status','fatherName','motherName','guardianPhone','guardianEmail','address','emergency','nationality','religion','notes'];
  const $ = id => document.getElementById(id);
  const schoolLogo = () => document.querySelector('#schoolLogoMark img')?.src || '';
  const studentStorageKey = () => {
    const identity = window.schoolPortalData?.getIdentity();
    return identity ? `school_students:${identity.schoolId}:${identity.uid}` : 'school_students';
  };
  const save = () => localStorage.setItem(studentStorageKey(), JSON.stringify(students));
  if (!Array.isArray(read('school_students', null))) save();
  const imageFallback = 'https://ui-avatars.com/api/?name=Student&background=e5e7eb&color=64748b';
  const formMarkup = () => `<div class="students-modal-box"><div class="students-modal-head"><div><h2 id="studentModalTitle">Add New Student</h2><p>Complete the student's information</p></div><button class="students-close" type="button" data-student-close>&times;</button></div><form id="studentsForm"><div class="students-modal-layout"><div class="students-form-body"><div class="students-photo-upload students-photo-upload-top"><label for="photo">Student Photo</label><img id="studentPhotoPreview" alt="Student Photo"><input type="file" id="photo" accept="image/*"></div>${section('Personal Information', [['firstName','First Name *','input'],['lastName','Last Name *','input'],['admissionNo','Admission Number *','input'],['dob','Date of Birth','date'],['gender','Gender','select','Male|Female|Other'],['bloodGroup','Blood Group','select','|A+|A-|B+|B-|AB+|AB-|O+|O-']])}${section('Academic Information',[['className','Class *','select','|Grade 1|Grade 2|Grade 3|Grade 4|Grade 5|Grade 6|Grade 7|Grade 8|Grade 9|Grade 10|Grade 11|Grade 12'],['section','Section','select','A|B|C|D'],['academicYear','Academic Year','input'],['rollNo','Roll Number','input'],['admissionDate','Admission Date','date'],['status','Status','select','Active|Inactive|Graduated|Transferred']])}${section('Parent / Guardian Information',[['fatherName','Father / Guardian Name','input'],['motherName','Mother Name','input'],['guardianPhone','Guardian Phone','input'],['guardianEmail','Guardian Email','email'],['address','Address','textarea full']])}${section('Additional Information',[['emergency','Emergency Contact','input'],['nationality','Nationality','input'],['religion','Religion','input'],['notes','Medical / Special Notes','textarea full']])}</div><aside class="students-live-summary"><h3>Student Summary</h3><p>Review key details before saving.</p><div data-student-summary></div></aside></div><div class="students-modal-foot"><button type="button" class="students-btn students-btn-light" data-student-close>Cancel</button><button type="submit" class="students-btn students-btn-primary">Save Student</button></div></form></div>`;
  function section(title, definitions) { return `<div class="students-form-section"><h3>${title}</h3><div class="students-form-grid">${definitions.map(([id,label,type,options='']) => { if(type === 'file') return `<div class="students-form-group"><label>${label}</label><div class="students-photo-upload"><img id="studentPhotoPreview" alt="${label}"><input type="file" id="${id}" accept="image/*"></div></div>`; if(type === 'textarea') return `<div class="students-form-group ${options === 'full' ? 'full' : ''}"><label>${label}</label><textarea id="${id}"></textarea></div>`; if(type === 'select') return `<div class="students-form-group"><label>${label}</label><select id="${id}">${options.split('|').map(option => `<option value="${option}">${option || 'Select'}</option>`).join('')}</select></div>`; return `<div class="students-form-group"><label>${label}</label><input type="${type}" id="${id}" ${label.includes('*') ? 'required' : ''}></div>`; }).join('')}</div></div>`; }
  function moduleMarkup() {
    return `<section class="students-cards">
        <div class="students-card students-stat"><div><p>Total Students</p><h2 id="totalStudents">0</h2></div><div class="students-stat-icon students-blue"><i class="fas fa-graduation-cap"></i></div></div>
        <div class="students-card students-stat"><div><p>Male Students</p><h2 id="maleStudents">0</h2></div><div class="students-stat-icon students-cyan"><i class="fas fa-child"></i></div></div>
        <div class="students-card students-stat"><div><p>Female Students</p><h2 id="femaleStudents">0</h2></div><div class="students-stat-icon students-green"><i class="fas fa-child-dress"></i></div></div>
        <div class="students-card students-stat"><div><p>Present Today</p><h2 id="presentStudents">0</h2></div><div class="students-stat-icon students-orange"><i class="fas fa-check"></i></div></div>
      </section>
      <div class="students-section-head"><div><h2>Students</h2><p>Student directory and records</p></div><div class="students-toolbar"><label class="students-search"><i class="fas fa-search"></i><input id="studentSearch" placeholder="Search student..."></label><input id="studentImportFile" class="students-file-input" type="file" accept=".csv,text/csv" hidden><button class="students-btn students-btn-light" id="studentImport" type="button"><i class="fas fa-file-import"></i> Import CSV</button><button class="students-btn students-btn-light" id="studentTemplate" type="button"><i class="fas fa-file-arrow-down"></i> Template</button><button class="students-btn students-btn-light" id="studentExport"><i class="fas fa-download"></i> Export</button><button class="students-btn students-btn-primary" data-student-add><i class="fas fa-plus"></i> Add Student</button></div></div><p class="students-import-status" id="studentImportStatus" role="status" aria-live="polite"></p>
      <div class="students-card students-table-card"><div class="students-table-wrap"><table><thead><tr><th>Student</th><th>Admission No.</th><th>Class</th><th>Gender</th><th>Parent Phone</th><th>Status</th><th>Actions</th></tr></thead><tbody id="studentTable"></tbody></table></div></div>`;
  }
  function render() { const query = ($('studentSearch')?.value || '').toLowerCase().trim(), rows = students.filter(s => [s.firstName,s.lastName,s.admissionNo,s.className,s.section,s.guardianPhone,s.guardianEmail].join(' ').toLowerCase().includes(query)); $('studentTable').innerHTML = rows.length ? rows.map(s => `<tr><td><div class="students-student"><img class="students-img" src="${s.photo || avatar(s)}" alt="Student"><div><strong>${escape(s.firstName)} ${escape(s.lastName)}</strong></div></div></td><td><strong>${escape(s.admissionNo)}</strong></td><td>${escape(s.className)} - ${escape(s.section)}</td><td>${escape(s.gender)}</td><td>${escape(s.guardianPhone || '-')}</td><td><span class="students-badge ${s.status === 'Active' ? 'students-active' : s.status === 'Inactive' ? 'students-inactive' : 'students-closed'}">${escape(s.status)}</span></td><td><div class="students-actions"><button class="students-action" title="Preview" data-preview="${s.id}"><i class="fas fa-eye"></i></button><button class="students-action" title="Edit" data-edit="${s.id}"><i class="fas fa-pen"></i></button><button class="students-action" title="Delete" data-delete="${s.id}"><i class="fas fa-trash"></i></button></div></td></tr>`).join('') : '<tr><td colspan="7"><div class="students-empty"><i class="fas fa-graduation-cap fa-2x"></i><h3>No students found</h3><p>Add a new student or change your search.</p></div></td></tr>'; $('totalStudents').textContent=students.length; $('maleStudents').textContent=students.filter(s=>s.gender==='Male').length; $('femaleStudents').textContent=students.filter(s=>s.gender==='Female').length; $('presentStudents').textContent=students.filter(s=>s.status==='Active').length; }
  function updateStudentSummary() { const target = $('studentModal').querySelector('[data-student-summary]'); target.replaceChildren(...fields.map(id => { const field = $(id); const row = document.createElement('div'); const label = document.createElement('span'); const value = document.createElement('strong'); row.className = 'students-summary-row'; label.textContent = field.closest('.students-form-group')?.querySelector('label')?.textContent.trim() || id; value.textContent = field.value || '-'; row.append(label, value); return row; })); const row = document.createElement('div'); const label = document.createElement('span'); const value = document.createElement('strong'); row.className = 'students-summary-row'; label.textContent = 'Student Photo'; value.textContent = $('studentPhotoPreview').dataset.photo ? 'Uploaded' : '-'; row.append(label, value); target.append(row); }
  function openForm(student) { editingId = student?.id || null; $('studentModalTitle').textContent = editingId ? 'Edit Student' : 'Add New Student'; fields.forEach(id => $(id).value = student?.[id] || (id === 'academicYear' ? '2026 - 2027' : '')); $('gender').value=student?.gender || 'Male'; $('section').value=student?.section || 'A'; $('status').value=student?.status || 'Active'; $('studentPhotoPreview').src=student?.photo || (student ? avatar(student) : imageFallback); $('studentPhotoPreview').dataset.photo=student?.photo || ''; $('studentModal').classList.add('show'); updateStudentSummary(); }
  function readImage(input, callback) { const file=input.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=event=>callback(event.target.result); reader.readAsDataURL(file); }
  function closeForm() { $('studentModal').classList.remove('show'); editingId=null; }
  let cloudUnsubscribe = null, connectedIdentity = '', promptedIdentity = '';
  const canManageSchoolData = identity => ['schoolAdmin', 'superAdmin', 'director', 'headTeacher'].includes(identity?.role);
  async function syncStudent(student) {
    const api = window.schoolPortalData, identity = api?.getIdentity();
    if (!api || !canManageSchoolData(identity)) return;
    const record = { ...student };
    await api.saveRecord('students', record.id, record);
    await api.sync();
  }
  async function connectCloud() {
    const api = window.schoolPortalData, identity = api?.getIdentity();
    if (!api || !identity || !canManageSchoolData(identity)) return;
    if (!$('studentTable')) {
      document.addEventListener('DOMContentLoaded', connectCloud, { once: true });
      return;
    }
    const identityKey = `${identity.schoolId}:${identity.uid}`;
    if (connectedIdentity === identityKey) return;
    cloudUnsubscribe?.();
    connectedIdentity = identityKey;
    const scopedRecords = read(`school_students:${identity.schoolId}:${identity.uid}`, null);
    let localRecords = Array.isArray(scopedRecords) ? scopedRecords : read('school_students', []);
    if (!Array.isArray(scopedRecords) && localRecords.length) {
      const legacySchoolId = localStorage.getItem('school_students_legacy_school');
      if (legacySchoolId && legacySchoolId !== identity.schoolId) localRecords = [];
      else if (!legacySchoolId) localStorage.setItem('school_students_legacy_school', identity.schoolId);
    }
    students = [];
    render();
    try {
      cloudUnsubscribe = await api.subscribe('students', (cloudRecords, metadata) => {
        if (metadata?.source !== 'cloud') return;
        const cloudIds = new Set(cloudRecords.map(record => String(record.id)));
        const localOnly = localRecords.filter(record => record && (record.id ?? record.admissionNo)
          && !cloudIds.has(String(record.id ?? record.admissionNo)));
        if (localOnly.length && promptedIdentity !== identityKey) {
          promptedIdentity = identityKey;
          const confirmed = window.confirm(
            `Import ${localOnly.length} locally saved student record(s) into ${identity.schoolId}? Check that these are real records for this school, not sample data. This uploads student and guardian details.`
          );
          if (confirmed) {
            void (async () => {
              let imported = 0;
              for (const student of localOnly) {
                const id = student.id ?? student.admissionNo;
                await syncStudent({ ...student, id });
                imported += 1;
              }
              window.alert(`${imported} student record(s) queued for cloud sync.`);
            })().catch(error => {
              console.error('Student data import failed.', error);
              window.alert('Some student records could not be imported. Check connectivity and your role, then retry.');
            });
          }
        }
        const merged = [...cloudRecords];
        localOnly.forEach(student => {
          const id = String(student.id ?? student.admissionNo);
          if (!cloudIds.has(id)) merged.push(student);
        });
        students = merged;
        save();
        render();
      }).catch(error => {
        connectedIdentity = '';
        console.error('Student cloud subscription failed.', error);
      });
    } catch (error) {
      connectedIdentity = '';
      console.error('Student cloud connection failed.', error);
    }
  }
  window.addEventListener('school-portal-identity-ready', connectCloud);
  window.addEventListener('school-portal-identity-cleared', () => {
    cloudUnsubscribe?.();
    cloudUnsubscribe = null;
    connectedIdentity = '';
    students = [];
    if ($('studentTable')) render();
  });
  window.schoolPortalStudentCloud = { connect: connectCloud, sync: syncStudent, storageKey: studentStorageKey };
  function preview(student) {
    if (!student) return;
    const value = (id, text) => { const el = $(id); if (!el) return; el.textContent = text && String(text).trim() ? String(text) : '-'; };
    const safe = (valueText, fallback = '-') => valueText && String(valueText).trim() ? String(valueText) : fallback;
    const formatDate = date => {
      if (!date) return '-';
      const parsed = new Date(date);
      if (Number.isNaN(parsed.getTime())) return date;
      return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    const studentName = [student.firstName, student.lastName].filter(Boolean).join(' ') || 'Student';
    $('studentPrintPreview').classList.add('show');
    $('printPhoto').src = student.photo || avatar(student);
    $('printLogo').src = schoolLogo() || imageFallback;
    value('printName', studentName);
    value('printAdmission', safe(student.admissionNo));
    value('printYear', safe(student.academicYear));
    value('printClass', `${safe(student.className, '')}${safe(student.className, '') && safe(student.section, '') ? ' - ' : ''}${safe(student.section, '')}`.trim() || '-');
    value('printGender', safe(student.gender));
    value('printDob', formatDate(student.dob));
    value('printBlood', safe(student.bloodGroup));
    value('printRoll', safe(student.rollNo));
    value('printStatus', safe(student.status, 'Active'));
    value('printGuardian', safe(student.fatherName || student.guardianName));
    value('printMother', safe(student.motherName));
    value('printPhone', safe(student.guardianPhone));
    value('printEmail', safe(student.guardianEmail));
    value('printAddress', safe(student.address));
    value('printNotes', safe(student.notes, 'No special notes.'));
  }
  function exportCSV() { downloadCSV('students.csv', [csvHeaders, ...students.map(s => [s.admissionNo,s.firstName,s.lastName,s.gender,s.dob,s.className,s.section,s.rollNo,s.fatherName,s.guardianPhone,s.guardianEmail,s.status])]); }
  const csvHeaders = ['Admission No','First Name','Last Name','Gender','Date of Birth','Class','Section','Roll No','Guardian','Phone','Email','Status'];
  function downloadCSV(filename, rows) {
    const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function parseCSV(text) {
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      if (quoted) {
        if (character === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
        else if (character === '"') quoted = false;
        else field += character;
      } else if (character === '"' && field === '') quoted = true;
      else if (character === ',') { row.push(field); field = ''; }
      else if (character === '\n' || character === '\r') {
        if (character === '\r' && text[index + 1] === '\n') index += 1;
        row.push(field); field = '';
        if (row.some(value => value.trim())) rows.push(row);
        row = [];
      } else field += character;
    }
    if (quoted) throw new Error('The CSV contains an unclosed quoted field.');
    row.push(field);
    if (row.some(value => value.trim())) rows.push(row);
    return rows;
  }
  function csvHeader(value) { return String(value || '').replace(/^\uFEFF/, '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
  async function importCSV(file) {
    const status = $('studentImportStatus');
    const identity = window.schoolPortalData?.getIdentity();
    if (!canManageSchoolData(identity)) throw new Error('Only school administrators can import student records.');
    if (file.size > 5 * 1024 * 1024) throw new Error('CSV files must be 5 MB or smaller.');
    const rows = parseCSV(await file.text());
    if (rows.length < 2) throw new Error('The CSV needs a header row and at least one student row.');
    const headerAliases = {
      admissionNo: ['admissionno','admissionnumber','studentid'],
      firstName: ['firstname','givenname'],
      lastName: ['lastname','surname','familyname'],
      gender: ['gender'],
      dob: ['dateofbirth','dob'],
      className: ['class','classname','grade'],
      section: ['section','stream'],
      rollNo: ['rollno','rollnumber'],
      fatherName: ['guardian','fathername','guardianname'],
      guardianPhone: ['phone','guardianphone','parentphone'],
      guardianEmail: ['email','guardianemail','parentemail'],
      status: ['status']
    };
    const headers = rows[0].map(csvHeader);
    const columns = Object.fromEntries(Object.entries(headerAliases).map(([field, aliases]) => [
      field,
      headers.findIndex(header => aliases.includes(header))
    ]));
    const required = ['admissionNo','firstName','lastName','className'];
    const missing = required.filter(field => columns[field] < 0);
    if (missing.length) throw new Error(`Missing required CSV columns: ${missing.join(', ')}.`);
    const dataRows = rows.slice(1);
    if (dataRows.length > 500) throw new Error('Import up to 500 students per CSV file.');
    const existingAdmissionNos = new Set(students.map(student => String(student.admissionNo || '').trim().toLowerCase()));
    const importedAdmissionNos = new Set();
    const validRecords = [];
    const validRowNumbers = [];
    const rowErrors = [];
    dataRows.forEach((values, index) => {
      const get = field => columns[field] < 0 ? '' : String(values[columns[field]] || '').trim();
      const admissionNo = get('admissionNo');
      const firstName = get('firstName');
      const lastName = get('lastName');
      const className = get('className');
      const rowNumber = index + 2;
      if (!admissionNo || !firstName || !lastName || !className) {
        rowErrors.push(`Row ${rowNumber}: admission number, first name, last name, and class are required.`);
        return;
      }
      const admissionKey = admissionNo.toLowerCase();
      if (existingAdmissionNos.has(admissionKey) || importedAdmissionNos.has(admissionKey)) {
        rowErrors.push(`Row ${rowNumber}: admission number "${admissionNo}" is already present.`);
        return;
      }
      const gender = get('gender');
      const statusValue = get('status');
      const validStatuses = ['Active','Inactive','Graduated','Transferred'];
      const status = validStatuses.find(value => value.toLowerCase() === statusValue.toLowerCase()) || 'Active';
      validRecords.push({
        id: crypto.randomUUID(),
        admissionNo,
        firstName,
        lastName,
        gender: ['Male','Female','Other'].find(value => value.toLowerCase() === gender.toLowerCase()) || '',
        dob: get('dob'),
        className,
        section: get('section'),
        rollNo: get('rollNo'),
        fatherName: get('fatherName'),
        guardianPhone: get('guardianPhone'),
        guardianEmail: get('guardianEmail'),
        status,
        academicYear: `${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`
      });
      validRowNumbers.push(rowNumber);
      importedAdmissionNos.add(admissionKey);
    });
    if (!validRecords.length) throw new Error(rowErrors.slice(0, 5).join(' ') || 'No valid student records were found.');
    if (!window.confirm(`Import ${validRecords.length} student record(s) into ${identity.schoolId}? This uploads student and guardian details.`)) {
      status.textContent = 'Import canceled.';
      return;
    }
    status.textContent = `Importing ${validRecords.length} student records…`;
    const imported = [];
    const syncErrors = [];
    for (let offset = 0; offset < validRecords.length; offset += 10) {
      const batch = validRecords.slice(offset, offset + 10);
      const results = await Promise.allSettled(batch.map(record => window.schoolPortalStudentCloud.sync(record)));
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') imported.push(batch[index]);
        else syncErrors.push(`Row ${validRowNumbers[offset + index]}: ${result.reason?.message || 'cloud sync failed'}`);
      });
      status.textContent = `Imported ${imported.length} of ${validRecords.length} student records…`;
    }
    const recordsById = new Map(students.map(student => [String(student.id), student]));
    imported.forEach(student => recordsById.set(String(student.id), student));
    students = [...recordsById.values()];
    save();
    render();
    const messages = [`Imported ${imported.length} of ${validRecords.length} records.`];
    if (rowErrors.length) messages.push(`${rowErrors.length} row(s) skipped: ${rowErrors.slice(0, 3).join(' ')}`);
    if (syncErrors.length) messages.push(`${syncErrors.length} record(s) failed to sync: ${syncErrors.slice(0, 3).join(' ')}`);
    status.textContent = messages.join(' ');
  }
  document.addEventListener('DOMContentLoaded', () => { const module=$('studentsModule'), oldModal=$('studentModal'); if(!module)return; module.innerHTML=moduleMarkup(); oldModal.className='students-modal'; oldModal.innerHTML=formMarkup(); const previewModal=document.createElement('div'); previewModal.id='studentPrintPreview'; previewModal.className='students-preview'; previewModal.innerHTML=`<div class="students-preview-container"><div class="students-preview-toolbar"><button class="students-btn students-btn-light" id="studentPrint"><i class="fas fa-print"></i> Print</button><button class="students-btn students-btn-light" id="studentPreviewClose">Close</button></div><div class="students-document"><div class="students-print-content"><div class="students-print-head"><img id="printLogo" class="students-print-logo"><div><h1>SMART SCHOOL</h1><h2>Student Information Record</h2><p>Excellence | Character | Knowledge</p></div></div><div class="students-document-title"><h2>STUDENT PROFILE</h2></div><div class="students-print-top"><table class="students-info-table"><tr><th>Admission No.</th><td id="printAdmission">-</td><th>Academic Year</th><td id="printYear">-</td></tr><tr><th>Student Name</th><td id="printName">-</td><th>Gender</th><td id="printGender">-</td></tr><tr><th>Date of Birth</th><td id="printDob">-</td><th>Blood Group</th><td id="printBlood">-</td></tr><tr><th>Class</th><td id="printClass">-</td><th>Roll Number</th><td id="printRoll">-</td></tr><tr><th>Status</th><td id="printStatus">-</td></tr></table><img id="printPhoto" class="students-print-photo"></div><div class="students-print-title">PARENT / GUARDIAN INFORMATION</div><table class="students-info-table"><tr><th>Father / Guardian</th><td id="printGuardian">-</td><th>Mother</th><td id="printMother">-</td></tr><tr><th>Phone</th><td id="printPhone">-</td><th>Email</th><td id="printEmail">-</td></tr><tr><th>Address</th><td colspan="3" id="printAddress">-</td></tr></table><div class="students-print-title">MEDICAL / SPECIAL NOTES</div><table class="students-info-table"><tr><td id="printNotes">-</td></tr></table><div class="students-signatures"><div class="students-signature"><div class="students-signature-line"></div><strong>Parent / Guardian</strong><span>Signature & Date</span></div><div class="students-signature"><div class="students-signature-line"></div><strong>Class Teacher</strong><span>Signature & Date</span></div><div class="students-signature"><div class="students-signature-line"></div><strong>Principal / Head of School</strong><span>Signature & Official Stamp</span></div></div></div><div class="students-print-footer">This document is an official student record generated by the School Management System.</div></div></div>`; document.body.appendChild(previewModal); render(); module.addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;if(button.matches('[data-student-add]'))openForm();if(button.dataset.edit)openForm(students.find(s=>s.id==button.dataset.edit));if(button.dataset.preview)preview(students.find(s=>s.id==button.dataset.preview));if(button.dataset.delete){const s=students.find(x=>x.id==button.dataset.delete);if(s&&confirm(`Delete ${s.firstName} ${s.lastName}?`)){students=students.filter(x=>x.id!=button.dataset.delete);save();render();}}}); $('studentSearch').addEventListener('input',render); $('studentExport').addEventListener('click',exportCSV); $('studentImport').addEventListener('click',()=>$('studentImportFile').click()); $('studentTemplate').addEventListener('click',()=>downloadCSV('students-import-template.csv',[csvHeaders])); $('studentImportFile').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;$('studentImportStatus').textContent='Checking CSV…';try{await importCSV(file);}catch(error){console.error('Student CSV import failed.',error);$('studentImportStatus').textContent=error.message||'Unable to import this CSV file.';}finally{event.target.value='';}}); oldModal.addEventListener('click',e=>{if(e.target===oldModal||e.target.closest('[data-student-close]'))closeForm();}); const studentForm=$('studentsForm'); studentForm.addEventListener('input',updateStudentSummary); studentForm.addEventListener('change',updateStudentSummary); studentForm.addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(fields.map(id=>[id,$(id).value.trim()]));data.id=editingId || Date.now();data.photo=$('studentPhotoPreview').dataset.photo || '';if(editingId)students[students.findIndex(s=>s.id===editingId)]=data;else students.push(data);save();render();closeForm();}); $('photo').addEventListener('change',()=>readImage($('photo'),src=>{$('studentPhotoPreview').src=src;$('studentPhotoPreview').dataset.photo=src;updateStudentSummary();})); $('studentPrint').addEventListener('click',()=>window.print()); $('studentPreviewClose').addEventListener('click',()=>previewModal.classList.remove('show')); window.openStudentsModal=openForm; window.renderStudents=render; });
})();

document.addEventListener('DOMContentLoaded', () => {
  window.schoolPortalStudentCloud?.connect();
  document.addEventListener('submit', event => {
    if (event.target.id !== 'studentsForm') return;
    queueMicrotask(() => {
      const form = event.target;
      const student = JSON.parse(localStorage.getItem(window.schoolPortalStudentCloud.storageKey()) || '[]')
        .find(record => record.admissionNo === form.querySelector('#admissionNo').value.trim());
      if (student) void window.schoolPortalStudentCloud.sync(student)
        .catch(error => console.error('Student record is saved locally but could not be synced.', error));
    });
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('#studentsModule [data-delete]');
    if (!button) return;
    const recordId = button.dataset.delete;
    setTimeout(() => {
      const records = JSON.parse(localStorage.getItem(window.schoolPortalStudentCloud.storageKey()) || '[]');
      if (records.some(record => String(record.id) === recordId)) return;
      void window.schoolPortalData?.deleteRecord('students', recordId)
        ?.catch(error => console.error('Student deletion could not be synced.', error));
    }, 0);
  });
});
