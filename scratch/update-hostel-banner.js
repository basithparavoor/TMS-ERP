const fs = require('fs');

let code = fs.readFileSync('admin-website-cms.js', 'utf8');

const oldCode = `        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
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
        </div>`;

const newCode = `        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
          <div style="display: flex; align-items: center; gap: 16px; flex: 1; min-width: 320px;">
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
              <p style="font-size: 0.84rem; color: #64748b; margin: 0; font-weight: 500; max-width: 650px;">
                If Admin turns this ON, the school website enables the <strong>"Hostel"</strong> button on the navbar and activates the <strong>#hostel</strong> showcase &amp; admission inquiry.
              </p>
            </div>
          </div>

          <!-- The Master Toggle Switch -->
          <div class="tms-hostel-switch-box" style="border: 1.5px solid \${isLive ? '#86efac' : '#e2e8f0'}; flex-shrink: 0;">
            <div style="text-align: right;">
              <div style="font-size: 0.88rem; font-weight: 800; color: #0f172a;">Have a Hostel Button</div>
              <div style="font-size: 0.74rem; font-weight: 600; color: \${isLive ? '#15803d' : '#64748b'};" id="hostel-switch-status">\${isLive ? 'Turned ON (Visible on Website)' : 'Turned OFF (Hidden)'}</div>
            </div>
            <label class="switch" style="cursor:pointer;">
              <input type="checkbox" id="hostel-master-toggle" \${isLive ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
            <a href="/#hostel" target="_blank" class="tms-btn-cms-preview" style="padding: 7px 14px; font-size: 0.82rem; border-radius: 9px;">
              <i data-lucide="external-link" style="width:14px; height:14px; color:#059669;"></i>
              <span>Test #hostel</span>
            </a>
          </div>
        </div>`;

function normalize(s) { return s.replace(/\\r\\n/g, '\\n'); }

let normCode = normalize(code);
let normOld = normalize(oldCode);

if (normCode.includes(normOld)) {
  normCode = normCode.replace(normOld, normalize(newCode));
  const finalCode = code.includes('\\r\\n') ? normCode.replace(/\\n/g, '\\r\\n') : normCode;
  fs.writeFileSync('admin-website-cms.js', finalCode, 'utf8');
  console.log('Hostel banner updated cleanly!');
} else {
  console.error('Could not match oldCode in admin-website-cms.js');
}
