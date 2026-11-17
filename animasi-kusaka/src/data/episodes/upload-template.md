# Template Upload YouTube — KUSAKA (Terkunci)

Gunakan template ini untuk setiap episode Long dan Shorts baru.
Jangan ubah struktur atau urutan bagian tanpa menaikkan versi dan approval owner.

**Versi template:** v1.0.0

---

## FORMAT LONG (16:9, ≥ 6 menit)

### Deskripsi — struktur wajib

```
[Hook 1–2 kalimat: situasi utama Kusaka, konkret dan relatable]

[Konflik/masalah dalam 1–2 kalimat. Akhiri dengan pertanyaan atau cliffhanger.]

[CTA komentar — pilih salah satu pola di bawah] 👇

Chapters:
0:00 [nama adegan]
[dst...]

#animasiindonesia #kusaka #anaksekolah #komedi #animasilucu #kartunsekolah #animasi2d
```

**Pola CTA komentar (ganti sesuai episode, jangan ulangi pola yang sama 2 episode berturut):**
- "Kalian tim [X] atau tim [Y]? Tulis di kolom komentar! 👇"
- "Pernah ngalamin hal kayak gini? Cerita di bawah! 👇"
- "Menurut kalian [pertanyaan tentang plot]? Tebak di sini! 👇"
- "Siapa yang salah di sini, [X] atau [Y]? 👇"

**Aturan deskripsi Long:**
- Baris 1–2: hook langsung tanpa basa-basi (muncul sebelum tombol "more")
- Baris 3: konflik/pertanyaan
- Baris 4: CTA + emoji
- Baris kosong, lalu Chapters
- Hashtag di akhir, satu baris

---

### Tag — wajib (copy persis, tambah tag spesifik episode di belakang)

```
animasi indonesia, animasi lucu, kartun sekolah, anak sma, anak smp, komedi sekolah, kusaka,
kusaka design, animasi 2d, sitkom animasi, cerita sekolah, [2–4 tag spesifik episode]
```

**Contoh tag spesifik:**
- Eps traktir: `traktir gebetan, ulangan mendadak, guru bk`
- Eps kelompok: `kerja kelompok, tugas sekolah, belajar bareng`
- Eps absen: `nitip absen, bolos sekolah, ketahuan guru`

---

### Hashtag kolom (maks 3 tampil di atas judul — urutan ini wajib)

```
#animasiindonesia #kusaka #anaksekolah
```

---

## FORMAT SHORTS (9:16, 40 detik – 3 menit)

### Deskripsi — struktur wajib

```
[Hook 1 kalimat: situasi konyol/relatable, langsung ke inti] 😭

[Punchline atau eskalasi konflik dalam 1 kalimat.] 💀

[CTA komentar singkat] 👇

#shorts #animasiindonesia #kusaka #anaksekolah #komedilucu #animasisingkat
```

**Aturan deskripsi Shorts:**
- Maksimal 3 baris teks + hashtag (layar HP sempit)
- Emoji di akhir setiap baris teks (1 emoji saja, jangan berlebihan)
- Tidak ada Chapters (durasi terlalu pendek)
- CTA singkat, 1 baris

---

### Tag — wajib (copy persis, tambah tag spesifik di belakang)

```
animasi indonesia, animasi lucu, shorts, animasi shorts, kusaka, kusaka design,
kartun sekolah, komedi sekolah, [1–3 tag spesifik konten]
```

---

### Hashtag kolom (maks 3 tampil di atas judul — urutan ini wajib)

```
#shorts #animasiindonesia #anaksekolah
```

---

## ATURAN UMUM (berlaku untuk Long dan Shorts)

1. **Judul:** 3 pilihan wajib per episode untuk A/B test. Judul 1 = discovery, Judul 2 = share/relatable, Judul 3 = CTR eksperimen.
2. **Tidak ada angka episode di judul** (tidak ada "Eps. 1", "Episode 2", dll.) — algoritma tidak favoritkan serialisasi eksplisit.
3. **Tidak ada Rp / uang / angka nominal** di judul, deskripsi, atau thumbnail — dikunci di brand.json.
4. **Deskripsi tidak boleh lebih dari 5000 karakter** (batas YouTube).
5. **Hashtag di deskripsi:** selalu di baris paling akhir, satu baris, tidak diulang di body teks.
6. **CTA komentar:** selalu ada, selalu 1 kalimat, selalu pakai emoji 👇 di akhir.
7. **Chapters (Long only):** mulai dari 0:00, nama adegan singkat (maks 4 kata), minimal 3 chapter.
8. **File upload:** simpan di `src/data/episodes/<id>-upload.md`, commit bersama atau setelah MP4 release.
