# STYLE: story_glow (mv2) - gaya referensi "marjukanak": anime bersih bercahaya seperti 3D, TANPA kertas/screentone.
# Glow lembut (Orton), sinar cahaya volumetrik dari atas, grade emas hangat, highlight halus, vignette dalam,
# watermark kecil bersih. Dipakai edit mv2; mv1 tetap memakai style_lock.
TEXTURE_CHAR = dict(cel=0.12, levels=8, ink=0.3, ink_sigma=0.9, tone=0.0, warm=0.15)
TEXTURE_BG = dict(cel=0.15, levels=8, ink=0.1, tone=0.0, warm=0.2)
DAPPLED = 0.0
PAPER = 0.0
POST = dict(orton=0.35, godrays=((0.5, 0.0), 0.55), godray_color=(255, 215, 150),
            split=((40, 30, 60), (255, 200, 120)), split_k=0.4, sat=0.95, contrast=1.08, highlight_roll=0.5,
            gamma=1.04, vignette=0.75, grain=3.0)
TEXT = dict(color=(255, 200, 60))
WM = dict(font="Montserrat.ttf", size=26, tracking=0.35, upper=True, top=(255, 250, 235), bottom=(255, 215, 120),
          glow=(255, 190, 60), opacity=0.85, y=0.94)
