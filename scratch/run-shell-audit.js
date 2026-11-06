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
  close() {
    try { this.ws.close(); } catch (e) {}
  }
}

async function audit() {
  const modules = ['dashboard', 'my-work', 'students', 'attendance', 'calendar', 'examinations', 'administration'];

  // Test Mobile (375x812)
  console.log('Testing Mobile (375x812)...');
  const port = 9340;
  const proc = spawn(edgePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=375,812',
    'http://localhost:3000/scratch/audit-shell.html'
  ]);

  const auditReport = { mobile: [], desktop: [] };

  try {
    const wsUrl = await getWsUrl(port);
    const client = new CDPClient(wsUrl);
    await client.connect();
    await client.send('Page.enable');
    await wait(1500);

    for (const mod of modules) {
      await client.send('Runtime.evaluate', { expression: `window.renderModule('${mod}')` });
      await wait(1800);

      const metrics = await client.send('Runtime.evaluate', {
        expression: `(() => {
          const docW = document.documentElement.scrollWidth;
          const winW = window.innerWidth;
          const overflows = [];
          document.querySelectorAll('*').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.right > winW + 2 && el.offsetWidth > 0) {
              overflows.push({ tag: el.tagName, cls: el.className, w: Math.round(r.width), right: Math.round(r.right) });
            }
          });
          return { docW, winW, hasOverflow: docW > winW + 2, overflows: overflows.slice(0, 5) };
        })()`,
        returnByValue: true
      });

      const shot = await client.send('Page.captureScreenshot', { format: 'png' });
      const filename = `mobile-audit-${mod}.png`;
      fs.writeFileSync(path.join(artifactDir, filename), Buffer.from(shot.data, 'base64'));

      auditReport.mobile.push({ mod, metrics: metrics.result?.value, filename });
      console.log(`[MOBILE] ${mod}: overflow=${metrics.result?.value?.hasOverflow} (${metrics.result?.value?.overflows?.length} items)`);
    }

    // Now test Desktop on the same browser by resizing window
    console.log('\nTesting Desktop (1280x800)...');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 850,
      deviceScaleFactor: 1,
      mobile: false
    });
    await wait(1000);

    for (const mod of modules) {
      await client.send('Runtime.evaluate', { expression: `window.renderModule('${mod}')` });
      await wait(1500);

      const metrics = await client.send('Runtime.evaluate', {
        expression: `(() => {
          const docW = document.documentElement.scrollWidth;
          const winW = window.innerWidth;
          return { docW, winW, hasOverflow: docW > winW + 2 };
        })()`,
        returnByValue: true
      });

      const shot = await client.send('Page.captureScreenshot', { format: 'png' });
      const filename = `desktop-audit-${mod}.png`;
      fs.writeFileSync(path.join(artifactDir, filename), Buffer.from(shot.data, 'base64'));

      auditReport.desktop.push({ mod, metrics: metrics.result?.value, filename });
      console.log(`[DESKTOP] ${mod}: overflow=${metrics.result?.value?.hasOverflow}`);
    }

    client.close();
  } catch (err) {
    console.error('Audit error:', err);
  } finally {
    proc.kill();
  }

  fs.writeFileSync('scratch/full-audit-report.json', JSON.stringify(auditReport, null, 2));
  console.log('Saved scratch/full-audit-report.json');
}

audit();
