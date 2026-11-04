const fs = require('fs');

const code = fs.readFileSync('scratch/attendance-core-extracted.js', 'utf8');

// Find all major template literals
const matches = code.match(/`[\s\S]*?`/g) || [];
console.log('Found templates:', matches.length);

matches.forEach((t, i) => {
  if (t.length > 500) {
    console.log(`\n================== TEMPLATE ${i} (Length: ${t.length}) ==================`);
    console.log(t.slice(0, 800));
    console.log('...\n' + t.slice(-300));
  }
});
