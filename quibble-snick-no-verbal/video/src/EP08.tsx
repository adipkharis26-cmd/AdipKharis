// EP08 "Alarm Clock" — Brick ingin tidur; jam weker selalu memantul kembali; Dot menang dengan satu tombol (snooze).
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {C, P, L} from './draw.js';
import {dot, brick, shadow, defs, vignette, trail, impactLines, blinkAt, alarmClock, bedDefs, bedroom, bedBack, bedFront, snore} from './draw2';
import T from './ep08-timeline.json';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = (f: number, r: number[], v0: number, v1: number, e = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [r[0], r[1]], [v0, v1], {...cl, easing: e});
const within = (f: number, r: number[]) => f >= r[0] && f < r[1];
const shake = (f: number, at: number, len = 8, amp = 5) => (f >= at && f < at + len ? Math.sin((f - at) * 2.3) * amp * (1 - (f - at) / len) : 0);
const hold2 = (f: number, at: number) => (f === at + 1 || f === at + 2 ? at : f);

type Cam = {k: number, fx: number, fy: number, sx: number, sy: number};
const camG = (inner: string, c: Cam) => `<g transform="translate(${c.sx - c.fx * c.k},${c.sy - c.fy * c.k}) scale(${c.k})">${inner}</g>`;

const BS = 0.8, BX = 137, ASLEEP = 428, UP = 384;
const HOME: [number, number] = [29, 312];
const headTop = (by: number) => [BX, by - 136 * (BS / 0.8) - 16] as [number, number];
const WALL = (y: number): [number, number] => [-6, y];
// lintasan jam saat terbang: [frame, x, y, tinggi lengkung]
const PATHS: [number, number, number, number][][] = [
  [[T.swat[1], ...HOME, 0], [T.wall1, ...WALL(250), 20], [T.bonk1, ...headTop(ASLEEP), 40], [T.land1, ...HOME, 40]],
  [[T.grab2[0], ...HOME, 0], [T.grab2[1], 84, 236, 10]],
  [[T.grab2[1] + 1, 84, 236, 0], [T.wall2, ...WALL(200), 20], [T.lamp1, 80, 154, 30], [T.bonk2, ...headTop(UP), 20]],
  [[T.stuff[0], ...headTop(UP), 0], [T.stuff[1] - 4, 140, 352, 20]],
  [[T.sitUp2[0], 140, 352, 0], [T.sitUp2[1], 96, 236, 10]],
  [[T.throwWin[0], 96, 236, 0], [T.throwWin[1], 186, 206, 40]],
  [[T.place[0], 120, 330, 0], [T.place[1], ...HOME, 30]],
  [[T.punch, ...HOME, 0], [T.pbWall, ...WALL(222), 20], [T.pbLamp, 80, 154, 20], [T.pbWin, 152, 204, 20], [T.bonk3, ...headTop(UP), 20], [T.land3, ...HOME, 50]],
];
function onPath(f: number) {
  for (const path of PATHS) for (let i = 0; i < path.length - 1; i++) {
    const [a, x0, y0] = path[i], [b, x1, y1, arc] = path[i + 1];
    if (f >= a && f < b) { const p = (f - a) / (b - a); return {x: x0 + (x1 - x0) * p, y: y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * arc, rot: p * 360 * (x1 < x0 ? -1 : 1)}; }
  }
  return null;
}
const ringing = (f: number) => f < T.stuff[0] || within(f, [T.sitUp2[0], T.throwWin[1]]) || within(f, [T.ring3, T.snooze[1]]) || f >= T.ringStartCU;
const runF = (f: number) => (f >= T.loopCU[0] ? f - T.frames : f);

function closeUp(f: number) {
  const rf = runF(f), ring = f >= T.ringStartCU || f < T.cutWide;
  const w = bedroom(f) + bedBack() + alarmClock(...HOME, 1, {ring: ring ? 1 : 0, f, hand: 3.6652});
  const c: Cam = {k: 3.2 + (rf + 30) * 0.006, fx: HOME[0] + 6, fy: HOME[1] - 6, sx: 135, sy: 225};
  return camG(w, c);
}

function wide(f: number) {
  let by = ASLEEP, bo: any = {brow: 'angry', m: 'flat', arms: 'rOnly', look: [0, 0], blink: true}, bsq = 1, arm: number[] | null = null;
  let bump = 0, clock: any = {x: HOME[0], y: HOME[1], rot: 0, s: 1, show: true, under: false};
  let dotSvg = '', fx = '', camShake = 0, zz = false;
  const look = (x: number, y: number) => { const dx = x - BX, dy = y - (by - 100); const d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; };

  const pp = onPath(f); if (pp) Object.assign(clock, pp);
  // 1) menepis dalam tidur -> memantul dari dinding -> kepala
  if (within(f, T.swat)) { arm = [HOME[0] + 10, HOME[1] - 4]; }
  if (within(f, [T.bonk1, T.bonk1 + 8])) { bsq = io(f, [T.bonk1, T.bonk1 + 8], 0.86, 1, Easing.out(Easing.back(2))); camShake = shake(f, T.bonk1, 8, 4); fx += impactLines(...headTop(ASLEEP), 14); }
  if (within(f, [T.wall1, T.wall1 + 4])) fx += impactLines(4, 250, 10);
  // 2) duduk, lempar keras: dinding -> lampu -> kepala; jam bertengger di kepala
  if (f >= T.sitUp[0] && f < T.stuff[1]) {
    by = io(f, T.sitUp, ASLEEP, UP, Easing.out(Easing.back(1.5)));
    bo = {brow: 'angry', m: 'teeth', arms: 'rOnly', look: look(clock.x, clock.y), blink: false};
    if (within(f, T.grab2)) arm = [clock.x, clock.y];
    if (within(f, [T.grab2[1], T.grab2[1] + 4])) arm = [20, 200];
    if (within(f, [T.wall2, T.wall2 + 4])) fx += impactLines(4, 200, 10);
    if (within(f, [T.lamp1, T.lamp1 + 4])) fx += impactLines(80, 152, 10);
    if (within(f, [T.bonk2, T.stuff[0]])) { Object.assign(clock, {x: headTop(UP)[0], y: headTop(UP)[1], rot: 0}); bo = {brow: 'angry', m: 'teeth', arms: 'rOnly', look: [0, -1], cross: f < T.bonk2 + 6}; bsq = io(f, [T.bonk2, T.bonk2 + 8], 0.85, 1, Easing.out(Easing.back(2))); camShake = shake(f, T.bonk2, 8, 5); if (f < T.bonk2 + 5) fx += impactLines(...headTop(UP), 16); }
    if (within(f, T.stuff)) { by = io(f, T.stuff, UP, ASLEEP); arm = [clock.x, clock.y]; bo = {brow: 'angry', m: 'flat', arms: 'rOnly', look: [0, 1]}; if (f >= T.stuff[1] - 4) clock.under = true; }
  }
  // 3) disumpal di bawah selimut -> tenang... lalu bergetar
  if (f >= T.stuff[1] && f < T.sitUp2[0]) {
    clock.show = false; by = ASLEEP;
    bo = {brow: 'flat', m: 'flat', arms: 'rOnly', blink: true};
    if (f >= T.vibrate[0]) { const v = Math.sin(f * 3.1); by = ASLEEP - Math.abs(v) * 7; bump = 4 + Math.abs(v) * 6; bo = {brow: 'up', m: 'teeth', arms: 'rOnly', look: [0, 0.5], blink: false}; camShake = Math.sin(f * 2.3) * 1.2; }
  }
  // 4) tarik keluar, lempar lewat jendela -> bintang kecil; tidur lagi dengan puas
  if (f >= T.sitUp2[0] && f < T.wake[0]) {
    by = f < T.lieDown[0] ? io(f, T.sitUp2, ASLEEP, UP) : io(f, T.lieDown, UP, ASLEEP);
    bo = {brow: 'angry', m: 'teeth', arms: 'rOnly', look: look(clock.x, clock.y), blink: false};
    if (f < T.throwWin[0]) arm = [clock.x, clock.y];
    if (within(f, [T.throwWin[0], T.throwWin[0] + 4])) arm = [150, 200];
    if (within(f, T.throwWin)) clock.s = io(f, T.throwWin, 1, 0.35, Easing.linear);
    if (f >= T.throwWin[1]) clock.show = false;
    if (within(f, [T.twinkle, T.twinkle + 6])) fx += P.sparkle(196, 186);
    if (f >= T.dust[0]) bo = {brow: 'flat', m: 'smile', arms: 'rOnly', look: [-0.5, 0], blink: blinkAt(f, 40)};
    if (f >= T.lieDown[0]) { bo = {brow: 'flat', m: 'smile', arms: 'rOnly', blink: true}; zz = f >= T.lieDown[1]; }
  }
  // 5) Dot mengembalikan jam dengan riang, menaruhnya di meja
  if (f >= T.dotIn[0] && f < T.place[1]) {
    const dx = f < T.dotIn[1] ? io(f, T.dotIn, -40, 120, Easing.out(Easing.cubic)) : io(f, T.place, 120, 92);
    const dy = 400 - (within(f, T.place) ? Math.sin(io(f, T.place, 0, Math.PI, Easing.linear)) * 30 : 0);
    const held = f < T.place[0];
    dotSvg = shadow(dx, 400, 46) + dot(dx, dy, 0.8, {roll: f < T.dotIn[1] ? io(f, T.dotIn, -500, 0, Easing.out(Easing.cubic)) : 0, m: 'grin', look: [-1, -0.4], arms: held ? 'reachR' : 'up', blink: blinkAt(f, 33)});
    if (held) Object.assign(clock, {x: dx + 46, y: dy - 40, rot: 0, s: 0.8, show: true});
    if (f < T.dotIn[1]) dotSvg += trail(dx - 36, 380, 1);
  }
  if (f >= T.place[1] && f < T.wake[0]) { Object.assign(clock, {x: HOME[0], y: HOME[1], rot: 0, s: 1, show: true}); }
  // 6) berdering lagi! bangun, tinju -> pinball -> kepala -> kembali ke meja
  if (f >= T.wake[0]) {
    if (f < T.sleep[0]) {
      by = f < T.sitUp3[0] ? ASLEEP : io(f, T.sitUp3, ASLEEP, UP, Easing.out(Easing.back(1.5)));
      bo = {brow: f < T.sitUp3[0] ? 'up' : 'angry', m: f < T.sitUp3[0] ? 'o' : 'teeth', arms: 'rOnly', look: look(clock.x, clock.y), blink: false};
      if (within(f, [T.sitUp3[1], T.punch + 3])) arm = [HOME[0] + 8, HOME[1]];
      if (within(f, [T.punch, T.punch + 5])) { fx += impactLines(...HOME, 14); camShake = shake(f, T.punch, 6, 3); }
      for (const [at, x, y] of [[T.pbWall, 4, 222], [T.pbLamp, 80, 152], [T.pbWin, 152, 204]]) if (within(f, [at, at + 4])) { fx += impactLines(x, y, 10); camShake = shake(f, at, 5, 2); }
      if (within(f, [T.bonk3, T.bonk3 + 10])) { bsq = io(f, [T.bonk3, T.bonk3 + 8], 0.84, 1, Easing.out(Easing.back(2))); bo = {...bo, cross: true, m: 'wavy'}; camShake = shake(f, T.bonk3, 8, 5); if (f < T.bonk3 + 5) fx += impactLines(...headTop(UP), 16); }
      if (within(f, [T.land3, T.stare[0]])) bo = {brow: 'angry', m: 'teeth', arms: 'rOnly', look: [-1, 0.4]};
      if (within(f, T.stare)) bo = {brow: 'flat', m: 'flat', arms: 'rOnly', look: [-1, 0.6], blink: blinkAt(f, 40)};
    } else { by = io(f, T.sleep, UP, ASLEEP); bo = {brow: 'flat', m: 'smile', arms: 'rOnly', blink: true}; zz = f >= T.sleep[1]; }
    // Dot menonton, lalu menekan tombol snooze
    let dx = 92, dy = 400, d: any = {m: 'grin', look: look(clock.x, clock.y).map((v, i) => (i ? v : -Math.abs(v))), arms: 'down', blink: blinkAt(f, 33)};
    if (within(f, [T.punch, T.land3])) dy = 400 - Math.abs(Math.sin((f - T.punch) / 3)) * 10;
    if (within(f, T.snooze)) { const p = io(f, T.snooze, 0, 1, Easing.inOut(Easing.quad)); dx = 92 - 30 * p; dy = 400 - Math.sin(p * Math.PI * 0.5) * 60; d = {m: 'smile', look: [-1, -1], arms: 'up'}; if (p > 0.6) fx += L(dx - 18, dy - 44, HOME[0], HOME[1] - 26, 4); }
    if (within(f, [T.snooze[1], T.dotOut[0]])) { dx = io(f, [T.snooze[1], T.snooze[1] + 6], 62, 92); dy = 400 - Math.sin(io(f, [T.snooze[1], T.snooze[1] + 6], 0, Math.PI, Easing.linear)) * 14; d = {m: 'grin', look: [1, -0.6], arms: f >= T.stare[0] ? 'wave' : 'down', blink: blinkAt(f, 33)}; }
    if (within(f, [T.snooze[1], T.snooze[1] + 5])) fx += impactLines(HOME[0], HOME[1] - 26, 8);
    if (f >= T.dotOut[0]) { dx = io(f, T.dotOut, 92, -60, Easing.in(Easing.quad)); d = {m: 'grin', look: [-1, 0], roll: io(f, T.dotOut, 0, -500, Easing.in(Easing.quad))}; fx += trail(dx + 36, 380, -1); }
    if (f < T.dotOut[1]) dotSvg = shadow(dx, 400, 46, dy < 380 ? 0.5 : 1) + dot(dx, dy, 0.8, d);
  }

  const ring = ringing(f) && clock.show && !clock.under ? 1 : 0;
  const clockSvg = clock.show ? alarmClock(clock.x, clock.y, clock.s, {ring, f, rot: clock.rot, hand: 3.6652}) : '';
  const bTop = by - 136;
  let w = bedroom(f) + bedBack(f >= T.vibrate[0] && f < T.sitUp2[0] ? -Math.abs(Math.sin(f * 3.1)) * 4 : 0);
  w += `<defs><clipPath id="bedclip"><rect x="-100" y="-400" width="500" height="780"/></clipPath></defs><g clip-path="url(#bedclip)"><g transform="translate(${BX},${by}) scale(${1 / Math.sqrt(bsq)},${bsq}) translate(${-BX},${-by})">${brick(BX, by, BS, bo)}</g></g>`;
  if (arm) w += L(BX - 44, bTop + 54, arm[0], arm[1], 8) + `<circle cx="${arm[0]}" cy="${arm[1]}" r="6" fill="${C.ink}"/>`;
  if (clock.under) w += clockSvg;
  w += bedFront(bump);
  if (!clock.under) w += clockSvg;
  if (zz) w += snore(BX + 30, bTop + 30, f);
  w += dotSvg + fx;
  const c: Cam = {k: 1.15, fx: 128 + camShake, fy: 334 + camShake * 0.5, sx: 135, sy: 236};
  return camG(w, c);
}

export const EP08: React.FC = () => {
  const F = useCurrentFrame();
  let f = F;
  for (const at of [T.bonk1, T.bonk2, T.bonk3]) f = hold2(f, at);
  const svg = f < T.cutWide || f >= T.loopCU[0] ? closeUp(f) : wide(f);
  return (
    <AbsoluteFill style={{backgroundColor: '#A9BBE0'}}>
      <svg viewBox="0 0 270 480" width={1080} height={1920} dangerouslySetInnerHTML={{__html: defs + bedDefs + svg + vignette}} />
      <Audio src={staticFile('ep08.wav')} />
    </AbsoluteFill>
  );
};
