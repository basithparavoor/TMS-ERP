const fs = require('fs');
let code = fs.readFileSync('admin-module.js', 'utf8');

// Update SUBTABS.users
const oldSubtabsUsers = `      users: [
        { key: 'google-approvals', label: 'User Authentication (Google)', icon: 'user-check', showPendingBadge: true },
        { key: 'users', label: 'User Logins & Roles', icon: 'users' },`;

const newSubtabsUsers = `      users: [
        { key: 'users', label: 'User Logins, Roles & Permissions', icon: 'users', showPendingBadge: true },
        { key: 'google-approvals', label: 'Google Approvals Queue', icon: 'user-check' },`;

if (code.includes(oldSubtabsUsers.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldSubtabsUsers.replace(/\n/g, '\r\n'), newSubtabsUsers.replace(/\n/g, '\r\n'));
  console.log('Updated SUBTABS.users');
}

const target = `    this.bindEvents(container);
    this.refreshPendingBadges();
    this.switchGroup('admissions', 'applications');`;

const repl = `    this.bindEvents(container);
    this.refreshPendingBadges();
    const hash = (typeof window !== 'undefined' ? window.location.hash || '' : '').replace('#', '');
    if (hash === 'users' || hash.startsWith('user')) {
      const usersTab = container.querySelector('#admin-primary-tabs .tms-tab-pill[data-group="users"]');
      if (usersTab) {
        container.querySelectorAll('#admin-primary-tabs .tms-tab-pill').forEach(b => b.classList.remove('active'));
        usersTab.classList.add('active');
      }
      this.switchGroup('users', 'users');
    } else {
      this.switchGroup('admissions', 'applications');
    }`;

if (code.includes(target.replace(/\n/g, '\r\n'))) {
  code = code.replace(target.replace(/\n/g, '\r\n'), repl.replace(/\n/g, '\r\n'));
  console.log('Updated hash handling in render');
}

fs.writeFileSync('admin-module.js', code);
