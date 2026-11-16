// Generate voice-over per dialogue line with ElevenLabs (with character timestamps)
// and convert timestamps into a viseme track for lip-sync.
//
// Usage: node scripts/generate-voice.mjs [--force]
// API key: read from ELEVENLABS_API_KEY. (In Claude Code cloud the proxy injects it.)
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = JSON.parse(fs.readFileSync(path.join(root, "src/data/script.json"), "utf8"));
// Voices are locked in the character canon so every episode sounds the same.
const canon = JSON.parse(fs.readFileSync(path.join(root, "src/characters/canon.json"), "utf8"));
for (const id of Object.keys(script.characters)) {
  if (!canon.characters[id]) throw new Error(`Karakter "${id}" tidak ada di canon.json`);
  script.characters[id] = { name: canon.characters[id].name, ...canon.characters[id].voice };
}
const audioDir = path.join(root, "public/audio");
const cacheDir = path.join(root, "scripts/.cache");
fs.mkdirSync(audioDir, { recursive: true });
fs.mkdirSync(cacheDir, { recursive: true });
const force = process.argv.includes("--force");
const apiKey = process.env.ELEVENLABS_API_KEY; // optional when a proxy injects auth

// --- Character -> viseme (mouth shape) ---------------------------------------
// Shapes: rest, A, I, U, E, O, M (closed lips: m/b/p), F (f/v: lip on teeth)
function charToViseme(c) {
  const ch = c.toLowerCase();
  if ("a".includes(ch)) return "A";
  if ("iy".includes(ch)) return "I";
  if ("uw".includes(ch)) return "U";
  if ("e".includes(ch)) return "E";
  if ("o".includes(ch)) return "O";
  if ("mbp".includes(ch)) return "M";
  if ("fv".includes(ch)) return "F";
  if ("cjsztdnlrkgqxh".includes(ch)) return "E_SMALL"; // consonants: slightly open
  return null; // spaces / punctuation
}

function buildVisemes(alignment, offset = 0) {
  const { characters, character_start_times_seconds: st, character_end_times_seconds: et } = alignment;
  const out = [];
  for (let i = 0; i < characters.length; i++) {
    const v = charToViseme(characters[i]);
    const start = st[i] + offset, end = et[i] + offset;
    if (!v) {
      // Close mouth only on real pauses (punctuation / long gaps)
      if (/[.,!?…]/.test(characters[i]) && end - start > 0.06) out.push({ t: start, v: "rest" });
      continue;
    }
    // Consonants take the previous vowel shape slightly closed -> natural coarticulation
    const shape = v === "E_SMALL" ? "consonant" : v;
    const prev = out[out.length - 1];
    if (prev && prev.v === shape) continue;
    out.push({ t: start, v: shape });
  }
  return out;
}

async function tts(line) {
  const ch = script.characters[line.speaker];
  const key = `${line.id}-${ch.voice_id}-${ch.model_id}-${Buffer.from(line.text).toString("base64url").slice(0, 40)}`;
  const cacheFile = path.join(cacheDir, `${key}.json`);
  if (!force && fs.existsSync(cacheFile)) return JSON.parse(fs.readFileSync(cacheFile, "utf8"));

  // curl is used (not fetch) so system HTTPS proxy settings are always honoured.
  const body = JSON.stringify({
    text: line.text,
    model_id: ch.model_id,
    language_code: "id",
    voice_settings: ch.settings,
  });
  const args = [
    "-sS", "-X", "POST", "-w", "\n%{http_code}",
    `https://api.elevenlabs.io/v1/text-to-speech/${ch.voice_id}/with-timestamps?output_format=mp3_44100_128`,
    "-H", "Content-Type: application/json", "--data-binary", "@-",
  ];
  if (apiKey) args.push("-H", `xi-api-key: ${apiKey}`);
  const raw = execFileSync("curl", args, { input: body, maxBuffer: 64 * 1024 * 1024 }).toString();
  const nl = raw.lastIndexOf("\n");
  const status = raw.slice(nl + 1).trim();
  if (status !== "200") throw new Error(`ElevenLabs ${status}: ${raw.slice(0, nl).slice(0, 500)}`);
  const data = JSON.parse(raw.slice(0, nl));
  fs.writeFileSync(cacheFile, JSON.stringify(data));
  return data;
}

function probeDuration(file) {
  return parseFloat(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString(),
  );
}

const timeline = { fps: script.fps, lines: [], totalSeconds: 0 };
let cursor = 2.2; // establishing shot + title card before first line
for (const line of script.lines) {
  process.stdout.write(`🎙  ${line.id} ${script.characters[line.speaker].name}: ${line.text}\n`);
  const data = await tts(line);
  const file = path.join(audioDir, `${line.id}.mp3`);
  fs.writeFileSync(file, Buffer.from(data.audio_base64, "base64"));
  const duration = probeDuration(file);
  const align = data.normalized_alignment || data.alignment;
  timeline.lines.push({
    ...line,
    audio: `audio/${line.id}.mp3`,
    start: +cursor.toFixed(3),
    duration: +duration.toFixed(3),
    visemes: buildVisemes(align).map((x) => ({ t: +x.t.toFixed(3), v: x.v })),
    words: buildWords(align),
  });
  cursor += duration + (line.surprise ? 0.15 : script.gapSeconds);
}
timeline.totalSeconds = +(cursor + 3.2).toFixed(3); // tail: final reaction + end card
fs.writeFileSync(path.join(root, "src/data/timeline.json"), JSON.stringify(timeline));
console.log(`✅ timeline.json written — ${timeline.lines.length} lines, ${timeline.totalSeconds}s`);

function buildWords(a) {
  const words = [];
  let cur = null;
  a.characters.forEach((c, i) => {
    if (c === " ") { if (cur) words.push(cur); cur = null; return; }
    if (!cur) cur = { w: "", t: +a.character_start_times_seconds[i].toFixed(3) };
    cur.w += c;
  });
  if (cur) words.push(cur);
  return words;
}
