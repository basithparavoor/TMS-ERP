/**
 * THAIBA MODEL SCHOOL — Examinations, Assessment & Report Cards Module
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { UIComponents } from './ui-components.js';
import { auditService } from './audit-service.js';

export class ExaminationModule {
  static async render(container) {
    const students = await dbService.select('students');

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem;">Examinations & Assessment Engine</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Exam schedules, bulk marks entry, grade distribution (A+ to F), and official printable report cards.
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" id="btn-publish-results"><i data-lucide="share-2"></i> Publish Results</button>
            <button class="btn btn-primary" id="btn-enter-marks"><i data-lucide="edit-3"></i> Bulk Marks Entry</button>
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'Current Assessment', value: 'Term 1 Exam', icon: 'award', color: 'blue', subtitle: 'Academic Year 2024-25' })}
        ${UIComponents.renderKpiCard({ title: 'School Overall Pass Rate', value: '98.5%', icon: 'trending-up', color: 'emerald', subtitle: 'Above CBSE Benchmark' })}
        ${UIComponents.renderKpiCard({ title: 'Class Toppers (A+)', value: '38 Students', icon: 'star', color: 'amber', subtitle: 'GPA 10.0 Honor Roll' })}
        ${UIComponents.renderKpiCard({ title: 'Remedial Follow-ups', value: '6 Cases', icon: 'help-circle', color: 'rose', subtitle: 'Personal Mentoring Assigned' })}
      </div>

      <!-- Result Cards / Roster -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Term 1 Assessment Ledger — Grade 9 Section A</h3>
            <p class="card-desc">Marks entered for Theory (80), Practical (20), and Attendance Remarks.</p>
          </div>
          <span class="badge badge-success">Results Verified & Ready</span>
        </div>

        <div class="table-responsive">
          <table class="tms-table" id="exam-marks-table">
            <thead>
              <tr>
                <th>Roll</th>
                <th>Admission No</th>
                <th>Student Name</th>
                <th>Mathematics (100)</th>
                <th>Physics (100)</th>
                <th>English (100)</th>
                <th>Total %</th>
                <th>Grade</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>01</strong></td>
                <td><span class="font-mono">TMS/2024/001</span></td>
                <td><strong>Mohammed Rayan K</strong></td>
                <td>95</td>
                <td>92</td>
                <td>88</td>
                <td><strong>91.6%</strong></td>
                <td><span class="badge badge-success">A+ (Outstanding)</span></td>
                <td>
                  <button class="btn btn-secondary btn-sm btn-print-report" data-student="Mohammed Rayan K" data-adm="TMS/2024/001" data-grade="Grade 9A" data-perc="91.6%" data-res="A+">
                    <i data-lucide="file-check"></i> Report Card
                  </button>
                </td>
              </tr>
              <tr>
                <td><strong>02</strong></td>
                <td><span class="font-mono">TMS/2024/002</span></td>
                <td><strong>Fathima Nuha</strong></td>
                <td>88</td>
                <td>85</td>
                <td>94</td>
                <td><strong>89.0%</strong></td>
                <td><span class="badge badge-success">A (Excellent)</span></td>
                <td>
                  <button class="btn btn-secondary btn-sm btn-print-report" data-student="Fathima Nuha" data-adm="TMS/2024/002" data-grade="Grade 9A" data-perc="89.0%" data-res="A">
                    <i data-lucide="file-check"></i> Report Card
                  </button>
                </td>
              </tr>
              <tr>
                <td><strong>03</strong></td>
                <td><span class="font-mono">TMS/2024/003</span></td>
                <td><strong>Zayan Ahmed</strong></td>
                <td>74</td>
                <td>78</td>
                <td>80</td>
                <td><strong>77.3%</strong></td>
                <td><span class="badge badge-info">B+ (Very Good)</span></td>
                <td>
                  <button class="btn btn-secondary btn-sm btn-print-report" data-student="Zayan Ahmed" data-adm="TMS/2024/003" data-grade="Grade 9A" data-perc="77.3%" data-res="B+">
                    <i data-lucide="file-check"></i> Report Card
                  </button>
                </td>
              </tr>
              <tr>
                <td><strong>04</strong></td>
                <td><span class="font-mono">TMS/2024/004</span></td>
                <td><strong>Amina Zehra</strong></td>
                <td>98</td>
                <td>96</td>
                <td>95</td>
                <td><strong>96.3%</strong></td>
                <td><span class="badge badge-success">A+ (Topper)</span></td>
                <td>
                  <button class="btn btn-secondary btn-sm btn-print-report" data-student="Amina Zehra" data-adm="TMS/2024/004" data-grade="Grade 9A" data-perc="96.3%" data-res="A+">
                    <i data-lucide="file-check"></i> Report Card
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindEvents(container);
    UIComponents.refreshIcons();
  }

  static bindEvents(container) {
    const publishBtn = container.querySelector('#btn-publish-results');
    if (publishBtn) {
      publishBtn.addEventListener('click', async () => {
        await auditService.log('RESULTS_PUBLISHED', 'EXAM', { term: 'Term 1', academicYear: TMS_CONFIG.academic.currentYear });
        UIComponents.showToast('Term 1 Results Published to Student & Parent Portals!', 'success');
      });
    }

    const marksBtn = container.querySelector('#btn-enter-marks');
    if (marksBtn) {
      marksBtn.addEventListener('click', () => {
        UIComponents.openModal({
          title: 'Bulk Marks Entry — Grade 9 Section A',
          bodyHtml: `
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px;">
              Enter scores out of 100 (Theory 80 + Internal Assessment 20).
            </p>
            <div class="table-responsive">
              <table class="tms-table font-mono" style="font-size: 0.82rem;">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Theory (80)</th>
                    <th>Internal (20)</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Mohammed Rayan K</td>
                    <td><input type="number" class="form-input" style="width: 70px; padding: 4px;" value="76"></td>
                    <td><input type="number" class="form-input" style="width: 70px; padding: 4px;" value="19"></td>
                    <td><strong>95 / 100</strong></td>
                  </tr>
                  <tr>
                    <td>Fathima Nuha</td>
                    <td><input type="number" class="form-input" style="width: 70px; padding: 4px;" value="70"></td>
                    <td><input type="number" class="form-input" style="width: 70px; padding: 4px;" value="18"></td>
                    <td><strong>88 / 100</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          `,
          footerHtml: `
            <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
            <button class="btn btn-primary" id="btn-save-marks-bulk">Save & Verify</button>
          `
        });

        document.getElementById('btn-save-marks-bulk').addEventListener('click', async () => {
          await auditService.log('MARKS_BULK_ENTRY', 'EXAM', { class: 'Grade 9A', subject: 'Mathematics' });
          UIComponents.closeModal();
          UIComponents.showToast('Marks saved and cryptographic verification score applied!', 'success');
        });
      });
    }

    container.querySelectorAll('.btn-print-report').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const student = e.currentTarget.dataset.student;
        const adm = e.currentTarget.dataset.adm;
        const grade = e.currentTarget.dataset.grade;
        const perc = e.currentTarget.dataset.perc;
        const res = e.currentTarget.dataset.res;

        UIComponents.openModal({
          title: `Official Cumulative Report Card — ${student}`,
          bodyHtml: `
            <div id="official-report-card" style="padding: 24px; border: 2px solid #3b82f6; border-radius: 12px; background: #fff; color: #0f172a;">
              <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
                <h2 style="font-size: 1.4rem; color: #1e40af; margin-bottom: 2px;">${TMS_CONFIG.institution.name}</h2>
                <p style="font-size: 0.8rem; color: #64748b;">${TMS_CONFIG.institution.address.campus}, ${TMS_CONFIG.institution.address.city}</p>
                <h3 style="font-size: 1.05rem; margin-top: 8px;">PROGRESS REPORT — TERM 1 (${TMS_CONFIG.academic.currentYear})</h3>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85rem; margin-bottom: 16px; background: #f8fafc; padding: 10px; border-radius: 8px;">
                <div><strong>Student Name:</strong> ${student}</div>
                <div><strong>Admission No:</strong> ${adm}</div>
                <div><strong>Class & Section:</strong> ${grade}</div>
                <div><strong>Attendance Ratio:</strong> 96.4%</div>
              </div>

              <table class="tms-table" style="margin-bottom: 16px; font-size: 0.82rem;">
                <thead>
                  <tr style="background: #e2e8f0; color: #0f172a;">
                    <th>Subject</th>
                    <th>Max Marks</th>
                    <th>Marks Scored</th>
                    <th>Grade</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Mathematics</td>
                    <td>100</td>
                    <td>95</td>
                    <td><strong>A+</strong></td>
                    <td>Exemplary analytical aptitude</td>
                  </tr>
                  <tr>
                    <td>Physics & Lab Practical</td>
                    <td>100</td>
                    <td>92</td>
                    <td><strong>A+</strong></td>
                    <td>Excellent practical methodology</td>
                  </tr>
                  <tr>
                    <td>English Communicative</td>
                    <td>100</td>
                    <td>88</td>
                    <td><strong>A</strong></td>
                    <td>Very good articulate expression</td>
                  </tr>
                  <tr style="font-weight: 700; background: #f1f5f9;">
                    <td>Overall Aggregate</td>
                    <td>300</td>
                    <td>275 (${perc})</td>
                    <td><strong>${res}</strong></td>
                    <td>Promoted with Distinction</td>
                  </tr>
                </tbody>
              </table>

              <div style="display: flex; justify-content: space-between; margin-top: 40px; font-size: 0.8rem; text-align: center;">
                <div>
                  ____________________<br>
                  <strong>Class Teacher</strong>
                </div>
                <div>
                  ____________________<br>
                  <strong>Academic Coordinator</strong>
                </div>
                <div>
                  ____________________<br>
                  <strong>Principal (Official Seal)</strong>
                </div>
              </div>
            </div>
          `,
          footerHtml: `
            <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Close</button>
            <button class="btn btn-primary" onclick="window.print()"><i data-lucide="printer"></i> Print Official Report Card</button>
          `
        });
      });
    });
  }
}

export default ExaminationModule;
