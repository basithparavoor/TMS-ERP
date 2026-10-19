/**
 * THAIBA MODEL SCHOOL — Notification Center (shared UI)
 * A bell + unread badge plus an inbox modal, used by the ERP shell and portals.
 */

import { notificationService } from './notification-service.js';
import { UIComponents } from './ui-components.js';

const esc = (v) => UIComponents.escapeHtml(v);

function fmt(value) {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('en-GB');
}

export class NotificationCenter {
  /**
   * Wire a bell button (#notification-bell) and optional badge (#notification-badge).
   */
  static async init() {
    const bell = document.getElementById('notification-bell');
    if (!bell) return;
    bell.addEventListener('click', () => this.openInbox());
    await this.refreshBadge();
  }

  static async refreshBadge() {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;
    try {
      const count = await notificationService.unreadCount();
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
      badge.innerText = count > 99 ? '99+' : String(count);
    } catch (e) {
      badge.style.display = 'none';
    }
  }

  static async openInbox() {
    let items = [];
    try {
      items = await notificationService.listForUser();
    } catch (e) {
      console.error('Notification load failed:', e);
    }

    const bodyHtml = items.length ? `
      <div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
        <button class="btn btn-secondary btn-sm" id="notif-mark-all"><i data-lucide="check-check"></i> Mark all read</button>
      </div>
      <div style="max-height: 420px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">
        ${items.map((n) => `
          <div class="notif-item" data-id="${esc(n.id)}" style="padding:12px; border:1px solid var(--border-color); border-left:4px solid ${n.isRead ? 'var(--border-color)' : '#16a34a'}; border-radius:8px; background:${n.isRead ? 'transparent' : 'rgba(22,163,74,0.04)'}; cursor:pointer;">
            <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
              <strong style="font-size:0.92rem;">${esc(n.title)}</strong>
              <span class="badge ${n.priority === 'Urgent' ? 'badge-danger' : (n.priority === 'High' ? 'badge-warning' : 'badge-info')}">${esc(n.priority || 'Normal')}</span>
            </div>
            <p style="font-size:0.84rem; color:var(--text-muted); margin-top:6px; white-space:pre-wrap;">${esc(n.message)}</p>
            <div style="font-size:0.72rem; color:var(--text-subtle); margin-top:6px;">${fmt(n.createdAt)} • ${esc(n.createdByName || 'Administration')}</div>
          </div>`).join('')}
      </div>`
      : '<p style="text-align:center; color:var(--text-muted); padding:30px;">No notifications yet.</p>';

    UIComponents.openModal({ title: 'Notifications', bodyHtml, footerHtml: '<button class="btn btn-secondary" id="notif-inbox-close">Close</button>' });

    const close = document.getElementById('notif-inbox-close');
    if (close) close.addEventListener('click', () => UIComponents.closeModal());

    const markAll = document.getElementById('notif-mark-all');
    if (markAll) {
      markAll.addEventListener('click', async () => {
        await notificationService.markAllRead(items.filter((n) => !n.isRead).map((n) => n.id));
        UIComponents.showToast('All notifications marked as read.', 'success');
        UIComponents.closeModal();
        await this.refreshBadge();
      });
    }

    document.querySelectorAll('.notif-item').forEach((el) => {
      el.addEventListener('click', async () => {
        const id = el.dataset.id;
        const item = items.find((n) => n.id === id);
        if (item && !item.isRead) {
          await notificationService.markRead(id);
          await this.refreshBadge();
        }
      });
    });

    UIComponents.refreshIcons();
  }
}

export default NotificationCenter;
