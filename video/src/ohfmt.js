// PREVIEW-ONLY mock scenes for every Ohhiyaa! v4 interaction format / alur (rows of 20 s: row = floor(t/20)). Not an episode.
KEYWORDS = new Set([]); window.EXTRA_SFX = [];
function label(B, txt) { chip(txt, 540, 1760, B, { size: 44, bg: '#FFFFFF' }); }
function hookToy(kind, s, x = 0.7) { const o = toy(kind); place(o, x, 0, 0.3, -0.4, s); return o; }
function scene(t) {
  NOCAP = true;
  const row = Math.floor(t / 20), B = row * 20, lt = t - B, T = x => B + x;
  const part = lt < 3 ? 0 : lt < 7.5 ? 1 : lt < 11 ? 2 : 3;
  studio(['studio', 'mint', 'langit', 'ungu'][part]);
  const std = (a, b) => shot(t, T(a), T(b), [0, 1.8, 5.6], [0, 0.7, 0.2], { push: 0.12 });
  if (row === 0) {                                              // ABC (jawaban acak: A)
    label(T(0.1), 'FORMAT: PILIH A / B / C');
    if (part === 0) { hookToy('galon', 1.6); ohi(t, { x: -0.9, z: 1.2, ry: 0.45, expr: 'mikir', s: 0.85 }); std(0, 3); chip('Berapa galon', 540, 250, T(0.1), { size: 96, bg: '#FFC93C' }); chip('setinggi Monas?', 540, 400, T(1), { size: 90, bg: '#FF6FAE', fg: '#fff' }); }
    else if (part === 1) { hookToy('monas', 0.6, 5); ohi(t, { x: 0, z: -0.4, expr: 'senang', wave: true, s: 0.8 }); std(3, 7.5); tebak(T(3.2), T(7.4), { y: 250, opsi: ['A. ± 270 galon', 'B. ± 900 galon', 'C. ± 90 galon'] }); }
    else if (part === 2) { grow(stack('galon', 24, { cols: 4, rows: 3, gap: 0.5, layer: 0.5 }), t, T(7.6), T(10.5), 0, 0, 1); shot(t, T(7.5), T(11), [0, 3.4, 6.5], [0, 0.9, 0]); angka('± 270 GALON', 330, T(7.7), { sub: '132 m ÷ ± 0,49 m', col: '#1E6EFF' }); chip('Ilustrasi skala', 540, 1640, T(7.7), { size: 40, bg: '#FFFFFF' }); }
    else { hookToy('monas', 0.7, 1.2); ohi(t, { x: -0.8, z: 1.0, ry: 0.3, expr: 'kaget', s: 1.1, jump: true }); std(11, 15); ohhiyaa(T(11.2), { y: 760 }); jawab(T(11.5), 'Jawaban: A'); }
  } else if (row === 1) {                                       // BENAR / BOHONG
    label(T(0.1), 'FORMAT: BENAR ATAU BOHONG?');
    if (part === 0) { hookToy('motor', 1.8, 0.9); ohi(t, { x: -0.9, z: 1.2, ry: 0.45, expr: 'mikir', s: 0.85 }); std(0, 3); card(['KATANYA...', 'semua motor RI dijejer', '= 1× keliling Bumi'], 540, 330, T(0.2), { size: 58, w: 860 }); }
    else if (part === 1) { hookToy('motor', 1.6, 5); ohi(t, { x: 0, z: -0.4, expr: 'mikir', s: 0.8 }); std(3, 7.5); tebak(T(3.2), T(7.4), { y: 250, txt: 'BENAR / BOHONG?', opsi: ['BENAR', 'BOHONG'] }); }
    else if (part === 2) { const B2 = toy('bumi'); place(B2, 0, 1.6, 0, t * 0.2, 1.8); shot(t, T(7.5), T(11), [0, 3.0, 8], [0, 1.6, 0]); angka('± 6,5 × KELILING BUMI', 330, T(7.7), { sub: 'bukan cuma 1×', col: '#FF6FAE', size: 110 }); }
    else { const B2 = toy('bumi'); place(B2, 0, 1.6, 0, t * 0.2, 1.8); ohi(t, { x: 2.8, z: 4.5, ry: -0.5, expr: 'kaget', s: 1.5, jump: true }); shot(t, T(11), T(15), [0, 3.4, 10], [0, 1.8, 0]); ohhiyaa(T(11.2), { y: 760 }); jawab(T(11.5), 'Jawaban: BOHONG!', { col: '#FF6FAE' }); }
  } else if (row === 2) {                                       // TEBAK ANGKA BEBAS
    label(T(0.1), 'FORMAT: TEBAK ANGKA BEBAS');
    if (part === 0) { hookToy('nasi', 3.2); ohi(t, { x: -0.9, z: 1.2, ry: 0.45, expr: 'mikir', s: 0.85 }); std(0, 3); chip('Berapa nasi bungkus', 540, 250, T(0.1), { size: 80, bg: '#FFC93C' }); chip('setinggi Monas?', 540, 400, T(1), { size: 90, bg: '#FF6FAE', fg: '#fff' }); }
    else if (part === 1) { hookToy('monas', 0.6, 5); ohi(t, { x: 0, z: -0.4, expr: 'senang', wave: true, s: 0.8 }); std(3, 7.5); tebak(T(3.2), T(7.4), { y: 250, txt: 'TEBAK ANGKANYA!', opsi: ['Tulis angkamu di komentar'] }); chip('Petunjuk: antara 100 – 5.000', 540, 880, T(5), { size: 52, bg: '#FFFFFF' }); }
    else if (part === 2) { grow(stack('nasi', 40, { cols: 8, rows: 5, gap: 0.5, layer: 0.4 }), t, T(7.6), T(10.5), 0, 0, 1); shot(t, T(7.5), T(11), [0, 3.4, 7.5], [0, 0.3, 0]); angka('± 2.640 BUNGKUS', 330, T(7.7), { sub: '132 m ÷ ± 5 cm', col: '#FF6FAE', size: 120 }); chip('Ilustrasi skala', 540, 1640, T(7.7), { size: 40, bg: '#FFFFFF' }); }
    else { hookToy('monas', 0.7, 1.2); ohi(t, { x: -0.8, z: 1.0, ry: 0.3, expr: 'kaget', s: 1.1, jump: true }); std(11, 15); ohhiyaa(T(11.2), { y: 760 }); jawab(T(11.5), 'Paling dekat? Ketik 🎯', { size: 60, col: '#FFC93C' }); }
  } else if (row === 3) {                                       // URUTKAN
    label(T(0.1), 'FORMAT: URUTKAN KECIL → BESAR');
    const three = (a, b, c, s3) => { place(toy('gunung'), a, 0, 0.2, 0.3, 1.1); place(toy('monas'), b, 0, 0.3, 0.4, 0.5); place(toy('pencakar'), c, 0, 0.1, -0.3, s3); };
    if (part === 0) { three(-1.5, 0, 1.5, 1.0); ohi(t, { x: 0, z: 1.8, ry: 0, expr: 'mikir', s: 0.7 }); std(0, 3); chip('Urutkan dari', 540, 250, T(0.1), { size: 90, bg: '#FFC93C' }); chip('PALING PENDEK!', 540, 400, T(1), { size: 90, bg: '#FF6FAE', fg: '#fff' }); }
    else if (part === 1) { three(-1.5, 0, 1.5, 1.0); ohi(t, { x: 0, z: 1.8, ry: 0, expr: 'senang', wave: true, s: 0.7 }); shot(t, T(3), T(7.5), [0, 2.0, 7], [0, 1.0, 0]); tebak(T(3.2), T(7.4), { y: 250, txt: 'URUTKAN!', opsi: ['1. Everest', '2. Monas', '3. Autograph Tower'] }); }
    else if (part === 2) { place(toy('monas'), -1.7, 0, 0.3, 0.4, 0.5); place(toy('pencakar'), 0, 0, 0.1, -0.3, 0.8); place(toy('gunung'), 1.8, 0, 0.2, 0.3, 1.5); shot(t, T(7.5), T(11), [0, 2.6, 8], [0, 1.0, 0]); chip('Monas · 132 m', 540, 330, T(7.7), { size: 64, bg: '#7EE8CF' }); chip('Autograph · 383 m', 540, 480, T(8.7), { size: 64, bg: '#FFC93C' }); chip('Everest · 8.849 m', 540, 630, T(9.7), { size: 64, bg: '#FF6FAE', fg: '#fff' }); }
    else { place(toy('monas'), -1.7, 0, 0.3, 0.4, 0.5); place(toy('pencakar'), 0, 0, 0.1, -0.3, 0.8); place(toy('gunung'), 1.8, 0, 0.2, 0.3, 1.5); ohi(t, { x: 0, z: 2.4, ry: 0, expr: 'kaget', s: 0.9, jump: true }); shot(t, T(11), T(15), [0, 2.6, 8], [0, 1.0, 0]); ohhiyaa(T(11.2), { y: 760 }); jawab(T(11.5), 'Urutan: 2 – 3 – 1', { size: 64 }); }
  } else if (row === 4) {                                       // KURANG / LEBIH
    label(T(0.1), 'FORMAT: KURANG ATAU LEBIH?');
    if (part === 0) { place(toy('monas'), 1.6, 0, 0.0, 0.4, 0.7); hookToy('nasi', 2.4, -0.4); ohi(t, { x: -1.0, z: 1.4, ry: 0.4, expr: 'mikir', s: 0.8 }); std(0, 3); chip('1.000 nasi bungkus', 540, 250, T(0.1), { size: 84, bg: '#FFC93C' }); chip('Ditumpuk...', 540, 400, T(1), { size: 84, bg: '#FFFFFF' }); }
    else if (part === 1) { place(toy('monas'), 1.6, 0, 0.0, 0.4, 0.7); ohi(t, { x: -0.6, z: 0.6, expr: 'senang', wave: true, s: 0.8 }); std(3, 7.5); tebak(T(3.2), T(7.4), { y: 250, txt: 'KURANG / LEBIH?', opsi: ['KURANG', 'LEBIH'] }); chip('dari tinggi Monas (132 m)', 540, 960, T(4.2), { size: 52, bg: '#7EE8CF' }); }
    else if (part === 2) { place(toy('monas'), 1.6, 0, 0.0, 0.4, 0.7); grow(stack('nasi', 12, { cols: 2, rows: 2, gap: 0.45, layer: 0.4 }), t, T(7.6), T(10), -0.8, 0, 1); shot(t, T(7.5), T(11), [0, 2.4, 7], [0.3, 1.0, 0]); angka('± 50 METER', 330, T(7.7), { sub: '1.000 × ± 5 cm', col: '#1E6EFF' }); }
    else { place(toy('monas'), 1.6, 0, 0.0, 0.4, 0.7); ohi(t, { x: -0.8, z: 1.4, ry: 0.4, expr: 'kaget', s: 1.0, jump: true }); std(11, 15); ohhiyaa(T(11.2), { y: 760 }); jawab(T(11.5), 'Jawaban: KURANG'); }
  } else if (row === 5) {                                       // ALUR HASIL DULU
    label(T(0.1), 'ALUR: HASIL DULU → "KOK BISA?"');
    if (part === 0) { const B2 = toy('bumi'); place(B2, 0, 1.8, -1, t * 0.2, 1.7); ohi(t, { x: 1.4, z: 2.5, ry: -0.3, expr: 'kaget', s: 1.2, jump: true }); shot(t, T(0), T(3), [0, 2.4, 8.5], [0, 1.8, 0]); angka('± 14.200 KM', 330, T(0.7), { sub: 'tumpukan nasi bungkus RI', col: '#FF6FAE', size: 120 }); ohhiyaa(T(1.0), { y: 760 }); chip('Lebih tinggi dari Bumi!', 540, 1640, T(1.2), { size: 60, bg: '#7EE8CF' }); }
    else if (part === 1) { hookToy('nasi', 3.2); ohi(t, { x: -0.9, z: 1.2, ry: 0.45, expr: 'mikir', s: 0.85 }); std(3, 7.5); chip('Tapi kok bisa?', 540, 220, T(3.1), { size: 90, bg: '#FFC93C' }); tebak(T(3.4), T(7.4), { y: 430, txt: 'TEBAK DULU!', opsi: ['Tulis: berapa orang?'] }); }
    else if (part === 2) { grow(stack('nasi', 40, { cols: 8, rows: 5, gap: 0.5, layer: 0.4 }), t, T(7.6), T(10.5), 0, 0, 1); shot(t, T(7.5), T(11), [0, 3.4, 7.5], [0, 0.3, 0]); angka('285 JUTA × 5 CM', 330, T(7.7), { sub: 'bongkar hitungan', col: '#1E6EFF', size: 110 }); }
    else { const B2 = toy('bumi'); place(B2, 0, 1.8, -1, t * 0.2, 1.7); ohi(t, { x: 1.4, z: 2.5, ry: -0.3, expr: 'senang', s: 1.1, point: true }); shot(t, T(11), T(15), [0, 2.4, 8.5], [0, 1.8, 0]); angka('1,1 × LEBAR BUMI', 330, T(11.2), { sub: 'twist: bukan cuma setinggi…', col: '#FFC93C', size: 100 }); }
  } else {                                                      // ALUR SALAH KAPRAH
    label(T(0.1), 'ALUR: SALAH KAPRAH (KLAIM vs FAKTA)');
    if (part === 0) { hookToy('motor', 1.8, 0.9); ohi(t, { x: -0.9, z: 1.2, ry: 0.45, expr: 'mikir', s: 0.85 }); std(0, 3); card(['YANG BEREDAR', '"Semua mobil lebih panjang', 'dari semua motor"'], 540, 330, T(0.2), { size: 56, w: 880 }); }
    else if (part === 1) { place(toy('motor'), -1.0, 0, 0.2, 0.9, 1.7); place(toy('mobil'), 1.0, 0, 0.0, 0.8, 1.05); ohi(t, { x: 0, z: 1.2, expr: 'mikir', s: 0.8 }); std(3, 7.5); tebak(T(3.2), T(7.4), { y: 250, txt: 'BENAR / BOHONG?', opsi: ['BENAR', 'BOHONG'] }); }
    else if (part === 2) { place(toy('penggaris'), 0, 0, 0.5, 0, 0.5); place(toy('motor'), -0.9, 0, 0, 0.9, 1.6); place(toy('mobil'), 0.9, 0, 0, 0.8, 1.05); shot(t, T(7.5), T(11), [0, 1.6, 4.6], [0, 0.4, 0]); chip('KLAIM: 1 mobil > 1 motor ✓', 540, 330, T(7.7), { size: 50, bg: '#FFFFFF' }); chip('tapi jumlahnya 7× lebih sedikit', 540, 480, T(8.8), { size: 50, bg: '#FFC93C' }); }
    else { ohi(t, { x: 0, z: 2.2, expr: 'kaget', s: 0.9, jump: true }); place(toy('motor'), -1.0, 0, 0.2, 0.9, 1.7); place(toy('mobil'), 1.0, 0, 0.0, 0.8, 1.05); std(11, 15); chip('KLAIM ✗', 360, 330, T(11.0), { size: 60, bg: '#FF4F5E', fg: '#fff' }); chip('FAKTA ✓', 720, 330, T(11.3), { size: 60, bg: '#7EE8CF' }); ohhiyaa(T(11.5), { y: 760 }); jawab(T(11.8), 'Motor 3× lebih panjang!', { size: 56 }); }
  }
}
TOY.mobil = () => { const G = new THREE.Group(), c = '#1E6EFF';
  [-0.36, 0.36].forEach(x => [-0.27, 0.27].forEach(z => { const w = cyl(0.11, 0.11, 0.09, PLASTIK('#24204A', { rough: 0.6 }), {}, 16); w.rotation.x = Math.PI / 2; w.position.set(x, 0.11, z); G.add(w); }));
  const b = rbox(1.15, 0.22, 0.5, PLASTIK(c), { ol: 0.006 }); b.position.set(0, 0.26, 0); const cab = rbox(0.6, 0.2, 0.44, PLASTIK('#DDF3FF', { rough: 0.2, coat: 0.6 }), { ol: 0.006 }); cab.position.set(-0.08, 0.46, 0); G.add(b, cab); return G; };
