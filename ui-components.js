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
    // Enforce Pro-Max Luxury Light Theme (Dark mode completely removed as requested)
    document.body.classList.remove('dark');
    localStorage.setItem('tms_theme', 'light');

    const savedColor = localStorage.getItem('tms_color_theme') || 'emerald';
    const activeColor = (savedColor === 'oled') ? 'emerald' : savedColor;

    document.documentElement.setAttribute('data-theme', activeColor);
    document.body.setAttribute('data-theme', activeColor);
    localStorage.setItem('tms_color_theme', activeColor);
  }

  static setColorTheme(themeName) {
    const valid = ['emerald', 'sapphire', 'burgundy'];
    const chosen = valid.includes(themeName) ? themeName : 'emerald';
    
    document.body.classList.remove('dark');
    localStorage.setItem('tms_theme', 'light');
    document.documentElement.setAttribute('data-theme', chosen);
    document.body.setAttribute('data-theme', chosen);
    localStorage.setItem('tms_color_theme', chosen);

    const names = {
      emerald: 'Thaiba Emerald (Classic Institutional)',
      sapphire: 'Royal Sapphire (Academic Blue)',
      burgundy: 'Noble Burgundy (Regal Crimson)'
    };
    this.showToast(`Active Theme: ${names[chosen]} (Premium Light Edition)`, 'success');
  }

  static toggleTheme() {
    // Cycle between luxury light palettes
    const current = localStorage.getItem('tms_color_theme') || 'emerald';
    const next = current === 'emerald' ? 'sapphire' : (current === 'sapphire' ? 'burgundy' : 'emerald');
    this.setColorTheme(next);
  }

  static updateThemeButton() {
    // No-op for dark mode button
  }

  static refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      if (this._iconRaf) cancelAnimationFrame(this._iconRaf);
      this._iconRaf = requestAnimationFrame(() => {
        try { window.lucide.createIcons(); } catch (e) { /* ignore */ }
      });
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
    
    const footerEl = document.getElementById('global-modal-footer');
    if (footerEl) {
      if (footerHtml && footerHtml.trim()) {
        footerEl.innerHTML = footerHtml;
        footerEl.style.display = 'flex';
      } else {
        footerEl.innerHTML = '';
        footerEl.style.display = 'none';
      }
    }

    overlay.classList.add('active');
    this.refreshIcons();
  }

  static closeModal() {
    const overlay = document.getElementById('global-modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  static renderLoading(message = 'Loading verified records...') {
    return `
      <div class="tms-animated-loader" style="padding: 48px 20px; text-align: center;">
        <div class="tms-loader-emblem-wrap" style="position: relative; width: 72px; height: 72px; margin: 0 auto 16px;">
          <div class="tms-loader-aura"></div>
          <img src="./tms-logo.png" alt="Thaiba Model School" class="tms-loader-img" style="width: 58px; height: 58px; object-fit: contain; position: relative; z-index: 2;">
        </div>
        <div class="tms-loader-text" style="font-family: var(--font-display, 'Outfit', sans-serif); font-weight: 700; color: #16a34a; font-size: 0.92rem; letter-spacing: 0.02em;">
          ${this.escapeHtml(message)}
        </div>
      </div>
    `;
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
