const fs = require('fs');

const completeCode = `
  /* ========================================================================== */
  /* User Accounts & Window-Level Permissions (RBAC) System                     */
  /* Reference: https://tpsh.vercel.app/#users                                 */
  /* ========================================================================== */

  static async renderUsersTab(tabContent) {
    const currentUser = authService.getCurrentUser();
    const isSuperAdmin = currentUser?.isSuperAdmin === true || (currentUser?.email || '').toLowerCase() === (TMS_CONFIG.superAdminEmail || '').toLowerCase();

    let profiles = [];
    try {
      profiles = await dbService.select('profiles');
    } catch (e) {
      profiles = [];
    }

    // Admin-visible login identifiers issued to staff and parents
    let creds = [];
    try { creds = await dbService.select('staff_credentials'); } catch (e) { creds = []; }
    let parentCreds = [];
    try { parentCreds = await dbService.select('parent_credentials'); } catch (e) { parentCreds = []; }
    const loginByUser = {};
    parentCreds.forEach((c) => { if (c.userId) loginByUser[c.userId] = c; });
    creds.forEach((c) => { if (c.userId) loginByUser[c.userId] = c; });
    this._loginByUser = loginByUser;

    let students = [];
    try { students = await dbService.select('students'); } catch (e) { students = []; }
    this._allStudents = students;

    // Filter lists
    const pendingList = profiles.filter((p) => p.role === 'pending' || p.approvalStatus === 'pending');
    const approvedList = profiles.filter((p) => p.role !== 'pending' && p.role !== 'rejected' && p.isActive !== false);
    const suspendedList = profiles.filter((p) => p.role === 'rejected' || p.approvalStatus === 'rejected' || p.isActive === false);

    this._pendingApprovalsCount = pendingList.length;
    this.refreshPendingBadges();

    if (!this._usersCurrentTab) {
      this._usersCurrentTab = pendingList.length > 0 ? 'pending' : 'active';
    }
    const currentTab = this._usersCurrentTab;
    if (!this._rbacActiveRole) {
      this._rbacActiveRole = 'teacher';
    }

    tabContent.innerHTML = \`
      <div style="display:flex; flex-direction:column; gap:16px;">
        <!-- Header -->
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:0;">
          <div class="page-title-group">
            <h2 style="font-size:1.4rem; font-weight:800; color:var(--text-main); margin:0;">User Accounts &amp; Permissions</h2>
            <p style="font-size:0.85rem; color:var(--text-muted); margin:4px 0 0 0;">
              Institutional identity governance, pending approval queue, role definitions, and customized window-level access control.
            </p>
          </div>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" id="btn-config-cred-share">
              <i data-lucide="message-square"></i> Share Credentials
            </button>
            <button class="btn btn-secondary btn-sm" id="btn-refresh-users">
              <i data-lucide="refresh-cw"></i> Refresh
            </button>
          </div>
        </div>

        <!-- Pending Approvals Alert Banner (if any) -->
        \${pendingList.length > 0 ? \`
          <div class="users-pending-alert-banner" style="background:#fffbeb; border:1px solid #fde68a; border-radius:12px; padding:0.9rem 1.15rem; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <span style="font-size:1.35rem;">⚠️</span>
              <div>
                <strong style="color:#b45309; font-size:0.92rem;">\${pendingList.length} Account(s) Awaiting Approval</strong>
                <p style="font-size:0.8rem; color:#92400E; margin:2px 0 0 0;">These users have authenticated with Google or submitted registration but are blocked until approved.</p>
              </div>
            </div>
            <button class="btn btn-sm btn-primary" id="btn-jump-pending" style="font-size:0.78rem; font-weight:700;">
              Review Applications
            </button>
          </div>
        \` : ''}

        <!-- Main Card Panel with Sub-Tabs -->
        <div class="card" style="padding:0; overflow:hidden;">
          <div class="card-header" style="padding:0.75rem 1rem; border-bottom:1px solid var(--border-color); background:var(--bg-surface);">
            <div class="user-sub-tabs-bar" style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
              <button class="btn \${currentTab === 'pending' ? 'btn-primary' : 'btn-secondary'} btn-sm tab-sub-btn" data-subtab="pending">
                <span class="tab-label-full">Pending Approvals (\${pendingList.length})</span>
                <span class="tab-label-short">Pending (\${pendingList.length})</span>
              </button>
              <button class="btn \${currentTab === 'active' ? 'btn-primary' : 'btn-secondary'} btn-sm tab-sub-btn" data-subtab="active">
                <span class="tab-label-full">Active Accounts (\${approvedList.length})</span>
                <span class="tab-label-short">Active (\${approvedList.length})</span>
              </button>
              <button class="btn \${currentTab === 'suspended' ? 'btn-primary' : 'btn-secondary'} btn-sm tab-sub-btn" data-subtab="suspended">
                <span class="tab-label-full">Suspended Accounts (\${suspendedList.length})</span>
                <span class="tab-label-short">Suspended (\${suspendedList.length})</span>
              </button>
              <button class="btn \${currentTab === 'rbac' ? 'btn-primary' : 'btn-secondary'} btn-sm tab-sub-btn" data-subtab="rbac" style="display:inline-flex; align-items:center; gap:5px;">
                <i data-lucide="shield-check" style="width:14px;height:14px;"></i>
                <span class="tab-label-full">Assign Windows (RBAC)</span>
                <span class="tab-label-short">RBAC</span>
              </button>
            </div>
          </div>

          <div class="card-body" style="padding:1.25rem;" id="users-tab-subcontent">
            <!-- Subcontent renders here -->
          </div>
        </div>
      </div>
    \`;

    // Render Subcontent
    const subContainer = document.getElementById('users-tab-subcontent');
    if (currentTab === 'rbac') {
      this.renderRbacMatrixView(subContainer, profiles, isSuperAdmin);
    } else if (currentTab === 'pending') {
      this.renderPendingUsersView(subContainer, pendingList, isSuperAdmin);
    } else if (currentTab === 'suspended') {
      this.renderAccountListView(subContainer, suspendedList, isSuperAdmin, 'suspended');
    } else {
      this.renderAccountListView(subContainer, approvedList, isSuperAdmin, 'active');
    }

    // Attach Tab Bar events
    tabContent.querySelectorAll('.tab-sub-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._usersCurrentTab = btn.dataset.subtab;
        this.renderUsersTab(tabContent);
      });
    });

    safeOn('btn-jump-pending', 'click', () => {
      this._usersCurrentTab = 'pending';
      this.renderUsersTab(tabContent);
    });

    safeOn('btn-refresh-users', 'click', () => {
      this.renderUsersTab(tabContent);
      UIComponents.showToast('User accounts refreshed', 'info');
    });

    safeOn('btn-config-cred-share', 'click', () => {
      this.openCredentialTemplateModal();
    });

    UIComponents.refreshIcons();
  }

  /**
   * Pending Users Approval Queue
   */
  static renderPendingUsersView(container, pendingList, isSuperAdmin) {
    if (pendingList.length === 0) {
      container.innerHTML = \`
        <div class="empty-state" style="padding:3.5rem 1rem; text-align:center;">
          <div style="width:54px; height:54px; border-radius:50%; background:#ecfdf5; color:#059669; font-size:24px; display:inline-flex; align-items:center; justify-content:center; margin-bottom:12px;">✓</div>
          <h4 style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin:0;">Queue Clear</h4>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">There are no pending user authorization requests at this time.</p>
        </div>
      \`;
      return;
    }

    container.innerHTML = \`
      <!-- Desktop Table -->
      <div class="desktop-user-table table-responsive">
        <table class="tms-table" style="font-size:0.85rem;">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            \${pendingList.map((p) => {
              const isParent = p.role === 'parent';
              return \`
                <tr data-id="\${esc(p.id)}">
                  <td style="font-weight:600;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <img src="\${esc(p.avatar || '')}" alt="" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:1px solid var(--border-color);background:#f1f5f9;">
                      <div>
                        <span>\${esc(p.name || 'Pending Applicant')}</span>
                        \${isParent ? '<span class="badge" style="background:#eff6ff; color:#1d4ed8; font-size:0.65rem; margin-left:4px; font-weight:700;">PARENT APPLICANT</span>' : ''}
                      </div>
                    </div>
                  </td>
                  <td class="font-mono" style="font-size:0.78rem;">\${esc(p.email || '—')}</td>
                  <td style="font-size:0.78rem;">\${esc(p.phone || '—')}</td>
                  <td><span class="badge badge-warning">Pending Approval</span></td>
                  <td>
                    <div style="display:flex; gap:6px;">
                      <button class="btn btn-sm btn-primary btn-approve-user" data-id="\${esc(p.id)}" data-role="\${esc(p.role || (isParent ? 'parent' : 'teacher'))}">
                        \${isParent ? 'Approve & Assign Children' : 'Approve & Assign Role'}
                      </button>
                      <button class="btn btn-sm btn-secondary btn-reject-user" data-id="\${esc(p.id)}" style="color:#dc2626; border-color:#fecaca;">
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              \`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="mobile-user-cards">
        \${pendingList.map((p) => {
          const isParent = p.role === 'parent';
          return \`
            <div class="user-card-item">
              <div class="user-card-header">
                <img src="\${esc(p.avatar || '')}" alt="" style="width:40px;height:40px;border-radius:10px;object-fit:cover;background:#f1f5f9;">
                <div>
                  <div class="user-card-name">\${esc(p.name || 'Pending Applicant')}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted);">\${esc(p.email || '—')}</div>
                </div>
              </div>
              <div class="user-card-contact">
                <div class="user-card-contact-item">📞 \${esc(p.phone || 'No phone recorded')}</div>
                <div class="user-card-contact-item">Status: <span class="badge badge-warning" style="font-size:0.7rem;">Pending Approval</span></div>
              </div>
              <div class="user-card-actions">
                <button class="btn btn-sm btn-primary btn-approve-user" data-id="\${esc(p.id)}" data-role="\${esc(p.role || (isParent ? 'parent' : 'teacher'))}">
                  \${isParent ? 'Approve & Children' : 'Approve & Assign Role'}
                </button>
                <button class="btn btn-sm btn-secondary btn-reject-user" data-id="\${esc(p.id)}" style="color:#dc2626; border-color:#fecaca;">Reject</button>
              </div>
            </div>
          \`;
        }).join('')}
      </div>
    \`;

    // Events
    container.querySelectorAll('.btn-approve-user').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = pendingList.find((u) => u.id === btn.dataset.id);
        if (p) this.openChangeRoleModal(p, true);
      });
    });

    container.querySelectorAll('.btn-reject-user').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const p = pendingList.find((u) => u.id === id);
        if (!confirm(\`Reject access for \${p?.name || p?.email}?\`)) return;
        await dbService.update('profiles', id, { role: 'rejected', approvalStatus: 'rejected', isActive: false });
        await auditService.log('USER_REJECTED', 'GOVERNANCE', { userId: id });
        UIComponents.showToast('Account application rejected', 'warning');
        const mainContent = document.getElementById('tab-content');
        if (mainContent) this.renderUsersTab(mainContent);
      });
    });
  }

  /**
   * Active and Suspended User Accounts Directory
   */
  static renderAccountListView(container, list, isSuperAdmin, type) {
    if (!this._userFilterQuery) this._userFilterQuery = '';
    if (!this._userFilterRole) this._userFilterRole = 'all';

    const q = (this._userFilterQuery || '').toLowerCase().trim();
    const rf = this._userFilterRole;

    const filtered = list.filter((p) => {
      if (rf !== 'all' && p.role !== rf) return false;
      if (!q) return true;
      const name = (p.name || '').toLowerCase();
      const email = (p.email || '').toLowerCase();
      const phone = (p.phone || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });

    const loginByUser = this._loginByUser || {};

    container.innerHTML = \`
      <!-- Search & Filters Toolbar -->
      <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:1rem; flex-wrap:wrap;">
        <div style="display:flex; gap:8px; align-items:center; flex:1; min-width:240px;">
          <input type="text" class="form-input" id="input-user-search" placeholder="Search by name, email or phone..." value="\${esc(this._userFilterQuery)}" style="max-width:320px; font-size:0.85rem;">
          <select class="form-select" id="select-user-role-filter" style="max-width:200px; font-size:0.85rem;">
            <option value="all">All Roles (\${list.length})</option>
            \${WINDOW_ROLES.map((r) => \`<option value="\${r.key}" \${rf === r.key ? 'selected' : ''}>\${r.label}</option>\`).join('')}
            <option value="principal" \${rf === 'principal' ? 'selected' : ''}>Principal</option>
            <option value="coordinator" \${rf === 'coordinator' ? 'selected' : ''}>Coordinator</option>
            <option value="finance" \${rf === 'finance' ? 'selected' : ''}>Finance</option>
            <option value="hr" \${rf === 'hr' ? 'selected' : ''}>HR</option>
            <option value="librarian" \${rf === 'librarian' ? 'selected' : ''}>Librarian</option>
            <option value="operations" \${rf === 'operations' ? 'selected' : ''}>Operations</option>
            <option value="office_boy" \${rf === 'office_boy' ? 'selected' : ''}>Office Boy</option>
          </select>
        </div>
        <div style="font-size:0.8rem; color:var(--text-muted);">
          Showing <strong>\${filtered.length}</strong> of \${list.length} accounts
        </div>
      </div>

      \${filtered.length === 0 ? \`
        <div class="empty-state" style="padding:2.5rem 1rem; text-align:center;">
          <p style="color:var(--text-muted); font-size:0.88rem;">No accounts match the current filter criteria.</p>
        </div>
      \` : \`
        <!-- Desktop Table View -->
        <div class="desktop-user-table table-responsive">
          <table class="tms-table" style="font-size:0.85rem;">
            <thead>
              <tr>
                <th>User Account</th>
                <th>Role</th>
                <th>Window Permissions</th>
                <th>Login ID / Credential</th>
                <th>Class / Unit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              \${filtered.map((p) => {
                const login = loginByUser[p.id];
                const email = (p.email || '').toLowerCase();
                const superAdminEmail = (TMS_CONFIG.superAdminEmail || '').toLowerCase();
                const isTargetSuper = email === superAdminEmail || p.role === 'super_admin' || p.is_super_admin === true || p.isSuperAdmin === true;
                const canModify = isSuperAdmin || !isTargetSuper;

                const customPerms = WindowPermissionsService.getUserCustomPermissions(p.id);
                const hasCustom = customPerms && Object.keys(customPerms).length > 0;
                const theme = ROLE_THEMES[p.role] || ROLE_THEMES.teacher;

                return \`
                  <tr data-id="\${esc(p.id)}">
                    <td style="font-weight:600;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <img src="\${esc(p.avatar || '')}" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:1px solid var(--border-color);background:#f1f5f9;">
                        <div>
                          <div style="display:flex; align-items:center; gap:5px;">
                            <span>\${esc(p.name || '—')}</span>
                            \${isTargetSuper ? '<span class="badge" style="background:#0F172A; color:#FFFFFF; font-size:0.6rem; padding:2px 5px; font-weight:700;">SUPER ADMIN</span>' : ''}
                          </div>
                          <div class="font-mono" style="font-size:0.75rem; color:var(--text-muted);">\${esc(p.email || '—')}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge" style="background:\${theme.badgeBg}; color:\${theme.badgeColor}; border:1px solid \${theme.border}; font-weight:700; font-size:0.72rem;">
                        \${esc(ROLE_LABELS[p.role] || p.role || 'Staff').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      \${hasCustom ? \`
                        <span class="badge" style="background:#d1fae5; color:#065f46; border:1px solid #a7f3d0; font-weight:700; font-size:0.65rem;" title="Individual window permissions active">
                          CUSTOM PERMS
                        </span>
                      \` : \`
                        <span style="font-size:0.75rem; color:var(--text-muted);">(Role Default)</span>
                      \`}
                    </td>
                    <td style="font-size:0.78rem;">
                      \${login && login.username ? \`
                        <div style="display:flex; flex-direction:column; gap:3px;">
                          <div style="display:flex; align-items:center; gap:5px;">
                            <span class="font-mono" style="font-weight:700;">\${esc(login.username)}</span>
                            <button class="btn btn-secondary btn-sm btn-reveal-pass" data-user="\${esc(p.id)}" title="Show password" style="padding:1px 5px;"><i data-lucide="eye" style="width:11px;height:11px;"></i></button>
                            <span class="user-pass font-mono" data-user="\${esc(p.id)}" style="display:none; color:#b45309; font-weight:700;">\${esc(login.password || '—')}</span>
                          </div>
                          <div style="display:flex; gap:4px; align-items:center; margin-top:2px;">
                            <button class="btn btn-secondary btn-sm btn-copy-user-cred" data-user="\${esc(p.id)}" title="Copy login" style="padding:1px 6px; font-size:0.7rem; color:#0284c7; border-color:#bae6fd;">
                              <i data-lucide="share-2" style="width:10px;height:10px;"></i> Copy
                            </button>
                            \${p.phone ? \`
                              <button class="btn btn-secondary btn-sm btn-wa-user-cred" data-user="\${esc(p.id)}" title="WhatsApp" style="padding:1px 6px; font-size:0.7rem; color:#16a34a; border-color:#bbf7d0;">
                                <i data-lucide="send" style="width:10px;height:10px;"></i> WA
                              </button>
                            \` : ''}
                          </div>
                        </div>
                      \` : '<span style="color:var(--text-muted);">—</span>'}
                    </td>
                    <td style="font-size:0.78rem;">\${esc([p.assignedClass, p.assignedSection].filter(Boolean).join(' / ') || '—')}</td>
                    <td>
                      \${p.isActive !== false ? \`
                        <span style="display:inline-flex; align-items:center; gap:5px; font-size:0.75rem; color:#059669; font-weight:600;">
                          <span style="width:7px; height:7px; border-radius:50%; background:#10B981;"></span> Active
                        </span>
                      \` : \`
                        <span style="display:inline-flex; align-items:center; gap:5px; font-size:0.75rem; color:#dc2626; font-weight:600;">
                          <span style="width:7px; height:7px; border-radius:50%; background:#dc2626;"></span> Suspended
                        </span>
                      \`}
                    </td>
                    <td style="white-space:nowrap;">
                      \${!canModify ? \`
                        <span style="font-size:0.72rem; color:var(--text-muted); font-style:italic;">Root Protected</span>
                      \` : \`
                        <div style="display:flex; gap:4px; align-items:center; flex-wrap:wrap;">
                          <!-- Permissions button: exact modal from screenshot -->
                          <button class="btn btn-secondary btn-sm btn-perm" data-id="\${esc(p.id)}" title="Customize Window Permissions" style="color:#059669; border-color:#a7f3d0; background:#f0fdf4;">
                            <i data-lucide="sliders" style="width:12px;height:12px;"></i> Permissions
                          </button>
                          <button class="btn btn-secondary btn-sm btn-change-role" data-id="\${esc(p.id)}" title="Assign Role & Details">
                            <i data-lucide="shield" style="width:12px;height:12px;"></i> Role
                          </button>
                          <button class="btn btn-secondary btn-sm btn-edit-user" data-id="\${esc(p.id)}" title="Edit Profile & Details">
                            <i data-lucide="user-cog" style="width:12px;height:12px;"></i> Profile
                          </button>
                          <button class="btn btn-secondary btn-sm btn-toggle-suspend" data-id="\${esc(p.id)}" style="\${p.isActive === false ? 'color:#059669; border-color:#a7f3d0;' : 'color:#dc2626; border-color:#fecaca;'}">
                            \${p.isActive === false ? 'Activate' : 'Suspend'}
                          </button>
                        </div>
                      \`}
                    </td>
                  </tr>
                \`;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Mobile Responsive Cards View -->
        <div class="mobile-user-cards">
          \${filtered.map((p) => {
            const email = (p.email || '').toLowerCase();
            const superAdminEmail = (TMS_CONFIG.superAdminEmail || '').toLowerCase();
            const isTargetSuper = email === superAdminEmail || p.role === 'super_admin' || p.is_super_admin === true || p.isSuperAdmin === true;
            const canModify = isSuperAdmin || !isTargetSuper;
            const customPerms = WindowPermissionsService.getUserCustomPermissions(p.id);
            const hasCustom = customPerms && Object.keys(customPerms).length > 0;
            const theme = ROLE_THEMES[p.role] || ROLE_THEMES.teacher;

            return \`
              <div class="user-card-item">
                <div class="user-card-header">
                  <img src="\${esc(p.avatar || '')}" alt="" style="width:40px;height:40px;border-radius:10px;object-fit:cover;background:#f1f5f9;">
                  <div style="flex:1; min-width:0;">
                    <div class="user-card-name-row">
                      <span class="user-card-name">\${esc(p.name || 'User')}</span>
                      \${isTargetSuper ? '<span class="badge" style="background:#0F172A; color:#FFF; font-size:0.6rem; padding:2px 5px; font-weight:700;">SUPER ADMIN</span>' : ''}
                      \${hasCustom ? '<span class="badge" style="background:#D1FAE5; color:#065F46; font-size:0.6rem; padding:2px 5px; font-weight:700;">CUSTOM PERMS</span>' : ''}
                    </div>
                    <div class="user-card-meta-row">
                      <span class="badge" style="background:\${theme.badgeBg}; color:\${theme.badgeColor}; font-size:0.68rem; padding:2px 6px; font-weight:700;">
                        \${esc(ROLE_LABELS[p.role] || p.role || 'Staff').toUpperCase()}
                      </span>
                      \${p.isActive !== false ? \`
                        <span style="font-size:0.72rem; color:#059669; font-weight:600;">● Active</span>
                      \` : \`
                        <span style="font-size:0.72rem; color:#dc2626; font-weight:600;">● Suspended</span>
                      \`}
                    </div>
                  </div>
                </div>

                <div class="user-card-contact">
                  <div class="user-card-contact-item">✉️ \${esc(p.email || '—')}</div>
                  \${p.phone ? \`<div class="user-card-contact-item">📞 \${esc(p.phone)}</div>\` : ''}
                </div>

                <div class="user-card-actions">
                  \${canModify ? \`
                    <button class="btn btn-sm btn-secondary btn-perm" data-id="\${esc(p.id)}" style="color:#059669; border-color:#a7f3d0; background:#f0fdf4;">
                      Permissions
                    </button>
                    <button class="btn btn-sm btn-secondary btn-change-role" data-id="\${esc(p.id)}">Role</button>
                    <button class="btn btn-sm btn-secondary btn-edit-user" data-id="\${esc(p.id)}">Profile</button>
                    <button class="btn btn-sm btn-secondary btn-toggle-suspend" data-id="\${esc(p.id)}" style="\${p.isActive === false ? 'color:#059669;' : 'color:#dc2626;'}">
                      \${p.isActive === false ? 'Activate' : 'Suspend'}
                    </button>
                  \` : '<span style="font-size:0.72rem; color:var(--text-muted); font-style:italic;">Protected Account</span>'}
                </div>
              </div>
            \`;
          }).join('')}
        </div>
      \`}
    \`;

    // Filter Listeners
    const searchInput = container.querySelector('#input-user-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this._userFilterQuery = e.target.value;
        this.renderAccountListView(container, list, isSuperAdmin, type);
      });
    }

    const roleSelect = container.querySelector('#select-user-role-filter');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        this._userFilterRole = e.target.value;
        this.renderAccountListView(container, list, isSuperAdmin, type);
      });
    }

    // Attach actions
    container.querySelectorAll('.btn-perm').forEach((b) => {
      b.addEventListener('click', () => {
        const id = b.dataset.id;
        const profile = list.find((p) => p.id === id);
        if (profile) this.openCustomizeWindowPermissionsModal(profile);
      });
    });

    container.querySelectorAll('.btn-change-role').forEach((b) => {
      b.addEventListener('click', () => {
        const id = b.dataset.id;
        const profile = list.find((p) => p.id === id);
        if (profile) this.openChangeRoleModal(profile);
      });
    });

    container.querySelectorAll('.btn-edit-user').forEach((b) => {
      b.addEventListener('click', () => {
        const id = b.dataset.id;
        const profile = list.find((p) => p.id === id);
        if (profile) this.openUserEditModal(profile);
      });
    });

    container.querySelectorAll('.btn-toggle-suspend').forEach((b) => {
      b.addEventListener('click', async () => {
        const id = b.dataset.id;
        const profile = list.find((p) => p.id === id);
        if (!profile) return;
        const willActivate = profile.isActive === false;
        await dbService.update('profiles', id, { isActive: willActivate, approvalStatus: willActivate ? 'approved' : 'suspended' });
        await auditService.log(willActivate ? 'USER_ACTIVATED' : 'USER_SUSPENDED', 'GOVERNANCE', { userId: id });
        UIComponents.showToast(\`Account \${willActivate ? 'activated' : 'suspended'}.\`, willActivate ? 'success' : 'warning');
        const mainContent = document.getElementById('tab-content');
        if (mainContent) this.renderUsersTab(mainContent);
      });
    });

    // Credential sharing events
    container.querySelectorAll('.btn-copy-user-cred').forEach((b) => {
      b.addEventListener('click', () => {
        const userId = b.dataset.user;
        const profile = list.find((p) => p.id === userId);
        const login = loginByUser[userId];
        if (login) {
          this.copyCredentialMessageToClipboard({
            name: profile?.name || 'User',
            role: profile?.role || 'staff',
            username: login.username,
            password: login.password,
            customUrl: \`\${this.getCredentialShareConfig().domain}/login.html\`
          });
        }
      });
    });

    container.querySelectorAll('.btn-wa-user-cred').forEach((b) => {
      b.addEventListener('click', () => {
        const userId = b.dataset.user;
        const profile = list.find((p) => p.id === userId);
        const login = loginByUser[userId];
        if (login) {
          const msg = this.compileCredentialMessage({
            name: profile?.name || 'User',
            role: profile?.role || 'staff',
            username: login.username,
            password: login.password,
            customUrl: \`\${this.getCredentialShareConfig().domain}/login.html\`
          });
          const ph = WhatsAppService.cleanPhone(profile?.phone);
          window.open(ph ? \`https://wa.me/\${ph}?text=\${encodeURIComponent(msg)}\` : \`https://wa.me/?text=\${encodeURIComponent(msg)}\`, '_blank');
        }
      });
    });

    container.querySelectorAll('.btn-reveal-pass').forEach((b) => {
      b.addEventListener('click', () => {
        const userId = b.dataset.user || '';
        const span = Array.from(container.querySelectorAll('.user-pass')).find((el) => el.dataset.user === userId);
        if (span) span.style.display = span.style.display === 'none' ? 'inline' : 'none';
      });
    });

    UIComponents.refreshIcons();
  }

  /**
   * Assign Windows (RBAC) View
   */
  static renderRbacMatrixView(container, profiles, isSuperAdmin) {
    let matrix = WindowPermissionsService.getRoleMatrix();
    let activeRole = this._rbacActiveRole || 'teacher';

    const countRolePerms = (roleKey) => {
      const perms = matrix[roleKey] || {};
      let full = 0;
      let view = 0;
      let off = 0;
      for (const cat of WINDOW_CATEGORIES) {
        for (const mod of cat.modules) {
          const state = perms[mod.key] || 'off';
          if (state === 'full') full++;
          else if (state === 'view') view++;
          else off++;
        }
      }
      return { full, view, off };
    };

    const draw = () => {
      const activeRoleObj = WINDOW_ROLES.find((r) => r.key === activeRole) || WINDOW_ROLES[1];
      const stats = countRolePerms(activeRole);
      const activePerms = matrix[activeRole] || {};

      container.innerHTML = \`
        <div class="rbac-container">
          <!-- Role Selection Pills -->
          <div style="margin-bottom: 1.25rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.6rem;">
              Select Role to Configure Windows:
            </div>
            <div class="role-pill-nav">
              \${WINDOW_ROLES.map((r) => {
                const s = countRolePerms(r.key);
                return \`
                  <button type="button" class="role-pill-btn \${r.key === activeRole ? 'active' : ''}" data-role-key="\${r.key}">
                    <span class="role-pill-icon">\${r.icon}</span>
                    <span>\${r.label}</span>
                    <span class="role-pill-badge">
                      \${s.full} Full • \${s.view} View
                    </span>
                  </button>
                \`;
              }).join('')}
            </div>
          </div>

          <!-- Active Role Header & Switch Legend -->
          <div style="background: #F8FAFC; border: 1.5px solid var(--border-color); border-radius: 14px; padding: 1.15rem 1.35rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <div class="role-avatar-badge">
                \${activeRoleObj.icon.replace('width=\"18\" height=\"18\"', 'width=\"24\" height=\"24\"')}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                  <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: #0F172A;">\${activeRoleObj.label}</h3>
                  <span class="badge" style="background:#d1fae5; color:#065f46; font-size:0.72rem; padding:0.2rem 0.55rem; font-weight:700;">
                    \${stats.full} Full Access
                  </span>
                  <span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; font-size:0.72rem; padding:0.2rem 0.55rem; font-weight:700;">
                    \${stats.view} View Only
                  </span>
                  <span class="badge" style="background:#f1f5f9; color:#64748b; font-size:0.72rem; padding:0.2rem 0.55rem; font-weight:700;">
                    \${stats.off} Off
                  </span>
                </div>
                <div style="font-size: 0.78rem; color: #64748B; margin-top: 4px;">
                  \${activeRoleObj.subtitle}
                </div>
              </div>
            </div>

            <!-- Micro Legend -->
            <div style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.75rem; color: #64748B; flex-wrap: wrap;">
              <span><strong style="color: #0F172A;">Switch:</strong></span>
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #CBD5E1;"></span>
                <span>Gray (Left) = Off</span>
              </span>
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #EAB308;"></span>
                <span style="font-weight: 600; color: #854D0E;">Yellow (Center) = View Only</span>
              </span>
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981;"></span>
                <span style="font-weight: 600; color: #065F46;">Green (Right) = Full Access</span>
              </span>
              <span style="color: #059669; font-weight: 600;">• Tap card to cycle</span>
            </div>
          </div>

          <!-- Window Categories & Modules Grid -->
          <div class="window-categories-list">
            \${WINDOW_CATEGORIES.map((cat) => \`
              <div class="perm-category-card">
                <div class="perm-category-header">
                  <div class="perm-category-title">
                    <span class="perm-category-icon">\${cat.icon}</span>
                    <span>\${cat.title}</span>
                  </div>
                  <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">\${cat.modules.length} Windows</span>
                </div>
                <div class="perm-grid">
                  \${cat.modules.map((mod) => {
                    const state = activePerms[mod.key] || 'off';
                    return \`
                      <div class="perm-item state-\${state} rbac-perm-card" data-mod-key="\${mod.key}" title="\${mod.label} • Click to cycle">
                        <div class="perm-item-left">
                          <div class="perm-item-icon">\${mod.icon}</div>
                          <div class="perm-item-info">
                            <span class="perm-item-name">\${mod.label}</span>
                            <span class="perm-item-desc">\${mod.desc}</span>
                          </div>
                        </div>
                        <div class="perm-switch pos-\${state}" data-mod-key="\${mod.key}"></div>
                      </div>
                    \`;
                  }).join('')}
                </div>
              </div>
            \`).join('')}
          </div>

          <!-- Bottom Actions Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color); flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" id="btn-rbac-reset-defaults" style="color: #475569;">
              <i data-lucide="rotate-ccw"></i> Reset \${activeRoleObj.label} to Defaults
            </button>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-secondary btn-sm" id="btn-rbac-grant-all">
                Grant All Windows Full
              </button>
              <button class="btn btn-primary btn-sm" id="btn-rbac-save-matrix" style="font-weight: 700; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);">
                <i data-lucide="save"></i> Save Role Assignments
              </button>
            </div>
          </div>
        </div>
      \`;

      // Role Pill Click Events
      container.querySelectorAll('.role-pill-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeRole = btn.dataset.roleKey;
          this._rbacActiveRole = activeRole;
          draw();
        });
      });

      // Card Cycle Click Events (Off -> View Only -> Full Access -> Off)
      container.querySelectorAll('.rbac-perm-card').forEach((card) => {
        card.addEventListener('click', () => {
          const modKey = card.dataset.modKey;
          if (!modKey) return;
          if (!matrix[activeRole]) matrix[activeRole] = {};
          const current = matrix[activeRole][modKey] || 'off';
          let next = 'view';
          if (current === 'off') next = 'view';
          else if (current === 'view') next = 'full';
          else next = 'off';

          matrix[activeRole][modKey] = next;
          matrix[activeRole].dashboard = 'full';
          draw();
        });
      });

      // Bottom Bar Action Handlers
      safeOn('btn-rbac-reset-defaults', 'click', () => {
        const sysDefaults = WindowPermissionsService.getSystemDefaults();
        matrix[activeRole] = { ...(sysDefaults[activeRole] || sysDefaults.teacher || {}) };
        draw();
        UIComponents.showToast(\`Reset \${activeRoleObj.label} back to system defaults\`, 'info');
      });

      safeOn('btn-rbac-grant-all', 'click', () => {
        if (!matrix[activeRole]) matrix[activeRole] = {};
        for (const cat of WINDOW_CATEGORIES) {
          for (const mod of cat.modules) {
            matrix[activeRole][mod.key] = 'full';
          }
        }
        matrix[activeRole].dashboard = 'full';
        draw();
        UIComponents.showToast(\`Granted Full Access on all windows for \${activeRoleObj.label}\`, 'info');
      });

      safeOn('btn-rbac-save-matrix', 'click', async () => {
        WindowPermissionsService.saveRoleMatrix(matrix);
        await auditService.log('RBAC_ROLE_MATRIX_SAVED', 'GOVERNANCE', { role: activeRole });
        UIComponents.showToast(\`Role window permissions saved successfully!\`, 'success');
        draw();
      });

      UIComponents.refreshIcons();
    };

    draw();
  }

  /**
   * ==========================================================================
   * CUSTOMIZE WINDOW PERMISSIONS MODAL (MATCHING SCREENSHOT IDENTICALLY)
   * Reference: https://tpsh.vercel.app/#users
   * ==========================================================================
   */
  static openCustomizeWindowPermissionsModal(p) {
    const roleKey = p.role || 'teacher';
    const roleObj = WINDOW_ROLES.find((r) => r.key === roleKey) || WINDOW_ROLES[1];
    const roleDefaults = (WindowPermissionsService.getRoleMatrix()[roleKey]) || {};

    // Get current overrides or clone
    let userOverrides = { ...(WindowPermissionsService.getUserCustomPermissions(p.id) || {}) };

    const getState = (modKey) => {
      if (userOverrides[modKey] !== undefined) return userOverrides[modKey];
      return roleDefaults[modKey] || 'off';
    };

    const title = \`Customize Window Permissions: \${p.name || p.email}\`;

    const bodyHtml = \`
      <div style="margin-bottom: 1.25rem;">
        <!-- User Info Banner -->
        <div style="background: #F8FAFC; border: 1.5px solid var(--border-color); border-radius: 12px; padding: 0.85rem 1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 38px; height: 38px; border-radius: 50%; overflow: hidden; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #0f172a; border: 1px solid var(--border-color);">
              \${p.avatar ? \`<img src="\${esc(p.avatar)}" style="width:100%;height:100%;object-fit:cover;" alt=""/>\` : (p.name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <strong style="font-size: 0.95rem; color: #0F172A;">\${esc(p.name || 'User')}</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">
                \${esc(p.email || '—')} • Role: <span class="badge" style="background:#D1FAE5; color:#065F46; border:1px solid #A7F3D0; font-weight:700; font-size:0.72rem;">\${(p.role || 'STAFF').toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" id="btn-modal-reset-defaults" style="color: #475569; font-size:0.75rem;" title="Reset this user's windows back to \${roleObj.label} defaults">
              Reset to Role Defaults
            </button>
          </div>
        </div>

        <!-- Description Hint Banner -->
        <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 10px; padding: 0.7rem 0.9rem; font-size: 0.8rem; color: #1E40AF; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.1rem; flex-shrink: 0;">💡</span>
          <span>Customize specific window access for <strong>\${esc(p.name || p.email)}</strong>. Overrides apply ONLY to this user; other \${roleObj.label} accounts remain untouched.</span>
        </div>

        <!-- Micro Legend -->
        <div style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.75rem; color: #64748B; margin-bottom: 1rem; flex-wrap: wrap;">
          <span><strong style="color: #0F172A;">Switch:</strong></span>
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #CBD5E1;"></span>
            <span>Gray (Left) = Off</span>
          </span>
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #EAB308;"></span>
            <span style="font-weight: 600; color: #854D0E;">Yellow (Center) = View Only</span>
          </span>
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981;"></span>
            <span style="font-weight: 600; color: #065F46;">Green (Right) = Full Access</span>
          </span>
          <span style="color: #059669; font-weight: 600; margin-left: 0.3rem;">• Tap card to cycle</span>
        </div>

        <!-- Modal Scrollable Windows List -->
        <div id="modal-user-perm-list" style="max-height: 52vh; overflow-y: auto; padding-right: 4px;">
          <!-- Dynamically populated below -->
        </div>
      </div>
    \`;

    const footerHtml = \`
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn btn-secondary btn-sm" id="btn-modal-cancel">Cancel</button>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary btn-sm" id="btn-modal-grant-all">Grant All Full</button>
          <button class="btn btn-primary btn-sm" id="btn-modal-save-perm" style="font-weight: 700; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);">
            Save Custom Permissions
          </button>
        </div>
      </div>
    \`;

    UIComponents.openModal({ title, bodyHtml, footerHtml, maxWidth: '720px' });

    const renderModalItems = () => {
      const container = document.getElementById('modal-user-perm-list');
      if (!container) return;

      container.innerHTML = WINDOW_CATEGORIES.map((cat) => \`
        <div style="margin-bottom: 1rem; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 12px; padding: 0.85rem 1rem;">
          <div style="font-size: 0.85rem; font-weight: 800; color: #0F172A; margin-bottom: 0.65rem; display: flex; align-items: center; gap: 0.4rem;">
            <span style="color: #059669; display: inline-flex;">\${cat.icon}</span>
            <span>\${cat.title}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr; gap: 0.5rem;">
            \${cat.modules.map((mod) => {
              const state = getState(mod.key);
              const defaultVal = roleDefaults[mod.key] || 'off';
              const isOverridden = userOverrides[mod.key] !== undefined && userOverrides[mod.key] !== defaultVal;

              return \`
                <div class="perm-item state-\${state} modal-perm-card" data-mod-key="\${mod.key}" style="padding: 0.65rem 0.85rem;" title="\${mod.label} • Click to cycle">
                  <div class="perm-item-left">
                    <div class="perm-item-icon" style="width: 32px; height: 32px;">\${mod.icon}</div>
                    <div class="perm-item-info">
                      <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                        <span class="perm-item-name" style="font-size: 0.85rem;">\${mod.label}</span>
                        \${isOverridden ? \`
                          <span class="badge" style="background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; font-size: 0.62rem; padding: 0.1rem 0.4rem; font-weight: 700;">
                            Special Override
                          </span>
                        \` : \`
                          <span style="font-size: 0.68rem; color: #94A3B8;">(Role Default: \${defaultVal.toUpperCase()})</span>
                        \`}
                      </div>
                      <span class="perm-item-desc" style="font-size: 0.7rem;">\${mod.desc}</span>
                    </div>
                  </div>
                  <div class="perm-switch pos-\${state}" data-mod-key="\${mod.key}"></div>
                </div>
              \`;
            }).join('')}
          </div>
        </div>
      \`).join('');

      // Click to cycle (Off -> View Only -> Full Access -> Off)
      container.querySelectorAll('.modal-perm-card').forEach((card) => {
        card.addEventListener('click', () => {
          const modKey = card.dataset.modKey;
          if (!modKey) return;
          const current = getState(modKey);
          let next = 'view';
          if (current === 'off') next = 'view';
          else if (current === 'view') next = 'full';
          else next = 'off';

          userOverrides[modKey] = next;
          renderModalItems();
        });
      });
    };

    renderModalItems();

    safeOn('btn-modal-reset-defaults', 'click', () => {
      userOverrides = {};
      renderModalItems();
      UIComponents.showToast(\`Switches reset to \${roleObj.label} defaults\`, 'info');
    });

    safeOn('btn-modal-grant-all', 'click', () => {
      for (const cat of WINDOW_CATEGORIES) {
        for (const mod of cat.modules) {
          userOverrides[mod.key] = 'full';
        }
      }
      renderModalItems();
      UIComponents.showToast('All windows set to Full Access', 'info');
    });

    safeOn('btn-modal-cancel', 'click', () => {
      UIComponents.closeModal();
    });

    safeOn('btn-modal-save-perm', 'click', async () => {
      let hasDifference = false;
      const cleanCustom = {};

      for (const cat of WINDOW_CATEGORIES) {
        for (const mod of cat.modules) {
          const val = userOverrides[mod.key];
          const def = roleDefaults[mod.key] || 'off';
          if (val !== undefined && val !== def) {
            cleanCustom[mod.key] = val;
            hasDifference = true;
          }
        }
      }

      if (hasDifference) {
        WindowPermissionsService.setUserCustomPermissions(p.id, cleanCustom);
        try {
          await dbService.update('profiles', p.id, { custom_modules: cleanCustom });
        } catch (e) {}
        await auditService.log('USER_CUSTOM_PERM_SAVE', 'GOVERNANCE', { userId: p.id, permissions: cleanCustom });
        UIComponents.showToast(\`Saved custom window permissions for \${p.name || p.email}.\`, 'success');
      } else {
        WindowPermissionsService.resetUserCustomPermissions(p.id);
        try {
          await dbService.update('profiles', p.id, { custom_modules: null });
        } catch (e) {}
        UIComponents.showToast(\`Restored default role permissions for \${p.name || p.email}.\`, 'info');
      }

      UIComponents.closeModal();
      const mainContent = document.getElementById('tab-content');
      if (mainContent) this.renderUsersTab(mainContent);
    });
  }

  /**
   * Institutional Role & Child Assignment Modal
   */
  static async openChangeRoleModal(p, isApprovalMode = false) {
    const isTargetSuper = (p.email || '').toLowerCase() === (TMS_CONFIG.superAdminEmail || '').toLowerCase() || p.role === 'super_admin' || p.isSuperAdmin === true || p.is_super_admin === true;
    if (isTargetSuper) {
      UIComponents.showToast('Initial Super Admin account is protected.', 'warning');
      return;
    }

    const allStudents = this._allStudents || [];
    let assignedStudentIds = Array.isArray(p.assigned_student_ids) ? [...p.assigned_student_ids] : (Array.isArray(p.child_ids) ? [...p.child_ids] : []);

    // If parent and no children linked yet, attempt auto-match by phone or father name
    if (assignedStudentIds.length === 0 && (p.role === 'parent' || isApprovalMode)) {
      const cleanPh = (p.phone || '').replace(/[^0-9]/g, '');
      if (cleanPh) {
        allStudents.forEach((st) => {
          const fPh = (st.father_phone || '').replace(/[^0-9]/g, '');
          const mPh = (st.mother_phone || '').replace(/[^0-9]/g, '');
          const wPh = (st.whatsapp_number || '').replace(/[^0-9]/g, '');
          if (cleanPh === fPh || cleanPh === mPh || cleanPh === wPh) {
            assignedStudentIds.push(st.id);
          }
        });
      }
      if (assignedStudentIds.length === 0 && p.name) {
        const pName = p.name.toLowerCase().trim();
        allStudents.forEach((st) => {
          if (st.father_name && st.father_name.toLowerCase().trim() === pName) {
            assignedStudentIds.push(st.id);
          }
        });
      }
    }

    const title = isApprovalMode ? 'Approve Account & Assign Role' : \`Assign Role & Scope: \${p.name || p.email}\`;
    const rolesList = WINDOW_ROLES;
    const currentRole = p.role === 'pending' ? (isApprovalMode ? 'teacher' : 'teacher') : (p.role || 'teacher');

    const bodyHtml = \`
      <div style="display:flex; flex-direction:column; gap:14px;">
        <!-- User Info Strip -->
        <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:10px; padding:0.75rem 1rem; display:flex; align-items:center; justify-content:space-between; gap:10px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <img src="\${esc(p.avatar || '')}" alt="" style="width:36px;height:36px;border-radius:50%;object-fit:cover;background:#f1f5f9;">
            <div>
              <strong style="font-size:0.92rem; color:var(--text-main);">\${esc(p.name || 'User Account')}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted);">\${esc(p.email || '—')}</div>
            </div>
          </div>
          \${p.phone ? \`<div style="font-size:0.76rem; color:var(--text-muted);">📞 \${esc(p.phone)}</div>\` : ''}
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700;">Institutional Role</label>
          <select class="form-select" id="role-modal-select">
            \${rolesList.map((r) => \`<option value="\${r.key}" \${currentRole === r.key ? 'selected' : ''}>\${r.label} (\${r.subtitle})</option>\`).join('')}
            <option value="principal" \${currentRole === 'principal' ? 'selected' : ''}>Principal (School Executive)</option>
            <option value="coordinator" \${currentRole === 'coordinator' ? 'selected' : ''}>Coordinator (Academic Management)</option>
            <option value="finance" \${currentRole === 'finance' ? 'selected' : ''}>Finance Officer (Fee Collection)</option>
            <option value="hr" \${currentRole === 'hr' ? 'selected' : ''}>HR Manager (Staff & Attendance)</option>
            <option value="librarian" \${currentRole === 'librarian' ? 'selected' : ''}>Librarian (Book Circulation)</option>
            <option value="operations" \${currentRole === 'operations' ? 'selected' : ''}>Operations (Facility & Hostel)</option>
            <option value="office_boy" \${currentRole === 'office_boy' ? 'selected' : ''}>Office Boy (Admission Data Entry)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700;">Data Scope</label>
          <select class="form-select" id="role-modal-scope">
            \${Object.values(TMS_CONFIG.scopes).map((s) => \`<option value="\${s}" \${p.scope === s ? 'selected' : ''}>\${s}</option>\`).join('')}
          </select>
        </div>

        <!-- Student Assignment Section (Conditional for Parents) -->
        <div id="role-modal-parent-section" style="display:\${currentRole === 'parent' ? 'block' : 'none'}; border-top:1px solid var(--border-color); padding-top:12px;">
          <label class="form-label" style="font-weight:700;">Linked Student(s) / Wards</label>
          <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px;">Parents can only view academic performance and leave requests for their linked children.</p>
          <div style="max-height:160px; overflow-y:auto; border:1px solid var(--border-color); border-radius:8px; padding:6px 10px;">
            \${allStudents.length === 0 ? '<span style="font-size:0.8rem; color:var(--text-muted);">No student records found.</span>' : allStudents.map((st) => \`
              <label style="display:flex; align-items:center; gap:8px; padding:4px 0; font-size:0.82rem; cursor:pointer;">
                <input type="checkbox" class="cb-assign-child" value="\${esc(st.id)}" \${assignedStudentIds.includes(st.id) ? 'checked' : ''}>
                <span>\${esc(st.full_name || st.name || 'Student')} (\${esc(st.admission_number || st.admission_no || '—')}, Class \${esc(st.standard || st.class || '—')})</span>
              </label>
            \`).join('')}
          </div>
        </div>
      </div>
    \`;

    const footerHtml = \`
      <button class="btn btn-secondary btn-sm" id="btn-role-cancel">Cancel</button>
      <button class="btn btn-primary btn-sm" id="btn-role-submit">
        \${isApprovalMode ? 'Approve & Save' : 'Save Changes'}
      </button>
    \`;

    UIComponents.openModal({ title, bodyHtml, footerHtml });

    const roleSelect = document.getElementById('role-modal-select');
    roleSelect.addEventListener('change', () => {
      const parentSec = document.getElementById('role-modal-parent-section');
      if (parentSec) {
        parentSec.style.display = roleSelect.value === 'parent' ? 'block' : 'none';
      }
    });

    safeOn('btn-role-cancel', 'click', () => UIComponents.closeModal());

    safeOn('btn-role-submit', 'click', async () => {
      const selectedRole = roleSelect.value;
      const selectedScope = document.getElementById('role-modal-scope')?.value || 'own_records';
      const selectedChildren = Array.from(document.querySelectorAll('.cb-assign-child:checked')).map((cb) => cb.value);

      const updates = {
        role: selectedRole,
        scope: selectedScope,
        approvalStatus: 'approved',
        isActive: true
      };

      if (selectedRole === 'parent') {
        updates.assigned_student_ids = selectedChildren;
      }

      await dbService.update('profiles', p.id, updates);
      await auditService.log('USER_ROLE_ASSIGNED', 'GOVERNANCE', { userId: p.id, role: selectedRole });
      UIComponents.showToast(\`Account \${isApprovalMode ? 'approved and assigned' : 'updated'}.\`, 'success');
      UIComponents.closeModal();

      const mainContent = document.getElementById('tab-content');
      if (mainContent) this.renderUsersTab(mainContent);
    });
  }
`;

fs.writeFileSync('generated_users_methods.js', completeCode);
console.log('Saved generated_users_methods.js, length:', completeCode.length);
