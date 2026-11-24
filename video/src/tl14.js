KEYWORDS = new Set(['naik', 'lanting', 'rakit', 'gelondongan', 'tali', 'ringan', 'terdorong', 'kering', 'Belanda', 'terendam']);

window.EXTRA_SFX = [
  { t: 0.0,                      type: 'boom',    gain: 0.5 },
  { t: 0.2,                      type: 'angin',   d: 8.0, gain: 0.35 },
  { t: 0.4,                      type: 'ombak',   d: 8.0, gain: 0.35 },
  { t: at('ikut') - 0.05,        type: 'stamp',   d: 0.5, gain: 1.0 },
  { t: at('tertawa') - 0.1,      type: 'langkah', d: 0.8, gain: 0.4 },
  { t: at('rakit') - 0.1,        type: 'kayu',    d: 0.8, gain: 0.3 },
  { t: at('terdorong') - 0.1,    type: 'ombak',   d: 4.0, gain: 0.35 },
  { t: at('Tetap') - 0.05,       type: 'stamp',   d: 0.4, gain: 0.9 },
  { t: at('abad') - 0.05,        type: 'stamp',   d: 0.4, gain: 0.8 },
  { t: at('Malam') - 0.1,        type: 'angin',   d: 6.0, gain: 0.35 },
  { t: at('Malam') + 0.2,        type: 'ombak',   d: 6.0, gain: 0.35 },
  { t: at('Karena') - 0.1,       type: 'angin',   d: 7.0, gain: 0.35 },
];

const ACIL = makeChar({ shirt: '#8C2F39', pattern: 'batik', pat2: '#E8C66A', sarung: '#3B4A6B', hair: 'black', hat: 'kerudung', hatCol: '#E9D9B6' });
const BAYU = makeChar({ shirt: '#2E6F9E', pattern: 'plaid', pat2: '#E8E8E8', pants: '#2A2A33', hair: 'black' });

// ── water level drives the river plane and the floating house ──
let WL = -0.25, RAIN = 0;
const LOG_R = 0.16;
function makeLanting(s = 1) {
  const L = new THREE.Group();
  for (let i = 0; i < 9; i++) L.add(at3(cyl(LOG_R, LOG_R, 3.9, i % 2 ? '#7A5430' : '#8A6239', { ol: 0.01 }, 12), -1.44 + i * 0.36, 0, 0.1, Math.PI / 2, 0, 0));
  L.add(at3(box(3.3, 0.06, 3.7, texMat('planks', '#A8743E', '#7A5430', [3, 3]), { ol: 0.01 }), 0, LOG_R + 0.03, 0.1));
  const H = rumahPanggung({ w: 2.8, d: 2.0, stilt: 0.12, planted: true, wallH: 1.15, wall: '#B07A45', roof: '#5A3A22', cols: 3 });
  at3(H, 0, LOG_R + 0.06, -0.6); L.add(H);
  L.scale.setScalar(s);
  return L;
}
const LANTING = makeLanting(), LX = 1.6, LZ = -4.2, DECK = LOG_R + 0.06;
const EXTRA = [makeLanting(0.85), makeLanting(0.8)];
const ROPE = cyl(0.025, 0.025, 1, '#D9BE8C', { ol: 0.006 }, 6);
const TREE_TIE = V3(3.8, 0.85, -0.6);
function water(color) { const M = sea(70, 44, color); return M; }
const RIVER = water('#6F8F6A');
const SUNGAI = build('sungai_lanting', () => {
  const G = new THREE.Group();
  G.add(at3(flat(44, 14, texMat('rumput2', '#6F9548', '#4E7334', [14, 5])), 0, 0, 6));
  for (let i = 0; i < 26; i++) G.add(at3(stone(0.22 + (i % 3) * 0.05, '#8E8A82'), -20 + i * 1.6, 0.02, -1.05));
  G.add(at3(RIVER, 0, 0, -8));
  G.add(at3(LANTING, LX, 0, LZ));
  G.add(at3(EXTRA[0], -5.8, 0, -8.6, 0, 0.3, 0)); G.add(at3(EXTRA[1], 7.4, 0, -9.4, 0, -0.25, 0));
  G.add(ROPE);
  G.add(at3(tree(2.8), TREE_TIE.x, 0, TREE_TIE.z));
  const beton = rumahBeton({ w: 2.6, d: 2.2, h: 1.6, col: '#D9D3C7' }); at3(beton, -5.6, 0, 0.2, 0, 0.45, 0); G.add(beton);
  G.add(at3(palm(3.2, 0.2), -8.6, 0, 2.4)); G.add(at3(bush(0.4), 5.8, 0, 1.6)); G.add(at3(bush(0.35), -2.8, 0, 3.2));
  [[-12, 0, -19, 7, 2.2], [3, 0, -21, 8, 2.6], [15, 0, -19, 6, 2.0]].forEach(([x, y, z, r, h]) => G.add(at3(hill(r, h, '#4F8A45'), x, y, z)));
  [[-9, -16], [-4, -15.5], [6, -16], [11, -15.5]].forEach(([x, z], i) => G.add(at3(tree(2.4 + (i % 2) * 0.6, '#3E8F45'), x, 0, z)));
  [[-9, 9, -24], [6, 11, -26]].forEach(([x, y, z], i) => G.add(at3(cloud(1.4 + i * 0.3), x, y, z)));
  return G;
});
const UPv = V3(0, 1, 0);
SUNGAI.userData.update = t => {
  RIVER.position.y = WL;
  const bob = Math.sin(t * 1.4) * 0.02;
  LANTING.position.y = WL + bob; LANTING.rotation.z = Math.sin(t * 1.1) * 0.012;
  EXTRA.forEach((E, i) => { E.position.y = WL + Math.sin(t * 1.3 + i) * 0.02; });
  LANTING.updateMatrixWorld(true);
  const a = V3(1.45, DECK + 0.05, 1.85).applyMatrix4(LANTING.matrixWorld), b = TREE_TIE.clone();
  const d = b.clone().sub(a), len = d.length();
  ROPE.position.copy(a).add(b).multiplyScalar(0.5); ROPE.scale.set(1, len, 1); ROPE.quaternion.setFromUnitVectors(UPv, d.normalize());
};
function set(m, sk, wl, rain) { sky(sk); mood(m); show(SUNGAI); WL = wl; RAIN = rain || 0; ACIL.visible = true; BAYU.visible = true; }
const HOOKCU = { side: 0.3, dist: 2.3, up: 0.35 };
const STORM = ['#26304A', '#66758A'];
const deckY = () => WL + DECK;
const onDeck = (C, t, o) => pose(C, t, Object.assign({ x: LX + (o.dx || 0), y: deckY(), z: LZ + 1.25, ry: 0 }, o));
const posA = (t, o) => pose(ACIL, t, Object.assign({ x: 0.4, z: 0.1, ry: -0.25 }, o));
const posB = (t, o) => pose(BAYU, t, Object.assign({ x: -1.5, z: 0.5, ry: 0.35 }, o));
function rain(t, k = 1) {
  ui(tt => { g.save(); g.strokeStyle = `rgba(205,218,238,${0.32 * k})`; g.lineWidth = 3; g.lineCap = 'round';
    for (let i = 0; i < 170; i++) { const y = (rnd(i + 7) * H + tt * 2100 * (0.8 + rnd(i) * 0.4)) % (H + 120) - 60, x = (rnd(i) * (W + 300) - y * 0.16); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 11, y + 64); g.stroke(); }
    g.restore(); });
}

function scene(t) {
  const k = beatOf(t);
  if (k === 0) {                                   // Hook v4: frame 0 = banjir sedang naik + wajah kaget
    set('malam', STORM, lerp(0.25, 0.9, ease(seg(t, 0, 8.4))), 1);
    ACIL.visible = false;
    if (t < 3.2) { onDeck(BAYU, t, { dx: -0.5, ry: 0.5, expr: 'shock', arms: 'up', shake: 0.6 }); closeUp(t, BAYU, 0, 3.2, Object.assign({ push: 0.08 }, HOOKCU)); }
    else if (t < 5.0) { BAYU.visible = false; shot(t, 3.2, 5.0, [-2.4, 2.2, 6.4], [-5.6, 0.7, 0.2], { push: 0.1 }); }
    else { BAYU.visible = false; shot(t, 5.0, CUT[1], [LX - 2.4, 1.5, 3.2], [LX, 0.9, LZ], { push: 0.06 }); }
    chip('Air naik sampai jendela', 540, 230, 0.5, { size: 50 });
    bigWord('Ikut naik!', at('ikut') - 0.05, at('naik', 1) + 1.0);
    if (t > 1.5 && t < 1.62) ui(() => { g.fillStyle = 'rgba(235,240,255,.55)'; g.fillRect(0, 0, W, H); });
    rain(t, 1);
  } else if (k === 1) {                            // Konflik
    set('siang', 'desa', -0.25);
    if (t < CUT[1] + 2.4) { posA(t, { expr: 'smile', arms: 'down' }); posB(t, { expr: 'flat', arms: 'down', walk: true, x: -1.5 - (1 - seg(t, CUT[1], CUT[1] + 2.4)) * 1.2 }); shot(t, CUT[1], CUT[1] + 2.4, [0.2, 2.2, 6.6], [0.2, 0.9, -2.2]); }
    else if (t < at('Cil')) { posA(t, { expr: 'smile', arms: 'down' }); posB(t, { expr: 'laugh', arms: 'hips' }); shot(t, CUT[1] + 2.4, at('Cil'), [-3.4, 1.6, 4.0], [0.6, 0.8, -2.6], { push: 0.06 }); }
    else { posA(t, { expr: 'flat', arms: 'down' }); posB(t, { expr: 'laugh', arms: 'point', talk: true }); closeUp(t, BAYU, at('Cil'), CUT[2], { side: 0.6, dist: 2.1, up: 0.15 }); }
    card(['"Cil, rumah kok ditaruh', 'di atas kayu?"'], 540, 1560, at('Cil') - 0.1);
  } else if (k === 2) {                            // Rahasia leluhur
    set('siang', 'desa', -0.25);
    posA(t, { expr: 'talk', arms: 'point', talk: true, ry: -0.6 }); posB(t, { expr: 'flat', arms: 'chin' });
    if (t < at('Dia', 1) - 0.2) closeUp(t, ACIL, CUT[2], at('Dia', 1) - 0.2, { side: -0.7, dist: 1.6, up: 0.1 });
    else if (t < at('diikat') - 0.1) shot(t, at('Dia', 1) - 0.2, at('diikat') - 0.1, [LX + 3.2, 0.5, LZ + 3.0], [LX, 0.0, LZ + 0.4], { push: 0.08 });
    else if (t < at('Pesan')) shot(t, at('diikat') - 0.1, at('Pesan'), [0.0, 1.9, 2.6], [3.0, 0.6, -2.0], { push: 0.06 });
    else { posA(t, { expr: 'talk', arms: 'hold', talk: true, ry: -0.25 }); closeUp(t, ACIL, at('Pesan'), CUT[3], { side: -0.4, dist: 1.6, up: 0.1 }); }
    chip('Rakit kayu gelondongan', 540, 240, at('rakit') - 0.1, { size: 52, t1: at('diikat') - 0.1 });
    chip('Diikat tali ke pohon', 540, 240, at('diikat') - 0.05, { size: 52, t1: at('Pesan') });
    card(['"Air naik, kendurkan tali.', 'Air turun, kencangkan lagi."'], 540, 1560, at('air', 1) - 0.3);
  } else if (k === 3) {                            // Sains
    const rise = ease(seg(t, at('air', 4) - 0.2, at('Tetap')));
    set('siang', 'desa', -0.25 + Math.sin((t - CUT[3]) * 1.6) * 0.05 * (1 - rise) + rise * 0.55);
    posA(t, { expr: 'flat', arms: 'down' }); posB(t, { expr: 'flat', arms: 'chin' });
    if (t < at('Rakitnya')) shot(t, CUT[3], at('Rakitnya'), [LX - 2.6, 0.6, LZ + 3.0], [LX, 0.1, LZ + 0.6], { push: 0.06 });
    else shot(t, at('Rakitnya'), CUT[4], [LX - 3.6, 1.2, LZ + 4.6], [LX, 0.6, LZ], { push: 0.07 });
    chip('Kayu lebih ringan dari air', 540, 240, at('ringan') - 0.2, { size: 48, t1: at('Rakitnya') });
    chip('Terdorong ke atas ↑', 540, 240, at('terdorong') - 0.1, { size: 54, stamp: true, t1: at('Tetap') - 0.1 });
    bigWord('Tetap kering!', at('Tetap') - 0.05, CUT[4] - 0.1);
  } else if (k === 4) {                            // Lapisan kedua
    if (t < at('Sekarang')) {
      set('sore', 'sore', -0.25); SEPIA = 0.55; ACIL.visible = false; BAYU.visible = false;
      shot(t, CUT[4], at('Sekarang'), [0.5, 4.2, 6.5], [0.5, 0, -6.0], { push: 0.08 });
      chip('Banjarmasin · abad ke-18', 540, 240, at('abad') - 0.1, { size: 52, stamp: true });
    } else {
      set('sore', 'sore', -0.25);
      posA(t, { expr: 'smile', arms: 'down' }); posB(t, { expr: 'shock', arms: 'chin' });
      closeUp(t, BAYU, at('Sekarang'), CUT[5], { side: 0.5, dist: 2.1, up: 0.15 });
      chip('Belanda: rumah apung modern', 540, 1560, at('Belanda') - 0.1, { size: 46 });
    }
  } else if (k === 5) {                            // Perubahan
    if (t < at('Dia', 2)) {
      set('malam', STORM, 0.9, 1); ACIL.visible = false; BAYU.visible = false;
      shot(t, CUT[5], at('Dia', 2), [-2.0, 2.0, 5.6], [-5.6, 0.8, 0.2], { push: 0.08 }); rain(t, 1);
    } else if (t < at('Sekarang', 1)) {
      set('malam', STORM, 0.9, 1);
      onDeck(BAYU, t, { dx: -0.5, ry: 0.3, expr: 'worried', arms: 'down' }); onDeck(ACIL, t, { dx: 0.6, ry: -0.3, expr: 'smile', arms: 'wave' });
      shot(t, at('Dia', 2), at('Sekarang', 1), [LX + 0.2, 1.8, LZ + 5.4], [LX, deckY() + 0.9, LZ + 0.8], { push: 0.06 }); rain(t, 0.7);
    } else {
      set('siang', 'desa', -0.25); ACIL.visible = false;
      pose(BAYU, t, { x: TREE_TIE.x - 0.7, z: TREE_TIE.z + 0.6, ry: 0.9, expr: 'happy', arms: 'reach' });
      closeUp(t, BAYU, at('Sekarang', 1), CUT[6], { side: -0.6, dist: 1.7, up: 0.1 });
      chip('Cek tali tambatan', 540, 240, at('mengecek') - 0.1, { size: 52 });
    }
  } else {                                         // Akhiran loop: hujan lagi, kembali ke komposisi frame 0
    const w = lerp(-0.25, 0.25, ease(seg(t, CUT[6], DURATION)));
    set('malam', STORM, w, 1); ACIL.visible = false;
    if (t < DURATION - 1.6) { BAYU.visible = false; shot(t, CUT[6], DURATION - 1.6, [LX + 4.6, 1.0, LZ + 6.0], [LX, 0.6, LZ], { push: 0.08 }); }
    else { onDeck(BAYU, t, { dx: -0.5, ry: 0.5, expr: 'worried', arms: 'down' }); closeUp(t, BAYU, DURATION - 1.6, DURATION, Object.assign({ push: 0.04 }, HOOKCU)); }
    rain(t, 1);
  }
}
renderFrame(0);
