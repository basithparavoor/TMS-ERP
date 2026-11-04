(N=>N.approval_status==="suspended");let _=e||ot||(d.length>0?"pending":"active");ot=_,s.innerHTML=`
    <div class="page-header">
      <div class="page-title-group">
        <h2>User Accounts & Permissions</h2>
        <p>Institutional identity governance, pending approval queue, and role window assignment</p>
      </div>
      <div class="page-actions">
        ${a?"":`
          <button class="btn btn-primary" id="btn-create-invitation">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x1="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            Pre-Authorize Email
          </button>
        `}
      </div>
    </div>

    <!-- Pending Approvals Alert Banner -->
    ${d.length>0?`
      <div class="users-pending-alert-banner" style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: var(--radius-lg); padding: 1rem 1.25rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 20px;">⚠️</span>
          <div>
            <strong style="color: #B45309;">${d.length} Account(s) Awaiting Approval</strong>
            <p style="font-size: 0.8rem; color: #92400E; margin-top: 0.1rem;">These users have authenticated with Google but are blocked from accessing school data until reviewed.</p>
          </div>
        </div>
      </div>
    `:""}

    <!-- Tabs: Pending Approvals, Active Accounts, Suspended Accounts & Assign Windows (RBAC) -->
    <div class="card-panel">
      <div class="card-panel-header" style="padding: 0.75rem 1rem;">
        <div class="user-sub-tabs-bar">
          <button class="btn ${_==="pending"?"btn-primary":"btn-outline"} btn-sm" id="tab-pending-btn">
            <span class="tab-label-full">Pending Approvals (${d.length})</span>
            <span class="tab-label-short">Pending (${d.length})</span>
          </button>
          <button class="btn ${_==="active"?"btn-primary":"btn-outline"} btn-sm" id="tab-active-btn">
            <span class="tab-label-full">Active Accounts (${o.length})</span>
            <span class="tab-label-short">Active (${o.length})</span>
          </button>
          <button class="btn ${_==="suspended"?"btn-primary":"btn-outline"} btn-sm" id="tab-suspended-btn">
            <span class="tab-label-full">Suspended Accounts (${w.length})</span>
            <span class="tab-label-short">Suspended (${w.length})</span>
          </button>
          <button class="btn ${_==="rbac"?"btn-primary":"btn-outline"} btn-sm" id="tab-rbac-btn" style="display: flex; align-items: center; gap: 0.4rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span class="tab-label-full">Assign Windows (RBAC)</span>
            <span class="tab-label-short">RBAC</span>
          </button>
        </div>
      </div>
      <div class="card-panel-body" style="padding: 0;" id="users-tab-content">
        <!-- Rendered via sub-functions -->
      </div>
    </div>
  `;function $(){const N=s.querySelector("#tab-pending-btn"),h=s.querySelector("#tab-active-btn"),L=s.querySelector("#tab-suspended-btn"),c=s.querySelector("#tab-rbac-btn");N&&(N.className=`btn ${_==="pending"?"btn-primary":"btn-outline"} btn-sm`),h&&(h.className=`btn ${_==="active"?"btn-primary":"btn-outline"} btn-sm`),L&&(L.className=`btn ${_==="suspended"?"btn-primary":"btn-outline"} btn-sm`),c&&(c.className=`btn ${_==="rbac"?"btn-primary":"btn-outline"} btn-sm`)}function D(){const N=s.querySelector("#users-tab-content");if(N){if(_==="rbac"){p(N);return}if(_==="pending"){if(d.length===0){N.innerHTML=`
          <div class="empty-state">
            <div class="empty-icon">✓</div>
            <h4>Queue Clear</h4>
            <p>There are no pending user authorization requests at this time.</p>
          </div>
        `;return}N.innerHTML=`
        <!-- Desktop Table View -->
        <div class="desktop-user-table table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${d.map(h=>{const L=h.role==="parent";return`
                <tr>
                  <td>
                    <strong>${h.full_name||"Pending User"}</strong>
                    ${L?'<span class="badge" style="background: #EFF6FF; color: #1D4ED8; font-size: 0.65rem; margin-left: 0.35rem; font-weight: 700;">PARENT APPLICANT</span>':""}
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${h.phone_number||h.phone||"No phone recorded"}</div>
                  </td>
                  <td>${h.email}</td>
                  <td><span class="badge badge-leave">Pending Approval</span></td>
                  <td>
                    ${a?`
                      <span class="badge badge-leave" style="font-size: 0.72rem;">View Only</span>
                    `:`
                      <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-sm btn-primary btn-approve" data-id="${h.id}" data-email="${h.email}" data-role="${h.role||(L?"parent":"teacher")}">
                          ${L?"Approve & Assign Children":"Approve & Assign Role"}
                        </button>
                        <button class="btn btn-sm btn-outline btn-reject" data-id="${h.id}" style="color: #DC2626; border-color: #FECACA;">Reject</button>
                      </div>
                    `}
                  </td>
                </tr>
              `}).join("")}
            </tbody>
          </table>
        </div>

        <!-- Mobile Responsive Cards View -->
        <div class="mobile-user-cards">
          ${d.map(h=>{const L=h.role==="parent";return`
            <div class="user-card-item">
              <div class="user-card-header">
                <div class="user-card-avatar-col">
                  <div class="user-avatar" style="width: 40px; height: 40px; font-size: 14px; font-weight: 700; border-radius: 10px;">
                    ${(h.full_name||"P")[0].toUpperCase()}
                  </div>
                </div>
                <div class="user-card-info-col">
                  <div class="user-card-name-row">
                    <span class="user-card-name">${h.full_name||"Pending Applicant"}</span>
                    ${L?'<span class="badge" style="background: #EFF6FF; color: #1D4ED8; font-size: 0.62rem; font-weight: 700; padding: 0.15rem 0.4rem;">PARENT</span>':""}
                  </div>
                  <div class="user-card-meta-row">
                    <span class="badge badge-leave" style="font-size: 0.68rem; padding: 0.15rem 0.45rem; font-weight: 700;">
                      Awaiting Review
                    </span>
                  </div>
                </div>
              </div>

              <div class="user-card-contact">
                <div class="user-card-contact-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span class="user-card-email-text">${h.email}</span>
                </div>
                ${h.phone_number||h.phone?`
                  <div class="user-card-contact-item" style="color: var(--text-muted);">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span>${h.phone_number||h.phone}</span>
                  </div>
                `:`
                  <div class="user-card-contact-item" style="color: var(--text-muted); font-size: 0.72rem;">
                    <span>No phone recorded</span>
                  </div>
                `}
              </div>

              ${a?"":`
                <div class="user-card-actions" style="grid-template-columns: 1fr 1fr;">
                  <button class="btn btn-sm btn-primary btn-approve" data-id="${h.id}" data-email="${h.email}" data-role="${h.role||(L?"parent":"teacher")}" style="font-weight: 700;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    ${L?"Approve & Assign":"Approve & Role"}
                  </button>
                  <button class="btn btn-sm btn-outline btn-reject" data-id="${h.id}" style="color: #DC2626; border-color: #FECACA;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Reject
                  </button>
                </div>
              `}
            </div>
          `}).join("")}
        </div>
      `,N.querySelectorAll(".btn-approve").forEach(h=>{h.addEventListener("click",()=>{const L=h.getAttribute("data-id"),c=h.getAttribute("data-email"),b=h.getAttribute("data-role");Y(L,c,b)})}),N.querySelectorAll(".btn-reject").forEach(h=>{h.addEventListener("click",async()=>{const L=h.getAttribute("data-id");await Qe({title:"Reject User Application",message:"Are you sure you want to reject this authorization request?",confirmText:"Reject Application",isDanger:!0})&&(await W.updateUserApproval(L,{approval_status:"rejected"}),oe.info("User application marked as rejected."),ot="pending",ut(s,{onNavigate:t}))})})}if(_==="suspended"){if(w.length===0){N.innerHTML=`
          <div class="empty-state">
            <div class="empty-icon">✓</div>
            <h4>No Suspended Accounts</h4>
            <p>All institutional accounts are in good standing.</p>
          </div>
        `;return}N.innerHTML=`
        <!-- Desktop Table View -->
        <div class="desktop-user-table table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${w.map(h=>`
                <tr>
                  <td>
                    <strong>${h.full_name||"User"}</strong>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${h.phone_number||"No phone"}</div>
                  </td>
                  <td><span class="badge" style="background: #F1F5F9; color: #475569; font-weight: 700;">${(h.role||"Staff").toUpperCase()}</span></td>
                  <td>${h.email}</td>
                  <td><span class="badge badge-absent">Suspended</span></td>
                  <td>
                    <div style="display: flex; gap: 0.5rem;">
                      <button class="btn btn-sm btn-outline btn-reactivate" data-id="${h.id}" style="color: #059669; border-color: #A7F3D0;">Reactivate</button>
                      <button class="btn btn-sm btn-outline btn-profile" data-id="${h.id}">Profile</button>
                    </div>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <!-- Mobile Responsive Cards View -->
        <div class="mobile-user-cards">
          ${w.map(h=>`
            <div class="user-card-item">
              <div class="user-card-header">
                <div class="user-card-avatar-col">
                  <div class="user-avatar" style="width: 40px; height: 40px; font-size: 14px; font-weight: 700; border-radius: 10px;">
                    ${(h.full_name||"U")[0].toUpperCase()}
                  </div>
                </div>
                <div class="user-card-info-col">
                  <div class="user-card-name-row">
                    <span class="user-card-name">${h.full_name||"User"}</span>
                  </div>
                  <div class="user-card-meta-row">
                    <span class="badge" style="background: #F1F5F9; color: #475569; font-size: 0.68rem; padding: 0.15rem 0.45rem; font-weight: 700;">
                      ${(h.role||"Staff").toUpperCase()}
                    </span>
                    <span class="badge badge-absent" style="font-size: 0.68rem; padding: 0.15rem 0.45rem;">
                      Suspended
                    </span>
                  </div>
                </div>
              </div>

              <div class="user-card-contact">
                <div class="user-card-contact-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span class="user-card-email-text">${h.email}</span>
                </div>
                ${h.phone_number?`
                  <div class="user-card-contact-item" style="color: var(--text-muted);">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span>${h.phone_number}</span>
                  </div>
                `:""}
              </div>

              <div class="user-card-actions" style="grid-template-columns: 1fr 1fr;">
                <button class="btn btn-sm btn-outline btn-reactivate" data-id="${h.id}" style="color: #059669; border-color: #A7F3D0; font-weight: 600;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                  Reactivate
                </button>
                <button class="btn btn-sm btn-outline btn-profile" data-id="${h.id}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Profile
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      `,N.querySelectorAll(".btn-profile").forEach(h=>{h.addEventListener("click",()=>{const L=h.getAttribute("data-id"),c=w.find(b=>b.id===L);c&&Hs({profile:c,isInitialSetup:!1,onSaved:()=>ut(s,{onNavigate:t})})})}),N.querySelectorAll(".btn-reactivate").forEach(h=>{h.addEventListener("click",async()=>{const L=h.getAttribute("data-id");await Qe({title:"Reactivate Account",message:"Are you sure you want to restore active institutional access for this account?",confirmText:"Reactivate Account"})&&(await W.updateUserApproval(L,{approval_status:"approved"}),oe.success("Account reactivated successfully."),ot="suspended",ut(s,{onNavigate:t}))})})}_==="active"&&(N.innerHTML=`
        <!-- Desktop Table View -->
        <div class="desktop-user-table table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${o.map(h=>{const L=as(h.id),c=!!(L&&Object.keys(L).length>0),b=h.assigned_student_ids||h.student_ids||h.child_ids||[],E=Array.isArray(b)?l.filter(k=>b.includes(k.id)):[];return`
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <div class="user-avatar" style="width: 32px; height: 32px; font-size: 12px;">
                        ${h.avatar_url?`<img src="${h.avatar_url}" style="width: 100%; height: 100%; object-fit: cover;" alt="" />`:(h.full_name||"U")[0].toUpperCase()}
                      </div>
                      <div>
                        <strong>${h.full_name||"User"}</strong>
                        ${h.is_super_admin?'<span class="badge" style="background: #0F172A; color: #FFFFFF; font-size: 0.65rem; margin-left: 0.35rem;">SUPER ADMIN</span>':""}
                        ${c?'<span class="badge" style="background: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0; font-size: 0.65rem; margin-left: 0.35rem; font-weight: 700;">CUSTOM PERMS</span>':""}
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${h.phone_number||h.phone||"No phone recorded"}</div>
                        ${h.role==="parent"?`
                          <div style="margin-top: 3px; font-size: 0.73rem; color: ${E.length>0?"#059669":"#D97706"}; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                            <span>👨‍👧‍👦</span>
                            <span>${E.length>0?`${E.length} Children: ${E.map(k=>k.full_name).join(", ")}`:"⚠️ No children linked yet"}</span>
                          </div>
                        `:""}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge ${h.is_super_admin?"badge-present":"badge-leave"}" style="font-weight: 700;">
                      ${(h.role||"Staff").toUpperCase()}
                    </span>
                  </td>
                  <td>${h.email}</td>
                  <td><span class="badge badge-present">Active</span></td>
                  <td>
                    <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; align-items: center;">
                      ${!h.is_super_admin&&!a?`
                        <button class="btn btn-sm btn-outline btn-change-role" data-id="${h.id}" data-email="${h.email}" data-role="${h.role||"teacher"}">Role</button>
                        ${h.role==="parent"?`
                          <button class="btn btn-sm btn-outline btn-assign-children" data-id="${h.id}" data-email="${h.email}" style="color: #059669; border-color: #A7F3D0; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;" title="Assign or edit linked students for this parent">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            Assign Children
                          </button>
                        `:""}
                        <button class="btn btn-sm ${c?"btn-primary":"btn-outline"} btn-custom-perm" data-id="${h.id}" style="${c?"box-shadow: 0 1px 4px rgba(16,185,129,0.3);":"color: #059669; border-color: #A7F3D0;"}" title="Customize specific window access for ${h.full_name||h.email}">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                          Permissions
                        </button>
                      `:""}
                      <button class="btn btn-sm btn-outline btn-profile" data-id="${h.id}">Profile</button>
                      ${!h.is_super_admin&&!a?`
                        <button class="btn btn-sm btn-outline btn-suspend" data-id="${h.id}" style="color: #DC2626; border-color: #FECACA;">Suspend</button>
                      `:""}
                    </div>
                  </td>
                </tr>
              `}).join("")}
            </tbody>
          </table>
        </div>

        <!-- Mobile Responsive Cards View -->
        <div class="mobile-user-cards">
          ${o.map(h=>{const L=as(h.id),c=!!(L&&Object.keys(L).length>0),b=h.assigned_student_ids||h.student_ids||h.child_ids||[],E=Array.isArray(b)?l.filter(k=>b.includes(k.id)):[];return`
            <div class="user-card-item">
              <div class="user-card-header">
                <div class="user-card-avatar-col">
                  <div class="user-avatar" style="width: 40px; height: 40px; font-size: 14px; font-weight: 700; border-radius: 10px;">
                    ${h.avatar_url?`<img src="${h.avatar_url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;" alt="" />`:(h.full_name||"U")[0].toUpperCase()}
                  </div>
                </div>
                <div class="user-card-info-col">
                  <div class="user-card-name-row">
                    <span class="user-card-name">${h.full_name||"User"}</span>
                    ${h.is_super_admin?'<span class="badge" style="background: #0F172A; color: #FFFFFF; font-size: 0.62rem; padding: 0.15rem 0.4rem; font-weight: 700;">SUPER ADMIN</span>':""}
                    ${c?'<span class="badge" style="background: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0; font-size: 0.62rem; padding: 0.15rem 0.4rem; font-weight: 700;">CUSTOM PERMS</span>':""}
                  </div>
                  <div class="user-card-meta-row">
                    <span class="badge ${h.is_super_admin?"badge-present":"badge-leave"}" style="font-size: 0.68rem; padding: 0.15rem 0.45rem; font-weight: 700;">
                      ${(h.role||"Staff").toUpperCase()}
                    </span>
                    <span class="user-card-status-dot">
                      <span style="width: 7px; height: 7px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
                      <span style="font-size: 0.74rem; color: #059669; font-weight: 600;">Active</span>
                    </span>
                  </div>
                </div>
              </div>

              <div class="user-card-contact">
                <div class="user-card-contact-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span class="user-card-email-text">${h.email}</span>
                </div>
                ${h.phone_number||h.phone?`
                  <div class="user-card-contact-item" style="color: var(--text-muted);">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span>${h.phone_number||h.phone}</span>
                  </div>
                `:`
                  <div class="user-card-contact-item" style="color: var(--text-muted); font-size: 0.72rem;">
                    <span>No phone recorded</span>
                  </div>
                `}
                ${h.role==="parent"?`
                  <div class="user-card-contact-item" style="color: ${E.length>0?"#059669":"#D97706"}; font-weight: 600; font-size: 0.74rem;">
                    <span>👨‍👧‍👦 ${E.length>0?`${E.length} Children: ${E.map(k=>k.full_name).join(", ")}`:"⚠️ No children linked yet"}</span>
                  </div>
                `:""}
              </div>

              <div class="user-card-actions ${h.is_super_admin?"user-card-actions-single":""}">
                ${!h.is_super_admin&&!a?`
                  <button class="btn btn-sm btn-outline btn-change-role" data-id="${h.id}" data-email="${h.email}" data-role="${h.role||"teacher"}">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                    Role
                  </button>
                  ${h.role==="parent"?`
                