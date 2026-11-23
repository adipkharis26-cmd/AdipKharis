# KAPTEN MAGIC KNIGHT - "Nine captains. One kingdom." | mv2 | sound: sound3 (dari video visualizer, 21.45 dtk)
# Bedah sound: ~96 BPM (1 ketukan 0.63 dtk), build-up vokal 0-9.96 (adegan cerita 2.5 dtk), DROP 808 berat
# 9.96-21.45 (1 kapten per 2 ketukan, nama diketik cepat), hening setelah 21.45 (dipotong).
# Niche: ensemble para kapten - setiap kapten dapat panggung, bukan hanya MC.
# Campuran acak: 6 adegan karakter DIPOTONG (art resmi, alpha PNG) di background baru yang bergerak + 7 adegan ASLI.
# Font: 1 font terkunci dari edits/font_lock.py, dipilih acak untuk video ini.
import importlib.util as _ilu
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from style_lock import *  # noqa: F401,F403,E402
from director import cut  # noqa: E402
import font_lock  # noqa: E402

PARTICLE_COLOR = (255, 200, 120)
DUST = ((255, 215, 140), 0.45, "embers")
SPARK = ((235, 240, 255), 0.5, "embers")
FIRE = ((255, 120, 40), 0.8, "fire")
GOLD_GLOW = (255, 190, 80)


def sepia(bright=1.0, sat=0.6, tint=(1.12, 1.0, 0.8)):
    return dict(tint=tint, sat=sat, bright=bright, contrast=1.15, bloom=0.35, bloom_thr=200)


def say(text, at=0.2, color=None, cps=22.0, **kw):
    return dict(kind="dialog", text=text, at=at, color=color, cps=cps, **kw)


def name(text, color=None):                       # nama kapten di drop: diketik cepat, besar
    return [say(text, at=0.12, color=color, cps=40, size=48)]


def tilt(d, a, b):
    return [(0, a), (d, b)]


def onbg(s, bg_img, grade=None):
    """Karakter dipotong (alpha PNG art resmi) di atas 1 background baru yang bergerak + napas & rambut."""
    s["char"]["alpha"] = "png"
    s["bg"]["img"] = bg_img
    s["bg"]["fog"] = ((60, 45, 30), 0.2)
    if grade:
        s["bg"]["grade"] = grade
    parts = s["char"]["rig"]["parts"]
    parts.append(dict(type="wind", region=("box", 0.15, 0.0, 0.85, 0.22, 0.05), amp=0.009, freq=1.3, k=8.0,
                      edge=True, dir=(1.0, 0.25)))
    parts.append(dict(type="breathe", region=("box", 0, 0.2, 1, 1), osc=(0.006, 0.5), pivot=(0.5, 1.0)))
    return s


BG_WARM = dict(tint=(1.15, 1.0, 0.75), sat=0.6, bright=0.75, contrast=1.1)
BG_RED = dict(tint=(1.25, 0.7, 0.55), sat=0.7, bright=0.6, contrast=1.25)
BG_COLD = dict(tint=(0.9, 0.95, 1.1), sat=0.6, bright=0.6, contrast=1.2)

SHOTS = [
    # ---- BUILD-UP (cerita, 4 bar) ----
    # 1 HOOK: tiga kapten bentrok (asli)
    cut(0.00, 2.30, "Nozel_and_Fuegoleon_stop_Yami_and_Damnatio.png", "capital", "push_in", (0.5, 0.45), 1.0,
        hits=(), who="duo", grade=dict(tint=(1.12, 1.0, 0.8), sat=0.65, bright=0.8, contrast=1.2, bloom=0.08, bloom_thr=240), particles_cfg=DUST, tilt=tilt(2.3, (2.0, -4.0), (0.5, 1.5)),
        text=[say("NINE CAPTAINS. ONE KINGDOM.", at=0.1)]),
    # 2 [POTONG] Julius di depan istana, sinar dari belakang
    onbg(cut(2.30, 4.85, "Julius_anime_profile.png", "silva", "rise", (0.5, 0.3), 1.5, pos=(0.5, 0.5), hits=(),
             glow=GOLD_GLOW, who="duo", particles_cfg=DUST, trans_in=("burn", 0.40),
             fx=dict(rays=((0.5, 0.1), (255, 225, 140), 0.8)), tilt=tilt(2.55, (-1.5, 3.5), (1.0, -2.0)),
             text=[say("LED BY THE WIZARD KING...", at=0.4)]), "Clover_Castle.png", BG_WARM),
    # 3 Mereoleona memarahi Crimson Lion (asli)
    cut(4.85, 7.38, "Mereoleona_yells_at_Crimson_Lions.png", "capital", "turn", (0.5, 0.4), 1.0,
        hits=(), who="duo", grade=sepia(0.72, 0.7) | dict(bloom=0.1, bloom_thr=235), particles_cfg=DUST, trans_in=("dark_focus", 0.45),
        dof=[(0, 0.6), (0.6, 0.0)], tilt=tilt(2.53, (0.0, -4.0), (2.0, 1.0)),
        text=[say("SOME ARE PROUD. SOME ARE RECKLESS.", at=0.45)]),
    # 4 [POTONG] Charlotte di taman berduri
    onbg(cut(7.38, 9.96, "Charlotte_anime_profile.png", "garden", "slide_l", (0.5, 0.28), 1.8, pos=(0.5, 0.42),
             hits=(), glow=GOLD_GLOW, who="duo", particles_cfg=DUST, trans_in=("rack", 0.40),
             tilt=tilt(2.58, (-2.0, 3.0), (1.0, -3.0)),
             text=[say("ALL OF THEM ARE MONSTERS.", at=0.4, box=True, size=30, cps=26)]), "Zofnir_Garden.png",
         BG_WARM),
    # ---- DROP (1 kapten per 2 ketukan) ----
    # 5 DROP Yami (asli)
    cut(9.96, 11.05, "Yami's_Reverse_Blade_Strike.png", "bulls", "recoil", (0.5, 0.45), 1.0, hits=(0.0,),
        flash=(0.0,), who="duo", grade=dict(tint=(1.0, 0.95, 1.05), sat=0.75, bright=0.72, contrast=1.25, bloom=0.1, bloom_thr=235),
        particles_cfg=SPARK, trans_in=("lightning", 0.25), tilt=tilt(1.09, (4.0, 0.0), (-1.0, 1.5)),
        text=name("YAMI SUKEHIRO", (200, 180, 255))),
    # 6 [POTONG] Mereoleona, api
    onbg(cut(11.05, 12.31, "Mereoleona_anime_profile.png", "sun", "recoil", (0.52, 0.2), 2.2, pos=(0.5, 0.45),
             hits=(0.0,), glow=(255, 110, 30), who="mereo", particles_cfg=FIRE, trans_in=("slash", 0.22),
             tilt=tilt(1.26, (-2.0, 3.0), (1.0, -1.0)), text=name("MEREOLEONA", (255, 110, 40))),
         "Freezing_sun_drops_on_Spade_castle.png", BG_RED),
    # 7 Fuegoleon Leo Rugiens (asli)
    cut(12.31, 13.61, "Fuegoleon_Leo_Rugiens.png", "capital", "push_in", (0.5, 0.45), 1.0, hits=(0.0,),
        who="duo", grade=dict(tint=(1.15, 0.9, 0.75), sat=0.8, bright=0.9, contrast=1.2, bloom=0.2, bloom_thr=230),
        particles_cfg=FIRE, trans_in=("burn", 0.22), tilt=tilt(1.3, (2.5, -3.0), (-0.5, 2.5)),
        text=name("FUEGOLEON", (255, 140, 50))),
    # 8 [POTONG] Jack di hutan
    onbg(cut(13.61, 14.81, "Jack_anime_profile.png", "forest", "slide_r", (0.5, 0.25), 2.0, pos=(0.5, 0.45),
             hits=(0.0,), glow=(160, 255, 120), who="duo", particles_cfg=SPARK, trans_in=("slash", 0.2),
             tilt=tilt(1.2, (-3.0, 0.0), (1.5, -2.0)), text=name("JACK THE RIPPER", (170, 255, 120))),
         "Witches_Forest_inside.png", BG_COLD),
    # 9 Dorothy (asli)
    cut(14.81, 16.14, "Dorothy_vs_Reve.png", "capital", "push_in", (0.5, 0.45), 1.0, hits=(0.0,), who="duo",
        grade=sepia(0.82, 0.8, (1.1, 0.95, 1.05)) | dict(bloom=0.12, bloom_thr=235), particles_cfg=DUST, trans_in=("rack", 0.25),
        tilt=tilt(1.33, (3.5, 2.0), (0.0, -2.5)), text=name("DOROTHY", (255, 170, 220))),
    # 10 [POTONG] William di hutan penyihir
    onbg(cut(16.14, 17.37, "William_anime_profile.png", "forest", "float", (0.5, 0.3), 1.7, pos=(0.5, 0.48),
             hits=(0.0,), glow=(200, 255, 170), who="duo", particles_cfg=DUST, trans_in=("burn", 0.2),
             fx=dict(rays=((0.5, 0.1), (220, 255, 190), 0.6)), tilt=tilt(1.23, (2.0, -3.0), (-0.5, 2.0)),
             text=name("WILLIAM VANGEANCE", (200, 255, 170))), "Witches_Forest_inside.png", BG_WARM),
    # 11 Nozel Silver Eagle (asli)
    cut(17.37, 18.67, "Nozel's_Silver_Eagle.png", "capital", "recoil", (0.5, 0.45), 1.0, hits=(0.0,), who="duo",
        grade=dict(tint=(0.95, 1.0, 1.1), sat=0.7, bright=0.72, contrast=1.2, bloom=0.1, bloom_thr=235), particles_cfg=SPARK,
        trans_in=("slash", 0.22), tilt=tilt(1.3, (-2.5, 2.0), (1.0, -1.0)), text=name("NOZEL SILVA", (200, 220, 255))),
    # 12 Julius Chrono Stasis (asli)
    cut(18.67, 19.83, "Julius_Chrono_Stasis.png", "capital", "push_in", (0.35, 0.3), 1.3, hits=(0.0,),
        who="duo", grade=sepia(1.0, 0.75), particles_cfg=DUST, trans_in=("lightning", 0.22),
        tilt=tilt(1.16, (3.0, -2.0), (0.0, 2.0)), text=name("THE WIZARD KING", (255, 215, 90))),
    # 13 penutup (asli) - pertanyaan untuk komentar
    cut(19.83, 21.45, "Yami_shows_the_star_of_excellence.png", "bulls", "push_in", (0.5, 0.45), 1.0, hits=(0.0,),
        who="duo", grade=sepia(1.0, 0.7), particles_cfg=DUST, trans_in=("burn", 0.25),
        tilt=tilt(1.62, (1.5, -3.0), (0.5, -1.0)),
        text=[say("WHO'S THE STRONGEST CAPTAIN?", at=0.2, box=True, size=30, cps=30)]),
]

for _i, _s in enumerate(SHOTS[1:], 1):
    _k = _s.get("trans_in", ("", 0))[0]
    if _k in ("burn", "dark_focus"):
        SHOTS[_i - 1]["trans_out"] = (_k, 0.18)

# ---- tampilan mv2: style story_glow + font terkunci (acak per video)
_sp = _ilu.spec_from_file_location("story_glow", os.path.join(os.path.dirname(os.path.abspath(__file__)), "styles",
                                                              "story_glow.py"))
_st = _ilu.module_from_spec(_sp)
_sp.loader.exec_module(_st)
TEXTURE_CHAR, TEXTURE_BG, DAPPLED, PAPER, POST, TEXT, WM = (_st.TEXTURE_CHAR, _st.TEXTURE_BG, _st.DAPPLED, _st.PAPER,
                                                           _st.POST, _st.TEXT, _st.WM)
STYLE_NAME = "story_glow"
FONT_NAME, _f = font_lock.pick(os.path.basename(__file__))
FONT_LOCK = (_f[0], _f[1], _f[2], _f[3])

IMAGES = sorted({s[k]["img"] for s in SHOTS for k in ("char", "bg") if s.get(k)})
