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
  const appCss = fs.readFileSync('app.css', 'utf8');

  // Create mock harness that renders examination module and dropdown enhancer
  const harnessHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TMS Examination Module Dropdown Test</title>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    ${appCss}
    body {
      background: #F8FAFC;
      margin: 0;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
  </style>
</head>
<body>
  <div id="app-viewport"></div>

  <script type="module">
    import { ExaminationModule } from '../examination-module.js';
    import { enhanceAllSelects } from '../dropdown-enhancer.js';

    // Mock students and assessments
    ExaminationModule._students = [
      { id: 's1', fullName: 'Aarav Sharma', admissionNo: 'TMS-2026-001', grade: 'Nursery', section: 'A' },
      { id: 's2', fullName: 'Fatima Zohra', admissionNo: 'TMS-2026-002', grade: 'Nursery', section: 'A' }
    ];
    ExaminationModule._assessments = [];
    ExaminationModule._selectedGrade = 'Nursery';
    ExaminationModule._selectedSection = 'all';
    ExaminationModule._selectedTerm = 'Term 1 Exam';
    ExaminationModule._examViewTab = 'admit'; // same tab as in user screenshot!

    const viewport = document.getElementById('app-viewport');
    await ExaminationModule.render(viewport);
    enhanceAllSelects(viewport);

    // Click the Examination Term dropdown trigger
    setTimeout(() => {
      const termSelectWrapper = document.querySelector('[data-for-id="exam-filter-term"]');
      if (termSelectWrapper) {
        const trigger = termSelectWrapper.querySelector('.tms-custom-select-trigger');
        if (trigger) trigger.click();
      }
      window.__DROPDOWN_OPENED__ = true;
    }, 400);
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'exam-dropdown-test.html'), harnessHtml);

  const CDP_PORT = 9403;
  const profileDir = path.join(artifactDir, 'scratch', 'edge-exam-dd-test');
  const edgeProc = spawn(edgePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profileDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1200,1200',
    'about:blank'
  ]);

  try {
    const wsUrl = await getWsUrl(CDP_PORT);
    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    console.log('Navigating to http://localhost:3000/scratch/exam-dropdown-test.html ...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/scratch/exam-dropdown-test.html' });
    await wait(1800);

    const shot = await client.send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(artifactDir, 'exam-dropdown-repro.png');
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved exam-dropdown-repro.png');

    client.close();
  } finally {
    edgeProc.kill();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
