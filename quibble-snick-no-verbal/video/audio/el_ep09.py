# EP09 "Escalator" audio via ElevenLabs Sound Effects API. API key TIDAK ada di sini: proxy sesi menyisipkannya ke header xi-api-key.
# Alur: cek kuota -> generate tiap cue (di-cache) -> mix sesuai timeline (melingkar untuk seamless loop) -> normalisasi -> verifikasi sinkron.
import json, os, subprocess, sys, urllib.request
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, 'vendor'))
from dsp import SR, ns, place, pan, write_wav, integrated, true_peak, dbg
API = 'https://api.elevenlabs.io'
CACHE = os.path.join(HERE, 'el_cache'); os.makedirs(CACHE, exist_ok=True)
T = json.load(open(os.path.join(HERE, '..', 'src', 'ep09-timeline.json'))); FPS = T['fps']; DUR = T['frames'] / FPS
s = lambda fr: fr / FPS

# (nama, prompt, durasi_detik, waktu_KEJADIAN, gain_dB, pan) — puncak bunyi disejajarkan ke waktu kejadian.
P_STEPS = ('e9_steps', 'fast cartoon footsteps running on metal escalator steps, rapid pitter patter', 1.5)
P_THUD = ('e9_thud', 'cartoon body landing hard on tile floor, thud with squeak', 0.4)
CUES = [
 P_STEPS + (s(1), -9, -0.2), P_STEPS + (s(T['faster'][0]) + 0.05, -7, 0),
 ('e9_click', 'single plastic button click', 0.3, s(T['press1']), -4, 0.5),
 ('e9_speedup', 'machine motor revving up quickly, rising whine', 0.6, s(T['press1']) + 0.1, -6, 0.2),
 ('e9_tumble', 'cartoon character tumbling down stairs, bumpy bonks and slide whistle down', 0.8, s(T['swept'][0]) + 0.1, -5, 0),
 P_THUD + (s(T['land1']), -1, -0.5),
 ('e9_dizzy', 'cartoon dizzy birds tweeting circle, short, no voice', 0.6, s(T['dizzy'][0]) + 0.1, -11, -0.5),
 ('e9_stretch', 'rubber stretch squeak, being dragged', 0.5, s(T['grab'][0]) + 0.1, -8, -0.5),
 ('e9_spin', 'cartoon spinning around whoosh, wobbly', 0.6, s(T['drag'][0]) + 0.2, -6, -0.6),
 P_THUD + (s(T['bonk2']), -1, -0.5),
 ('e9_idea', 'cartoon idea ding, bright little bell', 0.3, s(T['notice'][0]) + 0.1, -8, -0.5),
 ('e9_click', 'single plastic button click', 0.3, s(T['press2']), -4, -0.6),
 ('e9_reverse', 'escalator machinery stopping with a clunk then starting in reverse, mechanical whir', 0.8, s(T['stop'][0]) + 0.1, -6, 0),
 ('e9_chill', 'smug relaxed cartoon whistle tune, short, instrumental, no voice', 1.2, s(T['ride'][0]) + 0.2, -11, 0),
 ('e9_gasp', 'cartoon shock sting, short orchestral hit', 0.4, s(T['snickSee'][0]), -8, 0.4),
 ('e9_jab', 'frantic repeated button clicking', 0.8, s(T['jab'][0]) + 0.05, -6, 0.5),
 ('e9_spark', 'electrical short circuit, sparks crackle and pop', 0.6, s(T['spark']), -3, 0.5),
 ('e9_launch', 'cartoon launch whoosh with rising slide whistle', 0.5, s(T['launch']) - 0.05, -4, 0.2),
 ('e9_kick', 'cartoon boot bonk, comedic thwack', 0.3, s(T['kick']), 0, 0.4),
 ('e9_land', 'cartoon character landing perfectly, light thump and tada sparkle', 0.5, s(T['landQ']), -3, 0.5),
 ('e9_slide', 'cartoon sliding down a metal ramp fast with bumps, descending whistle', 1.2, s(T['snickSlide'][0]) + 0.1, -6, 0),
 P_THUD + (s(T['landS']), -1, -0.6),
 ('e9_yum', 'happy cartoon ice cream lick, cheerful xylophone jingle, instrumental', 0.8, s(T['hand'][1]) + 0.1, -9, 0.5),
 ('e9_grr', 'angry cartoon kazoo grumble, no voice', 0.6, s(T['snickDizzy'][1]) + 0.1, -9, -0.6),
 P_STEPS + (s(T['snickRun'][0]) + 0.05, -8, -0.3),
]
MUSIC = [('e9_music', 'upbeat bouncy cartoon chase music, pizzicato strings, xylophone and tuba, instrumental, no vocals', 12.0, s(T['cutWide']) - 0.2, -17, 0)]
BED = ('e9_mall', 'shopping mall ambience with escalator hum, soft distant crowd murmur without words', 8.0)

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
    while t < DUR: place(out, pan(rb, 0), t, dbg(-16)); t += step
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
    write_wav(os.path.join(HERE, '..', 'public', 'ep09.wav'), out, bits=16)
    print('LUFS:', round(integrated(out), 2), 'true peak:', round(true_peak(out), 2))
    # verifikasi sinkron benturan/jepret utama: onset & puncak vs frame kejadian
    for name, ev in [('e9_thud', 'land1'), ('e9_thud', 'bonk2'), ('e9_kick', 'kick'), ('e9_land', 'landQ'), ('e9_thud', 'landS'), ('e9_spark', 'spark')]:
        fr = T[ev]
        at, x = min((p for p in placed[name]), key=lambda p: abs(p[0] - s(fr)))
        pk = int(np.argmax(np.abs(x[:ns(0.4)])))
        print(f'sinkron {ev}: serangan {round((at + onset(x) / SR - fr / FPS) * 1000, 1)} ms, puncak maks {round((at + pk / SR - fr / FPS) * 1000, 1)} ms')
    print('ok, sisa kredit:', quota()[0])
