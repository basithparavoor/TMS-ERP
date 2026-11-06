const path = require('path');
const { spawn } = require('child_process');

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
  const CDP_PORT = 9348;
  const profileDir = path.join(__dirname, 'edge-profile-test-all-modes');
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

    pageClient.ws.addEventListener('message', (msg) => {
      const data = JSON.parse(msg.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        const text = data.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
        console.log('[Browser Console]', text);
      }
    });

    console.log('Navigating to http://localhost:3000/index.html ...');
    await pageClient.send('Page.navigate', { url: 'http://localhost:3000/index.html' });
    await wait(2000);

    // Evaluate AttendanceModule render and test all 5 modes
    const result = await pageClient.send('Runtime.evaluate', {
      expression: `(async () => {
        try {
          const { AttendanceModule } = await import('./attendance-module.js');
          const { dbService } = await import('./supabase-client.js');
          const container = document.createElement('div');
          container.id = 'test-attendance-container';
          document.body.appendChild(container);

          await AttendanceModule.render(container);
          console.log('Rendered initial timetable mode.');
          console.log('Students:', AttendanceModule._students.map(s => ({ id: s.id, admn: s.admissionNo, name: s.fullName })));

          // 1. Test QR Mode
          const qrBtn = container.querySelector('.att-mode-btn[data-mode="qr"]');
          qrBtn.click();
          await new Promise(r => setTimeout(r, 200));

          const qrInput = container.querySelector('#qr-input-scan');
          qrInput.value = 'TPS-2026-001';
          const qrPunchBtn = container.querySelector('#btn-qr-punch-submit');
          qrPunchBtn.click();
          await new Promise(r => setTimeout(r, 500));

          const qrFeedbackText = container.querySelector('#qr-punch-feedback').innerText;
          const qrRecords = await dbService.select('attendance_records');
          const qrPunchFound = qrRecords.some(r => (r.admissionNo === 'TPS-2026-001' || r.admission_no === 'TPS-2026-001') && r.method === 'QR_SCAN');

          // 2. Test NFC Mode
          const nfcBtn = container.querySelector('.att-mode-btn[data-mode="nfc"]');
          nfcBtn.click();
          await new Promise(r => setTimeout(r, 200));

          const demoNfcBtn = container.querySelector('.demo-nfc-tap[data-id="TPS-2026-003"]');
          demoNfcBtn.click();
          await new Promise(r => setTimeout(r, 1200));

          const nfcRecords = await dbService.select('attendance_records');
          console.log('nfcRecords dump:', JSON.stringify(nfcRecords));
          const nfcPunchFound = nfcRecords.some(r => (r.admissionNo === 'TPS-2026-003' || r.admission_no === 'TPS-2026-003') && r.method === 'NFC_TAP');
          console.log('nfcPunchFound right after tap:', nfcPunchFound);

          // 3. Test Face Recognition Mode
          const faceBtn = container.querySelector('.att-mode-btn[data-mode="face"]');
          faceBtn.click();
          await new Promise(r => setTimeout(r, 200));

          const demoFaceBtn = container.querySelector('.demo-face-match[data-id="TPS-2026-006"]');
          demoFaceBtn.click();
          await new Promise(r => setTimeout(r, 500));

          const faceRecords = await dbService.select('attendance_records');
          console.log('faceRecords:', JSON.stringify(faceRecords));
          const facePunchFound = faceRecords.some(r => (r.admissionNo === 'TPS-2026-006' || r.admission_no === 'TPS-2026-006' || r.student_name === 'Awan Ikbal') && r.method === 'FACE_RECOGNITION');

          // 4. Test Daily Register Mode & Save
          const regBtn = container.querySelector('.att-mode-btn[data-mode="register"]');
          regBtn.click();
          await new Promise(r => setTimeout(r, 200));

          const markAllPBtn = container.querySelector('#btn-reg-mark-all-p');
          markAllPBtn.click();
          await new Promise(r => setTimeout(r, 200));

          const saveRegBtn = container.querySelector('#btn-reg-save-ledger');
          saveRegBtn.click();
          await new Promise(r => setTimeout(r, 800));

          const finalRecords = await dbService.select('attendance_records');

          // 5. Switch back to timetable and test modal roll call
          const timeBtn = container.querySelector('.att-mode-btn[data-mode="timetable"]');
          timeBtn.click();
          await new Promise(r => setTimeout(r, 300));

          const takeAttBtn = container.querySelector('.btn-take-attendance');
          takeAttBtn.click();
          await new Promise(r => setTimeout(r, 400));

          const modal = document.querySelector('#global-modal-overlay');
          const modalPresent = !!modal;

          const modalSaveBtn = modal ? modal.querySelector('#btn-session-save') : null;
          if (modalSaveBtn) {
            modalSaveBtn.click();
            await new Promise(r => setTimeout(r, 600));
          }

          return {
            success: true,
            qrFeedbackText,
            qrPunchFound,
            nfcPunchFound,
            facePunchFound,
            finalRecordCount: finalRecords.length,
            modalPresent
          };
        } catch (e) {
          return { success: false, error: e.message, stack: e.stack };
        }
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Test Result:', JSON.stringify(result.result.value, null, 2));

    await pageClient.send('Target.closeTarget', { targetId });
    browserClient.close();
  } finally {
    edgeProc.kill();
  }
}

run().catch(err => {
  console.error('Test script error:', err);
  process.exit(1);
});
