"""Render gambar REFERENSI dari file .drawio (tanpa aplikasi draw.io).

Dipakai sebagai contoh visual saat menggambar ulang secara manual di draw.io.
Bukan untuk laporan — gambar laporan tetap diekspor dari draw.io ke assets/.

Pemakaian: python tools/render_referensi.py
Hasil   : diagram/referensi/<nama>.png
"""
import glob
import html
import math
import os
import re
import xml.etree.ElementTree as ET

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "diagram")
OUT = os.path.join(SRC, "referensi")
S = 2.5  # skala
FONT_DIRS = ["/usr/share/fonts/truetype/liberation", "C:/Windows/Fonts"]


def font(bold, size):
    names = ["LiberationSerif-Bold.ttf", "timesbd.ttf"] if bold else ["LiberationSerif-Regular.ttf", "times.ttf"]
    for d in FONT_DIRS:
        for n in names:
            if os.path.exists(os.path.join(d, n)):
                return ImageFont.truetype(os.path.join(d, n), int(size * S))
    return ImageFont.load_default()


def style_of(s):
    out = {}
    for part in (s or "").split(";"):
        if "=" in part:
            k, v = part.split("=", 1)
            out[k] = v
        elif part:
            out[part] = "1"
    return out


def plain(v):
    """HTML label -> baris teks. Mengembalikan [(teks, tebal)]."""
    v = html.unescape(v or "")
    lines = re.split(r"<br\s*/?>|\n", v)
    res = []
    for ln in lines:
        bold = "<b>" in ln
        t = re.sub(r"<[^>]+>", "", ln).strip()
        if t:
            res.append((t, bold))
    return res


def wrap(d, text, fnt, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if d.textlength(test, font=fnt) <= maxw or not cur:
            cur = test
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def draw_label(d, label, box, st, top=False):
    x0, y0, x1, y1 = box
    size = float(st.get("fontSize", 12))
    base_bold = st.get("fontStyle", "0") in ("1", "3")
    rows = []
    for t, b in plain(label):
        f = font(b or base_bold, size)
        for ln in wrap(d, t, f, (x1 - x0) - 12 * S):
            rows.append((ln, f))
    if not rows:
        return
    lh = [f.size * 1.2 for _, f in rows]
    total = sum(lh)
    y = y0 + 8 * S if top else (y0 + y1) / 2 - total / 2
    for (ln, f), h in zip(rows, lh):
        d.text(((x0 + x1) / 2, y + h / 2), ln, font=f, fill="black", anchor="mm")
        y += h


def inside(kind, box, p):
    x0, y0, x1, y1 = box
    cx, cy, rx, ry = (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2
    dx, dy = p[0] - cx, p[1] - cy
    if kind == "ellipse":
        return (dx / rx) ** 2 + (dy / ry) ** 2 <= 1
    if kind == "rhombus":
        return abs(dx) / rx + abs(dy) / ry <= 1
    return x0 <= p[0] <= x1 and y0 <= p[1] <= y1


def clip(seg_from, seg_to, kind, box):
    """Titik pertama pada segmen (dari dalam bentuk ke luar) yang berada di tepi bentuk."""
    for i in range(1, 401):
        t = i / 400
        p = (seg_from[0] + (seg_to[0] - seg_from[0]) * t, seg_from[1] + (seg_to[1] - seg_from[1]) * t)
        if not inside(kind, box, p):
            return p
    return seg_to


def arrow_head(d, a, b, style):
    ang = math.atan2(b[1] - a[1], b[0] - a[0])
    L = 13 * S if style.get("endArrow") == "block" and style.get("endFill") == "0" else 9 * S
    w = 0.45
    p1 = (b[0] - L * math.cos(ang - w), b[1] - L * math.sin(ang - w))
    p2 = (b[0] - L * math.cos(ang + w), b[1] - L * math.sin(ang + w))
    ea = style.get("endArrow", "classic")
    if ea == "none":
        return
    if ea == "open":
        d.line([p1, b, p2], fill="black", width=int(1.5 * S))
    elif style.get("endFill") == "0":
        d.polygon([b, p1, p2], fill="white", outline="black", width=int(1.5 * S))
    else:
        d.polygon([b, p1, p2], fill="black")


def dashed(d, a, b, width):
    L = math.dist(a, b)
    n = max(int(L / (8 * S)), 1)
    for i in range(0, n, 2):
        t0, t1 = i / n, min((i + 1) / n, 1)
        d.line([(a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0),
                (a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1)], fill="black", width=width)


def render(path):
    root = ET.parse(path).getroot()
    cells = list(root.iter("mxCell"))
    V = {}
    for c in cells:
        g = c.find("mxGeometry")
        if c.get("vertex") == "1" and g is not None:
            x, y = float(g.get("x", 0)), float(g.get("y", 0))
            V[c.get("id")] = (c, (x, y, x + float(g.get("width", 0)), y + float(g.get("height", 0))))
    allpts = [(float(p.get("x")), float(p.get("y"))) for p in root.iter("mxPoint") if p.get("x") is not None]
    minx = min([b[0] for _, b in V.values()] + [p[0] for p in allpts]) - 30
    miny = min(b[1] for _, b in V.values()) - 30
    maxx = max(b[2] for _, b in V.values()) + 30
    maxy = max(b[3] for _, b in V.values()) + 40
    img = Image.new("RGB", (int((maxx - minx) * S), int((maxy - miny) * S)), "white")
    d = ImageDraw.Draw(img)
    T = lambda x, y: ((x - minx) * S, (y - miny) * S)
    TB = lambda b: (*T(b[0], b[1]), *T(b[2], b[3]))
    LW = int(1.5 * S)

    def kind_of(st):
        if "rhombus" in st:
            return "rhombus"
        if "ellipse" in st or st.get("shape") in ("doubleEllipse", "endState"):
            return "ellipse"
        return "rect"

    # gambar bentuk (wadah dulu: yang paling besar)
    for cid, (c, b) in sorted(V.items(), key=lambda kv: -(kv[1][1][2] - kv[1][1][0]) * (kv[1][1][3] - kv[1][1][1])):
        st, box, val = style_of(c.get("style")), TB(b), c.get("value", "")
        if "line" in st and (b[3] - b[1]) <= 2:
            d.line([box[0], box[1], box[2], box[1]], fill="black", width=LW)
        elif st.get("shape") == "umlActor":
            cx, top, bot = (box[0] + box[2]) / 2, box[1], box[3]
            h = bot - top
            r = h * 0.13
            d.ellipse([cx - r, top, cx + r, top + 2 * r], outline="black", width=LW)
            d.line([cx, top + 2 * r, cx, top + h * 0.62], fill="black", width=LW)
            d.line([box[0], top + h * 0.38, box[2], top + h * 0.38], fill="black", width=LW)
            d.line([cx, top + h * 0.62, box[0], bot], fill="black", width=LW)
            d.line([cx, top + h * 0.62, box[2], bot], fill="black", width=LW)
            draw_label(d, val, (box[0] - 60 * S, bot + 2 * S, box[2] + 60 * S, bot + 24 * S), st)
        elif kind_of(st) == "ellipse":
            fill = st.get("fillColor", "#FFFFFF")
            fill = "black" if fill.lower() == "#000000" else "white"
            if st.get("shape") in ("doubleEllipse", "endState"):
                d.ellipse(box, outline="black", fill="white", width=LW)
                m = (box[2] - box[0]) * 0.22
                d.ellipse([box[0] + m, box[1] + m, box[2] - m, box[3] - m], fill="black")
            else:
                d.ellipse(box, outline="black", fill=fill, width=LW)
                draw_label(d, val, box, st)
        elif kind_of(st) == "rhombus":
            cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
            d.polygon([(cx, box[1]), (box[2], cy), (cx, box[3]), (box[0], cy)], outline="black", fill="white", width=LW)
            draw_label(d, val, (box[0] + 15 * S, box[1], box[2] - 15 * S, box[3]), st)
        else:
            if "swimlane" in st:
                hs = float(st.get("startSize", 30)) * S
                d.rectangle(box, outline="black", width=LW)
                d.line([box[0], box[1] + hs, box[2], box[1] + hs], fill="black", width=LW)
                draw_label(d, val, (box[0], box[1], box[2], box[1] + hs), st)
                continue
            fill = None if st.get("fillColor") == "none" else "white"
            if st.get("rounded") == "1":
                r = min(box[2] - box[0], box[3] - box[1]) * (0.3 if st.get("arcSize") else 0.15)
                d.rounded_rectangle(box, radius=r, outline="black", fill=fill, width=LW)
            elif st.get("strokeColor", "") != "none" and "text" not in st:
                d.rectangle(box, outline="black", fill=fill, width=LW)
            draw_label(d, val, box, st, top=st.get("verticalAlign") == "top")

    # gambar garis
    for c in cells:
        if c.get("edge") != "1" or c.get("source") not in V or c.get("target") not in V:
            continue
        st = style_of(c.get("style"))
        sc, sb = V[c.get("source")]
        tc, tb = V[c.get("target")]
        center = lambda b: ((b[0] + b[2]) / 2, (b[1] + b[3]) / 2)
        wps = [(float(p.get("x")), float(p.get("y"))) for p in c.iter("mxPoint")]

        def anchor(b, wp):
            # seperti draw.io: garis siku keluar lurus sejajar titik belok bila masih di dalam lebar/tinggi bentuk
            cx, cy = center(b)
            if wp is None:
                return cx, cy
            if b[0] <= wp[0] <= b[2] and abs(wp[1] - cy) > abs(wp[0] - cx):
                return wp[0], cy
            if b[1] <= wp[1] <= b[3] and abs(wp[0] - cx) >= abs(wp[1] - cy):
                return cx, wp[1]
            return cx, cy

        pts = [anchor(sb, wps[0] if wps else None)] + wps + [anchor(tb, wps[-1] if wps else None)]
        # titik keluar/masuk yang ditetapkan (exitX/entryX) dihormati
        if "exitX" in st:
            pts[0] = (sb[0] + (sb[2] - sb[0]) * float(st["exitX"]), sb[1] + (sb[3] - sb[1]) * float(st.get("exitY", 0.5)))
        if "entryX" in st:
            pts[-1] = (tb[0] + (tb[2] - tb[0]) * float(st["entryX"]), tb[1] + (tb[3] - tb[1]) * float(st.get("entryY", 0.5)))
        fixed_s, fixed_t = "exitX" in st, "entryX" in st
        if not wps and not ("exitX" in st or "entryX" in st):  # tanpa titik belok: luruskan bila kedua bentuk sejajar
            (ax, ay), (bx, by) = pts
            if abs(ay - by) < 25:
                y = max(sb[1], tb[1]) / 2 + min(sb[3], tb[3]) / 2
                pts = [(ax, y), (bx, y)]
            elif abs(ax - bx) < 25:
                x = max(sb[0], tb[0]) / 2 + min(sb[2], tb[2]) / 2
                pts = [(x, ay), (x, by)]
        pts = [T(*p) for p in pts]
        ks, kt = kind_of(style_of(sc.get("style"))), kind_of(style_of(tc.get("style")))
        if not fixed_s:
            pts[0] = clip(pts[0], pts[1], ks, TB(sb))
        if not fixed_t:
            pts[-1] = clip(pts[-1], pts[-2], kt, TB(tb))
        for a, b in zip(pts, pts[1:]):
            if st.get("dashed") == "1":
                dashed(d, a, b, LW)
            else:
                d.line([a, b], fill="black", width=LW)
        arrow_head(d, pts[-2], pts[-1], st)
        label = re.sub(r"<[^>]+>", "", html.unescape(c.get("value", ""))).strip()
        if label:
            a, b = pts[0], pts[1]
            mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
            f = font(False, 12)
            tw = d.textlength(label, font=f)
            d.rectangle([mx - tw / 2 - 3 * S, my - 9 * S, mx + tw / 2 + 3 * S, my + 9 * S], fill="white")
            d.text((mx, my), label, font=f, fill="black", anchor="mm")

    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, os.path.basename(path).replace(".drawio", ".png"))
    img.save(out)
    print("OK:", out)
    return out


if __name__ == "__main__":
    for p in sorted(glob.glob(os.path.join(SRC, "*.drawio"))):
        render(p)
