# MEREOLEONA mv2 - salinan mv1 (edits/mereoleona_ref.py, snapshot branch black-clover-mv1) yang dikembangkan
# mengikuti referensi baru "marjukanak" (edit storytelling Black Clover):
#   transisi : burn (overexposure putih), dark_focus (dip gelap + fokus), rack (rack focus), slash (sabetan merah),
#              lightning (kilat putih) - dua sisi: shot sebelumnya keluar dengan efek yang sama
#   animasi  : kamera tilt 3D (perspektif miring pelan), lensa mencari fokus di awal shot (dof)
#   teks     : dialog typewriter italic kuning-emas + glow, kotak kuning untuk catatan; label nama mv1 tetap di
#              hook & penutup
# Timing, gambar, grade satu warna per adegan, mata menyala & percikan = sama persis dengan mv1 (sound sama).
import copy
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mereoleona_ref as MV1  # noqa: E402
from mereoleona_ref import *  # noqa: F401,F403,E402

SHOTS = copy.deepcopy(MV1.SHOTS)

GOLD_TXT = (255, 200, 40)
FIRE_TXT = (255, 120, 30)
ASH_TXT = (235, 225, 210)


def say(text, at=0.15, color=GOLD_TXT, cps=22.0, **kw):
    return dict(kind="dialog", text=text, at=at, color=color, cps=cps, **kw)


#        shot  trans_in              trans_out prev     tilt keyframe (pitch, yaw) derajat          dof (fokus)
PLAN = {
    0: dict(tilt=[(0, (3.0, -5.0)), (2.72, (0.5, 2.0))]),           # hook: frame pertama tajam (tanpa dof)
    1: dict(trans_in=("burn", 0.40), out_prev=("burn", 0.22), tilt=[(0, (-1.5, 4.0)), (2.5, (1.0, -2.0))],
            text=[say("ALLOW ME TO JOIN IN THIS FIGHT...", at=0.35)]),
    2: dict(trans_in=("lightning", 0.28), tilt=[(0, (4.0, 0.0)), (0.5, (0.0, 0.0)), (2.54, (-1.0, 1.5))],
            text=[say("LEO RUGIENS!!", at=0.25, color=FIRE_TXT, cps=30, size=44)]),
    3: dict(trans_in=("dark_focus", 0.45), out_prev=("dark_focus", 0.25), tilt=[(0, (0.0, -4.0)), (2.0, (2.0, 1.0))],
            dof=[(0, 0.7), (0.6, 0.0)], text=[say("SHE WAS ALREADY A MONSTER AT 15...", at=0.4, color=ASH_TXT)]),
    4: dict(trans_in=("slash", 0.30), tilt=[(0, (-2.0, 3.0)), (2.74, (1.0, -3.0))],
            text=[say("TRAINING WITH HER = SURVIVAL", at=0.35, box=True, size=30, cps=26)]),
    5: dict(trans_in=("burn", 0.35), out_prev=("burn", 0.18), tilt=[(0, (2.5, -3.0)), (2.96, (-0.5, 2.5))],
            text=[say("CAPTAIN OF THE CRIMSON LION KINGS", at=0.4)]),
    6: dict(trans_in=("rack", 0.45), tilt=[(0, (-3.0, 0.0)), (3.46, (1.5, -2.0))], dof=[(0, 0.5), (0.7, 0.0)],
            text=[say("THE RAGING LION NEVER BACKS DOWN...", at=0.5, color=(240, 210, 150))]),
    7: dict(trans_in=("lightning", 0.30), out_prev=("dark_focus", 0.20), tilt=[(0, (3.5, 2.0)), (3.06, (0.0, -2.5))],
            text=[say("BURN IT ALL!!", at=0.3, color=FIRE_TXT, cps=30, size=46)]),
    8: dict(trans_in=("burn", 0.22), out_prev=("burn", 0.14), tilt=[(0, (1.5, -3.0)), (0.85, (0.5, -1.0))]),
}

for i, p in PLAN.items():
    s = SHOTS[i]
    for k in ("tilt", "dof", "trans_in"):
        if k in p:
            s[k] = p[k]
    if "out_prev" in p:
        SHOTS[i - 1]["trans_out"] = p["out_prev"]
    if "text" in p:                       # dialog menggantikan label nama mv1 (hook & penutup tetap label)
        s["text"] = p["text"]
