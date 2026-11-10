# Tugas terjadwal: Produksi (2 tahap, dengan Cek Suara oleh owner)

Kamu menjalankan tim produksi Kantor Konten milik Adip. Bekerjalah sendiri tanpa bertanya.

```
usulan ──owner ACC──► acc ──TAHAP A──► cek-vo ──owner ACC suara──► vo-acc ──TAHAP B──► selesai
                                         │  ▲
                              owner "Ulang VO"  └──TAHAP A2 (ulang VO sesuai catatanVo)
                                         ▼  │
                                      vo-ulang
```

Animator **tidak boleh** jalan sebelum owner menekan "ACC suara" (status `vo-acc`).

## 0. Persiapan (selalu)
- Pastikan repo `adipkharis26-cmd/adipkharis` ada (kalau belum, clone), checkout `claude/stickmen-motion-graphics-kharis-ap44z0`, lalu `git pull`.
- Baca `workflow/config.json` dan `workflow/README.md`. Muat `ArtifactData` (ToolSearch `select:ArtifactData`). Baca juga artifact Kantor Konten sekali dengan Artifact `action:"read"`, karena itu syarat sebelum bisa mengunggah aset.
- Query `ideas`, lalu buang ide yang punya `kunci.sampai` lebih besar dari waktu sekarang (sedang dikerjakan di sesi lain).
- Pilih **satu** pekerjaan dengan prioritas: `vo-ulang` > `vo-acc` > `acc`. Di status yang sama, ambil yang `voKeputusanAt`/`accAt`-nya paling lama.
- **Kalau tidak ada, langsung berhenti** dengan satu kalimat "Tidak ada pekerjaan baru". Jangan commit apa pun.
- Pasang kunci di ide: `kunci: {oleh:"terjadwal", sampai:<sekarang+3 jam ISO>}`. Muat skill channelnya (`config.channels[ide.channel].skill`) dan patuhi sepenuhnya. Gaya channel terkunci. `catatan` dan `catatanVo` owner wajib diikuti.
- **Tiap channel punya gaya, suara, dan mesin render sendiri.** Jangan mencampur:
  - `mas-kharis`: prefix episode `ep`, stikmen kanvas 2D, 8 bagian, suara Eyang.
  - `ternyata-leluhur`: prefix `tl`, diorama 3D three.js, 7 beat, suara DK - Documentary, plus musik/SFX.
  - `ohhiyaa`: prefix `oh`, miniatur 3D mainan (`ohhiyaa3d.js`), 6 bagian v2 (tebak A/B/C, tangga landmark, OHHIYAA!, ending loop), maskot OHI, musik + SFX, suara Papa Gufron satu tarikan. **Durasi 40–55 detik.** Kalau ide punya `draftNaskah`, pakai sebagai dasar naskah.
  - `dari-1-mnt`: prefix `dm`, Hybrid Kinetic Pop 2D (`kinetic.js`), suara Finn, SFX tanpa musik. **Durasi wajib 60–90 detik.**
  - Prefix ada di `config.channels.<id>.prefix`. `tts_elevenlabs.py` memilih suara dari prefix itu.
- Agen per divisi: Mas Kharis memakai `penulis`, `suara`, `animator`; Ternyata Leluhur memakai `tl-penulis`, `tl-suara`, `tl-animator`; Dari 1 mnt memakai `dm-penulis`, `dm-suara`, `dm-animator`; Ohhiyaa! memakai `oh-penulis`, `oh-suara`, `oh-animator`. `cekfakta`, `thumbnail` (Desainer Thumbnail), dan `publisher` dipakai bersama.
- **Wajib**: setiap pindah langkah, update `agents/<id>` agen yang sedang bekerja menjadi `{status:"kerja", aktivitas:"<apa yang dikerjakan, mis. 'Animasi EP04'>", diubah:<ISO>}`. Saat langkahnya selesai, ubah ke `{status:"santai", aktivitas:"<hasil singkat>"}`. Update juga `progres` di ide. Owner memantau ini di peta kantor, jadi jangan dilewati. Selalu pakai `if_version` (baca dulu dengan `get`). Kalau dokumen agen belum ada (divisi baru), buat dengan `set` tanpa `if_version`.

**Penyimpanan antarsesi.** Push git dari sesi terjadwal bisa gagal. Karena itu Kantor Konten adalah sumber kebenaran untuk berkas episode:
- `naskahMd` berisi isi file naskah lengkap.
- `voText` berisi isi `video/vo/epNN.txt`.
- `voJson` berisi isi `video/vo/epNN.json` sebagai string.
- `voMp4AssetId` berisi aset MP4 pratinjau VO, yang di dalamnya ada audio VO.

Di awal tahap B dan A2, kalau file episode tidak ada di repo, buat ulang dari field-field itu. Audio diambil dengan Artifact `action:"read"`, `path:<voMp4AssetId>`, lalu `ffmpeg -i file.mp4 -vn -c:a libmp3lame -b:a 192k video/vo/epNN.mp3`.

## TAHAP A — status `acc`: Penulis Naskah → Cek Fakta → Pengisi Suara
1. **Penulis Naskah.**
   - Nomor episode = 1 + angka terbesar dari file `naskah/<prefix>NN-*` dan field `episode` di `ideas` **channel yang sama**. Dua digit, misalnya `ep05` atau `tl01`. Di bawah ini `epNN` berarti `<prefix>NN`.
   - Tulis `naskah/epNN-slug.md` persis dengan format skill channel itu. Penutupnya **harus unik** (lihat aturan di skill).
   - Tulis `video/vo/epNN.txt`: satu paragraf per bagian/beat, 7 untuk Mas Kharis dan 7 untuk Ternyata Leluhur.
2. **Cek Fakta.** Verifikasi setiap klaim, pakai WebSearch bila perlu. Klaim yang tidak pasti dihapus atau dilunakkan. Jangan mengarang angka atau nama.
3. **Pengisi Suara.**
   - Jalankan `python3 video/src/tts_elevenlabs.py epNN`. Setelan suara diambil dari `config.elevenlabs`; jangan diubah tanpa catatan owner.
   - Durasi mengikuti skill: Mas Kharis **40–55 detik** (pangkas kalau lebih dari 58 detik), Ternyata Leluhur **65–80 detik** (pangkas kalau lebih dari 82 detik), Dari 1 mnt **60–90 detik** (di bawah 60 detik tambah isi, di atas 90 detik pangkas). Yang dipangkas kalimat naskah, bukan kecepatan suara.
   - Kalau ElevenLabs gagal: set `{status:"butuh-vo", progres:"<alasan>"}`, simpan `naskahMd` dan `voText`, lalu berhenti.
4. **Kirim untuk dicek.**
   - Jalankan `video/src/vo_preview.sh epNN "<judul>"`.
   - Unggah `video/out/epNN-vo-preview.mp4` dengan Artifact publish: `url` Kantor Konten, `file_path`, dan `asset:true`.
   - Update ide: `{status:"cek-vo", episode, naskahPath, naskahMd, voText, voJson, voDurasi, voMp4AssetId:<id>, voPreviewAssetId:<id>, voPreviewUrl:<url persis dari hasil>, progres:"VO siap dicek owner", kunci:{"__delete__":true}}`.
5. Commit dan push sumber. Kalau push gagal, tambahkan `sumberBelumPush:true`. **Berhenti di sini. Jangan lanjut ke animator.**

## TAHAP A2 — status `vo-ulang`: Pengisi Suara mengulang VO
- Baca `catatanVo` owner.
  - Kalau catatan menyebut bagian tertentu, ubah teks bagian itu bila perlu, lalu jalankan `tts_elevenlabs.py epNN --from <N>` dari bagian pertama yang berubah.
  - Kalau catatan bersifat umum (intonasi, suara, tempo), buat ulang semuanya.
  - Kalau owner meminta suara atau setelan lain, ubah `workflow/config.json` hanya untuk hal yang diminta.
  - Kalau catatan meminta **alur v2 / tulis ulang**, tulis ulang seluruh naskah (`naskah/epNN-*.md` dan `video/vo/epNN.txt`) mengikuti struktur di skill channel saat ini (penulis + cek fakta, fakta lama boleh dipakai ulang), lalu buat ulang semua VO dan pastikan durasinya masuk target skill.
- Lalu jalankan langkah A.4 dan A.5 lagi. Status kembali `cek-vo`, dengan `progres:"VO diulang: <ringkas perubahan>"`.

## TAHAP B — status `vo-acc`: Animator → Publisher
1. **Animator.**
   - Siapkan file episode (lihat Penyimpanan antarsesi).
   - Ikuti bagian "Pipeline produksi" di skill channelnya. Semua waktu diambil dari `at()/atEnd()/CUT`.
     - **Mas Kharis:** `video/src/epNN.html` (pola `ep02.html`) dan `epNN.js` (7 scene, pola **`ep04.js` v2**: cold open, eskalasi, 1 fakta, pemicu debat, trik + lelucon, pilih kubu, punchline loop). Audio adalah `../vo/epNN.mp3`.
     - **Dari 1 mnt:** `video/src/dmNN.html` (pola `dm01.html`) dan `dmNN.js` (pola **`dm01.js`**, standar editing **Pop v2** di skill bagian 4b: hook penuh di detik 0, `kata`/`vs`/`race`/`fokus`/`burst`/`glitchAt`, layar terisi, latar berbeda tiap potongan, maskot 3–4 kali). Lalu jalankan `python3 video/src/leluhur_mix.py dmNN`. Audio adalah `../vo/dmNN-mix.m4a`.
     - **Ohhiyaa!:** `video/src/ohNN.html` (pola `oh00.html`) dan `ohNN.js` (pola `oh00.js`, 6 bagian, mesin `ohhiyaa3d.js`). Lalu `python3 video/src/leluhur_mix.py ohNN`. Audio adalah `../vo/ohNN-mix.m4a`.
     - **Ternyata Leluhur:** `video/src/tlNN.html` (pola `tl00.html`) dan `tlNN.js` (7 beat, sekitar 30 potongan, pola `tl00.js`, mesin `leluhur3d.js`). Lalu jalankan `python3 video/src/leluhur_mix.py tlNN`. Audio adalah `../vo/tlNN-mix.m4a`.
   - Render stills di 8–12 titik penting, gabungkan dengan ffmpeg hstack, lalu periksa sendiri (Read gambar). Pastikan wajah tidak tertutup teks, karakter besar, warna tidak monoton, hook atau label terbaca, dan kamera tidak masuk ke dinding. Perbaiki lalu ulangi maksimal 2 kali.
   - Render: `cd video/src && EP=epNN node render.js video ../out/<channel>-epNN.mp4 30 <audio>`. Render 3D lama, jadi jalankan di background dan tunggu sampai selesai.
   - Kalau ada error yang tidak bisa diperbaiki: set `{status:"gagal", progres:"<error singkat>"}` dan lepas kunci.
2. **Thumbnail High CTA** (agen `thumbnail`, semua divisi).
   - Muat skill `.claude/skills/thumbnail-high-cta/SKILL.md`. Berperan sebagai kreator YouTube berpengalaman yang paham algoritma (CTR + durasi tonton).
   - Mulai dari `thumbIde` di ide (kalau ada) dan `catatan` owner. Pilih frame terkuat dari stills, tulis `video/thumb/epNN.json` dengan **2 varian** (A dan B, pendekatan berbeda).
   - Jalankan `cd video/src && node thumbnail.js epNN`, lalu buka `video/out/thumb/epNN-cek.png` dan periksa sesuai skill (terbaca di ukuran feed, wajah tidak tertutup, angka cocok). Perbaiki maksimal 3 kali.
   - Kalau gagal, jangan hentikan produksi: tulis `progres` singkat dan lanjut ke Publisher tanpa thumbnail.
3. **Publisher.**
   - Kalau MP4 lebih dari 14 MB, buat salinan untuk diunggah: `-c:v libx264 -crf 24 -c:a copy -movflags +faststart`.
   - Unggah sebagai aset ke Kantor Konten.
   - Unggah juga `video/out/thumb/epNN-A.png` dan `epNN-B.png` sebagai aset (PNG, di bawah 20 MB).
   - Update ide: `{status:"selesai", videoAssetId, videoUrl, thumbs:[{nama:"A", assetId, url, teks:"<teks thumbnail>", alasan}, {nama:"B", ...}], thumbPilihan:"A", progres:"Selesai", upload:"Judul: … | Deskripsi: … | Tag: #…", kunci:{"__delete__":true}}`. Judul upload maksimal 70 karakter dan memakai hook. Tag 5–8 buah.
   - Simpan juga kode episode ke field `epJs` dan isi `video/thumb/epNN.json` ke field `thumbJson`, supaya tidak hilang kalau push gagal.
   - Commit (`feat: produce <channel> epNN (<judul singkat>)`) lalu push. Kalau push gagal, beri tanda `sumberBelumPush:true`. Jangan membuat PR.
   - Kalau tool SendUserFile tersedia, kirim MP4 dan thumbnail varian utama ke owner. Kalau tidak, lewati.
   - **Divisi baru tanpa branding:** kalau dokumen `brand/<channel>` belum ada, buat logo, banner, dan bio dengan skill `.claude/skills/branding-channel/SKILL.md` (frame dari episode yang baru selesai bisa jadi `art`).
   - Semua agen kembali `santai`. Akhiri dengan ringkasan singkat.
