# EP05 "Umbrella War" audio via ElevenLabs Sound Effects API. API key TIDAK ada di sini: proxy sesi menyisipkannya ke header xi-api-key.
# Alur: cek kuota -> generate tiap cue (di-cache) -> mix sesuai timeline (melingkar untuk seamless loop) -> normalisasi -> verifikasi sinkron.
import json, os, subprocess, sys, urllib.request
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, 'vendor'))
from dsp import SR, ns, place, pan, write_wav, integrated, true_peak, dbg
API = 'https://api.elevenlabs.io'
CACHE = os.path.join(HERE, 'el_cache'); os.makedirs(CACHE, exist_ok=True)
T = json.load(open(os.path.join(HERE, '..', 'src', 'ep05-timeline.json'))); FPS = T['fps']; DUR = T['frames'] / FPS
s = lambda fr: fr / FPS

# (nama, prompt, durasi_detik, waktu_KEJADIAN, gain_dB, pan) — puncak bunyi disejajarkan ke waktu kejadian
CUES = [
 ('e5_drips', 'water droplets dripping off a soaked small cartoon character, plips', 0.8, s(2), -12, 0),
 ('e5_dash', 'quick small cartoon footsteps splashing through shallow puddles', 0.6, s(T['dashIn'][0]) + 0.05, -8, -0.3),
 ('e5_patter', 'heavy rain drumming on an open umbrella canopy', 1.5, s(T['dashIn'][1]), -12, 0),
 ('e5_shake', 'cartoon dog shaking off water, wet flapping spray', 0.7, s(T['shakeOff'][0]) + 0.05, -5, -0.1),
 ('e5_grumble', 'low grumpy bassoon note, cartoon annoyance, no voice', 0.6, s(46), -10, 0.2),
 ('e5_tilt', 'umbrella swish and nylon creak', 0.4, s(T['tiltAway'][0]) + 0.1, -7, 0.2),
 ('e5_tug', 'cartoon tug of war, rubbery stretching squeaks and struggle, no voice', 1.5, s(T['tug'][0]) + 0.1, -7, 0),
 ('e5_lift', 'quick upward whoosh with rising slide whistle', 0.5, s(T['lift'][0]) + 0.1, -6, 0),
 ('e5_fall', 'cartoon falling slide whistle going down', 0.5, s(T['letGo']) + 0.05, -6, -0.2),
 ('e5_plop', 'cartoon body landing hard in a deep water puddle, big splash', 0.5, s(T['plop']), 0, -0.2),
 ('e5_tinyopen', 'tiny cocktail umbrella popping open, cute pop and sparkle chime', 0.4, s(T['tinyOpen']), -5, -0.2),
 ('e5_dropfall', 'descending whistle of something falling from the sky', 0.5, s(T['bigDrop']) - 0.25, -9, -0.2),
 ('e5_bigdrop', 'huge water drop smashing down, heavy wet splat', 0.4, s(T['bigDrop']), 0, -0.2),
 ('e5_throw', 'small dart throw whoosh', 0.3, s(T['throw'][0]) + 0.1, -7, 0),
 ('e5_pierce', 'sharp fabric puncture pop', 0.3, s(T['dart']), -2, 0.1),
 ('e5_stream', 'thin stream of water pouring onto a hard surface', 1.1, s(T['leak'][0]) + 0.1, -8, 0.2),
 ('e5_snicker', 'mischievous cartoon snicker played on a muted trumpet, no voice', 0.8, s(236), -9, -0.2),
 ('e5_wind', 'strong sudden gust of wind', 0.8, s(T['gust'][0]) + 0.2, -6, -0.3),
 ('e5_flip', 'umbrella flipping inside out in the wind, loud nylon fwump pop', 0.4, s(T['flip']), -1, 0.1),
 ('e5_fill', 'rain water collecting and trickling into a bowl', 1.0, s(T['fill'][0]) + 0.4, -12, 0.1),
 ('e5_grab', 'quick snatch swipe', 0.3, s(T['grab'][0]) + 0.15, -6, 0),
 ('e5_triumph', 'short triumphant cartoon fanfare on toy trumpet, instrumental', 1.0, s(T['carry'][0]) + 0.1, -10, 0),
 ('e5_turn', 'quick flipping whoosh', 0.3, s(T['turn'][0]) + 0.15, -7, 0),
 ('e5_dump', 'whole bucket of water dumped on someone, huge splash', 0.6, s(T['dump']), 0, -0.1),
 ('e5_boing', 'happy bouncy cartoon hops, light boings', 0.7, s(T['dotIn'][0]) + 0.1, -9, 0.4),
 ('e5_squeeze', 'rubbery cartoon squeeze squeak', 0.3, s(T['duck'][0]) + 0.05, -8, 0.3),
 ('e5_clatter', 'umbrella falling onto wet pavement, plastic clatter', 0.4, s(T['hatFall'][1]), -5, -0.2),
 ('e5_sad', 'sad trombone wah wah, short, instrumental', 1.3, s(T['hatFall'][1]) + 0.15, -9, 0),
]
MUSIC = [('e5_music', 'sneaky playful cartoon comedy music, pizzicato strings, clarinet and woodblock, instrumental, no vocals', 10.0, s(T['cutWide']), -17, 0)]
BED = ('e5_rain', 'steady heavy rain on a city sidewalk, ambience, no thunder, no voices', 8.0)

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
        print(name, 'generated')
    wav = mp3[:-4] + '.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp3, '-ar', str(SR), '-ac', '1', '-f', 'f32le', wav], check=True)
    return np.fromfile(wav, dtype='<f4').astype(float)

def onset(x):
    head = np.abs(x[:ns(0.4)])
    return int(np.argmax(head >= 0.5 * head.max())) if head.size and head.max() > 0 else 0

if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'quota'
    left, d = quota(); print('sisa kredit:', left, 'tier:', d.get('tier'))
    if mode == 'quota': sys.exit()
    todo = CUES + MUSIC
    need = sum(c[2] for c in todo + [BED + (0, 0, 0)] if not os.path.exists(os.path.join(CACHE, c[0] + '.mp3')))
    print('total detik yang akan digenerate:', round(need, 1))
    N = ns(DUR); out = np.zeros((2, 2 * N)); placed = {}
    # hujan: dua salinan bed bersilang-pudar 1,5 dtk, dililit melingkar sepanjang loop
    rb = gen(*BED); rb = rb[:ns(BED[2])]; xf = ns(1.5); rb[:xf] *= np.linspace(0, 1, xf); rb[-xf:] *= np.linspace(1, 0, xf)
    step = (len(rb) - xf) / SR; t = 0.0
    while t < DUR: place(out, pan(rb, 0), t, dbg(-14)); t += step
    for name, prompt, dur, at, gdb, p in todo:
        x = gen(name, prompt, dur)
        if not name.endswith('music'):
            nz = np.where(np.abs(x) > 0.02)[0]
            if len(nz): x = x[max(0, min(nz[0] - ns(0.005), ns(0.3))):]
            x = x[:ns(dur + 0.4)]
            at = at - onset(x) / SR  # puncak = frame kejadian
        else:
            x = x[:ns(dur)]
        fade = min(len(x), ns(0.25)); x[-fade:] *= np.linspace(1, 0, fade)
        if at < 0: at += DUR  # melingkar
        place(out, pan(x, p), at, dbg(gdb)); placed[name] = (at, x)
    out = out[:, :N] + out[:, N:]  # lipat: ekor setelah titik loop masuk ke awal
    for _ in range(3):
        out *= dbg(-13.5 - integrated(out)); thr = 0.6; a = np.abs(out)
        out = np.where(a > thr, np.sign(out) * (thr + (1 - thr) * np.tanh((a - thr) / (1 - thr))), out)
    tp = true_peak(out)
    if tp > -1: out *= dbg(-1 - tp)
    write_wav(os.path.join(HERE, '..', 'public', 'ep05.wav'), out, bits=16)
    print('LUFS:', round(integrated(out), 2), 'true peak:', round(true_peak(out), 2))
    # verifikasi sinkron benturan utama: onset (50% puncak awal) vs frame kejadian
    for name, ev in [('e5_plop', 'plop'), ('e5_bigdrop', 'bigDrop'), ('e5_pierce', 'dart'), ('e5_flip', 'flip'), ('e5_dump', 'dump'), ('e5_clatter', None)]:
        at, x = placed[name]; fr = T[ev] if ev else T['hatFall'][1]
        pk = int(np.argmax(np.abs(x[:ns(0.4)])))
        print(f'sinkron {name}: serangan {round((at + onset(x) / SR - fr / FPS) * 1000, 1)} ms, puncak maks {round((at + pk / SR - fr / FPS) * 1000, 1)} ms')
    print('ok, sisa kredit:', quota()[0])
