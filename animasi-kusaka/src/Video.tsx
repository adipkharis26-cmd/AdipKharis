import React from "react";
import { AbsoluteFill, Audio, Loop, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "./lib/fonts";
import { ShortsWatermark } from "./branding/Watermark";
import { Character } from "./characters/Character";
import { LOCATIONS, LOCATION_META, LocId } from "./scene/Locations";
import { Caption, FlashbackOverlay, SpeedLines, Subtitles } from "./fx/Overlays";
import sfxLib from "./audio/sfx.json";
import editing from "./edit/editing.json";
import { CharId, END_OF_DIALOG, FPS, LINES, Line, SCENES, Scene, beatAt } from "./lib/timeline";

/* -------------------------------- stage layout (per scene, from locked location marks) ---- */
const metaOf = (sc: Scene) => LOCATION_META.locations[sc.location as LocId];
const castOf = (sc: Scene) => Object.keys(sc.cast) as CharId[];
const posOf = (sc: Scene, c: CharId) => ({ x: metaOf(sc).marks[sc.cast[c].mark], facing: sc.cast[c].facing });
const faceOf = (sc: Scene, c: CharId) => ({ x: posOf(sc, c).x + 70 * posOf(sc, c).facing, y: metaOf(sc).floor - 468 - 130 });
const otherOf = (sc: Scene, c: CharId) => castOf(sc).find((x) => x !== c) ?? c;
const centerOf = (sc: Scene) => { const xs = castOf(sc).map((c) => posOf(sc, c).x); return (Math.min(...xs) + Math.max(...xs)) / 2; };

/* -------------------------------- camera ------------------------------------- */
interface Cam { x: number; y: number; z: number }
const smooth = (x: number) => { const k = Math.min(Math.max(x, 0), 1); return k * k * (3 - 2 * k); };
const mixCam = (a: Cam, b: Cam, k: number): Cam => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k });

function shotFor(sc: Scene, line: Line | null, since: number, vertical: boolean): Cam {
  const v = vertical ? 1.05 : 1;
  const cx = centerOf(sc);
  if (!line) return { x: cx, y: 560, z: (0.94 + since * 0.03) * v };
  const who = line.speaker;
  if (line.offscreen || !sc.cast[who]) return { x: cx, y: 560, z: (1.02 + since * 0.012) * v };
  const sp = posOf(sc, who), other = posOf(sc, otherOf(sc, who));
  const face = faceOf(sc, who);
  switch (line.shot) {
    case "two": return { x: cx, y: 560, z: (1.02 + since * 0.012) * v };
    case "speaker": {
      const x = vertical ? face.x : sp.x + (other.x - sp.x) * 0.28;
      return { x, y: vertical ? 520 : 470, z: (vertical ? 1.5 : 1.7) + since * 0.015 };
    }
    case "push": return { x: face.x, y: face.y + 40, z: 1.7 + Math.min(since / line.duration, 1) * 0.75 };
    case "crash": {
      // vertical frames are narrow: centre on the real face centre (face +24, minus the shock lean ≈ 63)
      const x = vertical ? sp.x - 40 * sp.facing : face.x - 20 * sp.facing; // shock pose leans back ~6°
      return { x, y: face.y - 30, z: since < 1.1 ? 3.1 : 3.1 - (since - 1.1) * 0.25 };
    }
  }
}

function camera(t: number, vertical: boolean): { cam: Cam; shake: [number, number]; scene: Scene } {
  const { line, index, since, scene } = beatAt(t);
  const target = shotFor(scene, line, since, vertical);
  const lastSceneEnd = SCENES[SCENES.length - 1] === scene && t > END_OF_DIALOG + 0.4;
  if (lastSceneEnd) {
    const k = smooth((t - END_OF_DIALOG - 0.4) / 0.8);
    return { cam: mixCam(target, { x: centerOf(scene), y: 520, z: vertical ? 1.15 : 1.08 }, k), shake: [0, 0], scene };
  }
  const prevLine = index > 0 && LINES[index - 1].scene === scene.id ? LINES[index - 1] : null;
  const prev = shotFor(scene, prevLine, line ? line.start - (prevLine?.start ?? scene.start) : 0, vertical);
  const dur = line?.shot === "crash" ? 0.12 : 0.38;
  const cam = line ? mixCam(prev, target, smooth(since / dur)) : target;
  let amp = 0;
  if (line?.shot === "crash") amp = 22 * Math.max(0, 1 - since / 0.9);
  if (line?.emotion === "laugh" && !line.offscreen) amp = 3;
  const n = (s: number) => Math.sin(t * 91.7 + s) * 0.6 + Math.sin(t * 53.3 + s * 2) * 0.4;
  return { cam, shake: [n(1) * amp + Math.sin(t * 0.7) * 3, n(5) * amp + Math.cos(t * 0.9) * 2], scene };
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
  SCENES.slice(1).forEach((sc) => cues.push({ id: "whoosh_soft", frame: Math.max(0, Math.round((sc.start - 0.15) * FPS)) }));
  const last = LINES[LINES.length - 1];
  if (last && (last.listener === "defeated" || last.emotion === "defeated")) sfxLib.auto.endDefeated.forEach((s) => cues.push(parseAuto(s, END_OF_DIALOG)));
  return cues;
}
const CUES = buildCues();

/* -------------------------------- scene transition (no text) --------------- */
const Wipe: React.FC<{ t: number; w: number; h: number }> = ({ t, w, h }) => {
  const near = SCENES.slice(1).map((s) => t - s.start).find((d) => d > -0.25 && d < 0.25);
  if (near === undefined) return null;
  const k = (near + 0.25) / 0.5; // 0 → 1 across the cut
  const x = -w * 1.4 + k * w * 2.8;
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${x} 0) skewX(-18)`}>
        <rect x={0} y={-50} width={w * 1.1} height={h + 100} fill="#ffd23f" />
        <rect x={-60} y={-50} width={60} height={h + 100} fill="#1b1b1b" />
        <rect x={w * 1.1} y={-50} width={60} height={h + 100} fill="#e63946" />
      </g>
    </svg>
  );
};

/* -------------------------------- main video --------------------------------- */
export const KusakaWarung: React.FC<{ vertical: boolean }> = ({ vertical }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { width: w, height: h } = useVideoConfig();
  const t = frame / FPS;
  const { cam, shake, scene } = camera(t, vertical);
  const loc = LOCATIONS[scene.location as LocId];
  const meta = metaOf(scene);

  const crash = LINES.find((l) => l.scene === scene.id && l.shot === "crash");
  const crashSince = crash ? t - crash.start : -1;
  const speedOpacity = crashSince >= 0 && crashSince < 1.5 ? Math.min(1, (1.5 - crashSince) / 0.4) : 0;
  const flash = crashSince >= 0 && crashSince < 0.1 ? 1 - crashSince / 0.1 : 0;

  const fbLine = LINES.find((l) => l.flashback && t >= l.start - 0.3 && t < l.start + l.duration + 0.3);
  const fbAmount = fbLine ? Math.min(1, (t - fbLine.start + 0.3) / 0.3, (fbLine.start + fbLine.duration + 0.3 - t) / 0.3) : 0;
  const fb = editing.flashback;

  // Bu Ijah (behind the counter) nods while she talks or right after an order
  const ijahTalk = LINES.some((l) => l.speaker === "buIjah" && t >= l.start && t < l.start + l.duration);
  const ijahNod = scene.location === "warung" && ijahTalk ? Math.sin(t * 9) * 5 : 0;

  return (
    <AbsoluteFill style={{ background: loc.bg }}>
      <svg width={w} height={h} style={{
        position: "absolute", inset: 0,
        filter: fbAmount > 0 ? `sepia(${fb.sepia * fbAmount}) saturate(${1 - (1 - fb.saturate) * fbAmount})` : undefined,
      }}>
        <g transform={`translate(${shake[0]} ${shake[1]})`}>
          {loc.layers.map((l, i) => <Layer key={`${scene.id}-${i}`} cam={cam} d={l.d} w={w} h={h}>{l.el(t, { ijahNod })}</Layer>)}
          <Layer cam={cam} d={1} w={w} h={h}>
            {castOf(scene).map((c) => <Character key={`${scene.id}-${c}`} id={c} x={posOf(scene, c).x} y={meta.floor} facing={posOf(scene, c).facing} frame={frame} />)}
          </Layer>
          {loc.front?.map((l, i) => <Layer key={`f${i}`} cam={cam} d={l.d} w={w} h={h}>{l.el(t)}</Layer>)}
        </g>
      </svg>
      <FlashbackOverlay w={w} h={h} frame={frame} amount={fbAmount} />
      <SpeedLines w={w} h={h} frame={frame} opacity={speedOpacity} />
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash }} />}
      <Caption t={t} vertical={vertical} />
      <Subtitles t={t} vertical={vertical} w={w} />
      <Wipe t={t} w={w} h={h} />

      {/* ---------------- audio ---------------- */}
      {SCENES.map((sc) => {
        const amb = LOCATION_META.locations[sc.location as LocId].ambience as SfxId;
        const len = Math.round((sc.end - sc.start) * FPS);
        return (
          <Sequence key={`amb-${sc.id}`} from={Math.round(sc.start * FPS)} durationInFrames={len}>
            <Loop durationInFrames={Math.round((sfxLib.sfx[amb].duration - 0.5) * FPS)}>
              <Audio src={staticFile(`sfx/${amb}.mp3`)} volume={sfxLib.sfx[amb].volume} />
            </Loop>
          </Sequence>
        );
      })}
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
  <AbsoluteFill>
    <Sequence from={-SHORTS_SKIP}><KusakaWarung vertical /></Sequence>
    <ShortsWatermark />
  </AbsoluteFill>
);
