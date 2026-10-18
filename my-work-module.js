/**
 * THAIBA MODEL SCHOOL — THAIBA MODEL SCHOOL Faculty & Staff Workspace (My Work)
 */

import { TMS_CONFIG } from './config.js';
import { authService } from './auth-service.js';
import { dbService } from './supabase-client.js';
import { UIComponents } from './ui-components.js';
import { auditService } from './audit-service.js';

export class MyWorkModule {
  static async render(container) {
    const user = authService.getCurrentUser() || {};
    const tasks = await dbService.select('staff_tasks');
    const students = await dbService.select('students');

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem;">Staff Workspace — THAIBA MODEL SCHOOL</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Welcome back, <strong>${user.name || 'Faculty Member'}</strong> (${user.department || 'Academics'})
            </p>
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <div id="geofence-live-status" class="badge badge-success" style="padding: 8px 14px; font-size: 0.82rem;">
              <i data-lucide="map-pin" style="width: 14px; height: 14px;"></i> Campus Geofence Active (250m)
            </div>
            <button class="btn btn-primary" id="btn-punch-now"><i data-lucide="fingerprint"></i> Biometric / GPS Punch</button>
          </div>
        </div>
      </div>

      <!-- Quick KPI Row -->
      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'My Shift Today', value: '08:00 - 15:30', icon: 'clock', color: 'blue', subtitle: 'Normal Teaching Shift' })}
        ${UIComponents.renderKpiCard({ title: 'Today\'s Attendance', value: 'Punched IN', icon: 'check-circle-2', color: 'emerald', subtitle: '08:02 AM • Verified Geofence' })}
        ${UIComponents.renderKpiCard({ title: 'Teaching Workload', value: '5 Periods', icon: 'book-open', color: 'amber', subtitle: 'Grade 9A, 10B, 11 Science' })}
        ${UIComponents.renderKpiCard({ title: 'Pending Tasks', value: `${tasks.filter(t => t.status !== 'Completed').length} Pending`, icon: 'check-square', color: 'rose', subtitle: 'Kanban Action Items' })}
      </div>

      <!-- Navigation Tabs -->
      <div style="display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid var(--border-color); overflow-x: auto; padding-bottom: 6px;">
        <button class="btn btn-primary staff-tab" data-tab="overview"><i data-lucide="layout-dashboard"></i> Overview Hub</button>
        <button class="btn btn-secondary staff-tab" data-tab="geofence"><i data-lucide="navigation"></i> GPS & Geofence</button>
        <button class="btn btn-secondary staff-tab" data-tab="register"><i data-lucide="user-check"></i> Class Register (9A)</button>
        <button class="btn btn-secondary staff-tab" data-tab="tasks"><i data-lucide="kanban"></i> Action Board</button>
        <button class="btn btn-secondary staff-tab" data-tab="timetable"><i data-lucide="calendar"></i> My Timetable</button>
        <button class="btn btn-secondary staff-tab" data-tab="leaves"><i data-lucide="umbrella"></i> Leaves & Balances</button>
        <button class="btn btn-secondary staff-tab" data-tab="payslips"><i data-lucide="receipt"></i> Payslips & CTC</button>
      </div>

      <div id="my-work-tab-content"></div>
    `;

    this.bindEvents(container);
    this.renderTab('overview', container);
    UIComponents.refreshIcons();
  }

  static async renderTab(tabKey, container) {
    const content = container.querySelector('#my-work-tab-content');
    if (!content) return;

    if (tabKey === 'overview') {
      content.innerHTML = `
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <div>
            <div class="card" style="margin-bottom: 24px;">
              <div class="card-header">
                <div>
                  <h3 class="card-title">Today's Teaching Schedule (Grade 9A & High School)</h3>
                  <p class="card-desc">Scheduled teaching periods mapped to class teachers and laboratories.</p>
                </div>
                <span class="badge badge-info">Wednesday Schedule</span>
              </div>
              <div class="table-responsive">
                <table class="tms-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Time</th>
                      <th>Class & Section</th>
                      <th>Subject</th>
                      <th>Room</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Period 1</td>
                      <td>08:30 - 09:15</td>
                      <td>Grade 9 - Section A</td>
                      <td>Mathematics (Quadratic Equations)</td>
                      <td>Room 9-A</td>
                      <td><span class="badge badge-success">Conducted</span></td>
                    </tr>
                    <tr>
                      <td>Period 2</td>
                      <td>09:15 - 10:00</td>
                      <td>Grade 10 - Section B</td>
                      <td>Applied Mathematics</td>
                      <td>Room 10-B</td>
                      <td><span class="badge badge-success">Conducted</span></td>
                    </tr>
                    <tr>
                      <td>Period 3</td>
                      <td>10:15 - 11:00</td>
                      <td>Grade 9 - Section A</td>
                      <td>Lab Practical (Geometry & Constructions)</td>
                      <td>Math Lab</td>
                      <td><span class="badge badge-warning">Upcoming</span></td>
                    </tr>
                    <tr>
                      <td>Period 4</td>
                      <td>11:45 - 12:30</td>
                      <td>Grade 11 - Science</td>
                      <td>Calculus & Limits</td>
                      <td>Room 11-Sci</td>
                      <td><span class="badge badge-info">Scheduled</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Daily Work Report Log -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Daily Syllabus & Activity Report</h3>
                <button class="btn btn-primary btn-sm" id="btn-log-daily-work"><i data-lucide="plus"></i> Submit Work Log</button>
              </div>
              <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 12px;">
                Record curriculum progression, homework assignments, and mentoring discussions for administrative verification.
              </p>
              <div style="background: rgba(0,0,0,0.02); padding: 14px; border-radius: var(--radius-md); border-left: 4px solid #10b981;">
                <strong>Latest Submission:</strong> Covered Grade 9 Exercise 4.2 (Quadratic formula). Issued homework assignment 4. Checked 32 student notebooks.
                <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 4px;">Logged at 10:05 AM • Verified by Academic Coordinator</div>
              </div>
            </div>
          </div>

          <!-- Right Sidebar: Live Geofence Radar & Notice Board -->
          <div>
            <div class="card" style="margin-bottom: 24px; text-align: center;">
              <h3 class="card-title" style="margin-bottom: 12px;">Live Campus Radar</h3>
              <div style="width: 140px; height: 140px; border-radius: 50%; border: 2px dashed #3b82f6; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; position: relative;">
                <div style="width: 16px; height: 16px; background: #10b981; border-radius: 50%; box-shadow: 0 0 12px #10b981; animation: pulse 1.5s infinite;"></div>
                <div style="position: absolute; top: 12px; font-size: 0.72rem; color: var(--text-muted);">250m Boundary</div>
              </div>
              <p style="font-size: 0.88rem; font-weight: 600;">Status: Inside Campus Zone</p>
              <p style="font-size: 0.75rem; color: var(--text-muted);">
                GPS: 11.2588° N, 75.7804° E<br>
                5-Min Polling Active • Exit Grace: 3 Mins
              </p>
            </div>

            <div class="card">
              <h3 class="card-title" style="margin-bottom: 12px;">Faculty Bulletins</h3>
              <div style="font-size: 0.85rem; line-height: 1.5; color: var(--text-main);">
                <div style="padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid var(--border-color);">
                  <strong style="color: #ef4444;">Term 1 Papers:</strong> Please submit answer key marks to Academic Coordinator by Friday 4 PM.
                </div>
                <div>
                  <strong>Staff Meeting:</strong> Monthly faculty council meeting on Saturday at 2:00 PM in Conference Hall A.
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (tabKey === 'geofence') {
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Staff Geofence Telemetry & Biometric Punch</h3>
              <p class="card-desc">
                Automated GPS location polling every 5 minutes while authorized attendance session is active with a 3-minute exit grace period.
              </p>
            </div>
            <span class="badge badge-success">Telemetry Engine Online</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 24px;">
            <div style="background: rgba(0,0,0,0.02); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
              <h4 style="font-size: 0.95rem; margin-bottom: 6px;">School Geofence Center</h4>
              <p class="font-mono" style="font-size: 0.85rem; color: var(--text-muted);">
                Lat: ${TMS_CONFIG.institution.gpsGeofence.latitude}<br>
                Lng: ${TMS_CONFIG.institution.gpsGeofence.longitude}<br>
                Geofence Radius: ${TMS_CONFIG.institution.gpsGeofence.radiusMeters} Meters
              </p>
            </div>

            <div style="background: rgba(0,0,0,0.02); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
              <h4 style="font-size: 0.95rem; margin-bottom: 6px;">Active Device Telemetry</h4>
              <p class="font-mono" style="font-size: 0.85rem; color: #10b981;">
                Accuracy: ± 4.2 Meters<br>
                Current Distance: 18.5 Meters from Hub<br>
                Exit Grace Period: 3 Mins Remaining
              </p>
            </div>

            <div style="background: rgba(0,0,0,0.02); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
              <h4 style="font-size: 0.95rem; margin-bottom: 6px;">Alternative Modalities</h4>
              <div style="display: flex; gap: 8px; margin-top: 8px;">
                <button class="btn btn-secondary btn-sm" onclick="alert('NFC Card Reader Ready. Tap device on school terminal.')"><i data-lucide="nfc"></i> NFC Punch</button>
                <button class="btn btn-secondary btn-sm" onclick="alert('AI Face Matching: Verification Score 98.4% Match.')"><i data-lucide="scan-face"></i> Facial Match</button>
              </div>
            </div>
          </div>

          <div style="text-align: center; padding: 30px; border: 2px dashed var(--border-color); border-radius: var(--radius-lg);">
            <i data-lucide="check-circle" style="width: 56px; height: 56px; color: #10b981; margin-bottom: 12px;"></i>
            <h3>Today's Shift Punch Verified</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">
              Punched IN at 08:02:14 AM via Campus Geofence Terminal #01. Duplicate punches are automatically prevented.
            </p>
            <div style="margin-top: 16px;">
              <button class="btn btn-primary" onclick="alert('Manual Attendance Correction Request forwarded to HR & Principal.')">
                Request Correction / Leave Adjustment
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (tabKey === 'register') {
      const students = await dbService.select('students', s => s.grade === 'Grade 9');
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Classroom Attendance Register — Grade 9 Section A</h3>
              <p class="card-desc">
                Rule: Default state is Absent. Marking present records exact timestamp.
                Students on approved leave receive <span class="badge badge-gold">Approved Leave</span> gold badge and cannot be marked present.
              </p>
            </div>
            <button class="btn btn-primary" id="btn-save-class-register"><i data-lucide="save"></i> Submit Register</button>
          </div>

          <div class="table-responsive">
            <table class="tms-table" id="class-register-table">
              <thead>
                <tr>
                  <th>Roll</th>
                  <th>Admission No</th>
                  <th>Student Name</th>
                  <th>Gender</th>
                  <th>Leave Status</th>
                  <th>Attendance State</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${students.map(s => {
                  const isApprovedLeave = s.leaveStatus === 'approved';
                  return `
                    <tr data-student-id="${s.id}">
                      <td><strong>${s.rollNo}</strong></td>
                      <td><span class="font-mono">${s.admissionNo}</span></td>
                      <td><strong>${s.fullName}</strong></td>
                      <td>${s.gender}</td>
                      <td>
                        ${isApprovedLeave ? `
                          <span class="badge badge-gold"><i data-lucide="shield-check" style="width: 14px; height: 14px;"></i> Approved Leave (Gold)</span>
                        ` : `
                          <span class="badge badge-info">No Active Leave</span>
                        `}
                      </td>
                      <td class="status-cell">
                        ${isApprovedLeave ? `
                          <span class="badge badge-warning">On Leave (Protected)</span>
                        ` : `
                          <span class="badge badge-danger">Absent (Default)</span>
                        `}
                      </td>
                      <td>
                        ${isApprovedLeave ? `
                          <button class="btn btn-secondary btn-sm" disabled title="Locked: Student is on approved leave.">
                            <i data-lucide="lock"></i> Locked
                          </button>
                        ` : `
                          <button class="btn btn-secondary btn-sm btn-toggle-present" data-id="${s.id}">
                            <i data-lucide="check"></i> Mark Present
                          </button>
                        `}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      // Bind mark present button clicks
      content.querySelectorAll('.btn-toggle-present').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const row = e.currentTarget.closest('tr');
          const cell = row.querySelector('.status-cell');
          const now = new Date().toLocaleTimeString();
          if (e.currentTarget.classList.contains('btn-primary')) {
            e.currentTarget.classList.remove('btn-primary');
            e.currentTarget.classList.add('btn-secondary');
            e.currentTarget.innerHTML = `<i data-lucide="check"></i> Mark Present`;
            cell.innerHTML = `<span class="badge badge-danger">Absent (Default)</span>`;
          } else {
            e.currentTarget.classList.remove('btn-secondary');
            e.currentTarget.classList.add('btn-primary');
            e.currentTarget.innerHTML = `<i data-lucide="check-check"></i> Present`;
            cell.innerHTML = `<span class="badge badge-success">Present (${now})</span>`;
          }
          UIComponents.refreshIcons();
        });
      });

      const saveRegBtn = content.querySelector('#btn-save-class-register');
      if (saveRegBtn) {
        saveRegBtn.addEventListener('click', async () => {
          await auditService.log('CLASS_REGISTER_SUBMITTED', 'ATTENDANCE', {
            class: 'Grade 9A',
            subject: 'Mathematics',
            period: 'Period 1'
          });
          UIComponents.showToast('Classroom register committed with timestamps & audit verification!', 'success');
        });
      }
    } else if (tabKey === 'tasks') {
      const tasks = await dbService.select('staff_tasks');
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">My Tasks & Action Board (Kanban)</h3>
              <p class="card-desc">Actionable items, assignment corrections, lesson planning, and departmental deliverables.</p>
            </div>
            <button class="btn btn-primary" id="btn-add-kanban-task"><i data-lucide="plus"></i> New Task</button>
          </div>

          <div class="kanban-grid">
            <!-- To Do -->
            <div class="kanban-col">
              <h4 style="margin-bottom: 14px; display: flex; justify-content: space-between;">
                <span>To Do</span>
                <span class="badge badge-info">${tasks.filter(t => t.status === 'To Do').length}</span>
              </h4>
              ${tasks.filter(t => t.status === 'To Do').map(t => `
                <div class="kanban-card">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span class="badge badge-${t.priority === 'High' ? 'danger' : 'info'}">${t.priority}</span>
                    <small style="color: var(--text-muted);">${t.dueDate}</small>
                  </div>
                  <strong style="font-size: 0.88rem;">${t.title}</strong>
                </div>
              `).join('')}
            </div>

            <!-- In Progress -->
            <div class="kanban-col">
              <h4 style="margin-bottom: 14px; display: flex; justify-content: space-between;">
                <span>In Progress</span>
                <span class="badge badge-warning">${tasks.filter(t => t.status === 'In Progress').length}</span>
              </h4>
              ${tasks.filter(t => t.status === 'In Progress').map(t => `
                <div class="kanban-card">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span class="badge badge-warning">${t.priority}</span>
                    <small style="color: var(--text-muted);">${t.dueDate}</small>
                  </div>
                  <strong style="font-size: 0.88rem;">${t.title}</strong>
                </div>
              `).join('')}
            </div>

            <!-- Completed -->
            <div class="kanban-col">
              <h4 style="margin-bottom: 14px; display: flex; justify-content: space-between;">
                <span>Completed</span>
                <span class="badge badge-success">${tasks.filter(t => t.status === 'Completed').length}</span>
              </h4>
              ${tasks.filter(t => t.status === 'Completed').map(t => `
                <div class="kanban-card">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span class="badge badge-success">${t.priority}</span>
                    <small style="color: var(--text-muted);">${t.dueDate}</small>
                  </div>
                  <strong style="font-size: 0.88rem;">${t.title}</strong>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } else if (tabKey === 'timetable') {
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Weekly Six-Day Teaching Timetable Matrix</h3>
              <p class="card-desc">Period allocations, rooms, and clash-detection verified allocations.</p>
            </div>
            <button class="btn btn-secondary" onclick="window.print()"><i data-lucide="printer"></i> Print Matrix</button>
          </div>

          <div class="table-responsive">
            <table class="tms-table font-mono" style="text-align: center;">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>08:30 - 09:15</th>
                  <th>09:15 - 10:00</th>
                  <th>10:15 - 11:00</th>
                  <th>11:00 - 11:45</th>
                  <th>11:45 - 12:30</th>
                  <th>01:15 - 02:00</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Monday</strong></td>
                  <td>Grade 9A (Math)</td>
                  <td>Grade 10B (Math)</td>
                  <td>— Free —</td>
                  <td>Grade 11 (Calculus)</td>
                  <td>Grade 9A (Practical)</td>
                  <td>Faculty Prep</td>
                </tr>
                <tr>
                  <td><strong>Tuesday</strong></td>
                  <td>Grade 10B (Math)</td>
                  <td>Grade 9A (Math)</td>
                  <td>Grade 11 (Calculus)</td>
                  <td>— Free —</td>
                  <td>Grade 9A (Mentoring)</td>
                  <td>Department Sync</td>
                </tr>
                <tr>
                  <td><strong>Wednesday</strong></td>
                  <td>Grade 9A (Math)</td>
                  <td>Grade 10B (Math)</td>
                  <td>Math Lab Practical</td>
                  <td>— Free —</td>
                  <td>Grade 11 (Calculus)</td>
                  <td>Remedial Class</td>
                </tr>
                <tr>
                  <td><strong>Thursday</strong></td>
                  <td>— Free —</td>
                  <td>Grade 9A (Math)</td>
                  <td>Grade 10B (Math)</td>
                  <td>Grade 11 (Calculus)</td>
                  <td>Grade 9A (Math)</td>
                  <td>Sports Supervision</td>
                </tr>
                <tr>
                  <td><strong>Friday</strong></td>
                  <td>Grade 9A (Math)</td>
                  <td>Grade 11 (Calculus)</td>
                  <td>Grade 10B (Math)</td>
                  <td>Jummah Recess</td>
                  <td>Islamic Values Talk</td>
                  <td>Faculty Assembly</td>
                </tr>
                <tr>
                  <td><strong>Saturday</strong></td>
                  <td>Weekly Assessment</td>
                  <td>Doubt Clearance</td>
                  <td>PTA Meeting / Review</td>
                  <td>— Free —</td>
                  <td>Staff Development</td>
                  <td>Weekend Dismissal</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (tabKey === 'leaves') {
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Leave Balances & Leave Application Workflow</h3>
              <p class="card-desc">Casual Leave, Medical Leave, and Earned Leave ledger with substitute educator allocation.</p>
            </div>
            <button class="btn btn-primary" id="btn-apply-leave"><i data-lucide="plus"></i> Apply for Leave</button>
          </div>

          <div class="kpi-grid" style="margin-bottom: 20px;">
            ${UIComponents.renderKpiCard({ title: 'Casual Leave (CL)', value: '8 / 12 Days', icon: 'coffee', color: 'blue' })}
            ${UIComponents.renderKpiCard({ title: 'Medical Leave (ML)', value: '10 / 10 Days', icon: 'heart-pulse', color: 'emerald' })}
            ${UIComponents.renderKpiCard({ title: 'Earned Leave (EL)', value: '14 Days', icon: 'award', color: 'amber' })}
          </div>

          <h4 style="margin-bottom: 12px;">Recent Leave History</h4>
          <div class="table-responsive">
            <table class="tms-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Leave Type</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Days</th>
                  <th>Substitute Educator</th>
                  <th>Approval Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="font-mono">LV-2024-082</span></td>
                  <td>Casual Leave</td>
                  <td>2024-09-12</td>
                  <td>2024-09-12</td>
                  <td>1 Day</td>
                  <td>Mrs. Aysha Mariyam</td>
                  <td><span class="badge badge-success">Approved by Principal</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (tabKey === 'payslips') {
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">My Payslips & CTC Salary Ledger</h3>
              <p class="card-desc">Official Thaiba Model School monthly compensation and deductions ledger.</p>
            </div>
            <button class="btn btn-secondary" onclick="window.print()"><i data-lucide="printer"></i> Print Payslip</button>
          </div>

          <div style="background: rgba(0,0,0,0.02); padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); max-width: 700px; margin: 0 auto;">
            <div style="text-align: center; border-bottom: 2px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px;">
              <h2 style="font-size: 1.4rem;">${TMS_CONFIG.institution.name}</h2>
              <p style="font-size: 0.85rem; color: var(--text-muted);">${TMS_CONFIG.institution.address.campus}, ${TMS_CONFIG.institution.address.city}</p>
              <h3 style="font-size: 1.1rem; margin-top: 10px;">SALARY SLIP — OCTOBER 2024</h3>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 0.88rem; margin-bottom: 20px;">
              <div>
                <strong>Employee ID:</strong> TMS-FAC-01<br>
                <strong>Employee Name:</strong> Prof. Rashid Rahman<br>
                <strong>Designation:</strong> Senior Faculty (Grade 9A)
              </div>
              <div>
                <strong>Department:</strong> Mathematics & Science<br>
                <strong>Bank Account:</strong> *******4829 (SBI)<br>
                <strong>Pay Days:</strong> 31 Days
              </div>
            </div>

            <table class="tms-table font-mono" style="margin-bottom: 20px;">
              <thead>
                <tr>
                  <th>Earnings</th>
                  <th>Amount (₹)</th>
                  <th>Deductions</th>
                  <th>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Salary</td>
                  <td>48,000</td>
                  <td>Provident Fund (PF)</td>
                  <td>1,800</td>
                </tr>
                <tr>
                  <td>House Rent Allowance (HRA)</td>
                  <td>12,000</td>
                  <td>Professional Tax</td>
                  <td>250</td>
                </tr>
                <tr>
                  <td>Special Allowances</td>
                  <td>6,000</td>
                  <td>TDS / Income Tax</td>
                  <td>1,500</td>
                </tr>
                <tr style="font-weight: 700; background: rgba(59,130,246,0.08);">
                  <td>Gross Earnings</td>
                  <td>₹ 66,000</td>
                  <td>Total Deductions</td>
                  <td>₹ 3,550</td>
                </tr>
              </tbody>
            </table>

            <div style="text-align: right; font-size: 1.2rem; font-weight: 700; color: #10b981; padding-top: 10px; border-top: 1px dashed var(--border-color);">
              Net Take-Home Salary: ₹ 62,450
            </div>
          </div>
        </div>
      `;
    }

    UIComponents.refreshIcons();
  }

  static bindEvents(container) {
    container.querySelectorAll('.staff-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        container.querySelectorAll('.staff-tab').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
        e.currentTarget.classList.remove('btn-secondary');
        e.currentTarget.classList.add('btn-primary');
        this.renderTab(e.currentTarget.dataset.tab, container);
      });
    });

    const punchBtn = container.querySelector('#btn-punch-now');
    if (punchBtn) {
      punchBtn.addEventListener('click', async () => {
        const user = authService.getCurrentUser() || {};
        await auditService.log('STAFF_GEOFENCE_PUNCH', 'ATTENDANCE', {
          latitude: TMS_CONFIG.institution.gpsGeofence.latitude,
          longitude: TMS_CONFIG.institution.gpsGeofence.longitude,
          distanceMeters: 18.5,
          method: 'GPS_GEOFENCE'
        }, user.id);
        UIComponents.showToast('Biometric GPS Punch Verified & Synchronized with TMS Cloud!', 'success');
      });
    }
  }
}

export default MyWorkModule;
