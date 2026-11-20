# EP08 "Alarm Clock" audio via ElevenLabs Sound Effects API. API key TIDAK ada di sini: proxy sesi menyisipkannya ke header xi-api-key.
# Alur: cek kuota -> generate tiap cue (di-cache) -> mix sesuai timeline (melingkar untuk seamless loop) -> normalisasi -> verifikasi sinkron.
import json, os, subprocess, sys, urllib.request
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, 'vendor'))
from dsp import SR, ns, place, pan, write_wav, integrated, true_peak, dbg
API = 'https://api.elevenlabs.io'
CACHE = os.path.join(HERE, 'el_cache'); os.makedirs(CACHE, exist_ok=True)
T = json.load(open(os.path.join(HERE, '..', 'src', 'ep08-timeline.json'))); FPS = T['fps']; DUR = T['frames'] / FPS
s = lambda fr: fr / FPS

# (nama, prompt, durasi_detik, waktu_KEJADIAN, gain_dB, pan) — puncak bunyi disejajarkan ke waktu kejadian.
P_BONK = ('e8_bonk', 'cartoon alarm clock bonking a head, hollow bonk with tiny bell jingle', 0.4)
P_BOING = ('e8_boing', 'cartoon object bouncing off a wall, springy boing', 0.4)
P_CLANG = ('e8_clang', 'small metal lamp shade hit, clang and swing', 0.4)
P_CLATTER = ('e8_clatter', 'alarm clock landing on wooden nightstand, clatter', 0.4)
P_SNORE = ('e8_snore', 'big cartoon character snoring deeply, one snore, no words', 1.2)
P_WHOOSH = ('e8_whoosh', 'fast throw whoosh', 0.3)
CUES = [
 P_WHOOSH + (s(T['swat'][1]) - 0.05, -7, -0.3), P_BOING + (s(T['wall1']), -3, -0.8), P_BONK + (s(T['bonk1']), 0, 0), P_CLATTER + (s(T['land1']), -4, -0.6),
 ('e8_creak', 'bed springs creaking as someone sits up angrily', 0.5, s(T['sitUp'][0]) + 0.1, -8, 0),
 P_WHOOSH + (s(T['grab2'][1]) + 0.05, -6, -0.3), P_BOING + (s(T['wall2']), -3, -0.8), P_CLANG + (s(T['lamp1']), -4, -0.3), P_BONK + (s(T['bonk2']), 0, 0),
 ('e8_rustle', 'blanket and pillow rustling quickly', 0.6, s(T['stuff'][0]) + 0.15, -9, 0),
 ('e8_buzz', 'alarm clock ringing muffled under a thick blanket, vibrating buzz', 1.0, s(T['vibrate'][0]) + 0.05, -5, 0),
 ('e8_buzz', 'alarm clock ringing muffled under a thick blanket, vibrating buzz', 1.0, s(T['vibrate'][0]) + 0.85, -5, 0),
 ('e8_creak', 'bed springs creaking as someone sits up angrily', 0.5, s(T['sitUp2'][0]), -8, 0),
 P_WHOOSH + (s(T['throwWin'][0]) + 0.05, -5, 0.4),
 ('e8_far', 'distant tiny crash far outside, then silence', 0.5, s(T['twinkle']) - 0.1, -12, 0.6),
 ('e8_twinkle', 'tiny twinkle ding', 0.3, s(T['twinkle']), -9, 0.6),
 P_SNORE + (s(T['lieDown'][1]) + 0.2, -9, 0), P_SNORE + (s(T['lieDown'][1]) + 1.4, -9, 0),
 ('e8_roll', 'small round cartoon character rolling quickly on wooden floor, cheerful', 0.6, s(T['dotIn'][0]) + 0.1, -8, -0.5),
 P_CLATTER + (s(T['place'][1]), -6, -0.6),
 ('e8_wake', 'cartoon eyes popping open, quick boing sting', 0.3, s(T['wake'][0]) + 0.05, -6, 0),
 ('e8_punch', 'cartoon punch hitting a small metal object, thwack', 0.3, s(T['punch']), -1, -0.5),
 P_BOING + (s(T['pbWall']), -3, -0.8), P_CLANG + (s(T['pbLamp']), -4, -0.3),
 ('e8_glass', 'small object knocking against a window glass, thunk', 0.3, s(T['pbWin']), -4, 0.4),
 P_BONK + (s(T['bonk3']), 0, 0), P_CLATTER + (s(T['land3']), -4, -0.6),
 ('e8_click', 'single snooze button click on an alarm clock', 0.3, s(T['snooze'][1]), -3, -0.6),
 ('e8_yay', 'tiny happy xylophone flourish, instrumental', 0.6, s(T['snooze'][1]) + 0.25, -10, -0.3),
 ('e8_cricket', 'single cricket chirp in a quiet room', 0.6, s(T['stare'][0]) + 0.1, -13, 0.4),
 P_SNORE + (s(T['sleep'][1]) + 0.1, -9, 0),
]
MUSIC = [('e8_music', 'gentle sleepy morning cartoon music, celesta, pizzicato strings and soft bassoon, instrumental, no vocals', 11.0, s(T['cutWide']) - 0.3, -18, 0)]
BED = ('e8_room', 'quiet bedroom morning ambience, soft distant birds, no voices', 8.0)
RING = ('e8_ring', 'loud classic twin bell alarm clock ringing continuously', 3.0)
# dering: [mulai, selesai] dalam frame (yang pertama melingkar melewati titik loop)
RINGS = [[T['ringStartCU'] - T['frames'], T['stuff'][0]], [T['sitUp2'][0], T['throwWin'][1]], [T['ring3'], T['snooze'][1]]]

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
    need = sum(c[2] for c in {c[0]: c for c in todo + [BED + (0, 0, 0), RING + (0, 0, 0)]}.values() if not os.path.exists(os.path.join(CACHE, c[0] + '.mp3')))
    print('total detik yang akan digenerate:', round(need, 1))
    N = ns(DUR); out = np.zeros((2, 2 * N)); placed = {}
    # hujan: dua salinan bed bersilang-pudar 1,5 dtk, dililit melingkar sepanjang loop
    rb = gen(*BED); rb = rb[:ns(BED[2])]; xf = ns(1.5); rb[:xf] *= np.linspace(0, 1, xf); rb[-xf:] *= np.linspace(1, 0, xf)
    step = (len(rb) - xf) / SR; t = 0.0
    while t < DUR: place(out, pan(rb, 0), t, dbg(-16)); t += step
    rg = gen(*RING)[:ns(RING[2])]; xr = ns(0.15)
    for a, b in RINGS:
        t0, t1 = s(a), s(b); t = t0
        while t < t1:
            seg = rg[:min(len(rg), ns(t1 - t) + xr)].copy(); n = len(seg)
            if t > t0: seg[:xr] *= np.linspace(0, 1, xr)
            seg[-min(xr, n):] *= np.linspace(1, 0, min(xr, n))
            place(out, pan(seg, -0.6), t if t >= 0 else t + DUR, dbg(-6)); t += (len(rg) - xr) / SR
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
    write_wav(os.path.join(HERE, '..', 'public', 'ep08.wav'), out, bits=16)
    print('LUFS:', round(integrated(out), 2), 'true peak:', round(true_peak(out), 2))
    # verifikasi sinkron benturan/jepret utama: onset & puncak vs frame kejadian
    for name, ev in [('e8_bonk', 'bonk1'), ('e8_bonk', 'bonk2'), ('e8_bonk', 'bonk3'), ('e8_punch', 'punch'), ('e8_click', 'snooze')]:
        fr = T[ev] if ev != 'snooze' else T['snooze'][1]
        at, x = min((p for p in placed[name]), key=lambda p: abs(p[0] - s(fr)))
        pk = int(np.argmax(np.abs(x[:ns(0.4)])))
        print(f'sinkron {ev}: serangan {round((at + onset(x) / SR - fr / FPS) * 1000, 1)} ms, puncak maks {round((at + pk / SR - fr / FPS) * 1000, 1)} ms')
    print('ok, sisa kredit:', quota()[0])
