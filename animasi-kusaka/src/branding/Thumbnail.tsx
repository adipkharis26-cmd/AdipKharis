import React from "react";
import { AbsoluteFill } from "remotion";
import { Character } from "../characters/Character";
import { LocationPlate } from "../sheets/LocationSheet";
import { useFonts } from "../lib/fonts";
import type { Action, CharId, Emotion, Viseme } from "../lib/timeline";
import type { LocId } from "../scene/Locations";

/* KUSAKA thumbnail template (1280×720). Same frame, type and palette on every episode.
 * RULES: text = the title only (no episode number/badge), no money/currency props. */
const OUT = "#1b1b1b";
export const BRAND = { yellow: "#ffd23f", red: "#e63946", blue: "#2f7fd8", ink: OUT, paper: "#fdf6e3" };

export interface Actor { id: CharId; emotion: Emotion; action: Action; viseme?: Viseme | null; x: number; y: number; scale: number; facing: 1 | -1 }
export interface ThumbProps {
  episode: number; bg: LocId; burst: string; text: string[]; textX: number; textY: number; textSize?: number;
  // RULE: no money / currency (Rp) props in thumbnails — story props only (e.g. the wallet)
  actors: Actor[]; prop?: "wallet" | null; propX?: number; propY?: number;
}

const Burst: React.FC<{ cx: number; cy: number; color: string }> = ({ cx, cy, color }) => {
  const rays = Array.from({ length: 28 }).map((_, i) => {
    const a0 = (i / 28) * Math.PI * 2, a1 = a0 + Math.PI / 28;
    return `M ${cx} ${cy} L ${cx + Math.cos(a0) * 1600} ${cy + Math.sin(a0) * 1600} L ${cx + Math.cos(a1) * 1600} ${cy + Math.sin(a1) * 1600} Z`;
  });
  return <g><rect width={1280} height={720} fill={color} /><path d={rays.join(" ")} fill="#fff" opacity={0.18} /></g>;
};

const Wallet: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(-12)`} stroke={OUT} strokeWidth={8} strokeLinejoin="round">
    <rect x={-110} y={-70} width={220} height={140} rx={18} fill="#8a4b26" />
    <path d="M -110 -20 L 110 -20" strokeWidth={6} />
    <rect x={40} y={-10} width={70} height={46} rx={10} fill="#6e3a1c" />
    <circle cx={74} cy={13} r={9} fill="#ffd23f" strokeWidth={5} />
    {/* empty: dust + moth */}
    <path d="M -60 -110 q 10 -20 20 0 M -10 -128 q 10 -20 20 0" fill="none" strokeWidth={6} />
    <g transform="translate(-140 -110)"><ellipse rx={22} ry={12} fill="#d9d4c7" transform="rotate(-30)" /><ellipse rx={22} ry={12} fill="#d9d4c7" transform="rotate(30)" /></g>
  </g>
);
export const Thumbnail: React.FC<ThumbProps> = (p) => {
  useFonts();
  const size = p.textSize ?? 128;
  return (
    <AbsoluteFill style={{ background: p.burst }}>
      <svg width={1280} height={720}>
        <defs>
          <clipPath id="frame"><rect width={1280} height={720} /></clipPath>
          <linearGradient id="fade" x1="0" x2="1"><stop offset="0" stopColor={p.burst} stopOpacity={0.15} /><stop offset="1" stopColor={p.burst} stopOpacity={0.85} /></linearGradient>
        </defs>
        <g clipPath="url(#frame)">
          {/* background: locked location, pushed back, + colour burst for contrast */}
          <g transform="translate(-160 -90) scale(0.83)"><LocationPlate id={p.bg} /></g>
          <rect width={1280} height={720} fill="url(#fade)" />
          <g opacity={0.55}><Burst cx={420} cy={360} color="transparent" /></g>
          {p.actors.map((a, i) => (
            <Character key={i} id={a.id} x={a.x} y={a.y} facing={a.facing} frame={0} scale={a.scale}
              force={{ emotion: a.emotion, action: a.action, viseme: a.viseme ?? (a.emotion === "shock" ? "O" : null), noFx: true }} />
          ))}
          {p.prop === "wallet" && <Wallet x={p.propX ?? 980} y={p.propY ?? 470} />}
          {/* headline: max 3–4 words, yellow + thick black outline + red drop */}
          <g transform={`translate(${p.textX} ${p.textY}) rotate(-4)`}>
            {p.text.map((t, i) => (
              <text key={i} x={0} y={i * size * 0.92} textAnchor="middle" fontFamily="Bangers" fontSize={size} letterSpacing={2}
                fill={i === p.text.length - 1 ? BRAND.yellow : "#fff"} stroke={OUT} strokeWidth={size * 0.13} paintOrder="stroke"
                style={{ filter: `drop-shadow(8px 8px 0 ${BRAND.red})` }}>{t}</text>
            ))}
          </g>
          {/* series frame: yellow border + black/yellow hazard corner (bottom-left, never bottom-right) */}
          <rect x={7} y={7} width={1266} height={706} fill="none" stroke={BRAND.yellow} strokeWidth={14} />
          <rect x={0} y={0} width={1280} height={720} fill="none" stroke={OUT} strokeWidth={6} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
