import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Character } from "../characters/Character";
import { useFonts } from "../lib/fonts";
import type { Action, CharId, Emotion } from "../lib/timeline";
import { LOCATIONS } from "../scene/Locations";
import { DETAILS } from "../scene/Details";
import { Logo } from "./Brand";
import sfxLib from "../audio/sfx.json";

/* Intro alternatif 6 detik (usulan). B = mini-adegan komedi (Kusaka telat, gerbang menutup, zoom ke lambang → lencana).
 * C = panel komik bergerak (6 panel → lencana). Teks = nama channel resmi saja. Suara = pustaka SFX orisinal. */
export const INTRO_ALT_SECONDS = 6;
const FPS = 30;
const YEL = "#ffd23f", RED = "#e63946", INK = "#1b1b1b";
const ease = (x: number) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
const back = (x: number) => { const c1 = 1.7, c3 = c1 + 1, k = Math.min(Math.max(x, 0), 1); return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const sfx = (id: keyof typeof sfxLib.sfx, at: number, k = 1) => (
  <Sequence key={`${id}${at}`} from={Math.round(at * FPS)}><Audio src={staticFile(`sfx/${id}.mp3`)} volume={sfxLib.sfx[id].volume * k} /></Sequence>
);

const Rays: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`rotate(${t * 8} 960 540)`}>
    <rect x={-1200} y={-1200} width={4320} height={3480} fill={YEL} />
    {Array.from({ length: 24 }).map((_, i) => { const a0 = (i / 24) * Math.PI * 2, a1 = a0 + Math.PI / 24;
      return <path key={i} d={`M 960 540 L ${960 + Math.cos(a0) * 2400} ${540 + Math.sin(a0) * 2400} L ${960 + Math.cos(a1) * 2400} ${540 + Math.sin(a1) * 2400} Z`} fill={RED} opacity={0.9} />; })}
  </g>
);
const Badge: React.FC<{ k: number; shake?: number; y?: number }> = ({ k, shake = 0, y = -150 }) => (
  <div style={{ position: "absolute", left: 960 - 280 + shake, top: 260 + y, width: 560, height: 560, transform: `scale(${0.78 * k})`, transformOrigin: "50% 50%" }}>
    <div style={{ width: 800, height: 800, transform: "scale(0.7)", transformOrigin: "0 0" }}><Logo variant={2} /></div>
  </div>
);
const Title: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 612, textAlign: "center", opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>
    <div style={{ fontFamily: "Bangers", fontSize: 172, letterSpacing: 6, color: YEL, WebkitTextStroke: `16px ${INK}`, paintOrder: "stroke fill", textShadow: `10px 10px 0 ${RED}`, lineHeight: 1 }}>KUSAKA</div>
    <div style={{ fontFamily: "Baloo2", fontWeight: 800, fontSize: 60, letterSpacing: 22, color: "#fff", WebkitTextStroke: `10px ${INK}`, paintOrder: "stroke fill", marginTop: 6 }}>DESIGN</div>
  </div>
);
const Frame: React.FC = () => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <rect x={7} y={7} width={1906} height={1066} fill="none" stroke={INK} strokeWidth={6} /><rect x={20} y={20} width={1880} height={1040} fill="none" stroke="#fff" strokeWidth={10} opacity={0.9} />
  </svg>
);
const Stars: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (
  <g transform={`translate(${x} ${y})`} opacity={1 - k}>
    {[0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * Math.PI * 2 + k * 3; return <path key={i} d="M 0 -22 L 6 -6 L 22 0 L 6 6 L 0 22 L -6 6 L -22 0 L -6 -6 Z" fill={YEL} stroke={INK} strokeWidth={4} transform={`translate(${Math.cos(a) * 70} ${Math.sin(a) * 28 - 10}) scale(${0.8 + k})`} />; })}
  </g>
);

/* ------------------------------- B: mini-adegan komedi ------------------------------- */
export const IntroB: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame(), t = frame / FPS;
  const gate = ease((t - 0.7) / 0.9);                          // gerbang menutup 0,7–1,6
  const kx = t < 1.85 ? -200 + (t / 1.85) * 950 : 750;         // Kusaka berlari, mentok di gerbang (1,85 dtk)
  const run = t < 1.85;
  const bonk = t >= 1.85 && t < 2.6;
  const zoom = ease((t - 2.7) / 0.7);                          // zoom ke lambang sekolah di lengkung gerbang
    const cardK = t >= 3.4 ? back((t - 3.4) / 0.5) : 0;
  const flash = t > 3.35 && t < 3.55 ? 1 - (t - 3.35) / 0.2 : 0;
  const loc = LOCATIONS.gerbang, Detail = DETAILS.gerbang;
  const shake = bonk && t < 2.2 ? Math.sin((t - 1.85) * 80) * 8 * (1 - (t - 1.85) / 0.35) : 0;
  return (
    <AbsoluteFill style={{ background: "#8fd6ff" }}>
      {t < 3.45 && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <rect width={1920} height={1080} fill={RED} />
          <defs><clipPath id="iris"><circle cx={750} cy={420} r={Math.max(0, 1700 * Math.pow(1 - zoom, 2))} /></clipPath></defs>
          <g clipPath="url(#iris)" transform={`translate(${shake} 0)`}>
            {loc.layers.map((l, i) => <g key={i}>{l.el(t, { gate })}</g>)}
            {Detail && <Detail t={t} />}
            <g transform="translate(0 0)">
              <Character id="kusaka" x={kx} y={960} facing={1} frame={frame} bag walk={run ? (kx / 42) : undefined}
                force={{ emotion: bonk ? "shock" : run ? "pleading" : "defeated", action: bonk ? "shock" : run ? "idle" : "slump", noFx: !bonk }} />
              <Character id="mangUdin" x={1230} y={960} facing={-1} frame={frame}
                force={{ emotion: "smug", action: t < 1.6 ? "pull" : t < 2.7 ? "hips" : "point", noFx: true }} />
              {bonk && <Stars x={kx + 70} y={500} k={Math.min(1, (t - 1.85) / 0.7)} />}
            </g>
          </g>
        </svg>
      )}
      {t >= 3.4 && (
        <AbsoluteFill>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><Rays t={t} /></svg>
          <Badge k={cardK} />
          {t >= 4.0 && <Title k={ease((t - 4.0) / 0.45)} />}
          <Frame />
        </AbsoluteFill>
      )}
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash }} />}
      {sfx("whoosh", 0)}{sfx("whoosh_soft", 0.7)}{sfx("bonk", 1.85, 1)}{sfx("boing", 2.0, 0.8)}{sfx("vine_boom", 3.4, 0.8)}{sfx("ding_idea", 4.1)}
    </AbsoluteFill>
  );
};

/* ------------------------------- C: panel komik bergerak ------------------------------- */
type P = { id: CharId; emotion: Emotion; action: Action; bg: string };
const PANELS: P[] = [
  { id: "kusaka", emotion: "smug", action: "thumbsup", bg: YEL }, { id: "nadia", emotion: "smug", action: "hips", bg: "#e85d75" }, { id: "ujang", emotion: "deadpan", action: "crossed", bg: "#2f7fd8" },
  { id: "ucok", emotion: "laugh", action: "point", bg: "#f08a24" }, { id: "dinda", emotion: "smug", action: "peace", bg: "#6c3fc4" }, { id: "pakDarto", emotion: "suspicious", action: "crossed", bg: "#3c8d5a" },
];
export const IntroC: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame(), t = frame / FPS;
  const out = ease((t - 2.5) / 0.5);                       // panel menyusut & menghilang
  const cardK = t >= 3.0 ? back((t - 3.0) / 0.5) : 0;
  const flash = t > 2.95 && t < 3.15 ? 1 - (t - 2.95) / 0.2 : 0;
  const w = 600, h = 420, gx = 28, gy = 28, x0 = (1920 - (3 * w + 2 * gx)) / 2, y0 = (1080 - (2 * h + gy)) / 2;
  return (
    <AbsoluteFill style={{ background: YEL }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <Rays t={t} />
        {t < 3.1 && PANELS.map((p, i) => {
          const e = back((t - 0.25 - i * 0.28) / 0.35); if (t < 0.25 + i * 0.28) return null;
          const cx = x0 + (i % 3) * (w + gx) + w / 2, cy = y0 + Math.floor(i / 3) * (h + gy) + h / 2;
          const sc = Math.max(0, e) * (1 - out * 0.7), rot = (i % 2 ? 2 : -2) * (1 - Math.min(1, e));
          return (
            <g key={p.id} transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${sc}) translate(${-w / 2} ${-h / 2})`} opacity={1 - out}>
              <rect x={-12} y={-12} width={w + 24} height={h + 24} rx={14} fill="#fff" stroke={INK} strokeWidth={8} />
              <clipPath id={`cp${i}`}><rect width={w} height={h} rx={8} /></clipPath>
              <g clipPath={`url(#cp${i})`}>
                <rect width={w} height={h} fill={p.bg} />
                <g opacity={0.22} fill="#fff">{Array.from({ length: 18 }).map((_, k) => <circle key={k} cx={(k % 6) * 110 + 30} cy={Math.floor(k / 6) * 120 + 50} r={12 + (k % 3) * 6} />)}</g>
                <path d={`M 0 ${h - 70} L ${w} ${h - 100} L ${w} ${h} L 0 ${h} Z`} fill="#000" opacity={0.18} />
                <Character id={p.id} x={w / 2} y={h - 14} facing={i % 2 ? -1 : 1} frame={frame} scale={0.44} force={{ emotion: p.emotion, action: p.action, noFx: true }} />
              </g>
              <rect width={w} height={h} rx={8} fill="none" stroke={INK} strokeWidth={6} />
            </g>
          );
        })}
      </svg>
      {t >= 3.0 && <Badge k={cardK} />}
      {t >= 3.5 && <Title k={ease((t - 3.5) / 0.45)} />}
      <Frame />
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash }} />}
      {sfx("whoosh", 0)}{PANELS.map((_, i) => sfx("pop", 0.3 + i * 0.28, 0.9))}{sfx("whoosh_soft", 2.5)}{sfx("vine_boom", 3.0, 0.8)}{sfx("ding_idea", 3.6)}
    </AbsoluteFill>
  );
};
