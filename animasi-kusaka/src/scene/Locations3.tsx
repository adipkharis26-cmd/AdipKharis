import React from "react";

/* Lokasi v3.1.0 — keluar dari rumah & sekolah: ruang guru, pasar, halte, lapangan basket. Gambar saja, tanpa teks. */
const OUT = "#1b1b1b";
const SW = 6;
const rnd = (i: number, s = 1) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };

const Wall: React.FC<{ fill: string; dado?: string; dadoY?: number }> = ({ fill, dado, dadoY = 640 }) => (
  <g><rect x={-400} y={-400} width={2720} height={1600} fill={fill} />{dado && <rect x={-400} y={dadoY} width={2720} height={200} fill={dado} stroke={OUT} strokeWidth={4} />}</g>
);
const Tiles: React.FC<{ y: number; fill: string; line: string }> = ({ y, fill, line }) => (
  <g><rect x={-400} y={y} width={2720} height={1200} fill={fill} stroke={OUT} strokeWidth={SW} />
    {Array.from({ length: 14 }).map((_, i) => <line key={i} x1={-400 + i * 200} y1={y} x2={-700 + i * 260} y2={1100} stroke={line} strokeWidth={3} />)}
    {[y + 60, y + 150].map((yy) => <line key={yy} x1={-400} x2={2320} y1={yy} y2={yy} stroke={line} strokeWidth={3} />)}</g>
);
const Cloud: React.FC<{ t: number }> = ({ t }) => (
  <g fill="#fff" opacity={0.85}>{[[300, 120], [1200, 70], [1700, 170]].map(([x, y], i) => <g key={i} transform={`translate(${x + Math.sin(t * 0.2 + i) * 14} ${y})`}><ellipse rx={90} ry={34} /><ellipse cx={50} cy={-14} rx={60} ry={30} /></g>)}</g>
);

/* ------------------------------ RUANG GURU ------------------------------- */
export const RuangGuru: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Wall fill="#e6efe0" dado="#b9d3b4" dadoY={660} />
    <Tiles y={800} fill="#efe7d4" line="#d6cdb6" />
    {/* jendela */}
    <g transform="translate(1340 150)" stroke={OUT} strokeWidth={5}><rect width={440} height={360} fill="#a8dcf5" /><line x1={220} y1={0} x2={220} y2={360} /><line x1={0} y1={180} x2={440} y2={180} /><rect width={440} height={360} fill="none" strokeWidth={10} /></g>
    <g opacity={0.22} fill="#fff"><path d="M 1380 520 L 1820 520 L 1660 800 L 1200 800 Z" /></g>
    {/* jam dinding */}
    <g transform="translate(980 130)" stroke={OUT} strokeWidth={5}><circle r={56} fill="#fff" /><line x1={0} y1={0} x2={0} y2={-34} strokeWidth={5} transform={`rotate(${(t * 6) % 360})`} /><line x1={0} y1={0} x2={26} y2={0} strokeWidth={6} /></g>
    {/* papan jadwal (garis, tanpa teks) */}
    <g transform="translate(140 150)" stroke={OUT} strokeWidth={5}><rect width={520} height={320} fill="#fbfbf7" />
      {Array.from({ length: 6 }).map((_, i) => <line key={i} x1={0} x2={520} y1={50 + i * 45} y2={50 + i * 45} strokeWidth={3} />)}
      {Array.from({ length: 5 }).map((_, i) => <line key={i} y1={0} y2={320} x1={100 + i * 84} x2={100 + i * 84} strokeWidth={3} />)}
      {[[2, 1], [3, 2], [1, 3], [4, 4], [2, 5]].map(([c, r], i) => <rect key={i} x={104 + c * 84 - 84} y={54 + r * 45 - 45} width={74} height={32} fill={["#e85d75", "#ffd23f", "#2f7fd8", "#3c8d5a", "#f3a03c"][i]} stroke="none" opacity={0.8} />)}</g>
    {/* meja guru x3 + komputer */}
    {[330, 760, 1580].map((x, i) => (
      <g key={x} transform={`translate(${x - 190} 790)`} stroke={OUT} strokeWidth={SW}>
        <rect width={380} height={30} fill="#b9764b" /><rect x={20} y={30} width={26} height={150} fill="#8a5a2b" /><rect x={334} y={30} width={26} height={150} fill="#8a5a2b" />
        <g transform="translate(250 -70)"><rect width={96} height={66} rx={6} fill="#33415c" /><rect x={8} y={8} width={80} height={48} fill={i === 1 ? "#a8dcf5" : "#7fa8d6"} strokeWidth={3} /><rect x={38} y={66} width={20} height={14} fill="#555" /></g>
        <g transform="translate(40 -26)" fill="#fbfbf7" strokeWidth={4}><rect width={80} height={26} /><rect x={6} y={-12} width={80} height={14} fill="#ffd23f" /></g>
      </g>
    ))}
    {/* lemari berkas & dispenser */}
    <g transform="translate(-40 470)" stroke={OUT} strokeWidth={SW}><rect width={190} height={340} fill="#8d939c" />{[20, 130, 240].map((y) => <rect key={y} x={20} y={y} width={150} height={90} fill="#a9aeb6" />)}</g>
    <g transform="translate(1010 560)" stroke={OUT} strokeWidth={SW}><rect width={90} height={250} fill="#fbfbf7" /><rect x={14} y={-70} width={62} height={90} rx={30} fill="#9ad0ec" strokeWidth={4} /><rect x={30} y={90} width={14} height={14} fill="#e63946" strokeWidth={3} /><rect x={50} y={90} width={14} height={14} fill="#2f7fd8" strokeWidth={3} /></g>
    {/* tanaman */}
    <g transform="translate(1860 820)" stroke={OUT} strokeWidth={5}>{[-40, -15, 15, 40].map((a, i) => <path key={a} d={`M 0 -60 Q ${a} -120 ${a * 1.6} ${-150 - i * 8} Q ${a * 0.3} -110 0 -60`} fill={i % 2 ? "#3f9a45" : "#58b35a"} />)}<path d="M -44 -60 L 44 -60 L 34 20 L -34 20 Z" fill="#c8553d" /></g>
  </g>
);

/* --------------------------------- PASAR --------------------------------- */
const Crate: React.FC<{ x: number; y: number; w: number; fruit: string[]; seed: number }> = ({ x, y, w, fruit, seed }) => (
  <g stroke={OUT} strokeWidth={4}>
    <rect x={x} y={y} width={w} height={50} fill="#b9764b" />
    {Array.from({ length: Math.floor(w / 34) }).map((_, i) => <circle key={i} cx={x + 20 + i * 34} cy={y - 8 + (rnd(i, seed) - 0.5) * 8} r={18} fill={fruit[i % fruit.length]} />)}
  </g>
);
export const Pasar: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1200} fill="#d7e6ee" />
    {/* terpal kios berjajar */}
    {[[-60, "#2f7fd8"], [420, "#f3a03c"], [900, "#e85d75"], [1380, "#3c8d5a"]].map(([x, c], i) => (
      <g key={i} stroke={OUT} strokeWidth={SW}>
        <path d={`M ${x as number} 170 L ${(x as number) + 560} 170 L ${(x as number) + 600} 330 L ${(x as number) - 40} 330 Z`} fill={c as string} />
        {Array.from({ length: 7 }).map((_, k) => <path key={k} d={`M ${(x as number) - 40 + k * 91.4} 330 q 22 26 45 0`} fill={c as string} strokeWidth={4} />)}
        <rect x={(x as number) + 10} y={330} width={10} height={470} fill="#8a5a2b" /><rect x={(x as number) + 520} y={330} width={10} height={470} fill="#8a5a2b" />
      </g>
    ))}
    <g opacity={0.22} fill="#2a2035"><rect x={-400} y={330} width={2720} height={90} /></g>
    {/* lapak: sayur, buah, ayam di keranjang, timbangan */}
    <Crate x={20} y={830} w={300} fruit={["#e63946", "#f3a03c"]} seed={1} />
    <Crate x={360} y={830} w={260} fruit={["#58b35a", "#3f9a45"]} seed={2} />
    <Crate x={980} y={830} w={300} fruit={["#ffd23f", "#f3a03c", "#e85d75"]} seed={3} />
    <Crate x={1420} y={830} w={320} fruit={["#8f5bd1", "#58b35a"]} seed={4} />
    <g transform="translate(700 760)" stroke={OUT} strokeWidth={5}><rect x={-6} y={0} width={12} height={90} fill="#8d939c" /><path d="M -80 -20 L 80 -20" /><path d="M -80 -20 L -100 20 L -60 20 Z" fill="#c8cdd4" /><path d="M 80 -20 L 60 20 L 100 20 Z" fill="#c8cdd4" /></g>
    {/* tanah becek pasar */}
    <rect x={-400} y={880} width={2720} height={400} fill="#a78f72" stroke={OUT} strokeWidth={SW} />
    <g fill="#8a735a" opacity={0.6}>{[[260, 940, 120], [900, 1010, 160], [1500, 960, 140]].map(([x, y, w], i) => <ellipse key={i} cx={x} cy={y} rx={w} ry={16} />)}</g>
    {/* lampu bohlam gantung + ayunan */}
    {[300, 960, 1620].map((x, i) => <g key={x} transform={`rotate(${Math.sin(t * 1.2 + i) * 1.5} ${x} 330)`}><line x1={x} y1={330} x2={x} y2={400} stroke={OUT} strokeWidth={3} /><circle cx={x} cy={414} r={14} fill="#fffbe6" stroke={OUT} strokeWidth={3} /></g>)}
  </g>
);

/* --------------------------------- HALTE --------------------------------- */
export const Halte: React.FC<{ t: number }> = ({ t }) => {
  const carX = ((t * 120) % 3200) - 600;
  return (
    <g>
      <Cloud t={t} />
      {/* jalan raya */}
      <rect x={-400} y={640} width={2720} height={230} fill="#6b7280" stroke={OUT} strokeWidth={SW} />
      <path d="M -400 755 L 2320 755" stroke="#fff" strokeWidth={8} strokeDasharray="90 70" />
      {/* angkot lewat */}
      <g transform={`translate(${carX} 590)`} stroke={OUT} strokeWidth={SW}>
        <rect width={330} height={130} rx={24} fill="#f3a03c" /><rect x={18} y={20} width={110} height={50} fill="#9ad0ec" /><rect x={142} y={20} width={110} height={50} fill="#9ad0ec" /><rect x={0} y={84} width={330} height={16} fill="#2f7fd8" stroke="none" />
        <circle cx={70} cy={132} r={26} fill="#2a2035" /><circle cx={260} cy={132} r={26} fill="#2a2035" />
      </g>
      {/* trotoar */}
      <rect x={-400} y={870} width={2720} height={400} fill="#cfc7b6" stroke={OUT} strokeWidth={SW} />
      {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={-400 + i * 240} y1={870} x2={-520 + i * 240} y2={1100} stroke="#b3ab98" strokeWidth={3} />)}
      {/* atap halte + bangku */}
      <g stroke={OUT} strokeWidth={SW}>
        <rect x={540} y={420} width={860} height={34} fill="#2f7fd8" /><rect x={560} y={454} width={14} height={420} fill="#8d939c" /><rect x={1366} y={454} width={14} height={420} fill="#8d939c" />
        <rect x={574} y={460} width={792} height={340} fill="#a8dcf5" fillOpacity={0.35} strokeWidth={3} />
        <rect x={640} y={800} width={640} height={22} fill="#b9764b" /><rect x={660} y={822} width={16} height={70} fill="#8a5a2b" /><rect x={1244} y={822} width={16} height={70} fill="#8a5a2b" />
      </g>
      {/* tiang rambu bus (piktogram) */}
      <g transform="translate(300 900)" stroke={OUT} strokeWidth={5}><rect x={-6} y={-380} width={12} height={380} fill="#8d939c" /><rect x={-50} y={-470} width={100} height={100} rx={12} fill="#2f7fd8" /><rect x={-28} y={-448} width={56} height={40} rx={8} fill="#fff" strokeWidth={3} /><circle cx={-16} cy={-396} r={6} fill="#fff" strokeWidth={2} /><circle cx={16} cy={-396} r={6} fill="#fff" strokeWidth={2} /></g>
      {/* pohon pinggir jalan */}
      <g transform="translate(1760 640)" stroke={OUT} strokeWidth={5}><rect x={-16} y={0} width={32} height={260} fill="#8a5a2b" /><circle cx={-50} cy={-20} r={80} fill="#4cae4c" /><circle cx={50} cy={-30} r={84} fill="#58b35a" /><circle cx={0} cy={-100} r={86} fill="#62c462" /></g>
    </g>
  );
};
export const HalteBack: React.FC = () => (
  <g stroke={OUT} strokeWidth={5}>
    {[[-80, 330, 260, 300, "#e9c9a6"], [200, 380, 220, 260, "#cfd8e6"], [440, 300, 300, 340, "#f3e3b5"], [770, 360, 240, 280, "#d7ead9"], [1030, 310, 280, 330, "#e6c8d4"], [1330, 370, 260, 270, "#cfd8e6"], [1620, 320, 330, 320, "#f3d9a6"]].map(([x, y, w, h, c], i) => (
      <g key={i}><rect x={x as number} y={y as number} width={w as number} height={h as number} fill={c as string} />
        {Array.from({ length: 6 }).map((_, k) => <rect key={k} x={(x as number) + 24 + (k % 3) * 72} y={(y as number) + 30 + Math.floor(k / 3) * 90} width={44} height={56} fill="#9ad0ec" strokeWidth={3} />)}</g>
    ))}
  </g>
);

/* ---------------------------- LAPANGAN BASKET ----------------------------- */
const Hoop: React.FC<{ x: number; flip?: number }> = ({ x, flip = 1 }) => (
  <g transform={`translate(${x} 0) scale(${flip} 1)`} stroke={OUT} strokeWidth={SW}>
    <rect x={-10} y={330} width={20} height={540} fill="#8d939c" />
    <rect x={-90} y={190} width={180} height={130} fill="#fbfbf7" /><rect x={-34} y={250} width={68} height={50} fill="none" strokeWidth={5} stroke="#e63946" />
    <ellipse cx={0} cy={330} rx={44} ry={12} fill="none" stroke="#e8602c" strokeWidth={7} />
    <path d="M -42 336 L -26 400 L 26 400 L 42 336 M -22 340 L -14 398 M 0 342 L 0 400 M 22 340 L 14 398" fill="none" strokeWidth={3} stroke="#fbfbf7" />
  </g>
);
export const LapanganBasket: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Cloud t={t} />
    {/* tribun */}
    <g stroke={OUT} strokeWidth={SW}>
      {[0, 1, 2].map((i) => <rect key={i} x={-400} y={560 + i * 56} width={2720} height={56} fill={i % 2 ? "#b8bcc4" : "#c8cdd4"} />)}
      <rect x={-400} y={540} width={2720} height={20} fill="#3c8d5a" />
    </g>
    {/* lantai lapangan */}
    <rect x={-400} y={728} width={2720} height={400} fill="#d98b4a" stroke={OUT} strokeWidth={SW} />
    <g stroke="#fff" strokeWidth={8} fill="none" opacity={0.9}>
      <path d="M -400 780 L 2320 780" /><path d="M 960 780 L 960 1100" /><ellipse cx={960} cy={940} rx={150} ry={50} /><path d="M 70 790 L 70 1060 L 430 1060 L 430 790" /><path d="M 1850 790 L 1850 1060 L 1490 1060 L 1490 790" />
    </g>
    <Hoop x={250} /><Hoop x={1670} flip={-1} />
    {/* bola basket di pinggir */}
    <g transform="translate(1120 1010)" stroke={OUT} strokeWidth={4}><circle r={26} fill="#e8602c" /><path d="M -26 0 L 26 0 M 0 -26 L 0 26" /></g>
  </g>
);
export const LapanganBasketBack: React.FC = () => (
  <g stroke={OUT} strokeWidth={5}>
    <rect x={160} y={330} width={1600} height={230} fill="#f3e3b5" />{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => <rect key={i} x={200 + i * 130} y={370} width={80} height={90} fill="#9ad0ec" />)}
    <path d="M 130 330 L 960 240 L 1790 330 Z" fill="#c8553d" />
  </g>
);
