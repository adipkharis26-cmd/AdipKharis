#!/usr/bin/env bash
# Peak-normalise every SFX to -1 dBFS so the volumes in sfx.json behave consistently.
set -euo pipefail
cd "$(dirname "$0")/../public/sfx"
for f in *.mp3; do
  max=$(ffmpeg -hide_banner -i "$f" -af volumedetect -f null - 2>&1 | grep -o "max_volume: [-0-9.]*" | awk '{print $2}')
  gain=$(python3 -c "print(round(-1.0-($max),2))")
  if python3 -c "import sys; sys.exit(0 if abs($gain)>0.3 else 1)"; then
    ffmpeg -hide_banner -loglevel error -y -i "$f" -af "volume=${gain}dB" -c:a libmp3lame -b:a 128k "tmp_$f" && mv "tmp_$f" "$f"
    echo "$f: ${gain} dB"
  fi
done
