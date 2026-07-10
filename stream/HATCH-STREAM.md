# HATCH :: CHAT — "Twitch Plays Hatch" design + build

> One egg. Everybody raises it. When chat evolves it to its final form, the
> **season** is won, it enters the Hall of Fame, and a fresh egg begins.
> A cozy, always-on, chat-driven creature stream — and a funnel to the real
> Hatch app (**hatchpet.pages.dev**).

The hidden goal behind this whole project: **drive traffic + installs to Hatch.**
Every screen points people to "raise your own."

---

## Why this works (and what TPP taught us)

Twitch Plays Pokémon hit 120k concurrent / 1.16M participants. The lessons we
built around:

| TPP lesson | What we did |
|---|---|
| Real-time games die under mass input; **turn-based/slow works** | Hatch is slow-care by nature — perfect. No twitchy mechanics. |
| **Irreversible griefing** (mass-releasing Pokémon, "Start9" freeze) ruined runs | **No single command is destructive.** The pet is **immortal on stream** — neglect makes it sad/sick, never dead. |
| **One 16-day marathon** → magic leaked out, no reason to return | **Seasons.** Each evolution-to-final is a self-contained win + fresh start = infinite highlights + a reason to come back. |
| **Anarchy vs Democracy** *was* the entertainment | Both modes built in. Chat votes to switch (supermajority → Democracy). |
| **Emergent lore/naming** (Bird Jesus, Lord Helix) drove retention | Naming is a **paid, first-class** action; every season's pet + name is immortalized in the Hall of Fame. |
| Input lag + chat load stressed everything | Per-user cooldowns + a **drained command queue** (rate-capped) so 5,000 "feed"s can't nuke the engine. |

---

## The interaction ladder (free → paid)

The healthiest funnel: **watch → act for free → pay for the power moves.**

**FREE** (plain chat, or map to Channel Points later):
`feed` `snack` `clean` `train` `heal` `light` `pet` `play`
→ high-frequency, keeps chat active, costs viewers nothing but attention.

**PAID** (Bits/cheers now; tips via Streamlabs later):
- `boost` — mega care surge + fireworks
- `skin <name>` — **flagship $1 item**: reskins the whole device for everyone watching (classic/dusk/mono/bubblegum/midnight/gold). Visible = ego = people pay.
- `name <text>` — rename the pet (goes in the Hall of Fame forever)

Paid actions **bypass cooldown + democracy** and fire a loud celebration. That's the value.

---

## Anti-grief rules (enforced server-side, one place)

All gating lives in `server.js` so the pet/overlay just execute + display:
- **Per-user, per-command cooldown** (default 2.5s).
- **Free vs paid gating** — paid commands ignored unless they carried Bits.
- **Profanity + length caps** on `name`/`skin`.
- **Queue drain cap** (default 5 cmds/sec to the pet) — anti-spam.
- **Immortality** — `die()` is overridden in the pet to a recoverable faint.
- **Democracy tally** — in vote mode, one winning command per window.

---

## Architecture

```
             ┌─────────────── server.js (Node) ───────────────┐
Twitch chat ─▶ ingest() → anti-grief gate → queue / vote tally │
 (or SIM)     │            │                        │          │
             │            ▼ WebSocket hub ◀─────────┘          │
             └────┬───────────────┬───────────────────────────┘
                  │ cmd            │ state / feed / alert / vote
                  ▼                ▼
            public/pet.html   public/overlay.html  ← the OBS Browser Source
          (real Hatch engine  (device frame + panels + the pet in an iframe)
           + stream-harness.js)
```

- **`public/pet.html`** = the real 211-form Hatch engine (`hatch.html`) copied
  verbatim + `stream-harness.js` appended (isolates the LCD, makes the pet
  immortal, executes forwarded commands, detects season wins, broadcasts state).
  One-line engine tweak: season-speed multiplier.
- **`public/overlay.html`** = the whole broadcast scene (1920×1080). Loads the pet
  in the device screen via `<iframe>`, draws all panels, plays procedural
  chiptune (no audio files → zero DMCA risk).
- **`server.js`** = static server + WS hub + Twitch (tmi.js) + SIM console + Hall
  of Fame persistence (`halloffame.json`).

## Overlay layout (built)
- **Header:** logo + live MODE badge (Anarchy/Democracy).
- **Left:** Season goal bar (egg→final) · Vitals (hunger/happy/energy/health) · status line.
- **Center:** the themeable **device** with the live pet + name/genus tag.
- **Right:** Live action feed (every viewer input scrolls by — the dopamine) · Top Supporters ♥ · Hall of Fame.
- **Bottom:** big **"RAISE YOUR OWN → hatchpet.pages.dev"** funnel + command help.
- **Floating:** paid-action alerts + confetti · Democracy vote panel · day/night tint.

---

## Monetization notes
- **Bits** (real money) require Twitch **Affiliate** (50 followers, 500 min
  streamed, 7 unique days, 3 avg viewers — usually a couple weeks of streaming).
- **Until Affiliate:** run on **tips** — Streamlabs/StreamElements tip page; set a
  tip-alert to post `boost` / `skin gold` / `name X` into chat, and the bot picks
  it up as a paid command. Same code path.
- **Channel Points** (free, earned by watching) are the ideal home for the FREE
  actions later — add via Twitch's Reward → the bot reads redemptions (EventSub).

---

## Roadmap / buildable slices
1. **DONE — playable scaffold** (this folder): sim-testable, OBS-ready, seasons, anti-grief, monetization hooks, funnel.
2. **Go live (SIM→Twitch):** Sam makes the account + token → flip `twitch.enabled`. *(see SETUP.md)*
3. **Tips wiring:** Streamlabs tip page + alert-to-chat rule.
4. **Channel Points:** move free actions onto points via EventSub (needs app client-id/secret).
5. **Polish:** more skins, seasonal lore events, "the pet misses you" idle beats, a clip-worthy evolution cam.

## Status: what's built vs pending
- [x] Real Hatch engine wrapped for stream (immortal, controllable, seasons)
- [x] Full OBS overlay (device, vitals, feed, supporters, HoF, votes, CTA, chiptune)
- [x] Hub server: anti-grief, Anarchy/Democracy, Bits→paid, SIM console, HoF persistence
- [x] Config template + docs
- [ ] **Sam:** Twitch account + OAuth token *(SETUP.md step 1–3)*
- [ ] **Sam:** payment route (Affiliate/Bits or Streamlabs tips) *(SETUP.md step 6)*
- [ ] Deploy target (run on your PC beside OBS, or a small always-on box)
