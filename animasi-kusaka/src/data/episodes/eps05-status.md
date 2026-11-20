# Eps. 5 "Satu Kelompok": status produksi

Naskah v2 disetujui pemilik ("cocok", 20 Nov 2026). Suara SUDAH dibuat (ElevenLabs, suara terkunci). Video BELUM dirender.

- Premis: Kusaka sekelompok dengan Nadia dan hanya punya satu hari membuktikan dia bukan beban. Cerita berdiri sendiri (tanpa sambungan Eps. 4).
- Struktur: hook mandiri (s01) → rencana A gagal (s02–s03) → warung, benih twist (s04) → rencana B nekat (s05) → klimaks visual perpustakaan (s06–s07) → twist Sasa (s08) → selesai (s09–s10) → teaser foto Sasa (s11).
- Naskah: `eps05.json`: 11 adegan, 131 baris, 6.011 karakter, durasi asli 9:31 (571 dtk; batas 8:00–10:59). Hook ±28 dtk setelah intro, teaser foto ±13 dtk.
- Audit benda/tindakan: `npm run audit:props -- src/data/episodes/eps05.json` → 0 temuan.
- Kanon: karakter v3.3.0, lokasi v3.7.0, editing v2.11.0 (tidak diubah).
- Suara: `public/audio/eps05/` (131 take). `src/data/timeline.json` di repo tetap data rilis terakhir; buat ulang timeline Eps. 5 dengan
  `node scripts/generate-voice.mjs src/data/episodes/eps05.json` (take dipakai ulang, tanpa kuota) sebelum render.
- Storyboard (24 still dari timeline asli): `storyboards/eps05.png`.

## Catatan visual
- Menara 50 buku roboh (s06) saat ini hanya tampil lewat crash-zoom + efek suara; animasi tumpukan jatuh belum ada
  (butuh prop/track baru dan kenaikan versi kanon, perlu izin pemilik).

## Langkah berikutnya
1. Render video HANYA atas perintah pemilik (`npm run render`), lalu kompres ke `releases/`.
2. Setelah render: MP4 HQ → 3 thumbnail rekomendasi (aturan 19) → judul/deskripsi/tag; buat `eps05-upload.md`.
