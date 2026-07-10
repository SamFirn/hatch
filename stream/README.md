# HATCH :: CHAT — Twitch Plays Hatch

Chat collectively raises a [Hatch](https://hatchpet.pages.dev) virtual pet.
Evolve it to its final form to win the **season**; then a fresh egg begins.

```bash
npm install
npm start          # SIM mode — type commands in the terminal
```
- Overlay (OBS Browser Source): http://localhost:8787/overlay.html
- Pet only (debug): http://localhost:8787/pet.html?spd=6

**SIM commands:** `feed play clean train heal light pet snack` · `$skin gold` `$name Kupo` `$boost` (`$` = paid) · `democracy`/`anarchy`.

Going live on Twitch + payment routes → **SETUP.md**.
Design, TPP lessons, architecture → **HATCH-STREAM.md**.

Files:
- `server.js` — hub: static + WebSocket + Twitch (tmi.js) + SIM + anti-grief + Hall of Fame.
- `public/pet.html` — the real Hatch engine + `stream-harness.js` (immortal pet, seasons, state broadcast).
- `public/overlay.html` — the full 1920×1080 broadcast scene.
- `config.example.json` — copy to `config.json` and fill in Twitch creds.
