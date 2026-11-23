"""
typo.py - Tipografi meniru referensi @tezxsokun:
  label kecil (sans, putih)  +  nama karakter (condensed, gradasi warna + glow)  ->  title()
  subtitle "*..." putih polos                                                  ->  subtitle()
  teks episode kuning condensed                                                ->  title(..., style="episode")
  watermark gaya kuas runcing di bawah tengah                                  ->  watermark()
Font (Google Fonts, OFL): Fjalla One, Metal Mania, Inter.
"""
import os

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

S = 1080          # diubah oleh renderer (mis. 2048); ukuran font diskalakan otomatis
_HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.environ.get("MMV_FONTS", os.path.join(_HERE, "fonts"))


def _f(name, size, fallback="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
    for p in (os.path.join(FONT_DIR, name), name):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.truetype(fallback, size)


_cache = {}


def _font(name, size):
    size = int(round(size * S / 1080))
    k = (name, size)
    if k not in _cache:
        _cache[k] = _f(name, size)
    return _cache[k]


def _text_mask(text, font, y, x=None, stroke=0):
    x = S / 2 if x is None else x
    m = Image.new("L", (S, S), 0)
    ImageDraw.Draw(m).text((x, y), text, font=font, fill=255, anchor="mm", stroke_width=stroke, stroke_fill=255)
    return np.asarray(m, np.float32) / 255.0


def _gradient(mask, top, bottom):
    ys = np.where(mask.max(1) > 0)[0]
    if len(ys) == 0:
        return np.zeros((S, S, 3), np.float32)
    y0, y1 = ys.min(), ys.max() + 1
    g = np.zeros((S, 1, 3), np.float32)
    t = np.clip((np.arange(S) - y0) / max(1, y1 - y0), 0, 1)[:, None]
    g[:, 0, :] = np.array(top, np.float32) * (1 - t) + np.array(bottom, np.float32) * t
    return np.repeat(g, S, axis=1)


def _over(frame, rgb, a):
    a = np.clip(a, 0, 1)[..., None]
    return frame * (1 - a) + rgb * a


def title(frame, label, name, color, appear=1.0, y=0.83, style="name", pop=0.0):
    """label kecil + nama bergradasi & glow. appear 0..1 untuk animasi masuk (fade + naik)."""
    if appear <= 0:
        return frame
    a = min(1.0, appear)
    dy = (1 - a) * 14 * S / 1080
    if style == "episode":
        top, bot, glow, size = (255, 246, 205), (240, 196, 60), (255, 190, 40), 78
    else:
        c = np.array(color, np.float32)
        top, bot, glow, size = tuple(np.minimum(255, c * 0.45 + 150)), tuple(c), tuple(c), 66
    size = int(size * (1 + 0.08 * pop))
    fy = y * S + dy
    if label:
        lm = _text_mask(label, _font("Inter-SemiBold.otf", 22), fy - size * 0.78 * S / 1080)
        sh = cv2.GaussianBlur(lm, (0, 0), 2)
        frame = _over(frame, np.zeros(3, np.float32), sh * 0.6 * a)
        frame = _over(frame, np.array([235, 235, 235], np.float32), lm * a)
    font = _font("FjallaOne-Regular.ttf", size)
    m = _text_mask(name, font, fy)
    mo = _text_mask(name, font, fy, stroke=3)
    k_ = S / 1080
    g1 = cv2.GaussianBlur(mo, (0, 0), 9 * k_)
    g2 = cv2.GaussianBlur(mo, (0, 0), 22 * k_)
    frame = frame + (g1 * 0.9 + g2 * 0.7)[..., None] * np.array(glow, np.float32) * 0.55 * a
    shadow = cv2.GaussianBlur(_text_mask(name, font, fy + 3, stroke=2), (0, 0), 2.5)
    frame = _over(frame, np.zeros(3, np.float32), shadow * 0.55 * a)
    frame = _over(frame, _gradient(m, top, bot), m * a)
    return frame


def subtitle(frame, text, appear=1.0, y=0.885):
    if appear <= 0 or not text:
        return frame
    a = min(1.0, appear)
    font = _font("Inter-Medium.otf", 30)
    m = _text_mask(text, font, y * S)
    sh = cv2.GaussianBlur(_text_mask(text, font, y * S + 2, stroke=2), (0, 0), 3)
    frame = _over(frame, np.zeros(3, np.float32), sh * 0.7 * a)
    return _over(frame, np.array([250, 250, 250], np.float32), m * a)


_wm_cache = {}


def watermark(frame, text, y=0.935, opacity=0.92):
    if not text:
        return frame
    if text not in _wm_cache:
        font = _font("MetalMania-Regular.ttf", 50)
        m = _text_mask(text, font, y * S)
        rng = np.random.default_rng(5)
        grit = cv2.GaussianBlur(rng.uniform(0.55, 1.0, (S, S)).astype(np.float32), (0, 0), 0.8)
        col = _gradient(m, (255, 255, 255), (170, 170, 170)) * grit[..., None]
        sh = cv2.GaussianBlur(_text_mask(text, font, y * S + 3, stroke=2), (0, 0), 3)
        _wm_cache[text] = (m, col, sh)
    m, col, sh = _wm_cache[text]
    frame = _over(frame, np.zeros(3, np.float32), sh * 0.75 * opacity)
    return _over(frame, col, m * opacity)


# =====================================================================================================
# GENRE TYPOGRAPHY: setiap genre punya font, warna, animasi masuk, dan watermark sendiri (tidak monoton)
# =====================================================================================================
_VAR_WEIGHT = {"Cinzel.ttf": 800, "Orbitron.ttf": 800, "Montserrat.ttf": 700, "PlayfairDisplay-Italic.ttf": 600,
               "CormorantGaramond-Italic.ttf": 600}


def _gfont(name, size):
    size = max(6, int(round(size * S / 1080)))
    k = ("g", name, size)
    if k not in _cache:
        f = _f(name, size)
        if name in _VAR_WEIGHT:
            try:
                f.set_variation_by_axes([_VAR_WEIGHT[name]])
            except Exception:
                pass
        _cache[k] = f
    return _cache[k]


def _tracked_mask(text, font, cx, cy, tracking=0.0, stroke=0):
    """Teks dengan letter-spacing (tracking dalam em), di-center di (cx, cy)."""
    m = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(m)
    if tracking == 0:
        d.text((cx, cy), text, font=font, fill=255, anchor="mm", stroke_width=stroke, stroke_fill=255)
        return np.asarray(m, np.float32) / 255.0
    em = font.size
    widths = [d.textlength(ch, font=font) for ch in text]
    total = sum(widths) + tracking * em * (len(text) - 1)
    x = cx - total / 2
    for ch, w in zip(text, widths):
        d.text((x, cy), ch, font=font, fill=255, anchor="lm", stroke_width=stroke, stroke_fill=255)
        x += w + tracking * em
    return np.asarray(m, np.float32) / 255.0


def _ease_out_back(x):
    c = 1.7
    x = min(1.0, max(0.0, x)) - 1
    return 1 + (c + 1) * x ** 3 + c * x ** 2


def _shift(mask, dx, dy):
    M = np.float32([[1, 0, dx], [0, 1, dy]])
    return cv2.warpAffine(mask, M, (S, S))


def _scale_about(mask, k, cx, cy):
    M = np.float32([[k, 0, cx - k * cx], [0, k, cy - k * cy]])
    return cv2.warpAffine(mask, M, (S, S), flags=cv2.INTER_LINEAR)


def genre_title(frame, label, name, T, since, seed=0):
    """T = gaya teks genre (font, warna, stroke, glow, animasi). since = detik sejak teks muncul."""
    if since < 0:
        return frame
    k_ = S / 1080
    anim = T.get("anim", "rise")
    a = min(1.0, since / T.get("in_dur", 0.22))
    text = name.upper() if T.get("upper") else name
    if anim == "type":                                      # mesin ketik: huruf muncul satu per satu
        n = max(1, int(len(text) * min(1.0, since / T.get("in_dur", 0.5))))
        text_vis = text[:n]
    else:
        text_vis = text
    cy = T.get("y", 0.83) * S
    cx = S / 2
    font = _gfont(T["font"], T.get("size", 70))
    m = _tracked_mask(text_vis, font, cx, cy, T.get("tracking", 0.0))
    mo = _tracked_mask(text_vis, font, cx, cy, T.get("tracking", 0.0), stroke=max(1, int(T.get("stroke", 3) * k_)))
    # animasi masuk
    alpha = a
    if anim == "rise":
        dy = (1 - a) * 18 * k_
        m, mo = _shift(m, 0, dy), _shift(mo, 0, dy)
    elif anim == "pop":
        sc = 0.6 + 0.4 * _ease_out_back(a)
        m, mo = _scale_about(m, sc, cx, cy), _scale_about(mo, sc, cx, cy)
        alpha = min(1.0, a * 2)
    elif anim == "slide":
        dx = (1 - _ease_out_back(a)) * -S * 0.35
        m, mo = _shift(m, dx, 0), _shift(mo, dx, 0)
    elif anim == "spread":                                  # tracking merapat pelan (sinematik)
        tr = T.get("tracking", 0.0) + (1 - a) * 0.6
        m = _tracked_mask(text_vis, font, cx, cy, tr)
        mo = _tracked_mask(text_vis, font, cx, cy, tr, stroke=max(1, int(T.get("stroke", 3) * k_)))
    elif anim == "blur_in":
        r = (1 - a) * 12 * k_ + 0.01
        m, mo = cv2.GaussianBlur(m, (0, 0), r), cv2.GaussianBlur(mo, (0, 0), r)
    glitch_k = 0.0
    if anim == "glitch" or T.get("jitter"):
        glitch_k = max(0.0, 1 - since / 0.35) if anim == "glitch" else T.get("jitter", 0)
    # label
    if label:
        lab = label.upper() if T.get("label_upper", True) else label
        lf = _gfont(T.get("label_font", "Inter-SemiBold.otf"), T.get("label_size", 22))
        lm = _tracked_mask(lab, lf, cx, cy - T.get("size", 70) * T.get("label_gap", 0.8) * k_, T.get("label_tracking", 0.25))
        frame = _over(frame, np.zeros(3, np.float32), cv2.GaussianBlur(lm, (0, 0), 2) * 0.6 * alpha)
        frame = _over(frame, np.array(T.get("label_color", (235, 235, 235)), np.float32), lm * alpha)
    # glow
    if T.get("glow"):
        g = cv2.GaussianBlur(mo, (0, 0), 9 * k_) * 0.9 + cv2.GaussianBlur(mo, (0, 0), 24 * k_) * 0.7
        frame = frame + g[..., None] * np.array(T["glow"], np.float32) * T.get("glow_k", 0.55) * alpha
    # bayangan
    frame = _over(frame, np.zeros(3, np.float32),
                  cv2.GaussianBlur(_shift(mo, 0, 3 * k_), (0, 0), 2.5) * T.get("shadow", 0.55) * alpha)
    # stroke berwarna
    if T.get("stroke_color"):
        frame = _over(frame, np.array(T["stroke_color"], np.float32), np.clip(mo - m, 0, 1) * alpha)
    fill = _gradient(m, T.get("top", (255, 255, 255)), T.get("bottom", T.get("top", (255, 255, 255))))
    if glitch_k > 0:                                        # pemisahan RGB + potongan horizontal
        rng = np.random.default_rng(seed + int(since * 60))
        off = int(10 * glitch_k * k_) + 1
        frame = _over(frame, np.array([255, 30, 60], np.float32), _shift(m, -off, 0) * 0.8 * alpha)
        frame = _over(frame, np.array([30, 230, 255], np.float32), _shift(m, off, 0) * 0.8 * alpha)
        for _ in range(3):
            y0 = int(cy + rng.uniform(-0.5, 0.5) * T.get("size", 70) * k_)
            h = int(rng.uniform(3, 10) * k_)
            m[y0:y0 + h] = np.roll(m[y0:y0 + h], int(rng.uniform(-30, 30) * k_ * glitch_k), axis=1)
    frame = _over(frame, fill, m * alpha)
    # ornamen
    orn = T.get("ornament")
    if orn:
        ys = np.where(m.max(1) > 0.5)[0]
        xs = np.where(m.max(0) > 0.5)[0]
        if len(xs):
            x0, x1 = xs.min(), xs.max()
            col = tuple(float(c) for c in T.get("ornament_color", T.get("bottom", (255, 255, 255))))
            L = np.zeros((S, S, 3), np.float32)
            th = max(1, int(2 * k_))
            yb = int(ys.max() + 10 * k_)
            if orn == "underline":
                cv2.line(L, (int(x0), yb), (int(x0 + (x1 - x0) * a), yb), col, th, cv2.LINE_AA)
            elif orn == "brackets":                         # HUD [ ] gaya hyper
                yt = int(ys.min() - 10 * k_)
                p = int(18 * k_)
                for xx, sgn in ((int(x0 - p), 1), (int(x1 + p), -1)):
                    cv2.line(L, (xx, yt), (xx, yb), col, th, cv2.LINE_AA)
                    cv2.line(L, (xx, yt), (xx + sgn * p, yt), col, th, cv2.LINE_AA)
                    cv2.line(L, (xx, yb), (xx + sgn * p, yb), col, th, cv2.LINE_AA)
            elif orn == "lines":                            # garis di kiri-kanan (elegan)
                w = int(60 * k_)
                cv2.line(L, (int(x0 - w - 14 * k_), int(cy)), (int(x0 - 14 * k_), int(cy)), col, th, cv2.LINE_AA)
                cv2.line(L, (int(x1 + 14 * k_), int(cy)), (int(x1 + w + 14 * k_), int(cy)), col, th, cv2.LINE_AA)
            frame = frame + L * alpha
    return frame


_gwm_cache = {}


def genre_watermark(frame, text, W, t=0.0):
    """Watermark per genre: font, warna gradasi, tracking, grit/glow, posisi."""
    if not text or not W:
        return frame
    key = (text, repr(sorted(W.items())), S)
    if key not in _gwm_cache:
        k_ = S / 1080
        txt = text.upper() if W.get("upper") else text
        font = _gfont(W["font"], W.get("size", 46))
        x = W.get("x", 0.5) * S
        y = W.get("y", 0.935) * S
        m = _tracked_mask(txt, font, x, y, W.get("tracking", 0.0))
        col = _gradient(m, W.get("top", (255, 255, 255)), W.get("bottom", (170, 170, 170)))
        if W.get("grit"):
            rng = np.random.default_rng(5)
            grit = cv2.GaussianBlur(rng.uniform(1 - W["grit"], 1.0, (S, S)).astype(np.float32), (0, 0), 0.8)
            col = col * grit[..., None]
        sh = cv2.GaussianBlur(_shift(_tracked_mask(txt, font, x, y, W.get("tracking", 0.0), stroke=2), 0, 3 * k_),
                              (0, 0), 3)
        glow = None
        if W.get("glow"):
            glow = (cv2.GaussianBlur(m, (0, 0), 8 * k_)[..., None] * np.array(W["glow"], np.float32))
        _gwm_cache[key] = (m, col, sh, glow)
    m, col, sh, glow = _gwm_cache[key]
    op = W.get("opacity", 0.9)
    if W.get("pulse"):
        op *= 1 - W["pulse"] * (0.5 + 0.5 * np.sin(t * 2.2))
    frame = _over(frame, np.zeros(3, np.float32), sh * 0.7 * op)
    if glow is not None:
        frame = frame + glow * 0.8 * op
    return _over(frame, col, m * op)


# =====================================================================================================
# mv2 - DIALOG gaya referensi "marjukanak": teks diketik huruf demi huruf (typewriter), italic tebal,
# gradasi kuning-emas + glow, bayangan; varian box="yellow" = kotak kuning berteks hitam (catatan/pesan).
# =====================================================================================================
def _shear(mask, k, cy):
    M = np.float32([[1, -k, k * cy], [0, 1, 0]])
    return cv2.warpAffine(mask, M, (S, S), flags=cv2.INTER_LINEAR)


def _wrap(text, font, max_w):
    d = ImageDraw.Draw(Image.new("L", (8, 8)))
    lines, cur = [], ""
    for w in text.split(" "):
        nxt = (cur + " " + w).strip()
        if cur and d.textlength(nxt, font=font) > max_w:
            lines.append(cur)
            cur = w
        else:
            cur = nxt
    if cur:
        lines.append(cur)
    return lines


def dialog(frame, text, since, D=None, until=99.0):
    """Typewriter: cps huruf/detik, fade keluar 0.15 dtk sebelum `until`. D: y, size, box, color, cps."""
    D = D or {}
    if since < 0 or not text:
        return frame
    cps = D.get("cps", 22.0)
    n = int(since * cps) + 1
    shown = text[:n]
    a = min(1.0, (until - since) / 0.15) if until < 90 else 1.0
    if a <= 0:
        return frame
    size = D.get("size", 34)
    y = D.get("y", 0.80) * S
    font = _gfont(D.get("font", "Montserrat.ttf"), size)
    full_lines = _wrap(text, font, S * D.get("width", 0.62))
    # pecah teks yang sudah tampil mengikuti baris teks penuh agar posisi tidak meloncat
    lines, rest = [], shown
    for ln in full_lines:
        lines.append(rest[:len(ln)])
        rest = rest[len(ln) + 1:]
    lh = font.size * 1.18
    y0 = y - lh * (len(full_lines) - 1) / 2
    m = Image.new("L", (S, S), 0)
    dr = ImageDraw.Draw(m)
    for i, (ln, full) in enumerate(zip(lines, full_lines)):
        if not ln:
            continue
        x = S / 2 - dr.textlength(full, font=font) / 2
        dr.text((x, y0 + i * lh), ln, font=font, fill=255, anchor="lm")
    mask = np.asarray(m, np.float32) / 255.0
    if D.get("box"):
        # kotak kuning (seperti catatan di referensi) - kotak penuh langsung, teks diketik di dalamnya
        bw = max(dr.textlength(f, font=font) for f in full_lines) + font.size * 1.2
        bh = lh * len(full_lines) + font.size * 0.8
        box = np.zeros((S, S), np.float32)
        cv2.rectangle(box, (int(S / 2 - bw / 2), int(y - bh / 2)), (int(S / 2 + bw / 2), int(y + bh / 2)), 1.0, -1)
        pop = min(1.0, since / 0.12)
        box = _scale_about(box, 0.85 + 0.15 * _ease_out_back(pop), S / 2, y)
        sh = cv2.GaussianBlur(_shift(box, 0, 6 * S / 1080), (0, 0), 8 * S / 1080)
        frame = _over(frame, np.zeros(3, np.float32), sh * 0.6 * a)
        glow = cv2.GaussianBlur(box, (0, 0), 18 * S / 1080)
        frame = frame + glow[..., None] * np.array([255, 230, 40], np.float32) * 0.35 * a
        frame = _over(frame, np.array(D.get("box_color", (255, 232, 20)), np.float32), box * a)
        return _over(frame, np.array([15, 12, 8], np.float32), mask * a)
    if D.get("italic", True):
        mask = _shear(mask, 0.2, y)
    k_ = S / 1080
    sh = cv2.GaussianBlur(_shift(mask, 2 * k_, 3 * k_), (0, 0), 3 * k_)
    frame = _over(frame, np.zeros(3, np.float32), sh * 0.85 * a)
    # backing gelap tebal agar font tipis tetap terbaca di adegan terang
    back = cv2.GaussianBlur(cv2.dilate(mask, np.ones((int(7 * k_) | 1, int(7 * k_) | 1), np.uint8)), (0, 0), 6 * k_)
    frame = _over(frame, np.array([10, 6, 4], np.float32), np.clip(back * 1.4, 0, 1) * 0.7 * a)
    col = D.get("color", (255, 200, 40))
    g = cv2.GaussianBlur(mask, (0, 0), 10 * k_)
    frame = frame + g[..., None] * np.array(col, np.float32) * 0.8 * a
    top = tuple(min(255, c * 0.3 + 190) for c in col)
    return _over(frame, _gradient(mask, top, col), mask * a)
