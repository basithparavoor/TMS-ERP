const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// 1. Add 'users' to navItems
const oldNav = "{ id: 'administration', label: 'School Administration', icon: 'settings', module: 'administration' }";
const newNav = "{ id: 'users', label: 'User & Permissions', icon: 'shield-check', module: 'users' },\n          { id: 'administration', label: 'School Administration', icon: 'settings', module: 'administration' }";

if (code.includes(oldNav)) {
  code = code.replace(oldNav, newNav);
  console.log('Added users to nav items');
}

// 2. Add 'users' to moduleLabels
const oldLabel = "'administration': 'School Administration'";
const newLabel = "'users': 'User Accounts & Permissions',\n      'administration': 'School Administration'";

if (code.includes(oldLabel)) {
  code = code.replace(oldLabel, newLabel);
  console.log('Added users to moduleLabels');
}

// 3. Add 'users' case to route switch
const oldSwitch = "case 'administration':\n        await AdminModule.render(viewport);\n        break;";
const oldSwitchCRLF = "case 'administration':\r\n        await AdminModule.render(viewport);\r\n        break;";
const newSwitch = "case 'users':\n      case 'administration':\n        window.location.hash = moduleName === 'users' ? '#users' : window.location.hash;\n        await AdminModule.render(viewport);\n        break;";

if (code.includes(oldSwitchCRLF)) {
  code = code.replace(oldSwitchCRLF, newSwitch.replace(/\n/g, '\r\n'));
  console.log('Added users case to route switch (CRLF)');
} else if (code.includes(oldSwitch)) {
  code = code.replace(oldSwitch, newSwitch);
  console.log('Added users case to route switch');
}

fs.writeFileSync('app.js', code);
console.log('Saved app.js successfully!');
