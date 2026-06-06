# UGANDA SCHOOL ERP - PERMISSIONS MATRIX

## Role-Based Access Control (RBAC) Matrix

### Role Hierarchy
```
Super Admin (Level 10)
  └─ Director (Level 9)
      └─ Head Teacher (Level 8)
          ├─ Deputy Head (Level 7)
          ├─ Bursar (Level 6)
          ├─ HR Officer (Level 6)
          └─ Store Manager (Level 5)
                └─ Teacher (Level 4)
                └─ Librarian (Level 4)
                    └─ Parent (Level 2)
                        └─ Student (Level 1)
```

## Detailed Permissions Matrix

### DASHBOARD MODULE
| Role | View | Create | Edit | Delete | Export |
|------|------|--------|------|--------|--------|
| Super Admin | ✓ | ✓ | ✓ | ✓ | ✓ |
| Director | ✓ | ✓ | ✓ | ✓ | ✓ |
| Head Teacher | ✓ | - | - | - | ✓ |
| Deputy Head | ✓ | - | - | - | ✓ |
| Bursar | ✓ | - | - | - | ✓ |
| Teacher | ✓ | - | - | - | - |
| Librarian | ✓ | - | - | - | - |
| HR Officer | ✓ | - | - | - | - |
| Store Manager | ✓ | - | - | - | - |
| Parent | ✓ | - | - | - | - |
| Student | ✓ | - | - | - | - |

### FRONT OFFICE DEPARTMENT
| Module | Super Admin | Director | Head Teacher | Deputy Head | Teacher | Student | Parent |
|--------|-------------|----------|--------------|-------------|---------|---------|--------|
| Enquiries | RWD | RWD | RWD | RWD | - | - | - |
| Visitor Management | RWD | RWD | RWD | RWD | - | - | - |
| Visitor Logs | RWD | RWD | RWD | RWD | - | - | - |
| Call Logs | RWD | RWD | RWD | RWD | - | - | - |
| Dispatch | RWD | RWD | RWD | RWD | - | - | - |
| Announcements | RWD | RWD | RWD | RWD | RW | R | R |
| Calendar | RWD | RWD | RWD | RWD | RW | R | R |
| Events | RWD | RWD | RWD | RWD | RW | R | R |
| Documents | RWD | RWD | RWD | RWD | - | - | - |

### ADMISSIONS DEPARTMENT
| Module | Super Admin | Director | Head Teacher | Deputy Head | Admissions Officer |
|--------|-------------|----------|--------------|-------------|-------------------|
| Admissions | RWD | RWD | RWD | RWD | RWD |
| Applications | RWD | RWD | RWD | RWD | RWD |
| Interviews | RWD | RWD | RWD | RWD | RWD |
| Admission Letters | RWD | RWD | RWD | RWD | RWD |
| Waiting List | RWD | RWD | RWD | RWD | RWD |
| Student Registration | RWD | RWD | RWD | RWD | RWD |
| Student Transfers | RWD | RWD | RWD | RWD | RWD |

### ACADEMIC DEPARTMENT
| Module | Super Admin | Director | Head Teacher | Deputy Head | Teacher | Student | Parent |
|--------|-------------|----------|--------------|-------------|---------|---------|--------|
| Students | RWD | RWD | RWD | RWD | R | R | R |
| Teachers | RWD | RWD | RWD | RWD | R | - | - |
| Curriculum | RWD | RWD | RWD | RWD | R | - | - |
| Subjects | RWD | RWD | RWD | RWD | R | - | - |
| Classes | RWD | RWD | RWD | RWD | R | - | - |
| Streams | RWD | RWD | RWD | RWD | - | - | - |
| Timetables | RWD | RWD | RWD | RWD | RW | R | R |
| Lesson Plans | RWD | RWD | RWD | RWD | RW | - | - |
| Schemes of Work | RWD | RWD | RWD | RWD | RW | - | - |
| UNEB Exams | RWD | RWD | RWD | RWD | R | - | - |
| Continuous Assessment | RWD | RWD | RWD | RWD | RW | R | R |
| Report Cards | RWD | RWD | RWD | RWD | RW | R | R |
| Academic Transcripts | RWD | RWD | RWD | RWD | R | R | R |
| Library | RWD | RWD | RWD | RWD | R | RW | - |
| ID Cards | RWD | RWD | RWD | RWD | - | - | - |
| Certificates | RWD | RWD | RWD | RWD | - | - | - |

### E-LEARNING DEPARTMENT
| Module | Super Admin | Director | Head Teacher | Teacher | Student | Parent |
|--------|-------------|----------|--------------|---------|---------|--------|
| Assignments | RWD | RWD | RWD | RW | RW | R |
| Study Materials | RWD | RWD | RWD | RW | R | - |
| Online Quizzes | RWD | RWD | RWD | RW | RW | R |
| Question Bank | RWD | RWD | RWD | RW | R | - |
| Online Classes | RWD | RWD | RWD | RW | RW | R |
| Learning Analytics | RWD | RWD | RWD | R | R | - |

### OPERATIONS DEPARTMENT
| Module | Super Admin | Director | Head Teacher | Deputy Head | Store Manager |
|--------|-------------|----------|--------------|-------------|----------------|
| Attendance | RWD | RWD | RWD | RWD | - |
| Health/Infirmary | RWD | RWD | RWD | RWD | - |
| Boarding | RWD | RWD | RWD | RWD | - |
| Transport | RWD | RWD | RWD | RWD | - |
| Inventory | RWD | RWD | RWD | RWD | RW |
| Alumni | RWD | RWD | RWD | RWD | - |
| Hostels | RWD | RWD | RWD | RWD | - |
| Meals Management | RWD | RWD | RWD | RWD | - |

### STUDENT LIFE DEPARTMENT
| Module | Super Admin | Director | Head Teacher | Deputy Head | Teacher |
|--------|-------------|----------|--------------|-------------|---------|
| Discipline Cases | RWD | RWD | RWD | RWD | RW |
| Counseling | RWD | RWD | RWD | RWD | RW |
| Clubs & Societies | RWD | RWD | RWD | RWD | RW |
| Sports & Activities | RWD | RWD | RWD | RWD | RW |
| Leadership | RWD | RWD | RWD | RWD | RW |
| Student Welfare | RWD | RWD | RWD | RWD | RW |

### HUMAN RESOURCE DEPARTMENT
| Module | Super Admin | Director | HR Officer |
|--------|-------------|----------|-----------|
| Staff Directory | RWD | RWD | RW |
| Staff Attendance | RWD | RWD | RW |
| Leave Management | RWD | RWD | RW |
| Recruitment | RWD | RWD | RW |
| Performance Appraisal | RWD | RWD | RW |
| Contracts | RWD | RWD | R |
| Staff Documents | RWD | RWD | RW |

### PAYROLL DEPARTMENT
| Module | Super Admin | Director | Bursar | HR Officer |
|--------|-------------|----------|--------|-----------|
| Run Payroll | RWD | RWD | RWD | R |
| Pay Slips | RWD | RWD | RWD | R |
| Allowances | RWD | RWD | RWD | R |
| Deductions | RWD | RWD | RWD | R |
| Statutory Returns | RWD | RWD | RWD | R |
| Payroll Reports | RWD | RWD | RWD | R |
| NSSF Reports | RWD | RWD | RWD | - |
| PAYE Reports | RWD | RWD | RWD | - |

### FINANCE DEPARTMENT
| Module | Super Admin | Director | Bursar |
|--------|-------------|----------|--------|
| Fees | RWD | RWD | RWD |
| Fee Structures | RWD | RWD | RWD |
| Fee Invoices | RWD | RWD | RWD |
| Receipts | RWD | RWD | RWD |
| Expenses | RWD | RWD | RWD |
| Income | RWD | RWD | RWD |
| Cashbook | RWD | RWD | RWD |
| Bank Reconciliation | RWD | RWD | RWD |
| Budgeting | RWD | RWD | RWD |
| Financial Reports | RWD | RWD | RWD |
| Closed POs | RWD | RWD | R |

### PROCUREMENT DEPARTMENT
| Module | Super Admin | Director | Bursar | Store Manager |
|--------|-------------|----------|--------|----------------|
| Purchase Requests | RWD | RWD | RWD | RW |
| Quotations | RWD | RWD | RWD | RW |
| Purchase Comparisons | RWD | RWD | RWD | R |
| Purchase Orders | RWD | RWD | RWD | RW |
| Goods Receipt Notes | RWD | RWD | RWD | RW |
| Supplier Invoices | RWD | RWD | RWD | RW |
| Suppliers | RWD | RWD | RWD | R |
| Contracts | RWD | RWD | RWD | R |

### ASSETS & SECURITY DEPARTMENT
| Module | Super Admin | Director | Head Teacher | Deputy Head |
|--------|-------------|----------|--------------|-------------|
| Fixed Assets | RWD | RWD | RWD | R |
| Asset Register | RWD | RWD | RWD | R |
| Maintenance | RWD | RWD | RWD | RW |
| Visitor Logs | RWD | RWD | RWD | RW |
| Gate Passes | RWD | RWD | RWD | RW |
| Incident Reports | RWD | RWD | RWD | RW |
| Security Reports | RWD | RWD | RWD | RW |

### COMMUNICATION DEPARTMENT
| Module | Super Admin | Director | Head Teacher | Deputy Head | Teacher |
|--------|-------------|----------|--------------|-------------|---------|
| Parents | RWD | RWD | RWD | RWD | RW |
| SMS Alerts | RWD | RWD | RWD | RWD | RW |
| Email Alerts | RWD | RWD | RWD | RWD | RW |
| Notice Board | RWD | RWD | RWD | RWD | RW |
| Circulars | RWD | RWD | RWD | RWD | RW |
| Bulk Messaging | RWD | RWD | RWD | RWD | - |

### GOVERNMENT & COMPLIANCE
| Module | Super Admin | Director | Head Teacher |
|--------|-------------|----------|--------------|
| EMIS Reports | RWD | RWD | RWD |
| UNEB Candidates | RWD | RWD | RWD |
| Inspection Reports | RWD | RWD | RWD |
| Ministry Reports | RWD | RWD | RWD |
| School Statistics | RWD | RWD | RWD |

### SYSTEM ADMINISTRATION
| Module | Super Admin |
|--------|-------------|
| Users | RWD |
| Roles & Permissions | RWD |
| Audit Logs | RWD |
| Backups | RWD |
| System Settings | RWD |
| School Branding | RWD |

## Permission Legend
- **R** = Read (View Only)
- **W** = Write (Create, Edit)
- **D** = Delete
- **RW** = Read + Write
- **RWD** = Read + Write + Delete
- **-** = No Access

## Data Visibility Rules

### By Role:

#### Students
- Can view: Their own profile, classes, subjects, timetables, assignments, report cards, grades, attendance, announcements
- Cannot view: Other students' data, staff data, financial data

#### Parents
- Can view: Their child's profile, classes, subjects, timetables, report cards, attendance, announcements, fees
- Cannot view: Other students' data, staff data, full financial records

#### Teachers
- Can view: Their classes, students in their classes, subjects, timetables, attendance, lesson materials
- Can edit: Attendance, grades, assessments, lesson plans
- Cannot view: Financial data, HR data, other teachers' grades

#### Librarian
- Can view: All library books, student borrowing history, acquisition records
- Cannot view: Financial details beyond library budget

#### Store Manager
- Can view: Inventory, suppliers, purchase orders, received goods
- Cannot view: Financial details, employee data

#### HR Officer
- Can view: Staff directory, leave records, contracts, recruitment
- Cannot view: Payroll details, financial records (except their own)

#### Bursar/Finance Officer
- Can view: All financial records, fees, expenses, income, payroll reports
- Cannot view: Sensitive personal staff data (except salary-related)

#### Head Teacher
- Can view: All academic data, staff directory, financial summaries
- Can approve: Leave requests, disciplinary cases, procurement requests

#### Director
- Can view: All system data except Super Admin configurations
- Can approve: Budget, major purchases, staff recruitment

#### Super Admin
- Can view and modify: All system data and configurations

## Audit Trail Requirements

All write operations (Create, Update, Delete) must be logged with:
- User ID
- Timestamp
- Module/Feature
- Action (Create/Update/Delete)
- Old Value (for updates)
- New Value
- IP Address
- Browser/Device Info

## API Endpoint Protection

All API endpoints must validate:
1. User authentication token
2. User role/permission
3. Data ownership (for personal/departmental data)
4. Rate limiting (prevent abuse)

Example:
```javascript
// API Authorization Middleware
const checkPermission = (requiredPermission, requiredRole) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const userLevel = roleHierarchy[userRole].level;
    
    if (userLevel < requiredRole.level) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    if (!hasPermission(userRole, requiredPermission)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
  };
};
```

## Password Policy & Security

- Minimum 12 characters
- Must contain: uppercase, lowercase, number, special character
- Change every 90 days
- Cannot reuse last 5 passwords
- Account lockout after 5 failed attempts (30 minutes)
- Two-factor authentication for Super Admin and Director roles

## Session Management

- Session timeout: 30 minutes of inactivity
- Multiple concurrent sessions: Maximum 2 per user
- Force logout from other sessions: Option available
- Remember device: 30 days for trusted devices

## Change Log Compliance

Track changes to sensitive modules:
- Financial transactions
- Student records
- Staff data
- System configuration

All changes must include:
- Who made the change
- When the change was made
- What was changed
- Why (if applicable)
- Approval status
