import React from "react";
import { AbsoluteFill, Audio, Loop, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "./lib/fonts";
import { Character } from "./characters/Character";
import { LOCATIONS, LOCATION_META, LocId } from "./scene/Locations";
import { Caption, FlashbackOverlay, SpeedLines, Subtitles } from "./fx/Overlays";
import sfxLib from "./audio/sfx.json";
import editing from "./edit/editing.json";
import { CAST, CharId, END_OF_DIALOG, FPS, LINES, LOCATION, Line, beatAt } from "./lib/timeline";

/* -------------------------------- stage layout (from locked location marks) ---- */
const LOC = LOCATION as LocId;
const META = LOCATION_META.locations[LOC];
const FLOOR = META.floor;
const CAST_IDS = Object.keys(CAST) as CharId[];
const posOf = (c: CharId) => ({ x: META.marks[CAST[c].mark], facing: CAST[c].facing });
const faceOf = (c: CharId) => ({ x: posOf(c).x + 70 * posOf(c).facing, y: FLOOR - 468 - 130 });
const otherOf = (c: CharId) => CAST_IDS.find((x) => x !== c) ?? c;
const center = () => { const xs = CAST_IDS.map((c) => posOf(c).x); return (Math.min(...xs) + Math.max(...xs)) / 2; };

/* -------------------------------- camera ------------------------------------- */
interface Cam { x: number; y: number; z: number }
const smooth = (x: number) => { const k = Math.min(Math.max(x, 0), 1); return k * k * (3 - 2 * k); };
const mixCam = (a: Cam, b: Cam, k: number): Cam => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k });

function shotFor(line: Line | null, since: number, vertical: boolean): Cam {
  const v = vertical ? 1.05 : 1;
  const cx = center();
  if (!line) return { x: cx, y: 560, z: (0.94 + since * 0.03) * v };
  const who = line.speaker;
  const sp = posOf(who), other = posOf(otherOf(who));
  const face = faceOf(who);
  switch (line.shot) {
    case "two": return { x: cx, y: 560, z: (1.02 + since * 0.012) * v };
    case "speaker": {
      const x = vertical ? face.x : sp.x + (other.x - sp.x) * 0.28;
      return { x, y: vertical ? 520 : 470, z: (vertical ? 1.5 : 1.7) + since * 0.015 };
    }
    case "push": return { x: face.x, y: face.y + 40, z: 1.7 + Math.min(since / line.duration, 1) * 0.75 };
    case "crash": return { x: face.x - 20 * sp.facing, y: face.y - 30, z: since < 1.1 ? 3.1 : 3.1 - (since - 1.1) * 0.25 };
  }
}

function camera(t: number, vertical: boolean): { cam: Cam; shake: [number, number] } {
  const { line, index, since } = beatAt(t);
  const target = shotFor(line, since, vertical);
  if (t > END_OF_DIALOG + 0.4) {
    const k = smooth((t - END_OF_DIALOG - 0.4) / 0.8);
    return { cam: mixCam(target, { x: center(), y: 520, z: vertical ? 1.15 : 1.08 }, k), shake: [0, 0] };
  }
  const prevLine = index > 0 ? LINES[index - 1] : null;
  const prev = shotFor(prevLine, line ? line.start - (prevLine?.start ?? 0) : 0, vertical);
  const dur = line?.shot === "crash" ? 0.12 : 0.38;
  const cam = line ? mixCam(prev, target, smooth(since / dur)) : target;
  let amp = 0;
  if (line?.shot === "crash") amp = 22 * Math.max(0, 1 - since / 0.9);
  if (line?.emotion === "laugh") amp = 3;
  const n = (s: number) => Math.sin(t * 91.7 + s) * 0.6 + Math.sin(t * 53.3 + s * 2) * 0.4;
  return { cam, shake: [n(1) * amp + Math.sin(t * 0.7) * 3, n(5) * amp + Math.cos(t * 0.9) * 2] };
}

const Layer: React.FC<{ cam: Cam; d: number; w: number; h: number; children: React.ReactNode }> = ({ cam, d, w, h, children }) => {
  const z = 1 + (cam.z - 1) * d;
  const cx = 960 + (cam.x - 960) * d, cy = 540 + (cam.y - 540) * d;
  return <g transform={`translate(${w / 2} ${h / 2}) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>;
};

/* -------------------------------- sound design (locked library) -------------- */
type SfxId = keyof typeof sfxLib.sfx;
interface Cue { id: SfxId; frame: number }
function parseAuto(spec: string, base: number): Cue {
  const [id, off] = spec.split("@");
  return { id: id as SfxId, frame: Math.max(0, Math.round((base + parseFloat(off)) * FPS)) };
}
function buildCues(): Cue[] {
  const cues: Cue[] = [];
  LINES.forEach((l, i) => {
    if (l.shot === "crash") sfxLib.auto.crash.forEach((s) => cues.push(parseAuto(s, l.start)));
    if (l.shot === "push") sfxLib.auto.push.forEach((s) => cues.push(parseAuto(s, l.start)));
    if (l.flashback && !LINES[i - 1]?.flashback) sfxLib.auto.flashbackIn.forEach((s) => cues.push(parseAuto(s, l.start)));
    for (const s of l.sfx ?? []) {
      const at = s.at === "end" ? l.start + l.duration + 0.05 : l.start + s.at;
      cues.push({ id: s.id as SfxId, frame: Math.round(at * FPS) });
    }
  });
  const last = LINES[LINES.length - 1];
  if (last && (last.listener === "defeated" || last.emotion === "defeated")) sfxLib.auto.endDefeated.forEach((s) => cues.push(parseAuto(s, END_OF_DIALOG)));
  return cues;
}
const CUES = buildCues();

/* -------------------------------- main video --------------------------------- */
export const KusakaWarung: React.FC<{ vertical: boolean }> = ({ vertical }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { width: w, height: h } = useVideoConfig();
  const t = frame / FPS;
  const { cam, shake } = camera(t, vertical);
  const loc = LOCATIONS[LOC];

  const crash = LINES.find((l) => l.shot === "crash");
  const crashSince = crash ? t - crash.start : -1;
  const speedOpacity = crashSince >= 0 && crashSince < 1.5 ? Math.min(1, (1.5 - crashSince) / 0.4) : 0;
  const flash = crashSince >= 0 && crashSince < 0.1 ? 1 - crashSince / 0.1 : 0;

  // flashback amount (smooth in/out over 0.3 s)
  const fbLine = LINES.find((l) => l.flashback && t >= l.start - 0.3 && t < l.start + l.duration + 0.3);
  const fbAmount = fbLine ? Math.min(1, (t - fbLine.start + 0.3) / 0.3, (fbLine.start + fbLine.duration + 0.3 - t) / 0.3) : 0;
  const fb = editing.flashback;

  // Bu Ijah nods after an order to the warung
  const order = LINES.find((l) => /\bBu\b/.test(l.text) && LOC === "warung");
  const orderEnd = order ? order.start + order.duration : -9;
  const ijahNod = t > orderEnd && t < orderEnd + 1.2 ? Math.sin((t - orderEnd) * 10) * 6 : 0;
  const amb = META.ambience as SfxId;

  return (
    <AbsoluteFill style={{ background: loc.bg }}>
      <svg width={w} height={h} style={{
        position: "absolute", inset: 0,
        filter: fbAmount > 0 ? `sepia(${fb.sepia * fbAmount}) saturate(${1 - (1 - fb.saturate) * fbAmount})` : undefined,
      }}>
        <g transform={`translate(${shake[0]} ${shake[1]})`}>
          {loc.layers.map((l, i) => <Layer key={i} cam={cam} d={l.d} w={w} h={h}>{l.el(t, { ijahNod })}</Layer>)}
          <Layer cam={cam} d={1} w={w} h={h}>
            {CAST_IDS.map((c) => <Character key={c} id={c} x={posOf(c).x} y={FLOOR} facing={posOf(c).facing} frame={frame} />)}
          </Layer>
          {loc.front?.map((l, i) => <Layer key={`f${i}`} cam={cam} d={l.d} w={w} h={h}>{l.el(t)}</Layer>)}
        </g>
      </svg>
      <FlashbackOverlay w={w} h={h} frame={frame} amount={fbAmount} />
      <SpeedLines w={w} h={h} frame={frame} opacity={speedOpacity} />
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash }} />}
      <Caption t={t} vertical={vertical} />
      <Subtitles t={t} vertical={vertical} w={w} />

      {/* ---------------- audio ---------------- */}
      <Loop durationInFrames={Math.round((sfxLib.sfx[amb].duration - 0.5) * FPS)}>
        <Audio src={staticFile(`sfx/${amb}.mp3`)} volume={sfxLib.sfx[amb].volume} />
      </Loop>
      {LINES.map((l) => (
        <Sequence key={l.id} from={Math.round(l.start * FPS)}><Audio src={staticFile(l.audio)} /></Sequence>
      ))}
      {CUES.map((c, i) => (
        <Sequence key={`c${i}`} from={c.frame}><Audio src={staticFile(`sfx/${c.id}.mp3`)} volume={sfxLib.sfx[c.id].volume} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

/* -------------------------------- Shorts cut ---------------------------------
 * Shorts start right at the first line (hook within 0.5 s). No text besides subtitles. */
export const SHORTS_SKIP = Math.round((LINES[0].start - 0.3) * FPS);
export const KusakaWarungShorts: React.FC = () => (
  <AbsoluteFill><Sequence from={-SHORTS_SKIP}><KusakaWarung vertical /></Sequence></AbsoluteFill>
);
