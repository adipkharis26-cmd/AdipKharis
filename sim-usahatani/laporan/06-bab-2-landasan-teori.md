# BAB II LANDASAN TEORI

## 2.1 Teori Pendukung

### 2.1.1 Sistem Informasi Manajemen

Sistem Informasi Manajemen (SIM) adalah sistem yang mengolah data menjadi informasi yang akurat dan tepat waktu untuk membantu pengambilan keputusan, perencanaan, dan pengendalian dalam organisasi (Syahputra dkk., 2022). Dalam penelitian ini, SIM berperan mengubah catatan transaksi harian di lahan menjadi informasi biaya, keuntungan, dan kelayakan setiap komoditas bagi pemilik.

### 2.1.2 Usaha Tani dan Pencatatan Keuangan

Usaha tani adalah kegiatan mengelola lahan, tenaga kerja, dan modal untuk menghasilkan produk pertanian. Pencatatan keuangan usaha tani membantu petani mengendalikan pengelolaan uang usahanya (Septiadi dkk., 2021). Pertiwi dan Wulandari (2022) menemukan bahwa pencatatan dan analisis keuangan berbasis teknologi berkaitan dengan pendapatan petani serta pengalaman mereka mengikuti pelatihan pencatatan.

### 2.1.3 Analisis Biaya dan Pendapatan Usaha Tani

Biaya usaha tani terdiri atas biaya tetap, yaitu biaya yang besarnya tidak bergantung pada jumlah produksi, dan biaya variabel, yaitu biaya yang berubah mengikuti jumlah produksi (Ingesti & Saragih, 2025). Total biaya, penerimaan, dan pendapatan dihitung dengan rumus berikut.

::rumus TC = FC + VC | (2.1)
::rumus TR = P × Q | (2.2)
::rumus π = TR − TC | (2.3)

::ket Keterangan: TC = total biaya (Rp); FC = biaya tetap (Rp); VC = biaya variabel (Rp); TR = penerimaan (Rp); P = harga jual (Rp/kg); Q = jumlah produksi (kg); π = pendapatan (Rp).

Kelayakan usaha tani diukur dengan R/C ratio, yaitu perbandingan antara penerimaan dan biaya. Usaha dinyatakan layak apabila R/C lebih dari 1, impas apabila sama dengan 1, dan rugi apabila kurang dari 1 (Ingesti & Saragih, 2025).

::rumus R/C = TR ÷ TC | (2.4)

Nirmala dan Hardjanto (2022) membedakan R/C atas biaya tunai dan R/C atas biaya total. Biaya tunai adalah biaya yang benar-benar dibayarkan, seperti upah buruh harian dan pembelian pupuk, sedangkan biaya total juga memasukkan biaya yang diperhitungkan, seperti tenaga kerja keluarga dan penyusutan alat. Kedua nilai ini disajikan dalam sistem agar keuntungan tidak terlihat lebih besar daripada kenyataannya.

### 2.1.4 Harga Pokok Produksi dan Titik Impas

Harga pokok produksi (HPP) adalah biaya yang dikeluarkan untuk menghasilkan setiap satu kilogram hasil panen. Titik impas atau *break even point* (BEP) menunjukkan batas produksi atau harga ketika usaha tidak untung maupun rugi (Rahmah dkk., 2024).

::rumus HPP = TC ÷ Q | (2.5)
::rumus BEP produksi = TC ÷ P | (2.6)

Dalam penelitian ini, HPP dibandingkan dengan harga jual harian dari pengepul. Selisih keduanya menunjukkan keuntungan per kilogram apabila hasil panen dijual pada hari tersebut.

::rumus Margin per kg = Harga harian − HPP | (2.7)

Karena padi dan jagung ditanam bergantian pada petak yang sama, biaya bersama tahunan seperti pajak lahan dan penyusutan alat dibagi menurut luas petak dan lama musim tanam.

::rumus Bᵢ = B × (Lₚ ÷ Lₜ) × (tᵢ ÷ 12) | (2.8)

::ket Keterangan: Bᵢ = biaya bersama yang dibebankan ke musim tanam ke-i (Rp); B = biaya bersama satu tahun (Rp); Lₚ = luas petak (m²); Lₜ = luas lahan seluruhnya (m²); tᵢ = lama musim tanam ke-i (bulan). Untuk petak pisang, tᵢ bernilai 12.

### 2.1.5 Metode Prototyping

Prototyping adalah metode pengembangan sistem yang membuat rancangan awal secara cepat, lalu menyempurnakannya berdasarkan masukan pengguna. Sarfiah dkk. (2023) menerapkan empat tahap, yaitu identifikasi kebutuhan, perancangan prototipe, pengujian dan evaluasi, serta penarikan kesimpulan. Metode ini memungkinkan sistem dibuat cepat dan sesuai kebutuhan inti pengguna (Siswanto dkk., 2023). Hasugian dkk. (2026) juga memakai metode ini secara berulang dalam merancang SIM pertanian, mulai dari pengumpulan kebutuhan, pembuatan *mock-up*, hingga pengujian *mock-up*.

### 2.1.6 Unified Modeling Language (UML)

UML adalah bahasa pemodelan untuk menggambarkan kebutuhan dan alur sistem sebelum dibangun, sehingga alur kerja sistem dapat dipantau sejak tahap perancangan (Setiaji & Sastra, 2021). Penelitian ini menggunakan dua diagram berikut.

1. **Use case diagram**, yang menggambarkan interaksi antara aktor (Pemilik dan Pencatat) dengan fungsi-fungsi sistem.
2. **Activity diagram**, yang menggambarkan urutan aktivitas dalam setiap fungsi, mulai dari input data hingga laporan ditampilkan.

### 2.1.7 Web Responsif

Web responsif adalah situs web yang tampilannya menyesuaikan ukuran layar perangkat, baik komputer maupun ponsel. Aplikasi keuangan berbasis web dapat dibuka melalui ponsel maupun komputer sehingga memudahkan pengawasan keuangan (Sarfiah dkk., 2023). Bagi pengguna di lahan, pendekatan ini menghilangkan kebutuhan memasang aplikasi khusus.

### 2.1.8 Figma

Figma adalah aplikasi berbasis web untuk merancang antarmuka dan membuat prototipe tampilan. Tazkiyah dan Arifin (2022) menggunakan Figma untuk merancang prototipe antarmuka website, karena antarmuka yang baik membuat pengguna nyaman, sedangkan antarmuka yang buruk membuat pengguna meninggalkan sistem.

### 2.1.9 Penelitian Terdahulu

Perbandingan penelitian terdahulu dengan penelitian ini disajikan pada Tabel 2.1.

::tabel Tabel 2.1 Penelitian Terdahulu

| No | Peneliti | Objek | Metode | Hasil | Perbedaan dengan penelitian ini |
|---|---|---|---|---|---|
| 1 | Hermawan dkk. (2022) | Keuangan hasil panen, Desa Sidodadi, Blitar | R&D, waterfall | Aplikasi web keuangan pertanian; uji black box 90,9% | Belum memisahkan biaya per komoditas dan musim tanam |
| 2 | Pertiwi & Wulandari (2022) | Petani kentang, Pangalengan | Survei, regresi logit | Pencatatan berbasis teknologi berkaitan dengan pendapatan dan pelatihan | Penelitian sosial, tidak merancang sistem |
| 3 | Siswanto dkk. (2023) | UMKM (aplikasi KasirTa) | Prototype | Laporan laba rugi berbasis web | Objek usaha dagang, bukan usaha tani |
| 4 | Hasugian dkk. (2026) | Gapoktan Lembang Agri | Prototyping, UML | SIM dari pendaftaran anggota hingga penjualan | Fokus kelembagaan, belum menganalisis HPP dan R/C |
| 5 | **Penelitian ini** | Lahan Tegal Miring, Batang | Prototyping, UML, Figma | Rancangan SIM keuangan multi-komoditas | Pola tanam bergiliran, pembagian biaya bersama, HPP dibandingkan harga harian |
