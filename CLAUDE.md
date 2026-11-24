# Aturan tetap proyek Charizch Agent (owner: Adip)

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

## 4. Hemat kuota (WAJIB, owner 24 Nov 2026)
Proyek ini bernama **Charizch Agent** (dulu "Kantor Konten"). Kuota langganan owner dipakai seirit mungkin dengan hasil maksimal:
- **Satu sesi = satu tugas.** Setelah satu episode selesai atau percakapan sudah panjang, pindah sesi baru dengan prompt `workflow/HANDOFF.md`. Konteks panjang membuat setiap balasan mahal.
- **Baca hemat.** Jangan membaca file besar utuh (`workflow/charizch-agent.html` ±180 KB, `video/src/leluhur3d.js`). Pakai `grep -n` lalu `sed -n` rentang yang perlu. Jangan `Artifact read` kecuali memang akan republish.
- **Riset maksimal 3 pencarian per topik.** Kalau sumber masih lemah, laporkan dan ganti topik. Jangan terus mencari.
- **Naskah dihitung dulu sebelum TTS:** ±0,46 dtk/kata, jadi untuk 65–80 dtk targetkan 140–165 kata. Tujuannya supaya VO tidak dibuat ulang.
- **Preview** mengikuti aturan 1: maksimal 2 putaran perbaikan internal sebelum lembar dikirim ke owner.
- **Render penuh hanya setelah acc**, di background dengan timeout 2 jam, dan tanpa proses Chromium lain bersamaan (render TL13 pernah terpotong karena itu).
- **Tanpa subagent** kecuali owner meminta atau tugasnya benar-benar paralel.
- **Laporan ke owner singkat**: hasil, kendala, keputusan yang dibutuhkan. Jangan mengulang isi yang sudah ada di file.
