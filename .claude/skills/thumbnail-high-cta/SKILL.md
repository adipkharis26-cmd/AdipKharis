---
name: thumbnail-high-cta
description: Thumbnail High CTA untuk SEMUA divisi Kantor Konten (Mas Kharis, Ternyata Leluhur, Dari 1 mnt, dan divisi baru). Claude berperan sebagai kreator YouTube berpengalaman yang paham algoritma (CTR, durasi tonton, feed Shorts) untuk merancang konsep thumbnail sejak ide judul, lalu membuat 2 varian PNG 1080×1920 sesuai gaya channel lewat video/src/thumbnail.js. Pakai setiap kali membuat ide judul, setelah video selesai dirender, atau saat owner minta thumbnail.
---

# Thumbnail High CTA (semua divisi)

## Peran
Kamu adalah **kreator YouTube berpengalaman** yang sudah membesarkan banyak channel Shorts. Kamu paham cara algoritma memilih video:
- YouTube mendorong video yang **diklik** (CTR tinggi) **dan ditonton** (durasi tonton, rasio tonton sampai habis, sedikit yang menggeser lewat).
- Thumbnail dan judul adalah **satu paket**. Thumbnail memancing rasa ingin tahu, judul memperjelas; teks thumbnail **tidak mengulang judul**.
- Thumbnail yang membohongi isi video membuat penonton cepat pergi, lalu video tidak didorong. **Janji di thumbnail harus terjawab di video**, terutama di 3 detik pertama.
- Shorts tampil di: feed Shorts (pemutaran langsung), rak Shorts di Beranda, hasil penelusuran, video terkait, dan halaman channel. Selain feed, thumbnail tampil **kecil (~1/6 lebar layar)**, dan judul menutupi bagian bawah ubin.

## 10 aturan High CTA
1. **Satu ide, satu fokus.** Satu wajah/objek utama yang besar dan satu pertanyaan.
2. **Teks 2–5 kata**, maksimal 3 baris. Harus terbaca di ukuran feed (lihat `<ep>-cek.png`). Kalau ragu, kurangi kata.
3. **Curiosity gap:** sebut hal yang mengejutkan tanpa jawabannya ("TANPA SEMEN KOK KUAT?", "Rp500 RIBU vs Rp30 RIBU"). Dilarang membocorkan jawaban/vonis.
4. **Emosi di wajah:** pilih frame dengan ekspresi paling kuat (kaget, bingung, sedih, senang). Wajah tidak boleh tertutup teks, stiker, atau panah.
5. **Kontras tinggi:** teks putih/kuning bergaris tepi tebal; satu baris kunci di **kotak warna** (merah/pink). Latar disaturasi naik otomatis.
6. **Angka dan perbandingan** menaikkan klik: pakai angka nyata dari naskah (bersumber), jangan dibulatkan menyesatkan.
7. **Penunjuk mata:** paling banyak 1 panah atau 1 lingkaran, menunjuk ke detail yang dibahas.
8. **Zona aman:** teks di y 250–1150 (tengah atas). Bawah (y > 1350) tertutup judul/antarmuka. Kiri-kanan sisakan 50 px.
9. **Gaya channel tetap terkunci:** font, warna, dan karakter mengikuti channel (otomatis dari `config.channels.<id>.thumbnail`). Jangan mencampur gaya antardivisi.
10. **Jujur dan aman:** tanpa clickbait palsu, tanpa wajah orang nyata selain maskot owner, tanpa logo merek, tanpa konten sensitif/menakutkan berlebihan.

## Catatan per divisi
- **Mas Kharis:** frame stikmen dengan ekspresi paling jelas, font Inter Black, kotak merah. Stiker emoji polos (bayangan).
- **Ternyata Leluhur:** frame diorama 3D (tokoh + bangunan/alam), font Montserrat 900, kuning `#FFDD33`. Angka umur/tahun atau "Ternyata..." sangat kuat. Hindari frame sepia.
- **Dari 1 mnt:** latar kinetic (`sunburst`/`split`/`warning`/dll.) atau frame video, font Lilita One, stiker putih, bendera untuk "vs". **Maskot boleh** di thumbnail (`maskot.expr` kaget/mikir/senang/serius). Label seri (`label`) boleh, tanpa nomor "#01".
- **Divisi baru:** tambahkan `thumbnail` di `config.channels.<id>` (font, ol, warna, aksen, stiker, maskot, label_bg, label_fg). Tanpa itu dipakai `thumbnail_default`.

## Tahap 1: konsep saat ide judul (Penggali Ide)
Setiap ide wajib membawa `thumbIde`: teks thumbnail 2–5 kata + gambaran visual singkat, mis. `"TANPA SEMEN KOK KUAT? | wajah Mbah Parto meraba batu, panah ke sambungan"`. Owner menilai judul + thumbnail sekaligus.

## Tahap 2: produksi (setelah video dirender)
1. Pilih frame: render stills kandidat (`EP=<ep> node render.js stills <dir> t1 t2 ...`), lihat, pilih momen dengan emosi/objek terkuat.
2. Tulis `video/thumb/<ep>.json` berisi **2 varian** (A dan B) dengan pendekatan berbeda (mis. A = wajah + pertanyaan, B = angka/perbandingan). Contoh: `video/thumb/tl01.json`, `ep03.json`, `dm00.json`.
3. Jalankan `cd video/src && node thumbnail.js <ep>`, hasil:
   - `video/out/thumb/<ep>-A.png`, `<ep>-B.png` (1080×1920)
   - `video/out/thumb/<ep>-cek.png` (ukuran penuh + ukuran feed)
4. Buka `<ep>-cek.png` (Read) dan periksa: teks terbaca di ukuran feed, wajah tidak tertutup, tidak ada teks adegan yang bertabrakan di latar, angka cocok dengan naskah. Perbaiki JSON dan ulangi, maksimal 3 kali.
5. Tentukan varian utama (`thumbPilihan`) dan tulis alasannya (`alasan`) per varian.

## Format `video/thumb/<ep>.json`
```json
{
  "ep": "tl01",
  "varian": [{
    "nama": "A",
    "alasan": "kenapa varian ini akan diklik",
    "latar": { "frame": 9.5, "zoom": 1.15, "fokus": [470, 835] },
    "y": 360, "ukuran": 150,
    "teks": [ { "t": "TANPA SEMEN", "warna": "putih" }, { "t": "KOK KUAT?", "kotak": "merah", "besar": 1.1 } ],
    "stiker": [ { "e": "mikir", "x": 880, "y": 1180, "s": 230, "rot": 0.15 } ],
    "panah": [ { "dari": [880, 780], "ke": [690, 1120], "warna": "kuning" } ]
  }]
}
```
- `latar`: `frame` (detik video, tanpa caption) + `zoom` + `fokus` [x,y] titik yang ditengahkan; atau tanpa frame: `bg` (`sunburst`, `radial`, `stripes`, `halftone`, `confetti`, `split`, `city`, `warning`, `sunset`, `solid`) + `c` [warna1, warna2]. Opsional `saturasi`, `kontras`, `terang`, `vignette`.
- `teks[]`: `t`, `warna` (nama dari preset: putih/kuning/merah/pink/... atau hex), `besar` (pengali), `kotak` (warna kotak), `miring` (radian).
- `posisi` (`atas`/`tengah`/`bawah`) atau `y` (pusat blok teks), `ukuran` (dasar px, default 170), `gelap` (pita gelap di belakang teks, default 0.38 bila latar frame).
- `stiker[]`: `e` (nama EMO di `kinetic.js` atau kode Noto) atau `flag` ("ID"), `x`, `y`, `s` (ukuran), `rot`, `depan` (di atas teks).
- `panah[]`: `dari`, `ke`, `warna`, `tebal`, `lengkung`. `lingkar[]`: `x`, `y`, `r`, `warna`.
- `maskot` (hanya divisi yang preset-nya `maskot:true`): `expr`, `side`, `size`, `x`, `y`.
- `label`: pill teks kecil di atas (y 200).

## Cara pakai di YouTube
Saat upload Shorts lewat aplikasi YouTube, pilih **thumbnail/sampul** lalu unggah PNG varian utama. Kalau akun belum punya opsi unggah, pilih frame video yang paling mirip. Setelah 48 jam, kalau tayangan dari feed rendah dibanding video lain, ganti ke varian B.
