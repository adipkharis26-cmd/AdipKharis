# Shorts 8 "Sogok Gorengan" (id `shorts11`): status produksi

Naskah + storyboard disetujui pemilik ("cocok", 23 Nov 2026). Suara mode dialog dibuat (0:46). BELUM dirender (render hanya atas perintah).

- Format: running gag hitungan Mang Udin (aturan 20; beda dari Shorts 7 POV). Tokoh: Kusaka, Mang Udin. Lokasi gerbang, Senin pagi, seragam + tas.
- 17 baris, 859 karakter. Hook "SOGOK SATPAM / PAKAI GORENGAN", crash zoom l001, eskalasi alasan (ban bocor → nenek sakit → sogok bakwan),
  punchline "Mamang lupa. Mulai lagi. Satu.", CTA like (tengah, reveal Mang Udin), loop l017 "pas dua puluh" → l001.
- Gerbang tertutup → dibuka setelah sogokan (`tracks.gate`). Audit benda/tindakan: 0.
- Kanon v3.9.0: aksi baru `pushup` (badan papan miring, telapak di lantai, turun-naik ±0,9 dtk). Aturan audit push-up & bakwan.
- Suara: Kusaka −18,4 LUFS, Mang Udin −18,5 LUFS; tidak ada jeda mati > 0,5 dtk.
- Storyboard final (dengan suara): `storyboards/shorts11.png`.
- Sampul 9:16 `brand/thumbnails/shorts11-A.png` dan paket upload `shorts11-upload.md` disetujui ("cocok", 23 Nov 2026).

## Langkah berikutnya
1. Render HANYA atas perintah pemilik: `node scripts/generate-voice.mjs src/data/episodes/shorts11.json` (take dipakai ulang) → `npm run render:shorts`.
2. Output aturan 13: MP4 HQ "Shorts 8 - Sogok Gorengan" → thumbnail 9:16 `brand/thumbnails/shorts11-A.png` → judul + deskripsi + tag;
   arsip `releases/Kusaka-Shorts8-Sogok-Gorengan.mp4`; `shorts11-upload.md`; timeline.json rilis.
