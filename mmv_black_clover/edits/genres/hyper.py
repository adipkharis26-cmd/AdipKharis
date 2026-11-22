# GENRE: hyper - cepat & futuristik. Font tech (Orbitron), neon cyan/magenta, HUD bracket, spin & zoom.
STYLE = "neon_night"
TITLE = dict(font="Orbitron.ttf", size=62, upper=True, tracking=0.12, top=(220, 255, 255), bottom=(0, 220, 255),
             glow=(0, 200, 255), glow_k=0.8, stroke_color=(255, 40, 200), stroke=2,
             label_font="Rajdhani-Bold.ttf", label_size=26, label_tracking=0.5, label_color=(255, 80, 210),
             anim="slide", in_dur=0.2, ornament="brackets", ornament_color=(255, 60, 210), jitter=0.15)
TITLE_END = dict(TITLE, anim="glitch", in_dur=0.3)
WM = dict(font="Orbitron.ttf", size=30, upper=True, tracking=0.4, top=(200, 255, 255), bottom=(0, 200, 255),
          glow=(0, 180, 255), opacity=0.85)
TRANSITIONS = [("zoom", 0.08), ("spin", 0.09), ("rgb", 0.05), ("flash", 0.04), ("glitch", 0.06), ("whip", 0.06)]
SHAKE_K, PUNCH_K = 1.6, 2.2
FLASH_K, FLASH_COLOR = 0.8, (180, 250, 255)
PARTICLES = ((0, 230, 255), 0.6, "embers")
ECHO = True
FOCUS_LINES = 0.6
