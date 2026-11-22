#!/usr/bin/env python3
"""
make_thumbnail.py - Thumbnail gaya channel referensi: 1 frame terkuat + judul 2 baris + watermark.

  python3 make_thumbnail.py frame.png out.jpg --title "SHE FINALLY SAID IT" --sub "Noelle x Asta" \
      --color 255,80,120 --wm Charizchkun [--size 1080]
Menghasilkan out.jpg (1:1) dan out_916.jpg (9:16 untuk Shorts: frame di tengah, latar blur).
"""
import argparse
import os
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "motion"))
import typo  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("frame")
    ap.add_argument("out")
    ap.add_argument("--title", required=True)
    ap.add_argument("--sub", default="")
    ap.add_argument("--color", default="255,70,60")
    ap.add_argument("--wm", default="Charizchkun")
    ap.add_argument("--size", type=int, default=1080)
    a = ap.parse_args()
    S = a.size
    typo.S = S
    col = tuple(int(c) for c in a.color.split(","))
    img = cv2.cvtColor(cv2.imread(a.frame), cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (S, S), interpolation=cv2.INTER_AREA).astype(np.float32)
    # gelapkan bawah agar teks terbaca (gradien), naikkan kontras sedikit
    yy = np.linspace(0, 1, S)[:, None, None]
    img = img * (1 - np.clip((yy - 0.55) / 0.45, 0, 1) * 0.6)
    img = (img - 128) * 1.08 + 128
    T1 = dict(font="Anton-Regular.ttf", size=104, upper=True, tracking=0.04, top=(255, 255, 255),
              bottom=(225, 225, 225), glow=(255, 255, 255), glow_k=0.25, stroke=4, anim="none", y=0.70)
    T2 = dict(font="PlayfairDisplay-Italic.ttf", size=64, top=tuple(min(255, c + 90) for c in col), bottom=col,
              glow=col, glow_k=0.7, anim="none", y=0.80)
    img = typo.genre_title(img, "", a.title, T1, 9.0)
    if a.sub:
        img = typo.genre_title(img, "", a.sub, T2, 9.0)
    img = typo.genre_watermark(img, a.wm, dict(font="MetalMania-Regular.ttf", size=46, top=(255, 255, 255),
                                               bottom=(180, 180, 180), grit=0.4, y=0.92))
    img = np.clip(img, 0, 255).astype(np.uint8)
    cv2.imwrite(a.out, cv2.cvtColor(img, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 95])
    # versi 9:16
    W, H = 1080, 1920
    bg = cv2.GaussianBlur(cv2.resize(img, (H, H)), (0, 0), 40)[:, (H - W) // 2:(H - W) // 2 + W]
    bg = (bg.astype(np.float32) * 0.45).astype(np.uint8)
    fg = cv2.resize(img, (W, W), interpolation=cv2.INTER_AREA)
    y0 = (H - W) // 2
    bg[y0:y0 + W] = fg
    base = os.path.splitext(a.out)[0]
    cv2.imwrite(base + "_916.jpg", cv2.cvtColor(bg, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 95])
    print("->", a.out, base + "_916.jpg")


if __name__ == "__main__":
    main()
