@echo off
REM Jalankan Catatan Tani di Windows (klik dua kali file ini)
cd /d %~dp0
if not exist .venv (
  python -m venv .venv
  .venv\Scripts\pip install -r requirements.txt
)
echo Buka http://localhost:5000 di browser. Dari HP (satu WiFi): http://IP-laptop:5000
.venv\Scripts\python app.py
pause
