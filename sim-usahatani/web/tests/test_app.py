"""Tes rumus (BAB II) dan alur utama (activity diagram BAB IV).

Jalankan dari folder web/:  python -m pytest -q
"""
import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture()
def klien(tmp_path, monkeypatch):
    monkeypatch.setenv("SIM_DB", str(tmp_path / "uji.db"))
    import importlib
    import db
    importlib.reload(db)
    import app as aplikasi
    importlib.reload(aplikasi)
    aplikasi.app.config["TESTING"] = True
    with aplikasi.app.test_client() as c:
        yield c


def token(c):
    c.get("/login")
    with c.session_transaction() as s:
        return s["csrf"]


def kirim(c, path, data, **kw):
    return c.post(path, data=dict(data, csrf=token(c)), **kw)


def masuk(c, user="bapak"):
    return kirim(c, "/login", {"username": user, "password": "tani123"}, follow_redirects=True)


# ---- rumus
def test_alokasi_bersama_rumus_2_8():
    import hitung
    # contoh panduan presentasi: B=600.000, petak 1.800/2.000 m², padi 4 dari 7 bulan
    assert round(hitung.alokasi_bersama(600000, 1800, 2000, 4, 7)) == 308571
    assert round(hitung.alokasi_bersama(600000, 1800, 2000, 3, 7)) == 231429
    assert round(hitung.alokasi_bersama(600000, 200, 2000, 12, 12)) == 60000
    assert hitung.alokasi_bersama(600000, 1800, 2000, 4, 0) == 0


def test_ringkasan_musim_padi(klien):
    import db, hitung
    c = db.connect()
    r = hitung.ringkasan(c, 1)
    assert round(r["TR"]) == 8040000                 # (2.2) 1.200 kg × Rp6.700
    assert round(r["TC"]) == 6240000                 # (2.1)
    assert round(r["pendapatan"]) == 1800000         # (2.3)
    assert round(r["rc_total"], 2) == 1.29           # (2.4)
    assert round(r["hpp"]) == 5200                   # (2.5)
    assert round(r["bep_kg"]) == 931                 # (2.6)
    h = hitung.harga_terakhir(c, "padi")
    assert round(h["margin"]) == 1600                # (2.7) 6.800 − 5.200


def test_biaya_bersama_terbagi_habis(klien):
    import db, hitung
    c = db.connect()
    total = sum(hitung.ringkasan(c, i)["bersama"] for i in (1, 2, 3))
    assert round(total) == 600000


# ---- alur
def test_login_gagal_dan_berhasil(klien):
    r = kirim(klien, "/login", {"username": "bapak", "password": "salah"}, follow_redirects=True)
    assert "salah" in r.get_data(as_text=True)
    r = masuk(klien)
    assert "Harga pengepul hari ini" in r.get_data(as_text=True)


def test_pencatat_tidak_bisa_buka_laporan(klien):
    masuk(klien, "pencatat")
    assert klien.get("/laporan").status_code == 403
    assert klien.get("/catat").status_code == 200


def test_catat_biaya_validasi_dan_simpan(klien):
    masuk(klien, "pencatat")
    r = kirim(klien, "/catat", {"tanggal": "2026-11-28", "jumlah": "", "sifat": "tunai", "tujuan": "2"}, follow_redirects=True)
    assert "belum lengkap" in r.get_data(as_text=True)
    r = kirim(klien, "/catat", {"tanggal": "2026-11-28", "jenis": "Pupuk", "jumlah": "250.000", "sifat": "tunai", "tujuan": "2"}, follow_redirects=True)
    assert "Tersimpan: Pupuk Rp250.000" in r.get_data(as_text=True)


def test_update_harga_dan_laporan(klien):
    masuk(klien)
    r = kirim(klien, "/harga", {"tanggal": "2026-11-28", "padi": "7.000"}, follow_redirects=True)
    t = r.get_data(as_text=True)
    assert "Harga tersimpan" in t and "Untung Rp1.800 setiap kg" in t
    t = klien.get("/laporan?musim=1").get_data(as_text=True)
    assert "Rp1.800.000" in t and "Layak" in t


# ---- regresi bug yang pernah ditemukan
INPUT_RUSAK = [
    ("/catat", {"tanggal": "2026-11-28", "jenis": "Pupuk", "jumlah": "1000", "sifat": "tunai", "tujuan": "abc"}),
    ("/catat", {"tanggal": "2026-11-28", "jenis": "Pupuk", "jumlah": "1000", "sifat": "tunai", "tujuan": "999"}),
    ("/catat", {"tanggal": "2026-11-28", "jenis": "Pupuk", "jumlah": "1000", "sifat": "gratis", "tujuan": "2"}),
    ("/catat", {"tanggal": "2026-11-28", "jenis": "Pupuk", "jumlah": "1000", "sifat": "tunai", "tujuan": "1"}),  # musim sudah ditutup
    ("/catat", {"tanggal": "kemarin", "jenis": "Pupuk", "jumlah": "1000", "sifat": "tunai", "tujuan": "2"}),
    ("/catat/panen", {"tanggal": "2026-11-28", "musim_id": "x", "kg": "10"}),
    ("/catat/jual", {"tanggal": "2026-11-28", "musim_id": "77", "kg": "10", "harga": "5000"}),
    ("/musim", {"aksi": "tutup", "id": "zz"}),
    ("/musim", {"aksi": "tutup", "id": "2", "selesai": "2020-01-01"}),
    ("/musim", {"komoditas": "kopi", "petak_id": "1", "mulai": "2026-12-01", "lama_bulan": "3"}),
    ("/musim", {"komoditas": "padi", "petak_id": "9", "mulai": "2026-12-01", "lama_bulan": "3"}),
    ("/musim", {"komoditas": "padi", "petak_id": "1", "mulai": "besok", "lama_bulan": "3"}),
    ("/pengguna", {"aksi": "hapus", "id": "q"}),
    ("/harga", {"tanggal": "xx", "padi": "7000"}),
]


@pytest.mark.parametrize("path,data", INPUT_RUSAK)
def test_input_rusak_ditolak_tanpa_error(klien, path, data):
    import db
    masuk(klien)
    c = db.connect()
    sebelum = [c.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] for t in ("biaya", "panen", "penjualan", "musim", "harga_harian")]
    r = kirim(klien, path, data, follow_redirects=True)
    assert r.status_code == 200
    assert "tidak valid" in r.get_data(as_text=True) or "tidak ditemukan" in r.get_data(as_text=True) or "tidak boleh" in r.get_data(as_text=True)
    sesudah = [c.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] for t in ("biaya", "panen", "penjualan", "musim", "harga_harian")]
    assert sebelum == sesudah                       # tidak ada data rusak yang tersimpan
    for hal in ("/", "/catat", "/harga", "/laporan", "/musim"):
        assert klien.get(hal).status_code == 200


def test_hapus_pencatat_yang_punya_catatan(klien):
    import db
    masuk(klien, "pencatat")
    kirim(klien, "/catat", {"tanggal": "2026-11-28", "jenis": "Pupuk", "jumlah": "1000", "sifat": "tunai", "tujuan": "2"})
    masuk(klien)
    r = kirim(klien, "/pengguna", {"aksi": "hapus", "id": "2"}, follow_redirects=True)
    assert r.status_code == 200 and "Pengguna dihapus" in r.get_data(as_text=True)
    c = db.connect()
    assert c.execute("SELECT COUNT(*) FROM biaya WHERE jumlah=1000").fetchone()[0] == 1  # catatan tetap ada


def test_tanpa_token_csrf_ditolak(klien):
    masuk(klien)
    r = klien.post("/harga", data={"tanggal": "2026-11-28", "padi": "9000"})
    assert r.status_code == 400
    r = klien.post("/login", data={"username": "bapak", "password": "tani123"})
    assert r.status_code == 400


def test_tutup_musim_valid(klien):
    masuk(klien)
    r = kirim(klien, "/musim", {"aksi": "tutup", "id": "2", "selesai": "2026-11-28"}, follow_redirects=True)
    assert "Musim ditutup" in r.get_data(as_text=True)
    assert klien.get("/").status_code == 200
