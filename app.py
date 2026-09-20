import asyncio
import os
import re
import shutil
from pathlib import Path
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import config
from database import (
    init_db, add_to_queue, add_multiple_to_queue, get_all_queue,
    get_next_pending_queue_item, update_queue_status, clear_completed_queue, retry_failed_queue,
    cancel_queue_item, cancel_all_pending_queue,
    add_stock_video, get_stock_videos, get_stock_video_by_id, update_stock_video,
    delete_stock_video, update_stock_video_stats, bulk_update_stock_videos, bulk_delete_stock_videos,
    get_all_settings, get_setting, set_setting,
    add_log, get_recent_logs, get_all_channels, get_active_channel,
    set_active_channel, delete_channel,
    deduplicate_stock, extract_youtube_id
)
from downloader import ShortsDownloader, cancel_queue_download
from metadata_generator import MetadataGenerator
from scheduler import UploadScheduler
from uploader import YouTubeUploader

# Inisialisasi Objek Utama
downloader = ShortsDownloader()
uploader = YouTubeUploader()

# Flag dan Task Background
running_tasks = {}

async def download_worker_loop():
    """Worker background yang memproses antrean unduh satu per satu (FIFO)."""
    await add_log("INFO", "Worker Pengunduh dimulai dan siap memproses antrean.")
    loop = asyncio.get_running_loop()
    
    while True:
        try:
            # Periksa apakah antrean unduhan sedang dijeda (paused)
            is_paused = await get_setting("queue_paused", False)
            if is_paused:
                await asyncio.sleep(2)
                continue

            item = await get_next_pending_queue_item()
            if not item:
                await asyncio.sleep(2)
                continue
                
            queue_id = item["id"]
            queue_number = item["queue_number"]
            url = item["url"]
            item_channel = item.get("channel_id", "") if isinstance(item, dict) else (item["channel_id"] if "channel_id" in item.keys() else "")
            if not item_channel:
                active_ch = await get_active_channel()
                item_channel = active_ch.get("channel_id", "") if active_ch else ""

            # Cari nama channel tujuan untuk subfolder penyimpanan downloads
            channel_name = ""
            if item_channel:
                all_channels = await get_all_channels()
                ch_map = {c["channel_id"]: c["title"] for c in all_channels}
                channel_name = ch_map.get(item_channel, "")
            if not channel_name:
                active_ch = await get_active_channel()
                channel_name = active_ch.get("title", "General") if active_ch else "General"
            
            await update_queue_status(queue_id, "downloading", progress=5.0)
            await add_log("INFO", f"Mulai mengunduh #{queue_number:04d} (Channel: {channel_name}): {url}")
            
            # Progress callback threadsafe dengan throttling hemat I/O disk & database
            import time
            last_prog_time = [time.time()]
            last_prog_val = [5.0]

            def on_progress(percent, speed, eta):
                now_t = time.time()
                # Hanya update database jika progress naik minimal 3% atau selang waktu >= 0.8 detik, atau selesai 100%
                if percent >= 100.0 or (percent - last_prog_val[0] >= 3.0) or (now_t - last_prog_time[0] >= 0.8):
                    last_prog_time[0] = now_t
                    last_prog_val[0] = percent
                    asyncio.run_coroutine_threadsafe(
                        update_queue_status(queue_id, "downloading", progress=round(percent, 1), speed=speed, eta=eta),
                        loop
                    )

            # Jalankan yt-dlp di worker thread agar tidak memblokir FastAPI
            try:
                video_info = await asyncio.to_thread(
                    downloader.download_short,
                    url=url,
                    queue_number=queue_number,
                    queue_id=queue_id,
                    progress_callback=on_progress,
                    channel_name=channel_name
                )
                
                # Buat metadata otomatis (Judul, Tag, Deskripsi) sesuai pengaturan channel tujuan
                settings = await get_all_settings(channel_id=item_channel)
                template = settings.get("title_template", "{clean_title} #Shorts")
                desc_template = settings.get("description_template", "")
                default_tags = settings.get("default_tags", [])
                gemini_key = settings.get("gemini_api_key", "")
                
                generated_title = MetadataGenerator.generate_title(video_info["original_title"], template)
                generated_tags = MetadataGenerator.generate_tags(video_info["clean_title"], video_info["tags"], default_tags)
                generated_desc = MetadataGenerator.generate_description(generated_title, video_info["description"], template=desc_template)
                
                # Optimasi AI jika kunci Gemini tersedia
                if gemini_key:
                    ai_meta = await asyncio.to_thread(
                        MetadataGenerator.optimize_with_gemini,
                        gemini_key, video_info["original_title"], video_info["description"]
                    )
                    if ai_meta:
                        if ai_meta.get("title"):
                            generated_title = ai_meta["title"][:100]
                        if ai_meta.get("tags"):
                            generated_tags = ai_meta["tags"]
                        if ai_meta.get("description") and not desc_template:
                            generated_desc = ai_meta["description"]

                # Tentukan jadwal rilis otomatis untuk channel ini
                scheduled_time = await UploadScheduler.get_next_available_slot(channel_id=item_channel)

                # Simpan ke inventaris stok lokal
                stock_data = {
                    "queue_number": queue_number,
                    "url": url,
                    "original_title": video_info["original_title"],
                    "title": generated_title,
                    "description": generated_desc,
                    "tags": generated_tags,
                    "duration": video_info["duration"],
                    "file_path": video_info["file_path"],
                    "file_size": video_info["file_size"],
                    "thumbnail_path": video_info["thumbnail_path"],
                    "status": "scheduled",
                    "scheduled_time": scheduled_time,
                    "channel_id": item_channel
                }
                
                stock_id = await add_stock_video(stock_data)
                await update_queue_status(queue_id, "completed", progress=100.0)
                await add_log("SUCCESS", f"#{queue_number:04d} Berhasil diunduh & masuk stok! Jadwal: {scheduled_time}")
                
            except Exception as e:
                # Bersihkan kode escape ANSI dari yt-dlp agar tampilan rapi
                raw_err = str(e)
                clean_err = re.sub(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])', '', raw_err).strip()
                clean_err = clean_err.replace("ERROR: ", "").strip()
                
                # Sederhanakan pesan kendala umum yang sering terjadi
                if "503" in clean_err:
                    clean_err = "Server YouTube sibuk / rate-limit sementara (HTTP 503). Item dilewati."
                elif "WinError 32" in clean_err:
                    clean_err = "File sedang digunakan sistem / antivirus (WinError 32). Item dilewati."
                else:
                    clean_err = f"Kendala unduh: {clean_err[:120]}"

                # Tandai item ini gagal dan lewati langsung ke video berikutnya
                await update_queue_status(queue_id, "failed", error_message=clean_err)
                await add_log("WARNING", f"Unduhan #{queue_number:04d} dilewati: {clean_err}")
                
            # Beri jeda 1.5 detik antar unduhan agar tidak terkena rate-limit YouTube saat unduh massal
            await asyncio.sleep(1.5)
                
        except asyncio.CancelledError:
            break
        except Exception as e:
            await asyncio.sleep(3)

async def upload_worker_loop():
    """
    Worker background yang otomatis mengunggah video stok ke YouTube untuk SEMUA channel yang terhubung.
    Masing-masing channel diproses secara independen sesuai kuota harian & jadwalnya sendiri,
    sehingga pengguna bebas beralih channel di web tanpa menghentikan otomatisasi channel lainnya.
    """
    await add_log("INFO", "Worker Pengunggah Multi-Channel YouTube aktif.")
    
    while True:
        try:
            await asyncio.sleep(15)
            all_channels = await get_all_channels()
            if not all_channels:
                continue

            today_str = datetime.now().strftime("%Y-%m-%d")

            # Periksa dan proses setiap channel yang terhubung secara mandiri sesuai setting masing-masing
            for ch in all_channels:
                ch_id = ch.get("channel_id")
                ch_title = ch.get("title", "Channel")
                if not ch_id or not uploader.is_authenticated(channel_id=ch_id):
                    continue

                # Periksa pengaturan otomatisasi khusus channel ini
                auto_upload = await get_setting("auto_upload_enabled", True, channel_id=ch_id)
                if not auto_upload:
                    continue

                max_uploads_per_day = await get_setting("max_uploads_per_day", 3, channel_id=ch_id)

                # Ambil stok video khusus channel ini
                stock_list = await get_stock_videos(channel_id=ch_id)

                # Cek kuota upload harian khusus untuk channel ini
                uploaded_today = sum(
                    1 for s in stock_list
                    if s.get("status") in ("uploaded", "public")
                    and s.get("channel_id") == ch_id
                    and s.get("uploaded_at", "").startswith(today_str)
                )

                if uploaded_today >= max_uploads_per_day:
                    # Kuota harian channel ini sudah terpenuhi hari ini
                    continue

                # Ambil video yang terjadwal dan belum diunggah untuk channel ini
                pending_uploads = [
                    v for v in stock_list 
                    if v['status'] == 'scheduled' and not v.get('youtube_id')
                ]

                if not pending_uploads:
                    continue

                target_video = pending_uploads[0]
                video_id = target_video['id']
                
                # Proteksi Ganda: Cek apakah video dengan URL atau Video ID yang sama sudah pernah terunggah
                vid_target = extract_youtube_id(target_video.get('url', ''))
                already_uploaded_dup = next(
                    (s for s in stock_list if s['id'] != video_id and s.get('youtube_id') and 
                     (s.get('url') == target_video.get('url') or (vid_target and vid_target in (s.get('url') or '')))),
                    None
                )
                if already_uploaded_dup:
                    await update_stock_video(video_id, {
                        "status": "duplicate",
                        "error_message": f"Dilewati: sudah terunggah di video #{already_uploaded_dup.get('queue_number')} ({already_uploaded_dup.get('youtube_id')})"
                    })
                    await add_log("WARNING", f"Video #{target_video['queue_number']} batal diunggah: terdeteksi duplikat dari #{already_uploaded_dup.get('queue_number')}.")
                    continue

                await update_stock_video(video_id, {"status": "uploading"})
                await add_log("INFO", f"Mulai mengunggah ke YouTube ({ch_title}): {target_video['title']} (Jadwal: {target_video.get('scheduled_time', 'Tanpa Jadwal')})")
                
                try:
                    res = await asyncio.to_thread(uploader.upload_short, target_video, channel_id=ch_id)
                    now_iso = datetime.now().isoformat()
                    final_status = "public" if res.get("is_public") else "uploaded"
                    await update_stock_video(video_id, {
                        "status": final_status,
                        "youtube_id": res["video_id"],
                        "youtube_url": res["youtube_url"],
                        "uploaded_at": now_iso,
                        "channel_id": ch_id
                    })
                    status_text = "Publik" if final_status == "public" else "Terunggah"
                    sched_msg = f" (Terjadwal tayang: {res['scheduled_time']})" if res.get("publish_at_utc") else ""
                    await add_log("SUCCESS", f"Berhasil diunggah ke channel '{ch_title}' ({status_text})! URL: {res['youtube_url']}{sched_msg}")
                except Exception as e:
                    err_msg = str(e)
                    await update_stock_video(video_id, {
                        "status": "failed",
                        "error_message": err_msg
                    })
                    await add_log("ERROR", f"Gagal mengunggah video #{target_video['queue_number']} ke channel '{ch_title}': {err_msg}")
                
                # Jeda singkat 5 detik sebelum memeriksa channel berikutnya
                await asyncio.sleep(5)
                
        except asyncio.CancelledError:
            break
        except Exception as e:
            await add_log("ERROR", f"Kesalahan pada worker pengunggah YouTube: {str(e)}")
            await asyncio.sleep(10)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    if not os.environ.get("VERCEL"):
        running_tasks["downloader"] = asyncio.create_task(download_worker_loop())
        running_tasks["uploader"] = asyncio.create_task(upload_worker_loop())
    yield
    # Shutdown
    for task in running_tasks.values():
        task.cancel()

app = FastAPI(title="BGRis Media", lifespan=lifespan)

# Izinkan CORS dari perangkat lokal (HP, Laptop, dll)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Folder Statis & Thumbnails
app.mount("/static", StaticFiles(directory=str(config.BASE_DIR / "static")), name="static")
app.mount("/thumbnails", StaticFiles(directory=str(config.THUMBNAILS_DIR)), name="thumbnails")

# --- Model Request Pydantic ---
class QueueInput(BaseModel):
    url: str = None
    urls: list[str] = None
    bulk_text: str = None

class ChannelExtractInput(BaseModel):
    channel_url: str
    limit: int = 5

class StockUpdate(BaseModel):
    title: str = None
    description: str = None
    tags: list[str] = None
    scheduled_time: str = None

class BulkStockUpdate(BaseModel):
    channel_id: str = None
    scope: str = "unuploaded"  # "unuploaded" atau "all"
    title_mode: str = "none"   # "none", "append_suffix", "prepend_prefix", "replace_all", "find_replace"
    title_val: str = ""
    title_find: str = ""
    desc_mode: str = "none"    # "none", "append", "replace_all"
    desc_val: str = ""
    tags_mode: str = "none"    # "none", "append", "replace"
    tags_val: list[str] = []

class BulkStockDelete(BaseModel):
    channel_id: str = None
    scope: str = "unuploaded"  # "unuploaded" atau "all"
    delete_local_files: bool = True
    confirmation_text: str = ""


class SettingsUpdate(BaseModel):
    channel_id: str = None
    max_uploads_per_day: int = None
    upload_slots: list[str] = None
    auto_upload_enabled: bool = None
    title_template: str = None
    description_template: str = None
    default_tags: list[str] = None
    gemini_api_key: str = None

class CredentialsInput(BaseModel):
    client_id: str
    client_secret: str

# --- REST Endpoints: Halaman Utama ---
@app.get("/", response_class=HTMLResponse)
async def serve_index():
    index_path = config.BASE_DIR / "static" / "index.html"
    if index_path.exists():
        return HTMLResponse(content=index_path.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>Dashboard sedang disiapkan...</h1>")

# --- REST Endpoints: Antrean Unduh (Queue) ---
@app.post("/api/queue")
async def add_queue_endpoint(payload: QueueInput):
    """Menerima 1 link, daftar link, atau teks banyak baris sekaligus."""
    urls_to_add = []
    
    if payload.url:
        urls_to_add.append(payload.url.strip())
    if payload.urls:
        urls_to_add.extend([u.strip() for u in payload.urls if u.strip()])
    if payload.bulk_text:
        lines = payload.bulk_text.strip().splitlines()
        for line in lines:
            line_clean = line.strip()
            # Ekstrak URL dari teks jika ada
            found_urls = re.findall(r'https?://[^\s]+', line_clean)
            if found_urls:
                urls_to_add.extend(found_urls)
            elif line_clean:
                urls_to_add.append(line_clean)
                
    # Bersihkan link duplikat kosong
    urls_to_add = [u for u in urls_to_add if u]
    if not urls_to_add:
        raise HTTPException(status_code=400, detail="Tidak ada link YouTube yang valid ditemukan.")
        
    active_channel = await get_active_channel()
    active_channel_id = active_channel.get("channel_id", "") if active_channel else ""
    total_input = len(urls_to_add)
    added_ids = await add_multiple_to_queue(urls_to_add, channel_id=active_channel_id)
    skipped_count = total_input - len(added_ids)

    msg = f"{len(added_ids)} link baru ditambahkan ke antrean unduh."
    if skipped_count > 0:
        msg += f" ({skipped_count} link duplikat otomatis dilewati)."
    await add_log("INFO", msg)
    return {
        "status": "success",
        "count": len(added_ids),
        "skipped_count": skipped_count,
        "ids": added_ids
    }

@app.get("/api/queue")
async def get_queue_endpoint():
    active_channel = await get_active_channel()
    active_channel_id = active_channel.get("channel_id") if active_channel else None
    items = await get_all_queue(channel_id=active_channel_id)
    return {"queue": items}

@app.post("/api/queue/clear-completed")
async def clear_completed_endpoint():
    active_channel = await get_active_channel()
    active_channel_id = active_channel.get("channel_id") if active_channel else None
    await clear_completed_queue(channel_id=active_channel_id)
    return {"status": "success"}

@app.post("/api/queue/retry-failed")
async def retry_failed_endpoint():
    """Mengembalikan video antrean yang berstatus 'failed' kembali menjadi 'pending' untuk dicoba ulang."""
    active_channel = await get_active_channel()
    active_channel_id = active_channel.get("channel_id") if active_channel else None
    retried_count = await retry_failed_queue(channel_id=active_channel_id)
    if retried_count > 0:
        await add_log("INFO", f"{retried_count} video yang sebelumnya gagal kini dimasukkan kembali ke antrean unduh.")
    return {"status": "success", "count": retried_count}

@app.post("/api/queue/toggle-pause")
async def toggle_pause_queue_endpoint():
    """Menjeda (pause) atau melanjutkan (resume) proses antrean unduhan."""
    current = await get_setting("queue_paused", False)
    new_state = not current
    await set_setting("queue_paused", new_state)
    msg = "Antrean unduhan dijeda (Paused)." if new_state else "Antrean unduhan dilanjutkan (Resumed)."
    await add_log("INFO", msg)
    return {"status": "success", "queue_paused": new_state}

@app.post("/api/queue/{queue_id}/cancel")
async def cancel_queue_endpoint(queue_id: int):
    """Membatalkan satu item antrean unduh tertentu."""
    cancel_queue_download(queue_id)
    ok = await cancel_queue_item(queue_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Item antrean tidak ditemukan")
    await add_log("INFO", f"Antrean unduh #{queue_id} berhasil dibatalkan.")
    return {"status": "success"}

@app.post("/api/queue/cancel-all")
async def cancel_all_queue_endpoint():
    """Membatalkan semua antrean unduhan yang belum selesai."""
    active_channel = await get_active_channel()
    active_channel_id = active_channel.get("channel_id") if active_channel else None
    count = await cancel_all_pending_queue(channel_id=active_channel_id)
    await add_log("INFO", f"{count} antrean unduh berhasil dibatalkan.")
    return {"status": "success", "count": count}

@app.post("/api/channel/extract-shorts")
async def extract_channel_shorts_endpoint(payload: ChannelExtractInput):
    """Mengekstrak N Shorts terbaru dari satu channel YouTube dan memasukkannya ke antrean."""
    if not payload.channel_url or not payload.channel_url.strip():
        raise HTTPException(status_code=400, detail="Link channel YouTube tidak boleh kosong.")
        
    limit = max(1, min(100, payload.limit or 5))
    
    # Jalankan ekstraksi di worker thread agar tidak memblokir event loop
    try:
        results = await asyncio.to_thread(
            downloader.extract_shorts_from_channel,
            channel_url=payload.channel_url.strip(),
            limit=limit
        )
    except ValueError as ve:
        # Pesan validasi atau channel tidak ditemukan yang ramah
        clean_msg = re.sub(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])', '', str(ve))
        raise HTTPException(status_code=400, detail=clean_msg)
    except Exception as e:
        raw_err = re.sub(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])', '', str(e))
        if "404" in raw_err or "Not Found" in raw_err:
            clean_err = "Channel YouTube tidak ditemukan. Periksa kembali link atau @handle channel."
        elif "does not have a shorts tab" in raw_err:
            clean_err = "Channel ini tidak memiliki video Shorts publik."
        else:
            clean_err = f"Gagal mengambil Shorts dari channel: {raw_err[:120]}"
        raise HTTPException(status_code=400, detail=clean_err)
        
    if not results:
        raise HTTPException(status_code=404, detail="Tidak ada video Shorts yang ditemukan pada channel ini.")
        
    urls = [r["url"] for r in results if r.get("url")]
    if not urls:
        raise HTTPException(status_code=404, detail="Tidak ada URL Shorts valid yang berhasil diekstrak.")
        
    try:
        active_channel = await get_active_channel()
        active_channel_id = active_channel.get("channel_id", "") if active_channel else ""
        channel_title = results[0].get("channel_title") or payload.channel_url
        
        total_found = len(urls)
        added_ids = await add_multiple_to_queue(urls, channel_id=active_channel_id)
        skipped_count = total_found - len(added_ids)
        msg = f"Berhasil mengekstrak {total_found} Shorts dari channel '{channel_title}': {len(added_ids)} baru dimasukkan ke antrean."
        if skipped_count > 0:
            msg += f" ({skipped_count} video sudah pernah ada di antrean/stok, otomatis dilewati)."
        await add_log("INFO", msg)
        
        return {
            "status": "success",
            "count": len(added_ids),
            "skipped_count": skipped_count,
            "ids": added_ids,
            "channel_title": str(channel_title),
            "items": results
        }
    except Exception as db_err:
        raise HTTPException(status_code=500, detail=f"Gagal menambahkan ke antrean: {str(db_err)}")

# --- REST Endpoints: Inventaris Stok Video ---
@app.get("/api/stock")
async def get_stock_endpoint(status: str = None, channel_id: str = None):
    if not channel_id:
        active_channel = await get_active_channel()
        channel_id = active_channel.get("channel_id") if active_channel else None
    videos = await get_stock_videos(status_filter=status, channel_id=channel_id)
    return {"stock": videos}

@app.get("/api/stock/{video_id}")
async def get_single_stock_endpoint(video_id: int):
    video = await get_stock_video_by_id(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video tidak ditemukan")
    return {"video": video}

@app.put("/api/stock/{video_id}")
async def update_stock_endpoint(video_id: int, updates: StockUpdate):
    video = await get_stock_video_by_id(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video tidak ditemukan")
        
    data = updates.model_dump(exclude_unset=True)
    
    # Jika video sudah terunggah ke YouTube, otomatis sinkronkan perubahannya ke YouTube!
    if video.get("youtube_id"):
        try:
            await asyncio.to_thread(
                uploader.update_video_metadata,
                youtube_id=video["youtube_id"],
                title=data.get("title"),
                description=data.get("description"),
                tags=data.get("tags"),
                scheduled_time=data.get("scheduled_time")
            )
            await add_log("SUCCESS", f"Video #{video['queue_number']} di YouTube berhasil disinkronkan & diperbarui!")
        except Exception as e:
            await add_log("ERROR", f"Gagal memperbarui video #{video['queue_number']} di YouTube: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Gagal sinkron ke YouTube: {str(e)}")
            
    await update_stock_video(video_id, data)
    return {"status": "success"}

@app.delete("/api/stock/{video_id}")
async def delete_stock_endpoint(video_id: int):
    video = await get_stock_video_by_id(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video tidak ditemukan")
        
    # Jika video sudah terunggah ke YouTube, otomatis hapus juga dari YouTube!
    if video.get("youtube_id"):
        try:
            await asyncio.to_thread(uploader.delete_youtube_video, video["youtube_id"], channel_id=video.get("channel_id"))
            await add_log("SUCCESS", f"Video #{video['queue_number']} ({video['youtube_id']}) berhasil dihapus dari server YouTube!")
        except Exception as e:
            await add_log("ERROR", f"Gagal menghapus video #{video['queue_number']} dari YouTube: {str(e)}")
            
    # Hapus file lokal jika ada
    try:
        if video.get("file_path") and os.path.exists(video["file_path"]):
            os.remove(video["file_path"])
    except Exception:
        pass
        
    await delete_stock_video(video_id)
    await add_log("INFO", f"Video #{video.get('queue_number')} dihapus dari stok.")
    return {"status": "success"}

@app.post("/api/stock/{video_id}/upload-now")
async def upload_now_endpoint(video_id: int):
    video = await get_stock_video_by_id(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video tidak ditemukan")
        
    active_channel = await get_active_channel()
    target_channel_id = video.get("channel_id") or (active_channel.get("channel_id") if active_channel else None)
    
    if not target_channel_id or not uploader.is_authenticated(channel_id=target_channel_id):
        raise HTTPException(status_code=400, detail="Channel YouTube belum terhubung atau token kedaluwarsa. Silakan hubungkan channel di Pengaturan.")
    
    await update_stock_video(video_id, {"status": "uploading"})
    try:
        res = await asyncio.to_thread(uploader.upload_short, video, channel_id=target_channel_id)
        now_iso = datetime.now().isoformat()
        final_status = "public" if res.get("is_public") else "uploaded"
        await update_stock_video(video_id, {
            "status": final_status,
            "youtube_id": res["video_id"],
            "youtube_url": res["youtube_url"],
            "uploaded_at": now_iso,
            "channel_id": target_channel_id
        })
        status_label = "Publik" if final_status == "public" else "Terunggah"
        await add_log("SUCCESS", f"Video #{video['queue_number']} berhasil diunggah manual ke YouTube ({status_label}): {res['youtube_url']}")
        return {"status": "success", "result": res}
    except Exception as e:
        await update_stock_video(video_id, {"status": "failed", "error_message": str(e)})
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reschedule-all")
async def reschedule_all_endpoint():
    """Menghitung ulang jadwal seluruh stok video yang belum terunggah agar padat dan rapi."""
    active_channel = await get_active_channel()
    channel_id = active_channel.get("channel_id") if active_channel else None
    await UploadScheduler.reschedule_all_unuploaded(channel_id=channel_id)
    await add_log("INFO", "Seluruh jadwal stok video telah dihitung ulang secara otomatis.")
    return {"status": "success"}

@app.post("/api/stock/sync-views")
async def sync_views_endpoint(channel_id: str = None):
    """Menyinkronkan jumlah view, tanggal rilis resmi, dan mendeteksi video yang dihapus di YouTube."""
    if not channel_id:
        active_channel = await get_active_channel()
        channel_id = active_channel.get("channel_id") if active_channel else None

    stock_list = await get_stock_videos(channel_id=channel_id)
    uploaded_videos = [v for v in stock_list if v.get("youtube_id")]
    if not uploaded_videos:
        return {"status": "success", "count": 0, "deleted_count": 0, "message": "Belum ada video terunggah yang dapat disinkronkan."}

    yt_ids = [v["youtube_id"] for v in uploaded_videos]
    stats_list = await asyncio.to_thread(uploader.get_batch_videos_stats, yt_ids, channel_id=channel_id)

    found_ids = {s.get("youtube_id") for s in stats_list if s.get("youtube_id")}

    synced_count = 0
    for s in stats_list:
        v_id = s.get("youtube_id")
        v_count = s.get("view_count", 0)
        pub_at = s.get("published_at", "")
        if v_id:
            await update_stock_video_stats(v_id, v_count, pub_at)
            synced_count += 1

    # Deteksi video yang sudah dihapus di YouTube oleh pengguna
    deleted_from_yt_count = 0
    for v in uploaded_videos:
        v_yt_id = v.get("youtube_id")
        if v_yt_id and v_yt_id not in found_ids:
            await update_stock_video(v["id"], {
                "status": "deleted_on_youtube",
                "error_message": "Telah dihapus di server YouTube oleh pengguna"
            })
            deleted_from_yt_count += 1
            await add_log("WARNING", f"Video #{v.get('queue_number')} ('{v.get('title', '')[:35]}') terdeteksi telah dihapus di YouTube. Status di web diperbarui.")

    log_msg = f"Berhasil menyinkronkan statistik YouTube untuk {synced_count} video."
    if deleted_from_yt_count > 0:
        log_msg += f" Ditemukan {deleted_from_yt_count} video yang telah dihapus di YouTube (status web disinkronkan)."
    await add_log("INFO", log_msg)

    return {
        "status": "success",
        "count": synced_count,
        "deleted_count": deleted_from_yt_count
    }

@app.post("/api/stock/deduplicate")
async def deduplicate_stock_endpoint(channel_id: str = None):
    """Mendeteksi dan membersihkan video duplikat dalam stok channel tertentu."""
    if not channel_id:
        active_channel = await get_active_channel()
        channel_id = active_channel.get("channel_id") if active_channel else None

    removed_count = await deduplicate_stock(channel_id=channel_id)
    if removed_count > 0:
        await UploadScheduler.reschedule_all_unuploaded(channel_id=channel_id)
        await add_log("SUCCESS", f"Pembersihan duplikat selesai: {removed_count} video duplikat berhasil dihapus.")
    return {"status": "success", "removed_count": removed_count}

@app.post("/api/stock/bulk-update")
async def bulk_update_stock_endpoint(payload: BulkStockUpdate):
    """Memperbarui judul, deskripsi, atau tag secara massal untuk stok video."""
    target_channel_id = payload.channel_id
    if not target_channel_id:
        active_channel = await get_active_channel()
        target_channel_id = active_channel.get("channel_id") if active_channel else None

    count = await bulk_update_stock_videos(
        channel_id=target_channel_id,
        scope=payload.scope,
        update_payload={
            "title_mode": payload.title_mode,
            "title_val": payload.title_val,
            "title_find": payload.title_find,
            "desc_mode": payload.desc_mode,
            "desc_val": payload.desc_val,
            "tags_mode": payload.tags_mode,
            "tags_val": payload.tags_val
        }
    )
    await add_log("SUCCESS", f"Edit massal berhasil diterapkan pada {count} video stok.")
    return {"status": "success", "count": count}

@app.post("/api/stock/bulk-delete")
async def bulk_delete_stock_endpoint(payload: BulkStockDelete):
    """Menghapus seluruh stok video dengan proteksi keamanan teks 'HAPUS SEMUA'."""
    confirm = (payload.confirmation_text or "").strip()
    if confirm != "HAPUS SEMUA":
        raise HTTPException(status_code=400, detail="Konfirmasi tidak valid! Anda harus mengetik persis 'HAPUS SEMUA' untuk melanjutkan.")

    target_channel_id = payload.channel_id
    if not target_channel_id:
        active_channel = await get_active_channel()
        target_channel_id = active_channel.get("channel_id") if active_channel else None

    count = await bulk_delete_stock_videos(
        channel_id=target_channel_id,
        scope=payload.scope,
        delete_files=payload.delete_local_files
    )
    await add_log("WARNING", f"{count} video stok berhasil dihapus secara massal.")
    return {"status": "success", "count": count}


# --- REST Endpoints: YouTube OAuth & Multi-Channel ---
@app.get("/api/youtube/status")
async def youtube_status_endpoint():
    configured = uploader.is_configured()
    authenticated = uploader.is_authenticated()
    channels = await get_all_channels()
    active_channel = await get_active_channel()
    active_channel_id = active_channel.get("channel_id") if active_channel else None
    
    return {
        "configured": configured,
        "authenticated": authenticated,
        "active_channel": active_channel,
        "active_channel_id": active_channel_id,
        "channels": channels
    }

@app.get("/api/youtube/channels")
async def youtube_channels_endpoint():
    """Mengambil seluruh channel YouTube yang terdaftar."""
    channels = await get_all_channels()
    active_channel = await get_active_channel()
    return {
        "channels": channels,
        "active_channel": active_channel
    }

@app.post("/api/youtube/switch-channel/{channel_id}")
async def switch_channel_endpoint(channel_id: str):
    """Mengubah channel YouTube yang aktif digunakan untuk upload."""
    await set_active_channel(channel_id)
    active = await get_active_channel()
    channel_name = active.get("title") if active else channel_id
    await add_log("INFO", f"Target upload YouTube beralih ke channel: '{channel_name}'")
    return {"status": "success", "active_channel": active}

@app.delete("/api/youtube/channels/{channel_id}")
async def delete_channel_endpoint(channel_id: str):
    """Menghapus koneksi akun channel YouTube tertentu."""
    await delete_channel(channel_id)
    await add_log("INFO", f"Channel {channel_id} telah dihapus dari sistem.")
    return {"status": "success"}

@app.get("/api/youtube/auth-url")
async def youtube_auth_url_endpoint():
    try:
        url = uploader.get_auth_url()
        return {"auth_url": url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/youtube/oauth-callback")
async def youtube_oauth_callback(code: str = None, error: str = None):
    if error:
        return HTMLResponse(f"<h3>Otorisasi Gagal: {error}</h3><p><a href='/'>Kembali ke Dashboard</a></p>")
    if not code:
        return HTMLResponse("<h3>Kode Otorisasi tidak ditemukan.</h3>")
        
    try:
        channel_info = await asyncio.to_thread(uploader.handle_auth_code, code)
        title = channel_info.get("title", "YouTube Channel")
        await add_log("SUCCESS", f"Channel '{title}' berhasil dihubungkan ke sistem!")
        return RedirectResponse(url="/?channel_connected=1")
    except Exception as e:
        return HTMLResponse(f"<h3>Gagal Menyimpan Channel: {str(e)}</h3><p><a href='/'>Kembali ke Dashboard</a></p>")

@app.post("/api/youtube/save-client-credentials")
async def save_client_credentials_endpoint(payload: CredentialsInput):
    """Menyimpan Client ID & Client Secret langsung dari form dashboard tanpa perlu cari file json."""
    c_id = payload.client_id.strip()
    c_secret = payload.client_secret.strip()
    if not c_id or not c_secret:
        raise HTTPException(status_code=400, detail="Client ID dan Client Secret tidak boleh kosong.")
        
    data = {
        "web": {
            "client_id": c_id,
            "client_secret": c_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "redirect_uris": ["http://localhost:8000/api/youtube/oauth-callback"]
        }
    }
    with open(config.CLIENT_SECRETS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        
    await add_log("SUCCESS", "Kredensial Client ID & Client Secret Google berhasil disimpan!")
    return {"status": "success"}

@app.post("/api/youtube/upload-client-secrets")
async def upload_client_secrets_endpoint(file: UploadFile = File(...)):
    """Mengunggah file client_secrets.json dari Google Cloud Console langsung lewat web dashboard."""
    try:
        content = await file.read()
        with open(config.CLIENT_SECRETS_FILE, "wb") as f:
            f.write(content)
        await add_log("SUCCESS", "File client_secrets.json berhasil diunggah!")
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/youtube/disconnect")
async def youtube_disconnect_endpoint():
    active = await get_active_channel()
    if active:
        await delete_channel(active["channel_id"])
    await add_log("INFO", "Channel aktif telah diputuskan.")
    return {"status": "success"}

# --- REST Endpoints: Pengaturan & Statistik ---
@app.get("/api/settings")
async def get_settings_endpoint(channel_id: str = None):
    """Mengambil pengaturan sistem atau pengaturan spesifik channel jika ditentukan."""
    if not channel_id:
        active = await get_active_channel()
        channel_id = active.get("channel_id") if active else None
    settings = await get_all_settings(channel_id=channel_id)
    return {"settings": settings, "channel_id": channel_id}

@app.put("/api/settings")
async def update_settings_endpoint(updates: SettingsUpdate):
    """Menyimpan pengaturan sistem khusus untuk channel aktif saat ini."""
    active = await get_active_channel()
    active_id = active.get("channel_id") if active else None
    target_channel_id = updates.channel_id or active_id

    # Validasi ketat: Hanya channel aktif yang diizinkan untuk diubah dan disimpan
    if target_channel_id and active_id and target_channel_id != active_id:
        active_title = active.get("title", active_id)
        raise HTTPException(
            status_code=403,
            detail=f"Dilarang mengubah! Hanya channel aktif saat ini ('{active_title}') yang dapat diubah dan disimpan. Silakan aktifkan channel ini terlebih dahulu."
        )

    data = updates.model_dump(exclude_unset=True)
    data.pop("channel_id", None)
    
    for key, val in data.items():
        await set_setting(key, val, channel_id=target_channel_id)
        
    ch_info = f" untuk channel '{target_channel_id}'" if target_channel_id else " global"
    await add_log("INFO", f"Pengaturan otomatisasi{ch_info} berhasil diperbarui.")
    return {"status": "success", "channel_id": target_channel_id}

@app.get("/api/system/stats")
async def system_stats_endpoint():
    active_channel = await get_active_channel()
    channel_id = active_channel.get("channel_id") if active_channel else None
    
    queue_items = await get_all_queue(channel_id=channel_id)
    stock_items = await get_stock_videos(channel_id=channel_id)
    
    pending_queue = sum(1 for q in queue_items if q["status"] in ("pending", "downloading"))
    in_stock_ready = sum(1 for s in stock_items if s["status"] in ("in_stock", "scheduled"))
    uploaded_total = sum(1 for s in stock_items if s["status"] in ("uploaded", "public"))
    
    today_str = datetime.now().strftime("%Y-%m-%d")
    # Hitung video yang terunggah dan jadwal tayang resminya jatuh pada hari ini (Tayang Hari Ini)
    today_scheduled_uploaded = sum(
        1 for s in stock_items 
        if s["status"] in ("uploaded", "public") and s.get("scheduled_time", "").startswith(today_str)
    )
    # Hitung seluruh video yang dikirim ke YouTube pada hari ini (Unggah Hari Ini)
    transferred_today = sum(
        1 for s in stock_items 
        if s["status"] in ("uploaded", "public") and s.get("uploaded_at", "").startswith(today_str)
    )
    max_uploads = await get_setting("max_uploads_per_day", 3, channel_id=channel_id)
    queue_paused = await get_setting("queue_paused", False)
    
    return {
        "pending_queue": pending_queue,
        "in_stock_ready": in_stock_ready,
        "uploaded_today": today_scheduled_uploaded,
        "transferred_today": transferred_today,
        "max_uploads_per_day": max_uploads,
        "uploaded_total": uploaded_total,
        "active_channel_id": channel_id,
        "queue_paused": queue_paused
    }

@app.get("/api/logs")
async def get_logs_endpoint(limit: int = 50):
    logs = await get_recent_logs(limit)
    return {"logs": logs}

@app.get("/api/system/network-info")
async def network_info_endpoint():
    """Mengembalikan informasi IP lokal server untuk kemudahan akses dari HP."""
    import socket
    local_ip = "127.0.0.1"
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
    except Exception:
        pass
    return {
        "local_ip": local_ip,
        "port": 8000,
        "mobile_url": f"http://{local_ip}:8000"
    }

