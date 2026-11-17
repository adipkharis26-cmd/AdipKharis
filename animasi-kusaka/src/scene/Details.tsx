import React from "react";

/* Locked detail pass (locations v3): props, wear, plants, cables and cast shadows layered over each set so the
   flat sets read like lived-in places (reference look). Pictures only — no readable text. */
const OUT = "#1b1b1b";
const rnd = (i: number, s = 1) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };

/* ---------- shared props ---------- */
export const AO: React.FC<{ y: number; h?: number; up?: boolean; op?: number }> = ({ y, h = 60, up, op = 0.22 }) => (
  <g>
    <linearGradient id={`ao${y}${up ? "u" : "d"}`} x1="0" x2="0" y1={up ? "1" : "0"} y2={up ? "0" : "1"}>
      <stop offset="0" stopColor="#2a2035" stopOpacity={0} /><stop offset="1" stopColor="#2a2035" stopOpacity={op} />
    </linearGradient>
    <rect x={-400} y={up ? y : y - h} width={2720} height={h} fill={`url(#ao${y}${up ? "u" : "d"})`} />
  </g>
);
export const CastShadow: React.FC<{ x: number; w: number; y: number; len: number; dir?: number; op?: number }> = ({ x, w, y, len, dir = 1, op = 0.18 }) => (
  <path d={`M ${x} ${y} L ${x + w} ${y} L ${x + w + len * dir} ${y + len * 0.35} L ${x + len * dir} ${y + len * 0.35} Z`} fill="#2a2035" opacity={op} />
);
export const Stains: React.FC<{ x: number; w: number; y: number; h: number; seed: number; color?: string }> = ({ x, w, y, h, seed, color = "#6b5a3e" }) => (
  <g opacity={0.16} fill={color}>
    {Array.from({ length: Math.round(w / 90) }).map((_, i) => (
      <path key={i} d={`M ${x + rnd(i, seed) * w} ${y} q ${6 - rnd(i, seed + 1) * 12} ${h * 0.4} ${2} ${h * (0.3 + rnd(i, seed + 2) * 0.7)} l ${8 + rnd(i, seed + 3) * 14} 0 q -4 ${-h * 0.3} -2 ${-h * (0.3 + rnd(i, seed + 2) * 0.7)} Z`} />
    ))}
  </g>
);
export const Cracks: React.FC<{ pts: [number, number][] }> = ({ pts }) => (
  <g stroke="#7a6a50" strokeWidth={2.5} fill="none" opacity={0.55} strokeLinecap="round">
    {pts.map(([x, y], i) => <path key={i} d={`M ${x} ${y} l ${14 + rnd(i) * 10} ${18} l -8 ${16} l ${12} ${20} m -12 -20 l -14 10`} />)}
  </g>
);
export const Bush: React.FC<{ x: number; y: number; w: number; s?: number; seed?: number }> = ({ x, y, w, s = 1, seed = 1 }) => {
  const n = Math.max(3, Math.round(w / 55));
  return (
    <g stroke={OUT} strokeWidth={4}>
      {Array.from({ length: n }).map((_, i) => {
        const cx = x + (i + 0.5) * (w / n), r = (38 + rnd(i, seed) * 22) * s;
        return <circle key={i} cx={cx} cy={y - r * 0.7} r={r} fill={i % 2 ? "#3f9a45" : "#4fae52"} />;
      })}
      <g stroke="none" fill="#7fd07a" opacity={0.7}>
        {Array.from({ length: n }).map((_, i) => <ellipse key={i} cx={x + (i + 0.35) * (w / n)} cy={y - (55 + rnd(i, seed) * 18) * s} rx={12 * s} ry={7 * s} transform={`rotate(-25 ${x + (i + 0.35) * (w / n)} ${y - 60 * s})`} />)}
      </g>
      <rect x={x} y={y - 8} width={w} height={10} fill="#2a2035" opacity={0.25} stroke="none" />
    </g>
  );
};
export const Pot: React.FC<{ x: number; y: number; s?: number; t: number; seed?: number }> = ({ x, y, s = 1, t, seed = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={OUT} strokeWidth={4}>
    <g transform={`rotate(${Math.sin(t * 1.6 + seed) * 2})`}>
      {[-50, -25, 0, 25, 50].map((a, i) => <path key={a} d={`M 0 -60 Q ${a * 0.8} -120 ${a * 1.4} -${150 + (i % 2) * 30} Q ${a * 0.3} -110 0 -60`} fill={i % 2 ? "#3f9a45" : "#58b35a"} />)}
    </g>
    <path d="M -38 -64 L 38 -64 L 28 0 L -28 0 Z" fill="#c8553d" />
    <rect x={-42} y={-74} width={84} height={14} rx={4} fill="#b0472f" />
  </g>
);
export const Leaves: React.FC<{ y0: number; y1: number; n: number; seed: number }> = ({ y0, y1, n, seed }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = -200 + rnd(i, seed) * 2300, y = y0 + rnd(i, seed + 5) * (y1 - y0);
      return <ellipse key={i} cx={x} cy={y} rx={10} ry={5} fill={["#c98f2e", "#a8713f", "#7aa83f"][i % 3]} transform={`rotate(${rnd(i, seed + 9) * 180} ${x} ${y})`} opacity={0.85} />;
    })}
  </g>
);
export const Scooter: React.FC<{ x: number; y: number; s?: number; color: string; flip?: boolean }> = ({ x, y, s = 1, color, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} stroke={OUT} strokeWidth={5} strokeLinejoin="round">
    <ellipse cx={0} cy={4} rx={200} ry={14} fill="#2a2035" opacity={0.2} stroke="none" />
    <circle cx={-120} cy={-46} r={46} fill="#222" /><circle cx={-120} cy={-46} r={20} fill="#aaa" />
    <circle cx={130} cy={-46} r={46} fill="#222" /><circle cx={130} cy={-46} r={20} fill="#aaa" />
    <path d="M -170 -70 Q -170 -140 -90 -150 L 40 -150 Q 70 -150 80 -110 L 100 -70 L 40 -60 L -60 -60 Q -100 -60 -110 -80 Z" fill={color} />
    <path d="M -150 -150 Q -150 -176 -110 -176 L 20 -176 Q 40 -176 40 -152 L -150 -150 Z" fill="#2b2b2b" />
    <path d="M 70 -110 L 120 -230 L 150 -230" fill="none" strokeWidth={10} strokeLinecap="round" />
    <path d="M 100 -170 L 160 -150 L 170 -110 L 120 -90 Z" fill={color} />
    <circle cx={160} cy={-196} r={14} fill="#fff6c4" />
    <rect x={128} y={-246} width={50} height={14} rx={6} fill="#2b2b2b" />
  </g>
);
export const TubeLamp: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 220 }) => (
  <g stroke={OUT} strokeWidth={4}>
    <line x1={x + 20} y1={y - 30} x2={x + 20} y2={y} /><line x1={x + w - 20} y1={y - 30} x2={x + w - 20} y2={y} />
    <rect x={x} y={y} width={w} height={22} rx={6} fill="#e9eef2" />
    <rect x={x + 10} y={y + 8} width={w - 20} height={10} rx={5} fill="#fffef2" stroke="none" />
    <ellipse cx={x + w / 2} cy={y + 30} rx={w * 0.7} ry={40} fill="#fffbe6" opacity={0.22} stroke="none" />
  </g>
);
const Bins: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g stroke={OUT} strokeWidth={4}>
    {["#3c8d5a", "#ffd23f", "#e63946"].map((c, i) => (
      <g key={c} transform={`translate(${x + i * 78} ${y})`}>
        <path d="M -30 -110 L 30 -110 L 24 0 L -24 0 Z" fill={c} />
        <rect x={-34} y={-122} width={68} height={16} rx={5} fill={c} />
        <path d="M -10 -70 l 10 -14 l 10 14 M -12 -50 l 24 0" fill="none" stroke="#fff" strokeWidth={4} />
      </g>
    ))}
  </g>
);

/* ---------- per-set detail passes ---------- */
const GerbangDetail: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {/* cables + pole */}
    <g stroke={OUT} strokeWidth={6}>
      <rect x={60} y={120} width={22} height={760} fill="#9a9a9a" />
      <rect x={20} y={150} width={100} height={12} fill="#7a7a7a" strokeWidth={4} />
      <rect x={58} y={300} width={26} height={40} fill="#666" strokeWidth={3} />
    </g>
    <g stroke="#1b1b1b" strokeWidth={3} fill="none" opacity={0.85}>
      <path d={`M 30 156 Q 900 ${250 + Math.sin(t) * 3} 2300 170`} /><path d={`M 110 156 Q 950 ${290 + Math.sin(t + 1) * 3} 2300 210`} /><path d="M 70 164 Q 600 230 1200 120" />
    </g>
    {/* wall wear */}
    <Stains x={-400} w={1160} y={706} h={70} seed={2} /><Stains x={1160} w={1200} y={706} h={70} seed={4} />
    <AO y={880} h={50} op={0.3} />
    <Cracks pts={[[120, 730], [1260, 760], [1980, 720]]} />
    <g fill="#5e8f3a" opacity={0.55}>{[-300, 60, 420, 1200, 1480, 2000].map((x, i) => <ellipse key={x} cx={x} cy={872} rx={50 + (i % 3) * 18} ry={10} />)}</g>
    {/* hedges at wall foot */}
    <Bush x={-380} y={880} w={420} seed={1} /><Bush x={1220} y={880} w={280} s={0.85} seed={3} />
    <Pot x={700} y={880} t={t} s={0.9} /><Pot x={1240 + 0} y={880} t={t} s={0.9} seed={2} />
    {/* pillar lamps + CCTV */}
    {[770, 1170].map((x) => <g key={x} stroke={OUT} strokeWidth={4}><rect x={x - 18} y={378} width={36} height={24} fill="#3c8d5a" /><path d={`M ${x - 22} 378 L ${x + 22} 378 L ${x + 14} 346 L ${x - 14} 346 Z`} fill="#fff6c4" /></g>)}
    <g transform="translate(1240 300)" stroke={OUT} strokeWidth={4}><rect x={0} y={-6} width={40} height={10} fill="#888" /><rect x={30} y={-18} width={64} height={30} rx={8} fill="#f2f2f2" /><circle cx={92} cy={-3} r={8} fill="#222" /></g>
    {/* post props */}
    <g transform="translate(1560 880)" stroke={OUT} strokeWidth={4}><rect x={-10} y={-120} width={70} height={10} fill="#8a5a2b" /><rect x={-4} y={-110} width={8} height={110} fill="#6e3a1c" /><rect x={46} y={-110} width={8} height={110} fill="#6e3a1c" /></g>
    {/* cast shadows (sun from left) */}
    <CastShadow x={740} w={60} y={880} len={260} /><CastShadow x={1140} w={60} y={880} len={260} /><CastShadow x={1540} w={200} y={880} len={200} op={0.14} />
    {/* ground detail */}
    <rect x={-400} y={880} width={2800} height={14} fill="#a59d8c" stroke={OUT} strokeWidth={3} />
    <g transform="translate(330 960)" stroke={OUT} strokeWidth={3}><rect width={150} height={34} fill="#6f6a60" />{Array.from({ length: 8 }).map((_, i) => <line key={i} x1={12 + i * 18} y1={4} x2={12 + i * 18} y2={30} stroke="#3a3630" strokeWidth={4} />)}</g>
    <Leaves y0={900} y1={1060} n={26} seed={3} />
    <Scooter x={1820} y={1000} s={0.9} color="#2f7fd8" />
  </g>
);

const KoridorDetail: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <AO y={90} h={70} up op={0.28} />
    {[380, 1160, 1940].map((x) => <TubeLamp key={x} x={x - 110} y={100} />)}
    {/* pillar cel-shade + wear */}
    {[180, 960, 1740].map((x) => <g key={x}><rect x={x + 12} y={84} width={28} height={636} fill="#2a2035" opacity={0.1} /><rect x={x - 34} y={90} width={8} height={630} fill="#fff" opacity={0.5} /></g>)}
    {/* fire extinguisher + bins + notice pictograms */}
    <g transform="translate(1010 560)" stroke={OUT} strokeWidth={4}><rect x={0} y={0} width={40} height={90} rx={12} fill="#e63946" /><rect x={8} y={-18} width={24} height={20} fill="#333" /><path d="M 32 -10 Q 60 0 52 40" fill="none" strokeWidth={6} /></g>
    <Bins x={1500} y={790} />
    <g transform="translate(300 200)" stroke={OUT} strokeWidth={4}>
      <rect width={160} height={210} fill="#fff" transform="rotate(-2 80 105)" />
      <circle cx={80} cy={80} r={42} fill="#3bceac" /><path d="M 56 80 l 18 18 l 30 -36" fill="none" stroke="#fff" strokeWidth={10} />
      <rect x={30} y={150} width={100} height={12} fill="#ccc" stroke="none" /><rect x={30} y={172} width={70} height={12} fill="#ccc" stroke="none" />
    </g>
    <Stains x={-400} w={2720} y={652} h={60} seed={9} />
    <AO y={790} h={40} op={0.3} />
    {/* floor: pillar shadows + shine */}
    {[180, 960, 1740].map((x) => <CastShadow key={x} x={x - 40} w={80} y={800} len={280} op={0.16} />)}
    <g opacity={0.25} fill="#fff">{[300, 1100, 1900].map((x) => <path key={x} d={`M ${x} 830 L ${x + 160} 830 L ${x + 60} 1000 L ${x - 100} 1000 Z`} />)}</g>
    <Pot x={-60} y={800} t={t} s={1.1} seed={4} />
  </g>
);

const KelasDetail: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {[600, 1150].map((x) => <TubeLamp key={x} x={x} y={40} w={240} />)}
    <AO y={0} h={90} up op={0.22} />
    {/* whiteboard smudges + markers + eraser */}
    <g opacity={0.18} fill="#8d939c">{[[700, 470, 140], [880, 260, 90], [1250, 420, 70]].map(([x, y, w], i) => <ellipse key={i} cx={x} cy={y} rx={w} ry={18} />)}</g>
    <g stroke={OUT} strokeWidth={3}>
      {["#1b1b1b", "#2f7fd8", "#e63946"].map((c, i) => <rect key={c} x={660 + i * 50} y={516} width={40} height={12} rx={5} fill={c} />)}
      <rect x={1180} y={510} width={70} height={20} rx={4} fill="#333" /><rect x={1180} y={500} width={70} height={12} fill="#e9e9e9" />
    </g>
    {/* class structure chart + schedule grid (no text) */}
    <g transform="translate(1400 40)" stroke={OUT} strokeWidth={3} fill="#fff"><rect width={150} height={120} fill="#fff8e1" /><rect x={55} y={14} width={40} height={20} /><rect x={15} y={58} width={40} height={20} /><rect x={95} y={58} width={40} height={20} /><path d="M 75 34 L 75 46 L 35 46 L 35 58 M 75 46 L 115 46 L 115 58" fill="none" />{[20, 50, 80, 110].map((x) => <rect key={x} x={x - 8} y={92} width={22} height={16} />)}</g>
    <g transform="translate(140 530)" stroke={OUT} strokeWidth={3}><rect width={36} height={54} rx={4} fill="#f2f2f2" /><rect x={10} y={12} width={16} height={12} fill="#ddd" /><circle cx={18} cy={38} r={5} fill="#ddd" /></g>
    <g transform="translate(470 40)" stroke={OUT} strokeWidth={4}><rect width={70} height={100} rx={8} fill="#333" /><circle cx={35} cy={55} r={22} fill="#555" /></g>
    {/* wall wear + dado shadow */}
    <Stains x={-400} w={2720} y={620} h={40} seed={6} color="#4f7c6a" />
    <AO y={770} h={36} op={0.3} />
    {/* window sill plants + broom + bin */}
    <Pot x={1560} y={548} s={0.55} t={t} /><Pot x={1790} y={548} s={0.5} t={t} seed={3} />
    <g transform="translate(1900 770) rotate(-12)" stroke={OUT} strokeWidth={4}><rect x={-4} y={-300} width={8} height={240} fill="#c98f55" /><path d="M -30 -60 L 30 -60 L 40 0 L -40 0 Z" fill="#e2c26b" />{[-24, -8, 8, 24].map((x) => <line key={x} x1={x} y1={-56} x2={x * 1.3} y2={-4} strokeWidth={3} />)}</g>
    <g transform="translate(40 790)" stroke={OUT} strokeWidth={4}><path d="M -34 -90 L 34 -90 L 26 0 L -26 0 Z" fill="#2f7fd8" /><path d="M -20 -94 q 10 -20 30 -8" fill="none" stroke="#fff" /></g>
    {/* desk props: books, bottles, pencil cases */}
    {[230, 620, 1300, 1690].map((x, i) => (
      <g key={x} stroke={OUT} strokeWidth={3}>
        <rect x={x - 60} y={738} width={70} height={12} fill={["#e63946", "#3c8d5a", "#ffd23f", "#2f7fd8"][i]} transform={`rotate(${i % 2 ? 4 : -3} ${x} 744)`} />
        {i % 2 === 0 && <g><rect x={x + 30} y={700} width={22} height={50} rx={6} fill="#bfe8ff" fillOpacity={0.8} /><rect x={x + 32} y={692} width={18} height={10} fill="#2f7fd8" /></g>}
      </g>
    ))}
    {/* floor shine + desk shadows */}
    <g opacity={0.22} fill="#fff">{[400, 1500].map((x) => <path key={x} d={`M ${x} 790 L ${x + 200} 790 L ${x + 80} 980 L ${x - 120} 980 Z`} />)}</g>
    {[150, 540, 1220, 1610].map((x) => <CastShadow key={x} x={x} w={180} y={862} len={120} dir={-1} op={0.14} />)}
  </g>
);

const KantinDetail: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <AO y={200} h={60} up op={0.25} />
    {/* backsplash tiles behind each stall */}
    {[40, 720, 1400].map((x) => (
      <g key={x}>
        {Array.from({ length: 11 }).map((_, i) => <line key={`v${i}`} x1={x + 10 + i * 42} y1={342} x2={x + 10 + i * 42} y2={432} stroke="#c9c1a8" strokeWidth={3} />)}
        {Array.from({ length: 3 }).map((_, i) => <line key={`h${i}`} x1={x + 10} y1={344 + i * 44} x2={x + 470} y2={344 + i * 44} stroke="#c9c1a8" strokeWidth={3} />)}
        <Stains x={x + 10} w={460} y={344} h={60} seed={x} />
      </g>
    ))}
    {/* hanging sachet strips (renceng) */}
    {([[60, 3], [110, 3], [580, 7], [640, 6], [1850, 3]] as const).map(([x, n], k) => (
      <g key={x} transform={`rotate(${Math.sin(t * 1.3 + k) * 1.5} ${x} 330)`}>
        <line x1={x} y1={318} x2={x} y2={334} stroke={OUT} strokeWidth={3} />
        {Array.from({ length: n }).map((_, i) => <rect key={i} x={x - 16} y={334 + i * 30} width={32} height={28} rx={3} fill={["#e63946", "#ffd23f", "#2f7fd8", "#3bceac", "#e85d75", "#f39c3d"][(i + k) % 6]} stroke={OUT} strokeWidth={2.5} />)}
      </g>
    ))}
    {/* shelves with jars on backsplash */}
    {[[360, 420], [1080, 400], [1760, 430]].map(([x, y], i) => (
      <g key={x} stroke={OUT} strokeWidth={3}>
        <rect x={x - 70} y={y} width={140} height={10} fill="#8a5126" />
        {[0, 1, 2].map((j) => <g key={j}><rect x={x - 60 + j * 44} y={y - 46} width={36} height={46} rx={6} fill="#eaf7ff" fillOpacity={0.8} /><rect x={x - 62 + j * 44} y={y - 54} width={40} height={10} rx={3} fill={["#e63946", "#2f7fd8", "#ffd23f"][(i + j) % 3]} /></g>)}
      </g>
    ))}
    {/* counter props: kerupuk tins, sauce bottles */}
    {[[340, "#2f7fd8"], [1110, "#e63946"]].map(([x, c]) => (
      <g key={x as number} transform={`translate(${x} 560)`} stroke={OUT} strokeWidth={3}>
        <rect x={0} y={-80} width={70} height={80} fill="#fff8e1" fillOpacity={0.7} /><rect x={-4} y={-92} width={78} height={14} rx={4} fill={c as string} />
        {[0, 1, 2].map((j) => <ellipse key={j} cx={18 + j * 18} cy={-30 - (j % 2) * 18} rx={14} ry={9} fill="#f6d78b" stroke="none" />)}
      </g>
    ))}
    <AO y={840} h={40} op={0.3} />
    {/* table props + stools */}
    {[400, 900, 1400].map((x, i) => (
      <g key={x} stroke={OUT} strokeWidth={3}>
        <rect x={x} y={872} width={16} height={38} rx={4} fill="#e63946" /><rect x={x + 22} y={876} width={16} height={34} rx={4} fill="#3c8d5a" />
        <rect x={x + 50} y={888} width={40} height={22} rx={3} fill="#fff" />
        <rect x={x - 220 + i * 30} y={1010} width={90} height={16} rx={6} fill={i % 2 ? "#2f7fd8" : "#e63946"} /><path d={`M ${x - 210 + i * 30} 1026 L ${x - 220 + i * 30} 1090 M ${x - 140 + i * 30} 1026 L ${x - 130 + i * 30} 1090`} />
      </g>
    ))}
    <rect x={140} y={1030} width={1640} height={40} fill="#2a2035" opacity={0.12} />
    <g opacity={0.2} fill="#fff">{[600, 1500].map((x) => <path key={x} d={`M ${x} 850 L ${x + 160} 850 L ${x + 60} 900 L ${x - 100} 900 Z`} />)}</g>
  </g>
);

export const DETAILS: Partial<Record<string, React.FC<{ t: number }>>> = {
  gerbang: GerbangDetail,
  koridor: KoridorDetail,
  kelas: KelasDetail,
  kantin: KantinDetail,
};
