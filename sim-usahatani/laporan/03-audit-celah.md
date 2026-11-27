# Audit Celah Proyek (sudut pandang dosen penguji)

Status: ✅ sudah diperbaiki di draf · ⏳ menunggu data/keputusan · 📌 dikerjakan di bab berikutnya

## A. Celah substansi (paling sering ditanyakan penguji)

| No | Celah | Kenapa berbahaya | Perbaikan | Status |
|---|---|---|---|---|
| 1 | **Biaya bersama** (sewa/pajak lahan, cangkul, sprayer, upah bersih lahan) dipakai oleh 4 komoditas sekaligus | HPP per komoditas jadi tidak sah kalau biaya bersama tidak dibagi | Biaya bersama dialokasikan **proporsional luas petak** tiap komoditas; dicatat di batasan masalah | ✅ |
| 2 | **Siklus berbeda**: padi & jagung = tanaman semusim; pisang & kopi = tanaman tahunan | "Laba rugi per musim tanam" tidak berlaku untuk kopi dan pisang | Sistem memakai konsep **periode** per komoditas: semusim → per musim tanam, tahunan → per tahun | ✅ |
| 3 | **Padi di lahan tegal** (lahan kering) | Penguji bisa bertanya "padi kok di tegal?" | Kemungkinan besar **padi gogo**; perlu dikonfirmasi ke bapak | ⏳ |
| 4 | **Biaya tunai vs biaya diperhitungkan** (tenaga kerja keluarga, penyusutan alat) | Laba terlihat lebih besar dari sebenarnya kalau hanya biaya tunai | Sistem menyajikan **R/C atas biaya tunai** dan **R/C atas biaya total**, mengikuti Nirmala & Hardjanto (2022) | ✅ |
| 5 | **Harga panen harian**: sumbernya dari mana? | Kalau tidak jelas, fitur dianggap mengada-ada | Pemilik menginput harga harian secara **manual** berdasarkan harga di tingkat pengepul atau pasar setempat; disimpan sebagai riwayat. Tidak terhubung otomatis ke sumber eksternal | ✅ |
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
| 13 | Aktor di batasan masalah = aktor di use case | Pemilik dan Pencatat | ✅ / 📌 |
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

- [ ] Luas lahan total dan pembagian luas petak per komoditas (**wajib** untuk alokasi biaya bersama)
- [ ] Frekuensi panen per komoditas per tahun
- [ ] Cara pencatatan selama ini
- [ ] Jenis padi (gogo atau bukan)
- [ ] Jenis kopi (robusta atau arabika)
- [ ] Panen dijual ke mana (pengepul, pasar, atau tengkulak) → sumber harga harian
- [ ] Siapa yang bekerja: keluarga saja atau ada buruh harian
