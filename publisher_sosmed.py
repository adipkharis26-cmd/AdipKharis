#!/usr/bin/env python3
"""Adaptor Instagram Reels & TikTok untuk rilis_worker.py (jalan di VPS/PC owner).

Akun per divisi disimpan di data/sosmed/<channel>.json (chmod 600, di-ignore git):
  {"instagram": {"access_token": "...", "user_id": "...", "host": "graph.instagram.com", "diperbarui": "ISO"},
   "tiktok":    {"client_key": "...", "client_secret": "...", "access_token": "...",
                 "refresh_token": "...", "expires_at": 1700000000}}

Platform hanya aktif kalau env-nya 1 DAN akun divisi itu sudah diisi:
  RILIS_IG=1, RILIS_TIKTOK=1
  RILIS_TIKTOK_PRIVACY=SELF_ONLY   # wajib SELF_ONLY sampai aplikasi TikTok lolos audit; lalu PUBLIC_TO_EVERYONE

Perintah setup (sekali per divisi):
  python publisher_sosmed.py ig-set ternyata-leluhur --token IGAA... --user-id 1784...
  python publisher_sosmed.py tt-set ternyata-leluhur --client-key ... --client-secret ... --redirect-uri https://...
  python publisher_sosmed.py status
  python publisher_sosmed.py ekspor   # JSON semua akun → tempel ke GitHub Secret SOSMED_AKUN_JSON
"""
import argparse
import json
import os
import secrets
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("RILIS_DATA_DIR", BASE_DIR / "data"))
AKUN_DIR = DATA_DIR / "sosmed"
IG_VERSI = os.environ.get("RILIS_IG_VERSI", "v21.0")
TT_API = "https://open.tiktokapis.com"
PLATFORM_ENV = {"instagram": "RILIS_IG", "tiktok": "RILIS_TIKTOK"}


# ── akun ────────────────────────────────────────────────────────────────────
def _akun_path(channel):
    return AKUN_DIR / f"{channel}.json"


def baca_akun(channel):
    p = _akun_path(channel)
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}


def simpan_akun(channel, akun):
    AKUN_DIR.mkdir(parents=True, exist_ok=True)
    p = _akun_path(channel)
    tmp = p.with_suffix(".tmp")
    tmp.write_text(json.dumps(akun, indent=1), encoding="utf-8")
    os.chmod(tmp, 0o600)
    tmp.replace(p)


def platform_aktif(channel):
    akun = baca_akun(channel)
    return [p for p, env in PLATFORM_ENV.items()
            if os.environ.get(env, "0") == "1" and akun.get(p, {}).get("access_token")]


# ── http ────────────────────────────────────────────────────────────────────
def _http(method, url, data=None, headers=None, json_body=None, timeout=300):
    headers = dict(headers or {})
    if json_body is not None:
        data = json.dumps(json_body).encode()
        headers.setdefault("Content-Type", "application/json; charset=UTF-8")
    elif isinstance(data, dict):
        data = urllib.parse.urlencode(data).encode()
        headers.setdefault("Content-Type", "application/x-www-form-urlencoded")
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read()
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{method} {url.split('?')[0]} → HTTP {e.code}: {e.read()[:400]!r}") from None
    return json.loads(raw) if raw.strip() else {}


def caption(meta, batas):
    teks = meta["judul"].strip() + "\n\n" + meta.get("deskripsi", "").strip()
    return teks[:batas]


# ── Instagram Reels (Instagram API with Instagram Login / Graph API) ───────
def _ig_refresh(channel, akun):
    ig = akun["instagram"]
    host = ig.get("host", "graph.instagram.com")
    if host != "graph.instagram.com":
        return ig  # token Facebook Login dikelola manual
    terakhir = datetime.fromisoformat(ig.get("diperbarui", "2000-01-01T00:00:00+00:00"))
    if datetime.now(timezone.utc) - terakhir < timedelta(days=30):
        return ig
    r = _http("GET", f"https://graph.instagram.com/refresh_access_token?"
                     + urllib.parse.urlencode({"grant_type": "ig_refresh_token", "access_token": ig["access_token"]}))
    ig["access_token"] = r["access_token"]
    ig["diperbarui"] = datetime.now(timezone.utc).isoformat()
    simpan_akun(channel, akun)
    return ig


def posting_instagram(channel, meta):
    akun = baca_akun(channel)
    ig = _ig_refresh(channel, akun)
    host, tok, uid = ig.get("host", "graph.instagram.com"), ig["access_token"], ig["user_id"]
    base = f"https://{host}/{IG_VERSI}"
    video = meta["_dir"] / "video.mp4"
    c = _http("POST", f"{base}/{uid}/media", data={
        "media_type": "REELS", "upload_type": "resumable", "share_to_feed": "true",
        "caption": caption(meta, 2200), "access_token": tok})
    cid = c["id"]
    uri = c.get("uri") or f"https://rupload.facebook.com/ig-api-upload/{IG_VERSI}/{cid}"
    _http("POST", uri, data=video.read_bytes(), timeout=900, headers={
        "Authorization": f"OAuth {tok}", "offset": "0", "file_size": str(video.stat().st_size),
        "Content-Type": "application/octet-stream"})
    for _ in range(60):  # tunggu Instagram selesai memproses (maks ±15 menit)
        s = _http("GET", f"{base}/{cid}?" + urllib.parse.urlencode({"fields": "status_code,status", "access_token": tok}))
        if s.get("status_code") == "FINISHED":
            break
        if s.get("status_code") in ("ERROR", "EXPIRED"):
            raise RuntimeError(f"Instagram menolak video: {s}")
        time.sleep(15)
    else:
        raise RuntimeError("Instagram belum selesai memproses setelah 15 menit")
    r = _http("POST", f"{base}/{uid}/media_publish", data={"creation_id": cid, "access_token": tok})
    return {"id": r["id"]}


# ── TikTok (Content Posting API, Direct Post) ───────────────────────────────
def _tt_token(channel, akun):
    tt = akun["tiktok"]
    if time.time() < tt.get("expires_at", 0) - 600:
        return tt
    r = _http("POST", f"{TT_API}/v2/oauth/token/", data={
        "client_key": tt["client_key"], "client_secret": tt["client_secret"],
        "grant_type": "refresh_token", "refresh_token": tt["refresh_token"]})
    if "access_token" not in r:
        raise RuntimeError(f"refresh token TikTok gagal: {r}")
    tt.update(access_token=r["access_token"], refresh_token=r.get("refresh_token", tt["refresh_token"]),
              expires_at=int(time.time()) + int(r.get("expires_in", 86400)))
    simpan_akun(channel, akun)
    return tt


def _tt_cek(r, langkah):
    err = r.get("error", {})
    if err.get("code", "ok") != "ok":
        raise RuntimeError(f"TikTok {langkah}: {err}")
    return r.get("data", {})


def posting_tiktok(channel, meta):
    akun = baca_akun(channel)
    tt = _tt_token(channel, akun)
    h = {"Authorization": f"Bearer {tt['access_token']}"}
    info = _tt_cek(_http("POST", f"{TT_API}/v2/post/publish/creator_info/query/", headers=h, json_body={}), "creator_info")
    privasi = os.environ.get("RILIS_TIKTOK_PRIVACY", "SELF_ONLY")
    if privasi not in info.get("privacy_level_options", [privasi]):
        raise RuntimeError(f"privasi {privasi} tidak diizinkan akun ini: {info.get('privacy_level_options')}")
    batas = info.get("max_video_post_duration_sec")
    if batas and meta.get("durasi", 0) > batas:
        raise RuntimeError(f"video {meta['durasi']} dtk > batas akun {batas} dtk")
    video = meta["_dir"] / "video.mp4"
    size = video.stat().st_size
    chunk = size if size <= 64 * 1024 * 1024 else 10 * 1024 * 1024
    n = max(1, size // chunk)
    d = _tt_cek(_http("POST", f"{TT_API}/v2/post/publish/video/init/", headers=h, json_body={
        "post_info": {"title": caption(meta, 2200), "privacy_level": privasi, "is_aigc": True,
                      "disable_comment": False, "disable_duet": False, "disable_stitch": False},
        "source_info": {"source": "FILE_UPLOAD", "video_size": size, "chunk_size": chunk, "total_chunk_count": n},
    }), "init")
    with open(video, "rb") as f:
        for i in range(n):
            awal = i * chunk
            akhir = size - 1 if i == n - 1 else awal + chunk - 1  # potongan terakhir menampung sisa
            f.seek(awal)
            _http("PUT", d["upload_url"], data=f.read(akhir - awal + 1), timeout=900, headers={
                "Content-Type": "video/mp4", "Content-Range": f"bytes {awal}-{akhir}/{size}"})
    for _ in range(60):
        s = _tt_cek(_http("POST", f"{TT_API}/v2/post/publish/status/fetch/", headers=h,
                          json_body={"publish_id": d["publish_id"]}), "status")
        if s.get("status") == "PUBLISH_COMPLETE":
            return {"id": d["publish_id"], "privasi": privasi}
        if s.get("status") == "FAILED":
            raise RuntimeError(f"TikTok gagal memproses: {s.get('fail_reason')}")
        time.sleep(15)
    raise RuntimeError("TikTok belum selesai memproses setelah 15 menit")


POSTING = {"instagram": posting_instagram, "tiktok": posting_tiktok}


def posting(platform, channel, meta):
    return POSTING[platform](channel, meta)


# ── CLI setup ───────────────────────────────────────────────────────────────
def cmd_ig_set(a):
    akun = baca_akun(a.channel)
    akun["instagram"] = {"access_token": a.token, "user_id": a.user_id, "host": a.host,
                         "diperbarui": datetime.now(timezone.utc).isoformat()}
    simpan_akun(a.channel, akun)
    print(f"Instagram {a.channel} tersimpan di {_akun_path(a.channel)}")


def cmd_tt_set(a):
    st = secrets.token_urlsafe(12)
    url = "https://www.tiktok.com/v2/auth/authorize/?" + urllib.parse.urlencode({
        "client_key": a.client_key, "scope": "user.info.basic,video.publish", "response_type": "code",
        "redirect_uri": a.redirect_uri, "state": st})
    print("1. Buka URL ini, login akun TikTok divisi, lalu izinkan:\n" + url)
    balik = input("2. Tempel URL lengkap setelah redirect (berisi ?code=...): ").strip()
    q = urllib.parse.parse_qs(urllib.parse.urlparse(balik).query)
    if q.get("state", [""])[0] != st:
        raise SystemExit("state tidak cocok; ulangi.")
    r = _http("POST", f"{TT_API}/v2/oauth/token/", data={
        "client_key": a.client_key, "client_secret": a.client_secret, "code": q["code"][0],
        "grant_type": "authorization_code", "redirect_uri": a.redirect_uri})
    if "access_token" not in r:
        raise SystemExit(f"tukar kode gagal: {r}")
    akun = baca_akun(a.channel)
    akun["tiktok"] = {"client_key": a.client_key, "client_secret": a.client_secret,
                      "access_token": r["access_token"], "refresh_token": r["refresh_token"],
                      "expires_at": int(time.time()) + int(r.get("expires_in", 86400)), "open_id": r.get("open_id")}
    simpan_akun(a.channel, akun)
    print(f"TikTok {a.channel} tersimpan di {_akun_path(a.channel)}")


def cmd_status(_):
    if not AKUN_DIR.exists():
        print("Belum ada akun. Lihat workflow/RILIS.md bagian Instagram & TikTok.")
        return
    for p in sorted(AKUN_DIR.glob("*.json")):
        ch = p.stem
        akun = baca_akun(ch)
        print(f"{ch}: terisi={sorted(akun)} aktif={platform_aktif(ch)}")


def cmd_ekspor(_):
    """Cetak semua akun sebagai satu JSON untuk GitHub Secret SOSMED_AKUN_JSON."""
    semua = {}
    for p in sorted(AKUN_DIR.glob("*.json")) if AKUN_DIR.exists() else []:
        semua[p.stem] = {pl: {k: v for k, v in ent.items() if not k.startswith("_")}
                         for pl, ent in baca_akun(p.stem).items()}
    print(json.dumps(semua, separators=(",", ":")))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("ig-set"); p.add_argument("channel"); p.add_argument("--token", required=True)
    p.add_argument("--user-id", required=True); p.add_argument("--host", default="graph.instagram.com")
    p = sub.add_parser("tt-set"); p.add_argument("channel"); p.add_argument("--client-key", required=True)
    p.add_argument("--client-secret", required=True); p.add_argument("--redirect-uri", required=True)
    sub.add_parser("status")
    sub.add_parser("ekspor")
    a = ap.parse_args()
    {"ig-set": cmd_ig_set, "tt-set": cmd_tt_set, "status": cmd_status, "ekspor": cmd_ekspor}[a.cmd](a)


if __name__ == "__main__":
    main()
