import React from "react";
import { AbsoluteFill, Audio, Loop, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "./lib/fonts";
import { LongWatermark, ShortsWatermark } from "./branding/Watermark";
import { ShortsCta, ctaLineOf } from "./branding/ShortsCta";
import { ShortsHook, Hook } from "./branding/ShortsHook";
import timelineData from "./data/timeline.json";
import { Character, Wear } from "./characters/Character";
import { LOCATIONS, LOCATION_META, LocId } from "./scene/Locations";
import { Caption, FlashbackOverlay, SpeedLines, Subtitles } from "./fx/Overlays";
import { CharLightDefs, LightDef, ScreenLight, SetLight } from "./fx/Lighting";
import { DETAILS } from "./scene/Details";
import { DETAILS2 } from "./scene/Details2";
import { Extras } from "./scene/Extras";
import { FLine, activeLine, conversationFacing } from "./edit/facing";
import sfxLib from "./audio/sfx.json";
import editing from "./edit/editing.json";
import { CharId, END_OF_DIALOG, FPS, LINES, Line, SCENES, Scene, beatAt, SUBTITLES, heldAt, trackAt, INTRO, duckAt } from "./lib/timeline";
import { Intro } from "./branding/Intro";
import bedsLib from "./audio/beds.json";
import bedDur from "./audio/beds-durations.json";
import { IntroB, IntroC } from "./branding/IntroAlt";
import { IntroD } from "./branding/IntroCine";

/* -------------------------------- stage layout (per scene, from locked location marks) ---- */
const metaOf = (sc: Scene) => LOCATION_META.locations[sc.location as LocId];
const castOf = (sc: Scene) => Object.keys(sc.cast) as CharId[];
type Move = { who: CharId; to: string; from?: string; at?: number; face?: 1 | -1 };
const OFF: Record<string, number> = { offL: -260, offR: 2180 };
const WALK_SPEED: number = editing.camera.walkSpeed;
const markX = (sc: Scene, m: string) => OFF[m] ?? metaOf(sc).marks[m as keyof ReturnType<typeof metaOf>["marks"]];
let NOW = 0;
/** Position of a character at time NOW: start mark, then every `move` of this scene in order. */
const posRaw = (sc: Scene, c: CharId): { x: number; facing: 1 | -1; walk?: number } => {
  let x = markX(sc, sc.cast[c].mark), facing = sc.cast[c].facing;
  const first = LINES.find((l) => l.scene === sc.id && (l as Line & { move?: Move }).move?.who === c) as (Line & { move?: Move }) | undefined;
  if (first?.move?.from) x = markX(sc, first.move.from);
  for (const l of LINES) {
    const mv = (l as Line & { move?: Move }).move;
    if (l.scene !== sc.id || !mv || mv.who !== c) continue;
    const from = mv.from ? markX(sc, mv.from) : x, to = markX(sc, mv.to);
    const start = l.start + (mv.at ?? 0), dur = Math.max(0.3, Math.abs(to - from) / WALK_SPEED);
    const dir: 1 | -1 = to >= from ? 1 : -1;
    if (NOW < start) break;
    if (NOW < start + dur) return { x: from + (to - from) * ((NOW - start) / dur), facing: dir, walk: ((NOW - start) * WALK_SPEED) / 42 };
    x = to; facing = mv.face ?? dir;
  }
  return { x, facing };
};
/* Belum masuk panggung: karakter yang masuk lewat offL/offR sebelum langkah pertamanya dimulai. */
const notEntered = (sc: Scene, c: CharId) => {
  const first = LINES.find((l) => l.scene === sc.id && (l as Line & { move?: Move }).move?.who === c) as (Line & { move?: Move }) | undefined;
  return !!first?.move?.from && OFF[first.move.from] !== undefined && NOW < first.start + (first.move.at ?? 0);
};
/** Posisi + arah hadap. ATURAN: saat bercakap tidak ada yang membelakangi lawan bicara (src/edit/facing.ts). */
const posOf = (sc: Scene, c: CharId): { x: number; facing: 1 | -1; walk?: number } => {
  const p = posRaw(sc, c);
  if (p.walk !== undefined) return p; // sedang berjalan: menghadap arah jalan
  const sceneLines = LINES.filter((l) => l.scene === sc.id) as unknown as FLine[];
  const onStage = (id: string) => !!sc.cast[id] && !notEntered(sc, id as CharId);
  const f = conversationFacing(c, activeLine(sceneLines, NOW), sceneLines, (id) => posRaw(sc, id as CharId).x, onStage);
  return f ? { ...p, facing: f } : p;
};
/** Pakaian adegan: "wear" di naskah, kalau tidak ada ikut lokasi (sekolah = seragam, luar = bebas, rumah = bebas + sandal). */
/** Murid membawa tas punggung saat berangkat/pulang sekolah: lokasi "bag": true (gerbang, halte) atau naskah scene "bag": true | ["id", ...] | false. */
const STUDENTS = ["kusaka", "ujang", "nadia", "sasa", "ucok", "bimo", "dinda", "raka"];
const bagOf = (sc: Scene, c: CharId): boolean => {
  const sb = sc.bag ?? (metaOf(sc) as { bag?: boolean }).bag ?? false;
  return Array.isArray(sb) ? sb.includes(c) : !!sb && STUDENTS.includes(c);
};
export const hasBagScene = (sc: Scene) => (sc.bag ?? (metaOf(sc) as { bag?: boolean }).bag ?? false) !== false;
/** Pulang/berangkat sekolah TETAP berseragam (aturan pemilik): scene bercaption SEPULANG SEKOLAH / SENIN PAGI otomatis seragam. */
const SCHOOL_CAPTIONS = ["SEPULANG SEKOLAH", "SENIN PAGI"];
const schoolCommute = (sc: Scene) => LINES.some((l) => l.scene === sc.id && !!l.caption && SCHOOL_CAPTIONS.includes(l.caption));
/** Lapisan suara suasana per adegan: ambience lokasi (atau "amb" naskah) + musik latar ("music" naskah). Hanya file yang sudah dibuat. */
type BedKind = "ambience" | "music";
const BED_DUR = bedDur as Record<string, number>;
const bedsOf = (sc: Scene): { id: string; kind: BedKind }[] => {
  const amb = sc.amb ?? ((metaOf(sc) as { beds?: string[] }).beds ?? []);
  return [...amb.map((id) => ({ id, kind: "ambience" as BedKind })), ...(sc.music ? [{ id: sc.music, kind: "music" as BedKind }] : [])].filter((b) => BED_DUR[b.id] > 1);
};
const wearOf = (sc: Scene): Wear => sc.wear ?? (schoolCommute(sc) ? "seragam" : ((metaOf(sc) as { wear?: Wear }).wear ?? "seragam"));
/** Topi upacara: lokasi "hat": true (lapangan upacara) atau naskah scene "hat": true | false; hanya untuk berseragam. */
export const hasHatScene = (sc: Scene) => (sc.hat ?? (metaOf(sc) as { hat?: boolean }).hat ?? false) === true;
const hatOf = (sc: Scene, c: CharId) => hasHatScene(sc) && STUDENTS.includes(c) && wearOf(sc) === "seragam";
const faceOf = (sc: Scene, c: CharId) => ({ x: posOf(sc, c).x + 70 * posOf(sc, c).facing, y: metaOf(sc).floor - 468 - 130 });
const otherOf = (sc: Scene, c: CharId) => castOf(sc).find((x) => x !== c) ?? c;
const centerOf = (sc: Scene) => {
  const all = castOf(sc).map((c) => posOf(sc, c).x), on = all.filter((x) => x > 0 && x < 1920);
  const xs = on.length ? on : all;
  return (Math.min(...xs) + Math.max(...xs)) / 2;
};

/* -------------------------------- camera ------------------------------------- */
interface Cam { x: number; y: number; z: number }
const smooth = (x: number) => { const k = Math.min(Math.max(x, 0), 1); return k * k * (3 - 2 * k); };
const mixCam = (a: Cam, b: Cam, k: number): Cam => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k });

const STATIC: boolean = editing.camera.static;
type CamLine = Line & { camAt?: string; fg?: string };
/** Position at an earlier moment (used to lock a static camera at the start of a shot). */
const posAtTime = (sc: Scene, c: CharId, t: number) => { const keep = NOW; NOW = t; const p = posOf(sc, c); NOW = keep; return p; };
/** Rule of thirds: subject on one third, empty space in front of the face (reference framing). */
const thirds = (faceX: number, facing: number, z: number, vertical: boolean) => (vertical ? faceX : faceX + facing * (1920 / z) * 0.16);

function shotFor(sc: Scene, line: Line | null, since: number, vertical: boolean): Cam {
  if (line?.shot === "wide") {
    const mv = (line as Line & { move?: Move }).move;
    const keep = NOW; NOW = line.start;
    const x = !vertical ? 960 : mv && !OFF[mv.to] ? markX(sc, mv.to) : centerOf(sc);
    NOW = keep;
    return { x, y: 540, z: 1.0 };
  }
  const cl = line as CamLine | null;
  if (cl && (cl.shot === "medium" || cl.shot === "close") && (cl.camAt || cl.offscreen || !sc.cast[cl.speaker])) {
    // static camera locked on a spot; whoever walks through passes the lens (reference walk-by shots)
    const ax = cl.camAt ? markX(sc, cl.camAt) : centerOf(sc);
    const z = cl.shot === "close" ? (vertical ? 2.2 : 2.35) : vertical ? 1.6 : 1.85;
    return { x: ax, y: cl.shot === "close" ? metaOf(sc).floor - 528 : metaOf(sc).floor - 420, z };
  }
  const v = vertical ? 1.05 : 1;
  const cx = centerOf(sc);
  if (!line) return { x: cx, y: 560, z: (STATIC ? 1 : 0.94 + since * 0.03) * v };
  const who = line.speaker;
  if (line.offscreen || !sc.cast[who]) return { x: cx, y: 560, z: 1.08 * v };
  const sp = posOf(sc, who), other = posOf(sc, otherOf(sc, who));
  const face = faceOf(sc, who);
  switch (line.shot) {
    case "two": {
      // 9:16 is narrow: when the group is wider than the frame, keep the speaker in shot
      if (!vertical) return { x: cx, y: 560, z: 1.08 };
      const half = 1080 / 2 / (1.08 * v) - 160;
      return { x: Math.min(Math.max(cx, sp.x - half), sp.x + half), y: 560, z: 1.08 * v };
    }
    case "medium": {
      const p0 = posAtTime(sc, who, line.start);
      const fx = p0.x + 70 * p0.facing, z = vertical ? 1.6 : 1.85;
      return { x: thirds(fx, p0.facing, z, vertical), y: metaOf(sc).floor - 420, z };
    }
    case "speaker": {
      const x = vertical ? face.x : sp.x + (other.x - sp.x) * 0.28;
      return { x, y: vertical ? 520 : 470, z: vertical ? 1.5 : 1.7 };
    }
    case "close": {
      const p0 = posAtTime(sc, who, line.start), z = vertical ? 2.2 : 2.35;
      return { x: thirds(p0.x + 70 * p0.facing, p0.facing, z, vertical), y: face.y + 70, z };
    }
    case "push": return { x: face.x, y: face.y + 40, z: STATIC ? 2.1 : 1.7 + Math.min(since / line.duration, 1) * 0.75 };
    case "crash": {
      // vertical frames are narrow: centre on the real face centre (face +24, minus the shock lean ≈ 63)
      const x = vertical ? sp.x - 40 * sp.facing : face.x - 20 * sp.facing; // shock pose leans back ~6°
      return { x, y: face.y - 30, z: STATIC || since < 1.1 ? 3.1 : 3.1 - (since - 1.1) * 0.25 };
    }
  }
}

function camera(t: number, vertical: boolean): { cam: Cam; shake: [number, number]; scene: Scene } {
  NOW = t;
  const { line, index, since, scene } = beatAt(t);
  const target = shotFor(scene, line, since, vertical);
  const lastSceneEnd = SCENES[SCENES.length - 1] === scene && t > END_OF_DIALOG + 0.4;
  if (lastSceneEnd) {
    const k = STATIC ? 1 : smooth((t - END_OF_DIALOG - 0.4) / 0.8);
    return { cam: mixCam(target, { x: centerOf(scene), y: 520, z: vertical ? 1.15 : 1.08 }, k), shake: [0, 0], scene };
  }
  const prevLine = index > 0 && LINES[index - 1].scene === scene.id ? LINES[index - 1] : null;
  const prev = shotFor(scene, prevLine, line ? line.start - (prevLine?.start ?? scene.start) : 0, vertical);
  const dur = line?.shot === "crash" ? 0.12 : editing.camera.cut === "hard" ? 1e-3 : 0.38;
  const cam = line ? mixCam(prev, target, smooth(since / dur)) : target;
  let amp = 0;
  const punch = editing.camera.punch && line && line.shot !== "crash" && !line.offscreen && (line.emotion === "surprised" || line.emotion === "shock") && since < 0.45;
  if (punch) {
    const k = since < 0.08 ? since / 0.08 : Math.max(0, 1 - (since - 0.08) / 0.37);
    cam.z *= 1 + 0.12 * k;
    amp = 8 * k;
  }
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
  if (editing.transition !== "cut") SCENES.slice(1).forEach((sc) => cues.push({ id: "whoosh_soft", frame: Math.max(0, Math.round((sc.start - 0.15) * FPS)) }));
  const last = LINES[LINES.length - 1];
  if (last && (last.listener === "defeated" || last.emotion === "defeated")) sfxLib.auto.endDefeated.forEach((s) => cues.push(parseAuto(s, END_OF_DIALOG)));
  return cues;
}
const CUES = buildCues();
/** CTA cerita Shorts (baris naskah dengan "cta"; hanya dirender di 9:16). */
const HOOK = (timelineData as unknown as { hook?: Hook }).hook;
const CTA_LINE = ctaLineOf(LINES as unknown as Parameters<typeof ctaLineOf>[0]);

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

/* Foreground framing element (blurred, close to the lens) — tree trunk / pillar / plant, as in the reference. */
const Foreground: React.FC<{ kind: string; w: number; h: number; side: number }> = ({ kind, w, h, side }) => {
  const W = kind === "plant" ? w * 0.26 : w * 0.17;
  const x = side < 0 ? 0 : w - W;
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0, filter: "blur(5px)" }}>
      {kind === "tree" && (
        <g>
          <path d={`M ${x + W * 0.1} -20 C ${x + W * 0.25} ${h * 0.4} ${x - W * 0.05} ${h * 0.7} ${x + W * 0.05} ${h + 20} L ${x + W * 0.95} ${h + 20} C ${x + W * 0.8} ${h * 0.6} ${x + W * 1.05} ${h * 0.3} ${x + W * 0.85} -20 Z`} fill="#5a3b22" />
          {[0.25, 0.45, 0.62, 0.8].map((k) => <path key={k} d={`M ${x + W * k} 0 Q ${x + W * (k + 0.06)} ${h / 2} ${x + W * k} ${h}`} stroke="#3b2414" strokeWidth={10} fill="none" opacity={0.7} />)}
        </g>
      )}
      {kind === "pillar" && <rect x={x} y={-20} width={W} height={h + 40} fill="#efe6d2" stroke="#1b1b1b" strokeWidth={8} />}
      {kind === "plant" && [0, 1, 2, 3, 4].map((i) => (
        <ellipse key={i} cx={x + W * (0.2 + i * 0.16)} cy={h - 60 - (i % 2) * 120} rx={W * 0.22} ry={h * 0.22} fill={i % 2 ? "#3f8a3a" : "#2f6f2c"} transform={`rotate(${-30 + i * 15} ${x + W * (0.2 + i * 0.16)} ${h})`} />
      ))}
    </svg>
  );
};

/* -------------------------------- main video --------------------------------- */
const KusakaMain: React.FC<{ vertical: boolean }> = ({ vertical }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { width: w, height: h } = useVideoConfig();
  const t = frame / FPS;
  NOW = t;
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
  const cur = beatAt(t);
  const closeLine = cur.line?.shot === "close" && !cur.line.offscreen && !!scene.cast[cur.line.speaker] ? (cur.line as CamLine & { closeStyle?: string }) : null;
  const dof = closeLine ? editing.camera.dofBlur : 0; // background only — characters are never blurred
  const spX = closeLine ? posOf(scene, closeLine.speaker).x : 0;
  // over-the-shoulder partner = the person being answered (previous speaker in this scene), else the nearest cast member
  const prevSpeaker = closeLine ? LINES.slice(0, cur.index).reverse().find((l) => l.scene === scene.id && l.speaker !== closeLine.speaker)?.speaker : undefined;
  const otsWho = closeLine?.closeStyle === "ots"
    ? (prevSpeaker && scene.cast[prevSpeaker] ? prevSpeaker
      : castOf(scene).filter((c) => c !== closeLine.speaker).sort((a, b) => Math.abs(posOf(scene, a).x - spX) - Math.abs(posOf(scene, b).x - spX))[0])
    : undefined;
  const otsSide = otsWho ? (posOf(scene, otsWho).x >= spX ? 1 : -1) : 1;
  const bgImage = (meta as { image?: string }).image;
  const Detail = DETAILS[scene.location] ?? DETAILS2[scene.location];
  const light: LightDef = (meta as { light?: LightDef }).light ?? { kind: "sun", from: -1 };
  const ijahNod = scene.location === "warung" && ijahTalk ? Math.sin(t * 9) * 5 : 0;

  return (
    <AbsoluteFill style={{ background: loc.bg }}>
      <svg width={w} height={h} style={{
        position: "absolute", inset: 0,
        filter: fbAmount > 0 ? `sepia(${fb.sepia * fbAmount}) saturate(${1 - (1 - fb.saturate) * fbAmount})` : "saturate(1.12) contrast(1.06)",
      }}>
        <g transform={`translate(${shake[0]} ${shake[1]})`}>
          <defs><filter id="dof" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={dof} /></filter></defs>
          <CharLightDefs light={light} />
          <g filter={dof > 0 ? "url(#dof)" : undefined}>
            {bgImage
              ? <Layer cam={cam} d={1} w={w} h={h}><image href={staticFile(bgImage)} x={0} y={0} width={1920} height={1080} preserveAspectRatio="xMidYMid slice" /></Layer>
              : loc.layers.map((l, i) => <Layer key={`${scene.id}-${i}`} cam={cam} d={l.d} w={w} h={h}>{l.el(t, { ijahNod, flag: trackAt(scene, "flag", t), flagInverted: scene.flagInverted, snag: trackAt(scene, "snag", t), gate: trackAt(scene, "gate", t), angkot: trackAt(scene, "angkot", t), board: trackAt(scene, "board", t), tower: trackAt(scene, "tower", t), ijahOut: !!scene.cast?.buIjah })}</Layer>)}
            {Detail && !bgImage && <Layer cam={cam} d={1} w={w} h={h}><Detail t={t} /></Layer>}
            {!bgImage && <Layer cam={cam} d={1} w={w} h={h}><Extras location={scene.location} t={t} density={(scene as { extras?: string }).extras} bag={hasBagScene(scene)} hat={hasHatScene(scene)} salute={trackAt(scene, "salute", t) ?? 0} /></Layer>}
            <Layer cam={cam} d={1} w={w} h={h}><SetLight light={light} t={t} floor={meta.floor} /></Layer>
          </g>
          <Layer cam={cam} d={1} w={w} h={h}>
            {castOf(scene).map((c) => {
              const p = posOf(scene, c);
              if (closeLine && c !== closeLine.speaker) return null; // single = only the speaker; ots partner is drawn in front below
              return <g key={`${scene.id}-${c}`}><g filter="url(#charlight)"><Character id={c} x={p.x} y={meta.floor} facing={p.facing} frame={frame} walk={p.walk} wear={wearOf(scene)} held={heldAt(c, NOW)} bag={bagOf(scene, c)} hat={hatOf(scene, c)} /></g></g>;
            })}
            {otsWho && (
              // over-the-shoulder: partner cheated to the frame edge in front of the lens, sharp but dark (foreground silhouette)
              <g style={{ filter: "brightness(0.38) saturate(0.7)" }}>
                <Character id={otsWho} x={cam.x + otsSide * (w / cam.z / 2 + 20)} y={meta.floor + 70} facing={otsSide > 0 ? -1 : 1} frame={frame} scale={1.2} wear={wearOf(scene)} held={heldAt(otsWho, NOW)} bag={bagOf(scene, otsWho)} hat={hatOf(scene, otsWho)} />
              </g>
            )}
          </Layer>
          {loc.front?.map((l, i) => <Layer key={`f${i}`} cam={cam} d={l.d} w={w} h={h}>{l.el(t)}</Layer>)}
        </g>
      </svg>
      <ScreenLight light={light} w={w} h={h} frame={frame} />
      {(cur.line as CamLine | null)?.fg && <Foreground kind={(cur.line as CamLine).fg!} w={w} h={h} side={scene.cast[cur.line!.speaker] ? posOf(scene, cur.line!.speaker).facing : -1} />}
      <FlashbackOverlay w={w} h={h} frame={frame} amount={fbAmount} />
      <SpeedLines w={w} h={h} frame={frame} opacity={speedOpacity} />
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash }} />}
      {!vertical && <LongWatermark />}
      <Caption t={t} vertical={vertical} />
      {vertical && <ShortsCta t={t} line={CTA_LINE} fps={FPS} w={w} h={h} />}
      {vertical && <ShortsHook t={t} start={LINES[0].start - 0.3} hook={HOOK} w={w} />}
      {SUBTITLES && <Subtitles t={t} vertical={vertical} w={w} />}
      {editing.transition !== "cut" && <Wipe t={t} w={w} h={h} />}

      {/* ---------------- audio ---------------- */}
      {/* lapisan suara suasana (ambience + musik latar) dengan ducking di bawah dialog */}
      {SCENES.flatMap((sc) => bedsOf(sc).flatMap((b) => {
        const L = BED_DUR[b.id], len = sc.end - sc.start, base = (bedsLib.beds as Record<string, { volume: number }>)[b.id].volume;
        const fd = bedsLib.fade[b.kind], D = bedsLib.duck, out: React.ReactNode[] = [];
        for (let off = 0; off < len - 0.05; off += L - 0.02) {
          out.push(
            <Sequence key={`bed-${sc.id}-${b.id}-${off.toFixed(2)}`} from={Math.round((sc.start + off) * FPS)} durationInFrames={Math.max(1, Math.round(Math.min(L, len - off) * FPS))}>
              <Audio src={staticFile(`beds/${b.id}.mp3`)} volume={(f) => {
                const tt = sc.start + off + f / FPS;
                const env = Math.max(0, Math.min(1, (tt - sc.start) / fd, (sc.end - tt) / fd));
                return base * env * duckAt(tt, D.under, D.attack, D.release);
              }} />
            </Sequence>,
          );
        }
        return out;
      }))}
      {SCENES.filter((sc) => !bedsOf(sc).some((b) => b.kind === "ambience")).map((sc) => {
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

/** Intro resmi (video panjang saja): SELALU di awal episode. Transisi masuk episode = "tembus cahaya":
 * intro diakhiri zoom menembus lencana ke cahaya hangat, lalu adegan pertama muncul dari cahaya (0,5 dtk) sambil kamera sedikit mundur. */
const INTRO_TRANSITION = 0.5;
export const KusakaWarung: React.FC<{ vertical: boolean }> = ({ vertical }) => {
  const frame = useCurrentFrame();
  const a = INTRO ? Math.round(INTRO.start * FPS) : -1, end = INTRO ? a + Math.round(INTRO.seconds * FPS) : -1;
  if (!vertical && INTRO && frame >= a && frame < end) {
    const Pick = INTRO.style === "A" ? Intro : INTRO.style === "B" ? IntroB : INTRO.style === "C" ? IntroC : IntroD;
    return <Sequence from={a}><Pick /></Sequence>;
  }
  const k = !vertical && INTRO ? (frame - end) / (INTRO_TRANSITION * FPS) : 1;
  const tr = k >= 0 && k < 1 ? 1 - k : 0;          // 1 → 0 selama transisi
  return (
    <AbsoluteFill>
      <AbsoluteFill style={tr > 0 ? { transform: `scale(${1 + 0.08 * tr * tr})` } : undefined}><KusakaMain vertical={vertical} /></AbsoluteFill>
      {tr > 0 && <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #fffaf0 0%, #ffe3b0 60%, #ffc98a 100%)", opacity: Math.pow(tr, 1.5) }} />}
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
