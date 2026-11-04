const fs = require('fs');

['dropdown-enhancer.js', 'datepicker-enhancer.js'].forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  console.log(f + ' length: ' + content.length);
  console.log('Includes "style":', content.includes('style'));
  console.log('Includes "createElement":', content.includes('createElement'));
});
