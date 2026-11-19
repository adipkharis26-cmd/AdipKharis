// Lapisan suara suasana (bed): membuat file yang belum ada dari src/audio/beds.json lewat ElevenLabs
// (ambience = Sound Effects, musik = Music), lalu menormalkan loudness dan membuat loop mulus (crossfade 1 dtk).
//   node scripts/generate-beds.mjs [id ...] [--force]
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const lib = JSON.parse(fs.readFileSync("src/audio/beds.json", "utf8"));
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const force = process.argv.includes("--force");
fs.mkdirSync("public/beds", { recursive: true });
const key = process.env.ELEVENLABS_API_KEY ? ["-H", `xi-api-key: ${process.env.ELEVENLABS_API_KEY}`] : [];
const sleep = (s) => execFileSync("sleep", [String(s)]);
for (const [id, b] of Object.entries(lib.beds)) {
  if (only.length && !only.includes(id)) continue;
  const out = `public/beds/${id}.mp3`, raw = `/tmp/bed-${id}.mp3`;
  const healthy = fs.existsSync(out) && fs.statSync(out).size > 10000;
  if (healthy && !force) continue;
  const music = b.kind === "music";
  const url = music ? "https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128" : "https://api.elevenlabs.io/v1/sound-generation";
  const body = music ? { prompt: b.prompt, music_length_ms: b.duration * 1000, force_instrumental: true } : { text: b.prompt, duration_seconds: b.duration, prompt_influence: 0.5 };
  let ok = fs.existsSync(raw) && fs.statSync(raw).size > 10000 && !force; // bahan mentah sudah ada → cukup proses ulang
  for (let i = 1; i <= 6 && !ok; i++) {
    try {
      const code = execFileSync("curl", ["-sS", "-m", music ? "180" : "90", "-X", "POST", url, "-H", "Content-Type: application/json", ...key, "--data-binary", "@-", "-o", raw, "-w", "%{http_code}"],
        { input: JSON.stringify(body) }).toString();
      ok = code === "200";
    } catch { ok = false; }
    if (!ok) sleep(i * 5);
  }
  if (!ok) { console.error(`✗ ${id}: gagal dibuat`); continue; }
  const L = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", raw]).toString());
  const lufs = music ? -27 : -30;
  // loop mulus: badan A[1..L] dengan 1 dtk terakhir di-crossfade ke A[0..1] (dua input terpisah; asplit membuat keluaran kosong)
  const bodyWav = `/tmp/bed-${id}-body.wav`, headWav = `/tmp/bed-${id}-head.wav`;
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-af", "atrim=start=1,asetpts=PTS-STARTPTS", "-ac", "2", "-ar", "44100", bodyWav]);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-af", "atrim=end=1,asetpts=PTS-STARTPTS", "-ac", "2", "-ar", "44100", headWav]);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", bodyWav, "-i", headWav, "-filter_complex",
    `[0:a][1:a]acrossfade=d=1:c1=tri:c2=tri,loudnorm=I=${lufs}:TP=-3:LRA=11[o]`, "-map", "[o]", "-ar", "44100", "-b:a", "128k", out]);
  if (fs.statSync(out).size < 10000) { console.error(`✗ ${id}: hasil loop kosong`); continue; }
  console.log(`🔊 ${id} (${b.kind}, ${(L - 1).toFixed(1)} dtk loop, ${lufs} LUFS)`);
}
// durasi loop nyata tiap file (dipakai renderer untuk menyambung loop)
const dur = {};
for (const f of fs.readdirSync("public/beds").filter((x) => x.endsWith(".mp3")).sort())
  dur[f.replace(/\.mp3$/, "")] = +parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", `public/beds/${f}`]).toString()).toFixed(3);
fs.writeFileSync("src/audio/beds-durations.json", JSON.stringify(dur, null, 2) + "\n");
console.log("✅ beds selesai");
