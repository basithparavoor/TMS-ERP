const fs = require('fs');
const content = fs.readFileSync('admin-website-cms.js', 'utf8');

const matches = [];
const regex = /<button[^>]*>|<a [^>]*class="[^"]*btn[^"]*"[^>]*>/g;
let m;
while ((m = regex.exec(content)) !== null) {
  matches.push({ pos: m.index, snippet: m[0] });
}

matches.slice(15).forEach((b, i) => console.log(`${i+16}: ${b.snippet}`));
