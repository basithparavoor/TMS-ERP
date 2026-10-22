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
import { AdmissionsEntryModule } from './admissions-entry-module.js';
import { NotificationCenter } from './notification-center.js';
import { TimetableModule } from './timetable-module.js';
import { CertificatesModule } from './certificates-module.js';
import { IdCardsModule } from './id-cards-module.js';
import { CalendarModule } from './calendar-module.js';
import { HomeworkModule } from './homework-module.js';
import { WhatsAppService } from './whatsapp-service.js';
import { admissionService } from './admission-service.js';
import { brandingService } from './branding-service.js';
import { checkMigration } from './migration-check.js';

/** Escape untrusted values before putting them into an HTML template. */
const esc = (v) => UIComponents.escapeHtml(v);
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

class AppController {
  constructor() {
    this.currentRoute = '';
    this.init();
  }

  async init() {
    UIComponents.initTheme();

    // Validate the server-side session before rendering or touching data.
    await authService.init();

    // Strict Authentication Guard
    if (!authService.isAuthenticated()) {
      window.location.href = 'login.html';
      return;
    }

    const currentUser = authService.getCurrentUser() || {};
    if (currentUser.role === TMS_CONFIG.roles.PARENT) {
      window.location.href = 'parent-portal.html';
      return;
    }
    if (currentUser.role === TMS_CONFIG.roles.STUDENT) {
      window.location.href = 'student-portal.html';
      return;
    }

    // Load the institute logo (cached value already applied at import time).
    brandingService.refresh().then(() => {
      const logoHost = document.getElementById('shell-logo');
      if (logoHost) logoHost.innerHTML = TMS_LOGO.emblemSvg(42);
    });

    // Warn clearly if the add-on migration has not been applied yet.
    checkMigration();

    this.renderShell();
    this.bindGlobalEvents();
    await NotificationCenter.init();

    const user = authService.getCurrentUser() || {};
    if (user.role === TMS_CONFIG.roles.OFFICE_BOY &&
        (!window.location.hash || window.location.hash === '#/dashboard' || window.location.hash === '#/')) {
      window.location.hash = '#/admissions-entry';
    }

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
            <span id="shell-logo" style="display:inline-flex;">${TMS_LOGO.emblemSvg(42)}</span>
            <div class="brand-info">
              <h2>${TMS_CONFIG.institution.name}</h2>
              <p>Thaiba Heritage, Kolkata</p>
            </div>
          </div>

          <nav class="sidebar-nav" id="sidebar-nav-items">
            <!-- Dynamically populated based on RBAC -->
          </nav>

          <div class="sidebar-footer">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;">
              <div class="user-mini-card" id="user-mini-card" role="button" tabindex="0" title="Edit my profile" style="cursor:pointer; flex: 1; min-width: 0;">
                <img id="user-mini-avatar" src="${esc(user.avatar || DEFAULT_AVATAR)}" alt="Avatar">
                <div class="user-details-mini" style="min-width: 0;">
                  <div class="name" id="user-mini-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(user.name || 'TMS Authorized')}</div>
                  <div class="role" id="user-mini-role" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(user.isSuperAdmin ? 'Super Admin' : (user.title || user.role))}</div>
                </div>
              </div>
              <button class="icon-btn" id="btn-logout" title="Sign Out" style="flex-shrink: 0; color: #ef4444; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <i data-lucide="log-out" style="width: 18px; height: 18px;"></i>
              </button>
            </div>
          </div>
        </aside>

        <!-- Main Workspace -->
        <main class="app-main">
          <!-- Topbar -->
          <header class="app-topbar">
            <div class="topbar-left">
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

              <button class="icon-btn" id="notification-bell" title="Notifications" style="position: relative;">
                <i data-lucide="bell"></i>
                <span id="notification-badge" class="badge badge-danger" style="display: none; position: absolute; top: -4px; right: -4px; font-size: 0.58rem; padding: 1px 5px; line-height: 1.4;">0</span>
              </button>
            </div>
          </header>

          <!-- Module Viewport -->
          <div class="app-viewport" id="app-viewport">
            <!-- Dynamic module content injected here -->
          </div>

          <!-- Mobile App Bottom Navigation Bar -->
          <nav class="mobile-bottom-nav no-print" id="mobile-bottom-nav">
            <a href="#/dashboard" class="mobile-nav-item" data-module="dashboard">
              <i data-lucide="layout-dashboard"></i>
              <span>Dashboard</span>
            </a>
            <a href="#/students" class="mobile-nav-item" data-module="students">
              <i data-lucide="graduation-cap"></i>
              <span>Students</span>
            </a>
            <a href="#/attendance" class="mobile-nav-item" data-module="attendance">
              <i data-lucide="user-check"></i>
              <span>Attendance</span>
            </a>
            <a href="#/finance" class="mobile-nav-item" data-module="finance">
              <i data-lucide="credit-card"></i>
              <span>Fees</span>
            </a>
            <button type="button" class="mobile-nav-item" id="mobile-menu-trigger">
              <i data-lucide="menu"></i>
              <span>Menu</span>
            </button>
          </nav>
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
      { id: 'admissions-entry', label: 'Admission Entry', icon: 'clipboard-pen', module: 'admissions-entry' },
      { id: 'students', label: 'Student Directory', icon: 'graduation-cap', module: 'students' },
      { id: 'id-cards', label: 'ID Cards & Badges', icon: 'contact-2', module: 'id-cards' },
      { id: 'attendance', label: 'Attendance & Radar', icon: 'user-check', module: 'attendance' },
      { id: 'academics', label: 'Academic & Timetable', icon: 'book-open', module: 'academics' },
      { id: 'timetable', label: 'Class Timetables', icon: 'calendar-days', module: 'timetable' },
      { id: 'homework', label: 'Homework Diary', icon: 'book-check', module: 'homework' },
      { id: 'calendar', label: 'Academic Calendar', icon: 'calendar', module: 'calendar' },
      { id: 'examinations', label: 'Exams & Reports', icon: 'award', module: 'examinations' },
      { id: 'certificates', label: 'Certificates (TC & Merit)', icon: 'file-check', module: 'certificates' },
      { id: 'finance', label: 'Finance & Accounts', icon: 'credit-card', module: 'finance' },
      { id: 'staff', label: 'Staff & HR', icon: 'users', module: 'staff' },
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
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');

    if (sidebar && backdrop) {
      if (mobileMenuTrigger) {
        mobileMenuTrigger.addEventListener('click', () => {
          sidebar.classList.toggle('open');
          backdrop.classList.toggle('active');
        });
      }
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
      });
    }

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Sign out from THAIBA MODEL SCHOOL ERP?')) {
          authService.logout();
        }
      });
    }

    const miniCard = document.getElementById('user-mini-card');
    if (miniCard) {
      miniCard.addEventListener('click', () => this.openMyProfile());
      miniCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.openMyProfile(); }
      });
    }

    // Universal Command Palette (Ctrl + K)
    const searchTrigger = document.getElementById('global-search-trigger');
    const openCommandPalette = () => {
      UIComponents.openModal({
        title: 'Universal Command Palette',
        bodyHtml: `
          <div style="margin-bottom: 12px; position: relative;">
            <input type="text" class="form-input" id="cmd-palette-input" placeholder="Search students, invoices, staff, or actions (e.g. 'kiosk', 'fees', 'tc')..." autofocus style="font-size: 1rem; padding: 12px 16px; border-radius: 10px; border-color: var(--primary);">
          </div>

          <div id="cmd-palette-results" style="max-height: 380px; overflow-y: auto; font-size: 0.85rem; padding-right: 4px;">
            <!-- Rendered by live script -->
          </div>
        `
      });

      const input = document.getElementById('cmd-palette-input');
      const results = document.getElementById('cmd-palette-results');
      if (!input || !results) return;

      const renderQuickActions = () => {
        results.innerHTML = `
          <div style="font-size: 0.74rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
            Institutional Quick Actions &amp; Navigation:
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
            <button class="btn btn-secondary btn-sm cmd-action-btn" data-action="kiosk" style="justify-content: flex-start; padding: 10px; text-align: left;">
              <i data-lucide="scan" style="color: #16a34a;"></i>
              <div><strong>Launch QR Kiosk</strong><div style="font-size: 0.7rem; color: var(--text-muted);">Attendance Terminal</div></div>
            </button>
            <button class="btn btn-secondary btn-sm cmd-action-btn" data-action="challan" style="justify-content: flex-start; padding: 10px; text-align: left;">
              <i data-lucide="layers" style="color: #2563eb;"></i>
              <div><strong>3-Part Fee Challan</strong><div style="font-size: 0.7rem; color: var(--text-muted);">Print Bank Slips</div></div>
            </button>
            <button class="btn btn-secondary btn-sm cmd-action-btn" data-action="timetable" style="justify-content: flex-start; padding: 10px; text-align: left;">
              <i data-lucide="calendar-days" style="color: #f59e0b;"></i>
              <div><strong>Class Timetable</strong><div style="font-size: 0.7rem; color: var(--text-muted);">Weekly Period Matrix</div></div>
            </button>
            <button class="btn btn-secondary btn-sm cmd-action-btn" data-action="tc" style="justify-content: flex-start; padding: 10px; text-align: left;">
              <i data-lucide="file-check" style="color: #991b1b;"></i>
              <div><strong>Transfer Certificate</strong><div style="font-size: 0.7rem; color: var(--text-muted);">Issue Official TC</div></div>
            </button>
            <button class="btn btn-secondary btn-sm cmd-action-btn" data-action="reports" style="justify-content: flex-start; padding: 10px; text-align: left;">
              <i data-lucide="award" style="color: #16a34a;"></i>
              <div><strong>Exam Gradebook</strong><div style="font-size: 0.7rem; color: var(--text-muted);">CBSE Progress Reports</div></div>
            </button>
            <button class="btn btn-secondary btn-sm cmd-action-btn" data-action="id-cards" style="justify-content: flex-start; padding: 10px; text-align: left;">
              <i data-lucide="contact-2" style="color: #16a34a;"></i>
              <div><strong>ID Cards Studio</strong><div style="font-size: 0.7rem; color: var(--text-muted);">Batch A4 Badges</div></div>
            </button>
            <button class="btn btn-secondary btn-sm cmd-action-btn" data-action="homework" style="justify-content: flex-start; padding: 10px; text-align: left;">
              <i data-lucide="book-check" style="color: #2563eb;"></i>
              <div><strong>Homework Diary</strong><div style="font-size: 0.7rem; color: var(--text-muted);">Daily Tasks &amp; Broadcast</div></div>
            </button>
            <button class="btn btn-secondary btn-sm cmd-action-btn" data-action="calendar" style="justify-content: flex-start; padding: 10px; text-align: left;">
              <i data-lucide="calendar" style="color: #9333ea;"></i>
              <div><strong>Academic Calendar</strong><div style="font-size: 0.7rem; color: var(--text-muted);">Holidays &amp; .ics Sync</div></div>
            </button>
            <button class="btn btn-secondary btn-sm cmd-action-btn" data-action="backup" style="justify-content: flex-start; padding: 10px; text-align: left;">
              <i data-lucide="database" style="color: #6366f1;"></i>
              <div><strong>Data Backup</strong><div style="font-size: 0.7rem; color: var(--text-muted);">Download Full JSON</div></div>
            </button>
          </div>
        `;
        UIComponents.refreshIcons();

        results.querySelectorAll('.cmd-action-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const act = btn.dataset.action;
            UIComponents.closeModal();
            if (act === 'kiosk') {
              window.location.hash = '#/attendance';
              setTimeout(() => document.getElementById('btn-qr-scanner')?.click(), 250);
            } else if (act === 'challan') {
              window.location.hash = '#/finance';
              setTimeout(() => document.getElementById('btn-generate-challan')?.click(), 250);
            } else if (act === 'timetable') {
              window.location.hash = '#/timetable';
            } else if (act === 'tc') {
              window.location.hash = '#/certificates';
              setTimeout(() => document.getElementById('btn-new-tc')?.click(), 250);
            } else if (act === 'id-cards') {
              window.location.hash = '#/id-cards';
            } else if (act === 'homework') {
              window.location.hash = '#/homework';
            } else if (act === 'calendar') {
              window.location.hash = '#/calendar';
            } else if (act === 'reports') {
              window.location.hash = '#/examinations';
            } else if (act === 'backup') {
              window.location.hash = '#/administration';
              setTimeout(() => document.querySelector('[data-tab="backup"]')?.click(), 300);
            }
          });
        });
      };

      renderQuickActions();

      let debounceTimer;
      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          const q = input.value.trim().toLowerCase();
          if (!q) {
            renderQuickActions();
            return;
          }

          results.innerHTML = `<div style="text-align:center; padding:16px; color:var(--text-muted); font-size:0.85rem;"><i data-lucide="loader" class="animate-spin"></i> Searching...</div>`;
          UIComponents.refreshIcons();

          const [students, invoices, staff] = await Promise.all([
            dbService.select('students'),
            dbService.select('invoices'),
            dbService.select('staff_directory')
          ]);

          const matchedStudents = students.filter(s => 
            (s.fullName || '').toLowerCase().includes(q) || 
            (s.admissionNo || '').toLowerCase().includes(q) ||
            (s.grade || '').toLowerCase().includes(q)
          ).slice(0, 5);

          const matchedInvoices = invoices.filter(i => 
            (i.invoiceNo || '').toLowerCase().includes(q) || 
            (i.studentName || '').toLowerCase().includes(q)
          ).slice(0, 5);

          const matchedStaff = staff.filter(st => 
            (st.name || '').toLowerCase().includes(q) || 
            (st.designation || '').toLowerCase().includes(q)
          ).slice(0, 4);

          let html = '';

          if (matchedStudents.length) {
            html += `<div style="font-weight: 700; color: #16a34a; font-size: 0.78rem; text-transform: uppercase; margin: 8px 0 4px;">Students (${matchedStudents.length}):</div>`;
            matchedStudents.forEach(s => {
              html += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding: 8px 10px; border-bottom: 1px solid var(--border-color); background: var(--bg-subtle, #f8fafc); border-radius: 6px; margin-bottom: 4px;">
                  <div>
                    <strong>${esc(s.fullName)}</strong>
                    <span style="color: var(--text-muted); font-size: 0.75rem; margin-left: 6px;">(${esc(s.admissionNo)} • ${esc(s.grade)})</span>
                  </div>
                  <div style="display: flex; gap: 4px;">
                    <button class="btn btn-secondary btn-sm cmd-wa-student" data-phone="${esc(s.phone || s.parentPhone || '')}" data-name="${esc(s.fullName)}" title="WhatsApp Contact" style="padding: 2px 6px; color: #16a34a;">
                      <i data-lucide="message-circle" style="width: 13px; height: 13px;"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm cmd-view-student" data-id="${esc(s.id)}" style="padding: 2px 8px; font-size: 0.72rem;">View Profile</button>
                  </div>
                </div>
              `;
            });
          }

          if (matchedInvoices.length) {
            html += `<div style="font-weight: 700; color: #2563eb; font-size: 0.78rem; text-transform: uppercase; margin: 12px 0 4px;">Fee Invoices (${matchedInvoices.length}):</div>`;
            matchedInvoices.forEach(inv => {
              html += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding: 8px 10px; border-bottom: 1px solid var(--border-color); background: var(--bg-subtle, #f8fafc); border-radius: 6px; margin-bottom: 4px;">
                  <div>
                    <span class="font-mono" style="font-weight: 700;">${esc(inv.invoiceNo)}</span>
                    <span style="margin-left: 6px;">${esc(inv.studentName)}</span>
                    <span style="color: ${inv.balance > 0 ? '#ef4444' : '#16a34a'}; font-weight: 700; margin-left: 6px;">(₹ ${(inv.balance || inv.amount || 0).toLocaleString()})</span>
                  </div>
                  <div style="display: flex; gap: 4px;">
                    ${inv.balance > 0 ? `
                      <button class="btn btn-secondary btn-sm cmd-wa-invoice" data-name="${esc(inv.studentName)}" data-inv="${esc(inv.invoiceNo)}" data-bal="${esc(inv.balance)}" data-due="${esc(inv.dueDate || '')}" title="WhatsApp Reminder" style="padding: 2px 6px; color: #16a34a;">
                        <i data-lucide="message-circle" style="width: 13px; height: 13px;"></i>
                      </button>
                    ` : ''}
                    <button class="btn btn-secondary btn-sm cmd-view-finance" style="padding: 2px 8px; font-size: 0.72rem;">Ledger</button>
                  </div>
                </div>
              `;
            });
          }

          if (matchedStaff.length) {
            html += `<div style="font-weight: 700; color: #6366f1; font-size: 0.78rem; text-transform: uppercase; margin: 12px 0 4px;">Faculty &amp; Staff (${matchedStaff.length}):</div>`;
            matchedStaff.forEach(st => {
              html += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding: 8px 10px; border-bottom: 1px solid var(--border-color); background: var(--bg-subtle, #f8fafc); border-radius: 6px; margin-bottom: 4px;">
                  <div>
                    <strong>${esc(st.name)}</strong>
                    <span style="color: var(--text-muted); font-size: 0.75rem; margin-left: 6px;">(${esc(st.designation || 'Faculty')})</span>
                  </div>
                </div>
              `;
            });
          }

          if (!html) {
            html = `<p style="color: var(--text-muted); text-align: center; padding: 24px;">No records found matching "${esc(q)}".</p>`;
          }

          results.innerHTML = html;
          UIComponents.refreshIcons();

          results.querySelectorAll('.cmd-view-student').forEach(b => {
            b.addEventListener('click', () => {
              UIComponents.closeModal();
              window.location.hash = '#/students';
            });
          });

          results.querySelectorAll('.cmd-view-finance').forEach(b => {
            b.addEventListener('click', () => {
              UIComponents.closeModal();
              window.location.hash = '#/finance';
            });
          });

          results.querySelectorAll('.cmd-wa-student').forEach(b => {
            b.addEventListener('click', () => {
              const phone = b.dataset.phone;
              const name = b.dataset.name;
              WhatsAppService.openChat(phone, `*${TMS_CONFIG.institution.name}*\nDear Parent of ${name},\nGreetings from the school administration.`);
            });
          });

          results.querySelectorAll('.cmd-wa-invoice').forEach(b => {
            b.addEventListener('click', () => {
              WhatsAppService.sendFeeReminder({
                studentName: b.dataset.name,
                invoiceNo: b.dataset.inv,
                balance: parseFloat(b.dataset.bal) || 0,
                dueDate: b.dataset.due
              });
            });
          });
        }, 150);
      });
    };

    if (searchTrigger) searchTrigger.addEventListener('click', openCommandPalette);
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCommandPalette();
      }
    });
  }

  /** Self-service profile editor available to every signed-in user. */
  async openMyProfile() {
    const user = authService.currentUser || {};
    let pendingAvatar = null;

    const bodyHtml = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
        <div class="form-group" style="grid-column:1/-1; display:flex; gap:16px; align-items:center;">
          <img id="pf-avatar" src="${esc(user.avatar || DEFAULT_AVATAR)}" alt="Avatar" style="width:76px;height:76px;border-radius:50%;object-fit:cover;border:1px solid var(--border-color);">
          <div>
            <label class="form-label">Profile Photo</label>
            <input type="file" id="pf-avatar-file" accept="image/*" class="form-input">
          </div>
        </div>
        <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="pf-name" value="${esc(user.name || '')}"></div>
        <div class="form-group"><label class="form-label">Email (read-only)</label><input class="form-input" id="pf-email" value="${esc(user.email || '')}" readonly></div>
        <div class="form-group"><label class="form-label">Designation / Title</label><input class="form-input" id="pf-title" value="${esc(user.rawTitle || '')}"></div>
        <div class="form-group"><label class="form-label">Department</label><input class="form-input" id="pf-department" value="${esc(user.rawDepartment || '')}"></div>
        <div class="form-group" style="grid-column:1/-1;"><label class="form-label">Phone</label><input class="form-input" id="pf-phone" value="${esc(user.phone || '')}"></div>
        <div class="form-group" style="grid-column:1/-1; border-top:1px solid var(--border-color); padding-top:12px;">
          <label class="form-label">Change My Password</label>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <input type="password" class="form-input" id="pf-new-password" placeholder="New password (min 6 characters)" style="flex:1; min-width:200px;">
            <button class="btn btn-secondary" id="pf-change-password"><i data-lucide="key-round"></i> Update Password</button>
          </div>
        </div>
      </div>
    `;
    const footerHtml = `
      <button class="btn btn-secondary" id="pf-cancel">Cancel</button>
      <button class="btn btn-primary" id="pf-save"><i data-lucide="save"></i> Save Profile</button>
    `;
    UIComponents.openModal({ title: 'My Profile', bodyHtml, footerHtml });

    document.getElementById('pf-avatar-file').addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      // 1. Instant local preview and fallback
      const reader = new FileReader();
      reader.onload = (re) => {
        const dataUrl = re.target.result;
        pendingAvatar = dataUrl;
        const img = document.getElementById('pf-avatar');
        if (img) img.src = dataUrl;
      };
      reader.readAsDataURL(file);

      // 2. Best-effort Supabase Storage upload
      try {
        const path = `users/${user.id}-${Date.now()}-${admissionService.sanitizeFileName(file.name)}`;
        const res = await admissionService.uploadFile('avatars', path, file);
        if (!res.error) {
          const publicUrl = admissionService.getPublicUrl('avatars', res.path);
          if (publicUrl) pendingAvatar = publicUrl;
        }
      } catch (err) {
        console.warn('Storage upload notice:', err.message);
      }

      UIComponents.showToast('Profile photo ready — click Save Profile.', 'success');
    });

    document.getElementById('pf-cancel').addEventListener('click', () => UIComponents.closeModal());

    document.getElementById('pf-change-password').addEventListener('click', async () => {
      const pw = document.getElementById('pf-new-password').value;
      if (!pw || pw.length < 6) { UIComponents.showToast('Password must be at least 6 characters.', 'warning'); return; }
      const r = await authService.changePassword(pw);
      if (r.success) {
        document.getElementById('pf-new-password').value = '';
        UIComponents.showToast('Password updated.', 'success');
      } else {
        UIComponents.showToast(`Could not update password: ${r.error}`, 'danger');
      }
    });

    document.getElementById('pf-save').addEventListener('click', async () => {
      const avatarToSave = pendingAvatar || user.avatar || DEFAULT_AVATAR;
      const fields = {
        name: document.getElementById('pf-name').value.trim(),
        title: document.getElementById('pf-title').value.trim(),
        department: document.getElementById('pf-department').value.trim(),
        phone: document.getElementById('pf-phone').value.trim(),
        avatar: avatarToSave
      };
      const r = await authService.updateOwnProfile(fields);
      if (!r.success) { UIComponents.showToast(`Could not save profile: ${r.error}`, 'danger'); return; }
      const updated = r.user || fields;
      const nameEl = document.getElementById('user-mini-name');
      const roleEl = document.getElementById('user-mini-role');
      const avatarEl = document.getElementById('user-mini-avatar');
      if (nameEl && updated.name) nameEl.innerText = updated.name;
      if (roleEl && updated.title) roleEl.innerText = updated.title;
      if (avatarEl && avatarToSave) avatarEl.src = avatarToSave;
      UIComponents.showToast('Profile updated successfully!', 'success');
      UIComponents.closeModal();
    });
    UIComponents.refreshIcons();
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

    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      if (item.dataset.module === moduleName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Close mobile drawer when navigating
    const sidebarEl = document.getElementById('app-sidebar');
    const backdropEl = document.getElementById('sidebar-backdrop');
    if (sidebarEl && backdropEl && sidebarEl.classList.contains('open')) {
      sidebarEl.classList.remove('open');
      backdropEl.classList.remove('active');
    }

    if (!PermissionEngine.canAccessModule(moduleName)) {
      viewport.innerHTML = `
        <div class="card" style="text-align: center; padding: 60px 20px;">
          <i data-lucide="shield-alert" style="width: 56px; height: 56px; color: #ef4444; margin: 0 auto 16px;"></i>
          <h2>Access Restricted by School Security Policy</h2>
          <p style="color: var(--text-muted); max-width: 500px; margin: 8px auto 20px;">
            Your authenticated role does not possess capability authorization for module: <strong>${esc(moduleName)}</strong>.
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
      case 'admissions-entry':
        await AdmissionsEntryModule.render(viewport);
        break;
      case 'students':
        await StudentModule.render(viewport);
        break;
      case 'id-cards':
        await IdCardsModule.render(viewport);
        break;
      case 'attendance':
        await AttendanceModule.render(viewport);
        break;
      case 'academics':
        await AcademicModule.render(viewport);
        break;
      case 'timetable':
        await TimetableModule.render(viewport);
        break;
      case 'homework':
        await HomeworkModule.render(viewport);
        break;
      case 'calendar':
        await CalendarModule.render(viewport);
        break;
      case 'examinations':
        await ExaminationModule.render(viewport);
        break;
      case 'certificates':
        await CertificatesModule.render(viewport);
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
    const staff = await dbService.select('staff_directory');
    const invoices = await dbService.select('invoices');
    const user = authService.getCurrentUser() || {};

    const totalCollected = invoices.reduce((acc, i) => acc + (parseFloat(i.paid) || 0), 0);

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.85rem;">THAIBA MODEL SCHOOL — Enterprise Overview</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Unified Campus Management • Welcome, <strong>${esc(user.name)}</strong> (${esc(user.isSuperAdmin ? 'Super Administrator' : user.title)})
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
            <a href="#/id-cards" class="btn btn-secondary" style="justify-content: flex-start; padding: 14px;">
              <i data-lucide="contact-2" style="color: #16a34a;"></i> ID Cards &amp; Badges Studio
            </a>
            <a href="#/homework" class="btn btn-secondary" style="justify-content: flex-start; padding: 14px;">
              <i data-lucide="book-check" style="color: #2563eb;"></i> Homework Diary
            </a>
            <a href="#/calendar" class="btn btn-secondary" style="justify-content: flex-start; padding: 14px;">
              <i data-lucide="calendar" style="color: #9333ea;"></i> Academic Calendar (.ics)
            </a>
            <a href="#/administration" class="btn btn-secondary" style="justify-content: flex-start; padding: 14px;">
              <i data-lucide="sliders"></i> Fee &amp; Form Builder
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
