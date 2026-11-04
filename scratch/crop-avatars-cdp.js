const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

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
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  async ready() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    return new Promise((resolve) => {
      this.ws.onopen = () => resolve();
    });
  }

  async send(method, params = {}) {
    await this.ready();
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.resolve(process.env.TEMP, 'edge_crop_avatars_' + Date.now());
  const port = 9445;

  const edgeProc = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  const wsUrl = await getWsUrl(port);
  const client = new CDPClient(wsUrl);

  await client.send('Page.enable');
  await client.send('Runtime.enable');

  const refTablePath = 'C:/Users/asus/.gemini/antigravity/brain/674a3e6a-ddb8-49de-b0e1-fc2f88ac42fe/dataview-ref-table.png';
  const refEditPath = 'C:/Users/asus/.gemini/antigravity/brain/674a3e6a-ddb8-49de-b0e1-fc2f88ac42fe/dataview-ref-edit-modal.png';

  const tableB64 = fs.readFileSync(refTablePath).toString('base64');
  const editB64 = fs.readFileSync(refEditPath).toString('base64');

  const evalScript = `(async () => {
    const loadImage = (b64) => new Promise(res => {
      const img = new Image();
      img.onload = () => res(img);
      img.src = 'data:image/png;base64,' + b64;
    });

    const tableImg = await loadImage('${tableB64}');
    const editImg = await loadImage('${editB64}');

    const W = tableImg.naturalWidth;
    const H = tableImg.naturalHeight;

    const eW = editImg.naturalWidth;
    const eH = editImg.naturalHeight;

    // Crop passport photo from editImg (MD Aamir)
    const pCanvas = document.createElement('canvas');
    const pX = Math.round(eW * 0.065);
    const pY = Math.round(eH * 0.175);
    const pBoxW = Math.round(eW * 0.103);
    const pBoxH = Math.round(eH * 0.147);
    pCanvas.width = pBoxW;
    pCanvas.height = pBoxH;
    const pCtx = pCanvas.getContext('2d');
    pCtx.drawImage(editImg, pX, pY, pBoxW, pBoxH, 0, 0, pBoxW, pBoxH);
    const passportB64 = pCanvas.toDataURL('image/png').replace(/^data:image\\/png;base64,/, '');

    // Crop 6 avatars from tableImg
    const avatars = [];
    const tCanvas = document.createElement('canvas');
    tCanvas.width = W;
    tCanvas.height = H;
    const tCtx = tCanvas.getContext('2d');
    tCtx.drawImage(tableImg, 0, 0);

    const aX = Math.round(W * 0.0385);
    const aDiam = Math.round(W * 0.0245);
    const rowStep = (H * 0.502) / 5;
    const rowStart = H * 0.435;

    for (let i = 0; i < 6; i++) {
      const curY = Math.round(rowStart + (i * rowStep));
      const aCanvas = document.createElement('canvas');
      aCanvas.width = aDiam;
      aCanvas.height = aDiam;
      const aCtx = aCanvas.getContext('2d');
      aCtx.drawImage(tableImg, aX, curY, aDiam, aDiam, 0, 0, aDiam, aDiam);
      avatars.push(aCanvas.toDataURL('image/png').replace(/^data:image\\/png;base64,/, ''));
    }

    return { W, H, eW, eH, passportB64, avatars };
  })()`;

  const res = await client.send('Runtime.evaluate', {
    expression: evalScript,
    awaitPromise: true,
    returnByValue: true
  });

  if (res && res.result && res.result.value) {
    const val = res.result.value;
    console.log('Processed reference dimensions:', val.W, 'x', val.H);

    fs.writeFileSync('assets/avatars/std-1-passport.png', Buffer.from(val.passportB64, 'base64'));

    for (let i = 0; i < val.avatars.length; i++) {
      fs.writeFileSync(`assets/avatars/std-${i+1}.png`, Buffer.from(val.avatars[i], 'base64'));
    }
    console.log('Successfully saved real student avatars into assets/avatars/!');
  } else {
    console.error('Eval error:', res);
  }

  client.close();
  edgeProc.kill();
}

main().catch(console.error);
