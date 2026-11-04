const fs = require('fs');

async function main() {
  const res = await fetch('https://tpsh.vercel.app/');
  const html = await res.text();
  console.log('HTML length:', html.length);
  
  // Find script tags
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/g;
  let match;
  const scripts = [];
  while ((match = scriptRegex.exec(html)) !== null) {
    scripts.push(match[1]);
  }
  console.log('Scripts:', scripts);

  for (const s of scripts) {
    const sUrl = s.startsWith('http') ? s : 'https://tpsh.vercel.app/' + s.replace(/^\.\//, '');
    console.log('Fetching', sUrl);
    try {
      const sRes = await fetch(sUrl);
      const sText = await sRes.text();
      console.log('Fetched', s, 'length:', sText.length);
      
      // Look for attendance in script
      if (sText.includes('attendance') || sText.includes('Attendance')) {
        console.log(`Script ${s} contains "attendance"!`);
        fs.writeFileSync('scratch/tpsh-' + s.replace(/[^a-zA-Z0-9]/g, '_') + '.js', sText);
      }
    } catch (e) {
      console.error('Err fetching', s, e.message);
    }
  }
}

main();
