const fs = require('fs');

const files = ['finance-module.js', 'reports-module.js', 'calendar-module.js', 'id-cards-module.js', 'student-module.js', 'attendance-module.js'];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  const code = fs.readFileSync(f, 'utf8');
  const lines = code.split('\n');
  const matches = [];
  lines.forEach((l, i) => {
    if (l.includes('data-tab=') || l.includes('tab-rail') || l.includes('segmented-tabs') || l.includes('btn-tab') || l.includes('tab-pill') || l.includes('role="tab"')) {
      matches.push(`L${i+1}: ${l.trim().slice(0, 100)}`);
    }
  });
  if (matches.length) {
    console.log(`=== ${f} (${matches.length} matches) ===`);
    matches.forEach(m => console.log('  ' + m));
  }
});
