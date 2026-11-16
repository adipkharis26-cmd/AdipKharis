import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, Loop } from "remotion";
import { useFonts } from "./lib/fonts";
import { Character } from "./characters/Character";
import { City, Ground, Sky, Warung } from "./scene/Background";
import { EndCard, SpeedLines, Subtitles, TitleCard } from "./fx/Overlays";
import { END_OF_DIALOG, FPS, LINES, Line, beatAt } from "./lib/timeline";

/* -------------------------------- stage layout -------------------------------- */
const POS = { kusaka: { x: 720, facing: 1 as const }, ujang: { x: 1200, facing: -1 as const } };
const FLOOR = 960;
const faceOf = (c: "kusaka" | "ujang") => ({ x: POS[c].x + 70 * POS[c].facing, y: FLOOR - 468 - 130 });

/* -------------------------------- camera ------------------------------------- */
interface Cam { x: number; y: number; z: number }
const smooth = (x: number) => { const k = Math.min(Math.max(x, 0), 1); return k * k * (3 - 2 * k); };
const mixCam = (a: Cam, b: Cam, k: number): Cam => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k });

function shotFor(line: Line | null, since: number, vertical: boolean): Cam {
  const v = vertical ? 1.05 : 1;
  if (!line) return { x: 960, y: 560, z: (0.94 + since * 0.03) * v }; // establishing
  const who = line.speaker as keyof typeof POS; // episode 1 cast
  const sp = POS[who], other = POS[who === "kusaka" ? "ujang" : "kusaka"];
  const face = faceOf(who);
  switch (line.shot) {
    case "two": return { x: 960, y: 560, z: (1.02 + since * 0.012) * v };
    case "speaker": {
      // dirty single: speaker framed with a slice of the listener
      const x = vertical ? face.x : sp.x + (other.x - sp.x) * 0.28;
      return { x, y: vertical ? 520 : 470, z: (vertical ? 1.5 : 1.7) + since * 0.015 };
    }
    case "push": // slow dramatic push-in on the face
      return { x: face.x, y: face.y + 40, z: 1.7 + Math.min(since / line.duration, 1) * 0.75 };
    case "crash": // crash zoom right into the eyes
      return { x: face.x - 20 * sp.facing, y: face.y - 30, z: since < 1.1 ? 3.1 : 3.1 - (since - 1.1) * 0.25 };
  }
}

function camera(t: number, vertical: boolean): { cam: Cam; shake: [number, number] } {
  const { line, index, since } = beatAt(t);
  const target = shotFor(line, since, vertical);
  // ending: pull back to the two-shot
  if (t > END_OF_DIALOG + 0.4) {
    const k = smooth((t - END_OF_DIALOG - 0.4) / 0.8);
    const from = shotFor(line, since, vertical);
    const to: Cam = { x: 960, y: 520, z: vertical ? 1.15 : 1.08 };
    return { cam: mixCam(from, to, k), shake: [0, 0] };
  }
  // transition from previous shot (fast whip, crash is near-instant)
  const prevLine = index > 0 ? LINES[index - 1] : null;
  const prevSince = line ? line.start - (prevLine?.start ?? 0) : 0;
  const prev = shotFor(prevLine, prevSince, vertical);
  const dur = line?.shot === "crash" ? 0.12 : 0.38;
  const cam = line ? mixCam(prev, target, smooth(since / dur)) : target;
  // camera shake on the shock beat + light handheld drift
  let amp = 0;
  if (line?.shot === "crash") amp = 22 * Math.max(0, 1 - since / 0.9);
  if (line?.emotion === "laugh") amp = 3;
  const n = (s: number) => Math.sin(t * 91.7 + s) * 0.6 + Math.sin(t * 53.3 + s * 2) * 0.4;
  return { cam, shake: [n(1) * amp + Math.sin(t * 0.7) * 3, n(5) * amp + Math.cos(t * 0.9) * 2] };
}

/** Layer with parallax depth d (1 = moves with characters) */
const Layer: React.FC<{ cam: Cam; d: number; w: number; h: number; children: React.ReactNode }> = ({ cam, d, w, h, children }) => {
  const z = 1 + (cam.z - 1) * d;
  const cx = 960 + (cam.x - 960) * d, cy = 540 + (cam.y - 540) * d;
  return <g transform={`translate(${w / 2} ${h / 2}) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>;
};

/* -------------------------------- main video --------------------------------- */
export const KusakaWarung: React.FC<{ vertical: boolean }> = ({ vertical }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { width: w, height: h } = useVideoConfig();
  const t = frame / FPS;
  const { cam, shake } = camera(t, vertical);

  const crash = LINES.find((l) => l.shot === "crash")!;
  const crashSince = t - crash.start;
  const speedOpacity = crashSince >= 0 && crashSince < 1.5 ? Math.min(1, (1.5 - crashSince) / 0.4) : 0;
  const flash = crashSince >= 0 && crashSince < 0.1 ? 1 - crashSince / 0.1 : 0;

  const order = LINES.find((l) => l.id === "l02")!;
  const orderEnd = order.start + order.duration;
  const ijahNod = t > orderEnd && t < orderEnd + 1.2 ? Math.sin((t - orderEnd) * 10) * 6 : 0;

  return (
    <AbsoluteFill style={{ background: "#8fd6ff" }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${shake[0]} ${shake[1]})`}>
          <Layer cam={cam} d={0.25} w={w} h={h}><Sky t={t} /></Layer>
          <Layer cam={cam} d={0.6} w={w} h={h}><City /></Layer>
          <Layer cam={cam} d={1} w={w} h={h}>
            <Ground />
            <Warung t={t} ijahNod={ijahNod} />
            <Character id="kusaka" x={POS.kusaka.x} y={FLOOR} facing={POS.kusaka.facing} frame={frame} />
            <Character id="ujang" x={POS.ujang.x} y={FLOOR} facing={POS.ujang.facing} frame={frame} />
          </Layer>
        </g>
      </svg>
      <SpeedLines w={w} h={h} frame={frame} opacity={speedOpacity} />
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash }} />}
      {!vertical && <TitleCard frame={frame} vertical={vertical} />}
      <Subtitles t={t} vertical={vertical} w={w} />
      <EndCard since={t - END_OF_DIALOG - 1.2} vertical={vertical} />

      {/* ---------------- audio ---------------- */}
      <Loop durationInFrames={Math.round(19.5 * FPS)}><Audio src={staticFile("sfx/ambience.mp3")} volume={0.16} /></Loop>
      <Sequence from={4}><Audio src={staticFile("sfx/pop.mp3")} volume={0.6} /></Sequence>
      {LINES.map((l) => (
        <Sequence key={l.id} from={Math.round(l.start * FPS)}><Audio src={staticFile(l.audio)} /></Sequence>
      ))}
      {LINES.filter((l) => l.shot === "push" || l.shot === "crash").map((l) => (
        <Sequence key={`w${l.id}`} from={Math.max(0, Math.round(l.start * FPS) - 4)}><Audio src={staticFile("sfx/whoosh.mp3")} volume={0.55} /></Sequence>
      ))}
      <Sequence from={Math.round(crash.start * FPS)}><Audio src={staticFile("sfx/sting.mp3")} volume={0.5} /></Sequence>
      <Sequence from={Math.round((END_OF_DIALOG + 0.5) * FPS)}><Audio src={staticFile("sfx/sad.mp3")} volume={0.55} /></Sequence>
    </AbsoluteFill>
  );
};

/* -------------------------------- Shorts cut ---------------------------------
 * Shorts start right at the first line (hook within the first second), no title card.
 * A small series badge keeps the branding visible instead. */
export const SHORTS_SKIP = Math.round((LINES[0].start - 0.3) * FPS);
export const KusakaWarungShorts: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Sequence from={-SHORTS_SKIP}><KusakaWarung vertical /></Sequence>
      <div style={{
        position: "absolute", top: 70, left: 50, fontFamily: "Bangers", fontSize: 64, color: "#ffd23f", letterSpacing: 4,
        WebkitTextStroke: "10px #1b1b1b", paintOrder: "stroke fill", transform: `rotate(-4deg) scale(${Math.min(1, 0.6 + frame / 20)})`,
        textShadow: "6px 6px 0 #e63946",
      }}>KUSAKA <span style={{ fontSize: 40, color: "#fff" }}>Eps. 1</span></div>
    </AbsoluteFill>
  );
};
