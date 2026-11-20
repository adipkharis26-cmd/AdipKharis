import React from "react";

/* Properti (kanon v3.2.0). Semua benda digambar SEJAJAR DUNIA (bukan mengikuti sudut lengan) di titik tangan (0,0).
 * Gambar saja — tanpa teks. Benda yang dipegang tangan + tas punggung + benda "sebab-akibat" cerita. */
const OUT = "#1b1b1b";

export const ITEMS = ["paper", "book", "kresek", "gorengan", "cup", "mug", "tray", "ball", "wallet", "bagTote", "whistle", "clipboard", "broom", "bowl", "tumbler", "pen", "helmet", "umbrella", "folder", "alarm", "ledger", "bookStack",
  "lotteryBox", "lotScroll", "lotScrollRed", "lotSlip", "libBook", "phonePhoto", "rubberBands",
  "boardEraser", "phoneGallery", "coins", "gorenganTiga"] as const;
export type ItemId = (typeof ITEMS)[number];

const sw = (w = 5) => ({ stroke: OUT, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });

/** Kertas ulangan: lembar putih, garis tulisan, tanda merah (lingkaran + centang), tanpa angka/teks. */
const Paper: React.FC = () => (
  <g transform="rotate(-7) translate(0 -34)">
    <rect x={-27} y={-38} width={54} height={74} fill="#fffdf5" {...sw(4.5)} />
    {[-24, -14, -4, 6, 16].map((y) => <line key={y} x1={-18} x2={y === 16 ? 2 : 18} y1={y} y2={y} stroke="#7a8696" strokeWidth={3} strokeLinecap="round" />)}
    <path d="M 6 -34 q 14 -2 16 10 q -2 12 -16 10 q -14 -4 -10 -16" fill="none" stroke="#e63946" strokeWidth={4} strokeLinecap="round" />
    <path d="M -20 24 l 6 6 l 12 -12" fill="none" stroke="#e63946" strokeWidth={4} strokeLinecap="round" />
  </g>
);
const Book: React.FC = () => (
  <g transform="rotate(-6) translate(0 -36)">
    <rect x={-32} y={-42} width={64} height={82} rx={4} fill="#2f7fd8" {...sw(5)} />
    <rect x={-32} y={-42} width={12} height={82} fill="#1f5db0" {...sw(4)} />
    <rect x={-10} y={-30} width={34} height={24} rx={3} fill="#ffd23f" {...sw(3.5)} />
    <circle cx={7} cy={-18} r={6} fill="#e63946" stroke="none" />
    <path d="M -10 14 l 34 0 M -10 24 l 24 0" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
  </g>
);
/** Kantong plastik belanja, menggantung dari tangan. */
const Kresek: React.FC = () => (
  <g>
    <path d="M -8 0 Q -24 22 -30 40 M 8 0 Q 24 22 30 40" fill="none" {...sw(4)} />
    <path d="M -44 40 Q -52 100 -32 124 Q 0 138 32 124 Q 52 100 44 40 Q 0 28 -44 40 Z" fill="#e85d75" fillOpacity={0.92} {...sw(5)} />
    <circle cx={-12} cy={92} r={16} fill="#58b35a" {...sw(3.5)} /><circle cx={14} cy={100} r={14} fill="#f3a03c" {...sw(3.5)} />
    <path d="M -18 58 q 6 -12 14 -2" fill="none" stroke="#fff" strokeWidth={3} opacity={0.7} />
  </g>
);
const Gorengan: React.FC = () => (
  <g>
    <path d="M -6 0 L -26 30 M 6 0 L 26 30" fill="none" {...sw(4)} />
    <path d="M -36 28 L -40 108 L 40 108 L 36 28 Z" fill="#d9b382" {...sw(5)} />
    <path d="M -36 28 l 12 -12 l 12 12 l 12 -12 l 12 12 l 12 -12 l 12 12" fill="#d9b382" {...sw(4)} />
    <ellipse cx={-14} cy={22} rx={16} ry={9} fill="#f3b84a" {...sw(3.5)} /><ellipse cx={12} cy={20} rx={15} ry={9} fill="#e8a23a" {...sw(3.5)} />
    <circle cx={0} cy={72} r={14} fill="#f3d98a" stroke="none" opacity={0.7} />
  </g>
);
const Cup: React.FC = () => (
  <g transform="translate(0 -30)">
    <path d="M -20 -34 L -16 34 L 16 34 L 20 -34 Z" fill="#e8f6ff" fillOpacity={0.85} {...sw(4.5)} />
    <path d="M -18 -8 L -15 32 L 15 32 L 18 -8 Z" fill="#c8761a" fillOpacity={0.92} stroke="none" />
    <rect x={-8} y={0} width={10} height={10} fill="#fff" opacity={0.7} stroke="none" /><rect x={2} y={14} width={9} height={9} fill="#fff" opacity={0.6} stroke="none" />
    <path d="M 8 -34 L 18 -64" {...sw(5)} stroke="#e63946" />
  </g>
);
const Mug: React.FC = () => (
  <g transform="translate(0 -26)">
    <path d="M -20 -26 L -18 26 L 18 26 L 20 -26 Z" fill="#fbfbf7" {...sw(4.5)} />
    <path d="M 20 -10 q 18 2 16 14 q -2 10 -18 8" fill="none" {...sw(4.5)} />
    <path d="M -10 -44 q 8 -10 0 -20 M 6 -44 q 8 -10 0 -20" fill="none" stroke="#fff" strokeWidth={4} opacity={0.8} strokeLinecap="round" />
  </g>
);
/** Baki upacara: nampan datar dengan bendera terlipat merah-putih. */
const Tray: React.FC = () => (
  <g transform="translate(0 -14)">
    <path d="M -86 0 L 86 0 L 76 14 L -76 14 Z" fill="#c8cdd4" {...sw(5)} />
    <rect x={-46} y={-34} width={92} height={34} rx={4} fill="#fff" {...sw(4.5)} />
    <rect x={-46} y={-34} width={92} height={17} fill="#e63946" stroke={OUT} strokeWidth={4.5} />
    <path d="M -46 -17 l 92 0" {...sw(3)} />
  </g>
);
const Ball: React.FC = () => (
  <g transform="translate(0 -26)">
    <circle r={32} fill="#e8602c" {...sw(5)} />
    <path d="M -32 0 L 32 0 M 0 -32 L 0 32 M -22 -22 Q -8 0 -22 22 M 22 -22 Q 8 0 22 22" fill="none" stroke={OUT} strokeWidth={3.5} />
  </g>
);
const Wallet: React.FC = () => (
  <g transform="translate(0 -20)"><rect x={-26} y={-18} width={52} height={38} rx={7} fill="#8a4b26" {...sw(4.5)} /><path d="M -26 -4 L 26 -4" {...sw(3)} /><circle cx={14} cy={8} r={4} fill="#ffd23f" stroke="none" /></g>
);
const BagTote: React.FC = () => (
  <g>
    <path d="M -22 0 Q -22 26 -14 36 M 22 0 Q 22 26 14 36" fill="none" {...sw(4.5)} />
    <rect x={-42} y={36} width={84} height={84} rx={8} fill="#8f5bd1" {...sw(5)} />
    <circle cx={0} cy={78} r={14} fill="#ffd23f" {...sw(3.5)} />
  </g>
);
const Whistle: React.FC = () => (
  <g transform="translate(0 -4)"><path d="M -6 0 Q -40 6 -46 -26" fill="none" stroke="#e63946" strokeWidth={4} /><rect x={-16} y={-14} width={40} height={22} rx={10} fill="#c8cdd4" {...sw(4)} /><circle cx={6} cy={-3} r={5} fill="#555" stroke="none" /></g>
);
const Clipboard: React.FC = () => (
  <g transform="rotate(-6) translate(0 -36)"><rect x={-30} y={-44} width={60} height={82} rx={5} fill="#b9764b" {...sw(4.5)} /><rect x={-22} y={-34} width={44} height={64} fill="#fffdf5" stroke={OUT} strokeWidth={3} />
    {[-22, -12, -2, 8, 18].map((y) => <line key={y} x1={-14} x2={14} y1={y} y2={y} stroke="#7a8696" strokeWidth={3} />)}<rect x={-12} y={-50} width={24} height={14} rx={4} fill="#8d939c" {...sw(3.5)} /></g>
);
/** Sapu lidi: gagang vertikal sampai lantai, ujung lidi di bawah. */
const Broom: React.FC = () => (
  <g><rect x={-5} y={-170} width={10} height={470} fill="#8a5a2b" {...sw(4)} />
    <path d="M -34 300 L 34 300 L 52 372 L -52 372 Z" fill="#d9b382" {...sw(4.5)} />{[-30, -14, 2, 18, 34].map((x) => <line key={x} x1={x * 0.6} y1={304} x2={x * 1.3} y2={370} stroke={OUT} strokeWidth={2.5} />)}</g>
);
const Bowl: React.FC = () => (
  <g transform="translate(0 -22)"><path d="M -34 -8 Q -30 28 0 30 Q 30 28 34 -8 Z" fill="#fbfbf7" {...sw(4.5)} /><ellipse cx={0} cy={-8} rx={34} ry={9} fill="#e8a23a" {...sw(4)} />
    <circle cx={-10} cy={-10} r={7} fill="#f3d98a" stroke="none" /><circle cx={10} cy={-8} r={6} fill="#c8761a" stroke="none" /><path d="M -12 -26 q 6 -10 0 -18 M 8 -26 q 6 -10 0 -18" fill="none" stroke="#fff" strokeWidth={3.5} opacity={0.8} /></g>
);
const Tumbler: React.FC = () => (
  <g transform="translate(0 -34)"><rect x={-17} y={-48} width={34} height={86} rx={9} fill="#2aa6a0" {...sw(4.5)} /><rect x={-13} y={-62} width={26} height={16} rx={5} fill="#fbfbf7" {...sw(4)} /><rect x={-6} y={-10} width={12} height={26} rx={4} fill="#fff" opacity={0.5} stroke="none" /></g>
);
const Pen: React.FC = () => (
  <g transform="rotate(35)"><rect x={-3} y={-30} width={7} height={44} rx={3} fill="#2f7fd8" {...sw(3)} /><path d="M -3 14 L 0.5 24 L 4 14 Z" fill="#222" stroke="none" /></g>
);
const Helmet: React.FC = () => (
  <g transform="translate(0 -30)"><path d="M -42 8 Q -46 -40 0 -44 Q 46 -40 42 8 Z" fill="#e63946" {...sw(5)} /><path d="M -30 -6 L 38 -6 L 42 8 L -42 8 Z" fill="#2a2035" {...sw(4)} /></g>
);
const Umbrella: React.FC = () => (
  <g><rect x={-3} y={-60} width={6} height={150} fill="#555" {...sw(3.5)} /><path d="M -110 -60 Q -100 -150 0 -158 Q 100 -150 110 -60 Q 55 -80 0 -60 Q -55 -80 -110 -60 Z" fill="#2f7fd8" {...sw(5)} /></g>
);
/* ---- Eps. 4 "PR Halaman 45" ---- */
/** Map berkas OSIS: map plastik hijau bening, kertas di dalam, kancing tekan. */
const Folder: React.FC = () => (
  <g transform="rotate(-8) translate(0 -34)">
    <rect x={-30} y={-40} width={60} height={78} rx={4} fill="#fffdf5" {...sw(3.5)} />
    <rect x={-34} y={-34} width={68} height={76} rx={5} fill="#3c8d5a" fillOpacity={0.78} {...sw(4.5)} />
    <path d="M -34 -16 L 34 -16" {...sw(3)} /><circle cx={0} cy={-24} r={5} fill="#fbfbf7" {...sw(3)} />
    {[2, 14, 26].map((y) => <line key={y} x1={-20} x2={18} y1={y} y2={y} stroke="#fff" strokeWidth={3} opacity={0.65} strokeLinecap="round" />)}
  </g>
);
/** Jam weker dua lonceng (merah), jarum menunjuk jam lima, tanpa angka. */
const Alarm: React.FC = () => (
  <g transform="translate(0 -34)">
    <circle cx={-20} cy={-28} r={11} fill="#ffd23f" {...sw(4)} /><circle cx={20} cy={-28} r={11} fill="#ffd23f" {...sw(4)} />
    <path d="M -18 26 L -26 40 M 18 26 L 26 40" {...sw(5)} />
    <circle r={32} fill="#e63946" {...sw(5)} /><circle r={23} fill="#fffdf5" {...sw(3.5)} />
    <path d="M 0 0 L 0 -16 M 0 0 L 9 14" {...sw(4)} /><circle r={3.5} fill={OUT} stroke="none" />
  </g>
);
/** Buku utang warung: buku tulis bersampul cokelat kusam, diikat karet, ujung kertas menyembul. */
const Ledger: React.FC = () => (
  <g transform="rotate(5) translate(0 -34)">
    <rect x={-30} y={-40} width={60} height={78} rx={3} fill="#b07a45" {...sw(5)} />
    <path d="M -28 -34 l 56 0 M -28 32 l 56 0" stroke="#fffdf5" strokeWidth={4} />
    <rect x={-30} y={-6} width={60} height={8} fill="#e85d75" {...sw(3)} />
    <rect x={-14} y={-28} width={28} height={14} rx={2} fill="#fffdf5" {...sw(3)} />
  </g>
);
/** Tumpukan PR 46 halaman: buku paket + LKS + kertas jawaban bertumpuk tinggi, dibawa dua tangan. */
const BookStack: React.FC = () => (
  <g transform="translate(0 -20)">
    {[["#2f7fd8", 0, 0], ["#ffd23f", -4, -22], ["#e63946", 3, -42], ["#3c8d5a", -2, -62], ["#8f5bd1", 4, -82]].map(([c, dx, y], i) => (
      <g key={i} transform={`translate(${dx} ${y}) rotate(${i % 2 ? 3 : -3})`}>
        <rect x={-46} y={-20} width={92} height={20} rx={3} fill={c as string} {...sw(4.5)} />
        <path d="M -40 -6 L 40 -6" stroke="#fffdf5" strokeWidth={3} opacity={0.8} />
      </g>))}
    <g transform="translate(6 -112) rotate(-6)"><rect x={-36} y={-12} width={72} height={14} fill="#fffdf5" {...sw(3.5)} /><path d="M -28 -5 l 40 0" stroke="#7a8696" strokeWidth={3} /></g>
  </g>
);
/* ---- Eps. 5 "Satu Kelompok" ---- */
/** Kotak undian buatan Sasa: kardus dibungkus kertas kado pink berbintang, lubang di tutup, gulungan menyembul, pita kuning. */
const LotteryBox: React.FC = () => (
  <g transform="translate(0 -6)">
    <rect x={-58} y={-10} width={116} height={92} rx={6} fill="#ff8fb1" {...sw(5)} />
    <path d="M -58 -10 L -46 -30 L 70 -30 L 58 -10 Z" fill="#ffb3c9" {...sw(4.5)} />
    <path d="M 58 -10 L 70 -30 L 70 64 L 58 82 Z" fill="#e8628a" {...sw(4.5)} />
    {[[-36, 14], [8, 34], [-20, 60], [36, 8], [30, 62]].map(([x, y], i) => <path key={i} d={`M ${x} ${y - 7} l 2.5 5 l 5.5 1 l -4 4 l 1 5.5 l -5 -2.7 l -5 2.7 l 1 -5.5 l -4 -4 l 5.5 -1 Z`} fill="#ffd23f" stroke="none" />)}
    <rect x={-6} y={-10} width={12} height={92} fill="#ffd23f" stroke={OUT} strokeWidth={3} />
    <ellipse cx={6} cy={-20} rx={24} ry={6} fill="#3a2a2a" {...sw(3)} />
    <g {...sw(3)}><rect x={-6} y={-40} width={9} height={22} rx={4} fill="#fffdf5" transform="rotate(-14)" /><rect x={12} y={-42} width={9} height={22} rx={4} fill="#fffdf5" transform="rotate(10)" /></g>
    <path d="M -6 -12 q -16 -16 -24 -4 q 8 10 24 4 q 16 -16 24 -4 q -8 10 -24 4" fill="#ffd23f" {...sw(3)} />
  </g>
);
/** Gulungan kertas undian (diikat karet). Karet hitam = biasa; karet merah = gulungan "spesial" Sasa. */
const Scroll: React.FC<{ band: string }> = ({ band }) => (
  <g transform="translate(0 -18) rotate(-28)">
    <rect x={-22} y={-12} width={84} height={24} rx={12} fill="#fffdf5" {...sw(4.5)} />
    <ellipse cx={62} cy={0} rx={6} ry={12} fill="#f1ead8" stroke={OUT} strokeWidth={3} />
    <rect x={34} y={-15} width={13} height={30} rx={3} fill={band} stroke={OUT} strokeWidth={3} />
  </g>
);
const LotScroll: React.FC = () => <Scroll band="#2b2b2b" />;
const LotScrollRed: React.FC = () => <Scroll band="#e63946" />;
/** Kertas undian yang sudah dibuka: lembar kecil melengkung, coretan nama (tanpa huruf terbaca). */
const LotSlip: React.FC = () => (
  <g transform="translate(0 -26) rotate(-6)">
    <path d="M -34 -16 Q -30 -24 -22 -18 L 30 -18 Q 38 -18 34 -8 L 34 18 L -34 18 Z" fill="#fffdf5" {...sw(4)} />
    <path d="M -22 2 q 6 -10 12 0 t 12 0 t 12 0 t 10 -2" fill="none" stroke="#2f7fd8" strokeWidth={4} strokeLinecap="round" />
    <path d="M 22 12 l 6 -4" stroke="#e63946" strokeWidth={4} strokeLinecap="round" />
  </g>
);
/** Buku perpustakaan: sampul keras hijau, pita emas, label punggung putih bergaris (tanpa teks). */
const LibBook: React.FC = () => (
  <g transform="rotate(-4) translate(0 -38)">
    <rect x={-30} y={-46} width={60} height={88} rx={3} fill="#2e8b57" {...sw(5)} />
    <rect x={-30} y={-46} width={11} height={88} fill="#1f6b42" {...sw(4)} />
    <path d="M -19 -30 L 30 -30 M -19 26 L 30 26" stroke="#ffd23f" strokeWidth={4} />
    <rect x={-6} y={-16} width={28} height={30} rx={3} fill="#fffdf5" {...sw(3)} />
    <path d="M -1 -6 l 18 0 M -1 4 l 12 0" stroke="#7a8696" strokeWidth={3} strokeLinecap="round" />
  </g>
);
/** HP Sasa yang menampilkan foto viral: dua tangan di satu buku + hati (piktogram, tanpa teks). */
const PhonePhoto: React.FC = () => (
  <g transform="translate(0 -40)">
    <rect x={-26} y={-46} width={52} height={92} rx={8} fill="#2d2d3a" {...sw(5)} />
    <rect x={-20} y={-38} width={40} height={72} rx={3} fill="#cfe9ff" />
    <rect x={-6} y={-26} width={12} height={22} fill="#2e8b57" stroke={OUT} strokeWidth={2} />
    <path d="M -18 -4 q 8 -10 14 -8 M 18 -2 q -8 -10 -14 -10" fill="none" stroke="#e0ab7e" strokeWidth={6} strokeLinecap="round" />
    <path d="M 0 22 l -9 -9 a 5 5 0 0 1 9 -6 a 5 5 0 0 1 9 6 Z" fill="#e63946" />
    <circle cx={16} cy={-32} r={3} fill="#e63946" />
  </g>
);
/** Sebungkus karet gelang merah (dijual di warung Bu Ijah): plastik bening berisi lingkaran-lingkaran merah. */
const RubberBands: React.FC = () => (
  <g transform="translate(0 -30)">
    <path d="M -30 -26 Q -34 22 -24 30 L 24 30 Q 34 22 30 -26 Z" fill="#eaf6ff" fillOpacity={0.75} {...sw(4)} />
    <path d="M -30 -26 L 30 -26 L 26 -36 L -26 -36 Z" fill="#e63946" {...sw(3.5)} />
    {[[-14, -10], [8, -6], [-4, 8], [14, 14], [-16, 16], [2, 22]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={9} ry={6} fill="none" stroke="#e63946" strokeWidth={3.5} />)}
  </g>
);
/** Penghapus papan tulis (Shorts "Papan Tulis"): gagang plastik hitam + alas busa/flanel abu-abu yang bernoda tinta spidol. */
const BoardEraser: React.FC = () => (
  <g transform="translate(0 -6)">
    <rect x={-44} y={-4} width={88} height={22} rx={4} fill="#d9d9d9" {...sw(4.5)} />
    <path d="M -36 8 q 12 -4 22 2 M 4 10 q 14 -6 26 0" fill="none" stroke="#5a6b86" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
    <rect x={-40} y={-24} width={80} height={22} rx={6} fill="#2b2b2b" {...sw(4.5)} />
    <rect x={-30} y={-20} width={60} height={5} rx={2} fill="#4a4a4a" />
  </g>
);
/** HP berisi galeri penuh foto papan tulis (Shorts "Papan Tulis"): grid thumbnail papan putih bergaris, tanpa teks. */
const PhoneGallery: React.FC = () => (
  <g transform="translate(0 -40)">
    <rect x={-28} y={-48} width={56} height={96} rx={8} fill="#2d2d3a" {...sw(5)} />
    <rect x={-22} y={-40} width={44} height={76} rx={3} fill="#1f2430" />
    {[0, 1, 2, 3, 4].map((r) => [0, 1, 2].map((c) => (
      <g key={`${r}-${c}`} transform={`translate(${-20 + c * 14.5} ${-37 + r * 14.5})`}>
        <rect width={12} height={12} fill="#f4f7fb" stroke="#8d939c" strokeWidth={1.5} />
        <path d={`M 2 ${4 + ((r + c) % 2)} l 7 0 M 2 ${8 - ((r + c) % 2)} l 5 0`} stroke={(r + c) % 3 === 0 ? "#2f7fd8" : "#3a3a3a"} strokeWidth={1.4} />
      </g>
    )))}
  </g>
);
/** Uang pas (Shorts "Bayar Gorengan"): tumpukan koin perak + selembar uang kertas terlipat, tanpa angka/teks. */
const Coins: React.FC = () => (
  <g transform="translate(0 -18)">
    <rect x={-30} y={-22} width={46} height={24} rx={3} fill="#a8d5a2" {...sw(4)} transform="rotate(-12)" />
    <circle cx={-8} cy={-10} r={6} fill="none" stroke="#5f9a58" strokeWidth={2.5} transform="rotate(-12)" />
    {[0, 1, 2].map((i) => <ellipse key={i} cx={14} cy={10 - i * 7} rx={16} ry={6} fill={i === 2 ? "#e3e6ea" : "#c4c9d0"} {...sw(3.5)} />)}
  </g>
);
/** Tiga gorengan di tangan (Shorts "Bayar Gorengan"): bakwan, tempe goreng, pisang goreng disusun kipas. */
const GorenganTiga: React.FC = () => (
  <g transform="translate(0 -26)">
    <path d="M -34 -6 q -6 -26 14 -34 q 22 -6 26 16 q 2 20 -18 26 q -16 4 -22 -8 Z" fill="#d99a3c" {...sw(4)} transform="rotate(-24)" />
    <path d="M -22 -24 q 4 -8 12 -4 M -16 -14 q 6 -6 12 0" fill="none" stroke="#a66a1f" strokeWidth={3} strokeLinecap="round" transform="rotate(-24)" />
    <rect x={-12} y={-46} width={26} height={46} rx={6} fill="#e8b65a" {...sw(4)} />
    {[[-4, -36], [6, -28], [-2, -18], [7, -10]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.6} fill="#c08a2e" />)}
    <path d="M 16 -38 q 26 -8 30 16 q 2 16 -10 22 q -14 2 -20 -14 Z" fill="#f0c25a" {...sw(4)} transform="rotate(22)" />
  </g>
);
const MAP: Record<ItemId, React.FC> = { paper: Paper, book: Book, kresek: Kresek, gorengan: Gorengan, cup: Cup, mug: Mug, tray: Tray, ball: Ball, wallet: Wallet, bagTote: BagTote, whistle: Whistle, clipboard: Clipboard, broom: Broom, bowl: Bowl, tumbler: Tumbler, pen: Pen, helmet: Helmet, umbrella: Umbrella, folder: Folder, alarm: Alarm, ledger: Ledger, bookStack: BookStack,
  lotteryBox: LotteryBox, lotScroll: LotScroll, lotScrollRed: LotScrollRed, lotSlip: LotSlip, libBook: LibBook, phonePhoto: PhonePhoto, rubberBands: RubberBands,
  boardEraser: BoardEraser, phoneGallery: PhoneGallery, coins: Coins, gorenganTiga: GorenganTiga };
export const Item: React.FC<{ id: string; x: number; y: number }> = ({ id, x, y }) => {
  const C = MAP[id as ItemId];
  return C ? <g transform={`translate(${x} ${y})`}><C /></g> : null;
};

/* ---------------- tas punggung (dipakai berangkat/pulang sekolah) ---------------- */
const BAG_COLORS = ["#2f7fd8", "#e63946", "#3c8d5a", "#8f5bd1", "#f3a03c", "#2aa6a0", "#5b6270"];
export const bagColor = (seed: number) => BAG_COLORS[Math.abs(seed) % BAG_COLORS.length];
/** Lapisan BELAKANG badan: badan tas + kantong depan + pegangan atas. */
export const BackpackBack: React.FC<{ color: string; crouch?: number }> = ({ color, crouch = 0 }) => (
  <g transform={`translate(0 ${crouch})`} {...sw(6)}>
    <path d="M -34 -452 Q -92 -462 -142 -430 Q -164 -330 -146 -228 Q -90 -206 -38 -236 Z" fill={color} />
    <path d="M -128 -330 Q -106 -312 -52 -318 L -50 -246 Q -100 -232 -140 -250 Z" fill={color} style={{ filter: "brightness(0.86)" }} />
    <path d="M -116 -300 L -64 -296" stroke="#fff" strokeOpacity={0.7} strokeWidth={5} />
    <path d="M -100 -452 Q -92 -486 -70 -452" fill="none" />
    <path d="M -150 -410 Q -166 -326 -148 -250" fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={6} />
  </g>
);
/** Lapisan DEPAN badan: tali bahu. */
export const BackpackStraps: React.FC<{ color: string; bodyW: number; crouch?: number }> = ({ color, bodyW, crouch = 0 }) => (
  <g transform={`translate(0 ${crouch})`} {...sw(5)}>
    <path d={`M ${34 * bodyW} -446 Q ${42 * bodyW} -380 ${24 * bodyW} -300`} fill="none" stroke={OUT} strokeWidth={22} />
    <path d={`M ${34 * bodyW} -446 Q ${42 * bodyW} -380 ${24 * bodyW} -300`} fill="none" stroke={color} strokeWidth={14} style={{ filter: "brightness(0.9)" }} />
    <rect x={-6} y={-322} width={22} height={9} rx={3} fill="#c8cdd4" strokeWidth={3} transform={`translate(${14 * bodyW} 0)`} />
  </g>
);

/** Topi upacara SMA (abu-abu, lambang OSIS). Digambar di ruang koordinat kepala (sama dengan Head). */
export const UpacaraCap: React.FC = () => (
  <g stroke={OUT} strokeWidth={6} strokeLinejoin="round">
    <path d="M -112 -232 C -118 -330 138 -336 142 -226 Q 20 -250 -112 -232 Z" fill="#8d939c" />
    <path d="M 118 -236 Q 170 -232 176 -214 Q 120 -216 96 -226 Z" fill="#6b7280" />
    <circle cx={14} cy={-272} r={15} fill="#ffd23f" strokeWidth={4} /><path d="M 6 -272 l 8 -9 l 8 9 l -8 9 Z" fill="#e63946" stroke="none" />
  </g>
);
