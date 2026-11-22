# Black Clover MMV 1:1 — Rencana Produksi (Manga + Anime, sinkron sound)

> Berdasarkan skill `manga-motion-ae-5s` + bedah video referensi `@tezxsokun` (76,5 dtk, 3 video).
> Format target: **1:1 (1080×1080), 30 fps**, tiap video 15–25 dtk, disusun dari *shot* MMV 0,5–5 dtk.
> Tanggal riset: 22 Nov 2026.

---

## 1. Bedah video referensi (3 video dalam 1 file)

Hasil analisis frame (deteksi pergantian scene) + audio (loudness & tempo):

| | Video 1 — "Best Women" | Video 2 — "Asta's Crowning" | Video 3 — "Episode 170 & 171 / Upcoming" |
|---|---|---|---|
| Waktu di file | 0:00 – 0:24 | 0:24 – 0:47 | 0:47 – 1:16 |
| Tempo sound | ~96 BPM (phonk lambat / slowed) | ~129 BPM (lagu emosional, pencapaian) | ~130 BPM (dipakai half-time ~65, phonk/hype) |
| Struktur | Intro logo → ranking karakter (Noelle → Nero → Dorothy) → **grid 2×2 dengan siluet "?"** → reveal **Mereoleona** + "Allow me to join in this fight" → flash api putih-kuning | Panel manga diwarnai: Asta dinobatkan → Black Bulls bersorak ("Everyone's happy and cheering for him") → close-up Asta kecil babak belur → kilas balik → teks **"THAT DREAM"** → Asta dewasa bermahkota "…how true" | Teks **"EPISODE 170 & 171"** → Asta kaget + Liebe → jabat tangan Asta–Liebe → Nacht → Asta Devil Union mata merah → **"UPCOMING EPISODES"** → Black Bulls / Yami |
| Hook utama | Rasa penasaran (siapa "?" nomor 1) | Payoff mimpi 11 tahun (kecil → Wizard King) | FOMO episode yang akan tayang |
| Teknik visual | Panel manga diwarnai + *glow* nama karakter, kamera sway, *flash* di beat | *Kontras kecil-vs-besar*, teks quote di jeda, *dissolve* lembut | *Cut* tajam di drop (drop terdeteksi di 17,2 dtk = cut besar di 1:04), mata menyala, partikel bara |

**Pola yang konsisten (inilah "formula"-nya):**
1. Detik 0–1: teks/visual yang memancing pertanyaan (logo hanya ≤1 dtk).
2. Panel manga **diwarnai + 2.5D parallax**, garis tinta tetap tajam.
3. Setiap pergantian shot jatuh **tepat di ketukan**; *drop* lagu = reveal karakter/momen terkuat.
4. Bagian lagu yang tenang = teks quote/subtitle (Video 2: "THAT DREAM", "…how true").
5. Watermark tetap di bawah tengah; label nama karakter berglow warna khas karakter.

**Yang bisa dikembangkan:** referensi masih 9:16 dengan UI player ikut terekam (ikon pause/fullscreen terlihat) → versi kita bersih, 1:1, teks di area aman, dan setiap shot diberi *micro-motion* (napas, rambut, mata menyala) sesuai skill, bukan sekadar zoom.

---

## 2. Konteks Black Clover saat ini (kenapa sekarang momennya)

- **Anime Season 2 sedang tayang.** Episode 171 (awal Season 2) tayang perdana di Anime Expo 4 Juli 2026, dan anime resmi kembali mulai 3 Oktober 2026 — melanjutkan dari arc Spade Kingdom (latihan Devil Union Asta & Liebe, persiapan Yuno, penyerbuan Spade). Ini persis jenis konten Video 3 ("Upcoming Episodes").
- **Manga sudah tamat** di chapter 392 (Jump GIGA, Spring 2026); Lucius Zogratis dikalahkan Asta & Yuno, dan arc akhir menyelesaikan rivalitas Wizard King. Momen ending (seperti Video 2) kini bisa dibuat tanpa takut "salah tebak".
- **Celah konten:** penonton anime-only baru masuk lagi setelah hiatus 5 tahun → penasaran "apa yang akan terjadi". Video bergaya *"anime-only belum siap…"* yang memakai panel manga berwarna = perpaduan manga + anime yang Anda minta.

> Catatan: saya tidak punya akses ke analitik YouTube/TikTok. Penilaian potensi di bawah adalah penilaian editorial (momen ikonik + konteks penayangan Season 2), bukan angka view.

---

## 3. Matriks Sound ↔ Momen

Aturan inti: **jenis sound menentukan panjang shot dan jenis efek; momen menentukan di mana *drop* jatuh.**

| Mood sound | BPM tipikal | Ganti shot | Efek di ketukan keras | Momen Black Clover yang cocok |
|---|---|---|---|---|
| **Phonk / drift phonk** (cowbell, 808) | 90–130 | tiap 1–2 ketukan (≈0,5–1,3 dtk) | Flash putih 2 frame + shake + zoom punch; mata merah menyala | Asta Devil Union, Black Asta, Mereoleona datang, Yami "Dark Cloaked Dimension Slash", Nacht 4 devil union |
| **Sedih** (piano, vokal lambat, slowed+reverb) | 60–85 | tiap 4–8 ketukan (3–6 dtk) | Tanpa flash; desaturasi, *film grain*, *slow push-in*, teks quote di jeda | Kisah Liebe & ibunya (Lichita), Asta lumpuh setelah duel Vetto, Nacht & saudara kembarnya, Asta kecil diremehkan "tanpa sihir" |
| **Pencapaian / epic** (orchestral, rise lalu klimaks) | 120–140 | build-up 4 ketukan, klimaks 2 ketukan | Glow bloom + light rays + partikel naik | Asta dinobatkan / mimpi Wizard King, Grimoire 5 daun pertama kali, Noelle Valkyrie Dress, Yuno mode Spade |
| **Hype / trailer** | 100–140 | 1–2 ketukan | Flash + RGB split + teks besar | "UPCOMING EPISODE 17X", rekap minggu ini, adu kekuatan Asta vs Yuno |

**Cara memakainya:** kirim file sound → jalankan `beat_sync.py` (lihat §7). Skrip mencari BPM, setiap ketukan, *impact* (kick terkeras), *drop*, dan bagian sepi, lalu membuat cut list. Momen terkuat **selalu** ditaruh di shot yang dimulai pada `DROP`.

---

## 4. Enam konsep video (siap produksi, 1:1)

Struktur waktu di bawah memakai contoh BPM; geser ke marker hasil `beat_sync.py` dari sound Anda.

### Konsep A — "Anime-only isn't ready for Episode 17X" *(phonk, prioritas #1)*
- **Hook teks 0–1 dtk:** `ANIME-ONLY ISN'T READY…` di atas mata Asta yang tertutup bayangan.
- **Kenapa kuat:** menunggangi jadwal tayang mingguan Season 2; upload 6–24 jam setelah tiap episode.
- **Shot list (phonk 100 BPM, 1 ketukan = 0,6 dtk):**
  1. 0,0–1,2 — Asta menunduk, gelap, partikel bara (napas + kamera push-in).
  2. 1,2–2,4 — Liebe di belakang Asta, mata merah *pulse* tiap ketukan.
  3. 2,4–3,6 — jabat tangan Asta–Liebe (panel seperti di referensi), zoom punch di kick.
  4. 3,6–4,8 — siluet Nacht + teks `EPISODE 17X`.
  5. **DROP** — Asta Devil Union penuh: flash, shake, mata & pedang merah menyala, rambut berkibar (Wave Warp).
  6. Drop +2 ketukan tiap shot — 4–6 shot cepat: Black Bulls, Yami, Noelle, Yuno; tutup dengan `UPCOMING EPISODES` + logo.
- **Loop:** shot terakhir = komposisi yang sama dengan shot 1 (gelap) supaya Shorts terasa berulang mulus.

### Konsep B — "He had NO magic." *(pencapaian, potensi evergreen)*
- **Hook:** Asta kecil babak belur tersenyum + teks `HE HAD NO MAGIC…`
- Build-up (4 ketukan per shot): Asta kecil diejek → latihan sendirian → grimoire tidak muncul.
- **Drop:** grimoire 5 daun hitam muncul, *light rays* + debu emas naik.
- Klimaks: Asta dewasa bermahkota (ending manga) + teks `…NOW HE'S THE WIZARD KING` (pakai label **SPOILER** kecil di pojok untuk anime-only — memicu komentar).
- Paralel visual Video 2 referensi, tapi dibalik urutannya (dari nol → puncak) agar alurnya beda.

### Konsep C — "Liebe's mother" *(sedih)*
- **Hook:** Liebe kecil memeluk Lichita, teks `HE ONLY EVER HAD ONE PERSON…`.
- Shot 4–6 dtk, desaturasi 40%, grain, potong di awal frasa piano.
- Quote di bagian sepi (marker `QUIET`): `"…you're my family"` atau dialog asli dari panel.
- Penutup: Asta & Liebe kontrak — warna kembali penuh tepat di klimaks vokal (sedih → harapan).

### Konsep D — "Best Women of Black Clover, but #1…" *(phonk, pengembangan Video 1)*
- Grid 2×2 karakter → kotak terakhir siluet `?` (penasaran) → reveal di drop.
- Ganti urutan/karakter agar tidak menjiplak: Charlotte, Secre, Vanessa, Noelle Valkyrie Dress → `?` = Mereoleona atau Noelle.
- Tambahan: angka ranking (#4 → #1) di tiap ketukan, label nama berwarna sihir masing-masing (biru air Noelle, ungu Secre, merah Vanessa, emas Charlotte).

### Konsep E — "Asta vs Yuno: the promise" *(pencapaian/epic, momen ending manga)*
- Hook: dua anak kecil di gereja Hage + teks `THEY PROMISED AS KIDS…`
- Split-screen 1:1 (kiri Asta merah/hitam, kanan Yuno hijau/emas) — format persegi sangat pas untuk ini.
- Drop: tabrakan pedang & angin, flash dua warna, lalu panel duel akhir.
- Akhiri dengan pertanyaan `WHO DESERVED IT?` → dorong komentar.

### Konsep F — "Yami's words" *(pencapaian, motivasi — sound sedih→epic)*
- Hook: `SURPASS YOUR LIMITS. RIGHT HERE. RIGHT NOW.` diketik per kata di tiap ketukan.
- Yami tertangkap (Season 2) → Black Bulls bergerak menyelamatkan → drop: Yami & pedang kegelapan.
- Cocok untuk sound motivasi; potensi dibagikan sebagai konten "motivation edit".

---

## 5. Aturan khusus format 1:1

- Canvas **1080×1080**. Panel manga tinggi → *crop* fokus wajah/torso; panel lebar → jadikan *pan* horizontal 2.5D.
- **Area aman teks:** label & quote di 70–88% tinggi frame (bawah tengah), watermark di 93%. Jangan taruh teks di 10% tepi (dipotong UI aplikasi).
- Overscan 110% (sudah diatur skrip) agar shake & sway tidak memunculkan tepi hitam.
- Di YouTube Shorts video 1:1 tetap diterima dan tampil dengan ruang kosong atas-bawah — manfaatkan dengan judul besar di thumbnail/cover, bukan di video.

---

## 6. Prompt I2V (Jalur B skill) untuk *hero shot*

Pakai hanya untuk 1–2 shot terpenting per video (shot DROP). Setting: **5 dtk, 1:1, Motion Strength 0,45–0,60**.

**Asta Devil Union (Konsep A, drop):**
```
2.5D manga animation, MMV edit style, preserving original black ink lineart and screentone texture, colored manga panel of a spiky-haired young swordsman with a dark demonic aura, one black horn, glowing red eyes slowly igniting, black and red anti-magic energy crackling along his huge sword, torn cloak and hair strands billowing in strong wind, chest rising with a deep breath, dramatic volumetric red backlighting, floating embers and dust particles, slow smooth camera push-in with subtle 2.5D parallax depth, smooth continuous 5-second motion, stable face anatomy, no sudden cuts, square 1:1 framing
```

**Asta kecil tersenyum (Konsep B, hook):**
```
2.5D manga animation, MMV edit style, preserving original black ink lineart and screentone texture, a bruised small boy with spiky hair grinning through tears, soft warm sunset backlight, gentle breeze moving his hair, subtle blink and widening smile, warm floating dust particles, slow smooth camera push-in with subtle 2.5D parallax depth, smooth continuous 5-second motion, stable face anatomy, no sudden cuts, square 1:1 framing
```

**Negative prompt (semua shot):**
```
3D CGI render, photorealistic, clay, melting face, distorted eyes, extra limbs, flickering lineart, sudden scene cut, chaotic fast motion, morphing anatomy, blurry text, moving speech bubbles, letterbox, watermark
```

---

## 7. Alur kerja teknis (file di folder ini)

| File | Fungsi |
|---|---|
| `beat_sync.py` | Analisis sound → `*_markers.txt` (BEAT / IMPACT / DROP / QUIET) + `*_cutlist.txt` |
| `MMV_BlackClover_1x1.jsx` | After Effects: comp 1080×1080, panel otomatis ditaruh di tiap cut, kamera 2.5D + sway, flash/shake/zoom-punch/glow otomatis di marker IMPACT & DROP, partikel, grade, vignette, teks label & watermark |

Langkah:

1. Potong sound ke bagian yang dipakai lalu analisis (contoh phonk, mulai detik 12, 20 dtk):
   ```bash
   python3 beat_sync.py sound_phonk.mp3 --mood phonk --start 12 --length 20
   ```
   Potong audionya dengan titik yang sama agar marker cocok:
   ```bash
   ffmpeg -ss 12 -t 20 -i sound_phonk.mp3 -c:a aac sound_cut.m4a
   ```
2. Siapkan folder panel berurutan nama (`01_hook.png`, `02_liebe.png`, … ). Shot ke-N = file ke-N. Taruh panel terkuat di urutan yang jatuh di DROP (lihat `*_cutlist.txt`, baris bertanda `DROP`).
3. After Effects → *File › Scripts › Run Script File…* → `MMV_BlackClover_1x1.jsx` → pilih markers, audio (`sound_cut.m4a`), folder panel. Ubah `labelText`, `watermark`, `accent` di bagian `CFG` di atas skrip.
4. Untuk shot karakter utama: pisah layer (rambut/mata/badan) sesuai skill §Tahap 1, tambah Wave Warp di rambut & mask mata + Glow.
5. Render ProRes/H.264 lalu finishing:
   ```bash
   ffmpeg -i render_ae.mov -vf "scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,unsharp=5:5:0.6:3:3:0.3" -c:v libx264 -crf 17 -pix_fmt yuv420p -r 30 -c:a aac -b:a 256k -movflags +faststart final_1x1.mp4
   ```

Validasi: skrip `beat_sync.py` sudah diuji pada audio referensi — drop Video 3 terdeteksi di 17,23 dtk, tepat di cut besar video aslinya (1:04,2).

---

## 8. Checklist QA sebelum upload

- [ ] Detik pertama berisi hook teks/visual, bukan logo panjang.
- [ ] Setiap cut berada ±1 frame dari marker BEAT; shot terkuat mulai tepat di `DROP`.
- [ ] Flash tidak lebih dari 2–3 frame dan tidak berturut-turut >3 kali per detik (nyaman ditonton, aman untuk penonton sensitif cahaya).
- [ ] 1080×1080, tidak ada tepi hitam saat shake.
- [ ] Garis tinta tajam, wajah tidak meleleh (cek shot hasil I2V frame demi frame).
- [ ] Shot terakhir menyambung ke shot pertama (loop).
- [ ] Teks spoiler diberi label untuk konten ending manga.

## 9. Strategi upload

- **Waktu:** Konsep A dalam 6–24 jam setelah setiap episode Season 2; Konsep B/E/F evergreen, isi hari tanpa episode.
- **Judul pendek berbentuk hook:** `Anime-only isn't ready for this 💀 #blackclover`, `He had no magic… #asta`.
- **Tag:** `#blackclover #asta #animeedit #mangaedit #mmv #blackcloverseason2` (hindari `#manhwa` — Black Clover adalah manga Jepang, tag yang salah menarik penonton yang salah).
- **Hak cipta:** footage/panel milik Yūki Tabata/Shueisha/Pierrot. Edit yang transformatif (pewarnaan, 2.5D, komposisi baru) lebih aman, tapi klaim Content ID tetap mungkin — jangan memakai klip anime utuh panjang; gunakan potongan pendek dan panel manga yang sudah diolah.

---

### Sumber riset
- [Black Clover Wiki — Episode 171](https://blackclover.fandom.com/wiki/Episode_171)
- [Anime News Network — Black Clover Season 2 Episodes 171–173](https://www.animenewsnetwork.com/review/black-clover-season-2/episodes-171-173/.243007)
- [Animeleko — 7 Details From Episode 171](https://animeleko.com/en/7-details-from-episode-171/)
- [Outlook Respawn — Black Clover manga ends at chapter 392](https://respawn.outlookindia.com/pop-culture/pop-culture-news/black-clover-manga-ends-at-chapter-392-after-11-years)
- [ComicBook — Black Clover ends its final fight](https://comicbook.com/anime/feature/black-clover-ends-its-final-fight-and-a-winner-has-been-revealed/)
