import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Character } from "../characters/Character";
import { Extras } from "../scene/Extras";
import { LOCATIONS, LOCATION_META, LocId } from "../scene/Locations";
import { DETAILS } from "../scene/Details";
import { DETAILS2 } from "../scene/Details2";
import { CharLightDefs, LightDef, ScreenLight, SetLight } from "../fx/Lighting";
import { useFonts } from "../lib/fonts";
import type { Action, CharId, Emotion } from "../lib/timeline";
import { Logo } from "./Brand";
import sfxLib from "../audio/sfx.json";

/* INTRO gaya D "MERIAH" (usulan, 6 detik, TIDAK komik): opening perayaan sinematik bergaya anime-drama.
 * 3 shot dari set asli (gerbang pagi → upacara → warung senja) dengan kamera bergerak, cahaya, partikel, karakter berjalan/menarik tali,
 * lalu lencana Logo 2 + KUSAKA DESIGN tepat di puncak musik (4,2 dtk). Musik instrumental orisinal (ElevenLabs Music) + SFX. */
export const INTRO_CINE_SECONDS = 6;
const FPS = 30;
const HIT = 3.3; // puncak musik (aksen penutup)
const ease = (x: number) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
const inOut = (x: number) => { const k = Math.min(Math.max(x, 0), 1); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const rnd = (i: number, s = 1) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };

interface Cam { x: number; y: number; z: number }
const Layer: React.FC<{ cam: Cam; d: number; children: React.ReactNode }> = ({ cam, d, children }) => {
  const z = 1 + (cam.z - 1) * d, cx = 960 + (cam.x - 960) * d, cy = 540 + (cam.y - 540) * d;
  return <g transform={`translate(960 540) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>;
};
interface Actor { id: CharId; x: number; facing: 1 | -1; emotion: Emotion; action: Action; walk?: number; held?: { front?: string; back?: string }; bag?: boolean; hat?: boolean }
interface ShotProps {
  loc: LocId; t: number; frame: number; cam: Cam; actors: Actor[];
  opts?: { ijahNod?: number; flag?: number; gate?: number }; extras?: { bag?: boolean; hat?: boolean; salute?: number };
}
const Shot: React.FC<ShotProps> = ({ loc, t, frame, cam, actors, opts, extras }) => {
  const def = LOCATIONS[loc], meta = LOCATION_META.locations[loc] as { floor: number; light?: LightDef };
  const light: LightDef = meta.light ?? { kind: "sun", from: -1 };
  const Detail = DETAILS[loc] ?? DETAILS2[loc];
  return (
    <AbsoluteFill style={{ background: def.bg }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: "saturate(1.15) contrast(1.06)" }}>
        <CharLightDefs light={light} />
        {def.layers.map((l, i) => <Layer key={i} cam={cam} d={l.d}>{l.el(t, opts)}</Layer>)}
        {Detail && <Layer cam={cam} d={1}><Detail t={t} /></Layer>}
        <Layer cam={cam} d={1}><Extras location={loc} t={t} bag={extras?.bag} hat={extras?.hat} salute={extras?.salute ?? 0} /></Layer>
        <Layer cam={cam} d={1}><SetLight light={light} t={t} floor={meta.floor} /></Layer>
        <Layer cam={cam} d={1}>
          {actors.map((a) => (
            <g key={a.id} filter="url(#charlight)">
              <Character id={a.id} x={a.x} y={meta.floor} facing={a.facing} frame={frame} walk={a.walk} wear="seragam" held={a.held} bag={a.bag} hat={a.hat}
                force={{ emotion: a.emotion, action: a.action, noFx: true }} />
            </g>
          ))}
        </Layer>
      </svg>
      <ScreenLight light={light} w={1920} h={1080} frame={frame} />
    </AbsoluteFill>
  );
};

/** Debu/bokeh cahaya melayang (hidup, bukan kartun). */
const Motes: React.FC<{ t: number; warm?: boolean; n?: number }> = ({ t, warm = true, n = 46 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", pointerEvents: "none" }}>
    <defs><filter id="mb"><feGaussianBlur stdDeviation="2.2" /></filter></defs>
    <g filter="url(#mb)">
    {Array.from({ length: n }).map((_, i) => {
      const sp = 14 + rnd(i, 3) * 40, x = ((rnd(i, 1) * 2200 + t * sp * (i % 2 ? 1 : -0.6)) % 2200) - 140, y = (rnd(i, 2) * 1300 - t * (10 + rnd(i, 4) * 26) + 1300) % 1180 - 60;
      const r = 2 + rnd(i, 5) * 8, a = (0.18 + rnd(i, 6) * 0.35) * (0.6 + 0.4 * Math.sin(t * 2 + i));
      return <circle key={i} cx={x} cy={y} r={r} fill={warm ? "#ffd9a0" : "#fff"} opacity={a} />;
    })}
    </g>
  </svg>
);
const Grain: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.1, mixBlendMode: "overlay", pointerEvents: "none" }}>
    {Array.from({ length: 140 }).map((_, i) => <circle key={i} cx={rnd(i, frame * 0.37) * 1920} cy={rnd(i, frame * 0.73 + 5) * 1080} r={1 + rnd(i, 9) * 1.6} fill={i % 2 ? "#fff" : "#000"} />)}
  </svg>
);
const Vignette: React.FC<{ k?: number }> = ({ k = 0.45 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 75% at 50% 48%, transparent 52%, rgba(20,8,28,${k}) 100%)`, pointerEvents: "none" }} />
);

/** Konfeti: ledakan dari titik asal lalu jatuh (deterministik). */
const Confetti: React.FC<{ t0: number; t: number; ox: number; oy: number; n: number; power: number; spread?: number }> = ({ t0, t, ox, oy, n, power, spread = 1 }) => {
  const lt = t - t0; if (lt < 0) return null;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const a = (rnd(i, 21) * 0.9 + 0.05) * Math.PI * spread - Math.PI * (0.5 * spread + 0.0) + (spread < 1 ? -Math.PI / 2 : 0), v = power * (0.35 + rnd(i, 22) * 0.9);
        const x = ox + Math.cos(a) * v * Math.min(lt, 1.1) * 1.1 + Math.sin(lt * (3 + rnd(i, 23) * 5) + i) * 18, y = oy + Math.sin(a) * v * Math.min(lt, 1.1) + 520 * lt * lt;
        const w = 12 + rnd(i, 24) * 14, h = 6 + rnd(i, 25) * 8, rot = lt * (180 + rnd(i, 26) * 540) * (i % 2 ? 1 : -1);
        if (y > 1180) return null;
        return <rect key={i} x={-w / 2} y={-h / 2} width={w} height={h} fill={PAL[i % PAL.length]} transform={`translate(${x} ${y}) rotate(${rot}) scale(1 ${Math.abs(Math.cos(lt * 6 + i))})`} />;
      })}
    </svg>
  );
};
/** Umbul-umbul merah-putih (bendera segitiga) menjuntai di atas. */
const Bunting: React.FC<{ t: number; y?: number; k?: number }> = ({ t, y = 26, k = 1 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none", transform: `translateY(${(1 - k) * -160}px)` }}>
    {[0, 1].map((row) => {
      const yy = y + row * 46, n = 26;
      return (
        <g key={row}>
          <path d={`M -20 ${yy} Q 960 ${yy + 90} 1940 ${yy}`} fill="none" stroke="#2a2035" strokeWidth={4} />
          {Array.from({ length: n }).map((_, i) => {
            const u = (i + 0.5 + (row ? 0.5 : 0)) / n, x = -20 + u * 1960, sag = 4 * 90 * u * (1 - u) * 0.5 + (row ? 0 : 0), sw = Math.sin(t * 5 + i * 0.8) * 5;
            return <path key={i} d={`M ${x - 28} ${yy + sag} L ${x + 28} ${yy + sag} L ${x + sw} ${yy + sag + 70} Z`} fill={(i + row) % 2 ? "#fff" : "#e63946"} stroke="#2a2035" strokeWidth={3} />;
          })}
        </g>
      );
    })}
  </svg>
);
/** Kilatan cahaya radial (kembang api) pada satu titik. */
const Burst: React.FC<{ t0: number; t: number; x: number; y: number; r?: number; color?: string }> = ({ t0, t, x, y, r = 220, color = "#fff1c4" }) => {
  const lt = t - t0; if (lt < 0 || lt > 0.9) return null;
  const k = ease(lt / 0.55), a = 1 - Math.min(1, lt / 0.9);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", pointerEvents: "none" }}>
      <g transform={`translate(${x} ${y})`} opacity={a}>
        {Array.from({ length: 22 }).map((_, i) => { const ang = (i / 22) * Math.PI * 2; return <line key={i} x1={Math.cos(ang) * r * k * 0.35} y1={Math.sin(ang) * r * k * 0.35} x2={Math.cos(ang) * r * k} y2={Math.sin(ang) * r * k} stroke={i % 3 ? color : "#ffd23f"} strokeWidth={5} strokeLinecap="round" />; })}
        <circle r={r * k * 0.18} fill="#fff" opacity={0.8} />
      </g>
    </svg>
  );
};
/** Garis kecepatan horizontal singkat saat potong shot. */
const Whip: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const lt = t - at; if (lt < 0 || lt > 0.16) return null;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 1 - lt / 0.16, mixBlendMode: "screen", pointerEvents: "none" }}>
      {Array.from({ length: 20 }).map((_, i) => <rect key={i} x={0} y={rnd(i, 31) * 1080} width={1920} height={3 + rnd(i, 32) * 9} fill="#fff" opacity={0.5 + rnd(i, 33) * 0.4} />)}
    </svg>
  );
};

const Bars: React.FC<{ k: number }> = ({ k }) => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 96 * k, background: "#0b0710" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 96 * k, background: "#0b0710" }} />
  </>
);

const CUTS = [0.75, 1.5, 2.15, 2.7]; // pergantian shot (potong keras), 5 shot cepat
const PAL = ["#ffd23f", "#e63946", "#2f7fd8", "#3c8d5a", "#ff7eb6", "#ffffff", "#ff9a3c"];

export const IntroD: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame(), t = frame / FPS;
  const music = (f: number) => Math.min(1, Math.max(0, (180 - f) / 12)) * 0.8;
  const idx = t >= HIT ? 5 : CUTS.filter((c) => t >= c).length;            // 0..4 = shot, 5 = penutup
  const t0 = idx === 0 ? 0 : CUTS[idx - 1], t1 = idx < 4 ? CUTS[idx] : HIT, ts = t - t0, k = Math.min(1, ts / (t1 - t0));
  const beatShake = (at: number) => { const d = t - at; return d >= 0 && d < 0.18 ? Math.sin(d * 120) * 14 * (1 - d / 0.18) : 0; };
  let shot: React.ReactNode = null;
  if (idx === 0) {
    const x = -160 + k * 1000;
    shot = <Shot loc="gerbang" t={t} frame={frame} cam={{ x: lerp(760, 960, inOut(k)), y: lerp(650, 600, k), z: lerp(1.05, 1.32, inOut(k)) }}
      opts={{ gate: ease(ts / 0.7) * 0.9 }} extras={{ bag: true }}
      actors={[{ id: "kusaka", x, facing: 1, emotion: "pleading", action: "idle", walk: x / 42 * 1.7, bag: true },
               { id: "mangUdin", x: 1290, facing: -1, emotion: "smug", action: "pull" }]} />;
  } else if (idx === 1) {
    shot = <Shot loc="lapanganUpacara" t={t} frame={frame} cam={{ x: 960, y: lerp(690, 470, ease(k)), z: lerp(1.42, 1.04, ease(k)) }}
      opts={{ flag: Math.max(0.02, ease(ts / 0.65)) }} extras={{ hat: true, salute: ts > 0.4 ? 1 : 0 }}
      actors={[{ id: "nadia", x: 560, facing: 1, emotion: "smug", action: ts > 0.4 ? "salute" : "idle" },
               { id: "kusaka", x: 960, facing: 1, emotion: "smug", action: "pull", hat: true },
               { id: "ucok", x: 1360, facing: -1, emotion: "laugh", action: "hold", hat: true, held: { front: "tray" } }]} />;
  } else if (idx === 2) {
    shot = <Shot loc="kantin" t={t} frame={frame} cam={{ x: lerp(1040, 900, k), y: 600, z: lerp(1.0, 1.22, k) }}
      actors={[{ id: "ucok", x: 240, facing: 1, emotion: "laugh", action: "laugh" }, { id: "nadia", x: 560, facing: 1, emotion: "smug", action: "peace" },
               { id: "kusaka", x: 960, facing: 1, emotion: "laugh", action: "thumbsup" }, { id: "ujang", x: 1360, facing: -1, emotion: "smug", action: "wave" }]} />;
  } else if (idx === 3) {
    shot = <Shot loc="lapanganBasket" t={t} frame={frame} cam={{ x: lerp(900, 1000, k), y: lerp(640, 560, k), z: lerp(1.25, 1.0, k) }}
      actors={[{ id: "bimo", x: 760, facing: 1, emotion: "smug", action: "shoot", held: { front: "ball" } }, { id: "ucok", x: 1280, facing: -1, emotion: "laugh", action: "wave" },
               { id: "sasa", x: 1560, facing: -1, emotion: "laugh", action: "phone" }]} />;
  } else if (idx === 4) {
    const x = 1700 - k * 700;
    shot = <Shot loc="warung" t={t} frame={frame} cam={{ x: lerp(1120, 960, inOut(k)), y: 590, z: lerp(1.0, 1.18, inOut(k)) }}
      opts={{ ijahNod: Math.sin(t * 9) * 4 }}
      actors={[{ id: "sasa", x: x + 760, facing: -1, emotion: "laugh", action: "idle", walk: (x + 760) / 42 * 1.4, bag: true },
               { id: "nadia", x: x + 520, facing: -1, emotion: "smug", action: "idle", walk: (x + 520) / 42 * 1.4, bag: true },
               { id: "ujang", x: x + 270, facing: -1, emotion: "deadpan", action: "idle", walk: (x + 270) / 42 * 1.4, bag: true, held: { front: "cup" } },
               { id: "kusaka", x, facing: -1, emotion: "laugh", action: "idle", walk: x / 42 * 1.4, bag: true, held: { front: "cup" } }]} />;
  }
  const shake = CUTS.reduce((a, c) => a + beatShake(c), 0) + beatShake(HIT) * 1.4;
  const bloom = t > HIT - 0.4 && t < HIT - 0.15 ? Math.sin(((t - HIT + 0.4) / 0.25) * Math.PI) * 0.3 : 0;
  const flash = t >= HIT && t < HIT + 0.28 ? 1 - (t - HIT) / 0.28 : 0;
  const cine = t < HIT ? Math.min(1, t / 0.4) * 0.8 : Math.max(0, 1 - (t - HIT) / 0.3);

  /* ---------- penutup: lencana + judul + barisan tokoh bersorak ---------- */
  const lt = t - HIT;
  const logoK = lt < 0 ? 0 : 1 + 0.07 * Math.sin(Math.min(1, lt / 0.45) * Math.PI) - (1 - ease(lt / 0.5)) * 0.95;
  const pulse = 1 + 0.025 * Math.sin(lt * 15);
  const sweep = lt > 0.3 && lt < 0.85 ? (lt - 0.3) / 0.55 : -1;
  const titleK = ease((lt - 0.3) / 0.45), designK = ease((lt - 0.6) / 0.45);
  const glow = 0.6 + 0.3 * Math.sin(lt * 6);
  const out = ease((t - 5.55) / 0.45);           // transisi keluar: zoom menembus lencana ke cahaya hangat
  const LINE: { id: CharId; a: Action; e: Emotion }[] = [
    { id: "ucok", a: "wave", e: "laugh" }, { id: "nadia", a: "peace", e: "smug" }, { id: "ujang", a: "thumbsup", e: "smug" }, { id: "kusaka", a: "wave", e: "laugh" },
    { id: "dinda", a: "peace", e: "laugh" }, { id: "bimo", a: "thumbsup", e: "smug" }, { id: "sasa", a: "wave", e: "laugh" }, { id: "raka", a: "peace", e: "smug" },
  ];
  return (
    <AbsoluteFill style={{ background: "#0b0710" }}>
      {t < HIT && (
        <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.5}px) scale(${1 + Math.abs(shake) * 0.002})` }}>
          {shot}
          <Motes t={t} n={60} />
          {t >= 0.75 && <Bunting t={t} k={ease((t - 0.75) / 0.25)} />}
          {t >= 1.3 && <Confetti t0={1.3} t={t} ox={960} oy={-40} n={70} power={170} spread={1} />}
          <Vignette k={0.32} />
          <AbsoluteFill style={{ background: "linear-gradient(110deg, rgba(255,170,90,0.26), transparent 50%)", mixBlendMode: "screen" }} />
          <Grain frame={frame} />
          {bloom > 0 && <AbsoluteFill style={{ background: `radial-gradient(circle at 60% 40%, rgba(255,235,190,${bloom}), transparent 65%)`, mixBlendMode: "screen" }} />}
          {CUTS.map((c) => <Whip key={c} t={t} at={c} />)}
          {CUTS.map((c) => <Burst key={`b${c}`} t0={c} t={t} x={960} y={500} r={260} />)}
        </AbsoluteFill>
      )}
      {t >= HIT && (
        <AbsoluteFill style={{ background: "linear-gradient(180deg, #ffe08a 0%, #ff9a3c 42%, #c2417a 78%, #5b2a7c 100%)", transform: `translate(${shake}px, ${shake * 0.5}px) scale(${1 + out * out * 1.6})`, transformOrigin: "960px 300px" }}>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.28, mixBlendMode: "screen" }}>
            <g transform={`rotate(${lt * 9} 960 330)`}>{Array.from({ length: 20 }).map((_, i) => { const a0 = (i / 20) * Math.PI * 2, a1 = a0 + Math.PI / 40;
              return <path key={i} d={`M 960 330 L ${960 + Math.cos(a0) * 2200} ${330 + Math.sin(a0) * 2200} L ${960 + Math.cos(a1) * 2200} ${330 + Math.sin(a1) * 2200} Z`} fill="#fff" />; })}</g>
          </svg>
          <Motes t={t} n={70} />
          <Bunting t={t} k={1} />
          <div style={{ position: "absolute", left: 960 - 330, top: 300 - 330, width: 660, height: 660, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,245,210,${glow}) 0%, transparent 62%)` }} />
          <div style={{ position: "absolute", left: 960 - 215, top: 300 - 215, width: 430, height: 430, transform: `scale(${Math.max(0, logoK) * pulse})`, filter: "drop-shadow(0 16px 26px rgba(60,10,40,0.5))" }}>
            <div style={{ width: 800, height: 800, transform: "scale(0.5375)", transformOrigin: "0 0" }}><Logo variant={2} /></div>
            {sweep >= 0 && <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -60, bottom: -60, width: 110, left: -160 + sweep * 760, transform: "skewX(-22deg)", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)" }} />
            </div>}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 508, textAlign: "center", opacity: titleK, transform: `translateY(${(1 - titleK) * 30}px)` }}>
            <div style={{ fontFamily: "Baloo2", fontWeight: 800, fontSize: 132, letterSpacing: 18, color: "#fff", lineHeight: 1, textShadow: "0 0 34px rgba(255,215,130,0.95), 0 8px 0 rgba(90,30,70,0.55)" }}>KUSAKA</div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 652, textAlign: "center", opacity: designK, transform: `translateY(${(1 - designK) * 20}px)` }}>
            <div style={{ fontFamily: "Baloo2", fontWeight: 800, fontSize: 44, letterSpacing: 36, color: "#fff6d6", marginLeft: 36, textShadow: "0 0 18px rgba(255,200,120,0.85)" }}>DESIGN</div>
          </div>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <defs><CharLightDefs light={{ kind: "sun", from: -1 }} /></defs>
            {LINE.map((c, i) => {
              const e = ease((lt - 0.2 - i * 0.07) / 0.4), x = 230 + i * 208;
              return (
                <g key={c.id} filter="url(#charlight)">
                  <Character id={c.id} x={x} y={1090 - e * 60 + Math.sin(t * 7 + i) * 6 * e} facing={i < 4 ? 1 : -1} frame={frame} scale={0.38}
                    force={{ emotion: c.e, action: c.a, noFx: true }} />
                </g>
              );
            })}
          </svg>
          <Confetti t0={HIT} t={t} ox={960} oy={300} n={150} power={900} spread={2} />
          <Burst t0={HIT + 0.05} t={t} x={430} y={250} r={240} color="#ffd23f" /><Burst t0={HIT + 0.22} t={t} x={1490} y={230} r={240} color="#ff9ad2" />
          <Burst t0={HIT + 0.4} t={t} x={960} y={150} r={200} />
          <Vignette k={0.28} /><Grain frame={frame} />
        </AbsoluteFill>
      )}
      <Bars k={cine} />
      {flash > 0 && <AbsoluteFill style={{ background: "#fff8e6", opacity: flash * 0.9 }} />}
      {out > 0 && <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 28%, #fffaf0 0%, #ffe3b0 60%, #ffc98a 100%)", opacity: Math.pow(out, 1.3) }} />}

      {/* musik orisinal + SFX berlapis (volume rendah; sorak & konfeti di puncak) */}
      <Sequence from={0}><Audio src={staticFile("intro/music-cine.mp3")} volume={music} /></Sequence>
      <Sequence from={0} durationInFrames={Math.round(HIT * FPS)}><Audio src={staticFile("sfx/amb_school_outdoor.mp3")} volume={sfxLib.sfx.amb_school_outdoor.volume * 1.4} /></Sequence>
      <Sequence from={2}><Audio src={staticFile("sfx/school_bell.mp3")} volume={sfxLib.sfx.school_bell.volume * 0.6} /></Sequence>
      <Sequence from={0}><Audio src={staticFile("intro/sfx-run.mp3")} volume={0.35} /></Sequence>
      {CUTS.map((c) => <Sequence key={`w${c}`} from={Math.round(c * FPS)}><Audio src={staticFile("sfx/whoosh_soft.mp3")} volume={sfxLib.sfx.whoosh_soft.volume * 0.9} /></Sequence>)}
      <Sequence from={Math.round(CUTS[0] * FPS)}><Audio src={staticFile("intro/sfx-pulley.mp3")} volume={0.35} /></Sequence>
      <Sequence from={Math.round(CUTS[3] * FPS)}><Audio src={staticFile("intro/sfx-run.mp3")} volume={0.25} /></Sequence>
      <Sequence from={Math.round((HIT - 1.2) * FPS)}><Audio src={staticFile("intro/sfx-roll.mp3")} volume={0.35} /></Sequence>
      <Sequence from={Math.round(HIT * FPS)}><Audio src={staticFile("intro/sfx-crash.mp3")} volume={0.5} /></Sequence>
      <Sequence from={Math.round(HIT * FPS)}><Audio src={staticFile("intro/sfx-popper.mp3")} volume={0.55} /></Sequence>
      <Sequence from={Math.round((HIT + 0.05) * FPS)}><Audio src={staticFile("intro/sfx-cheer.mp3")} volume={0.45} /></Sequence>
      <Sequence from={Math.round((HIT + 0.3) * FPS)}><Audio src={staticFile("intro/sfx-shimmer.mp3")} volume={0.35} /></Sequence>
      <Sequence from={Math.round((HIT + 0.5) * FPS)}><Audio src={staticFile("sfx/ding_idea.mp3")} volume={sfxLib.sfx.ding_idea.volume * 0.7} /></Sequence>
    </AbsoluteFill>
  );
};
