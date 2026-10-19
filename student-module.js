/**
 * THAIBA MODEL SCHOOL — Student Lifecycle, Admissions & Identity Module
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { UIComponents } from './ui-components.js';
import { auditService } from './audit-service.js';
import { PermissionEngine, CAPABILITIES } from './permission-engine.js';
import { downloadCsv } from './export-utils.js';

export class StudentModule {
  static async render(container) {
    const students = await dbService.select('students');
    const esc = (v) => UIComponents.escapeHtml(v);
    const canManage = PermissionEngine.can(CAPABILITIES.MANAGE_STUDENTS);

    const applications = await dbService.select('admissions_applications');
    const invoices = await dbService.select('invoices');
    this._students = students;
    const totalBilled = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + (inv.paid || 0), 0);
    const clearanceValue = totalBilled > 0 ? `${((totalCollected / totalBilled) * 100).toFixed(1)}%` : '—';

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
            ${canManage ? `<button class="btn btn-primary" id="btn-new-admission"><i data-lucide="user-plus"></i> New Enrollment</button>` : ''}
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'Total Enrolled Students', value: `${students.length}`, icon: 'users', color: 'blue', subtitle: TMS_CONFIG.academic.currentYear })}
        ${UIComponents.renderKpiCard({ title: 'Active Students', value: `${students.filter(s => s.status === 'Active').length}`, icon: 'check-circle', color: 'emerald', subtitle: 'Regular Attendance' })}
        ${UIComponents.renderKpiCard({ title: 'New Admissions', value: `${applications.length} Applied`, icon: 'file-text', color: 'amber', subtitle: 'Submitted Applications' })}
        ${UIComponents.renderKpiCard({ title: 'Fee Clearance Ratio', value: clearanceValue, icon: 'receipt', color: 'rose', subtitle: 'Term 1 Invoices' })}
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

        ${canManage ? `
        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:12px;">
          <button class="btn btn-secondary btn-sm" id="btn-students-select-all"><i data-lucide="check-square"></i> Select All</button>
          <button class="btn btn-secondary btn-sm" id="btn-students-clear">Clear</button>
          <button class="btn btn-secondary btn-sm" id="btn-students-bulk-activate"><i data-lucide="check-circle"></i> Set Active</button>
          <button class="btn btn-secondary btn-sm" id="btn-students-bulk-export"><i data-lucide="download"></i> Export Selected</button>
          <button class="btn btn-secondary btn-sm" id="btn-students-bulk-delete" style="color:#ef4444;"><i data-lucide="trash-2"></i> Delete Selected (<span id="students-selected-count">0</span>)</button>
        </div>` : ''}

        <div class="table-responsive">
          <table class="tms-table" id="students-table">
            <thead>
              <tr>
                ${canManage ? '<th style="width:34px;"><input type="checkbox" id="students-select-all-cb"></th>' : ''}
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
              ${students.length ? students.map(s => `
                <tr data-student-row="${esc(s.id)}">
                  ${canManage ? `<td><input type="checkbox" class="student-row-check" value="${esc(s.id)}"></td>` : ''}
                  <td><span class="font-mono" style="font-weight: 600;">${esc(s.admissionNo)}</span></td>
                  <td><strong>${esc(s.rollNo)}</strong></td>
                  <td>
                    <strong>${esc(s.fullName)}</strong>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${esc(s.gender)} • DOB: ${esc(s.dob)}</div>
                  </td>
                  <td>${esc(s.grade)} - ${esc(s.section)}</td>
                  <td>
                    <div>${esc(s.guardianName)}</div>
                    <small style="color: var(--text-muted); font-family: var(--font-mono);">${esc(s.guardianPhone)}</small>
                  </td>
                  <td><span class="badge badge-info">${esc(s.bloodGroup)}</span></td>
                  <td><span class="badge ${s.status === 'Active' ? 'badge-success' : 'badge-warning'}">${esc(s.status)}</span></td>
                  <td>
                    <div style="display: flex; gap: 6px; flex-wrap:wrap;">
                      <button class="btn btn-secondary btn-sm btn-print-id" data-id="${esc(s.id)}" title="Print ID Card"><i data-lucide="id-card"></i> ID</button>
                      <button class="btn btn-secondary btn-sm btn-view-profile" data-id="${esc(s.id)}" title="View Details"><i data-lucide="eye"></i> View</button>
                      ${canManage ? `
                      <button class="btn btn-secondary btn-sm btn-edit-student" data-id="${esc(s.id)}" title="Edit student"><i data-lucide="pencil"></i></button>
                      <button class="btn btn-secondary btn-sm btn-del-student" data-id="${esc(s.id)}" title="Delete student" style="color:#ef4444;"><i data-lucide="trash-2"></i></button>` : ''}
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="${canManage ? 9 : 8}" style="text-align: center; color: var(--text-muted); padding: 30px;">No records available yet.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindEvents(container);
    UIComponents.refreshIcons();
  }

  static openStudentEditModal(student, container) {
    const esc = (v) => UIComponents.escapeHtml(v);
    const s = student || {};
    const bodyHtml = `
      <form id="form-edit-student">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Admission No</label>
            <input class="form-input font-mono" id="ed-admission" value="${esc(s.admissionNo || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Roll No</label>
            <input class="form-input" id="ed-roll" value="${esc(s.rollNo || '')}">
          </div>
          <div class="form-group" style="grid-column:1/-1;">
            <label class="form-label">Full Name *</label>
            <input class="form-input" id="ed-name" value="${esc(s.fullName || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Gender</label>
            <select class="form-select" id="ed-gender">
              <option ${s.gender === 'Male' ? 'selected' : ''}>Male</option>
              <option ${s.gender === 'Female' ? 'selected' : ''}>Female</option>
              <option ${s.gender === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Date of Birth</label>
            <input type="date" class="form-input" id="ed-dob" value="${esc((s.dob || '').slice(0, 10))}">
          </div>
          <div class="form-group">
            <label class="form-label">Class / Grade</label>
            <select class="form-select" id="ed-grade">
              ${TMS_CONFIG.academic.classes.map((c) => `<option ${s.grade === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Section</label>
            <select class="form-select" id="ed-section">
              ${TMS_CONFIG.academic.sections.map((sec) => `<option ${s.section === sec ? 'selected' : ''}>${esc(sec)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Guardian Name</label>
            <input class="form-input" id="ed-guardian" value="${esc(s.guardianName || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Guardian Phone</label>
            <input class="form-input" id="ed-phone" value="${esc(s.guardianPhone || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Blood Group</label>
            <input class="form-input" id="ed-blood" value="${esc(s.bloodGroup || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-select" id="ed-status">
              <option ${s.status === 'Active' || !s.status ? 'selected' : ''}>Active</option>
              <option ${s.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
              <option ${s.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
              <option ${s.status === 'Transferred' ? 'selected' : ''}>Transferred</option>
            </select>
          </div>
          <div class="form-group" style="grid-column:1/-1;">
            <label class="form-label">Address</label>
            <input class="form-input" id="ed-address" value="${esc(s.address || '')}">
          </div>
        </div>
      </form>
    `;
    const footerHtml = `
      <button class="btn btn-secondary" id="ed-cancel">Cancel</button>
      <button class="btn btn-secondary" id="ed-delete" style="color:#ef4444;"><i data-lucide="trash-2"></i> Delete</button>
      <button class="btn btn-primary" id="ed-save"><i data-lucide="save"></i> Save Changes</button>
    `;
    UIComponents.openModal({ title: `Edit Student — ${s.fullName || ''}`, bodyHtml, footerHtml });

    document.getElementById('ed-cancel').addEventListener('click', () => UIComponents.closeModal());
    document.getElementById('ed-delete').addEventListener('click', () => {
      UIComponents.closeModal();
      this.deleteStudents([s], container);
    });
    document.getElementById('ed-save').addEventListener('click', async () => {
      const name = document.getElementById('ed-name').value.trim();
      if (!name) { UIComponents.showToast('Student name is required.', 'warning'); return; }
      const res = await dbService.update('students', s.id, {
        admissionNo: document.getElementById('ed-admission').value.trim(),
        rollNo: document.getElementById('ed-roll').value.trim(),
        fullName: name,
        gender: document.getElementById('ed-gender').value,
        dob: document.getElementById('ed-dob').value || null,
        grade: document.getElementById('ed-grade').value,
        section: document.getElementById('ed-section').value,
        guardianName: document.getElementById('ed-guardian').value.trim(),
        guardianPhone: document.getElementById('ed-phone').value.trim(),
        bloodGroup: document.getElementById('ed-blood').value.trim(),
        address: document.getElementById('ed-address').value.trim(),
        status: document.getElementById('ed-status').value
      });
      if (res && res._syncError) { UIComponents.showToast(`Could not save: ${res._syncError}`, 'danger'); return; }
      await auditService.log('STUDENT_UPDATED', 'STUDENTS', { studentId: s.id, name }, s.id);
      UIComponents.showToast('Student details updated.', 'success');
      UIComponents.closeModal();
      await StudentModule.render(container);
    });
    UIComponents.refreshIcons();
  }

  static async deleteStudents(rows, container) {
    const label = rows.length === 1 ? `Delete ${rows[0].fullName}?` : `Delete ${rows.length} students?`;
    if (!confirm(`${label}\n\nThis removes their student record permanently. This cannot be undone.`)) return;
    for (const s of rows) {
      // eslint-disable-next-line no-await-in-loop
      await dbService.delete('students', s.id);
      // eslint-disable-next-line no-await-in-loop
      await auditService.log('STUDENT_DELETED', 'STUDENTS', { studentId: s.id, admissionNo: s.admissionNo, name: s.fullName }, s.id);
    }
    UIComponents.showToast(`${rows.length} student(s) deleted.`, 'success');
    await StudentModule.render(container);
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

    /* ---- Selection, bulk actions, edit & delete ---- */
    const students = this._students || [];
    const canManage = PermissionEngine.can(CAPABILITIES.MANAGE_STUDENTS);
    const checked = () => Array.from(container.querySelectorAll('.student-row-check:checked')).map((c) => c.value);
    const syncCount = () => {
      const el = container.querySelector('#students-selected-count');
      if (el) el.innerText = checked().length;
    };
    const selectedStudents = () => students.filter((s) => checked().includes(s.id));

    container.querySelectorAll('.student-row-check').forEach((c) => c.addEventListener('change', syncCount));
    const selectAllCb = container.querySelector('#students-select-all-cb');
    if (selectAllCb) {
      selectAllCb.addEventListener('change', () => {
        container.querySelectorAll('.student-row-check').forEach((c) => { c.checked = selectAllCb.checked; });
        syncCount();
      });
    }
    const selectAllBtn = container.querySelector('#btn-students-select-all');
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        container.querySelectorAll('.student-row-check').forEach((c) => { c.checked = true; });
        syncCount();
      });
    }
    const clearBtn = container.querySelector('#btn-students-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        container.querySelectorAll('.student-row-check').forEach((c) => { c.checked = false; });
        syncCount();
      });
    }
    const bulkDelete = container.querySelector('#btn-students-bulk-delete');
    if (bulkDelete) {
      bulkDelete.addEventListener('click', () => {
        const rows = selectedStudents();
        if (!rows.length) { UIComponents.showToast('Select at least one student.', 'warning'); return; }
        this.deleteStudents(rows, container);
      });
    }
    const bulkActivate = container.querySelector('#btn-students-bulk-activate');
    if (bulkActivate) {
      bulkActivate.addEventListener('click', async () => {
        const rows = selectedStudents();
        if (!rows.length) { UIComponents.showToast('Select at least one student.', 'warning'); return; }
        for (const s of rows) {
          // eslint-disable-next-line no-await-in-loop
          await dbService.update('students', s.id, { status: 'Active' });
        }
        UIComponents.showToast(`${rows.length} student(s) set to Active.`, 'success');
        await StudentModule.render(container);
      });
    }
    const bulkExport = container.querySelector('#btn-students-bulk-export');
    if (bulkExport) {
      bulkExport.addEventListener('click', () => {
        const rows = selectedStudents();
        if (!rows.length) { UIComponents.showToast('Select at least one student.', 'warning'); return; }
        const header = ['Admission No', 'Roll', 'Name', 'Gender', 'DOB', 'Class', 'Section', 'Guardian', 'Phone', 'Blood', 'Status'];
        const data = rows.map((s) => [s.admissionNo, s.rollNo, s.fullName, s.gender, s.dob, s.grade, s.section, s.guardianName, s.guardianPhone, s.bloodGroup, s.status]);
        downloadCsv(`TMS-Students-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...data]);
        UIComponents.showToast('Selected students exported.', 'success');
      });
    }
    container.querySelectorAll('.btn-edit-student').forEach((b) =>
      b.addEventListener('click', () => {
        const s = students.find((x) => x.id === b.dataset.id);
        if (s) this.openStudentEditModal(s, container);
      }));
    container.querySelectorAll('.btn-del-student').forEach((b) =>
      b.addEventListener('click', () => {
        const s = students.find((x) => x.id === b.dataset.id);
        if (s) this.deleteStudents([s], container);
      }));

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
                  <input type="date" class="form-input" id="adm-dob" required>
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

          const existing = await dbService.select('students');
          const maxSeq = existing.reduce((max, s) => {
            const m = String(s.admissionNo || '').match(/(\d+)\s*$/);
            return m ? Math.max(max, parseInt(m[1], 10)) : max;
          }, 0);
          const nextSeq = maxSeq + 1;
          const admissionNo = `TMS/${new Date().getFullYear()}/${nextSeq.toString().padStart(3, '0')}`;
          const rollNo = nextSeq.toString().padStart(2, '0');

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

          if (newStudent._syncError) {
            UIComponents.showToast(`Enrollment could not be saved: ${newStudent._syncError}`, 'danger');
            return;
          }

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
        const esc = (v) => UIComponents.escapeHtml(v);

        UIComponents.openModal({
          title: `Printable Smart ID Card — ${s.fullName}`,
          bodyHtml: `
            <div id="printable-id-card" style="width: 340px; margin: 0 auto; background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 2px solid #3b82f6; text-align: center; position: relative;">
              <div style="font-family: var(--font-display); font-weight: 800; font-size: 1.15rem; letter-spacing: 0.05em; color: #60a5fa;">
                ${esc(TMS_CONFIG.institution.name)}
              </div>
              <div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 14px;">
                ${esc(TMS_CONFIG.institution.tagline)}
              </div>

              <div style="width: 86px; height: 86px; border-radius: 50%; border: 3px solid #3b82f6; margin: 0 auto 12px; overflow: hidden; background: #334155; display: flex; align-items: center; justify-content: center;">
                <i data-lucide="user" style="width: 48px; height: 48px; color: #94a3b8;"></i>
              </div>

              <div style="font-size: 1.1rem; font-weight: 700; color: #fff;">${esc(s.fullName)}</div>
              <div style="font-size: 0.82rem; color: #38bdf8; font-weight: 600; margin-bottom: 8px;">${esc(s.grade)} • Sec ${esc(s.section)} • Roll #${esc(s.rollNo)}</div>

              <div style="background: rgba(255,255,255,0.06); padding: 8px 12px; border-radius: 8px; font-size: 0.78rem; text-align: left; margin-bottom: 12px;">
                <div><strong>Adm No:</strong> ${esc(s.admissionNo)}</div>
                <div><strong>Blood Group:</strong> ${esc(s.bloodGroup)}</div>
                <div><strong>Emergency:</strong> ${esc(s.guardianPhone)}</div>
              </div>

              <!-- Embedded QR for identification & attendance -->
              <div style="background: #fff; padding: 8px; border-radius: 8px; display: inline-block;">
                <div style="width: 70px; height: 70px; background: #000; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.65rem; text-align: center;">
                  [QR SECURE<br>${esc(s.admissionNo)}]
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
