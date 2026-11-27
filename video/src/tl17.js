KEYWORDS = new Set(['runtuh', 'utuh', 'bambu', 'beringin', 'akar', 'serabut', 'jaring', 'terikat', 'tergerus', 'ditebang', 'sukar', 'Semende', 'ambruk']);

window.EXTRA_SFX = [
  { t: 0.0,                       type: 'boom',  gain: 0.5 },
  { t: 0.1,                       type: 'ombak', d: 9.0, gain: 0.4 },
  { t: 0.2,                       type: 'angin', d: 9.0, gain: 0.35 },
  { t: at('runtuh') - 0.2,        type: 'boom',  gain: 0.6 },
  { t: at('tetap') - 0.05,        type: 'stamp', d: 0.5, gain: 1.0 },
  { t: at('menunjuk') - 0.05,     type: 'langkah', d: 0.8, gain: 0.35 },
  { t: at('beringin') - 0.1,      type: 'angin', d: 3.0, gain: 0.25 },
  { t: at('ditebang') - 0.05,     type: 'stamp', d: 0.4, gain: 0.8 },
  { t: at('akar') - 0.1,          type: 'kayu',  d: 0.6, gain: 0.3 },
  { t: at('Air') - 0.1,           type: 'ombak', d: 3.0, gain: 0.3 },
  { t: at('sukar') - 0.1,         type: 'boom',  gain: 0.35 },
  { t: at('Sayangnya') - 0.05,    type: 'stamp', d: 0.4, gain: 0.8 },
  { t: at('Lalu') - 0.1,          type: 'angin', d: 5.0, gain: 0.4 },
  { t: at('ambruk') - 0.2,        type: 'boom',  gain: 0.6 },
  { t: at('Sekarang') - 0.05,     type: 'stamp', d: 0.4, gain: 0.8 },
  { t: at('sore') - 0.1,          type: 'angin', d: 4.0, gain: 0.35 },
];

// Pak Saman (Semende): peci, kemeja lurik, sarung hijau tua. Rian: pemuda kota, kacamata, kaus merah.
const SAMAN = makeChar({ shirt: '#6B4A2B', pattern: 'lurik', pat2: '#D9BE8C', sarung: '#2F5E5A', hair: 'white', hat: 'peci', mustache: true, beardCol: '#BEBEBE' });
const RIAN = makeChar({ shirt: '#C8352E', pants: '#2A3550', hair: 'black', glasses: true });

// ── bambu (rumpun), kebun kopi, penampang tanah + akar ──
function bambu(seed = 0, s = 1) {
  const G = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const h = 2.6 + rnd(seed + i) * 1.6, a = i * 2.4 + seed, r = 0.1 + rnd(seed + i + 5) * 0.22;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    G.add(at3(cyl(0.03, 0.038, h, i % 2 ? '#86A94E' : '#6E9A44', { ol: 0.008 }, 8), x, h / 2, z, Math.sin(a) * 0.1, 0, -Math.cos(a) * 0.1));
    const lf = sph(0.2, i % 2 ? '#4F9A3C' : '#3E8A32', { ol: 0.008 }, 10, 6); lf.scale.set(1, 0.5, 1);
    G.add(at3(lf, x * 2.6, h, z * 2.6));
  }
  G.scale.setScalar(s); G.userData.seed = seed;
  return G;
}
function kopi() {
  const G = bush(0.34, '#2F6B2F');
  for (let i = 0; i < 5; i++) G.add(at3(sph(0.035, '#C8352E', { cast: false }, 6, 4), (rnd(i) - 0.5) * 0.5, 0.18 + rnd(i + 2) * 0.2, 0.28));
  return G;
}
function blok(roots) {
  const G = new THREE.Group(), sm = texMat('kerikil', '#7A5A3A', '#4A3522', [1.5, 1]);
  G.add(at3(box(2.4, 1.5, 0.9, sm, { ol: 0.01 }), 0, 0.75, 0));
  const top = at3(box(2.44, 0.1, 0.94, '#6F9548', { ol: 0.008 }), 0, 1.55, 0); G.add(top);
  if (roots) {
    for (let i = 0; i < 70; i++) {
      const len = 0.5 + rnd(i) * 0.95, x = (rnd(i + 11) - 0.5) * 2.1;
      G.add(at3(cyl(0.012, 0.006, len, '#E8D4A0', { cast: false }, 4), x, 1.5 - len / 2, 0.46, 0, 0, (rnd(i + 3) - 0.5) * 0.9));
    }
    [-0.6, 0, 0.6].forEach((x, i) => G.add(at3(cyl(0.07, 0.08, 0.9, i % 2 ? '#86A94E' : '#6E9A44', { ol: 0.008 }, 8), x, 2.05, 0)));
  } else {
    const chunk = box(0.95, 0.75, 0.94, sm, { ol: 0.01 }); at3(chunk, 0.72, 1.12, 0); G.add(chunk); G.userData.chunk = chunk;
  }
  return G;
}

const BLX = 2.0, BLZ = 3.0;
const BLK_A = blok(true), BLK_B = blok(false);
let FLOOD = 0, COL = 0, NB = 8, ERO = 0, WIND = 0, HIDEB = false;
const RIVER_C = sea(70, 44, '#6F8F6A'), RIVER_M = sea(70, 44, '#8C7B55');
const CLUMPS = [], COFFEE = [];
const CPOS = [[-7.2, -0.5], [-5.4, -0.7], [-3.6, -0.4], [-1.8, -0.7], [0.0, -0.5], [1.8, -0.7], [3.6, -0.4], [5.4, -0.6]];
const TEB2 = new THREE.Group();
const DESA = build('sungai_semende', () => {
  const G = new THREE.Group();
  G.add(at3(flat(44, 14, texMat('rumput2', '#6F9548', '#4E7334', [14, 5])), 0, 0, 6));
  G.add(at3(box(44, 0.7, 0.6, texMat('kerikil', '#7A5A3A', '#4A3522', [14, 1]), { ol: 0.01 }), 0, -0.32, -1.25));
  G.add(at3(RIVER_C, 0, -0.5, -8)); G.add(at3(RIVER_M, 0, -0.5, -8));
  CPOS.forEach(([x, z], i) => {
    const B = bambu(i * 3, 1); at3(B, x, 0, z); G.add(B); CLUMPS.push(B);
    const K = kopi(); at3(K, x, 0, z + 0.2); G.add(K); COFFEE.push(K);
  });
  G.add(at3(tree(4.2, '#2F7A3A'), -8.4, 0, -0.6)); G.add(at3(tree(3.8, '#2F7A3A'), 8.6, 0, -0.8));
  const hs = [rumahPanggung({ w: 2.4, d: 1.9, stilt: 0.7, wallH: 1.0, wall: '#B07A45', roof: '#6E3B23', cols: 3 }), rumahPanggung({ w: 2.2, d: 1.8, stilt: 0.7, wallH: 0.9, wall: '#A8743E', roof: '#5A3A22', cols: 3 })];
  at3(hs[0], -5.0, 0, 4.6, 0, 0.2, 0); at3(hs[1], 6.6, 0, 4.2, 0, -0.3, 0); hs.forEach(h => G.add(h));
  G.add(at3(palm(3.4, 0.2), -2.2, 0, 4.0)); G.add(at3(bush(0.4), 3.6, 0, 2.2)); G.add(at3(bush(0.35), -3.4, 0, 2.4));
  TEB2.add(at3(box(16, 1.4, 7, texMat('kerikil', '#8A6A44', '#5A4430', [6, 2]), { ol: 0.01 }), 0, 0.7, 0));
  TEB2.add(at3(box(16, 0.1, 7, '#6F9548', { ol: 0.008 }), 0, 1.45, 0));
  const th = [rumahPanggung({ w: 2.2, d: 1.8, stilt: 0.4, wallH: 0.9, roof: '#6E3B23', cols: 3 }), rumahPanggung({ w: 2.0, d: 1.7, stilt: 0.4, wallH: 0.9, roof: '#5A3A22', cols: 3 })];
  at3(th[0], -3.2, 1.5, 0, 0, 0.2, 0); at3(th[1], 2.4, 1.5, 0.4, 0, -0.2, 0); th.forEach(h => TEB2.add(h)); TEB2.userData.th = th;
  TEB2.add(at3(palm(3.2, 0.2), 5.8, 1.5, -0.6));
  at3(TEB2, 4, 0, -19); G.add(TEB2);
  [[-12, 0, -26, 9, 4.2], [8, 0, -28, 11, 5.6]].forEach(([x, y, z, r, h]) => G.add(at3(hill(r, h, '#4F8A45'), x, y, z)));
  [[-8, 11, -27], [7, 13, -29]].forEach(([x, y, z], i) => G.add(at3(cloud(1.4 + i * 0.3), x, y, z)));
  BLK_A.scale.setScalar(0.75); BLK_B.scale.setScalar(0.6);
  G.add(BLK_A); G.add(BLK_B);
  return G;
});
const SAPLING = prop(grp(at3(cyl(0.012, 0.015, 0.5, '#86A94E', { cast: false }, 6), 0, 0.25, 0), at3(sph(0.07, '#4F9A3C', { cast: false }, 8, 5), 0, 0.52, 0)));
DESA.userData.update = t => {
  RIVER_C.position.y = -0.5 + FLOOD * 0.35; RIVER_M.position.y = -0.5 + FLOOD * 0.35;
  RIVER_C.visible = FLOOD < 0.05; RIVER_M.visible = FLOOD >= 0.05;
  CLUMPS.forEach((B, i) => { B.visible = !HIDEB && i < NB; B.rotation.z = Math.sin(t * 1.7 + i) * 0.015 * (1 + WIND * 3); });
  COFFEE.forEach((K, i) => { K.visible = !HIDEB && i >= NB; });
  TEB2.position.set(4, -COL * 1.1, -19 + COL * 7.0); TEB2.rotation.x = COL * 0.3;
  TEB2.userData.th.forEach((h, i) => { h.rotation.z = (i ? -0.2 : 0.2) + COL * (i ? -0.25 : 0.3); });
  BLK_A.visible = BLKS.a; BLK_B.visible = BLKS.b;
  BLK_A.position.set(BLX, BLKS.ay, BLZ); BLK_B.position.set(BLX, BLKS.by, BLZ);
  const c = BLK_B.userData.chunk; c.position.set(0.72 + ERO * 1.1, 1.12 - ERO * 0.95, 0); c.rotation.z = -ERO * 0.9;
};
const BLKS = { a: false, b: false, ay: 0.35, by: 0.15 };
const STORM = ['#4A5560', '#9AA3A8'], GLOOM = ['#6A7480', '#B8BFC4'];
function set(m, sk, flood, col, nb, wind) {
  sky(sk); mood(m); show(DESA);
  FLOOD = flood; COL = col; NB = nb ?? 8; WIND = wind || 0; ERO = 0; HIDEB = false;
  BLKS.a = false; BLKS.b = false;
  RIAN.visible = false; SAMAN.visible = false;
  if (sk === STORM) { SUN.intensity = 0.3; HEMI.intensity = 0.55; HEMI.color.setHex(0xaab4c0); }
  if (sk === GLOOM) { SUN.intensity = 0.5; HEMI.intensity = 0.5; }
}
function rain(t, k = 1) {
  ui(tt => { g.save(); g.strokeStyle = `rgba(205,218,238,${0.32 * k})`; g.lineWidth = 3; g.lineCap = 'round';
    for (let i = 0; i < 170; i++) { const y = (rnd(i + 7) * H + tt * 2100 * (0.8 + rnd(i) * 0.4)) % (H + 120) - 60, x = (rnd(i) * (W + 300) - y * 0.16); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 11, y + 64); g.stroke(); }
    g.restore(); });
}
const HOOKCU = { side: 0.25, dist: 2.3, up: -0.05 };
const posS = (t, o) => pose(SAMAN, t, Object.assign({ x: 1.4, z: 0.8, ry: -0.5 }, o));
const posR = (t, o) => pose(RIAN, t, Object.assign({ x: -0.2, z: 1.0, ry: 0.5 }, o));
const hookRian = (t, o) => pose(RIAN, t, Object.assign({ x: 0.6, z: 1.0, ry: -0.2, expr: 'shock', arms: 'up', shake: 0.5 }, o));

function scene(t) {
  const k = beatOf(t);
  if (k === 0) {                                   // Hook v4: frame 0 = hujan deras, tebing sebelah runtuh + wajah kaget
    set('siang', STORM, 0.8, lerp(0.15, 1, ease(seg(t, 0, 6.2))), 8, 1);
    if (t < 2.8) { hookRian(t); closeUp(t, RIAN, 0, 2.8, Object.assign({ push: 0.08 }, HOOKCU)); }
    else if (t < at('Tapi')) { HIDEB = true; shot(t, 2.8, at('Tapi'), [-1.0, 2.4, 3.0], [4, 1.6, -17], { push: 0.1 }); }
    else shot(t, at('Tapi'), CUT[1], [-2.2, 1.8, 3.6], [0.0, 1.3, -0.8], { push: 0.08 });
    chip('Hujan deras tiga hari', 540, 230, 0.0, { size: 50, t1: at('Tapi') });
    if (t >= at('Tapi')) chip('Kampung ini: tebing utuh', 540, 230, at('Tapi'), { size: 50 });
    bigWord('Tetap utuh!', at('tetap') - 0.05, CUT[1] - 0.05);
    rain(t, 1);
  } else if (k === 1) {                            // Konflik: sebulan sebelumnya, cerah
    set('siang', 'desa', 0, 0, 8);
    if (t < at('Kek')) {
      posS(t, { expr: 'smile' });
      posR(t, { walk: true, x: -0.2 - (1 - seg(t, CUT[1], at('menunjuk'))) * 1.4, expr: 'smile', arms: t > at('menunjuk') ? 'point' : 'down' });
      shot(t, CUT[1], at('Kek'), [0.0, 1.7, 5.2], [0.6, 1.1, -1.0], { push: 0.08 });
    } else {
      posS(t, { expr: 'flat' }); posR(t, { expr: 'laugh', arms: 'point', talk: true, ry: -0.1 });
      closeUp(t, RIAN, at('Kek'), CUT[2], { side: 0.5, dist: 2.0, up: 0.15 });
    }
    chip('Sebulan sebelumnya', 540, 230, CUT[1] + 0.1, { size: 50, t1: at('Kek') });
    card(['"Bambu sebanyak ini', 'kok dibiarkan?"'], 540, 1560, at('Kek') - 0.1);
  } else if (k === 2) {                            // Rahasia leluhur: adat Semende
    set('siang', 'desa', 0, 0, 8);
    posS(t, { expr: 'talk', talk: true, arms: 'point', ry: -0.2 }); posR(t, { expr: 'flat', arms: 'chin' });
    if (t < at('Semende')) closeUp(t, SAMAN, CUT[2], at('Semende'), { side: 0.4, dist: 1.7, up: 0.1 });
    else if (t < at('Aturan')) { SAMAN.visible = false; RIAN.visible = false; shot(t, at('Semende'), at('Aturan'), [-7.6, 1.9, 3.4], [-7.8, 2.2, -0.6], { push: 0.1 }); }
    else closeUp(t, SAMAN, at('Aturan'), CUT[3], { side: 0.5, dist: 1.7, up: 0.1 });
    chip('Adat Semende · Sumsel', 540, 240, at('Semende') - 0.1, { size: 50, t1: at('Aturan') });
    chip('Bambu + beringin di tepi sungai', 540, 240, at('beringin') - 0.3, { size: 44, t1: at('Aturan') });
    card(['"Pohon di tepi sungai', 'tidak boleh ditebang."'], 540, 1560, at('Aturan') - 0.1);
  } else if (k === 3) {                            // Sains: akar serabut mengikat tanah
    set('siang', 'desa', 0, 0, 8);
    BLKS.a = true; BLKS.ay = 0.35; BLK_A.position.set(BLX, 0.35, BLZ);
    shot(t, CUT[3], CUT[4], [BLX, 1.2, BLZ + 3.6], [BLX, 1.1, BLZ], { push: 0.1, fov: 40 });
    chip('Akar serabut: rapat + menyebar', 540, 240, at('akar') - 0.1, { size: 46, t1: at('jaring') });
    chip('Seperti jaring', 540, 240, at('jaring') - 0.05, { size: 54, t1: at('Air') });
    chip('Tanah terikat, sulit tergerus', 540, 240, at('Air') - 0.05, { size: 46, stamp: true });
    if (t >= at('Air')) rain(t, 0.6);
  } else if (k === 4) {                            // Lapisan kedua: penelitian + bambu menyempit
    if (t < at('Sayangnya')) {
      set('siang', 'desa', 0, 0, 8);
      BLKS.a = true; BLKS.b = true; BLKS.ay = 1.55; BLKS.by = 0.15; ERO = ease(seg(t, at('kosong') - 0.9, at('kosong') + 0.9));
      shot(t, CUT[4], at('Sayangnya'), [BLX, 1.5, BLZ + 4.4], [BLX, 1.35, BLZ], { push: 0.06, fov: 42 });
      chip('Sungai Pesing, Bantul', 540, 240, at('Pesing') - 0.2, { size: 52, t1: at('sukar') - 0.1 });
      chip('Bambu: tanah bertahan', 540, 240, at('sukar') - 0.1, { size: 50, t1: at('kosong') });
      chip('Tanah kosong: tergerus', 540, 240, at('kosong') - 0.1, { size: 50, stamp: true, t1: at('Sayangnya') });
      rain(t, 0.5);
    } else {
      set('siang', 'desa', 0, 0, Math.round(lerp(8, 2, ease(seg(t, at('Sayangnya'), at('menyempit') + 0.8)))));
      shot(t, at('Sayangnya'), CUT[5], [-0.5, 3.0, 5.8], [0, 0.8, -1.5], { push: 0.08 });
      chip('Bambu menyempit jadi kebun', 540, 240, at('menyempit') - 0.2, { size: 46, stamp: true });
    }
  } else if (k === 5) {                            // Perubahan: hujan datang, tebing sebelah ambruk
    if (t < at('Sekarang')) {
      set('siang', STORM, 0.9, 1, 8, 1);
      if (t < at('Rian', 1)) { HIDEB = true; shot(t, CUT[5], at('Rian', 1), [-1.0, 2.4, 2.6], [4, 1.5, -17], { push: 0.08 }); }
      else { posR(t, { expr: 'worried', arms: 'down', x: 0.6, ry: -0.2 }); closeUp(t, RIAN, at('Rian', 1), at('Sekarang'), { side: 0.3, dist: 2.0, up: 0.1 }); }
      chip('Tebing sebelah ambruk', 540, 230, at('ambruk') - 0.2, { size: 50, stamp: true });
      rain(t, 1);
    } else {
      set('siang', 'desa', 0, 1, 8);
      posR(t, { x: 0.6, z: 1.0, ry: -0.2, expr: 'happy', arms: 'hold', talk: true }); hold(RIAN, 'R', SAPLING);
      closeUp(t, RIAN, at('Sekarang'), CUT[6], { side: 0.4, dist: 1.9, up: 0.15 });
      chip('Menanam bambu baru', 540, 1560, at('menanam', 1) - 0.1, { size: 48 });
    }
  } else {                                         // Akhiran loop: awan menghitam → kembali ke komposisi frame 0
    const gl = ease(seg(t, CUT[6], DURATION));
    set('siang', GLOOM, 0.2 + gl * 0.4, 0, 8, gl);
    if (t < DURATION - 1.6) shot(t, CUT[6], DURATION - 1.6, [-3.0, 1.8, 4.0], [1.0, 3.2, -12], { push: 0.1 });
    else { hookRian(t, { expr: 'worried', arms: 'down', shake: 0.2 }); closeUp(t, RIAN, DURATION - 1.6, DURATION, Object.assign({ push: 0.04 }, HOOKCU)); }
    rain(t, 0.3 + gl * 0.6);
  }
}
renderFrame(0);
