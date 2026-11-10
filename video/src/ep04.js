// Ep.04 "Teman Kantor Resign, Kok Kita Ikut Galau?" — timeline synced to VO word timings

// ── props for this episode ────────────────────────────────────
function boxInHand(x, y, s) {
  g.save(); g.translate(x, y - 0.02 * s);
  poly([[-0.17 * s, -0.12 * s], [0.17 * s, -0.12 * s], [0.17 * s, 0.14 * s], [-0.17 * s, 0.14 * s]], '#D9A55B', C.ol, 5);
  line([-0.17 * s, -0.12 * s], [-0.1 * s, -0.2 * s], C.ol, 4); line([0.17 * s, -0.12 * s], [0.1 * s, -0.2 * s], C.ol, 4);
  g.fillStyle = '#F2D9A6'; g.fillRect(-0.04 * s, -0.12 * s, 0.08 * s, 0.26 * s);
  g.fillStyle = '#3FA34D'; g.beginPath(); g.ellipse(-0.08 * s, -0.22 * s, 0.05 * s, 0.09 * s, -0.4, 0, Math.PI * 2); g.fill(); g.strokeStyle = C.ol; g.lineWidth = 3; g.stroke();
  g.restore();
}
function mugInHand(x, y, s, t) {
  g.save(); g.translate(x, y - 0.03 * s);
  rr(-0.07 * s, -0.08 * s, 0.14 * s, 0.14 * s, 6); g.fillStyle = '#E84545'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 4; g.stroke();
  g.beginPath(); g.arc(0.08 * s, -0.01 * s, 0.045 * s, -1.4, 1.4); g.stroke();
  g.restore(); steam(x, y - 0.1 * s, t || 0, s * 0.7);
}
function stampText(x, y, txt, sc, rot, col, size) {
  if (sc <= 0) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
  g.font = `900 ${size || 80}px ${FONT}`; const w = g.measureText(txt).width + 70;
  rr(-w / 2, -66, w, 132, 14); g.strokeStyle = col || C.red; g.lineWidth = 12; g.stroke();
  g.fillStyle = col || C.red; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 6);
  g.restore();
}
function toScreen(x, y) { const p = g.getTransform().transformPoint(new DOMPoint(x, y)); return [p.x, p.y]; }
function officeSet(night, hours, door) {
  drawRoom(); drawWindow(night); drawWhiteboard(); drawClock(hours, false); drawDoor(door || 0); drawCabinet(); drawFloorPlant();
}
function deskSet() { drawDeskTop(); drawMonitor(false); drawKeyboard(); drawMug(0.42, 3.3, '#E84545'); drawDeskFront(); }
function card(x, y, w, h, fill) { rr(x - w / 2, y - h / 2, w, h, 30); g.fillStyle = fill || '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke(); }
function typed(txt, t, t0, cps) { return txt.slice(0, Math.max(0, Math.floor((t - t0) * (cps || 14)))); }

function cursorHand(x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 70); g.lineTo(18, 54); g.lineTo(32, 84); g.lineTo(44, 78); g.lineTo(30, 49); g.lineTo(54, 48); g.closePath();
  g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 5; g.lineJoin = 'round'; g.stroke(); g.restore();
}

const KX = 0.85, KZ = 3.3;

// ═════════════ SCENE 1 — HOOK: DIMAS PAMITAN, KHARIS GALAU ═════════════
const E1 = { justru: at('justru'), malamnya: at('malamnya') };
function scene1(t) {
  if (t < E1.justru - 0.2) {
    cam(1.3 + 0.05 * seg(t, 0, E1.justru), 650, 1010);
    officeSet(false, 17.4); drawChairBack(-0.45, 4.7);
    const [dx, dy] = P(-0.45, 0, 4.45), ds = S(4.45);
    const wave = Math.sin(t * 9) * 0.04 * ds;
    drawChar('dimas', dx, dy, ds, { exp: 'happy', t, look: [1, 0], arms: { l: [dx - 0.3 * ds, dy - 1.5 * ds + wave], r: [dx + 0.12 * ds, dy - 0.85 * ds] }, hold: { r: boxInHand } });
    deskSet();
    const [kx, ky] = P(KX, 0, KZ), ks = S(KZ);
    drawChar('kharis', kx, ky, ks, { exp: 'neutral', t, look: [-0.7, 0.2], arms: { l: 'down', r: 'down' } });
    drawLamp(false);
    g.setTransform(1, 0, 0, 1, 0, 0);
    return;
  }
  const l = t - E1.justru;
  cam(1.45 + 0.08 * seg(t, E1.justru, CUT[1]), 760, 790);
  officeSet(false, 18); drawChairBack(-0.45, 4.7); deskSet();
  const [kx, ky] = P(KX, 0, KZ), ks = S(KZ);
  const st = { exp: 'tired', t, look: [-0.8, 0.5], hairDroop: ease(seg(t, E1.justru, E1.malamnya + 0.4)),
    arms: { l: 'down', r: 'hip' } };
  drawChar('kharis', kx, ky, ks, st);
  const [hx, hy, hr] = st._head;
  sweat(hx + hr * 0.95, hy - hr * 0.2 + ((l * 40) % 25), 15);
  drawLamp(false);
  gradeMul(255, 214, 172, 0.5);
  g.setTransform(1, 0, 0, 1, 0, 0);
  stampText(540 + Math.sin(t * 38) * 6, 560, 'KOK AKU GALAU?!', pop(t, E1.justru + 0.1, 0.3), -0.05, C.red, 84);
}

// ═════════════ SCENE 2 — MALAM GALAU ═════════════
const E2 = { kursi: at('kursi'), mikir: at('mikir'), ketinggalan: at('ketinggalan'), padahal: at('Padahal') };
function scene2(t) {
  cam(1.3 + 0.03 * (t - CUT[1]) / 7, 560, 1000);
  officeSet(true, 23.5); drawChairBack(-0.45, 4.7);
  const st = kharisDesk(t, { exp: t >= E2.ketinggalan ? 'sad' : 'tired', look: [-1, -0.8], hairDroop: 1, arms: { l: 'down', r: 'down' } });
  drawMug(0.42, 3.3, '#E84545'); drawDeskFront(); drawLamp(false);
  nightGrade(0.75);
  const [mx, my] = P(-0.4, 1.1, 3.6); glowAt(mx, my, 520, '110,200,255', 0.4);
  const [hx, hy, hr] = st._head;
  const which = t >= E2.ketinggalan ? 2 : t >= E2.mikir ? 1 : t >= E2.kursi ? 0 : -1;
  const TX = ['DIA LEGA BANGET', 'AKU MASIH DI SINI?', 'AKU KETINGGALAN?'];
  const t0 = [E2.kursi, E2.mikir, E2.ketinggalan][Math.max(which, 0)];
  if (which >= 0) bubble(hx + 250, hy - hr - 170, TX[which], pop(t, t0, 0.28) * 0.9, hx + 70, hy - hr * 0.8);
  g.setTransform(1, 0, 0, 1, 0, 0);
  topLines([{ txt: 'MALAM-MALAM...', t: CUT[1] + 0.2, col: '#fff', size: 80 }, { txt: 'NGGAK BISA TIDUR', t: CUT[1] + 0.5, col: C.yellow, size: 84 }], t, 250);
}

// ═════════════ SCENE 3 — FAKTA: RESIGN BISA MENULAR ═════════════
const E3 = { rekan: at('rekan'), pergi: at('pergi'), cari: at('cari'), ikut: at('ikut'), mikirin: at('mikirin'), hal: at('hal') };
const INF = [E3.pergi, E3.cari, E3.ikut, E3.mikirin, E3.hal + 0.1];
const XS3 = [130, 335, 540, 745, 950], FY3 = 1180, S3 = 320;
function scene3(t) {
  cam(1.0, 540, 960);
  officeSet(false, 11);
  g.setTransform(1, 0, 0, 1, 0, 0);
  // infection links
  for (let i = 1; i < 5; i++) {
    const q = seg(t, INF[i - 1] + 0.1, INF[i]); if (q <= 0) continue;
    g.strokeStyle = C.red; g.lineWidth = 12; g.lineCap = 'round'; g.setLineDash([22, 16]);
    g.beginPath(); g.moveTo(XS3[i - 1] + 40, FY3 - 330); g.lineTo(lerp(XS3[i - 1] + 40, XS3[i] - 40, q), FY3 - 330 - Math.sin(q * Math.PI) * 70); g.stroke(); g.setLineDash([]);
  }
  XS3.forEach((x, i) => {
    const inf = t >= INF[i] && i > 0, left = i === 0 && t >= INF[0];
    let px = x;
    if (left) px = x - 380 * ease(seg(t, INF[0], INF[0] + 1.4));
    const walking = left && px > -200;
    const st = { pose: walking ? 'walk' : 'stand', t, exp: inf ? (t < INF[i] + 0.9 ? 'shock' : 'tired') : left ? 'happy' : 'neutral',
      look: inf ? [-1, -0.2] : left ? [-1, 0] : [0, 0.2], hairDroop: inf ? 0.8 : 0, arms: left ? { l: 'down', r: [px + 0.12 * S3, FY3 - 0.85 * S3] } : { l: 'hip', r: 'down' }, hold: left ? { r: boxInHand } : {} };
    drawChar(i === 4 ? 'kharis' : 'dimas', px, FY3, S3, st);
    if (inf) {
      const [hx, hy, hr] = st._head, a = pop(t, INF[i], 0.3);
      glowAt(hx, hy, 190, '255,70,70', 0.25 * a);
      g.save(); g.translate(hx, hy - hr - 60); g.scale(a, a); strokeText('?', 0, 0, 100, C.red); g.restore();
    }
  });
  topLines([{ txt: 'RESIGN BISA', t: E3.rekan - 0.2, col: '#fff', size: 100 }, { txt: 'MENULAR!', t: E3.rekan + 0.1, col: C.red, size: 120 }], t, 250);
  if (t >= E3.pergi) stampText(540, 1400, 'EFEK DOMINO', pop(t, E3.pergi + 0.5, 0.3), -0.06, C.red, 78);
}

// ═════════════ SCENE 4 — PERBANDINGAN SOSIAL ═════════════
const E4 = { psikolog: at('Psikolog'), festinger: at('Festinger'), otak: at('otak'), teman: at('Teman'), hitung: at('menghitung') };
function scene4(t) {
  cam(1.0, 540, 960);
  officeSet(false, 13.5);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const tilt = -0.2 * ease(seg(t, E4.otak, E4.teman + 0.9));
  const BX = 540, BY = 640, L = 330;
  // pillar + base
  line([BX, BY], [BX, 1330], C.ol, 22); line([BX, BY], [BX, 1330], '#c9cede', 12);
  rr(BX - 190, 1310, 380, 50, 18); g.fillStyle = '#8e97ad'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 6; g.stroke();
  const ex = Math.cos(tilt) * L, ey = Math.sin(tilt) * L;
  const ends = [[BX - ex, BY - ey, 'dimas', 'DIA', 'happy'], [BX + ex, BY + ey, 'kharis', 'AKU', t >= E4.teman ? 'sad' : 'neutral']];
  ends.forEach(([x, y, kind, lab, exp]) => {
    const py = y + 400;
    line([x, y], [x - 150, py], C.ol, 6); line([x, y], [x + 150, py], C.ol, 6);
    drawChar(kind, x, py, 180, { exp, t, look: [kind === 'dimas' ? 0.2 : -0.6, -0.1], hairDroop: kind === 'kharis' ? ease(seg(t, E4.teman, E4.hitung)) : 0, arms: { l: kind === 'dimas' ? 'up' : 'down', r: kind === 'dimas' ? 'up' : 'down' } });
    rr(x - 170, py, 340, 64, 18); g.fillStyle = kind === 'dimas' ? C.shirtD : C.shirtK; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 6; g.stroke();
    g.fillStyle = '#fff'; g.font = `900 46px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(lab, x, py + 34);
  });
  line([BX - ex, BY - ey], [BX + ex, BY + ey], C.ol, 22); line([BX - ex, BY - ey], [BX + ex, BY + ey], C.gold, 12);
  circ(BX, BY, 30, C.gold, C.ol, 6);
  if (t < E4.otak) topLines([{ txt: 'PSIKOLOG FESTINGER:', t: E4.psikolog, col: '#fff', size: 70 }, { txt: 'PERBANDINGAN SOSIAL', t: E4.festinger, col: C.yellow, size: 84 }], t, 200);
  else topLines([{ txt: 'OTAK SUKA', t: E4.otak, col: '#fff', size: 92 }, { txt: 'MEMBANDINGKAN', t: E4.otak + 0.3, col: C.red, size: 92 }], t, 200);
  if (t >= E4.hitung) stampText(540, 1450 - 0, 'DIA > AKU?', pop(t, E4.hitung, 0.25), 0.05, C.red, 76);
}

// ═════════════ SCENE 5 — AKIBATNYA: KEPUTUSAN SAAT GALAU ═════════════
const E5 = { akibat: at('Akibatnya'), lowongan: at('lowongan'), surat: at('surat'), padahal: at('padahal', 1) };
function scene5(t) {
  cam(1.3, 640, 1010);
  officeSet(false, 17.2);
  const st = kharisDesk(t, { exp: t >= E5.surat ? 'shock' : 'tired', look: [0.2, -0.6], hairDroop: 0.9, fast: true });
  drawMug(0.42, 3.3, '#E84545'); drawDeskFront(); drawLamp(false);
  gradeMul(255, 200, 150, 0.55);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const sc = pop(t, E5.akibat + 0.1, 0.3);
  if (sc > 0) {
    g.save(); g.translate(540, 420); g.scale(sc, sc);
    card(0, 0, 940, 360);
    [['LOWONGAN KERJA', E5.lowongan, -70], ['SURAT RESIGN', E5.surat, 80]].forEach(([lab, t0, dy]) => {
      rr(-420, dy - 50, 840, 100, 50); g.fillStyle = '#eef1f7'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 5; g.stroke();
      circ(-360, dy, 22, null, C.ol, 6); line([-345, dy + 15], [-325, dy + 35], C.ol, 6);
      const s = typed(lab, t, t0, 16);
      g.fillStyle = C.ol; g.font = `900 52px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(s + (s.length < lab.length && t >= t0 && Math.floor(t * 4) % 2 ? '|' : ''), -300, dy + 3);
    });
    g.restore();
  }
  if (t >= E5.padahal) stampText(540, 780 + Math.sin(t * 30) * 3, 'JANGAN DULU!', pop(t, E5.padahal, 0.25), -0.08, C.red, 88);
  topLines([{ txt: 'IKUT-IKUTAN?', t: E5.akibat, col: C.yellow, size: 88 }], t, 190);
}

// ═════════════ SCENE 6 — TRIK: TULIS APA YANG KAMU MAU ═════════════
const E6 = { trik: at('Triknya'), tulis: at('tulis'), kamu: at('kamu'), bukan: at('bukan'), baru: at('Baru') };
function scene6(t) {
  cam(1.3, 640, 1010);
  officeSet(false, 10);
  const st = kharisDesk(t, { exp: t >= E6.baru ? 'proud' : 'happy', look: [0, 0.2], hairDroop: 0, arms: { l: 'down', r: 'down' } });
  drawMug(0.42, 3.3, '#E84545'); drawDeskFront(); drawLamp(false);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const sc = pop(t, E6.trik + 0.15, 0.3);
  if (sc > 0) {
    g.save(); g.translate(540, 450); g.scale(sc, sc);
    card(0, 0, 960, 420, '#FFF8E1');
    line([0, -180], [0, 180], '#c9a85c', 5);
    g.fillStyle = '#6b7088'; g.font = `900 40px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('YANG DIA DAPAT', -240, -150);
    g.fillStyle = C.shirtD; g.fillText('YANG AKU MAU', 240, -150);
    const item = (s, x, y, t0) => { g.fillStyle = C.ol; g.font = `900 42px ${FONT}`; g.textAlign = 'left'; g.fillText(typed(s, t, t0, 16), x, y); };
    g.fillStyle = '#9aa0b4'; ['GAJI BESAR', 'JABATAN BARU'].forEach((s, i) => { g.font = `900 42px ${FONT}`; g.textAlign = 'left'; g.fillText(s, -440, -60 + i * 90); });
    const sk = ease(seg(t, E6.bukan, E6.bukan + 0.5));
    if (sk > 0) { line([-450, -20], [-450 + 400 * sk, 100], C.red, 10); line([-450, 100], [-450 + 400 * sk, -20], C.red, 10); }
    item('WAKTU KELUARGA', 40, -60, E6.kamu); item('BELAJAR HAL BARU', 40, 30, E6.kamu + 0.9); item('HIDUP TENANG', 40, 120, E6.kamu + 1.8);
    g.restore();
  }
  const ts = pop(t, E6.tulis, 0.3);
  if (ts > 0) { g.save(); g.translate(790, 170); g.rotate(0.07); g.scale(ts, ts); rr(-230, -50, 460, 100, 24); g.fillStyle = '#2fa55a'; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 6; g.stroke(); g.fillStyle = '#fff'; g.font = `900 56px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TULIS DULU', 0, 4); g.restore(); }
  if (t >= E6.baru) stampText(300, 790, 'PUTUSKAN ✓', pop(t, E6.baru, 0.25), -0.08, '#2fa55a', 72);
}

// ═════════════ SCENE 7 — DUA-DUANYA BOLEH ═════════════
const E7 = { mau: at('Mau'), bertahan: at('bertahan'), sah: at('sah'), alasan: at('alasannya'), kursi: at('kursi', 1) };
function scene7(t) {
  cam(1.0, 540, 960);
  officeSet(false, 12);
  const [kx, ky] = P(0.1, 0, 2.8), ks = S(2.8);
  const st = { exp: 'happy', t, look: [0, 0.2], arms: { l: t >= E7.sah ? 'up' : 'hip', r: t >= E7.sah ? 'up' : 'hip' } };
  drawChar('kharis', kx, ky, ks, st);
  drawLamp(false);
  g.setTransform(1, 0, 0, 1, 0, 0);
  [[215, 'IKUT RESIGN', E7.mau, C.red], [865, 'BERTAHAN', E7.bertahan, C.teal]].forEach(([x, lab, t0, col]) => {
    const sc = pop(t, t0, 0.3); if (sc <= 0) return;
    g.save(); g.translate(x, 1120); g.scale(sc, sc);
    card(0, 0, 400, 240); rr(-200, -120, 400, 80, 30); g.fillStyle = col; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke();
    g.fillStyle = '#fff'; g.font = `900 ${fitSize(lab, 48, 350)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(lab, 0, -78);
    const ck = pop(t, t0 + 0.4, 0.3); g.scale(ck, ck);
    circ(0, 35, 60, '#2fa55a', C.ol, 6); line([-28, 38], [-8, 60], '#fff', 12); line([-8, 60], [32, 10], '#fff', 12);
    g.restore();
  });
  topLines([{ txt: 'DUA-DUANYA', t: E7.mau - 0.1, col: '#fff', size: 100 }, { txt: 'BOLEH!', t: E7.mau + 0.15, col: C.yellow, size: 120 }], t, 230);
  if (t >= E7.alasan) { const [hx, hy, hr] = st._head; bubble(hx, hy - hr - 130, 'ALASANKU SENDIRI', pop(t, E7.alasan, 0.28) * 0.95, hx, hy - hr * 0.9); }
}

// ═════════════ SCENE 8 — CTA + PUNCHLINE ═════════════
const E8 = { kamu: at('Kamu', 1), jawab: at('Jawab'), follow: at('follow'), eh: at('Eh'), pak: at('Pak'), map: at('map'), dimas: at('Dimas', 1), punya: at('punya') };
function scene8(t) {
  if (t < E8.eh - 0.1) {
    cam(1.0, 540, 960);
    officeSet(false, 16.5);
    g.setTransform(1, 0, 0, 1, 0, 0);
    [[290, C.red, 'TIM IKUT RESIGN', boxInHand], [790, C.teal, 'TIM BERTAHAN', mugInHand]].forEach(([x, col, lab, fn], i) => {
      const sc = pop(t, E8.kamu + i * 0.25, 0.3);
      g.save(); g.translate(x, 600); g.scale(sc, sc); rr(-240, -60, 480, 120, 40); g.fillStyle = col; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke();
      g.fillStyle = '#fff'; g.font = `900 ${fitSize(lab, 52, 440)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(lab, 0, 4); g.restore();
      const hop = (i === 1 && t > E8.jawab + 1.3) ? Math.abs(Math.sin(t * 8)) * 0.03 * 300 : 0;
      drawChar('kharis', x, 1250 - hop, 300, { exp: i ? 'proud' : 'tired', t, look: [i ? -0.3 : 0.3, 0.2], arms: { l: 'hip', r: [x + 0.25 * 300, 1250 - 0.85 * 300] }, hold: { r: (hx, hy, s) => fn(hx, hy, s, t) } });
    });
    line([540, 520], [540, 1330], '#fff', 8);
    topLines([{ txt: 'KAMU TIM MANA?', t: E8.kamu, col: C.yellow, size: 96 }], t, 250);
    const sc = pop(t, E8.jawab, 0.3);
    if (sc > 0 && t < E8.follow - 0.1) {
      g.save(); g.translate(540, 410); g.scale(sc, sc); card(0, 0, 780, 130);
      circ(-310, 0, 42, C.shirtK, C.ol, 4);
      const s = typed('TIM BERTAHAN!', t, E8.jawab + 0.4, 10);
      g.fillStyle = C.ol; g.font = `900 58px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(s + (Math.floor(t * 3) % 2 ? '|' : ''), -240, 4); g.restore();
    }
    if (t >= E8.follow - 0.1) {
      const fs = pop(t, E8.follow - 0.1, 0.3), tap = t > E8.follow + 0.9;
      g.save(); g.translate(540, 410); g.scale(fs, fs);
      rr(-260, -70, 520, 140, 70); g.fillStyle = tap ? '#2fa55a' : C.red; g.fill(); g.strokeStyle = C.ol; g.lineWidth = 7; g.stroke();
      g.fillStyle = '#fff'; g.font = `900 62px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tap ? 'DIIKUTI ✓' : '+ FOLLOW', 0, 4); g.restore();
      if (t > E8.follow + 0.4) { const q = easeOut(seg(t, E8.follow + 0.4, E8.follow + 0.9)); cursorHand(lerp(860, 600, q), lerp(700, 440, q), 1.1); }
    }
    return;
  }
  // punchline: Pak Bos datang bawa map kerjaan Dimas
  cam(1.3, 700, 1000);
  const door = ease(seg(t, E8.pak - 0.4, E8.pak)) * (1 - ease(seg(t, E8.map + 0.9, E8.map + 1.3)));
  officeSet(false, 16.8, door); drawChairBack(-0.45, 4.7);
  const nStack = Math.round(12 * ease(seg(t, E8.dimas, E8.punya + 0.4)));
  const shock = t >= E8.dimas;
  const st = kharisDesk(t, { exp: shock ? 'shock' : 'happy', look: [1, 0.2], hairDroop: shock ? 1 : 0, arms: { l: 'down', r: 'down' }, headDy: 0 });
  drawStack(nStack, 1); drawMug(0.42, 3.3, '#E84545'); drawDeskFront();
  const A = [1.42, 3.95], B = [0.95, 3.62];
  const walkIn = ease(seg(t, E8.pak, E8.map)), walkOut = ease(seg(t, E8.dimas + 0.6, E8.punya + 0.7));
  if (t >= E8.pak - 0.2 && walkOut < 1) {
    const p = walkIn * (1 - walkOut), X = lerp(A[0], B[0], p), Z = lerp(A[1], B[1], p), [bx, by] = P(X, 0, Z), bs = S(Z);
    const holding = t < E8.dimas;
    drawChar('bos', bx, by, bs, { pose: (walkIn < 1 || walkOut > 0) ? 'walk' : 'stand', t, exp: 'happy', look: [-1, 0],
      arms: holding ? { l: [bx - 0.12 * bs, by - 1.0 * bs], r: [bx + 0.05 * bs, by - 1.0 * bs] } : { l: 'hip', r: 'hip' } });
    if (holding) for (let k = 0; k < 6; k++) drawFolder(X - 0.2, X + 0.08, 0.95 + k * 0.035, Z - 0.3, FOLD_COL[k], 0);
  }
  drawLamp(false);
  gradeMul(255, 214, 172, 0.45);
  const [hx, hy, hr] = st._head;
  if (shock) sweat(hx + hr * 0.95, hy - hr * 0.2 + (((t - E8.dimas) * 40) % 25), 15);
  g.setTransform(1, 0, 0, 1, 0, 0);
  topLines([{ txt: 'EH...', t: E8.eh, col: '#fff', size: 100 }], t, 210);
  if (t >= E8.dimas) stampText(540, 480, 'KERJAAN DIMAS', pop(t, E8.dimas, 0.25), -0.07, C.red, 84);
}

// ═════════════ MASTER ═════════════
function hookTitle(t) {
  if (t >= E1.justru - 0.1) return;
  const sc = back(seg(t, 0, 0.35));
  g.save(); g.translate(W / 2, 300); g.scale(sc, sc);
  const l1 = 'TEMAN RESIGN...', l2 = 'KOK KITA', l3 = 'YANG GALAU?!';
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
