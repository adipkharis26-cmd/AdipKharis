#!/usr/bin/env bash
# Jalankan Catatan Tani di macOS/Linux
cd "$(dirname "$0")"
[ -d .venv ] || { python3 -m venv .venv && .venv/bin/pip install -r requirements.txt; }
echo "Buka http://localhost:5000  (dari HP satu WiFi: http://IP-laptop:5000)"
.venv/bin/python app.py
