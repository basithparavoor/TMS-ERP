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
  const port = 9338;
  const proc = spawn(edgePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=375,812',
    'http://localhost:3000/dashboard'
  ]);

  try {
    const wsUrl = await getWsUrl(port);
    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Page.enable');

    // Add script on new document to mock authService.init
    await client.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        window.addEventListener('DOMContentLoaded', () => {
          import('./auth-service.js').then(({ authService }) => {
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
            authService.init = async () => mockUser;
            authService.validateSession = async () => mockUser;
            authService.saveCache(mockUser);
          });
        });
      `
    });

    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard#/dashboard' });
    await wait(3000);

    const shot1 = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'audit-mobile-overview.png'), Buffer.from(shot1.data, 'base64'));
    console.log('Saved audit-mobile-overview.png');

    // Open mobile sidebar
    await client.send('Runtime.evaluate', {
      expression: `document.getElementById('mobile-header-menu-btn')?.click()`
    });
    await wait(800);
    const shot2 = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'audit-mobile-drawer.png'), Buffer.from(shot2.data, 'base64'));
    console.log('Saved audit-mobile-drawer.png');

    // Navigate to /students
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard#/students' });
    await wait(2500);
    const shot3 = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'audit-mobile-students.png'), Buffer.from(shot3.data, 'base64'));
    console.log('Saved audit-mobile-students.png');

    // Navigate to /administration
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard#/administration' });
    await wait(2500);
    const shot4 = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'audit-mobile-administration.png'), Buffer.from(shot4.data, 'base64'));
    console.log('Saved audit-mobile-administration.png');

    client.close();
  } catch (err) {
    console.error('Audit run error:', err);
  } finally {
    proc.kill();
  }
}

run();
