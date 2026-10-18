/**
 * THAIBA MODEL SCHOOL — Communication, Circulars & Broadcast Module
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { UIComponents } from './ui-components.js';
import { auditService } from './audit-service.js';

export class CommunicationModule {
  static async render(container) {
    const notices = await dbService.select('notices');

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem;">Official Communication & Broadcast</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              School circulars, targeted notices, emergency bulletins, SMS/WhatsApp broadcast dispatch.
            </p>
          </div>
          <button class="btn btn-primary" id="btn-create-notice"><i data-lucide="send"></i> Publish New Notice</button>
        </div>
      </div>

      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'Active Circulars', value: `${notices.length}`, icon: 'bell', color: 'blue', subtitle: 'Published on Campus' })}
        ${UIComponents.renderKpiCard({ title: 'Emergency Bulletins', value: '0 Active', icon: 'shield-alert', color: 'emerald', subtitle: 'Normal Operations' })}
        ${UIComponents.renderKpiCard({ title: 'SMS / WhatsApp Gateway', value: 'Operational', icon: 'message-circle', color: 'amber', subtitle: 'Thaiba Notification Service' })}
        ${UIComponents.renderKpiCard({ title: 'Acknowledge Rate', value: '94.8%', icon: 'check-check', color: 'rose', subtitle: 'Parent Read Receipts' })}
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">School Notice Board & Official Circulars</h3>
            <p class="card-desc">Targeted notices for Parents, Faculty, Students, or School-Wide distribution.</p>
          </div>
        </div>

        <div style="display: grid; gap: 18px;">
          ${notices.map(n => `
            <div style="background: rgba(0,0,0,0.02); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; border-left: 4px solid ${n.priority === 'Urgent' ? '#ef4444' : '#3b82f6'};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                <div>
                  <h4 style="font-size: 1.05rem; font-weight: 700;">${n.title}</h4>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
                    Category: <strong>${n.category}</strong> • Target: <span class="badge badge-info">${n.target}</span> • Date: ${n.date}
                  </div>
                </div>
                <div>
                  <span class="badge badge-${n.priority === 'Urgent' ? 'danger' : 'info'}">${n.priority} Priority</span>
                </div>
              </div>
              <p style="font-size: 0.9rem; color: var(--text-main); line-height: 1.6; margin-bottom: 12px;">
                ${n.content}
              </p>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--text-muted); border-top: 1px dashed var(--border-color); padding-top: 8px;">
                <span>Dispatched by: <strong>${n.publishedBy || 'Executive Office'}</strong></span>
                <button class="btn btn-secondary btn-sm" onclick="alert('Notification dispatched via SMS & WhatsApp template to authorized recipients.')">
                  <i data-lucide="share"></i> Resend WhatsApp
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.bindEvents(container);
    UIComponents.refreshIcons();
  }

  static bindEvents(container) {
    const createBtn = container.querySelector('#btn-create-notice');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        UIComponents.openModal({
          title: 'Publish Official Circular / Circular Dispatch',
          bodyHtml: `
            <form id="form-new-notice">
              <div class="form-group">
                <label class="form-label">Notice Headline / Title</label>
                <input class="form-input" id="not-title" required placeholder="e.g. Schedule for Mid-Term Examination 2024">
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <select class="form-select" id="not-category">
                    <option>Academic</option>
                    <option>Event</option>
                    <option>Holiday</option>
                    <option>Emergency Closure</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Target Audience</label>
                  <select class="form-select" id="not-target">
                    <option>All School</option>
                    <option>Parents</option>
                    <option>Faculty & Staff</option>
                    <option>High School Students</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Priority Level</label>
                <select class="form-select" id="not-priority">
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Circular Content / Message</label>
                <textarea class="form-textarea" id="not-content" rows="4" required placeholder="Detailed circular content..."></textarea>
              </div>
            </form>
          `,
          footerHtml: `
            <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
            <button class="btn btn-primary" id="btn-save-notice">Publish & Broadcast</button>
          `
        });

        document.getElementById('btn-save-notice').addEventListener('click', async () => {
          const title = document.getElementById('not-title').value;
          const category = document.getElementById('not-category').value;
          const target = document.getElementById('not-target').value;
          const priority = document.getElementById('not-priority').value;
          const content = document.getElementById('not-content').value;

          if (!title || !content) {
            UIComponents.showToast('Please fill all required fields', 'warning');
            return;
          }

          const newNotice = await dbService.insert('notices', {
            title,
            category,
            target,
            priority,
            content,
            date: new Date().toISOString().split('T')[0],
            publishedBy: 'Executive Administration'
          });

          await auditService.log('CIRCULAR_PUBLISHED', 'COMMUNICATION', { title, target, priority }, newNotice.id);
          UIComponents.closeModal();
          UIComponents.showToast('Notice published and broadcasted successfully!', 'success');
          CommunicationModule.render(container);
        });
      });
    }
  }
}

export default CommunicationModule;
