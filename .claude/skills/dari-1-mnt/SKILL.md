---
name: dari-1-mnt
description: Gaya terkunci channel "Dari 1 mnt": YouTube Shorts motion graphic 2D "Hybrid Kinetic Pop" (kinetic text Lilita One, stiker emoji Noto, bendera, infografis, latar ganti tiap potongan, maskot foto chibi biru yang jarang muncul), VO "Finn - Expressive & Ads Indonesian", durasi 60–90 detik. Pakai skill ini setiap kali membuat ide judul, naskah, VO, atau video MP4 untuk Dari 1 mnt, termasuk saat dijalankan jadwal otomatis Kantor Konten.
---

# Dari 1 mnt: gaya terkunci

Gaya ini **terkunci**. Jangan mencampurnya dengan stikmen Mas Kharis atau diorama 3D Ternyata Leluhur.
Gaya lama channel ini juga tidak dipakai lagi: Electric Blue 3D Chibi, peta isometrik neon, kertas koran, maskot bertopi beanie, dan teks Poppins.
Patokan: `video/src/kinetic.js` (mesin) dan **`video/src/dm01.js` (contoh episode standar Pop v2)**. `dm00.js` hanya contoh lama yang dipersingkat.

## 1. Identitas
- **Channel:** Dari 1 mnt. Platform YouTube Shorts, 9:16, 1080×1920, MP4 H.264, 30 fps.
- **Penonton:** Indonesia, bahasa Indonesia.
- **Tujuan:** memancing komentar dan menahan penonton sampai akhir.
- **Seri aktif:** **Paradoks & Dilema** ("Bagaimana jika...?"), **Fakta vs Mitos**, **Indonesia vs Dunia**. Rotasikan seri tiap hari.
- **Prefix:** episode `dm01`, `dm02`, dan seterusnya; id ide `dm-YYYYMMDD-n`.

## 2. DURASI (terkunci)
- **Wajib 60–90 detik.** Sekitar 1 menit, boleh lebih, tetapi tambahannya maksimal 30 detik.
- **Dilarang di bawah 60 detik**, dan dilarang lebih dari 90 detik.
- Finn bertutur sekitar 138 kata per menit, jadi naskah **150–195 kata**.
- Setelah VO dibuat, cek durasi `video/vo/dmNN.json`:
  - Di bawah 60 detik: tambah kalimat isi, misalnya contoh atau data pembanding. Jangan memperlambat suara.
  - Di atas 90 detik: pangkas kalimat.
  - Ulangi sampai masuk rentang.
- `DURATION` video sama dengan VO ditambah 0,9 detik.

## 3. Maskot (`assets/maskot-dari1mnt.png`, dari foto owner)
- **Wujud:** wajah karikatur foto dengan rambut hitam keriting tebal, badan chibi biru, perut biru muda, antena berbola kuning, pipi blush pink, garis tepi hitam.
- **Jarang muncul:** **3–4 kali per video** (pembuka, twist, penutup), masing-masing **2–4 detik**, di bawah layar kiri atau kanan: `mascot(t0, t1, expr, {side})`.
- **Ekspresi sesuai suasana:**
  - `serius`: foto asli.
  - `kaget`: mata lebar dan mulut "O", plus tanda seru.
  - `mikir`: alis naik, plus tanda tanya.
  - `senang`: mata ^^ dan senyum lebar.
- Jangan memakai ekspresi yang sama terus.

## 4. Visual: Hybrid Kinetic Pop (2D buatan kode, bukan 3D)
- **Ganti visual sekitar setiap 2–3 detik.** Setiap potongan (`shotAt`) punya **latar berbeda**; jangan pakai satu latar.
- **Latar** `bg`:
  - `radial`, `sunburst` (berputar), `stripes` (diagonal bergerak), `halftone`, `confetti`.
  - `split` (siang|malam), `city` (kota malam), `chat` (wallpaper chat), `warning` (strip peringatan), `sunset`, `solid`.
- **Transisi otomatis** tiap potongan, 0,22 detik, bergantian: iris, geser, wipe diagonal, flash putih. Taruh potongan **di jeda napas**: `shotAt(pauseBefore('kata'), ...)`.
- **Palet:** navy `#0C1646` (outline/teks gelap), kuning `#FFD60A`, pink `#FF3D71`, merah `#EF4444`, biru `#1E6EFF`/`#1455E1`, cyan `#00F5D4`, mint `#00E5A0`, hijau `#34D399`, ungu `#7C3AED`, oranye `#FF8C1E`, putih, panel `#111827`, krem stempel `#FFF4E6` (`C.*`).
- **Teks:** Lilita One, putih/kuning/pink dengan outline navy sekitar 11% dan bayangan.
  - Baris pembuka 100–150 px, mulai sekitar y 400–440, baris berikutnya turun 170–200.
  - Kata penekanan 150–220 px memakai `impact` (dengan zoom-punch).
  - Baris sekunder 80–112 px, pill/label 46–60 px, angka counter 150–300 px.
- **Elemen:**
  - `txt` (opsi `hi:[kata]` untuk kata kuning), `impact`, `pill`, `stamp` (vonis MITOS/FAKTA/SEBAGIAN), `sticker(nama|kode, ...)` dari emoji Noto dengan bingkai putih, `flag('ID')`.
  - Infografis: `counter`, `bars`, `ranking`, `meter`, `timbangan`, `iconGrid`, `chat`.
  - `ilustrasi(t0)` **wajib** untuk visual yang bukan data.
  - Nama emoji ada di `EMO`. Kode lain: nama file di `vendor/noto/`.
- **Badge kategori** `BADGE = 'FAKTA vs MITOS'`: pill kuning di atas tengah (y 190), **tanpa nomor "#01"**.
- **Area konten:** y 250–1650. Bawah layar dikosongkan untuk antarmuka Shorts, kecuali maskot.
- Tidak ada subtitle dinamis. Hanya kata kunci per frasa, sinkron per frasa.
- Layar memudar ke hitam di akhir (otomatis). Efek punch dan goyang dipakai di momen penekanan.

## 4b. Standar editing "Pop v2" (WOW, wajib sejak dm01)
Owner menilai versi lama "kurang wow". Penyebabnya: layar kosong, elemen diam, angka hanya counter. Setiap episode wajib:
- **Hook detik 0 penuh:** frame pertama sudah ramai (stiker besar + `burst` + `speed` + `punch`) dan pertanyaan muncul kata per kata (`kata`). Jangan ada frame kosong di detik 0–1.
- **Layar terisi:** setiap potongan minimal 3 lapis: latar + visual utama besar (stiker 250–400 px, grafik, VS) + teks. Area konten y 300–1500 terisi sekitar 70%; jangan hanya satu baris teks.
- **Selalu bergerak:** kamera otomatis mendorong pelan dan miring di setiap potongan, dan latar diberi partikel (bawaan mesin). Tambahkan `fokus(t, x, y, zoom, d)` saat VO menyebut bagian tertentu. Stiker masuk dengan `from:'left'|'right'|'top'|'bottom'`.
- **Teks kata per kata:** pakai `kata(teks, y, t0, {hi, mark})`. Setiap kata muncul tepat saat diucapkan; kata kunci diberi stabilo (`mark`) atau kuning (`hi`). `txt`/`impact` untuk satu kata hentakan.
- **Data = perbandingan visual, bukan hanya angka:**
  - `vs(L, R, t0, {win, tw})`: layar terbelah dua negara/pilihan, dengan nilai muncul saat diucapkan (`tv`) dan mahkota untuk pemenang.
  - `race(items, 0, {crown})`: batang berpacu untuk 3–5 item.
  - `counter`, `timbangan`, `iconGrid`, dan `chat` (tebakan netizen) untuk variasi.
- **Momen WOW sekitar setiap 10–15 detik:**
  - `glitchAt` + `impact` + `shake` di twist ("Tapi tunggu").
  - `burst` saat angka/mahkota muncul.
  - `speed` saat hentakan.
  - `hujan(emoji)` di penutup/dilema.
  - `panah` untuk menunjuk.
- **SFX tambahan:** `boom` di detik 0 dan twist, `riser` sebelum twist dan sebelum vonis.
- **Cek stills:** tidak ada potongan yang lebih dari setengah layarnya kosong. Kalau ada, tambah visual, jangan memperbesar teks saja.

## 5. Audio
- **VO:** ElevenLabs **Finn - Expressive & Ads Indonesian** (`zmTMXWr9TzPTCLvo0Uqr`), Eleven v4, Stabilitas 0.5, Kesamaan 0.75, Kekuatan klon 0, Bahasa Auto, MP3 44.1 kHz.
  - Setelan dipilih otomatis lewat prefix `dm` dari `config.channels.dari-1-mnt.elevenlabs`.
- **Tanpa musik latar.** Efek suara sintetis pelan di bawah suara (`leluhur_mix.py dmNN`, karena `music:false` di config):
  - whoosh tiap potongan, pop tiap teks atau stiker, tick saat angka naik, hit saat stempel atau impact.
  - Tambahan lewat `window.EXTRA_SFX`: `riser` sebelum twist, `boom`, `drone`, `retak`.

## 6. Struktur naskah (diskalakan ke 60–90 detik)
- **A. Paradoks & Dilema:**
  - Hook: wajib "Bagaimana jika..." dengan dua hal yang saling meniadakan.
  - Eskalasi: dua sisi bentrok, dengan analogi keseharian Indonesia.
  - Paradox Crash & Reality Twist.
  - Retention Trap: tanpa jawaban tuntas dan tanpa menggurui, akhiri dengan satu pertanyaan dilema.
  - Nada tenang dan berwibawa. Kosakata sinematik hanya untuk seri ini: mutlak, ilusi, hukum alam, titik kehancuran, kontradiksi, tak terelakkan.
- **B. Fakta vs Mitos (6 beat):**
  1. Hook mitos.
  2. Asal pesan turun-temurun ("Katanya, ...").
  3. Fakta.
  4. "Tapi tunggu" untuk nuansa.
  5. Bukti dan batasnya.
  6. Vonis (stempel) ditambah pertanyaan.
- **C. Indonesia vs Dunia (6 beat):**
  1. Hook angka.
  2. Sumber dan peringkat teratas.
  3. Posisi Indonesia dan perbandingannya.
  4. Twist ("Tapi tunggu").
  5. Perbandingan lanjutan.
  6. Penutup ditambah pertanyaan.
- **Gaya bahasa:**
  - Bertutur, mengalir, kalimat pendek ritmis, bahasa sederhana.
  - Pakai "kamu"/"-mu".
  - **Tanpa sapaan pembuka**: "Halo guys" dan "Balik lagi sama mimin" dilarang.
- **Penutup:**
  - Pertanyaan natural.
  - **Bukan perintah dan bukan label "Kubu A/B".**
  - Ajakan komentar ditaruh di komentar yang disematkan, bukan di narasi.
  - Penutup tiap episode harus unik.
- **Angka:**
  - Setiap angka wajib bersumber dan sumbernya ditulis di deskripsi.
  - Data urunan pengguna (mis. Numbeo) ditulis "menurut data", jangan dinyatakan pasti.
  - Angka gaji tanpa data resmi tidak ditampilkan.
  - Naskah kesehatan tidak menyebut angka kalori atau jam makan "ideal".
  - Topik budaya dan sosial ditulis hati-hati.
- **File:**
  - `naskah/dmNN-slug.md` berisi: baris atas `> Voice Over: Finn - Expressive & Ads Indonesian`, seri/badge, judul, beat berlabel, dasar fakta + sumber, paket posting (judul, deskripsi + sumber, 5–8 hashtag, komentar disematkan).
  - `video/vo/dmNN.txt`: satu paragraf per beat.

## 7. Pipeline
1. Jalankan `python3 video/src/tts_elevenlabs.py dmNN`, lalu **cek durasi 60–90 detik** (bagian 2).
2. Buat `video/src/dmNN.html` (salin `dm00.html`, ganti nama file) dan `dmNN.js` (pola `dm00.js`).
   - Sekitar 18–30 potongan; setiap potongan dengan `bg` berbeda dari potongan sebelumnya, dan mengikuti standar Pop v2 (bagian 4b).
   - Waktu dari `at('kata', n)` dan `pauseBefore`. `at()` menghitung kemunculan kata dari awal VO, jadi periksa indeks `n`-nya.
3. Render stills di 10–12 titik (`EP=dmNN node render.js stills ../out/dmNNs t...`), gabungkan dengan hstack, lalu cek sendiri:
   - Teks tidak keluar layar dan tidak bertumpuk.
   - Maskot hanya 3–4 kali.
   - Latar berganti.
   - Angka cocok dengan naskah.
4. Jalankan `python3 video/src/leluhur_mix.py dmNN`, lalu render: `cd video/src && EP=dmNN node render.js video ../out/dari-1-mnt-dmNN.mp4 30 ../vo/dmNN-mix.m4a`.

## 8. Ide & judul
- **Kriteria:** memancing komentar dan perdebatan, relevan dengan keseharian Indonesia, dan berbasis data yang bisa dicek.
  - Bentuk: pertanyaan atau dilema ("Benarkah...?", "Pilih A atau B?") atau perbandingan ("X vs Y").
- **Sudah dibuat jadi video (jangan diulang):**
  - Anak Pertama: Pilih Orang Tua atau Diri Sendiri?
  - Benarkah Makan Malam Bikin Gemuk? Ini Faktanya
  - Seporsi Makan di Swiss = 18 Porsi di Indonesia?
- **Pernah diajukan, boleh diusulkan sekali lagi:**
  - Top 3 Kapal Perang Kuno
  - Paradoks Paylater
  - Gaji Jakarta vs Kampung
  - Paradoks Ojol
  - Rp1 Miliar vs Waktu Bebas
  - Paradoks Kereta (Trolley Problem)
  - Jam Kerja Indonesia vs Jepang dan Korea

## 9. Kesalahan yang tidak boleh terulang
- Satu latar untuk seluruh video.
- Visual kurang meriah / "kurang wow": layar kosong, elemen diam, angka hanya counter (lihat 4b).
- Penutup bergaya perintah atau memakai label Kubu A/B.
- Nomor "#01" di badge.
- Maskot terlalu sering, atau ekspresinya sama terus.
- Istilah data ditulis tidak tepat (mis. "restoran murah" ditulis "makan siang").
- Data urunan dinyatakan pasti.
- Durasi di bawah 60 detik.
- Teknis: canvas memuat gambar lokal, jadi `render.js` sudah memakai `--allow-file-access-from-files`. Jangan dihapus.
