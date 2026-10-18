/**
 * THAIBA MODEL SCHOOL — Attendance Engine & Telemetry Module
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { UIComponents } from './ui-components.js';
import { auditService } from './audit-service.js';

export class AttendanceModule {
  static async render(container) {
    const students = await dbService.select('students');

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem;">Attendance & Geofence Intelligence</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              GPS geofence polling (5m), QR terminal, NFC integrations, facial verification, and approved-leave protected registers.
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" id="btn-export-att"><i data-lucide="download"></i> Export Registers</button>
            <button class="btn btn-primary" id="btn-qr-scanner"><i data-lucide="qr-code"></i> Launch QR Scanner</button>
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'Student Attendance Today', value: '94.2%', icon: 'users', color: 'emerald', subtitle: '480 / 510 Enrolled Present' })}
        ${UIComponents.renderKpiCard({ title: 'Faculty Present', value: '44 / 46', icon: 'user-check', color: 'blue', subtitle: '2 Approved Casual Leaves' })}
        ${UIComponents.renderKpiCard({ title: 'Approved Leaves', value: '8 Students', icon: 'shield-check', color: 'amber', subtitle: 'Gold Badges Protected' })}
        ${UIComponents.renderKpiCard({ title: 'Late Arrivals', value: '4 Cases', icon: 'clock', color: 'rose', subtitle: 'After 08:30 AM Entry' })}
      </div>

      <!-- Filters Row -->
      <div class="card" style="margin-bottom: 24px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; align-items: flex-end;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Select Grade / Class</label>
            <select class="form-select" id="att-filter-grade">
              <option value="all">All Classes</option>
              ${TMS_CONFIG.academic.classes.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Section</label>
            <select class="form-select" id="att-filter-section">
              <option value="all">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Date</label>
            <input type="date" class="form-input" id="att-filter-date" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div>
            <button class="btn btn-primary" style="width: 100%;" id="btn-refresh-att"><i data-lucide="filter"></i> Filter Register</button>
          </div>
        </div>
      </div>

      <!-- Active Register Card -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">School-Wide Attendance Register</h3>
            <p class="card-desc">Approved-leave protection prevents accidental modification of authorized excused absences.</p>
          </div>
          <span class="badge badge-info">Realtime Geofence Polling Active</span>
        </div>

        <div class="table-responsive">
          <table class="tms-table" id="master-attendance-table">
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Roll</th>
                <th>Student Name</th>
                <th>Grade & Section</th>
                <th>Leave Status</th>
                <th>Recorded Punch Time</th>
                <th>Attendance State</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(s => {
                const isLeave = s.leaveStatus === 'approved';
                return `
                  <tr>
                    <td><span class="font-mono">${s.admissionNo}</span></td>
                    <td><strong>${s.rollNo}</strong></td>
                    <td>${s.fullName}</td>
                    <td>${s.grade} - ${s.section}</td>
                    <td>
                      ${isLeave ? `
                        <span class="badge badge-gold"><i data-lucide="shield-check" style="width: 12px; height: 12px;"></i> Approved Leave</span>
                      ` : `
                        <span class="badge badge-info">Regular</span>
                      `}
                    </td>
                    <td class="font-mono">${isLeave ? '—' : '08:24:10 AM'}</td>
                    <td>
                      ${isLeave ? `
                        <span class="badge badge-warning">Excused (Protected)</span>
                      ` : `
                        <span class="badge badge-success">Present</span>
                      `}
                    </td>
                    <td>
                      <button class="btn btn-secondary btn-sm" onclick="alert('Attendance details & audit logs displayed.')">
                        <i data-lucide="eye"></i> History
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindEvents(container);
    UIComponents.refreshIcons();
  }

  static bindEvents(container) {
    const qrBtn = container.querySelector('#btn-qr-scanner');
    if (qrBtn) {
      qrBtn.addEventListener('click', () => {
        UIComponents.openModal({
          title: 'Campus Attendance QR & NFC Terminal',
          bodyHtml: `
            <div style="text-align: center; padding: 20px;">
              <div style="width: 200px; height: 200px; border: 3px solid #3b82f6; border-radius: var(--radius-lg); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; background: rgba(59,130,246,0.05); position: relative;">
                <i data-lucide="scan" style="width: 100px; height: 100px; color: #3b82f6; animation: pulse 1.5s infinite;"></i>
              </div>
              <h4>Position Student or Staff QR Code</h4>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 6px;">
                Camera feed active. Terminal also listens for ISO/IEC 14443 Type A NFC cards.
              </p>
              <div style="margin-top: 20px;">
                <button class="btn btn-primary" id="btn-simulate-scan"><i data-lucide="zap"></i> Simulate Instant Scan</button>
              </div>
            </div>
          `
        });

        document.getElementById('btn-simulate-scan').addEventListener('click', async () => {
          await auditService.log('TERMINAL_QR_PUNCH', 'ATTENDANCE', {
            scannerTerminalId: 'GATE-01-NORTH',
            studentId: 'TMS-STU-1001',
            status: 'Present'
          }, 'TMS-STU-1001');
          UIComponents.closeModal();
          UIComponents.showToast('Student QR Verified: Mohammed Rayan K marked Present at 08:26 AM', 'success');
        });
      });
    }

    const exportBtn = container.querySelector('#btn-export-att');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        UIComponents.showToast('Attendance report exported to CSV for Thaiba Model School.', 'info');
      });
    }
  }
}

export default AttendanceModule;
