import aiosqlite
import json
import re
from datetime import datetime
from config import DB_PATH, DEFAULT_SETTINGS

async def init_db():
    """Inisialisasi tabel database SQLite jika belum ada."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("PRAGMA journal_mode=WAL;")
        
        # Tabel Antrean Unduh
        await db.execute("""
            CREATE TABLE IF NOT EXISTS queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                queue_number INTEGER,
                url TEXT NOT NULL,
                status TEXT DEFAULT 'pending', -- pending, downloading, completed, failed, cancelled
                progress REAL DEFAULT 0,
                speed TEXT DEFAULT '',
                eta TEXT DEFAULT '',
                error_message TEXT DEFAULT '',
                channel_id TEXT DEFAULT '',
                created_at TEXT,
                updated_at TEXT
            );
        """)
        
        # Tabel Stok Video Lokal
        await db.execute("""
            CREATE TABLE IF NOT EXISTS stock_videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                queue_number INTEGER,
                url TEXT NOT NULL,
                original_title TEXT,
                title TEXT,
                description TEXT,
                tags TEXT, -- JSON array of strings
                duration INTEGER DEFAULT 0,
                file_path TEXT,
                file_size INTEGER DEFAULT 0,
                thumbnail_path TEXT,
                status TEXT DEFAULT 'in_stock', -- in_stock, scheduled, uploading, uploaded, failed
                scheduled_time TEXT, -- Format ISO YYYY-MM-DDTHH:MM:SS
                youtube_id TEXT DEFAULT '',
                youtube_url TEXT DEFAULT '',
                uploaded_at TEXT DEFAULT '',
                channel_id TEXT DEFAULT '',
                error_message TEXT DEFAULT '',
                created_at TEXT
            );
        """)

        # Migrasi kolom channel_id jika belum ada
        try:
            await db.execute("ALTER TABLE queue ADD COLUMN channel_id TEXT DEFAULT '';")
        except Exception:
            pass
        try:
            await db.execute("ALTER TABLE stock_videos ADD COLUMN channel_id TEXT DEFAULT '';")
        except Exception:
            pass
        # Migrasi kolom view_count dan youtube_published_at
        try:
            await db.execute("ALTER TABLE stock_videos ADD COLUMN view_count INTEGER DEFAULT 0;")
        except Exception:
            pass
        try:
            await db.execute("ALTER TABLE stock_videos ADD COLUMN youtube_published_at TEXT DEFAULT '';")
        except Exception:
            pass
        # Tetapkan channel_id untuk video yang sudah diunggah ke channel ICH1 Manhwa
        try:
            await db.execute("UPDATE stock_videos SET channel_id = 'UCGJv9X8UCNWxSlJTcZz-XLQ' WHERE (channel_id = '' OR channel_id IS NULL) AND youtube_id != '';")
        except Exception:
            pass

        # Migrasi: Hapus constraint UNIQUE lama pada queue.queue_number agar multi-channel tidak bentrok
        try:
            async with db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='queue'") as cur:
                row = await cur.fetchone()
                if row and "queue_number INTEGER UNIQUE" in row[0]:
                    await db.execute("""
                        CREATE TABLE queue_migration (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            queue_number INTEGER,
                            url TEXT NOT NULL,
                            status TEXT DEFAULT 'pending',
                            progress REAL DEFAULT 0,
                            speed TEXT DEFAULT '',
                            eta TEXT DEFAULT '',
                            error_message TEXT DEFAULT '',
                            channel_id TEXT DEFAULT '',
                            created_at TEXT,
                            updated_at TEXT
                        );
                    """)
                    await db.execute("""
                        INSERT INTO queue_migration (id, queue_number, url, status, progress, speed, eta, error_message, channel_id, created_at, updated_at)
                        SELECT id, queue_number, url, status, progress, speed, eta, error_message, channel_id, created_at, updated_at FROM queue;
                    """)
                    await db.execute("DROP TABLE queue;")
                    await db.execute("ALTER TABLE queue_migration RENAME TO queue;")
                    await db.commit()
        except Exception:
            pass

        # Pemulihan otomatis: jika sistem crash saat sedang download, kembalikan status ke 'pending' saat startup
        try:
            await db.execute("UPDATE queue SET status = 'pending' WHERE status = 'downloading';")
            await db.commit()
        except Exception:
            pass
        
        # Tabel Pengaturan Sistem
        await db.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
        """)
        
        # Tabel Log Aktivitas
        await db.execute("""
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                level TEXT,
                message TEXT
            );
        """)

        # Tabel Multi-Channel YouTube
        await db.execute("""
            CREATE TABLE IF NOT EXISTS youtube_channels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                channel_id TEXT UNIQUE,
                title TEXT,
                custom_url TEXT,
                thumbnail TEXT,
                subscriber_count TEXT DEFAULT '0',
                token_json TEXT NOT NULL,
                is_active INTEGER DEFAULT 0,
                created_at TEXT
            );
        """)

        # Tabel Pengaturan Khusus Per-Channel YouTube
        await db.execute("""
            CREATE TABLE IF NOT EXISTS channel_settings (
                channel_id TEXT NOT NULL,
                key TEXT NOT NULL,
                value TEXT NOT NULL,
                PRIMARY KEY (channel_id, key)
            );
        """)
        
        # Masukkan pengaturan default jika belum ada
        for key, val in DEFAULT_SETTINGS.items():
            await db.execute(
                "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
                (key, json.dumps(val))
            )
            
        await db.commit()

# --- Helper Pengaturan (Mendukung Pengaturan Spesifik Per-Channel) ---
async def get_setting(key: str, default=None, channel_id: str = None):
    """Mengambil nilai pengaturan. Memprioritaskan pengaturan channel jika channel_id diberikan."""
    async with aiosqlite.connect(DB_PATH) as db:
        if channel_id:
            async with db.execute("SELECT value FROM channel_settings WHERE channel_id = ? AND key = ?", (channel_id, key)) as cursor:
                row = await cursor.fetchone()
                if row:
                    try:
                        return json.loads(row[0])
                    except Exception:
                        return row[0]

        async with db.execute("SELECT value FROM settings WHERE key = ?", (key,)) as cursor:
            row = await cursor.fetchone()
            if row:
                try:
                    return json.loads(row[0])
                except Exception:
                    return row[0]
            return default

async def set_setting(key: str, value, channel_id: str = None):
    """Menyimpan nilai pengaturan. Jika channel_id diberikan, disimpan khusus untuk channel tersebut."""
    val_json = json.dumps(value)
    async with aiosqlite.connect(DB_PATH) as db:
        if channel_id:
            await db.execute(
                "INSERT OR REPLACE INTO channel_settings (channel_id, key, value) VALUES (?, ?, ?)",
                (channel_id, key, val_json)
            )
        else:
            await db.execute(
                "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
                (key, val_json)
            )
        await db.commit()

async def get_all_settings(channel_id: str = None):
    """Mengambil semua pengaturan. Jika channel_id diberikan, menimpa nilai global dengan nilai spesifik channel."""
    settings = {}
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT key, value FROM settings") as cursor:
            rows = await cursor.fetchall()
            for key, val in rows:
                try:
                    settings[key] = json.loads(val)
                except Exception:
                    settings[key] = val

        if channel_id:
            async with db.execute("SELECT key, value FROM channel_settings WHERE channel_id = ?", (channel_id,)) as cursor:
                rows = await cursor.fetchall()
                for key, val in rows:
                    try:
                        settings[key] = json.loads(val)
                    except Exception:
                        settings[key] = val
    return settings

# --- Helper Antrean Unduh (Queue) ---
def extract_youtube_id(url_or_id: str) -> str:
    """Mengekstrak ID 11 karakter YouTube dari berbagai format link Shorts/Watch/Share."""
    if not url_or_id:
        return ""
    text = str(url_or_id).strip()
    if len(text) == 11 and re.match(r'^[a-zA-Z0-9_-]{11}$', text):
        return text
    m = re.search(r'(?:shorts/|v=|youtu\.be/|embed/|live/)([a-zA-Z0-9_-]{11})', text)
    return m.group(1) if m else ""

async def get_next_queue_number(channel_id: str = None) -> int:
    """Mendapatkan nomor antrean urut berikutnya (#001, #002, dst) per channel."""
    async with aiosqlite.connect(DB_PATH) as db:
        if channel_id:
            async with db.execute("SELECT MAX(queue_number) FROM queue WHERE channel_id = ?", (channel_id,)) as cursor:
                row = await cursor.fetchone()
                max_queue = row[0] if row and row[0] else 0
            async with db.execute("SELECT MAX(queue_number) FROM stock_videos WHERE channel_id = ?", (channel_id,)) as cursor:
                row = await cursor.fetchone()
                max_stock = row[0] if row and row[0] else 0
        else:
            async with db.execute("SELECT MAX(queue_number) FROM queue") as cursor:
                row = await cursor.fetchone()
                max_queue = row[0] if row and row[0] else 0
            async with db.execute("SELECT MAX(queue_number) FROM stock_videos") as cursor:
                row = await cursor.fetchone()
                max_stock = row[0] if row and row[0] else 0
            
        return max(max_queue, max_stock) + 1

async def add_to_queue(url: str, channel_id: str = "") -> int:
    """Menambahkan satu URL ke antrean unduh dengan proteksi anti-duplikasi."""
    res = await add_multiple_to_queue([url], channel_id=channel_id)
    return res[0] if res else -1

async def add_multiple_to_queue(urls: list[str], channel_id: str = "") -> list[int]:
    """Menambahkan banyak URL ke antrean unduh sekaligus, dengan pencegahan duplikasi ketat."""
    added_ids = []
    now = datetime.now().isoformat()
    
    async with aiosqlite.connect(DB_PATH) as db:
        # Ambil seluruh URL dan Video ID yang sudah ada di antrean maupun stok untuk channel ini
        existing_urls = set()
        existing_vids = set()

        q_cond = "status IN ('pending', 'downloading', 'completed')"
        q_params = []
        if channel_id:
            q_cond += " AND (channel_id = ? OR channel_id = '' OR channel_id IS NULL)"
            q_params.append(channel_id)

        async with db.execute(f"SELECT url FROM queue WHERE {q_cond}", q_params) as cur:
            for (u,) in await cur.fetchall():
                if u:
                    existing_urls.add(u.strip())
                    v = extract_youtube_id(u)
                    if v: existing_vids.add(v)

        s_cond = "status != 'deleted'"
        s_params = []
        if channel_id:
            s_cond += " AND (channel_id = ? OR channel_id = '' OR channel_id IS NULL)"
            s_params.append(channel_id)

        async with db.execute(f"SELECT url, youtube_id FROM stock_videos WHERE {s_cond}", s_params) as cur:
            for u, yid in await cur.fetchall():
                if u:
                    existing_urls.add(u.strip())
                    v = extract_youtube_id(u)
                    if v: existing_vids.add(v)
                if yid:
                    existing_vids.add(yid.strip())

        if channel_id:
            async with db.execute("SELECT MAX(queue_number) FROM queue WHERE channel_id = ?", (channel_id,)) as cursor:
                row = await cursor.fetchone()
                max_queue = row[0] if row and row[0] else 0
            async with db.execute("SELECT MAX(queue_number) FROM stock_videos WHERE channel_id = ?", (channel_id,)) as cursor:
                row = await cursor.fetchone()
                max_stock = row[0] if row and row[0] else 0
        else:
            async with db.execute("SELECT MAX(queue_number) FROM queue") as cursor:
                row = await cursor.fetchone()
                max_queue = row[0] if row and row[0] else 0
            async with db.execute("SELECT MAX(queue_number) FROM stock_videos") as cursor:
                row = await cursor.fetchone()
                max_stock = row[0] if row and row[0] else 0

        curr_queue = max(max_queue, max_stock)
        seen_in_batch = set()

        for url in urls:
            cleaned = url.strip()
            if not cleaned:
                continue
            vid = extract_youtube_id(cleaned)

            # Cek apakah duplikat dalam batch masukan saat ini
            if cleaned in seen_in_batch or (vid and vid in seen_in_batch):
                continue

            # Cek apakah sudah pernah ada di antrean atau stok channel ini
            if cleaned in existing_urls or (vid and vid in existing_vids):
                continue

            seen_in_batch.add(cleaned)
            if vid:
                seen_in_batch.add(vid)
                existing_vids.add(vid)
            existing_urls.add(cleaned)

            curr_queue += 1
            cursor = await db.execute(
                """
                INSERT INTO queue (queue_number, url, status, channel_id, created_at, updated_at)
                VALUES (?, ?, 'pending', ?, ?, ?)
                """,
                (curr_queue, cleaned, channel_id, now, now)
            )
            added_ids.append(cursor.lastrowid)
        await db.commit()
    return added_ids

async def get_next_pending_queue_item():
    """Mengambil item antrean berikutnya yang berstatus 'pending' (FIFO)."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM queue WHERE status = 'pending' ORDER BY queue_number ASC LIMIT 1"
        ) as cursor:
            return await cursor.fetchone()

async def update_queue_status(queue_id: int, status: str, progress: float = 0, speed: str = "", eta: str = "", error_message: str = ""):
    now = datetime.now().isoformat()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            UPDATE queue 
            SET status = ?, progress = ?, speed = ?, eta = ?, error_message = ?, updated_at = ?
            WHERE id = ?
            """,
            (status, progress, speed, eta, error_message, now, queue_id)
        )
        await db.commit()

async def get_all_queue(channel_id: str = None):
    """Mengambil data antrean unduh, difilter per channel jika ditentukan."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        if channel_id:
            query = "SELECT * FROM queue WHERE channel_id = ? OR channel_id = '' OR channel_id IS NULL ORDER BY queue_number ASC"
            params = (channel_id,)
            async with db.execute(query, params) as cursor:
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]
        else:
            async with db.execute("SELECT * FROM queue ORDER BY queue_number ASC") as cursor:
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]

async def clear_completed_queue(channel_id: str = None):
    """Menghapus riwayat antrean yang sudah selesai atau dibatalkan."""
    async with aiosqlite.connect(DB_PATH) as db:
        if channel_id:
            await db.execute("DELETE FROM queue WHERE status IN ('completed', 'cancelled') AND (channel_id = ? OR channel_id = '' OR channel_id IS NULL)", (channel_id,))
        else:
            await db.execute("DELETE FROM queue WHERE status IN ('completed', 'cancelled')")
        await db.commit()

async def retry_failed_queue(channel_id: str = None) -> int:
    """Mengembalikan status video yang 'failed' kembali ke 'pending' agar diunduh ulang."""
    async with aiosqlite.connect(DB_PATH) as db:
        if channel_id:
            cursor = await db.execute(
                "UPDATE queue SET status = 'pending', error_message = '', progress = 0 WHERE status = 'failed' AND (channel_id = ? OR channel_id = '' OR channel_id IS NULL)",
                (channel_id,)
            )
        else:
            cursor = await db.execute(
                "UPDATE queue SET status = 'pending', error_message = '', progress = 0 WHERE status = 'failed'"
            )
        await db.commit()
        return cursor.rowcount

async def cancel_queue_item(queue_id: int) -> bool:
    """Membatalkan satu item antrean unduh."""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "UPDATE queue SET status = 'cancelled', error_message = 'Dibatalkan oleh pengguna.' WHERE id = ?",
            (queue_id,)
        )
        await db.commit()
        return cursor.rowcount > 0

async def cancel_all_pending_queue(channel_id: str = None) -> int:
    """Membatalkan seluruh antrean yang masih berstatus pending atau downloading."""
    async with aiosqlite.connect(DB_PATH) as db:
        if channel_id:
            cursor = await db.execute(
                "UPDATE queue SET status = 'cancelled', error_message = 'Dibatalkan oleh pengguna.' WHERE status IN ('pending', 'downloading') AND (channel_id = ? OR channel_id = '' OR channel_id IS NULL)",
                (channel_id,)
            )
        else:
            cursor = await db.execute(
                "UPDATE queue SET status = 'cancelled', error_message = 'Dibatalkan oleh pengguna.' WHERE status IN ('pending', 'downloading')"
            )
        await db.commit()
        return cursor.rowcount

# --- Helper Stok Video (Stock Inventory) ---
async def add_stock_video(data: dict) -> int:
    """Menambahkan video hasil unduhan ke stok (dilengkapi pencegahan duplikasi ketat)."""
    now = datetime.now().isoformat()
    url = (data.get("url") or "").strip()
    channel_id = data.get("channel_id") or ""
    vid = extract_youtube_id(url)

    async with aiosqlite.connect(DB_PATH) as db:
        # Cek apakah video ini sudah pernah masuk stok untuk channel ini
        if url:
            conds = ["url = ?"]
            params = [url]
            if vid:
                conds.append("url LIKE ?")
                params.append(f"%{vid}%")

            where_sql = " OR ".join(conds)
            if channel_id:
                query = f"SELECT id FROM stock_videos WHERE ({where_sql}) AND channel_id = ? LIMIT 1"
                params.append(channel_id)
            else:
                query = f"SELECT id FROM stock_videos WHERE ({where_sql}) LIMIT 1"

            async with db.execute(query, params) as cur:
                existing = await cur.fetchone()
                if existing:
                    return existing[0]

        cursor = await db.execute(
            """
            INSERT INTO stock_videos (
                queue_number, url, original_title, title, description, tags,
                duration, file_path, file_size, thumbnail_path, status,
                scheduled_time, channel_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data.get("queue_number"),
                data.get("url"),
                data.get("original_title"),
                data.get("title"),
                data.get("description", ""),
                json.dumps(data.get("tags", [])),
                data.get("duration", 0),
                data.get("file_path"),
                data.get("file_size", 0),
                data.get("thumbnail_path", ""),
                data.get("status", "in_stock"),
                data.get("scheduled_time"),
                data.get("channel_id", ""),
                now
            )
        )
        await db.commit()
        return cursor.lastrowid

async def get_stock_videos(status_filter: str = None, channel_id: str = None):
    """Mengambil daftar stok video dengan filter status dan isolasi channel."""
    async with aiosqlite.connect(DB_PATH) as db:
        # Otomatis mutakhirkan video yang jadwal rilisnya sudah tercapai menjadi 'public'
        now_iso = datetime.now().isoformat()
        await db.execute(
            """
            UPDATE stock_videos 
            SET status = 'public' 
            WHERE status = 'uploaded' 
              AND (
                (scheduled_time IS NOT NULL AND scheduled_time != '' AND scheduled_time <= ?)
                OR scheduled_time IS NULL 
                OR scheduled_time = ''
              )
            """,
            (now_iso,)
        )
        await db.commit()

        db.row_factory = aiosqlite.Row
        query = "SELECT * FROM stock_videos WHERE 1=1"
        params = []
        if status_filter:
            if status_filter == 'uploaded':
                query += " AND status = 'uploaded'"
            elif status_filter == 'public':
                query += " AND status = 'public'"
            else:
                query += " AND status = ?"
                params.append(status_filter)
        if channel_id:
            # Video terunggah / publik strictly channel_id; video stock/scheduled jika channel_id cocok atau legacy belum diset
            query += " AND (channel_id = ? OR (channel_id = '' AND status NOT IN ('uploaded', 'public')))"
            params.append(channel_id)
            
        query += " ORDER BY queue_number ASC"
        
        async with db.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            result = []
            for row in rows:
                item = dict(row)
                try:
                    item["tags"] = json.loads(item["tags"]) if item.get("tags") else []
                except Exception:
                    item["tags"] = []
                result.append(item)
            return result

async def get_stock_video_by_id(video_id: int):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM stock_videos WHERE id = ?", (video_id,)) as cursor:
            row = await cursor.fetchone()
            if row:
                item = dict(row)
                try:
                    item["tags"] = json.loads(item["tags"]) if item.get("tags") else []
                except Exception:
                    item["tags"] = []
                return item
            return None

async def update_stock_video(video_id: int, updates: dict):
    """Memperbarui metadata video stok (judul, tag, waktu jadwal, status, dll)."""
    if not updates:
        return
    fields = []
    values = []
    for key, val in updates.items():
        if key == "tags" and isinstance(val, list):
            fields.append(f"{key} = ?")
            values.append(json.dumps(val))
        else:
            fields.append(f"{key} = ?")
            values.append(val)
    values.append(video_id)
    
    query = f"UPDATE stock_videos SET {', '.join(fields)} WHERE id = ?"
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(query, values)
        await db.commit()

async def delete_stock_video(video_id: int):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM stock_videos WHERE id = ?", (video_id,))
        await db.commit()

async def update_stock_video_stats(youtube_id: str, view_count: int, youtube_published_at: str = ""):
    """Memperbarui data statistik view dan tanggal publikasi YouTube."""
    async with aiosqlite.connect(DB_PATH) as db:
        if youtube_published_at:
            await db.execute(
                "UPDATE stock_videos SET view_count = ?, youtube_published_at = ? WHERE youtube_id = ?",
                (view_count, youtube_published_at, youtube_id)
            )
        else:
            await db.execute(
                "UPDATE stock_videos SET view_count = ? WHERE youtube_id = ?",
                (view_count, youtube_id)
            )
        await db.commit()

async def bulk_update_stock_videos(channel_id: str, scope: str, update_payload: dict) -> int:
    """
    Memperbarui judul, deskripsi, dan tag secara massal pada stok video.
    scope: 'unuploaded' (hanya in_stock & scheduled) atau 'all' (seluruh video di channel)
    """
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        query = "SELECT * FROM stock_videos WHERE 1=1"
        params = []
        if channel_id:
            query += " AND (channel_id = ? OR channel_id = '' OR channel_id IS NULL)"
            params.append(channel_id)
        if scope == "unuploaded":
            query += " AND status IN ('in_stock', 'scheduled')"
        
        async with db.execute(query, params) as cursor:
            rows = await cursor.fetchall()

        updated_count = 0
        title_mode = update_payload.get("title_mode", "none") # none, append_suffix, prepend_prefix, replace_all, find_replace
        title_val = (update_payload.get("title_val") or "").strip()
        title_find = update_payload.get("title_find", "")
        
        desc_mode = update_payload.get("desc_mode", "none") # none, append, replace_all
        desc_val = (update_payload.get("desc_val") or "").strip()

        tags_mode = update_payload.get("tags_mode", "none") # none, append, replace
        tags_val = update_payload.get("tags_val", [])

        for row in rows:
            video_id = row["id"]
            cur_title = row["title"] or ""
            cur_desc = row["description"] or ""
            try:
                cur_tags = json.loads(row["tags"]) if row["tags"] else []
            except Exception:
                cur_tags = []

            new_title = cur_title
            new_desc = cur_desc
            new_tags = list(cur_tags)

            # Update Judul
            if title_mode == "append_suffix" and title_val:
                new_title = f"{cur_title} {title_val}".strip()
            elif title_mode == "prepend_prefix" and title_val:
                new_title = f"{title_val} {cur_title}".strip()
            elif title_mode == "replace_all" and title_val:
                new_title = title_val
            elif title_mode == "find_replace" and title_find:
                new_title = cur_title.replace(title_find, title_val)

            # Update Deskripsi
            if desc_mode == "append" and desc_val:
                new_desc = f"{cur_desc}\n\n{desc_val}".strip()
            elif desc_mode == "replace_all" and desc_val:
                new_desc = desc_val

            # Update Tag
            if tags_mode == "append" and tags_val:
                existing_set = set(t.lower() for t in new_tags)
                for t in tags_val:
                    t_clean = t.strip().lstrip("#")
                    if t_clean and t_clean.lower() not in existing_set:
                        new_tags.append(t_clean)
                        existing_set.add(t_clean.lower())
            elif tags_mode == "replace" and tags_val is not None:
                new_tags = [t.strip().lstrip("#") for t in tags_val if t.strip()]

            # Simpan perubahan
            await db.execute(
                "UPDATE stock_videos SET title = ?, description = ?, tags = ? WHERE id = ?",
                (new_title[:100], new_desc, json.dumps(new_tags), video_id)
            )
            updated_count += 1

        await db.commit()
        return updated_count

async def bulk_delete_stock_videos(channel_id: str, scope: str, delete_files: bool = True) -> int:
    """
    Menghapus seluruh stok video sesuai cakupan (scope).
    scope: 'unuploaded' atau 'all'
    """
    import os
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        query = "SELECT id, file_path, thumbnail_path FROM stock_videos WHERE 1=1"
        params = []
        if channel_id:
            query += " AND (channel_id = ? OR channel_id = '' OR channel_id IS NULL)"
            params.append(channel_id)
        if scope == "unuploaded":
            query += " AND status IN ('in_stock', 'scheduled')"

        async with db.execute(query, params) as cursor:
            rows = await cursor.fetchall()

        deleted_count = len(rows)
        if deleted_count == 0:
            return 0

        ids_to_del = [r["id"] for r in rows]

        # Hapus file lokal jika diminta
        if delete_files:
            for r in rows:
                try:
                    fp = r["file_path"]
                    if fp and os.path.exists(fp):
                        os.remove(fp)
                except Exception:
                    pass
                try:
                    tp = r["thumbnail_path"]
                    if tp and not tp.startswith("http"):
                        from config import BASE_DIR
                        local_thumb = BASE_DIR / tp.lstrip("/")
                        if local_thumb.exists():
                            os.remove(local_thumb)
                except Exception:
                    pass

        placeholders = ",".join("?" for _ in ids_to_del)
        await db.execute(f"DELETE FROM stock_videos WHERE id IN ({placeholders})", ids_to_del)
        await db.commit()
        return deleted_count


# --- Helper Log ---
async def add_log(level: str, message: str):
    now = datetime.now().isoformat()
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                "INSERT INTO logs (timestamp, level, message) VALUES (?, ?, ?)",
                (now, level.upper(), message)
            )
            await db.commit()
    except Exception:
        pass

async def get_recent_logs(limit: int = 50):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM logs ORDER BY id DESC LIMIT ?", (limit,)) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

# --- Helper Multi-Channel YouTube ---
async def add_or_update_channel(channel_id: str, title: str, custom_url: str, thumbnail: str, subscriber_count: str, token_json: str):
    """Menyimpan atau memperbarui akun channel YouTube yang terhubung."""
    now = datetime.now().isoformat()
    async with aiosqlite.connect(DB_PATH) as db:
        # Cek apakah ini channel pertama. Jika ya, langsung jadikan aktif (is_active = 1)
        async with db.execute("SELECT COUNT(*) FROM youtube_channels") as cursor:
            count = (await cursor.fetchone())[0]
        is_first = (count == 0)

        # Cek apakah channel sudah ada
        async with db.execute("SELECT id, is_active FROM youtube_channels WHERE channel_id = ?", (channel_id,)) as cursor:
            existing = await cursor.fetchone()

        if existing:
            # Perbarui data channel
            await db.execute(
                """
                UPDATE youtube_channels
                SET title = ?, custom_url = ?, thumbnail = ?, subscriber_count = ?, token_json = ?
                WHERE channel_id = ?
                """,
                (title, custom_url, thumbnail, subscriber_count, token_json, channel_id)
            )
        else:
            # Tambah baru
            is_active_val = 1 if is_first else 0
            await db.execute(
                """
                INSERT INTO youtube_channels (channel_id, title, custom_url, thumbnail, subscriber_count, token_json, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (channel_id, title, custom_url, thumbnail, subscriber_count, token_json, is_active_val, now)
            )
        await db.commit()

async def get_all_channels():
    """Mengambil semua daftar channel YouTube yang tersimpan."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT id, channel_id, title, custom_url, thumbnail, subscriber_count, is_active, created_at FROM youtube_channels ORDER BY is_active DESC, id ASC") as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

async def get_active_channel():
    """Mengambil channel YouTube yang sedang aktif digunakan untuk upload."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM youtube_channels WHERE is_active = 1 LIMIT 1") as cursor:
            row = await cursor.fetchone()
            if row:
                return dict(row)
        # Jika belum ada yang is_active = 1, ambil channel pertama jika ada
        async with db.execute("SELECT * FROM youtube_channels ORDER BY id ASC LIMIT 1") as cursor:
            row = await cursor.fetchone()
            if row:
                return dict(row)
        return None

async def set_active_channel(channel_id: str):
    """Mengubah target channel YouTube aktif untuk upload."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("UPDATE youtube_channels SET is_active = 0")
        await db.execute("UPDATE youtube_channels SET is_active = 1 WHERE channel_id = ?", (channel_id,))
        await db.commit()

async def delete_channel(channel_id: str):
    """Menghapus koneksi channel YouTube tertentu."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM youtube_channels WHERE channel_id = ?", (channel_id,))
        # Jika tidak ada channel aktif tersisa, aktifkan yang pertama
        async with db.execute("SELECT COUNT(*) FROM youtube_channels WHERE is_active = 1") as cursor:
            active_count = (await cursor.fetchone())[0]
        if active_count == 0:
            await db.execute("UPDATE youtube_channels SET is_active = 1 WHERE id = (SELECT id FROM youtube_channels LIMIT 1)")
        await db.commit()

async def deduplicate_stock(channel_id: str = None) -> int:
    """
    Mendeteksi dan membersihkan stok duplikat untuk channel tertentu.
    Jika ada video yang sama, mempertahankan satu entri terbaik (yang sudah terunggah / jadwal paling awal),
    dan menghapus entri duplikat lainnya.
    """
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        query = "SELECT * FROM stock_videos"
        params = []
        if channel_id:
            query += " WHERE channel_id = ?"
            params.append(channel_id)
        query += " ORDER BY id ASC"
        
        async with db.execute(query, params) as cur:
            rows = await cur.fetchall()

        grouped = {}
        for r in rows:
            vid = extract_youtube_id(r["url"]) or r["url"]
            grouped.setdefault(vid, []).append(r)

        ids_to_delete = []
        for vid, group in grouped.items():
            if len(group) <= 1:
                continue

            def score(item):
                st = item["status"]
                yid = item["youtube_id"]
                s = 0
                if st in ("uploaded", "public") or yid: s += 100
                elif st == "scheduled": s += 50
                elif st == "in_stock": s += 10
                return s

            best = max(group, key=score)
            best_id = best["id"]
            for item in group:
                if item["id"] != best_id:
                    ids_to_delete.append(item["id"])

        if not ids_to_delete:
            return 0

        placeholders = ",".join("?" for _ in ids_to_delete)
        await db.execute(f"DELETE FROM stock_videos WHERE id IN ({placeholders})", ids_to_delete)
        await db.commit()
        return len(ids_to_delete)


