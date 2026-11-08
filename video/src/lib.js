// Mas Kharis motion-graphic drawing library (canvas 1080x1920, vertical)
const W = 1080, H = 1920;
const cv = document.getElementById('c');
const g = cv.getContext('2d');
const FONT = '"Inter", "Inter Display", "DejaVu Sans", sans-serif';

const C = {
  ol: '#1d2030',
  wall: '#F2CC45', wallR: '#E0B634',
  ceil: '#F4F2F9', plank: '#D8D4E6',
  tileA: '#1F8B95', tileB: '#EEF5F4',
  teal: '#3BB5BF', tealD: '#23818A', tealL: '#7FD3D9',
  wood: '#F6EFE2',
  shirtK: '#2F6FD0', shirtD: '#3FA34D', shirtB: '#F7F7F7',
  hairK: '#3A2216', hairD: '#6B4226',
  red: '#E84545', gold: '#F5B82E', yellow: '#FFD84A'
};

// ── camera: one-point perspective, Y = height above floor (m), Z = depth (m)
const VX = 480, VY = 800, F = 1237.5, CAMH = 1.6, ZB = 6, WH = 3.2;
const XR = (800 - VX) * ZB / F;
const P = (X, Y, Z) => [VX + X * F / Z, VY + (CAMH - Y) * F / Z];
const S = Z => F / Z;

// ── helpers
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const ease = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const easeOut = t => { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
const back = t => { t = clamp(t, 0, 1); const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function path(pts) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); }
function poly(pts, fill, stroke, lw) {
  path(pts);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 5; g.lineJoin = 'round'; g.stroke(); }
}
function line(a, b, col, lw) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.strokeStyle = col || C.ol; g.lineWidth = lw || 5; g.lineCap = 'round'; g.stroke(); }
function rr(x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function circ(x, y, r, fill, stroke, lw) {
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 5; g.stroke(); }
}
// rectangle on a plane facing camera at depth Z
function frontRect(X1, Y1, X2, Y2, Z) { const a = P(X1, Y2, Z), b = P(X2, Y1, Z); return [a[0], a[1], b[0] - a[0], b[1] - a[1]]; }
// box facing camera: front face at Z, depth d
function box(X1, X2, Y1, Y2, Z, d, top, front, side) {
  if (top) poly([P(X1, Y2, Z + d), P(X2, Y2, Z + d), P(X2, Y2, Z), P(X1, Y2, Z)], top, C.ol, 4);
  // visible side face (the one facing the vanishing point)
  if (side) {
    if (X1 > 0) poly([P(X1, Y2, Z), P(X1, Y2, Z + d), P(X1, Y1, Z + d), P(X1, Y1, Z)], side, C.ol, 4);
    else if (X2 < 0) poly([P(X2, Y2, Z), P(X2, Y2, Z + d), P(X2, Y1, Z + d), P(X2, Y1, Z)], side, C.ol, 4);
  }
  if (front) { const r = frontRect(X1, Y1, X2, Y2, Z); g.beginPath(); g.rect(...r); g.fillStyle = front; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke(); }
}

// ═════════════════════════ ROOM ═════════════════════════
function drawRoom() {
  g.fillStyle = C.ceil; g.fillRect(-400, -400, W + 800, H + 800);
  for (let X = -5; X <= XR; X += 0.34) line(P(X, WH, ZB), P(X, WH, 0.8), C.plank, 3);
  poly([P(-8, WH, ZB), P(XR, WH, ZB), P(XR, 0, ZB), P(-8, 0, ZB)], C.wall);
  const gw = g.createLinearGradient(0, 470, 0, 1130);
  gw.addColorStop(0, 'rgba(255,255,255,0.12)'); gw.addColorStop(1, 'rgba(0,0,0,0.05)');
  poly([P(-8, WH, ZB), P(XR, WH, ZB), P(XR, 0, ZB), P(-8, 0, ZB)], gw);
  poly([P(XR, WH, ZB), P(XR, WH, 0.7), P(XR, 0, 0.7), P(XR, 0, ZB)], C.wallR);

  // floor: diagonal checker
  g.save();
  path([P(-8, 0, ZB), P(XR, 0, ZB), P(XR, 0, 0.7), P(-8, 0, 0.7)]); g.clip();
  const s = 0.5, Z0 = 3.0, k = Math.SQRT1_2;
  for (let i = -18; i < 18; i++) for (let j = -18; j < 18; j++) {
    const cs = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([u, v]) => [(u - v) * s * k, Z0 + (u + v) * s * k]);
    if (cs.some(c => c[1] < 0.6)) continue;
    poly(cs.map(c => P(c[0], 0, c[1])), (i + j) & 1 ? C.tileA : C.tileB, 'rgba(0,0,0,0.10)', 2);
  }
  const fg = g.createLinearGradient(0, 1130, 0, 1920);
  fg.addColorStop(0, 'rgba(0,0,0,0.18)'); fg.addColorStop(0.25, 'rgba(0,0,0,0)');
  g.fillStyle = fg; g.fillRect(-400, 1100, W + 800, 1300);
  g.restore();

  poly([P(-8, 0.12, ZB), P(XR, 0.12, ZB), P(XR, 0, ZB), P(-8, 0, ZB)], '#fff');
  poly([P(XR, 0.12, ZB), P(XR, 0.12, 0.7), P(XR, 0, 0.7), P(XR, 0, ZB)], '#f1f1f1');
  line(P(XR, WH, ZB), P(XR, 0, ZB), C.ol, 4);
  line(P(-8, WH, ZB), P(XR, WH, ZB), C.ol, 4);
  line(P(XR, WH, ZB), P(XR, WH, 0.7), C.ol, 4);
}

function drawWindow(night) {
  const [x, y, w, h] = frontRect(-2.05, 1.15, -0.85, 2.35, ZB);
  rr(x - 8, y - 8, w + 16, h + 16, 6); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  const sky = g.createLinearGradient(0, y, 0, y + h);
  if (night) { sky.addColorStop(0, '#0d1236'); sky.addColorStop(1, '#2a2f6b'); }
  else { sky.addColorStop(0, '#7cc7f2'); sky.addColorStop(1, '#c8ecff'); }
  g.fillStyle = sky; g.fillRect(x, y, w, h);
  if (night) { circ(x + w * 0.78, y + h * 0.2, 14, '#fff6c8'); for (let i = 0; i < 9; i++) circ(x + rnd(i) * w, y + rnd(i + 30) * h * 0.4, 2, '#fff'); }
  const bs = [[0, 0.55, 0.22], [0.2, 0.35, 0.2], [0.42, 0.5, 0.18], [0.62, 0.28, 0.2], [0.84, 0.45, 0.2]];
  bs.forEach(([bx, bh, bw], i) => {
    g.fillStyle = night ? '#1b1f45' : '#8fb3cf'; g.fillRect(x + bx * w, y + bh * h, bw * w, h);
    g.fillStyle = night ? '#ffd86b' : 'rgba(255,255,255,0.7)';
    for (let r = 0; r < 6; r++) for (let c2 = 0; c2 < 2; c2++) if (rnd(i * 31 + r * 7 + c2) > (night ? 0.45 : 0.2))
      g.fillRect(x + bx * w + 6 + c2 * bw * w * 0.45, y + bh * h + 8 + r * 18, 7, 9);
  });
  g.restore();
  g.strokeStyle = '#fff'; g.lineWidth = 7;
  g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.moveTo(x, y + h / 2); g.lineTo(x + w, y + h / 2); g.stroke();
  // blinds top
  rr(x - 12, y - 18, w + 24, 22, 4); g.fillStyle = C.teal; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
}

function drawClock(hours, glow) {
  const [cx, cy] = P(1.02, 2.4, ZB), r = 0.21 * S(ZB);
  if (glow) { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(cx, cy, r, cx, cy, r * 2.6); gr.addColorStop(0, 'rgba(255,90,80,0.45)'); gr.addColorStop(1, 'rgba(255,90,80,0)'); g.fillStyle = gr; g.fillRect(cx - r * 3, cy - r * 3, r * 6, r * 6); g.restore(); }
  circ(cx + 4, cy + 5, r, 'rgba(0,0,0,0.2)');
  circ(cx, cy, r, '#fff', C.ol, 5);
  circ(cx, cy, r * 0.86, null, C.red, 4);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line([cx + Math.sin(a) * r * 0.62, cy - Math.cos(a) * r * 0.62], [cx + Math.sin(a) * r * 0.74, cy - Math.cos(a) * r * 0.74], C.ol, i % 3 ? 2 : 4); }
  const ha = (hours % 12) / 12 * Math.PI * 2, ma = (hours % 1) * Math.PI * 2;
  line([cx, cy], [cx + Math.sin(ha) * r * 0.42, cy - Math.cos(ha) * r * 0.42], C.ol, 6);
  line([cx, cy], [cx + Math.sin(ma) * r * 0.66, cy - Math.cos(ma) * r * 0.66], C.ol, 4);
  circ(cx, cy, 6, C.red);
}

function drawWhiteboard(text) {
  const [x, y, w, h] = frontRect(-0.6, 1.3, 0.6, 2.25, ZB);
  rr(x, y, w, h, 6); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
  g.fillStyle = C.ol; g.font = `900 ${Math.round(h * 0.16)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text || 'TARGET Q3', x + w / 2, y + h * 0.2);
  g.strokeStyle = C.red; g.lineWidth = 5; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x + w * 0.12, y + h * 0.85); g.lineTo(x + w * 0.35, y + h * 0.62); g.lineTo(x + w * 0.52, y + h * 0.72); g.lineTo(x + w * 0.85, y + h * 0.38); g.stroke();
  g.beginPath(); g.moveTo(x + w * 0.85, y + h * 0.38); g.lineTo(x + w * 0.76, y + h * 0.4); g.moveTo(x + w * 0.85, y + h * 0.38); g.lineTo(x + w * 0.83, y + h * 0.48); g.stroke();
  g.fillStyle = C.teal; g.fillRect(x + w * 0.1, y + h, w * 0.8, 6);
}

function drawBanner(text) {
  const [x, y, w, h] = frontRect(-2.1, 2.42, 0.85, 2.92, ZB);
  // bunting
  for (let i = 0; i < 9; i++) { const bx = x - 40 + i * (w + 80) / 8, by = y - 26 + Math.sin(i / 8 * Math.PI) * 18; poly([[bx - 20, by], [bx + 20, by], [bx, by + 36]], [C.red, C.teal, C.yellow][i % 3], C.ol, 3); }
  rr(x, y, w, h, 8); g.fillStyle = C.red; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 5; g.stroke();
  g.fillStyle = '#fff'; g.font = `900 ${Math.round(h * 0.5)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, x + w / 2, y + h * 0.54);
}

function drawDoor(open) {
  const z1 = 3.35, z2 = 4.35, hgt = 2.15;
  poly([P(XR, hgt + 0.1, z2 + 0.08), P(XR, hgt + 0.1, z1 - 0.08), P(XR, 0, z1 - 0.08), P(XR, 0, z2 + 0.08)], '#fff', C.ol, 4);
  poly([P(XR, hgt, z2), P(XR, hgt, z1), P(XR, 0, z1), P(XR, 0, z2)], open > 0 ? '#2b2f45' : C.teal, C.ol, 4);
  if (open > 0) {
    // panel hinged at z2 swinging into the room
    const a = open * 1.25, ex = XR - Math.sin(a) * (z2 - z1), ez = z2 - Math.cos(a) * (z2 - z1);
    poly([P(XR, hgt, z2), P(ex, hgt, ez), P(ex, 0, ez), P(XR, 0, z2)], C.teal, C.ol, 4);
  } else {
    poly([P(XR, hgt * 0.92, z2 - 0.12), P(XR, hgt * 0.92, z1 + 0.12), P(XR, hgt * 0.55, z1 + 0.12), P(XR, hgt * 0.55, z2 - 0.12)], C.tealL, C.ol, 3);
    const k = P(XR, 1.0, z1 + 0.12); circ(k[0] - 4, k[1], 8, C.gold, C.ol, 3);
  }
}

function drawCabinet() {
  box(0.8, 1.5, 0, 1.1, 5.55, 0.4, '#5fc3ca', C.teal, null);
  for (let i = 0; i < 3; i++) {
    const [x, y, w, h] = frontRect(0.86, 0.08 + i * 0.34, 1.44, 0.36 + i * 0.34, 5.55);
    rr(x, y, w, h, 4); g.strokeStyle = C.ol; g.lineWidth = 3; g.stroke();
    rr(x + w * 0.35, y + h * 0.4, w * 0.3, h * 0.2, 3); g.fillStyle = C.tealD; g.fill();
  }
  // plant on cabinet
  const [px, py] = P(1.15, 1.1, 5.75), s = S(5.75);
  [[-0.5, '#3f9e4d'], [0, '#4fb85c'], [0.5, '#3f9e4d'], [-0.25, '#5ccc69'], [0.25, '#5ccc69']].forEach(([a, c2]) => {
    g.save(); g.translate(px, py - 0.18 * s); g.rotate(a); g.beginPath(); g.ellipse(0, -0.2 * s, 0.06 * s, 0.2 * s, 0, 0, Math.PI * 2);
    g.fillStyle = c2; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 3; g.stroke(); g.restore();
  });
  poly([[px - 0.12 * s, py - 0.2 * s], [px + 0.12 * s, py - 0.2 * s], [px + 0.09 * s, py], [px - 0.09 * s, py]], '#d9714a', C.ol, 3);
}

function drawFloorPlant() {
  const [px, py] = P(-1.75, 0, 5.2), s = S(5.2);
  for (let i = 0; i < 7; i++) {
    const a = -0.9 + i * 0.3;
    g.save(); g.translate(px, py - 0.45 * s); g.rotate(a); g.beginPath(); g.ellipse(0, -0.32 * s, 0.09 * s, 0.32 * s, 0, 0, Math.PI * 2);
    g.fillStyle = i % 2 ? '#3f9e4d' : '#55c062'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 3; g.stroke(); g.restore();
  }
  poly([[px - 0.2 * s, py - 0.48 * s], [px + 0.2 * s, py - 0.48 * s], [px + 0.15 * s, py], [px - 0.15 * s, py]], C.red, C.ol, 4);
}

function drawLamp(on) {
  const top = P(-0.55, WH, 3.4), b = P(-0.55, 2.6, 3.4), s = S(3.4);
  line(top, b, '#333', 4);
  const [x, y] = b;
  if (on) { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y + 0.3 * s, 0, x, y + 0.3 * s, 2.2 * s); gr.addColorStop(0, 'rgba(255,230,160,0.35)'); gr.addColorStop(1, 'rgba(255,230,160,0)'); g.fillStyle = gr; g.fillRect(x - 3 * s, y - s, 6 * s, 5 * s); g.restore(); }
  g.beginPath(); g.moveTo(x - 0.07 * s, y); g.lineTo(x + 0.07 * s, y);
  g.quadraticCurveTo(x + 0.2 * s, y + 0.06 * s, x + 0.3 * s, y + 0.27 * s); g.lineTo(x - 0.3 * s, y + 0.27 * s);
  g.quadraticCurveTo(x - 0.2 * s, y + 0.06 * s, x - 0.07 * s, y); g.closePath();
  g.fillStyle = C.teal; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 5; g.stroke();
  g.beginPath(); g.ellipse(x, y + 0.27 * s, 0.3 * s, 0.06 * s, 0, 0, Math.PI * 2); g.fillStyle = C.tealD; g.fill(); g.stroke();
  circ(x, y + 0.3 * s, 0.07 * s, on ? '#fff8d8' : '#eee', C.ol, 3);
}

// desk: X -1.1..0.55, top 0.75, front Z 3.2, back Z 3.9
const DESK = { x1: -1.1, x2: 0.55, y: 0.75, z: 3.2, d: 0.7 };
function drawDeskTop() {
  const { x1, x2, y, z, d } = DESK;
  poly([P(x1, y, z + d), P(x2, y, z + d), P(x2, y, z), P(x1, y, z)], C.wood, C.ol, 4);
}
function drawDeskFront() {
  const { x1, x2, y, z } = DESK;
  const [x, yy, w, h] = frontRect(x1, 0, x2, y, z);
  g.fillStyle = C.teal; g.fillRect(x, yy, w, h);
  g.fillStyle = C.wood; g.fillRect(x - 6, yy - 2, w + 12, 18);
  g.strokeStyle = C.ol; g.lineWidth = 4; g.strokeRect(x - 6, yy - 2, w + 12, 18); g.strokeRect(x, yy + 16, w, h - 16);
  const [dx, dy, dw, dh] = frontRect(x1 + 0.08, 0.3, x1 + 0.6, 0.65, z);
  rr(dx, dy, dw, dh, 5); g.strokeStyle = C.ol; g.lineWidth = 3; g.stroke();
  rr(dx + dw * 0.35, dy + dh * 0.42, dw * 0.3, dh * 0.16, 3); g.fillStyle = C.tealD; g.fill();
  const [ex, ey, ew, eh] = frontRect(x1 + 0.08, 0.06, x1 + 0.6, 0.27, z);
  rr(ex, ey, ew, eh, 5); g.stroke();
}
function drawMonitor(night) {
  const z = 3.6, s = S(z);
  const [bx, by] = P(-0.68, DESK.y, z);
  if (night) {
    g.save(); g.globalCompositeOperation = 'lighter';
    const gr = g.createRadialGradient(bx + 0.4 * s, by - 0.4 * s, 0, bx + 0.4 * s, by - 0.4 * s, 1.6 * s);
    gr.addColorStop(0, 'rgba(110,200,255,0.55)'); gr.addColorStop(1, 'rgba(110,200,255,0)');
    g.fillStyle = gr; g.fillRect(bx - 2 * s, by - 2.5 * s, 4.5 * s, 4 * s); g.restore();
  }
  rr(bx - 0.14 * s, by - 0.03 * s, 0.28 * s, 0.05 * s, 4); g.fillStyle = '#3a3f55'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#3a3f55'; g.fillRect(bx - 0.03 * s, by - 0.2 * s, 0.06 * s, 0.18 * s); g.strokeRect(bx - 0.03 * s, by - 0.2 * s, 0.06 * s, 0.18 * s);
  rr(bx - 0.3 * s, by - 0.58 * s, 0.6 * s, 0.4 * s, 10); g.fillStyle = '#4a5070'; g.fill(); g.stroke();
  circ(bx, by - 0.38 * s, 0.035 * s, '#6c7398');
  // rim light from screen
  g.strokeStyle = night ? '#9fe3ff' : '#6c7398'; g.lineWidth = 4;
  g.beginPath(); g.moveTo(bx + 0.3 * s, by - 0.55 * s); g.lineTo(bx + 0.3 * s, by - 0.21 * s); g.stroke();
}
function drawKeyboard() {
  poly([P(-0.28, DESK.y + 0.02, 3.78), P(0.12, DESK.y + 0.02, 3.78), P(0.12, DESK.y + 0.02, 3.6), P(-0.28, DESK.y + 0.02, 3.6)], '#e9ebf3', C.ol, 3);
}
function drawMug(X, Z, col) {
  const [x, y] = P(X, DESK.y, Z), s = S(Z), w = 0.09 * s, h = 0.12 * s;
  g.beginPath(); g.arc(x + w * 0.5, y - h * 0.55, w * 0.32, -Math.PI / 2, Math.PI / 2); g.strokeStyle = C.ol; g.lineWidth = 5; g.stroke();
  rr(x - w * 0.5, y - h, w, h, 5); g.fillStyle = col; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
  g.beginPath(); g.ellipse(x, y - h, w * 0.5, w * 0.16, 0, 0, Math.PI * 2); g.fillStyle = '#5a3a22'; g.fill(); g.stroke();
}
function drawChairBack(X, Z) {
  const [x, y] = P(X, 0.55, Z), s = S(Z);
  rr(x - 0.25 * s, y - 0.75 * s, 0.5 * s, 0.7 * s, 0.12 * s); g.fillStyle = '#2d3142'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
  rr(x - 0.18 * s, y - 0.68 * s, 0.36 * s, 0.5 * s, 0.08 * s); g.fillStyle = '#3c4157'; g.fill();
}
// folder stack on desk at X 0.27..0.59, Z 3.5; n folders; offset dy (m) for falling top folder
const FOLD_COL = ['#F5C451', '#F29B4B', '#7FB6F0', '#F5C451', '#E8E2D0', '#9ED6A0'];
function drawFolder(X1, X2, Y, Z, col, tilt) {
  const d = 0.26, t = 0.035;
  g.save();
  if (tilt) { const [cx, cy] = P((X1 + X2) / 2, Y, Z); g.translate(cx, cy); g.rotate(tilt); g.translate(-cx, -cy); }
  poly([P(X1, Y + t, Z + d), P(X2, Y + t, Z + d), P(X2, Y + t, Z), P(X1, Y + t, Z)], col, C.ol, 3);
  const [x, y, w, h] = frontRect(X1, Y, X2, Y + t, Z);
  g.fillStyle = col; g.fillRect(x, y, w, h); g.strokeStyle = C.ol; g.lineWidth = 3; g.strokeRect(x, y, w, h);
  g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(x, y + h * 0.5, w, h * 0.5);
  g.restore();
}
function drawStack(n, jitter) {
  for (let i = 0; i < n; i++) {
    const off = (rnd(i * 3.7) - 0.5) * 0.05;
    drawFolder(0.24 + off, 0.56 + off, DESK.y + i * 0.035, 3.48, FOLD_COL[i % FOLD_COL.length], (rnd(i * 9.1) - 0.5) * 0.06 * (jitter || 1));
  }
}

// ═════════════════════════ CHARACTERS ═════════════════════════
// st: { pose:'stand'|'sit'|'walk', t, face:1, exp, look:[x,y], arms:{l,r}, hairDroop, bob, kind }
// arms.l / arms.r : 'down' | 'salute' | 'up' | 'clap' | 'hip' | [screenX, screenY] hand target
function drawChar(kind, fx, fy, s, st) {
  st = st || {};
  const sit = st.pose === 'sit';
  const fat = kind === 'bos' ? 1.22 : 1;
  const v0 = (sit ? 0.5 : 0.62) + (st.bob || 0);
  const U = u => fx + u * s, V = v => fy - v * s;
  const lw = Math.max(4, 0.026 * s);
  const shirt = kind === 'kharis' ? C.shirtK : kind === 'dimas' ? C.shirtD : C.shirtB;

  // shadow
  if (!sit) { g.beginPath(); g.ellipse(fx, fy, 0.32 * s * fat, 0.05 * s, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fill(); }

  // legs
  if (!sit) {
    const ph = st.pose === 'walk' ? (st.t || 0) * 9 : 0;
    [-1, 1].forEach(sd => {
      const sw = st.pose === 'walk' ? Math.sin(ph + (sd > 0 ? Math.PI : 0)) : 0;
      const lift = st.pose === 'walk' ? Math.max(0, -Math.sin(ph + (sd > 0 ? Math.PI : 0))) * 0.06 : 0;
      const hx = U(sd * 0.07 * fat), hy = V(v0 + 0.05);
      const kx = U(sd * 0.1 + sw * 0.06), ky = V(0.33 + lift);
      const ax = U(sd * 0.12 + sw * 0.12), ay = V(0.02 + lift);
      g.beginPath(); g.moveTo(hx, hy); g.quadraticCurveTo(kx, ky, ax, ay);
      g.lineTo(ax + sd * 0.08 * s, ay + 0.005 * s);
      g.strokeStyle = C.ol; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke();
    });
  }

  // torso (bean)
  const tw = 0.17 * fat, bw = 0.235 * fat, th = 0.55;
  g.beginPath();
  g.moveTo(U(-tw), V(v0 + th));
  g.quadraticCurveTo(U(0), V(v0 + th + 0.06), U(tw), V(v0 + th));
  g.bezierCurveTo(U(bw + 0.05 * fat), V(v0 + th * 0.62), U(bw + 0.04), V(v0 + 0.04), U(bw * 0.92), V(v0));
  g.quadraticCurveTo(U(0), V(v0 - 0.06), U(-bw * 0.92), V(v0));
  g.bezierCurveTo(U(-bw - 0.04), V(v0 + 0.04), U(-bw - 0.05 * fat), V(v0 + th * 0.62), U(-tw), V(v0 + th));
  g.closePath();
  g.fillStyle = shirt; g.fill(); g.strokeStyle = C.ol; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke();
  // collar
  g.beginPath(); g.moveTo(U(-0.08), V(v0 + th + 0.02)); g.lineTo(U(0), V(v0 + th - 0.07)); g.lineTo(U(0.08), V(v0 + th + 0.02));
  g.strokeStyle = C.ol; g.lineWidth = lw * 0.7; g.stroke();
  if (kind === 'bos') {
    poly([[U(-0.035), V(v0 + th - 0.06)], [U(0.035), V(v0 + th - 0.06)], [U(0.05), V(v0 + 0.18)], [U(0), V(v0 + 0.12)], [U(-0.05), V(v0 + 0.18)]], C.red, C.ol, lw * 0.6);
  } else {
    for (let i = 0; i < 3; i++) circ(U(0), V(v0 + th - 0.17 - i * 0.12), 0.012 * s, 'rgba(0,0,0,0.35)');
    if (kind === 'kharis') { rr(U(0.06), V(v0 + th - 0.16), 0.09 * s, 0.07 * s, 3); g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = lw * 0.5; g.stroke(); }
  }

  // head
  const hr = 0.31 * s;
  const hcx = U(0) + (st.headDx || 0) * s, hcy = V(v0 + th + 0.22) + (st.headDy || 0) * s;
  st._shoulders = [[U(-tw * 0.95), V(v0 + th - 0.08)], [U(tw * 0.95), V(v0 + th - 0.08)]];
  st._head = [hcx, hcy, hr];
  if (!st.armsLater) drawArms(kind, s, st);

  circ(hcx, hcy, hr, '#fff', C.ol, lw);
  drawFace(kind, hcx, hcy, hr, st, lw);
}

function drawArms(kind, s, st) {
  const lw = Math.max(4, 0.026 * s);
  const [hcx, hcy, hr] = st._head;
  const arms = st.arms || {};
  [['l', 0], ['r', 1]].forEach(([k, i]) => {
    const sd = i ? 1 : -1;
    const [sx, sy] = st._shoulders[i];
    let a = arms[k] || 'down', hx, hy, bend = sd;
    if (Array.isArray(a)) { [hx, hy] = a; bend = -sd * 0.6; }
    else if (a === 'down') { hx = sx + sd * 0.12 * s; hy = sy + 0.5 * s; bend = sd * 0.4; }
    else if (a === 'hip') { hx = sx + sd * 0.18 * s; hy = sy + 0.3 * s; bend = sd * 1.6; }
    else if (a === 'up') { hx = sx + sd * 0.2 * s; hy = sy - 0.52 * s; bend = sd * 0.5; }
    else if (a === 'salute') { hx = hcx + sd * hr * 0.55; hy = hcy - hr * 0.55; bend = sd * 2.2; }
    else if (a === 'clap') { const c2 = Math.abs(Math.sin((st.t || 0) * 14)); hx = hcx + sd * (0.03 + c2 * 0.1) * s; hy = sy + 0.12 * s; bend = sd * 1.2; }
    const mx = (sx + hx) / 2, my = (sy + hy) / 2, dx = hx - sx, dy = hy - sy, len = Math.hypot(dx, dy) || 1;
    const cx = mx + (-dy / len) * bend * 0.12 * s * Math.sign(dx || sd) * sd + sd * 0.06 * s * Math.abs(bend);
    const cy = my + (dx / len) * bend * 0.0 * s + 0.02 * s;
    g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(cx, cy, hx, hy);
    g.strokeStyle = C.ol; g.lineWidth = lw; g.lineCap = 'round'; g.stroke();
    if (st.hold && st.hold[k]) st.hold[k](hx, hy, s);
    circ(hx, hy, 0.045 * s, '#fff', C.ol, lw * 0.75);
  });
}

function drawFace(kind, cx, cy, r, st, lw) {
  const exp = st.exp || 'neutral', look = st.look || [0, 0];
  const ex = r * 0.34, ey = cy - r * 0.02;
  const lx = look[0] * r * 0.07, ly = look[1] * r * 0.07;

  // hair
  if (kind === 'kharis') {
    const d = st.hairDroop || 0, sway = Math.sin((st.t || 0) * 3) * 0.04 * (1 - d);
    const bx = cx + r * 0.02, by = cy - r + lw * 0.3;
    const endX = cx + r * lerp(0.34 + sway, 0.66, d), endY = cy - r * lerp(1.78, 0.95, d);
    g.beginPath(); g.moveTo(bx, by);
    g.bezierCurveTo(cx - r * lerp(0.32, -0.1, d), cy - r * lerp(1.65, 1.2, d), cx + r * lerp(0.5, 0.5, d), cy - r * lerp(2.0, 1.25, d), endX, endY);
    g.strokeStyle = C.hairK; g.lineWidth = r * 0.12; g.lineCap = 'round'; g.stroke();
    g.beginPath(); g.arc(endX - r * 0.1, endY + r * 0.03, r * 0.1, 0.2, Math.PI * 1.4); g.stroke();
  } else if (kind === 'dimas') {
    g.beginPath(); g.arc(cx, cy, r, Math.PI * 1.05, Math.PI * 1.95);
    g.quadraticCurveTo(cx + r * 0.3, cy - r * 0.45, cx - r * 0.25, cy - r * 0.55);
    g.quadraticCurveTo(cx - r * 0.7, cy - r * 0.45, cx - r * 0.98, cy - r * 0.2);
    g.closePath(); g.fillStyle = C.hairD; g.fill(); g.strokeStyle = C.ol; g.lineWidth = lw * 0.8; g.stroke();
  } else if (kind === 'bos') {
    [-1, 1].forEach(sd => { g.beginPath(); g.ellipse(cx + sd * r * 0.92, cy - r * 0.15, r * 0.12, r * 0.22, 0, 0, Math.PI * 2); g.fillStyle = '#9aa0ad'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = lw * 0.6; g.stroke(); });
    g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = lw * 0.5;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(cx, cy - r * 0.2 + i * r * 0.06, r * 0.5, Math.PI * 1.32, Math.PI * 1.68); g.stroke(); }
    g.beginPath(); g.arc(cx - r * 0.35, cy - r * 0.55, r * 0.14, Math.PI * 1.1, Math.PI * 1.6); g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = lw; g.stroke();
  }

  // eyes
  g.lineCap = 'round';
  const eyeR = kind === 'dimas' ? r * 0.2 : r * 0.17;
  [-1, 1].forEach(sd => {
    const x = cx + sd * ex, y = ey;
    if (kind === 'dimas') { circ(x, y, eyeR, 'rgba(200,235,255,0.55)', C.ol, lw * 0.8); }
    if (exp === 'happy' || exp === 'proud') {
      g.beginPath(); g.arc(x, y + r * 0.06, r * 0.1, Math.PI * 1.1, Math.PI * 1.9); g.strokeStyle = C.ol; g.lineWidth = lw * 0.9; g.stroke();
    } else if (kind === 'bos') {
      circ(x + lx, y + ly, r * 0.055, C.ol);
    } else {
      if (kind === 'kharis') circ(x, y, eyeR, '#fff', C.ol, lw * 0.75);
      const pr = exp === 'shock' ? r * 0.045 : r * 0.075;
      circ(x + lx, y + ly, pr, C.ol);
      if (exp === 'tired') {
        g.beginPath(); g.arc(x, y, eyeR, Math.PI, 0); g.lineTo(x - eyeR, y); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = lw * 0.75; g.stroke();
        g.beginPath(); g.arc(x, y + eyeR * 0.6, eyeR * 0.9, Math.PI * 0.2, Math.PI * 0.8); g.strokeStyle = '#7d6bb0'; g.lineWidth = lw * 0.6; g.stroke();
      }
    }
    if (kind === 'dimas') { /* bridge */ if (sd < 0) line([x + eyeR, y], [x + 2 * ex - eyeR, y], C.ol, lw * 0.7); }
    // brows
    const bt = { neutral: 0, tired: -0.15, shock: 0.25, happy: 0.1, proud: 0.15, salute: -0.25, angry: -0.35 }[exp] || 0;
    const by = y - eyeR - r * (exp === 'shock' ? 0.2 : 0.1);
    g.beginPath(); g.moveTo(x - sd * r * 0.13, by - bt * sd * r * 0.12 * -1 + (bt < 0 ? 0 : 0)); g.lineTo(x + sd * r * 0.13, by + bt * r * 0.15 * -1);
    g.strokeStyle = kind === 'bos' ? C.ol : (kind === 'dimas' ? C.hairD : C.hairK); g.lineWidth = kind === 'bos' ? lw * 1.4 : lw * 0.8; g.stroke();
  });

  // mouth
  const mx = cx + r * 0.06, my = cy + r * 0.45;
  g.strokeStyle = C.ol; g.lineWidth = lw * 0.8;
  if (kind === 'bos') {
    g.beginPath(); g.moveTo(mx - r * 0.3, my - r * 0.02);
    g.quadraticCurveTo(mx - r * 0.15, my - r * 0.2, mx, my - r * 0.1); g.quadraticCurveTo(mx + r * 0.15, my - r * 0.2, mx + r * 0.3, my - r * 0.02);
    g.quadraticCurveTo(mx, my - r * 0.02, mx - r * 0.3, my - r * 0.02); g.fillStyle = '#3a3a3a'; g.fill(); g.stroke();
    if (exp === 'happy' || exp === 'proud') { g.beginPath(); g.arc(mx, my + r * 0.02, r * 0.1, 0.2, Math.PI - 0.2); g.stroke(); }
  } else if (exp === 'shock') {
    g.beginPath(); g.ellipse(mx, my + r * 0.04, r * 0.11, r * 0.16, 0, 0, Math.PI * 2); g.fillStyle = '#5a1f2a'; g.fill(); g.stroke();
  } else if (exp === 'happy' || exp === 'proud' || exp === 'salute') {
    g.beginPath(); g.moveTo(mx - r * 0.2, my - r * 0.04); g.quadraticCurveTo(mx, my + r * 0.22, mx + r * 0.2, my - r * 0.04); g.closePath();
    g.fillStyle = '#5a1f2a'; g.fill(); g.stroke();
  } else if (exp === 'tired') {
    g.beginPath(); g.moveTo(mx - r * 0.14, my); g.quadraticCurveTo(mx - r * 0.07, my - r * 0.05, mx, my); g.quadraticCurveTo(mx + r * 0.07, my + r * 0.05, mx + r * 0.14, my); g.stroke();
  } else {
    g.beginPath(); g.moveTo(mx - r * 0.1, my); g.lineTo(mx + r * 0.08, my - r * 0.02); g.stroke();
  }
}

// ═════════════════════════ FX & TEXT ═════════════════════════
function nightGrade(a) {
  if (a <= 0) return;
  g.save(); g.globalCompositeOperation = 'multiply';
  g.fillStyle = `rgba(${Math.round(lerp(255, 105, a))},${Math.round(lerp(255, 115, a))},${Math.round(lerp(255, 185, a))},1)`;
  g.fillRect(-400, -400, W + 800, H + 800); g.restore();
}
function confetti(t, n) {
  for (let i = 0; i < n; i++) {
    const x = rnd(i) * W * 1.2 - 60, sp = 260 + rnd(i + 9) * 260;
    const y = ((rnd(i + 3) * 1400 + t * sp) % 1500) - 150;
    g.save(); g.translate(x + Math.sin(t * 3 + i) * 30, y); g.rotate(t * 4 * (rnd(i + 5) - 0.5) * 3);
    g.fillStyle = [C.red, C.yellow, C.teal, '#7fb6f0', '#ff8fc8'][i % 5]; g.fillRect(-9, -5, 18, 10); g.restore();
  }
}
function spotlight(x, y, r, a) {
  g.save(); g.globalCompositeOperation = 'lighter';
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(255,240,180,${a})`); gr.addColorStop(1, 'rgba(255,240,180,0)');
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); g.restore();
}
function strokeText(txt, x, y, size, fill, opts) {
  opts = opts || {};
  g.font = `900 ${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.miterLimit = 2; g.letterSpacing = Math.round(size * 0.03) + 'px';
  g.lineWidth = size * (opts.sw || 0.16); g.strokeStyle = opts.stroke || '#111';
  if (opts.shadow !== false) { g.save(); g.fillStyle = 'rgba(0,0,0,0.35)'; g.strokeStyle = 'rgba(0,0,0,0.35)'; g.strokeText(txt, x + size * 0.06, y + size * 0.08); g.restore(); }
  g.strokeText(txt, x, y); g.fillStyle = fill || '#fff'; g.fillText(txt, x, y);
}
function fitSize(txt, size, maxW) { g.font = `900 ${size}px ${FONT}`; g.letterSpacing = Math.round(size * 0.03) + 'px'; const w = g.measureText(txt).width; return w > maxW ? Math.floor(size * maxW / w) : size; }

// word-timed caption: words = [[word, start, end], ...]; shows the current chunk of up to 3 words
function caption(words, t, y) {
  let idx = -1;
  for (let i = 0; i < words.length; i++) if (t >= words[i][1]) idx = i;
  if (idx < 0 || t > words[words.length - 1][2] + 0.25) return;
  const c0 = Math.floor(idx / 3) * 3, chunk = words.slice(c0, c0 + 3);
  const txt = chunk.map(w => w[0]).join(' ');
  const size = fitSize(txt, 104, W - 140);
  g.font = `900 ${size}px ${FONT}`;
  const total = chunk.reduce((a, w) => a + g.measureText(w[0]).width, 0) + (chunk.length - 1) * size * 0.32; let x = W / 2 - total / 2;
  chunk.forEach((w, k) => {
    const ww = g.measureText(w[0]).width, cur = c0 + k === idx;
    const pop = cur ? 1 + 0.12 * (1 - easeOut(seg(t, w[1], w[1] + 0.12))) : 1;
    g.save(); g.translate(x + ww / 2, y); g.scale(pop, pop);
    strokeText(w[0], 0, 0, size, cur ? C.yellow : '#fff');
    g.restore();
    x += ww + size * 0.32;
  });
}
// split a sentence into word timings across [a,b]
function timeWords(text, a, b) {
  const ws = text.split(/\s+/), tot = ws.reduce((s, w) => s + w.length + 2, 0);
  let acc = a; return ws.map(w => { const d = (w.length + 2) / tot * (b - a); const r = [w, acc, acc + d]; acc += d; return r; });
}
function bubble(x, y, txt, sc, tailX, tailY) {
  if (sc <= 0) return;
  g.save(); g.translate(x, y); g.scale(sc, sc);
  const size = 66; g.font = `900 ${size}px ${FONT}`; const w = g.measureText(txt).width + 70, h = size + 50;
  g.beginPath(); g.moveTo(-w * 0.2, h / 2 - 4); g.lineTo((tailX - x) / sc, (tailY - y) / sc); g.lineTo(-w * 0.02, h / 2 - 4); g.closePath();
  g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke();
  rr(-w / 2, -h / 2, w, h, 34); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-w * 0.2 + 4, h / 2 - 3); g.lineTo(-w * 0.02 - 4, h / 2 - 3); g.strokeStyle = '#fff'; g.lineWidth = 9; g.stroke();
  g.fillStyle = C.ol; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 4);
  g.restore();
}
function vignette() {
  const gr = g.createRadialGradient(W / 2, H * 0.5, H * 0.35, W / 2, H * 0.5, H * 0.75);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.35)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
