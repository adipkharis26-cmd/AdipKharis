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

## 4.2 Diagram Activity

Activity diagram menggambarkan urutan langkah di dalam sebuah use case, mulai dari tindakan pengguna sampai respons sistem. Setiap diagram dibagi menjadi dua lajur, yaitu lajur pengguna di kiri dan lajur sistem di kanan. Pada penelitian ini dibuat tiga activity diagram untuk use case utama yang mewakili setiap rumusan masalah. Seluruh activity diagram diawali dengan kondisi pengguna telah berhasil login.

### 4.2.1 Activity Diagram Catat Pengeluaran

Diagram ini mewakili rumusan masalah pertama, yaitu pencatatan transaksi per komoditas dan per musim tanam.

::gambar assets/03-activity-catat-pengeluaran.png | Gambar 4.2 Activity Diagram Catat Pengeluaran

Pencatat membuka menu Catat Pengeluaran, lalu sistem menampilkan formulir. Pencatat mengisi tanggal, jenis biaya, jumlah, sifat biaya (tunai atau diperhitungkan), dan tujuan biaya, yaitu musim tanam, petak pisang, atau biaya bersama. Setelah tombol Simpan ditekan, sistem memeriksa kelengkapan data. Jika belum lengkap, sistem menampilkan pesan dan pencatat kembali mengisi formulir. Jika sudah lengkap, data disimpan dan sistem menampilkan notifikasi berhasil.

### 4.2.2 Activity Diagram Update Harga Harian

Diagram ini mewakili rumusan masalah kedua, yaitu pencatatan harga jual harian sebagai acuan nilai jual.

::gambar assets/04-activity-update-harga.png | Gambar 4.3 Activity Diagram Update Harga Harian

Pemilik membuka menu Harga Harian, kemudian sistem menampilkan harga terakhir setiap komoditas. Pemilik mengisi harga dari pengepul hari itu dan menyimpannya. Sistem menyimpan harga beserta tanggalnya, lalu menghitung margin per kilogram dengan rumus (2.7). Jika harga lebih tinggi daripada HPP, sistem menampilkan status untung per kilogram. Jika tidak, sistem menampilkan peringatan bahwa harga berada di bawah modal.

### 4.2.3 Activity Diagram Lihat Laporan Laba Rugi

Diagram ini mewakili rumusan masalah ketiga, yaitu penyajian HPP, pendapatan, R/C ratio, dan laporan laba rugi.

::gambar assets/05-activity-laporan-laba-rugi.png | Gambar 4.4 Activity Diagram Lihat Laporan Laba Rugi

Pemilik membuka menu Laporan, lalu memilih komoditas dan periode. Sistem mengambil data pengeluaran, panen, dan penjualan, kemudian menghitung alokasi biaya bersama dengan rumus (2.8) serta menghitung TC, TR, pendapatan, R/C ratio, dan HPP. Laporan laba rugi kemudian ditampilkan. Apabila pemilik memilih untuk mencetak, sistem membuat file PDF yang dapat diunduh; apabila tidak, proses selesai.
