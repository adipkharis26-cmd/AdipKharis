import React from "react";
import { AbsoluteFill } from "remotion";
import { Character, Portrait } from "../characters/Character";
import { LocationPlate } from "../sheets/LocationSheet";
import { useFonts } from "../lib/fonts";
import type { Action, CharId, Emotion } from "../lib/timeline";
import { BRAND } from "./Thumbnail";

const OUT = BRAND.ink;

/* ------------------------------- LOGOS (800×800, circle-safe) ------------------------------ */
export const Logo: React.FC<{ variant: 1 | 2 | 3 }> = ({ variant }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <svg width={800} height={800}>
        <defs><clipPath id="c"><circle cx={400} cy={400} r={392} /></clipPath></defs>
        {variant === 1 && (
          // Mascot: Kusaka's face — readable even at 48 px
          <g clipPath="url(#c)">
            <rect width={800} height={800} fill={BRAND.yellow} />
            <path d={Array.from({ length: 20 }).map((_, i) => { const a = (i / 20) * Math.PI * 2, b = a + Math.PI / 20; return `M 400 430 L ${400 + Math.cos(a) * 700} ${430 + Math.sin(a) * 700} L ${400 + Math.cos(b) * 700} ${430 + Math.sin(b) * 700} Z`; }).join(" ")} fill="#fff" opacity={0.35} />
            <g transform="translate(372 690) scale(2.05)"><Portrait id="kusaka" emotion="smug" /></g>
            <circle cx={400} cy={400} r={386} fill="none" stroke={OUT} strokeWidth={14} />
          </g>
        )}
        {variant === 2 && (
          // Badge: mascot + name on a ring (good for merch/watermark)
          <g clipPath="url(#c)">
            <rect width={800} height={800} fill={BRAND.red} />
            <circle cx={400} cy={400} r={300} fill={BRAND.yellow} stroke={OUT} strokeWidth={12} />
            <defs>
              <path id="arcTop" d="M 100 400 A 300 300 0 0 1 700 400" />
              <path id="arcBot" d="M 130 420 A 270 270 0 0 0 670 420" />
            </defs>
            <text fontFamily="Bangers" fontSize={92} fill="#fff" stroke={OUT} strokeWidth={10} paintOrder="stroke" letterSpacing={8}>
              <textPath href="#arcTop" startOffset="50%" textAnchor="middle" dy={-34}>KUSAKA</textPath>
            </text>
            <g clipPath="url(#inner)" />
            <clipPath id="inner"><circle cx={400} cy={400} r={294} /></clipPath>
            <g clipPath="url(#inner)"><g transform="translate(380 650) scale(1.45)"><Portrait id="kusaka" emotion="laugh" /></g></g>
            <text fontFamily="Bangers" fontSize={64} fill="#fff" stroke={OUT} strokeWidth={8} paintOrder="stroke" letterSpacing={10}>
              <textPath href="#arcBot" startOffset="50%" textAnchor="middle">DESIGN</textPath>
            </text>
            <circle cx={400} cy={400} r={386} fill="none" stroke={OUT} strokeWidth={14} />
          </g>
        )}
        {variant === 3 && (
          // Monogram "K" with Kusaka's spiky hair + band-aid (minimal, scalable)
          <g clipPath="url(#c)">
            <rect width={800} height={800} fill={OUT} />
            <path d="M 210 250 L 170 190 L 240 200 L 230 120 L 300 170 L 340 80 L 380 160 L 450 70 L 470 160 L 560 110 L 540 200 L 630 190 L 580 250 Z" fill={BRAND.yellow} stroke={BRAND.yellow} strokeWidth={6} strokeLinejoin="round" />
            <text x={400} y={640} textAnchor="middle" fontFamily="Bangers" fontSize={480} fill={BRAND.red} stroke="#fff" strokeWidth={16} paintOrder="stroke">K</text>
            <g transform="translate(470 470) rotate(-28)">
              <rect x={-120} y={-34} width={240} height={68} rx={30} fill="#f3d2a8" stroke={OUT} strokeWidth={10} />
              <rect x={-38} y={-34} width={76} height={68} fill="#e9bf8e" stroke={OUT} strokeWidth={8} />
              {[-90, -70, 70, 90].map((x) => <circle key={x} cx={x} cy={0} r={5} fill="#c9a07a" />)}
            </g>
            <circle cx={400} cy={400} r={386} fill="none" stroke={BRAND.yellow} strokeWidth={14} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------- BANNER (2560×1440) ---------------------------------------- */
// YouTube: TV shows all 2560×1440; desktop 2560×423; tablet 1855×423; mobile & SAFE AREA 1546×423 (centre).
const SAFE = { x: 507, y: 508, w: 1546, h: 423 };
type Cast = [CharId, Emotion, Action, number, 1 | -1, number][]; // id, emo, act, x, facing, scale

const BannerTitle: React.FC<{ tagline: string; cx: number; size: number }> = ({ tagline, cx, size }) => (
  <g>
    <text x={cx} y={708} textAnchor="middle" fontFamily="Bangers" fontSize={size} fill={BRAND.yellow} stroke={OUT} strokeWidth={22} paintOrder="stroke" letterSpacing={8}
      style={{ filter: `drop-shadow(10px 10px 0 ${BRAND.red})` }}>KUSAKA DESIGN</text>
    <rect x={cx - 500} y={756} width={1000} height={80} rx={40} fill={OUT} />
    <text x={cx} y={810} textAnchor="middle" fontFamily="Baloo2" fontSize={40} fill="#fff">{tagline}</text>
  </g>
);

export const Banner: React.FC<{ variant: 1 | 2; guide?: boolean }> = ({ variant, guide }) => {
  useFonts();
  const castA: Cast = [
    ["dinda", "laugh", "peace", 170, 1, 1.12], ["nadia", "neutral", "wave", 400, 1, 1.1], ["kusaka", "smug", "thumbsup", 690, 1, 1.12],
    ["ujang", "deadpan", "crossed", 2150, -1, 1.12], ["bimo", "smug", "thumbsup", 2390, -1, 1.08],
  ];
  return (
    <AbsoluteFill style={{ background: BRAND.yellow }}>
      <svg width={2560} height={1440}>
        {variant === 1 ? (
          <g>
            {/* TV area: comic halftone + rays; desktop band carries the cast; safe area carries name */}
            <rect width={2560} height={1440} fill={BRAND.yellow} />
            <path d={Array.from({ length: 36 }).map((_, i) => { const a = (i / 36) * Math.PI * 2, b = a + Math.PI / 36; return `M 1280 720 L ${1280 + Math.cos(a) * 2400} ${720 + Math.sin(a) * 2400} L ${1280 + Math.cos(b) * 2400} ${720 + Math.sin(b) * 2400} Z`; }).join(" ")} fill="#fff" opacity={0.3} />
            {Array.from({ length: 40 }).map((_, r) => Array.from({ length: 70 }).map((__, c) => (r < 12 || r > 28) && (
              <circle key={`${r}-${c}`} cx={c * 38 + (r % 2) * 19} cy={r * 38} r={6} fill={BRAND.red} opacity={0.18} />
            )))}
            {castA.map(([id, e, a, x, f, s]) => (
              <Character key={id} id={id} x={x} y={1440} facing={f} frame={0} scale={s} force={{ emotion: e, action: a, noFx: true }} />
            ))}
          </g>
        ) : (
          <g>
            {/* School backdrop (locked set) across the full TV canvas */}
            <g transform="translate(-320 -260) scale(1.65)"><LocationPlate id="lapanganUpacara" /></g>
            <rect width={2560} height={1440} fill={BRAND.blue} opacity={0.25} />
            <rect x={0} y={SAFE.y - 30} width={2560} height={SAFE.h + 60} fill={OUT} opacity={0.18} />
            <Character id="kusaka" x={1975} y={1480} facing={-1} frame={0} scale={1.2} force={{ emotion: "laugh", action: "peace", noFx: true }} />
            <Character id="ujang" x={620} y={1480} facing={1} frame={0} scale={1.2} force={{ emotion: "deadpan", action: "crossed", noFx: true }} />
          </g>
        )}
        <BannerTitle cx={variant === 1 ? 1440 : 1270} size={variant === 1 ? 170 : 132}
          tagline={variant === 1 ? "Animasi komedi anak sekolah • Episode baru tiap minggu" : "Sekolah, keluarga, & dompet yang selalu ketinggalan"} />
        {guide && (
          <g fill="none" strokeWidth={8} fontFamily="Baloo2" fontSize={40}>
            <rect x={4} y={4} width={2552} height={1432} stroke="#8e44ad" strokeDasharray="30 18" />
            <text x={30} y={60} fill="#8e44ad" stroke="none">TV 2560×1440</text>
            <rect x={0} y={SAFE.y} width={2560} height={SAFE.h} stroke="#2f7fd8" />
            <text x={30} y={SAFE.y - 14} fill="#2f7fd8" stroke="none">DESKTOP 2560×423</text>
            <rect x={352} y={SAFE.y} width={1855} height={SAFE.h} stroke="#3c8d5a" strokeDasharray="20 12" />
            <text x={370} y={SAFE.y + SAFE.h + 46} fill="#3c8d5a" stroke="none">TABLET 1855×423</text>
            <rect x={SAFE.x} y={SAFE.y} width={SAFE.w} height={SAFE.h} stroke="#e63946" strokeWidth={10} />
            <text x={SAFE.x + 20} y={SAFE.y + SAFE.h + 100} fill="#e63946" stroke="none">AREA AMAN / HP 1546×423</text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};


/* ======================= BANNER v3/v4 (cooler, minimal text) ======================= */
const Rays: React.FC<{ cx: number; cy: number; n: number; color: string; opacity: number; r?: number }> = ({ cx, cy, n, color, opacity, r = 2600 }) => (
  <path d={Array.from({ length: n }).map((_, i) => { const a = (i / n) * Math.PI * 2, b = a + Math.PI / n; return `M ${cx} ${cy} L ${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r} L ${cx + Math.cos(b) * r} ${cy + Math.sin(b) * r} Z`; }).join(" ")} fill={color} opacity={opacity} />
);
const Halftone: React.FC<{ y0: number; y1: number; color: string; opacity: number; grow?: boolean }> = ({ y0, y1, color, opacity, grow }) => (
  <g>{Array.from({ length: Math.ceil((y1 - y0) / 34) }).map((_, r) => Array.from({ length: 78 }).map((__, c) => {
    const k = grow ? Math.abs((r * 34) / (y1 - y0) - (y0 < 700 ? 1 : 0)) : 0.5;
    return <circle key={`${r}-${c}`} cx={c * 34 + (r % 2) * 17} cy={y0 + r * 34} r={3 + k * 9} fill={color} opacity={opacity} />;
  }))}</g>
);
const MascotBadge: React.FC<{ x: number; y: number; r: number; emotion?: Emotion }> = ({ x, y, r, emotion = "smug" }) => (
  <g transform={`translate(${x} ${y})`}>
    <defs><clipPath id={`mb-${x}`}><circle r={r} /></clipPath></defs>
    <circle r={r + 14} fill={OUT} />
    <g clipPath={`url(#mb-${x})`}>
      <rect x={-r} y={-r} width={r * 2} height={r * 2} fill={BRAND.yellow} />
      <Rays cx={0} cy={20} n={18} color="#fff" opacity={0.4} r={r * 2} />
      <g transform={`translate(${-r * 0.06} ${r * 0.98}) scale(${r / 168})`}><Portrait id="kusaka" emotion={emotion} /></g>
    </g>
    <circle r={r} fill="none" stroke={BRAND.red} strokeWidth={10} />
  </g>
);
const Wordmark: React.FC<{ x: number; y: number; scale?: number; tag?: string }> = ({ x, y, scale = 1, tag = "ANIMASI KOMEDI SEKOLAH" }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {/* spiky hair crown = Kusaka's signature */}
    <path d="M -300 -190 L -330 -232 L -282 -226 L -290 -286 L -244 -244 L -214 -306 L -188 -246 L -140 -298 L -128 -236 L -76 -262 L -96 -204 Z" fill={OUT} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
    <text x={0} y={0} textAnchor="middle" fontFamily="Bangers" fontSize={230} letterSpacing={10} fill={BRAND.yellow}
      stroke={OUT} strokeWidth={26} paintOrder="stroke" style={{ filter: `drop-shadow(12px 12px 0 ${BRAND.red})` }}>KUSAKA</text>
    <g transform="translate(0 70) rotate(-3)">
      <rect x={-260} y={-58} width={520} height={100} fill={OUT} />
      <text x={0} y={22} textAnchor="middle" fontFamily="Bangers" fontSize={92} letterSpacing={26} fill="#fff">DESIGN</text>
    </g>
    <g transform="translate(0 168)">
      <rect x={-330} y={-36} width={660} height={62} rx={31} fill="#fff" stroke={OUT} strokeWidth={6} />
      <text x={0} y={10} textAnchor="middle" fontFamily="Baloo2" fontSize={34} letterSpacing={4} fill={OUT}>{tag}</text>
    </g>
  </g>
);
const Panel: React.FC<{ x: number; y: number; w: number; h: number; rot: number; color: string; id: CharId; emotion: Emotion }> = ({ x, y, w, h, rot, color, id, emotion }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <defs><clipPath id={`p-${id}`}><rect x={-w / 2} y={-h / 2} width={w} height={h} /></clipPath></defs>
    <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w} height={h} fill={OUT} />
    <g clipPath={`url(#p-${id})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={color} />
      <Rays cx={0} cy={0} n={16} color="#fff" opacity={0.28} r={w * 1.5} />
      <g transform={`translate(${-w * 0.04} ${h * 0.5}) scale(${w / 330})`}><Portrait id={id} emotion={emotion} /></g>
    </g>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke={OUT} strokeWidth={12} />
  </g>
);
const Guide: React.FC = () => (
  <g fill="none" strokeWidth={8} fontFamily="Baloo2" fontSize={40}>
    <rect x={4} y={4} width={2552} height={1432} stroke="#8e44ad" strokeDasharray="30 18" />
    <text x={30} y={60} fill="#8e44ad" stroke="none">TV 2560×1440</text>
    <rect x={0} y={SAFE.y} width={2560} height={SAFE.h} stroke="#2f7fd8" />
    <text x={30} y={SAFE.y - 14} fill="#2f7fd8" stroke="none">DESKTOP 2560×423</text>
    <rect x={352} y={SAFE.y} width={1855} height={SAFE.h} stroke="#3c8d5a" strokeDasharray="20 12" />
    <text x={370} y={SAFE.y + SAFE.h + 46} fill="#3c8d5a" stroke="none">TABLET 1855×423</text>
    <rect x={SAFE.x} y={SAFE.y} width={SAFE.w} height={SAFE.h} stroke="#e63946" strokeWidth={10} />
    <text x={SAFE.x + 20} y={SAFE.y + SAFE.h + 100} fill="#e63946" stroke="none">AREA AMAN / HP 1546×423</text>
  </g>
);

export const BannerPro: React.FC<{ variant: 3 | 4; guide?: boolean }> = ({ variant, guide }) => {
  useFonts();
  const cy = SAFE.y + SAFE.h / 2;
  return (
    <AbsoluteFill style={{ background: variant === 3 ? BRAND.yellow : OUT }}>
      <svg width={2560} height={1440}>
        {variant === 3 ? (
          <g>
            <rect width={2560} height={1440} fill={BRAND.yellow} />
            <Rays cx={1280} cy={cy} n={40} color="#fff" opacity={0.35} />
            <Halftone y0={0} y1={SAFE.y - 20} color={BRAND.red} opacity={0.35} grow />
            <Halftone y0={SAFE.y + SAFE.h + 20} y1={1440} color={BRAND.red} opacity={0.35} grow />
            {/* black/yellow edges of the desktop band */}
            <rect x={0} y={SAFE.y - 22} width={2560} height={16} fill={OUT} />
            <rect x={0} y={SAFE.y + SAFE.h + 6} width={2560} height={16} fill={OUT} />
            {/* cast in tilted comic panels (desktop/tablet/TV) */}
            <Panel x={150} y={cy} w={240} h={330} rot={-5} color={BRAND.blue} id="dinda" emotion="laugh" />
            <Panel x={420} y={cy + 6} w={240} h={330} rot={4} color={BRAND.red} id="nadia" emotion="neutral" />
            <Panel x={2140} y={cy + 6} w={240} h={330} rot={-4} color={BRAND.red} id="ujang" emotion="deadpan" />
            <Panel x={2410} y={cy} w={240} h={330} rot={5} color={BRAND.blue} id="pakDarto" emotion="suspicious" />
            {/* safe area: mascot + wordmark */}
            <MascotBadge x={800} y={cy} r={175} />
            <Wordmark x={1480} y={cy + 24} scale={0.9} />
          </g>
        ) : (
          <g>
            <rect width={2560} height={1440} fill={OUT} />
            <Rays cx={1820} cy={cy} n={36} color="#ffffff" opacity={0.07} />
            <rect x={0} y={SAFE.y - 22} width={2560} height={16} fill={BRAND.yellow} />
            <rect x={0} y={SAFE.y + SAFE.h + 6} width={2560} height={16} fill={BRAND.yellow} />
            {/* speed lines */}
            {Array.from({ length: 22 }).map((_, i) => <rect key={i} x={-200 + (i * 173) % 900} y={120 + i * 58} width={360 + (i % 4) * 120} height={10} fill="#fff" opacity={0.12} />)}
            {/* hero Kusaka (inside safe area on the right) */}
            <g>
              <circle cx={1820} cy={cy} r={200} fill={BRAND.yellow} stroke={BRAND.red} strokeWidth={16} />
              <Character id="kusaka" x={1810} y={1430} facing={-1} frame={0} scale={1.12} force={{ emotion: "laugh", action: "peace", noFx: true }} />
            </g>
            <Character id="ujang" x={2330} y={1520} facing={-1} frame={0} scale={1.2} force={{ emotion: "deadpan", action: "crossed", noFx: true }} />
            <Character id="dinda" x={260} y={1450} facing={1} frame={0} scale={1.3} force={{ emotion: "smug", action: "phone", noFx: true }} />
            <Wordmark x={1110} y={cy + 24} scale={0.9} />
          </g>
        )}
        {guide && <Guide />}
      </svg>
    </AbsoluteFill>
  );
};
