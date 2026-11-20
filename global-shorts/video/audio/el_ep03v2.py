# EP03 v2 audio via ElevenLabs Sound Effects API. API key TIDAK ada di sini: proxy sesi menyisipkannya ke header xi-api-key.
# Alur: cek kuota -> generate tiap cue (di-cache) -> mix sesuai timeline -> normalisasi loudness.
import json, os, subprocess, sys, urllib.request
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, 'vendor'))
from dsp import SR, ns, place, pan, write_wav, integrated, true_peak, dbg
API = 'https://api.elevenlabs.io'
CACHE = os.path.join(HERE, 'el_cache'); os.makedirs(CACHE, exist_ok=True)
T = json.load(open(os.path.join(HERE, '..', 'src', 'ep03v2-timeline.json'))); FPS = T['fps']; DUR = T['frames'] / FPS
s = lambda fr: fr / FPS

# (nama, prompt, durasi_detik, waktu_mulai, gain_dB, pan)
CUES = [
 ('run_in', 'cartoon character fast running footsteps approaching, comedic', 0.6, s(T['loopRun'][0]) - 0.1, -6, 0),
 ('glass_smack', 'cartoon face smacking hard into a glass door, comedic thud with glass wobble', 1.0, s(T['impact']) - 0.03, 0, 0),
 ('glass_squeak', 'cartoon face slowly sliding down a glass window, rubbery squeak', 1.0, s(T['slide'][0]), -4, 0),
 ('boing1', 'cartoon spring jump boing, short', 0.6, s(T['jumps'][0]), -6, -0.1),
 ('boing2', 'cartoon spring jump boing, short, higher pitch', 0.6, s(T['jumps'][1]), -6, 0.1),
 ('big_jump', 'cartoon big jump whoosh up', 0.5, s(T['jumps'][2]), -6, 0),
 ('bonk', 'cartoon head bonk on metal box, comedic', 0.7, s(T['bonk']), 0, 0),
 ('dizzy_birds', 'cartoon dizzy tweeting birds circling head', 1.4, s(T['stars'][0]) + 0.1, -9, 0.2),
 ('tease_ding', 'automatic door opens a tiny bit with hopeful soft chime', 0.6, s(T['peekOpen']), -6, 0),
 ('sad_trombone', 'short sad trombone wah wah, comedic fail', 1.2, s(T['peekClose']), -5, 0),
 ('tiny_steps', 'small cartoon creature light quick footsteps on tile', 0.9, s(T['snickWalk'][0]), -10, -0.3),
 ('door_open', 'automatic sliding glass door opening with pleasant chime', 1.0, s(T['snickDoorOpen'][0]), -5, 0),
 ('smug_ting', 'cartoon smug eyebrow wiggle sparkle ting', 0.6, s(T['snickSmirk'][0]), -7, 0),
 ('door_close', 'automatic sliding glass door closing smoothly', 0.8, s(T['snickDoorClose'][0]), -7, 0),
 ('idea', 'cartoon idea light bulb ding', 0.6, s(T['bulb']), -5, 0),
 ('hat_pop', 'cartoon party hat popping on head, small pop', 0.5, s(T['hatOn']), -7, 0),
 ('sneak', 'cartoon sneaky tiptoe footsteps, pizzicato', 1.0, s(T['sneak'][0]), -9, 0),
 ('scan', 'electronic door sensor scanning beeps, uncertain', 0.6, s(T['sensorFlicker'][0]), -8, 0),
 ('success', 'cheerful success chime then sliding door opening', 1.0, s(T['sensorFlicker'][1]), -5, 0),
 ('tada', 'short comedic brass fanfare ta-da with party horn', 1.2, s(T['tada'][0]), -4, 0),
 ('slam_squish', 'sliding door slamming shut on cartoon character, squish squeeze sound', 1.0, s(T['slam'][0]), 0, 0),
 ('hat_fly', 'cartoon object spinning through the air whistle', 0.9, s(T['hatFly'][0]), -8, 0.2),
 ('hat_land', 'small plink as a party hat lands on a box', 0.4, s(T['hatFly'][1]), -8, 0),
 ('pop_out', 'cartoon character popping out of a tight gap, suction pop', 0.6, s(T['popOut']), -4, 0),
 ('back_steps', 'heavy determined cartoon footsteps walking backwards', 0.8, s(T['backUp'][0]), -9, -0.2),
 ('bull_scrape', 'cartoon bull scraping hoof on floor before charging', 0.6, s(T['scrape'][0]), -6, -0.3),
 ('charge', 'cartoon character sprinting very fast with rising whoosh', 0.9, s(T['charge'][0]), -5, 0),
 ('charge_whoosh', 'fast rising whoosh into an impact', 0.7, s(T['loopRun'][0]), -6, 0),
]
MUSIC = [('music_a', 'quirky playful cartoon comedy music, pizzicato strings and bassoon, bouncy, no vocals, instrumental', 9.7, s(T['impact']) + 0.03, -14, 0),
         ('music_b', 'tense comedic cartoon build-up, timpani roll and plucked strings, instrumental', 2.3, s(T['backUp'][0]), -14, 0)]

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
        gen(*CUES[1][:3]); print('sisa setelah 1 cue:', quota()[0]); sys.exit()
    N = ns(DUR); out = np.zeros((2, 2 * N))
    for name, prompt, dur, at, gdb, p in todo:
        x = gen(name, prompt, dur)
        if not name.startswith('music'):
            nz = np.where(np.abs(x) > 0.02)[0]
            if len(nz): x = x[max(0, min(nz[0] - ns(0.005), ns(0.3))):]  # buang hening di depan (maks 0,3 dtk)
            x = x[:ns(dur + 0.4)]
        else:
            x = x[:ns(dur)]
        fade = min(len(x), ns(0.25)); x[-fade:] *= np.linspace(1, 0, fade)
        place(out, pan(x, p), at, dbg(gdb))
    out = out[:, :N] + out[:, N:]
    for _ in range(3):
        out *= dbg(-13.5 - integrated(out)); thr = 0.6; a = np.abs(out)
        out = np.where(a > thr, np.sign(out) * (thr + (1 - thr) * np.tanh((a - thr) / (1 - thr))), out)
    tp = true_peak(out)
    if tp > -1: out *= dbg(-1 - tp)
    write_wav(os.path.join(HERE, '..', 'public', 'ep03v2.wav'), out, bits=16); print('ok, sisa kredit:', quota()[0])
