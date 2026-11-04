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
  const CDP_PORT = 9322;
  const profileDir = path.join(artifactDir, 'scratch', 'edge-profile-dataview-test');
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

    // Step 1: Crop avatars from reference images
    console.log('Extracting student photos from reference image...');
    const refTablePath = path.join(artifactDir, 'dataview-ref-table.png');
    const refEditPath = path.join(artifactDir, 'dataview-ref-edit-modal.png');
    const tableB64 = fs.readFileSync(refTablePath).toString('base64');
    const editB64 = fs.readFileSync(refEditPath).toString('base64');

    const evalScript = `(async () => {
      const loadImage = (b64) => new Promise(res => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = 'data:image/png;base64,' + b64;
      });

      const tableImg = await loadImage('${tableB64}');
      const editImg = await loadImage('${editB64}');

      const W = tableImg.naturalWidth;
      const H = tableImg.naturalHeight;
      const eW = editImg.naturalWidth;
      const eH = editImg.naturalHeight;

      // Crop passport photo from editImg (MD Aamir)
      const pCanvas = document.createElement('canvas');
      const pX = Math.round(eW * 0.065);
      const pY = Math.round(eH * 0.175);
      const pBoxW = Math.round(eW * 0.103);
      const pBoxH = Math.round(eH * 0.147);
      pCanvas.width = pBoxW;
      pCanvas.height = pBoxH;
      const pCtx = pCanvas.getContext('2d');
      pCtx.drawImage(editImg, pX, pY, pBoxW, pBoxH, 0, 0, pBoxW, pBoxH);
      const passportB64 = pCanvas.toDataURL('image/png').replace(/^data:image\\/png;base64,/, '');

      // Crop 6 avatars from tableImg
      const avatars = [];
      const tCanvas = document.createElement('canvas');
      tCanvas.width = W;
      tCanvas.height = H;
      const tCtx = tCanvas.getContext('2d');
      tCtx.drawImage(tableImg, 0, 0);

      const aX = Math.round(W * 0.0385);
      const aDiam = Math.round(W * 0.0245);
      const rowStep = (H * 0.502) / 5;
      const rowStart = H * 0.435;

      for (let i = 0; i < 6; i++) {
        const curY = Math.round(rowStart + (i * rowStep));
        const aCanvas = document.createElement('canvas');
        aCanvas.width = aDiam;
        aCanvas.height = aDiam;
        const aCtx = aCanvas.getContext('2d');
        aCtx.drawImage(tableImg, aX, curY, aDiam, aDiam, 0, 0, aDiam, aDiam);
        avatars.push(aCanvas.toDataURL('image/png').replace(/^data:image\\/png;base64,/, ''));
      }

      return { W, H, eW, eH, passportB64, avatars };
    })()`;

    const cropRes = await pageClient.send('Runtime.evaluate', {
      expression: evalScript,
      awaitPromise: true,
      returnByValue: true
    });

    if (cropRes && cropRes.result && cropRes.result.value) {
      const val = cropRes.result.value;
      if (!fs.existsSync('assets/avatars')) fs.mkdirSync('assets/avatars', { recursive: true });
      fs.writeFileSync('assets/avatars/std-1-passport.png', Buffer.from(val.passportB64, 'base64'));
      for (let i = 0; i < val.avatars.length; i++) {
        fs.writeFileSync(`assets/avatars/std-${i+1}.png`, Buffer.from(val.avatars[i], 'base64'));
      }
      console.log('Saved 6 student avatars and passport photo!');
    }

    // Step 2: Set viewport to desktop 1440x900
    await pageClient.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    // Step 3: Navigate to ERP
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
    await wait(2000);

    // Navigate to student module
    console.log('Navigating to Student Directory...');
    await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        window.location.hash = '#students';
        if (window.Router && window.Router.navigate) window.Router.navigate('students');
      })()`
    });
    await wait(2500);

    // Ensure table view is visible
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
        if (!table) return { error: 'No table found' };
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

    // Step 4: Click Edit Student on first row
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

    // Step 5: Click View Student Profile on first row
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
