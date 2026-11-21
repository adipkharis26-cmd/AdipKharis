# EP11 "Snowman" audio. Jalankan: python3 el_ep11.py quota | dry | mix  (key disisipkan proxy, tidak ada di repo)
import json, os
from el_lib import run
T = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'ep11-timeline.json')))
s = lambda fr: fr / T['fps']
SHOCK = T['frames'] + T['shockRf']
CRUNCH = ('e11_crunch', 'single crisp crunchy carrot bite, close up, dry, isolated', 0.6)
HOP = ('e2_hop', '', 0.4)
CUES = [
    ('e11_shock', 'comedic cartoon shock sting, sudden orchestra stab with cymbal hit and boing, instrumental', 1.5, s(SHOCK), 0, 0),
    ('e9_gasp', '', 0.4, s(SHOCK), -9, 0),
    ('e7_jab', '', 0.4, s(T['qPoint']), -6, 0.2),
    ('e4_roll', '', 0.6, s(T['dotIn'][0]), -12, -0.4),
    ('e2_pop', '', 0.4, s(T['dotIn'][1]), -10, -0.3),
    ('e7_tap', '', 0.3, s(T['dotPoint']), -10, -0.3),
    ('e7_whimper', '', 0.8, s(T['snickSweat']), -10, 0.4),
    ('e1_steam', '', 0.8, s(T['steam']), -12, 0),
    ('e9_idea', '', 0.6, s(T['idea']), -6, 0.4),
    ('e8_whoosh', '', 0.5, s(T['cutTop']), -9, 0),
    ('e6_twinkle', '', 0.6, s(T['snickPoint']), -8, -0.2),
    ('tease_ding', '', 0.6, s(T['qLookDot']), -9, 0.3),
    ('e1_whistle', '', 1.2, s(T['whistle'][0]), -9, 0.4),
    ('e11_lens', 'quick magnifying glass zoom in swoosh, playful detective cartoon whoosh', 1.0, s(T['cutPov']), -6, 0),
    ('e8_rustle', '', 0.6, s(T['rustle']), -4, -0.3),
    ('pop_out', '', 0.4, s(T['bunnyPop']) - 0.027, -2, -0.3),
    *[CRUNCH + (s(c) - 0.032, -3 - 2 * i, -0.3) for i, c in enumerate(T['chomp'])],
    ('e1_reveal', '', 0.8, s(T['dotRise']), -6, 0),
    ('e5_sad', '', 1.0, s(T['qSorry']), -10, 0),
    ('smug_ting', '', 0.6, s(T['reveal']), -6, 0.3),
    ('e2_lick', '', 0.5, s(T['lick']), -4, 0.3),
    ('big_jump', '', 0.5, s(T['jump'][0]), -9, 0.3),
    ('e11_poke', 'popsicle stick pushed firmly into packed snow, short soft crunchy thunk', 0.6, s(T['poke']) - 0.038, 0, 0.1),
    ('tada', '', 1.0, s(T['cheer']), -8, 0),
    ('e9_land', '', 0.5, s(T['snickLand']), -9, 0.3),
    ('tiny_steps', '', 0.8, s(T['exit'][0]), -12, 0),
    ('e11_night', 'soft magical chime glissando descending, day turning into night, gentle twinkle', 2.0, s(T['night'][0]), -8, 0),
    HOP + (s(T['bunnyIn'][0]), -11, -0.3), HOP + (s(T['bunnyIn'][0] + 5), -12, 0),
    CRUNCH + (s(T['bite']) - 0.032, -2, 0.1),
    HOP + (s(T['bunnyOut'][0] + 2), -11, 0), HOP + (s(T['bunnyOut'][0] + 7), -12, -0.3),
    ('e11_dawn', 'bright sunrise shimmer, cheerful rising chime with a few morning bird chirps', 2.0, s(T['dawn'][0] + 2), -10, 0),
]
LOOPS = [('e11_steps', 'footsteps crunching in fresh snow, slow sneaky cartoon pace', 2.0, [[T['snickWalk'][0], T['snickWalk'][1]]], -12, 0)]
MUSIC = [('e11_music', 'playful sneaky pizzicato detective mystery cartoon music, light and bouncy, instrumental, no vocals', 11.0, s(T['cutWide']) - 0.1, -18, 0)]
BED = ('e11_wind', 'gentle winter wind outdoors, soft breeze, quiet snowy ambience, no voices', 8.0)
run(T, CUES, MUSIC, BED, bed_db=-24, loops=LOOPS, out_wav='ep11.wav', verify=[('pop_out', T['bunnyPop']), ('e11_poke', T['poke']), ('e11_crunch', T['bite']), ('e11_shock', SHOCK)])
