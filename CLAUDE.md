# Aturan kerja proyek

## animasi-kusaka (seri animasi KUSAKA)

Aturan dari pemilik proyek, WAJIB diikuti di setiap sesi:

1. **Dilarang merender ulang video tanpa perintah.** Jangan jalankan `npm run render`, `npm run render:shorts`,
   atau `remotion render` kecuali pemilik secara eksplisit meminta render video.
2. **Dilarang mengirim preview MP4 tanpa perintah.** Preview cukup berupa **gambar sheet** (model sheet, lineup,
   location sheet, atau still PNG). Kirim video hanya jika pemilik memintanya.
3. **Konsistensi adalah prioritas utama.** Karakter, suara, latar, editing, dan SFX dikunci
   (`npm run check:characters`). Jangan mengubah kanon (`canon.json`, `locations.json`, `editing.json`, `sfx.json`,
   file rig/set) tanpa diminta. Kalau diminta, naikkan versi, render ulang sheet (`npm run sheets`), lalu
   `npm run lock:characters`.
4. **Suara terkunci:** hanya voice dari `canon.json` (ElevenLabs `eleven_v4`, seed tetap, voice library publik).
   Tidak boleh mengganti, menebak, atau memakai suara cadangan. Jangan menulis API key di repo.
5. **Teks di video hanya subtitle** (tanpa nama pembicara), plus caption resmi dari `editing.json`.
6. **SFX hanya pelengkap**: volume rendah di bawah dialog (batas di `sfx.json`), satu SFX untuk satu makna.
7. Selalu commit dan push ke branch kerja setelah perubahan.

Panduan cerita dan strategi: `animasi-kusaka/SERIES_BIBLE.md`.
