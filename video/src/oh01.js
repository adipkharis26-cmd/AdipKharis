// Ohhiyaa! oh01 — Rp1 triliun pecahan Rp100.000 ditumpuk. 1 T ÷ 100.000 = 10 juta lembar × ±0,1 mm = ±1.000 m.
// Skala toy: Monas 132 m = 2,6 unit → 1 unit ≈ 50,8 m; menara 1.000 m ≈ 19,7 unit.
KEYWORDS = new Set(['triliun', 'monas', 'seribu', 'ohhiyaa', 'tahun']);
window.EXTRA_SFX = [];
const U = 50.8, TOWER_H = 1000 / U;
TOY.lembar = TOY.uang;
// tower height (units) by time: passes house, Monas, Autograph Tower exactly on their words
function towerH(t) {
  const pts = [[CUT[3], 0], [at('rumah', 1), 7 / U], [at('Monas', 2), 132 / U], [at('gedung'), 382.9 / U], [atEnd('Indonesia') + 0.5, TOWER_H]];
  if (t <= pts[0][0]) return 0; if (t >= pts[4][0]) return TOWER_H;
  for (let i = 0; i < 4; i++) if (t < pts[i + 1][0]) return lerp(pts[i][1], pts[i + 1][1], ease(seg(t, pts[i][0], pts[i + 1][0])));
}
function menara(t, x, z, h) { const G = pilar('rp1t', h, { w: 0.9, d: 0.45, col: '#E8454E', label: '100.000', per: 3 }); G.position.set(x, 0, z); }
// landmarks at true scale (1 unit ≈ 50,8 m): Monas 132 m, Autograph Tower 383 m, rumah 2 lantai 7 m
function landmark() {
  place(toy('monas'), -1.7, 0, 0.4, 0.5, 132 / U / 2.95);
  place(toy('pencakar'), 3.4, 0, -3.6, -0.3, 382.9 / U / 2.22);
  place(toy('rumah'), 0.75, 0, 0.9, -0.3, 7 / U / 0.76 * 1.6);
}

function scene(t) {
  const k = beatOf(t);
  studio(['studio', 'mint', 'langit', 'ungu', 'angkasa', 'studio'][k]);
  if (k === 0) {                                   // hook: one bill + OHI thinking
    const L = toy('lembar'); place(L, 0.7, 0.0, 0.3, -0.35, 2.0); muncul(L, t, 0.1);
    ohi(t, { x: -0.8, z: 1.2, ry: 0.45, expr: 'mikir', s: 0.85 });
    shot(t, 0, CUT[1], [0.3, 2.0, 5.2], [0, 0.4, 0.4], { push: 0.15 });
    chip('Rp1 Triliun', 540, 250, 0.05, { size: 100, bg: '#FFC93C' });
    chip('Ditumpuk...', 540, 400, at('ditumpuk'), { size: 90, bg: '#FFFFFF' });
    chip('Setinggi apa?', 540, 550, at('setinggi'), { size: 90, bg: '#FF6FAE', fg: '#fff' });
  } else if (k === 1) {                            // tebak A/B/C
    const L = toy('lembar'); place(L, 5, 0, 0.2, -0.3, 1.3);
    ohi(t, { x: 0, z: -0.4, expr: t > at('Monas', 1) ? 'kaget' : 'senang', wave: t < at('A'), jump: t > at('Monas', 1), s: 0.8 });
    shot(t, CUT[1], CUT[2], [0, 1.3, 3.9], [0, 0.85, 0], { push: 0.1 });
    tebak(at('Pilih'), CUT[2] - 0.1, { y: 250, opsi: ['A. Setinggi rumah', 'B. Setinggi Monas', 'C. 7 kali Monas'] });
  } else if (k === 2) {                            // measure thickness, then count
    const L = toy('lembar'); place(L, 0, 0, 0, -0.2, 2.6);
    const R = toy('penggaris'); place(R, 0, 0, 0.55, 0, 0.5);
    if (t < at('sepuluh') - 0.3) shot(t, CUT[2], at('sepuluh'), [0.2, 1.0, 3.4], [0, 0.1, 0.2], { push: 0.25 });
    else shot(t, at('sepuluh') - 0.3, CUT[3], [0.6, 1.6, 3.6], [0, 0.25, 0], { eye2: [1.4, 2.4, 4.6], target2: [0, 0.35, 0] });
    angka('± 0,1 MM', 330, at('sepersepuluh'), { sub: 'tebal selembar uang', col: '#1E6EFF', t1: at('sepuluh') - 0.1 });
    angka('10 JUTA LEMBAR', 330, at('sepuluh'), { sub: 'Rp1 T ÷ Rp100.000', col: '#FF6FAE', size: 130 });
    if (t > at('sepuluh') - 0.3) { L.visible = false; R.visible = false; grow(stack('gepok', 32, { cols: 4, rows: 2, layer: 0.115, gap: 0.68 }), t, at('sepuluh') - 0.2, CUT[3] - 0.3, 0, 0.1, 1); }
  } else if (k === 3) {                            // tower rises past landmarks
    landmark();
    menara(t, 0, 0, towerH(t));
    ohi(t, { x: -0.95, z: 0.8, ry: 0.4, expr: 'kaget', s: 0.45 });
    garisCepat(CUT[3] + 0.4, CUT[4] - 0.2);
    { const h = towerH(t); CAM.fov = 54; CAM.updateProjectionMatrix(); CAM.position.set(1.2 + h * 0.08, 1.4 + h * 0.4, 4.6 + h * 1.15); CAM.lookAt(0, 0.4 + h * 0.62, 0); SUN.target.position.set(0, 0, 0); SUN.position.copy(SUN_DIR).multiplyScalar(14); }
    tangga([{ label: '10 juta lembar', sub: '', t: CUT[3] + 0.1 }, { label: 'Rumah 2 lantai', sub: '±7 m', t: at('rumah', 1) }, { label: 'Monas', sub: '132 m', t: at('Monas', 2) }, { label: 'Autograph Tower', sub: '383 m, tertinggi di Indonesia', t: at('gedung') }], { t1: CUT[4] });
    chip('Ilustrasi skala', 540, 1640, CUT[3] + 0.2, { size: 40, bg: '#FFFFFF' });
  } else if (k === 4) {                            // OHHIYAA!
    landmark();
    menara(t, 0, 0, TOWER_H);
    ohi(t, { x: 2.4, z: 9, ry: -0.3, expr: 'kaget', s: 3.6, jump: t > at('Ohhiyaa') - 0.2 });
    shot(t, CUT[4], CUT[5], [0, 11, 31], [0, 9.5, 0], { eye2: [0, 9, 26], target2: [0, 9, 0] });
    angka('± 1.000 METER', 330, at('seribu'), { sub: '± 7,5 × MONAS', col: '#FF6FAE', t1: at('Ohhiyaa') - 0.1 });
    ohhiyaa(at('Ohhiyaa'), { y: 760 });
    chip('Jawaban: C', 540, 1640, at('Jawabannya'), { size: 70, bg: '#7EE8CF' });
  } else {                                         // personal + loop
    const L = toy('lembar'); place(L, 1.2, 0, 0.9, -0.3, 1.3);
    const W = toy('dompet'); place(W, -1.2, 0, 0.9, 0.4, 1.3); muncul(W, t, CUT[5] + 0.2); muncul(L, t, CUT[5] + 0.4);
    ohi(t, { x: 0, z: 0.4, ry: 0.1, expr: t > at('Kuat') ? 'kaget' : 'mikir', s: 0.9, point: t > at('Kuat') });
    shot(t, CUT[5], DURATION, [0, 1.5, 6.0], [0, 0.7, 0.2], { push: 0.1 });
    angka('± 15.000 TAHUN', 330, at('lima'), { sub: 'nabung seluruh UMP Jakarta', col: '#FFC93C', t1: at('Jadi') - 0.1 });
    chip('Setinggi apa?', 540, 380, at('setinggi', 3), { size: 100, bg: '#FF6FAE', fg: '#fff' });
  }
}
TOY.dompet = () => { const b = rbox(0.5, 0.3, 0.12, PLASTIK('#8A5A3C'), { ol: 0.006 }); b.position.y = 0.15; const fl = rbox(0.5, 0.12, 0.13, PLASTIK('#6E4429')); fl.position.y = 0.24; return grp(b, fl); };
