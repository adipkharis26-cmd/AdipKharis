# GENRE: phonk - gelap, agresif, gothic. Hitam-merah, guncangan keras, glitch, cut di setiap 808.
STYLE = "red_phonk"
TITLE = dict(font="UnifrakturMaguntia-Book.ttf", size=92, top=(255, 255, 255), bottom=(255, 200, 200),
             stroke_color=(200, 0, 20), stroke=4, glow=(255, 0, 30), glow_k=0.7,
             label_font="Anton-Regular.ttf", label_size=24, label_tracking=0.5, label_color=(255, 40, 50),
             anim="glitch", in_dur=0.12)
TITLE_END = dict(TITLE, font="Anton-Regular.ttf", size=86, upper=True, tracking=0.08, anim="pop")
WM = dict(font="Anton-Regular.ttf", size=34, upper=True, tracking=0.45, top=(255, 255, 255), bottom=(255, 70, 70),
          grit=0.3, opacity=0.85)
TRANSITIONS = [("shake", 0.08), ("rgb", 0.06), ("flash_red", 0.05), ("glitch", 0.08), ("zoom", 0.08)]
SHAKE_K, PUNCH_K = 2.0, 1.8
FLASH_K, FLASH_COLOR = 0.85, (255, 255, 255)
PARTICLES = ((255, 40, 30), 0.7, "fire")
ECHO = True
FOCUS_LINES = 0.8
