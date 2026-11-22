#!/usr/bin/env python3
"""
make_animatic.py - Shot list (.txt) + sound -> (1) markers untuk After Effects, (2) animatic 1:1 ber-audio.

Animatic = video kartu warna per shot dengan nama adegan, teks layar, flash & dip hitam di titik yang sama
dengan rig AE. Dipakai untuk merasakan sinkron sound-momen SEBELUM mengerjakan panel.

  python3 make_animatic.py sounds/funk_mandala_shotlist.txt sound.mp3
Output: <shotlist>_markers.txt  dan  <shotlist>_animatic.mp4
"""
import os
import subprocess
import sys
import textwrap

from PIL import Image, ImageDraw, ImageFont

FPS = 30
SIZE = 1080
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
PALETTE = [(46, 14, 14), (20, 20, 34), (38, 24, 10), (14, 30, 22), (34, 12, 30), (12, 26, 38)]


def load(path):
    shots = []
    for line in open(path, encoding="utf-8"):
        line = line.rstrip("\n")
        if not line.strip() or line.startswith("#"):
            continue
        p = (line.split("|") + [""] * 5)[:5]
        fx = [f.strip() for f in p[2].split(",") if f.strip()]
        shots.append(dict(t0=float(p[0]), t1=float(p[1]), fx=fx, scene=p[3].strip(), text=p[4].strip()))
    return shots


def gates(shot):
    out = []
    for f in shot["fx"]:
        if f.startswith("GATE:"):
            a, b = f[5:].split("-")
            out.append((float(a), float(b)))
    return out


def write_markers(shots, path):
    with open(path, "w") as f:
        f.write("# dibuat oleh make_animatic.py - detik|LABEL|catatan\n")
        for i, s in enumerate(shots):
            f.write("%.3f|CUT|shot %d %s\n" % (s["t0"], i + 1, s["scene"][:40]))
            if "FLASH" in s["fx"]:
                f.write("%.3f|IMPACT|shot %d\n" % (s["t0"], i + 1))
            if "DROP" in s["fx"]:
                f.write("%.3f|DROP|shot %d\n" % (s["t0"], i + 1))
            if "BLACK" in s["fx"] and i > 0:
                f.write("%.3f|GAP|%.3f\n" % (s["t0"], s["t1"]))
            for a, b in gates(s):
                f.write("%.3f|GAP|%.3f\n" % (a, b))


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    shot_path, audio = sys.argv[1], sys.argv[2]
    shots = load(shot_path)
    base = os.path.splitext(shot_path)[0].replace("_shotlist", "")
    write_markers(shots, base + "_markers.txt")

    big = ImageFont.truetype(FONT, 64)
    mid = ImageFont.truetype(FONT, 34)
    small = ImageFont.truetype(FONT, 26)
    end = shots[-1]["t1"]
    nframes = int(round(end * FPS))
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "%dx%d" % (SIZE, SIZE),
           "-r", str(FPS), "-i", "-", "-i", audio, "-t", "%.3f" % end, "-c:v", "libx264", "-crf", "20",
           "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", base + "_animatic.mp4"]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)

    for fr in range(nframes):
        t = fr / FPS
        idx = next((i for i, s in enumerate(shots) if s["t0"] <= t < s["t1"]), len(shots) - 1)
        s = shots[idx]
        local = (t - s["t0"]) / max(1e-6, s["t1"] - s["t0"])
        black = "BLACK" in s["fx"] and idx > 0
        col = (0, 0, 0) if "BLACK" in s["fx"] else PALETTE[idx % len(PALETTE)]
        if "DESAT" in s["fx"]:
            g = sum(col) // 3
            col = (g, g, g)
        if "DROP" in s["fx"]:
            col = (90, 8, 8)
        img = Image.new("RGB", (SIZE, SIZE), col)
        d = ImageDraw.Draw(img)

        if not black:
            # push-in visual: kotak "panel" membesar pelan
            zoom = 1 + 0.07 * local
            w = int(SIZE * 0.72 * zoom)
            x0 = (SIZE - w) // 2
            if "BLACK" not in s["fx"]:
                d.rectangle([x0, x0 - 60, x0 + w, x0 + w - 60], outline=(230, 60, 40) if "DROP" in s["fx"] else (200, 200, 200), width=4)
            d.text((SIZE / 2, 70), "SHOT %02d  |  %.2fs - %.2fs  (%d fr)" % (idx + 1, s["t0"], s["t1"], round((s["t1"] - s["t0"]) * FPS)),
                   font=small, fill=(255, 210, 90), anchor="mm")
            lines = textwrap.wrap(s["scene"], 34)
            for j, ln in enumerate(lines[:5]):
                d.text((SIZE / 2, SIZE * 0.40 + j * 44), ln, font=mid, fill=(235, 235, 235), anchor="mm")
            tags = " ".join(s["fx"]) or "-"
            d.text((SIZE / 2, SIZE * 0.66), tags, font=small, fill=(150, 200, 255), anchor="mm")
        if s["text"]:
            for j, ln in enumerate(textwrap.wrap(s["text"], 22)):
                d.text((SIZE / 2, SIZE * 0.80 + j * 70), ln, font=big, fill=(255, 60, 40), anchor="mm",
                       stroke_width=4, stroke_fill=(0, 0, 0))
        d.text((SIZE / 2, SIZE * 0.95), "@channelmu", font=small, fill=(255, 255, 255), anchor="mm")

        # flash putih 3 frame di IMPACT/DROP, dip hitam di GATE
        since = t - s["t0"]
        if ("FLASH" in s["fx"] or "DROP" in s["fx"]) and since < 3 / FPS:
            a = 1 - since * FPS / 3
            img = Image.blend(img, Image.new("RGB", img.size, (255, 255, 255)), 0.85 * a)
        for a_, b_ in gates(s):
            if a_ <= t < b_:
                img = Image.blend(img, Image.new("RGB", img.size, (0, 0, 0)), 0.8)
        proc.stdin.write(img.tobytes())
    proc.stdin.close()
    proc.wait()
    print("->", base + "_markers.txt")
    print("->", base + "_animatic.mp4")


if __name__ == "__main__":
    main()
