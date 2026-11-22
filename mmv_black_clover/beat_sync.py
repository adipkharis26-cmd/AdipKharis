#!/usr/bin/env python3
"""
beat_sync.py - Analisis sound (phonk / sedih / pencapaian) untuk edit MMV yang sinkron.

Butuh: ffmpeg di PATH + numpy.  (tanpa librosa)

Contoh:
  python3 beat_sync.py sound.mp3 --mood phonk --start 12.0 --length 15
  python3 beat_sync.py sound.mp3 --mood sad     --length 20

Output (di folder yang sama dengan file audio):
  <nama>_markers.txt  -> dibaca oleh MMV_BlackClover_1x1.jsx (format: detik|LABEL|catatan; CUT = titik ganti shot)
  <nama>_cutlist.txt  -> daftar shot siap edit (shot ke-n, mulai, durasi, tipe efek)
"""
import argparse
import os
import subprocess
import sys

import numpy as np

SR = 22050
HOP = 512
NFFT = 2048


def load_audio(path, start, length):
    cmd = ["ffmpeg", "-v", "error", "-ss", str(start), "-i", path]
    if length:
        cmd += ["-t", str(length)]
    cmd += ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32)
    if x.size < SR:
        sys.exit("Audio terlalu pendek / gagal dibaca.")
    return x


def spectrogram(x):
    frames = np.lib.stride_tricks.sliding_window_view(x, NFFT)[::HOP]
    return np.abs(np.fft.rfft(frames * np.hanning(NFFT), axis=1))


def band(S, lo_hz, hi_hz):
    f = np.fft.rfftfreq(NFFT, 1.0 / SR)
    return S[:, (f >= lo_hz) & (f < hi_hz)]


def flux(B):
    d = np.maximum(0.0, np.diff(np.log1p(B), axis=0)).sum(1)
    d = np.concatenate([[0.0], d])
    return d / (d.max() + 1e-9)


def estimate_tempo(onset):
    o = onset - onset.mean()
    ac = np.correlate(o, o, "full")[len(o) - 1:]
    lags = np.arange(len(ac)) * HOP / SR
    m = (lags >= 60 / 180) & (lags <= 60 / 70)  # 70-180 BPM
    period = lags[m][np.argmax(ac[m])]
    return 60.0 / period, period


def track_beats(onset, period):
    """Beat tracking sederhana: cari fase grid yang paling cocok dengan onset."""
    step = period * SR / HOP
    best_phase, best_score = 0.0, -1.0
    for ph in np.linspace(0, step, 48, endpoint=False):
        idx = np.round(np.arange(ph, len(onset), step)).astype(int)
        idx = idx[idx < len(onset)]
        s = onset[idx].mean()
        if s > best_score:
            best_phase, best_score = ph, s
    idx = np.arange(best_phase, len(onset), step)
    # snap ke puncak onset terdekat (+-60ms)
    w = int(0.06 * SR / HOP)
    out = []
    for i in idx:
        a, b = max(0, int(i) - w), min(len(onset), int(i) + w + 1)
        out.append(a + int(np.argmax(onset[a:b])))
    return np.array(out) * HOP / SR


def find_impacts(kick_onset, rms, beats, top_n):
    """Impact = beat dengan kick paling keras -> tempat FLASH/SHAKE/CUT besar."""
    t = np.arange(len(kick_onset)) * HOP / SR
    score = []
    for b in beats:
        i = int(b * SR / HOP)
        score.append(kick_onset[max(0, i - 2): i + 3].max() * (0.5 + rms[min(i, len(rms) - 1)]))
    order = np.argsort(score)[::-1][:top_n]
    return np.sort(beats[order])


def find_drop(rms, sec_per_frame):
    """Drop = lonjakan energi terbesar (rata-rata 2 dtk sesudah vs 2 dtk sebelum)."""
    w = int(2.0 / sec_per_frame)
    if len(rms) < 2 * w + 1:
        return None
    best, best_i = 0.0, None
    for i in range(w, len(rms) - w):
        g = rms[i:i + w].mean() - rms[i - w:i].mean()
        if g > best:
            best, best_i = g, i
    return None if best_i is None else best_i * sec_per_frame


def find_hits(x, jump_db=9.0, min_gap=0.25):
    """Hentakan nyata (lonjakan volume >= jump_db dalam 60 ms): stutter, gated chop, re-entry."""
    h = int(SR * 0.02)
    r = np.array([np.sqrt((x[i:i + h] ** 2).mean()) for i in range(0, len(x) - h, h)])
    db = 20 * np.log10(r + 1e-9)
    out = []
    for i in range(3, len(db)):
        if db[i] - db[i - 3] > jump_db and db[i] > db.max() - 30 and (not out or i * 0.02 - out[-1] > min_gap):
            out.append(max(0.0, i * 0.02 - 0.04))
    return np.array(out)


def quiet_zones(rms, sec_per_frame, thr=0.25, min_len=0.6):
    """Bagian sepi (jeda/breath) -> tempat teks quote / slow-mo / freeze."""
    q = rms < thr
    zones, start = [], None
    for i, v in enumerate(q):
        if v and start is None:
            start = i
        if (not v or i == len(q) - 1) and start is not None:
            if (i - start) * sec_per_frame >= min_len:
                zones.append((start * sec_per_frame, i * sec_per_frame))
            start = None
    return zones


# Resep per mood: berapa beat per shot, efek saat impact, gaya transisi
MOOD = {
    "phonk": dict(beats_per_shot=2, impact_fx="FLASH+SHAKE+ZOOM_PUNCH", idle_fx="velocity ramp / wiggle 4,6",
                  note="Potong tiap 1-2 ketukan. Cowbell/808 = flash putih 2 frame + shake. Drop = reveal karakter."),
    "sad": dict(beats_per_shot=8, impact_fx="SOFT_FADE+FILM_GRAIN", idle_fx="slow dolly-in, desaturate 40%",
                note="Shot panjang 4-6 dtk. Potong di awal frasa piano/vokal, bukan di setiap beat. Teks quote di bagian sepi."),
    "achievement": dict(beats_per_shot=4, impact_fx="GLOW_BLOOM+LIGHT_RAYS", idle_fx="push-in + rising particles",
                        note="Build-up = shot lambat & gelap; drop/klimaks = reveal kemenangan (cahaya penuh, crown, grimoire)."),
    "hype": dict(beats_per_shot=2, impact_fx="FLASH+RGB_SPLIT+SHAKE", idle_fx="speedlines + wiggle 3,10",
                 note="Mirip phonk tapi lebih banyak teks besar 'UPCOMING EPISODE' di drop."),
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--mood", choices=list(MOOD), default="phonk")
    ap.add_argument("--start", type=float, default=0.0, help="mulai potong audio (detik)")
    ap.add_argument("--length", type=float, default=0.0, help="durasi dipakai (detik), 0 = semua")
    ap.add_argument("--impacts", type=int, default=0, help="jumlah impact (default otomatis)")
    a = ap.parse_args()

    x = load_audio(a.audio, a.start, a.length)
    dur = len(x) / SR
    S = spectrogram(x)
    kick = flux(band(S, 30, 150))
    full = flux(band(S, 30, 8000))
    rms = np.sqrt(np.convolve(x ** 2, np.ones(HOP) / HOP, "same")[::HOP])[: len(full)]
    rms = rms / (rms.max() + 1e-9)
    spf = HOP / SR

    bpm, period = estimate_tempo(0.6 * kick + 0.4 * full)
    beats = track_beats(0.6 * kick + 0.4 * full, period)
    cfg = MOOD[a.mood]
    n_imp = a.impacts or max(3, int(dur / (period * 4)))
    impacts = find_impacts(kick, rms, beats, n_imp)
    drop = find_drop(np.convolve(rms, np.ones(20) / 20, "same"), spf)
    hits = find_hits(x)
    quiets = quiet_zones(np.convolve(rms, np.ones(10) / 10, "same"), spf)

    base = os.path.splitext(a.audio)[0]
    with open(base + "_markers.txt", "w") as f:
        f.write("# detik|LABEL|catatan   (mood=%s, bpm=%.1f, durasi=%.2f)\n" % (a.mood, bpm, dur))
        for i, b in enumerate(beats):
            f.write("%.3f|BEAT|%d\n" % (b, i + 1))
        for b in impacts:
            f.write("%.3f|IMPACT|%s\n" % (b, cfg["impact_fx"]))
        if drop is not None:
            f.write("%.3f|DROP|reveal karakter / judul\n" % drop)
        for h in hits:
            f.write("%.3f|HIT|hentakan nyata\n" % h)
        for s, e in quiets:
            f.write("%.3f|QUIET|sampai %.2f - teks quote / slow-mo\n" % (s, e))

    # Cut = tiap N ketukan, tapi hentakan nyata (HIT) & DROP menang atas ketukan terdekat (+-0.3 dtk)
    cuts = [c for c in beats[:: cfg["beats_per_shot"]] if c > 0.25]
    priority = list(hits) + ([drop] if drop is not None else [])
    for p in priority:
        cuts = [c for c in cuts if abs(c - p) > 0.3]
    cuts = sorted([0.0] + cuts + [p for p in priority if p > 0.25])
    merged = []
    for c in cuts:
        if not merged or c - merged[-1] > 0.3:
            merged.append(round(c, 3))
    cuts = merged
    with open(base + "_markers.txt", "a") as f:
        for c in cuts:
            f.write("%.3f|CUT|otomatis\n" % c)
    with open(base + "_cutlist.txt", "w") as f:
        f.write("MOOD: %s | BPM ~%.1f | 1 ketukan = %.3f dtk = %d frame @30fps\n" % (a.mood, bpm, period, round(period * 30)))
        f.write("Catatan: %s\n\n" % cfg["note"])
        for i, c in enumerate(cuts):
            end = cuts[i + 1] if i + 1 < len(cuts) else dur
            tag = []
            if drop is not None and abs(c - drop) < 0.15:
                tag.append("DROP -> shot terkuat")
            if any(abs(c - p) < 0.12 for p in impacts):
                tag.append(cfg["impact_fx"])
            if any(abs(c - h) < 0.05 for h in hits):
                tag.append("HIT")
            if any(s <= c <= e for s, e in quiets):
                tag.append("QUIET -> teks/slow-mo")
            f.write("Shot %02d  %6.2fs -> %6.2fs  (%.2fs, %3d fr)  %s\n"
                    % (i + 1, c, end, end - c, round((end - c) * 30), " | ".join(tag) or cfg["idle_fx"]))

    print("BPM ~%.1f | beat %d | hentakan %d | impact %d | drop %s | bagian sepi %d | shot %d"
          % (bpm, len(beats), len(hits), len(impacts), "%.2fs" % drop if drop is not None else "-", len(quiets), len(cuts)))
    print("->", base + "_markers.txt")
    print("->", base + "_cutlist.txt")


if __name__ == "__main__":
    main()
