/* ============================================================
   HATCH STREAM — hub server
   One Node process that:
     1. Serves /public (pet.html + overlay.html) over HTTP.
     2. Runs a WebSocket hub linking the pet, the overlay, and the bot.
     3. Ingests commands from Twitch chat (tmi.js, optional) OR a local
        SIM console (type commands in the terminal — no Twitch needed).
     4. Enforces ALL anti-grief rules in ONE place: per-user cooldowns,
        free-vs-paid gating, profanity/length caps, a drained command
        queue, and Anarchy/Democracy modes (à la Twitch Plays Pokémon).
     5. Persists the Hall of Fame across seasons.

   Config: copy config.example.json -> config.json and fill it in.
   Run:    node server.js         (SIM mode if Twitch disabled)
   Deps:   ws   (required),  tmi.js (only if Twitch enabled)
   ============================================================ */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
let WebSocketServer;
try { WebSocketServer = require('ws').WebSocketServer; }
catch (e) { console.error('\n[!] Missing dependency "ws". Run:  npm install\n'); process.exit(1); }

// ---------- config ----------
const DEFAULTS = {
  port: 8787,
  seasonSpeed: 6,            // pet.html time multiplier (dev fast-forward; 1 = real-time)
  perUserCooldownMs: 1500,   // per viewer, per command (was 2500 — felt dead for a lone tester)
  queueDrainPerSec: 5,       // max commands pushed to the pet per second (anti-spam)
  democracyWindowMs: 8000,   // tally window when in Democracy mode
  free: ['a', 'b', 'c', 'left', 'right', 'back', 'feed', 'snack', 'clean', 'train', 'heal', 'light', 'pet', 'play'],
  paid: ['boost', 'skin', 'style', 'name'],
  skins: ['classic', 'sunset', 'galaxy', 'hearts', 'checkers', 'bubbles', 'camo', 'argyle', 'flames', 'glitter', 'dusk', 'gold',
    'corduroy', 'rust', 'sage', 'blush', 'denim', 'stonewash', 'noir'],
  defaultSkin: 'galaxy',     // the shell shown by default on stream (change to any name in `skins`)
  styles: ['classic', 'dotmatrix', 'green', 'cream', 'backlit', 'oled'],
  names: ['Momo', 'Pip', 'Bloop', 'Waffles', 'Sir Hops', 'Nugget', 'Zizzle', 'Momo Jr', 'Kevin', 'Glimmer',
          'Tato', 'Bubbles', 'Chomp', 'Noodle', 'Squish', 'Pixel', 'Biscuit', 'Gizmo', 'Wiggles', 'Peaches',
          'Tofu', 'Zephyr', 'Marbles', 'Sprout', 'Beans', 'Cinnabun', 'Doodle', 'Fizz', 'Yolk', 'Pebble'],
  twitch: { enabled: false, username: '', oauth: '', channel: '' },
  // StreamElements tips -> pet actions. jwt = SE "JWT Token" (Account settings -> Show secrets).
  // Tip tiers (in your tip currency, usually USD): >= tierName => name the pet, >= tierSkin => skin swap, else boost.
  streamelements: { enabled: false, jwt: '', tierSkin: 5, tierName: 10 },
  hatchUrl: 'https://hatchpet.pages.dev'
};
function loadConfig() {
  let cfg = {};
  const p = path.join(__dirname, 'config.json');
  if (fs.existsSync(p)) { try { cfg = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.error('[!] config.json parse error:', e.message); } }
  return Object.assign({}, DEFAULTS, cfg, {
    twitch: Object.assign({}, DEFAULTS.twitch, cfg.twitch || {}),
    streamelements: Object.assign({}, DEFAULTS.streamelements, cfg.streamelements || {})
  });
}
const CFG = loadConfig();

// ---------- Hall of Fame persistence ----------
const HOF_PATH = path.join(__dirname, 'halloffame.json');
function readHOF() { try { return JSON.parse(fs.readFileSync(HOF_PATH, 'utf8')); } catch (e) { return []; } }
function pushHOF(entry) {
  const hof = readHOF();
  hof.unshift(Object.assign({ at: Date.now(), season: hof.length + 1 }, entry));
  try { fs.writeFileSync(HOF_PATH, JSON.stringify(hof.slice(0, 100), null, 2)); } catch (e) {}
  return hof;
}

// ---------- static file server ----------
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const PUB = path.join(__dirname, 'public');
const server = http.createServer((req, res) => {
  let url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (url === '/') url = '/overlay.html';
  const file = path.normalize(path.join(PUB, url));
  if (!file.startsWith(PUB)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

// ---------- WebSocket hub ----------
const wss = new WebSocketServer({ server });
const clients = new Set();
function broadcast(obj, role) {
  const msg = JSON.stringify(obj);
  for (const c of clients) { if (c.readyState === 1 && (!role || c._role === role)) { try { c.send(msg); } catch (e) {} } }
}
const toPet = (o) => broadcast(o, 'pet');
const toOverlay = (o) => broadcast(o, 'overlay');

wss.on('connection', (ws) => {
  ws._role = 'unknown'; clients.add(ws);
  ws.on('message', (raw) => {
    let d; try { d = JSON.parse(raw.toString()); } catch (e) { return; }
    if (d.type === 'hello') { ws._role = d.role || 'unknown'; if (ws._role === 'overlay') sendOverlayInit(ws); return; }
    if (d.type === 'chat') { parseChat(d.user || 'you', String(d.message || ''), d.paid ? { paid: true, source: 'panel' } : { source: 'panel' }); return; }
    // DIRECTOR staging — LOCAL ONLY. Twitch viewers have no WS access (chat reaches us via
    // our outbound tmi.js link), so a {type:'stage'} can only come from the local control panel.
    // Used to fire real sick/health-crash/recovery states on cue for filming clips. Never a chat command.
    if (d.type === 'stage') { toPet({ type: 'cmd', name: '__stage', arg: String(d.event || '') }); return; }
    // CHESS MODE — "Hatchpet Plays Chess". Local-only (same trust model as stage): Sam fires his
    // game result from the control panel. win -> pet thrives (heal); loss -> pet takes real damage
    // (sick; DESTINY may flip BEAST so chat can blame him + rush to heal); draw -> banner only.
    if (d.type === 'chess') {
      const r = String(d.result || '');
      const stg = r === 'win' ? 'heal' : r === 'loss' ? 'sick' : '';
      if (stg) toPet({ type: 'cmd', name: '__stage', arg: stg });
      toOverlay({ type: 'chess', result: r });
      return;
    }
    if (ws._role === 'pet') handleFromPet(d);
  });
  ws.on('close', () => clients.delete(ws));
});
function sendOverlayInit(ws) {
  try { ws.send(JSON.stringify({ type: 'init', hof: readHOF(), mode: govMode, hatchUrl: CFG.hatchUrl, skins: CFG.skins, defaultSkin: CFG.defaultSkin, seasonSpeed: CFG.seasonSpeed })); } catch (e) {}
}
function handleFromPet(d) {
  if (d.type === 'state') { toOverlay(d); return; }
  if (d.type === 'event') { toOverlay(d); return; }
  if (d.type === 'season_win') {
    const hof = pushHOF({ form: d.form, name: d.name, petName: d.petName, genus: d.genus });
    toOverlay({ type: 'season_win', entry: hof[0], hof });
    console.log(`[season] WON as ${d.name} (${d.genus}) — season #${hof[0].season}`);
  }
}

// ============================================================
//  COMMAND INGESTION + ANTI-GRIEF (the important part)
// ============================================================
const FREE = new Set(CFG.free), PAID = new Set(CFG.paid);
const SKINS = new Set(CFG.skins), STYLESET = new Set(CFG.styles);
const randOf = (a) => a[Math.floor(Math.random() * a.length)];
// ---- pet-name moderation (names get DISPLAYED on stream + Hall of Fame, so
//      they must stay within Twitch ToS). Two passes over a leet-folded string:
//      SEVERE = substring (obfuscation-proof, slurs/sexual/hate); MILD = whole-word
//      (avoids false hits like "Titan"/"Essex"). Twitch AutoMod is the extra backstop. ----
const LEET = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i', '|': 'i', '+': 't' };
function fold(s) { return String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[0134578@$!|+]/g, c => LEET[c] || c); }
const SEVERE = ['nigg', 'fagg', 'kike', 'spic', 'chink', 'gook', 'coon', 'beaner', 'wetback', 'raghead', 'tranny', 'retard',
  'rape', 'rapist', 'pedo', 'molest', 'incest', 'bestial', 'nazi', 'hitler', 'heil', 'whitepower', 'kkk',
  'cunt', 'fuck', 'shit', 'bitch', 'whore', 'pussy', 'penis', 'vagina', 'blowjob', 'handjob', 'hentai', 'dildo',
  'jizz', 'porn', 'coom', 'kys', 'killurself', 'killyourself'];
const MILD = new Set(['sex', 'tit', 'tits', 'ass', 'cum', 'dick', 'cock', 'simp', 'wank', 'twat', 'prick', 'slut', 'boob', 'boobs', 'anal', 'orgasm', 'dyke', 'fag', 'hoe', 'crap', 'damn']);
function cleanName(t) { return String(t || '').replace(/[^A-Za-z0-9 '\-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 14); }
function nameOk(name) {
  const stripped = fold(name).replace(/[^a-z]/g, '');
  if (!stripped) return false;
  if (SEVERE.some(w => stripped.includes(w))) return false;
  const words = fold(name).split(/[^a-z]+/).filter(Boolean);
  return !words.some(w => MILD.has(w));
}
const lastUse = new Map();           // "user|cmd" -> ts
let govMode = 'anarchy';             // 'anarchy' | 'democracy'
const modeVotes = new Map();         // user -> 'anarchy'|'democracy'
const queue = [];                    // drained to the pet at queueDrainPerSec
const demoTally = new Map();         // cmd -> {count, arg} during a democracy window
let demoTimer = null;

function clean(txt, max) { return String(txt || '').replace(/[^\x20-\x7E]/g, '').trim().slice(0, max); }

// The single entry point. source = 'chat' | 'bits' | 'points' | 'sim'; paid = bool
function ingest({ user, name, arg, paid, source }) {
  name = (name || '').toLowerCase();
  if (!name) return;

  // governance: mode-change votes
  if (name === 'anarchy' || name === 'democracy') { voteMode(user, name); return; }

  const isPaid = PAID.has(name);
  if (isPaid && !paid) { return; } // paid-only command without payment -> ignore silently
  if (!isPaid && !FREE.has(name)) return; // unknown command

  // per-user cooldown (paid commands bypass cooldown — they paid)
  if (!paid) {
    const key = user + '|' + name, now = Date.now();
    if (now - (lastUse.get(key) || 0) < CFG.perUserCooldownMs) return;
    lastUse.set(key, now);
  }

  // validate args for paid text commands (bare/invalid arg -> pick a random valid one)
  if (name === 'skin') { arg = clean(arg, 16).toLowerCase(); if (!SKINS.has(arg)) arg = randOf(CFG.skins); }
  if (name === 'style') { arg = clean(arg, 16).toLowerCase(); if (!STYLESET.has(arg)) arg = randOf(CFG.styles); }
  if (name === 'name') { arg = cleanName(arg); if (!arg) arg = randOf(CFG.names); else if (!nameOk(arg)) return; }

  const cmd = { type: 'cmd', name, arg, user: name === 'name' ? user : undefined, paid: !!paid };

  // paid actions always fire immediately + loud alert (bypass democracy)
  if (paid) { toPet(cmd); toOverlay({ type: 'alert', user, name, arg, tier: 'paid' }); logFeed(user, name, arg, true); return; }

  // free actions: Anarchy = queue now; Democracy = tally for the window
  if (govMode === 'democracy') { tallyDemocracy(name, arg); logFeed(user, name, arg, false); }
  else { queue.push(cmd); logFeed(user, name, arg, false); }
}

function logFeed(user, name, arg, paid) {
  toOverlay({ type: 'feed', user, name, arg, paid });
}

// ---- Anarchy queue drain (token bucket) ----
// Was: drain up to queueDrainPerSec every 1000ms — which added up to a FULL SECOND of latency
// per command even with one user (each command waited for the next tick; "more users" never
// fixed it, just hid it). Now we check every 150ms with a small idle burst: quiet chat fires
// almost instantly, while sustained floods still cap at queueDrainPerSec/sec (anti-grief kept).
const QUEUE_TICK_MS = 150;
const QUEUE_BURST = 3;            // idle tokens → snappy when chat is calm
let _drainTokens = QUEUE_BURST;
setInterval(() => {
  _drainTokens = Math.min(QUEUE_BURST, _drainTokens + CFG.queueDrainPerSec * QUEUE_TICK_MS / 1000);
  while (_drainTokens >= 1 && queue.length) { toPet(queue.shift()); _drainTokens -= 1; }
  if (queue.length > 200) queue.length = 200; // hard cap, drop overflow
}, QUEUE_TICK_MS);

// ---- Democracy tally ----
function tallyDemocracy(name, arg) {
  const cur = demoTally.get(name) || { count: 0, arg: arg };
  cur.count++; if (arg) cur.arg = arg; demoTally.set(name, cur);
  toOverlay({ type: 'vote', tally: [...demoTally.entries()].map(([k, v]) => ({ name: k, count: v.count })), windowMs: CFG.democracyWindowMs });
  if (!demoTimer) {
    demoTimer = setTimeout(() => {
      let best = null;
      for (const [k, v] of demoTally) if (!best || v.count > best.count) best = { name: k, arg: v.arg, count: v.count };
      demoTally.clear(); demoTimer = null;
      toOverlay({ type: 'vote', tally: [] });
      if (best) { toPet({ type: 'cmd', name: best.name, arg: best.arg }); toOverlay({ type: 'alert', user: 'CHAT', name: best.name, arg: best.arg, tier: 'vote' }); }
    }, CFG.democracyWindowMs);
  }
}

// ---- mode-change voting (supermajority to Democracy, simple majority back to Anarchy) ----
function voteMode(user, choice) {
  modeVotes.set(user, choice);
  let a = 0, d = 0; for (const v of modeVotes.values()) (v === 'democracy' ? d++ : a++);
  const total = a + d;
  const newMode = (d / Math.max(1, total) >= 0.66) ? 'democracy' : 'anarchy';
  if (newMode !== govMode) {
    govMode = newMode; modeVotes.clear();
    if (govMode === 'anarchy' && demoTimer) { clearTimeout(demoTimer); demoTimer = null; demoTally.clear(); }
    toOverlay({ type: 'mode', mode: govMode });
    console.log('[gov] mode ->', govMode);
  }
}

// ============================================================
//  TWITCH CHAT (optional)  +  SIM CONSOLE (always on)
// ============================================================
function parseChat(user, message, extra) {
  // accepts "!feed", "feed", "!skin dusk", "!name Fluffy"
  const m = message.trim().replace(/^!/, '');
  if (!m) return;
  const parts = m.split(/\s+/); const name = parts[0].toLowerCase(); const arg = parts.slice(1).join(' ');
  ingest(Object.assign({ user, name, arg, source: 'chat', paid: false }, extra || {}));
}

if (CFG.twitch.enabled) {
  let tmi; try { tmi = require('tmi.js'); } catch (e) { console.error('[!] Twitch enabled but tmi.js not installed. Run: npm install tmi.js'); }
  if (tmi) {
    const client = new tmi.Client({ identity: { username: CFG.twitch.username, password: CFG.twitch.oauth }, channels: [CFG.twitch.channel] });
    client.on('message', (channel, tags, message, self) => {
      if (self) return;
      const bits = parseInt(tags.bits || '0', 10);
      // Bits cheer -> treat the message as a PAID command
      parseChat(tags['display-name'] || tags.username, message, bits > 0 ? { paid: true, source: 'bits' } : null);
    });
    client.on('cheer', (channel, tags, message) => { parseChat(tags['display-name'] || tags.username, message, { paid: true, source: 'bits' }); });
    client.connect().then(() => console.log('[twitch] connected to #' + CFG.twitch.channel)).catch(e => console.error('[twitch] connect failed:', e.message));
  }
} else {
  console.log('[twitch] disabled — running in SIM mode.');
}

// ---------- StreamElements tips -> pet actions ----------
// A viewer tip fires a PAID pet action (bypasses cooldown + democracy) with an
// on-screen alert crediting the tipper. Tiers scale the reward with the amount.
if (CFG.streamelements.enabled && CFG.streamelements.jwt) {
  let io; try { io = require('socket.io-client'); }
  catch (e) { console.error('[streamelements] enabled but socket.io-client not installed. Run: npm install socket.io-client'); io = null; }
  if (io) {
    const se = CFG.streamelements;
    const seLog = (line) => { try { fs.appendFileSync(path.join(__dirname, 'se-tips.log'), `[${new Date().toISOString()}] ${line}\n`); } catch (e) {} };
    const sock = io('https://realtime.streamelements.com', { transports: ['websocket'] });
    sock.on('connect', () => sock.emit('authenticate', { method: 'jwt', token: se.jwt }));
    sock.on('authenticated', () => { console.log('[streamelements] connected + authenticated — tips are live'); seLog('authenticated'); });
    sock.on('unauthorized', (e) => console.error('[streamelements] auth failed:', (e && e.message) || e));
    sock.on('disconnect', () => console.log('[streamelements] disconnected'));
    // fire a paid pet action for a tip. Handles BOTH shapes:
    //   real events (sock 'event'):      { type:'tip',           data:{ username, amount } }
    //   test events (sock 'event:test'): { listener:'tip-latest', event:{ name, amount } }
    function onTip(ev, isTest) {
      try {
        let type, d;
        if (isTest) { if (!ev || !ev.listener) return; type = String(ev.listener).split('-')[0]; d = ev.event || {}; }
        else { if (!ev || ev.type !== 'tip') return; type = ev.type; d = ev.data || {}; }
        if (type !== 'tip') return;
        const who = d.username || d.name || 'Someone';
        const amt = parseFloat(d.amount) || 0;
        // tier the reward: bigger tip = fancier action
        const action = amt >= se.tierName ? 'name' : (amt >= se.tierSkin ? 'skin' : 'boost');
        ingest({ user: who, name: action, paid: true, source: isTest ? 'tip-test' : 'tip' });
        const msg = `${isTest ? 'TEST ' : ''}tip ${who} $${amt} -> ${action}`;
        console.log('[streamelements] ' + msg); seLog(msg);
      } catch (e) { console.error('[streamelements] event error:', e.message); seLog('error: ' + e.message); }
    }
    sock.on('event', (ev) => onTip(ev, false));
    sock.on('event:test', (ev) => onTip(ev, true));
  }
}

// SIM console: type commands as if you were chat. Prefix "$" = a PAID command.
// Examples:   feed        play        $skin dusk       $name Kupo      democracy
try {
  const rl = require('readline').createInterface({ input: process.stdin });
  console.log('\n  SIM console ready. Type a command like: feed | play | $skin dusk | $name Kupo | democracy');
  console.log('  ("$" prefix simulates a PAID Bits/tip command.)\n');
  let simUser = 0;
  rl.on('line', (line) => {
    line = line.trim(); if (!line) return;
    const paid = line.startsWith('$');
    if (paid) line = line.slice(1).trim();
    parseChat('sim_' + (++simUser % 7), line, paid ? { paid: true, source: 'sim' } : null);
  });
} catch (e) {}

// keep a 24/7 stream alive: log unexpected errors instead of crashing the process
process.on('uncaughtException', (e) => console.error('[uncaught]', (e && e.message) || e));
process.on('unhandledRejection', (e) => console.error('[unhandled]', (e && e.message) || e));

// ---------- go ----------
server.listen(CFG.port, () => {
  console.log('\n  HATCH STREAM hub running');
  console.log('  Overlay (OBS Browser Source):  http://localhost:' + CFG.port + '/overlay.html');
  console.log('  Chat console (type commands):  http://localhost:' + CFG.port + '/control.html');
  console.log('  Pet only (for testing):        http://localhost:' + CFG.port + '/pet.html?spd=' + CFG.seasonSpeed);
  console.log('  Mode: ' + (CFG.twitch.enabled ? 'TWITCH (#' + CFG.twitch.channel + ')' : 'SIM') + '  |  season speed x' + CFG.seasonSpeed + '\n');
});
