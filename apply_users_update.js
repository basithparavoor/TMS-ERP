const fs = require('fs');

let adminCode = fs.readFileSync('admin-module.js', 'utf8');

// 1. Check if import is already present
if (!adminCode.includes('./window-permissions.js')) {
  adminCode = adminCode.replace(
    "import { AdminWebsiteCms } from './admin-website-cms.js';",
    "import { AdminWebsiteCms } from './admin-website-cms.js';\nimport { WindowPermissionsService, WINDOW_ROLES, ROLE_THEMES, WINDOW_CATEGORIES, DEFAULT_RBAC_MATRIX } from './window-permissions.js';"
  );
  console.log('Added window-permissions.js import');
}

// 2. Add roles to ROLE_LABELS if needed
if (!adminCode.includes('boys_mentor:')) {
  adminCode = adminCode.replace(
    "super_admin: '👑 Super Administrator',",
    "super_admin: '👑 Super Administrator',\n  boys_mentor: 'Boys Hostel Mentor',\n  girls_mentor: 'Girls Hostel Mentor',\n  mentor: 'Hostel Mentor',\n  hostel_leader: 'Hostel Leader',"
  );
  console.log('Updated ROLE_LABELS');
}

// 3. Find start and end of old renderUsersTab
const startMarker = 'static async renderUsersTab(tabContent) {';
const startIdx = adminCode.indexOf(startMarker);
if (startIdx === -1) {
  console.error('Could not find renderUsersTab');
  process.exit(1);
}

const endMarker = '/** Full user editor: identity, assignment, avatar upload and password reset. */';
const endIdx = adminCode.indexOf(endMarker);
if (endIdx === -1) {
  console.error('Could not find endMarker');
  process.exit(1);
}

console.log('Found renderUsersTab from index', startIdx, 'to', endIdx);

const newMethods = fs.readFileSync('generated_users_methods.js', 'utf8').trim();

adminCode = adminCode.substring(0, startIdx) + newMethods + '\n\n  ' + adminCode.substring(endIdx);

fs.writeFileSync('admin-module.js', adminCode);
console.log('Successfully updated admin-module.js!');
