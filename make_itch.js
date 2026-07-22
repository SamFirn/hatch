/* Builds the itch.io drop from the canonical hatch.html — so it can never drift again.
   The itch build was previously hand-stripped, which is exactly why it sat two weeks stale
   with none of the funnel analytics and none of the recent art.

   itch.io serves the game inside an iframe off html-classic.itch.zone, so three things get
   removed: the service-worker registration (/sw.js isn't there), the manifest link, and the
   Add-to-Home-Screen bar (meaningless in an iframe). One thing gets added: the pageview is
   reported as `/itch` so itch reach is separable from hatchpet.pages.dev in GoatCounter,
   while the funnel EVENTS keep the same `hatch/...` names so the funnel still aggregates.

   Every strip asserts its marker exists — if hatch.html is restructured this fails loudly
   instead of silently shipping a broken build.

   Usage:  node make_itch.js        -> hatch-itch/index.html (+ tells you to rezip)
*/
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'hatch.html');
const OUT = path.join(__dirname, 'hatch-itch', 'index.html');

let html = fs.readFileSync(SRC, 'utf8');
const before = html.length;

function cut(label, re) {
  if (!re.test(html)) { console.error(`\n  ✗ marker not found: ${label}\n    hatch.html changed shape — fix make_itch.js before shipping.\n`); process.exit(1); }
  html = html.replace(re, '');
  console.log('  – stripped ' + label);
}

// 1. manifest link (no manifest in the itch zip)
cut('manifest link', /[ \t]*<link rel="manifest"[^>]*>\r?\n/);

// 2. service-worker registration (no /sw.js on itch)
cut('service-worker registration', /<script>\r?\n\/\* Register the service worker[\s\S]*?<\/script>\r?\n/);

// 3. Add-to-Home-Screen bar — runs to EOF, meaningless inside itch's iframe
cut('add-to-home-screen bar', /<!-- =+ ADD TO HOME SCREEN =+ -->[\s\S]*$/);

// 4. report this build's pageview as /itch so we can separate itch reach from the web app.
//    Must be set BEFORE count.js loads; goatcounter.count() calls elsewhere pass explicit
//    paths, so the funnel events are unaffected.
const anchor = "  var GC = 'https://samfirn.goatcounter.com/count';";
if (!html.includes(anchor)) { console.error('\n  ✗ GoatCounter block not found — fix make_itch.js\n'); process.exit(1); }
html = html.replace(anchor, "  window.goatcounter = { path: 'itch' };   // itch.io build — separate row in the dashboard\n" + anchor);
console.log('  + pageview path pinned to /itch');

// 5. the favicon is root-absolute (/icon.svg), which 404s inside itch's iframe host.
//    Make it relative and ship the icon alongside index.html.
if (html.includes('"/icon.svg"')) {
  html = html.replace(/"\/icon\.svg"/g, '"icon.svg"');
  console.log('  ~ /icon.svg -> icon.svg (relative)');
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
fs.copyFileSync(path.join(__dirname, 'pages', 'icon.svg'), path.join(path.dirname(OUT), 'icon.svg'));

console.log(`\n  ✓ ${path.relative(__dirname, OUT)}  (${before} -> ${html.length} bytes)  + icon.svg`);
console.log('\n  Rezip for upload:');
console.log('    cd hatch-itch && rm -f ../hatch-itch.zip && zip -r ../hatch-itch.zip index.html icon.svg\n');
