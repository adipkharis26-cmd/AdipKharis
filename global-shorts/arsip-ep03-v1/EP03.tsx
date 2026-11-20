import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {C, quibble as q, snick as s, P, L} from './draw.js';
import T from './ep03-timeline.json';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = (f: number, a: number, b: number, v0: number, v1: number, e = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, b], [v0, v1], {...cl, easing: e});
const wrap = (svg: string, tf: string) => `<g transform="${tf}">${svg}</g>`;

// Dunia: koordinat sama dengan storyboard (lantai y=400). Kamera = translate + scale.
function cam(inner: string, k: number, fx: number, fy: number, sx = 135, sy = 236) {
  // titik dunia (fx,fy) dipetakan ke layar (sx,sy)
  return `<g transform="translate(${sx - fx * k},${sy - fy * k}) scale(${k})">${inner}</g>`;
}
const WIDE = {k: 0.95, fx: 135, fy: 305}; // ≈ storyboard v2: lantai di y≈312 layar

function room(open: number, light: 'red' | 'green', extra = '') {
  return `<rect x="-400" y="-400" width="1100" height="800" fill="${C.wall}"/>` +
    `<rect x="-400" y="400" width="1100" height="400" fill="${C.floor}"/>${L(-400, 400, 700, 400, 4)}` +
    `<rect x="40" y="130" width="190" height="10" rx="3" fill="#C98B3B" stroke="${C.ink}" stroke-width="4"/>` +
    extra + P.door(135, 400, open, light) + P.hand(165, 250);
}

function closeUpGlass(f: number, squash: number, slide: number) {
  return `<rect x="-200" y="-200" width="670" height="880" fill="${C.glass}"/>` +
    q(118, 440 + slide, 2.0, {squash, brow: 'sad', m: 'wavy', cross: true}) +
    `<rect x="-200" y="-200" width="670" height="880" fill="#fff" opacity=".16"/>` + L(20, 40, 80, 100, 6, '#fff') + L(40, 40, 120, 120, 4, '#fff');
}

export const EP03: React.FC = () => {
  const f = useCurrentFrame();
  let svg = '';

  if (f < T.cutWide) {
    // S1 HOOK: tabrakan kaca, pantulan squash teredam, lalu melorot
    const pre = f < T.impact ? io(f, 0, T.impact, 1.25, 0.8) : 0.8 + 0.18 * Math.exp(-(f - T.impact) / 5) * Math.cos((f - T.impact) * 1.3);
    const zoom = f < T.impact ? io(f, 0, T.impact, 0.85, 1) : 1;
    const slide = io(f, T.slideStart, T.cutWide, 0, 26, Easing.in(Easing.quad));
    svg = wrap(closeUpGlass(f, pre, slide), `translate(135,240) scale(${zoom}) translate(-135,-240)`);
  } else if (f < T.cutSnick) {
    // S2 lambai + lompat 3×, lompatan ke-3 kepala membentur sensor. S3 joget + pintu prank 1 cm.
    let y = 400, arms = 'down', brow = 'up', m = 'o', look: number[] = [0, -1], cross = false, rot = 0, squash = 1;
    T.jumps.forEach((j, i) => {
      const h = i === 2 ? T.bonkJumpH : 40;
      const dur = i === 2 ? 20 : 14;
      if (f >= j && f < j + dur) {
        const p = (f - j) / dur;
        y = 400 - h * 4 * p * (1 - p);
        if (i === 2 && f >= T.bonk) y = Math.min(400, 400 - h + (f - T.bonk) ** 2 * 1.4);
      }
    });
    if (f >= T.bonk && f < T.danceStart) {
      y = Math.min(400, 400 - T.bonkJumpH + Math.max(0, f - T.bonk) ** 2 * 1.6);
      cross = true; brow = 'sad'; m = 'wavy';
      if (y >= 400) squash = 1 - 0.15 * Math.exp(-(f - T.bonk - 9) / 4);
    } else if (f < T.danceStart) {
      arms = Math.floor(f / 6) % 2 ? 'up' : 'down';
    }
    let open = 0;
    let light: 'red' | 'green' = 'red';
    if (f >= T.danceStart) {
      arms = 'hips'; brow = 'angry'; m = 'grin'; look = [0, -1];
      rot = 9 * Math.sin((f - T.danceStart) / 4);
      y = 400 - Math.abs(Math.sin((f - T.danceStart) / 4)) * 10;
      if (f >= T.peekOpen) {
        open = f < T.peekClose ? io(f, T.peekOpen, T.peekOpen + 4, 0, 7) : io(f, T.peekClose, T.peekClose + 3, 7, 0);
        rot = 0; y = 400; arms = 'down';
        if (f < T.peekClose) { brow = 'up'; m = 'smile'; look = [0, 0]; light = 'green'; }
        else { brow = 'sad'; m = 'frown'; look = [0, 1]; squash = io(f, T.peekClose, T.peekClose + 15, 1, 0.82); }
      }
    }
    const qq = wrap(q(135, y, 0.9, {arms, brow, m, look, cross, squash}), `rotate(${rot},135,400)`);
    const burst = f >= T.bonk && f < T.bonk + 10 ? P.burst(150, 130, 24) : '';
    svg = cam(room(open, light) + qq + burst, WIDE.k, WIDE.fx, WIDE.fy);
  } else if (f < T.doorClose[0]) {
    // S4 Snick lewat, pintu langsung terbuka; Quibble double-take lalu lari
    const sx = io(f, T.snickIn[0], T.snickIn[1], -60, 135, Easing.linear);
    const open = io(f, T.doorOpen[0], T.doorOpen[1], 0, 60, Easing.out(Easing.cubic));
    const light = f >= T.doorOpen[0] ? 'green' : 'red';
    const sScale = io(f, T.snickExit[0], T.snickExit[1], 0.9, 0.55);
    const sY = io(f, T.snickExit[0], T.snickExit[1], 400, 372);
    const sOp = io(f, T.snickExit[1] - 6, T.snickExit[1], 1, 0);
    const hop = Math.abs(Math.sin(f / 3)) * 4;
    const snickSvg = `<g opacity="${sOp}">${s(sx, sY - hop, sScale, {m: 'smile', brow: 'flat', look: [1, 0]})}</g>`;
    const take = f >= T.doubleTake;
    const qx = f >= T.runToDoor[0] ? io(f, T.runToDoor[0], T.runToDoor[1], 200, 135, Easing.in(Easing.quad)) : 200;
    const qOpts = f >= T.runToDoor[0] ? {legs: 'run', brow: 'up', m: 'o', look: [-1, 0], flip: true}
      : take ? {brow: 'up', m: 'o', look: [-1, 0], squash: 1.12} : {legs: 'sit', brow: 'sad', m: 'frown', look: [0, 1]};
    const lines = f >= T.runToDoor[0] ? P.lines(qx + 30, 330, 1) : '';
    const behind = f >= T.snickExit[0];
    // Snick masuk ke balik pintu: digambar sebelum pintu saat sudah di dalam
    const roomSvg = behind
      ? `<rect x="-400" y="-400" width="1100" height="800" fill="${C.wall}"/><rect x="-400" y="400" width="1100" height="400" fill="${C.floor}"/>${L(-400, 400, 700, 400, 4)}<rect x="40" y="130" width="190" height="10" rx="3" fill="#C98B3B" stroke="${C.ink}" stroke-width="4"/><rect x="57" y="142" width="156" height="256" fill="#5d6673"/>${snickSvg}${P.door(135, 400, open, light)}${P.hand(165 + open, 250)}`
      : room(open, light as any) + snickSvg;
    svg = cam(roomSvg + lines + q(qx, qOpts.legs === 'sit' ? 400 : 400, 0.9, qOpts as any), WIDE.k, WIDE.fx, WIDE.fy);
  } else if (f < T.popOut) {
    // S5 pintu menutup, Quibble terjepit; kamera mendekat
    const open = io(f, T.doorClose[0], T.doorClose[1], 60, 10, Easing.in(Easing.cubic));
    const squeeze = io(f, T.doorClose[0] + 3, T.doorClose[1], 1, 0.3);
    const wob = f > T.doorClose[1] ? 0.03 * Math.sin((f - T.doorClose[1]) * 0.9) * Math.exp(-(f - T.doorClose[1]) / 20) : 0;
    const k = io(f, T.doorClose[1], T.doorClose[1] + 18, WIDE.k, 1.25, Easing.out(Easing.cubic));
    const fy = io(f, T.doorClose[1], T.doorClose[1] + 18, WIDE.fy, 300);
    const qq = wrap(q(135, 400, 0.9, {brow: 'sad', cross: true, m: 'wavy', squash: 1.15}), `translate(135,400) scale(${squeeze + wob},${1 + (1 - squeeze) * 0.25}) translate(-135,-400)`);
    const burst = f >= T.doorClose[1] && f < T.doorClose[1] + 14 ? P.burst(205, 170, 28) : '';
    // pintu digambar di atas Quibble supaya terlihat menjepit
    const base = `<rect x="-400" y="-400" width="1100" height="800" fill="${C.wall}"/><rect x="-400" y="400" width="1100" height="400" fill="${C.floor}"/>${L(-400, 400, 700, 400, 4)}<rect x="40" y="130" width="190" height="10" rx="3" fill="#C98B3B" stroke="${C.ink}" stroke-width="4"/>`;
    svg = cam(base + `<rect x="57" y="142" width="156" height="256" fill="#5d6673"/>` + qq + P.door(135, 400, open, 'red').replace(/<rect x="\d+" y="\d+" width="160" height="260" fill="#9AA3AF"[^>]*\/>/, '') + P.hand(165 + open, 250) + burst, k, 135, fy);
  } else {
    // S6 terlepas → lihat ikon "dorong" → dorong → di balik ada pintu kaca lagi → zoom ke close-up (LOOP)
    const pop = io(f, T.popOut, T.popOut + 8, 135, 70, Easing.out(Easing.back(2)));
    const sitting = f < T.standUp;
    const looking = f >= T.lookIcon && f < T.push;
    const pushing = f >= T.push && f < T.runIn[0];
    const running = f >= T.runIn[0];
    const swing = io(f, T.pushOpen[0], T.pushOpen[1], 0, 1, Easing.out(Easing.cubic));
    const qx = running ? io(f, T.runIn[0], T.runIn[1], 95, 150, Easing.in(Easing.quad)) : pushing ? 95 : pop;
    const opts: any = sitting ? {legs: 'sit', brow: 'flat', m: 'flat', look: [0, 0], squash: io(f, T.popOut, T.popOut + 10, 0.7, 1)}
      : looking ? {brow: 'up', m: 'flat', look: [1, -1]}
      : pushing ? {arms: 'reachR', brow: 'flat', m: 'smile', look: [1, 0]}
      : {legs: 'run', brow: 'up', m: 'grin', look: [1, 0], flip: false};
    const doorW = 160 * (1 - swing * 0.85);
    const inner = `<rect x="55" y="140" width="160" height="260" fill="#9AA3AF" stroke="${C.ink}" stroke-width="5"/>` +
      `<rect x="72" y="160" width="126" height="238" fill="${C.glass}" stroke="${C.ink}" stroke-width="4"/>` + L(90, 180, 120, 210, 4, '#fff') + P.hand(165, 270);
    const swingDoor = `<g transform="translate(55,0) scale(${1 - swing * 0.85},1) translate(-55,0)"><rect x="55" y="140" width="160" height="260" fill="${C.glass}" stroke="${C.ink}" stroke-width="5" opacity=".95"/>${P.hand(165, 250)}</g>`;
    const base = `<rect x="-400" y="-400" width="1100" height="800" fill="${C.wall}"/><rect x="-400" y="400" width="1100" height="400" fill="${C.floor}"/>${L(-400, 400, 700, 400, 4)}<rect x="40" y="130" width="190" height="10" rx="3" fill="#C98B3B" stroke="${C.ink}" stroke-width="4"/><rect x="117" y="114" width="36" height="16" rx="5" fill="#333" stroke="${C.ink}" stroke-width="3"/><circle cx="135" cy="122" r="5" fill="#FF3B3B"/>`;
    const lines = running ? P.lines(qx - 50, 330, -1) : '';
    let world = base + inner + swingDoor + lines + q(qx, 400, 0.9, opts);
    void doorW;
    const z = io(f, T.zoomLoop[0], T.zoomLoop[1], 0, 1, Easing.in(Easing.cubic));
    svg = cam(world, WIDE.k + z * 1.6, 135 + z * 15, WIDE.fy - z * 40);
    if (z > 0.85) svg += `<g opacity="${io(f, T.zoomLoop[1] - 3, T.zoomLoop[1], 0, 1)}">${closeUpGlass(f, 1.25, 0)}</g>`;
  }

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <svg viewBox="0 0 270 480" width={1080} height={1920} dangerouslySetInnerHTML={{__html: svg}} />
      <Audio src={staticFile('ep03.wav')} />
    </AbsoluteFill>
  );
};
