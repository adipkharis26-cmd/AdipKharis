import React from "react";
import meta from "./locations.json";
import { City, Ground, Sky, Warung } from "./Background";
import { Halte, HalteBack, LapanganBasket, LapanganBasketBack, Pasar, RuangGuru } from "./Locations3";
import { Kantin, KelasBelakang, KelasJendela, Kos, LapanganUpacara, LapanganUpacaraBack, MejaGuru, Perpustakaan, RuangBK, RuangTamu } from "./Locations2";

/* Locked location sets. Each set = parallax layers (d: 0 far … 1 character plane) + optional foreground. */
const OUT = "#1b1b1b";
const SW = 6;
export type LocId = keyof typeof meta.locations;
export interface SceneOpts { ijahNod?: number; flag?: number; flagInverted?: boolean; snag?: number; gate?: number; angkot?: number; board?: number; tower?: number; ijahOut?: boolean }
export interface Layer { d: number; el: (t: number, opts?: SceneOpts) => React.ReactNode }
export interface LocationDef { id: LocId; bg: string; layers: Layer[]; front?: Layer[] }

export const Tree: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={OUT} strokeWidth={5}>
    <rect x={-14} y={-10} width={28} height={140} fill="#8a5a2b" />
    <circle cx={-50} cy={-40} r={70} fill="#5cb85c" /><circle cx={50} cy={-50} r={74} fill="#4cae4c" /><circle cx={0} cy={-100} r={80} fill="#62c462" />
  </g>
);

/** Tiang bendera. flagY = posisi kain bendera (default di puncak); inverted = putih di atas (terbalik); cloth=false = kain belum dipasang. */
export const Flag: React.FC<{ x: number; y: number; t: number; h?: number; flagY?: number; inverted?: boolean; cloth?: boolean }> = ({ x, y, t, h = 520, flagY, inverted, cloth = true }) => {
  const w = (k: number) => Math.sin(t * 5 + k) * 8;
  const fy = flagY ?? y;
  const top = inverted ? "#fff" : "#e63946", bot = inverted ? "#e63946" : "#fff";
  return (
    <g>
      <rect x={x - 6} y={y} width={12} height={h} fill="#d9d9d9" stroke={OUT} strokeWidth={4} />
      <circle cx={x} cy={y - 6} r={10} fill="#f3c66b" stroke={OUT} strokeWidth={4} />
      {cloth && (
        <g>
          <path d={`M ${x + 6} ${fy + 10} Q ${x + 60} ${fy + 10 + w(0)} ${x + 120} ${fy + 10 + w(1)} L ${x + 120} ${fy + 50 + w(1)} Q ${x + 60} ${fy + 50 + w(0)} ${x + 6} ${fy + 50} Z`} fill={top} />
          <path d={`M ${x + 6} ${fy + 50} Q ${x + 60} ${fy + 50 + w(0)} ${x + 120} ${fy + 50 + w(1)} L ${x + 120} ${fy + 90 + w(1)} Q ${x + 60} ${fy + 90 + w(0)} ${x + 6} ${fy + 90} Z`} fill={bot} />
          <path d={`M ${x + 6} ${fy + 10} Q ${x + 60} ${fy + 10 + w(0)} ${x + 120} ${fy + 10 + w(1)} L ${x + 120} ${fy + 90 + w(1)} Q ${x + 60} ${fy + 90 + w(0)} ${x + 6} ${fy + 90} Z`} fill="none" stroke={OUT} strokeWidth={4} />
        </g>
      )}
    </g>
  );
};

export const SchoolBuilding: React.FC<{ x: number; y: number; w: number; floors?: number }> = ({ x, y, w, floors = 2 }) => {
  const fh = 170;
  return (
    <g stroke={OUT} strokeWidth={5}>
      <path d={`M ${x - 30} ${y} L ${x + w / 2} ${y - 110} L ${x + w + 30} ${y} Z`} fill="#c8553d" />
      {Array.from({ length: floors }).map((_, f) => (
        <g key={f}>
          <rect x={x} y={y + f * fh} width={w} height={fh} fill="#f3e3b5" />
          <rect x={x} y={y + f * fh + fh - 18} width={w} height={18} fill="#3c8d5a" />
          {Array.from({ length: Math.floor(w / 130) }).map((__, i) => (
            <g key={i}>
              <rect x={x + 30 + i * 130} y={y + f * fh + 30} width={80} height={100} fill="#9ad0ec" />
              <line x1={x + 70 + i * 130} y1={y + f * fh + 30} x2={x + 70 + i * 130} y2={y + f * fh + 130} strokeWidth={4} />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
};

/* ------------------------------ GERBANG ---------------------------------- */
const Gerbang: React.FC<{ t: number; gate?: number }> = ({ t, gate = 0 }) => (
  <g>
    {/* fence wall */}
    <rect x={-400} y={700} width={1160} height={180} fill="#e8dcc0" stroke={OUT} strokeWidth={SW} />
    <rect x={1160} y={700} width={1200} height={180} fill="#e8dcc0" stroke={OUT} strokeWidth={SW} />
    {[-400, 760].map((x0) => Array.from({ length: 10 }).map((_, i) => (
      <rect key={`${x0}-${i}`} x={x0 + 20 + i * 116} y={600} width={14} height={100} fill="#3c8d5a" stroke={OUT} strokeWidth={4} />
    )))}
    <rect x={-400} y={590} width={2800} height={16} fill="#3c8d5a" stroke={OUT} strokeWidth={4} />
    {/* sliding iron gate (half open) */}
    <g>
      {/* gerbang besi geser: gate 0 = terbuka (menumpuk di kiri), 1 = tertutup menutup celah di antara tiang */}
      {(() => { const gx = 560 + 240 * gate, gw = 220 + 120 * gate, n = Math.round(gw / 24); return (
        <g>
          <rect x={gx} y={560} width={gw} height={320} fill="none" stroke={OUT} strokeWidth={8} />
          {Array.from({ length: n }).map((_, i) => <rect key={i} x={gx + 6 + i * ((gw - 12) / n)} y={562} width={9} height={316} fill="#2f6b45" stroke={OUT} strokeWidth={3} />)}
          <rect x={gx} y={700} width={gw} height={12} fill="#2f6b45" stroke={OUT} strokeWidth={4} />
          {gate > 0.97 && <rect x={gx + gw / 2 - 16} y={690} width={32} height={26} rx={5} fill="#ffd23f" stroke={OUT} strokeWidth={4} />}
        </g>); })()}
    </g>
    {/* pillars + arch sign */}
    {[740, 1140].map((x) => (
      <g key={x}>
        <rect x={x} y={420} width={60} height={460} fill="#f6f1e4" stroke={OUT} strokeWidth={SW} />
        <rect x={x - 10} y={400} width={80} height={30} fill="#3c8d5a" stroke={OUT} strokeWidth={SW} />
        <rect x={x - 6} y={840} width={72} height={40} fill="#3c8d5a" stroke={OUT} strokeWidth={SW} />
      </g>
    ))}
    <rect x={700} y={290} width={540} height={120} rx={10} fill="#1f5c3a" stroke={OUT} strokeWidth={SW} />
    {/* school emblem (no readable text — editing rule) */}
    <g transform="translate(970 350)" stroke={OUT} strokeWidth={4}>
      <path d="M -40 -44 L 40 -44 L 40 6 Q 40 38 0 50 Q -40 38 -40 6 Z" fill="#ffd23f" />
      <path d="M -22 -6 L 0 -26 L 22 -6 L 0 14 Z" fill="#1f5c3a" />
      <path d="M -24 24 Q 0 10 24 24" fill="none" />
    </g>
    {[-200, -150, 150, 200].map((dx) => <rect key={dx} x={970 + dx - 18} y={336} width={36} height={10} rx={5} fill="#ffd23f" stroke={OUT} strokeWidth={3} />)}
    {/* security post */}
    <g transform="translate(1540 620)" stroke={OUT} strokeWidth={SW}>
      <rect x={0} y={0} width={200} height={260} fill="#f6f1e4" />
      <path d="M -20 0 L 100 -60 L 220 0 Z" fill="#c8553d" />
      <rect x={30} y={40} width={140} height={80} fill="#9ad0ec" />
      <rect x={20} y={-30} width={160} height={36} fill="#1f5c3a" strokeWidth={4} />
      <path transform="translate(100 -12)" d="M -12 -14 L 12 -14 L 12 0 Q 12 10 0 14 Q -12 10 -12 0 Z" fill="#ffd23f" strokeWidth={3} />
    </g>
    <Flag x={1830} y={190} t={t} h={690} />
  </g>
);
export const Paving: React.FC = () => (
  <g>
    <rect x={-1200} y={880} width={4400} height={800} fill="#c9c3b6" stroke={OUT} strokeWidth={SW} />
    {Array.from({ length: 40 }).map((_, i) => <line key={i} x1={-1200 + i * 110} y1={880} x2={-1300 + i * 110} y2={1680} stroke="#b0a998" strokeWidth={4} />)}
    {[940, 1020, 1120].map((y) => <line key={y} x1={-1200} x2={3200} y1={y} y2={y} stroke="#b0a998" strokeWidth={4} />)}
  </g>
);

/* ------------------------------ KELAS ------------------------------------ */
export const Desk: React.FC<{ x: number; y: number; s?: number; bag?: string }> = ({ x, y, s = 1, bag }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={OUT} strokeWidth={5}>
    {/* chair back */}
    <rect x={30} y={-150} width={110} height={70} rx={6} fill="#b07a45" />
    <rect x={40} y={-80} width={10} height={80} fill="#555" /><rect x={120} y={-80} width={10} height={80} fill="#555" />
    {bag && <path d="M 60 -150 Q 60 -190 100 -190 Q 140 -190 140 -150 L 140 -90 L 60 -90 Z" fill={bag} />}
    {/* desk */}
    <rect x={-80} y={-110} width={180} height={22} fill="#c98f55" />
    <rect x={-70} y={-88} width={160} height={50} fill="#b07a45" />
    <rect x={-70} y={-38} width={12} height={38} fill="#555" /><rect x={78} y={-38} width={12} height={38} fill="#555" />
  </g>
);
const Kelas: React.FC<{ t: number; board?: number }> = ({ t, board = 0 }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1170} fill="#f6e7c1" />
    <rect x={-400} y={620} width={2720} height={150} fill="#b9d7c9" stroke={OUT} strokeWidth={SW} />
    {Array.from({ length: 30 }).map((_, i) => <line key={i} x1={-400 + i * 100} y1={620} x2={-400 + i * 100} y2={770} stroke="#9cc3b2" strokeWidth={4} />)}
    {/* floor tiles */}
    <rect x={-400} y={770} width={2720} height={700} fill="#ece5d3" stroke={OUT} strokeWidth={SW} />
    {Array.from({ length: 30 }).map((_, i) => <line key={i} x1={-400 + i * 100} y1={770} x2={-700 + i * 130} y2={1470} stroke="#d6cdb6" strokeWidth={4} />)}
    {[840, 930, 1040].map((y) => <line key={y} x1={-400} x2={2320} y1={y} y2={y} stroke="#d6cdb6" strokeWidth={4} />)}
    {/* emblem & clock */}
    <g transform="translate(960 90)" stroke={OUT} strokeWidth={4}>
      <path d="M -40 -40 L 40 -40 L 40 10 Q 40 40 0 52 Q -40 40 -40 10 Z" fill="#f3c66b" />
      <path d="M -70 -10 Q -50 -50 -30 -20 M 70 -10 Q 50 -50 30 -20" fill="none" strokeWidth={8} stroke="#d8a93f" />
      <circle r={12} cy={0} fill="#e63946" />
    </g>
    <g transform="translate(1600 110)">
      <circle r={52} fill="#fff" stroke={OUT} strokeWidth={6} />
      <line x1={0} y1={0} x2={0} y2={-34} stroke={OUT} strokeWidth={6} strokeLinecap="round" transform={`rotate(${t * 6})`} />
      <line x1={0} y1={0} x2={24} y2={0} stroke={OUT} strokeWidth={6} strokeLinecap="round" />
    </g>
    {/* whiteboard */}
    <rect x={540} y={170} width={840} height={360} fill="#fbfdff" stroke="#8d939c" strokeWidth={14} />
    <rect x={540} y={170} width={840} height={360} fill="none" stroke={OUT} strokeWidth={SW} />
    {/* tulisan papan (trek "board": 0 = penuh, 1 = terhapus bersih; diusap dari kiri ke kanan dengan sisa noda) */}
    <g>
    {/* supply–demand graph doodle */}
    <g fill="none" strokeLinecap="round" strokeWidth={6}>
      <path d="M 1010 230 L 1010 470 L 1300 470" stroke="#2b2b2b" />
      <path d="M 1040 260 Q 1150 380 1280 450" stroke="#2f7fd8" />
      <path d="M 1040 450 Q 1150 360 1280 250" stroke="#e63946" />
      <path d="M 590 230 L 760 230" stroke="#2f7fd8" strokeWidth={10} />
    </g>
    {[290, 340, 390, 440].map((y, i) => (
      <path key={y} d={`M 590 ${y} q 30 -14 60 0 t 60 0 t 60 0 ${i % 2 ? "t 60 0" : ""}`} fill="none" stroke="#3a3a3a" strokeWidth={5} strokeLinecap="round" />
    ))}
    <circle cx={1150} cy={350} r={10} fill="#e63946" />
      {board > 0 && <g>
        <rect x={552} y={182} width={816 * Math.min(1, board)} height={336} fill="#fbfdff" />
        {board < 1 && <path d={`M ${552 + 816 * board} 182 q -26 84 0 168 q 26 84 0 168`} fill="none" stroke="#d7dde6" strokeWidth={22} strokeLinecap="round" />}
        <g opacity={0.22 * Math.min(1, board)} fill="#8d939c">{[[640, 300, 70], [820, 420, 110], [1080, 260, 90], [1240, 380, 80]].map(([x, y, w], i) => <ellipse key={i} cx={Math.min(x, 552 + 816 * board)} cy={y} rx={w} ry={16} />)}</g>
      </g>}
    </g>
    <rect x={600} y={530} width={720} height={16} fill="#8d939c" stroke={OUT} strokeWidth={4} />
    {/* bulletin board (mading) */}
    <g transform="translate(90 200)" stroke={OUT} strokeWidth={5}>
      <rect width={340} height={300} fill="#c98f55" />
      <rect x={20} y={20} width={140} height={120} fill="#fff" transform="rotate(-3 90 80)" />
      <rect x={180} y={30} width={130} height={100} fill="#ffe066" transform="rotate(4 245 80)" />
      <rect x={40} y={160} width={260} height={110} fill="#fff" />
      {/* duty roster grid (no text) */}
      {[185, 205, 225, 245].map((y) => <line key={y} x1={50} x2={290} y1={y} y2={y} stroke="#999" strokeWidth={3} />)}
      {[110, 170, 230].map((x) => <line key={x} x1={x} x2={x} y1={170} y2={262} stroke="#999" strokeWidth={3} />)}
    </g>
    {/* windows */}
    <g transform="translate(1480 200)" stroke={OUT} strokeWidth={5}>
      <rect width={380} height={340} fill="#a8dcf5" />
      <circle cx={280} cy={260} r={80} fill="#5cb85c" />
      <circle cx={120} cy={300} r={60} fill="#4cae4c" />
      <line x1={190} y1={0} x2={190} y2={340} strokeWidth={8} /><line x1={0} y1={170} x2={380} y2={170} strokeWidth={8} />
      <rect width={380} height={340} fill="none" strokeWidth={10} />
      <path d="M -10 -10 L 70 -10 Q 50 170 80 350 L -10 350 Z" fill="#e85d75" />
      <path d="M 390 -10 L 310 -10 Q 330 170 300 350 L 390 350 Z" fill="#e85d75" />
    </g>
    {/* ceiling fan */}
    <g transform="translate(330 30)">
      <rect x={-4} y={-60} width={8} height={60} fill="#555" />
      <ellipse rx={130} ry={14} fill="#eee" stroke={OUT} strokeWidth={4} transform={`scale(${Math.cos(t * 30)} 1)`} />
      <circle r={16} fill="#888" stroke={OUT} strokeWidth={4} />
    </g>
    {/* desks (mid-ground) */}
    {[[230, 860, "#2f7fd8"], [620, 860, ""], [1300, 860, "#e63946"], [1690, 860, ""]].map(([x, y, bag], i) => (
      <Desk key={i} x={x as number} y={y as number} s={0.95} bag={(bag as string) || undefined} />
    ))}
  </g>
);

/* ------------------------------ KORIDOR ---------------------------------- */
export const Lapangan: React.FC = () => (
  <g stroke={OUT} strokeWidth={5}>
    <rect x={-1200} y={520} width={4400} height={400} fill="#7cc47a" />
    <path d="M 300 560 L 1600 560 L 1800 760 L 100 760 Z" fill="#d98c5f" />
    <path d="M 950 560 L 950 760" stroke="#fff" strokeWidth={6} />
    <ellipse cx={950} cy={660} rx={80} ry={30} fill="none" stroke="#fff" strokeWidth={6} />
    <g transform="translate(330 420)"><rect x={-6} y={0} width={12} height={160} fill="#888" /><rect x={-50} y={-50} width={100} height={60} fill="#fff" /><rect x={-20} y={-10} width={40} height={6} fill="#e63946" /></g>
    <g transform="translate(1570 420)"><rect x={-6} y={0} width={12} height={160} fill="#888" /><rect x={-50} y={-50} width={100} height={60} fill="#fff" /><rect x={-20} y={-10} width={40} height={6} fill="#e63946" /></g>
    <Tree x={-60} y={430} s={0.9} /><Tree x={2000} y={430} s={0.9} />
  </g>
);
const Koridor: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {/* roof slab */}
    <rect x={-400} y={-400} width={2720} height={480} fill="#f6f1e4" stroke={OUT} strokeWidth={SW} />
    <rect x={-400} y={60} width={2720} height={30} fill="#3c8d5a" stroke={OUT} strokeWidth={SW} />
    {/* low wall with planters */}
    <rect x={-400} y={640} width={2720} height={150} fill="#f3e3b5" stroke={OUT} strokeWidth={SW} />
    <rect x={-400} y={630} width={2720} height={22} fill="#3c8d5a" stroke={OUT} strokeWidth={5} />
    {[120, 520, 1440, 1840].map((x, i) => (
      <g key={x} transform={`translate(${x} 630)`} stroke={OUT} strokeWidth={4}>
        <path d="M -40 0 L 40 0 L 30 -60 L -30 -60 Z" fill="#c8553d" transform="scale(1 -1)" />
        <g transform={`rotate(${Math.sin(t * 2 + i) * 3})`}>
          <path d="M 0 -60 Q -50 -110 -30 -150 Q 0 -100 0 -60 Q 10 -130 40 -150 Q 40 -100 0 -60" fill="#4cae4c" />
        </g>
      </g>
    ))}
    {/* pillars */}
    {[180, 960, 1740].map((x) => (
      <g key={x}>
        <rect x={x - 40} y={80} width={80} height={720} fill="#fbfbf7" stroke={OUT} strokeWidth={SW} />
        <rect x={x - 46} y={720} width={92} height={80} fill="#3c8d5a" stroke={OUT} strokeWidth={SW} />
      </g>
    ))}
    {/* class sign hanging */}
    <g transform="translate(560 90)">
      <line x1={-40} y1={0} x2={-40} y2={40} stroke={OUT} strokeWidth={4} /><line x1={40} y1={0} x2={40} y2={40} stroke={OUT} strokeWidth={4} />
      <rect x={-90} y={40} width={180} height={56} rx={8} fill="#1f5c3a" stroke={OUT} strokeWidth={5} />
      {[-50, -20, 10, 40].map((x, i) => <rect key={x} x={x - 8} y={56} width={18} height={26} rx={3} fill={i < 2 ? "#ffd23f" : "#fff"} />)}
    </g>
    {/* floor tiles (terracotta & cream) */}
    <rect x={-400} y={790} width={2720} height={700} fill="#efe1c6" stroke={OUT} strokeWidth={SW} />
    {Array.from({ length: 28 }).map((_, i) => <line key={i} x1={-400 + i * 100} y1={790} x2={-700 + i * 130} y2={1490} stroke="#d8c6a2" strokeWidth={4} />)}
    {[860, 950, 1070].map((y) => <line key={y} x1={-400} x2={2320} y1={y} y2={y} stroke="#d8c6a2" strokeWidth={4} />)}
  </g>
);

/* ------------------------------ KAMAR ------------------------------------ */
const Kamar: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1240} fill="#bcd9ea" />
    <rect x={-400} y={780} width={2720} height={40} fill="#f6f1e4" stroke={OUT} strokeWidth={5} />
    <rect x={-400} y={820} width={2720} height={700} fill="#c58b56" stroke={OUT} strokeWidth={SW} />
    {Array.from({ length: 14 }).map((_, i) => <line key={i} x1={-400} x2={2320} y1={850 + i * 50} y2={850 + i * 50} stroke="#a8713f" strokeWidth={4} />)}
    {/* window with sunset */}
    <g transform="translate(760 160)" stroke={OUT} strokeWidth={6}>
      <rect width={400} height={340} fill="#ffb26b" />
      <rect y={170} width={400} height={170} fill="#ff8c69" />
      <circle cx={200} cy={240} r={60} fill="#ffe066" />
      <path d="M 0 280 L 80 230 L 150 280 L 240 210 L 320 270 L 400 240 L 400 340 L 0 340 Z" fill="#6c4f8f" />
      <line x1={200} y1={0} x2={200} y2={340} strokeWidth={8} /><rect width={400} height={340} fill="none" strokeWidth={10} />
      <path d={`M -30 -20 L 90 -20 Q ${60 + Math.sin(t) * 6} 170 100 360 L -30 360 Z`} fill="#2f7fd8" />
      <path d={`M 430 -20 L 310 -20 Q ${340 + Math.sin(t + 1) * 6} 170 300 360 L 430 360 Z`} fill="#2f7fd8" />
    </g>
    {/* posters */}
    <g stroke={OUT} strokeWidth={5}>
      <g transform="translate(140 140) rotate(-4)">
        <rect width={240} height={320} fill="#1b1b1b" />
        <path d="M 130 30 L 70 170 L 120 170 L 90 290 L 180 130 L 130 130 L 160 30 Z" fill="#ffd23f" />
      </g>
      <g transform="translate(430 190) rotate(3)">
        <rect width={200} height={260} fill="#e63946" />
        <circle cx={100} cy={110} r={60} fill="#fff" />
        <path d="M 100 50 L 120 100 L 100 170 L 80 100 Z" fill="#1b1b1b" />
        <path d="M 50 230 L 150 230" stroke="#fff" strokeWidth={10} strokeLinecap="round" />
      </g>
    </g>
    {/* bed */}
    <g transform="translate(1300 600)" stroke={OUT} strokeWidth={SW}>
      <rect x={0} y={-160} width={30} height={380} fill="#8a5a2b" />
      <rect x={0} y={80} width={640} height={140} fill="#8a5a2b" />
      <rect x={20} y={40} width={620} height={70} rx={18} fill="#fbfbf7" />
      <ellipse cx={110} cy={30} rx={90} ry={40} fill="#fff" />
      <path d="M 200 30 Q 300 -20 380 40 Q 470 0 640 40 L 640 120 L 180 120 Z" fill="#e63946" />
      <path d="M 260 60 Q 320 40 380 70" fill="none" stroke="#b02a35" strokeWidth={5} />
    </g>
    {/* study desk with laptop, lamp and THE wallet (running gag) */}
    <g transform="translate(-60 600)" stroke={OUT} strokeWidth={SW}>
      <rect x={0} y={0} width={560} height={30} fill="#c98f55" />
      <rect x={20} y={30} width={24} height={220} fill="#8a5a2b" /><rect x={516} y={30} width={24} height={220} fill="#8a5a2b" />
      <rect x={340} y={30} width={180} height={150} fill="#b07a45" />
      <g transform="translate(120 0)"><path d="M 0 0 L 20 -110 L 170 -110 L 150 0 Z" fill="#555" /><path d="M 30 -10 L 45 -96 L 158 -96 L 140 -10 Z" fill="#8fd3ff" /></g>
      <g transform="translate(460 0)"><rect x={-6} y={-120} width={12} height={120} fill="#777" /><path d="M -50 -120 L 30 -170 L 40 -130 Z" fill="#ffd23f" /></g>
      <g transform="translate(330 -26)"><rect width={80} height={26} rx={5} fill="#7a4520" /><line x1={8} y1={13} x2={72} y2={13} stroke="#a8642f" strokeWidth={3} /></g>
      {[0, 1, 2].map((i) => <rect key={i} x={30} y={-24 - i * 22} width={80 - i * 6} height={22} fill={["#2f7fd8", "#e63946", "#3bceac"][i]} />)}
    </g>
  </g>
);

/* ------------------------------ registry --------------------------------- */
export const LOCATIONS: Record<LocId, LocationDef> = {
  warung: {
    id: "warung", bg: "#8fd6ff",
    layers: [{ d: 0.25, el: (t) => <Sky t={t} /> }, { d: 0.6, el: () => <City /> }, { d: 1, el: () => <Ground /> }, { d: 1, el: (t, o) => <Warung t={t} ijahNod={o?.ijahNod ?? 0} ijahOut={o?.ijahOut} /> }],
  },
  gerbang: {
    id: "gerbang", bg: "#8fd6ff",
    layers: [
      { d: 0.25, el: (t) => <Sky t={t} /> },
      { d: 0.55, el: () => <g><Tree x={120} y={420} /><Tree x={1820} y={430} /><SchoolBuilding x={260} y={280} w={1400} /></g> },
      { d: 1, el: () => <Paving /> },
      { d: 1, el: (t, o) => <Gerbang t={t} gate={o?.gate} /> },
    ],
  },
  kelas: { id: "kelas", bg: "#f6e7c1", layers: [{ d: 1, el: (t, o) => <Kelas t={t} board={o?.board} /> }] },
  koridor: {
    id: "koridor", bg: "#8fd6ff",
    layers: [{ d: 0.25, el: (t) => <Sky t={t} /> }, { d: 0.5, el: () => <Lapangan /> }, { d: 1, el: (t) => <Koridor t={t} /> }],
  },
  kamar: { id: "kamar", bg: "#bcd9ea", layers: [{ d: 1, el: (t) => <Kamar t={t} /> }] },
  kelasBelakang: { id: "kelasBelakang", bg: "#f6e7c1", layers: [{ d: 1, el: (t) => <KelasBelakang t={t} /> }] },
  kelasJendela: { id: "kelasJendela", bg: "#f6e7c1", layers: [{ d: 1, el: (t) => <KelasJendela t={t} /> }] },
  mejaGuru: { id: "mejaGuru", bg: "#f6e7c1", layers: [{ d: 1, el: (t) => <MejaGuru t={t} /> }] },
  kantin: { id: "kantin", bg: "#f3e3b5", layers: [{ d: 1, el: (t) => <Kantin t={t} /> }] },
  ruangBK: { id: "ruangBK", bg: "#d7ead9", layers: [{ d: 1, el: (t) => <RuangBK t={t} /> }] },
  perpustakaan: { id: "perpustakaan", bg: "#efe2c8", layers: [{ d: 1, el: (t, o) => <Perpustakaan t={t} tower={o?.tower} /> }] },
  ruangTamu: { id: "ruangTamu", bg: "#f7dcc4", layers: [{ d: 1, el: (t) => <RuangTamu t={t} /> }] },
  ruangGuru: { id: "ruangGuru", bg: "#e6efe0", layers: [{ d: 1, el: (t) => <RuangGuru t={t} /> }] },
  pasar: { id: "pasar", bg: "#d7e6ee", layers: [{ d: 1, el: (t) => <Pasar t={t} /> }] },
  halte: { id: "halte", bg: "#8fd6ff", layers: [{ d: 0.25, el: (t) => <Sky t={t} /> }, { d: 0.5, el: () => <HalteBack /> }, { d: 1, el: (t, o) => <Halte t={t} angkot={o?.angkot} /> }] },
  lapanganBasket: { id: "lapanganBasket", bg: "#8fd6ff", layers: [{ d: 0.25, el: (t) => <Sky t={t} /> }, { d: 0.55, el: () => <LapanganBasketBack /> }, { d: 1, el: (t) => <LapanganBasket t={t} /> }] },
  lapanganUpacara: {
    id: "lapanganUpacara", bg: "#8fd6ff",
    layers: [{ d: 0.25, el: (t) => <Sky t={t} /> }, { d: 0.55, el: () => <LapanganUpacaraBack /> }, { d: 1, el: (t, o) => <LapanganUpacara t={t} flag={o?.flag} inverted={o?.flagInverted} snag={o?.snag} /> }],
  },
  kos: { id: "kos", bg: "#e9edf2", layers: [{ d: 1, el: (t) => <Kos t={t} /> }] },
};
export const LOCATION_META = meta;
