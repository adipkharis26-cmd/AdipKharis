# MEREOLEONA - "The Raging Lion" | sound: original sound - tezxs0kun (22.83 dtk) yang berisi VO Mereoleona.
# Bagian VO (vokal dominan, bass hilang): 2.72-5.22, 7.5-9.76, 15.46-18.92 -> close-up Mereoleona "berbicara"
# (kepala mengangguk mengikuti ritme suara, wajah tidak diubah). Bagian 808 -> api & pukulan.
# Panel manga & adegan penuh api otomatis dipakai utuh (gelombang); karakter bersih dipotong ke background baru.
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from style_lock import *  # noqa: F401,F403,E402
from style_lock import BLOOD, WARM  # noqa: E402
from director import FIRE, cut, speak  # noqa: E402

PARTICLE_COLOR = (255, 120, 40)
GOLD = (255, 190, 60)
FACE = (0.52, 0.105)                  # wajah di Mereoleona_anime_profile

SHOTS = [
    # ── HOOK: mata singa ──
    cut(0.00, 1.30, "Mereoleona_as_Royal_Knight.png", "sun", "push_in", (0.47, 0.25), 1.0, hits=(0.18,),
        text=[dict(kind="title", label="BEST WOMEN?", name="Mereoleona Vermillion", at=0.2, until=2.6)],
        fx=dict(eyes=([(0.06, 0.13), (0.94, 0.13)], (255, 170, 40), [(0, 0.3), (0.4, 1.3)], 14))),
    cut(1.30, 2.72, "Mereoleona_anime_profile.png", "sun", "rise", (0.5, 0.25), 1.25, pos=(0.5, 0.48), hits=(),
        glow=FIRE, bg_grade=dict(tint=(1.25, 0.75, 0.4), sat=0.9, bright=0.72)),
    # ── VO 1: Mereoleona berbicara ──
    cut(2.72, 3.98, "Mereoleona_anime_profile.png", "spade", "lean", (FACE[0], FACE[1] + 0.02), 4.2,
        pos=(0.5, 0.42), hits=(), glow=FIRE, parts=speak(*FACE), bg_grade=dict(bright=0.6, contrast=1.15)),
    cut(3.98, 4.60, "Mereoleona_at_15.png", "sun", "push_in", (0.5, 0.3), 1.6),
    cut(4.60, 5.22, "Mereoleona_as_a_child.png", "silva", "reach", (0.33, 0.3), 1.6, glow=(255, 190, 60),
        bg_grade=dict(bright=0.7, sat=0.85)),
    # ── DROP: api ──
    cut(5.22, 5.86, "Mereoleona_erupts.png", "sun", "recoil", (0.45, 0.2), 1.6, flash=(0.0,)),
    cut(5.86, 6.50, "Mereoleona_erupts.png", "sun", "push_in", (0.45, 0.45), 1.0),
    cut(6.50, 7.12, "Mereoleona_burns_two_Astas.png", "sun", "push_in", (0.25, 0.4), 1.0),
    cut(7.12, 7.76, "Mereoleona_fights_revived_demon.png", "sun", "reach", (0.5, 0.45), 1.0),
    # ── VO 2 ──
    cut(7.76, 8.72, "Mereoleona_anime_profile.png", "diamond", "lean", (FACE[0], FACE[1] + 0.02), 3.8,
        pos=(0.5, 0.42), hits=(), glow=FIRE, parts=speak(*FACE), bg_grade=dict(tint=(1.2, 0.7, 0.5), bright=0.6)),
    cut(8.72, 9.10, "Mereoleona_punches_Vetto.png", "sun", "recoil", (0.5, 0.5), 1.0, tone=BLOOD),
    cut(9.10, 9.50, "Mereoleona_vs_Rhya.png", "sun", "recoil", (0.5, 0.45), 1.0, tone=WARM),
    cut(9.50, 9.76, "Mereoleona_punches_Asta.png", "sun", "recoil", (0.5, 0.5), 1.0, tone=WARM),
    # ── mentor galak ──
    cut(9.76, 11.60, "Mereoleona_grabs_Asta.png", "sun", "turn", (0.35, 0.4), 1.0, hits=()),
    cut(11.60, 12.50, "Mereoleona_comes_for_Black_Bull.png", "sun", "push_in", (0.72, 0.4), 1.0, flash=(0.0,)),
    cut(12.50, 13.00, "Mereoleona_fights_revived_demon.png", "sun", "recoil", (0.62, 0.35), 1.4),
    cut(13.00, 14.50, "Calidus_Brachium_Purgatory_Flame_Burial.png", "sun", "reach", (0.5, 0.45), 1.0, tone=WARM),
    cut(14.50, 15.46, "Mereoleona_grabs_Asta.png", "sun", "push_in", (0.3, 0.3), 1.5),
    # ── VO 3 (break): masa kecil -> remaja -> sekarang ──
    cut(15.46, 16.98, "Mereoleona_as_a_child.png", "silva", "float", (0.35, 0.3), 1.3, pos=(0.5, 0.48), hits=(),
        glow=GOLD, bg_grade=dict(bright=0.75, sat=0.8)),
    cut(16.98, 17.90, "Mereoleona_at_19.png", "silva", "lean", (0.5, 0.2), 1.0, hits=(), tone=WARM),
    cut(17.90, 18.92, "Mereoleona_anime_profile.png", "sun", "lean", (FACE[0], FACE[1] + 0.02), 3.6,
        pos=(0.5, 0.42), hits=(), glow=FIRE, parts=speak(*FACE, amp=1.1),
        bg_grade=dict(tint=(1.25, 0.75, 0.4), bright=0.65)),
    # ── bangun lagi ──
    cut(18.92, 20.04, "Hot-Blooded_Tuesday.png", "sun", "push_in", (0.5, 0.5), 1.0, flash=(0.0,)),
    cut(20.04, 20.96, "Mereoleona_anime_profile.png", "sun", "reach", (0.5, 0.3), 1.6, pos=(0.5, 0.5), glow=FIRE,
        bg_grade=dict(tint=(1.25, 0.75, 0.4), sat=0.9, bright=0.7)),
    cut(20.96, 21.98, "Mereoleona_comes_for_Black_Bull.png", "sun", "push_in", (0.75, 0.4), 1.25,
        hits=(0.0, 0.44)),
    # ── penutup = hook ──
    cut(21.98, 22.83, "Mereoleona_as_Royal_Knight.png", "sun", "push_in", (0.47, 0.25), 1.0,
        text=[dict(kind="title", label="BLACK CLOVER", name="The Raging Lion", at=0.05)],
        fx=dict(eyes=([(0.06, 0.13), (0.94, 0.13)], (255, 170, 40), 1.3, 14))),
]

IMAGES = sorted({s[k]["img"] for s in SHOTS for k in ("char", "bg") if s.get(k)})
