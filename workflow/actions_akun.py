#!/usr/bin/env python3
"""Penyimpanan akun & state rilis_worker.py saat jalan di GitHub Actions (mesinnya hilang tiap selesai).

  muat   : branch `rilis-state` (sudah di-checkout di data/state) + Secret SOSMED_AKUN_JSON
           → data/rilis_state.json dan data/sosmed/<channel>.json
  simpan : data/rilis_state.json + akun (token yang sudah diperbarui, DIENKRIPSI dengan Secret SOSMED_KEY)
           → data/state/ (lalu di-commit oleh workflow)

Aturan gabung akun: isi Secret = sumber utama. Token hasil refresh yang tersimpan terenkripsi dipakai
hanya selama entri Secret untuk akun itu tidak berubah. Kalau owner mengganti/menambah akun di Secret,
entri baru langsung dipakai.
"""
import hashlib
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
STATE = DATA / "state"
AKUN = DATA / "sosmed"
ENC = STATE / "sosmed.enc"


def _openssl(arg, data):
    return subprocess.run(["openssl", "enc", "-aes-256-cbc", "-pbkdf2", "-iter", "200000", "-salt", *arg,
                           "-pass", "env:SOSMED_KEY"], input=data, capture_output=True, check=True).stdout


def muat():
    if (STATE / "rilis_state.json").exists():
        shutil.copy2(STATE / "rilis_state.json", DATA / "rilis_state.json")
    secret = json.loads(os.environ.get("SOSMED_AKUN_JSON") or "{}")
    lama = {}
    if ENC.exists() and os.environ.get("SOSMED_KEY"):
        try:
            lama = json.loads(_openssl(["-d"], ENC.read_bytes()))
        except Exception as e:
            print(f"akun terenkripsi tidak bisa dibuka ({e}); pakai isi Secret", file=sys.stderr)
    AKUN.mkdir(parents=True, exist_ok=True)
    for ch, plat in secret.items():
        akun = {}
        for p, ent in plat.items():
            h = hashlib.sha256(json.dumps(ent, sort_keys=True).encode()).hexdigest()
            simpanan = lama.get(ch, {}).get(p, {})
            akun[p] = simpanan if simpanan.get("_sumber") == h else {**ent, "_sumber": h}
        f = AKUN / f"{ch}.json"
        f.write_text(json.dumps(akun), encoding="utf-8")
        os.chmod(f, 0o600)
    print(f"akun dimuat: {sorted(secret)}")


def simpan():
    STATE.mkdir(parents=True, exist_ok=True)
    if (DATA / "rilis_state.json").exists():
        shutil.copy2(DATA / "rilis_state.json", STATE / "rilis_state.json")
    if not os.environ.get("SOSMED_KEY"):
        print("SOSMED_KEY kosong: token hasil refresh tidak disimpan", file=sys.stderr)
        return
    semua = {f.stem: json.loads(f.read_text(encoding="utf-8")) for f in sorted(AKUN.glob("*.json"))}
    if semua:
        ENC.write_bytes(_openssl([], json.dumps(semua).encode()))


if __name__ == "__main__":
    {"muat": muat, "simpan": simpan}[sys.argv[1]]()
