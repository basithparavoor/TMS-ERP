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
  close() { this.ws.close(); }
}

async function run() {
  const CDP_PORT = 9380;
  const profileDir = path.join(artifactDir, 'scratch', 'edge-header-profile-2');
  const edgeProc = spawn(edgePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profileDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    'about:blank'
  ]);

  try {
    const wsUrl = await getWsUrl(CDP_PORT);
    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    console.log('Navigating to http://localhost:3000/dashboard.html ...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard.html' });
    await wait(2000);

    // Mount Staff Workspace
    await client.send('Runtime.evaluate', {
      expression: `(async () => {
        const { MyWorkModule } = await import('./my-work-module.js');
        const root = document.getElementById('app-root') || document.body;
        root.innerHTML = '';
        const viewport = document.createElement('div');
        viewport.id = 'main-viewport';
        viewport.style.padding = '24px 32px';
        viewport.style.backgroundColor = '#F8FAFC';
        viewport.style.minHeight = '100vh';
        root.appendChild(viewport);
        await MyWorkModule.render(viewport);
      })()`,
      awaitPromise: true
    });
    await wait(1200);

    const evalRes = await client.send('Runtime.evaluate', {
      expression: `
        (function() {
          const header = document.querySelector('.tms-page-header');
          if (!header) return { error: 'No .tms-page-header found' };

          const icon = header.querySelector('.tms-page-header-icon');
          const title = header.querySelector('.tms-page-title');
          const subtitle = header.querySelector('.tms-page-subtitle');
          const crumbs = Array.from(header.querySelectorAll('.tms-breadcrumbs-list li')).map(li => li.innerText.trim());

          return {
            found: true,
            title: title ? title.textContent.trim() : null,
            subtitle: subtitle ? subtitle.textContent.trim() : null,
            hasIcon: !!icon,
            crumbs,
            headerStyle: {
              background: window.getComputedStyle(header).backgroundColor,
              borderRadius: window.getComputedStyle(header).borderRadius,
              padding: window.getComputedStyle(header).padding,
              boxShadow: window.getComputedStyle(header).boxShadow
            }
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Header Audit Result:', JSON.stringify(evalRes.result.value, null, 2));

    const shot = await client.send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(artifactDir, 'improved-page-header-preview.png');
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved improved-page-header-preview.png');

    // Also mount Admissions Entry
    await client.send('Runtime.evaluate', {
      expression: `(async () => {
        const { AdmissionsEntryModule } = await import('./admissions-entry-module.js');
        const viewport = document.getElementById('main-viewport');
        viewport.innerHTML = '';
        await AdmissionsEntryModule.render(viewport);
      })()`,
      awaitPromise: true
    });
    await wait(1200);

    const shot2 = await client.send('Page.captureScreenshot', { format: 'png' });
    const shotPath2 = path.join(artifactDir, 'admissions-entry-header-preview.png');
    fs.writeFileSync(shotPath2, Buffer.from(shot2.data, 'base64'));
    console.log('Saved admissions-entry-header-preview.png');

    client.close();
  } finally {
    edgeProc.kill();
  }
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
