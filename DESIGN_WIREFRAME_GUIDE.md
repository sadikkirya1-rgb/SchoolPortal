# UGANDA SCHOOL ERP - DESIGN & WIREFRAME GUIDE

## 1. COLOR SCHEME FOR UGANDA SCHOOLS

### Primary Palette
```css
Primary Blue: #4f46e5 (Professional & Trustworthy)
Secondary Cyan: #06b6d4 (Modern & Fresh)
Success Green: #10b981 (Positive Actions)
Warning Amber: #f59e0b (Alerts & Warnings)
Danger Red: #ef4444 (Critical Issues)
Dark Gray: #0f172a (Text & Dark Elements)
Light Gray: #f8fafc (Backgrounds)
```

### Extended Palette
```css
Neutral Gray-50: #f9fafb
Neutral Gray-100: #f3f4f6
Neutral Gray-200: #e5e7eb
Neutral Gray-300: #d1d5db
Neutral Gray-400: #9ca3af
Neutral Gray-500: #6b7280
Neutral Gray-600: #4b5563
Neutral Gray-700: #374151
Neutral Gray-800: #1f2937
Neutral Gray-900: #111827

Success Variants:
- Light: #d1fae5
- Dark: #065f46

Warning Variants:
- Light: #fef3c7
- Dark: #92400e

Danger Variants:
- Light: #fee2e2
- Dark: #7f1d1d
```

### Recommended Official School Colors (Optional Branding)
```css
Uganda National Colors:
- Black: #000000
- White: #FFFFFF
- Gold/Yellow: #fbbf24
- School-specific secondary color

Institution Suggestion:
Use school logo colors as accent colors for authority and identity
```

## 2. TYPOGRAPHY

### Font Stack
```css
Primary Font: 'Poppins', sans-serif (Google Fonts)
Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

Font Weights Used:
- 300 (Light) - Subtle text
- 400 (Regular) - Body text
- 500 (Medium) - Labels & secondary headings
- 600 (Semibold) - Primary headings & emphasis
- 700 (Bold) - Major headings
```

### Sizing Scale
```
H1: 32px, Weight 700, Line Height 1.2
H2: 28px, Weight 700, Line Height 1.3
H3: 24px, Weight 600, Line Height 1.3
H4: 20px, Weight 600, Line Height 1.4
H5: 16px, Weight 600, Line Height 1.5
H6: 14px, Weight 600, Line Height 1.5

Body Large: 16px, Weight 400, Line Height 1.6
Body Medium: 14px, Weight 400, Line Height 1.5
Body Small: 12px, Weight 400, Line Height 1.5
Caption: 11px, Weight 500, Line Height 1.4
```

## 3. SPACING SYSTEM

```css
/* 8px Based Scale */
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
2xl: 32px
3xl: 48px
4xl: 64px
```

## 4. COMPONENT SPECIFICATIONS

### Buttons
```css
/* Primary Button */
- Background: linear-gradient(135deg, #4f46e5, #06b6d4)
- Color: white
- Padding: 12px 24px
- Border Radius: 8px
- Font Size: 14px
- Font Weight: 600
- Transition: all 0.2s ease
- Hover: Brightness 90%, Shadow elevation

/* Secondary Button */
- Background: white
- Border: 1px solid #e2e8f0
- Color: #475569
- Padding: 12px 24px
- Hover: Background #f1f5f9, Border #cbd5e1

/* Danger Button */
- Background: #ef4444
- Color: white
- Padding: 12px 24px
- Hover: Background #dc2626
```

### Input Fields
```css
- Border: 1px solid #cbd5e1
- Border Radius: 8px
- Padding: 10px 12px
- Font Size: 14px
- Transition: all 0.2s ease
- Focus: Border #4f46e5, Box-shadow 0 0 0 3px rgba(79, 70, 229, 0.1)
- Error State: Border #ef4444, Box-shadow 0 0 0 3px rgba(239, 68, 68, 0.1)
- Disabled: Background #f1f5f9, Color #94a3b8, Cursor not-allowed
```

### Cards
```css
- Background: white
- Border Radius: 12px
- Box Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
- Padding: 20px
- Border: 1px solid #e2e8f0
- Hover: Box-shadow elevation increase
```

### Badges
```css
- Primary: Background #4f46e5, Color white
- Success: Background #10b981, Color white
- Warning: Background #f59e0b, Color white
- Danger: Background #ef4444, Color white
- Neutral: Background #e2e8f0, Color #475569
- Padding: 4px 12px
- Border Radius: 12px
- Font Size: 12px
- Font Weight: 600
```

## 5. RESPONSIVE BREAKPOINTS

```css
Mobile:         320px - 640px
Tablet:         641px - 1024px
Desktop:        1025px - 1440px
Large Desktop:  1441px+

Key Breakpoints:
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px
```

## 6. SIDEBAR WIREFRAME

```
┌─────────────────────────────────────────────────────────┐
│  [LOGO]  School Name                        [MINIMIZE]   │  ← Header (60px)
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ [AVATAR]  Administrator                             │ │  ← User Card
│  │           Head Teacher                               │ │     (80px)
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ [SEARCH] 🔍 Search modules...    [★] [🔔]          │ │  ← Search
│  └─────────────────────────────────────────────────────┘ │     & Actions
│                                                           │
│  ▼ DASHBOARD                                             │  ← Menu Item
│    📊 Dashboard                                          │     (48px)
│                                                           │
│  ▶ FRONT OFFICE DEPARTMENT                              │  ← Menu Group
│    💬 Enquiries                          [5]             │     (Collapsible)
│    👥 Visitor Management                                │
│    📋 Visitor Logs                                       │
│    ☎ Call Logs                                          │
│    ✈ Dispatch                                           │
│    📢 Announcements                      [12]            │
│    📅 Calendar                                           │
│    📅 Events                             [4]             │
│    📁 Documents                                          │
│                                                           │
│  ▶ ADMISSIONS DEPARTMENT                                │
│    ➕ Admissions                         [5]             │
│    📄 Applications                       [8]             │
│    ✓ Interviews                          [3]             │
│    ✉ Admission Letters                                  │
│    ⏳ Waiting List                        [2]             │
│    🪪 Student Registration                              │
│    ↻ Student Transfers                   [1]             │
│                                                           │
│  ⬇ [Scrollable content continues...]                   │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  [🌙] [⚙] [?] [↪]  Bottom Action Buttons               │  ← Footer (60px)
└─────────────────────────────────────────────────────────┘
```

## 7. SIDEBAR VARIATIONS

### Desktop Sidebar (320px width)
- Full labels visible
- Icons + Text for all items
- Hover effects with smooth transitions
- Scrollable menu area
- User profile card fully visible

### Tablet Sidebar (280px width)
- Slightly smaller icons
- Text truncation with ellipsis
- Touch-friendly click targets (min 44px height)
- Compact spacing

### Mobile Sidebar (Drawer - 280px)
- Slide-out from left
- Semi-transparent overlay background
- Full-height navigation
- Close button when opened
- Swipe to close support

### Collapsed Sidebar (80px width)
- Icons only visible
- Labels hidden
- Tooltip on hover
- Compact mode for more content space
- Toggle between expanded/collapsed

## 8. MAIN CONTENT LAYOUT

```
┌──────────────────────────────────────────────────────────────┐
│ [SIDEBAR]  [TOP NAVBAR]                                      │
│            ┌──────────────────────────────────────────────┐  │
│            │ [☰] School Name              [User] [Logout] │  │
│            ├──────────────────────────────────────────────┤  │
│            │                                              │  │
│            │  MAIN CONTENT AREA                           │  │
│            │                                              │  │
│            │  [Responsive Grid Layout]                    │  │
│            │  - Dashboard with KPI Cards                  │  │
│            │  - Charts and Analytics                      │  │
│            │  - Data Tables with Pagination               │  │
│            │  - Forms                                     │  │
│            │                                              │  │
│            │                                              │  │
│            └──────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## 9. DASHBOARD WIREFRAME

```
┌────────────────────────────────────────────────────────────────┐
│ Dashboard > Overview                           Date Range Picker │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Total Students│  │ Total Teachers│  │ Avg Attendance│        │
│  │     1,245    │  │      87       │  │    92.5%     │         │
│  │    ↑ 5.2%    │  │    ↑ 2.1%    │  │    ↑ 1.3%    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────────────────────┐  ┌──────────────────────┐   │
│  │    Attendance This Month      │  │  Fee Collection Rate │   │
│  │                               │  │                      │   │
│  │  [Line Chart - 30 days]       │  │  [Pie Chart]         │   │
│  │                               │  │  85% Paid            │   │
│  │                               │  │  10% Partial         │   │
│  │                               │  │  5% Unpaid           │   │
│  └──────────────────────────────┘  └──────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Recent Activities                    View All →           │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ • John Doe (Student) registered                   2 hrs ago│  │
│  │ • New admission application received                4 hrs ago│ │
│  │ • Staff leave request approved                     1 day ago│  │
│  │ • Purchase order delivered                         1 day ago│  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## 10. DATA TABLE LAYOUT

```
┌────────────────────────────────────────────────────────────────┐
│ Students List        [Search] [Add New] [Export] [Filters ▼]   │
├────────────────────────────────────────────────────────────────┤
│ ☐  Admission # │ Name          │ Class │ Status    │ Actions   │
├────────────────────────────────────────────────────────────────┤
│ ☐  ADM-2024-001│ John Smith    │ S.5   │ Active    │ ⋯         │
│ ☐  ADM-2024-002│ Jane Doe      │ S.4   │ Active    │ ⋯         │
│ ☐  ADM-2024-003│ Bob Johnson   │ S.6   │ Active    │ ⋯         │
│ ☐  ADM-2024-004│ Alice Brown   │ S.3   │ Boarding  │ ⋯         │
├────────────────────────────────────────────────────────────────┤
│ Showing 1-4 of 1,245                [< 1 2 3 4 5 ... 312 >]   │
└────────────────────────────────────────────────────────────────┘
```

## 11. FORM LAYOUT

```
┌────────────────────────────────────────────────────────────────┐
│ Student Registration Form          [× Close]                    │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Personal Information                                            │
│ ────────────────────────────────────────────────────────────  │
│                                                                 │
│ [First Name]        [Last Name]                                │
│ ____________________  ____________________                      │
│                                                                 │
│ [Date of Birth]     [Gender]        [Religion]                │
│ ____________________  __________      __________                │
│                                                                 │
│ Contact Information                                             │
│ ────────────────────────────────────────────────────────────  │
│                                                                 │
│ [Email]            [Phone Number]                              │
│ ____________________  ____________________                      │
│                                                                 │
│ Academic Details                                                │
│ ────────────────────────────────────────────────────────────  │
│                                                                 │
│ [Admission Number]   [Class]         [Stream]                  │
│ ____________________  __________      __________                │
│                                                                 │
│ [Submit]  [Cancel]                                             │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## 12. MOBILE VIEW LAYOUT

```
┌──────────────────────────┐
│ [☰] SchoolPortal  [🔔]   │  ← Top Header
├──────────────────────────┤
│                          │
│ [Search] [Filter]        │  ← Search Bar
│                          │
│  Dashboard               │  ← Page Title
│  Today's Overview        │
│                          │
│ ┌────────────────────┐   │
│ │ Students    1,245  │   │  ← KPI Cards (Stacked)
│ │ ↑ 5.2%             │   │
│ └────────────────────┘   │
│                          │
│ ┌────────────────────┐   │
│ │ Teachers     87    │   │
│ │ ↑ 2.1%             │   │
│ └────────────────────┘   │
│                          │
│ ┌────────────────────┐   │
│ │ Avg Attendance     │   │
│ │ 92.5%              │   │
│ │ ↑ 1.3%             │   │
│ └────────────────────┘   │
│                          │
│  Recent Activities       │  ← Section
│                          │
│ • John Doe registered    │  ← Activity Item
│   2 hours ago            │
│                          │
│ • New admission          │
│   4 hours ago            │
│                          │
│ [View All →]             │
│                          │
└──────────────────────────┘
```

## 13. NAVIGATION DRAWER (MOBILE)

```
┌──────────────────────────────────┐
│ [EduMaster Logo] [×]              │  ← Drawer Header
├──────────────────────────────────┤
│                                  │
│ [Avatar] Admin                   │  ← User Info
│          Head Teacher             │
│          ● Online                 │
│                                  │
├──────────────────────────────────┤
│ [🔍] Search modules...           │  ← Search
├──────────────────────────────────┤
│                                  │
│ 📊 Dashboard                     │  ← Menu Items
│                                  │
│ 🏢 Front Office       ▼          │  ← Expandable Group
│   💬 Enquiries                   │     (Expanded)
│   👥 Visitor Mgmt                │
│   ☎ Call Logs                    │
│   ✈ Dispatch                     │
│                                  │
│ 🎓 Admissions        ▶           │  ← Expandable Group
│                                  │     (Collapsed)
│ 📚 Academics         ▶           │
│                                  │
│ ⬇ [Scrollable...]                │
│                                  │
├──────────────────────────────────┤
│ [🌙] [⚙] [?] [↪]                │  ← Footer Actions
└──────────────────────────────────┘
```

## 14. ICON LEGEND

All icons use Font Awesome v6.5.2

```
Document/File:      📄 fas fa-file-lines
User/People:        👥 fas fa-users
Settings:          ⚙ fas fa-cog
Search:            🔍 fas fa-search
Calendar:          📅 fas fa-calendar
Chart/Analytics:   📊 fas fa-chart-line
Money/Finance:     💰 fas fa-coins
Settings:          ⚙️ fas fa-sliders
Dark Mode:         🌙 fas fa-moon
Light Mode:        ☀️ fas fa-sun
Help:              ❓ fas fa-circle-question
Logout:            ↪️ fas fa-sign-out-alt
```

## 15. ANIMATION & TRANSITIONS

```css
/* Sidebar Menu */
- Expand/Collapse: 0.3s ease
- Item Hover: 0.2s ease
- Active State: Smooth color transition

/* Buttons */
- Hover: 0.2s ease
- Click: 0.1s ease (scale down 98%)

/* Forms */
- Focus: 0.2s ease
- Validation: 0.3s ease

/* Modals */
- Open: 0.3s ease (fade in + scale up)
- Close: 0.2s ease (fade out + scale down)

/* Dark Mode Toggle */
- Theme Switch: 0.3s ease
```

## 16. ACCESSIBILITY

```
- Minimum color contrast: WCAG AA (4.5:1)
- Touch targets: Minimum 44px height/width
- Focus indicators: Always visible
- Alt text: All images have descriptive alt text
- ARIA labels: Form fields and interactive elements
- Keyboard navigation: Full support for Tab, Enter, Escape
- Screen reader support: Semantic HTML structure
- Reduced motion: Respects prefers-reduced-motion
```

## 17. DARK MODE SPECIFICATIONS

```css
Primary Background: #1e293b (Instead of #ffffff)
Secondary Background: #0f172a (Instead of #f8fafc)
Card Background: #334155 (Instead of #ffffff)
Text Color: #e2e8f0 (Instead of #0f172a)
Border Color: #334155 (Instead of #e2e8f0)
Accent Colors: #06b6d4 (Cyan - adjusted for dark)

Dark Mode CSS:
body.dark-mode {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: #e2e8f0;
}

body.dark-mode .sidebar-wrapper {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border-right-color: #334155;
}
```

---

## DESIGN CHECKLIST

- [ ] All 11 roles have distinct color coding
- [ ] Menu items have consistent 20px icon sizes
- [ ] Line heights maintain 1.5 minimum ratio
- [ ] All buttons have visible focus states
- [ ] Mobile sidebar drawer has overlay
- [ ] Dark mode applies to all components
- [ ] Animations respect prefers-reduced-motion
- [ ] Color contrast meets WCAG AA standard
- [ ] Forms include validation states
- [ ] Responsive design tested at all breakpoints
