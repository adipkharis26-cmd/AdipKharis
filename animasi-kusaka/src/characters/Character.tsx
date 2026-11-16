import React from "react";
import { random } from "remotion";
import canon from "./canon.json";
import { Action, CharId, Emotion, FPS, TOTAL_SECONDS, Viseme, stateAt, visemeAt } from "../lib/timeline";
import { Mouth, pickMouth } from "./Mouth";
import { Brow, Eye, eyesFor } from "./Eyes";
import { Hand, HandShape } from "./Hands";

/* ------------------------------------------------------------------------------------------
 * Layered 2D character rig (SVG). Origin = between the feet, character faces +x.
 * Layer order (back → front): back arm, legs/skirt, torso, neck, head (hijab drape, ear,
 * face, eyes, brows, nose, mouth, hair, accessories), front arm, FX.
 * All designs come from canon.json (locked — see `npm run check:characters`).
 * ---------------------------------------------------------------------------------------- */

const OUT = "#1b1b1b";
const SW = 6;

type Hair = "spiky" | "buzz" | "hijab" | "ponytail" | "parted";
type Outfit = "sma" | "smaGirl" | "smp" | "teacher";
type Bottom = "pants" | "longSkirt" | "skirt";
export interface Look {
  skin: string; skinShade: string; hair: string; shirt: string; shirtShade: string; bottom: string; accent: string;
  hijab?: string; hijabShade?: string; motif?: string;
  bodyW: number; belly: number; browThick: number; height: number;
  hairStyle: Hair; glasses: boolean; bandaid: boolean; tucked: boolean; outfit: Outfit; bottomStyle: Bottom;
  sleeves: "short" | "long"; mustache: boolean; lashes: boolean; badge: "osis" | "nametag" | "none";
}
type CanonChar = (typeof canon.characters)[CharId];
const toLook = (c: CanonChar): Look => {
  const f = c.features as Record<string, unknown>;
  return Object.freeze({
    ...(c.palette as Record<string, string>), ...c.build,
    hairStyle: f.hair as Hair, glasses: !!f.glasses, bandaid: !!f.bandaid, tucked: !!f.tucked, outfit: f.outfit as Outfit,
    bottomStyle: f.bottom as Bottom, sleeves: f.sleeves as Look["sleeves"], mustache: !!f.mustache, lashes: !!f.lashes,
    badge: f.badge as Look["badge"],
  }) as Look;
};
export const CHAR_IDS = Object.keys(canon.characters) as CharId[];
export const LOOKS = Object.freeze(Object.fromEntries(CHAR_IDS.map((id) => [id, toLook(canon.characters[id])]))) as Record<CharId, Look>;

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

const Arm: React.FC<{ sx: number; sy: number; pose: ArmPose; look: Look; shade?: boolean; hand: HandShape; t: number }> = ({ sx, sy, pose, look, shade, hand, t }) => {
  const { ex, ey, hx, hy } = armPoints(sx, sy, pose);
  const skin = shade ? look.skinShade : look.skin;
  const cloth = shade ? look.shirtShade : look.shirt;
  const path = `M ${sx} ${sy} L ${ex} ${ey} L ${hx} ${hy}`;
  let handAngle = Math.atan2(hy - ey, hx - ex) * (180 / Math.PI);
  if (hand === "wave") handAngle += Math.sin(t * 12) * 18;
  // long sleeve covers the arm down to the wrist (cuff), short sleeve 62% of the upper arm
  const cuffX = ex + (hx - ex) * 0.86, cuffY = ey + (hy - ey) * 0.86;
  const sleevePath = look.sleeves === "long"
    ? `M ${sx} ${sy} L ${ex} ${ey} L ${cuffX} ${cuffY}`
    : `M ${sx} ${sy} L ${sx + (ex - sx) * 0.62} ${sy + (ey - sy) * 0.62}`;
  return (
    <g>
      <path d={path} stroke={OUT} strokeWidth={40} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} stroke={skin} strokeWidth={28} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={sleevePath} stroke={OUT} strokeWidth={look.sleeves === "long" ? 46 : 54} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={sleevePath} stroke={cloth} strokeWidth={look.sleeves === "long" ? 34 : 42} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {look.outfit === "teacher" && <path d={sleevePath} stroke={look.motif} strokeWidth={6} strokeDasharray="2 14" fill="none" strokeLinecap="round" opacity={shade ? 0.6 : 0.9} />}
      <g transform={`translate(${hx} ${hy}) rotate(${handAngle})`}><Hand shape={hand} skin={skin} /></g>
    </g>
  );
};

const Shoe: React.FC<{ x: number; color?: string }> = ({ x, color = "#222" }) => (
  <g>
    <path d={`M ${x - 30} -34 Q ${x - 30} -2 ${x - 10} 0 L ${x + 52} 0 Q ${x + 60} -22 ${x + 28} -34 Z`} fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    <path d={`M ${x - 26} -6 L ${x + 54} -6`} stroke="#eee" strokeWidth={5} />
  </g>
);

const Lower: React.FC<{ look: Look; crouch: number }> = ({ look, crouch }) => {
  const w = look.bodyW;
  const hipY = -240 + crouch;
  const shoeColor = look.outfit === "teacher" ? "#4a2c1a" : "#222";
  const shade = (c: string) => `color-mix(in srgb, ${c} 82%, black)`;
  if (look.bottomStyle === "pants") {
    const leg = (x: number, back: boolean) => (
      <g>
        <path d={`M ${x - 26 * w} ${hipY} L ${x - 24} -28 L ${x + 26} -28 L ${x + 26 * w} ${hipY} Z`}
          fill={back ? shade(look.bottom) : look.bottom} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
        <Shoe x={x} color={shoeColor} />
      </g>
    );
    return <g>{leg(-36 * w, true)}{leg(30 * w, false)}</g>;
  }
  const hem = look.bottomStyle === "longSkirt" ? -26 : -150;
  const flare = look.bottomStyle === "longSkirt" ? 96 : 84;
  return (
    <g>
      {look.bottomStyle === "skirt" && [-30 * w, 26 * w].map((x, i) => (
        <g key={i}>
          <rect x={x - 17} y={hem - 10} width={34} height={-hem - 20} fill={i ? look.skin : look.skinShade} stroke={OUT} strokeWidth={SW} />
          {/* long white school socks */}
          <rect x={x - 18} y={-110} width={36} height={84} fill="#fbfbf7" stroke={OUT} strokeWidth={5} />
        </g>
      ))}
      <Shoe x={-34 * w} color={shoeColor} />
      <Shoe x={28 * w} color={shoeColor} />
      <path d={`M ${-66 * w} ${hipY} L ${66 * w + look.belly * 0.3} ${hipY} L ${flare * w} ${hem} Q 0 ${hem + 10} ${-flare * w} ${hem} Z`}
        fill={look.bottom} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      {/* pleats */}
      {[-0.45, 0, 0.45].map((k) => <path key={k} d={`M ${k * 50 * w} ${hipY + 30} L ${k * flare * w * 0.9} ${hem - 4}`} stroke={shade(look.bottom)} strokeWidth={5} />)}
    </g>
  );
};

const Torso: React.FC<{ look: Look; crouch: number }> = ({ look, crouch }) => {
  const w = look.bodyW;
  const top = -462 + crouch, bot = -220 + crouch;
  const belly = look.belly;
  const d = `M ${-70 * w} ${top + 10} Q 0 ${top - 14} ${76 * w} ${top + 10} L ${70 * w + belly} ${top + 150}
             Q ${74 * w + belly} ${bot - 30} ${66 * w} ${bot} L ${-64 * w} ${bot} Q ${-72 * w} ${top + 120} ${-70 * w} ${top + 10} Z`;
  const clipId = `torso-${look.outfit}-${look.bodyW}-${look.belly}`;
  return (
    <g>
      <clipPath id={clipId}><path d={d} /></clipPath>
      <path d={d} fill={look.shirt} />
      <g clipPath={`url(#${clipId})`}>
        {look.outfit === "teacher" && (
          // batik kawung motif
          <g>
            {Array.from({ length: 7 }).map((_, r) => Array.from({ length: 6 }).map((__, c) => {
              const x = -90 + c * 36 + (r % 2) * 18, y = top + 10 + r * 36;
              return (
                <g key={`${r}-${c}`} transform={`translate(${x} ${y})`} fill={look.motif} opacity={0.9}>
                  <ellipse cx={0} cy={-7} rx={4.5} ry={7} /><ellipse cx={0} cy={7} rx={4.5} ry={7} />
                  <ellipse cx={-7} cy={0} rx={7} ry={4.5} /><ellipse cx={7} cy={0} rx={7} ry={4.5} />
                  <circle r={2.2} fill={look.shirtShade} />
                </g>
              );
            }))}
          </g>
        )}
        {/* cel shade on the back side */}
        <path d={`M ${-80 * w} ${top} L ${-40 * w} ${top} Q ${-48 * w} ${top + 110} ${-38 * w} ${bot + 4} L ${-80 * w} ${bot + 4} Z`} fill={look.shirtShade} opacity={look.outfit === "teacher" ? 0.55 : 1} />
      </g>
      <path d={d} fill="none" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      {/* button placket */}
      <path d={`M ${14 * w} ${top + 18} L ${16 * w} ${bot - 4}`} stroke={look.outfit === "teacher" ? look.shirtShade : "#c9ccd4"} strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={20 * w} cy={top + 46 + i * 46} r={4} fill={look.outfit === "teacher" ? "#f3e2c0" : "#c9ccd4"} />)}
      {/* chest pocket + badges */}
      {look.outfit !== "smaGirl" && (
        <path d={`M ${30 * w} ${top + 58} L ${62 * w} ${top + 58} L ${62 * w} ${top + 98} Q ${46 * w} ${top + 106} ${30 * w} ${top + 98} Z`} fill="none" stroke={look.outfit === "teacher" ? look.shirtShade : "#b9bcc6"} strokeWidth={4} />
      )}
      {look.badge === "osis" && (
        <g transform={`translate(${46 * w} ${top + 44})`}>
          <path d="M 0 -11 L 10 -4 L 7 9 L -7 9 L -10 -4 Z" fill={look.outfit === "smp" ? "#e7b416" : "#e7b416"} stroke={OUT} strokeWidth={3} />
          <circle r={3.5} fill={look.outfit === "smp" ? "#1f2f5c" : "#7a4b12"} />
        </g>
      )}
      {look.badge === "nametag" && (
        <g transform={`translate(${-34 * w} ${top + 60})`}>
          <rect x={-22} y={-8} width={44} height={16} rx={3} fill="#1b1b1b" />
          <rect x={-16} y={-2} width={32} height={4} fill="#fff" />
        </g>
      )}
      {/* collar */}
      <path d={`M ${-30} ${top - 2} L ${-6} ${top + 34} L ${12} ${top + 4} Z`} fill={look.shirt} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M ${46} ${top - 2} L ${26} ${top + 36} L ${12} ${top + 4} Z`} fill={look.shirt} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      {look.tucked && <rect x={-64 * w} y={bot - 22} width={130 * w + belly * 0.4} height={20} fill="#2b2b2b" stroke={OUT} strokeWidth={4} />}
      {look.tucked && <rect x={12 * w} y={bot - 24} width={22} height={24} fill="#c7c7c7" stroke={OUT} strokeWidth={4} />}
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
      {!hijab && (
        <g transform="translate(-86 -128)">
          <ellipse rx={22} ry={30} fill={look.skin} stroke={OUT} strokeWidth={SW} />
          <path d="M -4 -12 Q 8 0 -4 12" fill="none" stroke={OUT} strokeWidth={4} strokeLinecap="round" />
        </g>
      )}
      <path d={face} fill={look.skin} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M -60 -36 C -20 -6 50 -6 100 -40 C 80 -6 30 4 -8 -2 C -36 -8 -52 -20 -60 -36 Z" fill={look.skinShade} opacity={0.7} />
      {look.outfit === "teacher" && (
        <g stroke={look.skinShade} strokeWidth={4} strokeLinecap="round" fill="none">
          <path d="M 20 -232 Q 60 -240 96 -226" /><path d="M 30 -218 Q 62 -224 90 -214" />
          <path d="M 96 -168 q 10 4 14 14" />
        </g>
      )}
      <ellipse cx={106} cy={-94} rx={16} ry={9} fill="#ff7f7f" opacity={blushHi ? 0.65 : look.lashes ? 0.4 : 0.28} />
      <ellipse cx={-18} cy={-96} rx={14} ry={8} fill="#ff7f7f" opacity={blushHi ? 0.6 : look.lashes ? 0.35 : 0.25} />
      <g transform={`translate(${jitter} 0)`}>
        <Eye id={`${id}-eb`} cx={4} cy={-146} rx={18} ry={25} state={eyeState} look={lookDir} lid={look.skin} />
        <Eye id={`${id}-ef`} cx={72} cy={-146} rx={21} ry={27} state={eyeState} look={lookDir} lid={look.skin} />
        {look.lashes && eyeState !== "happy" && (
          <g stroke={OUT} strokeWidth={4.5} strokeLinecap="round">
            <path d={`M 92 ${eyeState === "closed" ? -142 : -164} l 12 -8`} /><path d={`M 94 ${eyeState === "closed" ? -138 : -154} l 13 -2`} />
            <path d={`M 20 ${eyeState === "closed" ? -142 : -162} l 10 -8`} />
          </g>
        )}
        {look.glasses && (
          <g fill="none" stroke={OUT} strokeWidth={6}>
            <circle cx={4} cy={-146} r={34} fill="#cfe9ff" fillOpacity={0.18} />
            <circle cx={74} cy={-146} r={38} fill="#cfe9ff" fillOpacity={0.18} />
            <path d="M 38 -150 Q 40 -158 36 -150" />
            <path d="M -30 -150 L -80 -140" />
            <path d="M 52 -168 L 64 -176" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
        <Brow cx={2} cy={-190 + browY} w={40} state={brow} side={-1} thick={look.browThick} />
        <Brow cx={74} cy={-192 + browY} w={48} state={brow} side={1} thick={look.browThick} />
      </g>
      <path d="M 104 -126 Q 118 -108 100 -104" fill="none" stroke={OUT} strokeWidth={5} strokeLinecap="round" />
      <g transform="translate(76 -64)"><Mouth shape={shape} intensity={intensity} /></g>
      {look.mustache && (
        <path d="M 40 -84 Q 60 -100 80 -90 Q 100 -102 120 -86 Q 108 -72 84 -80 Q 64 -70 40 -84 Z" fill={look.hair} stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      )}
      {look.hairStyle === "spiky" && <SpikyHair color={look.hair} t={t} />}
      {look.hairStyle === "buzz" && <BuzzHair color={look.hair} />}
      {look.hairStyle === "parted" && <PartedHair color={look.hair} />}
      {look.hairStyle === "ponytail" && <PonytailFront color={look.hair} accent={look.accent} />}
      {hijab && <HijabFront look={look} />}
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
export const Character: React.FC<{ id: CharId; x: number; y: number; facing: 1 | -1; frame: number; scale?: number; force?: Force }> = ({ id, x, y, facing, frame, scale = 1, force }) => {
  const t = frame / FPS;
  const look = LOOKS[id];
  const st = force
    ? { emotion: force.emotion ?? "neutral", action: force.action ?? "idle", since: 2, line: null }
    : stateAt(id, t);
  const prev = force ? st : stateAt(id, Math.max(0, t - st.since - 1 / FPS));
  const k = ease(st.since / 0.28);
  let pose = mixPose(POSES[prev.action], POSES[st.action], st.since > 0 && prev.action !== st.action ? k : 1);

  const viseme = force ? force.viseme ?? null : visemeAt(id, t);
  const open = viseme ? OPEN[viseme] ?? 0 : 0;
  const speaking = viseme !== null;
  const phase = (CHAR_IDS.indexOf(id) * 1.7) % 6.28;

  if (st.action === "gesture" && speaking) {
    pose = { ...pose, front: [pose.front[0] + Math.sin(t * 5 + phase) * 10, pose.front[1] + Math.sin(t * 7) * 12] };
  }
  if (st.action === "wave") pose = { ...pose, front: [pose.front[0] + Math.sin(t * 10) * 8, pose.front[1]] };

  const breathe = 1 + Math.sin(t * 2.3 + phase) * 0.012;
  const nod = Math.sin(t * 1.7 + phase) * 1.8 + (speaking ? -open * 4 + Math.sin(t * 9) * 1.2 : 0);
  let bodyY = 0, bodyX = 0, extraTilt = 0;
  if (st.emotion === "laugh") { bodyY = -Math.abs(Math.sin(t * 16)) * 10; extraTilt = Math.sin(t * 16) * 3; }
  if (st.emotion === "shock" && st.since < 0.5) bodyY = -Math.sin((st.since / 0.5) * Math.PI) * 50;
  if (st.emotion === "shock") bodyX = Math.sin(t * 60) * (st.since < 1.2 ? 3 : 0.8);
  if (st.emotion === "surprised" && st.since < 0.4) bodyY = -Math.sin((st.since / 0.4) * Math.PI) * 18;
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
        <Arm sx={backShoulder[0]} sy={backShoulder[1]} pose={pose.back} look={look} shade hand={pose.hands[1]} t={t} />
        <Lower look={look} crouch={crouch} />
        <g transform={`translate(0 ${-240 + crouch}) scale(1 ${breathe}) translate(0 ${240 - crouch})`}>
          <Torso look={look} crouch={crouch} />
        </g>
        <rect x={-18} y={-488 + crouch} width={40} height={40} fill={look.skinShade} stroke={OUT} strokeWidth={SW} />
        <g transform={`translate(4 ${-468 + crouch}) rotate(${pose.head + nod + extraTilt})`}>
          <Head id={id} look={look} t={t} emotion={st.emotion} viseme={viseme} blink={blink} lookDir={pose.look} since={st.since} />
          {!force?.noFx && <HeadFx emotion={st.emotion} t={t} since={force ? 0 : st.since} />}
        </g>
        <Arm sx={frontShoulder[0]} sy={frontShoulder[1]} pose={pose.front} look={look} hand={pose.hands[0]} t={t} />
      </g>
    </g>
  );
};
