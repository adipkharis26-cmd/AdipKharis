// Ternyata Leluhur TL04 — "Kenapa Kapal Sebesar Ini Tidak Dipaku?"
// Tokoh fiksi: Pak Daeng (pembuat kapal Bugis, peci, tenun emas), Hendra (mahasiswa teknik, cap merah).

KEYWORDS = new Set([
  'phinisi', 'paku', 'pasak', 'mengembang', 'berkarat', 'merenggang',
  'UNESCO', 'Warisan', 'daerahmu', 'sambungan', 'leluhur',
]);

window.EXTRA_SFX = [
  { t: 0.0,                       type: 'ombak',   d: 12,  gain: 0.25 },
  { t: at('Hendra', 0) - 0.1,    type: 'langkah', d: 1.2, gain: 0.4  },
  { t: at('pasak', 1) - 0.1,     type: 'kayu',    d: 0.8, gain: 0.55 },
  { t: at('mengembang', 0) - 0.1,type: 'kayu',    d: 0.6, gain: 0.4  },
  { t: at('berkarat', 0) - 0.1,  type: 'palu',    d: 0.5, gain: 0.3  },
  { t: at('UNESCO') - 0.1,       type: 'stamp',   d: 0.6, gain: 1.0  },
  { t: at('Hendra', 1) - 0.1,   type: 'langkah', d: 0.7, gain: 0.3  },
  { t: at('daerahmu') - 0.2,     type: 'ombak',   d: 8,   gain: 0.2  },
];

// ── Tokoh ─────────────────────────────────────────────────────────────────
const PAK_DAENG = makeChar({
  shirt:   '#3A1A0A', pattern: 'tenun', pat2: '#D4B060',
  sarung:  '#1E2E3A',
  hair:    'grey', beard: true,
  hat:     'peci', hatCol: '#1A1A1A',
});

const HENDRA = makeChar({
  shirt:   '#1E3A5E', pattern: 'plaid', pat2: '#90AACF',
  pants:   '#1A2535',
  hair:    'black',
  hat:     'cap', hatCol: '#C8341A',
});

// ── Phinisi hull ──────────────────────────────────────────────────────────
function phinisiHull() {
  const G = grp();
  const woodDark = texMat('planks', '#7A5230', '#553820', [4, 2]);
  const woodDeck = texMat('planks', '#9C6B3C', '#6E4A28', [3, 1]);

  // main hull body
  const hull = box(1.8, 0.9, 7.0, woodDark, { ol: 0.016 });
  hull.scale.set(1, 1, 1);
  G.add(at3(hull, 0, 0.45, 0));

  // bow taper — angled wedge at front
  const bow = box(1.8, 0.9, 1.2, woodDark, { ol: 0.012 });
  bow.scale.set(0.3, 1, 1);
  G.add(at3(bow, 0, 0.45, -4.1, 0, 0, 0));

  // hull keel bottom strip
  G.add(at3(box(0.3, 0.14, 7.5, '#3A2010', { ol: 0.008 }), 0, 0.03, 0));

  // deck
  G.add(at3(flat(1.76, 6.8, woodDeck, 0.92)));

  // cabin / superstructure
  G.add(at3(box(1.4, 0.75, 2.0, woodDark, { ol: 0.012 }), 0, 1.295, 1.5));
  G.add(at3(box(1.3, 0.08, 2.0, '#B08050', {}), 0, 1.68, 1.5));

  // mast front
  G.add(at3(cyl(0.045, 0.03, 4.8, '#4A2A0E', { ol: 0.008 }, 8), 0, 3.32, -1.0));
  // mast main (taller)
  G.add(at3(cyl(0.055, 0.04, 6.0, '#4A2A0E', { ol: 0.008 }, 8), 0, 3.92, 1.5));

  // boom (horizontal) on front mast
  G.add(at3(cyl(0.025, 0.025, 2.2, '#5A3010', { ol: 0.006 }, 6), 0, 1.5, -1.0, 0, 0, Math.PI / 2));

  // rigging lines (thin diagonal lines)
  [[-0.9, 2.1, -1.0, 0, 5.4, 1.5], [0.9, 2.1, -1.0, 0, 5.4, 1.5]].forEach(([x1, y1, z1, x2, y2, z2]) => {
    const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const r = cyl(0.012, 0.012, len, '#3A1A08', { ol: 0, cast: false }, 4);
    r.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
    r.lookAt(x2, y2, z2);
    r.rotateX(Math.PI / 2);
    G.add(r);
  });

  return G;
}

// ── Pasak detail (close-up sambungan) ────────────────────────────────────
function pasakDemo() {
  const G = grp();
  const plankMat = texMat('planks', '#9E6E3A', '#6E4A24', [2, 1]);
  const rustMat  = mat('#7A3A1A', { rough: 0.95, metal: 0.5 });

  // plank A (left): pasak kayu — clean
  G.add(at3(box(0.6, 0.35, 1.2, plankMat, { ol: 0.01 }), -0.65, 0.175, 0));
  G.add(at3(box(0.6, 0.35, 1.2, plankMat, { ol: 0.01 }), -0.65, 0.175, 1.3));
  // pasak (wooden dowel, slightly proud of surface)
  G.add(at3(cyl(0.07, 0.065, 0.42, '#5A3A18', { ol: 0.012 }, 10), -0.65, 0.42, 0.65, Math.PI / 2, 0, 0));
  // label
  chip('Pasak kayu', -0.65, 300, 0, { size: 0.85 });

  // plank B (right): paku besi — berkarat
  G.add(at3(box(0.6, 0.35, 1.2, plankMat, { ol: 0.01 }),  0.65, 0.175, 0));
  G.add(at3(box(0.6, 0.35, 1.2, plankMat, { ol: 0.01 }),  0.65, 0.175, 1.3));
  // paku (nail — longer, rusted)
  G.add(at3(cyl(0.04, 0.04, 0.55, rustMat, { ol: 0.01 }, 8),  0.65, 0.42, 0.65, Math.PI / 2, 0, 0));
  G.add(at3(box(0.12, 0.05, 0.12, rustMat, {}), 0.65, 0.42, 0.37));
  chip('Paku besi', 0.65, 300, 0, { size: 0.85 });

  return G;
}

// ── GALANGAN set ──────────────────────────────────────────────────────────
const GALANGAN = build('galangan', () => {
  const G = grp(ground('pasir', 30));
  const hull = phinisiHull();
  at3(hull, 0, 0, -3);
  G.add(hull);

  // kayu-kayu landasan bawah kapal
  [-2.5, -0.5, 1.5, 3.5].forEach(z =>
    G.add(at3(box(2.4, 0.22, 0.28, '#5A3A1E', { ol: 0.008 }), 0, 0.1, z))
  );

  // sea in background
  const laut = sea(60, 25, '#2A6EA8');
  G.add(at3(laut, 0, 0.05, -20));

  G.add(at3(palm(3.5, 0.2),  -6.5, 0,  3.5));
  G.add(at3(palm(3.0, 0.18),  7.0, 0,  2.0));
  G.add(at3(tree(2.5),        5.5, 0, -4.0));
  G.add(at3(tree(2.2),       -5.0, 0, -4.5));

  [[-9, 10, -18], [7, 11, -20], [1, 13, -24]].forEach(([x, y, z], i) => {
    const c = cloud(1.5 + i * 0.3);
    c.userData.update = tp => { c.position.x = x + tp * 0.04; };
    G.add(at3(c, x, y, z));
  });
  return G;
});

// ── PASAK_CLOSE set ────────────────────────────────────────────────────────
const PASAK_CLOSE = build('pasak_close', () => {
  const G = grp(ground('lantai', 8));
  G.add(at3(pasakDemo(), 0, 0, -0.8));
  G.add(at3(hill(8, 3, '#5A9E4A'), -8, -1, -12));
  G.add(at3(hill(10, 4, '#4E8E3E'), 8, -1, -14));
  return G;
});

// ── Helpers ───────────────────────────────────────────────────────────────
function galSet(m) {
  show(GALANGAN);
  sky('pantai');
  if (m) mood(m);
  SCN.fog.near = 22; SCN.fog.far = 70;
}

// ── Scene ─────────────────────────────────────────────────────────────────
function scene(t) {
  const k = beatOf(t);
  PAK_DAENG.visible = true;
  HENDRA.visible = true;

  // ── Beat 0: HOOK — phinisi tanpa paku ─────────────────────────────────
  if (k === 0) {
    galSet();
    HENDRA.visible = false;
    pose(PAK_DAENG, t, {
      x: 1.4, z: 1.2, ry: -0.3,
      expr: 'flat', arms: 'down',
    });

    if (t < 5.0) {
      // wide shot phinisi dari samping
      shot(t, 0, 5.0, [0, 2.8, 11], [0, 1.2, -2], { drift: 0.06 });
      bigWord('TANPA PAKU', 0.4, 4.9, { y: 480, col: '#FFC23C' });
    } else {
      // push ke haluan + Pak Daeng
      shot(t, 5.0, CUT[1], [2.5, 1.0, 5.5], [1.0, 0.7, 0], { push: 0.1 });
      chip('Pasak kayu mengikat semuanya', 0, 290, 5.2, { size: 0.9 });
    }
  }

  // ── Beat 1: KONFLIK — Hendra geleng ───────────────────────────────────
  if (k === 1) {
    galSet();
    const tEnter = CUT[1];
    const entered = ease(seg(t, tEnter, tEnter + 1.4));
    pose(HENDRA, t, {
      x: lerp(3.0, 0.5, entered), z: lerp(-2.5, 0.8, entered),
      ry: -0.5,
      walk: entered < 1,
      expr: entered < 1 ? 'flat' : 'shock',
      arms: entered < 1 ? 'down' : 'shrug',
    });
    pose(PAK_DAENG, t, {
      x: 1.4, z: 1.2, ry: -0.4,
      expr: t > at('Daeng', 0) ? 'smile' : 'flat',
      arms: t > at('Daeng', 0) ? 'hips' : 'down',
      talk: true,
    });

    if (t < at('bocor') - 0.2) {
      shot(t, CUT[1], at('bocor') - 0.2, [0.4, 1.0, 5.8], [0.6, 0.65, 0], { drift: 0.04 });
    } else if (t < at('Daeng', 0) - 0.1) {
      closeUp(t, HENDRA, at('bocor') - 0.2, at('Daeng', 0) - 0.1, { side: -0.4 });
    } else {
      closeUp(t, PAK_DAENG, at('Daeng', 0) - 0.1, CUT[2], { side: 0.3 });
    }
  }

  // ── Beat 2: RAHASIA — pasak kayu ──────────────────────────────────────
  if (k === 2) {
    const tLaut = at('mengembang', 0) - 0.2;

    if (t < tLaut) {
      galSet();
      pose(PAK_DAENG, t, {
        x: 1.4, z: 1.2, ry: -0.5,
        expr: 'talk', arms: 'point', talk: true,
      });
      pose(HENDRA, t, {
        x: 0.5, z: 0.8, ry: 0.2,
        expr: 'worried', arms: 'chin',
      });
      if (t < at('pasak', 1) - 0.1) {
        closeUp(t, PAK_DAENG, CUT[2], at('pasak', 1) - 0.1, { side: 0.3 });
      } else {
        // show hull planks — push ke sambungan
        shot(t, at('pasak', 1) - 0.1, tLaut,
          [-1.0, 0.7, 2.0], [-0.5, 0.45, -2.5], { push: 0.07 });
      }
    } else {
      // close-up pasak demo
      show(PASAK_CLOSE);
      sky('dalam');
      mood('siang');
      PAK_DAENG.visible = false;
      HENDRA.visible = false;
      SCN.fog.near = 8; SCN.fog.far = 25;
      shot(t, tLaut, CUT[3],
        [0, 0.6, 1.8], [0, 0.2, -0.5], { push: 0.05 });
      chip('Kayu mengembang → celah tertutup', 0, 300, tLaut + 0.2, { size: 0.88 });
    }
  }

  // ── Beat 3: SAINS — mengembang vs berkarat ────────────────────────────
  if (k === 3) {
    show(PASAK_CLOSE);
    sky('dalam');
    mood('siang');
    PAK_DAENG.visible = false;
    HENDRA.visible = false;
    SCN.fog.near = 8; SCN.fog.far = 25;

    if (t < at('berkarat', 0) - 0.2) {
      // close-up pasak sisi kiri (kayu sehat)
      shot(t, CUT[3], at('berkarat', 0) - 0.2,
        [-0.65, 0.5, 1.4], [-0.65, 0.2, 0.3], { push: 0.06 });
      card(['sepuluh persen lebih rapat', 'saat basah'], -0.65, 320, CUT[3] + 0.2);
    } else {
      // pivot ke sisi kanan (paku berkarat)
      shot(t, at('berkarat', 0) - 0.2, CUT[4],
        [0.65, 0.5, 1.4], [0.65, 0.2, 0.3], { push: 0.06 });
      card(['paku besi → korosi', 'sambungan merenggang'], 0.65, 320, at('berkarat', 0) + 0.1);
    }
  }

  // ── Beat 4: LAPISAN KEDUA — phinisi berlayar + UNESCO ─────────────────
  if (k === 4) {
    galSet('siang');
    PAK_DAENG.visible = false;
    HENDRA.visible = false;
    SCN.fog.near = 24; SCN.fog.far = 72;

    if (t < at('UNESCO') - 0.3) {
      // wide shot phinisi — kamera bergerak seperti berlayar
      const drift = ease(seg(t, CUT[4], at('UNESCO') - 0.3));
      shot(t, CUT[4], at('UNESCO') - 0.3,
        [lerp(5, -4, drift), 2.5, 10],
        [0, 1.0, -2], { drift: 0.03 });
    } else {
      // UNESCO card
      shot(t, at('UNESCO') - 0.3, CUT[5],
        [0, 2.2, 9], [0, 0.8, -2], { drift: 0.04 });
      card(['UNESCO 2017', 'Warisan Budaya', 'Tak Benda Dunia'], 0, 420, at('UNESCO') + 0.1);
      bigWord('UNESCO', at('UNESCO') - 0.1, at('Warisan') - 0.1, { y: 820, col: '#FFC23C' });
    }
  }

  // ── Beat 5: PERUBAHAN — Hendra pegang pasak ───────────────────────────
  if (k === 5) {
    galSet();
    SCN.fog.near = 22; SCN.fog.far = 70;
    const hendra_reach = t > at('pasak', 2) - 0.2;
    pose(HENDRA, t, {
      x: 0.5, z: 0.8, ry: 0.15,
      expr: hendra_reach ? 'happy' : 'talk',
      arms: hendra_reach ? 'reach' : 'chin',
      talk: t > at('pasak', 2) && t < at('Daeng', 1) - 0.3,
    });
    pose(PAK_DAENG, t, {
      x: 1.5, z: 1.2, ry: -0.3,
      expr: t > at('Daeng', 1) ? 'smile' : 'flat',
      arms: t > at('Daeng', 1) ? 'hips' : 'down',
      nod: t > at('Daeng', 1),
      talk: t > at('berkarat', 1) && t < atEnd('kerja'),
    });

    if (t < at('pasak', 2) + 0.5) {
      // wide both
      shot(t, CUT[5], at('pasak', 2) + 0.5,
        [0.4, 1.0, 5.5], [0.7, 0.65, 0], { drift: 0.03 });
    } else if (t < at('Daeng', 1) - 0.2) {
      closeUp(t, HENDRA, at('pasak', 2) + 0.5, at('Daeng', 1) - 0.2, { side: -0.35 });
    } else {
      closeUp(t, PAK_DAENG, at('Daeng', 1) - 0.2, CUT[6], { side: 0.3 });
    }
  }

  // ── Beat 6: CTA — perahu daerahmu ─────────────────────────────────────
  if (k === 6) {
    galSet();
    PAK_DAENG.visible = false;
    HENDRA.visible = false;
    SCN.fog.near = 24; SCN.fog.far = 72;

    shot(t, CUT[6], DURATION, [0, 3.0, 12], [0, 0.8, -3], { drift: 0.06 });
    chip('Perahu tradisionalmu?', 0, 300, CUT[6] + 0.3, { size: 0.95 });
  }
}
