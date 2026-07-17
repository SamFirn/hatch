#!/usr/bin/env bash
# One-shot provisioner for the HATCH stream mini PC (Intel N100, Debian/Ubuntu x86).
# Run ONCE on the box:   cd ~/HATCH/stream/minipc && bash setup-pc.sh
# Installs deps + Intel VAAPI drivers, sets up env, installs+enables two systemd
# services (hatch-server = Node overlay server, hatch-stream = headless capture→Twitch).
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"          # .../stream/minipc
STREAM_DIR="$(cd "$HERE/.." && pwd)"           # .../stream
USER_NAME="$(id -un)"

echo "== HATCH mini-PC setup =="
echo "   user:       $USER_NAME"
echo "   stream dir: $STREAM_DIR"

sed -i 's/\r$//' "$HERE"/*.sh "$HERE"/stream.env* 2>/dev/null || true

echo "== [1/6] apt packages =="
sudo apt-get update
sudo apt-get install -y xvfb ffmpeg fonts-dejavu-core ca-certificates curl x11-utils vainfo
# Intel media stack for VAAPI/QSV hardware encoding
sudo apt-get install -y intel-media-va-driver-non-free i965-va-driver mesa-va-drivers libva2 || \
  sudo apt-get install -y intel-media-va-driver i965-va-driver mesa-va-drivers libva2 || true
# Chromium (real .deb on Debian; on Ubuntu this may pull a snap — Debian is smoother)
if ! command -v chromium >/dev/null 2>&1 && ! command -v chromium-browser >/dev/null 2>&1; then
  sudo apt-get install -y chromium 2>/dev/null || sudo apt-get install -y chromium-browser
fi

echo "== [2/6] Node.js =="
NEED_NODE=1
if command -v node >/dev/null 2>&1; then
  MAJ="$(node -v | sed 's/^v//' | cut -d. -f1)"; [ "$MAJ" -ge 18 ] 2>/dev/null && NEED_NODE=0
fi
if [ "$NEED_NODE" = 1 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
NODE_BIN="$(command -v node)"
echo "   node: $($NODE_BIN -v) @ $NODE_BIN"

echo "== [3/6] GPU access (VAAPI needs video+render groups) =="
sudo usermod -aG video,render "$USER_NAME" || true

echo "== [4/6] server npm deps =="
( cd "$STREAM_DIR" && npm install --omit=dev )

echo "== [5/6] env + config =="
[ -f "$HERE/stream.env" ] || cp "$HERE/stream.env.example" "$HERE/stream.env"
chmod +x "$HERE/hatch-stream.sh"
if [ ! -f "$STREAM_DIR/config.json" ]; then
  echo "   !! $STREAM_DIR/config.json missing — copy it from your PC (has your Twitch chat token)."
fi
echo "   VAAPI check:"; vainfo 2>/dev/null | grep -i h264 | head -3 || echo "   (run 'vainfo' after reboot to confirm H264 encode entrypoints)"

echo "== [6/6] systemd services =="
sudo tee /etc/systemd/system/hatch-server.service >/dev/null <<UNIT
[Unit]
Description=HATCH stream Node server (overlay + chat bot, port 8787)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$STREAM_DIR
ExecStart=$NODE_BIN server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT

sudo tee /etc/systemd/system/hatch-stream.service >/dev/null <<UNIT
[Unit]
Description=HATCH headless Twitch stream (Xvfb+Chromium+FFmpeg, Intel HW encode)
After=network-online.target hatch-server.service
Wants=network-online.target
Requires=hatch-server.service

[Service]
Type=simple
User=$USER_NAME
SupplementaryGroups=video render
WorkingDirectory=$HERE
ExecStart=/usr/bin/env bash $HERE/hatch-stream.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable hatch-server hatch-stream >/dev/null

cat <<DONE

== Setup complete ==
NOTE: group changes (video/render) apply after a reboot — do the reboot below.

Next (your parts):
  1) Put your Twitch STREAM KEY in:   $HERE/stream.env   (STREAM_KEY=...)
  2) Ensure config.json is present in $STREAM_DIR (Twitch chat token).
  3) sudo reboot        # picks up GPU group perms
  4) After reboot it auto-starts. Or start now: sudo systemctl start hatch-server hatch-stream
  5) Watch: journalctl -u hatch-stream -f   (look for "live: 1280x720 enc=vaapi")

If vaapi errors in the log, set ENCODER=software in stream.env and
  sudo systemctl restart hatch-stream   (still fine for pixel art), then we debug HW later.

Handy:
  sudo systemctl status hatch-server hatch-stream
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8787/overlay.html   # 200 = server up
DONE
