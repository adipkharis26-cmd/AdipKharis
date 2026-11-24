#!/usr/bin/env python3
"""Bungkus satu episode jadi paket rilis untuk rilis_worker.py.

Usage (dari root repo):
  python3 video/src/rilis_paket.py tl13 --cek-fakta lolos [--push] [--worktree DIR]

Membaca:
  naskah/<ep>-*.md            bagian "## Paket posting" (Judul, Deskripsi, Hashtag, CTA, Sumber)
  video/out/ternyata-leluhur-<ep>.mp4
  video/thumb/<ep>.json       thumbPilihan → video/out/thumb/<ep>-<X>.png
  video/vo/<ep>.json          durasi VO (untuk cek MP4 tidak terpotong)
Menulis (di worktree branch `rilis-video`):
  rilis/<ep>/rilis.json, rilis/<ep>/video.mp4, rilis/<ep>/thumb.png
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CHANNEL_BY_PREFIX = {"tl": ("ternyata-leluhur", "ternyata-leluhur"), "ep": ("mas-kharis", "mas-kharis"),
                     "dm": ("dari-1-mnt", "dari-1-mnt"), "oh": ("ohhiyaa", "ohhiyaa")}
BATAS_SHORTS_DETIK = 180


def run(*cmd, cwd=None, check=True):
    return subprocess.run(cmd, cwd=cwd, check=check, capture_output=True, text=True)


def durasi(path):
    out = run("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)).stdout
    return float(out.strip())


def paket_posting(md):
    m = re.search(r"^## Paket posting\s*$(.*)", md, re.M | re.S)
    if not m:
        raise SystemExit("naskah tidak punya bagian '## Paket posting'")
    blok = m.group(1)
    def field(nama):
        f = re.search(r"\*\*" + nama + r"[^*]*:\*\*\s*(.+?)(?=\n\s*\n\*\*|\Z)", blok, re.S)
        return f.group(1).strip() if f else ""
    return {"judul": field("Judul"), "deskripsi": field("Deskripsi"), "hashtag": field("Hashtag"),
            "cta": field("CTA"), "sumber": field("Sumber")}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ep")
    ap.add_argument("--cek-fakta", choices=["lolos", "belum"], required=True,
                    help="isi 'lolos' hanya setelah Cek Fakta memverifikasi bagian Dasar fakta")
    ap.add_argument("--worktree", default=str(ROOT / ".rilis-worktree"))
    ap.add_argument("--branch", default="rilis-video")
    ap.add_argument("--push", action="store_true")
    a = ap.parse_args()
    ep = a.ep
    prefix = re.match(r"[a-z]+", ep).group(0)
    channel, mp4_prefix = CHANNEL_BY_PREFIX[prefix]

    naskah = sorted((ROOT / "naskah").glob(f"{ep}-*.md"))
    if len(naskah) != 1:
        raise SystemExit(f"naskah {ep} tidak unik/tidak ada: {naskah}")
    p = paket_posting(naskah[0].read_text(encoding="utf-8"))
    if not p["judul"] or not p["deskripsi"]:
        raise SystemExit("Judul/Deskripsi di Paket posting kosong")

    mp4 = ROOT / "video" / "out" / f"{mp4_prefix}-{ep}.mp4"
    if not mp4.exists():
        raise SystemExit(f"MP4 belum ada: {mp4}")
    vo = json.loads((ROOT / "video" / "vo" / f"{ep}.json").read_text(encoding="utf-8"))
    d_mp4, d_vo = durasi(mp4), float(vo["duration"])
    if d_mp4 < d_vo - 0.5:
        raise SystemExit(f"MP4 terpotong: {d_mp4:.1f} dtk < VO {d_vo:.1f} dtk. Render ulang dulu.")
    if d_mp4 > BATAS_SHORTS_DETIK:
        raise SystemExit(f"MP4 {d_mp4:.1f} dtk melebihi batas Shorts {BATAS_SHORTS_DETIK} dtk")

    thumb = None
    tj = ROOT / "video" / "thumb" / f"{ep}.json"
    if tj.exists():
        pilih = json.loads(tj.read_text(encoding="utf-8")).get("thumbPilihan", "A")
        t = ROOT / "video" / "out" / "thumb" / f"{ep}-{pilih}.png"
        thumb = t if t.exists() else None

    tags = [h.lstrip("#").strip() for h in re.split(r"\s+(?=#)", p["hashtag"]) if h.strip()]
    tags = [t for t in tags if t]
    deskripsi = p["deskripsi"]
    if p["cta"]:
        deskripsi += "\n\n" + p["cta"]
    if p["sumber"]:
        deskripsi += "\n\nSumber: " + p["sumber"]
    if p["hashtag"]:
        deskripsi += "\n\n" + p["hashtag"]
    deskripsi = re.sub(r"\*{1,2}([^*]+)\*{1,2}", r"\1", deskripsi)[:4900]

    meta = {
        "ep": ep, "channel": channel, "judul": p["judul"][:100], "deskripsi": deskripsi,
        "tags": tags, "kategori": 27, "konten_sintetis": True, "cekFakta": a.cek_fakta,
        "komentarPertama": p["cta"], "durasi": round(d_mp4, 1),
        "dibuat": datetime.now(timezone(timedelta(hours=7))).isoformat(timespec="seconds"),
    }

    wt = Path(a.worktree)
    if not (wt / ".git").exists() and not wt.exists():
        has_remote = run("git", "ls-remote", "--heads", "origin", a.branch, cwd=ROOT).stdout.strip()
        if has_remote:
            run("git", "fetch", "origin", a.branch, cwd=ROOT)
            run("git", "worktree", "add", "-B", a.branch, str(wt), f"origin/{a.branch}", cwd=ROOT)
        else:
            run("git", "worktree", "add", "--detach", str(wt), cwd=ROOT)
            run("git", "checkout", "--orphan", a.branch, cwd=wt)
            run("git", "rm", "-rf", "--quiet", ".", cwd=wt, check=False)
    out = wt / "rilis" / ep
    out.mkdir(parents=True, exist_ok=True)
    shutil.copy2(mp4, out / "video.mp4")
    if thumb:
        shutil.copy2(thumb, out / "thumb.png")
    (out / "rilis.json").write_text(json.dumps(meta, indent=1, ensure_ascii=False), encoding="utf-8")
    run("git", "add", f"rilis/{ep}", cwd=wt)
    if run("git", "diff", "--cached", "--quiet", cwd=wt, check=False).returncode != 0:
        run("git", "commit", "-m", f"rilis {ep}: {meta['judul']}", cwd=wt)
    print(f"paket {ep} siap di {out} (cekFakta={a.cek_fakta}, {d_mp4:.1f} dtk, thumb={'ya' if thumb else 'tidak'})")
    if a.push:
        run("git", "push", "-u", "origin", a.branch, cwd=wt)
        print(f"di-push ke origin/{a.branch}")


if __name__ == "__main__":
    main()
