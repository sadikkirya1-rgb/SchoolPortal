const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function createStaffRecords(storedValues = {}) {
    const values = new Map(Object.entries(storedValues));
    const events = [];
    const localStorage = {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, String(value))
    };
    const window = { dispatchEvent: event => events.push(event) };
    const source = fs.readFileSync(path.join(__dirname, '..', 'staff-records.js'), 'utf8');
    vm.runInNewContext(source, {
        CustomEvent: class CustomEvent {
            constructor(type) { this.type = type; }
        },
        localStorage,
        window
    });
    return { staffRecords: window.schoolStaffRecords, localStorage, events };
}

test('legacy teacher and staff records migrate into the shared staff list', () => {
    const { staffRecords, localStorage } = createStaffRecords({
        school_teachers: JSON.stringify([{
            id: 'teacher-1',
            employeeNo: 'TCH-0001',
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.test',
            designation: 'Teacher',
            subject: 'Mathematics',
            subjects: ['Mathematics', 'Physics'],
            specialization: 'Algebra',
            status: 'Active'
        }]),
        school_staff_directory: JSON.stringify([{
            id: 'staff-1',
            name: 'Grace Hopper',
            email: 'grace@example.test',
            role: 'Accountant',
            status: 'Active'
        }])
    });

    const employees = staffRecords.migrateLegacy();

    assert.equal(employees.length, 2);
    assert.equal(employees[0].staffCategory, 'Teaching');
    assert.equal(employees[0].staffId, 'TCH-0001');
    assert.equal(employees[0].subject, 'Mathematics');
    assert.equal(JSON.stringify(employees[0].subjects), JSON.stringify(['Mathematics', 'Physics']));
    assert.equal(staffRecords.isTeacher(employees[0]), true);
    assert.equal(employees[1].firstName, 'Grace');
    assert.equal(employees[1].lastName, 'Hopper');
    assert.equal(employees[1].designation, 'Accountant');
    assert.equal(staffRecords.isTeacher(employees[1]), false);
    assert.equal(JSON.parse(localStorage.getItem('school_teachers'))[0].migratedToStaff, true);
    assert.equal(JSON.parse(localStorage.getItem('school_staff_directory'))[0].migratedToStaff, true);
});

test('migration merges matching employees without overwriting shared staff details', () => {
    const { staffRecords } = createStaffRecords({
        school_staff: JSON.stringify([{
            id: 'staff-1',
            staffId: 'STF-0004',
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.test',
            department: 'Academics',
            status: 'On Leave'
        }]),
        school_teachers: JSON.stringify([{
            id: 'teacher-1',
            employeeNo: 'TCH-0001',
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.test',
            designation: 'Teacher',
            subject: 'Mathematics'
        }])
    });

    const employees = staffRecords.migrateLegacy();
    const again = staffRecords.migrateLegacy();

    assert.equal(employees.length, 1);
    assert.equal(again.length, 1);
    assert.equal(again[0].staffId, 'STF-0004');
    assert.equal(again[0].status, 'On Leave');
    assert.equal(again[0].subject, 'Mathematics');
    assert.equal(staffRecords.nextStaffId(again), 'STF-0005');
});

test('migration does not merge unrelated employees with colliding legacy row IDs', () => {
    const { staffRecords } = createStaffRecords({
        school_staff: JSON.stringify([{ id: 1, firstName: 'Alex', lastName: 'One' }]),
        school_staff_directory: JSON.stringify([{ id: 1, name: 'Jordan Two' }])
    });

    const employees = staffRecords.migrateLegacy();

    assert.equal(employees.length, 2);
    assert.equal(employees[1].id, 'legacy-school_staff_directory-1');
    assert.equal(employees[1].firstName, 'Jordan');
});

test('migrated legacy copies do not restore staff after removal from the master list', () => {
    const { staffRecords } = createStaffRecords({
        school_teachers: JSON.stringify([{
            id: 'teacher-1',
            employeeNo: 'TCH-0001',
            firstName: 'Ada',
            lastName: 'Lovelace',
            designation: 'Teacher'
        }])
    });

    const employees = staffRecords.migrateLegacy();
    staffRecords.save(employees.filter(employee => employee.id !== 'teacher-1'));

    assert.equal(staffRecords.migrateLegacy().length, 0);
});
