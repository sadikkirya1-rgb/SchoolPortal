function createAttendanceModule(category) {
    const sec=document.createElement('section');sec.className='module attendance-module';sec.id='attendanceModule';
    sec.innerHTML=`<div class="attendance-header"><div class="attendance-brand"><div class="attendance-brand-icon"><i class="fas fa-calendar-check"></i></div><div><h2>School Attendance</h2><p>Students • Teachers • Staff • Daily Attendance Management</p></div></div><button class="attendance-btn attendance-btn-primary" type="button" data-att-new><i class="fas fa-plus"></i> New Attendance</button></div><div class="attendance-stats"><div class="attendance-stat"><div class="attendance-stat-icon"><i class="fas fa-users"></i></div><div class="attendance-stat-value" data-att-stat="people">0</div><div class="attendance-stat-label">Total Members</div></div><div class="attendance-stat"><div class="attendance-stat-icon"><i class="fas fa-check"></i></div><div class="attendance-stat-value" data-att-stat="present">0</div><div class="attendance-stat-label">Present Today</div></div><div class="attendance-stat"><div class="attendance-stat-icon"><i class="fas fa-xmark"></i></div><div class="attendance-stat-value" data-att-stat="absent">0</div><div class="attendance-stat-label">Absent Today</div></div><div class="attendance-stat"><div class="attendance-stat-icon"><i class="fas fa-clock"></i></div><div class="attendance-stat-value" data-att-stat="late">0</div><div class="attendance-stat-label">Late Today</div></div><div class="attendance-stat"><div class="attendance-stat-icon"><i class="fas fa-percent"></i></div><div class="attendance-stat-value" data-att-stat="rate">0%</div><div class="attendance-stat-label">Attendance Rate</div></div></div><div class="attendance-panel attendance-editor" data-att-editor><div class="attendance-heading"><div class="attendance-heading-left"><div class="attendance-section-icon"><i class="fas fa-check"></i></div><div><h3>Attendance Entry</h3><p class="attendance-subtitle">Create and record daily attendance</p></div></div><div><span class="library-badge" data-att-editing>New Attendance</span> <button class="attendance-btn attendance-btn-light" type="button" data-att-close>Close</button></div></div><div class="attendance-fields"><div class="attendance-field"><label>Attendance Date *</label><input name="date" type="date" data-att-field></div><div class="attendance-field"><label>Academic Year</label><select name="academicYear" data-att-field><option>2026/27</option><option>2025/26</option><option>2027/28</option></select></div><div class="attendance-field"><label>Academic Period</label><select name="period" data-att-field><option>Term 1</option><option>Term 2</option><option>Term 3</option><option>Semester 1</option><option>Semester 2</option></select></div><div class="attendance-field"><label>Member Type</label><select name="memberType" data-att-field><option>Students</option><option>Teachers</option><option>Staff</option><option>All Members</option></select></div><div class="attendance-field"><label>Class / Department</label><select name="classDepartment" data-att-field><option>Grade 1</option><option>Grade 2</option><option>Grade 3</option><option>Grade 4</option><option>Grade 5</option><option>Grade 6</option><option>Grade 7</option><option>Grade 8</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option><option>Teaching Staff</option><option>Administration</option><option>Support Staff</option></select></div><div class="attendance-field"><label>Section</label><select name="section" data-att-field><option>A</option><option>B</option><option>C</option><option>D</option><option>General</option></select></div><div class="attendance-field"><label>Subject / Period</label><input name="subject" placeholder="e.g. Mathematics" data-att-field></div><div class="attendance-field"><label>Teacher / Attendance Officer</label><input name="teacher" placeholder="Teacher name" data-att-field></div></div><div class="attendance-mark-panel"><div class="attendance-mark-header"><div><h3>Mark Attendance</h3><p>Select Present, Absent, Late or Excused for each member.</p></div><div class="attendance-mark-actions"><button class="attendance-btn attendance-btn-green" type="button" data-att-all="Present">✓ All Present</button><button class="attendance-btn attendance-btn-red" type="button" data-att-all="Absent">✕ All Absent</button><button class="attendance-btn attendance-btn-orange" type="button" data-att-all="Late">⏰ All Late</button></div></div><div class="attendance-member-list" data-att-members></div><div class="attendance-summary"><div class="attendance-summary-box attendance-summary-present"><strong data-att-count="Present">0</strong><span>Present</span></div><div class="attendance-summary-box attendance-summary-absent"><strong data-att-count="Absent">0</strong><span>Absent</span></div><div class="attendance-summary-box attendance-summary-late"><strong data-att-count="Late">0</strong><span>Late</span></div><div class="attendance-summary-box attendance-summary-excused"><strong data-att-count="Excused">0</strong><span>Excused</span></div></div></div><div class="attendance-form-actions"><button class="attendance-btn attendance-btn-light" type="button" data-att-reset>Reset</button><button class="attendance-btn attendance-btn-primary" type="button" data-att-save><i class="fas fa-save"></i> Save Attendance</button></div></div><div class="attendance-panel attendance-records"><div class="attendance-records-heading"><div class="attendance-record-title"><div class="attendance-section-icon"><i class="fas fa-clipboard-list"></i></div><div><h3>Attendance Records</h3><p class="attendance-subtitle">Daily attendance history and member records</p></div></div><div class="attendance-tools"><input class="attendance-search" type="search" placeholder="Search member, class, section..." data-att-search><select class="attendance-search" data-att-status><option value="">All Status</option><option>Present</option><option>Absent</option><option>Late</option><option>Excused</option></select><button class="attendance-btn attendance-btn-light" type="button" data-att-print><i class="fas fa-print"></i> Print</button><button class="attendance-btn attendance-btn-light" type="button" data-att-export><i class="fas fa-download"></i> CSV</button></div></div><div class="attendance-table-wrap"><table class="attendance-table"><thead><tr><th>#</th><th>Member</th><th>Type</th><th>Date</th><th>Class / Department</th><th>Section</th><th>Subject</th><th>Officer</th><th>Status</th><th>Remarks</th><th>Actions</th></tr></thead><tbody data-att-table></tbody></table><div class="attendance-empty" data-att-empty>No attendance records found.</div></div></div><div class="attendance-toast" data-att-toast></div>`;
    const members=[{id:'ST-2026-001',name:'Ahmed Ali',type:'Students',class:'Grade 8',section:'A'},{id:'ST-2026-002',name:'Fatima Hassan',type:'Students',class:'Grade 8',section:'A'},{id:'ST-2026-003',name:'Omar Abdullah',type:'Students',class:'Grade 8',section:'A'},{id:'ST-2026-004',name:'Maryam Khalid',type:'Students',class:'Grade 8',section:'A'},{id:'ST-2026-005',name:'John Peter',type:'Students',class:'Grade 8',section:'A'},{id:'ST-2026-006',name:'Sara Mohammed',type:'Students',class:'Grade 8',section:'A'},{id:'T-2026-001',name:'Mr. David Wilson',type:'Teachers',class:'Teaching Staff',section:'General'},{id:'T-2026-002',name:'Mrs. Sarah Williams',type:'Teachers',class:'Teaching Staff',section:'General'},{id:'SF-2026-001',name:'James Brown',type:'Staff',class:'Support Staff',section:'General'},{id:'SF-2026-002',name:'Aisha Noor',type:'Staff',class:'Administration',section:'General'}];const key='schoolAttendanceRecords';let records=JSON.parse(localStorage.getItem(key)||'[]');let state={};let editingIndex=-1;const fields=()=>Object.fromEntries([...sec.querySelectorAll('[data-att-field]')].map(field=>[field.name,field.value]));const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));const today=()=>new Date().toISOString().slice(0,10);const toast=message=>{const el=sec.querySelector('[data-att-toast]');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2400)};const filteredMembers=()=>{const type=fields().memberType;return type==='All Members'?members:members.filter(member=>member.type===type)};
    members.splice(0);
    const attendanceTableHeader = sec.querySelector('[data-att-table]')?.closest('table')?.querySelector('thead tr');
    if (attendanceTableHeader && !attendanceTableHeader.querySelector('[data-att-member-id-heading]')) {
        const memberIdHeading = document.createElement('th');
        memberIdHeading.dataset.attMemberIdHeading = '';
        memberIdHeading.textContent = 'Member ID';
        attendanceTableHeader.insertBefore(memberIdHeading, attendanceTableHeader.children[2] || null);
    }
    let allRosterMembers = [];
    let rosterSubscriptions = [];
    let rosterIdentityKey = '';
    let attendanceSubscription = null;
    let attendanceIdentityKey = '';
    const rosterSources = [
        { collection: 'students', type: 'Students' },
        { collection: 'teachers', type: 'Teachers' },
        { collection: 'staff', type: 'Staff' }
    ];
    const memberFromRecord = (record, type) => {
        const name = record.fullName || record.studentName || record.teacherName || record.staffName
            || record.name || [record.firstName, record.lastName].filter(Boolean).join(' ');
        const id = String(record.id || record.studentId || record.employeeId || record.staffId || '');
        if (!id || !name) return null;
        return {
            id,
            name,
            type,
            class: record.className || record.class || record.grade || record.department
                || (type === 'Teachers' ? 'Teaching Staff' : type === 'Staff' ? 'Support Staff' : ''),
            section: record.section || record.sectionName || 'General'
        };
    };
    const applyRosterFilters = () => {
        const populateOptions = (name, values, placeholder) => {
            const select = sec.querySelector(`[name="${name}"]`);
            const previousValue = select.value;
            const options = [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
            select.replaceChildren(new Option(placeholder, ''), ...options.map(value => new Option(value, value)));
            if (options.includes(previousValue)) select.value = previousValue;
        };
        populateOptions('classDepartment', allRosterMembers.map(member => member.class), 'All Classes / Departments');
        populateOptions('section', allRosterMembers.map(member => member.section), 'All Sections');
        const { classDepartment, section } = fields();
        const filteredRoster = allRosterMembers.filter(member =>
            (!classDepartment || member.class === classDepartment)
            && (!section || member.section === section)
        );
        members.splice(0, members.length, ...filteredRoster);
    };
    const connectRoster = async () => {
        const api = window.schoolPortalData;
        const identity = api?.getIdentity?.();
        if (!api || !identity) return;
        const identityKey = `${identity.schoolId}:${identity.uid}`;
        if (rosterIdentityKey === identityKey) return;
        rosterSubscriptions.forEach(unsubscribe => unsubscribe());
        rosterSubscriptions = [];
        rosterIdentityKey = identityKey;
        allRosterMembers = [];
        members.splice(0);
        state = {};
        renderMembers();
        const isAdmin = ['schoolAdmin', 'superAdmin', 'director', 'headTeacher'].includes(identity.role);
        const permittedSources = rosterSources.filter(source =>
            isAdmin || identity.permissions?.[source.collection]?.view === true
        );
        await Promise.all(permittedSources.map(async source => {
            try {
                const unsubscribe = await api.subscribe(source.collection, records => {
                    if (rosterIdentityKey !== identityKey) return;
                    const sourceMembers = records.map(record => memberFromRecord(record, source.type)).filter(Boolean);
                    const otherMembers = allRosterMembers.filter(member => member.type !== source.type);
                    allRosterMembers = [...otherMembers, ...sourceMembers];
                    applyRosterFilters();
                    sourceMembers.forEach(member => {
                        state[member.id] ||= { status: 'Present', note: '' };
                    });
                    renderMembers();
                    updateStats();
                });
                if (rosterIdentityKey === identityKey) rosterSubscriptions.push(unsubscribe);
                else unsubscribe();
            } catch (error) {
                console.error(`Unable to load attendance ${source.collection} roster.`, error);
                toast(`Unable to load ${source.type.toLowerCase()} for attendance.`);
            }
        }));
    };
    window.addEventListener('school-portal-identity-ready', connectRoster);
    window.addEventListener('school-portal-identity-cleared', () => {
        rosterSubscriptions.forEach(unsubscribe => unsubscribe());
        rosterSubscriptions = [];
        rosterIdentityKey = '';
        attendanceSubscription?.();
        attendanceSubscription = null;
        attendanceIdentityKey = '';
        allRosterMembers = [];
        members.splice(0);
        state = {};
        records = [];
        renderMembers();
        render();
    });
    const summary = () => {
        ['Present', 'Absent', 'Late', 'Excused'].forEach(status => {
            sec.querySelector(`[data-att-count="${status}"]`).textContent =
                Object.values(state).filter(item => item.status === status).length;
        });
    };
    const connectAttendanceRecords = async () => {
        const api = window.schoolPortalData;
        const identity = api?.getIdentity?.();
        if (!api || !identity || identity.permissions?.attendance?.view !== true
            && !['schoolAdmin', 'superAdmin', 'director', 'headTeacher'].includes(identity.role)) return;
        const identityKey = `${identity.schoolId}:${identity.uid}`;
        if (attendanceIdentityKey === identityKey) return;
        attendanceSubscription?.();
        attendanceIdentityKey = identityKey;
        try {
            attendanceSubscription = await api.subscribe('attendance', cloudRecords => {
                if (attendanceIdentityKey !== identityKey) return;
                records = cloudRecords.filter(record => record.deleted !== true);
                render();
            });
        } catch (error) {
            console.error('Unable to load attendance records from the school cloud.', error);
            toast('Attendance records could not be loaded from the cloud.');
        }
    };
    window.addEventListener('school-portal-identity-ready', connectAttendanceRecords);
    const renderMembers = () => {
        const list = sec.querySelector('[data-att-members]');
        list.replaceChildren();
        filteredMembers().forEach((member, index) => {
            const item = state[member.id] || { status: 'Present', note: '' };
            state[member.id] = item;
            const row = document.createElement('div');
            row.className = 'attendance-member-row';
            row.innerHTML = `<div class="attendance-member-number">${index + 1}</div>
                <div class="attendance-member-info"><div class="attendance-member-avatar">${member.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}</div>
                    <div><div class="attendance-member-name">${escape(member.name)}</div><div class="attendance-member-meta">${escape(member.id)} • ${escape(member.class)} - ${escape(member.section)}</div></div>
                </div>
                <div class="attendance-status-buttons" role="group" aria-label="Attendance status for ${escape(member.name)}">
                    ${['Present', 'Absent', 'Late', 'Excused'].map(status => `<button type="button" class="attendance-status-btn ${status.toLowerCase()} ${item.status === status ? 'active' : ''}" data-att-member="${escape(member.id)}" data-att-status-value="${status}" aria-pressed="${item.status === status}"><span class="attendance-status-mark" aria-hidden="true">${status === 'Present' ? '✓' : status === 'Absent' ? '×' : status === 'Late' ? '◷' : 'E'}</span><span>${status}</span></button>`).join('')}
                </div>
                <div class="attendance-note"><input aria-label="Remark for ${escape(member.name)}" placeholder="Remark" value="${escape(item.note)}" data-att-note="${escape(member.id)}"></div>`;
            list.appendChild(row);
        });
        summary();
    };
    const loadMembers = () => {
        state = {};
        filteredMembers().forEach(member => { state[member.id] = { status: 'Present', note: '' }; });
        renderMembers();
    };
    const reset = () => {
        editingIndex = -1;
        const defaults = {
            date: today(), academicYear: '2026/27', period: 'Term 1', memberType: 'Students',
            classDepartment: '', section: '', subject: '', teacher: ''
        };
        sec.querySelectorAll('[data-att-field]').forEach(field => { field.value = defaults[field.name] ?? ''; });
        sec.querySelector('[data-att-editing]').textContent = 'New Attendance';
        applyRosterFilters();
        loadMembers();
    };
    const updateStats = () => {
        const current = records.filter(record => record.date === today());
        const count = status => current.filter(record => record.status === status).length;
        const total = current.length;
        const stats = {
            people: members.length,
            present: count('Present'),
            absent: count('Absent'),
            late: count('Late'),
            rate: total ? `${Math.round((count('Present') + count('Late') + count('Excused')) / total * 100)}%` : '0%'
        };
        Object.entries(stats).forEach(([name, value]) => {
            sec.querySelector(`[data-att-stat="${name}"]`).textContent = value;
        });
    };
    const statusClass=status=>`attendance-${status.toLowerCase()}`;const formatDate=value=>value?new Date(`${value}T00:00:00`).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'—';const render=()=>{const query=sec.querySelector('[data-att-search]').value.toLowerCase();const filter=sec.querySelector('[data-att-status]').value;const filtered=records.map((record,index)=>({record,index})).filter(({record})=>`${record.memberName} ${record.memberId} ${record.memberType} ${record.classDepartment} ${record.section} ${record.subject} ${record.teacher}`.toLowerCase().includes(query)&&(!filter||record.status===filter));sec.querySelector('[data-att-table]').innerHTML=filtered.map(({record,index},row)=>`<tr><td>${row+1}</td><td><div class="attendance-person"><div class="attendance-person-avatar">${record.memberName.split(' ').map(part=>part[0]).join('').slice(0,2).toUpperCase()}</div><strong>${escape(record.memberName)}</strong></div></td><td>${escape(record.memberId||'—')}</td><td>${escape(record.memberType)}</td><td>${formatDate(record.date)}</td><td>${escape(record.classDepartment)}</td><td>${escape(record.section)}</td><td>${escape(record.subject)}</td><td>${escape(record.teacher)}</td><td><span class="attendance-badge ${statusClass(record.status)}">${escape(record.status)}</span></td><td>${escape(record.remarks||'—')}</td><td><div class="attendance-row-actions"><button class="attendance-action attendance-view" data-action="view" data-index="${index}">View</button><button class="attendance-action attendance-edit" data-action="edit" data-index="${index}">Edit</button><button class="attendance-action attendance-delete" data-action="delete" data-index="${index}">Delete</button></div></td></tr>`).join('');sec.querySelector('[data-att-empty]').style.display=filtered.length?'none':'block';updateStats()};
    const open = () => {
        sec.querySelector('[data-att-editor]').classList.add('is-open');
        sec.querySelector('[data-att-editor]').scrollIntoView({ behavior: 'smooth' });
    };
    sec.querySelector('[data-att-new]').addEventListener('click', () => { reset(); open(); });
    sec.querySelector('[data-att-close]').addEventListener('click', () => {
        sec.querySelector('[data-att-editor]').classList.remove('is-open');
        editingIndex = -1;
    });
    sec.querySelector('[data-att-reset]').addEventListener('click', () => { reset(); toast('Attendance form reset.'); });
    sec.querySelectorAll('[data-att-field]').forEach(field => field.addEventListener('change', () => {
        if (field.name === 'memberType') loadMembers();
    }));
    ['classDepartment', 'section'].forEach(name => {
        sec.querySelector(`[name="${name}"]`).addEventListener('change', () => {
            applyRosterFilters();
            loadMembers();
        });
    });
    sec.querySelector('[data-att-members]').addEventListener('click', event => {
        const button = event.target.closest('[data-att-member]');
        if (!button) return;
        const { attMember: memberId, attStatusValue: status } = button.dataset;
        if (!state[memberId]) return;
        state[memberId].status = status;
        button.closest('.attendance-status-buttons').querySelectorAll('[data-att-member]').forEach(option => {
            const selected = option.dataset.attStatusValue === status;
            option.classList.toggle('active', selected);
            option.setAttribute('aria-pressed', String(selected));
        });
        summary();
    });
    sec.querySelector('[data-att-members]').addEventListener('input', event => {
        const input = event.target.closest('[data-att-note]');
        if (input) state[input.dataset.attNote].note = input.value;
    });
    sec.querySelectorAll('[data-att-all]').forEach(button => button.addEventListener('click', () => {
        Object.values(state).forEach(item => item.status = button.dataset.attAll);
        renderMembers();
    }));
    sec.querySelector('[data-att-save]').addEventListener('click', async () => {
        const data = fields();
        if (!data.date) return toast('Please select the attendance date.');
        const selected = filteredMembers();
        const savedRecords = selected.map(member => {
            const item = state[member.id] || { status: 'Present', note: '' };
            const existing = records.find(record => record.date === data.date
                && record.memberId === member.id && record.memberType === member.type);
            const record = {
                id: existing?.id || `ATT-${Date.now()}-${member.id}`,
                memberId: member.id,
                ...(member.type === 'Students' ? { studentId: member.id } : {}),
                memberName: member.name,
                memberType: member.type,
                date: data.date,
                academicYear: data.academicYear,
                period: data.period,
                classDepartment: member.type === 'Students' ? member.class : data.classDepartment,
                section: member.type === 'Students' ? member.section : data.section,
                subject: data.subject || 'General',
                teacher: data.teacher || 'Attendance Officer',
                status: item.status,
                remarks: item.note || '',
                createdAt: new Date().toISOString()
            };
            records = records.filter(existing => !(existing.date === record.date
                && existing.memberId === record.memberId && existing.memberType === record.memberType));
            records.unshift(record);
            return record;
        });
        render();
        try {
            const api = window.schoolPortalData;
            if (api?.getIdentity?.()) {
                if (typeof api.saveRecord !== 'function') throw new Error('Cloud attendance saving is unavailable.');
                await Promise.all(savedRecords.map(record => api.saveRecord('attendance', record.id, record)));
                void api.sync?.();
            } else {
                localStorage.setItem(key, JSON.stringify(records));
            }
            toast('Attendance saved and queued for cloud sync.');
            sec.querySelector('[data-att-editor]').classList.remove('is-open');
            editingIndex = -1;
        } catch (error) {
            console.error('Attendance was not saved to school records.', error);
            toast('Attendance could not be saved. Check your access and try again.');
        }
    });
    sec.querySelector('[data-att-search]').addEventListener('input',render);sec.querySelector('[data-att-status]').addEventListener('change',render);sec.querySelector('[data-att-print]').addEventListener('click',()=>window.print());sec.querySelector('[data-att-export]').addEventListener('click',()=>{if(!records.length)return toast('No attendance records available.');const rows=[['Member ID','Member Name','Member Type','Date','Academic Year','Period','Class / Department','Section','Subject','Officer','Status','Remarks'],...records.map(record=>[record.memberId,record.memberName,record.memberType,record.date,record.academicYear,record.period,record.classDepartment,record.section,record.subject,record.teacher,record.status,record.remarks])];const csv=rows.map(row=>row.map(value=>`"${String(value??'').replace(/"/g,'""')}"`).join(',')).join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));const link=document.createElement('a');link.href=url;link.download='school-attendance-records.csv';link.click();URL.revokeObjectURL(url);toast('Attendance exported successfully.')});
    sec.querySelector('[data-att-table]').addEventListener('click', async event => {
        const button = event.target.closest('[data-action]');
        if (!button) return;
        const index = Number(button.dataset.index);
        const record = records[index];
        if (!record) return;
        if (button.dataset.action === 'delete') {
            if (!confirm(`Delete attendance record for ${record.memberName}?`)) return;
            try {
                const api = window.schoolPortalData;
                if (api?.getIdentity?.() && api.deleteRecord) {
                    await api.deleteRecord('attendance', record.id);
                    void api.sync?.();
                } else {
                    records.splice(index, 1);
                    localStorage.setItem(key, JSON.stringify(records));
                }
                records = records.filter(item => item.id !== record.id);
                render();
                toast('Attendance record deleted.');
            } catch (error) {
                console.error('Attendance record could not be deleted from school records.', error);
                toast('Attendance record could not be deleted. Check your access and try again.');
            }
            return;
        }
        if (button.dataset.action === 'view') {
            alert(`ATTENDANCE RECORD\n\nMember: ${record.memberName}\nType: ${record.memberType}\nDate: ${formatDate(record.date)}\nClass: ${record.classDepartment}\nSection: ${record.section}\nSubject: ${record.subject}\nOfficer: ${record.teacher}\nStatus: ${record.status}\nRemarks: ${record.remarks || 'None'}`);
            return;
        }
        editingIndex = index;
        sec.querySelectorAll('[data-att-field]').forEach(field => {
            if (record[field.name] !== undefined) field.value = record[field.name];
        });
        state = {};
        const member = members.find(item => item.id === record.memberId);
        if (member) state[member.id] = { status: record.status, note: record.remarks || '' };
        open();
        renderMembers();
        sec.querySelector('[data-att-editing]').textContent = 'Editing Attendance';
    });
    reset();
    render();
    void connectRoster();
    void connectAttendanceRecords();
    return sec;
}