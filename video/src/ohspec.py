#!/usr/bin/env python3
"""SATU berkas spesifikasi per episode -> menghasilkan SEMUA bahan teks (hemat token + anti-duplikat + keaslian).
Usage:  python3 video/src/ohspec.py ohNN            periksa saja (validasi + cek duplikat), tidak menulis apa pun
        python3 video/src/ohspec.py ohNN --simpan   periksa, lalu tulis:
             video/vo/ohNN.txt, naskah/ohNN-<slug>.md, video/thumb/ohNN.json, dan catat topik ke workflow/oh-topik.json
Input   : video/spec/ohNN.json (lihat video/spec/CONTOH.json). Jangan menulis naskah/vo/thumb JSON manual lagi.
Menolak (exit 1) bila: format/alur/jawaban tidak sama dengan hasil `oh_format.py ohNN` (dilarang menukar), VO bukan 6 paragraf
atau di luar 85–115 kata, judul/deskripsi tak sesuai aturan, thumbnail bukan 2, sumber primer <2, tanpa sudut_baru/web_cek,
atau topik duplikat/terlalu mirip dengan registri (judul, objek, patokan, objek terlalu sering, patokan terlalu sering).
"""
import json, re, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
REG = ROOT / 'workflow' / 'oh-topik.json'
ep = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__)
sp = json.loads((ROOT / 'video' / 'spec' / f'{ep}.json').read_text(encoding='utf-8'))
reg = json.loads(REG.read_text(encoding='utf-8')); R = reg['aturan']
err, warn = [], []
tok = lambda s: set(re.findall(r'[a-z0-9]+', s.lower())) - {'di', 'ke', 'yang', 'dan', 'atau', 'dari', 'ohhiyaa', 'setinggi', 'apa', 'benar', 'bohong'}
jac = lambda a, b: len(a & b) / len(a | b) if a | b else 0.0

# 1) format/alur/jawaban harus = hasil acak terkunci
fm = json.loads(subprocess.run([sys.executable, str(ROOT / 'video' / 'src' / 'oh_format.py'), ep], capture_output=True, text=True, check=True).stdout)
for k in ('format', 'alur', 'jawaban'):
    if sp.get(k) != fm[k]: err.append(f'{k} di spec "{sp.get(k)}" != hasil oh_format.py "{fm[k]}" (dilarang menukar)')
# 2) VO
vo = sp.get('vo', []); words = sum(len(p.split()) for p in vo)
if len(vo) != 6: err.append(f'VO harus 6 paragraf (ada {len(vo)})')
if not 85 <= words <= 115: err.append(f'VO {words} kata (harus 85–115)')
# 3) judul + deskripsi
j = sp.get('judul', ''); d = sp.get('deskripsi', {})
if len(j) > 70 or not j.endswith('| OHHIYAA!'): err.append('judul maks 70 karakter dan berakhiran "| OHHIYAA!"')
tags = re.findall(r'#\w+', d.get('hashtag', ''))
if not (5 <= len(tags) <= 8) or tags[:1] != ['#shorts'] or any(t != t.lower() for t in tags): err.append('hashtag 5–8, huruf kecil, diawali #shorts')
for k in ('pembuka', 'hitungan', 'cta'):
    if not d.get(k): err.append(f'deskripsi.{k} kosong')
if '👇' not in d.get('cta', ''): err.append('deskripsi.cta harus memuat 👇')
# 4) thumbnail + keaslian
th = sp.get('thumb', [])
if [t.get('nama') for t in th] != ['A', 'B']: err.append('thumb harus tepat 2 varian bernama A dan B')
k = sp.get('keaslian', {})
if len([s for s in k.get('sumber_primer', []) if len(s) > 8]) < 2: err.append('keaslian.sumber_primer minimal 2 sumber (lembaga + dokumen/halaman)')
if len(k.get('sudut_baru', '')) < 25: err.append('keaslian.sudut_baru wajib (apa yang BARU dibanding episode lain, ≥25 karakter)')
if len(k.get('web_cek', '')) < 25: err.append('keaslian.web_cek wajib (pencarian apa yang dijalankan + hasilnya: tak ada judul/visual identik, ≥25 karakter)')
# 5) duplikat vs registri (abaikan entri ep yang sama)
past = [e for e in reg['episode'] if e['ep'] != ep]
ob, pa, jt = set(sp.get('objek', [])), set(sp.get('patokan', [])), tok(j)
if not ob: err.append('objek wajib diisi (mis. ["galon"])')
for e in past:
    if jac(jt, tok(e['judul'])) > R['judul_jaccard_maks']: err.append(f"judul terlalu mirip {e['ep']} ({e['judul']})")
    if set(e['objek']) == ob and jac(pa, set(e['patokan'])) > R['objek_sama_dan_patokan_jaccard_maks']: err.append(f"objek+patokan hampir sama dengan {e['ep']}")
last6, last5 = past[-6:], past[-5:]
for o in ob:
    n = sum(o in e['objek'] for e in last6)
    if n >= R['objek_maks_dalam_6_episode_terakhir']: err.append(f'objek "{o}" sudah dipakai {n}× di 6 episode terakhir (maks {R["objek_maks_dalam_6_episode_terakhir"]}): ganti objek')
for q in pa:
    n = sum(q in e['patokan'] for e in last5)
    if n >= R['patokan_maks_dalam_5_episode_terakhir']: err.append(f'patokan "{q}" sudah dipakai {n}× di 5 episode terakhir (maks {R["patokan_maks_dalam_5_episode_terakhir"]}): pakai patokan baru, mis. {", ".join(reg["kolam_patokan_baru"][:4])}')
if err:
    print('GAGAL — spec belum layak:'); [print(' -', e) for e in err]; sys.exit(1)
print(f'SPEC OK {ep}: {words} kata VO, format {fm["format"]}/{fm["alur"]}/{fm["jawaban"]}, tidak duplikat')
if '--simpan' not in sys.argv: sys.exit(0)

# --- tulis bahan
slug = re.sub(r'[^a-z0-9]+', '-', sp.get('slug', j.split('|')[0]).lower()).strip('-')[:40]
(ROOT / 'video' / 'vo' / f'{ep}.txt').write_text('\n\n'.join(vo) + '\n', encoding='utf-8')
th_json = {'ep': ep, 'catatan': sp.get('thumb_catatan', f'Thumbnail {ep}. Jangan tampilkan jawaban.'), 'varian': [], 'thumbPilihan': 'A'}
for t in th:
    th_json['varian'].append({'nama': t['nama'], 'alasan': t['alasan'], 'latar': {'frame': t['frame'], 'zoom': t.get('zoom', 1.0), 'fokus': t.get('fokus', [540, 900])},
                              'y': 360, 'teks': t['teks'], 'stiker': t.get('stiker', [])})
(ROOT / 'video' / 'thumb' / f'{ep}.json').write_text(json.dumps(th_json, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
bag = ['1. Hook', '2. Interaksi', '3. Satuan', '4. Hitung/tangga', '5. OHHIYAA!', '6. Personal + loop']
L = ['> Voice Over: Papa Gufron', '', f'# Ohhiyaa! — "{j.split("|")[0].strip()}"', '',
     f'- Format: **{fm["nama_format"]}** · Alur: **{fm["nama_alur"]}** · Jawaban: **{fm["jawaban"]}** (hasil `oh_format.py {ep}`, acak, terkunci)',
     f'- Seri: {sp.get("seri", "Ukur Pakai Barang Sehari-hari")} · VO {words} kata', '']
for i, p in enumerate(vo):
    L += [f'## {bag[i]}'] + ([f'- Layar: {sp["layar"][i]}'] if sp.get('layar') and len(sp['layar']) > i else []) + [f'- VO: {p}', '']
L += ['## Hitungan & sumber'] + [f'- {x}' for x in sp.get('hitungan', [])] + [f'- **Asumsi:** {x}' for x in sp.get('asumsi', [])] + \
     [f'- Sumber primer: {x}' for x in k['sumber_primer']] + [f'- **Sudut baru:** {k["sudut_baru"]}', f'- **Cek web:** {k["web_cek"]}', '']
desc = f'{d["pembuka"]}\n{d["hitungan"]}\n\n{d["cta"]}\n\n{d["hashtag"]}'
L += ['## Paket posting', '### Judul', '```', j, '```', '### Deskripsi', '```', desc, '```', '']
(ROOT / 'naskah' / f'{ep}-{slug}.md').write_text('\n'.join(L), encoding='utf-8')
reg['episode'] = [e for e in reg['episode'] if e['ep'] != ep] + [{'ep': ep, 'judul': j.split('|')[0].strip(), 'objek': sorted(ob), 'patokan': sorted(pa), 'format': fm['format'], 'alur': fm['alur']}]
REG.write_text(json.dumps(reg, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'DITULIS: video/vo/{ep}.txt, naskah/{ep}-{slug}.md, video/thumb/{ep}.json, registri topik')
