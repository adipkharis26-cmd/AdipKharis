# EP06 "Selfie Fail" audio via ElevenLabs Sound Effects API. API key TIDAK ada di sini: proxy sesi menyisipkannya ke header xi-api-key.
# Alur: cek kuota -> generate tiap cue (di-cache) -> mix sesuai timeline (melingkar untuk seamless loop) -> normalisasi -> verifikasi sinkron.
import json, os, subprocess, sys, urllib.request
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, 'vendor'))
from dsp import SR, ns, place, pan, write_wav, integrated, true_peak, dbg
API = 'https://api.elevenlabs.io'
CACHE = os.path.join(HERE, 'el_cache'); os.makedirs(CACHE, exist_ok=True)
T = json.load(open(os.path.join(HERE, '..', 'src', 'ep06-timeline.json'))); FPS = T['fps']; DUR = T['frames'] / FPS
s = lambda fr: fr / FPS

# (nama, prompt, durasi_detik, waktu_KEJADIAN, gain_dB, pan) — puncak bunyi disejajarkan ke waktu kejadian.
# Bunyi berulang (tombol, tik timer, jepret) di-generate sekali lalu dipasang di tiap kejadian.
W = lambda fr: s(fr % T['frames'])
CDW = [[T['press7'] - T['frames'], T['flash1']], [T['press2'], T['flash2']], [T['press3'], T['flash3']], [T['press4'], T['flash4']], [T['press5'], T['flash5']], [T['press6'], T['flash6']]]
FL = [T['flash1'], T['flash2'], T['flash3'], T['flash4'], T['flash5'], T['flash6']]
P_TICK = ('e6_tick', 'single short electronic camera self-timer beep', 0.5)
P_BEEP = ('e6_button', 'small camera button click', 0.5)
P_SHUT = ('e6_shutter', 'instant camera shutter click with flash pop and whine', 0.6)
P_PRINT = ('e6_print', 'instant camera ejecting a photo, short motor whirr', 0.6)
CUES = []
for a, b in CDW:
    CUES.append(P_BEEP + (W(a), -6, -0.3))
    for k in (1, 2): CUES.append(P_TICK + (W(a + (b - a) * k / 3), -9, -0.3))
for fl in FL:
    CUES.append(P_SHUT + (W(fl), -2, -0.2))
    CUES.append(P_PRINT + (W(fl + 3), -12, -0.3))
CUES += [
 ('e6_strain', 'cartoon wobbling strain, comedic bassoon trill, no voice', 0.8, s(2), -11, 0),
 ('e6_topple', 'cartoon body toppling over onto grass, soft thud', 0.4, s(T['topple']), -1, 0),
 ('e6_run', 'quick cartoon running footsteps on grass', 0.5, s(T['run2'][0]) + 0.05, -10, -0.2),
 ('e6_run', 'quick cartoon running footsteps on grass', 0.5, s(T['back2'][0]) + 0.05, -10, 0),
 ('e6_zip', 'fast cartoon zip whoosh sliding into frame', 0.4, s(T['snickIn'][0]) + 0.1, -6, 0.4),
 ('e6_push', 'cartoon shove with spring boing', 0.4, s(T['push']), -2, 0.3),
 ('e6_spin', 'cartoon spinning away whistle', 0.5, s(T['push']) + 0.12, -9, 0.5),
 ('e6_roll', 'small round cartoon character rolling fast on grass, squeaky giggle-like toy squeak, no voice', 0.8, s(T['dotRoll'][0]) + 0.3, -8, 0),
 ('e6_facepalm', 'soft cartoon facepalm slap', 0.3, s(T['facepalm'][0]), -6, 0),
 ('e6_tiptoe', 'sneaky cartoon tiptoe pizzicato plucks', 0.8, s(T['sneak'][0]) + 0.1, -10, -0.4),
 ('e6_rage', 'cartoon angry steam whistle and kettle boil, no voice', 0.6, s(T['rage'][0]) + 0.05, -8, 0),
 ('e6_snatch', 'quick snatch swipe with small thud', 0.3, s(T['snatch']), -3, -0.2),
 ('e6_tiptoe', 'sneaky cartoon tiptoe pizzicato plucks', 0.8, s(T['climb'][0]) + 0.1, -10, -0.3),
 ('e6_leap', 'cartoon jump boing upward', 0.4, s(T['leap'][0]), -6, 0),
 ('e6_smack', 'cartoon face smacking into glass lens, loud bonk', 0.4, s(T['smack']), 0, 0.2),
 ('e6_fly', 'cartoon character launched into the sky, long whistle fading away', 0.6, s(T['fly'][0]) + 0.1, -7, 0.5),
 ('e6_twinkle', 'tiny twinkle ding star sparkle', 0.4, s(T['twinkle']), -8, 0.6),
 ('e6_laugh', 'cheerful cartoon chuckle played on clarinet, no voice', 0.8, s(T['smack']) + 0.4, -10, 0),
 ('e6_click', 'camera snapping onto tripod mount click', 0.3, s(T['setBack'][1]), -5, -0.3),
 ('e6_yay', 'short happy cartoon success jingle on xylophone, instrumental', 1.0, s(T['flash6']) + 0.15, -9, 0),
 ('e6_flip', 'cartoon flip whoosh', 0.3, s(T['flipUp'][0]) + 0.05, -7, 0),
]
MUSIC = [('e6_music', 'bouncy playful cartoon comedy music, ukulele, glockenspiel and pizzicato, instrumental, no vocals', 12.0, s(T['cutWide']) - 0.5, -17, 0)]
BED = ('e6_park', 'calm park ambience, light breeze, distant birds chirping, no voices', 8.0)

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
        place(out, pan(x, p), at, dbg(gdb)); placed.setdefault(name, []).append((at, x))
    out = out[:, :N] + out[:, N:]  # lipat: ekor setelah titik loop masuk ke awal
    for _ in range(3):
        out *= dbg(-13.5 - integrated(out)); thr = 0.6; a = np.abs(out)
        out = np.where(a > thr, np.sign(out) * (thr + (1 - thr) * np.tanh((a - thr) / (1 - thr))), out)
    tp = true_peak(out)
    if tp > -1: out *= dbg(-1 - tp)
    write_wav(os.path.join(HERE, '..', 'public', 'ep06.wav'), out, bits=16)
    print('LUFS:', round(integrated(out), 2), 'true peak:', round(true_peak(out), 2))
    # verifikasi sinkron benturan/jepret utama: onset & puncak vs frame kejadian
    for name, ev in [('e6_topple', 'topple'), ('e6_push', 'push'), ('e6_snatch', 'snatch'), ('e6_smack', 'smack')] + [('e6_shutter', 'flash%d' % i) for i in range(1, 7)]:
        fr = T[ev]
        at, x = min((p for p in placed[name]), key=lambda p: abs(p[0] - s(fr)))
        pk = int(np.argmax(np.abs(x[:ns(0.4)])))
        print(f'sinkron {ev}: serangan {round((at + onset(x) / SR - fr / FPS) * 1000, 1)} ms, puncak maks {round((at + pk / SR - fr / FPS) * 1000, 1)} ms')
    print('ok, sisa kredit:', quota()[0])
