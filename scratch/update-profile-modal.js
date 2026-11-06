const fs = require('fs');

// 1. UPDATE app.js
let appJs = fs.readFileSync('app.js', 'utf8');

const p1 = appJs.indexOf('  /** Institutional User Profile & Staff Onboarding modal */');
const p2 = appJs.indexOf('  initRouter() {');

if (p1 === -1 || p2 === -1) {
  console.error('Could not find boundaries in app.js');
  process.exit(1);
}

const replacementJs = `  /** Institutional User Profile & Staff Onboarding modal */
  async openMyProfile(opts = {}) {
    const isFirstLogin = opts.isFirstLogin === true;
    const user = authService.currentUser || {};
    let pendingAvatar = null;

    // Load onboarding configuration and staff metadata
    const config = await OnboardingService.getConfig();
    const staffMeta = await OnboardingService.getStaffMeta(user.id);
    const eligibility = await OnboardingService.checkEditEligibility(user);

    // Identity and Display Attributes
    const isSuperAdmin = eligibility.isSuperAdmin;
    const roleDisplayName = user.title || (user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).replace(/_/g, ' ')) : 'Staff Member');
    const authorityBadge = (user.role || 'STAFF').toUpperCase().replace(/_/g, ' ');
    const tgiIdRaw = staffMeta.tgiId || user.staffId || '';
    const staffIdDisplay = tgiIdRaw ? (tgiIdRaw.startsWith('TMS') ? tgiIdRaw : \`TMS-\${tgiIdRaw.replace(/^TGI-?/i, '')}\`) : '';
    const staffIdBadgeText = staffIdDisplay || 'Staff ID: Pending';

    // Phone parsing (extract last 10 digits and format 5-5)
    const rawPhoneDigits = (user.phone || staffMeta.phone || '').replace(/\\D/g, '').slice(-10);
    const initialPhoneFormatted = OnboardingService.formatPhone55(rawPhoneDigits);

    // Blood group
    const initialBloodGroup = staffMeta.bloodGroup || '';
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

    // Questions configured by School Admin (fix any placeholder typos)
    const questions = (config.questions || []).map(q => {
      let ph = q.placeholder || '';
      ph = ph.replace(/Englisl/gi, 'English');
      return { ...q, placeholder: ph };
    });
    const answers = staffMeta.answers || {};

    const canEdit = eligibility.isEligible;

    const bodyHtml = \`
      <div class="inst-profile-modal-body">
        \${isFirstLogin ? \`
        <div class="inst-first-login-banner">
          <div class="inst-first-login-icon">
            <i data-lucide="shield-check"></i>
          </div>
          <div>
            <div class="inst-first-login-title">Initial Staff Onboarding &amp; Profile Setup</div>
            <div class="inst-first-login-desc">
              Welcome to <strong>THAIBA MODEL SCHOOL</strong>. Please review and complete your institutional credentials. You have a <strong>\${eligibility.daysRemaining}-day edit window</strong> from your initial login to update profile data.
            </div>
          </div>
        </div>
        \` : ''}

        <!-- Top Executive Identity Hero Card -->
        <div class="inst-profile-hero-card">
          <div class="inst-avatar-wrapper">
            <img id="pf-avatar" class="inst-avatar-img" src="\${esc(user.avatar || DEFAULT_AVATAR)}" alt="Staff Avatar">
            \${canEdit ? \`
            <label for="pf-avatar-file" class="inst-avatar-camera-btn" title="Change Profile Photograph">
              <i data-lucide="camera"></i>
            </label>
            <input type="file" id="pf-avatar-file" accept="image/*" style="display:none;">
            \` : ''}
          </div>
          <div class="inst-hero-details">
            <div class="inst-hero-header-row">
              <h3 class="inst-hero-name">\${esc(user.name || 'Staff Member')}</h3>
              <div class="inst-hero-badges">
                <span class="inst-badge-role"><i data-lucide="shield-check"></i> \${esc(authorityBadge)}</span>
                <span class="inst-badge-id font-mono">\${esc(staffIdBadgeText)}</span>
              </div>
            </div>
            <div class="inst-hero-email">
              <i data-lucide="mail"></i>
              <span>\${esc(user.email || '—')}</span>
            </div>
            <div class="inst-hero-affiliation">
              <span class="inst-org-pill"><i data-lucide="school"></i> THAIBA MODEL SCHOOL • Enterprise Campus Core</span>
            </div>
          </div>
        </div>

        <!-- Section 1: Core Institutional Credentials -->
        <div class="inst-section-divider">
          <div class="inst-section-title">
            <i data-lucide="user"></i>
            <span>Institutional Credentials &amp; Identity</span>
          </div>
          <div class="inst-section-line"></div>
        </div>

        <div class="inst-form-grid">
          <!-- 1. Full Name -->
          <div class="form-group inst-field-group">
            <label class="form-label inst-label" for="pf-name">Full Name <span class="req-star">*</span></label>
            <input class="form-input inst-input" id="pf-name" value="\${esc(user.name || '')}" placeholder="Enter your full name" \${canEdit ? '' : 'disabled'}>
          </div>

          <!-- 2. Institutional Role (Read-only as assigned by Super Admin) -->
          <div class="form-group inst-field-group">
            <label class="form-label inst-label">Institutional Role <span class="req-star">*</span></label>
            <div class="inst-readonly-box" title="\${esc(roleDisplayName)}">
              <i data-lucide="shield" class="inst-field-icon"></i>
              <span class="inst-readonly-val">\${esc(roleDisplayName)}</span>
              <span class="inst-readonly-badge">Assigned by Admin</span>
            </div>
            <div class="inst-help-text">Read-only role managed by Administration</div>
          </div>

          <!-- 3. Institutional Staff ID (Read-only as allocated by School Admin) -->
          <div class="form-group inst-field-group">
            <label class="form-label inst-label">Institutional Staff ID</label>
            <div class="inst-input-addon-wrap">
              <span class="inst-addon-label font-mono">TMS</span>
              <input type="text" id="pf-tgi-display" class="form-input inst-addon-field font-mono" value="\${esc(staffIdDisplay ? staffIdDisplay.replace(/^TMS-?/i, '') : '')}" placeholder="\${staffIdDisplay ? '' : 'Pending assignment by School Admin'}" readonly>
              <span class="inst-field-lock" title="Allocated by Admin"><i data-lucide="lock"></i></span>
            </div>
            <div class="inst-help-text">Official staff identification number</div>
          </div>

          <!-- 4. Phone Number (Auto-formatted 5-5 digits with fixed +91) -->
          <div class="form-group inst-field-group">
            <label class="form-label inst-label" for="pf-phone">Phone Number <span class="req-star">*</span></label>
            <div class="inst-input-addon-wrap">
              <span class="inst-addon-flag">🇮🇳 +91</span>
              <input type="tel" id="pf-phone" class="form-input inst-addon-field font-mono" maxlength="11" placeholder="98470 55667" value="\${esc(initialPhoneFormatted)}" \${canEdit ? '' : 'disabled'}>
            </div>
            <div class="inst-help-text">Standard 10-digit mobile (formatted 5–5)</div>
          </div>

          <!-- 5. Blood Group -->
          <div class="form-group inst-field-group">
            <label class="form-label inst-label" for="pf-blood-group">Blood Group <span class="req-star">*</span></label>
            <select class="form-select inst-select" id="pf-blood-group" \${canEdit ? '' : 'disabled'}>
              <option value="">— Select Blood Group —</option>
              \${bloodGroups.map(bg => \`<option value="\${bg}" \${initialBloodGroup === bg ? 'selected' : ''}>\${bg}</option>\`).join('')}
            </select>
            <div class="inst-help-text">For campus medical emergency register</div>
          </div>

          <!-- 6. Department / Wing (Read-only) -->
          <div class="form-group inst-field-group">
            <label class="form-label inst-label">Department / Wing</label>
            <div class="inst-readonly-box">
              <i data-lucide="building-2" class="inst-field-icon"></i>
              <span class="inst-readonly-val">\${esc(user.department || 'Campus Operations & Faculty')}</span>
            </div>
            <div class="inst-help-text">Institutional wing or faculty department</div>
          </div>
        </div>

        <!-- Section 2: Dynamic Admin-Configured Onboarding Questions -->
        \${questions.length > 0 ? \`
        <div class="inst-section-divider">
          <div class="inst-section-title">
            <i data-lucide="file-badge"></i>
            <span>Professional &amp; Onboarding Details</span>
          </div>
          <div class="inst-section-line"></div>
        </div>

        <div class="inst-form-grid">
          \${questions.map((q) => {
            const val = answers[q.id] || '';
            const isReq = q.required === true;
            const reqAsterisk = isReq ? '<span class="req-star">*</span>' : '';
            let inputHtml = '';
            if (q.type === 'textarea') {
              inputHtml = \`<textarea class="form-input inst-textarea pf-question-inp" data-qid="\${esc(q.id)}" data-req="\${isReq}" rows="2" placeholder="\${esc(q.placeholder || '')}" \${canEdit ? '' : 'disabled'}>\${esc(val)}</textarea>\`;
            } else if (q.type === 'select') {
              const opts = Array.isArray(q.options) ? q.options : (q.options ? q.options.split(',').map(s => s.trim()) : []);
              inputHtml = \`
                <select class="form-select inst-select pf-question-inp" data-qid="\${esc(q.id)}" data-req="\${isReq}" \${canEdit ? '' : 'disabled'}>
                  <option value="">— Select \${esc(q.label)} —</option>
                  \${opts.map(o => \`<option value="\${esc(o)}" \${val === o ? 'selected' : ''}>\${esc(o)}</option>\`).join('')}
                </select>
              \`;
            } else {
              inputHtml = \`<input type="\${esc(q.type || 'text')}" class="form-input inst-input pf-question-inp" data-qid="\${esc(q.id)}" data-req="\${isReq}" value="\${esc(val)}" placeholder="\${esc(q.placeholder || '')}" \${canEdit ? '' : 'disabled'}>\`;
            }
            return \`
              <div class="form-group inst-field-group \${q.type === 'textarea' ? 'full-width' : ''}">
                <label class="form-label inst-label">\${esc(q.label)} \${reqAsterisk}</label>
                \${inputHtml}
                \${q.subtext ? \`<div class="inst-help-text">\${esc(q.subtext)}</div>\` : ''}
              </div>
            \`;
          }).join('')}
        </div>
        \` : ''}

        <!-- Section 3: Verification & Governance Dashboard -->
        <div class="inst-credential-grid">
          <div class="inst-cred-item">
            <span class="inst-cred-label"><i data-lucide="mail"></i> Registered Email</span>
            <span class="inst-cred-val font-mono">\${esc(user.email || '—')}</span>
          </div>
          <div class="inst-cred-item">
            <span class="inst-cred-label"><i data-lucide="shield"></i> Authority Level</span>
            <span class="inst-cred-val">\${esc(authorityBadge)}</span>
          </div>
          <div class="inst-cred-item">
            <span class="inst-cred-label"><i data-lucide="check-circle-2"></i> Account Status</span>
            <span class="inst-cred-badge badge-active"><span class="badge-dot"></span> Approved &amp; Active</span>
          </div>
          <div class="inst-cred-item">
            <span class="inst-cred-label"><i data-lucide="database"></i> System Verification</span>
            <span class="inst-cred-badge badge-verified"><i data-lucide="check"></i> Verified</span>
          </div>
        </div>

        <!-- Section 4: Grace Period / Editing Policy Banner -->
        \${isSuperAdmin ? \`
        <div class="inst-notice-card notice-admin">
          <i data-lucide="shield-check" class="notice-icon"></i>
          <div>
            <strong>Super Administrator Authority:</strong> Permanent editing, access governance, and profile management permissions active.
          </div>
        </div>
        \` : canEdit ? \`
        <div class="inst-notice-card notice-active">
          <i data-lucide="clock" class="notice-icon"></i>
          <div>
            <strong>Profile Edit Window Active:</strong> You have <strong>\${eligibility.daysRemaining} days remaining</strong> (until \${esc(eligibility.formattedDeadline)}) to review and complete your details.
          </div>
        </div>
        \` : \`
        <div class="inst-notice-card notice-locked">
          <i data-lucide="lock" class="notice-icon"></i>
          <div>
            <strong>Profile Locked:</strong> The self-editing grace window from your initial login has ended. To update details, please contact School Administration.
          </div>
        </div>
        \`}

        <!-- Validation Warning Banner -->
        <div id="pf-validation-warning" class="inst-warning-banner" style="display:none;">
          <i data-lucide="alert-circle" class="warning-icon"></i>
          <span id="pf-validation-text"></span>
        </div>

        <!-- Section 5: Account Security & Password Drawer -->
        <div class="inst-password-section">
          <button type="button" class="btn btn-secondary btn-sm inst-pw-toggle-btn" id="pf-toggle-pw">
            <i data-lucide="key-round"></i>
            <span>Change Account Password</span>
            <i data-lucide="chevron-down" class="toggle-arrow"></i>
          </button>
          <div id="pf-pw-drawer" class="inst-pw-drawer" style="display:none;">
            <div class="inst-pw-drawer-inner">
              <input type="password" class="form-input inst-input" id="pf-new-password" placeholder="Enter new password (min 6 characters)">
              <button class="btn btn-primary" id="pf-change-password">
                <i data-lucide="check"></i>
                <span>Update Password</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    \`;

    const footerHtml = \`
      <div class="inst-modal-footer-wrap">
        <button class="btn btn-secondary inst-btn-cancel" id="pf-cancel">Cancel</button>
        <button class="btn btn-primary inst-btn-save" id="pf-save" \${canEdit ? '' : 'disabled'}>
          <i data-lucide="save"></i>
          <span>Save Institutional Profile</span>
        </button>
      </div>
    \`;

    UIComponents.openModal({ 
      title: '<div style="display:flex;align-items:center;gap:10px;"><i data-lucide="user-cog" style="color:#16a34a;width:22px;height:22px;"></i><span>Institutional User Profile</span></div>', 
      bodyHtml, 
      footerHtml, 
      maxWidth: '740px' 
    });

    // Handle Phone Auto-formatting (5-5 digits)
    const phoneInp = document.getElementById('pf-phone');
    if (phoneInp) {
      phoneInp.addEventListener('input', (e) => {
        const raw = e.target.value.replace(/\\D/g, '').slice(0, 10);
        e.target.value = OnboardingService.formatPhone55(raw);
        validateInputs();
      });
    }

    // Toggle Password Drawer
    const togglePwBtn = document.getElementById('pf-toggle-pw');
    const pwDrawer = document.getElementById('pf-pw-drawer');
    if (togglePwBtn && pwDrawer) {
      togglePwBtn.addEventListener('click', () => {
        const isHidden = pwDrawer.style.display === 'none';
        pwDrawer.style.display = isHidden ? 'block' : 'none';
        const arr = togglePwBtn.querySelector('.toggle-arrow');
        if (arr) arr.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
      });
    }

    // Live Validation Function
    const validateInputs = () => {
      const nameVal = (document.getElementById('pf-name')?.value || '').trim();
      const rawPhone = (document.getElementById('pf-phone')?.value || '').replace(/\\D/g, '');
      const bloodGroupVal = document.getElementById('pf-blood-group')?.value || '';

      const missing = [];
      if (!nameVal) missing.push('Full Name');
      if (rawPhone.length < 10) missing.push(\`10–digit Phone (\${rawPhone.length}/10)\`);
      if (!bloodGroupVal) missing.push('Blood Group');

      // Check required dynamic questions
      document.querySelectorAll('.pf-question-inp').forEach((inp) => {
        if (inp.dataset.req === 'true' && !inp.value.trim()) {
          const label = inp.closest('.form-group')?.querySelector('.form-label')?.innerText?.replace('*', '').trim() || 'Required Onboarding Question';
          if (!missing.includes(label)) missing.push(label);
        }
      });

      const warningBanner = document.getElementById('pf-validation-warning');
      const warningText = document.getElementById('pf-validation-text');
      const saveBtn = document.getElementById('pf-save');

      if (missing.length > 0) {
        if (warningBanner && warningText) {
          warningBanner.style.display = 'flex';
          warningText.innerHTML = \`Please complete required fields before saving: <strong>\${esc(missing.join(', '))}</strong>\`;
        }
        if (saveBtn && canEdit) saveBtn.disabled = true;
        return false;
      } else {
        if (warningBanner) warningBanner.style.display = 'none';
        if (saveBtn && canEdit) saveBtn.disabled = false;
        return true;
      }
    };

    // Attach validation listeners
    document.getElementById('pf-name')?.addEventListener('input', validateInputs);
    document.getElementById('pf-blood-group')?.addEventListener('change', validateInputs);
    document.querySelectorAll('.pf-question-inp').forEach((inp) => {
      inp.addEventListener('input', validateInputs);
      inp.addEventListener('change', validateInputs);
    });

    // Run initial validation check
    validateInputs();

    // Photo file change handler
    const fileInp = document.getElementById('pf-avatar-file');
    if (fileInp) {
      fileInp.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        // Instant local preview
        const reader = new FileReader();
        reader.onload = (re) => {
          const dataUrl = re.target.result;
          pendingAvatar = dataUrl;
          const img = document.getElementById('pf-avatar');
          if (img) img.src = dataUrl;
        };
        reader.readAsDataURL(file);

        // Upload to Supabase Storage
        try {
          const path = \`users/\${user.id}-\${Date.now()}-\${admissionService.sanitizeFileName(file.name)}\`;
          const res = await admissionService.uploadFile('avatars', path, file);
          if (!res.error) {
            const publicUrl = admissionService.getPublicUrl('avatars', res.path);
            if (publicUrl) pendingAvatar = publicUrl;
          }
        } catch (err) {
          console.warn('Storage upload notice:', err.message);
        }

        UIComponents.showToast('Profile photo ready — remember to save profile.', 'success');
      });
    }

    // Cancel modal
    document.getElementById('pf-cancel')?.addEventListener('click', () => UIComponents.closeModal());

    // Password Update Handler
    document.getElementById('pf-change-password')?.addEventListener('click', async () => {
      const pw = (document.getElementById('pf-new-password')?.value || '').trim();
      if (!pw || pw.length < 6) {
        UIComponents.showToast('Password must be at least 6 characters.', 'warning');
        return;
      }
      const r = await authService.changePassword(pw);
      if (r.success) {
        document.getElementById('pf-new-password').value = '';
        if (pwDrawer) pwDrawer.style.display = 'none';
        UIComponents.showToast('Password updated successfully.', 'success');
      } else {
        UIComponents.showToast(\`Could not update password: \${r.error}\`, 'danger');
      }
    });

    // Save Institutional Profile
    document.getElementById('pf-save')?.addEventListener('click', async () => {
      if (!canEdit) {
        UIComponents.showToast('Profile editing period has expired. Please contact school administration.', 'warning');
        return;
      }

      if (!validateInputs()) {
        UIComponents.showToast('Please complete all required fields.', 'warning');
        return;
      }

      const avatarToSave = pendingAvatar || user.avatar || DEFAULT_AVATAR;
      const rawPhone = (document.getElementById('pf-phone')?.value || '').replace(/\\D/g, '').slice(-10);
      const formattedPhone = rawPhone ? \`+91 \${rawPhone}\` : '';
      const nameVal = (document.getElementById('pf-name')?.value || '').trim();
      const bloodGroupVal = document.getElementById('pf-blood-group')?.value || '';

      // Collect answers to dynamic questions
      const questionAnswers = {};
      document.querySelectorAll('.pf-question-inp').forEach((inp) => {
        const qid = inp.dataset.qid;
        if (qid) questionAnswers[qid] = inp.value.trim();
      });

      // 1. Update Core User Profile
      const fields = {
        name: nameVal,
        phone: formattedPhone,
        avatar: avatarToSave
      };

      const r = await authService.updateOwnProfile(fields);
      if (!r.success) {
        UIComponents.showToast(\`Could not save profile: \${r.error}\`, 'danger');
        return;
      }

      // 2. Save Staff Metadata (Blood Group, Dynamic Answers, Mark Onboarding Complete)
      await OnboardingService.saveStaffMeta(user.id, {
        bloodGroup: bloodGroupVal,
        answers: questionAnswers,
        phone: rawPhone,
        onboardingCompleted: true
      });

      // Update sidebar & topbar representations
      const updated = r.user || fields;
      const nameEl = document.getElementById('user-mini-name');
      const avatarEl = document.getElementById('user-mini-avatar');
      const topbarAvatar = document.getElementById('topbar-user-avatar');
      if (nameEl && updated.name) nameEl.innerText = updated.name;
      if (avatarEl && avatarToSave) avatarEl.src = avatarToSave;
      if (topbarAvatar && avatarToSave) topbarAvatar.src = avatarToSave;

      UIComponents.showToast('Institutional Profile updated successfully!', 'success');
      UIComponents.closeModal();
    });

    UIComponents.refreshIcons();
    // Enhance select inside modal if available
    const modalEl = document.querySelector('.modal-content, .inst-profile-modal-body');
    if (modalEl && typeof UIComponents.enhanceAllSelects === 'function') {
      UIComponents.enhanceAllSelects(modalEl);
    }
  }

  `;

appJs = appJs.slice(0, p1) + replacementJs + appJs.slice(p2);
fs.writeFileSync('app.js', appJs, 'utf8');
console.log('app.js successfully updated with Luxury Institutional User Profile modal!');

// 2. APPEND CSS TO app.css
const modalCss = `
/* ==========================================================================
   INSTITUTIONAL USER PROFILE MODAL LUXURY STYLING
   ========================================================================== */

.inst-profile-modal-body {
  font-family: inherit;
  color: #0F172A;
  padding: 4px 0;
}

/* First login welcome banner */
.inst-first-login-banner {
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 20px;
}

.inst-first-login-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #DBEAFE;
  color: #1D4ED8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.inst-first-login-icon svg,
.inst-first-login-icon i {
  width: 20px;
  height: 20px;
}

.inst-first-login-title {
  font-weight: 700;
  color: #1E40AF;
  font-size: 0.94rem;
}

.inst-first-login-desc {
  color: #1E3A8A;
  font-size: 0.82rem;
  margin-top: 3px;
  line-height: 1.45;
}

/* Top Executive Identity Hero Card */
.inst-profile-hero-card {
  background: linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%);
  border: 1.5px solid #E2E8F0;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 22px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
}

.inst-avatar-wrapper {
  position: relative;
  width: 78px;
  height: 78px;
  border-radius: 20px;
  flex-shrink: 0;
}

.inst-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  object-fit: cover;
  border: 2.5px solid #FFFFFF;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
  display: block;
}

.inst-avatar-camera-btn {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #16A34A;
  color: #FFFFFF;
  border: 2px solid #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.15s ease;
}

.inst-avatar-camera-btn:hover {
  background: #0E623B;
  transform: scale(1.08);
}

.inst-avatar-camera-btn svg,
.inst-avatar-camera-btn i {
  width: 13px;
  height: 13px;
}

.inst-hero-details {
  flex: 1;
  min-width: 0;
}

.inst-hero-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.inst-hero-name {
  font-size: 1.3rem;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
  letter-spacing: -0.02em;
}

.inst-hero-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.inst-badge-role {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 9999px;
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  color: #065F46;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.inst-badge-role svg,
.inst-badge-role i {
  width: 12px;
  height: 12px;
}

.inst-badge-id {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 9999px;
  background: #F1F5F9;
  border: 1px solid #CBD5E1;
  color: #1E293B;
  font-size: 0.76rem;
  font-weight: 700;
}

.inst-hero-email {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748B;
  font-size: 0.88rem;
  font-weight: 500;
  margin-top: 5px;
}

.inst-hero-email svg,
.inst-hero-email i {
  width: 14px;
  height: 14px;
  color: #94A3B8;
}

.inst-hero-affiliation {
  margin-top: 7px;
}

.inst-org-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #15803D;
  background: rgba(22, 163, 74, 0.08);
  padding: 3px 10px;
  border-radius: 6px;
}

.inst-org-pill svg,
.inst-org-pill i {
  width: 12px;
  height: 12px;
}

/* Section Dividers */
.inst-section-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 22px 0 16px 0;
}

.inst-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #0F172A;
  white-space: nowrap;
}

.inst-section-title svg,
.inst-section-title i {
  width: 16px;
  height: 16px;
  color: #16A34A;
}

.inst-section-line {
  flex: 1;
  height: 1px;
  background: #E2E8F0;
}

/* Balanced 2-Column Form Grid */
.inst-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 640px) {
  .inst-form-grid {
    grid-template-columns: 1fr;
  }
  .inst-profile-hero-card {
    flex-direction: column;
    align-items: flex-start;
  }
}

.inst-field-group {
  margin: 0 !important;
  display: flex;
  flex-direction: column;
}

.inst-field-group.full-width {
  grid-column: 1 / -1;
}

.inst-label {
  font-weight: 600 !important;
  font-size: 0.84rem !important;
  color: #1E293B !important;
  margin-bottom: 6px !important;
}

.req-star {
  color: #EF4444;
  font-weight: 700;
}

.inst-input {
  border-radius: 12px !important;
  padding: 9px 14px !important;
  font-size: 0.9rem !important;
  border: 1.5px solid #E2E8F0 !important;
  transition: all 0.15s ease !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.inst-input:focus {
  border-color: #10B981 !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
}

.inst-select {
  border-radius: 12px !important;
  padding: 9px 14px !important;
  font-size: 0.9rem !important;
  border: 1.5px solid #E2E8F0 !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.inst-textarea {
  border-radius: 12px !important;
  padding: 9px 14px !important;
  font-size: 0.88rem !important;
  border: 1.5px solid #E2E8F0 !important;
  width: 100% !important;
  box-sizing: border-box !important;
  font-family: inherit !important;
}

/* Readonly fields box */
.inst-readonly-box {
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  padding: 9px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  box-sizing: border-box;
}

.inst-field-icon {
  width: 16px;
  height: 16px;
  color: #64748B;
  flex-shrink: 0;
}

.inst-readonly-val {
  flex: 1;
  font-weight: 600;
  color: #1E293B;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inst-readonly-badge {
  font-size: 0.68rem;
  font-weight: 700;
  color: #64748B;
  background: #E2E8F0;
  padding: 2px 7px;
  border-radius: 6px;
  white-space: nowrap;
}

/* Input Addon Wrap (Phone & TMS ID) */
.inst-input-addon-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  background: #FFFFFF;
  overflow: hidden;
  transition: all 0.15s ease;
  height: 42px;
  box-sizing: border-box;
}

.inst-input-addon-wrap:focus-within {
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.inst-addon-label {
  background: #F1F5F9;
  border-right: 1.5px solid #E2E8F0;
  padding: 0 12px;
  font-weight: 700;
  color: #334155;
  font-size: 0.84rem;
  height: 100%;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.inst-addon-flag {
  background: #F8FAFC;
  border-right: 1.5px solid #E2E8F0;
  padding: 0 12px;
  font-weight: 700;
  color: #1E293B;
  font-size: 0.84rem;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.inst-addon-field {
  flex: 1;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  padding: 0 14px !important;
  height: 100% !important;
  font-size: 0.9rem !important;
  color: #0F172A !important;
  outline: none !important;
  background: transparent !important;
}

.inst-field-lock {
  padding: 0 12px;
  color: #94A3B8;
  display: flex;
  align-items: center;
}

.inst-field-lock svg,
.inst-field-lock i {
  width: 14px;
  height: 14px;
}

.inst-help-text {
  font-size: 0.72rem;
  color: #64748B;
  margin-top: 4px;
  line-height: 1.3;
}

/* Section 3: Verification Credentials Grid */
.inst-credential-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 14px 18px;
  margin-top: 22px;
}

@media (max-width: 640px) {
  .inst-credential-grid {
    grid-template-columns: 1fr;
  }
}

.inst-cred-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.inst-cred-label {
  font-size: 0.73rem;
  font-weight: 600;
  color: #64748B;
  display: flex;
  align-items: center;
  gap: 5px;
}

.inst-cred-label svg,
.inst-cred-label i {
  width: 12px;
  height: 12px;
}

.inst-cred-val {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0F172A;
}

.inst-cred-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.76rem;
  font-weight: 700;
  width: fit-content;
  margin-top: 2px;
}

.inst-cred-badge.badge-active {
  color: #15803D;
}

.inst-cred-badge.badge-active .badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #16A34A;
  display: inline-block;
  animation: badgePulse 2s infinite;
}

.inst-cred-badge.badge-verified {
  color: #2563EB;
}

.inst-cred-badge.badge-verified svg,
.inst-cred-badge.badge-verified i {
  width: 13px;
  height: 13px;
}

/* Notice Banners */
.inst-notice-card {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.82rem;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  line-height: 1.45;
}

.inst-notice-card .notice-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}

.inst-notice-card.notice-admin {
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  color: #1E40AF;
}

.inst-notice-card.notice-admin .notice-icon {
  color: #2563EB;
}

.inst-notice-card.notice-active {
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  color: #166534;
}

.inst-notice-card.notice-active .notice-icon {
  color: #16A34A;
}

.inst-notice-card.notice-locked {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #991B1B;
}

.inst-notice-card.notice-locked .notice-icon {
  color: #DC2626;
}

.inst-warning-banner {
  margin-top: 14px;
  padding: 11px 16px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 12px;
  font-size: 0.82rem;
  color: #991B1B;
  display: flex;
  align-items: center;
  gap: 10px;
}

.inst-warning-banner .warning-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #DC2626;
}

/* Section 5: Password Drawer */
.inst-password-section {
  margin-top: 18px;
  border-top: 1px solid #F1F5F9;
  padding-top: 14px;
}

.inst-pw-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.inst-pw-toggle-btn .toggle-arrow {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.inst-pw-drawer {
  margin-top: 12px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 14px;
}

.inst-pw-drawer-inner {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.inst-pw-drawer-inner .inst-input {
  flex: 1;
  min-width: 220px;
}

/* Modal Actions Footer */
.inst-modal-footer-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}

.inst-btn-cancel {
  border-radius: 12px !important;
  padding: 10px 22px !important;
  font-weight: 600 !important;
  font-size: 0.9rem !important;
}

.inst-btn-save {
  background: linear-gradient(135deg, #10B981, #059669 50%, #0E623B) !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 10px 24px !important;
  font-weight: 700 !important;
  font-size: 0.9rem !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25) !important;
  transition: all 0.15s ease !important;
}

.inst-btn-save:hover:not(:disabled) {
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35) !important;
}
`;

let appCss = fs.readFileSync('app.css', 'utf8');
if (!appCss.includes('INSTITUTIONAL USER PROFILE MODAL LUXURY STYLING')) {
  appCss += '\n\n' + modalCss;
  fs.writeFileSync('app.css', appCss, 'utf8');
  console.log('app.css successfully updated with Luxury Institutional User Profile styling!');
} else {
  console.log('app.css already had modal styles.');
}
