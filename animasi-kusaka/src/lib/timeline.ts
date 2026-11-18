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
  | "wave" | "thumbsup" | "peace" | "facepalm" | "hips" | "phone";

export interface Line {
  id: string; speaker: CharId; emotion: Emotion; listener: Emotion; shot: "two" | "speaker" | "medium" | "close" | "wide" | "push" | "crash";
  text: string; audio: string; start: number; duration: number; surprise?: boolean; action?: string;
  caption?: string; flashback?: boolean; sfx?: { id: string; at: number | "end" }[];
  scene: string; offscreen?: boolean; reactions?: Record<string, string[]>;
  visemes: { t: number; v: Viseme }[]; words: { w: string; t: number }[];
}

export type Mark = "A" | "B" | "C" | "D";
export interface Scene { id: string; location: string; cast: Record<string, { mark: Mark; facing: 1 | -1 }>; start: number; end: number }

export const FPS: number = timeline.fps;
export const LINES = direct(timeline.lines as unknown as Line[]);
export const SCENES = (timeline as unknown as { scenes: Scene[] }).scenes;
export const TOTAL_SECONDS: number = timeline.totalSeconds;
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
