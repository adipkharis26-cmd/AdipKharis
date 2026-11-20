# EP01 audio via ElevenLabs Sound Effects API. API key TIDAK ada di sini: proxy sesi menyisipkannya ke header xi-api-key.
# Alur: cek kuota -> generate tiap cue (di-cache) -> mix sesuai timeline -> normalisasi loudness.
import json, os, subprocess, sys, urllib.request
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, 'vendor'))
from dsp import SR, ns, place, pan, write_wav, integrated, true_peak, dbg
API = 'https://api.elevenlabs.io'
CACHE = os.path.join(HERE, 'el_cache'); os.makedirs(CACHE, exist_ok=True)
T = json.load(open(os.path.join(HERE, '..', 'src', 'ep01-timeline.json'))); FPS = T['fps']; DUR = T['frames'] / FPS
s = lambda fr: fr / FPS

# (nama, prompt, durasi_detik, waktu_mulai, gain_dB, pan)
CUES = [
 ('e1_slam', 'two hands slapping down on a table at the same time, dramatic comedic impact, plate rattles', 0.8, s(T['slam']) - 0.02, 0, 0),
 ('e1_sting', 'short dramatic orchestral sting dun dun, comedic standoff', 1.2, s(T['slam']) + 0.05, -6, 0),
 ('e1_ticktock', 'clock ticking tension, comedic standoff', 1.4, s(T['cutWide']), -12, 0),
 ('e1_scrape1', 'ceramic plate scraping quickly across a wooden table', 0.4, s(T['tugs'][0][0]), -8, 0.2),
 ('e1_scrape2', 'ceramic plate scraping quickly across a wooden table, short', 0.4, s(T['tugs'][2][0]), -8, -0.2),
 ('e1_scrape3', 'ceramic plate scraped back and forth fast on wood', 0.5, s(T['tugs'][4][0]), -8, 0),
 ('e1_point', 'cartoon dramatic whoosh as character points somewhere, comedic', 0.5, s(T['point'][0]), -6, -0.3),
 ('e1_yawn', 'cartoon bored yawn played on a tuba, comedic, no voice', 1.0, s(T['yawn'][0]), -8, 0.3),
 ('e1_cricket', 'awkward silence crickets chirping, comedic', 0.8, s(T['pointDroop'][0]), -12, 0),
 ('e1_inhale', 'cartoon rising slide whistle building up to a sneeze', 0.6, s(T['inhale'][0]), -8, 0.3),
 ('e1_sneeze', 'big cartoon sneeze achoo with spray, comedic', 0.7, s(T['sneeze']) - 0.1, -3, 0.3),
 ('e1_eww', 'cartoon disgust recoil boing', 0.5, s(T['recoil'][0]) + 0.05, -8, -0.3),
 ('e1_grab', 'quick cartoon snatch swipe', 0.4, s(T['grab']), -7, 0.2),
 ('e1_run', 'small cartoon creature running away fast with tiny footsteps', 0.7, s(T['runOff'][0]), -9, 0.5),
 ('e1_sad', 'short sad trombone wah wah', 1.0, s(T['sad'][0]), -7, 0),
 ('e1_bite', 'biting into a plastic squeaky toy, loud comedic squeak', 0.6, s(T['bite']), -1, 0),
 ('e1_boing', 'cartoon teeth vibrating boing wobble', 0.8, s(T['bite']) + 0.15, -6, 0),
 ('e1_dizzy', 'cartoon dizzy tweeting birds', 1.0, s(T['bite']) + 0.5, -10, 0),
 ('e1_box', 'cardboard pizza box sliding out and lid opening', 0.6, s(T['boxOut'][0]), -6, -0.2),
 ('e1_reveal', 'cheerful comedic reveal ta-da chime', 0.8, s(T['boxOut'][0]) + 0.1, -7, 0),
 ('e1_munch', 'cartoon happy munching crunchy pizza, nom nom chewing', 1.3, s(T['munch'][0]), -7, -0.2),
 ('e1_steam', 'cartoon angry steam whistle from ears', 0.9, s(T['snickBack'][0]), -8, 0.4),
 ('e1_whistle', 'innocent casual whistling melody, cartoon pretending nothing happened', 1.0, s(T['whistle'][0]), -7, -0.2),
 ('e1_plink', 'plate set down gently on a table, small plink', 0.4, s(T['newSlice'][0]) + 0.2, -8, 0),
 ('e1_tension', 'slow rising tension strings tremolo building suspense, comedic', 2.0, s(T['loopReach'][0]) + 0.25, -10, 0),
]
MUSIC = [('e1_music', 'playful sneaky cartoon comedy music, pizzicato strings and clarinet, bouncy, instrumental, no vocals', 8.6, s(T['cutWide']), -15, 0),
         ('e1_music2', 'happy smug cartoon victory music, pizzicato and glockenspiel, instrumental, no vocals', 4.0, s(T['cutReveal']) + 0.3, -15, 0)]

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
            x = x[:ns(min(dur, s(T['bite']) - at))] if name == 'e1_music' else x[:ns(dur)]
        fade = min(len(x), ns(0.25)); x[-fade:] *= np.linspace(1, 0, fade)
        place(out, pan(x, p), at, dbg(gdb))
    out = out[:, :N] + out[:, N:]
    for _ in range(3):
        out *= dbg(-13.5 - integrated(out)); thr = 0.6; a = np.abs(out)
        out = np.where(a > thr, np.sign(out) * (thr + (1 - thr) * np.tanh((a - thr) / (1 - thr))), out)
    tp = true_peak(out)
    if tp > -1: out *= dbg(-1 - tp)
    write_wav(os.path.join(HERE, '..', 'public', 'ep01.wav'), out, bits=16); print('ok, sisa kredit:', quota()[0])
