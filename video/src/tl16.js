KEYWORDS = new Set(['roboh', 'berdiri', 'ringan', 'pasak', 'semen', 'berat', 'bergoyang', 'melentur', 'Sasak', 'seberat', 'diam']);

window.EXTRA_SFX = [
  { t: 0.0,                      type: 'boom',    gain: 0.6 },
  { t: 0.0,                      type: 'gempa',   d: 10.0, gain: 0.55 },
  { t: at('roboh') - 0.1,        type: 'boom',    gain: 0.6 },
  { t: at('masih') - 0.05,       type: 'stamp',   d: 0.5, gain: 1.0 },
  { t: at('menepuk') - 0.05,     type: 'kayu',    d: 0.5, gain: 0.4 },
  { t: at('pasak') - 0.1,        type: 'kayu',    d: 0.6, gain: 0.35 },
  { t: at('dorongan') - 0.1,     type: 'gempa',   d: 12.0, gain: 0.3 },
  { t: at('dihantam') - 0.05,    type: 'stamp',   d: 0.4, gain: 0.8 },
  { t: at('Agustus') - 0.05,     type: 'stamp',   d: 0.4, gain: 0.8 },
  { t: at('berdiri', 1) - 0.05,  type: 'stamp',   d: 0.4, gain: 0.9 },
  { t: at('Malam') - 0.1,        type: 'angin',   d: 3.0, gain: 0.25 },
  { t: at('tanah') - 0.1,        type: 'gempa',   d: 3.6, gain: 0.35 },
];

// Paman (Sasak): sapuq emas, baju hitam tenun, sarung kotak merah tua. Doni: tukang kota, topi kuning, kaus garis hijau.
const PAMAN = makeChar({ shirt: '#2B2420', pattern: 'tenun', pat2: '#C8552E', sarung: '#7A2F2A', hair: 'white', beard: true, hat: 'headband', hatCol: '#C9A040', collar: false });
const DONI = makeChar({ shirt: '#2F5E3A', pattern: 'stripe', pat2: '#E8E8E8', pants: '#3A3F5C', hair: 'black', hat: 'cap', hatCol: '#E8B41F' });

PAT.bata = (a, b) => canvasTex('bata' + a + b, 128, 128, (x, w, h) => {
  x.fillStyle = b; x.fillRect(0, 0, w, h);
  for (let r = 0; r < 8; r++) for (let c = -1; c < 4; c++) { x.fillStyle = r % 3 ? a : '#B5683E'; x.fillRect(c * 36 + (r % 2) * 18 + 2, r * 16 + 2, 32, 12); }
}, [1, 1]);
// ── rumah adat Sasak: dasar tanah tinggi, dinding bedek, atap alang-alang besar menjuntai rendah ──
function rumahSasak(s = 1) {
  const G = new THREE.Group(), body = new THREE.Group(); G.add(body);
  body.add(at3(box(2.6, 0.45, 2.2, texMat('kerikil', '#9A7A55', '#6E5236', [2, 2]), { ol: 0.01 }), 0, 0.22, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => body.add(at3(cyl(0.06, 0.07, 1.2, '#6E4A28', { ol: 0.008 }, 8), a * 1.0, 1.05, b * 0.82)));
  body.add(at3(box(2.0, 1.0, 1.6, texMat('weave', '#C89A58', '#A77A3E', [3, 1.5]), { ol: 0.012 }), 0, 0.95, 0));
  body.add(at3(box(0.45, 0.8, 0.04, '#5A3C1E', { ol: 0.006 }), 0, 0.85, 0.82));
  const roof = cyl(0.12, 1.85, 1.5, texMat('weave', '#B8975A', '#8A6C3C', [6, 2]), { ol: 0.014 }, 4);
  at3(roof, 0, 2.3, 0, 0, Math.PI / 4, 0); roof.scale.set(1, 1, 0.85); body.add(roof);
  body.add(at3(cone(0.16, 0.35, '#8A6C3C', { ol: 0.008 }, 4), 0, 3.2, 0, 0, Math.PI / 4, 0));
  G.scale.setScalar(s); G.userData.body = body;
  return G;
}
// ── rumah tembok bata: 4 dinding berengsel di kaki, pelat atap; COLL 0..1 = roboh ──
function rumahBata(s = 1) {
  const G = new THREE.Group(), w = 2.4, d = 2.0, h = 1.6, bm = texMat('bata', '#C9784A', '#E6DCCB', [2, 1.4]);
  const walls = [];
  [[0, d / 2, 0, w], [0, -d / 2, Math.PI, w], [w / 2, 0, Math.PI / 2, d], [-w / 2, 0, -Math.PI / 2, d]].forEach(([x, z, ry, len], i) => {
    const P = new THREE.Group(); at3(P, x, 0, z, 0, ry, 0);
    const W = box(len, h, 0.14, bm, { ol: 0.01 }); at3(W, 0, h / 2, 0); P.add(W);
    if (i === 0) { P.add(at3(box(0.5, 0.9, 0.04, '#6D7B86', { ol: 0.006 }), -0.5, 0.45, 0.08)); P.add(at3(box(0.6, 0.45, 0.04, '#9FC6DA', { ol: 0.006 }), 0.55, 1.0, 0.08)); }
    G.add(P); walls.push(P);
  });
  const slab = box(w + 0.3, 0.16, d + 0.3, '#8C8C8C', { ol: 0.01 }); at3(slab, 0, h + 0.08, 0); G.add(slab);
  const rubble = new THREE.Group(); for (let i = 0; i < 16; i++) rubble.add(at3(box(0.3, 0.14, 0.18, i % 3 ? '#C9784A' : '#9A9A9A', { ol: 0.005 }), (rnd(i) - 0.5) * 2.8, 0.07, (rnd(i + 4) - 0.5) * 2.4, 0, rnd(i + 8) * 3, 0)); G.add(rubble);
  G.userData = { walls, slab, rubble, h };
  G.scale.setScalar(s);
  return G;
}
function setColl(B, k) {
  const U = B.userData;
  U.walls.forEach((P, i) => { const dir = i % 2 ? 1 : -1; P.children[0].rotation.x = -ease(seg(k, 0.1 + i * 0.08, 0.75 + i * 0.05)) * 1.45; P.children[0].position.set(0, U.h / 2 * Math.cos(P.children[0].rotation.x), U.h / 2 * Math.sin(-P.children[0].rotation.x)); });
  U.slab.position.y = (U.h + 0.08) * (1 - ease(seg(k, 0.35, 0.9))) + 0.2 * ease(seg(k, 0.35, 0.9));
  U.slab.rotation.z = ease(seg(k, 0.35, 0.9)) * 0.25;
  U.rubble.visible = k > 0.5;
}

const SASAK = rumahSasak(), BATA = rumahBata();
const EX_SASAK = [rumahSasak(0.9), rumahSasak(0.85), rumahSasak(0.9)];
const EX_BATA = [rumahBata(0.9), rumahBata(0.85)];
let Q = 0, COLL = 0, CRACK = 0;
const DESA = build('desa_sasak', () => {
  const G = new THREE.Group();
  G.add(ground('tanah', 70));
  G.add(at3(path(1.6, 14), 0.4, 0, 1));
  at3(SASAK, -1.7, 0, -3.4, 0, 0.15, 0); G.add(SASAK);
  at3(BATA, 2.5, 0, -3.6, 0, -0.2, 0); G.add(BATA);
  [[-5.4, -7.0, 0.3], [-1.2, -8.4, 0], [3.2, -8.8, -0.3]].forEach(([x, z, r], i) => { at3(EX_SASAK[i], x, 0, z, 0, r, 0); G.add(EX_SASAK[i]); });
  [[6.4, -6.8, -0.4], [-8.4, -4.2, 0.5]].forEach(([x, z, r], i) => { at3(EX_BATA[i], x, 0, z, 0, r, 0); G.add(EX_BATA[i]); });
  G.add(at3(palm(3.4, 0.2), -4.4, 0, -2.0)); G.add(at3(palm(3.0, -0.25), 5.6, 0, -2.6)); G.add(at3(tree(2.6, '#3E8F45'), -7.5, 0, -9.5)); G.add(at3(tree(2.4, '#3E8F45'), 8.5, 0, -10));
  G.add(at3(bush(0.4), 4.4, 0, 0.6)); G.add(at3(bush(0.35), -3.8, 0, 0.4));
  [[-10, 0, -22, 9, 4.2], [8, 0, -24, 11, 5.6]].forEach(([x, y, z, r, h]) => G.add(at3(hill(r, h, '#4F8A45'), x, y, z)));
  [[-8, 11, -27], [7, 13, -29]].forEach(([x, y, z], i) => G.add(at3(cloud(1.4 + i * 0.3), x, y, z)));
  return G;
});
DESA.userData.update = t => {
  const sw = Math.sin(t * 15) * 0.035 * Q;
  [SASAK, ...EX_SASAK].forEach((S, i) => { S.userData.body.rotation.z = sw * (i ? 0.8 : 1); S.userData.body.position.x = Math.sin(t * 15 + i) * 0.03 * Q; });
  setColl(BATA, COLL); EX_BATA.forEach(B => setColl(B, OLDCOLL));
  BATA.rotation.z = Math.sin(t * 17) * 0.012 * Q * (COLL < 0.05 ? 1 : 0);
};
let OLDCOLL = 0;
const LAMPU = prop(PROP.lampu());
function set(m, sk, q, coll, o = {}) { sky(sk); mood(m); show(DESA); Q = q; COLL = coll; OLDCOLL = o.old ?? coll; SHAKE = q * 0.06; }
function dust(t, k) {
  if (k <= 0) return;
  ui(tt => { for (let i = 0; i < 40; i++) { const x = rnd(i) * W, y = H * 0.35 + rnd(i + 3) * H * 0.4 - (tt * 40 * rnd(i + 5)) % 200; g.fillStyle = `rgba(200,180,150,${0.25 * k})`; g.beginPath(); g.arc(x, y, 30 + rnd(i + 7) * 60, 0, 7); g.fill(); } });
}
const HOOKCU = { side: -0.3, dist: 2.3, up: -0.1 };
const posP = (t, o) => pose(PAMAN, t, Object.assign({ x: -0.6, z: -1.2, ry: 0.4 }, o));
const posD = (t, o) => pose(DONI, t, Object.assign({ x: 0.9, z: -0.8, ry: -0.5 }, o));
const hookDoni = (t, o) => pose(DONI, t, Object.assign({ x: 0.6, z: 0.6, ry: -0.2, expr: 'shock', arms: 'up', shake: 0.6 }, o));

function scene(t) {
  const k = beatOf(t);
  if (k === 0) {                                   // Hook v4: frame 0 = gempa + tembok roboh + wajah kaget
    const c = seg(t, at('retak') - 0.2, at('roboh') + 0.6);
    set('sore', 'sore', 1, c);
    if (t < 2.8) { hookDoni(t); closeUp(t, DONI, 0, 2.8, Object.assign({ push: 0.08 }, HOOKCU)); }
    else if (t < at('Tapi')) shot(t, 2.8, at('Tapi'), [1.0, 1.6, 2.6], [2.5, 0.9, -3.6], { push: 0.08 });
    else shot(t, at('Tapi'), CUT[1], [0.6, 1.4, 2.8], [-1.7, 1.4, -3.4], { push: 0.1 });
    chip('Gempa M7 · Lombok', 540, 230, 0.0, { size: 52, t1: at('Tapi') });
    if (t >= at('Tapi')) chip('Rumah adat Sasak', 540, 230, at('Tapi'), { size: 52 });
    bigWord('Masih berdiri!', at('masih') - 0.05, CUT[1] - 0.05);
    dust(t, seg(t, at('roboh'), at('roboh') + 0.5) * (1 - seg(t, at('Tapi'), CUT[1])));
  } else if (k === 1) {                            // Konflik: setahun sebelumnya
    set('siang', 'desa', 0, 0);
    if (t < at('menepuk')) { posP(t, { expr: 'smile' }); posD(t, { walk: true, x: 0.9 + (1 - seg(t, CUT[1], at('menepuk'))) * 2.2, expr: 'smile' }); shot(t, CUT[1], at('menepuk'), [2.8, 1.8, 4.6], [-0.4, 1.0, -2.4], { push: 0.08 }); }
    else if (t < at('Paman')) { posP(t, { expr: 'flat' }); posD(t, { x: -0.6, z: -2.0, ry: Math.PI * 0.85, arms: 'reach', expr: 'laugh' }); shot(t, at('menepuk'), at('Paman'), [1.6, 1.4, 1.2], [-1.0, 1.0, -2.6], { push: 0.08 }); }
    else { posP(t, { expr: 'flat' }); posD(t, { expr: 'laugh', arms: 'point', talk: true, ry: -0.2 }); closeUp(t, DONI, at('Paman'), CUT[2], { side: 0.5, dist: 2.0, up: 0.15 }); }
    chip('Setahun sebelumnya', 540, 230, CUT[1] + 0.1, { size: 50, t1: at('Paman') });
    card(['"Paman, rumah bambu', 'ini kuno!"'], 540, 1560, at('Paman') - 0.1);
  } else if (k === 2) {                            // Rahasia leluhur: bahan ringan + pasak
    set('siang', 'desa', 0, 0);
    posP(t, { expr: 'talk', talk: true, arms: 'point', ry: 0.5 }); posD(t, { expr: 'flat', arms: 'chin' });
    if (t < at('tiang')) closeUp(t, PAMAN, CUT[2], at('tiang'), { side: 0.4, dist: 1.7, up: 0.1 });
    else if (t < at('Sambungannya')) { PAMAN.visible = false; DONI.visible = false; shot(t, at('tiang'), at('Sambungannya'), [-0.9, 1.3, 0.4], [-1.7, 1.3, -3.0], { push: 0.1, target2: [-1.7, 2.0, -3.2] }); }
    else if (t < at('Begitulah')) { PAMAN.visible = false; DONI.visible = false; shot(t, at('Sambungannya'), at('Begitulah'), [-0.3, 1.4, -1.6], [-0.9, 1.4, -2.5], { push: 0.15, fov: 40 }); }
    else closeUp(t, PAMAN, at('Begitulah'), CUT[3], { side: 0.6, dist: 1.7, up: 0.1 });
    chip('Tiang kayu', 540, 240, at('tiang') - 0.1, { size: 54, t1: at('dinding', 1) - 0.1 });
    chip('Dinding anyaman bambu', 540, 240, at('dinding', 1) - 0.1, { size: 52, t1: at('atap') - 0.1 });
    chip('Atap alang-alang', 540, 240, at('atap') - 0.1, { size: 54, t1: at('Sambungannya') });
    chip('Pasak + ikatan, bukan semen', 540, 240, at('pasak') - 0.1, { size: 46, stamp: true, t1: at('Begitulah') });
  } else if (k === 3) {                            // Sains: berat = dorongan
    const q = 0.7 + 0.3 * Math.sin((t - CUT[3]) * 0.8);
    set('siang', 'desa', q, t > at('dihantam') ? 0.08 : 0);
    if (t < at('Makin')) shot(t, CUT[3], at('Makin'), [0.4, 3.0, 5.4], [0.4, 1.1, -3.6], { push: 0.06 });
    else if (t < at('Rumah', 5)) shot(t, at('Makin'), at('Rumah', 5), [1.8, 1.3, 0.6], [2.5, 1.0, -3.6], { push: 0.1 });
    else if (t < at('Sambungan')) shot(t, at('Rumah', 5), at('Sambungan'), [-0.4, 1.5, 1.2], [-1.7, 1.4, -3.4], { push: 0.08 });
    else shot(t, at('Sambungan'), CUT[4], [-0.3, 1.4, -1.6], [-0.9, 1.4, -2.5], { push: 0.12, fov: 40 });
    chip('Dorongan gempa ∝ berat', 540, 240, at('sebanding') - 0.1, { size: 50, t1: at('Makin') });
    chip('Berat = dihantam keras', 540, 240, at('Makin') - 0.05, { size: 50, stamp: true, t1: at('Rumah', 5) });
    chip('Ringan = goyang, kembali', 540, 240, at('Rumah', 5) - 0.05, { size: 50, t1: at('Sambungan') });
    chip('Pasak melentur', 540, 240, at('Sambungan') - 0.05, { size: 54 });
  } else if (k === 4) {                            // Lapisan kedua: Lombok Utara 2018
    SEPIA = 0.55;
    set('siang', 'desa', 0, 1, { old: 1 });
    if (t < at('Di', 2)) shot(t, CUT[4], at('Di', 2), [0.0, 5.0, 6.5], [-0.5, 0.5, -6.0], { push: 0.08 });
    else if (t < at('Yang')) shot(t, at('Di', 2), at('Yang'), [4.4, 1.6, -1.6], [6.0, 0.4, -6.4], { push: 0.1 });
    else shot(t, at('Yang'), CUT[5], [-1.0, 2.4, 1.0], [-2.6, 1.3, -7.0], { push: 0.1 });
    chip('Lombok Utara · Agustus 2018', 540, 240, at('Agustus') - 0.1, { size: 46, stamp: true, t1: at('Di', 2) });
    chip('Rumah bata rusak berat', 540, 240, at('Di', 2), { size: 50, t1: at('Yang') });
    chip('Rumah adat: masih berdiri', 540, 240, at('Yang') - 0.05, { size: 50, stamp: true });
  } else if (k === 5) {                            // Perubahan: malam di rumah bambu
    set('malam', 'malam', 0, 1, { old: 1 });
    place(LAMPU, -1.0, 0.55, -1.9, 0, 1);
    if (t < at('Sekarang')) {
      pose(PAMAN, t, { x: -1.4, z: -1.6, ry: 0.5, expr: 'smile' }); pose(DONI, t, { x: -0.3, z: -1.5, ry: -0.6, expr: 'worried', arms: 'cross' });
      shot(t, CUT[5], at('Sekarang'), [0.6, 1.4, 1.8], [-1.0, 1.0, -2.2], { push: 0.08 });
    } else {
      pose(DONI, t, { x: 0.9, z: -0.4, ry: -0.3, expr: 'talk', talk: true, arms: 'chin' });
      set('siang', 'desa', 0, 0);
      closeUp(t, DONI, at('Sekarang'), CUT[6], { side: 0.4, dist: 1.9, up: 0.15 });
      card(['"Bahannya', 'seberat apa?"'], 540, 1560, at('bahannya') - 0.1);
    }
  } else {                                         // Akhiran loop: tanah mulai bergetar → frame 0
    const q = ease(seg(t, at('tanah') - 0.2, DURATION)) * 0.8;
    set('sore', 'sore', q, 0);
    if (t < DURATION - 1.6) shot(t, CUT[6], DURATION - 1.6, [2.0, 1.2, 1.6], [2.5, 0.8, -3.6], { push: 0.1 });
    else { hookDoni(t, { expr: 'worried', arms: 'down', shake: 0.3 }); closeUp(t, DONI, DURATION - 1.6, DURATION, Object.assign({ push: 0.04 }, HOOKCU)); }
  }
}
renderFrame(0);
