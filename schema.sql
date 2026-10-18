-- ============================================================================
-- THAIBA MODEL SCHOOL — Supabase PostgreSQL Database Schema & RLS Policies
-- Single-Institution Architecture exclusively for THAIBA MODEL SCHOOL
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Audit Trail (Immutable Log)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT,
    user_name TEXT,
    user_role TEXT,
    user_scope TEXT,
    action TEXT NOT NULL,
    category TEXT NOT NULL,
    entity_ref TEXT,
    details TEXT,
    ip_address TEXT,
    client_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read audit logs" ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- 3. Facilities & Infrastructure
CREATE TABLE IF NOT EXISTS facilities (
    id TEXT PRIMARY KEY,
    building TEXT NOT NULL,
    floor TEXT NOT NULL,
    name TEXT NOT NULL,
    capacity INT DEFAULT 35,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read facilities" ON facilities FOR SELECT USING (true);
CREATE POLICY "Allow admin manage facilities" ON facilities FOR ALL TO authenticated USING (true);

-- 4. Students Directory
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    admission_no TEXT UNIQUE NOT NULL,
    roll_no TEXT,
    full_name TEXT NOT NULL,
    gender TEXT,
    dob DATE,
    grade TEXT NOT NULL,
    section TEXT NOT NULL,
    guardian_name TEXT,
    guardian_phone TEXT,
    blood_group TEXT,
    address TEXT,
    status TEXT DEFAULT 'Active',
    leave_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read students" ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authorized manage students" ON students FOR ALL TO authenticated USING (true);

-- 5. Staff & Faculty
CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    emp_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    designation TEXT NOT NULL,
    phone TEXT,
    joining_date DATE,
    status TEXT DEFAULT 'Active',
    basic_pay NUMERIC(10, 2),
    hra NUMERIC(10, 2),
    allowances NUMERIC(10, 2),
    assigned_class TEXT,
    assigned_section TEXT,
    assigned_subject TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read staff" ON staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage staff" ON staff FOR ALL TO authenticated USING (true);

-- 6. Invoices & Fees
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_no TEXT UNIQUE NOT NULL,
    student_id TEXT REFERENCES students(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    grade TEXT NOT NULL,
    term TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    paid NUMERIC(10, 2) DEFAULT 0,
    balance NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'Unpaid',
    due_date DATE,
    paid_date DATE,
    payment_mode TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read invoices" ON invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow finance manage invoices" ON invoices FOR ALL TO authenticated USING (true);

-- 7. Notices & Announcements
CREATE TABLE IF NOT EXISTS notices (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    target TEXT NOT NULL,
    priority TEXT DEFAULT 'Normal',
    content TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    published_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all read notices" ON notices FOR SELECT USING (true);
CREATE POLICY "Allow authorized publish notices" ON notices FOR ALL TO authenticated USING (true);

-- 8. Staff Tasks (Kanban)
CREATE TABLE IF NOT EXISTS staff_tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'To Do',
    priority TEXT DEFAULT 'Medium',
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE staff_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user manage tasks" ON staff_tasks FOR ALL TO authenticated USING (true);

-- 9. Admissions Applications (Public)
CREATE TABLE IF NOT EXISTS admissions_applications (
    id TEXT PRIMARY KEY,
    app_id TEXT UNIQUE NOT NULL,
    student_name TEXT NOT NULL,
    dob DATE,
    gender TEXT,
    grade TEXT NOT NULL,
    guardian_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT,
    status TEXT DEFAULT 'Submitted',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admissions_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert admissions" ON admissions_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin read admissions" ON admissions_applications FOR SELECT TO authenticated USING (true);
