import timeline from "../data/timeline.json";
import canon from "../characters/canon.json";

export type CharId = keyof typeof canon.characters;
export type Viseme = "rest" | "A" | "I" | "U" | "E" | "O" | "M" | "F" | "consonant";
export type Emotion =
  | "neutral" | "smug" | "suspicious" | "shock" | "laugh" | "pleading" | "deadpan"
  | "surprised" | "embarrassed" | "defeated";
export type Action =
  | "idle" | "gesture" | "pocket" | "chin" | "point" | "plead" | "crossed" | "shock" | "laugh" | "slump"
  | "wave" | "thumbsup" | "peace" | "facepalm" | "hips" | "phone";

export interface Line {
  id: string; speaker: CharId; emotion: Emotion; listener: Emotion; shot: "two" | "speaker" | "push" | "crash";
  text: string; audio: string; start: number; duration: number; surprise?: boolean; action?: string;
  visemes: { t: number; v: Viseme }[]; words: { w: string; t: number }[];
}

export const FPS: number = timeline.fps;
export const LINES = timeline.lines as Line[];
export const TOTAL_SECONDS: number = timeline.totalSeconds;
export const TOTAL_FRAMES = Math.ceil(TOTAL_SECONDS * FPS);
export const END_OF_DIALOG = LINES[LINES.length - 1].start + LINES[LINES.length - 1].duration;

/** Line whose "beat" covers time t (from its start until the next line starts). */
export function beatAt(t: number): { line: Line | null; index: number; since: number } {
  let idx = -1;
  for (let i = 0; i < LINES.length; i++) if (LINES[i].start <= t) idx = i;
  if (idx < 0) return { line: null, index: -1, since: t };
  return { line: LINES[idx], index: idx, since: t - LINES[idx].start };
}

export function speakingLine(char: CharId, t: number): Line | null {
  return LINES.find((l) => l.speaker === char && t >= l.start && t < l.start + l.duration) ?? null;
}

/** Current mouth viseme for a character (null = not speaking). */
export function visemeAt(char: CharId, t: number): Viseme | null {
  const l = speakingLine(char, t);
  if (!l) return null;
  const local = t - l.start;
  // Let the mouth close a little before the audio file's trailing silence.
  const last = l.visemes[l.visemes.length - 1];
  if (last && local > last.t + 0.22) return "rest";
  let v: Viseme = "rest";
  for (const x of l.visemes) { if (x.t <= local + 0.02) v = x.v; else break; }
  return v;
}

/** Emotion & body action a character holds during the current beat. */
export function stateAt(char: CharId, t: number): { emotion: Emotion; action: Action; since: number; line: Line | null } {
  const { line, since } = beatAt(t);
  if (!line) return { emotion: "neutral", action: "idle", since: t, line };
  // After the final line: Kusaka slumps in defeat, Ujang stays smug-deadpan
  if (t > END_OF_DIALOG + 0.4) {
    return char === "kusaka"
      ? { emotion: "defeated", action: "slump", since: t - END_OF_DIALOG - 0.4, line }
      : { emotion: "smug", action: "crossed", since: t - END_OF_DIALOG - 0.4, line };
  }
  const speaking = line.speaker === char;
  const emotion = speaking ? line.emotion : line.listener;
  let action: Action = "idle";
  if (speaking) {
    action = (line.action as Action) ?? "gesture";
    if (emotion === "shock") action = "shock";
    if (emotion === "laugh" && !line.action) action = "laugh";
  } else {
    if (emotion === "suspicious") action = "chin";
    if (emotion === "deadpan") action = "crossed";
    if (emotion === "embarrassed") action = "idle";
  }
  return { emotion, action, since, line };
}
