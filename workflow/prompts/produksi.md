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
  - Prefix ada di `config.channels.<id>.prefix`. `tts_elevenlabs.py` memilih suara dari prefix itu.
- Agen per divisi: Mas Kharis memakai `penulis`, `suara`, `animator`; Ternyata Leluhur memakai `tl-penulis`, `tl-suara`, `tl-animator`. `cekfakta` dan `publisher` dipakai bersama.
- **Wajib**: setiap pindah langkah, update `agents/<id>` agen yang sedang bekerja menjadi `{status:"kerja", aktivitas:"<apa yang dikerjakan, mis. 'Animasi EP04'>", diubah:<ISO>}`. Saat langkahnya selesai, ubah ke `{status:"santai", aktivitas:"<hasil singkat>"}`. Update juga `progres` di ide. Owner memantau ini di peta kantor, jadi jangan dilewati. Selalu pakai `if_version` (baca dulu dengan `get`).

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
   - Tulis `video/vo/epNN.txt`: satu paragraf per bagian/beat, 8 untuk Mas Kharis dan 7 untuk Ternyata Leluhur.
2. **Cek Fakta.** Verifikasi setiap klaim, pakai WebSearch bila perlu. Klaim yang tidak pasti dihapus atau dilunakkan. Jangan mengarang angka atau nama.
3. **Pengisi Suara.**
   - Jalankan `python3 video/src/tts_elevenlabs.py epNN`. Setelan suara diambil dari `config.elevenlabs`; jangan diubah tanpa catatan owner.
   - Durasi mengikuti skill: Mas Kharis 55–75 detik (pangkas naskah kalau lebih dari 80 detik), Ternyata Leluhur 85–100 detik (pangkas kalau lebih dari 105 detik). Yang dipangkas kalimat naskah, bukan kecepatan suara.
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
- Lalu jalankan langkah A.4 dan A.5 lagi. Status kembali `cek-vo`, dengan `progres:"VO diulang: <ringkas perubahan>"`.

## TAHAP B — status `vo-acc`: Animator → Publisher
1. **Animator.**
   - Siapkan file episode (lihat Penyimpanan antarsesi).
   - Ikuti bagian "Pipeline produksi" di skill channelnya. Semua waktu diambil dari `at()/atEnd()/CUT`.
     - **Mas Kharis:** `video/src/epNN.html` (pola `ep02.html`) dan `epNN.js` (8 scene, pola `ep02.js`/`ep03.js`). Audio adalah `../vo/epNN.mp3`.
     - **Ternyata Leluhur:** `video/src/tlNN.html` (pola `tl00.html`) dan `tlNN.js` (7 beat, sekitar 30 potongan, pola `tl00.js`, mesin `leluhur3d.js`). Lalu jalankan `python3 video/src/leluhur_mix.py tlNN`. Audio adalah `../vo/tlNN-mix.m4a`.
   - Render stills di 8–12 titik penting, gabungkan dengan ffmpeg hstack, lalu periksa sendiri (Read gambar). Pastikan wajah tidak tertutup teks, karakter besar, warna tidak monoton, hook atau label terbaca, dan kamera tidak masuk ke dinding. Perbaiki lalu ulangi maksimal 2 kali.
   - Render: `cd video/src && EP=epNN node render.js video ../out/<channel>-epNN.mp4 30 <audio>`. Render 3D lama, jadi jalankan di background dan tunggu sampai selesai.
   - Kalau ada error yang tidak bisa diperbaiki: set `{status:"gagal", progres:"<error singkat>"}` dan lepas kunci.
2. **Publisher.**
   - Kalau MP4 lebih dari 14 MB, buat salinan untuk diunggah: `-c:v libx264 -crf 24 -c:a copy -movflags +faststart`.
   - Unggah sebagai aset ke Kantor Konten.
   - Update ide: `{status:"selesai", videoAssetId, videoUrl, progres:"Selesai", upload:"Judul: … | Deskripsi: … | Tag: #…", kunci:{"__delete__":true}}`. Judul upload maksimal 70 karakter dan memakai hook. Tag 5–8 buah.
   - Simpan juga kode episode ke field `epJs`, supaya tidak hilang kalau push gagal.
   - Commit (`feat: produce <channel> epNN (<judul singkat>)`) lalu push. Kalau push gagal, beri tanda `sumberBelumPush:true`. Jangan membuat PR.
   - Kalau tool SendUserFile tersedia, kirim MP4 ke owner. Kalau tidak, lewati.
   - Semua agen kembali `santai`. Akhiri dengan ringkasan singkat.
