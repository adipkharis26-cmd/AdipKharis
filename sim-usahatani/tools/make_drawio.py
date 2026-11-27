"""Membuat file diagram .drawio (bisa dibuka & diedit di app.diagrams.net atau VS Code).

Pemakaian: python tools/make_drawio.py
Hasil   : diagram/01-tahapan-prototyping.drawio, diagram/02-use-case.drawio

Catatan: setelah diagram diedit manual di diagrams.net, JANGAN jalankan skrip ini lagi
untuk file yang sama, karena akan menimpa hasil edit. Skrip ini hanya untuk versi awal.
"""
import os
from xml.sax.saxutils import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "diagram")
FONT = "fontFamily=Times New Roman;fontColor=#000000;"


class Diagram:
    def __init__(self, name):
        self.name, self.cells, self.n = name, [], 1

    def _id(self):
        self.n += 1
        return f"c{self.n}"

    def vertex(self, label, x, y, w, h, style):
        i = self._id()
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
        with open(os.path.join(OUT, filename), "w", encoding="utf-8") as f:
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


if __name__ == "__main__":
    prototyping()
    use_case()
