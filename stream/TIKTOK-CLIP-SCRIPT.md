# TikTok clip — "everything you can do to the pet" (recorded live via OBS)

**Written 2026-07-21 against the ACTUAL live pet**, so every beat is guaranteed to produce a
visible reaction. Pet + skin stay exactly as they are — no `skin`, `style` or `name` commands
anywhere in this script.

## The pet we're filming

| | |
|---|---|
| Creature | **Gargoyle** (`gar_child`) — stage 2 child, **skywing** genus, **noble** path |
| Vitals at time of writing | hunger **1**/4 · happy **1**/4 · energy 66 · health 100 · **1 poop on screen** · **lights off** |
| Season progress | 0.4 toward the next evolution |

That neglected state **is the hook.** Don't fix anything before you record — the whole clip is
the rescue. If chat happens to feed/clean him before you hit record, either wait for him to get
hungry again or just re-order: open on `light` instead (lights-off → on is the biggest single
visual jump on screen).

---

## OBS setup (one-time, ~3 min)

1. **New scene** → `hatch-vertical`. Settings → Video → **Base + Output resolution 1080×1920**.
2. Add **ONE** Browser Source: `http://localhost:8787/overlay.html`, size **1920×1080**.
   > ⚠️ **Never add a second browser source pointing at `pet.html`.** It starts a *second* pet
   > engine that fights the real one and corrupts the live pet's state. One source, the overlay,
   > always. (This already bit us once — see the note at the top of `_make_clip.js`.)
3. Select the source → **Crop/Pad filter**: left **610**, right **610**, top **0**, bottom **0**.
   That isolates the device + aura column (700px wide).
4. Scale it to **1080 wide** and center. You'll have ~127px of clean margin top and bottom —
   that's where the on-screen text goes.
5. Recording settings: **60fps**, MP4, high bitrate. 60fps matters — the sprite animations and
   the boost fireworks are the whole point and 30fps mushes them.
6. Do a 5-second test record and check the LCD is crisp (`image-rendering: pixelated` should keep
   it sharp; if it looks blurry, your scale isn't on a clean integer — nudge it).

---

## The shot list (~30s)

Fire the commands with **`node _clip_director.mjs`** (next section) so the timing is exact and the
usernames vary. Times are from the moment the director starts.

| t | Beat | What lands on screen | On-screen text |
|---|---|---|---|
| 0:00 | **Cold open — do nothing** | Gargoyle sitting there hungry, poop next to him, screen dim | "he is being raised by strangers on the internet" |
| 0:02 | `feed` | eats, hunger meter jumps, happy chirp | "they can feed him" |
| 0:06 | `clean` | poop sweeps away | "clean up after him" |
| 0:09 | `light` | **screen snaps from dim to lit** — biggest single visual delta | "turn the lights on" |
| 0:11 | `play` | minigame fires, he bounces | "play games with him" |
| 0:16 | `pet` | hearts float up | "pet him" |
| 0:19 | `train` | training animation, discipline ticks | "train him" |
| 0:22 | `snack` | quick second eat, happy meter tops out | — |
| 0:24 | **`$boost`** (paid) | **fireworks + full care surge** — the money shot | "or drop a tip and go nuclear" |
| 0:28 | Hold on the happy pet | vitals all green, season bar visible | "raise your own 👇 free, no app store" |

**Deliberately skipped:**
- `heal` — he isn't sick, so it plays the *refusal* head-shake. Reads as broken on camera.
- `skin` / `style` / `name` — you said leave the look alone. Save the skin-swap reveal for its
  own clip; it's the strongest single visual in the whole build and deserves 30s to itself.

---

## Audio

Two options, pick before you record:

- **Trending sound (recommended for reach).** Record silent, add the sound in TikTok. Every beat
  above is ~2-4s, so it cuts cleanly to most beat-drop audio. Put the `$boost` fireworks on the drop.
- **Native chiptune.** The overlay has its own music/SFX — tick "Control audio via OBS" on the
  browser source. More charming, meaningfully worse reach. Only do this if the clip is for the
  Twitch panel rather than TikTok.

---

## Caption + posting

> Chat has been raising this thing for 11 hours straight. He was starving when I hit record.
> Type feed / play / clean in chat and you're raising him too 🥚
>
> Play your own (free, runs in the browser): hatchpet.pages.dev

**Use the tagged link so we can actually measure it:**
`https://hatchpet.pages.dev/?campaign=launch&src=tiktok`
(Bare links are how we ended up with 80% of traffic showing no source — see `ANALYTICS.md`.)

Hashtags: `#virtualpet #tamagotchi #twitchplays #indiegame #webgame #pixelart #90skid`

**First comment:** drop the Twitch link there, not in the caption — TikTok suppresses captions
that push people off-platform. `twitch.tv/hatchpet`

---

## After you post

Check GoatCounter the next day: **Events → `hatch/hatched` ÷ `hatch/new-visitor`.** If TikTok
sends traffic but activation is low, the clip is selling something the landing page doesn't
deliver in its first 12 seconds — that's a clip problem, not a game problem.
