# HATCH::CHAT — monetization, revenue math & go-live notes

Grounded on current (2026) Twitch figures. Numbers are ballparks — real conversion
is the unknown. The tech is done; **getting consistent live viewers is the real work.**

---

## Pricing — is it realistic?
Yes, but Twitch takes a cut on both ends:
- **Bits:** you earn **$0.01 / Bit**, but viewers pay **~$1.40 per 100 Bits** (Twitch markup).
  A "100-Bit skin" = ~$1.40 to them, **~$1.00 to you.**
- **Keep paid actions cheap / impulse-priced** (50–100 Bits). Low price = far better conversion than $5+.
- **Free actions stay free** (feed/play/buttons via chat) — participation is the whole point.
  **Bits are only for the flashy stuff:** `boost`, `skin`, `style`, `name`.
- **2026 "Monetization for All":** Bits/subs/Channel Points work **day one**; you only need
  **Affiliate to withdraw**.

## How ad revenue works
- **CPM model:** ~**$3.50 per 1,000 impressions**; you keep **30–55%** → **~$1.75–$1.95 / 1,000**.
- You control ad frequency. Ads cause drop-off, so on a chill always-on stream, run them sparingly.
- Expect ads to be the **smallest** stream here; **Bits will dominate.**

## Revenue estimates (rough monthly)
Assumes ~150 hrs live/mo (~5 hrs/day), ~2% of concurrent viewers do one paid action/hr (~$1 net),
~1 sub per 20 viewers, minimal ads.

| Avg concurrent viewers | Bits/paid | Ads | Subs | **~Total/mo** |
|---|---|---|---|---|
| 5  | ~$18  | ~$8  | ~$1    | **~$25–30**  |
| 10 | ~$36  | ~$15 | ~$1–3  | **~$50–60**  |
| 25 | ~$90  | ~$37 | ~$3–6  | **~$130–150**|
| 50 | ~$180 | ~$75 | ~$6–12 | **~$260–300**|

**Reality:** small-scale = coffee-to-side-income, not rent. The value is near-zero cost,
a **portfolio piece**, the **funnel to Hatch**, and **viral optionality** (a hit clip can 10–100× this).
24/7 running multiplies hours (off-peak viewers are thin).

## Security
1. **Twitch token** lives in `config.json` → **gitignored** (never commit / share it).
2. Server binds **localhost only** = safe for OBS on your PC. **Do NOT port-forward it** —
   the chat handler trusts any local connection with no auth. (Public hosting would need an auth key first.)
3. Displayed text (names/usernames) is **HTML-escaped** + name filter blocks slurs/obfuscation → XSS-safe.
4. Your own code, one dependency (`ws`). Low risk.

## Updating while live (seamless?)
- **Stream:** restarting `server.js` = ~2s blip (overlay + pet auto-reconnect; pet state lives in
  browser localStorage). Visual tweaks: right-click the OBS browser source → **Refresh**. No stream restart.
- **Hatch app** (hatchpet.pages.dev): Cloudflare Pages deploys are **atomic + instant with rollback**;
  open tabs update on refresh (PWA SW refreshes cache next load).

## Before going live — the easy-to-forget list
1. **Discovery is the real project now** — clips (TikTok/Shorts of chaos + evolutions), r/twitchplays,
   r/Tamagotchi, r/WebGames, + the Hatch funnel.
2. **Category + tags** (Games/Demos + `tamagotchi`, `virtualpet`, `twitchplays`).
3. **Always-on:** PC can't sleep; OBS stable; run the server via **`start-24-7.bat`** (auto-restarts on crash).
4. **~15s stream delay** — paid actions land a few seconds later; UI should say so.
5. **AutoMod ON** as the backstop to our name filter.
6. **Payouts:** Affiliate (2026: 25 followers, 4 hrs, 4 days, 3 avg viewers) + W-9 + payout method; **$50 min**.
   **Streamlabs tips** = day-1 fallback before Affiliate.
7. **Track the funnel** — GoatCounter referrals from stream → hatchpet.
8. **Cost to run: ~$0** (your PC + power).
