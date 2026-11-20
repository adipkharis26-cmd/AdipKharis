// EP06 "Selfie Fail" — Quibble ingin foto timer yang sempurna; Snick terus merusaknya, Dot lewat; akhirnya Quibble menang.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {C, quibble as q, snick, P, L} from './draw.js';
import {dot, shadow, defs, vignette, trail, impactLines, blinkAt, camera, photo, park, parkDefs} from './draw2';
import T from './ep06-timeline.json';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = (f: number, r: number[], v0: number, v1: number, e = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [r[0], r[1]], [v0, v1], {...cl, easing: e});
const within = (f: number, r: number[]) => f >= r[0] && f < r[1];
const shake = (f: number, at: number, len = 8, amp = 5) => (f >= at && f < at + len ? Math.sin((f - at) * 2.3) * amp * (1 - (f - at) / len) : 0);
const hold2 = (f: number, at: number) => (f === at + 1 || f === at + 2 ? at : f); // jeda 2 frame saat benturan / jepret

type Cam = {k: number, fx: number, fy: number, sx: number, sy: number};
const camG = (inner: string, c: Cam) => `<g transform="translate(${c.sx - c.fx * c.k},${c.sy - c.fy * c.k}) scale(${c.k})">${inner}</g>`;

const QS = 0.9, QH = 124, SS = 1.0, CX = 55, BODY: [number, number] = [CX, 272];
// Quibble digambar di sekitar pusat badan (cx,cy) dengan rotasi r: 0 = berdiri, 180 = berdiri di atas kepala, 270 = rebah
const qb = (cx: number, cy: number, r: number, o: any, sq = 1) => `<g transform="translate(${cx},${cy}) rotate(${r}) scale(${1 / Math.sqrt(sq)},${sq})">${q(0, QH / 2, QS, o)}</g>`;
const sn = (x: number, y: number, o: any, rot = 0, sq = 1) => `<g transform="translate(${x},${y - 50}) rotate(${rot}) translate(0,50) scale(${1 / Math.sqrt(sq)},${sq})">${snick(0, 0, SS, o)}</g>`;

// jendela hitung mundur [tekan, jepret] (yang pertama melingkar dari akhir video)
const CD = [[T.press7 - T.frames, T.flash1], [T.press2, T.flash2], [T.press3, T.flash3], [T.press4, T.flash4], [T.press5, T.flash5], [T.press6, T.flash6], [T.press7, T.flash1 + T.frames]];
const FL = [T.flash1, T.flash2, T.flash3, T.flash4, T.flash5, T.flash6];
function leds(f: number) {
  for (const [a, b] of CD) if (f >= a && f < b) return 3 - Math.floor(3 * (f - a) / (b - a));
  return 0;
}
const flashAmt = (f: number) => { for (const fl of FL) if (f >= fl && f < fl + 7) return 1 - (f - fl) / 7; return 0; };

// isi foto mini
const PIC: Record<string, string> = {
  fall: `<g transform="rotate(84)">${q(0, 9, 0.13, {m: 'wavy', cross: true, brow: 'sad'})}</g>`,
  snick: snick(3, 18, 0.26, {m: 'grin', arms: 'wave'}),
  dot: `<g opacity=".8">${dot(-2, 10, 0.26, {m: 'grin'})}</g>` + [0, 1, 2].map(i => L(4, -2 + i * 4, 10, -2 + i * 4, 1.5, '#fff')).join(''),
  selfie: snick(0, 22, 0.34, {m: 'grin', brow: 'smug'}),
  eye: `<circle cx="0" cy="0" r="10" fill="#fff" stroke="${C.ink}" stroke-width="2"/><circle cx="2" cy="1" r="4.5" fill="${C.ink}"/><path d="M-11,-11 L11,-11 L11,-6 Q0,-12 -11,-6Z" fill="${C.s}"/>`,
  good: q(0, 10, 0.13, {m: 'grin', brow: 'up', arms: 'up'}),
};
// foto: [jepret, isi, titik keluar, titik mendarat]
const PH: [number, string, number[], number[]][] = [
  [T.flash1, 'fall', BODY, [34, 397]], [T.flash2, 'snick', BODY, [48, 398]], [T.flash3, 'dot', BODY, [62, 396]],
  [T.flash4, 'selfie', [80, 330], [108, 398]], [T.flash5, 'eye', [196, 322], [212, 397]], [T.flash6, 'good', BODY, [118, 397]]];
function photos(f: number, qHold: number[] | null) {
  let s = '';
  PH.forEach(([fl, kind, from, to], i) => {
    const t = f - fl;
    if (f < fl + 2 || f >= T.loopCU[0]) return;
    let x, y, r, k = 0.9;
    if (t < 8) { x = from[0]; y = from[1] - 18 - (t - 2) * 2.5; r = 0; k = 0.7; }
    else if (t < 22) { const p = (t - 8) / 14; x = from[0] + (to[0] - from[0]) * p + Math.sin(p * 9) * 8; y = from[1] - 33 + (to[1] - from[1] + 33) * p * p; r = Math.sin(p * 7) * 30; k = 0.7 + 0.2 * p; }
    else { x = to[0]; y = to[1]; r = (i * 37) % 30 - 15; }
    if (kind === 'good' && qHold && f >= T.run7[1] - 2 && f < 386) { [x, y] = qHold; r = -8; k = 1; }
    else if (kind === 'good' && f >= 386) { const p = io(f, [386, 390], 0, 1); x = qHold ? qHold[0] + (to[0] - qHold[0]) * p : to[0]; y = 380 + 17 * p; r = -8 - 10 * p; }
    s += photo(x, y, k, r, PIC[kind]);
  });
  return s;
}

const runF = (f: number) => (f >= T.loopCU[0] ? f - T.frames : f);
// berdiri di atas kepala, goyang makin kuat
const wobble = (rf: number) => Math.sin(rf * 0.35) * (4 + Math.max(0, rf) * 0.25);

function closeUp(f: number) {
  const rf = runF(f);
  const o = {brow: 'up', m: 'grin', arms: 'up', look: [0, 0.6], blink: rf >= -20 && rf < -17};
  let w = park(f) + camera(CX, 400, {leds: leds(f)}) + shadow(140, 400, 50) + qb(140, 400 - QH / 2, 180 + wobble(rf), o);
  w += P.sweat(140 + 30, 330 + ((rf + 30) % 15)) ;
  const c: Cam = {k: 2.4 + (rf + 30) * 0.003, fx: 140, fy: 362, sx: 135, sy: 250};
  return camG(w, c);
}

function wide(f: number) {
  let qx = 140, qcy = 400 - QH / 2, qr = 0, qsq = 1, qHold: number[] | null = null;
  let qo: any = {brow: 'up', m: 'grin', arms: 'up', look: [-1, 0], blink: blinkAt(f, 10)};
  let sx: number | null = null, sy = 400, srot = 0, ssq = 1, so: any = {brow: 'smug', m: 'grin', look: [-1, 0]};
  let sFront = true, dotSvg = '', fx = '', camShake = 0;
  let cam: any = {x: CX, y: 400, dir: 1, tripod: true};
  const run = (r: number[], a: number, b: number) => { qx = io(f, r, a, b, Easing.inOut(Easing.quad)); qcy = 400 - QH / 2 - Math.abs(Math.sin((f - r[0]) / 2.2)) * 6; qo = {...qo, legs: 'run', flip: b < a, arms: 'down', brow: 'flat', m: 'flat', look: [b < a ? 1 : 1, 0]}; fx += trail(qx + (b < a ? 30 : -30), qcy, b < a ? -1 : 1); };
  const press = (at: number) => { if (within(f, [at - 2, at + 4])) { qx = 120; qo = {brow: 'flat', m: 'smile', arms: 'pointL', look: [-1, -0.5]}; } };

  // A) berdiri di atas kepala -> terguling -> JEPRET (foto jatuh)
  if (f < T.getUp[1]) {
    const rf = f;
    qr = 180 + wobble(rf); qo = {brow: 'up', m: 'grin', arms: 'up', look: [0, 0.6]};
    if (f >= 32) { qr = io(f, [32, T.topple], 180 + wobble(32), 270, Easing.in(Easing.quad)); qcy = io(f, [32, T.topple], qcy, 400 - 34, Easing.in(Easing.quad)); qo = {brow: 'sad', m: 'o', arms: 'up', look: [0, 0]}; }
    if (f >= T.topple) { qr = 270; qcy = 400 - 34; qo = {brow: 'sad', m: 'wavy', cross: f < T.flash1 + 4, arms: 'down'}; camShake = shake(f, T.topple, 8, 4); if (f < T.topple + 5) fx += impactLines(qx - 50, 380, 14); }
    if (f >= T.getUp[0]) { qr = io(f, T.getUp, 270, 360); qcy = io(f, T.getUp, 400 - 34, 400 - QH / 2); qo = {brow: 'angry', m: 'frown', arms: 'down', look: [-1, 0]}; }
  }
  // B) tekan tombol lagi, pose -> Snick menyelonong ke depan
  if (within(f, T.run2)) run(T.run2, 140, 120);
  if (within(f, [T.run2[1], T.back2[0]])) press(T.press2);
  if (within(f, T.back2)) run(T.back2, 120, 140);
  if (within(f, [T.back2[1], T.push])) qo = {brow: 'up', m: 'grin', arms: 'up', look: [-1, 0], blink: blinkAt(f, 10)};
  if (f >= T.snickIn[0] && f < T.snickOut[1]) {
    sx = io(f, T.snickIn, 300, 185, Easing.out(Easing.cubic)); sy = 400 - (f < T.snickIn[1] ? Math.abs(Math.sin((f - T.snickIn[0]) / 2)) * 14 : 0);
    so = {brow: 'smug', m: 'grin', arms: f >= T.snickIn[1] ? 'wave' : 'down', look: [-1, 0]};
    if (f < T.snickIn[1]) fx += trail(sx + 30, sy - 50, -1);
    if (f >= T.flash2) qo = {brow: 'angry', m: 'teeth', arms: 'down', look: [1, 0]};
    if (f >= T.push) {
      const p = (f - T.push) / (T.snickOut[1] - T.push);
      sx = 185 + 160 * p; sy = 400 - Math.sin(p * Math.PI) * 60; srot = p * 540; so = {brow: 'sad', m: 'o', cross: true};
      qo = {brow: 'angry', m: 'teeth', arms: 'reachR', look: [1, 0]};
      if (f < T.push + 5) { fx += impactLines(176, 340, 12); camShake = shake(f, T.push, 6, 3); }
    }
  }
  // C) tekan lagi; Dot menggelinding lewat tepat saat jepret
  if (within(f, T.run3)) run(T.run3, 140, 120);
  if (within(f, [T.run3[1], T.back3[0]])) press(T.press3);
  if (within(f, T.back3)) run(T.back3, 120, 140);
  if (within(f, [T.back3[1], T.facepalm[0]])) qo = {brow: 'up', m: 'grin', arms: 'hips', look: [-1, 0], blink: blinkAt(f, 10)};
  if (within(f, T.dotRoll)) {
    const dx = io(f, T.dotRoll, 300, -60, Easing.linear);
    dotSvg = shadow(dx, 400, 46) + dot(dx, 400, 0.75, {roll: -(300 - dx) * 2.2, m: 'grin', look: [-1, 0], blink: blinkAt(f, 33)}) + trail(dx + 34, 375, -1, 3);
  }
  if (within(f, T.facepalm)) qo = {brow: 'sad', m: 'wavy', arms: 'down', look: [-1, 0.6], squash: 0.95};
  // D) Snick mencuri kamera dan memotret dirinya sendiri
  if (within(f, T.run4)) run(T.run4, 140, 120);
  if (within(f, [T.run4[1], T.back4[0]])) press(T.press4);
  if (within(f, T.back4)) run(T.back4, 120, 140);
  if (within(f, [T.back4[1], T.notice[0]])) qo = {brow: 'up', m: 'grin', arms: 'up', look: [-1, 0], blink: true};
  if (f >= T.sneak[0] && f < T.climb[0]) {
    sFront = false;
    sx = io(f, T.sneak, -40, 40, Easing.linear); sy = 400 - Math.abs(Math.sin((f - T.sneak[0]) / 2)) * 4;
    so = {brow: 'smug', m: 'grin', look: [1, -0.4], blink: blinkAt(f, 17)};
    if (f >= T.liftCam[0]) {
      const p = io(f, T.liftCam, 0, 1);
      cam = {x: BODY[0] + (80 - BODY[0]) * p, y: BODY[1] + (342 - BODY[1]) * p, dir: p < 0.5 ? 1 : -1, tripod: false};
      so = {brow: 'smug', m: 'grin', look: [1, 0], arms: 'x'};
      fx += L(sx + 18, 362, cam.x - 10, cam.y + 4, 4) + L(sx + 14, 356, cam.x - 12, cam.y - 6, 4);
    }
    if (f >= T.flash4) so = {...so, brow: 'up', m: 'grin', blink: f < T.flash4 + 8};
  }
  if (within(f, T.notice)) qo = {brow: 'up', m: 'o', arms: 'down', look: [-1, 0]};
  if (within(f, T.rage)) {
    qcy = 400 - QH / 2 - Math.abs(Math.sin((f - T.rage[0]) / 2)) * 8; qo = {brow: 'angry', m: 'teeth', arms: 'up', look: [-1, 0]};
    fx += [0, 1].map(i => `<circle cx="${qx + (i ? 16 : -16)}" cy="${262 - ((f + i * 5) % 12) * 1.5}" r="6" fill="#eee" stroke="${C.ink}" stroke-width="2"/>`).join('');
  }
  // E) Quibble merebut kamera; selfie sendiri; Snick melompat photobomb -> Quibble menunduk -> Snick menabrak lensa
  if (within(f, T.stomp)) { run(T.stomp, 140, 90); qo = {...qo, brow: 'angry', m: 'teeth'}; }
  if (f >= T.snatch && f < T.setBack[0]) {
    if (f < T.walkBack[0]) { qx = 90; qo = {brow: 'angry', m: 'frown', arms: 'reachR', flip: true, look: [1, 0]}; cam = {x: qx - 64, y: 334, dir: 1, tripod: false}; }
    else {
      if (f < T.walkBack[1]) run(T.walkBack, 90, 140);
      qo = {...qo, brow: 'up', m: 'grin', arms: 'reachR', flip: false, look: [1, 0], blink: f >= T.flash5 && f < T.setBack[0] && (f % 10) < 4};
      cam = {x: qx + 62, y: 334, dir: -1, tripod: false};
    }
    if (f < T.snatch + 5) { fx += impactLines(70, 330, 12); camShake = shake(f, T.snatch, 6, 3); }
    if (within(f, T.duck)) { qsq = 0.72; qcy = 400 - QH * 0.72 / 2; qo = {...qo, brow: 'up', m: 'o', look: [-0.3, -1]}; }
    if (f >= T.flash5) { qcy = 400 - QH / 2 - Math.abs(Math.sin((f - T.flash5) / 2.5)) * 5; qo = {...qo, brow: 'up', m: 'grin', look: [1, -1]}; }
  }
  if (f >= T.snatch && f < T.climb[0]) {
    sx = 40 - io(f, [T.snatch, T.snatch + 6], 0, 8); ssq = io(f, [T.snatch, T.snatch + 6], 1, 0.72, Easing.out(Easing.back(2)));
    so = {brow: 'sad', m: 'wavy', cross: f < T.snatch + 10, look: [1, 0]}; sFront = false;
  }
  if (f >= T.climb[0] && f < T.twinkle + 6) {
    sFront = false;
    if (f < T.leap[0]) { sx = io(f, T.climb, 32, 100, Easing.linear); sy = 400 - Math.abs(Math.sin((f - T.climb[0]) / 2)) * 4; so = {brow: 'smug', m: 'grin', look: [1, -0.4]}; }
    else if (f < T.smack) { const p = (f - T.leap[0]) / (T.smack - T.leap[0]); sx = 100 + (176 - 100) * p; sy = 400 - Math.sin(p * Math.PI) * 90 - 13 * p; so = {brow: 'smug', m: 'grin', arms: 'up', look: [1, 0]}; sFront = true; fx += trail(sx - 30, sy - 50, 1); }
    else if (f < T.fly[0]) { sx = 176; sy = 387; ssq = 1.25; so = {brow: 'up', m: 'o', look: [1, 0], arms: 'up'}; sFront = true; fx += impactLines(180, 334, 16); camShake = shake(f, T.smack, 8, 6); }
    else if (f < T.fly[1]) { const p = (f - T.fly[0]) / (T.fly[1] - T.fly[0]); sx = 176 + 160 * p; sy = 387 - 330 * p + 60 * p * p; srot = p * 900; so = {brow: 'sad', m: 'o', cross: true}; sFront = true; }
    else { sx = null; if (f >= T.twinkle && f < T.twinkle + 6) fx += P.sparkle(222, 110) ; }
  }
  // F) kembalikan kamera ke tripod; foto sempurna; ambil foto; pose terbalik lagi (-> loop)
  if (f >= T.setBack[0]) {
    if (f < T.setBack[1]) { run(T.setBack, 140, 114); qo = {...qo, brow: 'up', m: 'smile'}; const p = io(f, [T.setBack[1] - 4, T.setBack[1]], 0, 1); cam = {x: qx - 62 + (BODY[0] - qx + 62) * p, y: 334 + (BODY[1] - 334) * p, dir: 1, tripod: p >= 1}; }
    if (within(f, [T.setBack[1], T.back6[0]])) { qx = 114; press(T.press6); if (f < T.press6 - 2) qo = {brow: 'flat', m: 'smile', arms: 'down', look: [-1, 0]}; }
    if (within(f, T.back6)) run(T.back6, 120, 140);
    if (within(f, [T.back6[1], T.run7[0]])) qo = {brow: 'flat', m: 'smile', arms: 'hips', look: [-1, 0], blink: blinkAt(f, 10)};
    if (f >= T.flash6 && f < T.run7[0]) qo = {...qo, brow: 'up', m: 'grin'};
    if (within(f, T.run7)) { run(T.run7, 140, 120); qo = {...qo, brow: 'up', m: 'grin'}; }
    if (within(f, [T.run7[1], T.back7[0]])) { qx = 120; press(T.press7); }
    if (f >= T.run7[1] - 2 && f < 386) qHold = [qx + (f < T.back7[0] ? -40 : 40), 340];
    if (within(f, T.back7)) { run(T.back7, 120, 140); qo = {...qo, brow: 'up', m: 'grin', arms: 'holdR'}; }
    if (f >= T.flipUp[0]) { const p = io(f, T.flipUp, 0, 1, Easing.inOut(Easing.quad)); qx = 140; qr = 180 * p + wobble(f - T.frames) * p; qcy = 400 - QH / 2 - Math.sin(p * Math.PI) * 30; qo = {brow: 'up', m: 'grin', arms: 'up', look: [0, 0.6]}; }
  }

  // ---- susun ----
  const fa = flashAmt(f);
  const c: Cam = {k: 1.1 + (fa > 0.85 ? 0.03 : 0), fx: 140 + camShake, fy: 328 + camShake * 0.5, sx: 135, sy: 236};
  const camSvg = camera(cam.x, cam.tripod ? 400 : cam.y, {dir: cam.dir, leds: leds(f), tripod: cam.tripod, flash: fa});
  const tripodOnly = !cam.tripod ? camera(CX, 400, {tripod: true}).split('<g transform')[0] : '';
  const sSvg = sx !== null ? shadow(sx, 400, 60, sy < 380 ? 0.5 : 1) + sn(sx, sy, so, srot, ssq) : '';
  let w = park(f) + tripodOnly + photos(f, qHold);
  if (!sFront) w += sSvg;
  w += shadow(qx, 400, 70 * QS) + qb(qx, qcy, qr, qo, qsq) + camSvg + dotSvg;
  if (sFront) w += sSvg;
  w += fx;
  return camG(w, c) + (fa > 0 ? `<rect width="270" height="480" fill="#FFFBEA" opacity="${(fa * 0.85).toFixed(3)}"/>` : '');
}

export const EP06: React.FC = () => {
  const F = useCurrentFrame();
  let f = F;
  for (const at of [T.topple, ...FL, T.push, T.snatch, T.smack]) f = hold2(f, at);
  const svg = f < T.cutWide || f >= T.loopCU[0] ? closeUp(f) : wide(f);
  return (
    <AbsoluteFill style={{backgroundColor: '#E6F6FF'}}>
      <svg viewBox="0 0 270 480" width={1080} height={1920} dangerouslySetInnerHTML={{__html: defs + parkDefs + svg + vignette}} />
      <Audio src={staticFile('ep06.wav')} />
    </AbsoluteFill>
  );
};
