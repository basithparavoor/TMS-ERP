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

  const harnessHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TMS Users Table Preview</title>
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
  <div id="users-tab-content"></div>

  <script type="module">
    import { AdminModule } from '../admin-module.js';
    import { authService } from '../auth-service.js';
    import { dbService } from '../supabase-client.js';

    // Mock Super Admin user & profile
    const mockUser = {
      id: 'super-admin-basith',
      name: 'C. M. Basith',
      email: 'cmbasith786@gmail.com',
      role: 'super_admin',
      isSuperAdmin: true,
      title: 'Executive Director & Super Admin',
      department: 'Executive Governance & Leadership',
      avatar: '../icons/tms-logo.png'
    };

    authService.currentUser = mockUser;

    // Mock dbService.select('profiles')
    const origSelect = dbService.select.bind(dbService);
    dbService.select = async (table) => {
      if (table === 'profiles') {
        return [
          {
            id: 'super-admin-basith',
            name: 'C. M. Basith',
            email: 'cmbasith786@gmail.com',
            role: 'super_admin',
            title: 'Executive Director & Super Admin',
            department: 'Executive Governance & Leadership',
            phone: '+91 98470 55667',
            isActive: true,
            avatar: '../icons/tms-logo.png'
          },
          {
            id: 'teacher-mubashir',
            name: 'Muhammad Mubashir',
            email: 'mubashir@tms.edu',
            role: 'teacher',
            assignedClass: 'Grade 9A',
            assignedSection: 'A',
            phone: '+91 98470 12345',
            isActive: true,
            avatar: ''
          }
        ];
      }
      if (table === 'staff_credentials') {
        return [
          {
            userId: 'teacher-mubashir',
            username: 'mubashir.tms',
            password: '••••••••'
          }
        ];
      }
      return [];
    };

    const container = document.getElementById('users-tab-content');
    await AdminModule.renderUsersTab(container);
    window.__USERS_RENDERED__ = true;
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'users-table-preview.html'), harnessHtml);

  const CDP_PORT = 9405;
  const profileDir = path.join(artifactDir, 'scratch', 'edge-users-preview');
  const edgeProc = spawn(edgePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profileDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1400,900',
    'about:blank'
  ]);

  try {
    const wsUrl = await getWsUrl(CDP_PORT);
    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    console.log('Navigating to http://localhost:3000/scratch/users-table-preview.html ...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/scratch/users-table-preview.html' });
    await wait(1800);

    const shot = await client.send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(artifactDir, 'users-table-fixed-preview.png');
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved users-table-fixed-preview.png');

    client.close();
  } finally {
    edgeProc.kill();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
