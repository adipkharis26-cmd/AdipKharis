// Ternyata Leluhur TL06 — "Kenapa Petani Ini Melarang Orang Masuk Hutannya?"
// Hutan larangan Minangkabau, hidrologi mata air.
// Tokoh fiksi: Pak Datuk (ninik mamak, tenun, tengkuluk merah), Bahar (pemuda kota).

KEYWORDS = new Set([
  'larangan', 'ditebang', 'dimasuki', 'kering', 'mengalir',
  'akar', 'meresap', 'stabil', 'adat', 'batu', 'Minang', 'Rimbo',
]);

window.EXTRA_SFX = [
  { t: 0.0,                         type: 'boom',    gain: 0.5 },
  { t: at('Bahar', 0) - 0.15,      type: 'langkah', d: 1.0, gain: 0.4 },
  { t: at('larangan.\"', 0) - 0.1, type: 'stamp',   d: 0.5, gain: 1.0 },
  { t: at('Soalnya') - 0.1,        type: 'angin',   d: 7.0, gain: 0.3 },
  { t: at('Peneliti') - 0.1,       type: 'stamp',   d: 0.6, gain: 0.9 },
  { t: at('Bahar', 1) - 0.1,       type: 'langkah', d: 0.8, gain: 0.4 },
  { t: at('daerahmu') - 0.2,       type: 'angin',   d: 9.0, gain: 0.2 },
];

// ── Tokoh ─────────────────────────────────────────────────────────────────
const PAK_DATUK = makeChar({
  shirt:   '#2A3A1A', pattern: 'kawung', pat2: '#8C6A30',
  sarung:  '#3A2A1A',
  hair:    'grey', beard: true,
  hat:     'headband', hatCol: '#8C3A1A',
});

const BAHAR = makeChar({
  shirt:   '#3A5A7A', pattern: 'stripe', pat2: '#7AAABB',
  pants:   '#2A2A3A',
  hair:    'black',
});

// ── Helpers ───────────────────────────────────────────────────────────────
function pohonTua(h, leanX) {
  const G = grp();
  G.add(at3(cyl(0.14, 0.18, h, '#4A2A10', { ol: 0.012 }, 8), 0, h / 2, 0));
  G.add(at3(sph(h * 0.52, '#2A5A1A', {}, 10, 8), leanX * 0.3, h + h * 0.18, 0));
  G.add(at3(sph(h * 0.38, '#3A6A28', {}, 8, 6), -leanX * 0.2, h * 0.78, leanX * 0.15));
  return G;
}

// ── Set: KAMPUNG_MINANG (eksterior: rumah gadang, bukit, hutan di latar) ──
const KAMPUNG_MINANG = build('kampung_minang', () => {
  const G = grp(ground('rumput', 28));

  // Rumah panggung dengan atap gonjong
  const RUMAH = rumahPanggung({
    w: 3.6, d: 2.2, stilt: 0.85, wallH: 1.2, cols: 3,
    wall: '#7A4A22', roof: '#1A0E06', gonjong: true,
  });
  at3(RUMAH, -0.8, 0, -1.8);
  G.add(RUMAH);

  // Pohon-pohon besar (hutan larangan di lereng bukit)
  [[-5.2, -6.0], [-3.6, -7.5], [-6.5, -7.0], [5.2, -6.8], [3.8, -8.2], [0.5, -8.5]].forEach(([x, z], i) => {
    G.add(at3(pohonTua(2.5 + (i % 3) * 0.3, (i % 2 === 0 ? 1 : -1) * 0.18), x, 0, z));
  });

  // Palms di foreground
  G.add(at3(palm(2.8, 0.15), 3.2, 0, -2.5));
  G.add(at3(palm(2.4, 0.12), -3.5, 0, -3.0));

  // Hills (bukit berhutan)
  G.add(at3(hill(16, 7, '#3A6A22'), -4, -2, -13));
  G.add(at3(hill(14, 6, '#2E5A1A'),  3, -2, -12));
  G.add(at3(hill(10, 5, '#4A7A2A'),  0,  0,  -9));

  // Sungai (strip biru transparan di kanan)
  const sungai = box(1.2, 0.04, 7.0, '#7AABBB', { basic: true });
  at3(sungai, 4.0, 0.02, -1.8);
  G.add(sungai);

  // Batu batas hutan
  G.add(at3(stone(0.26, '#6A5A48'), -4.6, 0.18, -4.2));
  G.add(at3(stone(0.20, '#7A6A56'), -5.3, 0.14, -4.8));

  // Clouds
  [0, 1, 2].forEach(i => G.add(at3(cloud(1.4 + i * 0.3), (i - 1) * 5, 4.5, -13 + i)));

  return G;
});

// ── Set: TEPI_HUTAN (batas hutan larangan, pohon tua, batu) ───────────────
const TEPI_HUTAN = build('tepi_hutan', () => {
  const G = grp(ground('tanah', 10));

  // Batu batas (3 batu berjejer)
  G.add(at3(stone(0.30, '#6A5A48'), -1.2, 0.20, -0.4));
  G.add(at3(stone(0.22, '#7A6A56'),  0.3, 0.14, -0.3));
  G.add(at3(stone(0.18, '#6E5E4A'),  1.6, 0.12, -0.5));

  // Pohon-pohon tua di dalam hutan
  [[-2.5, -2.8], [-0.3, -3.8], [2.0, -2.6], [-3.8, -2.2], [3.5, -3.2]].forEach(([x, z], i) => {
    G.add(at3(pohonTua(2.2 + (i % 3) * 0.25, (i % 2 === 0 ? 1 : -1) * 0.15), x, 0, z));
  });

  // Bush underbrush
  [[-1.4, -1.6], [0.9, -1.9], [2.1, -1.4]].forEach(([x, z]) => {
    G.add(at3(bush(0.38, '#1A4010'), x, 0.18, z));
  });

  return G;
});

// ── Shortcuts ─────────────────────────────────────────────────────────────
function kampungSet(mood_) {
  sky(mood_ || 'desa'); mood('siang');
  show(KAMPUNG_MINANG);
  PAK_DATUK.visible = true;
  BAHAR.visible = true;
}

function hutanSet() {
  sky('dalam'); mood('siang');
  show(TEPI_HUTAN);
  PAK_DATUK.visible = true;
  BAHAR.visible = true;
}

// ── Scene ──────────────────────────────────────────────────────────────────
function scene(t) {
  const k = beatOf(t);

  // ── Beat 0: HOOK — wide shot kampung, hutan di bukit ─────────────────
  if (k === 0) {
    kampungSet();
    PAK_DATUK.visible = false;
    BAHAR.visible = false;

    if (t < at('hutan', 0) - 0.3) {
      shot(t, CUT[0], at('hutan', 0) - 0.3,
        [0, 2.2, 8.5], [0, 0.8, -1.5], { push: 0.07, drift: 0.04 });
      bigWord('TIDAK PERNAH\nKEKERINGAN', CUT[0] + 0.4, at('kekeringan') + 1.0, { y: 500, col: '#FFC23C' });
    } else {
      shot(t, at('hutan', 0) - 0.3, CUT[1],
        [2.5, 1.2, 6.5], [0, 0.5, -2.0], { push: 0.06, drift: 0.03 });
      chip('Hutannya tidak boleh disentuh', 540, 300, at('hutan', 0), { size: 0.9, stamp: true });
    }
  }

  // ── Beat 1: KONFLIK — Bahar mau buka kebun, Pak Datuk larang ─────────
  if (k === 1) {
    kampungSet();

    pose(PAK_DATUK, t, {
      x: -0.9, z: 1.3, ry: 0.4,
      expr: t > at('bilang') - 0.1 ? 'talk' : 'flat',
      arms: t > at('larangan.\"', 0) - 0.1 ? 'point' : 'hips',
      talk: t > at('\"Itu') && t < CUT[2],
    });
    pose(BAHAR, t, {
      x: 0.9, z: 1.3, ry: -0.3,
      expr: t > at('larangan.\"', 0) ? 'worried' : 'flat',
      arms: t > at('tebang,') - 0.1 ? 'chin' : 'point',
      talk: t > at('Bahar', 0) + 0.2 && t < at('\"Itu') - 0.1,
    });

    if (t < at('larangan.\"', 0) + 0.3) {
      shot(t, CUT[1], at('larangan.\"', 0) + 0.3,
        [0, 1.3, 5.8], [0, 0.9, -1.0], { push: 0.07 });
    } else if (t < at('tebang,') - 0.1) {
      closeUp(t, BAHAR, at('larangan.\"', 0) + 0.3, at('tebang,') - 0.1, { side: -0.3 });
    } else {
      closeUp(t, PAK_DATUK, at('tebang,') - 0.1, CUT[2], { side: 0.3 });
      chip('"Airmu ikut pergi"', 540, 290, at('airmu') - 0.1, { size: 1.0, stamp: true });
    }
    chip('Hutan Larangan', 540, 300, at('larangan.\"', 0) - 0.1, { size: 1.1, stamp: true });
  }

  // ── Beat 2: RAHASIA — aturan leluhur, batu batas, denda ──────────────
  if (k === 2) {
    hutanSet();

    pose(PAK_DATUK, t, {
      x: -0.9, z: 1.4, ry: 0.5,
      expr: 'smile', arms: 'point', talk: true,
    });
    pose(BAHAR, t, {
      x: 0.6, z: 1.4, ry: -0.4,
      expr: 'worried', arms: 'chin',
    });

    if (t < at('ditandai') - 0.3) {
      shot(t, CUT[2], at('ditandai') - 0.3,
        [0, 1.1, 3.8], [0, 0.6, -0.5], { push: 0.07 });
      chip('tidak boleh ditebang\ntidak boleh dimasuki', 540, 300, CUT[2] + 0.4, { size: 0.85 });
    } else {
      closeUp(t, PAK_DATUK, at('ditandai') - 0.3, CUT[3], { side: 0.3 });
      chip('Batasnya ditandai batu', 540, 290, at('ditandai'), { size: 0.88, stamp: true });
    }
  }

  // ── Beat 3: SAINS — akar pohon, air meresap ke mata air ──────────────
  if (k === 3) {
    kampungSet();
    PAK_DATUK.visible = false;
    BAHAR.visible = false;
    SCN.fog.near = 7; SCN.fog.far = 22;

    if (t < at('meresap') - 0.3) {
      shot(t, CUT[3], at('meresap') - 0.3,
        [-3.8, 0.6, 4.5], [-0.8, 0.3, -3.5], { push: 0.07 });
      chip('Akar pohon menahan air hujan', 540, 300, CUT[3] + 0.5, { size: 0.9, stamp: true });
    } else if (t < at('hutannya') - 0.1) {
      shot(t, at('meresap') - 0.3, at('hutannya') - 0.1,
        [3.0, 0.9, 5.0], [0.5, 0.4, -2.0], { push: 0.08 });
      chip('pelan-pelan meresap\nke mata air', 540, 310, at('meresap'), { size: 0.88, bg: '#1A5A2A', stamp: true });
    } else {
      shot(t, at('hutannya') - 0.1, CUT[4],
        [0, 1.8, 7.0], [0, 0.6, -1.5], { push: 0.06 });
      chip('Tebang → air lari\nmata air kering', 540, 300, at('hutannya'), { size: 0.85, bg: '#C8552E', stamp: true });
    }
  }

  // ── Beat 4: LAPISAN KEDUA — peneliti, hutan larangan utuh, ratusan tahun
  if (k === 4) {
    kampungSet('sore');
    PAK_DATUK.visible = false;
    BAHAR.visible = false;

    if (t < at('stabil.') - 0.3) {
      shot(t, CUT[4], at('stabil.') - 0.3,
        [0, 2.5, 7.5], [-0.2, 0.6, -1.5], { push: 0.06, drift: 0.04 });
      chip('Debit mata air lebih stabil', 540, 300, CUT[4] + 0.5, { size: 0.9 });
    } else {
      shot(t, at('stabil.') - 0.3, CUT[5],
        [3.5, 1.4, 5.5], [0, 0.6, -2.0], { push: 0.08, drift: 0.03 });
      chip('Ratusan tahun\nsebelum ilmunya ada', 540, 300, at('ratusan') - 0.3, { size: 0.85, stamp: true });
    }
  }

  // ── Beat 5: PERUBAHAN — Bahar lihat sendiri, sumur kering sebelah ─────
  if (k === 5) {
    kampungSet('sore');

    pose(PAK_DATUK, t, {
      x: -0.8, z: 1.3, ry: 0.3,
      expr: 'smile', arms: 'hips',
      talk: t > at('percaya.') - 0.05 && t < CUT[6],
    });
    pose(BAHAR, t, {
      x: 0.7, z: 1.4, ry: -0.3,
      expr: t > at('sumurnya') - 0.1 ? 'shock' : 'worried',
      arms: 'chin',
      talk: t > at('Bahar', 1) + 0.3 && t < at('percaya.') - 0.1,
    });

    if (t < at('sumurnya') - 0.1) {
      shot(t, CUT[5], at('sumurnya') - 0.1,
        [0, 1.3, 5.8], [0, 0.9, -1.0], { push: 0.07 });
    } else if (t < at('percaya.') - 0.2) {
      closeUp(t, BAHAR, at('sumurnya') - 0.1, at('percaya.') - 0.2, { side: -0.35 });
      chip('Kampung sebelah\nsumurnya kering', 540, 290, at('sumurnya'), { size: 0.85, bg: '#C8552E' });
    } else {
      closeUp(t, BAHAR, at('percaya.') - 0.2, CUT[6], { side: -0.35 });
      chip('"Ini soal air."', 540, 290, at('Ini') + 0.1, { size: 1.1, stamp: true });
    }
  }

  // ── Beat 6: CTA ───────────────────────────────────────────────────────
  if (k === 6) {
    kampungSet('sore');

    pose(PAK_DATUK, t, {
      x: -0.7, z: 1.2, ry: 0.25,
      expr: 'happy', arms: 'cheer',
    });
    pose(BAHAR, t, {
      x: 0.6, z: 1.2, ry: -0.25,
      expr: 'happy', arms: 'wave',
    });

    shot(t, CUT[6], DURATION, [0, 1.5, 5.8], [0, 0.7, 0], { drift: 0.05 });
    card(['DI DAERAHMU ADA?', 'Hutan adat yang', 'tidak boleh ditebang?'],
      540, 420, CUT[6] + 0.4);
    chip('Tulis di komentar!', 540, 1560, CUT[6] + 0.8, { size: 1.0, stamp: true });
  }
}

renderFrame(0);
