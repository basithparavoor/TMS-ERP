const fs = require('fs');
const content = fs.readFileSync('admin-module.js', 'utf8');
const idx = content.indexOf('admin-subtab-scroll-prev');
console.log('Index:', idx);
console.log('--- ACTUAL SNIPPET ---');
console.log(content.slice(idx - 50, idx + 350));
