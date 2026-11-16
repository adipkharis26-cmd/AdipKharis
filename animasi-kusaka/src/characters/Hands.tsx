import React from "react";

/**
 * Hand library — every hand has 4 fingers + thumb.
 * Local frame: wrist at (0,0), +x points out of the forearm, thumb side is -y
 * (for a relaxed arm in the canonical 3/4 view the thumb faces forward).
 */
export type HandShape = "relaxed" | "open" | "fist" | "point" | "thumbsup" | "peace" | "wave" | "phone" | "hidden";
export const HAND_SHAPES: HandShape[] = ["relaxed", "open", "fist", "point", "thumbsup", "peace", "wave", "phone"];

const OUT = "#1b1b1b";
const SW = 4.5;

/** One finger: capsule from (x,y) along angle (deg). */
const Finger: React.FC<{ x: number; y: number; a: number; len: number; w?: number; fill: string; nail?: boolean }> = ({ x, y, a, len, w = 11, fill, nail }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <rect x={-w / 2} y={-w / 2} width={len + w / 2} height={w} rx={w / 2} fill={fill} stroke={OUT} strokeWidth={SW} />
    {nail && <path d={`M ${len - 5} ${-w / 2 + 3} q 4 ${w / 2 - 3} 0 ${w - 6}`} fill="none" stroke={OUT} strokeWidth={2} opacity={0.5} />}
  </g>
);

const Palm: React.FC<{ fill: string; w?: number }> = ({ fill, w = 26 }) => (
  <rect x={-4} y={-16} width={w} height={32} rx={11} fill={fill} stroke={OUT} strokeWidth={SW} />
);

/** Curled fingers seen from the back: a rounded roll with 3 knuckle creases. */
const FingerRoll: React.FC<{ fill: string; from?: number; to?: number }> = ({ fill, from = -17, to = 17 }) => {
  const h = to - from;
  const creases = [1, 2, 3].map((i) => from + (h / 4) * i).filter((y) => y > from + 2 && y < to - 2);
  return (
    <g>
      <rect x={10} y={from} width={20} height={h} rx={9} fill={fill} stroke={OUT} strokeWidth={SW} />
      {creases.map((y) => <path key={y} d={`M 18 ${y} L 30 ${y}`} stroke={OUT} strokeWidth={2.5} strokeLinecap="round" />)}
    </g>
  );
};

export const Hand: React.FC<{ shape: HandShape; skin: string; scale?: number }> = ({ shape, skin, scale = 1.12 }) => {
  if (shape === "hidden") return null;
  const f = skin;
  let body: React.ReactNode;
  switch (shape) {
    case "relaxed":
      body = (
        <g>
          {[[-11, 32, 16], [-3.5, 40, 18], [4, 46, 17], [11, 54, 13]].map(([y, a, l], i) => <Finger key={i} x={17} y={y} a={a} len={l} w={10} fill={f} />)}
          <Palm fill={f} />
          <Finger x={6} y={-12} a={-28} len={15} w={11} fill={f} />
        </g>
      );
      break;
    case "open":
    case "wave":
      body = (
        <g>
          {[[-11, -16, 22], [-3.5, -5, 26], [4, 6, 24], [11, 18, 18]].map(([y, a, l], i) => <Finger key={i} x={18} y={y} a={a} len={l} w={10} fill={f} nail />)}
          <Palm fill={f} />
          <Finger x={4} y={-13} a={-58} len={18} w={12} fill={f} />
          {/* palm crease */}
          <path d="M 4 4 Q 12 -2 18 6" fill="none" stroke={OUT} strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
        </g>
      );
      break;
    case "fist":
      body = (<g><Palm fill={f} /><FingerRoll fill={f} /><Finger x={2} y={-14} a={28} len={18} w={11} fill={f} /></g>);
      break;
    case "point":
      body = (
        <g>
          <Palm fill={f} />
          <FingerRoll fill={f} from={-4} to={17} />
          <Finger x={20} y={-11} a={-2} len={30} w={11} fill={f} nail />
          <Finger x={3} y={-14} a={20} len={17} w={11} fill={f} />
        </g>
      );
      break;
    case "thumbsup":
      body = (<g><Palm fill={f} /><FingerRoll fill={f} /><Finger x={6} y={-12} a={-90} len={24} w={13} fill={f} nail /></g>);
      break;
    case "peace":
      body = (
        <g>
          <Palm fill={f} />
          <FingerRoll fill={f} from={4} to={17} />
          <Finger x={20} y={-11} a={-14} len={30} w={10} fill={f} nail />
          <Finger x={20} y={-2} a={10} len={30} w={10} fill={f} nail />
          <Finger x={3} y={-14} a={34} len={17} w={11} fill={f} />
        </g>
      );
      break;
    case "phone":
      body = (
        <g>
          {/* smartphone held upright */}
          <g transform="translate(14 -10) rotate(-90)">
            <rect x={-22} y={-4} width={44} height={74} rx={7} fill="#2d2d3a" stroke={OUT} strokeWidth={SW} />
            <rect x={-16} y={4} width={32} height={56} rx={3} fill="#8fd3ff" />
            <circle cx={10} cy={10} r={4} fill="#e63946" />
          </g>
          <Palm fill={f} />
          <FingerRoll fill={f} />
          <Finger x={4} y={-13} a={-40} len={16} w={11} fill={f} />
        </g>
      );
      break;
  }
  return <g transform={`scale(${scale})`}>{body}</g>;
};
