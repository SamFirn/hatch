# SETUP — going from scaffold to live

Everything is built. This is the **only** list of things that need *you* (Sam):
a Twitch account and a payment route. ~20 minutes.

---

## Right now (no Twitch needed) — see it work
```bash
cd Desktop/HATCH/stream
npm install
npm start
```
- Open **http://localhost:8787/overlay.html** in a browser → the stream scene.
- In the terminal, type commands as if you were chat:
  - `feed` `play` `clean` `train` `heal` `light`  → free actions
  - `$skin dusk`  `$name Kupo`  `$boost`  → **`$` = a PAID (Bits) action**
  - `democracy` / `anarchy` (type a few times) → flip governance mode
- Watch the pet react, the feed scroll, alerts + confetti fire, and the season
  bar fill as it evolves. Reach the final form → Hall of Fame + fresh egg.

---

## Step 1 — Make the Twitch account
Create the channel account at **twitch.tv** (this is the channel people watch).
Optionally a **second** account as the bot (cleaner, but the channel account works too).

## Step 2 — Get a chat OAuth token
Easiest: **https://twitchtokengenerator.com** (pick "Bot Chat Token") or
**https://twitchapps.com/tmi**. Copy the token — it starts with `oauth:`.

## Step 3 — Turn it on
```bash
cp config.example.json config.json
```
Edit `config.json` → `"twitch"`:
```json
"twitch": {
  "enabled": true,
  "username": "your_bot_or_channel_login",
  "oauth": "oauth:xxxxxxxxxxxxxxxxxxxxxxxxx",
  "channel": "your_channel_login"
}
```
Then `npm start`. Console should print `connected to #yourchannel`. Now real chat
messages drive the pet.

## Step 4 — Put it in OBS
- Add Source → **Browser** → URL `http://localhost:8787/overlay.html`
- Size **1920 × 1080**. Tick **"Control audio via OBS"** if you want the chiptune
  captured (or turn music off with `.../overlay.html?music=0`).
- That single source *is* the whole scene. Go live.
- **Chat box for testing / mods:** open `http://localhost:8787/control.html`.

## Always-on (24/7)
- Launch with **`start-24-7.bat`** (double-click) — it **auto-restarts the server if it crashes**.
- The server also catches unexpected errors instead of dying. Keep your PC awake (disable sleep).
- To stop for good: close that window.

## Money & estimates
- See **`MONETIZATION.md`** for pricing, ad-revenue mechanics, revenue estimates by viewer count,
  security notes, and the pre-launch checklist.

## Step 5 — Tune it
In `config.json`:
- `seasonSpeed`: **1** = real-time (long, ambient seasons). Higher = faster
  evolution (good for launch hype / short attention). Try `3`–`6` early on.
- `perUserCooldownMs`, `queueDrainPerSec`, `democracyWindowMs` — pacing knobs.

## Step 6 — Payment routes (pick one to start)
**A. Tips (works day one, no requirements):**
- Make a **Streamlabs** or **StreamElements** account, get your tip page.
- Add an alert rule: on tip, send a chat message like `boost` or `skin gold`
  (or let donors type a keyword) → the bot treats Bits-tagged/tip messages as paid.
- Share the tip link in your panels + the overlay already shows the funnel.

**B. Bits (needs Twitch Affiliate):**
- Hit Affiliate (50 followers · 500 min streamed · 7 unique days · 3 avg viewers).
- Bits/cheers automatically count as **paid** commands — no extra code.

**C. Channel Points (free currency, later):**
- Great for the FREE actions. Needs a Twitch app (client-id/secret) + EventSub.
  That's roadmap step 4 — ping me when you want it.

---

## Go-live checklist
- [ ] `config.json` created, `twitch.enabled: true`, token valid
- [ ] Console shows `connected to #channel`
- [ ] OBS Browser Source at 1920×1080, overlay visible, pet moving
- [ ] Test: type `feed` in your own chat → pet eats
- [ ] Test: cheer 1 Bit with `skin dusk` (or tip route) → device reskins + alert
- [ ] Tip/Bits route live and linked in panels
- [ ] `seasonSpeed` set to taste
- [ ] Pinned message in chat: the command list + "raise your own at hatchpet.pages.dev"
