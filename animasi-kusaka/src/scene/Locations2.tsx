import React from "react";
import { Desk, Flag, SchoolBuilding, Tree } from "./Locations";

/* Additional locked sets (locations v2). No readable text anywhere — pictograms only. */
const OUT = "#1b1b1b";
const SW = 6;

/* ------------------------------ shared pieces ---------------------------- */
const Floor: React.FC<{ y: number; fill: string; line: string; kind?: "tile" | "wood" }> = ({ y, fill, line, kind = "tile" }) => (
  <g>
    <rect x={-400} y={y} width={2720} height={1500 - y} fill={fill} stroke={OUT} strokeWidth={SW} />
    {kind === "tile"
      ? <g>
          {Array.from({ length: 30 }).map((_, i) => <line key={i} x1={-400 + i * 100} y1={y} x2={-700 + i * 130} y2={1500} stroke={line} strokeWidth={4} />)}
          {[70, 160, 280].map((d) => <line key={d} x1={-400} x2={2320} y1={y + d} y2={y + d} stroke={line} strokeWidth={4} />)}
        </g>
      : Array.from({ length: 14 }).map((_, i) => <line key={i} x1={-400} x2={2320} y1={y + 30 + i * 50} y2={y + 30 + i * 50} stroke={line} strokeWidth={4} />)}
  </g>
);
const Wall: React.FC<{ fill: string; dado?: string; dadoY?: number }> = ({ fill, dado, dadoY = 640 }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1300} fill={fill} />
    {dado && <rect x={-400} y={dadoY} width={2720} height={800 - dadoY + 40} fill={dado} stroke={OUT} strokeWidth={SW} />}
  </g>
);
const Window: React.FC<{ x: number; y: number; w: number; h: number; sky?: string; curtain?: string; trees?: boolean }> = ({ x, y, w, h, sky = "#a8dcf5", curtain = "#e85d75", trees = true }) => (
  <g transform={`translate(${x} ${y})`} stroke={OUT} strokeWidth={5}>
    <rect width={w} height={h} fill={sky} />
    {trees && <><circle cx={w * 0.72} cy={h * 0.8} r={h * 0.25} fill="#5cb85c" /><circle cx={w * 0.3} cy={h * 0.9} r={h * 0.2} fill="#4cae4c" /></>}
    <line x1={w / 2} y1={0} x2={w / 2} y2={h} strokeWidth={8} /><line x1={0} y1={h / 2} x2={w} y2={h / 2} strokeWidth={8} />
    <rect width={w} height={h} fill="none" strokeWidth={10} />
    <path d={`M -10 -10 L ${w * 0.2} -10 Q ${w * 0.14} ${h / 2} ${w * 0.22} ${h + 10} L -10 ${h + 10} Z`} fill={curtain} />
    <path d={`M ${w + 10} -10 L ${w * 0.8} -10 Q ${w * 0.86} ${h / 2} ${w * 0.78} ${h + 10} L ${w + 10} ${h + 10} Z`} fill={curtain} />
  </g>
);
const Clock: React.FC<{ x: number; y: number; t: number; r?: number }> = ({ x, y, t, r = 50 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="#fff" stroke={OUT} strokeWidth={6} />
    <line x2={0} y2={-r * 0.65} stroke={OUT} strokeWidth={6} strokeLinecap="round" transform={`rotate(${t * 6})`} />
    <line x2={r * 0.45} y2={0} stroke={OUT} strokeWidth={6} strokeLinecap="round" />
  </g>
);
const Fan: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-4} y={-80} width={8} height={80} fill="#555" />
    <ellipse rx={130} ry={14} fill="#eee" stroke={OUT} strokeWidth={4} transform={`scale(${Math.cos(t * 30)} 1)`} />
    <circle r={16} fill="#888" stroke={OUT} strokeWidth={4} />
  </g>
);
const Frame: React.FC<{ x: number; y: number; w: number; h: number; kind: "landscape" | "family" | "portrait"; tilt?: number }> = ({ x, y, w, h, kind, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt})`} stroke={OUT} strokeWidth={5}>
    <rect width={w} height={h} fill="#8a5a2b" />
    <rect x={10} y={10} width={w - 20} height={h - 20} fill={kind === "landscape" ? "#a8dcf5" : "#f3e3b5"} strokeWidth={3} />
    {kind === "landscape" && <path d={`M 10 ${h - 10} L ${w * 0.35} ${h * 0.45} L ${w * 0.6} ${h * 0.7} L ${w * 0.8} ${h * 0.5} L ${w - 10} ${h - 10} Z`} fill="#5cb85c" strokeWidth={3} />}
    {kind === "family" && [0.25, 0.5, 0.75].map((k, i) => (
      <g key={k}><circle cx={w * k} cy={h * 0.42} r={h * (i === 1 ? 0.13 : 0.11)} fill="#e0ab7e" strokeWidth={3} /><path d={`M ${w * k - h * 0.17} ${h - 10} Q ${w * k} ${h * 0.5} ${w * k + h * 0.17} ${h - 10}`} fill={["#2f7fd8", "#e85d75", "#3c8d5a"][i]} strokeWidth={3} /></g>
    ))}
    {kind === "portrait" && <g><circle cx={w / 2} cy={h * 0.4} r={w * 0.18} fill="#e0ab7e" strokeWidth={3} /><path d={`M ${w * 0.2} ${h - 10} Q ${w / 2} ${h * 0.5} ${w * 0.8} ${h - 10}`} fill="#1f2f5c" strokeWidth={3} /></g>}
  </g>
);
const Books: React.FC<{ x: number; y: number; w: number; seed?: number }> = ({ x, y, w, seed = 0 }) => {
  const colors = ["#e63946", "#2f7fd8", "#ffd23f", "#3c8d5a", "#8e44ad", "#f77f00", "#1f5c3a", "#ff6fa5"];
  const out: React.ReactNode[] = [];
  let cx = x, i = 0;
  while (cx < x + w - 20) {
    const bw = 18 + ((i * 7 + seed) % 4) * 6, bh = 70 + ((i * 13 + seed) % 5) * 10;
    out.push(<rect key={i} x={cx} y={y - bh} width={bw} height={bh} fill={colors[(i + seed) % colors.length]} stroke={OUT} strokeWidth={3} />);
    cx += bw + 2; i++;
  }
  return <g>{out}</g>;
};
const Plant: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={OUT} strokeWidth={4}>
    <path d="M -30 -60 L 30 -60 L 22 0 L -22 0 Z" fill="#c8553d" />
    <path d="M 0 -60 Q -50 -120 -36 -170 Q -4 -110 0 -60 Q 10 -150 44 -170 Q 40 -110 0 -60 Q -10 -130 6 -200 Q 20 -130 0 -60" fill="#4cae4c" />
  </g>
);
const SunBeams: React.FC<{ x: number; t: number }> = ({ x, t }) => (
  <g opacity={0.18 + Math.sin(t) * 0.03}>
    {[0, 1, 2].map((i) => <path key={i} d={`M ${x + i * 520} 180 L ${x + i * 520 + 340} 180 L ${x + i * 520 + 700} 1080 L ${x + i * 520 + 260} 1080 Z`} fill="#fff6c2" />)}
  </g>
);

/* ------------------------------ KELAS: BELAKANG -------------------------- */
export const KelasBelakang: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Wall fill="#f6e7c1" dado="#b9d7c9" dadoY={620} />
    <Floor y={770} fill="#ece5d3" line="#d6cdb6" />
    {/* cabinet with trophies */}
    <g transform="translate(120 300)" stroke={OUT} strokeWidth={SW}>
      <rect width={420} height={470} fill="#a8642f" />
      <rect x={20} y={20} width={180} height={430} fill="#b9773f" /><rect x={220} y={20} width={180} height={430} fill="#b9773f" />
      <circle cx={190} cy={240} r={8} fill="#ffd23f" /><circle cx={230} cy={240} r={8} fill="#ffd23f" />
      {[60, 180, 300].map((x, i) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <path d="M -26 -70 L 26 -70 Q 26 -30 0 -24 Q -26 -30 -26 -70 Z" fill="#ffd23f" />
          <rect x={-8} y={-24} width={16} height={14} fill="#ffd23f" /><rect x={-22} y={-12} width={44} height={12} fill={["#8a5a2b", "#555", "#8a5a2b"][i]} />
        </g>
      ))}
    </g>
    {/* class organization chart: photo boxes connected by lines (no text) */}
    <g transform="translate(700 170)" stroke={OUT} strokeWidth={5}>
      <rect width={560} height={360} fill="#fff" />
      <path d="M 280 90 L 280 140 M 120 140 L 440 140 M 120 140 L 120 180 M 280 140 L 280 180 M 440 140 L 440 180 M 120 250 L 120 270 M 440 250 L 440 270" fill="none" strokeWidth={4} />
      {[[250, 30], [90, 180], [250, 180], [410, 180], [60, 270], [180, 270], [380, 270], [500, 270]].map(([x, y], i) => (
        <g key={i}><rect x={x - (i > 3 ? 30 : 0)} y={y} width={60} height={70} fill="#f3e3b5" strokeWidth={3} /><circle cx={x + 30 - (i > 3 ? 30 : 0)} cy={y + 28} r={14} fill="#e0ab7e" strokeWidth={3} /></g>
      ))}
    </g>
    <Clock x={1420} y={130} t={t} />
    {/* cleaning corner: broom, dustpan, bucket, bin */}
    <g transform="translate(1500 770)" stroke={OUT} strokeWidth={5}>
      <rect x={20} y={-360} width={14} height={300} fill="#c98f55" transform="rotate(8 27 -60)" />
      <path d="M -10 -70 L 70 -70 L 90 0 L -30 0 Z" fill="#ffd23f" transform="rotate(8 30 -30)" />
      <path d="M 120 -110 L 200 -110 L 190 0 L 130 0 Z" fill="#2f7fd8" />
      <path d="M 120 -110 Q 160 -150 200 -110" fill="none" strokeWidth={4} />
      <path d="M 230 -150 L 330 -150 L 316 0 L 244 0 Z" fill="#3c8d5a" />
      <rect x={224} y={-166} width={112} height={20} rx={6} fill="#2f7047" />
      <path d="M 270 -40 l 20 -20 l 20 20" fill="none" stroke="#fff" strokeWidth={4} />
    </g>
    <Fan x={960} y={60} t={t} />
    {/* back rows of desks (seen from behind) */}
    {[[260, 900, "#e63946"], [700, 900, ""], [1180, 900, "#2f7fd8"], [1620, 900, "#ffd23f"]].map(([x, y, bag], i) => (
      <Desk key={i} x={x as number} y={y as number} s={0.9} bag={(bag as string) || undefined} />
    ))}
  </g>
);

/* ------------------------------ KELAS: SISI JENDELA ---------------------- */
export const KelasJendela: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Wall fill="#f6e7c1" dado="#b9d7c9" dadoY={600} />
    <Floor y={770} fill="#ece5d3" line="#d6cdb6" />
    {[60, 680, 1300].map((x, i) => <Window key={x} x={x} y={150} w={520} h={380} curtain={["#e85d75", "#e85d75", "#e85d75"][i]} />)}
    {[300, 920, 1540].map((x, i) => <Plant key={x} x={x} y={600} s={0.7 + (i % 2) * 0.1} />)}
    <SunBeams x={100} t={t} />
    {/* Kusaka's desk: doodles, crumpled paper */}
    <g>
      <Desk x={380} y={900} s={0.95} bag="#e63946" />
      <Desk x={1000} y={900} s={0.95} />
      <Desk x={1620} y={900} s={0.95} bag="#2f7fd8" />
      <g transform="translate(330 790)" stroke="#2f7fd8" strokeWidth={3} fill="none">
        <circle cx={0} cy={0} r={10} /><path d="M 20 -6 l 16 8 l -16 8" /><path d="M -30 4 q 8 -10 16 0" />
      </g>
      <circle cx={1060} cy={780} r={14} fill="#fff" stroke={OUT} strokeWidth={3} />
    </g>
  </g>
);

/* ------------------------------ KELAS: MEJA GURU ------------------------- */
export const MejaGuru: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Wall fill="#f6e7c1" dado="#b9d7c9" dadoY={640} />
    <Floor y={790} fill="#ece5d3" line="#d6cdb6" />
    <Window x={80} y={170} w={420} h={360} />
    {/* edge of whiteboard on the right */}
    <rect x={1520} y={170} width={600} height={360} fill="#fbfdff" stroke="#8d939c" strokeWidth={14} />
    <path d="M 1580 250 q 30 -14 60 0 t 60 0 t 60 0 M 1580 320 q 30 -14 60 0 t 60 0" fill="none" stroke="#3a3a3a" strokeWidth={5} strokeLinecap="round" />
    <Frame x={720} y={140} w={180} h={220} kind="portrait" />
    <Frame x={1020} y={140} w={180} h={220} kind="portrait" />
    <g transform="translate(960 100)" stroke={OUT} strokeWidth={4}><path d="M -30 -30 L 30 -30 L 30 6 Q 30 30 0 40 Q -30 30 -30 6 Z" fill="#f3c66b" /><circle r={9} fill="#e63946" /></g>
    <Clock x={1400} y={110} t={t} r={44} />
    {/* teacher's desk */}
    <g transform="translate(560 640)" stroke={OUT} strokeWidth={SW}>
      <rect width={820} height={36} fill="#8a5126" />
      <rect x={20} y={36} width={780} height={280} fill="#a8642f" />
      <path d="M 20 36 L 800 36 L 780 140 Q 410 170 40 140 Z" fill="#3c8d5a" />
      {/* books, globe, vase, mini flag, pen cup, attendance book */}
      <Books x={60} y={0} w={170} seed={2} />
      <g transform="translate(330 -70)"><circle r={60} fill="#2f7fd8" /><path d="M -30 -30 q 20 10 10 30 q -20 10 -10 30 M 20 -40 q 20 20 0 50" fill="#5cb85c" strokeWidth={4} /><rect x={-6} y={58} width={12} height={14} fill="#8a5a2b" strokeWidth={4} /><rect x={-34} y={70} width={68} height={10} fill="#8a5a2b" strokeWidth={4} /></g>
      <g transform="translate(500 0)"><path d="M -24 0 L 24 0 L 30 -70 L -30 -70 Z" fill="#9ad0ec" /><circle cx={-16} cy={-100} r={18} fill="#e85d75" /><circle cx={16} cy={-108} r={18} fill="#ffd23f" /><circle cx={0} cy={-128} r={18} fill="#ff6fa5" /></g>
      <g transform="translate(620 0)"><rect x={-3} y={-100} width={6} height={100} fill="#999" strokeWidth={3} /><rect x={3} y={-100} width={50} height={18} fill="#e63946" strokeWidth={3} /><rect x={3} y={-82} width={50} height={18} fill="#fff" strokeWidth={3} /></g>
      <g transform="translate(720 0)"><rect x={-24} y={-60} width={48} height={60} fill="#555" /><path d="M -10 -60 L -16 -100 M 6 -60 L 14 -96" strokeWidth={5} /></g>
      <rect x={240} y={-14} width={140} height={14} fill="#1f2f5c" />
    </g>
  </g>
);

/* ------------------------------ KANTIN ----------------------------------- */
const Stall: React.FC<{ x: number; color: string; kind: "bakso" | "esteh" | "nasi" }> = ({ x, color, kind }) => (
  <g transform={`translate(${x} 0)`} stroke={OUT} strokeWidth={SW}>
    <rect x={0} y={250} width={480} height={60} fill={color} />
    <path d="M 0 310 Q 30 340 60 310 Q 90 340 120 310 Q 150 340 180 310 Q 210 340 240 310 Q 270 340 300 310 Q 330 340 360 310 Q 390 340 420 310 Q 450 340 480 310" fill={color} />
    {/* pictogram board */}
    <rect x={150} y={150} width={180} height={90} rx={10} fill="#fff8e1" />
    {kind === "bakso" && <g transform="translate(240 200)"><path d="M -40 -10 L 40 -10 Q 36 30 0 32 Q -36 30 -40 -10 Z" fill="#fff" strokeWidth={4} /><circle cx={-12} cy={-14} r={10} fill="#a0522d" strokeWidth={3} /><circle cx={12} cy={-16} r={10} fill="#a0522d" strokeWidth={3} /></g>}
    {kind === "esteh" && <g transform="translate(240 196)"><path d="M -20 -30 L 20 -30 L 14 34 L -14 34 Z" fill="#e9a23b" strokeWidth={4} /><path d="M 6 -30 L 16 -50" strokeWidth={4} /></g>}
    {kind === "nasi" && <g transform="translate(240 200)"><ellipse rx={50} ry={20} fill="#fff" strokeWidth={4} /><path d="M -30 -6 Q 0 -40 30 -6 Z" fill="#fff" strokeWidth={4} /><circle cx={30} cy={2} r={8} fill="#ffd23f" strokeWidth={3} /></g>}
    <rect x={20} y={560} width={440} height={30} fill="#8a5126" />
    <rect x={30} y={590} width={420} height={250} fill="#c98f55" />
    {kind === "bakso" && <g><rect x={80} y={470} width={120} height={90} rx={10} fill="#bbb" /><path d="M 100 460 q 10 -30 0 -60 M 140 460 q 10 -30 0 -60" fill="none" stroke="#fff" strokeWidth={6} opacity={0.8} /><rect x={260} y={440} width={170} height={120} fill="#d8f3ff" fillOpacity={0.6} /></g>}
    {kind === "esteh" && [90, 190, 290].map((xx, i) => <g key={xx}><rect x={xx} y={440} width={80} height={120} rx={12} fill={["#e9a23b", "#e85d75", "#3bceac"][i]} fillOpacity={0.85} /><rect x={xx + 8} y={426} width={64} height={16} fill="#555" /></g>)}
    {kind === "nasi" && <g><rect x={70} y={470} width={340} height={90} fill="#d8f3ff" fillOpacity={0.6} />{[110, 190, 270, 350].map((xx, i) => <ellipse key={xx} cx={xx} cy={530} rx={30} ry={14} fill={["#e9a23b", "#3c8d5a", "#c0392b", "#ffd23f"][i]} strokeWidth={3} />)}</g>}
  </g>
);
export const Kantin: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Wall fill="#f3e3b5" />
    <rect x={-400} y={-400} width={2720} height={600} fill="#e8dcc0" stroke={OUT} strokeWidth={SW} />
    {[300, 960, 1620].map((x) => (
      <g key={x}><line x1={x} y1={200} x2={x} y2={250} stroke={OUT} strokeWidth={4} /><path d={`M ${x - 40} 250 L ${x + 40} 250 L ${x + 24} 280 L ${x - 24} 280 Z`} fill="#ffd23f" stroke={OUT} strokeWidth={4} /><ellipse cx={x} cy={300} rx={70} ry={20} fill="#fff6c2" opacity={0.5 + Math.sin(t * 2 + x) * 0.05} /></g>
    ))}
    <Stall x={40} color="#e63946" kind="bakso" />
    <Stall x={720} color="#2f7fd8" kind="esteh" />
    <Stall x={1400} color="#3c8d5a" kind="nasi" />
    <Floor y={840} fill="#d9d4c7" line="#bdb6a6" />
    {/* long table + benches */}
    <g transform="translate(140 910)" stroke={OUT} strokeWidth={SW}>
      <rect width={1640} height={26} fill="#c98f55" />
      <rect x={60} y={26} width={22} height={90} fill="#8a5a2b" /><rect x={1560} y={26} width={22} height={90} fill="#8a5a2b" />
      {[200, 600, 1000, 1400].map((x, i) => <g key={x} transform={`translate(${x} 0)`}><path d="M -26 0 L 26 0 Q 24 -30 0 -32 Q -24 -30 -26 0 Z" fill="#fff" strokeWidth={4} />{i % 2 === 0 && <path d="M 40 0 L 60 0 L 56 -50 L 44 -50 Z" fill="#e9a23b" strokeWidth={4} />}</g>)}
    </g>
  </g>
);

/* ------------------------------ RUANG BK --------------------------------- */
export const RuangBK: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Wall fill="#d7ead9" dado="#a9cbb0" dadoY={660} />
    <Floor y={800} fill="#ece5d3" line="#d6cdb6" />
    {/* window with blinds */}
    <g transform="translate(1380 160)" stroke={OUT} strokeWidth={5}>
      <rect width={420} height={380} fill="#a8dcf5" />
      {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={0} y={i * 30} width={420} height={18} fill="#f6f1e4" strokeWidth={3} />)}
      <rect width={420} height={380} fill="none" strokeWidth={10} />
    </g>
    {/* AC unit */}
    <g transform="translate(700 70)" stroke={OUT} strokeWidth={5}><rect width={320} height={90} rx={14} fill="#fbfbf7" />{[40, 56, 72].map((y) => <line key={y} x1={30} x2={290} y1={y} y2={y} strokeWidth={3} />)}<circle cx={290} cy={24} r={5} fill="#3c8d5a" strokeWidth={2} /></g>
    {/* pictogram posters: lightbulb (ide), heart (peduli), handshake-ish (bersama) */}
    {[[160, "#ffd23f"], [400, "#e85d75"]].map(([x, c], i) => (
      <g key={i} transform={`translate(${x} 200)`} stroke={OUT} strokeWidth={5}>
        <rect width={200} height={260} fill="#fff" />
        {i === 0 ? <g><circle cx={100} cy={110} r={50} fill={c as string} /><rect x={78} y={158} width={44} height={36} fill="#999" /></g>
                 : <path d="M 100 200 L 40 130 Q 20 80 60 70 Q 90 66 100 100 Q 110 66 140 70 Q 180 80 160 130 Z" fill={c as string} />}
      </g>
    ))}
    {/* filing cabinet + shelf */}
    <g transform="translate(-60 380)" stroke={OUT} strokeWidth={SW}>
      <rect width={200} height={420} fill="#8d939c" />
      {[20, 150, 280].map((y) => <g key={y}><rect x={20} y={y} width={160} height={110} fill="#a9aeb6" /><rect x={80} y={y + 44} width={40} height={14} rx={6} fill="#555" /></g>)}
    </g>
    <Plant x={1880} y={800} s={1.1} />
    <Clock x={1100} y={260} t={t} r={42} />
    {/* BK desk with blank nameplate, computer, folders */}
    <g transform="translate(620 620)" stroke={OUT} strokeWidth={SW}>
      <rect width={700} height={34} fill="#6e3a1c" />
      <rect x={20} y={34} width={660} height={300} fill="#8a4b26" />
      <g transform="translate(120 0)"><rect x={0} y={-150} width={200} height={130} rx={8} fill="#333" /><rect x={14} y={-136} width={172} height={102} fill="#8fd3ff" /><rect x={84} y={-20} width={32} height={20} fill="#555" /></g>
      <path d="M 400 -6 L 540 -6 L 528 -40 L 412 -40 Z" fill="#e7c86b" />
      {[0, 1, 2].map((i) => <rect key={i} x={570 + i * 8} y={-80 + i * 4} width={70} height={80 - i * 4} fill={["#e63946", "#2f7fd8", "#ffd23f"][i]} strokeWidth={4} />)}
    </g>
  </g>
);

/* ------------------------------ PERPUSTAKAAN ----------------------------- */
export const Perpustakaan: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Wall fill="#efe2c8" />
    <Floor y={800} fill="#c58b56" line="#a8713f" kind="wood" />
    {[-100, 420, 1400].map((x, k) => (
      <g key={x} transform={`translate(${x} 120)`} stroke={OUT} strokeWidth={SW}>
        <rect width={500} height={680} fill="#8a5126" />
        {[160, 320, 480, 640].map((y, i) => <g key={y}><rect x={16} y={y} width={468} height={16} fill="#6e3a1c" /><Books x={26} y={y} w={450} seed={i + k * 3} /></g>)}
      </g>
    ))}
    <Window x={960} y={170} w={360} h={340} curtain="#3c8d5a" />
    {/* silence pictogram (finger on lips) */}
    <g transform="translate(1140 600)" stroke={OUT} strokeWidth={5}>
      <circle r={60} fill="#fff8e1" /><circle cx={0} cy={-6} r={34} fill="#e0ab7e" strokeWidth={4} /><path d="M -14 10 L 14 10" strokeWidth={4} /><rect x={-4} y={-6} width={8} height={40} rx={4} fill="#e0ab7e" strokeWidth={3} />
    </g>
    <SunBeams x={900} t={t} />
    {/* reading table with lamps */}
    <g transform="translate(360 880)" stroke={OUT} strokeWidth={SW}>
      <rect width={1200} height={28} fill="#c98f55" />
      <rect x={40} y={28} width={20} height={80} fill="#8a5a2b" /><rect x={1140} y={28} width={20} height={80} fill="#8a5a2b" />
      {[200, 900].map((x) => <g key={x} transform={`translate(${x} 0)`}><rect x={-4} y={-90} width={8} height={90} fill="#3c8d5a" strokeWidth={4} /><path d="M -50 -90 L 50 -90 L 30 -130 L -30 -130 Z" fill="#3c8d5a" strokeWidth={4} /></g>)}
      <rect x={480} y={-16} width={120} height={16} fill="#2f7fd8" strokeWidth={4} /><rect x={620} y={-30} width={100} height={30} fill="#fff" strokeWidth={4} />
    </g>
  </g>
);

/* ------------------------------ RUANG TAMU (rumah Kusaka) ---------------- */
export const RuangTamu: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Wall fill="#f7dcc4" dado="#e8c3a2" dadoY={680} />
    <Floor y={820} fill="#e9e2d0" line="#d1c7ae" />
    <Window x={1340} y={180} w={460} h={360} sky="#ffb26b" curtain="#3c8d5a" />
    <Frame x={180} y={160} w={420} h={260} kind="family" />
    <Frame x={660} y={200} w={150} h={180} kind="landscape" tilt={-2} />
    <Clock x={1100} y={150} t={t} r={48} />
    {/* calendar (grid only) */}
    <g transform="translate(900 250)" stroke={OUT} strokeWidth={4}><rect width={150} height={180} fill="#fff" /><rect width={150} height={50} fill="#e63946" />{[80, 110, 140].map((y) => <line key={y} x1={10} x2={140} y1={y} y2={y} strokeWidth={2} />)}{[45, 80, 115].map((x) => <line key={x} x1={x} x2={x} y1={60} y2={170} strokeWidth={2} />)}</g>
    {/* TV cabinet */}
    <g transform="translate(-80 560)" stroke={OUT} strokeWidth={SW}>
      <rect x={0} y={60} width={420} height={200} fill="#8a5126" />
      <rect x={30} y={-140} width={360} height={200} rx={10} fill="#222" /><rect x={46} y={-124} width={328} height={168} fill="#3d5a80" />
      <path d={`M 80 30 L ${140 + Math.sin(t * 2) * 20} -60 L 220 10 L 300 -80 L 360 20`} fill="none" stroke="#8fd3ff" strokeWidth={5} />
    </g>
    {/* sofa + coffee table with cookie jars */}
    <g transform="translate(560 640)" stroke={OUT} strokeWidth={SW}>
      <rect x={0} y={0} width={760} height={140} rx={30} fill="#c0392b" />
      <rect x={-40} y={60} width={100} height={180} rx={24} fill="#a93226" /><rect x={700} y={60} width={100} height={180} rx={24} fill="#a93226" />
      <rect x={40} y={110} width={680} height={110} rx={20} fill="#d35445" />
      <rect x={70} y={60} width={120} height={80} rx={20} fill="#ffd23f" transform="rotate(-8 130 100)" />
    </g>
    <g transform="translate(700 930)" stroke={OUT} strokeWidth={SW}>
      <rect width={480} height={24} fill="#8a5a2b" /><rect x={30} y={24} width={18} height={60} fill="#6e3a1c" /><rect x={430} y={24} width={18} height={60} fill="#6e3a1c" />
      {[80, 220, 360].map((x, i) => <g key={x}><rect x={x - 34} y={-80} width={68} height={80} rx={14} fill="#eaf7ff" fillOpacity={0.75} /><rect x={x - 30} y={-96} width={60} height={20} rx={4} fill={["#e63946", "#ffd23f", "#3c8d5a"][i]} /><circle cx={x - 10} cy={-30} r={12} fill="#e9a23b" strokeWidth={3} /><circle cx={x + 12} cy={-46} r={10} fill="#e9a23b" strokeWidth={3} /></g>)}
    </g>
    {/* standing fan */}
    <g transform="translate(1720 820)" stroke={OUT} strokeWidth={5}>
      <rect x={-6} y={-300} width={12} height={300} fill="#ddd" /><ellipse cx={0} cy={0} rx={70} ry={14} fill="#ddd" />
      <circle cx={0} cy={-340} r={70} fill="#9ad0ec" fillOpacity={0.6} />
      <g transform={`translate(0 -340) rotate(${t * 900})`}><ellipse rx={56} ry={16} fill="#fff" strokeWidth={3} /><ellipse rx={16} ry={56} fill="#fff" strokeWidth={3} /></g>
    </g>
  </g>
);

/* ------------------------------ LAPANGAN UPACARA ------------------------- */
export const LapanganUpacaraBack: React.FC = () => (
  <g><Tree x={60} y={430} /><Tree x={1860} y={420} /><SchoolBuilding x={160} y={260} w={1600} /></g>
);
export const LapanganUpacara: React.FC<{ t: number; flag?: number; inverted?: boolean; snag?: number }> = ({ t, flag, inverted, snag = 0 }) => (
  <g>
    <rect x={-1200} y={600} width={4400} height={1000} fill="#c9c3b6" stroke={OUT} strokeWidth={SW} />
    <path d="M -200 740 L 2120 740 M -400 900 L 2320 900" stroke="#fff" strokeWidth={8} />
    <rect x={-1200} y={590} width={4400} height={20} fill="#3c8d5a" stroke={OUT} strokeWidth={4} />
    {/* flagpole with base */}
    <g><rect x={860} y={620} width={200} height={40} fill="#f6f1e4" stroke={OUT} strokeWidth={5} /><rect x={890} y={590} width={140} height={34} fill="#f6f1e4" stroke={OUT} strokeWidth={5} /></g>
    {/* flag: undefined = bendera di puncak (default); angka 0–1 = ketinggian kain; <=0 = belum dipasang */}
    <Flag x={960} y={60} t={t} h={530} flagY={flag === undefined ? 60 : 60 + (1 - flag) * 430} inverted={inverted} cloth={flag === undefined || flag > 0.001} />
    {/* tali bendera: dua untai di sisi tiang; "nyangkut" = tali ditarik miring ke badan penarik */}
    <g stroke={OUT} strokeWidth={3} fill="none">
      <path d="M 976 70 L 976 700" stroke="#f6f1e4" strokeWidth={5} /><path d="M 990 70 L 990 700" stroke="#f6f1e4" strokeWidth={5} />
      {snag > 0.5 && <path d="M 990 330 Q 1010 520 930 640" stroke="#f6f1e4" strokeWidth={5} />}
    </g>
    {/* podium (mimbar) */}
    <g transform="translate(1440 520)" stroke={OUT} strokeWidth={SW}>
      <rect x={-120} y={60} width={240} height={50} fill="#8a5126" />
      <path d="M -60 60 L 60 60 L 50 -60 L -50 -60 Z" fill="#a8642f" />
      <path d="M -24 -10 L 0 -34 L 24 -10 L 0 14 Z" fill="#ffd23f" strokeWidth={4} />
      <path d="M 30 -60 L 50 -110" strokeWidth={5} /><circle cx={52} cy={-114} r={8} fill="#555" strokeWidth={3} />
    </g>
  </g>
);

/* ------------------------------ KOS-KOSAN (Kak Tara) --------------------- */
export const Kos: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Wall fill="#e9edf2" />
    {/* peeling paint & cracks */}
    <path d="M 640 120 l 30 40 l -14 30 l 26 44" fill="none" stroke="#b7bec8" strokeWidth={4} />
    <path d="M 1500 520 q 30 -20 60 6 q -10 30 -50 24 Z" fill="#d0d6de" stroke="#b7bec8" strokeWidth={3} />
    <Floor y={820} fill="#d9d4c7" line="#bdb6a6" />
    <Window x={760} y={170} w={340} h={300} sky="#1f2f5c" curtain="#f4a261" trees={false} />
    <circle cx={1000} cy={240} r={30} fill="#fff8e1" />
    {/* clothes line */}
    <path d="M 120 150 Q 400 210 680 150" fill="none" stroke={OUT} strokeWidth={4} />
    {[[200, "#2f7fd8"], [330, "#e63946"], [470, "#ffd23f"], [590, "#3c8d5a"]].map(([x, c], i) => (
      <g key={i} transform={`translate(${x} ${180 + Math.sin(i) * 8}) rotate(${Math.sin(t * 2 + i) * 3})`} stroke={OUT} strokeWidth={4}>
        <path d="M -40 0 L 40 0 L 50 30 L 30 36 L 30 110 L -30 110 L -30 36 L -50 30 Z" fill={c as string} />
      </g>
    ))}
    {/* floor mattress + pillow */}
    <g transform="translate(1180 760)" stroke={OUT} strokeWidth={SW}>
      <rect width={760} height={110} rx={20} fill="#9ad0ec" />
      <rect x={20} y={-30} width={180} height={60} rx={24} fill="#fff" />
      <path d="M 260 -10 Q 420 -50 560 0 Q 660 -30 760 10 L 760 90 L 240 90 Z" fill="#f4a261" />
    </g>
    {/* folding table w/ laptop, instant noodle cups; rice cooker; water gallon */}
    <g transform="translate(160 780)" stroke={OUT} strokeWidth={SW}>
      <rect width={440} height={24} fill="#c98f55" /><path d="M 40 24 L 80 120 M 400 24 L 360 120" strokeWidth={8} />
      <g transform="translate(140 0)"><path d="M 0 0 L 20 -110 L 170 -110 L 150 0 Z" fill="#555" /><path d="M 30 -10 L 45 -96 L 158 -96 L 140 -10 Z" fill="#8fd3ff" /></g>
      {[60, 380].map((x) => <g key={x} transform={`translate(${x} 0)`}><path d="M -22 0 L 22 0 L 28 -54 L -28 -54 Z" fill="#fff" /><rect x={-28} y={-60} width={56} height={10} fill="#e63946" /><path d="M -6 -60 q 4 -20 -2 -36 M 8 -60 q 4 -20 -2 -36" fill="none" stroke="#ccc" strokeWidth={4} /></g>)}
    </g>
    <g transform="translate(-20 820)" stroke={OUT} strokeWidth={SW}>
      <ellipse cx={0} cy={-60} rx={60} ry={56} fill="#f6f1e4" /><rect x={-40} y={-126} width={80} height={20} rx={8} fill="#ddd" /><rect x={-8} y={-74} width={16} height={8} fill="#e63946" />
    </g>
    <g transform="translate(1100 820)" stroke={OUT} strokeWidth={SW}>
      <rect x={-50} y={-160} width={100} height={160} fill="#ddd" />
      <path d="M -46 -160 Q -60 -260 0 -270 Q 60 -260 46 -160 Z" fill="#9ad0ec" fillOpacity={0.8} />
      <rect x={-20} y={-80} width={40} height={14} fill="#2f7fd8" strokeWidth={3} />
    </g>
  </g>
);
