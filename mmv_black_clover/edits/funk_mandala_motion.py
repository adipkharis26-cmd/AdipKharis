# Black Clover MMV 1:1 - "Anime-only isn't ready" (Season 2, arc Spade) - versi KARAKTER BERGERAK
# Sound: FUNK MANDALA (Slowed) 18.97 dtk ~103 BPM. Semua waktu cut = hentakan nyata di sound.
# Koordinat rig = posisi relatif di gambar asli (0..1). Waktu keyframe = detik relatif awal shot.
# Render: python3 motion/render_motion.py edits/funk_mandala_motion.py images/ sound.mp3 out.mp4 --models models/

WATERMARK = "Charizchkun"
PARTICLE_COLOR = (255, 90, 40)

RED = (255, 45, 35)
NACHT = (200, 40, 70)

IMAGES_NOTE = "Gambar dari Black Clover Wiki (fetch_images.py membaca IMAGES di bawah)."


def wind(region, amp=0.006, freq=0.9, k=6.0, edge=True, d=(1.0, 0.35)):
    return dict(type="wind", region=region, amp=amp, freq=freq, k=k, edge=edge, dir=d)


def chop(t0, t1, img, focus, z, gate=None, hits=(), flash=(), amp=0.005, pan=((0, (0, 0)),), **kw):
    """Shot cepat di bagian gated chop: speed-ramp kamera + angin halus pada siluet + napas."""
    dur = t1 - t0
    s = dict(t0=t0, t1=t1, img=img,
             cam=dict(focus=focus, zoom=[(0, z[0]), (dur, z[1])], ease="out",
                      pan=[(0, pan[0][1]), (dur, pan[-1][1])] if len(pan) > 1 else (0.0, 0.0)),
             rig=dict(parts=[wind(("box", 0, 0, 1, 1), amp, 1.1),
                             dict(type="breathe", region=("box", 0, 0.2, 1, 1), osc=(0.005, 0.6))]),
             hits=list(hits), flash=list(flash), gate=gate or [],
             fx=dict(rim=((255, 120, 80), 0.25)))
    s.update(kw)
    return s


SHOTS = [
    # 1 ─ hening: hook singkat
    dict(t0=0.000, t1=0.567, img=None,
         text=[dict(kind="title", label="BLACK CLOVER", name="Anime-only isn't ready...", color=RED, y=0.52)]),

    # 2 ─ hentakan pembuka + swell: Black Asta. Mata menyala di hentakan, jubah & rambut tertiup angin,
    #     kepala sedikit mendongak, napas, kamera dolly-in pelan ke wajah dengan sedikit roll.
    dict(t0=0.567, t1=2.900, img="Black_Asta.png",
         cam=dict(focus=[(0, (0.56, 0.5)), (2.33, (0.6, 0.38))], zoom=[(0, 1.0), (2.33, 1.12)],
                  rot=[(0, -1.2), (2.33, 0.6)]),
         rig=dict(protect=[("ellipse", 0.595, 0.30, 0.07, 0.11)],
                  parts=[wind(("box", 0.28, 0.45, 0.9, 0.8), 0.012, 0.8),
                         wind(("ellipse", 0.6, 0.12, 0.13, 0.1), 0.007, 1.1, d=(1.0, 0.5)),
                         dict(type="breathe", region=("box", 0.35, 0.35, 0.85, 1.0), osc=(0.006, 0.43), pivot=(0.6, 1.0)),
                         dict(type="rotate", region=("ellipse", 0.6, 0.27, 0.11, 0.17), pivot=(0.6, 0.42),
                              angle=[(0, 0.0), (2.3, -2.5)])]),
         hits=[0.0], flash=[0.0],
         fx=dict(eyes=([(0.556, 0.300), (0.626, 0.307)], RED, [(0, 0.0), (0.06, 1.3), (2.33, 0.9)], 7),
                 rays=((0.6, 0.25), (255, 70, 40), [(0, 0.2), (0.1, 0.9), (2.33, 0.5)]),
                 rim=((255, 80, 50), 0.5)),
         text=[dict(kind="title", label="BLACK CLOVER", name="Anime-only isn't ready...", color=RED, at=-1, until=1.6)]),

    # 3 ─ bass hilang: Liebe (desaturasi). Sayap mengepak pelan, rambut bergerak, napas.
    dict(t0=2.900, t1=4.133, img="Liebe_anime_profile.png", desat=0.5,
         cam=dict(focus=(0.5, 0.33), zoom=[(0, 1.32), (1.23, 1.48)], rot=[(0, 0.6), (1.23, -0.4)]),
         rig=dict(full_char=True, protect=[("ellipse", 0.49, 0.29, 0.06, 0.07)],
                  parts=[dict(type="rotate", region=("box", 0.0, 0.0, 0.43, 0.48, 0.07), pivot=(0.43, 0.3),
                              angle=0.0, osc=(2.2, 0.75, 0.0)),
                         dict(type="rotate", region=("box", 0.57, 0.0, 1.0, 0.48, 0.07), pivot=(0.57, 0.3),
                              angle=0.0, osc=(-2.2, 0.75, 0.0)),
                         wind(("ellipse", 0.49, 0.16, 0.1, 0.08), 0.005, 1.0, edge=False),
                         dict(type="breathe", region=("box", 0.3, 0.3, 0.7, 1.0), osc=(0.005, 0.5))]),
         grade=dict(bright=0.85), particles=False),

    # 4 ─ kontrak Asta & Liebe: cahaya berdenyut, sayap & ekor Liebe bergerak
    dict(t0=4.133, t1=5.267, img="Asta_and_Liebe_shake_hands.png",
         cam=dict(focus=(0.5, 0.5), zoom=[(0, 1.0), (1.13, 1.1)], pan=[(0, (-0.015, 0)), (1.13, (0.01, 0))]),
         rig=dict(full_char=True,
                  parts=[dict(type="rotate", region=("box", 0.2, 0.12, 0.36, 0.55, 0.05), pivot=(0.36, 0.36),
                              angle=0.0, osc=(2.5, 0.9, 0.0)),
                         wind(("box", 0.03, 0.52, 0.32, 0.8), 0.008, 0.8, edge=False),
                         wind(("ellipse", 0.65, 0.3, 0.06, 0.06), 0.004, 1.2, edge=False),
                         dict(type="breathe", region=("box", 0.2, 0.2, 0.75, 1.0), osc=(0.004, 0.5))]),
         grade=dict(bright=[(0, 0.78), (0.55, 0.88), (1.13, 0.82)], bloom=0.22, bloom_thr=225),
         text=[dict(kind="sub", text="*Asta & Liebe's contract", at=0.1)]),

    # 5 ─ bass kembali: Nacht close-up. Mata merah menyala, poni bergerak, kepala sedikit miring.
    dict(t0=5.267, t1=6.433, img="Weg_Nacht_from_Gimodelo.png",
         cam=dict(focus=(0.5, 0.56), zoom=[(0, 1.04), (1.17, 1.24)], rot=[(0, 1.0), (1.17, -0.6)]),
         rig=dict(full_char=True, protect=[("ellipse", 0.5, 0.67, 0.34, 0.19)],
                  parts=[wind(("box", 0.04, 0.28, 0.96, 0.6), 0.004, 0.8, edge=False, d=(1.0, 0.2)),
                         dict(type="rotate", region=("box", 0.0, 0.0, 1.0, 1.0), pivot=(0.5, 1.1),
                              angle=[(0, 0.0), (1.17, 1.2)])]),
         hits=[0.0], flash=[0.0],
         fx=dict(eyes=([(0.333, 0.593), (0.665, 0.593)], NACHT, [(0, 0.0), (0.08, 1.2), (1.17, 0.9)], 8)),
         particles=False),

    # 6 ─ Nacht & 4 iblis melayang, mata iblis menyala
    dict(t0=6.433, t1=7.600, img="Nacht's_four_devils.png",
         cam=dict(focus=(0.5, 0.5), zoom=[(0, 1.0), (1.17, 1.08)], pan=[(0, (0.03, 0)), (1.17, (-0.025, 0))]),
         rig=dict(full_char=True,
                  parts=[dict(type="bob", region=("ellipse", 0.26, 0.30, 0.14, 0.2), osc=(0.012, 0.9, 0.0)),
                         dict(type="bob", region=("ellipse", 0.70, 0.24, 0.16, 0.18), osc=(0.012, 0.8, 1.5)),
                         dict(type="bob", region=("ellipse", 0.08, 0.56, 0.09, 0.14), osc=(0.010, 1.0, 3.0)),
                         dict(type="bob", region=("ellipse", 0.85, 0.66, 0.13, 0.2), osc=(0.010, 0.85, 4.5)),
                         dict(type="breathe", region=("box", 0.33, 0.6, 0.67, 1.0), osc=(0.004, 0.4))]),
         fx=dict(eyes=([(0.598, 0.200), (0.66, 0.200), (0.082, 0.50), (0.29, 0.29)], (255, 225, 190),
                       [(0, 0.3), (0.3, 0.9)], 4)),
         particles=False),

    # 7-9 ─ 3 hentakan stutter menuju drop
    chop(7.600, 8.067, "Black_Asta_overcome_with_rage.png", (0.45, 0.6), (1.5, 1.62), hits=[0.0], amp=0.006),
    chop(8.067, 8.767, "Liebe_as_child.png", (0.5, 0.22), (1.25, 1.38), hits=[0.0], amp=0.005,
         grade=dict(bloom=0.08, bloom_thr=235, bright=0.82, contrast=1.15)),
    chop(8.767, 9.367, "Asta_vs_Liebe.png", (0.5, 0.5), (1.0, 1.2), hits=[0.0], amp=0.006),

    # 10 ─ DROP: Asta Devil Union. Kamera mulai dekat lalu mundur cepat (reveal), sayap mengepak dengan
    #      overshoot (spring), mata/visor menyala, light rays merah, rim light.
    dict(t0=9.367, t1=10.633, img="Asta_united_with_Liebe.png",
         cam=dict(focus=(0.5, 0.42), zoom=[(0, 1.55), (0.45, 1.04), (1.27, 1.12)], ease="out",
                  rot=[(0, -2.0), (0.45, 0.0)]),
         rig=dict(protect=[("ellipse", 0.5, 0.25, 0.035, 0.05)],
                  parts=[dict(type="rotate", region=("box", 0.0, 0.0, 0.41, 0.58, 0.06), pivot=(0.41, 0.33),
                              angle=[(0, -9.0), (0.45, 3.5), (0.85, 0.0)], ease="back", osc=(1.2, 1.1, 0.0)),
                         dict(type="rotate", region=("box", 0.59, 0.0, 1.0, 0.58, 0.06), pivot=(0.59, 0.33),
                              angle=[(0, 9.0), (0.45, -3.5), (0.85, 0.0)], ease="back", osc=(-1.2, 1.1, 0.0)),
                         wind(("ellipse", 0.5, 0.12, 0.08, 0.07), 0.008, 1.2),
                         dict(type="breathe", region=("box", 0.38, 0.25, 0.62, 1.0), osc=(0.006, 0.5))]),
         hits=[0.0], flash=[0.0], shake=0.014,
         fx=dict(eyes=([(0.488, 0.245), (0.515, 0.245)], RED, [(0, 0.0), (0.1, 1.6), (1.27, 1.1)], 5),
                 rays=((0.5, 0.2), (255, 40, 30), [(0, 1.3), (1.27, 0.6)]),
                 rim=((255, 40, 30), 0.7)),
         grade=dict(bloom=0.6),
         text=[dict(kind="title", label="DEVIL UNION", name="Asta", color=RED, at=0.1, pop=True)]),

    # 11 ─ sunyi total 5 frame
    dict(t0=10.633, t1=10.800, img=None),

    # 12-20 ─ gated chop: satu karakter per potongan, layar meredup di jeda bunyi
    chop(10.800, 11.367, "Asta_slashes_Dante_with_katana.png", (0.5, 0.4), (1.15, 1.0), gate=[(11.22, 11.38)],
         hits=[0.0], flash=[0.0]),
    chop(11.367, 12.267, "Spirit_Dive.png", (0.2, 0.42), (1.25, 1.38), gate=[(12.00, 12.28)],
         grade=dict(bright=0.8, contrast=1.25, bloom=0.3, bloom_thr=210)),
    chop(12.267, 13.133, "Saint_Valkyrie_Dress.png", (0.5, 0.42), (1.15, 1.0), gate=[(12.96, 13.14)],
         grade=dict(bloom=0.35, bloom_thr=200)),
    chop(13.133, 13.733, "Dark_Cloaked_Iai_Slash.png", (0.55, 0.32), (1.0, 1.14), hits=[0.0]),
    chop(13.733, 14.633, "Nacht_in_Gallus_×_Felis_×_Canis_Mode.png", (0.45, 0.38), (1.14, 1.0),
         gate=[(14.52, 14.63)]),
    chop(14.633, 15.467, "Mereoleona_comes_for_Black_Bull.png", (0.72, 0.4), (1.0, 1.13), gate=[(15.32, 15.47)]),
    chop(15.467, 16.067, "Black_Bulls_barge_into_courthouse.png", (0.5, 0.5), (1.12, 1.0), gate=[(15.90, 16.07)]),
    chop(16.067, 16.967, "Asta_and_Yuno_prepared_to_aim_for_the_top.png", (0.5, 0.42), (1.0, 1.1),
         gate=[(16.68, 16.97)], hits=[0.0], amp=0.003),
    chop(16.967, 17.833, "Asta_and_Liebe_in_true_Unite.png", (0.5, 0.36), (1.18, 1.04), gate=[(17.66, 17.83)],
         amp=0.007),

    # 21 ─ ekor: kembali ke mata Asta (loop) + UPCOMING EPISODES
    dict(t0=17.833, t1=18.967, img="Black_Asta.png",
         cam=dict(focus=[(0, (0.6, 0.38)), (1.13, (0.57, 0.48))], zoom=[(0, 1.1), (1.13, 1.0)],
                  rot=[(0, 0.6), (1.13, 0.2)]),
         rig=dict(protect=[("ellipse", 0.595, 0.30, 0.07, 0.11)],
                  parts=[wind(("box", 0.28, 0.45, 0.9, 0.8), 0.010, 0.8),
                         wind(("ellipse", 0.6, 0.12, 0.13, 0.1), 0.006, 1.1, d=(1.0, 0.5)),
                         dict(type="breathe", region=("box", 0.35, 0.35, 0.85, 1.0), osc=(0.006, 0.43), pivot=(0.6, 1.0))]),
         fx=dict(eyes=([(0.556, 0.300), (0.626, 0.307)], RED, [(0, 1.0), (1.13, 0.6)], 7),
                 rim=((255, 80, 50), 0.4)),
         grade=dict(bright=[(0, 0.95), (1.13, 0.7)]),
         text=[dict(kind="title", label="BLACK CLOVER SEASON 2", name="UPCOMING EPISODES", style="episode", at=0.0)]),
]

IMAGES = sorted({s["img"] for s in SHOTS if s.get("img")})
