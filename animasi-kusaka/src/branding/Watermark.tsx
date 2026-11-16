import React from "react";
import { Logo } from "./Brand";
import brand from "./brand.json";

/* LOCKED Shorts watermark (brand.json → watermark): style 5 — translucent dark pill, Logo 2 + KUSAKA / DESIGN,
 * top-left, Shorts (9:16) only. The only on-screen text besides subtitles & official captions. */
const MiniLogo: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, position: "relative", flex: "none" }}>
    <div style={{ width: 800, height: 800, transform: `scale(${size / 800})`, transformOrigin: "0 0", position: "absolute" }}><Logo variant={2} /></div>
  </div>
);
export const ShortsWatermark: React.FC = () => {
  const w = brand.watermark;
  return (
    <div style={{ position: "absolute", top: w.top, left: w.left, display: "flex", alignItems: "center", gap: 14,
      background: "rgba(27,27,27,0.55)", borderRadius: 60, padding: "8px 26px 8px 8px" }}>
      <MiniLogo size={88} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: "Bangers", fontSize: 46, color: brand.palette.yellow, letterSpacing: 2, lineHeight: 1 }}>KUSAKA</div>
        <div style={{ fontFamily: "Baloo2", fontWeight: 800, fontSize: 24, color: "#fff", letterSpacing: 8 }}>DESIGN</div>
      </div>
    </div>
  );
};
