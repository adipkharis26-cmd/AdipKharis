# Black Clover MMV 1:1 2K/60fps - "QUEENS OF BLACK CLOVER" v4 = akting berbasis CIRI KHAS & SIHIR karakter  - STYLE LOCK v1
# Sound asli 19.06 dtk, dipotong mulai 0.40 dtk (--audio-start 0.4) -> 18.66 dtk; aksen pertama = frame pertama.
# Aksen (setelah dipotong): 0.02 3.08 4.00 4.96 5.80 7.92 9.44/9.74 (dobel = "drop") 12.76 13.68 14.60 15.50 17.62
# Bagian: A 0-5.0 | B 5.0-9.7 (melodi berganti) | A' 9.7-15.0 | B' 15.0-18.66
# Vibe: anggun & lembut -> guncangan halus, flash hanya di drop, partikel berkilau (bukan bara).
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from style_lock import *  # noqa: F401,F403,E402
from style_lock import BLOOD, WARM, cutout, full  # noqa: E402
from acting import act, blink, blush, head, smile  # noqa: E402

PARTICLE_COLOR = (255, 225, 200)
SPARKLE = ((255, 230, 210), 0.45, "embers")
ICE = (120, 210, 255)
PINK = (255, 120, 170)
BLUE_TXT = (60, 140, 255)
SOFT = dict(shake=0.004, punch=0.015)

_BASE = [
    # ── A: perkenalan anggun ───────────────────────────────────────────────────────────────────────
    full(0.000, 1.540, "Charlotte_Roselei.png", anchor=(0.6, 0.5), span=(1.12, 1.3), hits=[0.02], ease="ease",
         grade=dict(bright=0.88, contrast=1.12), particles_cfg=SPARKLE, **SOFT,
         text=[dict(kind="title", label="BEST WOMEN?", name="Black Clover", color=BLUE_TXT, at=0.05)]),
    cutout(1.540, 3.080, "Secre_anime_profile.png", "Spade_Kingdom.png", anchor=(0.5, 0.24), span=(2.0, 2.15),
           pos=(0.5, 0.42), face=(0.5, 0.1, 0.06, 0.04), glow=(150, 170, 255),
           bg_grade=dict(bright=0.8, contrast=1.1), particles_cfg=((215, 225, 255), 0.5, "snow"),
           trans_in=("whip", 0.08), **SOFT),
    cutout(3.080, 4.000, "Noelle_Silva_anime_profile.png", "Raque.png", anchor=(0.5, 0.22), span=(2.0, 2.12),
           pos=(0.5, 0.42), face=(0.5, 0.1, 0.07, 0.05), glow=ICE, hits=[0.0], particles_cfg=SPARKLE,
           bg_grade=dict(bright=0.85, sat=0.85), **SOFT,
           fx=dict(rim=(ICE, 0.6), back_glow=(ICE, 0.35), wrap=0.45, rays=((0.5, 0.25), ICE, 0.5))),
    cutout(4.000, 4.960, "Mimosa_anime_profile.png", "Heart_Kingdom.png", anchor=(0.5, 0.2), span=(2.2, 2.32),
           pos=(0.5, 0.4), face=(0.5, 0.1, 0.08, 0.05), glow=(120, 255, 170), hits=[0.0], particles_cfg=SPARKLE,
           bg_grade=dict(bright=0.7), **SOFT),
    # ── B: melodi berganti ─────────────────────────────────────────────────────────────────────────
    cutout(4.960, 5.800, "Dorothy_anime_profile.png", "Zofnir_Garden.png", anchor=(0.5, 0.25), span=(2.0, 2.12),
           pos=(0.5, 0.42), face=(0.5, 0.2, 0.07, 0.05), glow=PINK, hits=[0.0], bg_grade=dict(bright=0.7),
           particles_cfg=((255, 190, 220), 0.45, "embers"), trans_in=("whip", 0.08), **SOFT),
    full(5.800, 6.860, "Vanessa_full_outfit.png", anchor=(0.55, 0.24), span=(1.8, 1.95), tone=WARM, hits=[0.0],
         particles_cfg=SPARKLE, **SOFT),
    full(6.860, 7.920, "Fana_profile.png", anchor=(0.5, 0.42), span=(1.12, 1.25), ease="ease",
         particles_cfg=SPARKLE, **SOFT),
    full(7.920, 8.700, "Mimosa_as_Royal_Knight.png", anchor=(0.5, 0.2), span=(2.0, 2.15), hits=[0.0],
         particles_cfg=SPARKLE, **SOFT),
    # menuju drop: Mereoleona, makin terang
    full(8.700, 9.440, "Mereoleona_as_Royal_Knight.png", anchor=(0.47, 0.24), span=(2.2, 2.7), ease="in",
         grade=dict(bright=[(0, 0.55), (0.74, 0.95)]), particles=False, **SOFT),
    # aksen dobel 9.44 / 9.74: kilatan Valkyrie hijau lalu DROP
    full(9.440, 9.740, "Valkyrie_Dress.png", anchor=(0.55, 0.4), span=(1.2, 1.32), hits=[0.0], shake=0.006,
         punch=0.02, grade=dict(bright=0.85), particles=False),
    # ── A': wujud terkuat ──────────────────────────────────────────────────────────────────────────
    cutout(9.740, 11.250, "Saint_Valkyrie_Dress.png", "World_End_Church.png", anchor=(0.58, 0.4), span=(1.45, 1.15),
           pos=(0.5, 0.48), face=(0.6, 0.25, 0.04, 0.05), glow=ICE, hits=[0.0], flash=[0.0], shake=0.008,
           bg_grade=dict(bright=0.7), wind_amp=0.007, trans_in=("glitch", 0.06), particles_cfg=SPARKLE,
           fx=dict(rays=((0.5, 0.25), ICE, [(0, 1.3), (1.5, 0.5)]), rim=(ICE, 0.7), back_glow=(ICE, 0.45),
                   wrap=0.35)),
    cutout(11.250, 12.760, "Mereoleona_anime_profile.png", "Freezing_sun_drops_on_Spade_castle.png",
           anchor=(0.52, 0.16), span=(2.2, 2.0), pos=(0.5, 0.3), face=(0.52, 0.1, 0.07, 0.05),
           glow=(255, 130, 40), bg_grade=dict(tint=(1.25, 0.75, 0.4), sat=0.9, bright=0.75), **SOFT,
           fx=dict(rim=((255, 150, 60), 0.7), back_glow=((255, 110, 20), 0.45), wrap=0.35,
                   rays=((0.5, 0.25), (255, 140, 40), 0.8))),
    cutout(12.760, 13.680, "Charlotte_anime_profile.png", "Shadow_Palace_appears.png", anchor=(0.5, 0.2),
           span=(2.2, 2.08), pos=(0.5, 0.38), face=(0.5, 0.1, 0.07, 0.05), glow=(110, 160, 255), hits=[0.0],
           bg_grade=dict(tint=(0.8, 0.9, 1.25), bright=0.75), particles_cfg=SPARKLE, **SOFT),
    full(13.680, 14.600, "Lolopechka_anime_profile.png", anchor=(0.45, 0.35), span=(1.25, 1.12), hits=[0.0],
         particles_cfg=SPARKLE, **SOFT),
    full(14.600, 15.500, "Ichika_profile.png", anchor=(0.48, 0.38), span=(1.3, 1.18), hits=[0.0],
         particles_cfg=SPARKLE, **SOFT),
    # ── B': penutup ────────────────────────────────────────────────────────────────────────────────
    full(15.500, 16.560, "Dragon_Form_of_Valkyrie_Dress.png", anchor=(0.55, 0.35), span=(1.15, 1.02), tone=WARM,
         hits=[0.0], trans_in=("whip", 0.08), **SOFT),
    full(16.560, 17.620, "Black_Dragon_Form_of_Valkyrie_Dress.png", anchor=(0.6, 0.4), span=(1.15, 1.02),
         tone=BLOOD, hits=[0.0], **SOFT),
    full(17.620, 18.660, "Saint_Noelle_stabs_Vanica.png", anchor=(0.5, 0.5), span=(1.22, 1.08), hits=[0.0],
         fx=dict(rays=((0.5, 0.35), ICE, [(0, 0.35), (1.04, 0.2)])),
         grade=dict(bloom=0.08, bloom_thr=235, bright=[(0, 0.72), (0.75, 0.72), (1.04, 0.2)], contrast=1.15),
         particles_cfg=SPARKLE, **SOFT,
         text=[dict(kind="title", label="BLACK CLOVER", name="Queens", color=BLUE_TXT, at=0.05)]),
]



# ── AKTING v4: wajah asli dijaga; akting dari ciri khas & sihir tiap karakter ───────────────────────
# Gambar-ulang wajah HANYA untuk Dorothy (selalu mengantuk) dan Vanessa (genit, wink). Tidak ada pin mulut.
BLUE_ROSE = [(60, 100, 230), (110, 150, 255), (205, 220, 255)]
PLANT = [(80, 190, 80), (140, 225, 110), (255, 170, 205)]
FIRE = (255, 110, 30)

A = {
    # Charlotte - tsundere, Blue Rose Knights: merona + memalingkan wajah + kelopak mawar biru
    0: dict(parts=[head(("ellipse", 0.55, 0.52, 0.42, 0.34, 0.5), (0.62, 0.95), [(0, 0.0), (1.5, -2.5)])],
            blush=blush([(0.43, 0.56, 0.06, 0.03)], [(0, 0.0), (0.7, 0.85)]),
            particles=(BLUE_ROSE, 1.0, "petals")),
    # Secre / Nero - datar & diam, Sealing Magic: wajah utuh, lingkaran segel ungu berputar di belakangnya
    1: dict(fx=dict(circle=((0.5, 0.36), 0.36, (170, 90, 255), [(0, 0.0), (0.35, 0.75), (1.54, 0.6)]))),
    # Noelle - tsundere, sihir air: dagu naik "hmph" + merona + gelembung air
    2: dict(parts=[head(("ellipse", 0.53, 0.12, 0.14, 0.075, 0.5), (0.53, 0.195), [(0, 0.0), (0.55, -3.0)], ease="out")],
            blush=blush([(0.505, 0.165, 0.026, 0.008), (0.6, 0.162, 0.02, 0.008)], [(0, 0.0), (0.5, 0.9)]),
            particles=((150, 215, 255), 0.9, "bubbles")),
    # Mimosa - lembut, Plant Magic: merona + daun & kelopak bunga
    3: dict(blush=blush([(0.475, 0.134, 0.03, 0.012), (0.585, 0.134, 0.03, 0.012)], [(0, 0.2), (0.6, 0.85)]),
            particles=(PLANT, 1.0, "leaves")),
    # Dorothy - selalu tidur, Dream Magic: mata sayu tertutup + kepala mengangguk + gelembung mimpi
    4: dict(parts=[head(("ellipse", 0.5, 0.25, 0.2, 0.11, 0.5), (0.5, 0.34), [(0, 0.0), (0.84, 7.0)], ease="in")],
            blink=blink([(0.473, 0.257, 0.017, 0.0072), (0.554, 0.257, 0.017, 0.0072)], [],
                        droop=[(0, 0.45), (0.45, 0.7), (0.84, 1.0)]),
            particles=((255, 160, 220), 0.9, "bubbles")),
    # Vanessa - genit, Thread Magic: satu-satunya wink + benang merah takdir
    5: dict(blink=blink([(0.531, 0.142, 0.021, 0.0065), (0.436, 0.155, 0.012, 0.006)], [(0.45, [0])], dur=0.32,
                        style="happy"),
            fx=dict(threads=((255, 40, 60), [(0, 0.0), (0.3, 0.9)]))),
    # Fana - Salamander (api): wajah utuh, bara api
    6: dict(particles=(FIRE, 0.7, "fire"), fx=dict(rays=((0.5, 0.3), (255, 140, 60), 0.35))),
    # Mimosa Royal Knight - merona + daun & kelopak
    7: dict(blush=blush([(0.43, 0.14, 0.035, 0.012), (0.56, 0.14, 0.035, 0.012)], [(0, 0.3), (0.5, 0.85)]),
            particles=(PLANT, 1.0, "leaves")),
    # Mereoleona (Royal Knight) - buas, api: wajah asli, rambut berkobar, bara api, mata singa menyala
    8: dict(parts=[dict(type="wind", region=("box", 0.12, 0.05, 0.42, 0.5, 0.06), amp=0.010, freq=2.2, k=9.0,
                        edge=False, dir=(0.6, 1.0)),
                   dict(type="wind", region=("box", 0.55, 0.02, 0.9, 0.5, 0.06), amp=0.010, freq=2.4, k=9.0,
                        edge=False, dir=(0.6, 1.0))],
            eyes=([(0.06, 0.13), (0.94, 0.13)], (255, 170, 40), [(0, 0.0), (0.6, 1.3)], 14),
            particles=(FIRE, 0.8, "fire"), fx=dict(rays=((0.47, 0.25), (255, 120, 30), [(0, 0.15), (0.7, 0.4)]))),
    # Mereoleona (anime) - api: aura berdenyut seperti kobaran, rambut berkobar, bara
    11: dict(parts=[dict(type="wind", region=("box", 0.25, 0.0, 0.8, 0.13, 0.04), amp=0.012, freq=2.3, k=9.0,
                         edge=True, dir=(0.5, 1.0))],
             fx=dict(aura_osc=(0.35, 1.4), back_glow=((255, 100, 20), 0.6)),
             particles=(FIRE, 0.9, "fire")),
    # Charlotte (zirah) - tsundere: merona + kelopak mawar biru
    12: dict(blush=blush([(0.52, 0.172, 0.025, 0.008), (0.6, 0.172, 0.02, 0.008)], [(0, 0.0), (0.5, 0.9)]),
             particles=(BLUE_ROSE, 1.0, "petals")),
    # Lolopechka - ceroboh & ceria, sihir air: kepala bergoyang + merona + gelembung
    13: dict(parts=[head(("ellipse", 0.47, 0.38, 0.2, 0.16, 0.5), (0.47, 0.56), osc=(2.5, 1.3, 0.0))],
             blush=blush([(0.44, 0.37, 0.04, 0.02), (0.56, 0.36, 0.04, 0.02)], 0.7),
             particles=((170, 225, 255), 0.8, "bubbles")),
    # Ichika - pendekar pedang: kilatan menyapu bilah katana
    14: dict(fx=dict(glint=((0.05, 0.885), (0.66, 0.872), 0.3, 0.45, 1.0))),
}

SHOTS = [act(s, **A[i]) if i in A else s for i, s in enumerate(_BASE)]
IMAGES = sorted({s[k]["img"] for s in _BASE for k in ("char", "bg") if s.get(k)})
