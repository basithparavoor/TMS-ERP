const fs = require('fs');
const content = fs.readFileSync('admin-website-cms.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('rgba(')) {
    console.log(`${i+1}: ${l.trim().slice(0, 100)}`);
  }
});
