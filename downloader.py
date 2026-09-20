import os
import re
import urllib.request
from urllib.parse import urlparse
from pathlib import Path
import yt_dlp
from config import DOWNLOADS_DIR, THUMBNAILS_DIR, FFMPEG_PATH
from database import update_queue_status, add_log

def clean_filename(name: str) -> str:
    """Membersihkan karakter ilegal untuk nama file Windows."""
    # Hapus karakter tidak valid: \ / : * ? " < > |
    cleaned = re.sub(r'[\\/*?:"<>|]', "", name)
    # Hapus emoji berlebih / karakter non-ascii aneh jika perlu
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned[:80] if cleaned else "video"

# Set ID antrean yang dibatalkan oleh user
cancelled_queue_ids = set()

def cancel_queue_download(queue_id: int):
    """Menandai suatu queue_id agar unduhan yt-dlp segera dibatalkan seketika."""
    if queue_id:
        cancelled_queue_ids.add(int(queue_id))

class ShortsDownloader:
    def __init__(self):
        self.downloads_dir = DOWNLOADS_DIR
        self.thumbnails_dir = THUMBNAILS_DIR
        self.ffmpeg_path = FFMPEG_PATH

    def download_short(self, url: str, queue_number: int, queue_id: int = None, progress_callback=None, channel_name: str = "") -> dict:
        """
        Mengunduh video YouTube Shorts dengan nama berurutan rapi [#0001] Judul.mp4
        dan disimpan rapi ke dalam subfolder sesuai nama channel YouTube.
        """
        if queue_id and int(queue_id) in cancelled_queue_ids:
            cancelled_queue_ids.discard(int(queue_id))
            raise Exception("Unduhan dibatalkan oleh pengguna.")

        formatted_num = f"#{queue_number:04d}"
        
        # Tentukan folder output per channel
        clean_ch = clean_filename(channel_name) if channel_name else "General"
        channel_download_dir = self.downloads_dir / clean_ch
        channel_download_dir.mkdir(parents=True, exist_ok=True)

        channel_thumb_dir = self.thumbnails_dir / clean_ch
        channel_thumb_dir.mkdir(parents=True, exist_ok=True)
        
        # Hook untuk memantau kemajuan unduhan (progress %)
        def ytdl_hook(d):
            if queue_id and int(queue_id) in cancelled_queue_ids:
                cancelled_queue_ids.discard(int(queue_id))
                raise Exception("Unduhan dibatalkan oleh pengguna.")

            if d['status'] == 'downloading':
                total_bytes = d.get('total_bytes') or d.get('total_bytes_estimate') or 0
                downloaded = d.get('downloaded_bytes') or 0
                percent = (downloaded / total_bytes * 100) if total_bytes > 0 else 0
                speed = d.get('_speed_str', '')
                eta = d.get('_eta_str', '')
                
                if progress_callback:
                    progress_callback(percent, speed, eta)
            elif d['status'] == 'finished':
                if progress_callback:
                    progress_callback(100.0, "Selesai Menggabung MP4", "00:00")

        # Konfigurasi yt-dlp dengan auto-retry & penanganan Windows file locking
        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best',
            'outtmpl': str(channel_download_dir / f"[{formatted_num}] %(title).80B.%(ext)s"),
            'merge_output_format': 'mp4',
            'ffmpeg_location': self.ffmpeg_path,
            'progress_hooks': [ytdl_hook],
            'writethumbnail': False,
            'noplaylist': True,
            'quiet': True,
            'no_warnings': True,
            'socket_timeout': 30,
            'retries': 10,
            'fragment_retries': 10,
            'file_access_retries': 5,
            'windowsfilenames': True,
            'overwrites': True,
            'retry_sleep_functions': {'http': lambda n: 2, 'file_access': lambda n: 1},
        }

        # Bersihkan file sampah sisa parsial jika ada
        for old_temp in channel_download_dir.glob(f"[{formatted_num}]*.part*"):
            try:
                old_temp.unlink(missing_ok=True)
            except Exception:
                pass

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Ekstrak info video tanpa unduh dulu untuk metadata
            info = ydl.extract_info(url, download=False)
            if not info:
                raise Exception("Gagal mengekstrak informasi video dari link.")
            
            raw_title = info.get('title', f"Short {formatted_num}")
            clean_title_str = clean_filename(raw_title)
            
            # Tentukan path output file yang pasti di dalam folder channel
            out_filename = f"[{formatted_num}] {clean_title_str}.mp4"
            target_filepath = channel_download_dir / out_filename
            
            ydl_opts['outtmpl'] = str(target_filepath)
            
            # Unduh video secara penuh dengan pemulihan WinError 32 jika terjadi lock
            try:
                with yt_dlp.YoutubeDL(ydl_opts) as ydl_downloader:
                    download_info = ydl_downloader.extract_info(url, download=True)
            except Exception as dl_err:
                import time
                temp_matches = list(channel_download_dir.glob(f"[{formatted_num}]*.temp.mp4"))
                recovered = False
                if temp_matches:
                    temp_file = temp_matches[0]
                    for _ in range(5):
                        try:
                            time.sleep(1)
                            if target_filepath.exists():
                                os.remove(target_filepath)
                            os.replace(temp_file, target_filepath)
                            recovered = True
                            break
                        except OSError:
                            pass
                if not recovered:
                    raise dl_err

            # Jika nama file yang terunduh sedikit berbeda karena ekstensi
            actual_filepath = target_filepath
            if not actual_filepath.exists():
                # Cari file yang diawali [#0001] di folder channel
                matches = list(channel_download_dir.glob(f"[{formatted_num}]*.mp4"))
                if matches:
                    actual_filepath = matches[0]
                else:
                    raise FileNotFoundError(f"File video tidak ditemukan setelah proses unduh: {out_filename}")

            # Unduh thumbnail ke subfolder channel
            thumb_filename = f"thumb_{queue_number:04d}.jpg"
            thumb_filepath = channel_thumb_dir / thumb_filename
            thumbnail_url = info.get('thumbnail')
            
            if thumbnail_url and not thumb_filepath.exists():
                try:
                    urllib.request.urlretrieve(thumbnail_url, thumb_filepath)
                except Exception:
                    pass

            file_size = actual_filepath.stat().st_size if actual_filepath.exists() else 0

            return {
                "queue_number": queue_number,
                "url": url,
                "original_title": raw_title,
                "clean_title": clean_title_str,
                "description": info.get('description', ''),
                "tags": info.get('tags', []) or [],
                "duration": info.get('duration', 0) or 0,
                "file_path": str(actual_filepath),
                "file_size": file_size,
                "thumbnail_path": f"/thumbnails/{clean_ch}/{thumb_filename}" if thumb_filepath.exists() else "",
                "uploader": info.get('uploader', ''),
                "view_count": info.get('view_count', 0)
            }

    def extract_shorts_from_channel(self, channel_url: str, limit: int = 5) -> list[dict]:
        """
        Mengekstrak daftar N video Shorts terbaru dari channel YouTube tanpa mengunduh media.
        """
        is_valid, normalized_or_err = validate_and_normalize_channel(channel_url)
        if not is_valid:
            raise ValueError(normalized_or_err)

        target_url = normalized_or_err
        limit = max(1, min(100, int(limit)))

        ydl_opts = {
            'extract_flat': True,
            'playlistend': limit,
            'quiet': True,
            'no_warnings': True,
            'socket_timeout': 20,
            'ignoreerrors': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = None
            try:
                info = ydl.extract_info(target_url, download=False)
            except Exception:
                pass

            # Jika tab /shorts tidak ditemukan atau kosong, coba tab /videos atau URL channel
            if not info or not info.get('entries'):
                base_clean = re.sub(r'(/shorts|/videos|/featured)/?$', '', target_url)
                for alt_url in [f"{base_clean}/videos", base_clean]:
                    try:
                        info = ydl.extract_info(alt_url, download=False)
                        if info and info.get('entries'):
                            break
                    except Exception:
                        continue

            if not info:
                raise ValueError("Channel YouTube tidak ditemukan atau tidak memiliki video publik. Pastikan link atau @handle sudah benar.")

            entries = info.get('entries', []) or []
            results = []
            for e in entries:
                if not e:
                    continue
                vid_id = e.get('id')
                url = e.get('url')
                if not url and vid_id:
                    url = f"https://www.youtube.com/shorts/{vid_id}"
                elif url and not url.startswith('http'):
                    url = f"https://www.youtube.com/shorts/{url}"

                results.append({
                    "id": vid_id,
                    "title": e.get('title') or f"Shorts {vid_id}",
                    "url": url,
                    "channel_title": info.get('channel') or info.get('uploader') or ""
                })
                if len(results) >= limit:
                    break

            if not results:
                raise ValueError("Tidak ada video Shorts yang dapat ditemukan pada channel ini.")

            return results


def validate_and_normalize_channel(input_str: str) -> tuple[bool, str]:
    """
    Validasi ketat khusus channel YouTube.
    Jika bukan channel (misal: link video tunggal, shorts individu, domain lain), kembalikan (False, pesan_error).
    Jika valid, kembalikan (True, normalized_shorts_url).
    """
    s = (input_str or "").strip()
    if not s:
        return False, "Link channel YouTube tidak boleh kosong."

    # Format 1: @ChannelHandle
    if re.match(r"^@[a-zA-Z0-9_\.\-]+/?$", s):
        clean_handle = s.strip("/")
        return True, f"https://www.youtube.com/{clean_handle}/shorts"

    # Pastikan skema URL
    if not s.startswith(("http://", "https://")):
        s = "https://" + s

    try:
        parsed = urlparse(s)
    except Exception:
        return False, "Format link tidak valid."

    netloc = parsed.netloc.lower()
    if not (netloc == "youtube.com" or netloc.endswith(".youtube.com")):
        return False, "Bukan link YouTube. Fitur ini khusus untuk link channel YouTube."

    path = parsed.path.rstrip("/")

    # Tolak jika link video tunggal
    if "/watch" in path or "v=" in (parsed.query or ""):
        return False, "Ini adalah link video, bukan link channel YouTube. Harap masukkan link channel."

    # Tolak youtu.be/<id>
    if netloc == "youtu.be":
        return False, "Ini adalah link video, bukan link channel YouTube. Harap masukkan link channel."

    # Tolak jika /shorts/VIDEO_ID
    if re.match(r"^/shorts/[a-zA-Z0-9_\-]+$", path):
        return False, "Ini adalah link video Shorts individual, bukan link channel YouTube. Harap masukkan link channel."

    # Format valid channel:
    # 1. /@username atau /@username/shorts dsb
    if re.match(r"^/@[a-zA-Z0-9_\.\-]+(/shorts|/videos|/featured)?$", path):
        base = re.match(r"^(/@[a-zA-Z0-9_\.\-]+)", path).group(1)
        return True, f"https://www.youtube.com{base}/shorts"

    # 2. /channel/UC...
    if re.match(r"^/channel/UC[a-zA-Z0-9_\-]+(/shorts|/videos|/featured)?$", path):
        base = re.match(r"^(/channel/UC[a-zA-Z0-9_\-]+)", path).group(1)
        return True, f"https://www.youtube.com{base}/shorts"

    # 3. /c/CustomName atau /user/UserName
    if re.match(r"^/(c|user)/[a-zA-Z0-9_\.\-]+(/shorts|/videos|/featured)?$", path):
        base = re.match(r"^(/(c|user)/[a-zA-Z0-9_\.\-]+)", path).group(1)
        return True, f"https://www.youtube.com{base}/shorts"

    return False, "Format link channel YouTube tidak valid. Gunakan format seperti: https://www.youtube.com/@NamaChannel atau @NamaChannel"

