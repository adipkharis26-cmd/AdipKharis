#!/usr/bin/env python3
"""Worker rilis otomatis Charizch Agent (jalan di VPS/PC owner, bukan di sesi cloud).

Alur:
  sesi produksi (Claude)  --push-->  branch `rilis-video`:  rilis/<ep>/{rilis.json, video.mp4, thumb.png}
  worker ini              --pull-->  unggah ke YouTube sebagai PRIVATE + publishAt (jeda veto, default 12 jam)
                          --report-> branch `laporan`: laporan/yt-YYYY-MM-DD.json + laporan/terbaru.json

Pengaman:
  * Tidak pernah mengunggah sebagai public. Kalau publishAt tidak valid atau tidak di masa depan,
    upload DIBATALKAN (beda dengan uploader.upload_short yang jatuh ke public).
  * Satu episode hanya diunggah sekali (state lokal + cek judul di daftar upload channel).
  * Maksimal N video per hari (WIB), dan channel target wajib cocok dengan RILIS_CHANNEL_ID.
  * Veto: owner membatalkan di YouTube Studio (hapus video atau ubah jadwal) sebelum jam tayang.

Perintah:
  python rilis_worker.py auth              # login OAuth sekali (simpan data/rilis_token.json)
  python rilis_worker.py once [--dry-run]  # tarik paket, unggah yang tertunda, tulis laporan bila jatuh tempo
  python rilis_worker.py report            # tulis laporan analytics sekarang
  python rilis_worker.py loop              # jalan terus (cek tiap RILIS_INTERVAL_MENIT menit)

Konfigurasi lewat environment (lihat workflow/RILIS.md):
  RILIS_REPO_DIR, RILIS_BRANCH (rilis-video), LAPORAN_BRANCH (laporan), RILIS_CHANNEL_ID,
  RILIS_VETO_JAM (12), RILIS_MAKS_PER_HARI (1), RILIS_SLOT (11:30,17:30,19:30 WIB),
  RILIS_INTERVAL_MENIT (15), RILIS_PUSH_LAPORAN (1), RILIS_API_TERAUDIT (0),
  TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
  RILIS_IG (0), RILIS_TIKTOK (0), RILIS_TIKTOK_PRIVACY (SELF_ONLY)  → publisher_sosmed.py

Mode STOK (default): paket di branch rilis-video = stok per divisi. Tiap kali jalan, untuk setiap divisi:
  kalau posting terakhir divisi itu sudah >= RILIS_JEDA_JAM (12) jam lalu, ambil SATU paket ACAK dari stok
  (yang sudah berumur >= RILIS_VETO_JAM sejak dibuat) lalu posting ke YouTube/Instagram/TikTok divisi itu.
  RILIS_YT_DIVISI (ternyata-leluhur) = divisi pemilik token YouTube.
Veto: hapus folder rilis/<ep> di branch rilis-video, atau `python rilis_worker.py veto <ep>`.
"""
import argparse
import json
import os
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("RILIS_DATA_DIR", BASE_DIR / "data"))
CLIENT_SECRETS = DATA_DIR / "client_secrets.json"
TOKEN_FILE = DATA_DIR / "rilis_token.json"
STATE_FILE = DATA_DIR / "rilis_state.json"

SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.force-ssl",      # thumbnail + komentar
    "https://www.googleapis.com/auth/yt-analytics.readonly",
]

WIB = timezone(timedelta(hours=7))
REPO_DIR = Path(os.environ.get("RILIS_REPO_DIR", BASE_DIR / "data" / "rilis-repo"))
RILIS_BRANCH = os.environ.get("RILIS_BRANCH", "rilis-video")
LAPORAN_BRANCH = os.environ.get("LAPORAN_BRANCH", "laporan")
CHANNEL_ID = os.environ.get("RILIS_CHANNEL_ID", "").strip()
VETO_JAM = float(os.environ.get("RILIS_VETO_JAM", "12"))
MAKS_PER_HARI = int(os.environ.get("RILIS_MAKS_PER_HARI", "1"))
SLOT = [s.strip() for s in os.environ.get("RILIS_SLOT", "11:30,17:30,19:30").split(",") if s.strip()]
JEDA_JAM = float(os.environ.get("RILIS_JEDA_JAM", "12"))
YT_DIVISI = os.environ.get("RILIS_YT_DIVISI", "ternyata-leluhur")
INTERVAL_MENIT = int(os.environ.get("RILIS_INTERVAL_MENIT", "15"))
PUSH_LAPORAN = os.environ.get("RILIS_PUSH_LAPORAN", "1") == "1"
# Video dari proyek API yang belum lolos audit YouTube terkunci PRIVATE dan tidak bisa dibuat publik.
# Upload hanya jalan kalau owner menyatakan proyeknya sudah lolos audit.
API_TERAUDIT = os.environ.get("RILIS_API_TERAUDIT", "0") == "1"


def log(msg):
    print(f"[{datetime.now(WIB):%Y-%m-%d %H:%M:%S} WIB] {msg}", flush=True)


# ── jadwal ──────────────────────────────────────────────────────────────────
def jadwal_tayang(now_utc, veto_jam=VETO_JAM, slots=SLOT):
    """Slot WIB pertama yang >= sekarang + jeda veto. Mengembalikan datetime UTC."""
    paling_cepat = now_utc + timedelta(hours=veto_jam)
    lokal = paling_cepat.astimezone(WIB)
    for hari in range(0, 8):
        tgl = (lokal + timedelta(days=hari)).date()
        for s in sorted(slots):
            hh, mm = (int(x) for x in s.split(":"))
            kandidat = datetime(tgl.year, tgl.month, tgl.day, hh, mm, tzinfo=WIB)
            if kandidat >= lokal:
                return kandidat.astimezone(timezone.utc)
    return paling_cepat  # tanpa slot cocok: pakai jeda minimum


def publish_at_str(dt_utc):
    """Format publishAt YouTube; tolak waktu yang tidak di masa depan (tidak pernah jatuh ke public)."""
    if dt_utc is None or dt_utc <= datetime.now(timezone.utc) + timedelta(minutes=30):
        raise ValueError(f"publishAt tidak valid / terlalu dekat: {dt_utc}")
    return dt_utc.strftime("%Y-%m-%dT%H:%M:%S.000Z")


# ── state ───────────────────────────────────────────────────────────────────
def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text(encoding="utf-8"))
    return {"rilis": {}, "laporanTerakhir": None}


def save_state(st):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp = STATE_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(st, indent=1, ensure_ascii=False), encoding="utf-8")
    tmp.replace(STATE_FILE)


def jumlah_hari_ini(st, now_utc):
    hari = now_utc.astimezone(WIB).date().isoformat()
    return sum(1 for r in st["rilis"].values() if r.get("diunggahWib", "")[:10] == hari)


# ── git ─────────────────────────────────────────────────────────────────────
def git(*args, cwd=REPO_DIR, check=True):
    return subprocess.run(["git", *args], cwd=cwd, check=check, capture_output=True, text=True)


def tarik_paket():
    if not (REPO_DIR / ".git").exists():
        raise SystemExit(f"Repo rilis belum di-clone di {REPO_DIR}. Lihat workflow/RILIS.md langkah 4.")
    git("fetch", "origin", RILIS_BRANCH)
    git("checkout", "-B", RILIS_BRANCH, f"origin/{RILIS_BRANCH}")
    git("reset", "--hard", f"origin/{RILIS_BRANCH}")
    di_git = set(git("ls-tree", "-r", "--name-only", "HEAD", "rilis/").stdout.split())
    paket = []
    for j in sorted((REPO_DIR / "rilis").glob("*/rilis.json")):
        try:
            meta = json.loads(j.read_text(encoding="utf-8"))
        except Exception as e:
            log(f"lewati {j}: JSON rusak ({e})")
            continue
        meta["_dir"] = j.parent
        meta["_video_di_git"] = f"rilis/{j.parent.name}/video.mp4" in di_git
        paket.append(meta)
    return paket


def validasi(meta):
    salah = []
    for k in ("ep", "channel", "judul", "deskripsi"):
        if not meta.get(k):
            salah.append(f"field '{k}' kosong")
    if not (meta["_dir"] / "video.mp4").exists() and not meta.get("_video_di_git"):
        salah.append("video.mp4 tidak ada")
    if meta.get("cekFakta") != "lolos":
        salah.append("cekFakta belum 'lolos'")
    if len(meta.get("judul", "")) > 100:
        salah.append("judul > 100 karakter")
    return salah


# ── YouTube ─────────────────────────────────────────────────────────────────
def kredensial():
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    if not TOKEN_FILE.exists():
        raise SystemExit("Belum login. Jalankan: python rilis_worker.py auth")
    creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")
    return creds


def layanan():
    from googleapiclient.discovery import build
    creds = kredensial()
    return build("youtube", "v3", credentials=creds), build("youtubeAnalytics", "v2", credentials=creds)


def cek_channel(yt):
    me = yt.channels().list(part="id,snippet,contentDetails", mine=True).execute()["items"][0]
    if not CHANNEL_ID:
        raise SystemExit(f"RILIS_CHANNEL_ID belum diisi. Channel yang login: {me['snippet']['title']} ({me['id']})")
    if me["id"] != CHANNEL_ID:
        raise SystemExit(f"Token milik channel lain ({me['snippet']['title']} {me['id']}), bukan {CHANNEL_ID}. Berhenti.")
    return me


def judul_terunggah(yt, me, n=50):
    pl = me["contentDetails"]["relatedPlaylists"]["uploads"]
    items = yt.playlistItems().list(part="snippet", playlistId=pl, maxResults=n).execute().get("items", [])
    return {it["snippet"]["title"].strip().lower() for it in items}


def unggah(yt, meta, publish_at):
    from googleapiclient.http import MediaFileUpload
    body = {
        "snippet": {
            "title": meta["judul"][:100],
            "description": meta["deskripsi"],
            "tags": meta.get("tags", [])[:30],
            "categoryId": str(meta.get("kategori", "27")),   # 27 = Education
            "defaultLanguage": "id",
            "defaultAudioLanguage": "id",
        },
        "status": {
            "privacyStatus": "private",
            "publishAt": publish_at,
            "selfDeclaredMadeForKids": False,
            "containsSyntheticMedia": bool(meta.get("konten_sintetis", True)),
        },
    }
    media = MediaFileUpload(str(meta["_dir"] / "video.mp4"), mimetype="video/mp4", chunksize=4 * 1024 * 1024, resumable=True)
    req = yt.videos().insert(part="snippet,status", body=body, media_body=media)
    resp = None
    while resp is None:
        _, resp = req.next_chunk()
    vid = resp["id"]
    thumb = meta["_dir"] / "thumb.png"
    if thumb.exists():
        try:
            yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(str(thumb), mimetype="image/png")).execute()
        except Exception as e:  # channel belum terverifikasi / Shorts tidak menerima thumbnail API
            log(f"thumbnail {meta['ep']} gagal dipasang: {e}")
    return vid


def kabari(teks):
    tok, chat = os.environ.get("TELEGRAM_BOT_TOKEN"), os.environ.get("TELEGRAM_CHAT_ID")
    if not (tok and chat):
        return
    try:
        data = urllib.parse.urlencode({"chat_id": chat, "text": teks, "disable_web_page_preview": "true"}).encode()
        urllib.request.urlopen(f"https://api.telegram.org/bot{tok}/sendMessage", data=data, timeout=20).read()
    except Exception as e:
        log(f"notifikasi Telegram gagal: {e}")


# ── laporan analytics ───────────────────────────────────────────────────────
def buat_laporan(yt, ya, me):
    pl = me["contentDetails"]["relatedPlaylists"]["uploads"]
    items = yt.playlistItems().list(part="contentDetails", playlistId=pl, maxResults=50).execute().get("items", [])
    ids = [it["contentDetails"]["videoId"] for it in items]
    video = {}
    if ids:
        for v in yt.videos().list(part="snippet,statistics,contentDetails,status", id=",".join(ids)).execute().get("items", []):
            st = v.get("statistics", {})
            video[v["id"]] = {
                "judul": v["snippet"]["title"], "terbit": v["snippet"]["publishedAt"],
                "status": v["status"]["privacyStatus"], "durasi": v["contentDetails"]["duration"],
                "views": int(st.get("viewCount", 0)), "likes": int(st.get("likeCount", 0)),
                "komentar": int(st.get("commentCount", 0)),
            }
    metrik = "views,averageViewDuration,averageViewPercentage,likes,comments,shares,subscribersGained"
    try:
        r = ya.reports().query(ids="channel==MINE", startDate="2020-01-01",
                               endDate=datetime.now(WIB).date().isoformat(), metrics=metrik,
                               dimensions="video", sort="-views", maxResults=200).execute()
        kol = [h["name"] for h in r.get("columnHeaders", [])]
        for row in r.get("rows", []):
            d = dict(zip(kol, row))
            video.setdefault(d["video"], {}).update({k: d[k] for k in kol if k != "video"})
    except Exception as e:
        log(f"Analytics API gagal (laporan hanya berisi statistik dasar): {e}")
    return {
        "dibuat": datetime.now(WIB).isoformat(timespec="seconds"),
        "channel": {"id": me["id"], "nama": me["snippet"]["title"]},
        "catatan": "averageViewPercentage dari YouTube Analytics API. Metrik 'ditonton vs digeser' tidak tersedia di API; owner kirim manual dari Studio bila perlu.",
        "video": video,
    }


def simpan_laporan(lap):
    hari = datetime.now(WIB).date().isoformat()
    lapdir = DATA_DIR / "laporan"
    lapdir.mkdir(parents=True, exist_ok=True)
    teks = json.dumps(lap, indent=1, ensure_ascii=False)
    (lapdir / f"yt-{hari}.json").write_text(teks, encoding="utf-8")
    if not PUSH_LAPORAN:
        return
    wt = DATA_DIR / "laporan-repo"
    if not (wt / ".git").exists():
        subprocess.run(["git", "clone", "--no-checkout", str(REPO_DIR), str(wt)], check=True, capture_output=True)
        url = git("remote", "get-url", "origin").stdout.strip()
        git("remote", "set-url", "origin", url, cwd=wt)
    ada = git("ls-remote", "--heads", "origin", LAPORAN_BRANCH, cwd=wt).stdout.strip()
    if ada:
        git("fetch", "origin", LAPORAN_BRANCH, cwd=wt)
        git("checkout", "-B", LAPORAN_BRANCH, f"origin/{LAPORAN_BRANCH}", cwd=wt)
    else:
        git("checkout", "--orphan", LAPORAN_BRANCH, cwd=wt)
        git("rm", "-rf", "--quiet", ".", cwd=wt, check=False)
    (wt / "laporan").mkdir(exist_ok=True)
    (wt / "laporan" / f"yt-{hari}.json").write_text(teks, encoding="utf-8")
    (wt / "laporan" / "terbaru.json").write_text(teks, encoding="utf-8")
    git("add", "laporan", cwd=wt)
    if git("diff", "--cached", "--quiet", cwd=wt, check=False).returncode != 0:
        git("-c", "user.name=rilis-worker", "-c", "user.email=rilis-worker@localhost",
            "commit", "-m", f"laporan YouTube {hari}", cwd=wt)
        git("push", "origin", LAPORAN_BRANCH, cwd=wt)
    log(f"laporan {hari} tersimpan" + (" dan di-push" if PUSH_LAPORAN else ""))


# ── perintah ────────────────────────────────────────────────────────────────
def cmd_auth(_):
    from google_auth_oauthlib.flow import InstalledAppFlow
    if not CLIENT_SECRETS.exists():
        raise SystemExit(f"Taruh client_secrets.json (OAuth 'Desktop app') di {CLIENT_SECRETS}")
    flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRETS), SCOPES)
    creds = flow.run_local_server(host="localhost", port=8765, open_browser=False,
                                  authorization_prompt_message="Buka URL ini di browser (lewat SSH tunnel port 8765):\n{url}")
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")
    os.chmod(TOKEN_FILE, 0o600)
    log(f"token tersimpan di {TOKEN_FILE}")


def proses_rilis(paket, st, dry, yt=None, me=None, now=None):
    now = now or datetime.now(timezone.utc)
    terunggah = judul_terunggah(yt, me) if (yt and not dry) else set()
    for meta in paket:
        ep = meta["ep"]
        if ep in st["rilis"]:
            continue
        salah = validasi(meta)
        if salah:
            log(f"{ep}: tidak diunggah — {'; '.join(salah)}")
            continue
        if meta["channel"] != "ternyata-leluhur" and not os.environ.get("RILIS_SEMUA_CHANNEL"):
            log(f"{ep}: channel '{meta['channel']}' bukan target worker ini, dilewati")
            continue
        if jumlah_hari_ini(st, now) >= MAKS_PER_HARI:
            log(f"kuota {MAKS_PER_HARI}/hari tercapai; {ep} menunggu besok")
            break
        if meta["judul"].strip().lower() in terunggah:
            log(f"{ep}: judul sudah ada di channel, ditandai terunggah tanpa upload ulang")
            st["rilis"][ep] = {"youtubeId": None, "catatan": "judul sudah ada", "diunggahWib": now.astimezone(WIB).isoformat()}
            continue
        if not dry and not API_TERAUDIT:
            log(f"{ep}: siap rilis, tapi RILIS_API_TERAUDIT belum 1 (proyek API belum lolos audit). "
                "Unggah manual lewat aplikasi YouTube; worker tidak mengunggah.")
            continue
        tayang = jadwal_tayang(now)
        pub = publish_at_str(tayang) if not dry else tayang.strftime("%Y-%m-%dT%H:%M:%S.000Z")
        if dry:
            log(f"[dry-run] {ep}: akan diunggah private, tayang {tayang.astimezone(WIB):%Y-%m-%d %H:%M} WIB — {meta['judul']}")
            st["rilis"][ep] = {"youtubeId": "DRY", "publishAt": pub, "diunggahWib": now.astimezone(WIB).isoformat()}
            continue
        vid = unggah(yt, meta, pub)
        st["rilis"][ep] = {"youtubeId": vid, "publishAt": pub, "judul": meta["judul"],
                           "diunggahWib": now.astimezone(WIB).isoformat()}
        save_state(st)
        jam = tayang.astimezone(WIB).strftime("%d %b %H:%M WIB")
        log(f"{ep}: terunggah {vid}, tayang {jam}")
        kabari(f"[Ternyata Leluhur] {ep} dijadwalkan tayang {jam}.\n{meta['judul']}\n"
               f"Veto: buka https://studio.youtube.com/video/{vid}/edit lalu hapus / ubah jadwal sebelum jam tayang.")
    return st


# ── mode stok: acak, jeda minimal per divisi ────────────────────────────────
def _waktu(iso):
    return datetime.fromisoformat(iso).astimezone(timezone.utc)


def siapkan_video(meta):
    """Checkout di Actions bersifat sparse (hanya rilis.json); unduh video paket yang terpilih saja."""
    if not (meta["_dir"] / "video.mp4").exists():
        git("sparse-checkout", "add", f"rilis/{meta['_dir'].name}/", check=False)
    if not (meta["_dir"] / "video.mp4").exists():
        raise RuntimeError("video.mp4 tidak bisa diambil dari branch rilis-video")


def _posting_yt(yt, me, meta, now):
    if not API_TERAUDIT:
        raise RuntimeError("RILIS_API_TERAUDIT belum 1 (proyek API belum lolos audit)")
    if meta["judul"].strip().lower() in judul_terunggah(yt, me):
        return {"id": None, "catatan": "judul sudah ada di channel"}
    pub = publish_at_str(now + timedelta(minutes=40))  # private terjadwal 40 menit lagi, tidak langsung public
    return {"id": unggah(yt, meta, pub), "publishAt": pub}


def proses_stok(paket, st, dry, yt=None, me=None, now=None):
    import random
    import publisher_sosmed as ps
    now = now or datetime.now(timezone.utc)
    stok = st.setdefault("stok", {})
    terakhir = st.setdefault("terakhirPosting", {})
    per_divisi = {}
    for meta in paket:
        per_divisi.setdefault(meta["channel"], []).append(meta)
    for ch, daftar in per_divisi.items():
        platform = ps.platform_aktif(ch) + (["youtube"] if (yt and ch == YT_DIVISI) else [])
        if not platform:
            continue
        # 1) lanjutkan paket terpilih yang masih gagal di sebagian platform (maks 3 percobaan)
        kerja = [m for m in daftar if stok.get(m["ep"], {}).get("dipilih")]
        # 2) ambil 1 paket acak baru kalau jeda sudah lewat
        boleh = not terakhir.get(ch) or now >= _waktu(terakhir[ch]) + timedelta(hours=JEDA_JAM)
        calon = [m for m in daftar if m["ep"] not in stok and not validasi(m)
                 and now >= _waktu(m.get("dibuat") or now.isoformat()) + timedelta(hours=VETO_JAM)]
        sisa = len(calon)
        if boleh and calon:
            m = random.choice(calon)
            stok[m["ep"]] = {"channel": ch, "dipilih": now.astimezone(WIB).isoformat()}
            terakhir[ch] = now.astimezone(WIB).isoformat()
            sisa -= 1
            log(f"[{ch}] {m['ep']} terpilih acak dari {len(calon)} stok siap; sisa {sisa}")
            kerja.append(m)
        elif calon:
            log(f"[{ch}] {len(calon)} stok menunggu; posting berikutnya ≥ "
                f"{(_waktu(terakhir[ch]) + timedelta(hours=JEDA_JAM)).astimezone(WIB):%d %b %H:%M} WIB")
        for meta in kerja:
            ep, ent = meta["ep"], stok[meta["ep"]]
            for p in platform:
                r = ent.get(p, {})
                if r.get("ok") or r.get("coba", 0) >= 3:
                    continue
                if dry:
                    log(f"[dry-run] {ep}: akan diposting ke {p}")
                    continue
                try:
                    siapkan_video(meta)
                    hasil = _posting_yt(yt, me, meta, now) if p == "youtube" else ps.posting(p, ch, meta)
                    ent[p] = {"ok": True, **hasil, "wib": datetime.now(WIB).isoformat()}
                    log(f"{ep}: terposting di {p} {hasil}")
                    kabari(f"[{ch}] {ep} terposting di {p}: {meta['judul']} (sisa stok {sisa})")
                except Exception as e:
                    ent[p] = {"ok": False, "coba": r.get("coba", 0) + 1, "error": str(e)[:300]}
                    log(f"{ep}: gagal posting ke {p} (percobaan {ent[p]['coba']}/3): {e}")
                    if ent[p]["coba"] >= 3:
                        kabari(f"[{ch}] {ep} GAGAL diposting ke {p} 3x: {str(e)[:200]}")
                if not dry:
                    save_state(st)
            if all(ent.get(p, {}).get("ok") or ent.get(p, {}).get("coba", 0) >= 3 for p in platform):
                ent.pop("dipilih", None)
                ent["selesai"] = datetime.now(WIB).isoformat()
    return st


def cmd_veto(args):
    st = load_state()
    st.setdefault("stok", {}).setdefault(args.ep, {})["veto"] = True
    save_state(st)
    log(f"{args.ep}: diveto, tidak akan diposting")


def cmd_once(args):
    st = load_state()
    paket = tarik_paket()
    yt = ya = me = None
    if not TOKEN_FILE.exists():
        log("YouTube belum login (rilis_worker.py auth); YouTube dilewati, Instagram/TikTok tetap jalan.")
    elif not args.dry_run:
        yt, ya = layanan()
        me = cek_channel(yt)
    st = proses_stok(paket, st, args.dry_run, yt, me)
    if not args.dry_run and yt:
        save_state(st)
        hari = datetime.now(WIB).date().isoformat()
        if st.get("laporanTerakhir") != hari and datetime.now(WIB).hour >= 6:
            simpan_laporan(buat_laporan(yt, ya, me))
            st["laporanTerakhir"] = hari
            save_state(st)
    elif not args.dry_run:
        save_state(st)


def cmd_report(_):
    yt, ya = layanan()
    me = cek_channel(yt)
    simpan_laporan(buat_laporan(yt, ya, me))


def cmd_loop(args):
    while True:
        try:
            cmd_once(args)
        except SystemExit as e:
            log(f"berhenti: {e}")
            raise
        except Exception as e:
            log(f"error (dicoba lagi nanti): {e!r}")
        time.sleep(INTERVAL_MENIT * 60)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("auth")
    p = sub.add_parser("once"); p.add_argument("--dry-run", action="store_true")
    sub.add_parser("report")
    p = sub.add_parser("loop"); p.add_argument("--dry-run", action="store_true")
    p = sub.add_parser("veto"); p.add_argument("ep")
    args = ap.parse_args()
    {"auth": cmd_auth, "once": cmd_once, "report": cmd_report, "loop": cmd_loop, "veto": cmd_veto}[args.cmd](args)


if __name__ == "__main__":
    main()
