#!/usr/bin/env bash
# HATCH headless streamer: Xvfb (virtual screen) + Chromium (renders overlay.html)
# + FFmpeg (encodes the screen → Twitch RTMP). Replaces OBS. Run by systemd.
# If ANY of the three dies, the script exits so systemd restarts the whole stack.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
[ -f "$HERE/stream.env" ] && set -a && . "$HERE/stream.env" && set +a

: "${STREAM_KEY:?set STREAM_KEY in stream.env}"
if [ "$STREAM_KEY" = "live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" ]; then
  echo "[hatch-stream] STREAM_KEY is still the placeholder — edit stream.env"; exit 1
fi

W="${WIDTH:-1280}"; H="${HEIGHT:-720}"; FPS="${FPS:-30}"
BITRATE="${BITRATE:-2500k}"
OVERLAY_URL="${OVERLAY_URL:-http://localhost:8787/overlay.html?music=0}"
ENCODER="${ENCODER:-software}"
DISPLAY_NUM="${DISPLAY_NUM:-99}"
INGEST="${INGEST:-rtmp://live.twitch.tv/app}"
export DISPLAY=":${DISPLAY_NUM}"

# locate chromium (package name varies across Pi OS releases)
CHROME="$(command -v chromium-browser || command -v chromium || true)"
[ -n "$CHROME" ] || { echo "[hatch-stream] chromium not found"; exit 1; }

cleanup(){ trap - EXIT INT TERM; kill "${PIDS[@]}" 2>/dev/null || true; }
trap cleanup EXIT INT TERM
PIDS=()

# 1) virtual display
Xvfb "$DISPLAY" -screen 0 "${W}x${H}x24" -nolisten tcp >/dev/null 2>&1 &
PIDS+=($!)
sleep 2

# 2) headless chromium in kiosk mode on the overlay
"$CHROME" \
  --no-sandbox --disable-gpu --disable-software-rasterizer \
  --kiosk --window-size="${W},${H}" --window-position=0,0 \
  --autoplay-policy=no-user-gesture-required \
  --disable-infobars --noerrdialogs --disable-translate \
  --check-for-update-interval=31536000 --disable-features=Translate \
  --user-data-dir=/tmp/hatch-chrome \
  "$OVERLAY_URL" >/dev/null 2>&1 &
PIDS+=($!)
sleep 6  # let the scene paint

# 3) encoder selection
if [ "$ENCODER" = "hardware" ]; then
  VENC=(-c:v h264_v4l2m2m -b:v "$BITRATE" -pix_fmt yuv420p)
else
  VENC=(-c:v libx264 -preset veryfast -tune zerolatency -b:v "$BITRATE" \
        -maxrate "$BITRATE" -bufsize "$BITRATE" -pix_fmt yuv420p)
fi

# 4) grab the virtual screen + a silent stereo track → Twitch (FLV/RTMP)
ffmpeg -hide_banner -loglevel warning \
  -f x11grab -framerate "$FPS" -video_size "${W}x${H}" -i "$DISPLAY" \
  -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
  "${VENC[@]}" -g $((FPS*2)) -keyint_min "$FPS" \
  -c:a aac -b:a 128k -ar 44100 \
  -f flv "${INGEST}/${STREAM_KEY}" >/dev/null 2>&1 &
PIDS+=($!)

echo "[hatch-stream] live: ${W}x${H}@${FPS} ${ENCODER} → ${INGEST}"
# exit as soon as any child dies → systemd restarts the whole stack cleanly
wait -n
echo "[hatch-stream] a component exited; shutting down for restart"
