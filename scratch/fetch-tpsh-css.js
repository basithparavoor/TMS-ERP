const fs = require('fs');

async function main() {
  const res = await fetch('https://tpsh.vercel.app/');
  const html = await res.text();
  const cssMatches = html.match(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/g) || [];
  console.log('CSS links:', cssMatches);

  for (const m of cssMatches) {
    const href = m.match(/href=["']([^"']+)["']/)[1];
    const cssUrl = href.startsWith('http') ? href : 'https://tpsh.vercel.app/' + href.replace(/^\.\//, '');
    console.log('Fetching CSS:', cssUrl);
    const cssRes = await fetch(cssUrl);
    const css = await cssRes.text();
    fs.writeFileSync('scratch/tpsh-main.css', css);
    console.log('Saved tpsh CSS, length:', css.length);
  }
}

main();
