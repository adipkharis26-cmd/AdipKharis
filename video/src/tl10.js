KEYWORDS = new Set(['lantai','bercelah','celah','kayu','lembap','jamur','pelapuk','kolong','bernapas',
  'tropis','keramik','kampung','leluhur','panggung','sejuk']);

window.EXTRA_SFX = [
  { t: 0.0,                         type: 'boom',    gain: 0.5 },
  { t: at('bercelah') - 0.05,        type: 'stamp',   d: 0.5, gain: 1.0 },
  { t: at('Dimas') - 0.1,           type: 'langkah', d: 0.8, gain: 0.4 },
  { t: at('menyapu') - 0.1,         type: 'kayu',    d: 1.2, gain: 0.35 },
  { t: at('lembap') - 0.1,          type: 'angin',   d: 5.0, gain: 0.3 },
  { t: at('jamur', 1) - 0.05,       type: 'stamp',   d: 0.4, gain: 0.8 },
  { t: at('Malam') - 0.1,           type: 'angin',   d: 6.0, gain: 0.3 },
  { t: at('bernapas', 1) - 0.05,    type: 'stamp',   d: 0.4, gain: 0.9 },
];

const NENEK = makeChar({
  shirt: '#5B2A63', pattern: 'kawung', pat2: '#E8C46A',
  hair: 'white', hat: 'kerudung', hatCol: '#E8DCC0', fat: true,
});
const DIMAS = makeChar({
  shirt: '#C8552E', pattern: 'dots', pat2: '#F6E7C8', pants: '#24304A',
  hair: 'black', hat: 'cap', hatCol: '#2B4A8A', glasses: true,
});

// Lantai papan bercelah di atas kolong; tanah dan sinar matahari terlihat lewat celah.
const FY = 0.9;                       // tinggi permukaan balok lantai
const PL = 0.46, GAP = 0.08;          // lebar papan, lebar celah
const NPL = 13, X0 = -((NPL * PL + (NPL - 1) * GAP) / 2) + PL / 2;
const gapX = i => X0 + i * (PL + GAP) + PL / 2 + GAP / 2;
const AIR = [];

const RUMAH_KOLONG = build('rumah_kolong', () => {
  const G = grp(ground('tanah', 26));
  // lantai papan bercelah
  for (let i = 0; i < NPL; i++) {
    const p = box(PL, 0.08, 4.4, i % 2 ? '#9A6B3A' : '#8A5C30', { ol: 0.008 });
    at3(p, X0 + i * (PL + GAP), FY - 0.04, -0.4); G.add(p);
  }
  // sinar terang di tanah tepat di bawah celah
  for (let i = 0; i < NPL - 1; i++) {
    const s = box(GAP * 0.9, 0.01, 4.2, '#FFF0B8', { cast: false });
    at3(s, gapX(i), 0.012, -0.4); G.add(s);
  }
  // balok melintang + tiang
  [-2.0, 0.0, 1.4].forEach(z => G.add(at3(box(7.0, 0.14, 0.16, '#5A3C1E', { ol: 0.01 }), 0, FY - 0.15, z)));
  [-3.1, 0, 3.1].forEach(x => [-2.0, 1.4].forEach(z => {
    G.add(at3(stone(0.22, '#8E8A82'), x, 0.06, z));
    G.add(at3(cyl(0.08, 0.09, FY - 0.2, '#6E4A28', { ol: 0.01 }, 10), x, 0.1 + (FY - 0.2) / 2, z));
  }));
  // dinding papan + pintu + jendela di belakang
  G.add(at3(box(7.4, 2.4, 0.18, texMat('planks', '#B07A45', '#7A5430', [9, 1]), { ol: 0.012 }), 0, FY + 1.2, -2.7));
  G.add(at3(box(0.9, 1.7, 0.06, '#5A3C1E', { ol: 0.008 }), -2.3, FY + 0.85, -2.58));
  G.add(at3(box(0.8, 0.7, 0.06, '#3A2A1C', { ol: 0.008 }), 2.2, FY + 1.35, -2.58));
  G.add(at3(box(0.9, 0.06, 0.12, '#E8D2A6'), 2.2, FY + 0.97, -2.55));
  // tanaman & awan
  G.add(at3(palm(3.2, 0.2), 5.0, 0, -1.5));
  G.add(at3(bush(0.5, '#5A6E30'), -5.0, 0, -0.5));
  G.add(at3(cloud(1.1), -4, 7, -14)); G.add(at3(cloud(0.9), 3, 9, -16));
  // aliran udara kolong (garis tipis, dianimasikan)
  for (let i = 0; i < NPL - 1; i += 2) {
    const a = box(0.018, 0.22, 0.018, '#D6EEF8', { cast: false });
    G.add(a); AIR.push({ m: a, x: gapX(i), z: -1.6 + (i % 4) * 0.9, ph: i * 0.37 });
  }
  // kasur gelar (untuk adegan malam)
  const ks = grp(box(1.7, 0.12, 0.85, '#E8D2A6', { ol: 0.008 }), at3(box(0.5, 0.1, 0.35, '#C8552E'), -0.55, 0.1, 0));
  at3(ks, 1.0, FY + 0.06, 0.6); ks.name = 'kasur'; G.add(ks);
  return G;
});

function airOn(t, on) {
  AIR.forEach(a => {
    a.m.visible = on;
    if (on) { const k = ((t * 0.5 + a.ph) % 1); a.m.position.set(a.x, 0.15 + k * (FY + 0.7), a.z); }
  });
}
function kolongSet(moodStr, o = {}) {
  sky(o.sky || 'desa');
  mood(moodStr || 'siang');
  show(RUMAH_KOLONG);
  const ks = RUMAH_KOLONG.getObjectByName('kasur'); if (ks) ks.visible = !!o.kasur;
  NENEK.visible = true; DIMAS.visible = true;
}
const Y = FY + 0.02;
const posN = (t, o) => pose(NENEK, t, Object.assign({ x: -1.0, y: Y, z: 0.2, ry: 0.25 }, o));
const posD = (t, o) => pose(DIMAS, t, Object.assign({ x: 1.2, y: Y, z: 0.4, ry: -0.25 }, o));

function scene(t) {
  const k = beatOf(t);
  airOn(t, false);

  // Beat 0 — Hook
  if (k === 0) {
    kolongSet('siang');
    NENEK.visible = false; DIMAS.visible = false;
    if (t < CUT[0] + 3.8) shot(t, CUT[0], CUT[0] + 3.8, [0.5, 3.4, 7.8], [0, 0.6, -0.6], { push: 0.04 });
    else shot(t, CUT[0] + 3.8, CUT[1], [0.6, 0.45, 4.2], [0, 0.35, -0.8], { push: 0.05 });
    chip('Lantai bercelah — disengaja', 540, 230, CUT[0] + 1.0, { size: 50 });
    bigWord('Bercelah!', at('bercelah') - 0.05, at('bercelah') + 1.4);
  }
  // Beat 1 — Konflik
  else if (k === 1) {
    kolongSet('siang');
    if (t < CUT[1] + 2.4) {
      posN(t, { expr: 'flat', arms: 'stir' }); posD(t, { expr: 'flat', arms: 'down' });
      shot(t, CUT[1], CUT[1] + 2.4, [0, 2.8, 7.2], [0, 1.6, 0]);
    } else if (t < CUT[1] + 6.0) {
      posN(t, { expr: 'flat', arms: 'stir' }); posD(t, { expr: 'talk', arms: 'point', talk: true });
      closeUp(t, DIMAS, CUT[1] + 2.4, CUT[1] + 6.0, { side: 1, dist: 1.6, up: 0.1 });
    } else {
      posN(t, { expr: 'flat', arms: 'stir' }); posD(t, { expr: 'flat', arms: 'shrug' });
      closeUp(t, NENEK, CUT[1] + 6.0, CUT[2], { side: -1, dist: 1.6, up: 0.1 });
    }
    card(['"Nek, lantainya bolong-bolong."'], 540, 1560, at('lantainya') - 0.3);
    card(['"Ganti keramik saja."'], 540, 1560, at('Ganti') - 0.2);
  }
  // Beat 2 — Rahasia leluhur
  else if (k === 2) {
    kolongSet('siang');
    if (t < CUT[2] + 3.0) {
      posN(t, { expr: 'talk', arms: 'hold', talk: true }); posD(t, { expr: 'flat', arms: 'down' });
      shot(t, CUT[2], CUT[2] + 3.0, [-1.0, 2.6, 6.0], [-0.4, 1.4, 0]);
    } else if (t < CUT[2] + 6.2) {
      posN(t, { expr: 'talk', arms: 'point', talk: true }); posD(t, { expr: 'flat', arms: 'chin' });
      shot(t, CUT[2] + 3.0, CUT[2] + 6.2, [-0.3, 2.0, 5.2], [-0.3, 1.2, 0.2], { push: 0.03 });
    } else {
      posN(t, { expr: 'talk', arms: 'hips', talk: true }); posD(t, { expr: 'flat', arms: 'chin' });
      closeUp(t, NENEK, CUT[2] + 6.2, CUT[3], { side: -1, dist: 1.6, up: 0.1 });
    }
    chip('Papan dipasang selebar jari', 540, 240, at('selebar') - 0.1, { size: 48 });
    card(['"Rumah itu perlu bernapas."'], 540, 1560, at('Jangan') + 0.8);
  }
  // Beat 3 — Sains
  else if (k === 3) {
    kolongSet('siang');
    airOn(t, true);
    posN(t, { expr: 'flat', arms: 'stir' }); posD(t, { expr: 'flat', arms: 'chin' });
    if (t < CUT[3] + 4.5) shot(t, CUT[3], CUT[3] + 4.5, [0, 3.0, 7.0], [0, 0.9, 0]);
    else if (t < CUT[3] + 9.5) shot(t, CUT[3] + 4.5, CUT[3] + 9.5, [0.8, 0.45, 4.4], [0, 0.6, -0.6], { push: 0.05 });
    else closeUp(t, NENEK, CUT[3] + 9.5, CUT[4], { side: -1, dist: 1.6, up: 0.1 });
    chip('Tropis = lembap', 540, 250, at('lembap') - 0.1, { size: 50 });
    chip('Kayu basah → jamur pelapuk', 540, 370, at('jamur') - 0.1, { size: 44 });
    chip('Udara kolong naik lewat celah', 540, 250, at('kolong') + 0.2, { size: 42 });
  }
  // Beat 4 — Lapisan kedua
  else if (k === 4) {
    kolongSet('sore');
    airOn(t, true);
    posN(t, { expr: 'flat', arms: 'hold' }); posD(t, { expr: 'flat', arms: 'down' });
    if (t < CUT[4] + 5.5) shot(t, CUT[4], CUT[4] + 5.5, [0.4, 1.0, 4.6], [0, 0.55, -0.6], { push: 0.04 });
    else closeUp(t, DIMAS, CUT[4] + 5.5, CUT[5], { side: 1, dist: 1.6, up: 0.1 });
    chip('Kadar air kayu > 20–25%', 540, 1500, at('dua') - 0.1, { size: 46 });
    chip('Jamur pelapuk mulai tumbuh', 540, 1610, at('berani') - 0.1, { size: 44, stamp: true });
    chip('Kajian rumah panggung tradisional', 540, 1500, at('Kajian') - 0.1, { size: 40 });
  }
  // Beat 5 — Perubahan (malam)
  else if (k === 5) {
    kolongSet('sore', { sky: 'malam', kasur: true });
    airOn(t, true);
    posN(t, { x: -1.6, expr: 'smile', arms: 'down' });
    posD(t, { x: 0.6, z: 0.4, expr: 'flat', arms: 'chin' });
    if (t < CUT[5] + 3.2) shot(t, CUT[5], CUT[5] + 3.2, [0.8, 2.4, 6.2], [0.3, 1.1, 0.3]);
    else if (t < CUT[5] + 7.5) { posD(t, { x: 0.6, z: 0.4, expr: 'talk', arms: 'point', talk: true }); closeUp(t, DIMAS, CUT[5] + 3.2, CUT[5] + 7.5, { side: 1, dist: 1.6, up: 0.1 }); }
    else { posN(t, { x: -1.6, expr: 'smile', arms: 'hips' }); closeUp(t, NENEK, CUT[5] + 7.5, CUT[6], { side: -1, dist: 1.6, up: 0.1 }); }
    card(['"Nek, tidak usah ganti keramik."'], 540, 1560, at('keramik', 1) - 0.4);
    card(['"Rumah juga perlu bernapas."'], 540, 1560, at('juga', 1) - 0.3);
  }
  // Beat 6 — CTA
  else {
    kolongSet('sore');
    posN(t, { x: -1.3, ry: 0.15, expr: 'happy', arms: 'cheer' });
    posD(t, { x: 1.3, ry: -0.15, expr: 'happy', arms: 'wave' });
    shot(t, CUT[6], DURATION, [0, 3.0, 8.0], [0, 1.2, -1.0], { drift: 0.012 });
    card(['Di rumah kampungmu ada bagian', 'yang sengaja bercelah? Tulis di komentar!'], 540, 320, CUT[6] + 1.0);
  }
}

renderFrame(0);
