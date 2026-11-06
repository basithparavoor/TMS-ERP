const path = require('path');
const fs = require('fs');

(async () => {
  const p = 9365;
  const { spawn } = require('child_process');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(__dirname, 'edge-profile-test-portals');
  
  const proc = spawn(edgePath, [
    '--remote-debugging-port=' + p,
    '--user-data-dir=' + userDataDir,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--window-size=1440,950',
    'about:blank'
  ], { detached: true, stdio: 'ignore' });

  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch('http://127.0.0.1:' + p + '/json/version');
      if (res.ok) break;
    } catch(e) {}
    await new Promise(r => setTimeout(r, 200));
  }

  const list = await (await fetch('http://127.0.0.1:' + p + '/json/list')).json();
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (m, params = {}) => new Promise(res => {
    const curId = id++;
    const handler = (msg) => {
      const d = JSON.parse(msg.data);
      if (d.id === curId) { ws.removeEventListener('message', handler); res(d.result); }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method: m, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');
  const artifactDir = 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\4f9f4315-195b-4198-9946-776e8d487a3d';

  // Navigate to student.html with user in session
  await send('Runtime.evaluate', {
    expression: `(async () => {
      const user = { id: 'std-5', name: 'Sultana Sarkar', email: 'sultana@tms.edu', role: 'student' };
      localStorage.setItem('tms_auth_session', JSON.stringify(user));
    })()`,
    awaitPromise: true
  });

  await send('Page.navigate', { url: 'http://localhost:3000/student.html' });
  await new Promise(r => setTimeout(r, 3500));

  const text = await send('Runtime.evaluate', {
    expression: `document.querySelector('#portal-leave-rows')?.innerText`,
    returnByValue: true
  });
  console.log('Student Leave Rows:', text.result.value);

  const { data: shot4 } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'student-leave-4-student-portal.png'), Buffer.from(shot4, 'base64'));

  // Open modal
  await send('Runtime.evaluate', {
    expression: `document.querySelector('#btn-portal-apply-leave')?.click()`
  });
  await new Promise(r => setTimeout(r, 800));
  const { data: shot5 } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'student-leave-5-student-apply-modal.png'), Buffer.from(shot5, 'base64'));

  ws.close();
  proc.kill();
  console.log('Done!');
})();
