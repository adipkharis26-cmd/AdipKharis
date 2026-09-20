import os
import json
from pathlib import Path
import imageio_ffmpeg

# Base Directories
BASE_DIR = Path(__file__).resolve().parent
DOWNLOADS_DIR = BASE_DIR / "downloads"
THUMBNAILS_DIR = BASE_DIR / "thumbnails"
DATA_DIR = BASE_DIR / "data"

# Ensure directories exist
for directory in [DOWNLOADS_DIR, THUMBNAILS_DIR, DATA_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Database
DB_PATH = DATA_DIR / "shorts_system.db"

# YouTube OAuth Credentials
CLIENT_SECRETS_FILE = DATA_DIR / "client_secrets.json"
TOKEN_FILE = DATA_DIR / "token.json"

# YouTube Data API Scopes
YOUTUBE_SCOPES = [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.force-ssl",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly"
]

# FFmpeg Executable from imageio-ffmpeg
try:
    FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FFMPEG_PATH = "ffmpeg"

# Default System Configuration
DEFAULT_SETTINGS = {
    "max_uploads_per_day": 3,
    "upload_slots": ["09:00", "13:00", "18:00"],  # Slot jam harian (WIB/Local)
    "auto_upload_enabled": True,                  # Otomatis upload ke YouTube setelah diunduh
    "title_template": "{clean_title} #Shorts",
    "description_template": "{clean_title}\n\nTonton sampai habis! Jangan lupa Like, Comment, dan Subscribe.\n\n#Shorts #Viral #Trending",
    "default_tags": ["shorts", "youtubeshorts", "viral", "trending", "fyp"],
    "privacy_status": "private",                  # Diunggah sebagai private dengan jadwal publishAt
    "gemini_api_key": ""                          # Opsional: untuk optimasi AI tingkat lanjut
}
