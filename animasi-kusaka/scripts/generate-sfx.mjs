// Generate every SFX listed in src/audio/sfx.json that is missing (ElevenLabs Sound Effects).
// node scripts/generate-sfx.mjs [--force id]
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const lib = JSON.parse(fs.readFileSync("src/audio/sfx.json", "utf8"));
const force = process.argv.includes("--force") ? process.argv[process.argv.indexOf("--force") + 1] : null;
fs.mkdirSync("public/sfx", { recursive: true });
for (const [id, s] of Object.entries(lib.sfx)) {
  const out = `public/sfx/${id}.mp3`;
  if (fs.existsSync(out) && force !== id) continue;
  const args = ["-sSf", "-X", "POST", "https://api.elevenlabs.io/v1/sound-generation", "-H", "Content-Type: application/json",
    "--data-binary", "@-", "-o", out];
  if (process.env.ELEVENLABS_API_KEY) args.push("-H", `xi-api-key: ${process.env.ELEVENLABS_API_KEY}`);
  execFileSync("curl", args, { input: JSON.stringify({ text: s.prompt, duration_seconds: s.duration, prompt_influence: 0.6 }) });
  console.log(`🔊 ${id}`);
}
console.log("✅ SFX library complete");
