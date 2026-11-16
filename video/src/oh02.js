// Ohhiyaa! oh02 — semua motor RI dijejer. 139,45 juta (BPS 2024) × 1,877 m = ±261.750 km ≈ 6,5 × keliling Bumi (40.075 km).
KEYWORDS = new Set(['motor', 'bumi', 'kilometer', 'ohhiyaa', 'tahun']);
window.EXTRA_SFX = [];
const RING_ROT = [0, 0.55, 1.1, 1.65, 2.2, 2.75, 3.3];
function rings(t, tStart, tEnd, spin) {
  const G = build('rings-bumi', () => {
    const g = new THREE.Group();
    RING_ROT.forEach((r, i) => {
      const m = torus(2.12 + i * 0.045, 0.055, PLASTIK(['#FF6FAE', '#FFC93C', '#7EE8CF', '#1E6EFF', '#FF6FAE', '#FFC93C', '#7EE8CF'][i]), i === 6 ? Math.PI : Math.PI * 2, { ol: 0.004 });
      m.rotation.set(Math.PI / 2 + (i % 2 ? 0.25 : -0.25), r, 0); g.add(m);
    });
    return g;
  });
  show(G); G.position.set(0, 2, 0);
  G.children.forEach((m, i) => {
    const ti = tStart + (tEnd - tStart) * (i / 7), k = seg(t, ti, ti + 0.5); m.visible = t >= ti; m.scale.setScalar(Math.max(0.001, back(k)));
    if (t >= ti && t < ti + 0.05) cue(ti, 'pop', 0.6);
  });
  G.rotation.y = spin * t * 0.15;
}
function bumi(t, s = 2) { const B = toy('bumi'); place(B, 0, 2, 0, t * 0.2, s); return B; }

function scene(t) {
  const k = beatOf(t);
  studio(['studio', 'mint', 'langit', 'ungu', 'angkasa', 'studio'][k]);
  if (k === 0) {                                   // hook
    const M = toy('motor'); place(M, 0.6, 0, 0.3, -0.5, 2.1); muncul(M, t, 0.1);
    ohi(t, { x: -0.9, z: 1.2, ry: 0.45, expr: 'mikir', s: 0.85 });
    shot(t, 0, CUT[1], [0.3, 2.0, 5.2], [0, 0.5, 0.4], { push: 0.15 });
    chip('Semua Motor RI', 540, 250, 0.05, { size: 96, bg: '#FFC93C' });
    chip('Dijejer...', 540, 400, at('dijejer'), { size: 90, bg: '#FFFFFF' });
    chip('Sepanjang apa?', 540, 550, at('sepanjang'), { size: 90, bg: '#FF6FAE', fg: '#fff' });
  } else if (k === 1) {                            // tebak A/B/C
    const M = toy('motor'); place(M, 5, 0, 0.2, -0.3, 2);
    ohi(t, { x: 0, z: -0.4, expr: t > at('Merauke') ? 'kaget' : 'senang', wave: t < at('A'), jump: t > at('Merauke'), s: 0.8 });
    shot(t, CUT[1], CUT[2], [0, 1.3, 3.9], [0, 0.85, 0], { push: 0.1 });
    tebak(at('Pilih'), CUT[2] - 0.1, { y: 250, opsi: ['A. Keliling Bumi 1×', 'B. 6× keliling Bumi', 'C. Sabang–Merauke'] });
  } else if (k === 2) {                            // satuan: 1 motor, lalu 140 juta
    if (t < at('jumlah') - 0.2) {
      const M = toy('motor'); place(M, 0, 0, 0, 0.0, 3.0);
      const R = toy('penggaris'); place(R, 0, 0, 0.5, 0, 0.42);
      shot(t, CUT[2], at('jumlah'), [0.2, 1.0, 3.4], [0, 0.4, 0.2], { push: 0.25 });
      angka('± 1,9 METER', 330, at('hampir'), { sub: 'panjang 1 motor', col: '#1E6EFF', t1: at('Dan') - 0.1 });
    } else {
      grow(stack('motor', 36, { cols: 12, rows: 3, gap: 0.55 }), t, at('jumlah') - 0.1, at('juta'), 0, 0, 1);
      shot(t, at('jumlah') - 0.2, CUT[3], [0, 3.4, 7.5], [0, 0.3, 0], { eye2: [0.6, 5.0, 9.5], target2: [0, 0.3, 0] });
      angka('± 140 JUTA MOTOR', 330, at('seratus'), { sub: 'BPS 2024: 139,45 juta', col: '#FF6FAE', size: 120 });
      chip('Ilustrasi skala', 540, 1640, at('jumlah'), { size: 40, bg: '#FFFFFF' });
    }
  } else if (k === 3) {                            // barisan memanjang, lalu melilit Bumi
    const tl = at('mengelilingi') - 0.1;
    if (t < tl) {
      grow(stack('motor', 60, { cols: 60, rows: 1, gap: 0.5 }), t, CUT[3], at('Merauke', 1), -15, 0, 1);
      ohi(t, { x: -10 + (t - CUT[3]) * 1.9, z: 1.4, ry: 0.4, expr: 'kaget', s: 0.55 });
      const u = seg(t, CUT[3], tl);
      shot(t, CUT[3], tl, [-12, 1.6, 4.2], [-10, 0.3, 0], { eye2: [13, 2.2, 5.2], target2: [15, 0.3, 0] });
      garisCepat(CUT[3] + 0.6, tl);
    } else {
      bumi(t); rings(t, tl, tl + 3.0, 1);
      shot(t, tl, CUT[4], [0, 3.2, 10], [0, 2, 0], { eye2: [0, 3.5, 12.5], target2: [0, 2, 0] });
      chip('Ilustrasi skala', 540, 1640, tl + 0.2, { size: 40, bg: '#FFFFFF' });
    }
    tangga([{ label: '1 motor', sub: '±1,9 m', t: CUT[3] + 0.1 }, { label: 'Jakarta–Surabaya', sub: '±800 km', t: at('Surabaya') }, { label: 'Sabang–Merauke', sub: '±5.200 km', t: at('Merauke', 1) }, { label: 'Keliling Bumi', sub: '40.075 km', t: at('Bumi', 2) }], { t1: CUT[4] });
  } else if (k === 4) {                            // OHHIYAA!
    bumi(t); rings(t, 0, 0.001, 1);
    ohi(t, { x: 3.2, z: 4.5, ry: -0.5, expr: 'kaget', s: 1.6, jump: t > at('Ohhiyaa') - 0.2 });
    shot(t, CUT[4], CUT[5], [0, 3.4, 12.5], [0, 2, 0], { eye2: [0, 3.0, 10.5], target2: [0, 2, 0] });
    angka('± 262.000 KM', 330, at('kilometer'), { sub: '± 6,5 × KELILING BUMI', col: '#FF6FAE', t1: at('Ohhiyaa') - 0.1 });
    ohhiyaa(at('Ohhiyaa'), { y: 760 });
    chip('Jawaban: B', 540, 1640, at('Jawabannya'), { size: 70, bg: '#7EE8CF' });
  } else {                                         // personal + loop
    const M = toy('motor'); place(M, 1.3, 0, 0.9, -0.4, 2.4); muncul(M, t, CUT[5] + 0.3);
    ohi(t, { x: -0.3, z: 0.4, ry: 0.1, expr: t > at('Kuat') ? 'kaget' : 'mikir', s: 0.9, point: t > at('Kuat') });
    shot(t, CUT[5], DURATION, [0, 1.5, 6.0], [0, 0.7, 0.2], { push: 0.1 });
    angka('± 6 TAHUN', 330, at('enam', 1), { sub: 'jalan kaki 5 km/jam nonstop', col: '#FFC93C', t1: at('Jadi') - 0.1 });
    chip('Sepanjang apa?', 540, 380, at('sepanjang', 1), { size: 96, bg: '#FF6FAE', fg: '#fff' });
  }
}
