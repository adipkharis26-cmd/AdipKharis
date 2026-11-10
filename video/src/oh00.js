// Ohhiyaa! oh00 — contoh pola (BUKAN episode). Data: galon 19 L tingginya ±0,49 m; Monas 132 m → ±270 galon.
KEYWORDS = new Set(['galon', 'monas', 'meter', 'ohhiyaa']);
window.EXTRA_SFX = [];
function scene(t) {
  const k = beatOf(t);
  studio(['studio', 'mint', 'langit', 'ungu'][k]);
  if (k === 0) {                                   // the question: one gallon vs Monas
    const G = toy('galon'); place(G, -0.9, 0, 0.6, 0.3, 1.6);
    const M = toy('monas'); place(M, 0.9, 0, -0.6, 0.4, 1.2);
    ohi(t, { x: -1.6, z: 1.4, ry: 0.5, expr: 'mikir', s: 0.8 });
    shot(t, 0, CUT[1], [0.2, 1.6, 6.4], [0, 1.3, 0], { push: 0.15 });
    chip('Setinggi Monas?', 540, 300, at('Monas'), { size: 86, bg: '#FFC93C' });
  } else if (k === 1) {                            // guess first (comment bait)
    ohi(t, { x: 0, z: 0.6, expr: t > at('satu') ? 'kaget' : 'senang', wave: t < at('Tiga'), jump: t > at('satu') });
    shot(t, CUT[1], CUT[2], [0, 1.3, 3.9], [0, 0.85, 0], { push: 0.1 });
    tebak(at('Tebak'), CUT[2] - 0.1, { y: 260 });
  } else if (k === 2) {                            // measure: ruler next to the gallon, then Monas
    if (t < at('Monas', 1) - 0.15) {
      const G = toy('galon'); place(G, 0, 0, 0, 0.3, 2.2);
      const R = toy('penggaris'); place(R, 0.62, 0.62, 0.1, 0, 0.42); R.rotation.set(0, 0, Math.PI / 2);
      shot(t, CUT[2], at('Monas', 1), [0.2, 0.9, 3.2], [0.2, 0.6, 0], { push: 0.12 });
      angka('± 0,5 METER', 330, at('setengah'), { sub: '1 galon 19 liter', col: '#1E6EFF' });
    } else {
      const M = toy('monas'); place(M, 0, 0, 0, 0.5, 2.5);
      shot(t, at('Monas', 1) - 0.15, CUT[3], [0, 1.2, 9], [0, 3.6, 0], { target2: [0, 5.8, 0] });
      angka('132 METER', 330, at('seratus'), { sub: 'tinggi Monas', col: '#FF6FAE' });
    }
  } else {                                         // the tower of gallons rises next to Monas
    const M = toy('monas'); place(M, 1.6, 0, 0, 0.5, 2.5);
    grow(stack('galon', 13, { cols: 1, rows: 1, layer: 0.5 }), t, CUT[3], at('galon', 2), -1.0, 0, 1.0);
    ohi(t, { x: -1.9, z: 3.2, ry: 0.4, expr: t > at('Ohhiyaa') - 0.2 ? 'senang' : 'kaget', jump: t > at('Ohhiyaa') - 0.2, s: 0.7 });
    shot(t, CUT[3], DURATION, [0.2, 2.2, 10.5], [0, 3.0, 0], { push: 0.08 });
    angka('± 270 GALON', 300, at('dua'), { col: '#FF6FAE' });
    ohhiyaa(at('Ohhiyaa'), { y: 760 });
    chip('Ilustrasi skala', 540, 1640, CUT[3] + 0.2, { size: 40, bg: '#FFFFFF' });
  }
}
