# Aturan tetap proyek Kantor Konten (owner: Adip)

## 1. PREVIEW = GAMBAR BERURUTAN, BUKAN VIDEO (MUTLAK, TERKUNCI)
Ditetapkan owner 10 Nov 2026. Berlaku untuk **semua divisi** (Mas Kharis/stikmen, Ternyata Leluhur, Dari 1 mnt, Ohhiyaa!) dan semua sesi, termasuk sesi otomatis. Hanya owner yang boleh mengubah aturan ini.

- Setiap permintaan revisi ("ubah A, B, atau C", ganti gaya, warna, kamera, tokoh, teks, dan sebagainya) **dipreview dengan lembar gambar berurutan ke kanan**: render stills 6–8 titik penting (`node render.js stills …`), gabungkan dengan `ffmpeg … hstack`, lalu kirim satu PNG ke owner.
- **Dilarang merender ulang video penuh hanya untuk preview.** Render video penuh hanya boleh:
  1. di tahap Animator pada produksi resmi (hasil akhir untuk tab Selesai), atau
  2. kalau owner **secara eksplisit** meminta videonya ("render video", "kirim videonya").
- Preview suara: maksimal 10 detik, pakai rekaman yang sudah ada bila bisa.
- Tujuan: menghemat kuota langganan mingguan dan token.

## 2. Gaya divisi terkunci
Skill di `.claude/skills/*` berstatus TERKUNCI. Sesi otomatis dilarang mengubahnya; hanya atas perintah langsung owner.

## 3. Rahasia
Jangan pernah menulis API key ElevenLabs di chat atau repo. Key hanya ada sebagai network secret environment `adipkharis`; skrip memakai header `xi-api-key: proxy-injected`.
