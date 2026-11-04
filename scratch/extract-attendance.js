const fs = require('fs');

const content = fs.readFileSync('scratch/tpsh-_assets_index_B0FaBePf_js.js', 'utf8');

// Let's extract around 540000 to 585000
const snippet = content.slice(540000, 585000);
fs.writeFileSync('scratch/attendance-module-extracted.js', snippet);
console.log('Saved 45KB attendance snippet to scratch/attendance-module-extracted.js');

// Let's search for the function header or page title in that snippet
console.log('Snippet length:', snippet.length);
