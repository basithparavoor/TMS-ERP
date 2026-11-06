const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.js') || f.endsWith('.html'));
const results = {};

files.forEach(f => {
  const code = fs.readFileSync(f, 'utf8');
  const lines = code.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('tms-tab-pill') || 
        l.includes('tms-subtab-rail') || 
        l.includes('tms-segmented-tabs') || 
        l.includes('tab-rail') || 
        l.includes('tms-tab-rail-wrapper') ||
        l.includes('hostel-sub-pill') ||
        l.includes('class="tabs"') ||
        l.includes("class='tabs'")) {
      if (!results[f]) results[f] = [];
      results[f].push({ line: i + 1, text: l.trim().slice(0, 110) });
    }
  });
});

for (const file of Object.keys(results)) {
  console.log(`=== ${file} (${results[file].length} matches) ===`);
  results[file].forEach(m => console.log(`  L${m.line}: ${m.text}`));
}
