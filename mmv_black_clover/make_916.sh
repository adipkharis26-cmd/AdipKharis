#!/bin/sh
# make_916.sh in.mp4 out.mp4 [lebar]  - bungkus video 1:1 jadi 9:16 untuk Shorts/TikTok/Reels agar tidak di-crop:
# video persegi utuh di tengah, atas-bawah diisi versi blur + gelap dari video yang sama.
IN="$1"; OUT="$2"; W="${3:-1080}"; H=$((W * 16 / 9))
ffmpeg -v error -y -i "$IN" -filter_complex \
 "[0:v]scale=-2:$H,crop=$W:$H,boxblur=30:3,eq=brightness=-0.18:saturation=0.8[bg];[0:v]scale=$W:$W[fg];[bg][fg]overlay=0:(H-h)/2,setsar=1" \
 -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p -c:a copy -movflags +faststart "$OUT"
