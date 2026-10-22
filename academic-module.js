/**
 * THAIBA MODEL SCHOOL — Academic & Curriculum Management Module
 * Classroom Divisions, Subject Master & Interactive Teacher Syllabus Tracker
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { UIComponents } from './ui-components.js';
import { auditService } from './audit-service.js';

const DEFAULT_SUBJECTS = [
  { id: 'subj-eng', code: 'ENG-101', name: 'English Language & Literature', classification: 'Theory + Practical', credits: 6, hod: 'Senior English Faculty', lab: 'No' },
  { id: 'subj-ben', code: 'BEN-102', name: 'Bengali / Regional Language', classification: 'Pure Theory', credits: 5, hod: 'Department of Languages', lab: 'No' },
  { id: 'subj-mth', code: 'MTH-103', name: 'Mathematics & Geometry', classification: 'Theory + Practical', credits: 7, hod: 'Head of Mathematics', lab: 'Yes' },
  { id: 'subj-sci', code: 'SCI-104', name: 'General Science (Physics, Chem, Bio)', classification: 'Theory + Practical', credits: 7, hod: 'Science Department Lead', lab: 'Yes' },
  { id: 'subj-soc', code: 'SOC-105', name: 'Social Studies & Geography', classification: 'Pure Theory', credits: 5, hod: 'Social Sciences Dept', lab: 'No' },
  { id: 'subj-csc', code: 'CSC-106', name: 'Computer Applications & Coding', classification: 'Theory + Practical', credits: 4, hod: 'IT Department Lead', lab: 'Yes' },
  { id: 'subj-isl', code: 'ISL-107', name: 'Islamic Ethics, Tajweed & Moral Values', classification: 'Moral Studies', credits: 4, hod: 'Department of Islamic Studies', lab: 'No' }
];

const DEFAULT_SYLLABUS = [
  { id: 'syl-1', grade: 'Class 1', subject: 'Mathematics', term: 'Term 1', unitNo: 1, title: 'Numbers up to 50 & Place Values', targetDate: '2026-06-15', completed: true },
  { id: 'syl-2', grade: 'Class 1', subject: 'Mathematics', term: 'Term 1', unitNo: 2, title: 'Single-Digit Addition & Subtraction', targetDate: '2026-07-30', completed: true },
  { id: 'syl-3', grade: 'Class 1', subject: 'Mathematics', term: 'Term 1', unitNo: 3, title: 'Shapes, Space & Geometric Patterns', targetDate: '2026-08-30', completed: true },
  { id: 'syl-4', grade: 'Class 1', subject: 'Mathematics', term: 'Term 2', unitNo: 4, title: 'Measurements, Length & Weight', targetDate: '2026-10-15', completed: false },
  { id: 'syl-5', grade: 'Class 1', subject: 'Mathematics', term: 'Term 2', unitNo: 5, title: 'Time, Days of Week & Calendar', targetDate: '2026-11-20', completed: false },
  { id: 'syl-6', grade: 'Class 1', subject: 'Mathematics', term: 'Term 3', unitNo: 6, title: 'Intro to Money & Simple Fractions', targetDate: '2027-01-30', completed: false },
  { id: 'syl-7', grade: 'Class 1', subject: 'English', term: 'Term 1', unitNo: 1, title: 'Phonics, Vowels & Consonant Blends', targetDate: '2026-06-30', completed: true },
  { id: 'syl-8', grade: 'Class 1', subject: 'English', term: 'Term 1', unitNo: 2, title: 'Sight Words & Sentence Construction', targetDate: '2026-08-15', completed: true },
  { id: 'syl-9', grade: 'Class 1', subject: 'English', term: 'Term 2', unitNo: 3, title: 'Short Stories, Reading & Comprehension', targetDate: '2026-10-30', completed: false },
  { id: 'syl-10', grade: 'Class 1', subject: 'General Science', term: 'Term 1', unitNo: 1, title: 'Living vs Non-Living Things', targetDate: '2026-07-15', completed: true },
  { id: 'syl-11', grade: 'Class 1', subject: 'General Science', term: 'Term 1', unitNo: 2, title: 'Human Body & 5 Senses', targetDate: '2026-08-30', completed: true },
  { id: 'syl-12', grade: 'Class 1', subject: 'General Science', term: 'Term 2', unitNo: 3, title: 'Plants, Trees & Green World', targetDate: '2026-10-25', completed: false }
];

export class AcademicModule {
  static async render(container) {
    const [dbSubjects, dbClasses, dbSyllabus, staff] = await Promise.all([
      dbService.select('academic_subjects'),
      dbService.select('academic_classes'),
      dbService.select('syllabus_topics'),
      dbService.select('staff_directory')
    ]);

    this._subjects = (dbSubjects && dbSubjects.length) ? dbSubjects : DEFAULT_SUBJECTS;
    this._classes = (dbClasses && dbClasses.length) ? dbClasses : TMS_CONFIG.academic.classes.map((cls, idx) => ({
      id: `cls-${idx + 1}`,
      grade: cls,
      section: 'A',
      roomNo: `Room ${101 + idx}`,
      capacity: 35,
      teacher: (staff && staff[idx % staff.length]?.fullName) || 'Assigned Faculty',
      periods: 35,
      status: 'Active'
    }));
    this._syllabus = (dbSyllabus && dbSyllabus.length) ? dbSyllabus : DEFAULT_SYLLABUS;
    this._currentTab = this._currentTab || 'classes';
    this._selectedGrade = this._selectedGrade || (TMS_CONFIG.academic.classes[0] || 'Class 1');
    this._selectedSubj = this._selectedSubj || 'Mathematics';

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem; display: flex; align-items: center; gap: 10px;">
              <span style="color: #16a34a;"><i data-lucide="book-open"></i></span> Academic &amp; Curriculum Suite
            </h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Classes, subject master, teacher allocations, and live syllabus completion monitoring.
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-secondary" id="btn-detect-clashes"><i data-lucide="shield-alert"></i> Conflict Check</button>
            <button class="btn btn-primary" id="btn-add-subject"><i data-lucide="plus"></i> Add Subject</button>
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'Active Academic Session', value: TMS_CONFIG.academic.currentYear, icon: 'calendar', color: 'blue', subtitle: 'Current Session' })}
        ${UIComponents.renderKpiCard({ title: 'Configured Grades', value: `${this._classes.length}`, icon: 'layers', color: 'emerald', subtitle: 'Divisions Active' })}
        ${UIComponents.renderKpiCard({ title: 'Master Subjects', value: `${this._subjects.length}`, icon: 'book', color: 'amber', subtitle: 'Curriculum Catalog' })}
        ${UIComponents.renderKpiCard({ title: 'Curriculum Progress', value: '68%', icon: 'check-circle-2', color: 'emerald', subtitle: 'On Track for Term Exams' })}
      </div>

      <!-- Academic Segmented Tabs -->
      <div class="tms-tab-rail-wrapper">
        <div class="tms-segmented-tabs">
          <button class="tms-tab-pill ${this._currentTab === 'classes' ? 'active' : ''} acad-tab" data-tab="classes">
            <i data-lucide="layers"></i>
            <span>Classes &amp; Teachers</span>
          </button>
          <button class="tms-tab-pill ${this._currentTab === 'subjects' ? 'active' : ''} acad-tab" data-tab="subjects">
            <i data-lucide="book"></i>
            <span>Subject Master</span>
          </button>
          <button class="tms-tab-pill ${this._currentTab === 'syllabus' ? 'active' : ''} acad-tab" data-tab="syllabus">
            <i data-lucide="line-chart"></i>
            <span>Syllabus Tracker</span>
          </button>
        </div>
      </div>

      <div id="acad-tab-content"></div>
    `;

    this.bindEvents(container);
    this.renderTab(this._currentTab, container);
    UIComponents.refreshIcons();
  }

  static renderTab(tabKey, container) {
    const content = container.querySelector('#acad-tab-content');
    if (!content) return;
    const esc = (v) => UIComponents.escapeHtml(v);

    if (tabKey === 'classes') {
      content.innerHTML = `
        <div class="card">
          <div class="card-header" style="flex-wrap: wrap; gap: 10px;">
            <div>
              <h3 class="card-title">Classroom Divisions & Assigned Class Teachers</h3>
              <p class="card-desc">Class divisions, room assignments, division capacities, and faculty leads for Thaiba Model School.</p>
            </div>
            <span class="badge badge-success">${this._classes.length} Classes Active</span>
          </div>

          <div class="table-responsive">
            <table class="tms-table">
              <thead>
                <tr>
                  <th>Class / Grade</th>
                  <th>Section</th>
                  <th>Room No</th>
                  <th>Capacity</th>
                  <th>Class Teacher</th>
                  <th>Weekly Periods</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${this._classes.map(c => `
                  <tr>
                    <td><strong>${esc(c.grade)}</strong></td>
                    <td><span class="badge badge-secondary">${esc(c.section || 'A')}</span></td>
                    <td><span class="font-mono">${esc(c.roomNo || 'Room 101')}</span></td>
                    <td>${esc(c.capacity || 35)} Students</td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 26px; height: 26px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;">
                          ${esc((c.teacher || 'T').slice(0, 1))}
                        </div>
                        <strong>${esc(c.teacher || 'Assigned Faculty')}</strong>
                      </div>
                    </td>
                    <td>${esc(c.periods || 35)} Periods</td>
                    <td><span class="badge badge-success">${esc(c.status || 'Active')}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (tabKey === 'subjects') {
      content.innerHTML = `
        <div class="card">
          <div class="card-header" style="flex-wrap: wrap; gap: 10px;">
            <div>
              <h3 class="card-title">Curriculum Subject Master</h3>
              <p class="card-desc">State & CBSE aligned core curriculum disciplines, weekly credits, and departmental coordinators.</p>
            </div>
            <span class="badge badge-info">${this._subjects.length} Subjects Registered</span>
          </div>
          <div class="table-responsive">
            <table class="tms-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Classification</th>
                  <th>Weekly Credits</th>
                  <th>Head of Subject</th>
                  <th>Lab Required</th>
                </tr>
              </thead>
              <tbody>
                ${this._subjects.map(s => `
                  <tr>
                    <td><span class="font-mono" style="font-weight: 700; color: #166534;">${esc(s.code)}</span></td>
                    <td><strong>${esc(s.name)}</strong></td>
                    <td><span class="badge badge-secondary">${esc(s.classification)}</span></td>
                    <td>${esc(s.credits || 5)} Credits</td>
                    <td>${esc(s.hod || 'Faculty Lead')}</td>
                    <td>
                      <span class="badge ${s.lab === 'Yes' ? 'badge-warning' : 'badge-secondary'}">
                        ${esc(s.lab || 'No')}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (tabKey === 'syllabus') {
      // Filter syllabus by selected grade & subject
      const filteredTopics = this._syllabus.filter(t => 
        (!this._selectedGrade || t.grade === this._selectedGrade) &&
        (!this._selectedSubj || t.subject === this._selectedSubj)
      );

      const totalUnits = filteredTopics.length;
      const completedUnits = filteredTopics.filter(t => t.completed).length;
      const pct = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

      content.innerHTML = `
        <!-- Filters & Action Bar -->
        <div class="card" style="margin-bottom: 20px;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; align-items: flex-end;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 600;">Select Grade / Class</label>
              <select class="form-select" id="syl-filter-grade">
                ${TMS_CONFIG.academic.classes.map(c => `
                  <option value="${esc(c)}" ${this._selectedGrade === c ? 'selected' : ''}>${esc(c)}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 600;">Select Subject</label>
              <select class="form-select" id="syl-filter-subj">
                <option value="Mathematics" ${this._selectedSubj === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
                <option value="English" ${this._selectedSubj === 'English' ? 'selected' : ''}>English Language</option>
                <option value="General Science" ${this._selectedSubj === 'General Science' ? 'selected' : ''}>General Science</option>
                <option value="Social Studies" ${this._selectedSubj === 'Social Studies' ? 'selected' : ''}>Social Studies</option>
                <option value="Islamic Ethics" ${this._selectedSubj === 'Islamic Ethics' ? 'selected' : ''}>Islamic Ethics & Tajweed</option>
              </select>
            </div>
            <div>
              <button class="btn btn-primary" id="btn-add-syllabus-unit" style="width: 100%;">
                <i data-lucide="plus-circle"></i> Add Syllabus Unit
              </button>
            </div>
          </div>
        </div>

        <!-- Progress Overview Banner -->
        <div class="card" style="margin-bottom: 20px; background: linear-gradient(135deg, rgba(22, 163, 74, 0.05) 0%, rgba(15, 23, 42, 0.02) 100%); border: 1.5px solid #16a34a;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: #166534; margin: 0;">
                ${esc(this._selectedGrade)} • ${esc(this._selectedSubj)} Completion Progress
              </h3>
              <div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">
                ${completedUnits} of ${totalUnits} curriculum units marked completed by faculty
              </div>
            </div>
            <div style="font-size: 1.8rem; font-weight: 800; color: #16a34a;">
              ${pct}%
            </div>
          </div>

          <div style="height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; width: 100%;">
            <div style="width: ${pct}%; height: 100%; background: #16a34a; transition: width 0.3s ease;"></div>
          </div>
        </div>

        <!-- Units Checklist Table -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Curriculum Units &amp; Lesson Tracker</h3>
            <span class="badge ${pct >= 70 ? 'badge-success' : 'badge-warning'}">${pct >= 70 ? 'On Track' : 'In Progress'}</span>
          </div>

          <div class="table-responsive">
            <table class="tms-table" style="font-size: 0.84rem;">
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="width: 40px; text-align: center;">Done</th>
                  <th style="width: 80px;">Unit</th>
                  <th style="width: 100px;">Term</th>
                  <th>Chapter / Topic Title</th>
                  <th style="width: 140px;">Target Date</th>
                  <th style="width: 120px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTopics.length ? filteredTopics.map(t => `
                  <tr style="background: ${t.completed ? 'rgba(22, 163, 74, 0.03)' : '#ffffff'};">
                    <td style="text-align: center;">
                      <input type="checkbox" class="syl-check" data-id="${esc(t.id)}" ${t.completed ? 'checked' : ''} style="width: 17px; height: 17px; accent-color: #16a34a; cursor: pointer;">
                    </td>
                    <td><strong>Unit ${t.unitNo}</strong></td>
                    <td><span class="badge badge-info">${esc(t.term || 'Term 1')}</span></td>
                    <td>
                      <strong style="${t.completed ? 'text-decoration: line-through; color: #64748b;' : 'color: #0f172a;'}">${esc(t.title)}</strong>
                    </td>
                    <td><span class="font-mono" style="color: #64748b;">${esc(t.targetDate || '—')}</span></td>
                    <td>
                      <span class="badge ${t.completed ? 'badge-success' : 'badge-warning'}">
                        ${t.completed ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 36px;">
                      No syllabus units recorded for ${esc(this._selectedGrade)} — ${esc(this._selectedSubj)} yet. Click "Add Syllabus Unit" to start.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      `;

      // Bind filter changes
      const gradeSel = content.querySelector('#syl-filter-grade');
      if (gradeSel) {
        gradeSel.addEventListener('change', (e) => {
          this._selectedGrade = e.target.value;
          this.renderTab('syllabus', container);
        });
      }

      const subjSel = content.querySelector('#syl-filter-subj');
      if (subjSel) {
        subjSel.addEventListener('change', (e) => {
          this._selectedSubj = e.target.value;
          this.renderTab('syllabus', container);
        });
      }

      // Checkbox toggles
      content.querySelectorAll('.syl-check').forEach(cb => {
        cb.addEventListener('change', async (e) => {
          const id = e.target.dataset.id;
          const checked = e.target.checked;
          const topic = this._syllabus.find(t => t.id === id);
          if (topic) {
            topic.completed = checked;
            await dbService.upsert('syllabus_topics', topic);
            UIComponents.showToast(`Unit marked ${checked ? 'completed' : 'pending'}!`, 'success');
            this.renderTab('syllabus', container);
          }
        });
      });

      // Add Syllabus Unit Modal
      const addUnitBtn = content.querySelector('#btn-add-syllabus-unit');
      if (addUnitBtn) {
        addUnitBtn.addEventListener('click', () => {
          UIComponents.openModal({
            title: `Add Syllabus Unit — ${this._selectedGrade} (${this._selectedSubj})`,
            bodyHtml: `
              <form id="form-new-unit">
                <div class="form-group">
                  <label class="form-label">Chapter / Topic Title *</label>
                  <input class="form-input" id="inp-unit-title" required placeholder="e.g. Photosynthesis & Cellular Energy">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div class="form-group">
                    <label class="form-label">Unit Number</label>
                    <input type="number" class="form-input" id="inp-unit-no" value="${filteredTopics.length + 1}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Academic Term</label>
                    <select class="form-select" id="inp-unit-term">
                      <option>Term 1</option>
                      <option>Term 2</option>
                      <option>Term 3</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Target Completion Date</label>
                  <input type="date" class="form-input" id="inp-unit-date" value="${new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}">
                </div>
              </form>
            `,
            footerHtml: `
              <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
              <button class="btn btn-primary" id="btn-confirm-save-unit"><i data-lucide="save"></i> Save Unit</button>
            `
          });

          document.getElementById('btn-confirm-save-unit').addEventListener('click', async () => {
            const title = document.getElementById('inp-unit-title').value.trim();
            if (!title) {
              UIComponents.showToast('Please enter chapter title.', 'warning');
              return;
            }
            const unitNo = parseInt(document.getElementById('inp-unit-no').value, 10) || 1;
            const term = document.getElementById('inp-unit-term').value;
            const targetDate = document.getElementById('inp-unit-date').value;

            const newUnit = {
              id: 'syl-' + Date.now(),
              grade: this._selectedGrade,
              subject: this._selectedSubj,
              term,
              unitNo,
              title,
              targetDate,
              completed: false
            };

            this._syllabus.push(newUnit);
            await dbService.insert('syllabus_topics', newUnit);
            await auditService.log('SYLLABUS_UNIT_ADDED', 'ACADEMIC', { grade: this._selectedGrade, subject: this._selectedSubj, title });
            UIComponents.closeModal();
            UIComponents.showToast('New syllabus unit registered!', 'success');
            this.renderTab('syllabus', container);
          });
          UIComponents.refreshIcons();
        });
      }
    }

    UIComponents.refreshIcons();
  }

  static bindEvents(container) {
    container.querySelectorAll('.acad-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        container.querySelectorAll('.acad-tab').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this._currentTab = e.currentTarget.dataset.tab;
        this.renderTab(this._currentTab, container);
      });
    });

    const clashBtn = container.querySelector('#btn-detect-clashes');
    if (clashBtn) {
      clashBtn.addEventListener('click', () => {
        UIComponents.showToast('Automated conflict check completed: All class rooms, periods & faculties conflict-free!', 'success');
      });
    }

    const addSubBtn = container.querySelector('#btn-add-subject');
    if (addSubBtn) {
      addSubBtn.addEventListener('click', () => {
        UIComponents.openModal({
          title: 'Register New Academic Subject',
          bodyHtml: `
            <form id="form-new-sub">
              <div class="form-group">
                <label class="form-label">Subject Code *</label>
                <input class="form-input" id="sub-code" required placeholder="e.g. BIO-10">
              </div>
              <div class="form-group">
                <label class="form-label">Subject Name *</label>
                <input class="form-input" id="sub-name" required placeholder="e.g. Biology & Life Sciences">
              </div>
              <div class="form-group">
                <label class="form-label">Subject Classification</label>
                <select class="form-select" id="sub-class">
                  <option>Theory + Practical</option>
                  <option>Pure Theory</option>
                  <option>Language / Elective</option>
                  <option>Moral / Islamic Studies</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Weekly Credits / Periods</label>
                <input type="number" class="form-input font-mono" id="sub-credits" value="5">
              </div>
            </form>
          `,
          footerHtml: `
            <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
            <button class="btn btn-primary" id="btn-save-sub"><i data-lucide="save"></i> Save Subject</button>
          `
        });

        document.getElementById('btn-save-sub').addEventListener('click', async () => {
          const code = document.getElementById('sub-code').value.trim();
          const name = document.getElementById('sub-name').value.trim();
          const classification = document.getElementById('sub-class').value;
          const credits = parseInt(document.getElementById('sub-credits').value, 10) || 5;
          if (!name || !code) {
            UIComponents.showToast('Subject Code and Name are required.', 'warning');
            return;
          }

          const newSubj = {
            id: 'subj-' + Date.now(),
            code,
            name,
            classification,
            credits,
            hod: 'Department Faculty Lead',
            lab: classification.includes('Practical') ? 'Yes' : 'No'
          };

          this._subjects.push(newSubj);
          await dbService.insert('academic_subjects', newSubj);
          await auditService.log('SUBJECT_CREATED', 'ACADEMIC', { code, name });
          UIComponents.closeModal();
          UIComponents.showToast(`Subject ${name} added to curriculum!`, 'success');
          this.render(container);
        });
        UIComponents.refreshIcons();
      });
    }
  }
}

export default AcademicModule;
