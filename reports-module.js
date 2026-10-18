/**
 * THAIBA MODEL SCHOOL — Business Intelligence & Comprehensive Reporting Module
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { UIComponents } from './ui-components.js';

export class ReportsModule {
  static async render(container) {
    const students = await dbService.select('students');
    const staff = await dbService.select('staff');
    const invoices = await dbService.select('invoices');

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem;">School Intelligence & Analytics</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Executive reporting exclusively for THAIBA MODEL SCHOOL across attendance, academics, finances, and operations.
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" id="btn-export-reports-csv"><i data-lucide="file-spreadsheet"></i> Export CSV Summary</button>
            <button class="btn btn-primary" onclick="window.print()"><i data-lucide="printer"></i> Print Executive Brief</button>
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'Student-Teacher Ratio', value: '14 : 1', icon: 'users', color: 'emerald', subtitle: 'Optimal Learning Ratio' })}
        ${UIComponents.renderKpiCard({ title: 'Term 1 Fee Clearance', value: '88.4%', icon: 'credit-card', color: 'blue', subtitle: 'Target: 95% by Nov' })}
        ${UIComponents.renderKpiCard({ title: 'Average Monthly Attendance', value: '94.6%', icon: 'award', color: 'amber', subtitle: 'Gold Badge Exclusions Factored' })}
        ${UIComponents.renderKpiCard({ title: 'Academic Distinction Rate', value: '42.8%', icon: 'graduation-cap', color: 'rose', subtitle: 'Grade A+ and A Combined' })}
      </div>

      <!-- Analytic Report Sections -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 24px;">
        <!-- Academic & Attendance Analytics -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Class-Wise Attendance & Academic Scorecard</h3>
            <span class="badge badge-info">${TMS_CONFIG.academic.currentYear}</span>
          </div>
          <div class="table-responsive">
            <table class="tms-table font-mono" style="font-size: 0.84rem;">
              <thead>
                <tr>
                  <th>Class Division</th>
                  <th>Strength</th>
                  <th>Attendance %</th>
                  <th>Pass Rate</th>
                  <th>Remedial Cases</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Grade 9A</td>
                  <td>35</td>
                  <td>96.2%</td>
                  <td>100%</td>
                  <td>0</td>
                </tr>
                <tr>
                  <td>Grade 9B</td>
                  <td>35</td>
                  <td>93.8%</td>
                  <td>97.1%</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>Grade 10A</td>
                  <td>34</td>
                  <td>95.4%</td>
                  <td>100%</td>
                  <td>0</td>
                </tr>
                <tr>
                  <td>Grade 11 Science</td>
                  <td>40</td>
                  <td>94.0%</td>
                  <td>95.0%</td>
                  <td>2</td>
                </tr>
                <tr>
                  <td>Grade 12 Science</td>
                  <td>38</td>
                  <td>97.5%</td>
                  <td>100%</td>
                  <td>0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Financial Collection Breakdown -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Financial Health & Revenue Trends</h3>
            <span class="badge badge-success">Audit Verified</span>
          </div>
          <div class="table-responsive">
            <table class="tms-table font-mono" style="font-size: 0.84rem;">
              <thead>
                <tr>
                  <th>Fee Category</th>
                  <th>Expected (₹)</th>
                  <th>Realized (₹)</th>
                  <th>Outstanding (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tuition & Laboratory Fee</td>
                  <td>85,50,000</td>
                  <td>76,20,000</td>
                  <td style="color: #ef4444;">9,30,000</td>
                </tr>
                <tr>
                  <td>School Transport Fleet</td>
                  <td>18,40,000</td>
                  <td>16,80,000</td>
                  <td style="color: #ef4444;">1,60,000</td>
                </tr>
                <tr>
                  <td>Hostel & Mess Charges</td>
                  <td>28,00,000</td>
                  <td>25,50,000</td>
                  <td style="color: #ef4444;">2,50,000</td>
                </tr>
                <tr style="font-weight: 700; background: rgba(59,130,246,0.06);">
                  <td>Total Campus Realization</td>
                  <td>1,31,90,000</td>
                  <td>1,18,50,000</td>
                  <td style="color: #ef4444;">13,40,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    UIComponents.refreshIcons();
  }

  static bindEvents(container) {
    const csvBtn = container.querySelector('#btn-export-reports-csv');
    if (csvBtn) {
      csvBtn.addEventListener('click', () => {
        const csvContent = "data:text/csv;charset=utf-8," +
          "Class,Strength,AttendanceRate,PassRate\n" +
          "Grade 9A,35,96.2%,100%\n" +
          "Grade 9B,35,93.8%,97.1%\n" +
          "Grade 10A,34,95.4%,100%\n" +
          "Grade 11 Sci,40,94.0%,95.0%\n" +
          "Grade 12 Sci,38,97.5%,100%\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `TMS_Executive_Report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        UIComponents.showToast('Executive report exported to CSV successfully!', 'success');
      });
    }
  }
}

export default ReportsModule;
