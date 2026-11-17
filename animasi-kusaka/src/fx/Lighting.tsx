import React from "react";
import { AbsoluteFill } from "remotion";

/* Locked lighting look (locations.json → light). Warm graded light, sun glow + rays, dappled leaf shadows,
   window shafts, character cel-shading and rim light, vignette and film grain. Pictures only, never text. */
export type LightKind = "sun" | "window" | "sunset" | "night";
export interface LightDef { kind: LightKind; from: 1 | -1; leaves?: boolean }

const TONE: Record<LightKind, { warm: string; warmOp: number; glow: string; glowOp: number; shade: string; rays: number }> = {
  sun: { warm: "#ffd9a0", warmOp: 0.2, glow: "#fff1c4", glowOp: 0.45, shade: "#3b2d55", rays: 0.05 },
  window: { warm: "#ffe4b8", warmOp: 0.18, glow: "#fff4d8", glowOp: 0.35, shade: "#3a3350", rays: 0.16 },
  sunset: { warm: "#ffb070", warmOp: 0.3, glow: "#ffcf8a", glowOp: 0.5, shade: "#4a2c4a", rays: 0.18 },
  night: { warm: "#2b3a6b", warmOp: 0.38, glow: "#ffcf7a", glowOp: 0.4, shade: "#141a33", rays: 0 },
};

const svgUri = (body: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" preserveAspectRatio="none">${body}</svg>`)}`;

/** SVG filter defs for character shading; reference with filter="url(#charlight)". */
export const CharLightDefs: React.FC<{ light: LightDef }> = ({ light }) => {
  const tone = TONE[light.kind];
  const lit = light.from < 0 ? ["0", "1"] : ["1", "0"];
  const shadeImg = svgUri(`<defs><linearGradient id="g" x1="${lit[0]}" x2="${lit[1]}" y1="0" y2="0"><stop offset="0.45" stop-color="${tone.shade}" stop-opacity="0"/><stop offset="1" stop-color="${tone.shade}" stop-opacity="${light.kind === "night" ? 0.55 : 0.42}"/></linearGradient></defs><rect width="100" height="100" fill="url(#g)"/>`);
  const rimImg = svgUri(`<defs><linearGradient id="r" x1="${lit[0]}" x2="${lit[1]}" y1="0" y2="0"><stop offset="0" stop-color="${tone.glow}" stop-opacity="0.55"/><stop offset="0.18" stop-color="${tone.glow}" stop-opacity="0"/></linearGradient></defs><rect width="100" height="100" fill="url(#r)"/>`);
  return (
    <defs>
      <filter id="charlight" x="0" y="0" width="1" height="1" primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
        <feImage href={shadeImg} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="shadeRaw" />
        <feComposite in="shadeRaw" in2="SourceAlpha" operator="in" result="shade" />
        <feBlend in="shade" in2="SourceGraphic" mode="multiply" result="shaded" />
        <feImage href={rimImg} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="rimRaw" />
        <feComposite in="rimRaw" in2="SourceAlpha" operator="in" result="rim" />
        <feBlend in="rim" in2="shaded" mode="screen" />
      </filter>
    </defs>
  );
};

/** World-space light painted onto the set (behind characters): leaf dapple, window shafts, floor light pool. */
export const SetLight: React.FC<{ light: LightDef; t: number; floor: number }> = ({ light, t, floor }) => (
  <g>
    <filter id="paint" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves={3} seed={7} /><feColorMatrix type="saturate" values="0" /></filter>
    <rect x={-400} y={-200} width={2720} height={1500} filter="url(#paint)" opacity={0.12} style={{ mixBlendMode: "multiply" }} />
    <SetLightInner light={light} t={t} floor={floor} />
  </g>
);

const SetLightInner: React.FC<{ light: LightDef; t: number; floor: number }> = ({ light, t, floor }) => {
  const sway = Math.sin(t * 0.8) * 10;
  if (light.kind === "sun" && light.leaves) {
    const blobs = Array.from({ length: 70 }).map((_, i) => {
      const x = ((i * 397) % 2400) - 240 + sway * ((i % 3) - 1);
      const y = floor - 520 + ((i * 211) % 640);
      const r = 18 + ((i * 53) % 46);
      return <ellipse key={i} cx={x} cy={y} rx={r * 1.6} ry={r} transform={`rotate(${(i * 37) % 180} ${x} ${y})`} />;
    });
    return (
      <g style={{ mixBlendMode: "multiply" }} opacity={0.13}>
        <filter id="leafblur"><feGaussianBlur stdDeviation={6} /></filter>
        <g fill="#3b2d55" filter="url(#leafblur)">{blobs}</g>
      </g>
    );
  }
  if (light.kind === "window" || light.kind === "sunset") {
    const x0 = light.from < 0 ? -200 : 2120;
    const shafts = [0, 1, 2].map((i) => {
      const a = x0 + light.from * -1 * (120 + i * 230);
      const b = a + light.from * -1 * 520;
      return <path key={i} d={`M ${a} 120 L ${a + light.from * -1 * 140} 120 L ${b + light.from * -1 * 260} ${floor + 120} L ${b} ${floor + 120} Z`} />;
    });
    return (
      <g style={{ mixBlendMode: "screen" }} opacity={light.kind === "sunset" ? 0.3 : 0.22}>
        <filter id="shaftblur"><feGaussianBlur stdDeviation={18} /></filter>
        <g fill={TONE[light.kind].glow} filter="url(#shaftblur)">{shafts}</g>
      </g>
    );
  }
  return null;
};

/** Screen-space grade on top of everything (except subtitles/watermark). */
export const ScreenLight: React.FC<{ light: LightDef; w: number; h: number; frame: number }> = ({ light, w, h, frame }) => {
  const tone = TONE[light.kind];
  const sx = light.from < 0 ? "0%" : "100%";
  const t = frame / 30;
  const rays = tone.rays > 0
    ? Array.from({ length: 6 }).map((_, i) => {
        const ang = (light.from < 0 ? 18 : 162) + i * (light.from < 0 ? 9 : -9) + Math.sin(t * 0.4 + i) * 1.5;
        const rad = (ang * Math.PI) / 180, L = Math.hypot(w, h) * 1.2, spread = 0.035 + (i % 3) * 0.012;
        const ox = light.from < 0 ? -w * 0.05 : w * 1.05, oy = -h * 0.12;
        const p = (a: number) => `${ox + Math.cos(a) * L} ${oy + Math.sin(a) * L}`;
        return <path key={i} d={`M ${ox} ${oy} L ${p(rad - spread)} L ${p(rad + spread)} Z`} opacity={0.5 + 0.5 * Math.sin(t * 0.6 + i * 1.7)} />;
      })
    : null;
  return (
    <>
      <AbsoluteFill style={{ background: tone.warm, opacity: tone.warmOp, mixBlendMode: light.kind === "night" ? "multiply" : "soft-light" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 80% at ${sx} 0%, ${tone.glow} 0%, transparent 65%)`, opacity: tone.glowOp, mixBlendMode: "screen" }} />
      {rays && (
        <svg width={w} height={h} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: tone.rays, filter: "blur(14px)" }}>
          <g fill={tone.glow}>{rays}</g>
        </svg>
      )}
      <AbsoluteFill style={{ background: `linear-gradient(${light.from < 0 ? "90deg" : "270deg"}, transparent 55%, ${tone.shade} 100%)`, opacity: 0.18, mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 80% at 50% 45%, transparent 55%, #000 100%)", opacity: light.kind === "night" ? 0.45 : 0.2, mixBlendMode: "multiply" }} />
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, opacity: 0.07, mixBlendMode: "overlay" }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={Math.floor(frame / 2) % 50} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={w} height={h} filter="url(#grain)" />
      </svg>
    </>
  );
};
