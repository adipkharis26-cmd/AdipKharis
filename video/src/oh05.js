// Ohhiyaa! oh05 — air minum seumur hidup jadi tumpukan galon. Format: tebak-angka · Alur: hasil-dulu · (hasil oh_format.py oh05)
// 2 L/hari (Kemenkes) × 365 × 74,15 th (BPS 2024) = ±54.130 L ÷ 19 L = ±2.850 galon × ±50 cm (Katadata) = ±1.424 m ≈ 1,4 km.
// Landmark: Monas 132 m, Autograph Tower 382,9 m (tertinggi RI), Burj Khalifa 828 m. Skala toy: 1 unit ≈ 50,8 m.
KEYWORDS = new Set(['galon', 'burj', 'khalifa', 'ohhiyaa', 'kilometer', 'liter']);
window.EXTRA_SFX = [];
const U = 50.8, TOP = 1424 / U;
const hOf = (t, pts) => { if (t <= pts[0][0]) return pts[0][1]; for (let i = 0; i < pts.length - 1; i++) if (t < pts[i + 1][0]) return lerp(pts[i][1], pts[i + 1][1], ease(seg(t, pts[i][0], pts[i + 1][0]))); return pts[pts.length - 1][1]; };
const HOOK_PTS = () => [[at('ditumpuk') - 0.1, 0], [at('Burj'), 828 / U], [at('Ohhiyaa') - 0.4, TOP]];
const RISE_PTS = () => [[CUT[3], 0], [at('Monas'), 132 / U], [at('tertinggi'), 382.9 / U], [at('Burj', 1), 828 / U], [CUT[4] - 0.1, TOP]];
function menara(h) {
  const G = build('menara-galon', () => {
    const side = canvasTex('galon-pilar', 64, 128, (x, w, hh) => {
      x.fillStyle = '#58B0FF'; x.fillRect(0, 0, w, hh);
      for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? 'rgba(255,255,255,.6)' : 'rgba(20,70,200,.35)'; x.fillRect(0, i * 8, w, 3); }
    }, [1, 1]);
    const m = PLASTIK('#ffffff', { map: side, rough: 0.35, coat: 0.5 }), top = PLASTIK('#1E6EFF', { rough: 0.4 });
    const B = mesh(new THREE.BoxGeometry(1.0, 1, 1.0), [m, m, top, m, m, m], { ol: 0.008 }); B.position.y = 0.5;
    const g2 = grp(B); g2.userData.B = B; g2.userData.side = side; return g2;
  });
  show(G); const hh = Math.max(0.002, h);
  G.userData.B.scale.y = hh; G.userData.B.position.y = hh / 2; G.userData.side.repeat.set(1, hh * 1.5);
  return G;
}
function landmark() {
  place(toy('monas'), -1.2, 0, -0.9, 0.5, 132 / U / 2.95);
  place(toy('pencakar', 'a'), 3.0, 0, -4.2, -0.3, 382.9 / U / 2.22);
  place(toy('pencakar', 'b'), -3.6, 0, -8.5, 0.2, 828 / U / 2.22);
}
function follow(h) {
  CAM.fov = 54; CAM.updateProjectionMatrix();
  CAM.position.set(1.2 + h * 0.08, 1.4 + h * 0.4, 4.6 + h * 1.15); CAM.lookAt(0, 0.4 + h * 0.62, 0);
  SUN.target.position.set(0, 0, 0); SUN.position.copy(SUN_DIR).multiplyScalar(14);
}

function scene(t) {
  const k = beatOf(t);
  studio(['studio', 'mint', 'langit', 'ungu', 'angkasa', 'studio'][k]);
  if (k === 0) {                                   // HASIL DULU: menara galon menembus Burj Khalifa → OHHIYAA!
    if (t < at('ditumpuk') - 0.1) {
      const G = toy('galon'); place(G, 0.8, 0, 0.3, -0.4, 1.7); muncul(G, t, 0.1);
      ohi(t, { x: -0.9, z: 1.2, ry: 0.45, expr: 'mikir', s: 0.85 });
      shot(t, 0, at('ditumpuk'), [0.3, 2.0, 5.2], [0, 0.5, 0.4], { push: 0.15 });
      chip('Air seumur hidupmu', 540, 250, 0.05, { size: 84, bg: '#FFC93C' });
      chip('jadi galon...', 540, 400, at('galon'), { size: 90, bg: '#FFFFFF' });
    } else {
      landmark();
      const h = hOf(t, HOOK_PTS()); menara(h).position.set(0, 0, 0);
      ohi(t, { x: -0.95, z: 0.8, ry: 0.4, expr: 'kaget', s: 0.45 });
      follow(h); garisCepat(at('ditumpuk'), at('Ohhiyaa'));
      chip('Lebih tinggi dari Burj Khalifa!', 540, 330, at('lebih'), { size: 54, bg: '#7EE8CF' });
      angka('± 1,4 KM', 560, at('Khalifa'), { sub: 'tinggi tumpukan galon', col: '#FF6FAE', size: 130, t1: at('Ohhiyaa') + 1.0 });
      ohhiyaa(at('Ohhiyaa'), { y: 800 });
      chip('Ilustrasi skala', 540, 1640, at('ditumpuk'), { size: 40, bg: '#FFFFFF' });
    }
  } else if (k === 1) {                            // TEBAK ANGKA BEBAS
    const G = toy('galon'); place(G, 5, 0, 0.2, -0.3, 1.6);
    ohi(t, { x: 0, z: -0.4, expr: 'senang', wave: t < at('berapa'), jump: false, s: 0.8 });
    shot(t, CUT[1], CUT[2], [0, 1.3, 3.9], [0, 0.85, 0], { push: 0.1 });
    chip('Tapi kok bisa?', 540, 200, CUT[1] + 0.1, { size: 84, bg: '#FFC93C', t1: at('Tebak') });
    tebak(at('Tebak'), CUT[2] - 0.1, { y: 250, txt: 'TEBAK ANGKANYA!', opsi: ['Tulis angkamu di komentar'] });
    chip('Petunjuk: antara 500 – 10.000 galon', 540, 880, at('berapa'), { size: 46, bg: '#FFFFFF' });
  } else if (k === 2) {                            // satuan: 19 L, 2 L/hari, 74 tahun
    if (t < at('selama') - 0.1) {
      const G = toy('galon'); place(G, 0, 0, 0, 0.3, 1.9);
      const R = toy('penggaris'); place(R, 0, 0, 0.8, 0, 0.5);
      shot(t, CUT[2], at('selama'), [0.2, 1.1, 3.8], [0, 0.55, 0.2], { push: 0.2 });
      angka('19 LITER', 330, at('sembilan'), { sub: 'isi 1 galon', col: '#1E6EFF', t1: at('Minum') - 0.1 });
      angka('± 2 LITER / HARI', 330, at('dua'), { sub: 'anjuran Kemenkes (±8 gelas)', col: '#7EE8CF', t1: at('selama') - 0.1, size: 120 });
    } else {
      grow(stack('galon', 36, { cols: 6, rows: 3, gap: 0.55, layer: 0.5 }), t, at('selama') - 0.1, at('tahun'), 0, 0, 0.9);
      shot(t, at('selama') - 0.2, CUT[3], [0, 3.4, 7.5], [0, 0.5, 0], { eye2: [0.6, 5.0, 9.5], target2: [0, 0.5, 0] });
      angka('± 74 TAHUN', 330, at('tujuh'), { sub: 'harapan hidup BPS 2024: 74,15', col: '#FF6FAE', size: 130 });
      chip('Ilustrasi skala', 540, 1640, at('selama'), { size: 40, bg: '#FFFFFF' });
    }
  } else if (k === 3) {                            // bongkar: menara naik melewati landmark
    landmark();
    const h = hOf(t, RISE_PTS()); menara(h).position.set(0, 0, 0);
    ohi(t, { x: -0.95, z: 0.8, ry: 0.4, expr: 'kaget', s: 0.45 });
    garisCepat(CUT[3] + 0.4, CUT[4] - 0.2); follow(h);
    tangga([{ label: '1 galon', sub: '±50 cm', t: CUT[3] + 0.1 }, { label: 'Monas', sub: '132 m', t: at('Monas') }, { label: 'Gedung tertinggi RI', sub: '382,9 m', t: at('tertinggi') }, { label: 'Burj Khalifa', sub: '828 m', t: at('Burj', 1) }], { t1: CUT[4] });
    chip('Ilustrasi skala', 540, 1640, CUT[3] + 0.2, { size: 40, bg: '#FFFFFF' });
  } else if (k === 4) {                            // twist: angka sebenarnya (tanpa OHHIYAA! kedua)
    landmark(); menara(TOP).position.set(0, 0, 0);
    ohi(t, { x: 2.8, z: 12, ry: -0.3, expr: 'senang', s: 5.0, point: t > at('setinggi') });
    shot(t, CUT[4], CUT[5], [0, 15, 44], [0, 13, 0], { eye2: [0, 14, 38], target2: [0, 13, 0] });
    angka('± 2.850 GALON', 300, at('tiga'), { sub: '2 L × 365 hari × 74 th ÷ 19 L', col: '#FF6FAE', size: 110, t1: at('setinggi') - 0.1 });
    angka('± 1,4 KM', 560, at('setinggi'), { sub: '2.850 × ±50 cm', col: '#1E6EFF', size: 120 });
  } else {                                         // personal + loop
    const G = toy('galon'); place(G, 1.0, 0, 0.7, -0.4, 1.9); muncul(G, t, CUT[5] + 0.3);
    ohi(t, { x: -0.5, z: 0.7, ry: 0.15, expr: t > at('Jadi') ? 'kaget' : 'senang', s: 0.9, point: t > at('Jadi') });
    shot(t, CUT[5], DURATION, [0, 1.6, 6.0], [0, 0.7, 0.2], { push: 0.1 });
    chip('Paling dekat? Ketik 🎯', 540, 250, at('Yang'), { size: 62, bg: '#FFC93C', t1: at('Jadi') - 0.1 });
    angka('± 54.000 LITER', 480, at('minummu'), { sub: 'air minummu seumur hidup', col: '#7EE8CF', size: 110, t1: at('setinggi', 1) - 0.1 });
    chip('Setinggi apa?', 540, 560, at('setinggi', 1), { size: 96, bg: '#FF6FAE', fg: '#fff' });
  }
}
