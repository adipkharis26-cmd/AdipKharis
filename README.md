# 🚀 YouTube Shorts Auto Downloader & Scheduled Uploader

Sistem otomatisasi lengkap untuk:
1. **Mengunduh video YouTube Shorts** khusus format MP4 HD (video + audio jernih).
2. **Sistem Antrean Skala Besar**: Anda cukup salin & tempel 1 link atau 50 link sekaligus. Antrean diproses berurutan rapi dengan penomoran `#0001`, `#0002`, dst.
3. **Penyimpanan Stok Lokal**: Semua video tersimpan rapi di folder `downloads/` dan dicatat ke database inventaris stok.
4. **Generator Judul & Tag Otomatis**: Judul dibersihkan dari clickbait/karakter aneh, disematkan `#Shorts`, dan dibuatkan hingga 20 tag SEO relevan secara instan (tersedia juga opsi Google Gemini AI).
5. **Dukungan Multi-Channel YouTube**:
   - Anda dapat menghubungkan **lebih dari 1 channel YouTube** ke dalam sistem.
   - Beralih target channel upload cukup dengan 1 klik ("Gunakan Channel Ini").
   - Header dan dashboard selalu menampilkan profil & nama channel yang sedang aktif.
6. **Kontrol Penuh 2 Arah (Edit & Hapus Langsung dari Web)**:
   - Jika video **sudah terunggah di YouTube**, Anda tetap bisa mengedit **Judul, Tag, Deskripsi, atau Jam Jadwal** langsung dari dashboard web. Perubahan akan **otomatis tersinkronisasi dan berubah di YouTube**.
   - Jika Anda menekan tombol **Hapus** pada video yang sudah terunggah, video tersebut akan **otomatis terhapus dari channel YouTube Anda** dan dari penyimpanan lokal.
7. **Penjadwalan Unggah Otomatis (Maksimal 3 Video / Hari)**:
   - Jam rilis default: **09:00**, **13:00**, dan **18:00 WIB**.
   - Unduhan bersifat **tidak terbatas**. Stok yang berlebih dari kuota 3 video hari ini akan **otomatis dijadwalkan untuk besok**, lusa, dan hari-hari berikutnya tanpa batas.
   - Menggunakan fitur native YouTube `publishAt` (video diunggah langsung ke channel YouTube aktif berstatus private dan otomatis tayang publik tepat pada jam jadwalnya).

---

## 🛠️ Cara Menjalankan Sistem

### Cara 1: Menggunakan File `start.bat` (Termudah di Windows)
Cukup **klik dua kali file `start.bat`**. 
Script akan otomatis mengaktifkan environment dan membuka dashboard web di browser Anda pada alamat:
👉 **`http://localhost:8000`**

### Cara 2: Menjalankan via Terminal / CMD
```bash
.\venv\Scripts\activate
python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

---

## 📋 Alur Penggunaan

1. **Buka Dashboard**: Buka browser di `http://localhost:8000`.
2. **Salin & Tempel Link**:
   - Salin link YouTube Shorts dari YouTube (misal `https://youtube.com/shorts/XYZ`).
   - Tempel ke kotak input di dashboard (bisa menempel banyak link sekaligus dipisah baris).
   - Klik tombol **"Mulai Masukkan Antrean"** atau **"Tempel dari Clipboard"**.
3. **Lihat Antrean Berjalan**:
   - Tab **Antrean Unduh** akan menampilkan progres download (persen, kecepatan, estimasi waktu).
   - Penomoran antrean berurutan otomatis (#0001, #0002, dst).
4. **Tinjau Stok & Jadwal**:
   - Buka tab **Inventaris Stok** untuk melihat video yang telah selesai diunduh. Anda dapat mengedit judul, tag, atau jam jika diinginkan.
   - Buka tab **Kalender Jadwal Upload** untuk melihat distribusi video per hari (maksimal 3 video per hari, sisanya otomatis ke hari berikutnya).
5. **Hubungkan Channel YouTube**:
   - Buka tab **Akun YouTube & Pengaturan**.
   - Ikuti panduan setup Google Cloud di bawah untuk mendapatkan `client_secrets.json`.

---

## 🔑 Panduan Menghubungkan Akun YouTube (Google Cloud Console)

Untuk mengunggah video secara resmi ke channel YouTube Anda:
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat Project baru (misal: *Shorts Automation*).
3. Buka menu **APIs & Services > Library**, cari **YouTube Data API v3**, lalu klik **Enable** (Aktifkan).
4. Buka **APIs & Services > OAuth consent screen**:
   - Pilih **External**.
   - Isi nama aplikasi dan email Anda.
   - Pada bagian **Test users**, tambahkan alamat email akun Google/YouTube Anda.
5. Buka **APIs & Services > Credentials**:
   - Klik **Create Credentials > OAuth client ID**.
   - Application type: Pilih **Web application**.
   - Authorized redirect URIs: Tambahkan `http://localhost:8000/api/youtube/oauth-callback`.
   - Klik **Create**, lalu klik ikon **Download JSON**.
6. Buka Tab **Akun YouTube & Pengaturan** di dashboard web Anda:
   - Pilih file JSON yang baru Anda unduh di bagian "Unggah File client_secrets.json".
   - Klik **Simpan Kredensial**.
   - Klik **Hubungkan Channel YouTube**, login dan izinkan akses.
   - Profil channel Anda (foto, nama, subscriber) akan langsung muncul di dashboard!

---

## ⚙️ Fitur Pengaturan Fleksibel

- **Maksimal Video Per Hari**: Dapat diubah dari 3 ke angka berapa pun (misal 2 atau 5).
- **Jam Slot Upload**: Dapat disesuaikan sesuai jam ramai penonton channel Anda (contoh: `08:00, 12:00, 17:00, 20:00`).
- **Auto-Upload Toggle**: Anda dapat mematikan auto-upload jika hanya ingin mengunduh stok dulu dan mengunggahnya nanti.
- **Tombol Upload Now**: Ingin salah satu video diunggah sekarang juga tanpa menunggu jam jadwal? Cukup klik tombol **Upload Now** pada kartu video!

---

## 📂 Struktur File Proyek

```
c:\ANTIGRAVITY\Push SUB\
├── app.py                   # Server utama FastAPI & Background Worker
├── config.py                # Konfigurasi direktori, ffmpeg, & setting default
├── database.py              # Layer database SQLite (aiosqlite)
├── downloader.py            # Mesin unduh yt-dlp + embedded ffmpeg
├── metadata_generator.py    # Pembuat judul & tag Shorts SEO otomatis
├── scheduler.py             # Logika alokasi jadwal 3 video/hari + rollover
├── uploader.py              # Modul YouTube Data API v3 OAuth & publishAt
├── start.bat                # Launcher 1-klik untuk Windows
├── requirements.txt         # Daftar pustaka Python
├── downloads/               # Tempat penyimpanan video MP4 berurutan
├── thumbnails/              # Gambar pratinjau thumbnail
├── data/                    # Database SQLite & kredensial OAuth
└── static/                  # Antarmuka Dashboard Web
    ├── index.html           # Tampilan Web Modern Glassmorphism
    ├── css/style.css        # Desain Dark Mode & Palet YouTube
    └── js/app.js            # Logika interaktif antrean & kalender
```
