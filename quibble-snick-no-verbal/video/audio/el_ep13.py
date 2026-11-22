# EP13 "Parking Spot" audio. Jalankan: python3 el_ep13.py quota | dry | mix  (key disisipkan proxy, tidak ada di repo)
import json, os
from el_lib import run
T = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'ep13-timeline.json')))
s = lambda fr: fr / T['fps']
HORN = ('e13_horn', 'small cartoon toy car horn honk, two quick beeps, bright, isolated', 0.6)
CUES = [
    ('e13_light', 'traffic light electronic beep tone, short, single, clean', 0.5, s(T['green']), -6, 0),
    ('e2_screech', '', 0.8, s(T['launch']), -8, 0),
    ('e8_whoosh', '', 0.5, s(T['launch'] + 2), -8, 0),
    ('e6_twinkle', '', 0.6, s(T['spot']), -9, 0),
    ('e1_sting', '', 0.8, s(T['glare'][0]), -12, 0),
    ('e5_grab', '', 0.4, s(T['coneGrab']), -9, 0.3),
    ('e7_toss', '', 0.5, s(T['coneToss']), -8, 0.2),
    ('e8_bonk', '', 0.4, s(T['coneHit']), -3, -0.3),
    ('e9_dizzy', '', 0.8, s(T['coneHit'] + 4), -12, -0.3),
    ('e5_snicker', '', 0.8, s(T['coneHit'] + 4), -10, 0.3),
    HORN + (s(T['honk']), -4, -0.2),
    ('boing1', '', 0.6, s(T['honkHit']), -6, 0.3), ('e7_gasp', '', 0.4, s(T['honkHit'] + 1), -9, 0.3),
    ('e13_turbo', 'cartoon rocket turbo boost ignition burst then roaring jet whoosh, short', 1.2, s(T['turbo']), -6, 0.3),
    ('e5_snicker', '', 0.8, s(T['laugh'][0]), -9, 0.3),
    ('e7_whimper', '', 0.8, s(T['worry'][0]), -11, -0.3),
    ('e9_grr', '', 0.6, s(T['determined'][0]), -11, -0.3),
    ('e8_whoosh', '', 0.5, s(T['merge'][0] + 4), -9, 0),
    ('e2_screech', '', 0.8, s(T['sArrive'] - 10), -10, 0.3),
    ('e8_boing', '', 0.6, s(T['bump']), -4, -0.2), ('e12_slideup', '', 1.0, s(T['bump'] + 1), -8, 0),
    ('e9_thud', '', 0.5, s(T['land']), -3, 0), ('e8_bonk', '', 0.4, s(T['bonk']), -6, 0.2),
    ('e7_toss', '', 0.5, s(T['coneFly'][0] + 1), -10, 0.1), ('hat_land', '', 0.5, s(T['coneFly'][1]), -7, 0.3),
    ('e7_ding', '', 0.6, s(T['ding']), -8, 0),
    ('e7_gasp', '', 0.4, s(T['jaw'][0]), -9, 0.3),
    ('e1_steam', '', 0.8, s(T['fume'][0]), -10, 0.3),
    ('e13_meep', 'tiny weak squeaky toy horn meep, single short, funny', 0.5, s(T['sHonk']), -6, 0.3),
    ('e9_speedup', '', 0.6, s(T['leave'][0]), -9, 0.4),
    ('e2_stretch', '', 0.8, s(T['relax'][0]), -10, 0),
    ('e9_click', '', 0.3, s(T['brake']), -6, -0.2),
    ('e13_light', '', 0.5, s(T['frames'] - 1), -10, 0),
]
LOOPS = [('e13_engine', 'small go-kart engine revving and running steadily, cartoon, no voices', 2.0, [[-6, T['launch']], [T['launch'], T['merge'][1]]], -14, 0)]
MUSIC = [('e9_music', '', 12.0, s(T['launch']) - 0.05, -17, 0)]
BED = ('e13_city', 'quiet night city street ambience, distant traffic hum, light breeze, no voices, no speech', 8.0)
run(T, CUES, MUSIC, BED, bed_db=-27, loops=LOOPS, out_wav='ep13.wav', verify=[('e8_bonk', T['coneHit']), ('e9_thud', T['land']), ('e8_boing', T['bump']), ('e13_horn', T['honk'])])
