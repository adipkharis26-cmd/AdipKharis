# BAB IV PERANCANGAN SISTEM

## 4.1 Diagram Use Case

Use case diagram menggambarkan siapa saja pengguna sistem dan fungsi apa saja yang dapat mereka jalankan. Sistem ini memiliki dua aktor, yaitu Pencatat dan Pemilik, seperti terlihat pada Gambar 4.1.

::gambar assets/02-use-case.png | Gambar 4.1 Use Case Diagram Sistem Informasi Manajemen Keuangan Usaha Tani

Aktor Pemilik dihubungkan ke Pencatat dengan garis generalisasi (panah segitiga kosong). Artinya, Pemilik dapat menjalankan semua fungsi Pencatat dan memiliki fungsi tambahan untuk pengelolaan dan pelaporan. Penjelasan setiap aktor disajikan pada Tabel 4.1.

::tabel Tabel 4.1 Deskripsi Aktor

| No | Aktor | Peran | Deskripsi |
|---|---|---|---|
| 1 | Pencatat | Pengguna lapangan | Mencatat pengeluaran, hasil panen, dan penjualan langsung dari lahan melalui ponsel. |
| 2 | Pemilik | Pengelola usaha tani | Mengelola data petak, musim tanam, harga harian, dan pengguna, serta melihat dashboard dan laporan laba rugi. |

Penjelasan setiap use case disajikan pada Tabel 4.2.

::tabel Tabel 4.2 Deskripsi Use Case

| No | Use Case | Aktor | Deskripsi |
|---|---|---|---|
| 1 | Login | Pencatat, Pemilik | Masuk ke sistem menggunakan nama pengguna dan kata sandi. |
| 2 | Catat Pengeluaran | Pencatat, Pemilik | Mencatat biaya seperti benih, pupuk, pestisida, dan upah buruh. Setiap biaya diberi jenis (tunai atau diperhitungkan) dan dikaitkan ke musim tanam, petak pisang, atau biaya bersama. |
| 3 | Catat Hasil Panen | Pencatat, Pemilik | Mencatat jumlah panen (kg) pada musim tanam atau petak pisang. |
| 4 | Catat Penjualan ke Pengepul | Pencatat, Pemilik | Mencatat jumlah yang dijual, harga per kg, dan nama pengepul. |
| 5 | Kelola Petak Lahan | Pemilik | Mengisi luas petak utama dan petak pisang sebagai dasar pembagian biaya bersama. |
| 6 | Kelola Musim Tanam | Pemilik | Membuka musim tanam baru (padi atau jagung) beserta tanggal mulai, lalu menutupnya setelah panen. |
| 7 | Update Harga Harian | Pemilik | Memasukkan harga beli dari pengepul pada hari itu untuk setiap komoditas. |
| 8 | Kelola Pengguna | Pemilik | Menambah, mengubah, atau menghapus akun Pencatat. |
| 9 | Lihat Dashboard | Pemilik | Melihat ringkasan biaya musim berjalan, harga hari ini, dan selisihnya dengan HPP. |
| 10 | Lihat Laporan Laba Rugi | Pemilik | Melihat penerimaan, biaya, pendapatan, R/C ratio, dan HPP per komoditas atau per musim tanam. |
| 11 | Hitung HPP, R/C, dan Alokasi Biaya Bersama | Sistem (include) | Proses otomatis yang selalu dijalankan saat dashboard atau laporan dibuka, menggunakan rumus (2.1)–(2.8). |
| 12 | Cetak Laporan | Pemilik (extend) | Fungsi pilihan untuk mengunduh laporan laba rugi dalam bentuk PDF. |

Relasi «include» menunjukkan proses yang **selalu** dijalankan, sedangkan «extend» menunjukkan proses **pilihan**. Perhitungan HPP dan R/C selalu dilakukan setiap kali dashboard atau laporan dibuka, sedangkan mencetak laporan hanya dilakukan apabila pemilik membutuhkannya.
