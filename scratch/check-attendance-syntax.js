const fs = require('fs');
const content = fs.readFileSync('attendance-module.js', 'utf8');
const vm = require('vm');
try {
  new vm.SourceTextModule(content);
  console.log('attendance-module.js syntax passed cleanly!');
} catch (e) {
  console.error('Syntax error in attendance-module.js:', e);
}
