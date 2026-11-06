const fs = require('fs');
let code = fs.readFileSync('my-work-module.js', 'utf8');

const target = 'subtitle: `Welcome back, ${esc(user.name || \'Faculty Member\')} (${esc(user.department || \'Academics\')})`,';
const replacement = 'subtitle: `Welcome back, ${esc(user.name || \'Faculty Member\')} (${esc((user.department && user.department !== \'—\') ? user.department : (user.title && user.title !== \'—\') ? user.title : ((user.isSuperAdmin || user.role === \'super_admin\') ? \'Executive Governance\' : \'Academics\'))})`,';

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('my-work-module.js', code, 'utf8');
  console.log('Successfully updated my-work-module.js');
} else {
  console.log('Target not found in my-work-module.js');
}
