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
  actors: Actor[]; prop?: "wallet" | "flagUpsideDown" | "bookStack" | "phoneDrama" | null; propX?: number; propY?: number; propScale?: number;
  // Variasi per episode (identitas tetap: bingkai kuning, Bangers kuning/putih + bayangan merah, Kusaka ekspresi ekstrem)
  pattern?: "rays" | "halftone" | "speed" | "stripes" | "grid";
  split?: { bg: LocId; angle?: number };          // layar terbelah diagonal: kiri = bg, kanan = split.bg
  callout?: { x: number; y: number; rx: number; ry: number; arrow?: { x: number; y: number } }; // lingkaran + panah merah
  textRot?: number; textAlign?: "middle" | "start";
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
/* Pola latar (ganti-ganti antar episode) */
const Pattern: React.FC<{ kind: NonNullable<ThumbProps["pattern"]> }> = ({ kind }) => {
  if (kind === "halftone") return <g opacity={0.22} fill="#fff">{Array.from({ length: 22 * 13 }).map((_, i) => { const c = i % 22, r = Math.floor(i / 22); const d = Math.max(0, 1 - Math.hypot(c * 60 - 1000, r * 60 - 560) / 1000); return <circle key={i} cx={c * 60 + (r % 2) * 30} cy={r * 60} r={3 + d * 14} />; })}</g>;
  if (kind === "speed") return <g stroke="#fff" opacity={0.3} strokeLinecap="round">{Array.from({ length: 34 }).map((_, i) => <line key={i} x1={160 + ((i * 97) % 1100)} y1={(i * 53) % 720} x2={-200} y2={(i * 53) % 720} strokeWidth={4 + (i % 4) * 3} />)}</g>;
  if (kind === "grid") return <g stroke="#fff" opacity={0.28}>{Array.from({ length: 33 }).map((_, i) => <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={720} strokeWidth={i % 4 === 0 ? 4 : 1.5} />)}{Array.from({ length: 19 }).map((_, i) => <line key={`h${i}`} x1={0} y1={i * 40} x2={1280} y2={i * 40} strokeWidth={i % 4 === 0 ? 4 : 1.5} />)}</g>;
  if (kind === "stripes") return <g fill="#fff" opacity={0.16}>{Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M ${i * 120 - 300} 720 L ${i * 120 - 180} 720 L ${i * 120 + 300} 0 L ${i * 120 + 180} 0 Z`} />)}</g>;
  return <g opacity={0.55}><Burst cx={420} cy={360} color="transparent" /></g>;
};
const FlagUpsideDown: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={OUT} strokeWidth={8} strokeLinejoin="round">
    <rect x={-8} y={-30} width={16} height={560} fill="#d9d9d9" /><circle cx={0} cy={-38} r={14} fill="#f3c66b" />
    <rect x={8} y={-10} width={300} height={90} fill="#fff" /><rect x={8} y={80} width={300} height={90} fill="#e63946" />
  </g>
);
/* Tumpukan buku PR menjulang (miring-miring, tanpa teks) */
const BOOKS = ["#e63946", "#2f7fd8", "#2aa6a0", "#ffd23f", "#8a4b26", "#6c3fc4", "#f28c28", "#e85d9a", "#3d9a4a", "#2f7fd8", "#e63946", "#ffd23f"];
const BookStack: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={OUT} strokeWidth={7} strokeLinejoin="round">
    {BOOKS.map((c, i) => { const w = 250 - (i % 3) * 22, h = 52 + (i % 2) * 10, off = Math.sin(i * 1.7) * 26, yy = -i * 58;
      return <g key={i} transform={`translate(${off} ${yy}) rotate(${Math.sin(i * 2.3) * 5})`}>
        <rect x={-w / 2} y={-h} width={w} height={h} rx={6} fill={c} />
        <rect x={-w / 2 + 14} y={-h + 10} width={w - 40} height={h - 20} rx={3} fill="#fdf6e3" strokeWidth={4} />
        <path d={`M ${-w / 2 + 30} ${-h / 2} L ${w / 2 - 40} ${-h / 2}`} strokeWidth={3} opacity={0.5} />
      </g>; })}
    {/* kertas melayang */}
    <g transform="translate(-170 -560) rotate(-18)"><rect x={-40} y={-50} width={80} height={100} fill="#fff" strokeWidth={5} /><path d="M -25 -25 L 25 -25 M -25 0 L 25 0 M -25 25 L 10 25" strokeWidth={4} /></g>
    <g transform="translate(180 -420) rotate(22)"><rect x={-40} y={-50} width={80} height={100} fill="#fff" strokeWidth={5} /><path d="M -25 -25 L 25 -25 M -25 0 L 25 0 M -25 25 L 10 25" strokeWidth={4} /></g>
  </g>
);
/* HP drakor: layar dengan hati besar + air mata (tanpa teks) */
const PhoneDrama: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(8)`} stroke={OUT} strokeWidth={9} strokeLinejoin="round">
    <rect x={-110} y={-200} width={220} height={400} rx={30} fill="#222" />
    <rect x={-90} y={-170} width={180} height={330} rx={12} fill="#ffb3c7" strokeWidth={5} />
    <path d="M 0 40 C -90 -20 -70 -110 0 -70 C 70 -110 90 -20 0 40 Z" fill={BRAND.red} strokeWidth={7} />
    <path d="M -40 70 q 6 22 0 34 q -6 -12 0 -34 Z M 40 80 q 6 22 0 34 q -6 -12 0 -34 Z" fill="#7cc6ff" strokeWidth={4} />
    <circle cx={0} cy={182} r={9} fill="#555" strokeWidth={3} />
  </g>
);
const Callout: React.FC<{ c: NonNullable<ThumbProps["callout"]> }> = ({ c }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx={c.x} cy={c.y} rx={c.rx} ry={c.ry} stroke={OUT} strokeWidth={22} /><ellipse cx={c.x} cy={c.y} rx={c.rx} ry={c.ry} stroke={BRAND.red} strokeWidth={12} />
    {c.arrow && (() => { const { x, y } = c.arrow; const a = Math.atan2(c.y - y, c.x - x); const hx = c.x - Math.cos(a) * c.rx, hy = c.y - Math.sin(a) * c.ry; const w = (k: number) => `${hx - Math.cos(a + k) * 46} ${hy - Math.sin(a + k) * 46}`;
      return <g><path d={`M ${x} ${y} L ${hx} ${hy}`} stroke={OUT} strokeWidth={22} /><path d={`M ${x} ${y} L ${hx} ${hy}`} stroke={BRAND.red} strokeWidth={12} /><path d={`M ${w(0.5)} L ${hx} ${hy} L ${w(-0.5)}`} stroke={OUT} strokeWidth={22} /><path d={`M ${w(0.5)} L ${hx} ${hy} L ${w(-0.5)}`} stroke={BRAND.red} strokeWidth={12} /></g>; })()}
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
          {p.split && (() => { const ang = p.split.angle ?? 14, dx = Math.tan((ang * Math.PI) / 180) * 360; const poly = `${640 + dx},0 1280,0 1280,720 ${640 - dx},720`;
            return <g><clipPath id="splitR"><polygon points={poly} /></clipPath><g clipPath="url(#splitR)"><g transform="translate(-160 -90) scale(0.83)"><LocationPlate id={p.split.bg} /></g></g>
              <polygon points={`${640 + dx - 9},0 ${640 + dx + 9},0 ${640 - dx + 9},720 ${640 - dx - 9},720`} fill="#fff" stroke={OUT} strokeWidth={6} /></g>; })()}
          <rect width={1280} height={720} fill="url(#fade)" />
          <Pattern kind={p.pattern ?? "rays"} />
          {p.actors.map((a, i) => (
            <Character key={i} id={a.id} x={a.x} y={a.y} facing={a.facing} frame={0} scale={a.scale}
              force={{ emotion: a.emotion, action: a.action, viseme: a.viseme ?? (a.emotion === "shock" ? "O" : null), noFx: true }} />
          ))}
          {p.prop === "wallet" && <Wallet x={p.propX ?? 980} y={p.propY ?? 470} />}
          {p.prop === "flagUpsideDown" && <FlagUpsideDown x={p.propX ?? 960} y={p.propY ?? 140} s={p.propScale ?? 1} />}
          {p.prop === "bookStack" && <BookStack x={p.propX ?? 980} y={p.propY ?? 700} s={p.propScale ?? 1} />}
          {p.prop === "phoneDrama" && <PhoneDrama x={p.propX ?? 980} y={p.propY ?? 360} s={p.propScale ?? 1} />}
          {p.callout && <Callout c={p.callout} />}
          {/* headline: max 3–4 words, yellow + thick black outline + red drop */}
          <g transform={`translate(${p.textX} ${p.textY}) rotate(${p.textRot ?? -4})`}>
            {p.text.map((t, i) => (
              <text key={i} x={0} y={i * size * 0.92} textAnchor={p.textAlign ?? "middle"} fontFamily="Bangers" fontSize={size} letterSpacing={2}
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
