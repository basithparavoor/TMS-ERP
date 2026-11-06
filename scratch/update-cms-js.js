const fs = require('fs');

let code = fs.readFileSync('admin-website-cms.js', 'utf8');

// 1. Replace the CMS Header
const oldHeaderSnippet = `    tabContent.innerHTML = \`
      <div class="card" style="padding: 0; overflow: hidden; margin-bottom: 24px; border: 1.5px solid var(--border-color);">
        <!-- CMS Action Header -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(22, 163, 74, 0.25); border: 1px solid rgba(22, 163, 74, 0.5); display: flex; align-items: center; justify-content: center; color: #4ade80;">
              <i data-lucide="globe" style="width: 24px; height: 24px;"></i>
            </div>
            <div>
              <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: #ffffff; margin: 0; line-height: 1.2;">
                Institutional Website CMS &amp; Live Customizer
              </h3>
              <p style="font-size: 0.82rem; color: #94a3b8; margin: 2px 0 0;">
                Fully customize all content, hero headlines, programs, facilities, notices, colors &amp; branding in real-time.
              </p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <a href="/" target="_blank" class="btn btn-secondary btn-sm" style="background: rgba(255,255,255,0.12); color: #fff; border: 1px solid rgba(255,255,255,0.25); display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; text-decoration: none; font-weight: 700;">
              <i data-lucide="external-link" style="width: 15px; height: 15px; color: #4ade80;"></i>
              <span>Preview Live Website</span>
            </a>

            <button class="btn btn-primary btn-sm" id="btn-cms-save-all" style="background: #16a34a; border-color: #15803d; font-weight: 800; padding: 8px 18px; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.4);">
              <i data-lucide="save" style="width: 15px; height: 15px;"></i>
              <span>Save &amp; Publish Website</span>
            </button>

            <button class="btn btn-secondary btn-sm" id="btn-cms-reset-factory" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #fca5a5;" title="Reset all content to school factory defaults">
              <i data-lucide="rotate-ccw" style="width: 14px; height: 14px;"></i>
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        <!-- CMS Sub-Body -->
        <div style="padding: 24px;" id="cms-subtab-container">
          <!-- Injected by specific subtab renderer -->
        </div>
      </div>
    \`;`;

const newHeaderSnippet = `    tabContent.innerHTML = \`
      <div class="card tms-cms-card" style="padding: 0; overflow: hidden; margin-bottom: 24px;">
        <!-- CMS Action Header (Light Theme) -->
        <div class="tms-cms-header">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div class="tms-cms-icon-box">
              <i data-lucide="globe" style="width: 24px; height: 24px;"></i>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <h3 class="tms-cms-title">
                  Institutional Website CMS &amp; Live Customizer
                </h3>
                <span class="badge" style="font-size: 0.72rem; font-weight: 700; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 3px 9px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 5px; text-transform: uppercase; letter-spacing: 0.04em;">
                  <span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>
                  Live Editor
                </span>
              </div>
              <p class="tms-cms-subtitle">
                Fully customize all content, hero headlines, programs, facilities, notices, colors &amp; branding in real-time.
              </p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <a href="/" target="_blank" class="tms-btn-cms-preview">
              <i data-lucide="external-link" style="width: 15px; height: 15px; color: #059669;"></i>
              <span>Preview Live Website</span>
            </a>

            <button class="tms-btn-cms-publish" id="btn-cms-save-all">
              <i data-lucide="save" style="width: 16px; height: 16px;"></i>
              <span>Save &amp; Publish Website</span>
            </button>

            <button class="tms-btn-cms-reset" id="btn-cms-reset-factory" title="Reset all content to school factory defaults">
              <i data-lucide="rotate-ccw" style="width: 14px; height: 14px;"></i>
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        <!-- CMS Sub-Body -->
        <div style="padding: 24px; background: #ffffff;" id="cms-subtab-container">
          <!-- Injected by specific subtab renderer -->
        </div>
      </div>
    \`;`;

// 2. Replace the Hostel Control Banner
const oldHostelSnippet = `      <!-- TOP CONTROL & MASTER TOGGLE BANNER -->
      <div class="card" style="margin-bottom: 24px; border: 2px solid \${isLive ? 'var(--brand-theme-primary, #16a34a)' : '#cbd5e1'}; background: \${isLive ? 'linear-gradient(135deg, rgba(22, 163, 74, 0.06), rgba(15, 23, 42, 0.02))' : '#f8fafc'}; padding: 22px 24px; border-radius: 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 50px; height: 50px; border-radius: 14px; background: \${isLive ? '#dcfce7' : '#f1f5f9'}; border: 1.5px solid \${isLive ? '#86efac' : '#cbd5e1'}; display: flex; align-items: center; justify-content: center; color: \${isLive ? '#15803d' : '#64748b'};">
              <i data-lucide="home" style="width: 26px; height: 26px;"></i>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--text-main); margin: 0;">
                  Hostel Managing Setup &amp; Public Portal
                </h3>
                <span id="hostel-live-badge" class="badge" style="font-size: 0.8rem; padding: 4px 10px; font-weight: 700; \${isLive ? 'background:#dcfce7; color:#15803d; border:1px solid #86efac;' : 'background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1;'}">
                  \${isLive ? '● LIVE: Hostel Button Active' : '○ DISABLED: Hostel Button Hidden'}
                </span>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">
                If Admin turns this ON, the school website enables the <strong>"Hostel"</strong> button on the navbar and activates the <strong>#hostel</strong> showcase &amp; admission inquiry.
              </p>
            </div>
          </div>

          <!-- The Master Toggle Switch -->
          <div style="display: flex; align-items: center; gap: 14px; background: #ffffff; padding: 10px 18px; border-radius: 12px; border: 1.5px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <div style="text-align: right;">
              <div style="font-size: 0.88rem; font-weight: 800; color: var(--text-main);">Have a Hostel Button</div>
              <div style="font-size: 0.74rem; color: var(--text-muted);" id="hostel-switch-status">\${isLive ? 'Turned ON (Visible on Website)' : 'Turned OFF (Hidden)'}</div>
            </div>
            <label class="switch" style="position:relative; display:inline-block; width:52px; height:28px; flex-shrink:0;">
              <input type="checkbox" id="hostel-master-toggle" \${isLive ? 'checked' : ''}>
              <span class="slider round" style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:\${isLive ? '#16a34a' : '#cbd5e1'}; transition:.3s; border-radius:28px;"></span>
            </label>
            <a href="/#hostel" target="_blank" class="btn btn-secondary btn-sm" style="display:inline-flex; align-items:center; gap:6px; font-weight:700;">
              <i data-lucide="external-link" style="width:14px; height:14px;"></i>
              <span>Test #hostel</span>
            </a>
          </div>
        </div>
      </div>`;

const newHostelSnippet = `      <!-- TOP CONTROL & MASTER TOGGLE BANNER (Light Theme) -->
      <div class="card tms-hostel-banner-card" style="margin-bottom: 24px; border: 1.5px solid \${isLive ? '#bbf7d0' : '#e2e8f0'}; background: \${isLive ? 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)' : '#ffffff'}; padding: 22px 24px; border-radius: 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 48px; height: 48px; border-radius: 13px; background: \${isLive ? '#ecfdf5' : '#f8fafc'}; border: 1.5px solid \${isLive ? '#a7f3d0' : '#e2e8f0'}; display: flex; align-items: center; justify-content: center; color: \${isLive ? '#059669' : '#64748b'}; box-shadow: 0 2px 6px rgba(0,0,0,0.03); flex-shrink: 0;">
              <i data-lucide="home" style="width: 24px; height: 24px;"></i>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px; flex-wrap: wrap;">
                <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0;">
                  Hostel Managing Setup &amp; Public Portal
                </h3>
                <span id="hostel-live-badge" class="badge" style="font-size: 0.78rem; padding: 4px 11px; font-weight: 700; border-radius: 9999px; \${isLive ? 'background:#dcfce7; color:#15803d; border:1px solid #86efac;' : 'background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1;'}">
                  \${isLive ? '● Live: Hostel Button Active' : '○ Disabled: Hostel Button Hidden'}
                </span>
              </div>
              <p style="font-size: 0.84rem; color: #64748b; margin: 0; font-weight: 500;">
                If Admin turns this ON, the school website enables the <strong>"Hostel"</strong> button on the navbar and activates the <strong>#hostel</strong> showcase &amp; admission inquiry.
              </p>
            </div>
          </div>

          <!-- The Master Toggle Switch -->
          <div class="tms-hostel-switch-box" style="border: 1.5px solid \${isLive ? '#86efac' : '#e2e8f0'};">
            <div style="text-align: right;">
              <div style="font-size: 0.88rem; font-weight: 800; color: #0f172a;">Have a Hostel Button</div>
              <div style="font-size: 0.74rem; font-weight: 600; color: \${isLive ? '#15803d' : '#64748b'};" id="hostel-switch-status">\${isLive ? 'Turned ON (Visible on Website)' : 'Turned OFF (Hidden)'}</div>
            </div>
            <label class="switch" style="position:relative; display:inline-block; width:50px; height:26px; flex-shrink:0; cursor:pointer;">
              <input type="checkbox" id="hostel-master-toggle" \${isLive ? 'checked' : ''}>
              <span class="slider round" style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:\${isLive ? '#16a34a' : '#cbd5e1'}; transition:.3s; border-radius:28px;"></span>
            </label>
            <a href="/#hostel" target="_blank" class="tms-btn-cms-preview" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 8px;">
              <i data-lucide="external-link" style="width:13px; height:13px; color:#059669;"></i>
              <span>Test #hostel</span>
            </a>
          </div>
        </div>
      </div>`;

// Check line endings and replace
function normalize(str) { return str.replace(/\\r\\n/g, '\\n'); }

let normCode = normalize(code);
let normHeader = normalize(oldHeaderSnippet);
let normHostel = normalize(oldHostelSnippet);

let headerReplaced = false;
let hostelReplaced = false;

if (normCode.includes(normHeader)) {
  normCode = normCode.replace(normHeader, normalize(newHeaderSnippet));
  headerReplaced = true;
  console.log('CMS Header matched and updated.');
} else {
  console.error('CMS Header snippet did NOT match.');
}

if (normCode.includes(normHostel)) {
  normCode = normCode.replace(normHostel, normalize(newHostelSnippet));
  hostelReplaced = true;
  console.log('Hostel Banner matched and updated.');
} else {
  console.error('Hostel Banner snippet did NOT match.');
}

if (headerReplaced && hostelReplaced) {
  // Preserve CRLF if original had it
  const finalCode = code.includes('\\r\\n') ? normCode.replace(/\\n/g, '\\r\\n') : normCode;
  fs.writeFileSync('admin-website-cms.js', finalCode, 'utf8');
  console.log('Successfully updated admin-website-cms.js!');
}
