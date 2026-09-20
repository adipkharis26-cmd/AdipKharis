import os
import json
import sqlite3
from pathlib import Path
from datetime import datetime, timezone

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError

from config import CLIENT_SECRETS_FILE, TOKEN_FILE, DB_PATH, YOUTUBE_SCOPES
from database import add_log, update_stock_video

class YouTubeUploader:
    def __init__(self):
        self.scopes = YOUTUBE_SCOPES
        self.client_secrets_file = CLIENT_SECRETS_FILE
        self.token_file = TOKEN_FILE
        self.db_path = DB_PATH

    def is_configured(self) -> bool:
        """Mengecek apakah client_secrets.json sudah ada."""
        return self.client_secrets_file.exists()

    def get_credentials(self, channel_id: str = None) -> Credentials:
        """
        Mendapatkan kredensial OAuth2 untuk channel tertentu atau channel yang sedang aktif.
        Auto-refresh jika kedaluwarsa dan update ke database SQLite.
        """
        if not self.db_path.exists():
            return None
            
        con = sqlite3.connect(self.db_path)
        cur = con.cursor()
        
        if channel_id:
            cur.execute("SELECT channel_id, token_json FROM youtube_channels WHERE channel_id = ?", (channel_id,))
        else:
            cur.execute("SELECT channel_id, token_json FROM youtube_channels WHERE is_active = 1 LIMIT 1")
            
        row = cur.fetchone()
        if not row and not channel_id:
            # Fallback ambil channel pertama
            cur.execute("SELECT channel_id, token_json FROM youtube_channels ORDER BY id ASC LIMIT 1")
            row = cur.fetchone()
            
        con.close()

        if not row:
            # Fallback jika ada token.json lama
            if self.token_file.exists():
                try:
                    return Credentials.from_authorized_user_file(str(self.token_file), self.scopes)
                except Exception:
                    return None
            return None

        target_channel_id, token_json_str = row
        try:
            token_data = json.loads(token_json_str)
            creds = Credentials.from_authorized_user_info(token_data, self.scopes)
        except Exception:
            return None

        # Perbarui token jika sudah kedaluwarsa
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                con = sqlite3.connect(self.db_path)
                con.execute(
                    "UPDATE youtube_channels SET token_json = ? WHERE channel_id = ?",
                    (creds.to_json(), target_channel_id)
                )
                con.commit()
                con.close()
            except Exception:
                return None

        return creds

    def is_authenticated(self, channel_id: str = None) -> bool:
        """Mengecek apakah ada channel aktif yang siap untuk upload."""
        creds = self.get_credentials(channel_id)
        return creds is not None and (creds.valid or (creds.expired and creds.refresh_token))

    def get_auth_url(self, redirect_uri: str = "http://localhost:8000/api/youtube/oauth-callback") -> str:
        """
        Membuat URL OAuth2 Google untuk autorisasi channel YouTube.
        Menggunakan prompt='select_account consent' agar user dapat memilih / menambahkan
        berbagai channel YouTube atau akun Google yang berbeda tanpa bentrok.
        """
        if not self.is_configured():
            raise FileNotFoundError("File client_secrets.json belum ditemukan di folder data.")
            
        flow = Flow.from_client_secrets_file(
            str(self.client_secrets_file),
            scopes=self.scopes,
            redirect_uri=redirect_uri
        )
        auth_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='select_account consent' # Memungkinkan memilih akun/channel yang berbeda
        )

        # Simpan code_verifier PKCE agar saat Google callback bisa diverifikasi
        verifier_path = self.client_secrets_file.parent / "code_verifier.txt"
        if getattr(flow, "code_verifier", None):
            verifier_path.write_text(flow.code_verifier, encoding="utf-8")

        return auth_url

    def handle_auth_code(self, code: str, redirect_uri: str = "http://localhost:8000/api/youtube/oauth-callback") -> dict:
        """
        Menukar kode autorisasi OAuth menjadi token permanen, 
        mendeteksi profil channel YouTube tersebut, dan menyimpannya ke database.
        """
        flow = Flow.from_client_secrets_file(
            str(self.client_secrets_file),
            scopes=self.scopes,
            redirect_uri=redirect_uri
        )

        # Ambil code_verifier PKCE yang disimpan saat pembuatan URL
        verifier_path = self.client_secrets_file.parent / "code_verifier.txt"
        if verifier_path.exists():
            verifier = verifier_path.read_text(encoding="utf-8").strip()
            if verifier:
                flow.code_verifier = verifier
                flow.fetch_token(code=code, code_verifier=verifier)
            else:
                flow.fetch_token(code=code)
        else:
            flow.fetch_token(code=code)

        credentials = flow.credentials
        token_json_str = credentials.to_json()

        # Deteksi info channel yang baru dihubungkan
        youtube = build("youtube", "v3", credentials=credentials)
        request = youtube.channels().list(
            part="snippet,statistics",
            mine=True
        )
        response = request.execute()

        if not response.get("items"):
            raise Exception("Tidak ada channel YouTube yang ditemukan pada akun Google ini.")

        channel = response["items"][0]
        channel_id = channel.get("id")
        snippet = channel.get("snippet", {})
        stats = channel.get("statistics", {})

        title = snippet.get("title", "YouTube Channel")
        custom_url = snippet.get("customUrl", "")
        thumbnail = snippet.get("thumbnails", {}).get("default", {}).get("url", "")
        subscriber_count = stats.get("subscriberCount", "0")

        # Simpan ke tabel youtube_channels di SQLite
        now = datetime.now().isoformat()
        con = sqlite3.connect(self.db_path)
        cur = con.cursor()
        
        # Cek apakah ada channel aktif
        cur.execute("SELECT COUNT(*) FROM youtube_channels WHERE is_active = 1")
        active_count = cur.fetchone()[0]
        
        # Jika belum ada yang aktif, otomatis jadikan channel ini aktif
        is_active_val = 1 if active_count == 0 else 0
        
        # Simpan atau update
        cur.execute("SELECT id FROM youtube_channels WHERE channel_id = ?", (channel_id,))
        existing = cur.fetchone()
        
        if existing:
            cur.execute("""
                UPDATE youtube_channels
                SET title = ?, custom_url = ?, thumbnail = ?, subscriber_count = ?, token_json = ?
                WHERE channel_id = ?
            """, (title, custom_url, thumbnail, subscriber_count, token_json_str, channel_id))
        else:
            cur.execute("""
                INSERT INTO youtube_channels (channel_id, title, custom_url, thumbnail, subscriber_count, token_json, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (channel_id, title, custom_url, thumbnail, subscriber_count, token_json_str, is_active_val, now))
            
        con.commit()
        con.close()

        # Backup juga ke token.json
        try:
            with open(self.token_file, "w") as f:
                f.write(token_json_str)
        except Exception:
            pass

        return {
            "channel_id": channel_id,
            "title": title,
            "custom_url": custom_url,
            "thumbnail": thumbnail,
            "subscriber_count": subscriber_count
        }

    def get_channel_info(self, channel_id: str = None) -> dict:
        """Mengambil profil channel YouTube aktif atau yang ditentukan."""
        creds = self.get_credentials(channel_id)
        if not creds:
            return None
            
        try:
            youtube = build("youtube", "v3", credentials=creds)
            request = youtube.channels().list(
                part="snippet,statistics",
                mine=True
            )
            response = request.execute()
            
            if response.get("items"):
                channel = response["items"][0]
                snippet = channel.get("snippet", {})
                stats = channel.get("statistics", {})
                return {
                    "connected": True,
                    "id": channel.get("id"),
                    "title": snippet.get("title"),
                    "description": snippet.get("description"),
                    "custom_url": snippet.get("customUrl", ""),
                    "thumbnail": snippet.get("thumbnails", {}).get("default", {}).get("url", ""),
                    "subscribers": stats.get("subscriberCount", "0"),
                    "total_videos": stats.get("videoCount", "0"),
                    "total_views": stats.get("viewCount", "0")
                }
        except Exception as e:
            return {"connected": False, "error": str(e)}
            
        return {"connected": False, "error": "Channel tidak ditemukan"}

    def format_publish_at(self, local_scheduled_iso: str) -> str:
        """
        Mengonversi waktu jadwal lokal (ISO) ke format UTC ISO-8601 dengan akhiran 'Z'
        yang diwajibkan oleh YouTube Data API v3 (misal: 2026-09-17T02:00:00.000Z).
        """
        if not local_scheduled_iso:
            return None
            
        try:
            dt = datetime.fromisoformat(local_scheduled_iso)
            local_tz = datetime.now().astimezone().tzinfo
            dt_with_tz = dt.replace(tzinfo=local_tz)
            utc_dt = dt_with_tz.astimezone(timezone.utc)
            now_utc = datetime.now(timezone.utc)
            # YouTube API mewajibkan publishAt harus berada di masa depan (> waktu saat ini)
            if utc_dt <= now_utc:
                return None
            return utc_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
        except Exception:
            return None

    def upload_short(self, video_data: dict, channel_id: str = None, progress_callback=None) -> dict:
        """
        Mengunggah video ke YouTube Shorts dengan penjadwalan publishAt
        menggunakan channel aktif atau channel tertentu yang dipilih.
        """
        creds = self.get_credentials(channel_id)
        if not creds:
            raise Exception("Tidak ada channel YouTube yang aktif atau terhubung. Silakan hubungkan channel di Pengaturan.")

        file_path = video_data.get("file_path")
        if not file_path or not os.path.exists(file_path):
            raise FileNotFoundError(f"File video tidak ditemukan di: {file_path}")

        title = video_data.get("title", "Shorts Video")[:100]
        description = video_data.get("description", "")
        tags = video_data.get("tags", [])
        scheduled_time = video_data.get("scheduled_time")

        body = {
            "snippet": {
                "title": title,
                "description": description,
                "tags": tags,
                "categoryId": "22", # People & Blogs
                "defaultLanguage": "id"
            },
            "status": {
                "selfDeclaredMadeForKids": False
            }
        }

        utc_publish_at = self.format_publish_at(scheduled_time)
        is_public = False
        if utc_publish_at:
            body["status"]["privacyStatus"] = "private"
            body["status"]["publishAt"] = utc_publish_at
        else:
            body["status"]["privacyStatus"] = "public"
            is_public = True

        youtube = build("youtube", "v3", credentials=creds)
        media = MediaFileUpload(
            file_path,
            mimetype="video/mp4",
            chunksize=1024 * 1024 * 4, # Chunk 4MB
            resumable=True
        )

        request = youtube.videos().insert(
            part="snippet,status",
            body=body,
            media_body=media
        )

        response = None
        while response is None:
            status, response = request.next_chunk()
            if status and progress_callback:
                progress_callback(int(status.progress() * 100))

        video_id = response.get("id")
        youtube_url = f"https://youtube.com/shorts/{video_id}"
        
        return {
            "video_id": video_id,
            "youtube_url": youtube_url,
            "scheduled_time": scheduled_time,
            "publish_at_utc": utc_publish_at,
            "is_public": is_public
        }

    def update_video_metadata(self, youtube_id: str, title: str = None, description: str = None, tags: list = None, scheduled_time: str = None, channel_id: str = None) -> dict:
        """
        Memperbarui judul, deskripsi, tag, dan jam rilis video langsung di server YouTube.
        """
        creds = self.get_credentials(channel_id)
        if not creds:
            raise Exception("Channel YouTube tidak terhubung atau kredensial kedaluwarsa.")

        youtube = build("youtube", "v3", credentials=creds)

        # Ambil snippet dan status terkini dari YouTube
        response = youtube.videos().list(part="snippet,status", id=youtube_id).execute()
        if not response.get("items"):
            raise Exception(f"Video dengan ID {youtube_id} tidak ditemukan di YouTube.")

        video_item = response["items"][0]
        snippet = video_item.get("snippet", {})
        status = video_item.get("status", {})

        if title is not None:
            snippet["title"] = title[:100]
        if description is not None:
            snippet["description"] = description
        if tags is not None:
            snippet["tags"] = tags

        if scheduled_time:
            utc_publish_at = self.format_publish_at(scheduled_time)
            if utc_publish_at:
                status["privacyStatus"] = "private"
                status["publishAt"] = utc_publish_at
                status["selfDeclaredMadeForKids"] = False

        update_body = {
            "id": youtube_id,
            "snippet": snippet,
            "status": status
        }

        return youtube.videos().update(
            part="snippet,status",
            body=update_body
        ).execute()

    def delete_youtube_video(self, youtube_id: str, channel_id: str = None) -> bool:
        """
        Menghapus video secara permanen dari server YouTube.
        """
        creds = self.get_credentials(channel_id)
        if not creds:
            raise Exception("Channel YouTube tidak terhubung atau kredensial kedaluwarsa.")

        youtube = build("youtube", "v3", credentials=creds)
        try:
            youtube.videos().delete(id=youtube_id).execute()
            return True
        except HttpError as e:
            if e.resp.status == 404:
                return True
            raise e

    def get_batch_videos_stats(self, video_ids: list[str], channel_id: str = None) -> list[dict]:
        """
        Mengambil statistik viewCount dan publishedAt dari YouTube Data API untuk sekumpulan video_id.
        Menggunakan batch 50 video per panggilan API (sangat hemat kuota).
        """
        creds = self.get_credentials(channel_id)
        if not creds:
            return []

        clean_ids = [v.strip() for v in video_ids if v and v.strip()]
        if not clean_ids:
            return []

        results = []
        try:
            youtube = build("youtube", "v3", credentials=creds)
            # Batch per 50 video sesuai kuota API
            for i in range(0, len(clean_ids), 50):
                chunk = clean_ids[i:i + 50]
                req = youtube.videos().list(
                    part="snippet,statistics,status",
                    id=",".join(chunk)
                )
                res = req.execute()
                for item in res.get("items", []):
                    v_id = item.get("id")
                    snippet = item.get("snippet", {})
                    stats = item.get("statistics", {})
                    status = item.get("status", {})

                    results.append({
                        "youtube_id": v_id,
                        "view_count": int(stats.get("viewCount", 0)),
                        "published_at": snippet.get("publishedAt", ""),
                        "privacy_status": status.get("privacyStatus", "public")
                    })
        except Exception as e:
            pass

        return results

