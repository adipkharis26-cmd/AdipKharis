# Black Clover MMV 1:1 2K/60fps - "DISCIPLINE" (Asta: lahir tanpa sihir, menang karena disiplin)
# Sound: "Discipline..." dark phonk (13.26 dtk, ~92 BPM). Build-up 0-6.0 tanpa bass (melodi), riser 6.02-6.68,
# DROP 808 di 6.68 lalu menghantam tiap ~0.65 dtk: 7.29 7.94 8.60 9.27 9.94 10.60 11.26 11.92 12.60.
# Cerita: diremehkan & dipukul (build-up)  ->  hasil disiplin: anti-magic, Devil Union, Wizard King (drop).
# Render: python3 motion/render_v3.py edits/discipline_asta.py --chars images/ --bgs backgrounds/ \
#             --audio sound.wav --out out.mp4 --models models

WATERMARK = "Charizchkun"
PARTICLE_COLOR = (255, 190, 90)
RED = (255, 45, 35)
GOLD = (255, 200, 70)

TEXTURE_CHAR = dict(cel=0.55, levels=5, ink=0.8, ink_sigma=1.0, tone=0.30, tone_period=6.0, tone_lo=0.55,
                    tone_hi=0.85, hatch=0.0, warm=0.35)
TEXTURE_BG = dict(cel=0.75, levels=4, ink=0.65, ink_sigma=1.3, tone=0.55, tone_period=7.0, tone_lo=0.2,
                  tone_hi=0.75, hatch=0.15, warm=0.45)
DAPPLED = 0.3
PAPER = 1.0

# panel manga hitam-putih -> diwarnai hangat seperti referensi (krem/emas) ; varian dingin untuk masa kecil
WARM = dict(dark=(24, 10, 8), light=(250, 226, 178))
COLD = dict(dark=(16, 14, 20), light=(206, 204, 200))
BLOOD = dict(dark=(26, 4, 6), light=(250, 214, 196))


def wind(region, amp=0.006, freq=0.9, edge=True, d=(1.0, 0.35)):
    return dict(type="wind", region=region, amp=amp, freq=freq, k=6.0, edge=edge, dir=d)


def breathe(region=("box", 0, 0.25, 1, 1), A=0.005, f=0.45, pivot=(0.5, 1.0)):
    return dict(type="breathe", region=region, osc=(A, f), pivot=pivot)


def full(t0, t1, img, anchor=(0.5, 0.5), span=(1.0, 1.08), hits=(), flash=(), amp=0.005, tone=None,
         ease="out", **kw):
    """Shot full-frame (panel manga/adegan) + angin halus + napas + kamera ber-easing."""
    dur = t1 - t0
    char = dict(img=img, alpha="full", anchor=anchor, pos=(0.5, 0.5),
                span=[(0, span[0]), (dur, span[1])],
                rig=dict(parts=[wind(("box", 0, 0, 1, 1), amp, 1.1, edge=False), breathe(A=0.004, f=0.6)]))
    if tone:
        char.update(duotone=True, **tone)
    s = dict(t0=t0, t1=t1, char=char, cam=dict(ease=ease), hits=list(hits), flash=list(flash))
    s.update(kw)
    return s


SHOTS = [
    # ── BUILD-UP (tanpa bass): diremehkan, tanpa sihir ───────────────────────────────────────────
    # 1 HOOK frame pertama: Asta kecil berteriak akan jadi Wizard King. Zoom-punch kecil di tiap not melodi.
    full(0.000, 1.380, "Asta_Staria.png", anchor=(0.5, 0.56), span=(1.12, 1.3), tone=COLD,
         hits=[0.08, 0.40, 0.74, 1.06], shake=0.004, punch=0.02, ease="ease",
         text=[dict(kind="title", label="HATED BY MANA", name="Asta", color=(255, 70, 50), at=0.08)]),
    # 2 dipukul saat latihan bersama Yuno (pan kiri -> kanan)
    full(1.380, 3.020, "Young_Yuno_and_Asta_training.png", anchor=(0.5, 0.5), span=(1.0, 1.06), tone=COLD,
         hits=[1.0, 1.34], shake=0.004, punch=0.015, ease="ease",
         cam=dict(ease="ease", pan=[(0, (0.18, 0.0)), (1.64, (-0.18, 0.0))])),
    # 3 sendirian di menara grimoire (tidak mendapat grimoire)
    full(3.020, 4.360, "Asta_received_his_grimoire.png", anchor=(0.62, 0.58), span=(1.15, 1.32), ease="ease",
         grade=dict(bright=1.15, sat=0.85, contrast=1.15), fx=dict(rays=((0.45, 0.3), (120, 150, 255), 0.6))),
    # 4-8 stutter melodi: latihan & latihan (potongan cepat, tiap not)
    full(4.360, 4.700, "Fanzell_trains_Asta.png", anchor=(0.4, 0.58), span=(1.05, 1.15), tone=WARM, hits=[0.0]),
    full(4.700, 4.980, "Asta_muscle.png", anchor=(0.55, 0.32), span=(1.25, 1.35), hits=[0.0]),
    full(4.980, 5.340, "Asta_senses_Anti_Magic_with_ki.png", anchor=(0.5, 0.35), span=(1.2, 1.3), tone=WARM,
         hits=[0.0]),
    full(5.340, 5.640, "Asta_finds_a_sword_in_the_dungeon.png", anchor=(0.5, 0.4), span=(1.0, 1.1), tone=WARM,
         hits=[0.0]),
    full(5.640, 6.020, "Asta_attacked_by_chains.png", anchor=(0.5, 0.5), span=(1.05, 1.15), tone=BLOOD, hits=[0.0]),
    # 9 RISER: close-up mata Asta, menyala pelan sampai drop
    dict(t0=6.020, t1=6.680,
         char=dict(img="Black_Asta.png", alpha="full", anchor=(0.59, 0.30), pos=(0.5, 0.5),
                   span=[(0, 2.0), (0.66, 2.6)]),
         cam=dict(ease="in"), hits=[0.06, 0.34], shake=0.006,
         grade=dict(bright=[(0, 0.45), (0.66, 0.9)], sat=0.7),
         fx=dict(eyes=([(0.556, 0.300), (0.626, 0.307)], RED, [(0, 0.2), (0.66, 1.8)], 7)),
         particles=False),

    # ── DROP: hasil disiplin ─────────────────────────────────────────────────────────────────────
    # 10 DROP: Asta dua pedang anti-magic, dipotong ke langit merah, light rays
    dict(t0=6.680, t1=7.940,
         char=dict(img="Asta_wielding_anti_magic_weapons.png", alpha="seg", upscale=2400, anchor=(0.45, 0.45),
                   pos=(0.5, 0.52), span=[(0, 1.45), (0.4, 1.12), (1.26, 1.18)],
                   rig=dict(protect=[("ellipse", 0.43, 0.3, 0.06, 0.09)],
                            parts=[wind(("box", 0.2, 0.3, 0.8, 1.0), 0.008, 0.9),
                                   wind(("ellipse", 0.43, 0.15, 0.1, 0.08), 0.006, 1.1),
                                   breathe(("box", 0.25, 0.3, 0.75, 1.0), 0.006, 0.5)])),
         bg=dict(img="Diamond_Kingdom.png", upscale=1400, anchor=(0.5, 0.4), pos=(0.5, 0.45),
                 span=[(0, 1.3), (1.26, 1.2)], blur=2.5,
                 grade=dict(tint=(1.25, 0.6, 0.55), bright=0.7, contrast=1.2), fog=((80, 10, 10), 0.4)),
         cam=dict(ease="out", rot=[(0, -1.5), (0.4, 0.0)]),
         fx=dict(rays=((0.5, 0.3), (255, 50, 30), [(0, 1.5), (1.26, 0.7)]),
                 back_glow=((255, 30, 20), 0.45), rim=((255, 60, 40), 0.7), wrap=0.3),
         hits=[0.0, 0.61], flash=[0.0], shake=0.012, trans_in=("glitch", 0.07)),
    # 11-16 satu panel per hantaman 808
    full(7.940, 8.600, "Black_Slash.png", span=(1.15, 1.0), tone=WARM, hits=[0.0]),
    dict(t0=8.600, t1=9.270,
         char=dict(img="Asta_united_with_Liebe.png", alpha="seg+dark", upscale=2400,
                   dark_boxes=[(0.0, 0.0, 0.46, 0.62), (0.54, 0.0, 1.0, 0.62)], dark_thr=50,
                   anchor=(0.5, 0.42), pos=(0.5, 0.47), span=[(0, 1.2), (0.67, 1.08)],
                   rig=dict(protect=[("ellipse", 0.5, 0.25, 0.035, 0.05)],
                            parts=[dict(type="rotate", region=("box", 0.0, 0.0, 0.41, 0.6, 0.06), pivot=(0.41, 0.33),
                                        angle=[(0, -8.0), (0.4, 2.0)], ease="back"),
                                   dict(type="rotate", region=("box", 0.59, 0.0, 1.0, 0.6, 0.06), pivot=(0.59, 0.33),
                                        angle=[(0, 8.0), (0.4, -2.0)], ease="back")])),
         bg=dict(img="Shadow_Palace_appears.png", upscale=1400, anchor=(0.5, 0.45), pos=(0.5, 0.42), span=1.25,
                 blur=2.0, grade=dict(tint=(1.2, 0.7, 0.8), bright=0.75)),
         cam=dict(ease="out"),
         fx=dict(eyes=([(0.488, 0.245), (0.515, 0.245)], RED, 1.4, 5),
                 rays=((0.5, 0.25), (255, 40, 60), 1.0), rim=((255, 50, 40), 0.7), wrap=0.3),
         hits=[0.0]),
    full(9.270, 9.940, "Demon-Destroyer_Sword_frees_Black_Bulls.png", anchor=(0.5, 0.55), span=(1.12, 1.0),
         tone=WARM, hits=[0.0]),
    full(9.940, 10.600, "Asta_and_Liebe_in_true_Unite.png", anchor=(0.5, 0.36), span=(1.2, 1.05), hits=[0.0]),
    full(10.600, 11.260, "Asta_after_Heart_Kingdom_training.png", anchor=(0.45, 0.3), span=(1.7, 1.55), hits=[0.0]),
    full(11.260, 11.920, "Asta_declares_his_ascension_to_Wizard_King.png", anchor=(0.72, 0.42), span=(1.25, 1.12),
         tone=WARM, hits=[0.0]),
    # 17 PENUTUP: Asta bermahkota (Wizard King) - kamera mundur pelan, sinar emas
    full(11.920, 13.260, "Asta_as_Wizard_King.png", anchor=(0.45, 0.33), span=(1.6, 1.25),
         tone=dict(dark=(20, 10, 6), light=(236, 204, 140)), hits=[0.0, 0.68], ease="out",
         fx=dict(rays=((0.45, 0.22), (255, 190, 80), [(0, 0.45), (1.34, 0.25)])),
         grade=dict(bloom=0.12, bloom_thr=230, bright=0.82, contrast=1.15),
         text=[dict(kind="title", label="DISCIPLINE", name="Wizard King", color=GOLD, at=0.1)]),
]

IMAGES = sorted({s[k]["img"] for s in SHOTS for k in ("char", "bg") if s.get(k)})
