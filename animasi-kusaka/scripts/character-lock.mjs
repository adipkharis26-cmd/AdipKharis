// Character lock: guards the canonical character design against accidental changes.
//   node scripts/character-lock.mjs check   -> fails if canon/rig files differ from characters.lock.json
//   node scripts/character-lock.mjs lock    -> re-locks; refuses unless canon.json "version" was bumped
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILES = [
  "src/characters/canon.json",
  "src/characters/Character.tsx",
  "src/characters/Mouth.tsx",
  "src/characters/Eyes.tsx",
  "src/characters/Hands.tsx",
  "src/scene/locations.json",
  "src/scene/Locations.tsx",
  "src/scene/Background.tsx",
  "src/scene/Locations2.tsx",
  "src/scene/Details.tsx",
  "src/scene/Details2.tsx",
  "src/scene/Locations3.tsx",
  "src/scene/Extras.tsx",
  "src/fx/Lighting.tsx",
  "src/edit/director.ts",
  "src/edit/editing.json",
  "src/audio/sfx.json",
  "src/fx/Overlays.tsx",
  "src/branding/brand.json",
  "src/branding/Brand.tsx",
  "src/branding/Thumbnail.tsx",
  "src/branding/Watermark.tsx",
  // every SFX file is locked too (sound consistency)
  ...fs.readdirSync(path.join(root, "public/sfx")).filter((f) => f.endsWith(".mp3")).sort().map((f) => `public/sfx/${f}`),
];
const lockPath = path.join(root, "characters.lock.json");
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, f))).digest("hex");
const canonChars = JSON.parse(fs.readFileSync(path.join(root, "src/characters/canon.json"), "utf8"));
const canonLocs = JSON.parse(fs.readFileSync(path.join(root, "src/scene/locations.json"), "utf8"));
const canonEdit = JSON.parse(fs.readFileSync(path.join(root, "src/edit/editing.json"), "utf8"));
const canonSfx = JSON.parse(fs.readFileSync(path.join(root, "src/audio/sfx.json"), "utf8"));
const canonBrand = JSON.parse(fs.readFileSync(path.join(root, "src/branding/brand.json"), "utf8"));
// Combined version: characters + locations + editing + sfx. Bump one of them to re-lock deliberately.
const canon = { version: `${canonChars.version}+loc${canonLocs.version}+edit${canonEdit.version}+sfx${canonSfx.version}+brand${canonBrand.version}` };
const current = Object.fromEntries(FILES.map((f) => [f, sha(f)]));
const lock = fs.existsSync(lockPath) ? JSON.parse(fs.readFileSync(lockPath, "utf8")) : null;
const changed = lock ? FILES.filter((f) => lock.files[f] !== current[f]) : FILES;

const mode = process.argv[2] ?? "check";
if (mode === "check") {
  if (!lock) { console.error("✗ characters.lock.json belum ada. Jalankan: npm run lock:characters"); process.exit(1); }
  if (changed.length) {
    console.error(`✗ KANON TERKUNCI (v${lock.version}) tapi file berikut berubah:\n  - ${changed.join("\n  - ")}`);
    console.error("  Kalau perubahan ini disengaja: naikkan \"version\" di canon.json / locations.json, render ulang sheet\n  (npm run sheets), lalu jalankan npm run lock:characters.");
    process.exit(1);
  }
  console.log(`✓ Karakter konsisten dengan kanon v${lock.version}`);
} else if (mode === "lock") {
  if (lock && changed.length === 0) { console.log(`✓ Tidak ada perubahan. Tetap terkunci di v${lock.version}`); process.exit(0); }
  if (lock && lock.version === canon.version) {
    console.error(`✗ File karakter berubah tapi versi kanon masih v${canon.version}. Naikkan "version" di canon.json / locations.json / editing.json / sfx.json / brand.json dulu.`);
    process.exit(1);
  }
  fs.writeFileSync(lockPath, JSON.stringify({ version: canon.version, lockedAt: new Date().toISOString().slice(0, 10), files: current }, null, 2) + "\n");
  console.log(`🔒 Karakter dikunci di v${canon.version}`);
} else {
  console.error("usage: character-lock.mjs check|lock"); process.exit(2);
}
