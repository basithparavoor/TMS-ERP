const fs = require('fs');
const content = fs.readFileSync('admin-website-cms.js', 'utf8');

// Find all occurrences of buttons
const matches = [];
const regex = /<button[^>]*>|<a [^>]*class="[^"]*btn[^"]*"[^>]*>/g;
let m;
while ((m = regex.exec(content)) !== null) {
  matches.push({ pos: m.index, snippet: m[0] });
}

console.log('Total button occurrences in admin-website-cms.js:', matches.length);
matches.slice(0, 15).forEach((b, i) => console.log(`${i+1}: ${b.snippet}`));
