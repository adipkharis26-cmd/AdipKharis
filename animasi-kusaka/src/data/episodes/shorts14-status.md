# Shorts 11 "Akhir Bulan" (id `shorts14`): status produksi

Naskah + storyboard disetujui pemilik ("cocok", 26 Nov 2026). Suara mode dialog dibuat (0:45). Dirender atas perintah pemilik ("cocok dan render"), dirilis 26 Nov 2026 (0:45, 4,5 MB): `releases/Kusaka-Shorts11-Akhir-Bulan.mp4`.

- Format: running gag buku utang Bu Ijah (aturan 20; beda dari Shorts 10 Tipe-tipe). Tokoh utama Kak Tara (mahasiswi, tanggal tua) + Bu Ijah; warung, siang, baju bebas.
- 16 baris, 0:45, Kak Tara & Bu Ijah −18,4 LUFS, tanpa jeda mati > 0,5 dtk. Audit props 0. Musik `music-warung-comedy`.
- Hook "TANGGAL TUA / DI WARUNG BU IJAH", crash zoom l001. Eskalasi turun: mi + telur dua → telur satu → mi saja → bawa mi & mangkok sendiri,
  minta air panas. Punchline: "Air panas, satu. Tak catat." Button: "Gas elpiji sekarang mahal, Nduk." CTA kirim (akhir, reveal Bu Ijah).
- Loop mulus: "Wis. Mau pesen apa lagi, Nduk?" → "Bu, mi rebus satu..." (shot wide, posisi sama dengan detik 0; mangkok diletakkan di balik sisipan CTA).
- Benda baru (Props, tanpa ubah kanon): `mieBungkus` (mi instan tanpa merek), `ceret` (ceret aluminium beruap). Aturan audit mi & air panas.
- Kamera: Shorts 9:16 tidak lagi memakai dorong-kamera penutup (`Video.tsx`), agar frame terakhir = frame pertama.
- Storyboard final (dengan suara): `storyboards/shorts14.png`.

## Langkah berikutnya
1. Sampul `brand/thumbnails/shorts14-A.png` + paket upload `shorts14-upload.md` (draf dikirim, menunggu "cocok").
2. Render HANYA atas perintah: `node scripts/generate-voice.mjs src/data/episodes/shorts14.json` → `npm run render:shorts` →
   "Shorts 11 - Akhir Bulan", arsip `releases/Kusaka-Shorts11-Akhir-Bulan.mp4`, timeline rilis.
