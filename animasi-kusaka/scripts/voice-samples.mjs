// One catchphrase sample per character (ElevenLabs) -> public/voices/<id>.mp3 — for checking voice consistency.
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const canon = JSON.parse(fs.readFileSync("src/characters/canon.json", "utf8"));
fs.mkdirSync("public/voices", { recursive: true });
for (const [id, c] of Object.entries(canon.characters)) {
  const out = `public/voices/${id}.mp3`;
  if (fs.existsSync(out) && !process.argv.includes("--force")) { console.log(`skip ${id}`); continue; }
  const body = JSON.stringify({ text: c.catchphrase, model_id: c.voice.model_id, language_code: c.voice.language_code, seed: c.voice.seed, voice_settings: c.voice.settings });
  const args = ["-sSf", "-X", "POST", `https://api.elevenlabs.io/v1/text-to-speech/${c.voice.voice_id}?output_format=mp3_44100_128`,
    "-H", "Content-Type: application/json", "--data-binary", "@-", "-o", out];
  if (process.env.ELEVENLABS_API_KEY) args.push("-H", `xi-api-key: ${process.env.ELEVENLABS_API_KEY}`);
  execFileSync("curl", args, { input: body });
  console.log(`🎙  ${c.name}: "${c.catchphrase}" -> ${out}`);
}
