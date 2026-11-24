# Cerita & dialog natural untuk Shorts KUSAKA (pemilik 22 Nov 2026)

Masalah yang diperbaiki: cerita terasa "kaku" (dialog menjelaskan, semua tokoh bicara dengan nada yang sama) dan
suara terdengar dibacakan per baris. Panduan ini wajib dipakai untuk SETIAP Shorts baru, bersama aturan 20.

Sumber yang diadaptasi (dibaca, diterjemahkan ke konteks komedi sekolah Indonesia, bukan disalin):
- `zenstory-ai/drama-skills` (★4,6k, MIT): `short-drama-write/references/dialogue-craft.md` & `script-craft.md`
  — dialog sebagai "gerakan" antartokoh, subteks, tidak menjelaskan yang sudah terlihat, uji tukar dialog.
- `talsraviv/comedy-writers-room` (konsep saja): uji lelucon dengan tiga tipe penonton sebelum dipakai.
- Panduan ElevenLabs Eleven v4 / Text to Dialogue: emosi disimpulkan dari konteks, tag nada [..] secukupnya.

## 1. Bentuk cerita (sebelum menulis satu baris pun)
1. **Satu keinginan konkret + satu penghalang.** Contoh: Dinda ingin jajan ↔ Ibu terus menunda.
   Tulis dalam satu kalimat: "<tokoh> ingin <X>, tapi <Y>". Kalau tidak bisa, ceritanya belum ada.
2. **Detik 0 = di tengah masalah** (aturan 20). Kalimat pertama adalah reaksi/teriakan, bukan pengantar.
3. **Eskalasi bertingkat (aturan tiga).** Tiga langkah yang makin parah: bawang → beras → minyak → *ayam setengah kilo*.
   Langkah ketiga dibelokkan sedikit (lebih spesifik/absurd) — di situ tawanya.
4. **Punchline = pembalikan harapan** yang sudah ditanam sejak awal ("nanti jajan" → yang diberikan kantong plastik).
5. **Tombol (button)** setelah punchline: satu reaksi pendek tokoh korban ("Ini mah bukan jajan, Bu."). Lalu CTA, lalu loop.
6. **Loop** mengulang premis dari mulut tokoh lain ("Cabainya kelupaan. Ayo, balik lagi." → "IBU! Katanya cuma beli cabai!").
7. **Detail spesifik & nostalgia nyata** (penonton 25–34): "nulis tanggal", "kepala Ibu kena" di foto papan, "dua setengah"
   gorengan, nawar tomat sejak jam tujuh. Detail spesifik > kalimat umum.

## 2. Dialog yang tidak kaku
- **Pendek dan saling sambar.** Rata-rata ≤ 8 kata per baris; boleh potongan "Bu, Bu, Bu—", "Dua?", "...Ujang."
  Baris satu kata yang tepat waktu sering lebih lucu daripada kalimat lengkap.
- **Jangan menjelaskan apa yang terlihat.** Kalau Bu Ijah melihat tangan Kusaka memegang tiga gorengan, jangan tulis
  "Kamu bohong, kamu makan tiga". Tulis: "Le. Tanganmu masih megang tiga."
- **Subteks: tokoh menghindar, mengalihkan, atau menjawab yang tidak ditanya.** Ibu tidak pernah menjawab soal jajan;
  ia malah menawar tomat ke pedagang. Kusaka tidak mengaku; ia menawar angka ("dua setengah").
- **Tiap tokoh punya cara bicara sendiri (uji tukar):** tukar dua baris antartokoh — kalau tetap terasa sama, tulis ulang.
  - Kusaka: gue/lu, percaya diri berlebihan, ngeles. Ujang: datar, sinis, pasrah ("Udah gue duga.").
  - Nadia: rapi, singkat, menusuk ("Pakai uang siapa?"). Sasa: cepat, heboh, suka memotret.
  - Ucok: logat Medan ("Macam mana pulak ini?!", "-ku"). Bu Ijah: Jawa ("Le", "Wis", "tak catat").
  - Bu Wati: tenang, pelan, mematikan. Bu Ratna: "Sayang"/"Nak", ramah tapi tegas. Pak Hendra: kalem, takut istri,
    nostalgia "Bapak dulu juga gitu, Nak." Dinda: aku/kamu, tukang ngadu.
- **Partikel lisan Indonesia** di tempat yang wajar: *sih, deh, dong, kok, lho, kan, mah, nah, eh, ah, ya*.
  Hindari bahasa baku tulis ("Apakah", "tersebut", "kemudian") kecuali untuk tokoh guru yang sengaja kaku.
- **Bunyi nyata manusia:** "Hehe...", "Hah?", "...Oh.", jeda "..." untuk ragu, "—" untuk dipotong.
- **Satu tujuan per baris.** Kalau satu baris berisi dua informasi, pecah atau buang salah satunya.

## 3. Suara natural (mode dialog ElevenLabs)
- Naskah Shorts baru WAJIB `"voiceMode": "dialogue"`: satu adegan dibuat sekaligus lewat **Text to Dialogue (eleven_v4)**
  dengan voice_id kanon yang sama (`canon.json → dialogue`: seed 2211, stability 0,5). Model mendengar seluruh percakapan,
  sehingga jeda, intonasi, dan emosi antarbaris mengalir (berbeda dengan TTS per baris yang terdengar "dibacakan").
- Field `"say"` = `"text"` + tag nada bahasa Inggris dalam kurung siku, mis. `"[sighs, resigned] Udah gue duga. Sini, Bu."`.
  Tanpa tag, `say` boleh dihilangkan. Tag TIDAK tampil di subtitle dan tidak masuk lip-sync (divalidasi: teks tanpa tag harus sama).
- Tag secukupnya: satu per perubahan emosi, di awal klausa. Tag arahan (`[whispering]`, `[flat]`, `[excited]`, `[sarcastic]`,
  `[hesitant]`, `[mouth full]`) dan tag bunyi (`[sighs]`, `[laughs]`, `[nervous laugh]`, `[scoffs]`, `[gasps]`).
  Tag bunyi (>0,2 dtk) otomatis ikut dipotong ke audio baris; tag arahan tidak berbunyi.
- Tag dihitung sebagai karakter kuota. Maks ±1.800 karakter per generate (otomatis dipecah per adegan).
- Jeda antarbaris diambil dari performa model (natural), bukan `gapSeconds`. Cek: tidak ada jeda mati > 0,5 dtk
  kecuali perpindahan adegan.

## 4. Uji sebelum pratinjau (writers room singkat, dilakukan sendiri)
Baca naskah tiga kali sebagai:
1. **Penonton antusias** — baris mana yang paling ingin dia ulang/kirim ke teman? Kalau tidak ada, punchline lemah.
2. **Penonton skeptis** (swipe dalam 2 dtk) — apakah detik 0–2 langsung konflik? Ada baris yang terasa "dijelaskan"?
3. **Penonton yang terlalu berpikir** — ada yang membingungkan (siapa bicara ke siapa, benda tidak terlihat, logika loop)?
Perbaiki, lalu jalankan `--estimate`, `audit:props` = 0, storyboard.

## 5. Checklist cepat
- [ ] Kalimat "ingin X tapi Y" jelas · detik 0 di tengah masalah · teks hook
- [ ] Eskalasi 3 langkah · punchline membalik harapan · button · CTA cerita · loop
- [ ] Rata-rata ≤ 8 kata/baris · tidak ada baris yang menjelaskan apa yang terlihat · uji tukar lulus
- [ ] ≥ 1 kalimat khas tokoh · partikel lisan wajar · detail nostalgia spesifik
- [ ] `voiceMode: dialogue` · `say` dengan tag secukupnya · tidak ada jeda mati > 0,5 dtk

## 6. Pelajaran dari masukan pemilik (24 Nov 2026: Shorts 9 & 10 v1 "kaku, tidak natural")
Kesalahan v1 yang WAJIB dihindari (contoh nyata → perbaikan v2):
- **Kalimat kata mutiara / penutup rapi.** "Namanya juga keluarga, Nak. Ketinggalan bareng-bareng." → manusia tidak bicara seperti caption.
  Ganti dengan reaksi spontan/fisik: "...Nak? Nak!" lalu callback pendek "Nah. Itu baru bisa dikejar."
- **Tokoh menjelaskan lelucon.** "Jadi Bapak jemput aku... buat ketinggalan bareng?" → biarkan penonton menyimpulkan dari aksi (Dinda naik angkot sendiri).
- **"Dad joke" yang bukan lelucon.** Tulis lelucon sungguhan dengan pola tanya-jawab bapak-bapak ("Tahu nggak bedanya angkot sama mantan?"),
  dan punchline-nya berbalik ke dia ("masih bisa dikejar" → "Bapak pakai sarung").
- **Perintah satu kata beruntun** ("Sa." / "Hapus.") terasa robot bila tanpa reaksi di sekitarnya. Satu kata boleh, tetapi diselingi interupsi,
  ragu ("...Itu senyum?"), dan jawaban yang tidak diduga ("Ini maksimal.").
- **Tanpa taruhan.** Beri alasan konkret kenapa keinginan itu penting ("Foto buat mading. Plis.").
- **Button terbaik datang dari tokoh pinggiran** yang selama ini datar ("Gue senyum di situ, lho.") — bukan dari tokoh utama yang merangkum.
- Tes cepat: bacakan keras-keras. Kalau ada kalimat yang tidak akan diucapkan orang Indonesia sungguhan di situasi itu, tulis ulang.
