"""Gambar REFERENSI (contekan) untuk digambar ulang manual di draw.io.

Pemakaian: python tools/gambar_referensi.py
Hasil   : folder referensi-gambar/ (PNG, tiap gambar diberi judul di atas)

Gambar ini BUKAN untuk ditempel di laporan. Gambar laporan dibuat sendiri di draw.io
lalu diekspor ke assets/ sesuai nama di kotak "TEMPAT GAMBAR" pada docx.
"""
import math
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "referensi-gambar")
FONT_DIRS = ["/usr/share/fonts/truetype/liberation", "C:/Windows/Fonts"]
LW = 3


def font(bold=False, size=28):
    names = ["LiberationSerif-Bold.ttf", "timesbd.ttf"] if bold else ["LiberationSerif-Regular.ttf", "times.ttf"]
    for d in FONT_DIRS:
        for n in names:
            p = os.path.join(d, n)
            if os.path.exists(p):
                return ImageFont.truetype(p, size)
    return ImageFont.load_default()


F, FB, FT, FS = font(size=26), font(True, 28), font(True, 40), font(size=24)


def wrap(d, text, fnt, width):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if d.textlength(t, font=fnt) <= width:
            cur = t
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return lines


def text_center(d, cx, cy, text, fnt, width):
    lines = wrap(d, text, fnt, width)
    lh = fnt.size + 6
    y = cy - lh * len(lines) / 2 + lh / 2
    for ln in lines:
        d.text((cx, y), ln, font=fnt, fill="black", anchor="mm")
        y += lh


def arrow_head(d, x0, y0, x1, y1, hollow=False, size=18):
    a = math.atan2(y1 - y0, x1 - x0)
    p1 = (x1 - size * math.cos(a - 0.45), y1 - size * math.sin(a - 0.45))
    p2 = (x1 - size * math.cos(a + 0.45), y1 - size * math.sin(a + 0.45))
    if hollow:
        d.polygon([(x1, y1), p1, p2], fill="white", outline="black", width=LW)
    else:
        d.line([p1, (x1, y1), p2], fill="black", width=LW)


def polyline(d, pts, dashed=False):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if not dashed:
            d.line([x0, y0, x1, y1], fill="black", width=LW)
            continue
        L = math.hypot(x1 - x0, y1 - y0)
        n = int(L // 14)
        for i in range(0, n, 2):
            a, b = i / n, min((i + 1) / n, 1)
            d.line([x0 + (x1 - x0) * a, y0 + (y1 - y0) * a, x0 + (x1 - x0) * b, y0 + (y1 - y0) * b],
                   fill="black", width=LW)


def titled(img, title, note="Referensi — gambar ulang di draw.io"):
    w, h = img.size
    out = Image.new("RGB", (w, h + 120), "white")
    d = ImageDraw.Draw(out)
    d.text((w // 2, 45), title, font=FT, fill="black", anchor="mm")
    d.text((w // 2, 92), note, font=FS, fill="#555555", anchor="mm")
    out.paste(img, (0, 120))
    return out


def save(img, name):
    os.makedirs(OUT, exist_ok=True)
    p = os.path.join(OUT, name + ".png")
    img.save(p, dpi=(150, 150))
    print("OK:", p)


# ------------------------------------------------------------------ activity
def activity(title, lanes, nodes, edges):
    """nodes: key -> (lajur, baris, jenis, teks); edges: (dari, ke, label, rute)."""
    LANE, ROW, TOP, BW, BH = 620, 150, 70, 420, 84
    rows = max(n[1] for n in nodes.values()) + 1
    W, H = LANE * len(lanes) + 40, TOP + rows * ROW + 40
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)
    for i, name in enumerate(lanes):
        x0 = 20 + i * LANE
        d.rectangle([x0, 10, x0 + LANE, H - 10], outline="black", width=LW)
        d.line([x0, 10 + 56, x0 + LANE, 10 + 56], fill="black", width=LW)
        d.text((x0 + LANE / 2, 38), name, font=FB, fill="black", anchor="mm")

    geo = {}
    for k, (lane, row, kind, txt) in nodes.items():
        cx = 20 + lane * LANE + LANE / 2
        cy = TOP + 20 + row * ROW + ROW / 2
        if kind == "start":
            d.ellipse([cx - 20, cy - 20, cx + 20, cy + 20], fill="black")
            hw, hh = 20, 20
        elif kind == "end":
            d.ellipse([cx - 24, cy - 24, cx + 24, cy + 24], outline="black", width=LW)
            d.ellipse([cx - 15, cy - 15, cx + 15, cy + 15], fill="black")
            hw, hh = 24, 24
        elif kind == "dec":
            hw, hh = 130, 58
            d.polygon([(cx, cy - hh), (cx + hw, cy), (cx, cy + hh), (cx - hw, cy)], outline="black", fill="white", width=LW)
            text_center(d, cx, cy, txt, F, 200)
        else:
            hw, hh = BW / 2, BH / 2
            d.rounded_rectangle([cx - hw, cy - hh, cx + hw, cy + hh], radius=26, outline="black", width=LW)
            text_center(d, cx, cy, txt, F, BW - 40)
        geo[k] = (cx, cy, hw, hh, lane)

    def lbl(x, y, t, anchor="mm"):
        if t:
            d.text((x, y), t, font=FB, fill="black", anchor=anchor)

    for a, b, label, route in edges:
        ax, ay, aw, ah, al = geo[a]
        bx, by, bw, bh, bl = geo[b]
        outer = lambda lane: 20 + lane * LANE + (30 if lane == 0 else LANE - 30)
        if route == "inner":  # keluar samping dalam, turun, masuk samping dalam target
            sx = -1 if al == len(lanes) - 1 else 1
            ox = 20 + al * LANE + (LANE - 30 if al == 0 else 30)
            pts = [(ax + sx * aw, ay), (ox, ay), (ox, by), (bx + sx * bw, by)]
        elif route == "side":  # keluar samping luar, turun, masuk samping luar target
            sx = 1 if al == len(lanes) - 1 else -1
            ox = outer(al)
            pts = [(ax + sx * aw, ay), (ox, ay), (ox, by), (bx + sx * bw, by)]
            lbl((ax + sx * aw + ox) / 2, ay - 22, label)
        elif by < ay:  # kembali ke atas: memutar lewat sisi luar lajur target
            sx = -1 if bl == 0 else 1
            ox = outer(bl)
            pts = [(ax + sx * aw if al == bl else ax - (1 if bl < al else -1) * aw, ay), (ox, ay), (ox, by), (bx + sx * bw, by)]
            lbl((pts[0][0] + ox) / 2, ay - 22, label)
        elif al == bl:
            pts = [(ax, ay + ah), (bx, by - bh)]
            lbl(ax + 14, (ay + ah + by - bh) / 2, label, "lm")
        elif route == "vh":
            sx = 1 if bx > ax else -1
            pts = [(ax, ay + ah), (ax, by), (bx - sx * bw, by)]
            lbl(ax + 14, ay + ah + 30, label, "lm")
        else:  # mendatar lalu turun
            sx = 1 if bx > ax else -1
            pts = [(ax + sx * aw, ay), (bx, ay), (bx, by - bh)] if by > ay else [(ax + sx * aw, ay), (bx - sx * bw, by)]
            lbl((ax + sx * aw + bx) / 2, ay - 22, label)
        polyline(d, pts)
        arrow_head(d, *pts[-2], *pts[-1])
    return titled(img, title)


def all_activities():
    P, S = 0, 1
    save(activity("Activity Diagram Login", ["Pengguna", "Sistem"], {
        "s": (P, 0, "start", ""), "a1": (P, 1, "act", "Membuka halaman login"),
        "a2": (P, 2, "act", "Memasukkan nama pengguna dan kata sandi"),
        "b1": (S, 3, "act", "Memeriksa kecocokan data login"), "d1": (S, 4, "dec", "Data cocok?"),
        "b2": (S, 5, "act", "Menampilkan pesan bahwa login gagal"),
        "b3": (S, 6, "act", "Membuka halaman dashboard sesuai peran"), "e": (S, 7, "end", ""),
    }, [("s", "a1", "", ""), ("a1", "a2", "", ""), ("a2", "b1", "", ""), ("b1", "d1", "", ""),
        ("d1", "b2", "Tidak", ""), ("b2", "a2", "", ""), ("d1", "b3", "Ya", "side"), ("b3", "e", "", "")]),
        "Referensi - Activity Diagram Login")

    save(activity("Activity Diagram Catat Pengeluaran", ["Pencatat", "Sistem"], {
        "s": (P, 0, "start", ""), "a1": (P, 1, "act", "Membuka menu Catat Pengeluaran"),
        "b1": (S, 2, "act", "Menampilkan formulir pengeluaran"),
        "a2": (P, 3, "act", "Mengisi tanggal, jenis biaya, jumlah, sifat biaya, dan tujuan biaya"),
        "a3": (P, 4, "act", "Menekan tombol Simpan"), "d1": (S, 5, "dec", "Data lengkap?"),
        "b2": (S, 6, "act", "Menampilkan pesan bahwa data belum lengkap"),
        "b3": (S, 7, "act", "Menyimpan data pengeluaran"), "b4": (S, 8, "act", "Menampilkan notifikasi berhasil"),
        "e": (S, 9, "end", ""),
    }, [("s", "a1", "", ""), ("a1", "b1", "", ""), ("b1", "a2", "", ""), ("a2", "a3", "", ""), ("a3", "d1", "", ""),
        ("d1", "b2", "Tidak", ""), ("b2", "a2", "", ""), ("d1", "b3", "Ya", "side"), ("b3", "b4", "", ""),
        ("b4", "e", "", "")]), "Referensi - Activity Diagram Catat Pengeluaran")

    save(activity("Activity Diagram Update Harga Harian", ["Pemilik", "Sistem"], {
        "s": (P, 0, "start", ""), "a1": (P, 1, "act", "Membuka menu Harga Harian"),
        "b1": (S, 2, "act", "Menampilkan harga terakhir setiap komoditas"),
        "a2": (P, 3, "act", "Mengisi harga dari pengepul hari ini"), "a3": (P, 4, "act", "Menekan tombol Simpan"),
        "b2": (S, 5, "act", "Menyimpan harga beserta tanggalnya"),
        "b3": (S, 6, "act", "Menghitung margin per kg (harga harian − HPP)"), "d1": (S, 7, "dec", "Harga > HPP?"),
        "b4": (S, 8, "act", "Menampilkan peringatan harga di bawah modal"),
        "b5": (S, 9, "act", "Menampilkan status untung per kg"), "e": (S, 10, "end", ""),
    }, [("s", "a1", "", ""), ("a1", "b1", "", ""), ("b1", "a2", "", ""), ("a2", "a3", "", ""), ("a3", "b2", "", ""),
        ("b2", "b3", "", ""), ("b3", "d1", "", ""), ("d1", "b4", "Tidak", ""), ("d1", "b5", "Ya", "side"),
        ("b4", "e", "", "inner"), ("b5", "e", "", "")]), "Referensi - Activity Diagram Update Harga Harian")

    save(activity("Activity Diagram Lihat Laporan Laba Rugi", ["Pemilik", "Sistem"], {
        "s": (P, 0, "start", ""), "a1": (P, 1, "act", "Membuka menu Laporan"),
        "a2": (P, 2, "act", "Memilih komoditas dan periode"),
        "b1": (S, 3, "act", "Mengambil data pengeluaran, panen, dan penjualan"),
        "b2": (S, 4, "act", "Membagi biaya bersama dengan rumus (2.8)"),
        "b3": (S, 5, "act", "Menghitung TC, TR, pendapatan, R/C, dan HPP"),
        "b4": (S, 6, "act", "Menampilkan laporan laba rugi"), "d1": (P, 7, "dec", "Cetak laporan?"),
        "b5": (S, 8, "act", "Membuat file PDF laporan"), "a3": (P, 9, "act", "Mengunduh file PDF"),
        "e": (P, 10, "end", ""),
    }, [("s", "a1", "", ""), ("a1", "a2", "", ""), ("a2", "b1", "", ""), ("b1", "b2", "", ""), ("b2", "b3", "", ""),
        ("b3", "b4", "", ""), ("b4", "d1", "", ""), ("d1", "b5", "Ya", ""), ("b5", "a3", "", ""),
        ("d1", "e", "Tidak", "side"), ("a3", "e", "", "")]), "Referensi - Activity Diagram Lihat Laporan Laba Rugi")


# ------------------------------------------------------------------ use case
def use_case():
    W, H = 1500, 1300
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)
    bx0, by0, bx1, by1 = 330, 20, 1480, 1280
    d.rectangle([bx0, by0, bx1, by1], outline="black", width=LW)
    text_center(d, (bx0 + bx1) / 2, 62, "Sistem Informasi Manajemen Keuangan Usaha Tani Lahan Tegal Miring", FB, 1000)

    def actor(x, y, name):
        d.ellipse([x - 22, y - 90, x + 22, y - 46], outline="black", width=LW)
        d.line([x, y - 46, x, y + 20], fill="black", width=LW)
        d.line([x - 45, y - 20, x + 45, y - 20], fill="black", width=LW)
        d.line([x, y + 20, x - 35, y + 80], fill="black", width=LW)
        d.line([x, y + 20, x + 35, y + 80], fill="black", width=LW)
        d.text((x, y + 108), name, font=FB, fill="black", anchor="mm")
        return x, y

    pc = actor(140, 300, "Pencatat")
    pm = actor(140, 880, "Pemilik")
    # generalisasi Pemilik -> Pencatat
    d.line([140, 880 - 95, 140, 300 + 130], fill="black", width=LW)
    arrow_head(d, 140, 880 - 95, 140, 300 + 130, hollow=True, size=26)

    uc = {}
    def ell(key, cx, cy, txt, w=330, h=86):
        d.ellipse([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], outline="black", width=LW)
        text_center(d, cx, cy, txt, F, w - 60)
        uc[key] = (cx, cy, w / 2, h / 2)

    X = 640
    for key, txt, y in [("login", "Login", 140), ("keluar", "Catat Pengeluaran", 250), ("panen", "Catat Hasil Panen", 360),
                        ("jual", "Catat Penjualan ke Pengepul", 470), ("petak", "Kelola Petak Lahan", 610),
                        ("musim", "Kelola Musim Tanam", 715), ("harga", "Update Harga Harian", 820),
                        ("user", "Kelola Pengguna", 925), ("dash", "Lihat Dashboard", 1050),
                        ("lap", "Lihat Laporan Laba Rugi", 1170)]:
        ell(key, X, y, txt)
    ell("hitung", 1210, 960, "Hitung HPP, R/C, dan Alokasi Biaya Bersama", w=420, h=110)
    ell("cetak", 1210, 1210, "Cetak Laporan", w=300)

    def edge_to(src, key):
        cx, cy, rw, rh = uc[key]
        sx, sy = src
        a = math.atan2(sy - cy, sx - cx)
        d.line([sx + 50, sy - 20, cx + rw * math.cos(a), cy + rh * math.sin(a)], fill="black", width=LW)

    for k in ("login", "keluar", "panen", "jual"):
        edge_to(pc, k)
    for k in ("petak", "musim", "harga", "user", "dash", "lap"):
        edge_to(pm, k)

    def dashed(k1, k2, label):
        x1, y1, w1, h1 = uc[k1]
        x2, y2, w2, h2 = uc[k2]
        a = math.atan2(y2 - y1, x2 - x1)
        p0 = (x1 + w1 * math.cos(a), y1 + h1 * math.sin(a))
        p1 = (x2 - w2 * math.cos(a), y2 - h2 * math.sin(a))
        polyline(d, [p0, p1], dashed=True)
        arrow_head(d, *p0, *p1)
        d.text(((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 - 24), label, font=F, fill="black", anchor="mm")

    dashed("dash", "hitung", "«include»")
    dashed("lap", "hitung", "«include»")
    dashed("cetak", "lap", "«extend»")
    save(titled(img, "Use Case Diagram"), "Referensi - Use Case Diagram")


# ------------------------------------------------------------------ prototyping
def prototyping():
    W, H = 1500, 1150
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)

    def box(cx, cy, t, s, w=620, h=120):
        d.rounded_rectangle([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], radius=16, outline="black", width=LW)
        d.text((cx, cy - 20), t, font=FB, fill="black", anchor="mm")
        d.text((cx, cy + 24), s, font=FS, fill="black", anchor="mm")
        return cx, cy, w / 2, h / 2

    cx = 480
    b1 = box(cx, 80, "1. Identifikasi Kebutuhan", "observasi, wawancara, studi pustaka")
    b2 = box(cx, 290, "2. Perancangan Prototipe", "use case, activity diagram, desain Figma")
    b3 = box(cx, 500, "3. Evaluasi Prototipe", "dicoba dan dinilai oleh pemilik lahan")
    dy, hw, hh = 730, 200, 95
    d.polygon([(cx, dy - hh), (cx + hw, dy), (cx, dy + hh), (cx - hw, dy)], outline="black", width=LW)
    d.text((cx, dy), "Sudah sesuai?", font=FB, fill="black", anchor="mm")
    b5 = box(cx, 1020, "5. Rancangan Final", "didokumentasikan pada BAB IV")
    b4 = box(1180, dy, "4. Perbaikan Prototipe", "revisi sesuai masukan", w=500)
    for (x0, y0, x1, y1) in [(cx, 140, cx, 230), (cx, 350, cx, 440), (cx, 560, cx, dy - hh), (cx, dy + hh, cx, 960),
                             (cx + hw, dy, 1180 - 250, dy)]:
        d.line([x0, y0, x1, y1], fill="black", width=LW)
        arrow_head(d, x0, y0, x1, y1)
    d.text((cx + 30, dy + hh + 30), "Ya", font=FB, fill="black", anchor="lm")
    d.text((cx + hw + 60, dy - 26), "Tidak", font=FB, fill="black", anchor="mm")
    polyline(d, [(1180, dy - 60), (1180, 500), (cx + 310, 500)])
    arrow_head(d, 1180, 500, cx + 310, 500)
    save(titled(img, "Tahapan Metode Prototyping"), "Referensi - Tahapan Metode Prototyping")


if __name__ == "__main__":
    prototyping()
    use_case()
    all_activities()
