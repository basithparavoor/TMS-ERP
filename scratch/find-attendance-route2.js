const fs = require('fs');

const content = fs.readFileSync('scratch/tpsh-_assets_index_B0FaBePf_js.js', 'utf8');

const searchPatterns = [
  '=== "attendance"',
  '=== \'attendance\'',
  '"attendance"',
  'Edit Classroom'
];

searchPatterns.forEach(pat => {
  let idx = 0;
  let matches = 0;
  while ((idx = content.indexOf(pat, idx)) !== -1 && matches < 5) {
    console.log(`Found "${pat}" at ${idx}`);
    console.log(content.slice(Math.max(0, idx - 100), idx + 350));
    console.log('==================================================');
    idx += pat.length;
    matches++;
  }
});
