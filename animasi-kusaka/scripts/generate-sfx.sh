#!/usr/bin/env bash
# Generate sound effects with ElevenLabs Sound Effects API.
# Auth: set ELEVENLABS_API_KEY (or rely on a proxy that injects it).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/sfx
gen() { # name, duration, prompt
  [ -s "public/sfx/$1.mp3" ] && [ "${FORCE:-0}" != 1 ] && { echo "skip $1"; return; }
  hdr=(); [ -n "${ELEVENLABS_API_KEY:-}" ] && hdr=(-H "xi-api-key: $ELEVENLABS_API_KEY")
  curl -sSf -X POST "https://api.elevenlabs.io/v1/sound-generation" "${hdr[@]}" \
    -H "Content-Type: application/json" -o "public/sfx/$1.mp3" \
    -d "{\"text\":\"$3\",\"duration_seconds\":$2,\"prompt_influence\":0.5}"
  echo "ok $1"
}
gen ambience 20 "Indonesian roadside food stall ambience, distant motorbikes passing, light street chatter, birds, daytime"
gen whoosh 1 "Fast cartoon whoosh swish for a crash zoom"
gen sting 2 "Comedic dramatic shock sting, orchestral hit, cartoon"
gen pop 0.5 "Short cartoon pop sound for a title appearing"
gen sad 3 "Sad comedic trombone wah wah wah fail"
