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
  const CDP_PORT = 9355;
  const profileDir = path.join(__dirname, 'edge-profile-id-studio');
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

    console.log('Navigating to http://localhost:3000/index.html ...');
    await pageClient.send('Page.navigate', { url: 'http://localhost:3000/index.html' });
    await wait(2000);

    // 1. Mount IdCardsModule
    console.log('Mounting IdCardsModule Studio...');
    const mountRes = await pageClient.send('Runtime.evaluate', {
      expression: `(async () => {
        const { IdCardsModule } = await import('./id-cards-module.js');
        const main = document.querySelector('main') || document.body;
        main.innerHTML = '<div id="id-studio-wrapper"></div>';
        await IdCardsModule.render(document.getElementById('id-studio-wrapper'));
        return { mounted: true };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Mount res:', mountRes.result.value);
    await wait(800);
    await captureTab(pageClient, 'id-studio-1-landscape.png');

    // 2. Switch to Vertical Lanyard
    console.log('Switching to Vertical Lanyard orientation...');
    await pageClient.send('Runtime.evaluate', {
      expression: `document.querySelector('#btn-orient-portrait').click()`
    });
    await wait(800);
    await captureTab(pageClient, 'id-studio-2-vertical.png');

    // 3. Switch template to Royal Sapphire
    console.log('Switching template to Royal Sapphire...');
    await pageClient.send('Runtime.evaluate', {
      expression: `document.querySelector('.studio-template-pill[data-template="sapphire"]').click()`
    });
    await wait(800);
    await captureTab(pageClient, 'id-studio-3-sapphire.png');

    // 4. Open 3D Flip Showcase Modal
    console.log('Opening 3D Showcase Modal...');
    await pageClient.send('Runtime.evaluate', {
      expression: `document.querySelector('#btn-open-3d-showcase').click()`
    });
    await wait(800);
    await captureTab(pageClient, 'id-studio-4-3d-showcase.png');

    // Close modal
    await pageClient.send('Runtime.evaluate', {
      expression: `document.querySelector('#global-modal-close')?.click()`
    });
    await wait(400);

    // 5. Open Biometric Credential Enrollment Modal for First Student
    console.log('Opening BiometricCredentialModal for MD Aamir...');
    await pageClient.send('Runtime.evaluate', {
      expression: `document.querySelector('.btn-enroll-biometrics').click()`
    });
    await wait(800);
    await captureTab(pageClient, 'id-studio-5-biometric-nfc.png');

    // Switch to Face ID tab in modal
    await pageClient.send('Runtime.evaluate', {
      expression: `document.querySelector('.btn-cred-tab[data-tab="face"]').click()`
    });
    await wait(600);
    await captureTab(pageClient, 'id-studio-6-face-id-tab.png');

    // Switch to Fingerprint tab in modal
    await pageClient.send('Runtime.evaluate', {
      expression: `document.querySelector('.btn-cred-tab[data-tab="finger"]').click()`
    });
    await wait(600);
    await captureTab(pageClient, 'id-studio-7-fingerprint-tab.png');

    // Save credentials in modal
    console.log('Saving smart credentials...');
    const saveRes = await pageClient.send('Runtime.evaluate', {
      expression: `(async () => {
        const saveBtn = document.querySelector('#btn-modal-cred-save');
        if (saveBtn) saveBtn.click();
        await new Promise(r => setTimeout(r, 800));
        const { dbService } = await import('./supabase-client.js');
        const students = await dbService.select('students');
        const first = students[0] || {};
        return {
          nfcCardId: first.rfidCardId || first.rfid_uid,
          faceEnrolled: first.faceIdEnrolled,
          fpEnrolled: first.fingerprintEnrolled
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Saved Biometric result:', saveRes.result.value);

    await pageClient.send('Target.closeTarget', { targetId });
    browserClient.close();
  } finally {
    edgeProc.kill();
  }
}

run().catch(e => console.error(e));
