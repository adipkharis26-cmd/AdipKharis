# EP02 audio via ElevenLabs Sound Effects API. API key TIDAK ada di sini: proxy sesi menyisipkannya ke header xi-api-key.
# Alur: cek kuota -> generate tiap cue (di-cache) -> mix sesuai timeline -> normalisasi loudness.
import json, os, subprocess, sys, urllib.request
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, 'vendor'))
from dsp import SR, ns, place, pan, write_wav, integrated, true_peak, dbg
API = 'https://api.elevenlabs.io'
CACHE = os.path.join(HERE, 'el_cache'); os.makedirs(CACHE, exist_ok=True)
T = json.load(open(os.path.join(HERE, '..', 'src', 'ep02-timeline.json'))); FPS = T['fps']; DUR = T['frames'] / FPS
s = lambda fr: fr / FPS

# (nama, prompt, durasi_detik, waktu_mulai, gain_dB, pan)
CUES = [
 ('e2_screech', 'cartoon sudden freeze record scratch screech, comedic', 0.6, s(T['freeze']) - 0.02, -2, 0),
 ('e2_drip', 'slow thick paint drips plopping', 1.0, s(T['freeze']) + 0.25, -10, 0),
 ('e2_phew', 'cartoon relief, slow rising slide whistle as character stands up carefully', 0.9, s(T['rise'][0]), -9, 0),
 ('e2_wag', 'quick playful tick tock clicks, finger wagging nope nope, cartoon', 0.8, s(T['wag'][0]), -9, -0.2),
 ('e2_sit', 'cartoon character plopping down on soft grass, soft thump', 0.4, s(T['groundSit'][1]) - 0.1, -6, 0),
 ('e2_lick', 'cartoon licking ice cream, slurp, comedic, no voice', 1.0, s(T['lick'][0]), -8, 0),
 ('e2_wind', 'sudden gust of wind whoosh', 0.9, s(T['wind'][0]), -6, -0.3),
 ('e2_flip', 'cardboard sign flapping and flipping over in the wind', 0.5, s(T['flip']) - 0.1, -6, -0.4),
 ('e2_gulp', 'cartoon nervous gulp sound effect', 0.6, s(T['lookDown'][0]) + 0.3, -6, 0),
 ('e2_stretch', 'cartoon rubber stretching sticky goo, long squeaky stretch', 1.2, s(T['stretch'][0]), -4, 0),
 ('e2_snap', 'rubber band snapping back hard, cartoon slap', 0.5, s(T['snap'][0]), 0, 0),
 ('e2_fly', 'cartoon object spinning up through the air whistle', 0.8, s(T['iceFly'][0]) + 0.05, -8, 0.2),
 ('e2_steps', 'small cartoon creature quick footsteps on grass', 0.6, s(T['snickIn'][0]), -10, 0.4),
 ('e2_catch', 'cartoon catch pop', 0.3, s(T['catch']), -6, 0.2),
 ('e2_hop', 'small cartoon hop boing landing on a wooden bench', 0.4, s(T['benchHop'][0]), -7, 0.2),
 ('e2_slurp', 'cartoon smug ice cream slurp lick', 0.9, s(T['snickLick'][0]), -9, 0.2),
 ('e2_stuck', 'cartoon wet sticky suction squelch, stuck to bench', 0.6, s(T['snickStuck'][0]), -5, 0.2),
 ('e2_waddle', 'wooden bench dragging and bumping along grass, comedic waddle', 1.4, s(T['waddle'][0]), -9, 0.3),
 ('e2_pop', 'loud cartoon suction pop as character unsticks', 0.4, s(T['popFree']), -3, 0),
 ('e2_laugh', 'cartoon tuba laugh, comedic, no voice', 0.6, s(T['laugh'][0]), -9, -0.2),
 ('e2_snatch', 'quick cartoon snatch swipe', 0.3, s(T['snatch']), -6, 0.2),
 ('e2_angry', 'cartoon angry steam whistle', 0.8, s(T['snatch']) + 0.2, -10, 0.5),
 ('e2_walk', 'happy carefree cartoon footsteps on grass', 1.0, s(T['walk'][0]), -11, 0),
]
MUSIC = [('e2_music', 'sunny carefree park cartoon music, ukulele and whistling, bouncy, instrumental, no vocals', 4.4, s(T['cutWide']) + 0.1, -15, 0),
         ('e2_music2', 'sneaky playful cartoon music, pizzicato and bassoon, instrumental, no vocals', 6.0, s(T['snickIn'][0]), -16, 0),
         ('e2_music3', 'sunny carefree park cartoon music, ukulele and whistling, bouncy, instrumental, no vocals', 1.6, s(T['walk'][0]) + 0.2, -15, 0)]

def req(method, path, body=None):
    data = json.dumps(body).encode() if body else None
    r = urllib.request.Request(API + path, data=data, method=method, headers={'Content-Type': 'application/json', 'xi-api-key': 'proxy-injected'})
    return urllib.request.urlopen(r, timeout=120)

def quota():
    d = json.load(req('GET', '/v1/user/subscription'))
    return d['character_limit'] - d['character_count'], d

def gen(name, prompt, dur):
    mp3 = os.path.join(CACHE, name + '.mp3')
    if not os.path.exists(mp3):
        resp = req('POST', '/v1/sound-generation', {'text': prompt, 'duration_seconds': max(0.5, dur), 'prompt_influence': 0.5})
        open(mp3, 'wb').write(resp.read())
        print(name, 'cost header:', resp.headers.get('character-cost') or resp.headers.get('x-character-count'))
    wav = mp3[:-4] + '.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp3, '-ar', str(SR), '-ac', '1', '-f', 'f32le', wav], check=True)
    return np.fromfile(wav, dtype='<f4')

if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'quota'
    left, d = quota(); print('sisa kredit:', left, 'tier:', d.get('tier'))
    if mode == 'quota': sys.exit()
    todo = CUES + MUSIC
    need = sum(c[2] for c in todo if not os.path.exists(os.path.join(CACHE, c[0] + '.mp3')))
    print('total detik yang akan digenerate:', round(need, 1))
    if mode == 'one':  # 1 cue uji untuk mengukur biaya per detik
        gen(*CUES[0][:3]); print('sisa setelah 1 cue:', quota()[0]); sys.exit()
    N = ns(DUR); out = np.zeros((2, 2 * N))
    for name, prompt, dur, at, gdb, p in todo:
        x = gen(name, prompt, dur)
        if not name.startswith('music'):
            nz = np.where(np.abs(x) > 0.02)[0]
            if len(nz): x = x[max(0, min(nz[0] - ns(0.005), ns(0.3))):]  # buang hening di depan (maks 0,3 dtk)
            x = x[:ns(dur + 0.4)]
        else:
            x = x[:ns(dur)] if name == 'e2_music_X' else x[:ns(dur)]
        fade = min(len(x), ns(0.25)); x[-fade:] *= np.linspace(1, 0, fade)
        place(out, pan(x, p), at, dbg(gdb))
    out = out[:, :N] + out[:, N:]
    for _ in range(3):
        out *= dbg(-13.5 - integrated(out)); thr = 0.6; a = np.abs(out)
        out = np.where(a > thr, np.sign(out) * (thr + (1 - thr) * np.tanh((a - thr) / (1 - thr))), out)
    tp = true_peak(out)
    if tp > -1: out *= dbg(-1 - tp)
    write_wav(os.path.join(HERE, '..', 'public', 'ep02.wav'), out, bits=16); print('ok, sisa kredit:', quota()[0])
