import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {C, quibble as q, snick as s, P, L} from './draw.js';
import T from './ep03v2-timeline.json';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = (f: number, r: number[], v0: number, v1: number, e = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [r[0], r[1]], [v0, v1], {...cl, easing: e});
const g = (svg: string, tf: string, op = 1) => `<g transform="${tf}" opacity="${op}">${svg}</g>`;
const within = (f: number, r: number[]) => f >= r[0] && f < r[1];
const cam = (inner: string, k: number, fx: number, fy: number, sx = 135, sy = 236) =>
  `<g transform="translate(${sx - fx * k},${sy - fy * k}) scale(${k})">${inner}</g>`;
const WIDE = {k: 0.95, fx: 135, fy: 305};
const PINK = '#FF8FC7';

// --- layer pintu (urutan: belakang → karakter di dalam → kaca → depan)
const room = `<rect x="-500" y="-500" width="1300" height="900" fill="${C.wall}"/><rect x="-500" y="400" width="1300" height="400" fill="${C.floor}"/>${L(-500, 400, 800, 400, 4)}` +
  `<rect x="-120" y="190" width="70" height="90" rx="6" fill="#fff" stroke="${C.ink}" stroke-width="4"/><path d="M-110,265 l15,-30 l12,18 l10,-12 l18,24z" fill="${C.q}" opacity=".5"/>` +
  `<rect x="40" y="130" width="190" height="10" rx="3" fill="#C98B3B" stroke="${C.ink}" stroke-width="4"/>`;
const doorBack = `<rect x="55" y="140" width="160" height="260" fill="#9AA3AF" stroke="${C.ink}" stroke-width="5"/><rect x="59" y="144" width="152" height="252" fill="#5d6673"/>`;
const panels = (open: number) => `<rect x="${59}" y="144" width="${76 - open}" height="252" fill="${C.glass}" stroke="${C.ink}" stroke-width="4" opacity=".92"/>` +
  `<rect x="${135 + open}" y="144" width="${76 - open}" height="252" fill="${C.glass}" stroke="${C.ink}" stroke-width="4" opacity=".92"/>` +
  L(70 - open * 0.3, 165, 95 - open * 0.3, 190, 4, '#fff') + P.hand(170 + open, 250);
const sensor = (light: string, glow = 0) => `<rect x="117" y="112" width="36" height="16" rx="5" fill="#333" stroke="${C.ink}" stroke-width="3"/>` +
  (glow ? `<circle cx="135" cy="120" r="${8 + glow * 6}" fill="${light}" opacity=".35"/>` : '') + `<circle cx="135" cy="120" r="5" fill="${light}"/>`;
const RED = '#FF3B3B', GREEN = '#3BE37A';

const hat = (x: number, y: number, sc = 1, rot = 0) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${sc})">` +
  `<path d="M0,-46 L20,0 L-20,0Z" fill="${PINK}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>` +
  `<path d="M-9,-20 L9,-20 M-14,-10 L14,-10" stroke="#fff" stroke-width="4"/><circle cx="0" cy="-48" r="6" fill="${C.y}" stroke="${C.ink}" stroke-width="3"/></g>`;
const bulb = (x: number, y: number, p: number) => `<g transform="translate(${x},${y}) scale(${p})">` +
  [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i * Math.PI / 4; return L(Math.cos(a) * 22, Math.sin(a) * 22, Math.cos(a) * 30, Math.sin(a) * 30, 4, C.ink); }).join('') +
  `<circle cx="0" cy="-2" r="15" fill="${C.y}" stroke="${C.ink}" stroke-width="4"/><rect x="-7" y="12" width="14" height="9" rx="2" fill="#bbb" stroke="${C.ink}" stroke-width="3"/></g>`;
const stars = (x: number, y: number, f: number) => [0, 1, 2].map(i => { const a = f / 4 + i * 2.1; return P.sparkle(x + Math.cos(a) * 30, y + Math.sin(a) * 8); }).join('');
const runF = (f: number) => (f >= T.loopRun[0] ? f - T.frames : f);
const headTop = (y: number, sc: number, squash = 1) => y - (20 + 118 * squash) * sc;

// Quibble dengan siklus jalan/lari
function Q(x: number, y: number, sc: number, o: any, f: number, mode: 'walk' | 'run' | '' = '') {
  let yy = y; const opt = {...o};
  if (mode) {
    const per = mode === 'run' ? 3 : 5;
    opt.legs = Math.floor(f / per) % 2 ? 'run' : 'stand';
    yy = y - Math.abs(Math.sin(f / per * Math.PI / 2)) * (mode === 'run' ? 8 : 5);
  }
  return q(x, yy, sc, opt);
}

function closeUp(f: number, approach: number, squash: number, slide: number) {
  // approach 0..1: Quibble berlari dari jauh ke kaca
  const sc = 0.7 + approach * 1.3;
  const x = 118, y = 440 + slide - (1 - approach) * 60;
  const lines = approach < 1 ? P.lines(x - 70, y - 160, -1) + P.lines(x + 40, y - 120, 1) : '';
  return `<rect x="-200" y="-200" width="670" height="880" fill="#FDE9C9"/>` +
    `<rect x="-200" y="${y + 2}" width="670" height="400" fill="${C.floor}" opacity="${1 - approach}"/>` +
    lines + q(x, y, sc, approach < 1 ? {legs: Math.floor((runF(f) + 1000) / 2) % 2 ? 'run' : 'stand', brow: 'angry', m: 'grin', look: [0, 0]} : {squash, brow: 'sad', m: 'wavy', cross: true}) +
    `<rect x="-200" y="-200" width="670" height="880" fill="${C.glass}" opacity=".22"/>` + L(20, 40, 80, 100, 6, '#fff') + L(40, 40, 120, 120, 4, '#fff');
}

export const EP03v2: React.FC = () => {
  const f = useCurrentFrame();
  let svg = '';

  if (f < T.cutWide) {
    const ap = f < T.impact ? 0.5 + f / 16 : 1;
    const sq = f < T.impact ? 1 : 0.78 + 0.2 * Math.exp(-(f - T.impact) / 5) * Math.cos((f - T.impact) * 1.3);
    const shake = f >= T.impact && f < T.impact + 6 ? (f % 2 ? 4 : -4) : 0;
    svg = g(closeUp(f, ap, sq, io(f, T.slide, 0, 30, Easing.in(Easing.quad))), `translate(${shake},0)`);
  } else if (f < T.snickWalk[0]) {
    // lambai → lompat ×3 (bonk sensor) → joget → pintu prank 1 cm
    let y = 400, o: any = {arms: Math.floor(f / 5) % 2 ? 'up' : 'down', brow: 'up', m: 'o', look: [0, -1]}, rot = 0, open = 0, light = RED, glow = 0;
    T.jumps.forEach((j, i) => {
      const h = i === 2 ? 150 : 45, d = i === 2 ? 16 : 12;
      if (f >= j && f < j + d) { const p = (f - j) / d; y = 400 - h * 4 * p * (1 - p); }
    });
    if (f >= T.jumps[2] && f >= T.bonk - 0) { /* handled below */ }
    if (f >= T.jumps[2] && f < T.bonk) { const p = (f - T.jumps[2]) / (T.bonk - T.jumps[2]); y = 400 - 150 * Math.sin(p * Math.PI / 2); o = {arms: 'up', brow: 'angry', m: 'grin', look: [0, -1]}; }
    if (f >= T.bonk && f < T.dance[0]) {
      y = Math.min(400, 250 + (f - T.bonk) ** 2 * 2);
      o = {cross: true, brow: 'sad', m: 'wavy'};
      if (y >= 400) o.squash = 1 - 0.18 * Math.exp(-(f - T.bonk - 8) / 3);
    }
    if (f >= T.dance[0]) {
      o = {arms: 'hips', brow: 'angry', m: 'grin', look: [0, -1]};
      rot = 10 * Math.sin((f - T.dance[0]) / 3); y = 400 - Math.abs(Math.sin((f - T.dance[0]) / 3)) * 12;
      if (f >= T.peekOpen) {
        rot = 0; y = 400;
        if (f < T.peekClose) { open = io(f, [T.peekOpen, T.peekOpen + 3], 0, 7); light = GREEN; glow = 1; o = {brow: 'up', m: 'smile', look: [0, 0], arms: 'up'}; }
        else { open = io(f, [T.peekClose, T.peekClose + 2], 7, 0); o = {brow: 'sad', m: 'frown', look: [0, 1], squash: io(f, [T.peekClose, T.peekClose + 8], 1, 0.85)}; }
      }
    }
    const fx = (f >= T.bonk && f < T.stars[1]) ? (f < T.bonk + 6 ? P.burst(150, 118, 22) : '') + stars(135, headTop(y, 0.9, o.squash || 1) - 8, f) : '';
    const punch = f >= T.bonk && f < T.bonk + 4 ? 1.08 : 1;
    svg = cam(room + doorBack + panels(open) + sensor(light, glow) + g(Q(135, y, 0.9, o, f), `rotate(${rot},135,400)`) + fx, WIDE.k * punch, WIDE.fx, WIDE.fy);
  } else if (f < T.bulb) {
    // Snick lewat → pintu langsung terbuka → Snick menyeringai ke kamera → masuk
    const sx = io(f, T.snickWalk, -70, 135, Easing.linear);
    let open = io(f, T.snickDoorOpen, 0, 62, Easing.out(Easing.cubic));
    if (f >= T.snickDoorClose[0]) open = io(f, T.snickDoorClose, 62, 0, Easing.in(Easing.cubic));
    const light = f >= T.snickDoorOpen[0] && f < T.snickDoorClose[1] ? GREEN : RED;
    const inside = f >= T.snickIn[0];
    const sSc = io(f, T.snickIn, 0.95, 0.6), sY = io(f, T.snickIn, 400, 372), sOp = io(f, [T.snickIn[1] - 4, T.snickIn[1]], 1, 0);
    const smirk = within(f, T.snickSmirk);
    const hop = f < T.snickWalk[1] ? Math.abs(Math.sin(f / 2.5)) * 5 : 0;
    const snk = `<g opacity="${sOp}">${s(sx, sY - hop, sSc, smirk ? {brow: Math.floor(f / 3) % 2 ? 'smug' : 'up', m: 'grin', look: [0, 0]} : {m: 'smile', brow: 'flat', look: [1, 0]})}${smirk ? P.sparkle(sx + 30, sY - 100) : ''}</g>`;
    const qo: any = f >= T.jawDrop ? {brow: 'up', m: 'o', look: [-1, 0], squash: 1.1} : {legs: 'sit', brow: 'sad', m: 'frown', look: [0, 1]};
    const k = smirk ? io(f, [T.snickSmirk[0], T.snickSmirk[0] + 5], WIDE.k, 1.35, Easing.out(Easing.cubic)) : WIDE.k;
    const fy = smirk ? io(f, [T.snickSmirk[0], T.snickSmirk[0] + 5], WIDE.fy, 330) : WIDE.fy;
    const fx = smirk ? io(f, [T.snickSmirk[0], T.snickSmirk[0] + 5], 135, 135) : 135;
    const world = room + doorBack + (inside ? snk : '') + panels(open) + sensor(light, light === GREEN ? 1 : 0) + (inside ? '' : snk) + Q(205, 400, 0.9, qo, f);
    svg = cam(world, k, fx, fy);
  } else if (f < T.slam[0]) {
    // IDE: bohlam → topi pesta pink = menyamar jadi Snick → sensor ragu → HIJAU → ta-da → melenggang
    let qx = 205, o: any = {brow: 'up', m: 'o', look: [0, -1]}, mode: any = '';
    let extra = '';
    const top = headTop(400, 0.9);
    if (f < T.hatGrab) extra += bulb(205, top - 34, io(f, [T.bulb, T.bulb + 4], 0, 1, Easing.out(Easing.back(3))));
    if (f >= T.hatGrab && f < T.hatOn) { o = {brow: 'smug', m: 'grin', arms: 'holdR', look: [1, 0], hold: hat(0, 10, 0.6)}; }
    let hatY = top + 6, hatOn = f >= T.hatOn;
    if (hatOn) o = {brow: 'smug', m: 'grin', look: [-1, 0]};
    if (f >= T.sneak[0]) { qx = io(f, T.sneak, 205, 135, Easing.linear); mode = 'walk'; o = {brow: 'smug', m: 'smile', look: [-1, -0.4], flip: true}; }
    let light = RED, open = 0, glow = 0;
    if (within(f, T.sensorFlicker)) { light = Math.floor(f / 2) % 2 ? GREEN : RED; glow = 0.5; o = {brow: 'flat', m: 'flat', look: [0, -1]}; mode = ''; qx = 135; }
    if (f >= T.sensorFlicker[1]) { light = GREEN; glow = 1; qx = 135; mode = ''; open = io(f, T.openForQ, 0, 62, Easing.out(Easing.cubic)); }
    if (f >= T.tada[0]) o = {arms: 'up', brow: 'up', m: 'grin', look: [0, 0]};
    let qy = 400;
    if (within(f, T.tada)) qy = 400 - Math.sin((f - T.tada[0]) / (T.tada[1] - T.tada[0]) * Math.PI) * 25;
    if (f >= T.strut[0]) { mode = 'walk'; o = {brow: 'smug', m: 'smile', look: [0, -0.5]}; qy = 400; }
    const strutIn = f >= T.strut[0];
    const qSc = strutIn ? io(f, T.strut, 0.9, 0.82) : 0.9;
    const qY = strutIn ? io(f, T.strut, 400, 392) : qy;
    const body = Q(qx, qY, qSc, o, f, mode) + (hatOn ? hat(qx, headTop(qY - (mode ? Math.abs(Math.sin(f / 5 * Math.PI / 2)) * 5 : 0), qSc) + 6, qSc) : '');
    const confetti = within(f, T.tada) ? [0, 1, 2, 3, 4, 5].map(i => `<rect x="${60 + i * 28}" y="${150 + ((f * 6 + i * 37) % 200)}" width="8" height="5" fill="${[C.y, PINK, C.q][i % 3]}" transform="rotate(${f * 20 + i * 40},${64 + i * 28},${150 + ((f * 6 + i * 37) % 200)})"/>`).join('') : '';
    const world = room + doorBack + (strutIn ? body : '') + panels(open) + sensor(light, glow) + (strutIn ? '' : body) + extra + confetti;
    svg = cam(world, f >= T.tada[0] && f < T.tada[1] ? 1.08 : WIDE.k, WIDE.fx, WIDE.fy);
  } else if (f < T.popOut) {
    // BRAK: pintu menutup, Quibble terjepit, topi terbang lalu mendarat di sensor
    const open = io(f, T.slam, 50, 9, Easing.in(Easing.cubic));
    const sq = io(f, [T.slam[0] + 2, T.slam[1]], 1, 0.3);
    const wob = f > T.slam[1] ? 0.04 * Math.sin((f - T.slam[1]) * 0.9) * Math.exp(-(f - T.slam[1]) / 15) : 0;
    const qq = g(q(135, 392, 0.82, {brow: 'sad', cross: true, m: 'wavy', squash: 1.15}), `translate(135,392) scale(${sq + wob},${1 + (1 - sq) * 0.25}) translate(-135,-392)`);
    const p = io(f, T.hatFly, 0, 1, Easing.linear);
    const hx = 135 + p * 10, hy = 270 - Math.sin(p * Math.PI) * 120 - p * 158;
    const hatSvg = f < T.hatFly[1] ? hat(hx, hy, 0.82, p * 720) : hat(135, 112, 0.6, 0);
    const k = io(f, [T.slam[1], T.slam[1] + 10], WIDE.k, 1.2, Easing.out(Easing.cubic));
    svg = cam(room + doorBack + qq + panels(open) + sensor(RED) + hatSvg + (f < T.slam[1] + 8 ? P.burst(210, 180, 26) : ''), k, 135, io(f, [T.slam[1], T.slam[1] + 10], WIDE.fy, 290));
  } else {
    // terlepas, pusing → mundur jauh → kaki mengais (ancang-ancang banteng) → LARI → zoom ke kaca = frame 0 (LOOP)
    let qx = io(f, [T.popOut, T.popOut + 6], 135, 120, Easing.out(Easing.back(2)));
    let o: any = {cross: true, brow: 'sad', m: 'wavy', squash: io(f, [T.popOut, T.popOut + 8], 0.6, 1)}, mode: any = '';
    let fx = within(f, T.dizzy) ? stars(qx, headTop(400, 0.9) - 8, f) : '';
    if (f >= T.backUp[0]) { qx = io(f, T.backUp, 120, -40, Easing.inOut(Easing.quad)); o = {brow: 'angry', m: 'frown', look: [1, 0]}; mode = 'walk'; }
    if (within(f, T.scrape)) { qx = -40; mode = ''; o = {brow: 'angry', m: 'teeth', look: [1, 0], legs: Math.floor((runF(f) + 1000) / 2) % 2 ? 'run' : 'stand'}; fx = `<ellipse cx="${-60}" cy="398" rx="14" ry="5" fill="#bbb" opacity=".7"/>`; }
    if (f >= T.charge[0]) { qx = io(f, T.charge, -40, 150, Easing.in(Easing.quad)); mode = 'run'; o = {brow: 'angry', m: 'grin', look: [1, 0]}; fx = P.lines(qx - 70, 330, -1); }
    if (f >= T.loopRun[0]) {
      // potong ke sudut balik: dari balik kaca, Quibble berlari mendekat → frame 404 menyambung ke frame 0
      svg = closeUp(f, (f - T.frames) / 16 + 0.5, 1, 0);
    } else {
      const world = room + doorBack + panels(0) + sensor(RED) + hat(135, 112, 0.6, 0) + Q(qx, 400, 0.9, o, f, mode) + fx;
      const panX = f >= T.backUp[0] && f < T.charge[0] ? io(f, T.backUp, 0, -50) : f >= T.charge[0] ? -50 + io(f, T.charge, 0, 50) : 0;
      svg = cam(world, WIDE.k, 135 + panX, WIDE.fy);
    }
  }

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <svg viewBox="0 0 270 480" width={1080} height={1920} dangerouslySetInnerHTML={{__html: svg}} />
      <Audio src={staticFile('ep03v2.wav')} />
    </AbsoluteFill>
  );
};
