# Motion — karakter bergerak (2.5D MMV) tanpa After Effects

Versi ini menganimasikan **karakternya**, bukan cuma zoom foto: rambut dan jubah tertiup angin, sayap mengepak, napas, kepala menoleh, iblis melayang, mata menyala, dan kamera 2.5D dengan parallax antar layer. Semua gerak memakai keyframe dengan easing seperti di AE.

## Repo GitHub yang dipakai

| Repo | Dipakai untuk | Padanan di After Effects |
|---|---|---|
| [danielgatis/rembg](https://github.com/danielgatis/rembg) — model `isnet-anime.onnx` (dari [SkyTNT/anime-segmentation](https://github.com/SkyTNT/anime-segmentation)) | Memisah karakter anime dari background | Roto Brush |
| [isl-org/MiDaS](https://github.com/isl-org/MiDaS) — `model-small.onnx` | Depth map (cadangan; kurang akurat untuk anime) | Depth matte / 3D layer |
| [google/fonts](https://github.com/google/fonts) — Fjalla One, Metal Mania, Inter | Tipografi mirip referensi | Text layer |
| OpenCV `inpaint` | Mengisi background di balik karakter | Content-Aware Fill |
| `engine.py` (ditulis sendiri) | Deformasi mesh: wind / rotate / bob / breathe | Puppet Pin + Duik Ángela (spring, follow-through) |

Repo AE di skill (`Remirdy/AfterEffectsMCP`, `HeroicSwan/after-effects-mcp`, `RxLaboratory/Duik`, dll.) butuh After Effects yang sedang berjalan. Environment cloud ini tidak punya AE (Linux tanpa GPU), jadi teknik yang sama dibuat ulang di Python. Rig dan keyframe di `edits/*.py` bisa dipindahkan satu-satu ke AE: setiap part = 1 Puppet Pin atau 1 layer ber-pivot.

## Cara pakai

```bash
pip install onnxruntime opencv-python-headless numpy pillow
```
```bash
mkdir -p models && curl -L -o models/isnet-anime.onnx https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-anime.onnx
```
```bash
python3 fetch_images.py edits/funk_mandala_motion.py images/
```
```bash
python3 motion/render_motion.py edits/funk_mandala_motion.py images/ funk_mandala.mp3 out.mp4 --models models
```
Preview cepat untuk shot tertentu saja (tanpa audio):
```bash
python3 motion/render_motion.py edits/funk_mandala_motion.py images/ funk_mandala.mp3 preview.mp4 --models models --only 2,10
```

## Menulis rig per shot (`edits/*.py`)

Koordinat = posisi relatif di gambar asli (0–1). Waktu keyframe = detik sejak awal shot.

| Part | Kegunaan | Parameter penting |
|---|---|---|
| `wind` | Rambut, jubah, ekor, poni | `region`, `amp` (0.003–0.012), `freq` (Hz), `edge=True` → hanya ujung siluet yang bergerak |
| `rotate` | Sayap mengepak, kepala menoleh | `pivot`, `angle` (keyframe derajat), `ease="back"` untuk overshoot, `osc=(derajat, Hz, fase)` |
| `bob` | Objek melayang (iblis, grimoire) | `osc=(amplitudo, Hz, fase)` |
| `breathe` | Napas dada/badan | `osc=(skala, Hz)`, `pivot` (biasanya kaki) |
| `protect` | Area wajah yang tidak boleh terdistorsi | ellipse; part rigid (rotate/bob) tetap menggerakkan wajah secara utuh |

Kamera: `focus`, `zoom`, `pan`, `rot` semuanya bisa di-keyframe; `parallax_bg` (default 0.55) = seberapa lambat background bergerak dibanding karakter. Efek: `eyes` (titik mata, warna, intensitas, radius), `rays` (light rays di belakang karakter), `rim` (rim light di tepi siluet).

## Prinsip yang dijaga

- Wajah, proporsi, dan garis tinta tidak didistorsi (protect + sharpen tinta).
- Gerakan halus dan berarah: angin memakai gelombang + noise lembut, handheld wiggle 0.6 Hz, tanpa jitter acak.
- Flash hanya 2–3 frame di 4 hentakan utama; tidak ada strobo.
- Teks minimal: hook, nama di drop, penutup, satu subtitle, dan watermark.
