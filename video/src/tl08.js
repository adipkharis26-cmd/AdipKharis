// TL08 — Kenapa Garam Ini Dibuat dari Bambu yang Dibakar?
// Setting: pesisir Flores, karakter PAK_BETO dan ALDO

KEYWORDS = new Set(['garam','bambu','bakar','mineral','silika','kalium','magnesium',
  'leluhur','Flores','tradisional','asin','dibakar','abu','serat']);

window.EXTRA_SFX = [
  { t: 0.0,                         type: 'boom',    gain: 0.5 },
  { t: at('Disengaja') - 0.05,       type: 'stamp',   d: 0.5, gain: 1.0 },
  { t: at('Aldo') - 0.1,             type: 'langkah', d: 0.8, gain: 0.4 },
  { t: at('Kata') - 0.2,             type: 'angin',   d: 6.0, gain: 0.3 },
  { t: at('Bambu') - 0.1,            type: 'api',     d: 4.0, gain: 0.6 },
  { t: at('Soalnya') - 0.1,          type: 'angin',   d: 7.0, gain: 0.25 },
  { t: at('Peneliti') - 0.1,         type: 'stamp',   d: 0.5, gain: 0.8 },
  { t: at('Aldo', 2) - 0.1,          type: 'langkah', d: 0.8, gain: 0.4 },
  { t: at('beda') - 0.05,            type: 'stamp',   d: 0.4, gain: 0.9 },
];

// ── Karakter ───────────────────────────────────────────────────────────────
const PAK_BETO = makeChar({
  shirt:   '#8B5E3C',
  pattern: 'lurik',
  pat2:    '#5A3A1A',
  sarung:  '#2A1A08',
  hair:    'white',
  hat:     'peci',
  hatCol:  '#111111',
});

const ALDO = makeChar({
  shirt:   '#2A5A8A',
  pattern: 'stripe',
  pat2:    '#5A8ABB',
  pants:   '#1A2A3A',
  hair:    'black',
  hat:     'cap',
  hatCol:  '#1A3A5A',
});

// ── Set: Pesisir Flores ────────────────────────────────────────────────────
const PESISIR_FLORES = build('pesisir_flores', () => {
  const G = grp(ground('pasir', 28));

  // laut di belakang
  G.add(at3(sea(14, 8), 0, 0, -10));

  // bukit hijau di kejauhan
  G.add(at3(hill(18, 4.5, '#4A7230'), -6, -1, -13));
  G.add(at3(hill(10, 3.0, '#5A8440'), 7,  -1, -11));

  // pohon kelapa
  G.add(at3(palm(3.5, 0.18), -5.5, 0, -5));
  G.add(at3(palm(2.8, 0.25),  6.0, 0, -4));

  // semak
  G.add(at3(bush(0.9, '#3D6B25'), -3.5, 0, -3));
  G.add(at3(bush(0.7, '#4D7B30'),  4.5, 0, -2.5));

  // awan
  G.add(at3(cloud(1.5), -3, 7, -12));
  G.add(at3(cloud(1.2),  4, 9, -15));

  // tungku bara — kotak bata merah + tumpukan abu
  const tungku = box(1.0, 0.45, 0.8, '#5A2510');
  at3(tungku, 0, 0.22, 0.3);
  G.add(tungku);

  const alas = box(1.3, 0.08, 1.0, '#3A1A08');
  at3(alas, 0, 0.04, 0.3);
  G.add(alas);

  // bambu (ruas panjang di samping tungku)
  const bambu1 = box(0.14, 0.14, 1.6, '#6A8A30');
  at3(bambu1, -0.9, 0.5, 0.0);
  G.add(bambu1);

  const bambu2 = box(0.14, 0.14, 1.6, '#5A7820');
  at3(bambu2, -0.7, 0.5, 0.2);
  G.add(bambu2);

  // ember air laut
  G.add(at3(PROP.ember(), 1.5, 0, 0.3));

  // batu-batu kecil di pantai
  G.add(at3(stone(0.35, '#8A7A60'),  2.5, 0, 1.5));
  G.add(at3(stone(0.25, '#7A6A50'), -2.0, 0, 2.0));

  return G;
});

// ── Helpers ────────────────────────────────────────────────────────────────
function floresSet(moodStr) {
  sky('pantai');
  mood(moodStr || 'siang');
  show(PESISIR_FLORES);
  PAK_BETO.visible = true;
  ALDO.visible     = true;
}

// Shorthand posisi karakter
function posBeto(t, opts) {
  pose(PAK_BETO, t, Object.assign({ x: -1.2, z: 0.0, ry: 0.15 }, opts));
}
function posAldo(t, opts) {
  pose(ALDO, t, Object.assign({ x:  1.4, z: 0.2, ry: -0.2 }, opts));
}

// ── scene(t) ───────────────────────────────────────────────────────────────
function scene(t) {
  const k = beatOf(t);

  // ══ Beat 0 — Hook (0 – 8.262) ════════════════════════════════════════════
  if (k === 0) {
    floresSet('siang');
    PAK_BETO.visible = false;
    ALDO.visible     = false;

    // establishing: shot lebar ke tungku + pantai
    shot(t, CUT[0], CUT[0] + 4.0,
      [0, 2.5, 7],
      [0, 0.5, -2],
      { push: 0.04 });

    // close: detail tungku/abu
    shot(t, CUT[0] + 4.0, CUT[1],
      [0.4, 1.4, 2.5],
      [0, 0.3, 0.3],
      { push: 0.03 });

    chip('Garam bakar — Flores', 0, 220, CUT[0] + 1.5, { size: 54 });
    bigWord('Disengaja!', at('Disengaja') - 0.05, at('Disengaja') + 1.4);
  }

  // ══ Beat 1 — Konflik (8.262 – 18.686) ════════════════════════════════════
  if (k === 1) {
    floresSet('siang');

    // Aldo datang ke tungku, Pak Beto sudah di sana
    posBeto(t, { expr: 'flat', arms: 'hips' });
    posAldo(t, { expr: 'talk', arms: 'point', talk: true });

    // lebar dulu: keduanya terlihat
    shot(t, CUT[1], CUT[1] + 2.5,
      [0, 2.0, 6],
      [0, 1.0, 0]);

    // close Aldo (yang mulai bicara)
    closeUp(t, ALDO, CUT[1] + 2.5, CUT[1] + 4.5, { side: 1, dist: 1.6, up: 0.1 });

    // Pak Beto jawab
    posBeto(t, { x: -1.2, expr: 'talk', arms: 'hold', talk: true });
    closeUp(t, PAK_BETO, CUT[1] + 4.5, CUT[1] + 6.5, { side: -1, dist: 1.6, up: 0.1 });

    // Aldo protes
    posAldo(t, { expr: 'shock', arms: 'shrug' });
    closeUp(t, ALDO, CUT[1] + 6.5, CUT[1] + 8.0, { side: 1, dist: 1.6, up: 0.1 });

    // Pak Beto tegas
    posBeto(t, { expr: 'flat', arms: 'point' });
    closeUp(t, PAK_BETO, CUT[1] + 8.0, CUT[2], { side: -1, dist: 1.6, up: 0.1 });

    card(['"Ini harus dibakar dulu."'], -60, 1550, at('Ini') - 0.1);
    card(['"Pak, kan ada yang instan."'], 60, 1550, at('instan') - 0.3);
    card(['"Yang instan itu berbeda."'], -60, 1550, at('berbeda') - 0.3);
  }

  // ══ Beat 2 — Rahasia leluhur (18.686 – 31.686) ═══════════════════════════
  if (k === 2) {
    floresSet('siang');
    ALDO.visible = true;

    posBeto(t, { expr: 'talk', arms: 'hold', talk: true });
    posAldo(t, { expr: 'flat', arms: 'down', x: 1.6 });

    // lebar: Pak Beto tunjukkan bambu
    shot(t, CUT[2], CUT[2] + 3.0,
      [-2, 2.0, 6],
      [0, 0.8, 0]);

    // close Pak Beto menjelaskan
    closeUp(t, PAK_BETO, CUT[2] + 3.0, CUT[2] + 7.0, { side: -1, dist: 1.6, up: 0.1 });

    // close tungku/bambu (sains visual)
    shot(t, CUT[2] + 7.0, CUT[2] + 10.0,
      [1.0, 1.5, 3.5],
      [0, 0.4, 0.3],
      { push: 0.02 });

    // Pak Beto lanjut
    closeUp(t, PAK_BETO, CUT[2] + 10.0, CUT[3], { side: -1, dist: 1.6, up: 0.1 });

    chip('Bambu + air laut → dibakar', 0, 240, at('Bambu') + 0.2, { size: 50 });
    chip('Abu = garam!', 0, 350, at('Abu') + 0.2, { size: 54, stamp: true });
  }

  // ══ Beat 3 — Sains (31.686 – 43.036) ══════════════════════════════════════
  if (k === 3) {
    floresSet('siang');
    PAK_BETO.visible = false;
    ALDO.visible     = false;

    // close tungku, detail sains
    shot(t, CUT[3], CUT[3] + 4.0,
      [0.5, 1.6, 3.0],
      [0, 0.4, 0.3],
      { push: 0.02 });

    // wide lagi
    shot(t, CUT[3] + 4.0, CUT[3] + 7.5,
      [0, 2.2, 7],
      [0, 0.5, -1]);

    // back to close tungku
    shot(t, CUT[3] + 7.5, CUT[4],
      [-0.4, 1.4, 2.8],
      [0, 0.4, 0.2]);

    chip('Silika · Kalium · Magnesium', 0, 250, at('silika') - 0.1, { size: 48 });
    chip('Larut ke dalam garam', 0, 380, at('larut') - 0.1, { size: 48 });
    chip('Garam biasa tidak punya ini', 0, 400, at('Garam', 3) - 0.1, { size: 46 });
  }

  // ══ Beat 4 — Lapisan kedua (43.036 – 54.246) ══════════════════════════════
  if (k === 4) {
    floresSet('sore');
    PAK_BETO.visible = false;
    ALDO.visible     = false;

    shot(t, CUT[4], CUT[4] + 4.5,
      [2.0, 2.5, 6],
      [0, 0.6, -1],
      { drift: 0.015 });

    shot(t, CUT[4] + 4.5, CUT[4] + 7.5,
      [-1.5, 1.8, 4.5],
      [0, 0.5, 0.3]);

    shot(t, CUT[4] + 7.5, CUT[5],
      [0, 2.0, 5.5],
      [0, 0.5, -0.5],
      { push: 0.025 });

    chip('Mineral mikro 3× lebih tinggi', 0, 250, at('Peneliti') + 0.5, { size: 50, stamp: true });
    chip('dari garam industri', 0, 370, at('garam', 7) - 0.1, { size: 50 });
    chip('Ratusan tahun dipakai', 0, 300, at('Ratusan') + 0.1, { size: 48 });
    chip('Baru sekarang ilmunya ketemu', 0, 420, at('ketemu') - 0.5, { size: 44 });
  }

  // ══ Beat 5 — Perubahan (54.246 – 66.897) ══════════════════════════════════
  if (k === 5) {
    floresSet('sore');

    // Aldo ikut bakar — tangan di tungku area
    posAldo(t, { x: 0.6, z: 0.4, ry: -0.5, expr: 'flat', arms: 'stir' });
    posBeto(t, { x: -1.5, z: 0.0, ry: 0.2, expr: 'smile', arms: 'hips' });

    // wide: Aldo di dekat tungku
    shot(t, CUT[5], CUT[5] + 2.5,
      [0, 2.0, 6],
      [0, 0.8, 0]);

    // close Aldo bekerja
    closeUp(t, ALDO, CUT[5] + 2.5, CUT[5] + 4.5, { side: 1, dist: 1.7, up: 0.1 });

    // Aldo cicipi: ekspresi berubah
    posAldo(t, { expr: 'flat', arms: 'chin' });
    closeUp(t, ALDO, CUT[5] + 4.5, CUT[5] + 7.5, { side: 1, dist: 1.6, up: 0.15 });

    posAldo(t, { expr: 'shock', arms: 'down' });
    closeUp(t, ALDO, CUT[5] + 7.5, CUT[5] + 9.5, { side: 1, dist: 1.6, up: 0.15 });

    // Pak Beto senyum
    closeUp(t, PAK_BETO, CUT[5] + 9.5, CUT[6], { side: -1, dist: 1.6, up: 0.1 });
    posBeto(t, { expr: 'laugh', arms: 'hips' });

    card(['"Ini beda, Pak."'], 80, 1560, at('beda') - 0.2);
    card(['"Makanya kami tidak beli', 'yang di minimarket."'], -80, 1560, at('minimarket') - 0.6);
  }

  // ══ Beat 6 — CTA (66.897 – 75.807) ═══════════════════════════════════════
  if (k === 6) {
    floresSet('sore');

    posBeto(t, { x: -1.3, z: 0.0, ry: 0.1, expr: 'happy', arms: 'cheer' });
    posAldo(t, { x:  1.3, z: 0.1, ry: -0.1, expr: 'happy', arms: 'wave' });

    shot(t, CUT[6], CUT[7],
      [0, 2.6, 7.5],
      [0, 0.8, -1.5],
      { drift: 0.012 });

    card([
      'Di daerahmu ada cara buat garam',
      'atau bumbu yang aneh? Tulis di komentar!'
    ], 0, 320, CUT[6] + 1.0);
  }
}

renderFrame(0);
