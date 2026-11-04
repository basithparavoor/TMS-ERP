const fs = require('fs');

// 1. Update admin-module.js
let adminJs = fs.readFileSync('admin-module.js', 'utf8');

// Add import for institutionService
if (!adminJs.includes("import { institutionService } from './institution-service.js';")) {
  adminJs = adminJs.replace(
    "import { brandingService } from './branding-service.js';",
    "import { brandingService } from './branding-service.js';\nimport { institutionService } from './institution-service.js';"
  );
}

// Update SUBTABS.system: add institution-details as first subtab
const oldSystemTabs = `      system: [
        { key: 'branding', label: 'Institute Logo & Emblem', icon: 'image' },
        { key: 'backup', label: 'JSON Disaster Recovery', icon: 'database' }
      ]`;

const newSystemTabs = `      system: [
        { key: 'institution-details', label: 'Institution Profile & Campus Status', icon: 'building-2' },
        { key: 'branding', label: 'Institute Logo & Emblem', icon: 'image' },
        { key: 'backup', label: 'JSON Disaster Recovery', icon: 'database' }
      ]`;

if (adminJs.includes(oldSystemTabs)) {
  adminJs = adminJs.replace(oldSystemTabs, newSystemTabs);
} else {
  // Regex fallback
  adminJs = adminJs.replace(/system:\s*\[\s*\{\s*key:\s*'branding'/, `system: [
        { key: 'institution-details', label: 'Institution Profile & Campus Status', icon: 'building-2' },
        { key: 'branding'`);
}

// Update SUBTABS.superadmin: add institution-details
if (!adminJs.includes("'institution-details', label: '🏫 Institution Profile")) {
  adminJs = adminJs.replace(
    "{ key: 'staff-onboarding', label: '👥 Staff Onboarding & Governance', icon: 'user-cog' },",
    "{ key: 'staff-onboarding', label: '👥 Staff Onboarding & Governance', icon: 'user-cog' },\n        { key: 'institution-details', label: '🏫 Institution Profile & Campus Status', icon: 'building-2' },"
  );
}

// Add route in renderTab
const tabRouteTarget = "else if (tabKey === 'branding') await this.renderBrandingTab(tabContent);";
const tabRouteReplacement = "else if (tabKey === 'institution-details') await this.renderInstitutionDetailsTab(tabContent);\n      else if (tabKey === 'branding') await this.renderBrandingTab(tabContent);";

if (adminJs.includes(tabRouteTarget) && !adminJs.includes("tabKey === 'institution-details'")) {
  adminJs = adminJs.replace(tabRouteTarget, tabRouteReplacement);
}

// Add renderInstitutionDetailsTab implementation right before renderBrandingTab
const renderMethod = `  /**
   * Institution Profile & Campus Status Tab
   * Editable institutional registration, trust body, campus location, support contacts,
   * and Head of Institution (replaces Super Administrator).
   */
  static async renderInstitutionDetailsTab(tabContent) {
    const details = await institutionService.refresh();

    tabContent.innerHTML = \`
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header" style="flex-wrap: wrap; gap: 12px; justify-content: space-between; align-items: center;">
          <div>
            <h3 class="card-title" style="display: flex; align-items: center; gap: 8px;">
              <i data-lucide="building-2" style="color: #16a34a;"></i> Institution Profile &amp; Campus Status
            </h3>
            <p class="card-desc">
              Manage official campus registration, trust authority, physical location, institutional support contacts, and Head of Institution. Values saved here are applied everywhere across all school portals, website CMS, documents, admission forms, and fee receipts.
            </p>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" id="btn-reset-inst-defaults" style="color: #64748b;">
              <i data-lucide="rotate-ccw"></i> Reset Defaults
            </button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: minmax(320px, 460px) 1fr; gap: 24px; align-items: start; margin-top: 14px;">
          <!-- Left Column: Live Status Card Preview (Matching User Screenshot) -->
          <div>
            <div style="font-weight: 700; font-size: 0.82rem; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
              <i data-lucide="eye" style="width: 15px; height: 15px; color: #2563eb;"></i> Live Campus Status Card
            </div>
            <div id="inst-card-preview-container">
              \${institutionService.renderStatusCardHtml(details)}
            </div>
            <div style="font-size: 0.76rem; color: #64748b; margin-top: 12px; line-height: 1.4; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 10px 14px;">
              ℹ️ <strong>Universal Campus Presence:</strong> This card reflects real-time institutional accreditation. Any edits made on the right update this live preview immediately.
            </div>
          </div>

          <!-- Right Column: Institutional Profile Form -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px;">
            <h4 style="margin: 0 0 16px 0; font-size: 1rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="edit-3" style="color: #2563eb; width: 18px; height: 18px;"></i> Edit Institutional Campus Details
            </h4>

            <div style="display: grid; grid-template-columns: 1fr; gap: 14px;">
              <!-- 1. Official Registration & Trust -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div class="form-group" style="margin: 0;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.82rem;">Official Registration No. *</label>
                  <input type="text" class="form-input inst-inp" id="inst-reg-no" value="\${esc(details.regNo || '')}" placeholder="e.g. Regd. No. IV 01894/2011" style="border-radius: 8px;">
                </div>
                <div class="form-group" style="margin: 0;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.82rem;">Parent Trust / Society *</label>
                  <input type="text" class="form-input inst-inp" id="inst-trust" value="\${esc(details.trust || '')}" placeholder="e.g. Thaiba Heritage, Kolkata" style="border-radius: 8px;">
                </div>
              </div>

              <!-- 2. Campus Location & District -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div class="form-group" style="margin: 0;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.82rem;">Campus District / Badge *</label>
                  <input type="text" class="form-input inst-inp" id="inst-district" value="\${esc(details.campusDistrict || '')}" placeholder="e.g. Dakshin Dinajpur" style="border-radius: 8px;">
                  <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">Shown in the blue header pill badge</div>
                </div>
                <div class="form-group" style="margin: 0;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.82rem;">Institution Full Name *</label>
                  <input type="text" class="form-input inst-inp" id="inst-name" value="\${esc(details.name || '')}" placeholder="e.g. THAIBA MODEL SCHOOL" style="border-radius: 8px;">
                </div>
              </div>

              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-weight: 600; font-size: 0.82rem;">Full Campus Physical Location *</label>
                <textarea class="form-input inst-inp" id="inst-location" rows="2" placeholder="e.g. Baghait, Tapan, Dakshin Dinajpur, West Bengal 733127" style="border-radius: 8px;">\${esc(details.campusLocation || '')}</textarea>
              </div>

              <!-- 3. Contact & Support -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div class="form-group" style="margin: 0;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.82rem;">Institutional Helpline Phones *</label>
                  <input type="text" class="form-input inst-inp" id="inst-phones" value="\${esc(details.contactPhones || '')}" placeholder="e.g. +91 8653382851 / +91 8167782851" style="border-radius: 8px;">
                </div>
                <div class="form-group" style="margin: 0;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.82rem;">Institutional Support Email *</label>
                  <input type="email" class="form-input inst-inp" id="inst-email" value="\${esc(details.contactEmail || '')}" placeholder="e.g. tms@thaibagarden.com" style="border-radius: 8px;">
                </div>
              </div>

              <!-- 4. Head Of Institution (No Super Administrator per prompt) -->
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-top: 4px;">
                <div style="font-weight: 700; font-size: 0.86rem; color: #9333ea; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                  <i data-lucide="user-check" style="width: 16px; height: 16px;"></i> Head Of Institution Authority
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                  <div class="form-group" style="margin: 0;">
                    <label class="form-label" style="font-weight: 600; font-size: 0.82rem;">Head Of Institution Name *</label>
                    <input type="text" class="form-input inst-inp" id="inst-head-name" value="\${esc(details.headOfInstitutionName || '')}" placeholder="e.g. C. M. Basith" style="border-radius: 8px;">
                  </div>
                  <div class="form-group" style="margin: 0;">
                    <label class="form-label" style="font-weight: 600; font-size: 0.82rem;">Head Of Institution Email / Contact</label>
                    <input type="text" class="form-input inst-inp" id="inst-head-email" value="\${esc(details.headOfInstitutionEmail || '')}" placeholder="e.g. cmbasith786@gmail.com" style="border-radius: 8px;">
                  </div>
                </div>
              </div>

              <!-- 5. Website URL & Tagline -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div class="form-group" style="margin: 0;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.82rem;">Official Website URL</label>
                  <input type="url" class="form-input inst-inp" id="inst-website" value="\${esc(details.website || '')}" placeholder="e.g. https://www.thaibagarden.com" style="border-radius: 8px;">
                </div>
                <div class="form-group" style="margin: 0;">
                  <label class="form-label" style="font-weight: 600; font-size: 0.82rem;">Tagline / Caption</label>
                  <input type="text" class="form-input inst-inp" id="inst-tagline" value="\${esc(details.tagline || '')}" placeholder="e.g. Run by : Thaiba Heritage, Kolkata" style="border-radius: 8px;">
                </div>
              </div>

              <!-- Save Action -->
              <div style="margin-top: 10px; display: flex; justify-content: flex-end; gap: 10px;">
                <button class="btn btn-primary" id="btn-save-inst-details" style="background: #16a34a; border-color: #16a34a; padding: 10px 22px; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                  <i data-lucide="save"></i> Save Institutional Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    \`;

    // Live Card Preview Handler
    const updatePreview = () => {
      const liveData = {
        name: document.getElementById('inst-name')?.value.trim() || details.name,
        regNo: document.getElementById('inst-reg-no')?.value.trim() || details.regNo,
        trust: document.getElementById('inst-trust')?.value.trim() || details.trust,
        campusDistrict: document.getElementById('inst-district')?.value.trim() || details.campusDistrict,
        campusLocation: document.getElementById('inst-location')?.value.trim() || details.campusLocation,
        contactPhones: document.getElementById('inst-phones')?.value.trim() || details.contactPhones,
        contactEmail: document.getElementById('inst-email')?.value.trim() || details.contactEmail,
        headOfInstitutionName: document.getElementById('inst-head-name')?.value.trim() || details.headOfInstitutionName,
        headOfInstitutionEmail: document.getElementById('inst-head-email')?.value.trim() || details.headOfInstitutionEmail,
        website: document.getElementById('inst-website')?.value.trim() || details.website,
        tagline: document.getElementById('inst-tagline')?.value.trim() || details.tagline
      };

      const container = document.getElementById('inst-card-preview-container');
      if (container) {
        container.innerHTML = institutionService.renderStatusCardHtml(liveData);
        UIComponents.refreshIcons();
      }
    };

    tabContent.querySelectorAll('.inst-inp').forEach(inp => {
      inp.addEventListener('input', updatePreview);
    });

    // Save Button Handler
    safeOn('btn-save-inst-details', 'click', async () => {
      const regNo = (document.getElementById('inst-reg-no')?.value || '').trim();
      const trust = (document.getElementById('inst-trust')?.value || '').trim();
      const campusDistrict = (document.getElementById('inst-district')?.value || '').trim();
      const campusLocation = (document.getElementById('inst-location')?.value || '').trim();
      const contactPhones = (document.getElementById('inst-phones')?.value || '').trim();
      const contactEmail = (document.getElementById('inst-email')?.value || '').trim();
      const headOfInstitutionName = (document.getElementById('inst-head-name')?.value || '').trim();
      const headOfInstitutionEmail = (document.getElementById('inst-head-email')?.value || '').trim();
      const name = (document.getElementById('inst-name')?.value || '').trim();
      const website = (document.getElementById('inst-website')?.value || '').trim();
      const tagline = (document.getElementById('inst-tagline')?.value || '').trim();

      if (!name || !regNo || !trust) {
        UIComponents.showToast('Please fill in Institution Name, Registration No., and Parent Trust.', 'warning');
        return;
      }

      const payload = {
        name,
        regNo,
        trust,
        campusDistrict: campusDistrict || 'Dakshin Dinajpur',
        campusLocation: campusLocation || 'Baghait, Tapan, Dakshin Dinajpur, West Bengal 733127',
        contactPhones: contactPhones || '+91 8653382851 / +91 8167782851',
        contactEmail: contactEmail || 'tms@thaibagarden.com',
        headOfInstitutionName: headOfInstitutionName || 'C. M. Basith',
        headOfInstitutionEmail: headOfInstitutionEmail || 'cmbasith786@gmail.com',
        website,
        tagline
      };

      const saveBtn = document.getElementById('btn-save-inst-details');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Saving...';
      }

      await institutionService.saveDetails(payload);
      await auditService.log('INSTITUTION_DETAILS_UPDATED', 'GOVERNANCE', payload);

      UIComponents.showToast('Institutional Details updated successfully & applied campus-wide!', 'success');
      this.renderTab('institution-details');
    });

    // Reset Defaults Handler
    safeOn('btn-reset-inst-defaults', 'click', async () => {
      if (!confirm('Reset all institutional campus details back to standard defaults?')) return;
      await institutionService.resetToDefaults();
      await auditService.log('INSTITUTION_DETAILS_RESET', 'GOVERNANCE', {});
      UIComponents.showToast('Institutional details reset to standard defaults.', 'info');
      this.renderTab('institution-details');
    });

    UIComponents.refreshIcons();
  }

`;

if (!adminJs.includes('renderInstitutionDetailsTab(')) {
  adminJs = adminJs.replace('  static async renderBrandingTab(tabContent) {', renderMethod + '  static async renderBrandingTab(tabContent) {');
}

fs.writeFileSync('admin-module.js', adminJs, 'utf8');
console.log('admin-module.js updated successfully!');
