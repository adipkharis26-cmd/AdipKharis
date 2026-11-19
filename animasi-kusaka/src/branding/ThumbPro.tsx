import React from "react";
import { AbsoluteFill } from "remotion";
import { Character, Portrait } from "../characters/Character";
import { Item } from "../characters/Props";
import { Extras } from "../scene/Extras";
import { LOCATIONS, LOCATION_META, LocId, SceneOpts } from "../scene/Locations";
import { DETAILS } from "../scene/Details";
import { DETAILS2 } from "../scene/Details2";
import { LightDef, SetLight } from "../fx/Lighting";
import { useFonts } from "../lib/fonts";
import type { Action, CharId, Emotion, Viseme } from "../lib/timeline";

/* Thumbnail "rekomendasi" (merek v1.11.0, TANPA garis tepi), berbasis konfigurasi src/branding/thumbpro.json.
 * Gaya: R1 sinematik · R2 stiker · R3 close-up wajah · R4 layar terbelah · R5 momen cerita tanpa teks · R6 blok warna minimal.
 * Aturan merek: teks hanya judul pendek, tanpa nomor episode, tanpa uang/Rp, pojok kanan bawah kosong (label durasi). */
const INK = "#1b1b1b", YEL = "#ffd23f", RED = "#e63946";
export interface PActor { id: CharId; x: number; y: number; s: number; f: 1 | -1; e: Emotion; a: Action; held?: { front?: string; back?: string }; hat?: boolean; bag?: boolean; wear?: "seragam" | "bebas" | "rumah" }
export interface PPlate { loc: LocId; cx: number; cy: number; z: number; opts?: SceneOpts; extras?: { hat?: boolean; salute?: number; bag?: boolean }; blur?: number; grade?: string; actors?: PActor[]; wear?: "seragam" | "bebas" | "rumah" }
export interface PProp { item: string; x: number; y: number; s: number; rot?: number }
export interface PText { lines: string[]; x: number; y: number; size: number; font?: "Bangers" | "Oswald" | "Baloo2"; align?: "left" | "center" | "right"; rot?: number; colors?: string[] }
export interface ThumbProProps {
  v: "R1" | "R2" | "R3" | "R4" | "R5" | "R6";
  plate?: PPlate; plate2?: PPlate; stickers?: PActor[]; props?: PProp[]; text?: PText; text2?: PText;
  face?: { id: CharId; emotion: Emotion; viseme?: Viseme; x: number; y: number; s: number };
  bg?: string; tintL?: string; tintR?: string; circle?: { x: number; y: number; rx: number; ry: number };
}

const Plate: React.FC<{ p: PPlate }> = ({ p }) => {
  const def = LOCATIONS[p.loc], meta = LOCATION_META.locations[p.loc] as { floor: number; light?: LightDef };
  const Detail = DETAILS[p.loc] ?? DETAILS2[p.loc];
  const k = (1280 / 1920) * p.z, fid = `pb-${p.loc}-${p.blur ?? 0}-${Math.round(p.cx)}`;
  return (
    <svg width={1280} height={720} style={{ position: "absolute", inset: 0 }}>
      <defs><filter id={fid}><feGaussianBlur stdDeviation={p.blur ?? 0} /></filter></defs>
      <g transform={`translate(640 360) scale(${k}) translate(${-p.cx} ${-p.cy})`}>
        <rect x={-2000} y={-2000} width={6000} height={6000} fill={def.bg} />
        <g filter={p.blur ? `url(#${fid})` : undefined} style={p.grade ? { filter: p.grade } : undefined}>
          {def.layers.map((l, i) => <g key={i}>{l.el(1.5, p.opts)}</g>)}
          {Detail && <Detail t={1.5} />}
          <Extras location={p.loc} t={1.5} hat={p.extras?.hat} salute={p.extras?.salute} bag={p.extras?.bag} />
          <SetLight light={meta.light ?? { kind: "sun", from: -1 }} t={1.5} floor={meta.floor} />
        </g>
        {(p.actors ?? []).map((a, i) => <Actor key={i} a={a} wear={p.wear} />)}
      </g>
    </svg>
  );
};
const Actor: React.FC<{ a: PActor; wear?: "seragam" | "bebas" | "rumah" }> = ({ a, wear }) => (
  <Character id={a.id} x={a.x} y={a.y} facing={a.f} frame={45} scale={a.s} held={a.held} hat={a.hat} bag={a.bag} wear={a.wear ?? wear ?? "seragam"} force={{ emotion: a.e, action: a.a, noFx: true }} />
);
const StickerDefs: React.FC<{ id: string; r?: number }> = ({ id, r = 9 }) => (
  <defs><filter id={id} x="-20%" y="-20%" width="140%" height="140%">
    <feMorphology in="SourceAlpha" operator="dilate" radius={r} result="d" /><feFlood floodColor="#fff" /><feComposite in2="d" operator="in" result="w" />
    <feGaussianBlur in="d" stdDeviation="10" result="sh" /><feOffset in="sh" dx="6" dy="10" result="so" /><feFlood floodColor="#000" floodOpacity="0.45" /><feComposite in2="so" operator="in" result="s2" />
    <feMerge><feMergeNode in="s2" /><feMergeNode in="w" /><feMergeNode in="SourceGraphic" /></feMerge>
  </filter></defs>
);
const FlagInv: React.FC = () => (
  <g stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <rect x={-9} y={-40} width={18} height={560} fill="#d9d9d9" /><circle cx={0} cy={-48} r={15} fill="#f3c66b" />
    <path d="M 9 -20 Q 160 -50 310 -10 L 310 80 Q 160 40 9 70 Z" fill="#fff" /><path d="M 9 70 Q 160 40 310 80 L 310 170 Q 160 130 9 160 Z" fill={RED} />
  </g>
);
/** Benda cerita sebagai stiker: "flagInv" (bendera terbalik) atau benda dari Props.tsx (wallet, paper, book, …), diperbesar. */
const PropSticker: React.FC<{ p: PProp; f: string }> = ({ p, f }) => (
  <g filter={`url(#${f})`} transform={`translate(${p.x} ${p.y}) rotate(${p.rot ?? 0}) scale(${p.s})`}>
    {p.item === "flagInv" ? <FlagInv /> : <Item id={p.item} x={0} y={0} />}
  </g>
);
const T: React.FC<{ t: PText; shadow?: string }> = ({ t, shadow }) => {
  const font = t.font ?? "Bangers", align = t.align ?? "left", colors = t.colors ?? ["#fff", YEL];
  return (
    <div style={{ position: "absolute", left: t.x, top: t.y, transform: `translateX(${align === "center" ? "-50%" : align === "right" ? "-100%" : "0"}) rotate(${t.rot ?? 0}deg)`, textAlign: align, lineHeight: 0.95 }}>
      {t.lines.map((l, i) => (
        <div key={i} style={{ fontFamily: font, fontWeight: font === "Bangers" ? 400 : font === "Oswald" ? 600 : 800, fontSize: t.size, letterSpacing: font === "Oswald" ? 1 : 2,
          color: colors[Math.min(i, colors.length - 1)], WebkitTextStroke: `${font === "Oswald" ? 10 : t.size * 0.12}px ${INK}`, paintOrder: "stroke fill",
          textShadow: shadow ?? (font === "Oswald" ? "0 8px 24px rgba(0,0,0,0.6)" : `6px 6px 0 ${RED}`), whiteSpace: "nowrap" }}>{l}</div>
      ))}
    </div>
  );
};
const Vig: React.FC<{ k?: number }> = ({ k = 0.5 }) => <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 70% at 45% 45%, transparent 50%, rgba(10,6,20,${k}) 100%)` }} />;
const Stickers: React.FC<{ id: string; actors?: PActor[]; props?: PProp[]; r?: number }> = ({ id, actors = [], props = [], r }) => (
  <svg width={1280} height={720} style={{ position: "absolute", inset: 0 }}>
    <StickerDefs id={id} r={r} />
    {props.map((p, i) => <PropSticker key={`p${i}`} p={p} f={id} />)}
    {actors.map((a, i) => <g key={`a${i}`} filter={`url(#${id})`}><Actor a={a} /></g>)}
  </svg>
);

export const ThumbPro: React.FC<ThumbProProps> = (p) => {
  useFonts();
  if (p.v === "R1") return (
    <AbsoluteFill style={{ background: "#000" }}>
      {p.plate && <Plate p={p.plate} />}
      <AbsoluteFill style={{ background: "linear-gradient(115deg, rgba(255,150,60,0.30), transparent 55%)", mixBlendMode: "screen" }} />
      <Vig k={0.6} />{p.text && <T t={{ font: "Oswald", ...p.text }} />}
    </AbsoluteFill>
  );
  if (p.v === "R2") return (
    <AbsoluteFill style={{ background: "#000" }}>
      {p.plate && <Plate p={{ blur: 9, grade: "brightness(0.62) saturate(1.2)", ...p.plate }} />}
      <Stickers id="stk2" actors={p.stickers} props={p.props} />
      {p.text && <T t={p.text} />}
    </AbsoluteFill>
  );
  if (p.v === "R3") return (
    <AbsoluteFill style={{ background: p.bg ?? "radial-gradient(circle at 70% 45%, #ff9a3c 0%, #e63946 55%, #6b1b3a 100%)" }}>
      <svg width={1280} height={720} style={{ position: "absolute", inset: 0 }}>
        <g opacity={0.18} fill="#fff">{Array.from({ length: 18 }).map((_, i) => { const a0 = (i / 18) * Math.PI * 2, a1 = a0 + 0.12; return <path key={i} d={`M 880 330 L ${880 + Math.cos(a0) * 1600} ${330 + Math.sin(a0) * 1600} L ${880 + Math.cos(a1) * 1600} ${330 + Math.sin(a1) * 1600} Z`} />; })}</g>
      </svg>
      <Stickers id="stk3" props={p.props} r={8} />
      {p.face && <svg width={1280} height={720} style={{ position: "absolute", inset: 0 }}><g transform={`translate(${p.face.x} ${p.face.y}) scale(${p.face.s})`}><Portrait id={p.face.id} emotion={p.face.emotion} viseme={p.face.viseme ?? null} /></g></svg>}
      {p.text && <T t={p.text} />}
    </AbsoluteFill>
  );
  if (p.v === "R4") return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 0, 56% 0, 44% 100%, 0 100%)" }}>
        {p.plate && <Plate p={p.plate} />}<AbsoluteFill style={{ background: `linear-gradient(90deg, ${p.tintL ?? "rgba(40,90,180,0.35)"}, transparent 70%)` }} />
      </div>
      <div style={{ position: "absolute", inset: 0, clipPath: "polygon(56% 0, 100% 0, 100% 100%, 44% 100%)" }}>
        {p.plate2 && <Plate p={p.plate2} />}<AbsoluteFill style={{ background: `linear-gradient(270deg, ${p.tintR ?? "rgba(255,140,60,0.35)"}, transparent 70%)` }} />
      </div>
      <svg width={1280} height={720} style={{ position: "absolute", inset: 0 }}><path d="M 717 0 L 563 720" stroke="#fff" strokeWidth={12} /></svg>
      {p.text && <T t={p.text} />}{p.text2 && <T t={p.text2} />}
    </AbsoluteFill>
  );
  if (p.v === "R5") return (
    <AbsoluteFill style={{ background: "#000" }}>
      {p.plate && <Plate p={p.plate} />}
      {p.circle && <svg width={1280} height={720} style={{ position: "absolute", inset: 0 }}>
        <ellipse cx={p.circle.x} cy={p.circle.y} rx={p.circle.rx} ry={p.circle.ry} fill="none" stroke={INK} strokeWidth={18} />
        <ellipse cx={p.circle.x} cy={p.circle.y} rx={p.circle.rx} ry={p.circle.ry} fill="none" stroke={RED} strokeWidth={10} /></svg>}
      <Vig k={0.45} />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ background: p.bg ?? "linear-gradient(160deg, #ffe066 0%, #ffd23f 45%, #ffb703 100%)" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 32% 55%, rgba(255,255,255,0.75), transparent 45%)" }} />
      <Stickers id="stk6" actors={p.stickers} props={p.props} r={10} />
      {p.text && <T t={p.text} shadow={`6px 6px 0 ${INK}`} />}
    </AbsoluteFill>
  );
};
