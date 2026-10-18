/**
 * THAIBA MODEL SCHOOL — Campus Logistics, Library, Transport & Inventory Module
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { UIComponents } from './ui-components.js';
import { auditService } from './audit-service.js';

export class OperationsModule {
  static async render(container) {
    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem;">Campus Logistics & Operations</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Library circulation, school transport fleet, hostel dormitories, and physical asset inventory.
            </p>
          </div>
          <button class="btn btn-primary" id="btn-issue-book"><i data-lucide="book-open"></i> Issue Library Book</button>
        </div>
      </div>

      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'Library Catalogued Books', value: '8,420 Vol.', icon: 'library', color: 'blue', subtitle: '412 Currently Circulated' })}
        ${UIComponents.renderKpiCard({ title: 'School Bus Fleet', value: '14 Buses', icon: 'bus', color: 'emerald', subtitle: 'Covering 28 City Routes' })}
        ${UIComponents.renderKpiCard({ title: 'Hostel Residents', value: '160 Students', icon: 'home', color: 'amber', subtitle: '85% Occupancy Rate' })}
        ${UIComponents.renderKpiCard({ title: 'Tracked Campus Assets', value: '1,240 Assets', icon: 'package', color: 'rose', subtitle: 'Lab, IT & Classroom Hardware' })}
      </div>

      <!-- Navigation Tabs -->
      <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
        <button class="btn btn-primary ops-tab" data-tab="library">Library & ISBN Catalogue</button>
        <button class="btn btn-secondary ops-tab" data-tab="transport">Transport & Bus Routes</button>
        <button class="btn btn-secondary ops-tab" data-tab="hostel">Hostel & Dormitories</button>
        <button class="btn btn-secondary ops-tab" data-tab="inventory">Asset Inventory</button>
      </div>

      <div id="ops-tab-content"></div>
    `;

    this.bindEvents(container);
    this.renderTab('library', container);
    UIComponents.refreshIcons();
  }

  static renderTab(tabKey, container) {
    const content = container.querySelector('#ops-tab-content');
    if (!content) return;

    if (tabKey === 'library') {
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Central Thaiba Library — Active Circulation</h3>
              <p class="card-desc">Book checkouts, RFID/Barcode tracking, due dates, and fine calculations.</p>
            </div>
            <span class="badge badge-success">Library Terminal Online</span>
          </div>

          <div class="table-responsive">
            <table class="tms-table font-mono" style="font-size: 0.84rem;">
              <thead>
                <tr>
                  <th>Accession No</th>
                  <th>ISBN</th>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>Issued To</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ACC-2024-881</td>
                  <td>978-0199535569</td>
                  <td>The Principles of Mathematical Analysis</td>
                  <td>Walter Rudin</td>
                  <td>Prof. Rashid Rahman</td>
                  <td>2024-11-05</td>
                  <td><span class="badge badge-success">On Loan</span></td>
                </tr>
                <tr>
                  <td>ACC-2024-412</td>
                  <td>978-0140449136</td>
                  <td>The Republic</td>
                  <td>Plato</td>
                  <td>Mohammed Rayan K (9A)</td>
                  <td>2024-10-24</td>
                  <td><span class="badge badge-warning">Due Soon</span></td>
                </tr>
                <tr>
                  <td>ACC-2024-190</td>
                  <td>978-0062316097</td>
                  <td>Sapiens: A Brief History of Humankind</td>
                  <td>Yuval Noah Harari</td>
                  <td>Fathima Nuha (9A)</td>
                  <td>2024-10-18</td>
                  <td><span class="badge badge-danger">Overdue (₹ 10 Fine)</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (tabKey === 'transport') {
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">School Bus Fleet & City Transit Routes</h3>
            <span class="badge badge-info">14 Vehicles GPS Active</span>
          </div>
          <div class="table-responsive">
            <table class="tms-table">
              <thead>
                <tr>
                  <th>Route No</th>
                  <th>Bus Reg No</th>
                  <th>Route Name & Key Stops</th>
                  <th>Driver Name</th>
                  <th>Driver Mobile</th>
                  <th>Enrolled Students</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="badge badge-primary">Route 01</span></td>
                  <td class="font-mono">KL-11-AB-4820</td>
                  <td>Calicut Beach → Mananchira → Eranhipalam → School</td>
                  <td>Moideen Koya</td>
                  <td class="font-mono">+91 98471 90812</td>
                  <td>42 Students</td>
                  <td><span class="badge badge-success">En Route</span></td>
                </tr>
                <tr>
                  <td><span class="badge badge-primary">Route 02</span></td>
                  <td class="font-mono">KL-11-CD-9121</td>
                  <td>Feroke → Ramanattukara → Pantheeramkavu → School</td>
                  <td>Balan P</td>
                  <td class="font-mono">+91 94472 33411</td>
                  <td>38 Students</td>
                  <td><span class="badge badge-success">En Route</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (tabKey === 'hostel') {
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Student Hostel & Dormitory Facilities</h3>
            <span class="badge badge-success">Warden Oversight Active</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
            <div style="background: rgba(0,0,0,0.02); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
              <h4 style="margin-bottom: 6px;">Boys' Residential Wing (Al-Ghazali Block)</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">Capacity: 100 Beds • Occupied: 88 • Available: 12</p>
              <div style="font-size: 0.8rem;">Chief Warden: <strong>Usthad Noufal</strong> (+91 98470 77112)</div>
            </div>
            <div style="background: rgba(0,0,0,0.02); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
              <h4 style="margin-bottom: 6px;">Girls' Residential Wing (Fatima Al-Fihri Block)</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">Capacity: 90 Beds • Occupied: 72 • Available: 18</p>
              <div style="font-size: 0.8rem;">Matron: <strong>Mrs. Jameela Begum</strong> (+91 98470 88223)</div>
            </div>
          </div>
        </div>
      `;
    } else if (tabKey === 'inventory') {
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Physical Assets & Laboratory Inventory</h3>
            <button class="btn btn-secondary btn-sm" onclick="alert('Asset audit report generated.')"><i data-lucide="printer"></i> Print Asset Register</button>
          </div>
          <div class="table-responsive">
            <table class="tms-table font-mono" style="font-size: 0.82rem;">
              <thead>
                <tr>
                  <th>Asset Tag</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Quantity</th>
                  <th>Condition</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>TMS-AST-091</td>
                  <td>Dell OptiPlex Core i7 Workstation</td>
                  <td>Computer Lab IT</td>
                  <td>Al-Farabi Lab 2</td>
                  <td>45 Units</td>
                  <td><span class="badge badge-success">Good</span></td>
                </tr>
                <tr>
                  <td>TMS-AST-142</td>
                  <td>Binocular Compound Microscope (1000x)</td>
                  <td>Science Equipment</td>
                  <td>Biology Lab</td>
                  <td>20 Units</td>
                  <td><span class="badge badge-success">Good</span></td>
                </tr>
                <tr>
                  <td>TMS-AST-308</td>
                  <td>Interactive Touch Smartboards (75")</td>
                  <td>Classroom Hardware</td>
                  <td>All Grades 9-12</td>
                  <td>14 Units</td>
                  <td><span class="badge badge-success">Good</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    UIComponents.refreshIcons();
  }

  static bindEvents(container) {
    container.querySelectorAll('.ops-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        container.querySelectorAll('.ops-tab').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
        e.currentTarget.classList.remove('btn-secondary');
        e.currentTarget.classList.add('btn-primary');
        this.renderTab(e.currentTarget.dataset.tab, container);
      });
    });

    const issueBtn = container.querySelector('#btn-issue-book');
    if (issueBtn) {
      issueBtn.addEventListener('click', () => {
        UIComponents.openModal({
          title: 'Issue Book to Student or Faculty',
          bodyHtml: `
            <div class="form-group">
              <label class="form-label">Book Accession Number / Barcode</label>
              <input class="form-input font-mono" id="lib-acc" placeholder="e.g. ACC-2024-554" value="ACC-2024-554">
            </div>
            <div class="form-group">
              <label class="form-label">Borrower ID / Admission No</label>
              <input class="form-input font-mono" id="lib-borrower" placeholder="e.g. TMS/2024/001" value="TMS/2024/001">
            </div>
            <div class="form-group">
              <label class="form-label">Loan Duration</label>
              <select class="form-select" id="lib-days">
                <option value="14">14 Days (Standard)</option>
                <option value="28">28 Days (Faculty)</option>
              </select>
            </div>
          `,
          footerHtml: `
            <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
            <button class="btn btn-primary" id="btn-save-issue">Confirm Loan</button>
          `
        });

        document.getElementById('btn-save-issue').addEventListener('click', async () => {
          await auditService.log('LIBRARY_BOOK_ISSUED', 'OPERATIONS', {
            accession: 'ACC-2024-554',
            borrower: 'TMS/2024/001'
          });
          UIComponents.closeModal();
          UIComponents.showToast('Book loan recorded in Central Library circulation ledger!', 'success');
        });
      });
    }
  }
}

export default OperationsModule;
