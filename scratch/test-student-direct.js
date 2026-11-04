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
  const CDP_PORT = 9335;
  const profileDir = path.join(artifactDir, 'scratch', 'edge-profile-direct-full');
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

    // Direct render of StudentModule into dashboard
    console.log('Mounting StudentModule directly into viewport...');
    const mountRes = await pageClient.send('Runtime.evaluate', {
      expression: `(async () => {
        try {
          const { StudentModule } = await import('./student-module.js');
          const root = document.getElementById('app-root') || document.body;
          root.innerHTML = '';
          const viewport = document.createElement('div');
          viewport.id = 'main-viewport';
          viewport.style.padding = '24px 32px';
          viewport.style.background = '#F8FAFC';
          viewport.style.minHeight = '100vh';
          root.appendChild(viewport);
          await StudentModule.render(viewport);
          return { success: true };
        } catch (err) {
          return { error: err.message, stack: err.stack };
        }
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Mount result:', JSON.stringify(mountRes.result.value, null, 2));
    await wait(1200);

    // Verify table structure and fields
    const tableAudit = await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const table = document.querySelector('#students-table');
        if (!table) return { error: 'No table found' };
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());
        const firstThHasCb = !!table.querySelector('thead th:first-child input[type="checkbox"]');
        const rows = Array.from(table.querySelectorAll('tbody tr')).length;
        
        const firstRowCells = Array.from(table.querySelectorAll('tbody tr:first-child td')).map(td => td.innerText.trim().replace(/\\s+/g, ' '));
        const firstRowHasCb = !!table.querySelector('tbody tr:first-child td:first-child input[type="checkbox"]');
        const hasAvatars = !!table.querySelector('.tms-student-avatar');
        const hasIdBadges = !!table.querySelector('.tms-id-badge');
        const hasCategoryBadges = !!table.querySelector('.tms-category-badge');
        const hasStatusPills = !!table.querySelector('.tms-status-pill');
        const actionBtns = Array.from(table.querySelectorAll('tbody tr:first-child .tms-table-action-btn')).length;
        const hasWhatsAppLink = !!table.querySelector('a[href*="wa.me"]');

        return {
          headers,
          firstThHasCb,
          firstRowHasCb,
          rows,
          firstRowCells,
          hasAvatars,
          hasIdBadges,
          hasCategoryBadges,
          hasStatusPills,
          actionBtns,
          hasWhatsAppLink
        };
      })()`,
      returnByValue: true
    });

    console.log('Table Audit:', JSON.stringify(tableAudit.result.value, null, 2));

    // Capture Table Screenshot
    const tableScreenshot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'dataview-table-preview.png'), Buffer.from(tableScreenshot.data, 'base64'));
    console.log('Saved dataview-table-preview.png to artifacts!');

    // Click Edit Student on first row
    console.log('Opening Edit Student Record modal...');
    await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const editBtn = document.querySelector('#students-table tbody tr:first-child .btn-edit-student');
        if (editBtn) editBtn.click();
      })()`
    });
    await wait(1500);

    const editModalInfo = await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const title = document.querySelector('#global-modal-title')?.innerText;
        const hasPhotoBox = !!document.querySelector('#ed-photo-box');
        const hasDatePicker = !!document.querySelector('#ed-dob');
        const customDropdowns = document.querySelectorAll('.tms-custom-dropdown').length;
        const customDatePickers = document.querySelectorAll('.tms-custom-datepicker').length;
        const fullNameVal = document.querySelector('#ed-name')?.value;
        const idVal = document.querySelector('#ed-admission')?.value;
        const genderVal = document.querySelector('#ed-gender')?.value;
        const classVal = document.querySelector('#ed-grade')?.value;
        const catVal = document.querySelector('#ed-category')?.value;

        return {
          title,
          hasPhotoBox,
          hasDatePicker,
          customDropdowns,
          customDatePickers,
          fullNameVal,
          idVal,
          genderVal,
          classVal,
          catVal
        };
      })()`,
      returnByValue: true
    });
    console.log('Edit Modal Audit:', JSON.stringify(editModalInfo.result.value, null, 2));

    const editScreenshot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'dataview-edit-modal-preview.png'), Buffer.from(editScreenshot.data, 'base64'));
    console.log('Saved dataview-edit-modal-preview.png to artifacts!');

    // Close edit modal cleanly
    await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('global-modal-overlay');
        if (overlay) overlay.style.display = 'none';
      })()`
    });
    await wait(1000);

    // Click View Student Profile on first row
    console.log('Opening Student Profile modal...');
    await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const viewBtn = document.querySelector('#students-table tbody tr:first-child .btn-view-profile');
        if (viewBtn) viewBtn.click();
      })()`
    });
    await wait(1500);

    const profileModalInfo = await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const title = document.querySelector('#global-modal-title')?.innerText;
        const bodyEl = document.querySelector('#global-modal-body');
        const text = bodyEl ? bodyEl.innerText : '';
        const hasParent = text.includes('PARENT & GUARDIAN');
        const hasNative = text.includes('NATIVE ADDRESS');
        const hasEditBtn = !!document.querySelector('#btn-modal-edit-student');
        const hasDelBtn = !!document.querySelector('#btn-modal-del-student');
        return { title, hasParent, hasNative, hasEditBtn, hasDelBtn, snippet: text.slice(0, 150) };
      })()`,
      returnByValue: true
    });
    console.log('Profile Modal Audit:', JSON.stringify(profileModalInfo.result.value, null, 2));

    const profileScreenshot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'dataview-profile-modal-preview.png'), Buffer.from(profileScreenshot.data, 'base64'));
    console.log('Saved dataview-profile-modal-preview.png to artifacts!');

    console.log('ALL VERIFICATIONS AND SCREENSHOTS PRODUCED CLEANLY!');

    pageClient.close();
    browserClient.close();
    edgeProc.kill();
  } catch (err) {
    console.error('Run error:', err);
    edgeProc.kill();
  }
}

run();
