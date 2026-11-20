#!/usr/bin/env python3
"""Kemas + periksa OUTPUT SIAP satu episode Ohhiyaa! (terkunci owner 16 Nov 2026):
   1 MP4  +  2 thumbnail  +  1 judul  +  1 deskripsi  (judul & deskripsi DITAMPILKAN di chat dalam kotak kode, BUKAN berkas .txt).

Usage:  python3 video/src/siap.py ohNN

Membaca : video/out/ohhiyaa-ohNN.mp4, video/out/thumb/ohNN-A.png & ohNN-B.png,
          naskah/ohNN-*.md, bagian "## Paket posting": "### Judul" (1 kotak kode) dan "### Deskripsi" (1 kotak kode)
Menulis : video/out/siap/ohNN/{ohNN.mp4, ohNN-thumb-A.png, ohNN-thumb-B.png}  (tanpa .txt)
Mencetak: judul + deskripsi dalam kotak kode siap salin (tempel apa adanya ke balasan chat).
Gagal (exit 1) kalau: MP4 bukan 1080x1920 H.264+AAC 40-55 dtk; thumbnail bukan tepat 2 (1080x1920);
judul bukan tepat 1 baris, >70 karakter, atau tidak berakhiran "| OHHIYAA!"; deskripsi tanpa ajakan 👇 atau baris
hashtag terakhir bukan 5-8 hashtag huruf kecil yang diawali #shorts.
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
# --- judul + deskripsi (kotak kode di naskah)
judul = desk = None
if not nask: err.append(f'naskah/{ep}-*.md tidak ada')
else:
    txt = Path(nask[0]).read_text(encoding='utf-8')
    post = txt.split('## Paket posting')[-1] if '## Paket posting' in txt else ''
    blocks = re.findall(r"```\n(.*?)\n```", post, flags=re.S)
    if len(blocks) != 2: err.append('Paket posting harus berisi tepat 2 kotak kode: "### Judul" lalu "### Deskripsi"')
    else:
        judul, desk = blocks[0].strip(), blocks[1].strip()
        if '\n' in judul: err.append('judul harus tepat 1 baris')
        if len(judul) > 70: err.append(f'judul {len(judul)} karakter (maks 70)')
        if not judul.endswith('| OHHIYAA!'): err.append('judul harus berakhiran "| OHHIYAA!"')
        if '👇' not in desk: err.append('deskripsi harus memuat ajakan komentar dengan 👇')
        tags = re.findall(r'#\w+', desk.splitlines()[-1])
        if not (5 <= len(tags) <= 8) or tags[0] != '#shorts' or any(t != t.lower() for t in tags): err.append('baris terakhir deskripsi harus 5-8 hashtag huruf kecil diawali #shorts')
if err:
    print('GAGAL — output belum siap:'); [print(' -', e) for e in err]; sys.exit(1)

out = ROOT / 'video' / 'out' / 'siap' / ep
if out.exists(): shutil.rmtree(out)
out.mkdir(parents=True)
shutil.copy(mp4, out / f'{ep}.mp4')
shutil.copy(th[0], out / f'{ep}-thumb-A.png'); shutil.copy(th[1], out / f'{ep}-thumb-B.png')
print(f'SIAP {out.relative_to(ROOT)}  |  {dur:.1f} dtk  |  judul {len(judul)} karakter\n')
print('Judul:\n```\n' + judul + '\n```\n')
print('Deskripsi YouTube Shorts:\n```\n' + desk + '\n```')
