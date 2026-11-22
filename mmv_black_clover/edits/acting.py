# acting.py - akting karakter (padanan Puppet Pin + mask di After Effects), ditempel ke shot apa pun.
# Koordinat = posisi relatif di gambar asli (0..1). Waktu = detik relatif awal shot.
import copy


def act(shot, parts=(), blink=None, blush=None, eyes=None):
    """Tambahkan gerak/akting ke shot tanpa mengubah gaya terkunci."""
    s = copy.deepcopy(shot)
    rig = s["char"].setdefault("rig", {})
    rig.setdefault("parts", [])
    rig["parts"] = list(rig["parts"]) + list(parts)
    fx = s.setdefault("fx", {})
    if blink:
        fx["blink"] = blink
    if blush:
        fx["blush"] = blush
    if eyes:
        fx["eyes"] = eyes
    return s


def smile(corners, r, lift, t0, t1, ease="ease"):
    """Senyum: dua Puppet Pin di sudut bibir naik & sedikit melebar. lift dalam satuan sisi pendek gambar."""
    (lx, ly), (rx_, ry) = corners
    return [dict(type="pin", region=("ellipse", lx, ly, r[0], r[1], 0.6), offset=[(t0, (0, 0)), (t1, (-lift * 0.5, -lift))],
                 ease=ease),
            dict(type="pin", region=("ellipse", rx_, ry, r[0], r[1], 0.6), offset=[(t0, (0, 0)), (t1, (lift * 0.5, -lift))],
                 ease=ease)]


def head(region, pivot, angle=None, osc=None, ease="ease"):
    """Kepala menoleh / mendongak / mengangguk (rotasi ber-pivot di leher)."""
    p = dict(type="rotate", region=region, pivot=pivot, angle=angle if angle is not None else 0.0, ease=ease)
    if osc:
        p["osc"] = osc
    return p


def blink(eyes, times, dur=0.16, droop=0.0, style="flat", skin=None):
    """eyes = [(x, y, rx, ry)] ; times = [t, ...] atau [(t, [index_mata]), ...] untuk wink."""
    b = dict(eyes=eyes, times=times, dur=dur, droop=droop, style=style)
    if skin:
        b["skin"] = skin
    return b


def blush(cheeks, intensity, color=(255, 120, 140)):
    return (cheeks, color, intensity)
