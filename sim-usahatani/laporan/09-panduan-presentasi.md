# Panduan Presentasi — Cara Menjelaskan Proyek Ini

> Untuk dibaca sendiri, **bukan** bagian laporan. Angka di bagian contoh adalah **ilustrasi** untuk latihan, bukan data lahan bapak.

## 1. Cerita 1 menit (hafalkan alurnya, bukan kalimatnya)

1. **Masalah:** Bapak menanam padi dan jagung bergantian di lahan tegal, plus sedikit pisang. Pengeluaran tidak dicatat rinci, jadi bapak tidak tahu musim mana yang paling untung, dan tidak punya pegangan saat pengepul menawar harga.
2. **Kenapa sulit:** ada 3 hal yang bikin hitungan manual ribet — biaya per musim harus dipisah, ada biaya yang dipakai bersama (pajak, alat), dan tenaga keluarga tidak dibayar tapi tetap "biaya".
3. **Solusi:** web yang bisa dibuka di HP. Pencatat mengisi pengeluaran, panen, dan penjualan. Pemilik mengisi harga harian dari pengepul. Sistem menghitung otomatis HPP, R/C, dan laba rugi.
4. **Bedanya dengan penelitian lain:** penelitian lain fokus satu komoditas atau kelompok tani. Ini fokus **satu lahan, banyak komoditas, tanam bergiliran**, dan **membandingkan harga harian dengan HPP**.
5. **Metode:** prototyping — rancangan dibuat cepat, dicoba bapak, diperbaiki, sampai cocok.

## 2. Istilah penting dengan bahasa sederhana

| Istilah | Penjelasan gampang | Contoh ilustrasi |
|---|---|---|
| Biaya tetap (FC) | Biaya yang besarnya sama walau panen banyak/sedikit | Pajak lahan, penyusutan cangkul |
| Biaya variabel (VC) | Biaya yang naik-turun mengikuti produksi | Benih, pupuk, upah buruh |
| TC | Total semua biaya | FC + VC |
| TR | Uang yang diterima dari penjualan | 1.000 kg × Rp6.000 = Rp6.000.000 |
| Pendapatan (π) | Untung bersih | TR − TC |
| R/C | Setiap Rp1 modal, kembali berapa rupiah | TR Rp6 jt ÷ TC Rp4 jt = 1,5 → layak (>1) |
| R/C tunai vs total | Tunai = hanya yang dibayar uang. Total = ditambah tenaga keluarga & penyusutan | R/C tunai biasanya lebih besar — kelihatan lebih untung |
| HPP | Modal per 1 kg hasil panen | TC Rp4.000.000 ÷ 1.000 kg = Rp4.000/kg |
| BEP produksi | Minimal harus panen berapa kg supaya tidak rugi | TC Rp4 jt ÷ harga Rp6.000 = 667 kg |
| Margin per kg | Harga pengepul hari ini dikurangi HPP | Rp6.000 − Rp4.000 = untung Rp2.000/kg |

## 3. Contoh pembagian biaya bersama (rumus 2.8) — pasti ditanya

Ilustrasi: lahan 2.000 m² (petak utama 1.800 m², pisang 200 m²). Biaya bersama setahun Rp600.000. Dalam setahun: musim padi 4 bulan, musim jagung 3 bulan (sisanya lahan kosong/bera). Jadi T petak utama = 4 + 3 = 7 bulan.

| Bagian | Hitungan | Hasil |
|---|---|---|
| Musim padi | 600.000 × (1.800/2.000) × (4/7) | Rp308.571 |
| Musim jagung | 600.000 × (1.800/2.000) × (3/7) | Rp231.429 |
| Pisang | 600.000 × (200/2.000) × (12/12) | Rp60.000 |
| **Jumlah** | | **Rp600.000** ✓ habis terbagi |

Kalau dosen tanya *"kenapa dibagi T, bukan 12?"* → jawab: kalau dibagi 12, biaya saat lahan kosong (5 bulan) tidak masuk ke komoditas mana pun, sehingga HPP jadi terlalu kecil.

## 4. Cara menjelaskan Use Case Diagram

- **Aktor** = orang yang memakai sistem (gambar orang lidi). Ada 2: Pencatat dan Pemilik.
- **Panah segitiga kosong dari Pemilik ke Pencatat** = generalisasi: "Pemilik bisa semua yang Pencatat bisa, plus menu pengelolaan."
- **Elips** = fungsi sistem. **Kotak besar** = batas sistem.
- **«include»** = pasti dijalankan. Buka laporan → sistem **pasti** menghitung HPP & R/C.
- **«extend»** = pilihan. Buka laporan → **boleh** dicetak, boleh tidak.
- Arah panah: include dari use case utama ke yang di-include; extend dari use case pilihan ke use case utama.

## 5. Pertanyaan dosen yang mungkin muncul + jawaban

| Pertanyaan | Jawaban singkat |
|---|---|
| Kenapa prototyping, bukan waterfall? | Pengguna (bapak) belum terbiasa aplikasi. Dengan prototyping, bapak bisa mencoba rancangan dulu dan memberi masukan sebelum dibuat final. |
| Kenapa web, bukan aplikasi Android? | Cukup buka browser di HP, tidak perlu instal, dan satu rancangan bisa dipakai di HP maupun laptop. |
| Padi kok di tegal? | Padinya mengikuti musim hujan (tadah hujan), jenisnya padi gogo *(konfirmasi ke bapak)*. |
| Harga harian dari mana? | Diinput manual oleh pemilik dari info pengepul. Sengaja tidak otomatis karena harga di tingkat pengepul desa tidak tersedia di sumber online. |
| Apa bedanya dengan aplikasi pencatatan biasa? | Ada unsur **manajemen**: informasi untuk keputusan — musim mana lebih untung, dan apakah harga pengepul hari ini sudah di atas modal. |
| Tenaga bapak dihitung? | Ya, sebagai biaya diperhitungkan. Karena itu ada dua R/C: atas biaya tunai dan atas biaya total. |
| Kalau di lahan tidak ada sinyal? | Sudah dibatasi di batasan masalah: input butuh internet; mode offline di luar cakupan. Bisa dicatat setelah ada sinyal. |
| Kenapa ada dua aktor, padahal usaha keluarga? | Pemilik bisa menugaskan anggota keluarga mencatat di lahan tanpa memberi akses mengubah data induk dan pengguna. |

## 6. Tips saat presentasi

- Buka dengan **foto lahan bapak** (kalau ada) — langsung membangun konteks.
- Saat menjelaskan rumus, pakai **tabel ilustrasi di atas**, bukan membaca rumus.
- Tunjukkan **prototipe Figma di HP** — klik alur "catat pengeluaran" lalu "lihat laporan".
- Kalau tidak tahu jawabannya: "Itu menjadi saran untuk pengembangan selanjutnya" — lalu catat.
