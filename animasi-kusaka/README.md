# Kusaka — Animasi 2D Code-to-Video (Remotion + ElevenLabs v4)

Episode pilot **"Kusaka: Traktiran Gagal"**: Kusaka dan Ujang (dua siswa SMA) di depan Warung Bu Ijah.
Gaya: kartun sekolah Indonesia, vektor flat 2D, outline hitam tegas, cel-shading minimal, kepala besar.

## Alur kerja
```bash
npm install
npm run voice          # TTS ElevenLabs eleven_v4 + timestamp per huruf -> src/data/timeline.json
./scripts/generate-sfx.sh   # SFX: ambience jalan, whoosh, sting kaget, pop, trombone sedih
npm run studio         # preview interaktif
npm run render         # out/kusaka-warung.mp4        (1920x1080, YouTube)
npm run render:shorts  # out/kusaka-warung-shorts.mp4 (1080x1920, Shorts/Reels)
```
Kunci API dibaca dari env `ELEVENLABS_API_KEY` — **jangan pernah ditulis di kode / commit**.

## Mengubah cerita
Edit `src/data/script.json` (teks, pembicara, `emotion`, reaksi `listener`, `shot`, `action`) lalu
`npm run voice` dan render ulang. Semua timing (lip-sync, kamera, subtitle) ikut otomatis.

| field | nilai |
|---|---|
| `emotion` / `listener` | neutral, smug, suspicious, shock, laugh, pleading, deadpan, surprised, embarrassed, defeated |
| `shot` | `two` (two-shot), `speaker` (dirty single), `push` (slow push-in dramatis), `crash` (crash zoom + shake + speed lines + flash) |
| `action` | gesture, pocket, chin, point, plead, crossed (shock/laugh otomatis dari emosi) |

## Struktur rig
- `src/characters/Character.tsx` — rig berlapis: lengan belakang → kaki → badan (napas) → leher → kepala (pivot di leher) → lengan depan. Lengan 2 sendi (bahu/siku) dengan pose yang di-blend antar beat.
- `src/characters/Mouth.tsx` — sprite mulut SVG: rest, A, I, U, E, O, M, F, consonant + ekspresi smile, smirk, frown, shock, laugh, flat, wobble.
- `src/characters/Eyes.tsx` — mata open/closed/wide/happy/half/puppy + alis neutral/raised/angry/worried/smug/skeptic. Kedipan acak deterministik.
- `src/lib/timeline.ts` — viseme dari timestamp ElevenLabs, state emosi/aksi per karakter.
- `src/Video.tsx` — kamera (whip-pan, push-in, crash zoom), parallax 3 layer, shake, audio.
- `src/scene/Background.tsx` — warung, Bu Ijah, jalan, kota.
