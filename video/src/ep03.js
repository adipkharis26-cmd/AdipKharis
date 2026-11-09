// Ep.03 "Baru Gajian, Kok Saldo Udah Habis?" — timeline synced to VO word timings

// ── extra props for this episode ──────────────────────────────
function phoneInHand(x, y, s) {
  g.save(); g.translate(x, y - 0.06 * s); g.rotate(-0.12);
  rr(-0.06 * s, -0.11 * s, 0.12 * s, 0.22 * s, 0.02 * s); g.fillStyle = '#2b2f40'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
  rr(-0.045 * s, -0.09 * s, 0.09 * s, 0.17 * s, 0.012 * s); g.fillStyle = '#9fe3ff'; g.fill();
  g.restore();
}
function bowlInHand(x, y, s, t) {
  g.save(); g.translate(x, y - 0.02 * s);
  g.beginPath(); g.moveTo(-0.13 * s, -0.04 * s); g.quadraticCurveTo(0, 0.16 * s, 0.13 * s, -0.04 * s); g.closePath();
  g.fillStyle = '#F7F7F7'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 5; g.stroke();
  g.fillStyle = '#F5C451'; g.beginPath(); g.ellipse(0, -0.04 * s, 0.12 * s, 0.03 * s, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.strokeStyle = '#d9a23a'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-0.08 * s + i * 0.05 * s, -0.05 * s); g.quadraticCurveTo(-0.06 * s + i * 0.05 * s, -0.12 * s, -0.04 * s + i * 0.05 * s, -0.05 * s); g.stroke(); }
  line([0.04 * s, -0.04 * s], [0.12 * s, -0.24 * s], '#8a5a2b', 5); line([0.07 * s, -0.04 * s], [0.16 * s, -0.22 * s], '#8a5a2b', 5);
  g.restore();
  steam(x, y - 0.12 * s, t, s * 0.8);
}
function bagInHand(x, y, s) {
  g.save(); g.translate(x, y);
  g.beginPath(); g.arc(0, -0.02 * s, 0.05 * s, Math.PI, 0); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
  rr(-0.09 * s, -0.02 * s, 0.18 * s, 0.2 * s, 6); g.fillStyle = '#F29B4B'; g.fill(); g.lineWidth = 5; g.stroke();
  g.restore();
}
function sparkle(x, y, r, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.translate(x, y);
  g.beginPath(); for (let i = 0; i < 8; i++) { const rad = i % 2 ? r * 0.3 : r, an = i / 8 * Math.PI * 2; g.lineTo(Math.cos(an) * rad, Math.sin(an) * rad); }
  g.closePath(); g.fillStyle = '#fff6b0'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 3; g.stroke(); g.restore();
}
function toScreen(x, y) { const p = g.getTransform().transformPoint(new DOMPoint(x, y)); return [p.x, p.y]; }
// big pop-up m-banking notification (screen space)
function bankCard(t, t0, title, amount, col, shake, y, s) {
  const sc = pop(t, t0, 0.32) * (s || 1); if (sc <= 0) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.translate(540 + (shake ? Math.sin(t * 45) * 7 : 0), y || 640); g.scale(sc, sc); g.rotate(-0.03);
  rr(-360, -150, 720, 300, 40); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 8; g.stroke();
  circ(-270, -70, 46, col, C.ol, 5);
  g.fillStyle = '#fff'; g.font = `900 46px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Rp', -270, -66);
  g.textAlign = 'left'; g.fillStyle = '#6b7088'; g.font = `900 34px ${FONT}`; g.fillText('m-Banking • baru saja', -200, -92);
  g.fillStyle = C.ol; g.font = `900 50px ${FONT}`; g.fillText(title, -200, -38);
  g.textAlign = 'center'; const size = fitSize(amount, 104, 640); strokeText(amount, 0, 75, size, col, { sw: 0.12 });
  g.restore();
}
function icon(kind, x, y, r) {
  g.save(); g.translate(x, y);
  const bg = { cart: '#F29B4B', bowl: '#E84545', cup: '#9B6BD6', card: '#2F6FD0' }[kind];
  circ(0, 0, r, bg, C.ol, 5);
  g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = r * 0.12; g.lineCap = 'round'; g.lineJoin = 'round';
  if (kind === 'cart') {
    g.beginPath(); g.moveTo(-r * 0.55, -r * 0.4); g.lineTo(-r * 0.35, -r * 0.4); g.lineTo(-r * 0.2, r * 0.2); g.lineTo(r * 0.45, r * 0.2); g.lineTo(r * 0.55, -r * 0.25); g.lineTo(-r * 0.28, -r * 0.25); g.stroke();
    circ(-r * 0.12, r * 0.45, r * 0.11, '#fff'); circ(r * 0.35, r * 0.45, r * 0.11, '#fff');
  } else if (kind === 'bowl') {
    g.beginPath(); g.moveTo(-r * 0.55, -r * 0.05); g.quadraticCurveTo(0, r * 0.75, r * 0.55, -r * 0.05); g.closePath(); g.fill();
    [-0.2, 0.05, 0.3].forEach(dx => { g.beginPath(); g.moveTo(dx * r, -r * 0.2); g.quadraticCurveTo(dx * r + r * 0.12, -r * 0.4, dx * r, -r * 0.6); g.stroke(); });
  } else if (kind === 'cup') {
    g.beginPath(); g.moveTo(-r * 0.35, -r * 0.3); g.lineTo(r * 0.35, -r * 0.3); g.lineTo(r * 0.25, r * 0.55); g.lineTo(-r * 0.25, r * 0.55); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(r * 0.05, -r * 0.3); g.lineTo(r * 0.25, -r * 0.7); g.stroke();
    [[-0.12, 0.3], [0.08, 0.38], [-0.02, 0.15]].forEach(([dx, dy]) => circ(dx * r, dy * r, r * 0.07, bg));
  } else {
    rr(-r * 0.55, -r * 0.35, r * 1.1, r * 0.7, r * 0.1); g.fill();
    g.fillStyle = bg; g.fillRect(-r * 0.55, -r * 0.2, r * 1.1, r * 0.14); g.fillRect(-r * 0.4, r * 0.1, r * 0.3, r * 0.1);
  }
  g.restore();
}
// receipt card flying out of the phone (screen space)
function receipt(t, t0, kind, label, amount, x, y, fromX, fromY) {
  if (t < t0) return;
  const q = easeOut(seg(t, t0, t0 + 0.45)), sc = lerp(0.25, 1, q);
  const cx = lerp(fromX, x, q), cy = lerp(fromY, y, q) - Math.sin(q * Math.PI) * 120;
  g.save(); g.translate(cx, cy); g.scale(sc, sc); g.rotate(lerp(0.6, -0.04, q));
  rr(-230, -62, 460, 124, 26); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 6; g.stroke();
  icon(kind, -168, 0, 44);
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = C.ol; g.font = `900 34px ${FONT}`; g.fillText(label, -110, -20);
  g.fillStyle = C.red; g.font = `900 38px ${FONT}`; g.fillText(amount, -110, 24);
  g.restore();
}
function rupiah(n) { return 'Rp ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function saldoPill(t, y, amount, col, label) {
  g.save(); g.translate(540, y);
  rr(-330, -58, 660, 116, 58); g.fillStyle = '#1d2030'; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 6; g.stroke();
  g.fillStyle = '#b9bfd0'; g.font = `900 32px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(label || 'SALDO', -290, 2);
  g.fillStyle = col || '#7ff0a8'; g.font = `900 58px ${FONT}`; g.textAlign = 'right'; g.fillText(amount, 295, 4);
  g.restore();
}
function coin(x, y, r, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a; circ(x, y, r, C.gold, C.ol, 4);
  g.fillStyle = '#8a5a00'; g.font = `900 ${Math.round(r * 0.8)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Rp', x, y + 2); g.restore();
}
function jar(x, y, w, h, fill, label, col, glow, t) {
  if (glow) for (let i = 0; i < 4; i++) sparkle(x + Math.cos(i * 1.7 + t * 2) * w * 0.75, y - h * 0.2 + Math.sin(i * 1.7 + t * 2) * h * 0.55, 20, 1);
  rr(x - w / 2 - 8, y - h / 2 - 34, w + 16, 36, 10); g.fillStyle = '#c9cede'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 5; g.stroke();
  rr(x - w / 2, y - h / 2, w, h, 26); g.fillStyle = 'rgba(220,240,255,0.85)'; g.fill(); g.stroke();
  if (fill > 0) {
    g.save(); rr(x - w / 2, y - h / 2, w, h, 26); g.clip();
    const fh = h * fill; g.fillStyle = C.gold; g.fillRect(x - w / 2, y + h / 2 - fh, w, fh);
    for (let i = 0; i < 10; i++) { const cx = x - w / 2 + 20 + rnd(i) * (w - 40), cy = y + h / 2 - rnd(i + 9) * fh; if (cy < y + h / 2) circ(cx, cy, 14, '#ffd36b', C.ol, 3); }
    g.restore();
  }
  g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(x - w / 2 + 16, y - h / 2 + 20, 12, h * 0.55);
  rr(x - w * 0.46, y - 22, w * 0.92, 44, 8); g.fillStyle = col; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#fff'; g.font = `900 ${fitSize(label, 30, w * 0.85)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, x, y + 2);
}
function calCard(x, y, num, sc, top, col) {
  if (sc <= 0) return;
  g.save(); g.translate(x, y); g.scale(sc, sc); g.rotate(0.05);
  rr(-110, -120, 220, 240, 22); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 6; g.stroke();
  g.save(); rr(-110, -120, 220, 70, 22); g.clip(); g.fillStyle = col || C.red; g.fillRect(-110, -120, 220, 70); g.restore();
  rr(-110, -120, 220, 240, 22); g.stroke();
  g.fillStyle = '#fff'; g.font = `900 34px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(top || 'TANGGAL', 0, -84);
  g.fillStyle = C.ol; g.font = `900 120px ${FONT}`; g.fillText(String(num), 0, 30);
  g.restore();
}
function stampText(x, y, txt, sc, rot, col) {
  if (sc <= 0) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
  g.font = `900 80px ${FONT}`; const w = g.measureText(txt).width + 70;
  rr(-w / 2, -66, w, 132, 14); g.strokeStyle = col || C.red; g.lineWidth = 12; g.stroke();
  g.fillStyle = col || C.red; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 6);
  g.restore();
}
function chatBubble(x, y, txt, sc, side) {
  if (sc <= 0) return;
  g.save(); g.translate(x, y); g.scale(sc, sc);
  g.font = `900 46px ${FONT}`; const w = g.measureText(txt).width + 70;
  rr(-w / 2, -58, w, 116, 30); g.fillStyle = '#DCF8C6'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 6; g.stroke();
  g.beginPath(); g.moveTo(side * (w / 2 - 50), 56); g.lineTo(side * (w / 2 - 10), 96); g.lineTo(side * (w / 2 - 90), 56); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#DCF8C6'; g.fillRect(side > 0 ? w / 2 - 92 : -w / 2 + 12, 48, 80, 12);
  g.fillStyle = C.ol; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 4);
  g.restore();
}
function rewindFx(t, t0, label) {
  const q = seg(t, t0, t0 + 0.9); if (q <= 0 || q >= 1) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = `rgba(20,20,40,${0.35 * (1 - q)})`; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) { const y = (rnd(i + Math.floor(t * 30)) * H); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, y, W, 4 + rnd(i) * 8); }
  g.fillStyle = '#fff'; g.strokeStyle = C.ol; g.lineWidth = 6;
  [0, 70].forEach(dx => { g.beginPath(); g.moveTo(330 + dx, 860); g.lineTo(390 + dx, 820); g.lineTo(390 + dx, 900); g.closePath(); g.fill(); g.stroke(); });
  strokeText(label, 640, 862, 58, '#fff');
  g.restore();
}
function cursorHand(x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 70); g.lineTo(18, 54); g.lineTo(32, 84); g.lineTo(44, 78); g.lineTo(30, 49); g.lineTo(54, 48); g.closePath();
  g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 5; g.lineJoin = 'round'; g.stroke(); g.restore();
}
function drawBrain(x, y, r, t, o) {
  o = o || {};
  g.save(); g.translate(x, y);
  [-1, 1].forEach(sd => { g.beginPath(); g.moveTo(sd * r * 0.35, r * 0.6); g.lineTo(sd * r * 0.42, r * 1.15); g.strokeStyle = C.ol; g.lineWidth = 8; g.lineCap = 'round'; g.stroke(); });
  g.beginPath();
  for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, k = 1 + 0.07 * Math.sin(a * 9); const px = Math.cos(a) * r * 1.15 * k, py = Math.sin(a) * r * 0.85 * k; i ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.closePath(); g.fillStyle = '#F7A8C4'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 6; g.stroke();
  g.strokeStyle = '#d06f96'; g.lineWidth = 5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, -r * 0.8); g.quadraticCurveTo(r * 0.12, 0, 0, r * 0.75); g.stroke();
  [[-0.6, -0.35], [0.55, -0.4], [-0.7, 0.3], [0.65, 0.25]].forEach(([dx, dy]) => { g.beginPath(); g.arc(dx * r, dy * r, r * 0.2, 0.3, Math.PI * 1.3); g.stroke(); });
  [-1, 1].forEach(sd => { circ(sd * r * 0.3, -r * 0.05, r * 0.17, '#fff', C.ol, 4); circ(sd * r * 0.3 + (o.look || 0) * r * 0.06, -r * 0.05, r * 0.08, C.ol); });
  g.strokeStyle = C.ol; g.lineWidth = 5; g.beginPath(); g.arc(0, r * 0.25, r * 0.18, 0.2, Math.PI - 0.2); g.stroke();
  // arm holding a label sticker
  if (o.sticker) {
    line([r * 0.9, 0], [r * 1.45, -r * 0.35], C.ol, 8);
    g.save(); g.translate(r * 1.55, -r * 0.5); g.rotate(-0.15);
    rr(-r * 0.5, -r * 0.2, r * 1.0, r * 0.4, 8); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
    g.fillStyle = C.red; g.font = `900 ${Math.round(r * 0.2)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('LABEL', 0, 2); g.restore();
  }
  g.restore();
}
function officeSet(night, hours) {
  drawRoom(); drawWindow(night); drawWhiteboard(); drawClock(hours, false); drawDoor(0); drawCabinet(); drawFloorPlant();
}
function deskSet() { drawDeskTop(); drawMonitor(false); drawKeyboard(); drawMug(0.42, 3.3, '#E84545'); drawDeskFront(); }

const KX = 0.85, KZ = 3.3;

// ═════════════ SCENE 1 — HOOK: GAJIAN → 3 HARI KEMUDIAN ═════════════
const E1 = { masuk: at('masuk.'), tiga: at('Tiga'), saldo: at('saldonya'), dua: at('dua', 1) };
function scene1(t) {
  if (t < E1.tiga - 0.15) {
    const paid = t >= E1.masuk;
    cam(1.3 + 0.05 * seg(t, 0, E1.masuk), 650, 1010, paid ? Math.sin(t * 50) * 6 * (1 - seg(t, E1.masuk, E1.masuk + 0.3)) : 0);
    officeSet(false, 9);
    const [dx, dy] = P(-0.45, 0, 4.45), ds = S(4.45);
    const jump = paid ? Math.abs(Math.sin((t - E1.masuk) * 9)) * 0.05 * ds : 0;
    drawChar('dimas', dx, dy - jump, ds, { exp: paid ? 'happy' : 'neutral', t, look: [1, 0], arms: paid ? { l: 'clap', r: 'clap' } : { l: 'down', r: 'down' } });
    deskSet();
    const [kx, ky] = P(KX, 0, KZ), ks = S(KZ);
    const hop = paid ? Math.abs(Math.sin((t - E1.masuk) * 7)) * 0.08 * ks : 0;
    drawChar('kharis', kx, ky - hop, ks, { exp: paid ? 'happy' : 'neutral', t, look: [paid ? 0 : -0.6, 0.6],
      arms: paid ? { l: 'up', r: 'up' } : { l: 'hip', r: [kx + 0.05 * ks, ky - 0.95 * ks] }, hold: paid ? {} : { r: phoneInHand } });
    drawLamp(false);
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (paid) confetti(t - E1.masuk, 60);
    if (!paid) calCard(170, 1090, 25, pop(t, 0.05, 0.3), 'TANGGAL', C.red);
    bankCard(t, E1.masuk - 0.1, 'GAJI MASUK', '+Rp 5.000.000', '#2fa55a', false, 330);
    return;
  }
  const hit = t >= E1.dua, punch = hit ? 1 - easeOut(seg(t, E1.dua, E1.dua + 0.3)) : 0;
  cam(1.45 + 0.08 * seg(t, E1.tiga, CUT[1]) + 0.1 * punch, 760, 790);
  officeSet(false, 18); deskSet();
  const [kx, ky] = P(KX, 0, KZ), ks = S(KZ);
  const st = { exp: hit ? 'shock' : 'tired', t, look: [-0.4, 0.8], hairDroop: hit ? 1 : 0.5,
    arms: { l: hit ? [kx - 0.05 * ks, ky - 1.25 * ks] : 'down', r: [kx + 0.05 * ks, ky - 0.95 * ks] }, hold: { r: phoneInHand } };
  drawChar('kharis', kx, ky, ks, st);
  const [hx, hy, hr] = st._head;
  crack(hx, hy, hr, hit ? 1 : 0);
  if (hit) sweat(hx + hr * 0.95, hy - hr * 0.2 + (((t - E1.dua) * 40) % 25), 15);
  drawLamp(false);
  gradeMul(255, 214, 172, 0.5);
  glowAt(...P(-1.45, 1.9, ZB), 520, '255,170,90', 0.3);
  g.setTransform(1, 0, 0, 1, 0, 0);
  rewindFx(t, E1.tiga - 0.15, '');
  topLines([{ txt: '3 HARI KEMUDIAN...', t: E1.tiga, col: '#fff', size: 84 }], t, 250);
  bankCard(t, E1.saldo, 'SISA SALDO', 'Rp 12.000', C.red, hit && t < E1.dua + 1.2, 540);
}

// ═════════════ SCENE 2 — KE MANA UANGNYA? ═════════════
const E2 = { mana: at('mana'), checkout: at('Checkout'), makan: at('makan'), traktir: at('traktir'), cicilan: at('cicilan'), kepotong: at('kepotong.') };
const SPEND = [['checkout', 'cart', 'CHECKOUT KERANJANG', 1850000], ['makan', 'bowl', 'MAKAN ENAK', 650000], ['traktir', 'cup', 'TRAKTIR TEMAN', 488000], ['cicilan', 'card', 'CICILAN PAYLATER', 2000000]];
function scene2(t) {
  const l = t - CUT[1];
  cam(1.25 + 0.03 * l / 7, 600, 1010);
  officeSet(false, 12); deskSet();
  const [kx, ky] = P(KX, 0, KZ), ks = S(KZ);
  const shocked = t >= E2.cicilan;
  const st = { exp: shocked ? 'shock' : t >= E2.checkout ? 'happy' : 'neutral', t, look: [-0.7, -0.2], hairDroop: shocked ? 0.8 : 0,
    arms: { l: shocked ? [kx - 0.05 * ks, ky - 1.25 * ks] : 'hip', r: [kx + 0.05 * ks, ky - 0.95 * ks] }, hold: { r: phoneInHand } };
  drawChar('kharis', kx, ky, ks, st);
  const [hx, hy, hr] = st._head;
  if (shocked) sweat(hx - hr * 1.0, hy - hr * 0.2 + (((t - E2.cicilan) * 40) % 25), 15);
  drawLamp(false);
  const [px, py] = toScreen(kx + 0.05 * ks, ky - 1.05 * ks);
  g.setTransform(1, 0, 0, 1, 0, 0);
  // running balance
  let bal = 5000000;
  SPEND.forEach(([k, , , amt]) => { const q = seg(t, E2[k] + 0.2, E2[k] + 0.6); bal -= amt * q; });
  const col = bal < 100000 ? '#ff7b7b' : bal < 2500000 ? '#ffd36b' : '#7ff0a8';
  saldoPill(t, 210, rupiah(Math.round(bal / 1000) * 1000), col, 'SALDO');
  if (t < E2.checkout) topLines([{ txt: 'KE MANA UANGNYA?', t: E2.mana - 0.1, col: C.yellow, size: 92 }], t, 380);
  SPEND.forEach(([k, kind, label, amt], i) => receipt(t, E2[k], kind, label, '-' + rupiah(amt), 300, 400 + i * 150, px, py));
  if (t >= E2.kepotong) stampText(330, 980, 'HABIS!', pop(t, E2.kepotong, 0.25), -0.12, C.red);
}

// ═════════════ SCENE 3 — FAKTA: EFEK HARI GAJIAN ═════════════
const E3 = { ternyata: at('Ternyata'), penelitian: at('Penelitian'), melonjak: at('melonjak'), tepat: at('tepat'), bahkan: at('bahkan'), tabungan: at('tabungan.') };
function spendChart(t, x, y, w, h) {
  const sc = pop(t, E3.penelitian - 0.15, 0.3); if (sc <= 0) return;
  g.save(); g.translate(x, y); g.scale(sc, sc);
  rr(-w / 2, -h / 2, w, h, 30); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke();
  g.fillStyle = C.ol; g.font = `900 40px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('BELANJA SEBULAN', -w / 2 + 34, -h / 2 + 50);
  const x0 = -w / 2 + 50, x1 = w / 2 - 40, yb = h / 2 - 80, yt = -h / 2 + 110;
  g.strokeStyle = '#c9cede'; g.lineWidth = 4; g.beginPath(); g.moveTo(x0, yb); g.lineTo(x1, yb); g.stroke();
  g.fillStyle = '#6b7088'; g.font = `900 28px ${FONT}`; g.textAlign = 'center';
  [[1, 'TGL 1'], [15, '15'], [25, '25'], [30, '30']].forEach(([d, s]) => g.fillText(s, lerp(x0, x1, (d - 1) / 29), yb + 36));
  // the curve: flat, spike at payday (25)
  const f = d => { const base = 0.18 + 0.04 * Math.sin(d * 1.3); const sp = Math.exp(-Math.pow((d - 25.5) / 1.2, 2)); return base + 0.8 * sp; };
  const prog = ease(seg(t, E3.penelitian, E3.tepat + 0.3));
  g.strokeStyle = C.red; g.lineWidth = 9; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath();
  const N = 120; for (let i = 0; i <= N * prog; i++) { const d = 1 + 29 * i / N, px = lerp(x0, x1, (d - 1) / 29), py = lerp(yb, yt, f(d)); i ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.stroke();
  // payday marker
  const mx = lerp(x0, x1, 24.5 / 29), ms = pop(t, E3.melonjak, 0.3);
  if (ms > 0) {
    g.save(); g.translate(mx, yt - 10); g.scale(ms, ms);
    rr(-80, -46, 160, 70, 14); g.fillStyle = '#2fa55a'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 5; g.stroke();
    g.fillStyle = '#fff'; g.font = `900 34px ${FONT}`; g.textAlign = 'center'; g.fillText('GAJI!', 0, -10); g.restore();
  }
  if (t >= E3.bahkan) {
    const bs = pop(t, E3.bahkan, 0.3); g.save(); g.translate(-w / 2 + 190, -h / 2 + 170); g.scale(bs, bs); g.rotate(-0.06);
    rr(-150, -40, 300, 80, 40); g.fillStyle = C.yellow; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 5; g.stroke();
    g.fillStyle = C.ol; g.font = `900 28px ${FONT}`; g.textAlign = 'center'; g.fillText('PUNYA TABUNGAN', 0, -8); g.fillText('JUGA IKUTAN!', 0, 24); g.restore();
  }
  g.restore();
}
function scene3(t) {
  const l = t - CUT[2];
  cam(1.15 + 0.03 * l / 9, 560, 830);
  officeSet(false, 13);
  // everyone shops on payday
  const [bx, by] = P(-0.95, 0, 3.7), bs = S(3.7);
  const [dx, dy] = P(0.0, 0, 3.4), ds = S(3.4);
  const [kx, ky] = P(1.0, 0, 3.0), ks = S(3.0);
  const happy = t >= E3.ternyata + 0.3;
  if (t >= E3.ternyata) {
    const bh = Math.abs(Math.sin(t * 6)) * 0.03 * bs;
    drawChar('bos', bx, by - bh, bs, { exp: 'happy', t, look: [1, 0], arms: { l: 'hip', r: [bx + 0.35 * bs, by - 0.75 * bs] }, hold: { r: bagInHand } });
    drawChar('dimas', dx, dy, ds, { exp: 'happy', t, look: [1, 0], arms: { l: [dx - 0.35 * ds, dy - 0.75 * ds], r: 'down' }, hold: { l: bagInHand } });
  }
  drawChar('kharis', kx, ky, ks, { exp: happy ? 'shock' : 'neutral', t, look: [-1, -0.6], arms: { l: t >= E3.penelitian ? [kx - 0.35 * ks, ky - 1.55 * ks] : 'down', r: 'hip' } });
  drawLamp(false);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (t < E3.penelitian - 0.15) topLines([{ txt: 'BUKAN CUMA DIA!', t: E3.ternyata, col: C.yellow, size: 96 }], t, 360);
  spendChart(t, 540, 500, 900, 520);
  topLines([{ txt: 'GAJI MASUK = BELANJA MELONJAK', t: E3.melonjak, col: '#fff', size: 66 }], t, 150);
}

// ═════════════ SCENE 4 — AKUNTANSI MENTAL ═════════════
const E4 = { ekonom: at('Ekonom'), akuntansi: at('akuntansi'), otak: at('otak'), label: at('label'), saldo: at('Saldo'), labelnya: at('Labelnya'), senang: at('senang-senang') };
function scene4(t) {
  cam(1.0, 540, 740);
  officeSet(false, 15);
  const [kx, ky] = P(-0.62, 0, 2.2), ks = S(2.2);
  const st = { exp: t >= E4.labelnya ? 'happy' : 'neutral', t, look: [1, -1], arms: { l: 'down', r: [kx + 0.18 * ks, ky - 1.35 * ks] } };
  drawChar('kharis', kx, ky, ks, st);
  const [hx, hy] = toScreen(st._head[0], st._head[1]), hr = st._head[2];
  drawLamp(false);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const bsc = pop(t, E4.ekonom + 0.2, 0.35);
  if (bsc > 0) {
    const bx = 640, by = 720, br = 330 * bsc;
    [[0.25, 22], [0.5, 34], [0.75, 48]].forEach(([k, r]) => circ(lerp(hx + hr * 0.6, bx - 230, k), lerp(hy - hr * 0.9, by + 230, k), r * bsc, '#fff', C.ol, 5));
    circ(bx, by, br, '#fff', C.ol, 8);
    g.save(); g.beginPath(); g.arc(bx, by, br - 8, 0, Math.PI * 2); g.clip();
    g.fillStyle = '#ece4ff'; g.fillRect(bx - br, by - br, 2 * br, 2 * br);
    const full = t >= E4.saldo;
    const fun = full ? lerp(0.15, 0.9, ease(seg(t, E4.labelnya, E4.senang + 0.5))) : 0.15;
    jar(bx + 120 * bsc, by + 60 * bsc, 190 * bsc, 250 * bsc, fun, 'SENANG-SENANG', C.red, t >= E4.labelnya, t);
    jar(bx - 150 * bsc, by + 120 * bsc, 120 * bsc, 150 * bsc, 0.05, 'TABUNGAN', '#2fa55a', false, t);
    drawBrain(bx - 110 * bsc, by - 150 * bsc, 72 * bsc, t, { look: 1, sticker: t >= E4.label - 0.1 && t < E4.saldo });
    if (full) for (let i = 0; i < 6; i++) { const q = ((t - E4.saldo) * 1.3 + i / 6) % 1; coin(lerp(bx - 40, bx + 120, q), lerp(by - 260, by - 10, q) + Math.sin(q * 3) * 20, 22, t > E4.saldo + i * 0.08 ? 1 - q * 0.3 : 0); }
    g.restore();
    circ(bx, by, br, null, C.ol, 8);
  }
  if (t < E4.otak) topLines([{ txt: 'KATA EKONOM RICHARD THALER:', t: E4.ekonom, col: '#fff', size: 58 }, { txt: 'AKUNTANSI MENTAL', t: E4.akuntansi, col: C.yellow, size: 92 }], t, 170);
  else if (t < E4.saldo) topLines([{ txt: 'OTAK KASIH LABEL', t: E4.otak, col: '#fff', size: 80 }, { txt: 'KE TIAP UANG', t: E4.label, col: C.yellow, size: 80 }], t, 170);
  else topLines([{ txt: 'SALDO PENUH?', t: E4.saldo, col: '#fff', size: 80 }, { txt: '= UANG SENANG-SENANG', t: E4.labelnya, col: C.red, size: 76 }], t, 170);
}

// ═════════════ SCENE 5 — TANGGAL TUA ═════════════
const E5 = { akibat: at('Akibatnya,'), tanggal: at('tanggal', 1), mie: at('Mie'), chat: at('chat'), dimas: at('Dimas:'), pinjem: at('"Pinjem') };
function scene5(t) {
  const l = t - CUT[4];
  const second = t >= E5.chat - 0.1;
  cam(second ? 1.2 : 1.4, second ? 560 : 700, second ? 1020 : 900);
  officeSet(true, 21); deskSet();
  if (second) {
    const [dx, dy] = P(-0.75, 0, 4.0), ds = S(4.0);
    drawChar('dimas', dx, dy, ds, { exp: t >= E5.pinjem + 0.4 ? 'tired' : 'neutral', t, look: [0.3, 0.8], arms: { l: 'down', r: [dx + 0.05 * ds, dy - 0.95 * ds] }, hold: { r: phoneInHand } });
  }
  const [kx, ky] = P(KX, 0, KZ), ks = S(KZ);
  const eating = t >= E5.mie && !second;
  const st = { exp: 'tired', t, look: second ? [-0.4, 0.8] : [-0.3, 0.6], hairDroop: 1,
    arms: eating ? { l: 'down', r: [kx + 0.02 * ks, ky - 0.85 * ks] } : second ? { l: 'down', r: [kx + 0.05 * ks, ky - 0.95 * ks] } : { l: 'down', r: 'down' },
    hold: eating ? { r: (x, y, s) => bowlInHand(x, y, s, t) } : second ? { r: phoneInHand } : {} };
  drawChar('kharis', kx, ky, ks, st);
  drawLamp(true);
  nightGrade(0.45);
  glowAt(...P(0.6, 2.3, 3.3), 480, '255,225,160', 0.3);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (!second) {
    const n = Math.round(lerp(25, 30, ease(seg(t, E5.tanggal, E5.mie))));
    calCard(190, 620, n, pop(t, E5.akibat, 0.3), 'TANGGAL', '#6b7088');
    if (t >= E5.mie - 0.3) stampText(190, 620, 'TUA', pop(t, E5.mie - 0.3, 0.2), -0.25, C.red);
    topLines([{ txt: 'TANGGAL TUA', t: E5.akibat, col: '#fff', size: 92 }, { txt: 'DATANG LEBIH CEPAT', t: E5.tanggal, col: C.yellow, size: 80 }], t, 220);
  } else {
    chatBubble(560, 360, 'Bro, pinjem dulu 100rb...', pop(t, E5.pinjem - 0.1, 0.3), 1);
    topLines([{ txt: 'CHAT KE DIMAS:', t: E5.chat, col: '#fff', size: 72 }], t, 190);
  }
}

// ═════════════ SCENE 6 — TRIK: BAYAR DIRIMU DULU ═════════════
const E6 = { trik: at('Triknya:'), bayar: at('bayar'), begitu: at('Begitu'), pindahkan: at('pindahkan'), tabungan: at('tabungan', 1), tagihan: at('tagihan'), terpisah: at('terpisah.') };
function moneyBox(x, y, label, amount, col, sc) {
  if (sc <= 0) return;
  g.save(); g.translate(x, y); g.scale(sc, sc);
  rr(-190, -95, 380, 190, 26); g.fillStyle = col; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke();
  g.fillStyle = '#fff'; g.font = `900 44px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, 0, -30);
  g.font = `900 46px ${FONT}`; g.fillText(amount, 0, 35);
  g.restore();
}
function scene6(t) {
  cam(1.15, 560, 875);
  officeSet(false, 9); deskSet();
  const [kx, ky] = P(KX - 0.15, 0, KZ), ks = S(KZ);
  const nod = t >= E6.bayar ? Math.max(0, Math.sin((t - E6.bayar) * 7)) * 0.04 : 0;
  drawChar('kharis', kx, ky, ks, { exp: t >= E6.terpisah ? 'proud' : 'happy', t, look: [-0.3, -1], headDy: nod, arms: t >= E6.terpisah ? { l: 'hip', r: 'up' } : { l: 'hip', r: 'hip' } });
  drawLamp(false);
  g.setTransform(1, 0, 0, 1, 0, 0);
  rewindFx(t, CUT[5], 'TANGGAL 25 LAGI');
  topLines([{ txt: 'BAYAR DIRIMU DULU', t: E6.bayar, col: C.yellow, size: 100 }], t, 200);
  // flow: salary → savings + bills, the rest is spendable
  if (t >= E6.begitu - 0.1) {
    const rest = t >= E6.terpisah;
    const tab = seg(t, E6.tabungan, E6.tabungan + 0.5), tag = seg(t, E6.tagihan, E6.tagihan + 0.5);
    const src = 5000000 - 1000000 * tab - 2000000 * tag;
    const sc = pop(t, E6.begitu - 0.1, 0.3);
    g.save(); g.translate(540, 420); g.scale(sc, sc);
    rr(-300, -85, 600, 170, 30); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke();
    g.fillStyle = rest ? '#2fa55a' : '#6b7088'; g.font = `900 36px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(rest ? 'BOLEH DIPAKAI ✓' : 'GAJI MASUK', 0, -38);
    g.fillStyle = C.ol; g.font = `900 64px ${FONT}`; g.fillText(rupiah(Math.round(src / 1000) * 1000), 0, 28);
    g.restore();
    // arrows + flying coins
    [[E6.tabungan, 285, '#2fa55a'], [E6.tagihan, 795, C.shirtK]].forEach(([t0, tx, col]) => {
      if (t < t0 - 0.2) return;
      const k = ease(seg(t, t0 - 0.2, t0 + 0.2));
      g.strokeStyle = C.ol; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(540, 510); g.lineTo(lerp(540, tx, k), lerp(510, 640, k)); g.stroke();
      g.strokeStyle = col; g.lineWidth = 8; g.stroke();
      for (let i = 0; i < 3; i++) { const q = ((t - t0) * 1.6 + i / 3) % 1; if (t > t0) coin(lerp(540, tx, q), lerp(510, 650, q), 22, 1 - q * 0.4); }
    });
    moneyBox(285, 740, 'TABUNGAN', 'Rp 1.000.000', '#2fa55a', pop(t, E6.tabungan, 0.3));
    moneyBox(795, 740, 'TAGIHAN', 'Rp 2.000.000', C.shirtK, pop(t, E6.tagihan, 0.3));
    if (rest) stampText(540, 900, 'AUTODEBET', pop(t, E6.terpisah, 0.25) * 0.8, -0.1, C.red);
  }
}

// ═════════════ SCENE 7 — NGGAK KELIHATAN = NGGAK KEPAKAI ═════════════
const E7 = { uang: secS[6], kelihatan: at('kelihatan'), jarang: at('jarang'), makanya: at('Makanya'), santai: at('santai'), bulan: at('bulan.') };
function phoneUI(t, x, y) {
  const sc = pop(t, CUT[6], 0.3); if (sc <= 0) return;
  g.save(); g.translate(x, y); g.scale(sc, sc); g.rotate(0.04);
  rr(-230, -400, 460, 800, 60); g.fillStyle = '#2b2f40'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 8; g.stroke();
  rr(-205, -370, 410, 740, 40); g.fillStyle = '#f4f8ff'; g.fill();
  g.fillStyle = C.shirtK; rr(-205, -370, 410, 120, 40); g.fill(); g.fillRect(-205, -300, 410, 50);
  g.fillStyle = '#fff'; g.font = `900 34px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('m-Banking', -170, -310);
  // main balance
  g.fillStyle = '#6b7088'; g.font = `900 28px ${FONT}`; g.fillText('SALDO UTAMA', -170, -200);
  g.fillStyle = C.ol; g.font = `900 52px ${FONT}`; g.fillText('Rp 2.000.000', -170, -145);
  g.fillStyle = '#2fa55a'; g.font = `900 26px ${FONT}`; g.fillText('BOLEH DIPAKAI', -170, -95);
  // hidden pockets with a curtain
  [['TABUNGAN', -10], ['TAGIHAN', 150]].forEach(([lbl, yy]) => {
    rr(-175, yy - 60, 350, 120, 20); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = '#c9cede'; g.lineWidth = 4; g.stroke();
    g.fillStyle = '#6b7088'; g.font = `900 28px ${FONT}`; g.fillText(lbl, -150, yy - 22);
    const cover = ease(seg(t, E7.kelihatan - 0.2, E7.kelihatan + 0.3));
    g.fillStyle = C.ol; g.font = `900 40px ${FONT}`; g.fillText(cover > 0.5 ? '••••••' : 'Rp ' + (lbl === 'TABUNGAN' ? '1.000.000' : '2.000.000'), -150, yy + 22);
    if (cover > 0) { g.save(); rr(-175, yy - 60, 350 * cover, 120, 20); g.fillStyle = '#9B6BD6'; g.fill(); g.restore(); g.fillStyle = '#fff'; g.globalAlpha = cover; g.font = `900 28px ${FONT}`; g.textAlign = 'center'; g.fillText('DISEMBUNYIKAN', 0, yy + 2); g.globalAlpha = 1; g.textAlign = 'left'; }
  });
  g.restore();
}
function scene7(t) {
  const dimas = t >= E7.makanya - 0.15;
  if (!dimas) {
    cam(1.2, 420, 1100);
    officeSet(false, 14); deskSet();
    const [kx, ky] = P(-0.75, 0, 2.8), ks = S(2.8);
    drawChar('kharis', kx, ky, ks, { exp: t >= E7.jarang ? 'happy' : 'neutral', t, look: [1, -0.6], arms: { l: 'down', r: [kx + 0.3 * ks, ky - 1.0 * ks] } });
    drawLamp(false);
    g.setTransform(1, 0, 0, 1, 0, 0);
    phoneUI(t, 760, 820);
    topLines([{ txt: 'NGGAK KELIHATAN', t: E7.uang, col: '#fff', size: 92 }, { txt: '= NGGAK KEPAKAI', t: E7.jarang, col: C.yellow, size: 92 }], t, 180);
    return;
  }
  cam(1.9, 470, 1020);
  officeSet(false, 17);
  const [dx, dy] = P(-0.05, 0, 4.25), ds = S(4.25);
  const st = { pose: 'sit', exp: 'happy', t, look: [0, 0.2], armsLater: true, arms: { l: [dx - 0.05 * ds, dy - 0.8 * ds], r: 'hip' } };
  drawChairBack(-0.05, 4.4); drawChar('dimas', dx, dy, ds, st);
  drawDeskTop(); drawMonitor(false); drawKeyboard(); drawArms('dimas', ds, st);
  const [mx, my] = st._head ? [dx - 0.05 * ds, dy - 0.8 * ds] : [0, 0];
  drawDeskFront(); drawLamp(false);
  heldMug(mx, my, ds); steam(mx, my - 0.25 * ds, t, ds * 0.6);
  gradeMul(255, 214, 172, 0.35);
  g.setTransform(1, 0, 0, 1, 0, 0);
  calCard(850, 560, 30, pop(t, E7.santai - 0.2, 0.3), 'TANGGAL', '#2fa55a');
  if (t >= E7.bulan - 0.2) stampText(850, 560, 'AMAN ✓', pop(t, E7.bulan - 0.2, 0.2), -0.2, '#2fa55a');
  topLines([{ txt: 'DIMAS SANTAI', t: E7.makanya, col: '#fff', size: 92 }, { txt: 'SAMPAI AKHIR BULAN', t: E7.santai, col: '#7ff0a8', size: 84 }], t, 190);
}
function heldMug(x, y, s) {
  const w = 0.15 * s, h = 0.19 * s;
  g.beginPath(); g.arc(x + w * 0.5, y - h * 0.55, w * 0.32, -Math.PI / 2, Math.PI / 2); g.strokeStyle = C.ol; g.lineWidth = 6; g.stroke();
  rr(x - w * 0.5, y - h, w, h, 8); g.fillStyle = '#F5C451'; g.fill(); g.lineWidth = 5; g.stroke();
}

// ═════════════ SCENE 8 — CTA + PUNCHLINE ═════════════
const E8 = { kalau: at('Kalau'), komen: at('komen'), follow: at('Follow'), eh: at('Eh,'), keranjang: at('keranjang', 1), lagi: at('lagi', 1) };
function cartPhone(t, x, y) {
  const sc = pop(t, E8.eh, 0.3); if (sc <= 0) return;
  g.save(); g.translate(x, y); g.scale(sc * 0.8, sc * 0.8); g.rotate(-0.05);
  rr(-210, -330, 420, 660, 54); g.fillStyle = '#2b2f40'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 8; g.stroke();
  rr(-185, -300, 370, 600, 36); g.fillStyle = '#fff7ef'; g.fill();
  g.fillStyle = '#F29B4B'; rr(-185, -300, 370, 100, 36); g.fill(); g.fillRect(-185, -240, 370, 40);
  g.fillStyle = '#fff'; g.font = `900 36px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('KERANJANG', 0, -245);
  icon('cart', 0, -90, 80);
  const k = seg(t, E8.keranjang, E8.keranjang + 0.3);
  g.fillStyle = C.ol; g.font = `900 46px ${FONT}`; g.fillText(k > 0 ? '+1 ITEM' : '0 ITEM', 0, 40);
  if (k > 0) { g.save(); g.translate(120, -150); g.scale(back(k), back(k)); circ(0, 0, 44, C.red, C.ol, 5); g.fillStyle = '#fff'; g.font = `900 46px ${FONT}`; g.fillText('1', 0, 3); g.restore(); }
  rr(-150, 110, 300, 90, 45); g.fillStyle = C.red; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 5; g.stroke();
  g.fillStyle = '#fff'; g.font = `900 34px ${FONT}`; g.fillText('DISKON TGL 25!', 0, 157);
  g.restore();
}
function scene8(t) {
  const punch = t >= E8.eh - 0.1;
  cam(punch ? 1.45 : 1.3, punch ? 700 : 640, punch ? 800 : 1000);
  officeSet(false, 18.2); deskSet();
  const [kx, ky] = P(KX, 0, KZ), ks = S(KZ);
  const [dx, dy] = P(0.05, 0, 3.75), ds = S(3.75);
  if (!punch) {
    const kst = { exp: 'sad', t, look: [0, 0.8], hairDroop: 1, arms: { l: 'down', r: 'down' } };
    drawChar('kharis', kx, ky, ks, Object.assign({}, kst, { armsLater: true }));
    const pat = Math.sin(t * 10) * 0.02 * ks;
    drawChar('dimas', dx, dy, ds, { exp: 'happy', t, look: [1, 0.3], arms: { l: 'down', r: [kx - 0.17 * ks, ky - 1.08 * ks + pat] } });
    drawChar('kharis', kx, ky, ks, kst);
  } else {
    // Dimas facepalms, Kharis grins with the phone
    const dst = { exp: 'tired', t, look: [1, 0.2], arms: { l: 'down', r: 'down' } };
    const d0 = Object.assign({}, dst, { armsLater: true });
    drawChar('dimas', dx, dy, ds, d0);
    const d1 = Object.assign(dst, { armsLater: true, arms: { l: 'down', r: [dx + 0.08 * ds, dy - 1.45 * ds] } });
    drawChar('dimas', dx, dy, ds, d1); drawArms('dimas', ds, d1);
    const kst = { exp: 'happy', t, look: [-0.6, 0.7], hairDroop: 0, arms: { l: 'hip', r: [kx + 0.05 * ks, ky - 0.95 * ks] }, hold: { r: phoneInHand } };
    drawChar('kharis', kx, ky, ks, kst);
    const [khx, khy, khr] = kst._head;
    sweat(khx + khr * 0.95, khy - khr * 0.3 + (((t - E8.eh) * 30) % 20), 14);
  }
  drawLamp(false);
  gradeMul(255, 214, 172, 0.5);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (!punch) {
    topLines([{ txt: 'KAMU JUGA GINI?', t: E8.kalau, col: C.yellow, size: 92 }], t, 290);
    const sc = pop(t, E8.komen, 0.3);
    if (sc > 0 && t < E8.follow + 0.1) {
      g.save(); g.translate(540, 470); g.scale(sc, sc);
      rr(-380, -70, 760, 140, 70); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke();
      circ(-305, 0, 44, C.shirtK, C.ol, 4);
      const typed = 'SAMA!!'.slice(0, Math.floor(seg(t, E8.komen + 0.2, E8.komen + 0.8) * 6));
      g.fillStyle = C.ol; g.font = `900 60px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle';
      g.fillText(typed + (Math.floor(t * 3) % 2 ? '|' : ''), -235, 4);
      g.restore();
    }
    if (t >= E8.follow) {
      const fs = pop(t, E8.follow, 0.3), tap = t > E8.follow + 1.0;
      g.save(); g.translate(540, 470); g.scale(fs, fs);
      rr(-260, -70, 520, 140, 70); g.fillStyle = tap ? '#2fa55a' : C.red; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke();
      g.fillStyle = '#fff'; g.font = `900 62px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tap ? 'DIIKUTI ✓' : '+ FOLLOW', 0, 4);
      g.restore();
      if (t > E8.follow + 0.5) { const q = easeOut(seg(t, E8.follow + 0.5, E8.follow + 1.0)); cursorHand(lerp(860, 600, q), lerp(760, 490, q), 1.1); }
    }
  } else {
    cartPhone(t, 290, 570);
    topLines([{ txt: 'EH...', t: E8.eh, col: '#fff', size: 100 }], t, 210);
    stampText(760, 360, 'NGGAK KAPOK', pop(t, E8.lagi - 0.15, 0.22), 0.12, C.red);
  }
}

// ═════════════ MASTER ═════════════
function hookTitle(t) {
  if (t >= E1.masuk - 0.1) return;
  const sc = back(seg(t, 0, 0.35));
  g.save(); g.translate(W / 2, 300); g.scale(sc, sc);
  const l1 = 'BARU GAJIAN...', l2 = 'KOK SALDO', l3 = 'UDAH HABIS?!';
  const s = Math.min(fitSize(l1, 92, W - 120), fitSize(l3, 106, W - 120));
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
