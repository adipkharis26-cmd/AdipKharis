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


def _text_mask(text, font, y, x=S / 2, stroke=0):
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
