import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {C, quibble as q, snick as s, P, L} from './draw.js';
import T from './ep02-timeline.json';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = (f: number, r: number[], v0: number, v1: number, e = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [r[0], r[1]], [v0, v1], {...cl, easing: e});
const within = (f: number, r: number[]) => f >= r[0] && f < r[1];
const cam = (inner: string, k: number, fx: number, fy: number, sx = 135, sy = 236) =>
  `<g transform="translate(${sx - fx * k},${sy - fy * k}) scale(${k})">${inner}</g>`;
const K = 1.1, FY = 305, BX = 165, SIGNX = 40, NEXT = 260; // bangku ke-2 identik di x + 260
const SKY = '#D8F0FF';

const world = `<rect x="-500" y="-500" width="1700" height="900" fill="${SKY}"/>` +
  `<rect x="-500" y="400" width="1700" height="400" fill="#A7D58A"/>${L(-500, 400, 1200, 400, 4)}` +
  Array.from({length: 13}, (_, i) => i).map(i => `<path d="M${-310 + i * 130},400 q20,-60 40,0" fill="#8FC172" stroke="${C.ink}" stroke-width="3"/>`).join('');
// bangku basah: mengkilap + tetesan (periode 30 frame → mulus di titik loop 420)
function wetBench(x: number, f: number, dy = 0) {
  const drip = (i: number) => { const t = ((f + i * 10) % 30) / 30; return P.drop(x - 50 + i * 50, 372 + t * 26, 0.7); };
  return `<g transform="translate(0,${dy})">${P.bench(x, 400, 170, true)}${P.shine(x - 70, 343, 46)}${P.shine(x + 5, 373, 40)}</g>` + (dy === 0 ? [0, 1, 2].map(drip).join('') : '');
}
const sign = (x: number, side: 'front' | 'back', flipP = 1) => `<g transform="translate(${x},0) scale(${flipP},1) translate(${-x},0)">${P.sign(x, 400, side)}</g>`;
const gust = (f: number) => [0, 1, 2].map(i => `<path d="M${-60 + ((f - T.wind[0]) * 14 + i * 40)},${180 + i * 30} q30,-14 60,0 t40,-10" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"/>`).join('');
const cone = (rot = 0) => `<g transform="rotate(${rot})">${P.cone(0.9)}</g>`;
const runF = (f: number) => (f >= T.walk[0] ? f - T.frames : f);
// tinggi duduk: berdiri 400 → melayang 380 (BEKU) → (duduk 386 tidak pernah tercapai)
const sitY = (f: number) => { const rf = runF(f); return 400 - 20 * Math.min(1, (rf + 21) / 21 * 1); };

export const EP02: React.FC = () => {
  const f = useCurrentFrame();
  let w = world, camX = 145, k = K, fyy = FY;
  let qx = BX, qy = 400, qo: any = {}, qExtra = '';
  let signSide: 'front' | 'back' = 'front', flipP = 1, groundWet = 0;
  let snick = '', fx = '', benchDy = 0, benchX = BX, iceCone = '';

  if (f < T.cutWide) {
    // HOOK: turun duduk → BEKU 2 cm di atas bangku basah; mata melirik tetesan
    qy = f < T.freeze ? sitY(f) : 380 + (f < T.freeze + 4 ? Math.sin((f - T.freeze) * 2) * 1.5 : 0);
    qo = {legs: 'sit', brow: f < T.freeze ? 'flat' : 'up', m: f < T.freeze ? 'smile' : 'o', look: f < T.freeze ? [0, 0] : [Math.sin(f / 2) * 0.6, 1], arms: 'holdR', hold: cone()};
    if (f >= T.freeze) fx = P.sweat(qx - 28, 280) + P.sweat(qx + 30, 270);
    k = io(f, [T.freeze, T.freeze + 5], 1.15, 1.3, Easing.out(Easing.cubic)); fyy = 340; camX = BX;
  } else if (f < T.groundSit[0]) {
    // berdiri pelan-pelan, lap keringat, goyang jari "nice try" ke papan
    qy = io(f, T.rise, 380, 400);
    qo = within(f, T.wag) ? {brow: 'smug', m: 'smile', look: [-1, -0.5], arms: Math.floor(f / 4) % 2 ? 'pointL' : 'down'} : {brow: 'up', m: 'flat', look: [0, 1], arms: 'holdR', hold: cone()};
    if (within(f, T.wag)) qExtra = `<g transform="translate(${qx + 30},${310})">${cone()}</g>`;
  } else if (f < T.stretch[0]) {
    // pintar: duduk di TANAH depan bangku, menjilat es krim → angin membalik papan → TANAH-nya yang basah
    qx = io(f, T.groundSit, BX, 120); qy = io(f, T.groundSit, 400, 412);
    const lickB = within(f, T.lick) ? Math.abs(Math.sin(f / 3)) * 4 : 0;
    qo = {legs: 'sit', brow: 'smug', m: lickB > 2 ? 'o' : 'smile', look: [1, -0.5], arms: 'holdR', hold: cone()};
    qy -= lickB;
    if (f >= T.wind[0]) { fx = within(f, T.wind) ? gust(f) : ''; flipP = f < T.flip ? io(f, [T.wind[0], T.flip], 1, 0.02) : io(f, [T.flip, T.flip + 5], 0.02, 1); if (f >= T.flip) signSide = 'back'; }
    groundWet = io(f, T.groundWet, 0, 1);
    if (f >= T.lookDown[0]) { qo = {legs: 'sit', brow: 'up', m: 'wavy', look: [0, 1], arms: 'holdR', hold: cone()}; k = io(f, T.lookDown, K, 1.15); fyy = io(f, T.lookDown, FY, 340); camX = io(f, T.lookDown, 145, 125); }
  } else {
    signSide = 'back'; groundWet = 1; qx = 120;
    if (f < T.snap[0]) {
      // coba berdiri: badan molor seperti permen karet…
      const st = io(f, T.stretch, 1, 1.9, Easing.out(Easing.quad));
      qy = 412; qo = {legs: 'sit', brow: 'angry', m: 'teeth', squash: st, arms: 'up', look: [0, -1]};
      qExtra = `<g transform="translate(${qx + 40},${412 - 120 * st})">${cone()}</g>`;
    } else if (f < T.popFree) {
      // …SNAP balik; es krim terlempar ke atas
      qy = 412; const sq = f < T.snap[1] ? io(f, T.snap, 1.9, 0.75, Easing.in(Easing.quad)) : 0.75 + 0.25 * (1 - Math.exp(-(f - T.snap[1]) / 4));
      qo = {legs: 'sit', brow: f < T.snickLick[0] ? 'sad' : 'flat', m: f < T.snickLick[0] ? 'wavy' : 'flat', squash: sq, look: f < T.snickIn[0] ? [0, -1] : [1, -0.3], cross: within(f, [T.snap[0], T.snap[0] + 12])};
    } else {
      // LEPAS (pop) → tertawa → sambar es krim dari Snick → jalan ke bangku berikutnya → duduk → LOOP
      qy = f < T.popFree + 8 ? 400 - Math.sin((f - T.popFree) / 8 * Math.PI) * 30 : 400;
      qo = within(f, T.laugh) ? {brow: 'up', m: 'grin', look: [0.5, 0], squash: 1 + Math.abs(Math.sin(f)) * 0.06} : {brow: 'angry', m: 'frown', look: [1, 0]};
      if (f >= T.dash[0]) { qx = io(f, T.dash, 120, 205, Easing.in(Easing.quad)); qo = {brow: 'angry', m: 'grin', look: [1, 0], legs: Math.floor(f / 2) % 2 ? 'run' : 'stand'}; }
      if (f >= T.snatch) { qx = 205; qo = {brow: 'smug', m: 'smile', look: [1, 0], arms: 'holdR', hold: cone()}; }
      if (f >= T.walk[0]) {
        qx = io(f, T.walk, 205, BX + NEXT, Easing.inOut(Easing.quad));
        qy = 400 - Math.abs(Math.sin(f / 5 * Math.PI / 2)) * 4;
        qo = {brow: 'flat', m: 'smile', look: [1, 0], arms: 'holdR', hold: cone(), legs: Math.floor(f / 5) % 2 ? 'run' : 'stand'};
        camX = io(f, T.walk, 145, 145 + NEXT, Easing.inOut(Easing.cubic));
      }
      if (f >= T.sitDown[0]) {
        qx = BX + NEXT; qy = sitY(f); qo = {legs: 'sit', brow: 'flat', m: 'smile', look: [0, 0], arms: 'holdR', hold: cone()};
        const p = io(f, T.sitDown, 0, 1, Easing.linear);
        k = K + (1.15 - K) * p; fyy = FY + (340 - FY) * p; camX = 145 + NEXT + (BX - 145) * p;
      }
    }
    // es krim terbang → ditangkap Snick
    if (within(f, T.iceFly)) { const p = io(f, T.iceFly, 0, 1, Easing.linear); iceCone = `<g transform="translate(${160 + p * 40},${300 - Math.sin(p * Math.PI) * 140 + p * 20})">${cone(p * 900)}</g>`; }
    // Snick: masuk → tangkap → duduk di bangku (basah juga!) → menempel, jalan bawa bangku → kehilangan es krim → kabur
    if (f >= T.snickIn[0] && f < T.snickOff[1]) {
      let sx = io(f, T.snickIn, 330, 205, Easing.out(Easing.quad)), sy = 400, so: any = {brow: 'up', m: 'o', look: [-1, -1], arms: 'up'};
      if (f >= T.catch) { so = {brow: 'smug', m: 'grin', look: [-1, 0], arms: 'reachL', hold: cone()}; }
      if (f >= T.benchHop[0]) { sx = io(f, T.benchHop, 205, 190); sy = io(f, T.benchHop, 400, 380) - Math.sin(io(f, T.benchHop, 0, 1) * Math.PI) * 30; }
      if (within(f, T.snickLick)) { so = {brow: 'smug', m: Math.floor(f / 4) % 2 ? 'o' : 'smile', look: [-1, 0], arms: 'reachL', hold: cone()}; }
      if (f >= T.snickStuck[0]) {
        so = {brow: 'up', m: 'wavy', look: [0, 1], arms: 'reachL', hold: f < T.snatch ? cone() : ''};
        const wp = io(f, T.waddle, 0, 1, Easing.linear);
        sx = 190 + wp * 40; sy = 380 - 8 - Math.abs(Math.sin(f / 4)) * 4; benchDy = -10 - Math.abs(Math.sin(f / 4)) * 4; benchX = sx - 25;
        if (f >= T.snatch) { so = {brow: 'angry', m: 'frown', look: [-1, 0]}; sx = io(f, T.snickOff, 230, 420, Easing.in(Easing.quad)); benchX = sx - 25; fx += `<circle cx="${sx - 14}" cy="${290 - (f % 12)}" r="6" fill="#ddd" stroke="${C.ink}" stroke-width="2"/><circle cx="${sx + 14}" cy="${290 - ((f + 6) % 12)}" r="6" fill="#ddd" stroke="${C.ink}" stroke-width="2"/>`; }
      }
      snick = s(sx, sy, 0.9, so);
    }
    if (f >= T.popFree && f < T.popFree + 8) fx += P.burst(120, 395, 18, '#fff');
  }

  // susun dunia: papan, bangku 1 (atau bangku yang terbawa Snick), bangku 2 identik, tanah basah, karakter
  const benchStuck = f >= T.snickStuck[0] && f < T.snickOff[1];
  const bench1 = benchStuck ? `<g transform="translate(${benchX - BX},0)">${wetBench(BX, f, benchDy)}</g>` : f >= T.snickOff[1] ? '' : wetBench(BX, f);
  const wet = groundWet > 0 && f < T.walk[0] + 5 ? `<ellipse cx="120" cy="412" rx="${70 * groundWet}" ry="${14 * groundWet}" fill="${C.paint}" opacity=".9"/>` : '';
  const sitOnBench = f < T.cutWide || f >= T.sitDown[0];
  const qSvg = q(qx, qy, sitOnBench ? 1.0 : 0.9, qo) + qExtra;
  w += sign(SIGNX, signSide, flipP) + wet + bench1 + wetBench(BX + NEXT, f) + sign(SIGNX + NEXT, 'front') + (benchStuck ? snick + qSvg : qSvg + snick) + iceCone + fx;
  const svg = cam(w, k, camX, fyy);

  return (
    <AbsoluteFill style={{backgroundColor: SKY}}>
      <svg viewBox="0 0 270 480" width={1080} height={1920} dangerouslySetInnerHTML={{__html: `<circle cx="40" cy="70" r="22" fill="#FFE27A" opacity=".85"/>` + svg}} />
      <Audio src={staticFile('ep02.wav')} />
    </AbsoluteFill>
  );
};
