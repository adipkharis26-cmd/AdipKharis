import asyncio
import os
from datetime import datetime
from database import init_db, add_to_queue, add_multiple_to_queue, get_all_queue, add_stock_video, get_stock_videos
from metadata_generator import MetadataGenerator
from scheduler import UploadScheduler
from downloader import clean_filename
import config

async def test_all():
    print("=== 1. Inisialisasi Database ===")
    await init_db()
    print("Database SQLite berhasil diinisialisasi di:", config.DB_PATH)

    print("\n=== 2. Uji Generator Judul & Tag ===")
    sample_raw_title = "KUCING LUCU BIKIN NGAKAK BANGET!! (MUST WATCH) @kucinglovers #lucu #viral #hewan"
    clean = MetadataGenerator.clean_title(sample_raw_title)
    gen_title = MetadataGenerator.generate_title(sample_raw_title)
    gen_tags = MetadataGenerator.generate_tags(clean, ["kucinglucu", "hewanunik"])
    gen_desc = MetadataGenerator.generate_description(gen_title)
    
    print("Judul Asli:", sample_raw_title)
    print("Judul Bersih:", clean)
    print("Judul Generated:", gen_title)
    print("Tag Generated (Total %d):" % len(gen_tags), gen_tags[:8])
    assert "#Shorts" in gen_title, "Judul harus menyematkan #Shorts"
    assert len(gen_tags) >= 5, "Tag harus minimal 5"

    print("\n=== 3. Uji Sistem Antrean (Queue) ===")
    urls = [
        "https://www.youtube.com/shorts/sample1",
        "https://www.youtube.com/shorts/sample2",
        "https://www.youtube.com/shorts/sample3"
    ]
    added_ids = await add_multiple_to_queue(urls)
    print(f"Berhasil menambahkan {len(added_ids)} item ke antrean.")
    all_queue = await get_all_queue()
    print(f"Total antrean saat ini: {len(all_queue)}")
    for q in all_queue[-3:]:
        print(f"  [Queue #{q['queue_number']:04d}] Status: {q['status']} | URL: {q['url']}")

    print("\n=== 4. Uji Logika Penjadwalan (Maks 3 Video / Hari & Rollover Stok) ===")
    # Simulasikan memasukkan 7 video untuk mengecek pembagian slot ke hari-hari berikutnya
    simulated_slots = []
    for i in range(1, 8):
        slot = await UploadScheduler.get_next_available_slot()
        simulated_slots.append(slot)
        # Tambahkan ke stock_videos simulasi agar occupied_slots terhitung untuk iterasi berikutnya
        await add_stock_video({
            "queue_number": 900 + i,
            "url": f"https://youtube.com/shorts/test{i}",
            "original_title": f"Video Test {i}",
            "title": f"Video Test #{i} #Shorts",
            "status": "scheduled",
            "scheduled_time": slot
        })
        print(f"  Video #{i} -> Dijadwalkan pada: {slot}")

    # Analisis distribusi tanggal
    date_counts = {}
    for s in simulated_slots:
        d = s.split("T")[0]
        date_counts[d] = date_counts.get(d, 0) + 1

    print("\nDistribusi Jadwal Per Tanggal:")
    for d, count in date_counts.items():
        print(f"  Tanggal {d}: {count} video (Maksimal 3)")
        assert count <= 3, f"Jumlah video pada tanggal {d} melebihi 3! (Ditemukan: {count})"

    print("\n=== 5. Uji FFmpeg & Downloader Config ===")
    print("Lokasi FFmpeg terdeteksi:", config.FFMPEG_PATH)
    assert os.path.exists(config.FFMPEG_PATH), "File binary ffmpeg harus ada!"

    print("\n>>> SEMUA PENGUJIAN BERHASIL 100%! <<<")

if __name__ == "__main__":
    asyncio.run(test_all())
