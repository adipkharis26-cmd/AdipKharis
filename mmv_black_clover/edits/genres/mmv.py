# GENRE: mmv - Manga Music Video standar (seperti referensi @tezxsokun). Elegan, panel manga berwarna.
STYLE = "manga_color"
TITLE = dict(font="FjallaOne-Regular.ttf", size=66, top=(255, 214, 200), bottom=(255, 60, 45), glow=(255, 60, 45),
             label_font="Inter-SemiBold.otf", label_size=22, label_tracking=0.15, anim="rise", in_dur=0.22)
TITLE_END = dict(TITLE, top=(255, 246, 205), bottom=(240, 196, 60), glow=(255, 190, 40), size=72)
WM = dict(font="MetalMania-Regular.ttf", size=50, top=(255, 255, 255), bottom=(170, 170, 170), grit=0.45)
TRANSITIONS = [("whip", 0.08), ("flash", 0.05), ("glitch", 0.07), ("zoom", 0.10)]
SHAKE_K, PUNCH_K = 1.0, 1.0
FLASH_K, FLASH_COLOR = 0.75, (255, 255, 255)
PARTICLES = None
