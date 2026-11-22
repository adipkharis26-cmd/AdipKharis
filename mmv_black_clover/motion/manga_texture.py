"""
manga_texture.py - Mengubah tampilan anime menjadi "panel manga berwarna" seperti referensi @tezxsokun.

Lapisan (diterapkan sekali pada gambar sumber yang sudah di-upscale, jadi tekstur ikut bergerak bersama
gambar seperti tinta di kertas):
  1. cel      : warna dirata-kan (bilateral + posterize lembut) -> blok warna flat khas manga berwarna
  2. ink      : garis tinta dipertegas dengan XDoG (eXtended Difference of Gaussians)
  3. tone     : screentone / halftone titik 45 derajat di area setengah gelap
  4. hatch    : arsiran diagonal tipis di area paling gelap (opsional)
  5. warm     : palet hangat (highlight krem, bayangan coklat-hitam)
Lapisan layar (per frame, di renderer): paper grain, dappled light (bercak cahaya bergerak).
"""
import cv2
import numpy as np

DEFAULT = dict(cel=0.6, levels=5, ink=0.85, ink_sigma=1.1, tone=0.35, tone_period=7.0, tone_lo=0.18, tone_hi=0.62,
               hatch=0.0, warm=0.35)


def _smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def cel_shade(rgb, strength, levels):
    if strength <= 0:
        return rgb
    h, w = rgb.shape[:2]
    k = 1600 / max(h, w)
    small = cv2.resize(rgb, None, fx=k, fy=k, interpolation=cv2.INTER_AREA) if k < 1 else rgb.copy()
    sm = small.astype(np.uint8)
    for _ in range(2):
        sm = cv2.bilateralFilter(sm, 9, 40, 7)
    flat = cv2.resize(sm, (w, h), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    # posterize luminance lembut (jaga hue): blok terang/gelap tegas
    lum = flat.mean(2, keepdims=True) / 255.0 + 1e-4
    q = np.floor(lum * levels) / levels
    frac = lum * levels - np.floor(lum * levels)
    q = q + _smoothstep(0.35, 0.65, frac) / levels
    poster = flat * (q / lum)
    out = rgb * (1 - strength) + (flat * 0.5 + poster * 0.5) * strength
    return out


def xdog(gray, sigma, k=1.6, tau=0.985, eps=-0.02, phi=60.0):
    g1 = cv2.GaussianBlur(gray, (0, 0), sigma)
    g2 = cv2.GaussianBlur(gray, (0, 0), sigma * k)
    d = g1 - tau * g2
    e = np.where(d >= eps, 1.0, 1.0 + np.tanh(phi * (d - eps)))
    return np.clip(e, 0, 1).astype(np.float32)


def ink_lines(rgb, strength, sigma, ps=1.0):
    if strength <= 0:
        return rgb
    gray = rgb.mean(2).astype(np.float32) / 255.0
    scale = ps
    e = xdog(gray, sigma * scale)
    e = cv2.GaussianBlur(e, (0, 0), 0.5 * scale)
    ink = np.array([18, 12, 14], np.float32)
    m = ((1 - e) * strength)[..., None]
    return rgb * (1 - m) + ink * m


def halftone(rgb, strength, period, angle=45.0, lo=0.18, hi=0.62, ps=1.0):
    """Titik screentone di area setengah gelap; titik makin besar di area makin gelap."""
    if strength <= 0:
        return rgb
    h, w = rgb.shape[:2]
    scale = ps
    p = period * scale
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    a = np.radians(angle)
    u = (xx * np.cos(a) - yy * np.sin(a)) * (2 * np.pi / p)
    v = (xx * np.sin(a) + yy * np.cos(a)) * (2 * np.pi / p)
    cell = (np.cos(u) * np.cos(v) + 1) * 0.5           # 1 di pusat titik, 0 di antara titik
    lum = cv2.GaussianBlur(rgb.mean(2) / 255.0, (0, 0), 1.5 * scale)
    dark = 1 - lum
    band = _smoothstep(lo - 0.08, lo + 0.05, dark) * (1 - _smoothstep(hi, hi + 0.15, dark))
    cover = np.clip(dark * 1.1, 0, 1)
    dots = _smoothstep(1 - cover - 0.06, 1 - cover + 0.06, cell)  # titik anti-alias
    m = (dots * band * strength)[..., None]
    return rgb * (1 - m * 0.75)


def hatching(rgb, strength, period=6.0, ps=1.0):
    if strength <= 0:
        return rgb
    h, w = rgb.shape[:2]
    scale = ps
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    lines = (np.sin((xx + yy) * (2 * np.pi / (period * scale))) > 0.55).astype(np.float32)
    lines = cv2.GaussianBlur(lines, (0, 0), 0.6 * scale)
    lum = rgb.mean(2) / 255.0
    m = (lines * _smoothstep(0.72, 0.9, 1 - lum) * strength)[..., None]
    return rgb * (1 - m * 0.6)


def warm_palette(rgb, strength):
    if strength <= 0:
        return rgb
    lum = rgb.mean(2, keepdims=True) / 255.0
    hi = np.array([255, 236, 196], np.float32)    # krem kertas
    lo = np.array([30, 16, 12], np.float32)       # coklat tinta
    tint = lo + (hi - lo) * lum
    out = rgb * (1 - strength * 0.5) + (rgb * tint / 255.0 * 1.15) * strength * 0.5
    return out


def apply(rgb_u8, cfg, ps=1.0):
    """ps = berapa piksel sumber per 1 piksel output (agar ukuran titik/garis konsisten di layar)."""
    c = dict(DEFAULT)
    c.update(cfg or {})
    rgb = rgb_u8.astype(np.float32)
    rgb = cel_shade(rgb, c["cel"], c["levels"])
    rgb = warm_palette(rgb, c["warm"])
    rgb = halftone(rgb, c["tone"], c["tone_period"], lo=c["tone_lo"], hi=c["tone_hi"], ps=ps)
    rgb = hatching(rgb, c["hatch"], ps=ps)
    rgb = ink_lines(rgb, c["ink"], c["ink_sigma"], ps=ps)
    return np.clip(rgb, 0, 255).astype(np.uint8)


# ----------------------------------------------------------- lapisan layar (per frame)
_paper = {}


def paper(size, strength):
    if strength <= 0:
        return None
    if size not in _paper:
        rng = np.random.default_rng(21)
        n = rng.normal(0, 1, (size // 2, size // 2)).astype(np.float32)
        fib = cv2.GaussianBlur(n, (0, 0), 0.7) * 0.6 + cv2.GaussianBlur(n, (0, 0), 6) * 2.5
        fib = cv2.resize(fib, (size, size), interpolation=cv2.INTER_CUBIC)
        _paper[size] = (fib / (fib.std() + 1e-6))[..., None]
    return 1 + _paper[size] * 0.035 * strength


def dappled(size, t, strength, seed=4, color=(255, 236, 190)):
    """Bercak cahaya (gobo daun/jendela) yang bergeser pelan, seperti cahaya yang jatuh di wajah referensi."""
    if strength <= 0:
        return 0
    q = 8
    s = size // q
    rng = np.random.default_rng(seed)
    base = rng.random((10, 10)).astype(np.float32)
    big = cv2.resize(base, (s * 2, s * 2), interpolation=cv2.INTER_CUBIC)
    ox = int((t * 0.04 * s) % s)
    oy = int((t * 0.02 * s) % s)
    m = big[oy:oy + s, ox:ox + s]
    m = _smoothstep(0.58, 0.72, m)
    m = cv2.GaussianBlur(m, (0, 0), 2.0)
    m = cv2.resize(m, (size, size), interpolation=cv2.INTER_CUBIC)
    return m[..., None] * np.array(color, np.float32) / 255.0 * strength
