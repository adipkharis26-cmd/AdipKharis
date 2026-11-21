# EP10 "Popcorn" audio. Jalankan: python3 el_ep10.py quota | dry | mix  (key disisipkan proxy, tidak ada di repo)
import json, os
from el_lib import run
T = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'ep10-timeline.json')))
s = lambda fr: fr / T['fps']
POP = ('e10_pop', 'single crisp popcorn kernel pop, close up, dry, isolated', 0.5)
CUES = [
    POP + (s(T['popHook']), 0, 0),
    POP + (s(20), -10, -0.4), POP + (s(31), -12, -0.4),
    ('e2_hop', '', 0.4, s(T['snickDrop'][0]), -12, -0.3),
    ('e9_land', '', 0.5, s(T['snickLand']), -9, -0.3),
    ('e10_crank', 'kitchen timer dial being cranked fast, plastic ratchet clicking rapidly', 1.0, s(T['crank'][0]), -3, 0),
    ('e10_popping', 'popcorn popping in microwave, starting slow then rapidly accelerating into frantic popping', 3.0, s(T['cutWin']), -2, 0),
    ('e5_snicker', '', 0.8, s(T['crank'][1] + 3), -9, -0.3),
    ('e9_gasp', '', 0.4, s(T['cutBrick']), -8, 0.3),
    ('e10_burst', 'cartoon explosion of popcorn, big comedic boom with whoosh and burst of popping', 1.2, s(T['burst']) - 0.02, 0, 0),
    ('e8_clang', '', 0.5, s(T['potHit']), -3, 0.2),
    ('e8_bonk', '', 0.4, s(T['helmet']), -4, 0.3),
    ('boing1', '', 0.5, s(T['toastHit']), -5, 0.4),
    ('e9_thud', '', 0.4, s(T['fridgeHit']), 0, 0.6),
    ('e4_avalanche', '', 3.0, s(T['flood'][0] + 30), -8, 0),
    ('e1_munch', '', 0.8, s(T['munch']), -5, 0),
    ('e7_ding', '', 0.6, s(T['ding']), -8, -0.3),
    ('e2_pop', '', 0.4, s(T['snickPop']), -6, -0.4),
    ('e5_sad', '', 1.0, s(T['sad']), -9, -0.4),
    ('e7_toss', '', 0.5, s(T['toss'][0]), -8, 0.2),
    ('e2_gulp', '', 0.5, s(T['toss'][1]), -3, 0),
]
LOOPS = [('e10_popping', '', 3.0, [[T['burst'] + 10, T['ding']]], -14, 0)]
MUSIC = [('e4_music', '', 9.0, s(T['cutWide']) - 0.1, -18, 0)]
BED = ('e10_hum', 'microwave oven running, steady low electrical hum, no beeps', 6.0)
run(T, CUES, MUSIC, BED, bed_db=-22, loops=LOOPS, out_wav='ep10.wav', verify=[('e10_pop', T['popHook']), ('e10_burst', T['burst']), ('e9_thud', T['fridgeHit']), ('e8_clang', T['potHit'])])
