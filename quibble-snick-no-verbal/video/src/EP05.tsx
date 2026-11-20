// EP05 "Umbrella War" — Snick (licik) vs Brick (kalem, punya payung) di bawah hujan deras; Dot = twist akhir.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {C, snick, P, L} from './draw.js';
import {dot, brick, shadow, defs, vignette, trail, impactLines, blinkAt, umbrella, umbPt, rain, rainDefs, street, splash} from './draw2';
import T from './ep05-timeline.json';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = (f: number, r: number[], v0: number, v1: number, e = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [r[0], r[1]], [v0, v1], {...cl, easing: e});
const within = (f: number, r: number[]) => f >= r[0] && f < r[1];
const shake = (f: number, at: number, len = 8, amp = 5) => (f >= at && f < at + len ? Math.sin((f - at) * 2.3) * amp * (1 - (f - at) / len) : 0);
const hold2 = (f: number, at: number) => (f === at + 1 || f === at + 2 ? at : f); // jeda 2 frame saat benturan

// kamera: titik dunia (fx,fy) ke titik layar (sx,sy) dengan zoom k
type Cam = {k: number, fx: number, fy: number, sx: number, sy: number};
const camG = (inner: string, c: Cam) => `<g transform="translate(${c.sx - c.fx * c.k},${c.sy - c.fy * c.k}) scale(${c.k})">${inner}</g>`;
const toS = (c: Cam, wx: number, wy: number) => [c.sx + (wx - c.fx) * c.k, c.sy + (wy - c.fy) * c.k];
// area kering di bawah kanopi (dunia -> layar)
const dryOf = (c: Cam, cx: number, topY: number, r: number) => { const [a, b] = toS(c, cx - r, topY); const [d] = toS(c, cx + r, topY); return [a, b, d]; };

const SS = 1.05, BS = 0.75;
// Snick dengan rotasi & squash (poros di kaki)
const sn = (x: number, y: number, o: any, rot = 0, sq = 1) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${1 / Math.sqrt(sq)},${sq})">${snick(0, 0, SS, o)}</g>`;
const sArm = (x: number, y: number, side: number, tx: number, ty: number) => L(x + side * 22 * SS, y - 38 * SS, tx, ty, 4.5);
// tetesan air yang jatuh dari badan basah
const drips = (f: number, x: number, top: number, w: number) => [0, 1, 2].map(i => P.drop(x + (i - 1) * w * 0.7, top + ((f * 3 + i * 17) % 44), 0.45, '#9FD3F5')).join('');
const BU = {c: '#FFD23F', st: 90, R: 72};          // payung kuning milik Brick
const TU = {c: '#FF8FC7', st: 120, R: 40, stripes: true}; // payung koktail mini milik Snick (skala 0.5)
const DU = {c: '#6BCB77', st: 110, R: 80};          // payung besar Dot
const canopyTop = (u: any, s = 1) => -(u.st + u.R * 0.62 * 1.1) * s;

const runF = (f: number) => (f >= T.loopCU[0] ? f - T.frames : f);

// CLOSE-UP pembuka/penutup (kontinu melewati titik loop): Snick basah kuyup, melirik ke kanan, lalu melesat
function closeUp(f: number) {
  const rf = runF(f);
  const x = 100 + Math.max(0, rf - 4) * 2.4;
  let o: any = {brow: 'sad', m: 'frown', look: [0.7, 0.4], arms: 'down', blink: rf >= -22 && rf < -19};
  if (rf >= -12) o = {brow: 'up', m: 'o', look: [1, -0.3], arms: 'down'};
  if (rf >= 4) o = {brow: 'smug', m: 'grin', look: [1, -0.5], arms: 'down'};
  const lean = rf >= 4 ? Math.min(10, (rf - 4) * 1.2) : 0;
  const c: Cam = {k: 2.7 + (rf + 30) * 0.004, fx: 100 + Math.max(0, rf - 4) * 1.6, fy: 352, sx: 135, sy: 230};
  let w = street(f) + shadow(x, 400, 60) + sn(x, 400, o, lean) + drips(f, x, 300, 22);
  if (rf >= 4) w += trail(x - 30, 340, 1, 3, '#E8F4FF');
  return camG(w, c) + rain(f, []);
}

function wide(f: number) {
  let bx = 175, bsq = 1, by = 400;
  let bo: any = {brow: 'flat', m: 'flat', arms: 'rOnly', look: [-1, 0.4], blink: blinkAt(f, 40)};
  const U: any = {x: bx - 52.5, y: 268, tilt: 0, inv: false, water: 0, hole: false, dart: '', held: 'brick', rotC: 0, hat: false};
  let sx = 100, sy = 400, srot = 0, ssq = 1;
  let so: any = {brow: 'smug', m: 'grin', look: [1, -0.4], blink: blinkAt(f, 17)};
  let sArms = '', fx = '', fxBack = '', camShake = 0, kz = 1;
  let tiny: any = null, dotSvg = '', dotU: any = null, hatFloor: any = null;

  // 1) Snick melesat masuk ke bawah payung
  if (f < T.dashIn[1]) {
    sx = io(f, T.dashIn, -40, 100, Easing.out(Easing.cubic)); sy = 400 - Math.abs(Math.sin((f - T.dashIn[0]) / 2.5)) * 10;
    fx += trail(sx - 24, sy - 60, 1, 3, '#E8F4FF');
    if (f >= 34) bo = {...bo, brow: 'up', look: [-1, 0.6]};
  }
  // 2) kibas badan seperti anjing -> cipratan ke Brick
  if (within(f, T.shakeOff)) {
    const p = (f - T.shakeOff[0]) / 14; srot = Math.sin((f - T.shakeOff[0]) * 1.8) * 16 * (1 - p);
    so = {brow: 'smug', m: 'grin', blink: true};
    fx += Array.from({length: 10}, (_, i) => { const a = i / 10 * Math.PI * 2 + 0.3, d = 30 + p * 60; return P.drop(sx + Math.cos(a) * d, 350 + Math.sin(a) * d * 0.7, 0.55, '#9FD3F5'); }).join('');
  }
  if (f >= 46 && f < T.tiltAway[0]) { bo = {...bo, brow: 'angry', m: 'frown', look: [-1, 0.5]}; bsq = f < 50 ? 0.96 : 1; }
  // 3) Brick memiringkan payung menjauh -> Snick kehujanan
  if (within(f, [T.tiltAway[0], T.tug[0]])) {
    U.tilt = io(f, T.tiltAway, 0, 40); bo = {...bo, brow: 'flat', m: 'smile', look: [-1, 0.5]};
    if (f >= 66) so = {brow: 'sad', m: 'wavy', look: [0.5, -1]};
  }
  // 4) tarik-menarik payung: bergantian basah
  if (within(f, T.tug)) {
    U.tilt = 5 + 35 * Math.cos(Math.PI * (f - T.tug[0]) / 11.5);
    sx = 88 + U.tilt * 0.12;
    so = {brow: 'angry', m: 'teeth', look: [1, -0.6], arms: 'x'};
    bo = {...bo, brow: 'angry', m: 'teeth', look: [-1, 0]};
    const [hx, hy] = umbPt(U.x, U.y, 1, U.tilt, 0, -24);
    sArms = sArm(sx, sy, 1, hx, hy) + sArm(sx, sy, -1, hx - 4, hy + 6);
    if ((f - T.tug[0]) % 23 < 2) fx += impactLines(hx, hy, 10);
  }
  // 5) Brick mengangkat payung -> Snick ikut terangkat & bergelantungan -> jatuh ke genangan
  if (f >= T.lift[0] && f < T.lower[1]) {
    U.y = f < T.lower[0] ? io(f, T.lift, 268, 198) : io(f, T.lower, 198, 268);
    U.tilt = io(f, T.lift, 40, 25) + (within(f, [136, T.letGo]) ? Math.sin((f - 136) * 1.5) * 8 : 0);
    bo = {...bo, brow: 'angry', m: 'teeth', look: [-1, -0.6], blink: false};
    if (f >= T.letGo) bo = {...bo, brow: 'flat', m: 'smile', look: [-1, 0.6]};
  }
  if (f >= T.lift[0] && f < T.letGo) {
    sx = io(f, T.lift, 88, U.x); sy = io(f, T.lift, 400, 270);
    if (f >= T.lift[1]) sx = U.x + Math.sin((f - T.lift[1]) / 2) * 5;
    so = {brow: 'sad', m: f < T.lift[1] ? 'teeth' : 'o', look: [0, f < T.lift[1] ? -1 : 1], arms: 'x'};
    const [hx, hy] = umbPt(U.x, U.y, 1, U.tilt, 0, -10);
    sArms = sArm(sx, sy, 1, hx + 2, hy) + sArm(sx, sy, -1, hx - 2, hy);
    if (f >= T.lift[1]) fx += [0, 1].map(i => P.sweat(sx + (i ? 30 : -30), sy - 110)).join('');
  }
  if (f >= T.letGo && f < T.plop) {
    const p = (f - T.letGo) / (T.plop - T.letGo);
    sx = 122.5 + (64 - 122.5) * p; sy = 270 + (400 - 270) * p * p; srot = -30 * p;
    so = {brow: 'sad', m: 'o', look: [0, -1], arms: 'up'};
  }
  if (f >= T.plop && f < T.standUp[1]) {
    sx = 64; ssq = f < T.standUp[0] ? 0.72 + 0.05 * Math.sin((f - T.plop) * 1.4) * (f < T.plop + 6 ? 1 : 0) : io(f, T.standUp, 0.72, 1, Easing.out(Easing.back(2)));
    so = {brow: 'sad', m: 'wavy', look: [1, -1], blink: blinkAt(f, 5)};
    camShake = shake(f, T.plop, 8, 4);
    if (f < T.plop + 12) fx += splash(64, 404, (f - T.plop) / 12, 9, 46);
  }
  // 6) payung koktail mini; tetes raksasa menghancurkannya
  if (f >= T.tinyOut && f < T.walk[1]) {
    sx = f < T.walk[0] ? 64 : io(f, T.walk, 64, 84);
    const open = f < T.tinyOpen ? 0.2 : f < T.bigDrop ? io(f, [T.tinyOpen, T.tinyOpen + 4], 0.2, 1, Easing.out(Easing.back(3))) : f < T.walk[0] ? 1 : 0.22;
    tiny = {x: sx + 14, y: 330, tilt: f >= T.walk[0] ? 35 : 0, open, inv: f >= T.bigDrop && f < T.walk[0]};
    so = {brow: 'smug', m: 'grin', look: f < T.tinyOpen ? [0, 0.3] : [1, -0.7], arms: 'x', blink: blinkAt(f, 17)};
    sArms = sArm(sx, 400, 1, tiny.x, tiny.y) + sArm(sx, 400, -1, sx - 34, 372);
    if (f >= T.tinyOpen && f < T.tinyOpen + 5) fx += P.sparkle(sx + 30, 250) + P.sparkle(sx - 10, 240);
    if (f >= 186 && f < T.bigDrop) { const p = (f - 186) / (T.bigDrop - 186); fx += P.drop(sx + 14, -40 + (262 - -40) * p * p, 3.2, '#9FD3F5'); so = {...so, look: [0.3, -1], brow: 'up', m: 'o'}; }
    if (f >= T.bigDrop && f < T.walk[0]) {
      ssq = io(f, [T.bigDrop, T.bigDrop + 8], 0.8, 1, Easing.out(Easing.back(2)));
      so = {brow: 'sad', m: 'wavy', cross: true, arms: 'x'}; camShake = shake(f, T.bigDrop, 8, 5);
      if (f < T.bigDrop + 10) fx += splash(sx + 14, 270, (f - T.bigDrop) / 10, 9, 50) + (f < T.bigDrop + 4 ? impactLines(sx + 14, 270, 26) : '');
    }
    if (f >= T.walk[0]) so = {brow: 'smug', m: 'grin', look: [1, -1], arms: 'x'};
  }
  // 7) payung mini dilempar seperti anak panah -> menancap -> air bocor tepat ke kepala Brick
  const HL = [72 * 0.42, -BU.st - BU.R * 0.62 * 0.62];  // posisi lubang (lokal payung)
  if (f >= T.throw[0] && f < T.flip) {
    sx = 84;
    if (f < T.dart) {
      const p = (f - T.throw[0]) / (T.dart - T.throw[0]); const [hx, hy] = umbPt(U.x, U.y, 1, 25, HL[0], HL[1]);
      const x0 = sx + 30, y0 = 300;
      fx += umbrella(x0 + (hx - x0) * p, y0 + (hy - y0) * p - Math.sin(p * Math.PI) * 30, 0.5, {...TU, open: 0.22, tilt: 50});
      so = {brow: 'smug', m: 'grin', look: [1, -1], arms: 'reachL', flip: true};
    } else {
      U.hole = true; U.dart = umbrella(0, 0, 0.5, {...TU, open: 0.22});
      so = {brow: 'smug', m: 'grin', look: [1, -0.5], blink: within(f, T.leak) && (f % 12) < 4};
      if (within(f, [T.dart, T.dart + 5])) { fx += impactLines(...umbPt(U.x, U.y, 1, 25, HL[0], HL[1]) as [number, number], 12); camShake = shake(f, T.dart, 6, 3); }
    }
    U.tilt = 25;
  }
  if (f >= T.leak[0] && f < T.flip) {
    const [hx, hy] = umbPt(U.x, U.y, 1, U.tilt, HL[0], HL[1]);
    const head = 400 - 170 * BS, w = 4 + Math.sin(f) * 0.8;
    fxBack += `<path d="M${hx - w},${hy} Q${hx - 6},${(hy + head) / 2} ${hx - 3 - w},${head} L${hx - 3 + w},${head} Q${hx - 2},${(hy + head) / 2} ${hx + w},${hy}Z" fill="#7FC8F8" stroke="${C.ink}" stroke-width="2"/>`;
    fx += splash(hx - 3, head + 4, ((f - T.leak[0]) % 8) / 8, 5, 18) + drips(f, bx, head + 20, 40);
    bo = {...bo, brow: f < 234 ? 'flat' : 'angry', m: f < 234 ? 'flat' : 'frown', look: [0.3, -1], arms: 'rOnly'};
    sy = 400 - Math.abs(Math.sin(f / 3)) * 6;
  }
  // 8) angin -> payung terbalik (mangkuk) -> terisi air hujan
  if (within(f, T.gust)) {
    U.tilt = 25 + Math.sin((f - T.gust[0]) * 1.6) * 12;
    fx += P.wind(-60 + (f - T.gust[0]) * 14, 170) + P.wind(-90 + (f - T.gust[0]) * 14, 230);
    bo = {...bo, brow: 'up', m: 'o', look: [-0.6, -1]};
  }
  if (f >= T.flip && f < T.grab[1]) {
    U.inv = true; U.hole = false; U.dart = '';
    U.tilt = io(f, [T.flip, T.flip + 6], 25, 0, Easing.out(Easing.back(2)));
    U.water = io(f, T.fill, 0, 1, Easing.linear);
    bo = {...bo, brow: 'flat', m: 'flat', look: [0, -1], blink: blinkAt(f, 40)};
    if (f < T.flip + 6) { fx += impactLines(U.x, U.y - 120, 30); camShake = shake(f, T.flip, 8, 5); kz = 1.05; }
    if (f < T.flip + 14) { const p = (f - T.flip) / 14; const [hx, hy] = umbPt(U.x, U.y, 1, 25, HL[0], HL[1]); fx += umbrella(hx + p * 30, hy + (400 - hy) * p * p, 0.5, {...TU, open: 0.22, tilt: 160 + p * 200}); }
    fx += drips(f, bx, 300, 40);
    if (f >= T.fill[0]) { sx = 84; sy = 400 - Math.abs(Math.sin(f / 3)) * 5; so = {brow: 'smug', m: 'grin', look: [1, -0.5], arms: 'reachL', flip: true, blink: (f % 14) < 4}; }
  }
  // 9) Snick merebut payung (menang?) -> membaliknya di atas kepala -> seluruh air tumpah ke dirinya
  if (f >= T.grab[0]) {
    if (f < T.carry[0]) {
      sx = io(f, T.grab, 84, 98, Easing.out(Easing.cubic));
      so = {brow: 'smug', m: 'grin', look: [1, -0.6], arms: 'x'};
      const [gx, gy] = f < 306 ? [U.x, U.y] : [io(f, [306, T.grab[1]], U.x, sx + 6), io(f, [306, T.grab[1]], U.y, 330)];
      if (f >= 306) { U.x = gx; U.y = gy; U.held = 'snick'; }
      sArms = sArm(sx, 400, 1, gx, gy) + sArm(sx, 400, -1, gx - 4, gy + 6);
      U.water = 1; U.inv = true; U.tilt = 0;
    } else {
      U.inv = true; U.held = 'snick'; U.tilt = 0;
      sx = io(f, T.carry, 98, 92); sy = 400 - (f < T.turn[0] ? Math.abs(Math.sin((f - T.carry[0]) / 2.5)) * 10 : 0);
      U.x = sx + 6; U.y = sy - 70; U.water = f < T.dump ? 1 : 0;
      so = {brow: 'smug', m: 'grin', look: [0.4, -1], arms: 'x', blink: blinkAt(f, 17)};
      if (f < T.turn[0]) fx += P.sparkle(sx - 40, 280 + Math.sin(f / 2) * 6) + P.sparkle(sx + 44, 300 - Math.sin(f / 2) * 6);
      if (f < T.dump) {
        U.rotC = io(f, T.turn, 0, 180, Easing.in(Easing.quad));
        if (U.rotC > 70) U.water = 0;
        if (U.rotC > 70) { const p = io(f, [332, T.dump], 0, 1, Easing.in(Easing.quad)); fx += `<path transform="translate(${sx},${180 + p * 120}) scale(${1.4 - p * 0.3},${1 + p * 0.5})" d="M-40,0 Q-46,-30 -10,-34 Q0,-50 14,-34 Q46,-30 40,0 Q20,22 0,14 Q-20,22 -40,0Z" fill="#7FC8F8" stroke="${C.ink}" stroke-width="3"/>`; }
        so = {...so, look: [0, -1], brow: 'up', m: f < 332 ? 'grin' : 'o'};
        sArms = sArm(sx, sy, 1, U.x, U.y) + sArm(sx, sy, -1, U.x - 4, U.y + 6);
      } else {
        // payung (sudah tertelungkup) menutupi kepala seperti topi rusak
        U.rotC = 180; U.hat = true;
        ssq = io(f, [T.dump, T.dump + 10], 0.7, 1, Easing.out(Easing.back(2)));
        so = {brow: 'sad', m: 'wavy', cross: f < T.splash[1], look: [0, 0], arms: 'down', blink: blinkAt(f, 17)};
        camShake = shake(f, T.dump, 10, 6); kz = f < T.dump + 6 ? 1.05 : 1;
        if (f < T.dump + 14) fx += splash(sx, 300, (f - T.dump) / 14, 11, 70) + (f < T.dump + 4 ? impactLines(sx, 300, 40) : '');
        fx += drips(f, sx, 300, 30);
      }
    }
    if (f >= T.grab[0] + 6) bo = {brow: 'flat', m: 'flat', arms: 'cross', look: [-1, 0.2], blink: blinkAt(f, 40)};
    if (f >= T.dump) { bo = {brow: 'up', m: 'grin', arms: 'cross', look: [-1, 0.3], blink: (f % 10) < 3}; by = 400 - Math.abs(Math.sin((f - T.dump) / 2.5)) * 4; }
  }
  // 10) Dot datang dengan payung BESAR; Brick menunduk ikut berteduh & pergi bersama. Snick sendirian basah.
  if (f >= T.dotIn[0]) {
    let dx = io(f, T.dotIn, 330, 212, Easing.out(Easing.cubic)), dy = 400 - Math.abs(Math.sin((f - T.dotIn[0]) / 3)) * (f < T.dotIn[1] ? 14 : 0);
    const off = io(f, T.walkOff, 0, 170, Easing.in(Easing.quad));
    dx += off; if (f >= T.walkOff[0]) dy = 400 - Math.abs(Math.sin((f - T.walkOff[0]) / 3)) * 6;
    dotSvg = shadow(dx, 400, 50) + dot(dx, dy, 0.8, {arms: 'up', m: 'grin', look: f < T.dotIn[1] ? [1, 0] : [-1, 0], blink: blinkAt(f, 33)});
    dotU = {x: dx + 34, y: dy - 53, tilt: io(f, [T.dotIn[1] - 4, T.dotIn[1] + 4], 0, -18)};
    if (f >= T.dotIn[1] - 6) { bo = {brow: 'up', m: f < T.duck[0] ? 'o' : 'smile', arms: 'cross', look: [1, -0.5], blink: blinkAt(f, 40)}; by = 400; }
    bsq = within(f, [T.duck[0], 420]) ? io(f, T.duck, 1, 0.84, Easing.out(Easing.back(2))) : 1;
    bx = 175 + io(f, T.duck, 0, 12) + off;
    if (f >= T.walkOff[0]) by = 400 - Math.abs(Math.sin((f - T.walkOff[0]) / 4)) * 4;
    if (f < T.dotIn[1]) fx += trail(dx + 40, dy - 40, -1);
  }
  if (f >= T.hatFall[0]) {
    U.hat = false; U.rotC = 0; const p = io(f, T.hatFall, 0, 1, Easing.in(Easing.quad));
    hatFloor = {x: sx - p * 40, y: 400 - 118 * SS - BU.st + p * 75, rot: 180 + p * 14};
    so = {brow: 'sad', m: 'frown', look: [1, 0.3], arms: 'down', blink: blinkAt(f, 17)};
    if (f >= T.hatFall[1] && f < T.hatFall[1] + 5) fx += impactLines(hatFloor.x - 40, 396, 12);
  }

  // ---- susun gambar ----
  const cam: Cam = {k: 1.1 * kz, fx: 140 + camShake, fy: 328 + camShake * 0.5, sx: 135, sy: 236};
  const dry: number[][] = [];
  let w = street(f);
  w += shadow(bx, 400, 100) + `<g transform="translate(${bx},${by}) scale(1,1)">${brick(0, 0, BS, {...bo, squash: bsq})}</g>`;
  if (U.held === 'brick' && !U.hat) w += L(bx - 42, by - 80 * bsq, U.x, U.y, 7.5);
  w += fxBack;
  w += shadow(sx, 400, 64, sy < 380 ? 0.5 : 1) + sn(sx, sy, so, srot, ssq) + sArms;
  if (!(sy < 400 && f >= T.letGo && f < T.plop) && f >= T.cutWide) w += drips(f, sx, sy - 100, 22);
  // payung Brick / Snick
  if (U.hat) {
    const hy = sy - 118 * SS * ssq - BU.st;  // gagang di atas; dasar mangkuk (kini puncak kubah) menempel di kepala
    w += umbrella(sx, hy, 1, {...BU, inv: true, tilt: 180});
    dry.push(dryOf(cam, sx, hy + BU.st - 4, 76));
  } else if (U.rotC) {
    const [cx, cy] = umbPt(U.x, U.y, 1, 0, 0, -BU.st - 20);
    w += `<g transform="rotate(${U.rotC},${cx},${cy})">${umbrella(U.x, U.y, 1, {...BU, inv: true, water: U.water})}</g>`;
  } else if (!hatFloor) {
    w += umbrella(U.x, U.y, 1, {...BU, tilt: U.tilt, inv: U.inv, water: U.water, hole: U.hole, dart: U.dart});
    if (!U.inv) { const [cx] = umbPt(U.x, U.y, 1, U.tilt, 0, -BU.st - 20); const [, ty] = umbPt(U.x, U.y, 1, U.tilt, 0, canopyTop(BU)); dry.push(dryOf(cam, cx, ty + 12, BU.R - 4)); }
  }
  if (hatFloor) w += umbrella(hatFloor.x, hatFloor.y, 1, {...BU, inv: true, tilt: hatFloor.rot});
  if (tiny) {
    w += umbrella(tiny.x, tiny.y, 0.5, {...TU, tilt: tiny.tilt, open: tiny.open, inv: tiny.inv});
    if (tiny.open > 0.9 && !tiny.inv) dry.push(dryOf(cam, tiny.x, tiny.y + canopyTop(TU, 0.5) + 6, TU.R * 0.5 - 2));
  }
  if (dotU) {
    w += dotSvg + umbrella(dotU.x, dotU.y, 1, {...DU, tilt: dotU.tilt});
    const [cx] = umbPt(dotU.x, dotU.y, 1, dotU.tilt, 0, -DU.st - 20); const [, ty] = umbPt(dotU.x, dotU.y, 1, dotU.tilt, 0, canopyTop(DU));
    dry.push(dryOf(cam, cx, ty + 14, DU.R - 4));
  }
  w += fx;
  return camG(w, cam) + rain(f, dry);
}

export const EP05: React.FC = () => {
  const F = useCurrentFrame();
  const f = hold2(hold2(hold2(hold2(F, T.bigDrop), T.dart), T.flip), T.dump);
  const svg = f < T.cutWide || f >= T.loopCU[0] ? closeUp(f) : wide(f);
  return (
    <AbsoluteFill style={{backgroundColor: '#C9D6E0'}}>
      <svg viewBox="0 0 270 480" width={1080} height={1920} dangerouslySetInnerHTML={{__html: defs + rainDefs + svg + vignette}} />
      <Audio src={staticFile('ep05.wav')} />
    </AbsoluteFill>
  );
};
