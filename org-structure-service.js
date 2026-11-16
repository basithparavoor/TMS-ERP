/**
 * THAIBA MODEL SCHOOL — Institutional Organization Structure Service
 * Manages dynamic Departments, Faculty Designations, and Institutional Roles.
 * Persisted in Supabase `app_settings` (id: 'tms_org_structure') with instant localStorage caching.
 */

import { dbService } from './supabase-client.js';
import { auditService } from './audit-service.js';

const SETTINGS_ID = 'tms_org_structure';
const STORAGE_KEY = 'tms_org_structure';

export const DEFAULT_DEPARTMENTS = [
  { id: 'dept-sci', name: 'Science', code: 'SCI', description: 'Physics, Chemistry, Biology and General Science' },
  { id: 'dept-math', name: 'Mathematics', code: 'MATH', description: 'Primary, Secondary, and Higher Secondary Mathematics' },
  { id: 'dept-eng', name: 'English', code: 'ENG', description: 'English Language, Grammar, Literature, and Communication' },
  { id: 'dept-soc', name: 'Social Studies', code: 'SOC', description: 'History, Geography, Civics, and Social Sciences' },
  { id: 'dept-ais', name: 'Arabic & Islamic Studies', code: 'AIS', description: 'Deeniyat, Quranic Recitation, Hifz, and Arabic' },
  { id: 'dept-ben', name: 'Bengali & Vernacular', code: 'BEN', description: 'Bengali Language, Reading, and Regional Culture' },
  { id: 'dept-it', name: 'Information Technology', code: 'IT', description: 'Computer Applications, AI, and IT Infrastructure' },
  { id: 'dept-com', name: 'Commerce & Economics', code: 'COM', description: 'Accountancy, Business Studies, and Economics' },
  { id: 'dept-ped', name: 'Physical Education & Sports', code: 'PED', description: 'Athletics, Physical Training, and Games' },
  { id: 'dept-adm', name: 'Administration & HR', code: 'ADM', description: 'Campus Governance, Admissions, and Human Resources' },
  { id: 'dept-fin', name: 'Finance & Accounts', code: 'FIN', description: 'Institutional Accounts, Fee Collection, and Payroll' },
  { id: 'dept-lib', name: 'Library & Media', code: 'LIB', description: 'Institutional Library, Reading Resources, and Archives' },
  { id: 'dept-ops', name: 'Transport & Campus Operations', code: 'OPS', description: 'Bus Fleet, Campus Security, Hostel, and Maintenance' }
];

export const DEFAULT_DESIGNATIONS = [
  { id: 'desig-prn', title: 'Principal', category: 'Administrative', department: 'Administration & HR', description: 'Head of Institution' },
  { id: 'desig-vprn', title: 'Vice Principal', category: 'Administrative', department: 'Administration & HR', description: 'Academic Administration & Disciplinary Oversight' },
  { id: 'desig-coord', title: 'Academic Coordinator', category: 'Administrative', department: 'Administration & HR', description: 'Curriculum & Examination Supervision' },
  { id: 'desig-pgt', title: 'PGT — Post Graduate Teacher', category: 'Teaching', department: 'Science', description: 'Senior Secondary Faculty (Grades 11-12)' },
  { id: 'desig-tgt', title: 'TGT — Trained Graduate Teacher', category: 'Teaching', department: 'Science', description: 'Secondary Stage Faculty (Grades 6-10)' },
  { id: 'desig-prt', title: 'PRT — Primary Teacher', category: 'Teaching', department: 'English', description: 'Primary Stage Educator (Grades 1-5)' },
  { id: 'desig-prep', title: 'Pre-Primary / Nursery Educator', category: 'Teaching', department: 'Bengali & Vernacular', description: 'Early Childhood Education (Nursery, LKG, UKG)' },
  { id: 'desig-sr-acc', title: 'Senior Accountant', category: 'Non-Teaching', department: 'Finance & Accounts', description: 'Institutional Financial Audits & Ledger Control' },
  { id: 'desig-cash', title: 'Accounts Clerk / Cashier', category: 'Non-Teaching', department: 'Finance & Accounts', description: 'Tuition Fee Collection & Counter Receipts' },
  { id: 'desig-lib', title: 'Head Librarian', category: 'Non-Teaching', department: 'Library & Media', description: 'Library Cataloging & Book Circulation' },
  { id: 'desig-it-admin', title: 'IT Systems & Lab Administrator', category: 'Non-Teaching', department: 'Information Technology', description: 'Smart Classrooms, Cloud Portal & Hardware Support' },
  { id: 'desig-transp', title: 'Transport Supervisor', category: 'Non-Teaching', department: 'Transport & Campus Operations', description: 'School Bus Logistics & Driver Management' },
  { id: 'desig-warden', title: 'Hostel Warden', category: 'Non-Teaching', department: 'Transport & Campus Operations', description: 'Student Boarding Care, Mess & Dormitory Discipline' },
  { id: 'desig-office', title: 'Office Assistant / Data Entry Operator', category: 'Non-Teaching', department: 'Administration & HR', description: 'Admissions Data Entry & General Clerical Support' }
];

export const DEFAULT_ROLES = [
  { id: 'role-principal', code: 'principal', label: 'Principal', scope: 'school_wide', isSystem: true, description: 'Institutional leadership, academic approvals, and governance.' },
  { id: 'role-admin', code: 'admin', label: 'System Administrator', scope: 'school_wide', isSystem: true, description: 'System configuration, IT master settings, and user security.' },
  { id: 'role-coordinator', code: 'coordinator', label: 'Academic Coordinator', scope: 'school_wide', isSystem: true, description: 'Curriculum planning, examination schedules, and timetable management.' },
  { id: 'role-teacher', code: 'teacher', label: 'Teaching Faculty', scope: 'assigned_class', isSystem: true, description: 'Classroom instruction, daily attendance, grade recording, and assignments.' },
  { id: 'role-finance', code: 'finance', label: 'Finance & Accounts', scope: 'finance_scope', isSystem: true, description: 'Student fees, billing invoices, receipts, and financial summaries.' },
  { id: 'role-hr', code: 'hr', label: 'HR & Administration', scope: 'school_wide', isSystem: true, description: 'Staff appointments, faculty records, service registry, and onboarding.' },
  { id: 'role-librarian', code: 'librarian', label: 'Librarian', scope: 'department_scope', isSystem: true, description: 'Library cataloging, book issuance, returns, and inventory.' },
  { id: 'role-operations', code: 'operations', label: 'Operations & Transport', scope: 'operations_scope', isSystem: true, description: 'Bus tracking, vehicle maintenance, hostel amenities, and facilities.' },
  { id: 'role-office_boy', code: 'office_boy', label: 'Office Boy (Data Entry)', scope: 'school_wide', isSystem: true, description: 'Admission application intake and clerical data entry.' }
];

class OrgStructureService {
  constructor() {
    this._cache = null;
  }

  getDefaults() {
    return {
      departments: JSON.parse(JSON.stringify(DEFAULT_DEPARTMENTS)),
      designations: JSON.parse(JSON.stringify(DEFAULT_DESIGNATIONS)),
      roles: JSON.parse(JSON.stringify(DEFAULT_ROLES))
    };
  }

  async load() {
    if (this._cache) return this._cache;

    // 1. Try LocalStorage for instant render
    let localData = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) localData = JSON.parse(raw);
    } catch (e) {
      localData = null;
    }

    // 2. Try Supabase app_settings
    let remoteData = null;
    try {
      const rows = await dbService.select('app_settings');
      const row = (rows || []).find(r => r.id === SETTINGS_ID);
      if (row && row.value && typeof row.value === 'object') {
        remoteData = row.value;
      }
    } catch (e) {
      console.warn('Could not fetch org structure from Supabase:', e.message);
    }

    const defaults = this.getDefaults();
    const source = remoteData || localData || defaults;

    this._cache = {
      departments: Array.isArray(source.departments) && source.departments.length ? source.departments : defaults.departments,
      designations: Array.isArray(source.designations) && source.designations.length ? source.designations : defaults.designations,
      roles: Array.isArray(source.roles) && source.roles.length ? source.roles : defaults.roles
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._cache));
    } catch (e) {}

    return this._cache;
  }

  async save(data) {
    this._cache = {
      departments: data.departments || [],
      designations: data.designations || [],
      roles: data.roles || []
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._cache));
    } catch (e) {}

    let res = null;
    try {
      res = await dbService.upsert('app_settings', {
        id: SETTINGS_ID,
        value: this._cache,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Failed to persist org structure to Supabase:', e);
    }

    return { ok: true, data: this._cache, syncError: res?._syncError || null };
  }

  /* ---------------- Department Operations ---------------- */

  async getDepartments() {
    const data = await this.load();
    return data.departments || [];
  }

  async saveDepartment(dept) {
    const data = await this.load();
    const list = [...(data.departments || [])];
    const name = String(dept.name || '').trim();
    if (!name) throw new Error('Department name is required.');

    const cleanCode = String(dept.code || '').trim().toUpperCase() || name.slice(0, 4).toUpperCase();
    const existingIndex = dept.id ? list.findIndex(d => d.id === dept.id) : -1;

    // Check duplicate name
    const dup = list.find((d, idx) => idx !== existingIndex && d.name.toLowerCase() === name.toLowerCase());
    if (dup) throw new Error(`A department named "${name}" already exists.`);

    const record = {
      id: dept.id || `dept-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      code: cleanCode,
      description: String(dept.description || '').trim()
    };

    if (existingIndex >= 0) {
      list[existingIndex] = record;
    } else {
      list.push(record);
    }

    await this.save({ ...data, departments: list });
    await auditService.log(
      existingIndex >= 0 ? 'DEPARTMENT_UPDATED' : 'DEPARTMENT_CREATED',
      'ORGANIZATION',
      { id: record.id, name: record.name, code: record.code }
    );
    return record;
  }

  async deleteDepartment(id) {
    const data = await this.load();
    const list = (data.departments || []).filter(d => d.id !== id);
    const target = (data.departments || []).find(d => d.id === id);

    await this.save({ ...data, departments: list });
    if (target) {
      await auditService.log('DEPARTMENT_DELETED', 'ORGANIZATION', { id: target.id, name: target.name });
    }
    return true;
  }

  /* ---------------- Designation Operations ---------------- */

  async getDesignations() {
    const data = await this.load();
    return data.designations || [];
  }

  async saveDesignation(desig) {
    const data = await this.load();
    const list = [...(data.designations || [])];
    const title = String(desig.title || '').trim();
    if (!title) throw new Error('Designation title is required.');

    const existingIndex = desig.id ? list.findIndex(d => d.id === desig.id) : -1;

    // Check duplicate title
    const dup = list.find((d, idx) => idx !== existingIndex && d.title.toLowerCase() === title.toLowerCase());
    if (dup) throw new Error(`A designation titled "${title}" already exists.`);

    const record = {
      id: desig.id || `desig-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      category: desig.category || 'Teaching',
      department: desig.department || 'General',
      description: String(desig.description || '').trim()
    };

    if (existingIndex >= 0) {
      list[existingIndex] = record;
    } else {
      list.push(record);
    }

    await this.save({ ...data, designations: list });
    await auditService.log(
      existingIndex >= 0 ? 'DESIGNATION_UPDATED' : 'DESIGNATION_CREATED',
      'ORGANIZATION',
      { id: record.id, title: record.title, category: record.category }
    );
    return record;
  }

  async deleteDesignation(id) {
    const data = await this.load();
    const list = (data.designations || []).filter(d => d.id !== id);
    const target = (data.designations || []).find(d => d.id === id);

    await this.save({ ...data, designations: list });
    if (target) {
      await auditService.log('DESIGNATION_DELETED', 'ORGANIZATION', { id: target.id, title: target.title });
    }
    return true;
  }

  /* ---------------- Role Operations ---------------- */

  async getRoles() {
    const data = await this.load();
    return data.roles || [];
  }

  async saveRole(role) {
    const data = await this.load();
    const list = [...(data.roles || [])];
    const label = String(role.label || '').trim();
    if (!label) throw new Error('Role name / label is required.');

    const cleanCode = String(role.code || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_') || label.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    const existingIndex = role.id ? list.findIndex(r => r.id === role.id) : -1;

    // Check duplicate code or label
    const dup = list.find((r, idx) => idx !== existingIndex && (r.code === cleanCode || r.label.toLowerCase() === label.toLowerCase()));
    if (dup) throw new Error(`A role with code "${cleanCode}" or label "${label}" already exists.`);

    const existingRole = existingIndex >= 0 ? list[existingIndex] : null;

    const record = {
      id: role.id || `role-${cleanCode}`,
      code: existingRole && existingRole.isSystem ? existingRole.code : cleanCode,
      label,
      scope: role.scope || 'school_wide',
      isSystem: existingRole ? !!existingRole.isSystem : false,
      description: String(role.description || '').trim()
    };

    if (existingIndex >= 0) {
      list[existingIndex] = record;
    } else {
      list.push(record);
    }

    await this.save({ ...data, roles: list });
    await auditService.log(
      existingIndex >= 0 ? 'ROLE_UPDATED' : 'ROLE_CREATED',
      'ORGANIZATION',
      { id: record.id, code: record.code, label: record.label }
    );
    return record;
  }

  async deleteRole(id) {
    const data = await this.load();
    const target = (data.roles || []).find(r => r.id === id);
    if (!target) return false;
    if (target.isSystem) {
      throw new Error(`Cannot delete core system role "${target.label}". Core roles are protected to preserve authorization access.`);
    }

    const list = (data.roles || []).filter(r => r.id !== id);
    await this.save({ ...data, roles: list });
    await auditService.log('ROLE_DELETED', 'ORGANIZATION', { id: target.id, code: target.code, label: target.label });
    return true;
  }

  async resetToDefaults() {
    const defaults = this.getDefaults();
    await this.save(defaults);
    await auditService.log('ORGANIZATION_STRUCTURE_RESET', 'ORGANIZATION', { timestamp: new Date().toISOString() });
    return defaults;
  }
}

export const orgStructureService = new OrgStructureService();
export default orgStructureService;
