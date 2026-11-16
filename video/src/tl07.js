// Ternyata Leluhur TL07 — "Kenapa Kain Ini Direndam Lumpur Sebelum Dipakai?"
// Tenun ikat NTT, mordan lumpur: zat besi + tanin mengunci warna.
// Tokoh fiksi: Mama Yani (nenek NTT, penenun), Rian (cucu/kota).

KEYWORDS = new Set([
  'lumpur', 'mordan', 'tanin', 'besi', 'tenun', 'NTT',
  'pewarna', 'terkunci', 'bertahan', 'leluhur', 'direndam', 'serat',
]);

window.EXTRA_SFX = [
  { t: 0.0,                         type: 'boom',    gain: 0.5 },
  { t: at('angkat') - 0.1,          type: 'langkah', d: 1.0, gain: 0.4 },
  { t: at('Disengaja.') - 0.05,     type: 'stamp',   d: 0.5, gain: 1.0 },
  { t: at('Kata') - 0.2,            type: 'angin',   d: 6.0, gain: 0.25 },
  { t: at('Soalnya') - 0.1,         type: 'angin',   d: 7.0, gain: 0.3 },
  { t: at('Peneliti') - 0.1,        type: 'stamp',   d: 0.6, gain: 0.9 },
  { t: at('Rian', 1) - 0.1,         type: 'langkah', d: 0.8, gain: 0.4 },
  { t: at('daerahmu') - 0.2,        type: 'angin',   d: 7.0, gain: 0.2 },
];

// ── Tokoh ─────────────────────────────────────────────────────────────────
const MAMA_YANI = makeChar({
  shirt:   '#7A3010', pattern: 'tenun', pat2: '#D09030',
  sarung:  '#5A2010',
  hair:    'white',
});

const RIAN = makeChar({
  shirt:   '#3A6A9A', pattern: 'stripe', pat2: '#8ABACC',
  pants:   '#2A3A4A',
  hair:    'black', hat: 'cap', hatCol: '#2A4A6A',
});

// ── Set: HALAMAN_NTT (eksterior NTT: tanah kering, lontar, kubangan lumpur)
const HALAMAN_NTT = build('halaman_ntt', () => {
  const G = grp(ground('tanah', 24));

  // Bukit savana kering khas NTT
  G.add(at3(hill(14, 5.0, '#9A7845'), -4,  -1, -12));
  G.add(at3(hill(10, 4.0, '#8A6835'),  3,  -1, -11));
  G.add(at3(hill( 7, 3.0, '#B09050'),  0,   0,  -8));

  // Lontar/palm NTT
  G.add(at3(palm(3.0, 0.20), -3.2, 0, -2.8));
  G.add(at3(palm(2.4, 0.08),  3.0, 0, -3.5));
  G.add(at3(palm(2.0, 0.15), -2.0, 0, -4.5));

  // Semak kering
  G.add(at3(bush(0.5, '#7A6030'), -1.8, 0.1, -1.5));
  G.add(at3(bush(0.4, '#6A5025'),  2.2, 0.1, -2.0));
  G.add(at3(bush(0.3, '#7A6530'),  0.8, 0.1, -1.2));

  // Clouds
  G.add(at3(cloud(1.5), -2.5, 5.0, -13));
  G.add(at3(cloud(1.1),  2.0, 4.5, -12));
  G.add(at3(cloud(0.9), -0.5, 6.0, -15));

  // Kubangan lumpur — rim + dark surface
  const mudRim  = box(2.2, 0.06, 1.5, '#3A1808');
  at3(mudRim, 0, 0.01, 0.6);
  G.add(mudRim);

  const mudSurf = box(2.0, 0.07, 1.3, '#120804', { basic: true });
  at3(mudSurf, 0, 0.04, 0.6);
  G.add(mudSurf);

  // Kain tenun merah setengah terbenam di kubangan
  const kainBase   = box(0.52, 0.03, 0.85, '#C03018');
  at3(kainBase, 0.1, 0.07, 0.62);
  G.add(kainBase);

  // Batu-batu kecil di tepi kubangan
  G.add(at3(stone(0.14, '#7A6248'), -1.3, 0.09, 0.4));
  G.add(at3(stone(0.11, '#8A7258'),  1.2, 0.07, 0.9));
  G.add(at3(stone(0.09, '#706040'), -0.8, 0.06, 1.3));

  return G;
});

// ── Shortcuts ─────────────────────────────────────────────────────────────
function nttSet(moodStr) {
  sky('desa'); mood(moodStr || 'siang');
  show(HALAMAN_NTT);
  MAMA_YANI.visible = true;
  RIAN.visible = true;
}

// ── Scene ──────────────────────────────────────────────────────────────────
function scene(t) {
  const k = beatOf(t);

  // ── Beat 0: HOOK — wide NTT, kain di lumpur, "nilainya jutaan" ───────────
  if (k === 0) {
    nttSet();
    MAMA_YANI.visible = false;
    RIAN.visible = false;

    if (t < at('direndam', 0) - 0.2) {
      shot(t, CUT[0], at('direndam', 0) - 0.2,
        [0, 2.8, 6.0], [0, 0.5, 0.0], { push: 0.07, drift: 0.04 });
      bigWord('NILAINYA JUTAAN', CUT[0] + 0.3, 2.0, { y: 460, col: '#FFC23C' });
    } else {
      shot(t, at('direndam', 0) - 0.2, CUT[1],
        [0.5, 1.4, 3.0], [0.1, 0.0, 0.5], { push: 0.08, drift: 0.03 });
      chip('Tapi direndam lumpur — disengaja', 540, 310, at('direndam', 0), { size: 0.9, stamp: true });
    }
  }

  // ── Beat 1: KONFLIK — Rian mau angkat kain, Mama Yani melarang ───────────
  if (k === 1) {
    nttSet();

    pose(RIAN, t, {
      x:  0.8, z: 1.3, ry: -0.4,
      expr: t > at('bilang') - 0.1 ? 'worried' : 'flat',
      arms: t > at('angkat') - 0.1 ? 'reach' : 'hips',
      talk: t > at('"Nek,') && t < at('"Nanti') - 0.1,
    });
    pose(MAMA_YANI, t, {
      x: -0.9, z: 1.3, ry: 0.5,
      expr: t > at('"Ini') - 0.1 ? 'talk' : 'flat',
      arms: t > at('jangan.') - 0.05 ? 'point' : 'hips',
      talk: (t > at('"Ini') && t < at('"Nek,') - 0.1) ||
            (t > at('"Nanti') && t < CUT[2]),
    });

    if (t < at('bilang') - 0.2) {
      shot(t, CUT[1], at('bilang') - 0.2,
        [0, 1.3, 5.5], [0, 0.9, 0.3], { push: 0.07 });
      chip('Kubangan Lumpur', 540, 300, CUT[1] + 0.3, { size: 1.0, stamp: true });
    } else if (t < at('"Ini') - 0.1) {
      closeUp(t, RIAN, at('bilang') - 0.2, at('"Ini') - 0.1, { side: -0.35 });
    } else if (t < at('"Nek,') - 0.1) {
      closeUp(t, MAMA_YANI, at('"Ini') - 0.1, at('"Nek,') - 0.1, { side: 0.4 });
      chip('"Ini harus di sini tiga hari."', 540, 300, at('"Ini'));
    } else if (t < at('"Nanti') - 0.1) {
      closeUp(t, RIAN, at('"Nek,') - 0.1, at('"Nanti') - 0.1, { side: -0.35 });
      chip('"Nek, kainnya bau."', 540, 300, at('"Nek,'));
    } else {
      closeUp(t, MAMA_YANI, at('"Nanti') - 0.1, CUT[2], { side: 0.4 });
      chip('"Nanti baunya hilang,\nwarnanya yang tinggal."', 540, 300, at('"Nanti'));
    }
  }

  // ── Beat 2: RAHASIA LELUHUR — tradisi tenun NTT, direndam lumpur ──────────
  if (k === 2) {
    nttSet();
    RIAN.visible = false;

    pose(MAMA_YANI, t, {
      x: -0.4, z: 1.2, ry: 0.2,
      expr: 'smile', arms: 'point', talk: true,
    });

    if (t < at('cukup.') - 0.3) {
      shot(t, CUT[2], at('cukup.') - 0.3,
        [0, 1.3, 4.5], [0, 0.7, -0.5], { push: 0.07 });
      chip('Kata leluhur NTT', 540, 300, CUT[2] + 0.4, { size: 1.0, stamp: true });
      chip('tarum + mengkudu = tidak cukup', 540, 440, at('tarum') - 0.1, { size: 0.85 });
    } else if (t < at('lari.') - 0.1) {
      closeUp(t, MAMA_YANI, at('cukup.') - 0.3, at('lari.') - 0.1, { side: 0.35 });
      chip('Harus direndam lumpur\nsupaya warna tidak lari', 540, 300, at('direndam', 1), { size: 0.88, bg: '#1A5A2A', stamp: true });
    } else {
      shot(t, at('lari.') - 0.1, CUT[3],
        [-1.0, 1.0, 3.5], [-0.1, 0.3, 0.3], { push: 0.07, drift: 0.04 });
      chip('Sudah begitu caranya\nsejak nenek moyang', 540, 300, at('lari.'), { size: 0.85 });
    }
  }

  // ── Beat 3: SAINS — tanin + besi → mordan → warna terkunci ───────────────
  if (k === 3) {
    nttSet('siang');
    MAMA_YANI.visible = false;
    RIAN.visible = false;
    SCN.fog.near = 7; SCN.fog.far = 20;

    if (t < at('bereaksi') - 0.3) {
      shot(t, CUT[3], at('bereaksi') - 0.3,
        [0.5, 0.9, 2.5], [0.05, 0.0, 0.5], { push: 0.08, drift: 0.03 });
      chip('Lumpur = Zat Besi + Tanin', 540, 310, CUT[3] + 0.5, { size: 0.95, stamp: true });
    } else if (t < at('mordan') - 0.1) {
      shot(t, at('bereaksi') - 0.3, at('mordan') - 0.1,
        [-0.5, 1.2, 3.0], [0, 0.4, 0.4], { push: 0.07 });
      chip('Bereaksi dengan pewarna alami', 540, 300, at('bereaksi'), { size: 0.88, bg: '#1A5A2A', stamp: true });
      chip('→ mengunci warna di serat', 540, 450, at('mengunci') - 0.1, { size: 0.85, stamp: true });
    } else {
      shot(t, at('mordan') - 0.1, CUT[4],
        [0, 1.5, 4.0], [0, 0.5, 0.5], { push: 0.07 });
      chip('Tanpa mordan → warna memudar', 540, 300, at('mordan'), { size: 0.88, bg: '#C8552E', stamp: true });
    }
  }

  // ── Beat 4: LAPISAN KEDUA — kain berusia ratusan tahun, warna masih hidup ─
  if (k === 4) {
    nttSet('sore');
    MAMA_YANI.visible = false;
    RIAN.visible = false;

    if (t < at('hidup.', 0) - 0.3) {
      shot(t, CUT[4], at('hidup.', 0) - 0.3,
        [0, 2.2, 6.5], [0, 0.6, -0.5], { push: 0.06, drift: 0.04 });
      chip('Kain NTT di museum — ratusan tahun', 540, 310, CUT[4] + 0.5, { size: 0.9, stamp: true });
    } else if (t < at('lumpur,') - 0.2) {
      shot(t, at('hidup.', 0) - 0.3, at('lumpur,') - 0.2,
        [2.0, 1.0, 4.5], [0, 0.5, -1.0], { push: 0.08, drift: 0.03 });
      chip('Pewarna kimia: pudar 5 tahun', 540, 300, at('kimia') - 0.1, { size: 0.88, bg: '#C8552E', stamp: true });
    } else {
      shot(t, at('lumpur,') - 0.2, CUT[5],
        [-1.5, 0.8, 3.5], [0.1, 0.1, 0.4], { push: 0.07 });
      chip('Dari lumpur → bertahan seumur hidup', 540, 300, at('lumpur,'), { size: 0.88, bg: '#1A5A2A', stamp: true });
    }
  }

  // ── Beat 5: PERUBAHAN — Rian ikut celup, Mama Yani tersenyum ─────────────
  if (k === 5) {
    nttSet('sore');

    pose(RIAN, t, {
      x:  0.5, z: 1.2, ry: -0.3,
      expr: t > at('tahu') - 0.1 ? 'happy' : 'talk',
      arms: t > at('celup.') - 0.1 ? 'reach' : 'hips',
      talk: t > at('"Jadi') && t < at('Mama', 1) - 0.1,
    });
    pose(MAMA_YANI, t, {
      x: -0.7, z: 1.2, ry: 0.35,
      expr: t > at('senyum.') - 0.05 ? 'smile' : 'flat',
      arms: t > at('senyum.') - 0.05 ? 'hips' : 'hold',
      talk: t > at('"Lumpur,') && t < CUT[6],
    });

    if (t < at('"Jadi') - 0.2) {
      shot(t, CUT[5], at('"Jadi') - 0.2,
        [0, 1.3, 5.5], [0, 0.8, 0.3], { push: 0.07 });
    } else if (t < at('senyum.') - 0.1) {
      closeUp(t, RIAN, at('"Jadi') - 0.2, at('senyum.') - 0.1, { side: -0.35 });
      chip('"Jadi lumpur ini yang bikin mahal?"', 540, 300, at('"Jadi'));
    } else {
      closeUp(t, MAMA_YANI, at('senyum.') - 0.1, CUT[6], { side: 0.4 });
      chip('"Lumpur, dan kesabarannya."', 540, 300, at('"Lumpur,'));
    }
  }

  // ── Beat 6: CTA ───────────────────────────────────────────────────────────
  if (k === 6) {
    nttSet('sore');

    pose(MAMA_YANI, t, {
      x: -0.7, z: 1.2, ry: 0.25,
      expr: 'happy', arms: 'cheer',
    });
    pose(RIAN, t, {
      x:  0.6, z: 1.2, ry: -0.25,
      expr: 'happy', arms: 'wave',
    });

    shot(t, CUT[6], DURATION, [0, 1.5, 5.8], [0, 0.7, 0], { drift: 0.05 });
    card(['DI DAERAHMU ADA?', 'Kain yang prosesnya', 'aneh atau unik?'],
      540, 420, CUT[6] + 0.4);
    chip('Tulis di komentar!', 540, 1560, CUT[6] + 0.8, { size: 1.0, stamp: true });
  }
}

renderFrame(0);
