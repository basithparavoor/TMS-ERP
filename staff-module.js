/**
 * THAIBA MODEL SCHOOL — Staff & Human Resources Module
 *
 * Registry of every employee plus full lifecycle management:
 *   - appoint new staff (creates the record AND a real login),
 *   - edit staff details,
 *   - view / edit / resend / delete the issued login credentials,
 *   - select rows and run bulk actions (delete / activate / deactivate / export),
 *   - delete a staff member together with their login.
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { UIComponents } from './ui-components.js';
import { auditService } from './audit-service.js';
import { PermissionEngine, CAPABILITIES } from './permission-engine.js';
import { staffService } from './staff-service.js';
import { exportPdf, downloadCsv } from './export-utils.js';

const ROLE_OPTIONS = [
  { value: 'teacher', label: 'Teaching Faculty' },
  { value: 'coordinator', label: 'Academic Coordinator' },
  { value: 'finance', label: 'Finance & Accounts' },
  { value: 'hr', label: 'HR & Administration' },
  { value: 'librarian', label: 'Librarian' },
  { value: 'operations', label: 'Operations & Transport' },
  { value: 'office_boy', label: 'Office Boy (Admission Data Entry)' },
  { value: 'principal', label: 'Principal' }
];

const ROLE_LABELS = ROLE_OPTIONS.reduce((acc, r) => {
  acc[r.value] = r.label;
  return acc;
}, {});

export const STAFF_IMPORT_FIELDS = [
  { key: 'empId', label: 'Employee ID', required: false, keywords: ['emp id', 'employee id', 'staff id', 'emp code', 'code'] },
  { key: 'name', label: 'Full Name', required: true, keywords: ['full name', 'employee name', 'staff name', 'faculty name', 'teacher name', 'name'] },
  { key: 'email', label: 'Official Email', required: true, keywords: ['official email', 'login email', 'email id', 'email', 'mail', 'e mail'] },
  { key: 'role', label: 'Role Category', required: false, keywords: ['role category', 'staff role', 'job role', 'role', 'category'] },
  { key: 'department', label: 'Department', required: false, keywords: ['department name', 'department', 'dept', 'stream', 'subject'] },
  { key: 'designation', label: 'Designation', required: false, keywords: ['designation title', 'job title', 'designation', 'post', 'title'] },
  { key: 'phone', label: 'Phone Number', required: false, keywords: ['phone number', 'contact number', 'mobile number', 'phone', 'mobile', 'contact'] },
  { key: 'basicPay', label: 'Basic Salary (₹)', required: false, keywords: ['basic salary', 'basic pay', 'monthly salary', 'salary', 'pay', 'ctc', 'basic'] },
  { key: 'joiningDate', label: 'Joining Date', required: false, keywords: ['joining date', 'date of joining', 'appointment date', 'joined date', 'doj', 'joined'] },
  { key: 'assignedClass', label: 'Assigned Class', required: false, keywords: ['assigned class', 'assigned grade', 'class teacher', 'class', 'grade', 'standard'] },
  { key: 'assignedSection', label: 'Assigned Section', required: false, keywords: ['assigned section', 'section', 'sec', 'division'] },
  { key: 'status', label: 'Employment Status', required: false, keywords: ['employment status', 'current status', 'status'] },
  { key: 'username', label: 'Preferred Username', required: false, keywords: ['preferred username', 'login username', 'user name', 'username', 'login id'] },
  { key: 'password', label: 'Initial Password', required: false, keywords: ['initial password', 'default password', 'password', 'pass'] }
];

const esc = (v) => UIComponents.escapeHtml(v);

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB');
}

export class StaffModule {
  static async render(container) {
    const canManage = PermissionEngine.can(CAPABILITIES.MANAGE_STAFF);

    let staff = [];
    let credentials = [];
    try {
      staff = await dbService.select('staff');
    } catch (e) {
      staff = [];
    }
    if (canManage) {
      try {
        credentials = await staffService.listCredentials();
      } catch (e) {
        credentials = [];
      }
    }
    const credByStaff = credentials.reduce((acc, c) => {
      if (c.staffId) acc[c.staffId] = c;
      return acc;
    }, {});

    this._staff = staff;
    this._credByStaff = credByStaff;

    const teachingCount = staff.filter((s) => s.role === 'teacher').length;
    const supportCount = Math.max(0, staff.length - teachingCount);
    const payrollTotal = staff.reduce((sum, s) => sum + (parseFloat(s.basicPay) || 0), 0);

    container.innerHTML = `
      <div class="tms-content-wrapper">
        ${UIComponents.renderPageHeader({
          title: 'Staff & Human Resources',
          subtitle: 'Faculty registry, departments, designations, employment contracts and login credentials.',
          breadcrumbs: [{ label: 'Staff & HR' }],
          badge: `${staff.length} Employees`,
          actionsHtml: `
            <button class="btn btn-secondary" id="btn-export-staff"><i data-lucide="file-spreadsheet"></i> Export CSV</button>
            ${canManage ? '<button class="btn btn-secondary" id="btn-bulk-staff"><i data-lucide="file-up"></i> Bulk Add Staff (CSV)</button>' : ''}
            ${canManage ? '<button class="btn btn-primary" id="btn-add-staff"><i data-lucide="user-plus"></i> Appoint New Staff</button>' : ''}
          `
        })}

      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'Total Faculty & Staff', value: `${staff.length}`, icon: 'briefcase', color: 'blue', subtitle: 'Permanent & Contracted' })}
        ${UIComponents.renderKpiCard({ title: 'Teaching Faculty', value: `${teachingCount}`, icon: 'graduation-cap', color: 'emerald', subtitle: 'High School & Secondary' })}
        ${UIComponents.renderKpiCard({ title: 'Non-Teaching / Support', value: `${supportCount}`, icon: 'wrench', color: 'amber', subtitle: 'Admin, Lab & Transport' })}
        ${UIComponents.renderKpiCard({ title: 'Monthly Payroll Budget', value: `₹ ${payrollTotal.toLocaleString()}`, icon: 'wallet', color: 'rose', subtitle: 'Authorized CTC' })}
      </div>

      <div class="card">
        <div class="card-header" style="flex-wrap:wrap; gap:12px;">
          <div>
            <h3 class="card-title">Employees Directory</h3>
            <p class="card-desc">Select rows for bulk actions, click <strong>Edit</strong> to change details or <strong>Login</strong> to view the issued credentials.</p>
          </div>
        </div>

        <!-- Compound Search & Filter Bar -->
        <div style="background:var(--bg-subtle, #f8fafc); border:1px solid var(--border-color, #e2e8f0); border-radius:12px; padding:12px 16px; margin:0 0 14px 0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; flex:1;">
            <div style="position:relative; min-width:210px; max-width:320px; flex:1;">
              <input type="text" id="staff-search-input" class="form-input form-input-sm" placeholder="Search employee, ID, email, phone..." style="padding-left:32px; height:36px; border-radius:8px;">
              <i data-lucide="search" style="position:absolute; left:10px; top:10px; width:15px; height:15px; color:#94a3b8;"></i>
            </div>

            <!-- Department Filter -->
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-size:0.73rem; font-weight:700; color:#64748b; text-transform:uppercase;">Dept:</span>
              <select id="staff-filter-dept" class="form-select form-select-sm" style="height:36px; min-width:140px; font-size:0.8rem; font-weight:600;">
                <option value="">All Departments</option>
                ${Array.from(new Set(staff.map(s => s.department).filter(Boolean))).map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('')}
              </select>
            </div>

            <!-- Role Filter -->
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-size:0.73rem; font-weight:700; color:#64748b; text-transform:uppercase;">Role:</span>
              <select id="staff-filter-role" class="form-select form-select-sm" style="height:36px; min-width:130px; font-size:0.8rem; font-weight:600;">
                <option value="">All Roles</option>
                ${Object.entries(ROLE_LABELS).map(([k, v]) => `<option value="${esc(k)}">${esc(v)}</option>`).join('')}
              </select>
            </div>

            <!-- Status Filter -->
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-size:0.73rem; font-weight:700; color:#64748b; text-transform:uppercase;">Status:</span>
              <select id="staff-filter-status" class="form-select form-select-sm" style="height:36px; min-width:115px; font-size:0.8rem; font-weight:600;">
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            <button type="button" class="btn btn-secondary btn-sm" id="btn-staff-reset-filters" style="height:36px; padding:0 10px; font-weight:700; color:#64748b;" title="Reset filters">
              <i data-lucide="rotate-ccw" style="width:13px; height:13px;"></i> Reset
            </button>
          </div>

          <div style="font-size:0.8rem; font-weight:700; color:#475569;">
            Showing <span id="staff-filtered-count" style="color:#0f172a; font-weight:800;">${staff.length}</span> of ${staff.length} employees
          </div>
        </div>

        ${canManage ? `
        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:12px;">
          <button class="btn btn-secondary btn-sm" id="btn-staff-select-all"><i data-lucide="check-square"></i> Select All</button>
          <button class="btn btn-secondary btn-sm" id="btn-staff-clear">Clear</button>
          <button class="btn btn-secondary btn-sm" id="btn-staff-bulk-activate"><i data-lucide="check-circle"></i> Set Active</button>
          <button class="btn btn-secondary btn-sm" id="btn-staff-bulk-deactivate"><i data-lucide="pause-circle"></i> Set Inactive</button>
          <button class="btn btn-secondary btn-sm" id="btn-staff-bulk-export"><i data-lucide="download"></i> Export Selected</button>
          <button class="btn btn-secondary btn-sm" id="btn-staff-bulk-delete" style="color:#ef4444;"><i data-lucide="trash-2"></i> Delete Selected (<span id="staff-selected-count">0</span>)</button>
        </div>` : ''}

        <div class="table-responsive">
          <table class="tms-table" id="staff-table">
            <thead>
              <tr>
                ${canManage ? '<th style="width:34px;"><input type="checkbox" id="staff-select-all"></th>' : ''}
                <th>Emp ID</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${staff.length ? staff.map((emp) => {
                const cred = credByStaff[emp.id];
                return `
                <tr class="staff-row" data-id="${esc(emp.id)}" data-search="${esc(`${emp.name} ${emp.empId} ${emp.email || ''} ${emp.phone || ''} ${emp.department || ''} ${emp.designation || ''}`)}" data-dept="${esc(emp.department || '')}" data-role="${esc(emp.role || '')}" data-status="${esc(emp.status || '')}">
                  ${canManage ? `<td><input type="checkbox" class="staff-row-check" value="${esc(emp.id)}"></td>` : ''}
                  <td><span class="font-mono" style="font-weight: 600;">${esc(emp.empId)}</span></td>
                  <td>
                    <strong>${esc(emp.name)}</strong>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${esc(emp.email)}</div>
                  </td>
                  <td>${esc(emp.department)}</td>
                  <td><strong>${esc(emp.designation)}</strong></td>
                  <td>${esc(ROLE_LABELS[emp.role] || emp.role || '—')}</td>
                  <td class="font-mono" style="font-size: 0.82rem;">${esc(emp.phone)}</td>
                  <td>${fmtDate(emp.joiningDate)}</td>
                  <td><span class="badge ${emp.status === 'Active' ? 'badge-success' : 'badge-warning'}">${esc(emp.status || '—')}</span></td>
                  <td>
                    ${cred
                      ? `<span class="font-mono" style="font-size:0.78rem;">${esc(cred.username)}</span>`
                      : '<span style="color:var(--text-muted);font-size:0.78rem;">No login</span>'}
                  </td>
                  <td style="white-space:nowrap;">
                    ${canManage ? `
                      <button class="btn btn-secondary btn-sm btn-edit-staff" data-id="${esc(emp.id)}" title="Edit details"><i data-lucide="pencil"></i></button>
                      <button class="btn btn-secondary btn-sm btn-login-staff" data-id="${esc(emp.id)}" title="Login credentials"><i data-lucide="key-round"></i></button>
                      <button class="btn btn-secondary btn-sm btn-del-staff" data-id="${esc(emp.id)}" title="Delete staff" style="color:#ef4444;"><i data-lucide="trash-2"></i></button>
                    ` : `
                      <button class="btn btn-secondary btn-sm" onclick="alert('Viewing service file for ${esc(emp.name)}')"><i data-lucide="file-text"></i></button>
                    `}
                  </td>
                </tr>`;
              }).join('') : `
                <tr>
                  <td colspan="${canManage ? 11 : 10}" style="text-align: center; color: var(--text-muted); padding: 30px;">No records available yet.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

    this.bindEvents(container, canManage);
    UIComponents.refreshIcons();
  }

  static bindEvents(container, canManage) {
    const staff = this._staff || [];

    const addBtn = container.querySelector('#btn-add-staff');
    if (addBtn) addBtn.addEventListener('click', () => this.openStaffModal(null, container));

    const bulkStaffBtn = container.querySelector('#btn-bulk-staff');
    if (bulkStaffBtn) bulkStaffBtn.addEventListener('click', () => this.openBulkStaffModal(container));

    container.querySelectorAll('.btn-edit-staff').forEach((b) =>
      b.addEventListener('click', () => {
        const emp = staff.find((s) => s.id === b.dataset.id);
        if (emp) this.openStaffModal(emp, container);
      }));

    container.querySelectorAll('.btn-login-staff').forEach((b) =>
      b.addEventListener('click', () => {
        const emp = staff.find((s) => s.id === b.dataset.id);
        if (emp) this.openCredentialsModal(emp, container);
      }));

    container.querySelectorAll('.btn-del-staff').forEach((b) =>
      b.addEventListener('click', () => {
        const emp = staff.find((s) => s.id === b.dataset.id);
        if (emp) this.deleteStaff([emp], container);
      }));

    const exportBtn = container.querySelector('#btn-export-staff');
    if (exportBtn) exportBtn.addEventListener('click', () => this.exportCsv(staff));

    if (!canManage) return;

    const checked = () => Array.from(container.querySelectorAll('.staff-row-check:checked')).map((c) => c.value);
    const syncCount = () => {
      const el = container.querySelector('#staff-selected-count');
      if (el) el.innerText = checked().length;
    };
    container.querySelectorAll('.staff-row-check').forEach((c) => c.addEventListener('change', syncCount));

    const selectAllBox = container.querySelector('#staff-select-all');
    if (selectAllBox) {
      selectAllBox.addEventListener('change', () => {
        container.querySelectorAll('.staff-row-check').forEach((c) => { c.checked = selectAllBox.checked; });
        syncCount();
      });
    }
    const selectAllBtn = container.querySelector('#btn-staff-select-all');
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        container.querySelectorAll('.staff-row-check').forEach((c) => { c.checked = true; });
        syncCount();
      });
    }
    const clearBtn = container.querySelector('#btn-staff-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        container.querySelectorAll('.staff-row-check').forEach((c) => { c.checked = false; });
        syncCount();
      });
    }

    const selectedStaff = () => staff.filter((s) => checked().includes(s.id));

    const bulkDelete = container.querySelector('#btn-staff-bulk-delete');
    if (bulkDelete) {
      bulkDelete.addEventListener('click', () => {
        const rows = selectedStaff();
        if (!rows.length) { UIComponents.showToast('Select at least one staff member.', 'warning'); return; }
        this.deleteStaff(rows, container);
      });
    }

    const bulkActivate = container.querySelector('#btn-staff-bulk-activate');
    if (bulkActivate) bulkActivate.addEventListener('click', () => this.bulkSetStatus(selectedStaff(), 'Active', container));

    const bulkDeactivate = container.querySelector('#btn-staff-bulk-deactivate');
    if (bulkDeactivate) bulkDeactivate.addEventListener('click', () => this.bulkSetStatus(selectedStaff(), 'Inactive', container));

    const bulkExport = container.querySelector('#btn-staff-bulk-export');
    if (bulkExport) {
      bulkExport.addEventListener('click', () => {
        const rows = selectedStaff();
        if (!rows.length) { UIComponents.showToast('Select at least one staff member.', 'warning'); return; }
        this.exportCsv(rows);
      });
    }

    // Compound Filter & Search engine
    const searchInp = container.querySelector('#staff-search-input');
    const deptFilter = container.querySelector('#staff-filter-dept');
    const roleFilter = container.querySelector('#staff-filter-role');
    const statusFilter = container.querySelector('#staff-filter-status');
    const countEl = container.querySelector('#staff-filtered-count');
    const staffRows = container.querySelectorAll('.staff-row');

    const filterStaffRows = () => {
      const q = (searchInp?.value || '').toLowerCase().trim();
      const d = (deptFilter?.value || '').toLowerCase().trim();
      const r = (roleFilter?.value || '').toLowerCase().trim();
      const s = (statusFilter?.value || '').toLowerCase().trim();
      let visible = 0;

      staffRows.forEach(row => {
        const searchTxt = (row.dataset.search || '').toLowerCase();
        const rowDept = (row.dataset.dept || '').toLowerCase();
        const rowRole = (row.dataset.role || '').toLowerCase();
        const rowStatus = (row.dataset.status || '').toLowerCase();

        const matchQ = !q || searchTxt.includes(q);
        const matchD = !d || rowDept === d;
        const matchR = !r || rowRole === r;
        const matchS = !s || rowStatus === s;

        if (matchQ && matchD && matchR && matchS) {
          row.style.display = '';
          visible++;
        } else {
          row.style.display = 'none';
        }
      });

      if (countEl) countEl.textContent = String(visible);
    };

    searchInp?.addEventListener('input', filterStaffRows);
    deptFilter?.addEventListener('change', filterStaffRows);
    roleFilter?.addEventListener('change', filterStaffRows);
    statusFilter?.addEventListener('change', filterStaffRows);

    container.querySelector('#btn-staff-reset-filters')?.addEventListener('click', () => {
      if (searchInp) searchInp.value = '';
      if (deptFilter) deptFilter.value = '';
      if (roleFilter) roleFilter.value = '';
      if (statusFilter) statusFilter.value = '';
      filterStaffRows();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Create / Edit                                                       */
  /* ------------------------------------------------------------------ */

  static nextEmpId(existing) {
    const maxSeq = existing.reduce((max, s) => {
      const m = String(s.empId || '').match(/(\d+)\s*$/);
      return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 0);
    return `TMS-EMP-${(maxSeq + 1).toString().padStart(3, '0')}`;
  }

  static openStaffModal(emp, container) {
    const isEdit = !!emp;
    const e = emp || {};
    const classes = ['', ...(TMS_CONFIG.academic && TMS_CONFIG.academic.classes ? TMS_CONFIG.academic.classes : [])];
    const sections = ['', ...(TMS_CONFIG.academic && TMS_CONFIG.academic.sections ? TMS_CONFIG.academic.sections : ['A', 'B', 'C'])];

    const bodyHtml = `
      <form id="form-new-staff">
        ${isEdit ? '' : `
        <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%); border:1px solid #bbf7d0; border-radius:10px; padding:12px 16px; margin-bottom:16px; gap:12px; flex-wrap:wrap;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:34px; height:34px; border-radius:8px; background:#16a34a; color:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <i data-lucide="users" style="width:18px; height:18px;"></i>
            </div>
            <div>
              <div style="font-weight:700; color:#14532d; font-size:0.86rem;">Onboarding Previous Staff in Bulk?</div>
              <div style="font-size:0.75rem; color:#475569; margin-top:1px;">Import multiple existing faculty &amp; staff records at once using a formatted CSV template.</div>
            </div>
          </div>
          <div style="display:flex; gap:8px; align-items:center; flex-shrink:0;">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-modal-dl-staff-template" style="background:#fff; border-color:#86efac; color:#166534; font-weight:700; font-size:0.78rem;">
              <i data-lucide="download"></i> Template CSV
            </button>
            <button type="button" class="btn btn-primary btn-sm" id="btn-modal-switch-bulk-staff" style="background:#16a34a; border-color:#16a34a; font-weight:700; font-size:0.78rem;">
              <i data-lucide="file-up"></i> Bulk Onboard (CSV)
            </button>
          </div>
        </div>`}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input class="form-input" id="stf-name" required value="${esc(e.name || '')}" placeholder="e.g. Mrs. Khadija Beevi">
          </div>
          <div class="form-group">
            <label class="form-label">Official Email *</label>
            <input type="email" class="form-input" id="stf-email" required value="${esc(e.email || '')}" placeholder="khadija@thaibaschool.edu.in">
            <span style="font-size:0.7rem; color:var(--text-subtle);">This becomes their sign-in account e-mail.</span>
          </div>
          <div class="form-group">
            <label class="form-label">Role Category</label>
            <select class="form-select" id="stf-role">
              ${ROLE_OPTIONS.map((r) => `<option value="${esc(r.value)}" ${e.role === r.value ? 'selected' : ''}>${esc(r.label)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Department *</label>
            <input class="form-input" id="stf-dept" required value="${esc(e.department || '')}" placeholder="e.g. Science / English / IT">
          </div>
          <div class="form-group">
            <label class="form-label">Designation *</label>
            <input class="form-input" id="stf-desig" required value="${esc(e.designation || '')}" placeholder="e.g. PGT Physics">
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input class="form-input" id="stf-phone" value="${esc(e.phone || '')}" placeholder="+91 98470 12345">
          </div>
          <div class="form-group">
            <label class="form-label">Basic Salary (₹)</label>
            <input type="number" class="form-input" id="stf-salary" value="${e.basicPay != null ? esc(e.basicPay) : ''}" placeholder="35000">
          </div>
          <div class="form-group">
            <label class="form-label">Joining Date</label>
            <input type="date" class="form-input" id="stf-joining" value="${esc((e.joiningDate || new Date().toISOString()).slice(0, 10))}">
          </div>
          <div class="form-group">
            <label class="form-label">Assigned Class</label>
            <select class="form-select" id="stf-class">
              ${classes.map((c) => `<option value="${esc(c)}" ${e.assignedClass === c ? 'selected' : ''}>${c ? esc(c) : '—'}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Assigned Section</label>
            <select class="form-select" id="stf-section">
              ${sections.map((s) => `<option value="${esc(s)}" ${e.assignedSection === s ? 'selected' : ''}>${s || '—'}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Employment Status</label>
            <select class="form-select" id="stf-status">
              <option ${e.status === 'Active' || !e.status ? 'selected' : ''}>Active</option>
              <option ${e.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
              <option ${e.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
              <option ${e.status === 'Resigned' ? 'selected' : ''}>Resigned</option>
            </select>
          </div>
          ${isEdit ? '' : `
          <div class="form-group" style="grid-column:1/-1; border-top:1px solid var(--border-color); padding-top:12px;">
            <label class="form-label">Login Credentials</label>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <input class="form-input font-mono" id="stf-username" placeholder="Username (auto-generated if blank)">
              <input class="form-input font-mono" id="stf-password" placeholder="Password (auto-generated if blank)">
            </div>
            <span style="font-size:0.72rem; color:var(--text-subtle);">A username and password are generated automatically, shown to you after saving, and listed in Admin → Users &amp; Roles.</span>
          </div>`}
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" id="btn-cancel-staff">Cancel</button>
      <button class="btn btn-primary" id="btn-save-staff"><i data-lucide="save"></i> ${isEdit ? 'Save Changes' : 'Issue Appointment'}</button>
    `;

    UIComponents.openModal({
      title: isEdit ? `Edit Staff — ${e.name || ''}` : 'Appoint New Staff Member',
      bodyHtml,
      footerHtml
    });

    document.getElementById('btn-cancel-staff').addEventListener('click', () => UIComponents.closeModal());
    document.getElementById('btn-save-staff').addEventListener('click', async () => {
      if (isEdit) await this.saveStaffEdit(e, container);
      else await this.createStaff(container);
    });

    if (!isEdit) {
      document.getElementById('btn-modal-dl-staff-template')?.addEventListener('click', (ev) => {
        ev.preventDefault();
        StaffModule.downloadStaffTemplate();
      });
      document.getElementById('btn-modal-switch-bulk-staff')?.addEventListener('click', (ev) => {
        ev.preventDefault();
        UIComponents.closeModal();
        StaffModule.openBulkStaffModal(container);
      });
    }
    UIComponents.refreshIcons();
  }

  static readStaffForm() {
    return {
      name: document.getElementById('stf-name').value.trim(),
      email: document.getElementById('stf-email').value.trim(),
      role: document.getElementById('stf-role').value,
      department: document.getElementById('stf-dept').value.trim(),
      designation: document.getElementById('stf-desig').value.trim(),
      phone: document.getElementById('stf-phone').value.trim(),
      basicPay: parseFloat(document.getElementById('stf-salary').value) || 0,
      joiningDate: document.getElementById('stf-joining').value,
      assignedClass: document.getElementById('stf-class').value,
      assignedSection: document.getElementById('stf-section').value,
      status: document.getElementById('stf-status').value
    };
  }

  static async createStaff(container) {
    const form = this.readStaffForm();
    if (!form.name || !form.email) {
      UIComponents.showToast('Please enter the employee name and email.', 'warning');
      return;
    }

    const usernameInput = document.getElementById('stf-username');
    const passwordInput = document.getElementById('stf-password');
    const customUsername = usernameInput ? usernameInput.value.trim() : '';
    const customPassword = passwordInput ? passwordInput.value : '';

    const existing = this._staff || [];
    if (existing.some((s) => String(s.email || '').toLowerCase() === form.email.toLowerCase())) {
      UIComponents.showToast('A staff member with this email already exists.', 'warning');
      return;
    }
    if (customUsername && await staffService.usernameTaken(customUsername)) {
      UIComponents.showToast('That username is already taken. Please choose another.', 'warning');
      return;
    }

    const empId = this.nextEmpId(existing);

    const record = await dbService.insert('staff', {
      empId,
      name: form.name,
      email: form.email,
      role: form.role,
      department: form.department,
      designation: form.designation,
      phone: form.phone,
      basicPay: form.basicPay,
      joiningDate: form.joiningDate || null,
      assignedClass: form.assignedClass || null,
      assignedSection: form.assignedSection || null,
      status: form.status || 'Active'
    });

    if (record._syncError) {
      UIComponents.showToast(`Appointment could not be saved: ${record._syncError}`, 'danger');
      return;
    }

    UIComponents.showToast('Staff saved. Creating login…', 'info');

    const provision = await staffService.provision({
      staffId: record.id,
      name: form.name,
      email: form.email,
      role: form.role,
      title: form.designation,
      department: form.department,
      assignedClass: form.assignedClass || null,
      assignedSection: form.assignedSection || null,
      username: customUsername || null,
      password: customPassword || null
    });

    if (provision.userId) {
      await dbService.update('staff', record.id, { userId: provision.userId });
    }

    await auditService.log('STAFF_APPOINTED', 'HR', {
      empId, name: form.name, designation: form.designation, department: form.department,
      username: provision.username || null, loginCreated: !!provision.userId
    }, record.id);

    UIComponents.closeModal();

    if (provision.userId) {
      this.showCredentialsModal({
        name: form.name,
        email: form.email,
        username: provision.username,
        password: provision.password,
        title: 'Staff Login Created'
      });
      UIComponents.showToast(`${form.name} appointed — login created and added to Users & Roles.`, 'success');
    } else {
      UIComponents.showToast(
        `Staff saved, but the login could not be created: ${provision.error || 'unknown error'}`,
        'warning'
      );
      if (provision.profileError) console.warn('Profile provisioning issue:', provision.profileError);
    }

    await StaffModule.render(container);
  }

  static async saveStaffEdit(emp, container) {
    const form = this.readStaffForm();
    if (!form.name || !form.email) {
      UIComponents.showToast('Please enter the employee name and email.', 'warning');
      return;
    }

    const updated = await dbService.update('staff', emp.id, {
      name: form.name,
      email: form.email,
      role: form.role,
      department: form.department,
      designation: form.designation,
      phone: form.phone,
      basicPay: form.basicPay,
      joiningDate: form.joiningDate || null,
      assignedClass: form.assignedClass || null,
      assignedSection: form.assignedSection || null,
      status: form.status
    });

    if (updated && updated._syncError) {
      UIComponents.showToast(`Could not save changes: ${updated._syncError}`, 'danger');
      return;
    }

    // Keep the linked login profile (Users & Roles) in sync.
    if (emp.userId) {
      await staffService.applyProfile(emp.userId, {
        name: form.name,
        email: form.email,
        role: form.role,
        title: form.designation,
        department: form.department,
        assignedClass: form.assignedClass || null,
        assignedSection: form.assignedSection || null
      });
      const cred = (this._credByStaff || {})[emp.id];
      if (cred && form.email && form.email !== cred.email) {
        await staffService.updateCredentials(cred, { email: form.email });
      }
    }

    await auditService.log('STAFF_UPDATED', 'HR', { staffId: emp.id, name: form.name, role: form.role }, emp.id);
    UIComponents.showToast('Staff details updated.', 'success');
    UIComponents.closeModal();
    await StaffModule.render(container);
  }

  /* ------------------------------------------------------------------ */
  /* Credentials                                                         */
  /* ------------------------------------------------------------------ */

  static showCredentialsModal({ name, email, username, password, title }) {
    const bodyHtml = `
      <div style="border:1.5px dashed #b45309; border-radius:10px; padding:16px; background:#fffbeb;">
        <div style="font-weight:800; font-size:1rem; margin-bottom:10px;">${esc(title || 'Login Credentials')}</div>
        <table class="tms-table" style="font-size:0.9rem; background:transparent;">
          <tbody>
            <tr><th style="text-align:left;">Name</th><td>${esc(name || '—')}</td></tr>
            <tr><th style="text-align:left;">Username</th><td><strong class="font-mono" id="cred-out-username">${esc(username || '—')}</strong></td></tr>
            <tr><th style="text-align:left;">Password</th><td><strong class="font-mono" id="cred-out-password">${esc(password || '—')}</strong></td></tr>
            <tr><th style="text-align:left;">Sign-in e-mail</th><td class="font-mono">${esc(email || '—')}</td></tr>
          </tbody>
        </table>
        <p style="font-size:0.78rem; color:#92400e; margin-top:10px;">
          Note these down and hand them to the staff member. They can sign in with the username or the e-mail above.
          The account also appears in Admin → Users &amp; Roles.
        </p>
      </div>
    `;
    const footerHtml = `
      <button class="btn btn-secondary" id="cred-copy"><i data-lucide="copy"></i> Copy</button>
      <button class="btn btn-secondary" id="cred-print"><i data-lucide="printer"></i> Print Slip</button>
      <button class="btn btn-primary" id="cred-done">Done</button>
    `;
    UIComponents.openModal({ title: 'Staff Login Credentials', bodyHtml, footerHtml });

    document.getElementById('cred-done').addEventListener('click', () => UIComponents.closeModal());
    document.getElementById('cred-copy').addEventListener('click', async () => {
      const text = `THAIBA MODEL SCHOOL — Staff Login\nName: ${name}\nUsername: ${username}\nPassword: ${password}\nE-mail: ${email}`;
      try {
        await navigator.clipboard.writeText(text);
        UIComponents.showToast('Credentials copied.', 'success');
      } catch (e) {
        UIComponents.showToast('Copy failed — please note them manually.', 'warning');
      }
    });
    document.getElementById('cred-print').addEventListener('click', () => {
      const filename = `TMS_Staff_Login_${(username || 'staff').replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      const portalUrl = (typeof window !== 'undefined' && window.location.origin) ? `${window.location.origin}/login` : 'https://www.thaibagarden.com/login';
      const body = `
        <div style="border: 1.5px solid #16a34a; background: #f0fdf4; border-radius: 8px; padding: 14px 18px; margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #bbf7d0; padding-bottom: 6px; margin-bottom: 10px;">
            <div style="font-size: 12px; font-weight: 800; color: #166534; text-transform: uppercase;">
              🔐 Faculty &amp; Staff Authorized Portal Access Slip
            </div>
            <span class="badge badge-success" style="font-size: 9px;">CONFIDENTIAL</span>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px;">
            <tbody>
              <tr>
                <th style="width: 28%; padding: 6px 10px; text-align: left; background: #f8fafc; border: 1px solid #cbd5e1;">Staff Member Name</th>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1;"><strong>${esc(name || '—')}</strong></td>
              </tr>
              <tr>
                <th style="padding: 6px 10px; text-align: left; background: #f8fafc; border: 1px solid #cbd5e1;">Sign-In Username</th>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1;"><strong class="font-mono" style="font-size: 13px; color: #15803d; background: #fff; padding: 2px 8px; border: 1px solid #86efac; border-radius: 4px;">${esc(username)}</strong></td>
              </tr>
              <tr>
                <th style="padding: 6px 10px; text-align: left; background: #f8fafc; border: 1px solid #cbd5e1;">Temporary Password</th>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1;"><strong class="font-mono" style="font-size: 13px; color: #0f172a; background: #fff; padding: 2px 8px; border: 1px solid #86efac; border-radius: 4px;">${esc(password)}</strong></td>
              </tr>
              <tr>
                <th style="padding: 6px 10px; text-align: left; background: #f8fafc; border: 1px solid #cbd5e1;">Sign-in Email</th>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace;">${esc(email)}</td>
              </tr>
              <tr>
                <th style="padding: 6px 10px; text-align: left; background: #f8fafc; border: 1px solid #cbd5e1;">Portal Access URL</th>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #15803d;"><strong>${esc(portalUrl)}</strong></td>
              </tr>
            </tbody>
          </table>

          <div style="font-size: 9px; color: #475569; line-height: 1.4; background: #ffffff; padding: 8px 12px; border: 1px dashed #cbd5e1; border-radius: 6px;">
            <strong>Security Notice:</strong> Keep these credentials strictly confidential. Sign in to update your security settings. All administrative operations are logged in the campus audit trail.
          </div>
        </div>
      `;
      exportPdf(filename, body, {
        filename,
        title: 'Staff Portal Authentication Credential Slip',
        subtitle: `Issued To: ${name || 'Staff'}`,
        badge: 'Confidential Issue',
        showHeader: true,
        showFooter: true,
        signatures: ['Authorized Administrator', 'Staff Member Acknowledgement']
      });
    });
    UIComponents.refreshIcons();
  }

  static async openCredentialsModal(emp, container) {
    let cred = await staffService.getCredentials(emp.id);

    if (!cred) {
      const bodyHtml = `
        <p style="margin-bottom:14px;">No login has been issued for <strong>${esc(emp.name)}</strong> yet.</p>
        <div class="form-group">
          <label class="form-label">Username (blank = auto)</label>
          <input class="form-input font-mono" id="cu-username">
        </div>
        <div class="form-group">
          <label class="form-label">Password (blank = auto)</label>
          <input class="form-input font-mono" id="cu-password">
        </div>
      `;
      const footerHtml = `
        <button class="btn btn-secondary" id="cu-cancel">Cancel</button>
        <button class="btn btn-primary" id="cu-create"><i data-lucide="user-plus"></i> Create Login</button>
      `;
      UIComponents.openModal({ title: `Login — ${emp.name}`, bodyHtml, footerHtml });
      document.getElementById('cu-cancel').addEventListener('click', () => UIComponents.closeModal());
      document.getElementById('cu-create').addEventListener('click', async () => {
        const username = document.getElementById('cu-username').value.trim() || null;
        const password = document.getElementById('cu-password').value || null;
        const res = await staffService.provision({
          staffId: emp.id,
          name: emp.name,
          email: emp.email,
          role: emp.role,
          title: emp.designation,
          department: emp.department,
          assignedClass: emp.assignedClass,
          assignedSection: emp.assignedSection,
          username,
          password
        });
        if (!res.userId) {
          UIComponents.showToast(`Could not create the login: ${res.error || 'unknown error'}`, 'danger');
          return;
        }
        await dbService.update('staff', emp.id, { userId: res.userId });
        await auditService.log('STAFF_LOGIN_CREATED', 'HR', { staffId: emp.id, username: res.username }, emp.id);
        UIComponents.closeModal();
        this.showCredentialsModal({ name: emp.name, email: emp.email, username: res.username, password: res.password, title: 'Staff Login Created' });
        await StaffModule.render(container);
      });
      UIComponents.refreshIcons();
      return;
    }

    cred = { ...cred };
    const bodyHtml = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input class="form-input font-mono" id="cu-username" value="${esc(cred.username || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Sign-in e-mail</label>
          <input class="form-input font-mono" id="cu-email" value="${esc(cred.email || emp.email || '')}">
        </div>
        <div class="form-group" style="grid-column:1/-1;">
          <label class="form-label">Password</label>
          <input class="form-input font-mono" id="cu-password" value="${esc(cred.password || '')}">
          <span style="font-size:0.72rem; color:var(--text-subtle);">Changing the password here also updates the real sign-in password.</span>
        </div>
        <div style="grid-column:1/-1; font-size:0.78rem; color:var(--text-muted);">
          Linked user account: <span class="font-mono">${esc(cred.userId || 'not linked')}</span>
        </div>
        ${cred.userId ? '' : `
        <div style="grid-column:1/-1; padding:10px 12px; border-radius:8px; background:#fffbeb; border:1px solid #fcd34d; color:#92400e; font-size:0.78rem;">
          This login has not been created in the authentication system yet. Click
          <strong>Activate Login</strong> to create it (needed before the staff member can sign in).
        </div>`}
      </div>
    `;
    const footerHtml = `
      <button class="btn btn-secondary" id="cu-cancel">Close</button>
      ${cred.userId ? '' : '<button class="btn btn-primary" id="cu-activate"><i data-lucide="key-round"></i> Activate Login</button>'}
      <button class="btn btn-secondary" id="cu-delete" style="color:#ef4444;"><i data-lucide="trash-2"></i> Delete Login</button>
      <button class="btn btn-primary" id="cu-save"><i data-lucide="save"></i> Save Credentials</button>
    `;
    UIComponents.openModal({ title: `Login — ${emp.name}`, bodyHtml, footerHtml });

    document.getElementById('cu-cancel').addEventListener('click', () => UIComponents.closeModal());

    const activateBtn = document.getElementById('cu-activate');
    if (activateBtn) {
      activateBtn.addEventListener('click', async () => {
        activateBtn.disabled = true;
        activateBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Activating…';
        UIComponents.refreshIcons();
        const username = document.getElementById('cu-username').value.trim() || cred.username;
        const email = document.getElementById('cu-email').value.trim() || cred.email;
        const password = document.getElementById('cu-password').value || cred.password;
        const res = await staffService.provision({
          staffId: emp.id,
          name: emp.name,
          email,
          role: emp.role,
          title: emp.designation,
          department: emp.department,
          assignedClass: emp.assignedClass,
          assignedSection: emp.assignedSection,
          username,
          password
        });
        if (!res.userId) {
          UIComponents.showToast(`Could not activate the login: ${res.error || 'unknown error'}`, 'danger');
          activateBtn.disabled = false;
          activateBtn.innerHTML = '<i data-lucide="key-round"></i> Activate Login';
          UIComponents.refreshIcons();
          return;
        }
        await dbService.update('staff', emp.id, { userId: res.userId });
        await auditService.log('STAFF_LOGIN_ACTIVATED', 'HR', { staffId: emp.id, username: res.username }, emp.id);
        UIComponents.closeModal();
        this.showCredentialsModal({ name: emp.name, email, username: res.username, password: res.password, title: 'Staff Login Activated' });
        await StaffModule.render(container);
      });
    }
    document.getElementById('cu-save').addEventListener('click', async () => {
      const username = document.getElementById('cu-username').value.trim();
      const email = document.getElementById('cu-email').value.trim();
      const password = document.getElementById('cu-password').value;
      if (!username || !email) { UIComponents.showToast('Username and e-mail are required.', 'warning'); return; }
      const res = await staffService.updateCredentials(cred, { username, email, password, role: emp.role });
      if (res.error) { UIComponents.showToast(`Could not save credentials: ${res.error}`, 'danger'); return; }
      await auditService.log('STAFF_CREDENTIALS_UPDATED', 'HR', { staffId: emp.id, username }, emp.id);
      UIComponents.showToast('Credentials updated.', 'success');
      UIComponents.closeModal();
      await StaffModule.render(container);
    });
    document.getElementById('cu-delete').addEventListener('click', async () => {
      if (!confirm('Delete this staff login? The staff record will be kept but they will no longer be able to sign in.')) return;
      await staffService.removeCredentials(emp.id);
      const del = await staffService.deleteUserAccount(cred.userId);
      if (!del.success) UIComponents.showToast(`Credentials removed, but the login account could not be deleted: ${del.error}`, 'warning');
      if (del.success) await dbService.update('staff', emp.id, { userId: null });
      await auditService.log('STAFF_CREDENTIALS_DELETED', 'HR', { staffId: emp.id }, emp.id);
      UIComponents.showToast('Staff login deleted.', 'success');
      UIComponents.closeModal();
      await StaffModule.render(container);
    });
    UIComponents.refreshIcons();
  }

  /* ------------------------------------------------------------------ */
  /* Delete / bulk                                                       */
  /* ------------------------------------------------------------------ */

  static async deleteStaff(rows, container) {
    const names = rows.map((r) => r.name).join(', ');
    const label = rows.length === 1 ? `Delete ${names}?` : `Delete ${rows.length} staff members?`;
    if (!confirm(`${label}\n\nThis removes their employee record, login credentials and portal account. This cannot be undone.`)) return;

    for (const emp of rows) {
      // eslint-disable-next-line no-await-in-loop
      const cred = await staffService.getCredentials(emp.id);
      // eslint-disable-next-line no-await-in-loop
      if (cred) await staffService.removeCredentials(emp.id);
      // eslint-disable-next-line no-await-in-loop
      const del = await staffService.deleteUserAccount(emp.userId || (cred && cred.userId));
      if (!del.success && del.error) {
        UIComponents.showToast(`Login for ${emp.name} could not be removed: ${del.error}`, 'warning');
      }
      // eslint-disable-next-line no-await-in-loop
      await dbService.delete('staff', emp.id);
      // eslint-disable-next-line no-await-in-loop
      await auditService.log('STAFF_DELETED', 'HR', { staffId: emp.id, empId: emp.empId, name: emp.name }, emp.id);
    }

    UIComponents.showToast(`${rows.length} staff member(s) deleted.`, 'success');
    await StaffModule.render(container);
  }

  static async bulkSetStatus(rows, status, container) {
    if (!rows.length) { UIComponents.showToast('Select at least one staff member.', 'warning'); return; }
    for (const emp of rows) {
      // eslint-disable-next-line no-await-in-loop
      await dbService.update('staff', emp.id, { status });
      if (emp.userId) {
        // Reflect the active flag on the linked login too.
        // eslint-disable-next-line no-await-in-loop
        await dbService.update('profiles', emp.userId, { isActive: status === 'Active' });
      }
    }
    await auditService.log('STAFF_BULK_STATUS', 'HR', { status, count: rows.length });
    UIComponents.showToast(`${rows.length} staff member(s) set to ${status}.`, 'success');
    await StaffModule.render(container);
  }

  static exportCsv(rows) {
    const list = rows || [];
    if (!list.length) { UIComponents.showToast('Nothing to export.', 'warning'); return; }
    const header = ['Emp ID', 'Name', 'Email', 'Role', 'Department', 'Designation', 'Phone', 'Joined', 'Status', 'Username'];
    const data = list.map((s) => {
      const cred = (this._credByStaff || {})[s.id];
      return [
        s.empId, s.name, s.email, s.role, s.department, s.designation,
        s.phone, s.joiningDate, s.status, cred ? cred.username : ''
      ];
    });
    downloadCsv(`TMS-Staff-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...data]);
    UIComponents.showToast('Staff CSV exported.', 'success');
  }

  /* ------------------------------------------------------------------ */
  /* Bulk Staff Onboarding & CSV Import                                 */
  /* ------------------------------------------------------------------ */

  static parseCsv(text) {
    const lines = [];
    let row = [''];
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];
      if (c === '"') {
        if (inQuotes && next === '"') {
          row[row.length - 1] += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push('');
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') i++;
        if (row.length > 1 || row[0] !== '') lines.push(row);
        row = [''];
      } else {
        row[row.length - 1] += c;
      }
    }
    if (row.length > 1 || row[0] !== '') lines.push(row);
    return lines;
  }

  static normalizeDate(val) {
    if (!val) return null;
    const s = String(val).trim();
    if (!s) return null;
    const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmy) {
      const day = dmy[1].padStart(2, '0');
      const month = dmy[2].padStart(2, '0');
      const year = dmy[3];
      return `${year}-${month}-${day}`;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      return s.slice(0, 10);
    }
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
    return null;
  }

  static normalizeRole(roleInput) {
    const r = String(roleInput || '').toLowerCase().trim();
    if (!r) return 'teacher';
    if (r.includes('teach') || r.includes('faculty') || r.includes('pgt') || r.includes('tgt') || r.includes('prt')) return 'teacher';
    if (r.includes('coord')) return 'coordinator';
    if (r.includes('finan') || r.includes('account') || r.includes('cashier')) return 'finance';
    if (r.includes('hr') || r.includes('human')) return 'hr';
    if (r.includes('lib')) return 'librarian';
    if (r.includes('operat') || r.includes('transp') || r.includes('driver')) return 'operations';
    if (r.includes('boy') || r.includes('peon') || r.includes('data entry') || r.includes('office')) return 'office_boy';
    if (r.includes('princ') || r.includes('head') || r.includes('director')) return 'principal';
    if (ROLE_LABELS[r]) return r;
    return 'teacher';
  }

  static downloadStaffTemplate() {
    const headers = [
      'Full Name',
      'Official Email',
      'Role Category',
      'Department',
      'Designation',
      'Phone Number',
      'Basic Salary (INR)',
      'Joining Date (YYYY-MM-DD)',
      'Assigned Class',
      'Assigned Section',
      'Employment Status',
      'Preferred Username (Optional)',
      'Initial Password (Optional)'
    ];

    const sampleRows = [
      [
        'Mrs. Khadija Beevi',
        'khadija@thaibaschool.edu.in',
        'Teaching Faculty',
        'Science',
        'PGT Physics',
        '+91 98470 12345',
        '35000',
        '2021-06-01',
        'Grade 9',
        'A',
        'Active',
        'khadija.beevi',
        'Thaiba@2026'
      ],
      [
        'Mr. Mohammed Salman',
        'salman@thaibaschool.edu.in',
        'Teaching Faculty',
        'Mathematics',
        'TGT Mathematics',
        '+91 98470 54321',
        '32000',
        '2022-08-15',
        'Grade 8',
        'B',
        'Active',
        'salman.math',
        ''
      ],
      [
        'Mr. Abdul Rasheed',
        'rasheed@thaibaschool.edu.in',
        'Finance & Accounts',
        'Accounts',
        'Senior Accountant',
        '+91 98470 67890',
        '28000',
        '2020-03-10',
        '',
        '',
        'Active',
        'rasheed.acc',
        ''
      ],
      [
        'Dr. Farooq Ahmed',
        'farooq@thaibaschool.edu.in',
        'Academic Coordinator',
        'Academics',
        'Senior Academic Coordinator',
        '+91 98470 33445',
        '42000',
        '2019-07-01',
        '',
        '',
        'Active',
        '',
        ''
      ]
    ];

    downloadCsv('Staff_Bulk_Import_Template', [headers, ...sampleRows]);
    UIComponents.showToast('Staff Bulk Import CSV Template downloaded.', 'success');
  }

  static showBulkCredentialsModal(credentialsList, totalImported) {
    const list = credentialsList || [];
    const bodyHtml = `
      <div style="border:1.5px solid #10b981; border-radius:10px; padding:16px; background:#f0fdf4;">
        <div style="font-weight:800; font-size:1.05rem; color:#065f46; margin-bottom:8px; display:flex; align-items:center; gap:8px;">
          <i data-lucide="check-circle" style="color:#059669; width:22px; height:22px;"></i>
          Successfully Appointed ${totalImported} Staff Member(s)!
        </div>
        <p style="font-size:0.82rem; color:#166534; margin:0 0 14px 0;">
          ${list.length} staff login credentials have been provisioned and configured in <strong>Admin → Users &amp; Roles</strong>.
          You can download this master credentials report to securely distribute account details to staff.
        </p>
        <div class="table-responsive" style="max-height:240px; overflow-y:auto; border:1px solid #bbf7d0; border-radius:8px; background:#fff;">
          <table class="tms-table" style="font-size:0.8rem;">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Full Name</th>
                <th>Username</th>
                <th>Initial Password</th>
                <th>Official Email</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(c => `
                <tr>
                  <td class="font-mono">${esc(c.empId)}</td>
                  <td style="font-weight:600;">${esc(c.name)}</td>
                  <td class="font-mono" style="color:#2563eb; font-weight:700;">${esc(c.username)}</td>
                  <td class="font-mono" style="color:#059669; font-weight:700;">${esc(c.password)}</td>
                  <td class="font-mono" style="color:#64748b;">${esc(c.email)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" id="btn-dl-cred-report"><i data-lucide="download"></i> Download Credentials Master (CSV)</button>
      <button class="btn btn-primary" id="btn-bulk-cred-done">Done</button>
    `;

    UIComponents.openModal({ title: 'Staff Onboarding & Credentials Master', bodyHtml, footerHtml, maxWidth: '800px' });

    document.getElementById('btn-bulk-cred-done')?.addEventListener('click', () => UIComponents.closeModal());
    document.getElementById('btn-dl-cred-report')?.addEventListener('click', () => {
      const headers = ['Emp ID', 'Full Name', 'Official Email', 'Role', 'Department', 'Designation', 'Username', 'Initial Password'];
      const rows = list.map(c => [
        c.empId, c.name, c.email, c.role || '', c.department || '', c.designation || '', c.username, c.password
      ]);
      downloadCsv(`TMS_Staff_Logins_Master_${new Date().toISOString().slice(0, 10)}`, [headers, ...rows]);
      UIComponents.showToast('Credentials master CSV downloaded.', 'success');
    });
    UIComponents.refreshIcons();
  }

  static openBulkStaffModal(container) {
    const bodyHtml = `
      <div style="max-width:880px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid var(--border-color); flex-wrap:wrap; gap:10px;">
          <div>
            <div style="font-weight:800; font-size:1.05rem; color:#0f172a;">Bulk Onboard Faculty &amp; Staff Members</div>
            <div style="font-size:0.78rem; color:var(--text-muted);">Quickly import multiple previous or existing staff records and optionally generate secure logins.</div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-switch-single-appoint" style="display:inline-flex; align-items:center; gap:6px; font-weight:600;">
            <i data-lucide="user-plus"></i> Switch to Single Appointment
          </button>
        </div>

        <!-- Step 1: Download Template Card -->
        <div class="card" style="margin-bottom:16px; border:1px solid #bfdbfe; background:#f8fafc; border-radius:10px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
            <div>
              <h4 style="font-size:0.92rem; font-weight:800; color:#1e40af; margin:0 0 4px 0; display:flex; align-items:center; gap:6px;">
                <i data-lucide="download" style="width:16px; height:16px; color:#2563eb;"></i> 1. Download Staff CSV Template
              </h4>
              <div style="font-size:0.77rem; color:#475569; max-width:580px; line-height:1.45;">
                Download the verified CSV template with sample data for Teaching Faculty, Coordinators, Finance, HR, and Support staff. Fill in your existing staff data in Excel or Google Sheets.
              </div>
              <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap; font-size:0.72rem;">
                <span style="background:#dbeafe; color:#1e40af; padding:2px 8px; border-radius:4px; font-weight:700;">Required: Full Name, Official Email</span>
                <span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px;">Auto: TMS-EMP-XXX ID</span>
                <span style="background:#f0fdf4; color:#166534; padding:2px 8px; border-radius:4px;">Auto: Secure Login Credentials</span>
              </div>
            </div>
            <button type="button" class="btn btn-primary btn-sm" id="btn-dl-staff-template" style="background:#2563eb; border-color:#2563eb; display:inline-flex; align-items:center; gap:6px; font-weight:700;">
              <i data-lucide="download"></i> Download Template (.csv)
            </button>
          </div>
        </div>

        <!-- Step 2: Upload CSV File Card -->
        <div class="card" style="margin-bottom:16px; border:1px solid var(--border-color); border-radius:10px; padding:16px;">
          <h4 style="font-size:0.92rem; font-weight:800; color:#0f172a; margin:0 0 6px 0; display:flex; align-items:center; gap:6px;">
            <i data-lucide="file-up" style="width:16px; height:16px; color:#16a34a;"></i> 2. Upload Completed Staff CSV (.csv)
          </h4>
          <div style="font-size:0.77rem; color:var(--text-muted); margin-bottom:10px;">
            Upload your filled CSV file. Names, emails, roles, salary, dates, and designations are automatically detected and formatted.
          </div>
          <input type="file" id="staff-bulk-file-input" accept=".csv,text/csv" class="form-input" style="padding:10px; border-radius:8px;">
          <div id="staff-detected-cols-strip" style="display:none; margin-top:8px; font-size:0.78rem; color:#15803d; font-weight:600; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px 12px;"></div>
        </div>

        <!-- Step 3: Preview Area -->
        <div id="staff-import-preview-area" style="display:none;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
            <div id="staff-import-stats-bar" style="display:flex; gap:8px; flex-wrap:wrap;"></div>
            <div style="display:flex; gap:14px; align-items:center; flex-wrap:wrap;">
              <label style="display:inline-flex; align-items:center; gap:6px; font-size:0.78rem; font-weight:600; color:#1e293b; cursor:pointer;">
                <input type="checkbox" id="chk-staff-create-logins" checked style="width:15px; height:15px;">
                Auto-create logins &amp; credentials
              </label>
              <label style="display:inline-flex; align-items:center; gap:6px; font-size:0.78rem; font-weight:600; color:#1e293b; cursor:pointer;">
                <input type="checkbox" id="chk-staff-skip-duplicates" checked style="width:15px; height:15px;">
                Skip existing emails
              </label>
            </div>
          </div>

          <div style="font-weight:700; font-size:0.84rem; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
            <span>Preview Records (First 15):</span>
            <span style="font-size:0.72rem; color:var(--text-muted); font-weight:400;">Columns automatically matched from your uploaded file</span>
          </div>

          <div class="table-responsive" style="max-height:260px; overflow-y:auto; border:1px solid var(--border-color); border-radius:8px;">
            <table class="tms-table" style="font-size:0.78rem;" id="staff-import-preview-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Emp ID</th>
                  <th>Full Name</th>
                  <th>Official Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Class / Sec</th>
                  <th>Basic Salary</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody id="staff-import-preview-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" id="btn-cancel-bulk-staff">Cancel</button>
      <button class="btn btn-primary" id="btn-confirm-bulk-staff" disabled style="display:inline-flex; align-items:center; gap:6px; background:#16a34a; border-color:#16a34a;">
        <i data-lucide="upload-cloud"></i> Import Staff Members
      </button>
    `;

    UIComponents.openModal({
      title: 'Bulk Onboard Staff Members (CSV)',
      bodyHtml,
      footerHtml,
      maxWidth: '880px'
    });

    document.getElementById('btn-cancel-bulk-staff')?.addEventListener('click', () => UIComponents.closeModal());
    document.getElementById('btn-switch-single-appoint')?.addEventListener('click', () => {
      UIComponents.closeModal();
      StaffModule.openStaffModal(null, container);
    });

    document.getElementById('btn-dl-staff-template')?.addEventListener('click', () => {
      StaffModule.downloadStaffTemplate();
    });

    let parsedStaffToImport = [];

    const fileInput = document.getElementById('staff-bulk-file-input');
    fileInput?.addEventListener('change', async (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;

      const text = await file.text();
      const rows = StaffModule.parseCsv(text);
      if (rows.length < 2) {
        UIComponents.showToast('CSV file is empty or missing headers.', 'warning');
        return;
      }

      const headers = rows[0].map(h => (h || '').toLowerCase().trim());
      const colMap = {};

      const matchHeader = (h) => {
        const cleanH = (h || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().replace(/\s+/g, ' ');

        // Pass 1: Exact matches against label or keywords
        for (const f of STAFF_IMPORT_FIELDS) {
          const fLabel = f.label.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().replace(/\s+/g, ' ');
          if (cleanH === fLabel) return f;
          if (f.keywords) {
            for (const k of f.keywords) {
              const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().replace(/\s+/g, ' ');
              if (cleanH === cleanK) return f;
            }
          }
        }

        // Pass 2: Partial matches with boundary safety
        let bestMatch = null;
        let bestLen = 0;
        for (const f of STAFF_IMPORT_FIELDS) {
          if (f.keywords) {
            for (const k of f.keywords) {
              const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().replace(/\s+/g, ' ');
              if (cleanK === 'name' && cleanH.includes('user')) continue;
              if (cleanH.includes(cleanK) || cleanK.includes(cleanH)) {
                if (cleanK.length > bestLen) {
                  bestLen = cleanK.length;
                  bestMatch = f;
                }
              }
            }
          }
        }
        return bestMatch;
      };

      headers.forEach((h, colIdx) => {
        const matched = matchHeader(h);
        if (matched && colMap[matched.key] === undefined) {
          colMap[matched.key] = colIdx;
        }
      });

      const detectedStrip = document.getElementById('staff-detected-cols-strip');
      if (detectedStrip) {
        const detectedKeys = Object.keys(colMap);
        const matchedLabels = detectedKeys.map(k => {
          const f = STAFF_IMPORT_FIELDS.find(x => x.key === k);
          return f ? f.label : k;
        });
        detectedStrip.style.display = 'block';
        detectedStrip.innerHTML = `<i data-lucide="check-circle-2" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> Detected ${detectedKeys.length} column(s): <strong>${esc(matchedLabels.join(', '))}</strong>`;
      }

      let existingStaff = [];
      try {
        existingStaff = await dbService.select('staff');
      } catch (err) {
        existingStaff = StaffModule._staff || [];
      }

      const existingEmails = new Set(existingStaff.map(s => String(s.email || '').toLowerCase().trim()));
      const seenEmailsInCsv = new Set();

      let maxSeq = existingStaff.reduce((max, s) => {
        const m = String(s.empId || '').match(/(\d+)\s*$/);
        return m ? Math.max(max, parseInt(m[1], 10)) : max;
      }, 0);

      parsedStaffToImport = [];

      for (let rIdx = 1; rIdx < rows.length; rIdx++) {
        const row = rows[rIdx];
        if (!row || row.every(c => !String(c || '').trim())) continue;

        const rowObj = {};
        STAFF_IMPORT_FIELDS.forEach(f => {
          const cIdx = colMap[f.key];
          rowObj[f.key] = (cIdx !== undefined && row[cIdx] !== undefined) ? String(row[cIdx]).trim() : '';
        });

        // Validation & normalization
        const rawName = rowObj.name;
        const rawEmail = rowObj.email;
        const lowerEmail = rawEmail.toLowerCase();

        const isMissingRequired = !rawName || !rawEmail || !lowerEmail.includes('@');
        const isDuplicate = !isMissingRequired && (existingEmails.has(lowerEmail) || seenEmailsInCsv.has(lowerEmail));
        if (lowerEmail) seenEmailsInCsv.add(lowerEmail);

        rowObj.role = StaffModule.normalizeRole(rowObj.role);
        rowObj.joiningDate = StaffModule.normalizeDate(rowObj.joiningDate);
        rowObj.basicPay = parseFloat(rowObj.basicPay) || 0;
        rowObj.status = rowObj.status ? (['Active', 'Inactive', 'On Leave', 'Resigned'].find(st => st.toLowerCase() === rowObj.status.toLowerCase()) || 'Active') : 'Active';

        if (!rowObj.empId || existingStaff.some(s => String(s.empId || '').toLowerCase() === rowObj.empId.toLowerCase())) {
          maxSeq++;
          rowObj.projectedEmpId = `TMS-EMP-${maxSeq.toString().padStart(3, '0')}`;
          rowObj.customEmpId = null;
        } else {
          rowObj.projectedEmpId = rowObj.empId;
          rowObj.customEmpId = rowObj.empId;
        }

        rowObj.isInvalid = isMissingRequired;
        rowObj.isDuplicate = isDuplicate;
        rowObj.invalidReason = !rawName ? 'Missing Name' : (!rawEmail || !lowerEmail.includes('@')) ? 'Invalid/Missing Email' : '';

        parsedStaffToImport.push(rowObj);
      }

      const validList = parsedStaffToImport.filter(p => !p.isInvalid && !p.isDuplicate);
      const duplicateCount = parsedStaffToImport.filter(p => p.isDuplicate).length;
      const invalidCount = parsedStaffToImport.filter(p => p.isInvalid).length;

      const previewArea = document.getElementById('staff-import-preview-area');
      const statsBar = document.getElementById('staff-import-stats-bar');
      const tbody = document.getElementById('staff-import-preview-tbody');
      const confirmBtn = document.getElementById('btn-confirm-bulk-staff');

      if (previewArea) previewArea.style.display = 'block';
      if (statsBar) {
        statsBar.innerHTML = `
          <span class="badge badge-success" style="font-size:0.82rem; padding:4px 10px;">✓ ${validList.length} Ready to Import</span>
          ${duplicateCount ? `<span class="badge badge-warning" style="font-size:0.82rem; padding:4px 10px;">⚠ ${duplicateCount} Duplicate Emails</span>` : ''}
          ${invalidCount ? `<span class="badge badge-danger" style="font-size:0.82rem; padding:4px 10px;">✕ ${invalidCount} Incomplete (Missing Name/Email)</span>` : ''}
        `;
      }

      if (tbody) {
        tbody.innerHTML = parsedStaffToImport.slice(0, 15).map(p => `
          <tr>
            <td>
              ${p.isInvalid ? `<span class="badge badge-danger">${esc(p.invalidReason)}</span>`
                : p.isDuplicate ? '<span class="badge badge-warning">Duplicate Email</span>'
                : '<span class="badge badge-success">Ready</span>'}
            </td>
            <td class="font-mono">${esc(p.projectedEmpId)}</td>
            <td style="font-weight:600;">${esc(p.name || '—')}</td>
            <td class="font-mono">${esc(p.email || '—')}</td>
            <td><span class="badge badge-subtle">${esc(ROLE_LABELS[p.role] || p.role)}</span></td>
            <td>${esc(p.department || '—')}</td>
            <td>${esc(p.designation || '—')}</td>
            <td>${esc(p.assignedClass ? `${p.assignedClass} ${p.assignedSection || ''}`.trim() : '—')}</td>
            <td class="font-mono">₹ ${(p.basicPay || 0).toLocaleString()}</td>
            <td>${esc(p.joiningDate || '—')}</td>
          </tr>
        `).join('');
      }

      if (confirmBtn) {
        confirmBtn.disabled = validList.length === 0;
        confirmBtn.innerHTML = `<i data-lucide="upload-cloud"></i> Import ${validList.length} Staff Member(s)`;
      }

      UIComponents.refreshIcons();
    });

    document.getElementById('btn-confirm-bulk-staff')?.addEventListener('click', async () => {
      const skipDuplicates = document.getElementById('chk-staff-skip-duplicates')?.checked !== false;
      const createLogins = document.getElementById('chk-staff-create-logins')?.checked !== false;

      const candidates = parsedStaffToImport.filter(p => !p.isInvalid && (!p.isDuplicate || !skipDuplicates));
      if (!candidates.length) {
        UIComponents.showToast('No valid staff records to import.', 'warning');
        return;
      }

      const btn = document.getElementById('btn-confirm-bulk-staff');
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Importing staff records...';

      let existing = [];
      try {
        existing = await dbService.select('staff');
      } catch (err) {
        existing = StaffModule._staff || [];
      }

      let maxSeq = existing.reduce((max, s) => {
        const m = String(s.empId || '').match(/(\d+)\s*$/);
        return m ? Math.max(max, parseInt(m[1], 10)) : max;
      }, 0);

      const provisionedList = [];
      let successCount = 0;

      for (const item of candidates) {
        maxSeq++;
        const empId = item.customEmpId || `TMS-EMP-${maxSeq.toString().padStart(3, '0')}`;

        const staffRecord = {
          empId,
          name: item.name,
          email: item.email,
          role: item.role || 'teacher',
          department: item.department || 'General',
          designation: item.designation || 'Staff',
          phone: item.phone || '',
          basicPay: parseFloat(item.basicPay) || 0,
          joiningDate: item.joiningDate || new Date().toISOString().slice(0, 10),
          assignedClass: item.assignedClass || null,
          assignedSection: item.assignedSection || null,
          status: item.status || 'Active'
        };

        // eslint-disable-next-line no-await-in-loop
        const record = await dbService.insert('staff', staffRecord);
        if (record && !record._syncError) {
          successCount++;

          if (createLogins) {
            try {
              // eslint-disable-next-line no-await-in-loop
              const provision = await staffService.provision({
                staffId: record.id,
                name: item.name,
                email: item.email,
                role: item.role || 'teacher',
                title: item.designation || 'Staff',
                department: item.department || 'General',
                assignedClass: item.assignedClass || null,
                assignedSection: item.assignedSection || null,
                username: item.username || null,
                password: item.password || null
              });

              if (provision && provision.userId) {
                // eslint-disable-next-line no-await-in-loop
                await dbService.update('staff', record.id, { userId: provision.userId });
                provisionedList.push({
                  empId,
                  name: item.name,
                  email: item.email,
                  role: item.role || 'teacher',
                  department: item.department || '',
                  designation: item.designation || '',
                  username: provision.username,
                  password: provision.password
                });
              }
            } catch (pErr) {
              console.warn('Could not auto-provision login for', item.email, pErr);
            }
          }
        }
      }

      await auditService.log('STAFF_BULK_IMPORTED', 'HR', {
        importedCount: successCount,
        loginsCreated: provisionedList.length
      });

      UIComponents.closeModal();
      UIComponents.showToast(`Successfully appointed and imported ${successCount} staff member(s)!`, 'success');

      if (provisionedList.length > 0) {
        StaffModule.showBulkCredentialsModal(provisionedList, successCount);
      }

      await StaffModule.render(container);
    });

    UIComponents.refreshIcons();
  }
}

export default StaffModule;
