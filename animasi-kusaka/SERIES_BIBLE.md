# KUSAKA: Series Bible & Strategi YouTube (Kanon v2)

> Dokumen sutradara. Berisi apa yang **wajib konsisten** (karakter, suara, latar, editing, SFX), cara cerita
> **mengalir** dari episode ke episode, dan cara membuat konten yang **disukai algoritma YouTube** untuk penonton
> SMP, SMA, sampai mahasiswa.
>
> Semua kanon dikunci oleh kode. `npm run voice` / `render` **menolak jalan** kalau kanon berubah tanpa disengaja.
> Versi saat ini: karakter **2.0.0**, lokasi **2.0.0**, editing **1.0.0**, SFX **1.0.0**.

---

## 1. Identitas seri

| | |
|---|---|
| **Judul seri** | KUSAKA |
| **Logline** | Kusaka, siswa SMA yang terlalu percaya diri dan selalu bokek, berusaha terlihat keren (terutama di depan Nadia), tapi rencananya selalu gagal dengan cara yang paling memalukan. Di sekelilingnya ada sahabat, keluarga, guru, dan teman-teman yang membuat setiap hari jadi kacau. |
| **Genre** | Komedi situasi sekolah & keluarga (school/family sitcom), slice of life |
| **Target** | Utama 13–22 tahun (SMP, SMA, mahasiswa). Penonton dewasa ikut tertawa karena nostalgia dan karakter orang tua. |
| **Nada** | Ringan, relate, receh tapi cerdas. Tanpa kekerasan realistis, tanpa konten dewasa. |
| **Format** | Shorts 30–50 detik (mesin penemuan) + episode panjang 4–8 menit (watch time & monetisasi) |

---

## 2. Pemeran terkunci (16 karakter)

Model sheet tiap karakter ada di `model-sheets/ModelSheet-<id>.png`, perbandingan tinggi di `model-sheets/Lineup.png`,
dan sampel suara di `public/voices/<id>.mp3`.

### Dunia sekolah
| Karakter | Peran | Fungsi cerita | Kalimat khas |
|---|---|---|---|
| **Kusaka** | Tokoh utama, XI IPS 2 | Sumber masalah, selalu bokek, naksir Nadia | "Tenang aja, gue yang traktir!" |
| **Ujang** | Sahabat sebangku | Suara logika, sarkas, akhirnya selalu yang bayar | "Udah gue duga." |
| **Nadia** | Ketua kelas | Gebetan Kusaka, tegas, juara kelas | "Kusaka, tugasnya MANA?" |
| **Sasa** | Sahabat Nadia | Ratu gosip, penyebar berita, selalu live TikTok | "Eh, eh, kalian udah denger belum?!" |
| **Ucok** | Badut kelas (dari Medan) | Suara paling keras, penengah, nyanyi fals | "Macam mana pulak ini?!" |
| **Bimo** | Kakak kelas XII, kapten basket | Saingan cinta (tanpa sadar), populer tapi baik | "Santai, Bro. Semua bisa diatur." |
| **Pak Darto** | Wali kelas & guru BK | "Bos terakhir", muncul di saat terburuk | "KUSAKA! Ke ruangan Bapak!" |
| **Bu Wati** | Guru Matematika | Ulangan mendadak, killer, diam-diam fans drakor | "Kerjakan halaman 45 sampai 90. Sekarang." |
| **Pak Joko** | Guru Olahraga | Semua masalah selesai dengan push-up | "PRIIIT! Keliling lapangan sepuluh kali!" |
| **Mang Udin** | Satpam sekolah | Penjaga gerbang 06.45, bisa disogok gorengan | "Telat lagi, Jang? Push-up dua puluh!" |
| **Bu Ijah** | Pemilik warung | Buku utang Kusaka, tahu semua gosip | "Utangmu udah sepanjang jalan tol, Le." |

### Dunia rumah
| Karakter | Peran | Fungsi cerita | Kalimat khas |
|---|---|---|---|
| **Bu Ratna** | Ibu Kusaka & Dinda | Galak soal rumah, paling sayang anak, centong nasi | "KUSAKA! Kamar kayak kapal pecah!" |
| **Pak Hendra** | Ayah Kusaka & Dinda | Raja dad jokes, takut istri, diam-diam membela Kusaka | "Bapak dulu juga gitu, Nak." |
| **Dinda** | Adik Kusaka (SMP) | Pengacau, tukang ngadu, selalu merekam | "Aku aduin Ibu, ya!" |
| **Raka** | Teman SMP Dinda | Gamer, rival sekaligus partner jahil Dinda | "Bentar, satu match lagi!" |

### Dunia kampus
| Karakter | Peran | Fungsi cerita | Kalimat khas |
|---|---|---|---|
| **Kak Tara** | Sepupu Kusaka, mahasiswi | Jembatan ke cerita kuliah (anak kos, akhir bulan) | "Nikmatin masa SMA, Kus. Kuliah itu… beda." |

### Peta hubungan (sumber konflik cerita)
```
                 Pak Darto ── rekan ── Bu Wati ── rekan ── Pak Joko
                    │ musuh bebuyutan        │ murid kesayangan
 Bu Ijah ─utang─ KUSAKA ── naksir ──▶ NADIA ── sahabat ── Sasa
                    │  │  sahabat           │ rekan OSIS
                 Ujang  Ucok           Bimo (saingan sepihak Kusaka)
                    │
   Mang Udin ── langganan telat ── Kusaka ── sepupu ── Kak Tara
                    │
   Bu Ratna & Pak Hendra (orang tua) ── Dinda (adik) ── Raka (teman SMP)
```

### Aturan karakter (WAJIB)
1. **Desain dikunci kode** (`canon.json`): warna, proporsi, ciri khas, pakaian, aksesori. Tidak ada karakter
   yang tampil tanpa ciri khasnya.
2. **Sifat tidak boleh dilanggar.** Ujang tidak panik duluan. Nadia tidak pernah bodoh. Pak Darto tidak jahat
   sungguhan. Bu Ratna marah karena sayang. Kusaka tidak pernah benar-benar menang (sampai finale musim).
3. **Bahasa:** siswa SMA memakai gue/lu, Dinda dan Raka memakai aku/kamu, guru dan orang tua memakai bahasa baku
   ringan, Ucok berlogat Medan, Mang Udin berlogat Sunda, Bu Ijah berlogat Jawa ("Le").

---

## 3. Suara terkunci (ElevenLabs v4)

| Karakter | Voice (library ElevenLabs) | Seed |
|---|---|---|
| Kusaka | DK - Documentary | 1101 |
| Ujang | Ujang - Soft & Gentle Javanese | 1102 |
| Nadia | Siti - Clean, Chill, Expressive, Casual | 1103 |
| Dinda | Kak Ceria - Cute Kids Storyteller | 1104 |
| Pak Darto | Akbar - Legal authority | 1105 |
| Bu Ijah | Lala | 1106 |
| Bu Ratna | Serena - Heartfelt Indonesian | 1107 |
| Pak Hendra | Baron - Calm & Mature | 1108 |
| Bimo | Den - Expressive, Clear, Smooth | 1109 |
| Sasa | Zulfa - Upbeat | 1110 |
| Bu Wati | Riri Rida - Documentary & News | 1111 |
| Pak Joko | Bambang - Grounded and authoritative | 1112 |
| Mang Udin | Airelion - Street Talker | 1113 |
| Ucok | Finn - Expressive & Ads Indonesian | 1114 |
| Raka | Andra - Indonesian Gaming Narrator | 1115 |
| Kak Tara | Velora - Warm, Youthful & Conversational | 1116 |

**Cara suara dikunci:**
- Model selalu `eleven_v4`, bahasa `id`, seed dan setting tetap. Semuanya ada di `canon.json` dan ikut di-hash.
- **Hanya voice dari library publik ElevenLabs** yang dipakai, bukan kloning pribadi. Voice library bisa dipakai
  dari akun mana pun, jadi **suara tetap sama walaupun API key atau akun diganti**.
- Sebelum membuat take baru, generator memverifikasi `voice_id` dan nama voice. Kalau tidak cocok atau tidak
  ditemukan, proses **berhenti**. Tidak pernah mengganti ke suara lain secara otomatis.
- Setiap baris dialog disimpan (`public/audio/<episode>/<baris>.mp3` + `.json` berisi timestamp lip-sync).
  Take lama **dipakai ulang** selama teks dan setting suara sama, jadi render ulang tidak mengubah suara dan
  lip-sync tetap sinkron.

**Saat mengganti API key:** cukup set `ELEVENLABS_API_KEY` baru, lalu jalankan `npm run voice` seperti biasa.
Tidak ada yang perlu diubah di kanon.
Risiko yang tersisa: pemilik voice library bisa menarik voice-nya dari library. Kalau itu terjadi, generator
berhenti dengan pesan jelas, dan take yang sudah dibuat tetap aman di repo.

---

## 4. Latar terkunci (14 set)

Lihat `model-sheets/LocationSheet.png` dan `model-sheets/locations/<id>.png`.

| Set | Dipakai untuk |
|---|---|
| Warung Bu Ijah | Nongkrong pulang sekolah, traktiran, utang |
| Gerbang SMA Nusantara | Telat, razia Mang Udin, janjian pulang |
| Kelas – depan (papan tulis) | Pelajaran, ulangan, presentasi |
| Kelas – belakang | Ngobrol di belakang, piket, sembunyi dari guru |
| Kelas – sisi jendela | Bangku Kusaka, melamun, lempar kertas |
| Kelas – meja guru | Dipanggil ke depan, setor tugas |
| Koridor & Lapangan | Istirahat, gosip, papasan dengan guru |
| Kantin | Jajan, rebutan bakso, traktiran |
| Ruang BK | Sidang Pak Darto |
| Perpustakaan | Belajar kelompok, ketahuan tidur |
| Lapangan Upacara | Upacara Senin, hukuman, pensi |
| Kamar Kusaka | Adegan rumah, Dinda menjahili |
| Ruang Tamu | Keluarga: Ibu marah, Bapak dad jokes |
| Kamar Kos Kak Tara | Dunia mahasiswa |

Aturan latar: titik berdiri A–D tetap di tiap set, **tanpa teks yang bisa dibaca** (pakai piktogram), dan detail
khas Indonesia wajib ada. Ambience tiap set juga dikunci.

---

## 5. Aturan editing (terkunci di `src/edit/editing.json`)

- **Teks di layar HANYA subtitle.** Tidak ada nama karakter di atas subtitle, tidak ada judul, logo teks, atau
  end card. Teks di latar juga diganti piktogram.
- **Pengecualian, caption keterangan adegan.** Hanya teks dari daftar ini, dan hanya muncul di pojok kiri atas:
  `FLASHBACK`, `MASA LALU`, `BEBERAPA SAAT KEMUDIAN`, `SEMENTARA ITU`, `KEESOKAN HARINYA`, `SATU JAM KEMUDIAN`,
  `DI TEMPAT LAIN`, `SEPULANG SEKOLAH`, `MALAM HARINYA`, `SENIN PAGI`.
  Caption di luar daftar ditolak saat `npm run voice`.
- **Flashback:** filter sepia + vignette + bintik film, plus SFX `flashback_harp` otomatis.
  Tandai baris dengan `"flashback": true` dan `"caption": "FLASHBACK"`.
- **Kamera:** two-shot → single → push-in sebelum punchline → crash zoom, maksimal 1x per Shorts (divalidasi).
- **Shorts** langsung masuk dialog pertama dalam ≤ 0,5 detik.
- **Thumbnail** berada di luar video, jadi boleh memakai teks pendek (lihat bagian 8).

---

## 6. Pustaka SFX terkunci (`src/audio/sfx.json`)

Semua SFX **orisinal**, dibuat dengan ElevenLabs Sound Effects, bergaya meme viral tapi bukan klip berhak cipta,
sehingga aman untuk monetisasi. Satu SFX untuk satu makna:

| SFX | Makna (selalu sama) |
|---|---|
| `vine_boom` | Momen sadar atau kaget besar (otomatis di crash zoom) |
| `whoosh` / `whoosh_soft` | Crash zoom / push-in (otomatis) |
| `record_scratch` | "Tunggu dulu…", rencana batal |
| `crickets` | Hening canggung, jokes garing |
| `sad_trombone` | Gagal total, ending lesu (otomatis) |
| `sad_violin` | Memohon, drama lebay |
| `rimshot` | Setelah punchline |
| `laugh_track` | Tawa penonton sitkom (maks 1x per episode) |
| `dun_dun_dun` | Reveal dramatis berlebihan |
| `boing` / `bonk` | Lompat kaget / kepala kebentur (komedi) |
| `slide_whistle_down` | Mental down |
| `ding_idea` | Dapat ide |
| `sparkle_love` | Kusaka melihat Nadia |
| `flashback_harp` | Masuk flashback (otomatis) |
| `gasp_crowd` | Satu kelas kaget "oooh" |
| `kentongan` | Ritme lokal "tung tung tung" |
| `school_bell` | Bel sekolah |
| `run_cartoon` | Kabur |
| `pop` | Benda muncul |
| `amb_*` | Ambience per lokasi (otomatis) |

Pemakaian di naskah: `"sfx": [{ "id": "rimshot", "at": "end" }]`, dengan `at` berupa detik dari awal baris atau
`"end"`. Semua file dinormalisasi ke -1 dBFS dan ikut dikunci (hash).

**Tentang Myinstants:** situs ini tidak bisa diakses dari lingkungan kerja ini, dan sebagian besar sound-nya
adalah unggahan pengguna yang berasal dari klip TV, film, atau lagu berhak cipta. Untuk channel yang dimonetisasi,
lebih aman memakai pustaka orisinal di atas. Kalau Anda punya file yang lisensinya jelas, timpa file di
`public/sfx/<id>.mp3`, naikkan versi `sfx.json`, lalu jalankan `npm run lock:characters`.

---

## 7. Cerita yang mengalir

### Struktur Shorts (30–50 detik)
| Waktu | Beat | Catatan |
|---|---|---|
| 0–2 dtk | **HOOK**: masuk di tengah konflik | Kalimat pertama = masalah |
| 2–10 dtk | Setup | Siapa mau apa |
| 10–25 dtk | Eskalasi | Rencana makin besar |
| 25–35 dtk | **Twist / punchline** | Crash zoom + `vine_boom` |
| 35–45 dtk | Reaksi + tag line | Ditutup dengan sindiran |
| akhir | **Loop / cliffhanger** | Menyambung ke awal |

### Mesin cerita (story engines): ide jadi luas
1. **Sekolah:** telat (Mang Udin), ulangan (Bu Wati), olahraga (Pak Joko), BK (Pak Darto), gosip (Sasa), kantin.
2. **Cinta segitiga sepihak:** Kusaka → Nadia ← Bimo (Bimo tidak tahu, Nadia tidak sadar).
3. **Rumah:** Bu Ratna vs kamar berantakan, dad jokes Pak Hendra, Dinda sebagai mata-mata.
4. **Dunia SMP:** Dinda & Raka (konten viral, game, ujian SMP). Menjangkau penonton SMP.
5. **Dunia kampus:** Kak Tara (anak kos, akhir bulan, organisasi). Menjangkau mahasiswa dan menyiapkan Musim 3.
6. **Ekonomi Kusaka:** buku utang Bu Ijah sebagai running gag lintas musim.

### Musim 1: "Operasi Traktir Nadia" (12 episode)
| Ep | Judul | Lokasi | Pemeran utama | Hook |
|---|---|---|---|---|
| 1 | Traktiran Gagal ✅ | Warung | Kusaka, Ujang | "Kus, buruan pesen!" |
| 2 | Dompet Sandera | Kamar | Kusaka, Dinda | Dinda mengacungkan dompet: "Cari ini?" |
| 3 | Telat Upacara | Gerbang → Lapangan Upacara | Kusaka, Mang Udin, Pak Joko | Gerbang menutup di depan hidung Kusaka |
| 4 | PR Halaman 45 | Kelas–meja guru | Kusaka, Bu Wati, Nadia | "Kerjakan halaman 45 sampai 90." |
| 5 | Satu Kelompok | Perpustakaan | Kusaka, Nadia, Ujang | Undian kelompok: Kusaka + Nadia |
| 6 | Gosip Sasa | Koridor | Sasa, Kusaka, Ucok | "Eh, kalian udah denger belum?!" |
| 7 | Saingan Datang | Kantin | Bimo, Nadia, Kusaka | Bimo mentraktir satu meja |
| 8 | Dad Jokes | Ruang Tamu | Pak Hendra, Bu Ratna, Kusaka | Bapak: "Bapak dulu juga gitu, Nak." (FLASHBACK masa SMA Bapak) |
| 9 | Konten Dinda | Kamar → Koridor | Dinda, Raka, Kusaka | "Halo guys, ini kakakku lagi latihan nembak" |
| 10 | Ruang BK | Ruang BK | Pak Darto, Kusaka | "KUSAKA! Ke ruangan Bapak!" |
| 11 | Curhat ke Kos | Kos | Kak Tara, Kusaka | Kusaka datang membawa mi instan |
| 12 | Pensi (finale) | Lapangan Upacara | Semua | Panggung pensi, Kusaka memegang gitar 3 senar |

**Spin-off Shorts selingan** (agar unggahan rutin): "Dad Jokes Pak Hendra", "Ulangan Mendadak Bu Wati",
"Razia Mang Udin", "Gosip Sasa", "Dinda & Raka Main Game", "Kak Tara Akhir Bulan".

**Musim berikutnya:** S2 kelas XII (ujian, pilih jurusan, Bimo lulus), S3 Kusaka & Ujang kuliah dan ngekos
dekat Kak Tara, sementara Dinda naik SMA. Penonton ikut tumbuh bersama tokohnya.

---

## 8. Strategi algoritma YouTube

YouTube merekomendasikan video yang **diklik**, **ditonton lama**, dan **membuat penonton puas**. Di Shorts,
sinyal terpentingnya adalah **berapa banyak yang tidak menggeser video (swipe away)** dan **berapa yang menonton ulang**.

### Shorts
- **Detik pertama = segalanya.** Mulai dari konflik, ekspresi besar, subtitle langsung muncul.
- **30–50 detik**, punchline sebelum detik ke-40, tanpa jeda mati lebih dari 0,5 detik.
- **Loop**: akhir menyambung ke awal.
- **Branding lewat konsistensi**, bukan teks: desain karakter, suara, dan SFX yang sama membuat penonton
  langsung mengenali "ini Kusaka".
- Tautkan setiap Shorts ke video panjang (fitur *Related video*).
- **3–5 Shorts per minggu**, jam tayang konsisten (misalnya 16.00–19.00 WIB).

### Video panjang
- **Thumbnail** (di luar video, boleh ada teks): wajah karakter besar dengan ekspresi ekstrem, maksimal 3 kata,
  palet kuning #ffd23f + merah #e63946 + outline hitam, template sama tiap episode.
- **Judul:** `[situasi relate] + [konflik] | Kusaka Eps. N`.
  Contoh: *"Mau Traktir Gebetan, Dompet Malah Ketinggalan 😭 | Kusaka Eps. 1"*.
- **Chapters**, **end screen**, dan **playlist per musim** untuk memperpanjang sesi menonton.

### Komunitas & engagement
- Tutup dengan pertanyaan mudah: *"Tim Kusaka atau tim Bimo?"*, *"Guru kalian kayak Bu Wati nggak?"*
- Polling Community Post untuk memilih karakter episode berikutnya. 16 karakter = banyak pilihan.
- Hashtag inti: `#animasiindonesia #kusaka #anaksekolah #komedi #shorts`.

### Aman & monetizable
- Target 13+. Jawab "Made for Kids" dengan jujur sesuai target dan isi tiap video.
- Hindari kekerasan realistis, rokok, bullying yang dirayakan, dan kata kasar.
- SFX dan musik harus orisinal atau berlisensi (pustaka seri ini orisinal).

### Metrik yang dipantau
| Metrik | Tindakan kalau jelek |
|---|---|
| Shorts: *Viewed vs swiped away* | Perkuat 2 detik pertama |
| Shorts: *Average % viewed* (>100% = ditonton ulang) | Perpendek, buat ending loop |
| Long: *Impressions CTR* | A/B test thumbnail/judul |
| Long: *Retention* 30 detik pertama | Cold open lebih cepat |
| *Returning viewers* | Perkuat arc & cliffhanger |

---

## 9. Pipeline produksi per episode

1. Tulis `src/data/script.json`:
   - `episode`, `location`, `cast` (karakter + mark + arah hadap)
   - lalu baris dialog dengan `emotion`, `listener`, `shot`, `action`, opsional `caption`, `flashback`, `sfx`
2. `npm run voice`: verifikasi suara terkunci, buat take baru atau pakai ulang take lama, dan validasi aturan.
3. `npm run studio`: cek timing, kamera, dan ekspresi.
4. `npm run render` (16:9) dan `npm run render:shorts` (9:16).
5. Checklist sebelum upload:
   - [ ] Hook ≤ 2 detik
   - [ ] Ciri khas semua karakter terlihat
   - [ ] Tidak ada teks selain subtitle / caption resmi
   - [ ] SFX sesuai makna di tabel
   - [ ] Satu crash zoom saja
   - [ ] Ending loop atau cliffhanger
