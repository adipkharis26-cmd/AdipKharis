# EP03 "The Door": musik + SFX kartun orisinal, disintesis dari nol (numpy/scipy).
# Memakai dsp.py & instruments.py dari mromidev/claude-animated-shorts (MIT, lihat vendor/LICENSE-*).
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'vendor'))
from dsp import SR, TAU, ns, tt, rng, lp, hp, bp, fades, place, write_wav, integrated, dbg, true_peak
import instruments as I

T = json.load(open(os.path.join(HERE, '..', 'src', 'ep03-timeline.json')))
FPS = T['fps']; DUR = T['frames'] / FPS
sec = lambda fr: fr / FPS
R = rng(7)
mix = np.zeros((2, ns(DUR)))
mus = np.zeros((2, ns(DUR)))

def env_exp(t, tau): return np.exp(-t / tau)
def sweep_sine(f0, f1, dur, curve=1.0, vib=0.0, vibf=0.0):
    t = tt(dur); p = (t / dur) ** curve
    f = f0 + (f1 - f0) * p
    if vib: f = f * (1 + vib * np.sin(TAU * vibf * t))
    return np.sin(TAU * np.cumsum(f) / SR)

# ---------------- SFX
def thud():
    t = tt(0.45)
    body = np.sin(TAU * np.cumsum(90 * (1 + 0.6 * env_exp(t, 0.02))) / SR) * env_exp(t, 0.09)
    knock = lp(R.standard_normal(len(t)), 900) * env_exp(t, 0.015) * 0.6
    glass = sum(np.sin(TAU * f * t + R.uniform(0, TAU)) * env_exp(t, d) * a
                for f, d, a in [(2380, 0.12, .25), (3710, 0.08, .18), (5230, 0.05, .12)])
    return fades((body + knock + glass) * 0.9)
def squeak(dur=0.45):
    t = tt(dur)
    f = 1300 + 260 * np.sin(TAU * 7 * t) + 300 * t / dur
    y = np.sin(TAU * np.cumsum(f) / SR) * (0.5 + 0.5 * np.abs(np.sin(TAU * 11 * t)))
    return fades(bp(y, 900, 3000) * 0.22, 0.02, 0.08)
def boing(f0=180, dur=0.5):
    t = tt(dur)
    f = f0 * (1 + 1.2 * t / dur) * (1 + 0.25 * np.sin(TAU * 14 * t) * env_exp(t, 0.25))
    return fades(np.sin(TAU * np.cumsum(f) / SR) * env_exp(t, 0.28) * 0.55)
def bonk():
    t = tt(0.35)
    y = sum(np.sin(TAU * f * t) * env_exp(t, d) * a for f, d, a in [(620, .09, .6), (1480, .05, .35), (2310, .03, .2)])
    y += np.sin(TAU * 110 * t) * env_exp(t, 0.05) * 0.7
    return fades(y * 0.8)
def tweet_stars(dur=0.9):  # "lihat bintang" berputar
    t = tt(dur); y = np.zeros_like(t)
    for k in range(4):
        ph = k * 0.22
        e = np.clip(1 - np.abs((t - ph - 0.1) / 0.1), 0, 1)
        y += np.sin(TAU * (2600 + 400 * np.sin(TAU * 18 * t)) * t) * e * 0.12
    return fades(y)
def ding(m=88, vel=0.6): return I.glock(I.m2f(m), vel=vel, r=R, dur=1.2)
def womp():
    a = I.brass(I.m2f(43), 0.32, vel=0.7, r=R, kind='tuba', fall=-1.0)
    b = I.brass(I.m2f(41), 0.6, vel=0.7, r=R, kind='tuba', fall=-3.0)
    out = np.zeros(len(a) + ns(0.38) + len(b)); out[:len(a)] += a; out[ns(0.38):ns(0.38) + len(b)] += b
    return out * 0.7
def step(vel=0.3, bright=3000):
    t = tt(0.07); return fades(bp(R.standard_normal(len(t)), bright * 0.6, bright) * env_exp(t, 0.012) * vel)
def whoosh(dur=0.55, up=True):
    n = ns(dur); t = tt(dur); x = R.standard_normal(n); y = np.zeros(n)
    bands = [(300, 700), (600, 1400), (1200, 2800), (2400, 5200)]
    if not up: bands = bands[::-1]
    for i, (lo, hi) in enumerate(bands):
        c = (i + 0.5) / len(bands)
        y += bp(x, lo, hi) * np.exp(-((t / dur - c) / 0.22) ** 2)
    return fades(y * np.sin(np.pi * t / dur) * 0.35, 0.01, 0.05)
def slide_whistle(f0, f1, dur):
    return fades(sweep_sine(f0, f1, dur, 0.8, vib=0.015, vibf=6) * 0.22, 0.02, 0.05)
def squish():
    t = tt(0.6)
    goo = lp(R.standard_normal(len(t)), 700) * (0.4 + 0.6 * np.abs(np.sin(TAU * 9 * t))) * env_exp(t, 0.18)
    bloop = np.sin(TAU * np.cumsum(260 * np.exp(-t / 0.12) + 70) / SR) * env_exp(t, 0.2)
    crunch = bp(R.standard_normal(len(t)), 1500, 4000) * env_exp(t, 0.02) * 0.5
    return fades((goo * 0.7 + bloop * 0.8 + crunch) * 0.8)
def pop():
    t = tt(0.18)
    return fades((sweep_sine(350, 1100, 0.18, 0.5) * env_exp(t, 0.06) + bp(R.standard_normal(len(t)), 2000, 6000) * env_exp(t, 0.004)) * 0.6)
def creak(dur=0.5):
    n = ns(dur); t = tt(dur); x = np.zeros(n)
    rate = 55 - 30 * t / dur; ph = np.cumsum(rate) / SR
    idx = np.where(np.diff(np.floor(ph)) > 0)[0]; x[idx] = R.uniform(0.6, 1.0, len(idx))
    y = sum(bp(x, f * 0.9, f * 1.1) for f in (520, 1130, 1870))
    return fades(y * 2.2, 0.01, 0.05)
def kazoo(notes):  # (start_s, dur_s, midi)
    out = []
    for st_, d, m in notes:
        t = tt(d); f = I.m2f(m) * (1 + 0.01 * np.sin(TAU * 6 * t))
        ph = np.cumsum(f) / SR
        saw = 2 * (ph % 1) - 1
        buzz = bp(saw * (1 + 0.3 * np.sin(TAU * 31 * t)), 400, 3200)
        out.append((st_, fades(buzz * 0.18, 0.015, 0.04)))
    return out

S = lambda x, at, g=1.0, p=0.0: place(mix, I_pan(x, p), at, g)
def I_pan(x, p):
    from dsp import pan
    return pan(x, p)

# HOOK
S(thud(), sec(T['impact']), 1.0)
S(squeak(0.45), sec(T['slideStart']), 0.9)
# lompat ×3 + bonk
for i, j in enumerate(T['jumps']):
    S(boing(170 + 40 * i, 0.45 if i < 2 else 0.6), sec(j), 0.8, -0.1)
S(bonk(), sec(T['bonk']), 1.0)
S(tweet_stars(), sec(T['bonk']) + 0.15, 0.8)
# joget: riff kazoo
q8 = 0.25
riff = [(0, 1, 67), (1, 1, 71), (2, 1, 74), (3, 1, 71), (4, 2, 72), (6, 2, 69), (8, 1, 67), (9, 1, 71), (10, 2, 74)]
for at, snd in kazoo([(sec(T['danceStart']) + a * q8, d * q8 * 0.9, m) for a, d, m in riff]):
    S(snd, at, 1.0, 0.15)
# pintu prank 1 cm
S(ding(91, 0.5), sec(T['peekOpen']), 0.9, 0.2)
S(womp(), sec(T['peekClose']), 0.9)
# Snick lewat
for k in range(10):
    S(step(0.25, 4200), sec(T['snickIn'][0]) + k * 0.13, 1.0, -0.4 + k * 0.05)
S(whoosh(0.5), sec(T['doorOpen'][0]), 0.9, 0.1)
S(ding(84, 0.6), sec(T['doorOpen'][0]) + 0.12, 0.9, 0.1)
S(ding(91, 0.5), sec(T['doorOpen'][0]) + 0.3, 0.8, 0.1)
S(slide_whistle(500, 1500, 0.3), sec(T['doubleTake']), 1.0, 0.3)
for k in range(8):
    S(step(0.35, 2600), sec(T['runToDoor'][0]) + k * 0.09, 1.0, 0.2 - k * 0.04)
# pintu menutup + jepit
S(whoosh(0.3, up=False), sec(T['doorClose'][0]), 0.9)
S(squish(), sec(T['doorClose'][1]), 1.1)
S(slide_whistle(900, 300, 0.7), sec(T['doorClose'][1]) + 0.5, 0.7)
# lepas, lihat ikon, dorong, lari, loop
S(pop(), sec(T['popOut']), 1.0)
S(boing(140, 0.35), sec(T['standUp']), 0.5)
S(ding(96, 0.35), sec(T['lookIcon']), 0.8, 0.3)
S(creak(0.45), sec(T['push']), 0.9, 0.2)
for k in range(5):
    S(step(0.35, 2600), sec(T['runIn'][0]) + k * 0.08, 1.0)
S(whoosh(0.45), sec(T['zoomLoop'][0]), 0.8)

# ---------------- Musik orisinal: pizzicato + glock, 132 bpm, C mayor, bouncy
bpm = 132; b = 60 / bpm
prog = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (43, [59, 62, 65])]
mel = [76, None, 79, 76, 74, None, 72, 74, 76, 79, 81, 79, 76, None, 74, None]
def music_block(t0, t1, gain):
    t = t0; i = 0
    while t < t1 - 0.05:
        bar = int(i // 4) % len(prog); root, chord = prog[bar]
        beat = i % 4
        place(mus, I_pan(I.pluck(I.m2f(root if beat % 2 == 0 else root + 7), vel=0.55, r=R, dur=0.4), -0.2), t, gain)
        if beat in (1, 3):
            for c in chord: place(mus, I_pan(I.pluck(I.m2f(c), vel=0.25, r=R, dur=0.3, bright=0.7), 0.25), t, gain)
        for half in (0, 1):
            n = mel[(i * 2 + half) % len(mel)]
            if n and t + half * b / 2 < t1:
                place(mus, I_pan(I.glock(I.m2f(n), vel=0.28, r=R, dur=0.6), 0.35), t + half * b / 2, gain)
        t += b; i += 1
music_block(sec(T['cutWide']), sec(T['doorClose'][1]), 1.0)          # berhenti tepat saat terjepit (sunyi = lucu)
music_block(sec(T['popOut']) + 0.4, DUR - 0.25, 0.7)

out = mix + mus * 0.55
# normalisasi ke ~-14 LUFS, true peak <= -1 dBTP
L = integrated(out)
for _ in range(4):  # soft-limiter: naikkan loudness tanpa memotong puncak secara kasar
    out *= dbg(-13.5 - integrated(out)); thr = 0.6
    a = np.abs(out); out = np.where(a > thr, np.sign(out) * (thr + (1 - thr) * np.tanh((a - thr) / (1 - thr))), out)
tp = true_peak(out)
if tp > -1.0: out *= dbg(-1.0 - tp)
os.makedirs(os.path.join(HERE, '..', 'public'), exist_ok=True)
write_wav(os.path.join(HERE, '..', 'public', 'ep03.wav'), out, bits=16)
print('LUFS before norm', round(L, 2), 'duration', DUR)
