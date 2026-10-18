/**
 * THAIBA MODEL SCHOOL — Campus Facilities & Infrastructure Module
 * Single-Institution Architecture exclusively for TMS
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { UIComponents } from './ui-components.js';
import { auditService } from './audit-service.js';

export class InstitutionModule {
  static async render(container) {
    const facilities = await dbService.select('facilities');

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem;">Campus Infrastructure & Facilities</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Building directory, laboratory spaces, seating capacities, and maintenance log for THAIBA MODEL SCHOOL.</p>
          </div>
          <button class="btn btn-primary" id="btn-add-facility"><i data-lucide="plus-circle"></i> Add Facility / Room</button>
        </div>
      </div>

      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'Academic Blocks', value: '3 Blocks', icon: 'building', color: 'blue' })}
        ${UIComponents.renderKpiCard({ title: 'Configured Classrooms', value: '42 Rooms', icon: 'door-open', color: 'emerald' })}
        ${UIComponents.renderKpiCard({ title: 'Specialized Labs', value: '6 Labs', icon: 'flask-conical', color: 'amber' })}
        ${UIComponents.renderKpiCard({ title: 'Total Seating Capacity', value: '1,450', icon: 'users', color: 'rose' })}
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">School Physical Spaces Directory</h3>
            <p class="card-desc">Classrooms, science labs, computer wings, library, and faculty lounges.</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="tms-table" id="facilities-table">
            <thead>
              <tr>
                <th>Facility ID</th>
                <th>Building / Wing</th>
                <th>Floor</th>
                <th>Room Name</th>
                <th>Seating Capacity</th>
                <th>Operating Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${facilities.map(f => `
                <tr>
                  <td><span class="font-mono" style="font-weight: 600;">${f.id}</span></td>
                  <td><strong>${f.building}</strong></td>
                  <td>${f.floor}</td>
                  <td>${f.name}</td>
                  <td>${f.capacity} Seats</td>
                  <td><span class="badge badge-success">${f.status || 'Active'}</span></td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="alert('Maintenance schedule updated.')"><i data-lucide="wrench"></i> Log Maintenance</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindEvents(container);
    UIComponents.refreshIcons();
  }

  static bindEvents(container) {
    const addBtn = container.querySelector('#btn-add-facility');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        UIComponents.openModal({
          title: 'Register New Campus Space / Facility',
          bodyHtml: `
            <form id="form-new-facility">
              <div class="form-group">
                <label class="form-label">Building / Wing Name</label>
                <input class="form-input" id="fac-building" required placeholder="e.g. Ibn Sina Academic Block" value="Ibn Sina Academic Block">
              </div>
              <div class="form-group">
                <label class="form-label">Floor</label>
                <select class="form-select" id="fac-floor">
                  <option>Ground Floor</option>
                  <option>1st Floor</option>
                  <option>2nd Floor</option>
                  <option>3rd Floor</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Facility / Room Name</label>
                <input class="form-input" id="fac-name" required placeholder="e.g. Grade 10-A Smart Classroom">
              </div>
              <div class="form-group">
                <label class="form-label">Seating Capacity</label>
                <input type="number" class="form-input" id="fac-capacity" required placeholder="35" value="40">
              </div>
            </form>
          `,
          footerHtml: `
            <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
            <button class="btn btn-primary" id="btn-save-facility">Save Facility</button>
          `
        });

        document.getElementById('btn-save-facility').addEventListener('click', async () => {
          const building = document.getElementById('fac-building').value;
          const floor = document.getElementById('fac-floor').value;
          const name = document.getElementById('fac-name').value;
          const capacity = parseInt(document.getElementById('fac-capacity').value) || 30;

          if (!name) {
            UIComponents.showToast('Please enter room name', 'warning');
            return;
          }

          const record = await dbService.insert('facilities', {
            building,
            floor,
            name,
            capacity,
            status: 'Active'
          });

          await auditService.log('FACILITY_ADDED', 'OPERATIONS', { name, building, capacity }, record.id);
          UIComponents.closeModal();
          UIComponents.showToast(`Facility ${name} added successfully!`, 'success');
          InstitutionModule.render(container);
        });
      });
    }
  }
}

export default InstitutionModule;
