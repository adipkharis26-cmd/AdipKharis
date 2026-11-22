# Black Clover MMV 1:1 2K/60fps - "NOELLE x ASTA" (Season 2 Ep 7: Noelle mengakui perasaannya, 14 Nov 2026)
# Sound: original sound - tezxs0kun (22.83 dtk, ~96 BPM, vokal). Genre disarankan: mmv (sound kreator referensi).
# Peta sound:
#   0.00-2.60  intro keras (hentakan 0.18)            -> HOOK: Asta menangkap Noelle
#   2.72-4.60  staccato tiap 0.32 dtk, bass hilang     -> kilas balik tsundere (1 momen per ketukan)
#   4.60-5.22  riser                                  -> Noelle menatap, makin terang
#   5.22-7.76  808 tiap 0.64                          -> kekuatan Noelle (sihir air)
#   8.72-9.76  4 hentakan rapat                       -> wujud Valkyrie berganti cepat
#   9.76-11.60 tahan                                  -> asal ikatan mereka (pelangi)
#   11.6-15.3  bagian padat                           -> Noelle & Asta bertarung bersama
#   15.4-18.9  break tenang (vokal)                   -> inti emosi: Noelle merona, pelukan ibunya
#   18.9-22.83 bangun lagi                            -> klimaks Valkyrie -> kembali ke hook (loop)
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from style_lock import *  # noqa: F401,F403,E402
from style_lock import WARM, cutout, full  # noqa: E402
from acting import act, blush, head  # noqa: E402

PARTICLE_COLOR = (200, 230, 255)
ICE = (120, 210, 255)
BUBBLES = ((160, 220, 255), 0.8, "bubbles")
SPARK = ((220, 240, 255), 0.45, "embers")
SOFT = dict(shake=0.004, punch=0.015)

_NOELLE = act(
    cutout(15.460, 16.980, "Noelle_Silva_anime_profile.png", "Raque.png", anchor=(0.5, 0.15), span=(2.6, 2.8),
           pos=(0.5, 0.36), face=(0.5, 0.1, 0.07, 0.05), glow=ICE, bg_grade=dict(bright=0.8, sat=0.85),
           particles_cfg=BUBBLES, **SOFT),
    parts=[head(("ellipse", 0.53, 0.12, 0.14, 0.075, 0.5), (0.53, 0.195), [(0, 0.0), (1.2, -3.0)], ease="ease")],
    blush=blush([(0.505, 0.165, 0.026, 0.008), (0.6, 0.162, 0.02, 0.008)], [(0, 0.0), (0.8, 1.0)]))

SHOTS = [
    # ── HOOK ──
    full(0.000, 2.720, "Asta_catches_Noelle.png", anchor=(0.42, 0.5), span=(1.0, 1.12), hits=[0.18], ease="ease",
         particles_cfg=SPARK, grade=dict(bright=0.95),
         text=[dict(kind="title", label="SEASON 2 - EPISODE 7", name="She Finally Said It", at=0.2, until=2.4)]),
    # ── kilas balik tsundere (staccato) ──
    full(2.720, 3.020, "Noelle_and_Asta_arguing.png", span=(1.0, 1.06), tone=WARM, hits=[0.0], **SOFT),
    full(3.020, 3.340, "Noelle_tries_to_attack_Asta.png", span=(1.0, 1.06), tone=WARM, hits=[0.0], **SOFT),
    full(3.340, 3.660, "Asta_shouting_at_Noelle.png", anchor=(0.5, 0.4), span=(1.0, 1.06), tone=WARM, hits=[0.0],
         **SOFT),
    full(3.660, 3.980, "Noelle_pushing_Asta_with_magic.png", span=(1.0, 1.06), hits=[0.0], **SOFT),
    full(3.980, 4.300, "Noelle_and_Mimosa_react_to_Sally_hugging_Asta.png", anchor=(0.72, 0.6), span=(1.25, 1.3),
         hits=[0.0], **SOFT),
    full(4.300, 4.600, "Asta_and_Noelle_first_salary.png", anchor=(0.28, 0.5), span=(1.15, 1.2), hits=[0.0], **SOFT),
    # ── riser ──
    full(4.600, 5.220, "Noelle_after_Heart_Kingdom_training.png", anchor=(0.5, 0.2), span=(2.3, 2.7), ease="in",
         grade=dict(bright=[(0, 0.6), (0.62, 1.0)]), particles=False),
    # ── 808: kekuatan Noelle ──
    full(5.220, 5.860, "Noelle_and_Undine_team_up.png", anchor=(0.4, 0.55), span=(1.2, 1.08), hits=[0.0],
         flash=[0.0], particles_cfg=BUBBLES),
    full(5.860, 6.500, "Noelle_defeats_Vanica.png", anchor=(0.6, 0.4), span=(1.15, 1.04), hits=[0.0],
         particles_cfg=SPARK),
    cutout(6.500, 7.120, "Saint_Valkyrie_Dress.png", "World_End_Church.png", anchor=(0.58, 0.4), span=(1.35, 1.2),
           pos=(0.5, 0.48), face=(0.6, 0.25, 0.04, 0.05), glow=ICE, hits=[0.0], bg_grade=dict(bright=0.7),
           particles_cfg=SPARK,
           fx=dict(rays=((0.5, 0.25), ICE, 1.0), rim=(ICE, 0.7), back_glow=(ICE, 0.45), wrap=0.35)),
    full(7.120, 7.760, "Valkyrie_Dress.png", anchor=(0.55, 0.4), span=(1.15, 1.04), hits=[0.0], particles_cfg=BUBBLES),
    full(7.760, 8.720, "Acier_stops_Vanica.png", anchor=(0.45, 0.5), span=(1.0, 1.08), hits=[0.0]),
    # ── 4 hentakan rapat: Valkyrie berganti ──
    full(8.720, 9.100, "Mermaid_Form_of_Valkyrie_Dress.png", anchor=(0.5, 0.45), span=(1.2, 1.3), hits=[0.0]),
    full(9.100, 9.500, "Dragon_Form_of_Valkyrie_Dress.png", anchor=(0.55, 0.35), span=(1.2, 1.3), tone=WARM,
         hits=[0.0]),
    full(9.500, 9.760, "Black_Dragon_Form_of_Valkyrie_Dress.png", anchor=(0.6, 0.4), span=(1.2, 1.3), hits=[0.0]),
    # ── tahan: asal ikatan (pelangi) ──
    full(9.760, 11.600, "Origin_of_Asta_and_Noelle_bond.png", anchor=(0.45, 0.62), span=(1.15, 1.02), ease="ease",
         hits=[0.0], particles_cfg=SPARK, grade=dict(bright=1.0, contrast=1.05, bloom=0.05, bloom_thr=240),
         fx=dict(rays=((0.5, 0.1), (255, 240, 220), 0.35)), **SOFT),
    # ── bagian padat: bertarung bersama ──
    full(11.600, 12.500, "Asta_accepts_Noelle_request_to_defeat_Mars.png", anchor=(0.3, 0.45), span=(1.15, 1.05),
         hits=[0.0], flash=[0.0]),
    full(12.500, 13.000, "Asta_saves_Mimosa_and_Noelle_from_Mars_attack.png", span=(1.1, 1.02), hits=[0.0]),
    full(13.000, 14.500, "Saint_Noelle_stabs_Vanica.png", anchor=(0.5, 0.5), span=(1.25, 1.05), hits=[0.0],
         grade=dict(bloom=0.08, bloom_thr=235, bright=0.75, contrast=1.15)),
    full(14.500, 15.460, "Noelle_as_Royal_Knight.png", anchor=(0.5, 0.17), span=(2.4, 2.6), hits=[0.0], **SOFT),
    # ── break emosional ──
    _NOELLE,
    full(16.980, 18.920, "Acier_hugs_Nozel_and_Noelle.png", anchor=(0.5, 0.45), span=(1.08, 1.2), ease="ease",
         hits=[0.0], particles_cfg=SPARK, grade=dict(bright=0.72, contrast=1.2, bloom=0.08, bloom_thr=235), **SOFT),
    # ── bangun lagi -> klimaks ──
    cutout(18.920, 20.040, "Saint_Valkyrie_Dress.png", "World_End_Church.png", anchor=(0.58, 0.4), span=(1.5, 1.15),
           pos=(0.5, 0.48), face=(0.6, 0.25, 0.04, 0.05), glow=ICE, hits=[0.0, 0.7], flash=[0.0],
           bg_grade=dict(bright=0.7), particles_cfg=SPARK,
           fx=dict(rays=((0.5, 0.25), ICE, [(0, 1.4), (1.1, 0.6)]), rim=(ICE, 0.7), back_glow=(ICE, 0.45), wrap=0.35)),
    full(20.040, 20.960, "Noelle_defeats_Vanica.png", anchor=(0.62, 0.35), span=(1.4, 1.25), hits=[0.0]),
    full(20.960, 21.980, "Asta_and_Noelle_exploring_the_dungeon.png", span=(1.08, 1.0), hits=[0.0, 0.44]),
    # ── penutup: kembali ke hook (loop) ──
    full(21.980, 22.830, "Asta_catches_Noelle.png", anchor=(0.42, 0.48), span=(1.2, 1.1), hits=[0.0],
         particles_cfg=SPARK,
         text=[dict(kind="title", label="BLACK CLOVER", name="Noelle x Asta", at=0.05)]),
]

IMAGES = sorted({s[k]["img"] for s in SHOTS for k in ("char", "bg") if s.get(k)})
