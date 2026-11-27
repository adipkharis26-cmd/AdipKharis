// Ohhiyaa! oh14 — URUTKAN: 1 juta e-KTP / koin Rp1.000 / bata merah ditumpuk. Format: urutkan · Alur: urut · Jawaban: 1-2-3 (hasil oh_format.py oh14).
// e-KTP ID-1 0,76 mm (ISO/IEC 7810) → 760 m · koin Rp1.000 TE 2016 1,45 mm (BI) → 1.450 m · bata merah SNI 15-2094-2000 M-5a 65 mm → 65 km (garis Kármán 100 km).
// Skala visual TIDAK linier (menara pendek vs 65 km) → chip 'Ilustrasi skala'. Memakai ohlib.js (hOf, towerOf, follow).
KEYWORDS = new Set(['e-ktp', 'ktp', 'koin', 'bata', 'ohhiyaa', 'tinggi', 'burj', 'khalifa', 'kilometer']);
window.EXTRA_SFX = [];
TOY.ektp = () => {
  const tex = canvasTex('ektp-top', 256, 160, (x, w, h) => {
    x.fillStyle = '#4C7BE0'; x.fillRect(0, 0, w, h); x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, w, 30);
    x.fillStyle = '#E8454E'; x.fillRect(0, 30, w, 6);
    x.fillStyle = '#F2C866'; x.fillRect(22, 62, 46, 36); x.strokeStyle = '#B98B4E'; x.lineWidth = 3; x.strokeRect(22, 62, 46, 36);
    x.fillStyle = '#FFFFFF'; x.font = '900 34px Nunito'; x.textBaseline = 'middle'; x.fillText('e-KTP', 90, 84);
    x.fillStyle = 'rgba(255,255,255,.55)'; x.fillRect(22, 118, 150, 8); x.fillRect(22, 134, 110, 8);
    x.fillStyle = '#D6E2FF'; x.fillRect(188, 62, 52, 70);
  });
  const side = PLASTIK('#E8EEFF', { rough: 0.4, coat: 0.5 }), top = PLASTIK('#ffffff', { map: tex, rough: 0.35, coat: 0.6 });
  const b = box(0.86, 0.04, 0.54, [side, side, top, side, side, side], { ol: 0.006 }); b.position.y = 0.02; return grp(b);
};
TOY.koin = () => {
  const g = new THREE.Group(), s = PLASTIK('#CFD3DC', { metal: 0.5, rough: 0.3, coat: 0.5 }), gd = PLASTIK('#F2C866', { metal: 0.5, rough: 0.3 });
  const c = cyl(0.22, 0.22, 0.05, s, { ol: 0.007 }, 32); c.position.y = 0.025;
  const r = cyl(0.11, 0.11, 0.056, gd, {}, 28); r.position.y = 0.026; g.add(c, r); return g;
};
TOY.bata = () => {
  const tex = canvasTex('bata-top', 128, 64, (x, w, h) => {
    x.fillStyle = '#C9553A'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { x.fillStyle = i % 2 ? 'rgba(120,40,20,.35)' : 'rgba(240,150,110,.3)'; x.fillRect(rnd(i) * w, rnd(i + 4) * h, 6 + rnd(i + 2) * 10, 3); }
  });
  const s = PLASTIK('#B94A30', { rough: 0.9 }), top = PLASTIK('#ffffff', { map: tex, rough: 0.9 });
  const b = box(0.76, 0.3, 0.38, [s, s, top, s, s, s], { ol: 0.008 }); b.position.y = 0.15; return grp(b);
};
const TC = { ktp: ['#DCE6FF', '#3E66C8'], koin: ['#E6E1CF', '#B9965A'], bata: ['#D9693F', '#8E3A1E'] };
const TH = { ktp: 2.0, koin: 3.4, bata: 10 };                      // tinggi visual (unit); nyata 760 m · 1.450 m · 65 km
const tw = (id, h, x, w = 0.6) => { towerOf(id, h, { w, c1: TC[id][0], c2: TC[id][1] }).position.set(x, 0, 0); };
function burj() { place(toy('pencakar', 'b'), -1.7, 0, -1.0, 0.2, 0.98); }
function karman(t) {
  const R = build('karman', () => { const r = torus(3.4, 0.05, PLASTIK('#7EE8CF', { emissive: 0x3fd0b0, ei: 0.6 }), Math.PI * 2, {}); r.rotation.x = Math.PI / 2; return grp(r); });
  show(R); R.position.set(0, 15.4, 0); R.rotation.y = t * 0.2;
}
function three() {                                    // urutan tampil: 1 e-KTP, 2 koin, 3 bata
  place(toy('ektp'), -1.2, 0, 0.3, 0.3, 1.15); place(toy('koin'), 0.05, 0, 0.25, 0, 2.1); place(toy('bata'), 1.2, 0, 0.2, -0.3, 1.0);
}

function scene(t) {
  const k = beatOf(t);
  studio(['studio', 'mint', 'langit', 'langit', 'angkasa', 'studio'][k]);
  if (k === 0) {                                   // hook: tiga barang
    three(); muncul(toy('ektp'), t, 0.1); muncul(toy('koin'), t, 2.4); muncul(toy('bata'), t, 4.6);
    ohi(t, { x: 0, z: -1.2, ry: 0, expr: 'mikir', s: 0.9 });
    shot(t, 0, CUT[1], [0, 2.4, 6.6], [0, 0.6, 0.2], { push: 0.12 });
    chip('1. e-KTP', 540, 250, at('e-ktp'), { size: 62, bg: '#8FB8FF' });
    chip('2. KOIN Rp1.000', 540, 380, at('koin'), { size: 62, bg: '#F2C866' });
    chip('3. BATA MERAH', 540, 510, at('bata'), { size: 62, bg: '#F09A7E' });
    chip('Mana paling tinggi?', 540, 680, at('mana'), { size: 66, bg: '#FF6FAE', fg: '#fff' });
  } else if (k === 1) {                            // URUTKAN
    three();
    ohi(t, { x: 0, z: -1.2, expr: 'senang', wave: t < at('ketik'), s: 0.9 });
    shot(t, CUT[1], CUT[2], [0, 2.3, 6.4], [0, 0.6, 0.2], { push: 0.1 });
    tebak(at('urutkan'), CUT[2] - 0.1, { y: 250, txt: 'URUTKAN!', opsi: ['1. e-KTP', '2. Koin Rp1.000', '3. Bata merah'] });
    chip('dari yang PALING PENDEK', 540, 960, at('pendek'), { size: 54, bg: '#FFC93C' });
  } else if (k === 2) {                            // hitung #1: e-KTP vs Burj Khalifa
    const tj = at('jadi') - 0.1;
    if (t < tj) {
      place(toy('ektp'), 0, 0, 0, 0.2, 2.0); place(toy('penggaris'), 0, 0, 0.55, 0, 0.45);
      shot(t, CUT[2], tj, [0.2, 1.4, 3.4], [0, 0.1, 0.2], { push: 0.2 });
      angka('± 0,76 MM', 330, at('tebalnya'), { sub: 'tebal 1 kartu (standar ID-1)', col: '#3E66C8', t1: tj - 0.1 });
    } else {
      const h = hOf(t, [[at('sejuta'), 0], [at('meter') + 0.2, TH.ktp]]);
      burj(); tw('ktp', h, 0);
      ohi(t, { x: -0.95, z: 0.9, ry: 0.4, expr: 'kaget', s: 0.45 });
      follow(Math.max(h, 0.4)); garisCepat(at('sejuta'), at('meter'));
      angka('± 760 METER', 330, at('tujuh'), { sub: '1 juta kartu × 0,76 mm', col: '#3E66C8', size: 116, t1: at('burj') - 0.1 });
      chip('Burj Khalifa 828 m', 540, 560, at('burj'), { size: 56, bg: '#FFFFFF' });
      chip('Ilustrasi skala', 540, 1640, tj, { size: 40, bg: '#FFFFFF' });
    }
  } else if (k === 3) {                            // hitung #2 koin, lalu #3 bata
    const tc = at('sejuta', 1) - 0.1, tb = at('bata', 1) - 0.1, tbt = at('sejuta', 2) - 0.1;
    if (t < tc) {
      place(toy('koin'), 0, 0, 0, 0, 2.8); place(toy('penggaris'), 0, 0, 0.6, 0, 0.45);
      shot(t, CUT[3], tc, [0.2, 1.3, 3.4], [0, 0.1, 0.2], { push: 0.2 });
      angka('± 1,45 MM', 330, at('satu', 3), { sub: 'tebal koin Rp1.000 (Bank Indonesia)', col: '#B9965A', t1: tc - 0.1 });
    } else if (t < tb) {
      const h = hOf(t, [[tc + 0.1, 0], [at('meter', 1) + 0.2, TH.koin]]);
      tw('ktp', TH.ktp, -1.2); tw('koin', h, 0);
      ohi(t, { x: 1.2, z: 0.9, ry: -0.4, expr: 'kaget', s: 0.45 });
      follow(Math.max(h, 0.4), -0.5); garisCepat(tc, at('meter', 1));
      angka('± 1.450 METER', 330, at('seribu'), { sub: '1 juta koin × 1,45 mm', col: '#B9965A', size: 112, t1: tb - 0.1 });
    } else if (t < tbt) {
      place(toy('bata'), 0, 0, 0, 0.3, 2.0); place(toy('penggaris'), 0, 0, 0.7, 0, 0.5);
      shot(t, tb, tbt, [0.2, 1.4, 3.6], [0, 0.2, 0.2], { push: 0.2 });
      angka('± 6,5 CM', 330, at('enam', 1), { sub: 'tebal bata merah (SNI modul M-5a)', col: '#8E3A1E', t1: tbt - 0.1 });
    } else {
      const h = hOf(t, [[tbt + 0.1, 0], [at('kilometer') + 0.2, TH.bata]]);
      tw('ktp', TH.ktp, -1.4); tw('koin', TH.koin, -0.5); tw('bata', h, 0.5); karman(t);
      ohi(t, { x: 2.4, z: 2.4, ry: -0.4, expr: 'kaget', s: 0.9 });
      follow(Math.max(h * 1.7, 0.6), -0.4); garisCepat(tbt, at('kilometer'));
      angka('± 65 KM', 330, at('enam', 2), { sub: '1 juta bata × 6,5 cm', col: '#8E3A1E', size: 130, t1: CUT[4] - 0.1 });
      chip('Batas angkasa 100 km', 540, 560, at('luar'), { size: 56, bg: '#7EE8CF' });
    }
    chip('Ilustrasi skala', 540, 1640, CUT[3] + 0.2, { size: 40, bg: '#FFFFFF' });
  } else if (k === 4) {                            // OHHIYAA! podium 1-2-3
    tw('ktp', TH.ktp, -2.0, 0.95); tw('koin', TH.koin, 0, 0.95); tw('bata', TH.bata, 2.0, 0.95); karman(t);
    ohi(t, { x: 0, z: 9, ry: 0, expr: 'kaget', s: 1.7, jump: t > at('ohhiyaa') - 0.2 });
    shot(t, CUT[4], CUT[5], [0, 6.5, 24], [0, 6.0, 0], { eye2: [0, 7.0, 22], target2: [0, 6.0, 0], fov: 56 });
    chip('Urutan: 1 – 2 – 3', 540, 170, at('urutan'), { size: 66, bg: '#7EE8CF', t1: at('ohhiyaa') - 0.1 });
    chip('1. e-KTP · 760 m', 540, 290, at('satu', 4), { size: 52, bg: '#8FB8FF', t1: at('ohhiyaa') - 0.1 });
    chip('2. KOIN · 1.450 m', 540, 390, at('dua'), { size: 52, bg: '#F2C866', t1: at('ohhiyaa') - 0.1 });
    chip('3. BATA · 65 km', 540, 490, at('tiga', 1), { size: 52, bg: '#F09A7E', t1: at('ohhiyaa') - 0.1 });
    ohhiyaa(at('ohhiyaa'), { y: 900 });
    chip('Ilustrasi skala', 540, 1640, CUT[4] + 0.2, { size: 40, bg: '#FFFFFF' });
  } else {                                         // personal + loop
    three(); muncul(toy('bata'), t, CUT[5] + 0.3);
    ohi(t, { x: 0, z: -1.2, ry: 0, expr: t > at('jadi', 1) ? 'mikir' : 'kaget', s: 0.9, point: t > at('jadi', 1) });
    shot(t, CUT[5], DURATION, [0, 2.4, 6.6], [0, 0.6, 0.2], { push: 0.1 });
    angka('< 1 KILOMETER', 330, at('belum'), { sub: 'sejuta e-KTP (± 760 m)', col: '#3E66C8', size: 110, t1: at('jadi', 1) - 0.1 });
    chip('Mana paling tinggi?', 540, 560, at('mana', 1), { size: 80, bg: '#FF6FAE', fg: '#fff' });
  }
}
