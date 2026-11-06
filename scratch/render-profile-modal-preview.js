const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const artifactDir = 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\674a3e6a-ddb8-49de-b0e1-fc2f88ac42fe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getWsUrl(port) {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      const tabs = await res.json();
      const page = tabs.find(t => t.type === 'page');
      if (page && page.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch (e) {}
    await wait(200);
  }
  throw new Error('CDP connection timeout');
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
  }
  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
    });
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { this.ws.close(); }
}

async function run() {
  // Read app.css
  const appCss = fs.readFileSync('app.css', 'utf8');

  // Build standalone preview HTML for profile modal
  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TMS Profile Modal Preview</title>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    ${appCss}
    body {
      background: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      margin: 0;
    }
    .modal-container {
      width: 100%;
      max-width: 680px;
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.05);
      overflow: hidden;
    }
    .modal-header-preview {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #f1f5f9;
    }
    .modal-header-preview h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
    }
    .modal-close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #64748b;
      padding: 6px;
      border-radius: 8px;
    }
    .modal-footer-preview {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-top: 1px solid #f1f5f9;
      background: #fafbfc;
    }
  </style>
</head>
<body>
  <div class="modal-container">
    <div class="modal-header-preview">
      <h3>Institutional User Profile</h3>
      <button class="modal-close-btn"><i data-lucide="x"></i></button>
    </div>
    
    <div class="inst-profile-modal-body">
      <!-- Top Executive Identity Hero Card -->
      <div class="inst-profile-hero-card">
        <div class="inst-avatar-wrapper">
          <img id="pf-avatar" class="inst-avatar-img" src="./icons/tms-logo.png" alt="Staff Avatar">
          <label for="pf-avatar-file" class="inst-avatar-camera-btn" title="Change Profile Photograph">
            <i data-lucide="camera"></i>
          </label>
        </div>
        <div class="inst-hero-details">
          <div class="inst-hero-header-row">
            <h3 class="inst-hero-name">C. M. Basith</h3>
            <div class="inst-hero-badges">
              <span class="inst-badge-role"><i data-lucide="shield-check"></i> SUPER ADMIN</span>
              <span class="inst-badge-id font-mono">TMS-001</span>
            </div>
          </div>
          <div class="inst-hero-email">
            <i data-lucide="mail"></i>
            <span>cmbasith786@gmail.com</span>
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
          <input class="form-input inst-input" id="pf-name" value="C. M. Basith" placeholder="Enter your full name">
        </div>

        <!-- 2. Institutional Role (Read-only as assigned by Super Admin) -->
        <div class="form-group inst-field-group">
          <label class="form-label inst-label">Institutional Role <span class="req-star">*</span></label>
          <div class="inst-readonly-box" title="Executive Director &amp; Super Admin">
            <i data-lucide="shield" class="inst-field-icon"></i>
            <span class="inst-readonly-val">Executive Director &amp; Super Admin</span>
            <span class="inst-readonly-badge">Assigned by Admin</span>
          </div>
          <div class="inst-help-text">Read-only role managed by Administration</div>
        </div>

        <!-- 3. Institutional Staff ID (Read-only as allocated by School Admin) -->
        <div class="form-group inst-field-group">
          <label class="form-label inst-label">Institutional Staff ID</label>
          <div class="inst-input-addon-wrap">
            <span class="inst-addon-label font-mono">TMS</span>
            <input type="text" id="pf-tgi-display" class="form-input inst-addon-field font-mono" value="001" readonly>
            <span class="inst-field-lock" title="Allocated by Admin"><i data-lucide="lock"></i></span>
          </div>
          <div class="inst-help-text">Official staff identification number</div>
        </div>

        <!-- 4. Phone Number (Auto-formatted 5-5 digits with fixed +91) -->
        <div class="form-group inst-field-group">
          <label class="form-label inst-label" for="pf-phone">Phone Number <span class="req-star">*</span></label>
          <div class="inst-input-addon-wrap">
            <span class="inst-addon-flag">🇮🇳 +91</span>
            <input type="tel" id="pf-phone" class="form-input inst-addon-field font-mono" maxlength="11" placeholder="98470 55667" value="98470 55667">
          </div>
          <div class="inst-help-text">Standard 10-digit mobile (formatted 5–5)</div>
        </div>

        <!-- 5. Blood Group -->
        <div class="form-group inst-field-group">
          <label class="form-label inst-label" for="pf-blood-group">Blood Group <span class="req-star">*</span></label>
          <select class="form-select inst-select" id="pf-blood-group">
            <option value="">— Select Blood Group —</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+" selected>O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
          <div class="inst-help-text">For campus medical emergency register</div>
        </div>

        <!-- 6. Department / Wing (Read-only) -->
        <div class="form-group inst-field-group">
          <label class="form-label inst-label">Department / Wing</label>
          <div class="inst-readonly-box">
            <i data-lucide="building-2" class="inst-field-icon"></i>
            <span class="inst-readonly-val">Executive Governance &amp; Leadership</span>
          </div>
          <div class="inst-help-text">Institutional wing or faculty department</div>
        </div>
      </div>

      <!-- Section 2: Dynamic Admin-Configured Onboarding Questions -->
      <div class="inst-section-divider">
        <div class="inst-section-title">
          <i data-lucide="file-badge"></i>
          <span>Professional &amp; Onboarding Details</span>
        </div>
        <div class="inst-section-line"></div>
      </div>

      <div class="inst-form-grid">
        <div class="form-group inst-field-group">
          <label class="form-label inst-label">Highest Educational Qualification <span class="req-star">*</span></label>
          <input type="text" class="form-input inst-input" value="M.Ed, B.Sc Mathematics, B.A English" placeholder="e.g. M.Ed, B.Sc Mathematics, B.A English">
          <div class="inst-help-text">Your highest degree or professional certification</div>
        </div>
        <div class="form-group inst-field-group">
          <label class="form-label inst-label">Emergency Contact Person &amp; Phone <span class="req-star">*</span></label>
          <input type="text" class="form-input inst-input" value="Spouse (+91 98470 55667)" placeholder="e.g. Spouse / Brother (+91 98470 ...)">
          <div class="inst-help-text">Person to reach in case of medical or institutional emergency</div>
        </div>
        <div class="form-group inst-field-group full-width">
          <label class="form-label inst-label">Residential / Current Address <span class="req-star">*</span></label>
          <textarea class="form-input inst-textarea" rows="2" placeholder="House / Street name, City, Pincode">Baghait, Tapan, Dakshin Dinajpur, West Bengal</textarea>
        </div>
      </div>

      <!-- Section 3: Verification & Governance Dashboard -->
      <div class="inst-credential-grid">
        <div class="inst-cred-item">
          <span class="inst-cred-label"><i data-lucide="mail"></i> Registered Email</span>
          <span class="inst-cred-val font-mono">cmbasith786@gmail.com</span>
        </div>
        <div class="inst-cred-item">
          <span class="inst-cred-label"><i data-lucide="shield"></i> Authority Level</span>
          <span class="inst-cred-val">SUPER ADMIN</span>
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

      <!-- Section 4: Notice -->
      <div class="inst-notice-card notice-active">
        <div class="inst-notice-icon"><i data-lucide="clock"></i></div>
        <div class="inst-notice-body">
          <div class="inst-notice-headline">Super Admin Executive Privileges Active</div>
          <div class="inst-notice-text">As Super Administrator, you have permanent administrative privileges to manage identity and security credentials.</div>
        </div>
      </div>
    </div>

    <div class="modal-footer-preview">
      <button class="btn btn-secondary"><i data-lucide="key-round"></i> Change Password</button>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-secondary">Cancel</button>
        <button class="btn btn-primary" style="background:#16a34a; border-color:#16a34a;"><i data-lucide="save"></i> Save Profile Changes</button>
      </div>
    </div>
  </div>

  <script>
    lucide.createIcons();
  </script>
</body>
</html>`;

  const previewPath = path.join(__dirname, 'modal-preview.html');
  fs.writeFileSync(previewPath, previewHtml);

  const CDP_PORT = 9399;
  const profileDir = path.join(artifactDir, 'scratch', 'edge-profile-preview');
  const edgeProc = spawn(edgePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profileDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1200,1050',
    'about:blank'
  ]);

  try {
    const wsUrl = await getWsUrl(CDP_PORT);
    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Page.navigate', { url: 'http://localhost:3000/scratch/modal-preview.html' });
    await wait(1200);

    const shot = await client.send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(artifactDir, 'profile-modal-fixed-preview.png');
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log('Successfully saved profile-modal-fixed-preview.png');

    client.close();
  } finally {
    edgeProc.kill();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
