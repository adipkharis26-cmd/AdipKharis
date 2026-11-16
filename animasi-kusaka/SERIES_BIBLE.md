# KUSAKA: Series Bible & Strategi YouTube

> Dokumen sutradara. Berisi apa yang **tidak boleh berubah** (konsistensi), cara cerita **mengalir**
> dari episode ke episode, dan cara membuat konten yang **disukai algoritma YouTube** untuk penonton
> SMP, SMA, sampai mahasiswa.

---

## 1. Identitas seri

| | |
|---|---|
| **Judul seri** | KUSAKA |
| **Logline** | Kusaka, siswa SMA yang terlalu percaya diri dan selalu bokek, berusaha terlihat keren (terutama di depan Nadia), tapi rencananya selalu gagal dengan cara yang paling memalukan. |
| **Genre** | Komedi situasi sekolah (school sitcom), slice of life |
| **Target** | Utama 13–22 tahun (SMP, SMA, mahasiswa). Penonton dewasa ikut tertawa karena nostalgia. |
| **Nada** | Ringan, relate, receh tapi cerdas. Tidak ada kekerasan realistis, tidak ada konten dewasa. |
| **Format** | Shorts 30–50 detik (mesin penemuan) + episode panjang 4–8 menit (watch time & monetisasi) |
| **Bahasa** | Bahasa Indonesia gaul ringan (gue/lu untuk siswa SMA, aku/kamu untuk Dinda, baku untuk Pak Darto) |

### Pemeran terkunci (lihat `model-sheets/`)
| Karakter | Fungsi cerita | Running gag |
|---|---|---|
| **Kusaka** | Protagonis, sumber masalah | Dompet selalu ketinggalan · "Tenang aja, gue yang traktir!" |
| **Ujang** | Sahabat, suara logika, sarkas | "Udah gue duga." · selalu akhirnya yang bayar |
| **Nadia** | Ketua kelas, gebetan Kusaka | "Kusaka, tugasnya MANA?" · tidak pernah sadar ditaksir |
| **Dinda** | Adik Kusaka (SMP), pengacau | Selalu merekam pakai HP · "Aku aduin Ibu, ya!" |
| **Pak Darto** | Wali kelas & guru BK, "bos terakhir" | Muncul tiba-tiba di saat terburuk · "KUSAKA! Ke ruangan Bapak!" |
| Bu Ijah | Pemilik warung | Buku utang Kusaka makin tebal |

### Lokasi terkunci (lihat `model-sheets/LocationSheet.png`)
Warung Bu Ijah · Gerbang SMA Nusantara · Ruang Kelas XI IPS 2 · Koridor & Lapangan · Kamar Kusaka

---

## 2. Aturan konsistensi (WAJIB)

1. **Desain dikunci kode.** Warna, proporsi, ciri khas, dan suara diambil dari `canon.json` dan
   `locations.json`. Render ditolak kalau ada perubahan yang tidak disengaja (`npm run check:characters`).
2. **Suara tidak boleh berganti.** Voice ID ElevenLabs per karakter dikunci di kanon.
3. **Sifat tidak boleh dilanggar.** Ujang tidak pernah panik duluan. Nadia tidak pernah bodoh. Pak Darto
   tidak pernah jahat sungguhan. Kusaka tidak pernah benar-benar menang (minimal sampai finale musim).
4. **Kontinuitas benda.** Plester Kusaka selalu ada. Dompet Kusaka tergeletak di meja kamarnya (easter egg
   yang konsisten). Buku utang di Warung Bu Ijah bertambah tebal tiap musim.
5. **Blocking tetap.** Karakter berdiri di titik A/B/C/D tiap lokasi. Penonton mengenali tempat dalam 1 detik.
6. **Kamera bahasa yang sama.** Two-shot untuk pembukaan → single shot saat dialog → push-in sebelum punchline →
   crash zoom + speed lines hanya untuk momen kaget terbesar (maksimal 1x per Shorts).

---

## 3. Cerita yang mengalir: struktur

### Struktur Shorts (30–50 detik)
| Waktu | Beat | Catatan |
|---|---|---|
| 0–2 dtk | **HOOK**: masuk langsung di tengah konflik | Tanpa intro/judul panjang. Kalimat pertama = masalah. |
| 2–10 dtk | Setup: siapa mau apa | Kusaka sok yakin / punya rencana |
| 10–25 dtk | Eskalasi | Rencana makin besar, penonton bisa menebak bakal gagal |
| 25–35 dtk | **Twist / punchline** | Crash zoom, kaget, efek suara |
| 35–45 dtk | Reaksi + tag line | Ujang/Dinda/Pak Darto menutup dengan sindiran |
| akhir | **Loop / cliffhanger** | Frame terakhir menyambung ke frame pertama, atau "BERSAMBUNG..." |

### Struktur episode panjang (4–8 menit)
Rangkai 3–5 Shorts satu arc + **adegan penghubung baru** (eksklusif, belum ada di Shorts) + ending yang
membuka episode berikutnya. Penonton Shorts mendapat alasan menonton versi panjang.

### Prinsip "mengalir"
- **Setiap episode lucu berdiri sendiri, tapi menggerakkan arc musim satu langkah.**
- **Callback**: punchline episode lama muncul lagi (misalnya "cicilan" di Ep 1 → buku utang di Ep 7).
- **Akibat menumpuk**: kegagalan Kusaka di satu episode menjadi masalah di episode berikutnya.
- **Penonton memilih**: polling di Community Post ("Kusaka harus minta maaf ke siapa dulu?").

---

## 4. Musim 1 — "Operasi Traktir Nadia"

**Arc musim:** Kusaka ingin mentraktir Nadia sebelum Pentas Seni akhir semester, tapi tiap usaha
mengumpulkan uang (dan keberanian) gagal total.

| Ep | Judul | Lokasi | Hook 2 detik pertama | Langkah arc |
|---|---|---|---|---|
| 1 | Traktiran Gagal ✅ | Warung | "Kus, buruan pesen! Bel tinggal 10 menit!" | Pola: dompet ketinggalan |
| 2 | Dompet Sandera | Kamar | Dinda mengacungkan dompet: "Cari ini?" | Dinda tahu Kusaka naksir seseorang |
| 3 | Telat Upacara | Gerbang | Gerbang menutup tepat di depan hidung Kusaka | Pak Darto mengincar Kusaka |
| 4 | PR Halaman 45 | Kelas | Nadia: "Kusaka, tugasnya MANA?" | Kusaka menyontek Ujang, nama Ujang ikut tersalin |
| 5 | Satu Kelompok | Kelas | Undian kelompok: Kusaka + Nadia | Momen dekat pertama dengan Nadia |
| 6 | Razia HP | Koridor | "Semua HP, kumpulkan di meja Bapak!" | HP Kusaka berisi foto Nadia (salah paham) |
| 7 | Buku Utang | Warung | Bu Ijah membuka buku utang setebal kamus | Utang Kusaka lunas oleh Ujang, Ujang menagih |
| 8 | Konten Dinda | Kamar | "Halo guys, ini kakakku lagi latihan nembak" | Video Dinda viral di sekolah |
| 9 | Viral | Koridor | Semua siswa menoleh ke Kusaka bersamaan | Nadia melihat videonya (cliffhanger) |
| 10 | Ruangan BK | Kelas (BK) | "KUSAKA! Ke ruangan Bapak!" | Pak Darto ternyata memberi nasihat bijak |
| 11 | Latihan Pensi | Koridor | Kusaka membawa gitar dengan 3 senar | Keberanian dibangun |
| 12 | Pentas Seni (finale) | Gerbang/Lapangan | Panggung, lampu, Nadia di depan | Payoff: Kusaka akhirnya bisa traktir… pakai dompet Ujang |

**Musim berikutnya (agar penonton ikut "tumbuh"):** S2 kelas XII & ujian, S3 Kusaka dan Ujang jadi
mahasiswa baru (ospek, kos-kosan), sementara Dinda naik SMA. Penonton SMP hari ini tetap relate saat kuliah.

**Bank ide relate** (untuk Shorts selingan): MPLS/MOS, piket kelas, kerja kelompok cuma satu yang kerja,
ulangan mendadak, bel istirahat vs guru belum selesai, nitip absen, grup WA kelas, kehabisan kuota,
nunggu jemputan, foto buku tahunan, ospek, titip makan di kos.

---

## 5. Strategi algoritma YouTube

YouTube merekomendasikan video yang **diklik**, **ditonton lama**, dan **membuat penonton puas**
(like, share, komentar, tidak menekan "jangan rekomendasikan"). Di Shorts, sinyal terpentingnya adalah
**berapa banyak orang yang tidak menggeser (swipe) video** dan **berapa yang menonton ulang**.

### Shorts
- **Detik pertama = segalanya.** Mulai dari konflik, ekspresi wajah besar, teks subtitle langsung muncul.
  Versi Shorts episode ini sengaja **membuang kartu judul** dan langsung masuk ke dialog.
- **Durasi 30–50 detik.** Punchline sebelum detik ke-40. Jangan ada jeda mati lebih dari 0,5 detik.
- **Loop.** Akhir menyambung ke awal sehingga penonton menonton ulang tanpa sadar (menaikkan retensi).
- **Subtitle karaoke selalu ada.** Banyak yang menonton tanpa suara di sekolah atau kendaraan umum.
- **Hubungkan Shorts ke video panjang** memakai fitur "Related video" di setiap Shorts.
- **Frekuensi:** 3–5 Shorts per minggu, jam tayang konsisten (contoh: 16.00–19.00 WIB, setelah jam sekolah).

### Video panjang
- **Thumbnail:** wajah Kusaka besar dengan ekspresi ekstrem (kaget/malu), maksimal 3 kata, warna kontras
  (kuning #ffd23f + merah #e63946 + outline hitam). Template sama tiap episode agar dikenali.
- **Judul:** `[situasi relate] + [konflik]` lalu `| Kusaka Eps. N`.
  Contoh: *"Mau Traktir Gebetan, Dompet Malah Ketinggalan 😭 | Kusaka Eps. 1"*.
- **Bab (chapters)** di deskripsi agar penonton lompat ke bagian lucu, bukan keluar.
- **End screen** 10–20 detik terakhir → episode berikutnya + playlist musim.
- **Playlist per musim**, diurutkan, agar autoplay menjaga penonton di channel (session time).

### Komunitas & engagement
- Tutup tiap video dengan **pertanyaan yang mudah dijawab**: *"Kalian tim Kusaka atau tim Ujang?"*
- Pin komentar lucu dari penonton, balas komentar di jam pertama.
- Community Post: polling lanjutan cerita, behind-the-scenes model sheet.
- Hashtag inti (3–5): `#animasiindonesia #kusaka #anaksekolah #komedi #shorts`.

### Aman & monetizable
- Target penonton 13+. Saat upload, jawab pertanyaan "Made for Kids" dengan jujur sesuai target dan isi
  setiap video. Video yang ditandai Made for Kids kehilangan komentar dan beberapa fitur.
- Hindari adegan kekerasan realistis (tawuran ditampilkan sebagai kejar-kejaran komedi, tanpa senjata/luka),
  rokok, bullying yang dirayakan, dan kata kasar. Ini menjaga iklan tetap tampil penuh.
- Semua musik dan efek suara harus berlisensi atau buatan sendiri (efek seri ini dibuat dengan ElevenLabs).

### Angka yang dipantau (YouTube Studio)
| Metrik | Arah | Tindakan kalau jelek |
|---|---|---|
| Shorts: *Viewed vs swiped away* | Naik | Perkuat 2 detik pertama, potong intro |
| Shorts: *Average % viewed* (>100% berarti ditonton ulang) | Naik | Perpendek, buat ending loop |
| Long: *Impressions CTR* | Naik | Uji ulang thumbnail/judul (fitur A/B test) |
| Long: *Audience retention* di 30 detik pertama | Naik | Cold open lebih cepat |
| *Returning viewers* & subscriber dari video | Naik | Perkuat arc dan cliffhanger |

---

## 6. Pipeline produksi per episode

1. Tulis `src/data/script.json` (episode baru): hook di baris pertama, emosi, shot, aksi, lokasi.
2. `npm run voice`: suara ElevenLabs v4 (voice terkunci) + timestamp lip-sync.
3. `npm run studio`: cek timing, kamera, ekspresi.
4. `npm run render` (16:9) dan `npm run render:shorts` (9:16, tanpa intro).
5. Checklist sebelum upload:
   - [ ] Hook ≤ 2 detik
   - [ ] Ciri khas semua karakter terlihat
   - [ ] Subtitle benar dan terbaca
   - [ ] Satu momen "crash zoom" saja
   - [ ] Ending loop atau cliffhanger
   - [ ] Judul + thumbnail sesuai template, related video terisi
