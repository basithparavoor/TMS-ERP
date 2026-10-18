# THAIBA MODEL SCHOOL — ERP Management & Campus Operations Suite

[![Status](https://img.shields.io/badge/Status-Operational-10b981?style=for-the-badge)](https://thaibaschool.edu.in)
[![Institution](https://img.shields.io/badge/Institution-THAIBA_MODEL_SCHOOL-3b82f6?style=for-the-badge)](https://thaibaschool.edu.in)
[![Database](https://img.shields.io/badge/Backend-Supabase_PostgreSQL-3ecf8e?style=for-the-badge)](https://supabase.com)

**Enterprise School Management & Campus Operations Suite for THAIBA MODEL SCHOOL.**

---

## 🏛️ System Architecture

- **Scope:** Single-institution ERP exclusively for THAIBA MODEL SCHOOL. No multi-institution switching or cross-campus data leakage.
- **Frontend Stack:** HTML5, Vanilla ES6+ Modular JavaScript, Native Web Components.
- **Design Engine:** ThaibaHive Design Engine (`app.css`) with HSL design tokens, high-contrast dark mode (`.dark`), ambient canvas mesh, and glassmorphism.
- **Icons & Typography:** Lucide Icons, Outfit (headings), Plus Jakarta Sans (body), JetBrains Mono (data/codes).
- **Backend & Cloud:** Supabase Database (PostgreSQL), Supabase Auth, Row-Level Security (RLS) policies.
- **Telemetry & Geofencing:** GPS geofencing with 5-minute automated polling and 3-minute exit grace window, QR code terminal scanning, NFC integration support, and AI facial matching.

---

## 📂 File Manifest & Structure

```text
THAIBA MODEL SCHOOL ERP/
├── 🌐 Entry Point Portals
│   ├── index.html                  # Main ERP Workspace & Hash Router (#/module/tab)
│   ├── login.html                  # Universal Authentication Gateway & Demo Personas
│   ├── admin.html                  # School Administration & Leadership Suite
│   ├── teacher-portal.html         # ThaibaHive Faculty Portal
│   ├── student-portal.html         # Student Learner & Timetable Portal
│   ├── parent-portal.html          # Parent/Guardian Fee & Progress Portal
│   └── student-admission-portal.html # Public Online Admission Gateway
│
├── ⚙️ Core Configuration & Services
│   ├── config.js                   # Master School Configuration & Supabase Keys
│   ├── supabase-client.js          # Supabase API Client & Resilient Offline Cache
│   ├── auth-service.js             # RBAC Authentication & Session Engine
│   ├── permission-engine.js        # Data Access Scopes & Capability Matrix
│   ├── audit-service.js            # Immutable Append-Only Audit Trail
│   ├── ui-components.js            # Modals, Toasts, Tables & Theme Engine
│   └── app.css                     # ThaibaHive Tokens & Styling
│
├── 🚀 Application Controller
│   └── app.js                      # SPA Router, Shell, & Global Search (Ctrl + K)
│
├── 📦 Functional Modules
│   ├── admin-module.js             # School Governance, Leadership & Credentials
│   ├── institution-module.js       # Campus Facilities, Labs & Seating Capacities
│   ├── my-work-module.js           # Faculty Hub, GPS Punch, Kanban & Payslips
│   ├── attendance-module.js        # Classroom Register (Gold badge for leaves) & QR Scanner
│   ├── student-module.js           # Student SIS, Admissions & Smart ID Cards
│   ├── staff-module.js             # HR, Employees, Designations & CTC Contracts
│   ├── academic-module.js          # Classes, Subjects, Timetable Conflict Check
│   ├── examination-module.js       # Exams, Grading (A+ to F), Printable Report Cards
│   ├── finance-module.js           # Fees, Invoicing, Cash Counter & Defaulters
│   ├── communication-module.js     # Circulars, Notices & Urgent Broadcasts
│   ├── operations-module.js        # Library (ISBN), Bus Fleet, Hostel & Assets
│   └── reports-module.js           # Analytics, Pass Rates, Financial Realization
│
└── 🗄️ Database Backend
    └── schema.sql                  # PostgreSQL Tables with RLS Policies
```

---

## 🔒 Security & Data Scopes

- `school_wide`: Authorized administrative and principal oversight across THAIBA MODEL SCHOOL.
- `assigned_class`: Teachers restricted to assigned classes and sections (e.g. Grade 9A).
- `finance_scope`: Authorized bursar and accounts staff.
- `own_records`: Students restricted to their individual academic files and timetable.
- `linked_wards`: Parents restricted strictly to verified linked wards.
- **Plaintext Password Protection:** Passwords are never retrievable. Administrative password resets generate temporary secure reset links.
- **Gold Badge Leave Protection:** Students on approved leave receive gold badges and cannot be marked absent/present through normal workflows.

---

## 🚀 Running the Project

1. Clone or download the repository:
   ```bash
   git clone https://github.com/basithparavoor/TMS-ERP.git
   ```
2. Open [`index.html`](index.html) or [`login.html`](login.html) in any modern browser or serve via `npx serve .`.
3. Switch between evaluation personas on the login screen or in the topbar to test role permissions.

---
© 2024 THAIBA MODEL SCHOOL. All Rights Reserved.
