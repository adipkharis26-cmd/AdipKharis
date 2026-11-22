// EP13 "Parking Spot" — STRUKTUR E (lomba dua pihak). KAMERA: layar terbelah kiri-kanan (wajah tiap pengemudi, satu dunia, dua kamera)
// yang menyatu jadi satu frame lebar saat klimaks. HOOK: lampu merah->hijau, dua mobil sudah meraung. LOOP: match-cut lampu rem merah -> lampu lalu lintas merah.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {C, quibble as q, snick, P, L} from './draw.js';
import {shadow, defs, vignette, impactLines, blinkAt, cityDefs, cityFar, cityNear, miniCar, trafficLight, speedBump, coneT, hornRing, steam, NEON} from './draw2';
import T from './ep13-timeline.json';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = (f: number, r: number[], v0: number, v1: number, e = Easing.inOut(Easing.cubic)) => interpolate(f, [r[0], r[1]], [v0, v1], {...cl, easing: e});
const within = (f: number, r: number[]) => f >= r[0] && f < r[1];
const shake = (f: number, at: number, len = 8, amp = 5) => (f >= at && f < at + len ? Math.sin((f - at) * 2.3) * amp * (1 - (f - at) / len) : 0);
const hold2 = (f: number, at: number) => (f === at + 1 || f === at + 2 ? at : f);
type Cam = {k: number, fx: number, fy: number, sx: number, sy: number};
const camG = (inner: string, c: Cam) => `<g transform="translate(${c.sx - c.fx * c.k},${c.sy - c.fy * c.k}) scale(${c.k})">${inner}</g>`;
const scr = (c: Cam, x: number, y: number) => [c.sx + (x - c.fx) * c.k, c.sy + (y - c.fy) * c.k];
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ss = (x: number) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const hop = (t: number, at: number, len: number, h: number) => (t >= at && t <= at + len ? h * Math.sin(Math.PI * (t - at) / len) : 0);
const imp = (t: number, at: number, amp: number, tau = 8, w = 0.9) => (t >= at ? amp * Math.exp(-(t - at) / tau) * Math.sin((t - at) * w) : 0);
const ramp = (t: number, a: number, b: number, v0: number, v1: number) => lerp(v0, v1, ss((t - a) / (b - a)));

// ---- kecepatan & posisi (diintegrasi per frame) ----
const vq = (t: number) => t < T.launch ? 0 : t < 30 ? ramp(t, T.launch, 30, 0, 14) : t < T.coneHit ? 14 : t < 112 ? ramp(t, T.coneHit, 112, 14, 6) : t < 140 ? ramp(t, 112, 140, 6, 14) : t < T.merge[0] ? 14 : ramp(t, T.merge[0], T.bump, 14, 10);
const vs = (t: number) => t < T.launch ? 0 : t < 28 ? ramp(t, T.launch, 28, 0, 15) : t < T.honkHit ? 15 : t < 152 ? ramp(t, T.honkHit, 152, 6, 15) : t < T.turbo ? 15 : t < 176 ? ramp(t, T.turbo, 176, 15, 23) : t < 212 ? 23 : ramp(t, 212, T.sArrive, 23, 0);
const BUMPX = 64;
const XQ: number[] = [], XS: number[] = [];
{ let a = 0, b = 0; for (let t = 0; t <= 420; t++) { XQ.push(a); XS.push(b); a += vq(t); b += vs(t); }
  const oq = BUMPX - XQ[T.bump], os = 224 + XS[T.sArrive]; for (let t = 0; t <= 420; t++) { XQ[t] += oq; XS[t] = os - XS[t]; } }
const at = (A: number[], t: number) => { const i = Math.max(0, Math.min(419, Math.floor(t))), u = t - Math.floor(t); return lerp(A[i], A[i + 1], u); };

const PARK = NEON.park, LANE = NEON.lane, GAPX = (NEON.gap[0] + NEON.gap[1]) / 2 - 0; // 125

function qState(t: number) {
  let x = at(XQ, Math.min(t, T.bump)), y = LANE, tilt = 0, sq = 1;
  if (t >= T.bump && t < T.land) { const u = (t - T.bump) / (T.land - T.bump); x = lerp(BUMPX, GAPX, u); y = lerp(LANE, PARK, u) - 108 * Math.sin(Math.PI * u); tilt = lerp(-22, 10, u); }
  else if (t >= T.land) { x = GAPX; y = PARK - hop(t, T.land + 2, 10, 9) - hop(t, T.land + 12, 7, 3); tilt = imp(t, T.land, 8, 5, 1.1); sq = 1 - imp(t, T.land, 0.2, 5, 1.3); }
  if (within(t, T.wobble)) tilt += Math.sin((t - T.wobble[0]) * 0.9) * 9 * (1 - (t - T.wobble[0]) / 20);
  if (t < T.launch) { y -= Math.abs(Math.sin(t * 2.7)) * 1.2; tilt = -1.5; }
  if (within(t, [T.launch, T.launch + 10])) tilt = -6 * (1 - (t - T.launch) / 10);
  const wh = x / 9.5 + (t < T.launch ? t * 0.9 : 0) + (within(t, [T.bump, T.land]) ? (t - T.bump) * 0.8 : 0);
  return {x, y, tilt, sq, wh};
}
function sState(t: number) {
  let x = at(XS, Math.min(t, T.sArrive)), y = LANE, tilt = 0, sq = 1;
  if (t >= T.turn[0] && t < T.bonk) { const u = ss((t - T.turn[0]) / (T.bonk - T.turn[0])); x = lerp(224, 209, u); y = lerp(LANE, 394, u); tilt = 9 * u; }
  else if (t >= T.bonk && t < T.leave[0]) { const u = 1 - Math.pow(1 - clamp01((t - T.bonk) / 12), 3); x = lerp(209, 232, u); y = lerp(394, LANE, u); tilt = lerp(9, 0, u) + imp(t, T.bonk, 7, 6, 1.2); sq = 1 - imp(t, T.bonk, 0.15, 5, 1.4); }
  else if (t >= T.leave[0]) { x = 232 + Math.pow((t - T.leave[0]) / 26, 2) * 220; tilt = -3; }
  if (within(t, T.startle)) { y -= hop(t, T.startle[0], 12, 16); tilt += Math.sin((t - T.startle[0]) * 1.3) * 6 * (1 - (t - T.startle[0]) / 14); }
  if (t < T.launch) { y -= Math.abs(Math.sin(t * 2.9 + 1)) * 1.2; tilt = 1.5; }
  if (within(t, [T.launch, T.launch + 10])) tilt = 6 * (1 - (t - T.launch) / 10);
  if (within(t, [T.turbo, T.turbo + 10])) tilt += 5 * Math.sin(Math.PI * (t - T.turbo) / 10);
  if (within(t, [T.sHonk, T.sHonk + 6])) sq = 0.94;
  const wh = -x / 9.5 + (t < T.launch ? t * 0.9 : 0);
  return {x, y, tilt, sq, wh};
}

// ---- pengemudi (koordinat lokal mobil: depan = +x) ----
function quibbleDrv(t: number, F: number) {
  let arms = 'x', look = [4, 0], brow = 'angry', m = 'teeth', lean = 0, cross = false, blink = blinkAt(F, 11), extra = '', dy = 0;
  if (t < T.launch) { dy = Math.sin(t * 2.7) * 0.6; }
  else if (t < T.spot) lean = -3 * (1 - (t - T.launch) / 38);
  else if (t < T.glare[0]) { look = [3, -4]; brow = 'up'; m = 'o'; }
  else if (t < T.glare[1]) { look = [5, 0]; brow = 'angry'; m = 'flat'; }
  else if (t < T.coneHit) { look = [3, -4]; brow = 'up'; m = 'o'; }
  else if (t < 122) { cross = true; brow = 'sad'; m = 'wavy'; }
  else if (t < T.honk) { look = [4, 0]; brow = 'angry'; m = 'frown'; }
  else if (t < T.honk + 8) { brow = 'angry'; m = 'grin'; lean = 3; }
  else if (t < T.worry[0]) { look = [4, 0]; brow = 'smug'; m = 'smile'; }
  else if (t < T.worry[1]) { look = [4, -1]; brow = 'sad'; m = 'wavy'; extra = P.sweat(-30, -60); }
  else if (t < T.bump) { look = [5, 0]; brow = 'angry'; m = 'teeth'; lean = 3; }
  else if (t < T.land) { look = [2, 4]; brow = 'up'; m = 'o'; }
  else if (t < T.ding) { cross = t < T.land + 6; brow = 'up'; m = 'o'; }
  else if (t < T.ding + 10) { look = [t < T.ding + 5 ? -4 : 4, 0]; brow = 'up'; m = 'flat'; }
  else if (t < T.relax[0]) { look = [4, -1]; brow = 'smug'; m = 'smile'; }
  else if (t < T.brake) { blink = true; brow = 'flat'; m = 'smile'; arms = 'up'; }
  else { look = [-4, 0]; brow = 'smug'; m = 'smile'; }
  const sq = 1 - imp(t, T.coneHit, 0.15, 5, 1.4) - imp(t, T.land, 0.12, 5, 1.4);
  let g = q(-8 + lean, -6 + dy, 0.42, {look, brow, m, arms, legs: 'none', cross, blink, squash: sq - (arms === 'up' ? 0.04 * Math.sin((t - T.relax[0]) * 0.25) : 0)});
  const hx = t >= T.honk && t < T.honk + 8 ? 12 : 13, hy = t >= T.honk && t < T.honk + 8 ? -31 : -34;
  if (arms === 'x') g += L(2 + lean, -30, hx, hy, 2.6) + `<circle cx="${hx}" cy="${hy}" r="2.4" fill="${C.ink}"/>`;
  if (t >= T.coneHit && t < T.coneFly[0]) g += coneT(-8 + lean, -59 + 58 * (1 - sq), 0.75, -6 + imp(t, T.coneHit, 14, 6, 1));
  return g + extra;
}
function snickDrv(t: number, F: number) {
  let look = [4, 0], brow = 'smug', m = 'grin', arms = 'x', lean = 0, blink = blinkAt(F, 37), dy = 0, extra = '';
  if (t < T.launch) dy = Math.sin(t * 2.9 + 1) * 0.6;
  else if (t < T.spot) lean = -3 * (1 - (t - T.launch) / 38);
  else if (t < 52) { look = [3, -4]; brow = 'up'; m = 'o'; }
  else if (t < T.glare[1]) { look = [5, 0]; brow = 'angry'; m = 'grin'; }
  else if (t < T.coneToss) { look = [4, -3]; brow = 'smug'; m = 'grin'; arms = 'up'; extra = coneT(-11, -72, 0.75, 0); }
  else if (t < T.honkHit) { look = [5, 0]; m = 'grin'; blink = t > T.coneHit && t < 128; dy = t > T.coneHit && t < 128 ? -Math.abs(Math.sin(t * 0.8)) * 2 : 0; }
  else if (t < T.startle[1]) { look = [0, -4]; brow = 'up'; m = 'o'; dy = -hop(t, T.startle[0], 10, 14); }
  else if (t < T.turbo) { look = [5, 0]; brow = 'angry'; m = 'frown'; }
  else if (t < T.merge[1]) { look = [5, 0]; brow = 'angry'; m = 'grin'; blink = within(t, T.laugh) && Math.floor(t / 5) % 2 === 0; dy = within(t, T.laugh) ? -Math.abs(Math.sin(t * 0.7)) * 2 : 0; }
  else if (t < T.bonk) { look = [4, 0]; brow = 'smug'; m = 'smile'; }
  else if (t < T.jaw[0]) { look = [4, -2]; brow = 'up'; m = 'o'; }
  else if (t < T.jaw[1]) { look = [5, 0]; brow = 'up'; m = 'o'; }
  else { look = [5, 0]; brow = 'angry'; m = 'frown'; if (t < T.leave[1]) extra += steam(-10, -78, t, 1); }
  let g = snick(-10 + lean, -15 + dy, 0.55, {look, brow, m, arms, blink});
  if (arms === 'x') g += L(0 + lean, -30 + dy, 12, -35, 2.6) + `<circle cx="12" cy="-35" r="2.4" fill="${C.ink}"/>`;
  if (t >= T.coneFly[1]) g += coneT(-10, -66 + dy, 0.75, 4 + imp(t, T.coneFly[1], 12, 6, 1));
  return g + extra;
}

// ---- dunia (satu dunia, dirender per kamera) ----
function world(t: number, F: number, c: Cam) {
  const x0 = c.fx - c.sx / c.k - 60, x1 = c.fx + (270 - c.sx) / c.k + 60;
  const kf = 0.55 * c.k + 0.25, cf = {k: kf, fx: c.fx * 0.3, fy: c.fy, sx: c.sx, sy: c.sy};
  const fx0 = cf.fx - c.sx / kf - 60, fx1 = cf.fx + (270 - c.sx) / kf + 60;
  let g = camG(cityFar(fx0, fx1), cf);
  let w = cityNear(x0, x1, F, t < T.land ? 1 : 1 - clamp01((t - T.land) / 8));
  w += speedBump(BUMPX, LANE);
  const Q = qState(t), S = sState(t);
  const smoke = (x: number, dir: number) => t < 22 ? Array.from({length: 3}, (_, i) => { const p = ((t + i * 5) % 14) / 14; return `<circle cx="${x - dir * (8 + p * 30)}" cy="${LANE - 6 - p * 14}" r="${4 + p * 8}" fill="#C9D2E8" stroke="${C.ink}" stroke-width="1.6" opacity="${(1 - p) * (t < T.launch + 12 ? 1 : 1 - (t - T.launch - 12) / 4)}"/>`; }).join('') : '';
  w += smoke(Q.x - 24, 1) + smoke(S.x + 24, -1);
  const qShadowY = t >= T.bump && t < T.land ? lerp(LANE, PARK, (t - T.bump) / (T.land - T.bump)) : Q.y >= PARK - 1 && t >= T.land ? PARK : LANE;
  const sDrive = S.y > 400 ? LANE : S.y;
  w += shadow(S.x, sDrive, 86, 0.9) + shadow(Q.x, qShadowY, 86 * (1 - (qShadowY - Q.y) / 220), 0.9);
  const turbo = within(t, [T.turbo, 214]) ? 1 + 0.25 * Math.sin(t * 1.7) : 0;
  const sCar = miniCar(S.x, S.y, {c: C.s, flip: true, wh: S.wh, tilt: S.tilt, sq: S.sq, turbo, drv: snickDrv(t, F), brake: within(t, [T.sArrive - 14, T.sArrive + 4]) || within(t, [T.bonk, T.bonk + 10]) ? 1 : 0});
  const qCar = miniCar(Q.x, Q.y, {c: C.q, wh: Q.wh, tilt: Q.tilt, sq: Q.sq, drv: quibbleDrv(t, F), brake: io(t, [T.brake, T.brake + 3], 0, 1)});
  w += (t >= T.land ? qCar + sCar : sCar + qCar);
  if (t >= T.coneFly[0] && t < T.coneFly[1]) { // kerucut terpental dari kepala Quibble ke kepala Snick
    const u = (t - T.coneFly[0]) / (T.coneFly[1] - T.coneFly[0]);
    w += coneT(lerp(GAPX - 8, S.x + 10, u), lerp(PARK - 66, S.y - 80, u) - 60 * Math.sin(Math.PI * u), 0.75, u * 380);
  }
  if (within(t, [T.bonk, T.bonk + 6])) w += impactLines(GAPX + 44, PARK - 22, 10);
  if (within(t, [T.ding, T.ding + 16])) { const p = (t - T.ding) / 16; w += `<g opacity="${1 - p}">${P.sparkle(GAPX + 30, PARK - 70 - p * 10)}${P.sparkle(GAPX - 40, PARK - 56 - p * 8)}</g>`; }
  if (within(t, [T.sHonk, T.sHonk + 10])) { const p = (t - T.sHonk) / 10; w += hornRing(S.x - 52 - p * 20, S.y - 26, 4 + p * 8, 1 - p); }
  if (t >= T.leave[0] && t < T.leave[1]) w += Array.from({length: 3}, (_, i) => `<rect x="${S.x - 60 - i * 16}" y="${S.y - 30 + i * 9}" width="${12 - i * 3}" height="3" rx="1.5" fill="#fff" opacity="${0.7 - i * 0.2}"/>`).join('');
  return g + camG(w, c);
}

const panelLines = (F: number, x0: number, dir: number, p: number) => p <= 0 ? '' : Array.from({length: 9}, (_, i) => {
  const y = 40 + ((i * 53) % 300), len = 30 + (i % 3) * 22, x = x0 + ((((i * 71) - dir * F * 26) % 200) + 200) % 200 - 40;
  return `<rect x="${x}" y="${y}" width="${len}" height="2.5" rx="1.2" fill="#fff" opacity="${0.45 * p}"/>`;
}).join('');

const W: Cam = {k: 1.35, fx: 150, fy: 353.7, sx: 135, sy: 236};
const mixCam = (a: Cam, b: Cam, u: number): Cam => ({k: Math.exp(lerp(Math.log(a.k), Math.log(b.k), u)), fx: lerp(a.fx, b.fx, u), fy: lerp(a.fy, b.fy, u), sx: lerp(a.sx, b.sx, u), sy: lerp(a.sy, b.sy, u)});

export const EP13: React.FC = () => {
  const F = useCurrentFrame();
  let t = F;
  for (const a of [T.coneHit, T.land]) t = hold2(t, a);
  let svg = `<rect width="270" height="480" fill="url(#skyN)"/>`, over = '';
  if (t < T.merge[1]) {
    const u = ss((t - T.merge[0]) / (T.merge[1] - T.merge[0]));
    const Q = qState(t), S = sState(t);
    const vib = (t < T.launch ? 1.2 : 0.5) * Math.sin(F * 3.1);
    let cq: Cam = {k: 2.5, fx: Q.x + 6, fy: 372 + shake(t, T.coneHit, 10, 3) + vib * 0.5, sx: 67.5, sy: 215};
    let cs: Cam = {k: 2.5, fx: S.x - 6, fy: 372 + shake(t, T.honkHit, 10, 3) - vib * 0.5, sx: 202.5, sy: 215};
    cq = mixCam(cq, W, u); cs = mixCam(cs, W, u);
    const pq = clamp01(vq(t) / 14) * (1 - u), ps = clamp01(vs(t) / 15) * (1 - u) * (t >= T.turbo && t < 214 ? 1.6 : 1);
    svg += `<g clip-path="url(#clipL)">${world(t, F, cq)}${panelLines(F, 0, 1, pq)}</g><g clip-path="url(#clipR)">${world(t, F, cs)}${panelLines(F, 135, -1, ps)}</g>`;
    const dv = 1 - u;
    if (dv > 0) over += `<rect x="132" y="0" width="6" height="480" fill="${C.ink}" opacity="${dv}"/><rect x="134" y="0" width="2" height="480" fill="${NEON.y}" opacity="${dv}"/>`;
    // ikon celah parkir di atas sekat: tujuan lomba
    if (t >= T.spot && dv > 0) {
      const p = io(t, [T.spot, T.spot + 6], 0, 1, Easing.out(Easing.back(2))), pl = 0.8 + 0.2 * Math.sin(F * 0.4);
      over += `<g transform="translate(135,92) scale(${p * (t < T.spot + 14 ? 1.15 : 0.85)})" opacity="${dv}"><rect x="-30" y="-20" width="60" height="40" rx="8" fill="#0E1640" stroke="${NEON.t}" stroke-width="3.5" opacity="${pl}"/><rect x="-20" y="-11" width="40" height="22" rx="3" fill="none" stroke="${NEON.t}" stroke-width="2" stroke-dasharray="4 3"/>${t < T.spot + 14 ? P.sparkle(24, -18) : ''}</g>`;
    }
    // kerucut dilempar Snick melintasi sekat
    if (t >= T.coneToss && t < T.coneHit) {
      const v = (t - T.coneToss) / (T.coneHit - T.coneToss);
      const [ax, ay] = scr(cs, S.x + 11, S.y - 72), [bx, by] = scr(cq, Q.x - 8, Q.y - 60);
      over += coneT(lerp(ax, bx, v), lerp(ay, by, v) - 90 * Math.sin(Math.PI * v), 2, -v * 340);
    }
    if (within(t, [T.coneHit, T.coneHit + 6])) { const [bx, by] = scr(cq, Q.x - 8, Q.y - 62); over += impactLines(bx, by, 22); }
    // klakson Quibble: gelombang bunyi menyeberang ke panel Snick
    if (t >= T.honk && t < T.honkHit + 8) {
      const [ax, ay] = scr(cq, Q.x + 20, Q.y - 34), [bx, by] = scr(cs, S.x - 4, S.y - 50);
      for (let i = 0; i < 3; i++) { const v = (t - T.honk - i * 3) / (T.honkHit - T.honk); if (v > 0 && v < 1.3) over += hornRing(lerp(ax, bx, Math.min(1, v)), lerp(ay, by, Math.min(1, v)), 10 + v * 16, Math.min(1, 1.3 - v)); }
    }
    if (within(t, [T.honkHit, T.honkHit + 6])) { const [bx, by] = scr(cs, S.x, S.y - 60); over += impactLines(bx, by, 26); }
  } else {
    let c = W;
    const sh = shake(t, T.land, 10, 4) + shake(t, T.bonk, 8, 3);
    c = {...W, fx: W.fx + sh, fy: W.fy + sh * 0.5};
    if (t >= T.push[0]) { const u = Easing.in(Easing.cubic)(clamp01((t - T.push[0]) / (419 - T.push[0]))); c = {k: Math.exp(lerp(Math.log(W.k), Math.log(9.5), u)), fx: lerp(W.fx, 86, ss(u * 1.6)), fy: lerp(W.fy, 361, ss(u * 1.6)), sx: 135, sy: lerp(236, 200, ss(u * 1.6))}; }
    svg += world(t, F, c);
  }
  // HOOK: lampu merah -> hijau (frame 0 = pasangan match-cut lampu rem di akhir)
  if (F < T.lightGone) {
    const u = io(F, [T.launch, T.lightGone], 0, 1, Easing.in(Easing.cubic));
    over += trafficLight(135, lerp(200, -120, u), lerp(40, 22, u), F < T.green ? 'r' : 'g');
  }
  return (
    <AbsoluteFill style={{backgroundColor: '#070B26'}}>
      <svg viewBox="0 0 270 480" width={1080} height={1920} dangerouslySetInnerHTML={{__html: defs + cityDefs + svg + over + vignette}} />
      <Audio src={staticFile('ep13.wav')} />
    </AbsoluteFill>
  );
};
