const fs = require('fs');
const content = fs.readFileSync('admin-website-cms.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('btn-cms') || (line.includes('class="btn') && i < 200)) {
    console.log((i+1) + ': ' + line.trim().slice(0, 100));
  }
});
