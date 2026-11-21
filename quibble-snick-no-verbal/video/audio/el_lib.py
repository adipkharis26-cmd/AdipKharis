# Pustaka audio bersama (ElevenLabs Sound Effects lewat proxy sesi). API key TIDAK ada di sini: proxy menyisipkannya ke header xi-api-key.
# Dipakai oleh skrip episode (lihat _template_el.py): cek kuota -> generate per cue (di-cache) -> mix melingkar -> loudness -> verifikasi sinkron.
import json, os, subprocess, sys, urllib.request
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, 'vendor'))
from dsp import SR, ns, place, pan, write_wav, integrated, true_peak, dbg
API = 'https://api.elevenlabs.io'
CACHE = os.path.join(HERE, 'el_cache'); os.makedirs(CACHE, exist_ok=True)


def req(method, path, body=None):
    data = json.dumps(body).encode() if body else None
    r = urllib.request.Request(API + path, data=data, method=method, headers={'Content-Type': 'application/json', 'xi-api-key': 'proxy-injected'})
    return urllib.request.urlopen(r, timeout=120)


def quota():
    d = json.load(req('GET', '/v1/user/subscription'))
    return d['character_limit'] - d['character_count'], d


def gen(name, prompt, dur):
    """mp3 di-cache per nama: nama yang sama dipakai ulang tanpa biaya (juga lintas episode)."""
    mp3 = os.path.join(CACHE, name + '.mp3')
    if not os.path.exists(mp3):
        resp = req('POST', '/v1/sound-generation', {'text': prompt, 'duration_seconds': max(0.5, dur), 'prompt_influence': 0.5})
        open(mp3, 'wb').write(resp.read()); print(name, 'generated')
    wav = mp3[:-4] + '.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp3, '-ar', str(SR), '-ac', '1', '-f', 'f32le', wav], check=True)
    x = np.fromfile(wav, dtype='<f4').astype(float); os.remove(wav)
    return x


def onset(x):
    head = np.abs(x[:ns(0.4)])
    return int(np.argmax(head >= 0.5 * head.max())) if head.size and head.max() > 0 else 0


def run(T, cues, music=(), bed=None, bed_db=-16, loops=(), out_wav='epXX.wav', verify=()):
    """cues/music: (nama, prompt, durasi, waktu_kejadian_dtk, gain_dB, pan). bed: (nama, prompt, durasi) latar melingkar.
    loops: [(nama, prompt, durasi, [[f0,f1],...], gain_dB, pan)] bunyi berulang sepanjang jendela frame (boleh f0 negatif = melingkar).
    verify: [(nama_cue, frame)] benturan utama untuk dicek selisih onset/puncak."""
    FPS = T['fps']; DUR = T['frames'] / FPS; s = lambda fr: fr / FPS
    mode = sys.argv[1] if len(sys.argv) > 1 else 'quota'
    left, d = quota(); print('sisa kredit:', left, 'tier:', d.get('tier'))
    if mode == 'quota': return
    uniq = {c[0]: c for c in list(cues) + list(music) + ([bed + (0, 0, 0)] if bed else []) + [l[:3] for l in loops]}
    need = sum(c[2] for c in uniq.values() if not os.path.exists(os.path.join(CACHE, c[0] + '.mp3')))
    print('detik baru yang akan digenerate:', round(need, 1), '(cue lain dari cache)')
    if mode == 'dry': return
    N = ns(DUR); out = np.zeros((2, 2 * N)); placed = {}
    if bed:
        rb = gen(*bed)[:ns(bed[2])]; xf = ns(1.5); rb[:xf] *= np.linspace(0, 1, xf); rb[-xf:] *= np.linspace(1, 0, xf)
        t = 0.0
        while t < DUR: place(out, pan(rb, 0), t, dbg(bed_db)); t += (len(rb) - xf) / SR
    for name, prompt, dur, wins, gdb, p in loops:
        rg = gen(name, prompt, dur)[:ns(dur)]; xr = ns(0.15)
        for a, b in wins:
            t0, t1 = s(a), s(b); t = t0
            while t < t1:
                seg = rg[:min(len(rg), ns(t1 - t) + xr)].copy(); n = len(seg)
                if t > t0: seg[:xr] *= np.linspace(0, 1, xr)
                seg[-min(xr, n):] *= np.linspace(1, 0, min(xr, n))
                place(out, pan(seg, p), t if t >= 0 else t + DUR, dbg(gdb)); t += (len(rg) - xr) / SR
    for name, prompt, dur, at, gdb, p in list(cues) + list(music):
        x = gen(name, prompt, dur)
        if name in {m[0] for m in music}:
            x = x[:ns(dur)]
        else:
            nz = np.where(np.abs(x) > 0.02)[0]
            if len(nz): x = x[max(0, min(nz[0] - ns(0.005), ns(0.3))):]
            x = x[:ns(dur + 0.4)]
            at = at - onset(x) / SR  # puncak = frame kejadian
        fade = min(len(x), ns(0.25)); x[-fade:] *= np.linspace(1, 0, fade)
        if at < 0: at += DUR
        place(out, pan(x, p), at, dbg(gdb)); placed.setdefault(name, []).append((at, x))
    out = out[:, :N] + out[:, N:]  # lipat: ekor setelah titik loop masuk ke awal (seamless)
    for _ in range(3):
        out *= dbg(-13.5 - integrated(out)); thr = 0.6; a = np.abs(out)
        out = np.where(a > thr, np.sign(out) * (thr + (1 - thr) * np.tanh((a - thr) / (1 - thr))), out)
    tp = true_peak(out)
    if tp > -1: out *= dbg(-1 - tp)
    write_wav(os.path.join(HERE, '..', 'public', out_wav), out, bits=16)
    print('LUFS:', round(integrated(out), 2), 'true peak:', round(true_peak(out), 2))
    for name, fr in verify:
        at, x = min(placed[name], key=lambda q: abs(q[0] - s(fr)))
        pk = int(np.argmax(np.abs(x[:ns(0.4)])))
        print(f'sinkron {name}@{fr}: serangan {round((at + onset(x) / SR - s(fr)) * 1000, 1)} ms, puncak maks {round((at + pk / SR - s(fr)) * 1000, 1)} ms')
    print('ok, sisa kredit:', quota()[0])
