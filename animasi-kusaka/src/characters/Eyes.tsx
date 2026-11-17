import React from "react";
import type { Emotion } from "../lib/timeline";
import canon from "./canon.json";

/** Eye states: open, closed (blink), wide (shock), happy (^ ^), half (lidded), puppy (pleading). */
export type EyeState = "open" | "closed" | "wide" | "happy" | "half" | "puppy";
export type BrowState = "neutral" | "raised" | "angry" | "worried" | "smug" | "skeptic";

const OUT = "#1b1b1b";
const ST = canon.style;

export const Eye: React.FC<{
  cx: number; cy: number; rx: number; ry: number; state: EyeState; look: [number, number]; lid?: string; id: string;
}> = ({ cx, cy, rx, ry, state, look, lid = "#f2c79a", id }) => {
  if (state === "closed")
    return <path d={`M ${cx - rx} ${cy + 2} Q ${cx} ${cy + ry * 0.45} ${cx + rx} ${cy + 2}`} fill="none" stroke={OUT} strokeWidth={6} strokeLinecap="round" />;
  if (state === "happy")
    return <path d={`M ${cx - rx} ${cy + 6} Q ${cx} ${cy - ry * 0.9} ${cx + rx} ${cy + 6}`} fill="none" stroke={OUT} strokeWidth={6} strokeLinecap="round" />;
  const scale = state === "wide" ? 1.25 : 1;
  const erx = rx * scale, ery = ry * scale;
  const pr = state === "wide" ? rx * 0.28 : state === "puppy" ? rx * 0.68 : rx * 0.5;
  const px = cx + look[0] * (erx - pr) * 0.7;
  const py = cy + look[1] * (ery - pr) * 0.6 + (state === "puppy" ? 3 : 0);
  const ir = pr * 1.45;
  return (
    <g>
      <clipPath id={id}><ellipse cx={cx} cy={cy} rx={erx} ry={ery} /></clipPath>
      <ellipse cx={cx} cy={cy} rx={erx} ry={ery} fill="#fff" />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={px} cy={py} rx={ir} ry={ir * 1.22} fill={ST.iris} />
        <ellipse cx={px} cy={py - ir * 0.45} rx={ir} ry={ir * 0.8} fill={ST.irisDeep} opacity={0.75} />
        <ellipse cx={px} cy={py + ir * 0.1} rx={pr * 0.55} ry={pr * 0.7} fill="#0d0805" />
        <circle cx={px + ir * 0.38} cy={py - ir * 0.42} r={ir * (state === "puppy" ? 0.4 : 0.32)} fill="#fff" />
        <circle cx={px - ir * 0.36} cy={py + ir * 0.48} r={ir * (state === "puppy" ? 0.2 : 0.14)} fill="#fff" />
        {state === "half" && <rect x={cx - erx - 2} y={cy - ery - 2} width={erx * 2 + 4} height={ery * 0.95} fill={lid} />}
      </g>
      {state === "half" && <line x1={cx - erx} y1={cy - ery * 0.05} x2={cx + erx} y2={cy - ery * 0.05} stroke={OUT} strokeWidth={ST.lidWidth} strokeLinecap="round" />}
      <ellipse cx={cx} cy={cy} rx={erx} ry={ery} fill="none" stroke={OUT} strokeWidth={4} />
      {state !== "half" && <path d={`M ${cx - erx - 3} ${cy - ery * 0.25} Q ${cx - erx * 0.2} ${cy - ery * 1.18} ${cx + erx + 4} ${cy - ery * 0.5}`} fill="none" stroke={OUT} strokeWidth={ST.lidWidth} strokeLinecap="round" />}
    </g>
  );
};

/** Brow drawn as a thick tapered stroke. side: 1 = front brow, -1 = back brow. */
export const Brow: React.FC<{ cx: number; cy: number; w: number; state: BrowState; side: 1 | -1; thick?: number }> = ({ cx, cy, w, state, side, thick = 9 }) => {
  // inner end is toward the nose (between both eyes)
  const inner = side === 1 ? -1 : 1;
  let innerDy = 0, outerDy = 0, lift = 0;
  switch (state) {
    case "raised": lift = -16; innerDy = -4; break;
    case "angry": innerDy = 12; outerDy = -6; break;
    case "worried": innerDy = -12; outerDy = 8; break;
    case "smug": lift = side === 1 ? -12 : 4; outerDy = side === 1 ? -4 : 0; break;
    case "skeptic": lift = side === 1 ? -14 : 6; innerDy = side === 1 ? 0 : 6; break;
  }
  const ix = cx + inner * w * 0.5, ox = cx - inner * w * 0.5;
  const iy = cy + lift + innerDy, oy = cy + lift + outerDy;
  return <path d={`M ${ix} ${iy} Q ${cx} ${(iy + oy) / 2 - 7} ${ox} ${oy}`} fill="none" stroke={OUT} strokeWidth={thick} strokeLinecap="round" />;
};

export function eyesFor(emotion: Emotion): { eye: EyeState; brow: BrowState } {
  switch (emotion) {
    case "smug": return { eye: "half", brow: "smug" };
    case "suspicious": return { eye: "half", brow: "skeptic" };
    case "shock": return { eye: "wide", brow: "raised" };
    case "surprised": return { eye: "wide", brow: "raised" };
    case "laugh": return { eye: "happy", brow: "raised" };
    case "pleading": return { eye: "puppy", brow: "worried" };
    case "deadpan": return { eye: "half", brow: "neutral" };
    case "embarrassed": return { eye: "open", brow: "worried" };
    case "defeated": return { eye: "half", brow: "worried" };
    default: return { eye: "open", brow: "neutral" };
  }
}
