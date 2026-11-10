// Thumbnail High CTA: composes a 1080×1920 Shorts cover from a spec (video/thumb/<ep>.json).
// Runs inside thumb.html after kinetic.js, so it reuses kinetic's canvas `g`, bg(), stickerCanvas(), flag(), mascot().
// Channel look (font, outline, colours, sticker style, mascot) comes from config.channels.<id>.thumbnail.

let P = null;   // active preset
const colOf = c => (c && P.warna[c]) || c || P.warna.putih;
const fontOf = size => `${P.berat ? P.berat + ' ' : ''}${size}px "${P.font}", "Arial Black", sans-serif`;
// capitals, but keep currency/units readable: Rp, km, kg
const cap = s => P.kapital === false ? s : s.toUpperCase().replace(/\bRP(?=\s?\d)/g, 'Rp');
function fit(s, size, maxW) { g.font = fontOf(size); const w = g.measureText(s).width; return w > maxW ? Math.floor(size * maxW / w) : size; }
function loadImg(src) { return new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = src; }); }

// background: a frame of the episode (cover-fit, zoom on a focus point) or a kinetic backdrop
function drawLatar(L, frame) {
  g.save();
  if (frame) {
    const z = L.zoom || 1, [fx, fy] = L.fokus || [540, 960];
    let ox = 540 - fx * z, oy = 960 - fy * z;
    ox = Math.min(0, Math.max(W - W * z, ox)); oy = Math.min(0, Math.max(H - H * z, oy));   // never show an empty edge
    g.filter = `saturate(${L.saturasi ?? 1.25}) contrast(${L.kontras ?? 1.1}) brightness(${L.terang ?? 1.03})`;
    g.setTransform(z, 0, 0, z, ox, oy); g.drawImage(frame, 0, 0, W, H);
    g.filter = 'none';
  } else bg({ bg: L.bg || 'sunburst', c: L.c }, L.waktu ?? 0.6);
  g.restore();
  // vignette pulls the eye to the centre
  const v = g.createRadialGradient(540, 900, 380, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${L.vignette ?? 0.45})`);
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}
// dark band behind the text block for legibility
function gelap(y0, y1, a) {
  if (!a) return;
  const gr = g.createLinearGradient(0, y0 - 220, 0, y1 + 220);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.3, `rgba(0,0,0,${a})`); gr.addColorStop(0.7, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, y0 - 220, W, y1 - y0 + 440);
}
function outline(s, x, y, size, col) {
  g.font = fontOf(size); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.miterLimit = 2;
  g.fillStyle = 'rgba(0,0,0,.55)'; g.fillText(s, x + size * 0.03, y + size * 0.1);
  g.lineWidth = size * 0.24; g.strokeStyle = P.ol; g.strokeText(s, x, y);
  g.fillStyle = col; g.fillText(s, x, y);
}
// one headline line: {t, warna, besar, kotak} — `kotak` puts the words on a coloured box (white text)
function baris(L, y, base) {
  const s = cap(L.t);
  const size = fit(s, Math.round(base * (L.besar || 1)), L.kotak ? 880 : 980);
  if (L.kotak) {
    g.font = fontOf(size); const w = g.measureText(s).width + size * 0.6, h = size * 1.22;
    g.save(); g.translate(540, y); g.rotate(L.miring ?? -0.03);
    rr(-w / 2 + 10, -h / 2 + 14, w, h, h * 0.2); g.fillStyle = 'rgba(0,0,0,.5)'; g.fill();
    rr(-w / 2, -h / 2, w, h, h * 0.2); g.fillStyle = colOf(L.kotak); g.fill(); g.lineWidth = size * 0.07; g.strokeStyle = P.ol; g.stroke();
    outline(s, 0, size * 0.05, size, colOf(L.warna || 'putih')); g.restore();
  } else { g.save(); g.translate(540, y); g.rotate(L.miring || 0); outline(s, 0, 0, size, colOf(L.warna)); g.restore(); }
  return size;
}
function teks(lines, yc, base) {
  const sizes = lines.map(L => { const s = cap(L.t); return fit(s, Math.round(base * (L.besar || 1)), L.kotak ? 880 : 980) * (L.kotak ? 1.3 : 1.05); });
  const tot = sizes.reduce((a, b) => a + b, 0); let y = yc - tot / 2;
  lines.forEach((L, i) => { baris(L, y + sizes[i] / 2, base); y += sizes[i]; });
  return [yc - tot / 2, yc + tot / 2];
}
async function stiker(S) {
  const src = S.flag ? flag(S.flag) : emoSrc(S.e || 'seru'), size = S.s || 240;
  g.save(); g.translate(S.x, S.y); g.rotate(S.rot || 0); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowOffsetY = size * 0.06; g.shadowBlur = size * 0.1;
  if (P.stiker === 'putih') { img(src); await Promise.all(PENDING); const c = stickerCanvas(src, Math.round(size)); if (c) g.drawImage(c, -c.width / 2, -c.height / 2); }
  else { const im = await loadImg(src); if (im) g.drawImage(im, -size / 2, -size / 2, size, size); }
  g.restore();
}
function panah(A) {
  const [x0, y0] = A.dari, [x1, y1] = A.ke, col = colOf(A.warna || P.aksen), w = A.tebal || 34;
  const mx = (x0 + x1) / 2 + (y1 - y0) * (A.lengkung ?? 0.25), my = (y0 + y1) / 2 - (x1 - x0) * (A.lengkung ?? 0.25);
  const ang = Math.atan2(y1 - my, x1 - mx), hl = w * 2.6, ex = x1 - Math.cos(ang) * hl * 0.8, ey = y1 - Math.sin(ang) * hl * 0.8;
  const path = () => { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, ex, ey); };
  const head = () => { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - Math.cos(ang - 0.5) * hl, y1 - Math.sin(ang - 0.5) * hl); g.lineTo(x1 - Math.cos(ang + 0.5) * hl, y1 - Math.sin(ang + 0.5) * hl); g.closePath(); };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowOffsetY = 10; g.shadowBlur = 14;
  path(); g.lineWidth = w + 22; g.strokeStyle = P.ol; g.stroke(); head(); g.lineWidth = 22; g.stroke(); g.fillStyle = P.ol; g.fill();
  g.shadowColor = 'transparent'; path(); g.lineWidth = w; g.strokeStyle = col; g.stroke(); head(); g.fillStyle = col; g.fill();
  g.restore();
}
function lingkar(O) {
  const col = colOf(O.warna || P.aksen);
  g.save(); g.translate(O.x, O.y); g.rotate(O.rot || -0.12);
  g.beginPath(); g.ellipse(0, 0, O.r * (O.lebar || 1.15), O.r, 0, 0, 7); g.lineWidth = 36; g.strokeStyle = P.ol; g.stroke();
  g.lineWidth = 20; g.strokeStyle = col; g.stroke(); g.restore();
}
function label(s, y) {
  const size = 52; g.font = fontOf(size); const w = g.measureText(s).width + size * 1.1, h = size * 1.5;
  g.save(); g.translate(540, y);
  rr(-w / 2 + 6, -h / 2 + 8, w, h, h / 2); g.fillStyle = 'rgba(0,0,0,.45)'; g.fill();
  rr(-w / 2, -h / 2, w, h, h / 2); g.fillStyle = P.label_bg; g.fill(); g.lineWidth = 7; g.strokeStyle = P.ol; g.stroke();
  g.fillStyle = P.label_fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 0, size * 0.06); g.restore();
}

// v = one variant of the spec, preset = channel thumbnail look, frameUrl = data: URL of the episode frame (optional)
window.compose = async (v, preset, frameUrl) => {
  P = preset; g = MAIN; await document.fonts.ready;
  [`${P.berat} 40px "${P.font}"`].forEach(f => document.fonts.load(f)); await document.fonts.ready;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  const L = v.latar || {}, frame = frameUrl ? await loadImg(frameUrl) : null;
  drawLatar(L, frame);
  const lines = v.teks || [], base = v.ukuran || 170, yc = v.y ?? ({ atas: 560, tengah: 860, bawah: 1180 }[v.posisi || 'atas']);
  // measure the block first (for the dark band), then draw back to front
  const blockH = lines.reduce((a, l) => a + fit(cap(l.t), Math.round(base * (l.besar || 1)), l.kotak ? 880 : 980) * (l.kotak ? 1.3 : 1.05), 0);
  gelap(yc - blockH / 2, yc + blockH / 2, v.gelap ?? (frame ? 0.38 : 0));
  (v.lingkar || []).forEach(lingkar);
  for (const S of (v.stiker || []).filter(s => !s.depan)) await stiker(S);
  if (v.maskot && P.maskot) { await Promise.all(PENDING); NOW = 10.32; mascot(10, 20, v.maskot.expr || 'kaget', { side: v.maskot.side || 'R', size: v.maskot.size || 700, y: v.maskot.y ?? 1700, x: v.maskot.x }); }
  (v.panah || []).forEach(panah);
  teks(lines, yc, base);
  for (const S of (v.stiker || []).filter(s => s.depan)) await stiker(S);
  if (v.label) label(v.label, v.labelY || 200);
  return MAIN.canvas.toDataURL('image/png').split(',')[1];
};

// review sheet: every variant at full size next to its size in the Shorts feed (≈ 1/6)
window.sheet = async (urls, names) => {
  const ims = await Promise.all(urls.map(loadImg)), cw = 540, ch = 960, small = 180, pad = 30;
  const c = document.createElement('canvas'); c.width = ims.length * (cw + small + pad * 3); c.height = ch + 2 * pad + 60;
  const x = c.getContext('2d'); x.fillStyle = '#20232B'; x.fillRect(0, 0, c.width, c.height);
  x.font = '900 40px Montserrat'; x.fillStyle = '#fff'; x.textBaseline = 'top';
  ims.forEach((im, i) => {
    const ox = i * (cw + small + pad * 3) + pad;
    x.fillText(names[i], ox, pad - 6); x.drawImage(im, ox, pad + 50, cw, ch);
    x.drawImage(im, ox + cw + pad, pad + 50, small, small * 16 / 9);
    x.font = '900 22px Montserrat'; x.fillText('ukuran feed', ox + cw + pad, pad + 60 + small * 16 / 9); x.font = '900 40px Montserrat';
  });
  return c.toDataURL('image/png').split(',')[1];
};
window.prepare = async () => { await document.fonts.ready; return true; };
