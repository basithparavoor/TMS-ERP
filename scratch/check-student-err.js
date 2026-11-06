(async () => {
  const p = 9368;
  const { spawn } = require('child_process');
  const path = require('path');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--remote-debugging-port=' + p,
    '--user-data-dir=' + path.join(__dirname, 'edge-profile-test-portals'),
    '--headless=new',
    'http://localhost:3000/index.html'
  ], { detached: true, stdio: 'ignore' });

  for (let i = 0; i < 30; i++) {
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
  ws.addEventListener('message', (m) => {
    const d = JSON.parse(m.data);
    if (d.method === 'Runtime.consoleAPICalled') {
      console.log('CONSOLE:', d.params.type, d.params.args.map(a => a.value || a.description));
    }
  });

  await send('Runtime.evaluate', {
    expression: "localStorage.setItem('tms_auth_session', JSON.stringify({ id: 'std-5', name: 'Sultana Sarkar', role: 'student', email: 'sultana@tms.edu' }));"
  });

  await send('Page.navigate', { url: 'http://localhost:3000/student.html' });
  await new Promise(r => setTimeout(r, 2500));
  ws.close();
  proc.kill();
})();
