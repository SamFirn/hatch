# CLIP BATCH KIT — ready-to-shoot clips #2–4 (built 2026-07-10 overnight by Navi)

**Goal:** test 3 different hooks so we learn what stops the scroll. Post across the week (NOT all at once) → in a couple days check GoatCounter referrers to see which hook drove traffic, then double down.

**One-time setup each session (same as clip #1):**
1. Refresh the **OBS Browser Source** (loads the current clean overlay + pet).
2. Open **control.html** (`localhost:8787/control.html`) on a second screen — Navi's remote, you don't touch it.
3. Make sure the pet is **hatched** (past the egg) so the DESTINY badge reads. Re-roll with **🔄 new egg → 🥚 hatch** until you like the creature.
4. **Start Recording** in OBS (landscape — we crop to 9:16 in CapCut).
5. Say the trigger word → Navi runs the matching sequence → narrates beats → says "cut."
6. CapCut: 9:16 crop around the device + beat-timed captions → export 1080×1920 → post NATIVELY to TikTok + Reels + Shorts.

Each clip's drama is fired by ONE command (Navi runs it): `node Desktop/HATCH/stream/_clip_drive.js <name>`

---

## CLIP #2 — "MONEY / it changes LIVE"  → trigger: **"run tip"**  (`_clip_drive.js tip`, ~19s)
The revenue + agency hook: a tip visibly transforms the pet on stream. Best for the "wait, you can PAY to change it?" curiosity.

**Beats:** pet → play → TIP skin GOLD → TIP skin GALAXY (changes again) → TIP names it LEGEND → TIP boost (mega sparkles).

**On-screen captions (align to the visual beats):**
- 0–3s: `this pet is raised by twitch chat…`
- at first skin change: `…and a $1 tip changes it LIVE`
- at second change: `every tip = a new look`
- at name/boost: `you can even NAME it 👑`
- end card (last 3s): `watch → twitch.tv/hatchpet`

**Caption + hashtags:**
- **TikTok:** `wait til you see what a $1 tip does to this Twitch pet 😳 chat raises it live → twitch.tv/hatchpet` · `#twitchplays #virtualpet #tamagotchi #indiegame #twitch #pixelart #gaming #satisfying #twitchstreamer`
- **Reels:** same caption · `#twitchplays #virtualpet #tamagotchi #indiegame #pixelart #gaming`
- **Shorts:** title `A $1 tip changes this Twitch pet LIVE 🥚 #Shorts` · desc `Twitch chat raises one pet 24/7 and tips change it live. Watch: twitch.tv/hatchpet · Play your own: hatchpet.pages.dev`

---

## CLIP #3 — "NAME CHAOS"  → trigger: **"run cursed"**  (`_clip_drive.js cursed`, ~16s)
Comment-bait. Chat keeps renaming the pet to dumb stuff. Ends on a question that begs a reply → drives comments (the cheapest engagement signal).

**Beats:** pet → feed → named "Gary" → renamed "Beefcake" → renamed "Sir Hops".

**On-screen captions:**
- 0–3s: `letting twitch chat NAME my virtual pet was a mistake`
- at each name change: show the new name big (`Gary` → `Beefcake` → `Sir Hops`)
- end card: `what would YOU name it? 👇 twitch.tv/hatchpet`

**Caption + hashtags:**
- **TikTok:** `i let twitch chat name my virtual pet and it's already cursed 💀 what would you name it? → twitch.tv/hatchpet` · `#twitchplays #virtualpet #tamagotchi #indiegame #twitch #chaos #gaming #funny #twitchstreamer`
- **Reels:** same · `#twitchplays #virtualpet #tamagotchi #indiegame #pixelart #funny`
- **Shorts:** title `I let Twitch chat name my pet 💀 #Shorts` · desc `Chat raises + names one pet together, 24/7. Watch: twitch.tv/hatchpet · Play your own: hatchpet.pages.dev`

*(Ask viewers a question in your pinned comment too — "best name wins, drop it below 👇" — replies boost reach.)*

---

## CLIP #4 — "40 STRANGERS, NO COORDINATION"  → trigger: **"run chaos"**  (`_clip_drive.js chaos`, ~14s)
The collective-ownership / Twitch-Plays-Pokémon energy. Lots of different usernames firing conflicting commands → controlled chaos.

**Beats:** rapid flurry from a dozen different "users" — feed, play, a, b, clean, c, light off/on, pet, train, play, feed.

**On-screen captions:**
- 0–3s: `POV: 40 strangers are raising ONE pet together`
- mid (as commands fly): `nobody is in charge`
- `somehow it's still alive`
- end card: `come help → twitch.tv/hatchpet`

**Caption + hashtags:**
- **TikTok:** `40 strangers are raising one virtual pet on twitch and nobody's in charge 😭 → twitch.tv/hatchpet` · `#twitchplays #virtualpet #tamagotchi #indiegame #twitch #chaos #gaming #twitchstreamer #community`
- **Reels:** same · `#twitchplays #virtualpet #tamagotchi #indiegame #community #gaming`
- **Shorts:** title `40 strangers raising 1 pet on Twitch 😭 #Shorts` · desc `One pet, raised by Twitch chat together, 24/7. Watch: twitch.tv/hatchpet · Play your own: hatchpet.pages.dev`

---

## Notes
- **Profile pic for socials:** reuse `Desktop/HATCH/hatchpet-pfp.png` (512×512, the momo baby) — works for TikTok/IG/YouTube.
- **Cadence:** 1–2 clips/week is the sustainable target (job + kids). This kit = ~3 weeks of content from one ~30-min batch session.
- **All sequences verified** firing clean 2026-07-10 overnight; stream left in a clean HERO state.
- **After posting:** pin a funnel comment on each (`raise your own, live 24/7 → twitch.tv/hatchpet 🥚`), and reply fast to early comments.
- New driver help: `node _clip_drive.js` with no arg = hero; args = `hero|tip|cursed|chaos` (sequences) or a single beat (`feed|play|pet|sick|crisis|heal|skin|name|grow|reset`).
