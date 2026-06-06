# UGANDA SCHOOL ERP - DATABASE SCHEMA

## Core Tables Structure

### 1. USERS TABLE
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone_number VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  department VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  failed_login_attempts INT DEFAULT 0,
  account_locked_until TIMESTAMP NULL,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (role) REFERENCES roles(id),
  INDEX idx_school_id (school_id),
  INDEX idx_user_id (user_id),
  INDEX idx_role (role)
);
```

### 2. SCHOOLS TABLE
```sql
CREATE TABLE schools (
  id VARCHAR(50) PRIMARY KEY,
  school_name VARCHAR(255) NOT NULL,
  school_type ENUM('primary', 'secondary', 'vocational', 'international') DEFAULT 'secondary',
  registration_number VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(255),
  physical_address TEXT,
  postal_address TEXT,
  logo_url TEXT,
  principal_name VARCHAR(100),
  founded_year INT,
  total_students INT,
  total_staff INT,
  currency VARCHAR(10) DEFAULT 'UGX',
  country VARCHAR(100) DEFAULT 'Uganda',
  is_active BOOLEAN DEFAULT TRUE,
  subscription_tier ENUM('basic', 'professional', 'enterprise') DEFAULT 'professional',
  subscription_expires_at DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_registration (registration_number),
  INDEX idx_active (is_active)
);
```

### 3. ROLES TABLE
```sql
CREATE TABLE roles (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  level INT NOT NULL,
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_level (level)
);
```

### 4. PERMISSIONS TABLE
```sql
CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id VARCHAR(50) NOT NULL,
  module_id VARCHAR(100) NOT NULL,
  can_view BOOLEAN DEFAULT FALSE,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  UNIQUE KEY unique_role_module (role_id, module_id),
  INDEX idx_role (role_id)
);
```

### 5. STUDENTS TABLE
```sql
CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(50) NOT NULL,
  admission_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  phone_number VARCHAR(20),
  email VARCHAR(100),
  profile_photo_url TEXT,
  blood_type VARCHAR(10),
  religion VARCHAR(50),
  nationality VARCHAR(100),
  student_category ENUM('day', 'boarding', 'weekly') DEFAULT 'day',
  academic_year VARCHAR(10) NOT NULL,
  current_class_id INT,
  current_stream_id INT,
  enrollment_date DATE NOT NULL,
  admission_date DATE NOT NULL,
  graduation_date DATE,
  status ENUM('active', 'transferred', 'graduated', 'dropped') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (current_class_id) REFERENCES classes(id),
  FOREIGN KEY (current_stream_id) REFERENCES streams(id),
  UNIQUE KEY unique_school_admission (school_id, admission_number),
  INDEX idx_school (school_id),
  INDEX idx_academic_year (academic_year),
  INDEX idx_class (current_class_id),
  INDEX idx_status (status)
);
```

### 6. TEACHERS TABLE
```sql
CREATE TABLE teachers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(50) NOT NULL,
  staff_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone_number VARCHAR(20),
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other') NOT NULL,
  qualification VARCHAR(255),
  specialization VARCHAR(100),
  employment_type ENUM('permanent', 'contract', 'temporary') DEFAULT 'permanent',
  hire_date DATE NOT NULL,
  department_id INT,
  office_location VARCHAR(100),
  office_phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  INDEX idx_school (school_id),
  INDEX idx_active (is_active)
);
```

### 7. CLASSES TABLE
```sql
CREATE TABLE classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(50) NOT NULL,
  class_name VARCHAR(100) NOT NULL,
  class_level INT NOT NULL,
  form_number INT,
  academic_year VARCHAR(10) NOT NULL,
  class_teacher_id INT,
  capacity INT DEFAULT 50,
  current_enrollment INT DEFAULT 0,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (class_teacher_id) REFERENCES teachers(id),
  UNIQUE KEY unique_school_class (school_id, class_name, academic_year),
  INDEX idx_school (school_id),
  INDEX idx_academic_year (academic_year)
);
```

### 8. STREAMS TABLE
```sql
CREATE TABLE streams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(50) NOT NULL,
  stream_name VARCHAR(100) NOT NULL,
  stream_type VARCHAR(50),
  class_id INT NOT NULL,
  capacity INT DEFAULT 45,
  current_enrollment INT DEFAULT 0,
  stream_teacher_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (stream_teacher_id) REFERENCES teachers(id),
  INDEX idx_school (school_id),
  INDEX idx_class (class_id)
);
```

### 9. SUBJECTS TABLE
```sql
CREATE TABLE subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(50) NOT NULL,
  subject_code VARCHAR(20) UNIQUE NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  subject_type ENUM('core', 'elective', 'optional') DEFAULT 'core',
  department_id INT,
  passing_grade INT DEFAULT 40,
  is_examination_subject BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  INDEX idx_school (school_id),
  INDEX idx_type (subject_type)
);
```

### 10. STUDENT_SUBJECT_ALLOCATION TABLE
```sql
CREATE TABLE student_subject_allocation (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  class_id INT NOT NULL,
  teacher_id INT,
  academic_year VARCHAR(10) NOT NULL,
  enrollment_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  UNIQUE KEY unique_allocation (student_id, subject_id, class_id, academic_year),
  INDEX idx_student (student_id),
  INDEX idx_academic_year (academic_year)
);
```

### 11. ATTENDANCE TABLE
```sql
CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(50) NOT NULL,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
  recorded_by INT,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id),
  UNIQUE KEY unique_attendance (student_id, attendance_date),
  INDEX idx_school (school_id),
  INDEX idx_date (attendance_date),
  INDEX idx_student (student_id)
);
```

### 12. GRADES TABLE
```sql
CREATE TABLE grades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(50) NOT NULL,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  term INT NOT NULL,
  academic_year VARCHAR(10) NOT NULL,
  assignment_marks INT,
  test_marks INT,
  exam_marks INT,
  total_marks INT,
  grade_letter VARCHAR(2),
  grade_points DECIMAL(3,2),
  grade_category VARCHAR(50),
  remarks TEXT,
  recorded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id),
  UNIQUE KEY unique_grade (student_id, subject_id, term, academic_year),
  INDEX idx_school (school_id),
  INDEX idx_student (student_id),
  INDEX idx_academic_year (academic_year)
);
```

### 13. FEES TABLE
```sql
CREATE TABLE fees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(50) NOT NULL,
  student_id INT NOT NULL,
  academic_year VARCHAR(10) NOT NULL,
  term INT NOT NULL,
  fee_type VARCHAR(50),
  amount_due DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  amount_balance DECIMAL(12,2),
  payment_deadline DATE,
  status ENUM('unpaid', 'partial', 'paid', 'waived') DEFAULT 'unpaid',
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  INDEX idx_school (school_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  INDEX idx_academic_year (academic_year)
);
```

### 14. PAYMENTS TABLE
```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(50) NOT NULL,
  student_id INT NOT NULL,
  fee_id INT,
  payment_method ENUM('cash', 'check', 'transfer', 'mobile_money') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  receipt_number VARCHAR(50) UNIQUE,
  reference_number VARCHAR(100),
  recorded_by INT,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (fee_id) REFERENCES fees(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id),
  INDEX idx_school (school_id),
  INDEX idx_student (student_id),
  INDEX idx_date (payment_date),
  INDEX idx_receipt (receipt_number)
);
```

### 15. STAFF_LEAVE TABLE
```sql
CREATE TABLE staff_leave (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(50) NOT NULL,
  staff_id INT NOT NULL,
  leave_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  number_of_days INT NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by INT,
  approval_date TIMESTAMP,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (staff_id) REFERENCES teachers(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  INDEX idx_school (school_id),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
);
```

### 16. INVENTORY TABLE
```sql
CREATE TABLE inventory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(50) NOT NULL,
  item_code VARCHAR(50) UNIQUE NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_category VARCHAR(100),
  description TEXT,
  unit_of_measure VARCHAR(20),
  quantity_on_hand INT NOT NULL,
  reorder_level INT DEFAULT 10,
  unit_cost DECIMAL(12,2),
  supplier_id INT,
  location VARCHAR(100),
  last_stock_check DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  INDEX idx_school (school_id),
  INDEX idx_category (item_category)
);
```

### 17. PURCHASE_ORDERS TABLE
```sql
CREATE TABLE purchase_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(50) NOT NULL,
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id INT NOT NULL,
  po_date DATE NOT NULL,
  delivery_date DATE,
  total_amount DECIMAL(12,2) NOT NULL,
  status ENUM('pending', 'approved', 'delivered', 'cancelled') DEFAULT 'pending',
  created_by INT,
  approved_by INT,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  INDEX idx_school (school_id),
  INDEX idx_status (status),
  INDEX idx_po_number (po_number)
);
```

### 18. AUDIT_LOG TABLE
```sql
CREATE TABLE audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(50) NOT NULL,
  user_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  module VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id INT,
  old_value LONGTEXT,
  new_value LONGTEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_school (school_id),
  INDEX idx_user (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_action (action)
);
```

### 19. DEPARTMENTS TABLE
```sql
CREATE TABLE departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(50) NOT NULL,
  department_name VARCHAR(100) NOT NULL,
  department_head_id INT,
  description TEXT,
  budget DECIMAL(12,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (department_head_id) REFERENCES teachers(id),
  INDEX idx_school (school_id)
);
```

### 20. SUPPLIERS TABLE
```sql
CREATE TABLE suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(50) NOT NULL,
  supplier_name VARCHAR(255) NOT NULL,
  supplier_category VARCHAR(100),
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  bank_details TEXT,
  tax_number VARCHAR(50),
  credit_limit DECIMAL(12,2),
  payment_terms VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  INDEX idx_school (school_id),
  INDEX idx_active (is_active)
);
```

## Indexes for Performance

```sql
-- Analytics queries
CREATE INDEX idx_grades_analytics ON grades(school_id, academic_year, term);
CREATE INDEX idx_fees_analytics ON fees(school_id, academic_year, status);
CREATE INDEX idx_attendance_analytics ON attendance(school_id, attendance_date);

-- Reports
CREATE INDEX idx_students_report ON students(school_id, academic_year, status);
CREATE INDEX idx_teachers_report ON teachers(school_id, department_id);
```

## Data Retention Policy

```sql
-- Archive old data (example for 3 years)
SELECT * FROM audit_log 
WHERE timestamp < DATE_SUB(NOW(), INTERVAL 3 YEAR) 
INTO OUTFILE '/backup/audit_log_archive.csv'
FIELDS TERMINATED BY ',';

-- Delete archived records
DELETE FROM audit_log 
WHERE timestamp < DATE_SUB(NOW(), INTERVAL 3 YEAR);
```

## Backup Strategy

1. **Daily Backups**: Incremental backup every 24 hours
2. **Weekly Backups**: Full backup every Sunday
3. **Monthly Backups**: Archive one full backup per month
4. **Retention**: 3 years of backup history

## Database Optimization

```sql
-- Optimize tables
OPTIMIZE TABLE users;
OPTIMIZE TABLE students;
OPTIMIZE TABLE grades;
OPTIMIZE TABLE fees;

-- Analyze tables
ANALYZE TABLE users;
ANALYZE TABLE students;
ANALYZE TABLE grades;
ANALYZE TABLE fees;
```
