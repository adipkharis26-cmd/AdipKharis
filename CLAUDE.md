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
   Shorts: subtitle Poppins Bold putih di kotak gelap transparan (`subtitleShorts`) + satu **CTA cerita** (`shortsCta`):
   satu baris dialog tokoh yang memberi alasan lucu untuk **like / kirim / ikuti** (netral YouTube + Instagram, tanpa kata
   "subscribe"), ditampilkan sebagai sisipan: latar diburamkan, teks ajakan besar di atas, ikon raksasa ditekan, lalu tokoh
   "korban" lelucon muncul dari tombol. Posisi bergantian: tengah (setelah punchline) atau akhir (sebelum kalimat loop).
   Video panjang tetap subtitle Oswald tanpa CTA.
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
    **Watermark resmi = Contoh 5** (pil gelap transparan + Logo 2 + KUSAKA/DESIGN, kiri atas) di **Shorts 9:16 dan video panjang 16:9** (ukuran disesuaikan; caption adegan 16:9 digeser ke bawahnya).
11. **Pratinjau hanya gambar** (storyboard/still). Video MP4 hanya dikirim kalau pemilik memintanya.
12. **DILARANG membelakangi lawan bicara.** Saat bercakap, pembicara menghadap lawan bicaranya dan semua pendengar
    menghadap pembicara. Diatur otomatis per baris oleh `src/edit/facing.ts` (lawan bicara: `"to"` di naskah → sapaan di
    teks → pembicara sebelumnya). Jangan dimatikan. Cek di storyboard: tidak ada wajah yang tertutup kepala tokoh lain.
    Berlaku untuk produksi ke depan (Shorts & episode). Video yang sudah dirilis atau sedang dirender tidak diganggu.

13. **Format output final Shorts (TERKUNCI, pemilik 18 Nov 2026).** Setelah render, kirim ke pemilik berurutan:
    (1) **MP4 HQ**, (2) **thumbnail 9:16**, lalu (3) **judul + deskripsi** (siap salin, beserta tag/hashtag) ditulis di chat
    tepat di bawahnya. Nama keluaran: **"Shorts N - Judul Dua Kata"** (penomoran baru mulai Shorts 1 = "Mantan Matematika",
    id internal `shorts04`). Arsip GitHub: `releases/Kusaka-ShortsN-Judul-Dua-Kata.mp4`. Judul YouTube/Instagram tetap tanpa nomor.

Panduan cerita dan strategi: `animasi-kusaka/SERIES_BIBLE.md`.
14. **Tindakan dan benda HARUS terlihat (sinkron dengan dialog).** Kalau dialog menyebut benda atau tindakan, di layar harus ada
    benda itu dan tindakan itu dilakukan, bukan sekadar bicara dan gerak tangan. Contoh: kertas ulangan dipegang/ditunjukkan/dibaca,
    tiang dan tali bendera ada, bendera naik dan terbalik, gerbang benar-benar menutup, belanjaan di pasar, bola, gelas, buku PR, HP.
    Sistem: `hold` (benda di tangan per baris/adegan), aksi `hold|carry|give|show|read|pull|salute`, `tracks` (gerbang/bendera/angkot/hormat/tali),
    `bag` (tas), `src/characters/Props.tsx`. Murid memakai **tas punggung saat berangkat dan pulang sekolah** (lokasi gerbang/halte otomatis,
    atau `"bag"` per adegan; tanpa tas di jam pelajaran/istirahat). NPC latar ikut bertindak (hormat serentak, bertas).
    Momen kunci memakai shot `wide` agar bendanya terlihat. Audit tiap naskah: baca setiap baris dan tanya "benda/tindakan apa yang disebut?".
    Berlaku mulai Eps. 3 dan seterusnya; tambahkan detail yang kurang tanpa menunggu perintah, tetapi RENDER video tetap hanya atas perintah pemilik (aturan 1).
15. **Pulang/berangkat sekolah TETAP berseragam** (pemilik 18 Nov 2026). Adegan bercaption "SEPULANG SEKOLAH" / "SENIN PAGI" otomatis berseragam
    (lengkap dengan tas punggung), walau lokasinya warung/halte. Pakaian bebas hanya untuk akhir pekan, malam, dan di rumah (`"wear"` per adegan).
    Topi upacara abu-abu dipakai murid (non-hijab) di lapangan upacara. Audit benda/tindakan: `npm run audit:props -- <naskah.json>` (harus 0 sebelum rilis).
16. **Visual dibuat sesuai kebutuhan tiap episode, bukan hanya dari pustaka yang ada** (pemilik 18 Nov 2026). Untuk setiap naskah baru: baca baris demi baris,
    daftar semua benda/tindakan/tempat/suasana yang disebut atau tersirat, lalu RISET dan BUAT sendiri yang belum ada (benda di `Props.tsx`, aksi/pose,
    bagian set yang bergerak, lokasi baru, NPC latar). Jangan memalsukan dengan gerak tangan atau memakai benda yang "mirip saja". Jalankan
    `npm run audit:props` sampai 0, kirim pratinjau gambar. Tetap berlaku: desain karakter & suara terkunci, kanon baru naik versi + sheet (dengan izin) + kunci,
    render video hanya atas perintah, push hanya setelah "cocok".
17. **Intro resmi = gaya D "meriah", 6 detik, SELALU di awal episode (pemilik 18 Nov 2026).** `IntroD` di `src/branding/IntroCine.tsx`: 5 shot cepat dari
    set asli (gerbang, upacara, kantin, basket, warung senja), umbul-umbul merah-putih, konfeti, lencana Logo 2 + KUSAKA DESIGN + 8 tokoh bersorak.
    Tema sinematik, BUKAN komik. Musik instrumental orisinal + SFX perayaan (`public/intro/`, terkunci). Naskah long: `"intro": {"style": "D"}` (detik 0).
    Transisi ke episode = "tembus cahaya" (zoom menembus lencana → cahaya hangat → adegan pertama muncul 0,5 dtk). Shorts TIDAK diberi intro.
    Gaya A/B/C hanya arsip. Pratinjau intro berupa gambar (`npx remotion still src/branding/index.ts IntroD --frame=N`).
