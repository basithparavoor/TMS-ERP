const fs = require('fs');

const snippet = fs.readFileSync('scratch/attendance-module-extracted.js', 'utf8');

const idx = snippet.indexOf('Edit Classroom —');
console.log('Index:', idx);
if (idx !== -1) {
  console.log(snippet.slice(idx - 300, idx + 4500));
}
