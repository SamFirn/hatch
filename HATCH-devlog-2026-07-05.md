# HATCH · Dev Log — 2026-07-05

A running journal for the HATCH virtual-pet project (Tamagotchi/Digimon-inspired).
Written for future-us so we can pick up cold.

---

## What HATCH is
A virtual-pet app "the most awesome advanced virtual pet in your hand."
Cross-platform target (PC/Mac/iPhone/Android via the web build), with a
**long-term goal of manufacturing a physical device** — so design stays
portable to cheap hardware (fixed pixel LCD + 3 buttons).

Currently: one **self-contained HTML/canvas file** (`hatch.html`). No backend,
no build step, no dependencies. Saves each pet in the player's browser
localStorage. Real-time sim via wall-clock timestamps.

---

## Where everything lives
- **Master source:** `hatch.html` (single file). Working copy in this session's
  scratchpad; canonical copies pushed to GCS (below) and a Claude Artifact.
- **Live tester link (public, HTTPS, any phone, $0/mo):**
  `https://hatch-pet.samfirn.workers.dev`
- **Hosting:** the user's **GCS** bucket `gs://hatch-pet-f771aff0`
  (object `index.html`, public-read) fronted by a **Cloudflare Worker** named
  `hatch-pet` on account subdomain `samfirn.workers.dev`. Worker project files
  in scratchpad `hatch-cf/` (worker.js proxies the GCS object; wrangler.toml).
- **Claude Artifact (kept in sync):**
  `https://claude.ai/code/artifact/1f38372b-ffd4-4de9-bd5a-cb5617b10665`
- **Art Direction Lab artifact:** compares the 6 render styles side-by-side.
- **Tester note:** Desktop `HATCH-tester-note.txt` (full, w/ internal notes) and
  GCS public `https://storage.googleapis.com/hatch-pet-f771aff0/tester-note.txt`
  (tester-safe version).
- Accounts: Google `samfirn@gmail.com`, GCP project `project-f771aff0-2c6b-45cf-b2e`.

## Release / deploy flow
1. Edit `hatch.html`.
2. `gcloud storage cp hatch.html gs://hatch-pet-f771aff0/index.html --content-type=text/html --cache-control="public, max-age=60"`
3. Cloudflare Worker serves the new version within ~60s. No worker redeploy needed.
4. (Optional) re-publish the Claude Artifact to keep it in sync.
Note: GCS public URL can serve a stale edge cache for up to ~60s; add `?cb=<ts>`
to bust it when verifying.

---

## Build history (v0.1 → v0.9)
- **v0.1** Playable prototype: 3-button icon UX, real-time sim, care loop,
  branching evolution (adult only), poop/sickness/sleep, WebAudio beeps.
- **Art Lab** — 6 render styles compared. Locked **4-Shade Green** as default
  (retro-bit but modern), auto-shaded from 1-bit silhouettes; swappable.
- **v0.2** Ported shaded engine into the game; **Classic vs Zen** care modes.
- **v0.3** Per-action animations (eat/clean/medicine/train), **visible day/night
  light toggle**, head-shake "decline" feedback.
- **v0.4** Gentler pacing, fewer ailments, post-hatch illness grace, quieter chirps.
- **v0.5** Full **branching evolution tree** (baby→child→teen→adult, ~10 forms).
- **v0.6** **Device skins** (12 cases incl. see-through '90s w/ internals + pin),
  hatch cutscene, name-your-pet, evolution reveal screen, reset button.
- **v0.7** **Tester pace** (multi-day; first evo ~4 min) + `F` = 60x fast-forward
  (dev only), refined sprites, sparkle juice, offline growth catch-up.
- **v0.8** **In-app art-style switcher** (🎨 cycles all 6 styles, saves per phone),
  **4 random baby variants** (Momo/Pabu/Tama/Nubb), richer transparent internals
  (ribbon cable, 2 chips, resistor, solder pads, coin cell, silkscreen), glossier
  plastic + corner screws.
- **v0.9** (2026-07-06) **Commercial pacing** (AUTHENTIC ≈1 heart/hr, poop ~2h,
  15-min call window) + a **PACE setting** (Authentic vs Gentle) chosen at hatch
  AND changeable live on the Status/Settings screen (press A). Two new minigames
  via a PLAY game-picker: **Copy-Me** (Simon memory) and **Timing** (stop the
  marker), alongside the original Guess. `PACE_MULT`=1.8 for Gentle.

- **v0.10** (2026-07-06) **Installable PWA**: added web manifest, service worker
  (offline app-shell cache), maskable SVG icon, and mobile viewport/theme meta.
  Served by the Cloudflare Worker inline (`/manifest.webmanifest`, `/sw.js`,
  `/icon.svg`); the app still lives in GCS. HATCH now "Add to Home Screen"s as a
  full-screen offline app on iOS/Android. Worker files recreated in `hatch-cf/`.

## Lock-screen / always-on — findings & decision (2026-07-06)
Q: can HATCH be an interactive lock-screen pet? A: **not a full app on the lock
screen** — iOS forbids it; Android's keyguard blocks lock-screen touch. Closest:
lock/home **widgets** (tap-to-care via App Intents, snapshot only) and Android
**live wallpaper** (animated, but touch works on home screen, not lock). All of
that needs **native** iOS/Android code — our web app can't touch the lock screen.
True "pet pings you when closed" needs a **small push backend** (VAPID + a
scheduler; can live on a Cloudflare Worker/Cron). **Decision:** stay web; shipped
the **PWA install** now as the honest "always with you" step; **parked** native
widgets/wallpaper + push backend until after tester feedback.

## Session 2 notes (2026-07-06)
- ⚠️ The temp **scratchpad got auto-cleaned** mid-session — local `hatch.html`
  and `hatch-cf/` vanished. **Recovered instantly** by pulling from GCS:
  `gcloud storage cp gs://hatch-pet-f771aff0/index.html hatch.html`. Lesson: GCS
  is the source of truth; the Cloudflare Worker is already deployed and needs no
  local files to keep running.
- Built a **standalone evolution-map artifact** (`evotree.html`) for internal
  reference only — NOT shipped in the product (user's call).

## Key decisions
- Art = 4-Shade Green default, but testers can switch among 6 (gathering opinions).
- Forgiving by design: never returns a dead pet from offline; sickness precedes death.
- Branching driven by care metrics (care mistakes per stage, training, discipline,
  weight, overfeeding). Baby form is now random for reset variety.
- All timing lives in the `T{}` block; all colors in the `STYLES[]` array.

## Dev tips
- Press **`F`** in-app to fast-forward time 60x (watch the whole evolution tree in
  ~2 min). Leave this OUT of tester materials so pacing feedback stays honest.
- **⟲** button resets the pet. **🔀** shuffles case, **📌** pins it, **🎨** cycles art style.

---

## Architecture note (no backend — yet)
HATCH is currently a **pure client-side (front-end-only) app**: all logic runs in
the browser; each pet saves to that device's localStorage. GCS = static file
hosting; the Cloudflare Worker = a thin proxy (not app logic). There is **no
server, no database, no API**. A backend only becomes necessary if/when we add:
cross-device sync / accounts, online battling between real users, cloud saves,
leaderboards, tester analytics, or purchases. Deliberately kept serverless for
now — cheap, offline-capable, and portable to the eventual physical device.

## Open items / next up
- **v2 = Battling** (the Digimon "Connect" hook): train stats → CPU battle, later
  device-to-device. Deliberately deferred to build from tester feedback. The
  connector prongs + CONNECT menu are already stubbed in.
- **Baby choice is currently cosmetic** — all 4 babies funnel to the same 2
  children by care only. Optional tweak: branch children/teens by baby lineage.
- More polish: hatch/evolve set-pieces, more skins, refine adult sprites.
- Distribution when ready: PWA + Capacitor for app stores.
- **Waiting on:** first-round tester feedback (first impression, too needy vs too
  quiet, confusion points, which art style they like).

## Feedback log (add entries as they come)
- (none yet)

## 2026-07-06 — bookmark/favicon fix
- **Problem:** saving a bookmark showed the default letter icon, not the egg.
- **Cause:** `<head>` had `apple-touch-icon` + manifest but **no `<link rel="icon">`**, and the worker returned app HTML for `/favicon.ico`.
- **Fix:** added `<link rel="icon" href="/icon.svg" type="image/svg+xml">` to `hatch.html` head; worker now serves `/favicon.ico` & `/favicon.svg` as the egg `ICON` svg (route: `/icon.svg || /favicon.ico || /favicon.svg`).
- Deployed: `index.html` → GCS; worker → `wrangler deploy`. Both verified live (200, image/svg+xml). Local `hatch.html` + `hatch-cf/worker.js` synced.
- **Sprite art study added** to the bundle: `HATCH-sprite-art-study.md` (design method for new creature silhouettes + evo-tree motifs). Next: pick lineages, author into `SPRITES{}`.
