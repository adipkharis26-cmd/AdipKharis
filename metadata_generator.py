import re
import urllib.request
import json

class MetadataGenerator:
    """
    Generator cerdas untuk judul, tag, dan deskripsi YouTube Shorts.
    Bekerja secara cerdas tanpa biaya API (rule-based heuristic), 
    serta mendukung Google Gemini API jika user memasukkan API Key di Settings.
    """

    DEFAULT_SHORT_TAGS = [
        "shorts", "youtubeshorts", "viral", "trending", 
        "shortsvideo", "viralshorts", "reels", "fyp", "trend"
    ]

    @staticmethod
    def clean_title(raw_title: str) -> str:
        """
        Membersihkan judul asli dari spam karakter, mention akun lama (@channel), 
        dan merapikan spasi.
        """
        if not raw_title:
            return "Video Shorts Menarik"

        title = raw_title
        # Hapus mention @username
        title = re.sub(r'@[A-Za-z0-9_.-]+', '', title)
        
        # Hapus hashtag yang menumpuk di judul (kita akan letakkan #Shorts rapi di akhir)
        title = re.sub(r'#\w+', '', title)
        
        # Hapus kata-kata clickbait umum yang berlebihan
        patterns = [
            r'\(MUST WATCH\)', r'\[VIRAL\]', r'\(VIRAL\)', r'\[FULL HD\]',
            r'LIKE AND SUBSCRIBE', r'PLEASE SUBSCRIBE', r'SUBSCRIBE NOW',
            r'DON\'T FORGET TO SUBSCRIBE'
        ]
        for p in patterns:
            title = re.sub(p, '', title, flags=re.IGNORECASE)
            
        # Bersihkan spasi berulang & tanda baca ganda
        title = re.sub(r'\s+', ' ', title).strip()
        title = re.sub(r'[!?.]{2,}', '!', title)
        
        # Batasi panjang judul Shorts ideal (di bawah 80 karakter agar tidak terpotong di layar HP)
        if len(title) > 80:
            title = title[:77] + "..."
            
        return title if title else "Video Shorts Menarik"

    @classmethod
    def generate_title(cls, raw_title: str, template: str = "{clean_title} #Shorts") -> str:
        clean = cls.clean_title(raw_title)
        if "{clean_title}" in template:
            formatted = template.replace("{clean_title}", clean)
        else:
            formatted = f"{clean} #Shorts"
            
        # Pastikan tidak melebihi 100 karakter (batas YouTube)
        return formatted[:100]

    @classmethod
    def generate_tags(cls, title: str, original_tags: list[str] = None, default_tags: list[str] = None) -> list[str]:
        """
        Menghasilkan 15-20 tag SEO relevan untuk YouTube Shorts.
        """
        combined_tags = set()
        
        # 1. Masukkan tag dasar shorts
        base_defaults = default_tags if default_tags else cls.DEFAULT_SHORT_TAGS
        for t in base_defaults:
            clean_t = t.lower().replace('#', '').strip()
            if clean_t:
                combined_tags.add(clean_t)

        # 2. Ambil tag asli dari video jika ada
        if original_tags:
            for ot in original_tags:
                clean_ot = ot.lower().replace('#', '').strip()
                if len(clean_ot) >= 2 and len(combined_tags) < 25:
                    combined_tags.add(clean_ot)

        # 3. Ekstrak kata kunci dari judul
        words = re.findall(r'\b[a-zA-Z0-9]{3,}\b', title.lower())
        stop_words = {'the', 'and', 'for', 'with', 'from', 'this', 'that', 'yang', 'dan', 'untuk', 'dengan', 'video', 'shorts'}
        for w in words:
            if w not in stop_words and len(combined_tags) < 25:
                combined_tags.add(w)

        return list(combined_tags)[:25]

    @classmethod
    def generate_description(cls, title: str, original_description: str = "", template: str = "") -> str:
        """
        Menghasilkan deskripsi YouTube Shorts sesuai template kustom channel atau default.
        Variabel yang didukung: {clean_title}, {title}, {original_title}, {original_desc}
        """
        clean_t = cls.clean_title(title)
        if template and template.strip():
            desc = template.replace("{clean_title}", clean_t)
            desc = desc.replace("{title}", title)
            desc = desc.replace("{original_title}", title)
            desc = desc.replace("{original_desc}", original_description or "")
            return desc.strip()

        desc_lines = [
            f"{clean_t}",
            "",
            "Tonton sampai habis! Jangan lupa Like, Comment, dan Subscribe untuk konten menarik lainnya setiap hari.",
            "",
            "---",
            "#Shorts #YouTubeShorts #Viral #Trending #FYP #ShortsVideo"
        ]
        return "\n".join(desc_lines)

    @classmethod
    def optimize_with_gemini(cls, api_key: str, raw_title: str, raw_desc: str) -> dict:
        """
        Opsional: Jika user memasukkan Google Gemini API Key di dashboard,
        gunakan model Gemini untuk merumuskan ulang judul yang lebih viral dan CTR tinggi.
        """
        if not api_key:
            return None
        
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            prompt = (
                f"Kamu adalah pakar YouTube Shorts SEO. Optimalkan judul dan tag berikut:\n"
                f"Judul Asli: {raw_title}\n"
                f"Deskripsi: {raw_desc[:200]}\n"
                f"Berikan output JSON murni dengan format:\n"
                f'{{"title": "Judul Menarik Maks 70 Huruf #Shorts", "tags": ["tag1", "tag2", "tag3"], "description": "Deskripsi singkat"}}\n'
                f"Jangan tambahkan markdown lain kecuali JSON."
            )
            data = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }]
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(data).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                res_body = response.read().decode('utf-8')
                result_json = json.loads(res_body)
                text_content = result_json['candidates'][0]['content']['parts'][0]['text']
                
                # Ekstrak JSON
                match = re.search(r'\{.*\}', text_content, re.DOTALL)
                if match:
                    return json.loads(match.group(0))
        except Exception:
            pass
        return None
