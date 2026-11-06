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

  // Create standalone HTML harness that imports calendar-module and renders it into #app
  const harnessHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TMS Academic Calendar Preview</title>
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
  <div id="calendar-container"></div>

  <script type="module">
    import { CalendarModule } from '../calendar-module.js';
    import { UIComponents } from '../ui-components.js';

    // Seed mock data for preview
    const sampleHolidays = [
      { id: 'h1', name: 'Diwali Institutional Break', type: 'holiday', date: '2026-11-08', is_all_day: true },
      { id: 'h2', name: 'Diwali Institutional Break', type: 'holiday', date: '2026-11-09', is_all_day: true },
      { id: 'h3', name: 'Diwali Institutional Break', type: 'holiday', date: '2026-11-10', is_all_day: true },
      { id: 'h4', name: 'Mid-Term Board Examinations', type: 'exam', date: '2026-11-18', is_all_day: true },
      { id: 'h5', name: 'Mid-Term Board Examinations', type: 'exam', date: '2026-11-19', is_all_day: true },
      { id: 'h6', name: 'Mid-Term Board Examinations', type: 'exam', date: '2026-11-20', is_all_day: true },
      { id: 'h7', name: 'Guru Nanak Jayanti', type: 'holiday', date: '2026-11-24', is_all_day: true }
    ];
    localStorage.setItem('tms_calendar_holidays', JSON.stringify(sampleHolidays));

    const container = document.getElementById('calendar-container');
    CalendarModule._currentDate = new Date(2026, 10, 6); // Nov 6, 2026
    await CalendarModule.render(container);
    window.__CALENDAR_RENDERED__ = true;
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'calendar-preview.html'), harnessHtml);

  const CDP_PORT = 9402;
  const profileDir = path.join(artifactDir, 'scratch', 'edge-cal-preview-run');
  const edgeProc = spawn(edgePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profileDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1100',
    'about:blank'
  ]);

  try {
    const wsUrl = await getWsUrl(CDP_PORT);
    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    console.log('Navigating to http://localhost:3000/scratch/calendar-preview.html ...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/scratch/calendar-preview.html' });
    await wait(2000);

    // Evaluate layout metrics
    const evalRes = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const weekdayHeader = document.querySelector('.cal-weekday-header');
        const monthGrid = document.querySelector('.cal-month-grid');
        const topGrid = document.querySelector('.cal-top-grid');
        const mainGrid = document.querySelector('.cal-main-grid');
        const metricsGrid = document.querySelector('.cal-metrics-grid');
        const todayCard = document.querySelector('.cal-today-card');
        const pageHeader = document.querySelector('.tms-page-header');

        return {
          hasPageHeader: !!pageHeader,
          pageHeaderTitle: pageHeader?.querySelector('.tms-page-title')?.innerText.trim(),
          topGridCols: topGrid ? window.getComputedStyle(topGrid).gridTemplateColumns : null,
          metricsGridCols: metricsGrid ? window.getComputedStyle(metricsGrid).gridTemplateColumns : null,
          mainGridCols: mainGrid ? window.getComputedStyle(mainGrid).gridTemplateColumns : null,
          weekdayGridCols: weekdayHeader ? window.getComputedStyle(weekdayHeader).gridTemplateColumns : null,
          monthGridCols: monthGrid ? window.getComputedStyle(monthGrid).gridTemplateColumns : null,
          todayCardBg: todayCard ? window.getComputedStyle(todayCard).backgroundImage : null,
          totalDayCells: document.querySelectorAll('.cal-inst-day-cell, .cal-pad-cell').length,
          agendaCount: document.querySelectorAll('.cal-agenda-card-box .btn-edit-cal-event').length
        };
      })()`,
      returnByValue: true
    });

    console.log('Calendar Evaluation Results:', JSON.stringify(evalRes.result.value, null, 2));

    const shot = await client.send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(artifactDir, 'calendar-fixed-preview.png');
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved calendar-fixed-preview.png successfully!');

    client.close();
  } finally {
    edgeProc.kill();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
