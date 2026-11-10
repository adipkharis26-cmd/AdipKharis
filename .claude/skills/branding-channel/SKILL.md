---
name: branding-channel
description: Branding channel YouTube untuk SEMUA divisi Kantor Konten (sekarang dan divisi baru) — 3 logo profil 800×800 (aman untuk potongan lingkaran), banner YouTube 2560×1440 dengan area aman 1546×423 (rapi di HP, komputer, TV), dan rekomendasi bio high CTA. Claude berperan sebagai kreator YouTube berpengalaman. Pakai saat divisi baru dibuat, saat owner minta logo/banner/bio, atau saat gaya channel berubah.
---

# Branding channel (semua divisi)

## Peran
Kamu kreator YouTube berpengalaman. Logo dan banner adalah "kemasan" channel: orang memutuskan subscribe dalam 1–2 detik setelah membuka halaman channel. Bio menjelaskan **untuk siapa** channel ini dan **kenapa harus subscribe**.

## Ukuran yang benar
- **Logo profil:** 800×800 PNG (YouTube menampilkan 98×98, di feed/komentar 24–48 px, dipotong **lingkaran**). Isi penting di dalam lingkaran; tanpa teks kecil.
- **Banner:** 2560×1440, maks 6 MB.
  - **Area aman 1546×423 di tengah** (x 507–2053, y 508–931) tampil di semua perangkat; semua teks/logo di sini.
  - Desktop menampilkan strip 2560×423 di tengah; TV menampilkan seluruhnya. Hiasan boleh di luar area aman.

## Aturan high CTA
1. **Logo A = karakter/maskot** (paling dikenali di ukuran kecil, membangun kedekatan) → rekomendasi utama.
   Logo B = monogram/ikon, logo C = nama. Owner memilih satu dan **jangan sering ganti** (pengenalan merek).
2. Kontras tinggi, outline tebal, warna dan font **sama dengan gaya channel** (`config.channels.<id>.thumbnail`).
3. Banner: nama besar + tagline yang menjanjikan manfaat + pil jadwal ("VIDEO BARU SETIAP HARI") agar orang tahu ada alasan kembali.
4. Bio (maks 1000 karakter, 2 baris pertama paling penting karena terpotong):
   baris 1 = janji/hook ("Semua hal penasaran, dijawab dalam 1 menit"), baris 2 = isi channel + kata kunci pencarian,
   lalu jadwal, lalu ajakan komentar/subscribe yang spesifik. Sediakan 2 versi.

## Wajib BERBEDA per divisi (permintaan owner)
- **Font sendiri** (`font.judul`/`font.isi` di spec; file di `video/src/vendor`, dimuat di `brand.html`):
  - Mas Kharis: Fredoka + Baloo 2 (bulat, ramah, komedi kantor).
  - Ternyata Leluhur: Cinzel (prasasti klasik) + Montserrat.
  - Dari 1 mnt: Bangers (komik, cepat, debat).
  - Divisi baru pilih font lain yang cocok dengan temanya (paket `@fontsource/<nama>` via `npm pack`, salin woff2 latin + latin-ext).
- **Susunan banner sendiri** (`banner.gaya`):
  - `kantor`: dinding + lantai catur, papan tulis nama, sticky notes topik, stempel CTA.
  - `museum`: hijau zamrud-emas, medali tokoh, judul emas, pita CTA, siluet stupa.
  - `versus`: latar belah pink|biru, maskot, judul 3D, tag seri, stopwatch, CTA.
  - Divisi baru dibuatkan gaya baru di `brandkit.js` (jangan memakai ulang susunan divisi lain).
- **Teks CTA berbeda**, sesuai janji channel (bukan kalimat jadwal yang sama untuk semua):
  - Mas Kharis: "1 DRAMA TIAP HARI".
  - Ternyata Leluhur: "TIAP HARI 1 RAHASIA BARU".
  - Dari 1 mnt: "60 DETIK, LANGSUNG PAHAM".
- **Logo tidak harus teks.** Utamakan 1 tanda khas:
  - kepala karakter (`kepala`);
  - satu huruf dengan ciri karakter (`huruf` + `rambut`);
  - ikon (`stupa`, `stopwatch`);
  - cap (`stempel`);
  - wajah maskot close-up (`wajah`);
  - karakter (`karakter`).
- Logo A Mas Kharis (karakter di lantai catur) sudah disetujui owner, jadi jangan diubah.

## Cara membuat
1. Tulis `video/brand/<channel-id>.json`: `nama`, `tagline`, `jadwal`, `warna {bg1,bg2,aksen}`, `pola` (`catur`, `batik`, `sunburst`, atau lainnya = titik),
   `art` (`{"kharis":{"exp":"happy"}}`, `{"frame":{"ep":"xx01","t":9.5}}` untuk frame bersih episode, `{"maskot":"senang"}`, atau kosong),
   `logo` (3 item: `jenis` karakter/monogram/nama + `crop`/`teks`/`baris`/`stiker`/`catatan`), `banner` (`crop`, `bingkai:"lingkaran"` bila art berlatar, `hiasan` 6 emoji), `bio` (2 teks).
   Contoh: `video/brand/mas-kharis.json`, `ternyata-leluhur.json`, `dari-1-mnt.json`.
2. `cd video/src && node brand.js <channel-id>` → `video/out/brand/<id>/logo-A|B|C.png`, `banner.png`, `cek-logo.png` (lingkaran + ukuran kecil), `cek-banner.png` (TV/desktop/HP).
3. Buka kedua file cek (Read). Pastikan wajah/ikon utuh di lingkaran, terbaca di 48 px, dan teks banner utuh di potongan HP. Perbaiki `crop` lalu ulangi.
4. Unggah 4 PNG sebagai aset Kantor Konten, lalu `set` dokumen `brand/<channel-id>`:
   `{nama, tagline, logos:[{nama, assetId, url, catatan, rekom}], banner:{assetId, url}, bio:[...], diubah}`.
   Tombol **🎨 Branding** di meja divisi menampilkannya dengan tombol unduh dan salin bio.
