KEYWORDS = new Set(['leuit', 'leuitnya', 'menjauh', 'jauh', 'api', 'Jarak', 'bertangkai', 'puluhan', 'utuh', 'bara', 'kelaparan', 'ratusan']);

window.EXTRA_SFX = [
  { t: 0.0,                      type: 'boom',    gain: 0.5 },
  { t: 0.1,                      type: 'api',     d: 9.5, gain: 0.5 },
  { t: 0.3,                      type: 'ramai',   d: 6.0, gain: 0.25 },
  { t: at('jauh') - 0.05,        type: 'stamp',   d: 0.5, gain: 1.0 },
  { t: at('tertawa') - 0.1,      type: 'langkah', d: 0.8, gain: 0.4 },
  { t: at('berkaki') - 0.1,      type: 'kayu',    d: 0.6, gain: 0.3 },
  { t: at('tersambar') - 0.1,    type: 'api',     d: 6.0, gain: 0.4 },
  { t: at('Jarak') - 0.05,       type: 'stamp',   d: 0.4, gain: 0.9 },
  { t: at('puluhan') - 0.05,     type: 'stamp',   d: 0.4, gain: 0.8 },
  { t: at('kebakaran') - 0.1,    type: 'api',     d: 3.4, gain: 0.35 },
  { t: at('membuka') - 0.05,     type: 'kayu',    d: 0.6, gain: 0.4 },
  { t: at('utuh') - 0.05,        type: 'stamp',   d: 0.4, gain: 0.9 },
  { t: at('bara') - 0.1,         type: 'api',     d: 3.6, gain: 0.35 },
];

// Baduy Luar: baju hitam, ikat kepala biru batik. Raka: mahasiswa kota, topi biru, kaus krem polos.
const AKI = makeChar({ shirt: '#22222A', pattern: 'tenun', pat2: '#3A3A48', sarung: '#1F2A44', hair: 'grey', mustache: true, beardCol: '#9A9A9A', hat: 'headband', hatCol: '#2C4F8C', collar: false });
const RAKA = makeChar({ shirt: '#E6DCC6', pants: '#3A4A66', hair: 'black', hat: 'cap', hatCol: '#2E6F9E' });

// ── atap daun (rumbia/kirai): ganti genteng dengan anyaman daun ──
function thatch(R) { R.traverse(m => { if (m.isMesh && !m.material.isShaderMaterial && m.geometry.type === 'BoxGeometry') m.material = texMat('weave', '#7A5A32', '#57401F', [3, 3]); }); return R; }
function rumahBaduy(o = {}) {
  const H = rumahPanggung({ w: o.w || 2.4, d: o.d || 1.9, stilt: 0.45, weave: true, wallH: 1.0, roof: '#6E5030', cols: 3 });
  thatch(H.children[H.children.length - 1]);
  return H;
}
// ── leuit: lumbung berkaki, papan bundar penahan tikus di tiap tiang ──
function makeLeuit(s = 1) {
  const G = new THREE.Group();
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => {
    G.add(at3(cyl(0.05, 0.06, 0.95, '#6E4A28', { ol: 0.008 }, 8), a * 0.36, 0.47, b * 0.36));
    G.add(at3(cyl(0.17, 0.17, 0.04, '#8A6239', { ol: 0.008 }, 16), a * 0.36, 0.62, b * 0.36));
  });
  G.add(at3(box(0.98, 0.08, 0.98, '#7A5430', { ol: 0.01 }), 0, 0.97, 0));
  const body = cyl(0.56, 0.44, 0.9, texMat('weave', '#C89A58', '#A77A3E', [3, 1]), { ol: 0.012 }, 4);
  at3(body, 0, 1.46, 0, 0, Math.PI / 4, 0); G.add(body);
  const door = box(0.3, 0.36, 0.03, '#5A3C1E', { ol: 0.006 }); at3(door, 0, 1.6, 0.36); G.add(door);
  const roof = thatch(gableRoof(0.95, 0.95, 0.75, '#6E5030', 0.22)); roof.position.y = 1.9; G.add(roof);
  G.scale.setScalar(s); G.userData.door = door;
  return G;
}
// ── api besar + asap ──
function bigFire(s = 1) {
  const G = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const hot = i % 3 === 0, c = hot ? '#FFE07A' : i % 2 ? '#FFB03A' : '#EE5A12';
    const f = cone(0.18 + rnd(i) * 0.14, 0.7 + rnd(i + 2) * 0.6, c, { cast: false }, 8);
    f.material = mat(c, { emissive: hot ? 0xffd060 : 0xff5a10, ei: 1.2 });
    at3(f, (rnd(i + 9) - 0.5) * 1.6, 0.35, (rnd(i + 4) - 0.5) * 1.0); G.add(f);
  }
  const smoke = [];
  for (let i = 0; i < 6; i++) { const sm = sph(0.35 + rnd(i) * 0.2, '#2B2523', { cast: false }, 12, 8); sm.material = mat('#2B2523', { opacity: 0.55, basic: true }); G.add(sm); smoke.push(sm); }
  G.userData.update = t => {
    G.children.forEach((f, i) => { if (i < 9) f.scale.set(1, 0.75 + Math.abs(Math.sin(t * 8 + i * 1.9)) * 0.55, 1); });
    smoke.forEach((sm, i) => { const k = (t * 0.35 + i / 6) % 1; sm.position.set((rnd(i) - 0.5) * 1.2 + k * 0.6, 1.0 + k * 3.2, (rnd(i + 3) - 0.5) * 0.6); sm.scale.setScalar(0.6 + k * 1.4); });
  };
  G.scale.setScalar(s);
  return G;
}
// puing: tiang hangus + abu
function ruins() {
  const G = new THREE.Group();
  G.add(flat(2.8, 2.2, texMat('kerikil', '#3A3330', '#1E1A18', [2, 2]), 0.012));
  for (let i = 0; i < 6; i++) G.add(at3(cyl(0.06, 0.07, 0.3 + rnd(i) * 0.5, '#1E1A18', { ol: 0.006 }, 6), (i % 3 - 1) * 1.0, 0.25, (i < 3 ? -0.8 : 0.8), rnd(i) * 0.3, 0, rnd(i + 2) * 0.3));
  return G;
}
// ikat padi bertangkai (pare ranggeuy)
function padiIkat() {
  const G = new THREE.Group();
  for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 0.03 + (i % 3) * 0.025; G.add(at3(cyl(0.008, 0.008, 0.5, '#C9A44C', { cast: false }, 5), Math.cos(a) * r, 0.25, Math.sin(a) * r)); for (let j = 0; j < 3; j++) G.add(at3(capsule(0.011, 0.05, '#E2B84A', { cast: false }), Math.cos(a) * r * (1.5 + j * 0.25), 0.5 + j * 0.04, Math.sin(a) * r * (1.5 + j * 0.25), Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6)); }
  G.add(at3(torus(0.07, 0.012, '#7A5430'), 0, 0.2, 0, Math.PI / 2, 0, 0));
  return G;
}

const HOUSES = [[-3.6, -3.4, 0.1], [-0.8, -4.0, -0.15], [-5.8, -6.2, 0.2], [-2.4, -7.0, 0], [0.8, -7.4, -0.2]];
const LEUITS = [[6.4, -4.2], [7.6, -4.6], [8.8, -4.3], [10.0, -4.7], [6.9, -6.0], [8.2, -6.3], [9.5, -6.0]];
const H_OBJ = [], FIRES = [], RUINS = [], L_OBJ = [];
let FIRE = [0, 0, 0, 0, 0], BURNT = false;
const NEAR_LEUIT = makeLeuit(0.9), NEAR_FIRE = bigFire(1.2);
const KAMPUNG = build('kampung_baduy', () => {
  const G = new THREE.Group();
  G.add(ground('rumput', 70));
  G.add(at3(path(1.4, 14), 3.2, 0, -3, 0, 0.0, 0));
  G.add(at3(path(10, 3.4), -2.3, 0, -5.2));
  HOUSES.forEach(([x, z, ry], i) => {
    const H = rumahBaduy(); at3(H, x, 0, z, 0, ry, 0); G.add(H); H_OBJ.push(H);
    const F = bigFire(1); at3(F, x, 1.75, z); G.add(F); FIRES.push(F);
    const R = ruins(); at3(R, x, 0, z, 0, ry, 0); G.add(R); RUINS.push(R);
  });
  LEUITS.forEach(([x, z], i) => { const L = makeLeuit(0.9); at3(L, x, 0, z, 0, -0.2 + rnd(i) * 0.3, 0); G.add(L); L_OBJ.push(L); });
  at3(NEAR_LEUIT, -1.8, 0, -1.6, 0, 0.2, 0); G.add(NEAR_LEUIT);
  at3(NEAR_FIRE, -1.8, 1.5, -1.6); G.add(NEAR_FIRE);
  const tk = PROP.tungku(); at3(tk, -3.0, 0, -1.6); G.add(tk);
  [[-9, -3], [-9.5, -8], [13, -3], [13.5, -8], [4.2, -11]].forEach(([x, z], i) => G.add(at3(tree(2.6 + (i % 2) * 0.6, '#3E8F45'), x, 0, z)));
  [[-8, 0, -20, 8, 3.2], [6, 0, -22, 9, 3.8], [18, 0, -19, 6, 2.4]].forEach(([x, y, z, r, h]) => G.add(at3(hill(r, h, '#4F8A45'), x, y, z)));
  G.add(at3(bush(0.4), 4.6, 0, 0.4)); G.add(at3(bush(0.35), -6.5, 0, -1.0)); G.add(at3(bush(0.4), 11.5, 0, -2.4));
  [[-9, 10, -26], [7, 12, -28]].forEach(([x, y, z], i) => G.add(at3(cloud(1.4 + i * 0.3), x, y, z)));
  return G;
});
const TUNGKU_API = prop(PROP.api());
const PADI = [0, 1, 2].map(() => prop(padiIkat()));
const HANDPADI = prop(padiIkat());
KAMPUNG.userData.update = t => {
  H_OBJ.forEach((H, i) => { H.visible = !BURNT; });
  RUINS.forEach(R => { R.visible = BURNT; });
  FIRES.forEach((F, i) => { const k = FIRE[i] || 0; F.visible = k > 0.02; F.scale.setScalar(Math.max(0.01, k) * 1.7); });
};
const NIGHTFIRE = ['#2A1430', '#C24A1E'];
function set(m, sk, fire, o = {}) {
  sky(sk); mood(m); show(KAMPUNG);
  FIRE = Array.isArray(fire) ? fire : [fire, fire, fire, fire, fire]; BURNT = !!o.burnt;
  NEAR_LEUIT.visible = !!o.near; NEAR_FIRE.visible = !!o.nearFire;
  AKI.visible = false; RAKA.visible = false;
  L_OBJ[0].userData.door.rotation.y = 0; L_OBJ[0].userData.door.position.x = 0;
  if (m === 'malam' && Math.max(...FIRE) > 0.1) { SUN.color.setHex(0xff8a3a); SUN.intensity = 0.7; HEMI.color.setHex(0xa0603a); HEMI.intensity = 0.42; }
}
// cahaya api 2D: pendar oranye bergetar + bara terbang
function glow(t, k = 1) {
  ui(tt => {
    const f = 0.85 + Math.sin(tt * 13) * 0.08 + Math.sin(tt * 7.3) * 0.07;
    const gr = g.createLinearGradient(0, H, 0, 0); gr.addColorStop(0, `rgba(255,110,30,${0.22 * k * f})`); gr.addColorStop(0.6, `rgba(255,140,40,${0.08 * k * f})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 70 * k; i++) {
      const sp = 0.6 + rnd(i) * 0.8, y = H - ((tt * 260 * sp + rnd(i + 3) * H) % (H + 100)), x = rnd(i + 11) * W + Math.sin(tt * 2 + i) * 40;
      g.fillStyle = `rgba(255,${150 + Math.floor(rnd(i + 5) * 90)},60,${0.85 * (y / H)})`; g.beginPath(); g.arc(x, y, 2.5 + rnd(i + 2) * 3.5, 0, 7); g.fill();
    }
  });
}
const HOOKCU = { side: 0.25, dist: 2.3, up: -0.12 };
const posA = (t, o) => pose(AKI, t, Object.assign({ x: 4.6, z: -1.6, ry: -0.5 }, o));
const posR = (t, o) => pose(RAKA, t, Object.assign({ x: 3.4, z: -0.9, ry: 0.5 }, o));
const hookRaka = (t, o) => pose(RAKA, t, Object.assign({ x: 1.6, z: 0.4, ry: 0.25, expr: 'shock', arms: 'up' }, o));

function scene(t) {
  const k = beatOf(t);
  if (k === 0) {                                   // Hook v4: frame 0 = kampung terbakar + wajah kaget
    set('malam', NIGHTFIRE, 1);
    if (t < 2.4) { hookRaka(t, { shake: 0.5 }); closeUp(t, RAKA, 0, 2.4, Object.assign({ push: 0.08 }, HOOKCU)); }
    else if (t < 4.2) shot(t, 2.4, 4.2, [-1.6, 2.6, 4.4], [-2.6, 1.2, -5.0], { push: 0.1, shake: 0.03 });
    else if (t < at('Padi')) { posA(t, { x: 2.4, z: 0.2, ry: 0.1, expr: 'worried', arms: 'down' }); hookRaka(t, { x: 1.4, z: 0.6, ry: 0.4, expr: 'worried', arms: 'down' }); closeUp(t, AKI, 4.2, at('Padi'), { side: -0.5, dist: 2.0, up: 0.15 }); }
    else shot(t, at('Padi'), CUT[1], [4.6, 1.6, 2.6], [8.2, 1.1, -5.0], { push: 0.12 });
    chip('Satu kampung terbakar', 540, 230, 0.0, { size: 50, t1: at('Padi') });
    if (t >= at('Padi')) chip('Leuit: lumbung padi', 540, 230, at('Padi'), { size: 52 });
    bigWord('Jauh dari rumah!', at('jauh') - 0.05, CUT[1] - 0.05);
    glow(t, 1);
  } else if (k === 1) {                            // Konflik (seminggu sebelumnya, siang)
    set('siang', 'desa', 0);
    if (t < at('tertawa')) { posR(t, { walk: true, x: 3.4 - (1 - seg(t, CUT[1], at('tertawa'))) * 2.0, expr: 'smile' }); shot(t, CUT[1], at('tertawa'), [-0.6, 2.4, 6.0], [3.0, 1.0, -3.4], { push: 0.08 }); }
    else if (t < at('Ki')) { posR(t, { expr: 'laugh', arms: 'hips', ry: 1.0 }); posA(t, { expr: 'smile' }); shot(t, at('tertawa'), at('Ki'), [3.2, 1.2, 2.2], [8.0, 1.2, -5.0], { push: 0.08 }); }
    else { posA(t, { expr: 'flat' }); posR(t, { expr: 'laugh', arms: 'point', talk: true, ry: 0.2 }); closeUp(t, RAKA, at('Ki'), CUT[2], { side: 0.5, dist: 2.0, up: 0.15 }); }
    chip('Seminggu sebelumnya', 540, 230, CUT[1] + 0.1, { size: 50, t1: at('Ki') });
    card(['"Ki, padi kok', 'ditaruh jauh-jauh?"'], 540, 1560, at('Ki') - 0.1);
  } else if (k === 2) {                            // Rahasia leluhur
    set('siang', 'desa', 0);
    posA(t, { expr: 'talk', talk: true, arms: 'point', ry: -0.3 }); posR(t, { expr: 'flat', arms: 'chin' });
    if (t < at('leuit')) closeUp(t, AKI, CUT[2], at('leuit'), { side: 0.5, dist: 1.7, up: 0.1 });
    else if (t < at('Pesan')) shot(t, at('leuit'), at('Pesan'), [6.6, 0.7, -2.2], [7.4, 0.8, -4.4], { push: 0.1 });
    else if (t < at('leuit', 1)) shot(t, at('Pesan'), at('leuit', 1), [-0.4, 3.2, 3.2], [-2.4, 0.8, -5.2], { push: 0.08 });
    else { posA(t, { expr: 'talk', talk: true, arms: 'hold', ry: -0.5 }); closeUp(t, AKI, at('leuit', 1), CUT[3], { side: 0.6, dist: 1.7, up: 0.1 }); }
    chip('Leuit = lumbung berkaki', 540, 240, at('leuit') - 0.1, { size: 52, t1: at('Pesan') });
    card(['"Rumah boleh berdempet,', 'leuit harus menjauh."'], 540, 1560, at('rumah', 1) - 0.3);
  } else if (k === 3) {                            // Sains: api merambat rumah ke rumah
    const s0 = at('tersambar') - 0.2;
    const spread = i => ease(seg(t, s0 + i * 0.5, s0 + i * 0.5 + 0.8));
    const near = t >= at('Kalau') && t < at('Jarak');
    set('sore', 'sore', [spread(0), spread(1), spread(3), spread(2), spread(4)].map(v => (t < at('Jarak') ? v : 0)), { near, nearFire: near && t > at('membawa') - 0.2 });
    if (t < at('tersambar')) shot(t, CUT[3], at('tersambar'), [-1.0, 1.2, 1.8], [-3.0, 1.0, -2.6], { push: 0.08 });
    else if (t < at('Kalau')) shot(t, at('tersambar'), at('Kalau'), [-0.6, 4.2, 4.6], [-2.6, 0.6, -5.2], { push: 0.08 });
    else if (t < at('Jarak')) shot(t, at('Kalau'), at('Jarak'), [0.6, 2.0, 3.4], [-2.4, 1.0, -2.6], { push: 0.08 });
    else shot(t, at('Jarak'), CUT[4], [2.6, 5.4, 6.0], [2.6, 0.6, -5.0], { push: 0.06 });
    chip('Atap daun kering', 540, 240, at('daun') - 0.1, { size: 52, t1: at('Kalau') });
    chip('Api bawa rumah + makanan', 540, 240, at('membawa') - 0.1, { size: 48, t1: at('Jarak') });
    chip('Jarak = api tak sampai', 540, 240, at('Jarak') - 0.05, { size: 52, stamp: true });
    if (t >= at('tersambar') && t < at('Jarak')) glow(t, 0.5);
  } else if (k === 4) {                            // Lapisan kedua
    if (t < at('Tapi', 1)) {
      set('siang', 'desa', 0);
      if (t < at('di', 3)) {
        place(PADI[0], 5.6, 0.0, -3.0, 0, 1.4); place(PADI[1], 5.85, 0.0, -3.1, 0.6, 1.4); place(PADI[2], 5.35, 0.0, -3.15, 1.2, 1.4);
        shot(t, CUT[4], at('di', 3), [5.6, 1.0, -1.2], [5.6, 0.4, -3.1], { push: 0.12, fov: 40 });
      } else shot(t, at('di', 3), at('Tapi', 1), [5.0, 0.9, -1.6], [8.0, 1.2, -4.8], { push: 0.1 });
      chip('Gabah masih bertangkai', 540, 240, at('bertangkai') - 0.2, { size: 50, t1: at('Peneliti') });
      chip('Bertahan puluhan tahun', 540, 240, at('puluhan') - 0.05, { size: 52, stamp: true });
    } else {
      SEPIA = 0.55;
      set('sore', 'sore', [1, 1, 0, 0, 0], { near: true, nearFire: true });
      shot(t, at('Tapi', 1), CUT[5], [0.4, 2.6, 3.4], [-2.2, 1.0, -2.6], { push: 0.1 });
      chip('Baduy, 2017', 540, 240, at('kebakaran') - 0.1, { size: 54, stamp: true });
      chip('Ratusan leuit ikut terbakar', 540, 1560, at('ratusan') - 0.1, { size: 46 });
      glow(t, 0.6);
    }
  } else if (k === 5) {                            // Perubahan: pagi setelah kebakaran
    set('siang', ['#9FB3C6', '#E9DDC9'], 0, { burnt: true });
    const open = ease(seg(t, at('membuka'), at('membuka') + 0.6));
    L_OBJ[0].userData.door.rotation.y = -open * 1.4; L_OBJ[0].userData.door.position.x = open * 0.14;
    if (t < at('membuka')) { posA(t, { x: 6.4, z: -2.8 - seg(t, CUT[5], at('membuka')) * 0.5, ry: Math.PI, walk: true }); posR(t, { x: 5.4, z: -2.4, ry: 2.6, expr: 'worried' }); shot(t, CUT[5], at('membuka'), [2.6, 2.0, 1.6], [5.6, 0.8, -3.6], { push: 0.08 }); }
    else if (t < at('Padinya')) {
      posA(t, { x: 6.4, z: -3.3, ry: Math.PI, arms: 'reach' }); posR(t, { x: 5.6, z: -2.6, ry: 2.6, expr: 'worried' });
      shot(t, at('membuka'), at('Padinya'), [4.8, 2.5, -1.2], [6.4, 1.4, -4.0], { push: 0.1 });
    } else if (t < at('Sekarang')) {
      posA(t, { x: 6.3, z: -3.2, ry: -0.5, expr: 'happy', arms: 'hold' }); hold(AKI, 'R', HANDPADI);
      posR(t, { x: 5.5, z: -2.6, ry: 2.6, expr: 'shock' });
      closeUp(t, AKI, at('Padinya'), at('Sekarang'), { side: 0.3, dist: 2.0, up: 0.0 });
      chip('Padinya utuh', 540, 240, at('utuh') - 0.1, { size: 56, stamp: true });
    } else {
      pose(RAKA, t, { x: 2.0, z: -1.2, ry: 0.4, expr: 'talk', talk: true, arms: 'point' });
      closeUp(t, RAKA, at('Sekarang'), CUT[6], { side: 0.4, dist: 1.9, up: 0.15 });
      chip('Jangan bangun dekat lumbung!', 540, 1560, at('melarang') - 0.1, { size: 44 });
    }
  } else {                                         // Akhiran loop: bara tungku → kembali ke frame 0
    const ign = ease(seg(t, at('lupa') - 0.3, DURATION));
    set('malam', 'malam', [ign * 0.6, 0, 0, 0, 0]);
    place(TUNGKU_API, -3.0, 0.5, -1.6, 0, 1.2);
    if (t < DURATION - 1.6) shot(t, CUT[6], DURATION - 1.6, [-2.2, 1.1, 0.4], [-3.2, 0.6, -1.8], { push: 0.1 });
    else { hookRaka(t, { expr: 'worried', arms: 'down' }); closeUp(t, RAKA, DURATION - 1.6, DURATION, Object.assign({ push: 0.04 }, HOOKCU)); }
    glow(t, 0.25 + ign * 0.6);
  }
}
renderFrame(0);
