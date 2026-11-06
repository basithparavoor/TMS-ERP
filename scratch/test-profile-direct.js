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
  const CDP_PORT = 9394;
  const profileDir = path.join(artifactDir, 'scratch', 'edge-profile-direct');
  const edgeProc = spawn(edgePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profileDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    'about:blank'
  ]);

  try {
    const wsUrl = await getWsUrl(CDP_PORT);
    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    console.log('Navigating to http://localhost:3000/dashboard.html ...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard.html' });
    await wait(1500);

    const evalRes = await client.send('Runtime.evaluate', {
      expression: `(async () => {
        const { authService } = await import('./auth-service.js');
        const { OnboardingService } = await import('./onboarding-service.js');
        const { UIComponents } = await import('./ui-components.js');

        authService.currentUser = {
          id: 'test-admin',
          name: 'C. M. Basith',
          email: 'cmbasith786@gmail.com',
          role: 'super_admin',
          title: 'Executive Director & Super Admin',
          department: 'Executive Governance & Leadership',
          phone: '+91 98470 55667',
          avatar: './icons/tms-logo.png'
        };

        // Open modal
        if (window.tmsApp) {
          await window.tmsApp.openMyProfile();
        }

        await new Promise(r => setTimeout(r, 600));

        const modal = document.querySelector('.modal-dialog, .modal-content, .inst-profile-modal-body');
        if (!modal) return { error: 'Modal not found in DOM' };

        const hero = document.querySelector('.inst-profile-hero-card');
        const heroName = hero?.querySelector('.inst-hero-name')?.textContent;
        const heroBadges = Array.from(hero?.querySelectorAll('.inst-badge-role, .inst-badge-id') || []).map(b => b.innerText.trim());
        const creds = Array.from(document.querySelectorAll('.inst-cred-item')).map(c => ({
          label: c.querySelector('.inst-cred-label')?.innerText.trim(),
          val: c.querySelector('.inst-cred-val, .inst-cred-badge')?.innerText.trim()
        }));

        return {
          modalFound: true,
          heroName,
          heroBadges,
          creds,
          formGridCols: window.getComputedStyle(document.querySelector('.inst-form-grid')).gridTemplateColumns,
          hasAddon: !!document.querySelector('.inst-input-addon-wrap'),
          saveBtnText: document.getElementById('pf-save')?.innerText.trim()
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Direct Audit Result:', JSON.stringify(evalRes.result.value, null, 2));

    const shot = await client.send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(artifactDir, 'profile-modal-direct-fixed.png');
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved screenshot to:', shotPath);

    client.close();
  } finally {
    edgeProc.kill();
  }
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
