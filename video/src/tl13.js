KEYWORDS = new Set(['perahu','cadik','sempit','tegak','pelampung','terguling','Madagaskar','ramping','ombak','dilepas']);

window.EXTRA_SFX = [
  { t: 0.0,                         type: 'boom',    gain: 0.5 },
  { t: 0.4,                         type: 'ombak',   d: 6.0, gain: 0.35 },
  { t: at('tegak') - 0.05,          type: 'stamp',   d: 0.5, gain: 1.0 },
  { t: at('Ardi') - 0.1,            type: 'langkah', d: 0.8, gain: 0.4 },
  { t: at('Coba') - 0.1,            type: 'kayu',    d: 0.8, gain: 0.3 },
  { t: at('gampang') - 0.1,         type: 'ombak',   d: 6.0, gain: 0.35 },
  { t: at('tegak', 1) - 0.05,       type: 'stamp',   d: 0.4, gain: 0.8 },
  { t: at('Madagaskar') - 0.05,     type: 'stamp',   d: 0.4, gain: 0.9 },
  { t: at('Ombak') - 0.1,           type: 'ombak',   d: 5.0, gain: 0.4 },
  { t: at('Makanya') - 0.05,        type: 'stamp',   d: 0.4, gain: 0.9 },
];

const PAK_DAENG = makeChar({
  shirt: '#3A6EA5', pattern: 'kotak', pat2: '#E8E8E8', sarung: '#7A3E2A',
  hair: 'grey', hat: 'cap', hatCol: '#2F5E3A', mustache: true,
});
const ARDI = makeChar({
  shirt: '#F2F2F2', pattern: 'stripe', pat2: '#2A3F6A', pants: '#2A3F6A',
  hair: 'black', hat: 'headband', hatCol: '#1E9A9A',
});

let ROCK = 0;   // amplitudo guling perahu (rad), diatur per adegan
const PERAHU = (() => {
  const B = new THREE.Group();
  const hull = sph(1, '#C8552E', { ol: 0.012 }, 28, 16); hull.scale.set(0.34, 0.3, 2.3); at3(hull, 0, 0.22, 0); B.add(hull);
  const trim = sph(1, '#F6E7C8', { ol: 0.008 }, 28, 12); trim.scale.set(0.345, 0.05, 2.31); at3(trim, 0, 0.38, 0); B.add(trim);
  [-0.8, 0.8].forEach(z => B.add(at3(cyl(0.035, 0.035, 1.9, '#7A5430', { ol: 0.008 }, 10), 0.9, 0.42, z, 0, 0, Math.PI / 2)));
  const fl = sph(1, '#E8D2A6', { ol: 0.01 }, 24, 12); fl.scale.set(0.15, 0.13, 1.5); at3(fl, 1.85, 0.12, 0); B.add(fl);
  [-0.8, 0.8].forEach(z => B.add(at3(cyl(0.03, 0.03, 0.34, '#7A5430', { ol: 0.008 }, 8), 1.85, 0.3, z)));
  return B;
})();
PERAHU.userData.update = t => { PERAHU.rotation.set(0, -0.95, ROCK * Math.sin(t * 1.3), 'YXZ'); PERAHU.position.y = 0.2 + Math.abs(Math.sin(t * 1.3)) * ROCK * 0.1; };

const PANTAI = build('pantai_cadik', () => {
  const G = grp(ground('pasir', 40));
  const laut = sea(50, 16, '#2A6EA8'); G.add(at3(laut, 0, 0.16, -8.5));
  G.add(at3(PERAHU, -0.2, 0.2, -2.6));
  G.add(at3(palm(3.4, 0.2), -5.2, 0, 2.2));
  G.add(at3(palm(3.0, -0.2), 5.6, 0, 1.2));
  G.add(at3(stone(0.25, '#9A8A70'), 3.2, 0, 1.6));
  [[-9, 9, -22], [6, 11, -24]].forEach(([x, y, z], i) => G.add(at3(cloud(1.4 + i * 0.3), x, y, z)));
  return G;
});
function pantaiSet(m, sk) { sky(sk || 'pantai'); mood(m || 'siang'); show(PANTAI); PAK_DAENG.visible = true; ARDI.visible = true; }
const posD = (t, o) => pose(PAK_DAENG, t, Object.assign({ x: -1.5, z: 1.0, ry: 0.35 }, o));
const posA = (t, o) => pose(ARDI, t, Object.assign({ x: 1.4, z: 1.1, ry: -0.35 }, o));

function scene(t) {
  const k = beatOf(t);
  ROCK = 0.04;

  if (k === 0) {                                   // Hook
    pantaiSet('siang'); PAK_DAENG.visible = false; ARDI.visible = false; ROCK = 0.10;
    if (t < CUT[0] + 3.0) shot(t, CUT[0], CUT[0] + 3.0, [-0.4, 1.9, 4.6], [0.4, 0.4, -2.4], { push: 0.05 });
    else shot(t, CUT[0] + 3.0, CUT[1], [3.6, 1.0, 1.2], [0.6, 0.35, -2.4], { push: 0.05 });
    chip('Badan sempit — tegak di ombak', 540, 230, CUT[0] + 0.6, { size: 48 });
    bigWord('Tegak!', at('tegak') - 0.05, at('tegak') + 1.2);
  } else if (k === 1) {                            // Konflik
    pantaiSet('siang');
    if (t < CUT[1] + 2.4) { posD(t, { expr: 'flat', arms: 'hips' }); posA(t, { expr: 'flat', arms: 'down' }); shot(t, CUT[1], CUT[1] + 2.4, [0, 2.2, 6.6], [0, 0.9, -1.0]); }
    else if (t < CUT[1] + 7.2) { posD(t, { expr: 'flat', arms: 'hips' }); posA(t, { expr: 'talk', arms: 'point', talk: true }); closeUp(t, ARDI, CUT[1] + 2.4, CUT[1] + 7.2, { side: 1, dist: 1.6, up: 0.1 }); }
    else { posD(t, { expr: 'laugh', arms: 'hips' }); posA(t, { expr: 'flat', arms: 'chin' }); closeUp(t, PAK_DAENG, CUT[1] + 7.2, CUT[2], { side: -1, dist: 1.6, up: 0.1 }); }
    card(['"Lebarkan saja badan perahunya."'], 540, 1560, at('Lebarkan') - 0.2);
    card(['"Coba naik dulu, Nak."'], 540, 1560, at('Coba') - 0.2);
  } else if (k === 2) {                            // Rahasia leluhur
    pantaiSet('siang');
    if (t < CUT[2] + 3.4) { posD(t, { expr: 'talk', arms: 'point', talk: true }); posA(t, { expr: 'flat', arms: 'chin' }); shot(t, CUT[2], CUT[2] + 3.4, [-0.2, 1.8, 5.0], [-0.2, 0.8, -1.2]); }
    else if (t < CUT[2] + 7.0) { posD(t, { expr: 'talk', arms: 'hold', talk: true }); posA(t, { expr: 'flat', arms: 'chin' }); closeUp(t, PAK_DAENG, CUT[2] + 3.4, CUT[2] + 7.0, { side: -1, dist: 1.6, up: 0.1 }); }
    else { posD(t, { expr: 'flat', arms: 'hips' }); posA(t, { expr: 'worried', arms: 'chin' }); shot(t, CUT[2] + 7.0, CUT[3], [3.8, 1.2, 1.6], [0.8, 0.4, -2.4], { push: 0.03 }); }
    chip('Cadik tidak boleh dilepas', 540, 240, at('cadik') - 0.1, { size: 48 });
    card(['"Itu kaki perahu kami."'], 540, 1560, at('kaki') - 0.3);
  } else if (k === 3) {                            // Sains
    pantaiSet('siang'); ROCK = 0.22;
    posD(t, { expr: 'flat', arms: 'hold' }); posA(t, { expr: 'flat', arms: 'chin' });
    if (t < CUT[3] + 4.4) shot(t, CUT[3], CUT[3] + 4.4, [0.2, 1.4, 4.2], [0.5, 0.4, -2.4], { push: 0.04 });
    else if (t < CUT[3] + 11.0) shot(t, CUT[3] + 4.4, CUT[3] + 11.0, [4.0, 0.9, 0.2], [0.7, 0.3, -2.4], { push: 0.05 });
    else closeUp(t, PAK_DAENG, CUT[3] + 11.0, CUT[4], { side: -1, dist: 1.6, up: 0.1 });
    chip('Sempit: cepat, tapi gampang terguling', 540, 250, at('gampang') - 0.2, { size: 40 });
    chip('Pelampung jauh di samping', 540, 370, at('pelampung') - 0.1, { size: 46 });
    chip('Miring → tegak lagi', 540, 250, at('tegak', 1) - 0.4, { size: 50, stamp: true });
  } else if (k === 4) {                            // Lapisan kedua
    pantaiSet('sore', 'sore'); ROCK = 0.12;
    posD(t, { expr: 'flat', arms: 'hold' }); posA(t, { expr: 'flat', arms: 'down' });
    if (t < CUT[4] + 5.6) shot(t, CUT[4], CUT[4] + 5.6, [-1.5, 1.6, 5.2], [0.2, 0.5, -2.4], { push: 0.04 });
    else closeUp(t, ARDI, CUT[4] + 5.6, CUT[5], { side: 1, dist: 1.6, up: 0.1 });
    chip('Badan panjang & ramping — tetap aman', 540, 250, at('ramping') - 0.2, { size: 38 });
    chip('Austronesia → Madagaskar', 540, 370, at('Madagaskar') - 0.2, { size: 48, stamp: true });
  } else if (k === 5) {                            // Perubahan
    pantaiSet('sore', 'sore'); ROCK = 0.24;
    if (t < CUT[5] + 3.6) { posD(t, { expr: 'smile', arms: 'down' }); posA(t, { x: 0.8, expr: 'worried', arms: 'reach' }); shot(t, CUT[5], CUT[5] + 3.6, [3.2, 1.4, 3.0], [0.4, 0.5, -1.6]); }
    else if (t < CUT[5] + 7.6) { posD(t, { expr: 'smile', arms: 'down' }); posA(t, { x: 0.8, expr: 'happy', arms: 'cheer' }); closeUp(t, ARDI, CUT[5] + 3.6, CUT[5] + 7.6, { side: 1, dist: 1.6, up: 0.1 }); }
    else { ROCK = 0.04; posD(t, { expr: 'laugh', arms: 'hips' }); posA(t, { expr: 'happy', arms: 'down' }); closeUp(t, PAK_DAENG, CUT[5] + 7.6, CUT[6], { side: -1, dist: 1.6, up: 0.1 }); }
    card(['"Pak, cadiknya kerja', 'keras juga."'], 540, 1560, at('kerja') - 0.4);
    card(['"Makanya jangan dilepas, Nak."'], 540, 1560, at('Makanya') - 0.3);
  } else {                                         // CTA
    pantaiSet('sore', 'sore'); ROCK = 0.04;
    posD(t, { x: -1.6, ry: 0.15, expr: 'happy', arms: 'cheer' }); posA(t, { x: 1.4, ry: -0.15, expr: 'happy', arms: 'wave' });
    shot(t, CUT[6], DURATION, [0, 2.4, 8.0], [0, 0.9, -1.5], { drift: 0.012 });
    card(['Bagian perahu yang tak boleh dilepas?', 'Tulis nama daerahnya di komentar!'], 540, 320, CUT[6] + 1.0);
  }
}
renderFrame(0);
