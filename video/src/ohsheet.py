#!/usr/bin/env python3
"""SATU lembar preview untuk satu episode Ohhiyaa! (aturan CLAUDE.md §1: preview = gambar berurutan, bukan video).
Usage:  python3 video/src/ohsheet.py ohNN            -> video/out/sheet/ohNN.png (8 frame, 1 baris, ±1.700 px)
        python3 video/src/ohsheet.py ohNN 2 9.5 30   -> frame di detik yang ditentukan sendiri (revisi terarah)
Titik otomatis dipilih dari timing VO: hook, interaksi, satuan, tengah & akhir tangga/hitung, OHHIYAA!, penutup.
Cetak HANYA jalur berkas (hemat token); buka dengan Read sekali, jangan render ulang berulang-ulang.
"""
import json, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]; SRC = ROOT / 'video' / 'src'
ep = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__)
vo = json.loads((ROOT / 'video' / 'vo' / f'{ep}.json').read_text(encoding='utf-8'))
W = vo['words']; dur = vo['duration'] + 0.8
if len(sys.argv) > 2: ts = [float(x) for x in sys.argv[2:]]
else:
    sec = {}
    for w in W: sec.setdefault(w['sec'], []).append(w)
    S = {k: (v[0]['s'], v[-1]['e']) for k, v in sec.items()}; n = len(S)
    ohh = next((w['s'] for w in W if w['w'].lower().startswith('ohhiyaa')), None)
    a = lambda k, f: S[k][0] + (S[k][1] - S[k][0]) * f
    ts = [S[0][0] + 1.5, a(1, .6), a(2, .5), a(3, .3), a(3, .85), (ohh + .5) if ohh else a(n - 2, .8), a(n - 1, .3), a(n - 1, .9)]
ts = [round(min(max(t, .2), dur - .2), 2) for t in ts]
out = ROOT / 'video' / 'out' / 'sheet'; out.mkdir(parents=True, exist_ok=True)
tmp = out / f'_{ep}'; tmp.mkdir(exist_ok=True)
env = {**__import__('os').environ, 'EP': ep}
r = subprocess.run(['node', 'render.js', 'stills', str(tmp)] + [str(t) for t in ts], cwd=SRC, env=env, capture_output=True, text=True)
if r.returncode: sys.exit('RENDER STILLS GAGAL: ' + (r.stderr or r.stdout)[-300:])
ins = []; fl = []
for i, t in enumerate(ts): ins += ['-i', str(tmp / f'f_{t}.png')]; fl.append(f'[{i}]scale=210:-1[v{i}]')
fc = ';'.join(fl) + ';' + ''.join(f'[v{i}]' for i in range(len(ts))) + f'hstack={len(ts)}'
sheet = out / f'{ep}.png'
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *ins, '-filter_complex', fc, str(sheet)], check=True)
for f in tmp.glob('*.png'): f.unlink()
tmp.rmdir()
print(sheet.relative_to(ROOT), '| detik:', ' '.join(str(t) for t in ts))
