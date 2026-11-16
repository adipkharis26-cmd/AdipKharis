// Voice-over generator with LOCKED voices.
//   node scripts/generate-voice.mjs [--force]
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
const script = read("src/data/script.json");
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
const SHOTS = ["two", "speaker", "push", "crash"];
if (!script.episode) fail("script.json butuh field \"episode\" (mis. \"eps01\")");
if (!locations.locations[script.location]) fail(`Lokasi "${script.location}" tidak ada di locations.json`);
for (const [id, c] of Object.entries(script.cast ?? {})) {
  if (!canon.characters[id]) fail(`cast: karakter "${id}" tidak ada di canon.json`);
  if (!locations.locations[script.location].marks[c.mark]) fail(`cast: mark "${c.mark}" tidak ada di lokasi ${script.location}`);
}
let crashes = 0;
for (const l of script.lines) {
  if (!canon.characters[l.speaker]) fail(`${l.id}: karakter "${l.speaker}" tidak ada di canon.json`);
  if (!script.cast?.[l.speaker]) fail(`${l.id}: "${l.speaker}" belum ditempatkan di "cast"`);
  if (!EMOTIONS.includes(l.emotion) || !EMOTIONS.includes(l.listener)) fail(`${l.id}: emosi tidak valid`);
  if (!SHOTS.includes(l.shot)) fail(`${l.id}: shot "${l.shot}" tidak valid`);
  if (l.shot === "crash") crashes++;
  if (l.caption && !editing.captions.includes(l.caption)) fail(`${l.id}: caption "${l.caption}" tidak diizinkan. Pilihan: ${editing.captions.join(", ")}`);
  for (const s of l.sfx ?? []) if (!sfx.sfx[s.id]) fail(`${l.id}: SFX "${s.id}" tidak ada di sfx.json`);
  if (l.listenerId && !canon.characters[l.listenerId]) fail(`${l.id}: listenerId tidak dikenal`);
}
if (crashes > editing.maxCrashPerShort) fail(`Crash zoom dipakai ${crashes}x, maksimal ${editing.maxCrashPerShort}x`);

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
const timeline = { episode: script.episode, location: script.location, cast: script.cast, fps: script.fps, lines: [], totalSeconds: 0 };
let cursor = script.leadIn ?? 0.6;
const verified = new Set();
for (const line of script.lines) {
  const ch = canon.characters[line.speaker];
  const metaPath = path.join(audioDir, `${line.id}.json`);
  const needsNew = force || !fs.existsSync(metaPath) ||
    JSON.parse(fs.readFileSync(metaPath, "utf8")).hash !== crypto.createHash("sha256").update(line.text + "|" + voiceHash(line.speaker)).digest("hex").slice(0, 16);
  if (needsNew && !verified.has(line.speaker)) {
    const where = verifyVoice(line.speaker);
    console.log(`🔒 Suara ${ch.name} terverifikasi (${ch.voice.name_check}, ${where})`);
    verified.add(line.speaker);
  }
  const m = tts(line);
  const file = path.join(audioDir, `${line.id}.mp3`);
  const duration = probe(file);
  console.log(`${m.reused ? "♻ " : "🎙 "} ${line.id} ${ch.name}: ${line.text}`);
  timeline.lines.push({
    ...line, audio: `audio/${script.episode}/${line.id}.mp3`, start: +cursor.toFixed(3), duration: +duration.toFixed(3),
    visemes: buildVisemes(m.alignment), words: buildWords(m.alignment),
  });
  cursor += duration + (line.surprise ? 0.15 : line.gapAfter ?? script.gapSeconds);
}
timeline.totalSeconds = +(cursor + (script.tail ?? 2.5)).toFixed(3);
fs.writeFileSync(path.join(root, "src/data/timeline.json"), JSON.stringify(timeline));
console.log(`✅ timeline.json — ${timeline.lines.length} baris, ${timeline.totalSeconds}s, suara terkunci ✓`);
