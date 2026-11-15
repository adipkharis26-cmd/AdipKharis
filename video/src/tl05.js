// Ternyata Leluhur TL05 — "Kenapa Tiang Rumah Ini Dibuat Miring?"
// Tokoh fiksi: Pak Simbolon (tua Batak, tenun, ikat kepala merah), Dita (mahasiswi arsitektur, bun, stripe).

KEYWORDS = new Set([
  'miring', 'tegak', 'sempurna', 'segitiga', 'patah', 'gempa', 'roboh',
  'battered', 'column', 'jembatan', 'Bolon', 'Batak', 'daerahmu', 'leluhur', 'pilihan',
]);

window.EXTRA_SFX = [
  { t: 0.0,                         type: 'boom',    gain: 0.6 },
  { t: at('Dita', 0) - 0.1,        type: 'langkah', d: 1.2, gain: 0.4 },
  { t: at('gempa') - 0.1,          type: 'gempa',   d: 2.2, gain: 1.1 },
  { t: at('goyang', 0) + 0.2,      type: 'gempa',   d: 1.4, gain: 0.7 },
  { t: at('Bolon') - 0.05,         type: 'stamp',   d: 0.6, gain: 1.0 },
  { t: at('goyang', 1) + 0.2,      type: 'kayu',    d: 0.5, gain: 1.0 },
  { t: at('Kokoh') + 0.1,          type: 'kayu',    d: 0.4, gain: 1.2 },
  { t: at('daerahmu') - 0.2,       type: 'angin',   d: 8,   gain: 0.2 },
];

// ── Tokoh ─────────────────────────────────────────────────────────────────
const PAK_SIMBOLON = makeChar({
  shirt:   '#3A1A0A', pattern: 'tenun', pat2: '#D4A860',
  sarung:  '#2A1A0A',
  hair:    'grey', beard: true,
  hat:     'headband', hatCol: '#8C1A1A',
});

const DITA = makeChar({
  shirt:   '#1E4A8A', pattern: 'stripe', pat2: '#90B8E0',
  pants:   '#3A3A4A',
  hair:    'bun',
});

// ── Helpers ───────────────────────────────────────────────────────────────
function tiangMiring(px, pz, sh) {
  // inclined pillar: tilts outward from center
  const P = cyl(0.078, 0.088, sh, '#6E4A28', { ol: 0.012 }, 10);
  at3(P, px, sh / 2, pz);
  P.rotation.z = -px * 0.065;
  P.rotation.x =  pz * 0.05;
  return P;
}

// ── Set: LEMBAH_BOLON (eksterior rumah panggung Batak) ───────────────────
const LEMBAH_BOLON = build('lembah_bolon', () => {
  const G = grp(ground('rumput', 24));

  const RUMAH = rumahPanggung({
    w: 4.0, d: 2.6, stilt: 1.1, wallH: 1.3, cols: 4,
    wall: '#8C5A2A', roof: '#2A1A0A',
  });
  at3(RUMAH, 0, 0, -2.0);
  G.add(RUMAH);

  // tilt outer stilts outward (battered column visual)
  const tiang = RUMAH.userData.tiang;
  if (tiang) tiang.forEach(p => {
    p.rotation.z = -p.position.x * 0.065;
    p.rotation.x =  p.position.z * 0.05;
  });

  [-5.5, 0.5, 5.0].forEach((x, i) =>
    G.add(at3(hill('#4A6A28', [2.8 + i * 0.3, 1.5, 2.5]), x, 0, -10)));
  G.add(palm(-3.5, 0, -4.5));
  G.add(palm( 4.0, 0, -5.5));
  G.add(cloud());

  return G;
});

// ── Set: BAWAH_PANGGUNG (view under the house, near inclined pillars) ─────
const BAWAH_PANGGUNG = build('bawah_panggung', () => {
  const G = grp(ground('tanah', 10));

  // floor underside
  G.add(at3(box(4.4, 0.14, 2.8, '#7A5430', { ol: 0.012 }), 0, 1.07, 0));

  // inclined pillars with umpak stones
  const xs = [-1.5, -0.5, 0.5, 1.5];
  const zs = [-0.95, 1.0];
  xs.forEach(px => zs.forEach(pz => {
    G.add(at3(stone(0.2, '#8E8A82'), px, 0.08, pz));
    G.add(tiangMiring(px, pz, 1.0));
  }));

  return G;
});

// ── Shortcuts ─────────────────────────────────────────────────────────────
function balSet(mood_) {
  sky(mood_ || 'desa'); mood('siang');
  show(LEMBAH_BOLON);
  PAK_SIMBOLON.visible = true;
  DITA.visible = true;
}

function bawahSet() {
  sky('dalam'); mood('siang');
  show(BAWAH_PANGGUNG);
  PAK_SIMBOLON.visible = true;
  DITA.visible = true;
}

// ── Render ─────────────────────────────────────────────────────────────────
function renderFrame(t) {
  const k = beatOf(t);

  // ── Beat 0: HOOK — wide shot Rumah Bolon ─────────────────────────────
  if (k === 0) {
    balSet();

    pose(PAK_SIMBOLON, t, {
      x: -1.0, z: 1.3, ry: 0.3,
      expr: 'smile', arms: 'hips',
    });
    pose(DITA, t, {
      x: 0.8, z: 1.1, ry: -0.2,
      expr: t < at('miring', 0) ? 'flat' : 'shock',
      arms: 'down',
    });

    if (t < at('miring', 0)) {
      bigWord('TIGA RATUS\nTAHUN', 0, 2.1, { y: 480, col: '#FFC23C' });
      shot(t, CUT[0], at('miring', 0),
        [0, 2.2, 7.8], [0, 0.9, -1.5], { push: 0.1, drift: 0.03 });
    } else {
      shot(t, at('miring', 0), CUT[1],
        [-2.5, 0.9, 5.0], [-1.0, 0.5, -1.5], { push: 0.1, drift: 0.04 });
      chip('Tiangnya sengaja miring', 540, 300, at('miring', 0) + 0.5, { size: 0.9, stamp: true });
    }
  }

  // ── Beat 1: KONFLIK — Dita melongok, Pak Simbolon senyum ─────────────
  if (k === 1) {
    balSet();

    pose(PAK_SIMBOLON, t, {
      x: -0.8, z: 1.2, ry: 0.5,
      expr: t > at('miring', 2) - 0.2 ? 'smile' : 'flat',
      arms: t > at('miring', 2) - 0.2 ? 'point' : 'hips',
      talk: t > at('miring', 2) - 0.1 && t < CUT[2],
    });
    pose(DITA, t, {
      x: 0.7, z: 1.4, ry: -0.4,
      expr: 'worried', arms: 'down',
      talk: t > at('Pak', 0) && t < at('sengaja', 1) + 1.2,
    });

    if (t < at('miring', 2) - 0.1) {
      closeUp(t, DITA, CUT[1], at('miring', 2) - 0.1, { side: -0.35 });
    } else {
      closeUp(t, PAK_SIMBOLON, at('miring', 2) - 0.1, CUT[2], { side: 0.3 });
    }
  }

  // ── Beat 2: RAHASIA LELUHUR — tiang jangan tegak ─────────────────────
  if (k === 2) {
    bawahSet();
    SCN.fog.near = 7; SCN.fog.far = 20;

    pose(PAK_SIMBOLON, t, {
      x: -0.9, z: 1.5, ry: 0.6,
      expr: 'smile', arms: 'point', talk: true,
    });
    pose(DITA, t, {
      x: 0.6, z: 1.5, ry: -0.5,
      expr: 'worried', arms: 'chin',
    });

    if (t < at('Miringkan') - 0.3) {
      shot(t, CUT[2], at('Miringkan') - 0.3,
        [0, 0.5, 2.8], [0, 0.5, -0.2], { push: 0.07 });
      chip('Kata leluhur Batak…', 540, 300, CUT[2] + 0.5, { size: 0.9 });
    } else {
      closeUp(t, PAK_SIMBOLON, at('Miringkan') - 0.3, CUT[3], { side: 0.3 });
      chip('bawah lebih lebar\ndari atas', 540, 310, at('Miringkan'), { size: 0.88, stamp: true });
    }
  }

  // ── Beat 3: SAINS — segitiga tersembunyi, gempa ───────────────────────
  if (k === 3) {
    bawahSet();
    SCN.fog.near = 7; SCN.fog.far = 20;

    PAK_SIMBOLON.visible = false;
    DITA.visible = false;

    // global camera shake during gempa
    SHAKE = t > at('gempa') - 0.1 && t < at('goyang', 0) + 1.4
      ? Math.max(0, 0.09 - (t - at('gempa')) * 0.03)
      : 0;

    if (t < at('segitiga', 1) + 0.3) {
      shot(t, CUT[3], at('segitiga', 1) + 0.3,
        [0, 0.6, 2.5], [0, 0.6, -0.5], { push: 0.07 });
      bigWord('SEGITIGA', CUT[3] + 0.4, at('segitiga', 1) + 1.0, { y: 480, col: '#FFC23C' });
    } else {
      shot(t, at('segitiga', 1) + 0.3, CUT[4],
        [-1.4, 0.3, 2.2], [0, 0.5, -0.5], { push: 0.08 });
      chip('rumah bergoyang —\ntapi tidak roboh', 540, 310,
        at('goyang', 0), { size: 0.82, bg: '#C8552E', stamp: true });
    }
  }

  // ── Beat 4: LAPISAN KEDUA — battered column, Rumah Bolon ─────────────
  if (k === 4) {
    balSet('sore');
    PAK_SIMBOLON.visible = false;
    DITA.visible = false;

    if (t < at('battered') - 0.2) {
      shot(t, CUT[4], at('battered') - 0.2,
        [3.2, 1.3, 5.0], [0, 0.6, -1.5], { push: 0.09, drift: 0.03 });
      chip('Prinsip jembatan modern', 540, 300, CUT[4] + 0.5, { size: 0.88 });
    } else {
      shot(t, at('battered') - 0.2, CUT[5],
        [-3.5, 0.5, 4.0], [-0.5, 0.4, -1.8], { push: 0.09 });
      chip('"battered column"', 540, 300, at('battered') - 0.1, { size: 1.05, stamp: true });
      card(['Rumah Bolon', 'Batak Toba'], 540, 420, at('Bolon') - 0.1);
    }
  }

  // ── Beat 5: PERUBAHAN — Dita pegang tiang, Pak Simbolon tertawa ───────
  if (k === 5) {
    bawahSet();
    SCN.fog.near = 7; SCN.fog.far = 20;

    pose(PAK_SIMBOLON, t, {
      x: -0.9, z: 1.5, ry: 0.5,
      expr: t > at('tertawa') - 0.1 ? 'laugh' : 'smile',
      arms: 'down',
      talk: t > at('Pak', 1) - 0.05,
    });
    pose(DITA, t, {
      x: 0.5, z: 1.2, ry: -0.3,
      expr: t > at('Kokoh') ? 'happy' : 'worried',
      arms: t < at('goyang', 1) - 0.1 ? 'reach' : 'hold',
      talk: t > at('Jadi') && t < at('lurus') + 1.5,
    });

    if (t < at('Pak', 1) - 0.05) {
      closeUp(t, DITA, CUT[5], at('Pak', 1) - 0.05, { side: -0.35 });
    } else {
      closeUp(t, PAK_SIMBOLON, at('Pak', 1) - 0.05, CUT[6], { side: 0.3 });
    }
  }

  // ── Beat 6: CTA ───────────────────────────────────────────────────────
  if (k === 6) {
    balSet('sore');

    pose(PAK_SIMBOLON, t, {
      x: -0.7, z: 1.2, ry: 0.25,
      expr: 'happy', arms: 'cheer',
    });
    pose(DITA, t, {
      x: 0.6, z: 1.2, ry: -0.25,
      expr: 'happy', arms: 'wave',
    });

    shot(t, CUT[6], DURATION, [0, 1.4, 5.5], [0, 0.7, 0], { drift: 0.05 });
    card(['DI DAERAHMU ADA?', 'Rumah adat dengan', 'tiang miring/unik?'],
      540, 420, CUT[6] + 0.4);
    chip('Tulis di komentar!', 540, 1560, CUT[6] + 0.8, { size: 1.0, stamp: true });
  }
}

renderFrame(0);
