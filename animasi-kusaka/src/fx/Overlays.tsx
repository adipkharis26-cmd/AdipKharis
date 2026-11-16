import React from "react";
import { interpolate, spring } from "remotion";
import { CharId, FPS, LINES } from "../lib/timeline";

const OUT = "#1b1b1b";

/** Manga-style radial speed lines (screen space) */
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

const NAME_COLOR: Record<CharId, string> = { kusaka: "#e63946", ujang: "#2f7fd8" };

/** Karaoke-style subtitles synced to ElevenLabs word timestamps */
export const Subtitles: React.FC<{ t: number; vertical: boolean; w: number }> = ({ t, vertical, w }) => {
  const line = LINES.find((l) => t >= l.start - 0.05 && t < l.start + l.duration + 0.25);
  if (!line) return null;
  const local = t - line.start;
  const fs = vertical ? 58 : 52;
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: vertical ? 360 : 60, display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "Baloo2", gap: 6,
    }}>
      <div style={{
        background: NAME_COLOR[line.speaker], color: "#fff", fontSize: fs * 0.62, padding: "0 22px", borderRadius: 14,
        border: `5px solid ${OUT}`, transform: "rotate(-2deg)", fontFamily: "Bangers", letterSpacing: 2,
      }}>{line.speaker.toUpperCase()}</div>
      <div style={{ maxWidth: w * 0.86, textAlign: "center", fontSize: fs, lineHeight: 1.15, fontWeight: 800 }}>
        {line.words.map((wd, i) => {
          const on = local >= wd.t;
          return (
            <span key={i} style={{
              color: on ? "#ffe14d" : "#ffffff", WebkitTextStroke: `10px ${OUT}`, paintOrder: "stroke fill",
              display: "inline-block", marginRight: fs * 0.28,
              transform: `scale(${on && local - wd.t < 0.12 ? 1.12 : 1})`,
            }}>{wd.w}</span>
          );
        })}
      </div>
    </div>
  );
};

export const TitleCard: React.FC<{ frame: number; vertical: boolean }> = ({ frame, vertical }) => {
  const s = spring({ frame: frame - 4, fps: FPS, config: { damping: 9, stiffness: 140 } });
  const out = interpolate(frame, [FPS * 1.8, FPS * 2.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (out >= 1) return null;
  const big = vertical ? 190 : 210;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      transform: `translateY(${-out * 1200}px)` }}>
      <div style={{ fontFamily: "Bangers", fontSize: big, color: "#ffd23f", WebkitTextStroke: `16px ${OUT}`, paintOrder: "stroke fill",
        transform: `scale(${s}) rotate(${-6 + s * 2}deg)`, letterSpacing: 8, textShadow: "12px 12px 0 #e63946" }}>KUSAKA</div>
      <div style={{ fontFamily: "Baloo2", fontSize: big * 0.3, color: "#fff", WebkitTextStroke: `8px ${OUT}`, paintOrder: "stroke fill",
        opacity: s, marginTop: -10 }}>Eps. Traktiran Gagal</div>
    </div>
  );
};

export const EndCard: React.FC<{ since: number; vertical: boolean }> = ({ since, vertical }) => {
  if (since < 0) return null;
  const s = spring({ frame: since * FPS, fps: FPS, config: { damping: 10 } });
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: vertical ? "flex-start" : "center", justifyContent: "center",
      paddingTop: vertical ? 260 : 0, background: `rgba(0,0,0,${0.35 * Math.min(1, since * 2)})` }}>
      <div style={{ fontFamily: "Bangers", fontSize: vertical ? 140 : 150, color: "#fff", WebkitTextStroke: `12px ${OUT}`, paintOrder: "stroke fill",
        transform: `scale(${s}) rotate(-4deg)`, letterSpacing: 6, textShadow: "10px 10px 0 #2f7fd8" }}>BERSAMBUNG...</div>
    </div>
  );
};
