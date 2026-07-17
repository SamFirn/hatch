# HATCH Device — physical handheld build plan (Route B)

Goal: a real, pocket "Tamagotchi-style" Hatch you hold in your hand — pet lives on the
device, ages while it's off, buttons to care for it. DIY one-off first; possible product later.

Your huge head start: Hatch is already **64×64 pixel art + a data-driven evolution engine**.
The **art and the evolution graph export straight to the device** (same trick as our existing
`assemble_dex.js`). What gets rewritten is the **game engine** (in C++), not the design.

---

## Recommended build — ESP32 + color TFT

**Chip: ESP32** (over a Pico) because:
- Huge display-library support (TFT_eSPI / LovyanGFX) + massive community/tutorials.
- Built-in **WiFi** = optional bonus later: sync the pet to the web version, OTA updates,
  the "your pet misses you" hook.
- Can even run **Espruino (JavaScript on the chip)** if you'd rather lean on your JS skills
  for a first prototype — slower, but a gentler on-ramp before a C++ rewrite.

### Parts list (~$22–32, one-off)
| Part | Example | ~Price |
|---|---|---|
| **ESP32 dev board** | ESP32-WROOM-32 (or ESP32-S3 for more room) | $6–9 |
| **Display** | 1.3–1.54" **ST7789 240×240 SPI IPS** (perfect square for a 64×64 game at 3× = 192px, centered) | $6–9 |
| **Buttons** | 3× tactile buttons (A / B / menu) — or a tiny 5-way | $1–2 |
| **Battery** | LiPo 400–500mAh + **TP4056** USB-C charge board | $5–7 |
| **Bits** | protoboard/JST, wires, resistors | $3–4 |
| **Case** | 3D-printed (free if you know someone with a printer) or a small project box | $0–8 |
| **Sound (opt.)** | piezo buzzer for chirps | $1 |

*(Prices approximate — I'll pull live carts when you're ready to order.)*

### Ready-made shortcut (less fiddly, more $)
**Pimoroni PicoSystem** — a finished handheld (240×240 screen, d-pad + buttons, LiPo, case)
you just write code for. ~$60–80, zero soldering. Great if you want to skip the wiring and
go straight to the game. (Uses Pi Pico + its own SDK, C++/MicroPython.)

---

## The port plan (where the real work is)

1. **Export the assets** — small node script turns Hatch's sprite strings + DEX graph into C
   header arrays (`sprites.h`, `evolution.h`). *Mostly automated — reuses our existing pattern.*
2. **Display + draw a sprite** — bring up the ST7789, draw one 64×64 pet scaled 3×, centered.
   *(First milestone — proves the whole idea.)*
3. **Game loop + stats** — hunger/happiness/energy/health, decaying over time via `millis()`/RTC.
4. **Evolution state machine** — port the DEX graph: care quality over a stage → which form next.
5. **Buttons** — feed / play / clean / heal, menu navigation.
6. **Persistence** — save state to flash (ESP32 NVS) so the pet survives power-off.
7. **Aging while "off"** — deep-sleep timer or RTC so the pet ages between sessions (the
   Tamagotchi magic — it needs you even when the screen's dark).
8. **Polish** — piezo chirps, low-battery handling, a case.

## Honest effort estimate (hobby evenings, self-taught JS → embedded C)
- Display up + one sprite drawn: **~1 weekend**
- Core game (stats, evolution, buttons, save): **~2–4 weekends**
- Aging/sleep, sound, case: **+1–2 weekends**
- **Total ~4–8 weekends** end-to-end. Faster (with a perf hit) if you prototype in MicroPython/Espruino first.

## Smallest first step (low commitment, high payoff)
Order **one ESP32 + one ST7789 240×240** (~$15). Get it to **draw a single Hatch pet on the
screen.** That one milestone tells you if you love this — and it's already a portfolio clip:
*"I ported my web game's renderer to bare-metal hardware."*

## Why this is worth it beyond the fun
- **Resume gold:** embedded C + hardware + "shipped my own game to a physical device" is a
  standout line almost no junior dev has. Bridges your AV/hardware instincts with software.
- **Ultimate return hook:** a physical thing on your desk that needs you beats any notification.
- **Product optionality:** if the digital version ever shows demand, you'll already have a
  working device to build a small run around (Kickstarter/maker-market territory).

---

## Shell / enclosure (the physical case)

**Golden rule: design the shell AROUND the guts, not before.** Choose the board + screen +
battery first, measure them, *then* model the case. Designing the shell first = a pretty case
nothing fits in.

### Tier 1 — 3D printing (realistic for one-offs + small batches)
- **CAD tool:** **Tinkercad** (free, beginner — a basic egg shell in an evening) or **Fusion 360**
  (free for hobby, parametric — better for precise cutouts). Fusion is itself a portfolio-flex skill.
- **Print:** at home (if you get a printer) or a service — **JLCPCB / PCBWay 3D**, **Craftcloud**
  (aggregator), a local library/makerspace, or a friend's printer.
- **Cost:** ~$5–20 filament for a one-off; ~$15–40 via a service. **Expect 3–5 fit revisions —
  that's normal for enclosures.**
- **Material:** PETG or ASA/ABS = tough, Tamagotchi-y. Resin (SLA) = smooth/detailed but brittle.

### Tier 2 — small batch (10–50)
Print each (~$5–15/unit) **or** silicone-mold + resin-cast from a printed master (cheaper per
unit at small scale, doable on a table). How a lot of indie hardware ships early.

### Tier 3 — injection molding (true mass "toy shell")
Steel/aluminum **mold = ~$1,000–5,000+ tooling** up front, then pennies/unit. Only worth it at
**hundreds+**. Save for "the digital version proved demand and I'm doing a real run."

### Design checklist (what the model must include)
- Screen window (with a hair of bezel clearance) · button holes with travel room · **USB-C
  charge-port cutout** · internal screw bosses or snap-fit ribs · battery compartment/retainer ·
  keychain loop · a seam/split line so it opens · standoffs so the PCB doesn't rattle.
- Brand it: Hatch colorway + logo embossed in the shell (free once you're in CAD).

### Don't-want-to-CAD option
Commission a simple enclosure model on Fiverr/Upwork (~$50–200). Cheaper long-term (and a skill)
to learn Fusion yourself, but this unblocks you fast if CAD isn't the part you want to own.

**Honest bottom line:** a 3D-printed Hatch shell around real electronics = **weekend-CAD + a few
print iterations.** Injection-molded retail shell = a real business step, way down the line.

---

**Resume trigger to start:** say **"Hatch device"** and I'll pull live parts carts + write the
asset-export script + the display bring-up sketch so your first evening is plug-and-play.
