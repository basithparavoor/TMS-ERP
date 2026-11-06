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
  const appCss = fs.readFileSync('app.css', 'utf8');

  // Harness that uses actual UIComponents.openModal
  const harnessHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TMS Profile Modal Header Test</title>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    ${appCss}
    body {
      background: #0f172a80;
      margin: 0;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
  </style>
</head>
<body>
  <script type="module">
    import { UIComponents } from '../ui-components.js';

    UIComponents.openModal({
      title: '<div style="display:flex;align-items:center;gap:10px;"><i data-lucide="user-cog" style="color:#16a34a;width:22px;height:22px;"></i><span>Institutional User Profile</span></div>',
      bodyHtml: \`
        <div class="inst-profile-hero-card">
          <div class="inst-avatar-wrapper">
            <img id="pf-avatar" class="inst-avatar-img" src="../icons/tms-logo.png" alt="Staff Avatar">
            <label class="inst-avatar-camera-btn"><i data-lucide="camera"></i></label>
          </div>
          <div class="inst-hero-details">
            <div class="inst-hero-header-row">
              <h3 class="inst-hero-name">C. M. Basith</h3>
              <div class="inst-hero-badges">
                <span class="inst-badge-role"><i data-lucide="shield-check"></i> SUPER ADMIN</span>
                <span class="inst-badge-id font-mono">TMS-001</span>
              </div>
            </div>
            <div class="inst-hero-email"><i data-lucide="mail"></i><span>cmbasith786@gmail.com</span></div>
            <div class="inst-hero-affiliation"><span class="inst-org-pill"><i data-lucide="school"></i> THAIBA MODEL SCHOOL • Enterprise Campus Core</span></div>
          </div>
        </div>
        <div style="padding: 10px 0; color: #64748b; font-size: 0.9rem;">Preview content loaded successfully.</div>
      \`,
      footerHtml: \`
        <button class="btn btn-secondary">Cancel</button>
        <button class="btn btn-primary" style="background:#16a34a; border-color:#16a34a;"><i data-lucide="save"></i> Save Profile</button>
      \`,
      maxWidth: '740px'
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'modal-header-test.html'), harnessHtml);

  const CDP_PORT = 9404;
  const profileDir = path.join(artifactDir, 'scratch', 'edge-modal-header-test');
  const edgeProc = spawn(edgePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profileDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1200,800',
    'about:blank'
  ]);

  try {
    const wsUrl = await getWsUrl(CDP_PORT);
    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    console.log('Navigating to http://localhost:3000/scratch/modal-header-test.html ...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/scratch/modal-header-test.html' });
    await wait(1500);

    const evalRes = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const titleEl = document.getElementById('global-modal-title');
        const closeBtn = document.getElementById('global-modal-close');
        const headerRow = document.querySelector('.modal-header-row');

        return {
          titleHTML: titleEl?.innerHTML,
          titleText: titleEl?.innerText,
          hasIcon: !!titleEl?.querySelector('svg'),
          closeBtnTop: closeBtn?.getBoundingClientRect().top,
          titleTop: titleEl?.getBoundingClientRect().top
        };
      })()`,
      returnByValue: true
    });

    console.log('Modal Header Test Results:', JSON.stringify(evalRes.result.value, null, 2));

    const shot = await client.send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(artifactDir, 'profile-modal-header-fixed.png');
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved profile-modal-header-fixed.png');

    client.close();
  } finally {
    edgeProc.kill();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
