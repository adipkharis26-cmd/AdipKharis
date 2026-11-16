// Ohhiyaa! oh07 — URUTKAN: 1 juta nasi bungkus / uang Rp100 rb / galon ditumpuk. Format: urutkan · Alur: urut (tiga peringkat) · Jawaban: 2-1-3 (hasil oh_format.py oh07).
// uang 1 jt × ±0,1 mm = 100 m (perkiraan) · nasi 1 jt × ±5 cm = 50 km (asumsi) · galon 1 jt × ±50 cm = 500 km (Katadata). Urutan pendek→tinggi: uang(2) < nasi(1) < galon(3).
KEYWORDS = new Set(['uang', 'nasi', 'galon', 'monas', 'ohhiyaa', 'tinggi']);
window.EXTRA_SFX = [];
const COL = { uang: ['#6FBF73', '#3E8E5A'], nasi: ['#E9CFA0', '#B98B4E'], galon: ['#58B0FF', '#1E6EFF'] };
function tower(id, h, w = 0.6) {
  const G = build('tw-' + id, () => {
    const [c1, c2] = COL[id];
    const side = canvasTex('tw-side-' + id, 64, 128, (x, ww, hh) => {
      x.fillStyle = c1; x.fillRect(0, 0, ww, hh);
      for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? 'rgba(255,255,255,.5)' : c2 + '66'; x.fillRect(0, i * 8, ww, 3); }
    }, [1, 1]);
    const m = PLASTIK('#ffffff', { map: side, rough: 0.5, coat: 0.35 }), top = PLASTIK(c2, { rough: 0.5 });
    const B = mesh(new THREE.BoxGeometry(1, 1, 1), [m, m, top, m, m, m], { ol: 0.008 });
    const g2 = grp(B); g2.userData.B = B; g2.userData.side = side; return g2;
  });
  show(G); const hh = Math.max(0.002, h);
  G.userData.B.scale.set(w, hh, w); G.userData.B.position.y = hh / 2; G.userData.side.repeat.set(1, hh * 1.5);
  return G;
}
const T_NASI = 5.0, T_GALON = 8.5, T_UANG = 1.4;
function follow(h, cx = 0) {
  CAM.fov = 54; CAM.updateProjectionMatrix();
  CAM.position.set(cx + 1.2 + h * 0.08, 1.4 + h * 0.4, 4.6 + h * 1.15); CAM.lookAt(cx, 0.4 + h * 0.62, 0);
  SUN.target.position.set(0, 0, 0); SUN.position.copy(SUN_DIR).multiplyScalar(14);
}
function three(t) {                                   // tiga barang tampil acak: 1 nasi, 2 uang, 3 galon
  place(toy('nasi'), -1.3, 0, 0.3, 0.3, 2.3); place(toy('gepok'), 0.05, 0, 0.2, -0.2, 2.0); place(toy('galon'), 1.3, 0, 0.1, 0.2, 1.55);
}

function scene(t) {
  const k = beatOf(t);
  studio(['studio', 'mint', 'langit', 'ungu', 'angkasa', 'studio'][k]);
  if (k === 0) {                                   // hook: tiga barang
    three(t); muncul(toy('nasi'), t, 0.1); muncul(toy('gepok'), t, 0.3); muncul(toy('galon'), t, 0.5);
    ohi(t, { x: 0, z: -1.2, ry: 0, expr: 'mikir', s: 0.9 });
    shot(t, 0, CUT[1], [0, 2.4, 6.6], [0, 0.6, 0.2], { push: 0.12 });
    chip('1. NASI BUNGKUS', 540, 250, at('nasi'), { size: 62, bg: '#E9CFA0' });
    chip('2. UANG Rp100 RB', 540, 380, at('uang'), { size: 62, bg: '#6FBF73' });
    chip('3. GALON', 540, 510, at('galon'), { size: 62, bg: '#58B0FF' });
    chip('Mana paling tinggi?', 540, 680, at('mana'), { size: 66, bg: '#FF6FAE', fg: '#fff' });
  } else if (k === 1) {                            // URUTKAN
    three(t);
    ohi(t, { x: 0, z: -1.2, expr: 'senang', wave: t < at('Ketik'), s: 0.9 });
    shot(t, CUT[1], CUT[2], [0, 2.3, 6.4], [0, 0.6, 0.2], { push: 0.1 });
    tebak(at('Urutkan'), CUT[2] - 0.1, { y: 250, txt: 'URUTKAN!', opsi: ['1. Nasi bungkus', '2. Uang Rp100 ribu', '3. Galon'] });
    chip('dari yang PALING PENDEK', 540, 960, at('pendek'), { size: 54, bg: '#FFC93C' });
  } else if (k === 2) {                            // hitung #2: uang vs Monas
    const hu = ease(seg(t, at('Sejuta'), at('meter') + 0.2)) * 2.27;
    place(toy('monas'), -1.4, 0, 0, 0.4, 3.0 / 2.95); tower('uang', hu, 0.5).position.set(0.5, 0, 0);
    ohi(t, { x: 1.7, z: 1.0, ry: -0.3, expr: t > at('Lebih') ? 'kaget' : 'mikir', s: 0.55 });
    shot(t, CUT[2], CUT[3], [0, 1.9, 6.4], [-0.3, 1.2, 0], { push: 0.1 });
    angka('± 0,1 MM', 330, at('sepersepuluh'), { sub: 'tebal selembar (perkiraan)', col: '#3E8E5A', t1: at('Sejuta') - 0.1 });
    angka('± 100 METER', 330, at('seratus', 1), { sub: '1 juta lembar × 0,1 mm', col: '#6FBF73', size: 120 });
    chip('Monas 132 m', 540, 560, at('Monas'), { size: 56, bg: '#FFFFFF' });
  } else if (k === 3) {                            // hitung nasi lalu galon
    const tg = at('Galon', 1) - 0.1;
    if (t < tg) {
      const h = hOf(t, [[at('Sejuta', 1), 0], [at('kilometer'), T_NASI]]);
      place(toy('pesawat'), 1.9, 2.4, 0.3, -0.6, 2.2);
      tower('nasi', h, 0.6).position.set(0, 0, 0);
      ohi(t, { x: -1.0, z: 0.9, ry: 0.4, expr: 'kaget', s: 0.45 });
      follow(Math.max(h, 0.4)); garisCepat(at('Sejuta', 1), tg);
      tangga([{ label: '1 nasi bungkus', sub: '±5 cm', t: CUT[3] + 0.1 }, { label: 'Pesawat', sub: '±11 km', t: at('pesawat') }, { label: '1 juta nasi', sub: '±50 km', t: at('kilometer') }], { t1: tg });
    } else {
      const h = hOf(t, [[at('Sejuta', 2), 0], [at('kilometer', 1), T_GALON]]);
      tower('nasi', T_NASI, 0.6).position.set(-1.7, 0, 0);
      place(toy('satelit'), 1.9, 7.3, 0.3, 0.3, 3.0);
      tower('galon', h, 0.6).position.set(0, 0, 0);
      ohi(t, { x: 1.0, z: 0.9, ry: -0.4, expr: 'kaget', s: 0.45 });
      follow(Math.max(h, 0.4), -0.5); garisCepat(at('Sejuta', 2), CUT[4] - 0.2);
      tangga([{ label: '1 galon', sub: '±50 cm', t: tg }, { label: 'Stasiun angkasa', sub: '±408 km', t: at('stasiun') }, { label: '1 juta galon', sub: '±500 km', t: at('kilometer', 1) }], { t1: CUT[4] });
    }
    chip('Ilustrasi skala', 540, 1640, CUT[3] + 0.2, { size: 40, bg: '#FFFFFF' });
  } else if (k === 4) {                            // OHHIYAA! podium 2-1-3
    tower('uang', T_UANG, 0.9).position.set(-1.9, 0, 0); tower('nasi', T_NASI, 0.9).position.set(0, 0, 0); tower('galon', T_GALON, 0.9).position.set(1.9, 0, 0);
    ohi(t, { x: 0, z: 6.5, ry: 0, expr: 'kaget', s: 1.4, jump: t > at('Ohhiyaa') - 0.2 });
    shot(t, CUT[4], CUT[5], [0, 5.5, 22], [0, 4.4, 0], { eye2: [0, 5.0, 20], target2: [0, 4.4, 0] });
    chip('Urutan: 2 – 1 – 3', 540, 170, at('Urutan'), { size: 66, bg: '#7EE8CF', t1: at('Ohhiyaa') - 0.1 });
    chip('2. UANG · 100 m', 540, 290, at('dua'), { size: 52, bg: '#6FBF73', t1: at('Ohhiyaa') - 0.1 });
    chip('1. NASI · 50 km', 540, 390, at('satu', 3), { size: 52, bg: '#E9CFA0', t1: at('Ohhiyaa') - 0.1 });
    chip('3. GALON · 500 km', 540, 490, at('tiga'), { size: 52, bg: '#58B0FF', t1: at('Ohhiyaa') - 0.1 });
    ohhiyaa(at('Ohhiyaa'), { y: 900 });
    chip('Ilustrasi skala', 540, 1640, CUT[4] + 0.2, { size: 40, bg: '#FFFFFF' });
  } else {                                         // personal + loop
    place(toy('monas'), -1.5, 0, 0, 0.4, 1.0); place(toy('galon'), 1.4, 0, 0.3, -0.3, 1.5); muncul(toy('galon'), t, CUT[5] + 0.3);
    ohi(t, { x: 0, z: 1.2, ry: 0, expr: t > at('tanya') ? 'mikir' : 'kaget', s: 0.8, point: t > at('menembus') });
    shot(t, CUT[5], DURATION, [0, 1.9, 6.6], [0, 0.9, 0.2], { push: 0.1 });
    angka('Rp100 MILIAR', 330, at('Seratus', 2), { sub: '1 juta lembar × Rp100.000', col: '#6FBF73', size: 120, t1: at('Jadi') - 0.1 });
    chip('Mana paling tinggi?', 540, 540, at('mana', 1), { size: 80, bg: '#FF6FAE', fg: '#fff' });
  }
}
function hOf(t, pts) { if (t <= pts[0][0]) return pts[0][1]; for (let i = 0; i < pts.length - 1; i++) if (t < pts[i + 1][0]) return lerp(pts[i][1], pts[i + 1][1], ease(seg(t, pts[i][0], pts[i + 1][0]))); return pts[pts.length - 1][1]; }
