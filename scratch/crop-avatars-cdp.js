const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.resolve(process.env.TEMP, 'edge_crop_avatars_' + Date.now());
  const port = 9444;

  const edgeProc = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
  const pages = await listRes.json();
  const wsUrl = pages[0].webSocketDebuggerUrl;

  const ws = new (require('ws'))(wsUrl);
  await new Promise(r => ws.on('open', r));

  let reqId = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = reqId++;
    const onMsg = (msg) => {
      const parsed = JSON.parse(msg.toString());
      if (parsed.id === curId) {
        ws.off('message', onMsg);
        resolve(parsed.result);
      }
    };
    ws.on('message', onMsg);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');

  // Read the reference images
  const refTablePath = 'C:/Users/asus/.gemini/antigravity/brain/674a3e6a-ddb8-49de-b0e1-fc2f88ac42fe/dataview-ref-table.png';
  const refEditPath = 'C:/Users/asus/.gemini/antigravity/brain/674a3e6a-ddb8-49de-b0e1-fc2f88ac42fe/dataview-ref-edit-modal.png';

  const tableB64 = fs.readFileSync(refTablePath).toString('base64');
  const editB64 = fs.readFileSync(refEditPath).toString('base64');

  // Run canvas operations inside Edge
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

    // Crop MD Aamir's high-res passport photo from editImg
    // In editImg, the photo box is around x: 68, y: 175, w: 98, h: 130
    const editCanvas = document.createElement('canvas');
    editCanvas.width = editImg.naturalWidth;
    editCanvas.height = editImg.naturalHeight;
    const eCtx = editCanvas.getContext('2d');
    eCtx.drawImage(editImg, 0, 0);

    // Let's find passport box precisely in editImg
    // Total editImg dimensions:
    const eW = editImg.naturalWidth;
    const eH = editImg.naturalHeight;

    // Crop passport:
    // In Image 2 (dataview-ref-edit-modal.png):
    // Top banner is at ~y: 15% - 35%, left: 6% - 17%
    const pCanvas = document.createElement('canvas');
    const pX = Math.round(eW * 0.068);
    const pY = Math.round(eH * 0.178);
    const pBoxW = Math.round(eW * 0.10);
    const pBoxH = Math.round(eH * 0.145);
    pCanvas.width = pBoxW;
    pCanvas.height = pBoxH;
    const pCtx = pCanvas.getContext('2d');
    pCtx.drawImage(editImg, pX, pY, pBoxW, pBoxH, 0, 0, pBoxW, pBoxH);
    const passportB64 = pCanvas.toDataURL('image/png').replace(/^data:image\\/png;base64,/, '');

    // Now let's crop the 6 avatars from tableImg
    // The avatars are located on the left column:
    // x: approx 3.8% of W, width: approx 2.8% of W
    // 6 rows spaced evenly vertically from ~y: 41.5% to ~y: 93%
    const avatars = [];
    const tCanvas = document.createElement('canvas');
    tCanvas.width = W;
    tCanvas.height = H;
    const tCtx = tCanvas.getContext('2d');
    tCtx.drawImage(tableImg, 0, 0);

    const aX = Math.round(W * 0.0385);
    const aDiam = Math.round(W * 0.024); // avatar diameter
    
    // Y coordinates of the 6 rows
    // Row 1: ~440px / 1000px, Row 2: ~535px, Row 3: ~630px, Row 4: ~725px, Row 5: ~820px, Row 6: ~915px
    const rowStep = (H * 0.505) / 5;
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

  const res = await send('Runtime.evaluate', {
    expression: evalScript,
    awaitPromise: true,
    returnByValue: true
  });

  if (res.result && res.result.value) {
    const val = res.result.value;
    console.log('Processed dimensions:', val.W, val.H);

    // Save passport photo
    fs.writeFileSync('assets/avatars/std-1-passport.png', Buffer.from(val.passportB64, 'base64'));

    // Save avatars
    for (let i = 0; i < val.avatars.length; i++) {
      fs.writeFileSync(`assets/avatars/std-${i+1}.png`, Buffer.from(val.avatars[i], 'base64'));
    }
    console.log('Saved 6 avatars and 1 passport photo into assets/avatars/!');
  } else {
    console.error('Eval error:', res);
  }

  ws.close();
  edgeProc.kill();
}

main().catch(console.error);
