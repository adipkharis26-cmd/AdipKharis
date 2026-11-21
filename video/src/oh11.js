// Ohhiyaa! oh11 — DUEL: telur vs pisang hasil panen Indonesia setahun, dijejer. Format: duel · Alur: duel · Jawaban: KANAN (= pisang; hasil oh_format.py oh11).
// Telur 6.342.705 t ÷ 60 g = 105,7 miliar × 5,5 cm = 5,81 juta km (145× keliling Bumi). Pisang 9,26 juta t ÷ 125 g = 74,1 miliar × 18 cm = 13,33 juta km (333×).
// Rasio panjang pisang/telur = 2,293. Memakai ohlib.js (lane).
KEYWORDS = new Set(['telur', 'pisang', 'panjang', 'bumi', 'menang', 'ohhiyaa', 'miliar']);
window.EXTRA_SFX = [];
TOY.telur = () => { const e = sph(0.12, PLASTIK('#F2DDBF', { rough: 0.45, coat: 0.4 }), { ol: 0.008 }, 24, 16); e.scale.set(1, 1.3, 1); e.position.y = 0.156; return grp(e); };
TOY.pisang = () => {
  const G = new THREE.Group(), c = PLASTIK('#FFD23F', { rough: 0.45, coat: 0.4 });
  const b = torus(0.32, 0.055, c, 1.5, { ol: 0.007 }); b.rotation.z = Math.PI / 2 + 0.82; b.position.set(0, 0.38, 0);
  const tip1 = cyl(0.02, 0.03, 0.05, '#5B3A1E'); tip1.position.set(-0.235, 0.12, 0); tip1.rotation.z = 0.8;
  const tip2 = cyl(0.025, 0.035, 0.07, '#6E8B3D'); tip2.position.set(0.235, 0.12, 0); tip2.rotation.z = -0.8;
  G.add(b, tip1, tip2); return G;
};
const SC = 2.0, NP = 40, GP = 0.55, LP = NP * GP * SC, NT = 32, GT = LP / 2.293 / NT / SC;   // panjang barisan sebanding 1 : 2,293
function pair(t, s = 1.6) {
  place(toy('telur'), -0.75, 0, 0.3, 0, s * 1.4); place(toy('pisang'), 0.75, 0, 0.3, -0.3, s);
}

function scene(t) {
  const k = beatOf(t);
  studio(['studio', 'mint', 'langit', 'ungu', 'langit', 'studio'][k]);
  if (k === 0) {                                   // hook: telur vs pisang berhadapan
    pair(t); muncul(toy('telur'), t, 0.1); muncul(toy('pisang'), t, 0.5);
    ohi(t, { x: 0, z: 1.3, ry: 0, expr: 'mikir', s: 0.6 });
    shot(t, 0, CUT[1], [0, 1.6, 5.0], [0, 0.6, 0.2], { push: 0.15 });
    chip('Telur vs Pisang', 540, 250, 0.05, { size: 92, bg: '#FFC93C' });
    chip('panen Indonesia setahun', 540, 400, at('Indonesia'), { size: 60, bg: '#FFFFFF' });
    chip('Mana lebih panjang?', 540, 1560, at('panjang'), { size: 76, bg: '#FF6FAE', fg: '#fff' });
  } else if (k === 1) {                            // DUEL: pilih tim
    pair(t, 1.3);
    ohi(t, { x: 0, z: 0.9, ry: Math.sin(t * 3) * 0.5, expr: 'senang', wave: true, s: 0.7 });
    shot(t, CUT[1], CUT[2], [0, 1.4, 4.4], [0, 0.6, 0], { push: 0.1 });
    duel(CUT[1] + 0.1, CUT[2] - 0.1, { txt: 'PILIH TIM!', kiri: 'TELUR', kanan: 'PISANG', y: 300 });
    chip('Ketik 🥚 atau 🍌', 540, 1560, at('Tim') + 0.3, { size: 64, bg: '#FFFFFF' });
  } else if (k === 2) {                            // ukur kubu kiri: telur
    if (t < at('seratus') - 0.1) {
      place(toy('telur'), 0, 0, 0, 0, 2.4); place(toy('penggaris'), 0, 0, 0.6, 0, 0.5);
      shot(t, CUT[2], at('seratus'), [0.2, 1.0, 3.2], [0, 0.35, 0.2], { push: 0.2 });
      angka('6,3 JUTA TON', 330, at('Enam'), { sub: 'produksi telur ayam petelur (BPS 2024)', col: '#FF8A1F', size: 120 });
    } else {
      grow(stack('telur', 48, { cols: 8, rows: 3, gap: 0.34, layer: 0.3 }), t, at('seratus') - 0.1, CUT[3] - 0.4, 0, 0, 1.4);
      shot(t, at('seratus') - 0.2, CUT[3], [0, 1.7, 3.9], [0, 0.35, 0], { eye2: [0.4, 2.3, 4.8], target2: [0, 0.35, 0] });
      angka('± 105 MILIAR BUTIR', 330, at('seratus'), { sub: '÷ ±60 g per butir', col: '#FF8A1F', size: 104, t1: at('setengah') - 0.2 });
      angka('± 5,5 CM / BUTIR', 330, at('setengah'), { sub: 'panjang 1 telur (perkiraan)', col: '#FFC93C', size: 104 });
      chip('Ilustrasi skala', 540, 1640, at('seratus'), { size: 40, bg: '#FFFFFF' });
    }
  } else if (k === 3) {                            // ukur kubu kanan: pisang
    if (t < at('kalah') - 0.1) {
      grow(stack('pisang', 24, { cols: 6, rows: 2, gap: 0.6, layer: 0.32 }), t, CUT[3] + 0.1, at('kalah') - 0.4, 0, 0, 1.0);
      shot(t, CUT[3], at('kalah'), [0, 2.4, 5.4], [0, 0.3, 0], { push: 0.15 });
      angka('9,3 JUTA TON', 330, at('sembilan'), { sub: 'produksi pisang (BPS 2024)', col: '#E0A800', size: 120, t1: at('tujuh') - 0.1 });
      angka('± 74 MILIAR BUAH', 330, at('tujuh'), { sub: '÷ ±125 g per buah', col: '#E0A800', size: 108 });
      chip('Ilustrasi skala', 540, 1640, CUT[3] + 0.1, { size: 40, bg: '#FFFFFF' });
    } else {
      place(toy('pisang'), 0, 0, 0, 0, 1.9); place(toy('penggaris'), 0, 0, 0.6, 0, 0.5);
      shot(t, at('kalah') - 0.1, CUT[4], [0.2, 1.0, 3.4], [0, 0.4, 0.2], { push: 0.2 });
      chip('Kalah banyak, tapi...', 540, 250, at('kalah'), { size: 70, bg: '#FFFFFF' });
      angka('± 18 CM / BUAH', 450, at('delapan'), { sub: 'panjang 1 pisang (perkiraan)', col: '#E0A800', size: 110 });
    }
  } else if (k === 4) {                            // balapan → OHHIYAA! pisang menang
    lane('telur', NT, GT, -1.6, t, CUT[4] + 0.1, at('Bumi') + 0.6, SC);
    lane('pisang', NP, GP, 1.6, t, CUT[4] + 0.1, at('kali', 1) + 0.2, SC);
    ohi(t, { x: 0, z: 5.2, ry: 0, expr: 'kaget', s: 0.9, jump: t > at('Ohhiyaa') - 0.2 });
    shot(t, CUT[4], CUT[5], [0, 3.5, 9], [0, 0.3, -8], { eye2: [0, 16, 13], target2: [0, 0, -18], fov: 60 });
    place(toy('telur', 'end'), -1.6, 0, 3 - NT * GT * SC - 0.6, 0, 3.0 * seg(t, at('Bumi') + 0.6, at('Bumi') + 1.0));
    place(toy('pisang', 'end'), 1.6, 0, 3 - LP - 0.8, -0.3, 2.6 * seg(t, at('kali', 1) + 0.2, at('kali', 1) + 0.6));
    garisCepat(CUT[4] + 0.2, at('menang') - 0.1, 'zoom');
    angka('🥚 145× KELILING BUMI', 300, at('Bumi'), { sub: '±5,8 juta km', col: '#FF8A1F', size: 84, t1: at('Ohhiyaa') - 0.1 });
    angka('🍌 333× KELILING BUMI', 520, at('Tiga'), { sub: '±13,3 juta km', col: '#E0A800', size: 84, t1: at('Ohhiyaa') - 0.1 });
    jawab(at('menang'), 'PISANG MENANG! (tim kanan)', { col: '#FFD23F' });
    ohhiyaa(at('Ohhiyaa'), { y: 800 });
  } else {                                         // personal + loop
    pair(t, 1.7); muncul(toy('pisang'), t, CUT[5] + 0.2);
    ohi(t, { x: 0, z: 1.2, ry: 0, expr: t > at('mana', 1) ? 'mikir' : 'senang', s: 0.65, point: t > at('mana', 1) });
    shot(t, CUT[5], DURATION, [0, 1.6, 5.4], [0, 0.6, 0.2], { push: 0.1 });
    chip('Banyak ≠ panjang', 540, 260, CUT[5] + 0.2, { size: 84, bg: '#FFC93C', t1: at('mana', 1) - 0.1 });
    chip('Kamu tim mana?', 540, 260, at('mana', 1), { size: 90, bg: '#FF6FAE', fg: '#fff' });
  }
}
