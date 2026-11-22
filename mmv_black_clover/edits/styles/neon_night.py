# STYLE: neon_night - gelap & saturasi tinggi, split-tone cyan/magenta, glow neon kuat, scanline halus.
TEXTURE_CHAR = dict(cel=0.35, levels=6, ink=0.6, ink_sigma=0.9, tone=0.0, warm=0.0)
TEXTURE_BG = dict(cel=0.5, levels=5, ink=0.4, ink_sigma=1.2, tone=0.2, tone_period=6.0, tone_lo=0.3,
                  tone_hi=0.8, warm=0.0)
DAPPLED = 0.0
PAPER = 0.0
POST = dict(gamma=1.45, split=((0, 200, 255), (255, 90, 210)), split_k=0.38, sat=1.3, contrast=1.1,
            bloom=0.35, bloom_thr=175, scanlines=0.07, chroma=3)
TEXT = dict(color=(60, 240, 255))
