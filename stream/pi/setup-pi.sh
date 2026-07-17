#!/usr/bin/env bash
# One-shot provisioner for the HATCH stream Pi. Run ONCE on the Pi:
#   cd ~/HATCH/stream/pi && bash setup-pi.sh
# Installs deps, sets up the env file, and installs+enables two systemd services
# (hatch-server = Node overlay server, hatch-stream = headless capture→Twitch).
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"          # .../stream/pi
STREAM_DIR="$(cd "$HERE/.." && pwd)"           # .../stream
USER_NAME="$(id -un)"

echo "== HATCH Pi setup =="
echo "   user:       $USER_NAME"
echo "   stream dir: $STREAM_DIR"

# normalize line endings in case files were edited on Windows
sed -i 's/\r$//' "$HERE"/*.sh "$HERE"/stream.env* 2>/dev/null || true

echo "== [1/5] apt packages =="
sudo apt-get update
sudo apt-get install -y xvfb ffmpeg fonts-dejavu-core ca-certificates curl x11-utils
if ! command -v chromium-browser >/dev/null 2>&1 && ! command -v chromium >/dev/null 2>&1; then
  sudo apt-get install -y chromium-browser 2>/dev/null || sudo apt-get install -y chromium
fi

echo "== [2/5] Node.js =="
NEED_NODE=1
if command -v node >/dev/null 2>&1; then
  MAJ="$(node -v | sed 's/^v//' | cut -d. -f1)"
  [ "$MAJ" -ge 18 ] 2>/dev/null && NEED_NODE=0
fi
if [ "$NEED_NODE" = 1 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
NODE_BIN="$(command -v node)"
echo "   node: $($NODE_BIN -v) @ $NODE_BIN"

echo "== [3/5] server npm deps =="
( cd "$STREAM_DIR" && npm install --omit=dev )

echo "== [4/5] env + config =="
[ -f "$HERE/stream.env" ] || cp "$HERE/stream.env.example" "$HERE/stream.env"
chmod +x "$HERE/hatch-stream.sh"
if [ ! -f "$STREAM_DIR/config.json" ]; then
  echo "   !! $STREAM_DIR/config.json missing — copy it from your PC (has your Twitch chat token)."
fi

echo "== [5/5] systemd services =="
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
Description=HATCH headless Twitch stream (Xvfb+Chromium+FFmpeg)
After=network-online.target hatch-server.service
Wants=network-online.target
Requires=hatch-server.service

[Service]
Type=simple
User=$USER_NAME
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
Next (your parts):
  1) Put your Twitch STREAM KEY in:   $HERE/stream.env   (STREAM_KEY=...)
  2) Make sure config.json is present in $STREAM_DIR (Twitch chat token).
  3) Start it:   sudo systemctl start hatch-server hatch-stream
  4) Watch logs: journalctl -u hatch-stream -f    (Ctrl+C to stop watching)
  5) It's now auto-start on boot + auto-restart on crash. Reboot-proof.

Handy:
  sudo systemctl restart hatch-stream     # after editing stream.env
  sudo systemctl status hatch-server hatch-stream
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8787/overlay.html   # 200 = server up
DONE
