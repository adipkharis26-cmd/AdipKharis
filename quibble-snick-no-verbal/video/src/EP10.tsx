// EP10 "Popcorn" — Brick memasak satu biji jagung; Snick memutar timer ke maksimum; popcorn membanjiri dapur berantai. Brick menang.
// STRUKTUR C reaksi berantai · kamera tracking samping + potongan cepat · hook layar gelap + "pop" · loop match-cut (popcorn di gelap).
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {C, snick, L} from './draw.js';
import {brick, shadow, defs, vignette, trail, impactLines, blinkAt, kitDefs, kitchen, MW, microwave, pop, kernel, popMass, panK, toaster, fridge} from './draw2';
import T from './ep10-timeline.json';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = (f: number, r: number[], v0: number, v1: number, e = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [r[0], r[1]], [v0, v1], {...cl, easing: e});
const lin = (f: number, r: number[], v0: number, v1: number) => interpolate(f, [r[0], r[1]], [v0, v1], cl);
const within = (f: number, r: number[]) => f >= r[0] && f < r[1];
const shake = (f: number, at: number, len = 8, amp = 5) => (f >= at && f < at + len ? Math.sin((f - at) * 2.3) * amp * (1 - (f - at) / len) : 0);
const hold2 = (f: number, at: number) => (f === at + 1 || f === at + 2 ? at : f);
type Cam = {k: number, fx: number, fy: number, sx: number, sy: number};
const camG = (inner: string, c: Cam) => `<g transform="translate(${c.sx - c.fx * c.k},${c.sy - c.fy * c.k}) scale(${c.k})">${inner}</g>`;
const DARK = '#2A1620';
const S = 0.9, SN = 0.62, BX = 690;
const bowl = (x: number, y: number, n = 0) => `<g transform="translate(${x},${y})"><path d="M-11,-4 Q0,10 11,-4Z" fill="#7BD389" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round"/>${n ? pop(0, -7, 0.75, 20) : ''}</g>`;
const salt = (x: number, y: number, r = 0) => `<g transform="translate(${x},${y}) rotate(${r})"><rect x="-5" y="-14" width="10" height="16" rx="3" fill="#fff" stroke="${C.ink}" stroke-width="2.5"/><rect x="-5" y="-18" width="10" height="5" rx="2" fill="#9AA5B1" stroke="${C.ink}" stroke-width="2"/></g>`;

// ---- posisi dunia ----
const lvl = (f: number) => io(f, T.flood, 400, 205, Easing.inOut(Easing.quad));
const snX = (f: number) => (f < T.burst ? 176 : lin(f, T.ride, 176, 538));
function brickPos(f: number) {
  if (f < T.cutFeast - 18) return {x: io(f, T.walk, 230, BX, Easing.in(Easing.quad)), y: 400 - (within(f, T.walk) ? Math.abs(Math.sin(f * 0.45)) * 4 : 0)};
  return {x: BX, y: Math.min(400, lvl(f) + 62) + Math.sin(f * 0.12) * 2};
}

function world(f: number) {
  let g = kitchen();
  const lv = lvl(f), bp = brickPos(f), bx = bp.x, by = bp.y;
  // lemari atas tempat Snick bersembunyi: pintu terbuka
  if (f >= T.cabOpen) { const o = io(f, [T.cabOpen, T.cabOpen + 4], 0, 1); g += `<rect x="156" y="118" width="108" height="78" rx="8" fill="#5A3A28" stroke="${C.ink}" stroke-width="4"/><path d="M156,118 L${156 - 34 * o},${126} L${156 - 34 * o},${188} L156,196Z" fill="#F2A65A" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>`; }
  // microwave
  const mwOn = f < T.ding;
  const fill = f < T.cutWin ? 0 : io(f, T.pops, 0, 1, Easing.in(Easing.quad));
  const shk = within(f, [T.cutWin, T.burst]) ? Math.sin(f * 2.1) * lin(f, T.pops, 0.3, 2.6) : shake(f, T.ding, 8, 1.5);
  const dial = f < T.crank[0] ? 30 : io(f, T.crank, 30, 30 + 3 * 360 + 290, Easing.out(Easing.cubic));
  g += shadow(100, 290, 96, 0.6) + microwave({dial, fill, door: f < T.burst ? 0 : io(f, [T.burst, T.burst + 26], 0, 1, Easing.out(Easing.quad)), on: mwOn, shk, n: 1, f, bulge: within(f, [84, T.burst]) ? lin(f, [84, T.burst], 0, 3) : 0});
  // panci (3 tumpuk) di konter x=300
  const ph = T.potHit;
  if (f < ph) g += panK(300, 296, 0, '#5B7DB1') + panK(300, 280, 0, '#7BD389', 0.9) + panK(300, 266, 0, '#FFD23F', 0.8);
  else {
    const t = f - ph;
    g += panK(300 - t * 5, 296 - t * 7 + t * t * 0.5, -t * 14, '#5B7DB1') + panK(300 + t * 7, 280 - t * 9 + t * t * 0.55, t * 18, '#7BD389', 0.9);
  }
  g += toaster(420, 296, {lever: f >= T.toastHit ? 1 : 0, toast: f < T.toastHit ? 0 : lin(f, [T.toastHit, T.toastHit + 34], 0, 1.25)});
  g += fridge(590, 400, {sq: shake(f, T.fridgeHit, 10, 1)});
  // ---- Snick ----
  let sn = '';
  if (f >= T.snickDrop[0] && f < T.cutFlood) {
    const sx = snX(f);
    let sy = f < T.snickLand ? io(f, T.snickDrop, 196, 296, Easing.in(Easing.quad)) : 296;
    let o: any = {look: [-1, 0], brow: 'smug', m: 'grin', arms: 'down', blink: blinkAt(f, 11)}, rot = 0, sqY = 1;
    if (within(f, [T.snickLand, T.snickLand + 4])) sqY = 0.8;
    if (within(f, [T.snickLand + 2, T.crank[1] + 2])) o.arms = 'reachL';
    if (within(f, [T.crank[1] + 2, T.burst])) { o.arms = 'up'; o.look = [-0.6, -0.3]; }
    if (f >= T.burst) { sy = 296 - 20 + Math.sin(f * 0.5) * 4; rot = f < T.fridgeHit ? (f - T.burst) * 9 : 0; o = {look: [1, 0], brow: 'up', m: 'o', arms: 'up', blink: false}; }
    if (f >= T.fridgeHit) { rot = 0; sqY = f < T.fridgeHit + 6 ? 0.55 : 1; sy = Math.max(296, lv + 60) + (f - T.fridgeHit) * 1.5; o = {look: [0, 0], brow: 'sad', m: 'wavy', arms: 'down'}; }
    sn = `<g transform="translate(${sx},${sy}) rotate(${rot},0,${-36 * SN}) scale(${f >= T.fridgeHit && f < T.fridgeHit + 6 ? 0.6 : 1},${sqY}) translate(${-sx},${-sy})">${snick(sx, sy, SN, o)}`;
    if (f >= T.helmet) sn += panK(sx, sy - 116 * SN - 2, 180, '#FFD23F', 0.8);
    else if (f >= T.potHit) { const t = (f - T.potHit) / (T.helmet - T.potHit), hx = 300 + (snX(T.helmet) - 300) * t, hy = 266 + ((296 - 20 - 116 * SN) - 266) * t - Math.sin(t * Math.PI) * 60; g += panK(hx, hy, 180 * t, '#FFD23F', 0.8); }
    sn += '</g>';
    if (f >= T.burst && f < T.fridgeHit) sn = trail(sx - 10, sy - 30, 1, 3, '#FFF6DC') + sn;
  }
  if (f >= T.snickPop) { // Snick muncul dari lautan popcorn di kiri Brick
    const up = io(f, [T.snickPop, T.snickPop + 8], 50, 0, Easing.out(Easing.back(2))), sx = BX - 98, sy = lv + 14 + up + (f > T.sad + 18 ? lin(f, [T.sad + 18, 400], 0, 40) : 0);
    const gotBowl = f >= T.give[1];
    const o: any = {look: [1, -0.4], brow: 'up', m: 'smile', arms: 'up', blink: blinkAt(f, 5)};
    if (gotBowl) { o.look = [0, 0.8]; o.brow = f >= T.sad ? 'sad' : 'up'; o.m = f >= T.sad ? 'frown' : 'o'; o.arms = 'down'; }
    sn = snick(sx, sy, SN, o) + panK(sx, sy - 116 * SN - 2, 180, '#FFD23F', 0.8) + (gotBowl ? bowl(sx, sy - 26, 1) : '');
  }
  g += sn;
  // ---- popcorn di konter + curah ----
  if (f >= T.burst) {
    const front = Math.min(560, snX(f) + 22), thick = lin(f, [T.burst, T.burst + 20], 8, 30);
    g += popMass(118, front, 296 - thick, 300, f, 4, 7);
    const down = Math.min(400, 300 + (f - T.burst) * 6);
    if (front > 160) g += popMass(150, Math.min(front - 10, 556), 300, down, f, 9, 3);
    // air mancur popcorn dari microwave
    if (f < T.ding) for (let i = 0; i < 12; i++) { const p = ((f - T.burst) * 0.07 + i / 12) % 1; g += pop(MW.x + 40 + p * 150, 262 - Math.sin(p * Math.PI) * (50 + (i % 3) * 18) + p * 30, 1.1, f * 12 + i * 40); }
    if (f < T.burst + 10) g += impactLines(MW.x + 40, 264, 30 + (f - T.burst) * 3) + popMass(MW.x + 20 - (f - T.burst) * 2, MW.x + 80 + (f - T.burst) * 5, 240 - (f - T.burst) * 3, 292, f, 1, 10);
  }
  // ---- Brick ----
  {
    const o: any = {look: [-1, 0], brow: 'flat', m: 'smile', arms: 'down', blink: blinkAt(f, 23)};
    let extra = '', hand = [bx - 63, by - 45], rhand = [bx + 63, by - 45];
    if (within(f, T.walk)) o.look = [1, 0];
    if (within(f, T.salt)) { o.arms = 'up'; o.look = [0.4, -1]; }
    if (within(f, [T.salt[1], T.cutBrick])) { o.look = [1, -0.2]; o.m = 'smile'; }
    if (within(f, [T.cutBrick, T.saltShake[0]])) { o.look = [-1, 0]; o.brow = 'up'; o.m = 'o'; }
    if (within(f, [T.saltShake[0], T.cutFlood])) { o.arms = 'up'; o.look = [0, -1]; o.m = 'grin'; o.brow = 'up'; }
    if (f >= T.cutFlood) { o.look = [0, -0.2]; o.m = Math.floor(f / 6) % 2 ? 'grin' : 'o'; o.brow = 'up'; }
    if (f >= T.snickPop) { o.look = [-1, 0]; o.m = 'flat'; o.brow = 'flat'; }
    if (within(f, T.give)) { o.arms = 'pokeL'; }
    if (f >= T.give[1]) { o.look = [0.3, -0.4]; o.m = 'smile'; }
    if (f >= T.toss[0]) { o.arms = 'up'; o.look = [0, -1]; o.brow = 'up'; }
    if (within(f, T.salt) || within(f, [T.saltShake[0], T.cutFlood]) || f >= T.toss[0]) { hand = [bx - 72, by - 146]; rhand = [bx + 72, by - 146]; }
    if (within(f, T.give)) hand = [bx - 110, by - 105];
    g += (by >= 399 ? shadow(bx, 400, 110) : '') + brick(bx, by, S, o);
    // mulut terbuka lebar untuk tangkapan akhir
    const mo = f >= T.toss[0] + 10 ? io(f, [T.toss[0] + 10, T.toss[0] + 20], 0, 1) : 0;
    if (mo > 0) g += `<ellipse cx="${bx}" cy="${by - 88}" rx="${8 + mo * 8}" ry="${3 + mo * 10}" fill="${DARK}" stroke="${C.ink}" stroke-width="3.5"/>`;
    // mangkuk mungil (kiri) & garam (kanan)
    if (f < T.give[1]) g += bowl(hand[0], hand[1], f >= T.cutFeast ? 1 : 0);
    if (f >= T.salt[0] + 6 && f < T.cutFlood) { const sh = within(f, T.saltShake) ? Math.sin(f * 1.6) * 25 : 0; g += salt(rhand[0], rhand[1] + 6, 180 + sh); if (sh) for (let i = 0; i < 4; i++) g += `<circle cx="${rhand[0] + (i - 1.5) * 4 + sh * 0.2}" cy="${rhand[1] + 20 + ((f * 3 + i * 7) % 20)}" r="1.2" fill="#fff" stroke="${C.ink}" stroke-width=".6"/>`; }
    // hujan popcorn di kepala Brick
    if (within(f, [T.burst + 8, T.cutFlood])) for (let i = 0; i < 5; i++) { const p = ((f - T.burst) * 0.05 + i / 5) % 1; g += pop(bx - 40 + i * 20, 200 + p * 60, 1, i * 70 + f * 6); }
    // makan: popcorn melompat ke mulut
    if (within(f, [T.cutChin, T.snickPop])) { const p = ((f - T.cutChin) % 12) / 12; g += pop(bx + 30 - p * 30, lvl(f) - 6 - Math.sin(p * Math.PI) * 30 + (by - 88 - lvl(f)) * p, 1, f * 20); }
    if (extra) g += extra;
  }
  // banjir lantai (di depan semua)
  if (lv < 399) g += popMass(-420, 1220, lv, 900, f, 0, 8);
  if (f >= T.ding && f < T.ding + 10 && lv < 236) g += impactLines(MW.x + 50, lv - 4, 14) ;
  // lemparan popcorn terakhir ke mulut
  if (f >= T.toss[0] && f < T.dark) {
    const hx = bx + 72, hy = by - 146, mx = bx, my = by - 88, t = lin(f, T.toss, 0, 1);
    const px = hx + (mx - hx) * t, py = hy + (my - hy) * t - Math.sin(t * Math.PI) * 70;
    g += pop(px, py, 1, f * 15 * (1 - t));
  }
  return g;
}

function cam(f: number): Cam {
  const base = {sx: 135, sy: 236};
  const bp = brickPos(f);
  if (f < T.cutDial) return {...base, k: 1.25, fx: io(f, [T.cutWide, 60], 190, 160), fy: 290};
  if (f < T.cutWin) return {...base, k: 4.2, fx: MW.dial[0] - 6, fy: MW.dial[1] + 2};
  if (f < T.cutBrick) return {...base, k: 3.0 + (f - T.cutWin) * 0.02, fx: MW.x + 39, fy: MW.y + 30};
  if (f < T.burst) return {...base, k: 2.4, fx: bp.x - 10, fy: 300};
  if (f < T.cutFlood) { const sk = shake(f, T.burst, 10, 6) + shake(f, T.potHit, 6, 3) + shake(f, T.fridgeHit, 10, 6); return {...base, k: 1.45, fx: Math.max(130, Math.min(560, snX(f) + 10)) + sk, fy: 280 + sk * 0.5}; }
  if (f < T.cutChin) return {...base, k: io(f, [T.cutFlood, T.cutChin], 1.0, 0.62), fx: io(f, [T.cutFlood, T.cutChin], 560, 520), fy: io(f, [T.cutFlood, T.cutChin], 300, 270)};
  if (f < T.cutFeast) return {...base, k: 2.2, fx: BX, fy: lvl(f) - 26};
  const wk = {k: 1.5 + shake(f, T.ding, 8, 0.015), fx: BX - 45, fy: lvl(f) - 40};
  if (f < T.push[0]) return {...base, ...wk};
  const t = io(f, T.push, 0, 1, Easing.in(Easing.cubic));
  return {...base, k: wk.k * Math.pow(40, t), fx: wk.fx + (bp.x - wk.fx) * Math.min(1, t * 3), fy: wk.fy + (bp.y - 88 - wk.fy) * Math.min(1, t * 3)};
}

// layar gelap: hook (0..cutWide) dan akhir (dark..420) — popcorn di tengah = match-cut
function darkShot(f: number) {
  let g = `<rect width="270" height="480" fill="${DARK}"/>`;
  if (f >= T.dark) { // akhir: popcorn ditelan, mengecil ke ukuran biji
    const s = io(f, [T.dark, T.frames - 1], 4, 2.2);
    return g + pop(135, 236 + io(f, [T.dark, T.frames - 1], -6, 0), s, (f - T.dark) * 4);
  }
  const glow = io(f, [6, 16], 0, 0.55);
  g += `<ellipse cx="135" cy="300" rx="110" ry="26" fill="#E8A23A" opacity="${glow}"/><rect width="270" height="480" fill="url(#mwGlow)" opacity="${glow * 0.35}"/>`;
  if (f < T.popHook) return g + kernel(135, 236 + Math.sin(f * 3) * 1.5, 2.2);
  const t = f - T.popHook, s = 2.2 + Math.min(1, t / 3) * 2.8;
  const y = 236 - Math.sin(Math.min(1, t / 12) * Math.PI) * 50 + (t > 12 ? 0 : 0);
  g += pop(135, y, s, t * 14);
  if (t < 5) g += impactLines(135, y, 22 + t * 4).replace(/stroke="[^"]*"/g, 'stroke="#FFF6DC"');
  return g;
}

export const EP10: React.FC = () => {
  const F = useCurrentFrame();
  let f = F;
  for (const at of [T.burst, T.fridgeHit] as number[]) f = hold2(f, at);
  const svg = f < T.cutWide || f >= T.dark ? darkShot(f) : camG(world(f), cam(f));
  return (
    <AbsoluteFill style={{backgroundColor: DARK}}>
      <svg viewBox="0 0 270 480" width={1080} height={1920} dangerouslySetInnerHTML={{__html: defs + kitDefs + svg + vignette}} />
      <Audio src={staticFile('ep10.wav')} />
    </AbsoluteFill>
  );
};
