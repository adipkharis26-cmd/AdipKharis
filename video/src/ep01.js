// Ep.01 "Lembur Tiap Hari, Yang Naik Jabatan Malah Dia" — full timeline synced to VO word timings
const WORDS = VO.words;
const DURATION = Math.round((VO.duration + 0.65) * 10) / 10;

// ── VO timing helpers ─────────────────────────────────────────
const norm = s => s.toLowerCase().replace(/[^a-z0-9-]/g, '');
function at(txt, n = 0) {
  let c = 0;
  for (const w of WORDS) if (norm(w.w) === norm(txt)) { if (c === n) return w.s; c++; }
  throw new Error('VO word not found: ' + txt + ' #' + n);
}
function atEnd(txt, n = 0) {
  let c = 0;
  for (const w of WORDS) if (norm(w.w) === norm(txt)) { if (c === n) return w.e; c++; }
  throw new Error('VO word not found: ' + txt + ' #' + n);
}
const NSEC = Math.max(...WORDS.map(w => w.sec)) + 1;
const secS = [...Array(NSEC)].map((_, i) => WORDS.find(w => w.sec === i).s);
const secE = [...Array(NSEC)].map((_, i) => WORDS.filter(w => w.sec === i).pop().e);
const CUT = [0, ...secS.slice(1).map((s, i) => (secE[i] + s) / 2), DURATION];

// captions: chunks break on punctuation or every 3 words
const CHUNKS = [];
{ let cur = []; WORDS.forEach(w => { cur.push(w); if (/[.,?!…:]["”]?$/.test(w.w) || cur.length === 3) { CHUNKS.push(cur); cur = []; } }); if (cur.length) CHUNKS.push(cur); }
function voCaption(t, y) {
  let ci = -1;
  for (let i = 0; i < CHUNKS.length; i++) if (t >= CHUNKS[i][0].s - 0.05) ci = i;
  if (ci < 0) return;
  const ch = CHUNKS[ci], last = ch[ch.length - 1];
  if (t > last.e + 0.4 && !(CHUNKS[ci + 1] && t >= CHUNKS[ci + 1][0].s - 0.05)) return;
  caption(ch.map(w => [w.w, w.s, w.e]), t, y);
}

// ── camera & grading ──────────────────────────────────────────
function camera(zoom, cx, cy, shx, shy) { g.setTransform(zoom, 0, 0, zoom, (1 - zoom) * cx + (shx || 0), (1 - zoom) * cy + (shy || 0)); }
function cam(zoom, fx, fy, shx, shy) { g.setTransform(zoom, 0, 0, zoom, 540 - fx * zoom + (shx || 0), 960 - fy * zoom + (shy || 0)); }
function gradeMul(r, gg, b, a) {
  if (a <= 0) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply';
  g.fillStyle = `rgb(${Math.round(lerp(255, r, a))},${Math.round(lerp(255, gg, a))},${Math.round(lerp(255, b, a))})`;
  g.fillRect(0, 0, W, H); g.restore();
}
function glowAt(x, y, r, rgb, a) {
  g.save(); g.globalCompositeOperation = 'lighter';
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); g.restore();
}
const copyCv = document.createElement('canvas'); copyCv.width = W; copyCv.height = H;
function sepia(t) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  copyCv.getContext('2d').drawImage(cv, 0, 0);
  g.filter = 'sepia(0.85) contrast(1.05) brightness(1.02)'; g.drawImage(copyCv, 0, 0); g.filter = 'none';
  for (let i = 0; i < 70; i++) { const k = Math.floor(t * 24); g.fillStyle = `rgba(60,40,20,${0.25 * rnd(i + k * 7)})`; g.fillRect(rnd(i * 3 + k) * W, rnd(i * 5 + k * 3) * H, 3, 3); }
  if (rnd(Math.floor(t * 24)) > 0.7) { g.fillStyle = 'rgba(60,40,20,0.25)'; g.fillRect(rnd(Math.floor(t * 24) + 1) * W, 0, 2, H); }
  g.fillStyle = `rgba(255,240,210,${0.04 * rnd(Math.floor(t * 24) + 5)})`; g.fillRect(0, 0, W, H);
  g.restore();
}

// ── extra props ───────────────────────────────────────────────
const DDESK = { x1: -2.6, x2: -1.25, y: 0.75, z: 3.4, d: 0.6 };
function withDesk(D, fn, cols) {
  const save = { ...DESK }, st = C.teal, sd = C.tealD, sw = C.wood;
  Object.assign(DESK, D);
  if (cols) { C.teal = cols[0]; C.tealD = cols[1]; C.wood = cols[2] || C.wood; }
  fn();
  Object.assign(DESK, save); C.teal = st; C.tealD = sd; C.wood = sw;
}
function drawLaptop(X, Z, open) {
  poly([P(X - 0.2, DDESK.y + 0.015, Z + 0.25), P(X + 0.2, DDESK.y + 0.015, Z + 0.25), P(X + 0.2, DDESK.y + 0.015, Z), P(X - 0.2, DDESK.y + 0.015, Z)], '#c9cfdc', C.ol, 3);
  const h = 0.27 * open;
  if (h > 0.01) {
    const [x, y, w, hh] = frontRect(X - 0.2, DDESK.y + 0.02, X + 0.2, DDESK.y + 0.02 + h, Z + 0.25);
    rr(x, y, w, hh, 6); g.fillStyle = '#8e97ad'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
    circ(x + w / 2, y + hh / 2, Math.min(w, hh) * 0.1, '#dfe4ee');
  }
}
function drawPaper(x, y, s, label, col) {
  g.save(); g.translate(x, y); g.rotate(-0.08);
  rr(-0.2 * s, -0.27 * s, 0.4 * s, 0.3 * s, 6); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
  if (label) { g.fillStyle = col || C.red; g.font = `900 ${Math.round(0.055 * s)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, 0, -0.2 * s); }
  g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 3;
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-0.15 * s, -0.12 * s + i * 0.045 * s); g.lineTo(0.15 * s, -0.12 * s + i * 0.045 * s); g.stroke(); }
  g.restore();
}
function drawEnvelope(x, y, s, label, rot) {
  g.save(); g.translate(x, y); g.rotate(rot || 0);
  rr(-0.2 * s, -0.13 * s, 0.4 * s, 0.26 * s, 6); g.fillStyle = '#F7E2A8'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
  g.beginPath(); g.moveTo(-0.2 * s, -0.13 * s); g.lineTo(0, 0.02 * s); g.lineTo(0.2 * s, -0.13 * s); g.stroke();
  if (label) { g.fillStyle = C.red; g.font = `900 ${Math.round(0.07 * s)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, 0, 0.07 * s); }
  g.restore();
}
function sweat(x, y, r) {
  g.beginPath(); g.moveTo(x, y - r * 1.6); g.quadraticCurveTo(x + r, y - r * 0.2, x, y + r); g.quadraticCurveTo(x - r, y - r * 0.2, x, y - r * 1.6);
  g.fillStyle = '#7fd3ff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 3; g.stroke();
}
function steam(x, y, t, s) {
  for (let i = 0; i < 4; i++) {
    const q = (t * 1.6 + i / 4) % 1;
    circ(x + Math.sin(i * 2 + t * 5) * 0.08 * s, y - q * 0.45 * s, (0.05 + q * 0.07) * s, `rgba(255,255,255,${0.85 * (1 - q)})`);
  }
}
function crack(hx, hy, hr, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.strokeStyle = C.ol; g.lineWidth = 5; g.lineJoin = 'miter';
  g.beginPath(); g.moveTo(hx + hr * 0.1, hy - hr);
  [[0.0, -0.7], [0.18, -0.45], [-0.05, -0.2], [0.15, 0.05]].forEach(([dx, dy]) => g.lineTo(hx + dx * hr, hy + dy * hr));
  g.stroke(); g.beginPath(); g.moveTo(hx + 0.18 * hr, hy - 0.45 * hr); g.lineTo(hx + 0.4 * hr, hy - 0.55 * hr); g.stroke();
  g.restore();
}
function pop(t, t0, d) { return back(seg(t, t0, t0 + (d || 0.3))); }
function topLines(lines, t, y0) {
  let y = y0 || 250;
  lines.forEach(L => {
    if (t >= L.t) {
      const sc = pop(t, L.t, 0.28), size = fitSize(L.txt, L.size || 84, W - 120);
      g.save(); g.translate(W / 2 + (L.shake ? Math.sin(t * 40) * 4 : 0), y); g.scale(sc, sc);
      strokeText(L.txt, 0, 0, size, L.col || '#fff'); g.restore();
    }
    y += (L.size || 84) * 1.18;
  });
}
function typingHands(t, fast) {
  const f = fast ? 2 : 1;
  const k = Math.abs(Math.sin(t * 17 * f)) * 0.03, k2 = Math.abs(Math.cos(t * 15 * f)) * 0.03;
  return { l: P(-0.2, DESK.y + 0.05 + k, 3.68), r: P(0.06, DESK.y + 0.05 + k2, 3.68) };
}
function drawTrophy(x, y, s) {
  g.save(); g.translate(x, y);
  g.beginPath(); g.moveTo(-0.17 * s, -0.16 * s); g.lineTo(0.17 * s, -0.16 * s); g.quadraticCurveTo(0.16 * s, 0.08 * s, 0, 0.1 * s); g.quadraticCurveTo(-0.16 * s, 0.08 * s, -0.17 * s, -0.16 * s);
  g.fillStyle = C.gold; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 5; g.stroke();
  [-1, 1].forEach(sd => { g.beginPath(); g.arc(sd * 0.18 * s, -0.08 * s, 0.07 * s, sd > 0 ? -Math.PI / 2 : Math.PI / 2, sd > 0 ? Math.PI / 2 : Math.PI * 1.5); g.stroke(); });
  g.fillStyle = C.gold; g.fillRect(-0.03 * s, 0.1 * s, 0.06 * s, 0.08 * s); g.strokeRect(-0.03 * s, 0.1 * s, 0.06 * s, 0.08 * s);
  rr(-0.11 * s, 0.18 * s, 0.22 * s, 0.07 * s, 4); g.fillStyle = '#8a5a2b'; g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(-0.1 * s, -0.12 * s, 0.04 * s, 0.14 * s);
  g.restore();
}
function walkPath(pts, q) {
  const segs = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(d); tot += d; }
  let r = clamp(q, 0, 1) * tot;
  for (let i = 0; i < segs.length; i++) { if (r <= segs[i]) { const k = r / segs[i]; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; } r -= segs[i]; }
  return pts[pts.length - 1];
}
// Kharis at his desk (the recurring office set). Returns his style object.
function kharisDesk(t, o) {
  const kz = 4.25, [kx, ky] = P(-0.05, 0, kz), ks = S(kz);
  drawChairBack(-0.05, kz + 0.15);
  const st = Object.assign({ pose: 'sit', exp: 'tired', look: [-1, 0.4], armsLater: true, t, hairDroop: 0.6, arms: typingHands(t, o && o.fast) }, o || {});
  drawChar('kharis', kx, ky, ks, st);
  drawDeskTop(); drawMonitor(false); drawKeyboard();
  if (o && o.revisi) { const [mx, my] = P(-0.55, 1.12, 3.58); const sc = pop(t, o.revisi, 0.3); if (sc > 0) { g.save(); g.translate(mx, my); g.rotate(0.12); g.scale(sc, sc); g.fillStyle = C.yellow; g.fillRect(-70, -50, 140, 100); g.strokeStyle = C.ol; g.lineWidth = 4; g.strokeRect(-70, -50, 140, 100); g.fillStyle = C.red; g.font = `900 32px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('REVISI!', 0, 2); g.restore(); } }
  drawArms('kharis', ks, st);
  return st;
}

// ═════════════════════ SCENE 1 — HOOK ═════════════════════
const T_P = at('Tapi') - 0.25;
function s1Night(t) {
  camera(1.36 + 0.1 * (t / T_P), 470, 960);
  drawRoom(); drawWindow(true); drawWhiteboard(); drawClock(21.02, false); drawDoor(0); drawCabinet(); drawFloorPlant();
  const st = kharisDesk(t, { headDy: Math.max(0, Math.sin(t * 2.6 - 1)) * 0.035, hairDroop: 0.55 });
  drawMug(0.32, 3.42, '#E84545'); drawMug(0.44, 3.56, '#F5C451'); drawMug(0.2, 3.33, '#7FB6F0');
  drawDeskFront(); drawLamp(false);
  nightGrade(1);
  const [mx, my] = P(-0.4, 1.1, 3.6); glowAt(mx, my, 620, '110,200,255', 0.55 + 0.06 * Math.sin(t * 9));
  const [cx, cy] = P(1.02, 2.4, ZB); glowAt(cx, cy, 140, '255,90,80', 0.5 + 0.2 * Math.sin(t * 6));
  const lp = P(-0.55, 2.4, 3.4); glowAt(lp[0], lp[1], 380, '255,220,150', 0.18);
  glowAt(st._head[0], st._head[1], 230, '150,215,255', 0.28);
}
function s1Promo(l) {
  const punch = 1 - easeOut(seg(l, 0, 0.35));
  camera(1.28 + 0.05 * l / 3 + 0.12 * punch, 300, 1010);
  drawRoom(); drawWindow(false); drawBanner('SELAMAT, DIMAS!'); drawClock(10, false); drawDoor(0); drawCabinet(); drawFloorPlant();
  const [kx, ky] = P(-1.0, 0, 5.0);
  drawChar('kharis', kx, ky, S(5.0), { exp: 'shock', look: [1, 0], t: l, arms: { l: 'down', r: 'down' } });
  strokeText('?!', kx + 0.45 * S(5.0), ky - 2.0 * S(5.0) - Math.sin(l * 8) * 6, 70, C.red);
  const [bx, by] = P(0.95, 0, 3.9);
  drawChar('bos', bx, by, S(3.9), { exp: 'happy', look: [-1, 0], t: l, arms: { l: 'clap', r: 'clap' } });
  const dz = 3.25, ds = S(dz), jump = Math.abs(Math.sin(l * 6.5)) * 0.07 * ds, [dx, dy] = P(-0.15, 0, dz);
  spotlight(dx, dy - 0.9 * ds, 1.4 * ds, 0.35);
  const st = { exp: 'proud', look: [0, -1], t: l, arms: { l: 'up', r: 'up' } };
  drawChar('dimas', dx, dy - jump, ds, st);
  const [hx, hy, hr] = st._head; drawTrophy(hx, hy - hr - 0.2 * ds, ds);
  confetti(l + 1, 70);
}

// ═════════════════════ SCENE 2 — "SIAP, PAK!" ═════════════════════
const S2 = {
  throw: at('tolong') - 0.3, salute: at('Siap') - 0.12, kerjaan: at('Kerjaan'), revisi: at('Revisi'), kerjakan: at('kerjakan'),
};
S2.land = S2.throw + 0.5;
S2.drops = [S2.kerjaan + 0.05, S2.kerjaan + 0.35, at('Dia', 0), at('Dia', 0) + 0.3];
function folderCount(t) {
  let n = 0, shake = 0, falling = null;
  if (t >= S2.land) { n = 4; shake = 1 - seg(t, S2.land, S2.land + 0.2); }
  S2.drops.forEach(d => {
    if (t >= d + 0.25) { n += 2; shake = Math.max(shake, 0.5 * (1 - seg(t, d + 0.25, d + 0.4))); }
    else if (t >= d) falling = { p: easeOut(seg(t, d, d + 0.25)) ** 2, base: n };
  });
  return { n, shake, falling };
}
function scene2(t) {
  const l = t - CUT[1];
  const { n, shake, falling } = folderCount(t);
  const shx = Math.sin(t * 90) * 14 * shake, shy = Math.cos(t * 70) * 10 * shake;
  camera(1.3 + 0.06 * l / 9 + 0.1 * (1 - easeOut(seg(l, 0, 0.3))), 600, 990, shx, shy);
  const night = ease(seg(t, S2.revisi - 0.2, S2.revisi + 1.0));
  const hours = lerp(10, 21, ease(seg(t, S2.revisi - 0.2, S2.revisi + 0.9)));
  const bosOut = S2.kerjaan + 1.0;
  const doorOpen = t < bosOut + 0.1 ? ease(seg(l, 0, 0.3)) : 1 - ease(seg(t, bosOut + 0.1, bosOut + 0.4));
  drawRoom(); drawWindow(night > 0.5); drawWhiteboard(); drawClock(hours, false); drawDoor(doorOpen); drawCabinet(); drawFloorPlant();

  const saluting = t >= S2.salute && t < S2.kerjaan;
  const droop = ease(seg(t, S2.kerjaan, S2.kerjakan)) * 0.9;
  const kexp = t < S2.salute ? 'neutral' : saluting ? 'salute' : (t < S2.revisi ? 'shock' : 'tired');
  const kst = kharisDesk(t, { exp: kexp, look: t < S2.kerjaan ? [1, 0] : [-1, 0.3], hairDroop: droop, fast: t > S2.kerjakan,
    arms: saluting ? { l: P(-0.15, DESK.y + 0.05, 3.7), r: 'salute' } : typingHands(t, t > S2.kerjakan), revisi: S2.revisi + 0.15 });
  drawStack(n, 1);
  if (falling) { const top = DESK.y + falling.base * 0.035; for (let k = 0; k < 2; k++) drawFolder(0.24, 0.56, top + k * 0.035 + (1 - falling.p) * 1.6, 3.48, FOLD_COL[(falling.base + k) % 6], (1 - falling.p) * 0.5); }
  drawMug(0.42, 3.3, '#E84545');
  drawDeskFront();

  // Bos walks in, throws folders, leaves
  if (t < bosOut) {
    const A = [1.42, 3.95], B = [0.9, 3.62];
    let p, walking;
    if (t < S2.throw - 0.1) { p = ease(seg(t, CUT[1], S2.throw - 0.1)); walking = p < 1; }
    else if (t < S2.kerjaan) { p = 1; walking = false; }
    else { p = 1 - ease(seg(t, S2.kerjaan, bosOut)); walking = true; }
    const X = lerp(A[0], B[0], p), Z = lerp(A[1], B[1], p), [bx, by] = P(X, 0, Z), bs = S(Z);
    const holding = t < S2.throw, throwing = t >= S2.throw && t < S2.throw + 0.35;
    drawChar('bos', bx, by, bs, { pose: walking ? 'walk' : 'stand', t, exp: t > S2.salute ? 'happy' : 'neutral', look: [-1, 0],
      arms: holding ? { l: [bx - 0.12 * bs, by - 1.0 * bs], r: [bx + 0.05 * bs, by - 1.0 * bs] } : throwing ? { l: 'up', r: 'up' } : { l: 'hip', r: 'hip' } });
    if (holding) for (let k = 0; k < 4; k++) drawFolder(X - 0.2, X + 0.08, 1.0 + k * 0.035, Z - 0.3, FOLD_COL[k], 0);
  }
  if (t >= S2.throw && t < S2.land) {
    const q = seg(t, S2.throw, S2.land), fx = lerp(0.8, 0.4, q), fz = lerp(3.32, 3.48, q), fy = lerp(1.2, DESK.y, q) + Math.sin(q * Math.PI) * 0.7;
    for (let k = 0; k < 4; k++) drawFolder(fx - 0.16, fx + 0.16, fy + k * 0.035, fz, FOLD_COL[k], q * 3);
  }
  [S2.land, ...S2.drops.map(d => d + 0.25)].forEach(d => {
    const q = seg(t, d, d + 0.35); if (q <= 0 || q >= 1) return;
    const [px, py] = P(0.4, DESK.y, 3.48);
    for (let i = 0; i < 6; i++) { const a = Math.PI + i / 5 * Math.PI; circ(px + Math.cos(a) * 120 * q, py + Math.sin(a) * 40 * q - 10, 16 * (1 - q), `rgba(255,255,255,${0.8 * (1 - q)})`); }
  });
  drawLamp(night > 0.5);
  nightGrade(night);
  if (night > 0) {
    const [mx, my] = P(-0.4, 1.1, 3.6); glowAt(mx, my, 620, '110,200,255', 0.55 * night);
    const [cx, cy] = P(1.02, 2.4, ZB); glowAt(cx, cy, 140, '255,90,80', 0.5 * night);
    glowAt(kst._head[0], kst._head[1], 230, '150,215,255', 0.28 * night);
  }
  const [hx, hy, hr] = kst._head;
  const bsc = t < S2.salute ? 0 : t < S2.kerjaan ? back(seg(t, S2.salute, S2.salute + 0.25)) : 1 - ease(seg(t, S2.kerjaan, S2.kerjaan + 0.2));
  bubble(hx + 250, hy - hr - 150, 'SIAP, PAK!', bsc, hx + 70, hy - hr * 0.8);
  if (t > S2.kerjakan) { strokeText('!!', hx - hr * 1.3, hy - hr * 1.1 + Math.sin(t * 10) * 5, 80, C.red); steam(hx + hr * 0.9, hy - hr * 0.7, t, S(4.25)); }
}

// ═════════════════════ SCENE 3 — DIMAS PULANG JAM 5 ═════════════════════
const S3 = { dimas: at('Dimas', 0), teng: at('lima', 1), tutup: at('tutup'), laptop: atEnd('laptop.'), geleng: at('Kharis', 2), santai: at('Santai') };
S3.stand = S3.laptop + 0.05; S3.walkEnd = S3.santai + 0.7;
const DIMAS_PATH = [[-1.92, 4.0], [-1.1, 2.95], [1.0, 2.95], [1.42, 3.85]];
function dimasDeskSet(t, seated, open) {
  const dz = 4.15, [dx, dy] = P(-1.92, 0, dz), ds = S(dz);
  let st = null;
  if (seated) {
    drawChairBack(-1.92, dz + 0.15);
    st = { pose: 'sit', exp: t > S3.tutup ? 'happy' : 'neutral', look: [0, 0.4], armsLater: true, t,
      arms: open > 0.9 ? { l: P(-2.08, DDESK.y + 0.05 + Math.abs(Math.sin(t * 16)) * 0.03, 3.55), r: P(-1.78, DDESK.y + 0.05 + Math.abs(Math.cos(t * 14)) * 0.03, 3.55) } : { l: P(-2.15, DDESK.y + 0.3, 3.6), r: P(-1.7, DDESK.y + 0.3, 3.6) } };
    drawChar('dimas', dx, dy, ds, st);
  }
  withDesk(DDESK, () => {
    drawDeskTop();
    drawLaptop(-1.92, 3.5, open);
    drawMug(-1.45, 3.5, '#9ED6A0');
    if (st) drawArms('dimas', ds, st);
    drawDeskFront();
  });
  return st;
}
function scene3(t) {
  const l = t - CUT[2];
  const toDimas = ease(seg(t, CUT[2], S3.dimas + 0.7)), back2 = ease(seg(t, S3.stand + 0.6, S3.geleng + 0.3));
  const fx = lerp(lerp(470, 160, toDimas), 470, back2);
  cam(1.32, fx, 980);
  const hours = t < S3.teng ? 16 + 59 / 60 + (t - CUT[2]) * 0.002 : 17 + (t - S3.teng) * 0.004;
  const walkQ = seg(t, S3.stand + 0.3, S3.walkEnd);
  const doorOpen = ease(seg(t, S3.walkEnd - 0.6, S3.walkEnd - 0.3)) * (1 - ease(seg(t, S3.walkEnd + 0.25, S3.walkEnd + 0.5)));
  drawRoom(); drawWindow(false); drawWhiteboard(); drawClock(hours, false); drawDoor(doorOpen); drawCabinet(); drawFloorPlant();

  const open = 1 - ease(seg(t, S3.tutup, S3.laptop));
  dimasDeskSet(t, t < S3.stand, open);
  const shake = t > S3.geleng && t < S3.geleng + 1.3 ? Math.sin((t - S3.geleng) * 16) * 0.06 : 0;
  const kst = kharisDesk(t, { exp: t > S3.geleng ? 'tired' : 'neutral', look: [lerp(-1, 1, 0.5 + 0.5 * Math.sin(t * 0.5)), 0], headDx: shake, hairDroop: 0.85 });
  drawStack(12, 1); drawMug(0.42, 3.3, '#E84545'); drawDeskFront();

  if (t >= S3.stand && walkQ < 1) {
    const [X, Z] = walkPath(DIMAS_PATH, walkQ), [wx, wy] = P(X, 0, Z), ws = S(Z);
    const st = { pose: walkQ > 0 ? 'walk' : 'stand', t, exp: 'happy', look: [1, 0], arms: { l: 'down', r: t < S3.stand + 1.0 ? 'up' : 'down' } };
    drawChar('dimas', wx, wy, ws, st);
    if (t < S3.stand + 1.1) { const [hx, hy, hr] = st._head; bubble(hx + 230, hy - hr - 120, 'DULUAN YA!', back(seg(t, S3.stand, S3.stand + 0.25)) * 0.8, hx + 60, hy - hr * 0.7); }
  }
  drawLamp(false);
  gradeMul(255, 214, 172, 0.55);
  glowAt(...P(-1.45, 1.9, ZB), 520, '255,170,90', 0.3);
  const [hx, hy, hr] = kst._head;
  if (t >= S3.santai) bubble(hx + 240, hy - hr - 150, 'SANTAI BANGET...', back(seg(t, S3.santai, S3.santai + 0.25)) * 0.85, hx + 60, hy - hr * 0.8);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (t >= S3.teng && t < S3.stand + 1.5) topLines([{ txt: '17.00 TENG!', t: S3.teng, col: C.yellow, size: 96 }], t, 300);
}

// ═════════════════════ SCENE 4 — PENGUMUMAN PROMOSI ═════════════════════
const S4 = { peng: at('pengumuman'), nama: at('Nama'), reveal: at('Dimas', 1) };
function scene4(t) {
  const l = t - CUT[3];
  const rev = t >= S4.reveal, punch = rev ? 1 - easeOut(seg(t, S4.reveal, S4.reveal + 0.3)) : 0;
  cam(1.24 + 0.04 * l / 5 + 0.12 * punch, 440, 1010);
  drawRoom(); drawWindow(false); drawBanner('PENGUMUMAN PROMOSI'); drawClock(9.5, false); drawDoor(0); drawCabinet(); drawFloorPlant();
  const [bx, by] = P(0.05, 0, 4.7), bs = S(4.7);
  drawChar('bos', bx, by, bs, { exp: rev ? 'happy' : 'neutral', t, look: [0, 0.6], arms: { l: [bx - 0.12 * bs, by - 1.05 * bs], r: [bx + 0.12 * bs, by - 1.05 * bs] },
    hold: { r: (x, y, s) => drawPaper(x - 0.1 * s, y + 0.02 * s, s, 'PROMOSI') } });
  const [kx, ky] = P(-0.62, 0, 3.35), ks = S(3.35), [dx, dy] = P(0.62, 0, 3.35), ds = S(3.35);
  let sx = null;
  if (t >= S4.nama && !rev) sx = lerp(kx, dx, 0.5 + 0.5 * Math.sin((t - S4.nama) * 10));
  else if (rev) sx = dx;
  const kst = { exp: rev ? 'shock' : 'proud', t, look: rev ? [1, 0] : [0, 0], hairDroop: rev ? ease(seg(t, S4.reveal + 0.2, S4.reveal + 0.7)) : 0,
    arms: !rev && t < S4.nama ? { l: 'hip', r: [kx + 0.06 * ks, ky - 1.22 * ks] } : { l: 'down', r: 'down' } };
  drawChar('kharis', kx, ky, ks, kst);
  const dst = { exp: rev ? 'proud' : 'neutral', t, look: [0, 0], arms: rev ? { l: 'up', r: 'up' } : { l: 'down', r: 'down' } };
  const jump = rev ? Math.abs(Math.sin((t - S4.reveal) * 7)) * 0.06 * ds : 0;
  drawChar('dimas', dx, dy - jump, ds, dst);
  drawLamp(false);
  const dim = t >= S4.nama ? (rev ? 1 - seg(t, S4.reveal, S4.reveal + 0.25) : seg(t, S4.nama, S4.nama + 0.2)) : 0;
  gradeMul(70, 70, 110, dim * 0.85);
  if (sx !== null) spotlight(sx, dy - 0.9 * ds, 1.3 * ds, rev ? 0.4 : 0.55);
  if (rev) { confetti(t - S4.reveal, 60); crack(kst._head[0], kst._head[1], kst._head[2], seg(t, S4.reveal + 0.35, S4.reveal + 0.45)); }
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (t >= S4.nama && !rev) topLines([{ txt: 'DRRRRRR...', t: S4.nama, col: '#fff', size: 90, shake: true }], t, 300);
  if (rev) topLines([{ txt: 'PROMOSI:', t: S4.reveal, col: '#fff', size: 70 }, { txt: 'DIMAS!', t: S4.reveal + 0.1, col: C.yellow, size: 130 }], t, 270);
}

// ═════════════════════ SCENE 5 — KONFRONTASI ═════════════════════
const S5 = { datangi: at('datangi'), jawaban: at('Jawaban'), bos: at('Kharis', 4), saya: at('saya'), aja: atEnd('aja."') };
const BOS_ROOM = { wall: '#A9DCCB', wallR: '#8FCBB9', tileA: '#B9783F', tileB: '#EAD0A6' };
function drawCertificate() {
  const [x, y, w, h] = frontRect(-0.45, 1.35, 0.45, 2.15, ZB);
  rr(x - 10, y - 10, w + 20, h + 20, 6); g.fillStyle = '#b07a3c'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#fffaf0'; g.fillRect(x, y, w, h); g.strokeRect(x, y, w, h);
  g.fillStyle = C.ol; g.font = `900 ${Math.round(h * 0.15)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('MANAJER', x + w / 2, y + h * 0.3); g.fillText('TERBAIK', x + w / 2, y + h * 0.5);
  circ(x + w / 2, y + h * 0.78, h * 0.1, C.gold, C.ol, 3);
}
function scene5(t) {
  const l = t - CUT[4];
  const closeUp = ease(seg(t, S5.bos - 0.15, S5.bos + 0.35)), endShot = t > S5.aja + 0.05;
  const [bhx, bhy] = P(-0.05, 1.3, 4.25);
  if (endShot) cam(2.0, ...P(0.85, 1.35, 3.0));
  else cam(lerp(1.28, 2.15, closeUp), lerp(560, bhx, closeUp), lerp(990, bhy + 40, closeUp));
  drawRoom(BOS_ROOM); drawWindow(false); drawCertificate(); drawClock(13, false);
  const doorOpen = ease(seg(l, 0, 0.3)) * (1 - ease(seg(t, S5.datangi + 0.9, S5.datangi + 1.2)));
  drawDoor(doorOpen); drawCabinet();
  // Bos at his desk
  const bz = 4.25, [bx, by] = P(-0.05, 0, bz), bs = S(bz);
  drawChairBack(-0.05, bz + 0.15);
  const bst = { pose: 'sit', exp: 'neutral', t, look: t > S5.datangi ? [1, 0] : [0, 0.4], armsLater: true, arms: { l: P(-0.3, DESK.y + 0.04, 3.7), r: P(0.2, DESK.y + 0.04, 3.7) } };
  drawChar('bos', bx, by, bs, bst);
  withDesk(DESK, () => {
    drawDeskTop(); drawMonitor(false);
    drawArms('bos', bs, bst);
    drawDeskFront();
    const [nx, ny, nw, nh] = frontRect(-0.1, DESK.y, 0.45, DESK.y + 0.1, DESK.z - 0.05);
    rr(nx, ny - nh, nw, nh, 4); g.fillStyle = '#2d3142'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 3; g.stroke();
    g.fillStyle = C.gold; g.font = `900 ${Math.round(nh * 0.55)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PAK BOS', nx + nw / 2, ny - nh / 2);
  }, ['#C98B4F', '#9a6532', '#F3E3C8']);
  // Kharis storms in
  const q = ease(seg(t, S5.datangi, S5.datangi + 1.0));
  const X = lerp(1.38, 0.85, q), Z = lerp(3.85, 3.0, q), [kx, ky] = P(X, 0, Z), ks = S(Z);
  const pointing = t >= S5.jawaban && t < S5.bos;
  const kst = { pose: q > 0 && q < 1 ? 'walk' : 'stand', t, exp: endShot ? 'shock' : 'angry', look: [-1, 0], hairDroop: endShot ? 1 : 0,
    arms: pointing ? { l: [kx - 0.6 * ks, ky - 1.3 * ks], r: 'hip' } : { l: 'hip', r: 'hip' } };
  if (t < S5.datangi + 0.05) kst.arms = { l: 'hip', r: 'hip' };
  drawChar('kharis', kx, ky, ks, kst);
  const [hx, hy, hr] = kst._head; const hxx = hx;
  if (!endShot && t < S5.bos) steam(hxx, hy - hr * 1.05, t, ks);
  drawLamp(false);
  if (pointing) bubble(hxx - 130, hy - hr - 170, 'KENAPA BUKAN SAYA?!', back(seg(t, S5.jawaban, S5.jawaban + 0.25)) * 0.72, hxx - 20, hy - hr * 0.9);
  if (closeUp > 0 && !endShot) { sweat(...P(0.22, 1.62, 4.25), 18); }
  if (endShot) { gradeMul(180, 185, 200, 0.6); sweat(hxx + hr * 0.9, hy - hr * 0.4, 16); }
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (t >= S5.saya && !endShot) topLines([{ txt: '"SAYA NGGAK TAHU', t: S5.saya, col: '#fff', size: 78 }, { txt: 'KAMU NGERJAIN APA AJA."', t: S5.saya + 0.5, col: C.yellow, size: 78 }], t, 300);
  if (endShot) topLines([{ txt: 'krik... krik...', t: S5.aja + 0.1, col: '#fff', size: 64 }], t, 320);
}

// ═════════════════════ SCENE 6 — RAHASIA DIMAS (FLASHBACK) ═════════════════════
const S6 = { laporan: at('laporan'), selesai: at('selesaikan'), hasil: at('hasilnya'), lima: at('Lima', 2), menit: at('menit'), tahu: at('Tapi', 1) };
function emailCard(t) {
  const sc = pop(t, S6.laporan - 0.2, 0.3);
  if (sc <= 0) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(540, 470); g.scale(sc, sc);
  const w = 880, h = 470;
  rr(-w / 2 + 8, -h / 2 + 10, w, h, 26); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fill();
  rr(-w / 2, -h / 2, w, h, 26); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 6; g.stroke();
  g.save(); rr(-w / 2, -h / 2, w, 90, 26); g.clip(); g.fillStyle = C.teal; g.fillRect(-w / 2, -h / 2, w, 90); g.restore();
  g.strokeStyle = C.ol; g.beginPath(); g.moveTo(-w / 2, -h / 2 + 90); g.lineTo(w / 2, -h / 2 + 90); g.stroke();
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.font = `900 40px ${FONT}`; g.fillText('LAPORAN JUMAT', -w / 2 + 34, -h / 2 + 47);
  g.fillStyle = '#5b6170'; g.font = `700 30px ${FONT}`; g.fillText('Dari: Dimas   Kepada: Pak Bos', -w / 2 + 34, -h / 2 + 130);
  const items = [[S6.selesai, '1. Selesai: proposal klien A'], [S6.hasil, '2. Hasil: penjualan naik 12%'], [S6.hasil + 0.6, '3. Minggu depan: presentasi']];
  items.forEach(([t0, txt], i) => { if (t >= t0) { g.globalAlpha = seg(t, t0, t0 + 0.2); g.fillStyle = C.ol; g.font = `800 38px ${FONT}`; g.fillText(txt, -w / 2 + 34 + (1 - seg(t, t0, t0 + 0.2)) * 30, -h / 2 + 200 + i * 66); g.globalAlpha = 1; } });
  const pressed = t >= S6.lima - 0.35 && t < S6.lima - 0.15;
  const sent = t >= S6.lima - 0.15;
  rr(w / 2 - 250, h / 2 - 95, 210, 70, 35); g.fillStyle = sent ? '#2fa55a' : C.red; g.fill(); g.stroke();
  g.fillStyle = '#fff'; g.font = `900 34px ${FONT}`; g.textAlign = 'center'; g.fillText(sent ? 'TERKIRIM' : 'KIRIM', w / 2 - 145, h / 2 - 59 + (pressed ? 3 : 0));
  g.restore();
  if (t >= S6.lima - 0.15 && t < S6.lima + 0.9) {
    const q = easeOut(seg(t, S6.lima - 0.15, S6.lima + 0.9));
    g.setTransform(1, 0, 0, 1, 0, 0);
    drawEnvelope(lerp(790, 1250, q), lerp(840, 120, q) - Math.sin(q * Math.PI) * 120, 380, '', q * 1.2);
  }
}
function scene6(t) {
  const l = t - CUT[5];
  if (t < S6.tahu - 0.15) {
    cam(1.45 + 0.05 * l / 8, 170, 1050);
    drawRoom(); drawWindow(false); drawWhiteboard(); drawClock(16.5, false); drawDoor(0); drawCabinet(); drawFloorPlant();
    // calendar "JUMAT" on the back wall
    const [x, y, w, h] = frontRect(-2.7, 1.55, -2.2, 2.2, ZB);
    g.fillStyle = '#fff'; g.fillRect(x, y, w, h); g.strokeStyle = C.ol; g.lineWidth = 4; g.strokeRect(x, y, w, h);
    g.fillStyle = C.red; g.fillRect(x, y, w, h * 0.32); g.strokeRect(x, y, w, h * 0.32);
    g.fillStyle = '#fff'; g.font = `900 ${Math.round(h * 0.2)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('JUMAT', x + w / 2, y + h * 0.17);
    g.fillStyle = C.ol; g.font = `900 ${Math.round(h * 0.4)}px ${FONT}`; g.fillText('15', x + w / 2, y + h * 0.65);
    const st = dimasDeskSet(t, true, 1);
    kharisDesk(t, { exp: 'tired', hairDroop: 0.85 }); drawStack(12, 1); drawDeskFront();
    drawLamp(false);
    emailCard(t);
    if (t >= S6.menit) { const sc = pop(t, S6.menit, 0.3); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(860, 1250); g.scale(sc, sc); g.rotate(0.1);
      circ(0, 0, 105, C.yellow, C.ol, 6); g.fillStyle = C.ol; g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('5', 0, -18); g.font = `900 30px ${FONT}`; g.fillText('MENIT', 0, 38); g.restore(); }
  } else {
    // Bos reads the report and nods
    cam(1.7, ...P(-0.05, 1.25, 4.25));
    drawRoom(BOS_ROOM); drawWindow(false); drawCertificate(); drawClock(17, false); drawDoor(0); drawCabinet();
    const bz = 4.25, [bx, by] = P(-0.05, 0, bz), bs = S(bz);
    drawChairBack(-0.05, bz + 0.15);
    const nod = Math.sin((t - S6.tahu) * 9) * 0.02;
    const bst = { pose: 'sit', exp: 'happy', t, look: [0, 1], headDy: nod, armsLater: true, arms: { l: [bx - 0.2 * bs, by - 0.85 * bs], r: [bx + 0.2 * bs, by - 0.85 * bs] } };
    drawChar('bos', bx, by, bs, bst);
    withDesk(DESK, () => { drawDeskTop(); drawMonitor(false); drawDeskFront(); }, ['#C98B4F', '#9a6532', '#F3E3C8']);
    drawArms('bos', bs, bst);
    drawPaper(bx, by - 0.8 * bs, bs * 1.2, 'LAPORAN DIMAS', C.teal);
    const [hx, hy, hr] = bst._head;
    [[-1.4, -0.6], [1.4, -0.8], [1.2, 0.4]].forEach(([dx, dy], i) => { const sc = pop(t, S6.tahu + 0.2 + i * 0.2, 0.25); if (sc > 0) { g.save(); g.translate(hx + dx * hr, hy + dy * hr); g.scale(sc, sc); circ(0, 0, 34, '#2fa55a', C.ol, 4); g.strokeStyle = '#fff'; g.lineWidth = 8; g.beginPath(); g.moveTo(-14, 0); g.lineTo(-3, 11); g.lineTo(15, -10); g.stroke(); g.restore(); } });
  }
  sepia(t);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const fl = 0.85 + 0.15 * rnd(Math.floor(t * 12));
  g.globalAlpha = fl; strokeText('FLASHBACK · SETIAP JUMAT', W / 2, 130, 46, '#fff4dc'); g.globalAlpha = 1;
}

// ═════════════════════ SCENE 7 — PELAJARAN ═════════════════════
const S7 = { pel: at('Pelajarannya:'), kerja: at('kerja'), kelihatan: at('kelihatan,'), dihitung: at('dihitung.') };
function scene7(t) {
  const l = t - CUT[6];
  cam(1.22 + 0.06 * l / 5, 700, 1060);
  drawRoom(); drawWindow(false); drawWhiteboard(); drawClock(8, false); drawDoor(0); drawCabinet(); drawFloorPlant();
  // empty chair + desk with stack
  drawChairBack(-0.05, 4.4); drawDeskTop(); drawMonitor(false); drawKeyboard(); drawStack(12, 1); drawDeskFront();
  const [kx, ky] = P(0.9, 0, 2.95), ks = S(2.95);
  spotlight(kx, ky - 0.9 * ks, 1.5 * ks, 0.3 + 0.1 * Math.sin(t * 4));
  const boing = t < S7.pel ? 1 : Math.max(0, 1 - back(seg(t, S7.pel, S7.pel + 0.45)));
  const hasPaper = t >= S7.dihitung + 0.15;
  const st = { exp: t < S7.pel ? 'tired' : 'proud', t, look: [0, 0], hairDroop: boing,
    arms: hasPaper ? { l: 'hip', r: 'up' } : { l: 'hip', r: 'hip' },
    hold: hasPaper ? { r: (x, y, s) => drawPaper(x, y - 0.05 * s, s * pop(t, S7.dihitung + 0.15, 0.3), 'LAPORAN JUMAT', C.teal) } : null };
  drawChar('kharis', kx, ky, ks, st);
  if (t >= S7.pel && t < S7.pel + 0.6) { const [hx, hy, hr] = st._head; strokeText('BOING!', hx - hr * 1.6, hy - hr * 1.3, 54, C.yellow); }
  drawLamp(true);
  g.setTransform(1, 0, 0, 1, 0, 0);
  topLines([
    { txt: 'KERJA KERAS YANG', t: S7.kerja, col: '#fff', size: 78 },
    { txt: 'NGGAK KELIHATAN', t: S7.kelihatan - 0.3, col: C.yellow, size: 92 },
    { txt: '= NGGAK DIHITUNG', t: S7.dihitung - 0.2, col: C.red, size: 92, shake: t < S7.dihitung + 0.4 },
  ], t, 230);
}

// ═════════════════════ SCENE 8 — CTA ═════════════════════
const S8 = { tulis: at('Tulis'), follow: at('Follow'), besok: at('besok'), dan: at('dan', 1) };
function ctaHalf(t, left) {
  g.save(); g.beginPath(); g.rect(left ? 0 : 540, 0, 540, H); g.clip();
  if (left) {
    cam(1.25, 680, 960);
    drawRoom(); drawWindow(true); drawWhiteboard(); drawClock(23, false); drawDoor(0); drawCabinet(); drawFloorPlant();
    const st = kharisDesk(t, { exp: 'tired', hairDroop: 0.9 }); drawStack(12, 1); drawDeskFront(); drawLamp(false);
    nightGrade(1); glowAt(...P(-0.4, 1.1, 3.6), 620, '110,200,255', 0.55); glowAt(st._head[0], st._head[1], 230, '150,215,255', 0.3);
  } else {
    cam(1.25, 880 - 270, 1000);
    drawRoom(); drawWindow(false); drawWhiteboard(); drawClock(17, false); drawDoor(1); drawCabinet();
    const [dx, dy] = P(1.05, 0, 3.4), ds = S(3.4);
    drawChar('dimas', dx, dy, ds, { exp: 'happy', t, look: [-1, 0], arms: { l: 'down', r: 'up' } });
    drawLamp(false); gradeMul(255, 205, 160, 0.5);
  }
  g.restore();
}
function scene8(t) {
  if (t < S8.follow - 0.1) {
    ctaHalf(t, true); ctaHalf(t, false);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#fff'; g.fillRect(534, 0, 12, H); g.fillStyle = C.ol; g.fillRect(530, 0, 4, H); g.fillRect(546, 0, 4, H);
    const sc = pop(t, CUT[7], 0.35);
    g.save(); g.translate(270, 330); g.scale(sc, sc); strokeText('TIM', 0, -50, 60, '#fff'); strokeText('LEMBUR', 0, 25, 80, '#7fb6f0'); g.restore();
    g.save(); g.translate(810, 330); g.scale(sc, sc); strokeText('TIM PULANG', 0, -50, 60, '#fff'); strokeText('JAM 5', 0, 25, 80, '#ffb36b'); g.restore();
    const vs = pop(t, CUT[7] + 0.25, 0.3);
    g.save(); g.translate(540, 760); g.scale(vs, vs); circ(0, 0, 80, C.red, C.ol, 7); strokeText('VS', 0, 4, 66, '#fff', { shadow: false }); g.restore();
    if (t >= S8.tulis) {
      const s2 = pop(t, S8.tulis, 0.3);
      g.save(); g.translate(540, 1110); g.scale(s2, s2);
      rr(-400, -90, 800, 180, 40); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke();
      g.beginPath(); g.moveTo(-60, 88); g.lineTo(0, 150); g.lineTo(20, 88); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.fillRect(-56, 80, 72, 12);
      g.fillStyle = C.ol; g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TULIS DI KOMENTAR', 0, 4);
      g.restore();
      for (let i = 0; i < 3; i++) { const y = 1270 + i * 50 + Math.sin(t * 8 - i) * 10; g.save(); g.globalAlpha = 0.9 - i * 0.2; g.fillStyle = C.yellow; g.strokeStyle = C.ol; g.lineWidth = 5; g.beginPath(); g.moveTo(500, y); g.lineTo(580, y); g.lineTo(540, y + 40); g.closePath(); g.fill(); g.stroke(); g.restore(); }
    }
    return;
  }
  const end = t >= S8.dan - 0.1;
  const [kx, ky] = P(0.0, 0, 3.0), ks = S(3.0);
  if (end) { const z = lerp(1.5, 1.9, easeOut(seg(t, S8.dan - 0.1, S8.dan + 0.6))); cam(z, kx + 60, ky - 1.25 * ks); }
  else cam(1.2, 520, 1050);
  drawRoom(); drawWindow(false); drawWhiteboard(); drawClock(9, false); drawDoor(0); drawCabinet(); drawFloorPlant();
  const env = t >= S8.besok;
  const st = { exp: end ? 'shock' : env ? 'tired' : 'happy', t, look: env ? [1, -0.3] : [1, -1], hairDroop: env ? 0.3 : 0,
    arms: env ? { l: 'hip', r: 'up' } : { l: 'hip', r: 'up' },
    hold: env ? { r: (x, y, s) => drawEnvelope(x, y - 0.06 * s, s * 1.1, 'GAJI', Math.sin(t * 14) * 0.12) } : null };
  drawChar('kharis', kx, ky, ks, st);
  const [hx, hy, hr] = st._head;
  if (env) sweat(hx - hr * 1.0, hy - hr * 0.3 + ((t * 40) % 30), 16);
  drawLamp(true);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (!env) {
    const sc = pop(t, S8.follow, 0.3), tap = t > S8.follow + 1.0, k = tap ? 1 - seg(t, S8.follow + 1.0, S8.follow + 1.15) * 0.08 : 1 + 0.05 * Math.sin(t * 8);
    g.save(); g.translate(700, 420); g.scale(sc * k, sc * k);
    rr(-230, -70, 460, 140, 70); g.fillStyle = tap ? '#2fa55a' : C.red; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke();
    g.fillStyle = '#fff'; g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tap ? 'DIIKUTI' : '+ FOLLOW', 0, 4);
    g.restore();
    if (t > S8.follow + 0.5) { const q = easeOut(seg(t, S8.follow + 0.5, S8.follow + 1.0)); const fx = lerp(900, 760, q), fy = lerp(700, 470, q); g.save(); g.translate(fx, fy); circ(0, 0, 30, '#fff', C.ol, 5); circ(0, 0, 10, C.ol); g.restore(); }
    topLines([{ txt: 'FOLLOW MAS KHARIS', t: S8.follow + 0.1, col: C.yellow, size: 84 }], t, 210);
  } else if (!end) {
    topLines([{ txt: 'BESOK:', t: S8.besok, col: '#fff', size: 70 }, { txt: 'MINTA NAIK GAJI...', t: S8.besok + 0.2, col: C.yellow, size: 90 }], t, 230);
  } else {
    topLines([{ txt: 'HASILNYA DI LUAR DUGAAN!', t: S8.dan - 0.1, col: '#fff', size: 80 }, { txt: 'PART 2 BESOK!', t: S8.dan + 0.5, col: C.red, size: 110, shake: true }], t, 240);
    strokeText('???', hx + hr * 1.5, hy - hr * 1.2, 90, C.yellow);
  }
}

// ═════════════════════ MASTER ═════════════════════
const HOOK_SIZE = 92;
function hookTitle(t) {
  if (t >= T_P) return;
  const sc = back(seg(t, 0, 0.35));
  g.save(); g.translate(W / 2, 300); g.scale(sc, sc);
  const l1 = 'LEMBUR 3 BULAN...', l2 = 'YANG NAIK JABATAN', l3 = 'MALAH DIA?!';
  const s = Math.min(fitSize(l1, HOOK_SIZE, W - 120), fitSize(l2, HOOK_SIZE, W - 120));
  strokeText(l1, 0, -s * 1.1, s, '#fff'); strokeText(l2, 0, 0, s, C.yellow); strokeText(l3, 0, s * 1.15, Math.round(s * 1.2), C.red);
  g.restore();
}
const SCENES = [t => t < T_P ? s1Night(t) : s1Promo(t - T_P), scene2, scene3, scene4, scene5, scene6, scene7, scene8];
function renderFrame(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  let si = 0; while (si < 7 && t >= CUT[si + 1]) si++;
  SCENES[si](t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  vignette();
  hookTitle(t);
  voCaption(t, 1480);
  // white flash on every hard cut
  let flash = 0;
  [T_P, ...CUT.slice(1, 8)].forEach((c, i) => { if (t >= c) flash = Math.max(flash, (i === 0 ? 1 : 0.55) * (1 - seg(t, c, c + 0.18))); });
  if (flash > 0) { g.fillStyle = `rgba(255,255,255,${flash})`; g.fillRect(0, 0, W, H); }
}
