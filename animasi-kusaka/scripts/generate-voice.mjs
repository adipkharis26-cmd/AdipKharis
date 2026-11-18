// Voice-over generator with LOCKED voices.
//   node scripts/generate-voice.mjs [src/data/episodes/eps01.json] [--force]
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
const force = process.argv.includes("--force");
const apiKey = process.env.ELEVENLABS_API_KEY; // optional when a proxy injects auth
const LOCKED_MODEL = "eleven_v4";

const fail = (msg) => { console.error(`✗ ${msg}`); process.exit(1); };

/* ---------------- validation (consistency rules) ---------------- */
const EMOTIONS = ["neutral", "smug", "suspicious", "shock", "laugh", "pleading", "deadpan", "surprised", "embarrassed", "defeated"];
const SHOTS = editing.camera.shots;
if (!script.episode) fail("script.json butuh field \"episode\" (mis. \"eps01\")");
const ACTIONS = ["idle","gesture","pocket","chin","point","plead","crossed","shock","laugh","slump","wave","thumbsup","peace","facepalm","hips","phone"];
for (const sc of script.scenes) {
  const loc = locations.locations[sc.location];
  if (!loc) fail(`${sc.id}: lokasi "${sc.location}" tidak ada di locations.json`);
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
  const args = ["-sS", url]; if (apiKey) args.push("-H", `xi-api-key: ${apiKey}`);
  return JSON.parse(execFileSync("curl", args).toString());
}
function verifyVoice(id) {
  const v = canon.characters[id].voice;
  if (v.model_id !== LOCKED_MODEL) fail(`${id}: model harus ${LOCKED_MODEL} (terkunci), bukan ${v.model_id}`);
  if (v.source !== "elevenlabs-library") fail(`${id}: hanya voice library/premade yang boleh (bukan kloning pribadi)`);
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
const probe = (f) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

/* ---------------- run ---------------- */
// Only verify voices that actually need a new take.
const timeline = { episode: script.episode, title: script.title, fps: script.fps, scenes: [], lines: [], totalSeconds: 0 };
let cursor = 0;
const verified = new Set();
const lineHash = (l) => crypto.createHash("sha256").update(l.text + "|" + voiceHash(l.speaker)).digest("hex").slice(0, 16);
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
  timeline.scenes.push({ id: sc.id, location: sc.location, cast: sc.cast, ...(sc.extras ? { extras: sc.extras } : {}), start: +scStart.toFixed(3), end: +cursor.toFixed(3) });
}
timeline.scenes[timeline.scenes.length - 1].end = +(cursor + (script.tail ?? 2.5)).toFixed(3);
timeline.totalSeconds = timeline.scenes[timeline.scenes.length - 1].end;
// Duration rules (editing.json → formats). Owner may override the minimum per episode with "minSeconds".
const fmt = editing.formats?.[script.format ?? "long"];
if (!fmt) fail(`format "${script.format}" tidak dikenal (pakai "long" atau "shorts")`);
const minS = script.minSeconds ?? fmt.minSeconds;
if (timeline.totalSeconds < minS) fail(`Durasi ${timeline.totalSeconds.toFixed(1)} dtk < minimum ${minS} dtk untuk ${script.format ?? "long"} (${fmt.aspect}). Tambah adegan/dialog.`);
if (fmt.maxSeconds && timeline.totalSeconds > fmt.maxSeconds) fail(`Durasi ${timeline.totalSeconds.toFixed(1)} dtk > maksimum ${fmt.maxSeconds} dtk untuk Shorts.`);
timeline.format = script.format ?? "long";
// Subtitle bisa dimatikan per naskah (mis. Shorts tanpa teks): "subtitles": false
if (script.subtitles === false) timeline.subtitles = false;
fs.writeFileSync(path.join(root, "src/data/timeline.json"), JSON.stringify(timeline));
const mm = Math.floor(timeline.totalSeconds / 60), ss = Math.round(timeline.totalSeconds % 60);
console.log(`✅ timeline.json — ${script.episode}: ${timeline.scenes.length} adegan, ${timeline.lines.length} baris, ${mm}:${String(ss).padStart(2, "0")} menit, suara terkunci ✓`);
