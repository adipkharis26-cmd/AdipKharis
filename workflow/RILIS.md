# Rilis otomatis ke YouTube (Ternyata Leluhur)

Keputusan owner (24 Nov 2026): **jeda veto 12 jam**. Video diunggah sebagai *private* dan dijadwalkan tayang di slot WIB pertama yang jatuh minimal 12 jam setelah diunggah. Kalau owner tidak membatalkan, video tayang sendiri.

```
Sesi produksi (Claude, cloud)                 VPS / PC owner                         YouTube
────────────────────────────                  ──────────────                         ───────
naskah → cek fakta → VO → render → thumbnail
python3 video/src/rilis_paket.py tlNN \
   --cek-fakta lolos --push  ───────────►  branch `rilis-video`
                                           rilis_worker.py (tiap 15 menit)
                                             git pull rilis-video
                                             validasi paket  ───────────────►  upload PRIVATE + publishAt
                                             notifikasi Telegram (link veto)
                                             laporan analytics harian ─► branch `laporan`
Sesi produksi berikutnya membaca laporan/terbaru.json untuk memilih topik & hook.
```

Token YouTube **hanya** ada di VPS (`data/rilis_token.json`, chmod 600, di-ignore git). Sesi cloud Claude tidak pernah memegang login YouTube.

## Penghalang wajib: audit YouTube API

Video yang diunggah lewat API dari proyek Google Cloud yang **belum lolos audit** terkunci *private* dan tidak bisa dibuat publik. Video yang sudah terkunci harus diunggah ulang. Karena itu:

- Worker **tidak mengunggah** selama `RILIS_API_TERAUDIT=0` (default). Paket yang siap hanya dicatat di log, dan owner mengunggah manual lewat aplikasi YouTube seperti sekarang.
- Laporan analytics tetap jalan sejak hari pertama, karena membaca data tidak butuh audit.
- Ajukan audit lewat formulir *YouTube API Services – Audit and Quota Extension*. Panduan: developers.google.com/youtube/v3/guides/quota_and_compliance_audits. Setelah disetujui, set `RILIS_API_TERAUDIT=1`.

## Pengaman di worker

| Pengaman | Perilaku |
|---|---|
| Tidak pernah public | `publishAt` wajib di masa depan (> 30 menit). Kalau tidak valid, upload dibatalkan, tidak jatuh ke public. |
| Jeda veto | Slot WIB pertama ≥ sekarang + `RILIS_VETO_JAM` (12). Slot default 11:30, 17:30, 19:30. |
| Kuota | Maksimal `RILIS_MAKS_PER_HARI` (1) per hari WIB. |
| Cek fakta | Paket tanpa `"cekFakta": "lolos"` ditolak. |
| Sekali saja | State lokal + cek judul di 50 upload terakhir channel. |
| Channel benar | Token wajib milik `RILIS_CHANNEL_ID`. Kalau beda, worker berhenti. |
| Hanya Ternyata Leluhur | Paket channel lain dilewati kecuali `RILIS_SEMUA_CHANNEL=1`. |
| Label AI | `containsSyntheticMedia: true` (tokoh dan suara buatan). |

**Cara veto:** buka link di notifikasi, atau YouTube Studio → Konten → *Terjadwal*. Hapus video, atau ubah ke private tanpa jadwal, sebelum jam tayang.

## Setup (sekali)

1. **VPS kecil** (Ubuntu 22.04/24.04, 1 vCPU, 1 GB RAM cukup; worker tidak merender). Bisa juga PC yang menyala 24 jam.
2. **Google Cloud Console** (login dengan akun pemilik channel):
   1. Buat proyek baru, mis. `ternyata-leluhur-rilis`.
   2. *APIs & Services → Library*: aktifkan **YouTube Data API v3** dan **YouTube Analytics API**.
   3. *OAuth consent screen*: tipe *External*, isi nama aplikasi dan email. Lalu **Publish app**. Dalam mode *Testing*, token kedaluwarsa tiap 7 hari dan worker akan berhenti. Peringatan "aplikasi belum diverifikasi" saat login wajar untuk pemakaian pribadi.
   4. *Credentials → Create credentials → OAuth client ID → Desktop app*. Unduh JSON-nya.
   5. Ajukan audit (lihat bagian di atas) untuk proyek ini.
3. **Di VPS:**
   ```bash
   sudo apt-get update && sudo apt-get install -y git python3-venv
   git clone git@github.com:adipkharis26-cmd/AdipKharis.git ~/AdipKharis   # pakai deploy key (langkah 4)
   cd ~/AdipKharis && python3 -m venv venv && . venv/bin/activate && pip install -r requirements.txt
   mkdir -p data && cp ~/client_secret_*.json data/client_secrets.json
   git clone git@github.com:adipkharis26-cmd/AdipKharis.git data/rilis-repo   # clone kerja untuk branch rilis-video
   ```
4. **Deploy key GitHub** (supaya worker bisa push branch `laporan`): `ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""`, lalu tempel isi `~/.ssh/id_ed25519.pub` di GitHub → repo → *Settings → Deploy keys* dengan **Allow write access**.
5. **Login YouTube** (dari komputer Anda):
   ```bash
   ssh -L 8765:localhost:8765 user@IP_VPS
   cd ~/AdipKharis && . venv/bin/activate && python rilis_worker.py auth
   ```
   Buka URL yang muncul di browser komputer Anda, pilih akun/**channel Ternyata Leluhur**, lalu izinkan.
6. **Konfigurasi** `/etc/rilis-worker.env`:
   ```
   RILIS_CHANNEL_ID=UCxxxxxxxxxxxxxxxx      # worker menampilkan ID ini kalau dikosongkan
   RILIS_REPO_DIR=/home/USER/AdipKharis/data/rilis-repo
   RILIS_VETO_JAM=12
   RILIS_MAKS_PER_HARI=1
   RILIS_SLOT=11:30,17:30,19:30
   RILIS_API_TERAUDIT=0                     # ubah ke 1 setelah audit disetujui
   TELEGRAM_BOT_TOKEN=                      # opsional: notifikasi veto
   TELEGRAM_CHAT_ID=
   ```
7. **Uji:** `python rilis_worker.py report` (laporan pertama) dan `python rilis_worker.py once --dry-run`.
8. **Service 24/7** `/etc/systemd/system/rilis-worker.service`:
   ```ini
   [Unit]
   Description=Charizch Agent rilis worker
   After=network-online.target
   [Service]
   User=USER
   WorkingDirectory=/home/USER/AdipKharis
   EnvironmentFile=/etc/rilis-worker.env
   ExecStart=/home/USER/AdipKharis/venv/bin/python rilis_worker.py loop
   Restart=always
   RestartSec=60
   [Install]
   WantedBy=multi-user.target
   ```
   `sudo systemctl daemon-reload && sudo systemctl enable --now rilis-worker`. Log: `journalctl -u rilis-worker -f`.

## Format paket (`rilis-video/rilis/<ep>/`)

| File | Isi |
|---|---|
| `rilis.json` | `ep, channel, judul, deskripsi, tags[], kategori (27), konten_sintetis, cekFakta, komentarPertama, durasi, dibuat` |
| `video.mp4` | render final; dicek tidak terpotong (≥ durasi VO) dan ≤ 180 dtk |
| `thumb.png` | varian `thumbPilihan` dari `video/thumb/<ep>.json` (opsional) |

Komentar pertama tidak bisa disematkan lewat API; owner menyematkan manual atau dibiarkan di deskripsi.

## Laporan (`laporan/terbaru.json`)

Per video: `judul, terbit, status, durasi, views, likes, komentar` (Data API) + `views, averageViewDuration, averageViewPercentage, likes, comments, shares, subscribersGained` (Analytics API). Metrik **ditonton vs digeser** tidak tersedia di API; owner mengirim screenshot Studio sesekali.
