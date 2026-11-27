# Audit Celah Proyek (sudut pandang dosen penguji)

Status: ✅ sudah diperbaiki di draf · ⏳ menunggu data/keputusan · 📌 dikerjakan di bab berikutnya

## A. Celah substansi (paling sering ditanyakan penguji)

| No | Celah | Kenapa berbahaya | Perbaikan | Status |
|---|---|---|---|---|
| 1 | **Biaya bersama** (pajak lahan, alat) dipakai semua komoditas sepanjang tahun | HPP per komoditas tidak sah kalau biaya bersama tidak dibagi | Biaya dalam satu musim → langsung ke komoditas musim itu. Biaya bersama tahunan → dibagi ke petak utama & petak pisang sesuai luas, lalu bagian petak utama dibagi per musim tanam sesuai lama musim | ✅ |
| 2 | **Pola tanam bergiliran**: padi (musim sering hujan) lalu jagung (musim jarang hujan) di petak yang sama; pisang tahunan dengan panen bertahap | Kalau tidak dipisah per musim, biaya padi dan jagung tercampur | Sistem memakai entitas **Musim Tanam** (komoditas, tanggal mulai, tanggal panen) untuk padi/jagung; pisang memakai periode tahunan | ✅ |
| 3 | **Padi di lahan tegal** | Penguji bisa bertanya "padi kok di tegal?" | Padi yang mengikuti musim hujan di lahan kering = kemungkinan **padi gogo**; didukung Sahara dkk. (2022). Tetap dikonfirmasi ke bapak | ⏳ |
| 4 | **Biaya tunai vs biaya diperhitungkan**: bapak & ibu tidak digaji, buruh harian 2–5 orang dibayar tunai saat tanam & panen | Laba terlihat lebih besar dari sebenarnya kalau tenaga keluarga tidak dihitung | Buruh harian = biaya tunai; tenaga keluarga & penyusutan alat = biaya diperhitungkan. Sistem menyajikan **R/C atas biaya tunai** dan **atas biaya total** (Nirmala & Hardjanto, 2022) | ✅ |
| 5 | **Harga panen harian**: sumbernya dari mana? | Kalau tidak jelas, fitur dianggap mengada-ada | Pemilik menginput harga harian secara **manual** berdasarkan informasi harga dari **pengepul** (tempat hasil panen dijual); disimpan sebagai riwayat. Tidak terhubung otomatis ke sumber eksternal | ✅ |
| 6 | Untuk apa harga harian dipakai? | Fitur tanpa tujuan dianggap tempelan | Dibandingkan dengan **HPP per kg**: menampilkan selisih (margin per kg) dan perkiraan nilai stok panen saat ini → pendukung keputusan **kapan menjual** | ✅ |
| 7 | Keuangan rumah tangga bercampur dengan keuangan usaha | Disebut di latar belakang tetapi tidak ada solusinya | Batasan: sistem **hanya** mencatat transaksi usaha tani | ✅ |
| 8 | Sinyal internet di lahan bisa lemah | Klaim "input langsung di lahan" bisa dipertanyakan | Batasan: input membutuhkan koneksi internet; mode offline di luar cakupan | ✅ |
| 9 | Unsur **"Manajemen"** dalam SIM | Kalau sistem hanya mencatat, penguji bisa bilang "ini aplikasi pencatatan, bukan SIM" | Tekankan **informasi untuk keputusan**: perbandingan komoditas, R/C, HPP vs harga harian, laporan laba rugi periodik (Syahputra dkk., 2022) | ✅ |
| 10 | Kebaruan (*novelty*) dibanding penelitian terdahulu | Tanpa *research gap*, penelitian dianggap meniru | Paragraf gap di latar belakang + tabel penelitian terdahulu di BAB II | ✅ / 📌 |

## B. Celah konsistensi (dosen teliti biasanya mengecek ini)

| No | Cek | Perbaikan | Status |
|---|---|---|---|
| 11 | Jumlah rumusan masalah = jumlah tujuan = jumlah poin kesimpulan | 3 rumusan, 3 tujuan, nanti 3 kesimpulan | ✅ / 📌 |
| 12 | Kata "mobile" masih tersisa | Dihapus dari judul, rumusan, dan tujuan | ✅ |
| 13 | Aktor di batasan masalah = aktor di use case | Pemilik dan Pencatat; siapa pencatatnya dikonfirmasi ke bapak (pertanyaan no. 31) | ⏳ / 📌 |
| 13b | Kopi masih disebut di dokumen lama | Kopi dihapus dari objek; jurnal kopi hanya dipakai untuk konsep umum | ✅ |
| 14 | Setiap fitur di BAB IV harus punya dasar di BAB I atau II | Setiap fitur dipetakan ke rumusan masalah | 📌 |
| 15 | Metode Prototyping harus punya **evaluasi** | BAB III: evaluasi prototipe oleh pemilik lahan setiap iterasi (catatan revisi) | 📌 |
| 16 | Sitasi di teks = isi Daftar Pustaka | Semua sitasi lama yang tidak terverifikasi diganti | ✅ |
| 17 | Rumus di BAB II harus konsisten dengan yang dihitung sistem | TC, TR, π, R/C, HPP, BEP | 📌 |

## C. Celah format docx

| No | Celah | Status |
|---|---|---|
| 18 | Daftar Isi masih berisi materi E-Commerce | ⏳ diganti saat finalisasi docx |
| 19 | Daftar Pustaka masih berisi referensi E-Commerce (IEEE) | ✅ diganti dengan APA (lihat 02-referensi.md) |
| 20 | Sampul "Makalah" | ⏳ ganti menjadi "Laporan" |
| 21 | Typo "Harga Pokok Production" | ✅ |

## D. Data yang masih harus ditanyakan ke bapak

Lihat daftar lengkap di `05-pertanyaan-untuk-bapak.md` (33 pertanyaan).
