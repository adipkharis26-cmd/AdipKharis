# EP04 audio via ElevenLabs Sound Effects API. API key TIDAK ada di sini: proxy sesi menyisipkannya ke header xi-api-key.
# Alur: cek kuota -> generate tiap cue (di-cache) -> mix sesuai timeline -> normalisasi loudness.
import json, os, subprocess, sys, urllib.request
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, 'vendor'))
from dsp import SR, ns, place, pan, write_wav, integrated, true_peak, dbg
API = 'https://api.elevenlabs.io'
CACHE = os.path.join(HERE, 'el_cache'); os.makedirs(CACHE, exist_ok=True)
T = json.load(open(os.path.join(HERE, '..', 'src', 'ep04-timeline.json'))); FPS = T['fps']; DUR = T['frames'] / FPS
s = lambda fr: fr / FPS

# (nama, prompt, durasi_detik, waktu_KEJADIAN, gain_dB, pan) — puncak bunyi disejajarkan ke waktu kejadian
CUES = [
 ('e4_creak', 'metal can wobbling and teetering on a vending machine spiral, tense creak', 1.0, s(5), -8, 0),
 ('e4_rattle1', 'shaking a vending machine gently, cans rattling inside', 0.5, s(T['shakes'][0][0] + 4), -7, 0),
 ('e4_rattle2', 'shaking a vending machine, cans rattling inside, harder', 0.5, s(T['shakes'][2][0] + 4), -6, 0),
 ('e4_kick', 'cartoon foot kicking a heavy metal vending machine, loud clang', 0.6, s(T['kick']), 0, -0.1),
 ('e4_ouch', 'cartoon toe pain, rising slide whistle and hopping boings, no voice', 1.0, s(T['kick']) + 0.25, -7, 0),
 ('e4_roll', 'small round cartoon character rolling quickly on a floor, squeaky', 0.6, s(T['dotIn'][0]) + 0.2, -9, -0.3),
 ('e4_coin1', 'coin dropping into a vending machine slot', 0.4, s(T['dotCoin']), -5, 0),
 ('e4_beep', 'vending machine button press beep', 0.3, s(T['dotButton']), -7, 0),
 ('e4_drop1', 'soda can dropping into vending machine tray, clunk', 0.5, s(T['dotDrop']), -3, 0),
 ('e4_skip', 'cheerful cartoon skipping footsteps, light and bouncy', 0.8, s(T['dotOut'][0]) + 0.1, -10, -0.4),
 ('e4_coin2', 'coin dropping into a vending machine slot', 0.4, s(T['qCoin']), -5, 0),
 ('e4_motor', 'vending machine spiral motor whirring', 0.6, s(T['spin2'][0]) + 0.15, -9, 0),
 ('e4_thunk', 'soda can getting stuck against another can, dull thunk', 0.4, s(T['stuck2']), -4, 0),
 ('e4_rage', 'cartoon angry kazoo grumble and steam whistle, no voice', 0.6, s(T['rage'][0]) + 0.1, -8, 0.1),
 ('e4_stomp', 'heavy slow cartoon footsteps of a big character, floor thuds', 0.8, s(T['brickIn'][0]) + 0.2, -6, 0.4),
 ('e4_tap', 'single tiny finger tap on metal, tink', 0.3, s(T['tap']), -4, 0),
 ('e4_rumble', 'big vending machine shaking violently, deep rumble and rattling', 0.5, s(T['tap']) + 0.12, -3, 0),
 ('e4_avalanche', 'avalanche of dozens of soda cans pouring out and clattering on the floor', 1.0, s(T['avalanche'][0]) + 0.15, -2, 0),
 ('e4_pop', 'cartoon head popping up out of a pile of cans, pop', 0.3, s(T['popUp']), -4, 0),
 ('e4_open', 'soda can tab cracking open', 0.3, s(T['open']), -3, 0),
 ('e4_spray', 'shaken soda can spraying fizz everywhere, loud hiss', 0.7, s(T['spray'][0]) + 0.1, -4, 0),
 ('e4_drip', 'liquid dripping, small drops', 0.6, s(T['drench'][0]) + 0.1, -11, 0),
 ('e4_coin3', 'coin dropping into a vending machine slot', 0.4, s(T['insert'][1]), -5, 0),
 ('e4_motor2', 'vending machine spiral motor whirring then stopping abruptly', 1.0, s(T['loopCU'][0]) + 0.5, -8, 0),
]
MUSIC = [('e4_music', 'quirky determined cartoon comedy music, pizzicato strings, bassoon and woodblock, instrumental, no vocals', 9.0, s(T['cutWide']), -16, 0),
         ('e4_music2', 'triumphant then deflating comedic cartoon jingle, instrumental, no vocals', 2.4, s(T['popUp']) + 0.1, -16, 0)]

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
            head = np.abs(x[:ns(0.4)]); on = int(np.argmax(head >= 0.5 * head.max())) if head.size and head.max() > 0 else 0
            at = at - on / SR  # puncak = frame kejadian
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
    write_wav(os.path.join(HERE, '..', 'public', 'ep04.wav'), out, bits=16); print('ok, sisa kredit:', quota()[0])
