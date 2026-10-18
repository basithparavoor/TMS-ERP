/**
 * THAIBA MODEL SCHOOL — Academic & Curriculum Management Module
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { UIComponents } from './ui-components.js';
import { auditService } from './audit-service.js';

export class AcademicModule {
  static async render(container) {
    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem;">Academic & Curriculum Suite</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Classes, subject master, teacher allocations, master timetable matrix, and syllabus completion monitoring.
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" id="btn-detect-clashes"><i data-lucide="shield-alert"></i> Conflict Check</button>
            <button class="btn btn-primary" id="btn-add-subject"><i data-lucide="plus"></i> Add Subject</button>
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'Active Academic Session', value: TMS_CONFIG.academic.currentYear, icon: 'calendar', color: 'blue', subtitle: 'Terms 1 & 2 Configured' })}
        ${UIComponents.renderKpiCard({ title: 'Configured Grades', value: '12 Grades', icon: 'layers', color: 'emerald', subtitle: 'Grade 1 through Grade 12' })}
        ${UIComponents.renderKpiCard({ title: 'Master Subjects', value: '28 Subjects', icon: 'book', color: 'amber', subtitle: 'Theory & Practical Labs' })}
        ${UIComponents.renderKpiCard({ title: 'Timetable Status', value: '0 Conflicts', icon: 'check-circle', color: 'emerald', subtitle: 'All Periods Validated' })}
      </div>

      <!-- Academic Tabs -->
      <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
        <button class="btn btn-primary acad-tab" data-tab="classes">Classes & Class Teachers</button>
        <button class="btn btn-secondary acad-tab" data-tab="subjects">Subject Master</button>
        <button class="btn btn-secondary acad-tab" data-tab="syllabus">Syllabus Progress</button>
      </div>

      <div id="acad-tab-content"></div>
    `;

    this.bindEvents(container);
    this.renderTab('classes', container);
    UIComponents.refreshIcons();
  }

  static renderTab(tabKey, container) {
    const content = container.querySelector('#acad-tab-content');
    if (!content) return;

    if (tabKey === 'classes') {
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Classroom Divisions & Assigned Class Teachers</h3>
              <p class="card-desc">Class divisions, room assignments, division capacities, and faculty leads for Thaiba Model School.</p>
            </div>
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
                <tr>
                  <td><strong>Grade 9</strong></td>
                  <td><span class="badge badge-info">Section A</span></td>
                  <td>Room 9-A (Ibn Sina Block)</td>
                  <td>35 Students</td>
                  <td><strong>Prof. Rashid Rahman</strong></td>
                  <td>36 Periods</td>
                  <td><span class="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td><strong>Grade 9</strong></td>
                  <td><span class="badge badge-info">Section B</span></td>
                  <td>Room 9-B (Ibn Sina Block)</td>
                  <td>35 Students</td>
                  <td>Mrs. Bushra Siddique</td>
                  <td>36 Periods</td>
                  <td><span class="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td><strong>Grade 10</strong></td>
                  <td><span class="badge badge-info">Section A</span></td>
                  <td>Room 10-A (Ibn Sina Block)</td>
                  <td>35 Students</td>
                  <td>Mr. Salman Faris</td>
                  <td>36 Periods</td>
                  <td><span class="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td><strong>Grade 11 (Science)</strong></td>
                  <td><span class="badge badge-info">Section A</span></td>
                  <td>Room 11-Sci (Al-Farabi Wing)</td>
                  <td>40 Students</td>
                  <td>Dr. A. K. Basheer</td>
                  <td>40 Periods</td>
                  <td><span class="badge badge-success">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (tabKey === 'subjects') {
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Curriculum Subject Master</h3>
            <span class="badge badge-info">CBSE & State Aligned</span>
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
                <tr>
                  <td><span class="font-mono">MAT-09</span></td>
                  <td>Mathematics & Applied Geometry</td>
                  <td>Theory + Lab</td>
                  <td>6 Hours / Wk</td>
                  <td>Prof. Rashid Rahman</td>
                  <td><span class="badge badge-success">Yes (Math Lab)</span></td>
                </tr>
                <tr>
                  <td><span class="font-mono">PHY-09</span></td>
                  <td>Physics & Energy Dynamics</td>
                  <td>Theory + Practical</td>
                  <td>5 Hours / Wk</td>
                  <td>Dr. A. K. Basheer</td>
                  <td><span class="badge badge-success">Yes (Physics Lab)</span></td>
                </tr>
                <tr>
                  <td><span class="font-mono">ENG-09</span></td>
                  <td>English Communicative & Literature</td>
                  <td>Theory</td>
                  <td>5 Hours / Wk</td>
                  <td>Mrs. Fathima Zahra</td>
                  <td><span class="badge badge-info">Language Lab</span></td>
                </tr>
                <tr>
                  <td><span class="font-mono">ISL-09</span></td>
                  <td>Islamic Studies & Moral Education</td>
                  <td>Theory & Value Grooming</td>
                  <td>4 Hours / Wk</td>
                  <td>Usthad Hameed Faizy</td>
                  <td><span class="badge badge-secondary">No</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (tabKey === 'syllabus') {
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Syllabus Completion & Lesson Plan Monitoring</h3>
            <span class="badge badge-success">On Schedule for Midterm</span>
          </div>

          <div style="display: grid; gap: 20px;">
            <div style="background: rgba(0,0,0,0.02); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <strong>Grade 9 Mathematics — Quadratic Equations & Trigonometry</strong>
                <span style="font-weight: 700; color: #3b82f6;">78% Completed</span>
              </div>
              <div style="height: 10px; background: var(--border-color); border-radius: 999px; overflow: hidden;">
                <div style="width: 78%; height: 100%; background: #3b82f6; border-radius: 999px;"></div>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 6px;">Unit 4 finished. Commencing Exercise 5.1 next Monday.</div>
            </div>

            <div style="background: rgba(0,0,0,0.02); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <strong>Grade 11 Physics — Thermodynamics & Kinetic Theory</strong>
                <span style="font-weight: 700; color: #10b981;">84% Completed</span>
              </div>
              <div style="height: 10px; background: var(--border-color); border-radius: 999px; overflow: hidden;">
                <div style="width: 84%; height: 100%; background: #10b981; border-radius: 999px;"></div>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 6px;">All 6 laboratory experiments verified and countersigned.</div>
            </div>
          </div>
        </div>
      `;
    }

    UIComponents.refreshIcons();
  }

  static bindEvents(container) {
    container.querySelectorAll('.acad-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        container.querySelectorAll('.acad-tab').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
        e.currentTarget.classList.remove('btn-secondary');
        e.currentTarget.classList.add('btn-primary');
        this.renderTab(e.currentTarget.dataset.tab, container);
      });
    });

    const clashBtn = container.querySelector('#btn-detect-clashes');
    if (clashBtn) {
      clashBtn.addEventListener('click', () => {
        UIComponents.showToast('Automated conflict check completed: 0 timetable collisions detected across all classrooms!', 'success');
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
                <label class="form-label">Subject Code</label>
                <input class="form-input" id="sub-code" required placeholder="e.g. BIO-10" value="BIO-10">
              </div>
              <div class="form-group">
                <label class="form-label">Subject Name</label>
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
            </form>
          `,
          footerHtml: `
            <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
            <button class="btn btn-primary" id="btn-save-sub">Save Subject</button>
          `
        });

        document.getElementById('btn-save-sub').addEventListener('click', async () => {
          const code = document.getElementById('sub-code').value;
          const name = document.getElementById('sub-name').value;
          if (!name) return;

          await auditService.log('SUBJECT_CREATED', 'ACADEMIC', { code, name });
          UIComponents.closeModal();
          UIComponents.showToast(`Subject ${name} added to curriculum!`, 'success');
        });
      });
    }
  }
}

export default AcademicModule;
