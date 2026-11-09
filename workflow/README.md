# Kantor Konten — workflow agen

Owner: **Adip**. Halaman kantor (tempat ACC): https://claude.ai/artifact/TPrLXh4cwBMhXhnRKxp7DC

```
06:40 WIB  Penggali Ide ──► setor N judul/channel ke Kantor Konten (status: usulan)
           Owner ──────────► tekan ACC / Tolak (+ catatan opsional)
tiap jam   Penulis Naskah ─► naskah/epNN-*.md (format skill channel)
07–22 WIB  Cek Fakta ──────► verifikasi "Dasar fakta", koreksi naskah
           Pengisi Suara ──► ElevenLabs (tts_elevenlabs.py) → mp3 + timestamp kata
                             → pratinjau VO (mp4) di kartu, status: cek-vo
           Owner ──────────► ACC suara (vo-acc)  /  Ulang VO + catatan (vo-ulang)
           Animator ───────► epNN.js + render MP4 1080×1920 sinkron VO
           Publisher ──────► unggah MP4 ke Kantor Konten, isi judul/deskripsi/tag,
                             commit sumber ke repo, kirim MP4 ke owner (status: selesai)
```

## Peran (karyawan)

| id | Nama | Tugas | Output |
|---|---|---|---|
| `penggali` | Penggali Ide | Cari tema yang relevan dan ber-CTA tinggi, tanpa mengulang judul lama | dokumen `ideas/*` status `usulan` |
| `penulis` | Penulis Naskah | Naskah 8 bagian sesuai skill channel | `naskah/epNN-slug.md`, `video/vo/epNN.txt` |
| `cekfakta` | Cek Fakta | Pastikan setiap klaim fakta punya sumber nyata. Klaim tanpa sumber dihapus atau dilunakkan | naskah terkoreksi |
| `suara` | Pengisi Suara | VO ElevenLabs dengan timestamp kata | `video/vo/epNN.mp3/.json/-words.js` |
| `animator` | Animator | Kode scene episode, cek stills, render | `video/src/epNN.{html,js}`, MP4 |
| `publisher` | Publisher | Unggah MP4 ke kartu, siapkan teks upload, commit dan push sumber | kartu `selesai` |

Setiap agen memperbarui dokumen `agents/<id>` saat mulai (`status: "kerja"`, `aktivitas: "…"`) dan saat selesai (`status: "santai"`), supaya kantor di halaman ikut bergerak.

## Database Kantor Konten

`ideas/<channel-prefix>-YYYYMMDD-n`:

| field | isi |
|---|---|
| `channel`, `channelNama` | `mas-kharis`, `Mas Kharis` |
| `tanggal` | `YYYY-MM-DD` (WIB) |
| `judul`, `hook[3]`, `niche`, `alasan`, `cta` | diisi Penggali Ide |
| `status` | `usulan` → `acc` → `cek-vo` → `vo-acc` → `selesai`. Status lain: `vo-ulang`, `tolak`, `butuh-vo`, `gagal`, `produksi` |
| `catatanVo` | catatan owner saat ACC atau ulang suara |
| `voPreviewUrl`, `voMp4AssetId`, `voDurasi` | pratinjau VO (mp4) untuk dicek owner |
| `naskahMd`, `voJson`, `epJs` | salinan berkas episode, untuk jaga-jaga kalau push dari sesi terjadwal gagal |
| `kunci` | `{oleh, sampai}`: ide sedang dikerjakan sesi lain, jadi jangan disentuh |
| `catatan` | catatan owner saat ACC, wajib dipatuhi tim |
| `progres` | satu baris status terkini |
| `naskahPath`, `episode` | mis. `naskah/ep03-...md`, `ep03` |
| `voText` | 8 paragraf VO (ditampilkan saat `butuh-vo` supaya owner bisa rekam) |
| `voAssetId`, `voUrl` | VO yang diunggah owner (cadangan ElevenLabs) |
| `videoAssetId`, `videoUrl` | MP4 hasil, diputar di tab Selesai |
| `upload` | judul, deskripsi singkat, dan tag untuk YouTube/TikTok |

`agents/<id>`: `nama, peran, warna, urut, status (kerja|santai), aktivitas, diubah`.

## Menambah channel/karyawan baru

1. Buat skill gaya channel di `.claude/skills/<channel>/SKILL.md`, dengan pola yang sama seperti `mas-kharis`.
2. Tambahkan channel di `workflow/config.json` → `channels`.
3. Penggali Ide otomatis ikut menyetor judul untuk channel itu. Produksi memakai skill channel tersebut.

## Jadwal otomatis

Dua tugas terjadwal menjalankan sesi Claude baru di environment `adipkharis` (yang mengizinkan `api.elevenlabs.io`):

- **Ide harian**, setiap hari 06:40 WIB: menjalankan `workflow/prompts/ide-harian.md`.
- **Produksi**, setiap jam pada menit 13 dari 07:13 sampai 22:13 WIB: menjalankan `workflow/prompts/produksi.md`.

## Kebutuhan

- API key ElevenLabs disimpan sebagai *network secret* di environment `adipkharis` untuk host `api.elevenlabs.io`, dengan header `xi-api-key`. Kuncinya tidak pernah ditulis ke repo.
- `workflow/config.json` → `elevenlabs.voice_id` diisi dengan Voice ID pilihan owner.
