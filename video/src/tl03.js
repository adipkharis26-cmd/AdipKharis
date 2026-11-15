// Ternyata Leluhur TL03 — "Kenapa Rumah Ini Tidak Ditanam ke Tanah?"
// Tokoh fiksi: Mak Intan (nenek Minang, kerudung biru tua, kawung cokelat-emas), Reza (anak muda, plaid).

KEYWORDS = new Set([
  'gadang', 'sandi', 'ditanam', 'lempeng', 'bergerak', 'bergeser',
  'isolasi', 'seismikteknologi', 'base', 'isolation', 'runtuh', 'daerahmu',
]);

window.EXTRA_SFX = [
  { t: 0.0,                       type: 'angin',   d: 10,  gain: 0.18 },
  { t: at('Reza', 0) - 0.1,      type: 'langkah', d: 1.2, gain: 0.4  },
  { t: at('sandi', 0) - 0.1,     type: 'kayu',    d: 0.8, gain: 0.5  },
  { t: at('lempeng') - 0.1,      type: 'gempa',   d: 1.0, gain: 0.22 },
  { t: at('Padang', 0) + 0.3,    type: 'gempa',   d: 1.4, gain: 0.45 },
  { t: at('jongkok') - 0.1,      type: 'langkah', d: 0.8, gain: 0.3  },
  { t: at('daerahmu') - 0.2,     type: 'angin',   d: 8,   gain: 0.2  },
];

// ── Tokoh ─────────────────────────────────────────────────────────────────
const MAK_INTAN = makeChar({
  shirt:   '#6B3E1A', pattern: 'kawung', pat2: '#D4A840',
  sarung:  '#3A2A1A',
  hair:    'white',
  hat:     'kerudung', hatCol: '#264A5A',
});

const REZA = makeChar({
  shirt:   '#3A3A3A', pattern: 'plaid', pat2: '#E0E0E0',
  pants:   '#2A2A2A',
  hair:    'black',
});

// ── Batu sandi (alas tiang) ───────────────────────────────────────────────
function sandiStone(r) {
  const G = grp();
  r = r || 0.22;
  const bs = sph(r, '#8B7355', { rough: 0.92 });
  bs.scale.set(1.1, 0.42, 1.05);
  G.add(bs);
  // urat batu
  [0, 0.7, 1.5, 2.3, 3.8, 5.0].forEach((a, i) => {
    const vg = cyl(0.004, 0.004, r * 1.5, '#5E4A30', { ol: 0 }, 4);
    vg.rotation.z = a; vg.rotation.x = 0.4 + i * 0.2;
    G.add(vg);
  });
  return G;
}

// Tiang kayu pendek + batu sandi di bawah
function tiangSandi(h) {
  h = h || 1.2;
  const G = grp();
  G.add(at3(cyl(0.1, 0.09, h, '#7A5C3A', { rough: 0.88, ol: 0.012 }, 8), 0, h / 2, 0));
  G.add(at3(sandiStone(0.26), 0, 0.03, 0));
  return G;
}

const SANDI_CLOSE = prop(tiangSandi(1.5));

// ── KAMPUNG set ───────────────────────────────────────────────────────────
const KAMPUNG = build('kampung', () => {
  const G = grp(ground('rumput', 24));

  // rumah gadang utama
  const rumah = rumahPanggung({ stilt: 1.2, gonjong: true, weave: true });
  at3(rumah, 0, 0, -5); G.add(rumah);

  // batu sandi di sudut tiang rumah (dekoratif)
  [[-1.4, 0, -3.4], [1.4, 0, -3.4], [-1.4, 0, -6.6], [1.4, 0, -6.6]].forEach(([x, y, z]) =>
    G.add(at3(sandiStone(0.18), x, y, z))
  );

  G.add(at3(palm(3.2, 0.18),  -4.0, 0, -3.5));
  G.add(at3(palm(2.8, 0.15),   5.5, 0, -5.0));
  G.add(at3(tree(2.6),         3.0, 0, -4.0));
  G.add(at3(tree(2.2),        -6.0, 0, -6.0));
  G.add(at3(hill(14, 5, '#5A9E4A'), -18, -1, -28));
  G.add(at3(hill(16, 5.5, '#4E8E3E'), 16, -1.5, -30));
  G.add(at3(hill(12, 7,   '#6AAA50'),  0, -2,   -36));

  [[- 8, 10, -22], [7, 12, -26], [2, 14, -32]].forEach(([x, y, z], i) => {
    const c = cloud(1.6 + i * 0.3);
    c.userData.update = tp => { c.position.x = x + tp * 0.035; };
    G.add(at3(c, x, y, z));
  });
  return G;
});

// ── SAINS set (close-up tiang + batu sandi, latar alam) ───────────────────
const SAINS = build('sains', () => {
  const G = grp(ground('kerikil', 16));
  // dua tiang + sandi
  G.add(at3(tiangSandi(1.8), -1.0, 0, -1.5));
  G.add(at3(tiangSandi(1.8),  1.0, 0, -1.5));
  // platform kolong bawah rumah
  G.add(at3(rbox(4, 0.08, 3, '#7A5C3A', { rough: 0.9 }), 0, 1.84, -1.5));

  G.add(at3(hill(10, 4, '#5A9E4A'), -10, -1, -20));
  G.add(at3(hill(12, 5, '#4E8E3E'),  10, -1, -22));
  G.add(at3(tree(2.2), -4, 0, -5));
  G.add(at3(tree(2.0),  4, 0, -6));
  return G;
});

// ── RISET set (papan penelitian) ──────────────────────────────────────────
const RISET = build('riset', () => {
  const G = grp(ground('rumput', 20));
  G.add(at3(
    board('unbrah-gempa', ['GEMPA 2009', 'UNBRAH', 'LEBIH SEDIKIT'], { w: 1.8, h: 0.9, hi: [0] }),
    0.2, 1.4, -4));
  G.add(at3(palm(2.6, 0.15), -3.5, 0, -3.5));
  G.add(at3(tree(2.2),        3.5, 0, -4.5));
  G.add(at3(hill(10, 4, '#5A9E4A'), -10, -1, -18));
  return G;
});

// ── Helpers ───────────────────────────────────────────────────────────────
function kampungSet(m) {
  show(KAMPUNG);
  sky('desa');
  if (m) mood(m);
  SCN.fog.near = 20; SCN.fog.far = 65;
}

// ── Scene ─────────────────────────────────────────────────────────────────
function scene(t) {
  const k = beatOf(t);
  MAK_INTAN.visible = true;
  REZA.visible = true;

  // ── Beat 0: HOOK — rumah gadang berdiri di atas batu ──────────────────
  if (k === 0) {
    kampungSet();
    REZA.visible = false;
    pose(MAK_INTAN, t, {
      x: 0.0, z: 0.6, ry: 0.08,
      expr: 'flat', arms: 'down',
    });

    if (t < 4.5) {
      // wide shot rumah gadang
      shot(t, 0, 4.5, [0, 2.2, 10], [0, 0.9, -4], { drift: 0.08 });
      bigWord('TIGA RATUS TAHUN', 0.3, 4.4, { y: 500, col: '#FFC23C' });
    } else {
      // push ke rumah + tiang + batu sandi
      shot(t, 4.5, CUT[1], [-1.8, 0.5, 2.5], [-1.2, 0.2, -3.5], { push: 0.12 });
      chip('Tiangnya duduk di atas batu', 0, 300, 4.7, { size: 0.9 });
    }
  }

  // ── Beat 1: KONFLIK — Reza geleng-geleng ───────────────────────────────
  if (k === 1) {
    kampungSet();
    const tEnter = CUT[1];
    const entered = ease(seg(t, tEnter, tEnter + 1.4));
    pose(REZA, t, {
      x: lerp(2.8, 0.55, entered), z: lerp(-3, 0.5, entered),
      ry: -0.5,
      walk: entered < 1,
      expr: t < at('ambruk') ? 'flat' : (t < at('Mak', 1) ? 'talk' : 'flat'),
      arms: t < at('ambruk') ? 'down' : 'shrug',
    });
    pose(MAK_INTAN, t, {
      x: -0.4, z: 0.8, ry: 0.5,
      expr: t < at('Intan', 0) ? 'flat' : (t < CUT[2] ? 'talk' : 'smile'),
      arms: 'down',
    });

    if (t < at('ambruk') + 0.5) {
      // wide: Reza masuk
      shot(t, CUT[1], at('ambruk') + 0.5, [0.4, 0.9, 5.2], [0.1, 0.55, 0], { drift: 0.06 });
    } else if (t < at('Intan', 0) - 0.1) {
      // closeUp Reza saat dialog
      closeUp(t, REZA, at('ambruk') + 0.5, at('Intan', 0) - 0.1, { side: -0.4 });
    } else {
      closeUp(t, MAK_INTAN, at('Intan', 0) - 0.1, CUT[2], { side: 0.3 });
      chip('Justru sebaliknya!', 0, 350, at('Intan', 0), { size: 1.0, bg: '#C8552E', stamp: true });
    }
  }

  // ── Beat 2: RAHASIA LELUHUR — sandi, bebas bergeser ───────────────────
  if (k === 2) {
    kampungSet();
    pose(MAK_INTAN, t, {
      x: -0.3, z: 1.0, ry: 0.15,
      expr: 'talk', talk: true, arms: 'point',
    });
    pose(REZA, t, {
      x: 0.5, z: 1.2, ry: -0.3,
      expr: 'flat', arms: 'down',
    });

    // MAK_INTAN x=-0.3, z=1.0  → closeUp kanan: cam (0.65, 1.2, 1.9) → target (-0.3, 0.75, 1.0)
    if (t < at('sandi', 0) - 0.5) {
      closeUp(t, MAK_INTAN, CUT[2], at('sandi', 0) - 0.5, { side: 0.3 });
    } else if (t < at('duduk', 1) + 0.2) {
      shot(t, at('sandi', 0) - 0.5, at('duduk', 1) + 0.2,
        [-1.4, 0.75, 2.0], [-1.3, 0.1, -2.8], { push: 0.14 });
      chip('Namanya sandi', 0, 320, at('sandi', 0), { size: 1.0, stamp: true });
    } else {
      closeUp(t, MAK_INTAN, at('duduk', 1) + 0.2, CUT[3], { side: 0.2 });
      chip('Tiang bergeser—lalu balik', 0, 350, at('duduk', 1) + 0.5, { size: 0.85 });
    }
  }

  // ── Beat 3: SAINS — lempeng, batu sandi ikut bergerak ─────────────────
  if (k === 3) {
    show(SAINS);
    sky('desa');
    mood('siang');
    SCN.fog.near = 14; SCN.fog.far = 50;

    // Animasi gemetar batu sandi saat "gempa"
    const tGempa = at('gempa', 2);
    const shakeAmt = t > tGempa ? Math.sin(t * 28) * ease(seg(t, tGempa, tGempa + 0.9)) * 0.015 : 0;
    SANDI_CLOSE.visible = true;
    SANDI_CLOSE.position.set(-0.1 + shakeAmt, 0, 0.5);
    SANDI_CLOSE.rotation.y = 0;

    if (t < at('lempeng') + 0.5) {
      shot(t, CUT[3], at('lempeng') + 0.5, [0, 1.4, 4.5], [0, 0.5, -1.2], { drift: 0.06 });
      chip('Sesar Semangko', -0.1, 280, CUT[3] + 0.4, { size: 1.0, stamp: true });
    } else if (t < at('tersebar') + 0.5) {
      // close batu sandi: tampilkan bergetar
      shot(t, at('lempeng') + 0.5, at('tersebar') + 0.5,
        [-0.1, 0.6, 2.8], [-0.1, 0.2, 0], { push: 0.1 });
      chip('Batu sandi ikut bergerak', 0, 300, at('gempa,', 1), { size: 0.88 });
    } else {
      shot(t, at('tersebar') + 0.5, CUT[4], [0, 1.0, 3.0], [0, 0.5, -1.2], { drift: 0.05 });
      chip('Energi tersebar', 0, 320, at('tersebar') + 0.2, { size: 0.9, stamp: true });
      chip('Tiang tidak patah', 0, 430, at('patah') - 0.2, { size: 0.9 });
    }
  }

  // ── Beat 4: LAPISAN KEDUA — penelitian, isolasi seismik ───────────────
  if (k === 4) {
    show(RISET);
    sky('desa');
    mood('siang');
    SCN.fog.near = 18; SCN.fog.far = 55;

    if (t < at('runtuh') + 0.5) {
      shot(t, CUT[4], at('runtuh') + 0.5, [1.0, 1.6, 6.0], [0.3, 0.6, -3], { drift: 0.06 });
      chip('Gempa Padang 2009', 0, 280, CUT[4] + 0.5, { size: 1.0, stamp: true });
      chip('Rumah Gadang lebih tahan', 0, 400, at('runtuh') - 0.3, { size: 0.85 });
    } else {
      shot(t, at('runtuh') + 0.5, CUT[5], [0.3, 1.5, 5.0], [0.3, 0.6, -2.5], { push: 0.1 });
      bigWord('ISOLASI SEISMIK', at('isolasi') - 0.1, at('dikembangkan') + 0.5,
        { y: 520, col: '#FFC23C' });
      chip('Teknologi modern Jepang', 0, 400, at('dikembangkan') - 0.1, { size: 0.85 });
    }
  }

  // ── Beat 5: PERUBAHAN — Reza jongkok, periksa batu sandi ──────────────
  if (k === 5) {
    kampungSet('sore');
    pose(MAK_INTAN, t, {
      x: -0.5, z: 1.2, ry: 0.35,
      expr: t < at('kaku') ? 'smile' : 'happy', arms: 'down',
    });
    pose(REZA, t, {
      x: 0.4, z: 1.0, ry: -0.4,
      expr: t < at('isolation', 0) ? 'flat' : 'talk',
      arms: t < at('isolation', 0) ? 'reach' : 'point',
    });

    // REZA x=0.4,z=1.0 closeUp kiri: cam(-0.4,1.2,1.9)→(0.4,0.75,1.0)
    // MAK_INTAN x=-0.5,z=1.2 closeUp kanan: cam(0.55,1.2,2.1)→(-0.5,0.75,1.2)
    if (t < at('isolation', 0) - 0.2) {
      shot(t, CUT[5], at('isolation', 0) - 0.2,
        [0.6, 0.6, 3.5], [0.1, 0.2, -1.5], { push: 0.12 });
    } else if (t < at('Intan', 2) - 0.2) {
      closeUp(t, REZA, at('isolation', 0) - 0.2, at('Intan', 2) - 0.2, { side: -0.3 });
      chip('Base isolation', 0, 350, at('base') + 0.1, { size: 1.1, stamp: true });
    } else {
      closeUp(t, MAK_INTAN, at('Intan', 2) - 0.2, CUT[6], { side: 0.25 });
      chip('Rumah yang hidup,\ntidak boleh kaku', 0, 320, at('kaku') - 0.4, { size: 0.82 });
    }
  }

  // ── Beat 6: CTA ────────────────────────────────────────────────────────
  if (k === 6) {
    kampungSet('sore');
    pose(MAK_INTAN, t, {
      x: -0.4, z: 1.3, ry: 0.2,
      expr: 'smile', arms: 'wave',
    });
    pose(REZA, t, {
      x: 0.5, z: 1.4, ry: -0.2,
      expr: 'happy', arms: 'cheer',
    });

    shot(t, CUT[6], DURATION, [0, 1.4, 5.5], [0.0, 0.7, 0], { drift: 0.05 });
    card(['DI DAERAHMU ADA?', 'Rumah panggung/adat', 'yang masih berdiri?'],
      0, 420, CUT[6] + 0.4);
    chip('Tulis di komentar!', 0, 1560, CUT[6] + 0.8, { size: 1.0, stamp: true });
  }
}

renderFrame(0);
