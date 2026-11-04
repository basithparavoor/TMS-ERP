const fs = require('fs');

const content = fs.readFileSync('scratch/tpsh-_assets_index_B0FaBePf_js.js', 'utf8');

// Find where case "attendance": or key === "attendance" or renderAttendance
const searchPatterns = [
  'case "attendance":',
  'case \'attendance\':',
  'renderAttendance',
  'AttendanceModule',
  'initAttendance',
  'AttendanceView'
];

searchPatterns.forEach(pat => {
  let idx = 0;
  while ((idx = content.indexOf(pat, idx)) !== -1) {
    console.log(`Found "${pat}" at ${idx}`);
    console.log(content.slice(Math.max(0, idx - 100), idx + 400));
    console.log('==================================================');
    idx += pat.length;
  }
});
