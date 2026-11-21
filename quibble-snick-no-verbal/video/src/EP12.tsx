// EP12 "Balloon" — STRUKTUR G (kerja sama, ending hangat). Satu long take: crane naik/turun + zoom pelan.
// Hook: flash-forward (bertiga melayang tinggi) lalu REWIND ke awal. Loop: keluar frame atas -> masuk lagi dari bawah.
// Waktu cerita T' (40..444): f<24 -> T'=f+420 (lanjutan akhir video), f 24..40 -> rewind 444->40, f>=40 -> T'=f.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {C, quibble as q, P, L} from './draw.js';
import {dot, brick, shadow, defs, vignette, trail, impactLines, blinkAt, runLegs, BAL, BSLOT, balloon, bstr, balPop, heart, cloud, birdie, cotton, fairDefs, fairFar, ferris, bunting, pole, tent, balloonCart, CART_G, castle, CASTLE, rewindFx, speedLines} from './draw2';
import T from './ep12-timeline.json';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = (f: number, r: number[], v0: number, v1: number, e = Easing.inOut(Easing.cubic)) => interpolate(f, [r[0], r[1]], [v0, v1], {...cl, easing: e});
const within = (f: number, r: number[]) => f >= r[0] && f < r[1];
const shake = (f: number, at: number, len = 8, amp = 5) => (f >= at && f < at + len ? Math.sin((f - at) * 2.3) * amp * (1 - (f - at) / len) : 0);
const hold2 = (f: number, at: number) => (f === at + 1 || f === at + 2 ? at : f);
type Cam = {k: number, fx: number, fy: number, sx: number, sy: number};
const camG = (inner: string, c: Cam) => `<g transform="translate(${c.sx - c.fx * c.k},${c.sy - c.fy * c.k}) scale(${c.k})">${inner}</g>`;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ss = (x: number) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const eo = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const hop = (t: number, at: number, len: number, h: number) => (t >= at && t <= at + len ? h * Math.sin(Math.PI * (t - at) / len) : 0);
const imp = (t: number, at: number, amp: number, tau = 12, w = 0.3) => (t >= at ? amp * Math.exp(-(t - at) / tau) * Math.sin((t - at) * w) : 0);
// Hermite non-uniform: [t, v, slope?]
function herm(t: number, ks: number[][]) {
  const n = ks.length;
  if (t <= ks[0][0]) return ks[0][1];
  if (t >= ks[n - 1][0]) return ks[n - 1][1];
  const m = (i: number) => ks[i][2] !== undefined ? ks[i][2] : (i === 0 || i === n - 1) ? 0 : (ks[i + 1][1] - ks[i - 1][1]) / (ks[i + 1][0] - ks[i - 1][0]);
  let i = 0; while (t > ks[i + 1][0]) i++;
  const [t0, v0] = ks[i], [t1, v1] = ks[i + 1], h = t1 - t0, s = (t - t0) / h, s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * v0 + (s3 - 2 * s2 + s) * h * m(i) + (-2 * s3 + 3 * s2) * v1 + (s3 - s2) * h * m(i + 1);
}
const S = 0.6, PO = T.pops, FL = CASTLE.floor;
const STEPS = [60, 75, 90, 105, 115, 130, 153];
const DXK = [[40, 105, 0], [62, 105, 0], [82, 108, 0], [118, 110, 0], [140, 111, 0], [232, 114], [262, 116, 0], [334, 362, 0]];
const V = (u: number) => (u <= 15 ? 21 * u + 1.35 * u * u : 619 + 732 * (1 - Math.exp(-(u - 15) / 12)));

// lantai kastil memantul
const dent = (t: number) => [[336, 9], [348, 3], [356, 2], [386, 7], [398, 13]].reduce((a, [at, amp]) => a + (t >= at ? amp * Math.exp(-(t - at) / 5) * Math.max(0, Math.cos((t - at) * 0.55)) : 0), 0) + 6 * io(t, [392, 398], 0, 1) * (t < 398 ? 1 : 0);

// rantai di udara: kaki Dot (dy). Fase 96..336
function dyAir(t: number) {
  if (t < 118) return herm(t, [[94, 303, 0], [118, 181, -2]]);
  if (t < 140) return 181 + 10 * io(t, [119, 126], 0, 1) - 16 * io(t, [134, 140], 0, 1);
  if (t < 262) return herm(t, [[140, 175, 0], [178, 51, -8], [232, -560, -3], [262, -575, 0]]) + 4 * Math.sin(t * 0.15) * io(t, [226, 240], 0, 1);
  let y = -575;
  PO.forEach((p, i) => { y += STEPS[i] * eo((t - p) / (i === 6 ? 10 : 9)); });
  return y;
}
const dxF = (t: number) => herm(t, DXK);
function swayQ(t: number) {
  const lag = -(dxF(t) - dxF(t - 6)) * 0.9;
  return 3 * Math.sin(t * 0.12) + imp(t, 134, 9) + imp(t, 178, 12, 14, 0.35) + lag + PO.reduce((a, p) => a + imp(t, p, 3, 6, 0.6), 0);
}

// ===== POSE seluruh pemeran pada waktu cerita t =====
type Pose = {dx: number, dy: number, qx: number, qy: number, bx: number, by: number, qsq: number, bsq: number, dsq: number, chainQ: number, chainB: number};
function pose(t: number): Pose {
  let dx = dxF(t), dy = 400, qx = 156, qy = 400, bx = 218, by = 400, qsq = 1, bsq = 1, dsq = 1, chainQ = 0, chainB = 0;
  if (t < 64) { dy = 400 - hop(t, T.take[0], 10, 8) - hop(t, T.take[1], 12, 14); dsq = 1 - 0.12 * Math.max(0, 1 - Math.abs(t - T.take[0] - 10) / 3) - 0.12 * Math.max(0, 1 - Math.abs(t - T.take[1] - 12) / 3); }
  else if (t < 82) dy = io(t, [62, 82], 400, 262, Easing.inOut(Easing.quad));
  // Quibble
  if (t >= 68 && t < 82) {
    qx = io(t, [68, 78], 156, dxF(82), Easing.inOut(Easing.quad));
    qy = 400 - (t >= 76 ? Math.sin(Math.PI / 2 * clamp01((t - 76) / 6)) * 37 : 0);
  }
  if (t >= 82 && t < 94) {
    qx = dx; qy = t < 87 ? io(t, [82, 87], 363, 400, Easing.in(Easing.quad)) : 400;
    qsq = t >= 87 ? 0.9 + 0.1 * clamp01((t - 90) / 4) : 1;
    dy = qy - 101 * qsq - 0 + (t >= 87 ? 4 : 0);
    chainQ = 1;
  }
  // Brick (tanah)
  if (t >= 104 && t < 118) { bx = io(t, [104, 116], 218, dxF(118) + 2, Easing.inOut(Easing.quad)); by = 400 - Math.abs(Math.sin((t - 104) * 0.5)) * 3; }
  if (t >= 118) { bx = dxF(118) + 2; }
  if (t >= 94 && t < 336) {
    dy = dyAir(t); const sq = swayQ(t);
    qx = dx + sq; qy = dy + 101; chainQ = 1;
    if (t >= 118) {
      chainB = 1;
      const gB = dxF(118) + 2, aQ = dx + sq, aB = aQ + 1.5 * swayQ(t - 3) - 0.5 * sq, wA = ss((t - 138) / 12);
      bx = lerp(gB, aB, wA); qx = lerp(lerp(aQ, gB, 0.7), aQ, wA);
      if (t < 140) { by = 400; bsq = t < 132 ? 1 - 0.08 * io(t, [118, 124], 0, 1) : 1 + 0.06 * io(t, [134, 140], 0, 1); }
      else { by = qy + 118 + 6 * (1 - ss((t - 140) / 8)); bsq = 1 + 0.06 * (1 - ss((t - 140) / 8)); }
    }
    if (t >= 94 && t < 96) { qy = 400; dy = 299 + 4; }
  }
  // Mendarat di kastil
  if (t >= 336) {
    const fl = FL - dent(t);
    bx = 362; by = fl; bsq = 1 - 0.12 * Math.max(0, 1 - (t - 336) / 6);
    const h1 = hop(t, T.hop1[0], 10, 16), h2 = hop(t, T.hop2[0], 12, 38);
    if (t < 340) { qx = 362; qy = by - 118; dx = 362; dy = qy - 101; chainQ = 1; chainB = 1; }
    else {
      const u = clamp01((t - 340) / 8);
      qx = lerp(362, 322, u); qy = t < 348 ? lerp(by - 118, fl, u) - Math.sin(Math.PI * u) * 22 : fl;
      const v = clamp01((t - 340) / 16), e = Easing.inOut(Easing.sin)(v);
      dx = lerp(362, 402, e) + Math.sin(v * 7) * 6 * (1 - v); dy = t < 356 ? lerp(153 + 0, fl, e) : fl;
      if (t >= 348 && t < 351) qsq = 0.88; if (t >= 356 && t < 359) dsq = 0.85;
    }
    if (t >= 376) { qy -= h1 + h2; by -= h1 + h2; dy -= h1 + h2; }
    for (const at of [T.hop1[1], T.hop2[1]]) if (t >= at - 1 && t < at + 2) { qsq = 0.86; bsq = 0.88; dsq = 0.82; }
  }
  // Meluncur lagi (dari pantulan) + bunch kastil
  if (t >= T.launch) {
    const u = t - T.launch, Vt = V(u);
    dx = herm(t, [[400, 402, 0], [404, 430], [420, 428, 0]]); dy = FL - Vt; dsq = 1;
    const sq = 3 * Math.sin(t * 0.12) + imp(t, 405, 8) + imp(t, 408, 6);
    const qs = [dx + sq, dy + 101], bs = [dx + sq + 1.5 * (3 * Math.sin((t - 3) * 0.12)) + imp(t, 408, -10), dy + 219];
    const wq = io(t, [401, 405], 0, 1), wb = io(t, [403, 408], 0, 1);
    qx = lerp(322, qs[0], wq); qy = lerp(FL - 0.4 * Vt, qs[1], wq);
    bx = lerp(362, bs[0], wb); by = lerp(FL - 0.2 * Vt, bs[1], wb);
    chainQ = t >= T.snapQ ? 1 : 0; chainB = t >= T.snapB ? 1 : 0; qsq = 1; bsq = 1;
    if (t >= T.wrap) { // wrap: rantai dipindah ke bawah layar lalu naik ke tengah (keluar atas -> masuk bawah)
      const c = camera(t), Y = 482 - 440 * eo((t - T.settle[0]) / (T.settle[1] - T.settle[0]));
      const ndy = c.fy + (Y - 236) / c.k + 149, off = ndy - dy;
      dy += off; qy += off; by += off;
    }
  }
  return {dx, dy, qx, qy, bx, by, qsq, bsq, dsq, chainQ, chainB};
}

// ===== KAMERA =====
const FXK = [[40, 135, 0], [64, 135, 0], [100, 131], [140, 124], [336, 368], [356, 372, 0], [400, 372, 0]];
const FYK = [[40, 324, 0], [62, 324, 0], [82, 314], [100, 292], [120, 248], [140, 234], [336, 250], [352, 318], [366, 330, 0], [400, 330, 0]];
const KK = [[40, 1, 0], [62, 1, 0], [110, 0.95], [200, 0.95], [232, 1], [262, 1.06], [300, 1.0], [336, 1.0], [358, 1.08, 0], [400, 1.08, 0]];
function camera(t: number) {
  if (t >= 400) { const u = ss((t - 400) / 44); return {fx: lerp(372, 418, u), fy: 330 - 580 * u, k: lerp(1.08, 1.0, u), sx: 135, sy: 236}; }
  const w = Easing.inOut(Easing.sin)(clamp01((t - 124) / 22)) * (1 - Easing.inOut(Easing.sin)(clamp01((t - 328) / 22)));
  const fx = herm(t, FXK), fy = herm(t, FYK), k = herm(t, KK);
  const ffx = dxF(t - 4) + 12, ffy = dyAir(t - 4) + 40;
  return {fx: lerp(fx, ffx, w), fy: lerp(fy, ffy, w), k, sx: 135, sy: 236};
}

// ===== BALON =====
type B = {x: number, y: number, c: string, ax: number, ay: number, pop?: number};
const bpos = (gx: number, gy: number, i: number, t: number, wind = 0) => [gx + BSLOT[i][0] + 2 * Math.sin(t * 0.09 + i * 1.7) + wind, gy + BSLOT[i][1] + 1.6 * Math.cos(t * 0.07 + i)];
function drawBalloons(bs: B[]) {
  let s = bs.filter(b => b.pop === undefined).map(b => bstr(b.ax, b.ay, b.x, b.y + 17, Math.sin(b.x * 0.3) * 3)).join('');
  for (const b of [...bs].sort((a, c) => a.y - c.y)) s += b.pop === undefined ? balloon(b.x, b.y, b.c) : balPop(b.x, b.y, b.c, b.pop);
  return s;
}
const arm = (x1: number, y1: number, x2: number, y2: number, w: number) => L(x1, y1, x2, y2, w) + `<circle cx="${x2}" cy="${y2}" r="${w * 0.8}" fill="${C.ink}"/>`;

function scene(t: number, F: number) {
  const p = pose(t), cam = camera(t);
  const {dx, dy, qx, qy, bx, by} = p;
  const fl = FL - dent(t);
  const wind = imp(t, T.gust, 10, 10, 0.25) + (within(t, [T.gust, T.gust + 10]) ? 6 * io(t, [T.gust, T.gust + 4], 0, 1) : 0);
  const G = [dx + 2, dy - 50 * p.dsq];
  // ---- latar dekat ----
  let w = `<rect x="-900" y="400" width="2400" height="900" fill="url(#grF)"/>` + L(-900, 400, 1500, 400, 4);
  for (let i = -10; i < 24; i++) w += `<ellipse cx="${i * 60 + 20}" cy="${430 + (i % 2) * 30}" rx="14" ry="4" fill="#E9B96E" opacity=".5"/>`;
  const gSw = 38 * Math.exp(-Math.max(0, t - T.gondola) / 22) * Math.sin(Math.max(0, t - T.gondola) * 0.25 + 0.0001) * (t >= T.gondola ? 1 : 0);
  w += ferris(240, 150, 105, 0.35 * (t - T.gondola), gSw, 4);
  w += tent(-70, 66, 58) + tent(470, 84, 70, '#FFD54F', '#FFF7E0') + tent(-160, 70, 50, '#B9A2F5', '#FFF3F8');
  const flu = (i: number) => { const d = Math.abs(t - T.bunting - i * 0.4); return t >= T.bunting ? 22 * Math.exp(-(t - T.bunting) / 14) * Math.sin((t - T.bunting) * 0.7 + i) : 3 * Math.sin(t * 0.1 + i) + (d < 0 ? 0 : 0); };
  w += pole(-14, 228) + pole(288, 228) + bunting(-14, 288, 234, 16, flu) + bunting(288, 520, 234, 12, (i) => 3 * Math.sin(t * 0.1 + i));
  w += castle(dent(t), F) + balloonCart(8);
  for (const [x, y, k] of [[-30, -20, 1], [215, -100, 1.2], [40, -250, 1.1], [235, -340, 0.9], [-10, -450, 1.3], [200, -540, 1], [70, -680, 1.2], [270, -720, 1], [340, -210, 1], [430, -110, 1.1], [390, -430, 1.2], [480, -320, 1], [520, -560, 1.1], [330, -620, 0.9]]) w += cloud(x, y, k);
  // ---- balon ----
  const bs: B[] = [];
  const cg = CART_G(8);
  const dotSlots: number[] = [];
  const addDot = (i: number) => { const [x, y] = bpos(G[0], G[1], i, t, wind); bs.push({x, y, c: BAL[i], ax: G[0], ay: G[1]}); };
  const fly = (i: number, from: number[], fromA: number[], to: number[], toA: number[], u: number, arc = 0) => { const e = Easing.inOut(Easing.quad)(u); bs.push({x: lerp(from[0], to[0], e), y: lerp(from[1], to[1], e) - Math.sin(Math.PI * u) * arc, c: BAL[i], ax: lerp(fromA[0], toA[0], e), ay: lerp(fromA[1], toA[1], e)}); };
  // kepemilikan per slot
  for (let i = 0; i < 10; i++) {
    const cartP = bpos(cg[0], cg[1], i, t);
    if (i === 4 || i === 5) {
      const arr = T.take[i - 4];
      if (t < arr - 6) bs.push({x: cartP[0], y: cartP[1], c: BAL[i], ax: cg[0], ay: cg[1]});
      else if (t < arr) fly(i, cartP, cg, bpos(G[0], G[1], i, t, wind), G, (t - arr + 6) / 6, 10);
      else if (t < PO[9 - i]) dotSlots.push(i);
      else if (t < PO[9 - i] + 7) { const [x, y] = bpos(G[0], G[1], i, t, wind); bs.push({x, y, c: BAL[i], ax: G[0], ay: G[1], pop: (t - PO[9 - i]) / 7}); }
      continue;
    }
    if (i >= 6) {
      if (t < T.snatch - 2) bs.push({x: cartP[0], y: cartP[1], c: BAL[i], ax: cg[0], ay: cg[1]});
      else if (t < T.snatch + 4) fly(i, cartP, cg, bpos(G[0], G[1], i, t, wind), G, (t - T.snatch + 2) / 6, 6);
      else if (t < PO[9 - i]) dotSlots.push(i);
      else if (t < PO[9 - i] + 7) { const [x, y] = bpos(G[0], G[1], i, t, wind); bs.push({x, y, c: BAL[i], ax: G[0], ay: G[1], pop: (t - PO[9 - i]) / 7}); }
      continue;
    }
    if (i === 3) { if (t < PO[6]) dotSlots.push(i); else if (t < PO[6] + 7) { const [x, y] = bpos(G[0], G[1], i, t, wind); bs.push({x, y, c: BAL[i], ax: G[0], ay: G[1], pop: (t - PO[6]) / 7}); } continue; }
    if (i === 0) { dotSlots.push(i); continue; }
    // 1 -> Brick, 2 -> Quibble (hadiah), disimpan sampai akhir
    const giv = i === 1 ? T.giveB : T.giveQ;
    const hand = i === 1 ? bHand(p, t) : qHand(p, t);
    const hb = [hand[0] + (i === 1 ? -2 : 2), hand[1] - 42];
    if (t < giv[0]) dotSlots.push(i);
    else if (t < giv[1]) fly(i, bpos(G[0], G[1], i, t), G, hb, hand, (t - giv[0]) / (giv[1] - giv[0]), i === 2 ? 46 : 14);
    else bs.push({x: hb[0] + 1.5 * Math.sin(t * 0.1 + i), y: hb[1] + Math.cos(t * 0.08 + i), c: BAL[i], ax: hand[0], ay: hand[1]});
  }
  // bunch dekorasi kastil (slot 1..6, warna lain) -> direbut Dot saat meluncur
  const CG = CASTLE.g;
  for (let i = 1; i <= 6; i++) {
    const c = BAL[(i + 6) % 10];
    const cp = bpos(CG[0], CG[1], i, t);
    if (t < T.grabBunch) bs.push({x: cp[0], y: cp[1], c, ax: CG[0], ay: CG[1] + 4});
    else if (t < T.grabBunch + 4) { const u = Easing.out(Easing.quad)((t - T.grabBunch) / 4), dp = bpos(G[0], G[1], i, t); bs.push({x: lerp(cp[0], dp[0], u), y: lerp(cp[1], dp[1], u), c, ax: lerp(CG[0], G[0], u), ay: lerp(CG[1] + 4, G[1], u)}); }
    else { const dp = bpos(G[0], G[1], i, t); bs.push({x: dp[0], y: dp[1], c, ax: G[0], ay: G[1]}); }
  }
  for (const i of dotSlots) addDot(i);
  // ---- burung di balon teratas ----
  let bird = '';
  if (within(t, [T.bird[0], T.bird[3]])) {
    const top = bpos(G[0], G[1], 7, t, wind), perch = [top[0], top[1] - 19];
    let x, y, fl2 = t * 1.6, tilt = 0;
    if (t < T.bird[1]) { const u = (t - T.bird[0]) / (T.bird[1] - T.bird[0]); x = lerp(perch[0] + 120, perch[0], eo(u)); y = lerp(perch[1] - 50, perch[1], eo(u)) ; }
    else if (t < T.bird[2]) { x = perch[0]; y = perch[1]; fl2 = 0; tilt = within(t, [T.peck, T.peck + 3]) ? 35 : 0; }
    else { const u = (t - T.bird[2]) / (T.bird[3] - T.bird[2]); x = lerp(perch[0], perch[0] - 140, Easing.in(Easing.quad)(u)); y = lerp(perch[1], perch[1] - 90, u); }
    bird = `<g transform="rotate(${tilt} ${x} ${y + 6})">${birdie(x, y, 0.9, fl2, t >= T.bird[2])}</g>`;
  }
  // ---- pemeran ----
  let ch = '';
  const gdist = (y: number, g = 400) => clamp01(1 - (g - y) / 110);
  const groundY = t >= 336 ? fl : 400;
  ch += shadow(bx, groundY, 70, gdist(by, groundY)) + shadow(qx, groundY, 48, gdist(qy, groundY)) + shadow(dx, groundY, 30, gdist(dy, groundY));
  ch += drawBrick(p, t, F) + drawQ(p, t, F) + drawDot(p, t, F, G);
  ch += drawBalloons(bs) + bird;
  // ---- efek ----
  let fx = '';
  if (within(t, [T.qGrab, T.qGrab + 5])) fx += impactLines(dx, dy, 8);
  if (within(t, [T.bGrab, T.bGrab + 6])) fx += impactLines(qx, qy, 10);
  if (within(t, [T.gondola, T.gondola + 7])) fx += impactLines(bx + 34, by - 104, 8) + P.burst(bx + 36, by - 108, 9);
  if (within(t, [T.gust, T.gust + 14])) { const u = (t - T.gust) / 14; fx += `<g opacity="${1 - u}">${P.wind(dx - 110 + u * 60, dy - 40)}${P.wind(dx - 90 + u * 70, dy + 80)}</g>`; }
  if (within(t, [T.idea, T.idea + 10])) fx += P.sparkle(bx + 42, by - 112) + P.sparkle(bx - 40, by - 100);
  if (within(t, [T.lookDown, T.peak[1]])) fx += P.sweat(bx + 44, by - 92 + (t % 8)) + P.sweat(qx - 30, qy - 76 + (t % 6));
  if (within(t, [T.peck, T.bird[2]])) fx += P.sweat(dx + 22, dy - 40);
  if (within(t, [T.land, T.land + 10])) { const u = (t - T.land) / 10; fx += [-1, 1].map(s => `<circle cx="${bx + s * (40 + u * 30)}" cy="${fl - 4 - u * 6}" r="${7 * (1 - u) + 2}" fill="#fff" stroke="${C.ink}" stroke-width="2" opacity="${1 - u}"/>`).join(''); }
  if (within(t, [T.hearts, T.hearts + 24])) { const u = (t - T.hearts) / 24; fx += heart(qx - 26, qy - 96 - u * 30, 0.9, 1 - u * u) + heart(bx - 50, by - 118 - u * 34, 1.1, 1 - u * u) + heart(dx + 26, dy - 52 - u * 30, 0.8, 1 - u * u); }
  // tongkat arum manis dilempar
  if (within(t, T.toss)) { const u = (t - T.toss[0]) / (T.toss[1] - T.toss[0]); const a = [bx + 24, by - 64], b2 = dHand(p); fx += cotton(lerp(a[0], b2[0], u), lerp(a[1], b2[1], u) - Math.sin(Math.PI * u) * 40, S, u * 540, 1); }
  return {near: camG(w + ch + fx, cam), far: camG(fairFar(), {k: cam.k, fx: 135 + (cam.fx - 135) * 0.3, fy: 324 + (cam.fy - 324) * 0.3, sx: 135, sy: 236}), cam};
}

// tangan pemegang hadiah balon
const bHand = (p: Pose, _t: number) => [p.bx + 46, p.by - 86];
const qHand = (p: Pose, _t: number) => [p.qx + 30, p.qy - 76];
const dHand = (p: Pose) => [p.dx + 18, p.dy - 34];

function drawBrick(p: Pose, t: number, F: number) {
  const {bx, by, qx, qy, bsq} = p;
  const sh = [by - 12 - 54 * bsq];
  let look = [-1, 0], brow = 'flat', m = 'flat', blink = blinkAt(F, 30), blush = false;
  if (t >= T.bNotice && t < T.stuff) { brow = 'up'; look = [-1, -0.5]; }
  if (t >= T.bWalk[0] && t < T.bGrab) look = [-0.4, -1];
  if (t >= T.bGrab && t < T.gust) { look = [0, -1]; brow = 'flat'; }
  if (t >= T.gust && t < T.bLift + 6) { brow = 'up'; look = [0, 1]; m = 'o'; }
  if (t >= T.bLift + 6 && t < T.lookDown) { look = [0.3, -0.3]; brow = 'flat'; }
  if (within(t, [T.gondola, T.gondola + 12])) { brow = 'angry'; blink = within(t, [T.gondola, T.gondola + 3]); }
  if (t >= T.lookDown && t < T.idea) { look = [0, 1]; brow = 'sad'; m = 'wavy'; }
  if (t >= T.idea && t < T.gulp[0]) { brow = 'up'; look = [0.5, -1]; m = 'smile'; }
  if (within(t, T.gulp)) { m = t < T.gulp[0] + 3 ? 'o' : 'smile'; brow = 'up'; }
  if (t >= T.toss[0] && t < T.land) { look = [0, -1]; brow = 'up'; m = 'smile'; }
  if (t >= T.land) { look = [0.4, 0]; brow = 'flat'; m = 'smile'; }
  if (t >= T.giveB[1] - 2 && t < T.hearts + 4) { blush = true; brow = 'up'; m = 'smile'; look = [0.5, -0.4]; }
  if (t >= T.hop1[0]) { m = 'grin'; brow = 'up'; }
  if (t >= T.launch) { m = t < 420 ? 'o' : 'grin'; brow = 'up'; look = [0, -1]; }
  if (t >= 434) { m = 'smile'; look = [0.6, 1]; }
  const hasStick = t >= T.stuff - 2 && t < T.gulp[1];
  const candyInMouth = t >= T.stuff && t < T.gulp[0];
  let g = '';
  // lengan
  const sL = [bx - 34, sh[0]], sR = [bx + 34, sh[0]];
  let hL = [bx - 44, by - 26], hR = [bx + 44, by - 26];
  if (t < T.stuff) hR = [bx + 44, by - 30];
  if (t >= T.stuff - 2 && t < T.stuff) hR = [bx + 22, by - 60];
  if (t >= T.bGrab - 2 && t < T.land + 4) { hL = [qx - 9, qy + 1]; hR = [qx + 9, qy + 1]; }
  if (t >= T.bWalk[1] && t < T.bGrab) { const u = (t - T.bWalk[1]) / 2; hL = [lerp(bx - 44, qx - 9, u), lerp(by - 26, qy + 1, u)]; hR = [lerp(bx + 44, qx + 9, u), lerp(by - 26, qy + 1, u)]; }
  if (t >= T.gulp[0] - 2 && t < T.toss[0] + 6) { hR = t < T.toss[0] ? [bx + 20, by - 62] : [bx + 30, by - 96]; }
  if (t >= T.land + 4) { hL = [bx - 44, by - 26]; hR = [bx + 44, by - 26]; }
  if (t >= T.giveB[1] - 1) hR = bHand(p, t);
  if (t >= T.launch) { hL = t >= T.snapB - 2 ? [qx - 8, qy + 1] : [bx - 44, by - 60]; hR = bHand(p, t); }
  g += arm(sL[0], sL[1], hL[0], hL[1], 6) + arm(sR[0], sR[1], hR[0], hR[1], 6);
  g += brick(bx, by, S, {arms: 'none', look, brow, m, blink, squash: bsq});
  if (blush) g += `<ellipse cx="${bx - 24}" cy="${by - 64}" rx="7" ry="3.5" fill="#FF8FA3" opacity=".85"/><ellipse cx="${bx + 24}" cy="${by - 64}" rx="7" ry="3.5" fill="#FF8FA3" opacity=".85"/>`;
  if (t < T.stuff - 2) g += cotton(hR[0], hR[1], S, -8, 0.18 + 0.1 * clamp01((t - 40) / 60));
  else if (candyInMouth) g += cotton(bx + 4, by - 58, S, 72 + 4 * Math.sin(t * 0.5), 0.28);
  else if (hasStick) g += cotton(hR[0], hR[1], S, t < T.gulp[0] ? 40 : -20, io(t, T.gulp, 0.28, 1));
  return g;
}

function drawQ(p: Pose, t: number, F: number) {
  const {qx, qy, dx, dy, qsq} = p;
  let look = [-1, 0], brow = 'flat', m = 'smile', legs = 'stand', ph = 0, amp = 0.4;
  if (t >= T.qNotice) { brow = 'up'; m = 'o'; look = [-1, -1]; }
  if (t >= T.qRun[0] && t < T.qGrab) { brow = 'angry'; m = 'teeth'; legs = t < T.qJump[0] ? 'run' : 'stand'; ph = t * 0.9; }
  if (t >= T.qGrab && t < T.snatch) { brow = 'angry'; m = 'teeth'; look = [0, -1]; }
  if (t >= T.qSmug && t < T.snatch) { brow = 'smug'; m = 'grin'; look = [0.6, 0]; }
  if (t >= T.snatch) { brow = 'up'; m = 'o'; look = [0, -1]; legs = 'dangle'; amp = 1; }
  if (t >= T.qLift + 10) { brow = 'sad'; m = 'wavy'; look = [0, 1]; amp = 0.5; }
  if (within(t, [T.gondola - 2, T.gondola + 10])) { m = 'o'; look = [0.6, 0.6]; }
  if (t >= T.lookDown) { brow = 'up'; m = 'o'; amp = 1.3; look = [0, 1]; }
  if (t >= T.idea) { brow = 'up'; m = 'smile'; amp = 0.4; look = [0.2, 1]; }
  if (t >= T.toss[0]) { look = [0, -1]; m = 'grin'; }
  if (PO.some(pp => within(t, [pp, pp + 4]))) m = 'o';
  if (t >= T.land) { legs = t < T.qHop[0] ? 'dangle' : 'stand'; amp = 0.3; m = 'grin'; brow = 'up'; look = [1, 0]; }
  if (t >= T.giveQ[1] - 2) { m = 'grin'; look = [0.3, -1]; }
  if (t >= T.launch) { legs = 'dangle'; amp = 1.2; m = t < 424 ? 'o' : 'wavy'; brow = 'up'; look = [0, -1]; }
  if (t >= 434) { m = 'o'; look = [-0.6, 1]; }
  let g = '';
  const shY = qy - 0.6 * (20 + 0.55 * 118 * qsq);
  let hL = [qx - 31, qy - 23], hR = [qx + 31, qy - 23];
  if (t >= T.qJump[0] && t < T.qGrab) { const u = clamp01((t - T.qJump[0]) / 4); hL = [lerp(qx - 31, dx - 6, u), lerp(qy - 23, dy + 1, u)]; hR = [lerp(qx + 31, dx + 6, u), lerp(qy - 23, dy + 1, u)]; }
  if (p.chainQ && t < T.launch) { hL = [dx - 6, dy + 1]; hR = [dx + 6, dy + 1]; }
  if (t >= T.qHop[0] && t < T.launch) { hL = [qx - 31, qy - 23]; hR = [qx + 31, qy - 23]; }
  if (t >= T.giveQ[1] - 1) hR = qHand(p, t);
  if (t >= T.launch) { hR = qHand(p, t); hL = t >= T.snapQ - 2 ? [dx - 5, dy + 1] : [qx - 30, qy - 80]; }
  g += arm(qx - 22, shY, hL[0], hL[1], 3.2) + arm(qx + 22, shY, hR[0], hR[1], 3.2);
  g += q(qx, qy, S, {look, brow, m, arms: 'x', legs: legs === 'stand' ? 'stand' : 'none', squash: qsq, blink: blinkAt(F, 11)});
  if (legs === 'run') g += runLegs(qx, qy, ph, S, 1) + trail(qx + 26, qy - 40, -1, 3);
  if (legs === 'dangle') g += runLegs(qx, qy, t * (0.35 + amp * 0.35), S, amp);
  return g;
}

function drawDot(p: Pose, t: number, F: number, G: number[]) {
  const {dx, dy, dsq} = p;
  let look = [0.4, 0], brow = 'up', m = 'grin', roll = 0;
  if (within(t, [T.take[0] - 8, T.take[0]]) || within(t, [T.take[1] - 8, T.take[1]])) look = [-1, -0.4];
  if (within(t, [T.lift - 2, T.lift + 6])) { m = 'o'; look = [0, 1]; }
  if (within(t, [T.snatch - 4, T.snatch + 2])) look = [-1, 0];
  if (within(t, [T.bird[1], T.bird[2] + 2])) { look = [0.4, -1]; m = t >= T.peck ? 'o' : 'smile'; }
  if (t >= T.lookDown && t < T.idea) { m = 'o'; look = [0, 1]; brow = 'sad'; }
  if (t >= T.idea && t < T.toss[1]) { m = 'smile'; look = [0, 1]; brow = 'up'; }
  if (t >= T.toss[1] && t < T.land) { brow = 'angry'; m = 'grin'; look = [0.3, -1]; }
  if (t >= T.land) { brow = 'up'; m = 'grin'; look = [-1, 0]; }
  if (t >= T.launch) { brow = 'up'; m = 'grin'; look = [0, -1]; }
  if (t >= 432) look = [0, 1];
  const hasStick = t >= T.toss[1] && t < T.land + 2;
  let g = '';
  const sh = dy - 26 * dsq;
  let hL = G, hR = G;
  if (hasStick) {
    hR = dHand(p);
    const i = PO.findIndex(pp => t >= pp - 6 && t < pp + 2);
    let dir = [0.5, -0.86];
    if (i >= 0) {
      const tg = bpos(G[0], G[1], 9 - i, t), pk = io(t, [PO[i] - 6, PO[i]], 0, 1) * (t < PO[i] + 2 ? 1 : 0);
      hR = [lerp(hR[0], tg[0], 0.45 * pk), lerp(hR[1], tg[1] + 8, 0.45 * pk)];
      const v = [tg[0] - hR[0], tg[1] - hR[1]], n = Math.hypot(v[0], v[1]) || 1; dir = [v[0] / n, v[1] / n];
    }
    g += L(hR[0], hR[1], hR[0] + dir[0] * 20, hR[1] + dir[1] * 20, 3.4) + L(hR[0], hR[1], hR[0] + dir[0] * 20, hR[1] + dir[1] * 20, 1.6, '#F4E3C1');
  }
  if (t >= T.launch && t < T.grabBunch) { hL = [dx + 22, dy - 44]; hR = hL; }
  g = arm(dx - 17, sh, hL[0], hL[1], 2.6) + arm(dx + 17, sh, hR[0], hR[1], 2.6) + g;
  g += dot(dx, dy, S, {arms: 'x', look, brow, m, blink: blinkAt(F, 47), squash: dsq, roll});
  return g;
}

export const EP12: React.FC = () => {
  const F = useCurrentFrame();
  let t: number, rw = 0;
  if (F < T.hookEnd) t = F + T.frames;
  else if (F < T.rewind[1]) { const u = (F - T.rewind[0]) / (T.rewind[1] - T.rewind[0]); t = 444 - 404 * Easing.inOut(Easing.cubic)(u); rw = Math.min(1, (F - T.rewind[0] + 1) / 2, (T.rewind[1] - F) / 3); }
  else t = F;
  if (!rw) for (const at of [T.qGrab, T.bGrab, T.gondola, T.land]) t = hold2(t, at);
  const sc = scene(t, F);
  const shk = shake(t, T.bGrab, 8, 3) + shake(t, T.gondola, 8, 3) + shake(t, T.land, 8, 4) + shake(t, T.hop2[1], 6, 2) + (within(t, T.peak) ? Math.sin(t * 2.1) * 1.5 : 0);
  const sp = t >= 406 ? io(t, [408, 414], 0, 1) * (1 - io(t, [424, 434], 0, 1)) : 0;
  const svg = `<g transform="translate(${shk},${shk * 0.5})">${sc.far}${sc.near}</g>` + speedLines(F, sp) + rewindFx(F, rw);
  return (
    <AbsoluteFill style={{backgroundColor: '#FFE3EC'}}>
      <svg viewBox="0 0 270 480" width={1080} height={1920} dangerouslySetInnerHTML={{__html: defs + fairDefs + svg + vignette}} />
      <Audio src={staticFile('ep12.wav')} />
    </AbsoluteFill>
  );
};
