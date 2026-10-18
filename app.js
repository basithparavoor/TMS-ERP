/**
 * THAIBA MODEL SCHOOL — Main ERP Controller & Router
 * Hash Router: #/module/tab
 */

import { TMS_CONFIG } from './config.js';
import { authService } from './auth-service.js';
import { PermissionEngine } from './permission-engine.js';
import { UIComponents } from './ui-components.js';
import { dbService } from './supabase-client.js';

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
            <div class="brand-badge">${TMS_CONFIG.institution.logoBadge}</div>
            <div class="brand-info">
              <h2>${TMS_CONFIG.institution.name}</h2>
              <p>${TMS_CONFIG.institution.affiliation}</p>
            </div>
          </div>

          <nav class="sidebar-nav" id="sidebar-nav-items">
            <!-- Dynamically populated based on Role-Based Access Control -->
          </nav>

          <div class="sidebar-footer">
            <div class="user-mini-card">
              <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="Avatar">
              <div class="user-details-mini">
                <div class="name">${user.name || 'Thaiba User'}</div>
                <div class="role">${user.title || user.role}</div>
              </div>
              <button class="icon-btn" id="btn-quick-role-switch" title="Switch Demo Role" style="width: 32px; height: 32px; color: #fff;">
                <i data-lucide="refresh-cw"></i>
              </button>
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
              <div class="ticker-badge" title="Live Campus Alert">
                <i data-lucide="bell" style="width: 14px; height: 14px;"></i>
                <span>Term 1 Examinations Commencing Oct 24</span>
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
      { id: 'my-work', label: 'My Work (ThaibaHive)', icon: 'briefcase', module: 'my-work' },
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
      { id: 'administration', label: 'Administration', icon: 'settings', module: 'administration' }
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
      <a class="nav-item" href="student-admission-portal.html" target="_blank">
        <i data-lucide="external-link"></i>
        <span>Public Admission</span>
      </a>
    `;

    UIComponents.refreshIcons();
  }

  bindGlobalEvents() {
    // Mobile sidebar toggle
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

    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => UIComponents.toggleTheme());
    }

    // Logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Sign out from THAIBA MODEL SCHOOL ERP?')) {
          authService.logout();
        }
      });
    }

    // Quick demo role switcher
    const roleSwitchBtn = document.getElementById('btn-quick-role-switch');
    if (roleSwitchBtn) {
      roleSwitchBtn.addEventListener('click', () => {
        UIComponents.openModal({
          title: 'Switch Active Portal Role (Instant Evaluation)',
          bodyHtml: `
            <div style="font-size: 0.88rem; line-height: 1.5; margin-bottom: 16px;">
              Select an authorized role persona to verify permissions and scoped data views:
            </div>
            <div style="display: grid; gap: 10px;">
              <button class="btn btn-secondary role-pick-btn" data-role="admin" style="justify-content: flex-start;">
                <i data-lucide="shield"></i> <strong>School Administrator</strong> (Full Access)
              </button>
              <button class="btn btn-secondary role-pick-btn" data-role="principal" style="justify-content: flex-start;">
                <i data-lucide="award"></i> <strong>Principal & Academic Director</strong> (Dr. Zubair)
              </button>
              <button class="btn btn-secondary role-pick-btn" data-role="teacher" style="justify-content: flex-start;">
                <i data-lucide="book-open"></i> <strong>Senior Teacher</strong> (Prof. Rashid Rahman - Grade 9A)
              </button>
              <button class="btn btn-secondary role-pick-btn" data-role="finance" style="justify-content: flex-start;">
                <i data-lucide="wallet"></i> <strong>Finance Manager</strong> (Mr. Sameer Babu)
              </button>
              <button class="btn btn-secondary role-pick-btn" data-role="student" style="justify-content: flex-start;">
                <i data-lucide="graduation-cap"></i> <strong>Student</strong> (Mohammed Rayan K)
              </button>
              <button class="btn btn-secondary role-pick-btn" data-role="parent" style="justify-content: flex-start;">
                <i data-lucide="heart"></i> <strong>Parent / Guardian</strong> (Abdul Kareem)
              </button>
            </div>
          `
        });

        document.querySelectorAll('.role-pick-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const role = e.currentTarget.dataset.role;
            authService.switchRole(role);
          });
        });
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

        const matchedStudents = students.filter(s => s.fullName.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q));
        const matchedStaff = staff.filter(s => s.name.toLowerCase().includes(q) || s.empId.toLowerCase().includes(q));
        const matchedInvoices = invoices.filter(i => i.invoiceNo.toLowerCase().includes(q) || i.studentName.toLowerCase().includes(q));

        let html = '';
        if (matchedStudents.length) {
          html += `<div style="font-weight: 700; color: #3b82f6; margin: 8px 0 4px;">Students:</div>`;
          matchedStudents.forEach(s => {
            html += `<div style="padding: 6px; border-bottom: 1px solid var(--border-color);">${s.fullName} (${s.admissionNo}) — ${s.grade}</div>`;
          });
        }
        if (matchedStaff.length) {
          html += `<div style="font-weight: 700; color: #10b981; margin: 8px 0 4px;">Faculty & Staff:</div>`;
          matchedStaff.forEach(st => {
            html += `<div style="padding: 6px; border-bottom: 1px solid var(--border-color);">${st.name} (${st.designation})</div>`;
          });
        }
        if (matchedInvoices.length) {
          html += `<div style="font-weight: 700; color: #f59e0b; margin: 8px 0 4px;">Invoices:</div>`;
          matchedInvoices.forEach(inv => {
            html += `<div style="padding: 6px; border-bottom: 1px solid var(--border-color);">${inv.invoiceNo} — ${inv.studentName} (₹ ${inv.amount})</div>`;
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
    const [moduleName, tabName] = hash.split('/');
    const viewport = document.getElementById('app-viewport');
    if (!viewport) return;

    // Update active nav link
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

    const totalCollected = invoices.reduce((acc, i) => acc + (i.paid || 0), 0);

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.85rem;">THAIBA MODEL SCHOOL — Enterprise Overview</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Unified Campus Intelligence • Logged in as <strong>${user.name}</strong> (${user.title || user.role})
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <a href="#/attendance" class="btn btn-secondary"><i data-lucide="user-check"></i> Live Register</a>
            <a href="#/my-work" class="btn btn-primary"><i data-lucide="briefcase"></i> My Workspace</a>
          </div>
        </div>
      </div>

      <!-- Top KPI Row -->
      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'Total Enrolled Students', value: `${students.length}`, icon: 'users', color: 'blue', subtitle: 'Academic Session 2024-25' })}
        ${UIComponents.renderKpiCard({ title: 'Faculty & Staff', value: `${staff.length}`, icon: 'briefcase', color: 'emerald', subtitle: '96% Biometric Checked-in' })}
        ${UIComponents.renderKpiCard({ title: 'Total Fee Realization', value: `₹ ${totalCollected.toLocaleString()}`, icon: 'credit-card', color: 'amber', subtitle: 'Term 1 Reconciled' })}
        ${UIComponents.renderKpiCard({ title: 'Campus Geofence Telemetry', value: 'Active', icon: 'map-pin', color: 'rose', subtitle: '5-Min Interval Polling' })}
      </div>

      <!-- Main Operational Widgets -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 24px; margin-bottom: 24px;">
        <!-- Quick Action Hub -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Authorized Quick Actions</h3>
            <span class="badge badge-info">Role-Optimized</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <a href="#/students" class="btn btn-secondary" style="justify-content: flex-start; padding: 14px;">
              <i data-lucide="user-plus"></i> Enroll Student
            </a>
            <a href="#/attendance" class="btn btn-secondary" style="justify-content: flex-start; padding: 14px;">
              <i data-lucide="qr-code"></i> QR Punch Terminal
            </a>
            <a href="#/finance" class="btn btn-secondary" style="justify-content: flex-start; padding: 14px;">
              <i data-lucide="receipt"></i> Fee Cash Counter
            </a>
            <a href="#/examinations" class="btn btn-secondary" style="justify-content: flex-start; padding: 14px;">
              <i data-lucide="file-check"></i> Report Cards
            </a>
            <a href="#/communication" class="btn btn-secondary" style="justify-content: flex-start; padding: 14px;">
              <i data-lucide="send"></i> Post Circular
            </a>
            <a href="#/reports" class="btn btn-secondary" style="justify-content: flex-start; padding: 14px;">
              <i data-lucide="bar-chart-2"></i> Export Analytics
            </a>
          </div>
        </div>

        <!-- Campus Vital Notice -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Campus Vital Announcements</h3>
            <span class="badge badge-warning">High Priority</span>
          </div>
          <div style="font-size: 0.88rem; line-height: 1.6;">
            <div style="padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid var(--border-color);">
              <strong style="color: #ef4444;">1. Term 1 Examination Commences Oct 24:</strong> All subject teachers must finalize internal assessments and upload marks by Friday.
            </div>
            <div style="padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid var(--border-color);">
              <strong>2. Parent-Teacher Assembly:</strong> PTA general body meet scheduled for Saturday morning in the Al-Ghazali Auditorium.
            </div>
            <div>
              <strong>3. Geofence Attendance Enforcement:</strong> Staff GPS polling active with 3-minute exit grace window.
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Instantiate on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.tmsApp = new AppController();
});
