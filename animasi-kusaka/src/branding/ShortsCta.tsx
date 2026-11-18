import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import editing from "../edit/editing.json";
import sfxLib from "../audio/sfx.json";
import brand from "./brand.json";
import { Portrait } from "../characters/Character";
import type { CharId, Emotion } from "../lib/timeline";

/* CTA CERITA (native CTA) untuk Shorts & Reels — editing.json → shortsCta (pemilik, 18 Nov 2026, referensi "kaki anjing").
 * Bukan tombol tempelan. CTA adalah SATU BARIS DIALOG tokoh yang memberi alasan lucu untuk like / kirim / ikuti, ditambah:
 *  1) teks besar di sepertiga atas (putih, outline hitam, kata kunci kuning) — ajakan atau pertanyaan pemancing,
 *  2) SISIPAN (cutaway) seperti referensi: latar lokasi diburamkan, ikon raksasa bergaya seri di tengah, "ditekan",
 *     meledak jadi hati / pesawat kertas / bintang, lalu tokoh "korban" lelucon MUNCUL dari dalam lingkaran tombol
 *     ("reveal", mis. wajah Bapak kaget) — ikon berubah jadi bagian cerita. Potong keras masuk & keluar.
 * Netral platform (YouTube Shorts + Instagram Reels): kata "like", "kirim", "ikuti" — tidak memakai "subscribe".
 * Naskah: baris dengan "cta": { "kind": "like" | "kirim" | "ikuti", "text": "LIKE biar Bapak VIRAL!", "keywords": ["LIKE","VIRAL!"] }
 * Maksimal satu per Shorts; posisi bergantian antar-Shorts (tengah setelah punchline / akhir sebelum kalimat loop). */
export type CtaKind = "like" | "kirim" | "ikuti";
export interface CtaLine { start: number; duration: number; cta?: { kind: CtaKind; text: string; keywords?: string[]; reveal?: string; revealEmotion?: string } }

const CFG = editing.shortsCta;
const OUT = "#1b1b1b";
const ease = (x: number) => { const k = Math.min(Math.max(x, 0), 1); return 1 - Math.pow(1 - k, 3); };
const back = (x: number) => { const k = Math.min(Math.max(x, 0), 1); const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };

/* ikon dalam gaya seri: lingkaran putih ber-ring, isi biru, simbol kuning/putih, outline tebal */
const Glyph: React.FC<{ kind: CtaKind; on: boolean }> = ({ kind, on }) => {
  if (kind === "like") return (
    <path d="M -56 -6 L -30 -6 L -30 60 L -56 60 Z M -20 60 L 34 60 Q 50 60 53 44 L 62 -2 Q 65 -20 47 -20 L 12 -20 L 18 -46 Q 18 -66 0 -64 L -20 -12 Z"
      fill={on ? brand.palette.yellow : "#fff"} stroke={OUT} strokeWidth={8} strokeLinejoin="round" />
  );
  if (kind === "kirim") return (
    <g stroke={OUT} strokeWidth={8} strokeLinejoin="round">
      <path d="M -60 -6 L 62 -54 L 24 62 L 2 18 Z" fill={on ? brand.palette.yellow : "#fff"} />
      <path d="M 2 18 L 62 -54" fill="none" />
    </g>
  );
  return (
    <g stroke={OUT} strokeWidth={8} strokeLinejoin="round" fill={on ? brand.palette.yellow : "#fff"}>
      <circle cx={-12} cy={-22} r={24} />
      <path d="M -54 52 Q -52 8 -12 8 Q 28 8 30 52 Z" />
      <path d="M 44 -14 L 44 22 M 26 4 L 62 4" stroke={OUT} strokeWidth={22} strokeLinecap="round" fill="none" />
      <path d="M 44 -14 L 44 22 M 26 4 L 62 4" stroke={on ? brand.palette.yellow : "#fff"} strokeWidth={10} strokeLinecap="round" fill="none" />
    </g>
  );
};
const Particle: React.FC<{ kind: CtaKind }> = ({ kind }) =>
  kind === "like" || kind === "ikuti"
    ? <path d="M 0 10 C -22 -6 -14 -26 0 -14 C 14 -26 22 -6 0 10 Z" fill={kind === "like" ? brand.palette.red : brand.palette.yellow} stroke={OUT} strokeWidth={3} />
    : <path d="M -14 0 L 14 -10 L 6 14 L 1 4 Z" fill="#fff" stroke={OUT} strokeWidth={3} strokeLinejoin="round" />;

export const ctaLineOf = <T extends CtaLine>(lines: T[]) => lines.find((l) => l.cta);

/** Overlay CTA cerita (9:16) — sisipan layar penuh selama baris CTA. `t` = waktu timeline. */
export const ShortsCta: React.FC<{ t: number; line: CtaLine | undefined; fps: number; w: number; h: number }> = ({ t, line, fps, w, h }) => {
  if (!line?.cta) return null;
  const { kind, text, keywords = [], reveal, revealEmotion = "shock" } = line.cta;
  const start = line.start - 0.05, end = line.start + line.duration + CFG.hold;
  const D = end - start;
  const tap = start + D * CFG.tapAt, rev = start + D * CFG.revealAt;
  const sfx = sfxLib.sfx[CFG.sfx as keyof typeof sfxLib.sfx];
  const audio = (
    <Sequence from={Math.round(tap * fps)} durationInFrames={Math.round(sfx.duration * fps)}>
      <Audio src={staticFile(`sfx/${CFG.sfx}.mp3`)} volume={sfx.volume * CFG.sfxScale} />
    </Sequence>
  );
  if (t < start || t > end) return audio;
  const pin = back((t - start) / 0.35);
  const pressed = t >= tap;
  const press = t >= tap - 0.09 && t < tap + 0.06 ? 0.86 : 1;
  const burst = pressed ? Math.min(1, (t - tap) / 0.7) : 0;
  const pulse = !pressed ? 1 + Math.sin((t - start) * 9) * 0.03 : 1 + Math.sin(Math.min(1, (t - tap) / 0.25) * Math.PI) * 0.1;
  const rk = reveal ? ease((t - rev) / 0.3) : 0; // 0 → 1: jempol turun, tokoh naik dari dalam lingkaran
  const shake = rk > 0 ? Math.sin(t * 70) * 6 * (1 - Math.min(1, (t - rev) / 0.8)) : 0;
  const S = CFG.iconSize / 200;
  const words = text.split(" ");
  const isKey = (wd: string) => keywords.some((k) => k.toLowerCase() === wd.toLowerCase());
  return (
    <>
      {audio}
      {/* latar sisipan: adegan yang sama diburamkan + sedikit gelap (potong keras masuk/keluar) */}
      <div style={{ position: "absolute", inset: 0, backdropFilter: `blur(${CFG.blur}px) brightness(0.92) saturate(1.1)`, WebkitBackdropFilter: `blur(${CFG.blur}px)`, background: "rgba(255,240,220,0.12)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: CFG.textTop, display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: w * 0.86, textAlign: "center", fontFamily: CFG.font, fontSize: CFG.fontSize, lineHeight: 1.12, textWrap: "balance" } as React.CSSProperties}>
          {words.map((wd, i) => {
            const k = back((t - start - i * CFG.wordStep) / 0.22);
            return (
              <span key={i} style={{ display: "inline-block", margin: `0 ${CFG.fontSize * 0.14}px`, color: isKey(wd) ? brand.palette.yellow : "#fff",
                WebkitTextStroke: `${CFG.stroke}px ${OUT}`, paintOrder: "stroke fill", transform: `scale(${k})`, opacity: Math.min(1, k * 1.5),
                filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.35))" }}>{wd}</span>
            );
          })}
        </div>
      </div>
      <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs><clipPath id="cta-ring"><circle r={82} /></clipPath></defs>
        <g transform={`translate(${w / 2 + shake} ${CFG.iconY}) scale(${S * pin * press * pulse})`}>
          {burst > 0 && Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2 + 0.3, r = 115 + burst * 150;
            return <g key={i} opacity={1 - burst} transform={`translate(${Math.cos(a) * r} ${Math.sin(a) * r - burst * 50}) scale(${1.3 - burst * 0.4}) rotate(${i * 30})`}><Particle kind={kind} /></g>;
          })}
          {pressed && <circle r={100 + burst * 60} fill="none" stroke="#fff" strokeWidth={10 * (1 - burst)} opacity={1 - burst} />}
          <circle r={100} fill="#fff" stroke={OUT} strokeWidth={10} />
          <circle r={82} fill={pressed ? brand.palette.blue : "#3d8fe0"} stroke={OUT} strokeWidth={6} />
          <g clipPath="url(#cta-ring)">
            <g transform={`translate(0 ${rk * 170}) scale(0.95)`}><Glyph kind={kind} on={pressed} /></g>
            {reveal && rk > 0 && (
              <g transform={`translate(0 ${CFG.revealY + (1 - rk) * 190}) scale(${CFG.revealScale})`}>
                <Portrait id={reveal as CharId} emotion={revealEmotion as Emotion} viseme="O" />
              </g>
            )}
          </g>
          <circle r={82} fill="none" stroke={OUT} strokeWidth={6} />
          <ellipse cx={-30} cy={-44} rx={30} ry={14} fill="#fff" opacity={0.3} transform="rotate(-30 -30 -44)" />
          {(rk > 0 || (pressed && burst < 0.6)) && [-40, 0, 40].map((dx) => <path key={dx} d={`M ${dx} -122 L ${dx * 1.4} -152`} stroke={OUT} strokeWidth={8} strokeLinecap="round" />)}
        </g>
      </svg>
    </>
  );
};
