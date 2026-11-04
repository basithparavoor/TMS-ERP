const fs = require('fs');
const content = fs.readFileSync('academic-module.js', 'utf8');
const vm = require('vm');
try {
  new vm.SourceTextModule(content);
  console.log('academic-module.js syntax passed cleanly!');
} catch (e) {
  console.error('Syntax error in academic-module.js:', e);
}
