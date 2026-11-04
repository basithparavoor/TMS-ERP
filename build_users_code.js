const fs = require('fs');

const usersMethodsCode = `
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

    // Credentials issued to staff and parents
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

    const roles = Object.values(TMS_CONFIG.roles).filter((r) => isSuperAdmin ? true : r !== 'super_admin');
    const scopes = Object.values(TMS_CONFIG.scopes);

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
            <!-- Rendered below -->
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
`;

console.log('User method preview length:', usersMethodsCode.length);
