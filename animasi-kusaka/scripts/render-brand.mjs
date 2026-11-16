// Render the locked brand assets + every thumbnail in src/branding/thumbnails.json into brand/
//   node scripts/render-brand.mjs            -> logo, banner, all thumbnails
//   node scripts/render-brand.mjs eps02      -> only thumbnails whose id starts with "eps02"
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const only = process.argv[2];
const thumbs = Object.keys(JSON.parse(fs.readFileSync("src/branding/thumbnails.json", "utf8")));
const jobs = only ? [] : [["Logo", "brand/logo-kusaka-design.png"], ["Banner", "brand/banner-youtube-2560x1440.png"], ["BannerGuide", "brand/banner-guide-JANGAN-DIUNGGAH.png"]];
for (const t of thumbs) if (!only || t.startsWith(only)) jobs.push([`Thumb-${t}`, `brand/thumbnails/${t}.png`]);
fs.mkdirSync("brand/thumbnails", { recursive: true });
for (const [c, out] of jobs) {
  console.log(`🖼  ${c} -> ${out}`);
  execFileSync("npx", ["remotion", "still", "src/branding/index.ts", c, out, "--log=error"], { stdio: "inherit" });
}
