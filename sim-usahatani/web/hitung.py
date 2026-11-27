"""Perhitungan analisis usaha tani (BAB II rumus 2.1–2.8).

TC = FC + VC (di sini: biaya tunai + biaya diperhitungkan + bagian biaya bersama)   (2.1)
TR = P × Q  (jumlah penjualan)                                                     (2.2)
π  = TR − TC                                                                       (2.3)
R/C = TR ÷ TC                                                                      (2.4)
HPP = TC ÷ Q                                                                       (2.5)
BEP produksi = TC ÷ P                                                              (2.6)
Margin per kg = harga harian − HPP                                                 (2.7)
Bᵢ = B × (Lₚ ÷ Lₜ) × (tᵢ ÷ T)                                                      (2.8)
"""


def alokasi_bersama(B, luas_petak, luas_total, t_i, T):
    """Rumus (2.8). Mengembalikan 0 bila data pembagi tidak lengkap."""
    if not (B and luas_total and T):
        return 0.0
    return B * (luas_petak / luas_total) * (t_i / T)


def rasio(a, b):
    return a / b if b else None


def _tahun(tgl):
    return tgl[:4]


def bagian_bersama(conn, musim):
    """Bagian biaya bersama untuk satu musim, dipisah per sifat (tunai/diperhitungkan)."""
    th = _tahun(musim["mulai"])
    luas_total = conn.execute("SELECT SUM(luas_m2) FROM petak").fetchone()[0] or 0
    luas_petak = conn.execute("SELECT luas_m2 FROM petak WHERE id=?", (musim["petak_id"],)).fetchone()[0]
    T = conn.execute("SELECT SUM(lama_bulan) FROM musim WHERE petak_id=? AND substr(mulai,1,4)=?",
                     (musim["petak_id"], th)).fetchone()[0] or 0
    hasil = {}
    for sifat in ("tunai", "diperhitungkan"):
        B = conn.execute("SELECT COALESCE(SUM(jumlah),0) FROM biaya WHERE musim_id IS NULL AND sifat=? "
                         "AND substr(tanggal,1,4)=?", (sifat, th)).fetchone()[0]
        hasil[sifat] = alokasi_bersama(B, luas_petak, luas_total, musim["lama_bulan"], T)
    return hasil


def ringkasan(conn, musim_id):
    m = conn.execute("SELECT * FROM musim WHERE id=?", (musim_id,)).fetchone()
    if m is None:
        return None
    q = lambda sql, *a: conn.execute(sql, a).fetchone()[0] or 0
    tunai = q("SELECT SUM(jumlah) FROM biaya WHERE musim_id=? AND sifat='tunai'", musim_id)
    diperhitungkan = q("SELECT SUM(jumlah) FROM biaya WHERE musim_id=? AND sifat='diperhitungkan'", musim_id)
    bb = bagian_bersama(conn, m)
    bersama = bb["tunai"] + bb["diperhitungkan"]
    TC = tunai + diperhitungkan + bersama
    panen_kg = q("SELECT SUM(kg) FROM panen WHERE musim_id=?", musim_id)
    jual_kg = q("SELECT SUM(kg) FROM penjualan WHERE musim_id=?", musim_id)
    TR = q("SELECT SUM(kg*harga_per_kg) FROM penjualan WHERE musim_id=?", musim_id)
    harga_rata = rasio(TR, jual_kg)
    dasar_kg = panen_kg or (m["target_kg"] or 0)  # HPP sementara memakai target bila belum panen
    hpp = rasio(TC, dasar_kg)
    return {
        "musim": dict(m), "tunai": tunai, "diperhitungkan": diperhitungkan, "bersama": bersama,
        "bersama_tunai": bb["tunai"], "TC": TC, "panen_kg": panen_kg, "jual_kg": jual_kg, "TR": TR,
        "pendapatan": TR - TC, "rc_total": rasio(TR, TC), "rc_tunai": rasio(TR, tunai + bb["tunai"]),
        "hpp": hpp, "hpp_sementara": not panen_kg, "harga_rata": harga_rata,
        "bep_kg": rasio(TC, harga_rata) if harga_rata else None,
    }


def hpp_acuan(conn, komoditas):
    """HPP pembanding harga harian: musim berjalan (HPP sementara) atau musim terakhir."""
    m = conn.execute("SELECT id FROM musim WHERE komoditas=? ORDER BY (selesai IS NULL) DESC, mulai DESC LIMIT 1",
                     (komoditas,)).fetchone()
    return ringkasan(conn, m["id"])["hpp"] if m else None


def harga_terakhir(conn, komoditas):
    rows = conn.execute("SELECT tanggal,harga_per_kg FROM harga_harian WHERE komoditas=? ORDER BY tanggal DESC LIMIT 2",
                        (komoditas,)).fetchall()
    sekarang = rows[0] if rows else None
    kemarin = rows[1] if len(rows) > 1 else None
    hpp = hpp_acuan(conn, komoditas)
    margin = (sekarang["harga_per_kg"] - hpp) if (sekarang and hpp) else None  # rumus (2.7)
    return {"komoditas": komoditas, "sekarang": sekarang, "kemarin": kemarin, "hpp": hpp, "margin": margin}
