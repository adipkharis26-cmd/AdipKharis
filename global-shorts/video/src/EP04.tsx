import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {C, quibble as q, snick as s, P, L} from './draw.js';
import {C2, dot, brick, shadow, defs, vignette, hall, trail, impactLines, blinkAt, can, machine} from './draw2';
import T from './ep04-timeline.json';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = (f: number, r: number[], v0: number, v1: number, e = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [r[0], r[1]], [v0, v1], {...cl, easing: e});
const within = (f: number, r: number[]) => f >= r[0] && f < r[1];
const cam = (inner: string, k: number, fx: number, fy: number, sx = 135, sy = 236) =>
  `<g transform="translate(${sx - fx * k},${sy - fy * k}) scale(${k})">${inner}</g>`;
const MX = 92, K = 1.1, FY = 300, FX = 148;
const EDGE = {x: MX + 26, y: 400 - 192};       // tepi spiral baris 2 kolom 3
const runF = (f: number) => (f >= T.loopCU[0] ? f - T.frames : f);
// kaleng tersangkut: bergerak ke tepi lalu jungkat-jungkit (kontinu melewati titik loop)
function stuckCan(f: number) {
  const rf = runF(f);
  if (rf < 0) { const p = (rf + 30) / 30; return {x: EDGE.x - 30 * (1 - p), y: EDGE.y, rot: 22 * p * p}; }
  return {x: EDGE.x, y: EDGE.y + 2, rot: 22 + 9 * Math.sin(rf * 0.45) * Math.exp(-rf / 60)};
}
const shake = (f: number, at: number, len = 8, amp = 5) => (f >= at && f < at + len ? Math.sin((f - at) * 2.3) * amp * (1 - (f - at) / len) : 0);
const hold2 = (f: number, at: number) => (f === at + 1 || f === at + 2 ? at : f); // jeda 2 frame saat benturan

function closeUp(f: number) {
  const c = stuckCan(f);
  // CU: jendela mesin, kaleng di ujung spiral; wajah Quibble menempel di kaca (kiri bawah)
  const inner = machine(MX, 400, {stuck: c}) ;
  const qFace = q(MX - 70, 420, 1.6, {brow: 'up', m: 'o', look: [0.8, -0.6], squash: 0.9, blink: false});
  return cam(hall() + inner + qFace, 2.6, EDGE.x - 6, EDGE.y + 18, 135, 220);
}

export const EP04: React.FC = () => {
  const F = useCurrentFrame();
  const f = hold2(hold2(hold2(F, T.kick), T.tap), T.popUp);
  let svg = '';
  if (f < T.cutWide || f >= T.loopCU[0]) {
    svg = closeUp(f);
  } else {
    let mRot = 0, world = hall(), fx = '', camShake = 0;
    const st = stuckCan(30);
    let stuck: any = {...st, rot: st.rot + 4 * Math.sin(f / 3)};
    let stuck2: any = null;
    // Quibble
    let qx = 190, qy = 400, qo: any = {brow: 'angry', m: 'frown', look: [-1, -0.5], blink: blinkAt(f, 10)};
    for (const [a, b] of T.shakes) if (within(f, [a, b])) { mRot = Math.sin((f - a) / (b - a) * Math.PI * 2) * 2; qx = 175; qo = {brow: 'angry', m: 'teeth', arms: 'reachR', flip: true, look: [-1, 0]}; stuck.rot += mRot * 2; }
    if (f >= T.shakes[3][1] && f < T.kick) { qx = io(f, [T.shakes[3][1], T.kick], 175, 165); qo = {brow: 'angry', m: 'grin', look: [-1, 0], legs: 'run', flip: true}; }
    if (f >= T.kick && f < T.hop[1]) {
      mRot = shake(f, T.kick, 6, 2); camShake = shake(f, T.kick, 8, 4);
      qx = 170 + Math.sin((f - T.kick) / 3) * 6; qy = 400 - Math.abs(Math.sin((f - T.kick) / 4)) * 22;
      qo = {brow: 'sad', m: 'wavy', cross: f < T.kick + 14, legs: 'run', look: [0, -1]};
      if (f < T.kick + 6) fx += impactLines(150, 380, 14) + P.burst(150, 380, 16);
      fx += [0, 1, 2].map(i => { const a = f / 4 + i * 2.1; return P.sparkle(qx + Math.cos(a) * 24, qy - 130 + Math.sin(a) * 6); }).join('');
    }
    if (f >= T.hop[1]) { qx = 205; qo = {brow: 'sad', m: 'frown', look: [-1, 0], blink: blinkAt(f, 10)}; }
    // Dot: menggelinding masuk, masukkan koin, tombol, kaleng jatuh, melompat pergi
    let dotSvg = '';
    if (f >= T.dotIn[0] && f < T.dotOut[1]) {
      let dx = io(f, T.dotIn, -60, 128, Easing.out(Easing.cubic)), dy = 400, d: any = {roll: io(f, T.dotIn, -540, 0, Easing.out(Easing.cubic)), m: 'smile', look: [1, -1], blink: blinkAt(f, 33)};
      if (f >= T.dotIn[1]) d = {m: 'smile', look: [1, -1], arms: f >= T.dotCoin - 4 && f < T.dotButton + 4 ? 'reachR' : 'down', blink: blinkAt(f, 33)};
      if (f >= T.dotDrop) d = {m: 'grin', brow: 'up', look: [0, 0], arms: 'up'};
      if (f >= T.dotOut[0]) { dx = io(f, T.dotOut, 128, -80, Easing.in(Easing.quad)); dy = 400 - Math.abs(Math.sin((f - T.dotOut[0]) / 3)) * 18; d = {m: 'grin', look: [-1, 0], hold: can(0, 0, 0.8, 0, '#8AC926')}; fx += trail(dx + 40, dy - 40, -1); }
      dotSvg = shadow(dx, 400, 50) + dot(dx, dy, 0.8, d);
      if (f >= T.dotDrop && f < T.dotDrop + 6) fx += can(MX - 14, 340 + (f - T.dotDrop) * 4, 0.9, 0, '#8AC926');
    }
    if (f >= T.dotDrop && f < T.dotOut[0]) qo = {brow: 'up', m: 'o', look: [-1, 0.3], squash: 1.08};
    // Quibble koin lagi → kaleng kedua ikut tersangkut
    if (f >= T.qCoin && f < T.brickIn[0]) {
      qx = 180; qo = {brow: f < T.stuck2 ? 'up' : 'angry', m: f < T.stuck2 ? 'smile' : 'teeth', arms: f < T.qCoin + 6 ? 'reachR' : 'down', flip: true, look: [-1, -0.8]};
      const p = io(f, T.spin2, 0, 1, Easing.linear);
      stuck2 = {x: MX - 12 + p * 18, y: EDGE.y, rot: p * 10};
      if (within(f, T.rage)) { qy = 400 - Math.abs(Math.sin((f - T.rage[0]) / 2)) * 10; qo.arms = 'up'; fx += `<circle cx="${qx - 14}" cy="${262 - (f % 10)}" r="6" fill="#ddd" stroke="${C.ink}" stroke-width="2"/><circle cx="${qx + 14}" cy="${262 - ((f + 5) % 10)}" r="6" fill="#ddd" stroke="${C.ink}" stroke-width="2"/>`; }
    }
    // Brick: datang berat, ketuk satu jari → mesin bergetar → HUJAN KALENG
    let brickSvg = '';
    let empty = false;
    if (f >= T.brickIn[0]) {
      const bx = f < T.avalanche[1] ? io(f, T.brickIn, 380, 238, Easing.out(Easing.quad)) : io(f, [T.avalanche[1], T.avalanche[1] + 24], 238, 420, Easing.in(Easing.quad));
      const step = f < T.brickIn[1] ? Math.abs(Math.sin((f - T.brickIn[0]) / 4)) * 5 : 0;
      const poke = f >= T.tap - 8 && f < T.tap + 6;
      brickSvg = shadow(bx, 400, 120) + brick(bx, 400 - step, 0.85, {brow: f < T.tap ? 'flat' : 'up', m: f < T.tap ? 'flat' : 'o', arms: poke ? 'pokeL' : 'cross', look: [-1, -0.5], blink: blinkAt(f, 55)});
      if (f >= T.brickIn[0] && f < T.tap) { qx = io(f, [T.brickIn[0], T.brickIn[0] + 10], 180, 160); qo = {brow: 'up', m: 'o', look: [1, -1], squash: 0.95}; }
      if (within(f, T.rumble)) { mRot = Math.sin((f - T.tap) * 2.5) * 3; camShake = Math.sin((f - T.tap) * 3) * 4; fx += impactLines(MX + 70, 260, 10); }
      if (f >= T.avalanche[0]) { empty = true; stuck = null; stuck2 = null; }
    }
    // hujan kaleng menimbun Quibble
    let pile = '';
    if (f >= T.avalanche[0]) {
      const p = io(f, T.avalanche, 0, 1, Easing.linear);
      for (let i = 0; i < 26; i++) {
        const t0 = i / 26 * 0.7, pp = Math.min(1, Math.max(0, (p - t0) / 0.3));
        const tx = 120 + (i % 7) * 13 + ((i * 37) % 9), ty = 398 - Math.floor(i / 7) * 14 - ((i * 13) % 6);
        const x = MX - 14 + (tx - MX + 14) * pp, y = 340 + (ty - 340) * pp - Math.sin(pp * Math.PI) * 50;
        if (p > t0) pile += can(x, y, 0.9, (i * 47) % 360 * pp, ['#E63946', '#2A9D8F', '#F4A261', '#457B9D', '#8AC926', '#FF8FC7'][i % 6]);
      }
    }
    let qVisible = true;
    if (f >= T.avalanche[0] + 10 && f < T.popUp) qVisible = false;
    if (f >= T.popUp) {
      // kepala muncul dari tumpukan, kaleng di tangan → buka → SEMBUR (kaleng terkocok)
      const up = io(f, [T.popUp, T.popUp + 6], 360, 400, Easing.out(Easing.back(2)));
      qx = 165; qy = up;
      qo = {brow: 'smug', m: 'grin', arms: 'holdR', hold: can(0, 0, 1, f >= T.open ? 20 : 0, '#E63946'), look: [1, -0.3]};
      if (within(f, T.spray)) { qo = {brow: 'up', m: 'o', cross: false, look: [0, 0], arms: 'holdR', hold: can(0, 0, 1, 20, '#E63946'), squash: 0.95};
        fx += Array.from({length: 10}, (_, i) => P.drop(qx + 30 - ((f * 7 + i * 13) % 50), qy - 150 + ((i * 17 + f * 3) % 70), 0.7, '#E9D7A8')).join(''); }
      if (f >= T.drench[0]) { qo = {brow: 'flat', m: 'flat', look: [0, 0], arms: 'holdR', hold: can(0, 0, 1, 20, '#E63946'), blink: blinkAt(f, 0)};
        fx += [0, 1, 2].map(i => P.drop(qx - 20 + i * 20, qy - 60 + ((f * 2 + i * 9) % 30), 0.6, '#E9D7A8')).join(''); }
      if (f >= T.insert[0]) { qx = io(f, T.insert, 165, 150); qo = {brow: 'angry', m: 'frown', arms: 'reachR', flip: true, look: [-1, -0.6]}; }
    }
    world += machine(MX, 400, {stuck, stuck2, empty, shakeRot: mRot, hideSlot: true}) + dotSvg + brickSvg + (qVisible ? shadow(qx, 400, 70) + q(qx, qy, 0.9, qo) : '') + pile + fx;
    const k = f >= T.tap - 4 && f < T.tap + 3 ? 1.08 : K;
    svg = cam(world, k, FX + camShake, FY + camShake * 0.5);
  }
  return (
    <AbsoluteFill style={{backgroundColor: '#FFF1DA'}}>
      <svg viewBox="0 0 270 480" width={1080} height={1920} dangerouslySetInnerHTML={{__html: defs + svg + vignette}} />
      <Audio src={staticFile('ep04.wav')} />
    </AbsoluteFill>
  );
};

// Lembar pemeran v2
export const CastSheet: React.FC = () => {
  const cell = (x: number, inner: string, name: string) => `<g transform="translate(${x},0)"><rect width="270" height="480" fill="url(#wallG)"/><rect y="400" width="270" height="80" fill="url(#floorG)"/>${L(0, 400, 270, 400, 4)}${inner}<text x="135" y="450" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="22" fill="${C.ink}">${name}</text></g>`;
  const html = defs + cell(0, shadow(135, 400, 80) + q(135, 400, 1.4, {brow: 'up', m: 'smile'}), 'Quibble') +
    cell(270, shadow(135, 400, 80) + s(135, 400, 1.8, {}), 'Snick') +
    cell(540, shadow(135, 400, 70) + dot(135, 400, 1.6, {arms: 'wave', m: 'grin'}), 'Dot') +
    cell(810, shadow(135, 400, 140) + brick(135, 400, 1.2, {arms: 'cross'}), 'Brick');
  return <AbsoluteFill style={{backgroundColor: '#fff'}}><svg viewBox="0 0 1080 480" width={2160} height={960} dangerouslySetInnerHTML={{__html: html}} /></AbsoluteFill>;
};
