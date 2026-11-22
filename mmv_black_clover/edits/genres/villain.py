# GENRE: villain - mengancam & berwibawa. Serif klasik (Cinzel) emas gelap, tinta menyebar, flash merah.
STYLE = "ink_mono"
TITLE = dict(font="Cinzel.ttf", size=70, upper=True, tracking=0.18, top=(255, 236, 190), bottom=(170, 120, 50),
             glow=(200, 20, 20), glow_k=0.6, stroke_color=(40, 0, 0), stroke=3,
             label_font="Cinzel.ttf", label_size=20, label_tracking=0.6, label_color=(210, 40, 40),
             anim="spread", in_dur=0.6, ornament="underline", ornament_color=(200, 30, 30))
TITLE_END = dict(TITLE, size=78, anim="type", in_dur=0.6)
WM = dict(font="UnifrakturMaguntia-Book.ttf", size=50, top=(255, 90, 80), bottom=(190, 20, 20), grit=0.3,
          opacity=0.9)
TRANSITIONS = [("ghost", 0.22), ("ink", 0.22), ("flash_red", 0.06), ("black_dip", 0.10), ("zoom", 0.10), ("ink", 0.16)]
SHAKE_K, PUNCH_K = 1.2, 1.3
FLASH_K, FLASH_COLOR = 0.8, (200, 10, 20)
PARTICLES = ((200, 20, 20), 0.6, "fire")
ECHO = True
FOCUS_LINES = 0.5
