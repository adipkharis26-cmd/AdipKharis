# Shorts 4 "Papan Tulis" (id `shorts07`): status produksi

Naskah + storyboard disetujui pemilik ("cocok", 20 Nov 2026). Suara BELUM dibuat (api.elevenlabs.io diblokir network policy sesi).

- Format: Zaman dulu vs sekarang (aturan 20). Tokoh utama Bu Wati, Ucok, Sasa. Lokasi kelas (2 adegan: MASA LALU sepia → sekarang).
- 13 baris, 492 karakter, perkiraan ±44 dtk. Hook "JANGAN DIHAPUS! / DULU vs SEKARANG", crash zoom l001, CTA kirim (tengah, reveal Ucok), loop l013 → l001.
- Audit benda/tindakan: 0. Kanon v3.4.0 (aksi `erase`, benda `boardEraser`, `phoneGallery`), lokasi v3.8.0 (trek `board` papan kelas terhapus).
- Storyboard pratinjau (tanpa suara): `storyboards/shorts07.png`.

## Langkah berikutnya
1. Izinkan `api.elevenlabs.io` + key ElevenLabs. Cek kuota ≥ 492 karakter (jangan generate sebagian, jangan suara cadangan).
2. `node scripts/generate-voice.mjs src/data/episodes/shorts07.json` → storyboard final → `npm run render:shorts` (sudah diperintahkan pemilik).
3. Output aturan 13: MP4 HQ "Shorts 4 - Papan Tulis" → thumbnail 9:16 `brand/thumbnails/shorts07-A.png` → judul + deskripsi + tag; arsip `releases/Kusaka-Shorts4-Papan-Tulis.mp4`; buat `shorts07-upload.md`.
