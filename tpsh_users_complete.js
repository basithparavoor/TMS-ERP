    <h4>Access Restricted</h4>
        <p>Institutional authorization is required to access User & Permission Management.</p>
      </div>
    `;return}const a=At(i,"users"),r=await W.getUsers(),l=await W.getStudents(),d=r.filter(N=>N.approval_status==="pending"),o=r.filter(N=>N.approval_status==="approved"),w=r.filter(N=>N.approval_status==="suspended");let _=e||ot||(d.length>0?"pending":"active");ot=_,s.innerHTML=`
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
                    <button class="btn btn-sm btn-outline btn-assign-children" data-id="${h.id}" data-email="${h.email}" style="color: #059669; border-color: #A7F3D0; font-weight: 700;">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      Children
                    </button>
                  `:""}
                  <button class="btn btn-sm ${c?"btn-primary":"btn-outline"} btn-custom-perm" data-id="${h.id}" style="${c?"box-shadow: 0 1px 4px rgba(16,185,129,0.3);":"color: #059669; border-color: #A7F3D0; font-weight: 600;"}" title="Customize specific window access for ${h.full_name||h.email}">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                    Permissions
                  </button>
                `:""}
                <button class="btn btn-sm btn-outline btn-profile" data-id="${h.id}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Profile
                </button>
                ${!h.is_super_admin&&!a?`
                  <button class="btn btn-sm btn-outline btn-suspend" data-id="${h.id}" style="color: #DC2626; border-color: #FECACA;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                    Suspend
                  </button>
                `:""}
              </div>
            </div>
          `}).join("")}
        </div>
      `,N.querySelectorAll(".btn-profile").forEach(h=>{h.addEventListener("click",()=>{const L=h.getAttribute("data-id"),c=o.find(b=>b.id===L);c&&Hs({profile:c,isInitialSetup:!1,onSaved:()=>ut(s,{onNavigate:t})})})}),N.querySelectorAll(".btn-change-role").forEach(h=>{h.addEventListener("click",()=>{const L=h.getAttribute("data-id"),c=h.getAttribute("data-email"),b=h.getAttribute("data-role");Y(L,c,b)})}),N.querySelectorAll(".btn-assign-children").forEach(h=>{h.addEventListener("click",()=>{const L=h.getAttribute("data-id"),c=h.getAttribute("data-email");Y(L,c,"parent")})}),N.querySelectorAll(".btn-custom-perm").forEach(h=>{h.addEventListener("click",()=>{const L=h.getAttribute("data-id"),c=o.find(b=>b.id===L);c&&Z(c)})}),N.querySelectorAll(".btn-suspend").forEach(h=>{h.addEventListener("click",async()=>{if(a){oe.warning("View-only access: suspending accounts is disabled.");return}const L=h.getAttribute("data-id"),c=o.find(E=>E.id===L);if(c!=null&&c.is_super_admin){oe.error("The Initial Super Admin account cannot be suspended.");return}await Qe({title:"Suspend User Account",message:`Suspending this account will immediately revoke all access to student and academic records for ${(c==null?void 0:c.full_name)||(c==null?void 0:c.email)||"this user"}.`,confirmText:"Suspend Access",isDanger:!0})&&(await W.updateUserApproval(L,{approval_status:"suspended"}),oe.info("Account suspended and moved to Suspended Accounts."),ot="active",ut(s,{onNavigate:t}))})}))}}function p(N){let h=Js(qs()),L=Ds||"teacher";const c=Ls,b=Zt,E=(m,M)=>(h[m]||{})[M]||"off",k=(m,M,x)=>{h[m]||(h[m]={}),h[m][M]=x,h[m].dashboard="full"},y=m=>{const M=h[m]||{};let x=0,H=0,z=0;for(const q of b)for(const A of q.modules){const C=M[A.key]||"off";C==="full"?x++:C==="view"?H++:z++}return{fullCount:x,viewCount:H,offCount:z}};function u(){var z,q;const m=c.find(A=>A.key===L)||c[1],M=Jt[L]||Jt.teacher,x=y(L);N.innerHTML=`
        <div class="rbac-container">
          ${a?`
            <div style="background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.65rem; color: #92400E; font-size: 0.82rem; font-weight: 600;">
              <span style="font-size: 1.1rem;">🔒</span>
              <span>View-Only Mode: You have read-only access to inspect institutional window assignments. Modifying permissions requires Full Access authorization.</span>
            </div>
          `:""}
          <!-- 1. DESKTOP HEADER (Previous horizontal pills + large active role card with badges, legend & full controls) -->
          <div class="rbac-desktop-header">
            <!-- Top Role Selection Pills -->
            <div style="margin-bottom: 1.5rem;">
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.65rem;">
                Select Role to Configure Windows:
              </div>
              <div class="role-pill-nav">
                ${c.map(A=>{const C=y(A.key);return`
                    <button type="button" class="role-pill-btn ${A.key===L?"active":""}" data-role-key="${A.key}">
                      <span class="role-pill-icon">${A.icon}</span>
                      <span>${A.label}</span>
                      <span class="role-pill-badge" style="font-size: 0.68rem; padding: 0.15rem 0.5rem;">
                        ${C.fullCount} Full • ${C.viewCount} View
                      </span>
                    </button>
                  `}).join("")}
              </div>
            </div>

            <!-- Active Role Header & Switch Legend -->
            <div style="background: #F8FAFC; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.9rem;">
                <div class="role-avatar-badge">
                  ${m.icon.replace('width="18" height="18"','width="24" height="24"')}
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                    <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #0F172A;">${m.label}</h3>
                    <span class="badge badge-present" style="font-size: 0.72rem; padding: 0.2rem 0.6rem;">
                      ${x.fullCount} Full Access
                    </span>
                    <span class="badge badge-late" style="font-size: 0.72rem; padding: 0.2rem 0.6rem; background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A;">
                      ${x.viewCount} View Only
                    </span>
                    <span class="badge" style="background: #F1F5F9; color: #64748B; font-size: 0.72rem; padding: 0.2rem 0.6rem;">
                      ${x.offCount} Off
                    </span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.85rem; font-size: 0.78rem; color: #64748B; margin-top: 6px; flex-wrap: wrap;">
                    <span>${m.subtitle}</span>
                    <span>•</span>
                    <span style="display: inline-flex; align-items: center; gap: 4px;">
                      <span style="width: 9px; height: 9px; border-radius: 50%; background: #CBD5E1; display: inline-block;"></span>
                      <span>Left: Off</span>
                    </span>
                    <span style="display: inline-flex; align-items: center; gap: 4px;">
                      <span style="width: 9px; height: 9px; border-radius: 50%; background: #EAB308; display: inline-block;"></span>
                      <span style="font-weight: 600; color: #854D0E;">Mid: View Only (Yellow)</span>
                    </span>
                    <span style="display: inline-flex; align-items: center; gap: 4px;">
                      <span style="width: 9px; height: 9px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
                      <span style="font-weight: 600; color: #065F46;">Right: Full Access (Green)</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Desktop Action Buttons -->
              <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
                <button class="btn btn-outline btn-sm btn-role-full-all" title="Grant full access to all windows for this role">
                  Full Access All
                </button>
                <button class="btn btn-outline btn-sm btn-role-view-all" title="Set all windows to Explore / View-only for this role">
                  View Only All
                </button>
                <button class="btn btn-outline btn-sm btn-role-off-all" style="color: #DC2626; border-color: #FECACA;" title="Turn off all windows for this role">
                  Turn Off All
                </button>
                <button class="btn btn-outline btn-sm btn-role-reset" title="Reset this role to default institutional windows">
                  Reset Defaults
                </button>
                <button class="btn btn-primary btn-save-role-matrix" style="font-weight: 700; padding: 0.55rem 1.25rem; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Save Permissions
                </button>
              </div>
            </div>
          </div>

          <!-- 2. MOBILE ROLE SELECTOR: Visible only on mobile <= 768px -->
          <div class="rbac-mobile-toolbar rbac-mobile-role-card">
            <button type="button" class="rbac-mobile-role-trigger" id="rbac-mobile-role-trigger" aria-label="Select role to configure windows">
              <div class="rbac-trigger-left">
                <div class="rbac-trigger-icon" style="background: ${M.light}; color: ${M.color}; border: 1.5px solid ${M.border};">
                  ${m.icon}
                </div>
                <div class="rbac-trigger-text">
                  <span class="rbac-trigger-kicker">CONFIGURING ROLE</span>
                  <div class="rbac-trigger-name-row">
                    <span class="rbac-trigger-name">${m.label}</span>
                    <span class="rbac-trigger-badge" style="background: ${M.badgeBg}; color: ${M.badgeColor};">
                      ${m.subtitle.split(",")[0]}
                    </span>
                  </div>
                </div>
              </div>
              <div class="rbac-trigger-right">
                <span class="rbac-trigger-action-pill">
                  <span>Switch</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </div>
            </button>
          </div>

          <!-- Base Navigation Window (Common to All Categories) -->
          <div class="perm-category-card" style="margin-bottom: 1rem;">
            <div class="perm-category-header" style="background: #F8FAFC;">
              <div class="perm-category-title" style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="perm-category-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  </span>
                  <span style="font-weight: 800; color: #0F172A;">Base Institutional Window</span>
                </div>
                <span class="badge badge-active" style="font-size: 0.72rem; padding: 0.2rem 0.6rem;">
                  ✓ Common to All Categories (Always Active)
                </span>
              </div>
            </div>
            <div class="perm-grid">
              <div class="perm-item state-full" style="cursor: default;" title="Dedicated category dashboard for ${m.label}">
                <div class="perm-item-left">
                  <div class="perm-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  </div>
                  <div class="perm-item-info">
                    <span class="perm-item-name">Role Dashboard</span>
                    <span class="perm-item-desc">Personalized dashboard tailored for ${m.label} (Always active for all categories)</span>
                  </div>
                </div>
                <div class="perm-switch pos-full" style="pointer-events: none;" title="Always active for all categories"></div>
              </div>
            </div>
          </div>

          <!-- Category Grouped Assignable Windows -->
          ${b.map(A=>`
            <div class="perm-category-card">
              <div class="perm-category-header">
                <div class="perm-category-title">
                  <span class="perm-category-icon">${A.icon}</span>
                  <span>${A.title}</span>
                  <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-left: 0.4rem;">
                    (${A.modules.filter(C=>E(L,C.key)!=="off").length}/${A.modules.length} Assigned)
                  </span>
                </div>
              </div>

              <div class="perm-grid">
                ${A.modules.map(C=>{const v=E(L,C.key);return`
                    <div class="perm-item state-${v}" data-mod-key="${C.key}" data-level="${v}" title="${C.label} • ${v==="off"?"Off (Click to cycle)":v==="view"?"View Only (Yellow)":"Full Access (Green)"}">
                      <div class="perm-item-left">
                        <div class="perm-item-icon">${C.icon}</div>
                        <div class="perm-item-info">
                          <span class="perm-item-name">${C.label}</span>
                          <span class="perm-item-desc">${C.desc}</span>
                        </div>
                      </div>

                      <!-- 3-Position Old Button (44px x 24px: Off=Gray, View=Yellow, Full=Green) -->
                      <div class="perm-switch pos-${v}" data-mod-key="${C.key}" role="button" aria-label="${C.label} Access"></div>
                    </div>
                  `}).join("")}
              </div>
            </div>
          `).join("")}

          <!-- Bottom Action Bar -->
          <div class="rbac-bottom-bar">
            <div class="rbac-bottom-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>Tap any window card or switch to cycle: <strong>Off → View Only (Yellow) → Full Access (Green)</strong>.</span>
            </div>
            <button class="btn btn-primary" id="btn-save-role-matrix-bottom" style="font-weight: 700;">
              Save Permissions
            </button>
          </div>
        </div>
      `,(z=N.querySelector("#rbac-mobile-role-trigger"))==null||z.addEventListener("click",()=>{Te({title:"Select Role to Configure",modalClass:"role-picker-modal-dialog",contentHtml:`
            <div style="margin-bottom: 0.5rem;">
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.85rem;">
                Select an institutional role to review or assign its accessible windows:
              </p>
              <div class="role-picker-list">
                ${c.map(A=>{const C=Jt[A.key]||Jt.teacher,v=A.key===L;return`
                    <div class="role-picker-item ${v?"active":""}" data-role-key="${A.key}" role="button" tabindex="0">
                      <div class="role-picker-item-left">
                        <div class="role-picker-item-icon" style="background: ${C.light}; color: ${C.color}; border: 1.5px solid ${C.border};">
                          ${A.icon}
                        </div>
                        <div class="role-picker-item-info">
                          <div class="role-picker-item-title-row">
                            <span class="role-picker-item-name">${A.label}</span>
                            ${v?'<span class="badge" style="background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; font-size: 0.65rem; font-weight: 700;">CURRENT</span>':""}
                          </div>
                          <span class="role-picker-item-desc">${A.subtitle}</span>
                        </div>
                      </div>
                      <div class="role-picker-item-radio">
                        <div class="role-radio-circle ${v?"active":""}">
                          ${v?'<div class="role-radio-dot"></div>':""}
                        </div>
                      </div>
                    </div>
                  `}).join("")}
              </div>
            </div>
          `,onMount:({container:A,close:C})=>{A.querySelectorAll(".role-picker-item").forEach(v=>{v.addEventListener("click",()=>{const F=v.getAttribute("data-role-key");F&&F!==L?(L=F,Ds=L,C(),u()):C()})})}})}),N.querySelectorAll(".perm-item").forEach(A=>{A.addEventListener("click",()=>{if(a){oe.warning("View-only access: modifying window permissions is disabled.");return}const C=A.getAttribute("data-mod-key");if(!C)return;const v=E(L,C);let F="view";v==="off"?F="view":v==="view"?F="full":F="off",k(L,C,F),u()})}),N.querySelectorAll(".role-pill-btn").forEach(A=>{A.addEventListener("click",()=>{L=A.getAttribute("data-role-key"),Ds=L,u()})}),N.querySelectorAll(".btn-role-full-all").forEach(A=>{A.addEventListener("click",()=>{if(!a){for(const C of b)for(const v of C.modules)k(L,v.key,"full");u()}})}),N.querySelectorAll(".btn-role-view-all").forEach(A=>{A.addEventListener("click",()=>{if(!a){for(const C of b)for(const v of C.modules)k(L,v.key,"view");u()}})}),N.querySelectorAll(".btn-role-off-all").forEach(A=>{A.addEventListener("click",()=>{if(!a){for(const C of b)for(const v of C.modules)k(L,v.key,"off");u()}})}),N.querySelectorAll(".btn-role-reset").forEach(A=>{A.addEventListener("click",async()=>{if(a)return;if(await Qe({title:"Reset Role Windows",message:`Restore default institutional window assignments for ${m.label}?`,confirmText:"Restore Defaults"})){const v=Tn();h[L]={...v[L]||{}},u(),oe.info(`Restored default windows for ${m.label}.`)}})});const H=()=>{if(a){oe.warning("View-only access: saving window permissions is disabled.");return}zn(h),W.logAudit("UPDATE_RBAC_MATRIX","permissions",L,`Updated window permissions for ${m.label}`),oe.success(`Saved! Window permissions updated for ${m.label}.`),window.dispatchEvent(new Event("tps:permissions-updated")),u()};N.querySelectorAll(".btn-save-role-matrix").forEach(A=>{A.addEventListener("click",H)}),(q=N.querySelector("#btn-save-role-matrix-bottom"))==null||q.addEventListener("click",H)}u()}function Z(N){if(a){oe.warning("View-only access: modifying permissions is disabled.");return}if(N.is_super_admin){oe.error("The Initial Super Admin account has unrestricted full access.");return}const h=N.role||"teacher",L=Ls.find(k=>k.key===h)||Ls[1],c=qs()[h]||{};let b={...as(N.id)||{}};const E=k=>b[k]!==void 0?b[k]:c[k]||"off";Te({title:`Customize Window Permissions: ${N.full_name||N.email}`,contentHtml:`
        <div style="margin-bottom: 1.25rem;">
          <!-- User Info Banner -->
          <div style="background: #F8FAFC; border: 1.5px solid var(--border-subtle); border-radius: 12px; padding: 0.85rem 1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div class="user-avatar" style="width: 38px; height: 38px; font-size: 14px;">
                ${N.avatar_url?`<img src="${N.avatar_url}" style="width:100%;height:100%;object-fit:cover;" alt=""/>`:(N.full_name||"U")[0].toUpperCase()}
              </div>
              <div>
                <strong style="font-size: 0.95rem; color: #0F172A;">${N.full_name||"User"}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${N.email} • Role: <span class="badge badge-present" style="font-weight: 700;">${(N.role||"Staff").toUpperCase()}</span></div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <button class="btn btn-outline btn-xs" id="btn-modal-reset-defaults" style="color: #475569;" title="Reset this user's windows back to ${L.label} defaults">
                Reset to Role Defaults
              </button>
            </div>
          </div>

          <!-- Description Hint Banner -->
          <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 10px; padding: 0.7rem 0.9rem; font-size: 0.8rem; color: #1E40AF; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.1rem; flex-shrink: 0;">💡</span>
            <span>Customize specific window access for <strong>${N.full_name||N.email}</strong>. Overrides apply ONLY to this user; other ${L.label} accounts remain untouched.</span>
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
            <!-- Rendered via drawModalList -->
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); flex-wrap: wrap;">
          <button class="btn btn-outline btn-sm" id="btn-modal-cancel">Cancel</button>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-outline btn-sm" id="btn-modal-grant-all">Grant All Full</button>
            <button class="btn btn-primary btn-sm" id="btn-modal-save-perm" style="font-weight: 700; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);">
              Save Custom Permissions
            </button>
          </div>
        </div>
      `,onMount:({container:k,close:y})=>{var m,M,x,H;function u(){const z=k.querySelector("#modal-user-perm-list");z&&(z.innerHTML=Zt.map(q=>`
            <div style="margin-bottom: 1rem; background: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 12px; padding: 0.85rem 1rem;">
              <div style="font-size: 0.85rem; font-weight: 800; color: #0F172A; margin-bottom: 0.65rem; display: flex; align-items: center; gap: 0.4rem;">
                <span style="color: #059669; display: inline-flex;">${q.icon}</span>
                <span>${q.title}</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr; gap: 0.5rem;">
                ${q.modules.map(A=>{const C=E(A.key),v=c[A.key]||"off",F=b[A.key]!==void 0&&b[A.key]!==v;return`
                    <div class="perm-item state-${C} modal-perm-item" data-mod-key="${A.key}" style="padding: 0.65rem 0.85rem;" title="${A.label} • Click to cycle">
                      <div class="perm-item-left">
                        <div class="perm-item-icon" style="width: 32px; height: 32px;">${A.icon}</div>
                        <div class="perm-item-info">
                          <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                            <span class="perm-item-name" style="font-size: 0.85rem;">${A.label}</span>
                            ${F?`
                              <span class="badge" style="background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; font-size: 0.62rem; padding: 0.1rem 0.4rem; font-weight: 700;">
                                Special Override
                              </span>
                            `:`
                              <span style="font-size: 0.68rem; color: #94A3B8;">(Role Default: ${v.toUpperCase()})</span>
                            `}
                          </div>
                          <span class="perm-item-desc" style="font-size: 0.7rem;">${A.desc}</span>
                        </div>
                      </div>
                      <div class="perm-switch pos-${C}" data-mod-key="${A.key}"></div>
                    </div>
                  `}).join("")}
              </div>
            </div>
          `).join(""),z.querySelectorAll(".modal-perm-item").forEach(q=>{q.addEventListener("click",()=>{const A=q.getAttribute("data-mod-key");if(!A)return;const C=E(A);let v="view";C==="off"?v="view":C==="view"?v="full":v="off",b[A]=v,u()})}))}u(),(m=k.querySelector("#btn-modal-reset-defaults"))==null||m.addEventListener("click",()=>{b={},u(),oe.info(`Reset switches to default ${L.label} permissions.`)}),(M=k.querySelector("#btn-modal-grant-all"))==null||M.addEventListener("click",()=>{for(const z of Zt)for(const q of z.modules)b[q.key]="full";u()}),(x=k.querySelector("#btn-modal-cancel"))==null||x.addEventListener("click",()=>{y()}),(H=k.querySelector("#btn-modal-save-perm"))==null||H.addEventListener("click",async()=>{let z=!1;const q={};for(const A of Zt)for(const C of A.modules){const v=b[C.key],F=c[C.key]||"off";v!==void 0&&v!==F&&(q[C.key]=v,z=!0)}if(z){Ti(N.id,q);const A=W.get("tps_users")||[],C=A.findIndex(v=>v.id===N.id);C>=0&&(A[C].custom_modules=q,W.set("tps_users",A)),W.logAudit("USER_CUSTOM_PERM_SAVE","permissions",N.id,`Saved individual custom window permissions for ${N.full_name||N.email}`),oe.success(`Saved custom window permissions for ${N.full_name||N.email}.`)}else{Mn(N.id);const A=W.get("tps_users")||[],C=A.findIndex(v=>v.id===N.id);C>=0&&(delete A[C].custom_modules,W.set("tps_users",A)),oe.info(`Restored default permissions for ${N.full_name||N.email}.`)}y(),ot="active",ut(s,{onNavigate:t})})}})}async function Y(N,h,L="teacher"){if(a){oe.warning("View-only access: modifying accounts is disabled.");return}const b=(W.get("tps_users")||[]).find(u=>u.id===N)||{};if(b.is_super_admin){oe.error("The Initial Super Admin account cannot be modified.");return}const E=await W.getStudents();let k=[];if(Array.isArray(b.assigned_student_ids)&&b.assigned_student_ids.length>0)k=[...b.assigned_student_ids];else if(Array.isArray(b.student_ids)&&b.student_ids.length>0)k=[...b.student_ids];else if(Array.isArray(b.child_ids)&&b.child_ids.length>0)k=[...b.child_ids];else if(L==="parent"||b.role==="parent"){const u=(b.phone_number||b.phone||"").replace(/[^0-9]/g,"");if(u&&E.forEach(m=>{const M=(m.father_phone||"").replace(/[^0-9]/g,""),x=(m.mother_phone||"").replace(/[^0-9]/g,""),H=(m.whatsapp_number||"").replace(/[^0-9]/g,"");(u===M||u===x||u===H)&&k.push(m.id)}),k.length===0&&b.full_name){const m=b.full_name.toLowerCase().trim();E.forEach(M=>{M.father_name&&M.father_name.toLowerCase().trim()===m&&k.push(M.id)})}}const y=L||b.role||"parent";Te({title:b.approval_status==="pending"?"Approve Account & Assign Role":"Institutional Role & Child Assignment",contentHtml:`
        <div style="background: var(--bg-surface-subtle); border: 1px solid var(--border-color); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <div class="user-avatar" style="width: 38px; height: 38px; font-size: 14px; font-weight: 700; border-radius: 8px;">
              ${b.avatar_url?`<img src="${b.avatar_url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" alt="" />`:(b.full_name||h||"U")[0].toUpperCase()}
            </div>
            <div>
              <strong style="font-size: 0.92rem; color: var(--text-primary);">${b.full_name||"User Account"}</strong>
              <div style="font-size: 0.76rem; color: var(--text-muted);">${h}</div>
            </div>
          </div>
          ${b.phone_number||b.phone?`
            <div style="font-size: 0.76rem; color: var(--text-secondary); text-align: right;">
              <div>📞 ${b.phone_number||b.phone}</div>
            </div>
          `:""}
        </div>

        <div class="form-group" style="margin-bottom: 1.15rem;">
          <label class="form-label required" style="font-weight: 700;">Assign Institutional Role</label>
          <select id="modal-role-select" class="form-control" style="font-weight: 600;">
            <option value="parent" ${y==="parent"?"selected":""}>👨‍👧‍👦 Parent (Linked Children / Student Monitoring Portal)</option>
            <option value="teacher" ${y==="teacher"?"selected":""}>Teacher (Class Attendance & Examination Marks)</option>
            <option value="boys_mentor" ${y==="boys_mentor"?"selected":""}>Boys Hostel Mentor (Boys Hostel Data, Leaves & Class)</option>
            <option value="girls_mentor" ${y==="girls_mentor"?"selected":""}>Girls Hostel Mentor (Girls Hostel Data, Leaves & Class)</option>
            <option value="mentor" ${y==="mentor"?"selected":""}>General Hostel Mentor / Warden (Hostel & Leave Register)</option>
            <option value="admin" ${y==="admin"?"selected":""}>Admin (Academic / Records Administrator)</option>
            <option value="hostel_leader" ${y==="hostel_leader"?"selected":""}>Hostel Leader (Student Assistant)</option>
            <option value="student" ${y==="student"?"selected":""}>Student (Self Records View Only)</option>
          </select>
          <small style="color: var(--text-muted); font-size: 0.74rem; margin-top: 0.3rem; display: block;">
            * Windows accessible to this role can be customized in the Assign Windows (RBAC) tab.
          </small>
        </div>

        <!-- Scope / Class Assignment for non-parent roles -->
        <div id="modal-scope-group" class="form-group" style="margin-bottom: 1.25rem; ${y==="parent"?"display: none;":""}">
          <label class="form-label" style="font-weight: 700;">Scope / Class Assignment</label>
          <input type="text" id="modal-scope-input" 