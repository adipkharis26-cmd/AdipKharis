@echo off
title BGRis Media
echo ==============================================================
echo                      BGRIS MEDIA
echo ==============================================================
echo.

cd /d "%~dp0"

IF NOT EXIST "venv\Scripts\activate.bat" (
    echo [!] Lingkungan virtual belum ditemukan. Menyiapkan...
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
) ELSE (
    call venv\Scripts\activate.bat
)

:: Deteksi IP Lokal Wi-Fi secara dinamis
set LOCAL_IP=192.168.1.13
for /f "delims=" %%i in ('python -c "import socket; s=socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8', 80)); print(s.getsockname()[0]); s.close()" 2^>nul') do set LOCAL_IP=%%i
if "%LOCAL_IP%"=="" set LOCAL_IP=192.168.1.13

echo [*] Menjalankan Server BGRis Media...
echo [*] Buka di Laptop        : http://127.0.0.1:8000
echo [*] Buka di HP (Wi-Fi)     : http://%LOCAL_IP%:8000
echo.
echo [*] CATATAN PENTING AKSES HP:
echo     1. Pastikan HP terhubung ke Wi-Fi yang SAMA dengan Laptop (jangan pakai Paket Data).
echo     2. Jika saat dibuka di HP muter-muter terus / tidak tersambung:
echo        Tutup server ini, lalu jalankan file 'izinkan_akses_hp.bat'
echo        (Klik kanan -^> Run as administrator) untuk membuka blokir Firewall Windows.
echo.

start "" "http://127.0.0.1:8000"
python -m uvicorn app:app --host 0.0.0.0 --port 8000

pause
