# GENRE: soft - lembut & elegan (romance/girl/sedih). Script font, pastel, tanpa flash, transisi lambat.
STYLE = "pastel_dream"
TITLE = dict(font="GreatVibes-Regular.ttf", size=96, top=(255, 255, 255), bottom=(255, 205, 225),
             glow=(255, 150, 200), glow_k=0.45, shadow=0.35,
             label_font="CormorantGaramond-Italic.ttf", label_size=28, label_tracking=0.3, label_color=(255, 235, 245),
             label_upper=False, anim="blur_in", in_dur=0.5, label_gap=0.95, ornament="lines", ornament_color=(255, 210, 230))
TITLE_END = dict(TITLE, size=104)
WM = dict(font="CormorantGaramond-Italic.ttf", size=40, tracking=0.25, top=(255, 255, 255), bottom=(255, 215, 235),
          glow=(255, 150, 200), opacity=0.8, pulse=0.15)
TRANSITIONS = [("white_dip", 0.18), ("defocus", 0.20), ("leak", 0.25), ("white_dip", 0.14), ("defocus", 0.16)]
SHAKE_K, PUNCH_K = 0.4, 0.4
FLASH_K, FLASH_COLOR = 0.0, (255, 255, 255)
PARTICLES = ((255, 225, 235), 0.45, "embers")
