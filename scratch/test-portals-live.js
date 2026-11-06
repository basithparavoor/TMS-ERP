const path = require('path');
const fs = require('fs');

(async () => {
  const p = 9367;
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
    'http://localhost:3000/index.html'
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

  // We are on http://localhost:3000/index.html origin! Set auth session for student
  console.log('Setting student auth session...');
  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('tms_auth_session', JSON.stringify({
        id: 'std-5',
        name: 'Sultana Sarkar',
        email: 'sultana@tms.edu',
        role: 'student'
      }));
    `
  });

  // Navigate to student.html
  console.log('Navigating to student.html...');
  await send('Page.navigate', { url: 'http://localhost:3000/student.html' });
  await new Promise(r => setTimeout(r, 3000));

  const studentCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const title = document.querySelector('.card-title')?.innerText || '';
      const leaveRows = document.querySelector('#portal-leave-rows')?.innerText || '';
      const hasApplyBtn = document.querySelector('#btn-portal-apply-leave') !== null;
      return { url: window.location.href, title, hasApplyBtn, leaveRowsSnippet: leaveRows.slice(0, 160) };
    })()`,
    returnByValue: true
  });
  console.log('Student Portal Check:', studentCheck.result.value);

  const { data: shot4 } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'student-leave-4-student-portal.png'), Buffer.from(shot4, 'base64'));
  console.log('Saved student-leave-4-student-portal.png');

  // Open apply modal
  console.log('Opening Apply Leave Modal...');
  await send('Runtime.evaluate', {
    expression: `document.querySelector('#btn-portal-apply-leave')?.click()`
  });
  await new Promise(r => setTimeout(r, 1000));

  const { data: shot5 } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'student-leave-5-student-apply-modal.png'), Buffer.from(shot5, 'base64'));
  console.log('Saved student-leave-5-student-apply-modal.png');

  // Now test Parent Portal on the same origin
  console.log('Setting parent auth session...');
  await send('Runtime.evaluate', {
    expression: `
      document.getElementById('global-modal-close')?.click();
      localStorage.setItem('tms_auth_session', JSON.stringify({
        id: 'usr-parent-1',
        name: 'Golam Kibria',
        email: 'golam.kibria@example.com',
        phone: '9800880620',
        role: 'parent'
      }));
    `
  });

  console.log('Navigating to parent.html...');
  await send('Page.navigate', { url: 'http://localhost:3000/parent.html' });
  await new Promise(r => setTimeout(r, 3000));

  const parentCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const title = document.querySelector('.card-title')?.innerText || '';
      const container = document.querySelector('#parent-leaves-container')?.innerText || '';
      const hasApplyBtn = document.querySelector('#btn-parent-apply-leave') !== null;
      return { url: window.location.href, title, hasApplyBtn, containerSnippet: container.slice(0, 160) };
    })()`,
    returnByValue: true
  });
  console.log('Parent Portal Check:', parentCheck.result.value);

  const { data: shot6 } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'student-leave-6-parent-portal.png'), Buffer.from(shot6, 'base64'));
  console.log('Saved student-leave-6-parent-portal.png');

  // Open apply modal in parent portal
  console.log('Opening Apply Leave for Ward Modal...');
  await send('Runtime.evaluate', {
    expression: `document.querySelector('#btn-parent-apply-leave')?.click()`
  });
  await new Promise(r => setTimeout(r, 1000));

  const { data: shot7 } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'student-leave-7-parent-apply-modal.png'), Buffer.from(shot7, 'base64'));
  console.log('Saved student-leave-7-parent-apply-modal.png');

  ws.close();
  proc.kill();
  console.log('All portal tests successfully executed!');
})();
