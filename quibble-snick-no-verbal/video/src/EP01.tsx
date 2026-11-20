import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {C, quibble as q, snick as s, P, L} from './draw.js';
import T from './ep01-timeline.json';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = (f: number, r: number[], v0: number, v1: number, e = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [r[0], r[1]], [v0, v1], {...cl, easing: e});
const within = (f: number, r: number[]) => f >= r[0] && f < r[1];
const cam = (inner: string, k: number, fx: number, fy: number, sx = 135, sy = 236) =>
  `<g transform="translate(${sx - fx * k},${sy - fy * k}) scale(${k})">${inner}</g>`;
const WIDE = {k: 0.95, fx: 150, fy: 305};
const room = `<rect x="-500" y="-500" width="1300" height="900" fill="${C.wall}"/><rect x="-500" y="400" width="1300" height="400" fill="${C.floor}"/>${L(-500, 400, 800, 400, 4)}` +
  `<rect x="90" y="150" width="90" height="70" rx="6" fill="#fff" stroke="${C.ink}" stroke-width="4"/>${L(135, 150, 135, 220, 3)}${L(90, 185, 180, 185, 3)}`;
const heart = (x: number, y: number, sc = 1) => `<path transform="translate(${x},${y}) scale(${sc})" d="M0,6 C-12,-4 -8,-14 0,-8 C8,-14 12,-4 0,6Z" fill="${C.s}" stroke="${C.ink}" stroke-width="2.5"/>`;
const steam = (x: number, y: number, f: number) => [0, 1].map(i => `<circle cx="${x + (i ? 14 : -14)}" cy="${y - ((f * 2 + i * 9) % 18)}" r="${5 + ((f + i * 5) % 6)}" fill="#ddd" stroke="${C.ink}" stroke-width="2" opacity=".85"/>`).join('');
const drops = (x: number, y: number, p: number) => [0, 1, 2, 3, 4].map(i => P.drop(x - p * (30 + i * 12), y - 10 + i * 8 - p * 6, 0.6, '#BFE6F2')).join('');
const plasticRing = (x: number, y: number) => `<ellipse cx="${x}" cy="${y}" rx="26" ry="8" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>`;

// CU tangan: gap 1 = jauh, 0 = menyentuh irisan (TABRAK)
function closeUp(gap: number, impact: number) {
  const shake = impact > 0 ? Math.sin(impact * 9) * 3 * impact : 0;
  return `<rect x="-200" y="-200" width="670" height="880" fill="#FFE3B3"/>` +
    `<g transform="translate(${shake},0)">` + P.plate(118, 262, 170) + P.slice(118, 232, 2.3) + `</g>` +
    q(36 - gap * 55, 445, 1.75, {arms: 'reachR', brow: 'angry', look: [1, -0.3], m: 'frown'}) +
    s(178 + gap * 55, 360, 1.4, {arms: 'reachL', brow: 'angry', m: 'flat', look: [-1, -0.3]}) +
    (impact > 0 ? P.burst(118, 200, 30 * impact + 10) : '') + P.sweat(96, 300) + P.sweat(196, 200);
}

export const EP01: React.FC = () => {
  const f = useCurrentFrame();
  let svg = '';
  const table = (dx = 0, slice = true, plastic = false) => P.table(137, 330, 210) + P.plate(137 + dx, 326, 80) + (slice ? P.slice(137 + dx, 312, 0.9) : '') + (plastic ? plasticRing(137 + dx, 300) : '');

  if (f < T.cutWide) {
    const gap = f < T.slam ? 0.15 * (1 - f / T.slam) : 0;
    const imp = f >= T.slam ? Math.exp(-(f - T.slam) / 6) : 0;
    svg = closeUp(gap, imp);
  } else if (f < T.cutSnick) {
    let dx = 0;
    for (const [a, b, d] of T.tugs) if (f >= a && f < b) dx = Math.sin((f - a) / (b - a) * Math.PI) * 10 * d;
    let qo: any = {brow: 'angry', look: [1, 0], m: 'frown', arms: f < T.tugs[5][1] && f >= T.tugs[0][0] ? 'reachR' : 'down'};
    let so: any = {brow: 'angry', look: [-1, 0], m: 'flat', arms: f < T.tugs[5][1] && f >= T.tugs[0][0] ? 'reachL' : 'down'};
    let qx = 62, sx = 212, sSc = 0.9, slice = true, fx = '';
    if (within(f, T.point)) { qo = {arms: 'pointL', brow: 'up', m: 'o', look: [-1, 0]}; fx = P.lines(10, 230, -1); }
    if (f >= T.point[1] && f < T.inhale[0]) {
      qo = {arms: f < T.pointDroop[0] ? 'pointL' : 'down', brow: f < T.pointDroop[0] ? 'up' : 'sad', m: 'o', look: [1, 0]};
      so = within(f, T.yawn) ? {arms: 'up', brow: 'flat', m: 'o', look: [0, -1]} : {brow: 'smug', m: 'smile', look: [-1, 0]};
      if (f >= T.pointDroop[0]) fx = P.sweat(qx + 30, 250);
    }
    if (within(f, T.inhale)) { sSc = io(f, T.inhale, 0.9, 1.05); so = {brow: 'up', m: 'o', look: [0, -1]}; qo = {brow: 'up', m: 'flat', look: [1, 0]}; }
    if (f >= T.sneeze && f < T.grab) {
      so = {brow: 'angry', m: 'grin', look: [-1, 0]};
      const p = io(f, [T.sneeze, T.sneeze + 8], 0, 1, Easing.out(Easing.quad));
      fx = drops(sx - 30, 300, p) + (f < T.sneeze + 5 ? P.burst(sx - 40, 290, 18, '#fff') : '');
      qx = io(f, T.recoil, 62, 30, Easing.out(Easing.back(2))); qo = {brow: 'up', m: 'wavy', look: [1, 0], squash: 0.9, arms: 'up'};
    }
    if (f >= T.grab) {
      slice = false; qx = 30;
      qo = f < T.sad[0] ? {brow: 'up', m: 'o', look: [-1, 0]} : {brow: 'sad', m: 'frown', look: [0, 1], squash: io(f, T.sad, 1, 0.85)};
      sx = io(f, T.runOff, 212, 360, Easing.in(Easing.quad));
      so = {brow: 'smug', m: 'grin', look: [1, 0], hold: P.slice(0, 0, 0.6, 30), arms: 'reachL', flip: true};
      fx = P.lines(sx - 50, 330, -1);
    }
    const snickSvg = s(sx, 400 - (f >= T.runOff[0] ? Math.abs(Math.sin(f / 2)) * 8 : 0), sSc, so);
    svg = cam(room + table(dx, slice) + q(qx, 400, 0.9, qo) + snickSvg + fx, f >= T.sneeze && f < T.sneeze + 4 ? WIDE.k * 1.06 : WIDE.k, WIDE.fx, WIDE.fy);
  } else if (f < T.cutReveal) {
    // Snick di pojok menggigit → PLASTIK! gigi memantul, mata juling
    const bit = f >= T.bite;
    const so: any = bit ? {cross: true, brow: 'sad', m: 'grin', look: [0, 0], arms: 'reachL', hold: P.slice(0, 0, 0.7, 20)} : {brow: 'smug', m: 'o', look: [-1, 0], arms: 'reachL', hold: P.slice(0, 0, 0.7, 20)};
    const wob = bit ? Math.sin((f - T.bite) * 1.4) * 6 * Math.exp(-(f - T.bite) / 10) : 0;
    const k = bit ? io(f, [T.bite, T.bite + 5], 1.4, 1.7, Easing.out(Easing.cubic)) : 1.4;
    const fx = bit && f < T.bite + 10 ? P.burst(150, 250, 26) : '';
    const stars = bit ? [0, 1, 2].map(i => { const a = f / 4 + i * 2.1; return P.sparkle(140 + Math.cos(a) * 26, 288 + Math.sin(a) * 7); }).join('') : '';
    const world = `<rect x="-500" y="-500" width="1300" height="900" fill="#FBD9A8"/><rect x="-500" y="400" width="1300" height="400" fill="${C.floor}"/>${L(-500, 400, 800, 400, 4)}` +
      `<g transform="rotate(${wob},140,400)">${s(140, 400, 1, so)}</g>` + fx + stars;
    svg = cam(world, k, 140, 345);
  } else if (f < T.loopReach[0]) {
    // REVEAL: Quibble ternyata menyembunyikan kotak pizza asli → makan bahagia → Snick kembali, curiga → irisan baru (plastik lagi?)
    const boxP = io(f, T.boxOut, 0, 1, Easing.out(Easing.back(1.6)));
    const munching = within(f, T.munch);
    let qo: any = {brow: 'smug', m: 'grin', look: [0, 0]};
    if (munching) qo = {brow: 'up', m: Math.floor(f / 4) % 2 ? 'o' : 'smile', look: [0, 0], arms: 'holdR', hold: P.slice(0, 0, 0.6, -20)};
    if (within(f, T.whistle)) qo = {brow: 'up', m: 'o', look: [0.6, -1]};
    if (within(f, T.newSlice)) qo = {brow: 'smug', m: 'smile', look: [1, 0], arms: 'reachR'};
    if (f >= T.leanIn[0]) qo = {brow: 'angry', m: 'frown', look: [1, 0]};
    const sx = io(f, T.snickBack, 330, 212, Easing.out(Easing.cubic));
    const so: any = f >= T.leanIn[0] ? {brow: 'angry', m: 'flat', look: [-1, 0]} : {brow: 'angry', m: 'frown', look: [-1, 0]};
    const boxX = within(f, T.whistle) || f >= T.whistle[1] ? io(f, T.whistle, 95, 20) : 95;
    const box = P.box(boxX, 400 - 2) ;
    const boxSvg = `<g transform="translate(0,${(1 - boxP) * 40}) " opacity="${boxP}">${box}</g>`;
    const showSlice = f >= T.newSlice[0] + 6;
    const hearts = munching ? [0, 1, 2].map(i => heart(62 + Math.sin(f / 5 + i * 2) * 16, 230 - ((f * 1.5 + i * 20) % 50), 0.9)).join('') : '';
    const note = within(f, T.whistle) ? `<text x="${92 + Math.sin(f / 3) * 4}" y="${230 - ((f * 1.2) % 30)}" font-size="22" font-family="sans-serif">♪</text>` : '';
    const lean = f >= T.leanIn[0] ? io(f, T.leanIn, 0, 1) : 0;
    const world = room + boxSvg + P.table(137, 330, 210) + P.plate(137, 326, 80) + (showSlice ? P.slice(137, 312, 0.9) : '') +
      q(62 + lean * 10, 400, 0.9, qo) + (f >= T.snickBack[0] ? s(sx - lean * 10, 400, 0.9, so) + (f < T.whistle[1] ? steam(sx, 290, f) : '') : '') + hearts + note;
    svg = cam(world, WIDE.k + lean * 0.3, WIDE.fx - lean * 12, WIDE.fy - lean * 25);
  } else {
    // LOOP: CU tangan pelan-pelan mendekat → frame 419 menyambung ke frame 0 (TABRAK)
    const p = (f - T.loopReach[0]) / (T.loopReach[1] - T.loopReach[0]);
    const gap = 0.15 + 0.85 * Math.pow(1 - p, 1.6);
    svg = closeUp(gap, 0);
  }

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <svg viewBox="0 0 270 480" width={1080} height={1920} dangerouslySetInnerHTML={{__html: svg}} />
      <Audio src={staticFile('ep01.wav')} />
    </AbsoluteFill>
  );
};
