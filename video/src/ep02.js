// Ep.02 "Kenapa Kita Suka Nunda? (Bukan Karena Malas)" — timeline synced to VO word timings

// ── extra props for this episode ──────────────────────────────
function drawDeadlineTag(t) {
  // red folder + standing sign on Kharis' desk
  drawFolder(-0.05, 0.3, DESK.y, 3.42, C.red, 0);
  drawFolder(-0.05, 0.3, DESK.y + 0.035, 3.42, '#f06a6a', 0);
  const [x, y, w, h] = frontRect(0.05, DESK.y + 0.07, 0.52, DESK.y + 0.27, 3.32);
  const wob = Math.sin(t * 6) * 0.03;
  g.save(); g.translate(x + w / 2, y + h); g.rotate(wob);
  rr(-w / 2, -h, w, h, 6); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
  g.fillStyle = C.red; g.font = `900 ${Math.round(h * 0.3)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('DEADLINE', 0, -h * 0.66); g.fillText('BESOK!', 0, -h * 0.3);
  g.restore();
}
function drawCloth(x, y, s, rot) {
  g.save(); g.translate(x, y); g.rotate(rot || 0);
  g.beginPath(); g.moveTo(-0.09 * s, -0.05 * s); g.quadraticCurveTo(0, -0.09 * s, 0.1 * s, -0.04 * s); g.lineTo(0.08 * s, 0.07 * s); g.quadraticCurveTo(0, 0.1 * s, -0.1 * s, 0.06 * s); g.closePath();
  g.fillStyle = '#7fd3ff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
  g.restore();
}
function heldMug(x, y, s) {
  const w = 0.15 * s, h = 0.19 * s;
  g.beginPath(); g.arc(x + w * 0.5, y - h * 0.55, w * 0.32, -Math.PI / 2, Math.PI / 2); g.strokeStyle = C.ol; g.lineWidth = 6; g.stroke();
  rr(x - w * 0.5, y - h, w, h, 8); g.fillStyle = '#F5C451'; g.fill(); g.lineWidth = 5; g.stroke();
}
function sparkle(x, y, r, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.translate(x, y);
  g.beginPath(); for (let i = 0; i < 8; i++) { const rad = i % 2 ? r * 0.3 : r, an = i / 8 * Math.PI * 2; g.lineTo(Math.cos(an) * rad, Math.sin(an) * rad); }
  g.closePath(); g.fillStyle = '#fff6b0'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 3; g.stroke(); g.restore();
}
function bubbles(x, y, t, s) {
  for (let i = 0; i < 7; i++) {
    const q = (t * 0.9 + i / 7) % 1;
    circ(x + Math.sin(i * 3 + t * 4) * 0.12 * s, y - q * 0.5 * s, (0.025 + 0.02 * rnd(i)) * s * (1 - q * 0.3), `rgba(255,255,255,${0.9 * (1 - q)})`, `rgba(29,32,48,${0.6 * (1 - q)})`, 3);
  }
}
function drawKeyboardHeld(x, y, s) {
  g.save(); g.translate(x, y); g.rotate(-0.15);
  rr(-0.24 * s, -0.06 * s, 0.48 * s, 0.12 * s, 8); g.fillStyle = '#e9ebf3'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#b9bfd0'; for (let r = 0; r < 2; r++) for (let c = 0; c < 8; c++) g.fillRect(-0.21 * s + c * 0.053 * s, -0.04 * s + r * 0.04 * s, 0.04 * s, 0.03 * s);
  g.restore();
}
function drawBrain(x, y, r, t, o) {
  o = o || {};
  g.save(); g.translate(x, y);
  if (o.run) {
    [-1, 1].forEach(sd => { const ph = t * 16 + (sd > 0 ? Math.PI : 0); g.beginPath(); g.moveTo(sd * r * 0.35, r * 0.6); g.lineTo(sd * r * 0.35 + Math.sin(ph) * r * 0.35, r * 1.15 - Math.max(0, Math.cos(ph)) * r * 0.15); g.strokeStyle = C.ol; g.lineWidth = 8; g.lineCap = 'round'; g.stroke(); });
  } else {
    [-1, 1].forEach(sd => { g.beginPath(); g.moveTo(sd * r * 0.35, r * 0.6); g.lineTo(sd * r * 0.42, r * 1.15); g.strokeStyle = C.ol; g.lineWidth = 8; g.lineCap = 'round'; g.stroke(); });
  }
  g.beginPath();
  for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, k = 1 + 0.07 * Math.sin(a * 9); const px = Math.cos(a) * r * 1.15 * k, py = Math.sin(a) * r * 0.85 * k; i ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.closePath(); g.fillStyle = '#F7A8C4'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 6; g.stroke();
  g.strokeStyle = '#d06f96'; g.lineWidth = 5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, -r * 0.8); g.quadraticCurveTo(r * 0.12, 0, 0, r * 0.75); g.stroke();
  [[-0.6, -0.35], [0.55, -0.4], [-0.7, 0.3], [0.65, 0.25]].forEach(([dx, dy]) => { g.beginPath(); g.arc(dx * r, dy * r, r * 0.2, 0.3, Math.PI * 1.3); g.stroke(); });
  const scared = o.exp === 'scared', happy = o.exp === 'happy';
  [-1, 1].forEach(sd => {
    circ(sd * r * 0.3, -r * 0.05, r * 0.17, '#fff', C.ol, 4);
    circ(sd * r * 0.3 + (o.look || 0) * r * 0.06, -r * 0.05, scared ? r * 0.05 : r * 0.08, C.ol);
  });
  g.strokeStyle = C.ol; g.lineWidth = 5;
  g.beginPath();
  if (happy) g.arc(0, r * 0.25, r * 0.18, 0.2, Math.PI - 0.2);
  else if (scared) { g.moveTo(-r * 0.2, r * 0.32); for (let i = 1; i <= 4; i++) g.lineTo(-r * 0.2 + i * r * 0.1, r * 0.32 + (i % 2 ? -1 : 1) * r * 0.05); }
  else { g.moveTo(-r * 0.12, r * 0.3); g.lineTo(r * 0.12, r * 0.3); }
  g.stroke();
  if (scared) sweat(r * 1.0, -r * 0.5, r * 0.12);
  if (o.note) { g.save(); g.translate(r * 0.9, r * 0.1); g.rotate(0.15); g.fillStyle = C.yellow; g.fillRect(-r * 0.55, -r * 0.35, r * 1.1, r * 0.7); g.strokeStyle = C.ol; g.lineWidth = 4; g.strokeRect(-r * 0.55, -r * 0.35, r * 1.1, r * 0.7);
    g.fillStyle = C.red; g.font = `900 ${Math.round(r * 0.2)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BELUM', 0, -r * 0.1); g.fillText('SELESAI!', 0, r * 0.14); g.restore(); }
  g.restore();
}
function drawGloomCloud(x, y, sc, label, t) {
  if (sc <= 0) return;
  g.save(); g.translate(x + Math.sin(t * 2 + x) * 6, y); g.scale(sc, sc);
  g.beginPath(); [[-70, 10, 50], [-20, -20, 62], [45, -5, 55], [80, 20, 40], [0, 25, 55]].forEach(([cx, cy, r]) => { g.moveTo(cx + r, cy); g.arc(cx, cy, r, 0, Math.PI * 2); });
  g.fillStyle = '#5b5f73'; g.fill();
  g.strokeStyle = C.ol; g.lineWidth = 6; g.stroke();
  g.beginPath(); [[-70, 10, 50], [-20, -20, 62], [45, -5, 55], [80, 20, 40], [0, 25, 55]].forEach(([cx, cy, r]) => { g.moveTo(cx + r - 6, cy); g.arc(cx, cy, r - 6, 0, Math.PI * 2); }); g.fill();
  if (label) { g.fillStyle = '#fff'; g.font = `900 30px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; const ls = label.split('\n'); ls.forEach((l, i) => g.fillText(l, 5, 8 + (i - (ls.length - 1) / 2) * 34)); }
  g.strokeStyle = C.yellow; g.lineWidth = 6; g.lineJoin = 'miter';
  g.beginPath(); g.moveTo(-10, 75); g.lineTo(-25, 105); g.lineTo(-5, 105); g.lineTo(-20, 140); g.stroke();
  g.restore();
}
function evilFolder(x, y, s, t) {
  g.save(); g.translate(x, y + Math.sin(t * 5) * 5);
  rr(-0.45 * s, -0.32 * s, 0.9 * s, 0.64 * s, 10); g.fillStyle = C.red; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 6; g.stroke();
  rr(-0.45 * s, -0.42 * s, 0.35 * s, 0.14 * s, 6); g.fill(); g.stroke();
  g.fillStyle = '#fff'; g.font = `900 ${Math.round(0.14 * s)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('LAPORAN', 0, 0.18 * s);
  [-1, 1].forEach(sd => { circ(sd * 0.15 * s, -0.08 * s, 0.07 * s, '#fff', C.ol, 3); circ(sd * 0.15 * s, -0.06 * s, 0.03 * s, C.ol); line([sd * 0.25 * s, -0.2 * s], [sd * 0.06 * s, -0.14 * s], C.ol, 6); });
  g.restore();
}
function choiceCard(x, y, w, h, label, col, sc, crossed) {
  if (sc <= 0) return;
  g.save(); g.translate(x, y); g.scale(sc, sc);
  rr(-w / 2, -h / 2, w, h, 26); g.fillStyle = col; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke();
  g.fillStyle = '#fff'; g.font = `900 46px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  label.split('\n').forEach((l, i, a) => g.fillText(l, 0, (i - (a.length - 1) / 2) * 52 + 3));
  if (crossed > 0) { g.strokeStyle = C.red; g.lineWidth = 16; g.lineCap = 'round'; const k = crossed; g.beginPath(); g.moveTo(-w * 0.4, -h * 0.35); g.lineTo(-w * 0.4 + w * 0.8 * k, -h * 0.35 + h * 0.7 * k); g.stroke(); }
  g.restore();
}
function cursorHand(x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 70); g.lineTo(18, 54); g.lineTo(32, 84); g.lineTo(44, 78); g.lineTo(30, 49); g.lineTo(54, 48); g.closePath();
  g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 5; g.lineJoin = 'round'; g.stroke(); g.restore();
}
function drawFridge(open, t) {
  const X1 = -0.15, X2 = 0.55, Z = 5.35, Hh = 1.9;
  const [x, y, w, h] = frontRect(X1, 0, X2, Hh, Z);
  // body
  poly([P(X1, Hh, Z + 0.6), P(X2, Hh, Z + 0.6), P(X2, Hh, Z), P(X1, Hh, Z)], '#7fc6db', C.ol, 4);
  if (open > 0) {
    rr(x, y, w, h, 18); g.fillStyle = '#e8f6fb'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 5; g.stroke();
    g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x + w / 2, y + h * 0.4, 0, x + w / 2, y + h * 0.4, w * 1.6); gr.addColorStop(0, `rgba(255,250,200,${0.5 * open})`); gr.addColorStop(1, 'rgba(255,250,200,0)'); g.fillStyle = gr; g.fillRect(x - w, y - h * 0.3, w * 3, h * 1.6); g.restore();
    for (let i = 1; i < 4; i++) { g.strokeStyle = '#9ccfe0'; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 10, y + h * i / 4); g.lineTo(x + w - 10, y + h * i / 4); g.stroke(); }
    rr(x + w * 0.12, y + h * 0.12, w * 0.22, h * 0.11, 6); g.fillStyle = '#f5f5f5'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 3; g.stroke();
    circ(x + w * 0.62, y + h * 0.42, w * 0.08, '#e84545', C.ol, 3); rr(x + w * 0.2, y + h * 0.36, w * 0.18, h * 0.12, 6); g.fillStyle = '#ffd84a'; g.fill(); g.stroke();
    // door swung towards camera on the right hinge
    const a = open * 1.35, ex = X2 - Math.cos(a) * (X2 - X1), ez = Z - Math.sin(a) * (X2 - X1);
    poly([P(X2, Hh, Z), P(ex, Hh, ez), P(ex, 0.05, ez), P(X2, 0.05, Z)], '#9fd8e8', C.ol, 5);
  } else {
    rr(x, y, w, h, 18); g.fillStyle = '#9fd8e8'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 5; g.stroke();
    rr(x + w * 0.8, y + h * 0.3, w * 0.07, h * 0.3, 6); g.fillStyle = '#6aaec4'; g.fill(); g.stroke();
    g.fillStyle = C.yellow; g.fillRect(x + w * 0.2, y + h * 0.2, w * 0.25, h * 0.08); g.strokeRect(x + w * 0.2, y + h * 0.2, w * 0.25, h * 0.08);
  }
}
function timerPill(t, txt, col) {
  g.save(); g.translate(540, 170);
  rr(-190, -62, 380, 124, 62); g.fillStyle = col || '#1d2030'; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 7; g.stroke();
  g.fillStyle = '#fff'; g.font = `900 78px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 5);
  g.restore();
}
function progressBar(x, y, w, p, label) {
  rr(x - w / 2, y - 30, w, 60, 30); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 6; g.stroke();
  g.save(); rr(x - w / 2 + 6, y - 24, (w - 12) * clamp(p, 0.02, 1), 48, 24); g.fillStyle = '#2fa55a'; g.fill(); g.restore();
  g.fillStyle = C.ol; g.font = `900 34px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`${label} ${Math.round(p * 100)}%`, x, y + 2);
}
function docCard(t, t0, typeAt) {
  const sc = pop(t, t0, 0.3); if (sc <= 0) return;
  g.save(); g.translate(540, 560); g.scale(sc, sc);
  const w = 820, h = 360;
  rr(-w / 2 + 8, -h / 2 + 10, w, h, 22); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fill();
  rr(-w / 2, -h / 2, w, h, 22); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 6; g.stroke();
  g.save(); rr(-w / 2, -h / 2, w, 76, 22); g.clip(); g.fillStyle = C.shirtK; g.fillRect(-w / 2, -h / 2, w, 76); g.restore();
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.font = `900 36px ${FONT}`; g.fillText('Laporan.docx', -w / 2 + 30, -h / 2 + 40);
  const full = 'Bab 1: Latar belakang proyek ini adalah';
  const n = t < typeAt ? 0 : Math.floor(clamp((t - typeAt) / 1.6, 0, 1) * full.length);
  g.fillStyle = C.ol; g.font = `800 38px ${FONT}`; g.fillText(full.slice(0, n) + (Math.floor(t * 3) % 2 ? '|' : ''), -w / 2 + 30, -h / 2 + 140);
  g.fillStyle = '#e3e6ee'; for (let i = 0; i < 3; i++) g.fillRect(-w / 2 + 30, -h / 2 + 200 + i * 44, w - 60 - i * 120, 18);
  g.restore();
}
function rewindFx(t, t0, label) {
  const q = seg(t, t0, t0 + 0.9); if (q <= 0 || q >= 1) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = `rgba(20,20,40,${0.35 * (1 - q)})`; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) { const y = (rnd(i + Math.floor(t * 30)) * H); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, y, W, 4 + rnd(i) * 8); }
  g.fillStyle = '#fff'; g.strokeStyle = C.ol; g.lineWidth = 6;
  [0, 70].forEach(dx => { g.beginPath(); g.moveTo(420 + dx, 860); g.lineTo(480 + dx, 820); g.lineTo(480 + dx, 900); g.closePath(); g.fill(); g.stroke(); });
  strokeText(label, 600, 862, 54, '#fff');
  g.restore();
}

// ═════════════════════ SCENE 1 — HOOK ═════════════════════
const E1 = { rajin: at('rajin…'), beresin: at('beresin', 0), cuci: at('cuci'), ngelap: at('ngelap') };
const KX = 0.85, KZ = 3.3;
function scene1(t) {
  const early = t < E1.beresin;
  if (t < E1.rajin - 0.4) cam(1.6 - 0.1 * seg(t, 0, 1.6), ...P(0.45, 1.15, 3.35));
  else cam(1.3, 700, 1000);
  drawRoom(); drawWindow(true); drawWhiteboard(); drawClock(22, false); drawDoor(0); drawCabinet(); drawFloorPlant();
  drawChairBack(-0.05, 4.4); drawDeskTop(); drawMonitor(false); drawKeyboard();
  drawDeadlineTag(t);
  // desk shine while wiping
  const wiping = t >= E1.beresin && t < E1.cuci;
  drawDeskFront();
  const [kx, ky] = P(KX, 0, KZ), ks = S(KZ);
  let st;
  if (early) {
    st = { exp: t < E1.rajin ? 'shock' : 'happy', t, look: [-1, 0.6], arms: t < E1.rajin ? { l: 'hip', r: 'hip' } : { l: 'down', r: 'up' } };
  } else if (wiping) {
    const wx = P(0.15 + Math.sin(t * 13) * 0.18, DESK.y + 0.02, 3.55);
    st = { exp: 'happy', t, look: [-1, 0.6], arms: { l: wx, r: 'hip' }, hold: { l: (x, y, s) => drawCloth(x, y, s, Math.sin(t * 13) * 0.3) } };
  } else if (t < E1.ngelap) {
    st = { exp: 'happy', t, look: [0, 0.5], arms: { l: [kx - 0.06 * ks, ky - 0.92 * ks], r: [kx + 0.12 * ks, ky - 0.98 * ks + Math.sin(t * 14) * 8] } };
  } else {
    st = { exp: 'happy', t, look: [0, 0.5], arms: { l: [kx - 0.1 * ks, ky - 0.95 * ks], r: [kx + 0.12 * ks + Math.sin(t * 13) * 20, ky - 1.02 * ks] },
      hold: { l: (x, y, s) => drawKeyboardHeld(x + 0.12 * s, y, s), r: (x, y, s) => drawCloth(x, y - 0.03 * s, s, Math.sin(t * 13) * 0.3) } };
  }
  drawChar('kharis', kx, ky, ks, st);
  const [hx, hy, hr] = st._head;
  if (t >= E1.cuci && t < E1.ngelap) { const mx = kx + 0.03 * ks, my = ky - 0.9 * ks; heldMug(mx, my, ks); bubbles(mx, my - 0.2 * ks, t, ks); }
  if (wiping) for (let i = 0; i < 5; i++) { const [sx, sy] = P(-0.9 + i * 0.35, DESK.y + 0.08, 3.5); sparkle(sx, sy - 10, 26, 0.5 + 0.5 * Math.sin(t * 9 + i)); }
  if (t >= E1.rajin && early) for (let i = 0; i < 4; i++) sparkle(hx + Math.cos(i * 1.6 + t) * hr * 1.5, hy + Math.sin(i * 1.6 + t) * hr * 1.2, 22, 1);
  if (t < E1.rajin) sweat(hx + hr * 0.95, hy - hr * 0.2 + ((t * 40) % 25), 15);
  drawLamp(true);
  nightGrade(0.45);
  glowAt(...P(-0.55, 2.4, 3.4), 520, '255,225,160', 0.3);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (!early) {
    const lbl = wiping ? 'BERESIN MEJA' : t < E1.ngelap ? 'CUCI GELAS' : 'NGELAP KEYBOARD';
    const t0 = wiping ? E1.beresin : t < E1.ngelap ? E1.cuci : E1.ngelap;
    const sc = pop(t, t0, 0.25); g.save(); g.translate(540, 300); g.scale(sc, sc); g.rotate(-0.04);
    rr(-330, -62, 660, 124, 20); g.fillStyle = '#2fa55a'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke();
    g.fillStyle = '#fff'; g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(lbl, 0, 5); g.restore();
  }
}

// ═════════════════════ SCENE 2 — "BUKAN MALAS" ═════════════════════
const E2 = { malas: at('malas', 0), ternyata: at('Ternyata…'), bukan: at('bukan', 0) };
function stamp(x, y, sc, rot, crossed) {
  if (sc <= 0) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
  rr(-200, -70, 400, 140, 14); g.strokeStyle = C.red; g.lineWidth = 12; g.stroke();
  g.fillStyle = C.red; g.font = `900 96px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MALAS', 0, 6);
  if (crossed > 0) { g.strokeStyle = C.ol; g.lineWidth = 22; g.lineCap = 'round'; [[-1, 1], [1, 1]].forEach(([a], i) => { const k = clamp(crossed * 2 - i, 0, 1); if (k <= 0) return; g.beginPath(); g.moveTo(-230 * a, -110); g.lineTo(-230 * a + 460 * a * k, -110 + 220 * k); g.stroke(); }); }
  g.restore();
}
function scene2(t) {
  const l = t - CUT[1];
  const slam = t >= E2.malas ? 1 - easeOut(seg(t, E2.malas, E2.malas + 0.15)) : 0;
  cam(1.5 + 0.04 * l / 4, 720, 1010, Math.sin(t * 80) * 16 * slam, Math.cos(t * 70) * 10 * slam);
  drawRoom(); drawWindow(true); drawWhiteboard(); drawClock(22.3, false); drawDoor(0); drawCabinet(); drawFloorPlant();
  drawChairBack(-0.05, 4.4); drawDeskTop(); drawMonitor(false); drawKeyboard(); drawDeadlineTag(t); drawDeskFront();
  const [kx, ky] = P(KX, 0, KZ), ks = S(KZ);
  const exp = t < E2.malas ? 'neutral' : t < E2.bukan ? 'sad' : 'happy';
  const st = { exp, t, look: t < E2.bukan ? [0, -1] : [0, 0], arms: t < E2.bukan ? { l: 'down', r: 'down' } : { l: 'hip', r: 'up' }, hairDroop: t >= E2.malas && t < E2.bukan ? 0.8 : 0 };
  drawChar('kharis', kx, ky, ks, st);
  drawLamp(true); nightGrade(0.45); glowAt(...P(-0.55, 2.4, 3.4), 520, '255,225,160', 0.3);
  const [hx, hy, hr] = st._head;
  if (t >= E2.malas) {
    const fly = t >= E2.bukan ? easeOut(seg(t, E2.bukan + 0.25, E2.bukan + 0.6)) : 0;
    const sc = t < E2.malas + 0.12 ? lerp(1.8, 0.62, seg(t, E2.malas, E2.malas + 0.12)) : 0.62;
    stamp(hx + fly * 700, hy - hr * 1.55 - fly * 500, sc, -0.12 + fly * 1.5, seg(t, E2.ternyata, E2.bukan));
  }
  if (t >= E2.ternyata && t < E2.bukan) strokeText('?', hx + hr * 1.3, hy - hr * 0.6 + Math.sin(t * 8) * 6, 90, C.yellow);
}

// ═════════════════════ SCENE 3 — OTAK KABUR ═════════════════════
const E3 = { menurut: at('Menurut'), perasaan: at('perasaan.'), otak: at('Otak', 0), kabur: at('kabur'), takut: at('takut'), bingung: at('bingung'), berat: at('atau', 0) };
function scene3(t) {
  cam(1.0, 540, 740);
  drawRoom(); drawWindow(true); drawWhiteboard(); drawClock(22.5, false); drawDoor(0); drawCabinet(); drawFloorPlant();
  const [kx, ky] = P(-0.62, 0, 2.2), ks = S(2.2);
  const st = { exp: t < E3.kabur ? 'neutral' : 'tired', t, look: [1, -1], arms: { l: 'down', r: [kx + 0.18 * ks, ky - 1.35 * ks] } };
  drawChar('kharis', kx, ky, ks, st);
  drawLamp(true); nightGrade(0.45);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const [hx, hy, hr] = (() => { const m = new DOMMatrix([1, 0, 0, 1, 540 - 540, 960 - 740]); const p = m.transformPoint(new DOMPoint(st._head[0], st._head[1])); return [p.x, p.y, st._head[2]]; })();
  // thought bubble
  const bsc = pop(t, E3.menurut - 0.1, 0.35);
  if (bsc > 0) {
    const bx = 640, by = 690, br = 330 * bsc;
    [[0.25, 22], [0.5, 34], [0.75, 48]].forEach(([k, r]) => circ(lerp(hx + hr * 0.6, bx - 230, k), lerp(hy - hr * 0.9, by + 230, k), r * bsc, '#fff', C.ol, 5));
    circ(bx, by, br, '#fff', C.ol, 8);
    g.save(); g.beginPath(); g.arc(bx, by, br - 8, 0, Math.PI * 2); g.clip();
    g.fillStyle = '#ece4ff'; g.fillRect(bx - br, by - br, 2 * br, 2 * br);
    const run = t >= E3.kabur;
    const brainX = run ? lerp(bx, bx - 150, easeOut(seg(t, E3.kabur, E3.kabur + 0.8))) + Math.sin(t * 16) * 4 : bx - 20;
    evilFolder(bx + 175, by + 40, 230 * bsc, t);
    drawBrain(brainX, by + 20 - (run ? Math.abs(Math.sin(t * 16)) * 8 : 0), 105 * bsc, t, { run, exp: t >= E3.perasaan ? 'scared' : 'neutral', look: 1 });
    drawGloomCloud(bx - 120, by - 190, 0.85 * pop(t, E3.takut, 0.3), 'TAKUT\nGAGAL', t);
    drawGloomCloud(bx + 135, by - 175, 0.85 * pop(t, E3.bingung, 0.3), 'BINGUNG\nMULAI', t);
    drawGloomCloud(bx + 20, by + 205, 0.85 * pop(t, E3.berat, 0.3), 'TERLALU\nBERAT', t);
    g.restore();
    circ(bx, by, br, null, C.ol, 8);
  }
  if (t < E3.otak) topLines([{ txt: 'KATA PSIKOLOGI:', t: E3.menurut, col: '#fff', size: 66 }, { txt: 'BUKAN MALAS, TAPI PERASAAN', t: E3.perasaan - 0.6, col: C.yellow, size: 70 }], t, 170);
  else topLines([{ txt: 'OTAK KABUR DARI', t: E3.otak, col: '#fff', size: 66 }, { txt: 'RASA NGGAK ENAK', t: E3.otak + 0.15, col: C.yellow, size: 80 }], t, 170);
}

// ═════════════════════ SCENE 4 — LEGA SEBENTAR ═════════════════════
const E4 = { lega: at('lega', 0), milih: at('milih'), lega2: at('lega', 1), bukan: at('bukan', 2) };
function scene4(t) {
  const l = t - CUT[3];
  cam(1.28 + 0.04 * l / 6, 620, 1060);
  drawRoom(); drawWindow(true); drawWhiteboard(); drawClock(23, false); drawDoor(0); drawCabinet(); drawFloorPlant();
  drawChairBack(-0.05, 4.4); drawDeskTop(); drawMonitor(false); drawKeyboard(); drawDeadlineTag(t); drawDeskFront();
  for (let i = 0; i < 5; i++) { const [sx, sy] = P(-0.9 + i * 0.35, DESK.y + 0.08, 3.5); sparkle(sx, sy - 10, 24, 0.5 + 0.5 * Math.sin(t * 7 + i)); }
  const [kx, ky] = P(KX, 0, KZ), ks = S(KZ);
  const st = { exp: 'happy', t, look: t >= E4.milih ? [0, -1] : [-1, 0.3], arms: { l: 'hip', r: 'hip' } };
  drawChar('kharis', kx, ky, ks, st);
  const [fx, fy] = P(0.2, DESK.y + 0.4, 3.3); strokeText('!', fx, fy + Math.sin(t * 10) * 6, 80, C.red);
  drawLamp(true); nightGrade(0.45);
  g.setTransform(1, 0, 0, 1, 0, 0);
  // relief meter
  const lega = ease(seg(t, E4.lega - 0.2, E4.lega + 0.9));
  if (t >= E4.lega - 0.3 && t < E4.milih) {
    g.save(); g.translate(120, 820);
    rr(-48, -300, 96, 600, 48); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke();
    rr(-38, 290 - 580 * lega, 76, 580 * lega, 38); g.fillStyle = '#2fa55a'; g.fill();
    g.restore(); strokeText('LEGA', 120, 470, 56, '#7ff0a8');
  }
  if (t < E4.milih) topLines([{ txt: 'LEGA... TAPI SEBENTAR', t: E4.lega, col: '#fff', size: 72 }], t, 220);
  else {
    choiceCard(290, 330, 440, 200, 'YANG BIKIN\nLEGA', '#2fa55a', pop(t, E4.milih, 0.3), 0);
    choiceCard(790, 330, 440, 200, 'YANG\nPENTING', '#8a8fa3', pop(t, E4.milih + 0.15, 0.3), seg(t, E4.bukan, E4.bukan + 0.3));
    if (t >= E4.lega2 - 0.2) { const q = easeOut(seg(t, E4.lega2 - 0.2, E4.lega2 + 0.3)); cursorHand(lerp(560, 330, q), lerp(700, 380, q), 1.2 * (t > E4.lega2 + 0.3 && t < E4.lega2 + 0.45 ? 0.9 : 1)); }
  }
}

// ═════════════════════ SCENE 5 — BESOK PAGINYA ×2 ═════════════════════
const E5 = { masalah: at('Masalahnya,'), besok: at('besok', 1), dua: at('dua') };
function scene5(t) {
  const l = t - CUT[4];
  const shake = t >= E5.dua ? 1 - seg(t, E5.dua, E5.dua + 0.4) : 0;
  cam(1.25, 700, 1020, Math.sin(t * 80) * 14 * shake, 0);
  const hours = lerp(23, 31, ease(seg(t, CUT[4], E5.besok + 0.6)));
  drawRoom(); drawWindow(hours < 29.5); drawWhiteboard(); drawClock(hours, false); drawDoor(ease(seg(t, E5.besok + 0.4, E5.besok + 0.7))); drawCabinet(); drawFloorPlant();
  drawChairBack(-0.05, 4.4); drawDeskTop(); drawMonitor(false); drawKeyboard(); drawDeadlineTag(t); drawDeskFront();
  if (t >= E5.besok + 0.5) {
    const [bx, by] = P(1.3, 0, 3.95), bs = S(3.95);
    drawChar('bos', bx, by, bs, { exp: 'angry', t, look: [-1, 0], arms: { l: 'hip', r: 'hip' } });
  }
  const [kx, ky] = P(0.3, 0, 2.9), ks = S(2.9);
  const st = { exp: t >= E5.besok + 0.4 ? 'shock' : 'tired', t, look: [1, 0], arms: { l: 'up', r: 'up' }, hairDroop: 0.6 };
  drawChar('kharis', kx, ky, ks, st);
  const [hx, hy, hr] = st._head;
  sweat(hx - hr * 1.0, hy - hr * 0.3 + ((t * 40) % 25), 16); sweat(hx + hr * 1.05, hy + ((t * 35) % 25), 13);
  drawLamp(false);
  nightGrade(1 - ease(seg(t, CUT[4], E5.besok + 0.6)));
  const big = t >= E5.dua ? lerp(1, 1.9, back(seg(t, E5.dua, E5.dua + 0.35))) : 1;
  drawGloomCloud(hx, hy - hr * 2.0, big * pop(t, CUT[4] + 0.2, 0.3), t >= E5.dua ? 'RASA NGGAK\nENAK ×2' : 'RASA NGGAK\nENAK', t);
  g.setTransform(1, 0, 0, 1, 0, 0);
  topLines([{ txt: 'BESOK PAGINYA...', t: E5.masalah, col: '#fff', size: 80 }], t, 180);
}

// ═════════════════════ SCENE 6–7 — TRIK 5 MENIT + EFEK ZEIGARNIK ═════════════════════
const E6 = { trik: at('Triknya:'), jangan: at('jangan'), niat: at('Niat', 1), buka: at('Buka', 0), tulis: at('tulis') };
const E7 = { efek: at('efek'), otak: at('otak', 2), begitu: at('Begitu'), lanjut: at('lanjut.') };
function timerText(t) {
  const t0 = E6.niat + 0.4, t1 = E7.otak + 0.6;
  if (t < t0) return ['05:00', '#1d2030'];
  if (t < t1) { const r = Math.ceil(300 * (1 - seg(t, t0, t1))); return [`0${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}`, '#1d2030']; }
  if (t < E7.begitu) return ['00:00', C.red];
  const up = Math.floor((t - E7.begitu) * 95); return [`+${String(Math.floor(up / 60)).padStart(2, '0')}:${String(up % 60).padStart(2, '0')}`, '#2fa55a'];
}
function workScene(t, zeig) {
  cam(zeig ? 1.3 : 1.4, 470, zeig ? 1000 : 960);
  drawRoom(); drawWindow(true); drawWhiteboard(); drawClock(22.1, false); drawDoor(0); drawCabinet(); drawFloorPlant();
  const typing = t >= E6.tulis;
  const happy = zeig && t >= E7.begitu;
  const st = kharisDesk(t, { exp: happy ? 'happy' : typing ? 'neutral' : 'tired', hairDroop: happy ? 0 : typing ? 0.3 : 0.6, look: [-1, 0.4], fast: happy,
    arms: typing ? typingHands(t, happy) : { l: P(-0.2, DESK.y + 0.05, 3.68), r: P(0.06, DESK.y + 0.05, 3.68) } });
  drawDeadlineTag(t); drawDeskFront(); drawLamp(false);
  nightGrade(1);
  glowAt(...P(-0.4, 1.1, 3.6), 620, '110,200,255', 0.55); glowAt(st._head[0], st._head[1], 230, '150,215,255', 0.3);
  const [hx, hy, hr] = st._head;
  const cloud = zeig ? lerp(0.5, 0, seg(t, E7.begitu, E7.begitu + 0.6)) : lerp(1, 0.5, seg(t, E6.tulis, E6.tulis + 1.0));
  if (cloud > 0.02) drawGloomCloud(hx + hr * 0.2, hy - hr * 2.1, cloud, '', t);
  if (happy) for (let i = 0; i < 4; i++) sparkle(hx + Math.cos(i * 1.6 + t * 2) * hr * 1.6, hy + Math.sin(i * 1.6 + t * 2) * hr * 1.1, 22, 1);
  return st;
}
function scene6(t) {
  workScene(t, false);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (t >= E6.niat) { const [tt, c] = timerText(t); const sc = pop(t, E6.niat, 0.3); g.save(); g.translate(540, 170); g.scale(sc, sc); g.translate(-540, -170); timerPill(t, tt, c); g.restore(); }
  else if (t >= E6.jangan) {
    const sc = pop(t, E6.jangan, 0.3); g.save(); g.translate(540, 220); g.scale(sc, sc);
    strokeText('SELESAIKAN SEMUA', 0, 0, 78, '#fff');
    if (t >= E6.jangan + 0.5) { const k = seg(t, E6.jangan + 0.5, E6.jangan + 0.75); g.strokeStyle = C.red; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(-380, 0); g.lineTo(-380 + 760 * k, 0); g.stroke(); }
    g.restore();
  }
  docCard(t, E6.buka - 0.1, E6.tulis);
  rewindFx(t, CUT[5], 'MALAM SEBELUMNYA');
}
function scene7(t) {
  const st = workScene(t, true);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const [tt, c] = timerText(t); timerPill(t, tt, c);
  const p = t < E7.begitu ? lerp(0.05, 0.15, seg(t, CUT[6], E7.begitu)) : lerp(0.15, 0.65, ease(seg(t, E7.begitu, E7.lanjut)));
  progressBar(540, 1290, 640, p, 'TUGAS');
  topLines([{ txt: 'EFEK ZEIGARNIK', t: E7.efek, col: C.yellow, size: 96 }], t, 330);
  if (t >= E7.efek + 0.2) { g.globalAlpha = seg(t, E7.efek + 0.2, E7.efek + 0.4); strokeText('(baca: tse-gar-nik)', 540, 420, 40, '#fff'); g.globalAlpha = 1; }
  if (t >= E7.otak && t < E7.begitu + 0.4) {
    const sc = pop(t, E7.otak, 0.3) * (t > E7.begitu ? 1 - seg(t, E7.begitu, E7.begitu + 0.4) : 1);
    g.save(); g.translate(800, 700); g.scale(sc, sc);
    circ(0, 0, 190, '#fff', C.ol, 7); g.save(); g.beginPath(); g.arc(0, 0, 183, 0, Math.PI * 2); g.clip(); g.fillStyle = '#ece4ff'; g.fillRect(-190, -190, 380, 380);
    drawBrain(-40, 10, 80, t, { exp: 'neutral', note: true, look: 1 }); g.restore(); circ(0, 0, 190, null, C.ol, 7);
    g.restore();
  }
}

// ═════════════════════ SCENE 8 — CTA ═════════════════════
const E8 = { jawab: at('Jawab'), follow: at('Follow'), bongkar: at('bongkar'), kulkas: at('kulkas…'), padahal: at('padahal') };
function ctaHalf2(t, left) {
  g.save(); g.beginPath(); g.rect(left ? 0 : 540, 0, 540, H); g.clip();
  if (left) {
    cam(1.25, 1015, 1000);
    drawRoom(); drawWindow(true); drawWhiteboard(); drawClock(22, false); drawDoor(0); drawCabinet();
    drawChairBack(-0.05, 4.4); drawDeskTop(); drawMonitor(false); drawKeyboard(); drawDeadlineTag(t); drawDeskFront();
    const [kx, ky] = P(KX, 0, KZ), ks = S(KZ);
    drawChar('kharis', kx, ky, ks, { exp: 'happy', t, look: [-1, 0.6], arms: { l: P(0.15 + Math.sin(t * 13) * 0.18, DESK.y + 0.02, 3.55), r: 'hip' }, hold: { l: (x, y, s) => drawCloth(x, y, s, Math.sin(t * 13) * 0.3) } });
    drawLamp(true); nightGrade(0.45);
  } else {
    cam(1.25, 250, 1000);
    drawRoom(); drawWindow(false); drawWhiteboard(); drawClock(15, false); drawDoor(0); drawCabinet(); drawFloorPlant();
    const st = { pose: 'sit', exp: 'happy', t, look: [-1, 0.4], armsLater: true, arms: typingHands(t) };
    const [dx, dy] = P(-0.05, 0, 4.25), ds = S(4.25);
    drawChairBack(-0.05, 4.4); drawChar('dimas', dx, dy, ds, st);
    drawDeskTop(); drawMonitor(false); drawKeyboard(); drawArms('dimas', ds, st); drawDeskFront(); drawLamp(false);
  }
  g.restore();
}
function scene8(t) {
  if (t < E8.follow - 0.1) {
    ctaHalf2(t, true); ctaHalf2(t, false);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#fff'; g.fillRect(534, 0, 12, H); g.fillStyle = C.ol; g.fillRect(530, 0, 4, H); g.fillRect(546, 0, 4, H);
    const sc = pop(t, CUT[7], 0.35);
    g.save(); g.translate(270, 330); g.scale(sc, sc); strokeText('TIM', 0, -50, 60, '#fff'); strokeText('NUNDA', 0, 25, 84, '#ffb36b'); g.restore();
    g.save(); g.translate(810, 330); g.scale(sc, sc); strokeText('TIM LANGSUNG', 0, -50, 56, '#fff'); strokeText('KERJAIN', 0, 25, 84, '#7ff0a8'); g.restore();
    const vs = pop(t, CUT[7] + 0.25, 0.3);
    g.save(); g.translate(540, 760); g.scale(vs, vs); circ(0, 0, 80, C.red, C.ol, 7); strokeText('VS', 0, 4, 66, '#fff', { shadow: false }); g.restore();
    if (t >= E8.jawab) {
      const s2 = pop(t, E8.jawab, 0.3);
      g.save(); g.translate(540, 1110); g.scale(s2, s2);
      rr(-400, -90, 800, 180, 40); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke();
      g.beginPath(); g.moveTo(-60, 88); g.lineTo(0, 150); g.lineTo(20, 88); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.fillRect(-56, 80, 72, 12);
      g.fillStyle = C.ol; g.font = `900 60px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('JAWAB DI KOMENTAR', 0, 4);
      g.restore();
      for (let i = 0; i < 3; i++) { const y = 1270 + i * 50 + Math.sin(t * 8 - i) * 10; g.save(); g.globalAlpha = 0.9 - i * 0.2; g.fillStyle = C.yellow; g.strokeStyle = C.ol; g.lineWidth = 5; g.beginPath(); g.moveTo(500, y); g.lineTo(580, y); g.lineTo(540, y + 40); g.closePath(); g.fill(); g.stroke(); g.restore(); }
    }
    return;
  }
  // fridge teaser
  const fridge = t >= E8.bongkar;
  if (!fridge) cam(1.2, 520, 1050);
  else cam(lerp(1.25, 1.55, easeOut(seg(t, E8.padahal - 0.2, E8.padahal + 0.6))), 470, 980);
  drawRoom(); drawWindow(false); drawClock(21, false); drawDoor(0); drawFloorPlant();
  drawFridge(fridge ? ease(seg(t, E8.kulkas - 0.4, E8.kulkas)) : 0, t);
  const [kx, ky] = fridge ? P(-0.45, 0, 4.3) : P(0.0, 0, 3.0), ks = fridge ? S(4.3) : S(3.0);
  const st = fridge
    ? { exp: t >= E8.padahal ? 'shock' : 'neutral', t, look: [1, 0], arms: { l: 'down', r: [kx + 0.45 * ks, ky - 1.05 * ks] } }
    : { exp: 'happy', t, look: [1, -1], arms: { l: 'hip', r: 'up' } };
  drawChar('kharis', kx, ky, ks, st);
  const [hx, hy, hr] = st._head;
  if (fridge && t >= E8.kulkas) strokeText('?', hx + hr * 1.2, hy - hr * 1.2 + Math.sin(t * 7) * 6, 110, C.yellow);
  drawLamp(true);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (!fridge) {
    const sc = pop(t, E8.follow, 0.3), tap = t > E8.follow + 1.0, k = tap ? 1 - seg(t, E8.follow + 1.0, E8.follow + 1.15) * 0.08 : 1 + 0.05 * Math.sin(t * 8);
    g.save(); g.translate(700, 420); g.scale(sc * k, sc * k);
    rr(-230, -70, 460, 140, 70); g.fillStyle = tap ? '#2fa55a' : C.red; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke();
    g.fillStyle = '#fff'; g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tap ? 'DIIKUTI' : '+ FOLLOW', 0, 4);
    g.restore();
    if (t > E8.follow + 0.5) { const q = easeOut(seg(t, E8.follow + 0.5, E8.follow + 1.0)); cursorHand(lerp(900, 720, q), lerp(760, 440, q), 1.1); }
    topLines([{ txt: 'FOLLOW MAS KHARIS', t: E8.follow + 0.1, col: C.yellow, size: 84 }], t, 210);
  } else {
    topLines([{ txt: 'BUKA KULKAS...', t: E8.bongkar, col: '#fff', size: 70 }], t, 170);
    topLines([{ txt: 'PADAHAL NGGAK LAPAR?!', t: E8.padahal, col: C.yellow, size: 76 }], t, 285);
    topLines([{ txt: 'PART 2 BESOK!', t: E8.padahal + 0.6, col: C.red, size: 110, shake: true }], t, 420);
  }
}

// ═════════════════════ MASTER ═════════════════════
function hookTitle(t) {
  if (t >= E1.beresin) return;
  const sc = back(seg(t, 0, 0.35));
  g.save(); g.translate(W / 2, 300); g.scale(sc, sc);
  const l1 = 'DEADLINE BESOK...', l2 = 'KOK MALAH', l3 = 'BERES-BERES?!';
  const s = Math.min(fitSize(l1, 92, W - 120), fitSize(l3, 110, W - 120));
  strokeText(l1, 0, -s * 1.1, s, '#fff'); strokeText(l2, 0, 0, s, C.yellow); strokeText(l3, 0, s * 1.15, Math.round(s * 1.15), C.red);
  g.restore();
}
const SCENES = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8];
function renderFrame(t) {
  g.reset();
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  let si = 0; while (si < 7 && t >= CUT[si + 1]) si++;
  SCENES[si](t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  vignette();
  hookTitle(t);
  voCaption(t, 1480);
  let flash = 0;
  CUT.slice(1, 8).forEach(c => { if (t >= c) flash = Math.max(flash, 0.55 * (1 - seg(t, c, c + 0.18))); });
  if (flash > 0) { g.fillStyle = `rgba(255,255,255,${flash})`; g.fillRect(0, 0, W, H); }
}
