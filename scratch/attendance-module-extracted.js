one" stroke="currentColor" stroke-width="2.2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <div class="rbac-trigger-text">
              <span class="rbac-trigger-kicker">CONFIGURING SECTION</span>
              <div class="rbac-trigger-name-row">
                <span class="rbac-trigger-name">${I?I.name:"Select Section"}</span>
                <span class="rbac-trigger-badge" style="background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0;">
                  ${N.length} Classrooms
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

        ${i&&I?`
          <div style="display: flex; align-items: center; gap: 0.4rem; margin-top: 0.6rem; padding-top: 0.6rem; border-top: 1px solid #F1F5F9; flex-wrap: wrap;">
            <button type="button" class="btn btn-outline btn-xs btn-edit-prog" data-prog-id="${I.id}" style="font-weight: 600; font-size: 0.78rem; border-radius: 6px; padding: 0.35rem 0.65rem; color: #475569; display: inline-flex; align-items: center; gap: 0.3rem;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Edit Section
            </button>
            ${n.length>1?`
              <button type="button" class="btn btn-outline btn-xs btn-delete-prog" data-prog-id="${I.id}" style="font-weight: 600; font-size: 0.78rem; border-radius: 6px; padding: 0.35rem 0.65rem; color: #DC2626; border-color: #FECACA; display: inline-flex; align-items: center; gap: 0.3rem;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Delete
              </button>
            `:""}
            <button type="button" class="btn btn-outline btn-xs btn-mobile-new-section" style="margin-left: auto; font-weight: 600; font-size: 0.78rem; border-radius: 6px; padding: 0.35rem 0.65rem; color: #059669; border-color: #A7F3D0; display: inline-flex; align-items: center; gap: 0.3rem;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Section
            </button>
          </div>
        `:""}
      </div>

      <!-- 2. DESKTOP SECTION NAVIGATION BAR (Visible on Desktop >= 769px) -->
      <div class="sections-desktop-nav" style="align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; border-bottom: 1px solid #E2E8F0; padding-bottom: 0.85rem; margin-bottom: 1.5rem;">
        <!-- Section Tabs -->
        <div style="display: flex; gap: 0.5rem; align-items: center; overflow-x: auto; padding: 2px;" id="programs-nav-bar">
          ${n.map(m=>{const M=m.id===d,x=r.filter(H=>{var z;return H.program_id===m.id||H.section_id&&((z=G[m.id])==null?void 0:z.includes(H.section_id))}).length;return`
              <button type="button" 
                      class="btn-section-tab ${M?"active":""}" 
                      data-prog-id="${m.id}" 
                      style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.85rem; font-weight: ${M?"700":"600"}; white-space: nowrap; cursor: pointer; transition: all 0.15s ease; border: 1px solid ${M?"#059669":"#CBD5E1"}; background-color: ${M?"#059669":"#FFFFFF"}; color: ${M?"#FFFFFF":"#1E293B"}; box-shadow: ${M?"0 2px 6px rgba(5, 150, 105, 0.25)":"none"};">
                <span style="color: ${M?"#FFFFFF":"#1E293B"}; font-weight: ${M?"700":"600"};">${m.name}</span>
                <span class="tab-count-badge" style="font-size: 0.72rem; padding: 0.1rem 0.45rem; border-radius: 9999px; background-color: ${M?"rgba(255, 255, 255, 0.28)":"#F1F5F9"}; color: ${M?"#FFFFFF":"#475569"}; font-weight: 700;">
                  ${x}
                </span>
              </button>
            `}).join("")}

          ${i?`
            <button type="button" id="btn-add-section-pill" style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.85rem; border-radius: 9999px; font-size: 0.82rem; font-weight: 600; white-space: nowrap; cursor: pointer; border: 1px dashed #CBD5E1; background: transparent; color: #64748B; transition: all 0.15s ease;" title="Create new section">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Section
            </button>
          `:""}
        </div>

        <!-- Active Section Quick Actions (Clean, minimal, right-aligned) -->
        ${i&&I?`
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <button type="button" class="btn btn-outline btn-sm btn-edit-prog" data-prog-id="${I.id}" title="Edit Section Name & Code" style="padding: 0.35rem 0.65rem; font-size: 0.8rem; font-weight: 600; color: #475569; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.3rem;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Edit Section
            </button>
            ${n.length>1?`
              <button type="button" class="btn btn-outline btn-sm btn-delete-prog" data-prog-id="${I.id}" title="Delete Section" style="padding: 0.35rem 0.65rem; font-size: 0.8rem; font-weight: 600; color: #DC2626; border-color: #FCA5A5; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.3rem;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Delete
              </button>
            `:""}
          </div>
        `:""}
      </div>

      <!-- Classrooms Grid (Minimal, human, user-friendly) -->
      ${I?N.length===0?`
        <div style="border: 1.5px dashed #CBD5E1; border-radius: 14px; padding: 3rem 1.5rem; text-align: center; background: #FAFAFA;">
          <h4 style="font-size: 1.05rem; font-weight: 700; color: #1E293B; margin: 0 0 0.4rem 0;">No classrooms in ${I.name}</h4>
          <p style="font-size: 0.85rem; color: #64748B; margin: 0 0 1.25rem 0;">Add classrooms or halls to start managing attendance and student rosters.</p>
          <button type="button" class="btn btn-primary btn-sm" id="btn-empty-add-cls" style="display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 600; padding: 0.45rem 1rem; border-radius: 8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add First Classroom
          </button>
        </div>
      `:`
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
          ${N.map(m=>{const M=m.gender_eligibility==="Boys",x=m.gender_eligibility==="Girls",H=M?"#EFF6FF":x?"#FDF2F8":"#F0FDF4",z=M?"#1D4ED8":x?"#BE185D":"#15803D",q=M?"#BFDBFE":x?"#FBCFE8":"#BBF7D0",A=m.teacher_id?(l||[]).find(v=>v.id===m.teacher_id):null,C=m.days&&Array.isArray(m.days)&&m.days.length>0?m.days:["Mon","Tue","Wed","Thu","Fri","Sat"];return`
              <div class="minimal-classroom-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.15rem; display: flex; flex-direction: column; justify-content: space-between; gap: 0.85rem; box-shadow: 0 1px 2px rgba(0,0,0,0.03); transition: border-color 0.15s ease, box-shadow 0.15s ease;">
                <!-- Card Header -->
                <div>
                  <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem;">
                    <div style="min-width: 0; flex: 1;">
                      <h4 style="margin: 0; font-size: 1rem; font-weight: 700; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${m.name}">
                        ${m.name}
                      </h4>
                      <div style="margin-top: 0.35rem;">
                        <span style="display: inline-block; font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 6px; background: ${H}; color: ${z}; border: 1px solid ${q};">
                          ${m.gender_eligibility||"Mixed"}
                        </span>
                      </div>
                    </div>

                    ${i?`
                      <div style="display: flex; align-items: center; gap: 0.25rem;">
                        <button type="button" class="btn-icon-minimal btn-edit-cls" data-cls-id="${m.id}" title="Edit Classroom" style="width: 28px; height: 28px; border-radius: 6px; border: 1px solid #E2E8F0; background: #FFFFFF; color: #64748B; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s ease;">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                        <button type="button" class="btn-icon-minimal btn-delete-cls" data-cls-id="${m.id}" title="Delete Classroom" style="width: 28px; height: 28px; border-radius: 6px; border: 1px solid #FEE2E2; background: #FFFFFF; color: #EF4444; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s ease;">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    `:""}
                  </div>

                  <!-- Assigned Teacher & 7 Days Rounds Row -->
                  <div class="cls-card-schedule-row">
                    <div class="cls-teacher-pill" title="${A?`Assigned Teacher: ${A.full_name||A.email}`:"No Teacher Assigned"}">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span class="cls-teacher-name ${A?"assigned":"unassigned"}">
                        ${A?A.full_name||A.email:"No teacher assigned"}
                      </span>
                    </div>

                    <!-- 7 Rounds for Days of Week -->
                    <div class="cls-card-days-row" title="Class Days of Week">
                      ${Ms.map(v=>{const F=C.includes(v.key);return`
                          <span class="day-round ${F?"active":"inactive"}" title="${v.full}: ${F?"Active":"Off"}">
                            ${v.short}
                          </span>
                        `}).join("")}
                    </div>
                  </div>

                  <!-- Class Timing (Mandatory) & Optional Room/Capacity -->
                  <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.75rem; font-size: 0.82rem; color: #475569;">
                    <div style="display: flex; align-items: center; gap: 0.35rem; font-weight: 600; color: #0F172A;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #059669; flex-shrink: 0;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span>${Le(m.start_time||"06:30")} – ${Le(m.end_time||"07:30")}</span>
                    </div>
                    ${m.room_number?`
                      <span style="color: #CBD5E1;">•</span>
                      <span style="color: #64748B;">Room <strong>${m.room_number}</strong></span>
                    `:""}
                    ${m.capacity?`
                      <span style="color: #CBD5E1;">•</span>
                      <span style="color: #64748B;"><strong>${m.capacity}</strong> seats</span>
                    `:""}
                    <span style="color: #CBD5E1;">•</span>
                    <span style="color: #0284C7; font-weight: 600;"><strong>${(m.student_ids||[]).length}</strong> students</span>
                  </div>
                </div>

                <!-- Minimal Action Buttons -->
                <div style="display: flex; gap: 0.5rem; border-top: 1px solid #F1F5F9; padding-top: 0.75rem;">
                  <button type="button" class="btn btn-outline btn-sm btn-att-cls" data-cls-id="${m.id}" style="flex: 1; font-size: 0.78rem; font-weight: 600; padding: 0.4rem; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    Attendance
                  </button>
                  <button type="button" class="btn btn-outline btn-sm btn-manage-cls" data-cls-id="${m.id}" style="flex: 1; font-size: 0.78rem; font-weight: 600; padding: 0.4rem; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    Students
                  </button>
                </div>
              </div>
            `}).join("")}

          <!-- Minimal Dashed Add Classroom Card -->
          ${i?`
            <button type="button" id="card-quick-add-cls" style="border: 1.5px dashed #CBD5E1; background: transparent; border-radius: 12px; min-height: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.4rem; cursor: pointer; color: #64748B; padding: 1.25rem; transition: all 0.15s ease;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: #F1F5F9; display: flex; align-items: center; justify-content: center; color: #059669;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <span style="font-size: 0.85rem; font-weight: 600; color: #334155;">Add Classroom</span>
            </button>
          `:""}
        </div>
      `:`
        <div style="text-align: center; padding: 4rem 1rem; color: #64748B;">
          <h4 style="font-size: 1.1rem; font-weight: 700; color: #1E293B; margin-bottom: 0.5rem;">No sections configured</h4>
          <p style="font-size: 0.85rem; margin-bottom: 1rem;">Create your first institutional section to organize classrooms.</p>
          <button type="button" class="btn btn-primary" id="btn-empty-add-sec">New Section</button>
        </div>
      `}
    `,(h=s.querySelector("#sec-mobile-trigger"))==null||h.addEventListener("click",()=>{Te({title:"Select Section to Manage",modalClass:"role-picker-modal-dialog",contentHtml:`
          <div style="margin-bottom: 0.5rem;">
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.85rem;">
              Select an institutional section to view and manage its classrooms:
            </p>
            <div class="role-picker-list">
              ${n.map(m=>{const M=m.id===d,x=r.filter(H=>{var z;return H.program_id===m.id||H.section_id&&((z=G[m.id])==null?void 0:z.includes(H.section_id))}).length;return`
                  <div class="role-picker-item ${M?"active":""}" data-prog-id="${m.id}" role="button" tabindex="0">
                    <div class="role-picker-item-left">
                      <div class="role-picker-item-icon" style="background: #ECFDF5; color: #059669; border: 1.5px solid #A7F3D0;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                      </div>
                      <div class="role-picker-item-info">
                        <div class="role-picker-item-title-row">
                          <span class="role-picker-item-name" style="font-weight: 700;">${m.name}</span>
                          ${M?'<span class="badge" style="background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; font-size: 0.65rem; font-weight: 700;">CURRENT</span>':""}
                        </div>
                        <span class="role-picker-item-desc" style="font-size: 0.78rem; color: #64748B;">${x} Classrooms configured</span>
                      </div>
                    </div>
                    <div class="role-picker-item-radio">
                      <div class="role-radio-circle ${M?"active":""}">
                        ${M?'<div class="role-radio-dot"></div>':""}
                      </div>
                    </div>
                  </div>
                `}).join("")}
            </div>
          </div>
        `,onMount:({container:m,close:M})=>{m.querySelectorAll(".role-picker-item").forEach(x=>{x.addEventListener("click",()=>{const H=x.getAttribute("data-prog-id");H&&H!==d?(d=H,M(),_()):M()})})}})}),(L=s.querySelector(".btn-mobile-new-section"))==null||L.addEventListener("click",p),s.querySelectorAll(".btn-section-tab").forEach(m=>{m.addEventListener("click",()=>{d=m.getAttribute("data-prog-id"),_()})}),(c=s.querySelector("#btn-header-add-section"))==null||c.addEventListener("click",p),(b=s.querySelector("#btn-add-section-pill"))==null||b.addEventListener("click",p),(E=s.querySelector("#btn-empty-add-sec"))==null||E.addEventListener("click",p),(k=s.querySelector("#btn-header-add-classroom"))==null||k.addEventListener("click",Y),(y=s.querySelector("#btn-empty-add-cls"))==null||y.addEventListener("click",Y),(u=s.querySelector("#card-quick-add-cls"))==null||u.addEventListener("click",Y),s.querySelectorAll(".btn-edit-prog").forEach(m=>{m.addEventListener("click",()=>{const M=m.getAttribute("data-prog-id")||d;Z(M)})}),s.querySelectorAll(".btn-delete-prog").forEach(m=>{m.addEventListener("click",()=>{const M=m.getAttribute("data-prog-id")||d;D(M)})}),s.querySelectorAll(".btn-att-cls").forEach(m=>{m.addEventListener("click",()=>{const M=m.getAttribute("data-cls-id");M&&sessionStorage.setItem("tps_active_att_cls",M),t("attendance")})}),s.querySelectorAll(".btn-manage-cls").forEach(m=>{m.addEventListener("click",()=>{const M=m.getAttribute("data-cls-id");j(M)})}),s.querySelectorAll(".btn-edit-cls").forEach(m=>{m.addEventListener("click",()=>{const M=m.getAttribute("data-cls-id");S(M)})}),s.querySelectorAll(".btn-delete-cls").forEach(m=>{m.addEventListener("click",()=>{const M=m.getAttribute("data-cls-id");$(M)})})}async function $(I){const G=r.find(h=>h.id===I);if(!G)return;await Qe({title:"Delete Classroom",message:`Delete classroom "${G.name}" (${G.room_number||"Room"})?`,confirmText:"Delete",isDanger:!0})&&(await W.deleteClassroom(I),oe.success(`Classroom "${G.name}" removed.`),await o(),_())}async function D(I){const G=n.find(h=>h.id===I);if(!G)return;if(n.length<=1){oe.error("At least one section must remain configured.");return}if(await Qe({title:"Delete Section",message:`Delete section "${G.name}" and all its classrooms?`,confirmText:"Delete Section",isDanger:!0}))try{await W.deleteProgram(I),oe.success(`Section "${G.name}" deleted.`),await o(),_()}catch(h){oe.error(h.message||"Could not delete section.")}}function p(){Te({title:"New Section",contentHtml:`
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label required">Section Name</label>
          <input type="text" id="prog-name-input" class="form-control" placeholder="e.g. Hostel Moral Class, Tuition Coaching" required />
        </div>
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">Short Code</label>
          <input type="text" id="prog-code-input" class="form-control" placeholder="e.g. MORAL, TUITION" />
        </div>
        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label class="form-label">Description (Optional)</label>
          <textarea id="prog-desc-input" class="form-control" rows="2" placeholder="Brief note about this section"></textarea>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" id="btn-cancel-modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-save-program">Create Section</button>
        </div>
      `,onMount:({container:I,close:G})=>{var N,h;(N=I.querySelector("#btn-cancel-modal"))==null||N.addEventListener("click",G),(h=I.querySelector("#btn-save-program"))==null||h.addEventListener("click",async()=>{const L=I.querySelector("#prog-name-input").value.trim(),c=I.querySelector("#prog-code-input").value.trim(),b=I.querySelector("#prog-desc-input").value.trim();if(!L){oe.error("Please enter a section name.");return}const E=await W.addProgram({name:L,code:c,description:b});oe.success(`Section "${L}" created.`),G(),d=E.id,await o(),_()})}})}function Z(I){const G=n.find(N=>N.id===I);G&&Te({title:`Edit Section — ${G.name}`,contentHtml:`
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label required">Section Name</label>
          <input type="text" id="edit-prog-name-input" class="form-control" value="${G.name}" required />
        </div>
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">Short Code</label>
          <input type="text" id="edit-prog-code-input" class="form-control" value="${G.code||""}" />
        </div>
        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label class="form-label">Description</label>
          <textarea id="edit-prog-desc-input" class="form-control" rows="2">${G.description||""}</textarea>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" id="btn-cancel-modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-save-edit-program">Save Changes</button>
        </div>
      `,onMount:({container:N,close:h})=>{var L,c;(L=N.querySelector("#btn-cancel-modal"))==null||L.addEventListener("click",h),(c=N.querySelector("#btn-save-edit-program"))==null||c.addEventListener("click",async()=>{const b=N.querySelector("#edit-prog-name-input").value.trim(),E=N.querySelector("#edit-prog-code-input").value.trim(),k=N.querySelector("#edit-prog-desc-input").value.trim();if(!b){oe.error("Please enter a section name.");return}await W.updateProgram(I,{name:b,code:E,description:k}),oe.success(`Section "${b}" updated.`),h(),await o(),_()})}})}function Y(){n.find(G=>G.id===d)||n[0];const I=w();Te({title:"Add Classroom",contentHtml:`
        <div class="form-group" style="margin-bottom: 0.9rem;">
          <label class="form-label required">Section</label>
          <select id="cls-prog-select" class="form-control">
            ${n.map(G=>`<option value="${G.id}" ${G.id===d?"selected":""}>${G.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-group" style="margin-bottom: 0.9rem;">
          <label class="form-label required">Classroom Name</label>
          <input type="text" id="cls-name-input" class="form-control" placeholder="e.g. Hostel Study Lab 1, Room 10A" required />
        </div>
        <div class="form-group" style="margin-bottom: 0.9rem;">
          <label class="form-label">Assign Teacher (Optional)</label>
          <select id="cls-teacher-select" class="form-control">
            <option value="">-- No Teacher Assigned --</option>
            ${I.map(G=>`<option value="${G.id}">${G.full_name||G.email} (${G.role==="teacher"?"Teacher":G.role||"Staff"})</option>`).join("")}
          </select>
        </div>
        <div class="form-group" style="margin-bottom: 0.9rem;">
          <label class="form-label" style="font-size: 0.75rem;">Teacher Assignment Start Date</label>
          <input type="date" id="cls-assigned-date" class="form-control" style="font-size: 0.8rem;" value="${new Date().toISOString().slice(0,10)}" />
          <div style="font-size: 0.7rem; color: #64748B; margin-top: 0.25rem;">
            Attendance obligations and missed attendance start from this date.
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.45rem;">
            <label class="form-label" style="margin-bottom: 0;">Class Days of Week</label>
            <div style="display: flex; gap: 0.35rem;">
              <button type="button" class="btn btn-xs btn-outline btn-quick-all" style="padding: 0.15rem 0.45rem; font-size: 0.72rem;">All</button>
              <button type="button" class="btn btn-xs btn-outline btn-quick-mon-sat" style="padding: 0.15rem 0.45rem; font-size: 0.72rem;">Mon–Sat</button>
              <button type="button" class="btn btn-xs btn-outline btn-quick-clear" style="padding: 0.15rem 0.45rem; font-size: 0.72rem;">Clear</button>
            </div>
          </div>
          <div class="cls-days-picker-row">
            ${Ms.map(G=>`
                <button type="button" class="cls-day-round-btn ${["Mon","Tue","Wed","Thu","Fri","Sat"].includes(G.key)?"active":""}" data-day="${G.key}" title="${G.full}">
                  <span class="day-char">${G.short}</span>
                </button>
              `).join("")}
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.9rem;">
          <div class="form-group">
            <label class="form-label required">Class Starting Time</label>
            <input type="time" id="cls-start-input" class="form-control" value="06:30" required />
          </div>
          <div class="form-group">
            <label class="form-label required">Class Ending Time</label>
            <input type="time" id="cls-end-input" class="form-control" value="07:30" required />
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 0.9rem;">
          <label class="form-label required">Gender</label>
          <select id="cls-gender-select" class="form-control">
            <option value="Mixed">Mixed</option>
            <option value="Boys">Boys</option>
            <option value="Girls">Girls</option>
          </select>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
          <div class="form-group">
            <label class="form-label">Room / Hall (Optional)</label>
            <input type="text" id="cls-room-input" class="form-control" placeholder="e.g. 106, Hall B" />
          </div>
          <div class="form-group">
            <label class="form-label">Capacity (Optional)</label>
            <input type="number" id="cls-cap-input" class="form-control" placeholder="e.g. 35" min="1" max="200" />
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" id="btn-cancel-modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-save-classroom">Create Classroom</button>
        </div>
      `,onMount:({container:G,close:N})=>{var h,L,c,b,E;G.querySelectorAll(".cls-day-round-btn").forEach(k=>{k.addEventListener("click",y=>{y.preventDefault(),k.classList.toggle("active")})}),(h=G.querySelector(".btn-quick-all"))==null||h.addEventListener("click",k=>{k.preventDefault(),G.querySelectorAll(".cls-day-round-btn").forEach(y=>y.classList.add("active"))}),(L=G.querySelector(".btn-quick-mon-sat"))==null||L.addEventListener("click",k=>{k.preventDefault(),G.querySelectorAll(".cls-day-round-btn").forEach(y=>{y.getAttribute("data-day")!=="Sun"?y.classList.add("active"):y.classList.remove("active")})}),(c=G.querySelector(".btn-quick-clear"))==null||c.addEventListener("click",k=>{k.preventDefault(),G.querySelectorAll(".cls-day-round-btn").forEach(y=>y.classList.remove("active"))}),(b=G.querySelector("#btn-cancel-modal"))==null||b.addEventListener("click",N),(E=G.querySelector("#btn-save-classroom"))==null||E.addEventListener("click",async()=>{var C,v;const k=G.querySelector("#cls-prog-select").value,y=G.querySelector("#cls-name-input").value.trim(),u=((C=G.querySelector("#cls-teacher-select"))==null?void 0:C.value)||"",m=((v=G.querySelector("#cls-assigned-date"))==null?void 0:v.value)||new Date().toISOString().slice(0,10),M=Array.from(G.querySelectorAll(".cls-day-round-btn.active")).map(F=>F.getAttribute("data-day")),x=G.querySelector("#cls-start-input").value||"06:30",H=G.querySelector("#cls-end-input").value||"07:30",z=G.querySelector("#cls-room-input").value.trim(),q=G.querySelector("#cls-cap-input").value.trim(),A=G.querySelector("#cls-gender-select").value;if(!y){oe.error("Please enter a classroom name.");return}await W.addClassroom({program_id:k,name:y,start_time:x,end_time:H,room_number:z,capacity:q?Number(q):null,gender_eligibility:A,teacher_id:u,teacher_assigned_date:m,days:M}),oe.success(`Classroom "${y}" added.`),N(),d=k,await o(),_()})}})}function S(I){const G=r.find(c=>c.id===I);if(!G)return;const N=G.program_id||d,h=w(),L=G.days&&Array.isArray(G.days)&&G.days.length>0?G.days:["Mon","Tue","Wed","Thu","Fri","Sat"];Te({title:`Edit Classroom — ${G.name}`,contentHtml:`
        <div class="form-group" style="margin-bottom: 0.9rem;">
          <label class="form-label required">Section</label>
          <select id="edit-cls-prog-select" class="form-control">
            ${n.map(c=>`<option value="${c.id}" ${c.id===N?"selected":""}>${c.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-group" style="margin-bottom: 0.9rem;">
          <label class="form-label required">Classroom Name</label>
          <input type="text" id="edit-cls-name-input" class="form-control" value="${G.name}" required />
        </div>
        <div class="form-group" style="margin-bottom: 0.9rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
            <label class="form-label" style="margin-bottom: 0;">Assign Teacher (Optional)</label>
            ${G.teacher_id?`
              <button type="button" class="btn btn-xs btn-outline" id="btn-quick-remove-teacher" style="color: #EF4444; border-color: #FECACA; font-size: 0.72rem; padding: 0.15rem 0.5rem;">
                ✕ Remove Teacher from Class
              </button>
            `:""}
          </div>
          <select id="edit-cls-teacher-select" class="form-control">
            <option value="">-- No Teacher Assigned --</option>
            ${h.map(c=>`<option value="${c.id}" ${G.teacher_id===c.id?"selected":""}>${c.full_name||c.email} (${c.role==="teacher"?"Teacher":c.role||"Staff"})</option>`).join("")}
          </select>
        </div>
        <div class="form-group" style="margin-bottom: 0.9rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 0.65rem 0.8rem;">
          <div style="font-size: 0.75rem; font-weight: 700; color: #1E293B; margin-bottom: 0.35rem;">
            Faculty Duty Tenure & Attendance Window
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <div>
              <label class="form-label" style="font-size: 0.72rem; margin-bottom: 0.2rem;">Assignment Start Date</label>
              <input type="date" id="edit-cls-assigned-date" class="form-control" style="font-size: 0.78rem;" value="${G.teacher_assigned_date||"2026-10-01"}" />
            </div>
            <div>
              <label class="form-label" style="font-size: 0.72rem; margin-bottom: 0.2rem;">Removal / End Date</label>
              <input type="date" id="edit-cls-removed-date" class="form-control" style="font-size: 0.78rem;" value="${G.teacher_removed_date||""}" placeholder="Active" />
            </div>
          </div>
          <div style="font-size: 0.7rem; color: #64748B; margin-top: 0.35rem;">
            Attendance duties are tracked only between assignment start and removal dates. If removed, duties end immediately on the removal date.
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.45rem;">
            <label class="form-label" style="margin-bottom: 0;">Class Days of Week</label>
            <div style="display: flex; gap: 0.35rem;">
              <button type="button" class="btn btn-xs btn-outline btn-quick-all" style="padding: 0.15rem 0.45rem; font-size: 0.72rem;">All</button>
              <button type="button" class="btn btn-xs btn-outline btn-quick-mon-sat" style="padding: 0.15rem 0.45rem; font-size: 0.72rem;">Mon–Sat</button>
              <button type="button" class="btn btn-xs btn-outline btn-quick-clear" style="padding: 0.15rem 0.45rem; font-size: 0.72rem;">Clear</button>
            </div>
          </div>
          <div class="cls-days-picker-row">
            ${Ms.map(c=>`
                <button type="button" class="cls-day-round-btn ${L.includes(c.key)?"active":""}" data-day="${c.key}" title="${c.full}">
                  <span class="day-char">${c.short}</span>
                </button>
              `).join("")}
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.9rem;">
          <div class="form-group">
            <label class="form-label required">Class Starting Time</label>
            <input type="time" id="edit-cls-start-input" class="form-control" value="${G.start_time||"06:30"}" required />
          </div>
          <div class="form-group">
            <label class="form-label required">Class Ending Time</label>
            <input type="time" id="edit-cls-end-input" class="form-control" value="${G.end_time||"07:30"}" required />
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 0.9rem;">
          <label class="form-label required">Gender</label>
          <select id="edit-cls-gender-select" class="form-control">
            <option value="Mixed" ${(G.gender_eligibility||"Mixed")==="Mixed"?"selected":""}>Mixed</option>
            <option value="Boys" ${G.gender_eligibility==="Boys"?"selected":""}>Boys</option>
            <option value="Girls" ${G.gender_eligibility==="Girls"?"selected":""}>Girls</option>
          </select>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
          <div class="form-group">
            <label class="form-label">Room / Hall (Optional)</label>
            <input type="text" id="edit-cls-room-input" class="form-control" value="${G.room_number||""}" placeholder="e.g. 101" />
          </div>
          <div class="form-group">
            <label class="form-label">Capacity (Optional)</label>
            <input type="number" id="edit-cls-cap-input" class="form-control" value="${G.capacity||""}" placeholder="e.g. 35" min="1" max="200" />
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" id="btn-cancel-modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-save-edit-classroom">Save Changes</button>
        </div>
      `,onMount:({container:c,close:b})=>{var E,k,y,u,m,M;c.querySelectorAll(".cls-day-round-btn").forEach(x=>{x.addEventListener("click",H=>{H.preventDefault(),x.classList.toggle("active")})}),(E=c.querySelector(".btn-quick-all"))==null||E.addEventListener("click",x=>{x.preventDefault(),c.querySelectorAll(".cls-day-round-btn").forEach(H=>H.classList.add("active"))}),(k=c.querySelector(".btn-quick-mon-sat"))==null||k.addEventListener("click",x=>{x.preventDefault(),c.querySelectorAll(".cls-day-round-btn").forEach(H=>{H.getAttribute("data-day")!=="Sun"?H.classList.add("active"):H.classList.remove("active")})}),(y=c.querySelector(".btn-quick-clear"))==null||y.addEventListener("click",x=>{x.preventDefault(),c.querySelectorAll(".cls-day-round-btn").forEach(H=>H.classList.remove("active"))}),(u=c.querySelector("#btn-quick-remove-teacher"))==null||u.addEventListener("click",x=>{x.preventDefault();const H=c.querySelector("#edit-cls-teacher-select");H&&(H.value="");const z=c.querySelector("#edit-cls-removed-date");z&&(z.value=new Date().toISOString().slice(0,10)),oe.info("Teacher marked for removal on today's date. Save changes to confirm.")}),(m=c.querySelector("#btn-cancel-modal"))==null||m.addEventListener("click",b),(M=c.querySelector("#btn-save-edit-classroom"))==null||M.addEventListener("click",async()=>{var de,le,ne;const x=c.querySelector("#edit-cls-prog-select").value,H=c.querySelector("#edit-cls-name-input").value.trim(),z=((de=c.querySelector("#edit-cls-teacher-select"))==null?void 0:de.value)||"",q=((le=c.querySelector("#edit-cls-assigned-date"))==null?void 0:le.value)||(z?"2026-10-01":null),A=((ne=c.querySelector("#edit-cls-removed-date"))==null?void 0:ne.value)||(z?null:new Date().toISOString().slice(0,10)),C=Array.from(c.querySelectorAll(".cls-day-round-btn.active")).map(g=>g.getAttribute("data-day")),v=c.querySelector("#edit-cls-start-input").value||"06:30",F=c.querySelector("#edit-cls-end-input").value||"07:30",f=c.querySelector("#edit-cls-room-input").value.trim(),te=c.querySelector("#edit-cls-cap-input").value.trim(),K=c.querySelector("#edit-cls-gender-select").value;if(!H){oe.error("Please enter a classroom name.");return}await W.updateClassroom(I,{program_id:x,name:H,start_time:v,end_time:F,room_number:f,capacity:te?Number(te):null,gender_eligibility:K,teacher_id:z,teacher_assigned_date:q,teacher_removed_date:A,days:C}),oe.success(`Classroom "${H}" updated.`),b(),await o(),_()})}})}async function j(I){const G=r.find(m=>m.id===I);if(!G)return;const N=n.find(m=>m.id===(G.program_id||d)),L=(await W.getStudents()).filter(m=>We(m));L.sort((m,M)=>{const x=m.admission_number||"",H=M.admission_number||"";return x.localeCompare(H,void 0,{numeric:!0})});const c=Array.from(new Set(L.map(m=>m.school_class).filter(Boolean))).sort(),b=await W.getClassroomStudents(I),E=new Set(b);let k="";const y=`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    `,u=`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    `;Te({title:`Assign Students — ${G.name}`,size:"lg",modalClass:"assign-students-modal",contentHtml:`
        <div class="assign-modal-wrapper">
          <!-- Top Section (Fixed) -->
          <div class="assign-modal-top">
            <div class="assign-meta-bar">
              <div class="assign-meta-left">
                <span class="assign-section-tag">${N?N.name:"Section"}</span>
                <span class="assign-gender-tag">${G.gender_eligibility||"Mixed"}</span>
              </div>
              <div class="assign-meta-right">
                <span id="assign-counter-banner" class="assign-count-pill">
                  <strong>${E.size}</strong>/${L.length} assigned
                </span>
              </div>
            </div>

            <!-- Search and Dropdowns Wrapper (Single line on Desktop, Stacked on Mobile) -->
            <div class="assign-filters-wrapper">
              <div class="assign-search-box">
                <svg class="assign-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" id="assign-search-input" class="form-control" placeholder="Search by student name, DOB, or admission no..." />
              </div>

              <!-- Two Dropdowns: Class & Gender -->
              <div class="assign-dropdowns-row">
                <select id="assign-class-select" class="form-control assign-select">
                  <option value="all">All Classes</option>
                  ${c.map(m=>`<option value="${m}">${m}</option>`).join("")}
                </select>
                <select id="assign-gender-select" class="form-control assign-select">
                  <option value="all">All Genders</option>
                  <option value="Boys" ${G.gender_eligibility==="Boys"?"selected":""}>Boys</option>
                  <option value="Girls" ${G.gender_eligibility==="Girls"?"selected":""}>Girls</option>
                </select>
              </div>
            </div>

            <!-- Quick Action Row -->
            <div class="assign-quick-row">
              <span class="assign-visible-count" id="assign-visible-count">Showing ${L.length} students</span>
              <div class="assign-quick-buttons">
                <button type="button" class="btn-text-action" id="btn-select-visible">Select All</button>
                <span style="color: #CBD5E1;">•</span>
                <button type="button" class="btn-text-action" id="btn-deselect-visible">Clear All</button>
              </div>
            </div>
          </div>

          <!-- Scrollable Spacious 1-Column Students List (Flex 1) -->
          <div class="assign-students-list-container">
            <div class="assign-students-list" id="assign-students-list"></div>
            <div id="assign-empty-state" style="display: none; padding: 3rem 1rem; text-align: center; color: #94A3B8; font-size: 0.9rem;">
              No students match your search or filter criteria.
            </div>
          </div>

          <!-- Pinned Fixed Footer -->
          <div class="assign-footer-bar">
            <div class="assign-footer-info">
              <strong id="assign-footer-count">${E.size}</strong> selected
            </div>
            <div class="assign-footer-btns">
              <button type="button" class="btn btn-outline btn-sm" id="btn-modal-cancel">Cancel</button>
              <button type="button" class="btn btn-primary btn-sm" id="btn-save-assignments" style="background: #00A3E0; border-color: #00A3E0; font-weight: 600;">
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      `,onMount:({container:m,close:M})=>{var de,le,ne,g;const x=m.querySelector("#assign-students-list"),H=m.querySelector("#assign-empty-state"),z=m.querySelector("#assign-search-input"),q=m.querySelector("#assign-class-select"),A=m.querySelector("#assign-gender-select"),C=m.querySelector("#assign-counter-banner"),v=m.querySelector("#assign-footer-count"),F=m.querySelector("#assign-visible-count");function f(){const X=E.size;C&&(C.innerHTML=`<strong>${X}</strong>/${L.length} assigned`),v&&(v.textContent=X)}function te(){const X=q.value,ie=A.value,se=k.toLowerCase().trim();return L.filter(ce=>{const ae=["female","girl","girls"].includes((ce.gender||"").toLowerCase())?"Girls":"Boys";if(X!=="all"&&(ce.school_class||"")!==X||ie!=="all"&&ae!==ie)return!1;if(se){const R=(ce.full_name||"").toLowerCase().includes(se),U=(ce.admission_number||"").replace(/-/g,"").toLowerCase().includes(se),T=(ce.dob||"").toLowerCase().includes(se),O=(ce.s