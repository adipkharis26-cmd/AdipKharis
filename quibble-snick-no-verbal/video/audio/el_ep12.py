# EP12 "Balloon" audio. Jalankan: python3 el_ep12.py quota | dry | mix  (key disisipkan proxy, tidak ada di repo)
# Frame cerita >= 420 (hook) dipetakan ke awal video (mod 420).
import json, os
from el_lib import run
T = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'ep12-timeline.json')))
s = lambda fr: (fr % T['frames']) / T['fps']
POP = ('e12_pop', 'single sharp rubber balloon pop burst, close, dry, isolated', 0.5)
UP = ('e12_slideup', 'cartoon slide whistle rising upward, playful, short', 1.0)
SQK = ('e12_squeak', 'rubber balloon squeak, short stretchy squeak', 0.5)
CUES = [
    ('e9_reverse', '', 0.8, s(T['rewind'][0]), -4, 0),
    ('e12_rewind', 'fast tape rewind chatter, cartoon VHS rewinding sound, short', 0.6, s(T['rewind'][0] + 1), -8, 0),
    SQK + (s(T['take'][0]), -8, -0.3), SQK + (s(T['take'][1]), -7, -0.3),
    ('e6_twinkle', '', 0.6, s(T['take'][1] + 2), -12, -0.3),
    UP + (s(T['lift']), -8, -0.2),
    ('e9_gasp', '', 0.4, s(T['qNotice']), -10, 0.2),
    ('e1_run', '', 0.6, s(T['qRun'][0]), -12, 0.2),
    ('e2_catch', '', 0.4, s(T['qGrab']), -6, 0),
    ('e9_land', '', 0.5, s(T['qLand']), -9, 0),
    ('smug_ting', '', 0.6, s(T['qSmug']), -9, 0.2),
    ('e2_snatch', '', 0.5, s(T['snatch']), -6, -0.3),
    UP + (s(T['qLift']), -9, 0),
    ('e1_munch', '', 0.6, s(T['stuff']), -9, 0.4),
    ('e4_stomp', '', 0.4, s(T['bWalk'][0] + 3), -14, 0.3), ('e4_stomp', '', 0.4, s(T['bWalk'][0] + 9), -14, 0.2),
    ('e9_thud', '', 0.5, s(T['bGrab']), -4, 0),
    ('e6_strain', '', 0.8, s(T['bPlant'][0]), -12, 0),
    ('e2_wind', '', 1.2, s(T['gust']), -6, -0.3),
    UP + (s(T['bLift']), -6, 0), ('e7_gasp', '', 0.4, s(T['bLift'] + 2), -10, 0),
    ('e8_rustle', '', 0.6, s(T['bunting']), -10, 0.2),
    ('e8_clang', '', 0.5, s(T['gondola']), -6, 0.3), ('e8_bonk', '', 0.4, s(T['gondola']), -8, 0.3),
    ('e12_tweet', 'small cute songbird chirps twice, outdoor, clean, isolated', 0.8, s(T['bird'][1]), -6, 0.3),
    ('e12_flap', 'small bird wings flapping away quickly', 0.6, s(T['bird'][2]), -8, -0.2),
    ('e7_whimper', '', 0.8, s(T['lookDown']), -10, 0),
    ('e2_wind', '', 1.2, s(T['peak'][0]), -12, 0),
    ('e9_idea', '', 0.6, s(T['idea']), -6, 0.2),
    ('e2_gulp', '', 0.5, s(T['gulp'][0] + 2), -6, 0.2),
    ('e7_toss', '', 0.5, s(T['toss'][0]), -8, 0),
    ('e2_catch', '', 0.4, s(T['toss'][1]), -8, 0),
    *[POP + (s(p) - 0.01, -1 - (i % 3), (-0.3, 0.3, 0)[i % 3]) for i, p in enumerate(T['pops'])],
    ('e8_boing', '', 0.6, s(T['land']), -4, 0), ('e9_land', '', 0.5, s(T['land']), -10, 0),
    ('e2_hop', '', 0.4, s(T['qHop'][1]), -10, -0.3),
    ('pop_out', '', 0.4, s(T['dotDown'][1]), -10, 0.3),
    ('e6_twinkle', '', 0.6, s(T['giveB'][1]), -9, 0.2),
    ('e7_sparkle', '', 0.6, s(T['giveQ'][1]), -9, -0.2),
    ('e8_twinkle', '', 0.8, s(T['hearts']), -10, 0),
    ('boing1', '', 0.6, s(T['hop1'][1]), -7, 0), ('boing2', '', 0.6, s(T['hop2'][1]), -5, 0),
    ('big_jump', '', 0.5, s(T['launch']), -6, 0), UP + (s(T['launch'] + 1), -5, 0),
    ('e9_click', '', 0.3, s(T['snapQ']), -8, -0.2), ('e9_click', '', 0.3, s(T['snapB']), -8, 0.2),
    ('e8_whoosh', '', 0.5, s(T['exit']), -5, 0),
    ('e9_speedup', '', 0.6, s(T['wrap'] + 2), -12, 0),
]
MUSIC = [('e6_music', '', 12.0, s(T['rewind'][1]) - 0.05, -17, 0)]
BED = ('e12_fair', 'outdoor daytime fairground ambience, distant carousel organ hum and light breeze, no voices, no speech', 8.0)
run(T, CUES, MUSIC, BED, bed_db=-27, out_wav='ep12.wav', verify=[('e12_pop', T['pops'][0]), ('e9_thud', T['bGrab']), ('e8_boing', T['land']), ('e8_clang', T['gondola'])])
