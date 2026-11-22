"""
engine.py - Mesin animasi karakter 2.5D gaya After Effects (tanpa AE).

Padanan teknik AE:
  Roto Brush            -> segmentasi anime (analyze.segment)       : layer karakter terpisah dari background
  Content-Aware Fill    -> cv2.inpaint pada background               : background bersih untuk parallax
  Puppet Pin / Duik     -> RIG parts (rotate / bob / wind / breathe) : deformasi mesh halus per bagian
  Keyframe + Easy Ease  -> Key / ease()                              : semua gerak lewat keyframe ber-easing
  3D Camera + Null      -> kamera dengan parallax per layer          : bg bergerak lebih lambat dari karakter
  Glow / CC Light Rays  -> bloom + light rays radial di belakang karakter
  Mask + Glow (mata)    -> eye glow per titik mata
  CC Particle World     -> partikel/bara berlapis kedalaman
"""
import math

import cv2
import numpy as np

S = 1080


# ---------------------------------------------------------------- keyframe
def ease(x, kind="ease"):
    x = min(1.0, max(0.0, x))
    if kind == "linear":
        return x
    if kind == "out":      # ease out (cepat lalu pelan) - speed ramp
        return 1 - (1 - x) ** 3
    if kind == "in":
        return x ** 3
    if kind == "expo":
        return 1.0 if x >= 1 else 1 - 2 ** (-9 * x)
    if kind == "back":     # overshoot seperti spring Duik
        c = 1.6
        x -= 1
        return 1 + (c + 1) * x ** 3 + c * x ** 2
    return x * x * (3 - 2 * x)   # Easy Ease


def key(t, keys, kind="ease"):
    """keys = [(waktu, nilai), ...] waktu relatif shot; nilai skalar atau tuple."""
    if not isinstance(keys, (list, tuple)) or not keys or not isinstance(keys[0], (list, tuple)):
        return keys
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t <= t1:
            k = ease((t - t0) / max(1e-6, t1 - t0), kind)
            if isinstance(v0, (list, tuple)):
                return tuple(a + (b - a) * k for a, b in zip(v0, v1))
            return v0 + (v1 - v0) * k
    return keys[-1][1]


def smooth_noise(t, seed, freq):
    x = t * freq + seed * 7.13
    i = math.floor(x)
    f = x - i
    h = lambda n: (math.sin(n * 127.1 + seed * 311.7) * 43758.5453) % 1 * 2 - 1
    return h(i) + (h(i + 1) - h(i)) * f * f * (3 - 2 * f)


# ---------------------------------------------------------------- masks
def soft_ellipse(h, w, cx, cy, rx, ry, feather=0.35):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((xx / w - cx) / rx) ** 2 + ((yy / h - cy) / ry) ** 2)
    return np.clip((1 + feather - d) / feather, 0, 1).astype(np.float32)


def soft_box(h, w, x0, y0, x1, y1, feather=0.05):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    xn, yn = xx / w, yy / h
    fx = np.minimum(np.clip((xn - x0) / feather + 0.5, 0, 1), np.clip((x1 - xn) / feather + 0.5, 0, 1))
    fy = np.minimum(np.clip((yn - y0) / feather + 0.5, 0, 1), np.clip((y1 - yn) / feather + 0.5, 0, 1))
    return (fx * fy).astype(np.float32)


def region(h, w, spec):
    kind = spec[0]
    if kind == "ellipse":
        return soft_ellipse(h, w, *spec[1:])
    if kind == "box":
        return soft_box(h, w, *spec[1:])
    raise ValueError(spec)


# ---------------------------------------------------------------- rig
class Rig:
    """Menyimpan gambar sumber, alpha karakter, background bersih, dan part puppet."""

    def __init__(self, rgb, alpha, cfg):
        self.rgb = rgb.astype(np.float32)
        self.h, self.w = rgb.shape[:2]
        self.cfg = cfg
        full = cfg.get("full_char", False)
        if full or alpha is None:
            self.alpha = np.ones((self.h, self.w), np.float32)
        else:
            a = np.clip((alpha - 0.15) / 0.7, 0, 1)
            self.alpha = cv2.GaussianBlur(a, (0, 0), 1.2)
        self.bg = self.rgb if full else self._clean_plate()
        # bobot "ujung tipis" (rambut, jubah, sayap) untuk angin
        a8 = (self.alpha > 0.5).astype(np.uint8)
        dist = cv2.distanceTransform(a8, cv2.DIST_L2, 5)
        r = max(6.0, 0.035 * min(self.h, self.w))
        edge = np.exp(-dist / r) * (self.alpha > 0.02)
        self.edge = cv2.GaussianBlur(edge.astype(np.float32), (0, 0), r * 0.6)
        self.protect = np.zeros((self.h, self.w), np.float32)
        for p in cfg.get("protect", []):
            self.protect = np.maximum(self.protect, region(self.h, self.w, p))
        self.parts = []
        for p in cfg.get("parts", []):
            m = region(self.h, self.w, p["region"]) if "region" in p else np.ones((self.h, self.w), np.float32)
            if p.get("blur", 0):
                m = cv2.GaussianBlur(m, (0, 0), p["blur"] * min(self.h, self.w))
            self.parts.append((p, m))
        yy, xx = np.mgrid[0:self.h, 0:self.w].astype(np.float32)
        self.xx, self.yy = xx, yy
        # noise untuk angin (2 oktaf, di-scroll terhadap waktu)
        rng = np.random.default_rng(cfg.get("seed", 1))
        n = cv2.resize(rng.normal(0, 1, (24, 24)).astype(np.float32), (self.w * 2, self.h * 2), interpolation=cv2.INTER_CUBIC)
        self.noise = cv2.GaussianBlur(n, (0, 0), min(self.h, self.w) * 0.05)
        self.noise /= self.noise.std() + 1e-6

    def _clean_plate(self):
        m = (cv2.dilate((self.alpha > 0.1).astype(np.uint8), np.ones((15, 15), np.uint8)) * 255)
        k = 0.5
        small = cv2.resize(self.rgb.astype(np.uint8), None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
        ms = cv2.resize(m, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
        inp = cv2.inpaint(small, ms, 9, cv2.INPAINT_TELEA)
        inp = cv2.GaussianBlur(inp, (0, 0), 3)
        big = cv2.resize(inp, (self.w, self.h), interpolation=cv2.INTER_CUBIC).astype(np.float32)
        mm = cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), 6)[..., None]
        return self.rgb * (1 - mm) + big * mm

    def _noise(self, t, speed=(0.06, 0.03)):
        ox = int((t * speed[0] * self.w) % self.w)
        oy = int((t * speed[1] * self.h) % self.h)
        return self.noise[oy:oy + self.h, ox:ox + self.w]

    def displacement(self, t, amp=1.0):
        """Medan deformasi (dx, dy) dalam piksel sumber pada waktu t (relatif shot)."""
        dx = np.zeros((self.h, self.w), np.float32)   # lentur (angin, napas) -> dilindungi di wajah
        dy = np.zeros((self.h, self.w), np.float32)
        rx_ = np.zeros((self.h, self.w), np.float32)  # rigid (rotasi, melayang) -> wajah ikut utuh
        ry_ = np.zeros((self.h, self.w), np.float32)
        unit = min(self.h, self.w)
        for p, m in self.parts:
            kind = p["type"]
            if kind == "wind":       # rambut / jubah / sayap tertiup angin (follow-through)
                a = key(t, p.get("amp", 0.006)) * unit * amp
                w = m * (self.edge if p.get("edge", True) else 1.0)
                f = p.get("freq", 0.9)
                ph = 2 * math.pi * f * t
                wave = np.sin(ph - self.yy / unit * p.get("k", 6.0)) * 0.6 + self._noise(t) * 0.4
                d = p.get("dir", (1.0, 0.35))
                dx += a * w * wave * d[0]
                dy += a * w * np.cos(ph * 0.8 - self.xx / unit * 4.0) * d[1]
            elif kind == "rotate":   # sayap mengepak / kepala menoleh (pivot)
                ang = math.radians(key(t, p["angle"], p.get("ease", "ease")))
                if "osc" in p:
                    A, f, phs = p["osc"]
                    ang += math.radians(A * math.sin(2 * math.pi * f * t + phs))
                px, py = p["pivot"][0] * self.w, p["pivot"][1] * self.h
                c, s = math.cos(-ang), math.sin(-ang)
                rx, ry = self.xx - px, self.yy - py
                rx_ += m * (rx - (c * rx - s * ry))
                ry_ += m * (ry - (s * rx + c * ry))
            elif kind == "bob":      # melayang naik-turun (iblis, partikel besar)
                A, f, phs = p["osc"]
                off = A * unit * math.sin(2 * math.pi * f * t + phs)
                ry_ += m * off
                rx_ += m * off * 0.25 * math.cos(2 * math.pi * f * 0.5 * t + phs)
            elif kind == "pin":      # Puppet Pin: geser titik (sudut bibir naik = senyum, dagu naik, dll.)
                off = key(t, p["offset"], p.get("ease", "ease"))
                rx_ += m * off[0] * unit
                ry_ += m * off[1] * unit
            elif kind == "breathe":  # napas: skala vertikal dari pivot (bawah)
                A, f = p.get("osc", (0.008, 0.4))
                sc = A * math.sin(2 * math.pi * f * t)
                py = p.get("pivot", (0.5, 1.0))[1] * self.h
                px = p.get("pivot", (0.5, 1.0))[0] * self.w
                dy += m * (self.yy - py) * sc
                dx += m * (self.xx - px) * sc * 0.3
        protect = 1 - self.protect
        return rx_ + dx * protect, ry_ + dy * protect

    def warp(self, t, amp=1.0):
        dx, dy = self.displacement(t, amp)
        mx, my = self.xx - dx, self.yy - dy
        char = cv2.remap(self.rgb, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        alpha = cv2.remap(self.alpha, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
        bg = cv2.remap(self.bg, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        return char, alpha, bg


# ---------------------------------------------------------------- kamera 2.5D
def layer_matrix(src_w, src_h, focus, zoom, pan, rot, parallax):
    """Affine sumber -> output 1080. parallax: 0 = diam, 1 = ikut kamera penuh."""
    side = min(src_w, src_h)
    base = S / side
    z = 1 + (zoom - 1) * parallax
    sc = base * z
    cx, cy = focus[0] * src_w, focus[1] * src_h
    ang = math.radians(rot * parallax)
    c, s = math.cos(ang) * sc, math.sin(ang) * sc
    tx = S / 2 + pan[0] * S * parallax - (c * cx - s * cy)
    ty = S / 2 + pan[1] * S * parallax - (s * cx + c * cy)
    return np.array([[c, -s, tx], [s, c, ty]], np.float32)


def min_zoom_cover(src_w, src_h, focus):
    """zoom minimum agar crop 1:1 tidak keluar gambar (tanpa tepi hitam)."""
    side = min(src_w, src_h)
    fx, fy = focus[0] * src_w, focus[1] * src_h
    need = max(side / 2 / max(1, min(fx, src_w - fx)), side / 2 / max(1, min(fy, src_h - fy)))
    return max(1.0, need * 1.04)


# ---------------------------------------------------------------- efek
def eye_glow(frame, pts, color, intensity, radius):
    if intensity <= 0:
        return frame
    h, w = frame.shape[:2]
    layer = np.zeros((h, w, 3), np.float32)
    for (x, y) in pts:
        cv2.circle(layer, (int(x), int(y)), max(2, int(radius * 0.35)), (255, 255, 255), -1, cv2.LINE_AA)
        cv2.circle(layer, (int(x), int(y)), max(3, int(radius)), tuple(float(c) for c in color), -1, cv2.LINE_AA)
        # streak anamorphic tipis
        cv2.ellipse(layer, (int(x), int(y)), (int(radius * 4), max(1, int(radius * 0.25))), 0, 0, 360,
                    tuple(float(c) * 0.6 for c in color), -1, cv2.LINE_AA)
    g1 = cv2.GaussianBlur(layer, (0, 0), radius * 0.6)
    g2 = cv2.GaussianBlur(layer, (0, 0), radius * 2.2)
    return frame + (g1 * 1.2 + g2 * 0.9) * intensity


def light_rays(frame, alpha, center, color, strength):
    """CC Light Rays: sinar radial dari belakang karakter, terhalang siluet."""
    if strength <= 0:
        return frame
    k = 4
    small = cv2.resize(frame, (S // k, S // k), interpolation=cv2.INTER_AREA)
    a = cv2.resize(alpha, (S // k, S // k), interpolation=cv2.INTER_AREA)[..., None]
    lum = small.mean(2, keepdims=True)
    src = np.clip(lum - 120, 0, 255) / 135.0 * (1 - a)
    cx, cy = center[0] * S / k, center[1] * S / k
    acc = np.zeros_like(src)
    n = 14
    for i in range(n):
        sc = 1 + i * 0.045
        M = np.array([[sc, 0, cx - sc * cx], [0, sc, cy - sc * cy]], np.float32)
        acc += cv2.warpAffine(src, M, (S // k, S // k), flags=cv2.INTER_LINEAR)[..., None] * (1 - i / n)
    acc = cv2.GaussianBlur(acc, (0, 0), 1.5)
    rays = cv2.resize(acc, (S, S), interpolation=cv2.INTER_LINEAR)[..., None] / n * 2.2
    return frame + rays * np.array(color, np.float32) * strength


def rim_light(alpha, color, strength, width=6):
    a = alpha
    er = cv2.erode(a, np.ones((width, width), np.uint8))
    rim = np.clip(a - er, 0, 1)
    rim = cv2.GaussianBlur(rim, (0, 0), width * 0.8)
    return rim[..., None] * np.array(color, np.float32) * strength


def bloom(frame, thr, k):
    small = cv2.resize(frame, (S // 4, S // 4), interpolation=cv2.INTER_AREA)
    hi = np.clip(small - thr, 0, None) * 2.0
    b = cv2.GaussianBlur(hi, (0, 0), 7) + cv2.GaussianBlur(hi, (0, 0), 20) * 0.6
    return frame + cv2.resize(b, (S, S), interpolation=cv2.INTER_LINEAR) * k


def sharpen(frame, amount=0.45, sigma=1.1):
    bl = cv2.GaussianBlur(frame, (0, 0), sigma)
    return frame + (frame - bl) * amount


class Particles:
    """Bara/debu 3 lapis kedalaman: belakang (kecil, lambat), tengah, depan (besar, blur bokeh)."""

    def __init__(self, n=46, seed=11):
        r = np.random.default_rng(seed)
        self.x = r.uniform(0, S, n)
        self.y = r.uniform(0, S * 1.2, n)
        self.layer = r.choice([0, 1, 2], n, p=[0.5, 0.35, 0.15])
        self.ph = r.uniform(0, 6.3, n)
        self.sp = r.uniform(0.6, 1.4, n)

    def render(self, t, color, k, cam_pan):
        out = [np.zeros((S, S, 3), np.float32) for _ in range(3)]
        size = [2.0, 3.4, 9.0]
        vel = [35, 60, 120]
        par = [0.4, 1.0, 1.8]
        for i in range(len(self.x)):
            L = self.layer[i]
            y = (self.y[i] - vel[L] * self.sp[i] * t) % (S * 1.2) - S * 0.1
            x = self.x[i] + 18 * math.sin(t * 0.9 * self.sp[i] + self.ph[i]) + cam_pan[0] * S * par[L] * 0.3
            fl = 0.75 + 0.25 * math.sin(t * 3.0 + self.ph[i])
            cv2.circle(out[L], (int(x), int(y)), max(1, int(size[L])), tuple(float(c) * fl for c in color), -1,
                       cv2.LINE_AA)
        res = out[0] + cv2.GaussianBlur(out[1], (0, 0), 1.2) * 1.2 + cv2.GaussianBlur(out[2], (0, 0), 6) * 2.5
        return res + cv2.GaussianBlur(res, (0, 0), 6) * 1.5 * k
