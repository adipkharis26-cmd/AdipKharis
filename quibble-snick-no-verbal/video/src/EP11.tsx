// EP11 "Snowman": hidung wortel boneka salju hilang. Semua menuduh Snick, petunjuk (alur gelinding + remah wortel) mengarah ke Dot
// yang memberikannya ke kelinci salju. STRUKTUR D misteri · KAMERA tampak atas + POV kaca pembesar · HOOK wajah kaget ekstrem · LOOP malam->pagi.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {C, quibble as q, snick, P, L} from './draw.js';
import {dot, shadow, defs, vignette, blinkAt, runLegs, trail} from './draw2';
import {snowDefs, snowfall, winter, nightTint, carrot, popsicle, snowman, bunny, bush, topYard, topTracks, topSnowman, topBush, topPine, topChar, lensIcon, magnifier, note} from './draw2';
import T from './ep11-timeline.json';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = (f: number, r: number[], v0: number, v1: number, e = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [r[0], r[1]], [v0, v1], {...cl, easing: e});
const within = (f: number, r: number[]) => f >= r[0] && f < r[1];
const shake = (f: number, at: number, len = 8, amp = 5) => (f >= at && f < at + len ? Math.sin((f - at) * 2.3) * amp * (1 - (f - at) / len) : 0);
const hold2 = (f: number, at: number) => (f === at + 1 || f === at + 2 ? at : f);
type Cam = {k: number, fx: number, fy: number, sx: number, sy: number};
const camG = (inner: string, c: Cam) => `<g transform="translate(${c.sx - c.fx * c.k},${c.sy - c.fy * c.k}) scale(${c.k})">${inner}</g>`;
const runF = (f: number) => (f >= T.loopCU[0] ? f - T.frames : f);
const QS = 0.55, SS = 0.55, DS = 0.5, SMX = 145;

// wajah kaget ekstrem di atas quibble(): mata besar, pupil kecil bergetar, mulut menganga
function shockFace(x: number, y: number, s: number, squash: number, open: number, t: number) {
  const h = 118 * squash, top = -20 - h, ey = top + 34, j = [Math.sin(t * 3.1) * 1.2, Math.cos(t * 2.7) * 1.2];
  let g = '';
  for (const ex of [-16, 16]) g += `<circle cx="${ex}" cy="${ey}" r="${12 + 4 * open}" fill="#fff" stroke="${C.ink}" stroke-width="4"/><circle cx="${ex + j[0]}" cy="${ey + j[1]}" r="${3.2}" fill="${C.ink}"/>`;
  g += L(-28, ey - 26 - 8 * open, -8, ey - 32 - 8 * open, 6) + L(28, ey - 26 - 8 * open, 8, ey - 32 - 8 * open, 6);
  g += `<ellipse cx="0" cy="${ey + 36 + 6 * open}" rx="${9 + 3 * open}" ry="${6 + 14 * open}" fill="${C.ink}"/><ellipse cx="0" cy="${ey + 42 + 12 * open}" rx="${5 + 2 * open}" ry="${3 + 3 * open}" fill="#FF6F91"/>`;
  return `<g transform="translate(${x},${y}) scale(${s})">${g}</g>`;
}
const qTop = (squash: number) => 400 - (20 + 118 * squash) * QS;
const steam = (x: number, y: number, p: number) => [0, 1, 2].map(i => { const t = (p + i / 3) % 1; return `<circle cx="${x + (i - 1) * 7 + Math.sin(t * 6) * 2}" cy="${y - t * 18}" r="${2.5 + t * 4}" fill="#fff" stroke="${C.ink}" stroke-width="1.6" opacity="${1 - t}"/>`; }).join('');
const crumbs = (pts: number[][]) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#FF8C2B" stroke="${C.ink}" stroke-width=".7"/>`).join('');

// HOOK & LOOP: wajah Quibble kaget di depan boneka salju tanpa hidung (pagi). Kontinu melewati titik loop.
function closeUp(f: number) {
  const rf = runF(f), sh = rf - T.shockRf, n = rf < 0 ? 0.15 * (-rf / 24) : 0;
  const open = sh < 0 ? 0 : Math.min(1, sh / 3), squash = sh < 0 ? 1 : 1 + 0.16 * open + Math.sin(sh * 1.4) * 0.02;
  const jx = sh < 0 ? 0 : Math.sin(sh * 2.9) * 1.1;
  let w = winter(n) + bush(14, 400, 0.9) + snowman(SMX, 400, QS, {nose: 'none'});
  w += shadow(92, 400, 46);
  w += q(92 + jx, 400, QS, sh < 0 ? {brow: 'up', m: 'smile', look: [rf > -16 ? 1 : 0, 0], blink: rf >= -21 && rf < -18} : {brow: 'up', m: 'o', arms: 'up', squash});
  if (sh >= 0) {
    w += shockFace(92 + jx, 400, QS, squash, open, sh);
    const hy = qTop(squash) + 4;
    for (let i = 0; i < 6; i++) { const a = -Math.PI * (0.15 + i * 0.14), r0 = 26 + (sh % 6) * 0.6; w += L(92 + Math.cos(a) * r0, hy + 20 + Math.sin(a) * r0, 92 + Math.cos(a) * (r0 + 7), hy + 20 + Math.sin(a) * (r0 + 7), 2); }
    const d = Math.min(1, sh / 10);
    w += P.sweat(75 - d * 8, hy + 12 - d * 6) + P.sweat(110 + d * 8, hy + 10 - d * 4);
  }
  w += nightTint(n) + snowfall(f, 30, 0.85);
  const punch = sh < 0 ? 0 : 0.35 * Easing.out(Easing.back(2))(Math.min(1, sh / 4));
  const sk = sh >= 0 && sh < 10 ? Math.sin(sh * 2.3) * 1.6 * (1 - sh / 10) : 0;
  return camG(w, {k: 2.35 + (rf + 24) * 0.003 + punch, fx: 119 + sk, fy: 330, sx: 135, sy: 236});
}

// 1) Tuduhan: Quibble & Dot menunjuk Snick (yang menyembunyikan sesuatu oranye)
function accuse(f: number) {
  let w = winter(0) + bush(12, 400, 0.9) + snowman(SMX, 400, QS, {nose: 'none'});
  // Snick: barang oranye di balik punggung (es loli, pengecoh)
  const sx = 188, sweat = f >= T.snickSweat;
  w += popsicle(sx + 17, 384, 0.5, 24);
  w += shadow(sx, 400, 40) + snick(sx, 400, SS, {
    look: f < T.qPoint ? [-1, 0] : f < T.dotPoint ? [-1, 0.2] : f < T.idea ? [Math.sin(f * 0.35) > 0 ? -1 : -0.3, 0] : [0, -1],
    brow: f < T.qPoint ? 'smug' : f < T.idea ? 'sad' : 'up', m: f < T.qPoint ? 'smile' : f < T.idea ? 'wavy' : 'grin',
    arms: within(f, [T.snickSweat, T.idea]) ? 'up' : f >= T.idea ? 'wave' : 'down', blink: blinkAt(f, 11),
    hold: f >= T.idea ? `<g transform="translate(78,-30)">${lensIcon(1.2)}</g>` : ''});
  if (sweat && f < T.idea) w += P.sweat(sx + 16, 344 + ((f - T.snickSweat) % 8)) + P.sweat(sx - 18, 348);
  if (within(f, [T.idea, T.idea + 10])) w += P.sparkle(sx + 30, 330 - (f - T.idea));
  // Quibble
  const pointing = f >= T.qPoint, sq = pointing && f < T.qPoint + 6 ? 1 + 0.08 * Math.sin((f - T.qPoint) * 1.2) : 1;
  w += shadow(92, 400, 46) + q(92, 400, QS, {brow: 'angry', m: pointing ? 'teeth' : 'frown', look: pointing ? [1, 0] : [1, -0.5], arms: pointing ? 'pointL' : 'hips', flip: pointing, squash: sq, blink: blinkAt(f, 30)});
  if (f >= T.steam) w += steam(92, qTop(1) - 2, ((f - T.steam) % 24) / 24);
  // Dot menggelinding masuk lalu ikut menunjuk (remah oranye di mulut = petunjuk)
  const dx = io(f, T.dotIn, -40, 52, Easing.out(Easing.quad)), rolling = f < T.dotIn[1];
  const dsq = f >= T.dotIn[1] && f < T.dotIn[1] + 6 ? 1 - 0.15 * Math.sin((f - T.dotIn[1]) / 6 * Math.PI) : 1;
  w += shadow(dx, 400, 30);
  if (rolling && f > T.dotIn[0]) w += trail(dx - 4, 386, 1, 2, '#fff');
  w += dot(dx, 400, DS, {roll: rolling ? (dx + 40) * 4 : 0, squash: dsq, arms: f >= T.dotPoint ? 'reachR' : 'down', m: 'grin', brow: 'up', look: [1, 0], blink: blinkAt(f, 50)});
  w += crumbs([[dx + 3, 395 - 38 * DS + 14 * DS], [dx - 3, 396 - 38 * DS + 15 * DS]]);
  w += snowfall(f, 30, 0.85);
  const sk = shake(f, T.qPoint, 6, 2.5);
  return camG(w, {k: 1.3 + io(f, [T.cutWide, T.cutTop], 0, 0.06), fx: 122 + sk, fy: 334, sx: 135, sy: 236});
}

// 2) Tampak atas: jejak di salju. Snick (kaca pembesar) menelusuri alur gelinding ke semak; Dot diam-diam menjauh.
function topView(f: number) {
  let w = topYard() + topTracks() + topPine(236, 118, 34) + topPine(232, 404, 38) + topPine(14, 340, 30) + topBush(50, 112) + topSnowman();
  const p1 = io(f, [T.snickWalk[0], T.snickWalk[0] + 16], 0, 1), p2 = io(f, [T.snickWalk[0] + 16, T.snickWalk[1]], 0, 1);
  const sx = p2 > 0 ? 128 + (74 - 128) * p2 + Math.sin(p2 * 3) * 6 : 182 + (128 - 182) * p1, sy = p2 > 0 ? 226 + (154 - 226) * p2 : 268 + (226 - 268) * p1;
  const bob = within(f, T.snickWalk) ? Math.abs(Math.sin(f * 0.6)) * 1.5 : 0;
  // Quibble mengikuti
  const qp = io(f, T.qFollow, 0, 1), qx = 100 + (112 - 100) * qp, qy = 292 + (210 - 292) * qp;
  const qLook = within(f, [T.qLookDot, T.qLookDot + 18]) ? [1, 0.9] : [(sx - qx) / 60, (sy - qy) / 60];
  w += topChar('q', qx, qy, 0.5, {look: qLook.map(v => Math.max(-1, Math.min(1, v))), brow: within(f, [T.qLookDot, T.qLookDot + 18]) ? 'angry' : 'flat', m: 'frown', blink: blinkAt(f, 7)});
  // Dot menjauh pelan sambil bersiul
  const dp = io(f, T.whistle, 0, 1, Easing.linear), dx = 170 + 26 * dp, dy = 316 + 22 * dp;
  w += topChar('d', dx, dy, 0.5, {look: [-0.6, -0.6], brow: f >= T.qLookDot ? 'sad' : 'up', m: f >= T.whistle[0] ? 'o' : 'smile', rot: dp * 40, blink: blinkAt(f, 23)});
  if (f >= T.whistle[0]) for (let i = 0; i < 2; i++) { const t = ((f - T.whistle[0]) / 20 + i / 2) % 1; w += `<g opacity="${(1 - t).toFixed(2)}">${note(dx + 14 + t * 12, dy - 12 - t * 18, 0.7, 10)}</g>`; }
  if (f >= T.qLookDot && f < T.whistle[1]) w += P.sweat(dx - 16, dy - 10);
  // Snick
  const pointing = f >= T.snickPoint && f < T.snickPoint + 14;
  w += topChar('s', sx, sy - bob, 0.5, {look: [-0.6, -0.6], brow: pointing ? 'up' : 'flat', m: pointing ? 'grin' : 'smile', arm: 1, blink: blinkAt(f, 3)});
  w += `<g transform="translate(${sx - 26},${sy - 18 - bob})">${lensIcon(1)}</g>`;
  if (pointing) w += P.sparkle(96, 192) ;
  w += snowfall(f, 22, 0.75);
  return camG(w, {k: io(f, [90, 156], 1.05, 1.55), fx: io(f, [90, 156], 140, 84), fy: io(f, [90, 156], 248, 168), sx: 135, sy: 236});
}

// 3) POV Snick lewat kaca pembesar: alur + remah wortel -> semak -> kelinci salju mengunyah wortel -> Dot di balik semak
function pov(f: number) {
  const shk = f >= T.rustle && f < T.bunnyPop ? f - T.rustle + 1 : 0;
  let w = winter(0) + snowman(SMX, 400, QS, {nose: 'none'});
  w += `<path d="M140,401 C110,404 80,404 50,401" fill="none" stroke="#B9CCE4" stroke-width="3" stroke-linecap="round"/>` + crumbs([[126, 401], [104, 402.5], [84, 402.5], [66, 401.5]]);
  // Dot mengintip di balik semak (ujung lilac terlihat sejak awal)
  const rise = io(f, [T.dotRise, T.dotRise + 6], 0, 26, Easing.out(Easing.back(2)));
  w += dot(80, 400 - rise, DS, {brow: f >= T.dotRise ? 'sad' : 'up', m: f >= T.dotRise ? 'grin' : 'smile', look: f >= T.dotRise ? [-0.8, 0] : [-1, 0], arms: f >= T.dotRise ? 'reachR' : 'down', blink: blinkAt(f, 9),
    hold: f >= T.dotRise ? `<g transform="translate(-4,6)">${carrot(0, 0, 1.4, -30, 1)}</g>` : ''});
  if (f >= T.dotRise) w += crumbs([[79, 400 - rise - 13], [84, 400 - rise - 12]]) + P.sweat(98, 372 - rise);
  w += bush(40, 400, 1, shk);
  if (shk) for (let i = 0; i < 4; i++) w += `<circle cx="${24 + i * 10}" cy="${372 + ((shk * 3 + i * 7) % 26)}" r="1.6" fill="#fff" stroke="${C.ink}" stroke-width=".6"/>`;
  if (f >= T.bunnyPop) {
    const bsq = f < T.bunnyPop + 8 ? 1 + 0.25 * Math.sin((f - T.bunnyPop) / 8 * Math.PI) : 1;
    const bite = f >= T.chomp[3] ? 0.8 : f >= T.chomp[2] ? 0.6 : f >= T.chomp[1] ? 0.4 : f >= T.chomp[0] ? 0.2 : 0;
    const chew = T.chomp.some(c => f >= c && f < c + 3) ? 1 : 0.3 + 0.3 * Math.sin(f * 1.3);
    w += bunny(32, 372 + (f < T.bunnyPop + 3 ? 10 - (f - T.bunnyPop) * 3 : 0), 0.6, {chew, ear: Math.sin(f * 0.5) * 0.5, sq: bsq, blink: blinkAt(f, 40), hold: carrot(0, 0, 0.9, 6, bite)});
    if (f < T.bunnyPop + 8) w += [0, 1, 2, 3, 4].map(i => { const a = -Math.PI * (0.1 + i * 0.2), r = 30 + (f - T.bunnyPop) * 1.5; return L(32 + Math.cos(a) * r, 352 + Math.sin(a) * r, 32 + Math.cos(a) * (r + 6), 352 + Math.sin(a) * (r + 6), 1.6); }).join('');
    if (T.chomp.some(c => f >= c && f < c + 4)) w += crumbs([[48, 346 - (f % 4)], [52, 350 - (f % 3) * 1.5], [45, 352]]);
  }
  w += snowfall(f, 26, 0.85);
  const zp = io(f, [T.povDot[0], T.povDot[1]], 0, 1);
  const fx = f < T.povDot[0] ? io(f, T.povPan, 150, 46) : 46 + 34 * zp, fy = f < T.povDot[0] ? io(f, T.povPan, 392, 378) : 378 - 14 * zp;
  const k = 2.6 + 0.15 * zp + (f >= T.dotRise ? 0.2 * Easing.out(Easing.back(3))(Math.min(1, (f - T.dotRise) / 5)) : 0);
  const jx = Math.sin(f * 0.21) * 2 + shake(f, T.bunnyPop, 8, 4), jy = Math.cos(f * 0.17) * 2;
  return camG(w, {k, fx: fx + jx, fy: fy + jy, sx: 135, sy: 226}) + magnifier(135 + jx * 0.6, 226 + jy * 0.6, 108);
}

// 4) Pengungkapan + 5) malam -> pagi (siklus alami menuju hook)
function reveal(f: number) {
  const n = f < T.dawn[0] ? io(f, T.night, 0, 1) : io(f, T.dawn, 1, 0.15);
  const poked = f >= T.poke, stolen = f >= T.bite;
  let w = winter(n) + bush(12, 400, 0.9, within(f, [T.bunnyIn[0] - 6, T.bunnyIn[0]]) || within(f, [T.bunnyOut[1], T.bunnyOut[1] + 6]) ? (f % 6) + 1 : 0);
  w += snowman(SMX, 400, QS, {nose: poked && !stolen ? 'pop' : 'none'});
  if (within(f, [T.poke, T.poke + 10])) w += P.sparkle(162, 312 - (f - T.poke) * 0.6) + P.sparkle(132, 302);
  // kelinci: mengunyah sisa wortel, lompat ke semak; malam kembali mencuri es loli
  if (f < T.exit[0] + 8) {
    const bite = io(f, [T.cutReveal, T.qSorry + 4], 0.8, 1), hop = f >= T.cheer ? Math.abs(Math.sin((f - T.cheer) * 0.4)) * 8 : 0;
    w += bunny(26, 400 - hop, 0.55, {chew: 0.3 + 0.4 * Math.abs(Math.sin(f * 0.9)), ear: Math.sin(f * 0.4) * 0.4, blink: blinkAt(f, 17), hold: bite < 1 ? carrot(0, 0, 0.9, 6, bite) : ''});
  } else if (within(f, [T.bunnyIn[0], T.bunnyOut[1]])) {
    let bx: number, by: number, flip = false, hold = '';
    if (f < T.bunnyIn[1]) { const p = (f - T.bunnyIn[0]) / (T.bunnyIn[1] - T.bunnyIn[0]); bx = 18 + 146 * p; by = 400 - Math.abs(Math.sin(p * Math.PI * 3)) * 14; }
    else if (f < T.bite) { const p = (f - T.bunnyIn[1]) / (T.bite - T.bunnyIn[1]); bx = 164; by = 400 - Math.sin(p * Math.PI / 2) * 65.4; flip = true; }
    else if (f < T.bunnyOut[0]) { bx = 164; by = 334.6 + ((f - T.bite) / 4) * 65.4 * ((f - T.bite) / 4); flip = true; }
    else { const p = (f - T.bunnyOut[0]) / (T.bunnyOut[1] - T.bunnyOut[0]); bx = 164 - 160 * p; by = 400 - Math.abs(Math.sin(p * Math.PI * 3)) * 14; flip = true; }
    if (stolen) hold = popsicle(0, 0, 0.62 / 0.55, 90);
    w += shadow(bx, 400, 22, 0.8) + bunny(bx, Math.min(400, by), 0.55, {flip, chew: stolen ? 0.8 : 0.3, ear: 0.6, hold});
  }
  // Dot
  if (f < T.exit[1]) {
    const ex = io(f, T.exit, 52, -60, Easing.in(Easing.quad)), cheer = f >= T.cheer && f < T.exit[0];
    w += shadow(ex, 400, 30) + dot(ex, 400 - (cheer ? Math.abs(Math.sin((f - T.cheer) * 0.4)) * 6 : 0), DS, {
      brow: f < T.cheer ? 'sad' : 'up', m: 'grin', arms: cheer ? 'up' : f < T.qSorry ? 'reachR' : 'down', look: f < T.reveal ? [-0.5, 0] : [1, -0.3],
      roll: f >= T.exit[0] ? (52 - ex) * -4 : 0, blink: blinkAt(f, 31), hold: f < T.cheer ? `<g transform="translate(-4,6)">${carrot(0, 0, 1.4, -30, 1)}</g>` : ''});
    if (f < T.cheer) w += crumbs([[ex - 1, 386], [ex + 4, 387]]);
  }
  // Quibble: kaget -> minta maaf ke Snick -> bersorak -> pergi; pagi kembali masuk dari kiri
  if (f < T.exit[1]) {
    const ex = io(f, T.exit, 92, -60, Easing.in(Easing.quad)), walking = f >= T.exit[0];
    const o: any = f < T.qSorry ? {brow: 'up', m: 'o', look: [-1, 0]} : f < T.cheer ? {brow: 'sad', m: 'wavy', look: [1, 0], squash: 0.94} : {brow: 'up', m: 'grin', arms: walking ? 'down' : 'up', look: [1, -0.4]};
    o.blink = blinkAt(f, 5);
    if (walking) o.legs = 'none';
    w += shadow(ex, 400, 46) + q(ex, 400 - (f >= T.cheer && !walking ? Math.abs(Math.sin((f - T.cheer) * 0.35)) * 5 : 0), QS, o) + (walking ? runLegs(ex, 400, f * 0.7, QS) : '');
    if (within(f, [T.qSorry, T.reveal])) w += P.sweat(113, 334);
  } else if (f >= T.qIn[0]) {
    const qx = io(f, T.qIn, -40, 92, Easing.out(Easing.quad)), walking = f < T.qIn[1] - 3;
    w += shadow(qx, 400, 46) + q(qx, 400 - (walking ? Math.abs(Math.sin(f * 0.35)) * 2 : 0), QS, {brow: 'up', m: 'smile', look: [0, 0], legs: walking ? 'none' : 'stand', blink: f >= 387 && f < 390}) + (walking ? runLegs(qx, 400, f * 0.5, QS, 0.7) : '');
  }
  // Snick: tersinggung -> ungkap es loli -> jilat -> lompat pasang jadi hidung -> pose menang -> pergi
  if (f < T.exit[1]) {
    let sx = 188, sy = 400, hold = '';
    const ps = within(f, [T.lick, T.lick + 10]) ? `<g transform="translate(26,4) rotate(-25)">${popsicle(0, 0, 0.62)}</g>` : popsicle(0, 0, 0.62, f >= T.jump[0] ? io(f, T.jump, 0, 90) : 0);
    if (f >= T.reveal && f < T.poke) hold = ps;
    if (within(f, T.jump)) { const p = (f - T.jump[0]) / (T.jump[1] - T.jump[0]); sx = 188 + (168.1 - 188) * p; sy = 400 - Math.sin(p * Math.PI / 2) * 53.9; }
    else if (within(f, [T.poke, T.snickLand])) { const p = (f - T.poke) / (T.snickLand - T.poke); sx = 168.1 + (188 - 168.1) * p; sy = 346.1 + 53.9 * p * p; }
    if (f >= T.exit[0]) sx = io(f, T.exit, 188, 300, Easing.in(Easing.quad));
    const so: any = f < T.qSorry ? {brow: 'angry', m: 'frown', look: [-1, 0]} : f < T.reveal ? {brow: 'smug', m: 'flat', look: [-1, 0], arms: 'down'} :
      f < T.jump[0] ? {brow: 'smug', m: within(f, [T.lick, T.lick + 10]) ? 'o' : 'grin', look: [-0.6, -0.4]} : f < T.snickLand ? {brow: 'up', m: 'grin', look: [-1, 0], arms: 'up'} : {brow: 'smug', m: 'grin', arms: 'wave', look: [0, 0]};
    so.blink = blinkAt(f, 21); so.hold = hold;
    if (sy >= 399) w += shadow(sx, 400, 40); else w += shadow(sx, 400, 40 * (1 - (400 - sy) / 120), 0.7);
    w += snick(sx, sy, SS, so);
    if (within(f, [T.snickLand, T.exit[0]])) w += P.sparkle(sx + 30, 330 + Math.sin(f * 0.3) * 3);
    if (within(f, [T.reveal, T.reveal + 8])) w += P.sparkle(sx - 30, 340 - (f - T.reveal));
  }
  w += nightTint(n) + snowfall(f, 30, 0.85);
  const sk = shake(f, T.poke, 8, 4);
  const pk = io(f, [380, 396], 0, 1);
  return camG(w, {k: 1.3 + pk * 1.05, fx: 122 + (119 - 122) * pk + sk, fy: 334 - 4 * pk, sx: 135, sy: 236});
}

export const EP11: React.FC = () => {
  const F = useCurrentFrame();
  let f = F;
  for (const at of [T.bunnyPop, T.poke] as number[]) f = hold2(f, at);
  const n = f >= T.cutReveal && f < T.loopCU[0] ? (f < T.dawn[0] ? io(f, T.night, 0, 1) : io(f, T.dawn, 1, 0.15)) : (f >= T.loopCU[0] ? 0.15 * (-runF(f) / 24) : 0);
  const svg = f < T.cutWide || f >= T.loopCU[0] ? closeUp(f) : f < T.cutTop ? accuse(f) : f < T.cutPov ? topView(f) : f < T.cutReveal ? pov(f) : reveal(f);
  return (
    <AbsoluteFill style={{backgroundColor: '#DDEBF7'}}>
      <svg viewBox="0 0 270 480" width={1080} height={1920} dangerouslySetInnerHTML={{__html: defs + snowDefs(n) + svg + vignette}} />
      <Audio src={staticFile('ep11.wav')} />
    </AbsoluteFill>
  );
};
