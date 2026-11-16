import React from "react";
import { random } from "remotion";
import { Action, CharId, Emotion, FPS, TOTAL_SECONDS, Viseme, stateAt, visemeAt } from "../lib/timeline";
import { Mouth, pickMouth } from "./Mouth";
import { Brow, Eye, eyesFor } from "./Eyes";

/* ------------------------------------------------------------------------------------------
 * Layered 2D character rig (SVG). Origin = between the feet, character faces +x.
 * Layer order (back → front): back arm, legs, torso, neck, head(ear, face, eyes, brows,
 * nose, mouth, hair, accessories), front arm, FX (sweat, shock marks).
 * Every layer is a separate <g> with its own pivot so it can be driven by code.
 * ---------------------------------------------------------------------------------------- */

const OUT = "#1b1b1b";
const SW = 6;

import canon from "./canon.json";

/** Locked character design — single source of truth is canon.json (see `npm run check:characters`). */
export interface Look {
  skin: string; skinShade: string; hair: string; shirt: string; shirtShade: string; pants: string; accent: string;
  bodyW: number; belly: number; browThick: number;
  hairStyle: "spiky" | "buzz"; glasses: boolean; bandaid: boolean; tucked: boolean;
}
type CanonChar = (typeof canon.characters)[CharId];
const toLook = (c: CanonChar): Look => Object.freeze({
  ...c.palette, ...c.build,
  hairStyle: c.features.hair as Look["hairStyle"], glasses: c.features.glasses, bandaid: c.features.bandaid, tucked: c.features.tucked,
});
export const LOOKS: Record<CharId, Look> = Object.freeze({ kusaka: toLook(canon.characters.kusaka), ujang: toLook(canon.characters.ujang) });

// Arm pose: [shoulder, elbow] in degrees, measured "forward" (toward facing) from pointing down.
type ArmPose = [number, number];
interface Pose { front: ArmPose; back: ArmPose; lean: number; head: number; crouch: number; look: [number, number] }
const POSES: Record<Action, Pose> = {
  idle:    { front: [8, 12],   back: [-6, 10],  lean: 0,  head: 0,   crouch: 0,  look: [0.7, 0] },
  gesture: { front: [38, 75],  back: [-4, 12],  lean: 2,  head: -2,  crouch: 0,  look: [0.7, 0] },
  pocket:  { front: [4, -4],   back: [-6, 10],  lean: 1,  head: 6,   crouch: 0,  look: [0.4, 0.8] },
  chin:    { front: [60, 150], back: [16, 92],  lean: -2, head: -4,  crouch: 0,  look: [0.7, -0.1] },
  point:   { front: [82, 4],   back: [24, -98], lean: -5, head: -10, crouch: 0,  look: [0.8, 0] },
  plead:   { front: [26, 104], back: [48, 84],  lean: 6,  head: 7,   crouch: 10, look: [0.7, -0.4] },
  crossed: { front: [12, -96], back: [10, 88],  lean: -4, head: -3,  crouch: 0,  look: [0.7, 0] },
  shock:   { front: [120, 60], back: [-120, -60], lean: -6, head: -6,  crouch: -6, look: [0.1, 0] },
  laugh:   { front: [24, -96], back: [20, 96],  lean: -6, head: -12, crouch: 0,  look: [0, 0] },
  slump:   { front: [2, 4],    back: [-2, 4],   lean: 8,  head: 14,  crouch: 16, look: [0.3, 0.7] },
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (x: number) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
function mixPose(a: Pose, b: Pose, k: number): Pose {
  return {
    front: [lerp(a.front[0], b.front[0], k), lerp(a.front[1], b.front[1], k)],
    back: [lerp(a.back[0], b.back[0], k), lerp(a.back[1], b.back[1], k)],
    lean: lerp(a.lean, b.lean, k), head: lerp(a.head, b.head, k), crouch: lerp(a.crouch, b.crouch, k),
    look: [lerp(a.look[0], b.look[0], k), lerp(a.look[1], b.look[1], k)],
  };
}

// Deterministic random blinks (2–5 s apart, sometimes a double blink)
const blinkCache: Record<string, number[]> = {};
function blinkTimes(seed: string): number[] {
  if (blinkCache[seed]) return blinkCache[seed];
  const out: number[] = [];
  let t = 0.8 + random(seed) * 1.5;
  let i = 0;
  while (t < TOTAL_SECONDS) {
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

const Arm: React.FC<{ sx: number; sy: number; pose: ArmPose; look: Look; shade?: boolean; point?: boolean }> = ({ sx, sy, pose, look, shade, point }) => {
  const { ex, ey, hx, hy } = armPoints(sx, sy, pose);
  const sleeveX = sx + (ex - sx) * 0.62, sleeveY = sy + (ey - sy) * 0.62;
  const skin = shade ? look.skinShade : look.skin;
  const path = `M ${sx} ${sy} L ${ex} ${ey} L ${hx} ${hy}`;
  const handAngle = Math.atan2(hy - ey, hx - ex) * (180 / Math.PI);
  return (
    <g>
      <path d={path} stroke={OUT} strokeWidth={40} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} stroke={skin} strokeWidth={28} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* short sleeve */}
      <path d={`M ${sx} ${sy} L ${sleeveX} ${sleeveY}`} stroke={OUT} strokeWidth={54} strokeLinecap="round" />
      <path d={`M ${sx} ${sy} L ${sleeveX} ${sleeveY}`} stroke={shade ? look.shirtShade : look.shirt} strokeWidth={42} strokeLinecap="round" />
      {/* hand */}
      <g transform={`translate(${hx} ${hy}) rotate(${handAngle})`}>
        {point ? (
          <g>
            <rect x={-8} y={-16} width={30} height={32} rx={14} fill={skin} stroke={OUT} strokeWidth={5} />
            <rect x={14} y={-14} width={34} height={13} rx={6.5} fill={skin} stroke={OUT} strokeWidth={5} />
          </g>
        ) : (
          <g>
            <circle r={21} fill={skin} stroke={OUT} strokeWidth={5} />
            <path d="M 4 -14 Q 14 -8 8 2" fill="none" stroke={OUT} strokeWidth={3.5} strokeLinecap="round" />
          </g>
        )}
      </g>
    </g>
  );
};

const Legs: React.FC<{ look: Look; crouch: number }> = ({ look, crouch }) => {
  const w = look.bodyW;
  const hipY = -240 + crouch;
  const leg = (x: number, shade: boolean) => (
    <g>
      <path d={`M ${x - 26 * w} ${hipY} L ${x - 24} -28 L ${x + 26} -28 L ${x + 26 * w} ${hipY} Z`}
        fill={shade ? "#666b75" : look.pants} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <path d={`M ${x - 30} -34 Q ${x - 30} -2 ${x - 10} 0 L ${x + 52} 0 Q ${x + 60} -22 ${x + 28} -34 Z`}
        fill="#222" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <path d={`M ${x - 26} -6 L ${x + 54} -6`} stroke="#eee" strokeWidth={5} />
    </g>
  );
  return <g>{leg(-36 * w, true)}{leg(30 * w, false)}</g>;
};

const Torso: React.FC<{ look: Look; id: CharId; crouch: number }> = ({ look, id, crouch }) => {
  const w = look.bodyW;
  const top = -462 + crouch, bot = -220 + crouch;
  const belly = look.belly;
  const d = `M ${-70 * w} ${top + 10} Q 0 ${top - 14} ${76 * w} ${top + 10} L ${70 * w + belly} ${top + 150}
             Q ${74 * w + belly} ${bot - 30} ${66 * w} ${bot} L ${-64 * w} ${bot} Q ${-72 * w} ${top + 120} ${-70 * w} ${top + 10} Z`;
  return (
    <g>
      <path d={d} fill={look.shirt} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      {/* cel shade on the back side */}
      <path d={`M ${-70 * w} ${top + 14} Q ${-72 * w} ${top + 120} ${-64 * w} ${bot - 3} L ${-38 * w} ${bot - 3} Q ${-46 * w} ${top + 110} ${-40 * w} ${top + 6} Z`} fill={look.shirtShade} />
      {/* button placket */}
      <path d={`M ${14 * w} ${top + 18} L ${16 * w} ${bot - 4}`} stroke="#c9ccd4" strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={20 * w} cy={top + 46 + i * 46} r={4} fill="#c9ccd4" />)}
      {/* chest pocket + OSIS badge (generic emblem) */}
      <path d={`M ${30 * w} ${top + 58} L ${62 * w} ${top + 58} L ${62 * w} ${top + 98} Q ${46 * w} ${top + 106} ${30 * w} ${top + 98} Z`} fill="none" stroke="#b9bcc6" strokeWidth={4} />
      <g transform={`translate(${46 * w} ${top + 44})`}>
        <path d="M 0 -11 L 10 -4 L 7 9 L -7 9 L -10 -4 Z" fill="#e7b416" stroke={OUT} strokeWidth={3} />
        <circle r={3.5} fill="#7a4b12" />
      </g>
      {/* collar */}
      <path d={`M ${-30} ${top - 2} L ${-6} ${top + 34} L ${12} ${top + 4} Z`} fill={look.shirt} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M ${46} ${top - 2} L ${26} ${top + 36} L ${12} ${top + 4} Z`} fill={look.shirt} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      {/* belt (Ujang tucks his shirt in, Kusaka doesn't) */}
      {look.tucked && <rect x={-64 * w} y={bot - 22} width={130 * w} height={20} fill="#2b2b2b" stroke={OUT} strokeWidth={4} />}
      {look.tucked && <rect x={12 * w} y={bot - 24} width={22} height={24} fill="#c7c7c7" stroke={OUT} strokeWidth={4} />}
    </g>
  );
};

/* ------------------------------ head ------------------------------------ */
const KusakaHair: React.FC<{ color: string; t: number }> = ({ color, t }) => {
  const sway = Math.sin(t * 2.4) * 2;
  return (
    <g>
      {/* back hair mass */}
      <path d="M -104 -120 Q -118 -230 -40 -268 Q 60 -300 118 -228 L 104 -190 Q 20 -210 -60 -170 Q -88 -150 -92 -96 Z" fill={color} />
      {/* spikes */}
      <path
        d={`M -104 -96 L -142 -138 L -110 -160 L -150 -214 L -92 -222 L -104 -286 L -40 -258 L ${-18 + sway} -326 L 30 -276
            L ${86 + sway} -312 L 92 -252 L ${158 + sway} -262 L 128 -210 L 160 -184 L 112 -178 L 126 -150
            L 86 -170 L 70 -150 L 52 -184 L 26 -162 L 4 -192 L -22 -166 L -44 -186 L -66 -140 L -86 -134 Z`}
        fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round"
      />
    </g>
  );
};

const UjangHair: React.FC<{ color: string }> = ({ color }) => (
  <g>
    <path d="M -104 -112 Q -118 -246 10 -270 Q 112 -276 128 -196 Q 90 -214 40 -206 Q -20 -204 -60 -176 Q -84 -150 -88 -108 Z"
      fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    {/* buzz-cut texture */}
    {[[-60, -230], [-30, -248], [10, -252], [50, -244], [86, -228], [-80, -190], [-40, -214]].map(([x, y], i) => (
      <path key={i} d={`M ${x} ${y} l 6 -4`} stroke="#4c3b2d" strokeWidth={4} strokeLinecap="round" />
    ))}
  </g>
);

const Head: React.FC<{ id: CharId; look: Look; t: number; emotion: Emotion; viseme: string | null; blink: boolean; lookDir: [number, number]; since: number }> = ({ id, look, t, emotion, viseme, blink, lookDir, since }) => {
  const { eye, brow } = eyesFor(emotion);
  const eyeState = blink && eye !== "happy" ? "closed" : eye;
  const { shape, intensity } = pickMouth(viseme as never, emotion);
  const face = "M -100 -150 C -100 -250 40 -282 112 -222 C 142 -192 142 -112 124 -64 C 104 -16 42 0 -8 -8 C -70 -20 -100 -80 -100 -150 Z";
  const jitter = emotion === "shock" && since < 1.2 ? Math.sin(t * 70) * 1.6 : 0;
  return (
    <g>
      {/* ear */}
      <g transform="translate(-86 -128)">
        <ellipse rx={22} ry={30} fill={look.skin} stroke={OUT} strokeWidth={SW} />
        <path d="M -4 -12 Q 8 0 -4 12" fill="none" stroke={OUT} strokeWidth={4} strokeLinecap="round" />
      </g>
      <path d={face} fill={look.skin} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      {/* jaw shade */}
      <path d="M -60 -36 C -20 -6 50 -6 100 -40 C 80 -6 30 4 -8 -2 C -36 -8 -52 -20 -60 -36 Z" fill={look.skinShade} opacity={0.7} />
      {/* blush */}
      <ellipse cx={106} cy={-94} rx={16} ry={9} fill="#ff7f7f" opacity={emotion === "embarrassed" || emotion === "pleading" ? 0.65 : 0.28} />
      <ellipse cx={-18} cy={-96} rx={14} ry={8} fill="#ff7f7f" opacity={emotion === "embarrassed" || emotion === "pleading" ? 0.6 : 0.25} />
      {/* eyes */}
      <g transform={`translate(${jitter} 0)`}>
        <Eye id={`${id}-eb`} cx={4} cy={-146} rx={18} ry={25} state={eyeState} look={lookDir} lid={look.skin} />
        <Eye id={`${id}-ef`} cx={72} cy={-146} rx={21} ry={27} state={eyeState} look={lookDir} lid={look.skin} />
        {look.glasses && (
          <g fill="none" stroke={OUT} strokeWidth={6}>
            <circle cx={4} cy={-146} r={34} fill="#cfe9ff" fillOpacity={0.18} />
            <circle cx={74} cy={-146} r={38} fill="#cfe9ff" fillOpacity={0.18} />
            <path d="M 38 -150 Q 40 -158 36 -150" />
            <path d="M -30 -150 L -80 -140" />
            <path d="M 52 -168 L 64 -176" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
        <Brow cx={2} cy={-190 - (look.glasses ? 6 : 0)} w={40} state={brow} side={-1} thick={look.browThick} />
        <Brow cx={74} cy={-192 - (look.glasses ? 6 : 0)} w={48} state={brow} side={1} thick={look.browThick} />
      </g>
      {/* nose */}
      <path d="M 104 -126 Q 118 -108 100 -104" fill="none" stroke={OUT} strokeWidth={5} strokeLinecap="round" />
      {/* mouth (lip-sync sprite) */}
      <g transform="translate(76 -64)"><Mouth shape={shape} intensity={intensity} /></g>
      {/* hair & accessories */}
      {look.hairStyle === "spiky" ? <KusakaHair color={look.hair} t={t} /> : <UjangHair color={look.hair} />}
      {look.bandaid && (
        // band-aid on cheek — Kusaka's trademark
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
  const y = ((t * 40) % 40);
  return (
    <path transform={`translate(-70 ${-230 + y})`} d="M 0 -26 Q 16 0 0 12 Q -16 0 0 -26 Z" fill="#8fd3ff" stroke={OUT} strokeWidth={4} />
  );
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

/* ------------------------------ Character ------------------------------- */
/** Fixed pose for model sheets (bypasses the timeline). */
export interface Force { emotion?: Emotion; action?: Action; viseme?: Viseme | null; noFx?: boolean }

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
  const phase = id === "kusaka" ? 0 : 1.7;

  // gesture hand waves while talking
  if (st.action === "gesture" && speaking) {
    pose = { ...pose, front: [pose.front[0] + Math.sin(t * 5 + phase) * 10, pose.front[1] + Math.sin(t * 7) * 12] };
  }

  // ---- procedural motion ----
  const breathe = 1 + Math.sin(t * 2.3 + phase) * 0.012;
  const nod = Math.sin(t * 1.7 + phase) * 1.8 + (speaking ? -open * 4 + Math.sin(t * 9) * 1.2 : 0);
  let bodyY = 0, bodyX = 0, extraTilt = 0;
  if (st.emotion === "laugh") { bodyY = -Math.abs(Math.sin(t * 16)) * 10; extraTilt = Math.sin(t * 16) * 3; }
  if (st.emotion === "shock" && st.since < 0.5) bodyY = -Math.sin((st.since / 0.5) * Math.PI) * 50; // jump!
  if (st.emotion === "shock") bodyX = Math.sin(t * 60) * (st.since < 1.2 ? 3 : 0.8);
  if (st.emotion === "surprised" && st.since < 0.4) bodyY = -Math.sin((st.since / 0.4) * Math.PI) * 18;
  // listener nods along (light idle nod)
  if (!speaking && st.emotion === "neutral") extraTilt += Math.max(0, Math.sin(t * 3.2 + phase)) * 3;

  const blink = !force && isBlinking(id, t) && st.emotion !== "shock";
  const crouch = pose.crouch;

  const frontShoulder: [number, number] = [52 * look.bodyW, -438 + crouch];
  const backShoulder: [number, number] = [-50 * look.bodyW, -440 + crouch];

  return (
    <g transform={`translate(${x + bodyX} ${y + bodyY}) scale(${facing * scale} ${scale})`}>
      {/* ground shadow */}
      <ellipse cx={0} cy={2} rx={120 * look.bodyW} ry={16} fill="#000" opacity={0.18} transform={`scale(${1 + bodyY / 400} 1)`} />
      <g transform={`rotate(${pose.lean} 0 0)`}>
        {/* back arm (behind torso) */}
        <Arm sx={backShoulder[0]} sy={backShoulder[1]} pose={pose.back} look={look} shade />
        <Legs look={look} crouch={crouch} />
        <g transform={`translate(0 ${-240 + crouch}) scale(1 ${breathe}) translate(0 ${240 - crouch})`}>
          <Torso look={look} id={id} crouch={crouch} />
        </g>
        {/* neck */}
        <rect x={-18} y={-488 + crouch} width={40} height={40} fill={look.skinShade} stroke={OUT} strokeWidth={SW} />
        {/* head pivots at the neck */}
        <g transform={`translate(4 ${-468 + crouch}) rotate(${pose.head + nod + extraTilt})`}>
          <Head id={id} look={look} t={t} emotion={st.emotion} viseme={viseme} blink={blink} lookDir={pose.look} since={st.since} />
          {!force?.noFx && <HeadFx emotion={st.emotion} t={t} since={force ? 0 : st.since} />}
        </g>
        {/* front arm */}
        <Arm sx={frontShoulder[0]} sy={frontShoulder[1]} pose={pose.front} look={look} point={st.action === "point"} />
      </g>
    </g>
  );
};
