// Ternyata Leluhur TL02 — "Kenapa Petani Ini Melepas Bebek ke Sawahnya?"
// Tokoh fiksi: Mak Zubaidah (petani perempuan tua, caping, tenun), Bagas (anak muda dari kota, cap, dots).

KEYWORDS = new Set([
  'pestisida', 'panennya', 'bebek', 'wereng', 'keong', 'hama',
  'kebal', 'pupuk', 'menumpang', 'kenyang', 'mengurangi', 'persen',
  'institut', 'padi-bebek', 'kotorannya', 'petani', 'daerahmu', 'disemprot',
]);

window.EXTRA_SFX = [
  { t: 0.0,                       type: 'angin',   d: 8,   gain: 0.18 },
  { t: at('bebek', 0) - 0.2,      type: 'ramai',   d: 1.4, gain: 0.55 },
  { t: at('soalnya'),              type: 'ombak',   d: 2.8, gain: 0.38 },
  { t: at('wereng') - 0.1,        type: 'ramai',   d: 1.0, gain: 0.6  },
  { t: at('Peneliti') + 0.5,      type: 'langkah', d: 1.2, gain: 0.4  },
  { t: at('Sore'),                 type: 'angin',   d: 15,  gain: 0.22 },
  { t: at('menggiring') - 0.1,    type: 'ramai',   d: 2.4, gain: 0.9  },
];

// ── Tokoh ─────────────────────────────────────────────────────────────────
const MAK = makeChar({
  shirt:   '#8A2020', pattern: 'tenun',  pat2: '#F0C987',
  sarung:  '#3A5A3A',
  hair:    'white',
  hat:     'caping', hatCol: '#D9B86A',
});

const BAGAS = makeChar({
  shirt:   '#3D6FAD', pattern: 'dots',  pat2: '#FFFFFF',
  pants:   '#2A3A4A',
  hat:     'cap',    hatCol: '#1A1A1E',
  glasses: true,
});

const PENELITI = makeChar({
  shirt:   '#2E5A3E', pattern: 'batik', pat2: '#D4B84A',
  pants:   '#2A3A4A',
  hair:    'black',
  glasses: true,
});

// ── Bebek factory ─────────────────────────────────────────────────────────
function duck(bodyCol, headCol) {
  bodyCol = bodyCol || '#F4E8C8';
  headCol = headCol || '#1A5A30';
  const G = grp();
  const body = sph(0.12, bodyCol, { ol: 0.012 }, 14, 9);
  body.scale.set(1.5, 0.75, 1.0);
  at3(body, 0, 0.14, 0); G.add(body);
  G.add(at3(cyl(0.054, 0.062, 0.1, headCol, { ol: 0.008 }, 10), 0, 0.22, 0.07));
  const hd = sph(0.072, headCol, { ol: 0.01 }, 12, 9);
  at3(hd, 0, 0.3, 0.1); G.add(hd);
  G.add(at3(rbox(0.055, 0.022, 0.065, '#E0902A', { ol: 0.006 }), 0, 0.3, 0.19));
  [-1, 1].forEach(sd => {
    const e = sph(0.016, '#1A1A18', { cast: false }, 8, 6);
    at3(e, sd * 0.056, 0.308, 0.148); G.add(e);
    const hl = sph(0.006, '#fff', { cast: false });
    at3(hl, sd * 0.062, 0.312, 0.158); G.add(hl);
  });
  const tl = cone(0.045, 0.1, bodyCol, { ol: 0.006 }, 8);
  tl.rotation.x = -0.9; at3(tl, 0, 0.2, -0.09); G.add(tl);
  [-1, 1].forEach(sd => {
    const w = sph(0.065, '#D8C89A', { cast: false }, 10, 7);
    w.scale.set(0.45, 0.3, 1.5); at3(w, sd * 0.1, 0.13, 0); G.add(w);
  });
  const sh = mesh(
    new THREE.CircleGeometry(0.12, 16),
    mat('#000000', { basic: true, opacity: 0.15 }),
    { cast: false, recv: false }
  );
  sh.rotation.x = -Math.PI / 2; sh.position.y = 0.004; G.add(sh);
  return G;
}

// ── Props ─────────────────────────────────────────────────────────────────
const D1 = prop(duck('#F4E8C8', '#1A5A30'));
const D2 = prop(duck('#F4E8C8', '#1A5A30'));
const D3 = prop(duck('#D4C8A0', '#7A5430'));
const D4 = prop(duck('#F4E8C8', '#1A5A30'));
const D5 = prop(duck('#D4C8A0', '#8A6240'));

function bottleSpray() {
  const G = grp();
  G.add(at3(cyl(0.07, 0.07, 0.3, '#3D6FAD', { ol: 0.01 }), 0, 0.15, 0));
  G.add(at3(cyl(0.015, 0.015, 0.22, '#1A1A1E', { ol: 0.006 }),
            0.07, 0.3, 0, 0, 0, Math.PI / 3));
  G.add(at3(rbox(0.08, 0.025, 0.1, '#1A1A1E', { ol: 0.005 }), 0, 0.1, 0.07));
  return G;
}
const SPRAY = prop(bottleSpray());

// ── Paddy water (ripple lebih halus dari sea()) ───────────────────────────
function paddy(w, d) {
  const geo = new THREE.PlaneGeometry(w, d, 32, 20);
  geo.rotateX(-Math.PI / 2);
  const M = mesh(geo, mat('#7DBBB0', { rough: 0.38 }), { cast: false });
  const base = geo.attributes.position.array.slice();
  M.userData.update = t => {
    const p = geo.attributes.position.array;
    for (let i = 0; i < p.length; i += 3)
      p[i + 1] = base[i + 1]
        + Math.sin(base[i] * 2.8 + t * 0.9) * 0.012
        + Math.cos(base[i + 2] * 3.2 + t * 0.6) * 0.009;
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
  };
  return M;
}

// ── SAWAH set ─────────────────────────────────────────────────────────────
const SAWAH = build('sawah', () => {
  const G = grp();
  G.add(path(1.6, 24));
  [-1, 1].forEach(sd => {
    const P = paddy(10, 24);
    at3(P, sd * 5.4, -0.09, 0); G.add(P);
  });

  // rumpun padi 4 baris
  [
    { xBase:  1.1, n: 34 }, { xBase:  1.8, n: 32 }, { xBase:  2.5, n: 30 },
    { xBase:  3.3, n: 28 }, { xBase:  4.2, n: 26 },
    { xBase: -1.1, n: 34 }, { xBase: -1.8, n: 32 }, { xBase: -2.5, n: 30 },
    { xBase: -3.3, n: 28 }, { xBase: -4.2, n: 26 },
  ].forEach(({ xBase, n }) => {
    for (let k = 0; k < n; k++) {
      const x  = xBase + (rnd(xBase * 7 + k) - 0.5) * 0.6;
      const z  = (k / n) * 22 - 11 + (rnd(xBase * 3 + k * 2 + 5) - 0.5) * 0.5;
      const h  = 0.34 + rnd(k * 3 + xBase * 7) * 0.09;
      const y0 = -0.09;
      G.add(at3(cyl(0.013, 0.015, h, '#6A9C30', {}, 6), x, y0 + h / 2, z));
      const s2 = cyl(0.01, 0.012, h * 0.82, '#5A8C28', {}, 5);
      at3(s2,
        x + (rnd(k * 5 + xBase) - 0.5) * 0.1,
        y0 + h * 0.41,
        z + (rnd(k * 7 + xBase) - 0.5) * 0.1,
        0, 0, (rnd(k + xBase * 11) - 0.5) * 0.25);
      G.add(s2);
      const head = cone(0.02, 0.09, '#C9AB3A', { cast: false }, 8);
      at3(head, x, y0 + h + 0.03, z, 0.18 + rnd(k + xBase * 5) * 0.3, 0, 0);
      G.add(head);
    }
  });

  // pohon latar
  [
    [-5.5, 0, -9], [5.8, 0, -9.5], [-8.5, 0, -11],
    [8.0, 0, -10.5], [-11, 0, -13], [10.5, 0, -12],
  ].forEach(([x, y, z], i) =>
    G.add(at3(i % 3 === 0 ? palm(3.0, 0.2) : tree(2.4), x, y, z)));

  // bukit latar
  G.add(at3(hill(14, 5, '#5A9E4A'), -18, -1, -30));
  G.add(at3(hill(16, 6, '#4E8E3E'),  16, -1.5, -32));
  G.add(at3(hill(10, 7, '#6AAA50'),   0, -2,   -38));

  // awan bergerak
  [[- 8, 11, -24], [7, 13, -28], [1, 14.5, -32]].forEach(([x, y, z], i) => {
    const c = cloud(1.8 + i * 0.3);
    c.userData.update = t => { c.position.x = x + t * 0.04; };
    G.add(at3(c, x, y, z));
  });

  return G;
});

// ── RESEARCH set (papan IPB) ──────────────────────────────────────────────
const RESEARCH = build('research', () => {
  const G = grp(ground('rumput', 20));
  G.add(at3(
    board('ipb-padibebek', ['PADI-BEBEK', 'RISET IPB', '2019'], { w: 1.6, h: 0.8, hi: [0] }),
    0.2, 1.35, -4));
  G.add(at3(palm(2.8, 0.15), -3.0, 0, -3));
  G.add(at3(tree(2.2),        3.5, 0, -4));
  G.add(at3(hill(10, 4, '#5A9E4A'), -10, -1, -20));
  return G;
});

// ── Helpers ───────────────────────────────────────────────────────────────
function sawahSet(m) {
  show(SAWAH);
  sky('desa');
  if (m) mood(m);
  SCN.fog.near = 18; SCN.fog.far = 60;
}

// Posisikan bebek tiap frame saat visible (props auto-hidden di awal frame)
function poseDuck(D, t, o) {
  D.visible = true;
  const ph = o.phase || 0;
  const bob = Math.sin(t * 2.2 + ph) * 0.015;
  D.position.set(
    o.x + (o.walk ? Math.sin(t * 3.0 + ph) * 0.015 : 0),
    (o.y !== undefined ? o.y : -0.09) + bob,
    o.z + (o.walk ? Math.cos(t * 2.4 + ph) * 0.01 : 0)
  );
  D.rotation.set(0, o.ry || 0, Math.sin(t * 3.1 + ph) * 0.04);
}

// ── Scene ─────────────────────────────────────────────────────────────────
function scene(t) {
  const k = beatOf(t);

  // ── Beat 0: HOOK — sawah tanpa pestisida, panen lebih banyak ──────────
  if (k === 0) {
    sawahSet();
    pose(MAK, t, {
      x: 0.1, z: lerp(0.2, 1.6, seg(t, 0, at('Tapi') - 0.1)), ry: 0.08,
      walk: t < at('Tapi') - 0.1,
      expr: t > at('panennya', 0) ? 'happy' : 'talk',
      arms: 'down',
    });
    poseDuck(D1, t, { x:  1.6, z: -0.5, ry:  1.2, phase: 0.0 });
    poseDuck(D2, t, { x:  2.3, z:  1.2, ry: -0.3, phase: 1.1 });
    poseDuck(D3, t, { x: -1.5, z:  0.8, ry:  2.5, phase: 2.1 });

    if (t < at('disemprot', 0) + 0.6) {
      shot(t, 0, at('disemprot', 0) + 0.6, [3.0, 1.2, 7.5], [0.4, 0.5, 0], { drift: 0.12 });
      bigWord('TANPA PESTISIDA!', 0.1, at('disemprot', 0) + 0.5, { y: 520, col: '#FFDD33' });
    } else if (t < at('panennya', 0) + 0.3) {
      shot(t, at('disemprot', 0) + 0.6, at('panennya', 0) + 0.3,
           [2.5, 1.0, 6.5], [0.3, 0.6, 0.5], { push: 0.1 });
    } else {
      closeUp(t, MAK, at('panennya', 0) + 0.3, CUT[1], { side: 0.3 });
      chip('Panen lebih banyak',
           540, 300, at('lebih'), { size: 78, stamp: true, bg: '#2F9B48', fg: '#FFFFFF' });
    }

  // ── Beat 1: Konflik — Bagas masuk, mengejek pakai bebek ───────────────
  } else if (k === 1) {
    sawahSet();
    const enter = seg(t, CUT[1], CUT[1] + 1.6);
    pose(BAGAS, t, {
      x: 0.45,
      z: lerp(-2.5, 1.7, ease(enter)),
      ry: -0.35,
      walk: enter < 1,
      expr: t > at('bebek', 0) - 0.1 ? 'laugh' : 'smile',
      arms: t > at('bebek', 0) ? 'hips' : 'down',
    });
    pose(MAK, t, { x: -0.4, z: 1.2, ry: 0.5, expr: 'flat', arms: 'down' });
    poseDuck(D1, t, { x: 1.6, z: -0.5, ry: 1.2, phase: 0.0 });
    poseDuck(D2, t, { x: 2.8, z:  0.4, ry: -0.3, phase: 1.3 });

    if (t < at('mak', 1) - 0.1) {
      shot(t, CUT[1], at('mak', 1) - 0.1,
           [0.6, 1.15, 5.6], [0.0, 0.75, 1.4], { drift: -0.1 });
      chip('Ponakan dari kota',
           540, 280, at('ponakan'), { size: 70 });
    } else {
      pose(BAGAS, t, {
        x: 0.45, z: 1.7, ry: -0.45,
        expr: t < at('Masa') ? 'talk' : 'laugh',
        talk: true,
        arms: t > at('bebek', 0) ? 'point' : 'hips',
      });
      closeUp(t, BAGAS, at('mak', 1) - 0.1, CUT[2], { side: -0.4 });
      card(['"Masa kalah sama', 'semprot dua kali?!"'],
           540, 320, at('Masa'), { size: 60 });
    }

  // ── Beat 2: Rahasia — pesan ibu Mak Zubaidah ──────────────────────────
  } else if (k === 2) {
    sawahSet();
    poseDuck(D1, t, { x:  1.4, z: -0.8, ry:  0.9, phase: 0.0, walk: true });
    poseDuck(D2, t, { x: -1.6, z:  0.5, ry: -2.1, phase: 1.4, walk: true });
    poseDuck(D3, t, { x:  2.1, z:  1.0, ry:  1.8, phase: 2.3 });

    if (t < at('caping') + 0.4) {
      pose(MAK, t, {
        x: 0.15, z: 1.4, ry: 0.0,
        expr: 'smile',
        arms: t > at('angkat') ? 'hips' : 'down',
      });
      closeUp(t, MAK, CUT[2], at('caping') + 0.4, { side: 0.25 });
      chip('Kata ibunya dulu…',
           540, 260, at('ibunya') - 0.1, { size: 70, bg: '#FFF7E6' });

    } else if (t < at('menumpang') + 0.3) {
      pose(MAK, t, {
        x: 0.15, z: 1.4, ry: -0.1,
        expr: 'talk', talk: true, arms: 'point',
      });
      closeUp(t, MAK, at('caping') + 0.4, at('menumpang') + 0.3, { side: 0.15 });
      chip('Bukan cuma ternak',
           540, 280, at('menumpang'), { size: 68, stamp: true, bg: '#FFF7E6' });

    } else {
      pose(MAK, t, {
        x: 0.15, z: 1.4, ry: 0.0,
        expr: 'happy', arms: 'down', look: 0.1,
      });
      shot(t, at('menumpang') + 0.3, CUT[3],
           [2.6, 0.9, 5.5], [0.5, 0.3, 0.2], { push: 0.12, drift: 0.08 });
      chip('Kalau bebek kenyang…',
           540, 280, at('kenyang'), { size: 68, bg: '#FFF7E6' });
      chip('Padi selamat sampai panen',
           540, 420, at('selamat'), { size: 68, stamp: true, bg: '#2F9B48', fg: '#FFFFFF' });
    }

  // ── Beat 3: Sains — bebek makan wereng dan keong ──────────────────────
  } else if (k === 3) {
    sawahSet();
    poseDuck(D1, t, { x:  1.3, z:  0.2, ry:  0.6 + Math.sin(t * 1.1) * 0.3, phase: 0.0, walk: true });
    poseDuck(D2, t, { x: -1.4, z: -0.6, ry: -1.8 + Math.sin(t * 0.9) * 0.3, phase: 1.2, walk: true });
    poseDuck(D3, t, { x:  2.2, z:  0.5, ry:  1.5 + Math.sin(t * 1.4) * 0.4, phase: 2.1 });
    poseDuck(D4, t, { x: -2.0, z:  0.8, ry:  2.8, phase: 3.0, walk: true });
    poseDuck(D5, t, { x:  1.6, z: -1.2, ry: -0.4, phase: 0.7 });

    if (t < at('keong') + 0.6) {
      shot(t, CUT[3], at('keong') + 0.6,
           [2.5, 0.95, 5.5], [0.5, 0.2, 0], { push: 0.1 });
      chip('Wereng cokelat',
           540, 270, at('wereng') - 0.1, { size: 72 });
      chip('Keong emas',
           540, 400, at('keong') - 0.1, { size: 72, bg: '#FFF7E6' });

    } else if (t < at('Kotorannya') + 0.3) {
      shot(t, at('keong') + 0.6, at('Kotorannya') + 0.3,
           [-2.2, 0.75, 4.8], [-0.3, 0.15, -0.3], { push: 0.1 });
      chip('Hama makin kebal semprot',
           540, 300, at('kebal') - 0.1, { size: 60, bg: '#E84545', fg: '#FFFFFF' });

    } else {
      shot(t, at('Kotorannya') + 0.3, CUT[4],
           [1.5, 0.95, 5.0], [0.0, 0.1, 0], { drift: 0.1 });
      chip('Kotoran = pupuk alami',
           540, 280, at('pupuk') - 0.1, { size: 68, stamp: true, bg: '#FFF7E6' });
      arrow(540, 1550, Math.PI / 2, at('akar') - 0.2, CUT[4] - 0.2);
    }

  // ── Beat 4: Lapisan — penelitian IPB ──────────────────────────────────
  } else if (k === 4) {
    show(RESEARCH);
    sky('desa'); mood('siang');
    SCN.fog.near = 18; SCN.fog.far = 50;

    pose(PENELITI, t, {
      x: 0.1, z: 0.5, ry: 0.5,
      expr: t > at('menemukan') ? 'talk' : 'smile',
      talk: t > at('menemukan') && t < at('persen', 0) + 0.3,
      arms: t > at('padi-bebek') ? 'point' : 'down',
    });

    if (t < at('menemukan') + 0.3) {
      shot(t, CUT[4], at('menemukan') + 0.3,
           [1.8, 1.4, 4.5], [0.0, 1.1, -1.5], { push: 0.12 });
      chip('Institut Pertanian Bogor',
           540, 290, at('Institut') - 0.1, { size: 60, bg: '#FFF7E6' });
      chip('Penelitian 2019',
           540, 420, at('Peneliti') + 0.5, { size: 60 });

    } else if (t < at('persen', 0) + 0.5) {
      closeUp(t, PENELITI, at('menemukan') + 0.3, at('persen', 0) + 0.5, { side: 0.3 });
      // 'padi-bebek' → norm → 'padi-bebek' (tanda hubung dipertahankan oleh norm())
      chip('Padi-Bebek',
           540, 280, at('padi-bebek') - 0.1, { size: 74, bg: '#2F9B48', fg: '#FFFFFF' });
      chip('Pestisida turun 80%',
           540, 420, at('mengurangi') + 0.3, { size: 68, stamp: true, bg: '#E84545', fg: '#FFFFFF' });

    } else {
      shot(t, at('persen', 0) + 0.5, CUT[5],
           [1.6, 1.3, 4.5], [-0.2, 1.1, -1.5], { push: 0.1 });
      chip('Panen naik 20–30%',
           540, 300, at('naik') - 0.1, { size: 74, stamp: true, bg: '#FFC23C', fg: '#17120F' });
    }

  // ── Beat 5: Perubahan — Bagas lepas semprot, giring bebek ─────────────
  } else if (k === 5) {
    sawahSet('sore');

    const tPut = at('meletakkan'), tHerd = at('menggiring') - 0.1;
    const herding = t > tHerd;
    const put = ease(seg(t, tPut, tPut + 0.6));
    const h = ease(seg(t, tHerd, at('sawah', 3) + 0.8));

    pose(MAK, t, { x: 0.6, z: 0.3, ry: -0.4, expr: 'happy', arms: 'down' });
    pose(BAGAS, t, {
      x: -0.15, z: 2.2, ry: herding ? -0.5 : 0.1,
      expr: herding ? 'happy' : (put > 0 ? 'smile' : 'flat'),
      arms: herding ? 'wave' : (put < 1 ? 'carry' : 'down'),
    });

    place(SPRAY, lerp(-0.15, 0.3, put), lerp(0.2, 0.0, put), lerp(2.52, 2.45, put));

    [[D1, 0.1, 1.5, -1.6, 1.0, 0.0], [D2, -0.2, 1.1, -2.2, 0.3, 1.4],
     [D3, 0.2, 1.0, -1.4, -0.2, 2.2], [D4, -0.1, 0.6, -2.4, -0.9, 1.0]].forEach(([D, x0, z0, x1, z1, ph]) =>
      poseDuck(D, t, {
        x: lerp(x0, x1, h), z: lerp(z0, z1, h), y: lerp(0, -0.09, h),
        ry: herding ? -1.4 : 0.3 + ph * 0.4, phase: ph, walk: herding && h < 1,
      }));

    if (t < tPut + 0.6) {
      shot(t, CUT[5], tPut + 0.6, [0.9, 1.1, 6.0], [0.0, 0.7, 1.8], { drift: 0.1 });
    } else if (t < at('menggiring') + 0.3) {
      closeUp(t, BAGAS, tPut + 0.6, at('menggiring') + 0.3, { side: 0.2 });
    } else if (t < at('persis')) {
      shot(t, at('menggiring') + 0.3, at('persis'), [-1.6, 1.4, 6.4], [-0.7, 0.35, 1.2], { push: 0.1 });
    } else {
      closeUp(t, BAGAS, at('persis'), CUT[6], { side: -0.3 });
    }

  // ── Beat 6: CTA — tanya daerah ────────────────────────────────────────
  } else {
    sawahSet('sore');
    poseDuck(D1, t, { x:  1.6, z: -0.8, ry:  0.9, phase: 0.0 });
    poseDuck(D2, t, { x: -1.4, z:  0.4, ry: -1.5, phase: 1.6 });

    pose(MAK, t, {
      x: -0.45, z: 2.4, ry: 0.2,
      expr: 'happy',
      arms: t > at('Tulis') ? 'point' : 'down',
      look: 0.05,
    });
    pose(BAGAS, t, {
      x: 0.55, z: 2.5, ry: -0.15,
      expr: 'smile',
      arms: t > at('daerahmu') ? 'shrug' : 'down',
    });

    if (t < at('Tulis') - 0.1) {
      shot(t, CUT[6], at('Tulis'),
           [1.0, 1.1, 6.5], [0.1, 0.9, 2.3], { push: 0.1 });
    } else {
      closeUp(t, MAK, at('Tulis') - 0.1, DURATION, { side: 0.1 });
    }

    card(['DI DAERAHMU ADA?', 'Petani pakai bebek', 'atau hewan lain?'],
         540, 340, at('daerahmu'), { size: 58 });
    chip('Tulis di komentar!',
         540, 1540, at('Tulis'), { size: 80, stamp: true, bg: '#FFC23C', fg: '#17120F' });
  }
}
