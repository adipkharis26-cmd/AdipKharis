// Ohhiyaa! oh04 — DUEL: semua motor vs semua mobil dijejer. Format: duel · Alur: duel · Jawaban: KIRI (motor).
// Motor 139,45 juta (BPS 2024) × 1,877 m = ±261.750 km. Mobil penumpang ±20,1 juta (Agu 2024, CNN Indonesia/BPS) × 4,395 m (Toyota Avanza) = ±88.340 km. Rasio ≈ 2,96×.
KEYWORDS = new Set(['motor', 'mobil', 'menang', 'ohhiyaa', 'panjang']);
window.EXTRA_SFX = [];
TOY.mobil = () => {
  const G = new THREE.Group(), c = ['#1E6EFF', '#FF6FAE', '#7EE8CF', '#FFC93C'][Math.floor(rnd(TOY._m = (TOY._m || 0) + 1) * 4)];
  [-0.36, 0.36].forEach(x => [-0.27, 0.27].forEach(z => { const w = cyl(0.11, 0.11, 0.09, PLASTIK('#24204A', { rough: 0.6 }), {}, 16); w.rotation.x = Math.PI / 2; w.position.set(x, 0.11, z); G.add(w); }));
  const b = rbox(1.15, 0.22, 0.5, PLASTIK(c), { ol: 0.006 }); b.position.set(0, 0.26, 0);
  const cab = rbox(0.6, 0.2, 0.44, PLASTIK('#DDF3FF', { rough: 0.2, coat: 0.6 }), { ol: 0.006 }); cab.position.set(-0.08, 0.46, 0);
  const l = sph(0.05, PLASTIK('#FFF4C2', { emissive: 0xffe08a, ei: 0.8 })); [-0.16, 0.16].forEach(z => { const h = l.clone(); h.position.set(0.58, 0.3, z); G.add(h); });
  G.add(b, cab); return G;
};
// lane = a row of toys running away from the camera (-z), growing from the start line (z=4); returns the group
function lane(kind, n, gap, x, t, t0, t1, S = 1.6) {
  const G = stack(kind, n, { cols: 1, rows: n, gap });
  if (!G.userData.r) { G.userData.r = 1; G.children.forEach(m => { m.rotation.y += Math.PI / 2; m.userData.home.z = -m.userData.home.z; }); }
  grow(G, t, t0, t1, x, 3 - (n * gap * S) / 2, S);
}

function scene(t) {
  const k = beatOf(t);
  studio(['studio', 'mint', 'langit', 'ungu', 'angkasa', 'studio'][k]);
  const face = () => { const M = toy('motor'); place(M, -0.8, 0, 0.2, 0.9, 1.7); const C = toy('mobil'); place(C, 0.9, 0, 0.0, -0.9 + Math.PI, 1.05); return [M, C]; };
  if (k === 0) {                                   // hook: dua kubu berhadapan
    const [M, C] = face(); muncul(M, t, 0.1); muncul(C, t, 0.3);
    ohi(t, { x: 0, z: 1.6, ry: 0, expr: 'mikir', s: 0.7 });
    shot(t, 0, CUT[1], [0, 2.2, 6.2], [0, 0.6, 0.2], { push: 0.15 });
    chip('Semua Motor', 540, 250, 0.05, { size: 96, bg: '#FF6FAE', fg: '#fff' });
    chip('LAWAN', 540, 400, at('lawan'), { size: 80, bg: '#FFFFFF' });
    chip('Semua Mobil', 540, 550, at('mobil'), { size: 96, bg: '#7EE8CF' });
    chip('Siapa lebih panjang?', 540, 700, at('siapa'), { size: 70, bg: '#FFC93C' });
  } else if (k === 1) {                            // DUEL: pilih tim
    face();
    ohi(t, { x: 0, z: 1.0, expr: t > at('mobil', 1) ? 'kaget' : 'senang', wave: t < at('Tim'), jump: t > at('mobil', 1), s: 0.75 });
    shot(t, CUT[1], CUT[2], [0, 1.8, 5.0], [0, 0.7, 0.2], { push: 0.1 });
    duel(at('Ketik'), CUT[2] - 0.1, { y: 250, kiri: '🏍️ TIM MOTOR', kanan: '🚗 TIM MOBIL' });
  } else if (k === 2) {                            // ukur kubu kiri: motor
    if (t < at('jumlahnya') - 0.2) {
      const M = toy('motor'); place(M, 0, 0, 0, 0, 2.1);
      const R = toy('penggaris'); place(R, 0, 0, 0.5, 0, 0.42);
      shot(t, CUT[2], at('jumlahnya'), [0.2, 1.0, 3.4], [0, 0.4, 0.2], { push: 0.25 });
      angka('± 1,9 METER', 330, at('hampir'), { sub: 'panjang 1 motor', col: '#FF6FAE', t1: at('dan') - 0.1 });
    } else {
      grow(stack('motor', 36, { cols: 12, rows: 3, gap: 0.55 }), t, at('jumlahnya') - 0.1, at('juta'), 0, 0, 1);
      shot(t, at('jumlahnya') - 0.2, CUT[3], [0, 3.4, 7.5], [0, 0.3, 0], { eye2: [0.6, 5.0, 9.5], target2: [0, 0.3, 0] });
      angka('± 140 JUTA MOTOR', 330, at('seratus'), { sub: 'BPS 2024: 139,45 juta', col: '#FF6FAE', size: 120 });
      chip('Ilustrasi skala', 540, 1640, at('jumlahnya'), { size: 40, bg: '#FFFFFF' });
    }
  } else if (k === 3) {                            // ukur kubu kanan: mobil, lalu balapan dua barisan
    if (t < at('barisan') - 0.2) {
      const C = toy('mobil'); place(C, 0, 0, 0, 0, 1.45);
      const R = toy('penggaris'); place(R, 0, 0, 0.7, 0, 0.5);
      shot(t, CUT[3], at('barisan'), [0.2, 1.1, 3.8], [0, 0.4, 0.2], { push: 0.2 });
      angka('± 4,4 METER', 330, at('Satu', 1), { sub: 'panjang 1 mobil (Avanza)', col: '#7EE8CF', t1: at('tapi') - 0.1 });
      angka('± 20 JUTA MOBIL', 330, at('jumlahnya', 1), { sub: 'BPS 2024: ±20,1 juta', col: '#1E6EFF', size: 120 });
    } else {
      lane('motor', 49, 0.55, -1.5, t, at('berlomba') - 0.1, at('Hampir', 1));
      lane('mobil', 7, 1.3, 1.5, t, at('berlomba') - 0.1, at('Hampir', 1));
      shot(t, at('barisan') - 0.2, CUT[4], [0, 3.0, 9], [0, 0.3, -8], { eye2: [0, 7, 10], target2: [0, 0, -12], fov: 60 });
      garisCepat(at('berlomba'), CUT[4] - 0.2, 'zoom');
      chip('Ilustrasi skala', 540, 1640, at('barisan'), { size: 40, bg: '#FFFFFF' });
    }
  } else if (k === 4) {                            // OHHIYAA! motor menang
    lane('motor', 49, 0.55, -1.5, t, 0, 0.001);
    lane('mobil', 7, 1.3, 1.5, t, 0, 0.001);
    ohi(t, { x: 0.0, z: 6.4, ry: 0, expr: 'kaget', s: 1.0, jump: t > at('Ohhiyaa') - 0.2 });
    shot(t, CUT[4], CUT[5], [0, 7, 10], [0, 0, -12], { eye2: [0, 6, 10], target2: [0, 0, -10], fov: 60 });
    angka('± 262.000 KM', 300, at('menang'), { sub: 'MOTOR · 139,45 jt × 1,877 m', col: '#FF6FAE', size: 110, t1: at('Ohhiyaa') - 0.1 });
    angka('± 88.000 KM', 560, at('Hampir', 1), { sub: 'MOBIL · 20,1 jt × 4,395 m', col: '#7EE8CF', size: 110, t1: at('Ohhiyaa') - 0.1 });
    ohhiyaa(at('Ohhiyaa'), { y: 760 });
    jawab(at('Tim', 2), 'Menang: TIM MOTOR 🏍️', { size: 62 });
  } else {                                         // personal + loop
    const M = toy('motor'); place(M, -0.85, 0, 0.5, 0.8, 1.8); muncul(M, t, CUT[5] + 0.3);
    const C = toy('mobil'); place(C, 1.0, 0, -0.1, Math.PI - 0.7, 1.05); muncul(C, t, CUT[5] + 0.5);
    ohi(t, { x: 0, z: 1.2, ry: 0, expr: t > at('banyak') ? 'kaget' : 'mikir', s: 0.8, point: t > at('banyak') });
    shot(t, CUT[5], DURATION, [0, 1.6, 6.0], [0, 0.7, 0.2], { push: 0.1 });
    angka('± 7 KALI LIPAT', 330, at('tujuh'), { sub: 'jumlah motor vs mobil', col: '#FFC93C', t1: at('Jadi') - 0.1 });
    chip('Siapa lebih panjang?', 540, 480, at('siapa', 1), { size: 80, bg: '#FF6FAE', fg: '#fff' });
  }
}
