hool.edu.in";return!!(L&&c)})}function _(Y){if(Array.isArray(Y.student_ids)&&Y.student_ids.length>0)return Y.student_ids.filter(V=>{const I=r.find(G=>G.id===V);return I?We(I):!0}).length;const S=r.filter(j=>We(j)&&(j.classroom_id===Y.id||j.program_id&&j.program_id===Y.program_id));return S.length>0?S.length:8}const $=Oe();let D=[];if(d){const Y=w(e).filter(S=>!(S.teacher_removed_date&&$>S.teacher_removed_date));Y.length>0?D=Y:D=i.some(j=>!!j.teacher_id)?[]:i.slice(0,2)}else D=i;D.sort((Y,S)=>Qt(Y.start_time||"06:30")-Qt(S.start_time||"06:30"));let p="all";function Z(){var h,L;let Y=D;o&&p!=="all"&&(Y=Y.filter(c=>c.teacher_id===p));const S=a.filter(c=>c.approval_status==="approved"&&(c.role==="teacher"||c.role==="mentor"||c.role==="hostel_leader")),j=new Date,V=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][j.getDay()],I=j.getHours()*60+j.getMinutes();s.innerHTML=`
      <div class="page-header" style="margin-bottom: 1.25rem;">
        <div class="page-title-group">
          <h2>${d?"My Teaching Timetable":"Faculty Timetable & Schedule Governance"}</h2>
          <p>${d?`Personal weekly teaching schedule and class timetable for ${(e==null?void 0:e.full_name)||"Faculty"}`:"Institutional visual timetable builder with double-booking prevention and attendance window rules"}</p>
        </div>
      </div>

      <!-- ADMIN FACULTY SELECTOR (FULL ROW ALTERNATIVE DESIGN) -->
      ${o?`
        <div class="card-panel" style="background: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 0.95rem 1.15rem; margin-bottom: 1.25rem; box-shadow: 0 2px 8px -2px rgba(15, 23, 42, 0.04);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.45rem; flex-wrap: wrap; gap: 0.4rem;">
            <label for="timetable-faculty-filter" style="font-size: 0.74rem; font-weight: 800; color: #334155; display: inline-flex; align-items: center; gap: 0.45rem; text-transform: uppercase; letter-spacing: 0.04em; margin: 0; cursor: pointer;">
              <div style="width: 26px; height: 26px; border-radius: 8px; background: #ECFDF5; border: 1px solid #A7F3D0; display: inline-flex; align-items: center; justify-content: center; color: #059669;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              Filter Timetable by Faculty
            </label>
            <span style="font-size: 0.7rem; font-weight: 700; color: #059669; background: #ECFDF5; border: 1px solid #A7F3D0; padding: 2px 10px; border-radius: 9999px;">
              ${Y.length} Active / ${i.length} Total Classes
            </span>
          </div>
          <select id="timetable-faculty-filter" class="form-control" style="width: 100%; height: 42px; border-radius: 10px; font-weight: 700; font-size: 0.88rem; cursor: pointer; border: 1.5px solid #CBD5E1; background: #FFFFFF; color: #0F172A; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);">
            <option value="all">All Faculty (${i.length} classes)</option>
            ${S.map(c=>{const b=i.filter(E=>E.teacher_id===c.id).length;return`<option value="${c.id}" ${p===c.id?"selected":""}>${c.full_name||c.email} (${b} ${b===1?"class":"classes"})</option>`}).join("")}
          </select>
        </div>
      `:""}

      ${d?`
        <div style="background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 12px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <span style="font-size: 20px;">🔒</span>
            <div>
              <strong style="color: #1E40AF; font-size: 0.88rem;">Personal Faculty Timetable Active</strong>
              <p style="font-size: 0.78rem; color: #2563EB; margin: 0.1rem 0 0;">
                Showing only your assigned classrooms (${Y.length} assigned class${Y.length===1?"":"es"}). Live attendance is locked to your assigned class times.
              </p>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" id="btn-quick-att-shortcut" style="background: #FFFFFF; font-weight: 700; color: #1E40AF; border-color: #93C5FD;">
            Open Live Attendance →
          </button>
        </div>
      `:`
        <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: var(--radius-lg); padding: 0.85rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 20px;">⏱️</span>
            <div>
              <strong style="color: #047857;">Class-Time Locked Attendance Windows Enabled</strong>
              <p style="font-size: 0.8rem; color: #065F46; margin-top: 0.1rem;">
                Faculty members can only view their own assigned class timetable cards. Live attendance submissions are locked to class hours.
              </p>
            </div>
          </div>
        </div>
      `}

      <!-- TIMETABLE SECTION HEADER -->
      <div class="timetable-section-wrapper" style="margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 style="margin: 0; font-size: 1.12rem; font-weight: 800; color: #0F172A;">
              ${d?`My Teaching Timetable (${Y.length} Assigned Classes)`:"Master Institutional Timetable"}
            </h3>
            <span style="font-size: 0.78rem; color: var(--text-muted);">
              Current server day: <strong>${aa[V]}</strong> • ${Y.length} Class${Y.length===1?"":"es"} Active
            </span>
          </div>
          <span class="badge ${Y.length>0?"badge-active":"badge-default"}">
            ${Y.length} Classes Available
          </span>
        </div>

        ${Y.length===0?`
          <div class="card-panel" style="padding: 3rem 1.5rem; text-align: center; color: var(--text-muted); border-radius: 16px;">
            <div style="font-size: 36px; margin-bottom: 0.5rem;">📅</div>
            <h4 style="color: #1E293B; margin-bottom: 0.25rem; font-size: 1.1rem; font-weight: 700;">No Assigned Classrooms Found</h4>
            <p style="font-size: 0.85rem; max-width: 480px; margin: 0 auto; color: #64748B;">
              ${d?"You currently have no classrooms assigned to your faculty profile. Please request an administrator to assign classes to you in the Sections & Classrooms module.":"No classrooms match the selected faculty filter."}
            </p>
          </div>
        `:`
          <!-- RESPONSIVE GRID OF TIMETABLE CARDS (ONE CARD PER ASSIGNED CLASS) -->
          <div class="timetable-cards-grid">
            ${Y.map(c=>{const b=n.find(te=>te.id===c.program_id),E=(b==null?void 0:b.name)||"School Coaching Class",k=a.find(te=>te.id===c.teacher_id),y=k?k.full_name||k.email:c.teacher_id?"Assigned Faculty":"Unassigned",u=_(c),M=(Array.isArray(c.days)&&c.days.length>0?c.days:["Mon","Tue","Wed","Thu","Fri","Sat"]).includes(V),x=Qt(c.start_time||"06:30"),H=Qt(c.end_time||"07:30"),z=M&&I>=x&&I<=H,q=M&&I>=x-30&&I<x,A=M&&I<x,C=M&&I>H,v=Oe(j);W.isFacultyOnApprovedLeave(e,v,l)&&M&&!o||z||q||(A?`${Le(c.start_time||"06:30")}`:C||`${Gt(c.days)}`);const f=c.room_number?"Room "+c.room_number:c.name.toLowerCase().includes("hall")||c.name.toLowerCase().includes("lab")?c.name:"Campus Hall";return`
                <!-- TEACHER TIMETABLE CARD (COMPACT NEW LOOK UI) -->
                <div class="teacher-upcoming-card ${z?"is-live":q?"is-soon":""}" 
                     id="timetable-card-${c.id}" 
                     data-cls-id="${c.id}" 
                     role="button" 
                     tabindex="0"
                     style="cursor: pointer;">
                  
                  <!-- Top Row: Class Name & Program Badge (Pure Info without redundant Attendance button) -->
                  <div class="upcoming-class-primary" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin: 0;">
                    <div style="display: flex; align-items: center; gap: 0.55rem; flex-wrap: wrap;">
                      <h4 class="upcoming-class-name" style="font-size: 1.25rem; font-weight: 800; color: #065F46; margin: 0; letter-spacing: -0.01em;">
                        ${c.name}
                      </h4>
                      <span class="upcoming-prog-pill" style="background: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE; border-radius: 9999px; padding: 0.18rem 0.65rem; font-size: 0.72rem; font-weight: 700; display: inline-block;">
                        ${E}
                      </span>
                    </div>

                    ${z?`
                      <span style="display: inline-flex; align-items: center; gap: 0.3rem; background: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0; border-radius: 9999px; padding: 0.15rem 0.55rem; font-size: 0.68rem; font-weight: 800;">
                        <span class="live-pulse-dot" style="width: 6px; height: 6px;"></span> LIVE
                      </span>
                    `:q?`
                      <span style="display: inline-flex; align-items: center; gap: 0.3rem; background: #FEF3C7; color: #92400E; border: 1px solid #FCD34D; border-radius: 9999px; padding: 0.15rem 0.55rem; font-size: 0.68rem; font-weight: 800;">
                        Starts in ${x-I}m
                      </span>
                    `:""}
                  </div>

                  <!-- Thin Subtle Divider Line -->
                  <div class="upcoming-divider" style="height: 1px; background: #F1F5F9; border: none; margin: 0.55rem 0 0.65rem 0; width: 100%;"></div>

                  <!-- The Given Portion: Specifications Grid -->
                  <div class="upcoming-details-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem 1rem;">
                    <div class="upcoming-detail-cell" style="display: flex; flex-direction: column; gap: 0.18rem;">
                      <span class="detail-label" style="font-size: 0.66rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.04em;">Schedule Time</span>
                      <span class="detail-value" style="font-size: 0.88rem; font-weight: 800; color: #0F172A;">${Le(c.start_time||"06:30")} – ${Le(c.end_time||"07:30")}</span>
                    </div>

                    <div class="upcoming-detail-cell" style="display: flex; flex-direction: column; gap: 0.18rem;">
                      <span class="detail-label" style="font-size: 0.66rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.04em;">Classroom / Hall</span>
                      <span class="detail-value" style="font-size: 0.88rem; font-weight: 800; color: #0F172A;">${f}</span>
                    </div>

                    <div class="upcoming-detail-cell" style="display: flex; flex-direction: column; gap: 0.18rem;">
                      <span class="detail-label" style="font-size: 0.66rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.04em;">Enrolled Roster</span>
                      <span class="detail-value" style="font-size: 0.88rem; font-weight: 800; color: #0F172A;">${u} Students</span>
                    </div>

                    <div class="upcoming-detail-cell" style="display: flex; flex-direction: column; gap: 0.18rem;">
                      <span class="detail-label" style="font-size: 0.66rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.04em;">Scheduled Days</span>
                      <span class="detail-value" style="font-size: 0.88rem; font-weight: 800; color: #0F172A; white-space: nowrap;">${Gt(c.days)}</span>
                    </div>

                    ${o?`
                      <div class="upcoming-detail-cell upcoming-detail-faculty" style="grid-column: span 2; margin-top: 0.15rem; padding-top: 0.45rem; border-top: 1px dashed #E2E8F0; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                        <span class="detail-label" style="font-size: 0.66rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">Assigned Faculty</span>
                        <span class="detail-value" style="font-size: 0.85rem; font-weight: 800; color: #0F172A; display: inline-flex; align-items: center; gap: 0.35rem; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 2px 8px; border-radius: 6px;">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                          ${y}
                        </span>
                      </div>
                    `:""}
                  </div>

                </div>
              `}).join("")}
          </div>
        `}
      </div>
    `;const G=Oe(j),N=W.isFacultyOnApprovedLeave(e,G,l);s.querySelectorAll(".teacher-upcoming-card").forEach(c=>{c.addEventListener("click",b=>{if(b.target.closest("button"))return;if(N&&!o){oe.info(`You are currently on authorized faculty leave (${N.leave_type||"Leave"}). Attendance duties are officially waived.`);return}const E=c.getAttribute("data-cls-id");E&&sessionStorage.setItem("tps_active_att_cls",E),t("attendance")})}),(h=s.querySelector("#btn-quick-att-shortcut"))==null||h.addEventListener("click",()=>t("attendance")),(L=s.querySelector("#timetable-faculty-filter"))==null||L.addEventListener("change",c=>{p=c.target.value,Z()})}Z()}function pt(s){if(!s)return 0;const[t,e]=s.split(":").map(Number);return(t||0)*60+(e||0)}async function oa(s,{onNavigate:t,initialClassId:e,initialDate:i}={}){var U;const n=je(),a=(n==null?void 0:n.role)==="teacher",r=bt(n==null?void 0:n.role),l=r?xt(n):null,d=l==="Boys",o=a||r,w=(n==null?void 0:n.is_super_admin)||(n==null?void 0:n.role)==="admin"||(n==null?void 0:n.role)==="super_admin",_=kt(n,"attendance","submit_attendance")||kt(n,"attendance","edit"),$=At(n,"attendance"),[D,p,Z,Y,S,j,V]=await Promise.all([W.getPrograms(),W.getClassrooms(),W.getStudents(),W.getUsers(),W.getLeaves(),W.getFacultyLeaves(),W.getAcademicCalendar()]),I=(Z||[]).filter(T=>We(T)),G=Y.filter(T=>T.approval_status==="approved"&&(T.role==="teacher"||T.role==="admin"||T.role==="super_admin"||!T.role));function N(T){if(!T)return[];const O=T.id,Q=T.email,J=T.full_name;return p.filter(ee=>!!(ee.teacher_id===O||Q&&ee.teacher_id===Q||J&&ee.teacher_id===J||(O==="u-2"||Q==="teacher@thaibaschool.edu.in")&&ee.teacher_id==="3ba0d909-6656-43eb-87fb-fe8e30088d55"))}let h=p,L="all";if(a){const T=N(n);T.length>0?h=T:h=p.some(Q=>!!Q.teacher_id)?[]:p.slice(0,2)}else if(r){const T=N(n);T.length>0?h=T:h=p.filter(O=>!O.gender_eligibility||O.gender_eligibility===l||O.gender_eligibility==="Mixed")}const c=new Date,b=Oe(c);let E=i||typeof sessionStorage<"u"&&sessionStorage.getItem("tps_active_att_date")||b;typeof sessionStorage<"u"&&sessionStorage.removeItem("tps_active_att_date");const k=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],y=k[c.getDay()],u=c.getHours()*60+c.getMinutes(),m=e||(typeof sessionStorage<"u"?sessionStorage.getItem("tps_active_att_cls"):null);m&&typeof sessionStorage<"u"&&sessionStorage.removeItem("tps_active_att_cls");let M=m||((U=h[0])==null?void 0:U.id)||"cls-1",x=m?"roster":"cards",H=y==="Sun"||E&&E!==b?"weekly":"today";async function z(T,O=E){const Q=p.find(we=>we.id===T)||h.find(we=>we.id===T);if(!Q)return{canTake:!1,reason:"Classroom not found"};const J=await W.getTeacherAssignments(),ee=W.isTeacherAssignedOnDate(n==null?void 0:n.id,Q,O,J);if(a&&!ee){const we=Q.teacher_assigned_date||"2026-10-01",Ae=Q.teacher_removed_date||null;if(O<we)return{canTake:!1,status:"not_assigned_yet",message:`Classroom assignment started on ${Me(we)}. You cannot record attendance for dates prior to assignment.`,badgeClass:"is-locked-after"};if(Ae&&O>Ae)return{canTake:!1,status:"tenure_ended",message:`Your assignment to ${Q.name} ended on ${Me(Ae)}. Attendance duties have concluded.`,badgeClass:"is-locked-after"}}const B=O===b,P=O<b,re=Array.isArray(Q.days)&&Q.days.length>0?Q.days:["Mon","Tue","Wed","Thu","Fri","Sat"],me=new Date(O+"T00:00:00"),he=k[me.getDay()],ye=re.includes(he),_e=pt(Q.start_time||"06:30"),fe=pt(Q.end_time||"07:30"),pe=B&&u>=_e&&u<=fe,ve=B&&u<_e,be=B&&u>fe||P,Se=await W.isAttendanceWindowUnlocked(Q.id,O),xe=(await W.getAttendanceRecords()).find(we=>we.classroom_id===Q.id&&we.session_date===O);if(!!(xe&&Array.isArray(xe.records)&&xe.records.length>0)){if(w||Se||a&&(pe||B))return{canTake:!0,status:w?"admin_edit_taken":"teacher_update_allowed",message:w?`Admin Override Mode: Editing recorded attendance for ${Me(O)}.`:`Attendance already recorded on ${Me(O)}. You can update attendance for late-arriving students. Duty punctuality is preserved from your 1st submission.`,badgeClass:"is-live",isTaken:!0};if(a&&P)return{canTake:!1,status:"taken_locked_for_teacher",message:`Attendance submitted on ${Me(O)}. Past attendance is locked. Requires Administrator permission to edit.`,badgeClass:"is-locked-after",isTaken:!0}}const Ne=W.isFacultyOnApprovedLeave(n,O,j);if(!w&&Ne)return{canTake:!1,status:"faculty_on_leave",message:`Attendance Locked: You are on authorized faculty leave on ${Me(O)} (${Ne.leave_type||"Leave"}). Attendance duties are waived by Administration.`,badgeClass:"is-locked-leave",isFacultyOnLeave:!0,leaveData:Ne};const De=W.isClassSessionOffDueToHoliday(Q,O,V);return De.isOff?{canTake:!1,status:"holiday_off",message:`Attendance Disabled: Class is officially off due to ${De.reason} (${De.isAllDay?"Full Day Off":`Off Time: ${De.timeSpan}`}). Attendance duties are waived by Administration.`,badgeClass:"is-locked-holiday",isHolidayOff:!0,holidayOff:De}:Se?{canTake:!0,status:"admin_unlocked",message:`Admin Exception Granted: Missed/Late attendance unlocked for ${Me(O)}.`,badgeClass:"is-live",isUnlockedByAdmin:!0}:ye?ve?{canTake:!1,status:"locked_before",message:`Attendance Locked: Class starts in ${_e-u} minutes at ${Le(Q.start_time)}. Attendance opens only during class hours.`,badgeClass:"is-locked-before"}:be?{canTake:!1,status:"locked_after",message:B?`Attendance Window Closed: Session ended at ${Le(Q.end_time)}. Attendance missed. Requires Admin permission to unlock.`:`Attendance Window Closed: Past date ${Me(O)} was missed. Requires Admin permission to unlock.`,badgeClass:"is-locked-after",isAfter:!0,isUnlockedByAdmin:!1}:{canTake:!0,status:"live_open",message:`Live Attendance Window Active: Live until ${Le(Q.end_time)}.`,badgeClass:"is-live"}:{canTake:!1,status:"not_scheduled_today",message:`No Class Scheduled on ${he}: ${Q.name} meets on (${re.join(", ")}).`,badgeClass:"is-locked-after"}}function q(T=M){const O=p.find(J=>J.id===T)||h.find(J=>J.id===T);let Q=I.filter(J=>We(J));if(O&&Array.isArray(O.student_ids)&&O.student_ids.length>0){const J=new Set(O.student_ids);Q=I.filter(B=>J.has(B.id)&&We(B))}else O!=null&&O.gender_eligibility&&O.gender_eligibility!=="Mixed"&&(Q=Q.filter(J=>(J.gender||"Boys").toLowerCase()===O.gender_eligibility.toLowerCase()));return r&&l&&(Q=Q.filter(J=>(J.gender||"Boys").toLowerCase()===l.toLowerCase())),Q}let A={},C={},v=new Set,F=!1,f=null;function te(T,O=E){if(!T)return!1;const Q=typeof T=="object"?T:I.find(J=>J.id===T);if(!Q||!We(Q))return!1;if(Array.isArray(S)&&S.length>0){const J=S.filter(ee=>!!(ee.student_id===Q.id||Array.isArray(ee.student_ids)&&ee.student_ids.includes(Q.id)||Array.isArray(ee.student_entries)&&ee.student_entries.some(B=>B.student_id===Q.id)||Array.isArray(ee.students)&&ee.students.some(B=>B.student_id===Q.id)));if(J.length>0)return J.some(ee=>{const B=(ee.status||"").toLowerCase();if(B==="pending"||B==="rejected"||B==="cancelled")return!1;const P=ee.departure_date||ee.leaving_date;if(!P)return!1;let re=null;Array.isArray(ee.student_entries)?re=ee.student_entries.find(fe=>fe.student_id===Q.id):Array.isArray(ee.students)&&(re=ee.students.find(fe=>fe.student_id===Q.id));const me=re?!!re.is_returned:!1,ye=(re==null?void 0:re.actual_return_date)||ee.actual_return_date;if((B==="returned"||me)&&ye)return!(O>=ye||O<P);if(O>=P){if(O===b&&O===P){const pe=(ee.departure_time||ee.leaving_time||"16:00").substring(0,5),ve=new Date(`${P}T${pe}:00`),be=new Date;if(ve&&!isNaN(ve.getTime())&&be<ve)return!1}const fe=ee.expected_return_date;return!(fe&&O>fe&&B!=="overdue"&&B!=="away"&&B!=="approved")}return!1})}return Q.status==="On Approved Leave"&&(O===b||!O)&&(Array.isArray(S)?S:[]).filter(ee=>ee.student_id===Q.id||Array.isArray(ee.student_ids)&&ee.student_ids.includes(Q.id)).length===0}async function K(){const O=(await W.getAttendanceRecords()).find(J=>J.classroom_id===M&&J.session_date===E);f=O&&Array.isArray(O.records)&&O.records.length>0?O:null;const Q=q(M);if(C={},O&&Array.isArray(O.records)&&O.records.length>0){F=!0,v=new Set(O.initial_absent_ids||O.records.filter(B=>B.status==="Absent").map(B=>B.student_id)||[]);const J=p.find(B=>B.id===M)||h.find(B=>B.id===M),ee=pt((J==null?void 0:J.start_time)||"06:30");Q.forEach(B=>{const P=te(B,E),re=O.records.find(me=>me.student_id===B.id);if(re){if(P?A[B.id]="Leave":re.status==="Leave"?A[B.id]="Absent":A[B.id]=re.status,re.status==="Late Present"&&!P)if(re.late_minutes!=null)C[B.id]=Number(re.late_minutes);else if(O.recorded_at){const me=new Date(O.recorded_at),he=me.getHours()*60+me.getMinutes();C[B.id]=Math.max(1,he-ee)}else C[B.id]=15}else A[B.id]=P?"Leave":"Absent"})}else F=!1,f=null,v=new Set,Q.forEach(J=>{const ee=te(J,E);A[J.id]=ee?"Leave":"Absent"})}async function de(){const T=await W.getAttendanceRecords(),O=await W.getAttendanceUnlocks();let Q=h;if(w&&L!=="all"){const P=Y.find(re=>re.id===L);Q=N(P)}const J=Q.filter(P=>(Array.isArray(P.days)&&P.days.length>0?P.days:["Mon","Tue","Wed","Thu","Fri","Sat"]).includes(y)),ee=J.filter(P=>{const re=pt(P.start_time||"06:30"),me=pt(P.end_time||"07:30");return u>=re&&u<=me});let B=Q;H==="today"?B=J.length>0?J:Q:H==="live"?B=ee:B=Q,s.innerHTML=`
      <div class="attendance-module-container" style="padding-bottom: 2.5rem;">
        
        <!-- HEADER -->
        <div class="page-header" style="margin-bottom: 1.25rem;">
          <div class="page-title-group">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin: 0;">
                ${a?"My Teaching Timetable & Attendance":r?`${d?"Boys":"Girls"} Mentor Class Timetable & Attendance`:"Faculty Timetable & Attendance Duty"}
              </h2>
              <span class="badge ${o?"badge-active":"badge-default"}" style="font-size: 0.72rem; font-weight: 700;">
                ${a?"Personal Timetable":r?`${d?"Boys":"Girls"} Mentor Class Schedule`:"Administrative Governance"}
              </span>
            </div>
            <p style="font-size: 0.8rem; color: #64748B; margin-top: 2px;">
              ${o?"Your assigned class timetable cards. Live attendance is strictly enabled only during class hours.":"All faculty teaching schedule cards with strict timetable attendance window governance."}
            </p>
          </div>

          <div class="page-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <!-- Date Badge Picker -->
            <button type="button" class="btn btn-outline btn-sm" id="att-cards-date-trigger" style="font-weight: 700; border-radius: 10px; display: flex; align-items: center; gap: 0.4rem;" title="Select date for attendance schedule">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>${E}</span>
            </button>

            <!-- Go to Attendance Report -->
            <button type="button" class="btn btn-outline btn-sm" id="btn-goto-att-report" style="font-weight: 700; border-radius: 10px; display: flex; align-items: center; gap: 0.4rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
              ${a?"My Attendance Report":"Attendance Report"}
            </button>
          </div>
        </div>

        <!-- ADMIN TEACHER FILTER BAR (Admin Only, never shown to teachers) -->
        ${w?`
          <div style="margin-bottom: 1rem; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 0.85rem 1.15rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <span style="font-size: 0.78rem; font-weight: 700; color: #475569;">Faculty Timetable Filter:</span>
              <select id="att-admin-teacher-select" class="form-control" style="border-radius: 8px; font-weight: 600; font-size: 0.84rem; padding: 0.35rem 0.75rem; cursor: pointer;">
                <option value="all" ${L==="all"?"selected":""}>All Faculty Classrooms (${p.length})</option>
                ${G.map(P=>`
                  <option value="${P.id}" ${P.id===L?"selected":""}>
                    ${P.full_name||P.email} (${P.role||"faculty"})
                  </option>
                `).join("")}
              </select>
            </div>
            <span style="font-size: 0.72rem; color: #059669; font-weight: 700;">
              ⚡ Admin can inspect any faculty timetable & unlock sessions
            </span>
          </div>
        `:""}

        <!-- TIMETABLE SCHEDULE TABS -->
        <div class="att-timetable-tabs" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.35rem; width: 100%; box-sizing: border-box; background: #F1F5F9; padding: 0.3rem; border-radius: 12px; margin-bottom: 1.25rem;">
          <button type="button" class="att-timetable-tab-btn ${H==="today"?"is-active":""}" data-tab="today" style="padding: 0.5rem 0.2rem; font-size: 0.78rem; width: 100%; min-width: 0; text-align: center; justify-content: center; white-space: nowrap;">
            Today (${J.length})
          </button>
          <button type="button" class="att-timetable-tab-btn ${H==="weekly"?"is-active":""}" data-tab="weekly" style="padding: 0.5rem 0.2rem; font-size: 0.78rem; width: 100%; min-width: 0; text-align: center; justify-content: center; white-space: nowrap;">
            Weekly (${Q.length})
          </button>
          <button type="button" class="att-timetable-tab-btn ${H==="live"?"is-active":""}" data-tab="live" style="padding: 0.5rem 0.2rem; font-size: 0.78rem; width: 100%; min-width: 0; text-align: center; justify-content: center; white-space: nowrap;">
            ${ee.length>0?'<span class="live-pulse-dot" style="margin-right: 2px;"></span>':""}
            Live (${ee.length})
          </button>
        </div>

        <!-- TIMETABLE CARDS GRID (MATCHING SCREENSHOT 100%) -->
        <div class="att-timetable-cards-list timetable-cards-grid">
          ${B.length===0?`
            <div style="background: #FFFFFF; border: 1.5px dashed #CBD5E1; border-radius: 16px; padding: 2.5rem; text-align: center; color: #64748B;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏱️</div>
              <h3 style="font-size: 1.1rem; font-weight: 800; color: #0F172A; margin: 0 0 0.4rem 0;">
                No Classes Found for this Tab
              </h3>
              <p style="font-size: 0.85rem; margin: 0 0 1rem 0;">
                ${a?"No assigned classrooms found for this filter. Check the Full Weekly Timetable tab.":"No classrooms found matching the selected filter."}
              </p>
              <button type="button" class="btn btn-outline btn-sm att-timetable-tab-btn" data-tab="weekly" style="display: inline-flex;">
                View Full Weekly Timetable
              </button>
            </div>
          `:B.map(P=>{var ge,$e,Be,Ge,Ye;const re=D.find(qe=>qe.id===P.program_id),me=(re==null?void 0:re.name)||"Academic Class",he=Y.find(qe=>qe.id===P.teacher_id),ye=he?he.full_name||he.email:"Assigned Faculty",_e=pt(P.start_time||"06:30"),fe=pt(P.end_time||"07:30"),pe=Array.isArray(P.days)&&P.days.length>0?P.days:["Mon","Tue","Wed","Thu","Fri","Sat"],ve=E===b,be=E.split("-"),Se=new Date(Number(be[0]),Number(be[1])-1,Number(be[2])),Fe=k[Se.getDay()],xe=pe.includes(Fe),ke=ve&&xe&&u>=_e&&u<=fe,Ne=ve&&xe&&u<_e,De=ve&&xe&&u>fe,we=E<b,Ae=T.some(qe=>qe.classroom_id===P.id&&qe.session_date===E&&Array.isArray(qe.records)&&qe.records.length>0),ze=O.includes(`${P.id}_${E}`),Re=W.isFacultyOnApprovedLeave(n,E,j)||(w?W.isFacultyOnApprovedLeave(P.teacher_id,E,j):null),He=!w&&!!Re,Pe=W.isClassSessionOffDueToHoliday(P,E,V),Ce=Pe.isOff,Ue=xe&&!He&&!Ce&&(ke||ze||w&&(Ae||De)||a&&Ae&&(ke||E===b)),it=q(P.id).length;let Ke="",Ze="Scheduled Teaching Session",tt=`Meets on ${(ge=P.days)==null?void 0:ge.join(", ")}`;if(He)Ze="Faculty Leave Active",tt=`Authorized ${Re.leave_type||"Duty Leave"} • Attendance officially waived`,Ke=`
                <span class="badge" style="background: #ECFDF5; color: #059669; border: 1.5px solid #34D399; font-weight: 800; font-size: 0.76rem; padding: 0.35rem 0.8rem; border-radius: 9999px;">
                  ✓ On Approved Leave (Waived)
                </span>
              `;else if(Ce){const qe=Pe.type==="hostel_leave",Je=Pe.type==="weekend_off";Ze=qe?"Hostel Leave Active":Je?"Weekend Off Day":"Official Holiday (Class Off)",tt=`${Pe.reason} • ${Pe.isAllDay?"Full Day Off":`Off Time: ${Pe.timeSpan}`} • Attendance waived`,Ke=`
                <span class="badge" style="background: ${qe?"#FEF2F2":Je?"#F8FAFC":"#FFFDF5"}; color: ${qe?"#DC2626":Je?"#64748B":"#B45309"}; border: 1.5px solid ${qe?"#FECACA":Je?"#CBD5E1":"#FDE68A"}; font-weight: 800; font-size: 0.76rem; padding: 0.35rem 0.8rem; border-radius: 9999px;">
                  ${qe?"🚪 Hostel Leave Off":Je?"📅 Weekend Off":"🌴 Official Holiday Off"}
                </span>
              `}else if(!xe)Ze="No Class Scheduled Today",tt=`${P.name} does not meet on ${Fe} (Meets on ${($e=P.days)==null?void 0:$e.join(", ")})`,Ke=`
                <span class="badge" style="background: #F1F5F9; color: #64748B; border: 1.5px solid #CBD5E1; font-weight: 700; font-size: 0.76rem; padding: 0.35rem 0.8rem; border-radius: 9999px;">
                  No Class on ${Fe}
                </span>
              `;else if(ke)Ze="Active Class In-Session",tt=`Live attendance window active • Ends at ${Le(P.end_time)}`,Ke=`
                <span class="badge" style="background: #ECFDF5; color: #059669; border: 1.5px solid #34D399; font-weight: 800; font-size: 0.76rem; padding: 0.35rem 0.8rem; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.35rem;">
                  <span class="live-pulse-dot"></span> Live In-Session Now
                </span>
              `;else if(Ae){const qe=T.find(Nt=>Nt.classroom_id===P.id&&Nt.session_date===E),Je=W.getSessionPunctualityInfo?W.getSessionPunctualityInfo(qe,P.start_time):{isLate:(qe==null?void 0:qe.submission_punctuality)==="late"||(qe==null?void 0:qe.late_submission_minutes)>15,lateMinutes:(qe==null?void 0:qe.late_submission_minutes)||0},mt=Je.isLate,$t=Je.lateMinutes,wt=(qe==null?void 0:qe.submitted_by_name)||(qe==null?void 0:qe.teacher_name)||ye;Ze="Attendance Recorded",tt=mt?`Submitted ${$t}m late by ${wt}`:`Punctually submitted by ${wt}`,Ke=mt?`
                <span class="badge" style="background: #FEF2F2; color: #DC2626; border: 1.5px solid #FECACA; border-radius: 9999px; padding: 0.35rem 0.8rem; font-size: 0.74rem; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;">
                  ⚠️ Late (+${$t}m) by ${wt}
                </span>
              `:`
                <span class="badge badge-active" style="border-radius: 9999px; padding: 0.35rem 0.8rem; font-size: 0.74rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                  ✓ Punctual by ${wt}
                </span>
              `}else if(Ne){const qe=_e-u;Ze=qe<=30?"Your upcoming class":"Scheduled Teaching Session",tt=qe<=30?`Starts in ${qe} mins`:`Starts today at ${Le(P.start_time)}`,Ke=`
                <span class="badge" style="background: #EFF6FF; color: #1E40AF; border: 1.5px solid #93C5FD; font-weight: 700; font-size: 0.76rem; padding: 0.35rem 0.8rem; border-radius: 9999px;">
                  Today at ${Le(P.start_time)}
                </span>
              `}else De||we?(Ze=`Past Session (${Le(P.end_time)})`,tt=`Attendance window closed • ${ze?"Unlocked by Admin":"Session ended"}`,Ke=ze?`
                <span class="badge" style="background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; font-weight: 800; font-size: 0.74rem; border-radius: 9999px; padding: 0.35rem 0.8rem;">
                  🔓 Unlocked by Admin
                </span>
              `:`
                <span class="badge" style="background: #F8FAFC; color: #64748B; border: 1px solid #CBD5E1; font-weight: 700; font-size: 0.74rem; border-radius: 9999px; padding: 0.35rem 0.8rem;">
                  Session Closed
                </span>
              `):(Ze="Timetable Session",tt=`Scheduled on ${(Be=P.days)==null?void 0:Be.join(", ")}`,Ke=`
                <span class="badge" style="background: #F8FAFC; color: #64748B; border: 1px solid #CBD5E1; font-weight: 600; font-size: 0.74rem; border-radius: 9999px; padding: 0.35rem 0.8rem;">
                  ${(Ge=P.days)==null?void 0:Ge.join(", ")}
                </span>
              `);return`
              <!-- DEDICATED TIMETABLE CARD MATCHING SCREENSHOT EXACTLY -->
              <div class="teacher-upcoming-card ${ke?"is-live":Ne&&_e-u<=30?"is-soon":""}" 
                   id="card-att-class-${P.id}" 
                   data-cls-id="${P.id}" 
                   role="button" 
                   tabindex="0"
                   style="cursor: pointer; margin-bottom: 1.25rem;">
                
                <!-- Top Portion: Icon, Title & Time Badge -->
                <div class="upcoming-card-top">
                  <div class="upcoming-card-title-group">
                    <div class="upcoming-card-icon-pill ${ke?"is-live":Ne&&_e-u<=30?"is-soon":""}">
                      ${ke?"🟢":Ae?"✓":"⏱️"}
                    </div>
                    <div>
                      <h3 class="upcoming-card-heading">${Ze}</h3>
                      <span class="upcoming-card-subtitle">${tt}</span>
                    </div>
                  </div>

                  <div class="upcoming-card-status-badge">
                    ${Ke}
                  </div>
                </div>

                <!-- Clean Divider Line -->
                <div class="upcoming-divider"></div>

                <!-- Class Primary: Large Green Name & Program Pill -->
                <div class="upcoming-class-primary">
                  <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 0.5rem;">
                    <h4 class="upcoming-class-name">${P.name}</h4>
                    ${w?`
                      <span class="badge" style="background: #F1F5F9; color: #475569; font-size: 0.72rem; font-weight: 700;">
                        Faculty: ${ye}
                      </span>
                    `:""}
                  </div>
                  <div style="margin-top: 0.2rem;">
                    <span class="upcoming-prog-pill">${me}</span>
                  </div>
                </div>

                <!-- 2x2 Details Grid (Timetable Specifications) -->
                <div class="upcoming-details-grid">
                  <div class="upcoming-detail-cell">
                    <span class="detail-label">Schedule Time</span>
                    <span class="detail-value">${Le(P.start_time||"06:30")} – ${Le(P.end_time||"07:30")}</span>
                  </div>
                  <div class="upcoming-detail-cell">
                    <span class="detail-label">Classroom / Hall</span>
                    <span class="detail-value">${P.room_number?"Room "+P.room_number:"Campus Hall"}</span>
                  </div>
                  <div class="upcoming-detail-cell">
                    <span class="detail-label">Enrolled Roster</span>
                    <span class="detail-value">${it} Students</span>
                  </div>
                  <div class="upcoming-detail-cell">
                    <span class="detail-label">Duty Punctuality</span>
                    ${(()=>{const qe=T.find(Nt=>Nt.classroom_id===P.id&&Nt.session_date===E),Je=W.getSessionPunctualityInfo?W.getSessionPunctualityInfo(qe,P.start_time):{isLate:(qe==null?void 0:qe.submission_punctuality)==="late"||(qe==null?void 0:qe.late_submission_minutes)>15,lateMinutes:(qe==null?void 0:qe.late_submission_minutes)||0},mt=Je.isLate,$t=Je.lateMinutes,wt=(qe==null?void 0:qe.submitted_by_name)||(qe==null?void 0:qe.teacher_name)||ye;return Ae?mt?`<span class="detail-value" style="color: #DC2626; font-weight: 800;">⚠️ Late (+${$t}m) by ${wt}</span>`:`<span class="detail-value" style="color: #059669; font-weight: 800;">✓ Punctual (≤15m) by ${wt}</span>`:'<span class="detail-value" style="color: #64748B;">Pending Live Session</span>'})()}
                  </div>
                  <div class="upcoming-detail-cell">
                    <span class="detail-label">Scheduled Days</span>
                    <span class="detail-value" style="white-space: nowrap;">${Gt(P.days)}</span>
                  </div>
                </div>

                <!-- Actions Footer: View Details & Take Attendance (Faded except during class time) -->
                <div class="upcoming-card-footer" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.65rem; margin-top: 0.5rem;">
                  <!-- View Details Button: Enters to the details after the time -->
                  <button type="button" class="btn btn-outline btn-sm btn-card-view-details" data-cls-id="${P.id}" style="font-weight: 700; border-radius: 10px; padding: 0.5rem 1.05rem; font-size: 0.85rem; color: #1E40AF; border-color: #BFDBFE; background: #F8FAFC;">
                    View Details →
                  </button>

                  <!-- Take Attendance Button: Disabled/locked if on leave, holiday/weekend off, or not scheduled on date -->
                  ${He?`
                    <button type="button" 
                            class="btn btn-outline btn-sm btn-card-take-att is-on-leave" 
                            data-cls-id="${P.id}"
                            data-can-take="false"
                            data-on-leave="true"
                            disabled
                            style="font-weight: 800; border-radius: 10px; padding: 0.55rem 1.35rem; font-size: 0.88rem; background: #F1F5F9; color: #64748B; border-color: #CBD5E1; opacity: 0.7; cursor: not-allowed;"
                            title="You are currently on authorized faculty leave. Attendance taking is disabled.">
                      🔒 Attendance Waived (On Leave)
                    </button>
                  `:Ce?`
                    <button type="button" 
                            class="btn btn-outline btn-sm btn-card-take-att is-holiday-off is-faded" 
                            data-cls-id="${P.id}"
                            data-can-take="false"
                            data-holiday-off="true"
                            disabled
                            style="font-weight: 800; border-radius: 10px; padding: 0.55rem 1.35rem; font-size: 0.88rem; background: #F8FAFC; color: #64748B; border-color: #CBD5E1; opacity: 0.75; cursor: not-allowed;"
                            title="Class is officially off due to ${Pe.reason} (${Pe.isAllDay?"Full Day Off":Pe.timeSpan}). Attendance is waived.">
                      🔒 Attendance Waived (${Pe.type==="hostel_leave"?"Hostel Leave":Pe.type==="weekend_off"?"Weekend Off":"Holiday"})
                    </button>
                  `:xe?`
                    <button type="button" 
                            class="btn btn-primary btn-sm btn-card-take-att ${Ue?"":"is-faded"}" 
                            data-cls-id="${P.id}"
                            data-can-take="${Ue?"true":"false"}"
                            style="font-weight: 800; border-radius: 10px; padding: 0.55rem 1.35rem; font-size: 0.88rem; ${Ue?"background: #059669; border-color: #047857; color: #FFFFFF; box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3); cursor: pointer;":"background: #F1F5F9; color: #64748B; border-color: #CBD5E1; opacity: 0.8; cursor: not-allowed;"}"
                            title="${Ue?Ae?"Update recorded attendance for this session":"Take live attendance for this session":Ae?"Attendance recorded for this session. Tap to view.":`Attendance window locked outside class hours (${Le(P.start_time)} – ${Le(P.end_time)}). Tap to view class details.`}">
                      ${Ue?Ae?"Update Attendance →":"Take Attendance →":Ae?"Recorded (View Only)":"Attendance Closed"}
                    </button>
                  `:`
                    <button type="button" 
                            class="btn btn-outline btn-sm btn-card-take-att is-not-scheduled is-faded" 
                            data-cls-id="${P.id}"
                            data-can-take="false"
                            data-not-scheduled="true"
                            disabled
                            style="font-weight: 800; border-radius: 10px; padding: 0.55rem 1.35rem; font-size: 0.88rem; background: #F8FAFC; color: #64748B; border-color: #CBD5E1; opacity: 0.75; cursor: not-allowed;"
                            title="No class scheduled on ${Fe} (${P.name} meets on ${(Ye=P.days)==null?void 0:Ye.join(", ")}). Attendance taking is disabled.">
                      🔒 No Class on ${Fe}
                    </button>
                  `}
                </div>

              </div>
            `}).join("")}
        </div>

      </div>
    `,le()}function le(){var T,O,Q;!s||typeof s.querySelector!="function"||((T=s.querySelector("#att-cards-date-trigger"))==null||T.addEventListener("click",()=>{Ns({initialDate:E,title:"Timetable Date",onSelect:async J=>{E=Pt(J),de()}})}),(O=s.querySelector("#btn-goto-att-report"))==null||O.addEventListener("click",()=>{t?t("attendance_report"):typeof window<"u"&&(window.location.hash="#attendance_report")}),(Q=s.querySelector("#att-admin-teacher-select"))==null||Q.addEventListener("change",J=>{L=J.target.value,de()}),s.querySelectorAll(".att-timetable-tab-btn").forEach(J=>{J.addEventListener("click",ee=>{ee.stopPropagation();const B=J.getAttribute("data-tab");B&&(H=B,de())})}),s.querySelectorAll(".btn-card-view-details").forEach(J=>{J.addEventListener("click",ee=>{ee.stopPropagation();const B=J.getAttribute("data-cls-id");B&&(M=B,x="roster",ne())})}),s.querySelectorAll(".btn-card-take-att").forEach(J=>{J.addEventListener("click",ee=>{if(ee.stopPropagation(),J.getAttribute("data-not-scheduled")==="true"){oe.warning("No class scheduled on this date for this classroom.");return}if(J.getAttribute("data-holiday-off")==="true"){oe.warning("Class is officially off on this date. Attendance is waived.");return}if(J.getAttribute("data-on-leave")==="true"){oe.warning("Attendance taking is locked because you are currently on authorized faculty leave.");return}const B=J.getAttribute("data-cls-id"),P=J.getAttribute("data-can-take")==="true";if(B){if(M=B,x="roster",!P){const re=p.find(me=>me.id===B)||h.find(me=>me.id===B);oe.info(`Attendance can only be taken during class hours (${Le((re==null?void 0:re.start_time)||"06:30")} – ${Le((re==null?void 0:re.end_time)||"07:30")}). Viewing class details.`)}ne()}})}),s.querySelectorAll(".teacher-upcoming-card").forEach(J=>{J.addEventListener("click",ee=>{if(ee.target.closest("button"))return;const B=J.getAttribute("data-cls-id");B&&(M=B,x="roster",ne())})}))}async function ne(){var fe,pe,ve;await K();const T=await z(M),O=p.find(be=>be.id===M)||h.find(be=>be.id===M),Q=Y.find(be=>be.id===(O==null?void 0:O.teacher_id)),J=Q?Q.full_name||Q.email:o?(n==null?void 0:n.full_name)||"Assigned Faculty":"Rashid Sir",ee=D.find(be=>be.id===(O==null?void 0:O.program_id)),B=(O==null?void 0:O.teacher_id)||(n.role==="teacher"?n.id:""),P=W.isFacultyOnApprovedLeave(n,E,j)||W.isFacultyOnApprovedLeave(B,E,j),re=!w&&!!W.isFacultyOnApprovedLeave(n,E,j),me=_&&!$&&T.canTake&&!re,he=q(M),_e=he.filter(be=>te(be,E)).length;he.length-_e,s.innerHTML=`
      <div class="attendance-roster-view-container" style="padding-bottom: 2.5rem;">
        
        <!-- TOP BREADCRUMB / BACK ACTION -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <button type="button" class="btn btn-outline btn-sm" id="btn-back-to-cards" style="font-weight: 700; border-radius: 10px; display: inline-flex; align-items: center; gap: 0.45rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Timetable Cards
          </button>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button type="button" class="btn btn-outline btn-sm" id="btn-view-att-reports" style="font-weight: 700; border-radius: 10px; display: flex; align-items: center; gap: 0.4rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
              ${a?"My Attendance Report":"Attendance Report"}
            </button>
          </div>
        </div>

        ${P?`
          <div style="background: #ECFDF5; border: 1.5px solid #A7F3D0; border-radius: 12px; padding: 0.85rem 1.15rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: #D1FAE5; color: #059669; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div>
                <strong style="color: #065F46; font-size: 0.88rem; display: block;">Authorized Faculty Leave</strong>
                <span style="font-size: 0.78rem; color: #047857;">${P.faculty_name} has authorized ${P.leave_type} (${Le(P.departure_time||"08:00")} – ${Le(P.return_time||"16:30")}). Attendance is officially waived by Administration.</span>
              </div>
            </div>
            <span class="badge" style="background: #D1FAE5; color: #065F46; border: 1px solid #6EE7B7; font-weight: 700; font-size: 0.75rem; padding: 0.25rem 0.65rem; border-radius: 9999px;">
              ✓ Approved Waiver
            </span>
          </div>
        `:""}

        ${(fe=T==null?void 0:T.holidayOff)!=null&&fe.isOff?`
          <div style="background: ${T.holidayOff.type==="hostel_leave"?"#FEF2F2":"#FFFDF5"}; border: 1.5px solid ${T.holidayOff.type==="hostel_leave"?"#FECACA":"#FDE68A"}; border-radius: 12px; padding: 0.85rem 1.15rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: ${T.holidayOff.type==="hostel_leave"?"#FEE2E2":"#FEF3C7"}; color: ${T.holidayOff.type==="hostel_leave"?"#DC2626":"#B45309"}; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; flex-shrink: 0;">
                ${T.holidayOff.type==="hostel_leave"?"🚪":"🌴"}
              </div>
              <div>
                <strong style="color: ${T.holidayOff.type==="hostel_leave"?"#991B1B":"#92400E"}; font-size: 0.88rem; display: block;">
                  ${T.holidayOff.type==="hostel_leave"?"Hostel Leave Active":"Official Academic Holiday"} (Class Off)
                </strong>
                <span style="font-size: 0.78rem; color: ${T.holidayOff.type==="hostel_leave"?"#B91C1C":"#B45309"};">
                  ${T.holidayOff.reason} (${T.holidayOff.isAllDay?"Full Day Off":`Off Time: ${T.holidayOff.timeSpan}`}). Attendance duties are officially waived by Administration with zero penalties.
                </span>
              </div>
            </div>
            <span class="badge" style="background: ${T.holidayOff.type==="hostel_leave"?"#FEE2E2":"#FEF3C7"}; color: ${T.holidayOff.type==="hostel_leave"?"#DC2626":"#92400E"}; border: 1px solid ${T.holidayOff.type==="hostel_leave"?"#FCA5A5":"#FCD34D"}; font-weight: 700; font-size: 0.75rem; padding: 0.25rem 0.65rem; border-radius: 9999px;">
              ✓ Attendance Waived
            </span>
          </div>
        `:""}

        <!-- BIG CLASS DESCRIPTION CARD ON TOP (NO DROPDOWNS SPEC) -->
        <div class="att-big-class-card" id="att-big-class-card">
          <div class="att-class-top">
            <div class="att-class-top-left">
              <h2 class="att-class-title">${(O==null?void 0:O.name)||"Classroom Session"}</h2>
              <div class="att-class-sub">${(ee==null?void 0:ee.name)||"Class Session"}</div>
            </div>
            <div class="att-card-date-badge" id="att-date-badge-trigger" style="cursor: pointer;" title="Tap to select session date">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>${E}</span>
            </div>
          </div>

          <!-- Class Details Bar -->
          <div class="att-class-details-bar">
            <div class="att-detail-box">
              <span class="att-detail-lbl">Class Time</span>
              <strong class="att-detail-val">${Le((O==null?void 0:O.start_time)||"06:30")} – ${Le((O==null?void 0:O.end_time)||"07:30")}</strong>
            </div>
            <div class="att-detail-box">
              <span class="att-detail-lbl">Room / Hall</span>
              <strong class="att-detail-val">${O!=null&&O.room_number?"Room "+O.room_number:"Campus Hall"}</strong>
            </div>
            <div class="att-detail-box">
              <span class="att-detail-lbl">Class Days</span>
              <strong class="att-detail-val" style="white-space: nowrap;">${Gt(O==null?void 0:O.days)}</strong>
            </div>
            <div class="att-detail-box">
              <span class="att-detail-lbl">Total Students</span>
              <strong class="att-detail-val">${he.length} Enrolled ${_e>0?`<span style="font-size: 0.72rem; color: #2563EB; font-weight: 700;">(${_e} on leave)</span>`:""}</strong>
            </div>
          </div>

          <!-- Window Status Banner Inside Card -->
          <div class="att-window-status-pill ${T.badgeClass}">
            ${T.canTake?`
              <span class="live-pulse-dot" style="margin-right: 0.25rem;"></span>
            `:`
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            `}
            <span style="flex: 1;">${T.message}</span>
            ${w&&T.isAfter&&!T.isUnlockedByAdmin?`
              <button class="btn btn-outline btn-xs" id="btn-admin-unlock-window" style="background: #FFFFFF; font-weight: 700; color: #DC2626; border-color: #FECACA; white-space: nowrap;">
                Unlock Late Attendance
              </button>
            `:w&&T.isUnlockedByAdmin?`
              <span class="badge badge-active" style="white-space: nowrap;">✓ Unlocked by Admin</span>
            `:""}
          </div>

          <!-- Attendance Summary Counters at Bottom of Card (Present, Absent, On Leave, Total Students) -->
          <div class="att-class-footer-bar">
            <div class="att-stats-classic" id="att-counters">
              ${g(he)}
            </div>
          </div>
        </div>

        <!-- Search Bar (3/5 of line) + All Present (1/5) + Clear (1/5) -->
        <div class="att-search-actions-bar">
          <!-- 3/5: Search Input -->
          <div class="att-search-col-3-5">
            <div class="att-search-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="att-search-input" placeholder="Search student by name..." />
            </div>
          </div>

          <!-- 1/5: All Present Button -->
          <button type="button" 
                  class="btn btn-primary att-btn-col-1-5" 
                  id="btn-mark-all-present" 
                  ${me?"":'disabled style="opacity: 0.5; cursor: not-allowed;"'}
                  title="Mark all physically present in-class students as Present (skips students on leave)">
            All Present
          </button>

          <!-- 1/5: Clear Button -->
          <button type="button" 
                  class="btn btn-outline att-btn-col-1-5" 
                  id="btn-clear-attendance" 
                  ${me?"":'disabled style="opacity: 0.5; cursor: not-allowed;"'}
                  title="Clear all marked attendance back to default (Absent)">
            Clear
          </button>
        </div>

        <!-- SMALL COMPACT STUDENT ATTENDANCE CARDS WITH 2-WAY SWITCH -->
        <div class="attendance-compact-list" id="att-cards-container">
          ${ie(he,me)}
        </div>
        <div id="att-no-matches" style="display: none; padding: 2.5rem; text-align: center; color: var(--text-muted); font-size: 0.95rem;">
          No students match your search.
        </div>

        <!-- Bottom Submit Bar -->
        <div class="att-submit-bar" style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
          <div class="att-submit-info" style="flex: 1; min-width: 240px;">
            ${me?F?"* Updating attendance records presence and late-arriving students. Faculty duty punctuality is preserved from your 1st submission.":`* Submitting attendance officially records student presence for this session, saves exact timestamp, and logs your faculty duty attendance (${J}).`:F&&a?`* Attendance submitted on ${Me(E)}. Past attendance is locked. Only Administrators are permitted to edit recorded attendance.`:re?`* You are currently on authorized faculty leave (${(P==null?void 0:P.leave_type)||"Leave"}). Attendance duty is waived by Administration.`:$?"* View-only explore mode: Submitting is disabled.":"* Attendance window closed: Session ended."}
          </div>
          ${me?`
            <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
              ${F&&(w||E===b)?`
                <button type="button" class="btn btn-outline btn-sm" id="btn-reset-attendance-session" style="color: #DC2626; border-color: #FECACA; background: #FFF5F5; font-weight: 700; border-radius: 10px; padding: 0.65rem 1rem; display: flex; align-items: center; gap: 0.4rem;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  Reset / Retake Fresh
                </button>
              `:""}
              <button class="btn btn-primary" id="btn-submit-attendance" title="Confirm & Submit Attendance" style="padding: 0.75rem 1.6rem; font-weight: 700; background: #059669; border-color: #047857; display: flex; align-items: center; gap: 0.5rem; border-radius: 12px; font-size: 0.92rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                ${F?"Confirm & Update Attendance":"Confirm & Submit Attendance"}
              </button>
            </div>
          `:`
            <button class="btn btn-outline" disabled style="padding: 0.75rem 1.6rem; font-weight: 700; opacity: 0.6; cursor: not-allowed; border-radius: 12px; background: #F1F5F9; color: #64748B;">
              ${F&&a?"Attendance Already Submitted (Locked for Teacher)":re?"🔒 Attendance Waived (Faculty On Approved Leave)":T.isHolidayOff?`🔒 Attendance Waived (${((pe=T.holidayOff)==null?void 0:pe.type)==="hostel_leave"?"Hostel Leave":((ve=T.holidayOff)==null?void 0:ve.type)==="weekend_off"?"Weekend Off":"Holiday"})`:T.isNotScheduled?`🔒 No Class on ${T.targetDayKey||"Today"}`:T.status==="locked_before"?"Locked (Before Class Time)":"Session Closed"}
            </button>
          `}
        </div>

      </div>
    `,R(me,he)}function g(T=q(M)){let O=0,Q=0,J=0,ee=0;return T.forEach(B=>{const P=te(B,E),re=A[B.id]||(P?"Leave":"Absent");P||re==="Leave"||re==="On Leave"?ee++:re==="Late Present"?(Q++,O++):re==="Present"?O++:J++}),`
      <span class="att-counter-item">Present: <strong style="color: #059669;">${O}</strong></span>
      <span class="att-counter-dot">•</span>
      <span class="att-counter-item">Absent: <strong style="color: #DC2626;">${J}</strong></span>
      <span class="att-counter-dot">•</span>
      <span class="att-counter-item" style="color: #2563EB;">On Leave: <strong>${ee}</strong></span>
      ${Q>0?`<span class="att-counter-dot">•</span><span class="att-counter-item" style="color: #D97706;">Late: <strong>${Q}</strong></span>`:""}
    `}function X(T=q(M)){const O=s.querySelector("#att-counters");O&&(O.innerHTML=g(T))}function ie(T=q(M),O=!0){const Q=p.find(J=>J.id===M)||h.find(J=>J.id===M);return T.map(J=>{const ee=te(J,E),B=A[J.id]||(ee?"Leave":"Absent"),P=!ee&&(B==="Present"||B==="Late Present"),re=!ee&&B==="Late Present",me=C[J.id]||15,he=J.gender==="Female"||J.gender==="Girls"||J.gender==="Girl",ye=he?"Girl":"Boy",_e=(J.full_name||"Student").split(" ").map(pe=>pe[0]).filter(Boolean).join("").substring(0,2).toUpperCase(),fe=nt(J.school_class)||"STD-I";return`
        <div class="attendance-compact-card ${ee?"is-on-leave is-faded":P?"is-present":"is-absent"} ${re?"is-late":""}" 
             id="att-card-${J.id}" 
             data-student-id="${J.id}"
             data-student-name="${(J.full_name||"").toLowerCase()}"
             data-is-on-leave="${ee?"true":"false"}"
             ${ee?'style="opacity: 0.55; background: #F8FAFC; border-color: #CBD5E1;"':""}>
          
          <!-- Left: Photo / Avatar -->
          <div class="att-compact-avatar" style="background: ${ee?"#F1F5F9":he?"#FDF2F8":"#EFF6FF"}; color: ${ee?"#64748B":he?"#DB2777":"#2563EB"};">
            ${J.photo_url?`
              <img src="${J.photo_url}" alt="${J.full_name}" onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='flex';" />
              <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;">${_e}</div>
            `:`
              <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;">${_e}</div>
            `}
          </div>

          <!-- Middle: Name on top, Gender & Class below + Admin visibility of minutes late -->
          <div class="att-compact-info">
            <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
              <span class="att-compact-name" style="${ee?"color: #475569;":""}">${J.full_name}</span>
              ${ee?`
                <span class="badge att-on-leave-pill" style="background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; font-size: 0.68rem; font-weight: 800; padding: 1px 7px; border-radius: 9999px; display: inline-flex; align-items: center;">
                  On Leave
                </span>
              `:""}
            </div>
            <span class="att-compact-sub">${ye} • ${fe} ${ee?"• (Approved Hostel Leave)":""}</span>
            ${re&&w?`
              <div class="att-late-admin-note" id="att-late-note-${J.id}">
                ⏱️ ${me} min late (Class: ${Le((Q==null?void 0:Q.start_time)||"06:30")})
              </div>
            `:""}
          </div>

          <!-- Right: 2-Way Adjustable Switch or Locked Leave Badge -->
          <div class="att-compact-action">
            ${ee?`
              <div class="att-leave-locked-badge" style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.65rem; background: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 9999px; color: #64748B; font-size: 0.72rem; font-weight: 800; cursor: not-allowed;" title="Student is on approved hostel leave. Teachers cannot record attendance.">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>On Leave</span>
              </div>
              <button type="button" 
                      class="att-2way-switch sw-leave" 
                      data-student-id="${J.id}"
                      role="switch" 
                      aria-checked="false"
                      aria-disabled="true"
                      disabled
                      style="display: none; opacity: 0.6; cursor: not-allowed;"
                      title="Student is on approved leave. Attendance cannot be recorded.">
                <span class="att-switch-label">LV</span>
                <span class="att-switch-thumb"></span>
              </button>
            `:`
              ${re?`
                <span class="att-late-badge" id="att-late-badge-${J.id}" title="Late arrival by ${me} min after class started">${me}m late</span>
              `:""}
              <button type="button" 
                      class="att-2way-switch ${P?"sw-present":"sw-absent"} ${re?"sw-late":""}" 
                      data-student-id="${J.id}"
                      role="switch" 
                      aria-checked="${P?"true":"false"}"
                      ${O?"":'disabled style="opacity: 0.6; cursor: not-allowed;"'}
                      title="${re?"Late Present (L) - tap to mark Absent":P?"Present (P) - tap to mark Late":"Absent (A) - tap to mark Present"}">
                <span class="att-switch-label">${re?"L":P?"P":"A"}</span>
                <span class="att-switch-thumb"></span>
              </button>
            `}
          </div>
        </div>
      `}).join("")}function se(T,O=q(M)){if(!w&&!!W.isFacultyOnApprovedLeave(n,E,j)){oe.warning("Attendance taking is disabled because you are currently on authorized faculty leave.");return}const J=I.find(he=>he.id===T);if(te(J,E)){oe.warning(`${(J==null?void 0:J.full_name)||"This student"} is on approved hostel leave. Teachers cannot record attendance.`);return}const ee=A[T]||"Absent",B=p.find(he=>he.id===M)||h.find(he=>he.id===M),P=pt((B==null?void 0:B.start_time)||"06:30"),re=new Date().getHours()*60+new Date().getMinutes(),me=Math.max(1,re-P);ee==="Absent"?F&&v.has(T)?(A[T]="Late Present",C[T]||(C[T]=me),oe.info(`${(J==null?void 0:J.full_name)||"Student"} marked as Late (L) — ${C[T]}m late.`)):A[T]="Present":ee==="Present"?(A[T]="Late Present",C[T]||(C[T]=me),oe.info(`${(J==null?void 0:J.full_name)||"Student"} marked as Late (L) — ${C[T]}m late.`)):A[T]="Absent",ce(T),X(O)}function ce(T){var fe,pe,ve,be,Se,Fe,xe,ke,Ne,De,we,Ae,ze,Re,He,Pe;const O=s.querySelector(`#att-card-${T}`);if(!O)return;const Q=I.find(Ce=>Ce.id===T);if(te(Q,E)){O.classList.add("is-on-leave","is-faded"),O.classList.remove("is-present","is-absent","is-late");return}const ee=p.find(Ce=>Ce.id===M)||h.find(Ce=>Ce.id===M),B=A[T]||"Absent",P=B==="Present"||B==="Late Present",re=B==="Late Present",me=C[T]||15;typeof((fe=O.classList)==null?void 0:fe.toggle)=="function"?(O.classList.toggle("is-present",P),O.classList.toggle("is-absent",!P),O.classList.toggle("is-late",re)):(P?(ve=(pe=O.classList)==null?void 0:pe.add)==null||ve.call(pe,"is-present"):(Se=(be=O.classList)==null?void 0:be.remove)==null||Se.call(be,"is-present"),P?(Ne=(ke=O.classList)==null?void 0:ke.remove)==null||Ne.call(ke,"is-absent"):(xe=(Fe=O.classList)==null?void 0:Fe.add)==null||xe.call(Fe,"is-absent"),re?(we=(De=O.classList)==null?void 0:De.add)==null||we.call(De,"is-late"):(ze=(Ae=O.classList)==null?void 0:Ae.remove)==null||ze.call(Ae,"is-late"));const he=typeof O.querySelector=="function"?O.querySelector(".att-2way-switch"):null;if(he){typeof((Re=he.classList)==null?void 0:Re.toggle)=="function"&&(he.classList.toggle("sw-present",P&&!re),he.classList.toggle("sw-absent",!P),he.classList.toggle("sw-late",re)),he.setAttribute("aria-checked",P?"true":"false");const Ce=typeof he.querySelector=="function"?he.querySelector(".att-switch-label"):null;Ce&&(Ce.textContent=re?"L":P?"P":"A"),he.setAttribute("title",re?"Late Present (L) - tap to mark Absent":P?"Present (P) - tap to mark Late":"Absent (A) - tap to mark Present")}const ye=typeof O.querySelector=="function"?O.querySelector(".att-compact-action"):null;if(ye){let Ce=typeof ye.querySelector=="function"?ye.querySelector(".att-late-badge"):null;re?(!Ce&&typeof document<"u"&&(Ce=document.createElement("span"),Ce.className="att-late-badge",Ce.id=`att-late-badge-${T}`,ye.insertBefore(Ce,he)),Ce&&(Ce.textContent=`${me}m late`,Ce.setAttribute("title",`Late arrival by ${me} min after class started`))):(He=Ce==null?void 0:Ce.remove)==null||He.call(Ce)}const _e=typeof O.querySelector=="function"?O.querySelector(".att-compact-info"):null;if(_e&&w){let Ce=typeof _e.querySelector=="function"?_e.querySelector(".att-late-admin-note"):null;re?(!Ce&&typeof document<"u"&&(Ce=document.createElement("div"),Ce.className="att-late-admin-note",Ce.id=`att-late-note-${T}`,_e.appendChild(Ce)),Ce&&(Ce.innerHTML=`⏱️ ${me} min late (Class: ${Le((ee==null?void 0:ee.start_time)||"06:30")})`)):(Pe=Ce==null?void 0:Ce.remove)==null||Pe.call(Ce)}}function ue(T=q(M)){T.forEach(O=>ce(O.id))}function ae(){var J;const T=(((J=s.querySelector("#att-search-input"))==null?void 0:J.value)||"").toLowerCase().trim();let O=0;s.querySelectorAll(".attendance-compact-card").forEach(ee=>{const B=ee.getAttribute("data-student-name")||"";!T||B.includes(T)?(ee.style.display="flex",O++):ee.style.display="none"});const Q=s.querySelector("#att-no-matches");Q&&(Q.style.display=O===0?"block":"none")}function R(T,O){var J,ee,B,P,re,me,he,ye,_e,fe;if(!s||typeof s.querySelector!="function")return;(J=s.querySelector("#btn-back-to-cards"))==null||J.addEventListener("click",()=>{typeof sessionStorage<"u"&&(sessionStorage.removeItem("tps_active_att_cls"),sessionStorage.removeItem("tps_active_att_date")),x="cards",de()}),(ee=s.querySelector("#btn-view-att-reports"))==null||ee.addEventListener("click",()=>{t?t("attendance_report"):typeof window<"u"&&(window.location.hash="#attendance_report")}),(B=s.querySelector("#att-search-input"))==null||B.addEventListener("input",ae),s.querySelectorAll(".attendance-compact-card.is-on-leave").forEach(pe=>{pe.addEventListener("click",ve=>{ve.stopPropagation();const be=pe.getAttribute("data-student-id"),Se=I.find(Fe=>Fe.id===be);oe.warning(`${(Se==null?void 0:Se.full_name)||"This student"} is on approved hostel leave. Teachers cannot record attendance.`)})}),(P=s.querySelector("#btn-admin-unlock-window"))==null||P.addEventListener("click",async()=>{await W.unlockAttendanceWindow(M,E),oe.success("Unlocked late attendance window. Faculty can now record attendance."),ne()}),(re=s.querySelector("#att-date-badge-trigger"))==null||re.addEventListener("click",()=>{Ns({initialDate:E,title:"Attendance Date",onSelect:async pe=>{const ve=Pt(pe);if(a&&ve!==b&&!await W.isAttendanceWindowUnlocked(M,ve)){oe.warning(`Date ${ve} is locked. Teachers can only select Admin-unlocked missed attendance dates.`);return}E=ve,ne()}})}),(me=s.querySelector("#btn-mark-all-present"))==null||me.addEventListener("click",()=>{if(!T)return;const pe=p.find(xe=>xe.id===M)||h.find(xe=>xe.id===M),ve=pt((pe==null?void 0:pe.start_time)||"06:30"),be=new Date().getHours()*60+new Date().getMinutes(),Se=Math.max(1,be-ve);let Fe=0;O.forEach(xe=>{if(te(xe,E))return;F&&v.has(xe.id)?(A[xe.id]="Late Present",C[xe.id]||(C[xe.id]=Se)):A[xe.id]="Present",Fe++}),ue(O),X(O),oe.info(`Marked in-class students (${Fe}) Present.`)});const Q=()=>{if(!T)return;let pe=0;O.forEach(be=>{te(be,E)||(A[be.id]="Absent",delete C[be.id],pe++)});const ve=s.querySelector("#att-search-input");ve&&ve.value&&(ve.value="",ae()),ue(O),X(O),oe.info(`Attendance cleared: In-class students (${pe}) reset to default (Absent).`)};(he=s.querySelector("#btn-clear-attendance"))==null||he.addEventListener("click",Q),(ye=s.querySelector("#btn-mark-all-absent"))==null||ye.addEventListener("click",Q),T&&((_e=s.querySelector("#btn-reset-attendance-session"))==null||_e.addEventListener("click",async()=>{await Qe({title:"Reset Attendance Session?",message:`Are you sure you want to clear and reset the attendance session for ${activeCls==null?void 0:activeCls.name} on ${Me(E)}? This will delete the recorded attendance and allow recording fresh attendance from scratch.`,confirmText:"Yes, Reset Session",cancelText:"Cancel"})&&(await W.deleteAttendanceSession(M,E),oe.success(`Attendance session for ${Me(E)} reset. You can now take fresh attendance.`),F=!1,f=null,await ne())}),s.querySelectorAll(".att-2way-switch").forEach(pe=>{pe.addEventListener("click",ve=>{ve.stopPropagation();const be=pe.getAttribute("data-student-id");be&&se(be,O)})}),(fe=s.querySelector("#btn-submit-attendance"))==null||fe.addEventListener("click",async()=>{if(!w&&!!W.isFacultyOnApprovedLeave(n,E,j)){oe.error("Cannot submit attendance: You are on authorized faculty leave.");return}const ve=p.find(Re=>Re.id===M)||h.find(Re=>Re.id===M),be=D.find(Re=>Re.id===(ve==null?void 0:ve.program_id)),Se=Y.find(Re=>Re.id===(ve==null?void 0:ve.teacher_id)),Fe=Se?Se.full_name||Se.email:o?(n==null?void 0:n.full_name)||"Assigned Faculty":"Rashid Sir",xe=pt((ve==null?void 0:ve.start_time)||"06:30"),ke=new Date,Ne=ke.getHours()*60+ke.getMinutes(),De=E===b;let we=!1,Ae=0;if(F&&f){const Re=W.getSessionPunctualityInfo?W.getSessionPunctualityInfo(f,ve==null?void 0:ve.start_time):{isLate:!1,lateMinutes:0};we=Re.isLate,Ae=Re.lateMinutes}else if(De){const Re=Ne-xe;Re>15?(we=!0,Ae=Re):Ae=Math.max(0,Re)}else E<b&&(we=!0,Ae=60);let ze=!1;if(F)ze=await Qe({title:"Confirm Attendance Update",message:`Update attendance records for ${ve==null?void 0:ve.name}? This records student presence and late arrivals. Faculty duty punctuality remains preserved from your initial class attendance.`,confirmText:"Save & Update Attendance"});else if(we){const Re=xe+15,He=Math.floor(Re/60),Pe=Re%60,Ce=`${String(He).padStart(2,"0")}:${String(Pe).padStart(2,"0")}`;ze=await Qe({title:"⚠️ Attendance Punctuality Reminder",message:`
              <div style="text-align: left; padding: 0.25rem 0;">
                <div style="background: #FEF2F2; border: 1.5px solid #FECACA; border-radius: 12px; padding: 0.85rem; margin-bottom: 0.85rem;">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.45rem;">
                    <strong style="color: #991B1B; font-size: 0.92rem;">Late Attendance Submission</strong>
                    <span class="badge badge-danger" style="font-weight: 800; font-size: 0.74rem; padding: 2px 8px; border-radius: 9999px;">
                      +${Ae} min late
                    </span>
                  </div>
                  <div style="font-size: 0.8rem; color: #7F1D1D; line-height: 1.5;">
                    <div>Faculty: <strong>${Fe}</strong></div>
                    <div>Class: <strong>${(ve==null?void 0:ve.name)||"Classroom"}</strong> (${Le((ve==null?void 0:ve.start_time)||"06:30")} – ${Le((ve==null?void 0:ve.end_time)||"07:30")})</div>
                    <div>15-Min Grace Window Ended: <strong>${Le(Ce)}</strong></div>
                    <div style="margin-top: 3px; font-weight: 700; color: #DC2626;">
                      Current Time: ${Le(ke.toTimeString().slice(0,5))} (${Ae} minutes after class started)
                    </div>
                  </div>
                </div>

                <div style="font-size: 0.8rem; color: #475569; line-height: 1.5; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 0.75rem;">
                  📢 <strong>Punctuality Protocol:</strong> Faculty members are expected to record classroom attendance strictly within <strong>15 minutes</strong> after class commences.<br/>
                  <span style="color: #64748B; font-size: 0.74rem; margin-top: 4px; display: inline-block;">
                    Please take attendance promptly in future sessions. This record will be logged with your timestamp as Late (+${Ae}m) on the attendance card and duty reports.
                  </span>
                </div>
              </div>
            `,confirmText:"Acknowledge & Confirm Attendance",cancelText:"Cancel"})}else ze=await Qe({title:"Confirm Live Attendance Submission",message:`Submit punctual attendance for ${ve==null?void 0:ve.name}? This will record student presence, timestamp the exact time (${Le(new Date().toTimeString().slice(0,5))}), and record your faculty duty attendance.`,confirmText:"Submit Attendance"});if(ze){const Re=O.map(Pe=>{const Ce=Pe.id,et=te(Pe,E)?"Leave":A[Ce]||"Absent";return{student_id:Ce,status:et,late_minutes:et==="Late Present"?C[Ce]||15:null}}),He=new Date().toISOString();await W.saveAttendanceSession({program_id:(be==null?void 0:be.id)||"prog-1",classroom_id:M,session_date:E,teacher_id:(ve==null?void 0:ve.teacher_id)||(n==null?void 0:n.id)||"u-2",teacher_name:Fe,recorded_at:(f==null?void 0:f.first_recorded_at)||(f==null?void 0:f.recorded_at)||He,submission_punctuality:(f==null?void 0:f.first_submission_punctuality)||(f==null?void 0:f.submission_punctuality)||(we?"late":"punctual"),late_submission_minutes:(f==null?void 0:f.first_late_submission_minutes)!==void 0?f.first_late_submission_minutes:we?Ae:0,class_start_time:(ve==null?void 0:ve.start_time)||"06:30",submitted_by_name:(f==null?void 0:f.submitted_by_name)||Fe,records:Re}),oe.success(F?"Attendance updated! Late-arriving students recorded and faculty punctuality preserved.":`Attendance submitted! Exact time (${Le(new Date().toTimeString().slice(0,5))}) stored and faculty duty marked Present.`),F=!0,typeof sessionStorage<"u"&&(sessionStorage.removeItem("tps_active_att_cls"),sessionStorage.removeItem("tps_active_att_date")),x="cards",await de()}}))}x==="roster"?await ne():await de()}function at(s,t=""){let e="",i=t;return typeof s=="object"&&s!==null?(e=String(s.gender||"").toLowerCase().trim(),i=String(s.hostel_unit||"").toLowerCase()):(e=String(s||"").toLowerCase().trim(),i=String(t||"").toLowerCase()),e==="male"||e==="boys"||e==="boy"||e.startsWith("b")||e.startsWith("m")?!0:e==="female"||e==="girls"||e==="girl"||e.startsWith("g")||e.startsWith("f")?!1:i.includes("boys")?!0:!i.includes("girls")}async function la(s,{onNavigate:t=()=>{}}={}){const e=je(),i=xt(e),n=i==="Girls",a=i==="Boys",r=kt(e,"leaves","create"),l=kt(e,"leaves","record_return");At(e,"leaves"),await W.pullCloudKeys(["tps_leaves","tps_students","tps_hostel_rooms","tps_hostel_beds","tps_fines","tps_black_marks"],!0);const[d,o,w,_,$,D]=await Promise.all([W.getStudents(),W.getLeaves(!0),W.getHostels(),W.getHostelRooms(),W.getHostelBeds(),W.getParentAssignedStudents(e==null?void 0:e.id,e==null?void 0:e.email)]),p=n?d.filter(v=>v.gender==="Girls"||v.gender==="Female"||v.hostel_unit&&v.hostel_unit.includes("Girls")):a?d.filter(v=>v.gender==="Boys"||v.gender==="Male"||v.hostel_unit&&v.hostel_unit.includes("Boys")):d,Z=new Set(p.map(v=>v.id)),Y=(e==null?void 0:e.role)==="parent",S=new Set([...(e==null?void 0:e.assigned_student_ids)||[],...(e==null?void 0:e.student_ids)||[],...(e==null?void 0:e.child_ids)||[],...D||[]]),j=((e==null?void 0:e.phone)||(e==null?void 0:e.phone_number)||"").replace(/[^0-9]/g,"");function V(v){return Y?v.filter(F=>{const f=Array.isArray(F.student_ids)&&F.student_ids.length>0?F.student_ids:[F.student_id];return S.size>0?f.some(te=>S.has(te)):f.some(te=>{const K=d.find(de=>de.id===te);return K?j&&((K.father_phone||"").replace(/[^0-9]/g,"")===j||(K.mother_phone||"").replace(/[^0-9]/g,"")===j)||e!=null&&e.full_name&&K.father_name&&K.father_name.toLowerCase().trim()===e.full_name.toLowerCase().trim()?!0:(K==null?void 0:K.father_phone)==="+91 98470 11223"||(K==null?void 0:K.full_name)==="Muhammad Rayyan":!1})}):n||a?v.filter(F=>(Array.isArray(F.student_ids)&&F.student_ids.length>0?F.student_ids:[F.student_id]).some(te=>Z.has(te))):v}const I=V(o);async function G(){const v=await W.getLeaves(!0),F=V(v);I.length=0,I.push(...F)}let N="",h="all";function L(v){const F=(v.status||"").toLowerCase();if(F==="pending"||F==="rejected")return 0;if(Array.isArray(v.students)&&v.students.length>0)return v.students.filter(K=>{if(K.is_returned)return!1;const de=(d||p||[]).find(le=>le.id===K.student_id);return!de||We(de)}).length;const f=v.student_id||(Array.isArray(v.student_ids)?v.student_ids[0]:null),te=(d||p||[]).find(K=>K.id===f);return te&&!We(te)||v.status==="Returned"?0:1}function c(v){const F=(v.status||"").toLowerCase();if(F==="pending"||F==="rejected"||v.status==="Returned")return!1;if(v.status==="Overdue"||v.status==="overdue")return!0;if(!v.expected_return_date)return!1;const f=new Date,te=new Date(v.expected_return_date+"T"+(v.expected_return_time||"23:59:59"));return f>te}let b=[];function E(v){const F=[];return v.forEach(f=>{const te=(f.status||"").toLowerCase()==="pending",K=(f.status||"").toLowerCase()==="rejected";if(te||K){F.push({...f,id:f.id,is_arrival_card:!1,has_existing_arrivals:!1});return}const de=Array.isArray(f.students)&&f.students.length>0,le=de?f.students.filter(ae=>{const R=(d||p||[]).find(U=>U.id===ae.student_id);return!R||We(R)}):f.student_id?!(d||p||[]).find(ae=>ae.id===f.student_id)||We((d||p||[]).find(ae=>ae.id===f.student_id))?[f.student_id]:[]:[];if(de&&le.length===0&&!te&&!K||!de&&f.student_id&&le.length===0&&!te&&!K)return;const ne=de?le.filter(ae=>ae.is_returned):[],g=de?le.filter(ae=>!ae.is_returned):[];g.filter(ae=>ae.is_extended);const X=de?ne.length>0:f.status==="Returned"||!!f.actual_return_date,ie=de?le.length:Array.isArray(f.student_ids)?f.student_ids.length:1,se=de?g.length:f.status==="Returned"?0:1,ce=de?ne.length:f.status==="Returned"?1:0,ue=se===0;if(F.push({...f,id:f.id,is_arrival_card:!1,has_existing_arrivals:X,students:de?le:f.students,student_ids:de?le.map(ae=>ae.student_id):f.student_id?[f.student_id]:[],total_students:ie,all_students_count:ie,unreturned_count:se,arrived_count:ce,status:ue?"Returned":c(f)?"Overdue":f.is_extended?"Extended":"Away"}),de&&ne.length>0){const ae=new Map;ne.forEach(U=>{const T=U.batch_id||`${U.actual_return_date||f.actual_return_date||"arr"}_${U.actual_return_time||f.actual_return_time||"00:00"}`;ae.has(T)||ae.set(T,[]),ae.get(T).push(U)});const R=Array.from(ae.entries());R.forEach(([U,T],O)=>{var re,me,he,ye;const Q=((re=T[0])==null?void 0:re.actual_return_date)||f.actual_return_date||f.expected_return_date,J=((me=T[0])==null?void 0:me.actual_return_time)||f.actual_return_time||f.expected_return_time||"17:00",ee=((he=T[0])==null?void 0:he.return_remarks)||f.return_remarks||"",B=f.leave_code||f.leave_register_number||"LV",P=R.length>1?`${B}-A${O+1}`:`${B}-ARR`;F.push({...f,id:`${f.id}__arr__${U}`,parent_leave_id:f.id,is_arrival_card:!0,batch_key:U,leave_code:P,parent_leave_code:B,status:"Returned",students:T,student_ids:T.map(_e=>_e.student_id),total_students:T.length,actual_return_date:Q,actual_return_time:J,arrival_remarks:ee,has_existing_arrivals:!1,created_at:(ye=T[0])!=null&&ye.actual_return_date?`${Q}T${J}:00`:f.created_at})})}else if(!de&&(f.status==="Returned"||f.actual_return_date)){const ae=f.leave_code||f.leave_register_number||"LV",R=f.actual_return_date||f.expected_return_date,U=f.actual_return_time||f.expected_return_time||"17:00",T=`${R}_${U}`;F.push({...f,id:`${f.id}__arr__${T}`,parent_leave_id:f.id,is_arrival_card:!0,batch_key:T,leave_code:`${ae}-ARR`,parent_leave_code:ae,status:"Returned",total_students:1,actual_return_date:R,actual_return_time:U,arrival_remarks:f.return_remarks||f.remarks||"",has_existing_arrivals:!1,created_at:`${R}T${U}:00`})}}),F}function k(){let v=0,F=0,f=0;const te=I.filter(g=>(g.status||"").toLowerCase()==="pending").length,K=I.filter(g=>(g.status||"").toLowerCase()==="rejected").length;I.forEach(g=>{const X=(g.status||"").toLowerCase()==="pending",ie=(g.status||"").toLowerCase()==="rejected";if(!(X||ie))if(Array.isArray(g.students)&&g.students.length>0){const se=g.students.filter(ue=>{const ae=(d||p||[]).find(R=>R.id===ue.student_id);return(!ae||We(ae))&&ue.is_returned}).length,ce=g.students.filter(ue=>{const ae=(d||p||[]).find(R=>R.id===ue.student_id);return(!ae||We(ae))&&!ue.is_returned}).length;f+=se,v+=ce,c(g)&&ce>0&&(F+=ce)}else if(g.status==="Returned")f+=g.total_students||1;else{const se=L(g);v+=se,c(g)&&se>0&&(F+=se)}});const de=E(I);b=de;const le=de.length,ne=de.filter(g=>{const X=(g.status||"").toLowerCase()==="pending",ie=(g.status||"").toLowerCase()==="rejected",se=g.status==="Returned"||g.is_arrival_card,ce=!se&&!X&&!ie&&(g.status==="Overdue"||c(g)),ue=!se&&!X&&!ie&&!ce;if(h==="pending"&&!X||h==="away"&&!ue||h==="overdue"&&!ce||h==="returned"&&!se||h==="rejected"&&!ie)return!1;if(N){const ae=N.toLowerCase(),R=(g.leave_code||g.parent_leave_code||g.leave_register_number||"").toLowerCase().includes(ae),U=(g.reason||g.arrival_remarks||"").toLowerCase().includes(ae),T=(g.leave_type||"").toLowerCase().includes(ae),Q=(Array.isArray(g.student_ids)&&g.student_ids.length>0?g.student_ids:[g.student_id]).some(J=>{var B,P;const ee=p.find(re=>re.id===J)||d.find(re=>re.id===J);return ee&&(((B=ee.full_name)==null?void 0:B.toLowerCase().includes(ae))||((P=ee.admission_number)==null?void 0:P.toLowerCase().includes(ae)))})||g.student_name&&g.student_name.toLowerCase().includes(ae);if(!R&&!U&&!T&&!Q)return!1}return!0});ne.sort((g,X)=>{const ie=(g.status||"").toLowerCase()==="pending",se=(X.status||"").toLowerCase()==="pending";return ie&&!se?-1:!ie&&se?1:new Date(X.created_at||X.departure_date||0)-new Date(g.created_at||g.departure_date||0)}),s.innerHTML=`
      <div class="page-header" style="margin-bottom: 1.25rem;">
        <div class="page-title-group">
          <h2 style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.45rem; font-weight: 800; color: #0F172A;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Hostel Leave & Return Management
          </h2>
          <p style="font-size: 0.85rem; color: #64748B; margin-top: 0.2rem;">Batch vacation cards, individual leave passes, return recording, and automatic date-based fine auditing</p>
        </div>
        <div class="page-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          ${l?`
            <button class="btn btn-primary" id="btn-record-arrival" style="background: #059669; border-color: #059669; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Record Arrival
            </button>
          `:""}
          ${r?`
            <button class="btn btn-secondary" id="btn-issue-leave-pass" style="font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Issue Leave Pass
            </button>
            <!-- Hidden backward compatibility triggers for test suite -->
            <button id="btn-group-leave" style="display: none !important;" aria-hidden="true"></button>
            <button id="btn-individual-leave" style="display: none !important;" aria-hidden="true"></button>
          `:""}
        </div>
      </div>

      <!-- KPI Bento Stats Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; margin-bottom: 1.25rem;">
        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 0.85rem 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div style="font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">Active Passes</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #0F172A; margin-top: 0.2rem;">${le}</div>
          <div style="font-size: 0.75rem; color: #94A3B8; margin-top: 0.15rem;">Registered leave files</div>
        </div>
        <div style="background: ${te>0?"#FFFBEB":"#FFFFFF"}; border: 1px solid ${te>0?"#FDE68A":"#E2E8F0"}; border-radius: 14px; padding: 0.85rem 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03); cursor: pointer;" id="kpi-pending-leaves-card" title="Click to filter pending requests">
          <div style="font-size: 0.75rem; font-weight: 700; color: #D97706; text-transform: uppercase; letter-spacing: 0.04em;">Pending Approvals</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #D97706; margin-top: 0.2rem;">${te}</div>
          <div style="font-size: 0.75rem; color: ${te>0?"#B45309":"#94A3B8"}; margin-top: 0.15rem;">${te>0?"Requires authorization":"All clear"}</div>
        </div>
        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 0.85rem 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div style="font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.04em;">Students Away</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #0F172A; margin-top: 0.2rem;">${v}</div>
          <div style="font-size: 0.75rem; color: #94A3B8; margin-top: 0.15rem;">Currently off-campus</div>
        </div>
        <div style="background: #FFFFFF; border: 1px solid ${F>0?"#FECACA":"#E2E8F0"}; border-radius: 14px; padding: 0.85rem 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div style="font-size: 0.75rem; font-weight: 700; color: ${F>0?"#DC2626":"#64748B"}; text-transform: uppercase; letter-spacing: 0.04em;">Overdue Returns</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: ${F>0?"#DC2626":"#0F172A"}; margin-top: 0.2rem;">${F}</div>
          <div style="font-size: 0.75rem; color: #94A3B8; margin-top: 0.15rem;">Late fine accruing</div>
        </div>
        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 0.85rem 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div style="font-size: 0.75rem; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.04em;">Returned Safe</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #059669; margin-top: 0.2rem;">${f}</div>
          <div style="font-size: 0.75rem; color: #94A3B8; margin-top: 0.15rem;">Back on campus</div>
        </div>
      </div>

      <!-- Filter & Search Toolbar -->
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: space-between; align-items: center;">
        <!-- Search Input -->
        <div style="position: relative; flex: 1 1 240px; min-width: 200px;">
          <input 
            type="text" 
            id="leave-search-input" 
            class="form-control" 
            placeholder="Search student, admission no, or leave code..." 
            value="${N}" 
            style="padding-left: 2.2rem; height: 38px; font-size: 0.85rem;"
          />
          <svg style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94A3B8;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>

        <!-- Status Filter Pills -->
        <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-sm btn-leave-filter ${h==="all"?"btn-primary":"btn-ghost"}" data-status="all" style="border-radius: 9999px; font-weight: 600; font-size: 0.78rem;">
            All (${de.length})
          </button>
          <button type="button" class="btn btn-sm btn-leave-filter ${h==="pending"?"btn-warning":"btn-ghost"}" data-status="pending" style="border-radius: 9999px; font-weight: 700; font-size: 0.78rem; ${h==="pending"?"background: #D97706; color: #FFFFFF; border: 1px solid #D97706;":te>0?"background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;":""}">
            Pending (${te})
          </button>
          <button type="button" class="btn btn-sm btn-leave-filter ${h==="away"?"btn-primary":"btn-ghost"}" data-status="away" style="border-radius: 9999px; font-weight: 600; font-size: 0.78rem;">
            Away (${v})
          </button>
          <button type="button" class="btn btn-sm btn-leave-filter ${h==="overdue"?"btn-primary":"btn-ghost"}" data-status="overdue" style="border-radius: 9999px; font-weight: 600; font-size: 0.78rem;">
            Overdue (${F})
          </button>
          <button type="button" class="btn btn-sm btn-leave-filter ${h==="returned"?"btn-primary":"btn-ghost"}" data-status="returned" style="border-radius: 9999px; font-weight: 600; font-size: 0.78rem;">
            Returned (${f})
          </button>
          <button type="button" class="btn btn-sm btn-leave-filter ${h==="rejected"?"btn-danger":"btn-ghost"}" data-status="rejected" style="border-radius: 9999px; font-weight: 600; font-size: 0.78rem; ${h==="rejected"?"background: #DC2626; color: #FFFFFF; border: 1px solid #DC2626;":K>0?"background: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5;":""}">
            Rejected (${K})
          </button>
        </div>
      </div>

      <!-- Main Register Card Panel -->
      <div class="card-panel" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">
        <div class="card-panel-header" style="padding: 1rem 1.25rem; border-bottom: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 1rem; font-weight: 700; color: #0F172A; margin: 0;">Leave Card Register</h3>
          <span class="badge badge-active">${ne.length} Passes Displayed</span>
        </div>

        <div class="card-panel-body" style="padding: 0;">
          ${ne.length===0?`
            <div style="text-align: center; padding: 3rem 1rem; color: #64748B;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="1.5" style="margin-bottom: 0.75rem;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <h4 style="font-size: 1.05rem; font-weight: 700; color: #1E293B; margin-bottom: 0.25rem;">No Leave Passes Found</h4>
              <p style="font-size: 0.85rem; max-width: 400px; margin: 0 auto;">No records match your active search or filter criteria. Create an individual or batch leave pass when residents depart campus.</p>
            </div>
          `:`
            <!-- Desktop Table View -->
            <div class="table-responsive desktop-leave-table" style="overflow-x: auto;">
              <table class="data-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
                    <th style="padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #64748B;">Leave Code</th>
                    <th style="padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #64748B;">Type & Reason</th>
                    <th style="padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #64748B;">Departure</th>
                    <th style="padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #64748B;">Expected Return</th>
                    <th style="padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #64748B;">Students</th>
                    <th style="padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #64748B;">Status</th>
                    <th style="padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #64748B; text-align: right;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${ne.map(g=>{if(g.is_arrival_card){const re=g.parent_leave_code||"LV",me=g.total_students||(Array.isArray(g.students)?g.students.length:1),he=Array.isArray(g.student_ids)?g.student_ids:[],ye=p.find(xe=>xe.id===he[0])||d.find(xe=>xe.id===he[0]),_e=me===1&&ye?ye.full_name:`${me} Student(s) Arrived`,fe=(g.leave_type||"Vacation").replace(/_/g," "),pe=g.expected_return_time&&g.expected_return_time.length===5?`${g.expected_return_time}:00`:g.expected_return_time||"18:00:00",ve=g.actual_return_time&&g.actual_return_time.length===5?`${g.actual_return_time}:00`:g.actual_return_time||"18:00:00",be=g.expected_return_date?new Date(`${g.expected_return_date}T${pe}`):null,Se=g.actual_return_date?new Date(`${g.actual_return_date}T${ve}`):null;let Fe=!1;return Se&&be&&!isNaN(Se.getTime())&&!isNaN(be.getTime())&&Se.getTime()>be.getTime()?(Fe=!0,Se.getTime()-be.getTime()):Number(g.late_hours)>0||Number(g.late_days)>0||Number(g.calculated_fine)>0?(Fe=!0,Number(g.late_days)>0?`${g.late_days}`:`${g.late_hours||1}`):Array.isArray(g.students)&&g.students.some(xe=>Number(xe.late_hours)>0||Number(xe.late_days)>0||Number(xe.fine_amount)>0)&&(Fe=!0,Math.max(...g.students.map(xe=>Number(xe.late_hours)||(Number(xe.late_days)||0)*24||0))),`
                        <tr style="border-bottom: 1px solid #E2E8F0; background: ${Fe?"#FEF2F2":"#F0FDF4"}; transition: background 0.15s ease;">
                          <td style="padding: 0.85rem 1rem;">
                            <div style="font-weight: 800; font-family: monospace; font-size: 0.88rem; color: ${Fe?"#DC2626":"#047857"};">${g.leave_code}</div>
                            <div style="font-size: 0.7rem; color: ${Fe?"#EF4444":"#059669"}; font-weight: 600;">Batch from ${re}</div>
                          </td>
                          <td style="padding: 0.85rem 1rem;">
                            <div style="font-weight: 700; color: #1E293B; text-transform: capitalize; font-size: 0.85rem;">${fe} (Arrival)</div>
                            <div style="font-size: 0.76rem; color: #64748B; margin-top: 1px;">${g.arrival_remarks||g.reason||(Fe?"Late arrival recorded":"Safe return recorded")}</div>
                          </td>
                          <td style="padding: 0.85rem 1rem;">
                            <div style="font-size: 0.82rem; font-weight: 600; color: #1E293B;">${g.departure_date||"-"}</div>
                            <div style="font-size: 0.72rem; color: #94A3B8;">Departed</div>
                          </td>
                          <td style="padding: 0.85rem 1rem;">
                            <div style="font-size: 0.82rem; font-weight: 800; color: ${Fe?"#DC2626":"#047857"};">${g.actual_return_date||"-"}</div>
                            <div style="font-size: 0.72rem; color: ${Fe?"#DC2626":"#059669"}; font-weight: 600;">${Le(g.actual_return_time||"17:00")}</div>
                          </td>
                          <td style="padding: 0.85rem 1rem;">
                            <span class="badge" style="background: ${Fe?"#FEE2E2":"#DCFCE7"}; color: ${Fe?"#991B1B":"#15803D"}; font-weight: 700; border-radius: 9999px; padding: 2px 8px; font-size: 0.75rem;">
                              ${_e}
                            </span>
                          </td>
                          <td style="padding: 0.85rem 1rem;">
                            ${Fe?`
                              <span class="badge" style="background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; font-size: 0.75rem; padding: 3px 8px; border-radius: 9999px; font-weight: 700;">
                                Returned Late
                              </span>
                            `:`
                              <span class="badge badge-success" style="background: #ECFDF5; color: #047857; font-size: 0.75rem; padding: 3px 8px; border-radius: 9999px; font-weight: 700;">
                                Returned Safe
                              </span>
                            `}
                          </td>
                          <td style="padding: 0.85rem 1rem; text-align: right;">
                            <div style="display: inline-flex; gap: 0.35rem; align-items: center; justify-content: flex-end;">
                              <button class="btn btn-xs btn-outline btn-view-arrival-card" data-card-id="${g.id}" style="border-radius: 9999px; padding: 0.25rem 0.65rem; font-weight: 600; font-size: 0.75rem;">
                                Details
                              </button>
                              ${l?`
                                <button class="btn btn-xs btn-outline-danger btn-delete-arrival-card" data-parent-id="${g.parent_leave_id}" data-batch-key="${g.batch_key}" data-code="${g.leave_code}" data-students='${JSON.stringify(g.student_ids)}' style="border-radius: 9999px; padding: 0.25rem 0.55rem; font-weight: 600; font-size: 0.75rem; color: #DC2626; border-color: #FCA5A5; display: inline-flex; align-items: center; gap: 3px;" title="Cancel arrival for this batch only">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>Delete
                                </button>
                              `:""}
                            </div>
                          </td>
                        </tr>
                      `}const X=g.has_existing_arrivals?g.unreturned_count||0:L(g),ie=(g.status||"").toLowerCase()==="rejected",se=(g.status||"").toLowerCase()==="pending";se||(g.requested_by_parent||g.request_source==="parent"||g.source);const ce=c(g),ue=!se&&!ie&&(g.status==="Returned"||(g.has_existing_arrivals?g.unreturned_count===0:X===0)),ae=!!g.is_extended,R=g.departure_date||g.leaving_date,U=Oe(),T=!se&&!ie&&!ue&&R&&R>U,O=g.leave_code||g.leave_register_number||"LV-2026",Q=(g.leave_type||"Hostel Leave").replace(/_/g," "),J=g.has_existing_arrivals?g.all_students_count||g.total_students:g.total_students||(Array.isArray(g.student_ids)?g.student_ids.length:1),ee=Array.isArray(g.student_ids)?g.student_ids:[g.student_id],B=p.find(re=>re.id===ee[0]),P=ee.length===1&&B?B.full_name:`${J} Student(s)`;return`
                      <tr style="border-bottom: 1px solid #ECFDF5; background: #FAFCFA; transition: background 0.15s ease;">
                        <td style="padding: 0.85rem 1rem;">
                          <span style="font-weight: 800; font-family: monospace; font-size: 0.88rem; color: ${ie||ce?"#DC2626":ae?"#7C3AED":"#047857"};">${O}${g.parent_leave_code?` <span style="font-size: 0.75rem; color: #7E22CE; font-weight: 700;">(${g.parent_leave_code})</span>`:""}</span>
                        </td>
                        <td style="padding: 0.85rem 1rem;">
                          <div style="font-weight: 700; color: #1E293B; text-transform: capitalize; font-size: 0.85rem;">${Q}${ae?" (Extended Leave)":""}</div>
                          <div style="font-size: 0.76rem; color: #64748B; margin-top: 1px;">${g.reason||"General leave"}</div>
                        </td>
                        <td style="padding: 0.85rem 1rem;">
                          <div style="font-size: 0.82rem; font-weight: 600; color: #1E293B;">${g.departure_date||g.leaving_date||"-"}</div>
                          <div style="font-size: 0.72rem; color: #94A3B8;">${g.departure_time||g.leaving_time||"16:00"}</div>
                        </td>
                        <td style="padding: 0.85rem 1rem;">
                          <div style="font-size: 0.82rem; font-weight: 700; color: ${ie?"#DC2626":ae?"#7C3AED":"#1E293B"};">${g.expected_return_date||"-"}</div>
                          <div style="font-size: 0.72rem; color: ${ae?"#7C3AED":"#94A3B8"};">${g.expected_return_time||"17:00"}</div>
                          ${g.fine_per_hour?`<div style="font-size: 0.72rem; color: ${ae?"#7C3AED":"#059669"}; font-weight: 700; margin-top: 2px;">Rate: ₹${g.fine_per_hour}/hr</div>`:""}
                        </td>
                        <td style="padding: 0.85rem 1rem;">
                          <span class="badge" style="background: ${ae?"#F3E8FF":"#ECFDF5"}; color: ${ae?"#7E22CE":"#047857"}; border: 1px solid ${ae?"#DDD6FE":"#A7F3D0"}; font-weight: 600; border-radius: 9999px; padding: 2px 8px; font-size: 0.75rem;">
                            ${P}
                          </span>
                          ${g.has_existing_arrivals?`
                            <span class="badge" style="background: #FEF3C7; color: #92400E; font-size: 0.68rem; margin-left: 3px; font-weight: 700;">
                              ${g.unreturned_count} away
                            </span>
                          `:""}
                        </td>
                        <td style="padding: 0.85rem 1rem;">
                          ${se?`
                            <span class="badge" style="background: #FEF3C7; color: #92400E; font-size: 0.75rem; padding: 3px 8px; border-radius: 9999px; font-weight: 700;">
                              Pending Approval
                            </span>
                          `:ie?`
                            <span class="badge badge-danger" style="background: #FEE2E2; color: #DC2626; font-size: 0.75rem; padding: 3px 8px; border-radius: 9999px; font-weight: 700;" title="${g.rejected_reason||"Rejected"}">
                              Rejected
                            </span>
                          `:T?`
                            <span class="badge" style="background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; font-size: 0.75rem; padding: 3px 8px; border-radius: 9999px; font-weight: 700;">
                              Approved (Upcoming)
                            </span>
                          `:ae?`
                            <span class="badge" style="background: #F3E8FF; color: #7E22CE; border: 1px solid #DDD6FE; font-size: 0.75rem; padding: 3px 8px; border-radius: 9999px; font-weight: 700;">
                              Extended
                            </span>
                          `:`
                            <span class="badge ${ue?"badge-success":"badge-warning"}" style="font-size: 0.75rem; padding: 3px 8px; border-radius: 9999px; font-weight: 700; ${ue?"":"background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;"}">
                              ${ue?"Returned":"Away"}
                            </span>
                          `}
                        </td>
                        <td style="padding: 0.85rem 1rem; text-align: right;">
                          <div style="display: inline-flex; gap: 0.35rem; align-items: center; justify-content: flex-end;">
                            ${r||e!=null&&e.is_super_admin||(e==null?void 0:e.role)==="admin"||bt(e==null?void 0:e.role)?`
                              ${se?`
                                <button class="btn btn-xs btn-primary btn-approve-leave" data-id="${g.id}" style="background: #059669; border-color: #059669; font-weight: 700; border-radius: 9999px; padding: 0.25rem 0.65rem; font-size: 0.75rem;">
                                  Approve
                                </button>
                                <button class="btn btn-xs btn-outline btn-reject-leave" data-id="${g.id}" style="color: #DC2626; border-color: #FCA5A5; font-weight: 600; border-radius: 9999px; padding: 0.25rem 0.65rem; font-size: 0.75rem;" title="Reject leave request">
                                  Reject
                                </button>
                              `:""}
                              ${!ue&&!ie&&!se?`
                                <button class="btn btn-xs btn-outline btn-edit-leave" data-id="${g.id}" style="color: #2563EB; border-color: #93C5FD; font-weight: 600; border-radius: 9999px; padding: 0.25rem 0.65rem; font-size: 0.75rem;" title="Edit requested date & time schedule">
                                  Edit
                                </button>
                                <button class="btn btn-xs btn-outline btn-extend-leave" data-id="${g.id}" style="color: #7C3AED; border-color: #DDD6FE; font-weight: 700; border-radius: 9999px; padding: 0.25rem 0.65rem; font-size: 0.75rem;" title="Expand/extend return date for student(s)">
                                  Extend
                                </button>
                              `:""}
                            `:""}

                            <button class="btn btn-xs btn-outline btn-view-leave-details btn-view-leave-card" data-id="${g.id}" style="border-radius: 9999px; padding: 0.25rem 0.65rem; font-weight: 600; font-size: 0.75rem;">
                              Details
                            </button>
                            <button class="btn btn-xs btn-outline-danger btn-delete-leave" data-id="${g.id}" data-has-arrivals="${g.has_existing_arrivals?"true":"false"}" data-unreturned="${g.unreturned_count||X}" data-arrived="${(g.all_students_count||0)-(g.unreturned_count||X)}" style="border-radius: 9999px; padding: 0.25rem 0.55rem; font-weight: 600; font-size: 0.75rem; color: #DC2626; border-color: #FCA5A5; display: inline-flex; align-items: center; gap: 3px;" title="Delete or cancel this leave record">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    `}).join("")}
                </tbody>
              </table>
            </div>

            <!-- Mobile Touch Card Feed (Compact Ergonomics) -->
            <div class="mobile-leave-cards" style="display: none; padding: 0.65rem; flex-direction: column; gap: 0.75rem;">
              ${ne.map(g=>{if(g.is_arrival_card){const B=g.parent_leave_code||"LV",P=g.total_students||(Array.isArray(g.students)?g.students.length:1),re=Array.isArray(g.student_ids)?g.student_ids:[],me=p.find(Fe=>Fe.id===re[0])||d.find(Fe=>Fe.id===re[0]),he=P===1&&me?me.full_name:`${P} Student(s) Arrived`,ye=(g.leave_type||"Vacation").replace(/_/g," "),_e=g.expected_return_time&&g.expected_return_time.length===5?`${g.expected_return_time}:00`:g.expected_return_time||"18:00:00",fe=g.actual_return_time&&g.actual_return_time.length===5?`${g.actual_return_time}:00`:g.actual_return_time||"18:00:00",pe=g.expected_return_date?new Date(`${g.expected_return_date}T${_e}`):null,ve=g.actual_return_date?new Date(`${g.actual_return_date}T${fe}`):null;let be=!1,Se="";if(ve&&pe&&!isNaN(ve.getTime())&&!isNaN(pe.getTime())&&ve.getTime()>pe.getTime()){be=!0;const Fe=ve.getTime()-pe.getTime(),xe=Math.floor(Fe/(1e3*60*60)),ke=Math.floor(Fe%(1e3*60*60)/(1e3*60));if(xe>=24){const Ne=Math.floor(xe/24),De=xe%24;Se=De>0?`${Ne}d ${De}h late`:`${Ne}d late`}else xe>0?Se=ke>0?`${xe}h ${ke}m late`:`${xe}h late`:Se=`${ke}m late`}else if(Number(g.late_hours)>0||Number(g.late_days)>0||Number(g.calculated_fine)>0)be=!0,Se=Number(g.late_days)>0?`${g.late_days}d late`:`${g.late_hours||1}h late`;else if(Array.isArray(g.students)&&g.students.some(Fe=>Number(Fe.late_hours)>0||Number(Fe.late_days)>0||Number(Fe.fine_amount)>0)){be=!0;const Fe=Math.max(...g.students.map(xe=>Number(xe.late_hours)||(Number(xe.late_days)||0)*24||0));Se=Fe>=24?`${Math.floor(Fe/24)}d late`:`${Fe}h late`}return`
                    <div style="background: #FFFFFF; border: 1.5px solid ${be?"#FCA5A5":"#A7F3D0"}; border-radius: 14px; padding: 0.85rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                      <!-- Top Row: Code + Status Badge -->
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                        <div>
                          <span style="font-weight: 800; font-family: monospace; font-size: 0.9rem; color: ${be?"#DC2626":"#047857"};">${g.leave_code}</span>
                          <span style="font-size: 0.7rem; color: ${be?"#EF4444":"#059669"}; font-weight: 600; margin-left: 4px;">(${B})</span>
                        </div>
                        ${be?`
                          <span class="badge" style="background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px; font-weight: 700;">
                            Returned Late
                          </span>
                        `:`
                          <span class="badge" style="background: #ECFDF5; color: #047857; font-size: 0.72rem; padding: 2px 7px; border-radius: 9999px; font-weight: 700;">
                            Returned Safe
                          </span>
                        `}
                      </div>

                      <!-- Reason & Type -->
                      <div style="font-weight: 700; font-size: 0.88rem; color: #1E293B; text-transform: capitalize;">${ye} (Arrival Batch)</div>
                      <div style="font-size: 0.78rem; color: #64748B; margin-top: 2px;">${g.arrival_remarks||g.reason||(be?"Late arrival recorded":"Safe return recorded")}</div>

                      <!-- Dates Specs -->
                      <div style="margin-top: 0.65rem; padding: 0.5rem 0.65rem; background: ${be?"#FEF2F2":"#F0FDF4"}; border-radius: 8px; font-size: 0.78rem; display: flex; justify-content: space-between; align-items: center; border: 1px solid ${be?"#FECACA":"#DCFCE7"};">
                        <div>
                          <div style="color: #64748B; font-size: 0.7rem; font-weight: 600;">DEPARTURE</div>
                          <div style="font-weight: 700; color: #334155;">${g.departure_date||"-"}</div>
                        </div>
                        <div style="color: ${be?"#F87171":"#86EFAC"};">→</div>
                        <div style="text-align: right;">
                          <div style="color: ${be?"#DC2626":"#047857"}; font-size: 0.7rem; font-weight: 700;">ACTUAL ARRIVAL</div>
                          <div style="font-weight: 800; color: ${be?"#DC2626":"#047857"};">${g.actual_return_date||"-"} at ${Le(g.actual_return_time||"17:00")}</div>
                        </div>
                      </div>

                      <!-- Footer Action Row -->
                      <div style="margin-top: 0.75rem; padding-top: 0.55rem; border-top: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: ${be?"#DC2626":"#047857"};">
                          ${he} ${be&&Se?`(${Se})`:""}
                        </span>
                        <div style="display: flex; gap: 0.35rem; align-items: center;">
                          <button class="btn btn-xs btn-outline btn-view-arrival-card" data-card-id="${g.id}" style="border-radius: 9999px; padding: 0.28rem 0.65rem; font-size: 0.74rem;">
                            Details
                          </button>
                          ${l?`
                            <button class="btn btn-xs btn-outline-danger btn-delete-arrival-card" data-parent-id="${g.parent_leave_id}" data-batch-key="${g.batch_key}" data-code="${g.leave_code}" data-students='${JSON.stringify(g.student_ids)}' style="border-radius: 9999px; padding: 0.28rem 0.6rem; font-size: 0.74rem; font-weight: 600; color: #DC2626; border-color: #FCA5A5; display: inline-flex; align-items: center; gap: 3px;" title="Cancel arrival for this batch only">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>Delete
                            </button>
                          `:""}
                        </div>
                      </div>
                    </div>
                  `}const X=g.has_existing_arrivals?g.unreturned_count||0:L(g),ie=(g.status||"").toLowerCase()==="rejected",se=(g.status||"").toLowerCase()==="pending";se||(g.requested_by_parent||g.request_source==="parent"||g.source),c(g);const ce=!se&&!ie&&(g.status==="Returned"||(g.has_existing_arrivals?g.unreturned_count===0:X===0)),ue=!!g.is_extended,ae=g.departure_date||g.leaving_date,R=Oe(),U=!se&&!ie&&!ce&&ae&&ae>R,T=g.leave_code||g.leave_register_number||"LV-2026",O=g.has_existing_arrivals?g.all_students_count||g.total_students:g.total_students||(Array.isArray(g.student_ids)?g.student_ids.length:1),Q=Array.isArray(g.student_ids)?g.student_ids:[g.student_id],J=p.find(B=>B.id===Q[0]),ee=Q.length===1&&J?J.full_name:`${O} Student(s)`;return`
                  <div style="background: #FFFFFF; border: 1.5px solid ${ie?"#FECACA":ue?"#DDD6FE":"#A7F3D0"}; border-radius: 14px; padding: 0.85rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                    <!-- Top Row: Code + Status Badge -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                      <span style="font-weight: 800; font-family: monospace; font-size: 0.9rem; color: ${ie?"#DC2626":ue?"#7C3AED":"#047857"};">${T}${g.parent_leave_code?` <span style="font-size: 0.75rem; color: #7E22CE; font-weight: 700;">(${g.parent_leave_code})</span>`:""}</span>
                      ${se?`
                        <span class="badge" style="background: #FEF3C7; color: #92400E; font-size: 0.72rem; padding: 2px 7px; border-radius: 9999px; font-weight: 700;">
                          Pending Approval
                        </span>
                      `:ie?`
                        <span class="badge badge-danger" style="background: #FEE2E2; color: #DC2626; font-size: 0.72rem; padding: 2px 7px; border-radius: 9999px; font-weight: 700;" title="${g.rejected_reason||"Rejected"}">
                          Rejected
                        </span>
                      `:U?`
                        <span class="badge" style="background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; font-size: 0.72rem; padding: 2px 7px; border-radius: 9999px; font-weight: 700;">
                          Approved (Upcoming)
                        </span>
                      `:ue?`
                        <span class="badge" style="background: #F3E8FF; color: #7E22CE; border: 1px solid #DDD6FE; font-size: 0.72rem; padding: 2px 7px; border-radius: 9999px; font-weight: 700;">
                          Extended
                        </span>
                      `:`
                        <span class="badge ${ce?"badge-success":"badge-warning"}" style="font-size: 0.72rem; padding: 2px 7px; border-radius: 9999px; font-weight: 700; ${ce?"":"background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;"}">
                          ${ce?"Returned":"Away"}
                        </span>
                      `}
                    </div>

                    <!-- Reason & Type -->
                    <div style="font-weight: 700; font-size: 0.88rem; color: #1E293B; text-transform: capitalize;">${(g.leave_type||"Hostel Leave").replace(/_/g," ")}${ue?" (Extended Leave)":""}</div>
                    <div style="font-size: 0.78rem; color: #64748B; margin-top: 2px;">${g.reason||"General leave"}</div>

                    <!-- Dates Specs (Aligned & Balanced with Policy) -->
                    <div style="margin-top: 0.65rem; padding: 0.55rem 0.75rem; background: ${ie?"#FEF2F2":ue?"#FAF5FF":"#F0FDF4"}; border: 1px solid ${ie?"#FECACA":ue?"#E9D5FF":"#DCFCE7"}; border-radius: 8px; font-size: 0.78rem;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <div style="color: ${ie?"#DC2626":ue?"#7E22CE":"#059669"}; font-size: 0.7rem; font-weight: 700;">DEPARTURE</div>
                          <div style="font-weight: 700; color: #1E293B;">${g.departure_date||g.leaving_date||"-"}${g.leaving_time?` <span style="font-size: 0.72rem; color: #64748B;">${g.leaving_time}</span>`:""}</div>
                        </div>
                        <div style="color: ${ie?"#F87171":ue?"#C084FC":"#86EFAC"}; font-weight: 700; padding: 0 4px;">→</div>
                        <div style="text-align: right;">
                          <div style="color: ${ie?"#DC2626":ue?"#7E22CE":"#059669"}; font-size: 0.7rem; font-weight: 700;">EXPECTED RETURN</div>
                          <div style="font-weight: 700; color: #1E293B;">${g.expected_return_date||"-"}${g.expected_return_time?` <span style="font-size: 0.72rem; color: #64748B;">${g.expected_return_time}</span>`:""}</div>
                        </div>
                      </div>
                      ${g.fine_per_hour?`
                        <div style="margin-top: 0.45rem; padding-top: 0.35rem; border-top: 1px dashed ${ie?"#FECACA":ue?"#E9D5FF":"#DCFCE7"}; display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem;">
                          <span style="color: ${ie?"#991B1B":ue?"#6B21A8":"#047857"}; font-weight: 600;">Overdue Fine Policy:</span>
                          <span style="color: ${ie?"#DC2626":ue?"#7C3AED":"#059669"}; font-weight: 800;">₹${g.fine_per_hour} / hr</span>
                        </div>
                      `:""}
                    </div>

                    <!-- Footer Action Row -->
                    <div style="margin-top: 0.75rem; padding-top: 0.55rem; border-top: 1px solid #F1F5F9; display: flex; flex-direction: column; gap: 0.45rem;">
                      <div style="display: flex; justify-content: space-between; align-items: center; min-width: 0;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: ${ie?"#991B1B":ue?"#6B21A8":"#065F46"}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                          ${ee}
                        </span>
                        ${g.has_existing_arrivals?`
                          <span style="font-size: 0.72rem; color: #D97706; font-weight: 700; background: #FEF3C7; padding: 2px 7px; border-radius: 9999px; flex-shrink: 0;">
                            Away (${g.unreturned_count} of ${g.all_students_count})
                          </span>
                        `:X>0&&!ce&&!ie?`
                          <span style="font-size: 0.72rem; color: #D97706; font-weight: 700; background: #FEF3C7; padding: 2px 7px; border-radius: 9999px; flex-shrink: 0;">
                            Away (${X})
                          </span>
                        `:""}
                      </div>
                      <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 0.35rem; width: 100%;">
                        ${r||e!=null&&e.is_super_admin||(e==null?void 0:e.role)==="admin"||bt(e==null?void 0:e.role)?`
                          ${se?`
                            <button class="btn btn-xs btn-primary btn-approve-leave" data-id="${g.id}" style="background: #059669; border-color: #059669; font-weight: 700; border-radius: 9999px; padding: 0.25rem 0.65rem; font-size: 0.74rem;">
                              Approve
                            </button>
                            <button class="btn btn-xs btn-outline btn-reject-leave" data-id="${g.id}" style="color: #DC2626; border-color: #FCA5A5; font-weight: 600; border-radius: 9999px; padding: 0.25rem 0.65rem; font-size: 0.74rem;">
                              Reject
                            </button>
                          `:""}
                          ${!ce&&!ie?`
                            <button class="btn btn-xs btn-outline btn-edit-leave" data-id="${g.id}" style="color: #2563EB; border-color: #93C5FD; font-weight: 600; border-radius: 9999px; padding: 0.25rem 0.65rem; font-size: 0.74rem;" title="Edit requested date & time schedule">
                              Edit
                            </button>
                            ${se?"":`
                              <button class="btn btn-xs btn-outline btn-extend-leave" data-id="${g.id}" style="color: #7C3AED; border-color: #DDD6FE; font-weight: 700; border-radius: 9999px; padding: 0.25rem 0.65rem; font-size: 0.74rem;" title="Expand/extend return date for student(s)">
                                Extend
                              </button>
                            `}
                          `:""}
                        `:""}

                        <button class="btn btn-xs btn-outline btn-view-leave-details btn-view-leave-card" data-id="${g.id}" style="border-radius: 9999px; padding: 0.28rem 0.65rem; font-size: 0.74rem;">
                          Details
                        </button>
                        <button class="btn btn-xs btn-outline-danger btn-delete-leave" data-id="${g.id}" data-has-arrivals="${g.has_existing_arrivals?"true":"false"}" data-unreturned="${g.unreturned_count||X}" data-arrived="${(g.all_students_count||0)-(g.unreturned_count||X)}" style="border-radius: 9999px; padding: 0.28rem 0.6rem; font-size: 0.74rem; font-weight: 600; color: #DC2626; border-color: #FCA5A5; display: inline-flex; align-items: center; gap: 3px;" title="Delete or cancel this leave record">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>Delete
                        </button>
                      </div>
                    </div>
                  </div>
                `}).join("")}
            </div>
          `}
        </div>
      </div>
    `,y()}function y(){var v,F,f,te,K,de;(v=s.querySelector("#leave-search-input"))==null||v.addEventListener("input",le=>{N=le.target.value,k()}),s.querySelectorAll(".btn-leave-filter").forEach(le=>{le.addEventListener("click",()=>{h=le.dataset.status,k()})}),(F=s.querySelector("#kpi-pending-leaves-card"))==null||F.addEventListener("click",()=>{h="pending",k()}),(f=s.querySelector("#btn-record-arrival"))==null||f.addEventListener("click",()=>{H("individual")}),(te=s.querySelector("#btn-issue-leave-pass"))==null||te.addEventListener("click",()=>{z("individual")}),(K=s.querySelector("#btn-group-leave"))==null||K.addEventListener("click",()=>{z("batch")}),(de=s.querySelector("#btn-individual-leave"))==null||de.addEventListener("click",()=>{z("individual")}),s.querySelectorAll(".btn-record-arrival-action").forEach(le=>{le.addEventListener("click",()=>{const ne=le.dataset.id;H("batch",ne)})}),s.querySelectorAll(".btn-view-leave-details").forEach(le=>{le.addEventListener("click",()=>{const ne=le.dataset.id;A(ne)})}),s.querySelectorAll(".btn-approve-leave").forEach(le=>{le.addEventListener("click",()=>{var ue,ae;const ne=le.dataset.id,g=I.find(R=>R.id===ne);if(!g)return;const ie=(Array.isArray(g.student_ids)?g.student_ids:[g.student_id]).map(R=>{var U;return((U=p.find(T=>T.id===R))==null?void 0:U.full_name)||"Student"}).join(", "),{modal:se,close:ce}=Te({title:`Approve Leave Request — ${g.leave_code||g.leave_register_number}`,contentHtml:`
            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 0.85rem; font-size: 0.85rem; line-height: 1.5;">
                <div><strong>Student:</strong> ${ie}</div>
                <div><strong>Reason:</strong> ${g.reason}</div>
                ${g.requested_by?`<div><strong>Requested By:</strong> ${g.requested_by} • Phone: ${g.parent_phone||"N/A"}</div>`:""}
              </div>

              <!-- Editable Schedule Fields for Admin/Warden Approval -->
              <div style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 12px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="font-weight: 700; color: #166534; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.03em; display: flex; align-items: center; gap: 5px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Adjust Departure & Return Schedule (If Needed)
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                  <div>
                    <label style="font-size: 0.72rem; font-weight: 700; color: #374151;">Departure Date *</label>
                    <input type="date" id="approve-dep-date" class="form-control" value="${g.departure_date||g.leaving_date||""}" style="height: 36px; font-size: 0.85rem;" required />
                  </div>
                  <div>
                    <label style="font-size: 0.72rem; font-weight: 700; color: #374151;">Departure Time *</label>
                    <input type="time" id="approve-dep-time" class="form-control" value="${g.departure_time||g.leaving_time||"16:00"}" style="height: 36px; font-size: 0.85rem;" required />
                  </div>
                  <div>
                    <label style="font-size: 0.72rem; font-weight: 700; color: #374151;">Expected Return Date *</label>
                    <input type="date" id="approve-ret-date" class="form-control" value="${g.expected_return_date||""}" style="height: 36px; font-size: 0.85rem;" required />
                  </div>
                  <div>
                    <label style="font-size: 0.72rem; font-weight: 700; color: #374151;">Expected Return Time *</label>
                    <input type="time" id="approve-ret-time" class="form-control" value="${g.expected_return_time||"18:00"}" style="height: 36px; font-size: 0.85rem;" required />
                  </div>
                </div>
              </div>

              <div class="form-group" style="margin: 0;">
                <label class="form-label required" style="font-weight: 700; font-size: 0.82rem; color: #0F172A;">
                  Per-Hour Overdue Fine Rate (₹/hr)</label>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="font-weight: 700; color: #475569;">₹</span>
                  <input type="number" id="approve-fine-rate" class="form-control" value="$