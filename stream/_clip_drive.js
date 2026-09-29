// Clip driver — fires staged sequences over the game WS on cue (grief-safe: stage
// events are local-only; chat commands mimic viewers). No live audience needed.
//
// Usage:
//   node _clip_drive.js            -> "beast" sequence (default, drama-first, ~13s)
//   node _clip_drive.js beast      -> COLD OPEN on BEAST: sicken(frame1) -> crisis -> rescue(HERO) -> tips  [best hook]
//   node _clip_drive.js snap       -> COLD OPEN on a skin snap: rapid paid skin/name/boost changes (~10s)
//   node _clip_drive.js hero       -> hero vs beast, SLOW build: care -> sicken(BEAST) -> rescue(HERO) -> tips (~26s)
//   node _clip_drive.js tip        -> money spotlight: tips change skin/name/boost LIVE
//   node _clip_drive.js cursed     -> chat names it chaos: rapid paid name changes
//   node _clip_drive.js chaos      -> 40 strangers, no coordination: flurry of mixed commands
//   node _clip_drive.js <beat>     -> single beat: feed|play|pet|clean|snack|train|sick|crisis|heal|skin|name|grow|reset
//
// HOOK RULE (from clip #1 data: avg watch 5.25s, most bounced at 0:01): open on the DRAMA,
// not a calm feed/play. `beast` + `snap` front-load the payoff in frame 1 and stay short.
//
// Each beat logs a timestamp so you can narrate alongside the recording.
const WebSocket = require('ws');
const PORT = process.env.HATCH_PORT || 8787;
const ws = new WebSocket('ws://localhost:' + PORT);

const chat  = (message, paid = false, user = 'CHAT') => ws.send(JSON.stringify({ type: 'chat', user, message, paid }));
const stage = (event) => ws.send(JSON.stringify({ type: 'stage', event }));
const log   = (t) => console.log('[' + new Date().toISOString().slice(11, 19) + '] ' + t);
const done  = () => { log('done — cut recording'); process.exit(0); };

// ---- named multi-beat sequences: [delayMs, fn] ----
const SEQUENCES = {
  // BEAST — COLD OPEN on the drama (frame 1 = badge flips BEAST, red aura). Hook-first + short.
  // No calm setup: the descent hits immediately, HERO turn by ~5s, tips land the money beat.
  beast: [
    [200,   () => { stage('sick');                          log('SICKEN  -> frame 1 = badge flips BEAST (red)'); }],
    [2200,  () => { stage('crisis');                         log('CRISIS  (health crash, drama peak)'); }],
    [4800,  () => { stage('heal');                           log('RESCUE  -> badge flips HERO (the turn)'); }],
    [7500,  () => { chat('skin gold', true, 'BigTipper');    log('$5 TIP -> skin changes LIVE'); }],
    [10000, () => { chat('name CHAMPION', true, 'AceDono');  log('TIP -> name changes LIVE'); }],
    [12500, done],
  ],

  // SNAP — COLD OPEN on a paid skin change (frame 1 = whole device transforms). Money/agency hook.
  snap: [
    [200,   () => { chat('skin gold', true, 'Maya');         log('frame 1: TIP -> skin GOLD snaps on'); }],
    [2000,  () => { chat('skin galaxy', true, 'Dev_92');     log('TIP -> skin GALAXY (changes again!)'); }],
    [3800,  () => { chat('skin flames', true, 'Rae');        log('TIP -> skin FLAMES'); }],
    [5600,  () => { chat('name LEGEND', true, 'Bianca');     log('TIP -> names it LEGEND'); }],
    [7600,  () => { chat('boost', true, 'TopDono');          log('TIP -> BOOST (mega sparkles)'); }],
    [9600,  done],
  ],

  // COMBO — both hooks in ONE continuous take with a 10s empty gap to cut on.
  // Seq1 = BEAST cold-open (ends on gold skin). 10s blank. Seq2 = SNAP cold-open, opens on
  // GALAXY (contrast vs the gold it ends on) so clip-2 frame 1 still pops.
  combo: [
    // ── SEQUENCE 1: BEAST (0–12.5s) ──
    [200,   () => { stage('sick');                          log('SEQ1 BEAST | frame1: badge flips BEAST (red)'); }],
    [2200,  () => { stage('crisis');                         log('SEQ1 | CRISIS (drama peak)'); }],
    [4800,  () => { stage('heal');                           log('SEQ1 | RESCUE -> HERO turn'); }],
    [7500,  () => { chat('skin gold', true, 'BigTipper');    log('SEQ1 | $5 TIP -> skin GOLD live'); }],
    [10000, () => { chat('name CHAMPION', true, 'AceDono');  log('SEQ1 | TIP -> name CHAMPION live'); }],
    [12500, () => { log('──── SEQ1 END. 10s GAP — keep recording, stay on the pet ────'); }],
    // ── 10s empty gap (12.5s → 22.5s): nothing fires ──
    // ── SEQUENCE 2: SNAP (22.5–32s) ──
    [22500, () => { chat('skin galaxy', true, 'Maya');       log('SEQ2 SNAP | frame1: TIP -> skin GALAXY snaps on'); }],
    [24300, () => { chat('skin flames', true, 'Dev_92');     log('SEQ2 | TIP -> skin FLAMES (changes again!)'); }],
    [26100, () => { chat('skin dusk', true, 'Rae');          log('SEQ2 | TIP -> skin DUSK'); }],
    [28100, () => { chat('name LEGEND', true, 'Bianca');     log('SEQ2 | TIP -> names it LEGEND'); }],
    [30100, () => { chat('boost', true, 'TopDono');          log('SEQ2 | TIP -> BOOST (mega sparkles)'); }],
    [32300, done],
  ],

  // HERO vs BEAST — the flagship reframe (SLOW build; kept for variety / longer cuts)
  hero: [
    [1500,  () => { chat('feed');                            log('FEED  (chat cares for it)'); }],
    [3500,  () => { chat('play');                            log('PLAY'); }],
    [5500,  () => { chat('pet');                             log('PET  (hearts)'); }],
    [8500,  () => { stage('sick');                           log('SICKEN  -> badge flips BEAST'); }],
    [12500, () => { stage('crisis');                         log('CRISIS  (health crash, drama peak)'); }],
    [16500, () => { stage('heal');                           log('RESCUE  -> badge flips HERO'); }],
    [20000, () => { chat('skin gold', true, 'BigTipper');    log('$5 TIP -> skin changes LIVE'); }],
    [23000, () => { chat('name CHAMPION', true, 'AceDono');  log('TIP -> name changes LIVE'); }],
    [25500, done],
  ],

  // MONEY SPOTLIGHT — "every tip changes the pet LIVE" (the revenue + agency hook)
  tip: [
    [1500,  () => { chat('pet');                             log('PET  (calm, cute establishing beat)'); }],
    [3500,  () => { chat('play');                            log('PLAY'); }],
    [6000,  () => { chat('skin gold', true, 'Maya');         log('TIP #1 -> skin GOLD, live'); }],
    [9500,  () => { chat('skin galaxy', true, 'Dev_92');     log('TIP #2 -> skin GALAXY (it changes again!)'); }],
    [13000, () => { chat('name LEGEND', true, 'Bianca');     log('TIP #3 -> names it LEGEND'); }],
    [16500, () => { chat('boost', true, 'TopDono');          log('TIP #4 -> BOOST (mega sparkles)'); }],
    [19500, done],
  ],

  // NAME CHAOS — chat keeps renaming the pet (comment-bait: "what would you name it?")
  cursed: [
    [1500,  () => { chat('pet');                             log('PET'); }],
    [3500,  () => { chat('feed');                            log('FEED'); }],
    [6000,  () => { chat('name Gary', true, 'chatterA');     log('TIP -> named "Gary"'); }],
    [9500,  () => { chat('name Beefcake', true, 'chatterB'); log('TIP -> renamed "Beefcake"'); }],
    [13000, () => { chat('name Sir Hops', true, 'chatterC'); log('TIP -> renamed "Sir Hops"'); }],
    [16000, done],
  ],

  // 40 STRANGERS, NO COORDINATION — the collective-chaos hook (varied users dodge cooldowns)
  chaos: [
    [800,   () => { chat('feed',  false, 'alex');            log('feed (alex)'); }],
    [1900,  () => { chat('play',  false, 'sam_r');           log('play (sam_r)'); }],
    [2900,  () => { chat('a',     false, 'kira');            log('a  (kira mashes)'); }],
    [3700,  () => { chat('b',     false, 'ovo');             log('b  (ovo)'); }],
    [4600,  () => { chat('clean', false, 'pixelpat');        log('clean (pixelpat)'); }],
    [5600,  () => { chat('c',     false, 'nova');            log('c  (nova)'); }],
    [6600,  () => { chat('light', false, 'quinn');           log('light OFF (quinn)'); }],
    [7600,  () => { chat('light', false, 'theo');            log('light ON (theo)'); }],
    [8700,  () => { chat('pet',   false, 'juno');            log('pet (juno)'); }],
    [9800,  () => { chat('train', false, 'mac');             log('train (mac)'); }],
    [11000, () => { chat('play',  false, 'lena');            log('play (lena)'); }],
    [12400, () => { chat('feed',  false, 'wren');            log('feed (wren)'); }],
    [14000, done],
  ],
};

// single-beat helper (for manual control)
function singleBeat(name) {
  if (['feed', 'play', 'pet', 'clean', 'snack', 'train'].includes(name)) chat(name);
  else if (name === 'skin') chat('skin gold', true, 'BigTipper');
  else if (name === 'name') chat('name CHAMPION', true, 'BigTipper');
  else stage(name); // sick | crisis | heal | grow | reset
  log('sent: ' + name);
  setTimeout(() => process.exit(0), 600);
}

const arg = process.argv[2] || 'beast';

ws.on('open', () => {
  ws.send(JSON.stringify({ type: 'hello', role: 'control' }));
  if (SEQUENCES[arg]) {
    log('running sequence: ' + arg.toUpperCase());
    SEQUENCES[arg].forEach(([t, fn]) => setTimeout(fn, t));
  } else {
    singleBeat(arg);
  }
});

ws.on('error', (e) => { console.error('WS error:', e.message); process.exit(1); });
