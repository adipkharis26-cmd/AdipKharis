#!/usr/bin/env python3
"""Pipeline produksi Ohhiyaa! HEMAT: satu perintah, hanya mengerjakan yang perlu, keluaran sangat ringkas.
Usage:  python3 video/src/ohrun.py ohNN              jalankan: spec(cek) -> lint -> mix -> render -> thumbnail -> siap
        python3 video/src/ohrun.py ohNN --rencana    hanya tampilkan apa yang AKAN dikerjakan (tanpa menjalankan)
        python3 video/src/ohrun.py ohNN --force      paksa render ulang (jangan, kecuali scene/mesin memang berubah)
Aturan hemat: tiap tahap dilewati kalau hasilnya lebih baru daripada semua masukannya (mtime). Render penuh (±15 menit)
HANYA jika mp4 belum ada/usang. Lint dijalankan lebih dulu supaya render tidak gagal di tengah. Jalankan perintah ini
dengan run_in_background (satu notifikasi selesai), JANGAN memantau lewat polling/Monitor berulang.
"""
import os, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]; SRC = ROOT / 'video' / 'src'; OUT = ROOT / 'video' / 'out'
ep = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__)
plan, force = '--rencana' in sys.argv, '--force' in sys.argv
env = {**os.environ, 'EP': ep}
mt = lambda p: p.stat().st_mtime if p.exists() else 0
newest = lambda ps: max(mt(p) for p in ps)
vo = ROOT / 'video' / 'vo'
mp3, mix = vo / f'{ep}.mp3', vo / f'{ep}-mix.m4a'
mp4 = OUT / f'ohhiyaa-{ep}.mp4'
html = SRC / f'{ep}.html'
loaded = [SRC / m for m in __import__('re').findall(r'src="([^"]+\.js)"', html.read_text() if html.exists() else '') if '/' not in m]
code = list({*loaded, SRC / f'{ep}.js', html, SRC / 'render.js'})   # hanya berkas yang benar-benar dimuat halaman episode
def run(cmd, **kw): return subprocess.run(cmd, cwd=SRC, env=env, capture_output=True, text=True, **kw)
def say(s): print(s, flush=True)

spec = ROOT / 'video' / 'spec' / f'{ep}.json'
if spec.exists():
    r = run([sys.executable, str(SRC / 'ohspec.py'), ep]); say((r.stdout or r.stderr).strip())
    if r.returncode: sys.exit(1)
if not mp3.exists(): sys.exit(f'GAGAL: {mp3.name} belum ada (jalankan tts_elevenlabs.py {ep} dulu)')
if not (SRC / f'{ep}.js').exists(): sys.exit(f'GAGAL: video/src/{ep}.js belum ada')
need_mix = force or mt(mix) < newest([mp3, SRC / f'{ep}.js', SRC / 'leluhur_mix.py'])
need_render = force or mt(mp4) < max(newest(code), mt(mix) if not need_mix else float('inf'), mt(mp3))
tj = ROOT / 'video' / 'thumb' / f'{ep}.json'; th = [OUT / 'thumb' / f'{ep}-{v}.png' for v in 'AB']
need_th = tj.exists() and (any(not p.exists() for p in th) or min(mt(p) for p in th) < max(mt(tj), mt(SRC / 'ohhiyaa3d.js')) or need_render)
say(f'RENCANA {ep}: lint=ya mix={"ya" if need_mix else "lewati"} render={"YA (±15 menit)" if need_render else "lewati"} thumbnail={"ya" if need_th else "lewati"}')
if plan: sys.exit(0)

r = run(['node', 'ohlint.js']); say(r.stdout.strip() or r.stderr.strip())
if r.returncode: sys.exit(1)
if need_mix:
    r = run([sys.executable, 'leluhur_mix.py', ep]); say((r.stdout.strip().splitlines() or ['mix: ?'])[-1])
    if r.returncode: sys.exit('MIX GAGAL: ' + r.stderr[-300:])
if need_render:
    OUT.mkdir(parents=True, exist_ok=True)
    log = OUT / f'{ep}-render.log'
    with open(log, 'w') as lf: rc = subprocess.run(['node', 'render.js', 'video', str(mp4), '30', str(mix)], cwd=SRC, env=env, stdout=lf, stderr=subprocess.STDOUT).returncode
    if rc: sys.exit('RENDER GAGAL, lihat ' + str(log.relative_to(ROOT)) + ': ' + log.read_text()[-300:])
    say('render selesai')
if need_th:
    r = run(['node', 'thumbnail.js', ep])
    if r.returncode: sys.exit('THUMBNAIL GAGAL: ' + (r.stderr or r.stdout)[-300:])
    say('thumbnail A/B selesai')
r = run([sys.executable, 'siap.py', ep]); say(r.stdout.strip() or r.stderr.strip())
sys.exit(r.returncode)
