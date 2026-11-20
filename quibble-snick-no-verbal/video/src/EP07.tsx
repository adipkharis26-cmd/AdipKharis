// EP07 "Elevator Button" — Quibble kebelet; Snick menekan SEMUA tombol; Brick melempar Snick keluar... Snick tetap menang (toilet).
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {C, quibble as q, snick, P, L} from './draw.js';
import {brick, shadow, defs, vignette, trail, impactLines, blinkAt, building, liftCar, liftBtn, liftDefs, LIFT} from './draw2';
import T from './ep07-timeline.json';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = (f: number, r: number[], v0: number, v1: number, e = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [r[0], r[1]], [v0, v1], {...cl, easing: e});
const within = (f: number, r: number[]) => f >= r[0] && f < r[1];
const shake = (f: number, at: number, len = 8, amp = 5) => (f >= at && f < at + len ? Math.sin((f - at) * 2.3) * amp * (1 - (f - at) / len) : 0);
const hold2 = (f: number, at: number) => (f === at + 1 || f === at + 2 ? at : f);

type Cam = {k: number, fx: number, fy: number, sx: number, sy: number};
const camG = (inner: string, c: Cam) => `<g transform="translate(${c.sx - c.fx * c.k},${c.sy - c.fy * c.k}) scale(${c.k})">${inner}</g>`;

const QS = 0.74, SS = 0.8, BS = 0.64, QX = 146, SX = 100, BX = 205;
const runF = (f: number) => (f >= T.loopCU[0] ? f - T.frames : f);

// posisi lift (satuan lantai)
function pos(f: number) {
  let p = 0;
  for (const r of T.travel) p += io(f, r, 0, 1, Easing.inOut(Easing.quad));
  return p;
}
const moving = (f: number) => T.travel.some(r => within(f, r));
const doorOpen = (f: number) => { for (let i = 0; i < T.open.length; i++) { if (within(f, [T.open[i][0], T.close[i][1]])) return f < T.open[i][1] ? io(f, T.open[i], 0, 1) : f < T.close[i][0] ? 1 : io(f, T.close[i], 1, 0, Easing.in(Easing.quad)); } return 0; };
function lit(f: number) {
  const n = f < T.press[0] ? 9 : Math.min(9, 3 + Math.floor((f - T.press[0]) / (T.press[1] - T.press[0]) * 7));
  return Array.from({length: 10}, (_, i) => i >= 1 && i <= n && !T.ding.some((d, k) => f >= d && i === k + 1));
}

// Quibble kebelet: kaki menyilang, badan bergoyang
function qPee(x: number, f: number, o: any, amp = 1, sq = 1) {
  const b = Math.abs(Math.sin(f / 2.2)) * 3 * amp, sway = Math.sin(f / 2.2) * 3 * amp;
  const legs = L(x - 9, 400 - 21 * QS - b, x + 9, 400) + L(x + 9, 400 - 21 * QS - b, x - 9, 400) + L(x + 9, 400, x + 16, 400) + L(x - 9, 400, x - 16, 400);
  return shadow(x, 400, 60) + legs + `<g transform="translate(${x + sway},${400 - b}) scale(${1 / Math.sqrt(sq)},${sq})">${q(0, 0, QS, {legs: 'none', ...o})}</g>` +
    (amp > 0.5 ? P.sweat(x + 30, 400 - 120 * QS - ((f * 2) % 16)) : '');
}
const sn = (x: number, y: number, o: any, rot = 0, sq = 1, s = SS) => `<g transform="translate(${x},${y - 45}) rotate(${rot}) translate(0,45) scale(${1 / Math.sqrt(sq)},${sq})">${snick(0, 0, s, o)}</g>`;

function closeUp(f: number) {
  const rf = runF(f);
  let o: any = {brow: 'sad', m: 'wavy', arms: 'down', look: [0.2, -1], blink: rf >= -24 && rf < -21};
  if (rf >= -6) o = {brow: 'up', m: 'o', arms: 'down', look: [-1, 0]};
  const inner = qPee(QX, rf + 420, o, 1);
  const c: Cam = {k: 2.5 + (rf + 30) * 0.004, fx: QX + 2, fy: 340, sx: 135, sy: 235};
  return camG(building(5) + liftCar({lit: lit(380)}, inner), c);
}

function wide(f: number) {
  const p = pos(f), op = doorOpen(f);
  const carShake = moving(f) ? Math.sin(f * 1.7) * 0.8 : 0;
  let qx = QX, qo: any = {brow: 'sad', m: 'wavy', arms: 'down', look: [0.2, -1], blink: blinkAt(f, 10)}, qAmp = 1, qsq = 1;
  let bx = BX, bo: any = {brow: 'flat', m: 'flat', arms: 'cross', look: [-1, 0.2], blink: blinkAt(f, 40)}, bArm = '';
  let sx = SX, sy = 400, so: any = {brow: 'smug', m: 'grin', look: [-1, 0], arms: 'x', blink: blinkAt(f, 17)}, srot = 0, sArm = '', sIn = true;
  let hallSn = '', fx = '', camShake = 0, toilet = {open: false, busy: false};

  // 1) Snick menekan semua tombol
  if (f < T.press[1]) {
    const n = Math.min(9, 3 + Math.floor((f - T.press[0]) / (T.press[1] - T.press[0]) * 7));
    const [tx, ty] = liftBtn(n), jab = Math.abs(Math.sin(f * 0.9)) * 4;
    sArm = L(sx - 20 * SS, 400 - 40 * SS, tx + jab, ty, 4);
    sy = 400 - (ty < 262 ? 10 : 0);
  }
  if (within(f, [T.press[1], T.horror[1] + 6])) qo = {brow: 'up', m: 'o', arms: 'down', look: [-1, 0], squash: 1.06};
  if (f >= T.press[1] && f < T.grab[0]) so = {brow: 'smug', m: 'grin', look: [1, 0], arms: 'down', blink: (f % 14) < 4};
  // 2) Quibble menekan tombol tutup berkali-kali
  if (within(f, T.jab)) {
    qx = io(f, [T.jab[0], T.jab[0] + 4], QX, 132); qo = {brow: 'angry', m: 'teeth', arms: 'x', look: [-1, 0.3]};
    const [cx, cy] = liftBtn(10); fx += L(qx - 26 * QS, 400 - 70 * QS, cx + Math.abs(Math.sin(f * 1.3)) * 8, cy, 4.5);
    if ((f - T.jab[0]) % 5 < 2) fx += impactLines(cx, cy, 6);
  }
  if (within(f, [T.jab[1], T.jab[1] + 6])) qx = io(f, [T.jab[1], T.jab[1] + 6], 132, QX);
  // 3) Brick mengangkat Snick (pegang jambul) lalu melemparnya keluar
  if (f >= T.grab[0] && f < T.toss[1]) {
    bx = io(f, [T.grab[0], T.grab[0] + 8], BX, 165); bo = {brow: 'angry', m: 'flat', arms: 'rOnly', look: [-1, -0.3]};
    const lift = io(f, [T.grab[0] + 6, T.grab[1]], 0, 1);
    let hx = 134 - 6 * lift, hy = 310 - 40 * lift;
    if (f >= T.toss[0]) { const t = (f - T.toss[0]) / (T.toss[1] - T.toss[0]); hx = 128 - 20 * Math.sin(t * Math.PI); hy = 270 + 10 * t; }
    if (f < T.toss[0] + 4) { sx = io(f, [T.grab[0] + 6, T.grab[1]], SX, hx); sy = hy + 112 * SS * lift + (400 - hy - 112 * SS) * (1 - lift); }
    bArm = L(bx - 35, 400 - 66, hx, hy, 6.5);
    so = {brow: 'sad', m: 'o', look: [1, -0.5], arms: 'down'}; srot = lift * Math.sin(f / 3) * 10;
    if (f >= T.toss[0] + 4) {
      // Snick melayang keluar pintu ke lorong
      const t = io(f, [T.toss[0] + 4, T.toss[1]], 0, 1, Easing.linear);
      sx = 128 + (36 - 128) * t; sy = 360 + (400 - 360) * t - Math.sin(t * Math.PI) * 50; srot = -t * 360; sIn = t < 0.4;
      so = {brow: 'up', m: 'o', look: [-1, 0], cross: true};
      if (t > 0.98) fx += impactLines(36, 392, 10);
    }
  }
  if (within(f, T.brickBack)) { bx = io(f, T.brickBack, 165, BX); bo = {brow: 'flat', m: 'smile', arms: 'down', look: [-1, 0]}; }
  if (f >= T.toss[1]) {
    sIn = false;
    // Snick tertinggal di lorong lantai 3, melambai santai saat lift pergi
    const y = 400 + (p - 3) * LIFT.H;
    if (y < 700) hallSn = shadow(36, y, 46) + sn(36, y, {brow: 'smug', m: 'grin', arms: f >= T.close[2][0] ? 'wave' : 'down', look: [1, -0.3], blink: blinkAt(f, 17)}, 0, 1);
  }
  if (within(f, [T.slam1, T.slam1 + 6])) { camShake = shake(f, T.slam1, 8, 4); fx += impactLines(LIFT.x0, 330, 14); }
  if (within(f, T.cheer)) { qo = {brow: 'up', m: 'grin', arms: 'up', look: [0, -0.5], blink: (f % 12) < 4}; qAmp = 0.6; bo = {...bo, arms: 'cross', m: 'smile'}; }
  // 4) Lantai toilet: Snick sudah menunggu (lari lewat tangga) -> masuk toilet duluan
  if (f >= T.ding[3] && f < T.close[3][1] + 20) {
    const y = 400 + (p - 4) * LIFT.H;
    let hx = 50, ho: any = {brow: 'sad', m: 'o', look: [1, 0], arms: 'down'}, hy = y - Math.abs(Math.sin(f / 2)) * 3;
    if (f >= T.snickPant[0] + 10) ho = {brow: 'smug', m: 'grin', look: [1, 0], arms: 'wave'};
    if (f >= T.snickGo[0]) { hx = io(f, T.snickGo, 50, 34, Easing.inOut(Easing.quad)); ho = {brow: 'smug', m: 'grin', look: [-1, 0], arms: 'down'}; hy = y; }
    toilet = {open: within(f, T.toiletOpen), busy: f >= T.slam2};
    const sw = f < T.snickPant[0] + 10 ? P.sweat(hx + 26, y - 104) + P.sweat(hx - 26, y - 96) : '';
    if (f < T.toiletOpen[1] - 2) hallSn = shadow(hx, y, 50) + sn(hx, hy, ho) + sw;
    if (f >= T.snickGo[0] && f < T.snickGo[1]) hallSn += trail(hx + 28, hy - 40, -1);
  }
  if (within(f, T.sparkle)) { qo = {brow: 'up', m: 'grin', arms: 'down', look: [-1, 0]}; fx += P.sparkle(qx - 30, 270 + Math.sin(f) * 4) + P.sparkle(qx + 30, 262 - Math.sin(f) * 4); }
  if (within(f, [T.qRun[0], T.qBack[1]])) {
    qx = f < T.qBack[0] ? io(f, T.qRun, QX, 98, Easing.out(Easing.quad)) : io(f, T.qBack, 98, QX);
    qo = {brow: 'up', m: 'grin', arms: 'reachR', flip: true, look: [-1, 0]};
    if (f < T.qRun[1]) fx += trail(qx + 30, 360, -1);
    if (f >= T.slam2) { qo = {brow: 'sad', m: 'wavy', arms: 'down', look: [-1, 0.4]}; qsq = io(f, [T.slam2, T.slam2 + 10], 1, 0.86, Easing.out(Easing.back(2))); }
    if (f >= T.qBack[0]) { qo = {brow: 'sad', m: 'frown', arms: 'down', look: [0, 1]}; qsq = 0.9; }
  }
  if (within(f, [T.slam2, T.slam2 + 6])) { camShake = shake(f, T.slam2, 8, 4); fx += impactLines(34, 400 + (p - 4) * LIFT.H - 70, 16); }
  if (within(f, T.shrug)) bo = {brow: 'up', m: 'flat', arms: 'up', look: [-1, 0.3]};
  if (f >= T.qBack[1]) { qo = {brow: 'sad', m: 'wavy', arms: 'down', look: [0.2, -1], blink: blinkAt(f, 10)}; }
  if (within(f, T.whimper)) { qo = {brow: 'sad', m: 'frown', arms: 'down', look: [-1, 0.5]}; fx += P.drop(qx - 12, 312 + ((f - T.whimper[0]) % 14) * 2, 0.5, '#9FD3F5'); }
  if (f >= T.desperate[0]) qo = {brow: 'sad', m: 'wavy', arms: 'down', look: [0.2, -1], blink: f >= 380 && f < 383};
  // lampu "ding" di atas pintu
  const dingOn = T.ding.some(d => within(f, [d, d + 8]));

  const inner = (dingOn ? `<circle cx="${LIFT.x0 + 22}" cy="${LIFT.top + 18}" r="7" fill="#FFD23F" stroke="${C.ink}" stroke-width="2"/><circle cx="${LIFT.x0 + 22}" cy="${LIFT.top + 18}" r="13" fill="#FFD23F" opacity=".35"/>` : `<circle cx="${LIFT.x0 + 22}" cy="${LIFT.top + 18}" r="7" fill="#E8E2D0" stroke="${C.ink}" stroke-width="2"/>`) +
    shadow(bx, 400, 90) + brick(bx, 400, BS, bo) + bArm +
    qPee(qx, f, qo, qAmp, qsq) + fx +
    (sIn ? shadow(sx, 400, 54, sy < 390 ? 0.5 : 1) + sn(sx, sy, so, srot) + sArm : '');
  const outer = !sIn && f < T.toss[1] ? sn(sx, sy, so, srot) : '';
  const c: Cam = {k: 1, fx: 150 + camShake, fy: 324 + carShake + camShake * 0.5, sx: 135, sy: 236};
  return camG(building(p, toilet) + hallSn + liftCar({open: op, lit: lit(f)}, inner) + outer, c);
}

export const EP07: React.FC = () => {
  const F = useCurrentFrame();
  let f = F;
  for (const at of [T.slam1, T.slam2]) f = hold2(f, at);
  const svg = f < T.cutWide || f >= T.loopCU[0] ? closeUp(f) : wide(f);
  return (
    <AbsoluteFill style={{backgroundColor: '#3B3B46'}}>
      <svg viewBox="0 0 270 480" width={1080} height={1920} dangerouslySetInnerHTML={{__html: defs + liftDefs + svg + vignette}} />
      <Audio src={staticFile('ep07.wav')} />
    </AbsoluteFill>
  );
};
