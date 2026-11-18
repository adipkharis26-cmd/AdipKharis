/* ATURAN PEMILIK (WAJIB): saat bercakap, tidak ada yang membelakangi lawan bicara.
 *  - Pembicara menghadap lawan bicaranya (addressee).
 *  - Semua pendengar yang ada di panggung menghadap pembicara.
 *  - Orang yang sedang berjalan tetap menghadap arah jalannya.
 * Lawan bicara dipilih berurutan: (1) "to" di baris naskah, (2) sapaan di teks (nama / Pak / Bu / Kak / Jang / Din ...),
 * (3) pembicara sebelumnya yang berbeda, (4) pembicara berikutnya yang berbeda.
 * Modul ini tanpa import supaya bisa dipakai renderer DAN skrip audit. */

export interface FLine { id: string; scene: string; speaker: string; text: string; start: number; offscreen?: boolean; to?: string }

/** Sapaan → id karakter. Sapaan umum (Pak/Bu/Kak) hanya dipakai bila tepat satu kandidat ada di adegan. */
const NAMED: [RegExp, string][] = [
  [/\bkusaka\b/i, "kusaka"], [/\b(ujang|jang)\b/i, "ujang"], [/\bnadia\b/i, "nadia"], [/\b(dinda|din)\b/i, "dinda"],
  [/\bpak darto\b/i, "pakDarto"], [/\bbu ijah\b/i, "buIjah"], [/\bbimo\b/i, "bimo"], [/\bsasa\b/i, "sasa"],
  [/\bbu wati\b/i, "buWati"], [/\bpak joko\b/i, "pakJoko"], [/\bmang( udin)?\b/i, "mangUdin"], [/\b(ucok|cok)\b/i, "ucok"],
  [/\braka\b/i, "raka"], [/\bkak tara\b/i, "tara"],
  // panggilan keluarga (dicek setelah nama): "Ibu", "Bapak"
  [/\bibu\b/i, "ibu"], [/\bbapak\b/i, "bapak"],
];
const GENERIC: [RegExp, string[]][] = [
  [/\bpak\b/i, ["bapak", "pakDarto", "pakJoko"]],
  [/\bbu\b/i, ["ibu", "buWati", "buIjah"]],
  [/\bkak\b/i, ["kusaka", "tara"]],
];

export function addresseeOf(line: FLine, sceneLines: FLine[], onStage: (c: string) => boolean): string | null {
  const ok = (c: string | undefined | null) => !!c && c !== line.speaker && onStage(c);
  if (ok(line.to)) return line.to!;
  for (const [re, id] of NAMED) if (re.test(line.text) && ok(id)) return id;
  for (const [re, ids] of GENERIC) {
    if (!re.test(line.text)) continue;
    const cands = ids.filter(ok);
    if (cands.length === 1) return cands[0];
  }
  const i = sceneLines.indexOf(line);
  for (let k = i - 1; k >= 0; k--) if (ok(sceneLines[k].speaker)) return sceneLines[k].speaker;
  for (let k = i + 1; k < sceneLines.length; k++) if (ok(sceneLines[k].speaker)) return sceneLines[k].speaker;
  return null;
}

/** Baris yang sedang berlangsung di adegan pada waktu t (baris terakhir yang sudah mulai; sebelum baris pertama = baris pertama). */
export function activeLine(sceneLines: FLine[], t: number): FLine | null {
  let cur: FLine | null = sceneLines[0] ?? null;
  for (const l of sceneLines) { if (l.start <= t) cur = l; else break; }
  return cur;
}

/** Arah hadap percakapan untuk karakter c, atau null bila aturan tidak berlaku (tetap pakai arah dasar). */
export function conversationFacing(
  c: string, line: FLine | null, sceneLines: FLine[], xOf: (id: string) => number, onStage: (id: string) => boolean,
): 1 | -1 | null {
  if (!line || line.offscreen || !onStage(line.speaker)) return null;
  const target = c === line.speaker ? addresseeOf(line, sceneLines, onStage) : line.speaker;
  if (!target) return null;
  const dx = xOf(target) - xOf(c);
  if (Math.abs(dx) < 1) return null;
  return dx > 0 ? 1 : -1;
}
