# Hatch analytics — what we measure and how to read it

Dashboard: **https://samfirn.goatcounter.com** · endpoint `https://samfirn.goatcounter.com/count`
Read-only API token: `.goatcounter-token` (gitignored). `curl -H "Authorization: Bearer $(cat .goatcounter-token)" https://samfirn.goatcounter.com/api/v0/stats/hits?start=YYYY-MM-DD&end=YYYY-MM-DD&daily=true`

GoatCounter is cookieless and has no consent-banner requirement. Everything below is counted
per-browser via `localStorage`, never per-person.

---

## 1. Always share a TAGGED link

This is the single biggest fix. Before tagging, **80% of all traffic (263 of 327 hits) arrived
with no referrer at all** — because Messenger, TikTok, Discord, iMessage and most native apps
strip it. Untagged links mean we can post in five places and learn nothing about which one worked.

GoatCounter reads `campaign` / `utm_campaign` for the campaign and `src` / `ref` / `utm_source`
for the channel. So paste the tagged variant, never the bare URL:

| Where you post | Link to paste |
|---|---|
| TikTok / Reels bio | `https://hatchpet.pages.dev/?campaign=launch&src=tiktok` |
| itch.io page | `https://hatchpet.pages.dev/?campaign=launch&src=itch` |
| r/Tamagotchi | `https://hatchpet.pages.dev/?campaign=launch&src=reddit-tamagotchi` |
| r/WebGames | `https://hatchpet.pages.dev/?campaign=launch&src=reddit-webgames` |
| r/SideProject | `https://hatchpet.pages.dev/?campaign=launch&src=reddit-sideproject` |
| Show HN | `https://hatchpet.pages.dev/?campaign=launch&src=hn` |
| Facebook post | `https://hatchpet.pages.dev/?campaign=launch&src=facebook` |
| Discord | `https://hatchpet.pages.dev/?campaign=launch&src=discord` |
| Twitch panel / chat | `https://hatchpet.pages.dev/?campaign=launch&src=twitch` |
| Texting it to someone | `https://hatchpet.pages.dev/?campaign=launch&src=dm` |

Rules of thumb:
- Keep `campaign=launch` for this whole push, change `src` per channel. Rename the campaign
  (`campaign=tiktok-clip-3`) only when you want a specific post measured on its own.
- Reuse the exact same `src` spelling every time or it splits into two rows.
- The params are invisible to the player and don't affect the game.

## 2. The funnel (events, namespaced `hatch/…`)

Each of these fires **once per browser, ever** — so the counts divide cleanly into each other.
That's the point: a returning player firing `hatched` a second time would silently break every ratio.

| Event | Means | What it tells you |
|---|---|---|
| pageview `/` | someone opened it | raw reach |
| `hatch/new-visitor` | first day for this browser | reach minus reloads |
| `hatch/hatched` | cracked the egg (~12s in, pressed B) | **activation** — did the landing page survive first contact |
| `hatch/named` | named the pet | fully onboarded, now playing |
| `hatch/stage-2` … `stage-5` | reached that evolution | depth — how far people actually get |
| `hatch/installed` | added to home screen | the strongest intent signal we have; also the read on whether a Capacitor build is worth it |
| `hatch/died` | their pet died | churn risk — a spike here next to weak day-2 means the difficulty is killing retention |

Repeat-fire (not deduped, clicks are meaningful every time):
`hatch/support-open`, `hatch/donate-click`, `hatch/feedback-click`, `hatch/install-prompt`.

Retention — fires **only on a day this browser hasn't been seen before**, so reloads can't inflate it:
`hatch/returning-visitor`, `hatch/day-2`, `hatch/day-3plus`.

### The two numbers to actually watch

1. **`hatch/hatched` ÷ `hatch/new-visitor`** — activation. If reach is fine but this is low, the
   problem is the first 12 seconds, not the game.
2. **`hatch/day-2` ÷ `hatch/day-1`** — next-day retention. This is the number that decides whether
   Hatch is worth more of your evenings. Everything else is vanity.

## 3. Our own traffic is now excluded

Nothing is sent when the page is on `localhost`, `127.0.0.1`, a `192.168.*`/`10.*` LAN address, or
`file://`. To silence a device you actually browse from (your phone, your desktop), load
`https://hatchpet.pages.dev/?notrack=1` **once** on it — that sets a permanent local opt-out.

The 24/7 Twitch overlay (`stream/public/pet.html`) has analytics **deliberately stubbed out**. It ran
the same tracking snippet, and left alone it would have invented a fake visitor on every restart and
sat in the numbers as a permanently sticky `day-3plus` returning player. Its audience is measured by
Twitch, not here. If you ever re-sync `pet.html` from `hatch.html`, keep the stub.

## 4. Reading the old numbers

Events recorded before 2026-07-21 use the un-namespaced names (`new-visitor`, `day-1`, …) and are
mostly our own testing, plus reload-inflated `returning-visitor`. Treat pre-launch data as noise —
the clean baseline starts with the `hatch/` prefixed rows.

## 5. Verifying the wiring

`node _verify_analytics.mjs "https://hatchpet.pages.dev/"` drives a headless browser through
splash → hatch → name, intercepts every GoatCounter request, prints what *would* have been sent, and
aborts it — so you can confirm the funnel works without dirtying the dashboard.

## 6. The itch.io build

Rebuilt from canonical with **`node make_itch.js`** — it strips the service worker, manifest and
A2HS bar (all meaningless inside itch's iframe), makes the favicon relative, and pins the pageview
path to **`/itch`**. Every strip asserts its marker exists, so if `hatch.html` is restructured the
build fails loudly instead of silently shipping something broken. It used to be hand-stripped,
which is exactly how it ended up two weeks stale with no funnel at all.

Reading it: itch **reach** is the `/itch` pageview row, separate from `/`. Itch **funnel events**
share the same `hatch/...` names as the web app, so the funnel aggregates across both. Query-param
tagging can't reach an iframed build, which is why the path is pinned instead.

Ship it: `node make_itch.js`, then upload `hatch-itch.zip` (index.html + icon.svg) to itch.

## 7. Still open

- Nothing blocking. Next check: `hatch/hatched ÷ hatch/new-visitor` after the first shared clip.
