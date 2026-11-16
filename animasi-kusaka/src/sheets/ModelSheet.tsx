import React from "react";
import { AbsoluteFill } from "remotion";
import canon from "../characters/canon.json";
import { Character, LOOKS, Portrait } from "../characters/Character";
import { Mouth, MouthShape } from "../characters/Mouth";
import { Hand, HandShape } from "../characters/Hands";
import { useFonts } from "../lib/fonts";
import type { Action, CharId, Emotion, Viseme } from "../lib/timeline";

const OUT = "#1b1b1b";
const PAPER = "#fdf6e3";
const INK = "#2b2b2b";

export const EMOTIONS: [Emotion, string][] = [
  ["neutral", "Netral"], ["smug", "Sombong"], ["suspicious", "Curiga"], ["surprised", "Terkejut"], ["shock", "Kaget berat"],
  ["laugh", "Tertawa"], ["pleading", "Memohon"], ["deadpan", "Datar"], ["embarrassed", "Panik / malu"], ["defeated", "Lesu"],
];
export const MOUTHS: [MouthShape, string][] = [
  ["rest", "diam"], ["A", "A"], ["I", "I"], ["U", "U"], ["E", "E"], ["O", "O"], ["M", "M/B/P"], ["F", "F/V"],
  ["consonant", "konsonan"], ["smirk", "senyum miring"], ["frown", "cemberut"], ["flat", "datar"], ["wobble", "gemetar"],
  ["shock", "kaget"], ["laugh", "tertawa"], ["smile", "senyum"],
];
export const POSES: [Action, Emotion, string, Viseme | null][] = [
  ["idle", "neutral", "Diam", null], ["gesture", "neutral", "Bicara", "A"], ["pocket", "smug", "Rogoh saku", null],
  ["chin", "suspicious", "Pegang dagu", null], ["point", "laugh", "Menunjuk", "A"], ["plead", "pleading", "Memohon", null],
  ["crossed", "deadpan", "Lipat tangan", null], ["shock", "shock", "Kaget", "O"], ["laugh", "laugh", "Tertawa", "A"],
  ["slump", "defeated", "Lemas", null], ["wave", "neutral", "Melambai", "E"], ["thumbsup", "smug", "Jempol", null],
  ["peace", "laugh", "Peace", null], ["facepalm", "defeated", "Tepuk jidat", null], ["hips", "suspicious", "Kacak pinggang", null],
  ["phone", "neutral", "Main HP", null],
];
export const HANDS: [HandShape, string][] = [
  ["relaxed", "santai"], ["open", "terbuka"], ["fist", "kepal"], ["point", "tunjuk"], ["thumbsup", "jempol"],
  ["peace", "peace"], ["wave", "lambai"], ["phone", "pegang HP"],
];

const Label: React.FC<{ x: number; y: number; size?: number; children: React.ReactNode; anchor?: "start" | "middle" | "end"; color?: string; font?: string }> =
  ({ x, y, size = 30, children, anchor = "middle", color = INK, font = "Baloo2" }) => (
    <text x={x} y={y} fontSize={size} fontFamily={font} fill={color} textAnchor={anchor}>{children}</text>
  );

const SectionTitle: React.FC<{ x: number; y: number; children: React.ReactNode; color: string }> = ({ x, y, children, color }) => (
  <g>
    <rect x={x} y={y - 42} width={14} height={50} fill={color} />
    <Label x={x + 30} y={y} size={50} anchor="start" font="Bangers">{children}</Label>
  </g>
);

export const ModelSheet: React.FC<{ id: CharId }> = ({ id }) => {
  useFonts();
  const c = canon.characters[id];
  const look = LOOKS[id];
  const accent = c.palette.accent;
  const W = 3200, H = 2760;
  const heroScale = 1.5, floor = 1660, heroX = 420;
  const marks: [number, string][] = [[0, "kaki"], [-240, "pinggul"], [-462, "bahu / leher"], [-735, "puncak kepala"],
    ...(look.hairStyle === "spiky" ? [[-794, "puncak rambut"] as [number, string]] : [])];

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <svg width={W} height={H}>
        <defs>
          <pattern id="grid" width={40} height={40} patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e9dfc4" strokeWidth={2} />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />

        {/* ---------- header ---------- */}
        <rect width={W} height={170} fill={OUT} />
        <rect y={170} width={W} height={14} fill={accent} />
        <Label x={60} y={130} size={130} anchor="start" font="Bangers" color="#ffd23f">{c.name.toUpperCase()}</Label>
        <Label x={60 + c.name.length * 72 + 40} y={124} size={48} anchor="start" color="#fff">{c.role} · {c.age} th · {c.school}</Label>
        <g transform={`translate(${W - 820} 40)`}>
          <rect width={760} height={92} rx={16} fill={accent} stroke="#fff" strokeWidth={5} />
          {/* padlock */}
          <g transform="translate(52 48)" fill="none" stroke="#fff" strokeWidth={7}>
            <path d="M -16 -6 L -16 -20 Q -16 -36 0 -36 Q 16 -36 16 -20 L 16 -6" />
            <rect x={-24} y={-6} width={48} height={36} rx={6} fill="#fff" />
          </g>
          <Label x={420} y={66} size={52} font="Bangers" color="#fff">MODEL SHEET v{canon.version} · TERKUNCI</Label>
        </g>

        {/* ---------- hero + proportion ruler ---------- */}
        <SectionTitle x={40} y={260} color={accent}>KANON 3/4 · PROPORSI</SectionTitle>
        {marks.map(([y, name]) => (
          <g key={name}>
            <line x1={60} x2={800} y1={floor + y * heroScale * look.height} y2={floor + y * heroScale * look.height} stroke={accent} strokeWidth={3} strokeDasharray="14 10" opacity={0.7} />
            <Label x={60} y={floor + y * heroScale * look.height - 10} size={26} anchor="start" color={accent}>{name}</Label>
          </g>
        ))}
        <Character id={id} x={heroX} y={floor} facing={1} frame={0} scale={heroScale} force={{ emotion: "neutral", action: "idle", noFx: true }} />
        <Label x={heroX} y={floor + 70} size={30}>kepala ≈ 35% tinggi badan · menghadap kiri = cermin</Label>

        {/* ---------- expressions ---------- */}
        <SectionTitle x={880} y={260} color={accent}>EKSPRESI (10)</SectionTitle>
        {EMOTIONS.map(([emo, name], i) => {
          const cx = 1030 + (i % 5) * 290, cy = 700 + Math.floor(i / 5) * 460;
          return (
            <g key={emo}>
              <rect x={cx - 135} y={cy - 410} width={270} height={430} rx={18} fill="#fff" stroke="#d8ccae" strokeWidth={4} />
              <g transform={`translate(${cx - 14} ${cy - 30}) scale(0.9)`}><Portrait id={id} emotion={emo} /></g>
              <Label x={cx} y={cy + 2} size={32}>{name}</Label>
            </g>
          );
        })}

        {/* ---------- mouth chart ---------- */}
        <SectionTitle x={880} y={1300} color={accent}>MULUT · LIP-SYNC & EKSPRESI (16)</SectionTitle>
        {MOUTHS.map(([shape, name], i) => {
          const cx = 970 + (i % 8) * 172, cy = 1430 + Math.floor(i / 8) * 210;
          return (
            <g key={shape}>
              <rect x={cx - 80} y={cy - 90} width={160} height={190} rx={16} fill={look.skin} stroke={OUT} strokeWidth={4} />
              <g transform={`translate(${cx} ${cy - 10}) scale(1.6)`}><Mouth shape={shape} intensity={shape === "shock" ? 1.1 : 1} /></g>
              <Label x={cx} y={cy + 86} size={name.length > 9 ? 21 : 26}>{name}</Label>
            </g>
          );
        })}

        {/* ---------- profile ---------- */}
        <SectionTitle x={2350} y={260} color={accent}>PROFIL</SectionTitle>
        <g transform="translate(2370 320)">
          <Label x={0} y={30} size={34} anchor="start" color={accent}>Sifat</Label>
          {c.personality.map((p, i) => <Label key={p} x={0} y={78 + i * 44} size={32} anchor="start">• {p}</Label>)}
          <Label x={0} y={300} size={34} anchor="start" color={accent}>Ciri khas (wajib ada)</Label>
          {c.signature.map((p, i) => <Label key={p} x={0} y={348 + i * 44} size={30} anchor="start">✓ {p}</Label>)}
          <Label x={0} y={570} size={34} anchor="start" color={accent}>Kalimat khas</Label>
          <Label x={0} y={616} size={34} anchor="start">“{c.catchphrase}”</Label>
          <Label x={0} y={700} size={34} anchor="start" color={accent}>Suara (ElevenLabs)</Label>
          <Label x={0} y={746} size={30} anchor="start">{c.voice.label} · {c.voice.model_id}</Label>
          <Label x={0} y={788} size={26} anchor="start" color="#777">voice_id {c.voice.voice_id}</Label>
        </g>

        {/* ---------- palette ---------- */}
        <SectionTitle x={2350} y={1300} color={accent}>PALET WARNA</SectionTitle>
        {Object.entries(c.palette).map(([k, v], i) => {
          const x = 2380 + (i % 4) * 200, y = 1350 + Math.floor(i / 4) * 210;
          return (
            <g key={k}>
              <rect x={x} y={y} width={170} height={120} rx={14} fill={v} stroke={OUT} strokeWidth={5} />
              <Label x={x + 85} y={y + 158} size={26}>{k}</Label>
              <Label x={x + 85} y={y + 188} size={24} color="#777">{v}</Label>
            </g>
          );
        })}

        {/* ---------- hand library ---------- */}
        <rect x={0} y={1790} width={W} height={H - 1790} fill="#f4ead0" />
        <SectionTitle x={40} y={1860} color={accent}>TANGAN · 4 JARI + JEMPOL (8)</SectionTitle>
        {HANDS.map(([shape, name], i) => {
          const cx = 250 + i * 390, cy = 1990;
          return (
            <g key={shape}>
              <rect x={cx - 150} y={cy - 100} width={300} height={190} rx={18} fill="#fff" stroke="#d8ccae" strokeWidth={4} />
              {/* wrist + hand, pointing up */}
              <g transform={shape === "thumbsup" ? `translate(${cx - 70} ${cy + 30}) scale(2.1)` : `translate(${cx - 20} ${cy + 20}) rotate(-90) scale(2.1)`}>
                <path d="M -40 0 L 0 0" stroke={OUT} strokeWidth={40 / 2.1} strokeLinecap="round" />
                <path d="M -40 0 L 0 0" stroke={look.skin} strokeWidth={28 / 2.1} strokeLinecap="round" />
                <Hand shape={shape} skin={look.skin} scale={1} />
              </g>
              <Label x={cx + 90} y={cy + 76} size={28} anchor="middle">{name}</Label>
            </g>
          );
        })}

        {/* ---------- pose library ---------- */}
        <SectionTitle x={40} y={2160} color={accent}>PUSTAKA POSE ({POSES.length})</SectionTitle>
        {POSES.map(([action, emo, name, vis], i) => {
          const cx = 100 + i * 194, fy = 2660;
          return (
            <g key={action}>
              <Character id={id} x={cx} y={fy} facing={1} frame={0} scale={0.5 / look.height} force={{ action, emotion: emo, viseme: vis }} />
              <Label x={cx} y={fy + 50} size={26}>{name}</Label>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Whole cast side by side for height & style comparison (canonical facing). */
export const Lineup: React.FC = () => {
  useFonts();
  const ids = Object.keys(canon.characters) as CharId[];
  const W = 3000, H = 1400, floor = 1220;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <svg width={W} height={H}>
        <rect width={W} height={140} fill={OUT} />
        <Label x={60} y={104} size={96} anchor="start" font="Bangers" color="#ffd23f">LINEUP PEMERAN</Label>
        <Label x={W - 60} y={96} size={44} anchor="end" color="#fff">kanon v{canon.version} · tinggi & proporsi · menghadap kiri = cermin</Label>
        {[-860, -740, -468, -240, 0].map((y) => (
          <line key={y} x1={40} x2={W - 40} y1={floor + y} y2={floor + y} stroke="#c9b98f" strokeWidth={3} strokeDasharray="14 10" />
        ))}
        {ids.map((id, i) => {
          const x = 330 + i * 590;
          const c = canon.characters[id];
          const emo: Emotion = (["smug", "deadpan", "neutral", "laugh", "suspicious"] as Emotion[])[i % 5];
          const act: Action = (["thumbsup", "crossed", "hips", "peace", "idle"] as Action[])[i % 5];
          return (
            <g key={id}>
              <Character id={id} x={x} y={floor} facing={1} frame={0} force={{ emotion: emo, action: act, noFx: true }} />
              <Label x={x} y={floor + 70} size={56} font="Bangers" color={c.palette.accent}>{c.name.toUpperCase()}</Label>
              <Label x={x} y={floor + 112} size={30}>{c.role}</Label>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
