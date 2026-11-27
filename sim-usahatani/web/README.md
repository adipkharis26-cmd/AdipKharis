# Catatan Tani — purwarupa web responsif

Implementasi dari rancangan BAB IV (use case, activity diagram, dan desain Figma "Desain Modern v2").
Satu web yang tampil sebagai **satu kolom + menu bawah di HP** dan **menu samping + beberapa kolom di komputer**.

## Menjalankan

**Windows:** klik dua kali `jalankan.bat`.

**macOS/Linux:**

```bash
./jalankan.sh
```

**Manual (VS Code / Antigravity, terminal di folder `sim-usahatani/web`):**

```bash
python -m venv .venv
```

```bash
.venv/Scripts/pip install -r requirements.txt
```

```bash
.venv/Scripts/python app.py
```

(di macOS/Linux ganti `.venv/Scripts/` dengan `.venv/bin/`)

Buka **http://localhost:5000**. Dari HP yang tersambung ke WiFi yang sama: **http://IP-laptop:5000** (lihat IP dengan `ipconfig` di Windows).

**Akun contoh** (kata sandi `tani123`): `bapak` (Pemilik) dan `pencatat` (Pencatat).

Basis data SQLite dibuat otomatis di `data/tani.db` beserta **data contoh ilustrasi** (angka sama dengan desain Figma). Hapus file itu untuk mulai ulang.

## Pemetaan ke laporan

| Use case (BAB IV) | Halaman | Peran |
|---|---|---|
| Login | `/login` | semua |
| Catat Pengeluaran | `/catat` (tab Biaya) | Pencatat, Pemilik |
| Catat Hasil Panen | `/catat/panen` | Pencatat, Pemilik |
| Catat Penjualan ke Pengepul | `/catat/jual` | Pencatat, Pemilik |
| Update Harga Harian | `/harga` | Pemilik |
| Lihat Dashboard | `/` | Pemilik |
| Lihat Laporan Laba Rugi (+ Cetak) | `/laporan` → tombol Unduh PDF (dialog cetak browser) | Pemilik |
| Kelola Musim Tanam / Petak / Pengguna | `/musim`, `/petak`, `/pengguna` | Pemilik |
| Hitung HPP, R/C, Alokasi Biaya Bersama | `hitung.py` (rumus 2.1–2.8) | sistem |

## Tes otomatis

```bash
python -m pytest -q
```

Menguji rumus (2.1)–(2.8) dengan angka contoh (TR Rp8.040.000, TC Rp6.240.000, HPP Rp5.200, R/C 1,29, biaya bersama terbagi habis Rp600.000) serta alur login, hak akses, validasi "data lengkap?", update harga, dan laporan.

## Struktur

```
web/
├── app.py          rute & hak akses
├── db.py           skema SQLite + data contoh
├── hitung.py       rumus analisis usaha tani
├── templates/      halaman (Jinja)
├── static/style.css  desain v2 (warna, Plus Jakarta Sans, responsif)
└── tests/          tes otomatis
```

Catatan keamanan: ganti `SIM_SECRET` (variabel lingkungan) dan kata sandi contoh sebelum dipakai sungguhan.
