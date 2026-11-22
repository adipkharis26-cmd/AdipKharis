#!/usr/bin/env python3
"""
render_motion.py - Render MMV 1:1 dengan karakter yang BERGERAK (bukan sekadar zoom foto).

  python3 motion/render_motion.py edits/funk_mandala_motion.py <folder_gambar> <sound> <out.mp4> [--models DIR] [--only 2,10]

Per shot:
  1. rotoscoping karakter (isnet-anime) + clean plate background (inpaint)
  2. rig puppet: angin rambut/jubah, kepakan sayap, napas, kepala menoleh, iblis melayang (keyframe + easing)
  3. kamera 2.5D: dolly/pan/rotasi ber-keyframe, background parallax lebih lambat dari karakter, handheld halus
  4. efek: eye glow, light rays di belakang karakter, rim light, bloom, partikel 3 lapis, sharpen tinta, grade
  5. tipografi gaya referensi + watermark
"""
import argparse
import importlib.util
import math
import os
import subprocess
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import analyze  # noqa: E402
import engine as E  # noqa: E402
import typo  # noqa: E402

S = E.S
FPS = 30


def load_edit(path):
    spec = importlib.util.spec_from_file_location("edit", path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def duotone(rgb, dark=(22, 8, 10), light=(246, 228, 196)):
    g = rgb.mean(2) / 255.0
    g = np.clip((g - 0.04) / 0.92, 0, 1) ** 1.1
    d, l = np.array(dark, np.float32), np.array(light, np.float32)
    return d + (l - d) * g[..., None]


def is_gray(rgb):
    s = cv2.resize(rgb, (128, 128))
    return (s.max(2) - s.min(2)).mean() < 12


def prepare(path, shot, models):
    bgr = cv2.imread(path, cv2.IMREAD_COLOR)
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    # sisi pendek minimal 1200 px (upscale lanczos untuk gambar kecil)
    k = 1200 / min(rgb.shape[:2])
    alpha = None
    if not shot.get("rig", {}).get("full_char"):
        alpha = analyze.cached(path, "alpha", analyze.segment, os.path.join(models, "isnet-anime.onnx"))
    if k > 1:
        rgb = cv2.resize(rgb, None, fx=k, fy=k, interpolation=cv2.INTER_LANCZOS4)
        if alpha is not None:
            alpha = cv2.resize(alpha, (rgb.shape[1], rgb.shape[0]), interpolation=cv2.INTER_LINEAR)
    rgb = rgb.astype(np.float32)
    if shot.get("duotone", "auto") is True or (shot.get("duotone", "auto") == "auto" and is_gray(rgb.astype(np.uint8))):
        rgb = duotone(rgb)
    if shot.get("desat"):
        g = rgb.mean(2, keepdims=True)
        rgb = rgb * (1 - shot["desat"]) + g * shot["desat"]
    return E.Rig(rgb, alpha, shot.get("rig", {}))


def render_shot_frame(rig, shot, t_abs, particles, edit):
    lt = t_abs - shot["t0"]
    dur = shot["t1"] - shot["t0"]
    cam = shot.get("cam", {})
    focus = tuple(E.key(lt, cam.get("focus", (0.5, 0.5)), cam.get("ease", "ease")))
    zmin = E.min_zoom_cover(rig.w, rig.h, focus)
    zoom = E.key(lt, cam.get("zoom", [(0, 1.0), (dur, 1.08)]), cam.get("ease", "ease"))
    pan = E.key(lt, cam.get("pan", (0.0, 0.0)), cam.get("ease", "ease"))
    rot = E.key(lt, cam.get("rot", 0.0), cam.get("ease", "ease"))
    # handheld: wiggle(0.6, kecil) - halus, tidak acak kasar
    hh = cam.get("handheld", 0.006)
    pan = (pan[0] + hh * E.smooth_noise(t_abs, 1, 0.6), pan[1] + hh * E.smooth_noise(t_abs, 2, 0.55))
    rot = rot + hh * 40 * E.smooth_noise(t_abs, 3, 0.4)
    # impact: shake yang meluruh cepat + zoom punch
    imp = 0.0
    for ht in shot.get("hits", []):
        d = lt - ht
        if 0 <= d < 0.5:
            imp = max(imp, math.exp(-d * 9))
    if imp:
        k = shot.get("shake", 0.010) * imp
        pan = (pan[0] + k * E.smooth_noise(t_abs, 7, 22), pan[1] + k * E.smooth_noise(t_abs, 8, 19))
        zoom *= 1 + shot.get("punch", 0.035) * imp
    zoom = max(zoom, 1.0)

    char, alpha, bg = rig.warp(lt, amp=1.0 + 0.6 * imp)
    par_bg = shot.get("parallax_bg", 0.55)
    zc = zmin * zoom
    Mc = E.layer_matrix(rig.w, rig.h, focus, zc, pan, rot, 1.0)
    # background: ikut kamera lebih lambat (2.5D), tetap tutup frame
    zb = zmin * (1 + (zoom - 1) * par_bg) * 1.03
    Mb = E.layer_matrix(rig.w, rig.h, focus, zb, (pan[0] * par_bg, pan[1] * par_bg), rot * par_bg, 1.0)
    bgw = cv2.warpAffine(bg, Mb, (S, S), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    chw = cv2.warpAffine(char, Mc, (S, S), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    aw = cv2.warpAffine(alpha, Mc, (S, S), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    if shot.get("rig", {}).get("full_char"):
        aw = np.ones_like(aw)
        bgw = chw

    fx = shot.get("fx", {})
    # light rays di belakang karakter (di layer bg)
    if fx.get("rays"):
        c, col, st = fx["rays"]
        st = E.key(lt, st)
        if st > 0:
            p = Mb @ np.array([c[0] * rig.w, c[1] * rig.h, 1.0])
            bgw = E.light_rays(bgw, aw, (p[0] / S, p[1] / S), col, st * (1 + imp))
    a3 = aw[..., None]
    frame = bgw * (1 - a3) + chw * a3
    if fx.get("rim") and not shot.get("rig", {}).get("full_char"):
        col, st = fx["rim"]
        frame += E.rim_light(aw, col, E.key(lt, st))
    # grade dasar
    g = shot.get("grade", {})
    frame = (frame - 128) * g.get("contrast", 1.1) + 128
    frame *= np.array(g.get("tint", (1.03, 1.0, 0.96)), np.float32) * E.key(lt, g.get("bright", 1.0))
    frame = E.sharpen(frame, g.get("sharpen", 0.45))
    # eye glow (titik mata dari rig, ikut transformasi kamera + deformasi)
    if fx.get("eyes"):
        pts, col, inten, rad = fx["eyes"]
        inten = E.key(lt, inten) * (1 + 0.08 * math.sin(lt * 5.0))
        dxf, dyf = rig.displacement(lt)
        P = []
        for (x, y) in pts:
            sx, sy = x * rig.w, y * rig.h
            ix, iy = int(min(rig.w - 1, max(0, sx))), int(min(rig.h - 1, max(0, sy)))
            sx += dxf[iy, ix]
            sy += dyf[iy, ix]
            q = Mc @ np.array([sx, sy, 1.0])
            P.append((q[0], q[1]))
        frame = E.eye_glow(frame, P, col, inten, rad * zc)
    frame = E.bloom(frame, g.get("bloom_thr", 185), E.key(lt, g.get("bloom", 0.45)) * (1 + 1.2 * imp))
    if shot.get("particles", True):
        frame += particles.render(t_abs, edit.PARTICLE_COLOR, shot.get("particle_k", 0.6),
                                  (pan[0], pan[1])) * shot.get("particle_k", 0.6)
    # flash putih singkat (2-3 frame) hanya di hentakan utama
    for ht in shot.get("flash", []):
        d = lt - ht
        if 0 <= d < 3 / FPS:
            a = (1 - d * FPS / 3) * 0.8
            frame = frame * (1 - a) + 255 * a
    return frame


VIGNETTE = None
GRAIN = None


def finish(frame, fr):
    global VIGNETTE, GRAIN
    if VIGNETTE is None:
        yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
        r = np.sqrt(((xx - S / 2) / (S / 2)) ** 2 + ((yy - S / 2) / (S / 2)) ** 2)
        VIGNETTE = np.clip(1.12 - 0.42 * r ** 2.4, 0.35, 1)[..., None]
        rng = np.random.default_rng(3)
        GRAIN = [cv2.GaussianBlur(rng.normal(0, 3.2, (S, S)).astype(np.float32), (0, 0), 0.6)[..., None]
                 for _ in range(4)]
    return frame * VIGNETTE + GRAIN[(fr // 2) % 4]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("edit")
    ap.add_argument("images")
    ap.add_argument("audio")
    ap.add_argument("out")
    ap.add_argument("--models", default=os.environ.get("MMV_MODELS", "models"))
    ap.add_argument("--only", default="", help="render shot tertentu saja (preview), mis. 2,10")
    a = ap.parse_args()
    edit = load_edit(a.edit)
    shots = edit.SHOTS
    only = {int(x) for x in a.only.split(",") if x.strip()}
    end = shots[-1]["t1"]
    n = int(round(end * FPS))

    rigs = {}
    for i, s in enumerate(shots):
        if s.get("img") and (not only or i + 1 in only):
            k = (s["img"], id(s))
            print("rig shot %d: %s" % (i + 1, s["img"]), flush=True)
            rigs[i] = prepare(os.path.join(a.images, s["img"]), s, a.models)
    particles = E.Particles()

    frames = []
    for fr in range(n):
        t = fr / FPS
        idx = next((i for i, s in enumerate(shots) if s["t0"] <= t < s["t1"]), len(shots) - 1)
        if only and idx + 1 not in only:
            continue
        frames.append((fr, t, idx))

    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "%dx%d" % (S, S),
           "-r", str(FPS), "-i", "-"]
    if not only:
        cmd += ["-i", a.audio, "-t", "%.3f" % end, "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "256k"]
    cmd += ["-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart", a.out]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)

    for j, (fr, t, idx) in enumerate(frames):
        s = shots[idx]
        lt = t - s["t0"]
        if s.get("img"):
            frame = render_shot_frame(rigs[idx], s, t, particles, edit)
        else:
            frame = np.zeros((S, S, 3), np.float32)
        frame = finish(frame, fr)
        # dip hitam (jeda gated chop)
        for g0, g1 in s.get("gate", []):
            if g0 <= t < g1:
                frame *= 0.15
        # fade dari hitam di awal shot bila diminta
        if s.get("fade_in") and lt < s["fade_in"]:
            frame *= lt / s["fade_in"]
        for tx in s.get("text", []):
            t0 = tx.get("at", 0.0)
            if lt < t0 or lt >= tx.get("until", 99):
                continue
            ap_ = (lt - t0) / 0.2
            pop = max(0.0, 1 - (lt - t0) / 0.25) if tx.get("pop") else 0.0
            if tx["kind"] == "title":
                frame = typo.title(frame, tx.get("label", ""), tx["name"], tx.get("color", (255, 60, 40)), ap_,
                                   tx.get("y", 0.83), tx.get("style", "name"), pop)
            elif tx["kind"] == "sub":
                frame = typo.subtitle(frame, tx["text"], ap_, tx.get("y", 0.885))
        frame = typo.watermark(frame, getattr(edit, "WATERMARK", ""))
        proc.stdin.write(np.clip(frame, 0, 255).astype(np.uint8).tobytes())
        if j % 30 == 0:
            print("frame %d/%d" % (j, len(frames)), flush=True)
    proc.stdin.close()
    proc.wait()
    print("->", a.out)


if __name__ == "__main__":
    main()
