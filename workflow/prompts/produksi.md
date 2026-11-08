# Tugas terjadwal: Produksi (Penulis → Cek Fakta → Pengisi Suara → Animator → Publisher)

Kamu menjalankan seluruh tim produksi Kantor Konten milik Adip. Bekerjalah sendiri tanpa bertanya.

## 0. Persiapan
- Pastikan repo `adipkharis26-cmd/adipkharis` ada (kalau belum, pakai `add_repo` lalu clone dengan akses push), checkout `claude/stickmen-motion-graphics-kharis-ap44z0`, lalu `git pull`.
- Baca `workflow/config.json` dan `workflow/README.md`. Muat `ArtifactData` (ToolSearch `select:ArtifactData`).
- Query `ideas` dengan `status == "acc"`. **Kalau kosong, langsung berhenti** dengan satu kalimat "Tidak ada ACC baru". Jangan commit apa pun.
- Ambil **satu** ide dengan `accAt` paling lama. Muat skill channelnya (`.claude/skills/<channel>/SKILL.md`) dan patuhi sepenuhnya. Gaya channel terkunci. `catatan` owner wajib diikuti.
- Update ide menjadi `{status:"produksi", progres:"Penulis Naskah mulai"}`. Setiap pindah tahap, perbarui `progres` di ide dan `agents/<id>` (kerja, lalu santai). Selalu pakai `if_version`.

## 1. Penulis Naskah
- Nomor episode = 1 + angka terbesar dari: file `naskah/epNN-*` dan field `episode` di semua dokumen `ideas` (bisa saja ada sumber yang belum ter-push). Dua digit (`ep03`, ...).
- Tulis `naskah/epNN-slug.md` persis dengan format skill (8 bagian dengan Visual, Teks layar, dan VO; lalu VO lengkap dan catatan rekam). Hook layar memakai `hook` dari ide. CTA bagian 8 memakai `cta` dari ide ditambah teaser episode berikutnya.
- Tulis `video/vo/epNN.txt` berisi 8 paragraf VO yang dipisah baris kosong. Simpan teks yang sama ke field `voText` di ide, beserta `naskahPath` dan `episode`.

## 2. Cek Fakta
- Periksa setiap klaim di "Dasar fakta" dan di VO. Pakai WebSearch bila perlu. Klaim yang tidak bisa dipastikan dihapus atau dilunakkan ("sering", "menurut sebagian peneliti"). Jangan mengarang angka atau nama peneliti.

## 3. Pengisi Suara
- Jalankan `python3 video/src/tts_elevenlabs.py epNN`.
- Kalau gagal (Voice ID belum diisi, 401/403, atau host diblokir):
  - Jika ide punya `voAssetId`, baca dulu artifact Kantor Konten dengan Artifact `action:"read"`. Lalu Artifact `action:"read"` dengan `url` Kantor Konten dan `path:<voAssetId>` untuk mengunduh file, lalu konversi ke `video/vo/epNN.mp3` dengan ffmpeg. Setelah itu jalankan `python3 video/src/align.py video/vo/epNN.mp3 video/vo/epNN.txt video/vo/epNN.json` dan tulis `video/vo/epNN-words.js` (`const VO = <json>;`).
  - Jika tidak punya: set ide `{status:"butuh-vo", progres:"Naskah siap. ElevenLabs belum aktif: <alasan singkat>. Rekam VO dari teks di kartu lalu unggah."}`. Commit dan push naskah (kalau push gagal, cukup lanjut), lalu berhenti.

## 4. Animator
- Buat `video/src/epNN.html` (salin pola dari `ep02.html`) dan `video/src/epNN.js` (8 scene, pola sama dengan `ep02.js`). Semua waktu diambil dari `at()/atEnd()/CUT`.
- Render stills di 6–8 titik penting, gabungkan dengan ffmpeg hstack, lalu periksa sendiri (Read gambar). Pastikan wajah tidak tertutup teks, karakter besar, warna tidak monoton, dan hook judul besar. Perbaiki lalu ulangi maksimal 2 kali.
- Render: `cd video/src && EP=epNN node render.js video ../out/<channel>-epNN.mp4 30 ../vo/epNN.mp3`.
- Kalau ada error yang tidak bisa diperbaiki: set ide `{status:"gagal", progres:"<error singkat>"}`, commit yang sudah ada, lalu berhenti.

## 5. Publisher
- Kalau MP4 lebih dari 14 MB, buat salinan untuk diunggah: `ffmpeg -i in.mp4 -c:v libx264 -crf 24 -preset medium -c:a copy -movflags +faststart out-web.mp4`.
- Baca artifact Kantor Konten (Artifact `action:"read"`), lalu unggah MP4: Artifact publish dengan `url` Kantor Konten, `file_path` MP4, dan `asset:true`. Pakai `url` hasilnya persis seperti yang diberikan.
- Update ide menjadi `{status:"selesai", videoAssetId, videoUrl, progres:"Selesai", upload:"Judul: … | Deskripsi: … | Tag: #… #…"}`. Judul upload maksimal 70 karakter dan memakai hook. Tag 5–8 buah.
- Commit sumber (naskah, vo txt/json/words.js/mp3, epNN.html/js) dengan pesan `feat: produce <channel> epNN (<judul singkat>)`, lalu `git push -u origin <branch>`. Jangan membuat PR. Push bisa gagal karena sesi terjadwal tidak punya hak push. Kalau begitu, jangan dianggap gagal: tambahkan `sumberBelumPush: true` ke ide dan lanjutkan. Video di Kantor Konten adalah hasil utama.
- Kalau tool SendUserFile tersedia, kirim MP4 ke owner (status proactive) dengan caption judulnya. Kalau tidak tersedia, lewati, karena video sudah ada di Kantor Konten.
- Semua agen kembali `santai`. Akhiri dengan ringkasan singkat.
