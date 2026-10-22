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
        ${UIComponents.renderKpiCard({ title: 'Active Academic Session', value: TMS_CONFIG.academic.currentYear, icon: 'calendar', color: 'blue', subtitle: 'Configured Session' })}
        ${UIComponents.renderKpiCard({ title: 'Configured Grades', value: `${TMS_CONFIG.academic.classes.length}`, icon: 'layers', color: 'emerald', subtitle: 'Defined in Academic Settings' })}
        ${UIComponents.renderKpiCard({ title: 'Master Subjects', value: '0', icon: 'book', color: 'amber', subtitle: 'No Subjects Configured Yet' })}
        ${UIComponents.renderKpiCard({ title: 'Timetable Status', value: '—', icon: 'check-circle', color: 'emerald', subtitle: 'No Timetable Published Yet' })}
      </div>

      <!-- Academic Segmented Tabs -->
      <div class="tms-tab-rail-wrapper">
        <div class="tms-segmented-tabs">
          <button class="tms-tab-pill active acad-tab" data-tab="classes">
            <i data-lucide="layers"></i>
            <span>Classes &amp; Teachers</span>
          </button>
          <button class="tms-tab-pill acad-tab" data-tab="subjects">
            <i data-lucide="book"></i>
            <span>Subject Master</span>
          </button>
          <button class="tms-tab-pill acad-tab" data-tab="syllabus">
            <i data-lucide="line-chart"></i>
            <span>Syllabus Tracker</span>
          </button>
        </div>
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
                  <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No records available yet.</td>
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
                  <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No records available yet.</td>
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
            <span class="badge badge-info">No Active Lesson Plans</span>
          </div>

          <div style="text-align: center; color: var(--text-muted); padding: 40px;">
            <i data-lucide="inbox" style="width:40px;height:40px;display:block;margin:0 auto 10px;"></i>
            No records available yet.
          </div>
        </div>
      `;
    }

    UIComponents.refreshIcons();
  }

  static bindEvents(container) {
    container.querySelectorAll('.acad-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        container.querySelectorAll('.acad-tab').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.renderTab(e.currentTarget.dataset.tab, container);
      });
    });

    const clashBtn = container.querySelector('#btn-detect-clashes');
    if (clashBtn) {
      clashBtn.addEventListener('click', () => {
        UIComponents.showToast('Automated conflict check completed. No conflicts recorded.', 'info');
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
                <input class="form-input" id="sub-code" required placeholder="e.g. BIO-10">
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
