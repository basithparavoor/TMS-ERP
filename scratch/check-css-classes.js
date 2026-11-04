const fs = require('fs');
const css = fs.readFileSync('app.css', 'utf8');

const classes = [
  'tms-table-checkbox',
  'tms-student-avatar',
  'tms-id-badge',
  'tms-category-badge',
  'tms-status-pill',
  'tms-table-action-btn'
];

classes.forEach(c => {
  console.log(c + ' in app.css:', css.includes(c));
});
