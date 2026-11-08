// Shared story helpers: VO sync, captions, camera, grading, props, recurring sets

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


const BOS_ROOM = { wall: '#A9DCCB', wallR: '#8FCBB9', tileA: '#B9783F', tileB: '#EAD0A6' };
function drawCertificate() {
  const [x, y, w, h] = frontRect(-0.45, 1.35, 0.45, 2.15, ZB);
  rr(x - 10, y - 10, w + 20, h + 20, 6); g.fillStyle = '#b07a3c'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#fffaf0'; g.fillRect(x, y, w, h); g.strokeRect(x, y, w, h);
  g.fillStyle = C.ol; g.font = `900 ${Math.round(h * 0.15)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('MANAJER', x + w / 2, y + h * 0.3); g.fillText('TERBAIK', x + w / 2, y + h * 0.5);
  circ(x + w / 2, y + h * 0.78, h * 0.1, C.gold, C.ol, 3);
}
