# Branding Channel: KUSAKA DESIGN (🔒 TERKUNCI, brand v1.0.0)

Aset resmi: `logo-kusaka-design.png` (Logo 2), `banner-youtube-2560x1440.png` (Banner 3), `thumbnails/`.
Dibuat ulang dengan `npm run brand`. Aturan brand dikunci di `src/branding/brand.json`.

## Identitas
| | |
|---|---|
| **Nama channel** | Kusaka Design |
| **Handle** (YouTube, TikTok, Instagram) | `@kusakadesign`. Kalau sudah dipakai orang lain: `@kusaka.design` atau `@kusakadesign.id` |
| **Tagline** | Animasi lokal, ketawanya universal. |
| **Palet** | Kuning `#ffd23f`, Merah `#e63946`, Hitam `#1b1b1b`, Biru `#2f7fd8`, Kertas `#fdf6e3` |
| **Font** | Bangers (judul/thumbnail), Baloo 2 ExtraBold (subtitle/teks) |

---

## Bio TikTok (78/80 karakter)
```
Animasi komedi anak sekolah 🎒
Kusaka: bokek tapi pede 😭
Eps baru tiap minggu 👇
```
Link di bio: video YouTube terbaru, atau playlist Musim 1.

## Bio Instagram (129/150 karakter)
```
🎬 Animasi komedi sekolah & keluarga
😭 Kusaka: bokek, telat, tapi pede
📺 Episode lengkap di YouTube: Kusaka Design
👇 Tonton Eps. 1
```
Kategori akun: *Video Creator*. Sorotan (highlights): Pemeran · Behind the Scene · Episode.

## Deskripsi channel YouTube (732/1000 karakter)
```
Selamat datang di KUSAKA DESIGN! 🎒

Animasi komedi 2D tentang Kusaka, anak SMA yang selalu bokek, sering telat, tapi pedenya selangit. Bareng Ujang (sahabat paling sarkas), Nadia (ketua kelas yang ditaksir diam-diam), Dinda (adik tukang ngadu), Pak Darto (guru BK), dan teman-teman lainnya, setiap hari di SMA Nusantara selalu berakhir kacau.

Cerita relate buat anak SMP, SMA, sampai mahasiswa: telat upacara, ulangan mendadak, utang di warung, gebetan, sampai drama keluarga di rumah.

📺 Episode panjang setiap minggu + Shorts lucu di sela-selanya
🔔 Subscribe dan nyalakan lonceng biar nggak ketinggalan kayak dompet Kusaka
💬 Kalian tim Kusaka atau tim Ujang? Tulis di komentar!

Kusaka Design: animasi lokal, ketawanya universal.
```
Kata kunci channel (Setelan → Channel): `animasi indonesia, animasi lucu, kartun sekolah, anak sma, komedi, kusaka`

---

## Logo resmi: Logo 2 "Lencana" ✅
Kusaka tertawa di lingkaran kuning, cincin merah bertuliskan **KUSAKA DESIGN** (800×800 px, aman dipotong lingkaran).
Dipakai untuk **foto profil YouTube, TikTok, Instagram** dan watermark video YouTube
(Setelan → Branding → Watermark video).

---|---|---|---|
| **1. Maskot** ⭐ | Wajah Kusaka (senyum miring) di atas sinar kuning | Paling mudah dikenali di ukuran kecil (foto profil 98 px, ikon komentar). Wajah = karakter = brand. | **Foto profil YouTube, TikTok, Instagram** |
| 2. Lencana | Kusaka tertawa di lingkaran kuning, cincin merah bertuliskan KUSAKA DESIGN | Lengkap dengan nama, cocok untuk merchandise dan intro/outro | Watermark video (pojok), stiker, merchandise |
| 3. Monogram "K" | Huruf K merah dengan rambut jabrik + plester | Minimalis dan modern, tahan untuk ukuran sangat kecil | Favicon, watermark kecil, avatar alternatif |

Logo 2 dipakai konsisten di semua platform (foto profil) dan sebagai watermark video YouTube.

---

## Banner YouTube (2560×1440 px, maks 6 MB)
| Perangkat | Area yang terlihat | Isi di area itu |
|---|---|---|
| TV | Seluruh 2560×1440 | Latar penuh: sinar + halftone komik |
| Desktop | 2560×423 (pita tengah) | Panel komik pemeran di kiri & kanan |
| Tablet | 1855×423 | Maskot + logo kata + sebagian panel |
| **HP & area aman** | **1546×423 (tengah)** | **Maskot Kusaka + KUSAKA DESIGN + label singkat** |

Teks banner dibuat **singkat tapi jelas**: hanya **KUSAKA DESIGN** + label **ANIMASI KOMEDI SEKOLAH**.

- **Banner 3 "Panel Komik"** ✅ DIPILIH: latar kuning bersinar + halftone, maskot di lingkaran, logo kata dengan
  mahkota rambut jabrik, panel komik miring berisi Dinda, Nadia, Ujang, Pak Darto.
- `banner-guide-JANGAN-DIUNGGAH.png` hanya untuk mengecek area.
- Banner **dikunci** sebagai aset brand (tidak diubah tanpa perintah pemilik).

---

## Sistem thumbnail (v1.2.0): identitas tetap, komposisi berbeda tiap episode
**Tetap (agar dikenali di beranda/halaman saran):** bingkai kuning + hitam, judul Bangers (putih/kuning, outline hitam, bayangan merah),
Kusaka dengan ekspresi ekstrem, maksimal 4 kata, tanpa nomor episode, pojok kanan bawah kosong, tanpa uang/Rp.
**Berubah tiap episode (agar tidak terlihat seperti video yang sama):** pola latar (`pattern`: rays / halftone / speed / stripes),
layar terbelah diagonal (`split`), sorotan lingkaran + panah merah (`callout`), properti cerita (dompet, bendera terbalik, dll.),
warna dominan, sudut/posisi teks (`textRot`, `textX`), ukuran dan posisi Kusaka (dekat / kecil / di sisi). Varian A/B/C tiap episode
juga sengaja berbeda komposisi. Eps. 1–2 tidak diubah.

Aturan dasar (berlaku untuk semua episode):
1. **Bingkai kuning** + garis hitam di tepi.
2. **Tanpa nomor episode / lencana EPS**: teks di thumbnail hanya judul (berlaku untuk semua episode).
3. **Teks 2 baris, maksimal 4 kata**: baris 1 putih, baris 2 kuning, outline hitam tebal, bayangan merah, miring −4°.
4. **Wajah karakter besar** (±40–60% tinggi frame) dengan ekspresi ekstrem, menghadap ke teks.
5. **Warna latar per varian** (merah / biru / kuning) di atas set lokasi episode yang terkunci.
6. **Pojok kanan bawah dikosongkan** (tertutup label durasi).
7. Satu **properti cerita** (misalnya dompet) sebagai rasa penasaran. **Dilarang memakai uang / mata uang (Rp)**
   di thumbnail, berlaku untuk semua episode berikutnya.

Setiap episode dibuat **3 varian** untuk fitur **Test & Compare** di YouTube Studio (YouTube memilih
pemenang berdasarkan *watch time share*). Konfigurasi per episode ada di `src/branding/thumbnails.json`,
render dengan `npm run brand -- eps02` (hanya thumbnail episode itu).

### Eps. 1 "Operasi Traktir Nadia"
| Varian | Teks | Isi | Sudut psikologis |
|---|---|---|---|
| A ⭐ | DOMPETKU MANA?! | Kusaka kaget, dompet kosong, Nadia bingung | Rasa penasaran + relate (semua pernah lupa dompet) |
| B | KALAH SAMA KAKEL?! | Kusaka memohon vs Bimo senyum pede (tanpa uang) | Rivalitas & gengsi |
| C | SENIN TERSIAL! | Kusaka & Pak Darto sama-sama kaget di gerbang | Relate pelajar (hari Senin) |

Judul pasangan untuk varian A: *"Mau Traktir Gebetan yang Ulang Tahun, Dompet Malah Ketinggalan 😭 | Kusaka Eps. 1"*
(teks thumbnail tidak mengulang judul: thumbnail = emosi, judul = konteks).
