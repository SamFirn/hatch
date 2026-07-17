# HATCH Mini PC — Shopping List (the cheap + efficient pick)

**One box. ~$100–150, everything included** (CPU, RAM, SSD, case, power supply, WiFi).
Nothing else to buy. Runs 24/7 on ~$20/yr of electricity.

## Buy: an Intel N100 mini PC
Any Intel **N100** (or N95/N150) mini PC works. What you want: **8GB+ RAM, an
NVMe or eMMC SSD (128GB is plenty), Intel UHD graphics** (built in — gives us the
hardware video encoder). All of them have this.

**Recommended (reputable, quiet, low-power):**
- **Beelink Mini S12 Pro (N100)** — ~$135–150, usually 16GB/500GB. The safe default; well-reviewed, good thermals for 24/7.
- **Trigkey Green G5 (N100)** — ~$135, 8–16GB. Similar quality.
- **GMKtec NucBox G3 (N100)** — ~$130–140, 8GB/256GB.

**Rock-bottom option (cheapest + fine for this):**
- A generic Amazon **N100, 8GB/256GB** listing — often **~$100–120**. Totally adequate for a stream box; just pick one with 4+ stars and NVMe (not only eMMC) if you can.

## Why this over the Pi (recap)
- **Cheaper or equal** now that the Pi 4 4GB jumped to ~$100 *board-only* (2026 RAM shortage).
- **Better encoder:** Intel **Quick Sync / VAAPI** hardware H.264 — offloads video off the CPU, runs cool.
- **Real SSD built in** — no microSD corruption risk, the #1 killer of 24/7 Pis.
- **x86 = dead-simple software.** Our exact headless pipeline runs on it.

## The one thing hardware can't fix
Your **home upload speed** — needs a steady **~3 Mbps up** (720p pixel art only needs ~2). Wire it to the router with **Ethernet** if you can; more reliable than WiFi for an always-on stream. Run a speed test to confirm.

## OS to put on it
**Debian 12 (64-bit)** — free, lightweight, and its Chromium + Intel drivers "just work" headless. (Ubuntu Server also fine, but its Chromium is a snap that's fussier headless — Debian is the smoother path. The setup script handles both.)
