---
name: mas-kharis
description: Gaya terkunci channel "Mas Kharis" — video motion graphic vertikal 1080×1920 ±60 detik dengan stikmen Mas Kharis (1 helai rambut), ruangan kartun 2.5D dinding kuning + lantai catur teal, caption kata per kata. Pakai skill ini setiap kali membuat ide judul, naskah, VO, atau video MP4 untuk Mas Kharis, termasuk saat dijalankan oleh jadwal otomatis Kantor Konten.
---

# Mas Kharis — gaya terkunci

> **STATUS: TERKUNCI** (versi 10 Nov 2026, disetujui owner). Gaya, alur, durasi, suara, dan mesin di skill ini hanya boleh diubah atas perintah langsung owner. Sesi otomatis (ide harian/produksi) **dilarang mengubah file skill ini**.

Gaya ini **terkunci**. Jangan mengubah karakter, palet, ruangan, font, ukuran judul, atau format naskah kecuali owner (Adip) memintanya langsung dengan kata-kata sendiri. Referensi gaya lain (misalnya kantor isometrik/pixel art) adalah untuk **Kantor Konten**, bukan untuk video Mas Kharis.

Contoh hidup yang menjadi patokan: `video/src/ep01.js`, `video/src/ep02.js`, `video/src/sample.js`, naskah di `naskah/`.

## 1. Karakter (selalu sama)

| Karakter | Bentuk | Warna |
|---|---|---|
| **Mas Kharis** (tokoh utama) | kepala bulat putih, **1 helai rambut** di ubun-ubun, badan "kacang" berwarna, kaki & tangan garis hitam tipis | baju biru `C.shirtK #2F6FD0`, rambut `#3A2216` |
| **Dimas** (teman kantor) | sama, rambut lebih banyak | baju hijau `C.shirtD #3FA34D` |
| **Pak Bos** | badan lebih lebar (×1.22), kemeja putih, dasi merah | `C.shirtB #F7F7F7` |

- Gambar hanya lewat `drawChar(kind, fx, fy, s, st)` di `video/src/lib.js` (`kind`: `'kharis' | 'dimas' | 'bos'`). Jangan menggambar stikmen baru dengan kode sendiri.
- Ekspresi: `neutral, tired, shock, happy, proud, salute, angry, sad`. Pose: `stand, sit, walk`. Lengan: `down, hip, up, salute, clap, [x,y]`, plus `hold` untuk memegang benda.
- Garis luar `C.ol #1d2030`, tebal, kartun bersih. Karakter harus **besar** di frame (kamera zoom 1.2–1.5), bukan kecil di kejauhan.

## 2. Dunia & warna

- Ruangan perspektif satu titik 2.5D: `drawRoom()`. Dinding kuning `#F2CC45` / `#E0B634`, lantai catur teal `#1F8B95` + `#EEF5F4`, plafon papan lavender.
- Properti kantor dari `lib.js`/`story.js`: meja, monitor, keyboard, mug, jam dinding, jendela (siang/malam), papan tulis, banner, pintu, lemari, tanaman, lampu, laptop, kertas, amplop, trofi.
- Ruang Bos memakai `BOS_ROOM` (dinding mint, lantai kayu).
- Suasana sore/malam memakai `gradeMul(255,214,172,0.5)` atau `nightGrade`. Jangan pernah membuat frame satu warna atau gelap pekat.
- Warna aksen: merah `#E84545`, emas `#F5B82E`, kuning teks `#FFD84A`.

## 3. Teks di layar

- Font **Inter Black 900**, putih dengan stroke hitam tebal (`strokeText`).
- **Hook title besar** di atas (y≈300), 3 baris: putih, kuning, lalu merah dengan ukuran dasar **92px** (baris terakhir ×1.15). Owner sudah menolak versi kecil, jadi jangan diperkecil. Hook hilang begitu adegan utama mulai.
- **Caption VO** kata per kata di y=1480 lewat `voCaption(t, 1480)`: potongan 3 kata, kata aktif kuning + pop.
- Teks pendukung di adegan memakai `topLines(lines, t, y)`, kartu, bubble, atau cap. Taruh di ruang kosong dan jangan menutupi wajah Kharis.
- Setiap pergantian bagian diberi flash putih singkat dan vignette.

## 4. Format naskah (wajib)

File `naskah/epNN-slug.md`, bahasa Indonesia santai, narator orang ketiga yang sesekali menyapa "kamu/kalian". Struktur:

1. Judul `# Mas Kharis Ep.NN — "Judul"`, lalu header: Niche, Format (9:16, ±60 dtk), Gaya (sama dengan Ep.01), Narator.
2. Tabel **Karakter** beserta perannya di episode ini.
3. **Dasar fakta** jika niche berupa fakta, psikologi, atau finansial. Tulis sumber yang nyata, tanpa angka karangan.
4. **Naskah** dengan **7 bagian, total 40–55 detik (±95–115 kata)** — versi high CTA sejak Ep.04 v2. Tiap bagian berisi `### N. NAMA (a–b dtk)`, `- Visual:`, `- Teks layar:`, dan `- VO:` (blockquote).
   Prinsip: **komedi dulu, fakta sedikit.** Penonton menonton untuk merasa "kok aku banget", bukan kuliah.
   1. **COLD OPEN (0–7 dtk):** langsung di tengah kejadian, sebaiknya dengan kalimat tokoh dalam tanda kutip ("“Aku resign ya, Kharis!”"), lalu konflik yang terasa.
   2. **ESKALASI (±8 dtk):** 2–3 kejadian yang makin parah/lucu ("Besoknya… Lusanya…").
   3. **SATU FAKTA (±6 dtk):** satu kalimat saja, tanpa nama peneliti di VO (nama & sumber cukup di deskripsi).
   4. **PEMICU DEBAT (±6 dtk):** pernyataan yang mengundang setuju/tidak ("…itu namanya ikut-ikutan. Setuju nggak?"). Ini ajakan komentar di tengah video.
   5. **TRIK + LELUCON (±8 dtk):** satu trik praktis yang ditutup lelucon ("kalau daftarnya kosong… mungkin kamu cuma kangen dia").
   6. **PILIH KUBU (±4 dtk):** "Kamu tim A atau tim B? Tulis di komentar!" (tanpa ajakan follow yang panjang).
   7. **PUNCHLINE LOOP (±10 dtk):** twist dari cerita, lalu kalimat terakhir menyambung ke detik 0 supaya video terasa berulang ("Dan malam itu… dia makin nggak bisa tidur.").
   - **Penutup tidak boleh sama dengan episode lain.** Sebelum menulis, baca bagian penutup di semua file `naskah/`. Jangan mengulang kalimat, lelucon, atau teaser yang sudah dipakai. Punchline sebaiknya lahir dari cerita episode itu sendiri (contoh Ep.03: Kharis ketahuan mengisi keranjang lagi). Kalau episode sebelumnya menjanjikan topik tertentu ("besok kita bongkar X") dan topik itu belum dibuat, prioritaskan X sebagai episode berikutnya. Jangan menjanjikannya ulang di episode lain.
5. **VO lengkap** dengan 7 paragraf, satu paragraf per bagian (dipakai TTS dan align).
6. **Catatan rekam VO**: suara sama, jeda ±1 detik antarbagian, durasi 40–55 detik.

## 5. Pipeline produksi

```
naskah/epNN-*.md
  → video/vo/epNN.txt            (7 paragraf VO, dipisah baris kosong)
  → VO + timestamp:
       a) ElevenLabs: python3 video/src/tts_elevenlabs.py epNN
          → video/vo/epNN.mp3, epNN.json, epNN-words.js
       b) VO rekaman owner (cadangan): taruh mp3 di video/vo/epNN.mp3, lalu
          python3 video/src/align.py video/vo/epNN.mp3 video/vo/epNN.txt video/vo/epNN.json
          dan buat epNN-words.js = "const VO = " + json + ";"
  → video/src/epNN.html (salin ep02.html, ganti nama file VO & episode)
  → video/src/epNN.js   (7 scene + hookTitle + renderFrame, pola ep04.js v2)
  → cek stills:  cd video/src && EP=epNN node render.js stills /tmp/cek 1 5 12 ...
  → render:      EP=epNN node render.js video ../out/mas-kharis-epNN.mp4 30 ../vo/epNN.mp3
```

Aturan kode episode:
- Sinkron ke VO, jangan pakai detik tebakan. Waktu diambil dari `at('kata', n)`/`atEnd`, dan batas adegan dari `CUT[i]`.
- `renderFrame` mulai dengan `g.reset()`, menggambar scene aktif, lalu `vignette()`, `hookTitle(t)`, `voCaption(t,1480)`, dan flash di setiap `CUT`.
- Setelah render stills, gabungkan beberapa frame (`ffmpeg hstack`) dan periksa: wajah tidak tertutup teks, karakter besar, tidak ada teks keluar layar, warna tidak monoton.
- MP4 di-*gitignore*. Commit hanya sumber (naskah, vo txt/json/words.js/mp3, js, html).

## 6. Ide judul (Penggali Ide)

Ide harian untuk Mas Kharis harus:
- Bertema hidup sehari-hari pekerja muda Indonesia (kantor, gajian, psikologi kebiasaan, uang, relasi kerja) dengan CTA tinggi: mudah dikomentari atau memancing pilih kubu.
- Hook ≤ 6 kata dengan pola konflik atau pertanyaan ("Baru gajian, kok udah habis?!").
- Tidak mengulang judul yang sudah ada di `naskah/` atau di Kantor Konten.
- Diisi lengkap: `judul`, `hook` (3 baris judul layar), `niche`, `alasan` (kenapa CTA tinggi), `cta`.

Alur Kantor Konten (persetujuan owner) dan peran tiap agen ada di `workflow/README.md`.
