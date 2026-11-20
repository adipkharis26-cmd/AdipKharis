# Eps. 5 "Satu Kelompok": status produksi

Naskah disetujui pemilik ("cocok", 20 Nov 2026). Suara BELUM dibuat.

- Naskah: `eps05.json`: 12 adegan, 148 baris, 6.308 karakter, perkiraan durasi 10:10 (batas 8:00–10:59).
- Audit benda/tindakan: `npm run audit:props -- src/data/episodes/eps05.json` → 0 temuan.
- Kanon: karakter v3.3.0 (aksi `reach`, `photo`; benda lotteryBox, lotScroll, lotScrollRed, lotSlip, libBook,
  phonePhoto, rubberBands), lokasi v3.7.0 (NPC penjaga perpustakaan), editing v2.10.0 (durasi 8:00–10:59).
- Storyboard pratinjau (tanpa suara, durasi perkiraan): `storyboards/eps05.png`. Buat ulang setelah suara jadi.

## Langkah berikutnya
1. Pastikan sesi bisa menjangkau `api.elevenlabs.io` (Network access environment) dan key ElevenLabs tersedia
   (`ELEVENLABS_API_KEY`, jangan ditulis di repo).
2. Cek kuota: `GET /v1/user/subscription` (character_limit − character_count) ≥ ±6.308 karakter.
   Kurang → jangan generate sebagian, jangan suara cadangan.
3. `node scripts/generate-voice.mjs src/data/episodes/eps05.json --estimate`, lalu
   `node scripts/generate-voice.mjs src/data/episodes/eps05.json`.
4. Storyboard 24 still dari timeline asli → kirim ke pemilik. Render video HANYA atas perintah pemilik.
5. Setelah render: MP4 HQ → 3 thumbnail rekomendasi (aturan 19) → judul/deskripsi/tag; buat `eps05-upload.md`.
