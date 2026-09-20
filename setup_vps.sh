#!/bin/bash
# ==============================================================================
# Script Setup Otomatis VPS (Ubuntu/Debian) untuk BGRis Media YouTube Shorts Bot
# ==============================================================================

set -e

echo "=============================================================="
echo "      MEMULAI INSTALASI BGRIS MEDIA AUTOMATION DI VPS"
echo "=============================================================="

# 1. Update paket & instal paket esensial (Python, FFmpeg, Git, Curl)
echo "[1/5] Memperbarui sistem dan menginstal FFmpeg & Python..."
sudo apt-get update -y
sudo apt-get install -y python3 python3-pip python3-venv ffmpeg git curl

# 2. Buat Virtual Environment Python
echo "[2/5] Menyiapkan Python Virtual Environment..."
python3 -m venv venv
source venv/bin/activate

# 3. Instal pustaka dari requirements.txt
echo "[3/5] Menginstal dependencies Python..."
pip install --upgrade pip
pip install -r requirements.txt

# 4. Pastikan direktori penyimpanan tersedia
echo "[4/5] Menyiapkan folder data, unduhan, dan thumbnail..."
mkdir -p data downloads thumbnails

# 5. Konfigurasi Systemd Service (Agar berjalan 24/7 dan hidup otomatis jika VPS restart)
echo "[5/5] Mendaftarkan service background 24/7 (systemd)..."
CURRENT_DIR=$(pwd)
CURRENT_USER=$(whoami)
SERVICE_FILE="/etc/systemd/system/bgris-media.service"

sudo bash -c "cat <<EOF > $SERVICE_FILE
[Unit]
Description=BGRis Media YouTube Shorts Automation Service
After=network.target

[Service]
User=$CURRENT_USER
WorkingDirectory=$CURRENT_DIR
ExecStart=$CURRENT_DIR/venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF"

sudo systemctl daemon-reload
sudo systemctl enable bgris-media
sudo systemctl restart bgris-media

IP=$(curl -s https://ifconfig.me || curl -s https://api.ipify.org || echo "IP_VPS_ANDA")

echo ""
echo "=============================================================="
echo "          INSTALASI SELESAI & BOT AKTIF 24 JAM!"
echo "=============================================================="
echo "Dashboard Web Anda dapat diakses di browser:"
echo "👉 http://${IP}:8000"
echo ""
echo "Panduan perintah kontrol di VPS:"
echo "• Cek status bot : sudo systemctl status bgris-media"
echo "• Lihat log live : sudo journalctl -u bgris-media -f"
echo "• Restart bot    : sudo systemctl restart bgris-media"
echo "• Stop bot       : sudo systemctl stop bgris-media"
echo "=============================================================="
