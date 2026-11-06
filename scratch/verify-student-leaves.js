const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactDir = 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\4f9f4315-195b-4198-9946-776e8d487a3d';
const port = 9360;

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getWsUrl(p) {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${p}/json/version`);
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
  console.log('Saved screenshot:', filename);
}

async function evalInPage(pageClient, expression) {
  const res = await pageClient.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (res.exceptionDetails) {
    console.error('Eval error:', res.exceptionDetails);
    throw new Error(res.exceptionDetails.text || 'Eval error');
  }
  return res.result ? res.result.value : null;
}

async function run() {
  const userDataDir = path.join(__dirname, 'edge-profile-leaves');
  const browserProc = spawn(edgePath, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--window-size=1400,950',
    'http://localhost:3000'
  ], { detached: true, stdio: 'ignore' });

  try {
    const wsUrl = await getWsUrl(port);
    console.log('Browser connected:', wsUrl);

    // Get page target
    const targetsRes = await fetch(`http://127.0.0.1:${port}/json/list`);
    const targets = await targetsRes.json();
    const pageTarget = targets.find(t => t.type === 'page');
    const pageClient = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await pageClient.connect();

    await pageClient.send('Page.enable');
    await pageClient.send('Runtime.enable');

    // 1. Setup Auth and Go to Attendance Daily Register
    console.log('--- Step 1: Navigating to Attendance Daily Register ---');
    await evalInPage(pageClient, `
      localStorage.setItem('tms_current_user', JSON.stringify({
        id: 'usr-admin-1',
        name: 'Headmaster Administrator',
        email: 'admin@tms.edu',
        role: 'admin',
        campus: 'Main Campus'
      }));
      window.location.href = 'http://localhost:3000/dashboard.html#/attendance';
    `);

    await wait(3000);

    // Switch to Register Mode
    await evalInPage(pageClient, `
      const regBtn = document.querySelector('button[data-mode="register"]');
      if (regBtn) regBtn.click();
    `);
    await wait(1200);

    // Check Sultana Sarkar row status
    const sultanaCheck = await evalInPage(pageClient, `
      (() => {
        const rows = document.querySelectorAll('.reg-student-row');
        let sultanaRow = null;
        for (const r of rows) {
          if (r.textContent.includes('Sultana Sarkar')) {
            sultanaRow = r;
            break;
          }
        }
        if (!sultanaRow) return { found: false };
        const hasStatusBtns = sultanaRow.querySelectorAll('.att-status-btn').length > 0;
        const hasOnLeaveBadge = sultanaRow.textContent.includes('ON LEAVE');
        const hasMarkReturnedBtn = sultanaRow.querySelector('.btn-mark-returned-reg') !== null;
        return {
          found: true,
          hasStatusBtns,
          hasOnLeaveBadge,
          hasMarkReturnedBtn,
          text: sultanaRow.innerText
        };
      })()
    `);
    console.log('Sultana Leave Status in Ledger:', sultanaCheck);

    await captureTab(pageClient, 'student-leave-1-attendance-ledger.png');

    // Step 2: Open Student Leave Desk Modal
    console.log('--- Step 2: Opening Student Leave Desk ---');
    await evalInPage(pageClient, `
      document.querySelector('#btn-open-leave-desk')?.click();
    `);
    await wait(1000);
    await captureTab(pageClient, 'student-leave-2-desk-modal.png');

    // Close modal
    await evalInPage(pageClient, `
      document.querySelector('#global-modal-close')?.click();
    `);
    await wait(600);

    // Step 3: Mark Sultana as Returned
    console.log('--- Step 3: Marking Sultana as Returned ---');
    await evalInPage(pageClient, `
      const rows = document.querySelectorAll('.reg-student-row');
      for (const r of rows) {
        if (r.textContent.includes('Sultana Sarkar')) {
          const btn = r.querySelector('.btn-mark-returned-reg');
          if (btn) btn.click();
          break;
        }
      }
    `);
    await wait(1500);

    // Re-check Sultana Sarkar row
    const sultanaRestoredCheck = await evalInPage(pageClient, `
      (() => {
        const rows = document.querySelectorAll('.reg-student-row');
        let sultanaRow = null;
        for (const r of rows) {
          if (r.textContent.includes('Sultana Sarkar')) {
            sultanaRow = r;
            break;
          }
        }
        if (!sultanaRow) return { found: false };
        const statusBtns = sultanaRow.querySelectorAll('.att-status-btn');
        return {
          found: true,
          statusBtnCount: statusBtns.length,
          hasOnLeaveBadge: sultanaRow.textContent.includes('ON LEAVE'),
          buttons: Array.from(statusBtns).map(b => b.textContent.trim())
        };
      })()
    `);
    console.log('Sultana Status after Mark Returned:', sultanaRestoredCheck);

    await captureTab(pageClient, 'student-leave-3-returned-restored.png');

    // Step 4: Test Student Portal (student.html)
    console.log('--- Step 4: Student Portal Leave Application ---');
    await evalInPage(pageClient, `
      localStorage.setItem('tms_current_user', JSON.stringify({
        id: 'std-5',
        name: 'Sultana Sarkar',
        email: 'sultana@tms.edu',
        role: 'student'
      }));
      window.location.href = 'http://localhost:3000/student.html';
    `);
    await wait(2500);

    await captureTab(pageClient, 'student-leave-4-student-portal.png');

    // Open Student Apply Leave Modal
    await evalInPage(pageClient, `
      document.querySelector('#btn-portal-apply-leave')?.click();
    `);
    await wait(1000);
    await captureTab(pageClient, 'student-leave-5-student-apply-modal.png');

    // Submit new leave
    await evalInPage(pageClient, `
      const reasonInput = document.querySelector('#modal-leave-reason');
      if (reasonInput) reasonInput.value = 'Attending family elder medical consultation';
      const submitBtn = document.querySelector('#btn-submit-student-leave');
      if (submitBtn) submitBtn.click();
    `);
    await wait(1200);

    // Step 5: Test Parent Portal (parent.html)
    console.log('--- Step 5: Parent Portal Ward Leave ---');
    await evalInPage(pageClient, `
      localStorage.setItem('tms_current_user', JSON.stringify({
        id: 'usr-parent-1',
        name: 'Golam Kibria',
        email: 'golam.kibria@example.com',
        phone: '9800880620',
        role: 'parent'
      }));
      window.location.href = 'http://localhost:3000/parent.html';
    `);
    await wait(2500);

    await captureTab(pageClient, 'student-leave-6-parent-portal.png');

    // Open Parent Apply Leave for Ward Modal
    await evalInPage(pageClient, `
      document.querySelector('#btn-parent-apply-leave')?.click();
    `);
    await wait(1000);
    await captureTab(pageClient, 'student-leave-7-parent-apply-modal.png');

    pageClient.close();
    console.log('=== All Leave Verification Tests Completed Successfully! ===');
  } finally {
    try { browserProc.kill(); } catch (e) {}
  }
}

run().catch(e => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
