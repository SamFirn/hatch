/* Verifies the GoatCounter wiring on the LIVE site without recording a single real hit.
   Every request to goatcounter is intercepted, logged, and ABORTED — so we see exactly what
   would have been sent (pageview + funnel events) while the dashboard stays clean.
   Drives the game: skip splash -> pick pace -> crack the egg -> name the pet -> open SUPPORT. */
import puppeteer from './stream/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

const TARGET = process.argv[2] || 'https://hatchpet.pages.dev/';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const sent = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setRequestInterception(true);
page.on('request', (r) => {
  const u = r.url();
  if (u.includes('goatcounter.com/count') || u.includes('gc.zgo.at/count')) {
    if (u.includes('/count')&& !u.endsWith('count.js')) { sent.push(u); return r.abort(); }
  }
  r.continue();
});

await page.goto(TARGET, { waitUntil: 'networkidle2' });
const key = async (k) => { await page.keyboard.press(k); await new Promise(r => setTimeout(r, 260)); };

await key('KeyB');                       // splash -> setup
await key('KeyB');                       // choose pace -> roam (egg)
await new Promise(r => setTimeout(r, 1200));
await key('KeyB');                       // fast-forward the 12s hatch timer
await new Promise(r => setTimeout(r, 2500));   // hatching animation -> naming
await key('KeyB');                       // confirm name -> playing
await new Promise(r => setTimeout(r, 800));

// the game's state lives in a closure, so confirm progress via its save blob instead
const save = await page.evaluate(() => localStorage.getItem('hatch_save') ||
  Object.keys(localStorage).filter(k => /save|hatch/i.test(k)).map(k => k + '=' + localStorage.getItem(k)).join(' | '));
console.log('localStorage after drive:', String(save).slice(0, 300));

console.log('\n--- what WOULD have been sent to GoatCounter (all aborted) ---');
for (const u of sent) {
  const q = new URL(u).searchParams;
  console.log((q.get('e') === 'true' ? 'EVENT ' : 'PAGE  ') + (q.get('p') || '(root)') + (q.get('r') ? '   ref=' + q.get('r') : ''));
}
console.log('total:', sent.length);
await browser.close();
