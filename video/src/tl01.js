// Ternyata Leluhur TL01 — "Kenapa Candi Sebesar Ini Tidak Pakai Semen?"
// Tokoh fiksi: Mbah Parto (pemandu tua) dan Mas Dion (mahasiswa teknik).
KEYWORDS = new Set(['dilem', 'tonjolan', 'lubang', 'mengunci', 'roboh', 'borobudur', 'andesit', 'berat', 'kering', 'ekor', 'burung', 'lidah', 'alur', 'puzzle', 'kristal', 'menempel', 'sambungan']);
window.EXTRA_SFX = [
  { t: 0, type: 'angin', d: 14.5, gain: 0.35 },
  { t: at('Mas'), type: 'langkah', d: 1.6 },
  { t: at('mengunci') - 0.05, type: 'kayu', gain: 1.2 },
  { t: at('gempa', 1) - 0.1, type: 'gempa', d: 4.6, gain: 1.2 },
  { t: at('orang-orang') - 0.1, type: 'ramai', d: 2.0, gain: 1.4 },
  { t: at('bergeser') + 0.1, type: 'kayu', gain: 0.8 },
  { t: at('burung') + 0.1, type: 'kayu', gain: 1.1 },
  { t: at('alur') + 0.1, type: 'kayu', gain: 1.1 },
  { t: at('Sore'), type: 'angin', d: 12.5, gain: 0.35 },
];

// ── tokoh ─────────────────────────────────────────────────────
const PARTO = makeChar({ shirt: '#5A7D4E', pattern: 'stripe', pat2: '#E8DCC4', pants: '#5A4632', hair: 'grey', beard: true });
const PARTO_MUDA = makeChar({ shirt: '#5A7D4E', pattern: 'stripe', pat2: '#E8DCC4', pants: '#5A4632', hair: 'black' });
const GURU = makeChar({ shirt: '#E8DCC4', pants: '#3A2A20', hair: 'white', beard: true, mustache: true });
const DION = makeChar({ shirt: '#F4C63B', pattern: 'dots', pat2: '#FFFFFF', pants: '#2E4A7A', hat: 'cap', hatCol: '#D5301F', glasses: true });
const PENELITI = makeChar({ shirt: '#F4F4F2', pants: '#4A4A55', hair: 'black', glasses: true });
const WARGA = [
  makeChar({ shirt: '#D5301F', pants: '#3A3F5C', hair: 'black' }),
  makeChar({ shirt: '#2F9B48', pants: '#5A4632', hat: 'kerudung', hatCol: '#7A3FA0' }),
  makeChar({ kid: true, shirt: '#25AFC6', pants: '#3A3F5C', hair: 'black' }),
  makeChar({ shirt: '#EE7A1F', pants: '#2E2A28', hair: 'grey', mustache: true }),
];

// ── batu candi ────────────────────────────────────────────────
const STONE = '#8E8A82';
const blockTex = (key, rep) => {
  const tx = canvasTex('blk' + key, 256, 256, (x, w, h) => {
    x.fillStyle = '#6F6B64'; x.fillRect(0, 0, w, h);
    for (let r = 0; r < 4; r++) for (let c = -1; c < 5; c++) {
      const bx = c * 64 + (r % 2 ? 32 : 0), by = r * 64;
      const v = 120 + Math.floor(rnd(r * 9 + c + 3) * 30);
      x.fillStyle = `rgb(${v + 22},${v + 18},${v + 10})`; x.fillRect(bx + 2, by + 2, 60, 60);
      x.fillStyle = 'rgba(255,255,255,.10)'; x.fillRect(bx + 2, by + 2, 60, 6);
      x.fillStyle = 'rgba(0,0,0,.12)'; for (let k = 0; k < 6; k++) x.fillRect(bx + 6 + rnd(r * 31 + c * 7 + k) * 50, by + 10 + rnd(r * 17 + c + k * 5) * 44, 3, 3);
    }
  });
  const t2 = tx.clone(); t2.needsUpdate = true; t2.wrapS = t2.wrapT = THREE.RepeatWrapping; t2.repeat.set(rep[0], rep[1]);
  return mat('#ffffff', { map: t2 });
};
function stupa(r, solid) {
  const pts = [[0, 0], [0.95, 0], [1.0, 0.12], [0.96, 0.45], [0.8, 0.85], [0.5, 1.12], [0.18, 1.24], [0, 1.26]].map(([a, b]) => new THREE.Vector2(a * r, b * r));
  const S = grp(mesh(new THREE.LatheGeometry(pts, 28), solid ? STONE : '#9A968E', { ol: 0.02 }));
  S.add(at3(box(r * 0.45, r * 0.3, r * 0.45, STONE, { ol: 0.015 }), 0, r * 1.38, 0));
  S.add(at3(cone(r * 0.16, r * 0.9, STONE, { ol: 0.012 }, 12), 0, r * 1.95, 0));
  if (!solid) for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; S.add(at3(box(r * 0.16, r * 0.12, 0.02, '#3E3B36', { cast: false }), Math.sin(a) * r * 0.86, r * 0.55, Math.cos(a) * r * 0.86, 0, a, 0)); }
  return S;
}
// candi: front face of the base terrace at z=0, centred on x=0
const CANDI = build('candi', () => {
  const G = grp(ground('rumput', 90), at3(path(2.2, 30), 0, 0, 15));
  const sizes = [16, 13.6, 11.4, 9.4, 7.6], th = 1.1;
  sizes.forEach((s, i) => {
    const T = box(s, th, s, blockTex('t' + i, [s / 1.8, th / 1.12]), {});
    at3(T, 0, th / 2 + i * th, -8); G.add(T);
    // parapet rim + small niches
    G.add(at3(box(s + 0.08, 0.12, s + 0.08, '#7E7A72'), 0, th * (i + 1) + 0.02, -8));
    if (i < 4) for (let k = -3; k <= 3; k++) if (k) G.add(at3(stupa(0.16, true), k * s / 8, th * (i + 1) + 0.08, -8 + s / 2 - 0.15));
  });
  // stairs on the front of every terrace
  sizes.forEach((s, i) => { for (let k = 0; k < 5; k++) G.add(at3(box(1.6, th / 5, 0.32 * (5 - k), '#86827A', {}), 0, i * th + th / 10 + k * th / 5, -8 + s / 2 + 0.16 * (5 - k))); });
  // round terraces with lattice stupas and the main stupa
  const top = th * sizes.length;
  [[3.4, 16, 0.42], [2.6, 12, 0.4], [1.8, 8, 0.38]].forEach(([r, n, sr], i) => {
    G.add(at3(cyl(r + 0.5, r + 0.6, 0.45, '#857F76', {}, 40), 0, top + 0.22 + i * 0.45, -8));
    for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2; G.add(at3(stupa(sr), Math.sin(a) * r, top + 0.45 + i * 0.45, -8 + Math.cos(a) * r)); }
  });
  G.add(at3(stupa(1.25, true), 0, top + 1.35, -8));
  // surroundings
  [[-11, 2], [11, 3], [-14, -6], [14, -8], [-9, 9], [10, 10]].forEach(([x, z], i) => G.add(at3(i % 3 ? tree(3.2) : palm(4.2, 0.25), x, 0, z)));
  [[-5.2, 3.2], [6.0, 3.0], [-7, 6], [7.2, 6.4]].forEach(([x, z]) => G.add(at3(bush(0.4), x, 0, z)));
  G.add(at3(hill(14, 6, '#4E9E4A'), -22, -1, -40)); G.add(at3(hill(16, 8, '#56A84E'), 18, -1.5, -44)); G.add(at3(hill(10, 9, '#6A8F5A'), -2, -2, -50));
  [[-8, 12, -30], [9, 13.5, -34], [0, 15, -38]].forEach(([x, y, z], i) => { const c = cloud(2 + i * 0.4); c.userData.update = t => { c.position.x = x + t * 0.05; }; G.add(at3(c, x, y, z)); });
  return G;
});
// interlocking demo: knob (tonjolan) block + notched (lubang) block
const DEMO = build('demo', () => {
  const G = grp(ground('tanah', 30));
  G.add(at3(rbox(1.3, 0.55, 0.8, STONE, { ol: 0.015 }), 0, 0.275, 0));
  const knob = rbox(0.34, 0.16, 0.34, '#A29C92', { ol: 0.012 }); at3(knob, 0, 0.62, 0); G.add(knob);
  const top = grp(at3(rbox(1.3, 0.55, 0.8, '#9A958C', { ol: 0.015 }), 0, 0.275, 0), at3(box(0.36, 0.18, 0.04, '#2B2824', { cast: false }), 0, 0.09, 0.41));
  G.add(top); G.userData.top = top;
  return G;
});
// dovetail (ekor burung) + tongue & groove (lidah dan alur), laid flat, seen from above
function slab(points, depth, col) {
  const sh = new THREE.Shape(); points.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }); geo.rotateX(-Math.PI / 2);
  return mesh(geo, col, { ol: 0.012 });
}
const JOINS = build('joins', () => {
  const G = grp(ground('tanah', 30));
  const dvA = slab([[-0.7, -0.3], [0, -0.3], [0, -0.1], [0.28, -0.2], [0.28, 0.2], [0, 0.1], [0, 0.3], [-0.7, 0.3]], 0.35, STONE);
  const dvB = slab([[0, 0.3], [0.8, 0.3], [0.8, -0.3], [0, -0.3], [0, -0.1], [0.28, -0.2], [0.28, 0.2], [0, 0.1]], 0.35, '#A29C92');
  const tgA = slab([[-0.7, -0.3], [0, -0.3], [0, -0.09], [0.2, -0.09], [0.2, 0.09], [0, 0.09], [0, 0.3], [-0.7, 0.3]], 0.35, STONE);
  const tgB = slab([[0, 0.3], [0.8, 0.3], [0.8, -0.3], [0, -0.3], [0, -0.09], [0.2, -0.09], [0.2, 0.09], [0, 0.09]], 0.35, '#A29C92');
  const D = grp(dvA, dvB), T = grp(tgA, tgB);
  at3(D, -0.05, 0, -0.75); at3(T, -0.05, 0, 0.75); G.add(D, T);
  G.userData = { dvB, tgB };
  return G;
});
// crumbling-free kampung for the quake
const KAMPUNG = build('kampung', () => {
  const G = grp(ground('rumput', 60), at3(path(1.8, 30), 0, 0, 0));
  G.add(at3(rumahBeton({ w: 2.6, d: 2.2, col: '#E6DCC8' }), -2.8, 0, -3.2, 0, 0.3, 0));
  G.add(at3(rumahPanggung({ w: 2.8, d: 2.2, stilt: 0.8, weave: true }), 3.2, 0, -3.6, 0, -0.35, 0));
  G.add(at3(rumahBeton({ w: 2.2, d: 2.0, col: '#CFE0E8' }), -6.5, 0, -6, 0, 0.5, 0));
  [[-5, 1], [5.5, 0.5], [-1.5, -7], [7.5, -6]].forEach(([x, z], i) => G.add(at3(i % 2 ? tree(2.6) : palm(3.6, 0.3), x, 0, z)));
  G.add(at3(hill(12, 5, '#4E9E4A'), -10, -1, -30));
  // the temple far away on the horizon
  const far = grp(...[6, 5, 4, 3].map((s, i) => at3(box(s, 0.7, s, '#8E8A82'), 0, 0.35 + i * 0.7, 0)), at3(stupa(0.8, true), 0, 2.8, 0));
  G.add(at3(far, 9, 0, -26));
  return G;
});
const LAB = build('lab', () => {
  const G = grp(ground('lab', 30));
  G.add(at3(box(8, 3.2, 0.2, '#EEF3F4', {}), 0, 1.6, -2.2));
  G.add(at3(board('ugm', ['LAB', 'BATU'], { w: 1.0, h: 0.6, legs: false, hi: [0] }), -2.2, 1.9, -2.08));
  [0, 1, 2].forEach(i => G.add(at3(box(1.6, 0.05, 0.35, '#B8C4C8'), 1.9, 1.0 + i * 0.5, -1.95)));
  [[1.4, 1.1], [1.9, 1.1], [2.4, 1.6], [1.6, 1.6], [2.2, 2.1]].forEach(([x, y], i) => G.add(at3(cyl(0.07, 0.07, 0.2, ['#25AFC6', '#FFD84A', '#EF8F80'][i % 3], {}), x, y, -1.95)));
  G.add(at3(PROP.meja(1.6, 0.8, 0.75), 0, 0, 0));
  const B = rbox(0.6, 0.38, 0.45, STONE, { ol: 0.012 }); at3(B, 0.15, 0.97, 0); G.add(B);
  const cr = new THREE.Group(); cr.position.set(0.15, 0.97, 0);
  for (let k = 0; k < 14; k++) {
    const c = mesh(new THREE.OctahedronGeometry(0.05 + rnd(k) * 0.04), mat('#9FE8F2', { emissive: 0x4fd0e0, ei: 0.5, rough: 0.2 }), { cast: false });
    const f = rnd(k + 7); c.position.set((rnd(k + 1) - 0.5) * 0.56, 0.19 + 0.01, (rnd(k + 3) - 0.5) * 0.4);
    if (f > 0.6) c.position.set(0.3, (rnd(k + 5) - 0.5) * 0.3, (rnd(k + 9) - 0.5) * 0.4);
    c.userData.k = rnd(k + 11); cr.add(c);
  }
  G.add(cr); G.userData.cr = cr;
  G.add(at3(PROP.lampu(), -0.6, 2.6, -0.4));
  return G;
});

// ── helpers ───────────────────────────────────────────────────
const BASE_Z = 0;              // front face of the candi base
const farFog = () => { SCN.fog.near = 40; SCN.fog.far = 110; };
function candiSet(m) { show(CANDI); sky(m === 'sore' ? 'sore' : 'desa'); if (m) mood(m); farFog(); }

function scene(t) {
  const k = beatOf(t);
  // ───────── Beat 1: pembuka ─────────
  if (k === 0) {
    candiSet();
    if (t < at('berdiri') - 0.2) {                      // establishing: the giant temple, Parto tiny on the stairs
      pose(PARTO, t, { x: 0.15, y: 0, z: 2.0, ry: Math.PI, expr: 'smile' });
      shot(t, 0, at('berdiri'), [5, 1.4, 17], [0, 3.8, -6], { eye2: [3.2, 1.6, 13.5] });
    } else if (t < at('Dia') - 0.15) {                  // Parto at the foot of the stairs
      pose(PARTO, t, { x: 1.4, z: 1.2, ry: -0.35, expr: 'smile' });
      shot(t, at('berdiri') - 0.2, at('Dia'), [3.0, 1.0, 4.6], [1.2, 0.85, 0.9]);
    } else if (t < at('Dia', 1) - 0.15) {               // he does NOT look at the top: tilt up the huge temple
      pose(PARTO, t, { x: 1.4, z: 1.2, ry: Math.PI - 0.3, expr: 'closed' });
      shot(t, at('Dia') - 0.15, at('Dia', 1), [2.4, 0.5, 4.2], [0.5, 4.5, -5], { target2: [0.2, 7.5, -8], push: 0.05 });
    } else if (t < at('sambil') - 0.15) {               // his hand on the joints
      pose(PARTO, t, { x: 2.3, z: 0.4, ry: Math.PI / 2 + 0.55, arms: [[-1.2, 0.2], [-1.25 + Math.sin(t * 2) * 0.12, 0.25]], expr: 'smile', look: 0.35 });
      shot(t, at('Dia', 1) - 0.15, at('sambil'), [4.7, 0.95, 0.95], [2.1, 0.66, 0.15], { push: 0.2, drift: 0 });
      chip('Sambungan batu', 540, 300, at('sambungan'), { size: 74 });
    } else {                                            // smiling like greeting an old friend
      pose(PARTO, t, { x: 2.3, z: 0.42, ry: 0.75, expr: t > at('tersenyum') ? 'happy' : 'smile', look: -0.2 });
      shot(t, at('sambil') - 0.15, CUT[1], [3.5, 1.05, 2.3], [2.3, 0.82, 0.4], { push: 0.15 });
    }
  }
  // ───────── Beat 2: rahasia ─────────
  else if (k === 1) {
    if (t < at('Batu', 1) - 0.2) {                      // flashback: the teacher's message
      candiSet('sore'); SEPIA = 0.85;
      pose(GURU, t, { x: 0.2, z: 1.5, ry: -0.5, expr: t > at('pesan') - 0.3 ? 'talk' : 'smile', talk: t > at('pesan') - 0.3, arms: t > at('pesan') - 0.3 ? 'point' : 'down', nod: t < at('Mbah', 1) });
      pose(PARTO_MUDA, t, { x: 1.15, z: 1.75, ry: -1.3, expr: 'smile', look: -0.2 });
      shot(t, CUT[1], at('Batu', 1), [0.9, 0.95, 4.5], [0.6, 0.7, 1.4]);
      chip('Pesan guru', 540, 260, at('pesan'), { size: 70, bg: '#FFF7E6' });
    } else if (t < at('Setiap') - 0.15) {               // "batu candi tidak dilem"
      candiSet('sore'); SEPIA = 0.85;
      pose(GURU, t, { x: 1.9, z: 0.42, ry: Math.PI / 2 + 0.55, arms: [[0, 0.12], [-1.3, 0.2]], expr: 'talk', talk: true, look: -0.3 });
      shot(t, at('Batu', 1) - 0.2, at('Setiap'), [4.6, 0.95, 0.95], [2.0, 0.66, 0.15], { push: 0.15 });
      chip('Tidak dilem!', 540, 300, at('dilem'), { size: 96, stamp: true, bg: '#FFFFFF', fg: '#C7301F' });
    } else {                                            // knob + notch lock together
      show(DEMO); sky('desa');
      const T = DEMO.userData.top, k2 = easeOut(seg(t, at('saling') - 0.25, at('mengunci') + 0.05));
      T.position.set(0, 0.55 + lerp(0.75, 0, k2), 0);
      T.rotation.z = (1 - k2) * 0.04 * Math.sin(t * 3);
      shot(t, at('Setiap') - 0.15, CUT[2], [1.2, 1.8, 4.2], [0, 0.9, 0], { push: 0.1 });
      chip('Tonjolan', 330, 230, at('tonjolan'), { size: 64 });
      chip('Lubang', 760, 230, at('lubang'), { size: 64, bg: '#FFF7E6' });
      if (t > at('mengunci')) chip('Saling mengunci', 540, 400, at('mengunci'), { size: 78, stamp: true, bg: '#2F9B48', fg: '#FFFFFF' });
    }
  }
  // ───────── Beat 3: ejekan ─────────
  else if (k === 2) {
    candiSet();
    if (t < at('mbah', 2) - 0.2) {                       // Dion walks in, laughs
      const wk = seg(t, CUT[2], CUT[2] + 1.6);
      pose(DION, t, { x: lerp(4.4, 3.0, ease(wk)), z: 2.0, ry: -1.3, walk: wk < 1, expr: t > at('tertawa') - 0.1 ? 'laugh' : 'smile', arms: t > at('tertawa') ? 'hips' : 'down' });
      pose(PARTO, t, { x: 1.9, z: 1.3, ry: 0.9, expr: 'smile' });
      shot(t, CUT[2], at('mbah', 2), [2.8, 1.05, 5.6], [2.5, 0.75, 1.5], { drift: 0.1 });
    } else {                                            // the taunt
      pose(DION, t, { x: 3.0, z: 2.0, ry: -1.0, expr: t < at('Kena') ? 'talk' : 'laugh', talk: true, arms: t > at('ditumpuk') && t < at('Kena') ? 'shrug' : t >= at('Kena') ? 'hips' : 'point' });
      pose(PARTO, t, { x: 1.9, z: 1.3, ry: 0.9, expr: 'flat' });
      shot(t, at('mbah', 2) - 0.2, CUT[3], [3.6, 1.0, 4.1], [2.6, 0.8, 1.6], { push: 0.15, drift: -0.1 });
      card(['“Kena gempa sedikit,', 'bubar jalan!”'], 540, 330, at('Kena'), { size: 62, titleCol: '#17120F' });
    }
  }
  // ───────── Beat 4: kejadian ─────────
  else if (k === 3) {
    if (t < at('orang-orang') - 0.15) {                 // 2006: the ground shakes
      show(KAMPUNG); sky('desa'); farFog(); SHAKE = 0.08 * (1 - seg(t, at('Yogyakarta') + 1.0, at('orang-orang')) * 0.5);
      WARGA.forEach((W, i) => pose(W, t, { x: -1.6 + i * 1.0, z: 1.5 + (i % 2) * 0.5, ry: 0.2 - i * 0.15, expr: 'shock', shake: 1, arms: i % 2 ? 'up' : 'shrug' }));
      shot(t, CUT[3], at('orang-orang'), [0.6, 1.2, 6.2], [0, 0.8, 0.5]);
      chip('Yogyakarta, 2006', 540, 260, at('tahun'), { size: 78 });
      if (t > at('gempa', 1)) bigWord('GEMPA!', at('gempa', 1), at('mengguncang') + 0.4, { y: 520, shake: true, col: '#FFDD33' });
    } else if (t < at('Mas', 1) - 0.15) {               // people running
      show(KAMPUNG); sky('desa'); farFog(); SHAKE = 0.05;
      WARGA.forEach((W, i) => pose(W, t, { x: -2.5 + i * 1.3 + (t - at('orang-orang')) * 2.2, z: 1.2 + (i % 2) * 0.7, ry: Math.PI / 2, run: true, expr: 'shock', arms: 'up' }));
      shot(t, at('orang-orang') - 0.15, at('Mas', 1), [-0.5, 0.9, 5.0], [0.6, 0.6, 1.2]);
    } else if (t < at('Tapi') - 0.15) {                 // Dion, sure that it all collapsed
      show(KAMPUNG); sky('desa'); farFog(); SHAKE = 0.02;
      pose(DION, t, { x: 0, z: 2.6, ry: 0.35, expr: t > at('roboh') - 0.3 ? 'shock' : 'worried', arms: t > at('yakin') ? 'chin' : 'down', look: -0.1 });
      shot(t, at('Mas', 1) - 0.15, at('Tapi'), [0.9, 1.0, 4.6], [0.1, 0.75, 2.6], { push: 0.15 });
      chip('Sudah roboh?', 540, 300, at('roboh'), { size: 84, stamp: true, bg: '#FFFFFF', fg: '#C7301F' });
    } else {                                            // ...but Borobudur still stands
      candiSet();
      pose(DION, t, { x: 1.2, z: 6.0, ry: Math.PI, expr: 'shock' });
      shot(t, at('Tapi') - 0.15, CUT[4], [4.5, 1.2, 15], [0, 4.0, -6], { eye2: [3.0, 1.5, 12.5] });
      chip('Borobudur', 540, 230, at('Borobudur'), { size: 70, bg: '#FFF7E6' });
      if (t > at('berdiri', 1)) chip('Tetap berdiri', 540, 380, at('berdiri', 1), { size: 92, stamp: true, bg: '#2F9B48', fg: '#FFFFFF' });
    }
  }
  // ───────── Beat 5: penjelasan ─────────
  else if (k === 4) {
    show(DEMO); sky('desa');
    const T = DEMO.userData.top; T.position.set(0, 0.55, 0); T.rotation.z = 0;
    if (t < at('sementara') - 0.15) {                   // heavy andesite pushes down
      T.position.y = 0.55 - Math.max(0, Math.sin(seg(t, at('menekan'), at('menekan') + 0.5) * Math.PI)) * 0.03;
      shot(t, CUT[4], at('sementara'), [1.4, 1.5, 4.0], [0, 0.65, 0], { push: 0.12 });
      chip('Batu andesit', 540, 230, at('andesit'), { size: 74 });
      if (t > at('berat') - 0.05) chip('Berat', 540, 380, at('berat'), { size: 84, stamp: true, bg: '#FFF7E6' });
      arrow(540, 640, Math.PI / 2, at('menekan'), at('sementara') - 0.15);
    } else if (t < at('Para') - 0.15) {                 // the lock stops sideways sliding
      SHAKE = 0.015; T.position.x = Math.sin(t * 18) * 0.012;
      shot(t, at('sementara') - 0.15, at('Para'), [-1.4, 1.3, 3.8], [0, 0.6, 0], { push: 0.15 });
      chip('Kunci', 540, 230, at('kunci'), { size: 74, bg: '#2F9B48', fg: '#FFFFFF' });
      if (t > at('bergeser')) chip('Tidak bergeser', 540, 380, at('bergeser'), { size: 80, stamp: true, bg: '#FFFFFF', fg: '#C7301F' });
      arrow(250, 760, 0, at('samping') - 0.3, at('Para') - 0.15, '#FFFFFF');
      arrow(830, 760, Math.PI, at('samping') - 0.3, at('Para') - 0.15, '#FFFFFF');
    } else {                                            // dry masonry
      candiSet();
      pose(PARTO, t, { x: 2.0, z: 0.9, ry: 0.4, expr: 'smile', nod: true });
      shot(t, at('Para') - 0.15, CUT[5], [4.6, 1.3, 4.6], [1.6, 0.8, 0], { push: 0.12, drift: -0.2 });
      card(['SUSUNAN KERING', 'stabil karena beratnya', 'sendiri dan kuncinya'], 540, 360, at('susunan', 1), { size: 66 });
    }
  }
  // ───────── Beat 6: lapisan kedua ─────────
  else if (k === 5) {
    if (t < at('mirip') - 0.15) {                       // dovetail + tongue & groove
      show(JOINS); sky('desa');
      const J = JOINS.userData;
      J.dvB.position.y = lerp(0.8, 0, easeOut(seg(t, at('burung') - 0.3, at('burung') + 0.15)));
      J.tgB.position.x = lerp(0.7, 0, easeOut(seg(t, at('alur') - 0.4, at('alur') + 0.1)));
      shot(t, CUT[5], at('mirip'), [0.1, 3.9, 2.9], [0.05, 0, -0.05], { push: 0.08, drift: 0.05 });
      chip('Ekor burung', 540, 230, at('ekor'), { size: 74 });
      chip('Lidah & alur', 540, 380, at('lidah'), { size: 74, bg: '#FFF7E6' });
    } else if (t < at('Bahkan') - 0.15) {               // a giant puzzle
      candiSet();
      shot(t, at('mirip') - 0.15, at('Bahkan'), [-6, 2.5, 9], [0, 3.2, -7], { eye2: [-4.5, 3.4, 7.5] });
      chip('Puzzle raksasa', 540, 300, at('puzzle'), { size: 90, stamp: true });
    } else {                                            // UGM: natural cementation
      show(LAB); sky('lab'); mood('dalam');
      const g2 = seg(t, at('kristal') - 0.2, at('menempel') + 0.3);
      LAB.userData.cr.children.forEach(c => c.scale.setScalar(clamp((g2 - c.userData.k * 0.6) * 2.5, 0.001, 1)));
      pose(PENELITI, t, { x: -1.05, z: -0.5, ry: 0.5, expr: t > at('menemukan') ? 'talk' : 'smile', talk: t > at('menemukan') && t < at('kristal'), arms: t > at('kristal') ? 'point' : 'down', look: 0.2 });
      shot(t, at('Bahkan') - 0.15, CUT[6], [-0.1, 1.95, 2.7], [-0.45, 0.95, -0.2], { push: 0.15 });
      card(['PENELITIAN UGM', 'Sementasi alami (1999)'], 540, 300, at('Universitas'), { size: 64, t1: at('kristal') - 0.1 });
      if (t > at('kristal')) chip('Kristal mineral', 540, 260, at('kristal'), { size: 74, bg: '#9FE8F2' });
      if (t > at('menempel')) chip('Menempel sendiri', 540, 410, at('menempel'), { size: 74, stamp: true, bg: '#FFF7E6' });
    }
  }
  // ───────── Beat 7: penutup ─────────
  else {
    candiSet('sore');
    if (t < at('Dia', 2) - 0.15) {                      // Dion stops pointing at the top
      const stop = t > at('berhenti') + 0.1;
      pose(DION, t, { x: 1.5, z: 2.4, ry: Math.PI + 0.2, expr: stop ? 'smile' : 'talk', arms: stop ? 'down' : 'point', look: stop ? 0 : 0.15, tilt: stop ? 0 : -0.15 });
      pose(PARTO, t, { x: 2.5, z: 2.0, ry: Math.PI - 0.5, expr: 'smile' });
      shot(t, CUT[6], at('Dia', 2), [2.2, 1.15, 5.8], [1.6, 1.1, 1.0], { drift: -0.1 });
    } else if (t < at('persis') - 0.15) {               // he traces the joints one by one
      const k3 = seg(t, at('menyusuri'), at('persis'));
      pose(DION, t, { x: lerp(1.0, 2.3, k3), z: 0.42, ry: Math.PI / 2 + 0.55, arms: [[-1.2, 0.2], [-1.25 + Math.sin(t * 6) * 0.1, 0.25]], walk: false, expr: 'smile', look: 0.15 });
      shot(t, at('Dia', 2) - 0.15, at('persis'), [lerp(3.6, 4.8, k3), 0.95, 0.95], [lerp(1.0, 2.2, k3), 0.66, 0.15], { push: 0.1, drift: 0 });
    } else {                                            // and this time he is the one smiling
      pose(DION, t, { x: 2.3, z: 0.45, ry: Math.PI - 0.7, arms: [[0, 0.12], [-1.1, 0.25]], expr: t > at('tersenyum', 1) - 0.1 ? 'happy' : 'smile', look: -0.3 });
      pose(PARTO, t, { x: 3.3, z: 0.95, ry: -1.2, expr: 'happy', nod: t > at('dialah') });
      shot(t, at('persis') - 0.15, DURATION, [3.6, 1.0, 3.0], [2.7, 0.85, 0.5], { push: 0.15 });
    }
  }
}
