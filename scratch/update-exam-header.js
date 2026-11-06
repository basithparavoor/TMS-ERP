const fs = require('fs');

let code = fs.readFileSync('examination-module.js', 'utf8');
code = code.replace(
  "breadcrumbs: [{ label: 'Exams & Reports' }],",
  `breadcrumbs: [
            { label: 'Campus Core' },
            { label: 'Academics & Operations' },
            { label: 'Examinations & Reports', active: true }
          ],
          icon: 'award',`
);

// Fix trailing space before period in admit card header
code = code.replace(
  "Generate official A4 Hall Tickets (2 per page) and room door seating rosters for Nursery .",
  "Generate official A4 Hall Tickets (2 per page) and room door seating rosters for Nursery."
);
code = code.replace(
  "Generate official A4 Hall Tickets (2 per page) and room door seating rosters for ${esc(this._selectedGrade)} .",
  "Generate official A4 Hall Tickets (2 per page) and room door seating rosters for ${esc(this._selectedGrade)}."
);

fs.writeFileSync('examination-module.js', code);
console.log('Successfully updated examination-module.js header and text formatting');
