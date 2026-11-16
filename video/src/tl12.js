KEYWORDS = new Set(['sawah','lereng','teras','subak','pematang','hujan','tanah','bertahan','curam','hanyut','Rwanda']);

window.EXTRA_SFX = [
  { t: 0.0,                         type: 'boom',    gain: 0.5 },
  { t: at('hujan') - 0.1,           type: 'angin',   d: 6.0, gain: 0.3 },
  { t: at('bertahan') - 0.05,       type: 'stamp',   d: 0.5, gain: 1.0 },
  { t: at('Gita') - 0.1,            type: 'langkah', d: 0.8, gain: 0.4 },
  { t: at('jebol') - 0.05,          type: 'kayu',    d: 0.8, gain: 0.4 },
  { t: at('meluncur') - 0.1,        type: 'angin',   d: 5.0, gain: 0.3 },
  { t: at('Rwanda') - 0.05,         type: 'stamp',   d: 0.4, gain: 0.8 },
  { t: at('turun', 1) - 0.1,        type: 'angin',   d: 6.0, gain: 0.35 },
  { t: at('Makanya') - 0.05,        type: 'stamp',   d: 0.4, gain: 0.9 },
];

const PAK_MADE = makeChar({
  shirt: '#F2EFE6', pattern: 'kotak', pat2: '#1F1F1F', pants: '#6B3A22',
  hair: 'grey', hat: 'caping', hatCol: '#D4B06A', mustache: true, beard: true,
});
const GITA = makeChar({
  shirt: '#2E8B8B', pattern: 'plaid', pat2: '#F6E7C8', pants: '#24304A',
  hair: 'black', glasses: true,
});

const NT = 5, TZ = i => -1.6 - i * 2.0, TY = i => 0.55 + i * 0.75;
const FLOW = [], RAIN = [];
const LERENG = build('lereng_sawah', () => {
  const G = grp(ground('rumput', 40));
  for (let i = 0; i < NT; i++) {
    const z = TZ(i), y = TY(i);
    G.add(at3(box(10, y, 2.0, '#8A6A44', { ol: 0.01 }), 0, y / 2 - 0.02, z));               // badan teras (tanah)
    G.add(at3(box(9.4, 0.07, 1.7, '#8CC0D4', { cast: false }), 0, y + 0.03, z));            // air sawah
    G.add(at3(box(10, 0.14, 0.16, '#6E5232', { ol: 0.008 }), 0, y + 0.06, z + 0.92));      // pematang depan
    for (let r = 0; r < 3; r++) for (let c = 0; c < 18; c++)
      G.add(at3(box(0.04, 0.3, 0.04, '#6FA83A', { cast: false }), -4.3 + c * 0.5 + (r % 2) * 0.2, y + 0.2, z - 0.5 + r * 0.5));
  }
  G.add(at3(palm(3.4, 0.2), -4.8, 0, -1.2));
  G.add(at3(palm(3.0, -0.2), -6.2, 0, -5.5));
  G.add(at3(bush(0.55, '#4E7334'), 4.0, 0, 1.2));
  G.add(at3(cloud(1.2), -5, 8, -18)); G.add(at3(cloud(1.0), 4, 10, -20));
  // aliran air antar teras (bola biru turun lewat riser)
  for (let i = 1; i < NT; i++) for (let k = 0; k < 4; k++) {
    const s = sph(0.05, '#5FA8D3', { cast: false }, 8, 6); G.add(s);
    FLOW.push({ m: s, i, x: -3.6 + k * 2.4, ph: k * 0.23 + i * 0.11 });
  }
  // hujan
  for (let n = 0; n < 34; n++) { const s = sph(0.035, '#CFE6F5', { cast: false }, 6, 4); G.add(s); RAIN.push({ m: s, x: -4.5 + rnd(n * 5) * 9, z: -8 + rnd(n * 9) * 10, ph: rnd(n * 3) }); }
  return G;
});
function flowOn(t, on) {
  FLOW.forEach(f => {
    f.m.visible = on;
    if (on) { const k = (t * 0.55 + f.ph) % 1; f.m.position.set(f.x, TY(f.i) - k * (TY(f.i) - TY(f.i - 1)) + 0.05, TZ(f.i) + 1.0 + k * 0.4); }
  });
}
function rainOn(t, on) {
  RAIN.forEach(r => { r.m.visible = on; if (on) { const k = (t * 1.6 + r.ph) % 1; r.m.position.set(r.x, 7 - k * 7, r.z); } });
}
function lerengSet(m) { sky('desa'); mood(m || 'siang'); show(LERENG); PAK_MADE.visible = true; GITA.visible = true; }
const posM = (t, o) => pose(PAK_MADE, t, Object.assign({ x: -1.3, z: 0.7, ry: 0.3 }, o));
const posG = (t, o) => pose(GITA, t, Object.assign({ x: 1.3, z: 0.8, ry: -0.3 }, o));

function scene(t) {
  const k = beatOf(t);
  flowOn(t, false); rainOn(t, false);

  if (k === 0) {                                   // Hook
    lerengSet('sore'); PAK_MADE.visible = false; GITA.visible = false; rainOn(t, true);
    if (t < CUT[0] + 4.2) shot(t, CUT[0], CUT[0] + 4.2, [9.0, 4.8, 5.5], [0, 1.8, -5.0], { push: 0.05 });
    else { flowOn(t, true); shot(t, CUT[0] + 4.2, CUT[1], [7.0, 2.6, 1.5], [0, 1.6, -4.5], { push: 0.05 }); }
    chip('Lereng curam — hujan deras', 540, 230, CUT[0] + 1.0, { size: 50 });
    bigWord('Bertahan!', at('bertahan') - 0.05, at('bertahan') + 1.4);
  } else if (k === 1) {                            // Konflik
    lerengSet('siang');
    if (t < CUT[1] + 2.6) { posM(t, { expr: 'flat', arms: 'hips' }); posG(t, { expr: 'flat', arms: 'down' }); shot(t, CUT[1], CUT[1] + 2.6, [0, 2.2, 6.8], [0, 1.6, -2.0]); }
    else if (t < CUT[1] + 6.6) { posM(t, { expr: 'flat', arms: 'hips' }); posG(t, { expr: 'talk', arms: 'shrug', talk: true }); closeUp(t, GITA, CUT[1] + 2.6, CUT[1] + 6.6, { side: 1, dist: 1.6, up: 0.1 }); }
    else { posM(t, { expr: 'talk', arms: 'point', talk: true }); posG(t, { expr: 'flat', arms: 'chin' }); closeUp(t, PAK_MADE, CUT[1] + 6.6, CUT[2], { side: -1, dist: 1.6, up: 0.1 }); }
    card(['"Kek, kenapa dibuat bertingkat-tingkat?"'], 540, 1560, at('bertingkat-tingkat') - 0.6);
    card(['"Ratakan saja lerengnya."'], 540, 1560, at('Ratakan') - 0.2);
  } else if (k === 2) {                            // Rahasia leluhur
    lerengSet('siang');
    if (t < CUT[2] + 3.6) { posM(t, { expr: 'talk', arms: 'point', talk: true }); posG(t, { expr: 'flat', arms: 'chin' }); shot(t, CUT[2], CUT[2] + 3.6, [-0.6, 2.2, 5.6], [-0.2, 1.7, -1.5]); }
    else if (t < CUT[2] + 7.6) { posM(t, { expr: 'talk', arms: 'hold', talk: true }); posG(t, { expr: 'flat', arms: 'chin' }); closeUp(t, PAK_MADE, CUT[2] + 3.6, CUT[2] + 7.6, { side: -1, dist: 1.6, up: 0.1 }); }
    else { posM(t, { expr: 'flat', arms: 'hips' }); posG(t, { expr: 'worried', arms: 'chin' }); shot(t, CUT[2] + 7.6, CUT[3], [0.8, 2.0, 4.4], [0, 1.8, -2.0], { push: 0.03 }); }
    chip('Dijaga bersama — satu subak', 540, 240, at('subak') - 0.2, { size: 46 });
    chip('Satu teras rusak → bawahnya kena', 540, 360, at('rusak') - 0.3, { size: 42 });
  } else if (k === 3) {                            // Sains
    lerengSet('sore'); rainOn(t, true); flowOn(t, true);
    posM(t, { expr: 'flat', arms: 'hold' }); posG(t, { expr: 'flat', arms: 'chin' });
    if (t < CUT[3] + 4.4) shot(t, CUT[3], CUT[3] + 4.4, [8.5, 4.2, 4.0], [0, 1.8, -4.5], { push: 0.04 });
    else if (t < CUT[3] + 9.0) shot(t, CUT[3] + 4.4, CUT[3] + 9.0, [6.0, 2.4, 0.5], [0.5, 1.8, -4.0], { push: 0.06 });
    else closeUp(t, PAK_MADE, CUT[3] + 9.0, CUT[4], { side: -1, dist: 1.6, up: 0.1 });
    chip('Lereng panjang → air makin deras', 540, 250, at('meluncur') - 0.2, { size: 42 });
    chip('Teras memotong lereng', 540, 370, at('memotong') - 0.1, { size: 48 });
    chip('Air tertahan dan meresap', 540, 250, at('meresap') - 0.2, { size: 46, stamp: true });
  } else if (k === 4) {                            // Lapisan kedua
    lerengSet('sore'); flowOn(t, true);
    posM(t, { expr: 'flat', arms: 'hold' }); posG(t, { expr: 'flat', arms: 'down' });
    if (t < CUT[4] + 5.4) shot(t, CUT[4], CUT[4] + 5.4, [7.0, 3.0, 3.0], [0, 1.9, -4.0], { push: 0.04 });
    else closeUp(t, GITA, CUT[4] + 5.4, CUT[5], { side: 1, dist: 1.6, up: 0.1 });
    chip('Rwanda: tanah hilang turun 93–98%', 540, 250, at('Rwanda') - 0.2, { size: 42, stamp: true });
    chip('Pematang rusak → manfaat turun', 540, 370, at('rusak', 1) - 0.4, { size: 42 });
  } else if (k === 5) {                            // Perubahan
    lerengSet('sore'); rainOn(t, t > at('turun', 1) - 0.3); flowOn(t, t > at('turun', 1));
    if (t < CUT[5] + 3.2) { posM(t, { expr: 'smile', arms: 'down' }); posG(t, { x: 0.6, z: 0.6, ry: -0.5, expr: 'flat', arms: 'reach' }); shot(t, CUT[5], CUT[5] + 3.2, [1.2, 1.8, 4.2], [0.2, 1.6, -1.0]); }
    else if (t < CUT[5] + 7.8) { posM(t, { expr: 'smile', arms: 'down' }); posG(t, { x: 0.8, expr: 'happy', arms: 'cheer' }); closeUp(t, GITA, CUT[5] + 3.2, CUT[5] + 7.8, { side: 1, dist: 1.6, up: 0.1 }); }
    else { posM(t, { expr: 'laugh', arms: 'hips' }); posG(t, { expr: 'happy', arms: 'down' }); closeUp(t, PAK_MADE, CUT[5] + 7.8, CUT[6], { side: -1, dist: 1.6, up: 0.1 }); }
    card(['"Kek, ternyata teras ini', 'kerja sama."'], 540, 1560, at('ternyata') - 0.3);
    card(['"Makanya satu subak, Nak."'], 540, 1560, at('Makanya') - 0.3);
    chip('Subak Bali — Warisan Dunia UNESCO (2012)', 540, 230, at('subak', 1) - 0.1, { size: 38 });
  } else {                                         // CTA
    lerengSet('sore');
    posM(t, { x: -1.4, ry: 0.15, expr: 'happy', arms: 'cheer' }); posG(t, { x: 1.4, ry: -0.15, expr: 'happy', arms: 'wave' });
    shot(t, CUT[6], DURATION, [0, 3.0, 8.4], [0, 2.0, -3.0], { drift: 0.012 });
    card(['Ada cara tradisional jaga tanah', 'atau air di lereng? Tulis di komentar!'], 540, 320, CUT[6] + 1.0);
  }
}
renderFrame(0);
