import React from "react";
import { UpacaraCap } from "../characters/Props";

/* Extras (NPC latar) — murid/guru/warga anonim agar tempat terasa hidup (kanon lokasi v3.1.0).
   Bukan 16 karakter kanon: tanpa nama, tanpa dialog, selalu di belakang pemeran, bergerak pelan.
   Gambar saja — tanpa teks. Posisi deterministik per lokasi sehingga konsisten antar-adegan. */
const OUT = "#1b1b1b";
const rnd = (i: number, s = 1) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const pick = <T,>(a: T[], i: number, s: number) => a[Math.floor(rnd(i, s) * a.length) % a.length];

type Kind = "stand" | "sit" | "walk" | "talk" | "play";
type Outfit = "sma" | "smaGirl" | "hijab" | "guru" | "warga" | "olahraga";
interface Spec { x: number; y: number; s: number; kind: Kind; outfit: Outfit; seed: number; dir?: 1 | -1;
  /** Pejalan lewat: [px/dtk (tanda = arah), panjang siklus px, offset px]. x = titik masuk; lewat berulang tiap siklus. */
  pass?: [number, number, number] }

const SKIN = ["#f4c99e", "#e0ab7e", "#c98f62", "#a8714a", "#8a5a3a", "#f7d6b5"];
const HAIR = ["#1e1b26", "#2b1d14", "#3b2a1f", "#1b1b1b", "#4a3326"];
const WARGA = ["#e85d75", "#2f7fd8", "#3c8d5a", "#f3a03c", "#8f5bd1", "#2aa6a0", "#d95f3b"];

const STUDENT_OUTFITS: Outfit[] = ["sma", "smaGirl", "hijab"];
const Figure: React.FC<Spec & { t: number; bag?: boolean; salute?: number; hat?: boolean }> = ({ x, y, s, kind, outfit, seed, dir = 1, t, bag, salute = 0, hat }) => {
  const skin = pick(SKIN, seed, 1), hair = pick(HAIR, seed, 2);
  const warga = pick(WARGA, seed, 3);
  const shirt = outfit === "sma" || outfit === "smaGirl" || outfit === "hijab" ? "#fbfbf7" : outfit === "guru" ? "#b9764b" : outfit === "olahraga" ? "#2f7fd8" : warga;
  const bottom = outfit === "sma" ? "#7b818c" : outfit === "smaGirl" || outfit === "hijab" ? "#7b818c" : outfit === "olahraga" ? "#1d3f7a" : outfit === "guru" ? "#3a3f4b" : "#4b5563";
  const long = outfit === "smaGirl" || outfit === "hijab" || (outfit === "warga" && rnd(seed, 4) > 0.55);
  const ph = seed * 1.7;
  const sway = kind === "stand" || kind === "talk" ? Math.sin(t * 1.3 + ph) * 3 : 0;
  const bob = kind === "walk" ? Math.abs(Math.sin(t * 6 + ph)) * -9 : kind === "play" ? Math.abs(Math.sin(t * 3.4 + ph)) * -26 : kind === "talk" ? Math.sin(t * 3 + ph) * 2 : Math.sin(t * 1.1 + ph) * 1.5;
  const step = kind === "walk" ? Math.sin(t * 6 + ph) * 22 : 0;
  const arm = kind === "talk" ? Math.sin(t * 4 + ph) * 18 : kind === "walk" ? step * 0.9 : kind === "play" ? Math.sin(t * 3.4 + ph) * 40 : 0;
  const top = 0;
  const seat = kind === "sit" ? 112 : 0; // sit: badan atas saja, meja menutup sisanya
  return (
    <g transform={`translate(${x + sway} ${y}) scale(${s * dir} ${s})`} stroke={OUT} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" style={{ filter: "saturate(0.82) brightness(0.97)" }}>
      <g transform={`translate(0 ${bob + seat})`}>
        {kind !== "sit" && (
          <g>
            {long && outfit !== "warga"
              ? <path d="M -34 -128 L 34 -128 L 44 -50 L -44 -50 Z" fill={bottom} />
              : <g fill={bottom}><rect x={-30} y={-130} width={28} height={130 - Math.abs(step) * 0.2} rx={8} transform={`rotate(${step * 0.4} -16 -130)`} /><rect x={2} y={-130} width={28} height={130 - Math.abs(step) * 0.2} rx={8} transform={`rotate(${-step * 0.4} 16 -130)`} /></g>}
            <ellipse cx={-14 + step * 0.5} cy={-2} rx={20} ry={8} fill="#2a2035" /><ellipse cx={18 - step * 0.5} cy={-2} rx={20} ry={8} fill="#2a2035" />
          </g>
        )}
        {bag && STUDENT_OUTFITS.includes(outfit) && kind !== "sit" && (
          <g><path d="M -34 -258 Q -78 -262 -86 -232 L -80 -150 Q -52 -138 -36 -150 Z" fill={pick(["#2f7fd8", "#e63946", "#3c8d5a", "#8f5bd1", "#f3a03c", "#5b6270"], seed, 12)} /></g>
        )}
        {/* arms behind torso */}
        <g stroke={OUT} strokeWidth={5}>
          <path d={`M -34 ${-250 + top} Q ${-52 + arm * 0.2} ${-190 + top} ${-46 - arm * 0.6} ${-140 + top}`} fill="none" stroke={shirt} strokeWidth={20} />
          <path d={`M 34 ${-250 + top} Q ${52 - arm * 0.2} ${-190 + top} ${46 + arm * 0.6} ${-140 + top}`} fill="none" stroke={shirt} strokeWidth={20} />
        </g>
        <rect x={-38} y={-262 + top} width={76} height={140 - top} rx={20} fill={shirt} />
        {outfit === "olahraga" && <rect x={-38} y={-200 + top} width={76} height={14} fill="#ffd23f" stroke="none" />}
        {outfit === "guru" && <path d={`M -38 ${-215 + top} L 38 ${-190 + top} M -38 ${-175 + top} L 38 ${-150 + top}`} stroke="#8a5126" strokeWidth={6} />}
        {salute > 0.5 && STUDENT_OUTFITS.includes(outfit) && (
          <g><path d="M 34 -250 Q 74 -262 44 -334" fill="none" stroke={OUT} strokeWidth={26} /><path d="M 34 -250 Q 74 -262 44 -334" fill="none" stroke={shirt} strokeWidth={16} /><circle cx={42} cy={-338} r={11} fill={skin} /></g>
        )}
        <rect x={-10} y={-282 + top} width={20} height={24} fill={skin} />
        {/* head + hair */}
        <circle cx={0} cy={-312 + top} r={42} fill={skin} />
        {outfit === "hijab"
          ? <path d={`M -48 ${-300 + top} Q -50 ${-372 + top} 0 ${-372 + top} Q 50 ${-372 + top} 48 ${-300 + top} Q 46 ${-250 + top} 0 ${-246 + top} Q -46 ${-250 + top} -48 ${-300 + top} Z M -30 ${-318 + top} Q 0 ${-338 + top} 30 ${-318 + top} L 30 ${-290 + top} Q 0 ${-272 + top} -30 ${-290 + top} Z`} fill={pick(["#f6f1e4", "#e85d75", "#2f7fd8", "#3c8d5a"], seed, 5)} fillRule="evenodd" />
          : outfit === "guru" && rnd(seed, 6) > 0.4
            ? <path d={`M -42 ${-322 + top} Q -44 ${-356 + top} 0 ${-356 + top} Q 44 ${-356 + top} 42 ${-322 + top} L 42 ${-334 + top} Q 0 ${-346 + top} -42 ${-334 + top} Z`} fill="#1b1b1b" />
            : long
              ? <path d={`M -46 ${-300 + top} Q -50 ${-366 + top} 0 ${-366 + top} Q 50 ${-366 + top} 46 ${-300 + top} L 46 ${-250 + top} L 30 ${-290 + top} Q 0 ${-318 + top} -30 ${-290 + top} L -46 ${-250 + top} Z`} fill={hair} />
              : <path d={`M -44 ${-312 + top} Q -48 ${-366 + top} 0 ${-366 + top} Q 48 ${-366 + top} 44 ${-312 + top} Q 30 ${-340 + top} 0 ${-336 + top} Q -30 ${-340 + top} -44 ${-312 + top} Z`} fill={hair} />}
        {hat && (outfit === "sma" || outfit === "smaGirl") && <g transform={`translate(0 ${-312 + top}) scale(0.34) translate(-20 0)`} style={{ transformOrigin: "0 0" }}><UpacaraCap /></g>}
        <g stroke="none" fill={OUT}><circle cx={-14} cy={-308 + top} r={4.5} /><circle cx={14} cy={-308 + top} r={4.5} /></g>
        <path d={`M -9 ${-290 + top} Q 0 ${-284 + top + (kind === "talk" ? Math.abs(Math.sin(t * 7 + ph)) * 6 : 0)} 9 ${-290 + top}`} fill="none" strokeWidth={3.5} />
      </g>
    </g>
  );
};

/* ---------- layout presets per location ---------- */
const OUTFITS_SCHOOL: Outfit[] = ["sma", "sma", "smaGirl", "hijab", "sma", "smaGirl", "hijab"];
const mk = (arr: Omit<Spec, "seed">[], base: number): Spec[] => arr.map((a, i) => ({ ...a, seed: base + i }));
const row = (n: number, x0: number, dx: number, y: number, s: number, kind: Kind, base: number, outfits: Outfit[] = OUTFITS_SCHOOL, jitter = 14): Omit<Spec, "seed">[] =>
  Array.from({ length: n }).map((_, i) => ({ x: x0 + i * dx + (rnd(i + base, 9) - 0.5) * jitter * 2, y: y + (rnd(i + base, 8) - 0.5) * 6, s, kind, outfit: pick(outfits, i + base, 7) }));

const upacara = (): Omit<Spec, "seed">[] => [
  ...row(20, -60, 108, 690, 0.5, "stand", 1), ...row(19, -10, 112, 735, 0.55, "stand", 40), ...row(19, -50, 110, 785, 0.6, "stand", 80),
  // regu guru di sisi kanan, barisan OSIS di kiri
  { x: 1700, y: 700, s: 0.6, kind: "stand", outfit: "guru" }, { x: 1790, y: 705, s: 0.6, kind: "stand", outfit: "guru" },
];
const desks = (ys: number[], s: number, xs: number[], base: number): Omit<Spec, "seed">[] => ys.flatMap((y, r) => xs.map((x, i) => ({ x: x + (r % 2) * 60, y, s, kind: "sit" as Kind, outfit: pick(OUTFITS_SCHOOL, base + r * 9 + i, 11) })));

const PRESETS: Record<string, Omit<Spec, "seed">[]> = {
  lapanganUpacara: upacara(),
  gerbang: [
    { x: 330, y: 880, s: 0.5, kind: "walk", outfit: "sma", dir: 1 }, { x: 470, y: 880, s: 0.5, kind: "walk", outfit: "hijab", dir: 1 },
    { x: 1560, y: 880, s: 0.52, kind: "walk", outfit: "smaGirl", dir: -1 }, { x: 1700, y: 880, s: 0.5, kind: "walk", outfit: "sma", dir: -1 },
    { x: 1200, y: 880, s: 0.5, kind: "talk", outfit: "hijab" }, { x: 1260, y: 880, s: 0.5, kind: "talk", outfit: "sma", dir: -1 },
  ],
  koridor: [
    { x: 150, y: 790, s: 0.58, kind: "walk", outfit: "sma", dir: 1 }, { x: 760, y: 780, s: 0.58, kind: "walk", outfit: "hijab", dir: -1 },
    { x: 1180, y: 790, s: 0.58, kind: "talk", outfit: "smaGirl" }, { x: 1250, y: 790, s: 0.58, kind: "talk", outfit: "sma", dir: -1 },
    { x: 1620, y: 780, s: 0.58, kind: "walk", outfit: "sma", dir: -1 }, { x: 1780, y: 790, s: 0.58, kind: "stand", outfit: "guru" },
  ],
  kelas: desks([745], 0.6, [250, 480, 1440, 1670], 100),
  kelasBelakang: desks([735, 790], 0.6, [330, 610, 1330, 1600], 130),
  kelasJendela: desks([745], 0.6, [500, 760, 1500], 160),
  kantin: [
    { x: 330, y: 842, s: 0.58, kind: "sit", outfit: "sma" }, { x: 560, y: 842, s: 0.58, kind: "sit", outfit: "hijab" }, { x: 1380, y: 842, s: 0.58, kind: "sit", outfit: "smaGirl" },
    { x: 1600, y: 842, s: 0.58, kind: "sit", outfit: "sma" }, { x: 150, y: 850, s: 0.6, kind: "stand", outfit: "sma" }, { x: 1230, y: 850, s: 0.6, kind: "stand", outfit: "hijab" },
    { x: 840, y: 850, s: 0.6, kind: "walk", outfit: "sma", dir: -1 },
  ],
  perpustakaan: [
    { x: 330, y: 790, s: 0.58, kind: "sit", outfit: "hijab" }, { x: 1560, y: 790, s: 0.58, kind: "sit", outfit: "sma" }, { x: 1740, y: 790, s: 0.58, kind: "sit", outfit: "smaGirl" },
  ],
  warung: [{ x: 90, y: 905, s: 0.55, kind: "walk", outfit: "warga", dir: 1 }, { x: 1830, y: 905, s: 0.55, kind: "walk", outfit: "warga", dir: -1 }],
  ruangGuru: [
    { x: 330, y: 770, s: 0.62, kind: "sit", outfit: "guru" }, { x: 760, y: 770, s: 0.62, kind: "sit", outfit: "guru" }, { x: 1580, y: 770, s: 0.62, kind: "sit", outfit: "guru" },
  ],
  pasar: [
    { x: 150, y: 800, s: 0.62, kind: "stand", outfit: "warga" }, { x: 470, y: 805, s: 0.62, kind: "talk", outfit: "warga" }, { x: 560, y: 805, s: 0.62, kind: "talk", outfit: "warga", dir: -1 },
    { x: 1010, y: 800, s: 0.62, kind: "stand", outfit: "warga" }, { x: 1350, y: 805, s: 0.62, kind: "walk", outfit: "warga", dir: 1 }, { x: 1760, y: 800, s: 0.62, kind: "stand", outfit: "warga", dir: -1 },
    { x: 1690, y: 810, s: 0.62, kind: "walk", outfit: "warga", dir: -1 },
  ],
  halte: [
    { x: 200, y: 880, s: 0.62, kind: "walk", outfit: "warga", dir: 1 }, { x: 1620, y: 880, s: 0.62, kind: "walk", outfit: "sma", dir: -1 },
    { x: 1790, y: 884, s: 0.62, kind: "stand", outfit: "warga", dir: -1 }, { x: 680, y: 850, s: 0.55, kind: "walk", outfit: "warga", dir: 1 },
  ],
  lapanganBasket: [
    { x: 700, y: 780, s: 0.6, kind: "play", outfit: "olahraga" }, { x: 1200, y: 770, s: 0.6, kind: "play", outfit: "olahraga", dir: -1 },
    { x: 1500, y: 790, s: 0.6, kind: "stand", outfit: "olahraga", dir: -1 }, { x: 120, y: 740, s: 0.58, kind: "sit", outfit: "sma" }, { x: 330, y: 740, s: 0.58, kind: "sit", outfit: "smaGirl" },
    { x: 1750, y: 740, s: 0.58, kind: "sit", outfit: "hijab" },
  ],
  // Rumah: tidak ada orang asing di dalam. Warga lewat di jalan depan rumah, terlihat dari jendela (di balik semak & kusen).
  ruangTamu: [
    { x: 1380, y: 560, s: 0.5, kind: "walk", outfit: "warga", dir: 1, pass: [70, 980, 622] },
    { x: 1760, y: 560, s: 0.5, kind: "walk", outfit: "hijab", dir: -1, pass: [-62, 1050, 695] },
  ],
};

/* Lokasi yang NPC-nya hanya terlihat lewat jendela: clip ke kaca + kusen & semak digambar ulang di depan NPC. */
const WINDOW_VIEW: Record<string, { clip: React.ReactNode; front: React.ReactNode }> = {
  ruangTamu: {
    // kaca di antara dua gorden (Window x1340 y180 460×360), dikurangi kepala kipas (1720, 480, r 72)
    clip: <><rect x={1442} y={186} width={256} height={349} fill="#fff" /><circle cx={1720} cy={480} r={74} fill="#000" /></>,
    front: (
      <g stroke={OUT} strokeWidth={5}>
        <circle cx={1671} cy={468} r={90} fill="#5cb85c" /><circle cx={1478} cy={504} r={72} fill="#4cae4c" />
        <line x1={1570} y1={180} x2={1570} y2={540} strokeWidth={8} /><line x1={1340} y1={360} x2={1800} y2={360} strokeWidth={8} />
      </g>
    ),
  },
};

const DENSITY: Record<string, number> = { off: 0, low: 0.5, normal: 1, high: 1 };
/** Extras layer for a location. `density`: "off" | "low" (separuh) | "normal". Deterministik: orang yang sama di tempat yang sama. */
export const Extras: React.FC<{ location: string; t: number; density?: string; bag?: boolean; salute?: number; hat?: boolean }> = ({ location, t, density = "normal", bag, salute, hat }) => {
  const list = PRESETS[location];
  const d = DENSITY[density] ?? 1;
  if (!list || d === 0) return null;
  const specs = mk(list, location.length * 17).map((sp) => {
    if (!sp.pass) return sp;
    const [v, cycle, off] = sp.pass;
    const d = (((Math.abs(v) * t + off) % cycle) + cycle) % cycle;
    return { ...sp, x: sp.x + Math.sign(v) * d };
  });
  const chosen = d >= 1 ? specs : specs.filter((_, i) => i % 2 === 0);
  const desk = location === "kelas" || location === "kelasBelakang" || location === "kelasJendela" || location === "ruangGuru" || location === "kantin" || location === "perpustakaan";
  const bench = location === "lapanganBasket";
  const view = WINDOW_VIEW[location];
  const people = (
    <g>
      {[...chosen].sort((a, b) => a.y - b.y).map((sp, i) => (
        <g key={i}>
          <Figure {...sp} t={t} bag={bag} salute={salute} hat={hat} />
          {sp.kind === "sit" && desk && (
            <g stroke={OUT} strokeWidth={4}><rect x={sp.x - 70 * sp.s - 20} y={sp.y - 10} width={(140 * sp.s) + 40} height={16} fill="#c98f55" /><rect x={sp.x - 60 * sp.s} y={sp.y + 6} width={10} height={70 * sp.s} fill="#8a5a2b" /><rect x={sp.x + 50 * sp.s} y={sp.y + 6} width={10} height={70 * sp.s} fill="#8a5a2b" /></g>
          )}
          {sp.kind === "sit" && bench && <rect x={sp.x - 60} y={sp.y - 8} width={120} height={14} fill="#8d939c" stroke={OUT} strokeWidth={4} />}
        </g>
      ))}
    </g>
  );
  if (!view) return people;
  const id = `extras-window-${location}`;
  return (
    <g>
      <defs><mask id={id} maskUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1080}>{view.clip}</mask></defs>
      <g mask={`url(#${id})`}><g style={{ filter: "brightness(0.92)" }}>{people}</g>{view.front}</g>
    </g>
  );
};
export const EXTRA_LOCATIONS = Object.keys(PRESETS);
