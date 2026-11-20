import React from "react";
import editing from "../edit/editing.json";
import brand from "./brand.json";

/* TEKS HOOK Shorts (pemilik, 20 Nov 2026) — editing.json → shortsHook.
 * 1–2 detik pertama Shorts: 1–2 baris teks besar (putih, outline hitam, kata kunci kuning) di sepertiga atas,
 * "meletup" kata demi kata lalu hilang cepat. Memberi tahu premis/konflik sebelum penonton menggeser,
 * juga untuk penonton tanpa suara. Naskah: "hook": { "lines": ["TIPE TEMAN", "KERJA KELOMPOK"], "keywords": ["KERJA", "KELOMPOK"], "seconds": 1.6 }.
 * Hanya Shorts; tidak menutupi wajah (posisi atas), tidak bertabrakan dengan watermark (di bawahnya). */
const CFG = editing.shortsHook;
const OUT = "#1b1b1b";
const back = (x: number) => { const k = Math.min(Math.max(x, 0), 1); const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
export interface Hook { lines: string[]; keywords?: string[]; seconds?: number }

/** `t` = waktu timeline; `start` = detik timeline saat Shorts dimulai. */
export const ShortsHook: React.FC<{ t: number; start: number; hook: Hook | undefined; w: number }> = ({ t, start, hook, w }) => {
  if (!hook) return null;
  const dur = hook.seconds ?? CFG.seconds, u = t - start;
  if (u < 0 || u > dur) return null;
  const out = Math.min(1, (dur - u) / CFG.fadeOut);
  const keys = (hook.keywords ?? []).map((k) => k.toUpperCase());
  let n = 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: CFG.top, display: "flex", flexDirection: "column", alignItems: "center", opacity: out }}>
      {hook.lines.map((ln, li) => (
        <div key={li} style={{ maxWidth: w * 0.9, textAlign: "center", fontFamily: CFG.font, fontSize: li === 0 ? CFG.fontSize : CFG.fontSize * CFG.secondScale, lineHeight: 1.05 }}>
          {ln.split(/\s+/).map((wd, i) => {
            const k = back((u - n++ * CFG.wordStep) / 0.18);
            const key = keys.includes(wd.toUpperCase().replace(/[?!.,]/g, "")) || keys.includes(wd.toUpperCase());
            return (
              <span key={i} style={{ display: "inline-block", margin: `0 ${CFG.fontSize * 0.12}px`, color: key ? brand.palette.yellow : "#fff",
                WebkitTextStroke: `${CFG.stroke}px ${OUT}`, paintOrder: "stroke fill", transform: `scale(${k}) rotate(${CFG.rot}deg)`, opacity: Math.min(1, k * 1.5),
                filter: "drop-shadow(0 7px 0 rgba(0,0,0,0.4))" }}>{wd}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
