---
name: ohhiyaa
description: Gaya terkunci channel "Ohhiyaa!": YouTube Shorts "ukur dunia pakai barang sehari-hari" — angka raksasa diterjemahkan ke satuan ala Indonesia (galon, motor, nasi bungkus, angkot, Monas), penonton diajak TEBAK dulu, lalu momen "OHHIYAA!". Animasi miniatur 3D mainan (three.js, meja studio pastel) dengan maskot OHI si galon, durasi 40–60 detik. Pakai skill ini setiap kali membuat ide judul, naskah, VO, thumbnail, atau video untuk Ohhiyaa!, termasuk saat dijalankan jadwal otomatis Kantor Konten.
---

# Ohhiyaa!: gaya terkunci

Jangan dicampur dengan stikmen Mas Kharis, diorama Ternyata Leluhur, atau Kinetic Pop Dari 1 mnt.
Patokan: mesin `video/src/ohhiyaa3d.js`, contoh pola `video/src/oh00.js` (oh00 hanya contoh, bukan episode).

## 1. Identitas & riset pasar
- **Channel:** Ohhiyaa!. Fokus **YouTube Shorts** dulu (video panjang dibahas nanti). 9:16, 1080×1920, H.264, 30 fps.
- **Prefix:** episode `oh01`, `oh02`, …; id ide `oh-YYYYMMDD-n`.
- **Terinspirasi** @geserdikitaja ("Kalau…?", data asli, skala Indonesia), **tapi berbeda**:
  - Geser Dikit memakai **peta** dan **menggeser wilayah**. Ohhiyaa! memakai **barang sehari-hari sebagai satuan ukur** dan **miniatur 3D mainan**.
  - Geser Dikit langsung menjawab. Ohhiyaa! wajib ada jeda **"TEBAK DULU!" 3-2-1** sebelum jawaban.
  - Jangan meniru judul, peta, atau gaya visual Geser Dikit.
- **Pelajaran dari riset:**
  - Video yang meledak di niche ini selalu **melibatkan penonton secara pribadi** ("kotamu", "kamu", "orang Indonesia") dan **angka raksasa yang bisa dibayangkan** ("8 miliar orang pindah ke Indonesia", 186 rb tayangan; "285 juta orang di 1 pulau", 174 rb).
  - Sains alam umum tanpa sudut personal sepi ("Matahari itu apa?", 18 rb; "Kenapa Toba meletus?", 2 rb).

## 2. Seri (rotasi tiap hari)
1. **Ukur Pakai Barang Sehari-hari:** "Berapa galon supaya setinggi Monas?", "Jalan tol Trans-Jawa = berapa motor dijejer?"
2. **Kalau Semua Orang Indonesia…:** "…makan nasi bungkus bersamaan, tumpukannya setinggi apa?", "…loncat bareng, Bumi goyang nggak?"
3. **Tebak Dulu: Lebih Besar Mana?:** "Lebih berat mana: semua motor di Jakarta atau Monas?"

**Kriteria judul:**
- Pertanyaan dengan angka raksasa + barang sehari-hari + sudut personal.
- Jawabannya bisa dihitung dari **data resmi** (BPS, Korlantas, KLHK, NASA, buku spesifikasi).
- Hitungan sederhana yang bisa dicek ulang.

## 3. DURASI (terkunci)
- **40–60 detik**, sekitar 100–140 kata.
- Di bawah 40 detik tambah satu pembanding; di atas 60 detik pangkas.

## 4. Struktur naskah (6 bagian, wajib)
| # | Fungsi | Durasi |
|---|---|---|
| 1 | **HOOK pertanyaan:** pertanyaan "Berapa/Kalau…?" langsung di kalimat pertama, dengan barang sehari-hari di layar | 3–5 dtk |
| 2 | **TEBAK DULU:** "Tebak dulu di komentar. Tiga, dua, satu." (`tebak()`) | 3–4 dtk |
| 3 | **SATUAN:** ukur satu barang (penggaris mainan) + satu fakta pembanding | 8–12 dtk |
| 4 | **HITUNG:** hitungan sederhana yang terlihat (tumpukan/barisan tumbuh) | 8–12 dtk |
| 5 | **JAWABAN + OHHIYAA!:** angka besar + momen `ohhiyaa()` | 5–8 dtk |
| 6 | **TWIST/PERSONAL + CTA:** bandingkan dengan sesuatu milik penonton ("…itu sama dengan …-mu") + pertanyaan lanjutan untuk komentar | 6–10 dtk |

- **Bahasa:** santai dan ceria, pakai "kamu". Angka di VO ditulis dengan huruf.
- **Pembulatan:** pakai "sekitar"; tampilkan "±" di layar.
- **Setiap angka wajib bersumber**, dengan hitungan ditulis di naskah.
- **Penutup:** pertanyaan lanjutan yang berbeda tiap episode (bukan perintah follow).
- **File:**
  - `naskah/ohNN-slug.md`: baris atas `> Voice Over: <nama suara>`, seri, judul, 6 bagian, **Hitungan & sumber**, paket posting (judul ≤70 karakter, deskripsi + sumber, 5–8 hashtag, komentar disematkan).
  - `video/vo/ohNN.txt`: 6 paragraf.

## 5. Visual: Miniatur 3D mainan (`ohhiyaa3d.js`)
- **Panggung:**
  - `studio(sky)`: meja studio dengan grid ukur, latar pastel `studio` (pink), `mint`, `langit`, `ungu`, atau `angkasa` (luar angkasa).
  - Ganti warna latar setiap bagian.
- **Barang mainan (`TOY`)**, plastik mengkilap dengan garis tepi:
  - `galon`, `motor`, `nasi` (nasi bungkus), `angkot`, `monas`, `orang`, `gedung`, `bumi`, `bulan`, `penggaris`.
  - Barang baru ditambahkan ke `TOY` dengan gaya sama: bentuk sederhana, warna cerah, outline.
- **Penempatan:**
  - Satu barang: `toy(kind, id)` + `place(...)`.
  - Banyak barang: `stack(kind, n, {cols, rows, layer, gap})`.
  - Tumpukan tumbuh: `grow(G, t, t0, t1, x, z, s)`.
  - Untuk angka raksasa, tampilkan tumpukan **representatif** dan label `chip('Ilustrasi skala', …)`.
- **Maskot OHI (galon bermata):** `ohi(t, {x, z, ry, s, expr:'senang'|'kaget'|'mikir', wave, jump, point})`.
  - Muncul di hook, saat tebak, dan saat OHHIYAA!.
  - Ekspresi sesuai momen, tidak selalu sama.
- **Kamera:** `shot(t, t0, t1, eye, target, {push, eye2, target2})`. Gerak pelan terus; naik/tilt saat tumpukan tumbuh.
- **Overlay 2D:**
  - `angka('± 270 GALON', y, t0, {sub, col})`: angka besar.
  - `tebak(t0, t1)`: TEBAK DULU 3-2-1.
  - `ohhiyaa(t0)`: ledakan khas, **sekali per video** di jawaban.
  - `chip`, `card`.
- **Caption:** kata per kata, Nunito 900, kata kunci pink (`KEYWORDS`), di y 1500.
- **Palet:** pink `#FF6FAE`, kuning `#FFC93C`, mint `#7EE8CF`, biru `#1E6EFF`, garis `#24204A`.

## 6. Audio
- **VO:** ElevenLabs, suara khusus dari owner di `config.channels.ohhiyaa.elevenlabs`.
  - Selama `suara_menunggu: true`, `tts_elevenlabs.py` berhenti dengan pesan, dan produksi diberi status `butuh-vo` ("Menunggu ID suara dari owner").
- **Musik + SFX:** `python3 video/src/leluhur_mix.py ohNN` (`music:true`), menghasilkan `video/vo/ohNN-mix.m4a`.
  - SFX otomatis: pop/stamp dari overlay, tick saat angka, boom saat OHHIYAA!.
  - Tambahan lewat `window.EXTRA_SFX`.

## 7. Pipeline
1. VO: `python3 video/src/tts_elevenlabs.py ohNN`, lalu cek durasi 40–60 detik.
2. Buat `video/src/ohNN.html` (salin `oh00.html`) dan `ohNN.js` (pola `oh00.js`, 6 bagian, `beatOf(t)`).
3. Render stills di 8–10 titik dan periksa:
   - teks tidak tertutup;
   - maskot terlihat utuh;
   - angka cocok dengan hitungan;
   - latar berganti.
4. Mix: `python3 video/src/leluhur_mix.py ohNN`.
5. Render: `cd video/src && EP=ohNN node render.js video ../out/ohhiyaa-ohNN.mp4 30 ../vo/ohNN-mix.m4a`.
6. Thumbnail (skill `thumbnail-high-cta`): frame dengan OHI + tumpukan + teks pertanyaan, **tanpa membocorkan angka jawaban**.

## 8. Larangan
- Angka karangan atau hitungan yang tidak bisa dicek.
- Jawaban di thumbnail.
- Meniru judul atau gaya peta Geser Dikit.
- Durasi di luar 40–60 detik.
- Momen OHHIYAA! lebih dari sekali.
