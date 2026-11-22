#!/usr/bin/env python3
"""
make_branding.py - 5 logo (1080x1080) + banner YouTube (2560x1440) untuk channel Charizchkun.

  python3 branding/make_branding.py branding/out
Semua elemen orisinal (tipografi, tinta, cahaya, petir) - tidak memakai logo/lambang resmi Black Clover,
supaya aman dipakai sebagai identitas channel. Font dari motion/fonts (Google Fonts, OFL).
"""
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "..", "motion", "fonts")
NAME = "Charizchkun"

GOLD = (255, 200, 70)
GOLD_HI = (255, 240, 190)
RED = (225, 30, 35)
INK = (10, 8, 10)


def font(name, size, weight=None):
    f = ImageFont.truetype(os.path.join(FONTS, name), size)
    if weight:
        try:
            f.set_variation_by_axes([weight])
        except Exception:
            pass
    return f


def mask_text(size, text, f, xy, anchor="mm", tracking=0.0, stroke=0):
    m = Image.new("L", size, 0)
    d = ImageDraw.Draw(m)
    if not tracking:
        d.text(xy, text, font=f, fill=255, anchor=anchor, stroke_width=stroke, stroke_fill=255)
        return m
    ws = [d.textlength(c, font=f) for c in text]
    total = sum(ws) + tracking * f.size * (len(text) - 1)
    x = xy[0] - total / 2
    for c, w in zip(text, ws):
        d.text((x, xy[1]), c, font=f, fill=255, anchor="lm", stroke_width=stroke, stroke_fill=255)
        x += w + tracking * f.size
    return m


def arr(img):
    return np.asarray(img, np.float32)


def comp(base, color, m, k=1.0):
    """Tempel warna (atau gambar RGB) memakai mask L."""
    a = (arr(m) / 255.0 * k)[..., None]
    c = arr(color) if isinstance(color, Image.Image) else np.array(color, np.float32)
    return base * (1 - a) + c * a


def glow(base, m, color, radius, k=1.0):
    g = arr(m.filter(ImageFilter.GaussianBlur(radius))) / 255.0
    return base + g[..., None] * np.array(color, np.float32) * k


def gradient_v(size, top, bottom, y0=0.0, y1=1.0):
    w, h = size
    t = np.clip((np.linspace(0, 1, h) - y0) / max(1e-6, y1 - y0), 0, 1)[:, None, None]
    g = np.array(top, np.float32) * (1 - t) + np.array(bottom, np.float32) * t
    return Image.fromarray(np.repeat(g, w, axis=1).astype(np.uint8))


def radial(size, center, radius, inner, outer, power=1.6):
    w, h = size
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt((xx - center[0]) ** 2 + (yy - center[1]) ** 2) / radius
    t = np.clip(r, 0, 1)[..., None] ** power
    return np.array(inner, np.float32) * (1 - t) + np.array(outer, np.float32) * t


def rays(size, center, color, n=26, k=0.35, seed=1):
    w, h = size
    rng = np.random.default_rng(seed)
    m = Image.new("L", size, 0)
    d = ImageDraw.Draw(m)
    L = max(w, h) * 1.5
    for i in range(n):
        a = i / n * 2 * math.pi + rng.uniform(-0.05, 0.05)
        wd = rng.uniform(0.015, 0.05)
        p1 = (center[0] + math.cos(a - wd) * L, center[1] + math.sin(a - wd) * L)
        p2 = (center[0] + math.cos(a + wd) * L, center[1] + math.sin(a + wd) * L)
        d.polygon([center, p1, p2], fill=int(rng.uniform(60, 160)))
    m = m.filter(ImageFilter.GaussianBlur(max(w, h) / 120))
    fall = radial(size, center, max(w, h) * 0.75, (1,), (0,), 1.2)[..., 0]
    return (arr(m) / 255.0 * fall)[..., None] * np.array(color, np.float32) * k


def particles(size, n, color, seed=4, rmax=5):
    w, h = size
    rng = np.random.default_rng(seed)
    m = Image.new("L", size, 0)
    d = ImageDraw.Draw(m)
    for _ in range(n):
        x, y, r = rng.uniform(0, w), rng.uniform(0, h), rng.uniform(1, rmax)
        d.ellipse([x - r, y - r, x + r, y + r], fill=int(rng.uniform(120, 255)))
    g = arr(m.filter(ImageFilter.GaussianBlur(rmax * 1.5))) + arr(m) * 0.6
    return (g / 255.0)[..., None] * np.array(color, np.float32)


def lightning(size, start, end, seed=3, width=6, branches=5):
    m = Image.new("L", size, 0)
    d = ImageDraw.Draw(m)
    rng = np.random.default_rng(seed)

    def bolt(p, q, w, depth):
        pts = [p]
        n = 14
        for i in range(1, n):
            t = i / n
            x = p[0] + (q[0] - p[0]) * t + rng.normal(0, 22 / (depth + 1))
            y = p[1] + (q[1] - p[1]) * t + rng.normal(0, 22 / (depth + 1))
            pts.append((x, y))
        pts.append(q)
        d.line(pts, fill=255, width=max(1, int(w)), joint="curve")
        if depth < 2:
            for _ in range(branches if depth == 0 else 2):
                j = rng.integers(2, n - 2)
                a = math.atan2(q[1] - p[1], q[0] - p[0]) + rng.choice([-1, 1]) * rng.uniform(0.4, 1.0)
                L = math.dist(p, q) * rng.uniform(0.15, 0.35)
                bolt(pts[j], (pts[j][0] + math.cos(a) * L, pts[j][1] + math.sin(a) * L), w * 0.5, depth + 1)
    bolt(start, end, width, 0)
    return m


def grain(a, k=6, seed=9):
    rng = np.random.default_rng(seed)
    return a + rng.normal(0, k, a.shape[:2])[..., None]


def vignette(a, k=0.7):
    h, w = a.shape[:2]
    v = radial((w, h), (w / 2, h / 2), math.hypot(w, h) / 2, (1,), (1 - k,), 2.2)
    return a * v


def save(a, path):
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(path)
    print("->", path)


# ------------------------------------------------------------------ 5 logo
def logo1(path, S=1080):
    """GOLDEN STORY: monogram CK dalam cincin emas bercahaya (gaya mv2 story_glow)."""
    a = radial((S, S), (S / 2, S / 2), S * 0.75, (40, 28, 14), (4, 3, 4), 1.3)
    a = a + rays((S, S), (S / 2, S * 0.48), (255, 200, 110), k=0.45)
    ring = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(ring)
    d.ellipse([S * 0.17, S * 0.17, S * 0.83, S * 0.83], outline=255, width=int(S * 0.018))
    d.ellipse([S * 0.205, S * 0.205, S * 0.795, S * 0.795], outline=150, width=int(S * 0.005))
    a = glow(a, ring, GOLD, S / 40, 1.2)
    a = comp(a, gradient_v((S, S), GOLD_HI, (200, 130, 30), 0.2, 0.8), ring)
    m = mask_text((S, S), "CK", font("PlayfairDisplay-Italic.ttf", int(S * 0.36), 800), (S / 2, S * 0.47))
    a = glow(a, m, (255, 170, 40), S / 30, 1.3)
    a = comp(a, gradient_v((S, S), GOLD_HI, (230, 150, 30), 0.3, 0.62), m)
    t = mask_text((S, S), NAME.upper(), font("Montserrat.ttf", int(S * 0.045), 700), (S / 2, S * 0.69), tracking=0.45)
    a = glow(a, t, GOLD, S / 120, 0.8)
    a = comp(a, (255, 238, 200), t)
    a = a + particles((S, S), 70, (255, 210, 130), seed=2, rmax=4) * 0.8
    save(grain(vignette(a, 0.55), 4), path)


def logo2(path, S=1080):
    """RED THUNDER: wordmark Metal Mania kasar di atas sabetan merah (phonk / hype)."""
    a = np.zeros((S, S, 3), np.float32) + 8
    sl = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(sl)
    for off, wd in ((-0.08, 0.13), (0.14, 0.05)):
        cx = S * (0.5 + off)
        d.polygon([(cx - S * 0.6, S * 1.1), (cx - S * 0.6 + S * wd, S * 1.1), (cx + S * 0.6 + S * wd, -S * 0.1),
                   (cx + S * 0.6, -S * 0.1)], fill=255)
    sl = sl.filter(ImageFilter.GaussianBlur(S / 300))
    a = glow(a, sl, RED, S / 25, 1.0)
    a = comp(a, (200, 20, 28), sl, 0.95)
    lt = lightning((S, S), (S * 0.78, S * 0.05), (S * 0.3, S * 0.95), seed=7, width=S / 170)
    a = glow(a, lt, (255, 120, 110), S / 60, 1.3)
    a = comp(a, (255, 240, 240), lt)
    f = font("MetalMania-Regular.ttf", int(S * 0.2))
    m = mask_text((S, S), NAME, f, (S / 2, S * 0.52))
    sh = mask_text((S, S), NAME, f, (S / 2 + S * 0.008, S * 0.52 + S * 0.012), stroke=int(S / 140))
    a = comp(a, (0, 0, 0), sh.filter(ImageFilter.GaussianBlur(S / 200)), 0.9)
    rng = np.random.default_rng(5)
    grit = Image.fromarray((rng.uniform(0.6, 1.0, (S, S)) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1))
    col = gradient_v((S, S), (255, 255, 255), (175, 175, 175), 0.42, 0.62)
    col = Image.fromarray((arr(col) * (arr(grit) / 255.0)[..., None]).astype(np.uint8))
    a = comp(a, col, m)
    t = mask_text((S, S), "ANIME  MMV  EDITS", font("Anton-Regular.ttf", int(S * 0.05)), (S / 2, S * 0.7), tracking=0.3)
    a = comp(a, (255, 255, 255), t)
    save(grain(vignette(a, 0.6), 7), path)


def logo3(path, S=1080):
    """CLEAN MINIMAL: wordmark Montserrat bertracking lebar + garis emas tipis (aman untuk ukuran kecil)."""
    a = radial((S, S), (S / 2, S * 0.45), S * 0.8, (22, 22, 26), (6, 6, 8), 1.4)
    f = font("Montserrat.ttf", int(S * 0.085), 800)
    m = mask_text((S, S), "CHARIZ", f, (S / 2, S * 0.43), tracking=0.18)
    m2 = mask_text((S, S), "CHKUN", f, (S / 2, S * 0.56), tracking=0.18)
    a = comp(a, (245, 245, 245), m)
    a = glow(a, m2, GOLD, S / 70, 0.9)
    a = comp(a, gradient_v((S, S), GOLD_HI, GOLD, 0.52, 0.6), m2)
    ln = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(ln)
    d.line([(S * 0.3, S * 0.495), (S * 0.7, S * 0.495)], fill=255, width=max(2, int(S / 360)))
    d.line([(S * 0.42, S * 0.65), (S * 0.58, S * 0.65)], fill=200, width=max(2, int(S / 500)))
    a = comp(a, GOLD, ln)
    t = mask_text((S, S), "MANGA  x  ANIME", font("Inter-Medium.otf", int(S * 0.03)), (S / 2, S * 0.7), tracking=0.5)
    a = comp(a, (180, 180, 180), t)
    save(grain(a, 3), path)


def logo4(path, S=1080):
    """FLAME CREST: lencana perisai hitam-merah dengan inisial CK dan api (villain / phonk)."""
    a = radial((S, S), (S / 2, S / 2), S * 0.7, (35, 6, 8), (5, 2, 3), 1.2)
    cx, cy = S / 2, S / 2
    shield = [(cx, cy - S * 0.36), (cx + S * 0.3, cy - S * 0.25), (cx + S * 0.27, cy + S * 0.12), (cx, cy + S * 0.38),
              (cx - S * 0.27, cy + S * 0.12), (cx - S * 0.3, cy - S * 0.25)]
    sm = Image.new("L", (S, S), 0)
    ImageDraw.Draw(sm).polygon(shield, fill=255)
    so = Image.new("L", (S, S), 0)
    ImageDraw.Draw(so).line(shield + [shield[0]], fill=255, width=int(S * 0.016), joint="curve")
    # api di belakang perisai
    rng = np.random.default_rng(11)
    fl = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(fl)
    for i in range(22):
        x = cx + rng.normal(0, S * 0.14)
        h = rng.uniform(0.25, 0.5) * S
        w = rng.uniform(0.04, 0.09) * S
        d.polygon([(x - w, cy + S * 0.05), (x + w, cy + S * 0.05), (x + rng.normal(0, w), cy + S * 0.05 - h)],
                  fill=int(rng.uniform(120, 255)))
    fl = fl.filter(ImageFilter.GaussianBlur(S / 60))
    a = glow(a, fl, (255, 90, 20), S / 40, 1.2)
    a = comp(a, gradient_v((S, S), (255, 220, 90), (230, 40, 20), 0.1, 0.5), fl, 0.8)
    a = comp(a, gradient_v((S, S), (30, 10, 12), (8, 4, 5), 0.15, 0.85), sm)
    a = glow(a, so, RED, S / 50, 1.0)
    a = comp(a, gradient_v((S, S), (255, 120, 100), (170, 10, 20), 0.15, 0.85), so)
    m = mask_text((S, S), "CK", font("Cinzel.ttf", int(S * 0.24), 900), (cx, cy - S * 0.02))
    a = glow(a, m, RED, S / 40, 1.1)
    a = comp(a, gradient_v((S, S), (255, 245, 235), (255, 120, 90), 0.38, 0.58), m)
    t = mask_text((S, S), NAME.upper(), font("Cinzel.ttf", int(S * 0.04), 800), (cx, cy + S * 0.21), tracking=0.25)
    a = comp(a, (240, 210, 200), t)
    save(grain(vignette(a, 0.5), 5), path)


def logo5(path, S=1080):
    """MANGA PANEL: kotak kuning gaya dialog mv2 + screentone + teks komik (mudah dikenali di feed)."""
    a = np.zeros((S, S, 3), np.float32) + np.array([250, 248, 240], np.float32)
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    per = S / 70
    dots = ((np.sin(xx / per * math.pi) * np.sin(yy / per * math.pi)) > 0.55).astype(np.float32)
    shade = np.clip((yy / S - 0.35) * 1.6, 0, 1) * dots
    a = a * (1 - shade[..., None] * 0.85)
    lines = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(lines)
    rng = np.random.default_rng(8)
    for i in range(70):          # garis fokus manga ke tengah
        ang = rng.uniform(0, 2 * math.pi)
        r0 = S * rng.uniform(0.42, 0.55)
        d.line([(S / 2 + math.cos(ang) * r0, S / 2 + math.sin(ang) * r0),
                (S / 2 + math.cos(ang) * S, S / 2 + math.sin(ang) * S)], fill=255, width=int(rng.uniform(2, 7)))
    a = comp(a, INK, lines, 0.9)
    box = Image.new("L", (S, S), 0)
    ImageDraw.Draw(box).rectangle([S * 0.12, S * 0.36, S * 0.88, S * 0.64], fill=255)
    sh = Image.new("L", (S, S), 0)
    ImageDraw.Draw(sh).rectangle([S * 0.14, S * 0.385, S * 0.9, S * 0.665], fill=255)
    a = comp(a, INK, sh)
    a = comp(a, (255, 228, 20), box)
    bd = Image.new("L", (S, S), 0)
    ImageDraw.Draw(bd).rectangle([S * 0.12, S * 0.36, S * 0.88, S * 0.64], outline=255, width=int(S / 120))
    a = comp(a, INK, bd)
    m = mask_text((S, S), NAME.upper(), font("Bangers-Regular.ttf", int(S * 0.13)), (S / 2, S * 0.5), tracking=0.04)
    a = comp(a, INK, m)
    t = mask_text((S, S), "EDITS!", font("Bangers-Regular.ttf", int(S * 0.09)), (S * 0.76, S * 0.24))
    a = comp(a, RED, t)
    save(grain(a, 2), path)


# ------------------------------------------------------------------ banner YouTube
def banner(path, W=2560, H=1440):
    """Banner 2560x1440. Area aman semua perangkat = 1546x423 di tengah: nama + tagline di sana."""
    a = radial((W, H), (W / 2, H * 0.48), W * 0.6, (46, 30, 14), (5, 4, 6), 1.2)
    a = a + rays((W, H), (W / 2, H * 0.2), (255, 205, 120), n=34, k=0.55, seed=3)
    # sabetan merah tipis kiri & kanan (aksen phonk/hype, di luar area aman)
    sl = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(sl)
    for cx, wd in ((W * 0.13, 30), (W * 0.2, 12), (W * 0.86, 26), (W * 0.8, 10)):
        d.polygon([(cx - 300, H), (cx - 300 + wd, H), (cx + 300 + wd, 0), (cx + 300, 0)], fill=255)
    sl = sl.filter(ImageFilter.GaussianBlur(2))
    a = glow(a, sl, RED, 30, 0.9)
    a = comp(a, (205, 25, 30), sl, 0.85)
    lt = lightning((W, H), (W * 0.93, H * 0.02), (W * 0.74, H * 0.98), seed=12, width=7)
    a = glow(a, lt, (200, 210, 255), 24, 1.0)
    a = comp(a, (245, 245, 255), lt)
    lt2 = lightning((W, H), (W * 0.06, H * 0.05), (W * 0.24, H * 0.95), seed=21, width=6)
    a = glow(a, lt2, (200, 210, 255), 22, 0.9)
    a = comp(a, (245, 245, 255), lt2)
    a = a + particles((W, H), 260, (255, 210, 130), seed=6, rmax=6) * 0.8
    # nama
    m = mask_text((W, H), NAME.upper(), font("Montserrat.ttf", 128, 800), (W / 2, H * 0.47), tracking=0.2)
    a = glow(a, m, (255, 170, 40), 36, 1.2)
    a = comp(a, (0, 0, 0), m.filter(ImageFilter.GaussianBlur(8)).transform((W, H), Image.AFFINE, (1, 0, -4, 0, 1, -8)),
             0.8)
    a = comp(a, gradient_v((W, H), GOLD_HI, GOLD, 0.42, 0.51), m)
    ln = Image.new("L", (W, H), 0)
    ImageDraw.Draw(ln).line([(W * 0.36, H * 0.535), (W * 0.64, H * 0.535)], fill=255, width=3)
    a = comp(a, GOLD, ln)
    t = mask_text((W, H), "BLACK CLOVER  MMV   •   MANGA x ANIME   •   2K 60FPS",
                  font("Montserrat.ttf", 34, 600), (W / 2, H * 0.575), tracking=0.16)
    a = comp(a, (235, 225, 205), t)
    t2 = mask_text((W, H), "NEW EDIT EVERY WEEK", font("Montserrat.ttf", 30, 700), (W / 2, H * 0.62), tracking=0.4)
    a = glow(a, t2, RED, 10, 0.7)
    a = comp(a, (255, 90, 80), t2)
    save(grain(vignette(a, 0.5), 4), path)


def banner_guide(src, path, W=2560, H=1440):
    """Salinan banner dengan kotak area aman (TV / desktop / mobile) untuk pengecekan, jangan diupload."""
    im = Image.open(src).convert("RGB")
    d = ImageDraw.Draw(im)
    for (w, h, c, lbl) in ((2560, 1440, (255, 80, 80), "TV 2560x1440"), (2560, 423, (80, 200, 255), "DESKTOP 2560x423"),
                           (1546, 423, (90, 255, 120), "AREA AMAN 1546x423 (semua perangkat)")):
        x0, y0 = (W - w) / 2, (H - h) / 2
        d.rectangle([x0 + 2, y0 + 2, x0 + w - 3, y0 + h - 3], outline=c, width=4)
        d.text((x0 + 14, y0 + 10), lbl, fill=c, font=font("Inter-SemiBold.otf", 30))
    im.save(path)
    print("->", path)


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "out")
    os.makedirs(out, exist_ok=True)
    logo1(os.path.join(out, "logo1_golden_story.png"))
    logo2(os.path.join(out, "logo2_red_thunder.png"))
    logo3(os.path.join(out, "logo3_clean_minimal.png"))
    logo4(os.path.join(out, "logo4_flame_crest.png"))
    logo5(os.path.join(out, "logo5_manga_panel.png"))
    banner(os.path.join(out, "banner_youtube_2560x1440.png"))
    banner_guide(os.path.join(out, "banner_youtube_2560x1440.png"), os.path.join(out, "banner_safe_area_CEK.png"))


if __name__ == "__main__":
    main()
