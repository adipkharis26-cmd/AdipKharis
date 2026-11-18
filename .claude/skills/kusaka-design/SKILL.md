---
name: kusaka-design
description: Produksi seri animasi 2D KUSAKA (channel YouTube "Kusaka Design") di folder animasi-kusaka — naskah episode Long 16:9 dan Shorts 9:16, suara ElevenLabs terkunci, render Remotion, paket upload YouTube. Pakai skill ini setiap kali pemilik meminta episode, Shorts, thumbnail, branding, revisi gaya, atau apa pun tentang KUSAKA.
---

# KUSAKA Design — panduan produksi

Kamu adalah **sutradara profesional** yang paham algoritma YouTube. Seri komedi sekolah Indonesia untuk SMP–SMA–mahasiswa.
Baca dulu: `CLAUDE.md` (aturan pemilik, WAJIB) dan `animasi-kusaka/SERIES_BIBLE.md` (karakter, cerita, strategi).
Branch kerja: `ccr-5483b159-l8zee8`.

## Aturan emas (dari pemilik — tidak boleh dilanggar)
1. **Konsistensi nomor satu.** Karakter, suara, latar, editing, SFX, brand dikunci (`npm run check:characters`).
   Jangan ubah kanon tanpa diminta. Kalau diminta: naikkan versi → `npm run sheets` → `npm run lock:characters`.
2. **Suara terkunci**: hanya voice di `src/characters/canon.json` (ElevenLabs `eleven_v4`, seed tetap). Jangan ganti/tebak suara. Jangan tulis API key di repo.
3. **Pratinjau = gambar** (sheet/still PNG). MP4 hanya kalau pemilik minta. **Jangan render ulang video tanpa perintah.**
4. **Push hanya setelah pemilik bilang "cocok".** Hasil baru dibuat di `animasi-kusaka/drafts/` (tidak ikut git).
5. **Teks di video hanya subtitle** (tanpa nama pembicara) + caption resmi (`editing.json → captions`).
6. **SFX pelengkap**: volume rendah di bawah dialog, satu SFX satu makna.
7. **Durasi**: Long ≥ 6 menit (atau `minSeconds` per episode). Shorts 40 dtk–3 mnt, ideal 40–60 dtk, naskah sendiri.
8. **Brand**: channel *Kusaka Design*, Logo 2, Banner 3, watermark Shorts = Contoh 5 (hanya Shorts).
   Judul video: `[hook + emosi] | KUSAKA`, tanpa nomor episode. Thumbnail: teks hanya judul, tanpa nomor episode, **tanpa uang/Rp**. Identitas tetap (bingkai kuning, font Bangers, Kusaka ekspresi ekstrem)
   tetapi **komposisi berbeda tiap episode dan tiap varian** (pola, split, callout, properti, warna) — lihat `brand/BRANDING.md`.
9. Rilis final di `animasi-kusaka/releases/` (< 100 MB, `ffmpeg -c:v libx264 -tune animation -crf 29`).
10. **Setiap MP4 rilis wajib punya `src/data/episodes/<id>-upload.md`** mengikuti `upload-template.md`
    (3 judul A/B, deskripsi, tag, hashtag kolom, konsep thumbnail, komentar pin, strategi algoritma).

## Playbook Shorts (pemilik, 18 Nov 2026 — riset algoritma Shorts 2026)
Kamu ahli strategi Shorts: **riset dulu tiap Shorts** (WebSearch: sinyal algoritma terbaru + tren topik) lalu terapkan.
- **Full 9:16**: video `KusakaEpisodeShorts` 1080×1920 **dan** sampul 1080×1920 (`thumbnails.json` → `"size": "9x16"`,
  `"bgX"` = titik tengah set). Render: `node scripts/render-brand.mjs shorts05`. Komposisi sampul beda dari Shorts sebelumnya.
- **Tanpa subtitle** di Shorts: naskah `"subtitles": false` (watermark Contoh 5 tetap).
- Sinyal utama: **swipe-away 0–2 dtk** (terkuat, negatif) → kalimat pertama = punchline/premis di 0,3 dtk, tanpa intro;
  **loop/rewatch** → kalimat terakhir menyambung ke kalimat pertama, `tail` 0,2; lalu retensi, share, komentar.
- Durasi: komedi kuat di durasi pendek → target **40–48 dtk** (40 = batas kanon), buang baris pengisi, `gapSeconds` 0,2.
- Satu crash zoom di titik balik (±tengah video). Lelucon harus jalan tanpa teks (ekspresi + suara).
- Sampul custom diunggah lewat Studio desktop (bertahap, bisa butuh YPP); cadangan: frame crash zoom. Jangan tempel sampul
  di frame pertama (menunda hook). Shorts tidak punya A/B test sampul/judul.
- Gaya cerita: cek naskah terhadap `SERIES_BIBLE.md` (sifat, bahasa, struktur Shorts) dan masukkan ≥1 kalimat khas
  tiap Shorts; tiap kemunculan tokoh dipicu sebab di cerita (mis. Dinda ngadu → Ibu datang).
- Upload.md Shorts wajib berisi tabel "sinyal → penerapan" + metrik cek (Viewed vs swiped away, Engaged views, loop).

## Gaya visual v3 ("anime-drama", mengikuti referensi pemilik)
- **Karakter tetap 16 karakter kanon** (jangan diganti desainnya). Detail: mata anime (iris 2 lapis + 2 kilau), kilau rambut
  terputus, lipatan baju/lengan/celana, bayangan kerah & poni, kilau sepatu, shading sisi gelap + rim light dari cahaya lokasi.
- **Kamera statis**: tiap shot SATU ukuran, tanpa zoom/geser di dalam shot, **potong keras** tiap baris.
  Pindah adegan juga **potong keras** (tanpa wipe/whoosh, `editing.json → transition: "cut"`).
  Sutradara otomatis (`src/edit/director.ts`) memilih ukuran: awal adegan `wide` → `two` → tanya-jawab `close` bergantian,
  pembicara baru `medium`, emosi kuat `close`, orang jalan `wide`, tiap ±5 baris `two`, akhir adegan `two`.
- **Close-up**: subjek di sepertiga frame, ada ruang ke arah pandangan, latar hanya sedikit lembut.
  **Karakter tidak pernah diblur.** Gaya close: `single` (hanya pembicara) atau `ots` (lawan bicara di tepi depan,
  tajam tapi gelap). Otomatis bergantian; momen emosional = single. Paksa per baris: `"closeStyle": "single" | "ots"`.
- **Jalan**: siklus langkah + ayunan tangan + naik-turun badan, 380 px/dtk. Masuk/keluar layar lewat `offL`/`offR`.
- **Pencahayaan per lokasi** (`locations.json → light`): sun / window / sunset / night + bayangan daun, sinar, grain, vignette.
- **Detail set**: `src/scene/Details.tsx` + `Details2.tsx` (14 lokasi).
- **Subtitle**: Oswald 600, putih, kecil, outline tipis, tengah bawah, tanpa highlight karaoke.

## Format naskah (`src/data/episodes/<id>.json`)
```json
{ "format": "shorts", "episode": "shorts04", "title": "…", "fps": 30,
  "gapSeconds": 0.3, "sceneLead": 0.3, "sceneGap": 0, "tail": 0.6,
  "scenes": [{ "id": "s01", "location": "koridor",
    "cast": { "ujang": { "mark": "A", "facing": 1 }, "kusaka": { "mark": "B", "facing": -1 } },
    "lines": [
      { "id": "l001", "speaker": "ujang", "emotion": "neutral", "listener": "neutral", "shot": "two",
        "action": "gesture", "text": "…", "move": { "who": "kusaka", "from": "offR", "to": "B", "at": 0 } },
      { "id": "l002", "speaker": "kusaka", "emotion": "shock", "listener": "deadpan", "shot": "crash", "action": "shock", "text": "Hah?!" }
    ] }] }
```
- `shot`: tulis `two` agar dipilih otomatis; paksa dengan `wide` / `medium` / `close` / `crash` (crash maks 1 per adegan).
- **Arah hadap otomatis (larangan membelakangi lawan bicara):** `cast.facing` hanya arah awal; tiap baris pembicara
  menghadap lawan bicara, pendengar menghadap pembicara (`src/edit/facing.ts`). Lawan bicara ambigu → `"to": "ibu"`.
  Emosi `listener` berlaku untuk SEMUA pendengar — pakai `reactions` untuk satu tokoh saja (pose slump/condong bisa menutupi wajah tetangga).
- Opsional: `"camAt": "D"` (kamera diam di titik itu, karakter lewat), `"fg": "tree" | "pillar" | "plant"` (benda depan blur),
  `"move"` (jalan), `"caption"` (hanya dari whitelist), `"flashback": true`, `"offscreen": true` (shot two),
  `"reactions": { "ucok": ["surprised", "idle"] }`, `"sfx": [{ "id": "rimshot", "at": "end" }]` (`at` WAJIB: detik atau "end").
- Emosi: neutral, smug, suspicious, shock, laugh, pleading, deadpan, surprised, embarrassed, defeated.
- Aksi: idle, gesture, pocket, chin, point, plead, crossed, shock, laugh, slump, wave, thumbsup, peace, facepalm, hips, phone.
- Lokasi (18): warung, gerbang, kelas, koridor, kamar, kelasBelakang, kelasJendela, mejaGuru, kantin, ruangBK, perpustakaan,
  ruangTamu, lapanganUpacara, kos, ruangGuru, pasar, halte, lapanganBasket.
- **Extras (NPC latar)** muncul otomatis per lokasi (`src/scene/Extras.tsx`); per adegan `"extras": "off" | "low" | "normal"`.
- **Setiap episode panjang**: sertakan adegan TANPA Kusaka dan lokasi di luar rumah/sekolah (pasar, halte, lapangan, dll.).
- **Thumbnail**: pola `rays|halftone|speed|stripes|grid`, properti `wallet|flagUpsideDown|bookStack|phoneDrama`, `split`, `callout`, `textRot`/`textAlign`. Render: `npm run brand -- eps04`.
- **Storyboard**: grid 4×6 still (2 per adegan) → `storyboards/<id>.png` (kompres palet 256 warna).

## Alur kerja
1. Tulis naskah (hook ≤ 2 dtk, ending loop/cliffhanger, catchphrase karakter).
2. `node scripts/generate-voice.mjs src/data/episodes/<id>.json` — validasi + suara terkunci (take dipakai ulang per hash).
   Untuk uji/draft pakai episode `draft-…` (audio tidak ikut git) dan simpan naskah di `drafts/`.
3. Pratinjau still: `npx remotion still KusakaEpisode drafts/x.png --frame=N` (Shorts: `KusakaEpisodeShorts`).
4. Setelah pemilik minta: `npm run render` / `npm run render:shorts` → kompres ke `releases/`.
5. Buat `<id>-upload.md`. Kirim gambar pratinjau. Tunggu **"cocok"** → commit → push ke branch kerja.
6. `src/data/timeline.json` harus berisi data rilis terakhir sebelum commit (jangan commit timeline draft).

## Alur hemat kuota + hasil maksimal (TERKUNCI)
- **Satu sesi per episode/Shorts.** Skill ini otomatis terbaca; jangan minta pemilik menjelaskan ulang.
- **Revisi di tahap naskah/storyboard** (gambar). Video **dirender sekali** setelah "cocok" + perintah render.
- ElevenLabs: take dipakai ulang per hash; revisi teks hanya membuat ulang baris yang berubah; uji gaya pakai naskah pendek.
- **Render master sekali** (Remotion default, 1080p ±6,5 Mbps). Long > ±75 menit render → pecah per batas adegan
  (`--frames=a-b --concurrency=4`, tiap bagian di background ≤ 2 jam), gabung dengan `ffmpeg -f concat`.
- Dari master dibuat dua file tanpa render ulang:
  1. **HQ kirim ke pemilik** ≤ 380 MB (batas kirim chat 400 MB): 2-pass libx264 `-preset slow -tune animation`,
     video ≈ (360 MB × 8 / durasi) − 192 kbps, audio AAC 192k, `-movflags +faststart`. Kirim lewat chat (SendUserFile).
  2. **Arsip GitHub** < 100 MB di `releases/`: 2-pass ±650 kbps + AAC 128k.
- File master/HQ tetap di `out/` (tidak ikut git). Unduhan pemilik cukup sekali (file HQ).

## Catatan teknis
- ElevenLabs lewat `curl` (proxy menyuntik auth). Verifikasi voice: `/v1/voices/{id}` lalu fallback `/v1/shared-voices`.
- Kuota ElevenLabs terbatas: pakai ulang take, uji pakai naskah pendek.
- Hapus file dengan path aman (`"${D:?}"/…`), jangan `rm` dengan variabel kosong.
