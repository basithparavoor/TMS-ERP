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
import { orgStructureService } from './org-structure-service.js';

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
    let orgData = { departments: [], designations: [], roles: [] };
    try {
      staff = await dbService.select('staff');
      orgData = await orgStructureService.load();
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
                ${Array.from(new Set([...(orgData.departments || []).map(d => d.name), ...staff.map(s => s.department)].filter(Boolean))).map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('')}
              </select>
            </div>

            <!-- Role Filter -->
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-size:0.73rem; font-weight:700; color:#64748b; text-transform:uppercase;">Role:</span>
              <select id="staff-filter-role" class="form-select form-select-sm" style="height:36px; min-width:130px; font-size:0.8rem; font-weight:600;">
                <option value="">All Roles</option>
                ${(orgData.roles && orgData.roles.length ? orgData.roles.map(r => [r.code, r.label]) : Object.entries(ROLE_LABELS)).map(([k, v]) => `<option value="${esc(k)}">${esc(v)}</option>`).join('')}
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

          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <!-- View Mode Toggle (Table / Grid Cards) -->
            <div style="display:inline-flex; border:1px solid var(--border-color, #cbd5e1); border-radius:8px; overflow:hidden; background:var(--bg-surface);">
              <button type="button" class="btn btn-sm ${StaffModule.getViewMode() === 'table' ? 'btn-primary' : 'btn-secondary'}" id="btn-view-mode-table" title="Table View" style="border-radius:0; padding:6px 12px; font-weight:700; display:inline-flex; align-items:center; gap:5px;">
                <i data-lucide="list" style="width:14px;height:14px;"></i> Table
              </button>
              <button type="button" class="btn btn-sm ${StaffModule.getViewMode() === 'grid' ? 'btn-primary' : 'btn-secondary'}" id="btn-view-mode-grid" title="Cards Grid View" style="border-radius:0; padding:6px 12px; font-weight:700; display:inline-flex; align-items:center; gap:5px;">
                <i data-lucide="layout-grid" style="width:14px;height:14px;"></i> Cards
              </button>
            </div>

            <div style="font-size:0.8rem; font-weight:700; color:#475569;">
              Showing <span id="staff-filtered-count" style="color:#0f172a; font-weight:800;">${staff.length}</span> of ${staff.length} employees
            </div>
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

        <!-- TABLE VIEW -->
        <div class="table-responsive" id="staff-table-view" style="display:${StaffModule.getViewMode() === 'table' ? 'block' : 'none'};">
          <table class="tms-table" id="staff-table">
            <thead>
              <tr>
                ${canManage ? '<th style="width:34px;"><input type="checkbox" id="staff-select-all"></th>' : ''}
                <th>Emp ID</th>
                <th>Employee &amp; Dossier</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Login</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${staff.length ? staff.map((emp) => {
                const cred = credByStaff[emp.id];
                const initials = (emp.name || 'S').slice(0, 2).toUpperCase();
                return `
                <tr class="staff-row" data-id="${esc(emp.id)}" data-search="${esc(`${emp.name} ${emp.empId} ${emp.email || ''} ${emp.phone || ''} ${emp.department || ''} ${emp.designation || ''}`)}" data-dept="${esc(emp.department || '')}" data-role="${esc(emp.role || '')}" data-status="${esc(emp.status || '')}">
                  ${canManage ? `<td><input type="checkbox" class="staff-row-check" value="${esc(emp.id)}"></td>` : ''}
                  <td><span class="font-mono" style="font-weight: 700; color:#2563eb;">${esc(emp.empId)}</span></td>
                  <td>
                    <div style="display:flex; align-items:center; gap:9px;">
                      <div style="width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg, #10b981, #047857); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.75rem; flex-shrink:0;">
                        ${esc(initials)}
                      </div>
                      <div>
                        <a href="javascript:void(0)" class="staff-view-dossier-link" data-id="${esc(emp.id)}" style="font-weight:700; color:var(--text-main); text-decoration:none;" title="Click to view full Service Dossier &amp; ID Card">
                          ${esc(emp.name)}
                        </a>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${esc(emp.email)}</div>
                      </div>
                    </div>
                  </td>
                  <td>${esc(emp.department)}</td>
                  <td><strong>${esc(emp.designation)}</strong></td>
                  <td>${esc(ROLE_LABELS[emp.role] || emp.role || '—')}</td>
                  <td class="font-mono" style="font-size: 0.82rem;">${esc(emp.phone || '—')}</td>
                  <td>${fmtDate(emp.joiningDate)}</td>
                  <td><span class="badge ${emp.status === 'Active' ? 'badge-success' : 'badge-warning'}">${esc(emp.status || 'Active')}</span></td>
                  <td>
                    ${cred
                      ? `<span class="font-mono" style="font-size:0.78rem;">${esc(cred.username)}</span>`
                      : '<span style="color:var(--text-muted);font-size:0.78rem;">No login</span>'}
                  </td>
                  <td style="white-space:nowrap; text-align:right;">
                    <button class="btn btn-secondary btn-sm btn-view-staff" data-id="${esc(emp.id)}" title="View Service File &amp; Dossier" style="color:#0f172a;"><i data-lucide="file-text"></i></button>
                    <button class="btn btn-secondary btn-sm btn-idcard-staff" data-id="${esc(emp.id)}" title="Print Official ID Card" style="color:#16a34a;"><i data-lucide="badge-check"></i></button>
                    ${canManage ? `
                      <button class="btn btn-secondary btn-sm btn-edit-staff" data-id="${esc(emp.id)}" title="Edit details"><i data-lucide="pencil"></i></button>
                      <button class="btn btn-secondary btn-sm btn-login-staff" data-id="${esc(emp.id)}" title="Login credentials"><i data-lucide="key-round"></i></button>
                      <button class="btn btn-secondary btn-sm btn-del-staff" data-id="${esc(emp.id)}" title="Delete staff" style="color:#ef4444;"><i data-lucide="trash-2"></i></button>
                    ` : ''}
                  </td>
                </tr>`;
              }).join('') : `
                <tr>
                  <td colspan="${canManage ? 11 : 10}" style="text-align: center; color: var(--text-muted); padding: 30px;">No staff records found.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>

        <!-- CARDS GRID VIEW -->
        <div id="staff-grid-view" style="display:${StaffModule.getViewMode() === 'grid' ? 'grid' : 'none'}; grid-template-columns:repeat(auto-fill, minmax(295px, 1fr)); gap:16px;">
          ${staff.map((emp) => {
            const cred = credByStaff[emp.id];
            const initials = (emp.name || 'S').slice(0, 2).toUpperCase();
            const isTeacher = emp.role === 'teacher';
            return `
            <div class="card staff-card" data-id="${esc(emp.id)}" data-search="${esc(`${emp.name} ${emp.empId} ${emp.email || ''} ${emp.phone || ''} ${emp.department || ''} ${emp.designation || ''}`)}" data-dept="${esc(emp.department || '')}" data-role="${esc(emp.role || '')}" data-status="${esc(emp.status || '')}" style="margin:0; border:1px solid var(--border-color); border-radius:14px; padding:16px; display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden; background:var(--bg-surface);">
              <div style="position:absolute; top:0; left:0; right:0; height:4px; background:${emp.status === 'Active' ? '#16a34a' : '#f59e0b'};"></div>
              
              <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:12px;">
                  <div style="display:flex; align-items:center; gap:11px;">
                    <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg, #10b981, #059669); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1rem; box-shadow:0 2px 8px rgba(16,185,129,0.25); flex-shrink:0;">
                      ${esc(initials)}
                    </div>
                    <div>
                      <a href="javascript:void(0)" class="staff-view-dossier-link" data-id="${esc(emp.id)}" style="font-size:0.95rem; font-weight:800; color:var(--text-main); text-decoration:none;">
                        ${esc(emp.name)}
                      </a>
                      <div style="font-size:0.75rem; color:#2563eb; font-family:monospace; font-weight:700;">${esc(emp.empId)}</div>
                    </div>
                  </div>
                  <span class="badge ${emp.status === 'Active' ? 'badge-success' : 'badge-warning'}" style="font-size:0.68rem;">${esc(emp.status || 'Active')}</span>
                </div>

                <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:14px; font-size:0.8rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#64748b; font-size:0.75rem; font-weight:600;">Designation:</span>
                    <strong style="color:#0f172a; text-align:right;">${esc(emp.designation || '—')}</strong>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#64748b; font-size:0.75rem; font-weight:600;">Department:</span>
                    <span class="badge badge-info" style="font-size:0.7rem; font-weight:600;">${esc(emp.department || '—')}</span>
                  </div>
                  ${isTeacher && emp.assignedClass ? `
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#64748b; font-size:0.75rem; font-weight:600;">Class In-Charge:</span>
                    <span style="font-weight:700; color:#16a34a;">${esc(emp.assignedClass)} ${esc(emp.assignedSection || '')}</span>
                  </div>` : ''}
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#64748b; font-size:0.75rem; font-weight:600;">Email:</span>
                    <span style="font-family:monospace; font-size:0.74rem; color:#334155;">${esc(emp.email)}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#64748b; font-size:0.75rem; font-weight:600;">Phone:</span>
                    <span style="font-family:monospace; font-size:0.74rem; color:#334155;">${esc(emp.phone || '—')}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#64748b; font-size:0.75rem; font-weight:600;">Service Tenure:</span>
                    <span style="font-size:0.74rem; color:#475569; font-weight:600;">${StaffModule.calculateTenure(emp.joiningDate)}</span>
                  </div>
                </div>
              </div>

              <div style="border-top:1px solid var(--border-color); padding-top:10px; display:flex; justify-content:space-between; align-items:center; gap:6px;">
                <div style="display:inline-flex; gap:6px;">
                  <button class="btn btn-secondary btn-sm btn-view-staff" data-id="${esc(emp.id)}" title="View Service File &amp; Dossier" style="font-size:0.75rem; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                    <i data-lucide="file-text" style="width:13px;height:13px;"></i> Dossier
                  </button>
                  <button class="btn btn-secondary btn-sm btn-idcard-staff" data-id="${esc(emp.id)}" title="Print Official ID Card" style="font-size:0.75rem; color:#16a34a; display:inline-flex; align-items:center; gap:4px;">
                    <i data-lucide="badge-check" style="width:13px;height:13px;"></i> ID Card
                  </button>
                </div>
                ${canManage ? `
                <div style="display:inline-flex; gap:4px;">
                  <button class="btn btn-secondary btn-sm btn-edit-staff" data-id="${esc(emp.id)}" title="Edit"><i data-lucide="pencil" style="width:13px;height:13px;"></i></button>
                  <button class="btn btn-secondary btn-sm btn-login-staff" data-id="${esc(emp.id)}" title="Login credentials"><i data-lucide="key-round" style="width:13px;height:13px;"></i></button>
                  <button class="btn btn-secondary btn-sm btn-del-staff" data-id="${esc(emp.id)}" title="Delete" style="color:#ef4444;"><i data-lucide="trash-2" style="width:13px;height:13px;"></i></button>
                </div>` : ''}
              </div>
            </div>`;
          }).join('')}
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

    // Dossier & Service File view
    container.querySelectorAll('.btn-view-staff, .staff-view-dossier-link').forEach((b) =>
      b.addEventListener('click', (e) => {
        e.preventDefault();
        const emp = staff.find((s) => s.id === b.dataset.id);
        if (emp) this.openStaffDossierModal(emp, container, 'overview');
      }));

    // ID Card direct print/view
    container.querySelectorAll('.btn-idcard-staff').forEach((b) =>
      b.addEventListener('click', () => {
        const emp = staff.find((s) => s.id === b.dataset.id);
        if (emp) this.openStaffDossierModal(emp, container, 'idcard');
      }));

    // View Mode Switcher (Table vs Grid Cards)
    const btnTable = container.querySelector('#btn-view-mode-table');
    const btnGrid = container.querySelector('#btn-view-mode-grid');
    const viewTable = container.querySelector('#staff-table-view');
    const viewGrid = container.querySelector('#staff-grid-view');

    const switchView = (mode) => {
      StaffModule.setViewMode(mode);
      if (mode === 'grid') {
        if (btnTable) { btnTable.classList.remove('btn-primary'); btnTable.classList.add('btn-secondary'); }
        if (btnGrid) { btnGrid.classList.remove('btn-secondary'); btnGrid.classList.add('btn-primary'); }
        if (viewTable) viewTable.style.display = 'none';
        if (viewGrid) viewGrid.style.display = 'grid';
      } else {
        if (btnTable) { btnTable.classList.remove('btn-secondary'); btnTable.classList.add('btn-primary'); }
        if (btnGrid) { btnGrid.classList.remove('btn-primary'); btnGrid.classList.add('btn-secondary'); }
        if (viewTable) viewTable.style.display = 'block';
        if (viewGrid) viewGrid.style.display = 'none';
      }
      UIComponents.refreshIcons();
    };

    btnTable?.addEventListener('click', () => switchView('table'));
    btnGrid?.addEventListener('click', () => switchView('grid'));

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
    const staffCards = container.querySelectorAll('.staff-card');

    const filterStaffRows = () => {
      const q = (searchInp?.value || '').toLowerCase().trim();
      const d = (deptFilter?.value || '').toLowerCase().trim();
      const r = (roleFilter?.value || '').toLowerCase().trim();
      const s = (statusFilter?.value || '').toLowerCase().trim();
      let visible = 0;

      const checkMatch = (el) => {
        const searchTxt = (el.dataset.search || '').toLowerCase();
        const rowDept = (el.dataset.dept || '').toLowerCase();
        const rowRole = (el.dataset.role || '').toLowerCase();
        const rowStatus = (el.dataset.status || '').toLowerCase();

        return (!q || searchTxt.includes(q)) &&
               (!d || rowDept === d) &&
               (!r || rowRole === r) &&
               (!s || rowStatus === s);
      };

      staffRows.forEach(row => {
        const match = checkMatch(row);
        row.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      staffCards.forEach(card => {
        const match = checkMatch(card);
        card.style.display = match ? 'flex' : 'none';
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
  /* View Mode & Helpers                                                */
  /* ------------------------------------------------------------------ */

  static getViewMode() {
    try {
      return localStorage.getItem('tms_staff_view_mode') || 'table';
    } catch {
      return 'table';
    }
  }

  static setViewMode(mode) {
    try {
      localStorage.setItem('tms_staff_view_mode', mode);
    } catch {}
  }

  static calculateTenure(joiningDate) {
    if (!joiningDate) return 'Tenure not available';
    const start = new Date(joiningDate);
    if (isNaN(start.getTime())) return 'Tenure not available';
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    const yStr = years > 0 ? `${years} yr${years > 1 ? 's' : ''}` : '';
    const mStr = months > 0 ? `${months} mo${months > 1 ? 's' : ''}` : '';
    const parts = [yStr, mStr].filter(Boolean);
    return parts.length ? parts.join(' ') : 'Joined recently';
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

  static async openStaffModal(emp, container) {
    const isEdit = !!emp;
    const e = emp || {};
    const classes = ['', ...(TMS_CONFIG.academic && TMS_CONFIG.academic.classes ? TMS_CONFIG.academic.classes : [])];
    const sections = ['', ...(TMS_CONFIG.academic && TMS_CONFIG.academic.sections ? TMS_CONFIG.academic.sections : ['A', 'B', 'C'])];

    let orgData = { departments: [], designations: [], roles: [] };
    try { orgData = await orgStructureService.load(); } catch (err) {}
    const rolesList = (orgData.roles && orgData.roles.length) ? orgData.roles.map(r => ({ value: r.code, label: r.label })) : ROLE_OPTIONS;
    const deptList = (orgData.departments && orgData.departments.length) ? orgData.departments : [];
    const desigList = (orgData.designations && orgData.designations.length) ? orgData.designations : [];

    const bodyHtml = `
      <form id="form-new-staff" onsubmit="return false;">
        <div style="display: flex; flex-direction: column; gap: 14px;">
          
          <!-- Section 1: Basic & Contact -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 14px;">
            <div style="font-size:0.75rem; font-weight:800; color:#1e293b; text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
              <i data-lucide="user" style="width:14px;height:14px;color:#2563eb;"></i> Personal &amp; Account Identity
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group" style="margin:0;">
                <label class="form-label">Full Name *</label>
                <input class="form-input" id="stf-name" required value="${esc(e.name || '')}" placeholder="e.g. Mrs. Khadija Beevi">
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Official Email *</label>
                <input type="email" class="form-input" id="stf-email" required value="${esc(e.email || '')}" placeholder="khadija@thaibaschool.edu.in">
                <span style="font-size:0.7rem; color:var(--text-subtle);">This becomes their sign-in account e-mail.</span>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Phone Number</label>
                <input class="form-input font-mono" id="stf-phone" value="${esc(e.phone || '')}" placeholder="+91 98470 12345">
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Gender</label>
                <select class="form-select" id="stf-gender">
                  <option value="Female" ${e.gender === 'Female' ? 'selected' : ''}>Female</option>
                  <option value="Male" ${e.gender === 'Male' ? 'selected' : ''}>Male</option>
                  <option value="Other" ${e.gender === 'Other' ? 'selected' : ''}>Other</option>
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Blood Group</label>
                <select class="form-select" id="stf-blood">
                  <option value="">Select blood group...</option>
                  ${['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => `<option value="${bg}" ${e.bloodGroup === bg ? 'selected' : ''}>${bg}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Employment Status</label>
                <select class="form-select" id="stf-status">
                  <option ${e.status === 'Active' || !e.status ? 'selected' : ''}>Active</option>
                  <option ${e.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                  <option ${e.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
                  <option ${e.status === 'Resigned' ? 'selected' : ''}>Resigned</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Section 2: Organizational Placement -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 14px;">
            <div style="font-size:0.75rem; font-weight:800; color:#1e293b; text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
              <i data-lucide="building" style="width:14px;height:14px;color:#16a34a;"></i> Institutional Deployment
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group" style="margin:0;">
                <label class="form-label">Role Category</label>
                <select class="form-select" id="stf-role">
                  ${rolesList.map((r) => `<option value="${esc(r.value)}" ${e.role === r.value ? 'selected' : ''}>${esc(r.label)}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Department *</label>
                <input class="form-input" id="stf-dept" list="stf-dept-options" required value="${esc(e.department || '')}" placeholder="Select or type department...">
                <datalist id="stf-dept-options">
                  ${deptList.map(d => `<option value="${esc(d.name)}">${esc(d.code ? `[${d.code}] ` : '')}${esc(d.name)}</option>`).join('')}
                </datalist>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Designation *</label>
                <input class="form-input" id="stf-desig" list="stf-desig-options" required value="${esc(e.designation || '')}" placeholder="Select or type designation...">
                <datalist id="stf-desig-options">
                  ${desigList.map(d => `<option value="${esc(d.title)}">${esc(d.category ? `(${d.category}) ` : '')}${esc(d.title)}</option>`).join('')}
                </datalist>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Joining Date</label>
                <input type="date" class="form-input font-mono" id="stf-joining" value="${esc((e.joiningDate || new Date().toISOString()).slice(0, 10))}">
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Assigned Class (In-Charge)</label>
                <select class="form-select" id="stf-class">
                  ${classes.map((c) => `<option value="${esc(c)}" ${e.assignedClass === c ? 'selected' : ''}>${c ? esc(c) : '—'}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Assigned Section</label>
                <select class="form-select" id="stf-section">
                  ${sections.map((s) => `<option value="${esc(s)}" ${e.assignedSection === s ? 'selected' : ''}>${s || '—'}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>

          <!-- Section 3: Professional Background & Emergency -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 14px;">
            <div style="font-size:0.75rem; font-weight:800; color:#1e293b; text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
              <i data-lucide="graduation-cap" style="width:14px;height:14px;color:#8b5cf6;"></i> Qualifications, Experience &amp; Emergency Next-of-Kin
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group" style="margin:0;">
                <label class="form-label">Highest Qualification</label>
                <input class="form-input" id="stf-qualification" value="${esc(e.qualification || '')}" placeholder="e.g. M.Sc Physics, B.Ed / M.A English">
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Total Teaching / Work Experience</label>
                <input class="form-input" id="stf-experience" value="${esc(e.experience || '')}" placeholder="e.g. 6 Years Senior Secondary">
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Emergency Contact Person</label>
                <input class="form-input" id="stf-emergency-name" value="${esc(e.emergencyContactName || '')}" placeholder="e.g. Spouse / Parent / Guardian">
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Emergency Contact Phone</label>
                <input class="form-input font-mono" id="stf-emergency-phone" value="${esc(e.emergencyContactPhone || '')}" placeholder="+91 98470 00000">
              </div>
            </div>
          </div>

          <!-- Section 4: Compensation -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 14px;">
            <div style="font-size:0.75rem; font-weight:800; color:#1e293b; text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
              <i data-lucide="wallet" style="width:14px;height:14px;color:#d97706;"></i> Monthly Payroll &amp; Compensation
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group" style="margin:0;">
                <label class="form-label">Basic Salary (₹ / Month) *</label>
                <input type="number" class="form-input font-mono" id="stf-salary" value="${e.basicPay != null ? esc(e.basicPay) : ''}" placeholder="35000">
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Allowances / HRA (₹ / Month)</label>
                <input type="number" class="form-input font-mono" id="stf-allowances" value="${e.allowances != null ? esc(e.allowances) : ''}" placeholder="5000">
              </div>
            </div>
          </div>

          ${isEdit ? '' : `
          <div class="form-group" style="border-top:1px solid var(--border-color); padding-top:12px; margin:0;">
            <label class="form-label">Portal Sign-in Credentials</label>
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
      <button class="btn btn-primary" id="btn-save-staff" style="background:#16a34a; border-color:#16a34a; display:inline-flex; align-items:center; gap:6px;">
        <i data-lucide="save"></i> ${isEdit ? 'Save Changes' : 'Issue Appointment'}
      </button>
    `;

    UIComponents.openModal({
      title: isEdit ? `Edit Staff — ${e.name || ''}` : 'Appoint New Staff Member',
      bodyHtml,
      footerHtml,
      maxWidth: '680px'
    });

    document.getElementById('btn-cancel-staff')?.addEventListener('click', () => UIComponents.closeModal());
    document.getElementById('btn-save-staff')?.addEventListener('click', async () => {
      if (isEdit) await this.saveStaffEdit(e, container);
      else await this.createStaff(container);
    });
    UIComponents.refreshIcons();
  }

  static readStaffForm() {
    return {
      name: document.getElementById('stf-name')?.value.trim() || '',
      email: document.getElementById('stf-email')?.value.trim() || '',
      role: document.getElementById('stf-role')?.value || 'teacher',
      department: document.getElementById('stf-dept')?.value.trim() || '',
      designation: document.getElementById('stf-desig')?.value.trim() || '',
      phone: document.getElementById('stf-phone')?.value.trim() || '',
      gender: document.getElementById('stf-gender')?.value || 'Female',
      bloodGroup: document.getElementById('stf-blood')?.value || '',
      qualification: document.getElementById('stf-qualification')?.value.trim() || '',
      experience: document.getElementById('stf-experience')?.value.trim() || '',
      emergencyContactName: document.getElementById('stf-emergency-name')?.value.trim() || '',
      emergencyContactPhone: document.getElementById('stf-emergency-phone')?.value.trim() || '',
      basicPay: parseFloat(document.getElementById('stf-salary')?.value) || 0,
      allowances: parseFloat(document.getElementById('stf-allowances')?.value) || 0,
      joiningDate: document.getElementById('stf-joining')?.value || '',
      assignedClass: document.getElementById('stf-class')?.value || '',
      assignedSection: document.getElementById('stf-section')?.value || '',
      status: document.getElementById('stf-status')?.value || 'Active'
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
      gender: form.gender,
      bloodGroup: form.bloodGroup,
      qualification: form.qualification,
      experience: form.experience,
      emergencyContactName: form.emergencyContactName,
      emergencyContactPhone: form.emergencyContactPhone,
      basicPay: form.basicPay,
      allowances: form.allowances,
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
      gender: form.gender,
      bloodGroup: form.bloodGroup,
      qualification: form.qualification,
      experience: form.experience,
      emergencyContactName: form.emergencyContactName,
      emergencyContactPhone: form.emergencyContactPhone,
      basicPay: form.basicPay,
      allowances: form.allowances,
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
    UIComponents.showToast(`Changes saved for ${form.name}.`, 'success');
    UIComponents.closeModal();
    await StaffModule.render(container);
  }

  /* ------------------------------------------------------------------ */
  /* Staff Dossier & Printable ID Badge                                  */
  /* ------------------------------------------------------------------ */

  static openStaffDossierModal(emp, container, initialTab = 'overview') {
    if (!emp) return;
    const cred = (this._credByStaff || {})[emp.id];
    const initials = (emp.name || 'S').slice(0, 2).toUpperCase();
    const basic = parseFloat(emp.basicPay) || 0;
    const allowances = parseFloat(emp.allowances) || 0;
    const grossMonthly = basic + allowances;
    const annualCtc = grossMonthly * 12;
    const tenure = this.calculateTenure(emp.joiningDate);
    const isTeacher = emp.role === 'teacher';

    const bodyHtml = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <!-- Hero Header -->
        <div style="background:linear-gradient(135deg, #f8fafc, #f1f5f9); border:1px solid var(--border-color); border-radius:14px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div style="width:58px; height:58px; border-radius:50%; background:linear-gradient(135deg, #10b981, #047857); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1.35rem; box-shadow:0 4px 12px rgba(16,185,129,0.3); border:2px solid #fff; flex-shrink:0;">
              ${esc(initials)}
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <h3 style="margin:0; font-size:1.25rem; font-weight:800; color:var(--text-main);">${esc(emp.name)}</h3>
                <span class="badge ${emp.status === 'Active' ? 'badge-success' : 'badge-warning'}" style="font-size:0.72rem;">${esc(emp.status || 'Active')}</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:4px;">
                <span style="font-family:monospace; font-weight:700; color:#2563eb; background:#eff6ff; padding:2px 8px; border-radius:6px; font-size:0.78rem;">${esc(emp.empId)}</span>
                <span style="color:#059669; font-weight:700; font-size:0.85rem;">${esc(emp.designation || 'Staff')}</span>
                <span style="color:#94a3b8;">•</span>
                <span style="color:#64748b; font-size:0.82rem;">${esc(emp.department || 'General')}</span>
              </div>
            </div>
          </div>
          <div style="display:inline-flex; gap:8px;">
            <button class="btn btn-secondary btn-sm" id="btn-dossier-print-card-quick" style="color:#16a34a; font-weight:700; display:inline-flex; align-items:center; gap:6px;">
              <i data-lucide="printer"></i> Print ID Badge
            </button>
            <button class="btn btn-secondary btn-sm" id="btn-dossier-edit-quick" style="font-weight:700; display:inline-flex; align-items:center; gap:6px;">
              <i data-lucide="pencil"></i> Edit Profile
            </button>
          </div>
        </div>

        <!-- Dossier Subtab Navigation -->
        <div style="display:flex; gap:8px; border-bottom:1px solid var(--border-color); padding-bottom:8px; overflow-x:auto;">
          <button class="btn ${initialTab === 'overview' ? 'btn-primary' : 'btn-secondary'} btn-sm dossier-tab-btn" data-target="dossier-pane-overview" style="display:inline-flex; align-items:center; gap:6px;">
            <i data-lucide="file-text" style="width:14px;height:14px;"></i> Service Record &amp; Bio
          </button>
          <button class="btn ${initialTab === 'idcard' ? 'btn-primary' : 'btn-secondary'} btn-sm dossier-tab-btn" data-target="dossier-pane-idcard" style="display:inline-flex; align-items:center; gap:6px;">
            <i data-lucide="badge-check" style="width:14px;height:14px;"></i> Official Staff ID Badge
          </button>
          <button class="btn ${initialTab === 'payroll' ? 'btn-primary' : 'btn-secondary'} btn-sm dossier-tab-btn" data-target="dossier-pane-payroll" style="display:inline-flex; align-items:center; gap:6px;">
            <i data-lucide="wallet" style="width:14px;height:14px;"></i> Compensation &amp; Payroll
          </button>
          <button class="btn ${initialTab === 'access' ? 'btn-primary' : 'btn-secondary'} btn-sm dossier-tab-btn" data-target="dossier-pane-access" style="display:inline-flex; align-items:center; gap:6px;">
            <i data-lucide="shield-check" style="width:14px;height:14px;"></i> Security &amp; Login
          </button>
        </div>

        <!-- TAB 1: OVERVIEW -->
        <div class="dossier-pane" id="dossier-pane-overview" style="display:${initialTab === 'overview' ? 'block' : 'none'};">
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px;">
            
            <!-- Academic & Placement -->
            <div class="card" style="margin:0; padding:14px; border:1px solid var(--border-color); border-radius:12px;">
              <h4 style="margin:0 0 10px 0; font-size:0.85rem; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:6px;">
                <i data-lucide="building" style="color:#2563eb; width:15px; height:15px;"></i> Academic &amp; Deployment Placement
              </h4>
              <div style="display:flex; flex-direction:column; gap:8px; font-size:0.82rem;">
                <div style="display:flex; justify-content:space-between;"><span style="color:#64748b;">Department:</span><strong>${esc(emp.department || '—')}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span style="color:#64748b;">Official Title:</span><strong style="color:#059669;">${esc(emp.designation || '—')}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span style="color:#64748b;">Role Scope:</span><span class="badge badge-info">${esc(ROLE_LABELS[emp.role] || emp.role || '—')}</span></div>
                ${isTeacher ? `
                <div style="display:flex; justify-content:space-between;"><span style="color:#64748b;">Assigned Class In-Charge:</span><strong style="color:#2563eb;">${esc(emp.assignedClass || '—')} ${esc(emp.assignedSection || '')}</strong></div>
                ` : ''}
                <div style="display:flex; justify-content:space-between;"><span style="color:#64748b;">Date of Joining:</span><strong>${fmtDate(emp.joiningDate)}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span style="color:#64748b;">Service Tenure:</span><span style="font-weight:700; color:#16a34a;">${tenure}</span></div>
              </div>
            </div>

            <!-- Professional & Personal -->
            <div class="card" style="margin:0; padding:14px; border:1px solid var(--border-color); border-radius:12px;">
              <h4 style="margin:0 0 10px 0; font-size:0.85rem; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:6px;">
                <i data-lucide="graduation-cap" style="color:#10b981; width:15px; height:15px;"></i> Professional Background &amp; Profile
              </h4>
              <div style="display:flex; flex-direction:column; gap:8px; font-size:0.82rem;">
                <div style="display:flex; justify-content:space-between;"><span style="color:#64748b;">Highest Qualification:</span><strong>${esc(emp.qualification || 'Post Graduate / Certified')}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span style="color:#64748b;">Work Experience:</span><strong>${esc(emp.experience || 'Experienced Faculty')}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span style="color:#64748b;">Gender:</span><strong>${esc(emp.gender || '—')}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span style="color:#64748b;">Blood Group:</span><span class="badge" style="background:#fee2e2; color:#b91c1c; font-weight:800;">${esc(emp.bloodGroup || '—')}</span></div>
                <div style="display:flex; justify-content:space-between;"><span style="color:#64748b;">Official Email:</span><span style="font-family:monospace;">${esc(emp.email)}</span></div>
                <div style="display:flex; justify-content:space-between;"><span style="color:#64748b;">Contact Phone:</span><span style="font-family:monospace;">${esc(emp.phone || '—')}</span></div>
              </div>
            </div>

            <!-- Emergency & Support -->
            <div class="card" style="margin:0; padding:14px; border:1px solid var(--border-color); border-radius:12px; grid-column:1/-1;">
              <h4 style="margin:0 0 10px 0; font-size:0.85rem; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:6px;">
                <i data-lucide="heart-pulse" style="color:#ef4444; width:15px; height:15px;"></i> Emergency Contact &amp; Next of Kin
              </h4>
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; font-size:0.82rem;">
                <div><span style="color:#64748b;">Emergency Contact Person:</span><div style="font-weight:700; color:#0f172a; margin-top:2px;">${esc(emp.emergencyContactName || 'Family / Guardian on file')}</div></div>
                <div><span style="color:#64748b;">Emergency Helpline Phone:</span><div style="font-family:monospace; font-weight:700; color:#0f172a; margin-top:2px;">${esc(emp.emergencyContactPhone || emp.phone || '—')}</div></div>
                <div><span style="color:#64748b;">Campus Authority Emergency:</span><div style="font-family:monospace; font-weight:700; color:#16a34a; margin-top:2px;">+91 8653382851</div></div>
              </div>
            </div>

          </div>
        </div>

        <!-- TAB 2: OFFICIAL PRINTABLE ID CARD -->
        <div class="dossier-pane" id="dossier-pane-idcard" style="display:${initialTab === 'idcard' ? 'block' : 'none'};">
          <div style="display:flex; flex-direction:column; align-items:center; gap:16px;">
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:10px 16px; font-size:0.82rem; color:#166534; display:flex; justify-content:space-between; align-items:center; width:100%; max-width:440px;">
              <span><strong>Ready for Print</strong> (Standard Staff Badge dimensions)</span>
              <button class="btn btn-primary btn-sm" id="btn-print-id-card-action" style="background:#16a34a; border-color:#16a34a; display:inline-flex; align-items:center; gap:5px; font-weight:700;">
                <i data-lucide="printer" style="width:14px;height:14px;"></i> Print ID Badge
              </button>
            </div>

            <!-- Standard Official Staff ID Card Container -->
            <div id="tms-printable-card-target" style="width:330px; background:#ffffff; border:1.5px solid #cbd5e1; border-radius:16px; overflow:hidden; box-shadow:0 12px 30px rgba(0,0,0,0.12); font-family:system-ui, -apple-system, sans-serif; position:relative;">
              
              <!-- Card Header Ribbon -->
              <div style="background:linear-gradient(135deg, #064e3b, #047857); padding:14px 12px 10px 12px; text-align:center; color:#ffffff; position:relative;">
                <div style="display:flex; align-items:center; justify-content:center; gap:6px; margin-bottom:4px;">
                  <div style="width:24px; height:24px; border-radius:50%; background:#ffffff; color:#047857; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:0.75rem;">
                    TMS
                  </div>
                  <strong style="font-size:0.92rem; letter-spacing:0.5px; text-transform:uppercase;">THAIBA MODEL SCHOOL</strong>
                </div>
                <div style="font-size:0.62rem; color:#d1fae5; letter-spacing:0.3px;">Enterprise Campus • Regd. No: IV 01894/2011</div>
                <div style="margin-top:6px; background:#fbbf24; color:#78350f; font-size:0.65rem; font-weight:900; letter-spacing:1px; text-transform:uppercase; padding:2px 8px; border-radius:10px; display:inline-block;">
                  STAFF IDENTITY CARD
                </div>
              </div>

              <!-- Card Body -->
              <div style="padding:16px 14px 12px 14px; display:flex; flex-direction:column; align-items:center; text-align:center;">
                <!-- Photo Avatar Frame -->
                <div style="width:84px; height:84px; border-radius:50%; border:3px solid #10b981; padding:3px; background:#ffffff; box-shadow:0 4px 10px rgba(0,0,0,0.1); margin-bottom:8px;">
                  <div style="width:100%; height:100%; border-radius:50%; background:linear-gradient(135deg, #10b981, #047857); color:#ffffff; display:flex; align-items:center; justify-content:center; font-size:1.75rem; font-weight:900;">
                    ${esc(initials)}
                  </div>
                </div>

                <!-- Name & Title -->
                <h3 style="margin:0; font-size:1.05rem; font-weight:900; color:#0f172a; text-transform:uppercase; letter-spacing:0.3px;">
                  ${esc(emp.name)}
                </h3>
                <div style="font-size:0.78rem; font-weight:800; color:#059669; margin:2px 0 10px 0;">
                  ${esc(emp.designation || 'Faculty Member')}
                </div>

                <!-- Attribute Table -->
                <div style="width:100%; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; margin-bottom:12px; font-size:0.74rem; text-align:left;">
                  <div style="display:grid; grid-template-columns:90px 1fr; gap:4px; margin-bottom:4px;">
                    <span style="color:#64748b; font-weight:700;">EMP ID:</span>
                    <strong style="color:#2563eb; font-family:monospace; font-size:0.8rem;">${esc(emp.empId)}</strong>
                  </div>
                  <div style="display:grid; grid-template-columns:90px 1fr; gap:4px; margin-bottom:4px;">
                    <span style="color:#64748b; font-weight:700;">DEPARTMENT:</span>
                    <strong style="color:#0f172a;">${esc(emp.department || 'General')}</strong>
                  </div>
                  <div style="display:grid; grid-template-columns:90px 1fr; gap:4px; margin-bottom:4px;">
                    <span style="color:#64748b; font-weight:700;">BLOOD GRP:</span>
                    <strong style="color:#b91c1c;">${esc(emp.bloodGroup || '—')}</strong>
                  </div>
                  <div style="display:grid; grid-template-columns:90px 1fr; gap:4px; margin-bottom:4px;">
                    <span style="color:#64748b; font-weight:700;">CONTACT:</span>
                    <span style="color:#0f172a; font-family:monospace;">${esc(emp.phone || '—')}</span>
                  </div>
                  <div style="display:grid; grid-template-columns:90px 1fr; gap:4px;">
                    <span style="color:#64748b; font-weight:700;">VALID TILL:</span>
                    <span style="color:#16a34a; font-weight:700;">31-MAR-2027</span>
                  </div>
                </div>

                <!-- Simulated Barcode & Signature Section -->
                <div style="width:100%; display:flex; justify-content:space-between; align-items:center; padding:0 8px; margin-bottom:10px;">
                  <div style="display:flex; flex-direction:column; align-items:flex-start;">
                    <!-- Barcode stripes -->
                    <div style="display:flex; gap:2px; height:24px; align-items:stretch;">
                      <span style="width:2px; background:#0f172a;"></span>
                      <span style="width:3px; background:#0f172a;"></span>
                      <span style="width:1px; background:#0f172a;"></span>
                      <span style="width:4px; background:#0f172a;"></span>
                      <span style="width:2px; background:#0f172a;"></span>
                      <span style="width:1px; background:#0f172a;"></span>
                      <span style="width:3px; background:#0f172a;"></span>
                      <span style="width:2px; background:#0f172a;"></span>
                      <span style="width:4px; background:#0f172a;"></span>
                      <span style="width:1px; background:#0f172a;"></span>
                      <span style="width:3px; background:#0f172a;"></span>
                      <span style="width:2px; background:#0f172a;"></span>
                    </div>
                    <span style="font-family:monospace; font-size:0.6rem; color:#64748b; margin-top:2px;">${esc(emp.empId)}</span>
                  </div>

                  <!-- Stamp / Signature -->
                  <div style="text-align:right;">
                    <div style="font-family:'Brush Script MT', cursive, serif; font-size:0.95rem; color:#1e3a8a; line-height:1;">Abdul Basith</div>
                    <div style="border-top:1px solid #94a3b8; font-size:0.55rem; color:#475569; font-weight:700; text-transform:uppercase; margin-top:2px;">
                      Authorized Signatory
                    </div>
                  </div>
                </div>

                <!-- Card Footer -->
                <div style="font-size:0.58rem; color:#94a3b8; border-top:1px dashed #e2e8f0; padding-top:6px; width:100%;">
                  Campus: Baghait, Tapan, Dakshin Dinajpur, WB • Helpline: +91 8653382851
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: PAYROLL & COMPENSATION -->
        <div class="dossier-pane" id="dossier-pane-payroll" style="display:${initialTab === 'payroll' ? 'block' : 'none'};">
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:12px; margin-bottom:14px;">
            <div class="card" style="margin:0; padding:14px; border:1px solid #bbf7d0; background:#f0fdf4; border-radius:12px;">
              <span style="font-size:0.75rem; color:#166534; font-weight:700; text-transform:uppercase;">Basic Pay</span>
              <div style="font-size:1.35rem; font-weight:900; color:#15803d; margin-top:4px;">₹ ${basic.toLocaleString()}</div>
              <span style="font-size:0.7rem; color:#16a34a;">Monthly Fixed</span>
            </div>

            <div class="card" style="margin:0; padding:14px; border:1px solid #bfdbfe; background:#eff6ff; border-radius:12px;">
              <span style="font-size:0.75rem; color:#1e40af; font-weight:700; text-transform:uppercase;">HRA &amp; Allowances</span>
              <div style="font-size:1.35rem; font-weight:900; color:#1d4ed8; margin-top:4px;">₹ ${allowances.toLocaleString()}</div>
              <span style="font-size:0.7rem; color:#2563eb;">Monthly Variable</span>
            </div>

            <div class="card" style="margin:0; padding:14px; border:1px solid #fed7aa; background:#fff7ed; border-radius:12px;">
              <span style="font-size:0.75rem; color:#9a3412; font-weight:700; text-transform:uppercase;">Gross Monthly</span>
              <div style="font-size:1.35rem; font-weight:900; color:#c2410c; margin-top:4px;">₹ ${grossMonthly.toLocaleString()}</div>
              <span style="font-size:0.7rem; color:#ea580c;">Total Monthly CTC</span>
            </div>

            <div class="card" style="margin:0; padding:14px; border:1px solid #ddd6fe; background:#f5f3ff; border-radius:12px;">
              <span style="font-size:0.75rem; color:#5b21b6; font-weight:700; text-transform:uppercase;">Annual CTC</span>
              <div style="font-size:1.35rem; font-weight:900; color:#6d28d9; margin-top:4px;">₹ ${annualCtc.toLocaleString()}</div>
              <span style="font-size:0.7rem; color:#7c3aed;">12-Month Financial Budget</span>
            </div>
          </div>

          <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:10px; padding:12px 16px; font-size:0.8rem; color:#475569;">
            <i data-lucide="info" style="width:14px; height:14px; color:#2563eb; vertical-align:middle; margin-right:4px;"></i>
            Salary allowances are computed automatically for monthly payroll dispatch. To adjust compensation structure, click <strong>Edit Profile</strong>.
          </div>
        </div>

        <!-- TAB 4: ACCESS & SECURITY -->
        <div class="dossier-pane" id="dossier-pane-access" style="display:${initialTab === 'access' ? 'block' : 'none'};">
          <div class="card" style="margin:0; padding:16px; border:1px solid var(--border-color); border-radius:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
              <div>
                <h4 style="margin:0; font-size:0.95rem; font-weight:800; color:#0f172a;">Portal Sign-in &amp; RBAC Authorization</h4>
                <p style="margin:2px 0 0 0; font-size:0.78rem; color:#64748b;">Credentials give this staff member access to the Attendance, Gradebook, and Class registers.</p>
              </div>
              <button class="btn btn-primary btn-sm" id="btn-dossier-manage-login" style="display:inline-flex; align-items:center; gap:5px;">
                <i data-lucide="key-round" style="width:13px;height:13px;"></i> Manage Credentials
              </button>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; font-size:0.82rem; background:#f8fafc; padding:12px; border-radius:8px;">
              <div><span style="color:#64748b;">Official Account Username:</span><div style="font-family:monospace; font-weight:700; color:#0f172a; margin-top:2px;">${esc(cred ? cred.username : 'No login issued yet')}</div></div>
              <div><span style="color:#64748b;">Account Email:</span><div style="font-family:monospace; font-weight:700; color:#0f172a; margin-top:2px;">${esc(emp.email)}</div></div>
              <div><span style="color:#64748b;">Security Role:</span><div style="font-weight:700; color:#059669; margin-top:2px;">${esc(ROLE_LABELS[emp.role] || emp.role)}</div></div>
              <div><span style="color:#64748b;">Login Status:</span><div style="font-weight:700; color:${cred ? '#16a34a' : '#ef4444'}; margin-top:2px;">${cred ? 'Active & Verified' : 'Unconfigured'}</div></div>
            </div>
          </div>
        </div>

      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="UIComponents.closeModal()">Close</button>
      <button class="btn btn-primary" id="btn-dossier-print-card-footer" style="background:#16a34a; border-color:#16a34a; display:inline-flex; align-items:center; gap:6px;">
        <i data-lucide="printer"></i> Print ID Badge
      </button>
    `;

    UIComponents.openModal({
      title: `Staff Service Dossier — ${emp.name}`,
      bodyHtml,
      footerHtml,
      maxWidth: '720px'
    });

    // Subtab switching
    document.querySelectorAll('.dossier-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.dossier-tab-btn').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        const targetId = btn.dataset.target;
        document.querySelectorAll('.dossier-pane').forEach(p => p.style.display = 'none');
        const pane = document.getElementById(targetId);
        if (pane) pane.style.display = 'block';
        UIComponents.refreshIcons();
      });
    });

    // Quick actions
    document.getElementById('btn-dossier-print-card-quick')?.addEventListener('click', () => this.printStaffIdCard(emp.id));
    document.getElementById('btn-print-id-card-action')?.addEventListener('click', () => this.printStaffIdCard(emp.id));
    document.getElementById('btn-dossier-print-card-footer')?.addEventListener('click', () => this.printStaffIdCard(emp.id));
    document.getElementById('btn-dossier-edit-quick')?.addEventListener('click', () => {
      UIComponents.closeModal();
      this.openStaffModal(emp, container);
    });
    document.getElementById('btn-dossier-manage-login')?.addEventListener('click', () => {
      UIComponents.closeModal();
      this.openCredentialsModal(emp, container);
    });

    UIComponents.refreshIcons();
  }

  static printStaffIdCard(empId) {
    const emp = (this._staff || []).find(s => s.id === empId);
    if (!emp) {
      UIComponents.showToast('Staff member not found.', 'warning');
      return;
    }

    const initials = (emp.name || 'S').slice(0, 2).toUpperCase();
    const printWindow = window.open('', '_blank', 'width=650,height=800');
    if (!printWindow) {
      UIComponents.showToast('Please allow popups to print Staff ID Badge.', 'warning');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Staff ID Badge — ${esc(emp.name)} (${esc(emp.empId)})</title>
        <style>
          @page { size: auto; margin: 15mm; }
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .id-card {
            width: 320px;
            background: #ffffff;
            border: 2px solid #0f172a;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 14px rgba(0,0,0,0.15);
            text-align: center;
          }
          .card-header {
            background: #064e3b;
            color: #ffffff;
            padding: 16px 12px 12px 12px;
          }
          .school-title {
            font-size: 0.95rem;
            font-weight: 900;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .card-badge {
            background: #fbbf24;
            color: #78350f;
            font-size: 0.65rem;
            font-weight: 900;
            letter-spacing: 1px;
            text-transform: uppercase;
            padding: 3px 10px;
            border-radius: 10px;
            display: inline-block;
            margin-top: 6px;
          }
          .card-body {
            padding: 16px 14px;
          }
          .avatar-box {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 3px solid #10b981;
            margin: 0 auto 10px auto;
            background: #047857;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.75rem;
            font-weight: 900;
          }
          .emp-name {
            font-size: 1.05rem;
            font-weight: 900;
            color: #0f172a;
            text-transform: uppercase;
            margin: 0 0 2px 0;
          }
          .emp-desig {
            font-size: 0.8rem;
            font-weight: 800;
            color: #059669;
            margin-bottom: 12px;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.74rem;
            margin-bottom: 12px;
            text-align: left;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
          }
          .info-table td {
            padding: 5px 8px;
          }
          .info-label {
            color: #64748b;
            font-weight: 700;
            width: 90px;
          }
          .barcode-line {
            display: flex;
            gap: 2px;
            height: 22px;
            align-items: stretch;
          }
          .barcode-line span {
            background: #0f172a;
          }
          .card-footer {
            font-size: 0.6rem;
            color: #64748b;
            border-top: 1px dashed #cbd5e1;
            padding-top: 8px;
            margin-top: 6px;
          }
          @media print {
            body { background: transparent; padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: center;">
          <button onclick="window.print()" style="background:#16a34a; color:#fff; border:none; padding:8px 18px; border-radius:8px; font-weight:700; cursor:pointer; font-size:0.9rem;">
            Print ID Badge Now
          </button>
        </div>

        <div class="id-card">
          <div class="card-header">
            <div class="school-title">THAIBA MODEL SCHOOL</div>
            <div style="font-size:0.62rem; color:#d1fae5;">Campus Regd: IV 01894/2011</div>
            <div class="card-badge">STAFF IDENTITY CARD</div>
          </div>
          <div class="card-body">
            <div class="avatar-box">${esc(initials)}</div>
            <div class="emp-name">${esc(emp.name)}</div>
            <div class="emp-desig">${esc(emp.designation || 'Staff')}</div>

            <table class="info-table">
              <tr><td class="info-label">EMP ID:</td><td><strong style="color:#2563eb; font-family:monospace;">${esc(emp.empId)}</strong></td></tr>
              <tr><td class="info-label">DEPARTMENT:</td><td><strong>${esc(emp.department || 'General')}</strong></td></tr>
              <tr><td class="info-label">BLOOD GRP:</td><td><strong style="color:#b91c1c;">${esc(emp.bloodGroup || '—')}</strong></td></tr>
              <tr><td class="info-label">PHONE:</td><td><span style="font-family:monospace;">${esc(emp.phone || '—')}</span></td></tr>
              <tr><td class="info-label">VALID TILL:</td><td><strong style="color:#16a34a;">31-MAR-2027</strong></td></tr>
            </table>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <div>
                <div class="barcode-line">
                  <span style="width:2px;"></span><span style="width:3px;"></span><span style="width:1px;"></span>
                  <span style="width:4px;"></span><span style="width:2px;"></span><span style="width:1px;"></span>
                  <span style="width:3px;"></span><span style="width:2px;"></span><span style="width:4px;"></span>
                </div>
                <div style="font-family:monospace; font-size:0.6rem; color:#64748b; margin-top:2px;">${esc(emp.empId)}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-family:'Brush Script MT', cursive; font-size:0.95rem; color:#1e3a8a;">Abdul Basith</div>
                <div style="border-top:1px solid #94a3b8; font-size:0.55rem; color:#475569; font-weight:700;">AUTHORIZED SIGNATORY</div>
              </div>
            </div>

            <div class="card-footer">
              Baghait, Tapan, Dakshin Dinajpur, WB - 733127 • Helpline: +91 8653382851
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
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
    if (typeof val === 'number') {
      if (val > 30000 && val < 60000) {
        const d = new Date((val - 25569) * 86400 * 1000);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      }
    }
    const s = String(val).trim();
    if (!s) return null;

    if (/^\d{5}$/.test(s)) {
      const num = parseInt(s, 10);
      if (num > 30000 && num < 60000) {
        const d = new Date((num - 25569) * 86400 * 1000);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      }
    }

    // 1. YYYY-MM-DD or YYYY-DD-MM
    const ymd = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (ymd) {
      const year = ymd[1];
      const p1 = parseInt(ymd[2], 10);
      const p2 = parseInt(ymd[3], 10);
      if (p1 > 12 && p2 <= 12) {
        // YYYY-DD-MM swapped
        return `${year}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
      }
      return `${year}-${String(p1).padStart(2, '0')}-${String(p2).padStart(2, '0')}`;
    }

    // 2. DD/MM/YYYY or MM/DD/YYYY
    const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (dmy) {
      const p1 = parseInt(dmy[1], 10);
      const p2 = parseInt(dmy[2], 10);
      const year = dmy[3];
      if (p1 > 12 && p2 <= 12) {
        // Definitely DD/MM/YYYY
        return `${year}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
      }
      if (p2 > 12 && p1 <= 12) {
        // Definitely MM/DD/YYYY
        return `${year}-${String(p1).padStart(2, '0')}-${String(p2).padStart(2, '0')}`;
      }
      // Both <= 12: Standard Indian school format DD/MM/YYYY
      return `${year}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
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
        <div style="margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid var(--border-color);">
          <div style="font-weight:800; font-size:1.05rem; color:#0f172a;">Bulk Onboard Faculty &amp; Staff Members</div>
          <div style="font-size:0.78rem; color:var(--text-muted);">Quickly import multiple previous or existing staff records and optionally generate secure logins.</div>
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
