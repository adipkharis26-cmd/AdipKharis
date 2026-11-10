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
