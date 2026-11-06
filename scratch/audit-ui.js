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

async function inspectRoute(client, route, name, isMobile = false) {
  await client.send('Page.navigate', { url: `http://localhost:3000/dashboard#${route}` });
  await wait(1800);

  // Evaluate metrics on the page
  const evalRes = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const hasHorizontalScroll = docW > winW + 2;

      // Find overflowing elements
      const overflowingElements = [];
      document.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.right > winW + 2 && el.offsetWidth > 0) {
          overflowingElements.push({
            tag: el.tagName,
            cls: el.className,
            id: el.id,
            right: Math.round(r.right),
            width: Math.round(r.width)
          });
        }
      });

      // Small touch targets (< 36px)
      const smallButtons = [];
      if (${isMobile}) {
        document.querySelectorAll('button, a.btn, .tms-tab-pill, .nav-item').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0 && (r.width < 34 || r.height < 34)) {
            smallButtons.push({
              tag: el.tagName,
              text: el.innerText.trim().slice(0, 20),
              w: Math.round(r.width),
              h: Math.round(r.height)
            });
          }
        });
      }

      return {
        docW, winW, docH, winH,
        hasHorizontalScroll,
        overflowCount: overflowingElements.length,
        topOverflows: overflowingElements.slice(0, 4),
        smallButtonsCount: smallButtons.length,
        topSmallButtons: smallButtons.slice(0, 4)
      };
    })()`,
    returnByValue: true
  });

  const screenshot = await client.send('Page.captureScreenshot', { format: 'png' });
  const filename = `${name}-${isMobile ? 'mobile' : 'desktop'}.png`;
  fs.writeFileSync(path.join(artifactDir, filename), Buffer.from(screenshot.data, 'base64'));

  return { name, isMobile, metrics: evalRes.result?.value, filename };
}

async function audit() {
  const routes = [
    { route: '/dashboard', name: 'overview' },
    { route: '/my-work', name: 'staff-workspace' },
    { route: '/students', name: 'students' },
    { route: '/attendance', name: 'attendance' },
    { route: '/id-cards', name: 'id-cards' },
    { route: '/timetable', name: 'timetable' },
    { route: '/calendar', name: 'calendar' },
    { route: '/examinations', name: 'examinations' },
    { route: '/administration', name: 'administration' },
    { route: '/finance', name: 'finance' }
  ];

  // 1. Desktop Audit (1280x850)
  console.log('--- STARTING DESKTOP AUDIT (1280x850) ---');
  const desktopPort = 9336;
  const desktopProc = spawn(edgePath, [
    `--remote-debugging-port=${desktopPort}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,850',
    'http://localhost:3000/dashboard'
  ]);

  const desktopResults = [];
  try {
    const wsUrl = await getWsUrl(desktopPort);
    const client = new CDPClient(wsUrl);
    await client.connect();
    await client.send('Page.enable');
    await wait(2000);

    // Mock authenticated user in localStorage
    await client.send('Runtime.evaluate', {
      expression: `localStorage.setItem('tms_user', JSON.stringify({
        id: 'super-admin-basith',
        name: 'C. M. Basith',
        email: 'cmbasith786@gmail.com',
        role: 'super_admin',
        isSuperAdmin: true,
        title: 'Executive Director & Super Admin',
        department: 'Executive Governance'
      }));`
    });

    for (const r of routes) {
      const res = await inspectRoute(client, r.route, r.name, false);
      desktopResults.push(res);
      console.log(`[DESKTOP] ${r.name}: overflow=${res.metrics?.hasHorizontalScroll} (docW=${res.metrics?.docW}, winW=${res.metrics?.winW})`);
    }
    client.close();
  } catch (e) {
    console.error('Desktop audit failed:', e);
  } finally {
    desktopProc.kill();
  }

  // 2. Mobile Audit (375x812 iPhone / Standard Smartphone)
  console.log('\n--- STARTING MOBILE AUDIT (375x812) ---');
  const mobilePort = 9337;
  const mobileProc = spawn(edgePath, [
    `--remote-debugging-port=${mobilePort}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=375,812',
    'http://localhost:3000/dashboard'
  ]);

  const mobileResults = [];
  try {
    const wsUrl = await getWsUrl(mobilePort);
    const client = new CDPClient(wsUrl);
    await client.connect();
    await client.send('Page.enable');
    await wait(2000);

    await client.send('Runtime.evaluate', {
      expression: `localStorage.setItem('tms_user', JSON.stringify({
        id: 'super-admin-basith',
        name: 'C. M. Basith',
        email: 'cmbasith786@gmail.com',
        role: 'super_admin',
        isSuperAdmin: true,
        title: 'Executive Director & Super Admin',
        department: 'Executive Governance'
      }));`
    });

    for (const r of routes) {
      const res = await inspectRoute(client, r.route, r.name, true);
      mobileResults.push(res);
      console.log(`[MOBILE] ${r.name}: overflow=${res.metrics?.hasHorizontalScroll} (docW=${res.metrics?.docW}, winW=${res.metrics?.winW}), smallBtns=${res.metrics?.smallButtonsCount}`);
      if (res.metrics?.overflowCount > 0) {
        console.log('   Overflown tags:', res.metrics?.topOverflows.map(o => `${o.tag}.${o.cls || ''} (w=${o.width})`));
      }
    }
    client.close();
  } catch (e) {
    console.error('Mobile audit failed:', e);
  } finally {
    mobileProc.kill();
  }

  fs.writeFileSync('scratch/audit-results.json', JSON.stringify({ desktopResults, mobileResults }, null, 2));
  console.log('\nAudit complete! Results saved to scratch/audit-results.json');
}

audit();
