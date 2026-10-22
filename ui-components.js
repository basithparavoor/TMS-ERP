/**
 * THAIBA MODEL SCHOOL — UI Components & Theme Engine
 */

export class UIComponents {
  /**
   * Escape untrusted values before interpolating them into HTML templates.
   * Prevents stored/reflected XSS from user- or staff-supplied data.
   */
  static escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  static initTheme() {
    const savedTheme = localStorage.getItem('tms_theme') || 'light';
    const savedColor = localStorage.getItem('tms_color_theme') || 'emerald';

    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    document.documentElement.setAttribute('data-theme', savedColor);
    document.body.setAttribute('data-theme', savedColor);
    this.updateThemeButton();
  }

  static setColorTheme(themeName) {
    const valid = ['emerald', 'sapphire', 'burgundy', 'oled'];
    const chosen = valid.includes(themeName) ? themeName : 'emerald';
    
    if (chosen === 'oled') {
      document.body.classList.add('dark');
      localStorage.setItem('tms_theme', 'dark');
      document.documentElement.setAttribute('data-theme', 'oled');
      document.body.setAttribute('data-theme', 'oled');
      localStorage.setItem('tms_color_theme', 'oled');
    } else {
      document.documentElement.setAttribute('data-theme', chosen);
      document.body.setAttribute('data-theme', chosen);
      localStorage.setItem('tms_color_theme', chosen);
    }

    this.updateThemeButton();
    const names = {
      emerald: 'Thaiba Emerald Theme',
      sapphire: 'Royal Sapphire Blue Theme',
      burgundy: 'Noble Burgundy Crimson Theme',
      oled: 'OLED Midnight Dark Theme'
    };
    this.showToast(`${names[chosen]} applied!`, 'info');
  }

  static toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('tms_theme', isDark ? 'dark' : 'light');
    this.updateThemeButton();
    this.showToast(isDark ? 'Thaiba High-Contrast Dark Mode enabled' : 'Light Canvas Mode enabled', 'info');
  }

  static updateThemeButton() {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    const isDark = document.body.classList.contains('dark');
    btn.innerHTML = isDark
      ? `<i data-lucide="sun"></i>`
      : `<i data-lucide="moon"></i>`;
    this.refreshIcons();
  }

  static refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  static showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = 'info';
    let color = '#3b82f6';
    if (type === 'success') { icon = 'check-circle'; color = '#10b981'; }
    if (type === 'warning') { icon = 'alert-triangle'; color = '#f59e0b'; }
    if (type === 'danger' || type === 'error') { icon = 'alert-octagon'; color = '#ef4444'; }

    toast.innerHTML = `
      <i data-lucide="${icon}" style="color: ${color}; width: 20px; height: 20px;"></i>
      <span style="font-weight: 500;">${this.escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    this.refreshIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  static openModal({ title, bodyHtml, footerHtml = '' }) {
    let overlay = document.getElementById('global-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'global-modal-overlay';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-window">
          <div class="card-header" style="margin-bottom: 16px;">
            <h3 class="card-title" id="global-modal-title"></h3>
            <button class="icon-btn" id="global-modal-close"><i data-lucide="x"></i></button>
          </div>
          <div id="global-modal-body" style="margin-bottom: 20px;"></div>
          <div id="global-modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;"></div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelector('#global-modal-close').addEventListener('click', () => {
        this.closeModal();
      });

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModal();
      });
    }

    document.getElementById('global-modal-title').innerText = title;
    document.getElementById('global-modal-body').innerHTML = bodyHtml;
    document.getElementById('global-modal-footer').innerHTML = footerHtml;

    overlay.classList.add('active');
    this.refreshIcons();
  }

  static closeModal() {
    const overlay = document.getElementById('global-modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  static renderKpiCard({ title, value, icon, color = 'blue', subtitle = '' }) {
    return `
      <div class="kpi-card">
        <div class="kpi-icon kpi-${color}">
          <i data-lucide="${icon}"></i>
        </div>
        <div class="kpi-meta">
          <h3>${value}</h3>
          <p>${title}</p>
          ${subtitle ? `<span style="font-size: 0.72rem; color: var(--text-subtle);">${subtitle}</span>` : ''}
        </div>
      </div>
    `;
  }
}

export default UIComponents;
