from datetime import datetime, timedelta, time
from database import get_setting, get_stock_videos

class UploadScheduler:
    @staticmethod
    def parse_time_slot(slot_str: str) -> time:
        """Mengubah string '09:00' menjadi obyek time."""
        parts = slot_str.strip().split(":")
        hour = int(parts[0])
        minute = int(parts[1]) if len(parts) > 1 else 0
        return time(hour=hour, minute=minute)

    @classmethod
    async def get_next_available_slot(cls, channel_id: str = None, exclude_video_id: int = None) -> str:
        """
        Menghitung slot jadwal berikutnya yang tersedia per channel:
        - Maksimal N video per hari (default 3)
        - Jam sesuai upload_slots (default 09:00, 13:00, 18:00)
        - Otomatis lanjut ke hari berikutnya jika slot hari ini penuh
        - Tidak akan menjadwalkan ke jam yang sudah lewat di hari ini
        """
        max_per_day = await get_setting("max_uploads_per_day", 3, channel_id=channel_id)
        upload_slots = await get_setting("upload_slots", ["09:00", "13:00", "18:00"], channel_id=channel_id)
        
        # Urutkan slot jam secara kronologis
        sorted_slots = sorted(upload_slots, key=lambda s: cls.parse_time_slot(s))
        
        # Ambil video yang sudah memiliki jadwal atau sudah diunggah untuk channel ini
        all_videos = await get_stock_videos(channel_id=channel_id)
        
        # Buat set berisi datetime yang sudah terpakai
        # Format key: 'YYYY-MM-DDTHH:MM:SS'
        occupied_slots = set()
        day_counts = {} # 'YYYY-MM-DD': count
        
        for v in all_videos:
            if exclude_video_id and v['id'] == exclude_video_id:
                continue
            
            sched = v.get('scheduled_time')
            if sched:
                try:
                    # Ambil YYYY-MM-DDTHH:MM:SS
                    clean_sched = sched[:19]
                    occupied_slots.add(clean_sched)
                    
                    date_part = clean_sched.split("T")[0]
                    day_counts[date_part] = day_counts.get(date_part, 0) + 1
                except Exception:
                    pass

        now = datetime.now()
        current_date = now.date()
        
        # Cari slot kosong mulai dari hari ini hingga ke depan
        for day_offset in range(0, 365): # Mendukung antrean stok hingga 1 tahun ke depan
            target_date = current_date + timedelta(days=day_offset)
            date_str = target_date.strftime("%Y-%m-%d")
            
            # Cek apakah kuota harian untuk hari ini sudah penuh
            if day_counts.get(date_str, 0) >= max_per_day:
                continue
                
            for slot_str in sorted_slots:
                slot_time = cls.parse_time_slot(slot_str)
                slot_dt = datetime.combine(target_date, slot_time)
                
                # Jika hari ini, pastikan jam slot belum lewat (beri toleransi minimal 2 menit ke depan)
                if target_date == current_date and slot_dt <= (now + timedelta(minutes=2)):
                    continue
                    
                slot_iso = slot_dt.strftime("%Y-%m-%dT%H:%M:%S")
                
                # Jika slot ini belum ditempati oleh video lain di channel ini
                if slot_iso not in occupied_slots:
                    return slot_iso

        # Fallback jika entah bagaimana tidak ditemukan
        fallback = now + timedelta(days=1, hours=1)
        return fallback.strftime("%Y-%m-%dT%H:%M:%S")

    @classmethod
    async def reschedule_all_unuploaded(cls, channel_id: str = None):
        """
        Menata ulang seluruh jadwal stok video yang belum diunggah secara rapi dan padat.
        Sangat berguna jika pengguna mengubah jam slot atau kuota harian.
        """
        from database import update_stock_video
        
        all_videos = await get_stock_videos(channel_id=channel_id)
        # Ambil hanya video yang belum final diunggah
        pending_videos = [v for v in all_videos if v['status'] in ('in_stock', 'scheduled')]
        # Urutkan berdasarkan queue_number
        pending_videos.sort(key=lambda x: x['queue_number'])
        
        # Reset jadwal sementara untuk dihitung ulang
        for v in pending_videos:
            await update_stock_video(v['id'], {"scheduled_time": None})
            
        for v in pending_videos:
            next_slot = await cls.get_next_available_slot(channel_id=channel_id)
            await update_stock_video(v['id'], {
                "scheduled_time": next_slot,
                "status": "scheduled"
            })
