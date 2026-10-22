/**
 * THAIBA MODEL SCHOOL — Examinations, Assessment & Report Cards Module
 * Full Academic Ledger, Gradebook, Assessment Engine & A4 CBSE-Style Progress Report Cards
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { UIComponents } from './ui-components.js';
import { auditService } from './audit-service.js';
import { TMS_LOGO } from './logo.js';
import { WhatsAppService } from './whatsapp-service.js';

export const STANDARD_SUBJECTS = [
  { code: 'ENG', name: 'English Language & Literature', maxTheory: 80, maxPractical: 20 },
  { code: 'BEN', name: 'Bengali / Regional Language', maxTheory: 80, maxPractical: 20 },
  { code: 'MATH', name: 'Mathematics', maxTheory: 80, maxPractical: 20 },
  { code: 'SCI', name: 'General Science', maxTheory: 80, maxPractical: 20 },
  { code: 'SOC', name: 'Social Science', maxTheory: 80, maxPractical: 20 },
  { code: 'CS', name: 'Computer Applications', maxTheory: 60, maxPractical: 40 },
  { code: 'ISL', name: 'Islamic & Moral Studies', maxTheory: 80, maxPractical: 20 }
];

export function calculateGrade(pct) {
  const p = Number(pct) || 0;
  if (p >= 91) return { grade: 'A1', points: 10, remark: 'Outstanding' };
  if (p >= 81) return { grade: 'A2', points: 9, remark: 'Excellent' };
  if (p >= 71) return { grade: 'B1', points: 8, remark: 'Very Good' };
  if (p >= 61) return { grade: 'B2', points: 7, remark: 'Good' };
  if (p >= 51) return { grade: 'C1', points: 6, remark: 'Satisfactory' };
  if (p >= 41) return { grade: 'C2', points: 5, remark: 'Average' };
  if (p >= 33) return { grade: 'D', points: 4, remark: 'Pass' };
  return { grade: 'E', points: 0, remark: 'Needs Improvement' };
}

export class ExaminationModule {
  static async render(container) {
    const esc = (v) => UIComponents.escapeHtml(v);
    
    // Fetch all students and assessment records
    const [allStudents, allAssessments] = await Promise.all([
      dbService.select('students'),
      dbService.select('exam_assessments')
    ]);

    this._students = allStudents || [];
    this._assessments = allAssessments || [];
    this._selectedGrade = this._selectedGrade || (TMS_CONFIG.academic.classes[0] || 'Grade 1');
    this._selectedSection = this._selectedSection || 'all';
    this._selectedTerm = this._selectedTerm || 'Term 1 Exam';
    this._examViewTab = this._examViewTab || 'ledger'; // 'ledger' | 'warning'

    // Filter students
    let filteredStudents = this._students.filter(s => {
      const matchGrade = this._selectedGrade === 'all' || s.grade === this._selectedGrade;
      const matchSec = this._selectedSection === 'all' || s.section === this._selectedSection;
      return matchGrade && matchSec;
    });

    // Build assessment map student_id -> assessment
    const assessMap = {};
    for (const a of this._assessments) {
      if (a.term === this._selectedTerm && (!a.academicYear || a.academicYear === TMS_CONFIG.academic.currentYear)) {
        if (a.studentId) assessMap[a.studentId] = a;
        if (a.admissionNo) assessMap[a.admissionNo] = a;
      }
    }

    // KPI Metrics calculation
    const recordedList = filteredStudents.map(s => assessMap[s.id] || assessMap[s.admissionNo]).filter(Boolean);
    const passCount = recordedList.filter(a => (a.percentage || 0) >= 33).length;
    const topperCount = recordedList.filter(a => (a.percentage || 0) >= 90).length;
    const remedialCount = recordedList.filter(a => (a.percentage || 0) < 33).length;
    const passRate = recordedList.length ? `${Math.round((passCount / recordedList.length) * 100)}%` : '—';

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem; display: flex; align-items: center; gap: 10px;">
              <span style="color: #16a34a;"><i data-lucide="award"></i></span> Examinations & Assessment Engine
            </h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Class gradebooks, bulk marks ledger, official CBSE/State-Board A4 Cumulative Progress Report Cards.
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-secondary" id="btn-publish-results"><i data-lucide="share-2"></i> Publish Results</button>
            <button class="btn btn-primary" id="btn-enter-marks"><i data-lucide="edit-3"></i> Bulk Marks Entry</button>
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'Current Assessment', value: this._selectedTerm, icon: 'calendar', color: 'blue', subtitle: TMS_CONFIG.academic.currentYear })}
        ${UIComponents.renderKpiCard({ title: 'Class Pass Rate', value: passRate, icon: 'trending-up', color: 'emerald', subtitle: `${passCount} of ${recordedList.length} Assessed` })}
        ${UIComponents.renderKpiCard({ title: 'Class Toppers (A1/A2)', value: recordedList.length ? `${topperCount}` : '—', icon: 'star', color: 'amber', subtitle: 'Score ≥ 90%' })}
        ${UIComponents.renderKpiCard({ title: 'Remedial Support', value: recordedList.length ? `${remedialCount}` : '—', icon: 'alert-triangle', color: 'rose', subtitle: 'Score < 33%' })}
      </div>

      <!-- Filters Filter Card -->
      <div class="card" style="margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; align-items: flex-end;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-weight: 600;">Grade / Class</label>
            <select class="form-select" id="exam-filter-grade">
              ${TMS_CONFIG.academic.classes.map(c => `<option value="${esc(c)}" ${this._selectedGrade === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-weight: 600;">Section</label>
            <select class="form-select" id="exam-filter-section">
              <option value="all" ${this._selectedSection === 'all' ? 'selected' : ''}>All Sections</option>
              <option value="A" ${this._selectedSection === 'A' ? 'selected' : ''}>Section A</option>
              <option value="B" ${this._selectedSection === 'B' ? 'selected' : ''}>Section B</option>
              <option value="C" ${this._selectedSection === 'C' ? 'selected' : ''}>Section C</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-weight: 600;">Examination Term</label>
            <select class="form-select" id="exam-filter-term">
              ${['Term 1 Exam', 'Term 2 Exam', 'Mid-Term Exam', 'Annual Examination', 'Unit Assessment 1'].map(t => `
                <option value="${esc(t)}" ${this._selectedTerm === t ? 'selected' : ''}>${esc(t)}</option>
              `).join('')}
            </select>
          </div>
          <div>
            <button class="btn btn-secondary" style="width: 100%;" id="btn-print-class-roster">
              <i data-lucide="printer"></i> Print Class Ledger
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <button class="btn ${this._examViewTab === 'ledger' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="tab-exam-ledger">
          <i data-lucide="table"></i> Marks Ledger &amp; Report Cards
        </button>
        <button class="btn ${this._examViewTab === 'warning' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="tab-exam-warning">
          <i data-lucide="alert-triangle" style="color: #f59e0b;"></i> Academic Early Warning &amp; Remedial Radar (${remedialCount} At-Risk)
        </button>
      </div>

      ${this._examViewTab === 'ledger' ? `
      <!-- Result Cards / Roster -->
      <div class="card">
        <div class="card-header" style="flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 class="card-title">${esc(this._selectedTerm)} Ledger — ${esc(this._selectedGrade)} ${this._selectedSection !== 'all' ? `(Sec ${esc(this._selectedSection)})` : ''}</h3>
            <p class="card-desc">Marks ledger across 7 core subjects. Click "Report Card" to preview and print CBSE A4 Cumulative Progress Reports.</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <span class="badge ${recordedList.length === filteredStudents.length && filteredStudents.length > 0 ? 'badge-success' : 'badge-warning'}">
              ${recordedList.length} / ${filteredStudents.length} Graded
            </span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="tms-table" id="exam-marks-table">
            <thead>
              <tr>
                <th style="width: 50px;">Roll</th>
                <th>Admission No</th>
                <th>Student Name</th>
                <th>Math (100)</th>
                <th>Sci (100)</th>
                <th>Eng (100)</th>
                <th>Total Scored</th>
                <th>Overall %</th>
                <th>Grade</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredStudents.length ? filteredStudents.map(s => {
                const assess = assessMap[s.id] || assessMap[s.admissionNo];
                const hasMarks = !!assess;
                const subjects = (assess && assess.subjectMarks) || [];
                const mathObj = subjects.find(sb => sb.code === 'MATH');
                const sciObj = subjects.find(sb => sb.code === 'SCI');
                const engObj = subjects.find(sb => sb.code === 'ENG');

                const mathScore = mathObj ? (mathObj.theory || 0) + (mathObj.practical || 0) : '—';
                const sciScore = sciObj ? (sciObj.theory || 0) + (sciObj.practical || 0) : '—';
                const engScore = engObj ? (engObj.theory || 0) + (engObj.practical || 0) : '—';

                const totalMax = assess ? (assess.totalMax || 700) : 700;
                const totalScored = assess ? (assess.totalScored || 0) : 0;
                const pct = assess ? Math.round(assess.percentage || 0) : 0;
                const gradeInfo = hasMarks ? calculateGrade(pct) : null;

                return `
                  <tr>
                    <td><strong>${esc(s.rollNo || '—')}</strong></td>
                    <td><span class="font-mono">${esc(s.admissionNo || '—')}</span></td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        ${s.photo ? `<img src="${esc(s.photo)}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;">` : `<div style="width: 28px; height: 28px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;">${esc((s.fullName || 'S').slice(0, 1))}</div>`}
                        <strong>${esc(s.fullName || '—')}</strong>
                      </div>
                    </td>
                    <td class="font-mono">${mathScore}</td>
                    <td class="font-mono">${sciScore}</td>
                    <td class="font-mono">${engScore}</td>
                    <td class="font-mono">${hasMarks ? `${totalScored} / ${totalMax}` : '—'}</td>
                    <td>
                      ${hasMarks ? `
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <div style="width: 50px; background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="width: ${Math.min(pct, 100)}%; background: ${pct >= 75 ? '#16a34a' : pct >= 50 ? '#3b82f6' : pct >= 33 ? '#eab308' : '#ef4444'}; height: 100%;"></div>
                          </div>
                          <strong>${pct}%</strong>
                        </div>
                      ` : '<span style="color: var(--text-muted); font-size: 0.8rem;">Pending</span>'}
                    </td>
                    <td>
                      ${hasMarks ? `
                        <span class="badge ${pct >= 75 ? 'badge-success' : pct >= 50 ? 'badge-info' : pct >= 33 ? 'badge-warning' : 'badge-danger'}" style="font-weight: 700;">
                          ${gradeInfo.grade}
                        </span>
                      ` : '—'}
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 6px;">
                        <button class="btn btn-secondary btn-sm btn-edit-student-marks" data-student-id="${esc(s.id)}" title="Enter / Edit Marks">
                          <i data-lucide="edit-2"></i> ${hasMarks ? 'Edit' : 'Enter'}
                        </button>
                        <button class="btn btn-primary btn-sm btn-view-report-card" data-student-id="${esc(s.id)}" title="Generate A4 Report Card">
                          <i data-lucide="file-text"></i> Report Card
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="10" style="text-align: center; color: var(--text-muted); padding: 36px;">
                    No students enrolled in ${esc(this._selectedGrade)} ${this._selectedSection !== 'all' ? `(Section ${esc(this._selectedSection)})` : ''}.
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
      ` : `
      <!-- Academic Early Warning & Remedial Intervention Radar -->
      <div class="card">
        <div class="card-header" style="flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 class="card-title" style="color: #d97706; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="shield-alert"></i> Academic Early Warning &amp; At-Risk Radar
            </h3>
            <p class="card-desc">Diagnostic radar identifying students requiring targeted academic intervention, remediation, and parent conferences.</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="tms-table" id="exam-warning-table">
            <thead>
              <tr>
                <th style="width: 50px;">Roll</th>
                <th>Admission No</th>
                <th>Student Name</th>
                <th>Score %</th>
                <th>Grade</th>
                <th>Academic Risk Factors</th>
                <th>Intervention Status</th>
                <th style="text-align: right;">Action Tools</th>
              </tr>
            </thead>
            <tbody>
              ${filteredStudents.length ? filteredStudents.map(s => {
                const assess = assessMap[s.id] || assessMap[s.admissionNo];
                const pct = assess ? (assess.percentage || 0) : null;
                const subjects = (assess && assess.subjectMarks) || [];
                const failedSubjects = subjects.filter(sb => ((sb.theory || 0) + (sb.practical || 0)) < 33).map(sb => sb.name || sb.code);
                
                let riskLevel = 'none';
                let riskLabel = 'On Track';
                let riskBadge = 'badge-success';

                if (pct === null) {
                  riskLevel = 'unknown';
                  riskLabel = 'Not Assessed';
                  riskBadge = 'badge-info';
                } else if (pct < 33 || failedSubjects.length >= 2) {
                  riskLevel = 'critical';
                  riskLabel = 'Critical Risk';
                  riskBadge = 'badge-danger';
                } else if (pct < 50 || failedSubjects.length === 1) {
                  riskLevel = 'moderate';
                  riskLabel = 'Moderate Concern';
                  riskBadge = 'badge-warning';
                }

                const reasons = [];
                if (pct !== null && pct < 40) reasons.push(`Low aggregate score (${pct}%)`);
                if (failedSubjects.length) reasons.push(`Failing in: ${failedSubjects.join(', ')}`);
                if (!reasons.length && pct !== null) reasons.push('Overall progress satisfactory');

                return `
                  <tr style="${riskLevel === 'critical' ? 'background: rgba(239, 68, 68, 0.05);' : riskLevel === 'moderate' ? 'background: rgba(245, 158, 11, 0.04);' : ''}">
                    <td><span class="font-mono">${esc(s.rollNo || '—')}</span></td>
                    <td><span class="font-mono">${esc(s.admissionNo || '—')}</span></td>
                    <td>
                      <strong>${esc(s.fullName)}</strong>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">${esc(s.phone || s.guardianPhone || 'No phone')}</div>
                    </td>
                    <td><strong>${pct !== null ? `${pct}%` : '—'}</strong></td>
                    <td><span class="badge ${riskBadge}">${pct !== null ? calculateGrade(pct).grade : '—'}</span></td>
                    <td>
                      <div style="font-size: 0.78rem; line-height: 1.3;">
                        ${reasons.map(r => `<div style="color: ${riskLevel === 'critical' ? '#dc2626' : riskLevel === 'moderate' ? '#d97706' : '#16a34a'}; font-weight: 600;">• ${esc(r)}</div>`).join('')}
                      </div>
                    </td>
                    <td>
                      <span class="badge ${riskBadge}" style="font-weight: 700;">${riskLabel}</span>
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 6px;">
                        ${riskLevel !== 'none' ? `
                          <button class="btn btn-secondary btn-sm btn-remedial-wa" data-student-id="${esc(s.id)}" data-name="${esc(s.fullName)}" data-phone="${esc(s.phone || s.guardianPhone || '')}" data-grade="${esc(s.grade || '')}" data-reasons="${esc(reasons.join(' | '))}" title="Send Remedial WhatsApp Notice" style="color: #16a34a;">
                            <i data-lucide="message-circle"></i> WhatsApp
                          </button>
                          <button class="btn btn-primary btn-sm btn-remedial-plan" data-student-id="${esc(s.id)}" data-name="${esc(s.fullName)}" data-adm="${esc(s.admissionNo || '')}" data-grade="${esc(s.grade || '')}" data-pct="${esc(pct || '0')}" data-reasons="${esc(reasons.join(', '))}" title="Generate Academic Intervention Plan">
                            <i data-lucide="file-check"></i> Plan
                          </button>
                        ` : `
                          <span style="font-size: 0.75rem; color: var(--text-muted);">Good Standing</span>
                        `}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 36px;">
                    No pupils to evaluate.
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
      `}
    `;

    this.bindEvents(container);
    UIComponents.refreshIcons();
  }

  static bindEvents(container) {
    const esc = (v) => UIComponents.escapeHtml(v);

    // Tab switching
    const tabLedger = container.querySelector('#tab-exam-ledger');
    const tabWarning = container.querySelector('#tab-exam-warning');
    if (tabLedger) {
      tabLedger.addEventListener('click', () => {
        this._examViewTab = 'ledger';
        this.render(container);
      });
    }
    if (tabWarning) {
      tabWarning.addEventListener('click', () => {
        this._examViewTab = 'warning';
        this.render(container);
      });
    }

    // Remedial WhatsApp Button
    container.querySelectorAll('.btn-remedial-wa').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const name = e.currentTarget.dataset.name;
        const phone = e.currentTarget.dataset.phone;
        const grade = e.currentTarget.dataset.grade;
        const rawReasons = e.currentTarget.dataset.reasons || '';
        const reasons = rawReasons.split(' | ').filter(Boolean);

        WhatsAppService.sendRemedialAcademicAlert({
          fullName: name,
          grade: grade,
          phone: phone
        }, reasons);
      });
    });

    // Remedial Plan A4 Generator
    container.querySelectorAll('.btn-remedial-plan').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const name = e.currentTarget.dataset.name;
        const adm = e.currentTarget.dataset.adm;
        const grade = e.currentTarget.dataset.grade;
        const pct = e.currentTarget.dataset.pct;
        const reasons = e.currentTarget.dataset.reasons;

        this.openRemedialPlanModal(name, adm, grade, pct, reasons);
      });
    });

    // Filter changes
    const gradeSelect = container.querySelector('#exam-filter-grade');
    if (gradeSelect) {
      gradeSelect.addEventListener('change', (e) => {
        this._selectedGrade = e.target.value;
        this.render(container);
      });
    }

    const secSelect = container.querySelector('#exam-filter-section');
    if (secSelect) {
      secSelect.addEventListener('change', (e) => {
        this._selectedSection = e.target.value;
        this.render(container);
      });
    }

    const termSelect = container.querySelector('#exam-filter-term');
    if (termSelect) {
      termSelect.addEventListener('change', (e) => {
        this._selectedTerm = e.target.value;
        this.render(container);
      });
    }

    // Publish Results Button
    const publishBtn = container.querySelector('#btn-publish-results');
    if (publishBtn) {
      publishBtn.addEventListener('click', async () => {
        await auditService.log('RESULTS_PUBLISHED', 'EXAM', {
          term: this._selectedTerm,
          grade: this._selectedGrade,
          academicYear: TMS_CONFIG.academic.currentYear
        });
        UIComponents.showToast(`${this._selectedTerm} Results for ${this._selectedGrade} Published to Student & Parent Portals!`, 'success');
      });
    }

    // Print Class Ledger
    const printRosterBtn = container.querySelector('#btn-print-class-roster');
    if (printRosterBtn) {
      printRosterBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Bulk Marks Entry Button
    const bulkBtn = container.querySelector('#btn-enter-marks');
    if (bulkBtn) {
      bulkBtn.addEventListener('click', () => {
        this.openBulkMarksModal(container);
      });
    }

    // Individual Edit Marks Button
    container.querySelectorAll('.btn-edit-student-marks').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.currentTarget.dataset.studentId;
        const student = this._students.find(s => s.id === studentId);
        if (student) this.openIndividualMarksModal(student, container);
      });
    });

    // Individual Report Card Button
    container.querySelectorAll('.btn-view-report-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.currentTarget.dataset.studentId;
        const student = this._students.find(s => s.id === studentId);
        if (student) this.openReportCardModal(student);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Individual Student Marks Modal                                     */
  /* ------------------------------------------------------------------ */
  static async openIndividualMarksModal(student, container) {
    const esc = (v) => UIComponents.escapeHtml(v);
    const existing = this._assessments.find(a => 
      (a.studentId === student.id || a.admissionNo === student.admissionNo) && 
      a.term === this._selectedTerm
    );

    const subjectScores = {};
    if (existing && Array.isArray(existing.subjectMarks)) {
      existing.subjectMarks.forEach(s => {
        subjectScores[s.code] = s;
      });
    }

    const rowsHtml = STANDARD_SUBJECTS.map(subj => {
      const score = subjectScores[subj.code] || { theory: 0, practical: 0, remark: '' };
      return `
        <tr data-code="${esc(subj.code)}">
          <td>
            <strong>${esc(subj.name)}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-mono;">${esc(subj.code)}</div>
          </td>
          <td style="text-align: center;">${subj.maxTheory}</td>
          <td>
            <input type="number" min="0" max="${subj.maxTheory}" class="form-input mark-theory font-mono" style="width: 80px; text-align: center;" value="${score.theory ?? 0}">
          </td>
          <td style="text-align: center;">${subj.maxPractical}</td>
          <td>
            <input type="number" min="0" max="${subj.maxPractical}" class="form-input mark-prac font-mono" style="width: 80px; text-align: center;" value="${score.practical ?? 0}">
          </td>
          <td class="font-mono font-bold row-total" style="text-align: center;">${(Number(score.theory) || 0) + (Number(score.practical) || 0)}</td>
          <td class="font-bold row-grade" style="text-align: center;">${calculateGrade(((Number(score.theory) || 0) + (Number(score.practical) || 0))).grade}</td>
          <td>
            <input type="text" class="form-input mark-remark" style="width: 130px; font-size: 0.8rem;" placeholder="Remark" value="${esc(score.remark || '')}">
          </td>
        </tr>
      `;
    }).join('');

    const bodyHtml = `
      <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="font-size: 1.1rem; font-weight: 700; color: #0f172a;">${esc(student.fullName)}</div>
          <div style="font-size: 0.85rem; color: #64748b;">Admission No: <strong class="font-mono">${esc(student.admissionNo)}</strong> • Roll: <strong>${esc(student.rollNo || '—')}</strong> • Class: <strong>${esc(student.grade)} ${esc(student.section || '')}</strong></div>
        </div>
        <div style="text-align: right;">
          <span class="badge badge-info" style="font-size: 0.85rem;">${esc(this._selectedTerm)}</span>
          <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">Session: ${TMS_CONFIG.academic.currentYear}</div>
        </div>
      </div>

      <div class="table-responsive" style="max-height: 380px; overflow-y: auto;">
        <table class="tms-table" id="table-student-marks-entry" style="font-size: 0.85rem;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th>Subject</th>
              <th style="text-align: center;">Max Th</th>
              <th style="text-align: center;">Theory</th>
              <th style="text-align: center;">Max Pr</th>
              <th style="text-align: center;">Practical</th>
              <th style="text-align: center;">Total (100)</th>
              <th style="text-align: center;">Grade</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-top: 16px; padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Attendance Ratio</label>
          <input type="text" class="form-input" id="inp-attendance-ratio" value="${esc(existing?.attendanceRatio || '95%')}" placeholder="e.g. 95% or 180/190">
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Class Teacher's Remarks</label>
          <input type="text" class="form-input" id="inp-teacher-remarks" value="${esc(existing?.teacherRemarks || 'Punctual, diligent, and shows active interest in class activities.')}" placeholder="Official remarks on progress">
        </div>
      </div>

      <div style="margin-top: 14px; display: flex; justify-content: space-between; align-items: center; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 10px 16px; border-radius: 8px;">
        <div>
          <span style="font-size: 0.85rem; color: #065f46; font-weight: 600;">Cumulative Computed Score:</span>
          <span id="modal-calc-aggregate" style="font-size: 1.1rem; font-weight: 800; color: #047857; margin-left: 8px;">—</span>
        </div>
        <div>
          <span style="font-size: 0.85rem; color: #065f46; font-weight: 600;">Overall Grade:</span>
          <span id="modal-calc-grade" class="badge badge-success" style="font-size: 1rem; margin-left: 6px;">—</span>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
      <button class="btn btn-primary" id="btn-save-individual-marks"><i data-lucide="save"></i> Save Assessment</button>
    `;

    UIComponents.openModal({
      title: `Assessment Entry — ${student.fullName}`,
      bodyHtml,
      footerHtml
    });

    const modal = document.querySelector('.tms-modal');
    if (!modal) return;

    // Recalculate totals
    const recalc = () => {
      let grandScored = 0;
      let grandMax = 0;

      modal.querySelectorAll('#table-student-marks-entry tbody tr').forEach(tr => {
        const thInp = tr.querySelector('.mark-theory');
        const prInp = tr.querySelector('.mark-prac');
        const thVal = Number(thInp?.value) || 0;
        const prVal = Number(prInp?.value) || 0;
        const total = thVal + prVal;
        
        grandScored += total;
        grandMax += 100;

        const rowTotal = tr.querySelector('.row-total');
        if (rowTotal) rowTotal.innerText = total;

        const rowGrade = tr.querySelector('.row-grade');
        if (rowGrade) rowGrade.innerText = calculateGrade(total).grade;
      });

      const pct = grandMax > 0 ? (grandScored / grandMax) * 100 : 0;
      const g = calculateGrade(pct);

      const aggEl = modal.querySelector('#modal-calc-aggregate');
      if (aggEl) aggEl.innerText = `${grandScored} / ${grandMax} (${pct.toFixed(1)}%)`;

      const gEl = modal.querySelector('#modal-calc-grade');
      if (gEl) gEl.innerText = `${g.grade} (${g.remark})`;
    };

    modal.querySelectorAll('.mark-theory, .mark-prac').forEach(inp => {
      inp.addEventListener('input', recalc);
    });
    recalc();

    // Save button
    const saveBtn = modal.querySelector('#btn-save-individual-marks');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        saveBtn.disabled = true;
        saveBtn.innerText = 'Saving...';

        const subjectMarks = [];
        let grandScored = 0;
        let grandMax = 0;

        modal.querySelectorAll('#table-student-marks-entry tbody tr').forEach(tr => {
          const code = tr.dataset.code;
          const subjDef = STANDARD_SUBJECTS.find(s => s.code === code);
          const thVal = Number(tr.querySelector('.mark-theory')?.value) || 0;
          const prVal = Number(tr.querySelector('.mark-prac')?.value) || 0;
          const remark = tr.querySelector('.mark-remark')?.value || '';
          const total = thVal + prVal;

          grandScored += total;
          grandMax += 100;

          subjectMarks.push({
            code,
            name: subjDef?.name || code,
            maxTheory: subjDef?.maxTheory || 80,
            theory: thVal,
            maxPractical: subjDef?.maxPractical || 20,
            practical: prVal,
            total,
            grade: calculateGrade(total).grade,
            remark
          });
        });

        const pct = grandMax > 0 ? (grandScored / grandMax) * 100 : 0;
        const overallGrade = calculateGrade(pct).grade;
        const attendanceRatio = modal.querySelector('#inp-attendance-ratio')?.value || '95%';
        const teacherRemarks = modal.querySelector('#inp-teacher-remarks')?.value || '';

        const recordId = existing ? existing.id : `exam_${student.id}_${Date.now()}`;
        const recordData = {
          id: recordId,
          studentId: student.id,
          studentName: student.fullName,
          admissionNo: student.admissionNo,
          grade: student.grade,
          section: student.section,
          term: this._selectedTerm,
          academicYear: TMS_CONFIG.academic.currentYear,
          subjectMarks,
          totalMax: grandMax,
          totalScored: grandScored,
          percentage: Number(pct.toFixed(2)),
          overallGrade,
          attendanceRatio,
          teacherRemarks,
          isPublished: true,
          updatedAt: new Date().toISOString()
        };

        try {
          if (existing) {
            await dbService.update('exam_assessments', existing.id, recordData);
          } else {
            await dbService.insert('exam_assessments', recordData);
          }
          await auditService.log('MARKS_ENTRY', 'EXAM', { student: student.fullName, adm: student.admissionNo, term: this._selectedTerm });
          UIComponents.closeModal();
          UIComponents.showToast(`Assessment saved successfully for ${student.fullName}!`, 'success');
          this.render(container);
        } catch (err) {
          console.error('Error saving exam marks:', err);
          UIComponents.showToast('Failed to save assessment. Please try again.', 'error');
          saveBtn.disabled = false;
          saveBtn.innerText = 'Save Assessment';
        }
      });
    }

    UIComponents.refreshIcons();
  }

  /* ------------------------------------------------------------------ */
  /* Bulk Marks Entry Modal                                             */
  /* ------------------------------------------------------------------ */
  static async openBulkMarksModal(container) {
    const esc = (v) => UIComponents.escapeHtml(v);
    const studentsInClass = this._students.filter(s => {
      const matchGrade = this._selectedGrade === 'all' || s.grade === this._selectedGrade;
      const matchSec = this._selectedSection === 'all' || s.section === this._selectedSection;
      return matchGrade && matchSec;
    });

    if (!studentsInClass.length) {
      UIComponents.showToast('No students available in this class to grade.', 'warning');
      return;
    }

    const bodyHtml = `
      <div style="margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div class="form-group" style="margin-bottom: 0; min-width: 250px;">
          <label class="form-label" style="font-weight: 600;">Select Subject to Grade</label>
          <select class="form-select" id="bulk-subj-select">
            ${STANDARD_SUBJECTS.map(s => `<option value="${esc(s.code)}">${esc(s.name)} (Max: ${s.maxTheory + s.maxPractical})</option>`).join('')}
          </select>
        </div>
        <div>
          <span class="badge badge-info">${esc(this._selectedGrade)} ${this._selectedSection !== 'all' ? `Sec ${esc(this._selectedSection)}` : ''} • ${esc(this._selectedTerm)}</span>
        </div>
      </div>

      <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
        <table class="tms-table" id="bulk-marks-grid" style="font-size: 0.85rem;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="width: 50px;">Roll</th>
              <th>Student Name</th>
              <th style="text-align: center;" id="hdr-max-th">Theory (80)</th>
              <th style="text-align: center;" id="hdr-max-pr">Practical (20)</th>
              <th style="text-align: center;">Total (100)</th>
              <th style="text-align: center;">Grade</th>
            </tr>
          </thead>
          <tbody id="bulk-marks-tbody">
            <!-- Dynamic rows generated per subject -->
          </tbody>
        </table>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
      <button class="btn btn-primary" id="btn-save-bulk-marks"><i data-lucide="check-circle-2"></i> Save Class Scores</button>
    `;

    UIComponents.openModal({
      title: `Bulk Assessment Ledger — ${this._selectedGrade}`,
      bodyHtml,
      footerHtml
    });

    const modal = document.querySelector('.tms-modal');
    if (!modal) return;

    const subjSelect = modal.querySelector('#bulk-subj-select');
    const tbody = modal.querySelector('#bulk-marks-tbody');
    const hdrTh = modal.querySelector('#hdr-max-th');
    const hdrPr = modal.querySelector('#hdr-max-pr');

    const renderBulkRows = () => {
      const selectedCode = subjSelect.value;
      const subj = STANDARD_SUBJECTS.find(s => s.code === selectedCode) || STANDARD_SUBJECTS[0];

      hdrTh.innerText = `Theory (${subj.maxTheory})`;
      hdrPr.innerText = `Practical (${subj.maxPractical})`;

      tbody.innerHTML = studentsInClass.map(s => {
        const assess = this._assessments.find(a => 
          (a.studentId === s.id || a.admissionNo === s.admissionNo) && 
          a.term === this._selectedTerm
        );
        const subjMark = (assess?.subjectMarks || []).find(sm => sm.code === subj.code);
        const th = subjMark ? subjMark.theory : 0;
        const pr = subjMark ? subjMark.practical : 0;
        const tot = th + pr;
        const g = calculateGrade(tot).grade;

        return `
          <tr data-student-id="${esc(s.id)}" data-adm="${esc(s.admissionNo)}" data-name="${esc(s.fullName)}" data-grade="${esc(s.grade)}" data-sec="${esc(s.section || '')}">
            <td><strong>${esc(s.rollNo || '—')}</strong></td>
            <td><strong>${esc(s.fullName)}</strong></td>
            <td>
              <input type="number" min="0" max="${subj.maxTheory}" class="form-input b-th font-mono" style="width: 80px; text-align: center;" value="${th}">
            </td>
            <td>
              <input type="number" min="0" max="${subj.maxPractical}" class="form-input b-pr font-mono" style="width: 80px; text-align: center;" value="${pr}">
            </td>
            <td class="font-mono font-bold b-tot" style="text-align: center;">${tot}</td>
            <td class="font-bold b-grd" style="text-align: center;">${g}</td>
          </tr>
        `;
      }).join('');

      tbody.querySelectorAll('.b-th, .b-pr').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const tr = e.target.closest('tr');
          const thVal = Number(tr.querySelector('.b-th')?.value) || 0;
          const prVal = Number(tr.querySelector('.b-pr')?.value) || 0;
          const t = thVal + prVal;
          tr.querySelector('.b-tot').innerText = t;
          tr.querySelector('.b-grd').innerText = calculateGrade(t).grade;
        });
      });
    };

    subjSelect.addEventListener('change', renderBulkRows);
    renderBulkRows();

    // Save class scores
    const saveBulkBtn = modal.querySelector('#btn-save-bulk-marks');
    if (saveBulkBtn) {
      saveBulkBtn.addEventListener('click', async () => {
        saveBulkBtn.disabled = true;
        saveBulkBtn.innerText = 'Saving Class Scores...';

        const selectedCode = subjSelect.value;
        const subj = STANDARD_SUBJECTS.find(s => s.code === selectedCode) || STANDARD_SUBJECTS[0];

        try {
          const promises = [];
          modal.querySelectorAll('#bulk-marks-tbody tr').forEach(tr => {
            const studentId = tr.dataset.studentId;
            const adm = tr.dataset.adm;
            const name = tr.dataset.name;
            const grade = tr.dataset.grade;
            const sec = tr.dataset.sec;
            const thVal = Number(tr.querySelector('.b-th')?.value) || 0;
            const prVal = Number(tr.querySelector('.b-pr')?.value) || 0;
            const total = thVal + prVal;

            const existing = this._assessments.find(a => 
              (a.studentId === studentId || a.admissionNo === adm) && 
              a.term === this._selectedTerm
            );

            let subjectMarks = existing?.subjectMarks ? [...existing.subjectMarks] : [];
            const idx = subjectMarks.findIndex(sm => sm.code === subj.code);
            const markObj = {
              code: subj.code,
              name: subj.name,
              maxTheory: subj.maxTheory,
              theory: thVal,
              maxPractical: subj.maxPractical,
              practical: prVal,
              total,
              grade: calculateGrade(total).grade,
              remark: ''
            };

            if (idx >= 0) {
              subjectMarks[idx] = markObj;
            } else {
              subjectMarks.push(markObj);
            }

            const totalScored = subjectMarks.reduce((sum, sm) => sum + (sm.total || 0), 0);
            const totalMax = subjectMarks.length * 100;
            const pct = totalMax > 0 ? Number(((totalScored / totalMax) * 100).toFixed(2)) : 0;
            const overallGrade = calculateGrade(pct).grade;

            const recordData = {
              id: existing ? existing.id : `exam_${studentId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              studentId,
              studentName: name,
              admissionNo: adm,
              grade,
              section: sec,
              term: this._selectedTerm,
              academicYear: TMS_CONFIG.academic.currentYear,
              subjectMarks,
              totalMax,
              totalScored,
              percentage: pct,
              overallGrade,
              attendanceRatio: existing?.attendanceRatio || '95%',
              teacherRemarks: existing?.teacherRemarks || '',
              isPublished: true,
              updatedAt: new Date().toISOString()
            };

            if (existing) {
              promises.push(dbService.update('exam_assessments', existing.id, recordData));
            } else {
              promises.push(dbService.insert('exam_assessments', recordData));
            }
          });

          await Promise.all(promises);
          await auditService.log('BULK_MARKS_ENTRY', 'EXAM', { subject: subj.name, grade: this._selectedGrade, term: this._selectedTerm });
          UIComponents.closeModal();
          UIComponents.showToast(`Marks for ${subj.name} saved successfully across the class!`, 'success');
          this.render(container);
        } catch (err) {
          console.error('Error saving bulk marks:', err);
          UIComponents.showToast('Failed to save bulk marks. Please check connection.', 'error');
          saveBulkBtn.disabled = false;
          saveBulkBtn.innerText = 'Save Class Scores';
        }
      });
    }

    UIComponents.refreshIcons();
  }

  /* ------------------------------------------------------------------ */
  /* Official CBSE/State-Board Cumulative A4 Progress Report Card        */
  /* ------------------------------------------------------------------ */
  static openReportCardModal(student) {
    const esc = (v) => UIComponents.escapeHtml(v);
    const assess = this._assessments.find(a => 
      (a.studentId === student.id || a.admissionNo === student.admissionNo) && 
      a.term === this._selectedTerm
    );

    // Subject data
    const subjectMarks = (assess && assess.subjectMarks && assess.subjectMarks.length) 
      ? assess.subjectMarks 
      : STANDARD_SUBJECTS.map(s => ({
          code: s.code,
          name: s.name,
          maxTheory: s.maxTheory,
          theory: 0,
          maxPractical: s.maxPractical,
          practical: 0,
          total: 0,
          grade: '—',
          remark: 'Pending'
        }));

    const totalScored = assess ? (assess.totalScored || 0) : 0;
    const totalMax = assess ? (assess.totalMax || subjectMarks.length * 100) : (subjectMarks.length * 100);
    const pct = assess ? Math.round(assess.percentage || 0) : 0;
    const gradeObj = calculateGrade(pct);
    const passStatus = pct >= 33 ? 'QUALIFIED / PROMOTED' : 'NEEDS REMEDIAL FOLLOW-UP';
    const emblem = TMS_LOGO.emblemSvg(70);

    const reportHtml = `
      <div id="print-area-report-card" class="official-report-card-container" style="
        background: #ffffff;
        color: #0f172a;
        padding: 32px 36px;
        border: 2px solid #16a34a;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        max-width: 820px;
        margin: 0 auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      ">
        <!-- Official Institutional Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #16a34a; padding-bottom: 14px; margin-bottom: 16px;">
          <div style="flex-shrink: 0;">
            ${emblem}
          </div>
          <div style="text-align: center; flex: 1; padding: 0 16px;">
            <h1 style="font-size: 1.55rem; font-weight: 800; color: #166534; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
              ${esc(TMS_CONFIG.institution.name)}
            </h1>
            <p style="font-size: 0.85rem; font-weight: 700; color: #15803d; margin: 2px 0;">
              ${esc(TMS_CONFIG.institution.subtitle || 'Run by : Thaiba Heritage, Kolkata')}
            </p>
            <p style="font-size: 0.76rem; color: #64748b; margin: 0;">
              ${esc(TMS_CONFIG.institution.address.campus)}, ${esc(TMS_CONFIG.institution.address.city)} • Phone: ${esc(TMS_CONFIG.institution.contact.phone)}
            </p>
            <div style="display: inline-block; background: #f0fdf4; border: 1px solid #86efac; color: #166534; font-size: 0.78rem; font-weight: 700; padding: 2px 14px; border-radius: 12px; margin-top: 6px;">
              CUMULATIVE PROGRESS REPORT CARD • ${esc(this._selectedTerm).toUpperCase()}
            </div>
          </div>
          <div style="width: 70px; text-align: center; font-size: 0.72rem; color: #64748b; border: 1px dashed #cbd5e1; padding: 6px; border-radius: 6px;">
            ${student.photo ? `<img src="${esc(student.photo)}" style="width: 58px; height: 68px; object-fit: cover; border-radius: 4px;">` : `<div style="height: 68px; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #94a3b8;">Affix Photo</div>`}
          </div>
        </div>

        <!-- Student Profile Strip -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 0.84rem;">
          <div><span style="color: #64748b;">Student Name:</span> <strong>${esc(student.fullName)}</strong></div>
          <div><span style="color: #64748b;">Admission No:</span> <strong class="font-mono">${esc(student.admissionNo)}</strong></div>
          <div><span style="color: #64748b;">Roll No:</span> <strong>${esc(student.rollNo || '—')}</strong></div>
          <div><span style="color: #64748b;">Class & Sec:</span> <strong>${esc(student.grade)} ${esc(student.section || 'A')}</strong></div>
          <div><span style="color: #64748b;">Date of Birth:</span> <strong>${esc(student.dob || student.dateOfBirth || '—')}</strong></div>
          <div><span style="color: #64748b;">Academic Year:</span> <strong>${esc(TMS_CONFIG.academic.currentYear)}</strong></div>
          <div><span style="color: #64748b;">Guardian / Father:</span> <strong>${esc(student.parentName || student.guardianName || '—')}</strong></div>
          <div><span style="color: #64748b;">Attendance:</span> <strong style="color: #16a34a;">${esc(assess?.attendanceRatio || '95%')}</strong></div>
          <div><span style="color: #64748b;">Issue Date:</span> <strong>${new Date().toLocaleDateString('en-GB')}</strong></div>
        </div>

        <!-- Scholastic Performance Table -->
        <div style="margin-bottom: 16px;">
          <div style="font-size: 0.88rem; font-weight: 700; color: #1e293b; margin-bottom: 6px; text-transform: uppercase;">
            Part 1: Scholastic Assessment Ledger
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; border: 1px solid #cbd5e1;">
            <thead>
              <tr style="background: #f1f5f9; color: #1e293b; border-bottom: 2px solid #94a3b8;">
                <th style="padding: 6px 10px; text-align: left; border: 1px solid #cbd5e1;">Subjects</th>
                <th style="padding: 6px 10px; text-align: center; border: 1px solid #cbd5e1; width: 65px;">Max Th</th>
                <th style="padding: 6px 10px; text-align: center; border: 1px solid #cbd5e1; width: 65px;">Theory</th>
                <th style="padding: 6px 10px; text-align: center; border: 1px solid #cbd5e1; width: 65px;">Max Pr</th>
                <th style="padding: 6px 10px; text-align: center; border: 1px solid #cbd5e1; width: 65px;">Pr/Int</th>
                <th style="padding: 6px 10px; text-align: center; border: 1px solid #cbd5e1; width: 75px;">Total (100)</th>
                <th style="padding: 6px 10px; text-align: center; border: 1px solid #cbd5e1; width: 60px;">Grade</th>
                <th style="padding: 6px 10px; text-align: left; border: 1px solid #cbd5e1;">Teacher's Remark</th>
              </tr>
            </thead>
            <tbody>
              ${subjectMarks.map(sm => {
                const subjTot = (sm.theory || 0) + (sm.practical || 0);
                const g = calculateGrade(subjTot);
                return `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 600;">${esc(sm.name)}</td>
                    <td style="padding: 6px 10px; text-align: center; border: 1px solid #cbd5e1; color: #64748b;">${sm.maxTheory || 80}</td>
                    <td style="padding: 6px 10px; text-align: center; border: 1px solid #cbd5e1; font-weight: 600;">${sm.theory ?? '—'}</td>
                    <td style="padding: 6px 10px; text-align: center; border: 1px solid #cbd5e1; color: #64748b;">${sm.maxPractical || 20}</td>
                    <td style="padding: 6px 10px; text-align: center; border: 1px solid #cbd5e1; font-weight: 600;">${sm.practical ?? '—'}</td>
                    <td style="padding: 6px 10px; text-align: center; border: 1px solid #cbd5e1; font-weight: 700; color: #0f172a;">${subjTot}</td>
                    <td style="padding: 6px 10px; text-align: center; border: 1px solid #cbd5e1; font-weight: 700; color: ${subjTot >= 75 ? '#16a34a' : subjTot >= 50 ? '#2563eb' : '#d97706'};">${g.grade}</td>
                    <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-size: 0.78rem; color: #475569;">${esc(sm.remark || g.remark)}</td>
                  </tr>
                `;
              }).join('')}
              <tr style="background: #f8fafc; font-weight: 700; border-top: 2px solid #94a3b8;">
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">Grand Cumulative Aggregate</td>
                <td colspan="4" style="padding: 8px 10px; text-align: right; border: 1px solid #cbd5e1; color: #64748b;">Max Total: ${totalMax}</td>
                <td style="padding: 8px 10px; text-align: center; border: 1px solid #cbd5e1; font-size: 0.95rem; color: #166534;">${totalScored}</td>
                <td style="padding: 8px 10px; text-align: center; border: 1px solid #cbd5e1; font-size: 0.95rem; color: #166534;">${gradeObj.grade}</td>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 0.88rem; color: #166534;">Score: ${pct}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Co-Scholastic & Personal Traits -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; font-size: 0.78rem;">
          <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; background: #fafafa;">
            <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px; text-transform: uppercase;">Part 2: Co-Scholastic Activities</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;"><span>Work Education & IT Skills:</span> <strong>Grade A</strong></div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;"><span>Art & Cultural Education:</span> <strong>Grade A</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Health & Physical Education / Sports:</span> <strong>Grade A</strong></div>
          </div>
          <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; background: #fafafa;">
            <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px; text-transform: uppercase;">Part 3: Discipline & Moral Conduct</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;"><span>Punctuality & Discipline:</span> <strong>Grade A</strong></div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;"><span>Islamic Values & Etiquette:</span> <strong>Exemplary</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Social & Environmental Attitude:</span> <strong>Grade A</strong></div>
          </div>
        </div>

        <!-- Teacher Remarks & Result Banner -->
        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 10px 14px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="font-size: 0.78rem; font-weight: 700; color: #166534; text-transform: uppercase;">Class Teacher's Observations:</div>
            <div style="font-size: 0.84rem; color: #14532d; font-style: italic; margin-top: 2px;">
              "${esc(assess?.teacherRemarks || 'Consistent academic performance, keen learner and well behaved in all campus activities.')}"
            </div>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 0.72rem; color: #166534; text-transform: uppercase; display: block; font-weight: 700;">Result Status:</span>
            <span style="font-size: 0.95rem; font-weight: 800; color: ${pct >= 33 ? '#166534' : '#b91c1c'};">${passStatus}</span>
          </div>
        </div>

        <!-- Grading Legend Scale -->
        <div style="font-size: 0.7rem; color: #64748b; margin-bottom: 32px; border-top: 1px dashed #cbd5e1; padding-top: 6px;">
          <strong>Grading Scale:</strong> A1 (91-100% • Outstanding) | A2 (81-90% • Excellent) | B1 (71-80% • Very Good) | B2 (61-70% • Good) | C1 (51-60% • Satisfactory) | C2 (41-50% • Average) | D (33-40% • Pass) | E (Below 33% • Needs Remedial)
        </div>

        <!-- Signatures & Authority Seals -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 12px; font-size: 0.8rem; text-align: center;">
          <div style="width: 160px;">
            <div style="border-bottom: 1.5px solid #0f172a; margin-bottom: 4px; padding-bottom: 20px;"></div>
            <strong>Class Teacher</strong>
          </div>
          <div style="width: 160px;">
            <div style="border-bottom: 1.5px solid #0f172a; margin-bottom: 4px; padding-bottom: 20px;"></div>
            <strong>Academic Coordinator</strong>
          </div>
          <div style="width: 170px;">
            <div style="border: 2px dashed #16a34a; border-radius: 50%; width: 56px; height: 56px; margin: 0 auto 6px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; color: #166534; text-transform: uppercase; text-align: center; line-height: 1.1;">
              OFFICIAL<br>TMS SEAL
            </div>
            <strong>Principal / Headmaster</strong>
          </div>
        </div>
      </div>
    `;

    const printStyles = `
      <style>
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area-report-card, #print-area-report-card * {
            visibility: visible;
          }
          #print-area-report-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            padding: 15mm !important;
            border: 2px solid #16a34a !important;
            box-shadow: none !important;
            page-break-after: avoid !important;
          }
          .tms-modal-overlay, .tms-modal, .tms-modal-content {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          .tms-modal-header, .tms-modal-footer, #app-sidebar, header {
            display: none !important;
          }
        }
      </style>
    `;

    UIComponents.openModal({
      title: `CBSE Cumulative Progress Report — ${student.fullName}`,
      bodyHtml: printStyles + reportHtml,
      footerHtml: `
        <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Close</button>
        <button class="btn btn-primary" onclick="window.print()"><i data-lucide="printer"></i> Print Official Report Card (A4)</button>
      `
    });

    UIComponents.refreshIcons();
  }

  /* ------------------------------------------------------------------ */
  /* Official Academic Intervention & Remediation Plan (A4 Printable)   */
  /* ------------------------------------------------------------------ */
  static openRemedialPlanModal(studentName, admNo, grade, pct, reasons) {
    const esc = (v) => UIComponents.escapeHtml(v);
    const emblem = TMS_LOGO.emblemSvg(50);
    const dateStr = new Date().toLocaleDateString('en-GB');

    const printStyles = `
      <style>
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body * { visibility: hidden; }
          #remedial-plan-print, #remedial-plan-print * { visibility: visible; }
          #remedial-plan-print { position: fixed; left: 0; top: 0; width: 100%; border: none !important; }
        }
      </style>
    `;

    const planHtml = `
      <div id="remedial-plan-print" style="background: #ffffff; color: #0f172a; padding: 24px; border: 2px solid #064e3b; border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: center; margin-bottom: 6px;">${emblem}</div>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #166534; text-transform: uppercase; margin: 0;">${esc(TMS_CONFIG.institution.name)}</h2>
          <div style="font-size: 0.8rem; font-weight: 600; color: #15803d;">Run by : Thaiba Heritage, Kolkata • Academic Session: ${TMS_CONFIG.academic.currentYear}</div>
          <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">DEPARTMENT OF ACADEMIC MONITORING &amp; REMEDIAL EDUCATION</div>
          <div style="display: inline-block; margin-top: 8px; background: #fef2f2; border: 1.5px solid #ef4444; color: #991b1b; padding: 4px 14px; border-radius: 6px; font-weight: 800; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em;">
            Individualized Academic Intervention &amp; Remedial Roadmap
          </div>
        </div>

        <!-- Student Meta -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 6px; font-size: 0.82rem; margin-bottom: 16px;">
          <div><span style="color: #64748b;">Student:</span><br><strong>${esc(studentName)}</strong></div>
          <div><span style="color: #64748b;">Admission No:</span><br><span class="font-mono" style="font-weight: 700;">${esc(admNo || '—')}</span></div>
          <div><span style="color: #64748b;">Grade / Class:</span><br><strong>Class ${esc(grade || '—')}</strong></div>
          <div><span style="color: #64748b;">Current Aggregate:</span><br><strong style="color: #dc2626;">${esc(pct)}%</strong></div>
        </div>

        <!-- Diagnostic Summary -->
        <div style="margin-bottom: 16px; border: 1px solid #fee2e2; background: #fff5f5; border-radius: 6px; padding: 12px;">
          <h4 style="font-size: 0.88rem; color: #991b1b; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            Identified Academic Weaknesses &amp; Focus Areas:
          </h4>
          <p style="font-size: 0.8rem; color: #7f1d1d; margin: 0; line-height: 1.4;">
            ${esc(reasons || 'Aggregate academic performance has fallen below institutional benchmark.')}
          </p>
        </div>

        <!-- Corrective Action Measures -->
        <div style="margin-bottom: 20px;">
          <h4 style="font-size: 0.88rem; color: #166534; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
            Target Remedial Measures &amp; Action Plan:
          </h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.78rem; border: 1px solid #cbd5e1;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left;">
                <th style="padding: 6px 10px; border: 1px solid #cbd5e1;">Intervention Action</th>
                <th style="padding: 6px 10px; border: 1px solid #cbd5e1;">Frequency</th>
                <th style="padding: 6px 10px; border: 1px solid #cbd5e1;">Assigned Faculty Mentor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">After-School Remedial Practice &amp; Concept Re-teaching</td>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Mon, Wed, Fri (3:30 PM - 4:30 PM)</td>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Subject Specialist</td>
              </tr>
              <tr>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Weekly Progress Diagnostic Worksheets &amp; Feedback</td>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Every Saturday Morning</td>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Class Teacher</td>
              </tr>
              <tr>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Structured Textbook Problem Sets &amp; Guided Exercises</td>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Daily Home Study (45 mins)</td>
                <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Parent / Guardian Supervised</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Signatures & Commitments -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 30px; text-align: center; font-size: 0.75rem;">
          <div>
            <div style="border-bottom: 1.5px solid #0f172a; margin-bottom: 4px; padding-bottom: 24px;"></div>
            <strong>Class Teacher</strong>
          </div>
          <div>
            <div style="border-bottom: 1.5px solid #0f172a; margin-bottom: 4px; padding-bottom: 24px;"></div>
            <strong>Academic Coordinator</strong>
          </div>
          <div>
            <div style="border-bottom: 1.5px solid #0f172a; margin-bottom: 4px; padding-bottom: 24px;"></div>
            <strong>Parent / Guardian Acknowledgment</strong>
          </div>
        </div>

        <div style="text-align: center; font-size: 0.68rem; color: #94a3b8; margin-top: 20px; border-top: 1px dashed #cbd5e1; padding-top: 6px;">
          Generated on ${dateStr} • Thaiba Model School Academic ERP Diagnostic System
        </div>
      </div>
    `;

    UIComponents.openModal({
      title: `Academic Intervention Plan — ${studentName}`,
      bodyHtml: printStyles + planHtml,
      footerHtml: `
        <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Close</button>
        <button class="btn btn-primary" onclick="window.print()"><i data-lucide="printer"></i> Print Official Remedial Plan (A4)</button>
      `
    });

    UIComponents.refreshIcons();
  }
}

export default ExaminationModule;
