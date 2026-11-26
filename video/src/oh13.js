// Ohhiyaa! oh13 — kopi sehari se-Indonesia dituang ke kolam renang olimpiade. Format: tebak-angka · Alur: hasil-dulu (hasil oh_format.py oh13).
// USDA FAS 2025: 4,81 juta karung × 60 kg = 288,6 juta kg/th ÷ 365 = ±790,7 ton/hari ÷ 10 g = ±79 juta cangkir × 200 ml = ±15,8 juta L
// ÷ 2,5 juta L (kolam 50×25×2 m) = ±6,3 kolam/hari; setahun ±2.300 kolam. Visual: kolam mainan terisi kopi (bukan menara).
KEYWORDS = new Set(['kopi', 'kolam', 'cangkir', 'ohhiyaa', 'olimpiade', 'juta']);
window.EXTRA_SFX = [];
TOY.cangkir = () => {
  const G = new THREE.Group(), w = PLASTIK('#FFFFFF', { rough: 0.3, coat: 0.6 });
  const c = cyl(0.16, 0.12, 0.26, w, { ol: 0.008 }); c.position.y = 0.13;
  const k = cyl(0.145, 0.145, 0.01, PLASTIK('#5A3418', { rough: 0.2, coat: 0.8 })); k.position.y = 0.245;
  const h = torus(0.07, 0.018, w, Math.PI * 1.4, { ol: 0.004 }); h.position.set(0.17, 0.14, 0); h.rotation.z = -Math.PI * 0.7;
  const p = cyl(0.24, 0.22, 0.02, w, { ol: 0.006 }); p.position.y = 0.01;
  G.add(p, c, k, h); return G;
};
TOY.sendokKopi = () => { const c = PLASTIK('#C8CDD8', { metal: 0.5, rough: 0.3 }); const g1 = cyl(0.012, 0.012, 0.36, c, {}); g1.rotation.z = Math.PI / 2; g1.position.set(0.18, 0.02, 0); const b = sph(0.06, c, { ol: 0.004 }, 16, 10); b.scale.y = 0.4; b.position.y = 0.03; const k = sph(0.045, PLASTIK('#5A3418', { rough: 0.9 }), {}, 12, 8); k.scale.y = 0.5; k.position.y = 0.05; return grp(g1, b, k); };
TOY.karung = () => { const b = rbox(0.5, 0.36, 0.32, PLASTIK('#C9A774', { rough: 0.9 }), { ol: 0.007 }); b.position.y = 0.18; const s = box(0.3, 0.12, 0.005, PLASTIK('#5A3418'), {}); s.position.set(0, 0.2, 0.163); return grp(b, s); };
// kolam olimpiade mainan 2,0 × 1,0 (50 × 25 m), dinding ubin; isi kopi naik lewat userData.fill.scale.y
function kolamBuat(full) {
  const G = new THREE.Group(), tile = PLASTIK('#ffffff', { map: canvasTex('ubin', 64, 64, (x, w, h) => { x.fillStyle = '#E8F6FF'; x.fillRect(0, 0, w, h); x.strokeStyle = '#9ED3F2'; x.lineWidth = 3; x.strokeRect(0, 0, w, h); }, [8, 1]), rough: 0.4 });
  [[2.1, 0.28, 0.05, 0, 0.53], [2.1, 0.28, 0.05, 0, -0.53], [0.05, 0.28, 1.1, 1.03, 0], [0.05, 0.28, 1.1, -1.03, 0]].forEach(([w, h, d, x, z]) => { const m = box(w, h, d, tile, { ol: 0.006 }); m.position.set(x, 0.14, z); G.add(m); });
  const fl = box(2.0, 0.02, 1.0, PLASTIK('#BFE6FF'), {}); fl.position.y = 0.01; G.add(fl);
  const f = box(2.0, 1, 1.0, PLASTIK('#4A2810', { rough: 0.55, coat: 0.15 }), {}); f.scale.y = full ? 0.25 : 0.001; f.position.y = f.scale.y / 2; G.add(f); G.userData.fill = f;
  for (let i = 1; i < 4; i++) { const l = box(1.96, 0.014, 0.014, PLASTIK(i % 2 ? '#FF6FAE' : '#FFC93C'), {}); l.position.set(0, 0.27, -0.5 + i * 0.25); G.add(l); }
  return G;
}
TOY.kolam = () => kolamBuat(true);
TOY.kolamKosong = () => kolamBuat(false);
function isi(G, k) { const f = G.userData.fill; f.scale.y = Math.max(0.001, 0.25 * k); f.position.y = f.scale.y / 2; }
const POS6 = [[-1.15, -0.65], [1.15, -0.65], [-1.15, 0.65], [1.15, 0.65], [-1.15, 1.95], [1.15, 1.95]];

function scene(t) {
  const k = beatOf(t);
  studio(['studio', 'mint', 'studio', 'langit', 'langit', 'studio'][k]);
  if (k === 0) {                                   // HASIL DULU: cangkir → kolam terisi → 6 kolam → OHHIYAA!
    if (t < at('dituang') - 0.1) {
      const C = toy('cangkir'); place(C, 0.6, 0, 0.3, -0.4, 2.2); muncul(C, t, 0.1);
      ohi(t, { x: -0.9, z: 1.0, ry: 0.45, expr: 'mikir', s: 0.85 });
      shot(t, 0, at('dituang'), [0.3, 1.7, 4.6], [0, 0.4, 0.3], { push: 0.15 });
      chip('Kopi se-Indonesia', 540, 250, 0.05, { size: 84, bg: '#FFC93C' });
      chip('cuma SEHARI...', 540, 400, at('sehari'), { size: 86, bg: '#FFFFFF' });
    } else {
      const t6 = at('enam');
      POS6.forEach(([x, z], i) => { const P = toy('kolamKosong', 'h' + i); place(P, x, 0, z, 0, 1); isi(P, seg(t, (i ? t6 + 0.12 * i : at('dituang')), (i ? t6 + 0.12 * i + 0.5 : t6))); P.visible = i === 0 || t > t6 + 0.12 * i - 0.2; });
      place(toy('cangkir', 'h'), 0.9, 0.9 - seg(t, at('dituang'), t6) * 0.3, -1.4, -0.4, 2.6).rotation.z = 1.1 * seg(t, at('dituang'), at('dituang') + 0.5);
      ohi(t, { x: -2.1, z: 0.4, ry: 0.5, expr: t > at('kolam') ? 'kaget' : 'senang', s: 0.5 });
      const w = seg(t, t6 - 0.2, at('olimpiade'));
      shot(t, at('dituang') - 0.1, CUT[1], [0.3, 2.2 + w * 3.5, 3.6 + w * 3.5], [0, 0, -0.6 + w * 0.7], {});
      angka('± 6 KOLAM', 560, t6, { sub: 'kolam renang olimpiade', col: '#6B3A1A', size: 130, t1: at('Ohhiyaa') + 1.0 });
      ohhiyaa(at('Ohhiyaa'), { y: 820 });
      chip('Ilustrasi skala', 540, 1640, at('dituang'), { size: 40, bg: '#FFFFFF' });
    }
  } else if (k === 1) {                            // TEBAK ANGKA: berapa cangkir sehari?
    place(toy('cangkir'), 0.95, 0, 0.3, -0.3, 1.8);
    ohi(t, { x: -0.3, z: -0.3, expr: 'senang', wave: t < at('berapa'), s: 0.8 });
    shot(t, CUT[1], CUT[2], [0, 1.3, 3.9], [0, 0.8, 0], { push: 0.1 });
    chip('Tapi kok bisa?', 540, 200, CUT[1] + 0.1, { size: 84, bg: '#FFC93C', t1: at('Tebak') - 0.1 });
    tebak(at('Tebak'), CUT[2] - 0.1, { y: 250, txt: 'BERAPA CANGKIR SEHARI?', opsi: ['Tulis angkamu di komentar'] });
    chip('Petunjuk: antara 1 juta – 500 juta', 540, 880, at('berapa') + 0.3, { size: 46, bg: '#FFFFFF' });
  } else if (k === 2) {                            // satuan: 10 g bubuk, 200 ml air
    place(toy('cangkir'), 0, 0, 0, 0.3, 2.4); place(toy('sendokKopi'), 0.75, 0, 0.45, 0.6, 1.6);
    shot(t, CUT[2], CUT[3], [0.2, 1.2, 3.4], [0, 0.35, 0.2], { push: 0.2 });
    angka('± 10 GRAM', 330, at('sepuluh'), { sub: 'bubuk kopi per cangkir', col: '#6B3A1A', t1: at('dua') - 0.1 });
    angka('± 200 ML', 330, at('dua'), { sub: 'air per cangkir', col: '#1E6EFF' });
  } else if (k === 3) {                            // bongkar: 288,6 juta kg/th → ÷365 → 79 juta cangkir → kolam terisi lagi
    if (t < at('Bagi') - 0.1) {
      grow(stack('karung', 30, { cols: 6, rows: 2, gap: 0.6, layer: 0.38 }), t, CUT[3] + 0.1, at('Bagi') - 0.3, 0, 0, 1.0);
      shot(t, CUT[3], at('Bagi'), [0, 2.4, 5.2], [0, 0.4, 0], { push: 0.15 });
      angka('± 288 JUTA KG', 330, at('sembilan'), { sub: 'kopi setahun (USDA 2025: 4,81 jt karung × 60 kg)', col: '#6B3A1A', size: 112 });
      chip('Ilustrasi skala', 540, 1640, CUT[3] + 0.1, { size: 40, bg: '#FFFFFF' });
    } else {
      const P = toy('kolamKosong', 'b'); place(P, 0, 0, 0, 0, 1); isi(P, seg(t, at('tujuh'), CUT[4] - 0.3));
      grow(stack('cangkir', 24, { cols: 8, rows: 3, gap: 0.34, layer: 0.3 }), t, at('Bagi'), at('tujuh'), 0, 1.3, 0.8);
      shot(t, at('Bagi') - 0.1, CUT[4], [0.2, 2.6, 3.6], [0, 0, 0.3], { push: 0.1 });
      angka('÷ 365 HARI', 330, at('Bagi'), { sub: '±791 ton kopi per hari', col: '#FFC93C', size: 110, t1: at('tujuh') - 0.1 });
      angka('± 79 JUTA CANGKIR', 330, at('tujuh'), { sub: 'per hari (÷ 10 g)', col: '#FF6FAE', size: 108 });
    }
  } else if (k === 4) {                            // twist: setahun ±2.300 kolam (tanpa OHHIYAA! kedua)
    for (let i = 0; i < 48; i++) { const P = toy('kolam', 'y' + i); place(P, ((i % 8) - 3.5) * 2.3, 0, -Math.floor(i / 8) * 1.3, 0, 1); P.visible = t > CUT[4] + 0.05 * i; }
    shot(t, CUT[4], CUT[5], [0, 4, 6], [0, 0, -2], { eye2: [0, 11, 10], target2: [0, 0, -4], fov: 60 });
    angka('± 2.300 KOLAM', 330, at('ribu'), { sub: 'kopi setahun se-Indonesia', col: '#6B3A1A', size: 120 });
    chip('Ilustrasi skala', 540, 1640, CUT[4] + 0.2, { size: 40, bg: '#FFFFFF' });
  } else {                                         // personal + loop
    const C = toy('cangkir'); place(C, 1.0, 0, 0.7, -0.4, 2.2); muncul(C, t, CUT[5] + 0.3);
    ohi(t, { x: -0.5, z: 0.7, ry: 0.15, expr: t > at('pagi') ? 'senang' : 'mikir', s: 0.9, point: t > at('pagi') });
    shot(t, CUT[5], DURATION, [0, 1.6, 6.0], [0, 0.7, 0.2], { push: 0.1 });
    chip('Paling dekat? Ketik 🎯', 540, 250, at('Tebakan'), { size: 62, bg: '#FFC93C', t1: at('pagi') - 0.1 });
    angka('± 79 JUTA', 480, at('pagi'), { sub: 'cangkir sehari, termasuk punyamu', col: '#6B3A1A', size: 110 });
  }
}
