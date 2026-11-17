import React from "react";
import editing from "../edit/editing.json";
import { LINES } from "../lib/timeline";

/* Editing rule (locked in editing.json): on-screen text = subtitles + whitelisted captions ONLY. */
const OUT = "#1b1b1b";
const SUB = editing.subtitle;

/** Manga-style radial speed lines (screen space, no text) */
export const SpeedLines: React.FC<{ w: number; h: number; frame: number; opacity: number }> = ({ w, h, frame, opacity }) => {
  if (opacity <= 0) return null;
  const n = 64;
  const seed = Math.floor(frame / 2);
  const R = Math.hypot(w, h);
  const lines = Array.from({ length: n }).map((_, i) => {
    const a = (i / n) * Math.PI * 2 + Math.sin(seed * 12.9898 + i) * 0.04;
    const inner = R * (0.28 + ((Math.sin(seed * 78.233 + i * 3.1) + 1) / 2) * 0.12);
    const spread = 0.012 + ((Math.sin(i * 7.7 + seed) + 1) / 2) * 0.012;
    const p = (r: number, aa: number) => `${w / 2 + Math.cos(aa) * r} ${h / 2 + Math.sin(aa) * r}`;
    return `M ${p(inner, a)} L ${p(R, a - spread)} L ${p(R, a + spread)} Z`;
  });
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0, opacity }}>
      <defs>
        <radialGradient id="vig"><stop offset="55%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#000" stopOpacity={0.45} /></radialGradient>
      </defs>
      <rect width={w} height={h} fill="url(#vig)" />
      <path d={lines.join(" ")} fill="#111" />
    </svg>
  );
};

/** Karaoke subtitles synced to ElevenLabs word timestamps. No speaker label (locked). */
export const Subtitles: React.FC<{ t: number; vertical: boolean; w: number }> = ({ t, vertical, w }) => {
  const line = LINES.find((l) => t >= l.start - 0.05 && t < l.start + l.duration + 0.25);
  if (!line) return null;
  const local = t - line.start;
  const fs = vertical ? SUB.sizeVertical : SUB.sizeLandscape;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: vertical ? SUB.bottomVertical : SUB.bottomLandscape, display: "flex", justifyContent: "center", fontFamily: SUB.font }}>
      <div style={{ maxWidth: w * 0.8, textAlign: "center", fontSize: fs, lineHeight: 1.2, fontWeight: SUB.weight }}>
        {line.words.flatMap((wd, i) => {
          const on = SUB.karaoke && local >= wd.t;
          const word = (
            <span key={i} style={{
              color: on ? SUB.highlight : SUB.color, WebkitTextStroke: `${SUB.strokeWidth}px ${SUB.stroke}`, paintOrder: "stroke fill",
              display: "inline-block", transform: `scale(${on && local - wd.t < 0.12 ? 1.08 : 1})`, margin: SUB.karaoke ? `0 ${fs * 0.06}px` : 0,
            }}>{wd.w}</span>
          );
          return i > 0 ? [" ", word] : [word]; // real space between words (never merges)
        })}
      </div>
    </div>
  );
};

/** Scene caption (e.g. FLASHBACK, KEESOKAN HARINYA) — only whitelisted texts, validated at voice generation. */
export const Caption: React.FC<{ t: number; vertical: boolean }> = ({ t, vertical }) => {
  const line = LINES.find((l) => l.caption && t >= l.start - 0.3 && t < l.start + l.duration);
  if (!line?.caption || !editing.captions.includes(line.caption)) return null;
  const k = Math.min(1, (t - line.start + 0.3) / 0.3);
  return (
    <div style={{
      position: "absolute", top: vertical ? 230 : 50, left: vertical ? 44 : 60, padding: "8px 22px", borderRadius: 10,
      background: "rgba(0,0,0,0.55)", color: "#fff", fontFamily: SUB.font, fontWeight: 800, fontSize: vertical ? 44 : 38,
      letterSpacing: 3, opacity: k, transform: `translateX(${(1 - k) * -30}px)`,
    }}>{line.caption}</div>
  );
};

/** Flashback look: sepia/desaturated world + vignette + film grain (overlay part). */
export const FlashbackOverlay: React.FC<{ w: number; h: number; frame: number; amount: number }> = ({ w, h, frame, amount }) => {
  if (amount <= 0) return null;
  const fb = editing.flashback;
  const dots = Array.from({ length: 70 }).map((_, i) => {
    const x = ((Math.sin(i * 91.7 + frame * 13.1) + 1) / 2) * w, y = ((Math.sin(i * 47.3 + frame * 7.7) + 1) / 2) * h;
    return <circle key={i} cx={x} cy={y} r={1 + (i % 3)} fill={i % 2 ? "#fff" : "#000"} opacity={0.35} />;
  });
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0, opacity: amount, pointerEvents: "none" }}>
      <defs><radialGradient id="fbvig"><stop offset="50%" stopColor="#2b1d0e" stopOpacity={0} /><stop offset="100%" stopColor="#2b1d0e" stopOpacity={fb.vignette} /></radialGradient></defs>
      <rect width={w} height={h} fill="url(#fbvig)" />
      {fb.grain && dots}
    </svg>
  );
};
