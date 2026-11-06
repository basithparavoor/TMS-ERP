const fs = require('fs');

const files = [
  'academic-module.js',
  'examination-module.js',
  'timetable-module.js',
  'operations-module.js',
  'admin-module.js',
  'my-work-module.js',
  'admission-entry-module.js',
  'attendance-radar-module.js',
  'id-cards-module.js',
  'admin-website-cms.js'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.match(/class=['"][^'"]*(?:tab|subtab|segmented)[^'"]*['"]/gi) || [];
  const unique = [...new Set(matches.map(m => m.slice(7, -1).trim()))];
  console.log(`=== ${f} ===\n` + unique.join('\n'));
});
