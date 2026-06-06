# UGANDA SCHOOL ERP - IMPLEMENTATION GUIDE

## 1. QUICK START

### Installation Steps

1. **Include Required Files in HTML:**
```html
<!-- In your index.html head section -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"/>
<link rel="stylesheet" href="./style.css">
<link rel="stylesheet" href="./sidebar-component.html"> <!-- Embed styles -->

<!-- Before closing body tag -->
<script src="./sidebar-controller.js"></script>
```

2. **Add Sidebar HTML:**
```html
<!-- Add this in your main dashboard -->
<div class="main-wrapper">
  <!-- Include sidebar-component.html content here -->
  <!-- Main content area -->
</div>
```

3. **Update Main CSS:**
Add the CSS from `sidebar-component.html` to your main `style.css` file.

### File Structure
```
SchoolPortal/
├── index.html
├── style.css
├── script.js
├── menu-structure.json
├── sidebar-component.html
├── sidebar-controller.js
├── DATABASE_SCHEMA.md
├── PERMISSIONS_MATRIX.md
├── DESIGN_WIREFRAME_GUIDE.md
└── IMPLEMENTATION_GUIDE.md
```

## 2. CONFIGURATION

### Menu Customization

Edit `menu-structure.json` to:
- Add/remove modules
- Modify icons
- Change labels
- Update role access

```json
{
  "id": "module_id",
  "label": "Module Name",
  "icon": "fas fa-icon-name",
  "href": "#/path/to/module",
  "badge": "badge_key",
  "roles": ["super_admin", "director"],
  "children": [...]
}
```

### Role Management

Add custom roles in the database:
```sql
INSERT INTO roles (id, name, description, level)
VALUES ('custom_role', 'Custom Role Name', 'Description', 5);
```

### School Types Support

The system supports:
- **Primary Schools**: Class P.1 - P.7
- **Secondary Schools**: Form 1 - Form 6 (S.1 - S.6)
- **Vocational Institutes**: Various technical programs
- **International Schools**: International Baccalaureate, Cambridge, etc.

## 3. API INTEGRATION

### User Authentication
```javascript
// Upon successful login, save session
const session = {
  userId: user.id,
  name: user.name,
  role: user.role,
  schoolId: user.schoolId,
  loginTime: new Date(),
  token: authToken
};

localStorage.setItem('edumasterAdminSession', JSON.stringify(session));
```

### Fetch Menu Data
```javascript
// The sidebar automatically loads from menu-structure.json
// To use API instead:

async function loadMenuFromAPI() {
  const response = await fetch('/api/navigation/menu', {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'School-ID': schoolId
    }
  });
  return response.json();
}
```

### Update Badge Counts
```javascript
// In sidebar-controller.js, modify getBadgeCount method
getBadgeCount(badgeKey) {
  // Replace with API call
  return fetch(`/api/badges/${badgeKey}`)
    .then(r => r.json())
    .then(data => data.count);
}
```

## 4. DATABASE SETUP

### MySQL Installation
```bash
# Create database
mysql -u root -p
CREATE DATABASE school_erp;
USE school_erp;

# Import schema
mysql -u root -p school_erp < DATABASE_SCHEMA.md
```

### Seed Initial Data
```sql
-- Insert schools
INSERT INTO schools (id, school_name, school_type, registration_number)
VALUES ('SCH-UG-2026', 'EduMaster Uganda', 'secondary', 'REG-2024-001');

-- Insert roles
INSERT INTO roles (id, name, description, level)
VALUES 
  ('super_admin', 'Super Admin', 'Full system access', 10),
  ('director', 'Director', 'School director', 9),
  ('head_teacher', 'Head Teacher', 'Principal', 8);

-- Insert initial admin user
INSERT INTO users (school_id, user_id, first_name, last_name, email, password_hash, role)
VALUES ('SCH-UG-2026', 'Admin', 'Admin', 'User', 'admin@school.edu', 'hashed_password', 'super_admin');
```

## 5. FEATURE IMPLEMENTATIONS

### Attendance Module
```javascript
// Quick capture attendance
const markAttendance = async (studentId, status) => {
  return fetch('/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId,
      status,
      date: new Date().toISOString().split('T')[0]
    })
  });
};
```

### Grades Management
```javascript
// Record grades
const recordGrade = async (studentId, subjectId, marks) => {
  return fetch('/api/grades', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId,
      subjectId,
      marks,
      term: getCurrentTerm(),
      academicYear: getCurrentYear()
    })
  });
};
```

### Fee Management
```javascript
// Record fee payment
const recordPayment = async (studentId, amount, method) => {
  return fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId,
      amount,
      paymentMethod: method,
      paymentDate: new Date(),
      receiptNumber: generateReceiptNumber()
    })
  });
};
```

## 6. DARK MODE IMPLEMENTATION

### Enable Dark Mode
```javascript
// In sidebar-controller.js
enableDarkMode() {
  document.body.classList.add('dark-mode');
  localStorage.setItem('darkMode', 'true');
  
  // Apply dark mode CSS variables
  document.documentElement.style.setProperty('--bg-color', '#1e293b');
  document.documentElement.style.setProperty('--text-color', '#e2e8f0');
}
```

### CSS Variables
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --border-color: #e2e8f0;
}

body.dark-mode {
  --bg-primary: #1e293b;
  --bg-secondary: #0f172a;
  --text-primary: #e2e8f0;
  --text-secondary: #cbd5e1;
  --border-color: #334155;
}
```

## 7. MOBILE OPTIMIZATION

### Mobile-First Breakpoints
```css
/* Mobile (default) */
.sidebar-wrapper { width: 100%; position: fixed; left: -100%; }

/* Tablet */
@media (min-width: 768px) {
  .sidebar-wrapper { width: 280px; left: 0; }
}

/* Desktop */
@media (min-width: 1024px) {
  .sidebar-wrapper { width: 320px; }
}
```

### Touch Events
```javascript
// Add touch swipe to close sidebar
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  if (touchEndX < touchStartX - 50) {
    // Swiped left - close sidebar
    closeMobileSidebar();
  }
}
```

## 8. SECURITY IMPLEMENTATION

### CORS Configuration
```javascript
// Backend CORS setup
const cors = require('cors');
app.use(cors({
  origin: ['https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### CSRF Protection
```javascript
// Generate CSRF token
const csrfToken = require('csurf')({ cookie: true });
app.use(csrfToken);

// Include in forms
<input type="hidden" name="_csrf" value="<%= csrfToken %>">
```

### Password Hashing
```javascript
// Use bcrypt for password hashing
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
```

## 9. EXPORT & REPORTING

### Generate PDF Reports
```javascript
const generatePDFReport = async (data, templateId) => {
  const doc = new PDFDocument();
  
  // Add school header
  doc.fontSize(20).text(data.schoolName, 100, 50);
  doc.fontSize(12).text(data.reportTitle, 100, 80);
  
  // Add content
  data.rows.forEach((row, index) => {
    doc.text(row, 100, 120 + (index * 20));
  });
  
  doc.pipe(fs.createWriteStream('report.pdf'));
  doc.end();
};
```

### Export to Excel
```javascript
const exportToExcel = async (data, filename) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');
  
  // Add headers
  worksheet.columns = data.headers.map(h => ({ header: h, key: h.toLowerCase() }));
  
  // Add rows
  data.rows.forEach(row => {
    worksheet.addRow(row);
  });
  
  await workbook.xlsx.writeFile(`${filename}.xlsx`);
};
```

## 10. PERFORMANCE OPTIMIZATION

### Lazy Loading
```javascript
// Load modules on demand
const lazyLoadModule = (moduleName) => {
  return import(`./modules/${moduleName}.js`)
    .then(module => module.default)
    .catch(err => console.error(`Failed to load ${moduleName}`, err));
};
```

### Caching Strategy
```javascript
// Service Worker caching
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/',
        '/sidebar-component.html',
        '/sidebar-controller.js',
        '/menu-structure.json'
      ]);
    })
  );
});
```

### Compression
```javascript
// Enable gzip compression
const compression = require('compression');
app.use(compression());
```

## 11. MONITORING & LOGGING

### Activity Logging
```javascript
const logActivity = async (userId, action, module, details) => {
  const logEntry = {
    userId,
    action,
    module,
    details,
    timestamp: new Date(),
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  };
  
  await db.query('INSERT INTO audit_log SET ?', logEntry);
};
```

### Error Tracking
```javascript
// Sentry integration
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your-sentry-url" });

app.use((error, req, res, next) => {
  Sentry.captureException(error);
  res.status(500).json({ error: 'Internal Server Error' });
});
```

## 12. TESTING

### Unit Tests
```javascript
// Jest test example
describe('SidebarController', () => {
  test('should filter menu by role', () => {
    const controller = new SidebarController();
    const filtered = controller.filterMenuByRole(menu, 'teacher');
    expect(filtered).toHaveLength(expectedCount);
  });
});
```

### Integration Tests
```javascript
describe('Authentication API', () => {
  test('should create user session on login', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ userId: 'test', password: 'password123' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

## 13. DEPLOYMENT

### Production Checklist
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] SSL/TLS certificates installed
- [ ] CDN configured for static assets
- [ ] Error monitoring (Sentry) enabled
- [ ] Performance monitoring (New Relic) enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers added
- [ ] API documentation generated
- [ ] Health check endpoint configured

### Docker Setup
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

## 14. MAINTENANCE

### Regular Tasks
- Monthly: Review audit logs
- Quarterly: Update dependencies
- Bi-annual: Security assessment
- Annual: Full system backup and recovery test

### Update Guide
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm update

# Run migrations
npm run migrate

# Restart services
npm restart
```

---

## SUPPORT & TROUBLESHOOTING

### Common Issues

**Issue: Menu not loading**
- Check if `menu-structure.json` is in correct location
- Verify JSON syntax
- Check browser console for errors

**Issue: Sidebar not collapsing**
- Ensure CSS is properly loaded
- Check for JavaScript errors in console
- Verify localStorage is enabled

**Issue: Permissions not working**
- Verify user role in database
- Check permissions matrix mapping
- Clear browser cache and localStorage

### Contact Support
- Email: support@schoolerp.com
- Phone: +256-XXX-XXXXXX
- Documentation: https://docs.schoolerp.com
