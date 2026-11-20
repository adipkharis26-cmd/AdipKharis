import React from "react";
import { random } from "remotion";
import canon from "./canon.json";
import { Action, CharId, Emotion, FPS, TOTAL_SECONDS, Viseme, stateAt, visemeAt, sceneAt } from "../lib/timeline";
import { Mouth, pickMouth } from "./Mouth";
import { Brow, Eye, eyesFor } from "./Eyes";
import { Hand, HandShape } from "./Hands";
import { BackpackBack, BackpackStraps, Item, UpacaraCap, bagColor } from "./Props";

/* ------------------------------------------------------------------------------------------
 * Layered 2D character rig (SVG). Origin = between the feet, character faces +x.
 * Layer order (back → front): back arm, legs/skirt, torso, neck, head (hijab drape, ear,
 * face, eyes, brows, nose, mouth, hair, accessories), front arm, FX.
 * All designs come from canon.json (locked — see `npm run check:characters`).
 * ---------------------------------------------------------------------------------------- */

const OUT = "#1b1b1b";
const SW = 6;
const ST = canon.style;

type Hair = "spiky" | "buzz" | "hijab" | "ponytail" | "parted" | "bun" | "long" | "quiff" | "cap" | "balding" | "bob" | "curly" | "messy";
type Outfit = "sma" | "smaGirl" | "smp" | "teacher" | "daster" | "polo" | "tracksuit" | "security" | "casual" | "blouse" | "apron"
  | "tee" | "hoodie" | "jersey"; // pakaian bebas (kanon v3.1.0)
type Bottom = "pants" | "longSkirt" | "skirt" | "dress" | "sarung" | "trackpants" | "jeans" | "cargo" | "pleated";
type Pattern = "none" | "kawung" | "floral" | "plaid" | "parang" | "stripes";
export interface Look {
  skin: string; skinShade: string; hair: string; shirt: string; shirtShade: string; bottom: string; accent: string;
  hijab?: string; hijabShade?: string; motif?: string; inner?: string; apron?: string; graphic?: string;
  bodyW: number; belly: number; browThick: number; height: number;
  hairStyle: Hair; glasses: boolean; glassesStyle: "round" | "rect" | "cateye"; bandaid: boolean; tucked: boolean; outfit: Outfit;
  bottomStyle: Bottom; sleeves: "short" | "long"; mustache: boolean; mustacheStyle: "thick" | "thin"; lashes: boolean;
  badge: "osis" | "nametag" | "security" | "none"; pattern: Pattern; collar: "shirt" | "polo" | "round" | "zip" | "open" | "vneck" | "hood";
  shoes: "shoe" | "sneaker" | "sandal"; accessories: string[]; age: number;
}
type CanonChar = (typeof canon.characters)[CharId];
/** Pakaian: "seragam" (kanon dasar), "bebas" (lemari `wardrobe.bebas` di canon.json), "rumah" (bebas + sandal). */
export type Wear = "seragam" | "bebas" | "rumah";
type Wardrobe = { features?: Record<string, unknown>; palette?: Record<string, string> };
const toLook = (c: CanonChar, wear: Wear = "seragam"): Look => {
  const wb = wear === "seragam" ? undefined : (c as unknown as { wardrobe?: { bebas?: Wardrobe } }).wardrobe?.bebas;
  const f: Record<string, unknown> = { ...(c.features as Record<string, unknown>), ...(wb?.features ?? {}), ...(wb && wear === "rumah" ? { shoes: "sandal" } : {}) };
  return Object.freeze({
    ...(c.palette as Record<string, string>), ...(wb?.palette ?? {}), ...c.build, graphic: (f.graphic as string | undefined),
    hairStyle: f.hair as Hair, glasses: !!f.glasses, glassesStyle: (f.glassesStyle ?? "round") as Look["glassesStyle"],
    bandaid: !!f.bandaid, tucked: !!f.tucked, outfit: f.outfit as Outfit, bottomStyle: f.bottom as Bottom,
    sleeves: f.sleeves as Look["sleeves"], mustache: !!f.mustache, mustacheStyle: (f.mustacheStyle ?? "thick") as Look["mustacheStyle"],
    lashes: !!f.lashes, badge: f.badge as Look["badge"], pattern: (f.pattern ?? "none") as Pattern,
    collar: (f.collar ?? "shirt") as Look["collar"], shoes: (f.shoes ?? "shoe") as Look["shoes"], accessories: (f.accessories ?? []) as string[], age: c.age,
  }) as Look;
};
export const CHAR_IDS = Object.keys(canon.characters) as CharId[];
export const LOOKS = Object.freeze(Object.fromEntries(CHAR_IDS.map((id) => [id, toLook(canon.characters[id])]))) as Record<CharId, Look>;
const WEAR_LOOKS: Record<Wear, Record<CharId, Look>> = {
  seragam: LOOKS,
  bebas: Object.freeze(Object.fromEntries(CHAR_IDS.map((id) => [id, toLook(canon.characters[id], "bebas")]))) as Record<CharId, Look>,
  rumah: Object.freeze(Object.fromEntries(CHAR_IDS.map((id) => [id, toLook(canon.characters[id], "rumah")]))) as Record<CharId, Look>,
};
export const lookFor = (id: CharId, wear: Wear = "seragam") => WEAR_LOOKS[wear][id];

/* ------------------------------ poses ----------------------------------- */
// Arm pose: [shoulder, elbow] in degrees, measured "forward" (toward facing) from pointing down.
type ArmPose = [number, number];
interface Pose { front: ArmPose; back: ArmPose; lean: number; head: number; crouch: number; look: [number, number]; hands: [HandShape, HandShape] }
export const POSES: Record<Action, Pose> = {
  idle:     { front: [8, 12],    back: [-6, 10],    lean: 0,  head: 0,   crouch: 0,  look: [0.7, 0],    hands: ["relaxed", "relaxed"] },
  gesture:  { front: [38, 75],   back: [-4, 12],    lean: 2,  head: -2,  crouch: 0,  look: [0.7, 0],    hands: ["open", "relaxed"] },
  pocket:   { front: [4, -4],    back: [-6, 10],    lean: 1,  head: 6,   crouch: 0,  look: [0.4, 0.8],  hands: ["fist", "relaxed"] },
  chin:     { front: [60, 150],  back: [16, 92],    lean: -2, head: -4,  crouch: 0,  look: [0.7, -0.1], hands: ["fist", "fist"] },
  point:    { front: [82, 4],    back: [24, -98],   lean: -5, head: -10, crouch: 0,  look: [0.8, 0],    hands: ["point", "fist"] },
  plead:    { front: [26, 104],  back: [48, 84],    lean: 6,  head: 7,   crouch: 10, look: [0.7, -0.4], hands: ["fist", "fist"] },
  crossed:  { front: [12, -96],  back: [10, 88],    lean: -4, head: -3,  crouch: 0,  look: [0.7, 0],    hands: ["fist", "fist"] },
  shock:    { front: [120, 60],  back: [-120, -60], lean: -6, head: -6,  crouch: -6, look: [0.1, 0],    hands: ["open", "open"] },
  laugh:    { front: [24, -96],  back: [20, 96],    lean: -6, head: -12, crouch: 0,  look: [0, 0],      hands: ["open", "fist"] },
  slump:    { front: [2, 4],     back: [-2, 4],     lean: 8,  head: 14,  crouch: 16, look: [0.3, 0.7],  hands: ["relaxed", "relaxed"] },
  wave:     { front: [150, 10],  back: [-6, 10],    lean: -2, head: -4,  crouch: 0,  look: [0.7, 0],    hands: ["wave", "relaxed"] },
  thumbsup: { front: [40, 95],   back: [-6, 10],    lean: -2, head: -4,  crouch: 0,  look: [0.7, 0],    hands: ["thumbsup", "relaxed"] },
  peace:    { front: [70, 110],  back: [-6, 10],    lean: -3, head: -6,  crouch: 0,  look: [0.3, 0],    hands: ["peace", "relaxed"] },
  facepalm: { front: [70, 132],  back: [-6, 10],    lean: 6,  head: 12,  crouch: 4,  look: [0.3, 0.6],  hands: ["open", "relaxed"] },
  hips:     { front: [41, -72],  back: [-41, 75],  lean: -3, head: -4,  crouch: 0,  look: [0.7, 0],    hands: ["fist", "fist"] },
  phone:    { front: [30, 110],  back: [24, 104],   lean: 3,  head: 10,  crouch: 0,  look: [0.6, 0.7],  hands: ["phone", "fist"] },
  // aksi benda/tindakan (kanon v3.2.0)
  hold:     { front: [38, 88],   back: [26, 84],    lean: 2,  head: 4,   crouch: 0,  look: [0.6, 0.5],  hands: ["fist", "fist"] },
  carry:    { front: [14, 10],   back: [-6, 10],    lean: 1,  head: 0,   crouch: 0,  look: [0.7, 0],    hands: ["fist", "relaxed"] },
  give:     { front: [80, 8],    back: [-6, 10],    lean: -4, head: -4,  crouch: 0,  look: [0.8, 0],    hands: ["open", "relaxed"] },
  show:     { front: [116, 34],  back: [-6, 10],    lean: -4, head: -8,  crouch: 0,  look: [0.7, -0.2], hands: ["fist", "relaxed"] },
  read:     { front: [52, 112],  back: [28, 98],    lean: 2,  head: 10,  crouch: 0,  look: [0.45, 0.8], hands: ["fist", "fist"] },
  pull:     { front: [66, 62],   back: [50, 70],    lean: 6,  head: 4,   crouch: 6,  look: [0.7, -0.3], hands: ["fist", "fist"] },
  salute:   { front: [110, 133], back: [-6, 10],    lean: -2, head: -2,  crouch: 0,  look: [0.8, 0],    hands: ["open", "relaxed"] },
  shoot:    { front: [150, 20],  back: [128, 24],   lean: -8, head: -10, crouch: -4, look: [0.8, -0.6], hands: ["fist", "fist"] },
  drink:    { front: [58, 146],  back: [-6, 10],    lean: 0,  head: -6,  crouch: 0,  look: [0.6, 0],    hands: ["fist", "relaxed"] },
  eat:      { front: [58, 146],  back: [30, 88],    lean: 3,  head: 6,   crouch: 0,  look: [0.5, 0.5],  hands: ["fist", "fist"] },
  write:    { front: [34, 104],  back: [26, 90],    lean: 6,  head: 14,  crouch: 4,  look: [0.4, 0.9],  hands: ["fist", "open"] },
  sweep:    { front: [32, 62],   back: [38, 70],    lean: 8,  head: 8,   crouch: 6,  look: [0.5, 0.8],  hands: ["fist", "fist"] },
  blow:     { front: [60, 150],  back: [-6, 10],    lean: -2, head: -4,  crouch: 0,  look: [0.7, 0],    hands: ["fist", "relaxed"] },
  // Eps. 5 "Satu Kelompok": meraih buku di rak atas; memotret dengan HP setinggi mata (+ kilatan blitz)
  reach:    { front: [92, 4],    back: [-4, 12],    lean: 7,  head: -4,  crouch: 0,  look: [0.9, -0.1], hands: ["open", "relaxed"] },
  photo:    { front: [110, 50],  back: [96, 62],    lean: -2, head: 2,   crouch: 0,  look: [0.9, 0],    hands: ["phone", "fist"] },
  // Shorts "Papan Tulis": menghapus papan tulis di belakang tanpa membelakangi murid (tangan depan terangkat + mengusap, tangan belakang di pinggang)
  erase:    { front: [122, -8],  back: [-41, 75],   lean: -3, head: -4,  crouch: 0,  look: [0.7, 0],    hands: ["fist", "fist"] },
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (x: number) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
function mixPose(a: Pose, b: Pose, k: number): Pose {
  return {
    front: [lerp(a.front[0], b.front[0], k), lerp(a.front[1], b.front[1], k)],
    back: [lerp(a.back[0], b.back[0], k), lerp(a.back[1], b.back[1], k)],
    lean: lerp(a.lean, b.lean, k), head: lerp(a.head, b.head, k), crouch: lerp(a.crouch, b.crouch, k),
    look: [lerp(a.look[0], b.look[0], k), lerp(a.look[1], b.look[1], k)],
    hands: k < 0.5 ? a.hands : b.hands,
  };
}

// Deterministic random blinks (2–5 s apart, sometimes a double blink)
const blinkCache: Record<string, number[]> = {};
function blinkTimes(seed: string): number[] {
  if (blinkCache[seed]) return blinkCache[seed];
  const out: number[] = [];
  let t = 0.8 + random(seed) * 1.5;
  let i = 0;
  while (t < Math.max(TOTAL_SECONDS, 600)) {
    out.push(t);
    if (random(`${seed}-d${i}`) < 0.2) out.push(t + 0.22);
    t += 2 + random(`${seed}-${i++}`) * 3;
  }
  return (blinkCache[seed] = out);
}
const isBlinking = (seed: string, t: number) => blinkTimes(seed).some((b) => t >= b && t < b + 0.12);

const OPEN: Record<string, number> = { A: 1, O: 0.85, E: 0.6, consonant: 0.35, I: 0.3, U: 0.3, F: 0.15, M: 0, rest: 0 };

/* ------------------------------ limbs ----------------------------------- */
function armPoints(sx: number, sy: number, [s, e]: ArmPose, upper = 100, fore = 96) {
  const r = (d: number) => (d * Math.PI) / 180;
  const ex = sx + Math.sin(r(s)) * upper, ey = sy + Math.cos(r(s)) * upper;
  const hx = ex + Math.sin(r(s + e)) * fore, hy = ey + Math.cos(r(s + e)) * fore;
  return { ex, ey, hx, hy };
}

const Arm: React.FC<{ sx: number; sy: number; pose: ArmPose; look: Look; shade?: boolean; hand: HandShape; t: number; front?: boolean; item?: string; flash?: number }> = ({ sx, sy, pose, look, shade, hand, t, front, item, flash = 0 }) => {
  const { ex, ey, hx, hy } = armPoints(sx, sy, pose);
  const skin = shade ? look.skinShade : look.skin;
  const cloth = shade ? look.shirtShade : look.shirt;
  const path = `M ${sx} ${sy} L ${ex} ${ey} L ${hx} ${hy}`;
  let handAngle = Math.atan2(hy - ey, hx - ex) * (180 / Math.PI);
  if (hand === "wave") handAngle += Math.sin(t * 12) * 18;
  // long sleeve covers the arm down to the wrist (cuff), short sleeve 62% of the upper arm
  const cuffX = ex + (hx - ex) * 0.86, cuffY = ey + (hy - ey) * 0.86;
  const baggy = look.outfit === "tee" || look.outfit === "jersey"; // kaos oversize: lengan lebih lebar & panjang
  const sk = baggy ? 0.78 : 0.62;
  const sleevePath = look.sleeves === "long"
    ? `M ${sx} ${sy} L ${ex} ${ey} L ${cuffX} ${cuffY}`
    : `M ${sx} ${sy} L ${sx + (ex - sx) * sk} ${sy + (ey - sy) * sk}`;
  return (
    <g>
      <path d={path} stroke={OUT} strokeWidth={40} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} stroke={skin} strokeWidth={28} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={sleevePath} stroke={OUT} strokeWidth={look.sleeves === "long" ? (look.outfit === "hoodie" ? 52 : 46) : baggy ? 62 : 54} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={sleevePath} stroke={cloth} strokeWidth={look.sleeves === "long" ? (look.outfit === "hoodie" ? 40 : 34) : baggy ? 50 : 42} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {look.pattern === "kawung" && <path d={sleevePath} stroke={look.motif} strokeWidth={6} strokeDasharray="2 14" fill="none" strokeLinecap="round" opacity={shade ? 0.6 : 0.9} />}
      {(look.pattern === "floral" || look.pattern === "parang") && <path d={sleevePath} stroke={look.motif} strokeWidth={7} strokeDasharray="3 16" fill="none" strokeLinecap="round" opacity={0.85} />}
      {look.pattern === "plaid" && <path d={sleevePath} stroke={look.shirtShade} strokeWidth={8} strokeDasharray="6 10" fill="none" opacity={0.9} />}
      {look.pattern === "stripes" && <path d={sleevePath} stroke={look.motif} strokeWidth={6} fill="none" strokeLinecap="round" transform="translate(9 0)" />}
      {look.sleeves === "long"
        ? <path d={`M ${ex - 12} ${ey - 4} q 10 8 22 2 M ${ex - 8} ${ey + 8} q 8 5 16 1`} stroke={shade ? OUT : look.shirtShade} strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={shade ? 0.35 : 0.9} />
        : <path d={`M ${sx + (ex - sx) * 0.48 - 12} ${sy + (ey - sy) * 0.48} q 12 6 24 0`} stroke={shade ? OUT : look.shirtShade} strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={shade ? 0.35 : 0.9} />}
      {front && look.accessories.includes("watch") && (
        <circle cx={ex + (hx - ex) * 0.82} cy={ey + (hy - ey) * 0.82} r={13} fill="#222" stroke={OUT} strokeWidth={3} />
      )}
      {item && <Item id={item} x={hx} y={hy} />}
      <g transform={`translate(${hx} ${hy}) rotate(${handAngle})`}><Hand shape={item ? "fist" : hand} skin={skin} /></g>
      {flash > 0 && (
        <g transform={`translate(${hx + 30} ${hy - 20})`} opacity={flash}>
          <circle r={90} fill="#fffbe6" opacity={0.45} /><circle r={38} fill="#fff" />
          {[0, 45, 90, 135].map((a) => <rect key={a} x={-150} y={-5} width={300} height={10} rx={5} fill="#fff" transform={`rotate(${a})`} />)}
        </g>
      )}
    </g>
  );
};

const Shoe: React.FC<{ x: number; look: Look }> = ({ x, look }) => {
  if (look.shoes === "sandal") {
    return (
      <g>
        <path d={`M ${x - 26} -30 Q ${x - 28} -4 ${x - 8} -4 L ${x + 46} -4 Q ${x + 54} -18 ${x + 26} -30 Z`} fill={look.skin} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
        <rect x={x - 30} y={-6} width={86} height={8} rx={4} fill="#2f7fd8" stroke={OUT} strokeWidth={4} />
        <path d={`M ${x + 4} -26 L ${x + 18} -6`} stroke="#2f7fd8" strokeWidth={6} strokeLinecap="round" />
      </g>
    );
  }
  const body = look.shoes === "sneaker" ? "#fbfbf7" : look.outfit === "teacher" || look.outfit === "blouse" ? "#4a2c1a" : "#222";
  return (
    <g>
      <path d={`M ${x - 30} -34 Q ${x - 30} -2 ${x - 10} 0 L ${x + 52} 0 Q ${x + 60} -22 ${x + 28} -34 Z`} fill={body} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <path d={`M ${x - 26} -6 L ${x + 54} -6`} stroke={look.shoes === "sneaker" ? look.accent : "#eee"} strokeWidth={6} />
      {look.shoes === "sneaker" && <path d={`M ${x + 2} -28 l 18 0 M ${x + 6} -20 l 18 0`} stroke={OUT} strokeWidth={3} />}
      <ellipse cx={x + 36} cy={-22} rx={10} ry={4} fill="#fff" opacity={look.shoes === "sneaker" ? 0.5 : 0.35} transform={`rotate(-20 ${x + 36} -22)`} />
    </g>
  );
};

/** Fabric patterns, drawn inside a clip path over the cloth colour. */
const PatternFill: React.FC<{ look: Look; pattern: Pattern; x: number; y: number; w: number; h: number; base?: string }> = ({ look, pattern, x, y, w, h }) => {
  const motif = look.motif ?? "#fff";
  const cells: React.ReactNode[] = [];
  if (pattern === "kawung") {
    for (let r = 0; r * 36 < h + 36; r++) for (let c = 0; c * 36 < w + 36; c++) {
      const cx = x + c * 36 + (r % 2) * 18, cy = y + r * 36;
      cells.push(
        <g key={`${r}-${c}`} transform={`translate(${cx} ${cy})`} fill={motif} opacity={0.9}>
          <ellipse cx={0} cy={-7} rx={4.5} ry={7} /><ellipse cx={0} cy={7} rx={4.5} ry={7} />
          <ellipse cx={-7} cy={0} rx={7} ry={4.5} /><ellipse cx={7} cy={0} rx={7} ry={4.5} />
          <circle r={2.2} fill={look.shirtShade} />
        </g>);
    }
  } else if (pattern === "floral") {
    for (let r = 0; r * 44 < h + 44; r++) for (let c = 0; c * 44 < w + 44; c++) {
      const cx = x + c * 44 + (r % 2) * 22, cy = y + r * 44;
      cells.push(
        <g key={`${r}-${c}`} transform={`translate(${cx} ${cy})`}>
          {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-7} rx={4.5} ry={7} fill={motif} transform={`rotate(${a})`} />)}
          <circle r={3.5} fill={look.accent} />
        </g>);
    }
  } else if (pattern === "plaid") {
    for (let i = 0; i * 26 < w + 26; i++) cells.push(<rect key={`v${i}`} x={x + i * 26} y={y} width={9} height={h} fill={look.shirtShade} opacity={0.75} />);
    for (let i = 0; i * 26 < h + 26; i++) cells.push(<rect key={`h${i}`} x={x} y={y + i * 26} width={w} height={9} fill={look.shirtShade} opacity={0.75} />);
    for (let i = 0; i * 52 < w + 52; i++) cells.push(<rect key={`a${i}`} x={x + i * 52 + 14} y={y} width={3} height={h} fill="#1b1b1b" opacity={0.35} />);
  } else if (pattern === "parang") {
    for (let i = -6; i * 30 < w + h; i++) cells.push(
      <path key={i} d={`M ${x + i * 30} ${y} q 10 15 0 30 t 0 30 t 0 30 t 0 30 t 0 30 t 0 30 t 0 30 t 0 30 t 0 30`} transform={`rotate(-35 ${x + i * 30} ${y})`} fill="none" stroke={motif} strokeWidth={6} opacity={0.9} />);
  } else if (pattern === "stripes") {
    cells.push(<rect key="s1" x={x + w * 0.08} y={y} width={8} height={h} fill={motif} />, <rect key="s2" x={x + w * 0.86} y={y} width={8} height={h} fill={motif} />);
  }
  return <g>{cells}</g>;
};

const Lower: React.FC<{ look: Look; crouch: number; walk?: number }> = ({ look, crouch, walk }) => {
  const w = look.bodyW;
  const swing = walk === undefined ? 0 : Math.sin(walk) * 20;
  const hipY = -240 + crouch;
  const shade = (c: string) => `color-mix(in srgb, ${c} 82%, black)`;
  if (look.bottomStyle === "pants" || look.bottomStyle === "trackpants" || look.bottomStyle === "jeans" || look.bottomStyle === "cargo") {
    // baggy jeans / kargo: kaki melebar ke bawah (tren baggy & barrel)
    const wide = look.bottomStyle === "jeans" || look.bottomStyle === "cargo" ? 10 : 0;
    const leg = (x: number, back: boolean) => (
      <g>
        <path d={`M ${x - 26 * w} ${hipY} L ${x - 24 - wide} -28 L ${x + 26 + wide} -28 L ${x + 26 * w} ${hipY} Z`}
          fill={back ? shade(look.bottom) : look.bottom} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
        {look.bottomStyle === "jeans" && (
          <g fill="none" strokeLinecap="round">
            <path d={`M ${x + 6} ${hipY + 4} L ${x + 4} -34`} stroke="#ffffff" strokeWidth={2.5} strokeDasharray="7 7" opacity={0.45} />
            <path d={`M ${x - 26 - wide} -44 L ${x + 28 + wide} -44`} stroke={shade(look.bottom)} strokeWidth={6} />
          </g>
        )}
        {look.bottomStyle === "cargo" && (
          <g stroke={OUT} strokeWidth={4}>
            <rect x={x + 2} y={hipY + 74} width={34} height={42} rx={5} fill={shade(look.bottom)} />
            <path d={`M ${x + 2} ${hipY + 86} L ${x + 36} ${hipY + 86}`} />
          </g>
        )}
        {look.bottomStyle === "trackpants" && <path d={`M ${x + 14 * w} ${hipY + 6} L ${x + 16} -32`} stroke={look.motif ?? "#fff"} strokeWidth={7} />}
        <path d={`M ${x - 14} ${hipY + 128} q 10 7 22 1 M ${x - 10} ${hipY + 146} q 8 5 16 0`} stroke={shade(look.bottom)} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d={`M ${x - 22 * w} ${hipY + 8} q 6 26 22 30`} stroke={shade(look.bottom)} strokeWidth={4} fill="none" strokeLinecap="round" />
        <Shoe x={x} look={look} />
      </g>
    );
    return (
      <g>
        <g transform={`rotate(${-swing} ${-36 * w} ${hipY})`}>{leg(-36 * w, true)}</g>
        <g transform={`rotate(${swing} ${30 * w} ${hipY})`}>{leg(30 * w, false)}</g>
      </g>
    );
  }
  const long = look.bottomStyle !== "skirt";
  const pleats = look.bottomStyle === "pleated" ? [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75] : [-0.45, 0, 0.45]; // rok plisket
  const hem = long ? -26 : -150;
  const flare = long ? 96 : 84;
  const fill = look.bottomStyle === "dress" ? look.shirt : look.bottom;
  const pat: Pattern = look.bottomStyle === "dress" ? look.pattern : look.bottomStyle === "sarung" ? "plaid" : "none";
  const d = `M ${-66 * w} ${hipY} L ${66 * w + look.belly * 0.3} ${hipY} L ${flare * w} ${hem} Q 0 ${hem + 10} ${-flare * w} ${hem} Z`;
  const clip = `lower-${look.outfit}-${look.bottomStyle}-${w}`;
  const sarungLook = look.bottomStyle === "sarung" ? { ...look, shirtShade: shade(look.bottom) } : look;
  return (
    <g>
      {!long && [-30 * w, 26 * w].map((x, i) => (
        <g key={i}>
          <rect x={x - 17} y={hem - 10} width={34} height={-hem - 20} fill={i ? look.skin : look.skinShade} stroke={OUT} strokeWidth={SW} />
          <rect x={x - 18} y={-110} width={36} height={84} fill="#fbfbf7" stroke={OUT} strokeWidth={5} />
        </g>
      ))}
      <g transform={`translate(${-swing * 1.6} ${-Math.max(0, -swing) * 0.6})`}><Shoe x={-34 * w} look={look} /></g>
      <g transform={`translate(${swing * 1.6} ${-Math.max(0, swing) * 0.6})`}><Shoe x={28 * w} look={look} /></g>
      <clipPath id={clip}><path d={d} /></clipPath>
      <path d={d} fill={fill} />
      <g clipPath={`url(#${clip})`}><PatternFill look={sarungLook} pattern={pat} x={-120 * w} y={hipY} w={260 * w} h={-hipY} /></g>
      <path d={d} fill="none" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      {pat === "none" && pleats.map((k) => <path key={k} d={`M ${k * 50 * w} ${hipY + 30} L ${k * flare * w * 0.9} ${hem - 4}`} stroke={shade(fill)} strokeWidth={5} />)}
      {look.bottomStyle === "sarung" && <path d={`M ${-60 * w} ${hipY + 14} Q 0 ${hipY + 30} ${62 * w} ${hipY + 12} L ${20 * w} ${hipY + 60} Z`} fill={shade(look.bottom)} stroke={OUT} strokeWidth={4} />}
    </g>
  );
};

const Torso: React.FC<{ look: Look; crouch: number }> = ({ look, crouch }) => {
  const w = look.bodyW;
  const top = -462 + crouch, bot = -220 + crouch;
  const belly = look.belly;
  const d = `M ${-70 * w} ${top + 10} Q 0 ${top - 14} ${76 * w} ${top + 10} L ${70 * w + belly} ${top + 150}
             Q ${74 * w + belly} ${bot - 30} ${66 * w} ${bot} L ${-64 * w} ${bot} Q ${-72 * w} ${top + 120} ${-70 * w} ${top + 10} Z`;
  const clipId = `torso-${look.outfit}-${look.bodyW}-${look.belly}-${look.shirt.slice(1)}`;
  const shirtCollar = look.collar === "shirt";
  const pocket = shirtCollar && look.outfit !== "smaGirl" && look.outfit !== "blouse";
  const line = look.pattern !== "none" && look.outfit !== "tracksuit" ? look.shirtShade : "#c9ccd4";
  return (
    <g>
      {look.collar === "hood" && (
        <path d={`M ${-64 * w} ${top + 16} Q ${-74 * w} ${top - 58} 4 ${top - 62} Q ${80 * w} ${top - 58} ${70 * w} ${top + 16} Z`} fill={look.shirtShade} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      )}
      <clipPath id={clipId}><path d={d} /></clipPath>
      <path d={d} fill={look.shirt} />
      <g clipPath={`url(#${clipId})`}>
        {look.outfit === "casual" && <rect x={-20 * w} y={top - 20} width={50 * w} height={300} fill={look.inner} />}
        {look.outfit === "casual"
          ? <g><PatternFill look={look} pattern={look.pattern} x={-100 * w} y={top - 20} w={80 * w} h={300} /><PatternFill look={look} pattern={look.pattern} x={30 * w} y={top - 20} w={90 * w} h={300} /></g>
          : <PatternFill look={look} pattern={look.pattern} x={-100 * w} y={top - 10} w={220 * w + belly} h={280} />}
        <path d={`M ${-80 * w} ${top} L ${-40 * w} ${top} Q ${-48 * w} ${top + 110} ${-38 * w} ${bot + 4} L ${-80 * w} ${bot + 4} Z`} fill={look.shirtShade} opacity={look.pattern !== "none" ? 0.55 : 1} />
        <ellipse cx={6} cy={top + 4} rx={46 * w} ry={16} fill={OUT} opacity={0.14} />
        <g stroke={look.shirtShade} strokeWidth={4} fill="none" strokeLinecap="round" opacity={look.pattern !== "none" ? 0.6 : 0.95}>
          <path d={`M ${54 * w} ${top + 34} Q ${40 * w} ${top + 70} ${50 * w + belly * 0.5} ${top + 116}`} />
          <path d={`M ${-30 * w} ${top + 40} Q ${-18 * w} ${top + 64} ${-26 * w} ${top + 96}`} />
          <path d={`M ${-34 * w} ${bot - 26} Q ${-6 * w} ${bot - 38} ${22 * w} ${bot - 24}`} />
          <path d={`M ${12 * w} ${bot - 46} Q ${34 * w} ${bot - 56} ${52 * w + belly * 0.6} ${bot - 40}`} />
          <path d={`M ${24 * w} ${top + 74} q ${10 * w} 14 ${4 * w} 30`} />
        </g>
        {look.outfit === "apron" && (
          <g>
            <path d={`M ${-30 * w} ${top + 70} L ${60 * w} ${top + 70} L ${70 * w + belly * 0.6} ${bot + 10} L ${-40 * w} ${bot + 10} Z`} fill={look.apron} stroke={OUT} strokeWidth={4} />
            <rect x={-4 * w} y={top + 150} width={44} height={36} rx={6} fill="none" stroke={OUT} strokeWidth={3.5} />
          </g>
        )}
      </g>
      <path d={d} fill="none" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      {/* kaos oversize: gambar dada sederhana, TANPA teks */}
      {look.outfit === "tee" && look.graphic === "star" && (
        <path transform={`translate(${22 * w} ${top + 108}) scale(1.5)`} d="M 0 -22 L 6 -7 L 22 -7 L 9 3 L 14 19 L 0 9 L -14 19 L -9 3 L -22 -7 L -6 -7 Z" fill={look.motif} stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
      )}
      {look.outfit === "tee" && look.graphic === "wave" && (
        <g transform={`translate(${22 * w} ${top + 104})`} stroke={OUT} strokeWidth={3}>
          <circle r={34} fill={look.motif} /><path d="M -30 8 q 15 -14 30 0 t 30 0" fill="none" stroke={look.accent} strokeWidth={7} strokeLinecap="round" />
        </g>
      )}
      {look.outfit === "jersey" && (
        <g>
          <path d={`M -26 ${top - 2} L 10 ${top + 46} L 46 ${top - 2}`} fill="none" stroke={look.motif} strokeWidth={10} strokeLinejoin="round" />
          <circle cx={46 * w} cy={top + 74} r={12} fill={look.motif} stroke={OUT} strokeWidth={3} />
          <rect x={-40 * w} y={top + 112} width={32} height={24} rx={4} fill={look.motif} opacity={0.9} />
        </g>
      )}
      {look.outfit === "hoodie" && (
        <g stroke={OUT} strokeWidth={4} strokeLinejoin="round">
          <path d={`M ${-34 * w} ${bot - 92} L ${54 * w} ${bot - 92} L ${64 * w} ${bot - 22} L ${-44 * w} ${bot - 22} Z`} fill={look.shirtShade} />
          <path d={`M -2 ${top + 14} L -6 ${top + 96} M 26 ${top + 14} L 30 ${top + 92}`} fill="none" stroke="#fbfbf7" strokeWidth={6} strokeLinecap="round" />
          <rect x={-64 * w} y={bot - 22} width={130 * w + belly * 0.4} height={22} fill={look.shirtShade} />
        </g>
      )}
      {look.outfit === "casual" && (
        <g stroke={OUT} strokeWidth={5} fill="none"><path d={`M ${-20 * w} ${top + 4} L ${-14 * w} ${bot}`} /><path d={`M ${30 * w} ${top + 4} L ${36 * w} ${bot}`} /></g>
      )}
      {shirtCollar && (
        <g>
          <path d={`M ${14 * w} ${top + 18} L ${16 * w} ${bot - 4}`} stroke={line} strokeWidth={4} />
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={20 * w} cy={top + 46 + i * 46} r={4} fill={look.pattern !== "none" ? "#f3e2c0" : "#c9ccd4"} />)}
        </g>
      )}
      {look.collar === "polo" && [0, 1].map((i) => <circle key={i} cx={14} cy={top + 30 + i * 22} r={4} fill="#f3f3f3" stroke={OUT} strokeWidth={2} />)}
      {look.collar === "zip" && (
        <g>
          <path d={`M ${14 * w} ${top + 4} L ${16 * w} ${bot - 2}`} stroke="#d9d9d9" strokeWidth={5} />
          <rect x={10 * w} y={top + 60} width={12} height={20} rx={3} fill="#d9d9d9" stroke={OUT} strokeWidth={3} />
        </g>
      )}
      {pocket && (
        <path d={`M ${30 * w} ${top + 58} L ${62 * w} ${top + 58} L ${62 * w} ${top + 98} Q ${46 * w} ${top + 106} ${30 * w} ${top + 98} Z`} fill="none" stroke={look.pattern !== "none" ? look.shirtShade : "#b9bcc6"} strokeWidth={4} />
      )}
      {look.badge === "osis" && (
        <g transform={`translate(${46 * w} ${top + 44})`}>
          <path d="M 0 -11 L 10 -4 L 7 9 L -7 9 L -10 -4 Z" fill="#e7b416" stroke={OUT} strokeWidth={3} />
          <circle r={3.5} fill={look.outfit === "smp" ? "#1f2f5c" : "#7a4b12"} />
        </g>
      )}
      {look.badge === "nametag" && (
        <g transform={`translate(${-34 * w} ${top + 60})`}>
          <rect x={-22} y={-8} width={44} height={16} rx={3} fill="#1b1b1b" />
          <rect x={-16} y={-2} width={32} height={4} fill="#fff" />
        </g>
      )}
      {look.badge === "security" && (
        <g>
          <path transform={`translate(${46 * w} ${top + 44})`} d="M -12 -14 L 12 -14 L 12 2 Q 12 14 0 18 Q -12 14 -12 2 Z" fill="#e7b416" stroke={OUT} strokeWidth={3} />
          <rect x={-60 * w} y={top + 2} width={46} height={14} rx={4} fill={look.bottom} stroke={OUT} strokeWidth={3} transform={`rotate(8 ${-37 * w} ${top + 9})`} />
          <rect x={-34 * w} y={top + 58} width={44} height={14} rx={3} fill="#1b1b1b" />
        </g>
      )}
      {/* collars */}
      {(shirtCollar || look.collar === "open") && (
        <g>
          <path d={`M ${-30} ${top - 2} L ${-6} ${top + 34} L ${12} ${top + 4} Z`} fill={look.shirt} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
          <path d={`M ${46} ${top - 2} L ${26} ${top + 36} L ${12} ${top + 4} Z`} fill={look.shirt} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
        </g>
      )}
      {look.collar === "polo" && (
        <g>
          <path d={`M ${-30} ${top - 2} L ${-4} ${top + 24} L ${12} ${top + 6} Z`} fill={look.shirtShade} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
          <path d={`M ${46} ${top - 2} L ${28} ${top + 26} L ${12} ${top + 6} Z`} fill={look.shirtShade} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
        </g>
      )}
      {(look.collar === "round" || look.collar === "hood") && <path d={`M -26 ${top - 2} Q 10 ${top + 26} 46 ${top - 2}`} fill={look.skinShade} stroke={OUT} strokeWidth={5} />}
      {look.collar === "vneck" && <path d={`M -22 ${top - 2} L 10 ${top + 38} L 42 ${top - 2} Z`} fill={look.skinShade} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />}
      {look.collar === "zip" && <path d={`M -30 ${top - 14} L 48 ${top - 14} L 46 ${top + 12} L -28 ${top + 12} Z`} fill={look.shirt} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />}
      {look.outfit === "blouse" && <circle cx={10} cy={top + 22} r={9} fill="#e7c86b" stroke={OUT} strokeWidth={3} />}
      {look.tucked && <rect x={-64 * w} y={bot - 22} width={130 * w + belly * 0.4} height={20} fill="#2b2b2b" stroke={OUT} strokeWidth={4} />}
      {look.tucked && <rect x={12 * w} y={bot - 24} width={22} height={24} fill="#c7c7c7" stroke={OUT} strokeWidth={4} />}
      {look.outfit === "security" && (
        <g stroke={OUT} strokeWidth={4}>
          <rect x={-56 * w} y={bot - 30} width={18} height={60} rx={6} fill="#222" transform={`rotate(12 ${-47 * w} ${bot})`} />
          <rect x={56 * w} y={bot - 40} width={20} height={34} rx={4} fill="#333" />
          <rect x={62 * w} y={bot - 54} width={4} height={16} fill="#333" />
        </g>
      )}
      {look.accessories.includes("whistle") && (
        <g>
          <path d={`M -20 ${top - 4} Q 10 ${top + 100} 44 ${top - 4}`} fill="none" stroke="#e63946" strokeWidth={5} />
          <rect x={4} y={top + 82} width={30} height={16} rx={7} fill="#d9d9d9" stroke={OUT} strokeWidth={4} />
        </g>
      )}
    </g>
  );
};

/* ------------------------------ hair styles ----------------------------- */
const SpikyHair: React.FC<{ color: string; t: number }> = ({ color, t }) => {
  const sway = Math.sin(t * 2.4) * 2;
  return (
    <g>
      <path d="M -104 -120 Q -118 -230 -40 -268 Q 60 -300 118 -228 L 104 -190 Q 20 -210 -60 -170 Q -88 -150 -92 -96 Z" fill={color} />
      <path
        d={`M -104 -96 L -142 -138 L -110 -160 L -150 -214 L -92 -222 L -104 -286 L -40 -258 L ${-18 + sway} -326 L 30 -276
            L ${86 + sway} -312 L 92 -252 L ${158 + sway} -262 L 128 -210 L 160 -184 L 112 -178 L 126 -150
            L 86 -170 L 70 -150 L 52 -184 L 26 -162 L 4 -192 L -22 -166 L -44 -186 L -66 -140 L -86 -134 Z`}
        fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round"
      />
    </g>
  );
};

const BuzzHair: React.FC<{ color: string }> = ({ color }) => (
  <g>
    <path d="M -104 -112 Q -118 -246 10 -270 Q 112 -276 128 -196 Q 90 -214 40 -206 Q -20 -204 -60 -176 Q -84 -150 -88 -108 Z"
      fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    {[[-60, -230], [-30, -248], [10, -252], [50, -244], [86, -228], [-80, -190], [-40, -214]].map(([x, y], i) => (
      <path key={i} d={`M ${x} ${y} l 6 -4`} stroke="#4c3b2d" strokeWidth={4} strokeLinecap="round" />
    ))}
  </g>
);

const PartedHair: React.FC<{ color: string }> = ({ color }) => (
  <g>
    <path d="M -106 -100 Q -120 -250 0 -272 Q 110 -282 132 -196 Q 104 -226 56 -230 Q 70 -214 64 -206 Q 6 -230 -50 -196 Q -80 -170 -86 -104 Z"
      fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    {/* side part + grey streaks */}
    <path d="M -10 -270 Q 30 -250 56 -230" fill="none" stroke="#6d6863" strokeWidth={5} strokeLinecap="round" />
    <path d="M -96 -150 Q -92 -190 -70 -214" fill="none" stroke="#a9a49d" strokeWidth={7} strokeLinecap="round" />
    <path d="M -86 -120 Q -84 -150 -70 -170" fill="none" stroke="#a9a49d" strokeWidth={6} strokeLinecap="round" />
  </g>
);

const PonytailBack: React.FC<{ color: string; accent: string; t: number }> = ({ color, accent, t }) => {
  const swing = Math.sin(t * 3) * 6;
  return (
    <g transform={`rotate(${swing} -110 -210)`}>
      <path d="M -100 -230 Q -190 -220 -180 -120 Q -176 -60 -140 -30 Q -150 -90 -130 -140 Q -112 -180 -96 -196 Z" fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <rect x={-118} y={-228} width={26} height={30} rx={8} fill={accent} stroke={OUT} strokeWidth={5} transform="rotate(-20 -105 -213)" />
    </g>
  );
};
const PonytailFront: React.FC<{ color: string; accent: string }> = ({ color, accent }) => (
  <g>
    <path d="M -104 -110 Q -118 -250 0 -276 Q 110 -284 134 -196 L 118 -184 L 104 -206 L 92 -180 L 74 -208 L 58 -182 L 40 -212 L 22 -186 Q -30 -200 -70 -176 Q -90 -150 -90 -106 Z"
      fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    {/* star hair clip */}
    <path transform="translate(-36 -214) scale(0.9)" d="M 0 -16 L 5 -5 L 16 -4 L 8 4 L 10 15 L 0 9 L -10 15 L -8 4 L -16 -4 L -5 -5 Z" fill={accent} stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

const BunHair: React.FC<{ color: string }> = ({ color }) => (
  <g>
    <circle cx={-96} cy={-226} r={46} fill={color} stroke={OUT} strokeWidth={SW} />
    <path d="M -116 -246 Q -96 -262 -76 -244" fill="none" stroke="#5a504a" strokeWidth={4} />
    <path d="M -104 -110 Q -118 -258 10 -276 Q 120 -280 134 -196 Q 90 -238 30 -232 Q -40 -224 -76 -176 Q -92 -150 -90 -104 Z" fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M -20 -266 Q 40 -250 96 -232" fill="none" stroke="#5a504a" strokeWidth={4} strokeLinecap="round" />
  </g>
);
const LongHairBack: React.FC<{ color: string; t: number }> = ({ color, t }) => {
  const sw = Math.sin(t * 2) * 3;
  return <path d={`M -112 -180 Q -150 -60 ${-130 + sw} 40 L ${-30 + sw} 50 Q -20 -40 -40 -120 Z`} fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />;
};
const LongHairFront: React.FC<{ color: string; accent: string; bow: boolean }> = ({ color, accent, bow }) => (
  <g>
    <path d="M -108 -100 Q -124 -262 10 -282 Q 120 -288 138 -196 L 124 -190 Q 112 -196 100 -188 L 92 -200 L 70 -190 L 60 -202 L 40 -190 L 30 -204 L 8 -192 Q -40 -196 -70 -170 Q -92 -140 -94 -96 Z"
      fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    {bow && (
      <g transform="translate(-60 -252) rotate(-20)">
        <path d="M 0 0 L -38 -22 L -38 22 Z M 0 0 L 38 -22 L 38 22 Z" fill={accent} stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
        <circle r={10} fill={accent} stroke={OUT} strokeWidth={4} />
      </g>
    )}
  </g>
);
const QuiffHair: React.FC<{ color: string; t: number }> = ({ color, t }) => (
  <g>
    {/* faded undercut sides */}
    <path d="M -104 -112 Q -114 -226 -40 -250 L 124 -236 Q 134 -216 130 -198 Q 70 -212 10 -204 Q -50 -194 -80 -160 Q -92 -140 -90 -108 Z"
      fill="#5b5866" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    {/* tall pompadour */}
    <path d={`M -70 -236 Q -60 -310 40 ${-338 + Math.sin(t * 2) * 2} Q 150 -346 176 -282 Q 182 -246 150 -236 Q 130 -262 96 -250 Q 60 -266 20 -244 Q -20 -254 -70 -236 Z`}
      fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M -10 -300 Q 60 -330 140 -306" fill="none" stroke="#4a4660" strokeWidth={6} strokeLinecap="round" />
    <path d="M 30 -270 Q 90 -296 150 -276" fill="none" stroke="#4a4660" strokeWidth={5} strokeLinecap="round" />
  </g>
);
const SecurityCap: React.FC<{ color: string; hair: string }> = ({ color, hair }) => (
  <g>
    <path d="M -96 -150 Q -100 -120 -90 -100 L -76 -104 Q -84 -130 -78 -160 Z" fill={hair} stroke={OUT} strokeWidth={4} />
    <path d="M -110 -196 Q -116 -290 20 -298 Q 132 -296 140 -214 Z" fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M -112 -198 L 142 -214 L 140 -196 L -110 -180 Z" fill="#111" stroke={OUT} strokeWidth={4} />
    <path d="M 100 -206 Q 170 -212 196 -190 Q 160 -186 104 -190 Z" fill="#111" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
    <path transform="translate(40 -248)" d="M -16 -18 L 16 -18 L 16 4 Q 16 16 0 22 Q -16 16 -16 4 Z" fill="#e7b416" stroke={OUT} strokeWidth={4} />
  </g>
);
const BaldingHair: React.FC<{ color: string }> = ({ color }) => (
  <g>
    <path d="M -102 -100 Q -116 -190 -64 -232 Q -40 -214 -54 -170 Q -78 -140 -84 -98 Z" fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M 0 -262 Q 50 -276 90 -252" fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.55} />
    <path d="M 104 -186 Q 124 -196 134 -180" fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />
  </g>
);
const BobBack: React.FC<{ color: string }> = ({ color }) => (
  <path d="M -112 -190 Q -140 -80 -110 -30 L -20 -30 Q -40 -110 -50 -170 Z" fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
);
const BobFront: React.FC<{ color: string }> = ({ color }) => (
  <path d="M -108 -96 Q -126 -266 10 -284 Q 126 -290 142 -186 Q 132 -150 128 -120 Q 112 -172 70 -206 Q 20 -186 -40 -196 Q -78 -160 -86 -90 Z"
    fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
);
const CurlyHair: React.FC<{ color: string }> = ({ color }) => {
  const pts: [number, number, number][] = [[-110, -150, 34], [-112, -200, 36], [-84, -246, 38], [-36, -276, 38], [20, -288, 38], [76, -276, 36], [118, -240, 34], [136, -196, 28], [-60, -210, 30], [10, -238, 32], [70, -224, 28]];
  return (
    <g>
      {pts.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={color} stroke={OUT} strokeWidth={5} />)}
      {pts.map(([x, y, r], i) => <circle key={`f${i}`} cx={x} cy={y} r={r - 5} fill={color} />)}
      {pts.slice(0, 8).map(([x, y], i) => <path key={`c${i}`} d={`M ${x - 10} ${y} q 10 -12 20 0`} fill="none" stroke="#3a322d" strokeWidth={4} />)}
    </g>
  );
};
const MessyHair: React.FC<{ color: string; t: number }> = ({ color, t }) => (
  <path
    d={`M -104 -100 L -128 -150 L -104 -170 L -122 -222 L -70 -236 L -60 -282 L -10 -264 L ${30 + Math.sin(t * 3) * 3} -300 L 52 -262
        L 104 -270 L 104 -232 L 146 -216 L 112 -196 L 120 -176 L 84 -186 L 66 -168 L 50 -194 L 20 -176 L -6 -196 L -36 -170 L -64 -184 L -80 -140 Z`}
    fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
);

const HijabBack: React.FC<{ look: Look }> = ({ look }) => (
  <g>
    <path d="M -120 -150 C -128 -300 70 -330 146 -232 C 172 -190 166 -120 150 -60 C 160 -10 150 60 120 120 L -112 120 C -148 40 -124 -60 -120 -150 Z"
      fill={look.hijab} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M -112 120 C -130 50 -118 -40 -110 -120 C -96 -40 -90 40 -70 120 Z" fill={look.hijabShade} />
    <path d="M 0 40 Q 50 70 120 60" fill="none" stroke={look.hijabShade} strokeWidth={6} strokeLinecap="round" />
  </g>
);
const HijabFront: React.FC<{ look: Look }> = ({ look }) => (
  <g>
    <path d="M -104 -150 C -110 -268 50 -298 124 -226 C 134 -214 140 -200 142 -184 C 90 -236 0 -244 -56 -206 C -80 -190 -96 -172 -104 -150 Z"
      fill={look.hijab} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    {/* brooch */}
    <circle cx={52} cy={10} r={11} fill={look.accent} stroke={OUT} strokeWidth={4} />
    <circle cx={49} cy={7} r={3.5} fill="#fff" opacity={0.8} />
  </g>
);

/* ------------------------------ head ------------------------------------ */
export const Head: React.FC<{ id: CharId; look: Look; t: number; emotion: Emotion; viseme: string | null; blink: boolean; lookDir: [number, number]; since: number }> = ({ id, look, t, emotion, viseme, blink, lookDir, since }) => {
  const { eye, brow } = eyesFor(emotion);
  const eyeState = blink && eye !== "happy" ? "closed" : eye;
  const { shape, intensity } = pickMouth(viseme as never, emotion);
  const face = "M -100 -150 C -100 -250 40 -282 112 -222 C 142 -192 142 -112 124 -64 C 104 -16 42 0 -8 -8 C -70 -20 -100 -80 -100 -150 Z";
  const jitter = emotion === "shock" && since < 1.2 ? Math.sin(t * 70) * 1.6 : 0;
  const hijab = look.hairStyle === "hijab";
  const blushHi = emotion === "embarrassed" || emotion === "pleading";
  const browY = hijab ? 4 : look.glasses ? -6 : 0;
  return (
    <g>
      {hijab && <HijabBack look={look} />}
      {look.hairStyle === "ponytail" && <PonytailBack color={look.hair} accent={look.accent} t={t} />}
      {look.hairStyle === "long" && <LongHairBack color={look.hair} t={t} />}
      {look.hairStyle === "bob" && <BobBack color={look.hair} />}
      {!hijab && look.hairStyle !== "long" && look.hairStyle !== "bob" && (
        <g transform="translate(-86 -128)">
          <ellipse rx={22} ry={30} fill={look.skin} stroke={OUT} strokeWidth={SW} />
          <path d="M -4 -12 Q 8 0 -4 12" fill="none" stroke={OUT} strokeWidth={4} strokeLinecap="round" />
        </g>
      )}
      <path d={face} fill={look.skin} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M -60 -36 C -20 -6 50 -6 100 -40 C 80 -6 30 4 -8 -2 C -36 -8 -52 -20 -60 -36 Z" fill={look.skinShade} opacity={0.7} />
      {look.hairStyle !== "balding" && <ellipse cx={24} cy={hijab ? -226 : -218} rx={104} ry={20} fill={look.skinShade} opacity={0.6} />}
      <path d="M 96 -110 Q 104 -100 96 -96" fill="none" stroke={look.skinShade} strokeWidth={7} strokeLinecap="round" />
      {look.age >= 40 && (
        <g stroke={look.skinShade} strokeWidth={4} strokeLinecap="round" fill="none">
          <path d="M 20 -232 Q 60 -240 96 -226" /><path d="M 30 -218 Q 62 -224 90 -214" />
          <path d="M 96 -168 q 10 4 14 14" />
        </g>
      )}
      <ellipse cx={106} cy={-94} rx={16} ry={9} fill="#ff7f7f" opacity={blushHi ? 0.65 : look.lashes ? 0.4 : 0.28} />
      <ellipse cx={-18} cy={-96} rx={14} ry={8} fill="#ff7f7f" opacity={blushHi ? 0.6 : look.lashes ? 0.35 : 0.25} />
      <g transform={`translate(${jitter} 0)`}>
        <Eye id={`${id}-eb`} cx={4} cy={-146} rx={18 * ST.eyeScale} ry={25 * ST.eyeScale} state={eyeState} look={lookDir} lid={look.skin} />
        <Eye id={`${id}-ef`} cx={72} cy={-146} rx={21 * ST.eyeScale} ry={27 * ST.eyeScale} state={eyeState} look={lookDir} lid={look.skin} />
        {look.lashes && eyeState !== "happy" && (
          <g stroke={OUT} strokeWidth={4.5} strokeLinecap="round">
            <path d={`M 92 ${eyeState === "closed" ? -142 : -164} l 12 -8`} /><path d={`M 94 ${eyeState === "closed" ? -138 : -154} l 13 -2`} />
            <path d={`M 20 ${eyeState === "closed" ? -142 : -162} l 10 -8`} />
          </g>
        )}
        {look.glasses && look.glassesStyle === "round" && (
          <g fill="none" stroke={OUT} strokeWidth={6}>
            <circle cx={4} cy={-146} r={34} fill="#cfe9ff" fillOpacity={0.18} />
            <circle cx={74} cy={-146} r={38} fill="#cfe9ff" fillOpacity={0.18} />
            <path d="M 38 -150 Q 40 -158 36 -150" />
            <path d="M -30 -150 L -80 -140" />
            <path d="M 52 -168 L 64 -176" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
        {look.glasses && look.glassesStyle === "rect" && (
          <g fill="#cfe9ff" fillOpacity={0.18} stroke={OUT} strokeWidth={6}>
            <rect x={-28} y={-170} width={62} height={46} rx={8} />
            <rect x={40} y={-172} width={70} height={50} rx={8} />
            <path d="M 34 -150 L 40 -150" fill="none" /><path d="M -28 -150 L -80 -140" fill="none" />
          </g>
        )}
        {look.glasses && look.glassesStyle === "cateye" && (
          <g fill="#ffe3e3" fillOpacity={0.2} stroke={look.accent} strokeWidth={7} strokeLinejoin="round">
            <path d="M -30 -164 L 34 -170 L 30 -136 Q 2 -120 -24 -134 Z" />
            <path d="M 40 -172 L 118 -180 L 108 -138 Q 76 -118 46 -136 Z" />
            <path d="M -30 -150 L -80 -140" fill="none" stroke={OUT} strokeWidth={5} />
          </g>
        )}
        <Brow cx={2} cy={-190 + browY} w={40} state={brow} side={-1} thick={look.browThick} />
        <Brow cx={74} cy={-192 + browY} w={48} state={brow} side={1} thick={look.browThick} />
      </g>
      <path d="M 104 -126 Q 118 -108 100 -104" fill="none" stroke={OUT} strokeWidth={5} strokeLinecap="round" />
      <g transform="translate(76 -64)"><Mouth shape={shape} intensity={intensity} /></g>
      {look.mustache && look.mustacheStyle === "thick" && (
        <path d="M 40 -84 Q 60 -100 80 -90 Q 100 -102 120 -86 Q 108 -72 84 -80 Q 64 -70 40 -84 Z" fill={look.hair} stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      )}
      {look.mustache && look.mustacheStyle === "thin" && (
        <path d="M 48 -84 Q 80 -96 112 -84" fill="none" stroke={look.hair} strokeWidth={7} strokeLinecap="round" />
      )}
      <defs>
        <filter id="sheenblur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation={2.2} /></filter>
        <filter id="towhite"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" /></filter>
        <mask id={`hairm-${id}`} maskUnits="userSpaceOnUse" x={-300} y={-500} width={600} height={700}><g filter="url(#towhite)"><use href={`#hairg-${id}`} /></g></mask>
      </defs>
      <g id={`hairg-${id}`}>
      {look.hairStyle === "spiky" && <SpikyHair color={look.hair} t={t} />}
      {look.hairStyle === "buzz" && <BuzzHair color={look.hair} />}
      {look.hairStyle === "parted" && <PartedHair color={look.hair} />}
      {look.hairStyle === "ponytail" && <PonytailFront color={look.hair} accent={look.accent} />}
      {look.hairStyle === "bun" && <BunHair color={look.hair} />}
      {look.hairStyle === "long" && <LongHairFront color={look.hair} accent={look.accent} bow={look.accessories.includes("bow")} />}
      {look.hairStyle === "quiff" && <QuiffHair color={look.hair} t={t} />}
      {look.hairStyle === "cap" && <SecurityCap color={look.bottom} hair={look.hair} />}
      {look.hairStyle === "balding" && <BaldingHair color={look.hair} />}
      {look.hairStyle === "bob" && <BobFront color={look.hair} />}
      {look.hairStyle === "curly" && <CurlyHair color={look.hair} />}
      {look.hairStyle === "messy" && <MessyHair color={look.hair} t={t} />}
      {hijab && <HijabFront look={look} />}
      </g>
      <g mask={`url(#hairm-${id})`} fill="none" strokeLinecap="round">
        <path d={hijab ? "M -70 -250 Q 10 -300 110 -262" : "M -58 -238 Q 18 -270 110 -242"} stroke="#fff" strokeWidth={hijab ? 14 : 8} strokeDasharray={hijab ? undefined : "22 10 8 12"} opacity={hijab ? 0.2 : 0.5} filter="url(#sheenblur)" />
        {!hijab && look.hairStyle !== "cap" && [-60, -26, 10, 46, 84].map((x) => <path key={x} d={`M ${x} -280 Q ${x + 12} -246 ${x - 2} -206`} stroke="#000" strokeWidth={3} opacity={0.22} />)}
        {hijab && [-40, 20, 80].map((x) => <path key={x} d={`M ${x} -300 Q ${x - 30} -200 ${x - 20} -110`} stroke="#000" strokeWidth={4} opacity={0.12} />)}
      </g>
      {look.accessories.includes("pencil") && (
        <g transform="translate(-70 -214) rotate(-60)">
          <rect x={-6} y={-40} width={12} height={70} fill="#ffd23f" stroke={OUT} strokeWidth={4} />
          <path d="M -6 30 L 0 44 L 6 30 Z" fill="#f4c99e" stroke={OUT} strokeWidth={3} />
        </g>
      )}
      {look.bandaid && (
        <g transform="translate(-30 -88) rotate(-18)">
          <rect x={-22} y={-9} width={44} height={18} rx={8} fill="#f3d2a8" stroke={OUT} strokeWidth={4} />
          <rect x={-7} y={-9} width={14} height={18} fill="#e9bf8e" stroke={OUT} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

/* ------------------------------ FX on character ------------------------- */
const SweatDrop: React.FC<{ t: number }> = ({ t }) => {
  const y = (t * 40) % 40;
  return <path transform={`translate(-70 ${-230 + y})`} d="M 0 -26 Q 16 0 0 12 Q -16 0 0 -26 Z" fill="#8fd3ff" stroke={OUT} strokeWidth={4} />;
};
const ShockMarks: React.FC = () => (
  <g stroke={OUT} strokeWidth={7} strokeLinecap="round">
    <path d="M -40 -330 L -60 -380" /><path d="M 20 -345 L 22 -400" /><path d="M 80 -330 L 106 -378" />
  </g>
);
const Gloom: React.FC = () => (
  <g stroke="#5b4b8a" strokeWidth={5} opacity={0.75}>
    {[-80, -50, -20, 10, 40, 70].map((x) => <line key={x} x1={x} y1={-310} x2={x} y2={-200} />)}
  </g>
);
const HeadFx: React.FC<{ emotion: Emotion; t: number; since: number }> = ({ emotion, t, since }) => (
  <>
    {emotion === "embarrassed" && <SweatDrop t={t} />}
    {emotion === "shock" && since < 1.6 && <ShockMarks />}
    {emotion === "defeated" && <Gloom />}
  </>
);

/** Head-only portrait (expression / mouth charts). Origin = neck pivot. */
export const Portrait: React.FC<{ id: CharId; emotion: Emotion; viseme?: Viseme | null; eyesClosed?: boolean }> = ({ id, emotion, viseme = null, eyesClosed }) => (
  <g>
    <Head id={id} look={LOOKS[id]} t={0} emotion={emotion} viseme={viseme} blink={!!eyesClosed} lookDir={emotion === "shock" ? [0.1, 0] : [0.6, 0]} since={0} />
    <HeadFx emotion={emotion} t={0.4} since={0} />
  </g>
);

/** Fixed pose for model sheets (bypasses the timeline). */
export interface Force { emotion?: Emotion; action?: Action; viseme?: Viseme | null; noFx?: boolean }

/* ------------------------------ Character ------------------------------- */
export const Character: React.FC<{ id: CharId; x: number; y: number; facing: 1 | -1; frame: number; scale?: number; force?: Force; walk?: number; wear?: Wear; held?: { front?: string; back?: string }; bag?: boolean; hat?: boolean }> = ({ id, x, y, facing, frame, scale = 1, force, walk, wear = "seragam", held, bag, hat }) => {
  const t = frame / FPS;
  const look = lookFor(id, wear);
  const st = force
    ? { emotion: force.emotion ?? "neutral", action: force.action ?? "idle", since: 2, line: null }
    : stateAt(id, t);
  const prev = force ? st : stateAt(id, Math.max(0, t - st.since - 1 / FPS));
  const k = ease(st.since / 0.28);
  const sameScene = !!force || sceneAt(t).id === sceneAt(Math.max(0, t - st.since - 1 / FPS)).id; // hard cut: no pose blend across scenes
  let pose = mixPose(POSES[prev.action], POSES[st.action], sameScene && st.since > 0 && prev.action !== st.action ? k : 1);

  const viseme = force ? force.viseme ?? null : visemeAt(id, t);
  const open = viseme ? OPEN[viseme] ?? 0 : 0;
  const speaking = viseme !== null;
  const phase = (CHAR_IDS.indexOf(id) * 1.7) % 6.28;

  if (st.action === "gesture" && speaking) {
    pose = { ...pose, front: [pose.front[0] + Math.sin(t * 5 + phase) * 10, pose.front[1] + Math.sin(t * 7) * 12] };
  }
  if (walk !== undefined) pose = { ...pose, front: [pose.front[0] - Math.sin(walk) * 22, pose.front[1]], back: [pose.back[0] + Math.sin(walk) * 22, pose.back[1]] };
  if (st.action === "sweep") { const w = Math.sin(t * 5); pose = { ...pose, front: [pose.front[0] + w * 10, pose.front[1]], back: [pose.back[0] + w * 10, pose.back[1]] }; }
  if (st.action === "erase") { const w = Math.sin(t * 9); pose = { ...pose, front: [pose.front[0] + w * 14, pose.front[1] + Math.cos(t * 9) * 12] }; }
  if (st.action === "shoot") { const w = Math.max(0, Math.sin(t * 3)); pose = { ...pose, front: [pose.front[0] + w * 14, pose.front[1]], back: [pose.back[0] + w * 14, pose.back[1]] }; }
  if (st.action === "pull") { const w = Math.sin(t * 4.2); pose = { ...pose, front: [pose.front[0] + w * 16, pose.front[1] + w * 22], back: [pose.back[0] - w * 16, pose.back[1] - w * 22] }; }
  if (st.action === "wave") pose = { ...pose, front: [pose.front[0] + Math.sin(t * 10) * 8, pose.front[1]] };

  const breathe = 1 + Math.sin(t * 2.3 + phase) * 0.012;
  const nod = Math.sin(t * 1.7 + phase) * 1.8 + (speaking ? -open * 4 + Math.sin(t * 9) * 1.2 : 0);
  let bodyY = 0, bodyX = 0, extraTilt = 0;
  if (st.emotion === "laugh") { bodyY = -Math.abs(Math.sin(t * 16)) * 10; extraTilt = Math.sin(t * 16) * 3; }
  if (st.emotion === "shock" && st.since < 0.5) bodyY = -Math.sin((st.since / 0.5) * Math.PI) * 50;
  if (st.emotion === "shock") bodyX = Math.sin(t * 60) * (st.since < 1.2 ? 3 : 0.8);
  if (st.emotion === "surprised" && st.since < 0.4) bodyY = -Math.sin((st.since / 0.4) * Math.PI) * 18;
  if (walk !== undefined) bodyY -= Math.abs(Math.sin(walk)) * 9;
  if (!speaking && st.emotion === "neutral") extraTilt += Math.max(0, Math.sin(t * 3.2 + phase)) * 3;

  const blink = !force && isBlinking(id, t) && st.emotion !== "shock";
  const crouch = pose.crouch;
  const frontShoulder: [number, number] = [52 * look.bodyW, -438 + crouch];
  const backShoulder: [number, number] = [-50 * look.bodyW, -440 + crouch];
  const s = scale * look.height;

  return (
    <g transform={`translate(${x + bodyX} ${y + bodyY}) scale(${facing * s} ${s})`}>
      <ellipse cx={0} cy={2} rx={120 * look.bodyW} ry={16} fill="#000" opacity={0.18} transform={`scale(${1 + bodyY / 400} 1)`} />
      <g transform={`rotate(${pose.lean} 0 0)`}>
        {bag && <BackpackBack color={bagColor(CHAR_IDS.indexOf(id) * 3 + 1)} crouch={crouch} />}
        <Arm sx={backShoulder[0]} sy={backShoulder[1]} pose={pose.back} look={look} shade hand={pose.hands[1]} t={t} item={held?.back} />
        <Lower look={look} crouch={crouch} walk={walk} />
        <g transform={`translate(0 ${-240 + crouch}) scale(1 ${breathe}) translate(0 ${240 - crouch})`}>
          <Torso look={look} crouch={crouch} />
        </g>
        {bag && <BackpackStraps color={bagColor(CHAR_IDS.indexOf(id) * 3 + 1)} bodyW={look.bodyW} crouch={crouch} />}
        <rect x={-18} y={-488 + crouch} width={40} height={40} fill={look.skinShade} stroke={OUT} strokeWidth={SW} />
        {look.accessories.includes("headset") && (
          <g>
            <path d={`M -50 ${-470 + crouch} Q 4 ${-410 + crouch} 60 ${-470 + crouch}`} fill="none" stroke="#222" strokeWidth={12} strokeLinecap="round" />
            <ellipse cx={-50} cy={-466 + crouch} rx={20} ry={26} fill={look.accent} stroke={OUT} strokeWidth={5} />
            <ellipse cx={60} cy={-466 + crouch} rx={20} ry={26} fill={look.accent} stroke={OUT} strokeWidth={5} />
          </g>
        )}
        <g transform={`translate(4 ${-468 + crouch}) rotate(${pose.head + nod + extraTilt}) scale(${ST.headScale})`}>
          <Head id={id} look={look} t={t} emotion={st.emotion} viseme={viseme} blink={blink} lookDir={pose.look} since={st.since} />
          {hat && look.hairStyle !== "hijab" && <UpacaraCap />}
          {!force?.noFx && <HeadFx emotion={st.emotion} t={t} since={force ? 0 : st.since} />}
        </g>
        <Arm sx={frontShoulder[0]} sy={frontShoulder[1]} pose={pose.front} look={look} hand={pose.hands[0]} t={t} front item={held?.front}
          flash={!force && st.action === "photo" && st.since > 0.35 && st.since < 0.6 ? 1 - (st.since - 0.35) / 0.25 : 0} />
      </g>
    </g>
  );
};
