const fs = require('fs');

const content = fs.readFileSync('scratch/tpsh-_assets_index_B0FaBePf_js.js', 'utf8');

// Find occurrences of "#attendance" or key: "attendance"
// Look for where the attendance view is rendered
const pos = content.indexOf('Attendance Management');
console.log('Pos of Attendance Management:', pos);

// Let's search around pos for the render function
// Search for where the view handler is registered
const regex = /["']attendance["']\s*:\s*(?:async\s*)?(?:function|\()/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log('Found handler at', m.index);
  console.log(content.slice(m.index - 50, m.index + 300));
}

// Let's also search for "Take Attendance" or "Mark Attendance" or "Live Attendance"
const terms = ['Take Attendance', 'Mark Attendance', 'Attendance Session', 'Daily Attendance', 'Attendance Register', 'Punctual', 'Unexcused'];
terms.forEach(t => {
  const p = content.indexOf(t);
  console.log(`Term "${t}":`, p);
  if (p !== -1) {
    console.log(content.slice(Math.max(0, p - 100), p + 300));
    console.log('--------------------------------------------------');
  }
});
