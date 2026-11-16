import React from "react";
import { AbsoluteFill } from "remotion";
import { Character } from "../characters/Character";
import canon from "../characters/canon.json";
import { LOCATIONS, LOCATION_META, LocId } from "../scene/Locations";
import { useFonts } from "../lib/fonts";
import type { CharId, Emotion, Action } from "../lib/timeline";

const OUT = "#1b1b1b";
type Cast = [CharId, "A" | "B" | "C" | "D", 1 | -1, Emotion, Action][];
export const DEMO_CAST: Record<LocId, Cast> = {
  warung: [["kusaka", "A", 1, "smug", "thumbsup"], ["ujang", "B", -1, "suspicious", "crossed"]],
  gerbang: [["kusaka", "A", 1, "shock", "shock"], ["pakDarto", "B", -1, "suspicious", "hips"]],
  kelas: [["kusaka", "A", 1, "embarrassed", "idle"], ["nadia", "B", -1, "suspicious", "hips"]],
  koridor: [["ujang", "A", 1, "laugh", "point"], ["nadia", "B", -1, "neutral", "wave"]],
  kamar: [["kusaka", "A", 1, "defeated", "facepalm"], ["dinda", "B", -1, "laugh", "phone"]],
};

/** One location set rendered on its own (optionally with demo cast + stage marks). */
export const LocationPlate: React.FC<{ id: LocId; cast?: boolean; marks?: boolean; frame?: number }> = ({ id, cast = false, marks = false, frame = 45 }) => {
  const loc = LOCATIONS[id];
  const m = LOCATION_META.locations[id];
  const t = frame / 30;
  return (
    <g>
      <defs><clipPath id={`plate-${id}`}><rect width={1920} height={1080} /></clipPath></defs>
      <g clipPath={`url(#plate-${id})`}>
        <rect width={1920} height={1080} fill={loc.bg} />
        {loc.layers.map((l, i) => <g key={i}>{l.el(t)}</g>)}
        {marks && Object.entries(m.marks).map(([k, x]) => (
          <g key={k} transform={`translate(${x} ${m.floor + 40})`}>
            <path d="M -40 0 L 40 0 M 0 -14 L 0 14" stroke="#e63946" strokeWidth={6} />
            <circle r={26} cy={50} fill="#e63946" stroke={OUT} strokeWidth={4} />
            <text y={64} textAnchor="middle" fontFamily="Bangers" fontSize={40} fill="#fff">{k}</text>
          </g>
        ))}
        {cast && DEMO_CAST[id].map(([c, mark, f, emo, act]) => (
          <Character key={c} id={c} x={m.marks[mark]} y={m.floor} facing={f} frame={frame} force={{ emotion: emo, action: act, noFx: true }} />
        ))}
        {loc.front?.map((l, i) => <g key={`f${i}`}>{l.el(t)}</g>)}
      </g>
    </g>
  );
};

export const LocationStill: React.FC<{ id: LocId }> = ({ id }) => {
  useFonts();
  return <AbsoluteFill><svg width={1920} height={1080}><LocationPlate id={id} marks /></svg></AbsoluteFill>;
};

export const LocationSheet: React.FC = () => {
  useFonts();
  const ids = Object.keys(LOCATIONS) as LocId[];
  const W = 3000, H = 1460, pw = 960, ph = 540;
  return (
    <AbsoluteFill style={{ background: "#fdf6e3" }}>
      <svg width={W} height={H}>
        <rect width={W} height={130} fill={OUT} />
        <text x={50} y={98} fontFamily="Bangers" fontSize={92} fill="#ffd23f">LOKASI TERKUNCI</text>
        <text x={W - 50} y={88} textAnchor="end" fontFamily="Baloo2" fontSize={40} fill="#fff">locations v{LOCATION_META.version} · karakter kanon v{canon.version}</text>
        {ids.map((id, i) => {
          const x = 30 + (i % 3) * (pw + 20), y = 160 + Math.floor(i / 3) * (ph + 110);
          const m = LOCATION_META.locations[id];
          return (
            <g key={id} transform={`translate(${x} ${y})`}>
              <g transform="scale(0.5)"><LocationPlate id={id} cast /></g>
              <rect width={pw} height={ph} fill="none" stroke={OUT} strokeWidth={6} />
              <text x={0} y={ph + 46} fontFamily="Bangers" fontSize={46} fill={OUT}>{m.name.toUpperCase()}</text>
              <text x={pw} y={ph + 44} textAnchor="end" fontFamily="Baloo2" fontSize={26} fill="#8a6d3b">{m.time} · {m.use}</text>
            </g>
          );
        })}
        {/* rules card */}
        <g transform={`translate(${30 + 2 * (pw + 20)} ${160 + ph + 110})`}>
          <rect width={pw} height={ph} rx={20} fill="#fff" stroke="#d8ccae" strokeWidth={5} />
          <text x={40} y={70} fontFamily="Bangers" fontSize={50} fill="#e63946">ATURAN SET</text>
          {LOCATION_META.rules.map((r, i) => (
            <foreignObject key={i} x={40} y={100 + i * 104} width={pw - 80} height={100}>
              <div style={{ fontFamily: "Baloo2", fontSize: 28, lineHeight: 1.2, color: "#2b2b2b" }}>• {r}</div>
            </foreignObject>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
