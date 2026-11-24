# Prompt pindah sesi — Charizch Agent

Salin blok di bawah ke sesi baru (repo `adipkharis26-cmd/AdipKharis`, branch `ccr-89b3a748-96svlz`). Perbarui bagian "Keadaan" setiap kali pindah sesi.

```
Lanjutkan proyek Charizch Agent (dulu "Kantor Konten") di branch ccr-89b3a748-96svlz.
Baca dulu CLAUDE.md (aturan 1–4, terutama aturan 4 hemat kuota), lalu workflow/README.md
dan workflow/RILIS.md bagian yang relevan saja. Jangan baca file besar utuh.

KEADAAN (24 Nov 2026):
- Divisi: Mas Kharis (ep), Ternyata Leluhur (tl), Dari 1 mnt (dm), Ohhiyaa! (oh). Skill tiap divisi
  TERKUNCI (.claude/skills/*), hanya diubah atas perintah owner.
- Ternyata Leluhur TL01–TL13 selesai (naskah/tlNN-*.md, video/src/tlNN.*, video/vo/tlNN*,
  video/thumb/tlNN.json). MP4 & PNG tidak di git (video/out/ di-ignore).
- Data channel TL: retensi bagus (APV 80–96%), tapi view mentok 1–2 rb. Retensi jatuh tajam di
  5–8 dtk terakhir (bagian CTA). View tertinggi: smong/tsunami 8,6 rb, tiang rawa 5,9 rb,
  "Atap Ini Bukan Genteng, Tapi Serabut Hitam!" 4,8 rb (judul pernyataan + wajah kaget).
  Data "ditonton vs digeser" belum ada; minta owner screenshot bila perlu.
- Usulan skill v4 TL (menunggu ACC owner): frame 0 = momen dramatis bergerak + wajah kaget,
  judul pernyataan ≤35 karakter, ganti ekor CTA dengan akhiran loop (CTA pindah ke komentar),
  prioritas topik bertaruhan tinggi (seri bencana).
- Rilis otomatis: rilis_worker.py (jalan di VPS owner) + video/src/rilis_paket.py + workflow/RILIS.md.
  Keputusan owner: jeda veto 12 jam. Upload API dikunci (RILIS_API_TERAUDIT=0) sampai proyek
  Google lolos audit YouTube. VPS BELUM ADA.
- Rencana besar: publisher multi-platform (YouTube, Instagram Reels, TikTok) multi-akun per divisi
  + Analis (laporan harian, rapor mingguan, eksperimen). TikTok & YouTube wajib audit API;
  Instagram butuh akun Professional + Meta App.

- Branch utama = ccr-89b3a748-96svlz (branch claude/stickmen-… usang, berhenti di TL09).
  Sesi terjadwal "Charizch Agent: ide harian" & "produksi" sudah menunjuk branch ini, masih NONAKTIF.

MENUNGGU OWNER:
1. Izin membuat branch `rilis-video` dan `laporan`.
2. Daftar proyek/divisi + akun YouTube/Instagram/TikTok masing-masing; divisi prioritas.
3. ACC skill v4 Ternyata Leluhur.
4. Setup VPS + Google Cloud + pengajuan audit YouTube/TikTok + Meta App (panduan: workflow/RILIS.md).

TUGAS SESI INI: <isi satu tugas saja, mis. "republish halaman kantor jadi Charizch Agent"
atau "buat TL14 topik X" atau "tambah adaptor Instagram ke rilis_worker.py">
```

## Tugas tertunda yang sudah jelas
- (kosong) Halaman kantor live sudah berganti nama jadi Charizch Agent pada 24 Nov 2026 (versi 27). Perubahan berikutnya ke halaman itu tetap lewat `Artifact read` dulu, karena halaman menyimpan versinya sendiri.
