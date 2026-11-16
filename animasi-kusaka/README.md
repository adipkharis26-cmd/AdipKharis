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
npm run render:shorts  # out/kusaka-warung-shorts.mp4 (1080x1920, Shorts/Reels, langsung masuk dialog tanpa intro)
```
Kunci API dibaca dari env `ELEVENLABS_API_KEY` — **jangan pernah ditulis di kode / commit**.

## 🔒 Karakter terkunci (character bible)
Desain karakter punya **satu sumber kebenaran**: `src/characters/canon.json`, yang berisi palet warna, proporsi,
ciri khas wajib, sifat, kalimat khas, dan **suara ElevenLabs** (voice_id, model, setting). Rig, model sheet, dan
generator suara semuanya membaca dari file ini, jadi setiap episode tampil dan terdengar sama.

Pemeran: **Kusaka, Ujang, Nadia, Dinda, Pak Darto** (+ Bu Ijah). Lokasi: `src/scene/locations.json` +
`src/scene/Locations.tsx`, yaitu Warung Bu Ijah, Gerbang SMA Nusantara, Ruang Kelas XI IPS 2, Koridor & Lapangan, dan Kamar Kusaka.
Masing-masing punya titik berdiri (marks A–D) yang tetap.

Acuan visual ada di `model-sheets/` (dibuat ulang dengan `npm run sheets`):
- `ModelSheet-<id>.png`: proporsi, 10 ekspresi, 16 bentuk mulut, 8 bentuk tangan berjari, palet, 16 pose, profil, suara
- `Lineup.png`: perbandingan tinggi semua pemeran
- `LocationSheet.png` + `locations/<id>.png`: set terkunci beserta titik berdiri
- Sampel suara tiap karakter: `public/voices/<id>.mp3` (`npm run voice:samples`)

Panduan cerita, daftar episode Musim 1, dan strategi YouTube ada di **`SERIES_BIBLE.md`**.

`characters.lock.json` menyimpan hash dari kanon dan file rig. `npm run voice`, `render`, dan `render:shorts`
otomatis menjalankan `npm run check:characters` dan **menolak jalan** kalau desain berubah tanpa disengaja.

Mengubah desain dengan sengaja (misalnya menambah ekspresi atau karakter baru):
1. edit `canon.json` / `locations.json` atau file rig/set, lalu naikkan `"version"` di file JSON yang terkait
2. `npm run sheets`, lalu cek model sheet yang baru
3. `npm run lock:characters`

## Mengubah cerita
Edit `src/data/script.json` (teks, pembicara, `emotion`, reaksi `listener`, `shot`, `action`) lalu
`npm run voice` dan render ulang. Semua timing (lip-sync, kamera, subtitle) ikut otomatis.

| field | nilai |
|---|---|
| `emotion` / `listener` | neutral, smug, suspicious, shock, laugh, pleading, deadpan, surprised, embarrassed, defeated |
| `shot` | `two` (two-shot), `speaker` (dirty single), `push` (slow push-in dramatis), `crash` (crash zoom + shake + speed lines + flash) |
| `action` | gesture, pocket, chin, point, plead, crossed, wave, thumbsup, peace, facepalm, hips, phone (shock/laugh/slump otomatis dari emosi) |

## Struktur rig
- `src/characters/Character.tsx` — rig berlapis: lengan belakang → kaki → badan (napas) → leher → kepala (pivot di leher) → lengan depan. Lengan 2 sendi (bahu/siku) dengan pose yang di-blend antar beat.
- `src/characters/Hands.tsx` — pustaka tangan 4 jari + jempol: relaxed, open, fist, point, thumbsup, peace, wave, phone.
- `src/characters/Mouth.tsx` — sprite mulut SVG: rest, A, I, U, E, O, M, F, consonant + ekspresi smile, smirk, frown, shock, laugh, flat, wobble.
- `src/characters/Eyes.tsx` — mata open/closed/wide/happy/half/puppy + alis neutral/raised/angry/worried/smug/skeptic. Kedipan acak deterministik.
- `src/lib/timeline.ts` — viseme dari timestamp ElevenLabs, state emosi/aksi per karakter.
- `src/Video.tsx` — kamera (whip-pan, push-in, crash zoom), parallax 3 layer, shake, audio.
- `src/scene/Background.tsx` — warung, Bu Ijah, jalan, kota.
