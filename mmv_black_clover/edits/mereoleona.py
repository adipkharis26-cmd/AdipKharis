# MEREOLEONA - "The Raging Lion" | sound: original sound - tezxs0kun (22.83 dtk) yang berisi VO Mereoleona.
# Bagian VO (vokal dominan, bass hilang): 2.72-5.22, 7.5-9.76, 15.46-18.92 -> close-up Mereoleona "berbicara"
# (kepala mengangguk mengikuti ritme suara, wajah tidak diubah). Bagian 808 -> api & pukulan.
# Panel manga & adegan penuh api otomatis dipakai utuh (gelombang); karakter bersih dipotong ke background baru.
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from style_lock import *  # noqa: F401,F403,E402
from style_lock import BLOOD, WARM  # noqa: E402
from director import FIRE, cut  # noqa: E402

PARTICLE_COLOR = (255, 120, 40)
GOLD = (255, 190, 60)
FACE = (0.52, 0.105)                  # wajah di Mereoleona_anime_profile

SHOTS = [
    # ── HOOK: mata singa (diulang di akhir untuk loop) ──
    cut(0.00, 1.30, "Mereoleona_as_Royal_Knight.png", "sun", "push_in", (0.47, 0.25), 1.0, hits=(0.18,),
        text=[dict(kind="title", label="BEST WOMEN?", name="Mereoleona Vermillion", at=0.2, until=2.6)],
        fx=dict(eyes=([(0.06, 0.13), (0.94, 0.13)], (255, 170, 40), [(0, 0.3), (0.4, 1.3)], 14))),
    # keluarga Vermillion (dipotong bersih, background istana bergerak)
    cut(1.30, 2.72, "Fuegoleon_anime_profile.png", "capital", "rise", (0.5, 0.15), 2.2, pos=(0.5, 0.42), hits=(),
        glow=FIRE, who="mereo"),
    # ── VO 1: Mereoleona berbicara ──
    # VO: Mereoleona diam menyeringai (intimidasi) - kamera mendekat pelan, rambut berkobar, aura api, kilat mata
    cut(2.72, 3.98, "Mereoleona_anime_profile.png", "sun", "push_in", (FACE[0], FACE[1] + 0.02), 4.0,
        pos=(0.5, 0.42), hits=(), glow=FIRE, bg_grade=dict(tint=(1.25, 0.75, 0.4), bright=0.62),
        parts=[dict(type="wind", region=("box", 0.25, 0.0, 0.8, 0.13, 0.04), amp=0.012, freq=2.3, k=9.0, edge=True,
                    dir=(0.5, 1.0))],
        fx=dict(eyes=([(0.489, 0.132), (0.555, 0.131)], (255, 150, 40), [(0, 0.0), (0.5, 0.0), (0.8, 1.1), (1.26, 0.6)],
                      3), back_glow=((255, 90, 10), 0.7), aura_osc=(0.6, 1.8), rim=((255, 140, 50), 0.7))),
    cut(3.98, 4.60, "Mereoleona_at_15.png", "sun", "push_in", (0.5, 0.3), 1.6),
    cut(4.60, 5.22, "Mereoleona_as_a_child.png", "silva", "reach", (0.33, 0.3), 1.6),
    # ── DROP: api ──
    cut(5.22, 5.86, "Mereoleona_erupts.png", "sun", "recoil", (0.45, 0.25), 1.3, flash=(0.0,)),
    cut(5.86, 6.50, "Mereoleona_burns_two_Astas.png", "sun", "push_in", (0.25, 0.4), 1.0),
    cut(6.50, 7.12, "Mereoleona_fights_revived_demon.png", "sun", "reach", (0.5, 0.45), 1.0),
    cut(7.12, 7.76, "Leopold_anime_profile.png", "capital", "slide_r", (0.5, 0.15), 2.2, pos=(0.5, 0.42),
        glow=FIRE, who="mereo"),
    # ── VO 2 ──
    cut(7.76, 8.72, "Mereoleona_profile.png", "sun", "lean", (0.5, 0.18), 1.7, hits=()),
    cut(8.72, 9.10, "Mereoleona_punches_Vetto.png", "sun", "recoil", (0.5, 0.5), 1.0, tone=BLOOD),
    cut(9.10, 9.50, "Mereoleona_vs_Rhya.png", "sun", "recoil", (0.5, 0.45), 1.0, tone=WARM),
    cut(9.50, 9.76, "Mereoleona_punches_Asta.png", "sun", "recoil", (0.5, 0.5), 1.0, tone=WARM),
    # ── mentor galak ──
    cut(9.76, 11.60, "Mereoleona_grabs_Asta.png", "sun", "turn", (0.35, 0.4), 1.0, hits=()),
    cut(11.60, 13.00, "Mereoleona_comes_for_Black_Bull.png", "sun", "push_in", (0.72, 0.4), 1.0, flash=(0.0,),
        hits=(0.0, 0.9)),
    cut(13.00, 14.50, "Calidus_Brachium_Purgatory_Flame_Burial.png", "sun", "reach", (0.5, 0.45), 1.0, tone=WARM),
    cut(14.50, 15.46, "Mereoleona_defeats_demon.png", "sun", "push_in", (0.5, 0.5), 1.0, tone=WARM),
    # ── VO 3 (break) ──
    cut(15.46, 17.20, "Mereoleona_after_timeskip.png", "sun", "lean", (0.5, 0.2), 1.3, hits=(), tone=WARM),
    cut(17.20, 18.92, "Mereoleona_at_19.png", "silva", "float", (0.5, 0.2), 1.2, hits=(), tone=WARM),
    # ── bangun lagi ──
    cut(18.92, 20.04, "Fuegoleon_Leo_Rugiens.png", "sun", "push_in", (0.5, 0.4), 1.3, flash=(0.0,)),
    cut(20.04, 21.98, "Hot-Blooded_Tuesday.png", "sun", "reach", (0.62, 0.72), 1.5, hits=(0.0, 0.92)),
    # ── penutup = hook ──
    cut(21.98, 22.83, "Mereoleona_as_Royal_Knight.png", "sun", "push_in", (0.47, 0.25), 1.0,
        text=[dict(kind="title", label="BLACK CLOVER", name="The Raging Lion", at=0.05)],
        fx=dict(eyes=([(0.06, 0.13), (0.94, 0.13)], (255, 170, 40), 1.3, 14))),
]

IMAGES = sorted({s[k]["img"] for s in SHOTS for k in ("char", "bg") if s.get(k)})
