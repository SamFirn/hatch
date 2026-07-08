# HATCH devlog — 2026-07-06 (evening): data-driven evolution engine + Batch 1 lineages

## What changed
Converted Hatch's evolution from **hardcoded if/else** into a **data-driven species graph (`DEX`)**, and authored the first batch of real lineages to the sprite-art study's anti-slop standard.

### The engine (the real unlock)
- New `const DEX` maps every species → `{stage, line, name, next}`.
- `next` is an ordered list of `{to, when(c)}`; **first satisfied branch wins**, last (no `when`) is the default.
- `metrics()` builds the care object `c` at each evolve: `{mist, care, overfed, trained, disc, low, good}`.
- `evolve()` is now generic: it walks `DEX[s.form].next` by `c`. Terminal adults (stage 4) omit `next`.
- `finishHatch()` pulls the baby name from `DEX`.
- **To grow toward 150: add sprites + DEX nodes. No engine changes needed.**

### Batch 1 = 4 lineages, fully playable (every path terminates)
Egg → 4 babies (distinct families: round/teardrop/eared/spiky) → child → teen → adult.

| Lineage | Motif | Baby | Child | Teen (refined / feral) | Adults |
|---|---|---|---|---|---|
| **Shell** | segmented dome + legs | Momo | Chib | Karpo / Rukk | Testudo, Bulwark |
| **Crest** | tall head crest | Pabu | Crelo | Coron / Ragga | Regalis, Coronox |
| **Wing** | side wings | Tama | Flit | Zeph / Skree | Zephyra, Skrayle |
| **Spike** | jagged crown | Nubb | Prik | Volt / Jagg | Voltaic, Jaggon |

Plus **3 universal "care-outcome" adults** any lineage can reach:
- **Dumplin** (chonk) — refined teen but overfed (`overfeed>=4 || weight>=55`)
- **Grumbo** (grump) — feral teen with many care mistakes (`care>=6`)
- **Runtling** (runt) — feral teen left sickly (`health<40`)

**27 forms total this batch** (1 egg not counted): 4 babies + 4 children + 8 teens + 8 lineage adults + 3 universal.

### Unlock conditions (how you steer evolution)
- **child → teen:** good care this stage (`mist<=1`) → refined teen; else feral teen.
- **refined teen → adult:** overfed → Dumplin; else the lineage's noble adult.
- **feral teen → adult:** many mistakes → Grumbo; sickly → Runtling; else the lineage's beast adult.

## Housekeeping
- Save bumped **v5 → v6** (`hatch01_save_v6`) — old pets reset to a fresh egg (form set changed).
- Removed dead name-pool constants (`NAMES_*`, `TEEN_NAMES`, `BABY_NAMES`); names now live in `DEX`.
- Old sprites (`child`, `teen`, `good`, `mid`, `child_b`, `teen_b`, `teen_c`) left in `SPRITES` but unreferenced — harmless; can prune later. `grump`/`chonk` reused as universals.
- Fallback sprite key `'baby'` → `'momo'` in `petKey()` and `renderDead()`.

## Verified
- `node` compile check: main script compiles clean.
- Integrity: all 27 DEX forms have sprites; all 32 edges resolve; **every path from an egg ends at a stage-4 adult**.
- Art: all sprites non-empty; every eye/mouth within sprite bounds. ASCII previews confirm 4 distinct silhouette families (no sameface).
- Deployed to `gs://hatch-pet-f771aff0/index.html` (71 KB, HTTP 200); origin serves v6 with DEX + new species names; legacy refs gone. Worker proxies with 60 s cache.

---

# BATCH 2 — +4 lineages (Bloom / Fin / Ear / Horn) — shipped same evening

Kupo checked batch 1 on his phone ("so far so good") → greenlit batch 2.

### Tree widened via the babies
Each baby now **branches by care** at hatch→child: **good care → its batch-1 lineage; rough care → a new batch-2 lineage.** No new babies needed.

| Baby | good care → | rough care → |
|---|---|---|
| Momo (round) | Shell | **Bloom** |
| Pabu (teardrop) | Crest | **Fin** |
| Tama (eared) | Wing | **Ear** |
| Nubb (spiky) | Spike | **Horn** |

### New lineages (motif → child → teen r/f → adults)
- 🌸 **Bloom** (leaf/petal crown + pinched stem): Sprut → Verda/Bramble → **Florabus / Bramblor**
- 🐟 **Fin** (dorsal sail + tail fin, asymmetric): Finn → Nael/Glub → **Marlin / Leviad**
- 🐰 **Ear** (long ears): Loko → Loppy/Houn → **Lopwyn / Houndal**
- 🦏 **Horn** (single central horn): Bram → Rylo/Gorn → **Rhyno / Goronax**

Same child→teen (good/feral) and teen→adult (overfed→Dumplin / mistakes→Grumbo / sickly→Runtling / else lineage adult) condition logic as batch 1.

### Totals now
**55 sprites | 47 DEX forms | 47 reachable | 19 terminal adults.** Per-line: shell/crest/wing/spike = 6 each, bloom/fin/ear/horn = 5 each, universal = 3.
Save kept at **v6** (no form removed → existing pets keep playing; they can now reach batch-2 lineages on rough-care runs).

### Verified (batch 2)
Same harness: syntax compiles; all 47 forms have sprites; all edges resolve; every path ends at a stage-4 adult; every eye/mouth in bounds. ASCII previews confirm the 4 new families are distinct (flower / fish / long-ears / single-horn). Deployed to GCS (79 KB, HTTP 200); origin serves Florabus/Marlin/Lopwyn/Rhyno + BATCH 2 marker.

## Bestiary map regenerated (evotree)
- **`evotree.html` rebuilt from the live `DEX` + `SPRITES`** via a new generator **`gen_evotree.js`** (reads hatch.html, extracts both, emits a lineage-grouped bestiary — no hand-copying, stays in sync). Re-run `node gen_evotree.js` after any future batch.
- Layout: egg→baby split (kind/rough care → lineage), 8 lineage panels (child→teen r/f→adults w/ condition chips), universal-outcomes row, legend. Animated sprites, 4-Shade Green, mobile-friendly (horizontal scroll per lineage).
- Deployed: **https://storage.googleapis.com/hatch-pet-f771aff0/evotree.html** (use the GCS URL, not the worker domain — worker catch-all serves index.html for other paths). Verified: all 47 cards resolve to real sprites.

---

# Phase-0 polish pass (pre-launch UX) — same evening

Kupo greenlit polishing for a Phase-0 (PWA) share + a feature list. All shipped to GCS, save kept **v6** (new fields backfilled on load — no reset).

- **Splash screen** — brief branded `HATCH · a virtual pet` boot screen (egg bob), auto-dismiss ~1.8 s or any key. New `mode='splash'`, `bootMode` captured from `load()`.
- **CONNECT tile → SUPPORT/donate** — repurposed the placeholder connect screen into a support ask that *funds* the future connect feature. `const DONATE_URL=''` (empty = shows "COMING SOON"; set a Ko-fi/PayPal.me link → "B: FUND IT" opens it). Framing: link/battle/visit coming, help fund it.
- **Custom pet name** — press **C** during naming → native `prompt()`, sanitized to font-safe chars, ≤8 chars. (A still cycles presets, B keeps.)
- **Status page auto-scroll** — was overflowing 64px. Now a slow vertical marquee (two-copy seamless loop, `statusScroll` @ ~9px/s) under a fixed title. Added a **POINTS** row.
- **Games: points + high scores** — per-game score = wins × {guess 10 / timing 15 / memory 20}; running `s.points` total + best-per-game `s.hi{}` saved; play-menu shows **BEST n**; result toast shows `NEW BEST n` / `+n`.
- **Animations** — training now shows an overhead **barbell + reps bounce + sweat**; eating adds a **chew bob**; **idle flourishes** (~every 9s: hop / turn / heart) during roam.
- **Analytics (opt-in)** — cookieless **GoatCounter** loader at page bottom, **off by default** (empty `GC` var = no external calls). Privacy-friendly, GDPR-safe, no consent banner. Kupo pastes his free endpoint to enable.

**Two placeholders for Kupo to fill (both free, ~2 min each):**
1. `DONATE_URL` in hatch.html → a Ko-fi / Buy-Me-a-Coffee / PayPal.me link.
2. GoatCounter `GC` var → sign up at goatcounter.com, paste the count URL.

**Verified:** syntax compiles; headless harness booted + ran 800 frames & 40 fuzzed A/B/C inputs across all modes with **zero throws**; deployed (87 KB), live markers present.

## Roadmap to 150 (still open)
- **Batch 3+:** deepen branches — secret/rare adults, cross-lineage conditions, discipline/weight/pace-gated forms, maybe stage-5 "elder" forms. ~47 → 150. (Re-run `gen_evotree.js` to refresh the map each time.)
- **Optional:** full in-browser per-sprite visual QA (eye-placement nudges).

---

# ★ LAUNCH-DAY FINAL STATE (2026-07-06 night) — authoritative snapshot

**Creatures:** 55 forms, 8 lineages, + stage-5 Elders (batch 3 shipped). 63 sprites. Data-driven `DEX` engine.

## Live URLs (all serve the same build, byte-for-byte in sync)
- **App (canonical, share this): https://hatchpet.pages.dev** (Cloudflare Pages, project `hatchpet`)
- **Bestiary map: https://hatchpet.pages.dev/evotree**
- **Feedback: https://hatchpet.pages.dev/feedback**
- **Old link (still works): https://hatch-pet.samfirn.workers.dev** — its `worker.js` now proxies Pages (`ORIGIN=https://hatchpet.pages.dev/`), so old shared links + already-installed PWAs auto-update.
- **GCS backup:** `gs://hatch-pet-f771aff0/index.html` + `/evotree.html` + `/press/*`.
- **Posting package (phone): https://storage.googleapis.com/hatch-pet-f771aff0/press/post.html**
- **Mock post previews: https://storage.googleapis.com/hatch-pet-f771aff0/press/mock-posts.html**

## DEPLOY FLOW (run all to keep every surface current)
```
# edit hatch.html, then:
cp hatch.html pages/index.html
cd ~/Desktop/HATCH && npx wrangler pages deploy pages --project-name=hatchpet --branch=main --commit-dirty=true
gcloud storage cp hatch.html gs://hatch-pet-f771aff0/index.html --content-type=text/html --cache-control="public, max-age=60"
# worker auto-follows Pages; if worker.js itself changes: cd hatch-cf && npx wrangler deploy
```

## Monetization & measurement (LIVE)
- **Analytics:** GoatCounter `https://samfirn.goatcounter.com/count` (dashboard samfirn.goatcounter.com). **Retention ping** sends events per load: `new-visitor`/`returning-visitor` + `day-1..day-30` (distinct days in `localStorage.hatch_days`). Filter to Events to see the return funnel.
- **Donate:** SUPPORT screen → B → `https://paypal.me/SamuelFirn` (@SamuelFirn).
- **Feedback:** SUPPORT screen → A → `/feedback` → **FormSubmit** (alias `02bd159c7f00e25d7fc4dfe73f3e9ea6` hides email) → emails samfirn@gmail.com. **Activated.** (FormSubmit mail may hit spam — mark not-spam.)
- **Monetization gates (advice):** keep tip jar now; add cosmetic IAP (skins exist) at ~50–100 steady DAU; ads + App Store only at ~1,000+ DAU / ~25k monthly views. Watch RETENTION, not raw counts.

## Launch/UX polish shipped this session (on top of Phase-0)
- **SEO/social:** Open Graph + Twitter Card meta + `pages/share-cast.png` → rich link previews (FB/iMessage/Discord/X).
- **Games:** now **endless until you miss** (guess=wrong guess, memory/timing=a miss); **high score = best streak, uncapped** (`s.hi`); headers show streak; old point-based highs auto-reset on load.
- **Onboarding nudge:** newborn starts **hungry** (`freshEgg` hunger:1/happy:1) so first-time players learn to feed.
- **Medicine animation** (capsule → pulsing cross → recovery sparkles). Now all care actions animate.
- **Mobile fix:** `touch-action:manipulation` on body/.btn/.chip-btn → no accidental double-tap zoom (pinch still works) + no tap-highlight flash.
- **Copyright:** `© 2026 Samuel Firn` notice in source. (Auto-copyrighted; registration optional. Watch-item = trademark the NAME "Hatch" — common word — before hard App-Store branding.)

## Share assets (hand-rolled, from live sprite data — regenerate via the scripts)
- `share-cast.png` (1200×630 cover) + `share-evolution.png` (1200×380 strip) — `make_assets.js` (pure-node PNG encoder).
- `hatch-evolve.gif` (240×220, egg→elder, loops) — `make_gif.js` (hand-rolled GIF89a, uncompressed-LZW, round-trip verified).
- `gen_evotree.js` regenerates the bestiary map from `DEX`+`SPRITES`.

## Save state
- `SAVE_KEY='hatch01_save_v6'` — kept through all changes; new fields backfilled on load, **no forced reset** for existing players.

## Open / next
- Kupo posting to personal FB tonight (has posting package); check GoatCounter (esp. returning-visitor / day-N) in the morning.
- **Chess Stops** still queued.
- **Phase 1 (if traction):** Capacitor wrap → App Store/Play + AdMob or IAP + **on-device local notifications** ("your pet misses you") + privacy policy. NO backend until real demand.
