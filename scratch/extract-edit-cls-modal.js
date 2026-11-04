const fs = require('fs');

const snippet = fs.readFileSync('scratch/attendance-module-extracted.js', 'utf8');

// Find "Edit Classroom" in snippet
const idx = snippet.indexOf('Edit Classroom');
console.log('Index of Edit Classroom:', idx);

if (idx !== -1) {
  // Print 4000 characters around it
  console.log(snippet.slice(Math.max(0, idx - 500), idx + 3500));
}
