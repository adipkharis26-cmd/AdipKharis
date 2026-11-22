# STYLE LOCK v1 - gaya "DISCIPLINE" (disetujui 22 Nov 2026). Semua edit baru mengimpor dari sini supaya
# tampilannya identik: tekstur manga berwarna, cahaya, watermark, tipografi, format 2K/60fps.
# Jangan ubah nilai di file ini; buat file style_lock_v2.py jika gaya ingin diubah.
#
# Format render: 2048x2048, 60 fps, x264 CRF 15, AAC 320k  (render_v3.py --size 2048 --fps 60)
# Tipografi: label kecil Inter SemiBold + nama Fjalla One bergradasi & glow; watermark Metal Mania.
# Aturan teks: maksimal 2 label per video (hook + penutup) + watermark. Tanpa teks opening.
# Aturan hook: frame pertama = visual terkuat tepat di hentakan pertama sound.
# Panel manga hitam-putih: diwarnai duotone (WARM/COLD/BLOOD). Anime: cel + tinta + screentone bayangan.

WATERMARK = "Charizchkun"

TEXTURE_CHAR = dict(cel=0.55, levels=5, ink=0.8, ink_sigma=1.0, tone=0.30, tone_period=6.0, tone_lo=0.55,
                    tone_hi=0.85, hatch=0.0, warm=0.35)
TEXTURE_BG = dict(cel=0.75, levels=4, ink=0.65, ink_sigma=1.3, tone=0.55, tone_period=7.0, tone_lo=0.2,
                  tone_hi=0.75, hatch=0.15, warm=0.45)
DAPPLED = 0.3
PAPER = 1.0

WARM = dict(dark=(24, 10, 8), light=(250, 226, 178))
COLD = dict(dark=(16, 14, 20), light=(206, 204, 200))
BLOOD = dict(dark=(26, 4, 6), light=(250, 214, 196))

RED = (255, 45, 35)
GOLD = (255, 200, 70)

DARK_RED_BG = dict(tint=(1.25, 0.6, 0.55), bright=0.7, contrast=1.2)


def wind(region, amp=0.006, freq=0.9, edge=True, d=(1.0, 0.35)):
    return dict(type="wind", region=region, amp=amp, freq=freq, k=6.0, edge=edge, dir=d)


def breathe(region=("box", 0, 0.25, 1, 1), A=0.005, f=0.45, pivot=(0.5, 1.0)):
    return dict(type="breathe", region=region, osc=(A, f), pivot=pivot)


def full(t0, t1, img, anchor=(0.5, 0.5), span=(1.0, 1.08), hits=(), flash=(), amp=0.005, tone=None,
         ease="out", **kw):
    """Shot full-frame (panel manga/adegan) + angin halus + napas + kamera ber-easing."""
    dur = t1 - t0
    char = dict(img=img, alpha="full", anchor=anchor, pos=(0.5, 0.5),
                span=[(0, span[0]), (dur, span[1])],
                rig=dict(parts=[wind(("box", 0, 0, 1, 1), amp, 1.1, edge=False), breathe(A=0.004, f=0.6)]))
    if tone:
        char.update(duotone=True, **tone)
    s = dict(t0=t0, t1=t1, char=char, cam=dict(ease=ease), hits=list(hits), flash=list(flash))
    s.update(kw)
    return s


def cutout(t0, t1, img, bg, anchor, span, pos=(0.5, 0.45), face=None, bg_grade=None, glow=(255, 255, 255),
           hits=(), flash=(), wind_amp=0.008, **kw):
    """Karakter full-body dipotong (roto) + background baru + rim/back-glow warna sihirnya."""
    dur = t1 - t0
    parts = [wind(("box", 0.0, 0.2, 1.0, 1.0), wind_amp, 0.9),
             wind(("box", 0.0, 0.0, 1.0, 0.2), wind_amp * 0.6, 1.1, d=(1.0, 0.5)),
             breathe(("box", 0.1, 0.15, 0.9, 1.0), 0.005, 0.5)]
    rig = dict(parts=parts)
    if face:
        rig["protect"] = [("ellipse", face[0], face[1], face[2], face[3])]
    s = dict(t0=t0, t1=t1,
             char=dict(img=img, alpha="seg", upscale=2400, anchor=anchor, pos=pos,
                       span=[(0, span[0]), (dur, span[1])], rig=rig),
             bg=dict(img=bg, upscale=1400, anchor=(0.5, 0.45), pos=(0.5, 0.45), span=[(0, 1.25), (dur, 1.18)],
                     blur=2.5, grade=bg_grade or dict(bright=0.75)),
             cam=dict(ease="out"),
             fx=dict(rim=(glow, 0.6), back_glow=(glow, 0.35), wrap=0.4),
             hits=list(hits), flash=list(flash))
    s.update(kw)
    return s
