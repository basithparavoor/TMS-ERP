d>
                <tr>
                  <th>Subject</th>
                  <th>Max</th>
                  <th>My Score</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                ${o.map($=>`
                  <tr>
                    <td><strong>${$.subject}</strong></td>
                    <td>${$.max_marks}</td>
                    <td><span style="font-weight: 700; color: #059669;">${$.scored}</span></td>
                    <td><span class="badge badge-active">${$.grade}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>

    <!-- SECTION 2: Hostel Operations -->
    <div class="dash-section-header">
      <div class="dash-section-title-wrap">
        <div class="dash-section-icon">🏢</div>
        <div>
          <h3 class="dash-section-title">Hostel Operations</h3>
          <span style="font-size: 0.76rem; color: #64748B;">Dormitory living, gate passes, curfew safety & announcements</span>
        </div>
      </div>
      <span class="dash-section-badge">Dormitory Life</span>
    </div>

    <!-- Student Noticeboard -->
    <div class="card-panel">
      <div class="card-panel-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span style="font-size: 18px;">📢</span>
          <h3 style="font-size: 1rem; font-weight: 700; color: #0F172A;">Hostel & School Announcements</h3>
        </div>
        <button class="btn btn-outline btn-sm" id="btn-student-view-notices">All Notices</button>
      </div>
      <div class="card-panel-body" style="padding: 1.25rem;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--radius-md); padding: 0.85rem 1rem;">
            <strong style="color: #0F172A; font-size: 0.88rem;">🕌 Maghrib & Night Study Schedule</strong>
            <p style="font-size: 0.8rem; color: #475569; margin-top: 0.2rem;">
              Supervised evening study begins promptly at 07:15 PM in the Study Lab. Bring all textbooks.
            </p>
          </div>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--radius-md); padding: 0.85rem 1rem;">
            <strong style="color: #0F172A; font-size: 0.88rem;">📅 Upcoming Weekend Leave Request Deadline</strong>
            <p style="font-size: 0.8rem; color: #475569; margin-top: 0.2rem;">
              Parents must submit weekend hostel leave requests by Thursday 05:00 PM through the parent portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,s.querySelectorAll(".stat-card[data-route]").forEach($=>{$.addEventListener("click",()=>{const D=$.getAttribute("data-route");D&&t(D)})}),(w=s.querySelector("#btn-student-view-marks"))==null||w.addEventListener("click",()=>t("marks")),(_=s.querySelector("#btn-student-view-notices"))==null||_.addEventListener("click",()=>t("notices"))}async function Gs(s,{onNavigate:t}){const e=je();switch((e==null?void 0:e.role)||"admin"){case"teacher":await ea(s,{onNavigate:t});break;case"mentor":case"boys_mentor":case"girls_mentor":case"hostel_leader":await Ni(s,{onNavigate:t});break;case"parent":await Ws(s,{onNavigate:t});break;case"student":await ta(s,{onNavigate:t});break;case"admin":case"super_admin":default:await Qn(s,{onNavigate:t});break}}let ot=null,Ds="teacher";const Ls=[{key:"admin",label:"Master Admin",subtitle:"Academic & Records Governance",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>'},{key:"teacher",label:"Teacher / Faculty",subtitle:"Timetable, Attendance & Marks",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/></svg>'},{key:"boys_mentor",label:"Boys Hostel Mentor",subtitle:"Boys Hostel Units, Leaves & Coaching Class",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'},{key:"girls_mentor",label:"Girls Hostel Mentor",subtitle:"Girls Hostel Units, Leaves & Coaching Class",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'},{key:"mentor",label:"Hostel Mentor",subtitle:"Hostel Operations, Leaves & Welfare",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'},{key:"hostel_leader",label:"Hostel Leader",subtitle:"Peer Roll-Call & Room Monitoring",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'},{key:"parent",label:"Parents",subtitle:"Ward Academic, Attendance & Fees",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'},{key:"student",label:"Students",subtitle:"Personal Attendance & Study Portal",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>'}],Jt={admin:{color:"#059669",light:"#ECFDF5",border:"#A7F3D0",badgeBg:"#D1FAE5",badgeColor:"#065F46"},teacher:{color:"#2563EB",light:"#EFF6FF",border:"#BFDBFE",badgeBg:"#DBEAFE",badgeColor:"#1E40AF"},boys_mentor:{color:"#0284C7",light:"#F0F9FF",border:"#BAE6FD",badgeBg:"#E0F2FE",badgeColor:"#0369A1"},girls_mentor:{color:"#DB2777",light:"#FDF2F8",border:"#FBCFE8",badgeBg:"#FCE7F3",badgeColor:"#9D174D"},mentor:{color:"#7C3AED",light:"#F5F3FF",border:"#DDD6FE",badgeBg:"#EDE9FE",badgeColor:"#5B21B6"},hostel_leader:{color:"#D97706",light:"#FFFBEB",border:"#FDE68A",badgeBg:"#FEF3C7",badgeColor:"#92400E"},parent:{color:"#E11D48",light:"#FFF1F2",border:"#FECDD3",badgeBg:"#FFE4E6",badgeColor:"#9F1239"},student:{color:"#0891B2",light:"#ECFEFF",border:"#A5F3FC",badgeBg:"#CFFAFE",badgeColor:"#155E75"}},Zt=[{title:"Student & Academic Windows",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',modules:[{key:"timetable",label:"Teacher Timetable",desc:"View assigned class schedules and coaching periods",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'},{key:"attendance",label:"Attendance Management",desc:"Daily classroom roll-call, coaching & teacher duty register",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'},{key:"exams",label:"Exam Management",desc:"Examination dates, syllabi, seating arrangements & timings",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'},{key:"marks",label:"Marks & Results",desc:"Enter subject marks, grade calculation and official report cards",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>'},{key:"admissions",label:"Student Admissions",desc:"Process new student admission forms, parents data & documents",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y1="11"/></svg>'},{key:"students",label:"Student Directory",desc:"Browse complete student directory, guardian contacts & history",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'},{key:"sections",label:"Sections & Classrooms",desc:"Manage classrooms, standards, and batch divisions",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="