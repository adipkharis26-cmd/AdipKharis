"""Basis data SQLite: skema dan data contoh.

Data contoh adalah ILUSTRASI (bukan data asli lahan) dan angkanya sama dengan desain Figma:
musim padi 2026 -> penerimaan Rp8.040.000, total biaya Rp6.240.000, HPP Rp5.200/kg.
"""
import os
import sqlite3

from werkzeug.security import generate_password_hash

DB_PATH = os.environ.get("SIM_DB", os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "tani.db"))

SKEMA = """
CREATE TABLE IF NOT EXISTS pengguna (
  id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, nama TEXT NOT NULL,
  password_hash TEXT NOT NULL, peran TEXT NOT NULL CHECK (peran IN ('pemilik','pencatat'))
);
CREATE TABLE IF NOT EXISTS petak (
  id INTEGER PRIMARY KEY, nama TEXT NOT NULL, luas_m2 REAL NOT NULL CHECK (luas_m2 > 0)
);
-- "musim" = periode analisis: musim tanam (padi/jagung) atau periode tahunan (pisang)
CREATE TABLE IF NOT EXISTS musim (
  id INTEGER PRIMARY KEY, komoditas TEXT NOT NULL CHECK (komoditas IN ('padi','jagung','pisang')),
  petak_id INTEGER NOT NULL REFERENCES petak(id), mulai TEXT NOT NULL, selesai TEXT,
  lama_bulan REAL NOT NULL CHECK (lama_bulan > 0), target_kg REAL
);
CREATE TABLE IF NOT EXISTS biaya (
  id INTEGER PRIMARY KEY, tanggal TEXT NOT NULL, jenis TEXT NOT NULL, jumlah REAL NOT NULL CHECK (jumlah > 0),
  sifat TEXT NOT NULL CHECK (sifat IN ('tunai','diperhitungkan')),
  musim_id INTEGER REFERENCES musim(id),          -- NULL = biaya bersama
  keterangan TEXT, dicatat_oleh INTEGER REFERENCES pengguna(id)
);
CREATE TABLE IF NOT EXISTS panen (
  id INTEGER PRIMARY KEY, musim_id INTEGER NOT NULL REFERENCES musim(id), tanggal TEXT NOT NULL,
  kg REAL NOT NULL CHECK (kg > 0), dicatat_oleh INTEGER REFERENCES pengguna(id)
);
CREATE TABLE IF NOT EXISTS penjualan (
  id INTEGER PRIMARY KEY, musim_id INTEGER NOT NULL REFERENCES musim(id), tanggal TEXT NOT NULL,
  kg REAL NOT NULL CHECK (kg > 0), harga_per_kg REAL NOT NULL CHECK (harga_per_kg > 0), pengepul TEXT,
  dicatat_oleh INTEGER REFERENCES pengguna(id)
);
CREATE TABLE IF NOT EXISTS harga_harian (
  id INTEGER PRIMARY KEY, tanggal TEXT NOT NULL, komoditas TEXT NOT NULL CHECK (komoditas IN ('padi','jagung','pisang')),
  harga_per_kg REAL NOT NULL CHECK (harga_per_kg > 0), UNIQUE (tanggal, komoditas)
);
"""


def connect(path=None):
    path = path or DB_PATH
    os.makedirs(os.path.dirname(path), exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init(conn, contoh=True):
    conn.executescript(SKEMA)
    if contoh and conn.execute("SELECT COUNT(*) FROM pengguna").fetchone()[0] == 0:
        isi_contoh(conn)
    conn.commit()


def isi_contoh(conn):
    ex = conn.execute
    for u, n, p in [("bapak", "Bapak (Pemilik)", "pemilik"), ("pencatat", "Ibu (Pencatat)", "pencatat")]:
        ex("INSERT INTO pengguna (username,nama,password_hash,peran) VALUES (?,?,?,?)",
           (u, n, generate_password_hash("tani123"), p))
    ex("INSERT INTO petak (id,nama,luas_m2) VALUES (1,'Petak utama',1800),(2,'Petak pisang',200)")
    ex("""INSERT INTO musim (id,komoditas,petak_id,mulai,selesai,lama_bulan,target_kg) VALUES
          (1,'padi',1,'2026-06-01','2026-09-30',4,1200),
          (2,'jagung',1,'2026-10-12',NULL,3,900),
          (3,'pisang',2,'2026-01-01',NULL,12,150)""")
    biaya = [
        # musim padi (tunai = 4.800.000)
        ("2026-06-01", "Benih", 450000, "tunai", 1), ("2026-06-03", "Pupuk", 1350000, "tunai", 1),
        ("2026-07-10", "Obat", 400000, "tunai", 1), ("2026-06-02", "Upah buruh", 1000000, "tunai", 1),
        ("2026-09-28", "Upah buruh", 1200000, "tunai", 1), ("2026-09-29", "Sewa alat", 400000, "tunai", 1),
        ("2026-09-30", "Tenaga keluarga", 1131429, "diperhitungkan", 1),
        # musim jagung berjalan (tunai = 3.450.000)
        ("2026-10-12", "Benih", 900000, "tunai", 2), ("2026-11-20", "Pupuk", 460000, "tunai", 2),
        ("2026-10-25", "Pupuk", 690000, "tunai", 2), ("2026-11-10", "Obat", 125000, "tunai", 2),
        ("2026-10-12", "Upah buruh", 975000, "tunai", 2), ("2026-11-27", "Upah buruh", 300000, "tunai", 2),
        ("2026-11-27", "Tenaga keluarga", 1200000, "diperhitungkan", 2),
        # pisang (periode 2026)
        ("2026-03-05", "Pupuk", 155000, "tunai", 3), ("2026-11-01", "Tenaga keluarga", 100000, "diperhitungkan", 3),
        # biaya bersama 2026 (B = 600.000)
        ("2026-11-15", "Pajak lahan", 400000, "tunai", None), ("2026-01-01", "Penyusutan alat", 200000, "diperhitungkan", None),
    ]
    conn.executemany("INSERT INTO biaya (tanggal,jenis,jumlah,sifat,musim_id,dicatat_oleh) VALUES (?,?,?,?,?,1)", biaya)
    ex("INSERT INTO panen (musim_id,tanggal,kg,dicatat_oleh) VALUES (1,'2026-09-28',1200,1),(3,'2026-08-15',150,1)")
    ex("""INSERT INTO penjualan (musim_id,tanggal,kg,harga_per_kg,pengepul,dicatat_oleh) VALUES
          (1,'2026-09-30',1200,6700,'Pak Darto',1),(3,'2026-08-16',150,4000,'Pak Darto',1)""")
    harga = [("2026-11-24", 6650, 5300, 3900), ("2026-11-25", 6700, 5250, 3900),
             ("2026-11-26", 6700, 5200, 4000), ("2026-11-27", 6800, 5100, 4000)]
    for tgl, pd, jg, ps in harga:
        conn.executemany("INSERT INTO harga_harian (tanggal,komoditas,harga_per_kg) VALUES (?,?,?)",
                         [(tgl, "padi", pd), (tgl, "jagung", jg), (tgl, "pisang", ps)])
