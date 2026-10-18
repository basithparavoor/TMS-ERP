/**
 * THAIBA MODEL SCHOOL — Finance, Invoicing & Cash Counter Module
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { UIComponents } from './ui-components.js';
import { auditService } from './audit-service.js';

export class FinanceModule {
  static async render(container) {
    const invoices = await dbService.select('invoices');

    const totalBilled = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + (inv.paid || 0), 0);
    const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0);

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem;">Fees & Financial Operations</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Tuition fee structures, invoicing engine, cash counter receipts, and student ledger for THAIBA MODEL SCHOOL.
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" id="btn-defaulters-list"><i data-lucide="alert-circle"></i> Defaulters Aging</button>
            <button class="btn btn-primary" id="btn-open-cash-counter"><i data-lucide="credit-card"></i> Fee Collection Counter</button>
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'Total Invoiced (Term 1)', value: `₹ ${totalBilled.toLocaleString()}`, icon: 'file-text', color: 'blue' })}
        ${UIComponents.renderKpiCard({ title: 'Total Collections', value: `₹ ${totalCollected.toLocaleString()}`, icon: 'check-circle-2', color: 'emerald', subtitle: 'Bank & Cash Reconciled' })}
        ${UIComponents.renderKpiCard({ title: 'Outstanding Balance', value: `₹ ${totalOutstanding.toLocaleString()}`, icon: 'clock', color: 'rose', subtitle: 'Pending Collection' })}
        ${UIComponents.renderKpiCard({ title: 'Collection Efficiency', value: '78.5%', icon: 'pie-chart', color: 'amber', subtitle: 'On Track for Due Date' })}
      </div>

      <!-- Invoices Ledger Card -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Fee Invoices & Student Accounts</h3>
            <p class="card-desc">Individual ledger accounts, payment modes (UPI, Cash, Bank Transfer), and receipts.</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="tms-table" id="invoices-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Student Name</th>
                <th>Grade</th>
                <th>Term</th>
                <th>Billed (₹)</th>
                <th>Paid (₹)</th>
                <th>Balance (₹)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${invoices.map(inv => `
                <tr>
                  <td><span class="font-mono" style="font-weight: 600;">${inv.invoiceNo}</span></td>
                  <td><strong>${inv.studentName}</strong></td>
                  <td>${inv.grade}</td>
                  <td>${inv.term}</td>
                  <td class="font-mono">₹ ${inv.amount.toLocaleString()}</td>
                  <td class="font-mono" style="color: #10b981;">₹ ${inv.paid.toLocaleString()}</td>
                  <td class="font-mono" style="color: ${inv.balance > 0 ? '#ef4444' : 'inherit'}; font-weight: ${inv.balance > 0 ? '700' : 'normal'};">
                    ₹ ${inv.balance.toLocaleString()}
                  </td>
                  <td>
                    ${inv.status === 'Paid' ? `
                      <span class="badge badge-success">Fully Paid</span>
                    ` : inv.status === 'Partial' ? `
                      <span class="badge badge-warning">Partial</span>
                    ` : `
                      <span class="badge badge-danger">Unpaid</span>
                    `}
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-secondary btn-sm btn-print-receipt" data-inv="${inv.invoiceNo}" data-name="${inv.studentName}" data-amt="${inv.paid || inv.amount}" data-date="${inv.paidDate || inv.dueDate}" data-mode="${inv.paymentMode || 'Cash'}">
                        <i data-lucide="receipt"></i> Receipt
                      </button>
                      ${inv.balance > 0 ? `
                        <button class="btn btn-primary btn-sm btn-pay-balance" data-id="${inv.id}" data-name="${inv.studentName}" data-balance="${inv.balance}">
                          <i data-lucide="check"></i> Pay
                        </button>
                      ` : ''}
                    </div>
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
    const counterBtn = container.querySelector('#btn-open-cash-counter');
    if (counterBtn) {
      counterBtn.addEventListener('click', () => {
        UIComponents.openModal({
          title: 'Cash Counter — Collect Student Fee',
          bodyHtml: `
            <form id="form-collect-fee">
              <div class="form-group">
                <label class="form-label">Student Identification</label>
                <select class="form-select" id="fee-student-select">
                  <option value="TMS-STU-1003|Zayan Ahmed|24500">Zayan Ahmed (Grade 9A) — Due: ₹ 24,500</option>
                  <option value="TMS-STU-1002|Fathima Nuha|9500">Fathima Nuha (Grade 9A) — Due: ₹ 9,500</option>
                  <option value="TMS-STU-1001|Mohammed Rayan K|0">Mohammed Rayan K (Grade 9A) — Due: ₹ 0</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Amount Collecting (₹)</label>
                <input type="number" class="form-input font-mono" id="fee-pay-amount" required value="24500">
              </div>
              <div class="form-group">
                <label class="form-label">Payment Mode</label>
                <select class="form-select" id="fee-pay-mode">
                  ${TMS_CONFIG.finance.paymentModes.map(m => `<option value="${m}">${m}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Reference / Transaction ID</label>
                <input class="form-input font-mono" id="fee-pay-ref" placeholder="e.g. UPI-9988229 or Cash Receipt #">
              </div>
            </form>
          `,
          footerHtml: `
            <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
            <button class="btn btn-primary" id="btn-confirm-collection">Record Payment & Issue Receipt</button>
          `
        });

        document.getElementById('btn-confirm-collection').addEventListener('click', async () => {
          const selectVal = document.getElementById('fee-student-select').value.split('|');
          const studentName = selectVal[1];
          const amount = parseFloat(document.getElementById('fee-pay-amount').value) || 0;
          const mode = document.getElementById('fee-pay-mode').value;
          const ref = document.getElementById('fee-pay-ref').value || 'CASH-REC-' + Date.now().toString().substr(-6);

          const invoices = await dbService.select('invoices');
          const inv = invoices.find(i => i.studentName === studentName);
          if (inv) {
            const newPaid = (inv.paid || 0) + amount;
            const newBal = Math.max(0, inv.amount - newPaid);
            const newStatus = newBal === 0 ? 'Paid' : 'Partial';

            await dbService.update('invoices', inv.id, {
              paid: newPaid,
              balance: newBal,
              status: newStatus,
              paidDate: new Date().toISOString().split('T')[0],
              paymentMode: mode
            });
          }

          await auditService.log('FEE_COLLECTION_RECEIVED', 'FINANCE', {
            studentName,
            amountCollected: amount,
            paymentMode: mode,
            transactionRef: ref
          });

          UIComponents.closeModal();
          UIComponents.showToast(`Payment of ₹ ${amount.toLocaleString()} recorded for ${studentName}!`, 'success');
          FinanceModule.render(container);
        });
      });
    }

    // Individual pay button
    container.querySelectorAll('.btn-pay-balance').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const name = e.currentTarget.dataset.name;
        const bal = e.currentTarget.dataset.balance;
        container.querySelector('#btn-open-cash-counter').click();
      });
    });

    // Receipt printer
    container.querySelectorAll('.btn-print-receipt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const inv = e.currentTarget.dataset.inv;
        const name = e.currentTarget.dataset.name;
        const amt = e.currentTarget.dataset.amt;
        const date = e.currentTarget.dataset.date;
        const mode = e.currentTarget.dataset.mode;

        UIComponents.openModal({
          title: `Fee Receipt — ${inv}`,
          bodyHtml: `
            <div id="printable-receipt" style="background: #fff; color: #0f172a; padding: 24px; border: 2px dashed #0f172a; border-radius: 8px;">
              <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
                <h2 style="font-size: 1.3rem; margin-bottom: 2px;">${TMS_CONFIG.institution.name}</h2>
                <p style="font-size: 0.8rem; color: #64748b;">OFFICIAL FEE RECEIPT • BURSAR'S OFFICE</p>
                <div style="font-size: 0.85rem; font-weight: 700; margin-top: 6px;">Receipt #${inv}</div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem; margin-bottom: 16px;">
                <div><strong>Student:</strong> ${name}</div>
                <div><strong>Date:</strong> ${date}</div>
                <div><strong>Payment Mode:</strong> ${mode}</div>
                <div><strong>Academic Year:</strong> ${TMS_CONFIG.academic.currentYear}</div>
              </div>

              <table class="tms-table" style="font-size: 0.82rem; margin-bottom: 16px;">
                <thead>
                  <tr style="background: #f1f5f9; color: #0f172a;">
                    <th>Particulars</th>
                    <th style="text-align: right;">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Tuition & Laboratory Term Fee</td>
                    <td style="text-align: right;">₹ ${parseFloat(amt).toLocaleString()}</td>
                  </tr>
                  <tr style="font-weight: 700;">
                    <td>Net Amount Received</td>
                    <td style="text-align: right; color: #10b981;">₹ ${parseFloat(amt).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; font-size: 0.78rem;">
                <div>Computer Generated • No Physical Signature Required</div>
                <div style="text-align: center;">
                  ____________________<br>
                  <strong>Accounts Cashier Seal</strong>
                </div>
              </div>
            </div>
          `,
          footerHtml: `
            <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Close</button>
            <button class="btn btn-primary" onclick="window.print()"><i data-lucide="printer"></i> Print Official Receipt</button>
          `
        });
      });
    });
  }
}

export default FinanceModule;
