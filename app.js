/**
 * THAIBA MODEL SCHOOL — Main ERP Controller & Router
 * Hash Router: #/module/tab
 * Strict Authentication Mode & Official TMS Branding
 */

import { TMS_CONFIG } from './config.js';
import { authService } from './auth-service.js';
import { PermissionEngine } from './permission-engine.js';
import { UIComponents } from './ui-components.js';
import { dbService } from './supabase-client.js';
import { TMS_LOGO } from './logo.js';

// Import Functional Modules
import { AdminModule } from './admin-module.js';
import { InstitutionModule } from './institution-module.js';
import { MyWorkModule } from './my-work-module.js';
import { AttendanceModule } from './attendance-module.js';
import { StudentModule } from './student-module.js';
import { StaffModule } from './staff-module.js';
import { AcademicModule } from './academic-module.js';
import { ExaminationModule } from './examination-module.js';
import { FinanceModule } from './finance-module.js';
import { CommunicationModule } from './communication-module.js';
import { OperationsModule } from './operations-module.js';
import { ReportsModule } from './reports-module.js';

class AppController {
  constructor() {
    this.currentRoute = '';
    this.init();
  }

  async init() {
    UIComponents.initTheme();

    // Strict Authentication Guard
    if (!authService.isAuthenticated()) {
      window.location.href = 'login.html';
      return;
    }

    this.renderShell();
    this.bindGlobalEvents();
    this.initRouter();
  }

  renderShell() {
    const user = authService.getCurrentUser() || {};
    const root = document.getElementById('app-root');
    if (!root) return;

    root.innerHTML = `
      <div class="ambient-mesh">
        <div class="mesh-glow-1"></div>
        <div class="mesh-glow-2"></div>
      </div>

      <div class="sidebar-backdrop" id="sidebar-backdrop"></div>

      <div class="app-container">
        <!-- Sidebar Navigation -->
        <aside class="app-sidebar" id="app-sidebar">
          <div class="sidebar-header">
            ${TMS_LOGO.emblemSvg(42)}
            <div class="brand-info">
              <h2>${TMS_CONFIG.institution.name}</h2>
              <p>Thaiba Heritage, Kolkata</p>
            </div>
          </div>

          <nav class="sidebar-nav" id="sidebar-nav-items">
            <!-- Dynamically populated based on RBAC -->
          </nav>

          <div class="sidebar-footer">
            <div class="user-mini-card">
              <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="Avatar">
              <div class="user-details-mini">
                <div class="name">${user.name || 'TMS Authorized'}</div>
                <div class="role">${user.isSuperAdmin ? 'Super Admin' : (user.title || user.role)}</div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Workspace -->
        <main class="app-main">
          <!-- Topbar -->
          <header class="app-topbar">
            <div class="topbar-left">
              <button class="icon-btn" id="btn-toggle-sidebar" title="Toggle Navigation">
                <i data-lucide="menu"></i>
              </button>

              <div class="search-bar-trigger" id="global-search-trigger">
                <i data-lucide="search" style="width: 16px; height: 16px;"></i>
                <span>Search students, staff, records...</span>
                <span class="kbd-shortcut">Ctrl K</span>
              </div>
            </div>

            <div class="topbar-right">
              <div class="ticker-badge" title="Campus Active">
                <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                <span>Session ${TMS_CONFIG.academic.currentYear} Active</span>
              </div>

              <button class="icon-btn" id="theme-toggle-btn" title="Toggle Light/Dark Mode">
                <i data-lucide="moon"></i>
              </button>

              <button class="icon-btn" id="btn-logout" title="Sign Out">
                <i data-lucide="log-out"></i>
              </button>
            </div>
          </header>

          <!-- Module Viewport -->
          <div class="app-viewport" id="app-viewport">
            <!-- Dynamic module content injected here -->
          </div>
        </main>
      </div>
    `;

    this.populateSidebarNav();
    UIComponents.refreshIcons();
  }

  populateSidebarNav() {
    const nav = document.getElementById('sidebar-nav-items');
    if (!nav) return;

    const navItems = [
      { id: 'dashboard', label: 'Overview Dashboard', icon: 'layout-dashboard', module: 'dashboard' },
      { id: 'my-work', label: 'Staff Workspace', icon: 'briefcase', module: 'my-work' },
      { id: 'students', label: 'Student Directory', icon: 'graduation-cap', module: 'students' },
      { id: 'attendance', label: 'Attendance & Radar', icon: 'user-check', module: 'attendance' },
      { id: 'academics', label: 'Academic & Timetable', icon: 'book-open', module: 'academics' },
      { id: 'examinations', label: 'Exams & Reports', icon: 'award', module: 'examinations' },
      { id: 'finance', label: 'Finance & Accounts', icon: 'credit-card', module: 'finance' },
      { id: 'staff', label: 'Staff & HR', icon: 'users', module: 'staff' },
      { id: 'operations', label: 'Library & Logistics', icon: 'box', module: 'operations' },
      { id: 'communication', label: 'Notice & Bulletins', icon: 'message-square', module: 'communication' },
      { id: 'reports', label: 'School Analytics', icon: 'bar-chart-3', module: 'reports' },
      { id: 'institution', label: 'Campus Facilities', icon: 'building', module: 'institution' },
      { id: 'administration', label: 'School Administration', icon: 'settings', module: 'administration' }
    ];

    const authorizedItems = navItems.filter(item => PermissionEngine.canAccessModule(item.module));

    nav.innerHTML = `
      <div class="sidebar-group-title">Campus Operations</div>
      ${authorizedItems.map(item => `
        <a class="nav-item" href="#/${item.module}" data-module="${item.module}">
          <i data-lucide="${item.icon}"></i>
          <span>${item.label}</span>
        </a>
      `).join('')}
      
      <div class="sidebar-group-title" style="margin-top: 14px;">Dedicated Portals</div>
      <a class="nav-item" href="student-admission-portal.html" target="_blank">
        <i data-lucide="file-text" style="color: #16a34a;"></i>
        <span>Admission Form (A4)</span>
      </a>
      <a class="nav-item" href="teacher-portal.html" target="_blank">
        <i data-lucide="external-link"></i>
        <span>Faculty Portal</span>
      </a>
      <a class="nav-item" href="student-portal.html" target="_blank">
        <i data-lucide="external-link"></i>
        <span>Student Portal</span>
      </a>
      <a class="nav-item" href="parent-portal.html" target="_blank">
        <i data-lucide="external-link"></i>
        <span>Parent Portal</span>
      </a>
    `;

    UIComponents.refreshIcons();
  }

  bindGlobalEvents() {
    const toggleBtn = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (toggleBtn && sidebar && backdrop) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        backdrop.classList.toggle('active');
      });
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
      });
    }

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => UIComponents.toggleTheme());
    }

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Sign out from THAIBA MODEL SCHOOL ERP?')) {
          authService.logout();
        }
      });
    }

    // Global Search (Ctrl + K)
    const searchTrigger = document.getElementById('global-search-trigger');
    const openSearch = () => {
      UIComponents.openModal({
        title: 'Global Search across THAIBA MODEL SCHOOL',
        bodyHtml: `
          <div class="form-group">
            <input type="text" class="form-input" id="modal-global-search-input" placeholder="Type name, roll no, invoice, or book..." autofocus>
          </div>
          <div id="modal-search-results" style="max-height: 250px; overflow-y: auto; font-size: 0.88rem;">
            <p style="color: var(--text-muted); text-align: center; padding: 20px;">Type to search school directory...</p>
          </div>
        `
      });

      const input = document.getElementById('modal-global-search-input');
      const results = document.getElementById('modal-search-results');

      input.addEventListener('input', async (e) => {
        const q = e.target.value.toLowerCase().trim();
        if (!q) {
          results.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 20px;">Type to search school directory...</p>`;
          return;
        }

        const students = await dbService.select('students');
        const staff = await dbService.select('staff');
        const invoices = await dbService.select('invoices');

        const matchedStudents = students.filter(s => (s.fullName || s.full_name || '').toLowerCase().includes(q) || (s.admissionNo || s.admission_no || '').toLowerCase().includes(q));
        const matchedStaff = staff.filter(st => (st.name || '').toLowerCase().includes(q) || (st.empId || st.emp_id || '').toLowerCase().includes(q));
        const matchedInvoices = invoices.filter(i => (i.invoiceNo || i.invoice_no || '').toLowerCase().includes(q) || (i.studentName || i.student_name || '').toLowerCase().includes(q));

        let html = '';
        if (matchedStudents.length) {
          html += `<div style="font-weight: 700; color: #16a34a; margin: 8px 0 4px;">Students:</div>`;
          matchedStudents.forEach(s => {
            html += `<div style="padding: 6px; border-bottom: 1px solid var(--border-color);">${s.fullName || s.full_name} (${s.admissionNo || s.admission_no}) — ${s.grade}</div>`;
          });
        }
        if (matchedStaff.length) {
          html += `<div style="font-weight: 700; color: #3b82f6; margin: 8px 0 4px;">Faculty & Staff:</div>`;
          matchedStaff.forEach(st => {
            html += `<div style="padding: 6px; border-bottom: 1px solid var(--border-color);">${st.name} (${st.designation})</div>`;
          });
        }
        if (matchedInvoices.length) {
          html += `<div style="font-weight: 700; color: #f59e0b; margin: 8px 0 4px;">Invoices:</div>`;
          matchedInvoices.forEach(inv => {
            html += `<div style="padding: 6px; border-bottom: 1px solid var(--border-color);">${inv.invoiceNo || inv.invoice_no} — ${inv.studentName || inv.student_name} (₹ ${inv.amount})</div>`;
          });
        }

        if (!html) {
          html = `<p style="color: var(--text-muted); text-align: center; padding: 20px;">No records found matching "${q}"</p>`;
        }
        results.innerHTML = html;
      });
    };

    if (searchTrigger) searchTrigger.addEventListener('click', openSearch);
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    });
  }

  initRouter() {
    window.addEventListener('hashchange', () => this.handleRoute());
    if (!window.location.hash) {
      window.location.hash = '#/dashboard';
    } else {
      this.handleRoute();
    }
  }

  async handleRoute() {
    const hash = window.location.hash.slice(2) || 'dashboard';
    const [moduleName] = hash.split('/');
    const viewport = document.getElementById('app-viewport');
    if (!viewport) return;

    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.dataset.module === moduleName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (!PermissionEngine.canAccessModule(moduleName)) {
      viewport.innerHTML = `
        <div class="card" style="text-align: center; padding: 60px 20px;">
          <i data-lucide="shield-alert" style="width: 56px; height: 56px; color: #ef4444; margin: 0 auto 16px;"></i>
          <h2>Access Restricted by School Security Policy</h2>
          <p style="color: var(--text-muted); max-width: 500px; margin: 8px auto 20px;">
            Your authenticated role does not possess capability authorization for module: <strong>${moduleName}</strong>.
          </p>
          <a href="#/dashboard" class="btn btn-primary">Return to Overview Dashboard</a>
        </div>
      `;
      UIComponents.refreshIcons();
      return;
    }

    switch (moduleName) {
      case 'dashboard':
        await this.renderDashboard(viewport);
        break;
      case 'my-work':
        await MyWorkModule.render(viewport);
        break;
      case 'students':
        await StudentModule.render(viewport);
        break;
      case 'attendance':
        await AttendanceModule.render(viewport);
        break;
      case 'academics':
        await AcademicModule.render(viewport);
        break;
      case 'examinations':
        await ExaminationModule.render(viewport);
        break;
      case 'finance':
        await FinanceModule.render(viewport);
        break;
      case 'staff':
        await StaffModule.render(viewport);
        break;
      case 'operations':
        await OperationsModule.render(viewport);
        break;
      case 'communication':
        await CommunicationModule.render(viewport);
        break;
      case 'reports':
        await ReportsModule.render(viewport);
        break;
      case 'institution':
        await InstitutionModule.render(viewport);
        break;
      case 'administration':
        await AdminModule.render(viewport);
        break;
      default:
        await this.renderDashboard(viewport);
    }

    UIComponents.refreshIcons();
  }

  async renderDashboard(container) {
    const students = await dbService.select('students');
    const staff = await dbService.select('staff');
    const invoices = await dbService.select('invoices');
    const user = authService.getCurrentUser() || {};

    const totalCollected = invoices.reduce((acc, i) => acc + (parseFloat(i.paid) || 0), 0);

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.85rem;">THAIBA MODEL SCHOOL — Enterprise Overview</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Unified Campus Management • Welcome, <strong>${user.name}</strong> (${user.isSuperAdmin ? 'Super Administrator' : user.title})
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <a href="student-admission-portal.html" target="_blank" class="btn btn-primary"><i data-lucide="file-plus"></i> Admission Portal (A4)</a>
            <a href="#/administration" class="btn btn-secondary"><i data-lucide="settings"></i> School Admin</a>
          </div>
        </div>
      </div>

      <!-- Top KPI Row -->
      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'Enrolled Students', value: `${students.length}`, icon: 'users', color: 'emerald', subtitle: 'Academic Session ' + TMS_CONFIG.academic.currentYear })}
        ${UIComponents.renderKpiCard({ title: 'Faculty & Employees', value: `${staff.length}`, icon: 'briefcase', color: 'blue', subtitle: 'Active Campus Staff' })}
        ${UIComponents.renderKpiCard({ title: 'Fee Realization', value: `₹ ${totalCollected.toLocaleString()}`, icon: 'credit-card', color: 'amber', subtitle: 'Collections to Date' })}
        ${UIComponents.renderKpiCard({ title: 'Campus Geofence', value: 'Active', icon: 'map-pin', color: 'rose', subtitle: 'Tapan Campus 300m Zone' })}
      </div>

      <!-- Quick Action Hub -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 24px; margin-bottom: 24px;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Authorized Quick Actions</h3>
            <span class="badge badge-success">Direct Access</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <a href="student-admission-portal.html" target="_blank" class="btn btn-secondary" style="justify-content: flex-start; padding: 14px;">
              <i data-lucide="file-text" style="color: #16a34a;"></i> Admission Form (A4)
            </a>
            <a href="#/students" class="btn btn-secondary" style="justify-content: flex-start; padding: 14px;">
              <i data-lucide="user-plus"></i> Student Directory
            </a>
            <a href="#/attendance" class="btn btn-secondary" style="justify-content: flex-start; padding: 14px;">
              <i data-lucide="qr-code"></i> Attendance Radar
            </a>
            <a href="#/finance" class="btn btn-secondary" style="justify-content: flex-start; padding: 14px;">
              <i data-lucide="receipt"></i> Fee Cash Counter
            </a>
            <a href="#/examinations" class="btn btn-secondary" style="justify-content: flex-start; padding: 14px;">
              <i data-lucide="file-check"></i> Report Cards
            </a>
            <a href="#/administration" class="btn btn-secondary" style="justify-content: flex-start; padding: 14px;">
              <i data-lucide="sliders"></i> Fee & Form Builder
            </a>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Institution Profile & Information</h3>
            <span class="badge badge-info">Dakshin Dinajpur</span>
          </div>
          <div style="font-size: 0.88rem; line-height: 1.6;">
            <div style="padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid var(--border-color);">
              <strong>Affiliation / Registration:</strong> Regd. No. IV 01894/2011 • Run by Thaiba Heritage, Kolkata
            </div>
            <div style="padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid var(--border-color);">
              <strong>Campus Location:</strong> Baghait, Tapan, Dakshin Dinajpur, West Bengal
            </div>
            <div>
              <strong>Super Administrator:</strong> C. M. Basith (cmbasith786@gmail.com)
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.tmsApp = new AppController();
});
