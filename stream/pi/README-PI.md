# HATCH on a Raspberry Pi — 24/7 always-on stream

Goal: a dedicated little box that runs the "Twitch Plays Hatch" stream **forever** —
survives crashes, survives power blips, survives reboots — so seasons actually
finish. No OBS, no PC left running, no babysitting.

## How it works (the design)
```
 [Node server.js] --serves--> overlay.html  (port 8787)
        ▲                         │
        │ chat commands           │ rendered by
   Twitch chat (tmi.js)           ▼
                        [Xvfb] virtual 720p screen
                              │  Chromium paints the overlay onto it
                              ▼
                          [FFmpeg] grabs the screen + silent audio
                              │  H.264 encode
                              ▼
                     rtmp://live.twitch.tv  →  your channel
```
Two **systemd** services keep it alive:
- `hatch-server` — the Node overlay + chat bot
- `hatch-stream` — Xvfb + Chromium + FFmpeg pipeline (restarts the whole stack if any piece dies)

Both are `Restart=always` and `enable`d on boot → **self-healing + reboot-proof.**

Everything is already written and sitting in this `pi/` folder. The only things left
are the parts that need *you* (buying it, flashing it, pasting your keys).

---

## YOUR PARTS — the checklist

### A. Buy it (~$95–120, one-time)
See **SHOPPING-LIST.md**. TL;DR: **Pi 4 (4GB) + USB SSD + official PSU + fan case.**

### B. Flash the OS (~15 min, one-time)
1. Install **Raspberry Pi Imager** on your PC (raspberrypi.com/software).
2. Choose **Raspberry Pi OS Lite (64-bit)** → target the **USB SSD**.
3. Click the ⚙️ (or "Edit Settings"): set a **hostname** (e.g. `hatchpi`), a
   **username/password**, **enable SSH**, and your **WiFi** (skip WiFi if using Ethernet).
4. Write it, plug the SSD into a **USB 3.0 (blue) port**, power on.

### C. Get the code onto the Pi
From your PC (PowerShell), copy this whole `stream/` folder over — pick one:
```powershell
# option 1: rsync/scp the folder (needs the Pi's IP or hostname.local)
scp -r "C:\Users\samfi\Desktop\HATCH\stream" hatchpi@hatchpi.local:~/HATCH/
```
(or `git clone` your repo on the Pi if `stream/` is pushed — then the path is `~/HATCH/stream`).
Also copy your existing **config.json** (it has your Twitch chat token) if it isn't already in the folder.

### D. Run the installer (one command)
SSH in and run:
```bash
ssh hatchpi@hatchpi.local
cd ~/HATCH/stream/pi
bash setup-pi.sh
```
It installs Node, Chromium, FFmpeg, Xvfb, the npm deps, and both services.

### E. Paste your keys + go live
```bash
nano stream.env                 # set STREAM_KEY=  (Twitch dashboard → Settings → Stream)
sudo systemctl start hatch-server hatch-stream
journalctl -u hatch-stream -f   # watch it; look for "live: 1280x720…"
```
Open **twitch.tv/hatchpet** — you should be live. Done. It'll now come back on its own
after any crash or reboot.

---

## Day-to-day (rare)
```bash
sudo systemctl status hatch-server hatch-stream   # health
sudo systemctl restart hatch-stream               # after editing stream.env
journalctl -u hatch-stream -n 100 --no-pager      # recent logs
curl -s -o /dev/null -w "%{http_code}\n" localhost:8787/overlay.html   # 200 = ok
```

## Tuning knobs (in `stream.env`)
- `BITRATE` / `HEIGHT` — bump to 1080p/3500k later if you want; 720p/2500k is plenty for pixel art.
- `ENCODER=hardware` — once stable, try the Pi 4's HW encoder to cut CPU/heat, then eyeball for artifacts. Revert to `software` if worse.
- Season pacing lives in the server's **config.json** (`seasonSpeed`, cooldowns) — unchanged from your PC setup.

## Two things that may need a 5-min Pi-side tweak (I can't test these without the hardware)
1. **Chromium flags** — package/flags shift a little between Pi OS releases. If Chromium
   won't launch headless, `journalctl -u hatch-stream` shows why; usually a one-flag fix.
2. **Encoder** — we default to reliable **software** x264. Hardware `h264_v4l2m2m` is a nice-to-have
   once confirmed on your OS image.
Ping me ("Pi stream" ) when the hardware's in hand and I'll walk both live with you.

## Audio (optional, later)
We stream a **silent** track (Twitch just needs audio to exist). Capturing the chiptune
headlessly needs a PulseAudio virtual sink — a small follow-up if you want music on stream.
