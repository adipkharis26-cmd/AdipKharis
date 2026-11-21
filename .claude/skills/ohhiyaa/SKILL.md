---
name: ohhiyaa
description: Gaya terkunci channel "Ohhiyaa!": YouTube Shorts "ukur dunia pakai barang sehari-hari" — angka raksasa diterjemahkan ke satuan ala Indonesia (galon, motor, nasi bungkus, angkot, Monas), penonton diajak TEBAK dulu, lalu momen "OHHIYAA!". Animasi miniatur 3D mainan (three.js, meja studio pastel) dengan maskot OHI si galon, durasi 40–55 detik. Pakai skill ini setiap kali membuat ide judul, naskah, VO, thumbnail, atau video untuk Ohhiyaa!, termasuk saat dijalankan jadwal otomatis Kantor Konten.
---

# Ohhiyaa!: gaya terkunci

> **STATUS: TERKUNCI** (versi 10 Nov 2026, disetujui owner; visual v3 "wow" 10 Nov 2026; **alur acak v4 16 Nov 2026**, semuanya atas perintah owner). Gaya, alur, durasi, suara, dan mesin di skill ini hanya boleh diubah atas perintah langsung owner. Sesi otomatis (ide harian/produksi) **dilarang mengubah file skill ini**.

Jangan dicampur dengan stikmen Mas Kharis, diorama Ternyata Leluhur, atau Kinetic Pop Dari 1 mnt.
Patokan: mesin `video/src/ohhiyaa3d.js` (visual v3), contoh episode lengkap `video/src/oh01.js` (Rp1 triliun), contoh pola singkat `video/src/oh00.js`, contoh episode kedua (seri "Kalau Semua Orang…", cincin Bumi) `video/src/oh02.js`.

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
3. **Tebak Dulu: Lebih Besar Mana?** (cocok dengan format duel): "Lebih berat mana: semua motor di Jakarta atau Monas?"

**Kriteria judul:**
- Pertanyaan dengan angka raksasa + barang sehari-hari + sudut personal.
- Jawabannya bisa dihitung dari **data resmi** (BPS, Korlantas, KLHK, NASA, buku spesifikasi).
- Hitungan sederhana yang bisa dicek ulang.

## 3. DURASI (terkunci)
- **40–55 detik**, sekitar 85–115 kata.
- Di bawah 40 detik tambah satu landmark; di atas 55 detik pangkas.

## 4. ALUR ACAK v4 (WAJIB, owner 16 Nov 2026) — jangan lagi "selalu A/B/C, selalu jawaban C"
Keluhan owner: alur terasa monoton (hook → A/B/C → tangga → jawaban C). Sejak v4 **format interaksi, kerangka alur, dan posisi jawaban dipilih ACAK per episode**, bukan oleh penulis.

**Langkah pertama setiap episode (sebelum menulis naskah):**
```
python3 video/src/oh_format.py ohNN --simpan
```
Skrip membaca `workflow/oh-format.json` dan mencetak `format`, `alur`, `jawaban` (posisi jawaban benar), `komentar`, `overlay`, `aturan`. **Patuhi hasilnya** dan tulis di baris atas naskah (`Format: … · Alur: … · Jawaban: …`). Hasilnya terkunci per id episode (seed = id), jadi tidak berubah di tengah produksi. Penulis dilarang memilih sendiri atau menukar hasilnya.

**Enam format interaksi** (penonton tetap diajak ikut komentar, tapi bentuknya berganti):
| Format | Penonton diminta | Overlay |
|---|---|---|
| `abc` Pilih A/B/C | ketik A, B, atau C | `tebak(opsi:3)` |
| `benar-bohong` | ketik BENAR atau BOHONG atas sebuah klaim | `tebak(txt:'BENAR / BOHONG?', opsi:2)` |
| `tebak-angka` | tulis angka tebakannya sendiri ("paling dekat, ketik 🎯") | `tebak(txt:'TEBAK ANGKANYA!', …)` |
| `duel` | ketik emoji tim (dua kubu bertanding) | `duel(t0, t1, {kiri, kanan})` |
| `urutkan` | ketik urutan kecil→besar, mis. 2-1-3 | `tebak(txt:'URUTKAN!', opsi:3)` |
| `kurang-lebih` | ketik KURANG atau LEBIH dari satu patokan | `tebak(txt:'KURANG / LEBIH?', opsi:2)` |

**Lima kerangka alur** (urutan bagian ikut `oh-format.json → alur.<nama>.urutan`):
- `tangga`: tangga landmark klasik (bagian 4 di bawah).
- `hasil-dulu`: hasil mengejutkan di awal (OHHIYAA! di 4–9 dtk), lalu "kok bisa?" dibongkar; tebakan susulan berupa angka/sebab.
- `duel`: dua tumpukan berlomba, layar/panggung terbelah, tanpa tangga landmark.
- `salah-kaprah`: klaim yang beredar diuji lalu dikoreksi; tangga maks 3 titik.
- `urut`: tiga barang dalam urutan acak, tiga mini-hitungan, podium di OHHIYAA!.

**Aturan acak:** format tidak sama dengan 2 episode terakhir; alur tidak sama dengan episode terakhir; posisi jawaban tidak sama dengan episode terakhir berformat sama. Pilihan salah boleh lebih besar daripada jawaban benar (jangan selalu "yang paling besar benar"). Jawaban akhir ditampilkan dengan `jawab(t, 'Jawaban: …')`, bukan chip tetap "Jawaban: C".

**Yang TETAP (tidak berubah):** 40–55 detik, hook pertanyaan angka + barang sehari-hari di 0–4 dtk, satuan ringan, OHHIYAA! **sekali per video** (posisinya mengikuti alur), bagian akhir personal + loop yang menyambung ke kalimat pertama, setiap angka bersumber.

## 4a. Struktur naskah v2 (kerangka alur `tangga`; alur lain memakai urutan di `oh-format.json`)
| # | Fungsi | Durasi |
|---|---|---|
| 1 | **HOOK pertanyaan:** "…kalau ditumpuk/dijejer, sampai mana?" di kalimat pertama, barang sehari-hari langsung di layar | 0–4 dtk |
| 2 | **INTERAKSI (format acak, lihat bagian 4):** ajakan komentar sesuai format yang dipilih skrip (mis. "Pilih di komentar: A…, B…, C…" + `tebak(t0, t1, {opsi:[…]})`, atau `duel`, benar/bohong, dst.). Teks pilihan singkat; posisi jawaban benar **dari skrip**, bukan pilihan penulis | 4–8 dtk |
| 3 | **SATUAN RINGAN:** ukur satu barang + angka total. **Angka besar cukup di layar** (`angka()`), VO memakai bahasa ringan ("empat belas setengah miliar") | 8–14 dtk |
| 4 | **TANGGA LANDMARK:** tumpukan/barisan naik melewati 4–6 titik yang dikenal ("…lewat Monas… lewat Everest… lewat pesawat…") dengan `tangga([...])` + kamera naik. Kejutan kecil tiap 2–3 detik | 14–28 dtk |
| 5 | **OHHIYAA!:** jawaban + twist kedua ("bukan cuma sampai, tapi lewat…") + `ohhiyaa()` (sekali saja) | 28–34 dtk |
| 6 | **PERSONAL + LOOP:** bandingkan dengan penonton ("rata-rata seminggu sekali, kamu lebih rajin?"), lalu kalimat terakhir **menyambung ke kalimat pertama** ("Jadi kalau ada yang tanya…") supaya video terasa berulang | 34–45 dtk |

- **Durasi 40–55 detik** (sekitar 85–115 kata). Di atas 55 detik, pangkas.
- **Angka di VO** ditulis dengan huruf, sesedikit mungkin. Hitungan detail hanya di layar dan di deskripsi.
- **Landmark wajib nyata** dan bersumber (tinggi/jarak), urut dari kecil ke besar.
- **Pembulatan:** pakai "sekitar"; tampilkan "±" di layar.
- **Setiap angka wajib bersumber**, dengan hitungan ditulis di naskah.
- **Komentar disematkan:** menyesuaikan format (mis. "Tadi kamu pilih A, B, atau C?", "Tim mana kamu?", "Tebakan angkamu berapa?", "Benar atau bohong menurutmu tadi?").
- **Bahasa:** santai dan ceria, pakai "kamu".
- **File:**
  - `naskah/ohNN-slug.md`: baris atas `> Voice Over: Papa Gufron`, seri, judul, 6 bagian, **Hitungan & sumber**, paket posting (judul ≤70 karakter, deskripsi + sumber, 5–8 hashtag, komentar disematkan).
  - `video/vo/ohNN.txt`: 6 paragraf.
- Contoh naskah v2: field `draftNaskah` di ide `oh-20261110-1` (mi instan).

## 5. Visual: Miniatur 3D mainan (`ohhiyaa3d.js`)
- **Panggung:**
  - `studio(sky)`: meja studio dengan grid ukur, latar pastel `studio` (pink), `mint`, `langit`, `ungu`, atau `angkasa` (luar angkasa).
  - Ganti warna latar setiap bagian.
- **Barang mainan (`TOY`)**, plastik mengkilap dengan garis tepi:
  - `galon`, `motor`, `nasi` (nasi bungkus), `angkot`, `monas`, `orang`, `rumah`, `gedung`, `pencakar`, `gunung`, `awan`, `pesawat`, `satelit`, `bumi`, `bulan`, `penggaris`, `uang`, `gepok`.
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
  - `tebak(t0, t1, {opsi:['A. …','B. …','C. …'], txt:'TEBAK DULU!'})`: 3-2-1 + pilihan; `txt` dan jumlah `opsi` (2–3) bisa diubah untuk benar/bohong, kurang/lebih, urutkan, tebak angka.
  - `duel(t0, t1, {kiri:'🍚 TIM NASI', kanan:'🏍️ TIM MOTOR', txt:'DUEL!'})`: dua kubu berhadapan + VS + hitung mundur.
  - `jawab(t, 'Jawaban: …', {col, y})`: stempel jawaban umum (semua format).
  - `tangga([{label, sub, t}, …], {t1})`: altimeter landmark di kiri layar, tiap titik menyala saat dilewati.
  - `ohhiyaa(t0)`: ledakan khas, **sekali per video** di jawaban.
  - `chip`, `card`.
- **Caption:** kata per kata, Nunito 900, kata kunci pink (`KEYWORDS`), di y 1500.
- **Palet:** pink `#FF6FAE`, kuning `#FFC93C`, mint `#7EE8CF`, biru `#1E6EFF`, garis `#24204A`.

### 5b. Visual v3 "wow" (wajib, otomatis dari mesin)
Mesin sudah memberi tampilan ini tanpa kode tambahan:
- **Plastik mengkilap** (clearcoat + pantulan softbox) untuk semua barang dan OHI.
- **Dome studio** tanpa garis horizon, lantai cutting mat, mainan pastel melayang di latar (bintang di `angkasa`).
- **Kamera hidup**: goyang tangan halus + **punch-in zoom** otomatis pada `angka`, `chip`, hitungan `tebak`, dan OHHIYAA!.
- **Transisi garis permen** (pink-kuning-mint-biru) di setiap pergantian bagian.
- **Angka berputar naik** dari 0 di `angka()` (matikan dengan `{hitung:false}`).
- **Caption** memantul; kata kunci jadi stiker kuning bertulisan pink.
- **OHHIYAA!**: kilat putih, sinar berputar, layar bergetar, dan OHI otomatis bermata bintang (`wow`). OHI berkedip dan bernapas sendiri.
- Vignette + grain halus.

Yang **wajib dipakai penulis episode** supaya "wow":
- `grow(stack(kind, n, {...}), t, t0, t1, x, z, s)`: barang **jatuh satu per satu** dengan pantulan (bukan meregang). Pakai untuk momen "sepuluh juta lembar", "270 galon".
- `muncul(obj, t, t0)` setelah `place()`: pop-in squash & stretch untuk barang baru.
- `pilar(id, h, {w, d, col, label, per})`: menara tumpukan bertekstur lapisan + pita kertas, tinggi `h` boleh berubah tiap frame (menara naik).
- `garisCepat(t0, t1, 'naik'|'zoom')`: garis kecepatan saat tumpukan naik / kamera meluncur.
- Kamera yang **mengikuti puncak tumpukan** saat menara naik (lihat `oh01.js` bagian 4).
- Landmark skala asli: `monas`, `pencakar` (gedung tertinggi), `gedung`, `rumah`, `gunung`, `awan`, `pesawat`, `satelit`, `bumi`, `bulan`.
- Barang baru: `uang` (lembar), `gepok` (ikat uang), plus `galon` baru (rusuk, air di dalam, label 19 L).
- Setiap bagian minimal **satu gerakan besar** (jatuh/naik/pop/kamera meluncur); tidak boleh ada bagian dengan layar diam.

## 6. Audio
- **VO:** ElevenLabs **Papa Gufron** (voice ID clone akun 3: `CxNJK2WBZgE53UbPrdZK`, di-clone 21 Nov 2026 dari rekaman owner SUARA_GUFRON atas perintah owner; ID lama `qAPGpZUUXbGAN8LW8h7f` (akun 2) dan `CZ1zU0S6elSZD4eYUY6c` (akun 1) tidak berlaku), **wajib Eleven v4**, Stabilitas 0.5, Kesamaan 0.75, Bahasa Auto.
  - Mode **satu tarikan** (seluruh naskah sekali baca, jeda di-crossfade) + reverb ruang tipis. Semua diatur di `config.channels.ohhiyaa.elevenlabs`.
  - Efek UI ElevenLabs (kebisingan, ruang) tidak dipakai.
  - Preview suara ke owner cukup 10 detik, dan pakai rekaman yang ada bila bisa (hemat kredit).
- **Musik + SFX:** `python3 video/src/leluhur_mix.py ohNN` (`music:true`), menghasilkan `video/vo/ohNN-mix.m4a`.
  - SFX otomatis: pop/stamp dari overlay, tick saat angka, boom saat OHHIYAA!.
  - Tambahan lewat `window.EXTRA_SFX`.

## 7. Pipeline
0. **Format acak:** `python3 video/src/oh_format.py ohNN --simpan` (bagian 4); catat hasilnya di naskah.
1. VO: `python3 video/src/tts_elevenlabs.py ohNN`, lalu cek durasi 40–55 detik.
2. Buat `video/src/ohNN.html` (salin `oh00.html`) dan `ohNN.js` (pola `oh00.js`, 6 bagian, `beatOf(t)`).
3. Render stills di 8–10 titik dan periksa:
   - teks tidak tertutup;
   - maskot terlihat utuh;
   - angka cocok dengan hitungan;
   - latar berganti.
4. Mix: `python3 video/src/leluhur_mix.py ohNN`.
5. Render: `cd video/src && EP=ohNN node render.js video ../out/ohhiyaa-ohNN.mp4 30 ../vo/ohNN-mix.m4a`.
6. Thumbnail (skill `thumbnail-high-cta`): frame dengan OHI + tumpukan + teks pertanyaan, **tanpa membocorkan angka jawaban**.
7. **Kemas output siap (wajib, bagian 9):** `python3 video/src/siap.py ohNN`.

## 9. OUTPUT SIAP (TERKUNCI, owner 16 Nov 2026; format posting diperbarui 20 Nov 2026)
Satu episode dianggap SELESAI hanya kalau paketnya persis ini, tidak kurang dan tidak lebih:
1. **1 MP4** `ohNN.mp4` (1080×1920, H.264 + AAC, 40–55 dtk, sudah berisi VO + musik + SFX).
2. **2 thumbnail** `ohNN-thumb-A.png` (varian utama) dan `ohNN-thumb-B.png` (cadangan), 1080×1920, tanpa membocorkan jawaban.
3. **1 judul** dan 4. **1 deskripsi**: **DITAMPILKAN LANGSUNG DI CHAT dalam kotak kode (siap salin), BUKAN berkas .txt** (perintah owner 20 Nov 2026). Format:
   - **Judul YouTube Shorts:** satu baris, maks 70 karakter, boleh 1–2 emoji, **diakhiri ` | OHHIYAA!`**. Contoh: `Kertas Dilipat 42 Kali Sampai Bulan, Benar atau Bohong? 🌙 | OHHIYAA!`
   - **Deskripsi YouTube Shorts:** (a) 1–2 kalimat pembuka santai dengan emoji (klaim/pertanyaan video); (b) 1–2 kalimat hitungan + sumber singkat; (c) baris kosong, lalu **ajakan komentar sesuai format** diakhiri 👇 (mis. "Tadi kamu jawab benar atau bohong? 👇"); (d) baris kosong, lalu **5–8 hashtag huruf kecil, diawali `#shorts`** (mis. `#shorts #ohhiyaa #faktaunik #indonesia #tahukahkamu`).
- Judul dan deskripsi ditulis di naskah (`naskah/ohNN-*.md`) bagian **Paket posting** sebagai dua kotak kode: `### Judul` (1 kotak) lalu `### Deskripsi` (1 kotak). Tepat satu judul dan satu deskripsi, bukan beberapa pilihan.
- Perintah pengemas dan pemeriksa: `python3 video/src/siap.py ohNN`. Hasil berkas di `video/out/siap/ohNN/` (MP4 + 2 PNG saja), dan perintah itu **mencetak judul + deskripsi dalam kotak kode**: tempel apa adanya ke balasan chat bersama pengiriman MP4 dan thumbnail. Kalau perintah itu gagal, episode belum siap dan tidak boleh dilaporkan selesai.
- Berkas lain (naskah, VO, mix, spesifikasi thumbnail) tetap disimpan di repo sebagai bahan, tetapi yang diserahkan ke owner hanya MP4, 2 thumbnail, 1 judul, 1 deskripsi.

## 10. HEMAT KUOTA + KEASLIAN (TERKUNCI, owner 21 Nov 2026) — gaya visual TIDAK berubah
**Keaslian (mengurangi risiko dianggap konten massal/berulang/tidak autentik; tidak ada jaminan, keputusan akhir ada di platform):**
1. Topik **riset sendiri** dari **sumber primer** (BPS, NASA, Kemenkes, BI, Guinness, dst.), minimal 2 sumber bernama; hitungan ditulis sendiri dan bisa dicek ulang. Angka tanpa sumber = ganti topik.
2. **Anti-duplikat:** semua topik tercatat di `workflow/oh-topik.json`. `python3 video/src/ohspec.py ohNN` menolak spec bila judul terlalu mirip, objek+patokan hampir sama, **objek dipakai ≥2× di 6 episode terakhir**, atau **patokan (Monas, Sabang–Merauke, dst.) dipakai ≥2× di 5 episode terakhir**. Pakai patokan baru dari `kolam_patokan_baru` (angkanya wajib diriset dulu).
3. Setiap spec wajib memuat `keaslian.sudut_baru` (apa yang benar-benar baru, bukan sekadar ganti angka) dan `keaslian.web_cek` (pencarian web yang dijalankan untuk memastikan tak ada judul/visual identik; maks 1 pencarian).
4. Jangan meniru judul, gaya, atau visual kreator lain (mis. @geserdikitaja). Semua aset dibuat sendiri (mainan 3D, musik/SFX sintesis, VO akun sendiri). Dilarang memakai klip/gambar pihak lain.
5. Format interaksi, alur, dan posisi jawaban diacak (bagian 4); jangan menukar hasil `oh_format.py`.
6. VO memakai suara sintetis (ElevenLabs): di YouTube Studio jawab pertanyaan pengungkapan konten sintetis/AI dengan jujur; keputusan ada pada owner.

**Hemat kuota (token + waktu):**
1. **Satu spec saja:** tulis `video/spec/ohNN.json` (lihat `video/spec/CONTOH.json`), lalu `python3 video/src/ohspec.py ohNN --simpan` menghasilkan `video/vo/ohNN.txt`, `naskah/ohNN-*.md`, `video/thumb/ohNN.json`, dan mencatat registri. **Dilarang menulis naskah/VO/thumb JSON manual.**
2. **TTS sekali:** pastikan VO 85–115 kata (≈2 kata/dtk; target total ≤ 53 dtk) sebelum `tts_elevenlabs.py`; jangan generate ulang kecuali durasi >55 dtk.
3. **Scene ringkas:** episode baru memuat `ohlib.js` (setelah `ohhiyaa3d.js`): `hOf`, `towerOf`, `follow`, `lane`, `counterUI`. Tulis hanya bagian khas episode (pola `oh05/oh07/oh09`).
4. **Preview 1 lembar:** `python3 video/src/ohsheet.py ohNN` (8 frame, 1 gambar, keluaran 1 baris). Read sekali; revisi terarah dengan detik tertentu (`ohsheet.py ohNN 6 20 36.5`); maks 2 putaran. Dilarang render video penuh untuk preview (CLAUDE.md §1).
5. **Render sekali, tanpa polling:** `python3 video/src/ohrun.py ohNN` dijalankan `run_in_background` (lint → mix → render → thumbnail → siap; tiap tahap dilewati jika hasilnya sudah mutakhir). Jangan memakai Monitor/sleep berulang; tunggu satu notifikasi selesai. `ohrun.py ohNN --rencana` untuk melihat apa yang akan dikerjakan tanpa menjalankan.
6. **Lint sebelum render:** `ohlint.js` (otomatis di `ohrun.py`) menangkap error, durasi di luar 40–55, dan OHHIYAA! ≠ 1× sebelum render ±15 menit. Perbaiki dulu, baru render.
7. **Riset hemat:** maks 3 `WebSearch` mode standard per episode (data inti, kebenaran klaim, cek duplikat). Jangan mode extended.
8. **Verifikasi MP4:** cukup `ffprobe` (sudah di `siap.py`). Cek frame MP4 hanya bila scene berubah setelah preview. Thumbnail: 1 putaran, baca `ohNN-cek.png` sekali.
9. **Keluaran alat dikecilkan:** gunakan `| tail -n`, jangan `cat` berkas besar, jangan baca ulang gambar yang tidak berubah.
- Catatan teknis (terukur 21 Nov 2026): waktu render didominasi menggambar frame (±0,7 dtk/frame, perender perangkat lunak); enkode PNG hanya ±32 ms dan 3 proses paralel hanya +33% throughput, jadi tidak dipakai. Penghematan datang dari **tidak merender sia-sia** dan **menulis lebih sedikit**, bukan dari mengubah tampilan.

## 8. Larangan
- Angka karangan atau hitungan yang tidak bisa dicek.
- Jawaban di thumbnail.
- Meniru judul atau gaya peta Geser Dikit.
- Durasi di luar 40–55 detik.
- Momen OHHIYAA! lebih dari sekali.
- Topik tanpa sumber primer, tanpa `ohspec.py` lolos, atau mengulang objek/patokan yang ditolak registri.
- Render ulang video penuh tanpa perubahan scene/mesin, memantau render dengan polling, atau menulis naskah/VO/thumb JSON manual.
- Menyerahkan paket yang tidak lolos `siap.py` (mis. 2 judul, 3 thumbnail, tanpa deskripsi), atau menyerahkan judul/deskripsi sebagai berkas .txt.
- Memakai format A/B/C terus-menerus, atau jawaban benar yang sama berurutan, atau menukar hasil `oh_format.py` secara manual.
- Alur yang sama persis dengan episode sebelumnya (hook → tebak → tangga → jawaban) tanpa mengikuti hasil acak.
