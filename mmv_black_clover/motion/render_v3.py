#!/usr/bin/env python3
"""
render_v3.py - MMV 2K/60fps: karakter dipotong (roto), di-upscale (Real-ESRGAN), dianimasikan (puppet rig),
lalu dikomposit ke BACKGROUND BARU dengan kamera 2.5D, light wrap, rim light, depth-of-field, kabut,
partikel, transisi whip/glitch, dan tipografi gaya referensi.

  python3 motion/render_v3.py edits/x.py --chars <dir> --bgs <dir> --audio sound.mp3 --out out.mp4 \
      --models <dir> [--size 2048 --fps 60 --workers 4 --only 1,9 --audio-start 0.5]
"""
import argparse
import importlib.util
import math
import os
import subprocess
import sys
from multiprocessing import Pool

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import analyze  # noqa: E402
import engine as E  # noqa: E402
import manga_texture as MT  # noqa: E402
import typo  # noqa: E402
import upscale  # noqa: E402

ARGS = None
EDIT = None
S = 2048
FPS = 60


# ------------------------------------------------------------------ util
def load_edit(path):
    spec = importlib.util.spec_from_file_location("edit", path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def K(t, v, kind="ease"):
    return E.key(t, v, kind)


def affine(src_w, src_h, anchor, pos, span, rot):
    """Tempatkan gambar sumber: titik anchor (0..1 sumber) -> pos (0..1 output); tinggi gambar = span * S."""
    sc = span * S / src_h
    a = math.radians(rot)
    c, s = math.cos(a) * sc, math.sin(a) * sc
    ax, ay = anchor[0] * src_w, anchor[1] * src_h
    tx = pos[0] * S - (c * ax - s * ay)
    ty = pos[1] * S - (s * ax + c * ay)
    return np.array([[c, -s, tx], [s, c, ty], [0, 0, 1]], np.float64)


def camera(zoom, pan, rot, par):
    z = 1 + (zoom - 1) * par
    a = math.radians(rot * par)
    c, s = math.cos(a) * z, math.sin(a) * z
    cx = cy = S / 2
    tx = cx + pan[0] * S * par - (c * cx - s * cy)
    ty = cy + pan[1] * S * par - (s * cx + c * cy)
    return np.array([[c, -s, tx], [s, c, ty], [0, 0, 1]], np.float64)


_GRID = None


def grid():
    global _GRID
    if _GRID is None:
        yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
        _GRID = (xx, yy)
    return _GRID


def src_coords(M):
    Mi = np.linalg.inv(M)
    xx, yy = grid()
    sx = (Mi[0, 0] * xx + Mi[0, 1] * yy + Mi[0, 2]).astype(np.float32)
    sy = (Mi[1, 0] * xx + Mi[1, 1] * yy + Mi[1, 2]).astype(np.float32)
    return sx, sy


def solidify(a, max_hole=0.02):
    """Karakter itu opak: isi lubang kecil/abu-abu di dalam siluet (mis. baju putih yang terbaca transparan)."""
    b = (a > 0.4).astype(np.uint8)
    inv = 1 - b
    n, lab, stats, _ = cv2.connectedComponentsWithStats(inv, connectivity=4)
    h, w = a.shape
    fill = np.zeros_like(b)
    for i in range(1, n):
        x, y, ww, hh, area = stats[i]
        touches = x == 0 or y == 0 or x + ww >= w or y + hh >= h
        if not touches and area < max_hole * h * w:
            fill[lab == i] = 1
    solid = np.maximum(b, fill).astype(np.float32)
    solid = cv2.erode(solid, np.ones((3, 3), np.uint8))
    return np.maximum(a, cv2.GaussianBlur(solid, (0, 0), 1.0))


# ------------------------------------------------------------------ layer
class Layer:
    """Gambar sumber (sudah di-upscale) + alpha + rig deformasi (dihitung di grid kecil)."""

    def __init__(self, cfg, folder, is_char):
        self.cfg = cfg
        path = os.path.join(folder, cfg["img"])
        target = cfg.get("upscale", 2400)
        rgb = upscale.cached(path, os.path.join(ARGS.models, "resr", "models"), target)
        if cfg.get("crop"):
            x0, y0, x1, y1 = cfg["crop"]
            h0, w0 = rgb.shape[:2]
            rgb = rgb[int(y0 * h0):int(y1 * h0), int(x0 * w0):int(x1 * w0)]
        rgb = rgb.astype(np.float32)
        if cfg.get("duotone"):
            g = rgb.mean(2) / 255.0
            g = np.clip((g - 0.04) / 0.92, 0, 1) ** 1.1
            d, l = np.array(cfg.get("dark", (22, 8, 10)), np.float32), np.array(cfg.get("light", (246, 228, 196)), np.float32)
            rgb = d + (l - d) * g[..., None]
        if cfg.get("desat"):
            rgb = rgb * (1 - cfg["desat"]) + rgb.mean(2, keepdims=True) * cfg["desat"]
        self.rgb = np.clip(rgb, 0, 255).astype(np.uint8)
        self.h, self.w = self.rgb.shape[:2]
        # tekstur manga berwarna (sekali di sumber, di-cache ke disk)
        tex = cfg.get("texture", getattr(EDIT, "TEXTURE_CHAR" if is_char else "TEXTURE_BG", None))
        if tex:
            span0 = K(0, cfg.get("span", 1.0 if is_char else 1.15))
            ps = self.h / (span0 * S)            # piksel sumber per piksel output
            import hashlib
            hkey = hashlib.md5((repr(sorted(tex.items())) + "%.3f%d" % (ps, S)).encode()).hexdigest()[:10]
            cache = os.path.splitext(path)[0] + ".tex_%s.png" % hkey
            cached_img = cv2.imread(cache, cv2.IMREAD_COLOR) if os.path.exists(cache) else None
            if cached_img is not None:
                self.rgb = cv2.cvtColor(cached_img, cv2.COLOR_BGR2RGB)
            else:
                self.rgb = MT.apply(self.rgb, tex, ps)
                tmp = cache + ".%d.tmp.png" % os.getpid()      # tulis atomik (aman untuk banyak worker)
                cv2.imwrite(tmp, cv2.cvtColor(self.rgb, cv2.COLOR_RGB2BGR))
                os.replace(tmp, cache)
        self.alpha = None
        mode = cfg.get("alpha", "full") if is_char else "full"
        if mode == "png":            # mv2: transparansi asli PNG (art profil resmi) -> potongan paling bersih
            raw = cv2.imread(path, cv2.IMREAD_UNCHANGED)
            a = cv2.resize(raw[..., 3].astype(np.float32) / 255.0, (self.w, self.h), interpolation=cv2.INTER_CUBIC)
            k = max(1, int(min(self.h, self.w) / 1200))
            a = cv2.GaussianBlur(cv2.erode(a, np.ones((2 * k + 1, 2 * k + 1), np.uint8)), (0, 0), 0.7 * k)
            self.alpha = (np.clip(a, 0, 1) * 255).astype(np.uint8)
        elif mode != "full":
            a = analyze.cached(path, "alpha", analyze.segment, os.path.join(ARGS.models, "isnet-anime.onnx"))
            if cfg.get("crop"):
                x0, y0, x1, y1 = cfg["crop"]
                h0, w0 = a.shape
                a = a[int(y0 * h0):int(y1 * h0), int(x0 * w0):int(x1 * w0)]
            a = cv2.resize(a, (self.w, self.h), interpolation=cv2.INTER_CUBIC)
            if mode == "seg+dark":   # tambahkan bagian gelap (sayap hitam) di area tertentu
                lum = self.rgb.astype(np.float32).mean(2)
                extra = np.zeros_like(a)
                for box in cfg.get("dark_boxes", []):
                    m = E.region(self.h, self.w, ("box",) + tuple(box) + (0.01,))
                    extra = np.maximum(extra, (lum < cfg.get("dark_thr", 55)) * m)
                extra = cv2.morphologyEx(extra.astype(np.float32), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
                extra = cv2.medianBlur((extra * 255).astype(np.uint8), 5).astype(np.float32) / 255
                a = np.maximum(a, extra)
            a = np.clip((a - 0.15) / 0.45, 0, 1)
            a = solidify(a)
            k = max(1, int(min(self.h, self.w) / 900))
            a = cv2.erode(a, np.ones((2 * k + 1, 2 * k + 1), np.uint8))   # buang halo background lama
            a = cv2.GaussianBlur(a, (0, 0), 0.8 * k)
            for box in cfg.get("cut_boxes", []):   # hapus area yang tidak diinginkan
                a *= 1 - E.region(self.h, self.w, ("box",) + tuple(box) + (0.01,))
            self.alpha = (a * 255).astype(np.uint8)
        # rig deformasi di grid kecil
        self.gs = 640 / max(self.h, self.w)
        gh, gw = int(self.h * self.gs), int(self.w * self.gs)
        small_a = cv2.resize(self.alpha, (gw, gh)).astype(np.float32) / 255 if self.alpha is not None else None
        rig_cfg = dict(cfg.get("rig", {}))
        if small_a is None:
            rig_cfg["full_char"] = True
        self.rig = E.Rig(np.zeros((gh, gw, 3), np.float32), small_a, rig_cfg) if (rig_cfg.get("parts")) else None
        self.unit = min(self.h, self.w)

    def displacement_at(self, t, sx, sy, amp=1.0):
        """Medan deformasi (piksel sumber) disampling di koordinat sumber sx, sy."""
        if self.rig is None:
            return None
        dx, dy = self.rig.displacement(t, amp)
        g = self.gs
        mx, my = sx * g, sy * g
        ddx = cv2.remap(dx, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE) / g
        ddy = cv2.remap(dy, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE) / g
        return ddx, ddy

    def point_disp(self, t, x, y):
        if self.rig is None:
            return 0.0, 0.0
        dx, dy = self.rig.displacement(t)
        gx = int(min(dx.shape[1] - 1, max(0, x * self.gs)))
        gy = int(min(dx.shape[0] - 1, max(0, y * self.gs)))
        return dx[gy, gx] / self.gs, dy[gy, gx] / self.gs

    def render(self, M, t, amp=1.0):
        sx, sy = src_coords(M)
        d = self.displacement_at(t, sx, sy, amp)
        if d is not None:
            sx = sx - d[0]
            sy = sy - d[1]
        rgb = cv2.remap(self.rgb, sx, sy, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT).astype(np.float32)
        if self.alpha is None:
            a = np.ones((S, S), np.float32)
        else:
            a = cv2.remap(self.alpha, sx, sy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT).astype(np.float32) / 255
        return rgb, a


# ------------------------------------------------------------------ efek
_VIG = _GRAIN = None


def vignette():
    global _VIG
    if _VIG is None:
        yy, xx = grid()
        r = np.sqrt(((xx - S / 2) / (S / 2)) ** 2 + ((yy - S / 2) / (S / 2)) ** 2)
        _VIG = np.clip(1.12 - 0.42 * r ** 2.4, 0.35, 1)[..., None].astype(np.float32)
    return _VIG


def grain(fr):
    global _GRAIN
    if _GRAIN is None:
        rng = np.random.default_rng(3)
        _GRAIN = [cv2.GaussianBlur(rng.normal(0, 3.0, (S, S)).astype(np.float32), (0, 0), 0.7)[..., None]
                  for _ in range(4)]
    return _GRAIN[(fr // 3) % 4]


def lowres(img, k=4):
    return cv2.resize(img, (S // k, S // k), interpolation=cv2.INTER_AREA)


def up(img):
    return cv2.resize(img, (S, S), interpolation=cv2.INTER_LINEAR)


def grade(img, g, t):
    img = (img - 128) * K(t, g.get("contrast", 1.08)) + 128
    img = img * np.array(g.get("tint", (1.0, 1.0, 1.0)), np.float32) * K(t, g.get("bright", 1.0))
    if g.get("sat") is not None:
        m = img.mean(2, keepdims=True)
        img = m + (img - m) * g["sat"]
    return img


def fog(img, color, strength, t, seed=0):
    """kabut bergerak pelan di bagian bawah/tengah (layer depan background)."""
    if strength <= 0:
        return img
    yy, xx = grid()
    small = (S // 8, S // 8)
    rng = np.random.default_rng(seed)
    base = cv2.resize(rng.random((12, 12)).astype(np.float32), small, interpolation=cv2.INTER_CUBIC)
    ox = int(t * 6) % small[0]
    n = np.roll(base, ox, axis=1)
    n = up(cv2.GaussianBlur(n, (0, 0), 3))
    grad = np.clip((yy / S - 0.35) / 0.65, 0, 1)
    m = (n * 0.6 + 0.4) * grad * strength
    return img * (1 - m[..., None]) + np.array(color, np.float32) * m[..., None]


def light_wrap(char, a, bg, k):
    """Light wrap: cahaya background membungkus tepi karakter -> karakter menyatu dengan bg baru."""
    if k <= 0:
        return char
    bgb = up(cv2.GaussianBlur(lowres(bg), (0, 0), 6))
    inner = 1 - up(cv2.GaussianBlur(lowres(a), (0, 0), 4))
    w = np.clip(inner * a * 2.2, 0, 1)[..., None] * k
    return char * (1 - w) + np.maximum(char, bgb) * w


def rim(a, color, k):
    if k <= 0:
        return 0
    sm = lowres(a, 2)
    er = cv2.erode(sm, np.ones((5, 5), np.uint8))
    edge = cv2.GaussianBlur(np.clip(sm - er, 0, 1), (0, 0), 2.5)
    return cv2.resize(edge, (S, S))[..., None] * np.array(color, np.float32) * k


def back_glow(a, color, k):
    """Aura/glow lembut di belakang siluet karakter."""
    if k <= 0:
        return 0
    g = cv2.GaussianBlur(lowres(a), (0, 0), 14) * 1.4
    return up(g)[..., None] * np.array(color, np.float32) * k


def rays(img, a, center, color, k):
    if k <= 0:
        return img
    q = 4
    small = lowres(img, q)
    asm = lowres(a, q)[..., None]
    lum = small.mean(2, keepdims=True)
    src = np.clip(lum - 110, 0, 255) / 145.0 * (1 - asm)
    cx, cy = center[0] * S / q, center[1] * S / q
    acc = np.zeros_like(src[..., 0])
    n = 16
    for i in range(n):
        sc = 1 + i * 0.05
        M = np.array([[sc, 0, cx - sc * cx], [0, sc, cy - sc * cy]], np.float32)
        acc += cv2.warpAffine(src[..., 0], M, (S // q, S // q)) * (1 - i / n)
    r = up(cv2.GaussianBlur(acc, (0, 0), 1.5))[..., None] / n * 2.4
    return img + r * np.array(color, np.float32) * k


def bloom(img, thr, k):
    if k <= 0:
        return img
    sm = lowres(img)
    hi = np.clip(sm - thr, 0, None) * 2.0
    b = cv2.GaussianBlur(hi, (0, 0), 6) + cv2.GaussianBlur(hi, (0, 0), 18) * 0.6
    return img + up(b) * k


def sharpen(img, amt):
    if amt <= 0:
        return img
    return img + (img - cv2.GaussianBlur(img, (0, 0), 1.4)) * amt


def eye_glow(img, pts, color, inten, rad):
    if inten <= 0 or not pts:
        return img
    q = 2
    layer = np.zeros((S // q, S // q, 3), np.float32)
    for (x, y) in pts:
        p = (int(x / q), int(y / q))
        r = max(2, int(rad / q))
        cv2.circle(layer, p, max(1, int(r * 0.35)), (255, 255, 255), -1, cv2.LINE_AA)
        cv2.circle(layer, p, r, tuple(float(c) for c in color), -1, cv2.LINE_AA)
        cv2.ellipse(layer, p, (int(r * 4), max(1, int(r * 0.22))), 0, 0, 360, tuple(float(c) * 0.55 for c in color), -1,
                    cv2.LINE_AA)
    g = cv2.GaussianBlur(layer, (0, 0), rad / q * 0.6) * 1.2 + cv2.GaussianBlur(layer, (0, 0), rad / q * 2.2) * 0.9
    return img + cv2.resize(g, (S, S)) * inten


class Particles:
    def __init__(self, n=50, seed=11):
        r = np.random.default_rng(seed)
        self.x, self.y = r.uniform(0, 1, n), r.uniform(0, 1.2, n)
        self.layer = r.choice([0, 1, 2], n, p=[0.5, 0.35, 0.15])
        self.ph, self.sp = r.uniform(0, 6.3, n), r.uniform(0.6, 1.4, n)

    def render(self, t, color, k, kind="embers"):
        """Partikel per sihir: embers/snow (titik bercahaya), fire (bara api), bubbles (gelembung),
        petals/leaves (kelopak bunga/daun buram berputar -> dikembalikan sebagai (rgb, alpha))."""
        if kind in ("petals", "leaves"):
            return self._petals(t, color, k, kind)
        if kind == "bubbles":
            return self._bubbles(t, color, k)
        if kind == "fire":
            return self._fire(t, color, k)
        q = 2
        outs = [np.zeros((S // q, S // q, 3), np.float32) for _ in range(3)]
        size = [1.6, 2.8, 7.0]
        vel = [0.03, 0.055, 0.11]
        for i in range(len(self.x)):
            L = self.layer[i]
            if kind == "snow":
                y = (self.y[i] + vel[L] * 0.8 * self.sp[i] * t) % 1.2 - 0.1
            else:
                y = (self.y[i] - vel[L] * self.sp[i] * t) % 1.2 - 0.1
            x = self.x[i] + 0.016 * math.sin(t * 0.9 * self.sp[i] + self.ph[i])
            fl = 0.75 + 0.25 * math.sin(t * 3.0 + self.ph[i])
            cv2.circle(outs[L], (int(x * S / q), int(y * S / q)), max(1, int(size[L] * S / 2048 * 2 / q * 2)),
                       tuple(float(c) * fl for c in color), -1, cv2.LINE_AA)
        res = outs[0] + cv2.GaussianBlur(outs[1], (0, 0), 1.0) * 1.2 + cv2.GaussianBlur(outs[2], (0, 0), 5) * 2.2
        res = res + cv2.GaussianBlur(res, (0, 0), 5) * 1.4
        return cv2.resize(res, (S, S)) * k


    def _petals(self, t, color, k, kind):
        q = 2
        rgb = np.zeros((S // q, S // q, 3), np.float32)
        al = np.zeros((S // q, S // q), np.float32)
        cols = color if isinstance(color[0], (list, tuple)) else [color]
        n = min(len(self.x), 34)
        for i in range(n):
            L = self.layer[i]
            sp = self.sp[i]
            y = (self.y[i] + (0.05 + 0.04 * L) * sp * t) % 1.2 - 0.1
            x = (self.x[i] + 0.03 * t * sp + 0.03 * math.sin(t * 1.1 * sp + self.ph[i])) % 1.1 - 0.05
            ang = (self.ph[i] * 57 + t * 90 * sp) % 360
            flip = abs(math.cos(t * 2.0 * sp + self.ph[i]))           # kelopak berputar 3D
            size = [22, 34, 62][L] * S / 2048
            ax_, ay_ = int(size), max(1, int(size * (0.35 + 0.4 * flip) * (0.55 if kind == "leaves" else 0.7)))
            c = np.array(cols[i % len(cols)], np.float32) * (0.75 + 0.25 * flip)
            m = np.zeros_like(al)
            cv2.ellipse(m, (int(x * S / q), int(y * S / q)), (max(1, ax_ // q * 2 // 2), max(1, ay_ // q * 2 // 2)),
                        ang, 0, 360, 1.0, -1, cv2.LINE_AA)
            if L == 2:
                m = cv2.GaussianBlur(m, (0, 0), 3)            # kelopak depan: bokeh
            a = m * (0.85 if L < 2 else 0.6)
            rgb = rgb * (1 - a[..., None]) + c * a[..., None]
            al = np.maximum(al, a)
        return cv2.resize(rgb, (S, S)), cv2.resize(al * k, (S, S))[..., None]

    def _bubbles(self, t, color, k):
        q = 2
        out = np.zeros((S // q, S // q, 3), np.float32)
        for i in range(min(len(self.x), 30)):
            L = self.layer[i]
            y = (self.y[i] - (0.04 + 0.03 * L) * self.sp[i] * t) % 1.2 - 0.1
            x = self.x[i] + 0.02 * math.sin(t * 1.6 * self.sp[i] + self.ph[i])
            r = int([6, 10, 18][L] * S / 2048 * (0.8 + 0.4 * self.sp[i]))
            c = (int(x * S / q), int(y * S / q))
            cv2.circle(out, c, max(2, r), tuple(float(v) * 0.8 for v in color), max(1, r // 5), cv2.LINE_AA)
            cv2.circle(out, (c[0] - r // 3, c[1] - r // 3), max(1, r // 4), (255, 255, 255), -1, cv2.LINE_AA)
        out = out + cv2.GaussianBlur(out, (0, 0), 3) * 0.8
        return cv2.resize(out, (S, S)) * k

    def _fire(self, t, color, k):
        q = 2
        out = np.zeros((S // q, S // q, 3), np.float32)
        for j in range(2):                              # 2x lebih banyak bara, naik cepat & berkedip
            for i in range(len(self.x)):
                L = self.layer[i]
                ph = self.ph[i] + j * 2.1
                y = ((self.y[i] + j * 0.5) - (0.09 + 0.06 * L) * self.sp[i] * t) % 1.2 - 0.1
                x = (self.x[i] + j * 0.37) % 1.0 + 0.02 * math.sin(t * 3 * self.sp[i] + ph)
                fl = 0.55 + 0.45 * abs(math.sin(t * 9 * self.sp[i] + ph))
                r = max(1, int([2, 3.5, 8][L] * S / 2048 * 2 / q * fl * 1.3))
                hot = np.array([255, 230, 150], np.float32) * (1 - fl) + np.array(color, np.float32) * fl
                cv2.circle(out, (int(x * S / q), int(y * S / q)), r, tuple(float(v) * fl for v in hot), -1, cv2.LINE_AA)
        out = out + cv2.GaussianBlur(out, (0, 0), 4) * 1.6
        return cv2.resize(out, (S, S)) * k


# ------------------------------------------------------------------ efek sihir khas karakter
def magic_circle(center, radius, color, t, k, speed=18.0):
    """Lingkaran segel (Sealing Magic Secre): cincin ganda, rune, bintang, berputar pelan."""
    if k <= 0:
        return 0
    q = 2
    L = np.zeros((S // q, S // q), np.float32)
    cx, cy, R = center[0] * S / q, center[1] * S / q, radius * S / q
    rot = t * speed
    for rr, th in ((1.0, 3), (0.9, 2), (0.62, 2), (0.55, 1)):
        cv2.circle(L, (int(cx), int(cy)), int(R * rr), 1.0, th, cv2.LINE_AA)
    for i in range(48):                                  # rune / tick di antara cincin
        a = math.radians(rot + i * 7.5)
        r0, r1 = R * (0.91 if i % 3 else 0.86), R * 0.99
        cv2.line(L, (int(cx + r0 * math.cos(a)), int(cy + r0 * math.sin(a))),
                 (int(cx + r1 * math.cos(a)), int(cy + r1 * math.sin(a))), 1.0, 2, cv2.LINE_AA)
    pts = []
    for i in range(6):                                   # bintang segel berputar berlawanan
        a = math.radians(-rot * 1.4 + i * 60)
        pts.append((int(cx + R * 0.6 * math.cos(a)), int(cy + R * 0.6 * math.sin(a))))
    for i in range(6):
        cv2.line(L, pts[i], pts[(i + 2) % 6], 1.0, 2, cv2.LINE_AA)
    L = L + cv2.GaussianBlur(L, (0, 0), 6) * 1.5
    return cv2.resize(L, (S, S))[..., None] * np.array(color, np.float32) * k


def red_threads(t, color, k, n=4, seed=3):
    """Benang merah takdir (Thread Magic Vanessa): kurva bercahaya melayang pelan."""
    if k <= 0:
        return 0
    q = 2
    L = np.zeros((S // q, S // q), np.float32)
    rng = np.random.default_rng(seed)
    for j in range(n):
        y0, a0, f0, ph = rng.uniform(0.15, 0.85), rng.uniform(0.05, 0.12), rng.uniform(1.5, 3.0), rng.uniform(0, 6)
        pts = []
        for xi in np.linspace(-0.05, 1.05, 60):
            y = y0 + a0 * math.sin(f0 * xi * 3.1 + ph + t * 0.9) + 0.03 * math.sin(xi * 9 + t * 1.7 + j)
            pts.append((int(xi * S / q), int(y * S / q)))
        cv2.polylines(L, [np.array(pts, np.int32)], False, 1.0, 2, cv2.LINE_AA)
    L = L + cv2.GaussianBlur(L, (0, 0), 4) * 1.8
    return cv2.resize(L, (S, S))[..., None] * np.array(color, np.float32) * k


def blade_glint(p0, p1, t0, dur, lt, k):
    """Kilatan cahaya menyapu bilah pedang dari p0 ke p1 (koordinat frame 0..1)."""
    ph = (lt - t0) / dur
    if not (0 <= ph <= 1) or k <= 0:
        return 0
    q = 2
    L = np.zeros((S // q, S // q), np.float32)
    x = p0[0] + (p1[0] - p0[0]) * ph
    y = p0[1] + (p1[1] - p0[1]) * ph
    dx, dy = (p1[0] - p0[0]) * 0.06, (p1[1] - p0[1]) * 0.06
    cv2.line(L, (int((x - dx) * S / q), int((y - dy) * S / q)), (int((x + dx) * S / q), int((y + dy) * S / q)),
             1.0, 3, cv2.LINE_AA)
    c = (int(x * S / q), int(y * S / q))
    r = int(S / q * 0.03)
    cv2.line(L, (c[0] - r, c[1]), (c[0] + r, c[1]), 1.0, 1, cv2.LINE_AA)   # bintang kilau
    cv2.line(L, (c[0], c[1] - r), (c[0], c[1] + r), 1.0, 1, cv2.LINE_AA)
    L = L + cv2.GaussianBlur(L, (0, 0), 3) * 2 + cv2.GaussianBlur(L, (0, 0), 10) * 1.5
    env = math.sin(ph * math.pi)
    return cv2.resize(L, (S, S))[..., None] * 255.0 * k * env


# ------------------------------------------------------------------ akting wajah (kedip, wink, sayu, blush)
def lid_amount(lt, blink):
    """0 = mata terbuka, 1 = tertutup. Kedip: tutup cepat, tahan sebentar, buka lebih pelan."""
    base = K(lt, blink.get("droop", 0.0))       # kelopak sayu (mis. Dorothy mengantuk)
    dur = blink.get("dur", 0.16)
    f = 0.0
    for b in blink.get("times", []):
        bt, who = (b, None) if not isinstance(b, (list, tuple)) else (b[0], b[1])
        ph = (lt - bt) / dur
        if 0 <= ph < 1:
            v = ph / 0.35 if ph < 0.35 else (1.0 if ph < 0.5 else 1 - (ph - 0.5) / 0.5)
            f = max(f, v * v * (3 - 2 * v)) if who is None else f
    return base, f


def _eye_out(ch, Mc, lt, x, y):
    sx, sy = x * ch.w, y * ch.h
    dx, dy = ch.point_disp(lt, sx, sy)
    q = Mc @ np.array([sx + dx, sy + dy, 1.0])
    return q[0], q[1]


def face_acting(img, fx, ch, Mc, lt):
    if not fx.get("blink") and not fx.get("blush"):
        return img
    sc = math.hypot(Mc[0, 0], Mc[1, 0])
    ang = math.degrees(math.atan2(Mc[1, 0], Mc[0, 0]))
    if fx.get("blush"):
        pts, col, inten = fx["blush"]
        a = K(lt, inten)
        if a > 0:
            layer = np.zeros((S // 2, S // 2), np.float32)
            for (x, y, rx, ry) in pts:
                cx, cy = _eye_out(ch, Mc, lt, x, y)
                cv2.ellipse(layer, (int(cx / 2), int(cy / 2)),
                            (max(1, int(rx * ch.w * sc / 2)), max(1, int(ry * ch.h * sc / 2))), ang, 0, 360, 1.0, -1,
                            cv2.LINE_AA)
            r = max(2.0, float(np.mean([p[2] for p in pts])) * ch.w * sc / 2 * 0.45)
            m = cv2.resize(cv2.GaussianBlur(layer, (0, 0), r), (S, S))[..., None] * a
            tint = np.array(col, np.float32)
            img = img * (1 - m * 0.55) + (img * tint / 255.0) * m * 0.55
    bl = fx.get("blink")
    if bl:
        base, f = lid_amount(lt, bl)
        for i, (x, y, rx, ry) in enumerate(bl["eyes"]):
            fi = f
            for b in bl.get("times", []):         # wink: kedip hanya mata tertentu
                if isinstance(b, (list, tuple)) and i in b[1]:
                    ph = (lt - b[0]) / bl.get("dur", 0.16)
                    if 0 <= ph < 1:
                        v = ph / 0.35 if ph < 0.35 else (1.0 if ph < 0.5 else 1 - (ph - 0.5) / 0.5)
                        fi = max(fi, v * v * (3 - 2 * v))
            amt = min(1.0, base + (1 - base) * fi)
            if amt <= 0.02:
                continue
            cx, cy = _eye_out(ch, Mc, lt, x, y)
            ax = rx * ch.w * sc * bl.get("grow", 1.15)
            ay = ry * ch.h * sc * bl.get("grow", 1.15) * 1.1
            pad = int(ax * 1.6 + 8)
            x0, y0 = int(max(0, cx - pad)), int(max(0, cy - pad))
            x1, y1 = int(min(S, cx + pad)), int(min(S, cy + pad + ay * 3))
            if x1 <= x0 or y1 <= y0:
                continue
            roi = img[y0:y1, x0:x1]
            # warna kulit: median cincin di sekitar mata (kiri, kanan, bawah), abaikan piksel gelap (tinta/rambut)
            ring = []
            for ox, oy in ((-1.5, 0.3), (1.5, 0.3), (0.0, 1.9), (-0.8, 1.6), (0.8, 1.6)):
                px_, py_ = int(cx + ox * ax), int(cy + oy * ay)
                if 0 <= px_ < S and 0 <= py_ < S:
                    pp = img[max(0, py_ - 2):py_ + 3, max(0, px_ - 2):px_ + 3].reshape(-1, 3)
                    ring.append(pp)
            ring = np.concatenate(ring) if ring else np.zeros((0, 3), np.float32)
            ring = ring[ring.mean(1) > np.percentile(ring.mean(1), 40)] if len(ring) > 4 else ring
            skin = np.median(ring, 0) if len(ring) else np.array([235, 205, 180], np.float32)
            skin = np.array(bl.get("skin", skin), np.float32)
            lc = (cx - x0, cy - y0)
            eye_m = np.zeros(roi.shape[:2], np.float32)
            cv2.ellipse(eye_m, (int(lc[0]), int(lc[1])), (int(ax), int(ay)), ang, 0, 360, 1.0, -1, cv2.LINE_AA)
            eye_m = cv2.GaussianBlur(eye_m, (0, 0), max(1.0, ay * 0.35))
            eye_m = np.clip(eye_m * 1.6, 0, 1)
            lid_y = lc[1] - ay + 2 * ay * amt
            yy = np.arange(roi.shape[0], dtype=np.float32)[:, None]
            cover = np.clip((lid_y - yy) / 1.5 + 0.5, 0, 1) * eye_m
            cover = cover[..., None]
            roi = roi * (1 - cover) + skin * cover
            # garis kelopak tertutup: lengkung tipis hitam + bulu mata di ujung luar
            line = np.zeros(roi.shape[:2], np.float32)
            th = max(2, int(ay * (0.16 + 0.12 * amt)))
            side = bl.get("outer", [1, -1])[i] if i < len(bl.get("outer", [1, -1])) else 1
            if amt > 0.85 and bl.get("style", "flat") == "happy":
                cv2.ellipse(line, (int(lc[0]), int(lid_y - ay * 0.45)), (int(ax * 0.9), int(ay * 0.65)), ang, 200, 340,
                            1.0, th, cv2.LINE_AA)   # mata tertutup senang (^ ^)
            else:
                half = ax * math.sqrt(max(0.0, 1 - ((lid_y - lc[1]) / ay) ** 2)) if amt < 0.98 else ax * 0.92
                half = max(half, ax * 0.5)
                sag = ay * 0.35 * amt
                pts = [(lc[0] + k * half, lid_y + sag * (1 - k * k)) for k in np.linspace(-1, 1, 17)]
                cv2.polylines(line, [np.array(pts, np.int32)], False, 1.0, th, cv2.LINE_AA)
                if amt > 0.7:   # bulu mata kecil di ujung luar
                    ex, ey = pts[-1] if side > 0 else pts[0]
                    cv2.line(line, (int(ex), int(ey)), (int(ex + side * ax * 0.18), int(ey + ay * 0.35)), 1.0,
                             max(1, th - 1), cv2.LINE_AA)
            line = cv2.GaussianBlur(line, (0, 0), 0.5)[..., None]
            ink = np.array(bl.get("ink", (8, 5, 6)), np.float32)
            roi = roi * (1 - line) + ink * line
            img[y0:y1, x0:x1] = roi
    return img


# ------------------------------------------------------------------ grade akhir per style
_post_noise = {}


def post_style(frame, P, fr):
    if not P:
        return frame
    f = frame
    if P.get("bloom"):
        f = bloom(f, P.get("bloom_thr", 185), P["bloom"])
    lum = np.clip(f.mean(2, keepdims=True) / 255.0, 0, 1)
    if P.get("mono"):
        r, g, b = f[..., 0:1], f[..., 1:2], f[..., 2:3]
        redness = np.clip((r - np.maximum(g, b)) / 90.0 - 0.25, 0, 1) * P.get("keep_red", 0.0)
        paper = np.array(P.get("paper_tint", (245, 240, 230)), np.float32) / 255.0
        gray = lum * 255.0 * paper
        m = P["mono"] * (1 - redness)
        f = f * (1 - m) + gray * m
        lum = np.clip(f.mean(2, keepdims=True) / 255.0, 0, 1)
    if P.get("duo"):
        d, mcol, l = (np.array(c, np.float32) for c in P["duo"])
        t = lum
        lo = d + (mcol - d) * np.clip(t * 2, 0, 1)
        hi = mcol + (l - mcol) * np.clip(t * 2 - 1, 0, 1)
        g = np.where(t < 0.5, lo, hi)
        f = f * (1 - P.get("duo_k", 1.0)) + g * P.get("duo_k", 1.0)
    if P.get("split"):
        sh, hi = (np.array(c, np.float32) for c in P["split"])
        tint = sh * (1 - lum) + hi * lum
        k = P.get("split_k", 0.3)
        f = f * (1 - k) + (f * tint / 160.0) * k
    if P.get("sat") is not None:
        m_ = f.mean(2, keepdims=True)
        f = m_ + (f - m_) * P["sat"]
    if P.get("contrast"):
        f = (f - 128) * P["contrast"] + 128
    if P.get("gamma"):
        f = 255.0 * np.clip(f / 255.0, 0, 1) ** P["gamma"]
    if P.get("highlight_roll"):   # tekan highlight agar tidak gosong
        k = P["highlight_roll"]
        x = np.clip(f / 255.0, 0, None)
        f = 255.0 * (x * (1 - k) + (1 - np.exp(-x * 1.6)) / (1 - math.exp(-1.6)) * k)
    if P.get("lift"):
        f = f * (1 - P["lift"] / 255.0) + P["lift"]
    if P.get("scanlines"):
        rows = ((np.arange(S) // max(1, S // 540)) % 2).astype(np.float32)[:, None, None]
        f = f * (1 - rows * P["scanlines"])
    if P.get("chroma"):
        k = int(P["chroma"] * S / 1080)
        f[..., 0] = np.roll(f[..., 0], k, axis=1)
        f[..., 2] = np.roll(f[..., 2], -k, axis=1)
    if P.get("orton"):            # mv2: glow lembut seluruh frame (Orton) - tampilan anime 3D bercahaya referensi
        sm = lowres(np.clip(f, 0, 255), 4)
        soft = up(cv2.GaussianBlur(sm, (0, 0), 6)) ** 1.0
        scr = 255 - (255 - f) * (255 - soft) / 255.0
        f = f * (1 - P["orton"]) + scr * P["orton"]
    if P.get("godrays"):          # mv2: sinar cahaya volumetrik dari sumber cahaya (jendela) di layar
        (lx, ly), k = P["godrays"][0], P["godrays"][1]
        sm = lowres(np.clip(f, 0, 255), 4)
        hi = np.clip(sm - 170, 0, None) * 2.0
        h = S // 4
        acc = np.zeros_like(hi)
        for i in range(10):
            sc = 1 + 0.06 * i
            M = np.float32([[sc, 0, lx * h * (1 - sc)], [0, sc, ly * h * (1 - sc)]])
            acc += cv2.warpAffine(hi, M, (h, h), borderMode=cv2.BORDER_CONSTANT) * (1 - i / 10)
        f = f + up(cv2.GaussianBlur(acc / 5.5, (0, 0), 2)) * np.array(P.get("godray_color", (255, 220, 160)),
                                                                     np.float32) / 255.0 * k
    if P.get("vignette"):         # mv2: vignette dalam (sudut hampir hitam)
        yy, xx = grid()
        r = np.sqrt(((xx - S / 2) / (S / 2)) ** 2 + ((yy - S / 2) / (S / 2)) ** 2) / 1.42
        f = f * (1 - P["vignette"] * np.clip((r - 0.35) / 0.65, 0, 1) ** 1.6)[..., None]
    if P.get("grain"):
        key = (S, int(P["grain"] * 10))
        if key not in _post_noise:
            rng = np.random.default_rng(9)
            _post_noise[key] = [rng.normal(0, P["grain"], (S, S, 1)).astype(np.float32) for _ in range(3)]
        f = f + _post_noise[key][(fr // 2) % 3]
    return f


_fl_cache = {}


def focus_lines(img, k, seed):
    """Garis fokus manga (集中線) dari tepi ke tengah, muncul saat hentakan."""
    key = (S, seed % 5)
    if key not in _fl_cache:
        rng = np.random.default_rng(seed % 5)
        q = 2
        L = np.zeros((S // q, S // q), np.float32)
        c = S // q / 2
        for _ in range(160):
            a = rng.uniform(0, 2 * math.pi)
            r0 = rng.uniform(0.42, 0.6) * S / q
            w = rng.uniform(0.004, 0.012)
            p1 = (c + math.cos(a) * r0, c + math.sin(a) * r0)
            p2 = (c + math.cos(a - w) * S, c + math.sin(a - w) * S)
            p3 = (c + math.cos(a + w) * S, c + math.sin(a + w) * S)
            cv2.fillConvexPoly(L, np.array([p1, p2, p3], np.int32), 1.0, cv2.LINE_AA)
        _fl_cache[key] = cv2.resize(L, (S, S))[..., None]
    m = _fl_cache[key] * min(1.0, k)
    return img * (1 - m * 0.85) + np.array([250, 245, 235], np.float32) * m * 0.85


# ------------------------------------------------------------------ transisi
def whip(img, strength, direction=1):
    if strength <= 0:
        return img
    L = int(6 + 60 * strength)
    sm = lowres(img, 2)
    kern = np.zeros((1, L), np.float32)
    kern[0, :] = 1.0 / L
    b = cv2.filter2D(sm, -1, kern)
    b = np.roll(b, int(direction * strength * S * 0.06 / 2), axis=1)
    return up(b) * strength + img * (1 - strength)


def glitch(img, strength, seed):
    if strength <= 0:
        return img
    rng = np.random.default_rng(seed)
    out = img.copy()
    n = int(6 + 10 * strength)
    for _ in range(n):
        y0 = int(rng.uniform(0, S))
        h = int(rng.uniform(8, 90) * S / 1080)
        dx = int(rng.uniform(-1, 1) * 90 * strength * S / 1080)
        out[y0:y0 + h] = np.roll(img[y0:y0 + h], dx, axis=1)
    k = int(10 * strength * S / 1080)
    out[..., 0] = np.roll(out[..., 0], k, axis=1)
    out[..., 2] = np.roll(out[..., 2], -k, axis=1)
    return out


def zoom_blur(img, strength):
    """Radial zoom blur (zoom-in transition AE: CC Radial Fast Blur + scale)."""
    if strength <= 0:
        return img
    sm = lowres(img, 2)
    h = S // 2
    acc = np.zeros_like(sm)
    n = 8
    for i in range(n):
        sc = 1 + strength * 0.35 * i / n
        M = np.float32([[sc, 0, h / 2 - sc * h / 2], [0, sc, h / 2 - sc * h / 2]])
        acc += cv2.warpAffine(sm, M, (h, h), borderMode=cv2.BORDER_REFLECT)
    b = up(acc / n)
    sc = 1 + 0.15 * strength
    M = np.float32([[sc, 0, S / 2 - sc * S / 2], [0, sc, S / 2 - sc * S / 2]])
    b = cv2.warpAffine(b, M, (S, S), borderMode=cv2.BORDER_REFLECT)
    return b * strength + img * (1 - strength)


def spin(img, strength, direction=1):
    """Spin transition: rotasi + blur rotasi."""
    if strength <= 0:
        return img
    sm = lowres(img, 2)
    h = S // 2
    acc = np.zeros_like(sm)
    n = 7
    for i in range(n):
        ang = direction * strength * 40 * (i / n)
        M = cv2.getRotationMatrix2D((h / 2, h / 2), ang, 1 + 0.25 * strength)
        acc += cv2.warpAffine(sm, M, (h, h), borderMode=cv2.BORDER_REFLECT)
    return up(acc / n) * strength + img * (1 - strength)


def flash_t(img, strength, color=(255, 255, 255)):
    return img * (1 - strength) + np.array(color, np.float32) * strength


_ink_noise = {}


def ink_wipe(img, strength, seed=2):
    """Ink bleed: tinta hitam menyebar dari tepi (villain / manga)."""
    if strength <= 0:
        return img
    if S not in _ink_noise:
        rng = np.random.default_rng(seed)
        n = cv2.resize(rng.random((16, 16)).astype(np.float32), (S, S), interpolation=cv2.INTER_CUBIC)
        n2 = cv2.resize(rng.random((64, 64)).astype(np.float32), (S, S), interpolation=cv2.INTER_CUBIC)
        yy, xx = grid()
        r = np.sqrt(((xx - S / 2) / (S / 2)) ** 2 + ((yy - S / 2) / (S / 2)) ** 2) / 1.42
        _ink_noise[S] = (1 - r) * 0.6 + n * 0.3 + n2 * 0.1
    f = _ink_noise[S]
    thr = 1 - strength * 1.15
    m = np.clip((thr - f) / 0.03 + 0.5, 0, 1)[..., None]
    return img * (1 - m) + np.array([6, 4, 6], np.float32) * m


def light_leak(img, strength, t):
    """Light leak hangat bergerak (soft / cinematic)."""
    if strength <= 0:
        return img
    yy, xx = grid()
    cx = S * (0.2 + 0.6 * ((t * 0.7) % 1))
    g = np.exp(-(((xx - cx) / (S * 0.45)) ** 2 + ((yy - S * 0.3) / (S * 0.6)) ** 2))[..., None]
    col = np.array([255, 170, 110], np.float32)
    return img + g * col * strength * 1.3


def defocus(img, strength):
    if strength <= 0:
        return img
    return up(cv2.GaussianBlur(lowres(img, 2), (0, 0), 1 + 14 * strength)) * strength + img * (1 - strength)


def tilt3d(img, ang):
    """Perspektif 3D: putar bidang gambar (ax = angguk/pitch, ay = toleh/yaw, derajat) + overscan agar tepi aman."""
    ax, ay = (ang, 0.0) if not isinstance(ang, (tuple, list, np.ndarray)) else (ang[0], ang[1])
    if abs(ax) < 1e-3 and abs(ay) < 1e-3:
        return img
    f = S * 1.6
    rx, ry = math.radians(ax), math.radians(ay)
    R = np.array([[math.cos(ry), 0, math.sin(ry)], [0, 1, 0], [-math.sin(ry), 0, math.cos(ry)]]) @ \
        np.array([[1, 0, 0], [0, math.cos(rx), -math.sin(rx)], [0, math.sin(rx), math.cos(rx)]])
    over = 1.0 + 0.012 * (abs(ax) + abs(ay))
    src = np.float32([[0, 0], [S, 0], [S, S], [0, S]])
    dst = []
    for x, y in src:
        p = R @ np.array([(x - S / 2) * over, (y - S / 2) * over, 0.0])
        z = f + p[2]
        dst.append((S / 2 + p[0] * f / z, S / 2 + p[1] * f / z))
    H = cv2.getPerspectiveTransform(src, np.float32(dst))
    return cv2.warpPerspective(img, H, (S, S), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def shake_cut(img, strength, fr):
    if strength <= 0:
        return img
    rng = np.random.default_rng(fr)
    dx, dy = rng.uniform(-1, 1, 2) * S * 0.04 * strength
    M = np.float32([[1 + 0.08 * strength, 0, dx - 0.04 * strength * S], [0, 1 + 0.08 * strength, dy - 0.04 * strength * S]])
    return cv2.warpAffine(img, M, (S, S), borderMode=cv2.BORDER_REFLECT)


# ---- mv2: transisi gaya referensi "marjukanak" (storytelling: overexposure, dip gelap, rack focus, sabetan, kilat)
def burn(img, strength):
    """Overexposure putih: highlight meledak dulu lalu seluruh frame putih + blur (cahaya jendela menyilaukan)."""
    if strength <= 0:
        return img
    s_ = strength * strength * (3 - 2 * strength)
    sm = lowres(img, 2)
    lum = sm.mean(2, keepdims=True) / 255.0
    glow = cv2.GaussianBlur(np.clip(lum - (1 - s_) * 0.75, 0, 1)[..., 0], (0, 0), 6 + 30 * s_)[..., None]
    b = cv2.GaussianBlur(sm, (0, 0), 0.5 + 10 * s_) * (1 + 1.6 * s_) + glow * 255 * 2.2 * s_
    w = np.clip((s_ - 0.55) / 0.45, 0, 1)
    b = b * (1 - w) + np.array([255, 250, 240], np.float32) * w
    return up(b) * min(1.0, s_ * 1.6) + img * (1 - min(1.0, s_ * 1.6))


def dark_focus(img, strength):
    """Dip gelap: vignette menutup dari tepi + fokus kabur (adegan memudar ke hitam lalu muncul lagi)."""
    if strength <= 0:
        return img
    s_ = strength * strength * (3 - 2 * strength)
    yy, xx = grid()
    r = np.sqrt(((xx - S / 2) / (S / 2)) ** 2 + ((yy - S / 2) / (S / 2)) ** 2) / 1.42
    m = np.clip((r - (1 - s_) * 1.05) / 0.35, 0, 1)[..., None]
    img = defocus(img, s_ * 0.8)
    return img * (1 - m) * (1 - 0.85 * s_ ** 2)


def rack_focus(img, strength):
    """Rack focus: gambar mulai buram dan sedikit membesar lalu menajam (lensa mencari fokus)."""
    if strength <= 0:
        return img
    s_ = strength * strength
    sc = 1 + 0.06 * s_
    M = np.float32([[sc, 0, S / 2 - sc * S / 2], [0, sc, S / 2 - sc * S / 2]])
    img = cv2.warpAffine(img, M, (S, S), borderMode=cv2.BORDER_REFLECT)
    return defocus(img, s_) * (1 + 0.25 * s_)


_SLASH = {}


def slash(img, strength, color=(235, 20, 25), seed=4):
    """Sabetan merah diagonal: 2-3 goresan menyilang dengan motion blur + layar ternoda merah."""
    if strength <= 0:
        return img
    if S not in _SLASH:
        yy, xx = grid()
        rng = np.random.default_rng(seed)
        ms = []
        for ang, off, w in ((-38, -0.1, 0.10), (34, 0.12, 0.07), (-30, 0.28, 0.05)):
            a_ = math.radians(ang)
            d = ((xx - S / 2) * math.sin(a_) + (yy - S / 2) * math.cos(a_)) / S - off
            n = cv2.resize(rng.random((8, 64)).astype(np.float32), (S, S))
            ms.append(np.clip(1 - np.abs(d) / (w * (0.6 + 0.6 * n)), 0, 1) ** 1.5)
        _SLASH[S] = ms
    s_ = strength
    col = np.array(color, np.float32)
    out = whip(img, s_ * 0.7, 1)
    out = out * (1 - 0.55 * s_) + out * np.array([1.4, 0.25, 0.2], np.float32) * 0.55 * s_
    for i, m in enumerate(_SLASH[S]):
        k = np.clip(s_ * 1.6 - i * 0.25, 0, 1)
        out = out * (1 - m[..., None] * k) + (col * (1 - 0.4 * m[..., None]) + 255 * 0.4 * m[..., None]) * m[..., None] * k
    return out


def lightning(img, strength, fr, seed=9):
    """Kilat/petir putih: layar gelap, retakan petir bercabang + garis cahaya radial berkedip."""
    if strength <= 0:
        return img
    rng = np.random.default_rng(seed + fr // 3)
    h = S // 2
    canvas = np.zeros((h, h), np.float32)

    def bolt(p, ang, length, w, depth):
        for _ in range(int(length / (h * 0.03))):
            ang += rng.uniform(-0.6, 0.6)
            q = (p[0] + math.cos(ang) * h * 0.03, p[1] + math.sin(ang) * h * 0.03)
            cv2.line(canvas, (int(p[0]), int(p[1])), (int(q[0]), int(q[1])), 1.0, max(1, int(w)), cv2.LINE_AA)
            if depth < 2 and rng.random() < 0.12:
                bolt(q, ang + rng.choice([-1, 1]) * rng.uniform(0.5, 1.0), length * 0.4, w * 0.6, depth + 1)
            p = q
    c = (h * rng.uniform(0.4, 0.6), h * rng.uniform(0.4, 0.6))
    for i in range(5):
        bolt(c, rng.uniform(0, 6.283), h * rng.uniform(0.5, 0.9), 3 * S / 1080 + 1, 0)
    for i in range(int(4 + 6 * strength)):          # garis cahaya radial (speed streaks)
        a_ = rng.uniform(0, 6.283)
        cv2.line(canvas, (int(c[0]), int(c[1])), (int(c[0] + math.cos(a_) * h), int(c[1] + math.sin(a_) * h)),
                 0.5, 1, cv2.LINE_AA)
    glow = cv2.GaussianBlur(canvas, (0, 0), 6) * 2.5 + cv2.GaussianBlur(canvas, (0, 0), 1.2)
    glow = up(np.clip(glow, 0, 2))[..., None]
    flick = 0.75 + 0.25 * math.sin(fr * 2.7)
    base = defocus(img, strength * 0.6) * (1 - 0.8 * strength)
    tint = np.array([235, 240, 255], np.float32)
    return base + glow * tint * strength * flick


def apply_transition(frame, kind, st, fr, t, direction=1):
    if kind == "burn":
        return burn(frame, st)
    if kind == "dark_focus":
        return dark_focus(frame, st)
    if kind == "rack":
        return rack_focus(frame, st)
    if kind == "slash":
        return slash(frame, st)
    if kind == "lightning":
        return lightning(frame, st, fr)
    if kind == "whip":
        return whip(frame, st, direction)
    if kind == "glitch":
        return glitch(frame, st, fr)
    if kind == "zoom":
        return zoom_blur(frame, st)
    if kind == "spin":
        return spin(frame, st, direction)
    if kind == "flash":
        return flash_t(frame, st * 0.9)
    if kind == "flash_red":
        return flash_t(frame, st * 0.85, (220, 20, 30))
    if kind == "white_dip":
        return flash_t(frame, st * 0.7, (255, 245, 250))
    if kind == "black_dip":
        return flash_t(frame, st, (0, 0, 0))
    if kind == "ink":
        return ink_wipe(frame, st)
    if kind == "leak":
        return light_leak(frame, st, t)
    if kind == "defocus":
        return defocus(frame, st)
    if kind == "shake":
        return shake_cut(frame, st, fr)
    if kind == "rgb":
        k = int(24 * st * S / 1080)
        f = frame.copy()
        f[..., 0] = np.roll(f[..., 0], k, axis=1)
        f[..., 2] = np.roll(f[..., 2], -k, axis=1)
        return f
    return frame


# ------------------------------------------------------------------ frame
_layers = {}
_particles = None


def get_layer(idx, which):
    key = (idx, which)
    if key not in _layers:
        if len(_layers) > 6:
            _layers.pop(next(iter(_layers)))
        s = EDIT.SHOTS[idx]
        folder = ARGS.chars if which == "char" else ARGS.bgs
        _layers[key] = Layer(s[which], folder, which == "char")
    return _layers[key]


_prev_cache = {}


def render_frame(job, raw=False):
    global _particles
    fr, t, idx = job
    s = EDIT.SHOTS[idx]
    lt = t - s["t0"]
    dur = s["t1"] - s["t0"]
    if _particles is None:
        _particles = Particles()
    if not s.get("char"):
        frame = np.zeros((S, S, 3), np.float32)
    else:
        cam = s.get("cam", {})
        zoom = K(lt, cam.get("zoom", [(0, 1.0), (dur, 1.06)]), cam.get("ease", "ease"))
        pan = K(lt, cam.get("pan", (0.0, 0.0)), cam.get("ease", "ease"))
        rot = K(lt, cam.get("rot", 0.0), cam.get("ease", "ease"))
        hh = cam.get("handheld", 0.005)
        pan = (pan[0] + hh * E.smooth_noise(t, 1, 0.6), pan[1] + hh * E.smooth_noise(t, 2, 0.55))
        rot = rot + hh * 35 * E.smooth_noise(t, 3, 0.4)
        imp = 0.0
        for ht in s.get("hits", []):
            d = lt - ht
            if 0 <= d < 0.5:
                imp = max(imp, math.exp(-d * 9))
        if imp:
            G = getattr(EDIT, "GENRE", None)
            k = s.get("shake", 0.008) * imp * (G.SHAKE_K if G else 1.0)
            pan = (pan[0] + k * E.smooth_noise(t, 7, 22), pan[1] + k * E.smooth_noise(t, 8, 19))
            zoom *= 1 + s.get("punch", 0.03) * imp * (G.PUNCH_K if G else 1.0)
        C = s["char"]
        ch = get_layer(idx, "char")
        ea = C.get("ease_act", "ease")

        def char_M(tt):
            return camera(zoom, pan, rot, 1.0) @ affine(ch.w, ch.h, K(tt, C.get("anchor", (0.5, 0.5))),
                                                        K(tt, C.get("pos", (0.5, 0.5)), ea),
                                                        K(tt, C.get("span", 1.0), ea), K(tt, C.get("rot", 0.0), ea))
        Mc = char_M(lt)
        crgb, ca = ch.render(Mc, lt, 1.0 + 0.5 * imp)
        echo_layers = []
        if s.get("echo", getattr(getattr(EDIT, "GENRE", None), "ECHO", False)) and imp > 0.15 and ch.alpha is not None:
            for k_, dt in ((0.45, 0.06), (0.25, 0.12)):          # Echo AE: jejak posisi sebelumnya
                er, ea_ = ch.render(char_M(max(0.0, lt - dt)), lt)
                echo_layers.append((er, ea_ * k_ * imp))
        crgb = grade(crgb, C.get("grade", {}), lt)
        crgb = face_acting(crgb, s.get("fx", {}), ch, Mc, lt)
        if s.get("bg"):
            B = s["bg"]
            bl = get_layer(idx, "bg")
            par = B.get("parallax", 0.45)
            Mb = camera(zoom, pan, rot, par) @ affine(bl.w, bl.h, K(lt, B.get("anchor", (0.5, 0.5))),
                                                      K(lt, B.get("pos", (0.5, 0.5))), K(lt, B.get("span", 1.15)),
                                                      K(lt, B.get("rot", 0.0)))
            brgb, _ = bl.render(Mb, lt)
            if B.get("blur", 0) > 0:
                brgb = up(cv2.GaussianBlur(lowres(brgb, 2), (0, 0), B["blur"])) if B["blur"] > 1.5 else \
                    cv2.GaussianBlur(brgb, (0, 0), B["blur"] * 2)
            brgb = grade(brgb, B.get("grade", {}), lt)
            if B.get("fog"):
                brgb = fog(brgb, B["fog"][0], K(lt, B["fog"][1]), t, idx)
            fx = s.get("fx", {})
            if fx.get("circle"):
                c_ = fx["circle"]
                brgb = brgb + magic_circle(c_[0], c_[1], c_[2], lt, K(lt, c_[3]))
            if fx.get("back_glow"):
                osc = fx.get("aura_osc", (0.0, 1.0))
                brgb = brgb + back_glow(ca, fx["back_glow"][0], K(lt, fx["back_glow"][1]) *
                                        (1 + osc[0] * math.sin(lt * osc[1] * 6.283) +
                                         osc[0] * 0.5 * math.sin(lt * osc[1] * 15.7)))
            if fx.get("rays"):
                brgb = rays(brgb, ca, fx["rays"][0], fx["rays"][1], K(lt, fx["rays"][2]) * (1 + imp))
            if fx.get("shadow", 0.35) > 0:   # bayangan lembut di belakang karakter (kedalaman)
                sh = up(cv2.GaussianBlur(lowres(ca), (0, 0), 10))
                brgb = brgb * (1 - sh[..., None] * fx.get("shadow", 0.35))
            fl = fx.get("focus_lines", getattr(getattr(EDIT, "GENRE", None), "FOCUS_LINES", 0.0))
            if fl and imp > 0.05:
                brgb = focus_lines(brgb, fl * imp, idx)
            for er, ea_ in echo_layers:
                er = grade(er, C.get("grade", {}), lt)
                brgb = brgb * (1 - ea_[..., None]) + er * ea_[..., None]
            crgb = light_wrap(crgb, ca, brgb, fx.get("wrap", 0.35))
            dap = s.get("dappled", getattr(EDIT, "DAPPLED", 0.0))
            if dap:
                crgb = crgb + crgb * MT.dappled(S, t, dap, seed=idx) * ca[..., None]
            a3 = ca[..., None]
            frame = brgb * (1 - a3) + crgb * a3
            if fx.get("rim"):
                osc = fx.get("aura_osc", (0.0, 1.0))
                frame = frame + rim(ca, fx["rim"][0], K(lt, fx["rim"][1]) * (1 + osc[0] * math.sin(lt * osc[1] * 6.283)))
        else:
            frame = crgb
            fx = s.get("fx", {})
            if fx.get("rays"):
                frame = rays(frame, np.zeros((S, S), np.float32), fx["rays"][0], fx["rays"][1], K(lt, fx["rays"][2]))
        g = s.get("grade", {})
        frame = grade(frame, g, lt)
        frame = sharpen(frame, g.get("sharpen", 0.5))
        if fx.get("eyes"):
            pts, col, inten, rad = fx["eyes"]
            P = []
            for (x, y) in pts:
                sx, sy = x * ch.w, y * ch.h
                dx, dy = ch.point_disp(lt, sx, sy)
                q = Mc @ np.array([sx + dx, sy + dy, 1.0])
                P.append((q[0], q[1]))
            scale = math.hypot(Mc[0, 0], Mc[1, 0]) * ch.h / 1000.0
            frame = eye_glow(frame, P, col, K(lt, inten) * (1 + 0.07 * math.sin(lt * 5)), rad * scale)
        frame = bloom(frame, g.get("bloom_thr", 190), K(lt, g.get("bloom", 0.4)) * (1 + imp))
        if fx.get("threads"):
            frame = frame + red_threads(t, fx["threads"][0], K(lt, fx["threads"][1]))
        if fx.get("glint"):
            g_ = fx["glint"]
            frame = frame + blade_glint(g_[0], g_[1], g_[2], g_[3], lt, g_[4])
        if s.get("particles", True):
            p = s.get("particles_cfg", (EDIT.PARTICLE_COLOR, 0.55, "embers"))
            pr = _particles.render(t, p[0], p[1], p[2])
            if isinstance(pr, tuple):
                frame = frame * (1 - pr[1]) + pr[0] * pr[1]
            else:
                frame = frame + pr
        G = getattr(EDIT, "GENRE", None)
        fl_col = np.array(G.FLASH_COLOR if G else (255, 255, 255), np.float32)
        fl_k = G.FLASH_K if G else 0.75
        for ht in s.get("flash", []):
            d = lt - ht
            if 0 <= d < 0.05 and fl_k > 0:
                a = (1 - d / 0.05) * fl_k
                frame = frame * (1 - a) + fl_col * a
    # mv2: kamera 3D tilt (perspektif miring seperti kamera 2.5D referensi) + fokus lensa yang dikeyframe
    if s.get("tilt") is not None:
        frame = tilt3d(frame, K(lt, s["tilt"], "ease"))
    if s.get("dof") is not None:
        frame = defocus(frame, max(0.0, min(1.0, K(lt, s["dof"], "out"))))
    frame = post_style(frame, getattr(EDIT, "POST", None), fr)
    pp = MT.paper(S, getattr(EDIT, "PAPER", 0.0))
    if pp is not None:
        frame = frame * pp
    frame = frame * vignette() + grain(fr)
    if raw:
        return frame
    # transisi masuk/keluar
    tr = s.get("trans_in")
    if tr and lt < tr[1]:
        st = 1 - lt / tr[1]
        if tr[0] == "ghost" and idx > 0:            # double exposure: adegan sebelumnya memudar di atas
            if idx not in _prev_cache:
                _prev_cache.clear()
                p = EDIT.SHOTS[idx - 1]
                _prev_cache[idx] = render_frame((fr, max(p["t0"], p["t1"] - 1.0 / FPS), idx - 1), raw=True)
            prev = _prev_cache[idx]
            a = st * st * (3 - 2 * st)
            frame = frame * (1 - a * 0.6) + np.maximum(frame, prev) * a * 0.6
            frame = frame * (1 - a * 0.35) + prev * a * 0.35
        else:
            frame = apply_transition(frame, tr[0], st, fr, t, -1)
    tr = s.get("trans_out")
    if tr and dur - lt < tr[1]:
        st = 1 - (dur - lt) / tr[1]
        frame = apply_transition(frame, tr[0], st, fr, t, 1)
    for g0, g1 in s.get("gate", []):
        if g0 <= t < g1:
            frame = frame * 0.15
    G = getattr(EDIT, "GENRE", None)
    for tx in s.get("text", []):
        t0 = tx.get("at", 0.0)
        if tx["kind"] == "dialog":
            if t0 <= lt < tx.get("until", 99):
                frame = typo.dialog(frame, tx["text"], lt - t0, tx, until=tx.get("until", dur) - t0)
            continue
        if G and tx["kind"] == "title" and t0 <= lt < tx.get("until", 99):
            T = dict(G.TITLE_END if tx.get("style") == "episode" or idx == len(EDIT.SHOTS) - 1 else G.TITLE)
            T.update(tx.get("T", {}))
            frame = typo.genre_title(frame, tx.get("label", ""), tx["name"], T, lt - max(0.0, t0), seed=idx)
            continue
        if t0 <= lt < tx.get("until", 99):
            ap = (lt - t0) / 0.2
            pop = max(0.0, 1 - (lt - t0) / 0.25) if tx.get("pop") else 0.0
            if tx["kind"] == "title":
                tcol = getattr(EDIT, "TEXT", {}).get("color", tx.get("color", (255, 60, 40))) \
                    if tx.get("style", "name") == "name" else tx.get("color", (255, 60, 40))
                frame = typo.title(frame, tx.get("label", ""), tx["name"], tcol, ap,
                                   tx.get("y", 0.83), tx.get("style", "name"), pop)
            else:
                frame = typo.subtitle(frame, tx["text"], ap, tx.get("y", 0.885))
    if G or getattr(EDIT, "WM", None):
        frame = typo.genre_watermark(frame, getattr(EDIT, "WATERMARK", ""), G.WM if G else EDIT.WM, t)
    else:
        frame = typo.watermark(frame, getattr(EDIT, "WATERMARK", ""))
    return np.clip(frame, 0, 255).astype(np.uint8).tobytes()


def apply_style(edit, name):
    """Timpa tampilan edit dengan preset style di edits/styles/<name>.py (tekstur, kertas, cahaya, grade akhir)."""
    if not name:
        return
    path = os.path.join(os.path.dirname(os.path.abspath(args_edit_path(edit))), "styles", name + ".py")
    st = load_edit(path)
    for k in ("TEXTURE_CHAR", "TEXTURE_BG", "DAPPLED", "PAPER", "POST", "TEXT"):
        if hasattr(st, k):
            setattr(edit, k, getattr(st, k))
    edit.STYLE_NAME = name


def args_edit_path(edit):
    return getattr(edit, "__file__", ARGS.edit)


def apply_genre(edit, name):
    """Genre pack (edits/genres/<name>.py): style visual + font/teks + watermark + set transisi + energi kamera.
    Transisi diberikan bergiliran ke setiap cut (tidak ada dua cut berurutan dengan transisi sama)."""
    if not name:
        return
    path = os.path.join(os.path.dirname(os.path.abspath(args_edit_path(edit))), "genres", name + ".py")
    G = load_edit(path)
    edit.GENRE = G
    apply_style(edit, G.STYLE)
    if getattr(G, "PARTICLES", None):
        edit.PARTICLE_COLOR = G.PARTICLES[0]
    seq = list(G.TRANSITIONS)
    j = 0
    for i, s in enumerate(edit.SHOTS):
        if i == 0:
            s.pop("trans_in", None)                 # hook: frame pertama langsung bersih
            continue
        dur = s["t1"] - s["t0"]
        kind, d = seq[j % len(seq)]
        j += 1
        s["trans_in"] = (kind, min(d, dur * 0.45))
        s.pop("trans_out", None)
        if getattr(G, "PARTICLES", None) and s.get("particles_cfg") is None and s.get("particles", True):
            s["particles_cfg"] = G.PARTICLES
        if G.FLASH_K <= 0:
            s["flash"] = []


# ------------------------------------------------------------------ mode sutradara: akting tubuh (keyframe rigid)
ACTING = {
    # nama: fungsi(dur, pos, span) -> (pos_keys, span_keys, rot_keys, ease)
    "push_in": lambda d, p, s: ([(0, p), (d, (p[0], p[1] - 0.02))], [(0, s * 0.94), (d, s * 1.06)], 0.0, "out"),
    "rise":    lambda d, p, s: ([(0, (p[0], p[1] + 0.09)), (d * 0.6, (p[0], p[1] - 0.005)), (d, p)], s, 0.0, "out"),
    "slide_l": lambda d, p, s: ([(0, (p[0] - 0.16, p[1])), (d * 0.55, (p[0] + 0.008, p[1])), (d, p)],
                                [(0, s * 1.02), (d, s)], [(0, -2.5), (d * 0.55, 0.4), (d, 0.0)], "out"),
    "slide_r": lambda d, p, s: ([(0, (p[0] + 0.16, p[1])), (d * 0.55, (p[0] - 0.008, p[1])), (d, p)],
                                [(0, s * 1.02), (d, s)], [(0, 2.5), (d * 0.55, -0.4), (d, 0.0)], "out"),
    "lean":    lambda d, p, s: ([(0, p), (d, (p[0] + 0.015, p[1] + 0.01))], [(0, s), (d, s * 1.03)],
                                [(0, 0.0), (d, -3.0)], "ease"),
    "reach":   lambda d, p, s: ([(0, p), (d * 0.35, (p[0], p[1] + 0.03)), (d, (p[0], p[1] + 0.04))],
                                [(0, s * 0.9), (d * 0.35, s * 1.18), (d, s * 1.22)], 0.0, "out"),
    "float":   lambda d, p, s: ([(0, (p[0], p[1] + 0.02)), (d * 0.5, (p[0], p[1] - 0.015)), (d, (p[0], p[1] + 0.01))],
                                [(0, s), (d, s * 1.04)], [(0, -0.8), (d, 0.8)], "ease"),
    "turn":    lambda d, p, s: ([(0, (p[0] + 0.05, p[1])), (d, (p[0] - 0.03, p[1]))], [(0, s * 1.05), (d, s)],
                                [(0, 2.0), (d, -1.5)], "ease"),
    "recoil":  lambda d, p, s: ([(0, (p[0], p[1] - 0.02)), (d * 0.25, (p[0], p[1] + 0.015)), (d, p)],
                                [(0, s * 1.12), (d * 0.25, s * 0.97), (d, s * 1.02)], [(0, 1.5), (d * 0.25, -1.0), (d, 0.0)],
                                "out"),
}


def cutout_ok(path):
    """Putuskan apakah gambar cocok dipotong (hapus bg) atau lebih baik dipakai utuh (mode gelombang).
    Tidak cocok bila: karakter terpotong tepi gambar, gambar didominasi karakter/bingkai sampul,
    atau penuh efek cahaya (sayap/aura bercahaya -> tepi potongan kotor)."""
    a = analyze.cached(path, "alpha", analyze.segment, os.path.join(ARGS.models, "isnet-anime.onnx"))
    img = cv2.imread(path, cv2.IMREAD_COLOR)
    a = cv2.resize(a, (img.shape[1], img.shape[0]))
    b = (a > 0.5).astype(np.float32)
    border = np.concatenate([b[0], b[-1], b[:, 0], b[:, -1]]).mean()
    cov = b.mean()
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    glow = (((hsv[..., 2] > 200) & (hsv[..., 1] > 90)) * b).sum() / max(1.0, b.sum())
    fire = ((hsv[..., 2] > 210) & (hsv[..., 1] > 110)).mean()          # efek cahaya/api di seluruh gambar
    s_ = cv2.resize(img, (128, 128))
    gray = (s_.max(2).astype(np.float32) - s_.min(2)).mean() < 14      # panel manga hitam-putih
    # kebersihan potongan: siluet utuh (1 bagian), tidak terpotong tepi gambar, tepi tegas (bukan abu-abu)
    n_, lab, st, _ = cv2.connectedComponentsWithStats(b.astype(np.uint8), 8)
    areas = sorted(st[1:, 4], reverse=True) if n_ > 1 else [0]
    main = areas[0] / max(1, sum(areas))
    soft = float(((a > 0.1) & (a < 0.9)).sum()) / max(1.0, float(b.sum()))
    ok = (border <= 0.02 and main >= 0.97 and soft <= 0.4 and cov <= 0.55 and glow <= 0.22 and fire <= 0.2
          and not gray)
    return ok, dict(border=round(float(border), 3), cov=round(float(cov), 2), glow=round(float(glow), 2),
                    fire=round(float(fire), 2), manga=bool(gray), main=round(main, 3), soft=round(soft, 2))


def check_repeats(edit):
    seen = {}
    for i, s in enumerate(edit.SHOTS):
        if s.get("char"):
            seen.setdefault(s["char"]["img"], []).append(i + 1)
    last = edit.SHOTS[-1].get("char", {}).get("img")
    first = edit.SHOTS[0].get("char", {}).get("img")
    for img, ix in seen.items():
        if len(ix) > 1 and not (img == first == last and len(ix) == 2):
            print("PERINGATAN adegan berulang: %s di shot %s" % (img, ix), flush=True)


def auto_mode(edit):
    for i, s in enumerate(edit.SHOTS):
        C = s.get("char")
        if not C or C.get("alpha") != "auto":
            continue
        path = os.path.join(ARGS.chars, C["img"])
        ok, m = cutout_ok(path)
        if ok:
            C["alpha"] = "seg"
            continue
        # mode utuh: tanpa bg baru, gambar menutup frame, akting jadi gerak kamera halus + gelombang
        h, w = cv2.imread(path, cv2.IMREAD_GRAYSCALE).shape
        ax, ay = C.get("anchor", (0.5, 0.5))
        ax, ay = min(max(ax, 0.2), 0.8), min(max(ay, 0.2), 0.8)
        cover = max(h / (2 * min(ax, 1 - ax) * w), 1 / (2 * min(ay, 1 - ay))) * 1.06
        sp = C.get("span", 1.0)
        sp = sp[0][1] if isinstance(sp, (list, tuple)) else sp
        base = max(cover, sp if sp < cover * 1.6 else cover)
        dur = s["t1"] - s["t0"]
        act_ = C.pop("acting", "push_in")
        rot = {"turn": [(0, 1.2), (dur, -0.8)], "lean": [(0, 0.0), (dur, -1.2)], "float": [(0, -0.6), (dur, 0.6)]}
        C.update(alpha="full", anchor=(ax, ay), pos=(0.5, 0.5),
                 span=[(0, base * (1.10 if act_ in ("reach", "recoil") else 1.0)),
                       (dur, base * (1.0 if act_ in ("reach", "recoil") else 1.10))],
                 rot=rot.get(act_, 0.0), ease_act="out")
        C["rig"] = dict(parts=[dict(type="wind", region=("box", 0, 0, 1, 1), amp=0.005, freq=1.0, k=6.0, edge=False,
                                    dir=(1.0, 0.35)),
                               dict(type="breathe", region=("box", 0, 0.25, 1, 1), osc=(0.004, 0.55),
                                    pivot=(0.5, 1.0))])
        s.pop("bg", None)
        fx = s.setdefault("fx", {})
        for k in ("rays", "back_glow", "rim", "aura_osc"):   # efek siluet tidak berlaku untuk gambar utuh
            fx.pop(k, None)
        g = s.setdefault("grade", {})
        if m["glow"] > 0.2 or m.get("fire", 0) > 0.2:         # gambar penuh cahaya/api: jaga highlight tidak gosong
            g.update(bloom=0.06, bloom_thr=240, bright=0.8, contrast=1.15)
        else:
            g.setdefault("bloom", 0.2)
        if s.get("particles_cfg") and s["particles_cfg"][2] in ("embers",) and m["glow"] > 0.2:
            s["particles_cfg"] = (s["particles_cfg"][0], 0.25, "embers")
        if __name__ == "__main__" and not getattr(ARGS, "_quiet", False):
            print("shot %d: %s -> UTUH (gelombang) %s" % (i + 1, C["img"], m), flush=True)


def expand_acting(edit):
    for s in edit.SHOTS:
        C = s.get("char")
        if not C or not C.get("acting"):
            continue
        dur = s["t1"] - s["t0"]
        p = C.get("pos", (0.5, 0.5))
        sp = C.get("span", 1.0)
        sp = sp[0][1] if isinstance(sp, (list, tuple)) else sp
        pk, sk, rk, ease = ACTING[C["acting"]](dur, p, sp)
        C["pos"], C["span"], C["rot"] = pk, sk, rk
        C["ease_act"] = ease


def init(args):
    global ARGS, EDIT, S, FPS
    ARGS = args
    EDIT = load_edit(args.edit)
    apply_style(EDIT, getattr(args, "style", ""))
    apply_genre(EDIT, getattr(args, "genre", ""))
    auto_mode(EDIT)
    if __name__ == "__main__":
        check_repeats(EDIT)
    expand_acting(EDIT)
    if getattr(args, "no_wm", False):
        EDIT.WATERMARK = ""
    S = args.size
    FPS = args.fps
    typo.S = S
    cv2.setNumThreads(1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("edit")
    ap.add_argument("--chars", required=True)
    ap.add_argument("--bgs", required=True)
    ap.add_argument("--audio", required=True)
    ap.add_argument("--audio-start", type=float, default=0.0)
    ap.add_argument("--out", required=True)
    ap.add_argument("--models", default="models")
    ap.add_argument("--size", type=int, default=2048)
    ap.add_argument("--fps", type=int, default=60)
    ap.add_argument("--workers", type=int, default=os.cpu_count() or 4)
    ap.add_argument("--only", default="")
    ap.add_argument("--prepare", action="store_true", help="hanya upscale + roto (cache), tanpa render")
    ap.add_argument("--stills", default="", help="preview: daftar detik, mis. 0.5,3,9.2 -> PNG + contact sheet")
    ap.add_argument("--no-wm", action="store_true", help="tanpa watermark (untuk frame thumbnail)")
    ap.add_argument("--genre", default="", help="genre pack di edits/genres: mmv, phonk, soft, villain, hyper")
    ap.add_argument("--style", default="", help="preset di edits/styles: manga_color, ink_mono, neon_night, "
                                               "cinematic, pastel_dream, red_phonk")
    a = ap.parse_args()
    init(a)
    only = {int(x) for x in a.only.split(",") if x.strip()}
    shots = EDIT.SHOTS
    # siapkan cache upscale/roto sekali (agar worker tidak mengulang)
    for i, s in enumerate(shots):
        if only and i + 1 not in only:
            continue
        for which in ("char", "bg"):
            if s.get(which):
                folder = a.chars if which == "char" else a.bgs
                p = os.path.join(folder, s[which]["img"])
                upscale.cached(p, os.path.join(a.models, "resr", "models"), s[which].get("upscale", 2400))
                if which == "char" and s[which].get("alpha", "full") != "full":
                    analyze.cached(p, "alpha", analyze.segment, os.path.join(a.models, "isnet-anime.onnx"))
        print("siap shot %d" % (i + 1), flush=True)
    if a.prepare:
        return
    if a.stills:
        ts = [float(x) for x in a.stills.split(",")]
        jobs = []
        for t in ts:
            idx = next((i for i, s in enumerate(shots) if s["t0"] <= t < s["t1"]), len(shots) - 1)
            jobs.append((int(round(t * FPS)), t, idx))
        with Pool(a.workers, initializer=init, initargs=(a,)) as pool:
            frames = pool.map(render_frame, jobs, chunksize=1)
        base = os.path.splitext(a.out)[0]
        tiles = []
        for (fr, t, idx), buf in zip(jobs, frames):
            img = np.frombuffer(buf, np.uint8).reshape(S, S, 3)
            cv2.imwrite("%s_%05.2f.png" % (base, t), cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
            th = cv2.resize(img, (512, 512), interpolation=cv2.INTER_AREA)
            cv2.putText(th, "%.2fs  shot %d" % (t, idx + 1), (10, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
            tiles.append(th)
        cols = min(4, len(tiles))
        while len(tiles) % cols:
            tiles.append(np.zeros_like(tiles[0]))
        rows = [np.hstack(tiles[i:i + cols]) for i in range(0, len(tiles), cols)]
        cv2.imwrite(base + "_sheet.jpg", cv2.cvtColor(np.vstack(rows), cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 90])
        print("->", base + "_sheet.jpg")
        return
    end = shots[-1]["t1"]
    n = int(round(end * FPS))
    jobs = []
    for fr in range(n):
        t = fr / FPS
        idx = next((i for i, s in enumerate(shots) if s["t0"] <= t < s["t1"]), len(shots) - 1)
        if only and idx + 1 not in only:
            continue
        jobs.append((fr, t, idx))
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "%dx%d" % (S, S),
           "-r", str(FPS), "-i", "-"]
    if not only:
        cmd += ["-ss", str(a.audio_start), "-i", a.audio, "-t", "%.3f" % end, "-map", "0:v", "-map", "1:a",
                "-c:a", "aac", "-b:a", "320k"]
    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "15", "-pix_fmt", "yuv420p", "-profile:v", "high",
            "-movflags", "+faststart", a.out]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    with Pool(a.workers, initializer=init, initargs=(a,)) as pool:
        for j, buf in enumerate(pool.imap(render_frame, jobs, chunksize=6)):
            proc.stdin.write(buf)
            if j % 60 == 0:
                print("frame %d/%d" % (j, len(jobs)), flush=True)
    proc.stdin.close()
    proc.wait()
    print("->", a.out)


if __name__ == "__main__":
    main()
