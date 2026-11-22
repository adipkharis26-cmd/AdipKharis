# FUNK MANDALA (Slowed) — Konsep A "Anime-only isn't ready"

**Hasil analisis sound:** durasi 18,97 dtk (bukan 28 dtk seperti di nama file) · ~103 BPM · 1 ketukan = 0,58 dtk = 17 frame @30fps · mood phonk slowed.

## Peta sound

| Waktu | Yang terjadi di sound | Fungsi di edit |
|---|---|---|
| 0,00–0,57 | Hening sebelum masuk | Teks hook langsung tampil di layar hitam |
| 0,57–2,90 | Hentakan pembuka + *swell* panjang | 1 shot panjang (bukan cut per ketukan) — mata Asta menyala |
| 2,90–5,27 | **Bass hilang**, bagian sepi | Ketegangan: Liebe, desaturasi, teks "Season 2" |
| 5,27 | Bass masuk lagi | Cut + flash → Nacht |
| 7,60 · 8,07 · 8,77 | 3 hentakan *stutter* (naik) | 3 extreme close-up cepat, flash tiap hentakan |
| **9,37** | **DROP** (puncak volume di 10,0) | Hero shot Asta Devil Union, glow paling terang di 10,0 |
| 10,63–10,80 | Sunyi total 5 frame | Layar hitam (efek "napas sebelum ledakan") |
| 10,80–17,83 | **Gated chop**: 10 potongan bunyi terputus-putus | 1 karakter per potongan; jeda antar-potongan = *dip* hitam 80% |
| 17,83–18,97 | Ekor / fade | "UPCOMING EPISODES" + kembali ke mata Asta → loop |

Kenapa bukan cut tiap 2 ketukan? Lagu ini tidak berdetak rata: ada *swell* panjang, jeda bass, dan bagian *gated*. Cut ditaruh di **hentakan yang benar-benar terdengar** (deteksi lonjakan volume), bukan di grid ketukan, supaya terasa "kena".

## Shot list (21 shot, frame-akurat)

Lihat [`funk_mandala_shotlist.txt`](funk_mandala_shotlist.txt) — sumber utama; ubah adegan/teks di sana lalu jalankan ulang animatic.

| # | Waktu | Adegan | Teks layar |
|---|---|---|---|
| 1 | 0,00–0,57 | Layar hitam | ANIME-ONLY ISN'T READY... |
| 2 | 0,57–2,90 | Close-up mata Asta, mata merah menyala di hentakan, angin & bara | (lanjut) |
| 3 | 2,90–4,13 | Siluet Liebe di belakang Asta, desaturasi | FOR WHAT'S COMING IN SEASON 2 |
| 4 | 4,13–5,27 | Jabat tangan Asta & Liebe | |
| 5 | 5,27–6,43 | Nacht menyeringai, bayangan 4 iblis | |
| 6 | 6,43–7,60 | Yami dirantai di kastil Spade | THEY TOOK YAMI. |
| 7–9 | 7,60 / 8,07 / 8,77 | Mata Asta → mata Liebe → grimoire hitam | |
| **10** | **9,37–10,63** | **Asta Devil Union penuh (hero shot I2V)** | **EPISODE 17X** |
| 11 | 10,63–10,80 | Hitam | |
| 12–20 | 10,80–17,83 | Asta tebas · Yuno mode Spade · Noelle Valkyrie · Yami · Nacht Devil Union · Mereoleona · Black Bulls · Asta & Yuno split · Asta angkat pedang | |
| 21 | 17,83–18,97 | Mata Asta gelap lagi (loop) | UPCOMING EPISODES |

Ganti `17X` dengan nomor episode yang baru tayang / akan tayang saat upload.

## File

- `funk_mandala_shotlist.txt` — shot list yang bisa diedit
- `funk_mandala_markers.txt` — marker untuk `MMV_BlackClover_1x1.jsx` (CUT, IMPACT, DROP, GAP)
- `funk_mandala_animatic.mp4` — animatic 1:1 dengan sound: kartu per shot, flash & dip hitam di titik yang sama dengan rig AE

## Langkah di After Effects

1. Siapkan 21 panel/klip dengan nama urut `01_...png` s/d `21_...png` sesuai tabel (shot 1 & 11 boleh gambar hitam).
2. Jalankan `MMV_BlackClover_1x1.jsx` → pilih `funk_mandala_markers.txt`, file sound, folder panel. Karena ada marker CUT, skrip langsung memakai shot list ini (tidak bertanya ketukan).
3. Di bagian `CFG` skrip: `labelText: "ASTA"`, `accent: [1, 0.18, 0.12]` (merah anti-magic).
4. Shot 2, 10, dan 21 dibuat dengan micro-motion penuh (Wave Warp rambut, mask mata + Glow), sisanya cukup parallax + push-in.

## Video jadi tanpa After Effects (render langsung)

Edit lengkap dengan gambar resmi dari Black Clover Wiki ada di [`../edits/funk_mandala_asta.py`](../edits/funk_mandala_asta.py) (gambar, fokus wajah, zoom, label, flash, dan jeda hitam per shot).

```bash
python3 fetch_images.py edits/funk_mandala_asta.py images/
```
```bash
python3 render_mmv.py edits/funk_mandala_asta.py images/ funk_mandala.mp3 BlackClover_AnimeOnly_1x1.mp4
```

Perubahan dari shot list awal: shot 6 = Nacht & 4 iblis (tidak ada gambar Yami dirantai di wiki), shot 9 = panel manga Asta vs Liebe, teks drop = label "DEVIL UNION / ASTA x LIEBE", penutup = "BLACK CLOVER SEASON 2 / UPCOMING EPISODES" (tanpa nomor episode supaya tidak salah).
