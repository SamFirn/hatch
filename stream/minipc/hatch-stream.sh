#!/usr/bin/env bash
# HATCH headless streamer for an x86 mini PC (Intel N100): Xvfb + Chromium render
# overlay.html; FFmpeg encodes it → Twitch RTMP using Intel hardware (VAAPI/QSV).
# Replaces OBS. Run by systemd. If any piece dies, exit so systemd restarts the stack.
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
ENCODER="${ENCODER:-vaapi}"
VAAPI_DEVICE="${VAAPI_DEVICE:-/dev/dri/renderD128}"
DISPLAY_NUM="${DISPLAY_NUM:-99}"
INGEST="${INGEST:-rtmp://live.twitch.tv/app}"
export DISPLAY=":${DISPLAY_NUM}"

CHROME="$(command -v chromium || command -v chromium-browser || command -v google-chrome || true)"
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
  --check-for-update-interval=31536000 \
  --user-data-dir=/tmp/hatch-chrome \
  "$OVERLAY_URL" >/dev/null 2>&1 &
PIDS+=($!)
sleep 6  # let the scene paint

# 3) build ffmpeg encode args by encoder choice
COMMON_IN=(-f x11grab -framerate "$FPS" -video_size "${W}x${H}" -i "$DISPLAY"
           -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100)
GOP=(-g $((FPS*2)) -keyint_min "$FPS")
AUD=(-c:a aac -b:a 128k -ar 44100)

case "$ENCODER" in
  vaapi)
    VID=(-vaapi_device "$VAAPI_DEVICE" -vf 'format=nv12,hwupload'
         -c:v h264_vaapi -b:v "$BITRATE" -maxrate "$BITRATE" "${GOP[@]}") ;;
  qsv)
    VID=(-init_hw_device "qsv=hw:${VAAPI_DEVICE}" -filter_hw_device hw
         -vf 'format=nv12,hwupload=extra_hw_frames=64'
         -c:v h264_qsv -b:v "$BITRATE" -maxrate "$BITRATE" "${GOP[@]}") ;;
  software|*)
    VID=(-c:v libx264 -preset veryfast -tune zerolatency -b:v "$BITRATE"
         -maxrate "$BITRATE" -bufsize "$BITRATE" -pix_fmt yuv420p "${GOP[@]}") ;;
esac

ffmpeg -hide_banner -loglevel warning \
  "${COMMON_IN[@]}" "${VID[@]}" "${AUD[@]}" \
  -f flv "${INGEST}/${STREAM_KEY}" >/dev/null 2>&1 &
PIDS+=($!)

echo "[hatch-stream] live: ${W}x${H}@${FPS} enc=${ENCODER} → ${INGEST}"
wait -n
echo "[hatch-stream] a component exited; shutting down for restart"
