/* Clip director — fires the TikTok shot list at the live pet on an exact timeline so you can
   just hit record in OBS and keep both hands off the keyboard. See TIKTOK-CLIP-SCRIPT.md.

   Commands go in as if they came from chat, each from a DIFFERENT viewer name — that matters
   twice: the on-screen feed reads like real chat instead of "you · you · you", and per-user
   cooldowns (1.5s each) can't swallow back-to-back beats.

   These are ordinary care commands against the real 24/7 pet. Nothing here is destructive and
   nothing changes his look (no skin/style/name). Net effect: he ends up fed, clean and happy.

   Usage:
     node _clip_director.mjs --dry     print the timeline, send nothing
     node _clip_director.mjs           3-2-1 countdown, then run the show (~30s)
*/

const DRY = process.argv.includes('--dry');
const PORT = 8787;

// t = seconds from show start. Matches the table in TIKTOK-CLIP-SCRIPT.md.
const BEATS = [
  { t: 0.0,  user: null,           cmd: null,     note: 'COLD OPEN — hungry, dirty, lights off. Let it breathe.' },
  { t: 2.0,  user: 'mossbell',     cmd: 'feed',   note: 'eats — hunger meter jumps' },
  { t: 6.0,  user: 'trin_ok',      cmd: 'clean',  note: 'poop sweeps away' },
  { t: 9.0,  user: 'halfvolley',   cmd: 'light',  note: 'dim -> lit, biggest visual delta' },
  { t: 11.0, user: 'pengwn',       cmd: 'play',   note: 'minigame' },
  { t: 16.0, user: 'sarahdotexe',  cmd: 'pet',    note: 'hearts' },
  { t: 19.0, user: 'kbo_',         cmd: 'train',  note: 'discipline tick' },
  { t: 22.0, user: 'nite_owl_88',  cmd: 'snack',  note: 'happy tops out' },
  { t: 24.0, user: 'marnie_j',     cmd: 'boost', paid: true, note: '💎 PAID — fireworks, the money shot' },
  { t: 28.0, user: null,           cmd: null,     note: 'HOLD on the happy pet — end card / CTA' },
];

const END = 31;

if (DRY) {
  console.log('\n  TIMELINE (dry run — nothing sent)\n');
  for (const b of BEATS) {
    const mm = String(Math.floor(b.t / 60)).padStart(1, '0'), ss = String(Math.floor(b.t % 60)).padStart(2, '0');
    console.log(`  ${mm}:${ss}  ${(b.cmd ? (b.paid ? '$' : '') + b.cmd : '(hold)').padEnd(10)} ${(b.user || '').padEnd(14)} ${b.note}`);
  }
  console.log(`\n  ends ~0:${END}\n`);
  process.exit(0);
}

const ws = new WebSocket(`ws://localhost:${PORT}`);
ws.onerror = () => { console.error('\n  ✗ Cannot reach the stream server on ' + PORT + '. Is start-24-7.bat running?\n'); process.exit(1); };

ws.onopen = async () => {
  ws.send(JSON.stringify({ type: 'hello', role: 'control' }));

  console.log('\n  Recording? Starting in…');
  for (const n of [3, 2, 1]) { console.log('  ' + n + '…'); await sleep(1000); }
  console.log('\n  ▶ ACTION\n');

  const t0 = Date.now();
  for (const b of BEATS) {
    await sleep(b.t * 1000 - (Date.now() - t0));
    const stamp = ((Date.now() - t0) / 1000).toFixed(1).padStart(5) + 's';
    if (!b.cmd) { console.log(`  ${stamp}  ·  ${b.note}`); continue; }
    ws.send(JSON.stringify({ type: 'chat', user: b.user, message: b.cmd, paid: !!b.paid }));
    console.log(`  ${stamp}  ${(b.paid ? '$' : ' ') + b.cmd.padEnd(7)} ${b.user.padEnd(14)} ${b.note}`);
  }

  await sleep(END * 1000 - (Date.now() - t0));
  console.log('\n  ■ CUT — stop the recording.\n');
  ws.close();
  process.exit(0);
};

function sleep(ms) { return new Promise(r => setTimeout(r, Math.max(0, ms))); }
