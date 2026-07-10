/* ============================================================
   HATCH STREAM HARNESS  (outer layer)
   The Hatch engine is IIFE-scoped; it exposes exactly one door:
   window.__hatch (the bridge injected at the end of pet.html).
   This harness:
     - isolates the LCD canvas so the overlay can frame it,
     - keeps the pet in live gameplay (auto-skips setup/naming/reveal),
     - makes it immortal on stream,
     - executes commands the hub forwards — BOTH raw buttons (a/b/c,
       authentic Twitch-Plays style) AND verb shortcuts (feed/play/…),
     - broadcasts a state snapshot to the hub ~1x/sec for the overlay,
     - detects season wins (terminal form) → reports + starts a fresh egg.
   ============================================================ */
(function () {
  'use strict';
  var P = new URLSearchParams(location.search);
  var PORT = P.get('port') || '8787';
  var WS_URL = P.get('ws') || ('ws://' + (location.hostname || 'localhost') + ':' + PORT);
  window.__streamSpd = parseFloat(P.get('spd') || '6');

  // paid "style" = the engine's real LCD art styles (creature + screen look)
  var STYLE_IX = { classic: 0, dotmatrix: 1, dot: 1, green: 2, '4shade': 2, cream: 3, mono: 3, backlit: 4, color: 4, oled: 5, dark: 5 };
  var H = null;                 // the bridge, once ready
  var ws = null, connected = false;

  /* ---- 1. show only the LCD canvas, transparent bg (overlay frames it) ---- */
  function isolateScreen() {
    var st = document.createElement('style');
    st.textContent =
      'html,body{background:transparent!important;margin:0;padding:0;overflow:hidden;height:100%;width:100%;}' +
      '#device{position:fixed!important;left:-99999px!important;top:0!important;}' +
      '#lcd.streamed{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;' +
      'image-rendering:pixelated;image-rendering:crisp-edges;background:#9bbc0f;}';
    document.head.appendChild(st);
    var lcd = document.getElementById('lcd');
    if (lcd) { lcd.classList.add('streamed'); document.body.appendChild(lcd); }
  }

  /* ---- 2. keep the pet out of blocking menus (nobody can press them live) - */
  var revealSince = 0;
  function unstick() {
    if (!H) return;
    var m = H.mode;
    if (m === 'setup') { H.newEgg('classic'); H.immortal(); return; }
    if (m === 'naming') { H.mode = 'roam'; return; }
    if (m === 'dead') { H.newEgg('classic'); return; }
    if (m === 'reveal') {
      if (!revealSince) revealSince = Date.now();
      else if (Date.now() - revealSince > 2500) { revealSince = 0; H.clearReveal(); }
      return;
    }
    revealSince = 0;
  }

  /* ---- 3. execute a forwarded command (already gated by the hub) --------- */
  function exec(cmd) {
    if (!H || !cmd || !cmd.name) return;
    var n = cmd.name;
    if (n === 'a' || n === 'b' || n === 'c') { H.press[n](); return; }     // raw buttons
    if (n === 'left') { H.press.a(); return; }                            // aliases → the 3 real buttons
    if (n === 'right' || n === 'select') { H.press.b(); return; }
    if (n === 'back') { H.press.c(); return; }
    if (n === 'skin') { return; }                         // device frame = handled by the overlay only
    if (n === 'style') { var i = STYLE_IX[(cmd.arg || '').toLowerCase()]; H.applyStyle(i == null ? 2 : i); return; }
    if (n === 'name') { H.act.name(cmd.arg); return; }
    var fn = H.act[n];
    if (fn) fn();
  }

  /* ---- 4. season detection ---------------------------------------------- */
  var seasonReported = false;
  function checkSeason(snap) {
    if (!snap) return;
    if (snap.terminal && !seasonReported) {
      seasonReported = true;
      emit({ type: 'season_win', form: snap.form, name: snap.name, petName: snap.petName, genus: snap.genus, stage: snap.stage });
      setTimeout(function () { if (H) H.newEgg('classic'); seasonReported = false; emit({ type: 'event', kind: 'new_season', text: 'A new egg appears! Season begins.' }); }, 6000);
    }
  }

  /* ---- 5. state broadcast ----------------------------------------------- */
  function pump() {
    if (!H) return;
    var snap = H.snapshot();
    if (!snap) return;
    emit({
      type: 'state', stage: snap.stage, form: snap.form, name: snap.name, petName: snap.petName,
      genus: snap.genus, hunger: snap.hunger, happy: snap.happy, energy: snap.energy, health: snap.health,
      asleep: snap.asleep, sick: snap.sick, poop: snap.poop, alive: snap.alive, lightOn: snap.lightOn,
      ageSec: snap.ageSec, points: snap.points, progress: snap.progress
    });
    checkSeason(snap);
  }

  /* ---- 6. hub link ------------------------------------------------------- */
  function emit(o) { try { if (ws && connected) ws.send(JSON.stringify(o)); } catch (e) {} }
  function connect() {
    try { ws = new WebSocket(WS_URL); } catch (e) { setTimeout(connect, 2000); return; }
    ws.onopen = function () { connected = true; emit({ type: 'hello', role: 'pet' }); };
    ws.onclose = function () { connected = false; setTimeout(connect, 2000); };
    ws.onerror = function () { try { ws.close(); } catch (e) {} };
    ws.onmessage = function (m) { var d; try { d = JSON.parse(m.data); } catch (e) { return; } if (d.type === 'cmd') exec(d); };
  }

  /* ---- 7. boot: wait for the bridge, then run --------------------------- */
  function boot() {
    isolateScreen();
    connect();
    var tries = 0;
    var wait = setInterval(function () {
      if (window.__hatch && window.__hatch.ready) {
        H = window.__hatch;
        clearInterval(wait);
        try { H.setBootMode('roam'); H.immortal(); } catch (e) {}
        unstick();
        setInterval(unstick, 700);
        setInterval(pump, 1000);
      } else if (++tries > 100) { clearInterval(wait); }
    }, 100);
  }
  if (document.readyState === 'complete') setTimeout(boot, 200);
  else window.addEventListener('load', function () { setTimeout(boot, 200); });
})();
