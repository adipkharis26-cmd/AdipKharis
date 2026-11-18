// Render every locked reference sheet into model-sheets/
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const canon = JSON.parse(fs.readFileSync("src/characters/canon.json", "utf8"));
const locs = JSON.parse(fs.readFileSync("src/scene/locations.json", "utf8"));
fs.mkdirSync("model-sheets/locations", { recursive: true });
const jobs = [
  ...Object.keys(canon.characters).map((id) => [`ModelSheet-${id}`, `model-sheets/ModelSheet-${id}.png`]),
  ["Lineup", "model-sheets/Lineup.png"],
  ["Wardrobe", "model-sheets/Wardrobe.png"],
  ["LocationSheet", "model-sheets/LocationSheet.png"],
  ...Object.keys(locs.locations).map((id) => [`Loc-${id}`, `model-sheets/locations/${id}.png`]),
];
for (const [comp, out] of jobs) {
  console.log(`🖼  ${comp} -> ${out}`);
  execFileSync("npx", ["remotion", "still", "src/index.ts", comp, out, "--log=error"], { stdio: "inherit" });
}
