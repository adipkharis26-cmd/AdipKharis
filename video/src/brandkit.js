// Branding kit: channel profile logos (800×800, safe inside the circle crop) and YouTube banner (2560×1440).
// Runs in brand.html after kinetic.js (reuses its canvas `g`, stickerCanvas, emoSrc, flag, mascot, rr).
// Look (font, outline, colours) comes from config.channels.<id>.thumbnail; art (character) is passed in as data: URLs.

let BP = null, BS = null;   // preset, spec
const bFont = size => `${BP.berat ? BP.berat + ' ' : ''}${size}px "${BP.font}", "Arial Black", sans-serif`;
const bCol = c => (c && BP.warna && BP.warna[c]) || (c && BS.warna && BS.warna[c]) || c || '#fff';
function bLoad(src) { return new Promise(r => { if (!src) return r(null); const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = src; }); }
function bFit(s, size, maxW) { g.font = bFont(size); const w = g.measureText(s).width; return w > maxW ? Math.floor(size * maxW / w) : size; }
function bText(s, x, y, size, col, o = {}) {
  g.save(); g.font = bFont(size); g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.miterLimit = 2;
  if (o.shadow !== false) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillText(s, x + size * 0.03, y + size * 0.09); }
  g.lineWidth = size * (o.ol ?? 0.22); g.strokeStyle = BP.ol; g.strokeText(s, x, y);
  g.fillStyle = col; g.fillText(s, x, y); g.restore();
}
async function bSticker(code, x, y, size, rot = 0) {
  const src = code.length === 2 ? flag(code) : emoSrc(code);
  img(src); await Promise.all(PENDING);
  const c = stickerCanvas(src, Math.round(size)); if (!c) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowOffsetY = size * 0.06; g.shadowBlur = size * 0.08;
  g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
}
// background: brand gradient + signature pattern
function bBg(w, h, pola) {
  const [c1, c2] = [BS.warna.bg1, BS.warna.bg2];
  const gr = g.createRadialGradient(w * 0.5, h * 0.45, Math.min(w, h) * 0.1, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
  gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.save();
  if (pola === 'catur') {   // Mas Kharis: teal/white checker floor in perspective
    g.globalAlpha = 0.16; g.fillStyle = '#fff'; const s = Math.max(w, h) / 14;
    for (let y = 0; y < h / s + 1; y++) for (let x = 0; x < w / s + 1; x++) if ((x + y) % 2 === 0) g.fillRect(x * s, y * s, s, s);
  } else if (pola === 'batik') {   // Ternyata Leluhur: kawung-like ovals
    g.globalAlpha = 0.13; g.strokeStyle = '#fff'; g.lineWidth = Math.max(3, w / 400); const s = Math.max(w, h) / 12;
    for (let y = -1; y < h / s + 1; y++) for (let x = -1; x < w / s + 1; x++) { const cx = x * s + s / 2, cy = y * s + s / 2;
      [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(a => { g.beginPath(); g.ellipse(cx + Math.cos(a) * s * 0.25, cy + Math.sin(a) * s * 0.25, s * 0.22, s * 0.12, a, 0, 7); g.stroke(); });
      g.beginPath(); g.arc(cx, cy, s * 0.05, 0, 7); g.stroke(); }
  } else if (pola === 'sunburst') {   // Dari 1 mnt: rays + halftone dots
    g.globalAlpha = 0.18; g.fillStyle = '#fff'; g.translate(w / 2, h / 2);
    for (let i = 0; i < 24; i++) { g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, Math.max(w, h), i / 24 * Math.PI * 2, (i + 0.5) / 24 * Math.PI * 2); g.closePath(); g.fill(); }
  } else {   // default: soft dots
    g.globalAlpha = 0.12; g.fillStyle = '#fff'; const s = Math.max(w, h) / 20;
    for (let y = 0; y < h / s + 1; y++) for (let x = (y % 2) * 0.5; x < w / s + 1; x++) { g.beginPath(); g.arc(x * s, y * s, s * 0.12, 0, 7); g.fill(); }
  }
  g.restore();
  const v = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.35)');
  g.fillStyle = v; g.fillRect(0, 0, w, h);
}
// draw the character art: crop [x,y,w,h] of the art image into box (bx,by,bw,bh), aspect kept (cover)
function bArt(im, crop, bx, by, bw, bh, o = {}) {
  if (!im) return; const [cx, cy, cw, ch] = crop || [0, 0, im.width, im.height];
  const s = Math.max(bw / cw, bh / ch), dw = cw * s, dh = ch * s;
  g.save(); if (o.clip) { g.beginPath(); o.clip(); g.clip(); }
  if (o.shadow) { g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 30; g.shadowOffsetY = 14; }
  g.drawImage(im, cx, cy, cw, ch, bx + (bw - dw) / 2, by + (bh - dh) / 2, dw, dh); g.restore();
}
function ring(cx, cy, r) {
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.lineWidth = 34; g.strokeStyle = BP.ol; g.stroke();
  g.lineWidth = 18; g.strokeStyle = bCol(BS.warna.aksen); g.stroke(); g.restore();
}

// one logo (800×800). L = {jenis:'karakter'|'monogram'|'nama', ...}
window.logo = async (spec, preset, artUrl, L) => {
  BP = preset; BS = spec; g = MAIN; await document.fonts.ready;
  const S = 800, art = await bLoad(artUrl);
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
  g.save(); g.beginPath(); g.rect(0, 0, S, S); g.clip();
  bBg(S, S, L.pola || BS.pola);
  if (L.jenis === 'karakter') {
    if (BS.art && BS.art.maskot) { await Promise.all(PENDING); NOW = 10.32; mascot(10, 20, BS.art.maskot, { size: L.size || 900, x: 400, y: L.y ?? 1010 }); }
    else bArt(art, L.crop, L.box ? L.box[0] : 40, L.box ? L.box[1] : 60, L.box ? L.box[2] : 720, L.box ? L.box[3] : 760, { shadow: true });
    if (L.stiker) await bSticker(L.stiker, L.stikerXY ? L.stikerXY[0] : 620, L.stikerXY ? L.stikerXY[1] : 190, L.stikerSize || 150, 0.18);
  } else if (L.jenis === 'monogram') {
    if (L.stiker) await bSticker(L.stiker, 400, 205, 190, -0.08);
    const s = bFit(L.teks, 340, 600); bText(L.teks, 400, 470, s, bCol(L.warna || BS.warna.aksen), { ol: 0.2 });
    if (L.sub) bText(L.sub, 400, 640, bFit(L.sub, 76, 470), '#fff', { ol: 0.25 });
  } else {   // nama: short stacked name
    if (L.stiker) await bSticker(L.stiker, 400, 190, 170, 0.1);
    const lines = L.baris || [BS.nama.toUpperCase()];
    const sizes = lines.map((t, i) => bFit(t, i === lines.length - 1 ? 190 : 150, 600)), tot = sizes.reduce((a, b) => a + b * 1.05, 0);
    let y = 470 - tot / 2; lines.forEach((t, i) => { bText(t, 400, y + sizes[i] * 0.52, sizes[i], i === lines.length - 1 ? bCol(BS.warna.aksen) : '#fff'); y += sizes[i] * 1.05; });
  }
  g.restore();
  ring(400, 400, 383);
  const out = document.createElement('canvas'); out.width = out.height = S; out.getContext('2d').drawImage(cv, 0, 0, S, S, 0, 0, S, S);
  return out.toDataURL('image/png').split(',')[1];
};

// banner 2560×1440. Everything important sits in the centre safe area (1546×423, all devices).
const SAFE = { x: 507, y: 508.5, w: 1546, h: 423 };
window.banner = async (spec, preset, artUrl, B) => {
  BP = preset; BS = spec; g = MAIN; await document.fonts.ready;
  const art = await bLoad(artUrl);
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 2560, 1440);
  bBg(2560, 1440, B.pola || BS.pola);
  // decoration outside the safe area (seen on TV / wide desktop only)
  for (const [i, d] of (B.hiasan || []).entries()) await bSticker(d, [260, 2300, 300, 2260, 140, 2420][i % 6], [720, 720, 380, 1060, 1180, 260][i % 6], 170, (i % 2 ? 0.2 : -0.2));
  // band behind the safe area for contrast
  g.save(); g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, SAFE.y + 18, 2560, SAFE.h - 36); g.restore();
  const left = B.artKiri !== false, ax = left ? SAFE.x + 10 : SAFE.x + SAFE.w - 400, tx0 = left ? SAFE.x + 430 : SAFE.x + 40, tw = SAFE.w - 470;
  if (BS.art && BS.art.maskot) { await Promise.all(PENDING); NOW = 10.32; mascot(10, 20, B.maskotExpr || BS.art.maskot, { size: 470, x: ax + 195, y: SAFE.y + SAFE.h + 25 }); }
  else if (B.bingkai === 'lingkaran') {   // art with its own background → round badge with brand ring
    const cx0 = ax + 195, cy0 = SAFE.y + SAFE.h / 2, r = 190;
    bArt(art, B.crop, cx0 - r, cy0 - r, 2 * r, 2 * r, { clip: () => g.arc(cx0, cy0, r, 0, 7) });
    g.save(); g.beginPath(); g.arc(cx0, cy0, r, 0, 7); g.lineWidth = 26; g.strokeStyle = BP.ol; g.stroke(); g.lineWidth = 13; g.strokeStyle = bCol(BS.warna.aksen); g.stroke(); g.restore();
  } else bArt(art, B.crop, ax, SAFE.y - 10, 390, SAFE.h + 10, { shadow: true });
  const cx = tx0 + tw / 2;
  bText(BS.nama.toUpperCase(), cx, SAFE.y + 140, bFit(BS.nama.toUpperCase(), 170, tw - 40), '#fff', { ol: 0.18 });
  bText(BS.tagline, cx, SAFE.y + 268, bFit(BS.tagline, 74, tw - 60), bCol(BS.warna.aksen), { ol: 0.22 });
  // schedule pill
  const s = BS.jadwal || 'VIDEO BARU SETIAP HARI', size = 44; g.font = bFont(size); const pw = g.measureText(s).width + 90, ph = 84;
  g.save(); g.translate(cx, SAFE.y + 365); rr(-pw / 2, -ph / 2 + 6, pw, ph, ph / 2); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill();
  rr(-pw / 2, -ph / 2, pw, ph, ph / 2); g.fillStyle = '#FF0033'; g.fill(); g.lineWidth = 6; g.strokeStyle = BP.ol; g.stroke();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('▶ ' + s, 0, 4); g.restore();
  return cv.toDataURL('image/png').split(',')[1];
};

// review sheets
window.cekLogo = async (urls, names) => {
  const ims = await Promise.all(urls.map(bLoad)), c = document.createElement('canvas'); c.width = ims.length * 460 + 40; c.height = 620;
  const x = c.getContext('2d'); x.fillStyle = '#F4F4F4'; x.fillRect(0, 0, c.width, c.height); x.font = '900 34px Montserrat'; x.fillStyle = '#222';
  ims.forEach((im, i) => { const ox = 40 + i * 460;
    x.fillText(names[i], ox, 50);
    x.save(); x.beginPath(); x.arc(ox + 200, 280, 200, 0, 7); x.clip(); x.drawImage(im, ox, 80, 400, 400); x.restore();
    [[98, 520], [48, 540], [32, 548]].forEach(([s, y], k) => { const px = ox + [0, 120, 190][k]; x.save(); x.beginPath(); x.arc(px + s / 2, y + s / 2 - 20, s / 2, 0, 7); x.clip(); x.drawImage(im, px, y - 20, s, s); x.restore(); });
  });
  return c.toDataURL('image/png').split(',')[1];
};
window.cekBanner = async url => {
  const im = await bLoad(url), c = document.createElement('canvas'); c.width = 1320; c.height = 1290;
  const x = c.getContext('2d'); x.fillStyle = '#F4F4F4'; x.fillRect(0, 0, c.width, c.height); x.font = '900 28px Montserrat'; x.fillStyle = '#222';
  x.fillText('TV (2560×1440) — garis: area desktop & area aman HP', 20, 34); x.drawImage(im, 20, 50, 1280, 720);
  x.strokeStyle = '#00C2FF'; x.lineWidth = 3; x.strokeRect(20, 50 + 508.5 / 2, 1280, 423 / 2);
  x.strokeStyle = '#FF2D55'; x.setLineDash([10, 6]); x.strokeRect(20 + 507 / 2, 50 + 508.5 / 2, 1546 / 2, 423 / 2); x.setLineDash([]);
  x.fillText('Desktop (2560×423)', 20, 815); x.drawImage(im, 0, 508.5, 2560, 423, 20, 830, 1280, 211.5);
  x.fillText('HP (1546×423)', 20, 1080); x.drawImage(im, 507, 508.5, 1546, 423, 20, 1094, 620, 170);
  return c.toDataURL('image/png').split(',')[1];
};
window.prepare = async () => { await document.fonts.ready; return true; };

// ══ v2: setiap divisi punya font, susunan, warna & CTA sendiri ══
// spec.font = {judul:'Fredoka', judulBerat:'700', isi:'Baloo 2', isiBerat:'800'}
const fJ = size => `${BS.font && BS.font.judulBerat || '900'} ${size}px "${(BS.font && BS.font.judul) || BP.font}", "Arial Black", sans-serif`;
const fI = size => `${BS.font && BS.font.isiBerat || '900'} ${size}px "${(BS.font && BS.font.isi) || BP.font}", "Arial Black", sans-serif`;
function fitF(f, s, size, maxW) { g.font = f(size); const w = g.measureText(s).width; return w > maxW ? Math.floor(size * maxW / w) : size; }
// text with outline; o: {f: fJ|fI, ol, olW, align, rot, shadow, extrude:[dx,dy,col], fill (gradient)}
function T(s, x, y, size, col, o = {}) {
  const f = o.f || fJ; g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.font = f(size); g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.miterLimit = 2;
  if (o.extrude) { const [dx, dy, c] = o.extrude; g.fillStyle = c; g.strokeStyle = c; g.lineWidth = size * (o.olW ?? 0.16); for (let k = 1; k <= 8; k++) { g.strokeText(s, dx * k / 8, dy * k / 8); g.fillText(s, dx * k / 8, dy * k / 8); } }
  else if (o.shadow !== false) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillText(s, size * 0.03, size * 0.08); }
  if ((o.olW ?? 0.16) > 0) { g.lineWidth = size * (o.olW ?? 0.16); g.strokeStyle = o.ol || BP.ol; g.strokeText(s, 0, 0); }
  if (o.grad) { const gr = g.createLinearGradient(0, -size / 2, 0, size / 2); o.grad.forEach((c, i) => gr.addColorStop(i / (o.grad.length - 1), c)); g.fillStyle = gr; } else g.fillStyle = col;
  g.fillText(s, 0, 0); g.restore();
}
function rrect(x, y, w, h, r, fill, stroke, lw) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.lineWidth = lw || 6; g.strokeStyle = stroke; g.stroke(); } }
// vector icons
function stupa(cx, by, h, col, ol) {   // Borobudur-like stupa: base tiers, bell, square harmika, spire
  g.save(); g.fillStyle = col; g.strokeStyle = ol; g.lineWidth = h * 0.035; g.lineJoin = 'round';
  const w = h * 0.95;
  [[1, 0.12], [0.86, 0.1]].forEach(([k, t], i) => { const yy = by - h * (i ? 0.12 : 0); g.beginPath(); g.rect(cx - w * k / 2, yy - h * t, w * k, h * t); g.fill(); g.stroke(); });
  const bb = by - h * 0.22; g.beginPath(); g.moveTo(cx - w * 0.38, bb); g.bezierCurveTo(cx - w * 0.4, bb - h * 0.42, cx + w * 0.4, bb - h * 0.42, cx + w * 0.38, bb); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.rect(cx - w * 0.09, bb - h * 0.42, w * 0.18, h * 0.1); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(cx - w * 0.05, bb - h * 0.42); g.lineTo(cx, by - h); g.lineTo(cx + w * 0.05, bb - h * 0.42); g.closePath(); g.fill(); g.stroke();
  g.restore();
}
function stopwatch(cx, cy, r, face, ring, ol, txt) {
  g.save(); g.lineJoin = 'round';
  rrect(cx - r * 0.18, cy - r * 1.32, r * 0.36, r * 0.24, r * 0.06, ring, ol, r * 0.06);
  g.save(); g.translate(cx + r * 0.8, cy - r * 0.8); g.rotate(0.8); rrect(-r * 0.1, -r * 0.14, r * 0.2, r * 0.22, r * 0.04, ring, ol, r * 0.05); g.restore();
  g.beginPath(); g.arc(cx, cy, r * 1.08, 0, 7); g.fillStyle = ring; g.fill(); g.lineWidth = r * 0.07; g.strokeStyle = ol; g.stroke();
  g.beginPath(); g.arc(cx, cy, r * 0.88, 0, 7); g.fillStyle = face; g.fill(); g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * r * 0.74, cy + Math.sin(a) * r * 0.74); g.lineTo(cx + Math.cos(a) * r * 0.82, cy + Math.sin(a) * r * 0.82); g.lineWidth = r * 0.04; g.stroke(); }
  if (txt) T(txt, cx, cy + r * 0.06, r * 1.0, BS.warna.aksen, { olW: 0.14, ol });
  g.restore();
}
function halftone(x0, y0, w, h, col, a, step) { g.save(); g.globalAlpha = a; g.fillStyle = col; for (let y = y0; y < y0 + h; y += step) for (let x = x0 + ((y / step) % 2) * step / 2; x < x0 + w; x += step) { g.beginPath(); g.arc(x, y, step * 0.22, 0, 7); g.fill(); } g.restore(); }
function splitBg(w, h, c1, c2, ol) {
  g.fillStyle = c1; g.fillRect(0, 0, w, h);
  g.beginPath(); g.moveTo(w * 0.58, 0); g.lineTo(w, 0); g.lineTo(w, h); g.lineTo(w * 0.42, h); g.closePath(); g.fillStyle = c2; g.fill();
  halftone(0, 0, w, h, '#fff', 0.12, Math.max(w, h) / 40);
  g.beginPath(); const zx = [0.58, 0.53, 0.55, 0.47, 0.5, 0.42]; zx.forEach((k, i) => g.lineTo(w * k, h * i / (zx.length - 1))); g.lineWidth = Math.max(w, h) / 70; g.strokeStyle = ol; g.stroke(); g.lineWidth = Math.max(w, h) / 140; g.strokeStyle = '#fff'; g.stroke();
}
function seal(cx, cy, r, col, ol) {   // royal seal ring with dots
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.lineWidth = r * 0.06; g.strokeStyle = col; g.stroke();
  g.beginPath(); g.arc(cx, cy, r * 0.86, 0, 7); g.lineWidth = r * 0.02; g.stroke();
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; g.beginPath(); g.arc(cx + Math.cos(a) * r * 0.93, cy + Math.sin(a) * r * 0.93, r * 0.018, 0, 7); g.fillStyle = col; g.fill(); }
  g.restore();
}

const logoV1 = window.logo;
window.logo = async (spec, preset, artUrl, L) => {
  BP = preset; BS = spec; g = MAIN; await document.fonts.ready;
  if (!['kepala', 'huruf', 'stupa', 'stempel', 'stopwatch', 'wajah'].includes(L.jenis)) return logoV1(spec, preset, artUrl, L);
  const S = 800, art = await bLoad(artUrl), W2 = BS.warna;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
  g.save(); g.beginPath(); g.rect(0, 0, S, S); g.clip();
  if (L.latar === 'split') splitBg(S, S, W2.c1, W2.c2, BP.ol);
  else if (L.latar === 'solid') { g.fillStyle = L.warnaLatar || W2.bg1; g.fillRect(0, 0, S, S); }
  else bBg(S, S, L.pola || BS.pola);
  if (L.jenis === 'kepala') {   // just the character's head: the most compact mark
    bArt(art, L.crop, 0, 40, 800, 800, { shadow: true });
  } else if (L.jenis === 'huruf') {   // one bold letter as a mark
    T(L.teks, 400, 450, fitF(fJ, L.teks, 560, 560), W2.aksen, { olW: 0.12, extrude: [0, 34, BP.ol] });
    if (L.rambut) { g.save(); g.strokeStyle = '#3B2414'; g.lineCap = 'round'; g.lineWidth = 30; g.beginPath(); g.moveTo(400, 210); g.bezierCurveTo(330, 120, 470, 40, 470, 120); g.stroke(); g.beginPath(); g.arc(452, 125, 26, 0.2, Math.PI * 1.4); g.stroke(); g.restore(); }
  } else if (L.jenis === 'stupa') {
    g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 30; g.shadowOffsetY = 16; stupa(400, 640, 470, W2.aksen, BP.ol); g.restore();
    seal(400, 400, 330, W2.aksen, BP.ol);
  } else if (L.jenis === 'stempel') {
    seal(400, 400, 330, W2.aksen, BP.ol);
    T(L.teks, 400, 410, fitF(fJ, L.teks, 300, 470), W2.aksen, { olW: 0.06, ol: BP.ol, grad: ['#FFF3B0', W2.aksen, '#B7791F'] });
    if (L.sub) T(L.sub, 400, 600, fitF(fI, L.sub, 54, 360), '#fff', { f: fI, olW: 0.18 });
  } else if (L.jenis === 'stopwatch') {
    stopwatch(400, 440, 250, '#fff', W2.aksen, BP.ol, L.teks || '1');
  } else if (L.jenis === 'wajah') {
    await Promise.all(PENDING); NOW = 10.32; mascot(10, 20, L.expr || 'kaget', { size: L.size || 1500, x: 400, y: L.y ?? 1560 });
  }
  g.restore();
  if (L.ring !== false) ring(400, 400, 383);
  const out = document.createElement('canvas'); out.width = out.height = S; out.getContext('2d').drawImage(cv, 0, 0, S, S, 0, 0, S, S);
  return out.toDataURL('image/png').split(',')[1];
};

const bannerV1 = window.banner;
window.banner = async (spec, preset, artUrl, B) => {
  BP = preset; BS = spec; g = MAIN; await document.fonts.ready;
  const gaya = B.gaya; if (!['kantor', 'museum', 'versus'].includes(gaya)) return bannerV1(spec, preset, artUrl, B);
  const art = await bLoad(artUrl), W2 = BS.warna, X0 = SAFE.x, Y0 = SAFE.y, X1 = SAFE.x + SAFE.w, Y1 = SAFE.y + SAFE.h;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 2560, 1440);
  if (gaya === 'kantor') {
    // Mas Kharis: his office — yellow wall, teal checker floor, whiteboard with the name, sticky notes of topics
    const gw = g.createLinearGradient(0, 0, 0, 1000); gw.addColorStop(0, '#F7D85C'); gw.addColorStop(1, '#E0B634'); g.fillStyle = gw; g.fillRect(0, 0, 2560, 1000);
    g.fillStyle = '#C99A22'; g.fillRect(0, 990, 2560, 26);
    { const ys = [1016]; let hh = 46; while (ys[ys.length - 1] < 1440) { ys.push(ys[ys.length - 1] + hh); hh *= 1.3; } const xf = y => 1 + (y - 1016) / 160;
      for (let r = 0; r < ys.length - 1; r++) for (let c = -14; c < 14; c++) { const a = ys[r], b = ys[r + 1]; g.beginPath(); g.moveTo(1280 + c * 120 * xf(a), a); g.lineTo(1280 + (c + 1) * 120 * xf(a), a); g.lineTo(1280 + (c + 1) * 120 * xf(b), b); g.lineTo(1280 + c * 120 * xf(b), b); g.closePath(); g.fillStyle = (r + c + 100) % 2 ? '#1F8B95' : '#EEF5F4'; g.fill(); } }
    for (const [e, x, y, s] of [['1F570', 260, 620, 190], ['1F4C5', 2300, 640, 170], ['2615', 180, 1180, 150], ['1F4BC', 2380, 1200, 170]]) await bSticker(e, x, y, s, 0);
    // character (bust) on the left of the safe area
    bArt(art, B.crop, X0 + 10, Y0 - 30, 360, SAFE.h + 60, { shadow: true });
    // whiteboard
    const bx = X0 + 380, bw = 770, byy = Y0 + 20, bh = SAFE.h - 40;
    rrect(bx + 10, byy + 14, bw, bh, 18, 'rgba(0,0,0,.25)'); rrect(bx, byy, bw, bh, 18, '#FDFDFB', '#9AA0B4', 16); rrect(bx + 120, byy + bh - 6, bw - 240, 22, 8, '#9AA0B4');
    T(BS.nama.toUpperCase(), bx + bw / 2, byy + 130, fitF(fJ, BS.nama.toUpperCase(), 150, bw - 170), '#1E3A8A', { olW: 0, shadow: false });
    g.save(); g.strokeStyle = '#E84545'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(bx + 120, byy + 215); g.quadraticCurveTo(bx + bw / 2, byy + 238, bx + bw - 120, byy + 210); g.stroke(); g.restore();
    T(BS.tagline, bx + bw / 2, byy + 290, fitF(fI, BS.tagline, 62, bw - 90), '#E84545', { f: fI, olW: 0, shadow: false, rot: -0.015 });
    // sticky notes = topics
    const notes = B.catatan || ['Gajian', 'Lembur', 'Bos', 'Resign?'], cols = ['#FFE66D', '#FF9EC4', '#8FD3FF', '#A7F3A0'];
    for (let i = 0; i < Math.min(4, notes.length); i++) { const nx = bx + bw + 30 + (i % 2) * 168, ny = Y0 + 45 + Math.floor(i / 2) * 175, rot = (i % 2 ? 0.07 : -0.06);
      g.save(); g.translate(nx + 75, ny + 75); g.rotate(rot); rrect(-75 + 6, -75 + 10, 150, 150, 6, 'rgba(0,0,0,.2)'); rrect(-75, -75, 150, 150, 6, cols[i]); T(notes[i], 0, 6, fitF(fI, notes[i], 42, 132), '#2b2e3c', { f: fI, olW: 0, shadow: false }); g.restore();
      await bSticker('1F4CC', nx + 75, ny + 4, 46, 0); }
    // CTA stamp on the board corner
    g.save(); g.translate(bx + bw - 40, byy + 40); g.rotate(0.2); g.beginPath(); g.arc(0, 0, 70, 0, 7); g.fillStyle = '#E84545'; g.fill(); g.lineWidth = 7; g.strokeStyle = '#fff'; g.stroke();
    (B.cta || ['1 DRAMA', 'TIAP HARI']).forEach((t, i) => T(t, 0, -18 + i * 40, fitF(fI, t, 34, 120), '#fff', { f: fI, olW: 0, shadow: false })); g.restore();
  } else if (gaya === 'museum') {
    // Ternyata Leluhur: documentary/museum — deep emerald, gold Cinzel title, stupa skyline, medallion of the storyteller
    const gr = g.createRadialGradient(1280, 700, 100, 1280, 720, 1500); gr.addColorStop(0, W2.bg1); gr.addColorStop(1, W2.bg2); g.fillStyle = gr; g.fillRect(0, 0, 2560, 1440);
    g.save(); g.globalAlpha = 0.1; g.strokeStyle = W2.aksen; g.lineWidth = 3; const s = 120; for (let y = 0; y < 1440 / s + 1; y++) for (let x = 0; x < 2560 / s + 1; x++) { const cx = x * s, cy = y * s; [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(a => { g.beginPath(); g.ellipse(cx + Math.cos(a) * s * 0.25, cy + Math.sin(a) * s * 0.25, s * 0.22, s * 0.12, a, 0, 7); g.stroke(); }); } g.restore();
    // stupa skyline (bottom, outside safe) + light rays
    g.save(); g.globalAlpha = 0.12; g.fillStyle = W2.aksen; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(1280, 380); g.lineTo(1280 + (i - 4) * 420 - 90, 1440); g.lineTo(1280 + (i - 4) * 420 + 90, 1440); g.closePath(); g.fill(); } g.restore();
    [[180, 1440, 380], [520, 1440, 260], [2040, 1440, 260], [2380, 1440, 380], [1280, 1440, 200], [900, 1440, 150], [1660, 1440, 150]].forEach(([x, y, h]) => stupa(x, y, h, '#0A2A26', W2.aksen));
    // gold frame lines across the desktop band
    g.fillStyle = W2.aksen; g.fillRect(0, Y0 + 6, 2560, 5); g.fillRect(0, Y1 - 11, 2560, 5);
    // medallion with the storyteller (left of safe area)
    const mx = X0 + 200, my = (Y0 + Y1) / 2, mr = 180;
    bArt(art, B.crop, mx - mr, my - mr, 2 * mr, 2 * mr, { clip: () => g.arc(mx, my, mr, 0, 7) });
    seal(mx, my, mr + 14, W2.aksen, BP.ol);
    // titles
    const tx = X0 + 420 + (SAFE.w - 440) / 2, tw = SAFE.w - 470;
    T((B.atas || 'KEARIFAN NUSANTARA × SAINS'), tx, Y0 + 75, fitF(fI, B.atas || 'KEARIFAN NUSANTARA × SAINS', 40, tw), W2.aksen, { f: fI, olW: 0, shadow: false });
    T(BS.nama.toUpperCase(), tx, Y0 + 185, fitF(fJ, BS.nama.toUpperCase(), 150, tw), W2.aksen, { olW: 0.07, ol: '#3A2A08', grad: ['#FFF3B0', W2.aksen, '#B7791F'] });
    g.save(); g.strokeStyle = W2.aksen; g.lineWidth = 4; g.beginPath(); g.moveTo(tx - 360, Y0 + 268); g.lineTo(tx - 30, Y0 + 268); g.moveTo(tx + 30, Y0 + 268); g.lineTo(tx + 360, Y0 + 268); g.stroke(); g.translate(tx, Y0 + 268); g.rotate(Math.PI / 4); g.fillStyle = W2.aksen; g.fillRect(-12, -12, 24, 24); g.restore();
    T(BS.tagline, tx, Y0 + 308, fitF(fI, BS.tagline, 50, tw - 40), '#F5F0E1', { f: fI, olW: 0, shadow: false });
    // ribbon CTA
    const rt = B.cta || 'TIAP HARI 1 RAHASIA BARU', rs = 36; g.font = fI(rs); const rw = g.measureText(rt).width + 120, ry = Y1 - 48;
    g.save(); g.translate(tx, ry); g.fillStyle = '#7A1F1F'; g.beginPath(); g.moveTo(-rw / 2 - 40, -26); g.lineTo(-rw / 2 + 10, -26); g.lineTo(-rw / 2 + 10, 34); g.lineTo(-rw / 2 - 40, 34); g.lineTo(-rw / 2 - 18, 4); g.closePath(); g.fill(); g.beginPath(); g.moveTo(rw / 2 + 40, -26); g.lineTo(rw / 2 - 10, -26); g.lineTo(rw / 2 - 10, 34); g.lineTo(rw / 2 + 40, 34); g.lineTo(rw / 2 + 18, 4); g.closePath(); g.fill();
    rrect(-rw / 2, -34, rw, 64, 4, '#A52A2A', W2.aksen, 4); T(rt, 0, 0, rs, W2.aksen, { f: fI, olW: 0, shadow: false }); g.restore();
  } else {
    // Dari 1 mnt: VERSUS pop — diagonal pink|blue split, Bangers title with 3D extrude, series tags, stopwatch, mascot
    splitBg(2560, 1440, W2.c1, W2.c2, BP.ol);
    for (const [e, x, y, s, r] of [['1F1EE-1F1E9', 230, 420, 190, -0.2], ['1F914', 2330, 420, 180, 0.2], ['1F4A1', 250, 1080, 170, 0.15], ['26A1', 2320, 1060, 180, -0.15], ['1F3AF', 1280, 1250, 150, 0], ['2753', 1280, 200, 140, 0.1]]) await bSticker(e, x, y, s, r);
    await Promise.all(PENDING); NOW = 10.32; mascot(10, 20, B.maskotExpr || 'kaget', { size: 520, x: X0 + 190, y: Y1 + 70 });
    const tx = X0 + 760;
    T(BS.nama.toUpperCase(), tx, Y0 + 130, fitF(fJ, BS.nama.toUpperCase(), 220, 760), W2.aksen, { olW: 0.12, extrude: [10, 20, BP.ol], rot: -0.04 });
    const tags = B.tags || ['FAKTA vs MITOS', 'INDONESIA vs DUNIA', 'BAGAIMANA JIKA?'], tc = ['#FFD60A', '#00F5D4', '#FFFFFF'];
    g.font = fJ(42); const totW = tags.reduce((a, t) => a + g.measureText(t).width + 72, -22); let x = tx - totW / 2; tags.forEach((t, i) => { g.font = fJ(42); const w = g.measureText(t).width + 50; g.save(); g.translate(x + w / 2, Y0 + 268 + (i % 2) * 8); g.rotate(i % 2 ? 0.03 : -0.03); rrect(-w / 2 + 5, -33, w, 66, 33, 'rgba(0,0,0,.35)'); rrect(-w / 2, -38, w, 66, 33, tc[i % 3], BP.ol, 6); T(t, 0, -4, 42, BP.ol, { olW: 0, shadow: false }); g.restore(); x += w + 22; });
    stopwatch(X1 - 140, Y0 + 175, 105, '#fff', W2.aksen, BP.ol, '60');
    const ct = B.cta || '60 DETIK, LANGSUNG PAHAM'; g.font = fJ(50); const cw = g.measureText(ct).width + 60;
    g.save(); g.translate(tx, Y1 - 52); g.rotate(-0.02); rrect(-cw / 2, -36, cw, 72, 12, BP.ol); T(ct, 0, 0, 50, W2.aksen, { olW: 0, shadow: false }); g.restore();
  }
  return cv.toDataURL('image/png').split(',')[1];
};
