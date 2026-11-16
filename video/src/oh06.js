// Ohhiyaa! oh06 — BENAR/BOHONG: "semua orang Indonesia gandengan tangan cuma keliling Bumi 1×". Format: benar-bohong · Alur: tangga · Jawaban: BOHONG (hasil oh_format.py oh06).
// 284,67 juta jiwa (BPS SUPAS 2025) × ±1,5 m (asumsi rentang tangan rata-rata semua usia) = ±427.000 km = ±10,7 × keliling Bumi (40.075 km) = ±1,1 × jarak Bumi–Bulan (384.400 km).
KEYWORDS = new Set(['bohong', 'bumi', 'bulan', 'ohhiyaa', 'orang']);
window.EXTRA_SFX = [];
const NR = 11;                                       // 10 cincin penuh + 1 cincin 0,65 (= 10,65 putaran)
function rings(t, tStart, tEnd, spin, x = 0, sc = 1) {
  const G = build('rings-orang', () => {
    const g = new THREE.Group();
    for (let i = 0; i < NR; i++) {
      const m = torus(2.12 + i * 0.05, 0.04, PLASTIK(['#FF6FAE', '#FFC93C', '#7EE8CF', '#1E6EFF'][i % 4]), i === NR - 1 ? Math.PI * 2 * 0.65 : Math.PI * 2, { ol: 0.003 });
      m.rotation.set(Math.PI / 2 + (i % 2 ? 0.28 : -0.28) * (0.4 + (i % 5) * 0.25), i * 0.57, 0); g.add(m);
    }
    return g;
  });
  show(G); G.position.set(x, 2, 0); G.scale.setScalar(sc);
  G.children.forEach((m, i) => { const ti = tStart + (tEnd - tStart) * (i / NR), k = seg(t, ti, ti + 0.35); m.visible = t >= ti; m.scale.setScalar(Math.max(0.001, back(k))); if (t >= ti && t < ti + 0.05) cue(ti, 'pop', 0.5); });
  G.rotation.y = spin * t * 0.15;
}
function bumi(t, s = 2, x = 0) { const B = toy('bumi'); place(B, x, 2, 0, t * 0.2, s); return B; }
function rowOrang(n, gap) { return stack('orang', n, { cols: n, rows: 1, gap }); }

function scene(t) {
  const k = beatOf(t);
  studio(['studio', 'mint', 'langit', 'ungu', 'angkasa', 'studio'][k]);
  if (k === 0) {                                   // hook: klaim
    for (let i = 0; i < 4; i++) { const P = toy('orang', String(i)); place(P, -1.3 + i * 0.9, 0, 0.2, 0.15 * (i % 2 ? 1 : -1), 1.15); muncul(P, t, 0.2 + i * 0.12); }
    ohi(t, { x: 0.1, z: 1.7, ry: 0, expr: 'mikir', s: 0.7 });
    shot(t, 0, CUT[1], [0, 1.9, 5.8], [0, 0.7, 0.2], { push: 0.15 });
    card(['KATANYA...', 'semua orang Indonesia', 'gandengan tangan', 'cuma keliling Bumi 1×'], 540, 400, 0.15, { size: 50, w: 900 });
  } else if (k === 1) {                            // BENAR / BOHONG
    const B = toy('bumi'); place(B, 4.6, 0.3, 0, t * 0.2, 1.1);
    for (let i = 0; i < 3; i++) { const P = toy('orang', String(i)); place(P, -2.0 + i * 0.7, 0, 0.1, 0.1, 1.0); }
    ohi(t, { x: 0, z: -0.2, expr: 'mikir', s: 0.8 });
    shot(t, CUT[1], CUT[2], [0, 1.4, 4.0], [0, 0.85, 0], { push: 0.1 });
    tebak(at('Benar'), CUT[2] - 0.1, { y: 250, txt: 'BENAR / BOHONG?', opsi: ['BENAR', 'BOHONG'] });
  } else if (k === 2) {                            // satuan: 1 orang ±1,5 m, lalu 285 juta
    if (t < at('penduduk') - 0.2) {
      const P = toy('orang'); place(P, 0, 0, 0, 0, 2.6);
      const R = toy('penggaris'); place(R, 0, 0, 0.7, 0, 0.5);
      shot(t, CUT[2], at('penduduk'), [0.2, 1.1, 3.6], [0, 0.6, 0.2], { push: 0.2 });
      angka('± 1,5 METER', 330, at('rentang'), { sub: 'rentang tangan 1 orang (asumsi)', col: '#1E6EFF', t1: at('Dan') - 0.1 });
    } else {
      grow(stack('orang', 36, { cols: 12, rows: 3, gap: 0.5 }), t, at('penduduk') - 0.1, at('juta'), 0, 0, 0.9);
      shot(t, at('penduduk') - 0.2, CUT[3], [0, 3.4, 7.5], [0, 0.3, 0], { eye2: [0.6, 5.0, 9.5], target2: [0, 0.3, 0] });
      angka('± 285 JUTA ORANG', 330, at('hampir'), { sub: 'BPS SUPAS 2025: 284,67 juta', col: '#FF6FAE', size: 108 });
      chip('Ilustrasi skala', 540, 1640, at('penduduk'), { size: 40, bg: '#FFFFFF' });
    }
  } else if (k === 3) {                            // barisan memanjang → melilit Bumi
    const tl = at('mengelilingi', 1) - 0.1;
    if (t < tl) {
      grow(rowOrang(100, 0.2), t, CUT[3], at('Merauke'), 1, 0, 1.5);
      ohi(t, { x: -10 + (t - CUT[3]) * 1.9, z: 1.4, ry: 0.4, expr: 'kaget', s: 0.55 });
      shot(t, CUT[3], tl, [-12, 1.6, 4.2], [-10, 0.3, 0], { eye2: [13, 2.2, 5.2], target2: [15, 0.3, 0] });
      garisCepat(CUT[3] + 0.6, tl);
    } else {
      bumi(t); rings(t, tl, CUT[4] - 0.1, 1);
      shot(t, tl, CUT[4], [0, 3.2, 10], [0, 2, 0], { eye2: [0, 3.5, 12.5], target2: [0, 2, 0] });
      chip('Ilustrasi skala', 540, 1640, tl + 0.2, { size: 40, bg: '#FFFFFF' });
    }
    tangga([{ label: '1 orang', sub: '±1,5 m', t: CUT[3] + 0.1 }, { label: 'Jakarta–Surabaya', sub: '±800 km', t: at('Surabaya') }, { label: 'Sabang–Merauke', sub: '±5.200 km', t: at('Merauke') }, { label: 'Keliling Bumi', sub: '40.075 km', t: at('Bumi', 1) }], { t1: CUT[4] });
  } else if (k === 4) {                            // OHHIYAA! bohong
    bumi(t, 1.5, -1.0); rings(t, 0, 0.001, 1, -1.0, 0.75);
    const L = toy('bulan'); place(L, 2.3, 4.7, -1.5, t * 0.15, 0.85);
    ohi(t, { x: 1.6, z: 4.6, ry: -0.5, expr: 'kaget', s: 1.4, jump: t > at('Ohhiyaa') - 0.2 });
    shot(t, CUT[4], CUT[5], [0, 3.4, 12.5], [0, 2.4, 0], { eye2: [0, 3.2, 10.5], target2: [0, 2.4, 0] });
    chip('BOHONG!', 540, 1640, at('bohong', 1), { size: 80, bg: '#FF6FAE', fg: '#fff', t1: at('Ohhiyaa') - 0.1 });
    angka('± 427.000 KM', 330, at('sepuluh'), { sub: '± 10,7 × KELILING BUMI', col: '#FF6FAE', t1: at('Ohhiyaa') - 0.1 });
    chip('Bulan: 384.400 km', 540, 560, at('Bulan'), { size: 54, bg: '#FFC93C', t1: at('Ohhiyaa') - 0.1 });
    ohhiyaa(at('Ohhiyaa'), { y: 800 });
  } else {                                         // personal + loop
    for (let i = 0; i < 3; i++) { const P = toy('orang', String(i)); place(P, -1.3 + i * 0.75, 0, 0.1, 0.1 * (i % 2 ? 1 : -1), 1.5); muncul(P, t, CUT[5] + 0.2 + i * 0.12); }
    ohi(t, { x: 0.4, z: 1.1, ry: 0, expr: t > at('Jadi') ? 'mikir' : 'senang', s: 0.8, point: t > at('Jadi') });
    shot(t, CUT[5], DURATION, [0, 1.7, 6.0], [0, 0.7, 0.2], { push: 0.1 });
    angka('± 1,1 × KE BULAN', 330, at('Bulan', 1), { sub: '427.000 ÷ 384.400 km', col: '#FFC93C', size: 110, t1: at('Jadi') - 0.1 });
    chip('Benar atau bohong?', 540, 480, at('benar', 1), { size: 84, bg: '#FF6FAE', fg: '#fff' });
  }
}
