#!/usr/bin/env bash
# Usage: video/src/vo_preview.sh epNN "Judul episode"
# Wraps video/vo/epNN.mp3 into a small MP4 (still card + audio) so the owner can
# listen to the VO inside Kantor Konten (the asset store accepts mp4, not mp3).
set -euo pipefail
EP=$1; TITLE=${2:-$1}
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
FONT=$(fc-match -f '%{file}' "Inter:black")
OUT="$ROOT/video/out/$EP-vo-preview.mp4"; mkdir -p "$ROOT/video/out"
T=$(printf '%s' "$TITLE" | sed "s/[:']/ /g")
ffmpeg -y -loglevel error -f lavfi -i "color=c=0x1F8B95:s=540x960:r=2" -i "$ROOT/video/vo/$EP.mp3" \
  -vf "drawbox=x=0:y=0:w=540:h=330:color=0xF2CC45:t=fill,drawtext=fontfile=$FONT:text='CEK SUARA $EP':fontsize=44:fontcolor=0x1d2030:x=(w-tw)/2:y=130,drawtext=fontfile=$FONT:text='$T':fontsize=26:fontcolor=white:x=(w-tw)/2:y=480:borderw=3:bordercolor=0x1d2030" \
  -c:v libx264 -tune stillimage -pix_fmt yuv420p -c:a aac -b:a 128k -shortest -movflags +faststart "$OUT"
echo "$OUT"
