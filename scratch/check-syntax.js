const fs = require('fs');
const content = fs.readFileSync('student-module.js', 'utf8');
try {
  // Try importing or parsing with acorn / vm
  const vm = require('vm');
  new vm.SourceTextModule(content);
  console.log('Syntax check passed cleanly!');
} catch (e) {
  console.error('Syntax error:', e);
}
