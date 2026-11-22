# Black Clover MMV 1:1 2K/60fps - "QUEENS OF BLACK CLOVER" (versi girl)  - memakai STYLE LOCK v1
# Sound: sama dengan "DISCIPLINE" (13.26 dtk, ~92 BPM). Build-up 0-6.0 | riser 6.02-6.68 | DROP 6.68
# lalu 808 tiap ~0.65 dtk: 7.94 8.60 9.27 9.94 10.60 11.26 11.92.
# Cerita: build-up = sisi anggun & lembut (warna dingin) -> drop = wujud terkuat mereka.
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from style_lock import *  # noqa: F401,F403,E402
from style_lock import BLOOD, COLD, GOLD, WARM, cutout, full, breathe, wind  # noqa: E402

PARTICLE_COLOR = (255, 200, 170)
ICE = (120, 210, 255)
PINK = (255, 120, 170)

SHOTS = [
    # ── BUILD-UP: anggun ───────────────────────────────────────────────────────────────────────────
    # 1 HOOK frame pertama: Charlotte (sampul berwarna) + label gaya referensi "BEST WOMEN?"
    full(0.000, 1.380, "Charlotte_Roselei.png", anchor=(0.6, 0.5), span=(1.12, 1.3),
         hits=[0.08, 0.40, 0.74, 1.06], shake=0.004, punch=0.02, ease="ease",
         grade=dict(bright=0.88, contrast=1.12),
         text=[dict(kind="title", label="BEST WOMEN?", name="Black Clover", color=(60, 140, 255), at=0.08)]),
    # 2 Secre (Nero) di malam Kerajaan Spade
    cutout(1.380, 3.020, "Secre_anime_profile.png", "Spade_Kingdom.png", anchor=(0.5, 0.24), span=(2.0, 2.15),
           pos=(0.5, 0.42), face=(0.5, 0.1, 0.06, 0.04), glow=(150, 170, 255), hits=[1.0, 1.34],
           bg_grade=dict(bright=0.8, contrast=1.1), particles_cfg=((215, 225, 255), 0.5, "snow")),
    # 3 Noelle di pantai Raque (sihir air)
    cutout(3.020, 4.360, "Noelle_Silva_anime_profile.png", "Raque.png", anchor=(0.5, 0.22), span=(2.0, 2.15),
           pos=(0.5, 0.42), face=(0.5, 0.1, 0.07, 0.05), glow=ICE,
           bg_grade=dict(bright=0.85, sat=0.85), fx=dict(rim=(ICE, 0.6), back_glow=(ICE, 0.35), wrap=0.45,
                                                        rays=((0.5, 0.25), ICE, 0.5))),
    # 4-8 not cepat: satu wajah per not
    cutout(4.360, 4.700, "Mimosa_anime_profile.png", "Heart_Kingdom.png", anchor=(0.5, 0.2), span=(2.2, 2.35),
           pos=(0.5, 0.4), face=(0.5, 0.1, 0.08, 0.05), glow=(120, 255, 170), hits=[0.0],
           bg_grade=dict(bright=0.7)),
    cutout(4.700, 4.980, "Dorothy_anime_profile.png", "Zofnir_Garden.png", anchor=(0.5, 0.25), span=(2.0, 2.15),
           pos=(0.5, 0.42), face=(0.5, 0.2, 0.07, 0.05), glow=PINK, hits=[0.0], bg_grade=dict(bright=0.7)),
    full(4.980, 5.340, "Vanessa_full_outfit.png", anchor=(0.55, 0.24), span=(1.8, 1.95), tone=WARM, hits=[0.0]),
    full(5.340, 5.640, "Fana_profile.png", anchor=(0.5, 0.42), span=(1.15, 1.25), hits=[0.0]),
    full(5.640, 6.020, "Mimosa_as_Royal_Knight.png", anchor=(0.5, 0.2), span=(2.0, 2.15), hits=[0.0]),
    # 9 RISER: Mereoleona dengan mata singa menyala di belakangnya, makin terang sampai drop
    full(6.020, 6.680, "Mereoleona_as_Royal_Knight.png", anchor=(0.47, 0.24), span=(2.2, 2.8), ease="in",
         hits=[0.06, 0.34], shake=0.006, grade=dict(bright=[(0, 0.45), (0.66, 0.95)]), particles=False),

    # ── DROP: wujud terkuat ────────────────────────────────────────────────────────────────────────
    # 10 DROP: Noelle Saint Valkyrie Dress, dipotong ke cahaya biru World End Church
    cutout(6.680, 7.940, "Saint_Valkyrie_Dress.png", "World_End_Church.png", anchor=(0.58, 0.4), span=(1.45, 1.15),
           pos=(0.5, 0.48), face=(0.6, 0.25, 0.04, 0.05), glow=ICE, hits=[0.0, 0.61], flash=[0.0], shake=0.012,
           bg_grade=dict(bright=0.7), wind_amp=0.007, trans_in=("glitch", 0.07),
           fx=dict(rays=((0.5, 0.25), ICE, [(0, 1.4), (1.26, 0.6)]), rim=(ICE, 0.7), back_glow=(ICE, 0.45),
                   wrap=0.35)),
    # 11 Mereoleona: api di bawah matahari merah
    cutout(7.940, 8.600, "Mereoleona_anime_profile.png", "Freezing_sun_drops_on_Spade_castle.png",
           anchor=(0.52, 0.16), span=(2.15, 2.0), pos=(0.5, 0.3), face=(0.52, 0.1, 0.07, 0.05),
           glow=(255, 130, 40), hits=[0.0], bg_grade=dict(tint=(1.25, 0.75, 0.4), sat=0.9, bright=0.75),
           fx=dict(rim=((255, 150, 60), 0.7), back_glow=((255, 110, 20), 0.45), wrap=0.35,
                   rays=((0.5, 0.25), (255, 140, 40), 0.8))),
    # 12-16 satu panel per hantaman 808
    cutout(8.600, 9.270, "Charlotte_anime_profile.png", "Shadow_Palace_appears.png", anchor=(0.5, 0.2),
           span=(2.2, 2.05), pos=(0.5, 0.38), face=(0.5, 0.1, 0.07, 0.05), glow=(110, 160, 255), hits=[0.0],
           bg_grade=dict(tint=(0.8, 0.9, 1.25), bright=0.75)),
    full(9.270, 9.940, "Lolopechka_anime_profile.png", anchor=(0.45, 0.35), span=(1.25, 1.12), hits=[0.0]),
    full(9.940, 10.600, "Dragon_Form_of_Valkyrie_Dress.png", anchor=(0.55, 0.35), span=(1.15, 1.02), tone=WARM,
         hits=[0.0]),
    full(10.600, 11.260, "Ichika_profile.png", anchor=(0.48, 0.38), span=(1.3, 1.18), hits=[0.0]),
    full(11.260, 11.920, "Black_Dragon_Form_of_Valkyrie_Dress.png", anchor=(0.6, 0.4), span=(1.15, 1.02),
         tone=BLOOD, hits=[0.0]),
    # 17 PENUTUP: Saint Noelle menusuk Vanica (biru) + label
    full(11.920, 13.260, "Saint_Noelle_stabs_Vanica.png", anchor=(0.5, 0.5), span=(1.25, 1.05), hits=[0.0, 0.68],
         fx=dict(rays=((0.5, 0.35), ICE, [(0, 0.35), (1.34, 0.2)])),
         grade=dict(bloom=0.08, bloom_thr=235, bright=0.72, contrast=1.15),
         text=[dict(kind="title", label="DISCIPLINE", name="Queens", color=(60, 140, 255), at=0.1)]),
]

IMAGES = sorted({s[k]["img"] for s in SHOTS for k in ("char", "bg") if s.get(k)})
