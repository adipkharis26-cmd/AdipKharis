# Rancangan Antarmuka (pegangan untuk menggambar di Figma)

> **UPDATE — desain final = v2 Modern** di Figma: https://www.figma.com/design/6szDx7ZzAMI3RVHA20ZOHs (halaman "Desain Modern v2").
> Gaya v2: latar `#F3F4EF`, kartu putih radius 16–24, aksen hijau `#2E6B3F`, kuning `#E9B949`, cokelat `#B5542F`, font **Plus Jakarta Sans**, status berupa pil.
> Responsif: HP 360×800 (menu bawah) dan komputer 1280×800 (menu samping). Bagian di bawah ini adalah **rancangan v1 (gaya buku kas)** yang sudah diarsipkan.

> Dokumen kerja, **bukan** bagian laporan. Isi BAB IV 4.3 ada di `08-bab-4-perancangan.md`.

## 1. Arah visual — "buku kas petani", bukan dashboard SaaS

Hindari ciri desain generik buatan AI: gradien ungu/biru, kartu melayang dengan bayangan tebal, ikon emoji, ilustrasi orang 3D, teks "Welcome back! 👋".

Gaya yang dipakai meniru **buku kas dan nota pengepul**: kertas krem, garis tabel tipis seperti buku tulis bergaris, angka rata kanan, dan **cap/stempel** untuk status.

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `kertas` | `#F6F1E6` | latar halaman |
| `kertas-2` | `#ECE4D3` | latar kartu/tabel selang-seling |
| `tinta` | `#1F1A14` | teks utama |
| `tinta-2` | `#6B6257` | teks keterangan |
| `garis` | `#D6CCB8` | garis tabel/pemisah (1 px) |
| `daun` | `#3F6B3A` | tombol utama, status untung |
| `padi` | `#C8922E` | aksen, penanda musim padi |
| `jagung` | `#E2B93B` | penanda musim jagung |
| `tanah` | `#7A4B2A` | status rugi/di bawah modal |

**Huruf** (Google Fonts, gratis):
- Judul: **Bitter** (serif tebal, terasa seperti buku catatan) — 600, ukuran 20/24/28.
- Isi: **Source Sans 3** — 400/600, ukuran 16 (jangan lebih kecil; pengguna utama bapak).
- Angka rupiah: **Source Sans 3** dengan *tabular figures*, rata kanan.

**Aturan bentuk:** sudut 6 px (tidak bulat penuh), tanpa bayangan (cukup garis 1 px), tombol tinggi minimal 48 px, satu tombol utama per layar.

**Ukuran frame Figma:** HP `360 × 800` (utama), laptop `1280 × 800` (khusus laporan).

## 2. Daftar layar

### Layar 1 — Login (Gambar 4.6)
- Atas: nama sistem "Catatan Tani Tegal Miring" (Bitter) + baris kecil "Lahan Tegal Miring, Sidomulyo".
- Isian: Nama pengguna, Kata sandi (dengan tombol lihat).
- Tombol hijau penuh lebar: **Masuk**.
- Pesan gagal di bawah tombol, warna `tanah`: "Nama pengguna atau kata sandi salah."

### Layar 2 — Dashboard Pemilik (Gambar 4.7)
- Kepala: "Musim berjalan: **Jagung** · hari ke-46" dengan pita warna `jagung` di kiri.
- Blok "Harga hari ini vs modal" — tabel 3 baris (Padi, Jagung, Pisang):
  `Komoditas | Harga pengepul | HPP | Selisih/kg` + **cap** "UNTUNG" (hijau) atau "DI BAWAH MODAL" (cokelat) diputar 6°.
- Blok "Biaya musim ini": total tunai, total diperhitungkan, total biaya.
- Dua tombol cepat: **Catat Pengeluaran** (utama), Update Harga (garis).
- Menu bawah (tab bar): Beranda · Catat · Harga · Laporan · Lainnya.

### Layar 3 — Catat Pengeluaran (Gambar 4.8)
- Isian berurutan: Tanggal · Jenis biaya (pilihan: benih, pupuk, pestisida, upah buruh, sewa alat, lainnya) · Jumlah (Rp) · Sifat biaya (dua tombol pilihan: **Tunai** / **Diperhitungkan**) · Dibebankan ke (pilihan: Musim berjalan / Petak pisang / Biaya bersama).
- Catatan kecil di bawah "Biaya bersama": "Dibagi otomatis sesuai luas petak dan lama musim."
- Tombol **Simpan**. Notifikasi berhasil berupa baris hijau di atas: "Tersimpan: Upah buruh Rp300.000".

### Layar 4 — Update Harga Harian (Gambar 4.9)
- Tanggal hari ini di atas.
- Tiga baris isian: Padi (Rp/kg), Jagung (Rp/kg), Pisang (Rp/tandan atau Rp/kg) — di samping tiap isian tampil "kemarin: Rp…".
- Setelah simpan: tampil hasil per komoditas "Selisih dengan HPP: +Rp1.200/kg" + cap status.
- Riwayat 7 hari dalam tabel kecil bergaris.

### Layar 5 — Laporan Laba Rugi (Gambar 4.10, frame laptop)
- Filter: Komoditas · Musim/Periode.
- Tabel gaya buku kas: Penerimaan (TR) · Biaya tunai · Biaya diperhitungkan · Bagian biaya bersama · Total biaya (TC) · Pendapatan (π) · HPP/kg · R/C tunai · R/C total.
- Kotak kesimpulan satu kalimat: "Musim jagung 2026 **layak** (R/C total 1,42)."
- Tombol **Cetak PDF** (pilihan, sesuai «extend»).

## 3. Konsistensi dengan diagram

| Layar | Use case | Activity |
|---|---|---|
| Login | Login | Gambar 4.2 |
| Dashboard | Lihat Dashboard (+ include Hitung HPP) | — |
| Catat Pengeluaran | Catat Pengeluaran | Gambar 4.3 |
| Update Harga Harian | Update Harga Harian | Gambar 4.4 |
| Laporan Laba Rugi | Lihat Laporan Laba Rugi (+ extend Cetak) | Gambar 4.5 |

## 4. Ekspor dari Figma ke laporan

Pilih frame → panel kanan **Export** → PNG **2x** → simpan ke `sim-usahatani/assets/` dengan nama:
`07-ui-login.png`, `08-ui-dashboard.png`, `09-ui-catat-pengeluaran.png`, `10-ui-harga-harian.png`, `11-ui-laporan.png`.
