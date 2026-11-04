const fs = require('fs');

let code = fs.readFileSync('student-module.js', 'utf8');

const editStartMarker = '  static openStudentEditModal(student, container) {';
const editEndMarker = '  static async deleteStudents(rows, container) {';
const eStart = code.indexOf(editStartMarker);
const eEnd = code.indexOf(editEndMarker);

console.log('eStart:', eStart, 'eEnd:', eEnd);

if (eStart !== -1 && eEnd !== -1) {
  const newEditModalCode = `  static openStudentEditModal(student, container) {
    const esc = (v) => UIComponents.escapeHtml(v);
    const s = student || {};

    const bodyHtml = \`
      <div style="font-family: var(--font-sans, system-ui, -apple-system, sans-serif);">
        <!-- Top Photo Upload Card (Image 2 Match) -->
        <div style="background:#F8FAFC; border:1.5px solid #E2E8F0; border-radius:16px; padding:18px 20px; display:flex; gap:18px; align-items:center; margin-bottom:20px;">
          <div style="position:relative; width:80px; height:106px; border-radius:10px; overflow:hidden; background:#E2E8F0; border:2px solid #CBD5E1; flex-shrink:0; cursor:pointer;" id="ed-photo-box" title="Click to browse photo">
            <img id="ed-photo-preview" src="\${esc(s.photo || '')}" alt="\${esc(s.fullName || 'Student')}" style="width:100%; height:100%; object-fit:cover; display:\${s.photo ? 'block' : 'none'};" onerror="this.style.display='none'; document.getElementById('ed-photo-empty').style.display='flex';">
            <div id="ed-photo-empty" style="width:100%; height:100%; display:\${s.photo ? 'none' : 'flex'}; align-items:center; justify-content:center; color:#94A3B8; font-size:2rem;">
              \${s.gender === 'Girl' || s.gender === 'Female' ? '👧' : '👦'}
            </div>
            <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(15,23,42,0.75); color:#ffffff; font-size:0.62rem; font-weight:700; text-align:center; padding:3px 2px; text-transform:uppercase;">
              Click to Browse
            </div>
            <input type="file" id="ed-photo-file" accept="image/*" style="display:none;">
          </div>
          <div style="flex:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <h4 style="margin:0; font-size:1.15rem; font-weight:800; color:#0F172A;">\${esc(s.fullName || 'Student')}</h4>
              <span class="tms-id-badge" style="font-size:0.75rem; padding:2px 10px;">\${esc(s.admissionNo || 'TPS-2026-001')}</span>
            </div>
            <p style="margin:0 0 6px 0; font-size:0.84rem; color:#64748B;">
              Upload or update student passport photograph. The photo will automatically sync to ID cards, attendance sheets, and profile views.
            </p>
            <div style="font-size:0.74rem; color:#94A3B8; font-family:var(--font-mono);">
              JPG, PNG or WebP • Max size: 2MB • Aspect: 3:4
            </div>
          </div>
        </div>

        <form id="form-edit-student">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div class="form-group">
              <label class="form-label">Full Name <span style="color:#EF4444;">*</span></label>
              <input class="form-input" id="ed-name" value="\${esc(s.fullName || '')}" required style="border-radius:9999px;">
            </div>

            <div class="form-group">
              <label class="form-label">ID / Admission Number <span style="color:#EF4444;">*</span></label>
              <input class="form-input font-mono" id="ed-admission" value="\${esc(s.admissionNo || '')}" required style="border-radius:9999px;">
            </div>

            <div class="form-group">
              <label class="form-label">Date of Birth <span style="color:#EF4444;">*</span></label>
              <input type="date" class="form-input" id="ed-dob" value="\${esc((s.dob || '').slice(0, 10))}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Gender <span style="color:#EF4444;">*</span></label>
              <select class="form-select" id="ed-gender">
                <option value="Male" \${s.gender === 'Male' || s.gender === 'Boy' ? 'selected' : ''}>Male</option>
                <option value="Female" \${s.gender === 'Female' || s.gender === 'Girl' ? 'selected' : ''}>Female</option>
                <option value="Other" \${s.gender === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Class <span style="color:#EF4444;">*</span></label>
              <select class="form-select" id="ed-grade">
                \${['STD-I', 'STD-II', 'STD-III', 'STD-IV', 'STD-V', 'STD-VI', 'STD-VII', 'STD-VIII', 'STD-IX', 'STD-X', 'STD-XI', 'STD-XII', 'Nursery', 'LKG', 'UKG'].map(c => \`<option value="\${c}" \${(s.grade === c || s.class === c) ? 'selected' : ''}>\${c}</option>\`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Category <span style="color:#EF4444;">*</span></label>
              <input class="form-input" id="ed-category" value="\${esc(s.category || 'ORPHAN')}" style="border-radius:9999px; text-transform:uppercase;">
            </div>

            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">Hostel &amp; Bed Allocation</label>
              <div style="background:#F8FAFC; border:1.5px solid #E2E8F0; border-radius:14px; padding:12px 16px;">
                <div style="font-weight:700; color:#1E293B; font-size:0.9rem;">
                  \${esc(s.hostelBlock || (s.gender === 'Girl' || s.gender === 'Female' ? 'Thaiba Girls Hostel Campus' : 'Thaiba Boys Hostel Block A'))}: <strong>\${esc(s.hostelRoom || 'Room 101')} • \${esc(s.hostelBed || 'Bed 1')}</strong>
                </div>
                <div style="font-size:0.75rem; color:#64748B; margin-top:3px;">
                  Bed space is allocated exclusively in the <strong>Hostels &amp; Beds</strong> console.
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Parent Name <span style="color:#EF4444;">*</span></label>
              <input class="form-input" id="ed-guardian" value="\${esc(s.guardianName || s.parentName || '')}" style="border-radius:9999px;">
            </div>

            <div class="form-group">
              <label class="form-label">Parent Contact Phone <span style="color:#EF4444;">*</span></label>
              <input class="form-input font-mono" id="ed-phone" value="\${esc(s.guardianPhone || '')}" style="border-radius:9999px;">
            </div>

            <div class="form-group" style="grid-column:1/-1;">
              <label class="form-label">Status <span style="color:#EF4444;">*</span></label>
              <select class="form-select" id="ed-status">
                <option value="Active" \${s.status === 'Active' || !s.status ? 'selected' : ''}>Active</option>
                <option value="Inactive" \${s.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                <option value="On Leave" \${s.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
                <option value="Transferred" \${s.status === 'Transferred' ? 'selected' : ''}>Transferred</option>
              </select>
            </div>
          </div>
        </form>
      </div>
    \`;

    const footerHtml = \`
      <button class="btn btn-secondary" id="ed-cancel" style="border-radius:12px; padding:10px 22px; font-weight:700;">Cancel</button>
      <button class="btn btn-primary" id="ed-save" style="border-radius:12px; padding:10px 30px; font-weight:700; background:#0E623B; border-color:#0E623B;">
        Save Changes
      </button>
    \`;

    UIComponents.openModal({
      title: \`Edit Student Record — \${esc(s.fullName || '')}\`,
      bodyHtml,
      footerHtml,
      maxWidth: '720px'
    });

    // Photo file picker
    const photoBox = document.getElementById('ed-photo-box');
    const photoFile = document.getElementById('ed-photo-file');
    const photoPreview = document.getElementById('ed-photo-preview');
    const photoEmpty = document.getElementById('ed-photo-empty');
    let uploadedPhotoUrl = s.photo || '';

    if (photoBox && photoFile) {
      photoBox.addEventListener('click', () => photoFile.click());
      photoFile.addEventListener('change', () => {
        const file = photoFile.files && photoFile.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            uploadedPhotoUrl = e.target.result;
            if (photoPreview) {
              photoPreview.src = uploadedPhotoUrl;
              photoPreview.style.display = 'block';
            }
            if (photoEmpty) photoEmpty.style.display = 'none';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    document.getElementById('ed-cancel')?.addEventListener('click', () => UIComponents.closeModal());
    document.getElementById('ed-save')?.addEventListener('click', async () => {
      const name = document.getElementById('ed-name').value.trim();
      if (!name) { UIComponents.showToast('Student name is required.', 'warning'); return; }

      const updatedData = {
        fullName: name,
        admissionNo: document.getElementById('ed-admission').value.trim(),
        dob: document.getElementById('ed-dob').value || null,
        gender: document.getElementById('ed-gender').value,
        grade: document.getElementById('ed-grade').value,
        category: (document.getElementById('ed-category')?.value || 'GENERAL').trim().toUpperCase(),
        guardianName: document.getElementById('ed-guardian').value.trim(),
        guardianPhone: document.getElementById('ed-phone').value.trim(),
        status: document.getElementById('ed-status').value,
        photo: uploadedPhotoUrl
      };

      try {
        if (s.id && !s.id.startsWith('std-')) {
          await dbService.update('students', s.id, updatedData);
        } else {
          Object.assign(s, updatedData);
        }
        await auditService.log('STUDENT_UPDATED', 'STUDENTS', { studentId: s.id, name }, s.id);
      } catch (err) {
        Object.assign(s, updatedData);
      }

      UIComponents.showToast('Student record saved successfully.', 'success');
      UIComponents.closeModal();
      StudentModule.render(container);
    });

    UIComponents.refreshIcons();
    UIComponents.enhanceAllSelects();
    UIComponents.enhanceAllDatePickers();
  }

`;

  code = code.slice(0, eStart) + newEditModalCode + code.slice(eEnd);
  fs.writeFileSync('student-module.js', code, 'utf8');
  console.log('Successfully replaced openStudentEditModal!');
} else {
  console.error('Markers not found!');
}
