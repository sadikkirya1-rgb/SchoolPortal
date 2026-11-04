(() => {
    const masterKey = 'school_staff';
    const legacySources = [
        { key: 'school_teachers', category: 'Teaching' },
        { key: 'school_staff_directory', category: '' }
    ];
    const teacherFields = ['subject', 'specialization', 'experience', 'academicYear'];
    const readKey = key => {
        try {
            const records = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(records)
                ? records.filter(record => record && typeof record === 'object' && !Array.isArray(record))
                : [];
        } catch (error) {
            console.warn(`Unable to read employee records from ${key}.`, error);
            return [];
        }
    };
    const isTeacher = record => {
        const category = String(record.staffCategory || '').trim().toLowerCase();
        if (category) return ['teaching', 'teacher', 'teaching staff'].includes(category);
        return /teacher|principal|head of department/i.test(String(record.designation || record.role || ''))
            || Boolean(record.subject);
    };
    const nextStaffId = records => {
        const highestNumber = records.reduce((highest, record) => {
            const ids = [record.staffId, record.employeeNo].map(value => /^STF-(\d+)$/i.exec(value || ''));
            return ids.reduce((current, match) => match ? Math.max(current, Number(match[1])) : current, highest);
        }, 0);
        const usedIds = new Set(records.flatMap(record => [record.staffId, record.employeeNo])
            .filter(Boolean).map(value => String(value).toUpperCase()));
        let number = highestNumber + 1;
        let staffId = `STF-${String(number).padStart(4, '0')}`;
        while (usedIds.has(staffId)) {
            number += 1;
            staffId = `STF-${String(number).padStart(4, '0')}`;
        }
        return staffId;
    };
    const identityValues = record => [
        record.staffId, record.employeeNo, record.employeeId,
        record.email && String(record.email).trim().toLowerCase()
    ].filter(value => value !== undefined && value !== null && String(value).trim())
        .map(value => String(value).trim().toLowerCase());
    const findMatch = (records, candidate) => {
        const candidateValues = new Set(identityValues(candidate));
        if (!candidateValues.size) return -1;
        return records.findIndex(record => identityValues(record).some(value => candidateValues.has(value)));
    };
    const dispatchUpdate = () => {
        if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
            window.dispatchEvent(new CustomEvent('school-portal-staff-records-updated'));
        }
    };
    const save = records => {
        localStorage.setItem(masterKey, JSON.stringify(records));
        dispatchUpdate();
        return records;
    };
    const migrateLegacy = () => {
        const employees = readKey(masterKey);
        const migratedSources = [];
        let masterChanged = false;

        legacySources.forEach(({ key, category }) => {
            const sourceRecords = readKey(key);
            let sourceChanged = false;
            const updatedSource = sourceRecords.map((source, index) => {
                if (source.migratedToStaff || source.deleted === true) return source;
                const fullName = String(source.fullName || source.name || source.staffName || '').trim();
                const [derivedFirstName, ...derivedLastName] = fullName.split(/\s+/).filter(Boolean);
                let employee = {
                    ...source,
                    id: source.id || source.employeeNo || source.staffId || `legacy-${key}-${index}`,
                    firstName: source.firstName || derivedFirstName || '',
                    lastName: source.lastName || derivedLastName.join(' '),
                    staffId: source.staffId || source.employeeNo || source.employeeId || '',
                    employeeNo: source.employeeNo || source.staffId || source.employeeId || '',
                    designation: source.designation || source.role || '',
                    department: source.department || source.departmentName || '',
                    staffCategory: category || (isTeacher(source) ? 'Teaching' : 'Non-Teaching')
                };
                const matchIndex = findMatch(employees, employee);
                if (matchIndex === -1) {
                    if (employees.some(existing => String(existing.id) === String(employee.id))) {
                        employee = { ...employee, id: `legacy-${key}-${employee.id}` };
                    }
                    employees.push(employee);
                    masterChanged = true;
                } else {
                    const existing = employees[matchIndex];
                    const merged = { ...employee, ...existing };
                    if (isTeacher(employee)) {
                        teacherFields.forEach(field => {
                            if (!merged[field] && employee[field]) merged[field] = employee[field];
                        });
                        if (!merged.staffCategory) merged.staffCategory = 'Teaching';
                    }
                    if (JSON.stringify(merged) !== JSON.stringify(existing)) {
                        employees[matchIndex] = merged;
                        masterChanged = true;
                    }
                }
                sourceChanged = true;
                return { ...source, migratedToStaff: true };
            });
            if (sourceChanged) migratedSources.push([key, updatedSource]);
        });

        if (masterChanged) save(employees);
        migratedSources.forEach(([key, records]) => {
            localStorage.setItem(key, JSON.stringify(records));
        });
        return employees;
    };

    window.schoolStaffRecords = {
        read: () => readKey(masterKey),
        save,
        migrateLegacy,
        isTeacher,
        nextStaffId
    };
})();
