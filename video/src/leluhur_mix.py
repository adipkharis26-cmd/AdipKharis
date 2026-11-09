#!/usr/bin/env python3
"""Ternyata Leluhur audio: VO + soft pentatonic pluck music + SFX, then loudnorm.

Usage:  python3 video/src/leluhur_mix.py tlNN
Needs   video/vo/tlNN.mp3 and the cue list (made here with `node render.js cues`).
Writes  video/vo/tlNN-mix.m4a  → pass it to render.js as the audio track.

SFX types: whoosh, pop, stamp, ombak, gempa, api, langkah, ramai, angin, palu, kayu.
Everything is synthesized (no downloads), deterministic per episode.
"""
import json, subprocess, sys, tempfile, wave
from pathlib import Path
import numpy as np

SR = 44100
ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'video' / 'src'
rng = np.random.default_rng(7)


def env(n, a=0.005, r=None):
    e = np.ones(n)
    na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    if r: nr = min(n, int(r * SR)); e[-nr:] *= np.linspace(1, 0, nr)
    return e


def lowpass(x, k):  # one-pole
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x): acc += k * (v - acc); y[i] = acc
    return y


def noise(d): return rng.standard_normal(int(d * SR))


def sfx(kind, d=None):
    if kind == 'whoosh':
        n = int(0.42 * SR); x = noise(0.42); t = np.linspace(0, 1, n)
        k = 0.02 + 0.25 * np.sin(np.pi * t) ** 2
        y = np.empty(n); acc = 0.0
        for i in range(n): acc += k[i] * (x[i] - acc); y[i] = acc
        return y * np.sin(np.pi * t) ** 1.5 * 0.9
    if kind == 'pop':
        n = int(0.09 * SR); t = np.arange(n) / SR
        f = 900 * np.exp(-t * 18) + 380
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38) * 0.55
    if kind == 'stamp':
        n = int(0.35 * SR); t = np.arange(n) / SR
        body = np.sin(2 * np.pi * (70 * t + 40 * (1 - np.exp(-t * 20)) / 20)) * np.exp(-t * 11)
        click = lowpass(noise(0.35), 0.3) * np.exp(-t * 60)
        return (body * 0.9 + click * 0.6) * 0.8
    if kind == 'palu':
        n = int(0.2 * SR); t = np.arange(n) / SR
        return (np.sin(2 * np.pi * 1800 * t) * 0.3 + lowpass(noise(0.2), 0.5)) * np.exp(-t * 45) * 0.6
    if kind == 'kayu':
        n = int(0.25 * SR); t = np.arange(n) / SR
        return (np.sin(2 * np.pi * 320 * t) + 0.5 * np.sin(2 * np.pi * 510 * t)) * np.exp(-t * 28) * 0.5
    d = d or 3.0; n = int(d * SR); t = np.arange(n) / SR
    if kind == 'ombak':
        x = lowpass(noise(d), 0.04); m = 0.4 + 0.6 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 4.5)) ** 2
        return x * m * 3.0 * env(n, 0.4, 0.8)
    if kind == 'gempa':
        x = lowpass(noise(d), 0.006) * 9 + np.sin(2 * np.pi * 38 * t) * 0.25
        return x * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t)) * env(n, 0.15, 0.8)
    if kind == 'api':
        x = lowpass(noise(d), 0.08) * 0.8; cr = np.zeros(n)
        for i in rng.integers(0, n - 400, int(d * 14)): cr[i:i + 300] += rng.standard_normal(300) * np.exp(-np.arange(300) / 40) * rng.uniform(0.3, 1)
        return (x + cr * 0.5) * env(n, 0.2, 0.5) * 0.7
    if kind == 'angin':
        return lowpass(noise(d), 0.015) * 4 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 2.3)) * env(n, 0.5, 0.8)
    if kind == 'langkah':
        y = np.zeros(n)
        for s in np.arange(0, d, 0.36):
            i = int(s * SR); m = min(n - i, 2600); tt = np.arange(m) / SR
            y[i:i + m] += lowpass(noise(m / SR), 0.15) * np.exp(-tt * 70) * 1.2
        return y * 0.7
    if kind == 'ramai':
        y = np.zeros(n)
        for v in range(7):
            f0 = rng.uniform(140, 260); syl = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * rng.uniform(3, 5) * t + v))
            ph = 2 * np.pi * np.cumsum(f0 * (1 + 0.06 * np.sin(2 * np.pi * 2.3 * t + v))) / SR
            y += (np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)) * lowpass(syl, 0.002)
        return lowpass(y, 0.3) * 0.12 * env(n, 0.4, 0.6)
    raise SystemExit(f'SFX tidak dikenal: {kind}')


def pluck(freq, d=1.6):
    """Karplus-Strong pluck (kecapi/siter-like)."""
    n = int(d * SR); p = int(SR / freq)
    buf = rng.uniform(-1, 1, p); out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = 0.996 * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out * np.exp(-np.arange(n) / SR * 1.6)


def music(total):
    # slendro-ish pentatonic on D, slow and sparse; same motif loops with small variations
    base = 293.66; scale = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2]
    motif = [0, 2, 3, 2, 4, 3, 1, 0, 2, 3, 5, 4, 3, 2, 1, 2]
    bass = [0, 0, 3, 3]
    beat = 0.5; n = int(total * SR) + SR * 2; y = np.zeros(n)
    notes = {}
    def note(f, d):
        key = (round(f, 2), d)
        if key not in notes: notes[key] = pluck(f, d)
        return notes[key]
    i = 0; t = 0.6
    while t < total:
        step = motif[i % len(motif)]
        if (i // len(motif)) % 2 and i % 4 == 3: step = (step + 2) % len(scale)
        if not (i % 8 == 7):
            s = note(base * scale[step], 1.4); a = int(t * SR); y[a:a + len(s)] += s[:n - a] * 0.32
        if i % 4 == 0:
            s = note(base / 2 * scale[bass[(i // 4) % 4]], 2.2); a = int(t * SR); y[a:a + len(s)] += s[:n - a] * 0.28
        i += 1; t += beat
    pad = np.sin(2 * np.pi * base / 2 * np.arange(n) / SR) * 0.03 * (0.6 + 0.4 * np.sin(2 * np.pi * np.arange(n) / SR / 6))
    y = y + pad
    fade = int(1.5 * SR); y[:fade] *= np.linspace(0, 1, fade)
    end = int(total * SR); y[end - fade:end] *= np.linspace(1, 0, fade); y[end:] = 0
    return y[:end]


def read_mono(path):
    tmp = Path(tempfile.mkdtemp()) / 'a.wav'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(path), '-ar', str(SR), '-ac', '1', str(tmp)], check=True)
    with wave.open(str(tmp)) as w: return np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768.0


def main():
    ep = sys.argv[1]
    cues_path = ROOT / 'video' / 'out' / f'{ep}-cues.json'
    subprocess.run(['node', 'render.js', 'cues', str(cues_path)], cwd=SRC, env={**__import__('os').environ, 'EP': ep}, check=True)
    C = json.loads(cues_path.read_text())
    total = C['duration']; n = int(total * SR)
    vo = read_mono(ROOT / 'video' / 'vo' / f'{ep}.mp3')
    mix = np.zeros(n); mix[:min(n, len(vo))] += vo[:n]
    mus = music(total); mix += mus * 0.16
    for c in C['cues']:
        s = sfx(c['type'], c.get('d')) * {'whoosh': 0.22, 'pop': 0.3, 'stamp': 0.35}.get(c['type'], 0.25) * c.get('gain', 1)
        a = int(c['t'] * SR) - (int(0.2 * SR) if c['type'] == 'whoosh' else 0); a = max(0, a)
        m = min(len(s), n - a)
        if m > 0: mix[a:a + m] += s[:m]
    tmp = Path(tempfile.mkdtemp()) / 'mix.wav'
    with wave.open(str(tmp), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
    out = ROOT / 'video' / 'vo' / f'{ep}-mix.m4a'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(tmp), '-af',
                    'loudnorm=I=-15:TP=-1.5:LRA=11,alimiter=limit=0.95', '-ar', str(SR), '-ac', '2', '-c:a', 'aac', '-b:a', '192k', str(out)], check=True)
    print(f'OK {out.relative_to(ROOT)}  {total:.1f}s  {len(C["cues"])} SFX')


if __name__ == '__main__':
    main()
