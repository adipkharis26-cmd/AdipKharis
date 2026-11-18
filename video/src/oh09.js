// Ohhiyaa! oh09 — BENAR/BOHONG: "kertas dilipat 42× setebal sampai Bulan". Format: benar-bohong · Alur: tangga · Jawaban: BENAR (hasil oh_format.py oh09).
// 0,1 mm × 2^n: n=21 → 210 m (Monas 132) · n=27 → 13,4 km (pesawat ±11) · n=32 → 429 km (ISS ±408) · n=42 → 439.805 km (Bulan 384.400 km). Rekor lipatan nyata ±12 (Britney Gallivan, 2002, kertas ±1,2 km).
KEYWORDS = new Set(['kertas', 'bulan', 'lipatan', 'ohhiyaa', 'benar']);
window.EXTRA_SFX = [];
TOY.kertas = () => {
  const G = new THREE.Group();
  const s = rbox(0.9, 0.03, 0.64, PLASTIK('#FFFFFF', { rough: 0.7 }), { ol: 0.006 }); s.position.y = 0.015;
  for (let i = 0; i < 3; i++) { const l = box(0.62, 0.002, 0.02, PLASTIK('#9AA0B4'), {}); l.position.set(0, 0.032, -0.15 + i * 0.15); G.add(l); }
  G.add(s); return G;
};
const FOLD_PTS = () => [[CUT[3], 0], [at('Monas'), 21], [at('pesawat'), 27], [at('stasiun'), 32], [at('Bulan', 1), 42]];
const HGT = [[0, 0.05], [21, 2.6], [27, 5.6], [32, 9.0], [42, 15.5]];
function foldN(t) { const p = FOLD_PTS(); if (t <= p[0][0]) return 0; for (let i = 0; i < p.length - 1; i++) if (t < p[i + 1][0]) return lerp(p[i][1], p[i + 1][1], ease(seg(t, p[i][0], p[i + 1][0]))); return 42; }
function hOfN(n) { for (let i = 0; i < HGT.length - 1; i++) if (n < HGT[i + 1][0]) return lerp(HGT[i][1], HGT[i + 1][1], (n - HGT[i][0]) / (HGT[i + 1][0] - HGT[i][0])); return HGT[HGT.length - 1][1]; }
function tower(h, w = 0.7) {
  const G = build('tw-kertas', () => {
    const side = canvasTex('tw-side-kertas', 64, 128, (x, ww, hh) => {
      x.fillStyle = '#DDE4F6'; x.fillRect(0, 0, ww, hh);
      for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? 'rgba(90,104,160,.55)' : 'rgba(255,255,255,.8)'; x.fillRect(0, i * 8, ww, 3); }
    }, [1, 1]);
    const m = PLASTIK('#ffffff', { map: side, rough: 0.6, coat: 0.2 }), top = PLASTIK('#F3F4F8', { rough: 0.6 });
    const B = mesh(new THREE.BoxGeometry(1, 1, 1), [m, m, top, m, m, m], { ol: 0.008 });
    const g2 = grp(B); g2.userData.B = B; g2.userData.side = side; return g2;
  });
  show(G); const hh = Math.max(0.002, h);
  G.userData.B.scale.set(w, hh, w); G.userData.B.position.y = hh / 2; G.userData.side.repeat.set(1, hh * 1.5);
  return G;
}
function follow(h) {
  CAM.fov = 54; CAM.updateProjectionMatrix();
  CAM.position.set(1.2 + h * 0.08, 1.4 + h * 0.4, 4.6 + h * 1.15); CAM.lookAt(0, 0.4 + h * 0.62, 0);
  SUN.target.position.set(0, 0, 0); SUN.position.copy(SUN_DIR).multiplyScalar(14);
}
function landmark(t) {
  place(toy('monas'), -1.3, 0, -0.9, 0.5, 2.6 / 2.95);
  place(toy('pesawat'), 1.9, 5.6, 0.3, -0.6, 2.6);
  place(toy('satelit'), -1.8, 9.0, 0.3, 0.3, 3.2);
  place(toy('bulan'), 2.2, 15.5, -2, t * 0.1, 2.3);
}
function counter(t0, t1) {                           // penghitung "LIPATAN KE-N"
  ui(t => {
    if (t < t0 || t > t1) return;
    const n = Math.round(foldN(t)), k = back(seg(t, t0, t0 + 0.3));
    g.save(); g.translate(540, 1250); g.scale(k, k);
    g.font = `900 64px ${FONT}`; const txt = 'LIPATAN KE-' + n, w = g.measureText(txt).width + 80;
    rr(-w / 2 + 6, -50 + 8, w, 100, 50); g.fillStyle = OL; g.fill(); rr(-w / 2, -50, w, 100, 50); g.fillStyle = '#FFC93C'; g.fill(); g.lineWidth = 7; g.strokeStyle = OL; g.stroke();
    g.fillStyle = OL; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 3); g.restore();
  });
}

function scene(t) {
  const k = beatOf(t);
  studio(['studio', 'mint', 'langit', 'ungu', 'angkasa', 'studio'][k]);
  if (k === 0) {                                   // hook: klaim
    const P = toy('kertas'); place(P, -0.1, 0, 0.5, 0.4, 1.6); muncul(P, t, 0.1);
    place(toy('bulan'), 1.6, 1.5, -1.2, t * 0.15, 0.7);
    ohi(t, { x: -1.2, z: 1.4, ry: 0.4, expr: 'mikir', s: 0.75 });
    shot(t, 0, CUT[1], [0, 2.0, 5.8], [0.2, 0.8, 0.2], { push: 0.15 });
    card(['KATANYA...', 'kertas dilipat 42 kali', 'setebal itu sampai Bulan'], 540, 380, 0.15, { size: 54, w: 900 });
  } else if (k === 1) {                            // BENAR / BOHONG
    place(toy('kertas'), -1.0, 0, 0.5, 0.4, 1.3); place(toy('bulan'), 1.7, 1.0, -1.0, t * 0.15, 0.6);
    ohi(t, { x: 0, z: -0.2, expr: 'mikir', s: 0.8 });
    shot(t, CUT[1], CUT[2], [0, 1.5, 4.5], [0, 0.8, 0], { push: 0.1 });
    tebak(at('Benar'), CUT[2] - 0.1, { y: 250, txt: 'BENAR / BOHONG?', opsi: ['BENAR', 'BOHONG'] });
  } else if (k === 2) {                            // satuan: 0,1 mm, tiap lipat ×2
    const tx = at('Setiap');
    if (t < tx - 0.1) {
      place(toy('kertas'), 0, 0, 0, 0.2, 1.9); place(toy('penggaris'), 0, 0, 0.6, 0, 0.5);
      shot(t, CUT[2], tx, [0.2, 1.2, 3.6], [0, 0.3, 0.2], { push: 0.2 });
      angka('± 0,1 MM', 330, at('sepersepuluh'), { sub: 'tebal selembar kertas (perkiraan)', col: '#1E6EFF', t1: tx - 0.1 });
    } else {
      const h = 0.15 + 0.5 * seg(t, tx, at('lipat')), lv = Math.min(4, 1 + Math.floor(seg(t, tx, at('lipat')) * 4));
      tower(h, 0.8).position.set(0, 0, 0);
      shot(t, tx - 0.1, CUT[3], [0.3, 1.3, 3.6], [0, 0.4, 0], { push: 0.15 });
      [['× 2', 0], ['× 2', 0.5], ['× 2', 1.0]].forEach(([s, d], i) => chip(s, 340 + i * 200, 330, tx + d, { size: 80, bg: ['#FF6FAE', '#7EE8CF', '#FFC93C'][i], fg: i === 0 ? '#fff' : '#24204A' }));
      angka('TEBAL JADI 2×', 560, at('jadi'), { sub: 'tiap kali dilipat', col: '#FF6FAE', size: 110 });
    }
  } else if (k === 3) {                            // lipatan ke 21 → 27 → 32
    landmark(t);
    const n = foldN(t), h = hOfN(n); tower(h, 0.7).position.set(0, 0, 0);
    ohi(t, { x: -0.95, z: 0.8, ry: 0.4, expr: 'kaget', s: 0.45 });
    garisCepat(CUT[3] + 0.4, CUT[4] - 0.2); follow(h); counter(CUT[3] + 0.1, CUT[4]);
    tangga([{ label: '1 lembar', sub: '0,1 mm', t: CUT[3] + 0.1 }, { label: 'Monas', sub: 'lipatan 21 ≈ 210 m', t: at('Monas') }, { label: 'Pesawat', sub: 'lipatan 27 ≈ 13 km', t: at('pesawat') }, { label: 'Stasiun angkasa', sub: 'lipatan 32 ≈ 430 km', t: at('stasiun') }], { t1: CUT[4] });
    chip('Ilustrasi skala', 540, 1640, CUT[3] + 0.2, { size: 40, bg: '#FFFFFF' });
  } else if (k === 4) {                            // OHHIYAA! benar — sampai Bulan
    landmark(t);
    const n = foldN(t), h = hOfN(n); tower(h, 0.7).position.set(0, 0, 0);
    ohi(t, { x: 2.8, z: 10, ry: -0.4, expr: 'kaget', s: 3.4, jump: t > at('Ohhiyaa') - 0.2 });
    const up = seg(t, CUT[4], at('Bulan', 1));
    shot(t, CUT[4], CUT[5], [0, 6 + up * 4, 24 + up * 6], [0, 5 + up * 5, 0], { eye2: [0, 11, 30], target2: [0, 10, 0] });
    counter(CUT[4], at('Ohhiyaa') - 0.1);
    angka('± 440.000 KM', 330, at('hampir'), { sub: '0,1 mm × 2⁴²', col: '#FF6FAE', t1: at('Ohhiyaa') - 0.1 });
    chip('Bulan: 384.400 km', 540, 560, at('Bulan', 1), { size: 54, bg: '#FFC93C', t1: at('Ohhiyaa') - 0.1 });
    ohhiyaa(at('Ohhiyaa'), { y: 860 });
    chip('Jawaban: BENAR!', 540, 1640, at('benar', 1), { size: 70, bg: '#7EE8CF' });
  } else {                                         // personal + loop
    place(toy('kertas'), 0.9, 0, 0.7, -0.4, 2.0); muncul(toy('kertas'), t, CUT[5] + 0.3);
    ohi(t, { x: -0.7, z: 0.8, ry: 0.2, expr: t > at('Jadi') ? 'mikir' : 'senang', s: 0.85, point: t > at('Jadi') });
    shot(t, CUT[5], DURATION, [0, 1.6, 5.6], [0, 0.7, 0.2], { push: 0.1 });
    angka('± 12 LIPATAN', 330, at('rekornya'), { sub: 'rekor kertas sungguhan', col: '#FFC93C', size: 120, t1: at('Jadi') - 0.1 });
    chip('Benar atau bohong?', 540, 520, at('benar', 2), { size: 84, bg: '#FF6FAE', fg: '#fff' });
  }
}
