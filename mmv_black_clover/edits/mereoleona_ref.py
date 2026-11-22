# MEREOLEONA - pola referensi @tezxsokun (Recording + referenso): SEDIKIT adegan panjang (2.5-3.5 dtk),
# satu karakter per adegan, label nama kecil 2 baris di tiap adegan, satu warna dominan per adegan,
# mata menyala, percikan, kamera pelan (push/rotate), transisi glitch/whip/flash di pergantian.
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from style_lock import *  # noqa: F401,F403,E402
from director import FIRE, cut  # noqa: E402

PARTICLE_COLOR = (255, 190, 60)
SPARKS = ((255, 200, 70), 0.75, "fire")
FACE = (0.52, 0.105)
LBL = dict(size=40, label_size=20, y=0.86)          # label kecil seperti referensi


def label(top, name, color):
    return [dict(kind="title", label=top, name=name, at=0.15, T=dict(LBL, bottom=color, glow=color))]


def mono(tint, sat=0.35, bright=0.85):
    """Grade satu warna dominan seperti referensi (kuning / abu / merah)."""
    return dict(tint=tint, sat=sat, bright=bright, contrast=1.2, bloom=0.25, bloom_thr=210)


YEL = (1.15, 1.05, 0.7)
RED = (1.2, 0.8, 0.65)
GREY = (1.0, 1.0, 1.0)

SHOTS = [
    # 1 HOOK - mata singa (0 - 2.72)
    cut(0.00, 2.72, "Mereoleona_as_Royal_Knight.png", "sun", "push_in", (0.47, 0.25), 1.0, hits=(0.18,),
        grade=mono(RED, 0.55), particles_cfg=SPARKS,
        fx=dict(eyes=([(0.06, 0.13), (0.94, 0.13)], (255, 170, 40), [(0, 0.3), (0.5, 1.3)], 14)),
        text=label("BEST WOMEN", "MEREOLEONA VERMILLION", (255, 90, 40))),
    # 2 VO - seringai di lorong batu, cahaya kuning dari samping (2.72 - 5.22)
    cut(2.72, 5.22, "Mereoleona_anime_profile.png", "dungeon", "push_in", (FACE[0], FACE[1] + 0.03), 3.2,
        pos=(0.5, 0.45), hits=(), glow=FIRE, grade=mono(YEL, 0.45), particles_cfg=SPARKS,
        bg_grade=dict(tint=(1.2, 1.05, 0.6), sat=0.4, bright=0.6, contrast=1.25),
        parts=[dict(type="wind", region=("box", 0.25, 0.0, 0.8, 0.13, 0.04), amp=0.010, freq=1.6, k=9.0,
                    edge=True, dir=(0.5, 1.0))],
        fx=dict(eyes=([(0.489, 0.132), (0.555, 0.131)], (255, 210, 60), [(0, 0.0), (0.6, 1.2)], 3),
                rays=((0.15, 0.2), (255, 220, 120), 0.6)),
        text=label("THE RAGING LION", "MEREOLEONA VERMILLION", (255, 200, 60))),
    # 3 DROP - ledakan api (5.22 - 7.76)
    cut(5.22, 7.76, "Mereoleona_erupts.png", "sun", "push_in", (0.45, 0.3), 1.35, flash=(0.0,),
        grade=mono(RED, 0.7, 0.8), particles_cfg=SPARKS, trans_in=("glitch", 0.12),
        text=label("FLAME MAGIC", "LEO RUGIENS", (255, 80, 30))),
    # 4 masa muda (7.76 - 9.76)
    cut(7.76, 9.76, "Mereoleona_at_15.png", "sun", "turn", (0.5, 0.32), 1.5, hits=(), grade=mono(GREY, 0.25),
        particles_cfg=SPARKS, trans_in=("whip", 0.10),
        text=label("AGE 15", "MEREOLEONA", (230, 230, 230))),
    # 5 mentor galak - mencengkeram Asta (9.76 - 12.5)
    cut(9.76, 12.50, "Mereoleona_grabs_Asta.png", "sun", "push_in", (0.33, 0.38), 1.15, hits=(0.0,),
        grade=mono(RED, 0.6), particles_cfg=SPARKS, trans_in=("glitch", 0.10),
        text=label("HOT-BLOODED", "MENTOR", (255, 110, 40))),
    # 6 datang ke Black Bulls dengan api di tangan (12.5 - 15.46)
    cut(12.50, 15.46, "Mereoleona_comes_for_Black_Bull.png", "sun", "push_in", (0.74, 0.42), 1.2,
        grade=mono(YEL, 0.5, 0.8), particles_cfg=SPARKS, trans_in=("flash", 0.06),
        fx=dict(rays=((0.62, 0.35), (255, 180, 60), 0.5)),
        text=label("ROYAL KNIGHTS", "CAPTAIN", (255, 200, 60))),
    # 7 VO 3 - manga (15.46 - 18.92)
    cut(15.46, 18.92, "Mereoleona_after_timeskip.png", "sun", "push_in", (0.5, 0.22), 1.5, hits=(),
        tone=dict(dark=(20, 10, 6), light=(240, 214, 160)), grade=mono(GREY, 1.0, 0.95), particles_cfg=SPARKS,
        trans_in=("whip", 0.10), text=label("BLACK CLOVER", "MANGA", (240, 210, 150))),
    # 8 klimaks api (18.92 - 21.98)
    cut(18.92, 21.98, "Mereoleona_fights_revived_demon.png", "sun", "push_in", (0.55, 0.4), 1.3, flash=(0.0,),
        hits=(0.0, 1.12), grade=mono(RED, 0.75, 0.8), particles_cfg=SPARKS, trans_in=("glitch", 0.12),
        text=label("CALIDUS BRACHIUM", "BURN IT ALL", (255, 80, 30))),
    # 9 penutup = hook
    cut(21.98, 22.83, "Mereoleona_as_Royal_Knight.png", "sun", "push_in", (0.47, 0.25), 1.05,
        grade=mono(RED, 0.55), particles_cfg=SPARKS, trans_in=("flash", 0.05),
        fx=dict(eyes=([(0.06, 0.13), (0.94, 0.13)], (255, 170, 40), 1.3, 14)),
        text=label("BLACK CLOVER", "THE RAGING LION", (255, 90, 40))),
]

IMAGES = sorted({s[k]["img"] for s in SHOTS for k in ("char", "bg") if s.get(k)})
