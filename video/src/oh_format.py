#!/usr/bin/env python3
"""Pilih ACAK format interaksi + kerangka alur + posisi jawaban untuk satu episode Ohhiyaa!.

Usage:  python3 video/src/oh_format.py oh04            # tampilkan pilihan (tidak menyimpan)
        python3 video/src/oh_format.py oh04 --simpan   # tampilkan + catat ke workflow/oh-format.json (riwayat)

Aturan (ditetapkan owner 16 Nov 2026): jangan terus-menerus A/B/C dan jawaban jangan selalu sama.
 - format  : tidak boleh sama dengan 2 episode terakhir
 - alur    : tidak boleh sama dengan episode terakhir (dipilih dari alur yang cocok dengan format)
 - jawaban : tidak boleh sama dengan jawaban episode terakhir yang memakai format sama (kalau ada)
Seed = id episode, jadi hasilnya tetap sama kalau dijalankan ulang (tidak berubah di tengah produksi).
Output JSON: {"format","alur","jawaban","komentar","overlay","aturan"}.
"""
import hashlib, json, random, sys
from pathlib import Path

CONF = Path(__file__).resolve().parents[2] / 'workflow' / 'oh-format.json'


def pilih(ep, conf):
    rnd = random.Random(int(hashlib.sha256(ep.encode()).hexdigest(), 16))
    riw = [r for r in conf['riwayat'] if r['ep'] != ep]
    fmts = list(conf['format'])
    terakhir2 = [r['format'] for r in riw[-2:]]
    last_alur = riw[-1]['alur'] if riw else None
    # format yang punya minimal satu alur berbeda dari episode terakhir (supaya alur tidak berulang)
    layak = [f for f in fmts if any(a != last_alur for a in conf['format'][f]['alur'])] or fmts
    kandidat = [f for f in layak if f not in terakhir2] or layak
    f = rnd.choice(kandidat)
    fc = conf['format'][f]
    alur_ok = [a for a in fc['alur'] if not riw or a != riw[-1]['alur']] or fc['alur']
    a = rnd.choice(alur_ok)
    slots = fc['slot_jawaban']
    prev = [r['jawaban'] for r in riw if r['format'] == f]
    sl = [s for s in slots if not prev or s != prev[-1]] or slots
    j = rnd.choice(sl)
    return {'ep': ep, 'format': f, 'nama_format': fc['nama'], 'alur': a, 'nama_alur': conf['alur'][a]['nama'],
            'jawaban': j, 'komentar': fc['komentar'], 'overlay': fc['overlay'], 'aturan': fc['aturan'],
            'urutan_alur': conf['alur'][a]['urutan']}


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    ep = sys.argv[1]
    conf = json.loads(CONF.read_text(encoding='utf-8'))
    hasil = pilih(ep, conf)
    if '--simpan' in sys.argv:
        conf['riwayat'] = [r for r in conf['riwayat'] if r['ep'] != ep] + [
            {k: hasil[k] for k in ('ep', 'format', 'alur', 'jawaban')}]
        CONF.write_text(json.dumps(conf, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(hasil, ensure_ascii=False, indent=2))
