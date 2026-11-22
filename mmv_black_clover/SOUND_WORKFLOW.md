# Alur kerja tetap: setiap kali sound baru dikirim

1. **Bedah sound** (`beat_sync.py` + analisis hentakan 808/vokal): durasi, BPM, intro, drop, bagian sepi, break, aksen rapat.
2. **Tentukan genre** dari karakter sound:
   | Ciri sound | Genre pack |
   |---|---|
   | sound kreator MMV/vokal ber-808 sedang | `mmv` |
   | 808 berat, cowbell, gelap, cepat | `phonk` |
   | piano/vokal lembut, tanpa 808 | `soft` |
   | lambat, berat, menyeramkan / choir | `villain` |
   | sangat cepat, synth, hype | `hyper` |
3. **Riset topik yang sedang booming** (episode terbaru Season 2, momen yang paling dibahas minggu itu) lalu cocokkan dengan mood sound.
4. **Peta sound → cerita**: hook di frame pertama, satu momen per aksen, momen terkuat di drop, inti emosi di break, penutup kembali ke hook (loop).
5. **Preview contact sheet** dulu. Video hanya dirender setelah perintah **"render"**.

| Sound | Topik | Genre | File edit |
|---|---|---|---|
| FUNK MANDALA (slowed) | Anime-only isn't ready (arc Spade) | mmv | `edits/funk_mandala_v3.py` |
| Discipline phonk | Asta: tanpa sihir → Wizard King | mmv/phonk | `edits/discipline_asta.py` |
| Wallpaper (lembut) | Queens of Black Clover | soft/mmv | `edits/queens_v4.py` |
| original sound - tezxs0kun | Noelle mengakui perasaan ke Asta (S2 Ep 7, booming) | mmv | `edits/noelle_confession.py` |
