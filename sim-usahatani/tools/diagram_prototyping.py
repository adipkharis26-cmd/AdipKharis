"""Gambar 3.1 Tahapan metode prototyping (hitam-putih, gaya laporan akademik).

Pemakaian: python tools/diagram_prototyping.py  ->  assets/gambar-3-1-prototyping.png
"""
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "gambar-3-1-prototyping.png")
FONT_DIRS = ["/usr/share/fonts/truetype/liberation", "C:/Windows/Fonts"]


def font(bold=False, size=34):
    names = ["LiberationSerif-Bold.ttf", "timesbd.ttf"] if bold else ["LiberationSerif-Regular.ttf", "times.ttf"]
    for d in FONT_DIRS:
        for n in names:
            p = os.path.join(d, n)
            if os.path.exists(p):
                return ImageFont.truetype(p, size)
    return ImageFont.load_default()


W, H = 1700, 1250
img = Image.new("RGB", (W, H), "white")
d = ImageDraw.Draw(img)
F, FB, FS = font(size=36), font(True, 40), font(size=33)
LW = 3


def box(cx, cy, title, sub, w=660, h=120):
    x0, y0 = cx - w // 2, cy - h // 2
    d.rounded_rectangle([x0, y0, x0 + w, y0 + h], radius=14, outline="black", width=LW)
    d.text((cx, cy - 18), title, font=FB, fill="black", anchor="mm")
    d.text((cx, cy + 24), sub, font=FS, fill="black", anchor="mm")
    return x0, y0, x0 + w, y0 + h


def arrow(x0, y0, x1, y1):
    d.line([x0, y0, x1, y1], fill="black", width=LW)
    import math
    a = math.atan2(y1 - y0, x1 - x0)
    s = 18
    p1 = (x1 - s * math.cos(a - 0.4), y1 - s * math.sin(a - 0.4))
    p2 = (x1 - s * math.cos(a + 0.4), y1 - s * math.sin(a + 0.4))
    d.polygon([(x1, y1), p1, p2], fill="black")


cx = 560
b1 = box(cx, 110, "1. Identifikasi Kebutuhan", "observasi, wawancara, studi pustaka")
b2 = box(cx, 330, "2. Perancangan Prototipe", "use case, activity diagram, desain Figma")
b3 = box(cx, 550, "3. Evaluasi Prototipe", "dicoba dan dinilai oleh pemilik lahan")
# belah ketupat keputusan
dy, hw, hh = 790, 210, 100
d.polygon([(cx, dy - hh), (cx + hw, dy), (cx, dy + hh), (cx - hw, dy)], outline="black", width=LW)
d.text((cx, dy), "Sudah sesuai?", font=FB, fill="black", anchor="mm")
b5 = box(cx, 1060, "5. Rancangan Final", "dokumentasi pada BAB IV")
b4 = box(1300, 790, "4. Perbaikan Prototipe", "revisi sesuai masukan", w=560)

arrow(cx, b1[3], cx, b2[1])
arrow(cx, b2[3], cx, b3[1])
arrow(cx, b3[3], cx, dy - hh)
arrow(cx, dy + hh, cx, b5[1])
d.text((cx + 20, dy + hh + 30), "Ya", font=F, fill="black", anchor="lm")
arrow(cx + hw, dy, b4[0], dy)
d.text(((cx + hw + b4[0]) // 2, dy - 26), "Tidak", font=F, fill="black", anchor="mm")
# kembali ke evaluasi
d.line([1300, b4[1], 1300, 550], fill="black", width=LW)
arrow(1300, 550, b3[2], 550)

from PIL import ImageOps
bbox = ImageOps.invert(img).getbbox()
img = img.crop((bbox[0] - 30, bbox[1] - 30, bbox[2] + 30, bbox[3] + 30))
img.save(OUT, dpi=(200, 200))
print("OK:", OUT)
