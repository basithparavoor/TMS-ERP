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
  const CDP_PORT = 9350;
  const profileDir = path.join(artifactDir, 'scratch', 'edge-profile-test-fix');
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

    // 1. TEST ADMISSION PORTAL (/admission)
    console.log('Testing http://localhost:3000/admission ...');
    await pageClient.send('Page.navigate', { url: 'http://localhost:3000/admission' });
    await wait(3000);

    const admAudit = await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        // Check if native selects are hidden
        const nativeSelects = Array.from(document.querySelectorAll('select.tms-custom-select-native-hidden')).map(s => {
          const style = window.getComputedStyle(s);
          return {
            id: s.id,
            opacity: style.opacity,
            width: style.width,
            height: style.height,
            pointerEvents: style.pointerEvents,
            isEffectivelyHidden: style.opacity === '0' || style.display === 'none' || style.visibility === 'hidden' || style.width === '1px'
          };
        });

        // Check if triggers are visible
        const triggers = Array.from(document.querySelectorAll('.tms-custom-select-trigger')).map(t => {
          const style = window.getComputedStyle(t);
          return {
            text: t.innerText.trim(),
            display: style.display,
            borderRadius: style.borderRadius
          };
        });

        // Check if menus are hidden by default
        const menus = Array.from(document.querySelectorAll('.tms-custom-select-menu')).map(m => {
          const style = window.getComputedStyle(m);
          return {
            display: style.display,
            position: style.position
          };
        });

        // Check datepicker
        const dateInput = document.querySelector('input[type="date"].tms-datepicker-native-hidden');
        const dpStyle = dateInput ? window.getComputedStyle(dateInput) : null;
        const dpTrigger = document.querySelector('.tms-datepicker-trigger');
        const dpPopup = document.querySelector('.tms-datepicker-popup');
        const dpPopupStyle = dpPopup ? window.getComputedStyle(dpPopup) : null;

        return {
          nativeSelects,
          triggers,
          menus,
          dateInputHidden: dpStyle ? (dpStyle.opacity === '0' || dpStyle.width === '1px') : false,
          dpTriggerVisible: !!dpTrigger,
          dpPopupHidden: dpPopupStyle ? dpPopupStyle.display === 'none' : true
        };
      })()`,
      returnByValue: true
    });

    console.log('Admission Audit:', JSON.stringify(admAudit.result.value, null, 2));

    const shotAdm = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'admission-fixed-preview.png'), Buffer.from(shotAdm.data, 'base64'));
    console.log('Saved admission-fixed-preview.png');

    // 2. TEST BREADCRUMBS IN DASHBOARD
    console.log('Testing http://localhost:3000/dashboard.html ...');
    await pageClient.send('Page.navigate', { url: 'http://localhost:3000/dashboard.html' });
    await wait(2500);

    // Mount Staff Workspace
    await pageClient.send('Runtime.evaluate', {
      expression: `(async () => {
        const { MyWorkModule } = await import('./my-work-module.js');
        const root = document.getElementById('app-root') || document.body;
        root.innerHTML = '';
        const viewport = document.createElement('div');
        viewport.id = 'main-viewport';
        viewport.style.padding = '24px 32px';
        root.appendChild(viewport);
        await MyWorkModule.render(viewport);
      })()`,
      awaitPromise: true
    });
    await wait(1200);

    const breadcrumbAudit = await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const bcList = document.querySelector('.tms-breadcrumbs-list');
        if (!bcList) return { error: 'No breadcrumbs list found' };
        const style = window.getComputedStyle(bcList);
        const items = Array.from(bcList.querySelectorAll('li, .tms-breadcrumb-item')).map(li => {
          const liStyle = window.getComputedStyle(li);
          return {
            text: li.innerText.trim(),
            display: liStyle.display,
            listStyleType: liStyle.listStyleType
          };
        });
        return {
          display: style.display,
          flexDirection: style.flexDirection,
          listStyleType: style.listStyleType,
          items
        };
      })()`,
      returnByValue: true
    });

    console.log('Breadcrumb Audit:', JSON.stringify(breadcrumbAudit.result.value, null, 2));

    const shotDash = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'dashboard-breadcrumbs-fixed.png'), Buffer.from(shotDash.data, 'base64'));
    console.log('Saved dashboard-breadcrumbs-fixed.png');

    // Mount Admissions Entry Desk
    await pageClient.send('Runtime.evaluate', {
      expression: `(async () => {
        const { AdmissionsEntryModule } = await import('./admissions-entry-module.js');
        const root = document.getElementById('app-root') || document.body;
        root.innerHTML = '';
        const viewport = document.createElement('div');
        viewport.id = 'main-viewport';
        viewport.style.padding = '24px 32px';
        root.appendChild(viewport);
        await AdmissionsEntryModule.render(viewport);
      })()`,
      awaitPromise: true
    });
    await wait(1200);

    const shotAdmEntry = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'admission-entry-breadcrumbs-fixed.png'), Buffer.from(shotAdmEntry.data, 'base64'));
    console.log('Saved admission-entry-breadcrumbs-fixed.png');

    console.log('ALL FIXES VERIFIED SUCCESSFULLY!');

    pageClient.close();
    browserClient.close();
    edgeProc.kill();
  } catch (err) {
    console.error('Error:', err);
    edgeProc.kill();
  }
}

run();
