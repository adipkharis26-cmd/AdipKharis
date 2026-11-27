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

Activity diagram memperlihatkan alur kerja di dalam sebuah use case secara berurutan, dari tindakan pengguna hingga tanggapan sistem. Setiap diagram dibagi menjadi dua lajur: lajur kiri berisi kegiatan pengguna, sedangkan lajur kanan berisi proses yang dijalankan sistem. Penelitian ini menyajikan empat activity diagram, yaitu login sebagai pintu masuk sistem dan tiga diagram lain yang masing-masing menjawab satu rumusan masalah.

### 4.2.1 Activity Diagram Login

Login menjadi langkah awal sebelum pengguna dapat memakai fungsi lain di dalam sistem.

::gambar assets/06-activity-login.png | Gambar 4.2 Activity Diagram Login

Pengguna membuka halaman login lalu memasukkan nama pengguna dan kata sandi. Sistem mencocokkan data tersebut dengan data yang tersimpan. Bila tidak cocok, sistem memberi tahu bahwa login gagal dan pengguna diminta mengisi ulang. Bila cocok, sistem membuka dashboard yang menunya disesuaikan dengan peran pengguna, yaitu Pemilik atau Pencatat.

### 4.2.2 Activity Diagram Catat Pengeluaran

Diagram ini menjawab rumusan masalah pertama tentang pencatatan transaksi per komoditas dan per musim tanam.

::gambar assets/03-activity-catat-pengeluaran.png | Gambar 4.3 Activity Diagram Catat Pengeluaran

Alur dimulai ketika pencatat memilih menu Catat Pengeluaran dan sistem menyiapkan formulir isian. Pencatat kemudian melengkapi tanggal, jenis biaya, nominal, sifat biaya (tunai atau diperhitungkan), serta tujuan pembebanannya, yakni musim tanam, petak pisang, atau biaya bersama. Saat tombol Simpan ditekan, sistem memeriksa apakah semua isian sudah terisi. Isian yang belum lengkap membuat sistem menampilkan pemberitahuan dan pencatat kembali ke formulir, sedangkan isian yang lengkap langsung disimpan lalu sistem menampilkan pesan berhasil.

### 4.2.3 Activity Diagram Update Harga Harian

Diagram ini menjawab rumusan masalah kedua tentang pencatatan harga jual harian sebagai acuan nilai jual.

::gambar assets/04-activity-update-harga.png | Gambar 4.4 Activity Diagram Update Harga Harian

Pemilik memilih menu Harga Harian, lalu sistem memperlihatkan harga terakhir yang tercatat untuk padi, jagung, dan pisang. Pemilik memasukkan harga yang diperoleh dari pengepul pada hari itu kemudian menyimpannya. Sistem merekam harga tersebut bersama tanggalnya dan menghitung selisihnya terhadap HPP menggunakan rumus (2.7). Apabila harga berada di atas HPP, sistem menampilkan besar keuntungan per kilogram; apabila berada di bawahnya, sistem memberikan peringatan bahwa harga belum menutup modal.

### 4.2.4 Activity Diagram Lihat Laporan Laba Rugi

Diagram ini menjawab rumusan masalah ketiga tentang penyajian HPP, pendapatan, R/C ratio, dan laporan laba rugi.

::gambar assets/05-activity-laporan-laba-rugi.png | Gambar 4.5 Activity Diagram Lihat Laporan Laba Rugi

Pemilik memilih menu Laporan dan menentukan komoditas serta periode yang ingin dilihat. Sistem lalu mengumpulkan data pengeluaran, panen, dan penjualan pada periode itu, membagi biaya bersama dengan rumus (2.8), serta menghitung TC, TR, pendapatan, R/C ratio, dan HPP. Hasil perhitungan ditampilkan dalam bentuk laporan laba rugi. Pemilik dapat memilih untuk mencetak laporan, sehingga sistem membuat file PDF untuk diunduh, atau langsung mengakhiri proses tanpa mencetak.
