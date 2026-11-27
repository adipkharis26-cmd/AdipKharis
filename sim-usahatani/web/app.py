"""Catatan Tani — SIM Keuangan Usaha Tani Multi-Komoditas (web responsif).

Jalankan:  python app.py   lalu buka http://localhost:5000
Dari HP (satu WiFi): buka http://<IP-laptop>:5000
Akun contoh: bapak / tani123 (Pemilik), pencatat / tani123 (Pencatat)
"""
import os
from datetime import date
from functools import wraps

from flask import Flask, abort, flash, g, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

import db
import hitung

app = Flask(__name__)
app.secret_key = os.environ.get("SIM_SECRET", "ganti-kunci-ini-saat-dipakai-sungguhan")

KOMODITAS = ["padi", "jagung", "pisang"]
JENIS_BIAYA = ["Benih", "Pupuk", "Obat", "Upah buruh", "Sewa alat", "Tenaga keluarga", "Pajak lahan", "Penyusutan alat", "Lainnya"]


# ---------------------------------------------------------------- utilitas
def conn():
    if "db" not in g:
        g.db = db.connect()
    return g.db


@app.teardown_appcontext
def tutup(_):
    c = g.pop("db", None)
    if c is not None:
        c.close()


@app.template_filter("rp")
def rp(n, tanda=False):
    if n is None:
        return "–"
    s = f"{abs(round(n)):,}".replace(",", ".")
    awal = ("+" if n > 0 else "−" if n < 0 else "") if tanda else ("−" if n < 0 else "")
    return f"{awal}Rp{s}"


@app.template_filter("angka")
def angka(n, desimal=0):
    if n is None:
        return "–"
    if desimal:
        return f"{n:.{desimal}f}".replace(".", ",")
    return f"{round(n):,}".replace(",", ".")


@app.template_filter("tgl")
def tgl(s):
    if not s:
        return "–"
    bln = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
    y, m, d = s.split("-")
    return f"{int(d)} {bln[int(m) - 1]} {y}"


def pengguna():
    uid = session.get("uid")
    return conn().execute("SELECT * FROM pengguna WHERE id=?", (uid,)).fetchone() if uid else None


def perlu_login(peran=None):
    def dek(f):
        @wraps(f)
        def bungkus(*a, **k):
            u = pengguna()
            if u is None:
                return redirect(url_for("login"))
            g.user = u
            if peran and u["peran"] != peran:
                abort(403)
            return f(*a, **k)
        return bungkus
    return dek


def musim_aktif():
    return conn().execute(
        "SELECT m.*, p.nama AS petak FROM musim m JOIN petak p ON p.id=m.petak_id "
        "WHERE m.selesai IS NULL ORDER BY m.komoditas = 'pisang', m.mulai").fetchall()


def hari_ke(mulai):
    return (date.today() - date.fromisoformat(mulai)).days + 1


app.jinja_env.globals.update(hari_ke=hari_ke)


# ---------------------------------------------------------------- akses
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        u = conn().execute("SELECT * FROM pengguna WHERE username=?", (request.form.get("username", "").strip(),)).fetchone()
        if u and check_password_hash(u["password_hash"], request.form.get("password", "")):
            session.clear()
            session["uid"] = u["id"]
            return redirect(url_for("beranda" if u["peran"] == "pemilik" else "catat"))
        flash("Nama pengguna atau kata sandi salah.", "galat")
    return render_template("login.html")


@app.route("/keluar")
def keluar():
    session.clear()
    return redirect(url_for("login"))


# ---------------------------------------------------------------- beranda
@app.route("/")
@perlu_login()
def beranda():
    if g.user["peran"] != "pemilik":
        return redirect(url_for("catat"))
    c = conn()
    aktif = musim_aktif()
    berjalan = next((m for m in aktif if m["komoditas"] != "pisang"), None)
    ring_berjalan = hitung.ringkasan(c, berjalan["id"]) if berjalan else None
    lalu = c.execute("SELECT id FROM musim WHERE selesai IS NOT NULL ORDER BY selesai DESC LIMIT 1").fetchone()
    ring_lalu = hitung.ringkasan(c, lalu["id"]) if lalu else None
    harga = [hitung.harga_terakhir(c, k) for k in KOMODITAS]
    return render_template("beranda.html", berjalan=berjalan, rb=ring_berjalan, rl=ring_lalu, harga=harga)


# ---------------------------------------------------------------- pencatatan
def _wajib(form, *nama):
    return [n for n in nama if not form.get(n, "").strip()]


def num(s):
    """Baca angka gaya Indonesia: '1.200' -> 1200, '2,5' -> 2.5. Tidak valid -> 0."""
    try:
        return float((s or "").strip().replace(".", "").replace(",", "."))
    except ValueError:
        return 0.0


@app.route("/catat", methods=["GET", "POST"])
@perlu_login()
def catat():
    c = conn()
    if request.method == "POST":
        f = request.form
        kurang = _wajib(f, "tanggal", "jenis", "jumlah", "sifat", "tujuan")
        jumlah = num(f.get("jumlah"))
        if kurang or jumlah <= 0:
            flash("Data belum lengkap. Isi tanggal, jumlah, jenis, cara bayar, dan tujuan biaya.", "galat")
        else:
            musim_id = None if f["tujuan"] == "bersama" else int(f["tujuan"])
            c.execute("INSERT INTO biaya (tanggal,jenis,jumlah,sifat,musim_id,keterangan,dicatat_oleh) VALUES (?,?,?,?,?,?,?)",
                      (f["tanggal"], f["jenis"], jumlah, f["sifat"], musim_id, f.get("keterangan"), g.user["id"]))
            c.commit()
            flash(f"Tersimpan: {f['jenis']} {rp(jumlah)}", "sukses")
            return redirect(url_for("catat"))
    terakhir = c.execute("SELECT b.*, m.komoditas FROM biaya b LEFT JOIN musim m ON m.id=b.musim_id "
                         "ORDER BY b.tanggal DESC, b.id DESC LIMIT 6").fetchall()
    return render_template("catat.html", musim=musim_aktif(), jenis=JENIS_BIAYA, terakhir=terakhir,
                           hari_ini=date.today().isoformat(), tab="biaya")


@app.route("/catat/panen", methods=["GET", "POST"])
@perlu_login()
def catat_panen():
    c = conn()
    if request.method == "POST":
        f = request.form
        if _wajib(f, "tanggal", "musim_id", "kg") or num(f.get("kg")) <= 0:
            flash("Data belum lengkap. Isi tanggal, komoditas, dan jumlah panen.", "galat")
        else:
            c.execute("INSERT INTO panen (musim_id,tanggal,kg,dicatat_oleh) VALUES (?,?,?,?)",
                      (int(f["musim_id"]), f["tanggal"], num(f["kg"]), g.user["id"]))
            c.commit()
            flash(f"Tersimpan: panen {angka(num(f['kg']))} kg", "sukses")
            return redirect(url_for("catat_panen"))
    terakhir = c.execute("SELECT p.*, m.komoditas FROM panen p JOIN musim m ON m.id=p.musim_id ORDER BY p.tanggal DESC LIMIT 6").fetchall()
    semua = c.execute("SELECT * FROM musim ORDER BY selesai IS NULL DESC, mulai DESC").fetchall()
    return render_template("catat_panen.html", musim=semua, terakhir=terakhir, hari_ini=date.today().isoformat(), tab="panen")


@app.route("/catat/jual", methods=["GET", "POST"])
@perlu_login()
def catat_jual():
    c = conn()
    if request.method == "POST":
        f = request.form
        if _wajib(f, "tanggal", "musim_id", "kg", "harga") or num(f.get("kg")) <= 0 or num(f.get("harga")) <= 0:
            flash("Data belum lengkap. Isi tanggal, komoditas, jumlah, dan harga per kg.", "galat")
        else:
            c.execute("INSERT INTO penjualan (musim_id,tanggal,kg,harga_per_kg,pengepul,dicatat_oleh) VALUES (?,?,?,?,?,?)",
                      (int(f["musim_id"]), f["tanggal"], num(f["kg"]), num(f["harga"]), f.get("pengepul"), g.user["id"]))
            c.commit()
            flash(f"Tersimpan: penjualan {angka(num(f['kg']))} kg", "sukses")
            return redirect(url_for("catat_jual"))
    terakhir = c.execute("SELECT j.*, m.komoditas FROM penjualan j JOIN musim m ON m.id=j.musim_id ORDER BY j.tanggal DESC LIMIT 6").fetchall()
    semua = c.execute("SELECT * FROM musim ORDER BY selesai IS NULL DESC, mulai DESC").fetchall()
    return render_template("catat_jual.html", musim=semua, terakhir=terakhir, hari_ini=date.today().isoformat(), tab="jual")


# ---------------------------------------------------------------- harga harian
@app.route("/harga", methods=["GET", "POST"])
@perlu_login("pemilik")
def harga():
    c = conn()
    if request.method == "POST":
        tgl_ = request.form.get("tanggal") or date.today().isoformat()
        n = 0
        for k in KOMODITAS:
            v = num(request.form.get(k))
            if v > 0:
                c.execute("INSERT INTO harga_harian (tanggal,komoditas,harga_per_kg) VALUES (?,?,?) "
                          "ON CONFLICT(tanggal,komoditas) DO UPDATE SET harga_per_kg=excluded.harga_per_kg", (tgl_, k, v))
                n += 1
        c.commit()
        flash("Harga tersimpan." if n else "Belum ada harga yang diisi.", "sukses" if n else "galat")
        return redirect(url_for("harga"))
    data = [hitung.harga_terakhir(c, k) for k in KOMODITAS]
    riwayat = c.execute("""SELECT tanggal,
        MAX(CASE WHEN komoditas='padi' THEN harga_per_kg END) padi,
        MAX(CASE WHEN komoditas='jagung' THEN harga_per_kg END) jagung,
        MAX(CASE WHEN komoditas='pisang' THEN harga_per_kg END) pisang
        FROM harga_harian GROUP BY tanggal ORDER BY tanggal DESC LIMIT 7""").fetchall()
    return render_template("harga.html", data=data, riwayat=riwayat, hari_ini=date.today().isoformat())


# ---------------------------------------------------------------- laporan
@app.route("/laporan")
@perlu_login("pemilik")
def laporan():
    c = conn()
    semua = c.execute("SELECT * FROM musim ORDER BY mulai DESC").fetchall()
    if not semua:
        return render_template("laporan.html", r=None, semua=[])
    pilih = request.args.get("musim", type=int) or next((m["id"] for m in semua if m["selesai"]), semua[0]["id"])
    r = hitung.ringkasan(c, pilih)
    if r is None:
        abort(404)
    return render_template("laporan.html", r=r, semua=semua)


# ---------------------------------------------------------------- pengelolaan (pemilik)
@app.route("/akun")
@perlu_login()
def akun():
    return render_template("akun.html")


@app.route("/musim", methods=["GET", "POST"])
@perlu_login("pemilik")
def kelola_musim():
    c = conn()
    if request.method == "POST":
        f = request.form
        if f.get("aksi") == "tutup":
            c.execute("UPDATE musim SET selesai=? WHERE id=?", (f.get("selesai") or date.today().isoformat(), int(f["id"])))
            flash("Musim ditutup.", "sukses")
        elif _wajib(f, "komoditas", "petak_id", "mulai", "lama_bulan") or num(f.get("lama_bulan")) <= 0:
            flash("Data musim belum lengkap.", "galat")
        else:
            c.execute("INSERT INTO musim (komoditas,petak_id,mulai,lama_bulan,target_kg) VALUES (?,?,?,?,?)",
                      (f["komoditas"], int(f["petak_id"]), f["mulai"], num(f["lama_bulan"]), num(f.get("target_kg")) or None))
            flash("Musim baru dibuka.", "sukses")
        c.commit()
        return redirect(url_for("kelola_musim"))
    daftar = c.execute("SELECT m.*, p.nama petak FROM musim m JOIN petak p ON p.id=m.petak_id ORDER BY m.mulai DESC").fetchall()
    petak = c.execute("SELECT * FROM petak").fetchall()
    return render_template("musim.html", daftar=daftar, petak=petak, hari_ini=date.today().isoformat())


@app.route("/petak", methods=["GET", "POST"])
@perlu_login("pemilik")
def kelola_petak():
    c = conn()
    if request.method == "POST":
        for p in c.execute("SELECT id FROM petak").fetchall():
            v = num(request.form.get(f"luas_{p['id']}"))
            if v > 0:
                c.execute("UPDATE petak SET luas_m2=? WHERE id=?", (v, p["id"]))
        c.commit()
        flash("Luas petak tersimpan.", "sukses")
        return redirect(url_for("kelola_petak"))
    return render_template("petak.html", petak=c.execute("SELECT * FROM petak").fetchall())


@app.route("/pengguna", methods=["GET", "POST"])
@perlu_login("pemilik")
def kelola_pengguna():
    c = conn()
    if request.method == "POST":
        f = request.form
        if f.get("aksi") == "hapus":
            if int(f["id"]) == g.user["id"]:
                flash("Akun sendiri tidak bisa dihapus.", "galat")
            else:
                c.execute("DELETE FROM pengguna WHERE id=?", (int(f["id"]),))
                flash("Pengguna dihapus.", "sukses")
        elif _wajib(f, "username", "nama", "password"):
            flash("Isi nama, nama pengguna, dan kata sandi.", "galat")
        elif c.execute("SELECT 1 FROM pengguna WHERE username=?", (f["username"].strip(),)).fetchone():
            flash("Nama pengguna sudah dipakai.", "galat")
        else:
            c.execute("INSERT INTO pengguna (username,nama,password_hash,peran) VALUES (?,?,?,'pencatat')",
                      (f["username"].strip(), f["nama"].strip(), generate_password_hash(f["password"])))
            flash("Pencatat baru ditambahkan.", "sukses")
        c.commit()
        return redirect(url_for("kelola_pengguna"))
    return render_template("pengguna.html", daftar=c.execute("SELECT * FROM pengguna ORDER BY peran, nama").fetchall())


@app.errorhandler(403)
def dilarang(_):
    return render_template("pesan.html", judul="Tidak ada akses", isi="Halaman ini khusus untuk Pemilik."), 403


with app.app_context():
    _c = db.connect()
    db.init(_c)
    _c.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=os.environ.get("SIM_DEBUG") == "1")
