import React from "react";

const OUT = "#1b1b1b";
const SW = 6;

/** Layer 0 – sky (far, slow parallax) */
export const Sky: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-1200} y={-800} width={4400} height={2400} fill="#8fd6ff" />
    <rect x={-1200} y={260} width={4400} height={500} fill="#bfe8ff" />
    <circle cx={1560} cy={150} r={70} fill="#fff3b0" />
    {[0, 1, 2, 3].map((i) => {
      const x = ((i * 620 + t * 14) % 2800) - 500;
      return (
        <g key={i} transform={`translate(${x} ${90 + (i % 2) * 90})`} fill="#fff" stroke={OUT} strokeWidth={4}>
          <path d="M 0 40 Q -10 0 40 6 Q 60 -26 100 0 Q 150 -6 150 40 Z" />
        </g>
      );
    })}
  </g>
);

/** Layer 1 – distant buildings, power pole & cables */
export const City: React.FC = () => (
  <g stroke={OUT} strokeWidth={5}>
    {[
      [-300, 300, 260, "#c7b7e6"], [-40, 230, 200, "#f6c6a8"], [160, 330, 240, "#a9d5c3"], [400, 260, 180, "#f3dd9c"],
      [1380, 250, 220, "#c7b7e6"], [1600, 320, 260, "#f6c6a8"], [1860, 220, 220, "#a9d5c3"], [2080, 300, 240, "#f3dd9c"],
    ].map(([x, top, w, c], i) => (
      <g key={i}>
        <rect x={x as number} y={top as number} width={w as number} height={700 - (top as number)} fill={c as string} />
        {[0, 1, 2].map((r) => [0, 1].map((col) => (
          <rect key={`${r}${col}`} x={(x as number) + 30 + col * ((w as number) / 2)} y={(top as number) + 36 + r * 80}
            width={(w as number) / 2 - 60} height={40} fill="#fff8e6" strokeWidth={4} />
        )))}
      </g>
    ))}
    {/* power pole */}
    <rect x={1680} y={60} width={26} height={720} fill="#9aa0a8" />
    <rect x={1630} y={110} width={126} height={16} fill="#9aa0a8" />
    <path d="M -400 140 Q 600 230 1693 118 Q 2100 80 2600 160" fill="none" strokeWidth={4} />
    <path d="M -400 180 Q 600 280 1693 126 Q 2100 120 2600 210" fill="none" strokeWidth={4} />
  </g>
);

/** Bu Ijah — the stall owner behind the counter (simple secondary character) */
const BuIjah: React.FC<{ t: number; nod: number }> = ({ t, nod }) => {
  const blink = (t % 3.7) < 0.12;
  return (
    <g transform={`translate(960 640)`}>
      <path d="M -80 0 Q -80 -150 0 -150 Q 80 -150 80 0 Z" fill="#3fa37a" stroke={OUT} strokeWidth={SW} />
      <g transform={`translate(0 -150) rotate(${nod})`}>
        {/* hijab */}
        <path d="M -72 -10 Q -84 -150 0 -158 Q 84 -150 72 -10 Q 40 20 0 18 Q -40 20 -72 -10 Z" fill="#e85d75" stroke={OUT} strokeWidth={SW} />
        <ellipse cx={0} cy={-78} rx={50} ry={58} fill="#e0a77a" stroke={OUT} strokeWidth={5} />
        {blink ? (
          <g stroke={OUT} strokeWidth={5}><path d="M -26 -86 l 16 0" /><path d="M 10 -86 l 16 0" /></g>
        ) : (
          <g fill={OUT}><ellipse cx={-18} cy={-86} rx={6} ry={9} /><ellipse cx={18} cy={-86} rx={6} ry={9} /></g>
        )}
        <path d="M -14 -50 Q 0 -40 14 -50" fill="none" stroke={OUT} strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={-32} cy={-62} rx={9} ry={5} fill="#ff7f7f" opacity={0.4} />
        <ellipse cx={32} cy={-62} rx={9} ry={5} fill="#ff7f7f" opacity={0.4} />
      </g>
    </g>
  );
};

/** Layer 2 – the warung (same depth as characters) */
export const Warung: React.FC<{ t: number; ijahNod: number }> = ({ t, ijahNod }) => {
  const sway = Math.sin(t * 1.3) * 2;
  return (
    <g>
      {/* back wall: wooden planks */}
      <rect x={300} y={330} width={1320} height={560} fill="#b9773f" stroke={OUT} strokeWidth={SW} />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={300 + i * 110} y1={330} x2={300 + i * 110} y2={890} stroke="#8e5527" strokeWidth={5} />
      ))}
      {/* shelves with goods */}
      {[430, 530].map((y) => (
        <g key={y}>
          <rect x={380} y={y} width={420} height={14} fill="#7a4520" stroke={OUT} strokeWidth={4} />
          <rect x={1120} y={y} width={420} height={14} fill="#7a4520" stroke={OUT} strokeWidth={4} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i}>
              <rect x={395 + i * 66} y={y - 52} width={44} height={52} rx={6} fill={["#f25f5c", "#ffe066", "#70c1b3", "#247ba0", "#f6a5c0", "#9bc53d"][i]} stroke={OUT} strokeWidth={4} />
              <rect x={1135 + i * 66} y={y - 44} width={40} height={44} rx={18} fill={["#ffe066", "#70c1b3", "#f25f5c", "#9bc53d", "#247ba0", "#f6a5c0"][i]} stroke={OUT} strokeWidth={4} />
            </g>
          ))}
        </g>
      ))}
      <BuIjah t={t} nod={ijahNod} />
      {/* counter */}
      <rect x={340} y={630} width={1240} height={30} fill="#8a5126" stroke={OUT} strokeWidth={SW} />
      <rect x={360} y={660} width={1200} height={230} fill="#a8642f" stroke={OUT} strokeWidth={SW} />
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={360 + i * 240} y1={660} x2={360 + i * 240} y2={890} stroke="#7a4520" strokeWidth={5} />)}
      {/* glass display with gorengan */}
      <g transform="translate(560 520)">
        <rect x={0} y={0} width={260} height={112} fill="#d8f3ff" fillOpacity={0.6} stroke={OUT} strokeWidth={SW} />
        {[[30, 80], [70, 86], [112, 78], [150, 88], [195, 80], [60, 52], [130, 50], [180, 56]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx={24} ry={14} fill={i % 3 === 0 ? "#e9a23b" : "#d98a2b"} stroke={OUT} strokeWidth={4} />
        ))}
        <line x1={20} y1={18} x2={60} y2={18} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
      </g>
      {/* jars of krupuk */}
      {[1180, 1290, 1400].map((x, i) => (
        <g key={x} transform={`translate(${x} 530)`}>
          <rect x={0} y={10} width={80} height={92} rx={14} fill="#eaf7ff" fillOpacity={0.7} stroke={OUT} strokeWidth={5} />
          <rect x={6} y={-6} width={68} height={18} rx={4} fill={["#f25f5c", "#247ba0", "#ffe066"][i]} stroke={OUT} strokeWidth={5} />
          {[0, 1, 2].map((k) => <circle key={k} cx={22 + k * 18} cy={60 + (k % 2) * 16} r={14} fill="#fff4d6" stroke={OUT} strokeWidth={3} />)}
        </g>
      ))}
      {/* bamboo poles */}
      <rect x={300} y={250} width={34} height={640} fill="#d8b25a" stroke={OUT} strokeWidth={SW} />
      <rect x={1586} y={250} width={34} height={640} fill="#d8b25a" stroke={OUT} strokeWidth={SW} />
      {/* blue tarp roof with scalloped edge */}
      <path d="M 240 220 L 1680 220 L 1680 300 Q 1640 340 1600 300 Q 1560 340 1520 300 Q 1480 340 1440 300 Q 1400 340 1360 300 Q 1320 340 1280 300 Q 1240 340 1200 300 Q 1160 340 1120 300 Q 1080 340 1040 300 Q 1000 340 960 300 Q 920 340 880 300 Q 840 340 800 300 Q 760 340 720 300 Q 680 340 640 300 Q 600 340 560 300 Q 520 340 480 300 Q 440 340 400 300 Q 360 340 320 300 Q 280 340 240 300 Z"
        fill="#2f7fd8" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M 240 236 L 1680 236" stroke="#5aa2f0" strokeWidth={10} />
      {/* shop sign */}
      <g transform="translate(960 160)">
        <rect x={-300} y={-62} width={600} height={112} rx={10} fill="#e63946" stroke={OUT} strokeWidth={SW} />
        <text x={0} y={22} textAnchor="middle" fontFamily="Bangers" fontSize={78} fill="#fff8e1" stroke={OUT} strokeWidth={4} paintOrder="stroke" letterSpacing={3}>WARUNG BU IJAH</text>
      </g>
      {/* hanging sachet strips (renceng) */}
      {[380, 440, 1440, 1500].map((x, i) => (
        <g key={x} transform={`translate(${x} 300) rotate(${sway * (i % 2 ? 1 : -1)})`}>
          <line x1={0} y1={0} x2={0} y2={20} stroke={OUT} strokeWidth={3} />
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={-18} y={20 + k * 38} width={36} height={34} fill={["#ffd23f", "#ee4266", "#3bceac", "#540d6e"][(k + i) % 4]} stroke={OUT} strokeWidth={4} />
          ))}
        </g>
      ))}
    </g>
  );
};

/** Ground: sidewalk + painted curb + road */
export const Ground: React.FC = () => (
  <g>
    <rect x={-1200} y={880} width={4400} height={130} fill="#d9d4c7" stroke={OUT} strokeWidth={SW} />
    {Array.from({ length: 40 }).map((_, i) => (
      <line key={i} x1={-1200 + i * 110} y1={880} x2={-1240 + i * 110} y2={1010} stroke="#bdb6a6" strokeWidth={4} />
    ))}
    {Array.from({ length: 44 }).map((_, i) => (
      <rect key={i} x={-1200 + i * 100} y={1010} width={100} height={28} fill={i % 2 ? "#fff" : "#222"} stroke={OUT} strokeWidth={4} />
    ))}
    <rect x={-1200} y={1038} width={4400} height={600} fill="#5d6169" />
    {Array.from({ length: 20 }).map((_, i) => <rect key={i} x={-1100 + i * 230} y={1150} width={120} height={16} fill="#f2f2f2" />)}
    {/* wooden bench */}
    <g transform="translate(150 820)">
      <rect x={0} y={0} width={240} height={24} fill="#a8642f" stroke={OUT} strokeWidth={SW} />
      <rect x={20} y={24} width={20} height={60} fill="#7a4520" stroke={OUT} strokeWidth={5} />
      <rect x={200} y={24} width={20} height={60} fill="#7a4520" stroke={OUT} strokeWidth={5} />
    </g>
  </g>
);
