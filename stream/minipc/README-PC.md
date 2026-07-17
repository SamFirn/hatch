# HATCH on an Intel N100 mini PC — 24/7 always-on stream

The cheap + efficient build. One small box runs the "Twitch Plays Hatch" stream
**forever** — survives crashes, power blips, reboots — so seasons actually finish.
No OBS, no PC left running, no babysitting.

## How it works (the design)
```
 [Node server.js] --serves--> overlay.html  (port 8787)
        ▲                         │
        │ chat commands           │ rendered by
   Twitch chat (tmi.js)           ▼
                        [Xvfb] virtual 720p screen
                              │  Chromium paints the overlay onto it
                              ▼
                          [FFmpeg] grabs screen + silent audio
                              │  Intel VAAPI hardware H.264 encode
                              ▼
                     rtmp://live.twitch.tv  →  your channel
```
Two **systemd** services keep it alive, both `Restart=always` + enabled on boot →
self-healing + reboot-proof:
- `hatch-server` — Node overlay + chat bot
- `hatch-stream` — Xvfb + Chromium + FFmpeg (restarts the whole stack if any piece dies)

Everything is written and sitting in this `minipc/` folder. Only your steps remain.

---

## YOUR PARTS — the checklist

### A. Buy it (~$100–150, one-time)
See **SHOPPING-LIST.md**. TL;DR: any **Intel N100 mini PC, 8GB+ RAM** (Beelink Mini
S12 Pro is the safe pick ~$140). Case, PSU, RAM, SSD all included — it's one box.

### B. Put Debian on it (~15 min, one-time)
Most mini PCs ship with Windows; we replace it with lightweight Debian.
1. On your PC, download **Debian 12 "netinst" 64-bit** ISO (debian.org) and flash it
   to a USB stick with **balenaEtcher** or **Rufus**.
2. Boot the mini PC from the USB (mash `F7`/`Del` at power-on for the boot menu).
3. Install Debian: pick a **hostname** (e.g. `hatchpc`), a user + password, and at
   "software selection" tick **SSH server** + **standard system utilities** (untick desktop — we go headless).
4. Reboot, unplug USB. You now have a headless box on your network.
   *(Prefer Ethernet — plug it into your router for a stream that never drops.)*

### C. Get the code onto it
From your PC (PowerShell), copy the whole `stream/` folder over:
```powershell
scp -r "C:\Users\samfi\Desktop\HATCH\stream" hatchpc@hatchpc.local:~/HATCH/
```
Also copy your existing **config.json** (Twitch chat token) if it isn't in the folder.

### D. Run the installer (one command)
```bash
ssh hatchpc@hatchpc.local
cd ~/HATCH/stream/minipc
bash setup-pc.sh
```
Installs Node, Chromium, FFmpeg, Xvfb, Intel VAAPI drivers, and both services.

### E. Keys + go live
```bash
nano stream.env                 # set STREAM_KEY=  (Twitch dashboard → Settings → Stream)
sudo reboot                     # picks up GPU permissions
# after reboot it auto-starts; watch it:
journalctl -u hatch-stream -f   # look for "live: 1280x720 enc=vaapi"
```
Open **twitch.tv/hatchpet** — live. It now self-heals after any crash or reboot.

---

## Day-to-day (rare)
```bash
sudo systemctl status hatch-server hatch-stream   # health
sudo systemctl restart hatch-stream               # after editing stream.env
journalctl -u hatch-stream -n 100 --no-pager      # recent logs
vainfo | grep -i h264                             # confirm Intel HW encoder present
curl -s -o /dev/null -w "%{http_code}\n" localhost:8787/overlay.html   # 200 = ok
```

## Tuning (`stream.env`)
- `ENCODER=vaapi` (default, Intel hardware). If it errors, `ENCODER=software` always works
  (N100 CPU handles pixel art fine); `qsv` is an alternate hardware path.
- `BITRATE`/`HEIGHT` — 720p/2500k is plenty for pixel art; bump to 1080p/3500k if you want.
- Season pacing lives in the server's **config.json** (`seasonSpeed`, cooldowns) — unchanged from your PC setup.

## Notes / gotchas (I can't test these without the box)
1. **Chromium headless flags** shift slightly by distro/version. If it won't launch,
   `journalctl -u hatch-stream` shows why — usually a one-flag fix.
2. **VAAPI** needs the user in the `video`+`render` groups (setup does this; the reboot applies it).
   If `vainfo` shows no H264 encode entrypoint, use `ENCODER=software` and we'll sort HW later.
3. **Audio** is a silent track (Twitch just needs audio to exist). Capturing the chiptune
   headlessly is an optional PulseAudio follow-up.

Ping me ("Pi stream" — same trigger) when the box is in hand and I'll walk the live bits with you.
