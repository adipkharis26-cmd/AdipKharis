import React from "react";
import type { Emotion, Viseme } from "../lib/timeline";

/**
 * Mouth "sprite sheet" in SVG. Every shape is drawn around (0,0).
 * Lip-sync shapes: rest, A, I, U, E, O, M, F, consonant
 * Expression shapes: smile, smirk, frown, shock, laugh, flat, wobble
 */
export type MouthShape = Viseme | "smile" | "smirk" | "frown" | "shock" | "laugh" | "flat" | "wobble";

const OUT = "#1b1b1b";
const INSIDE = "#5a1a1f";
const TONGUE = "#e8707a";
const TEETH = "#ffffff";
const SW = 5;

const Open: React.FC<{ w: number; h: number; teeth?: boolean; tongue?: boolean; round?: boolean }> = ({ w, h, teeth, tongue, round }) => {
  const d = round
    ? `M ${-w} 0 C ${-w} ${-h * 1.2}, ${w} ${-h * 1.2}, ${w} 0 C ${w} ${h * 1.2}, ${-w} ${h * 1.2}, ${-w} 0 Z`
    : `M ${-w} ${-h * 0.35} Q 0 ${-h * 0.75} ${w} ${-h * 0.35} Q ${w * 0.9} ${h} 0 ${h} Q ${-w * 0.9} ${h} ${-w} ${-h * 0.35} Z`;
  const id = `m${w}${h}${round ? 1 : 0}`;
  return (
    <g>
      <clipPath id={id}><path d={d} /></clipPath>
      <path d={d} fill={INSIDE} />
      <g clipPath={`url(#${id})`}>
        {teeth && <rect x={-w} y={-h * 1.2} width={w * 2} height={h * 0.6} fill={TEETH} />}
        {tongue && <ellipse cx={0} cy={h * 0.85} rx={w * 0.6} ry={h * 0.45} fill={TONGUE} />}
      </g>
      <path d={d} fill="none" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    </g>
  );
};

export const Mouth: React.FC<{ shape: MouthShape; intensity?: number }> = ({ shape, intensity = 1 }) => {
  const k = intensity;
  switch (shape) {
    case "rest":
    case "smile":
      return <path d="M -20 -2 Q 0 10 22 -4" fill="none" stroke={OUT} strokeWidth={SW} strokeLinecap="round" />;
    case "flat":
      return <path d="M -18 2 L 18 0" fill="none" stroke={OUT} strokeWidth={SW} strokeLinecap="round" />;
    case "smirk":
      return <path d="M -18 4 Q 4 6 24 -10" fill="none" stroke={OUT} strokeWidth={SW} strokeLinecap="round" />;
    case "frown":
      return <path d="M -20 8 Q 0 -6 20 8" fill="none" stroke={OUT} strokeWidth={SW} strokeLinecap="round" />;
    case "wobble":
      return <path d="M -24 6 q 6 -8 12 0 t 12 0 t 12 0 t 12 0" fill="none" stroke={OUT} strokeWidth={SW} strokeLinecap="round" />;
    case "M":
      return <path d="M -20 0 Q 0 4 20 0" fill="none" stroke={OUT} strokeWidth={SW + 1} strokeLinecap="round" />;
    case "F":
      return (
        <g>
          <path d="M -18 -4 L 18 -4 L 16 6 L -16 6 Z" fill={TEETH} stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
          <path d="M -20 6 Q 0 14 20 6" fill="none" stroke={OUT} strokeWidth={SW} strokeLinecap="round" />
        </g>
      );
    case "consonant":
      return <Open w={17} h={9 * k} teeth />;
    case "A":
      return <Open w={24} h={26 * k} teeth tongue />;
    case "E":
      return <Open w={26} h={14 * k} teeth tongue />;
    case "I":
      return <Open w={28} h={8 * k} teeth />;
    case "O":
      return <Open w={17} h={20 * k} round tongue />;
    case "U":
      return <Open w={10} h={10 * k} round />;
    case "shock":
      return <Open w={26 * Math.min(k, 1.3)} h={38 * k} round tongue />;
    case "laugh":
      return (
        <g>
          <path d="M -34 -8 Q 0 -14 34 -8 Q 30 38 0 40 Q -30 38 -34 -8 Z" fill={INSIDE} />
          <path d="M -32 -8 Q 0 -14 32 -8 L 30 2 Q 0 -2 -30 2 Z" fill={TEETH} />
          <ellipse cx={0} cy={30} rx={18} ry={9} fill={TONGUE} />
          <path d="M -34 -8 Q 0 -14 34 -8 Q 30 38 0 40 Q -30 38 -34 -8 Z" fill="none" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
        </g>
      );
  }
};

/** Pick the drawn mouth shape from lip-sync viseme + emotion. */
export function pickMouth(viseme: Viseme | null, emotion: Emotion): { shape: MouthShape; intensity: number } {
  if (viseme && viseme !== "rest") {
    if (emotion === "laugh" && (viseme === "A" || viseme === "E" || viseme === "O" || viseme === "consonant"))
      return { shape: "laugh", intensity: 1 };
    if (emotion === "shock") return { shape: viseme === "M" ? "M" : viseme === "consonant" ? "O" : viseme, intensity: 1.35 };
    return { shape: viseme, intensity: emotion === "pleading" ? 0.85 : 1 };
  }
  const idle: Record<Emotion, MouthShape> = {
    neutral: "smile", smug: "smirk", suspicious: "flat", shock: "shock", laugh: "laugh", pleading: "wobble",
    deadpan: "flat", surprised: "O", embarrassed: "wobble", defeated: "frown",
  };
  return { shape: idle[emotion], intensity: emotion === "surprised" ? 0.8 : 1 };
}
