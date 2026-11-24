// Ohhiyaa! oh12 — BENAR/BOHONG: "tempe sehari se-Indonesia ditumpuk cuma setinggi Semeru". Format: benar-bohong · Alur: tangga · Jawaban: BOHONG (hasil oh_format.py oh12).
// 0,102 kg/kapita/minggu (Susenas BPS) × 281,6 juta ÷ 7 = ±4.103 ton/hari ÷ 250 g = ±16,4 juta papan × 2 cm = ±328 km (≈ 89× Semeru 3.676 m).
// Tangga: Borobudur 35,4 m · Semeru 3.676 m · Everest 8.849 m · garis Kármán 100 km. Skala visual TIDAK linier (seperti oh09) → chip 'Ilustrasi skala'.
KEYWORDS = new Set(['tempe', 'semeru', 'bohong', 'benar', 'ohhiyaa', 'kilometer', 'everest', 'borobudur']);
window.EXTRA_SFX = [];
TOY.tempe = () => {
  const tex = canvasTex('tempe-atas', 256, 160, (x, w, h) => {
    x.fillStyle = '#EAD9AE'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { x.fillStyle = i % 3 ? 'rgba(170,128,58,.8)' : 'rgba(120,84,30,.7)'; x.beginPath(); x.ellipse(rnd(i) * w, rnd(i + 7) * h, 5 + rnd(i + 3) * 5, 3 + rnd(i + 5) * 3, rnd(i + 9) * 3, 0, 7); x.fill(); }
  });
  const side = PLASTIK('#D9C08A', { rough: 0.8 }), top = PLASTIK('#ffffff', { map: tex, rough: 0.8 });
  const b = box(0.8, 0.12, 0.5, [side, side, top, side, side, side], { ol: 0.006 }); b.position.y = 0.06; return grp(b);
};
TOY.borobudur = () => {   // candi berundak + stupa puncak, tinggi ±1 unit pada skala 1
  const G = new THREE.Group(), c = PLASTIK('#8E8A82', { rough: 0.8, flat: true });
  [[1.6, 0.14], [1.38, 0.14], [1.16, 0.13], [0.96, 0.13], [0.78, 0.12], [0.6, 0.1]].reduce((y, [w, h]) => { const s = box(w, h, w, c, { ol: 0.008 }); s.position.y = y + h / 2; G.add(s); return y + h; }, 0);
  const st = sph(0.13, c, { ol: 0.006 }, 16, 10); st.position.y = 0.86; st.scale.y = 0.8;
  const ch = cone(0.05, 0.16, c, { ol: 0.004 }, 8); ch.position.y = 1.0; G.add(st, ch); return G;
};
const HG = [[0, 0], [35.4, 1.4], [3676, 4.4], [8849, 6.8], [100000, 10.5], [328000, 14.5]];
const vis = m => { for (let i = 0; i < HG.length - 1; i++) if (m < HG[i + 1][0]) return lerp(HG[i][1], HG[i + 1][1], (m - HG[i][0]) / (HG[i + 1][0] - HG[i][0])); return 14.5; };
const RISE = () => [[CUT[3], 0], [at('Borobudur'), 35.4], [at('Semeru', 1), 3676], [at('Everest'), 8849], [at('angkasa'), 100000], [CUT[4], 180000]];
const tower = m => towerOf('tempe', vis(m), { w: 0.85, c1: '#F3E7C9', c2: '#B9965A' });
function landmark(t) {
  place(toy('borobudur'), -1.6, 0, -0.6, 0.3, 1.4);
  place(toy('gunung', 'semeru'), -3.2, 0, -4.0, 0.2, 4.4 / 1.4);
  place(toy('gunung', 'everest'), 4.0, 0, -7.5, -0.2, 6.8 / 1.4);
  const R = build('karman', () => { const r = torus(3.2, 0.05, PLASTIK('#7EE8CF', { emissive: 0x3fd0b0, ei: 0.6 }), Math.PI * 2, {}); r.rotation.x = Math.PI / 2; return grp(r); });
  show(R); R.position.set(0, 10.5, 0); R.rotation.y = t * 0.2;
}

function scene(t) {
  const k = beatOf(t);
  studio(['studio', 'mint', 'langit', 'langit', 'angkasa', 'studio'][k]);
  if (k === 0) {                                   // hook: klaim
    const P = toy('tempe'); place(P, 0.3, 0, 0.6, 0.3, 1.7); muncul(P, t, 0.1);
    place(toy('gunung', 'semeru'), 1.3, 0, -1.4, 0.2, 1.1);
    ohi(t, { x: -1.2, z: 1.4, ry: 0.4, expr: 'mikir', s: 0.75 });
    shot(t, 0, CUT[1], [0, 2.0, 5.8], [0.2, 0.8, 0.2], { push: 0.15 });
    card(['KATANYA...', 'tempe sehari se-Indonesia', 'cuma setinggi Semeru'], 540, 380, 0.15, { size: 54, w: 900 });
  } else if (k === 1) {                            // BENAR / BOHONG
    place(toy('tempe'), -1.0, 0, 0.5, 0.4, 1.4); place(toy('gunung', 'semeru'), 1.4, 0, -1.0, 0.2, 1.0);
    ohi(t, { x: 0, z: -0.2, expr: 'mikir', s: 0.8 });
    shot(t, CUT[1], CUT[2], [0, 1.5, 4.5], [0, 0.8, 0], { push: 0.1 });
    tebak(at('Benar'), CUT[2] - 0.1, { y: 250, txt: 'BENAR / BOHONG?', opsi: ['BENAR', 'BOHONG'] });
  } else if (k === 2) {                            // satuan: 250 g, 2 cm, 4.100 ton/hari
    const ts = at('Sehari', 1);
    if (t < ts - 0.1) {
      place(toy('tempe'), 0, 0, 0, 0.2, 1.4); place(toy('penggaris'), 0, 0, 0.55, 0, 0.45);
      shot(t, CUT[2], ts, [0.2, 1.6, 3.6], [0, 0.1, 0.2], { push: 0.2 });
      angka('± 250 GRAM', 330, at('papan'), { sub: '1 papan tempe (perkiraan)', col: '#B9965A', t1: at('tebalnya') - 0.1 });
      angka('± 2 CM', 330, at('tebalnya'), { sub: 'tebal 1 papan', col: '#FF8A1F', t1: ts - 0.1 });
    } else {
      grow(stack('tempe', 36, { cols: 4, rows: 3, gap: 0.85, layer: 0.13 }), t, ts - 0.1, CUT[3] - 0.3, 0, 0, 1.0);
      shot(t, ts - 0.2, CUT[3], [0, 2.2, 4.8], [0, 0.3, 0], { eye2: [0.5, 3.0, 6.0], target2: [0, 0.3, 0] });
      angka('± 4.100 TON / HARI', 330, at('empat'), { sub: '0,102 kg/orang/minggu × 281,6 juta (BPS)', col: '#FF6FAE', size: 104 });
      chip('Ilustrasi skala', 540, 1640, ts, { size: 40, bg: '#FFFFFF' });
    }
  } else if (k === 3) {                            // tangga: Borobudur → Semeru → Everest → garis Kármán
    landmark(t);
    const h = vis(hOf(t, RISE())); tower(hOf(t, RISE())).position.set(0, 0, 0);
    ohi(t, { x: -0.95, z: 0.8, ry: 0.4, expr: 'kaget', s: 0.45 });
    garisCepat(CUT[3] + 0.4, CUT[4] - 0.2); follow(h);
    tangga([{ label: '1 papan', sub: '±2 cm', t: CUT[3] + 0.1 }, { label: 'Borobudur', sub: '35,4 m', t: at('Borobudur') }, { label: 'Semeru', sub: '3.676 m', t: at('Semeru', 1) }, { label: 'Everest', sub: '8.849 m', t: at('Everest') }, { label: 'Batas angkasa', sub: '100 km', t: at('angkasa') }], { t1: CUT[4] });
    chip('Ilustrasi skala', 540, 1640, CUT[3] + 0.2, { size: 40, bg: '#FFFFFF' });
  } else if (k === 4) {                            // BOHONG! ±328 km → OHHIYAA!
    landmark(t);
    const m = hOf(t, [[CUT[4], 180000], [at('tiga') + 0.6, 328000]]); tower(m).position.set(0, 0, 0);
    ohi(t, { x: 5.2, z: 8, ry: -0.6, expr: 'kaget', s: 2.6, jump: t > at('Ohhiyaa') - 0.2 });
    const up = seg(t, CUT[4], at('tiga') + 0.6);
    shot(t, CUT[4], CUT[5], [0, 6 + up * 4, 24 + up * 6], [0, 5 + up * 5, 0], { eye2: [0, 11, 30], target2: [0, 10, 0] });
    jawab(at('bohong', 1), 'Jawaban: BOHONG!', { col: '#FF6FAE' });
    angka('± 328 KM', 330, at('tiga'), { sub: '16,4 juta papan × 2 cm', col: '#FF6FAE', t1: at('Ohhiyaa') - 0.1 });
    chip('≈ 89× Gunung Semeru', 540, 560, at('sembilan'), { size: 60, bg: '#FFC93C', t1: at('Ohhiyaa') - 0.1 });
    ohhiyaa(at('Ohhiyaa'), { y: 860 });
  } else {                                         // personal + loop
    const P = toy('tempe'); place(P, 0.9, 0, 0.7, -0.4, 2.0); muncul(P, t, CUT[5] + 0.3);
    ohi(t, { x: -0.7, z: 0.8, ry: 0.2, expr: t > at('Jadi') ? 'mikir' : 'senang', s: 0.85, point: t > at('Jadi') });
    shot(t, CUT[5], DURATION, [0, 1.6, 5.6], [0, 0.7, 0.2], { push: 0.1 });
    angka('16,4 JUTA PAPAN', 330, at('enam'), { sub: 'tempe sehari se-Indonesia', col: '#B9965A', size: 110, t1: at('Jadi') - 0.1 });
    chip('Benar atau bohong?', 540, 520, at('benar', 1), { size: 84, bg: '#FF6FAE', fg: '#fff' });
  }
}
