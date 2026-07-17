# HATCH — Growth Plan (cofounder doc)

**North star (set 2026-07-10):** Hatch is (A) Sam's portfolio centerpiece AND (B) a stream community we grow into **passive income**. The stream (twitch.tv/hatchpet) is the vehicle; tips/subs/bits/ads are the money; **clips are the fuel.**

**Data baseline (launch → 2026-07-10):** 41 new visitors · day-2 ~20% · day-3+ ~17% · **referrers = 0.**
**Diagnosis:** product retention is GOOD; **discovery is the entire bottleneck.** No clip has ever been posted. Fix that and everything else follows. (Pull fresh numbers anytime: `python cofounder_report.py`.)

---

## BRAINSTORM 1 — Tonight's hero clip (shoot-ready)

**Concept:** *"I let Twitch chat raise a virtual pet. It's chaos."* — lead with the CONCEPT because a cold scroller has zero context; the hook must explain what they're seeing in ~2 seconds, then deliver stakes.

**Why concept-first (not the "dying pet" drama) for clip #1:** the drama clip needs the viewer to already care about the pet. The concept clip creates that care. Save "dying pet" and "a tip changed the pet" for clips #2–3 once people know the premise.

**Shot list (target 20–30s, VERTICAL 9:16):**
| Time | Shot | On-screen text |
|---|---|---|
| 0–3s | Pet on screen + live chat commands scrolling | "I put a Tamagotchi on Twitch and let chat raise it 😭" |
| 3–10s | Chat types feed / play / clean → pet reacts; A/B/C buttons press | "Every move comes from chat" |
| 10–18s | Pet gets SICK — health bar crashes, overlay flashes "sick — needs medicine 💊"; chat scrambles to heal/boost → recovers; then a TIP pops → pet skin/name changes live | "It gets sick — chat has to save it. And a $5 tip changes it LIVE" |

> **TRUTH GUARDRAIL (Sam flagged 2026-07-10):** the STREAM pet is immortal by design (anti-grief, `H.immortal()` / GENTLE "never dies"). NEVER imply death on stream. Real, showable stakes = **sick / health-crash / "needs medicine 💊" / revive** — dramatic and honest. (The standalone APP pet *can* die; that's fine solo, but the clip is about the stream.)
| 18–25s | Evolution / a funny beat | "One pet. Everyone raising it. Evolves over 2 days." |
| 25–30s | CTA card | "Watch → twitch.tv/hatchpet · Play → hatchpet app" |

**How we shoot it tonight (staged — no live audience needed):**
1. Sam opens the **overlay** (`localhost:8787/overlay.html`) or pet view; it shows pet + chat + actions.
2. Navi drives the sequence on cue via `control.html` (feed/play → drain energy → heal → fire a test tip that changes skin/name), so the drama happens on demand while Sam records.
3. Sam screen-records (Windows: Win+Alt+R, or OBS record). Landscape is fine — crop to vertical around the handheld device (it's already tall) in **CapCut** (free), add the text overlays above.
4. Post to TikTok + Reels + Shorts (same file). Takes one recording, 3 posts.

**Caption + hashtags (paste-ready):**
- **TikTok:** `I put a virtual pet on Twitch and let chat raise it together. it's going exactly how you'd think 😭 watch it live → twitch.tv/hatchpet` · `#twitchplays #tamagotchi #virtualpet #indiegame #twitch #pixelart #gaming #chaos #twitchstreamer`
- **Reels/IG:** same caption, hashtags: `#twitchplays #tamagotchi #virtualpet #indiegame #pixelart #gaming`
- **Shorts:** title `Twitch chat is raising a virtual pet 🥚` · desc: `Chat raises one pet together, 24/7. Watch: twitch.tv/hatchpet · Play your own: [hatch app link]`

**Trigger:** when Sam's ready tonight he says "let's shoot the clip" → Navi fires up staging.

---

## BRAINSTORM 2 — The passive-income community flywheel

**The loop:** Clips (discovery) → viewers → stream (the hub) → community belonging → tips/subs (money) → some viewers play the app → app's LIVE link funnels back to stream. App and stream feed each other.

**The moat = collective ownership.** Twitch Plays Pokémon worked because chat *owned* the outcome together — drama, memes, "we did this." Our engine should maximize: shared stakes (one persistent pet), clippable moments, and **tip-driven agency** ("*my* $5 named the pet"). That last one is both the engagement hook AND the revenue mechanic — lean into it hard.

**Prioritized moves:**
- **P0 — tonight:** ship clip #1. Nothing else matters until discovery starts.
- **~~P1 — Discord~~ → DEFERRED (Sam pushed back 2026-07-10, correctly).** Hatch is a simple cozy toy — no depth, no live drama at ~0 viewers, no creator personality on the bot stream. A Discord now = a ghost town, which signals "dead." Community is a LAGGING move: build it only when there's PULL. **Trigger to revisit:** stream has consistent regulars OR someone actually asks "is there a Discord?" Until then the community surfaces that work at tiny scale are (a) **Twitch chat itself** (for a Twitch-Plays format, the live shared chat IS the community) and (b) **clip comment sections** — both free, neither can look dead.
- **P1 — make the tip mechanic LOUD on stream:** an on-screen callout/goal bar — "Tip to change the pet: <$5 boost · $5 skin · $10 name it forever (Hall of Fame)." Viewers can't tip for power they don't know exists.
- **P2 — clip cadence:** 1–2 clips/week, batch-shoot when a good moment happens. Sustainable around job + kids.
- **P2 — push to Twitch Affiliate:** needs ~50 followers / 4 avg viewers / 4 stream-days / 3 avg viewers. Clips → followers → Affiliate → subs+bits withdrawal unlocked.

**Honest passive-income ladder (so we track reality, not hype):**
1. **First 50 Twitch followers → Affiliate.** (Clips are the only path. Milestone 1.)
2. **Consistent 5–10 concurrent viewers → tips + subs become a small real trickle.**
3. **~50 concurrent → the ~$250–300/mo range** (from the grounded monetization math in MONETIZATION.md).
> None of this is "passive" until an audience exists. The 24/7 autonomous stream is the "build once" part; clips are the ongoing work that turns it on. Realistic near-term = small trickle + slow follower growth. This is a *portfolio + audience* play with income as the upside — which matches the job hunt being the real income plan.

**Navi's standing jobs:** weekly data report (now automated), clip scripts + captions, staging stream moments on cue, tracking what converts. **Sam's jobs:** record + post (needs his accounts), be present on stream at peak when he can.

---

## BRAINSTORM 3 — The core reframe: "chat decides what it BECOMES" (2026-07-10)

**Problem:** the stream is low-stakes ("feed a pet") → hard to clip, hard to grow. The immortal pet has no visible tension.

**The unlock (already built, just hidden):** the engine has full **data-driven branching evolution** (`pet.html:942`). Collective care quality — mistakes, discipline, overfeeding, letting it get sick — determines whether the pet evolves NOBLE/refined vs FERAL / grump / runt / chonk. Irreversible, crowd-decided, different final creatures. **BUT the overlay snapshot (`stream-harness.js:87-90`) only exposes hunger/happy/energy/health/etc. — it NEVER exposes the branch. So chat can't see their choices matter.**

**Reframe the whole stream:** from *"keep a pet alive"* → **"Twitch chat is deciding what this creature becomes — noble hero or feral beast. How they raise it is the vote, and they can't undo it."** Grief-proof (bad path = still a cool creature; needs sustained collective neglect), gives agency + stakes-without-death + replay + emergent lore. This is the TPP secret sauce we already own.

**Minimal build to make it TRUE + VISIBLE:** expose branch metrics (care/mist/disc/low/good, trend) in the snapshot → add a live **"PATH: NOBLE ⚔️ / trending FERAL 🩸"** forecast widget to `overlay.html`. Small change, huge framing payoff. Clip hook becomes *"chat is raising a monster and how they treat it decides hero vs beast."*

**Sprite-contrast idea (Sam, 2026-07-10) — how to do it WITHOUT betraying the cozy pixel pet:** express hero/beast contrast in the FRAME, not the sprite. Keep the creature simple/Tamagotchi. Telegraph the path via **palette + aura + background tint** (noble = cool/regal + soft glow; feral = dark/red + rough edges) and lean on the already-existing contrasting final forms (refined vs grump/runt/beast). Cheap, strong, stays true to the concept. Backlog.

**Supporting ideas (backlog, don't build yet):** (1) prominent **season GOAL + progress** ("raise it to its final form") = the mission; (2) **elevated tip agency** — tips nudge the branch or unlock canon cosmetics (FOMO + revenue); (3) **AI/Navi-voiced live narrator ticker** — turns idle stream into something alive/funny/clippable, a real differentiator; (4) random **"events"** (wild egg, sickness outbreak) for scheduled drama beats; (5) **Top Caretaker** shout-outs for repeat participation. Prioritize AFTER the reframe + first clips prove discovery works.
