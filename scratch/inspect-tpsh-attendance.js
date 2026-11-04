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

async function inspectTarget() {
  const CDP_PORT = 9340;
  const profileDir = path.join(artifactDir, 'scratch', 'edge-profile-tpsh-att');
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

    console.log('Navigating to https://tpsh.vercel.app/#attendance ...');
    await pageClient.send('Page.navigate', { url: 'https://tpsh.vercel.app/#attendance' });
    await wait(4000);

    // Capture screenshot
    const shot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'tpsh-attendance-preview.png'), Buffer.from(shot.data, 'base64'));
    console.log('Saved tpsh-attendance-preview.png');

    // Inspect DOM & text content
    const pageData = await pageClient.send('Runtime.evaluate', {
      expression: `(() => {
        const title = document.title;
        const hash = window.location.hash;
        const main = document.querySelector('main, #app, #root, body');
        
        // Find attendance containers
        const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => h.innerText.trim());
        const buttons = Array.from(document.querySelectorAll('button, .btn, a.btn')).map(b => b.innerText.trim()).filter(Boolean);
        const tabs = Array.from(document.querySelectorAll('[role="tab"], .tab, .nav-tabs li, .view-btn')).map(t => t.innerText.trim()).filter(Boolean);
        const kpis = Array.from(document.querySelectorAll('.kpi-card, .stat-card, [class*="kpi"], [class*="stat"], [class*="card"]')).map(k => k.innerText.trim().replace(/\\s+/g, ' ')).slice(0, 10);
        
        // Grab innerHTML of the attendance section or main container
        const attContainer = document.querySelector('#attendance, [data-module="attendance"], main') || document.body;
        
        return {
          title,
          hash,
          headers,
          buttons: buttons.slice(0, 25),
          tabs,
          kpis,
          htmlSnippet: attContainer.innerHTML.slice(0, 5000),
          fullText: document.body.innerText.slice(0, 2500)
        };
      })()`,
      returnByValue: true
    });

    console.log('Page Data:', JSON.stringify({
      title: pageData.result?.value?.title,
      hash: pageData.result?.value?.hash,
      headers: pageData.result?.value?.headers,
      buttons: pageData.result?.value?.buttons,
      tabs: pageData.result?.value?.tabs,
      kpis: pageData.result?.value?.kpis,
      fullText: pageData.result?.value?.fullText
    }, null, 2));

    fs.writeFileSync(path.join(artifactDir, 'scratch', 'tpsh-attendance-data.json'), JSON.stringify(pageData.result?.value, null, 2));

    pageClient.close();
    browserClient.close();
    edgeProc.kill();
  } catch (err) {
    console.error('Error:', err);
    edgeProc.kill();
  }
}

inspectTarget();
