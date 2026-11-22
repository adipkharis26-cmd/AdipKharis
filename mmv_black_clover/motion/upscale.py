"""
upscale.py - Upscale gambar anime/manga dengan Real-ESRGAN (xinntao/Real-ESRGAN, model ncnn) di CPU.

Model: realesr-animevideov3-x2/x3/x4 (cepat, khusus anime) atau realesrgan-x4plus-anime (lebih tajam, lambat).
Dipakai agar karakter tetap tajam di output 2K (gambar wiki rata-rata hanya 700-1900 px).

  python3 motion/upscale.py in.png out.png --target 3000 --models models/resr/models
"""
import argparse
import os

import cv2
import ncnn
import numpy as np


def _net(models, name):
    net = ncnn.Net()
    net.opt.use_vulkan_compute = False
    net.opt.num_threads = os.cpu_count() or 4
    net.load_param(os.path.join(models, name + ".param"))
    net.load_model(os.path.join(models, name + ".bin"))
    return net


def run(rgb, models, scale, tile=256, pad=12):
    name = "realesr-animevideov3-x%d" % scale
    net = _net(models, name)
    h, w = rgb.shape[:2]
    out = np.zeros((h * scale, w * scale, 3), np.float32)
    src = rgb.astype(np.float32) / 255.0
    for y in range(0, h, tile):
        for x in range(0, w, tile):
            y0, x0 = max(0, y - pad), max(0, x - pad)
            y1, x1 = min(h, y + tile + pad), min(w, x + tile + pad)
            patch = np.ascontiguousarray(src[y0:y1, x0:x1].transpose(2, 0, 1))
            ex = net.create_extractor()
            ex.input("data", ncnn.Mat(patch))
            _, o = ex.extract("output")
            o = np.array(o).transpose(1, 2, 0)
            ty0, tx0 = (y - y0) * scale, (x - x0) * scale
            th, tw = (min(y + tile, h) - y) * scale, (min(x + tile, w) - x) * scale
            out[y * scale:y * scale + th, x * scale:x * scale + tw] = o[ty0:ty0 + th, tx0:tx0 + tw]
    return np.clip(out * 255, 0, 255).astype(np.uint8)


def upscale_to(rgb, models, target):
    """Upscale sampai sisi pendek >= target (pilih x2/x3/x4)."""
    short = min(rgb.shape[:2])
    if short >= target:
        return rgb
    need = target / short
    scale = 2 if need <= 2 else (3 if need <= 3 else 4)
    return run(rgb, models, scale)


def cached(path, models, target):
    out = os.path.splitext(path)[0] + ".up%d.png" % target
    img = cv2.imread(out, cv2.IMREAD_COLOR) if os.path.exists(out) else None
    if img is not None:
        return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    rgb = cv2.cvtColor(cv2.imread(path, cv2.IMREAD_COLOR), cv2.COLOR_BGR2RGB)
    up = upscale_to(rgb, models, target)
    cv2.imwrite(out, cv2.cvtColor(up, cv2.COLOR_RGB2BGR))
    return up


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--target", type=int, default=2200)
    ap.add_argument("--models", default="models/resr/models")
    a = ap.parse_args()
    rgb = cv2.cvtColor(cv2.imread(a.src, cv2.IMREAD_COLOR), cv2.COLOR_BGR2RGB)
    cv2.imwrite(a.dst, cv2.cvtColor(upscale_to(rgb, a.models, a.target), cv2.COLOR_RGB2BGR))
