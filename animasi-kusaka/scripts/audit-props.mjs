// Audit "tindakan & benda terlihat" (aturan 14): membaca naskah dan menandai baris yang menyebut benda/tindakan
// tetapi tidak ada wujudnya di layar (hold / aksi / track / tas / topi). Pakai: npm run audit:props -- src/data/episodes/eps03.json
import fs from "node:fs";
const file = process.argv.slice(2).find((a) => a.endsWith(".json")) ?? "src/data/script.json";
const sc = JSON.parse(fs.readFileSync(file, "utf8"));
const locs = JSON.parse(fs.readFileSync("src/scene/locations.json", "utf8")).locations;
const RULES = [
  { re: /kertas|lembar|tanda tangan/i, label: "kertas", item: "paper", acts: ["read", "show", "give"] },
  { re: /buku|halaman|\bPR\b/i, label: "buku/PR", item: "book|bookStack|ledger|libBook", acts: ["show"] },
  { re: /berkas/i, label: "berkas", item: "folder|clipboard", acts: ["give"] },
  { re: /alarm|weker/i, label: "alarm", item: "alarm" },
  { re: /\bbaki\b/i, label: "baki", item: "tray" },
  { re: /\bbola\b|lempar|basket/i, label: "bola", item: "ball", acts: ["shoot"] },
  { re: /\bes teh\b|\bteh\b|kopi/i, label: "minuman", item: "cup|mug|tumbler", acts: ["drink"] },
  { re: /gorengan/i, label: "gorengan", item: "gorengan|gorenganTiga" },
  { re: /belanja|kresek|belanjaan|kantong plastik/i, label: "belanjaan", item: "kresek|bagTote|kresekBelanja|kresekKosong|tomatoBag" },
  { re: /dompet/i, label: "dompet", item: "wallet", acts: ["pocket"] },
  { re: /peluit|\bpriit\b/i, label: "peluit", item: "whistle", acts: ["blow"] },
  { re: /\bsapu\b|piket/i, label: "sapu/piket", item: "broom", acts: ["sweep"] },
  { re: /bakso|mangkuk|mi instan|makan\b/i, label: "makanan", item: "bowl", acts: ["eat"] },
  { re: /\btulis|catatan|mencatat/i, label: "menulis/catatan", item: "pen|paper", acts: ["write", "read"] },
  { re: /\bhp\b|video|\blive\b|nonton|rekam|komentar|penonton/i, label: "HP/video", item: "phonePhoto", acts: ["phone", "photo"] },
  // Eps. 5 "Satu Kelompok"
  { re: /undian|diundi|\bkotak|gulungan|\bkaret\b|kertas kado/i, label: "undian", item: "lotteryBox|lotScroll|lotScrollRed|lotSlip|rubberBands" },
  { re: /\bfoto|motret|memotret|\bklik\b/i, label: "foto", item: "phonePhoto|phoneGallery", acts: ["photo"] },
  { re: /\brak\b/i, label: "rak", acts: ["reach"], loc: "perpustakaan" },
  { re: /penjaga perpus/i, label: "penjaga perpus", loc: "perpustakaan" },
  { re: /lembar tugas|lembar jawab/i, label: "lembar tugas", item: "paper", acts: ["read", "write", "give"] },
  // Shorts "Papan Tulis": menghapus/mencatat papan tulis, galeri foto papan
  { re: /hapus|dihapus|penghapus/i, label: "hapus papan", item: "boardEraser", acts: ["erase"], track: "board" },
  { re: /papan tulis|\bcatat|dicatat/i, label: "papan tulis/catat", item: "pen|boardEraser|phoneGallery", acts: ["write", "erase", "photo"], track: "board" },
  { re: /galeri/i, label: "galeri HP", item: "phoneGallery" },
  // Eps. 5: menara buku yang roboh di perpustakaan
  { re: /menara|roboh|runtuh/i, label: "menara buku", track: "tower" },
  // Shorts "Bayar Gorengan": uang pas / bayar / traktir, buku utang
  { re: /\buang\b|bayar|traktir/i, label: "uang/bayar", item: "coins|wallet" },
  { re: /utang/i, label: "buku utang", item: "ledger" },
  // Shorts "Ke Pasar": isi belanjaan pasar
  { re: /\btomat/i, label: "tomat", item: "tomatoBag" },
  { re: /\bcabai|bawang|beras|minyak|ayam\b/i, label: "isi belanjaan", item: "kresekBelanja|kresek" },
  { re: /hormat/i, label: "hormat", acts: ["salute"], track: "salute" },
  { re: /bendera|tiang/i, label: "bendera", track: "flag", loc: "lapanganUpacara" },
  { re: /\btali\b/i, label: "tali", track: "flag|snag", loc: "lapanganUpacara" },
  { re: /gerbang/i, label: "gerbang", track: "gate", loc: "gerbang" },
  { re: /angkot|\bbus\b/i, label: "angkot", track: "angkot", loc: "halte" },
  { re: /\btas\b|ransel|berangkat|pulang sekolah/i, label: "tas", bag: true },
];
let issues = 0, total = 0;
for (const s of sc.scenes) {
  const held = {};
  const put = (c, v) => { if (Array.isArray(v)) v.forEach((x) => put(c, x)); else if (v === null) delete held[c]; else held[c] = [...(held[c] ?? []), typeof v === "string" ? v : v.item]; };
  const apply = (h) => { for (const [c, v] of Object.entries(h ?? {})) put(c, v); };
  apply(s.hold);
  const loc = locs[s.location] ?? {};
  const bagScene = s.bag === true || Array.isArray(s.bag) || (s.bag === undefined && loc.bag);
  const allActs = s.lines.flatMap((l) => [l.action, ...Object.values(l.reactions ?? {}).map((r) => r[1])]);
  for (const l of s.lines) {
    apply(l.hold);
    const items = Object.values(held).flat();
    for (const r of RULES) {
      if (!r.re.test(l.text) || l.ref?.includes(r.label)) continue; // "ref": ["bendera"] = hanya dibicarakan, bukan ada di layar
      total++;
      const needItems = r.item?.split("|") ?? [];
      const okItem = needItems.some((i) => items.includes(i));
      const okAct = (r.acts ?? []).some((a) => l.action === a || Object.values(l.reactions ?? {}).some((x) => x[1] === a) || (a === "phone" && allActs.includes("phone")));
      const okTrack = r.track ? r.track.split("|").some((t) => s.tracks?.[t]) || (r.loc && s.location === r.loc && r.track === "flag" && s.location === "lapanganUpacara") || (r.loc && s.location === r.loc && r.track === "gate" && s.location === "gerbang") : false;
      const okBag = r.bag ? bagScene : false;
      const okLoc = r.loc && s.location === r.loc && !r.track;
      if (!(okItem || okAct || okTrack || okBag || okLoc)) { issues++; console.log(`⚠ ${s.id}/${l.id} [${r.label}] "${l.text}"\n    → tambahkan: ${[r.item && `hold ${r.item}`, r.acts && `aksi ${r.acts.join("/")}`, r.track && `tracks.${r.track}`].filter(Boolean).join("  atau  ")}`); }
    }
  }
}
console.log(`\n${issues === 0 ? "✓" : "✗"} audit ${file}: ${issues} dari ${total} penyebutan benda/tindakan belum terlihat di layar`);
