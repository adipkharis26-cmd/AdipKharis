// Ohhiyaa! oh03 — semua nasi bungkus RI sehari ditumpuk. 284,67 juta jiwa (BPS SUPAS 2025) × ±5 cm (asumsi) = ±14.233 km ≈ 1,1 × lebar Bumi (12.742 km).
KEYWORDS = new Set(['nasi', 'bungkus', 'bumi', 'kilometer', 'ohhiyaa', 'lantai']);
window.EXTRA_SFX = [];
// Skala tampilan menara (ilustrasi, tidak linear): 1 unit ≈ jarak berbeda di tiap tahap; tangga() menunjukkan angka aslinya.
const TOP = 21.5, BUMI_R = 10;
function towerH(t) {
  const pts = [[CUT[3], 0], [at('Monas'), 2.6], [at('Everest', 1), 7.0], [at('pesawat'), 8.2], [at('stasiun', 1), 13.0], [at('masih'), 20.0], [CUT[4] - 0.15, TOP]];
  if (t <= pts[0][0]) return 0; if (t >= pts[6][0]) return TOP;
  for (let i = 0; i < 6; i++) if (t < pts[i + 1][0]) return lerp(pts[i][1], pts[i + 1][1], ease(seg(t, pts[i][0], pts[i + 1][0])));
}
function menara(h) {
  const G = build('menara-nasi', () => {
    const side = canvasTex('nasi-pilar', 64, 128, (x, w, hh) => {
      x.fillStyle = '#E9CFA0'; x.fillRect(0, 0, w, hh);
      for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? 'rgba(255,255,255,.35)' : 'rgba(150,100,50,.25)'; x.fillRect(0, i * 8, w, 3); }
    }, [1, 1]);
    const m = PLASTIK('#ffffff', { map: side, rough: 0.8, coat: 0.1 }), top = PLASTIK('#F3E3BE', { rough: 0.8 });
    const B = mesh(new THREE.BoxGeometry(0.55, 1, 0.55), [m, m, top, m, m, m], { ol: 0.008 }); B.position.y = 0.5;
    const g2 = grp(B); g2.userData.B = B; g2.userData.side = side; return g2;
  });
  show(G); const hh = Math.max(0.002, h);
  G.userData.B.scale.y = hh; G.userData.B.position.y = hh / 2; G.userData.side.repeat.set(1, hh * 1.5);
  return G;
}
function landmark(t, k4) {
  place(toy('monas'), -1.15, 0, -0.9, 0.5, 2.6 / 2.95);
  place(toy('gunung'), 3.4, 0, -1.6, 0.3, 3.4);
  const P = toy('pesawat'); place(P, 1.7, 8.2, 0.4, -0.6, 2.6);
  const S = toy('satelit'); place(S, -1.7, 13, 0.4, 0.3, 3.0);
  if (k4 || t >= at('masih') - 0.2) { const B = toy('bumi'); place(B, 0, BUMI_R, -9, t * 0.2, BUMI_R); if (!k4) muncul(B, t, at('masih') - 0.2, 0.6); }
}

function scene(t) {
  const k = beatOf(t);
  studio(['studio', 'mint', 'langit', 'ungu', 'angkasa', 'studio'][k]);
  if (k === 0) {                                   // hook
    const N = toy('nasi'); place(N, 0.7, 0, 0.3, -0.4, 3.2); muncul(N, t, 0.1);
    ohi(t, { x: -0.9, z: 1.2, ry: 0.45, expr: 'mikir', s: 0.85 });
    shot(t, 0, CUT[1], [0.3, 2.0, 5.2], [0, 0.5, 0.4], { push: 0.15 });
    chip('Semua Nasi Bungkus RI', 540, 250, 0.05, { size: 84, bg: '#FFC93C' });
    chip('Ditumpuk...', 540, 400, at('ditumpuk'), { size: 90, bg: '#FFFFFF' });
    chip('Setinggi apa?', 540, 550, at('setinggi'), { size: 90, bg: '#FF6FAE', fg: '#fff' });
  } else if (k === 1) {                            // tebak A/B/C
    const N = toy('nasi'); place(N, 5, 0, 0.2, -0.3, 3);
    ohi(t, { x: 0, z: -0.4, expr: t > at('Bumi') ? 'kaget' : 'senang', wave: t < at('A'), jump: t > at('Bumi'), s: 0.8 });
    shot(t, CUT[1], CUT[2], [0, 1.3, 3.9], [0, 0.85, 0], { push: 0.1 });
    tebak(at('Pilih'), CUT[2] - 0.1, { y: 250, opsi: ['A. Setinggi Everest', 'B. Sampai stasiun angkasa', 'C. Lebih dari lebar Bumi'] });
  } else if (k === 2) {                            // satuan: 1 bungkus, lalu 285 juta
    if (t < at('penduduk') - 0.2) {
      const N = toy('nasi'); place(N, 0, 0, 0, 0.0, 4.2);
      const R = toy('penggaris'); place(R, 0, 0, 0.6, 0, 0.45);
      shot(t, CUT[2], at('penduduk'), [0.2, 1.0, 3.4], [0, 0.4, 0.2], { push: 0.25 });
      angka('± 5 CM', 330, at('tingginya'), { sub: 'tinggi 1 nasi bungkus (asumsi)', col: '#1E6EFF', t1: at('Dan') - 0.1 });
    } else {
      grow(stack('nasi', 40, { cols: 8, rows: 5, gap: 0.5, layer: 0.4 }), t, at('penduduk') - 0.1, at('juta'), 0, 0, 1);
      shot(t, at('penduduk') - 0.2, CUT[3], [0, 3.4, 7.5], [0, 0.3, 0], { eye2: [0.6, 5.0, 9.5], target2: [0, 0.3, 0] });
      angka('± 285 JUTA ORANG', 330, at('hampir'), { sub: 'BPS SUPAS 2025: 284,67 juta', col: '#FF6FAE', size: 108 });
      chip('Ilustrasi skala', 540, 1640, at('penduduk'), { size: 40, bg: '#FFFFFF' });
    }
  } else if (k === 3) {                            // menara naik melewati landmark
    const h = towerH(t);
    landmark(t, false);
    menara(h).position.set(0, 0, 0);
    ohi(t, { x: -0.95, z: 0.8, ry: 0.4, expr: 'kaget', s: 0.45 });
    garisCepat(CUT[3] + 0.4, CUT[4] - 0.2);
    CAM.fov = 54; CAM.updateProjectionMatrix();
    CAM.position.set(1.2 + h * 0.08, 1.4 + h * 0.4, 4.6 + h * 1.15); CAM.lookAt(0, 0.4 + h * 0.62, 0);
    SUN.target.position.set(0, 0, 0); SUN.position.copy(SUN_DIR).multiplyScalar(14);
    tangga([{ label: '1 bungkus', sub: '±5 cm', t: CUT[3] + 0.1 }, { label: 'Monas', sub: '132 m', t: at('Monas') }, { label: 'Everest', sub: '8.849 m', t: at('Everest', 1) }, { label: 'Pesawat', sub: '±11 km', t: at('pesawat') }, { label: 'Stasiun angkasa', sub: '±400 km', t: at('stasiun', 1) }, { label: 'Lebar Bumi', sub: '12.742 km', t: at('masih') }], { t1: CUT[4] });
    chip('Ilustrasi skala', 540, 1640, CUT[3] + 0.2, { size: 40, bg: '#FFFFFF' });
  } else if (k === 4) {                            // OHHIYAA!
    landmark(t, true);
    menara(TOP).position.set(0, 0, 0);
    ohi(t, { x: 2.6, z: 9, ry: -0.3, expr: 'kaget', s: 3.6, jump: t > at('Ohhiyaa') - 0.2 });
    shot(t, CUT[4], CUT[5], [0, 12, 34], [0, 10.5, 0], { eye2: [0, 11, 29], target2: [0, 10.5, 0] });
    angka('± 14.200 KM', 330, at('kilometer'), { sub: '± 1,1 × LEBAR BUMI', col: '#FF6FAE', t1: at('Ohhiyaa') - 0.1 });
    ohhiyaa(at('Ohhiyaa'), { y: 760 });
    chip('Jawaban: C', 540, 1640, at('Jawabannya'), { size: 70, bg: '#7EE8CF' });
  } else {                                         // personal + loop
    const N = toy('nasi'); place(N, 1.0, 0, 0.9, -0.4, 3.0); muncul(N, t, CUT[5] + 0.3);
    const Gd = toy('gedung'); place(Gd, -1.2, 0, -1.6, 0.3, 1.6);
    ohi(t, { x: -0.3, z: 0.6, ry: 0.1, expr: t > at('Kenyang') ? 'kaget' : 'mikir', s: 0.9, point: t > at('Kenyang') });
    shot(t, CUT[5], DURATION, [0, 1.8, 6.4], [0, 0.9, 0.2], { push: 0.1 });
    angka('± 18 METER', 330, at('setahun'), { sub: '365 bungkus × 5 cm', col: '#FFC93C', t1: at('Jadi') - 0.1 });
    chip('Setinggi apa?', 540, 380, at('setinggi', 3), { size: 96, bg: '#FF6FAE', fg: '#fff' });
  }
}
