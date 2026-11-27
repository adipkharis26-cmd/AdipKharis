"""Membuat file diagram .drawio (bisa dibuka & diedit di app.diagrams.net atau VS Code).

Pemakaian: python tools/make_drawio.py
Hasil   : diagram/01-tahapan-prototyping.drawio, diagram/02-use-case.drawio

Catatan: file yang sudah ada TIDAK ditimpa (agar hasil edit manual di diagrams.net aman).
Tambahkan argumen --force hanya jika memang ingin membuat ulang dari awal.
"""
import os
import sys
from xml.sax.saxutils import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "diagram")
FONT = "fontFamily=Times New Roman;fontColor=#000000;"


class Diagram:
    def __init__(self, name):
        self.name, self.cells, self.n = name, [], 1
        self.geo = {}

    def _id(self):
        self.n += 1
        return f"c{self.n}"

    def vertex(self, label, x, y, w, h, style):
        i = self._id()
        self.geo[i] = (x, y, w, h)
        self.cells.append(
            f'<mxCell id="{i}" value="{escape(label, {chr(34): "&quot;"})}" style="{style}{FONT}" vertex="1" parent="1">'
            f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>')
        return i

    def edge(self, src, dst, style="", label="", points=()):
        i = self._id()
        pts = "".join(f'<mxPoint x="{px}" y="{py}"/>' for px, py in points)
        pts = f'<Array as="points">{pts}</Array>' if pts else ""
        self.cells.append(
            f'<mxCell id="{i}" value="{escape(label)}" style="endArrow=block;endFill=1;html=1;strokeColor=#000000;'
            f'strokeWidth=1.5;{FONT}fontSize=12;{style}" edge="1" parent="1" source="{src}" target="{dst}">'
            f'<mxGeometry relative="1" as="geometry">{pts}</mxGeometry></mxCell>')
        return i

    def save(self, filename):
        body = "".join(self.cells)
        xml = (f'<mxfile host="app.diagrams.net"><diagram name="{self.name}" id="{filename}">'
               f'<mxGraphModel dx="1000" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" '
               f'arrows="1" fold="1" page="1" pageScale="1" pageWidth="900" pageHeight="1000" math="0" shadow="0">'
               f'<root><mxCell id="0"/><mxCell id="1" parent="0"/>{body}</root></mxGraphModel></diagram></mxfile>')
        os.makedirs(OUT, exist_ok=True)
        target = os.path.join(OUT, filename)
        if os.path.exists(target) and "--force" not in sys.argv:
            print("LEWATI (sudah ada, mungkin sudah diedit manual):", target)
            return
        with open(target, "w", encoding="utf-8") as f:
            f.write(xml)
        print("OK:", os.path.join(OUT, filename))


def prototyping():
    d = Diagram("Tahapan Prototyping")
    box = "rounded=1;whiteSpace=wrap;html=1;strokeColor=#000000;fillColor=#FFFFFF;strokeWidth=1.5;fontSize=14;"
    W, H, x = 280, 64, 60
    lbl = lambda t, s: f"<b>{t}</b><br><font style=&quot;font-size:12px&quot;>{s}</font>"
    b1 = d.vertex(lbl("1. Identifikasi Kebutuhan", "observasi, wawancara, studi pustaka"), x, 20, W, H, box)
    b2 = d.vertex(lbl("2. Perancangan Prototipe", "use case, activity diagram, desain Figma"), x, 130, W, H, box)
    b3 = d.vertex(lbl("3. Evaluasi Prototipe", "dicoba dan dinilai oleh pemilik lahan"), x, 240, W, H, box)
    dec = d.vertex("<b>Sudah sesuai?</b>", x + 50, 350, 180, 90,
                   "rhombus;whiteSpace=wrap;html=1;strokeColor=#000000;fillColor=#FFFFFF;strokeWidth=1.5;fontSize=14;")
    b4 = d.vertex(lbl("4. Perbaikan Prototipe", "revisi sesuai masukan"), 420, 363, 240, H, box)
    b5 = d.vertex(lbl("5. Rancangan Final", "didokumentasikan pada BAB IV"), x, 490, W, H, box)
    d.edge(b1, b2)
    d.edge(b2, b3)
    d.edge(b3, dec)
    d.edge(dec, b5, label="Ya")
    d.edge(dec, b4, label="Tidak")
    d.edge(b4, b3, "edgeStyle=orthogonalEdgeStyle;exitX=0.5;exitY=0;entryX=1;entryY=0.5;", points=[(540, 272)])
    d.save("01-tahapan-prototyping.drawio")


def use_case():
    d = Diagram("Use Case Diagram")
    actor = "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;strokeColor=#000000;fillColor=#FFFFFF;fontSize=14;fontStyle=1;"
    uc = "ellipse;whiteSpace=wrap;html=1;strokeColor=#000000;fillColor=#FFFFFF;strokeWidth=1.5;fontSize=13;"
    assoc = "endArrow=none;"
    d.vertex("Sistem Informasi Manajemen Keuangan Usaha Tani<br>Lahan Tegal Miring", 210, 10, 620, 850,
             "rounded=0;whiteSpace=wrap;html=1;strokeColor=#000000;fillColor=none;verticalAlign=top;fontSize=14;fontStyle=1;strokeWidth=1.5;")
    pencatat = d.vertex("Pencatat", 70, 170, 40, 80, actor)
    pemilik = d.vertex("Pemilik", 70, 560, 40, 80, actor)
    d.edge(pemilik, pencatat, "endArrow=block;endFill=0;endSize=14;")  # generalisasi

    X, W, H = 250, 240, 58
    rows = {}
    for key, label, y in [
        ("login", "Login", 70), ("keluar", "Catat Pengeluaran", 150), ("panen", "Catat Hasil Panen", 230),
        ("jual", "Catat Penjualan ke Pengepul", 310), ("petak", "Kelola Petak Lahan", 410),
        ("musim", "Kelola Musim Tanam", 485), ("harga", "Update Harga Harian", 560),
        ("user", "Kelola Pengguna", 635), ("dash", "Lihat Dashboard", 710), ("lap", "Lihat Laporan Laba Rugi", 785),
    ]:
        rows[key] = d.vertex(label, X, y, W, H, uc)
    hitung = d.vertex("Hitung HPP, R/C, dan<br>Alokasi Biaya Bersama", 560, 700, 240, 66, uc)
    cetak = d.vertex("Cetak Laporan", 580, 540, 200, H, uc)

    for k in ("login", "keluar", "panen", "jual"):
        d.edge(pencatat, rows[k], assoc)
    for k in ("petak", "musim", "harga", "user", "dash", "lap"):
        d.edge(pemilik, rows[k], assoc)
    dashed = "dashed=1;endArrow=open;endSize=10;"
    d.edge(rows["dash"], hitung, dashed, "«include»")
    d.edge(rows["lap"], hitung, dashed, "«include»")
    d.edge(cetak, rows["lap"], dashed, "«extend»")
    d.save("02-use-case.drawio")


class Activity:
    """Activity diagram dua lajur (swimlane): Pengguna | Sistem."""

    LANE_W = 320
    ACT = "rounded=1;arcSize=40;whiteSpace=wrap;html=1;strokeColor=#000000;fillColor=#FFFFFF;strokeWidth=1.5;fontSize=13;"
    DEC = "rhombus;whiteSpace=wrap;html=1;strokeColor=#000000;fillColor=#FFFFFF;strokeWidth=1.5;fontSize=12;"

    def __init__(self, name, actor, height):
        self.d = Diagram(name)
        lane = "rounded=0;whiteSpace=wrap;html=1;strokeColor=#000000;fillColor=none;verticalAlign=top;fontSize=14;fontStyle=1;strokeWidth=1.5;spacingTop=8;"
        self.d.vertex(actor, 20, 20, self.LANE_W, height, lane)
        self.d.vertex("Sistem", 20 + self.LANE_W, 20, self.LANE_W, height, lane)
        # garis bawah judul lajur
        self.d.vertex("", 20, 60, self.LANE_W * 2, 1, "line;strokeWidth=1.5;html=1;strokeColor=#000000;")

    def cx(self, lane):
        return 20 + self.LANE_W * lane + self.LANE_W // 2

    def start(self, lane, y):
        return self.d.vertex("", self.cx(lane) - 15, y, 30, 30, "ellipse;html=1;fillColor=#000000;strokeColor=#000000;")

    def end(self, lane, y):
        return self.d.vertex("", self.cx(lane) - 17, y, 34, 34,
                             "ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=#000000;strokeWidth=1.5;")

    def act(self, lane, y, text, w=240, h=54):
        return self.d.vertex(text, self.cx(lane) - w // 2, y, w, h, self.ACT)

    def dec(self, lane, y, text, w=150, h=80):
        return self.d.vertex(text, self.cx(lane) - w // 2, y, w, h, self.DEC)

    def go(self, a, b, label="", points=(), style=""):
        if not style and not points:
            # pilih titik sambung otomatis agar garis lurus dan rapi
            ax, ay, aw, ah = self.d.geo[a]
            bx, by, bw, bh = self.d.geo[b]
            acx, acy, bcx, bcy = ax + aw / 2, ay + ah / 2, bx + bw / 2, by + bh / 2
            if abs(acx - bcx) < 5:
                style = "exitX=0.5;exitY=1;entryX=0.5;entryY=0;"
            elif abs(acy - bcy) < 25:
                style = "exitX=1;exitY=0.5;entryX=0;entryY=0.5;" if bcx > acx else "exitX=0;exitY=0.5;entryX=1;entryY=0.5;"
            else:
                # turun dulu, menyeberang lajur di celah antarbaris, lalu masuk dari atas
                mid = (ay + ah + by) / 2
                style = "exitX=0.5;exitY=1;entryX=0.5;entryY=0;"
                points = [(acx, mid), (bcx, mid)]
        return self.d.edge(a, b, "edgeStyle=orthogonalEdgeStyle;rounded=0;endArrow=open;endSize=10;" + style,
                           label, points)


def activity_pengeluaran():
    a = Activity("Activity Catat Pengeluaran", "Pencatat", 760)
    s = a.start(0, 80)
    n1 = a.act(0, 140, "Membuka menu Catat Pengeluaran")
    n2 = a.act(1, 140, "Menampilkan formulir pengeluaran")
    n3 = a.act(0, 230, "Mengisi tanggal, jenis biaya, jumlah, sifat biaya (tunai/diperhitungkan), dan tujuan biaya", h=80)
    n4 = a.act(0, 345, "Menekan tombol Simpan")
    n5 = a.dec(1, 330, "Data lengkap?")
    n6 = a.act(1, 460, "Menampilkan pesan data belum lengkap")
    n7 = a.act(1, 560, "Menyimpan data pengeluaran")
    n8 = a.act(1, 640, "Menampilkan notifikasi berhasil")
    e = a.end(1, 715)
    for x, y in [(s, n1), (n1, n2), (n2, n3), (n3, n4), (n4, n5)]:
        a.go(x, y)
    a.go(n5, n6, "Tidak", style="exitX=0.5;exitY=1;entryX=0.5;entryY=0;")
    a.go(n6, n3, points=[(35, 487), (35, 270)], style="exitX=0;exitY=0.5;entryX=0;entryY=0.5;")
    a.go(n5, n7, "Ya", points=[(600, 370), (600, 587)], style="exitX=1;exitY=0.5;entryX=1;entryY=0.5;")
    a.go(n7, n8)
    a.go(n8, e)
    a.d.save("03-activity-catat-pengeluaran.drawio")


def activity_harga():
    a = Activity("Activity Update Harga Harian", "Pemilik", 760)
    s = a.start(0, 80)
    n1 = a.act(0, 140, "Membuka menu Harga Harian")
    n2 = a.act(1, 140, "Menampilkan harga terakhir setiap komoditas")
    n3 = a.act(0, 230, "Mengisi harga dari pengepul hari ini")
    n4 = a.act(0, 310, "Menekan tombol Simpan")
    n5 = a.act(1, 310, "Menyimpan harga beserta tanggal")
    n6 = a.act(1, 390, "Menghitung margin per kg (harga harian − HPP)")
    n7 = a.dec(1, 470, "Harga > HPP?")
    n8 = a.act(1, 590, "Menampilkan status untung per kg", w=200)
    n9 = a.act(0, 590, "Menampilkan peringatan harga di bawah modal", w=220)
    e = a.end(1, 700)
    for x, y in [(s, n1), (n1, n2), (n2, n3), (n3, n4), (n4, n5), (n5, n6), (n6, n7)]:
        a.go(x, y)
    a.go(n7, n8, "Ya")
    a.go(n7, n9, "Tidak", points=[(170, 510)], style="exitX=0;exitY=0.5;entryX=0.5;entryY=0;")
    a.go(n8, e)
    a.go(n9, e, points=[(170, 717)], style="exitX=0.5;exitY=1;entryX=0;entryY=0.5;")
    a.d.save("04-activity-update-harga.drawio")


def activity_laporan():
    a = Activity("Activity Lihat Laporan Laba Rugi", "Pemilik", 860)
    s = a.start(0, 80)
    n1 = a.act(0, 140, "Membuka menu Laporan")
    n2 = a.act(0, 220, "Memilih komoditas dan periode (musim tanam atau tahun)", h=64)
    n3 = a.act(1, 220, "Mengambil data pengeluaran, panen, dan penjualan", h=64)
    n4 = a.act(1, 310, "Menghitung alokasi biaya bersama (rumus 2.8)")
    n5 = a.act(1, 390, "Menghitung TC, TR, pendapatan, R/C, dan HPP")
    n6 = a.act(1, 470, "Menampilkan laporan laba rugi")
    n7 = a.dec(0, 455, "Cetak laporan?")
    n8 = a.act(1, 600, "Membuat file PDF laporan")
    n9 = a.act(0, 690, "Mengunduh file PDF")
    e = a.end(0, 800)
    for x, y in [(s, n1), (n1, n2), (n2, n3), (n3, n4), (n4, n5), (n5, n6), (n6, n7)]:
        a.go(x, y)
    a.go(n7, n8, "Ya", points=[(170, 627)], style="exitX=0.5;exitY=1;entryX=0;entryY=0.5;")
    a.go(n8, n9, points=[(490, 717)], style="exitX=0.5;exitY=1;entryX=1;entryY=0.5;")
    a.go(n9, e)
    a.go(n7, e, "Tidak", points=[(35, 495), (35, 817)], style="exitX=0;exitY=0.5;entryX=0;entryY=0.5;")
    a.d.save("05-activity-laporan-laba-rugi.drawio")


if __name__ == "__main__":
    prototyping()
    use_case()
    activity_pengeluaran()
    activity_harga()
    activity_laporan()
