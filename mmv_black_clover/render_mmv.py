#!/usr/bin/env python3
"""
render_mmv.py - Render edit MMV 1:1 langsung dari gambar + sound (tanpa After Effects).

Gaya meniru referensi MMV Black Clover:
  - push-in / speed-ramp per shot, handheld sway, shake + zoom punch + flash putih + RGB split di hentakan
  - glow bloom, bara/partikel melayang, vignette, grain halus
  - panel manga hitam-putih otomatis diberi duotone hangat (seperti panel berwarna di referensi)
  - label "BEST MOMENT" + nama karakter berglow, subtitle miring, teks hook besar
  - dip hitam di jeda gated-chop

  python3 render_mmv.py edits/funk_mandala_asta.py <folder_gambar> <sound.mp3> output.mp4
File edit (.py) berisi daftar SHOTS (lihat edits/funk_mandala_asta.py).
"""
import importlib.util
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

S = 1080
FPS = 30
def _pick(*paths):
    for p in paths:
        if os.path.exists(p):
            return p
    return paths[-1]


BOLD = _pick("/usr/share/fonts/opentype/inter/InterDisplay-Black.otf", "C:/Windows/Fonts/ariblk.ttf",
             "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
OBL = _pick("/usr/share/fonts/opentype/inter/InterDisplay-BlackItalic.otf", "C:/Windows/Fonts/arialbi.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")


# ---------- util ----------
def ease_io(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def ease_out_expo(x):
    x = min(1.0, max(0.0, x))
    return 1.0 if x >= 1 else 1 - 2 ** (-10 * x)


def noise1(t, seed, freq):
    """smooth value-noise -1..1"""
    x = t * freq + seed * 13.37
    i = math.floor(x)
    f = x - i

    def h(n):
        return math.sin(n * 127.1 + seed * 311.7) * 43758.5453 % 1 * 2 - 1

    return h(i) + (h(i + 1) - h(i)) * (f * f * (3 - 2 * f))


def is_grayscale(img):
    a = np.asarray(img.convert("RGB").resize((128, 128)), dtype=np.float32)
    return (a.max(2) - a.min(2)).mean() < 12


def duotone(img, dark=(18, 6, 8), light=(246, 226, 190), accent=None):
    g = np.asarray(img.convert("L"), dtype=np.float32) / 255.0
    g = np.clip((g - 0.04) / 0.92, 0, 1) ** 1.1
    d = np.array(dark, np.float32)
    l = np.array(light, np.float32)
    out = d + (l - d) * g[..., None]
    if accent is not None:  # tinta mid-tone diberi warna aksen tipis
        m = (np.exp(-((g - 0.35) ** 2) / 0.02))[..., None] * 0.35
        out = out * (1 - m) + np.array(accent, np.float32) * m
    return Image.fromarray(out.clip(0, 255).astype(np.uint8))


def load_src(path, shot):
    img = Image.open(path).convert("RGB")
    if shot.get("duotone", "auto") is True or (shot.get("duotone", "auto") == "auto" and is_grayscale(img)):
        img = duotone(img, accent=shot.get("accent"))
    if shot.get("desat"):
        g = img.convert("L").convert("RGB")
        img = Image.blend(img, g, shot["desat"])
    # pastikan sisi pendek >= 1300 px untuk zoom
    k = 1300 / min(img.size)
    if k > 1:
        img = img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS)
    return img


def crop_frame(img, fx, fy, zoom, ox, oy):
    side = min(img.size) / zoom
    cx = fx * img.width + ox * side
    cy = fy * img.height + oy * side
    cx = min(max(cx, side / 2), img.width - side / 2)
    cy = min(max(cy, side / 2), img.height - side / 2)
    box = (cx - side / 2, cy - side / 2, cx + side / 2, cy + side / 2)
    return img.resize((S, S), Image.BICUBIC, box=box)


# ---------- teks ----------
_fonts = {}


def font(path, size):
    k = (path, size)
    if k not in _fonts:
        _fonts[k] = ImageFont.truetype(path, size)
    return _fonts[k]


def glow_text(base, text, y, size, color, glow=None, path=BOLD, scale=1.0, alpha=1.0, track=0):
    if not text or alpha <= 0:
        return base
    size = max(8, int(size * scale))
    f = font(path, size)
    layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.text((S / 2, y), text, font=f, fill=color + (255,), anchor="mm",
           stroke_width=max(2, size // 14), stroke_fill=(0, 0, 0, 255))
    if glow:
        gl = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        ImageDraw.Draw(gl).text((S / 2, y), text, font=f, fill=glow + (255,), anchor="mm",
                                stroke_width=max(3, size // 8), stroke_fill=glow + (255,))
        gl = gl.filter(ImageFilter.GaussianBlur(size * 0.35))
        base = Image.alpha_composite(base, _mul_alpha(gl, alpha))
        base = Image.alpha_composite(base, _mul_alpha(gl, alpha * 0.6))
    return Image.alpha_composite(base, _mul_alpha(layer, alpha))


def _mul_alpha(im, a):
    if a >= 1:
        return im
    r, g, b, al = im.split()
    return Image.merge("RGBA", (r, g, b, al.point(lambda v: int(v * a))))


# ---------- partikel bara ----------
class Embers:
    def __init__(self, n=70, seed=7):
        rng = np.random.default_rng(seed)
        self.x = rng.uniform(0, S, n)
        self.y0 = rng.uniform(0, S * 1.3, n)
        self.v = rng.uniform(40, 140, n)
        self.r = rng.uniform(1.5, 5.0, n)
        self.ph = rng.uniform(0, 6.28, n)
        self.c = rng.choice([0, 1, 2], n, p=[0.55, 0.3, 0.15])

    def draw(self, t, color_main, strength=1.0):
        layer = Image.new("RGB", (S, S), (0, 0, 0))
        d = ImageDraw.Draw(layer)
        cols = [color_main, (255, 170, 60), (255, 240, 220)]
        for i in range(len(self.x)):
            y = (self.y0[i] - self.v[i] * t) % (S * 1.3) - S * 0.15
            x = self.x[i] + 25 * math.sin(t * 1.3 + self.ph[i])
            fl = 0.6 + 0.4 * math.sin(t * 7 + self.ph[i] * 3)
            r = self.r[i]
            c = tuple(int(v * fl * strength) for v in cols[self.c[i]])
            d.ellipse([x - r, y - r, x + r, y + r], fill=c)
        small = layer.resize((S // 3, S // 3), Image.BILINEAR).filter(ImageFilter.GaussianBlur(2))
        return np.asarray(layer, np.float32) + np.asarray(small.resize((S, S), Image.BILINEAR), np.float32) * 1.8


# ---------- render ----------
def main():
    if len(sys.argv) < 5:
        sys.exit(__doc__)
    edit_path, img_dir, audio, out = sys.argv[1:5]
    spec = importlib.util.spec_from_file_location("edit", edit_path)
    E = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(E)
    shots = E.SHOTS
    end = shots[-1]["t1"]
    n = int(round(end * FPS))
    watermark = getattr(E, "WATERMARK", "")
    ember_color = getattr(E, "EMBER_COLOR", (255, 60, 30))

    srcs = {}
    for s in shots:
        if s.get("img") and s["img"] not in srcs:
            srcs[s["img"]] = load_src(os.path.join(img_dir, s["img"]), s)
    embers = Embers()
    yy, xx = np.mgrid[0:S, 0:S]
    rr = np.sqrt(((xx - S / 2) / (S / 2)) ** 2 + ((yy - S / 2) / (S / 2)) ** 2)
    vignette = np.clip(1.15 - 0.55 * rr ** 2.2, 0.25, 1)[..., None].astype(np.float32)
    rng = np.random.default_rng(3)
    grains = [rng.normal(0, 5, (S, S, 1)).astype(np.float32) for _ in range(6)]

    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "%dx%d" % (S, S),
           "-r", str(FPS), "-i", "-", "-i", audio, "-t", "%.3f" % end, "-map", "0:v", "-map", "1:a",
           "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", out]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)

    for fr in range(n):
        t = fr / FPS
        idx = next((i for i, s in enumerate(shots) if s["t0"] <= t < s["t1"]), len(shots) - 1)
        s = shots[idx]
        dur = s["t1"] - s["t0"]
        lt = t - s["t0"]
        p = lt / dur
        hit = s.get("hit", False) or s.get("drop", False)
        amp = math.exp(-lt * (8 if s.get("drop") else 11)) if hit else 0.0
        amp *= 1.5 if s.get("drop") else 1.0

        if s.get("img"):
            src = srcs[s["img"]]
            z0, z1 = s.get("zoom", (1.0, 1.12))
            prog = ease_out_expo(p * 1.2) if s.get("ramp") else ease_io(p)
            zoom = z0 + (z1 - z0) * prog
            zoom *= 1 + 0.07 * amp  # zoom punch
            fx, fy = s.get("focus", (0.5, 0.5))
            px, py = s.get("pan", (0.0, 0.0))
            ox = px * (prog - 0.5) + 0.012 * noise1(t, 1, 0.8) + 0.03 * amp * noise1(t, 5, 25)
            oy = py * (prog - 0.5) + 0.012 * noise1(t, 2, 0.7) + 0.03 * amp * noise1(t, 6, 23)
            frame = np.asarray(crop_frame(src, fx, fy, zoom, ox, oy), np.float32)
        else:
            frame = np.zeros((S, S, 3), np.float32)

        # grading dasar: kontras + sedikit hangat
        frame = (frame - 128) * s.get("contrast", 1.12) + 128 + np.array([6, 0, -6], np.float32)
        brightness = s.get("bright", 1.0)
        frame *= brightness

        # bloom
        if s.get("img"):
            small = Image.fromarray(frame.clip(0, 255).astype(np.uint8)).resize((S // 4, S // 4), Image.BILINEAR)
            sa = np.asarray(small, np.float32)
            hi = np.clip(sa - s.get("bloom_thr", 170), 0, 255) * 2.2
            bl = Image.fromarray(hi.clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(9))
            bloom_k = s.get("bloom", 0.55) * (1 + 1.6 * amp)
            frame += np.asarray(bl.resize((S, S), Image.BILINEAR), np.float32) * bloom_k

        # bara melayang
        if s.get("img") and s.get("embers", True):
            frame += embers.draw(t, ember_color, s.get("ember_k", 1.0)) * 0.9

        frame *= vignette
        frame += grains[fr % len(grains)]

        # RGB split saat impact
        if amp > 0.25:
            k = int(10 * amp)
            frame[..., 0] = np.roll(frame[..., 0], k, axis=1)
            frame[..., 2] = np.roll(frame[..., 2], -k, axis=1)

        # flash putih
        if hit and lt < 4 / FPS:
            a = (1 - lt * FPS / 4) * (0.95 if s.get("drop") else 0.75)
            frame = frame * (1 - a) + 255 * a

        # gate (dip hitam)
        for a_, b_ in s.get("gate", []):
            if a_ <= t < b_:
                frame *= 0.18
        # fade in di awal shot hitam->gambar (jika diminta)
        if s.get("fade_in") and lt < s["fade_in"]:
            frame *= lt / s["fade_in"]

        img = Image.fromarray(frame.clip(0, 255).astype(np.uint8)).convert("RGBA")

        # teks
        punch = 1 + 0.12 * amp
        for tx in s.get("texts", []):
            if not (tx.get("from", 0) <= lt < tx.get("to", 99)):
                continue
            ta = min(1.0, (lt - tx.get("from", 0)) / tx.get("fade", 0.08)) if tx.get("fade", 0.08) > 0 else 1
            img = glow_text(img, tx["text"], tx.get("y", 0.84) * S, tx.get("size", 60),
                            tuple(tx.get("color", (255, 255, 255))), tuple(tx["glow"]) if tx.get("glow") else None,
                            OBL if tx.get("italic") else BOLD, punch if tx.get("punch", True) else 1.0, ta)
        if watermark:
            img = glow_text(img, watermark, 0.955 * S, 26, (255, 255, 255), None, OBL, 1.0, 0.75)

        proc.stdin.write(img.convert("RGB").tobytes())
        if fr % 60 == 0:
            print("frame %d/%d" % (fr, n), flush=True)
    proc.stdin.close()
    proc.wait()
    print("->", out)


if __name__ == "__main__":
    main()
