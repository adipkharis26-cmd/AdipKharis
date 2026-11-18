import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Character } from "../characters/Character";
import { useFonts } from "../lib/fonts";
import type { Action, CharId, Emotion } from "../lib/timeline";
import { Logo } from "./Brand";
import sfxLib from "../audio/sfx.json";

/* INTRO 10 detik (video panjang 16:9 saja), kanon brand v1.7.0. Konsep A (pilihan pemilik): lencana Logo 2 meledak keluar,
 * parade 16 karakter dalam panel komik (4 kelompok × 4), lencana kembali + KUSAKA DESIGN. Dipasang SETELAH adegan pembuka (cold open).
 * Teks di intro = nama channel resmi saja (pengecualian merek). Suara = pustaka SFX orisinal, volume rendah. */
export const INTRO_SECONDS = 10;
const FPS = 30;
const YEL = "#ffd23f", RED = "#e63946", INK = "#1b1b1b";

type P = { id: CharId; emotion: Emotion; action: Action; bg: string; face: 1 | -1 };
const GROUPS: P[][] = [
  [{ id: "kusaka", emotion: "smug", action: "thumbsup", bg: YEL, face: 1 }, { id: "ujang", emotion: "deadpan", action: "crossed", bg: "#2f7fd8", face: -1 },
   { id: "nadia", emotion: "smug", action: "hips", bg: "#e85d75", face: 1 }, { id: "sasa", emotion: "laugh", action: "phone", bg: "#2aa6a0", face: -1 }],
  [{ id: "ucok", emotion: "laugh", action: "point", bg: "#f08a24", face: 1 }, { id: "bimo", emotion: "smug", action: "thumbsup", bg: "#6c3fc4", face: -1 },
   { id: "dinda", emotion: "smug", action: "peace", bg: "#e85d75", face: 1 }, { id: "raka", emotion: "neutral", action: "phone", bg: "#3c8d5a", face: -1 }],
  [{ id: "pakDarto", emotion: "suspicious", action: "crossed", bg: "#8d939c", face: 1 }, { id: "buWati", emotion: "deadpan", action: "crossed", bg: "#6c3fc4", face: -1 },
   { id: "pakJoko", emotion: "neutral", action: "hips", bg: "#2f7fd8", face: 1 }, { id: "mangUdin", emotion: "smug", action: "point", bg: "#3c8d5a", face: -1 }],
  [{ id: "buIjah", emotion: "laugh", action: "gesture", bg: "#f08a24", face: 1 }, { id: "ibu", emotion: "suspicious", action: "hips", bg: RED, face: -1 },
   { id: "bapak", emotion: "laugh", action: "thumbsup", bg: "#2aa6a0", face: 1 }, { id: "tara", emotion: "smug", action: "wave", bg: YEL, face: -1 }],
];
const T0 = 1.9, GD = 1.3; // parade mulai 1,9 dtk, tiap kelompok 1,3 dtk
const ease = (x: number) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
const back = (x: number) => { const c1 = 1.7, c3 = c1 + 1, k = Math.min(Math.max(x, 0), 1); return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };

const Rays: React.FC<{ t: number; color: string }> = ({ t, color }) => (
  <g transform={`rotate(${t * 6} 960 540)`} opacity={0.9}>
    {Array.from({ length: 24 }).map((_, i) => { const a0 = (i / 24) * Math.PI * 2, a1 = a0 + Math.PI / 24;
      return <path key={i} d={`M 960 540 L ${960 + Math.cos(a0) * 2400} ${540 + Math.sin(a0) * 2400} L ${960 + Math.cos(a1) * 2400} ${540 + Math.sin(a1) * 2400} Z`} fill={color} />; })}
  </g>
);
const Dots: React.FC = () => (
  <g fill="#fff" opacity={0.2}>{Array.from({ length: 33 * 19 }).map((_, i) => { const c = i % 33, r = Math.floor(i / 33);
    return <circle key={i} cx={c * 60 + (r % 2) * 30} cy={r * 60} r={3 + 5 * Math.abs(Math.sin(c * 0.5 + r * 0.4))} />; })}</g>
);
const MiniLogo: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, position: "relative" }}>
    <div style={{ width: 800, height: 800, transform: `scale(${size / 800})`, transformOrigin: "0 0", position: "absolute" }}><Logo variant={2} /></div>
  </div>
);

const Panel: React.FC<{ p: P; i: number; g: number; local: number; frame: number }> = ({ p, i, g, local, frame }) => {
  const w = 410, h = 690, x = 78 + i * (w + 34), y = 200;
  const enter = back((local - i * 0.09) / 0.38), exit = ease((local - (GD - 0.3)) / 0.3);
  const dy = (1 - Math.min(1, enter)) * 900 - exit * 900;
  const rot = (i % 2 ? 2.2 : -2.2) * (1 - Math.min(1, enter) * 0.4);
  if (local < i * 0.09 || exit >= 1) return null;
  return (
    <g transform={`translate(${x + w / 2} ${y + h / 2 + dy}) rotate(${rot}) translate(${-w / 2} ${-h / 2})`}>
      <rect x={-12} y={-12} width={w + 24} height={h + 24} rx={14} fill="#fff" stroke={INK} strokeWidth={8} />
      <clipPath id={`pc${g}-${i}`}><rect width={w} height={h} rx={8} /></clipPath>
      <g clipPath={`url(#pc${g}-${i})`}>
        <rect width={w} height={h} fill={p.bg} />
        <g opacity={0.25} fill="#fff">{Array.from({ length: 14 }).map((_, k) => <circle key={k} cx={(k % 4) * 110 + 30} cy={Math.floor(k / 4) * 110 + 60} r={14 + (k % 3) * 6} />)}</g>
        <path d={`M 0 ${h - 110} L ${w} ${h - 150} L ${w} ${h} L 0 ${h} Z`} fill="#000" opacity={0.18} />
        <Character id={p.id} x={w / 2} y={h - 24} facing={p.face} frame={frame} scale={0.72}
          force={{ emotion: p.emotion, action: p.action, noFx: true }} />
      </g>
      <rect width={w} height={h} rx={8} fill="none" stroke={INK} strokeWidth={6} />
    </g>
  );
};

/** Intro 10 detik. Pakai di dalam <Sequence> (frame lokal 0..299). */
export const Intro: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const burst = 1 - ease(t / 0.5);
  // fase A: lencana meledak keluar (0.1–1.9) | fase C: lencana kembali (7.1–10)
  const aIn = back((t - 0.1) / 0.7), aOut = ease((t - 1.4) / 0.5);
  const cT = t - 7.1, cIn = cT >= 0 ? back(cT / 0.5) : 0;
  const shake = cT > 0 && cT < 0.35 ? Math.sin(cT * 90) * 10 * (1 - cT / 0.35) : 0;
  const logoScale = t < 7.1 ? Math.max(0, aIn) * (1 - aOut) : 0.78 * (0.45 + 0.55 * cIn);
  const logoY = t < 7.1 ? 0 : -150;
  const groupIdx = Math.floor((t - T0) / GD);
  const flash = (t > 7.1 && t < 7.25 ? 1 - (t - 7.1) / 0.15 : 0) + burst * 0.8;
  const titleK = ease((t - 7.5) / 0.45);
  return (
    <AbsoluteFill style={{ background: YEL }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <rect width={1920} height={1080} fill={YEL} />
        <Rays t={t} color={RED} />
        <Dots />
        {t >= T0 && t < T0 + GD * 4 && groupIdx >= 0 && groupIdx < 4 && GROUPS[groupIdx].map((p, i) => (
          <Panel key={`${groupIdx}-${p.id}`} p={p} i={i} g={groupIdx} local={t - T0 - groupIdx * GD} frame={frame} />
        ))}
        <rect x={7} y={7} width={1906} height={1066} fill="none" stroke={INK} strokeWidth={6} />
        <rect x={20} y={20} width={1880} height={1040} fill="none" stroke="#fff" strokeWidth={10} opacity={0.9} />
      </svg>
      {logoScale > 0.01 && (
        <div style={{ position: "absolute", left: 960 - 280 + shake, top: 540 - 280 + logoY, transform: `scale(${logoScale})`, transformOrigin: "50% 50%" }}>
          <MiniLogo size={560} />
        </div>
      )}
      {t >= 7.5 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 612, textAlign: "center", opacity: titleK, transform: `translateY(${(1 - titleK) * 40}px)` }}>
          <div style={{ fontFamily: "Bangers", fontSize: 172, letterSpacing: 6, color: YEL, WebkitTextStroke: `16px ${INK}`, paintOrder: "stroke fill", textShadow: `10px 10px 0 ${RED}`, lineHeight: 1 }}>KUSAKA</div>
          <div style={{ fontFamily: "Baloo2", fontWeight: 800, fontSize: 60, letterSpacing: 22, color: "#fff", WebkitTextStroke: `10px ${INK}`, paintOrder: "stroke fill", marginTop: 6 }}>DESIGN</div>
        </div>
      )}
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: Math.min(1, flash) }} />}
      {/* suara orisinal (pustaka sfx.json), volume rendah */}
      <Sequence from={0}><Audio src={staticFile("sfx/whoosh.mp3")} volume={sfxLib.sfx.whoosh.volume} /></Sequence>
      <Sequence from={Math.round(0.35 * FPS)}><Audio src={staticFile("sfx/pop.mp3")} volume={sfxLib.sfx.pop.volume} /></Sequence>
      {[0, 1, 2, 3].map((k) => <Sequence key={k} from={Math.round((T0 + k * GD) * FPS)}><Audio src={staticFile("sfx/whoosh_soft.mp3")} volume={sfxLib.sfx.whoosh_soft.volume} /></Sequence>)}
      {[0, 1, 2, 3].flatMap((k) => [0, 1, 2, 3].map((i) => <Sequence key={`p${k}${i}`} from={Math.round((T0 + k * GD + i * 0.09 + 0.2) * FPS)}><Audio src={staticFile("sfx/pop.mp3")} volume={sfxLib.sfx.pop.volume * 0.6} /></Sequence>))}
      <Sequence from={Math.round(7.1 * FPS)}><Audio src={staticFile("sfx/vine_boom.mp3")} volume={sfxLib.sfx.vine_boom.volume * 0.8} /></Sequence>
      <Sequence from={Math.round(7.7 * FPS)}><Audio src={staticFile("sfx/ding_idea.mp3")} volume={sfxLib.sfx.ding_idea.volume} /></Sequence>
    </AbsoluteFill>
  );
};
