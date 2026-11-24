# Perintah owner: N video per divisi aktif → paket rilis

Owner cukup mengetik di sesi baru (repo `adipkharis26-cmd/AdipKharis`, branch `ccr-89b3a748-96svlz`, environment `adipkharis`):

```
Jalankan workflow/prompts/1-video-per-divisi.md
```
atau dengan jam mulai dan jumlah: `Jalankan workflow/prompts/1-video-per-divisi.md jam 22:00 3 video`

**N** = jumlah video per divisi hari ini (default 1 kalau tidak disebut). Owner juga boleh menyebut divisi, mis. `ternyata leluhur 2 video`: hanya divisi itu yang dikerjakan. Setiap video dikerjakan di sesi sendiri, dan perintah berikutnya meneruskan divisi + N yang sama.

Video yang jadi menjadi **stok** di branch `rilis-video`. GitHub Actions memposting satu video acak per divisi, minimal 12 jam sekali (lihat `workflow/RILIS.md`).

Perintah ini dihitung sebagai ACC owner untuk judul yang dipilih dan untuk render penuh. Bekerjalah sendiri tanpa bertanya. Patuhi `CLAUDE.md` (terutama aturan 4 hemat kuota).

## 0. Kalau owner menyebut jam
Kalau sekarang (WIB) belum jam itu: buat **satu** scheduled task dengan `create_trigger`: `run_once_at` = `<tanggal hari ini>T<jam>:00[Asia/Jakarta]`, `create_new_session_on_fire: true`, `initiation: "human_request"`, `name: "Charizch: 1 video/divisi"`, `prompt` = "Jalankan workflow/prompts/1-video-per-divisi.md N video (repo adipkharis26-cmd/AdipKharis, branch ccr-89b3a748-96svlz)" dengan N dari perintah owner. Jawab satu baris ("Dijadwalkan jam …") lalu **berhenti**. Jangan baca file lain.

## 1. Pilih SATU divisi (satu sesi = satu video)
- Divisi aktif = channel di `workflow/config.json` dengan `"aktif": true`, urut seperti di file (cek cepat: `python3 -c "import json;print([(k,c['prefix']) for k,c in json.load(open('workflow/config.json'))['channels'].items() if c.get('aktif')])"`).
- Divisi sudah selesai hari ini kalau di branch `rilis-video` sudah ada **N** paket `rilis/<prefix>NN/rilis.json` dengan `dibuat` bertanggal hari ini (WIB):
  `git fetch origin rilis-video 2>/dev/null && git ls-tree --name-only origin/rilis-video rilis/` lalu `git show origin/rilis-video:rilis/<ep>/rilis.json | head -c 600` hanya untuk N episode terbaru divisi itu.
- Kalau owner menyebut divisi, hanya divisi itu. Ambil divisi pertama yang belum mencapai N. Kalau semua sudah: jawab "Semua divisi sudah punya video hari ini" lalu berhenti.

## 2. Judul (maks 3 pencarian)
- Kalau di Charizch Agent (`ideas`, via `ArtifactData`) ada ide divisi itu berstatus `acc` yang belum `selesai` dan tidak terkunci, pakai itu.
- Kalau tidak ada: buat **1** judul (berbeda dari judul divisi itu yang sudah dibuat hari ini) sesuai skill divisi dan aturan "tidak boleh diulang" di `workflow/prompts/ide-harian.md` langkah 5–6 (baca hanya bagian itu). Tulis ide dengan `status:"acc"`, `accAt`, `otomatis:true`, `tahap:"antre"`.

## 3. Produksi
Ikuti `workflow/prompts/produksi.md` untuk ide itu saja: bagian 0 (kecuali memilih pekerjaan lain dan `fire_trigger` produksi), TAHAP A, lalu TAHAP B sampai Publisher selesai. Render di background, timeout 2 jam, tanpa Chromium lain bersamaan.

## 4. Paket upload
- Cek Fakta lolos: `python3 video/src/rilis_paket.py <ep> --cek-fakta lolos --push`
- Kalau ada klaim yang tidak bisa diverifikasi: pakai `--cek-fakta belum` (worker tidak akan mengunggahnya) dan sebutkan di laporan.
- Worker di VPS mengambil paket ini dan mengunggah ke YouTube, Instagram, dan TikTok sesuai `workflow/RILIS.md`.

## 5. Divisi berikutnya, di sesi baru
Kalau masih ada divisi aktif yang belum mencapai N video hari ini (termasuk divisi yang baru dikerjakan), buat sesi baru dengan `mcp__claude-code-remote__create_session` (`source_url: https://github.com/adipkharis26-cmd/AdipKharis`, `source_revision: ccr-89b3a748-96svlz`, `prompt: "Jalankan workflow/prompts/1-video-per-divisi.md N video"`, N sama). Sesi baru = konteks pendek = lebih hemat. Lalu berhenti.

## 6. Laporan (maks 3 baris)
`<ep> <judul> — <durasi> dtk — paket rilis: di-push / cekFakta belum — kendala: …`
