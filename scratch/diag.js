const path = require('path');
const fs = require('fs');

(async () => {
  const p = 9363;
  const { spawn } = require('child_process');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(__dirname, 'edge-profile-test-diag');
  
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
  
  console.log('Navigating to http://localhost:3000/index.html ...');
  await send('Page.navigate', { url: 'http://localhost:3000/index.html' });
  await new Promise(r => setTimeout(r, 2000));

  // Mount AttendanceModule and switch to register mode
  console.log('Mounting AttendanceModule...');
  const mountRes = await send('Runtime.evaluate', {
    expression: `(async () => {
      const { AttendanceModule } = await import('./attendance-module.js');
      const { authService } = await import('./auth-service.js');
      authService.currentUser = { id: 'usr-admin-1', name: 'Super Admin Faculty', role: 'admin' };
      
      const main = document.querySelector('main') || document.body;
      main.innerHTML = '<div id="att-wrapper"></div>';
      await AttendanceModule.render(document.getElementById('att-wrapper'));
      
      // Click register tab
      document.querySelector('button[data-mode="register"]')?.click();
      return { ok: true };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Mount res:', mountRes.result.value);

  await new Promise(r => setTimeout(r, 1200));

  const rowsRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('.reg-student-row')).map(r => {
        const name = r.querySelector('.tms-student-avatar')?.parentElement?.querySelector('div > div')?.innerText || '';
        const onLeave = r.innerText.includes('ON LEAVE');
        const btns = Array.from(r.querySelectorAll('.att-status-btn')).map(b => b.innerText);
        const hasMarkReturnedBtn = r.querySelector('.btn-mark-returned-reg') !== null;
        return { name, onLeave, btns, hasMarkReturnedBtn };
      });
      return rows;
    })()`,
    returnByValue: true
  });

  console.log('Register rows:', rowsRes.result.value);

  const artifactDir = 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\4f9f4315-195b-4198-9946-776e8d487a3d';
  const { data: shot1 } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'student-leave-1-attendance-ledger.png'), Buffer.from(shot1, 'base64'));
  console.log('Saved student-leave-1-attendance-ledger.png');

  // Open Leave Desk modal
  console.log('Opening Leave Desk Modal...');
  await send('Runtime.evaluate', {
    expression: `document.querySelector('#btn-open-leave-desk')?.click()`
  });
  await new Promise(r => setTimeout(r, 1000));

  const { data: shot2 } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'student-leave-2-desk-modal.png'), Buffer.from(shot2, 'base64'));
  console.log('Saved student-leave-2-desk-modal.png');

  // Close modal
  await send('Runtime.evaluate', {
    expression: `document.getElementById('global-modal-close')?.click()`
  });
  await new Promise(r => setTimeout(r, 500));

  // Mark Sultana as Returned
  console.log('Marking Sultana as Returned directly from Ledger...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const rows = document.querySelectorAll('.reg-student-row');
      for (const r of rows) {
        if (r.textContent.includes('Sultana Sarkar')) {
          const btn = r.querySelector('.btn-mark-returned-reg');
          if (btn) btn.click();
          break;
        }
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  const rowsRes2 = await send('Runtime.evaluate', {
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('.reg-student-row')).map(r => {
        const name = r.querySelector('.tms-student-avatar')?.parentElement?.querySelector('div > div')?.innerText || '';
        const onLeave = r.innerText.includes('ON LEAVE');
        const btns = Array.from(r.querySelectorAll('.att-status-btn')).map(b => b.innerText);
        return { name, onLeave, btns };
      });
      return rows;
    })()`,
    returnByValue: true
  });
  console.log('After mark return rows:', rowsRes2.result.value);

  const { data: shot3 } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'student-leave-3-returned-restored.png'), Buffer.from(shot3, 'base64'));
  console.log('Saved student-leave-3-returned-restored.png');

  ws.close();
  proc.kill();
})();
