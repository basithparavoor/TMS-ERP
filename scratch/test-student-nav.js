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
  const CDP_PORT = 9325;
  const profileDir = path.join(artifactDir, 'scratch', 'edge-profile-dataview-test2');
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

    console.log('Navigating to http://localhost:3000/ ...');
    await pageClient.send('Page.navigate', { url: 'http://localhost:3000/' });
    await wait(2500);

    // Auto login if on login page
    await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const userInput = document.querySelector('input[type="text"], input[name="username"], #username, #email');
        const passInput = document.querySelector('input[type="password"], #password');
        const btn = document.querySelector('button[type="submit"], .btn-primary, #btn-login');
        if (userInput && passInput) {
          userInput.value = 'admin';
          userInput.dispatchEvent(new Event('input', { bubbles: true }));
          passInput.value = 'admin123';
          passInput.dispatchEvent(new Event('input', { bubbles: true }));
          if (btn) btn.click();
        }
      })()`
    });
    await wait(2500);

    // Navigate to student directory using hash and click
    console.log('Navigating to #/students ...');
    await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const navLink = document.querySelector('a[href="#/students"], [data-module="students"]');
        if (navLink) {
          navLink.click();
        } else {
          window.location.hash = '#/students';
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      })()`
    });
    await wait(3000);

    // Ensure table view is active
    await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const tableBtn = document.querySelector('.view-btn[data-view="table"]');
        if (tableBtn) tableBtn.click();
      })()`
    });
    await wait(1000);

    // Verify table elements
    const tableInfo = await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const table = document.querySelector('#students-table');
        if (!table) return { error: 'No table found', currentHash: window.location.hash, bodyText: document.body.innerText.slice(0, 300) };
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());
        const firstThHasCb = !!table.querySelector('thead th:first-child input[type="checkbox"]');
        const rows = Array.from(table.querySelectorAll('tbody tr')).length;
        const firstRowCells = Array.from(table.querySelectorAll('tbody tr:first-child td')).map(td => td.innerText.trim().replace(/\\n/g, ' '));
        const firstRowHasCb = !!table.querySelector('tbody tr:first-child td:first-child input[type="checkbox"]');
        const hasAvatars = !!table.querySelector('.tms-student-avatar');
        const hasIdBadges = !!table.querySelector('.tms-id-badge');
        const hasStatusPills = !!table.querySelector('.tms-status-pill');
        const actionBtns = Array.from(table.querySelectorAll('tbody tr:first-child .tms-table-action-btn')).length;
        
        return {
          headers,
          firstThHasCb,
          firstRowHasCb,
          rows,
          firstRowCells,
          hasAvatars,
          hasIdBadges,
          hasStatusPills,
          actionBtns
        };
      })()`,
      returnByValue: true
    });
    console.log('Table verification:', JSON.stringify(tableInfo.result.value, null, 2));

    // Capture Table Screenshot
    const tableScreenshot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'dataview-table-preview.png'), Buffer.from(tableScreenshot.data, 'base64'));
    console.log('Saved dataview-table-preview.png');

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
        const modal = document.querySelector('.modal-container, .tms-modal, [class*="modal"]');
        if (!modal) return { error: 'No modal found' };
        const title = document.querySelector('.modal-title, h3, h4')?.innerText;
        const hasPhotoBox = !!document.querySelector('#ed-photo-box');
        const hasDatePicker = !!document.querySelector('#ed-dob');
        const customDropdowns = document.querySelectorAll('.tms-custom-dropdown').length;
        const customDatePickers = document.querySelectorAll('.tms-custom-datepicker').length;
        return { title, hasPhotoBox, hasDatePicker, customDropdowns, customDatePickers };
      })()`,
      returnByValue: true
    });
    console.log('Edit Modal verification:', JSON.stringify(editModalInfo.result.value, null, 2));

    const editScreenshot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'dataview-edit-modal-preview.png'), Buffer.from(editScreenshot.data, 'base64'));
    console.log('Saved dataview-edit-modal-preview.png');

    // Close modal
    await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const cancelBtn = document.querySelector('#ed-cancel, .modal-close');
        if (cancelBtn) cancelBtn.click();
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
        const modal = document.querySelector('.modal-container, .tms-modal, [class*="modal"]');
        if (!modal) return { error: 'No modal found' };
        const title = document.querySelector('.modal-title, h3, h4')?.innerText;
        const text = modal.innerText;
        const hasParent = text.includes('PARENT & GUARDIAN');
        const hasNative = text.includes('NATIVE ADDRESS');
        const hasEditBtn = !!document.querySelector('#btn-modal-edit-student');
        const hasDelBtn = !!document.querySelector('#btn-modal-del-student');
        return { title, hasParent, hasNative, hasEditBtn, hasDelBtn };
      })()`,
      returnByValue: true
    });
    console.log('Profile Modal verification:', JSON.stringify(profileModalInfo.result.value, null, 2));

    const profileScreenshot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'dataview-profile-modal-preview.png'), Buffer.from(profileScreenshot.data, 'base64'));
    console.log('Saved dataview-profile-modal-preview.png');

    console.log('All verification and screenshots completed successfully!');

    pageClient.close();
    browserClient.close();
    edgeProc.kill();
  } catch (err) {
    console.error('Test error:', err);
    edgeProc.kill();
  }
}

run();
