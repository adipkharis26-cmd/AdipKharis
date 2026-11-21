// Ohhiyaa! oh10 — mi instan SEMENIT se-Indonesia ditumpuk. Format: abc · Alur: hasil-dulu · Jawaban: B (hasil oh_format.py oh10).
// WINA 2024: 14,68 miliar porsi/th ÷ 525.600 menit = ±27.930 bungkus/menit × ±3 cm = ±838 m (Eiffel 330 m ×2,5).
// 3 menit = ±2.514 m > Gunung Bromo 2.329 mdpl. Skala toy: 1 unit = 50 m. Memakai ohlib.js (hOf, towerOf, follow).
KEYWORDS = new Set(['mi', 'instan', 'eiffel', 'bromo', 'ohhiyaa', 'bungkus', 'meter']);
window.EXTRA_SFX = [];
const U = 50, TOP = 838 / U, TOP3 = 2514 / U, EIF = 330 / U, BROMO = 2329 / U;
// bungkus mi instan mainan (generik, tanpa merek): bantal plastik oranye, gambar mangkuk + tulisan "MI"
TOY.mi = () => {
  const tex = canvasTex('mi-bungkus', 256, 180, (x, w, h) => {
    x.fillStyle = '#FF8A1F'; x.fillRect(0, 0, w, h); x.fillStyle = '#FFD84A'; x.fillRect(0, h - 46, w, 46);
    x.fillStyle = '#FFFFFF'; x.beginPath(); x.ellipse(170, 92, 62, 30, 0, 0, Math.PI); x.fill();
    x.strokeStyle = '#F6E3A0'; x.lineWidth = 5; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(122 + i * 20, 92); x.quadraticCurveTo(132 + i * 20, 62, 142 + i * 20, 92); x.stroke(); }
    x.fillStyle = '#FFFFFF'; x.font = '900 70px Nunito'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('MI', 62, 70);
    x.fillStyle = '#D33A2C'; x.font = '900 26px Nunito'; x.fillText('INSTAN', 128, h - 22);
  });
  const side = PLASTIK('#FF8A1F', { rough: 0.35, coat: 0.6 }), top = PLASTIK('#ffffff', { map: tex, rough: 0.35, coat: 0.6 });
  const b = box(0.6, 0.1, 0.42, [side, side, top, side, side, side], { ol: 0.006 }); b.position.y = 0.05;
  const s1 = box(0.62, 0.02, 0.05, PLASTIK('#E9701A'), {}); s1.position.set(0, 0.05, 0.22);
  const s2 = s1.clone(); s2.position.z = -0.22; return grp(b, s1, s2);
};
// Menara Eiffel mainan (tinggi 2 unit pada skala 1): kaki melengkung = kerucut bersisi 4, lalu menara atas + antena
TOY.eiffel = () => {
  const G = new THREE.Group(), c = PLASTIK('#B0764A', { rough: 0.5 });
  const kaki = cone(0.42, 0.75, c, { ol: 0.01 }, 4); kaki.position.y = 0.375; kaki.rotation.y = Math.PI / 4;
  const lantai = box(0.46, 0.05, 0.46, PLASTIK('#8A5634'), { ol: 0.006 }); lantai.position.y = 0.55;
  const atas = cone(0.17, 1.05, c, { ol: 0.008 }, 4); atas.position.y = 1.2; atas.rotation.y = Math.PI / 4;
  const ant = cyl(0.015, 0.015, 0.3, '#DDD'); ant.position.y = 1.85;
  G.add(kaki, lantai, atas, ant); return G;
};
const RISE1 = () => [[at('ditumpuk') - 0.1, 0], [at('Eiffel'), EIF * 1.05], [at('Ohhiyaa') - 0.3, TOP]];
const RISE2 = () => [[CUT[3], 0], [at('Ditumpuk', 1), 1], [at('Eiffel', 1), EIF * 1.05], [at('meter') + 0.3, TOP]];
const mi = h => towerOf('mi', h, { w: 0.6, c1: '#FF9A3C', c2: '#C84E10' });
function patok(t) { place(toy('eiffel'), -2.6, 0, -4.5, 0.3, EIF / 2); }

function scene(t) {
  const k = beatOf(t);
  studio(['studio', 'mint', 'studio', 'langit', 'langit', 'studio'][k]);
  if (k === 0) {                                   // HASIL DULU: menara mi semenit menembus Eiffel → OHHIYAA!
    if (t < at('ditumpuk') - 0.1) {
      const G = toy('mi'); place(G, 0.6, 0, 0.3, -0.4, 1.8); muncul(G, t, 0.1);
      ohi(t, { x: -0.9, z: 1.1, ry: 0.45, expr: 'mikir', s: 0.85 });
      shot(t, 0, at('ditumpuk'), [0.3, 1.9, 5.0], [0, 0.5, 0.3], { push: 0.15 });
      chip('Mi instan se-Indonesia', 540, 250, 0.05, { size: 78, bg: '#FFC93C' });
      chip('cuma SATU MENIT...', 540, 400, at('menit'), { size: 86, bg: '#FFFFFF' });
    } else {
      patok(t); const h = hOf(t, RISE1()); mi(h).position.set(0, 0, 0);
      ohi(t, { x: -0.95, z: 0.8, ry: 0.4, expr: 'kaget', s: 0.45 });
      follow(h); garisCepat(at('ditumpuk'), at('Ohhiyaa'));
      chip('Lewat Menara Eiffel!', 540, 330, at('Eiffel'), { size: 64, bg: '#7EE8CF' });
      angka('± 840 M', 560, at('Eiffel') + 0.3, { sub: 'tumpukan mi 1 menit', col: '#FF6FAE', size: 130, t1: at('Ohhiyaa') + 1.0 });
      ohhiyaa(at('Ohhiyaa'), { y: 800 });
      chip('Ilustrasi skala', 540, 1640, at('ditumpuk'), { size: 40, bg: '#FFFFFF' });
    }
  } else if (k === 1) {                            // TEBAK A/B/C: berapa bungkus semenit?
    place(toy('mi'), 0.9, 0, 0.3, -0.3, 1.5);
    ohi(t, { x: -0.3, z: -0.3, expr: 'senang', wave: t < at('berapa'), s: 0.8 });
    shot(t, CUT[1], CUT[2], [0, 1.3, 3.9], [0, 0.8, 0], { push: 0.1 });
    chip('Tapi kok bisa?', 540, 200, CUT[1] + 0.1, { size: 84, bg: '#FFC93C', t1: at('berapa') - 0.1 });
    tebak(at('berapa'), CUT[2] - 0.1, { y: 250, txt: 'SEMENIT BERAPA BUNGKUS?', opsi: ['A. 2.800', 'B. 28.000', 'C. 280.000'] });
  } else if (k === 2) {                            // satuan: ±3 cm per bungkus, 14,7 miliar setahun
    const ts = at('Setahun');
    if (t < ts - 0.1) {
      place(toy('mi'), 0, 0, 0, 0.3, 2.0); place(toy('penggaris'), 0, 0, 0.75, 0, 0.5);
      shot(t, CUT[2], ts, [0.2, 1.1, 3.6], [0, 0.3, 0.2], { push: 0.2 });
      angka('± 3 CM', 330, at('tebalnya'), { sub: 'tebal 1 bungkus (perkiraan)', col: '#FF8A1F', t1: ts - 0.1 });
    } else {
      grow(stack('mi', 36, { cols: 6, rows: 3, gap: 0.68, layer: 0.11 }), t, ts - 0.1, CUT[3] - 0.3, 0, 0, 1.0);
      shot(t, ts - 0.2, CUT[3], [0, 2.6, 6.0], [0, 0.3, 0], { eye2: [0.5, 3.6, 7.5], target2: [0, 0.3, 0] });
      angka('14,7 MILIAR', 330, at('empat'), { sub: 'porsi mi instan setahun (WINA 2024)', col: '#FF6FAE', size: 130 });
      chip('Ilustrasi skala', 540, 1640, ts, { size: 40, bg: '#FFFFFF' });
    }
  } else if (k === 3) {                            // bongkar: ÷ menit setahun → jawaban B → menara lewat Eiffel
    patok(t); const h = hOf(t, RISE2()); mi(h).position.set(0, 0, 0);
    ohi(t, { x: -0.95, z: 0.8, ry: 0.4, expr: 'kaget', s: 0.45 });
    garisCepat(at('Ditumpuk', 1), CUT[4] - 0.2); follow(h);
    angka('÷ 525.600 MENIT', 330, CUT[3] + 0.1, { sub: '365 × 24 × 60', col: '#FFC93C', size: 96, t1: at('Ditumpuk', 1) - 0.1 });
    jawab(at('Jawabannya'), 'Jawaban: B — ±27.900 bungkus/menit', { size: 50 });
    tangga([{ label: '1 bungkus', sub: '±3 cm', t: at('Ditumpuk', 1) }, { label: 'Menara Eiffel', sub: '330 m', t: at('Eiffel', 1) }, { label: '1 menit mi', sub: '±840 m', t: at('meter') }], { t1: CUT[4] });
  } else if (k === 4) {                            // twist: 3 menit lewat Gunung Bromo (tanpa OHHIYAA! kedua)
    place(toy('gunung'), 9, 0, -22, 0.4, BROMO / 1.4); patok(t);
    const h = hOf(t, [[CUT[4], TOP], [at('Bromo') + 0.2, TOP3]]); mi(h).position.set(0, 0, 0);
    ohi(t, { x: 3.0, z: 14, ry: -0.3, expr: 'kaget', s: 6.0 });
    shot(t, CUT[4], CUT[5], [0, 22, 75], [0, 22, -6], { eye2: [4, 30, 90], target2: [0, 26, -8] });
    angka('3 MENIT = ± 2,5 KM', 330, at('Tiga', 1), { sub: 'Gunung Bromo: 2.329 mdpl', col: '#1E6EFF', size: 100 });
    chip('Ilustrasi skala', 540, 1640, CUT[4] + 0.2, { size: 40, bg: '#FFFFFF' });
  } else {                                         // personal + loop
    const G = toy('mi'); place(G, 1.0, 0, 0.7, -0.4, 1.9); muncul(G, t, CUT[5] + 0.3);
    ohi(t, { x: -0.5, z: 0.7, ry: 0.15, expr: t > at('Bayangkan') ? 'mikir' : 'senang', s: 0.9, point: t < at('Bayangkan') });
    shot(t, CUT[5], DURATION, [0, 1.6, 6.0], [0, 0.7, 0.2], { push: 0.1 });
    angka('20 RIBU+ BUNGKUS', 330, at('video'), { sub: 'habis selama video ini', col: '#FF6FAE', size: 104, t1: at('Bayangkan') - 0.1 });
    chip('Satu menit saja...', 540, 520, at('Bayangkan'), { size: 84, bg: '#FFC93C' });
  }
}
