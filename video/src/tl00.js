// Ternyata Leluhur — sampel gaya (3 beat): rumah panggung di atas batu umpak.
KEYWORDS = new Set(['ditanam', 'batu', 'pesan', 'bumi', 'geser', 'diikat']);

window.EXTRA_SFX = [{ t: 0, type: 'langkah', d: 1.2 }, { t: 0, type: 'angin', d: 19.5, gain: 0.5 }];

// tokoh (fiksi)
const DARMA = makeChar({ shirt: '#8A4B2A', pattern: 'gold', pat2: '#E9A92B', pants: '#2E2A28', hair: 'grey', mustache: true, hat: 'peci' });
const TUKANG = makeChar({ shirt: '#2F7FD6', pattern: 'stripe', pat2: '#E8EEF0', pants: '#4A4A55', hat: 'cap', hatCol: '#F4C63B', mustache: true });
const KAKEK = makeChar({ shirt: '#E8DCC4', pants: '#5A4632', hair: 'white', beard: true, hat: 'headband', hatCol: '#7A4E27' });
const CUCU = makeChar({ kid: true, shirt: '#F7D22E', pants: '#E98FA6', hair: 'black' });

// set: kampung dengan rumah panggung
const KAMPUNG = build('kampung', () => {
  const G = grp(ground('rumput'), at3(path(1.6, 30), 0.6, 0, 6));
  const rumah = rumahPanggung({ w: 3.2, d: 2.4, stilt: 0.95, gonjong: false }); G.add(rumah); G.userData.rumah = rumah;
  G.add(at3(rumahPanggung({ w: 2.6, d: 2.0, stilt: 0.8, weave: true }), -5.2, 0, -3.5, 0, 0.5, 0));
  G.add(at3(rumahPanggung({ w: 2.8, d: 2.2, stilt: 0.9, roof: '#3A2A20' }), 5.0, 0, -4.0, 0, -0.4, 0));
  [[-3, -1.5], [3.2, -0.8], [-2.6, 2.4], [4.2, 2.6], [-6.5, 1]].forEach(([x, z], i) => G.add(at3(i % 2 ? tree(2.4) : palm(3.4, 0.3), x, 0, z)));
  [[-1.9, 1.9], [2.0, 1.8], [2.6, 3.4]].forEach(([x, z]) => G.add(at3(bush(0.3), x, 0, z)));
  G.add(at3(hill(9, 3.5), -8, -0.5, -16)); G.add(at3(hill(11, 4.5, '#56B04E'), 9, -0.6, -18));
  [[-4, 7, -14], [5, 8.5, -16], [0, 9.5, -20]].forEach(([x, y, z], i) => { const c = cloud(1.3 + i * 0.3); c.userData.update = t => { c.position.x = x + t * 0.08; }; G.add(at3(c, x, y, z)); });
  return G;
});
// set: halaman masa lalu (kilas balik)
const DULU = build('dulu', () => {
  const G = grp(ground('tanah'));
  G.add(at3(rumahPanggung({ w: 2.8, d: 2.2, stilt: 0.9, weave: true, roof: '#5A3C1E' }), 0, 0, -2.2));
  G.add(at3(palm(3.2, 0.35), 2.4, 0, -1.2)); G.add(at3(tree(2.2), -2.6, 0, -1.6));
  G.add(at3(PROP.tikar(1.8, 1.3), 0, 0, 0.6));
  return G;
});

function scene(t) {
  const k = beatOf(t);
  if (k === 0) {
    show(KAMPUNG); sky('desa');
    const c1 = at('Tiang') - 0.1, c2 = at('Cuma') - 0.1;
    if (t < c1) {               // tukang datang, heran melihat rumah
      const wk = seg(t, 0, 1.2);
      pose(TUKANG, t, { x: lerp(2.2, 0.9, ease(wk)), z: 2.6, ry: -0.7, walk: wk < 1, expr: wk < 1 ? 'smile' : 'worried', arms: wk < 1 ? 'down' : 'chin' });
      pose(DARMA, t, { x: -0.7, z: 1.8, ry: 0.5, expr: 'smile' });
      shot(t, 0, c1, [1.3, 1.3, 6.4], [0.2, 1.15, 1.2]);
    } else if (t < c2) {        // kamera turun ke kaki tiang
      pose(DARMA, t, { x: -0.7, z: 1.8, ry: 0.5, expr: 'smile' });
      pose(TUKANG, t, { x: 0.9, z: 2.6, ry: -0.7, expr: 'worried', arms: 'point' });
      shot(t, c1, c2, [0.6, 1.0, 4.2], [-0.4, 0.55, 1.05], { push: 0.2 });
      chip('Tidak ditanam?', 540, 330, at('ditanam'), { size: 80, stamp: true });
    } else {                    // close-up: tiang di atas batu
      pose(TUKANG, t, { x: 1.3, z: 2.6, ry: -0.7, expr: 'shock' });
      shot(t, c2, CUT[1], [-0.75, 0.42, 2.25], [-1.45, 0.2, 1.05], { push: 0.25, drift: 0.05 });
      chip('Di atas batu', 540, 330, at('batu'), { size: 84, bg: '#FFF7E6' });
      arrow(380, 1020, Math.PI * 0.62, at('batu') + 0.1);
    }
  } else if (k === 1) {
    const c1 = at('Rumah', 1) - 0.15;
    if (t < at('kakeknya') - 0.05) {   // Pak Darma bercerita
      show(KAMPUNG); sky('desa');
      pose(DARMA, t, { x: 0, z: 2.2, ry: 0.15, expr: 'talk', talk: true, arms: t > at('begini') ? 'hips' : 'down' });
      shot(t, CUT[1], c1, [0.1, 1.0, 3.9], [0, 0.72, 2.2]);
    } else {                           // kilas balik sepia
      show(DULU); sky('sore'); mood('sore'); SEPIA = 0.85;
      pose(KAKEK, t, { x: -0.35, z: 0.6, ry: 0.5, expr: t > c1 ? 'talk' : 'smile', talk: t > c1, arms: t > c1 ? 'point' : 'down', nod: t < c1 });
      pose(CUCU, t, { x: 0.45, z: 0.85, ry: -0.6, expr: 'smile', look: 0.1 });
      shot(t, at('kakeknya') - 0.05, CUT[2], [0.4, 0.9, 3.2], [0, 0.65, 0.6]);
      if (t > c1) card(['PESAN KAKEK', 'Rumah jangan diikat', 'mati ke bumi'], 540, 380, at('Rumah', 1), { size: 64 });
    }
  } else {
    show(KAMPUNG); sky('desa');
    const laughEnd = at('Pak', 2) - 0.1;
    pose(TUKANG, t, { x: 0.32, z: 2.3, ry: -0.35, expr: t < laughEnd ? 'laugh' : 'talk', talk: t >= laughEnd, arms: t < laughEnd ? 'hips' : 'point' });
    pose(DARMA, t, { x: -0.55, z: 2.0, ry: 0.45, expr: t < laughEnd ? 'smile' : 'flat' });
    shot(t, CUT[2], CUT[3], [0.0, 1.0, 4.4], [-0.05, 0.75, 2.1], { drift: -0.15 });
    if (t >= at('ditiup')) card(['“Ditiup angin juga', 'geser itu rumah!”'], 540, 360, at('ditiup'), { size: 60, titleCol: '#17120F' });
  }
}
