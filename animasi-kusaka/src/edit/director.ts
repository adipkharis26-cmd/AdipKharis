import editing from "./editing.json";
import type { Line } from "../lib/timeline";

/* Auto shot director (locked in editing.json → camera.director). Like the reference: every shot is ONE static size;
   the size is chosen from the scene's rhythm. Explicit wide/medium/close/crash in a script are always kept. */
type Shot = Line["shot"];
const KEEP: Shot[] = ["wide", "medium", "close", "crash"];
const INTENSE = ["shock", "surprised", "pleading", "embarrassed", "defeated"];

export function direct(lines: Line[]): Line[] {
  if (editing.camera.director !== "auto") return lines;
  const out = lines.map((l) => ({ ...l }));
  const scenes = [...new Set(out.map((l) => l.scene))];
  for (const sc of scenes) {
    const ls = out.filter((l) => l.scene === sc);
    let sinceGroup = 0;
    ls.forEach((l, i) => {
      const prev = ls[i - 1], prev2 = ls[i - 2];
      const moving = !!(l as Line & { move?: unknown }).move;
      let shot: Shot;
      if (KEEP.includes(l.shot)) shot = l.shot;
      else if (i === 0) shot = "wide";
      else if (l.offscreen) shot = "two";
      else if (moving) shot = "wide";
      else if (i === ls.length - 1 && ls.length > 2) shot = "two";
      else if (prev?.shot === "wide") shot = "two";
      else if (l.emotion === "laugh" && Object.keys(l.reactions ?? {}).length > 0) shot = "two";
      else if (INTENSE.includes(l.emotion)) shot = "close";
      else if (sinceGroup >= 5) shot = "two";
      else if (prev && prev.speaker === l.speaker && !prev.offscreen) shot = (prev.shot as Shot) === "wide" ? "two" : prev.shot;
      else if (prev2 && prev2.speaker === l.speaker) shot = "close"; // back-and-forth exchange
      else shot = "medium";
      l.shot = shot;
      sinceGroup = shot === "two" || shot === "wide" ? 0 : sinceGroup + 1;
    });
  }
  return out;
}
