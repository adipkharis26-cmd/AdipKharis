# ASTA - "The boy born without magic" | mv2 (gaya referensi "marjukanak": storytelling, transisi burn / dark_focus /
# rack / slash / lightning, kamera tilt 3D, dialog typewriter) | sound: original sound - lancee612 (23.85 dtk)
# Bedah sound: ~112 BPM, 808 di tiap ketukan (1 bar = 2.14 dtk), vokal sepanjang lagu, energi puncak 16.49-18.3
# (DROP). Struktur cerita: kecil & tanpa sihir -> Yuno dapat grimoire -> Asta tidak -> grimoire 5 daun -> DROP
# Devil Union -> janji Wizard King -> Wizard King (spoiler manga) -> kembali ke masa kecil (loop).
# Niche: storytelling / lore Black Clover (anime-only Season 2 + pembaca manga tamat) - evergreen.
# Campuran acak: 5 adegan karakter DIPOTONG (alpha PNG / isnet) di atas 1 background baru yang bergerak
# (shot 2, 4, 5, 8, 9) + 7 adegan background ASLI (gambar utuh bergelombang).
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from style_lock import *  # noqa: F401,F403,E402
from style_lock import WARM  # noqa: E402
from director import cut  # noqa: E402

PARTICLE_COLOR = (255, 200, 120)
DUST = ((255, 215, 140), 0.45, "embers")              # debu emas melayang (cahaya hangat referensi)
REDFIRE = ((230, 30, 30), 0.8, "fire")
GOLD_GLOW = (255, 190, 80)

GOLD_TXT = (255, 200, 40)
RED_TXT = (255, 70, 50)
PALE_TXT = (235, 228, 214)


def sepia(bright=1.05, sat=0.55, tint=(1.12, 1.0, 0.78)):
    """Grade hangat kuning-sepia seperti referensi."""
    return dict(tint=tint, sat=sat, bright=bright, contrast=1.15, bloom=0.35, bloom_thr=200)


def say(text, at=0.2, color=GOLD_TXT, cps=22.0, **kw):
    return dict(kind="dialog", text=text, at=at, color=color, cps=cps, **kw)


def tilt(d, a, b):
    return [(0, a), (d, b)]


BG_WARM = dict(tint=(1.15, 1.0, 0.75), sat=0.6, bright=0.8, contrast=1.1)


def onbg(s, bg_img, png=False, seg=False):
    """Karakter dipotong (png = transparansi asli art resmi, seg = model isnet-anime) di atas 1 gambar background
    yang diganti & dianimasikan (geser berlawanan, zoom, putar pelan, kabut, depth of field)."""
    s["char"]["alpha"] = "png" if png else "seg"
    s["bg"]["img"] = bg_img
    s["bg"]["fog"] = ((60, 45, 30), 0.2)
    parts = s["char"]["rig"]["parts"]
    parts.append(dict(type="wind", region=("box", 0.15, 0.0, 0.85, 0.22, 0.05), amp=0.009, freq=1.3, k=8.0,
                      edge=True, dir=(1.0, 0.25)))                      # rambut tertiup angin
    parts.append(dict(type="breathe", region=("box", 0, 0.2, 1, 1), osc=(0.006, 0.5), pivot=(0.5, 1.0)))  # napas
    return s


SHOTS = [
    # 1 HOOK (0 - 2.18) Asta kecil di Hage - frame pertama tajam, tanpa transisi
    cut(0.00, 2.18, "Asta_at_6.png", "hage_church", "push_in", (0.55, 0.24), 2.0, pos=(0.5, 0.45), hits=(),
        glow=GOLD_GLOW, who="duo", grade=sepia(), particles_cfg=DUST, tilt=tilt(2.18, (2.0, -4.0), (0.5, 1.5)),
        text=[say("THE BOY BORN WITHOUT MAGIC...", at=0.1)]),
    # 2 [POTONG] Sister Lily (art resmi, alpha PNG) di depan gereja Hage yang bergerak (2.18 - 4.32)
    onbg(cut(2.18, 4.32, "Lily_anime_profile.png", "hage", "rise", (0.5, 0.3), 1.55, pos=(0.42, 0.5), hits=(),
             glow=GOLD_GLOW, who="duo", particles_cfg=DUST, trans_in=("burn", 0.40), bg_grade=BG_WARM,
             fx=dict(rays=((0.62, 0.05), (255, 220, 140), 0.6)), tilt=tilt(2.14, (-1.5, 3.5), (1.0, -2.0)),
             text=[say("LEFT AT A CHURCH IN HAGE...", at=0.4)]), "Hage_orphanage_church.png", png=True),
    # 3 lamaran ke Sister Lily - manga diwarnai hangat (4.32 - 6.46)
    cut(4.32, 6.46, "Asta's_last_proposal_to_Lily.png", "hage", "turn", (0.72, 0.42), 1.0, hits=(), who="duo",
        tone=WARM, grade=sepia(0.8, 0.8), particles_cfg=DUST, trans_in=("dark_focus", 0.45),
        tilt=tilt(2.14, (0.0, -4.0), (2.0, 1.0)), dof=[(0, 0.6), (0.6, 0.0)],
        text=[say("SISTER, PLEASE MARRY ME!", at=0.45, box=True, size=30, cps=26)]),
    # 4 [POTONG] Asta (art resmi) di desa Hage - geser masuk dari kiri (6.46 - 8.57)
    onbg(cut(6.46, 8.57, "Asta_anime_profile.png", "hage", "slide_l", (0.5, 0.28), 1.9, pos=(0.5, 0.42), hits=(),
             glow=GOLD_GLOW, who="duo", particles_cfg=DUST, trans_in=("rack", 0.40), bg_grade=BG_WARM,
             tilt=tilt(2.11, (-2.0, 3.0), (1.0, -3.0)),
             text=[say("EVERYONE HAD MAGIC. EXCEPT HIM.", at=0.35)]), "Hage_village.png", png=True),
    # 5 [POTONG] Yuno (art resmi) di menara grimoire, sinar cahaya di belakang (8.57 - 10.74)
    onbg(cut(8.57, 10.74, "Yuno_anime_profile.png", "hage", "float", (0.5, 0.45), 1.05, pos=(0.5, 0.55), hits=(),
             glow=(255, 230, 140), who="duo", particles_cfg=DUST, trans_in=("burn", 0.35), bg_grade=BG_WARM,
             fx=dict(rays=((0.5, 0.2), (255, 230, 120), 0.9), back_glow=((255, 210, 120), 0.5)),
             tilt=tilt(2.17, (2.5, -3.0), (-0.5, 2.5)),
             text=[say("YUNO GOT A FOUR-LEAF GRIMOIRE...", at=0.4)]), "Hage_Grimoire_Tower.png", png=True),
    # 6 Asta tidak dapat apa-apa - malam, dingin (10.74 - 12.86)
    cut(10.74, 12.86, "Asta_received_his_grimoire.png", "hage", "push_in", (0.6, 0.35), 1.2, hits=(),
        who="duo", grade=dict(tint=(0.95, 0.95, 1.05), sat=0.5, bright=1.05, contrast=1.15, bloom=0.3),
        particles_cfg=DUST, trans_in=("dark_focus", 0.45), dof=[(0, 0.5), (0.6, 0.0)],
        tilt=tilt(2.12, (-3.0, 0.0), (1.5, -2.0)), text=[say("AND ASTA GOT... NOTHING.", at=0.45, color=PALE_TXT)]),
    # 7 grimoire 5 daun memilihnya (12.86 - 15.02)
    cut(12.86, 15.02, "Asta_Grimoire.png", "hage", "push_in", (0.5, 0.5), 0.85, hits=(0.0,), who="asta",
        grade=dict(tint=(1.15, 0.92, 0.8), sat=0.85, bright=1.5, contrast=0.85, bloom=0.3), particles_cfg=REDFIRE, trans_in=("rack", 0.35),
        tilt=tilt(2.16, (3.5, 2.0), (0.0, -2.5)), text=[say("UNTIL A FIVE-LEAF GRIMOIRE CHOSE HIM.", at=0.35)]),
    # 8 [POTONG] build - Asta dengan pedang anti-sihir di depan istana Clover (15.02 - 16.49)
    onbg(cut(15.02, 16.49, "Asta_wielding_anti_magic_weapons.png", "capital", "recoil", (0.42, 0.4), 1.25,
             pos=(0.5, 0.55), hits=(0.0,), who="asta", grade=sepia(0.95, 0.75), particles_cfg=REDFIRE,
             trans_in=("slash", 0.28), bg_grade=dict(tint=(1.15, 0.85, 0.75), sat=0.7, bright=0.6, contrast=1.2),
             tilt=tilt(1.47, (-2.0, 3.0), (1.0, -1.0)),
             text=[say("NOT GIVING UP IS MY MAGIC!", at=0.2, cps=30, color=RED_TXT)]), "Clover_Castle.png", seg=True),
    # 9 [POTONG] DROP - Devil Union bersama Liebe di atas kerajaan Spade (16.49 - 18.76)
    onbg(cut(16.49, 18.76, "Asta_united_with_Liebe.png", "spade", "recoil", (0.48, 0.4), 1.6, pos=(0.5, 0.52),
             hits=(0.0, 1.07), flash=(0.0,), who="asta",
             grade=dict(tint=(1.2, 0.8, 0.8), sat=0.85, bright=1.0, contrast=1.2, bloom=0.4), particles_cfg=REDFIRE,
             trans_in=("lightning", 0.30), tilt=tilt(2.27, (4.0, 0.0), (-1.0, 1.5)),
             bg_grade=dict(tint=(1.25, 0.6, 0.55), sat=0.8, bright=0.55, contrast=1.3),
             text=[say("SURPASS YOUR LIMITS!!", at=0.3, cps=30, color=RED_TXT, size=44)]), "Spade_Kingdom.png", seg=True),
    # 10 janji Wizard King (18.76 - 20.90)
    cut(18.76, 20.90, "Asta_and_Yuno_prepared_to_aim_for_the_top.png", "capital", "push_in", (0.7, 0.4), 1.3,
        hits=(), who="duo", grade=sepia(1.0, 0.7), particles_cfg=DUST, trans_in=("burn", 0.35),
        tilt=tilt(2.14, (2.5, -3.0), (-0.5, 2.5)), text=[say("I WILL BE THE WIZARD KING!", at=0.35)]),
    # 11 Wizard King (manga, spoiler) - dialog penutup bertanda spoiler (20.90 - 22.50)
    cut(20.90, 22.50, "Asta_as_Wizard_King.png", "capital", "rise", (0.5, 0.3), 1.35, hits=(0.0,), who="duo",
        tone=WARM, grade=sepia(0.8, 0.9), particles_cfg=DUST, trans_in=("slash", 0.25),
        tilt=tilt(1.6, (-3.0, 0.0), (1.5, -2.0)),
        text=[say("SPOILER: HE BECAME THE WIZARD KING.", at=0.15, size=28, box=True, cps=28)]),
    # 12 loop - kembali ke masa kecil (22.50 - 23.85)
    cut(22.50, 23.85, "Lily_heals_Asta.png", "hage_church", "push_in", (0.38, 0.5), 1.0, hits=(), who="duo",
        grade=sepia(0.95), particles_cfg=DUST, trans_in=("burn", 0.30), tilt=tilt(1.35, (1.5, -3.0), (0.5, -1.0))),
]

# transisi dua sisi (shot sebelumnya keluar dengan efek yang sama)
for _i, _s in enumerate(SHOTS[1:], 1):
    _k = _s.get("trans_in", ("", 0))[0]
    if _k in ("burn", "dark_focus"):
        SHOTS[_i - 1]["trans_out"] = (_k, 0.2)
for _s in SHOTS:
    if _s.get("trans_out", 1) is None:
        _s.pop("trans_out")

# ---- tampilan mv2 (bukan style_lock mv1): style story_glow
import importlib.util as _ilu  # noqa: E402
_sp = _ilu.spec_from_file_location("story_glow", os.path.join(os.path.dirname(os.path.abspath(__file__)), "styles",
                                                              "story_glow.py"))
_st = _ilu.module_from_spec(_sp)
_sp.loader.exec_module(_st)
TEXTURE_CHAR, TEXTURE_BG, DAPPLED, PAPER, POST, TEXT, WM = (_st.TEXTURE_CHAR, _st.TEXTURE_BG, _st.DAPPLED, _st.PAPER,
                                                           _st.POST, _st.TEXT, _st.WM)
STYLE_NAME = "story_glow"

IMAGES = sorted({s[k]["img"] for s in SHOTS for k in ("char", "bg") if s.get(k)})
