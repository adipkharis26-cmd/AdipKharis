// "Dari 1 mnt": Hybrid Kinetic Pop engine (canvas 2D). Kinetic text, Noto emoji stickers,
// flags, infographics, rare mascot appearances, a different background on every cut,
// and a 0.22 s transition at every cut (iris / slide / diagonal wipe / flash).
// No subtitles: only keyword text on screen, synced per phrase.
//
// An episode file defines SHOTS (see dm00.js):
//   BADGE = 'FAKTA vs MITOS';
//   const SHOTS = [
//     shotAt(0, { bg: 'sunburst', c: ['#1E6EFF', '#1455E1'] }, (t, lt) => { txt('Bagaimana jika...', 540, 430, at('Bagaimana')); }),
//     shotAt(at('Tapi') - 0.1, { bg: 'warning' }, (t, lt) => { impact('TAPI TUNGGU', 760, at('Tapi')); mascot(at('Tapi'), at('Tapi') + 2.5, 'kaget'); }),
//   ];
// Every helper takes its own start time, so a frame can be drawn for any t.

const W = 1080, H = 1920, FONT = '"Lilita One", "Arial Black", sans-serif';
const C = {
  navy: '#0C1646', kuning: '#FFD60A', pink: '#FF3D71', merah: '#EF4444', biru: '#1E6EFF', biruTua: '#1455E1',
  cyan: '#00F5D4', mint: '#00E5A0', hijau: '#34D399', ungu: '#7C3AED', oranye: '#FF8C1E', putih: '#FFFFFF',
  panel: '#111827', krem: '#FFF4E6',
};
const cv = document.getElementById('c');
let g = cv.getContext('2d');
const MAIN = g;

// ── math ──────────────────────────────────────────────────────
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = k => k * k * (3 - 2 * k);
const easeOut = k => 1 - Math.pow(1 - k, 3);
const back = k => { const c = 2.2; return k <= 0 ? 0 : 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ── VO timing ─────────────────────────────────────────────────
const WORDS = VO.words;
const DURATION = Math.round((VO.duration + 0.9) * 10) / 10;
const norm = s => s.toLowerCase().replace(/[^a-z0-9-]/g, '');
function at(txt, n = 0) { let c = 0; for (const w of WORDS) if (norm(w.w) === norm(txt)) { if (c === n) return w.s; c++; } throw new Error('VO word not found: ' + txt + ' #' + n); }
function atEnd(txt, n = 0) { let c = 0; for (const w of WORDS) if (norm(w.w) === norm(txt)) { if (c === n) return w.e; c++; } throw new Error('VO word not found: ' + txt + ' #' + n); }
const NSEC = Math.max(...WORDS.map(w => w.sec)) + 1;
const secS = [...Array(NSEC)].map((_, i) => WORDS.find(w => w.sec === i).s);
const secE = [...Array(NSEC)].map((_, i) => WORDS.filter(w => w.sec === i).pop().e);
const CUT = [0, ...secS.slice(1).map((s, i) => (secE[i] + s) / 2), DURATION];
// middle of the breath pause before word `txt` (cuts belong in pauses)
function pauseBefore(txt, n = 0) { const s = at(txt, n), i = WORDS.findIndex(w => w.s === s); return i > 0 ? (WORDS[i - 1].e + s) / 2 : Math.max(0, s - 0.1); }

// ── audio cues (collected by collectCues for the mixer) ───────
const SFX = [];
const cue = (t, type, gain, d) => { if (t >= 0 && !SFX.some(c => c.type === type && Math.abs(c.t - t) < 0.05)) SFX.push({ t: +t.toFixed(3), type, gain: gain ?? 1, d }); };

// ── assets: Noto emoji SVGs + mascot (preloaded before rendering) ──
const IMG = {}, PENDING = [];
function img(src) {
  if (!IMG[src]) { const im = new Image(); IMG[src] = im; PENDING.push(new Promise(r => { im.onload = r; im.onerror = () => { console.error('asset missing: ' + src); r(); }; })); im.src = src; }
  return IMG[src];
}
const EMO = {   // friendly names → Noto codepoints (any codepoint string also works, e.g. '1F4B8')
  uang: '1F4B0', duit: '1F4B5', terbang: '1F4B8', jam: '1F570', jamPasir: '1F55B', kalender: '1F4C5', rumah: '1F3E0', kantor: '1F3E2',
  hp: '1F4F1', laptop: '1F4BB', nasi: '1F35A', mangkuk: '1F963', kopi: '2615', ayam: '1F357', burger: '1F354', piring: '1F37D',
  timbangan: '2696', otak: '1F9E0', bohlam: '1F4A1', api: '1F525', petir: '26A1', bom: '1F4A3', ledak: '1F4A5', tanya: '2753', seru: '2757',
  centang: '2705', silang: '274C', grafikNaik: '1F4C8', grafikTurun: '1F4C9', target: '1F3AF', piala: '1F3C6', mahkota: '1F451', bintang: '2B50',
  mobil: '1F697', motor: '1F3CD', kereta: '1F686', pesawat: '2708', bumi: '1F30F', bulan: '1F319', matahari: '2600', tidur: '1F634',
  kaget: '1F631', mikir: '1F914', senang: '1F604', sedih: '1F622', marah: '1F620', kacamata: '1F913', keren: '1F60E', tepuk: '1F44F',
  jempol: '1F44D', otot: '1F4AA', mata: '1F440', hati: '2764', kunci: '1F511', gembok: '1F512', obat: '1F48A', apel: '1F34E',
  orang: '1F9CD', keluarga: '1F46A', bayi: '1F476', kakek: '1F474', nenek: '1F475', sekolah: '1F3EB', buku: '1F4D6', toga: '1F393',
  kartu: '1F4B3', keranjang: '1F6D2', hadiah: '1F381', pesta: '1F389', alarm: '1F6A8', stop: '1F6D1', dadu: '1F3B2', jalan: '1F6E3',
};
const emoSrc = code => 'vendor/noto/' + (EMO[code] || code) + '.svg';
const flagCode = cc => [...cc.toUpperCase()].map(ch => (0x1F1E6 + ch.charCodeAt(0) - 65).toString(16).toUpperCase()).join('-');
const MASKOT = img('assets/maskot-dari1mnt.png');
// sticker cache: emoji with a white border, at a given pixel size
const stickerCache = {};
function stickerCanvas(src, size) {
  const key = src + '@' + size; if (stickerCache[key]) return stickerCache[key];
  const im = img(src); if (!im.complete || !im.naturalWidth) return null;
  const pad = Math.round(size * 0.09), cs = size + pad * 2, c = document.createElement('canvas'); c.width = c.height = cs;
  const x = c.getContext('2d'), sil = document.createElement('canvas'); sil.width = sil.height = cs;
  const s = sil.getContext('2d'); s.drawImage(im, pad, pad, size, size); s.globalCompositeOperation = 'source-in'; s.fillStyle = '#fff'; s.fillRect(0, 0, cs, cs);
  for (let a = 0; a < 16; a++) x.drawImage(sil, Math.cos(a / 16 * Math.PI * 2) * pad * 0.8, Math.sin(a / 16 * Math.PI * 2) * pad * 0.8);
  x.drawImage(im, pad, pad, size, size);
  return (stickerCache[key] = c);
}

// ── drawing primitives ────────────────────────────────────────
function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function fitSize(s, size, maxW) { g.font = `${size}px ${FONT}`; const w = g.measureText(s).width; return w > maxW ? Math.floor(size * maxW / w) : size; }
// pop-in transform (bouncy) + gentle wobble; returns false before t0
function popT(t, t0, x, y, o = {}) {
  if (t < t0 || (o.t1 && t > o.t1)) return false;
  const k = back(seg(t, t0, t0 + (o.dur || 0.3))), wob = o.still ? 0 : Math.sin((t - t0) * 3 + x * 0.01) * 0.025;
  g.translate(x, y); g.rotate((o.rot || 0) + wob * (1 - (o.calm || 0))); g.scale(k, k);
  return true;
}
// outlined text: navy outline ~11% of size each side + soft dark shadow
function outlined(s, x, y, size, col, o = {}) {
  g.font = `${size}px ${FONT}`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.miterLimit = 2;
  g.fillStyle = 'rgba(5,10,40,0.45)'; g.fillText(s, x, y + size * 0.09);
  g.lineWidth = size * 0.22; g.strokeStyle = o.ol || C.navy; g.strokeText(s, x, y);
  g.fillStyle = col; g.fillText(s, x, y);
}

// ── on-screen elements (each schedules its own SFX) ───────────
let NOW = 0;
// kinetic text line; `hi` = words to colour yellow, e.g. hi: ['30', 'RIBU']
function txt(s, x, y, t0, o = {}) {
  cue(t0, 'pop', 0.7);
  const t = NOW; g.save();
  if (popT(t, t0, x, y, o)) {
    const size = fitSize(s, o.size || 110, o.maxW || 960);
    if (o.hi) { // multi-colour line
      g.font = `${size}px ${FONT}`; const parts = s.split(' '), widths = parts.map(p => g.measureText(p + ' ').width), tot = widths.reduce((a, b) => a + b, 0) - g.measureText(' ').width;
      let cx = -tot / 2; parts.forEach((p, i) => { outlined(p, cx + widths[i] / 2 - g.measureText(' ').width / 2, 0, size, o.hi.includes(p) ? (o.hiCol || C.kuning) : (o.col || C.putih)); cx += widths[i]; });
    } else outlined(s, 0, 0, size, o.col || C.putih);
  }
  g.restore();
}
// big impact keyword (150–220 px) with a zoom punch
function impact(s, y, t0, o = {}) {
  cue(t0, o.sfx || 'hit', 0.9); punch(t0, o.punch ?? 0.06);
  const t = NOW; g.save();
  if (popT(t, t0, 540, y, { ...o, dur: 0.24 })) outlined(s, 0, 0, fitSize(s, o.size || 200, 980), o.col || C.kuning);
  g.restore();
}
function pill(s, x, y, t0, o = {}) {
  cue(t0, 'pop', 0.6);
  const t = NOW; g.save();
  if (popT(t, t0, x, y, o)) {
    const size = o.size || 52; g.font = `${size}px ${FONT}`; const w = g.measureText(s).width + size * 1.1, h = size * 1.5;
    rr(-w / 2 + 6, -h / 2 + 8, w, h, h / 2); g.fillStyle = 'rgba(5,10,40,.45)'; g.fill();
    rr(-w / 2, -h / 2, w, h, h / 2); g.fillStyle = o.bg || C.kuning; g.fill(); g.lineWidth = 7; g.strokeStyle = C.navy; g.stroke();
    g.fillStyle = o.fg || C.navy; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 0, size * 0.06);
  }
  g.restore();
}
// rubber stamp that slams down (tilted) — use for verdicts: MITOS / FAKTA / SEBAGIAN
function stamp(s, x, y, t0, o = {}) {
  cue(t0, 'hit', 1.1); punch(t0, 0.05); shake(t0, 14);
  const t = NOW; if (t < t0) return;
  const k = 1 + 0.9 * (1 - easeOut(seg(t, t0, t0 + 0.16))), a = clamp((t - t0) / 0.08);
  const col = o.col || C.merah, size = fitSize(s, o.size || 120, 820);
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.14); g.scale(k, k); g.globalAlpha = a;
  g.font = `${size}px ${FONT}`; const w = g.measureText(s).width + size * 0.8, h = size * 1.45;
  rr(-w / 2, -h / 2, w, h, 18); g.fillStyle = C.krem; g.fill(); g.lineWidth = 14; g.strokeStyle = col; g.stroke();
  rr(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 10); g.lineWidth = 4; g.stroke();
  g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 0, size * 0.06);
  g.restore();
}
// Noto emoji sticker (white border, shadow); code = EMO name or codepoint; flags: sticker(flag('ID'), ...)
function sticker(code, x, y, size, t0, o = {}) {
  cue(t0, 'pop', 0.5);
  const t = NOW; const sc = stickerCanvas(code.startsWith && code.startsWith('vendor/') ? code : emoSrc(code), Math.round(size));
  g.save();
  let spin = 0;
  if (o.from && t >= t0) { const k = easeOut(seg(t, t0, t0 + 0.42)), d = (1 - k) * 900; g.translate({ left: -d, right: d }[o.from] || 0, { top: -d, bottom: d }[o.from] || 0); spin = (1 - k) * (o.from === 'left' ? -1.2 : 1.2); }
  if (popT(t, t0, x, y, { ...o, rot: (o.rot ?? (rnd(x + y) - 0.5) * 0.3) + spin, dur: o.from ? 0.05 : o.dur }) && sc) {
    const bob = o.still ? 0 : Math.sin((t - t0) * 2.4 + x) * size * 0.03;
    g.shadowColor = 'rgba(5,10,40,.45)'; g.shadowOffsetY = size * 0.06; g.shadowBlur = size * 0.08;
    g.drawImage(sc, -sc.width / 2, -sc.height / 2 + bob);
  }
  g.restore();
}
const flag = cc => 'vendor/noto/' + flagCode(cc) + '.svg';
// number counter that ticks up; fmt(n) → string
function counter(from, to, x, y, t0, dur, o = {}) {
  const steps = Math.min(14, Math.round(dur / 0.07)); for (let i = 0; i <= steps; i++) cue(t0 + i * dur / steps, 'tick', 0.5);
  const t = NOW; g.save();
  if (popT(t, t0, x, y, { ...o, still: true })) {
    const k = easeOut(seg(t, t0, t0 + dur)), v = from + (to - from) * k;
    const s = (o.prefix || '') + (o.fmt ? o.fmt(v) : Math.round(v).toLocaleString('id-ID')) + (o.suffix || '');
    outlined(s, 0, 0, fitSize(s, o.size || 220, 980), o.col || C.kuning);
  }
  g.restore();
}
// horizontal bar chart: items [{label, value, col, flag:'ID' | emoji:'nasi', valueText}]
function bars(items, x, y, w, t0, o = {}) {
  const rowH = o.rowH || 150, max = o.max || Math.max(...items.map(i => i.value)), t = NOW;
  items.forEach((it, i) => {
    const ti = t0 + i * (o.stagger ?? 0.25); cue(ti, 'pop', 0.5); if (t < ti) return;
    const ry = y + i * rowH, k = easeOut(seg(t, ti, ti + 0.6)), bw = Math.max(18, (w - 170) * it.value / max * k);
    g.save();
    if (it.flag || it.emoji) { const sc = stickerCanvas(it.flag ? flag(it.flag) : emoSrc(it.emoji), 96); if (sc) g.drawImage(sc, x, ry - sc.height / 2); }
    rr(x + 130, ry - 40, bw, 80, 22); g.fillStyle = it.col || C.kuning; g.fill(); g.lineWidth = 6; g.strokeStyle = C.navy; g.stroke();
    outlined(it.label, x + 150, ry - 70, 46, C.putih, { align: 'left' });
    if (k > 0.3) outlined(it.valueText || String(it.value), x + 130 + bw + 18, ry + 2, 58, it.col === C.putih ? C.kuning : C.putih, { align: 'left' });
    g.restore();
  });
}
// ranking rows with big numbers
function ranking(items, x, y, t0, o = {}) {
  const t = NOW, rowH = o.rowH || 160;
  items.forEach((it, i) => {
    const ti = t0 + i * (o.stagger ?? 0.3); cue(ti, 'pop', 0.6);
    g.save(); if (popT(t, ti, x, y + i * rowH, { still: true })) {
      rr(-430, -62, 860, 124, 30); g.fillStyle = i === 0 ? C.kuning : C.putih; g.fill(); g.lineWidth = 7; g.strokeStyle = C.navy; g.stroke();
      g.font = `78px ${FONT}`; g.fillStyle = C.navy; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(it.n ?? i + 1), -360, 4);
      if (it.flag || it.emoji) { const sc = stickerCanvas(it.flag ? flag(it.flag) : emoSrc(it.emoji), 92); if (sc) g.drawImage(sc, -300, -sc.height / 2); }
      g.font = `${fitSize(it.label, 62, 420)}px ${FONT}`; g.textAlign = 'left'; g.fillText(it.label, -170, 4);
      if (it.valueText) { g.textAlign = 'right'; g.fillStyle = C.biruTua; g.font = `60px ${FONT}`; g.fillText(it.valueText, 400, 4); }
    } g.restore();
  });
}
// semicircle meter, value 0..1
function meter(x, y, r, value, t0, o = {}) {
  cue(t0, 'riser', 0.5, 0.8);
  const t = NOW; g.save(); if (popT(t, t0, x, y, { still: true })) {
    const segs = o.cols || [C.hijau, C.kuning, C.oranye, C.merah];
    segs.forEach((c, i) => { g.beginPath(); g.arc(0, 0, r, Math.PI + i * Math.PI / segs.length, Math.PI + (i + 1) * Math.PI / segs.length); g.lineWidth = r * 0.28; g.strokeStyle = c; g.stroke(); });
    g.beginPath(); g.arc(0, 0, r + r * 0.15, Math.PI, 0); g.lineWidth = 7; g.strokeStyle = C.navy; g.stroke();
    const v = value * easeOut(seg(t, t0 + 0.2, t0 + 1.0)) + Math.sin(t * 9) * 0.01, a = Math.PI + v * Math.PI;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95); g.lineWidth = 16; g.lineCap = 'round'; g.strokeStyle = C.navy; g.stroke();
    g.beginPath(); g.arc(0, 0, 26, 0, 7); g.fillStyle = C.navy; g.fill();
    if (o.label) outlined(o.label, 0, r * 0.45, 64, C.putih);
  } g.restore();
}
// balance scale: tilt -1 (left heavy) .. 1 (right heavy); left/right = emoji names
function timbangan(x, y, tilt, t0, left, right, o = {}) {
  const t = NOW; g.save(); if (popT(t, t0, x, y, { still: true })) {
    const a = tilt * 0.32 * easeOut(seg(t, t0 + 0.4, t0 + 1.2)) + Math.sin(t * 3) * 0.015;
    g.fillStyle = C.navy; g.beginPath(); g.moveTo(-90, 330); g.lineTo(90, 330); g.lineTo(18, 0); g.lineTo(-18, 0); g.closePath(); g.fill();
    g.save(); g.rotate(a); rr(-380, -14, 760, 28, 14); g.fillStyle = C.kuning; g.fill(); g.lineWidth = 6; g.strokeStyle = C.navy; g.stroke(); g.restore();
    [[-1, left], [1, right]].forEach(([sd, e]) => {
      const px = Math.cos(a) * 360 * sd, py = Math.sin(a) * 360 * sd;
      g.strokeStyle = C.navy; g.lineWidth = 5; g.beginPath(); g.moveTo(px, py); g.lineTo(px - 110, py + 170); g.moveTo(px, py); g.lineTo(px + 110, py + 170); g.stroke();
      g.beginPath(); g.ellipse(px, py + 175, 140, 34, 0, 0, Math.PI); g.fillStyle = C.putih; g.fill(); g.stroke();
      const sc = stickerCanvas(emoSrc(e), 150); if (sc) g.drawImage(sc, px - sc.width / 2, py + 175 - sc.height + 20);
    });
    g.beginPath(); g.arc(0, 0, 22, 0, 7); g.fillStyle = C.merah; g.fill(); g.lineWidth = 5; g.strokeStyle = C.navy; g.stroke();
  } g.restore();
}
// grid of n icons, the first `filled` in full colour, the rest faded
function iconGrid(code, n, filled, x, y, cols, size, t0, o = {}) {
  const t = NOW, rows = Math.ceil(n / cols), gap = size * 1.15;
  for (let i = 0; i < n; i++) {
    const ti = t0 + i * (o.stagger ?? 0.04); if (i % 3 === 0) cue(ti, 'tick', 0.35);
    g.save(); if (popT(t, ti, x + (i % cols - (cols - 1) / 2) * gap, y + (Math.floor(i / cols) - (rows - 1) / 2) * gap, { still: true, dur: 0.2 })) {
      const sc = stickerCanvas(emoSrc(code), Math.round(size)); g.globalAlpha = i < filled ? 1 : 0.25; if (sc) g.drawImage(sc, -sc.width / 2, -sc.height / 2);
    } g.restore();
  }
}
// chat bubble (wallpaper chat scenes); side 'L' | 'R'
function chat(s, y, t0, side = 'L', o = {}) {
  cue(t0, 'pop', 0.6);
  const t = NOW; g.save(); const x = side === 'L' ? 90 : 990;
  if (popT(t, t0, x, y, { still: true })) {
    const size = o.size || 54; g.font = `${size}px ${FONT}`; const w = Math.min(780, g.measureText(s).width + 70), h = size * 1.7;
    const bx = side === 'L' ? 0 : -w;
    rr(bx, -h / 2, w, h, 30); g.fillStyle = side === 'L' ? C.putih : '#DCF8C6'; g.fill(); g.lineWidth = 6; g.strokeStyle = C.navy; g.stroke();
    g.fillStyle = C.navy; g.textAlign = side === 'L' ? 'left' : 'right'; g.textBaseline = 'middle'; g.fillText(s, side === 'L' ? 35 : -35, 4, w - 70);
  } g.restore();
}
// "ILUSTRASI" label for non-data visuals
function ilustrasi(t0) { pill('ILUSTRASI', 170, 1610, t0, { size: 34, bg: 'rgba(255,255,255,.9)', still: true, calm: 1 }); }

// ── mascot (rare: 3–4 times, 2–4 s each; expression fits the moment) ──
// expr: serius | kaget | mikir | senang
let MASKOT_USES = [];
function mascot(t0, t1, expr = 'serius', o = {}) {
  MASKOT_USES.push([t0, t1]); if (t1 - t0 > 0.1) cue(t0, 'pop', 0.8);
  const t = NOW; if (t < t0 || t > t1 + 0.25 || !MASKOT.naturalWidth) return;
  const inK = back(seg(t, t0, t0 + 0.35)), outK = 1 - easeOut(seg(t, t1, t1 + 0.25));
  const hgt = o.size || 560, wdt = hgt * MASKOT.naturalWidth / MASKOT.naturalHeight;
  const side = o.side || 'R', x = o.x ?? (side === 'R' ? 800 : 280), y = o.y ?? 1730;
  const bounce = Math.abs(Math.sin((t - t0) * 5)) * 14, tilt = Math.sin((t - t0) * 3.2) * 0.06;
  g.save(); g.translate(x, y + (1 - outK) * 500 - bounce); g.rotate(tilt * (side === 'R' ? -1 : 1)); g.scale(inK * outK, inK * outK);
  g.shadowColor = 'rgba(5,10,40,.5)'; g.shadowOffsetY = 14; g.shadowBlur = 20;
  g.drawImage(MASKOT, -wdt / 2, -hgt, wdt, hgt); g.shadowColor = 'transparent';
  // cartoon face overlay (positions are fractions of the sprite) — redraws brows/eyes/mouth only
  const fx = f => -wdt / 2 + f * wdt, fy = f => -hgt + f * hgt, s = hgt / 560;
  const skin = '#E9B98F';
  g.lineCap = 'round'; g.strokeStyle = '#1B1210';
  if (expr === 'kaget') {
    [[0.365, 0.455], [0.64, 0.455]].forEach(([ex, ey]) => { g.beginPath(); g.ellipse(fx(ex), fy(ey), 30 * s, 34 * s, 0, 0, 7); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 5 * s; g.stroke(); g.beginPath(); g.arc(fx(ex), fy(ey), 12 * s, 0, 7); g.fillStyle = '#1B1210'; g.fill(); });
    g.beginPath(); g.ellipse(fx(0.5), fy(0.6), 22 * s, 28 * s, 0, 0, 7); g.fillStyle = '#5A1E1E'; g.fill(); g.lineWidth = 5 * s; g.stroke();
    [[0.365, -1], [0.64, 1]].forEach(([ex, sd]) => { g.beginPath(); g.moveTo(fx(ex) - 30 * s, fy(0.395)); g.quadraticCurveTo(fx(ex), fy(0.375), fx(ex) + 30 * s, fy(0.395)); g.lineWidth = 9 * s; g.stroke(); });
  } else if (expr === 'senang') {
    [0.365, 0.64].forEach(ex => { g.beginPath(); g.ellipse(fx(ex), fy(0.455), 32 * s, 22 * s, 0, 0, 7); g.fillStyle = skin; g.fill(); g.beginPath(); g.arc(fx(ex), fy(0.47), 22 * s, Math.PI * 1.1, Math.PI * 1.9); g.lineWidth = 8 * s; g.stroke(); });
    g.beginPath(); g.ellipse(fx(0.5), fy(0.585), 48 * s, 26 * s, 0, 0, 7); g.fillStyle = skin; g.fill();
    g.beginPath(); g.moveTo(fx(0.5) - 46 * s, fy(0.575)); g.quadraticCurveTo(fx(0.5), fy(0.64), fx(0.5) + 46 * s, fy(0.575)); g.closePath(); g.fillStyle = '#5A1E1E'; g.fill(); g.lineWidth = 6 * s; g.stroke();
  } else if (expr === 'mikir') {
    g.beginPath(); g.moveTo(fx(0.6) - 32 * s, fy(0.40)); g.quadraticCurveTo(fx(0.64), fy(0.355), fx(0.64) + 32 * s, fy(0.385)); g.lineWidth = 9 * s; g.stroke();
    const q = stickerCanvas(emoSrc('tanya'), Math.round(120 * s)); if (q) g.drawImage(q, fx(0.86), fy(0.05) + Math.sin(t * 4) * 6);
  }
  if (expr === 'kaget') { const e = stickerCanvas(emoSrc('seru'), Math.round(110 * s)); if (e) g.drawImage(e, fx(0.85), fy(0.08)); }
  g.restore();
}

// ── backgrounds (a different one on every cut) ────────────────
function bg(o, t) {
  const c = o.c || [C.biru, C.biruTua], type = o.bg || 'radial';
  g.save();
  if (type === 'radial' || type === 'confetti' || type === 'halftone') {
    const gr = g.createRadialGradient(540, 860, 80, 540, 960, 1250); gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (type === 'halftone') { g.fillStyle = 'rgba(255,255,255,.12)'; for (let y = 0; y < H; y += 44) for (let x = (y / 44 % 2) * 22; x < W; x += 44) { const r = 4 + 8 * (y / H); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } }
    if (type === 'confetti') for (let i = 0; i < 70; i++) { const yy = (rnd(i) * H + t * (120 + rnd(i + 3) * 160)) % (H + 60) - 30, xx = rnd(i + 7) * W + Math.sin(t * 2 + i) * 30; g.save(); g.translate(xx, yy); g.rotate(t * 3 + i); g.fillStyle = [C.kuning, C.pink, C.cyan, C.mint, C.oranye, C.putih][i % 6]; g.fillRect(-10, -5, 20, 10); g.restore(); }
  } else if (type === 'sunburst') {
    g.fillStyle = c[1]; g.fillRect(0, 0, W, H); g.translate(540, 900); g.rotate(t * 0.25);
    for (let i = 0; i < 20; i++) { g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 2400, i / 20 * Math.PI * 2, (i + 0.5) / 20 * Math.PI * 2); g.closePath(); g.fillStyle = c[0]; g.fill(); }
    g.setTransform(1, 0, 0, 1, 0, 0); const v = g.createRadialGradient(540, 900, 200, 540, 900, 1200); v.addColorStop(0, 'rgba(255,255,255,.18)'); v.addColorStop(1, 'rgba(0,0,0,.25)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  } else if (type === 'stripes') {
    g.fillStyle = c[1]; g.fillRect(0, 0, W, H); g.fillStyle = c[0]; const off = (t * 120) % 160;
    for (let k = -30; k < 30; k++) { g.beginPath(); const x0 = k * 160 + off; g.moveTo(x0, 0); g.lineTo(x0 + 80, 0); g.lineTo(x0 + 80 - H * 0.6, H); g.lineTo(x0 - H * 0.6, H); g.closePath(); g.fill(); }
  } else if (type === 'split') {   // day | night
    const gd = g.createLinearGradient(0, 0, 0, H); gd.addColorStop(0, '#5EC8FF'); gd.addColorStop(1, '#BFEAFF'); g.fillStyle = gd; g.fillRect(0, 0, 540, H);
    const gn = g.createLinearGradient(0, 0, 0, H); gn.addColorStop(0, '#0B1033'); gn.addColorStop(1, '#2A2F6B'); g.fillStyle = gn; g.fillRect(540, 0, 540, H);
    g.fillStyle = '#FFD60A'; g.beginPath(); g.arc(200, 330, 90, 0, 7); g.fill(); g.fillStyle = '#F4F1E1'; g.beginPath(); g.arc(880, 330, 80, 0, 7); g.fill(); g.fillStyle = '#0B1033'; g.beginPath(); g.arc(915, 305, 70, 0, 7); g.fill();
    for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(255,255,255,${0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))})`; g.fillRect(560 + rnd(i) * 500, rnd(i + 9) * 900, 5, 5); }
    g.fillStyle = C.navy; g.fillRect(530, 0, 20, H);
  } else if (type === 'city') {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0B1033'); gr.addColorStop(1, c[0] === C.biru ? '#3A1F6B' : c[0]); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    let x = -20, i = 0; while (x < W) { const w = 90 + rnd(i) * 110, h = 380 + rnd(i + 4) * 700; g.fillStyle = i % 2 ? '#151A45' : '#1C2257'; g.fillRect(x, H - h, w, h);
      for (let r = 0; r < h / 46 - 1; r++) for (let k = 0; k < w / 34 - 1; k++) if (rnd(i * 97 + r * 13 + k) > 0.55) { g.fillStyle = rnd(i + r + k) > 0.5 ? '#FFE08A' : '#7FD8FF'; g.fillRect(x + 12 + k * 34, H - h + 20 + r * 46, 16, 22); }
      x += w + 8; i++; }
  } else if (type === 'chat') {
    g.fillStyle = '#ECE5DD'; g.fillRect(0, 0, W, H); g.globalAlpha = 0.08;
    for (let y = 0; y < H; y += 140) for (let x = (y / 140 % 2) * 70; x < W; x += 140) { g.strokeStyle = C.navy; g.lineWidth = 5; g.beginPath(); g.arc(x, y, 22, 0, 5); g.stroke(); g.strokeRect(x + 40, y + 40, 26, 26); }
    g.globalAlpha = 1; g.fillStyle = '#075E54'; g.fillRect(0, 0, W, 150);
  } else if (type === 'warning') {
    g.fillStyle = '#16181F'; g.fillRect(0, 0, W, H); const off = (t * 90) % 120;
    [[0, 110], [H - 110, 110]].forEach(([y0, h]) => { g.save(); g.beginPath(); g.rect(0, y0, W, h); g.clip(); g.fillStyle = C.kuning; g.fillRect(0, y0, W, h); g.fillStyle = '#111'; for (let k = -20; k < 20; k++) { g.beginPath(); const x0 = k * 120 + off; g.moveTo(x0, y0); g.lineTo(x0 + 60, y0); g.lineTo(x0 + 60 - h, y0 + h); g.lineTo(x0 - h, y0 + h); g.closePath(); g.fill(); } g.restore(); });
    const v = g.createRadialGradient(540, 960, 100, 540, 960, 900); v.addColorStop(0, 'rgba(239,68,68,.35)'); v.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  } else if (type === 'sunset') {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#3B1E6B'); gr.addColorStop(0.5, '#FF6B6B'); gr.addColorStop(1, '#FFB86B'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,214,10,.9)'; g.beginPath(); g.arc(540, 1240, 240, Math.PI, 0); g.fill();
    g.fillStyle = '#2A1840'; g.beginPath(); g.moveTo(0, 1300); for (let x = 0; x <= W; x += 60) g.lineTo(x, 1240 - Math.abs(Math.sin(x * 0.01)) * 120); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  } else if (type === 'solid') { g.fillStyle = c[0]; g.fillRect(0, 0, W, H); }
  g.restore();
}

// ── camera punch / shake ──────────────────────────────────────
let PUNCH = [], SHAKES = [];
const punch = (t0, amt = 0.06) => PUNCH.push([t0, amt]);
const shake = (t0, px = 12, d = 0.3) => SHAKES.push([t0, px, d]);
function camFx(t) {
  let z = 1, sx = 0, sy = 0;
  PUNCH.forEach(([t0, a]) => { if (t >= t0 && t < t0 + 0.45) z += a * Math.sin(seg(t, t0, t0 + 0.45) * Math.PI) * (1 - seg(t, t0 + 0.1, t0 + 0.45) * 0.5); });
  SHAKES.forEach(([t0, px, d]) => { if (t >= t0 && t < t0 + d) { const k = 1 - (t - t0) / d; sx += (rnd(Math.floor(t * 60)) - 0.5) * 2 * px * k; sy += (rnd(Math.floor(t * 60) + 7) - 0.5) * 2 * px * k; } });
  return [z, sx, sy];
}

// ── shots & transitions ───────────────────────────────────────
let BADGE = '';
const shotAt = (t0, look, draw) => ({ t0, look, draw });
const TRANS = ['iris', 'slide', 'wipe', 'flash'];
const bufA = document.createElement('canvas'), bufB = document.createElement('canvas');
const SCRATCH = (() => { const c = document.createElement('canvas'); c.width = 8; c.height = 8; return c.getContext('2d'); })();   // first (bookkeeping) pass draws here
[bufA, bufB].forEach(b => { b.width = W; b.height = H; });
function drawShot(i, t, target) {
  const S = SHOTS[i], ctx = target.getContext('2d'), prev = g;
  g = ctx; NOW = t; PUNCH = []; SHAKES = []; MASKOT_USES = []; FOCUS = [];
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  bg(S.look, t);
  if (S.look.fx !== 'none') ambient(S.look, t, i);
  // content is drawn twice: once to register punches/shakes (no output), then for real with the camera applied
  { const real = g; g = SCRATCH; g.setTransform(1, 0, 0, 1, 0, 0); g.save(); S.draw(t, t - S.t0); g.restore(); g = real; }
  // camera: punches/shakes + a slow push-in & tilt on every shot (never a dead frame) + focus zooms
  const [z, sx, sy] = camFx(t), age = t - S.t0, dr = S.look.drift ?? 1, ek = easeOut(clamp(age / 3.4));
  const Z = z * (1 + 0.055 * dr * ek), rot = 0.014 * dr * ek * (i % 2 ? 1 : -1);
  let fx = 540, fy = 960, fz = 1;
  FOCUS.forEach(([t0, x, y, zz, d]) => { if (t >= t0 && t < t0 + d + 0.35) { const k = ease(seg(t, t0, t0 + 0.35)) * (1 - ease(seg(t, t0 + d, t0 + d + 0.35))); fx = lerp(540, x, k); fy = lerp(960, y, k); fz = lerp(1, zz, k); } });
  g.setTransform(1, 0, 0, 1, 540 + sx, 960 + sy); g.rotate(rot); g.scale(Z * fz, Z * fz); g.translate(-fx, -fy);
  S.draw(t, t - S.t0);
  g.setTransform(1, 0, 0, 1, 0, 0); g = prev;
}
function renderFrame(t) {
  g = MAIN;
  SHOTS.sort((a, b) => a.t0 - b.t0);
  let i = 0; for (let k = 0; k < SHOTS.length; k++) if (t >= SHOTS[k].t0) i = k;
  const nb = SHOTS[i + 1] ? SHOTS[i + 1].t0 : 1e9, pb = SHOTS[i].t0, half = 0.11;
  let mode = null, a = i, b = i, p = 0;
  if (i + 1 < SHOTS.length && t > nb - half) { mode = TRANS[(i + 1) % TRANS.length]; a = i; b = i + 1; p = (t - (nb - half)) / (2 * half); }
  else if (i > 0 && t < pb + half) { mode = TRANS[i % TRANS.length]; a = i - 1; b = i; p = (t - (pb - half)) / (2 * half); }
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (!mode) { drawShot(i, t, bufA); g.drawImage(bufA, 0, 0); }
  else {
    drawShot(a, t, bufA); drawShot(b, t, bufB); const k = ease(clamp(p));
    g.drawImage(bufA, 0, 0); g.save();
    if (mode === 'iris') { g.beginPath(); g.arc(540, 960, k * 1150, 0, 7); g.clip(); g.drawImage(bufB, 0, 0); }
    else if (mode === 'slide') { g.drawImage(bufA, -k * W, 0); g.drawImage(bufB, W - k * W, 0); }
    else if (mode === 'wipe') { const x = k * (W + 700); g.beginPath(); g.moveTo(-10, 0); g.lineTo(x, 0); g.lineTo(x - 700, H); g.lineTo(-10, H); g.closePath(); g.clip(); g.drawImage(bufB, 0, 0); }
    else { g.drawImage(k < 0.5 ? bufA : bufB, 0, 0); g.fillStyle = `rgba(255,255,255,${1 - Math.abs(k - 0.5) * 2})`; g.fillRect(0, 0, W, H); }
    g.restore();
  }
  glitchFx(t);
  // category badge (top centre, no episode number)
  if (BADGE) { const prev = NOW; NOW = 1e6; g.save(); pill(BADGE, 540, 190, -1, { size: 58, still: true, calm: 1, dur: 0.01 }); g.restore(); NOW = prev; }
  // fade to black at the end
  const f = seg(t, DURATION - 0.65, DURATION); if (f > 0) { g.fillStyle = `rgba(0,0,0,${f})`; g.fillRect(0, 0, W, H); }
}
// audio cues for the mixer: whoosh on every cut + everything the shots scheduled
function collectCues(step = 1 / 15) {
  SFX.length = 0; const scratch = document.createElement('canvas'); scratch.width = W; scratch.height = H;
  for (let t = 0; t < DURATION; t += step) { let i = 0; for (let k = 0; k < SHOTS.length; k++) if (t >= SHOTS[k].t0) i = k; drawShot(i, t, scratch); }
  SHOTS.forEach((S, i) => { if (i) cue(S.t0 - 0.12, 'whoosh', 0.8); });
  (window.EXTRA_SFX || []).forEach(c => cue(c.t, c.type, c.gain, c.d));
  return { duration: DURATION, cues: SFX.slice().sort((a, b) => a.t - b.t) };
}
// load every image the shots use before the first frame (render.js awaits prepare())
window.prepare = async () => {
  await document.fonts.ready;
  const scratch = document.createElement('canvas'); scratch.width = W; scratch.height = H;
  for (let t = 0; t < DURATION; t += 0.5) { let i = 0; for (let k = 0; k < SHOTS.length; k++) if (t >= SHOTS[k].t0) i = k; try { drawShot(i, t, scratch); } catch (e) { console.error(e); } }
  await Promise.all(PENDING);
  return true;
};

// ══ Pop v2: elemen "wow" (gerak terus, perbandingan visual, ledakan, glitch) ══
let FOCUS = [];
// camera zooms toward (x,y) by zz for d seconds (eases in/out)
const fokus = (t0, x, y, zz = 1.35, d = 1.2) => FOCUS.push([t0, x, y, zz, d]);
// ambient layer on every background: drifting bokeh + twinkling stars
function ambient(look, t, si) {
  g.save();
  for (let i = 0; i < 16; i++) {
    const r = 6 + rnd(i + si * 31) * 22, x = rnd(i * 3 + si) * W + Math.sin(t * 0.7 + i) * 30, y = (rnd(i * 7 + si) * (H + 200) - t * (40 + rnd(i) * 70)) % (H + 200);
    g.globalAlpha = 0.10 + 0.08 * Math.sin(t * 2 + i); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, (y + H + 200) % (H + 200) - 100, r, 0, 7); g.fill();
  }
  for (let i = 0; i < 7; i++) {
    const x = rnd(i * 11 + si * 5) * W, y = 260 + rnd(i * 13 + si) * 1300, k = Math.max(0, Math.sin(t * 3.2 + i * 1.7)), r = 16 * k;
    g.globalAlpha = 0.55 * k; g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r); g.fill();
  }
  g.restore();
}
// find when each displayed token is spoken (from t0 on); unmatched tokens follow the previous one
function tokenTimes(toks, t0, o = {}) {
  if (o.times) return o.times;
  let j = WORDS.findIndex(w => w.s >= t0 - 0.08); if (j < 0) j = WORDS.length;
  const out = [];
  toks.forEach((tk, i) => {
    const n = norm(tk); let tt = null;
    for (let k = j; k < WORDS.length && WORDS[k].s < t0 + (o.win || 3.5); k++) { const w = norm(WORDS[k].w); if (n && (w === n || (n.length > 2 && w.startsWith(n)))) { tt = WORDS[k].s; j = k + 1; break; } }
    out.push(tt ?? (i ? out[i - 1] + (o.gap || 0.13) : t0));
  });
  return out;
}
// word-by-word kinetic headline synced to the VO: each word slams in when spoken.
// o.hi: words in yellow, o.mark: words on a marker swipe, o.size, o.maxW, o.col, o.markCol
function kata(s, y, t0, o = {}) {
  const toks = s.split(' '), times = tokenTimes(toks, t0, o), size0 = o.size || 130, maxW = o.maxW || 960, t = NOW;
  g.font = `${size0}px ${FONT}`; const sp = g.measureText(' ').width;
  const lines = [[]]; let lw = 0;
  toks.forEach((tk, i) => { const w = g.measureText(tk).width; if (lw + w > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(i); lw += w + sp; });
  const lh = size0 * 1.08;
  lines.forEach((L, li) => {
    const widths = L.map(i => g.measureText(toks[i]).width), tot = widths.reduce((a, b) => a + b, 0) + sp * (L.length - 1);
    let cx = 540 - tot / 2; const ly = y + (li - (lines.length - 1) / 2) * lh;
    L.forEach((i, k) => {
      const tk = toks[i], ti = times[i], wx = cx + widths[k] / 2; cx += widths[k] + sp;
      cue(ti, 'pop', 0.35); if (t < ti) return;
      const a = seg(t, ti, ti + 0.16), sc = lerp(1.9, 1, easeOut(a)) + Math.sin((t - ti) * 4 + i) * 0.012;
      g.save(); g.translate(wx, ly); g.rotate((rnd(i + y) - 0.5) * 0.08 * (1 - a) + Math.sin((t - ti) * 2.5 + i) * 0.012); g.scale(sc, sc); g.globalAlpha = clamp(a * 3);
      if (o.mark && o.mark.includes(tk)) { const mk = easeOut(seg(t, ti + 0.1, ti + 0.4)); g.save(); g.rotate(-0.04); rr(-widths[k] / 2 - 18, -size0 * 0.48, (widths[k] + 36) * mk, size0 * 0.92, 16); g.fillStyle = o.markCol || C.pink; g.fill(); g.restore(); }
      outlined(tk, 0, 0, size0, o.hi && o.hi.includes(tk) ? C.kuning : (o.col || C.putih));
      g.restore();
    });
  });
}
// VERSUS split: L/R = {flag, emoji, label, valueText, col}; o.y0/o.y1 panel area, o.tv time values appear, o.win 'L'|'R' + o.tw time crown
function vs(L, R, t0, o = {}) {
  const t = NOW; if (t < t0) return; const y0 = o.y0 ?? 300, y1 = o.y1 ?? 1380, ym = (y0 + y1) / 2;
  cue(t0, 'whoosh', 0.9); cue(t0 + 0.25, 'whoosh', 0.8); cue(t0 + 0.5, 'hit', 1.1); punch(t0 + 0.5, 0.07); shake(t0 + 0.5, 16);
  [[L, -1, t0], [R, 1, t0 + 0.25]].forEach(([P, sd, ts]) => {
    if (t < ts) return; const k = easeOut(seg(t, ts, ts + 0.38)), off = (1 - k) * 700 * sd;
    g.save(); g.translate(off, 0); g.beginPath();
    if (sd < 0) { g.moveTo(-20, y0); g.lineTo(600, y0); g.lineTo(480, y1); g.lineTo(-20, y1); } else { g.moveTo(612, y0); g.lineTo(1100, y0); g.lineTo(1100, y1); g.lineTo(492, y1); }
    g.closePath(); g.fillStyle = P.col || (sd < 0 ? C.pink : C.biru); g.fill(); g.lineWidth = 10; g.strokeStyle = C.navy; g.stroke();
    g.clip(); g.globalAlpha = 0.14; g.fillStyle = '#fff'; for (let q = -12; q < 30; q++) g.fillRect(q * 70 + ((t * 60) % 70), y0, 26, y1 - y0); g.globalAlpha = 1;
    g.restore();
    const px = sd < 0 ? 270 : 810, sc = stickerCanvas(P.flag ? flag(P.flag) : emoSrc(P.emoji || 'tanya'), 230);
    g.save(); g.translate(px + off, ym - 220 + Math.sin(t * 2.4 + sd) * 10); g.rotate(sd * -0.08);
    if (o.win === (sd < 0 ? 'L' : 'R') && t > (o.tw ?? 1e9)) { const gk = seg(t, o.tw, o.tw + 0.3); g.shadowColor = C.kuning; g.shadowBlur = 60 * gk; }
    if (sc) g.drawImage(sc, -sc.width / 2, -sc.height / 2); g.restore();
    outlined(P.label, px + off, ym + 10, fitSize(P.label, 74, 420), C.putih);
    const tv = P.tv ?? o.tv ?? t0 + 0.7; if (P.valueText) cue(tv, 'hit', 0.7);
    if (P.valueText && t >= tv) { const vk = back(seg(t, tv, tv + 0.3)); g.save(); g.translate(px + off, ym + 150); g.scale(vk, vk); outlined(P.valueText, 0, 0, fitSize(P.valueText, 104, 440), C.kuning); g.restore(); }
    if (o.win === (sd < 0 ? 'L' : 'R') && t >= (o.tw ?? 1e9)) { cue(o.tw, 'hit', 0.9); const ck = back(seg(t, o.tw, o.tw + 0.35)), cr = stickerCanvas(emoSrc('mahkota'), 150); if (cr) { g.save(); g.translate(px + off, ym - 400 - (1 - ck) * 200); g.rotate(-0.15); g.globalAlpha = clamp(ck * 2); g.drawImage(cr, -cr.width / 2, -cr.height / 2); g.restore(); } }
  });
  if (t >= t0 + 0.5) { // VS badge + lightning
    const k = back(seg(t, t0 + 0.5, t0 + 0.75)); g.save(); g.translate(546, ym); g.scale(k, k); g.rotate(-0.1 + Math.sin(t * 6) * 0.03);
    g.fillStyle = C.kuning; g.strokeStyle = C.navy; g.lineWidth = 10; g.beginPath(); [[-40, -260], [40, -60], [-10, -40], [50, 250], [-50, 30], [0, 10], [-70, -260]].forEach(([x, yy], q) => q ? g.lineTo(x, yy) : g.moveTo(x, yy)); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.arc(0, 0, 118, 0, 7); g.fillStyle = C.navy; g.fill(); g.beginPath(); g.arc(0, 0, 100, 0, 7); g.fillStyle = C.kuning; g.fill();
    outlined('VS', 0, 6, 120, C.putih); g.restore();
    burst(546, ym, t0 + 0.5, { n: 22 });
  }
}
// vertical bar race: items [{flag|emoji, label, value, valueText, col, t}]; o.y baseline, o.h max height, o.crown true
function race(items, t0, o = {}) {
  const t = NOW, base = o.y ?? 1380, hmax = o.h ?? 760, n = items.length, colW = Math.min(230, 860 / n - 40), gap = 940 / n, max = o.max || Math.max(...items.map(i => i.value));
  g.save(); g.fillStyle = C.navy; rr(60, base, 960, 16, 8); g.fill(); g.restore();
  items.forEach((it, i) => {
    const ti = it.t ?? t0 + i * (o.stagger ?? 0.45); cue(ti, 'riser', 0.35, 0.6); if (t < ti) return;
    const k = easeOut(seg(t, ti, ti + 0.9)), h = Math.max(20, hmax * it.value / max * k), cx = 70 + gap * (i + 0.5);
    for (let q = 0; q < 8; q++) cue(ti + q * 0.11, 'tick', 0.3);
    g.save(); rr(cx - colW / 2 + 10, base - h + 12, colW, h, 22); g.fillStyle = 'rgba(5,10,40,.4)'; g.fill();
    rr(cx - colW / 2, base - h, colW, h, 22); g.fillStyle = it.col || C.kuning; g.fill(); g.lineWidth = 8; g.strokeStyle = C.navy; g.stroke();
    g.globalAlpha = 0.25; rr(cx - colW / 2 + 16, base - h + 16, colW * 0.18, Math.max(0, h - 32), 10); g.fillStyle = '#fff'; g.fill(); g.restore();
    const v = (it.value * k), vt = it.fmt ? it.fmt(v) : Math.round(v).toLocaleString('id-ID') + (it.suffix || '');
    outlined(k > 0.98 && it.valueText ? it.valueText : vt, cx, base - h - 175, fitSize(it.valueText || vt, 70, colW + 60), C.putih);
    const sc = stickerCanvas(it.flag ? flag(it.flag) : emoSrc(it.emoji || 'tanya'), 120); if (sc) g.drawImage(sc, cx - sc.width / 2, base - h - 120 - sc.height / 2 + 40);
    outlined(it.label, cx, base + 70, fitSize(it.label, 56, colW + 50), C.putih);
    if (o.crown && it.value === max && k > 0.98) { const tc = ti + 0.9, ck = back(seg(t, tc, tc + 0.3)), cr = stickerCanvas(emoSrc('mahkota'), 110); cue(tc, 'hit', 0.8); if (cr) { g.save(); g.translate(cx, base - h - 270 - (1 - ck) * 120); g.rotate(0.12); g.globalAlpha = clamp(ck * 2); g.drawImage(cr, -cr.width / 2, -cr.height / 2); g.restore(); } }
  });
}
// confetti/star explosion at (x,y)
function burst(x, y, t0, o = {}) {
  cue(t0, 'pop', 0.7); const t = NOW, d = o.d || 0.9; if (t < t0 || t > t0 + d) return;
  const k = (t - t0) / d, cols = o.cols || [C.kuning, C.pink, C.cyan, C.mint, C.putih, C.oranye];
  for (let i = 0; i < (o.n || 28); i++) {
    const a = rnd(i + x) * Math.PI * 2, sp = (o.r || 520) * (0.5 + rnd(i * 3 + y) * 0.7), px = x + Math.cos(a) * sp * easeOut(k), py = y + Math.sin(a) * sp * easeOut(k) + 260 * k * k;
    g.save(); g.globalAlpha = 1 - k; g.fillStyle = cols[i % cols.length]; g.translate(px, py); g.rotate(t * 8 + i);
    if (i % 3) g.fillRect(-11, -6, 22, 12); else { g.beginPath(); for (let q = 0; q < 10; q++) { const r2 = q % 2 ? 7 : 16, aa = q * Math.PI / 5; g.lineTo(Math.cos(aa) * r2, Math.sin(aa) * r2); } g.closePath(); g.fill(); }
    g.restore();
  }
}
// anime speed lines between t0..t1 (focus on centre)
function speed(t0, t1, o = {}) {
  const t = NOW; if (t < t0 || t > t1) return; const f = Math.floor(t * 20);
  g.save(); g.globalAlpha = (o.a ?? 0.5) * (1 - seg(t, t1 - 0.2, t1)); g.fillStyle = o.col || '#fff';
  for (let i = 0; i < 46; i++) { const a = rnd(i + f * 0.37) * Math.PI * 2, w = 0.012 + rnd(i * 5 + f) * 0.02, r0 = 430 + rnd(i * 7 + f) * 260; g.beginPath(); g.moveTo(540 + Math.cos(a) * r0, (o.y || 900) + Math.sin(a) * r0); g.lineTo(540 + Math.cos(a - w) * 1700, (o.y || 900) + Math.sin(a - w) * 1700); g.lineTo(540 + Math.cos(a + w) * 1700, (o.y || 900) + Math.sin(a + w) * 1700); g.fill(); }
  g.restore();
}
// emoji rain
function hujan(code, t0, t1, o = {}) {
  const t = NOW; if (t < t0 || t > t1 + 2) return; cue(t0, 'pop', 0.5);
  for (let i = 0; i < (o.n || 12); i++) {
    const ti = t0 + rnd(i * 9) * (t1 - t0); if (t < ti) continue;
    const y = -150 + (t - ti) * (900 + rnd(i) * 500), x = 80 + rnd(i * 4 + 1) * 920, sc = stickerCanvas(code.startsWith && code.startsWith('vendor/') ? code : emoSrc(code), o.size || 110);
    if (sc && y < H + 150) { g.save(); g.translate(x, y); g.rotate((t - ti) * (rnd(i) - 0.5) * 6); g.globalAlpha = o.alpha ?? 0.9; g.drawImage(sc, -sc.width / 2, -sc.height / 2); g.restore(); }
  }
}
// animated arrow drawn from (x0,y0) to (x1,y1)
function panah(x0, y0, x1, y1, t0, o = {}) {
  const t = NOW; if (t < t0) return; cue(t0, 'whoosh', 0.5);
  const k = easeOut(seg(t, t0, t0 + 0.35)), mx = (x0 + x1) / 2 + (y1 - y0) * 0.25, my = (y0 + y1) / 2 - (x1 - x0) * 0.25;
  const q = u => [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1];
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  [[C.navy, 46], [o.col || C.kuning, 26]].forEach(([c, w]) => { g.beginPath(); for (let u = 0; u <= k; u += 0.04) { const [px, py] = q(u); u ? g.lineTo(px, py) : g.moveTo(px, py); } g.strokeStyle = c; g.lineWidth = w; g.stroke(); });
  if (k > 0.95) { const [ax, ay] = q(0.93), ang = Math.atan2(y1 - ay, x1 - ax); g.translate(x1, y1); g.rotate(ang); g.beginPath(); g.moveTo(14, 0); g.lineTo(-60, -44); g.lineTo(-60, 44); g.closePath(); g.fillStyle = o.col || C.kuning; g.fill(); g.lineWidth = 9; g.strokeStyle = C.navy; g.stroke(); }
  g.restore();
}
// glitch moment (twist): RGB split + displaced slices, applied to the composed frame
const GLITCH = [];
function glitchAt(t0, d = 0.45) { if (!GLITCH.some(([a]) => Math.abs(a - t0) < 0.05)) { GLITCH.push([t0, d]); cue(t0, 'retak', 0.8); } }
const gbuf = document.createElement('canvas'); gbuf.width = W; gbuf.height = H;
function glitchFx(t) {
  const G = GLITCH.find(([a, d]) => t >= a && t < a + d); if (!G) return;
  const k = 1 - (t - G[0]) / G[1], f = Math.floor(t * 30), gx = gbuf.getContext('2d');
  gx.clearRect(0, 0, W, H); gx.drawImage(cv, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'screen'; g.globalAlpha = 0.55 * k;
  g.filter = 'sepia(1) saturate(8) hue-rotate(-50deg)'; g.drawImage(gbuf, 18 * k, 0);
  g.filter = 'sepia(1) saturate(8) hue-rotate(140deg)'; g.drawImage(gbuf, -18 * k, 0); g.filter = 'none';
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  for (let i = 0; i < 9; i++) { const y = rnd(i + f) * H, h = 20 + rnd(i * 3 + f) * 90, dx = (rnd(i * 7 + f) - 0.5) * 160 * k; g.drawImage(gbuf, 0, y, W, h, dx, y, W, h); }
  g.fillStyle = `rgba(0,0,0,${0.12 * k})`; for (let y = 0; y < H; y += 6) g.fillRect(0, y, W, 2);
  g.restore();
}
