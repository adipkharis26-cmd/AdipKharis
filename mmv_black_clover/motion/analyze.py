"""
analyze.py - Tahap 'rotoscoping + depth' sebelum animasi (pengganti Roto Brush & Depth di AE).

- Segmentasi karakter: model isnet-anime (SkyTNT/anime-segmentation, dibundel oleh danielgatis/rembg)
- Depth map: MiDaS v2.1 small (isl-org/MiDaS)
Keduanya dijalankan via onnxruntime di CPU. Hasil di-cache sebagai PNG di folder gambar.
"""
import os

import cv2
import numpy as np
import onnxruntime as ort

_sess = {}


def _session(path):
    if path not in _sess:
        so = ort.SessionOptions()
        so.intra_op_num_threads = os.cpu_count() or 4
        _sess[path] = ort.InferenceSession(path, so, providers=["CPUExecutionProvider"])
    return _sess[path]


def segment(img_rgb, model):
    """-> alpha float32 0..1 (karakter = 1)"""
    s = _session(model)
    h, w = img_rgb.shape[:2]
    x = cv2.resize(img_rgb, (1024, 1024), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0
    x = (x - 0.5) / 1.0
    x = x.transpose(2, 0, 1)[None]
    out = s.run(None, {s.get_inputs()[0].name: x})[0][0, 0]
    out = (out - out.min()) / (out.max() - out.min() + 1e-6)
    return cv2.resize(out, (w, h), interpolation=cv2.INTER_LINEAR).astype(np.float32)


def depth(img_rgb, model):
    """-> depth float32 0..1 (1 = dekat kamera)"""
    s = _session(model)
    h, w = img_rgb.shape[:2]
    x = cv2.resize(img_rgb, (256, 256), interpolation=cv2.INTER_CUBIC).astype(np.float32) / 255.0
    x = (x - np.array([0.485, 0.456, 0.406])) / np.array([0.229, 0.224, 0.225])
    x = x.transpose(2, 0, 1)[None].astype(np.float32)
    d = s.run(None, {s.get_inputs()[0].name: x})[0][0]
    d = cv2.resize(d, (w, h), interpolation=cv2.INTER_CUBIC)
    d = (d - np.percentile(d, 2)) / (np.percentile(d, 98) - np.percentile(d, 2) + 1e-6)
    return np.clip(d, 0, 1).astype(np.float32)


def cached(path_img, kind, fn, model):
    cache = os.path.splitext(path_img)[0] + ".%s.png" % kind
    if os.path.exists(cache):
        return cv2.imread(cache, cv2.IMREAD_UNCHANGED).astype(np.float32) / 65535.0
    rgb = cv2.cvtColor(cv2.imread(path_img, cv2.IMREAD_COLOR), cv2.COLOR_BGR2RGB)
    res = fn(rgb, model)
    cv2.imwrite(cache, (res * 65535).astype(np.uint16))
    return res
