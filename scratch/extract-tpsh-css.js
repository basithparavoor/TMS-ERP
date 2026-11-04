const fs = require('fs');

const bundle = fs.readFileSync('scratch/tpsh-_assets_index_B0FaBePf_js.js', 'utf8');

// Find style or class definitions for teacher-upcoming-card, cls-day-round-btn, live-pulse-dot
const classes = [
  'teacher-upcoming-card',
  'cls-day-round-btn',
  'live-pulse-dot',
  'att-timetable-tab-btn',
  'cls-days-picker-row'
];

classes.forEach(c => {
  let idx = 0;
  let matches = 0;
  while ((idx = bundle.indexOf(c, idx)) !== -1 && matches < 3) {
    console.log(`Class "${c}" at ${idx}:`);
    console.log(bundle.slice(Math.max(0, idx - 80), idx + 250));
    console.log('-------------------------------------------');
    idx += c.length;
    matches++;
  }
});
