const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactDir = 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\4f9f4315-195b-4198-9946-776e8d487a3d';

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getWsUrl(port) {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      const data = await res.json();
      if (data.webSocketDebuggerUrl) return data.webSocketDebuggerUrl;
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

async function captureTab(pageClient, filename) {
  const { data } = await pageClient.send('Page.captureScreenshot', { format: 'png' });
  const outPath = path.join(artifactDir, filename);
  fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
  console.log('Saved screenshot:', outPath);
}

async function run() {
  const CDP_PORT = 9350;
  const profileDir = path.join(__dirname, 'edge-profile-shots');
  const edgeProc = spawn(edgePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profileDir}`,
    '--headless=new',
    '--disable-gpu',
    'about:blank'
  ]);

  try {
    await wait(1500);
    const wsUrl = await getWsUrl(CDP_PORT);
    const browserClient = new CDPClient(wsUrl);
    await browserClient.connect();

    const { targetId } = await browserClient.send('Target.createTarget', { url: 'about:blank' });
    const pagesRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
    const pages = await pagesRes.json();
    const targetPage = pages.find(p => p.id === targetId);

    const pageClient = new CDPClient(targetPage.webSocketDebuggerUrl);
    await pageClient.connect();

    await pageClient.send('Page.enable');
    await pageClient.send('Runtime.enable');
    await pageClient.send('DOM.enable');

    await pageClient.send('Emulation.setDeviceMetricsOverride', {
      width: 1366,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await pageClient.send('Page.navigate', { url: 'http://localhost:3000/index.html' });
    await wait(2000);

    // Render Attendance Module
    await pageClient.send('Runtime.evaluate', {
      expression: `(async () => {
        const { AttendanceModule } = await import('./attendance-module.js');
        const main = document.querySelector('main') || document.body;
        main.innerHTML = '<div id="att-wrapper"></div>';
        await AttendanceModule.render(document.getElementById('att-wrapper'));
      })()`,
      awaitPromise: true
    });
    await wait(800);
    await captureTab(pageClient, 'attendance-1-timetable.png');

    // Switch to QR Scanner
    await pageClient.send('Runtime.evaluate', {
      expression: `document.querySelector('.att-mode-btn[data-mode="qr"]').click()`
    });
    await wait(800);
    // Punch in student
    await pageClient.send('Runtime.evaluate', {
      expression: `document.querySelector('.demo-qr-punch[data-id="TPS-2026-001"]').click()`
    });
    await wait(800);
    await captureTab(pageClient, 'attendance-2-qr.png');

    // Switch to NFC
    await pageClient.send('Runtime.evaluate', {
      expression: `document.querySelector('.att-mode-btn[data-mode="nfc"]').click()`
    });
    await wait(800);
    await pageClient.send('Runtime.evaluate', {
      expression: `document.querySelector('.demo-nfc-tap[data-id="TPS-2026-003"]').click()`
    });
    await wait(800);
    await captureTab(pageClient, 'attendance-3-nfc.png');

    // Switch to AI Face Recognition
    await pageClient.send('Runtime.evaluate', {
      expression: `document.querySelector('.att-mode-btn[data-mode="face"]').click()`
    });
    await wait(800);
    await pageClient.send('Runtime.evaluate', {
      expression: `document.querySelector('.demo-face-match[data-id="TPS-2026-006"]').click()`
    });
    await wait(800);
    await captureTab(pageClient, 'attendance-4-face.png');

    // Switch to Daily Register
    await pageClient.send('Runtime.evaluate', {
      expression: `document.querySelector('.att-mode-btn[data-mode="register"]').click()`
    });
    await wait(800);
    await captureTab(pageClient, 'attendance-5-register.png');

    await pageClient.send('Target.closeTarget', { targetId });
    browserClient.close();
  } finally {
    edgeProc.kill();
  }
}

run().catch(e => console.error(e));
