// Free 10s sample "Baru Gajian, Kok Udah Habis?" — checks characters & style stay consistent

function phoneInHand(x, y, s) {
  g.save(); g.translate(x, y - 0.06 * s); g.rotate(-0.12);
  rr(-0.06 * s, -0.11 * s, 0.12 * s, 0.22 * s, 0.02 * s); g.fillStyle = '#2b2f40'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
  rr(-0.045 * s, -0.09 * s, 0.09 * s, 0.17 * s, 0.012 * s); g.fillStyle = '#9fe3ff'; g.fill();
  g.restore();
}
// big pop-up phone notification in screen space
function bankCard(t, t0, title, amount, col, shake, y) {
  const sc = pop(t, t0, 0.32); if (sc <= 0) return;
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

const KX = 0.85, KZ = 3.3;
const A = { masuk: at('masuk!'), tiga: at('Tiga'), saldo: at('saldonya'), dua: at('dua', 1), kamu: at('Kamu'), komen: at('Komen') };

// ═════════════ SCENE 1 — GAJIAN ═════════════
function scene1(t) {
  const paid = t >= A.masuk;
  cam(1.3 + 0.05 * seg(t, 0, A.masuk), 650, 1010, paid ? Math.sin(t * 50) * 6 * (1 - seg(t, A.masuk, A.masuk + 0.3)) : 0);
  drawRoom(); drawWindow(false); drawWhiteboard(); drawClock(9, false); drawDoor(0); drawCabinet(); drawFloorPlant();
  // Dimas behind the desk, clapping once the salary lands
  const [dx, dy] = P(-0.45, 0, 4.45), ds = S(4.45);
  const jump = paid ? Math.abs(Math.sin((t - A.masuk) * 9)) * 0.05 * ds : 0;
  drawChar('dimas', dx, dy - jump, ds, { exp: paid ? 'happy' : 'neutral', t, look: [1, 0], arms: paid ? { l: 'clap', r: 'clap' } : { l: 'down', r: 'down' } });
  drawDeskTop(); drawMonitor(false); drawKeyboard(); drawMug(0.42, 3.3, '#E84545'); drawDeskFront();
  const [kx, ky] = P(KX, 0, KZ), ks = S(KZ);
  const hop = paid ? Math.abs(Math.sin((t - A.masuk) * 7)) * 0.08 * ks * (1 - seg(t, A.masuk + 1.2, A.masuk + 1.6)) : 0;
  const st = { exp: paid ? 'happy' : 'neutral', t, look: [paid ? 0 : -0.6, 0.6], hairDroop: 0,
    arms: paid ? { l: 'up', r: 'up' } : { l: 'hip', r: [kx + 0.05 * ks, ky - 0.95 * ks] },
    hold: paid ? {} : { r: phoneInHand } };
  drawChar('kharis', kx, ky - hop, ks, st);
  drawLamp(false);
  if (paid) { g.setTransform(1, 0, 0, 1, 0, 0); confetti(t - A.masuk, 60); }
  bankCard(t, A.masuk - 0.15, 'GAJI MASUK', '+Rp 5.000.000', '#2fa55a', false, 330);
}

// ═════════════ SCENE 2 — 3 HARI KEMUDIAN ═════════════
function scene2(t) {
  const hit = t >= A.dua, punch = hit ? 1 - easeOut(seg(t, A.dua, A.dua + 0.3)) : 0;
  cam(1.45 + 0.1 * seg(t, CUT[1], CUT[2]) + 0.1 * punch, 760, 790);
  drawRoom(); drawWindow(false); drawWhiteboard(); drawClock(18, false); drawDoor(0); drawCabinet(); drawFloorPlant();
  drawDeskTop(); drawMonitor(false); drawKeyboard(); drawMug(0.42, 3.3, '#E84545'); drawDeskFront();
  const [kx, ky] = P(KX, 0, KZ), ks = S(KZ);
  const st = { exp: hit ? 'shock' : 'tired', t, look: [-0.4, 0.8], hairDroop: hit ? 1 : 0.5,
    arms: { l: hit ? [kx - 0.05 * ks, ky - 1.25 * ks] : 'down', r: [kx + 0.05 * ks, ky - 0.95 * ks] }, hold: { r: phoneInHand } };
  drawChar('kharis', kx, ky, ks, st);
  const [hx, hy, hr] = st._head;
  crack(hx, hy, hr, hit ? 1 : 0);
  if (hit) sweat(hx + hr * 0.95, hy - hr * 0.2 + (((t - A.dua) * 40) % 25), 15);
  drawLamp(false);
  gradeMul(255, 214, 172, 0.5);
  glowAt(...P(-1.45, 1.9, ZB), 520, '255,170,90', 0.3);
  g.setTransform(1, 0, 0, 1, 0, 0);
  topLines([{ txt: '3 HARI KEMUDIAN...', t: A.tiga, col: '#fff', size: 84 }], t, 250);
  bankCard(t, A.saldo, 'SISA SALDO', 'Rp 12.000', C.red, hit && t < A.dua + 1.2, 540);
}

// ═════════════ SCENE 3 — CTA ═════════════
function scene3(t) {
  cam(1.3, 640, 1000);
  drawRoom(); drawWindow(false); drawWhiteboard(); drawClock(18.2, false); drawDoor(0); drawCabinet(); drawFloorPlant();
  drawDeskTop(); drawMonitor(false); drawKeyboard(); drawMug(0.42, 3.3, '#E84545'); drawDeskFront();
  const [kx, ky] = P(KX, 0, KZ), ks = S(KZ);
  // Dimas comes over and pats his shoulder
  const [dx, dy] = P(0.05, 0, 3.75), ds = S(3.75);
  const kst = { exp: 'sad', t, look: [0, 0.8], hairDroop: 1, arms: { l: 'down', r: 'down' } };
  drawChar('kharis', kx, ky, ks, Object.assign({}, kst, { armsLater: true }));
  const pat = Math.sin(t * 10) * 0.02 * ks;
  drawChar('dimas', dx, dy, ds, { exp: 'happy', t, look: [1, 0.3], arms: { l: 'down', r: [kx - 0.17 * ks, ky - 1.08 * ks + pat] } });
  drawChar('kharis', kx, ky, ks, kst);
  drawLamp(false);
  gradeMul(255, 214, 172, 0.5);
  g.setTransform(1, 0, 0, 1, 0, 0);
  topLines([{ txt: 'KAMU JUGA GINI?', t: A.kamu, col: C.yellow, size: 92 }], t, 290);
  // comment box with typed "SAMA!!"
  const sc = pop(t, A.komen, 0.3);
  if (sc > 0) {
    g.save(); g.translate(540, 470); g.scale(sc, sc);
    rr(-380, -70, 760, 140, 70); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke();
    circ(-305, 0, 44, C.shirtK, C.ol, 4);
    const typed = 'SAMA!!'.slice(0, Math.floor(seg(t, A.komen + 0.2, A.komen + 0.8) * 6));
    g.fillStyle = C.ol; g.font = `900 60px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillText(typed + (Math.floor(t * 3) % 2 ? '|' : ''), -235, 4);
    g.restore();
  }
}

function hookTitle(t) {
  if (t >= A.masuk - 0.15) return;
  const sc = back(seg(t, 0, 0.35));
  g.save(); g.translate(W / 2, 300); g.scale(sc, sc);
  const l1 = 'BARU GAJIAN...', l2 = 'KOK SALDO', l3 = 'UDAH HABIS?!';
  const s = Math.min(fitSize(l1, 92, W - 120), fitSize(l3, 106, W - 120));
  strokeText(l1, 0, -s * 1.1, s, '#fff'); strokeText(l2, 0, 0, s, C.yellow); strokeText(l3, 0, s * 1.15, Math.round(s * 1.15), C.red);
  g.restore();
}
const SCENES = [scene1, scene2, scene3];
function renderFrame(t) {
  g.reset();
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  let si = 0; while (si < 2 && t >= CUT[si + 1]) si++;
  SCENES[si](t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  vignette();
  hookTitle(t);
  voCaption(t, 1480);
  let flash = 0;
  CUT.slice(1, 3).forEach(c => { if (t >= c) flash = Math.max(flash, 0.55 * (1 - seg(t, c, c + 0.18))); });
  if (flash > 0) { g.fillStyle = `rgba(255,255,255,${flash})`; g.fillRect(0, 0, W, H); }
}
