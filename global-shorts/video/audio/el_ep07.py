# EP07 "Elevator Button" audio via ElevenLabs Sound Effects API. API key TIDAK ada di sini: proxy sesi menyisipkannya ke header xi-api-key.
# Alur: cek kuota -> generate tiap cue (di-cache) -> mix sesuai timeline (melingkar untuk seamless loop) -> normalisasi -> verifikasi sinkron.
import json, os, subprocess, sys, urllib.request
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, 'vendor'))
from dsp import SR, ns, place, pan, write_wav, integrated, true_peak, dbg
API = 'https://api.elevenlabs.io'
CACHE = os.path.join(HERE, 'el_cache'); os.makedirs(CACHE, exist_ok=True)
T = json.load(open(os.path.join(HERE, '..', 'src', 'ep07-timeline.json'))); FPS = T['fps']; DUR = T['frames'] / FPS
s = lambda fr: fr / FPS

# (nama, prompt, durasi_detik, waktu_KEJADIAN, gain_dB, pan) — puncak bunyi disejajarkan ke waktu kejadian.
# Bunyi berulang (ding, pintu, motor) di-generate sekali lalu dipasang di tiap kejadian.
P_DING = ('e7_ding', 'single elevator arrival chime ding', 0.6)
P_OPEN = ('e7_dooropen', 'elevator door sliding open, smooth mechanical whoosh', 0.6)
P_CLOSE = ('e7_doorclose', 'elevator door sliding closed with soft thunk', 0.6)
P_MOTOR = ('e7_motor', 'elevator cabin moving up, low motor hum and cable whir', 0.6)
CUES = []
for d in T['ding']: CUES.append(P_DING + (s(d), -4, 0))
for a, b in T['open']: CUES.append(P_OPEN + (s(a) + 0.05, -9, -0.4))
for i, (a, b) in enumerate(T['close']):
    if i != 2: CUES.append(P_CLOSE + (s(b) - 0.1, -9, -0.4))
for a, b in T['travel']: CUES.append(P_MOTOR + (s(a) + 0.1, -12, 0))
CUES += [
 ('e7_tap', 'nervous cartoon foot tapping and squirming squeaks, no voice', 0.8, s(2), -11, 0),
 ('e7_buttons', 'rapid clicking of many elevator buttons, fast click click click', 0.8, s(T['press'][0]) - 0.35, -5, -0.4),
 ('e7_gasp', 'cartoon shock sting, short orchestra hit with slide whistle up, no voice', 0.5, s(T['horror'][0]), -7, 0),
 ('e7_jab', 'frantic repeated pressing of one button, click click click', 0.6, s(T['jab'][0]) + 0.05, -6, -0.3),
 ('e7_lift', 'cartoon lifting someone up, stretchy rubber squeak and whoosh', 0.5, s(T['grab'][0]) + 0.25, -7, 0),
 ('e7_toss', 'cartoon throw whoosh', 0.4, s(T['toss'][0]) + 0.15, -6, -0.3),
 ('e7_land', 'small cartoon character landing on floor, soft thud', 0.3, s(T['toss'][1]), -6, -0.5),
 ('e7_slam', 'elevator door slamming shut hard, metallic bang', 0.4, s(T['slam1']), -1, -0.4),
 ('e7_cheer', 'short happy relieved cartoon jingle on xylophone, instrumental', 0.9, s(T['cheer'][0]) + 0.1, -9, 0),
 ('e7_pant', 'small cartoon creature panting quickly after running, huffing breaths, no words', 0.8, s(T['snickPant'][0]) + 0.2, -9, -0.5),
 ('e7_sparkle', 'magical sparkle twinkle', 0.5, s(T['sparkle'][0]), -9, 0),
 ('e7_zip', 'fast cartoon zip run whoosh', 0.4, s(T['snickGo'][0]) + 0.05, -6, -0.5),
 ('e7_wcdoor', 'bathroom door slammed shut and lock clicks', 0.5, s(T['slam2']), -1, -0.5),
 ('e7_deflate', 'sad deflating cartoon slide whistle going down', 0.8, s(T['slam2']) + 0.2, -7, 0),
 ('e7_shrug', 'tiny cartoon shrug boing', 0.3, s(T['shrug'][0]), -9, 0.3),
 ('e7_whimper', 'sad little kazoo whimper, no voice', 0.8, s(T['whimper'][0]) + 0.2, -10, 0),
 ('e7_tap', 'nervous cartoon foot tapping and squirming squeaks, no voice', 0.8, s(T['desperate'][0]) + 0.1, -11, 0),
]
MUSIC = []
BED = ('e7_muzak', 'cheesy relaxed elevator muzak, soft bossa nova with electric piano and brushed drums, instrumental, no vocals', 10.0)

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
    need = sum(c[2] for c in {c[0]: c for c in todo + [BED + (0, 0, 0)]}.values() if not os.path.exists(os.path.join(CACHE, c[0] + '.mp3')))
    print('total detik yang akan digenerate:', round(need, 1))
    N = ns(DUR); out = np.zeros((2, 2 * N)); placed = {}
    # hujan: dua salinan bed bersilang-pudar 1,5 dtk, dililit melingkar sepanjang loop
    rb = gen(*BED); rb = rb[:ns(BED[2])]; xf = ns(1.5); rb[:xf] *= np.linspace(0, 1, xf); rb[-xf:] *= np.linspace(1, 0, xf)
    step = (len(rb) - xf) / SR; t = 0.0
    while t < DUR: place(out, pan(rb, 0), t, dbg(-12)); t += step
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
        place(out, pan(x, p), at, dbg(gdb)); placed.setdefault(name, []).append((at, x))
    out = out[:, :N] + out[:, N:]  # lipat: ekor setelah titik loop masuk ke awal
    for _ in range(3):
        out *= dbg(-13.5 - integrated(out)); thr = 0.6; a = np.abs(out)
        out = np.where(a > thr, np.sign(out) * (thr + (1 - thr) * np.tanh((a - thr) / (1 - thr))), out)
    tp = true_peak(out)
    if tp > -1: out *= dbg(-1 - tp)
    write_wav(os.path.join(HERE, '..', 'public', 'ep07.wav'), out, bits=16)
    print('LUFS:', round(integrated(out), 2), 'true peak:', round(true_peak(out), 2))
    # verifikasi sinkron benturan/jepret utama: onset & puncak vs frame kejadian
    for name, ev in [('e7_slam', 'slam1'), ('e7_wcdoor', 'slam2')] + [('e7_ding', 'ding')]:
        fr = T[ev] if ev != 'ding' else T['ding'][0]
        at, x = min((p for p in placed[name]), key=lambda p: abs(p[0] - s(fr)))
        pk = int(np.argmax(np.abs(x[:ns(0.4)])))
        print(f'sinkron {ev}: serangan {round((at + onset(x) / SR - fr / FPS) * 1000, 1)} ms, puncak maks {round((at + pk / SR - fr / FPS) * 1000, 1)} ms')
    print('ok, sisa kredit:', quota()[0])
