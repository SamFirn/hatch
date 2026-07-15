// _make_clip.js — CLIP FACTORY v2. One command → finished, ready-to-post 1080×1920 mp4.
//
//   node _make_clip.js                 -> "beast" clip (default)
//   node _make_clip.js snap            -> the money / skin-snap hook
//   node _make_clip.js chaos           -> the 40-strangers hook
//   node _make_clip.js beast --novo    -> skip the TTS voiceover
//
// HOW IT WORKS (and why):
//   It records the REAL OBS scene (the actual stream overlay + the actual live, hatched pet)
//   over obs-websocket, then composes it vertically in ffmpeg.
//
//   v1 was WRONG: it loaded pet.html in a headless browser, which spawned a SECOND pet engine.
//   That phantom engine (a) booted on the title screen with an unhatched egg, and (b) registered
//   as role:'pet', so it ate chat commands AND the stage events meant for the live pet — i.e. it
//   corrupted the real stream's pet. NEVER embed pet.html anywhere else. One engine, ever.
//
// Posting stays MANUAL on purpose (auto-uploading on a throttled account = ban risk).

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const WebSocket = require('ws');
const { OBSWebSocket } = require('obs-websocket-js');

const HERE = __dirname;
const OUT_DIR = path.join(HERE, 'clips');
const TMP = path.join(HERE, '_cliptmp');
const HUB = 'ws://localhost:8787';

const OBS_URL = 'ws://127.0.0.1:4455';
const OBS_PW = 'HYwL2ct1R2u8SKha';
const OBS_BROWSER_SOURCE = 'Hatch';   // the browser-source input name in OBS (for showcase refresh)
const FFMPEG = 'C:/Users/samfi/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe';
const FONT = 'C\\:/Windows/Fonts/arialbd.ttf';
const VOICE = 'en-US-AriaNeural';

// Crop of the 1920×1080 stream that holds the device + nametag + DESTINY badge.
// Measured off a real recorded frame. Scaled to 1080 wide, the pet FILLS the vertical frame.
const CROP = { w: 660, h: 830, x: 630, y: 100 };
const PET_Y = 360;        // where the scaled pet block sits on the 1080×1920 canvas
const PRE = 1.2;          // settle time after recording goes active (becomes file lead-in)
const TRIM_IN = 0.45;     // trim so frame 1 lands ON the drama, not before it

const SEQ = {
  beast: {
    dur: 13,
    beats: [
      [0.0,  s => s.stage('sick')],
      [2.2,  s => s.stage('crisis')],
      [5.0,  s => s.stage('heal')],
      [7.6,  s => s.chat('skin gold', true, 'BigTipper')],
      [10.0, s => s.chat('name CHAMPION', true, 'AceDono')],
    ],
    lines: [
      { t: 0.0, end: 4.2,  text: 'chat turned my virtual pet\ninto a monster', say: 'Chat turned my virtual pet into a monster.' },
      { t: 4.4, end: 8.4,  text: 'they raise it 24/7.\ntoday they let it rot.',  say: 'They raise it 24/7. Today, they let it rot.' },
      { t: 8.6, end: 13.0, text: 'we saved it with\nseconds to spare',           say: 'We saved it with seconds to spare.' },
    ],
  },
  snap: {
    dur: 11,
    beats: [
      [0.0, s => s.chat('skin galaxy', true, 'Maya')],
      [2.0, s => s.chat('skin flames', true, 'Dev_92')],
      [3.8, s => s.chat('skin gold',   true, 'Rae')],
      [5.6, s => s.chat('name LEGEND', true, 'Bianca')],
      [7.6, s => s.chat('boost',       true, 'TopDono')],
    ],
    lines: [
      { t: 0.0, end: 3.8,  text: 'every tip changes\nthe pet LIVE',              say: 'Every tip changes the pet, live.' },
      { t: 4.0, end: 7.4,  text: 'chat picks the skin.\nchat picks the name.',   say: 'Chat picks the skin. Chat picks the name.' },
      { t: 7.6, end: 11.0, text: 'one pet.\nthe whole chat.',                    say: 'One pet. The whole chat.' },
    ],
  },
  chaos: {
    dur: 13,
    beats: [
      [0.2, s => s.chat('feed', false, 'alex')],  [1.4, s => s.chat('play', false, 'sam_r')],
      [2.5, s => s.chat('a', false, 'kira')],     [3.6, s => s.chat('clean', false, 'pixelpat')],
      [4.8, s => s.chat('light', false, 'quinn')],[6.0, s => s.chat('light', false, 'theo')],
      [7.2, s => s.chat('pet', false, 'juno')],   [8.4, s => s.chat('train', false, 'mac')],
      [9.6, s => s.chat('play', false, 'lena')],  [10.8, s => s.chat('feed', false, 'wren')],
    ],
    lines: [
      { t: 0.0, end: 4.5,  text: 'strangers on the internet\nare raising this pet', say: 'Strangers on the internet are raising this pet.' },
      { t: 4.7, end: 9.0,  text: 'nobody is coordinating.\nnobody is in charge.',   say: 'Nobody is coordinating. Nobody is in charge.' },
      { t: 9.2, end: 13.0, text: 'it is going exactly\nhow you think',              say: 'It is going exactly how you think.' },
    ],
  },
  // SKINS SHOWCASE — rapid silent skin swaps (the "vibe" reel). showcase:true → refresh OBS first
  // (load latest skins) + no hatch guard (we're showing the SHELL, pet state doesn't matter).
  skins: {
    dur: 13.5,
    showcase: true,
    beats: [
      [0.2,  s => s.showskin('corduroy')], [1.25, s => s.showskin('knit')],
      [2.3,  s => s.showskin('plaid')],    [3.35, s => s.showskin('denim')],
      [4.4,  s => s.showskin('lava')],     [5.45, s => s.showskin('rainbow')],
      [6.5,  s => s.showskin('holo')],     [7.55, s => s.showskin('cow')],
      [8.6,  s => s.showskin('marble')],   [9.65, s => s.showskin('chrome')],
      [10.7, s => s.showskin('gingham')],  [11.75, s => s.showskin('quilted')],
    ],
    lines: [
      { t: 0.0, end: 4.2,  text: 'one pet.\n33 vibes.',            say: 'One pet. Thirty-three vibes.' },
      { t: 4.4, end: 8.4,  text: 'chat picks\nthe aesthetic',      say: 'Chat picks the aesthetic.' },
      { t: 8.6, end: 13.5, text: 'which vibe\nare you?',           say: 'Which vibe are you?' },
    ],
  },
};

const args = process.argv.slice(2);
const seqName = (args.find(a => !a.startsWith('--')) || 'beast').toLowerCase();
const NOVO = args.includes('--novo');
const spec = SEQ[seqName];
if (!spec) { console.error('Unknown sequence: ' + seqName + ' (have: ' + Object.keys(SEQ).join(', ') + ')'); process.exit(1); }

const log = m => console.log('[' + new Date().toISOString().slice(11, 19) + '] ' + m);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const sh = (bin, a) => execFileSync(bin, a, { stdio: ['ignore', 'pipe', 'pipe'] });

// Control channel into the stream hub (local-only staging, same as the control panel).
function hub() {
  const ws = new WebSocket(HUB);
  return {
    ready: new Promise(res => ws.on('open', () => { ws.send(JSON.stringify({ type: 'hello', role: 'control' })); res(); })),
    chat: (message, paid = false, user = 'CHAT') => ws.send(JSON.stringify({ type: 'chat', user, message, paid })),
    stage: event => ws.send(JSON.stringify({ type: 'stage', event })),
    showskin: name => ws.send(JSON.stringify({ type: 'showskin', name })),   // silent skin swap (showcase)
    close: () => ws.close(),
  };
}

// Read the LIVE pet's broadcast state. An EGG (stage 0) forces path='neutral' in the engine,
// so the DESTINY badge can never flip to BEAST — which silently kills the whole hook.
function petState(timeoutMs = 6000) {
  return new Promise(resolve => {
    const ws = new WebSocket(HUB);
    let done = false;
    const fin = v => { if (done) return; done = true; try { ws.close(); } catch (e) {} resolve(v); };
    ws.on('open', () => ws.send(JSON.stringify({ type: 'hello', role: 'overlay' })));
    ws.on('message', raw => { let d; try { d = JSON.parse(raw.toString()); } catch (e) { return; } if (d.type === 'state') fin(d); });
    setTimeout(() => fin(null), timeoutMs);
  });
}

(async () => {
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const st = await petState();
  if (!st) { console.error('No pet state from the hub — is the stream server running?'); process.exit(1); }
  if (!spec.showcase && (st.stage | 0) < 1) {
    console.error('Pet is still an EGG (stage 0) — the DESTINY badge cannot flip to BEAST, which kills the hook.');
    console.error('Hatch it first (control panel -> 🥚 hatch), then re-run.');
    process.exit(1);
  }
  log(`live pet: ${st.petName || st.name} · stage ${st.stage} · hp ${Math.round(st.health)}%`);

  const obs = new OBSWebSocket();
  await obs.connect(OBS_URL, OBS_PW);
  const rec0 = await obs.call('GetRecordStatus');
  if (rec0.outputActive) { console.error('OBS is already recording — stop it first.'); process.exit(1); }

  // Showcase clips need the LATEST overlay (new skins + the silent showskin handler). Refresh the
  // OBS browser source so we record current skins even if the live source was cached/stale.
  if (spec.showcase) {
    try {
      await obs.call('PressInputPropertiesButton', { inputName: OBS_BROWSER_SOURCE, propertyName: 'refreshnocache' });
      log('refreshed OBS browser source — waiting for overlay + pet to reload…');
      await sleep(6000);
    } catch (e) { log('WARN: could not refresh browser source (' + e.message + ') — recording current state'); }
  }

  const s = hub();
  await s.ready;

  await obs.call('StartRecord');
  for (let i = 0; i < 40; i++) { const r = await obs.call('GetRecordStatus'); if (r.outputActive) break; await sleep(100); }
  log('OBS recording the live scene…');
  await sleep(PRE * 1000);

  for (const [t, fn] of spec.beats) setTimeout(() => fn(s), t * 1000);
  await sleep(spec.dur * 1000 + 700);

  const { outputPath } = await obs.call('StopRecord');
  await obs.disconnect();
  s.close();
  log('recorded -> ' + outputPath);
  await sleep(800);                        // let OBS finalise the file

  // ── vertical composition: blurred brand backdrop + the sharp pet region, scaled up ──
  const draws = spec.lines.map((L, i) => {
    const tf = path.join(TMP, 'cap' + i + '.txt');
    fs.writeFileSync(tf, L.text, 'utf8');
    const p = tf.replace(/\\/g, '/').replace(':', '\\:');
    return `drawtext=fontfile='${FONT}':textfile='${p}':fontsize=62:fontcolor=white:borderw=8:bordercolor=black@0.85:` +
           `line_spacing=12:x=(w-text_w)/2:y=130:enable='between(t,${L.t},${L.end})'`;
  }).join(',');

  const vf =
    `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=28:2[bg];` +
    `[0:v]crop=${CROP.w}:${CROP.h}:${CROP.x}:${CROP.y},scale=1080:-2:flags=lanczos[fg];` +
    `[bg][fg]overlay=(W-w)/2:${PET_Y}[c];[c]${draws}[v]`;

  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 13);
  const out = path.join(OUT_DIR, `${seqName}-${stamp}.mp4`);
  const ss = String(PRE + TRIM_IN);

  if (!NOVO) {
    log('generating voiceover (edge-tts)…');
    const vo = [];
    for (let i = 0; i < spec.lines.length; i++) {
      const mp3 = path.join(TMP, 'vo' + i + '.mp3');
      sh('python', ['-m', 'edge_tts', '--voice', VOICE, '--text', spec.lines[i].say, '--write-media', mp3]);
      vo.push(mp3);
    }
    const inputs = [];
    vo.forEach(v => inputs.push('-i', v));
    // duck the real stream chiptune under the voice (keep it — it's the charm), then mix.
    const delays = spec.lines.map((L, i) => `[${i + 1}:a]adelay=${Math.round(L.t * 1000)}|${Math.round(L.t * 1000)}[v${i}]`).join(';');
    const mixIn = '[bgm]' + spec.lines.map((_, i) => `[v${i}]`).join('');
    const af = `[0:a]volume=0.22,atrim=start=${ss},asetpts=PTS-STARTPTS[bgm];${delays};${mixIn}amix=inputs=${vo.length + 1}:normalize=0,apad[aout]`;
    log('composing + burning captions + muxing voice…');
    sh(FFMPEG, ['-y', '-ss', ss, '-t', String(spec.dur), '-i', outputPath, ...inputs,
      '-filter_complex', `${vf};${af}`,
      '-map', '[v]', '-map', '[aout]',
      '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19',
      '-c:a', 'aac', '-b:a', '192k', '-t', String(spec.dur), out]);
  } else {
    log('composing + burning captions (no voice)…');
    sh(FFMPEG, ['-y', '-ss', ss, '-t', String(spec.dur), '-i', outputPath,
      '-filter_complex', vf, '-map', '[v]', '-map', '0:a',
      '-af', 'volume=0.6', '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19',
      '-c:a', 'aac', '-b:a', '192k', out]);
  }

  fs.rmSync(TMP, { recursive: true, force: true });
  try { fs.unlinkSync(outputPath); } catch (e) {}     // drop the raw 1920×1080 OBS capture
  log('DONE -> ' + out + '  (' + (fs.statSync(out).size / 1024).toFixed(0) + ' KB)');
  process.exit(0);
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
