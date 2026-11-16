// Ohhiyaa! oh08 — KURANG/LEBIH: semua motor Jakarta dijejer vs Sabang–Merauke. Format: kurang-lebih · Alur: duel · Jawaban: LEBIH (hasil oh_format.py oh08).
// Motor DKI ±9,38 juta (BPS 2025, via detikOto: 9.376.276) × 1,877 m = ±17.600 km. Sabang–Merauke ±5.200 km (media). Rasio ±3,4×. (Angka lama 17,3 juta unit/2022 → 32.000 km: jawaban tetap LEBIH.)
KEYWORDS = new Set(['motor', 'lebih', 'kurang', 'sabang', 'merauke', 'ohhiyaa']);
window.EXTRA_SFX = [];
TOY.bendera = () => {
  const G = new THREE.Group();
  const pole = cyl(0.025, 0.025, 1.2, PLASTIK('#C8CDD8', { metal: 0.5 }), {}, 10); pole.position.y = 0.6;
  const red = rbox(0.5, 0.17, 0.02, PLASTIK('#E84545'), { ol: 0.004 }); red.position.set(0.27, 1.07, 0);
  const wh = rbox(0.5, 0.17, 0.02, PLASTIK('#FFFFFF'), { ol: 0.004 }); wh.position.set(0.27, 0.9, 0);
  G.add(pole, red, wh); return G;
};
const NM = 40, GAP_M = 0.55, SC = 2.0, LEN_M = NM * GAP_M * SC, LEN_P = LEN_M / 3.384;   // ratio 3,384
function lane(kind, n, gap, x, t, t0, t1, S) {
  const G = stack(kind, n, { cols: 1, rows: n, gap });
  if (!G.userData.r) { G.userData.r = 1; G.children.forEach(m => { m.rotation.y += Math.PI / 2; m.userData.home.z = -m.userData.home.z; }); }
  grow(G, t, t0, t1, x, 3 - (n * gap * S) / 2, S);
}
function patokan(x) {                              // jalur Sabang–Merauke: jalan kuning + bendera di ujung
  const R = build('patokan', () => { const b = box(0.8, 0.04, 1, PLASTIK('#FFC93C'), { ol: 0.005 }); b.position.y = 0.02; return grp(b); });
  show(R); R.children[0].scale.z = LEN_P; R.position.set(x, 0, 3 - LEN_P / 2);
  place(toy('bendera', 'a'), x - 0.6, 0, 3, 0, 1.8); place(toy('bendera', 'b'), x - 0.6, 0, 3 - LEN_P, 0, 1.8);
}

function scene(t) {
  const k = beatOf(t);
  studio(['studio', 'mint', 'langit', 'ungu', 'angkasa', 'studio'][k]);
  if (k === 0) {                                   // hook: motor vs patokan
    const M = toy('motor'); place(M, -0.9, 0, 0.3, 0.7, 2.0); muncul(M, t, 0.1);
    place(toy('bendera', 'a'), 1.0, 0, 0, 0, 1.4); place(toy('bendera', 'b'), 1.8, 0, -0.8, 0, 1.4);
    ohi(t, { x: 0.2, z: 1.3, ry: 0, expr: 'mikir', s: 0.75 });
    shot(t, 0, CUT[1], [0.2, 2.0, 5.6], [0.2, 0.7, 0.2], { push: 0.15 });
    chip('Semua Motor Jakarta', 540, 250, 0.05, { size: 78, bg: '#FF6FAE', fg: '#fff' });
    chip('LEBIH atau KURANG', 540, 400, at('lebih'), { size: 70, bg: '#FFC93C' });
    chip('dari Sabang–Merauke?', 540, 550, at('Sabang'), { size: 70, bg: '#FFFFFF' });
  } else if (k === 1) {                            // KURANG / LEBIH
    const M = toy('motor'); place(M, -1.0, 0, 0.2, 0.8, 1.6); place(toy('bendera', 'a'), 1.2, 0, 0, 0, 1.3); place(toy('bendera', 'b'), 2.0, 0, -0.6, 0, 1.3);
    ohi(t, { x: 0.2, z: 0.9, expr: t > at('lebih', 2) ? 'kaget' : 'mikir', wave: false, jump: t > at('lebih', 2), s: 0.75 });
    shot(t, CUT[1], CUT[2], [0, 1.8, 5.2], [0, 0.7, 0.2], { push: 0.1 });
    tebak(at('Ketik'), CUT[2] - 0.1, { y: 250, txt: 'KURANG / LEBIH?', opsi: ['KURANG', 'LEBIH'] });
    chip('dari Sabang–Merauke (±5.200 km)', 540, 960, at('Ketik') + 0.3, { size: 46, bg: '#7EE8CF' });
  } else if (k === 2) {                            // ukur kubu kiri: motor Jakarta
    if (t < at('jumlahnya') - 0.2) {
      const M = toy('motor'); place(M, 0, 0, 0, 0.0, 1.6);
      const R = toy('penggaris'); place(R, 0, 0, 0.5, 0, 0.42);
      shot(t, CUT[2], at('jumlahnya'), [0.2, 1.0, 3.4], [0, 0.4, 0.2], { push: 0.25 });
      angka('± 1,9 METER', 330, at('hampir'), { sub: 'panjang 1 motor', col: '#FF6FAE', t1: at('dan') - 0.1 });
    } else {
      grow(stack('motor', 36, { cols: 12, rows: 3, gap: 0.55 }), t, at('jumlahnya') - 0.1, at('juta'), 0, 0, 1);
      shot(t, at('jumlahnya') - 0.2, CUT[3], [0, 3.4, 7.5], [0, 0.3, 0], { eye2: [0.6, 5.0, 9.5], target2: [0, 0.3, 0] });
      angka('± 9 JUTA MOTOR', 330, at('sembilan'), { sub: 'Jakarta, BPS 2025: 9,38 juta', col: '#FF6FAE', size: 120 });
      chip('Ilustrasi skala', 540, 1640, at('jumlahnya'), { size: 40, bg: '#FFFFFF' });
    }
  } else if (k === 3) {                            // ukur kubu kanan, lalu balapan
    if (t < at('barisan') - 0.2) {
      place(toy('bendera', 'a'), -1.4, 0, 0, 0, 1.2); place(toy('bendera', 'b'), 1.0, 0, 0, 0, 1.2);
      const S2 = build('jalur-pendek', () => { const b = box(2.8, 0.04, 0.4, PLASTIK('#FFC93C'), { ol: 0.005 }); b.position.y = 0.02; return grp(b); }); show(S2);
      shot(t, CUT[3], at('barisan'), [0, 1.9, 6.5], [0, 0.8, 0], { push: 0.15 });
      chip('Sabang', 300, 1060, at('Sabang', 1), { size: 46, bg: '#FFFFFF' }); chip('Merauke', 780, 1060, at('Merauke', 1), { size: 46, bg: '#FFFFFF' });
      angka('± 5.200 KM', 330, at('lima'), { sub: 'Sabang–Merauke (perkiraan)', col: '#7EE8CF', size: 130 });
    } else {
      lane('motor', NM, GAP_M, -1.5, t, at('berlomba') - 0.1, CUT[4] - 0.3, SC); patokan(1.7);
      shot(t, at('barisan') - 0.2, CUT[4], [0, 3.0, 9], [0, 0.3, -8], { eye2: [0, 7, 10], target2: [0, 0, -12], fov: 60 });
      garisCepat(at('berlomba'), CUT[4] - 0.2, 'zoom');
      chip('Ilustrasi skala', 540, 1640, at('barisan'), { size: 40, bg: '#FFFFFF' });
    }
  } else if (k === 4) {                            // OHHIYAA! LEBIH
    lane('motor', NM, GAP_M, -1.5, t, 0, 0.001, SC); patokan(1.7);
    ohi(t, { x: 0, z: 6.4, ry: 0, expr: 'kaget', s: 1.0, jump: t > at('Ohhiyaa') - 0.2 });
    shot(t, CUT[4], CUT[5], [0, 7, 10], [0, 0, -12], { eye2: [0, 6, 10], target2: [0, 0, -10], fov: 60 });
    angka('± 17.600 KM', 300, at('Hampir', 1), { sub: 'MOTOR JAKARTA · 9,38 jt × 1,877 m', col: '#FF6FAE', size: 110, t1: at('Ohhiyaa') - 0.1 });
    angka('± 5.200 KM', 560, at('cuma'), { sub: 'SABANG–MERAUKE', col: '#7EE8CF', size: 110, t1: at('Ohhiyaa') - 0.1 });
    ohhiyaa(at('Ohhiyaa'), { y: 800 });
    chip('Jawaban: LEBIH!', 540, 1640, at('lebih', 3), { size: 70, bg: '#FF6FAE', fg: '#fff' });
  } else {                                         // personal + loop
    const M = toy('motor'); place(M, -1.0, 0, 0.5, 0.8, 2.0); muncul(M, t, CUT[5] + 0.3);
    place(toy('bendera', 'a'), 1.3, 0, 0, 0, 1.5); place(toy('bendera', 'b'), 2.1, 0, -0.7, 0, 1.5);
    ohi(t, { x: 0.2, z: 1.2, ry: 0, expr: t > at('Jadi') ? 'mikir' : 'senang', s: 0.8, point: t > at('Jadi') });
    shot(t, CUT[5], DURATION, [0, 1.7, 6.0], [0, 0.7, 0.2], { push: 0.1 });
    angka('± 3,4 × LEBIH PANJANG', 330, at('menyeberangi'), { sub: 'dari Sabang–Merauke', col: '#FFC93C', size: 100, t1: at('Jadi') - 0.1 });
    chip('Kurang atau lebih?', 540, 520, at('kurang', 1) , { size: 84, bg: '#FF6FAE', fg: '#fff' });
  }
}
