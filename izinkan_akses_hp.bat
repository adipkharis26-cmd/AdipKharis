@echo off
title Izinkan Akses HP - BGRis Media
color 0b
echo ==============================================================
echo        BGRIS MEDIA - BUKA AKSES FIREWALL UNTUK HP
echo ==============================================================
echo.

:: Memeriksa dan meminta hak Administrator (UAC) jika belum elevated
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Meminta izin Administrator dari Windows...
    echo     Silakan klik 'Yes' / 'Ya' pada pop-up Windows yang muncul.
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

echo [*] Mendaftarkan port 8000 ke Windows Defender Firewall...
netsh advfirewall firewall delete rule name="BGRis Media (Port 8000)" >nul 2>&1
netsh advfirewall firewall add rule name="BGRis Media (Port 8000)" dir=in action=allow protocol=TCP localport=8000 profile=any >nul
if %errorlevel% equ 0 (
    echo [V] Berhasil membuka Port 8000 di Firewall!
) else (
    echo [X] Gagal menambahkan aturan Port 8000.
)

echo.
echo [*] Mendaftarkan izin program Python ke Windows Firewall...
netsh advfirewall firewall delete rule name="BGRis Media Python" >nul 2>&1
if exist "%~dp0venv\Scripts\python.exe" (
    netsh advfirewall firewall add rule name="BGRis Media Python" dir=in action=allow program="%~dp0venv\Scripts\python.exe" profile=any >nul
    echo [V] Berhasil mengizinkan Python Venv di Firewall!
) else (
    echo [!] Folder venv belum ada, aturan Port 8000 sudah cukup.
)

echo.
echo ==============================================================
echo              PENGATURAN FIREWALL SELESAI
echo ==============================================================
echo.

:: Deteksi IP Wi-Fi Lokal
for /f "tokens=*" %%i in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi*','Ethernet*' | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1).IPAddress"') do set DETECTED_IP=%%i

if "%DETECTED_IP%"=="" (
    set DETECTED_IP=192.168.1.13
)

echo [*] Alamat untuk dibuka di browser HP:
echo     ========================================
echo     >> http://%DETECTED_IP%:8000 <<
echo     ========================================
echo.
echo [!] PENTING:
echo     1. Pastikan HP terhubung ke jaringan Wi-Fi yang SAMA dengan laptop ini.
echo     2. Jangan menggunakan data seluler (kuota kartu SIM) saat membuka link di atas.
echo.
echo Tekan tombol apa saja untuk menutup jendela ini...
pause >nul
