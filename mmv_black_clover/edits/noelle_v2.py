# NOELLE x ASTA v2 - MODE SUTRADARA (mengikuti 2 referensi): banyak adegan, SETIAP adegan = karakter dipotong +
# background baru yang relevan + akting tubuh keyframe (wajah tidak diubah) + echo/garis fokus di hentakan.
# Sound: original sound - tezxs0kun (22.83 dtk). Cut di aksen sound (lihat noelle_confession.py untuk peta sound).
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from style_lock import *  # noqa: F401,F403,E402
from style_lock import COLD, WARM  # noqa: E402
from acting import act, blush, head  # noqa: E402

PARTICLE_COLOR = (200, 230, 255)
ICE = (120, 210, 255)
RED = (255, 50, 40)
WHITE = (255, 245, 230)
BUBBLES = ((160, 220, 255), 0.7, "bubbles")
SPARK = ((235, 240, 255), 0.4, "embers")

# relevansi background: tempat yang memang terkait karakter/momen di cerita
BG = dict(silva="Clover_Castle.png", mansion="King's_bedroom.png", water="Seabed_Temple.png",
          beach="Raque.png", heart="Heart_Kingdom.png", heart_palace="Heart_Kingdom_Royal_Palace.png",
          church="World_End_Church.png", bulls="Black_Bull_Base.png", capital="Royal_Capital.png",
          hage="Hage_village.png", hage_church="Hage_orphanage_church.png", dungeon="Dungeon.png",
          spade="Spade_Kingdom.png", shadow="Shadow_Palace_appears.png", diamond="Diamond_Kingdom.png",
          garden="Zofnir_Garden.png", sun="Freezing_sun_drops_on_Spade_castle.png",
          circles="Magic_circles_of_Qliphoth_Advent_Ritual.png", chamber="Eleventh_chamber_in_Shadow_Palace.png")


def cut(t0, t1, img, bg, acting, anchor, span, pos=(0.5, 0.5), glow=ICE, hits=(0.0,), flash=(), tone=None,
        bg_grade=None, parts=(), **kw):
    """Satu adegan: karakter dipotong di depan background baru, akting keyframe, parallax, rim & light wrap."""
    char = dict(img=img, alpha="seg", upscale=2400, anchor=anchor, pos=pos, span=span, acting=acting,
                rig=dict(parts=[dict(type="wind", region=("box", 0, 0, 1, 1), amp=0.004, freq=0.9, k=6.0, edge=True,
                                     dir=(1.0, 0.35))] + list(parts)))
    if tone:
        char.update(duotone=True, **tone)
    s = dict(t0=t0, t1=t1, char=char,
             bg=dict(img=BG[bg], upscale=1400, anchor=(0.5, 0.45), pos=(0.5, 0.45),
                     span=[(0, 1.3), (t1 - t0, 1.22)], blur=1.6, parallax=0.35,
                     grade=bg_grade or dict(bright=0.72, contrast=1.1)),
             cam=dict(ease="out"), hits=list(hits), flash=list(flash),
             fx=dict(rim=(glow, 0.55), back_glow=(glow, 0.3), wrap=0.4, shadow=0.45))
    s.update(kw)
    return s


SHOTS = [
    # ── HOOK ──
    cut(0.00, 1.30, "Asta_catches_Noelle.png", "beach", "push_in", (0.42, 0.45), 1.2, glow=WHITE,
        hits=(0.18,), particles_cfg=SPARK,
        text=[dict(kind="title", label="SEASON 2 - EPISODE 7", name="She Finally Said It", at=0.2, until=2.6)]),
    cut(1.30, 2.72, "Noelle_Silva_anime_profile.png", "silva", "rise", (0.5, 0.2), 2.2, pos=(0.5, 0.42),
        hits=()),
    # ── kilas balik (staccato 0.32 dtk) ──
    cut(2.72, 3.02, "Asta_Staria.png", "hage", "recoil", (0.5, 0.5), 1.25, tone=WARM, glow=WHITE),
    cut(3.02, 3.34, "Noelle_and_Mimosa_react_to_Sally_hugging_Asta.png", "bulls", "slide_r", (0.8, 0.62), 1.7,
        glow=WHITE),
    cut(3.34, 3.66, "Asta_anime_profile.png", "bulls", "slide_l", (0.5, 0.12), 2.6, pos=(0.5, 0.38), glow=RED),
    cut(3.66, 3.98, "Asta_and_Noelle_first_salary.png", "capital", "recoil", (0.32, 0.45), 1.7, glow=WHITE),
    cut(3.98, 4.30, "Noelle_after_Heart_Kingdom_training.png", "heart", "slide_r", (0.47, 0.15), 2.4,
        pos=(0.5, 0.38)),
    cut(4.30, 4.60, "Asta_after_Heart_Kingdom_training.png", "heart", "slide_l", (0.4, 0.2), 2.2, pos=(0.5, 0.4),
        glow=RED),
    # ── riser ──
    cut(4.60, 5.22, "Noelle_Silva_anime_profile.png", "water", "reach", (0.5, 0.1), 3.6, pos=(0.5, 0.45),
        hits=(), particles_cfg=BUBBLES),
    # ── DROP & 808 ──
    cut(5.22, 5.86, "Noelle_and_Undine_team_up.png", "heart_palace", "recoil", (0.4, 0.5), 1.25, flash=(0.0,),
        particles_cfg=BUBBLES),
    cut(5.86, 6.50, "Saint_Valkyrie_Dress.png", "church", "push_in", (0.6, 0.3), 1.6, pos=(0.5, 0.45),
        particles_cfg=SPARK),
    cut(6.50, 7.12, "Asta_wielding_anti_magic_weapons.png", "diamond", "slide_l", (0.45, 0.35), 1.4, glow=RED,
        bg_grade=dict(tint=(1.2, 0.6, 0.55), bright=0.7, contrast=1.15)),
    cut(7.12, 7.76, "Valkyrie_Dress.png", "water", "float", (0.56, 0.3), 1.3, particles_cfg=BUBBLES),
    cut(7.76, 8.72, "Noelle_defeats_Vanica.png", "shadow", "slide_r", (0.45, 0.3), 1.35, particles_cfg=SPARK),
    cut(8.72, 9.10, "Mermaid_Form_of_Valkyrie_Dress.png", "beach", "recoil", (0.62, 0.3), 1.4),
    cut(9.10, 9.50, "Black_Asta.png", "spade", "reach", (0.6, 0.35), 1.2, glow=RED,
        bg_grade=dict(tint=(1.1, 0.7, 0.7), bright=0.6)),
    cut(9.50, 9.76, "Asta_united_with_Liebe.png", "chamber", "recoil", (0.5, 0.3), 1.2, glow=RED),
    # ── tahan: momen lembut ──
    cut(9.76, 11.60, "Asta_catches_Noelle.png", "hage_church", "turn", (0.5, 0.5), 1.05, glow=WHITE, hits=(),
        bg_grade=dict(bright=0.8, contrast=1.05), particles_cfg=SPARK),
    # ── padat ──
    cut(11.60, 12.50, "Asta_accepts_Noelle_request_to_defeat_Mars.png", "dungeon", "push_in", (0.32, 0.42), 1.5,
        glow=(120, 255, 200), flash=(0.0,)),
    cut(12.50, 13.00, "Noelle_and_Undine_team_up.png", "water", "recoil", (0.32, 0.58), 2.2, particles_cfg=BUBBLES),
    cut(13.00, 14.50, "Saint_Valkyrie_Dress.png", "church", "reach", (0.58, 0.35), 1.15, pos=(0.5, 0.5),
        particles_cfg=SPARK),
    cut(14.50, 15.46, "Asta_anime_profile.png", "bulls", "turn", (0.5, 0.15), 1.9, pos=(0.5, 0.4), glow=RED, hits=()),
    # ── break: inti emosi ──
    act(cut(15.46, 16.98, "Noelle_Silva_anime_profile.png", "mansion", "lean", (0.5, 0.1), 3.4, pos=(0.5, 0.42),
            hits=(), particles_cfg=BUBBLES),
        parts=[head(("ellipse", 0.53, 0.12, 0.14, 0.075, 0.5), (0.53, 0.195), [(0, 0.0), (1.2, -3.0)])],
        blush=blush([(0.505, 0.165, 0.026, 0.008), (0.6, 0.162, 0.02, 0.008)], [(0, 0.0), (0.8, 1.0)])),
    cut(16.98, 17.90, "Acier_hugs_Nozel_and_Noelle.png", "silva", "float", (0.55, 0.35), 1.2, glow=WHITE, hits=(),
        particles_cfg=SPARK, grade=dict(bright=0.75, contrast=1.15, bloom=0.08, bloom_thr=235)),
    cut(17.90, 18.92, "Noelle_after_Heart_Kingdom_training.png", "garden", "float", (0.47, 0.25), 1.6,
        pos=(0.5, 0.45), hits=()),
    # ── bangun lagi -> klimaks ──
    cut(18.92, 20.04, "Saint_Valkyrie_Dress.png", "sun", "rise", (0.6, 0.35), 1.4, flash=(0.0,), particles_cfg=SPARK,
        bg_grade=dict(tint=(1.15, 0.85, 0.7), bright=0.75)),
    cut(20.04, 20.96, "Noelle_defeats_Vanica.png", "circles", "reach", (0.45, 0.3), 1.2),
    cut(20.96, 21.98, "Asta_and_Noelle_first_salary.png", "bulls", "turn", (0.5, 0.45), 1.2, glow=WHITE,
        hits=(0.0, 0.44)),
    # ── penutup = hook (loop) ──
    cut(21.98, 22.83, "Asta_catches_Noelle.png", "beach", "push_in", (0.42, 0.45), 1.2, glow=WHITE,
        particles_cfg=SPARK, text=[dict(kind="title", label="BLACK CLOVER", name="Noelle x Asta", at=0.05)]),
]

IMAGES = sorted({s[k]["img"] for s in SHOTS for k in ("char", "bg") if s.get(k)})
