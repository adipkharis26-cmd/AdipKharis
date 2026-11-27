# SIM Keuangan Usaha Tani — Lahan Tegal Miring

Proyek UAS Sistem Informasi Manajemen.

**Judul:**
Perancangan Sistem Informasi Manajemen Keuangan Usaha Tani Multi-Komoditas Berbasis Web Responsif
(Studi Kasus: Lahan Tegal Miring, Desa Sidomulyo, Kabupaten Batang)

**Penulis:** Adip Kharis Sofan (20124501) — Teknik Informatika, Universitas Selamat Sri Kendal

## Struktur folder

| Folder | Isi |
|---|---|
| `laporan/` | Draf per bab laporan (Markdown) dan daftar referensi |
| `diagram/` | File diagram `.drawio` (prototyping, use case, activity) — diedit di diagrams.net / VS Code |
| `web/` | Kode web responsif (menyusul, setelah desain Figma final) |

## Progres

- [x] Tahap 1 — Judul, batasan masalah, metode
- [x] Tahap 2 — Referensi jurnal 2021–2026 (terverifikasi DOI)
- [x] Tahap 3 — BAB I Pendahuluan (draf v3 ringkas, ada [isi nanti])
- [x] Audit celah proyek (`laporan/03-audit-celah.md`)
- [x] Tahap 4 — BAB II Landasan Teori (draf v1)
- [x] Tahap 5 — BAB III Metodologi (draf v1, gambar 3.1 + lampiran pedoman wawancara)
- [x] Tahap 6 — BAB IV Perancangan: 4.1 use case, 4.2 activity (4), 4.3 antarmuka (teks; gambar menunggu draw.io & Figma)
- [ ] Tahap 7 — Implementasi web responsif
- [ ] Tahap 8 — BAB V, daftar pustaka, finalisasi .docx

## Pindah ke laptop lain

```bash
git clone https://github.com/adipkharis26-cmd/AdipKharis.git
```

```bash
cd AdipKharis
git checkout claude/charming-cannon-5xh7nt
```

Lalu buka folder `sim-usahatani` di VS Code atau Antigravity.

## Membuat ulang file Word

```bash
pip install python-docx
```

```bash
python sim-usahatani/tools/build_docx.py
```

## Diagram (draw.io / diagrams.net)

Semua diagram disimpan sebagai file `.drawio` di folder `diagram/`, jadi tersimpan di repo dan ikut tersinkron.

**Cara A — di browser (app.diagrams.net):**
1. Buka https://app.diagrams.net → pilih **GitHub** sebagai penyimpanan → izinkan akses akun GitHub.
2. **Open Existing Diagram** → repo `AdipKharis` → branch `claude/charming-cannon-5xh7nt` → folder `sim-usahatani/diagram/`.
3. Setiap **Save** di diagrams.net langsung menjadi commit di repo.

**Cara B — di VS Code / Antigravity:** pasang ekstensi **Draw.io Integration** (`hediet.vscode-drawio`), lalu klik file `.drawio` untuk mengedit langsung.

**Ekspor gambar untuk laporan:** File → Export as → PNG, *zoom* 250%, *border* 20, simpan ke `sim-usahatani/assets/` dengan nama yang sama (misal `02-use-case.png`), lalu jalankan `python sim-usahatani/tools/build_docx.py`.
