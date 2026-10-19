function createFeesModule(){
    const sec=document.createElement('section');
    sec.className='module fees-module hidden';
    sec.id='feesModule';
    sec.innerHTML=`<div class="fees-header"><div class="fees-title"><div class="fees-icon"><i class="fas fa-money-check-dollar"></i></div><div><h2>Fees</h2><p>Finance Department · Manage student fees and collections</p></div></div><div class="fees-actions"><button class="fee-btn fee-btn-light" type="button" data-fee-export><i class="fas fa-download"></i> Export CSV</button><button class="fee-btn fee-btn-primary" type="button" data-fee-new><i class="fas fa-plus"></i> Add Fee</button></div></div><div class="fees-stats"><div class="fees-stat"><div class="fees-stat-icon"><i class="fas fa-wallet"></i></div><span>Total Fees</span><strong data-fee-stat="total">AED 0.00</strong><small>Total billed fees</small></div><div class="fees-stat"><div class="fees-stat-icon"><i class="fas fa-check"></i></div><span>Collected</span><strong data-fee-stat="collected">AED 0.00</strong><small>Fees received</small></div><div class="fees-stat"><div class="fees-stat-icon"><i class="fas fa-hourglass-half"></i></div><span>Pending</span><strong data-fee-stat="pending">AED 0.00</strong><small>Outstanding balance</small></div><div class="fees-stat"><div class="fees-stat-icon"><i class="fas fa-triangle-exclamation"></i></div><span>Overdue</span><strong data-fee-stat="overdue">AED 0.00</strong><small>Past due balances</small></div></div><div class="fees-card"><div class="fees-toolbar"><div><h3>Student Fee Records</h3><p>Track billed amounts, payments and outstanding balances</p></div><div class="fees-filters"><label><i class="fas fa-search"></i><input data-fee-search type="search" placeholder="Search student or fee..."></label><select data-fee-class><option value="">All Classes</option><option>Grade 1</option><option>Grade 2</option><option>Grade 3</option><option>Grade 4</option><option>Grade 5</option><option>Grade 6</option></select><select data-fee-status-filter><option value="">All Status</option><option>Paid</option><option>Partial</option><option>Pending</option><option>Overdue</option></select></div></div><div class="fees-table-wrap"><table class="fees-table"><thead><tr><th>Student</th><th>Class</th><th>Fee Type</th><th>Academic Year</th><th>Total Fee</th><th>Paid</th><th>Balance</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead><tbody data-fee-table></tbody></table><div class="fees-empty" data-fee-empty><i class="fas fa-money-check-dollar"></i><strong>No fee records found</strong><span>Try changing your filters or add a new fee record.</span></div></div></div><div class="fee-overlay" data-fee-form-overlay><div class="fee-modal"><div class="fee-modal-header"><div><h3 data-fee-form-title>Add Fee Record</h3><p>Enter student fee information</p></div><button class="fee-close" type="button" data-fee-close-form aria-label="Close form">&times;</button></div><div class="fee-modal-body"><form class="fee-form" data-fee-form><input type="hidden" name="id"><div class="fee-form-grid"><div class="fee-form-group"><label>Student Name *</label><input name="studentName" required placeholder="Enter student name"></div><div class="fee-form-group"><label>Student ID *</label><input name="studentId" required placeholder="e.g. STU-1001"></div><div class="fee-form-group"><label>Class *</label><select name="studentClass" required><option value="">Select class</option><option>Grade 1</option><option>Grade 2</option><option>Grade 3</option><option>Grade 4</option><option>Grade 5</option><option>Grade 6</option></select></div><div class="fee-form-group"><label>Fee Type *</label><select name="feeType" required><option value="">Select fee type</option><option>Tuition Fee</option><option>Registration Fee</option><option>Transport Fee</option><option>Examination Fee</option><option>Books & Uniform</option><option>Activity Fee</option><option>Other Fee</option></select></div><div class="fee-form-group"><label>Academic Year *</label><select name="academicYear" required><option value="">Select academic year</option><option>2026-2027</option><option>2025-2026</option><option>2024-2025</option></select></div><div class="fee-form-group"><label>Due Date *</label><input name="dueDate" type="date" required></div><div class="fee-form-group"><label>Total Fee (AED) *</label><input name="totalFee" type="number" min="0" step="0.01" value="0" required></div><div class="fee-form-group"><label>Amount Paid (AED)</label><input name="amountPaid" type="number" min="0" step="0.01" value="0"></div><div class="fee-form-group"><label>Balance (AED)</label><input name="balance" type="number" value="0" readonly></div><div class="fee-form-group"><label>Payment Date</label><input name="paymentDate" type="date"></div><div class="fee-form-group"><label>Payment Method</label><select name="paymentMethod"><option value="">Select payment method</option><option>Cash</option><option>Bank Transfer</option><option>Card</option><option>Cheque</option><option>Online Payment</option></select></div><div class="fee-form-group"><label>Status</label><select name="status"><option>Pending</option><option>Partial</option><option>Paid</option><option>Overdue</option></select></div><div class="fee-form-group full"><label>Notes</label><textarea name="notes" placeholder="Additional payment or fee notes..."></textarea></div></div><div class="fee-form-actions"><button class="fee-btn fee-btn-light" type="button" data-fee-cancel>Cancel</button><button class="fee-btn fee-btn-primary" type="submit"><i class="fas fa-save"></i> Save Fee</button></div></form></div></div></div><div class="fee-overlay" data-fee-preview-overlay><div class="fee-modal fee-preview-modal"><div class="fee-modal-header"><div><h3>Fee Receipt Preview</h3><p>Review the fee receipt before printing</p></div><button class="fee-close" type="button" data-fee-close-preview aria-label="Close preview">&times;</button></div><div class="fee-modal-body"><div data-fee-preview-content></div><div class="fee-preview-actions"><button class="fee-btn fee-btn-light" type="button" data-fee-close-preview>Close</button><button class="fee-btn fee-btn-primary" type="button" data-fee-print><i class="fas fa-print"></i> Print Receipt</button></div></div></div></div><div class="fee-toast" data-fee-toast></div>`;
    const feeTableHeader=sec.querySelector('.fees-table thead tr');
    const feeStudentIdHeader=document.createElement('th');
    feeStudentIdHeader.textContent='Student ID';
    feeTableHeader.insertBefore(feeStudentIdHeader,feeTableHeader.children[1]);
    const feeSyncStatus=sec.querySelector('.fees-toolbar p');
    feeSyncStatus.dataset.feeSyncStatus='';
    feeSyncStatus.setAttribute('role','status');
    feeSyncStatus.setAttribute('aria-live','polite');
    const feeActionStyles=document.createElement('style');
    feeActionStyles.textContent='.fees-module .fees-table th:last-child,.fees-module .fees-table td:last-child{position:sticky;right:0;background:#fff;z-index:1}.fees-module .fees-table th:last-child{background:#f8fafc;z-index:2}.fees-module .fee-row-actions{gap:6px}.fees-module .fee-icon-btn{width:auto;min-width:62px;height:34px;padding:0 8px;display:inline-flex;align-items:center;justify-content:center;gap:5px;color:#3730a3;background:#eef2ff;border-color:#c7d2fe;font-size:11px;font-weight:650}.fees-module .fee-icon-btn.delete{color:#b91c1c;background:#fef2f2;border-color:#fecaca}.fees-module .fee-icon-btn span{display:inline}';
    sec.appendChild(feeActionStyles);
    const studentIdField=sec.querySelector('[name="studentId"]');
    const studentSelect=document.createElement('select');
    studentSelect.name='studentId';
    studentSelect.required=true;
    studentSelect.setAttribute('aria-label','Student ID');
    studentSelect.innerHTML='<option value="">Loading students...</option>';
    studentIdField.replaceWith(studentSelect);
    const studentIdGroup=studentSelect.closest('.fee-form-group');
    studentIdGroup.parentElement.insertBefore(studentIdGroup,studentIdGroup.parentElement.firstElementChild);
    const studentAdmissionNoField=document.createElement('input');
    studentAdmissionNoField.type='hidden';
    studentAdmissionNoField.name='studentAdmissionNo';
    sec.querySelector('[data-fee-form]').appendChild(studentAdmissionNoField);
    const studentStatus=document.createElement('small');
    studentStatus.dataset.feeStudentStatus='';
    studentStatus.setAttribute('role','status');
    studentStatus.setAttribute('aria-live','polite');
    studentSelect.parentElement.appendChild(studentStatus);
    const studentNameField=sec.querySelector('[name="studentName"]');
    studentNameField.readOnly=true;
    studentNameField.placeholder='Select a student to fill this field';
    const studentClassField=sec.querySelector('[name="studentClass"]');
    const studentClassInput=document.createElement('input');
    studentClassInput.name='studentClass';
    studentClassInput.required=true;
    studentClassInput.readOnly=true;
    studentClassInput.placeholder='Select a student to fill this field';
    studentClassField.replaceWith(studentClassInput);
    let fees=[];let selectedId=null;
    const q=selector=>sec.querySelector(selector),num=value=>Number.parseFloat(value)||0,money=value=>`AED ${num(value).toLocaleString('en-AE',{minimumFractionDigits:2,maximumFractionDigits:2})}`,esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char])),date=value=>{if(!value)return '—';const parsed=new Date(`${value}T00:00:00`);return Number.isNaN(parsed.getTime())?value:parsed.toLocaleDateString('en-US',{day:'2-digit',month:'short',year:'numeric'})},initials=value=>String(value).split(' ').filter(Boolean).slice(0,2).map(part=>part[0].toUpperCase()).join(''),statusClass=status=>status==='Paid'?'fee-paid':status==='Partial'?'fee-partial':status==='Overdue'?'fee-overdue':'fee-pending';
    const updateStats=()=>{const total=fees.reduce((sum,item)=>sum+num(item.totalFee),0),collected=fees.reduce((sum,item)=>sum+num(item.amountPaid),0),pending=fees.reduce((sum,item)=>sum+num(item.balance),0),overdue=fees.filter(item=>item.status==='Overdue').reduce((sum,item)=>sum+num(item.balance),0);[['total',total],['collected',collected],['pending',pending],['overdue',overdue]].forEach(([name,value])=>q(`[data-fee-stat="${name}"]`).textContent=money(value))};
    const render=()=>{
        const query=q('[data-fee-search]').value.toLowerCase();
        const studentClass=q('[data-fee-class]').value;
        const status=q('[data-fee-status-filter]').value;
        const found=fees.filter(item=>[item.studentName,item.studentAdmissionNo,item.studentId,item.feeType,item.receiptNo].join(' ').toLowerCase().includes(query)&&(!studentClass||item.studentClass===studentClass)&&(!status||item.status===status));
        q('[data-fee-table]').innerHTML=found.map(item=>`<tr><td><div class="fee-student"><div class="fee-avatar">${initials(item.studentName)}</div><div><strong>${esc(item.studentName)}</strong></div></div></td><td>${esc(item.studentAdmissionNo||item.studentId)}</td><td>${esc(item.studentClass)}</td><td>${esc(item.feeType)}</td><td>${esc(item.academicYear)}</td><td><strong>${money(item.totalFee)}</strong></td><td><strong style="color:#047857">${money(item.amountPaid)}</strong></td><td><strong style="color:${item.balance>0?'#b45309':'#047857'}">${money(item.balance)}</strong></td><td>${date(item.dueDate)}</td><td><span class="fee-badge ${statusClass(item.status)}">${esc(item.status)}</span></td><td><div class="fee-row-actions"><button class="fee-icon-btn" type="button" aria-label="Preview receipt" title="Preview receipt" data-fee-action="preview" data-id="${esc(item.id)}"><i class="fas fa-eye" aria-hidden="true"></i><span>View</span></button><button class="fee-icon-btn" type="button" aria-label="Edit fee" title="Edit fee" data-fee-action="edit" data-id="${esc(item.id)}"><i class="fas fa-pen" aria-hidden="true"></i><span>Edit</span></button><button class="fee-icon-btn delete" type="button" aria-label="Delete fee" title="Delete fee" data-fee-action="delete" data-id="${esc(item.id)}"><i class="fas fa-trash" aria-hidden="true"></i><span>Delete</span></button></div></td></tr>`).join('');
        q('[data-fee-empty]').style.display=found.length?'none':'block';
        updateStats();
    };
    const form=q('[data-fee-form]'),formOverlay=q('[data-fee-form-overlay]'),previewOverlay=q('[data-fee-preview-overlay]');
    const feeSummaryLayout=document.createElement('div');
    feeSummaryLayout.className='fee-live-layout';
    const feeSummary=document.createElement('aside');
    feeSummary.className='fee-live-summary';
    feeSummary.innerHTML='<h4>Fee Summary</h4><p>Review the student, amounts, and payment status.</p><div data-fee-live-fields></div>';
    const feeFormGrid=form.querySelector('.fee-form-grid');
    feeSummaryLayout.append(feeFormGrid,feeSummary);
    form.insertBefore(feeSummaryLayout,form.querySelector('.fee-form-actions'));
    const updateFeeSummary=()=>{
        const target=feeSummary.querySelector('[data-fee-live-fields]');
        target.replaceChildren(...Array.from(form.querySelectorAll('input[name],select[name],textarea[name]')).filter(field=>field.type!=='hidden').map(field=>{
            const row=document.createElement('div');
            const label=document.createElement('span');
            const value=document.createElement('strong');
            row.className='fee-summary-row';
            label.textContent=field.closest('.fee-form-group')?.querySelector('label')?.textContent.trim()||field.name;
            value.textContent=['totalFee','amountPaid','balance'].includes(field.name)?money(field.value):field.value||'-';
            row.append(label,value);
            return row;
        }));
    };
    let studentRecords=[];
    const studentDisplayId=student=>String(student.admissionNo||student.admissionNumber||student.studentCode||student.studentId||student.id||'').trim();
    const studentRecordId=student=>String(student.id||studentDisplayId(student)).trim();
    const studentName=student=>String(student.fullName||student.name||student.studentName||[student.firstName,student.middleName,student.lastName].filter(Boolean).join(' ')||'').trim();
    const studentForId=value=>studentRecords.find(student=>studentRecordId(student)===String(value)||studentDisplayId(student)===String(value));
    const refreshStudentOptions=()=>{
        const selected=studentSelect.value;
        studentSelect.replaceChildren(new Option('Select student ID',''));
        studentRecords
            .filter(student=>studentRecordId(student))
            .sort((left,right)=>studentName(left).localeCompare(studentName(right)))
            .forEach(student=>{
                const option=new Option(`${studentDisplayId(student)} — ${studentName(student)||'Student'}`,studentRecordId(student));
                studentSelect.appendChild(option);
            });
        if(selected&&!Array.from(studentSelect.options).some(option=>option.value===selected)){
            const student=studentForId(selected);
            const option=new Option(`${student?studentDisplayId(student):selected} — ${student?studentName(student):form.elements.studentName.value||'Student record unavailable'}`,selected);
            studentSelect.appendChild(option);
        }
        studentSelect.value=selected;
        studentSelect.disabled=!studentRecords.length&&!selected;
    };
    const api=window.schoolPortalData;
    if(api?.subscribe){
        (async()=>{
            await api.subscribe('students',records=>{
                studentRecords=records.filter(student=>student.deleted!==true);
                refreshStudentOptions();
                studentStatus.textContent=studentRecords.length
                    ?'Choose a student to fill in their name and class.'
                    :'No student records are available for this school.';
            });
        })().catch(error=>{
            console.error('Unable to load student records for fee entry.',error);
            studentStatus.textContent='Unable to load student records. Check access and connectivity, then retry.';
        });
    }else{
        studentStatus.textContent='Student records are unavailable. Reload the app and try again.';
    }
    if(api?.subscribe){
        (async()=>{
            await api.subscribe('fees',records=>{
                fees=records.filter(record=>record.deleted!==true);
                render();
                feeSyncStatus.textContent=fees.length
                    ?`${fees.length} fee record${fees.length===1?'':'s'} synced from the school cloud.`
                    :'No fee records found in the school cloud.';
            });
        })().catch(error=>{
            console.error('Unable to load school fee records.',error);
            feeSyncStatus.textContent='Unable to load fee records from the school cloud. Check your access and connection.';
        });
    }else{
        feeSyncStatus.textContent='Cloud fee records are unavailable. Reload the app and try again.';
    }
    const onStudentSyncError=event=>{
        if(event.detail?.collection!=='students')return;
        studentStatus.textContent='Unable to load student records. Check access and connectivity, then retry.';
    };
    const onFeeSyncError=event=>{
        if(event.detail?.collection!=='fees')return;
        console.error('Unable to synchronize school fee records.',event.detail.error);
        feeSyncStatus.textContent='Unable to load fee records from the school cloud. Check your access and connection.';
    };
    window.addEventListener('school-portal-sync-error',onStudentSyncError);
    window.addEventListener('school-portal-sync-error',onFeeSyncError);
    studentSelect.addEventListener('change',()=>{
        const student=studentForId(studentSelect.value);
        if(!student)return;
        form.elements.studentName.value=studentName(student);
        studentAdmissionNoField.value=studentDisplayId(student);
        form.elements.studentClass.value=String(student.className||student.class||student.grade||student.gradeName||'').trim();
        const academicYear=String(student.academicYear||'').trim();
        const yearField=form.elements.academicYear;
        if(academicYear&&!Array.from(yearField.options).some(option=>option.value===academicYear)){
            yearField.add(new Option(academicYear,academicYear));
        }
        yearField.value=academicYear;
        setStatus();
    });
    const setStatus=()=>{const total=num(form.elements.totalFee.value),paid=Math.min(total,num(form.elements.amountPaid.value)),balance=Math.max(0,total-paid);form.elements.balance.value=balance;form.elements.status.value=paid>=total&&total>0?'Paid':paid>0?'Partial':form.elements.dueDate.value&&new Date(`${form.elements.dueDate.value}T00:00:00`)<new Date()?'Overdue':'Pending';updateFeeSummary()};
    const reset=()=>{form.reset();refreshStudentOptions();form.elements.id.value='';form.elements.totalFee.value=0;form.elements.amountPaid.value=0;form.elements.balance.value=0;form.elements.dueDate.value=new Date().toISOString().slice(0,10);q('[data-fee-form-title]').textContent='Add Fee Record';setStatus()};
    const openForm=item=>{if(!item)reset();else{refreshStudentOptions();Object.keys(item).forEach(name=>{if(form.elements[name])form.elements[name].value=item[name]});const savedStudentId=String(item.studentId||'');if(savedStudentId&&!Array.from(studentSelect.options).some(option=>option.value===savedStudentId)){const student=studentForId(savedStudentId);studentSelect.add(new Option(`${student?studentDisplayId(student):savedStudentId} — ${student?studentName(student):item.studentName||'Student record unavailable'}`,savedStudentId))}studentSelect.value=savedStudentId;studentSelect.disabled=!studentRecords.length&&!savedStudentId;q('[data-fee-form-title]').textContent='Edit Fee Record';setStatus()}formOverlay.classList.add('is-open');studentSelect.focus()};
    const receipt=item=>`<article class="fee-document fee-document-receipt"><header class="fee-document-header"><div class="fee-document-brand"><span class="fee-document-brand-mark"><i class="fas fa-graduation-cap" aria-hidden="true"></i></span><div><strong>${esc(item.schoolName||'School')}</strong><span>Finance Department · Student Accounts</span></div></div><div class="fee-document-title"><span>Official payment record</span><h2>Fee Payment Receipt</h2><p>Receipt No. <strong>${esc(item.receiptNo||'—')}</strong></p></div></header><section class="fee-document-section"><h3>Student information</h3><dl class="fee-document-grid">${[['Student name',item.studentName],['Student ID',item.studentAdmissionNo||item.studentId],['Class',item.studentClass],['Academic year',item.academicYear]].map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value||'—')}</dd></div>`).join('')}</dl></section><section class="fee-document-section"><h3>Fee details</h3><table class="fee-document-table"><thead><tr><th>Description</th><th>Due date</th><th>Amount billed</th></tr></thead><tbody><tr><td>${esc(item.feeType||'Fee')}</td><td>${date(item.dueDate)}</td><td>${money(item.totalFee)}</td></tr></tbody></table><div class="fee-document-totals"><div><span>Amount paid</span><strong>${money(item.amountPaid)}</strong></div><div><span>Outstanding balance</span><strong>${money(item.balance)}</strong></div></div></section><section class="fee-document-section"><h3>Payment information</h3><dl class="fee-document-grid">${[['Payment date',item.paymentDate?date(item.paymentDate):'—'],['Payment method',item.paymentMethod||'—'],['Payment status',item.status||'Pending']].map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></section>${item.notes?`<section class="fee-document-section"><h3>Notes</h3><p class="fee-document-notes">${esc(item.notes)}</p></section>`:''}<footer class="fee-document-footer"><span>This receipt was generated from the school fee record.</span><div><span>Accounts officer</span><span>Authorized signature</span></div></footer></article>`;
    const openPreview=item=>{selectedId=item.id;q('[data-fee-preview-content]').innerHTML=receipt(item);previewOverlay.classList.add('is-open')};
    const closeOverlays=()=>{formOverlay.classList.remove('is-open');previewOverlay.classList.remove('is-open')};
    const toast=message=>{const target=q('[data-fee-toast]');target.textContent=message;target.classList.add('show');clearTimeout(sec.feeToast);sec.feeToast=setTimeout(()=>target.classList.remove('show'),2600)};
    form.addEventListener('submit',event=>{if(studentSelect.value)return;event.preventDefault();event.stopImmediatePropagation();toast('Select a student before saving the fee record.')});
    form.addEventListener('input',setStatus);
    form.addEventListener('change',setStatus);
    form.addEventListener('submit',async event=>{
        event.preventDefault();
        if(!api?.saveRecord){
            toast('Fee records cannot be saved because cloud access is unavailable.');
            return;
        }
        setStatus();
        const data=Object.fromEntries(new FormData(form).entries());
        const recordId=data.id?String(data.id):`FEE-${crypto.randomUUID()}`;
        const existing=fees.find(item=>String(item.id)===recordId);
        data.id=recordId;
        data.receiptNo=existing?.receiptNo||`FEE-${new Date().getFullYear()}-${String(fees.length+1).padStart(3,'0')}`;
        data.totalFee=num(data.totalFee);
        data.amountPaid=Math.min(data.totalFee,num(data.amountPaid));
        data.balance=Math.max(0,data.totalFee-data.amountPaid);
        data.status=data.amountPaid>=data.totalFee&&data.totalFee>0?'Paid':data.amountPaid>0?'Partial':data.dueDate&&new Date(`${data.dueDate}T00:00:00`)<new Date()?'Overdue':'Pending';
        const submitButton=form.querySelector('[type="submit"]');
        submitButton.disabled=true;
        try{
            await api.saveRecord('fees',recordId,data);
            const index=fees.findIndex(item=>String(item.id)===recordId);
            if(index===-1)fees.unshift(data);else fees[index]=data;
            render();
            formOverlay.classList.remove('is-open');
            toast(index===-1?'Fee record added successfully.':'Fee record updated successfully.');
        }catch(error){
            console.error('Unable to save the fee record to the school cloud.',error);
            toast('Unable to save the fee record. Check your access and connection, then try again.');
        }finally{
            submitButton.disabled=false;
        }
    });
    q('[data-fee-new]').onclick=()=>openForm();
    q('[data-fee-cancel]').onclick=()=>formOverlay.classList.remove('is-open');
    sec.querySelectorAll('[data-fee-close-form]').forEach(button=>button.onclick=()=>formOverlay.classList.remove('is-open'));
    sec.querySelectorAll('[data-fee-close-preview]').forEach(button=>button.onclick=()=>previewOverlay.classList.remove('is-open'));
    [formOverlay,previewOverlay].forEach(overlay=>overlay.onclick=event=>{if(event.target===overlay)overlay.classList.remove('is-open')});
    q('[data-fee-search]').oninput=render;
    q('[data-fee-class]').onchange=render;
    q('[data-fee-status-filter]').onchange=render;
    q('[data-fee-table]').onclick=async event=>{
        const button=event.target.closest('[data-fee-action]');
        if(!button)return;
        const item=fees.find(record=>String(record.id)===button.dataset.id);
        if(!item)return;
        if(button.dataset.feeAction==='preview')openPreview(item);
        if(button.dataset.feeAction==='edit')openForm(item);
        if(button.dataset.feeAction==='delete'&&confirm(`Delete fee record for ${item.studentName}?`)){
            if(!api?.deleteRecord){
                toast('Fee records cannot be deleted because cloud access is unavailable.');
                return;
            }
            button.disabled=true;
            try{
                await api.deleteRecord('fees',String(item.id));
                fees=fees.filter(record=>String(record.id)!==String(item.id));
                render();
                toast('Fee record deleted successfully.');
            }catch(error){
                console.error('Unable to delete the fee record from the school cloud.',error);
                toast('Unable to delete the fee record. Check your access and connection, then try again.');
            }finally{
                button.disabled=false;
            }
        }
    };
    q('[data-fee-export]').onclick=()=>{if(!fees.length)return toast('No fee records available for export.');const fields=['receiptNo','studentName','studentId','studentClass','feeType','academicYear','totalFee','amountPaid','balance','dueDate','paymentDate','paymentMethod','status','notes'];const rows=[['Receipt Number','Student Name','Student ID','Class','Fee Type','Academic Year','Total Fee','Amount Paid','Balance','Due Date','Payment Date','Payment Method','Status','Notes'],...fees.map(item=>fields.map(field=>item[field]))];const csv=rows.map(row=>row.map(value=>`"${String(value??'').replace(/"/g,'""')}"`).join(',')).join('\n');const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));link.download='school-fee-records.csv';link.click();URL.revokeObjectURL(link.href);toast('Fee records exported successfully.')};
    q('[data-fee-print]').onclick=()=>{
        const item=fees.find(record=>String(record.id)===String(selectedId));
        if(!item)return;
        let area=document.getElementById('feePrintArea');
        if(!area){
            area=document.createElement('div');
            area.id='feePrintArea';
            document.body.appendChild(area);
        }
        area.innerHTML=receipt(item);
        const clearPrintMode=()=>document.body.classList.remove('fee-receipt-printing');
        document.body.classList.add('fee-receipt-printing');
        window.addEventListener('afterprint',clearPrintMode,{once:true});
        window.print();
        window.setTimeout(clearPrintMode,1500);
    };
    document.addEventListener('keydown',event=>{if(event.key==='Escape')closeOverlays()});render();return sec;
}
