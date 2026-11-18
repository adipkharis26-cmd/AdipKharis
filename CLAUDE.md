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
7. **Push ke GitHub hanya setelah pemilik bilang "cocok".** Hasil baru (thumbnail, branding, episode, dll.) dibuat
   dulu sebagai draft di `animasi-kusaka/drafts/` (tidak ikut git) dan dikirim sebagai gambar pratinjau. Setelah
   pemilik bilang "cocok", pindahkan ke lokasi final, commit, lalu push ke branch kerja.
8. Video final yang sudah disetujui disimpan di `animasi-kusaka/releases/` (dikompres < 100 MB agar muat di GitHub).
9. **Durasi (dikunci di `editing.json` → `formats`, divalidasi saat `npm run voice`):**
   - **Long 16:9:** minimal **6 menit**. Pemilik boleh mengatur minimum lain per episode lewat `"minSeconds"`.
   - **Shorts 9:16:** minimal **40 detik**, maksimal 3 menit, ideal 40–60 detik. Naskah Shorts dibuat sendiri
     (`"format": "shorts"`), bukan potongan acak dari episode panjang.
10. **Brand terkunci** (`src/branding/brand.json`): nama channel **Kusaka Design**, logo resmi **Logo 2 (lencana)**,
    banner resmi **Banner 3 (Panel Komik)**. Thumbnail: teks hanya judul (tanpa nomor episode/lencana EPS),
    **dilarang memakai uang / mata uang (Rp)**. Aset di `animasi-kusaka/brand/` (`npm run brand`).
    **Watermark Shorts resmi = Contoh 5** (pil gelap transparan + Logo 2 + KUSAKA/DESIGN, kiri atas), hanya di Shorts.
11. **Pratinjau hanya gambar** (storyboard/still). Video MP4 hanya dikirim kalau pemilik memintanya.
12. **DILARANG membelakangi lawan bicara.** Saat bercakap, pembicara menghadap lawan bicaranya dan semua pendengar
    menghadap pembicara. Diatur otomatis per baris oleh `src/edit/facing.ts` (lawan bicara: `"to"` di naskah → sapaan di
    teks → pembicara sebelumnya). Jangan dimatikan. Cek di storyboard: tidak ada wajah yang tertutup kepala tokoh lain.
    Berlaku untuk produksi ke depan (Shorts & episode). Video yang sudah dirilis atau sedang dirender tidak diganggu.

Panduan cerita dan strategi: `animasi-kusaka/SERIES_BIBLE.md`.
