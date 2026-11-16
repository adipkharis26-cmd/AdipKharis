KEYWORDS = new Set(['gentong','dingin','pori','menguap','lembap','tanpa','listrik','tanah','kulkas','sejuk','kuno']);

window.EXTRA_SFX = [
  { t: 0.0,                         type: 'boom',    gain: 0.5 },
  { t: at('dingin') - 0.05,          type: 'stamp',   d: 0.5, gain: 1.0 },
  { t: at('Raka') - 0.1,            type: 'langkah', d: 0.8, gain: 0.4 },
  { t: at('Pegang') - 0.1,          type: 'kayu',    d: 0.8, gain: 0.3 },
  { t: at('pori') - 0.1,            type: 'angin',   d: 5.0, gain: 0.3 },
  { t: at('laboratorium') - 0.05,   type: 'stamp',   d: 0.4, gain: 0.8 },
  { t: at('sejuk') - 0.1,           type: 'angin',   d: 4.0, gain: 0.25 },
  { t: at('Makanya') - 0.05,        type: 'stamp',   d: 0.4, gain: 0.9 },
];

const BU_TINAH = makeChar({
  shirt: '#7B2F4F', pattern: 'parang', pat2: '#E8C46A', pants: '#3A2A1C',
  hair: 'black', hat: 'bun', fat: true,
});
const RAKA = makeChar({
  shirt: '#F2C230', pattern: 'stripe', pat2: '#E58A2B', pants: '#24304A',
  hair: 'black', hat: 'cap', hatCol: '#C8352E', kid: true,
});

const VAP = [];
const HALAMAN = build('halaman_gentong', () => {
  const G = grp(ground('tanah', 26));
  // dinding rumah + pintu + jendela
  G.add(at3(box(9, 2.6, 0.2, texMat('planks', '#B07A45', '#7A5430', [10, 1]), { ol: 0.012 }), 0, 1.3, -4.2));
  G.add(at3(box(1.0, 1.9, 0.06, '#5A3C1E', { ol: 0.008 }), -2.6, 0.95, -4.06));
  G.add(at3(box(0.9, 0.7, 0.06, '#3A2A1C', { ol: 0.008 }), 2.4, 1.6, -4.06));
  // atap teduh (kanopi) di atas gentong
  G.add(at3(box(5.5, 0.12, 2.4, '#6E3B23', { ol: 0.01 }), 0, 2.5, -2.9));
  [-2.5, 2.5].forEach(x => G.add(at3(cyl(0.07, 0.08, 2.5, '#6E4A28', { ol: 0.01 }, 10), x, 1.25, -1.8)));
  // dudukan kayu + gentong tanah liat
  G.add(at3(cyl(0.5, 0.55, 0.25, '#6E4A28', { ol: 0.01 }, 12), 0.05, 0.125, -1.0));
  const body = sph(0.6, '#B5653A', { ol: 0.012 }, 28, 20); body.scale.set(1, 1.08, 1); at3(body, 0.05, 0.95, -1.0); G.add(body);
  G.add(at3(cyl(0.34, 0.4, 0.14, '#9E5430', { ol: 0.01 }, 20), 0.05, 1.62, -1.0));
  G.add(at3(cyl(0.38, 0.38, 0.05, '#C98A55', { ol: 0.01 }, 20), 0.05, 1.72, -1.0));
  G.add(at3(sph(0.07, '#7E3F22', { ol: 0.008 }, 10, 8), 0.05, 1.8, -1.0));
  // bintik lembap di dinding gentong
  for (let i = 0; i < 26; i++) {
    const a = rnd(i * 3) * Math.PI * 2, h = 0.35 + rnd(i * 7) * 1.1;
    const r = Math.sqrt(Math.max(0, 0.6 * 0.6 - Math.pow((h - 0.95) / 1.08, 2))) + 0.005;
    G.add(at3(sph(0.028, '#7FB5D8', {}, 8, 6), 0.05 + Math.cos(a) * r, h, -1.0 + Math.sin(a) * r));
  }
  // uap penguapan (garis tipis naik)
  for (let i = 0; i < 9; i++) {
    const a = rnd(i * 11) * Math.PI * 2;
    const v = sph(0.035, '#EAF6FC', { cast: false }, 8, 6);
    G.add(v); VAP.push({ m: v, x: 0.05 + Math.cos(a) * 0.72, z: -1.0 + Math.sin(a) * 0.72, ph: i * 0.29 });
  }
  // gayung + tanaman
  G.add(at3(cyl(0.12, 0.09, 0.1, '#8A5C30', { ol: 0.008 }, 12), 0.8, 0.05, -0.4));
  G.add(at3(bush(0.55, '#4E7334'), -4.2, 0, -2.4));
  G.add(at3(palm(3.2, 0.2), 4.6, 0, -2.0));
  G.add(at3(cloud(1.1), -4, 7, -14)); G.add(at3(cloud(0.9), 3, 9, -16));
  return G;
});
function vapOn(t, on) {
  VAP.forEach(a => { a.m.visible = on; if (on) { const k = (t * 0.45 + a.ph) % 1; a.m.position.set(a.x + Math.sin(t * 2 + a.ph * 9) * 0.06, 0.5 + k * 1.3, a.z); a.m.scale.setScalar(1 - k * 0.6); } });
}
function halamanSet(m) { sky('desa'); mood(m || 'siang'); show(HALAMAN); BU_TINAH.visible = true; RAKA.visible = true; }
const posT = (t, o) => pose(BU_TINAH, t, Object.assign({ x: -1.4, z: 0.4, ry: 0.35 }, o));
const posR = (t, o) => pose(RAKA, t, Object.assign({ x: 1.4, z: 0.5, ry: -0.35 }, o));

function scene(t) {
  const k = beatOf(t);
  vapOn(t, false);

  if (k === 0) {                                   // Hook
    halamanSet('siang'); BU_TINAH.visible = false; RAKA.visible = false;
    if (t < CUT[0] + 3.8) shot(t, CUT[0], CUT[0] + 3.8, [1.2, 2.4, 6.0], [0.05, 1.0, -1.0], { push: 0.05 });
    else { vapOn(t, true); shot(t, CUT[0] + 3.8, CUT[1], [0.9, 1.1, 1.9], [0.05, 0.95, -1.0], { push: 0.04 }); }
    chip('Tanpa kulkas — tanpa es', 540, 230, CUT[0] + 1.0, { size: 50 });
    bigWord('Dingin!', at('dingin') - 0.05, at('dingin') + 1.4);
  } else if (k === 1) {                            // Konflik
    halamanSet('siang');
    if (t < CUT[1] + 2.4) { posT(t, { expr: 'flat', arms: 'hips' }); posR(t, { expr: 'flat', arms: 'down' }); shot(t, CUT[1], CUT[1] + 2.4, [0, 2.4, 6.8], [0, 1.1, -0.5]); }
    else if (t < CUT[1] + 6.2) { posT(t, { expr: 'flat', arms: 'hips' }); posR(t, { expr: 'talk', arms: 'point', talk: true }); closeUp(t, RAKA, CUT[1] + 2.4, CUT[1] + 6.2, { side: 1, dist: 1.6, up: 0.1 }); }
    else { posT(t, { expr: 'smile', arms: 'point' }); posR(t, { expr: 'flat', arms: 'down' }); closeUp(t, BU_TINAH, CUT[1] + 6.2, CUT[2], { side: -1, dist: 1.6, up: 0.1 }); }
    card(['"Ganti dispenser saja."'], 540, 1560, at('dispenser') - 0.4);
    card(['"Pegang dulu dindingnya, Nak."'], 540, 1560, at('Pegang') - 0.3);
  } else if (k === 2) {                            // Rahasia leluhur
    halamanSet('siang');
    if (t < CUT[2] + 3.4) { posT(t, { expr: 'talk', arms: 'point', talk: true }); posR(t, { expr: 'flat', arms: 'chin' }); shot(t, CUT[2], CUT[2] + 3.4, [-0.6, 2.0, 5.2], [-0.2, 1.1, -0.5]); }
    else if (t < CUT[2] + 7.6) { posT(t, { expr: 'talk', arms: 'hold', talk: true }); posR(t, { expr: 'flat', arms: 'chin' }); closeUp(t, BU_TINAH, CUT[2] + 3.4, CUT[2] + 7.6, { side: -1, dist: 1.6, up: 0.1 }); }
    else { posT(t, { expr: 'flat', arms: 'hips' }); posR(t, { expr: 'flat', arms: 'chin' }); shot(t, CUT[2] + 7.6, CUT[3], [0.6, 1.6, 3.6], [0.05, 1.0, -0.8], { push: 0.03 }); }
    chip('Jangan dicat — jangan dibungkus', 540, 240, at('dicat') - 0.2, { size: 44 });
    chip('Tempat teduh dan berangin', 540, 360, at('teduh') - 0.1, { size: 46 });
  } else if (k === 3) {                            // Sains
    halamanSet('siang'); vapOn(t, true);
    posT(t, { expr: 'flat', arms: 'stir' }); posR(t, { expr: 'flat', arms: 'chin' });
    if (t < CUT[3] + 4.6) shot(t, CUT[3], CUT[3] + 4.6, [0.9, 1.4, 2.6], [0.05, 0.95, -1.0], { push: 0.05 });
    else if (t < CUT[3] + 9.2) shot(t, CUT[3] + 4.6, CUT[3] + 9.2, [0.5, 1.1, 1.7], [0.05, 0.9, -1.0], { push: 0.05 });
    else closeUp(t, BU_TINAH, CUT[3] + 9.2, CUT[4], { side: -1, dist: 1.6, up: 0.1 });
    chip('Pori halus di dinding tanah liat', 540, 250, at('pori') - 0.1, { size: 42 });
    chip('Air merembes → menguap', 540, 370, at('menguap') - 0.1, { size: 46 });
    chip('Panas terserap → isi dingin', 540, 250, at('menarik') - 0.1, { size: 44, stamp: true });
  } else if (k === 4) {                            // Lapisan kedua
    halamanSet('sore'); vapOn(t, true);
    posT(t, { expr: 'flat', arms: 'hold' }); posR(t, { expr: 'flat', arms: 'down' });
    if (t < CUT[4] + 5.6) shot(t, CUT[4], CUT[4] + 5.6, [1.0, 1.3, 3.2], [0.05, 0.95, -1.0], { push: 0.04 });
    else closeUp(t, RAKA, CUT[4] + 5.6, CUT[5], { side: 1, dist: 1.6, up: 0.1 });
    chip('Uji lab: 21°C → 15°C (4 jam)', 540, 250, at('laboratorium') - 0.1, { size: 44, stamp: true });
    chip('Udara lembap → kurang dingin', 540, 370, at('lembap', 1) - 0.1, { size: 42 });
  } else if (k === 5) {                            // Perubahan
    halamanSet('sore');
    if (t < CUT[5] + 3.0) { posT(t, { expr: 'smile', arms: 'down' }); posR(t, { x: 0.9, z: 0.0, ry: -0.5, expr: 'flat', arms: 'reach' }); shot(t, CUT[5], CUT[5] + 3.0, [1.2, 1.7, 3.8], [0.4, 1.0, -0.6]); }
    else if (t < CUT[5] + 7.6) { posT(t, { expr: 'smile', arms: 'down' }); posR(t, { x: 0.9, z: 0.0, ry: -0.5, expr: 'talk', arms: 'cheer', talk: true }); closeUp(t, RAKA, CUT[5] + 3.0, CUT[5] + 7.6, { side: 1, dist: 1.6, up: 0.1 }); }
    else { posT(t, { expr: 'laugh', arms: 'hips' }); posR(t, { expr: 'happy', arms: 'down' }); closeUp(t, BU_TINAH, CUT[5] + 7.6, CUT[6], { side: -1, dist: 1.6, up: 0.1 }); }
    card(['"Bu, kok bisa dingin', 'tanpa listrik?"'], 540, 1560, at('kok') - 0.3);
    card(['"Makanya jangan dibuang gentongnya."'], 540, 1560, at('Makanya') - 0.3);
  } else {                                         // CTA
    halamanSet('sore');
    posT(t, { x: -1.4, ry: 0.15, expr: 'happy', arms: 'cheer' }); posR(t, { x: 1.4, ry: -0.15, expr: 'happy', arms: 'wave' });
    shot(t, CUT[6], DURATION, [0, 2.8, 8.2], [0, 1.2, -1.0], { drift: 0.012 });
    card(['Ada alat tradisional pendingin', 'tanpa listrik? Tulis di komentar!'], 540, 320, CUT[6] + 1.0);
  }
}
renderFrame(0);
