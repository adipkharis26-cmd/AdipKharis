# TEMPLAT AUDIO — salin ke el_epXX.py, isi CUES. Jalankan: python3 el_epXX.py quota | dry | mix
# Hemat kredit: pakai ulang nama cue umum yang sudah ada di el_cache/ (mis. e9_thud, e8_bonk, e8_whoosh, e6_shutter, e7_ding, e5_flip,
# musik e6_music / e9_music) — nama yang sama = gratis. Buat cue baru hanya untuk bunyi khas episode.
import json, os
from el_lib import run
T = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'epXX-timeline.json')))
s = lambda fr: fr / T['fps']

# (nama, prompt, durasi_detik, waktu_KEJADIAN_dtk, gain_dB, pan)
CUES = [
    # ('eXX_bonk', 'cartoon bonk', 0.4, s(T['bonk1']), 0, 0),
]
MUSIC = [
    # ('e9_music', '...', 12.0, s(T['cutWide']) - 0.2, -17, 0),   # musik lama dipakai ulang = 0 kredit
]
BED = None  # ('eXX_amb', 'room ambience, no voices', 8.0)

run(T, CUES, MUSIC, BED, out_wav='epXX.wav', verify=[
    # ('eXX_bonk', T['bonk1']),
])
