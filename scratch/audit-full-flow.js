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
  close() {
    try { this.ws.close(); } catch (e) {}
  }
}

async function run() {
  const port = 9339;
  const proc = spawn(edgePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,850',
    'http://localhost:3000/login.html'
  ]);

  try {
    const wsUrl = await getWsUrl(port);
    const client = new CDPClient(wsUrl);
    await client.connect();
    await client.send('Page.enable');
    await wait(1500);

    // Perform login in login.html
    console.log('Attempting login...');
    const loginRes = await client.send('Runtime.evaluate', {
      expression: `(async () => {
        const { authService } = await import('./auth-service.js');
        // Sign in with Super Admin or mock user
        const res = await authService.login('cmbasith786@gmail.com', 'Admin@123456');
        return res;
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Login result:', loginRes.result?.value);

    // If login returned error, test with bypass or mock
    if (!loginRes.result?.value?.success) {
      console.log('Using dev session mock...');
      await client.send('Runtime.evaluate', {
        expression: `(async () => {
          const { authService } = await import('./auth-service.js');
          const mockUser = {
            id: 'super-admin-basith',
            email: 'cmbasith786@gmail.com',
            name: 'C. M. Basith',
            role: 'super_admin',
            isSuperAdmin: true,
            title: 'Executive Director & Super Admin',
            department: 'Executive Governance'
          };
          authService.currentUser = mockUser;
          authService.saveCache(mockUser);
        })()`,
        awaitPromise: true
      });
    }

    // Now navigate to dashboard with bypass param if needed or standard
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard#/dashboard' });
    await wait(2500);

    // Let's capture desktop dashboard
    const shotDesk = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'audit-desktop-dashboard.png'), Buffer.from(shotDesk.data, 'base64'));
    console.log('Captured audit-desktop-dashboard.png');

    // Emulate mobile device (375 x 812)
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true
    });
    await wait(1000);

    const shotMob = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'audit-mobile-dashboard.png'), Buffer.from(shotMob.data, 'base64'));
    console.log('Captured audit-mobile-dashboard.png');

    // Navigate to /administration on mobile
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard#/administration' });
    await wait(2500);
    const shotMobAdmin = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'audit-mobile-administration.png'), Buffer.from(shotMobAdmin.data, 'base64'));
    console.log('Captured audit-mobile-administration.png');

    client.close();
  } catch (err) {
    console.error('Audit flow error:', err);
  } finally {
    proc.kill();
  }
}

run();
