const fs = require('fs');

const snippet = fs.readFileSync('scratch/attendance-module-extracted.js', 'utf8');

// Search for HTML blocks in snippet (look for backtick strings with HTML tags)
const htmlMatches = snippet.match(/`[\s\S]*?`/g) || [];
console.log('Found template literals:', htmlMatches.length);

// Print templates that contain recognizable UI elements
htmlMatches.forEach((t, i) => {
  if (t.includes('class=') && t.length > 200) {
    console.log(`\n--- Template #${i} (Length: ${t.length}) ---`);
    console.log(t.slice(0, 600));
  }
});
