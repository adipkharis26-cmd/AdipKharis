@echo off
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"
title Push ke GitHub - AdipKharis
echo ==================================================================
echo   MENGUNGGAH KE GITHUB: adipkharis26-cmd/AdipKharis
echo ==================================================================
echo.
echo Jika muncul pop-up login GitHub di browser, silakan klik 'Sign in' / 'Authorize'.
echo.
git push -u origin main
echo.
pause
