# Edit: "Anime-only isn't ready" - Black Clover Season 2 (Spade Kingdom arc)
# Sound: FUNK MANDALA (Slowed) - 18.97 dtk, ~103 BPM. Waktu cut = hentakan nyata hasil analisis.
# Gambar: diunduh dari Black Clover Wiki (lihat fetch_images.py / IMAGES di bawah).

WATERMARK = ""            # isi nama channel, mis. "@namachannel"
EMBER_COLOR = (255, 55, 30)

RED = (255, 40, 30)
GOLD = (255, 205, 70)
WHITE = (255, 255, 255)


def label(name, glow, small="BEST MOMENT"):
    """Gaya label referensi: tulisan kecil di atas + nama karakter berglow."""
    return [dict(text=small, y=0.80, size=24, color=GOLD, glow=None, punch=False),
            dict(text=name, y=0.86, size=62, color=WHITE, glow=glow)]


def sub(text):
    """Subtitle miring kecil seperti '*Asta's crowning ceremony' di referensi."""
    return [dict(text=text, y=0.90, size=30, color=WHITE, italic=True, punch=False, glow=None)]


SHOTS = [
    # 1. hening -> hook langsung
    dict(t0=0.000, t1=0.567, img=None,
         texts=[dict(text="ANIME-ONLY", y=0.44, size=96, color=WHITE, glow=RED),
                dict(text="ISN'T READY...", y=0.56, size=70, color=RED, glow=RED)]),
    # 2. hentakan pembuka + swell: Black Asta, push-in ke wajah
    dict(t0=0.567, t1=2.900, img="Black_Asta.png", focus=(0.43, 0.42), zoom=(1.0, 1.45), hit=True,
         texts=[dict(text="ANIME-ONLY", y=0.74, size=86, color=WHITE, glow=RED, punch=True),
                dict(text="ISN'T READY...", y=0.84, size=64, color=RED, glow=RED)]),
    # 3. bass hilang: Liebe, desaturasi
    dict(t0=2.900, t1=4.133, img="Liebe_anime_profile.png", focus=(0.5, 0.28), zoom=(1.5, 1.75),
         desat=0.55, bright=0.85, embers=False,
         texts=[dict(text="FOR WHAT'S COMING", y=0.80, size=58, color=WHITE, glow=(120, 120, 120)),
                dict(text="IN SEASON 2", y=0.88, size=70, color=RED, glow=RED)]),
    # 4. kontrak Asta & Liebe
    dict(t0=4.133, t1=5.267, img="Asta_and_Liebe_shake_hands.png", focus=(0.5, 0.5), zoom=(1.0, 1.15), bloom=0.15, bloom_thr=220, bright=0.85,
         texts=sub("*Asta & Liebe's contract")),
    # 5. bass masuk lagi: Nacht mata merah
    dict(t0=5.267, t1=6.433, img="Weg_Nacht_from_Gimodelo.png", focus=(0.5, 0.48), zoom=(1.05, 1.3), hit=True,
         texts=label("Nacht Faust", (190, 30, 60))),
    # 6. Nacht & 4 iblis
    dict(t0=6.433, t1=7.600, img="Nacht's_four_devils.png", focus=(0.42, 0.45), zoom=(1.0, 1.1), pan=(0.06, 0),
         texts=sub("*the man with four devils")),
    # 7-9. stutter build: Black Asta (manga), Liebe kecil, Asta vs Liebe
    dict(t0=7.600, t1=8.067, img="Black_Asta_overcome_with_rage.png", focus=(0.45, 0.6), zoom=(1.5, 1.7), hit=True,
         accent=(150, 0, 0)),
    dict(t0=8.067, t1=8.767, img="Liebe_as_child.png", focus=(0.5, 0.2), zoom=(1.25, 1.4), hit=True),
    dict(t0=8.767, t1=9.367, img="Asta_vs_Liebe.png", focus=(0.5, 0.5), zoom=(1.0, 1.25),
         hit=True, ramp=True),
    # 10. DROP: Asta Devil Union
    dict(t0=9.367, t1=10.633, img="Asta_united_with_Liebe.png", focus=(0.5, 0.42), zoom=(1.0, 1.18), drop=True,
         bloom=0.9, bloom_thr=150, ember_k=1.4,
         texts=label("ASTA  x  LIEBE", RED, small="DEVIL UNION")),
    # 11. jeda sunyi
    dict(t0=10.633, t1=10.800, img=None),
    # 12-20. gated chop: satu karakter per potongan
    dict(t0=10.800, t1=11.367, img="Asta_slashes_Dante_with_katana.png", focus=(0.5, 0.4), zoom=(1.0, 1.2), hit=True,
         ramp=True, gate=[(11.22, 11.38)], texts=label("Asta vs Dante", RED)),
    dict(t0=11.367, t1=12.267, img="Spirit_Dive.png", focus=(0.2, 0.42), zoom=(1.25, 1.4), bloom=0.2, bloom_thr=215, bright=0.78, contrast=1.3, ramp=True,
         gate=[(12.00, 12.28)], texts=label("Yuno", (60, 255, 140))),
    dict(t0=12.267, t1=13.133, img="Saint_Valkyrie_Dress.png", focus=(0.5, 0.42), zoom=(1.0, 1.15), bloom=0.35, bloom_thr=200, ramp=True,
         gate=[(12.96, 13.14)], texts=label("Noelle Silva", (80, 200, 255))),
    dict(t0=13.133, t1=13.733, img="Dark_Cloaked_Iai_Slash.png", focus=(0.55, 0.32), zoom=(1.0, 1.15), hit=True,
         ramp=True, accent=(60, 0, 80), texts=label("Yami Sukehiro", (150, 60, 255))),
    dict(t0=13.733, t1=14.633, img="Nacht_in_Gallus_×_Felis_×_Canis_Mode.png", focus=(0.45, 0.38), zoom=(1.0, 1.15),
         ramp=True, gate=[(14.52, 14.63)], accent=(120, 0, 30), texts=label("Nacht Faust", (190, 30, 60))),
    dict(t0=14.633, t1=15.467, img="Mereoleona_comes_for_Black_Bull.png", focus=(0.72, 0.4), zoom=(1.0, 1.15),
         ramp=True, gate=[(15.32, 15.47)], texts=label("Mereoleona Vermillion", (255, 110, 20))),
    dict(t0=15.467, t1=16.067, img="Black_Bulls_barge_into_courthouse.png", focus=(0.5, 0.5), zoom=(1.0, 1.12),
         ramp=True, gate=[(15.90, 16.07)], texts=label("Black Bulls", RED)),
    dict(t0=16.067, t1=16.967, img="Asta_and_Yuno_prepared_to_aim_for_the_top.png", focus=(0.5, 0.42),
         zoom=(1.0, 1.12), hit=True, ramp=True, gate=[(16.68, 16.97)], texts=label("Asta & Yuno", GOLD)),
    dict(t0=16.967, t1=17.833, img="Asta_and_Liebe_in_true_Unite.png", focus=(0.5, 0.36), zoom=(1.05, 1.2),
         ramp=True, gate=[(17.66, 17.83)], bloom=0.8),
    # 21. ekor: kembali ke Black Asta (loop) + UPCOMING EPISODES
    dict(t0=17.833, t1=18.967, img="Black_Asta.png", focus=(0.43, 0.42), zoom=(1.45, 1.55), bright=0.8,
         texts=[dict(text="BLACK CLOVER SEASON 2", y=0.78, size=30, color=WHITE, punch=False),
                dict(text="UPCOMING EPISODES", y=0.85, size=66, color=GOLD, glow=(255, 150, 0))]),
]

# daftar gambar (nama file di Black Clover Wiki) - dipakai fetch_images.py
IMAGES = sorted({s["img"] for s in SHOTS if s.get("img")})
