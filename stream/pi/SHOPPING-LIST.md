# HATCH Pi — Shopping List

Total ≈ **$95–120**. One-time. Runs 24/7 on ~$3–5/yr of electricity.

## Core (get these)
| Part | What to get | ~Price | Why |
|---|---|---|---|
| **Board** | **Raspberry Pi 4 Model B, 4GB** | $55–65 | Has a **hardware H.264 encoder** (Pi 5 dropped it). 4GB fits Node + Chromium + FFmpeg with room. |
| **Boot drive** | **USB 3.0 SSD, 120–256GB** (e.g. Kingston/Crucial/Samsung portable, or a SATA SSD + USB3 enclosure) | $20–35 | **The #1 reliability part.** Boot off SSD, NOT a microSD — SD cards corrupt under 24/7 writes. This is what prevents a 3am death mid-season. |
| **Power** | **Official Raspberry Pi 4 USB-C PSU (5.1V/3A)** | $8–12 | Cheap chargers cause brownouts/undervolt crashes. Get the real one. |
| **Case + cooling** | Case **with a fan** or heatsinks (Flirc, Argon, or any fan case) | $8–15 | 24/7 encoding = keep it cool so it doesn't throttle. |

## Optional / nice
- **microSD (16–32GB, A2)** — only needed if your SSD can't boot directly; used once to flash then hand off to SSD. Many setups boot straight from USB. ~$6.
- **Ethernet cable** — wired > WiFi for a stream that never drops. Use it if the Pi can reach your router. Free if you have one.
- **Small UPS / battery** — only if your power flickers a lot. Skip for v1.

## Don't bother with
- Pi 5 (costs more, *worse* for this job — no HW H.264 encoder).
- 8GB Pi (4GB is plenty here).
- Monitor/keyboard/mouse — we set it up **headless** over SSH.

## The one thing hardware can't fix
Your **home upload speed.** This stream needs a steady **~3 Mbps up**. Run a speed test; if your upload is solid, you're golden. (Pixel art at 720p only needs ~2 Mbps, so most connections are fine.)
