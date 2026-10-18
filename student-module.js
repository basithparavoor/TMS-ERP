/**
 * THAIBA MODEL SCHOOL — Student Lifecycle, Admissions & Identity Module
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { UIComponents } from './ui-components.js';
import { auditService } from './audit-service.js';

export class StudentModule {
  static async render(container) {
    const students = await dbService.select('students');

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem;">Student Lifecycle & Directory</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Student information system, admissions pipeline, guardian records, and printable biometric ID cards.
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <a href="student-admission-portal.html" target="_blank" class="btn btn-secondary"><i data-lucide="file-text"></i> Admission Form (A4)</a>
            <button class="btn btn-primary" id="btn-new-admission"><i data-lucide="user-plus"></i> New Enrollment</button>
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'Total Enrolled Students', value: `${students.length}`, icon: 'users', color: 'blue', subtitle: 'Academic Year 2024-25' })}
        ${UIComponents.renderKpiCard({ title: 'Active Students', value: `${students.filter(s => s.status === 'Active').length}`, icon: 'check-circle', color: 'emerald', subtitle: 'Regular Attendance' })}
        ${UIComponents.renderKpiCard({ title: 'New Admissions', value: '18 Applied', icon: 'file-text', color: 'amber', subtitle: 'Pending Verification' })}
        ${UIComponents.renderKpiCard({ title: 'Fee Clearance Ratio', value: '91.8%', icon: 'receipt', color: 'rose', subtitle: 'Term 1 Invoices' })}
      </div>

      <!-- Students List Card -->
      <div class="card">
        <div class="card-header">
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; width: 100%;">
            <h3 class="card-title">Enrolled Students Roster</h3>
            <div style="margin-left: auto; display: flex; gap: 10px;">
              <input type="text" class="form-input" id="search-student-input" placeholder="Search by name or admission no..." style="width: 260px; padding: 6px 12px;">
            </div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="tms-table" id="students-table">
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Roll</th>
                <th>Student Full Name</th>
                <th>Class & Section</th>
                <th>Guardian Contact</th>
                <th>Blood Group</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(s => `
                <tr data-student-row="${s.id}">
                  <td><span class="font-mono" style="font-weight: 600;">${s.admissionNo}</span></td>
                  <td><strong>${s.rollNo}</strong></td>
                  <td>
                    <strong>${s.fullName}</strong>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${s.gender} • DOB: ${s.dob}</div>
                  </td>
                  <td>${s.grade} - ${s.section}</td>
                  <td>
                    <div>${s.guardianName}</div>
                    <small style="color: var(--text-muted); font-family: var(--font-mono);">${s.guardianPhone}</small>
                  </td>
                  <td><span class="badge badge-info">${s.bloodGroup}</span></td>
                  <td><span class="badge badge-success">${s.status}</span></td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-secondary btn-sm btn-print-id" data-id="${s.id}" title="Print ID Card"><i data-lucide="id-card"></i> ID</button>
                      <button class="btn btn-secondary btn-sm btn-view-profile" data-id="${s.id}" title="View Details"><i data-lucide="eye"></i> View</button>
                    </div>
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
    const searchInput = container.querySelector('#search-student-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const rows = container.querySelectorAll('#students-table tbody tr');
        rows.forEach(row => {
          const text = row.innerText.toLowerCase();
          row.style.display = text.includes(query) ? '' : 'none';
        });
      });
    }

    const newAdmBtn = container.querySelector('#btn-new-admission');
    if (newAdmBtn) {
      newAdmBtn.addEventListener('click', () => {
        UIComponents.openModal({
          title: 'Enroll New Student — THAIBA MODEL SCHOOL',
          bodyHtml: `
            <form id="form-enroll-student">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div class="form-group">
                  <label class="form-label">Full Name</label>
                  <input class="form-input" id="adm-fullname" required placeholder="e.g. Adil Mansoor">
                </div>
                <div class="form-group">
                  <label class="form-label">Date of Birth</label>
                  <input type="date" class="form-input" id="adm-dob" required value="2010-06-15">
                </div>
                <div class="form-group">
                  <label class="form-label">Gender</label>
                  <select class="form-select" id="adm-gender">
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Blood Group</label>
                  <select class="form-select" id="adm-blood">
                    <option>O+</option><option>O-</option><option>A+</option><option>A-</option>
                    <option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Class / Grade</label>
                  <select class="form-select" id="adm-grade">
                    ${TMS_CONFIG.academic.classes.map(c => `<option value="${c}">${c}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Section</label>
                  <select class="form-select" id="adm-section">
                    <option>A</option><option>B</option><option>C</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Guardian Name</label>
                  <input class="form-input" id="adm-guardian" required placeholder="Father / Mother Name">
                </div>
                <div class="form-group">
                  <label class="form-label">Guardian Phone</label>
                  <input class="form-input" id="adm-phone" required placeholder="+91 98470 00000">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Residential Address</label>
                <textarea class="form-textarea" id="adm-address" rows="2" placeholder="Full residential address"></textarea>
              </div>
            </form>
          `,
          footerHtml: `
            <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
            <button class="btn btn-primary" id="btn-save-enrollment">Confirm Enrollment</button>
          `
        });

        document.getElementById('btn-save-enrollment').addEventListener('click', async () => {
          const fullName = document.getElementById('adm-fullname').value;
          const dob = document.getElementById('adm-dob').value;
          const gender = document.getElementById('adm-gender').value;
          const bloodGroup = document.getElementById('adm-blood').value;
          const grade = document.getElementById('adm-grade').value;
          const section = document.getElementById('adm-section').value;
          const guardianName = document.getElementById('adm-guardian').value;
          const guardianPhone = document.getElementById('adm-phone').value;
          const address = document.getElementById('adm-address').value;

          if (!fullName) {
            UIComponents.showToast('Please enter student full name', 'warning');
            return;
          }

          const count = (await dbService.select('students')).length + 1;
          const admissionNo = `TMS/2024/${count.toString().padStart(3, '0')}`;
          const rollNo = count.toString().padStart(2, '0');

          const newStudent = await dbService.insert('students', {
            admissionNo,
            rollNo,
            fullName,
            dob,
            gender,
            bloodGroup,
            grade,
            section,
            guardianName,
            guardianPhone,
            address,
            status: 'Active',
            leaveStatus: null
          });

          await auditService.log('STUDENT_ENROLLED', 'ACADEMIC', { admissionNo, fullName, grade }, newStudent.id);
          UIComponents.closeModal();
          UIComponents.showToast(`Student ${fullName} enrolled with ID ${admissionNo}!`, 'success');
          StudentModule.render(container);
        });
      });
    }

    // ID Card generator
    container.querySelectorAll('.btn-print-id').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const students = await dbService.select('students');
        const s = students.find(item => item.id === id);
        if (!s) return;

        UIComponents.openModal({
          title: `Printable Smart ID Card — ${s.fullName}`,
          bodyHtml: `
            <div id="printable-id-card" style="width: 340px; margin: 0 auto; background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 2px solid #3b82f6; text-align: center; position: relative;">
              <div style="font-family: var(--font-display); font-weight: 800; font-size: 1.15rem; letter-spacing: 0.05em; color: #60a5fa;">
                ${TMS_CONFIG.institution.name}
              </div>
              <div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 14px;">
                ${TMS_CONFIG.institution.tagline}
              </div>

              <div style="width: 86px; height: 86px; border-radius: 50%; border: 3px solid #3b82f6; margin: 0 auto 12px; overflow: hidden; background: #334155; display: flex; align-items: center; justify-content: center;">
                <i data-lucide="user" style="width: 48px; height: 48px; color: #94a3b8;"></i>
              </div>

              <div style="font-size: 1.1rem; font-weight: 700; color: #fff;">${s.fullName}</div>
              <div style="font-size: 0.82rem; color: #38bdf8; font-weight: 600; margin-bottom: 8px;">${s.grade} • Sec ${s.section} • Roll #${s.rollNo}</div>

              <div style="background: rgba(255,255,255,0.06); padding: 8px 12px; border-radius: 8px; font-size: 0.78rem; text-align: left; margin-bottom: 12px;">
                <div><strong>Adm No:</strong> ${s.admissionNo}</div>
                <div><strong>Blood Group:</strong> ${s.bloodGroup}</div>
                <div><strong>Emergency:</strong> ${s.guardianPhone}</div>
              </div>

              <!-- Embedded QR for identification & attendance -->
              <div style="background: #fff; padding: 8px; border-radius: 8px; display: inline-block;">
                <div style="width: 70px; height: 70px; background: #000; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.65rem; text-align: center;">
                  [QR SECURE<br>${s.admissionNo}]
                </div>
              </div>
              <div style="font-size: 0.65rem; color: #94a3b8; margin-top: 6px;">Biometric QR & NFC Attendance Enabled</div>
            </div>
          `,
          footerHtml: `
            <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Close</button>
            <button class="btn btn-primary" onclick="window.print()"><i data-lucide="printer"></i> Print ID Card</button>
          `
        });
      });
    });
  }
}

export default StudentModule;
