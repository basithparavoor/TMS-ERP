/**
 * THAIBA MODEL SCHOOL — School Administration & Governance Module
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { auditService } from './audit-service.js';
import { UIComponents } from './ui-components.js';

export class AdminModule {
  static async render(container) {
    const logs = await auditService.getLogs();
    const facilities = await dbService.select('facilities');

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem;">School Administration & Governance</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Executive governance, school profile, leadership directory, and immutable audit trails.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" id="btn-export-audit"><i data-lucide="download"></i> Export Audit Trail</button>
            <button class="btn btn-primary" id="btn-academic-calendar"><i data-lucide="calendar"></i> School Calendar</button>
          </div>
        </div>
      </div>

      <!-- School Profile Overview Card -->
      <div class="card" style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
          <div class="brand-badge" style="font-size: 1.8rem; padding: 16px 24px;">TMS</div>
          <div style="flex: 1; min-width: 250px;">
            <h2 style="font-size: 1.4rem;">${TMS_CONFIG.institution.name}</h2>
            <p style="color: var(--text-muted); font-size: 0.88rem;">${TMS_CONFIG.institution.tagline} • Affiliation: ${TMS_CONFIG.institution.affiliation}</p>
            <div style="display: flex; gap: 16px; margin-top: 8px; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap;">
              <span><i data-lucide="map-pin" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${TMS_CONFIG.institution.address.campus}, ${TMS_CONFIG.institution.address.city}</span>
              <span><i data-lucide="phone" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${TMS_CONFIG.institution.contact.phone}</span>
              <span><i data-lucide="mail" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${TMS_CONFIG.institution.contact.email}</span>
            </div>
          </div>
          <div>
            <span class="badge badge-success" style="padding: 6px 14px; font-size: 0.82rem;">Academic Year: ${TMS_CONFIG.academic.currentYear} Active</span>
          </div>
        </div>
      </div>

      <!-- Admin Tabs -->
      <div style="display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
        <button class="btn btn-primary admin-tab-btn" data-tab="leadership">Leadership & Staff Directory</button>
        <button class="btn btn-secondary admin-tab-btn" data-tab="credentials">Credential Management</button>
        <button class="btn btn-secondary admin-tab-btn" data-tab="audit">Immutable Audit Trail (${logs.length})</button>
      </div>

      <div id="admin-tab-content"></div>
    `;

    this.bindEvents(container);
    this.renderTab('leadership');
  }

  static renderTab(tabKey) {
    const tabContent = document.getElementById('admin-tab-content');
    if (!tabContent) return;

    if (tabKey === 'leadership') {
      tabContent.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">School Leadership & Executive Directory</h3>
              <p class="card-desc">Authorized administrators, principal, vice-principal, and academic coordinators of Thaiba Model School.</p>
            </div>
          </div>
          <div class="table-responsive">
            <table class="tms-table">
              <thead>
                <tr>
                  <th>Designation / Office</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Contact Email</th>
                  <th>Authority Scope</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Principal & Academic Director</strong></td>
                  <td>Dr. Zubair Al-Qasimi</td>
                  <td>Executive Leadership</td>
                  <td>principal@thaibaschool.edu.in</td>
                  <td><span class="badge badge-info">School-Wide Oversight</span></td>
                  <td><span class="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td><strong>Vice Principal</strong></td>
                  <td>Prof. K. K. Abdulla</td>
                  <td>Academic Governance</td>
                  <td>viceprincipal@thaibaschool.edu.in</td>
                  <td><span class="badge badge-info">Academics & Faculty</span></td>
                  <td><span class="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td><strong>Chief Bursar & Finance Manager</strong></td>
                  <td>Mr. Sameer Babu</td>
                  <td>Finance & Accounts</td>
                  <td>accounts@thaibaschool.edu.in</td>
                  <td><span class="badge badge-warning">Finance & Ledgers</span></td>
                  <td><span class="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td><strong>Academic Coordinator (Senior Secondary)</strong></td>
                  <td>Mrs. Aysha Mariyam</td>
                  <td>High School / Higher Secondary</td>
                  <td>coordinator@thaibaschool.edu.in</td>
                  <td><span class="badge badge-info">Curriculum & Exams</span></td>
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
            <div>
              <h3 class="card-title">User Credential Management & Access Control</h3>
              <p class="card-desc">Security Policy: Existing user passwords are encrypted and never shown. Initiate secure password resets and temporary tokens here.</p>
            </div>
            <button class="btn btn-primary" id="btn-issue-temp-cred"><i data-lucide="key"></i> Issue Temporary Access</button>
          </div>
          
          <div class="table-responsive">
            <table class="tms-table">
              <thead>
                <tr>
                  <th>User Identity</th>
                  <th>Role</th>
                  <th>Access Scope</th>
                  <th>MFA / Auth Method</th>
                  <th>Last Password Reset</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Dr. Zubair Al-Qasimi<br><small style="color:var(--text-muted)">principal@thaibaschool.edu.in</small></td>
                  <td>Principal</td>
                  <td>School Wide</td>
                  <td>Supabase Cloud Auth</td>
                  <td>2024-06-15</td>
                  <td><button class="btn btn-secondary btn-sm" onclick="alert('Password reset link dispatched to official email.')">Send Reset Link</button></td>
                </tr>
                <tr>
                  <td>Prof. Rashid Rahman<br><small style="color:var(--text-muted)">rashid.rahman@thaibaschool.edu.in</small></td>
                  <td>Senior Teacher</td>
                  <td>Assigned Class (9A)</td>
                  <td>Supabase Cloud Auth</td>
                  <td>2024-08-01</td>
                  <td><button class="btn btn-secondary btn-sm" onclick="alert('Temporary 24h credential generated and sent.')">Reset Credential</button></td>
                </tr>
                <tr>
                  <td>Mr. Sameer Babu<br><small style="color:var(--text-muted)">accounts@thaibaschool.edu.in</small></td>
                  <td>Finance Manager</td>
                  <td>Finance Scope</td>
                  <td>Supabase Cloud Auth</td>
                  <td>2024-05-10</td>
                  <td><button class="btn btn-secondary btn-sm" onclick="alert('Password reset link dispatched.')">Send Reset Link</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (tabKey === 'audit') {
      const logs = dbService.getLocal('audit_logs');
      tabContent.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Immutable System Audit Trail</h3>
              <p class="card-desc">Append-only operational history capturing logins, modifications, financial transactions, and attendance corrections.</p>
            </div>
            <span class="badge badge-info">${logs.length} Logged Events</span>
          </div>

          <div class="table-responsive">
            <table class="tms-table font-mono" style="font-size: 0.82rem;">
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Timestamp</th>
                  <th>User / Operator</th>
                  <th>Role</th>
                  <th>Category</th>
                  <th>Action</th>
                  <th>Entity Reference</th>
                </tr>
              </thead>
              <tbody>
                ${logs.length === 0 ? `
                  <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No audit events recorded yet in this session.</td></tr>
                ` : logs.map(l => `
                  <tr>
                    <td><strong>${l.id}</strong></td>
                    <td>${new Date(l.timestamp).toLocaleString()}</td>
                    <td>${l.userName}</td>
                    <td><span class="badge badge-info">${l.userRole}</span></td>
                    <td><span class="badge badge-warning">${l.category}</span></td>
                    <td>${l.action}</td>
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

    const exportBtn = container.querySelector('#btn-export-audit');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const logs = dbService.getLocal('audit_logs');
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TMS-Audit-Trail-${Date.now()}.json`;
        a.click();
        UIComponents.showToast('Audit trail exported successfully', 'success');
      });
    }

    const calBtn = container.querySelector('#btn-academic-calendar');
    if (calBtn) {
      calBtn.addEventListener('click', () => {
        UIComponents.openModal({
          title: 'THAIBA MODEL SCHOOL — Academic Calendar',
          bodyHtml: `
            <div style="font-size: 0.9rem; line-height: 1.6;">
              <p><strong>Current Academic Session:</strong> ${TMS_CONFIG.academic.currentYear}</p>
              <ul style="margin: 12px 0 12px 20px;">
                <li>Term 1 Commences: June 3, 2024</li>
                <li>Mid-Term Examinations: October 20-30, 2024</li>
                <li>Annual Sports Meet: November 15, 2024</li>
                <li>Term 2 / Pre-Board Exams: January 12-22, 2025</li>
                <li>Annual Final Board Examination: March 5-25, 2025</li>
              </ul>
              <p style="color: var(--text-muted); font-size: 0.82rem;">Authorized by Executive Council, Thaiba Model School.</p>
            </div>
          `
        });
      });
    }
  }
}

export default AdminModule;
