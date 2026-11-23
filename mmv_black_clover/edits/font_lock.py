# FONT LOCK (mv2) - kumpulan font terkunci untuk semua MV. Satu video = SATU font (dipilih acak per video,
# tetap sama tiap render video itu), video berikutnya dapat font lain -> tidak monoton antar video.
# 5 font genre (gambar genre text: mmv / phonk / soft / villain / hyper) + 5 tambahan yang cocok untuk MMV.
import hashlib

FONTS = {
    # nama           file font                    skala  italic-miring  warna dialog default
    "fjalla":       ("FjallaOne-Regular.ttf",      1.15, True,  (255, 205, 70)),    # mmv (emas)
    "anton":        ("Anton-Regular.ttf",          1.15, True,  (255, 70, 60)),     # phonk (merah)
    "greatvibes":   ("GreatVibes-Regular.ttf",     1.6,  False, (255, 200, 225)),   # soft (script)
    "cinzel":       ("Cinzel.ttf",                 1.0,  False, (240, 200, 110)),   # villain (serif emas)
    "orbitron":     ("Orbitron.ttf",               0.95, False, (90, 220, 255)),    # hyper (neon)
    "bebas":        ("BebasNeue-Regular.ttf",      1.3,  True,  (255, 210, 80)),    # tambahan: tegas, tinggi
    "russo":        ("RussoOne-Regular.ttf",       1.0,  True,  (255, 190, 60)),    # tambahan: tebal, game/anime
    "rajdhani":     ("Rajdhani-Bold.ttf",          1.2,  True,  (120, 230, 255)),   # tambahan: teknis, bersih
    "playfair":     ("PlayfairDisplay-Italic.ttf", 1.1,  False, (255, 215, 150)),   # tambahan: elegan, cerita
    "metalmania":   ("MetalMania-Regular.ttf",     1.1,  False, (235, 235, 235)),   # tambahan: gelap, kasar
}


def pick(key, force=None):
    """Pilih 1 font untuk 1 video. key = nama file edit -> acak tapi konsisten untuk video itu."""
    if force:
        return force, FONTS[force]
    names = sorted(FONTS)
    i = int(hashlib.md5(key.encode()).hexdigest(), 16) % len(names)
    return names[i], FONTS[names[i]]
