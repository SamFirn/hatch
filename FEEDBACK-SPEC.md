# Hatch — Feedback-Driven Feature Spec
*Built 2026-10-06 from all in-app FormSubmit feedback (8 threads, late-Aug → Oct 6).*
*n ≈ 47 raw submissions. Some are pre-9/26 duplicates (the double-submit bug), so treat counts as
**directional**, not exact. Audience is ~90% Indonesian teens on low-end Android (Oppo A5i, LG) + some iPhone Safari.*

---

## What the numbers actually say

**Enjoyment scores:** 3→31, 5→10, 4→4, 2→1, 1→1.
⚠️ **Don't read the pile of 3s as "lukewarm."** 3 is the slider's midpoint/default — 31 of 47 clustering exactly there means most people *didn't move it*. The real enthusiasm signal is the **10 fives + the text**, which is overwhelmingly warm ("so cute," "same like tamagotchi," "nostalgia"). (If we want a true enjoyment read later, make the slider require a deliberate pick instead of defaulting to 3.)

**What they love (Favorite_part):** **Nostalgia wins by a landslide — ~13 mentions** ("Nostalgia / Notalgia / The nostalgia"), then cuteness ("lucuuu sekali" ×3), the tamagotchi comparison, and specifically *"free tamagotchi and pet not dying."*
→ **Core value = gentle nostalgia + cuteness + a tamagotchi that doesn't punish you.** Do NOT add harsh fail/death mechanics; lean into warmth and care. This is the moat — protect it.

**Bugs:** effectively none — ~12 explicit "No," rest blank/"idk." One **"the pet vanished"** (almost certainly the churn bug patched 9/26; one residual report — worth confirming the fix held). Clean.

---

## Ranked features (demand × leverage)

### 1. 🛁 Bathing / "mandi" — **#1 request, ~11 mentions. Build this first.**
By far the most-requested thing. Indonesian "mandi" = bathe. Pairs with "merawat nya" (care for it).
It directly deepens the **care loop** that is the whole nostalgic appeal — a new verb for an audience
telling you they want *more ways to nurture*, not more complexity.
- **v1 scope:** a 4th care action (alongside feed/play/etc.) — a "dirty" meter that rises over time,
  a bathe interaction (tap → soap/bubbles animation → clean), small happiness/health bump. Gentle:
  being dirty lowers mood, never kills (stay on-brand).
- **Build:** MEDIUM. New meter + state + one animation + wire into the existing care tick. Keep art
  light for low-end Android.

### 2. 📈 Growth / "jadi besar" — pet visibly getting bigger (~2+ explicit, plus implied)
Users want to *see progression*. Hatch already has evolution (211 forms / 4 genera) — this is likely
about **making growth feel visible and rewarding within a life**, not new species.
- **v1 scope:** confirm whether current evolution reads as "growth" to a new player; if not, add a
  visible size/stage cue (baby → bigger) and a small celebration moment on growth. Low-risk, high "aww."
- **Build:** LOW–MEDIUM (may be mostly surfacing what exists).

### 3. ✏️ Rename + 🎨 deterministic theme picker — **best effort-to-payoff; do alongside #1**
One detailed, high-quality request: *"change the pet's name after choosing"* + *"pick the console
theme without pressing random 15 times."* Both are pure UX wins, both cheap.
- **Rename:** let a saved pet be renamed from the STATUS/menu. Trivial, high satisfaction (people are
  naming pets — Yuki, Jelly — and want control).
- **Theme picker:** replace "mash random until you get a good one" with an actual chooser (list/swatches).
- **Build:** LOW. These are the quickest credibility wins in the whole list.

### 4. 👗 Dress-up / customization (~1 here + repeated in Sept feedback)
Personalization/accessories. Satisfies the attachment the nostalgia creates.
- **Build:** MEDIUM (art-heavy). Defer behind 1–3.

### 5. 🛒 Snack "market" / shop (1) + 🔊 background sound (1)
Economy layer and ambiance. Both real but bigger/secondary.
- **Shop:** MEDIUM–HIGH (needs a currency loop). 🔊 **Sound:** LOW–MEDIUM but respect autoplay rules
  + a mute toggle (teens on phones).
- **Build:** defer.

### 6. 🌐 Visible language toggle *(not from this feedback — from the live language bug)*
id-locale users land in Bahasa with no *visible* way to switch (it's a hidden STATUS→B tap). Anyone
who lands in the wrong language is stuck. A small labeled toggle fixes it for everyone.
- **Build:** LOW. Shippable on its own, any time.

---

## Build order recommendation
Post-mediation fun-hours, in this order:
1. **🛁 Bathing** (the headline ask) **+ ✏️ rename + 🎨 theme picker** bundled (the cheap wins ride along).
2. **📈 Growth visibility.**
3. 🌐 language toggle (or sooner — it's tiny and standalone).
4. 👗 dress-up, 🛒 shop, 🔊 sound — later, demand-dependent.

## Non-negotiable constraints (from the data)
- **Keep it gentle** — "pet not dying" is explicitly loved. No punishing mechanics.
- **Keep it light** — low-end Android is the median device. No heavy assets.
- **Bahasa is first-class** — ~90% of users; every new string goes through `tr()`.
- Gate the real build on GSC/Discover data holding (is the wave worth the hours?); this spec is *what*
  to build, not *whether* — that's the Google-data call.
