/**
 * THAIBA MODEL SCHOOL — Student Lifecycle, Admissions & Identity Module
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { UIComponents } from './ui-components.js';
import { auditService } from './audit-service.js';
import { PermissionEngine, CAPABILITIES } from './permission-engine.js';
import { downloadCsv } from './export-utils.js';
import { TMS_LOGO } from './logo.js';
import { admissionService } from './admission-service.js';

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
          <div style="display: flex; gap: 10px; flex-wrap:wrap;">
            <button class="btn btn-secondary" id="btn-bulk-print-id-cards"><i data-lucide="printer"></i> Bulk Print PVC ID Cards</button>
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

    // Bulk ID Card generator button
    const bulkIdBtn = container.querySelector('#btn-bulk-print-id-cards');
    if (bulkIdBtn) {
      bulkIdBtn.addEventListener('click', () => StudentModule.openBulkIdCardModal());
    }

    // Individual ID Card generator
    container.querySelectorAll('.btn-print-id').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const students = await dbService.select('students');
        const s = students.find(item => item.id === id);
        if (!s) return;
        await StudentModule.openStudentIdCardModal(s);
      });
    });
  }

  static renderIdCardMarkup(s, photoUrl, cardPrefix = 'id-card-qr') {
    const esc = (v) => UIComponents.escapeHtml(v);
    const photoHtml = photoUrl
      ? `<img src="${esc(photoUrl)}" alt="Photo" style="width:100%; height:100%; object-fit:cover; display:block;">`
      : `<div style="width:100%; height:100%; background:#e2e8f0; display:flex; align-items:center; justify-content:center; color:#64748b; font-size:9px; text-align:center;"><i data-lucide="user" style="width:28px;height:28px;color:#94a3b8;"></i></div>`;

    const qrContainerId = `${cardPrefix}-${String(s.id || s.admissionNo).replace(/[^a-zA-Z0-9]/g, '-')}`;

    return `
      <div class="pvc-id-card-pair" style="display:inline-flex; gap:16px; margin:10px; font-family:'Plus Jakarta Sans', sans-serif; text-align:left;">
        <!-- FRONT SIDE -->
        <div class="pvc-card-side" style="width:336px; height:212px; border-radius:12px; background:linear-gradient(135deg, #064e3b 0%, #0f172a 100%); color:#fff; position:relative; overflow:hidden; border:2px solid #16a34a; box-shadow:0 6px 20px rgba(0,0,0,0.25); display:flex; flex-direction:column; justify-content:space-between; padding:12px; box-sizing:border-box;">
          <div style="position:absolute; top:-35px; right:-35px; width:110px; height:110px; border-radius:50%; background:radial-gradient(circle, rgba(34,197,94,0.22) 0%, transparent 70%); pointer-events:none;"></div>
          
          <!-- Header -->
          <div style="display:flex; align-items:center; gap:8px; border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:6px;">
            <div style="flex-shrink:0;">${TMS_LOGO.emblemSvg(32)}</div>
            <div style="flex:1; line-height:1.15;">
              <div style="font-family:'Outfit', sans-serif; font-size:11.5px; font-weight:800; letter-spacing:0.04em; color:#4ade80; text-transform:uppercase;">
                ${esc(TMS_CONFIG.institution.name)}
              </div>
              <div style="font-size:7px; color:#cbd5e1; letter-spacing:0.02em;">
                Run by : Thaiba Heritage, Kolkata
              </div>
            </div>
            <span style="font-size:7px; background:#16a34a; color:#fff; padding:2px 6px; border-radius:4px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em;">Student</span>
          </div>

          <!-- Body -->
          <div style="display:flex; gap:10px; align-items:center; margin:4px 0;">
            <div style="width:68px; height:82px; border:2px solid #22c55e; border-radius:6px; overflow:hidden; background:#fff; flex-shrink:0;">
              ${photoHtml}
            </div>
            <div style="flex:1; min-width:0; line-height:1.25;">
              <div style="font-size:13px; font-weight:800; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${esc(s.fullName || 'Student Name')}
              </div>
              <div style="font-size:9.5px; color:#38bdf8; font-weight:700; margin-bottom:4px;">
                ${esc(s.grade || '')} • Sec ${esc(s.section || 'A')} • Roll #${esc(s.rollNo || '—')}
              </div>
              <div style="font-size:8px; color:#cbd5e1; background:rgba(255,255,255,0.08); padding:4px 6px; border-radius:4px;">
                <div><strong>Adm No:</strong> <span class="font-mono" style="color:#fde047; font-weight:700;">${esc(s.admissionNo || '—')}</span></div>
                <div><strong>Blood:</strong> <span style="color:#ef4444; font-weight:800;">${esc(s.bloodGroup || 'O+')}</span> &nbsp;•&nbsp; <strong>DOB:</strong> ${esc((s.dob || '').slice(0, 10))}</div>
                <div><strong>Emergency:</strong> <span class="font-mono">${esc(s.guardianPhone || '—')}</span></div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.15); padding-top:4px; font-size:7px; color:#94a3b8;">
            <div>Session 2027 - 2028 • Smart Campus Pass</div>
            <div id="${qrContainerId}" class="qr-target" data-value="TMS-VERIFY:${esc(s.admissionNo)}:${esc(s.fullName)}" style="width:28px; height:28px; background:#fff; padding:1px; border-radius:3px; display:inline-block;"></div>
          </div>
        </div>

        <!-- BACK SIDE -->
        <div class="pvc-card-side" style="width:336px; height:212px; border-radius:12px; background:#0f172a; color:#cbd5e1; position:relative; overflow:hidden; border:2px solid #334155; box-shadow:0 6px 20px rgba(0,0,0,0.25); display:flex; flex-direction:column; justify-content:space-between; padding:12px; font-size:8px; line-height:1.35; box-sizing:border-box;">
          <div style="border-bottom:1px solid #334155; padding-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:#38bdf8; font-size:8.5px; text-transform:uppercase;">Institutional Smart Card</strong>
            <span style="font-size:7px; color:#64748b;">Terms of Issue</span>
          </div>

          <ul style="list-style:disc; margin:4px 0 4px 14px; padding:0; font-size:7.5px; color:#94a3b8;">
            <li>This card is institutional property and must be worn inside campus.</li>
            <li>If found, please return to THAIBA MODEL SCHOOL, Baghait, Tapan.</li>
            <li>Lost cards must be reported to the school office immediately.</li>
          </ul>

          <div style="background:rgba(255,255,255,0.04); padding:4px 6px; border-radius:4px; font-size:7.5px; color:#cbd5e1;">
            <div><strong>Parent / Guardian:</strong> ${esc(s.guardianName || '—')}</div>
            <div><strong>Residential Address:</strong> ${esc((s.address || '').slice(0, 50))}</div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:flex-end; border-top:1px solid #334155; padding-top:4px;">
            <div style="font-size:7px; color:#64748b; line-height:1.2;">
              ${esc(TMS_CONFIG.institution.name)}<br>
              Baghait, Tapan, Dakshin Dinajpur - 733127<br>
              Helpline: +91 8653382851, +91 8167782851
            </div>
            <div style="text-align:center;">
              <div style="font-family:'Brush Script MT', cursive, sans-serif; font-size:12px; color:#22c55e; margin-bottom:1px;">Thaiba Authority</div>
              <div style="font-size:7px; font-weight:700; color:#fff; border-top:1px dashed #64748b; padding-top:1px;">Principal / Controller</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static async openStudentIdCardModal(s) {
    let photoUrl = '';
    if (s.photo) {
      photoUrl = (await admissionService.getSignedUrl('admission-docs', s.photo, 3600)) || '';
    }

    const cardMarkup = StudentModule.renderIdCardMarkup(s, photoUrl, 'single-id-qr');

    UIComponents.openModal({
      title: `Printable Smart PVC ID Card — ${s.fullName}`,
      bodyHtml: `
        <div style="text-align:center; margin-bottom:14px; font-size:0.85rem; color:var(--text-muted);">
          Official CR-80 PVC dimensions (Front &amp; Back). Includes scannable verification QR Code.
        </div>
        <div id="single-id-print-area" style="text-align:center;">
          ${cardMarkup}
        </div>
      `,
      footerHtml: `
        <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Close</button>
        <button class="btn btn-primary" id="btn-print-single-card"><i data-lucide="printer"></i> Print PVC Card</button>
      `,
      maxWidth: '780px'
    });

    // Generate real QR code in target element
    setTimeout(() => {
      const qrTarget = document.querySelector('#single-id-print-area .qr-target');
      if (qrTarget && window.QRCode) {
        qrTarget.innerHTML = '';
        new window.QRCode(qrTarget, {
          text: qrTarget.dataset.value || s.admissionNo,
          width: 26,
          height: 26,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.M
        });
      }
      UIComponents.refreshIcons();
    }, 50);

    const printBtn = document.getElementById('btn-print-single-card');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        const printContent = document.getElementById('single-id-print-area').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>ID Card — ${s.fullName}</title>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
            <style>
              body { margin: 20px; background: #fff; font-family: 'Plus Jakarta Sans', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            ${printContent}
            <script>window.onload = function() { window.print(); window.close(); }<\/script>
          </body>
          </html>
        `);
        win.document.close();
      });
    }

    UIComponents.refreshIcons();
  }

  static async openBulkIdCardModal() {
    const students = await dbService.select('students');
    const classes = TMS_CONFIG.academic.classes;

    const bodyHtml = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
        <div>
          <label style="font-size:0.85rem; font-weight:700; margin-right:8px;">Filter by Class:</label>
          <select class="form-select" id="bulk-id-grade-select" style="width:160px; display:inline-block;">
            <option value="all">All Classes (${students.length})</option>
            ${classes.map(c => {
              const count = students.filter(s => s.grade === c).length;
              return `<option value="${c}">${c} (${count})</option>`;
            }).join('')}
          </select>
        </div>
        <div style="font-size:0.82rem; color:var(--text-muted);">
          Generates batch PVC ID card print sheet for cutting and laminating.
        </div>
      </div>
      <div id="bulk-id-preview-container" style="max-height:60vh; overflow-y:auto; text-align:center; padding:10px; background:var(--bg-subtle); border-radius:10px; border:1px solid var(--border-color);">
        <p style="color:var(--text-muted); font-size:0.85rem;">Loading student cards…</p>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Close</button>
      <button class="btn btn-primary" id="btn-print-bulk-sheet"><i data-lucide="printer"></i> Print Batch ID Sheet</button>
    `;

    UIComponents.openModal({
      title: 'Bulk PVC Student ID Card Generator',
      bodyHtml,
      footerHtml,
      maxWidth: '920px'
    });

    const container = document.getElementById('bulk-id-preview-container');
    const select = document.getElementById('bulk-id-grade-select');

    const renderBatch = (list) => {
      if (!list.length) {
        container.innerHTML = '<p style="color:var(--text-muted); padding:30px;">No students enrolled in this selection.</p>';
        return;
      }
      container.innerHTML = list.map((s, idx) => StudentModule.renderIdCardMarkup(s, null, `bulk-qr-${idx}`)).join('');

      // Generate QR codes
      setTimeout(() => {
        container.querySelectorAll('.qr-target').forEach((el) => {
          if (window.QRCode) {
            el.innerHTML = '';
            new window.QRCode(el, {
              text: el.dataset.value || 'TMS',
              width: 26,
              height: 26,
              colorDark: '#000000',
              colorLight: '#ffffff',
              correctLevel: window.QRCode.CorrectLevel.M
            });
          }
        });
        UIComponents.refreshIcons();
      }, 50);
    };

    renderBatch(students);

    if (select) {
      select.addEventListener('change', (e) => {
        const val = e.target.value;
        const filtered = val === 'all' ? students : students.filter(s => s.grade === val);
        renderBatch(filtered);
      });
    }

    const printBulkBtn = document.getElementById('btn-print-bulk-sheet');
    if (printBulkBtn) {
      printBulkBtn.addEventListener('click', () => {
        const printContent = container.innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>TMS Student ID Cards — Batch Print</title>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
            <style>
              body { margin: 10px; background: #fff; font-family: 'Plus Jakarta Sans', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .pvc-id-card-pair { page-break-inside: avoid; margin-bottom: 20px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div style="display:flex; flex-wrap:wrap; justify-content:center;">
              ${printContent}
            </div>
            <script>window.onload = function() { window.print(); window.close(); }<\/script>
          </body>
          </html>
        `);
        win.document.close();
      });
    }

    UIComponents.refreshIcons();
  }
}

export default StudentModule;
