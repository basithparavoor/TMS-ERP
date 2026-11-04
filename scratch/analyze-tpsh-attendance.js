const fs = require('fs');

const content = fs.readFileSync('scratch/tpsh-_assets_index_B0FaBePf_js.js', 'utf8');

// Search for attendance page components, titles, headings, structure
const regex = /attendance|Attendance/g;
let count = 0;
while (regex.exec(content) !== null) count++;
console.log('Occurrences of attendance:', count);

// Search for strings or components relating to attendance
// Look for route or view definition
const keywords = ['#attendance', 'attendance-view', 'Attendance Management', 'Daily Attendance', 'Attendance Register', 'Classroom Attendance', 'Period', 'Present', 'Absent', 'Late', 'Excused'];

keywords.forEach(kw => {
  const idx = content.indexOf(kw);
  console.log(`Keyword "${kw}":`, idx);
  if (idx !== -1) {
    console.log('Context around ' + kw + ':\n' + content.slice(Math.max(0, idx - 150), idx + 250));
    console.log('--------------------------------------------------');
  }
});
