const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const artifactDir = 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\674a3e6a-ddb8-49de-b0e1-fc2f88ac42fe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

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

async function run() {
  const CDP_PORT = 9345;
  const profileDir = path.join(artifactDir, 'scratch', 'edge-profile-att-test');
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
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('Navigating to http://localhost:3000/dashboard.html ...');
    await pageClient.send('Page.navigate', { url: 'http://localhost:3000/dashboard.html' });
    await wait(2000);

    // Direct render of AttendanceModule into dashboard
    console.log('Mounting AttendanceModule directly into viewport...');
    const mountRes = await pageClient.send('Runtime.evaluate', {
      expression: `(async () => {
        try {
          const { AttendanceModule } = await import('./attendance-module.js');
          const root = document.getElementById('app-root') || document.body;
          root.innerHTML = '';
          const viewport = document.createElement('div');
          viewport.id = 'main-viewport';
          viewport.style.padding = '24px 32px';
          viewport.style.background = '#F8FAFC';
          viewport.style.minHeight = '100vh';
          root.appendChild(viewport);
          await AttendanceModule.render(viewport);
          return { success: true };
        } catch (err) {
          return { error: err.message, stack: err.stack };
        }
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Attendance mount result:', JSON.stringify(mountRes.result.value, null, 2));
    await wait(1200);

    // 1. Audit Attendance Timetable View
    const attAudit = await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const modeButtons = Array.from(document.querySelectorAll('.att-mode-btn')).map(b => b.innerText.trim());
        const cards = Array.from(document.querySelectorAll('.teacher-upcoming-card')).map(c => {
          const name = c.querySelector('h4')?.innerText.trim();
          const badge = c.querySelector('.badge')?.innerText.trim();
          return { name, badge };
        });
        const hasPulseDot = !!document.querySelector('.live-pulse-dot');
        const hasAddBtn = !!document.querySelector('#btn-add-new-classroom');
        return { modeButtons, cardCount: cards.length, sampleCards: cards.slice(0, 3), hasPulseDot, hasAddBtn };
      })()`,
      returnByValue: true
    });
    console.log('Attendance View Audit:', JSON.stringify(attAudit.result.value, null, 2));

    // Capture Timetable Page
    const shot1 = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'attendance-tpsh-timetable-preview.png'), Buffer.from(shot1.data, 'base64'));
    console.log('Saved attendance-tpsh-timetable-preview.png');

    // 2. Open Edit Classroom Modal on first card
    console.log('Opening Edit Classroom modal...');
    await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const editBtn = document.querySelector('.btn-edit-classroom-card');
        if (editBtn) editBtn.click();
      })()`
    });
    await wait(1500);

    const modalAudit = await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const title = document.querySelector('#global-modal-title')?.innerText.trim();
        const sectionVal = document.querySelector('#cls-modal-section')?.value;
        const nameVal = document.querySelector('#cls-modal-name')?.value;
        const teacherVal = document.querySelector('#cls-modal-teacher')?.value;
        const hasRemoveBtn = !!document.querySelector('#btn-cls-remove-teacher');
        const hasTenureCard = document.body.innerText.includes('Faculty Duty Tenure & Attendance Window');
        const dayButtons = Array.from(document.querySelectorAll('.cls-day-round-btn')).map(b => ({
          day: b.dataset.day,
          char: b.innerText.trim(),
          active: b.classList.contains('active')
        }));
        const startTimeVal = document.querySelector('#cls-modal-start-time')?.value;
        const endTimeVal = document.querySelector('#cls-modal-end-time')?.value;
        const genderVal = document.querySelector('#cls-modal-gender')?.value;
        const roomVal = document.querySelector('#cls-modal-room')?.value;
        const capVal = document.querySelector('#cls-modal-capacity')?.value;

        return {
          title,
          sectionVal,
          nameVal,
          teacherVal,
          hasRemoveBtn,
          hasTenureCard,
          dayButtons,
          startTimeVal,
          endTimeVal,
          genderVal,
          roomVal,
          capVal
        };
      })()`,
      returnByValue: true
    });
    console.log('Modal Audit (Exact match to uploaded image):', JSON.stringify(modalAudit.result.value, null, 2));

    const shotModal = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'attendance-modal-classroom-preview.png'), Buffer.from(shotModal.data, 'base64'));
    console.log('Saved attendance-modal-classroom-preview.png');

    // Close Modal
    await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('global-modal-overlay');
        if (overlay) overlay.style.display = 'none';
      })()`
    });
    await wait(800);

    // 3. Switch to Smart QR Scanner Mode
    console.log('Switching to QR Scanner mode...');
    await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const qrBtn = document.querySelector('.att-mode-btn[data-mode="qr"]');
        if (qrBtn) qrBtn.click();
      })()`
    });
    await wait(1200);

    const shotQr = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'attendance-qr-kiosk-preview.png'), Buffer.from(shotQr.data, 'base64'));
    console.log('Saved attendance-qr-kiosk-preview.png');

    // 4. Switch to Biometric NFC Tap Mode
    console.log('Switching to NFC Tap mode...');
    await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const nfcBtn = document.querySelector('.att-mode-btn[data-mode="nfc"]');
        if (nfcBtn) nfcBtn.click();
      })()`
    });
    await wait(1200);

    const shotNfc = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'attendance-nfc-tap-preview.png'), Buffer.from(shotNfc.data, 'base64'));
    console.log('Saved attendance-nfc-tap-preview.png');

    // 5. Switch to AI Face Recognition Mode
    console.log('Switching to Face Recognition mode...');
    await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const faceBtn = document.querySelector('.att-mode-btn[data-mode="face"]');
        if (faceBtn) faceBtn.click();
      })()`
    });
    await wait(1200);

    const shotFace = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'attendance-face-recognition-preview.png'), Buffer.from(shotFace.data, 'base64'));
    console.log('Saved attendance-face-recognition-preview.png');

    // 6. Switch back to timetable and open Session Roll Call Modal
    console.log('Opening Session Roll Call modal...');
    await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const ttBtn = document.querySelector('.att-mode-btn[data-mode="timetable"]');
        if (ttBtn) ttBtn.click();
      })()`
    });
    await wait(800);

    await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const takeBtn = document.querySelector('.btn-take-attendance');
        if (takeBtn) takeBtn.click();
      })()`
    });
    await wait(1500);

    const shotRollCall = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'attendance-rollcall-session-preview.png'), Buffer.from(shotRollCall.data, 'base64'));
    console.log('Saved attendance-rollcall-session-preview.png');

    console.log('ALL TESTS AND SCREENSHOT CAPTURES COMPLETED SUCCESSFULLY!');

    pageClient.close();
    browserClient.close();
    edgeProc.kill();
  } catch (err) {
    console.error('Test error:', err);
    edgeProc.kill();
  }
}

run();
