const fs = require('fs');

const css = fs.readFileSync('scratch/tpsh-main.css', 'utf8');

const targets = [
  'cls-day-round-btn',
  'cls-days-picker-row',
  'teacher-upcoming-card',
  'att-timetable-tab-btn',
  'live-pulse-dot'
];

targets.forEach(t => {
  let idx = 0;
  while ((idx = css.indexOf(t, idx)) !== -1) {
    const start = Math.max(0, idx - 50);
    const end = Math.min(css.length, idx + 350);
    console.log(`=== CSS for ${t} ===`);
    console.log(css.slice(start, end));
    idx += t.length;
  }
});
