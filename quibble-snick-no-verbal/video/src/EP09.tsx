// EP09 "Escalator" — Quibble berlari naik eskalator yang turun demi es krim terakhir; Snick mempercepatnya; Quibble menang lewat tombol arah.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {C, quibble as q, snick, P, L} from './draw.js';
import {dot, shadow, defs, vignette, trail, impactLines, blinkAt, ESC, escPt, mallDefs, mall, escalator, escPanel, iceCart, runLegs} from './draw2';
import T from './ep09-timeline.json';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = (f: number, r: number[], v0: number, v1: number, e = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [r[0], r[1]], [v0, v1], {...cl, easing: e});
const within = (f: number, r: number[]) => f >= r[0] && f < r[1];
const shake = (f: number, at: number, len = 8, amp = 5) => (f >= at && f < at + len ? Math.sin((f - at) * 2.3) * amp * (1 - (f - at) / len) : 0);
const hold2 = (f: number, at: number) => (f === at + 1 || f === at + 2 ? at : f);

type Cam = {k: number, fx: number, fy: number, sx: number, sy: number};
const camG = (inner: string, c: Cam) => `<g transform="translate(${c.sx - c.fx * c.k},${c.sy - c.fy * c.k}) scale(${c.k})">${inner}</g>`;

const QS = 0.8, SS = 0.85, LS = 0.8, V0 = -0.006;
const TOPX = 222, PANEL_T: [number, number] = [206, 170], PANEL_B: [number, number] = [12, 370];
const runF = (f: number) => (f >= T.loopCU[0] ? f - T.frames : f);

// kecepatan eskalator (+ naik, - turun), satuan panjang lintasan per frame
function speed(f: number) {
  if (f < T.press1) return V0;
  if (f < T.press1 + 4) return io(f, [T.press1, T.press1 + 4], V0, -0.02);
  if (f < T.stop[0]) return -0.02;
  if (f < T.stop[1]) return io(f, T.stop, -0.02, 0.012);
  if (f < T.spark) return 0.012;
  if (f < T.kick + 2) return 0.03;
  if (f < T.landS) return -0.02;
  return V0;
}
const phaseAt = (f: number) => { let p = 0; for (let i = 0; i < f; i++) p += speed(i); return p; };

// Quibble / Snick dengan kaki berlari bersama (close-up kaki identik)
const qRun = (x: number, y: number, ph: number, o: any, amp = 1) => runLegs(x, y, ph, LS, amp) + q(x, y - Math.abs(Math.sin(ph)) * 2 * amp, QS, {...o, legs: 'none'});
let cid = 0;
const sRun = (x: number, y: number, ph: number, o: any, amp = 1) => {
  const id = 'sclip' + (cid++), base = y - 20 * LS - Math.abs(Math.sin(ph)) * 2 * amp;
  return runLegs(x, y, ph, LS, amp) + `<defs><clipPath id="${id}"><rect x="${x - 80}" y="${base - 200}" width="160" height="200"/></clipPath></defs><g clip-path="url(#${id})">${snick(x, base + 14 * SS, SS, o)}</g>`;
};
const spin = (svg: string, cx: number, cy: number, r: number) => `<g transform="rotate(${r},${cx},${cy})">${svg}</g>`;
const cone = (s = 1) => P.cone(0.7 * s);

function closeUp(f: number) {
  // close-up anak tangga yang terus turun (tanpa karakter): kontinu melewati titik loop
  const rf = runF(f);
  const [x, y] = escPt(0.35);
  const w = mall() + escalator(V0 * rf);
  const c: Cam = {k: 3.4 + (rf + 16) * 0.01, fx: x - 6, fy: y - 26, sx: 135, sy: 236};
  return camG(w, c);
}

function wide(f: number) {
  const ph = phaseAt(f);
  let qs = 0.3, qx = 0, qy = 0, qr = 0, qRunning = true, qph = f * 0.9, qamp = 1;
  let qo: any = {brow: 'angry', m: 'teeth', arms: 'up', look: [1, -0.6], blink: false};
  let sx = TOPX, sy = 200, sr = 0, sRunning = false, so: any = {brow: 'smug', m: 'grin', look: [-1, 0.5], hold: cone(), blink: blinkAt(f, 17)};
  let fx = '', camShake = 0, sArm = '', qArm = '', topSpark = 0, panelPressB = 0, dotO: any = {m: 'smile', look: [-1, 0], arms: 'down', blink: blinkAt(f, 33)}, coneAt: number[] | null = null, cones = 1, onEsc = true;
  const at = (s: number) => escPt(s);

  // 1) berlari di tempat -> makin cepat -> naik pelan
  if (f < T.press1 + 4) {
    qs = f < T.faster[0] ? 0.3 : io(f, T.faster, 0.3, 0.62, Easing.inOut(Easing.quad));
    if (f >= T.faster[0]) { qph = T.faster[0] * 0.9 + (f - T.faster[0]) * 1.5; qo = {...qo, m: 'grin', brow: 'angry'}; fx += trail(at(qs)[0] - 20, at(qs)[1] - 50, 1); }
    fx += P.sweat(at(qs)[0] + 30, at(qs)[1] - 100 - (f % 10));
  }
  // Snick menekan tombol cepat di atas
  if (within(f, [T.press1 - 6, T.press1 + 6])) { so = {brow: 'smug', m: 'grin', look: [-1, 0.5], hold: cone()}; sArm = L(sx - 14, sy - 40, PANEL_T[0], PANEL_T[1] - 11, 4); }
  // 2) tersapu turun, terguling, mendarat di lantai
  if (within(f, [T.press1 + 4, T.land1])) {
    const p = io(f, T.swept, 0, 1, Easing.in(Easing.quad));
    qs = 0.62 * (1 - Math.min(1, p / 0.7)); qRunning = p < 0.15; qph = f * 2.2;
    qo = {brow: 'up', m: 'o', arms: 'up', look: [0, 1], cross: p > 0.3};
    if (p >= 0.7) { onEsc = false; const t = (p - 0.7) / 0.3; qx = ESC.x0 - 18 * t; qy = 400 - Math.sin(t * Math.PI) * 18; }
    qr = p > 0.15 ? -p * 720 : 0;
    fx += trail(at(qs)[0] + 30, at(qs)[1] - 40, -1);
  }
  if (f >= T.land1 && f < T.stepOn[1]) { onEsc = false; qRunning = false; qx = 22; qy = 400; }
  if (within(f, [T.land1, T.land1 + 6])) { camShake = shake(f, T.land1, 8, 4); fx += impactLines(22, 380, 14); }
  if (within(f, T.dizzy)) { qo = {brow: 'sad', m: 'wavy', cross: true, arms: 'down'}; fx += [0, 1, 2].map(i => { const a = f / 3 + i * 2.1; return P.sparkle(22 + Math.cos(a) * 22, 300 + Math.sin(a) * 5); }).join(''); }
  // 3) tarik pegangan tangan -> ikut berputar di lengkung bawah -> terlempar
  if (within(f, T.grab)) { qo = {brow: 'angry', m: 'teeth', arms: 'up', look: [1, -1]}; qy = 400 - io(f, T.grab, 0, 14); qx = io(f, T.grab, 22, 28); }
  if (within(f, T.drag)) {
    const a = io(f, T.drag, 0, Math.PI * 2.4, Easing.in(Easing.quad));
    qx = 8 + Math.cos(Math.PI / 2 + a) * 24; qy = 360 - Math.sin(Math.PI / 2 + a) * 24 + 40; qr = (a * 180) / Math.PI;
    qo = {brow: 'sad', m: 'o', arms: 'up', cross: true};
  }
  if (within(f, [T.drag[1], T.bonk2 + 2])) { const t = io(f, [T.drag[1], T.bonk2], 0, 1, Easing.linear); qx = 14 + 22 * t; qy = 400 - Math.sin(t * Math.PI) * 30; qr = 270 + 90 * t; qo = {brow: 'sad', m: 'o', arms: 'up'}; }
  if (within(f, [T.bonk2, T.bonk2 + 8])) { qx = 36; qy = 400; qr = 0; camShake = shake(f, T.bonk2, 8, 5); fx += impactLines(36, 370, 16); qo = {brow: 'sad', m: 'wavy', cross: true, arms: 'down', squash: 0.85}; }
  // 4) melihat panel bawah -> tekan tombol arah -> eskalator berbalik NAIK
  if (f >= T.notice[0] && f < T.stepOn[1]) {
    qx = f < T.walkPanel[0] ? 36 : io(f, T.walkPanel, 36, 30); qy = 400; qr = 0;
    qo = {brow: 'up', m: 'o', arms: 'down', look: [-1, -0.3]};
    if (f >= T.notice[0] + 4) fx += f < T.walkPanel[0] ? P.sparkle(qx + 22, 296) : '';
    if (within(f, [T.press2 - 4, T.press2 + 6])) { qo = {brow: 'up', m: 'grin', arms: 'down', look: [-1, -0.3]}; qArm = L(qx - 20, 360, PANEL_B[0] + 6, PANEL_B[1] - 11, 4.5); panelPressB = f >= T.press2 ? 2 : 0; }
    if (f >= T.stop[1]) { qo = {brow: 'smug', m: 'grin', arms: 'down', look: [1, -0.6]}; }
    if (within(f, T.stepOn)) { const t = io(f, T.stepOn, 0, 1); qx = 30 + (ESC.x0 - 30) * t; qy = 400; }
  }
  // 5) naik santai; Snick panik menekan tombol -> panel korsleting -> super cepat -> Quibble terlempar ke atas
  if (f >= T.ride[0] && f < T.landQ) {
    onEsc = true; qRunning = false;
    qs = f < T.spark ? io(f, [T.ride[0], T.spark], 0, 0.66, Easing.linear) : io(f, [T.spark, T.launch], 0.66, 1, Easing.in(Easing.quad));
    qo = {brow: 'smug', m: 'smile', arms: 'hips', look: [1, -0.5], blink: f < T.spark && (f % 40) < 3};
    if (f >= T.spark) { qo = {brow: 'up', m: 'o', arms: 'up', look: [1, -1]}; fx += trail(at(qs)[0] - 28, at(qs)[1] - 40, 1); }
    if (f >= T.launch) {
      onEsc = false; const t = (f - T.launch) / (T.landQ - T.launch);
      qx = ESC.x1 + (214 - ESC.x1) * t; qy = 200 - Math.sin(t * Math.PI) * 110; qr = t * 360;
      qo = {brow: 'up', m: 'grin', arms: 'up', look: [1, 0]};
    }
  }
  if (within(f, T.snickSee)) so = {brow: 'up', m: 'o', look: [-1, 0.6], hold: cone()};
  if (within(f, T.jab)) { so = {brow: 'angry', m: 'teeth', look: [-1, 0], hold: cone()}; sArm = L(sx - 14, sy - 40, PANEL_T[0] + Math.abs(Math.sin(f * 1.3)) * 4, PANEL_T[1] - 11, 4); if ((f - T.jab[0]) % 6 < 2) fx += impactLines(PANEL_T[0], PANEL_T[1] - 11, 6); }
  if (f >= T.spark && f < T.landS + 30) topSpark = Math.max(0, 1 - (f - T.spark) / 60) * (0.6 + 0.4 * Math.abs(Math.sin(f)));
  if (within(f, [T.spark, T.spark + 6])) { camShake = shake(f, T.spark, 8, 3); fx += impactLines(PANEL_T[0], PANEL_T[1] - 11, 14); }
  // 6) Quibble mendarat di gerobak; Dot memberi es krim terakhir
  if (f >= T.landQ) {
    onEsc = false; qRunning = false; qx = 214; qy = 200; qr = 0; cones = f < T.hand[0] ? 1 : 0;
    qo = {brow: 'up', m: 'grin', arms: 'down', look: [1, 0], squash: f < T.landQ + 6 ? 0.85 : 1};
    if (within(f, [T.landQ, T.landQ + 6])) { camShake = shake(f, T.landQ, 8, 4); fx += impactLines(214, 190, 14); }
    if (within(f, T.hand)) { const t = io(f, T.hand, 0, 1); coneAt = [250 - 14 * t, 158 + 6 * t]; dotO = {m: 'grin', look: [-1, 0], arms: 'up'}; }
    if (f >= T.hand[1]) {
      qo = {brow: 'up', m: 'smile', arms: 'holdR', hold: cone(), look: [-0.5, 0], blink: (f % 30) < 10};
      if (f >= T.tease[0] && f < T.tease[1]) qo = {brow: 'smug', m: 'grin', arms: 'holdR', hold: cone(), look: [-1, 1], blink: false};
      if (f >= T.tease[1]) qo = {brow: 'up', m: 'smile', arms: 'holdR', hold: cone(), look: [-1, 1], blink: (f % 30) < 10};
      if (f < T.hand[1] + 6) fx += P.sparkle(250, 120) + P.sparkle(222, 130);
    }
  }
  // Snick ditendang ke eskalator -> meluncur ke bawah -> pusing -> marah -> berlari naik (loop)
  if (within(f, [T.kick, T.snickSlide[0]])) { const t = io(f, [T.kick, T.snickSlide[0]], 0, 1); sx = TOPX + (ESC.x1 - TOPX) * t; sy = 200; sr = -t * 90; so = {brow: 'up', m: 'o', cross: true}; }
  if (within(f, [T.kick, T.kick + 5])) { camShake = shake(f, T.kick, 6, 4); fx += impactLines(TOPX, 110, 14); }
  if (within(f, [T.snickSlide[0], T.landS])) {
    const t = io(f, [T.snickSlide[0], T.landS], 0, 1, Easing.in(Easing.quad));
    const s = Math.max(0, 1 - t / 0.85); [sx, sy] = escPt(s); sr = -90 - t * 900;
    if (t > 0.85) { const u = (t - 0.85) / 0.15; sx = ESC.x0 - 22 * u; sy = 400 - Math.sin(u * Math.PI) * 14; }
    so = {brow: 'sad', m: 'o', cross: true}; fx += trail(sx + 30, sy - 40, -1);
  }
  if (f >= T.landS) {
    sx = 18; sy = 400; sr = 0;
    if (within(f, [T.landS, T.landS + 6])) { camShake = shake(f, T.landS, 8, 4); fx += impactLines(18, 380, 14); }
    so = {brow: 'sad', m: 'wavy', cross: f < T.snickDizzy[1], look: [1, -1], arms: 'down', blink: false};
    if (f >= T.snickDizzy[1]) so = {brow: 'angry', m: 'teeth', look: [1, -1], arms: f >= T.tease[0] && f < T.stomp[0] ? 'up' : 'down'};
    if (f >= T.stomp[0]) { sx = io(f, T.stomp, 18, ESC.x0 + 6); so = {brow: 'angry', m: 'teeth', look: [1, -1], arms: 'down'}; }
    if (f >= T.snickRun[0]) sRunning = true;
  }

  // ---- susun ----
  let w = mall() + escPanel(...PANEL_B, {dir: speed(f) >= 0 ? 1 : -1, press: panelPressB}) + escPanel(...PANEL_T, {dir: speed(f) >= 0 ? 1 : -1, spark: topSpark});
  w += iceCart(262, 200, cones);
  w += dot(250, 164, 0.6, dotO);
  w += escalator(ph);
  // Snick
  let sSvg;
  if (sRunning) { const s = io(f, T.snickRun, 0.03, 0.14, Easing.linear); const [x, y] = escPt(s); sSvg = sRun(x, y, f * 0.9, {brow: 'angry', m: 'teeth', look: [1, -1], arms: 'up'}); fx += P.sweat(x + 26, y - 96 - (f % 10)); }
  else sSvg = shadow(sx, sy, 50, sy < 395 && sy > 205 ? 0.4 : 1) + spin(snick(sx, sy, SS, so), sx, sy - 45, sr) + sArm;
  // Quibble
  let qSvg;
  const [ex, ey] = onEsc ? escPt(qs) : [qx, qy];
  if (onEsc && qRunning) qSvg = qRun(ex, ey, qph, qo, qamp);
  else qSvg = shadow(ex, onEsc ? ey : (qy > 300 ? 400 : 200), 56, 0.8) + spin(q(ex, ey, QS, qo), ex, ey - 55, qr);
  w += sSvg + qSvg + qArm;
  if (coneAt) w += `<g transform="translate(${coneAt[0]},${coneAt[1]})">${cone()}</g>`;
  w += fx;
  const c: Cam = {k: 0.92, fx: 135 + camShake, fy: 266 + camShake * 0.5, sx: 135, sy: 236};
  return camG(w, c);
}

export const EP09: React.FC = () => {
  const F = useCurrentFrame();
  let f = F;
  for (const a of [T.land1, T.bonk2, T.kick, T.landQ, T.landS]) f = hold2(f, a);
  const svg = f < T.cutWide || f >= T.loopCU[0] ? closeUp(f) : wide(f);
  return (
    <AbsoluteFill style={{backgroundColor: '#F1D9C2'}}>
      <svg viewBox="0 0 270 480" width={1080} height={1920} dangerouslySetInnerHTML={{__html: defs + mallDefs + svg + vignette}} />
      <Audio src={staticFile('ep09.wav')} />
    </AbsoluteFill>
  );
};
