# BAB I PENDAHULUAN

> Draf v3 (ringkas). Bagian bertanda **[isi nanti]** menunggu hasil wawancara dengan pemilik lahan (lihat `05-pertanyaan-untuk-bapak.md`).

## 1.1 Latar Belakang

Catatan keuangan merupakan alat penting bagi petani untuk mengendalikan biaya dan mengetahui hasil usahanya (Septiadi dkk., 2021). Namun, banyak petani masih mengandalkan perkiraan dan hanya menghitung uang yang keluar serta masuk, sehingga besar pendapatan yang sebenarnya tidak diketahui (Dolorosa dkk., 2024; Nurcahya dkk., 2022). Catatan yang dibuat secara manual juga mudah hilang, tidak tersusun rapi, dan rawan salah hitung ketika menentukan laba atau rugi (Hidayat & Warnaen, 2026; Siswanto dkk., 2023).

Kondisi tersebut juga terjadi di Lahan Tegal Miring, Desa Sidomulyo, Kabupaten Batang, dengan luas **[isi nanti]**. Petak utama lahan ditanami padi ketika musim hujan dan jagung ketika curah hujan rendah secara bergantian, sedangkan sebagian kecil lahan di sisinya ditanami pisang sebagai pelengkap. Pekerjaan dilakukan oleh pemilik dengan bantuan keluarga, ditambah 2–5 buruh harian pada saat tanam dan panen, lalu hasil panen dijual kepada pengepul. Selama ini pengeluaran dicatat dengan cara **[isi nanti]**, sehingga pemilik sulit membedakan biaya setiap musim tanam, membagi biaya yang dipakai bersama, dan memperhitungkan tenaga kerja keluarga yang tidak dibayar. Akibatnya, pemilik tidak mengetahui secara pasti musim tanam mana yang lebih menguntungkan.

Untuk menilai keuntungan, usaha tani perlu dianalisis melalui total biaya, penerimaan, pendapatan, dan R/C ratio (Ingesti & Saragih, 2025), serta harga pokok produksi (HPP) per kilogram (Rahmah dkk., 2024). Analisis ini memungkinkan perbandingan antarkomoditas, misalnya padi dan jagung pada lokasi yang sama (Rayhan dkk., 2024). Di sisi lain, posisi tawar petani terhadap pembeli masih lemah (Johan dkk., 2022). Oleh karena itu, harga dari pengepul perlu dicatat setiap hari dan dibandingkan dengan HPP agar pemilik memiliki dasar ketika memutuskan waktu dan harga jual.

Sistem Informasi Manajemen (SIM) dapat menyajikan informasi yang akurat dan tepat waktu sebagai dasar pengambilan keputusan (Syahputra dkk., 2022). Beberapa penelitian telah menerapkannya di bidang pertanian, seperti sistem keuangan hasil panen berbasis web (Hermawan dkk., 2022), SIM pertanian untuk gabungan kelompok tani (Hasugian dkk., 2026), dan website pencatatan keuangan usaha tani padi (Srigiardita dkk., 2026). Penelitian tersebut belum membahas usaha tani **beberapa komoditas dengan pola tanam bergiliran dalam satu lahan**, yang memerlukan pemisahan biaya per musim, pembagian biaya bersama, dan perbandingan HPP dengan harga jual harian.

Berdasarkan permasalahan tersebut, penulis merancang Sistem Informasi Manajemen Keuangan Usaha Tani Multi-Komoditas Berbasis Web Responsif. Sistem berbasis web dipilih karena dapat dibuka melalui ponsel maupun komputer (Sarfiah dkk., 2023), sehingga transaksi dapat dicatat langsung di lahan dan laporannya dapat dipantau kapan saja oleh pemilik.

## 1.2 Rumusan Masalah

1. Bagaimana merancang sistem informasi berbasis web responsif untuk mencatat transaksi usaha tani per komoditas dan per musim tanam, termasuk pembagian biaya bersama?
2. Bagaimana merancang fitur pencatatan harga jual harian dari pengepul sebagai acuan nilai jual hasil panen?
3. Bagaimana merancang penyajian HPP, pendapatan, R/C ratio, dan laporan laba rugi per komoditas untuk mendukung keputusan pemilik lahan?

## 1.3 Tujuan dan Manfaat

### 1.3.1 Tujuan

1. Menghasilkan rancangan sistem pencatatan transaksi usaha tani per komoditas dan per musim tanam, termasuk pembagian biaya bersama.
2. Menghasilkan rancangan fitur harga jual harian yang dapat dibandingkan dengan HPP.
3. Menghasilkan rancangan laporan HPP, pendapatan, R/C ratio, dan laba rugi per komoditas sebagai pendukung keputusan.

### 1.3.2 Manfaat

1. **Bagi pemilik lahan:** mengetahui keuntungan setiap komoditas dan memiliki acuan harga saat menjual ke pengepul.
2. **Bagi penulis:** menerapkan ilmu Sistem Informasi Manajemen, pemodelan UML, dan perancangan antarmuka pada masalah nyata.
3. **Bagi akademik:** menjadi referensi sistem informasi keuangan untuk usaha tani multi-komoditas.

## 1.4 Batasan Masalah

1. Studi kasus dilakukan di Lahan Tegal Miring, Desa Sidomulyo, Kabupaten Batang.
2. Komoditas yang dicakup adalah padi **[konfirmasi: padi gogo?]** dan jagung yang ditanam bergiliran, serta pisang sebagai komoditas pelengkap.
3. Periode analisis padi dan jagung adalah per musim tanam, sedangkan pisang per tahun.
4. Biaya bersama dibagi berdasarkan luas petak dan lama musim tanam.
5. Upah buruh harian dihitung sebagai biaya tunai, sedangkan tenaga kerja keluarga dihitung sebagai biaya yang diperhitungkan.
6. Harga jual harian diinput manual oleh pemilik berdasarkan informasi dari pengepul.
7. Pengguna sistem terdiri atas Pemilik dan Pencatat; sistem diakses melalui peramban dan memerlukan koneksi internet.
8. Penelitian dibatasi sampai tahap perancangan berupa use case diagram, activity diagram, dan desain antarmuka menggunakan Figma.
