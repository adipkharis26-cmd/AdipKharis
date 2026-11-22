# Black Clover MMV 1:1 2K/60fps - v3: karakter dipotong & ditaruh di BACKGROUND BARU (gaya referensi ke-2)
# Sound: FUNK MANDALA (Slowed). Audio dipotong mulai 0.5 dtk (--audio-start 0.5) supaya hentakan pertama
# jatuh di frame pertama: langsung HOOK, tanpa teks opening.
# Waktu di bawah = waktu setelah audio dipotong. char.anchor = titik di gambar karakter (0..1) yang
# ditempatkan di char.pos (0..1 frame); span = tinggi gambar relatif tinggi frame.

WATERMARK = "Charizchkun"

# Tekstur "manga berwarna" seperti referensi (motion/manga_texture.py). Ukuran dalam piksel output.
# karakter: warna flat bersih + tinta tegas; screentone hanya di bayangan gelap
TEXTURE_CHAR = dict(cel=0.55, levels=5, ink=0.8, ink_sigma=1.0, tone=0.30, tone_period=6.0, tone_lo=0.55,
                    tone_hi=0.85, hatch=0.0, warm=0.35)
# background: lebih "digambar": warna lebih rata, screentone luas, sedikit arsiran
TEXTURE_BG = dict(cel=0.75, levels=4, ink=0.65, ink_sigma=1.3, tone=0.55, tone_period=7.0, tone_lo=0.2,
                  tone_hi=0.75, hatch=0.15, warm=0.45)
DAPPLED = 0.35   # bercak cahaya di karakter
PAPER = 1.0      # serat kertas di seluruh frame
PARTICLE_COLOR = (255, 95, 45)
RED = (255, 45, 35)
RED_SKY = dict(tint=(1.18, 0.55, 0.5), sat=0.9, bright=0.75, contrast=1.1)


def wind(region, amp=0.006, freq=0.9, edge=True, d=(1.0, 0.35)):
    return dict(type="wind", region=region, amp=amp, freq=freq, k=6.0, edge=edge, dir=d)


def breathe(region=("box", 0, 0.25, 1, 1), A=0.006, f=0.45, pivot=(0.5, 1.0)):
    return dict(type="breathe", region=region, osc=(A, f), pivot=pivot)


def full(t0, t1, img, anchor=(0.5, 0.5), span=(1.0, 1.08), gate=None, hits=(), flash=(), amp=0.005, **kw):
    """Shot full-frame (panel manga / adegan): tetap ada angin halus, napas, dan kamera speed-ramp."""
    dur = t1 - t0
    s = dict(t0=t0, t1=t1,
             char=dict(img=img, alpha="full", anchor=anchor, pos=(0.5, 0.5),
                       span=[(0, span[0]), (dur, span[1])],
                       rig=dict(parts=[wind(("box", 0, 0, 1, 1), amp, 1.1, edge=False), breathe(A=0.004, f=0.6)]),
                       duotone=kw.pop("duotone", False)),
             cam=dict(ease="out"), hits=list(hits), flash=list(flash), gate=gate or [])
    s.update(kw)
    return s


HOOK = dict(
    char=dict(img="Black_Asta.png", alpha="seg", upscale=2400, anchor=(0.6, 0.34), pos=(0.5, 0.40),
              span=0.86,
              rig=dict(protect=[("ellipse", 0.595, 0.30, 0.07, 0.11)],
                       parts=[wind(("box", 0.28, 0.45, 0.9, 0.8), 0.012, 0.8),
                              wind(("ellipse", 0.6, 0.12, 0.13, 0.1), 0.007, 1.1, d=(1.0, 0.5)),
                              breathe(("box", 0.35, 0.35, 0.85, 1.0), 0.006, 0.43, (0.6, 1.0)),
                              dict(type="rotate", region=("ellipse", 0.6, 0.27, 0.11, 0.17), pivot=(0.6, 0.42),
                                   angle=[(0, 0.0), (2.3, -2.5)])])),
    bg=dict(img="Freezing_sun_drops_on_Spade_castle.png", upscale=1400, anchor=(0.5, 0.42), pos=(0.5, 0.42),
            span=1.25, blur=2.5, grade=RED_SKY, fog=((60, 10, 12), 0.35)),
    fx=dict(eyes=([(0.556, 0.300), (0.626, 0.307)], RED, [(0, 0.0), (0.05, 1.3), (2.3, 0.9)], 7),
            rays=((0.52, 0.28), (255, 70, 40), [(0, 0.4), (0.1, 1.0), (2.4, 0.6)]),
            back_glow=((255, 40, 30), 0.35), rim=((255, 80, 50), 0.55), wrap=0.35),
)

SHOTS = [
    # 1 ─ HOOK (frame pertama = hentakan pertama): Black Asta, mata menyala, kamera dolly-in.
    dict(t0=0.000, t1=2.400, **HOOK,
         cam=dict(zoom=[(0, 1.0), (2.4, 1.22)], pan=[(0, (0.0, 0.03)), (2.4, (0.0, 0.0))],
                  rot=[(0, -1.0), (2.4, 0.5)]),
         hits=[0.0], flash=[0.0]),

    # 2 ─ bass hilang: Liebe kecil sendirian di gereja Hage berkabut (origin, sedih)
    dict(t0=2.400, t1=3.633,
         char=dict(img="Liebe_as_child.png", alpha="seg", anchor=(0.47, 0.30), pos=(0.5, 0.40), span=1.55,
                   grade=dict(sat=0.75),
                   rig=dict(protect=[("ellipse", 0.47, 0.29, 0.12, 0.08)],
                            parts=[wind(("ellipse", 0.47, 0.12, 0.3, 0.12), 0.006, 0.8, d=(1.0, 0.4)),
                                   wind(("box", 0.6, 0.75, 1.0, 1.0), 0.010, 0.7),
                                   breathe(("box", 0.1, 0.35, 0.9, 1.0), 0.005, 0.5)])),
         bg=dict(img="Hage_orphanage_church.png", upscale=1400, anchor=(0.5, 0.5), pos=(0.5, 0.45), span=1.15,
                 blur=3.0, grade=dict(tint=(0.85, 0.9, 1.05), sat=0.45, bright=0.7), fog=((150, 160, 175), 0.45)),
         cam=dict(zoom=[(0, 1.0), (1.23, 1.07)], rot=[(0, 0.5), (1.23, -0.3)]),
         fx=dict(eyes=([(0.375, 0.292), (0.552, 0.292)], RED, [(0, 0.2), (0.6, 0.9)], 4),
                 back_glow=((120, 130, 160), 0.2), rim=((200, 210, 255), 0.35), wrap=0.45),
         grade=dict(contrast=1.05), particles_cfg=((200, 205, 220), 0.35, "snow"),
         trans_in=("whip", 0.10)),

    # 3 ─ kontrak Asta & Liebe (adegan asli, di-upscale)
    full(3.633, 4.767, "Asta_and_Liebe_shake_hands.png", span=(1.0, 1.1),
         grade=dict(bright=0.82, bloom=0.2, bloom_thr=225)),

    # 4 ─ bass kembali: Nacht close-up, mata merah menyala (roto gagal di profil Nacht -> close-up penuh)
    dict(t0=4.767, t1=5.933,
         char=dict(img="Weg_Nacht_from_Gimodelo.png", alpha="full", upscale=2400, anchor=(0.5, 0.56), pos=(0.5, 0.5),
                   span=[(0, 1.12), (1.17, 1.3)],
                   rig=dict(full_char=True, protect=[("ellipse", 0.5, 0.67, 0.34, 0.19)],
                            parts=[wind(("box", 0.04, 0.28, 0.96, 0.6), 0.004, 0.8, edge=False, d=(1.0, 0.2)),
                                   dict(type="rotate", region=("box", 0.0, 0.0, 1.0, 1.0), pivot=(0.5, 1.1),
                                        angle=[(0, 0.0), (1.17, 1.2)])])),
         cam=dict(rot=[(0, 1.0), (1.17, -0.5)]),
         fx=dict(eyes=([(0.333, 0.593), (0.665, 0.593)], (200, 40, 70), [(0, 0.0), (0.08, 1.2), (1.17, 0.9)], 8)),
         hits=[0.0], flash=[0.0], particles_cfg=((190, 120, 255), 0.4, "embers"),
         text=[dict(kind="title", label="DEVIL HOST", name="Nacht Faust", color=(190, 50, 90), at=0.15)]),

    # 5 ─ Yami di kerajaan Spade bersalju (Yami tertangkap di arc Spade)
    dict(t0=5.933, t1=7.100,
         char=dict(img="Yami_anime_profile.png", alpha="seg", upscale=2400, anchor=(0.47, 0.2), pos=(0.5, 0.38),
                   span=[(0, 2.3), (1.17, 2.2)],
                   rig=dict(protect=[("ellipse", 0.47, 0.1, 0.08, 0.05)],
                            parts=[wind(("ellipse", 0.47, 0.06, 0.12, 0.05), 0.005, 1.0),
                                   breathe(("box", 0.1, 0.15, 0.9, 1.0), 0.006, 0.45)])),
         bg=dict(img="Spade_Kingdom.png", upscale=1400, anchor=(0.5, 0.5), pos=(0.5, 0.45),
                 span=[(0, 1.2), (1.17, 1.15)], blur=2.0, grade=dict(bright=0.8, contrast=1.1),
                 fog=((70, 80, 120), 0.35)),
         cam=dict(pan=[(0, (0.02, 0)), (1.17, (-0.02, 0))]),
         fx=dict(back_glow=((90, 110, 255), 0.25), rim=((150, 170, 255), 0.5), wrap=0.45,
                 rays=((0.5, 0.3), (120, 140, 255), 0.5)),
         particles_cfg=((215, 225, 255), 0.6, "snow")),

    # 6-8 ─ 3 hentakan stutter menuju drop
    full(7.100, 7.567, "Black_Asta_overcome_with_rage.png", anchor=(0.45, 0.6), span=(1.5, 1.62), duotone=True,
         hits=[0.0]),
    full(7.567, 8.267, "Liebe_anime_profile.png", anchor=(0.5, 0.3), span=(1.5, 1.65), hits=[0.0],
         grade=dict(bloom=0.15, bloom_thr=230, contrast=1.15)),
    full(8.267, 8.867, "Asta_vs_Liebe.png", span=(1.0, 1.2), duotone=True, hits=[0.0], trans_out=("glitch", 0.06)),

    # 9 ─ DROP: Asta Devil Union (sayap ikut dipotong) di langit merah pegunungan Diamond
    dict(t0=8.867, t1=10.133,
         char=dict(img="Asta_united_with_Liebe.png", alpha="seg+dark", upscale=2400,
                   dark_boxes=[(0.0, 0.0, 0.46, 0.62), (0.54, 0.0, 1.0, 0.62)], dark_thr=50,
                   anchor=(0.5, 0.42), pos=(0.5, 0.47), span=[(0, 1.35), (0.45, 1.05), (1.27, 1.1)],
                   rig=dict(protect=[("ellipse", 0.5, 0.25, 0.035, 0.05)],
                            parts=[dict(type="rotate", region=("box", 0.0, 0.0, 0.41, 0.6, 0.06), pivot=(0.41, 0.33),
                                        angle=[(0, -9.0), (0.45, 3.5), (0.85, 0.0)], ease="back",
                                        osc=(1.2, 1.1, 0.0)),
                                   dict(type="rotate", region=("box", 0.59, 0.0, 1.0, 0.6, 0.06), pivot=(0.59, 0.33),
                                        angle=[(0, 9.0), (0.45, -3.5), (0.85, 0.0)], ease="back",
                                        osc=(-1.2, 1.1, 0.0)),
                                   wind(("ellipse", 0.5, 0.12, 0.08, 0.07), 0.008, 1.2),
                                   breathe(("box", 0.38, 0.25, 0.62, 1.0), 0.006, 0.5)])),
         bg=dict(img="Diamond_Kingdom.png", upscale=1400, anchor=(0.5, 0.4), pos=(0.5, 0.45),
                 span=[(0, 1.3), (1.27, 1.2)], blur=2.5, grade=dict(tint=(1.25, 0.6, 0.55), bright=0.7, contrast=1.2),
                 fog=((80, 10, 10), 0.4)),
         cam=dict(ease="out", rot=[(0, -1.5), (0.45, 0.0)]),
         fx=dict(eyes=([(0.488, 0.245), (0.515, 0.245)], RED, [(0, 0.0), (0.1, 1.6), (1.27, 1.1)], 5),
                 rays=((0.5, 0.25), (255, 40, 30), [(0, 1.5), (1.27, 0.7)]),
                 back_glow=((255, 30, 20), 0.5), rim=((255, 50, 35), 0.8), wrap=0.3),
         hits=[0.0], flash=[0.0], shake=0.012, grade=dict(bloom=0.55),
         text=[dict(kind="title", label="DEVIL UNION", name="Asta", color=RED, at=0.12, pop=True)]),

    # 10 ─ sunyi
    dict(t0=10.133, t1=10.300),

    # 11-19 ─ gated chop
    full(10.300, 10.867, "Asta_slashes_Dante_with_katana.png", anchor=(0.5, 0.4), span=(1.15, 1.0),
         gate=[(10.72, 10.88)], hits=[0.0], flash=[0.0]),
    dict(t0=10.867, t1=11.767,
         char=dict(img="Spirit_Dive.png", alpha="seg", anchor=(0.17, 0.42), pos=(0.42, 0.42), span=[(0, 1.6), (0.9, 1.75)],
                   grade=dict(contrast=1.25, bright=0.85),
                   rig=dict(parts=[wind(("box", 0, 0, 1, 1), 0.006, 1.1), breathe(A=0.004)])),
         bg=dict(img="Heart_Kingdom.png", upscale=1400, anchor=(0.35, 0.45), pos=(0.5, 0.5), span=1.25, blur=2.5,
                 grade=dict(tint=(0.8, 1.1, 0.9), bright=0.75)),
         cam=dict(ease="out"), gate=[(11.50, 11.78)],
         fx=dict(rim=((120, 255, 170), 0.6), back_glow=((60, 255, 140), 0.4), wrap=0.4),
         trans_in=("whip", 0.08)),
    dict(t0=11.767, t1=12.633,
         char=dict(img="Saint_Valkyrie_Dress.png", alpha="seg", anchor=(0.58, 0.4), pos=(0.5, 0.45),
                   span=[(0, 1.35), (0.87, 1.2)],
                   rig=dict(protect=[("ellipse", 0.6, 0.25, 0.04, 0.05)],
                            parts=[wind(("box", 0, 0, 1, 1), 0.007, 1.0)])),
         bg=dict(img="World_End_Church.png", upscale=1400, anchor=(0.5, 0.5), pos=(0.5, 0.5), span=1.2, blur=2.0,
                 grade=dict(bright=0.7)),
         cam=dict(ease="out"), gate=[(12.46, 12.64)],
         fx=dict(rim=((150, 230, 255), 0.6), back_glow=((80, 200, 255), 0.4), wrap=0.4)),
    full(12.633, 13.233, "Dark_Cloaked_Iai_Slash.png", anchor=(0.55, 0.32), span=(1.0, 1.14), duotone=True,
         hits=[0.0]),
    full(13.233, 14.133, "Nacht_in_Gallus_×_Felis_×_Canis_Mode.png", anchor=(0.45, 0.38), span=(1.14, 1.0),
         duotone=True, gate=[(14.02, 14.13)]),
    dict(t0=14.133, t1=14.967,
         char=dict(img="Mereoleona_anime_profile.png", alpha="seg", upscale=2400, anchor=(0.52, 0.16),
                   pos=(0.5, 0.3), span=[(0, 2.0), (0.83, 2.15)],
                   rig=dict(protect=[("ellipse", 0.52, 0.1, 0.07, 0.05)],
                            parts=[wind(("box", 0.0, 0.0, 1.0, 1.0), 0.010, 0.9),
                                   breathe(("box", 0.1, 0.15, 0.9, 1.0), 0.005, 0.5)])),
         bg=dict(img="Freezing_sun_drops_on_Spade_castle.png", upscale=1400, anchor=(0.5, 0.4), pos=(0.5, 0.4),
                 span=1.3, blur=2.5, grade=dict(tint=(1.25, 0.75, 0.4), sat=0.9, bright=0.75)),
         cam=dict(ease="out"), gate=[(14.82, 14.97)],
         fx=dict(rim=((255, 150, 60), 0.7), back_glow=((255, 110, 20), 0.45), wrap=0.35,
                 rays=((0.5, 0.25), (255, 140, 40), 0.7)),
         trans_in=("glitch", 0.07)),
    full(14.967, 15.567, "Black_Bulls_barge_into_courthouse.png", span=(1.12, 1.0), gate=[(15.40, 15.57)]),
    full(15.567, 16.467, "Asta_and_Yuno_prepared_to_aim_for_the_top.png", anchor=(0.5, 0.42), span=(1.0, 1.1),
         gate=[(16.18, 16.47)], hits=[0.0], amp=0.003),
    full(16.467, 17.333, "Asta_and_Liebe_in_true_Unite.png", anchor=(0.5, 0.36), span=(1.18, 1.04),
         gate=[(17.16, 17.33)], amp=0.006),

    # 20 ─ penutup: kembali ke hook (loop mulus)
    dict(t0=17.333, t1=18.467, **HOOK,
         cam=dict(zoom=[(0, 1.18), (1.13, 1.05)], rot=[(0, 0.5), (1.13, 0.0)]),
         trans_in=("glitch", 0.07)),
]

IMAGES = sorted({s[k]["img"] for s in SHOTS for k in ("char", "bg") if s.get(k)})
