# director.py - perkakas "mode sutradara" (dipakai semua edit baru):
#   cut()  : satu adegan. alpha="auto" -> renderer memilih sendiri: potong + background baru (bila bersih)
#            atau gambar utuh + gelombang (panel manga ramai, karakter terpotong tepi, penuh efek cahaya/api).
#   SIG    : ciri khas karakter (sihir & kepribadian) dipasang otomatis menurut karakter di adegan.
#   BG     : background relevan per tempat cerita.
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from acting import head  # noqa: E402

ICE = (120, 210, 255)
FIRE = (255, 110, 30)
RED = (255, 50, 40)
WHITE = (255, 245, 230)
BUBBLES = ((160, 220, 255), 0.7, "bubbles")
SPARK = ((235, 240, 255), 0.4, "embers")
EMBERS = ((255, 120, 40), 0.85, "fire")

BG = dict(silva="Clover_Castle.png", mansion="King's_bedroom.png", water="Seabed_Temple.png",
          beach="Raque.png", heart="Heart_Kingdom.png", heart_palace="Heart_Kingdom_Royal_Palace.png",
          church="World_End_Church.png", bulls="Black_Bull_Base.png", capital="Royal_Capital.png",
          hage="Hage_village.png", hage_church="Hage_orphanage_church.png", dungeon="Dungeon.png",
          spade="Spade_Kingdom.png", shadow="Shadow_Palace_appears.png", diamond="Diamond_Kingdom.png",
          garden="Zofnir_Garden.png", sun="Freezing_sun_drops_on_Spade_castle.png",
          circles="Magic_circles_of_Qliphoth_Advent_Ritual.png", chamber="Eleventh_chamber_in_Shadow_Palace.png",
          forest="Witches_Forest_inside.png")

SIG = {
    "noelle": dict(particles_cfg=BUBBLES, fx=dict(aura_osc=(0.25, 0.8))),
    "asta": dict(particles_cfg=((220, 30, 30), 0.6, "fire"),
                 fx=dict(back_glow=((150, 0, 0), 0.55), aura_osc=(0.6, 2.2), rim=((255, 40, 30), 0.6))),
    "valkyrie": dict(particles_cfg=SPARK, fx=dict(rays=((0.5, 0.25), ICE, 0.8), aura_osc=(0.3, 1.0))),
    # Mereoleona: api & singa -> bara api, aura oranye berdenyut seperti kobaran, sinar panas
    "mereo": dict(particles_cfg=EMBERS, fx=dict(back_glow=((255, 90, 10), 0.6), aura_osc=(0.5, 1.6),
                                                rim=((255, 140, 50), 0.7), rays=((0.5, 0.2), FIRE, 0.5))),
    "duo": dict(particles_cfg=SPARK),
}


def who_for(img):
    if "Mereoleona" in img or "Calidus" in img or "Hot-Blooded" in img:
        return "mereo"
    if "Valkyrie" in img or "Undine" in img or "defeats_Vanica" in img:
        return "valkyrie"
    if img.startswith("Noelle") or "Acier" in img:
        return "noelle"
    if "catches" in img or "first_salary" in img or "Mimosa_react" in img:
        return "duo"
    if "Asta" in img:
        return "asta"
    return None


def speak(face_x, face_y, rx=0.12, ry=0.08, neck=0.07, amp=1.4, rate=3.2):
    """Akting bicara saat VO: kepala mengangguk kecil mengikuti ritme suku kata (rigid, wajah utuh)."""
    return [head(("ellipse", face_x, face_y, rx, ry, 0.5), (face_x, face_y + neck), osc=(amp, rate, 0.0)),
            head(("ellipse", face_x, face_y, rx, ry, 0.5), (face_x, face_y + neck), osc=(amp * 0.5, rate * 1.7, 1.3))]


_BG_DIR = 1


def cut(t0, t1, img, bg, acting, anchor, span, pos=(0.5, 0.5), glow=ICE, hits=(0.0,), flash=(), tone=None,
        bg_grade=None, parts=(), who=None, **kw):
    char = dict(img=img, alpha="auto", upscale=2400, anchor=anchor, pos=pos, span=span, acting=acting,
                rig=dict(parts=[dict(type="wind", region=("box", 0, 0, 1, 1), amp=0.004, freq=0.9, k=6.0, edge=True,
                                     dir=(1.0, 0.35))] + list(parts)))
    if tone:
        char.update(duotone=True, **tone)
    # background hidup: bergeser berlawanan arah karakter + zoom + putar pelan + kabut mengalir
    global _BG_DIR
    _BG_DIR = -_BG_DIR
    d = t1 - t0
    dx = 0.05 * _BG_DIR
    s = dict(t0=t0, t1=t1, char=char,
             bg=dict(img=BG[bg], upscale=1400, anchor=(0.5, 0.45),
                     pos=[(0, (0.5 + dx, 0.46)), (d, (0.5 - dx, 0.44))],
                     span=[(0, 1.42), (d, 1.30)], rot=[(0, -1.2 * _BG_DIR), (d, 1.2 * _BG_DIR)],
                     blur=1.6, parallax=0.35, fog=((40, 30, 30), 0.25),
                     grade=bg_grade or dict(bright=0.72, contrast=1.1)),
             cam=dict(ease="out"), hits=list(hits), flash=list(flash),
             fx=dict(rim=(glow, 0.55), back_glow=(glow, 0.3), wrap=0.4, shadow=0.45))
    who = who or who_for(img)
    if who:
        sig = SIG[who]
        s["particles_cfg"] = sig.get("particles_cfg", s.get("particles_cfg"))
        s["fx"].update(sig.get("fx", {}))
    s.update(kw)
    return s
