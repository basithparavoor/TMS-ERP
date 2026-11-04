const fs = require('fs');

const content = fs.readFileSync('scratch/tpsh-_assets_index_B0FaBePf_js.js', 'utf8');

const start = 590000;
const end = 720000;
fs.writeFileSync('scratch/attendance-core-extracted.js', content.slice(start, end));
console.log('Extracted 130KB of attendance core to scratch/attendance-core-extracted.js');
