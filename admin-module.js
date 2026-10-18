/**
 * THAIBA MODEL SCHOOL — School Administration & Governance Module
 * With Full Admission Form & Fee Structure Builder Engine
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { auditService } from './audit-service.js';
import { UIComponents } from './ui-components.js';
import { TMS_LOGO } from './logo.js';

export class AdminModule {
  static async render(container) {
    const logs = await auditService.getLogs();
    const admissions = await dbService.select('admissions_applications');

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem;">School Administration & Governance</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Executive administration, admission form builder, fee configuration, leadership directory, and immutable audit trails.
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <a href="student-admission-portal.html" target="_blank" class="btn btn-secondary"><i data-lucide="external-link"></i> Public Admission Gateway</a>
            <button class="btn btn-primary" id="btn-academic-calendar"><i data-lucide="calendar"></i> School Calendar</button>
          </div>
        </div>
      </div>

      <!-- School Profile Overview Card with Official Logo -->
      <div class="card" style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
          <div style="flex-shrink: 0;">
            ${TMS_LOGO.emblemSvg(72)}
          </div>
          <div style="flex: 1; min-width: 260px;">
            <h2 style="font-size: 1.45rem; letter-spacing: 0.02em;">${TMS_CONFIG.institution.name}</h2>
            <div style="color: #16a34a; font-weight: 700; font-size: 0.88rem; text-transform: uppercase;">
              ${TMS_CONFIG.institution.tagline}
            </div>
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">
              ${TMS_CONFIG.institution.address.campus}, ${TMS_CONFIG.institution.address.district}, ${TMS_CONFIG.institution.address.state} • Regd. No.: ${TMS_CONFIG.institution.regNo}
            </div>
            <div style="display: flex; gap: 16px; margin-top: 8px; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap;">
              <span><i data-lucide="phone" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${TMS_CONFIG.institution.contact.phone1}, ${TMS_CONFIG.institution.contact.phone2}</span>
              <span><i data-lucide="mail" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${TMS_CONFIG.institution.contact.email}</span>
              <span><i data-lucide="globe" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${TMS_CONFIG.institution.contact.website}</span>
            </div>
          </div>
          <div>
            <span class="badge badge-success" style="padding: 8px 16px; font-size: 0.84rem;">
              Session ${TMS_CONFIG.academic.currentYear} Active
            </span>
          </div>
        </div>
      </div>

      <!-- Admin Tabs -->
      <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; overflow-x: auto;">
        <button class="btn btn-primary admin-tab-btn" data-tab="admissions-builder">Admission & Fee Builder</button>
        <button class="btn btn-secondary admin-tab-btn" data-tab="applications-list">Submitted Applications (${admissions.length})</button>
        <button class="btn btn-secondary admin-tab-btn" data-tab="leadership">Leadership Directory</button>
        <button class="btn btn-secondary admin-tab-btn" data-tab="credentials">Security & Access</button>
        <button class="btn btn-secondary admin-tab-btn" data-tab="audit">Audit Trail (${logs.length})</button>
      </div>

      <div id="admin-tab-content"></div>
    `;

    this.bindEvents(container);
    this.renderTab('admissions-builder');
  }

  static async renderTab(tabKey) {
    const tabContent = document.getElementById('admin-tab-content');
    if (!tabContent) return;

    if (tabKey === 'admissions-builder') {
      const conf = JSON.parse(localStorage.getItem('tms_admission_config')) || TMS_CONFIG.admissionFormDefaults;

      tabContent.innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
          <div class="card-header">
            <div>
              <h3 class="card-title">Admission Form & Fee Structure Builder</h3>
              <p class="card-desc">Configure academic session, admission fee schedule, guidelines, and form fields for THAIBA MODEL SCHOOL.</p>
            </div>
            <button class="btn btn-primary" id="btn-save-admission-builder"><i data-lucide="save"></i> Save Configuration</button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
            <!-- Session & Test Centre Settings -->
            <div>
              <h4 style="font-size: 1rem; color: #16a34a; margin-bottom: 14px;">General Parameters</h4>
              <div class="form-group">
                <label class="form-label">Academic Session Title</label>
                <input class="form-input" id="cfg-session" value="${conf.session || '2025 - 2026'}">
              </div>
              <div class="form-group">
                <label class="form-label">Application Form Fee (₹)</label>
                <input type="number" class="form-input" id="cfg-form-fee" value="${conf.formFee || 300}">
              </div>
              <div class="form-group">
                <label class="form-label">Admission Test & Screening Centre</label>
                <input class="form-input" id="cfg-test-centre" value="${conf.testCentre || 'Campus Main Auditorium, Baghait, Tapan'}">
              </div>
            </div>

            <!-- Form Instructions -->
            <div>
              <h4 style="font-size: 1rem; color: #16a34a; margin-bottom: 14px;">Candidate Instructions</h4>
              <div class="form-group">
                <label class="form-label">Instructions (One per line)</label>
                <textarea class="form-textarea" id="cfg-instructions" rows="7">${(conf.instructions || []).join('\n')}</textarea>
              </div>
            </div>
          </div>

          <!-- Fee Structure Builder -->
          <div style="border-top: 1px solid var(--border-color); padding-top: 20px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div>
                <h4 style="font-size: 1rem; color: #16a34a;">Fee Structure Components</h4>
                <p style="font-size: 0.8rem; color: var(--text-muted);">Set fees, types (One-Time, Quarterly, Annual), and amounts displayed to parents and on admission documents.</p>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-add-fee-row"><i data-lucide="plus"></i> Add Fee Head</button>
            </div>

            <div class="table-responsive">
              <table class="tms-table" id="builder-fees-table">
                <thead>
                  <tr>
                    <th>Fee Name / Head</th>
                    <th>Payment Schedule</th>
                    <th>Amount (₹)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="builder-fees-tbody">
                  ${(conf.feeStructure || []).map((f, i) => `
                    <tr data-index="${i}">
                      <td><input class="form-input fee-name" value="${f.name}"></td>
                      <td>
                        <select class="form-select fee-type">
                          <option ${f.type === 'One-Time' ? 'selected' : ''}>One-Time</option>
                          <option ${f.type === 'Quarterly' ? 'selected' : ''}>Quarterly</option>
                          <option ${f.type === 'Annual' ? 'selected' : ''}>Annual</option>
                          <option ${f.type === 'Monthly' ? 'selected' : ''}>Monthly</option>
                        </select>
                      </td>
                      <td><input type="number" class="form-input fee-amount" value="${f.amount}" style="width: 120px;"></td>
                      <td>
                        <button class="btn btn-secondary btn-sm btn-del-fee" style="color: #ef4444;"><i data-lucide="trash-2"></i></button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      `;

      // Bind Builder Events
      document.getElementById('btn-add-fee-row').addEventListener('click', () => {
        const tbody = document.getElementById('builder-fees-tbody');
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><input class="form-input fee-name" placeholder="New Fee Head Name" value="Special Activity Fee"></td>
          <td>
            <select class="form-select fee-type">
              <option>Annual</option>
              <option>One-Time</option>
              <option>Quarterly</option>
              <option>Monthly</option>
            </select>
          </td>
          <td><input type="number" class="form-input fee-amount" value="1000" style="width: 120px;"></td>
          <td>
            <button class="btn btn-secondary btn-sm btn-del-fee" style="color: #ef4444;"><i data-lucide="trash-2"></i></button>
          </td>
        `;
        tbody.appendChild(tr);
        UIComponents.refreshIcons();
        tr.querySelector('.btn-del-fee').addEventListener('click', () => tr.remove());
      });

      tabContent.querySelectorAll('.btn-del-fee').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.currentTarget.closest('tr').remove();
        });
      });

      document.getElementById('btn-save-admission-builder').addEventListener('click', async () => {
        const session = document.getElementById('cfg-session').value;
        const formFee = parseFloat(document.getElementById('cfg-form-fee').value) || 300;
        const testCentre = document.getElementById('cfg-test-centre').value;
        const instructions = document.getElementById('cfg-instructions').value.split('\n').filter(Boolean);

        const feeRows = document.querySelectorAll('#builder-fees-tbody tr');
        const feeStructure = [];
        feeRows.forEach((r, idx) => {
          const name = r.querySelector('.fee-name').value;
          const type = r.querySelector('.fee-type').value;
          const amount = parseFloat(r.querySelector('.fee-amount').value) || 0;
          if (name) {
            feeStructure.push({ id: `fee_${idx}`, name, type, amount, mandatory: true });
          }
        });

        const newConfig = {
          session,
          formFee,
          testCentre,
          instructions,
          feeStructure
        };

        localStorage.setItem('tms_admission_config', JSON.stringify(newConfig));
        await auditService.log('ADMISSION_CONFIG_UPDATED', 'GOVERNANCE', { session, feeCount: feeStructure.length });
        UIComponents.showToast('Admission form structure & fee schedule updated successfully!', 'success');
      });

    } else if (tabKey === 'applications-list') {
      const admissions = await dbService.select('admissions_applications');

      tabContent.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Submitted Online & Offline Applications</h3>
              <p class="card-desc">Official candidate enrollment applications registered in THAIBA MODEL SCHOOL database.</p>
            </div>
            <a href="student-admission-portal.html" target="_blank" class="btn btn-primary"><i data-lucide="plus"></i> New Application</a>
          </div>

          <div class="table-responsive">
            <table class="tms-table font-mono" style="font-size: 0.85rem;">
              <thead>
                <tr>
                  <th>Form No</th>
                  <th>Student Candidate</th>
                  <th>Applying Class</th>
                  <th>Guardian</th>
                  <th>Contact Phone</th>
                  <th>Status</th>
                  <th>Print A4 PDF</th>
                </tr>
              </thead>
              <tbody>
                ${admissions.length === 0 ? `
                  <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No admission applications recorded yet.</td></tr>
                ` : admissions.map(a => `
                  <tr>
                    <td><strong>${a.app_id || a.id}</strong></td>
                    <td style="font-family: var(--font-sans); font-weight: 700;">${a.student_name}</td>
                    <td><span class="badge badge-info">${a.grade}</span></td>
                    <td style="font-family: var(--font-sans);">${a.guardian_name}</td>
                    <td>${a.phone}</td>
                    <td><span class="badge badge-success">${a.status || 'Active'}</span></td>
                    <td>
                      <a href="student-admission-portal.html" target="_blank" class="btn btn-secondary btn-sm" title="Print A4 Admission Form & Admit Card">
                        <i data-lucide="printer"></i> Print A4 Form
                      </a>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (tabKey === 'leadership') {
      tabContent.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">School Leadership & Governing Directorate</h3>
            <span class="badge badge-success">Single-Institution Governance</span>
          </div>
          <div class="table-responsive">
            <table class="tms-table">
              <thead>
                <tr>
                  <th>Designation / Office</th>
                  <th>Official Identity</th>
                  <th>Institutional Email</th>
                  <th>Authority Scope</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background: rgba(22, 163, 74, 0.04);">
                  <td><strong>Super Administrator & Executive Director</strong></td>
                  <td><strong>C. M. Basith</strong></td>
                  <td><span class="font-mono" style="color: #16a34a; font-weight: 700;">cmbasith786@gmail.com</span></td>
                  <td><span class="badge badge-success">Highest Level Super Admin</span></td>
                  <td><span class="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td><strong>Academic Principal</strong></td>
                  <td>Dr. Zubair Al-Qasimi</td>
                  <td><span class="font-mono">principal@thaibaschool.edu.in</span></td>
                  <td><span class="badge badge-info">Academics & Faculty</span></td>
                  <td><span class="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td><strong>Chief Bursar & Finance Manager</strong></td>
                  <td>Mr. Sameer Babu</td>
                  <td><span class="font-mono">accounts@thaibaschool.edu.in</span></td>
                  <td><span class="badge badge-warning">Finance & Collections</span></td>
                  <td><span class="badge badge-success">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (tabKey === 'credentials') {
      tabContent.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Security & Credential Management</h3>
            <span class="badge badge-info">Supabase Cloud Authentication Active</span>
          </div>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 16px;">
            Higher-Level Super Administrator: <strong>cmbasith786@gmail.com</strong> possesses full system governance. Plaintext passwords are never retrievable.
          </p>
          <div style="background: rgba(22, 163, 74, 0.05); padding: 18px; border-radius: var(--radius-md); border: 1px solid #16a34a;">
            <h4 style="color: #15803d; margin-bottom: 6px;">Super Administrator Account</h4>
            <div style="font-size: 0.88rem;">Email: <strong>cmbasith786@gmail.com</strong> • Full Authority Scope: <strong>School-Wide</strong></div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">Role-Based Access Control verified against Supabase Auth engine.</div>
          </div>
        </div>
      `;
    } else if (tabKey === 'audit') {
      const logs = await auditService.getLogs();
      tabContent.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Immutable Audit Trail</h3>
            <span class="badge badge-info">${logs.length} Logged Events</span>
          </div>
          <div class="table-responsive">
            <table class="tms-table font-mono" style="font-size: 0.82rem;">
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Timestamp</th>
                  <th>Operator</th>
                  <th>Action</th>
                  <th>Entity Reference</th>
                </tr>
              </thead>
              <tbody>
                ${logs.length === 0 ? `
                  <tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">No audit events recorded yet.</td></tr>
                ` : logs.map(l => `
                  <tr>
                    <td><strong>${l.id}</strong></td>
                    <td>${new Date(l.timestamp).toLocaleString()}</td>
                    <td>${l.userName} (${l.userRole})</td>
                    <td><span class="badge badge-warning">${l.action}</span></td>
                    <td>${l.entityRef || '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    UIComponents.refreshIcons();
  }

  static bindEvents(container) {
    container.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        container.querySelectorAll('.admin-tab-btn').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
        e.currentTarget.classList.remove('btn-secondary');
        e.currentTarget.classList.add('btn-primary');
        this.renderTab(e.currentTarget.dataset.tab);
      });
    });

    const calBtn = container.querySelector('#btn-academic-calendar');
    if (calBtn) {
      calBtn.addEventListener('click', () => {
        UIComponents.openModal({
          title: 'THAIBA MODEL SCHOOL — Academic Calendar',
          bodyHtml: `
            <div style="font-size: 0.9rem; line-height: 1.6;">
              <p><strong>Official Academic Session:</strong> ${TMS_CONFIG.academic.currentYear}</p>
              <ul style="margin: 12px 0 12px 20px;">
                <li>Admission Applications Open: November 1, 2024</li>
                <li>Entrance Screening & Interviews: December 15 - January 10</li>
                <li>Academic Session Commences: April 2, 2025</li>
              </ul>
            </div>
          `
        });
      });
    }
  }
}

export default AdminModule;
