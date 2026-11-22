// Voice-over generator with LOCKED voices.
//   node scripts/generate-voice.mjs [src/data/episodes/eps01.json] [--force] [--estimate]
// --estimate: validasi naskah + perkiraan durasi & karakter ElevenLabs yang dibutuhkan, tanpa memanggil API.
// - Every character's voice comes ONLY from src/characters/canon.json (voice_id, model eleven_v4, language id, seed, settings).
// - Voices are verified before use (account or public ElevenLabs library, matched by voice_id). No automatic fallback.
// - Each line is stored as public/audio/<episode>/<line>.mp3 + .json (alignment + hash). Existing takes are reused as long
//   as text + voice params are unchanged, so voices never drift — even when the API key / account changes.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const scriptPath = process.argv.slice(2).find((a) => a.endsWith(".json")) ?? "src/data/script.json";
const script = read(scriptPath);
// Single-location scripts are treated as one scene.
if (!script.scenes) script.scenes = [{ id: "s01", location: script.location, cast: script.cast, lines: script.lines }];
script.lines = script.scenes.flatMap((sc) => sc.lines.map((l) => ({ ...l, scene: sc.id })));
const canon = read("src/characters/canon.json");
const editing = read("src/edit/editing.json");
const sfx = read("src/audio/sfx.json");
const locations = read("src/scene/locations.json");
const beds = read("src/audio/beds.json");
const force = process.argv.includes("--force");
const apiKey = process.env.ELEVENLABS_API_KEY; // optional when a proxy injects auth
const LOCKED_MODEL = "eleven_v4";

const fail = (msg) => { console.error(`✗ ${msg}`); process.exit(1); };

/* ---------------- validation (consistency rules) ---------------- */
const EMOTIONS = ["neutral", "smug", "suspicious", "shock", "laugh", "pleading", "deadpan", "surprised", "embarrassed", "defeated"];
const SHOTS = editing.camera.shots;
if (!script.episode) fail("script.json butuh field \"episode\" (mis. \"eps01\")");
const ACTIONS = ["idle","gesture","pocket","chin","point","plead","crossed","shock","laugh","slump","wave","thumbsup","peace","facepalm","hips","phone","hold","carry","give","show","read","pull","salute","shoot","drink","eat","write","sweep","blow","reach","photo","erase"];
let ctaCount = 0;
for (const sc of script.scenes) {
  const loc = locations.locations[sc.location];
  if (!loc) fail(`${sc.id}: lokasi "${sc.location}" tidak ada di locations.json`);
  if (sc.music && beds.beds[sc.music]?.kind !== "music") fail(`${sc.id}: music "${sc.music}" tidak ada di beds.json (kind music)`);
  for (const a of sc.amb ?? []) if (beds.beds[a]?.kind !== "ambience") fail(`${sc.id}: amb "${a}" tidak ada di beds.json (kind ambience)`);
  if (sc.wear && !["seragam", "bebas", "rumah"].includes(sc.wear)) fail(`${sc.id}: wear "${sc.wear}" tidak valid (seragam | bebas | rumah)`);
  const marks = new Set();
  for (const [id, c] of Object.entries(sc.cast ?? {})) {
    if (!canon.characters[id]) fail(`${sc.id}: karakter "${id}" tidak ada di canon.json`);
    if (!loc.marks[c.mark]) fail(`${sc.id}: mark "${c.mark}" tidak ada di lokasi ${sc.location}`);
    if (marks.has(c.mark)) fail(`${sc.id}: dua karakter di mark ${c.mark}`);
    marks.add(c.mark);
  }
  let crashes = 0;
  for (const l of sc.lines) {
    if (!canon.characters[l.speaker]) fail(`${l.id}: karakter "${l.speaker}" tidak ada di canon.json`);
    if (!sc.cast?.[l.speaker] && !l.offscreen) fail(`${l.id}: "${l.speaker}" tidak ada di cast ${sc.id} (pakai "offscreen": true untuk suara dari luar layar)`);
    if (!EMOTIONS.includes(l.emotion) || !EMOTIONS.includes(l.listener)) fail(`${l.id}: emosi tidak valid`);
    if (!SHOTS.includes(l.shot)) fail(`${l.id}: shot "${l.shot}" tidak valid`);
    if (l.camAt && !(l.camAt === "offL" || l.camAt === "offR" || loc.marks[l.camAt] !== undefined)) fail(`${l.id}: camAt tidak valid`);
    if (l.closeStyle && !editing.camera.closeStyles.includes(l.closeStyle)) fail(`${l.id}: closeStyle "${l.closeStyle}" tidak valid. Pilihan: ${editing.camera.closeStyles.join(", ")}`);
    if (l.fg && !editing.camera.foregrounds.includes(l.fg)) fail(`${l.id}: fg "${l.fg}" tidak valid. Pilihan: ${editing.camera.foregrounds.join(", ")}`);
    if (l.move) {
      const okMark = (m) => m === "offL" || m === "offR" || loc.marks[m] !== undefined;
      if (!sc.cast?.[l.move.who]) fail(`${l.id}: move untuk "${l.move.who}" yang tidak ada di cast`);
      if (!okMark(l.move.to) || (l.move.from && !okMark(l.move.from))) fail(`${l.id}: move mark tidak valid (A–D, offL, offR)`);
    }
    if (l.offscreen && l.shot !== "two") fail(`${l.id}: suara offscreen harus memakai shot "two"`);
    if (l.action && !ACTIONS.includes(l.action)) fail(`${l.id}: action "${l.action}" tidak valid`);
    if (l.cta) {
      const C = editing.shortsCta;
      if (script.format !== "shorts") fail(`${l.id}: "cta" hanya untuk Shorts`);
      if (!C.kinds.includes(l.cta.kind)) fail(`${l.id}: cta.kind harus ${C.kinds.join(" | ")}`);
      if (!l.cta.text || l.cta.text.length > C.maxTextChars) fail(`${l.id}: cta.text wajib, maks ${C.maxTextChars} karakter`);
      if (/subscribe/i.test(l.cta.text + l.text)) fail(`${l.id}: CTA harus netral YouTube + Instagram — pakai like / kirim / ikuti, bukan "subscribe"`);
      if (l.cta.reveal && !canon.characters[l.cta.reveal]) fail(`${l.id}: cta.reveal "${l.cta.reveal}" bukan karakter kanon`);
      ctaCount++;
    }
    for (const [c, r] of Object.entries(l.reactions ?? {})) {
      if (!sc.cast?.[c]) fail(`${l.id}: reaksi untuk "${c}" yang tidak ada di cast`);
      if (!EMOTIONS.includes(r[0]) || (r[1] && !ACTIONS.includes(r[1]))) fail(`${l.id}: reaksi ${c} tidak valid`);
    }
    if (l.shot === "crash") crashes++;
    if (l.caption && !editing.captions.includes(l.caption)) fail(`${l.id}: caption "${l.caption}" tidak diizinkan. Pilihan: ${editing.captions.join(", ")}`);
    for (const s of l.sfx ?? []) if (!sfx.sfx[s.id]) fail(`${l.id}: SFX "${s.id}" tidak ada di sfx.json`);
  }
  if (crashes > editing.maxCrashPerShort) fail(`${sc.id}: crash zoom ${crashes}x, maksimal ${editing.maxCrashPerShort}x per adegan`);
}
for (const [id, s] of Object.entries(sfx.sfx)) {
  const max = id.startsWith("amb_") ? sfx.maxAmbience : sfx.maxVolume;
  if (s.volume > max) fail(`SFX "${id}" volume ${s.volume} melebihi batas ${max} (SFX hanya pelengkap)`);
}

/* ---------------- voice lock ---------------- */
function curlJson(url) {
  const args = ["-sS", "-m", "45", url]; if (apiKey) args.push("-H", `xi-api-key: ${apiKey}`);
  return JSON.parse(execFileSync("curl", args, { maxBuffer: 64 * 1024 * 1024 }).toString());
}
function verifyVoice(id) {
  const v = canon.characters[id].voice;
  if (v.model_id !== LOCKED_MODEL) fail(`${id}: model harus ${LOCKED_MODEL} (terkunci), bukan ${v.model_id}`);
  if (v.source !== "elevenlabs-library") fail(`${id}: hanya voice library/premade yang boleh (bukan kloning pribadi)`);
  // Pengecualian SEKALI PAKAI (izin pemilik): endpoint verifikasi ElevenLabs macet, TTS jalan. voice_id/model/seed tetap dari canon.
  if (process.argv.includes("--skip-voice-verify")) return "verifikasi DILEWATI (izin pemilik, voice_id kanon tetap)";
  const own = curlJson(`https://api.elevenlabs.io/v1/voices/${v.voice_id}`);
  if (own.voice_id === v.voice_id) return "akun";
  const q = encodeURIComponent(v.name_check.split(" - ")[0]);
  const lib = curlJson(`https://api.elevenlabs.io/v1/shared-voices?search=${q}&page_size=100`);
  const hit = (lib.voices ?? []).find((x) => x.voice_id === v.voice_id);
  if (!hit) fail(`VOICE LOCK: suara ${canon.characters[id].name} (${v.voice_id} "${v.name_check}") tidak ditemukan. TIDAK diganti otomatis — periksa akun/API key.`);
  if (hit.name !== v.name_check) fail(`VOICE LOCK: nama voice ${v.voice_id} berubah ("${hit.name}" ≠ "${v.name_check}"). Berhenti demi konsistensi.`);
  return "library publik";
}
const used = [...new Set(script.lines.map((l) => l.speaker))];
const voiceHash = (id) => crypto.createHash("sha256").update(JSON.stringify(canon.characters[id].voice)).digest("hex").slice(0, 16);

/* ---------------- visemes ---------------- */
function charToViseme(c) {
  const ch = c.toLowerCase();
  if (ch === "a") return "A"; if ("iy".includes(ch)) return "I"; if ("uw".includes(ch)) return "U";
  if (ch === "e") return "E"; if (ch === "o") return "O"; if ("mbp".includes(ch)) return "M"; if ("fv".includes(ch)) return "F";
  if ("cjsztdnlrkgqxh".includes(ch)) return "consonant";
  return null;
}
function buildVisemes(a) {
  const out = [];
  for (let i = 0; i < a.characters.length; i++) {
    const v = charToViseme(a.characters[i]);
    const start = a.character_start_times_seconds[i], end = a.character_end_times_seconds[i];
    if (!v) { if (/[.,!?…]/.test(a.characters[i]) && end - start > 0.06) out.push({ t: +start.toFixed(3), v: "rest" }); continue; }
    if (out.length && out[out.length - 1].v === v) continue;
    out.push({ t: +start.toFixed(3), v });
  }
  return out;
}
function buildWords(a) {
  const words = []; let cur = null;
  a.characters.forEach((c, i) => {
    if (c === " ") { if (cur) words.push(cur); cur = null; return; }
    if (!cur) cur = { w: "", t: +a.character_start_times_seconds[i].toFixed(3) };
    cur.w += c;
  });
  if (cur) words.push(cur);
  return words;
}

if (ctaCount > editing.shortsCta.maxPerShorts) fail(`Maksimal ${editing.shortsCta.maxPerShorts} baris CTA per Shorts (ada ${ctaCount})`);
if (script.format === "shorts" && ctaCount === 0) console.warn("⚠ Shorts tanpa baris CTA cerita (\"cta\") — disarankan satu per Shorts.");

const probe = (f) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());
/* ---------------- durasi (editing.json → formats) ---------------- */
const mmss = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, "0")}`;
function durationLimits() {
  const f = editing.formats?.[script.format ?? "long"];
  if (!f) fail(`format "${script.format}" tidak dikenal (pakai "long" atau "shorts")`);
  if (f.legacy?.episodes?.includes(script.episode)) return { minS: script.minSeconds ?? f.legacy.minSeconds, maxS: script.maxSeconds ?? null };
  if (script.minSeconds !== undefined && script.minSeconds < f.minSeconds) fail(`minSeconds naskah (${script.minSeconds}) tidak boleh di bawah kanon ${f.minSeconds} dtk`);
  if (script.maxSeconds !== undefined && f.maxSeconds && script.maxSeconds > f.maxSeconds) fail(`maxSeconds naskah (${script.maxSeconds}) tidak boleh di atas kanon ${f.maxSeconds} dtk`);
  return { minS: script.minSeconds ?? f.minSeconds, maxS: script.maxSeconds ?? f.maxSeconds ?? null };
}

/* ---------------- --estimate: cek durasi & biaya karakter TANPA memanggil ElevenLabs ---------------- */
// Take yang sudah ada dipakai durasi aslinya; baris baru diperkirakan 0,083 dtk/karakter (rata-rata Eps. 1–4).
if (process.argv.includes("--estimate")) {
  const SEC_PER_CHAR = 0.083;
  const dir = path.join(root, "public/audio", script.episode);
  let cur = 0, newChars = 0, newLines = 0, allChars = 0;
  if (script.intro && !script.intro.after) cur += script.intro.seconds ?? 6;
  for (const sc of script.scenes) {
    cur += script.sceneLead ?? script.leadIn ?? 0.6;
    for (const l of sc.lines) {
      allChars += (l.say ?? l.text).length;
      const h = crypto.createHash("sha256").update(l.text + "|" + voiceHash(l.speaker)).digest("hex").slice(0, 16);
      const mp3 = path.join(dir, `${l.id}.mp3`), meta = path.join(dir, `${l.id}.json`);
      const ok = fs.existsSync(mp3) && fs.existsSync(meta) && JSON.parse(fs.readFileSync(meta, "utf8")).hash === h;
      if (!ok) { newChars += (l.say ?? l.text).length; newLines++; }
      cur += (ok ? probe(mp3) : l.text.length * SEC_PER_CHAR) + (l.surprise ? 0.15 : l.gapAfter ?? script.gapSeconds);
    }
    cur += script.sceneGap ?? 0;
    if (script.intro?.after === sc.id) cur += script.intro.seconds ?? 6;
  }
  cur += script.tail ?? 2.5;
  const { minS, maxS } = durationLimits();
  const lines = script.lines.length;
  console.log(`≈ ${script.episode}: ${script.scenes.length} adegan, ${lines} baris, ${allChars} karakter → perkiraan durasi ${mmss(cur)} (${cur.toFixed(0)} dtk)`);
  console.log(`  Batas: ${mmss(minS)}${maxS ? `–${mmss(maxS)}` : "+"}  ·  baris perlu take baru: ${newLines}  ·  karakter ElevenLabs yang akan dipakai: ${newChars}`);
  if (cur < minS || (maxS && cur > maxS)) fail(`Perkiraan durasi ${mmss(cur)} di luar batas ${mmss(minS)}${maxS ? `–${mmss(maxS)}` : "+"} — sesuaikan naskah sebelum generate suara.`);
  console.log("✓ perkiraan durasi dalam batas (ElevenLabs tidak dipanggil)");
  process.exit(0);
}

/* ---------------- TTS ---------------- */
const audioDir = path.join(root, "public/audio", script.episode);
fs.mkdirSync(audioDir, { recursive: true });
function tts(line) {
  const v = canon.characters[line.speaker].voice;
  const hash = crypto.createHash("sha256").update(line.text + "|" + voiceHash(line.speaker)).digest("hex").slice(0, 16);
  const mp3 = path.join(audioDir, `${line.id}.mp3`), meta = path.join(audioDir, `${line.id}.json`);
  if (!force && fs.existsSync(mp3) && fs.existsSync(meta)) {
    const m = JSON.parse(fs.readFileSync(meta, "utf8"));
    if (m.hash === hash) return { ...m, reused: true };
  }
  const body = JSON.stringify({ text: line.text, model_id: v.model_id, language_code: v.language_code, seed: v.seed, voice_settings: v.settings });
  const args = ["-sS", "-X", "POST", "-w", "\n%{http_code}",
    `https://api.elevenlabs.io/v1/text-to-speech/${v.voice_id}/with-timestamps?output_format=mp3_44100_128`,
    "-H", "Content-Type: application/json", "--data-binary", "@-"];
  if (apiKey) args.push("-H", `xi-api-key: ${apiKey}`);
  const raw = execFileSync("curl", args, { input: body, maxBuffer: 64 * 1024 * 1024 }).toString();
  const nl = raw.lastIndexOf("\n"), status = raw.slice(nl + 1).trim();
  if (status !== "200") fail(`ElevenLabs ${status}: ${raw.slice(0, nl).slice(0, 400)}`);
  const data = JSON.parse(raw.slice(0, nl));
  fs.writeFileSync(mp3, Buffer.from(data.audio_base64, "base64"));
  const m = { hash, voice_id: v.voice_id, model_id: v.model_id, seed: v.seed, alignment: data.normalized_alignment || data.alignment };
  fs.writeFileSync(meta, JSON.stringify(m));
  return m;
}


/* ---------------- mode dialog (ElevenLabs Text to Dialogue, eleven_v4) ---------------- */
// "voiceMode": "dialogue" di naskah. Baris boleh punya "say" = text + tag nada ElevenLabs dalam [kurung siku] (mis. "[sighs] Iya, iya.").
// Tag TIDAK tampil di subtitle dan tidak dihitung lip-sync. Tanpa "say", text dipakai apa adanya.
const DIALOGUE = script.voiceMode === "dialogue";
const TAG = /\[[^\]]*\]/g;
const say = (l) => l.say ?? l.text;
const clean = (x) => x.replace(TAG, " ").replace(/\s+/g, " ").trim();
if (DIALOGUE) {
  if (!canon.dialogue) fail("canon.json belum punya blok \"dialogue\" (model/seed/settings terkunci untuk mode dialog)");
  if (canon.dialogue.model_id !== LOCKED_MODEL) fail(`dialogue.model_id harus ${LOCKED_MODEL}`);
  for (const l of script.lines) {
    if (l.say !== undefined && clean(l.say) !== clean(l.text)) fail(`${l.id}: "say" tanpa tag harus sama persis dengan "text" (subtitle). say="${clean(l.say)}" text="${clean(l.text)}"`);
    if (TAG.test(l.text)) fail(`${l.id}: tag [..] hanya boleh di "say", bukan di "text" (subtitle)`);
  }
}
const MAX_CHUNK = 1800;
function chunksOf(lines) {
  const out = []; let cur = [], n = 0;
  for (const l of lines) { const k = say(l).length; if (cur.length && n + k > MAX_CHUNK) { out.push(cur); cur = []; n = 0; } cur.push(l); n += k; }
  if (cur.length) out.push(cur);
  return out;
}
const dlgDir = () => path.join(audioDir, "_dialogue");
function dialogueBody(chunk) {
  const D = canon.dialogue;
  return { inputs: chunk.map((l) => ({ text: say(l), voice_id: canon.characters[l.speaker].voice.voice_id })), model_id: D.model_id, language_code: D.language_code, seed: D.seed, settings: D.settings };
}
const chunkHash = (chunk) => crypto.createHash("sha256").update(JSON.stringify(dialogueBody(chunk)) + "|" + chunk.map((l) => voiceHash(l.speaker)).join(",")).digest("hex").slice(0, 16);
const needsDialogue = (chunk) => force || !fs.existsSync(path.join(dlgDir(), `${chunkHash(chunk)}.json`));
function dialogueTake(sc, chunk) {
  fs.mkdirSync(dlgDir(), { recursive: true });
  const h = chunkHash(chunk), mp3 = path.join(dlgDir(), `${h}.mp3`), meta = path.join(dlgDir(), `${h}.json`);
  let data, reused = false;
  if (!force && fs.existsSync(mp3) && fs.existsSync(meta)) { data = JSON.parse(fs.readFileSync(meta, "utf8")); reused = true; }
  else {
    const args = ["-sS", "-X", "POST", "-w", "\n%{http_code}", "https://api.elevenlabs.io/v1/text-to-dialogue/with-timestamps?output_format=mp3_44100_128",
      "-H", "Content-Type: application/json", "--data-binary", "@-"];
    if (apiKey) args.push("-H", `xi-api-key: ${apiKey}`);
    const raw = execFileSync("curl", args, { input: JSON.stringify(dialogueBody(chunk)), maxBuffer: 256 * 1024 * 1024 }).toString();
    const nl = raw.lastIndexOf("\n"), status = raw.slice(nl + 1).trim();
    if (status !== "200") fail(`ElevenLabs dialog ${status}: ${raw.slice(0, nl).slice(0, 400)}`);
    const d = JSON.parse(raw.slice(0, nl));
    fs.writeFileSync(mp3, Buffer.from(d.audio_base64, "base64"));
    data = { hash: h, model_id: canon.dialogue.model_id, seed: canon.dialogue.seed, alignment: d.alignment, voice_segments: d.voice_segments };
    fs.writeFileSync(meta, JSON.stringify(data));
  }
  const total = probe(mp3);
  const A = data.alignment;
  // posisi karakter yang berada di dalam tag [..] (tidak diucapkan)
  const inTag = []; let depth = 0;
  A.characters.forEach((c, i) => { if (c === "[") depth++; inTag[i] = depth > 0; if (c === "]") depth = Math.max(0, depth - 1); });
  // tag yang BERBUNYI (desah, tawa, dengus: rentang > 0,2 dtk) ikut dipertahankan di potongan audio; tag arahan nada (≈0 dtk) tidak
  const audible = [];
  for (let i = 0; i < A.characters.length; i++) if (A.characters[i] === "[") {
    let j = i; while (j < A.characters.length && A.characters[j] !== "]") j++;
    const loud = A.character_end_times_seconds[Math.min(j, A.characters.length - 1)] - A.character_start_times_seconds[i] > 0.2;
    for (let k = i; k <= j && k < A.characters.length; k++) audible[k] = loud;
    i = j;
  }
  const cuts = chunk.map((l, i) => {
    const segs = data.voice_segments.filter((s) => s.dialogue_input_index === i);
    if (!segs.length) fail(`${l.id}: ElevenLabs tidak mengembalikan segmen untuk baris ini`);
    const c0 = Math.min(...segs.map((s) => s.character_start_index)), c1 = Math.max(...segs.map((s) => s.character_end_index));
    const idx = []; for (let k = c0; k < c1; k++) if ((!inTag[k] || audible[k]) && /\S/.test(A.characters[k])) idx.push(k);
    const segStart = Math.min(...segs.map((s) => s.start_time_seconds)), segEnd = Math.max(...segs.map((s) => s.end_time_seconds));
    const s0 = idx.length ? A.character_start_times_seconds[idx[0]] : segStart;
    const s1 = idx.length ? A.character_end_times_seconds[idx[idx.length - 1]] : segEnd;
    const from = Math.max(segStart, s0 - 0.06), to = Math.min(total, segEnd, Math.max(s1 + 0.15, from + 0.3)); // tidak melewati batas segmen (tanpa gema baris berikutnya)
    // potong baris dari take dialog → public/audio/<ep>/<line>.mp3 (pipeline render tetap per baris)
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", mp3, "-ss", from.toFixed(3), "-to", to.toFixed(3), "-c:a", "libmp3lame", "-b:a", "128k", path.join(audioDir, `${l.id}.mp3`)]);
    const keep = []; for (let k = c0; k < c1; k++) if (!inTag[k]) keep.push(k);
    const align = { characters: keep.map((k) => A.characters[k]), character_start_times_seconds: keep.map((k) => Math.max(0, A.character_start_times_seconds[k] - from)), character_end_times_seconds: keep.map((k) => Math.max(0, A.character_end_times_seconds[k] - from)) };
    // rapikan spasi ganda bekas tag di awal
    while (align.characters.length && align.characters[0] === " ") { align.characters.shift(); align.character_start_times_seconds.shift(); align.character_end_times_seconds.shift(); }
    fs.writeFileSync(path.join(audioDir, `${l.id}.json`), JSON.stringify({ hash: h, dialogue: true, voice_id: canon.characters[l.speaker].voice.voice_id, model_id: canon.dialogue.model_id, seed: canon.dialogue.seed, alignment: align }));
    return { from, dur: to - from, align };
  });
  return { total, cuts, reused };
}

/* ---------------- run ---------------- */
// Only verify voices that actually need a new take.
const timeline = { episode: script.episode, title: script.title, fps: script.fps, scenes: [], lines: [], totalSeconds: 0 };
let cursor = 0;
// Intro resmi: SELALU di awal episode (video panjang). Gaya D = 6 dtk.
const introSec = (st) => script.intro?.seconds ?? (st === "A" ? 10 : 6);
if (script.intro && !script.intro.after) { const st = script.intro.style ?? "D"; timeline.intro = { start: 0, style: st, seconds: introSec(st) }; cursor = timeline.intro.seconds; }
const verified = new Set();
const lineHash = (l) => crypto.createHash("sha256").update(l.text + "|" + voiceHash(l.speaker)).digest("hex").slice(0, 16);
if (DIALOGUE) {
  // Mode dialog (pemilik 22 Nov 2026): satu adegan = satu generate ElevenLabs Text to Dialogue (eleven_v4), suara kanon yang sama.
  // Model mendengar seluruh percakapan → intonasi, jeda, dan emosi antar-baris natural. Hasil dipotong per baris (voice_segments).
  const D = canon.dialogue;
  for (const sc of script.scenes) {
    const scStart = cursor;
    cursor += script.sceneLead ?? script.leadIn ?? 0.6;
    for (const chunk of chunksOf(sc.lines)) {
      for (const l of chunk) if (!verified.has(l.speaker) && needsDialogue(chunk)) { const where = verifyVoice(l.speaker); console.log(`🔒 Suara ${canon.characters[l.speaker].name} terverifikasi (${canon.characters[l.speaker].voice.name_check}, ${where})`); verified.add(l.speaker); }
      const r = dialogueTake(sc, chunk);
      const chunkStart = cursor;
      chunk.forEach((raw, i) => {
        const line = { ...raw, scene: sc.id };
        const cut = r.cuts[i];
        console.log(`${r.reused ? "♻ " : "🎭 "} ${line.id} ${canon.characters[line.speaker].name}: ${say(line)}`);
        timeline.lines.push({ ...line, audio: `audio/${script.episode}/${line.id}.mp3`, start: +(chunkStart + cut.from).toFixed(3), duration: +cut.dur.toFixed(3),
          visemes: buildVisemes(cut.align), words: buildWords(cut.align) });
      });
      cursor = chunkStart + r.total + (script.gapSeconds ?? 0.2);
    }
    cursor += script.sceneGap ?? 0;
    timeline.scenes.push({ id: sc.id, location: sc.location, cast: sc.cast, ...(sc.extras ? { extras: sc.extras } : {}), ...(sc.wear ? { wear: sc.wear } : {}), ...(sc.bag !== undefined ? { bag: sc.bag } : {}), ...(sc.hold ? { hold: sc.hold } : {}), ...(sc.tracks ? { tracks: sc.tracks } : {}), ...(sc.flagInverted ? { flagInverted: true } : {}), ...(sc.hat !== undefined ? { hat: sc.hat } : {}), ...(sc.music ? { music: sc.music } : {}), ...(sc.amb ? { amb: sc.amb } : {}), start: +scStart.toFixed(3), end: +cursor.toFixed(3) });
  }
} else {
  for (const sc of script.scenes) {
    const scStart = cursor;
    cursor += script.sceneLead ?? script.leadIn ?? 0.6;
    for (const raw of sc.lines) {
      const line = { ...raw, scene: sc.id };
      const ch = canon.characters[line.speaker];
      const metaPath = path.join(audioDir, `${line.id}.json`);
      const needsNew = force || !fs.existsSync(metaPath) || JSON.parse(fs.readFileSync(metaPath, "utf8")).hash !== lineHash(line);
      if (needsNew && !verified.has(line.speaker)) {
        const where = verifyVoice(line.speaker);
        console.log(`🔒 Suara ${ch.name} terverifikasi (${ch.voice.name_check}, ${where})`);
        verified.add(line.speaker);
      }
      const m = tts(line);
      const duration = probe(path.join(audioDir, `${line.id}.mp3`));
      console.log(`${m.reused ? "♻ " : "🎙 "} ${line.id} ${ch.name}: ${line.text}`);
      timeline.lines.push({
        ...line, audio: `audio/${script.episode}/${line.id}.mp3`, start: +cursor.toFixed(3), duration: +duration.toFixed(3),
        visemes: buildVisemes(m.alignment), words: buildWords(m.alignment),
      });
      cursor += duration + (line.surprise ? 0.15 : line.gapAfter ?? script.gapSeconds);
    }
    cursor += script.sceneGap ?? 0;
    if (script.intro && script.intro.after === sc.id) { timeline.intro = { start: +cursor.toFixed(3), style: script.intro.style ?? "D", seconds: introSec(script.intro.style ?? "D") }; cursor += timeline.intro.seconds; }
    timeline.scenes.push({ id: sc.id, location: sc.location, cast: sc.cast, ...(sc.extras ? { extras: sc.extras } : {}), ...(sc.wear ? { wear: sc.wear } : {}), ...(sc.bag !== undefined ? { bag: sc.bag } : {}), ...(sc.hold ? { hold: sc.hold } : {}), ...(sc.tracks ? { tracks: sc.tracks } : {}), ...(sc.flagInverted ? { flagInverted: true } : {}), ...(sc.hat !== undefined ? { hat: sc.hat } : {}), ...(sc.music ? { music: sc.music } : {}), ...(sc.amb ? { amb: sc.amb } : {}), start: +scStart.toFixed(3), end: +cursor.toFixed(3) });
  }
}
timeline.scenes[timeline.scenes.length - 1].end = +(cursor + (script.tail ?? 2.5)).toFixed(3);
timeline.totalSeconds = timeline.scenes[timeline.scenes.length - 1].end;
// Duration rules (editing.json → formats). Pemilik 20 Nov 2026: Long = 8:00–10:59 (480–659 dtk termasuk intro).
// minSeconds/maxSeconds per naskah hanya boleh MEMPERKETAT. Episode lama (legacy) tetap aturan lama.
const fmt = editing.formats?.[script.format ?? "long"];
if (!fmt) fail(`format "${script.format}" tidak dikenal (pakai "long" atau "shorts")`);
if (script.intro) { const ids = script.scenes.map((x) => x.id); if ((script.format ?? "long") !== "long") fail("intro hanya untuk video panjang (format long)"); if (script.intro.after !== undefined && (!ids.includes(script.intro.after) || script.intro.after === ids[ids.length - 1])) fail(`intro.after "${script.intro.after}" harus id adegan yang bukan adegan terakhir`); }
const { minS, maxS } = durationLimits();
if (timeline.totalSeconds < minS) fail(`Durasi ${mmss(timeline.totalSeconds)} (${timeline.totalSeconds.toFixed(1)} dtk) < minimum ${mmss(minS)} untuk ${script.format ?? "long"} (${fmt.aspect}). Tambah adegan/dialog.`);
if (maxS && timeline.totalSeconds > maxS) fail(`Durasi ${mmss(timeline.totalSeconds)} (${timeline.totalSeconds.toFixed(1)} dtk) > maksimum ${mmss(maxS)} untuk ${script.format ?? "long"} (${fmt.aspect}). Pangkas dialog.`);
timeline.format = script.format ?? "long";
// Subtitle bisa dimatikan per naskah (mis. Shorts tanpa teks): "subtitles": false
if (script.subtitles === false) timeline.subtitles = false;
// Teks hook Shorts (pemilik 20 Nov 2026, editing.json → shortsHook): 1–2 baris besar di 1–2 detik pertama.
if (script.hook) {
  const H = editing.shortsHook;
  if (script.format !== "shorts") fail('"hook" hanya untuk Shorts');
  const lines = script.hook.lines ?? [];
  if (!lines.length || lines.length > H.maxLines) fail(`hook.lines wajib 1–${H.maxLines} baris`);
  for (const ln of lines) if (ln.length > H.maxLineChars) fail(`hook "${ln}" terlalu panjang (maks ${H.maxLineChars} karakter per baris)`);
  if (/subscribe|\brp\b|episode|eps\.?\s*\d/i.test(lines.join(" "))) fail("hook tidak boleh memuat subscribe, uang/Rp, atau nomor episode");
  const sec = script.hook.seconds ?? H.seconds;
  if (sec < H.minSeconds || sec > H.maxSeconds) fail(`hook.seconds harus ${H.minSeconds}–${H.maxSeconds} dtk`);
  timeline.hook = { lines, keywords: script.hook.keywords ?? [], seconds: sec };
} else if (script.format === "shorts") console.warn("⚠ Shorts tanpa teks hook (\"hook\") — wajib untuk Shorts baru (aturan pemilik 20 Nov 2026).");
fs.writeFileSync(path.join(root, "src/data/timeline.json"), JSON.stringify(timeline));
const mm = Math.floor(timeline.totalSeconds / 60), ss = Math.round(timeline.totalSeconds % 60);
console.log(`✅ timeline.json — ${script.episode}: ${timeline.scenes.length} adegan, ${timeline.lines.length} baris, ${mm}:${String(ss).padStart(2, "0")} menit, suara terkunci ✓`);
