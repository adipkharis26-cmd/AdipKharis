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
            if os.path.exists(cache):
                self.rgb = cv2.cvtColor(cv2.imread(cache, cv2.IMREAD_COLOR), cv2.COLOR_BGR2RGB)
            else:
                self.rgb = MT.apply(self.rgb, tex, ps)
                cv2.imwrite(cache, cv2.cvtColor(self.rgb, cv2.COLOR_RGB2BGR))
        self.alpha = None
        mode = cfg.get("alpha", "full") if is_char else "full"
        if mode != "full":
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


def render_frame(job):
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
            k = s.get("shake", 0.008) * imp
            pan = (pan[0] + k * E.smooth_noise(t, 7, 22), pan[1] + k * E.smooth_noise(t, 8, 19))
            zoom *= 1 + s.get("punch", 0.03) * imp
        C = s["char"]
        ch = get_layer(idx, "char")
        Mc = camera(zoom, pan, rot, 1.0) @ affine(ch.w, ch.h, K(lt, C.get("anchor", (0.5, 0.5))),
                                                 K(lt, C.get("pos", (0.5, 0.5))), K(lt, C.get("span", 1.0)),
                                                 K(lt, C.get("rot", 0.0)))
        crgb, ca = ch.render(Mc, lt, 1.0 + 0.5 * imp)
        crgb = grade(crgb, C.get("grade", {}), lt)
        crgb = face_acting(crgb, s.get("fx", {}), ch, Mc, lt)
        if s.get("bg"):
            B = s["bg"]
            bl = get_layer(idx, "bg")
            par = B.get("parallax", 0.45)
            Mb = camera(zoom, pan, rot, par) @ affine(bl.w, bl.h, K(lt, B.get("anchor", (0.5, 0.5))),
                                                      K(lt, B.get("pos", (0.5, 0.5))), K(lt, B.get("span", 1.15)),
                                                      0.0)
            brgb, _ = bl.render(Mb, lt)
            if B.get("blur", 0) > 0:
                brgb = up(cv2.GaussianBlur(lowres(brgb, 2), (0, 0), B["blur"])) if B["blur"] > 1.5 else \
                    cv2.GaussianBlur(brgb, (0, 0), B["blur"] * 2)
            brgb = grade(brgb, B.get("grade", {}), lt)
            if B.get("fog"):
                brgb = fog(brgb, B["fog"][0], K(lt, B["fog"][1]), t, idx)
            fx = s.get("fx", {})
            if fx.get("back_glow"):
                brgb = brgb + back_glow(ca, fx["back_glow"][0], K(lt, fx["back_glow"][1]))
            if fx.get("rays"):
                brgb = rays(brgb, ca, fx["rays"][0], fx["rays"][1], K(lt, fx["rays"][2]) * (1 + imp))
            if fx.get("shadow", 0.35) > 0:   # bayangan lembut di belakang karakter (kedalaman)
                sh = up(cv2.GaussianBlur(lowres(ca), (0, 0), 10))
                brgb = brgb * (1 - sh[..., None] * fx.get("shadow", 0.35))
            crgb = light_wrap(crgb, ca, brgb, fx.get("wrap", 0.35))
            dap = s.get("dappled", getattr(EDIT, "DAPPLED", 0.0))
            if dap:
                crgb = crgb + crgb * MT.dappled(S, t, dap, seed=idx) * ca[..., None]
            a3 = ca[..., None]
            frame = brgb * (1 - a3) + crgb * a3
            if fx.get("rim"):
                frame = frame + rim(ca, fx["rim"][0], K(lt, fx["rim"][1]))
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
        if s.get("particles", True):
            p = s.get("particles_cfg", (EDIT.PARTICLE_COLOR, 0.55, "embers"))
            frame = frame + _particles.render(t, p[0], p[1], p[2])
        for ht in s.get("flash", []):
            d = lt - ht
            if 0 <= d < 0.05:
                a = (1 - d / 0.05) * 0.75
                frame = frame * (1 - a) + 255 * a
    pp = MT.paper(S, getattr(EDIT, "PAPER", 0.0))
    if pp is not None:
        frame = frame * pp
    frame = frame * vignette() + grain(fr)
    # transisi masuk/keluar
    tr = s.get("trans_in")
    if tr and lt < tr[1]:
        st = 1 - lt / tr[1]
        frame = whip(frame, st, -1) if tr[0] == "whip" else glitch(frame, st, fr)
    tr = s.get("trans_out")
    if tr and dur - lt < tr[1]:
        st = 1 - (dur - lt) / tr[1]
        frame = whip(frame, st, 1) if tr[0] == "whip" else glitch(frame, st, fr)
    for g0, g1 in s.get("gate", []):
        if g0 <= t < g1:
            frame = frame * 0.15
    for tx in s.get("text", []):
        t0 = tx.get("at", 0.0)
        if t0 <= lt < tx.get("until", 99):
            ap = (lt - t0) / 0.2
            pop = max(0.0, 1 - (lt - t0) / 0.25) if tx.get("pop") else 0.0
            if tx["kind"] == "title":
                frame = typo.title(frame, tx.get("label", ""), tx["name"], tx.get("color", (255, 60, 40)), ap,
                                   tx.get("y", 0.83), tx.get("style", "name"), pop)
            else:
                frame = typo.subtitle(frame, tx["text"], ap, tx.get("y", 0.885))
    frame = typo.watermark(frame, getattr(EDIT, "WATERMARK", ""))
    return np.clip(frame, 0, 255).astype(np.uint8).tobytes()


def init(args):
    global ARGS, EDIT, S, FPS
    ARGS = args
    EDIT = load_edit(args.edit)
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
