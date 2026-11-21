Ohhiyaa! next (hemat kuota, gaya terkunci, jangan ubah .claude/skills/*). Branch claude/nifty-euler-rhvstj. Target: 1 MP4 + 2 thumbnail + 1 judul + 1 deskripsi.
Baca sekali: SKILL.md ohhiyaa bagian 4, 9, 10 dan video/spec/CONTOH.json.
1. ohNN = berikutnya di workflow/oh-topik.json. `python3 video/src/oh_format.py ohNN --simpan`; patuhi hasilnya.
2. Riset sendiri, maks 3 WebSearch standard: topik BARU (objek/patokan di luar yang jenuh; kolam_patokan_baru), sumber primer, hitungan bisa dicek, 1 cek duplikat.
3. Tulis HANYA video/spec/ohNN.json; `python3 video/src/ohspec.py ohNN` sampai SPEC OK, lalu `--simpan`.
4. `python3 video/src/tts_elevenlabs.py ohNN` sekali (total ≤53 dtk).
5. Tulis video/src/ohNN.html (salin oh09.html + `<script src="ohlib.js">` setelah ohhiyaa3d.js) dan ohNN.js (pola oh05/07/09; ohlib).
6. `python3 video/src/ohsheet.py ohNN`; Read sekali; perbaiki maks 2 putaran.
7. `python3 video/src/ohrun.py ohNN` via run_in_background, sekali; tanpa Monitor/polling.
8. Commit+push (bukan video/out). Kirim MP4+2 thumbnail (SendUserFile); tempel judul+deskripsi dari siap.py dalam kotak kode.
Larangan: render penuh untuk preview, render ulang tanpa perubahan, naskah/VO/thumb manual, menukar hasil oh_format, objek/patokan yang ditolak ohspec, baca gambar berulang, cetak berkas besar. Angka tanpa sumber = ganti topik.
