---
name: ternyata-leluhur
description: Gaya terkunci channel "Ternyata Leluhur": cerita kearifan lokal Indonesia berbasis sains, berupa animasi diorama 3D cerah (three.js) 1080×1920 dengan tokoh chibi berkepala bulat dan bergaris tepi hitam, caption kata per kata Montserrat 900, VO "DK - Documentary". Pakai skill ini setiap kali membuat ide judul, naskah, VO, atau video MP4 untuk Ternyata Leluhur, termasuk saat dijalankan oleh jadwal otomatis Kantor Konten.
---

# Ternyata Leluhur: gaya terkunci

Gaya ini **terkunci**. Karakter, palet, font, struktur naskah, dan suara tidak boleh diubah kecuali owner (Adip) memintanya langsung. Jangan mencampur gaya channel lain: stikmen Mas Kharis, "Hybrid Kinetic Pop", maskot chibi, dan suara Finn **bukan** milik channel ini.

Patokan hidup: `video/src/leluhur3d.js` (mesin), `video/src/tl00.js` (sampel), dan semua `naskah/tlNN-*.md`.

## 1. Identitas
- **Niche:** cerita kearifan lokal dengan penjelasan sains, tentang apa kata leluhur atau nenek moyang.
- **Format:** YouTube Shorts (juga TikTok dan Reels), 9:16, 1080×1920, H.264, 30 fps. Durasi mengikuti VO, **65–80 detik**.
- **Referensi gaya:** @JadiBeginiClip ("Kenapa Petani Ini Mengubur Kendi Kosong di Ladangnya?"). Tokoh harus **milik channel sendiri** dan tidak identik dengan tokoh referensi. Ceritanya juga harus baru.
- **Seri yang sudah dipakai:** Leluhur Membaca Bencana (Smong) dan Makanan Awet Tanpa Kulkas (Rendang). **Seri aktif:** `config.channels.ternyata-leluhur.seri_aktif`, saat ini Rumah dan Bangunan Leluhur.
- Episode memakai prefix `tl`: `tl01`, `tl02`, dan seterusnya. `tl00` adalah sampel gaya, bukan episode.

## 2. Tokoh (diorama 3D, `makeChar()`)
- **Bentuk dasar semua tokoh:**
  - Kepala bulat besar sawo matang `#B87A4B` dengan garis tepi hitam `#17120F`.
  - Mata hitam oval dengan titik putih, alis balok, hidung kecil, pipi `#EF8F80`.
  - Badan kapsul, tangan dan kaki pendek, sandal cokelat.
- Tokoh **berganti tiap cerita** dan semuanya fiksi. Bedakan lewat aksesori dan warna:
  - `hat`: `headband | straw | peci | kerudung | cap`
  - `hair`: `white | grey | black | bun`
  - `beard`, `mustache`, `glasses`, `fat`, `kid`
  - `pattern`: `plaid | stripe | dots | gold`
- Tokoh yang sudah dipakai (jangan dipakai ulang dengan ciri yang sama):
  - Kakek Rusli: ikat kepala oranye, baju kotak biru.
  - Si pedagang: topi jerami, kumis, baju garis kuning-merah.
  - Amak Ros: kerudung kuning, baju merah bermotif emas.
  - Uda Jamal: peci, kacamata, baju kotak hijau, gemuk.
  - Pak Darma dan si tukang (sampel tl00).
- **Ekspresi** (`pose(C,t,{expr})`): `smile, talk (+talk:true agar mulut ikut VO), happy, shock, angry, worried, laugh (badan berguncang), closed, flat`. Berkedip otomatis.
- **Lengan:** `down, hips, wave, point, pointL, up, hold, carry, shrug, cheer, stir, chin, cross, reach`.
- **Gerak:** `walk`, `run`, `jump:[t0]`, `nod`, `shake`, `look`, `tilt`, `lean`. Benda di tangan dipasang dengan `hold(C,'R',obj)`.
- Tokoh baru **hanya** lewat `makeChar()`. Jangan memodel tokoh dengan cara lain.

## 3. Visual
- **Gaya:** animasi diorama 3D cerah (three.js r149, `video/src/vendor/three.min.js`), **bukan stikmen**. Sains dijelaskan lewat penampang, kartu, dan label.
- **Palet** (pakai hex ini):
  - Langit pantai `#3F9BE8`→`#CFEAF7` (`sky('pantai')`); langit desa `#4FA8EC`→`#D6EEF8` (`sky('desa')`).
  - Pasir `#ECCD92/#D2B27C`; laut `#25AFC6`, buih `#EAFBFF`.
  - Rumput dan bukit `#56B04E #66B84F #2F9B48 #3AA951`.
  - Anyaman bambu `#C89A58/#A77A3E`; papan hijau `#1E5A45/#123F31`, bingkai `#7A4E27`.
  - Kuning aksen `#FFD84A #FFE15A #FFDD33`; merah `#D5301F #C7301F`; krem kartu `#FFF7E6`; garis `#17120F`.
- **Set dan properti** di `leluhur3d.js`:
  - Alam dan rumah: `ground(rumput|pasir|tanah|lantai|lab)`, `path`, `tree`, `palm`, `bush`, `hill`, `cloud`, `sea` (bergelombang), `stone`, `rumahPanggung({stilt, planted, weave, gonjong})`, `gonjongRoof` (rumah gadang), `rumahBeton` (pembanding modern), `board` (papan hijau berteks).
  - `PROP.*`: ember, ikan, kuali, sendok, tungku, api, rantang, bungkusDaun, kendi, meja, tikar, lampu, kalender, batu, palu, paku.
  - Set baru dibuat sekali dengan `build('nama', () => grp(...))`. Properti baru ditulis di file episode memakai primitif yang sama: `box/rbox/sph/cyl/capsule/cone/torus`, warna dari palet, dan `{ol}` untuk garis tepi benda penting.
- **Suasana:** `sky(...)` dan `mood('siang'|'sore'|'malam'|'dalam')`. Kilas balik memakai `SEPIA = 0.85`.
- **Kamera:** `shot(t,t0,t1,eye,target,{push,drift,shake,eye2,target2})`. FOV 54° wajib. Default-nya maju perlahan 12% sambil sedikit bergeser. Guncangan untuk gempa memakai `shake`.
- **Potongan langsung** tanpa transisi, sekitar setiap 3 detik (sekitar 30 adegan per video). Setiap potongan otomatis mendapat whoosh.

## 4. Teks di layar (lapisan 2D di atas 3D)
- **Caption** otomatis:
  - Kata per kata, kadang 2 kata pendek. Montserrat 900, maksimal 92 px, lebar maksimal 950, di tengah y=1320.
  - Putih dengan garis hitam 20 px. Kata kunci berwarna `#FFDD33`, diatur lewat `KEYWORDS = new Set([...])`.
  - Muncul dengan pop 72%→100%.
- **`chip(txt,x,y,t0,{size,bg,stamp})`:** label kapital berbingkai hitam, 40–104 px, di area **y 170–440**.
- **`card(lines,x,y,t0)`:** kartu krem dengan judul merah. **`arrow`:** penunjuk.
- **`bigWord('SMONG!',t0,t1)`:** 190 px dengan garis 30 px. Caption mati otomatis selama kata besar tampil.
- **Wajib:** elemen layar tidak boleh menabrak area caption (y sekitar 1230–1410). Wajah tokoh tidak boleh tertutup caption atau kartu.

## 5. Audio
- **VO:** ElevenLabs **"DK - Documentary"** (`W8aRyPTvOnlcvcu0uYX3`), Eleven v4, Stabilitas 0.5, Kesamaan 0.75, Kekuatan klon 0, Bahasa Auto, MP3 44.1 kHz.
  - Setelan diambil otomatis dari `config.channels.ternyata-leluhur.elevenlabs`, karena prefix `tl` membuat skrip memilih suara ini.
  - Gaya: bertutur santai, tanpa sapaan ke penonton. Mulai Beat 4 pelan dan serius bila ceritanya tragis.
- **Musik dan SFX** dibuat oleh `video/src/leluhur_mix.py`:
  - Musik: petikan pentatonik pelan di bawah VO.
  - Efek otomatis: whoosh di setiap potongan, pop saat label muncul, hentakan saat stempel atau kata besar.
  - Efek adegan diatur di `window.EXTRA_SFX = [{t, type, d, gain}]`. Pilihan `type`: `ombak, gempa, api, langkah, ramai, angin, palu, kayu`.
  - Mix akhir: loudnorm I=-15, TP=-1.5, LRA=11, limiter 0.95, AAC 192k.
- **Cek audio:** sebelum publikasi, dengarkan hasil `tlNN-mix.m4a`. Dalam sesi otomatis, periksa level dengan `ffmpeg -af volumedetect` (max_volume < -1 dB) dan pastikan VO terdengar di atas musik.

## 6. Struktur naskah (7 beat, wajib) — versi high CTA (sejak TL01 v2)
Alasan: di Shorts, penonton memutuskan menggeser lewat dalam 1–3 detik. Fakta paling mengejutkan **wajib di detik 0**, bukan di tengah.
| Beat | Fungsi | Durasi |
|---|---|---|
| 1 | **HOOK fakta:** klaim paling mengejutkan + bukti singkat, langsung di kalimat pertama ("Candi ini tak memakai semen sebutir pun. Tapi waktu gempa…, tetap berdiri.") | 7–9 dtk |
| 2 | **Konflik:** si peragu/pengejek, satu kalimat lucu yang mudah diingat | 8–10 dtk |
| 3 | **Rahasia leluhur:** pesan guru/keluarga, aturan tradisinya | 10–12 dtk |
| 4 | **Penjelasan sains** dengan bahasa sehari-hari ("Rahasianya…", "Soalnya…") | 9–11 dtk |
| 5 | **Lapisan kedua:** fakta tambahan/penelitian yang membuat "wow" kedua | 12–14 dtk |
| 6 | **Perubahan:** si pengejek berubah (adegan singkat, tanpa menggurui) | 8–10 dtk |
| 7 | **CTA tanya daerah:** pertanyaan tentang daerah/keluarga penonton + "tulis di komentar" (memancing komentar dan memberi ide episode) | 7–9 dtk |

- **Durasi 65–80 detik** (sekitar 140–165 kata). Di atas 80 detik, pangkas.
- Kalimat pendek dan mengalir. **Angka ditulis dengan huruf** supaya enak dibacakan.
- Kalimat khas: "Jadi begini..." dan "Soalnya...".
- **Penutup:** tidak menggurui. Beat 6 menunjukkan perubahan, Beat 7 bertanya ke penonton (daerahnya, neneknya, tradisinya). Pertanyaan tiap episode harus unik; baca penutup semua `naskah/tl*.md` lebih dulu.
- Komentar yang disematkan mengulang pertanyaan Beat 7.
- **File naskah** `naskah/tlNN-slug.md` berisi:
  - Baris paling atas: `> Voice Over: DK - Film Dokumenter (ElevenLabs "DK - Documentary")`.
  - Judul dan hook.
  - Bagian **Beat 1–7** (teks VO).
  - **Dasar fakta** (sumber nyata dan tautan).
  - **Paket posting:** judul, deskripsi yang menyebut bahwa tokoh fiksi, 5–8 hashtag, CTA pertanyaan, sumber.
- `video/vo/tlNN.txt` berisi 7 paragraf (satu per beat) yang dipisah baris kosong.

Contoh patokan alur v2: `naskah/tl01-candi-tanpa-semen.md` + `video/src/tl01.js`. Contoh lama (Smong, perlu dibalik agar hook fakta di depan): "Laut tiba-tiba surut... Kakek Rusli malah menggendong cucunya, lari ke bukit. / Jadi begini, dari kecil Kakek Rusli hafal satu nyanyian dari neneknya... / 'Kek, mau selamat kok modal lagu nina bobo?' / Lalu Minggu pagi, dua puluh enam Desember dua ribu empat... Smong! Smong! / Soalnya laut surut itu bukan rezeki... / Dan nyanyian itu bukan dongeng. Tahun seribu sembilan ratus tujuh... / ...korban jiwanya tujuh orang. Si pedagang selamat juga... Sejak hari itu, dialah yang paling hafal lagunya."

## 7. Pipeline produksi
1. Naskah ditulis dulu, lalu VO: `python3 video/src/tts_elevenlabs.py tlNN` (suara DK dipilih otomatis).
2. Video **mengikuti durasi VO**. Semua waktu memakai `at('kata', n)`, `atEnd`, `CUT[k]`, dan `beatOf(t)`. `at()` menghitung kemunculan kata dari awal VO, jadi periksa indeks `n`-nya.
3. Buat `video/src/tlNN.html` (salin `tl00.html`, ganti nama file words/js) dan `tlNN.js` (pola `tl00.js`).
4. Render stills di 10–12 titik (`EP=tlNN node render.js stills ../out/tlNNs t...`), gabungkan dengan hstack, lalu periksa sendiri. Perbaiki lalu ulangi.
5. Audio: `python3 video/src/leluhur_mix.py tlNN` menghasilkan `video/vo/tlNN-mix.m4a`.
6. Render: `cd video/src && EP=tlNN node render.js video ../out/ternyata-leluhur-tlNN.mp4 30 ../vo/tlNN-mix.m4a`. Kecepatannya sekitar 0,2–0,4 detik per frame, jadi jalankan di background.

## 8. Ide judul
- **Kriteria:**
  - Diawali "Kenapa..." dan menyebut tindakan yang tampak aneh.
  - Jawabannya disimpan sampai akhir.
  - Bisa divisualkan dengan jelas.
  - Ada pihak yang meremehkan dan ada jawaban ilmiahnya.
  - Berdasarkan praktik atau peristiwa nyata yang punya sumber.
- **Judul yang sudah dipakai atau diusulkan** (jangan diulang):
  - Kenapa Kakek Ini Lari ke Bukit Saat Laut Surut? (jadi)
  - Kenapa Rendang Dimasak Berjam-jam Sampai Gelap? (jadi)
  - Kenapa Singkong Ini Direndam Berhari-hari? (naskah ada)
  - Kenapa Rumah Ini Tidak Ditanam ke Tanah?
  - Kenapa Kapal Sebesar Ini Tidak Dipaku?
  - Kenapa Candi Sebesar Ini Tidak Pakai Semen?
  - Kenapa Kedelai Ini Sengaja Dibiarkan Berjamur?
  - Kenapa Nelayan Ini Melarang Orang Melaut?
  - Kenapa Petani Ini Melepas Bebek ke Sawahnya?
  - Kenapa Tiang Rumah Ini Dibuat Miring?
  - Judul nomor 4–10 masih boleh diusulkan ke Kantor Konten **sekali**, sebagai ide awal seri.
- **Topik yang dihindari:**
  - Jamu, pengobatan tradisional, dan klaim kesehatan.
  - Tutorial mengolah singkong atau fermentasi.
  - Pamali yang diklaim "terbukti ilmiah" tanpa dasar.

## 9. Aturan wajib dan pelajaran
- Tokoh boleh fiksi, tetapi **fakta harus nyata dan bersumber**. Deskripsi harus menyebut tokohnya fiksi. Jangan melebihkan klaim; pakai "peneliti menduga" bila bukti belum pasti.
- Ceritanya berbentuk cerita, bukan tutorial. Pengejek tidak boleh mengubah fakta sejarah. Contoh: warga Simeulue memercayai smong, jadi pengejeknya harus pendatang.
- Jangan menyebut lama simpan, angka, atau tanggal tanpa bukti kuat. Arah peta dan posisi geografis harus dicek.
- **Kamera:**
  - Jangan masuk ke dalam bangunan, karena akan muncul bidang besar sewarna. Jaga jarak dari dinding.
  - FOV 54°. Cek batas 9:16 supaya papan dan dua tokoh tidak terpotong.
- Kartu, angka, dan tanggal harus berada **di atas** area caption. Teks tidak boleh keluar dari kartu, dan label tidak boleh menabrak papan nama.
- **Properti dan efek:**
  - Uap dibuat kecil dan transparan. Properti di tangan tidak boleh menutupi wajah.
  - Periksa orientasi objek, misalnya gelombang tidak boleh tampil sebagai tiang tegak.
  - Animasi engsel, misalnya daun membuka, dicek lewat frame sampel.
- **Teknis three.js:**
  - `at3()` mengatur ulang rotasi. Bidang datar dibuat dengan `flat()` (atau `ground/path/tikar`) supaya tidak berdiri tegak.
