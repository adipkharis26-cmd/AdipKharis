KEYWORDS = new Set(['beras','rendam','arsenik','direndam','mineral','fitat','zinc','besi',
  'Sheffield','dibuang','pulen','leluhur','sawah','airnya']);

window.EXTRA_SFX = [
  { t: 0.0,                            type: 'boom',    gain: 0.5 },
  { t: at('Disengaja') - 0.05,          type: 'stamp',   d: 0.5, gain: 1.0 },
  { t: at('Dani') - 0.1,               type: 'langkah', d: 0.8, gain: 0.4 },
  { t: at('Kata') - 0.2,               type: 'angin',   d: 5.0, gain: 0.3 },
  { t: at('Sheffield') - 0.05,          type: 'stamp',   d: 0.4, gain: 0.8 },
  { t: at('fitat') - 0.1,              type: 'angin',   d: 4.0, gain: 0.25 },
  { t: at('Dani', 1) - 0.1,            type: 'langkah', d: 0.8, gain: 0.4 },
  { t: at('beda') - 0.05,              type: 'stamp',   d: 0.4, gain: 0.9 },
];

const MAK_IJAH = makeChar({
  shirt:   '#7A4520',
  pattern: 'lurik',
  pat2:    '#C49A3A',
  hair:    'white',
  hat:     'kerudung',
  hatCol:  '#C8AA82',
  fat:     true,
});

const DANI = makeChar({
  shirt:   '#2D6E3A',
  pattern: 'stripe',
  pat2:    '#7FBF7F',
  pants:   '#1A2A1A',
  hair:    'black',
  hat:     'cap',
  hatCol:  '#1A1A1A',
});

const DAPUR_TERAS = build('dapur_teras', () => {
  const G = grp(ground('lantai', 24));
  // dinding latar
  const dinding = box(22, 2.8, 0.3, '#D4B896');
  at3(dinding, 0, 1.4, -6.5); G.add(dinding);
  // jendela kanan
  const jendela = box(1.4, 1.1, 0.06, '#87CEEB');
  at3(jendela, 2.5, 1.8, -6.34); G.add(jendela);
  // pigura jendela
  const bingkai = box(1.6, 1.3, 0.1, '#8B6340');
  at3(bingkai, 2.5, 1.8, -6.3); G.add(bingkai);
  // meja kayu rendah
  const meja = box(2.2, 0.6, 1.0, '#8B6340');
  at3(meja, 0.1, 0.3, -1.5); G.add(meja);
  const mejaTop = box(2.4, 0.08, 1.2, '#A0744A');
  at3(mejaTop, 0.1, 0.64, -1.5); G.add(mejaTop);
  // baskom besar (rendam beras)
  const baskom = box(0.85, 0.28, 0.65, '#C8A87A');
  at3(baskom, -0.6, 0.76, -1.5); G.add(baskom);
  const airRendam = box(0.72, 0.18, 0.52, '#A8C8E8');
  at3(airRendam, -0.6, 0.86, -1.5); G.add(airRendam);
  // periuk
  const periuk = box(0.52, 0.48, 0.52, '#4A4A4A');
  at3(periuk, 0.65, 0.76, -1.5); G.add(periuk);
  const tutup = box(0.6, 0.1, 0.6, '#5A5A5A');
  at3(tutup, 0.65, 1.02, -1.5); G.add(tutup);
  // kompor/tungku
  const kompor = box(0.72, 0.38, 0.6, '#3A3A3A');
  at3(kompor, 0.65, 0.49, -1.5); G.add(kompor);
  // tanaman pojok
  G.add(at3(bush(0.55, '#5A6E30'),  3.2, 0, -2.0));
  G.add(at3(bush(0.4,  '#4E6228'), -3.6, 0, -1.8));
  G.add(at3(stone(0.22, '#9A8A70'),  2.0, 0,  1.8));
  G.add(at3(cloud(1.1), -4, 7, -14));
  G.add(at3(cloud(0.9),  3, 9, -16));
  return G;
});

function terasSet(moodStr) {
  sky('desa');
  mood(moodStr || 'siang');
  show(DAPUR_TERAS);
  MAK_IJAH.visible = true;
  DANI.visible     = true;
}

function posMak(t, opts) {
  pose(MAK_IJAH, t, Object.assign({ x: -1.1, z: 0.1, ry: 0.2 }, opts));
}
function posDani(t, opts) {
  pose(DANI, t, Object.assign({ x: 1.3, z: 0.2, ry: -0.2 }, opts));
}

function scene(t) {
  const k = beatOf(t);

  // Beat 0 — Hook (0–6.15)
  if (k === 0) {
    terasSet('siang');
    DANI.visible = false;
    posMak(t, { x: -0.6, z: 0.3, ry: 0.05, expr: 'flat', arms: 'stir' });
    if (t < CUT[0] + 3.5) {
      shot(t, CUT[0], CUT[0] + 3.5, [0, 3.2, 8.5], [0, 1.0, -1.5], { push: 0.03 });
    } else {
      shot(t, CUT[0] + 3.5, CUT[1], [1.6, 1.8, 3.8], [0, 0.8, -0.5], { push: 0.04 });
    }
    chip('Rendam beras — semalam', 540, 220, CUT[0] + 1.2, { size: 50 });
    bigWord('Disengaja!', at('Disengaja') - 0.05, at('Disengaja') + 1.4);
  }

  // Beat 1 — Konflik (6.15–16.007)
  else if (k === 1) {
    terasSet('siang');
    if (t < CUT[1] + 2.0) {
      posMak(t, { expr: 'flat', arms: 'stir' });
      posDani(t, { expr: 'flat', arms: 'down' });
      shot(t, CUT[1], CUT[1] + 2.0, [0, 2.0, 6.5], [0, 1.0, 0]);
    } else if (t < CUT[1] + 4.5) {
      posMak(t, { expr: 'flat', arms: 'hold' });
      posDani(t, { expr: 'flat', arms: 'down' });
      closeUp(t, MAK_IJAH, CUT[1] + 2.0, CUT[1] + 4.5, { side: -1, dist: 1.6, up: 0.1 });
    } else if (t < CUT[1] + 6.5) {
      posMak(t, { expr: 'flat', arms: 'hold' });
      posDani(t, { expr: 'talk', arms: 'point', talk: true });
      closeUp(t, DANI, CUT[1] + 4.5, CUT[1] + 6.5, { side: 1, dist: 1.6, up: 0.1 });
    } else if (t < CUT[1] + 8.5) {
      posMak(t, { expr: 'talk', arms: 'hips', talk: true });
      posDani(t, { expr: 'flat', arms: 'down' });
      closeUp(t, MAK_IJAH, CUT[1] + 6.5, CUT[1] + 8.5, { side: -1, dist: 1.6, up: 0.1 });
    } else {
      posMak(t, { expr: 'flat', arms: 'stir' });
      posDani(t, { expr: 'shock', arms: 'shrug' });
      closeUp(t, DANI, CUT[1] + 8.5, CUT[2], { side: 1, dist: 1.6, up: 0.1 });
    }
    card(['"Rendam dulu, Nak."'], 540, 1560, at('Rendam') - 0.1);
    card(['"Mak, kan ada rice cooker."'], 540, 1560, at('rice') - 0.3);
    card(['"Rice cooker tidak buang airnya."'], 540, 1560, at('Rice', 1) - 0.3);
  }

  // Beat 2 — Rahasia leluhur (16.007–26.433)
  else if (k === 2) {
    terasSet('siang');
    if (t < CUT[2] + 3.5) {
      posMak(t, { expr: 'talk', arms: 'hold', talk: true });
      posDani(t, { expr: 'flat', arms: 'down' });
      shot(t, CUT[2], CUT[2] + 3.5, [-0.5, 2.2, 6.0], [0, 1.0, -0.5]);
    } else if (t < CUT[2] + 6.5) {
      posMak(t, { expr: 'talk', arms: 'point', talk: true });
      posDani(t, { expr: 'flat', arms: 'down' });
      closeUp(t, MAK_IJAH, CUT[2] + 3.5, CUT[2] + 6.5, { side: -1, dist: 1.6, up: 0.1 });
    } else {
      posMak(t, { expr: 'flat', arms: 'stir' });
      posDani(t, { expr: 'flat', arms: 'chin' });
      shot(t, CUT[2] + 6.5, CUT[3], [0.5, 1.8, 4.5], [-0.3, 0.9, -0.5], { push: 0.02 });
    }
    chip('Direndam → airnya dibuang', 540, 240, at('direndam',1) + 0.1, { size: 48 });
    chip('Sejak dulu — di kampung', 540, 360, at('dulu') + 0.3, { size: 46 });
  }

  // Beat 3 — Sains arsenik (26.433–39.457)
  else if (k === 3) {
    terasSet('siang');
    if (t < CUT[3] + 3.5) {
      posMak(t, { expr: 'flat', arms: 'stir' });
      posDani(t, { expr: 'flat', arms: 'chin' });
      shot(t, CUT[3], CUT[3] + 3.5, [0, 2.0, 6.0], [0, 1.0, -0.5]);
    } else if (t < CUT[3] + 7.0) {
      posMak(t, { expr: 'flat', arms: 'stir' });
      posDani(t, { expr: 'flat', arms: 'chin' });
      shot(t, CUT[3] + 3.5, CUT[3] + 7.0, [-0.4, 1.6, 3.5], [-0.4, 0.9, -1.0], { push: 0.03 });
    } else {
      posMak(t, { expr: 'flat', arms: 'hold' });
      posDani(t, { expr: 'shock', arms: 'shrug' });
      closeUp(t, DANI, CUT[3] + 7.0, CUT[4], { side: 1, dist: 1.6, up: 0.1 });
    }
    chip('Arsenik dari tanah sawah', 540, 250, at('arsenik') - 0.1, { size: 48 });
    chip('Rendam → buang air → terbuang', 540, 370, at('dibuang',1) - 0.1, { size: 44 });
    chip('Berkurang 80%!', 540, 300, at('delapan') - 0.1, { size: 54, stamp: true });
  }

  // Beat 4 — Lapisan kedua: asam fitat (39.457–51.44)
  else if (k === 4) {
    terasSet('sore');
    if (t < CUT[4] + 3.0) {
      posMak(t, { expr: 'flat', arms: 'hold' });
      posDani(t, { expr: 'flat', arms: 'down' });
      shot(t, CUT[4], CUT[4] + 3.0, [0, 2.2, 6.5], [0, 1.0, -0.5]);
    } else if (t < CUT[4] + 7.0) {
      posMak(t, { expr: 'flat', arms: 'stir' });
      posDani(t, { expr: 'flat', arms: 'chin' });
      shot(t, CUT[4] + 3.0, CUT[4] + 7.0, [0.4, 1.8, 4.0], [0, 0.9, -0.8], { push: 0.025 });
    } else {
      posMak(t, { expr: 'flat', arms: 'stir' });
      posDani(t, { expr: 'flat', arms: 'down' });
      closeUp(t, MAK_IJAH, CUT[4] + 7.0, CUT[5], { side: -1, dist: 1.6, up: 0.1 });
    }
    chip('Asam fitat — halangi zat besi & zinc', 540, 250, at('fitat') - 0.1, { size: 44 });
    chip('Perendaman melarutkannya', 540, 370, at('Perendaman') - 0.1, { size: 48, stamp: true });
    chip('Mineral jadi lebih mudah diserap', 540, 300, at('Mineral') - 0.1, { size: 44 });
  }

  // Beat 5 — Perubahan (51.44–61.281)
  else if (k === 5) {
    terasSet('sore');
    if (t < CUT[5] + 2.5) {
      posMak(t, { expr: 'flat', arms: 'stir' });
      posDani(t, { x: 1.3, z: 0.5, expr: 'flat', arms: 'carry' });
      shot(t, CUT[5], CUT[5] + 2.5, [0, 2.0, 6.5], [0, 1.0, 0]);
    } else if (t < CUT[5] + 4.5) {
      posMak(t, { expr: 'flat', arms: 'stir' });
      posDani(t, { expr: 'happy', arms: 'carry' });
      closeUp(t, DANI, CUT[5] + 2.5, CUT[5] + 4.5, { side: 1, dist: 1.6, up: 0.1 });
    } else if (t < CUT[5] + 7.0) {
      posMak(t, { expr: 'flat', arms: 'stir' });
      posDani(t, { expr: 'talk', arms: 'point', talk: true });
      closeUp(t, DANI, CUT[5] + 4.5, CUT[5] + 7.0, { side: 1, dist: 1.6, up: 0.1 });
    } else {
      posMak(t, { expr: 'smile', arms: 'hips' });
      posDani(t, { expr: 'flat', arms: 'down' });
      closeUp(t, MAK_IJAH, CUT[5] + 7.0, CUT[6], { side: -1, dist: 1.6, up: 0.1 });
    }
    card(['"Mak, kok beda?"'], 540, 1560, at('beda') - 0.2);
    card(['"Makanya dengar orang tua."'], 540, 1560, at('Makanya') - 0.3);
  }

  // Beat 6 — CTA (61.281–71.471)
  else if (k === 6) {
    terasSet('sore');
    posMak(t, { x: -1.2, z: 0.0, ry: 0.15, expr: 'happy', arms: 'cheer' });
    posDani(t, { x:  1.2, z: 0.1, ry: -0.15, expr: 'happy', arms: 'wave' });
    shot(t, CUT[6], DURATION, [0, 2.6, 7.5], [0, 0.8, -1.5], { drift: 0.012 });
    card([
      'Di daerahmu ada cara masak beras',
      'yang prosesnya beda? Tulis di komentar!'
    ], 540, 320, CUT[6] + 1.0);
  }
}

renderFrame(0);
