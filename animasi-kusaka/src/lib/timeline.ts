import timeline from "../data/timeline.json";
import canon from "../characters/canon.json";
import { direct } from "../edit/director";

export type CharId = keyof typeof canon.characters;
export type Viseme = "rest" | "A" | "I" | "U" | "E" | "O" | "M" | "F" | "consonant";
export type Emotion =
  | "neutral" | "smug" | "suspicious" | "shock" | "laugh" | "pleading" | "deadpan"
  | "surprised" | "embarrassed" | "defeated";
export type Action =
  | "idle" | "gesture" | "pocket" | "chin" | "point" | "plead" | "crossed" | "shock" | "laugh" | "slump"
  | "wave" | "thumbsup" | "peace" | "facepalm" | "hips" | "phone"
  | "hold" | "carry" | "give" | "show" | "read" | "pull" | "salute" | "shoot" | "drink" | "eat" | "write" | "sweep" | "blow"
  | "reach" | "photo"; // Eps. 5: meraih rak atas, memotret dengan HP

export interface Line {
  id: string; speaker: CharId; emotion: Emotion; listener: Emotion; shot: "two" | "speaker" | "medium" | "close" | "wide" | "push" | "crash";
  text: string; audio: string; start: number; duration: number; surprise?: boolean; action?: string;
  caption?: string; flashback?: boolean; hold?: Record<string, string | { item: string; hand?: "front" | "back" } | null>; sfx?: { id: string; at: number | "end" }[];
  scene: string; offscreen?: boolean; reactions?: Record<string, string[]>;
  visemes: { t: number; v: Viseme }[]; words: { w: string; t: number }[];
}

export type Mark = "A" | "B" | "C" | "D";
export interface Scene { id: string; location: string; cast: Record<string, { mark: Mark; facing: 1 | -1 }>; start: number; end: number; wear?: "seragam" | "bebas" | "rumah";
  bag?: boolean | string[]; hat?: boolean; music?: string; amb?: string[]; hold?: Record<string, string | { item: string; hand?: "front" | "back" }>; tracks?: Record<string, [string, number][]>; flagInverted?: boolean }

export const FPS: number = timeline.fps;
export const LINES = direct(timeline.lines as unknown as Line[]);
export const SCENES = (timeline as unknown as { scenes: Scene[] }).scenes;
export const TOTAL_SECONDS: number = timeline.totalSeconds;
/** Intro 10 dtk (video panjang): disisipkan setelah adegan pembuka; semua waktu setelahnya sudah bergeser. */
export const INTRO = (timeline as unknown as { intro?: { start: number; seconds: number; style?: "A" | "B" | "C" | "D" } }).intro ?? null;
/** false bila naskah memakai "subtitles": false (subtitle tidak dirender). */
export const SUBTITLES: boolean = (timeline as unknown as { subtitles?: boolean }).subtitles !== false;
export const TOTAL_FRAMES = Math.ceil(TOTAL_SECONDS * FPS);
export const END_OF_DIALOG = LINES[LINES.length - 1].start + LINES[LINES.length - 1].duration;

export function sceneAt(t: number): Scene {
  for (const s of SCENES) if (t >= s.start && t < s.end) return s;
  return t < SCENES[0].start ? SCENES[0] : SCENES[SCENES.length - 1];
}
const sceneLines = (sc: Scene) => LINES.filter((l) => l.scene === sc.id);

/** Line whose "beat" covers time t, limited to the current scene. */
export function beatAt(t: number): { line: Line | null; index: number; since: number; scene: Scene } {
  const scene = sceneAt(t);
  let idx = -1;
  for (let i = 0; i < LINES.length; i++) if (LINES[i].scene === scene.id && LINES[i].start <= t) idx = i;
  if (idx < 0) return { line: null, index: -1, since: t - scene.start, scene };
  return { line: LINES[idx], index: idx, since: t - LINES[idx].start, scene };
}
export const isLastOfScene = (l: Line) => { const ls = LINES.filter((x) => x.scene === l.scene); return ls[ls.length - 1] === l; };

export function speakingLine(char: CharId, t: number): Line | null {
  return LINES.find((l) => l.speaker === char && !l.offscreen && t >= l.start && t < l.start + l.duration) ?? null;
}

/** Current mouth viseme for a character (null = not speaking). */
export function visemeAt(char: CharId, t: number): Viseme | null {
  const l = speakingLine(char, t);
  if (!l) return null;
  const local = t - l.start;
  const last = l.visemes[l.visemes.length - 1];
  if (last && local > last.t + 0.22) return "rest";
  let v: Viseme = "rest";
  for (const x of l.visemes) { if (x.t <= local + 0.02) v = x.v; else break; }
  return v;
}

const listenerAction = (e: Emotion): Action =>
  e === "suspicious" ? "chin" : e === "deadpan" ? "crossed" : e === "defeated" ? "slump" : e === "shock" ? "shock" : "idle";

/** Emotion & body action a character holds during the current beat (scene-aware, with per-character reactions). */
export function stateAt(char: CharId, t: number): { emotion: Emotion; action: Action; since: number; line: Line | null } {
  const { line, since, scene } = beatAt(t);
  if (!line) return { emotion: "neutral", action: "idle", since: t - scene.start, line };
  const speaking = line.speaker === char && !line.offscreen;
  const react = line.reactions?.[char];
  const emotion: Emotion = speaking ? line.emotion : (react?.[0] as Emotion) ?? line.listener;
  let action: Action;
  if (speaking) {
    action = (line.action as Action) ?? "gesture";
    if (emotion === "shock" && !line.action) action = "shock";
    if (emotion === "laugh" && !line.action) action = "laugh";
  } else {
    action = (react?.[1] as Action) ?? listenerAction(emotion);
  }
  return { emotion, action, since, line };
}
void sceneLines;

/* ---------- properti & benda adegan (kanon v3.2.0) ---------- */
type HoldVal = string | { item: string; hand?: "front" | "back" } | null | HoldVal[];
/** Nilai hold boleh berupa daftar yang diterapkan berurutan, mis. [null, {"item":"lotteryBox","hand":"back"}, "lotSlip"]. */
/** Benda yang dipegang tiap tangan karakter pada waktu t: awal dari scene.hold, lalu diubah oleh "hold" di baris naskah. */
export function heldAt(char: CharId, t: number): { front?: string; back?: string } {
  const { scene, index } = beatAt(t);
  const out: { front?: string; back?: string } = {};
  const apply = (v: HoldVal | undefined) => {
    if (v === undefined) return;
    if (Array.isArray(v)) { v.forEach(apply); return; }
    if (v === null) { delete out.front; delete out.back; return; }
    const item = typeof v === "string" ? v : v.item, hand = typeof v === "string" ? "front" : v.hand ?? "front";
    out[hand] = item;
  };
  apply(scene.hold?.[char] as HoldVal | undefined);
  for (let i = 0; i <= index; i++) { const l = LINES[i]; if (l.scene === scene.id && l.hold) apply(l.hold[char]); }
  return out;
}
/** Waktu (detik) dari kunci "l007" (awal baris) atau "l007:end" (akhir baris). */
const keyTime = (k: string): number => {
  const [id, mod] = k.split(":");
  const l = LINES.find((x) => x.id === id);
  if (!l) return 0;
  return mod === "end" ? l.start + l.duration : l.start;
};
/** Nilai trek animasi benda adegan (gerbang, bendera, angkot, hormat, tali nyangkut) — interpolasi linear antar kunci. undefined = tidak ada trek. */
export function trackAt(scene: Scene, name: string, t: number): number | undefined {
  const keys = scene.tracks?.[name];
  if (!keys?.length) return undefined;
  const ks = keys.map(([k, v]) => [keyTime(k), v] as [number, number]).sort((a, b) => a[0] - b[0]);
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const [t0, v0] = ks[i - 1], [t1, v1] = ks[i]; return t1 === t0 ? v1 : v0 + (v1 - v0) * ((t - t0) / (t1 - t0)); }
  return ks[ks.length - 1][1];
}

/* ---------- lapisan suara suasana: ducking di bawah dialog (src/audio/beds.json) ---------- */
/** Faktor volume bed pada waktu t: 1 saat hening, turun ke `under` saat ada yang bicara (attack sebelum baris, release sesudahnya). */
export function duckAt(t: number, under: number, attack: number, release: number): number {
  let g = 1;
  for (const l of LINES) {
    const s = l.start, e = l.start + l.duration;
    if (t < s - attack || t > e + release) continue;
    const k = t < s ? (s - t) / attack : t > e ? (t - e) / release : 0; // 0 = penuh tertekan
    g = Math.min(g, under + (1 - under) * Math.min(1, k));
  }
  return g;
}
