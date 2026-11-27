"""Bangun laporan .docx dari draf Markdown di folder laporan/.

Pemakaian (dari folder sim-usahatani):
    pip install python-docx
    python tools/build_docx.py

Hasil: output/Laporan_SIM_Usaha_Tani.docx
Format: A4, margin 4-3-3-3 cm, Times New Roman 12, spasi 1,5, rata kiri-kanan,
nomor halaman romawi (bagian awal) lalu angka (mulai BAB I), daftar pustaka APA 7.

Daftar isi berisi nomor halaman yang dihitung dari hasil render. Jika LibreOffice
(soffice) dan pdftotext tidak tersedia, nomor halaman daftar isi dikosongkan.
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_COLOR_INDEX, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAPORAN = os.path.join(ROOT, "laporan")
OUT = os.path.join(ROOT, "output", "Laporan_SIM_Usaha_Tani.docx")

JUDUL = ("PERANCANGAN SISTEM INFORMASI MANAJEMEN KEUANGAN USAHA TANI "
         "MULTI-KOMODITAS BERBASIS WEB RESPONSIF")
SUBJUDUL = "(Studi Kasus: Lahan Tegal Miring, Desa Sidomulyo, Kabupaten Batang)"
BAB_FILES = ["04-bab-1-pendahuluan.md"]  # bab berikutnya ditambahkan di sini

FONT = "Times New Roman"


# ---------- utilitas format ----------
def set_base_styles(doc):
    st = doc.styles["Normal"]
    st.font.name = FONT
    st.font.size = Pt(12)
    st.element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
    pf = st.paragraph_format
    pf.line_spacing = 1.5
    pf.space_before = Pt(0)
    pf.space_after = Pt(0)


def add_runs(p, text):
    """Tulis teks dengan dukungan **tebal**, *miring*, dan sorot [isi nanti]/[konfirmasi ...]."""
    tokens = re.split(r"(\*\*[^*]+\*\*|\*[^*]+\*|\[(?:isi nanti|konfirmasi[^\]]*)\])", text)
    for t in tokens:
        if not t:
            continue
        if t.startswith("**") and t.endswith("**"):
            inner = t[2:-2]
            if re.fullmatch(r"\[(?:isi nanti|konfirmasi[^\]]*)\]", inner):
                r = p.add_run(inner)
                r.font.highlight_color = WD_COLOR_INDEX.YELLOW
            else:
                r = p.add_run(inner)
                r.bold = True
        elif t.startswith("*") and t.endswith("*"):
            r = p.add_run(t[1:-1])
            r.italic = True
        elif t.startswith("["):
            r = p.add_run(t)
            r.font.highlight_color = WD_COLOR_INDEX.YELLOW
        else:
            p.add_run(t)


def para(doc, text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, first_indent=None, bold=False, size=None,
         left_indent=None, hanging=None, space_after=0, keep_next=False):
    p = doc.add_paragraph()
    p.alignment = align
    pf = p.paragraph_format
    if first_indent is not None:
        pf.first_line_indent = first_indent
    if left_indent is not None:
        pf.left_indent = left_indent
    if hanging is not None:
        pf.first_line_indent = -hanging
    pf.space_after = Pt(space_after)
    pf.keep_with_next = keep_next
    if text:
        if bold or size:
            r = p.add_run(text)
            r.bold = bold
            if size:
                r.font.size = Pt(size)
        else:
            add_runs(p, text)
    return p


def page_break(doc):
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)


def add_page_number_footer(section, fmt, start=None):
    sectPr = section._sectPr
    pg = sectPr.find(qn("w:pgNumType"))
    if pg is None:
        pg = OxmlElement("w:pgNumType")
        sectPr.append(pg)
    pg.set(qn("w:fmt"), fmt)
    if start is not None:
        pg.set(qn("w:start"), str(start))
    section.footer.is_linked_to_previous = False
    fp = section.footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for r in list(fp.runs):
        r._r.getparent().remove(r._r)
    run = fp.add_run()
    for tag, txt in (("begin", None), (None, "PAGE"), ("end", None)):
        if tag:
            el = OxmlElement("w:fldChar")
            el.set(qn("w:fldCharType"), tag)
        else:
            el = OxmlElement("w:instrText")
            el.set(qn("xml:space"), "preserve")
            el.text = txt
        run._r.append(el)
    run.font.name = FONT
    run.font.size = Pt(12)


def margins(section):
    section.page_width, section.page_height = Cm(21), Cm(29.7)
    section.left_margin, section.top_margin = Cm(4), Cm(4)
    section.right_margin, section.bottom_margin = Cm(3), Cm(3)


# ---------- konten ----------
def cover(doc):
    para(doc, JUDUL, WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14)
    para(doc, SUBJUDUL, WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=12, space_after=24)
    para(doc, "LAPORAN", WD_ALIGN_PARAGRAPH.CENTER, bold=True)
    para(doc, "Disusun untuk Memenuhi Tugas Ujian Akhir Semester", WD_ALIGN_PARAGRAPH.CENTER)
    para(doc, "Mata Kuliah Sistem Informasi Manajemen", WD_ALIGN_PARAGRAPH.CENTER, space_after=24)
    p = para(doc, "", WD_ALIGN_PARAGRAPH.CENTER, space_after=24)
    logo = os.path.join(ROOT, "assets", "logo-uniss.png")
    if os.path.exists(logo):
        p.add_run().add_picture(logo, width=Cm(4.5))
    para(doc, "Disusun Oleh:", WD_ALIGN_PARAGRAPH.CENTER)
    para(doc, "Adip Kharis Sofan", WD_ALIGN_PARAGRAPH.CENTER, bold=True)
    para(doc, "NIM 20124501", WD_ALIGN_PARAGRAPH.CENTER, space_after=36)
    for line in ("PROGRAM STUDI TEKNIK INFORMATIKA", "FAKULTAS KOMPUTER DESAIN",
                 "UNIVERSITAS SELAMAT SRI", "KENDAL", "2026"):
        para(doc, line, WD_ALIGN_PARAGRAPH.CENTER, bold=True)


def heading_center(doc, text):
    p = para(doc, "", WD_ALIGN_PARAGRAPH.CENTER, space_after=12, keep_next=True)
    r = p.add_run(text)
    r.bold = True
    return p


def toc(doc, entries, pages):
    heading_center(doc, "DAFTAR ISI")
    for level, text in entries:
        p = doc.add_paragraph()
        pf = p.paragraph_format
        pf.left_indent = Cm(0.75 * level)
        pf.tab_stops.add_tab_stop(Cm(14), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
        r = p.add_run(text)
        r.bold = level == 0
        p.add_run("\t" + pages.get(text, ""))


def parse_bab(path):
    """Ubah markdown bab menjadi daftar blok: (jenis, level, teks)."""
    blocks = []
    with open(path, encoding="utf-8") as f:
        lines = f.read().splitlines()
    buf = []

    def flush():
        if buf:
            blocks.append(("p", 0, " ".join(buf)))
            buf.clear()

    for ln in lines:
        s = ln.strip()
        if not s:
            flush()
            continue
        if s.startswith(">"):
            flush()
            continue
        m = re.match(r"^(#{1,3})\s+(.*)$", s)
        if m:
            flush()
            blocks.append(("h", len(m.group(1)), m.group(2)))
            continue
        m = re.match(r"^(\d+)\.\s+(.*)$", s)
        if m:
            flush()
            blocks.append(("li", int(m.group(1)), m.group(2)))
            continue
        buf.append(s)
    flush()
    return blocks


def render_bab(doc, blocks, toc_entries):
    for kind, lvl, text in blocks:
        if kind == "h" and lvl == 1:
            m = re.match(r"^(BAB\s+[IVX]+)\s+(.*)$", text)
            heading_center(doc, m.group(1) if m else text)._p  # baris "BAB I"
            if m:
                heading_center(doc, m.group(2))
                toc_entries.append((0, f"{m.group(1)} {m.group(2)}"))
            else:
                toc_entries.append((0, text))
        elif kind == "h":
            p = para(doc, "", WD_ALIGN_PARAGRAPH.LEFT, keep_next=True)
            p.paragraph_format.space_before = Pt(12 if lvl == 2 else 6)
            r = p.add_run(text)
            r.bold = True
            toc_entries.append((lvl - 1, text))
        elif kind == "li":
            p = para(doc, "", left_indent=Cm(0.75), hanging=Cm(0.75))
            p.paragraph_format.tab_stops.add_tab_stop(Cm(0.75))
            p.add_run(f"{lvl}.\t")
            add_runs(p, text)
        else:
            para(doc, text, first_indent=Cm(1.25))


def cited_authors(md_texts):
    """Kumpulkan nama penulis pertama yang disitasi di teks bab."""
    names = set()
    for t in md_texts:
        for m in re.finditer(r"([A-Z][A-Za-z'’\-]+)(?: dkk\.| & [A-Z][A-Za-z]+| dan [A-Z][A-Za-z]+)?,? \(?(20\d\d)\)?", t):
            names.add((m.group(1), m.group(2)))
    return names


def daftar_pustaka(doc, cited):
    with open(os.path.join(LAPORAN, "02-referensi.md"), encoding="utf-8") as f:
        txt = f.read()
    sec = txt.split("## C. Daftar Pustaka", 1)[1]
    refs = [r.strip() for r in sec.split("\n\n") if re.match(r"^[A-Z]", r.strip())]
    heading_center(doc, "DAFTAR PUSTAKA")
    count = 0
    for r in refs:
        first = r.split(",", 1)[0]
        year = re.search(r"\((20\d\d)\)", r)
        if not year or (first, year.group(1)) not in cited:
            continue
        r = re.sub(r"\s\*\([^)]*\)\*$", "", r)  # buang catatan internal
        r = re.sub(r"\s\*\(DOI[^)]*\)\*", "", r)
        p = para(doc, "", WD_ALIGN_PARAGRAPH.LEFT, left_indent=Cm(1.25), hanging=Cm(1.25), space_after=6)
        p.paragraph_format.line_spacing = 1.0
        add_runs(p, r)
        count += 1
    return count


def build(pages=None):
    pages = pages or {}
    doc = Document()
    set_base_styles(doc)
    margins(doc.sections[0])
    cover(doc)

    # Bagian awal (romawi)
    sec = doc.add_section(WD_SECTION.NEW_PAGE)
    margins(sec)
    add_page_number_footer(sec, "lowerRoman", start=1)
    toc_placeholder_index = len(doc.paragraphs)

    # Isi (angka)
    sec = doc.add_section(WD_SECTION.NEW_PAGE)
    margins(sec)
    add_page_number_footer(sec, "decimal", start=1)
    toc_entries = []
    texts = []
    for i, fn in enumerate(BAB_FILES):
        if i:
            page_break(doc)
        blocks = parse_bab(os.path.join(LAPORAN, fn))
        texts += [b[2] for b in blocks]
        render_bab(doc, blocks, toc_entries)
    page_break(doc)
    toc_entries.append((0, "DAFTAR PUSTAKA"))
    n = daftar_pustaka(doc, cited_authors(texts))

    # Sisipkan daftar isi di bagian romawi
    tmp = Document()
    set_base_styles(tmp)
    toc(tmp, toc_entries, pages)
    anchor = doc.paragraphs[toc_placeholder_index - 1]._p  # paragraf terakhir sampul
    sectbreak_par = anchor  # daftar isi masuk setelah pemisah bagian sampul
    for el in reversed(list(tmp.element.body)):
        if el.tag.endswith("sectPr"):
            continue
        sectbreak_par.addnext(el)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    doc.save(OUT)
    return toc_entries, n


def page_map(entries):
    """Render ke PDF lalu cari nomor halaman setiap judul (BAB I = halaman 1)."""
    if not shutil.which("soffice") or not shutil.which("pdftotext"):
        return {}
    d = tempfile.mkdtemp()
    subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", d, OUT],
                   check=True, capture_output=True)
    pdf = os.path.join(d, os.path.basename(OUT).replace(".docx", ".pdf"))
    text = subprocess.run(["pdftotext", "-layout", pdf, "-"], capture_output=True, text=True).stdout
    pages_txt = text.split("\f")
    norm = lambda s: re.sub(r"\s+", " ", s).strip().lower()
    start = next(i for i, pg in enumerate(pages_txt) if re.search(r"^\s*BAB I\s*$", pg, re.M) and "DAFTAR ISI" not in pg)
    result = {}
    for _, t in entries:
        key = norm(re.sub(r"^BAB [IVX]+ ", "", t))
        for i in range(start, len(pages_txt)):
            if key in norm(pages_txt[i]):
                result[t] = str(i - start + 1)
                break
    return result


if __name__ == "__main__":
    entries, n = build()
    pages = page_map(entries)
    build(pages)
    print(f"OK: {OUT}  ({len(entries)} entri daftar isi, {n} referensi)")
    sys.exit(0)
