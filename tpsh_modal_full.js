Customize Window Permissions: ${N.full_name||N.email}`,contentHtml:`
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
          <input type="text" id="modal-scope-input" class="form-control" placeholder="e.g. Hostel Moral Class, Study Lab 1, Boys Block A" value="${b.scope||""}" />
        </div>

        <!-- Parent Multi-Child Assignment Section -->
        <div id="modal-parent-children-section" style="${y==="parent"?"":"display: none;"} margin-bottom: 1.25rem;">
          <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 12px; padding: 0.85rem 1rem;">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
              <div>
                <div style="font-weight: 800; font-size: 0.95rem; color: #0F172A; display: flex; align-items: center; gap: 6px;">
                  <span>👨‍👧‍👦</span>
                  <span>Step 2: Assign Children / Students (Multi-Selection)</span>
                </div>
                <p style="font-size: 0.78rem; color: #64748B; margin: 0.2rem 0 0 0;">
                  Check all students belonging to this parent. You can select 1, 2, or 3+ children enrolled in the hostel.
                </p>
              </div>
              <span id="parent-selected-count-badge" class="badge" style="background: ${k.length>0?"#ECFDF5":"#F1F5F9"}; color: ${k.length>0?"#065F46":"#64748B"}; border: 1px solid ${k.length>0?"#A7F3D0":"#CBD5E1"}; font-weight: 700; font-size: 0.78rem; padding: 4px 10px; border-radius: 9999px;">
                ${k.length} Selected
              </span>
            </div>

            <!-- Search & Filters -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 0.65rem; flex-wrap: wrap;">
              <div style="position: relative; flex: 1; min-width: 170px;">
                <input type="text" id="modal-parent-student-search" class="form-control" placeholder="Search student name, admission no, class..." style="height: 35px; font-size: 0.82rem; padding-left: 28px;" />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2" style="position: absolute; left: 9px; top: 10px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <div style="display: flex; gap: 0.25rem; align-items: center;">
                <button type="button" class="btn btn-sm filter-gender-btn active" data-gender="all" style="font-size: 0.72rem; padding: 0.25rem 0.55rem; background: #0F172A; color: #FFFFFF; font-weight: 700; border: none; border-radius: 6px;">All</button>
                <button type="button" class="btn btn-sm btn-outline filter-gender-btn" data-gender="boys" style="font-size: 0.72rem; padding: 0.25rem 0.55rem; border-radius: 6px;">Boys</button>
                <button type="button" class="btn btn-sm btn-outline filter-gender-btn" data-gender="girls" style="font-size: 0.72rem; padding: 0.25rem 0.55rem; border-radius: 6px;">Girls</button>
                <button type="button" class="btn btn-sm btn-outline filter-gender-btn" data-gend