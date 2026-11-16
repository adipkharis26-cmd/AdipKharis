#!/usr/bin/env python3
"""Kemas + periksa OUTPUT SIAP satu episode Ohhiyaa! (terkunci owner 16 Nov 2026):
   1 MP4  +  2 thumbnail  +  1 judul  +  1 deskripsi.

Usage:  python3 video/src/siap.py ohNN

Membaca : video/out/ohhiyaa-ohNN.mp4, video/out/thumb/ohNN-A.png & ohNN-B.png,
          naskah/ohNN-*.md (bagian "Paket posting": **Judul:**, **Deskripsi:**, **Hashtag:**)
Menulis : video/out/siap/ohNN/{ohNN.mp4, ohNN-thumb-A.png, ohNN-thumb-B.png, judul.txt, deskripsi.txt}
Gagal (exit 1) kalau ada yang tidak memenuhi: MP4 1080x1920 H.264+AAC 40-55 dtk; thumbnail tepat 2 (1080x1920);
judul tepat 1 dan <=70 karakter; deskripsi tepat 1 (hashtag digabung di akhir deskripsi, 5-8 buah).
"""
import glob, json, re, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ep = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__)
err = []


def probe(p):
    o = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_type,codec_name,width,height',
                        '-of', 'json', str(p)], capture_output=True, text=True)
    return json.loads(o.stdout) if o.returncode == 0 else None


mp4 = ROOT / 'video' / 'out' / f'ohhiyaa-{ep}.mp4'
th = [ROOT / 'video' / 'out' / 'thumb' / f'{ep}-{v}.png' for v in 'AB']
nask = sorted(glob.glob(str(ROOT / 'naskah' / f'{ep}-*.md')))

# --- MP4
info = probe(mp4) if mp4.exists() else None
if not info: err.append(f'MP4 tidak ada/rusak: {mp4}')
else:
    v = next((s for s in info['streams'] if s['codec_type'] == 'video'), {})
    a = next((s for s in info['streams'] if s['codec_type'] == 'audio'), {})
    dur = float(info['format']['duration'])
    if (v.get('width'), v.get('height')) != (1080, 1920): err.append(f"MP4 resolusi {v.get('width')}x{v.get('height')} (harus 1080x1920)")
    if v.get('codec_name') != 'h264': err.append('MP4 bukan H.264')
    if a.get('codec_name') != 'aac': err.append('MP4 tanpa audio AAC')
    if not 40 <= dur <= 55: err.append(f'durasi {dur:.1f} dtk di luar 40-55')
# --- thumbnails
for t in th:
    i = probe(t) if t.exists() else None
    s = i and i['streams'][0]
    if not i: err.append(f'thumbnail tidak ada: {t.name}')
    elif (s['width'], s['height']) != (1080, 1920): err.append(f'{t.name} ukuran {s["width"]}x{s["height"]} (harus 1080x1920)')
# --- judul + deskripsi
judul = desk = tags = None
if not nask: err.append(f'naskah/{ep}-*.md tidak ada')
else:
    txt = Path(nask[0]).read_text(encoding='utf-8')
    post = txt.split('## Paket posting')[-1] if '## Paket posting' in txt else ''
    g = lambda k: (re.findall(rf'\*\*{k}:\*\*\s*(.+)', post) or [None])
    J, D, H = g('Judul'), g('Deskripsi'), g('Hashtag')
    if len(J) != 1 or not J[0]: err.append('harus tepat 1 baris **Judul:** di Paket posting')
    else: judul = J[0].strip()
    if len(D) != 1 or not D[0]: err.append('harus tepat 1 baris **Deskripsi:** di Paket posting')
    else: desk = D[0].strip()
    if H and H[0]: tags = H[0].strip()
    if judul and len(judul) > 70: err.append(f'judul {len(judul)} karakter (maks 70)')
    if tags and not 5 <= len(re.findall(r'#\w+', tags)) <= 8: err.append('hashtag harus 5-8')
if err:
    print('GAGAL — output belum siap:'); [print(' -', e) for e in err]; sys.exit(1)

out = ROOT / 'video' / 'out' / 'siap' / ep
if out.exists(): shutil.rmtree(out)
out.mkdir(parents=True)
shutil.copy(mp4, out / f'{ep}.mp4')
shutil.copy(th[0], out / f'{ep}-thumb-A.png'); shutil.copy(th[1], out / f'{ep}-thumb-B.png')
(out / 'judul.txt').write_text(judul + '\n', encoding='utf-8')
(out / 'deskripsi.txt').write_text(desk + ('\n\n' + tags if tags else '') + '\n', encoding='utf-8')
print(f'SIAP {out.relative_to(ROOT)}  |  {dur:.1f} dtk  |  judul {len(judul)} karakter')
print('  judul    :', judul); print('  deskripsi:', desk[:90] + ('…' if len(desk) > 90 else ''))
