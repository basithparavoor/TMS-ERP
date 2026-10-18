/**
 * THAIBA MODEL SCHOOL — Staff & Human Resources Module
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { UIComponents } from './ui-components.js';
import { auditService } from './audit-service.js';

export class StaffModule {
  static async render(container) {
    const staff = await dbService.select('staff');

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem;">Staff & Human Resources</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Faculty registry, departments, designations, employment contracts, and salary structures for THAIBA MODEL SCHOOL.
            </p>
          </div>
          <button class="btn btn-primary" id="btn-add-staff"><i data-lucide="user-plus"></i> Appoint New Staff</button>
        </div>
      </div>

      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'Total Faculty & Staff', value: `${staff.length}`, icon: 'briefcase', color: 'blue', subtitle: 'Permanent & Contracted' })}
        ${UIComponents.renderKpiCard({ title: 'Teaching Faculty', value: '32', icon: 'graduation-cap', color: 'emerald', subtitle: 'High School & Secondary' })}
        ${UIComponents.renderKpiCard({ title: 'Non-Teaching / Support', value: '14', icon: 'wrench', color: 'amber', subtitle: 'Admin, Lab & Transport' })}
        ${UIComponents.renderKpiCard({ title: 'Monthly Payroll Budget', value: '₹ 18.4 L', icon: 'wallet', color: 'rose', subtitle: 'Authorized CTC' })}
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Employees Directory</h3>
            <p class="card-desc">Comprehensive staff roster with designation, assigned department, and appointment records.</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="tms-table" id="staff-table">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Contact Phone</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${staff.map(emp => `
                <tr>
                  <td><span class="font-mono" style="font-weight: 600;">${emp.empId}</span></td>
                  <td>
                    <strong>${emp.name}</strong>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${emp.email}</div>
                  </td>
                  <td>${emp.department}</td>
                  <td><strong>${emp.designation}</strong></td>
                  <td class="font-mono" style="font-size: 0.82rem;">${emp.phone}</td>
                  <td>${emp.joiningDate}</td>
                  <td><span class="badge badge-success">${emp.status}</span></td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="alert('Viewing comprehensive personnel file and contract for ${emp.name}')">
                      <i data-lucide="file-text"></i> Service File
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindEvents(container);
    UIComponents.refreshIcons();
  }

  static bindEvents(container) {
    const addBtn = container.querySelector('#btn-add-staff');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        UIComponents.openModal({
          title: 'Appoint New Staff Member — Thaiba Model School',
          bodyHtml: `
            <form id="form-new-staff">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div class="form-group">
                  <label class="form-label">Full Name</label>
                  <input class="form-input" id="stf-name" required placeholder="e.g. Mrs. Khadija Beevi">
                </div>
                <div class="form-group">
                  <label class="form-label">Official Email</label>
                  <input type="email" class="form-input" id="stf-email" required placeholder="khadija@thaibaschool.edu.in">
                </div>
                <div class="form-group">
                  <label class="form-label">Role Category</label>
                  <select class="form-select" id="stf-role">
                    <option value="teacher">Teaching Faculty</option>
                    <option value="coordinator">Academic Coordinator</option>
                    <option value="finance">Finance & Accounts</option>
                    <option value="hr">HR & Administration</option>
                    <option value="librarian">Librarian</option>
                    <option value="operations">Operations & Transport</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Department</label>
                  <input class="form-input" id="stf-dept" required placeholder="e.g. Science / English / IT">
                </div>
                <div class="form-group">
                  <label class="form-label">Designation</label>
                  <input class="form-input" id="stf-desig" required placeholder="e.g. PGT Physics">
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input class="form-input" id="stf-phone" required placeholder="+91 98470 12345">
                </div>
                <div class="form-group">
                  <label class="form-label">Basic Salary (₹)</label>
                  <input type="number" class="form-input" id="stf-salary" value="45000">
                </div>
                <div class="form-group">
                  <label class="form-label">Joining Date</label>
                  <input type="date" class="form-input" id="stf-joining" value="${new Date().toISOString().split('T')[0]}">
                </div>
              </div>
            </form>
          `,
          footerHtml: `
            <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
            <button class="btn btn-primary" id="btn-save-staff">Issue Appointment</button>
          `
        });

        document.getElementById('btn-save-staff').addEventListener('click', async () => {
          const name = document.getElementById('stf-name').value;
          const email = document.getElementById('stf-email').value;
          const role = document.getElementById('stf-role').value;
          const department = document.getElementById('stf-dept').value;
          const designation = document.getElementById('stf-desig').value;
          const phone = document.getElementById('stf-phone').value;
          const basicPay = parseFloat(document.getElementById('stf-salary').value) || 35000;
          const joiningDate = document.getElementById('stf-joining').value;

          if (!name || !email) {
            UIComponents.showToast('Please enter employee name and email', 'warning');
            return;
          }

          const staffCount = (await dbService.select('staff')).length + 1;
          const empId = `TMS-EMP-${staffCount.toString().padStart(3, '0')}`;

          const newStaff = await dbService.insert('staff', {
            empId,
            name,
            email,
            role,
            department,
            designation,
            phone,
            basicPay,
            joiningDate,
            status: 'Active'
          });

          await auditService.log('STAFF_APPOINTED', 'HR', { empId, name, designation, department }, newStaff.id);
          UIComponents.closeModal();
          UIComponents.showToast(`Staff member ${name} appointed successfully!`, 'success');
          StaffModule.render(container);
        });
      });
    }
  }
}

export default StaffModule;
