import React from "react";
import { AO, Bush, CastShadow, Cracks, Leaves, Pot, Scooter, Stains, TubeLamp } from "./Details";

/* Locked detail pass, part 2 (locations v3): the remaining ten sets. Pictures only — no readable text. */
const OUT = "#1b1b1b";

const Shine: React.FC<{ xs: number[]; y: number; h?: number; op?: number }> = ({ xs, y, h = 180, op = 0.2 }) => (
  <g opacity={op} fill="#fff">{xs.map((x) => <path key={x} d={`M ${x} ${y} L ${x + 180} ${y} L ${x + 70} ${y + h} L ${x - 110} ${y + h} Z`} />)}</g>
);
const Rug: React.FC<{ x: number; y: number; w: number; h: number; c: string; c2: string }> = ({ x, y, w, h, c, c2 }) => (
  <g stroke={OUT} strokeWidth={4}>
    <ellipse cx={x} cy={y} rx={w / 2} ry={h / 2} fill={c} />
    <ellipse cx={x} cy={y} rx={w / 2 - 26} ry={h / 2 - 12} fill="none" stroke={c2} strokeWidth={8} />
  </g>
);
const Bulb: React.FC<{ x: number; y: number; len: number; t: number; glow?: string }> = ({ x, y, len, t, glow = "#fff3c4" }) => (
  <g transform={`rotate(${Math.sin(t * 1.1) * 1.2} ${x} ${y})`}>
    <ellipse cx={x} cy={y + len + 18} rx={160} ry={120} fill={glow} opacity={0.18} />
    <line x1={x} y1={y} x2={x} y2={y + len} stroke={OUT} strokeWidth={3} />
    <rect x={x - 8} y={y + len - 4} width={16} height={12} fill="#555" stroke={OUT} strokeWidth={2} />
    <circle cx={x} cy={y + len + 18} r={14} fill="#fffbe6" stroke={OUT} strokeWidth={3} />
  </g>
);
const Bag: React.FC<{ x: number; y: number; c: string; s?: number; r?: number }> = ({ x, y, c, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} stroke={OUT} strokeWidth={4}>
    <path d="M -40 0 L -44 -80 Q -44 -110 0 -112 Q 44 -110 44 -80 L 40 0 Z" fill={c} />
    <rect x={-28} y={-50} width={56} height={34} rx={8} fill="#2a2035" fillOpacity={0.25} />
    <path d="M -20 -112 Q 0 -134 20 -112" fill="none" strokeWidth={5} />
  </g>
);
const Chair: React.FC<{ x: number; y: number; c: string; flip?: boolean }> = ({ x, y, c, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`} stroke={OUT} strokeWidth={4}>
    <rect x={-50} y={-210} width={20} height={210} fill="#555" />
    <rect x={-56} y={-220} width={36} height={110} rx={8} fill={c} />
    <rect x={-56} y={-110} width={110} height={20} rx={6} fill={c} />
    <rect x={40} y={-90} width={10} height={90} fill="#555" />
  </g>
);
const Stool: React.FC<{ x: number; y: number; c: string }> = ({ x, y, c }) => (
  <g transform={`translate(${x} ${y})`} stroke={OUT} strokeWidth={4}>
    <rect x={-46} y={-96} width={92} height={18} rx={8} fill={c} />
    <path d={`M -38 -78 L -46 0 M 38 -78 L 46 0 M -30 -40 L 30 -40`} strokeWidth={6} />
  </g>
);
const Paper: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`} stroke={OUT} strokeWidth={2.5}><path d="M -14 -6 L -4 -14 L 10 -10 L 14 4 L 2 12 L -12 8 Z" fill="#fbfbf7" /><path d="M -6 -4 L 6 2" /></g>
);
const Bunting: React.FC<{ x1: number; x2: number; y: number; t: number }> = ({ x1, x2, y, t }) => {
  const n = Math.round((x2 - x1) / 70);
  return (
    <g stroke={OUT} strokeWidth={3}>
      <path d={`M ${x1} ${y} Q ${(x1 + x2) / 2} ${y + 60} ${x2} ${y}`} fill="none" />
      {Array.from({ length: n }).map((_, i) => {
        const k = (i + 0.5) / n, x = x1 + (x2 - x1) * k, yy = y + 60 * 4 * k * (1 - k) * 0.5 * 2 / 2;
        return <path key={i} d={`M ${x - 22} ${yy} L ${x + 22} ${yy} L ${x} ${yy + 46 + Math.sin(t * 3 + i) * 3} Z`} fill={i % 2 ? "#fff" : "#e63946"} />;
      })}
    </g>
  );
};

/* ---------------------------------------------------------------- sets */
const WarungDetail: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <AO y={330} h={60} up op={0.3} />
    <g fill="#7a4520" opacity={0.6}>{[[420, 760], [640, 420], [990, 700], [1250, 380], [1480, 760]].map(([x, y]) => <ellipse key={x} cx={x} cy={y} rx={9} ry={14} />)}</g>
    <Bulb x={960} y={226} len={70} t={t} />
    <g transform="translate(330 400)" stroke={OUT} strokeWidth={3}><rect width={60} height={80} rx={4} fill="#ddd" /><circle cx={30} cy={34} r={16} fill="#fff" /><rect x={14} y={58} width={32} height={10} fill="#333" /></g>
    <CastShadow x={360} w={1200} y={890} len={140} dir={-1} op={0.16} />
    <g transform="translate(1700 880)" stroke={OUT} strokeWidth={4}><path d="M -40 -120 Q -44 -150 0 -150 Q 44 -150 40 -120 L 40 0 L -40 0 Z" fill="#4caf50" /><rect x={-14} y={-176} width={28} height={28} rx={6} fill="#888" /><path d="M -40 -40 L 40 -40" stroke="#3a8a3d" strokeWidth={6} /></g>
    <g transform="translate(140 880)" stroke={OUT} strokeWidth={4}><rect x={-80} y={-90} width={160} height={90} fill="#f2c12e" />{[-50, -10, 30, 70].map((x) => <rect key={x} x={x - 12} y={-130} width={24} height={44} rx={6} fill="#5b3a1a" fillOpacity={0.85} />)}<path d="M -80 -50 L 80 -50" /></g>
    <Stool x={520} y={1000} c="#e63946" /><Stool x={1380} y={1000} c="#2f7fd8" />
    <Leaves y0={900} y1={1000} n={18} seed={11} />
    <Scooter x={-60} y={1010} s={0.85} color="#e63946" flip />
  </g>
);

const KamarDetail: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <AO y={780} h={50} op={0.25} />
    <g transform="translate(1400 300)" stroke={OUT} strokeWidth={4}>
      <rect x={0} y={0} width={420} height={16} fill="#8a5a2b" />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={20 + i * 28} y={-70 + (i % 2) * 10} width={24} height={70 - (i % 2) * 10} fill={["#2f7fd8", "#e63946", "#ffd23f", "#3c8d5a", "#e85d75"][i]} />)}
      <path d="M 220 -6 L 260 -6 L 254 -50 L 226 -50 Z" fill="#ffd23f" /><rect x={230} y={-60} width={20} height={12} fill="#ffd23f" />
      <circle cx={340} cy={-30} r={30} fill="#f39c3d" /><path d="M 310 -30 L 370 -30 M 340 -60 Q 356 -30 340 0" fill="none" strokeWidth={3} />
    </g>
    <g transform="translate(1200 820) rotate(-10)" stroke={OUT} strokeWidth={4}><ellipse cx={0} cy={-80} rx={58} ry={74} fill="#c98f55" /><circle cx={0} cy={-90} r={18} fill="#3a2414" /><rect x={-10} y={-330} width={20} height={200} fill="#6e3a1c" /><rect x={-16} y={-370} width={32} height={46} rx={6} fill="#3a2414" /></g>
    <Rug x={920} y={930} w={620} h={150} c="#3bceac" c2="#2a9d8f" />
    <Bag x={640} y={850} c="#2f7fd8" r={-14} />
    <g stroke={OUT} strokeWidth={4}><path d="M 760 900 Q 800 860 860 880 Q 900 900 850 920 Q 800 940 760 900 Z" fill="#e63946" /><path d="M 830 910 Q 880 890 930 912 Q 900 940 840 930 Z" fill="#ffd23f" /></g>
    <g stroke={OUT} strokeWidth={4}>{[0, 1].map((i) => <path key={i} d={`M ${1080 + i * 50} 960 q 0 -24 26 -24 l 18 0 l 4 24 Z`} fill="#fff" />)}</g>
    <path d="M 520 620 Q 600 700 560 780 Q 540 820 600 840" fill="none" stroke="#333" strokeWidth={3} />
    <Shine xs={[900]} y={830} h={200} op={0.12} />
  </g>
);

const ClassCommon: React.FC<{ lamps: number[]; floor: number; dado: number; t: number }> = ({ lamps, floor, dado }) => (
  <g>
    {lamps.map((x) => <TubeLamp key={x} x={x} y={36} w={240} />)}
    <AO y={0} h={90} up op={0.2} />
    <Stains x={-400} w={2720} y={dado} h={44} seed={dado} color="#4f7c6a" />
    <AO y={floor} h={36} op={0.3} />
  </g>
);

const KelasBelakangDetail: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <ClassCommon lamps={[560, 1180]} floor={770} dado={620} t={t} />
    {[[1620, 230, "#e85d75"], [1800, 260, "#3bceac"]].map(([x, y, c]) => (
      <g key={x as number} transform={`translate(${x} ${y})`} stroke={OUT} strokeWidth={4}><rect width={150} height={200} fill="#fff" /><circle cx={75} cy={80} r={44} fill={c as string} /><rect x={25} y={146} width={100} height={12} fill="#ccc" stroke="none" /><circle cx={75} cy={-4} r={6} fill="#e63946" /></g>
    ))}
    <Bag x={330} y={760} c="#3c8d5a" s={0.8} r={8} /><Bag x={1260} y={760} c="#e85d75" s={0.8} r={-6} />
    {[[600, 900, -20], [1100, 940, 30], [1460, 880, 70]].map(([x, y, r]) => <Paper key={x} x={x} y={y} r={r} />)}
    {[150, 590, 1070, 1510].map((x) => <CastShadow key={x} x={x} w={170} y={900} len={110} dir={-1} op={0.14} />)}
    <Shine xs={[500, 1300]} y={790} />
  </g>
);

const KelasJendelaDetail: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <ClassCommon lamps={[440, 1060]} floor={770} dado={600} t={t} />
    <g fill="#fff8d6" opacity={0.7}>{Array.from({ length: 24 }).map((_, i) => <circle key={i} cx={(i * 173 + t * 12 * (i % 3 + 1)) % 1900} cy={250 + ((i * 97 + t * 8) % 500)} r={2.5} />)}</g>
    <Bag x={470} y={810} c="#e63946" s={0.7} r={6} />
    {[[700, 930, 10], [1240, 900, -40], [1500, 960, 80], [260, 960, 30]].map(([x, y, r]) => <Paper key={x} x={x} y={y} r={r} />)}
    <g transform="translate(1250 760) rotate(-8)" stroke={OUT} strokeWidth={3}><path d="M 0 0 L 60 -10 L 20 6 Z M 20 6 L 60 -10 L 14 16 Z" fill="#fff" /></g>
    {[300, 920, 1540].map((x) => <CastShadow key={x} x={x - 90} w={180} y={900} len={130} op={0.14} />)}
    <Shine xs={[200, 820, 1440]} y={790} h={220} op={0.28} />
  </g>
);

const MejaGuruDetail: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <ClassCommon lamps={[640, 1200]} floor={790} dado={640} t={t} />
    <g transform="translate(150 60)" stroke={OUT} strokeWidth={4}><rect width={300} height={84} rx={14} fill="#fbfbf7" />{[30, 44, 58].map((y) => <line key={y} x1={30} x2={270} y1={y} y2={y} strokeWidth={3} />)}<circle cx={268} cy={18} r={5} fill="#3bceac" stroke="none" /></g>
    <g transform="translate(540 400)" stroke={OUT} strokeWidth={4}><rect width={150} height={180} fill="#c98f55" /><rect x={14} y={14} width={122} height={152} fill="#fff8e1" />{[44, 74, 104, 134].map((y) => <line key={y} x1={26} x2={124} y1={y} y2={y} stroke="#bbb" strokeWidth={3} />)}{[60, 92].map((x) => <line key={x} x1={x} x2={x} y1={30} y2={150} stroke="#bbb" strokeWidth={3} />)}</g>
    <Pot x={1460} y={790} s={0.9} t={t} />
    <g transform="translate(1250 640)" stroke={OUT} strokeWidth={3}><rect x={0} y={-36} width={70} height={36} fill="#fff" /><path d="M 20 -36 q 14 -24 30 0" fill="#fff" /></g>
    <CastShadow x={560} w={820} y={956} len={120} dir={-1} op={0.16} />
    <Shine xs={[200, 1500]} y={810} />
  </g>
);

const RuangBKDetail: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <AO y={0} h={90} up op={0.2} />
    <AO y={800} h={36} op={0.3} />
    <Rug x={970} y={990} w={980} h={150} c="#7d5ba6" c2="#5e4380" />
    <Chair x={1500} y={800} c="#3d5a80" /><Chair x={1700} y={800} c="#3d5a80" />
    <g transform="translate(1000 620)" stroke={OUT} strokeWidth={3}><rect x={0} y={-34} width={64} height={34} rx={4} fill="#fff" /><path d="M 18 -34 q 14 -22 30 0" fill="#fff" /></g>
    <g transform="translate(160 20)" stroke={OUT} strokeWidth={4}><rect width={130} height={100} fill="#fff" /><rect x={10} y={10} width={110} height={80} fill="#f3c66b" /><circle cx={65} cy={50} r={22} fill="#e63946" /></g>
    <CastShadow x={620} w={700} y={954} len={110} dir={-1} op={0.16} />
    <Shine xs={[1500]} y={820} h={160} op={0.2} />
  </g>
);

const PerpustakaanDetail: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <AO y={0} h={100} up op={0.22} />
    <AO y={800} h={40} op={0.32} />
    {[420, 960, 1500].map((x) => <g key={x}><line x1={x} y1={0} x2={x} y2={60} stroke={OUT} strokeWidth={3} /><path d={`M ${x - 46} 100 Q ${x} 40 ${x + 46} 100 Z`} fill="#3c8d5a" stroke={OUT} strokeWidth={4} /><ellipse cx={x} cy={140} rx={110} ry={60} fill="#fff3c4" opacity={0.2} /></g>)}
    <g fill="#fff8d6" opacity={0.75}>{Array.from({ length: 28 }).map((_, i) => <circle key={i} cx={900 + ((i * 61 + t * 10) % 420)} cy={200 + ((i * 113 + t * 6 * ((i % 3) + 1)) % 560)} r={2.5} />)}</g>
    <g transform="translate(1340 800) rotate(-14)" stroke={OUT} strokeWidth={5}><path d="M 0 0 L 60 -620 M 70 0 L 130 -620" fill="none" strokeWidth={10} stroke="#a8642f" />{Array.from({ length: 8 }).map((_, i) => <line key={i} x1={6 + i * 7.5} y1={-60 - i * 72} x2={76 + i * 7.5} y2={-60 - i * 72} stroke="#a8642f" strokeWidth={8} />)}</g>
    <g stroke={OUT} strokeWidth={3}>{[0, 1, 2, 3].map((i) => <rect key={i} x={560 - i * 2} y={864 - i * 16} width={110 - i * 8} height={16} fill={["#e63946", "#2f7fd8", "#ffd23f", "#3c8d5a"][i]} />)}</g>
    <Rug x={960} y={1060} w={1200} h={150} c="#b5513a" c2="#8a3a28" />
    <CastShadow x={360} w={1200} y={988} len={100} dir={-1} op={0.15} />
  </g>
);

const RuangTamuDetail: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <AO y={0} h={90} up op={0.2} />
    <AO y={820} h={40} op={0.3} />
    <Rug x={940} y={1010} w={900} h={160} c="#d9a441" c2="#b9822b" />
    <g transform="translate(960 0)" stroke={OUT} strokeWidth={4}><line x1={0} y1={0} x2={0} y2={70} /><path d="M -60 120 Q 0 50 60 120 Z" fill="#f3e3b5" /><ellipse cx={0} cy={150} rx={140} ry={70} fill="#fff3c4" opacity={0.22} stroke="none" /></g>
    <g transform="translate(1270 700)" stroke={OUT} strokeWidth={4}>
      <ellipse cx={0} cy={0} rx={56} ry={30} fill="#f39c3d" />
      <circle cx={-46} cy={-14} r={22} fill="#f39c3d" /><path d="M -60 -30 L -58 -48 L -46 -34 M -40 -34 L -30 -48 L -30 -30" fill="#f39c3d" />
      <path d="M -54 -14 q 4 4 8 0 M -42 -14 q 4 4 8 0" fill="none" strokeWidth={3} />
      <path d="M 50 4 Q 80 10 70 -20" fill="none" strokeWidth={8} stroke="#f39c3d" /><path d="M 50 4 Q 80 10 70 -20" fill="none" strokeWidth={3} />
      <path d="M -10 -18 l 10 -6 M 10 -20 l 10 -4" stroke="#c97a23" />
    </g>
    <g stroke={OUT} strokeWidth={4}>{[0, 1, 2].map((i) => <ellipse key={i} cx={1560 + i * 70} cy={920 + (i % 2) * 14} rx={30} ry={12} fill={["#2f7fd8", "#e63946", "#3c8d5a"][i]} />)}</g>
    <g transform="translate(-60 540)" stroke={OUT} strokeWidth={3}>{[0, 1, 2].map((i) => <rect key={i} x={40 + i * 90} y={-20} width={60} height={20} rx={4} fill="#fff" />)}</g>
    <CastShadow x={560} w={760} y={880} len={120} dir={-1} op={0.16} />
    <Shine xs={[1400]} y={840} h={200} op={0.18} />
  </g>
);

const LapanganDetail: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Bunting x1={-200} x2={860} y={210} t={t} /><Bunting x1={1060} x2={2120} y={210} t={t + 2} />
    <g transform="translate(300 600)" stroke={OUT} strokeWidth={5}><rect x={-8} y={-460} width={16} height={460} fill="#9a9a9a" />{[-1, 1].map((d) => <path key={d} d={`M 0 -440 L ${d * 70} -470 L ${d * 70} -400 Z`} fill="#ddd" />)}<rect x={-24} y={-300} width={48} height={40} fill="#666" /></g>
    {[[-260, 600], [1500, 600], [1780, 600]].map(([x, y], i) => <Bush key={x} x={x} y={y} w={220} s={0.8} seed={i + 5} />)}
    <CastShadow x={952} w={16} y={600} len={500} op={0.14} />
    <CastShadow x={1320} w={240} y={630} len={160} op={0.14} />
    <g fill="#9ab8d0" opacity={0.5}>{[[400, 820, 90], [1600, 960, 70]].map(([x, y, w]) => <ellipse key={x} cx={x} cy={y} rx={w} ry={16} />)}</g>
    <Cracks pts={[[620, 680], [1720, 820], [180, 980]]} />
    <Leaves y0={620} y1={1060} n={30} seed={21} />
  </g>
);

const KosDetail: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <AO y={0} h={110} up op={0.32} />
    <AO y={820} h={44} op={0.36} />
    <Bulb x={460} y={0} len={110} t={t} glow="#ffcf7a" />
    <path d="M 460 0 L 460 -10 M 460 0 Q 300 10 120 0" fill="none" stroke="#333" strokeWidth={3} />
    <g transform="translate(1250 200) rotate(4)" stroke={OUT} strokeWidth={4}><rect width={200} height={260} fill="#1b1b1b" /><circle cx={100} cy={110} r={56} fill="#e63946" /><path d="M 70 110 L 130 110 M 100 80 L 100 140" stroke="#fff" strokeWidth={10} /><rect x={-10} y={-8} width={40} height={16} fill="#f2e6b8" opacity={0.9} /><rect x={170} y={-8} width={40} height={16} fill="#f2e6b8" opacity={0.9} /></g>
    <g transform="translate(680 820)" stroke={OUT} strokeWidth={3}><ellipse cx={0} cy={-6} rx={36} ry={10} fill="#4a7a3a" /><circle cx={0} cy={-12} r={4} fill="#e63946" /></g>
    <g fill="none" stroke="#c8ced8" strokeWidth={4} opacity={0.7}><path d={`M 680 800 q ${10 + Math.sin(t) * 8} -40 0 -80 q ${-12 + Math.sin(t * 1.3) * 8} -40 4 -90`} /></g>
    <g transform="translate(860 820)" stroke={OUT} strokeWidth={3}><rect x={0} y={-24} width={160} height={24} rx={4} fill="#f2f2f2" />{[24, 56, 88, 120].map((x) => <rect key={x} x={x} y={-18} width={14} height={12} fill="#555" />)}<path d="M 40 -24 Q 30 -80 100 -90" fill="none" stroke="#333" /></g>
    <g stroke={OUT} strokeWidth={4}><path d="M 960 880 Q 1000 850 1060 870 Q 1100 890 1040 910 Q 990 920 960 880 Z" fill="#7d5ba6" /><path d="M 1020 900 Q 1070 880 1120 900 Q 1090 925 1030 918 Z" fill="#9ad0ec" /></g>
    <Shine xs={[800]} y={840} h={180} op={0.1} />
  </g>
);

export const DETAILS2: Record<string, React.FC<{ t: number }>> = {
  warung: WarungDetail,
  kamar: KamarDetail,
  kelasBelakang: KelasBelakangDetail,
  kelasJendela: KelasJendelaDetail,
  mejaGuru: MejaGuruDetail,
  ruangBK: RuangBKDetail,
  perpustakaan: PerpustakaanDetail,
  ruangTamu: RuangTamuDetail,
  lapanganUpacara: LapanganDetail,
  kos: KosDetail,
};
