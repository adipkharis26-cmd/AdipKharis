// Ep.01 timeline — sample covers 0–10 s (hook + scene 2)
const DURATION = 10;

const CAP_A = timeWords('Mas Kharis lembur tiap hari selama tiga bulan.', 0.15, 2.5);
const CAP_P = timeWords('Tapi yang naik jabatan… malah orang yang pulang jam lima.', 2.65, 4.95);
const CAP_B = timeWords('Setiap bos minta tolong, Kharis selalu jawab, "Siap, Pak!" Kerjaan teman? Dia ambil.', 5.1, 9.9);
const DROPS = [2.7, 3.0, 3.3, 3.6, 3.9, 4.2];

function glowAt(x, y, r, rgb, a) {
  g.save(); g.globalCompositeOperation = 'lighter';
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); g.restore();
}
function camera(zoom, cx, cy, shx, shy) { g.setTransform(zoom, 0, 0, zoom, (1 - zoom) * cx + (shx || 0), (1 - zoom) * cy + (shy || 0)); }
function typingHands(t, s) {
  const k = Math.abs(Math.sin(t * 17)) * 0.03, k2 = Math.abs(Math.cos(t * 15)) * 0.03;
  const a = P(-0.2, DESK.y + 0.05 + k, 3.68), b = P(0.06, DESK.y + 0.05 + k2, 3.68);
  return { l: a, r: b };
}

function sceneA(t) {
  camera(1.36 + 0.1 * (t / 2.6), 470, 960);
  drawRoom(); drawWindow(true); drawWhiteboard(); drawClock(21.02, false); drawDoor(0); drawCabinet(); drawFloorPlant();
  const kz = 4.25, [kx, ky] = P(-0.05, 0, kz), ks = S(kz);
  drawChairBack(-0.05, kz + 0.15);
  const nod = Math.max(0, Math.sin(t * 2.6 - 1)) * 0.035;
  const st = { pose: 'sit', exp: 'tired', look: [-1, 0.4], armsLater: true, headDy: nod, t, hairDroop: 0.55, arms: typingHands(t) };
  drawChar('kharis', kx, ky, ks, st);
  drawDeskTop(); drawMonitor(false); drawKeyboard();
  drawMug(0.32, 3.42, '#E84545'); drawMug(0.44, 3.56, '#F5C451'); drawMug(0.2, 3.33, '#7FB6F0');
  drawArms('kharis', ks, st);
  drawDeskFront(); drawLamp(false);
  nightGrade(1);
  const [mx, my] = P(-0.4, 1.1, 3.6); glowAt(mx, my, 620, '110,200,255', 0.55 + 0.06 * Math.sin(t * 9));
  const [cx, cy] = P(1.02, 2.4, ZB); glowAt(cx, cy, 140, '255,90,80', 0.5 + 0.2 * Math.sin(t * 6));
  const lp = P(-0.55, 2.4, 3.4); glowAt(lp[0], lp[1], 380, '255,220,150', 0.18);
  glowAt(st._head[0], st._head[1], 230, '150,215,255', 0.28);
}

function sceneP(l) {
  const punch = 1 - easeOut(seg(l, 0, 0.35));
  camera(1.28 + 0.05 * l / 2.4 + 0.12 * punch, 470, 1010);
  drawRoom(); drawWindow(false); drawBanner('SELAMAT, DIMAS!'); drawClock(10, false); drawDoor(0); drawCabinet(); drawFloorPlant();
  // Kharis in the back, shocked
  const [kx, ky] = P(-1.0, 0, 5.0);
  drawChar('kharis', kx, ky, S(5.0), { exp: 'shock', look: [1, 0], t: l, arms: { l: 'down', r: 'down' }, hairDroop: 0 });
  strokeText('?!', kx + 0.45 * S(5.0), ky - 2.0 * S(5.0) - Math.sin(l * 8) * 6, 70, C.red);
  // Bos clapping
  const [bx, by] = P(0.95, 0, 3.9);
  drawChar('bos', bx, by, S(3.9), { exp: 'happy', look: [-1, 0], t: l, arms: { l: 'clap', r: 'clap' } });
  // Dimas with trophy
  const dz = 3.25, ds = S(dz), jump = Math.abs(Math.sin(l * 6.5)) * 0.07 * ds;
  const [dx, dy] = P(-0.15, 0, dz);
  spotlight(dx, dy - 0.9 * ds, 1.4 * ds, 0.35);
  const st = { exp: 'proud', look: [0, -1], t: l, arms: { l: 'up', r: 'up' } };
  drawChar('dimas', dx, dy - jump, ds, st);
  const [hx, hy, hr] = st._head; drawTrophy(hx, hy - hr - 0.2 * ds, ds);
  confetti(l + 1, 70);
}

function drawTrophy(x, y, s) {
  g.save(); g.translate(x, y);
  const k = s * 0.001;
  g.beginPath(); g.moveTo(-0.17 * s, -0.16 * s); g.lineTo(0.17 * s, -0.16 * s); g.quadraticCurveTo(0.16 * s, 0.08 * s, 0, 0.1 * s); g.quadraticCurveTo(-0.16 * s, 0.08 * s, -0.17 * s, -0.16 * s);
  g.fillStyle = C.gold; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 5; g.stroke();
  [-1, 1].forEach(sd => { g.beginPath(); g.arc(sd * 0.18 * s, -0.08 * s, 0.07 * s, sd > 0 ? -Math.PI / 2 : Math.PI / 2, sd > 0 ? Math.PI / 2 : Math.PI * 1.5); g.stroke(); });
  g.fillStyle = C.gold; g.fillRect(-0.03 * s, 0.1 * s, 0.06 * s, 0.08 * s); g.strokeRect(-0.03 * s, 0.1 * s, 0.06 * s, 0.08 * s);
  rr(-0.11 * s, 0.18 * s, 0.22 * s, 0.07 * s, 4); g.fillStyle = '#8a5a2b'; g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(-0.1 * s, -0.12 * s, 0.04 * s, 0.14 * s);
  g.restore();
}

function sceneB(l) {
  // folders & shake
  let n = 0, shake = 0, falling = null;
  if (l >= 1.85) { n = 4; shake = Math.max(shake, 1 - seg(l, 1.85, 2.05)); }
  DROPS.forEach((d, i) => {
    if (l >= d + 0.25) { n += 2; shake = Math.max(shake, 0.5 * (1 - seg(l, d + 0.25, d + 0.4))); }
    else if (l >= d) falling = { p: easeOut(seg(l, d, d + 0.25)) ** 2, base: n };
  });
  const shx = Math.sin(l * 90) * 14 * shake, shy = Math.cos(l * 70) * 10 * shake;
  const intro = 1 - easeOut(seg(l, 0, 0.3));
  camera(1.3 + 0.06 * l / 5 + 0.1 * intro, 600, 990, shx, shy);

  const night = ease(seg(l, 3.4, 4.8));
  const hours = lerp(10, 21, ease(seg(l, 3.4, 4.6)));
  const doorOpen = l < 4.5 ? ease(seg(l, 0, 0.3)) : 1 - ease(seg(l, 4.5, 4.8));
  drawRoom(); drawWindow(night > 0.5); drawWhiteboard(); drawClock(hours, false); drawDoor(doorOpen); drawCabinet(); drawFloorPlant();

  const kz = 4.25, [kx, ky] = P(-0.05, 0, kz), ks = S(kz);
  drawChairBack(-0.05, kz + 0.15);
  const saluting = l >= 1.95 && l < 3.4;
  const droop = ease(seg(l, 3.0, 4.6)) * 0.9;
  const kexp = l < 1.95 ? 'neutral' : saluting ? 'salute' : (l < 3.6 ? 'shock' : 'tired');
  const kst = { pose: 'sit', exp: kexp, look: l < 3.4 ? [1, 0] : [1, -0.8], armsLater: true, t: l, hairDroop: droop,
    arms: saluting ? { l: P(-0.15, DESK.y + 0.05, 3.7), r: 'salute' } : typingHands(l) };
  drawChar('kharis', kx, ky, ks, kst);
  drawDeskTop(); drawMonitor(false); drawKeyboard();
  drawArms('kharis', ks, kst);

  drawStack(n, 1);
  if (falling) {
    const top = DESK.y + falling.base * 0.035;
    for (let k = 0; k < 2; k++) drawFolder(0.24, 0.56, top + k * 0.035 + (1 - falling.p) * 1.6, 3.48, FOLD_COL[(falling.base + k) % 6], (1 - falling.p) * 0.5);
  }
  drawMug(0.42, 3.3, '#E84545');
  drawDeskFront();

  // Bos
  if (l < 4.5) {
    const A = [1.42, 3.95], B = [0.9, 3.62];
    let p, walking;
    if (l < 1.2) { p = ease(l / 1.2); walking = true; }
    else if (l < 3.3) { p = 1; walking = false; }
    else { p = 1 - ease(seg(l, 3.3, 4.5)); walking = true; }
    const X = lerp(A[0], B[0], p), Z = lerp(A[1], B[1], p), [bx, by] = P(X, 0, Z), bs = S(Z);
    const holding = l < 1.35;
    const throwing = l >= 1.35 && l < 1.7;
    const bst = { pose: walking ? 'walk' : 'stand', t: l, exp: l > 1.9 && l < 3.3 ? 'happy' : 'neutral', look: [-1, 0],
      face: 1, arms: holding ? { l: [bx - 0.12 * bs, by - 1.0 * bs], r: [bx + 0.05 * bs, by - 1.0 * bs] } : throwing ? { l: 'up', r: 'up' } : { l: 'hip', r: 'hip' } };
    drawChar('bos', bx, by, bs, bst);
    if (holding) for (let k = 0; k < 4; k++) drawFolder(X - 0.2, X + 0.08, 1.0 + k * 0.035, Z - 0.3, FOLD_COL[k], 0);
    if (throwing || (l >= 1.7 && l < 1.85)) {
      const q = seg(l, 1.35, 1.85);
      const fx = lerp(X - 0.1, 0.4, q), fz = lerp(Z - 0.3, 3.48, q), fy = lerp(1.2, DESK.y, q) + Math.sin(q * Math.PI) * 0.7;
      for (let k = 0; k < 4; k++) drawFolder(fx - 0.16, fx + 0.16, fy + k * 0.035, fz, FOLD_COL[k], q * 3);
    }
  }
  // dust puffs on landing
  [1.85, ...DROPS.map(d => d + 0.25)].forEach(d => {
    const q = seg(l, d, d + 0.35); if (q <= 0 || q >= 1) return;
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
  // speech bubble
  const bsc = l < 2.0 ? 0 : l < 3.35 ? back(seg(l, 2.0, 2.25)) : 1 - ease(seg(l, 3.35, 3.55));
  const [hx, hy, hr] = kst._head;
  bubble(hx + 250, hy - hr - 150, 'SIAP, PAK!', bsc, hx + 70, hy - hr * 0.8);
  // stress marks when buried
  if (l > 3.7) { const a = seg(l, 3.7, 3.9); g.globalAlpha = a; strokeText('!!', hx - hr * 1.3, hy - hr * 1.1 + Math.sin(l * 10) * 5, 80, C.red); g.globalAlpha = 1; }
}

function hookTitle(t) {
  const a = t < 2.6 ? 1 : 0;
  if (a <= 0) return;
  const sc = back(seg(t, 0, 0.35));
  g.save(); g.globalAlpha = a; g.translate(W / 2, 300); g.scale(sc, sc);
  const l1 = 'LEMBUR 3 BULAN...', l2 = 'YANG NAIK JABATAN', l3 = 'MALAH DIA?!';
  const s = Math.min(fitSize(l1, 92, W - 120), fitSize(l2, 92, W - 120));
  strokeText(l1, 0, -s * 1.1, s, '#fff');
  strokeText(l2, 0, 0, s, C.yellow);
  strokeText(l3, 0, s * 1.15, Math.round(s * 1.2), C.red);
  g.restore();
}

function renderFrame(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (t < 2.6) sceneA(t); else if (t < 5.0) sceneP(t - 2.6); else sceneB(t - 5.0);
  g.setTransform(1, 0, 0, 1, 0, 0);
  vignette();
  hookTitle(t);
  if (t < 2.6) caption(CAP_A, t, 1480); else if (t < 5.0) caption(CAP_P, t, 1480); else caption(CAP_B, t, 1480);
  const flash = Math.max(1 - seg(t, 2.6, 2.8), 0) * (t >= 2.6 ? 1 : 0) + Math.max(1 - seg(t, 5.0, 5.2), 0) * (t >= 5.0 ? 0.6 : 0);
  if (flash > 0) { g.fillStyle = `rgba(255,255,255,${flash})`; g.fillRect(0, 0, W, H); }
}
