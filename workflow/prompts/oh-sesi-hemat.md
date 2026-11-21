# Prompt sesi Ohhiyaa! HEMAT KUOTA (tempel ke sesi baru)

```
Kantor Konten, divisi Ohhiyaa!, branch claude/nifty-euler-rhvstj. Buat 1 episode baru sampai paket siap: 1 MP4 + 2 thumbnail + 1 judul + 1 deskripsi. HEMAT KUOTA, gaya terkunci (jangan ubah .claude/skills/*).
Baca sekali: CLAUDE.md, .claude/skills/ohhiyaa/SKILL.md (bagian 4, 9, 10), video/spec/CONTOH.json.
Urutan:
1. ohNN = episode berikutnya (lihat workflow/oh-topik.json). Jalankan `python3 video/src/oh_format.py ohNN --simpan`, patuhi format/alur/jawaban.
2. Riset sendiri, maks 3 WebSearch standard: topik BARU (objek dan patokan di luar yang sering dipakai, lihat kolam_patokan_baru), data dari sumber primer (BPS/NASA/Kemenkes/dll.), hitungan bisa dicek, 1 pencarian cek duplikat judul/angka.
3. Tulis HANYA video/spec/ohNN.json (ikuti CONTOH.json). Jalankan `python3 video/src/ohspec.py ohNN` sampai "SPEC OK", lalu ulangi dengan --simpan.
4. `python3 video/src/tts_elevenlabs.py ohNN` (sekali; total video <= 53 dtk).
5. Tulis video/src/ohNN.html (salin oh09.html, tambah <script src="ohlib.js"> setelah ohhiyaa3d.js) dan ohNN.js (pola oh05/oh07/oh09, pakai ohlib: hOf/towerOf/follow/lane/counterUI).
6. `python3 video/src/ohsheet.py ohNN`, Read sekali, perbaiki seperlunya (maks 2 putaran).
7. `python3 video/src/ohrun.py ohNN` dengan run_in_background, sekali. Jangan Monitor/sleep/polling.
8. Commit + push ke branch (spec, naskah, vo, js, thumb json; bukan video/out).
9. SendUserFile (mp4 + 2 thumbnail) dan tempel judul + deskripsi dari keluaran siap.py dalam kotak kode, tanpa berkas .txt.
Larangan: render video penuh untuk preview, render ulang tanpa perubahan, menulis naskah/VO/thumb JSON manual, menukar hasil oh_format.py, memakai objek/patokan yang ditolak ohspec, membaca gambar berulang, mencetak berkas besar. Angka tanpa sumber = ganti topik.
```
