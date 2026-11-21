// TEMPLAT EPISODE — salin ke EPxx.tsx, ganti XX, isi closeUp() & wide(). Tidak didaftarkan di Root.tsx.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {C, quibble as q, snick, P, L} from './draw.js';
import {dot, brick, shadow, defs, vignette, trail, impactLines, blinkAt} from './draw2';
import T from './epXX-timeline.json'; // {"fps":30,"frames":420,"cutWide":24,"loopCU":[390,420], ...frame kejadian}

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = (f: number, r: number[], v0: number, v1: number, e = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [r[0], r[1]], [v0, v1], {...cl, easing: e});
const within = (f: number, r: number[]) => f >= r[0] && f < r[1];
const shake = (f: number, at: number, len = 8, amp = 5) => (f >= at && f < at + len ? Math.sin((f - at) * 2.3) * amp * (1 - (f - at) / len) : 0);
const hold2 = (f: number, at: number) => (f === at + 1 || f === at + 2 ? at : f); // jeda 2 frame saat benturan
type Cam = {k: number, fx: number, fy: number, sx: number, sy: number};
const camG = (inner: string, c: Cam) => `<g transform="translate(${c.sx - c.fx * c.k},${c.sy - c.fy * c.k}) scale(${c.k})">${inner}</g>`;
const runF = (f: number) => (f >= T.loopCU[0] ? f - T.frames : f); // -30..-1 lalu 0..cutWide: kontinu melewati titik loop

function closeUp(f: number) {
  const rf = runF(f);
  const w = ''; // latar + subjek close-up; semua gerak bergantung rf agar loop mulus
  return camG(w, {k: 2.6 + (rf + 30) * 0.004, fx: 135, fy: 330, sx: 135, sy: 236});
}

function wide(f: number) {
  let fx = '', camShake = 0;
  // ... beat per beat memakai within()/io() dan frame dari T ...
  const w = fx;
  return camG(w, {k: 1, fx: 135 + camShake, fy: 324 + camShake * 0.5, sx: 135, sy: 236});
}

export const EPXX: React.FC = () => {
  const F = useCurrentFrame();
  let f = F;
  for (const at of [/* T.bonk1, ... */] as number[]) f = hold2(f, at);
  const svg = f < T.cutWide || f >= T.loopCU[0] ? closeUp(f) : wide(f);
  return (
    <AbsoluteFill style={{backgroundColor: '#FFF1DA'}}>
      <svg viewBox="0 0 270 480" width={1080} height={1920} dangerouslySetInnerHTML={{__html: defs + svg + vignette}} />
      <Audio src={staticFile('epXX.wav')} />
    </AbsoluteFill>
  );
};
