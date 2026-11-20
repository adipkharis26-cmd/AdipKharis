// Sistem visual v2: pemeran baru (Dot, Brick), bayangan, shading, latar berlapis, efek. Semua orisinal.
import {C, L, eyes, brows, mouth} from './draw.js';
export const C2 = {...C, dot: '#B48CF2', brick: '#F79D5C', machine: '#E4572E', shadow: 'rgba(30,30,36,.18)'};
const sw = 5;
let uid = 0;
export const shadow = (x, y, w, op = 1) => `<ellipse cx="${x}" cy="${y + 2}" rx="${w / 2}" ry="${w / 9}" fill="${C2.shadow}" opacity="${op}"/>`;

// DOT: bola lilac kecil, pipi merah, kaki mungil. Ceria & cepat.
export function dot(x, y, s = 1, o: any = {}) {
  const {look = [0, 0], brow = 'up', m = 'smile', arms = 'down', blink = false, roll = 0, squash = 1, hold = ''} = o;
  const id = 'dclip' + (uid++);
  let g = `<ellipse cx="-10" cy="-3" rx="9" ry="5" fill="${C.ink}"/><ellipse cx="10" cy="-3" rx="9" ry="5" fill="${C.ink}"/>`;
  const ar: any = {down: L(-30, -34, -40, -20, 4) + L(30, -34, 40, -20, 4), up: L(-28, -44, -42, -66, 4) + L(28, -44, 42, -66, 4), reachR: L(-30, -34, -40, -20, 4) + L(30, -40, 58, -48, 4), wave: L(-30, -34, -40, -20, 4) + L(30, -44, 46, -68, 4)};
  g += ar[arms] || '';
  g += `<g transform="translate(0,-38) rotate(${roll}) scale(${1 / Math.sqrt(squash)},${squash}) translate(0,${38 - 38})">` +
    `<defs><clipPath id="${id}"><circle cx="0" cy="0" r="32"/></clipPath></defs>` +
    `<circle cx="0" cy="0" r="32" fill="${C2.dot}"/><g clip-path="url(#${id})"><circle cx="14" cy="14" r="34" fill="#000" opacity=".12"/></g>` +
    `<circle cx="0" cy="0" r="32" fill="none" stroke="${C.ink}" stroke-width="${sw}"/><ellipse cx="-14" cy="-16" rx="6" ry="9" fill="#fff" opacity=".45"/>` +
    eyes(0, -6, 12, 10, look, false, blink) + brows(0, -24, 12, 12, brow) + mouth(0, 12, m, 14) +
    `<ellipse cx="-22" cy="8" rx="6" ry="3.5" fill="#FF8FA3" opacity=".8"/><ellipse cx="22" cy="8" rx="6" ry="3.5" fill="#FF8FA3" opacity=".8"/></g>`;
  if (hold) g += `<g transform="translate(60,-50)">${hold}</g>`;
  return `<g transform="translate(${x},${y}) scale(${s})">${g}</g>`;
}

// BRICK: balok oranye besar, satu alis tebal (unibrow), lengan tebal. Kuat & pemarah.
export function brick(x, y, s = 1, o: any = {}) {
  const {look = [0, 0], brow = 'angry', m = 'flat', arms = 'down', blink = false, squash = 1, finger = false} = o;
  const id = 'bclip' + (uid++);
  const h = 150 * squash, w = 112, top = -20 - h;
  let g = `<rect x="-36" y="-24" width="22" height="24" rx="4" fill="${C.ink}"/><rect x="14" y="-24" width="22" height="24" rx="4" fill="${C.ink}"/>`;
  const ar: any = {
    down: L(-w / 2, top + h * 0.45, -w / 2 - 14, top + h * 0.8, 10) + L(w / 2, top + h * 0.45, w / 2 + 14, top + h * 0.8, 10),
    cross: L(-w / 2 + 6, top + h * 0.55, w / 2 - 20, top + h * 0.62, 10) + L(w / 2 - 6, top + h * 0.55, -w / 2 + 20, top + h * 0.66, 10),
    pokeL: L(w / 2, top + h * 0.45, w / 2 + 14, top + h * 0.8, 10) + L(-w / 2, top + h * 0.4, -w / 2 - 50, top + h * 0.36, 10) + L(-w / 2 - 50, top + h * 0.36, -w / 2 - 66, top + h * 0.35, 5),
    up: L(-w / 2, top + h * 0.4, -w / 2 - 24, top + h * 0.05, 10) + L(w / 2, top + h * 0.4, w / 2 + 24, top + h * 0.05, 10),
    rOnly: L(w / 2, top + h * 0.45, w / 2 + 14, top + h * 0.8, 10),
    // memegang gagang payung di (-w/2-14, top-6) (lokal); lengan kanan turun
    umbL: L(w / 2, top + h * 0.45, w / 2 + 14, top + h * 0.8, 10) + L(-w / 2, top + h * 0.42, -w / 2 - 14, top - 6, 10)};
  g += ar[arms] || ar.down;
  g += `<defs><clipPath id="${id}"><rect x="${-w / 2}" y="${top}" width="${w}" height="${h}" rx="20"/></clipPath></defs>` +
    `<rect x="${-w / 2}" y="${top}" width="${w}" height="${h}" rx="20" fill="${C2.brick}"/>` +
    `<g clip-path="url(#${id})"><rect x="${w / 2 - 34}" y="${top}" width="40" height="${h}" fill="#000" opacity=".12"/>` +
    [0, 1, 2].map(i => L(-w / 2, top + 40 + i * 38, w / 2, top + 40 + i * 38, 2, 'rgba(0,0,0,.12)')).join('') + `</g>` +
    `<rect x="${-w / 2}" y="${top}" width="${w}" height="${h}" rx="20" fill="none" stroke="${C.ink}" stroke-width="${sw}"/>`;
  const ey = top + 42;
  g += eyes(0, ey, 20, 9, look, false, blink);
  const tilt = {angry: 8, sad: -8, flat: 0, up: 0}[brow] ?? 0;
  g += `<path d="M-34,${ey - 18 + (brow === 'up' ? -6 : 0)} Q0,${ey - 18 + tilt * 1.4 + (brow === 'up' ? -10 : 0)} 34,${ey - 18 + (brow === 'up' ? -6 : 0)}" fill="none" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>`;
  g += mouth(0, ey + 30, m, 30);
  return `<g transform="translate(${x},${y}) scale(${s})">${g}</g>`;
}

// LATAR: gradasi + vignette layar (dipanggil sekali per frame)
export const defs = `<defs><radialGradient id="vig" cx="50%" cy="45%" r="75%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".22"/></radialGradient>
<linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF1DA"/><stop offset="1" stop-color="#F7D9B0"/></linearGradient>
<linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9C4A0"/><stop offset="1" stop-color="#C2A97F"/></linearGradient>
<linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DFF4FB"/><stop offset="1" stop-color="#A9D8EA"/></linearGradient></defs>`;
export const vignette = `<rect width="270" height="480" fill="url(#vig)"/>`;
export function hall(fx = 0) {
  let s = `<rect x="-600" y="-500" width="1600" height="900" fill="url(#wallG)"/>`;
  for (let i = -6; i < 8; i++) s += `<rect x="${i * 90}" y="120" width="6" height="280" fill="#000" opacity=".04"/>`;
  s += `<rect x="-600" y="390" width="1600" height="10" fill="#E8C99B"/><rect x="-600" y="400" width="1600" height="400" fill="url(#floorG)"/>` + L(-600, 400, 1000, 400, 4);
  for (let i = -8; i < 10; i++) s += L(135 + i * 70, 400, 135 + i * 140, 800, 2, 'rgba(0,0,0,.08)');
  return s;
}
export const trail = (x, y, dir = 1, n = 3, c = '#fff') => Array.from({length: n}, (_, i) => `<rect x="${x - dir * (14 + i * 16)}" y="${y + i * 10 - 10}" width="${12 - i * 3}" height="4" rx="2" fill="${c}" opacity="${0.8 - i * 0.2}"/>`).join('');
export const impactLines = (x, y, r = 40) => Array.from({length: 8}, (_, i) => { const a = i * Math.PI / 4 + 0.3; return L(x + Math.cos(a) * r, y + Math.sin(a) * r, x + Math.cos(a) * (r + 18), y + Math.sin(a) * (r + 18), 4); }).join('');
// kedip natural: tiap ~2,7 dtk selama 3 frame (offset per karakter)
export const blinkAt = (f, off = 0) => ((f + off) % 80) < 3;

// MESIN MINUMAN
const canColors = ['#E63946', '#2A9D8F', '#F4A261', '#457B9D', '#8AC926', '#FF8FC7'];
export const can = (x, y, s = 1, rot = 0, c = '#2A9D8F') => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-9" y="-15" width="18" height="30" rx="4" fill="${c}" stroke="${C.ink}" stroke-width="3"/><rect x="-9" y="-6" width="18" height="8" fill="#fff" opacity=".7"/><rect x="-6" y="-17" width="12" height="3" rx="1" fill="#bbb" stroke="${C.ink}" stroke-width="1.5"/></g>`;
export function machine(x, y, o: any = {}) {
  const {stuck = null, stuck2 = null, empty = false, shakeRot = 0, light = 1} = o;
  let s = `<g transform="rotate(${shakeRot},${x},${y})">` + shadow(x, y, 170) +
    `<rect x="${x - 72}" y="${y - 300}" width="144" height="300" rx="10" fill="${C2.machine}" stroke="${C.ink}" stroke-width="${sw}"/>` +
    `<rect x="${x + 40}" y="${y - 300}" width="32" height="300" rx="8" fill="#000" opacity=".12"/>` +
    `<rect x="${x - 60}" y="${y - 286}" width="92" height="190" rx="6" fill="url(#glassG)" stroke="${C.ink}" stroke-width="4"/>`;
  for (let r = 0; r < 3; r++) {
    const ry = y - 250 + r * 58;
    s += L(x - 58, ry + 18, x + 30, ry + 18, 3);
    for (let c = 0; c < 3; c++) {
      const cx = x - 42 + c * 30;
      const hidden = (stuck && r === 1 && c === 2) || (stuck2 && r === 1 && c === 1) || (o.hideSlot && r === 1 && c === 2);
      if (!empty && !hidden) s += can(cx, ry, 0.9, 0, canColors[(r * 3 + c) % canColors.length]);
      s += `<path d="M${cx - 10},${ry + 14} q5,-8 10,0 t10,0" fill="none" stroke="#666" stroke-width="2"/>`;
    }
  }
  if (stuck) s += can(stuck.x, stuck.y, 0.9, stuck.rot, '#E63946');
  if (stuck2) s += can(stuck2.x, stuck2.y, 0.9, stuck2.rot, '#2A9D8F');
  s += L(x - 60, y - 82, x + 32, y - 82, 3) + `<rect x="${x - 56}" y="${y - 70}" width="84" height="40" rx="6" fill="#2b2b33" stroke="${C.ink}" stroke-width="4"/>` +
    `<rect x="${x + 40}" y="${y - 270}" width="22" height="36" rx="4" fill="#2b2b33"/><rect x="${x + 48}" y="${y - 262}" width="6" height="18" rx="2" fill="#888"/>` +
    [0, 1, 2].map(i => `<circle cx="${x + 51}" cy="${y - 210 + i * 18}" r="6" fill="${i === 1 ? '#FFD23F' : '#ddd'}" stroke="${C.ink}" stroke-width="2.5" opacity="${light}"/>`).join('') +
    `<rect x="${x - 60}" y="${y - 286}" width="20" height="190" fill="#fff" opacity=".18"/></g>`;
  return s;
}

// ===== EP05 Umbrella War: payung, hujan, latar jalan basah =====
// PAYUNG: (x,y) = titik gagang; tiang ke atas sepanjang st, kanopi radius R. inv = terbalik (mangkuk), water 0..1 isi air.
export function umbrella(x, y, s = 1, o: any = {}) {
  const {c = '#FFD23F', tilt = 0, inv = false, open = 1, water = 0, hole = false, dart = '', st = 90, R = 72, stripes = false} = o;
  const r = R * open, top = -st, hgt = R * 0.62;
  let g = `<path d="M0,0 q0,12 -9,12 q-9,0 -9,-7" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>` + L(0, 0, 0, top - (inv ? 0 : hgt + 6), 4);
  const n = 6, pts = Array.from({length: n + 1}, (_, i) => -r + (2 * r * i) / n);
  if (!inv) {
    let d = `M${-r},${top} C${-r},${top - hgt * 1.3} ${r},${top - hgt * 1.3} ${r},${top}`;
    for (let i = n; i > 0; i--) d += ` Q${(pts[i] + pts[i - 1]) / 2},${top - hgt * 0.22} ${pts[i - 1]},${top}`;
    g += `<path d="${d}Z" fill="${c}" stroke="${C.ink}" stroke-width="4.5" stroke-linejoin="round"/>`;
    if (stripes) g += [1, 3, 5].map(i => `<path d="M0,${top - hgt} L${pts[i]},${top} L${pts[i + 1]},${top}Z" fill="#fff" opacity=".55"/>`).join('');
    g += `<path d="M0,${top - hgt} C${r * 0.5},${top - hgt} ${r},${top - hgt * 0.6} ${r},${top} Q${(pts[n] + pts[n - 1]) / 2},${top - hgt * 0.22} ${pts[n - 1]},${top}Z" fill="#000" opacity=".13"/>`;
    g += pts.slice(1, n).map(px => L(0, top - hgt, px, top, 2, 'rgba(0,0,0,.35)')).join('');
    g += `<path d="M${-r * 0.7},${top - hgt * 0.55} Q${-r * 0.45},${top - hgt * 0.95} ${-r * 0.1},${top - hgt * 1.0}" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/>`;
    g += `<circle cx="0" cy="${top - hgt - 3}" r="3.5" fill="${C.ink}"/>`;
    if (hole) g += `<ellipse cx="${r * 0.42}" cy="${top - hgt * 0.62}" rx="4" ry="3" fill="${C.ink}"/>`;
    if (dart) g += `<g transform="translate(${r * 0.42},${top - hgt * 0.62}) rotate(160)">${dart}</g>`;
  } else {
    // terbalik: tepi kanopi mencuat ke atas seperti mangkuk
    const ey = top - hgt * 1.1;
    let d = `M${-r * 1.08},${ey} Q${-r * 0.5},${top + 6} 0,${top} Q${r * 0.5},${top + 6} ${r * 1.08},${ey}`;
    const tp = Array.from({length: n + 1}, (_, i) => -r * 1.08 + (2.16 * r * i) / n);
    for (let i = n; i > 0; i--) d += ` Q${(tp[i] + tp[i - 1]) / 2},${ey + hgt * 0.25} ${tp[i - 1]},${ey}`;
    g += `<path d="${d}Z" fill="${c}" stroke="${C.ink}" stroke-width="4.5" stroke-linejoin="round"/>`;
    g += tp.slice(1, n).map(px => L(0, top, px, ey + 4, 2, 'rgba(0,0,0,.35)')).join('');
    if (water > 0) { const wy = ey + hgt * 0.95 * (1 - water) + 6, ww = r * (0.35 + 0.65 * water);
      g += `<ellipse cx="0" cy="${wy}" rx="${ww}" ry="${4 + 5 * water}" fill="#7FC8F8" stroke="${C.ink}" stroke-width="2.5"/><ellipse cx="${-ww * 0.3}" cy="${wy - 1}" rx="${ww * 0.25}" ry="1.6" fill="#fff" opacity=".8"/>`; }
  }
  return `<g transform="translate(${x},${y}) rotate(${tilt}) scale(${s})">${g}</g>`;
}
// titik lokal payung -> dunia (untuk lubang, pusat kanopi, dsb.)
export function umbPt(x, y, s, tilt, lx, ly) {
  const a = tilt * Math.PI / 180;
  return [x + s * (lx * Math.cos(a) - ly * Math.sin(a)), y + s * (lx * Math.sin(a) + ly * Math.cos(a))];
}
// HUJAN di ruang LAYAR (270x480); dry = daftar [x0,y0,x1] area kering (di bawah kanopi). Periode 420 frame -> loop mulus.
export function rain(f, dry: number[][] = [], n = 80) {
  const id = 'rc' + (uid++);
  let clip = 'M-60,-60H340V560H-60Z';
  for (const [x0, y0, x1] of dry) clip += ` M${x0},${y0}H${x1}V560H${x0}Z`;
  let g = '';
  for (let i = 0; i < n; i++) {
    const y = ((i * 97 + f * 24) % 560) - 60, x = ((i * 53) % 340) - 50 + y * 0.18, l = 12 + (i % 3) * 5;
    g += `<line x1="${x}" y1="${y}" x2="${x - l * 0.18}" y2="${y - l}" stroke="#E8F4FF" stroke-width="${i % 4 ? 1.6 : 2.4}" stroke-linecap="round" opacity="${i % 2 ? 0.75 : 0.5}"/>`;
  }
  return `<defs><clipPath id="${id}"><path clip-rule="evenodd" fill-rule="evenodd" d="${clip}"/></clipPath></defs><g clip-path="url(#${id})">${g}</g>`;
}
export const rainDefs = `<defs><linearGradient id="skyR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FA3B8"/><stop offset="1" stop-color="#C9D6E0"/></linearGradient>
<linearGradient id="paveG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8E9AA6"/><stop offset="1" stop-color="#6E7A86"/></linearGradient></defs>`;
// JALAN HUJAN: langit kelabu, gedung, tiang lampu, trotoar basah + genangan beriak (periode 20 frame)
export function street(f) {
  let s = `<rect x="-600" y="-500" width="1600" height="900" fill="url(#skyR)"/>`;
  const bl = [[-120, 150, '#7D8FA3'], [-20, 110, '#93A4B6'], [70, 170, '#7D8FA3'], [150, 130, '#A3B2C2'], [240, 160, '#8597AA'], [330, 120, '#93A4B6']];
  for (const [bx, bh, bc] of bl as any) {
    s += `<rect x="${bx}" y="${360 - bh}" width="96" height="${bh + 40}" fill="${bc}"/>`;
    for (let r = 0; r < Math.floor(bh / 34); r++) for (let c = 0; c < 3; c++) s += `<rect x="${bx + 14 + c * 26}" y="${360 - bh + 16 + r * 34}" width="14" height="18" rx="2" fill="#FFE8A3" opacity="${(r + c + bx) % 3 ? 0.35 : 0.75}"/>`;
  }
  s += `<rect x="-600" y="352" width="1600" height="48" fill="#A9B5C1"/>` + L(-600, 352, 1000, 352, 3, 'rgba(0,0,0,.25)');
  s += `<g>${L(14, 400, 14, 150, 7)}<path d="M14,150 q0,-22 26,-22" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/><path d="M28,126 h28 l-6,14 h-16z" fill="#4A4A55" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/><ellipse cx="42" cy="142" rx="8" ry="4" fill="#FFE8A3"/></g>`;
  s += `<rect x="-600" y="400" width="1600" height="400" fill="url(#paveG)"/>` + L(-600, 400, 1000, 400, 4);
  for (let i = -8; i < 10; i++) s += L(135 + i * 70, 400, 135 + i * 140, 800, 2, 'rgba(0,0,0,.12)');
  s += L(-600, 440, 1000, 440, 2, 'rgba(0,0,0,.12)');
  for (const [px, py, pw] of [[62, 418, 70], [236, 430, 60], [-40, 424, 50]]) {
    s += `<ellipse cx="${px}" cy="${py}" rx="${pw / 2}" ry="${pw / 9}" fill="#B9D3E6" stroke="rgba(0,0,0,.25)" stroke-width="2"/>`;
    for (let k = 0; k < 2; k++) { const ph = ((f + k * 10 + px) % 20) / 20; s += `<ellipse cx="${px + (k ? 10 : -12)}" cy="${py}" rx="${4 + ph * 12}" ry="${1 + ph * 2.5}" fill="none" stroke="#fff" stroke-width="1.5" opacity="${1 - ph}"/>`; }
  }
  return s;
}
// percikan air (lingkaran tetes menyebar)
export const splash = (x, y, p, n = 9, r = 40, c = '#7FC8F8') => Array.from({length: n}, (_, i) => {
  const a = Math.PI + (i / (n - 1)) * Math.PI, d = r * p;
  return `<path transform="translate(${x + Math.cos(a) * d},${y + Math.sin(a) * d * 1.2 + p * p * 30}) rotate(${a * 57.3 + 90}) scale(${0.9 - p * 0.4})" d="M0,-10 Q7,2 0,7 Q-7,2 0,-10Z" fill="${c}" stroke="${C.ink}" stroke-width="2.2" opacity="${1 - p * 0.6}"/>`;
}).join('');

// ===== EP06 Selfie Fail: kamera tripod dengan timer LED, foto instan, latar taman =====
// (x,y): tripod -> kaki di lantai; tanpa tripod -> pusat badan. dir 1 = lensa menghadap kanan. leds = jumlah LED timer menyala (0..3)
export function camera(x, y, o: any = {}) {
  const {dir = 1, leds = 0, tripod = true, rot = 0, flash = 0} = o;
  const cy = tripod ? y - 128 : y;
  let s = '';
  if (tripod) s += L(x, cy + 14, x - 26, y, 4) + L(x, cy + 14, x + 26, y, 4) + L(x, cy + 14, x + 3, y, 4) + `<rect x="${x - 7}" y="${cy + 12}" width="14" height="8" rx="2" fill="#4A4A55" stroke="${C.ink}" stroke-width="3"/>`;
  let b = `<rect x="-24" y="-16" width="48" height="32" rx="6" fill="#3A3A46" stroke="${C.ink}" stroke-width="4"/>` +
    `<rect x="-16" y="-23" width="18" height="9" rx="2" fill="#3A3A46" stroke="${C.ink}" stroke-width="3.5"/>` +
    `<rect x="-20" y="-12" width="12" height="7" rx="2" fill="#FFF6C8" stroke="${C.ink}" stroke-width="2" opacity="${0.6 + 0.4 * flash}"/>` +
    `<rect x="-24" y="4" width="48" height="6" fill="#000" opacity=".2"/>` +
    `<circle cx="24" cy="0" r="12" fill="#2b2b33" stroke="${C.ink}" stroke-width="4"/><circle cx="24" cy="0" r="7" fill="#7FC8F8" stroke="${C.ink}" stroke-width="2.5"/><circle cx="21.5" cy="-2.5" r="2.2" fill="#fff"/>` +
    [0, 1, 2].map(i => `<circle cx="${6 + i * 7}" cy="-20" r="3" fill="${i < leds ? '#FF3B3B' : '#6B4A50'}" stroke="${C.ink}" stroke-width="1.5"/>`).join('');
  if (flash > 0) b += `<circle cx="-14" cy="-8" r="${10 + flash * 26}" fill="#FFF8D6" opacity="${flash * 0.9}"/>`;
  s += `<g transform="translate(${x},${cy}) rotate(${rot}) scale(${dir},1)">${b}</g>`;
  return s;
}
// FOTO INSTAN: bingkai putih + isi (svg mini, koordinat pusat 0,0 dalam jendela 22x22)
export function photo(x, y, s = 1, rot = 0, inner = '') {
  const id = 'ph' + (uid++);
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-15" y="-15" width="30" height="36" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="2.5"/>` +
    `<defs><clipPath id="${id}"><rect x="-11" y="-11" width="22" height="22"/></clipPath></defs><rect x="-11" y="-11" width="22" height="22" fill="#CFEFFF"/>` +
    `<g clip-path="url(#${id})"><rect x="-11" y="5" width="22" height="6" fill="#8CCB6B"/>${inner}</g><rect x="-11" y="-11" width="22" height="22" fill="none" stroke="${C.ink}" stroke-width="1.5"/></g>`;
}
export const parkDefs = `<defs><linearGradient id="skyP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ED8FF"/><stop offset="1" stop-color="#E6F6FF"/></linearGradient>
<linearGradient id="grassG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8CCB6B"/><stop offset="1" stop-color="#5E9E47"/></linearGradient></defs>`;
// TAMAN: langit, matahari, awan bergerak (periode 420), bukit, pohon, semak, rumput
export function park(f) {
  let s = `<rect x="-600" y="-500" width="1600" height="900" fill="url(#skyP)"/><circle cx="215" cy="70" r="26" fill="#FFE27A" stroke="${C.ink}" stroke-width="4"/>`;
  for (const [cx0, cy, k] of [[20, 90, 1], [260, 140, 0.8], [140, 40, 0.7]]) {
    const cx = ((cx0 + f * (30 / 420) * 14) % 420) - 80;  // tepat 1 putaran per loop
    s += `<g transform="translate(${cx},${cy}) scale(${k})"><path d="M-30,10 q-4,-18 14,-20 q6,-18 26,-12 q16,-10 26,6 q16,0 14,26z" fill="#fff" stroke="${C.ink}" stroke-width="3.5" stroke-linejoin="round"/></g>`;
  }
  s += `<path d="M-600,360 Q-200,300 60,345 T420,330 T1000,350 V420 H-600Z" fill="#B5E0A0"/>`;
  for (const [tx, th, tr] of [[-30, 170, 44], [250, 150, 40], [320, 180, 48]]) s += `<rect x="${tx - 7}" y="${400 - th}" width="14" height="${th}" fill="#A0703F" stroke="${C.ink}" stroke-width="4"/><circle cx="${tx}" cy="${400 - th}" r="${tr}" fill="#5FAF4E" stroke="${C.ink}" stroke-width="4"/><circle cx="${tx - tr * 0.35}" cy="${400 - th - tr * 0.35}" r="${tr * 0.35}" fill="#fff" opacity=".18"/>`;
  s += `<path d="M196,400 q0,-26 24,-24 q10,-20 30,-6 q22,-6 22,30z" fill="#4E9A40" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>`;
  s += `<rect x="-600" y="400" width="1600" height="400" fill="url(#grassG)"/>` + L(-600, 400, 1000, 400, 4);
  for (let i = -10; i < 14; i++) s += `<path d="M${i * 37 + 8},${430 + (i % 3) * 22} l3,-8 l3,8" fill="none" stroke="#3F7A30" stroke-width="2.5" stroke-linecap="round"/>`;
  return s;
}

// ===== EP07 Elevator Button: potongan samping gedung, lift naik melewati lantai, pintu sisi kiri =====
export const liftDefs = `<defs><linearGradient id="liftW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F1E8D4"/><stop offset="1" stop-color="#D6C9AD"/></linearGradient>
<linearGradient id="shaftG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3B3B46"/><stop offset=".5" stop-color="#4C4C58"/><stop offset="1" stop-color="#34343E"/></linearGradient>
<linearGradient id="doorG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B8C0C8"/><stop offset=".5" stop-color="#E2E7EC"/><stop offset="1" stop-color="#A9B2BB"/></linearGradient></defs>`;
export const LIFT = {x0: 70, x1: 232, top: 206, H: 270};
const FLOORS = [{c: '#FFE7A3', prop: 'bench'}, {c: '#C8F0D0', prop: 'plant'}, {c: '#CFE3FF', prop: 'mop'}, {c: '#E6D7FF', prop: ''}, {c: '#FFD6E5', prop: 'toilet'}];
export const wcIcon = (x, y) => `<g transform="translate(${x},${y})"><rect x="-9" y="-9" width="18" height="18" rx="3" fill="#fff" stroke="${C.ink}" stroke-width="2"/><path d="M-5,-5 h6 v4 h3 q0,6 -5,6 l1,3 h-5 l1,-3 q-3,-1 -3,-4z" fill="${C.ink}"/></g>`;
// GEDUNG: pos = posisi lift dalam satuan lantai (pecahan saat bergerak). Pola 5 lantai berulang -> loop mulus.
export function building(pos, toilet: any = {open: false, busy: false}) {
  const {x0, x1, H} = LIFT;
  let s = `<rect x="${x0 - 4}" y="-400" width="${x1 - x0 + 8}" height="1300" fill="url(#shaftG)"/>` + L(x0 + 30, -400, x0 + 30, 900, 2, 'rgba(255,255,255,.15)') + L(x1 - 30, -400, x1 - 30, 900, 2, 'rgba(255,255,255,.15)');
  const base = Math.floor(pos);
  for (let n = base - 2; n <= base + 2; n++) {
    const fl = FLOORS[((n % 5) + 5) % 5], y = 400 + (pos - n) * H;
    // lorong kiri
    s += `<rect x="-300" y="${y - H + 14}" width="${300 + x0 - 4}" height="${H - 14}" fill="${fl.c}"/><rect x="-300" y="${y - 34}" width="${300 + x0 - 4}" height="34" fill="#000" opacity=".1"/>`;
    s += `<rect x="-300" y="${y - H + 14}" width="${300 + x0 - 4}" height="${H - 14}" fill="url(#vig)" opacity=".4"/>`;
    if (fl.prop === 'plant') s += `<path d="M26,${y - 34} h18 l-3,20 h-12z" transform="translate(0,${14})" fill="#C8693F" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/><path d="M35,${y - 20} q-16,-20 -6,-34 q4,14 6,20 q2,-22 12,-30 q4,18 -6,34 q14,-14 22,-12 q-8,14 -22,22z" fill="#5FAF4E" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>`;
    if (fl.prop === 'mop') s += `<path d="M18,${y} l4,-26 h26 l4,26z" fill="#F4C430" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>${L(38, y - 26, 26, y - 90, 4)}<path d="M22,${y - 90} q-6,-6 -2,-12 M26,${y - 92} q-2,-8 4,-12 M30,${y - 90} q4,-8 10,-8" fill="none" stroke="#bbb" stroke-width="4" stroke-linecap="round"/>`;
    if (fl.prop === 'bench') s += `<rect x="10" y="${y - 40}" width="56" height="8" rx="3" fill="#8FB46A" stroke="${C.ink}" stroke-width="3"/>${L(16, y - 32, 16, y, 3)}${L(60, y - 32, 60, y, 3)}`;
    if (fl.prop === 'toilet') {
      const op = n === 4 || ((n % 5) + 5) % 5 === 4 ? toilet : {open: false, busy: false};
      s += `<rect x="14" y="${y - 120}" width="40" height="120" fill="${op.open ? '#2b2b33' : '#fff'}" stroke="${C.ink}" stroke-width="3"/>`;
      if (!op.open) s += `<rect x="18" y="${y - 116}" width="32" height="112" fill="#F3F6F8"/><circle cx="46" cy="${y - 58}" r="2.6" fill="${C.ink}"/>`;
      s += wcIcon(34, y - 138) + `<circle cx="58" cy="${y - 150}" r="4" fill="${op.busy ? '#FF3B3B' : '#3BE37A'}" stroke="${C.ink}" stroke-width="1.5"/>`;
    }
    // lantai beton + plafon
    s += `<rect x="-300" y="${y}" width="${300 + x0 - 4}" height="14" fill="#9C8F80" stroke="${C.ink}" stroke-width="3"/><rect x="${x1 + 4}" y="${y}" width="300" height="14" fill="#9C8F80" stroke="${C.ink}" stroke-width="3"/>`;
    s += `<rect x="${x1 + 4}" y="${y - H + 14}" width="300" height="${H - 14}" fill="${fl.c}" opacity=".85"/><rect x="${x1 + 4}" y="${y - H + 14}" width="300" height="${H - 14}" fill="#000" opacity=".08"/>`;
  }
  return s;
}
// KABIN LIFT (koordinat kabin tetap: lantai kabin y=400). open 0..1 pintu kiri (geser ke atas), lit = 10 tombol, inner = isi kabin
export function liftCar(o: any = {}, inner = '') {
  const {open = 0, lit = []} = o;
  const {x0, x1, top} = LIFT;
  let s = L((x0 + x1) / 2, -400, (x0 + x1) / 2, top - 12, 3, '#222');
  s += `<rect x="${x0}" y="${top - 12}" width="${x1 - x0}" height="12" fill="#5A5A66" stroke="${C.ink}" stroke-width="3.5"/>`;
  s += `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${400 - top}" fill="url(#liftW)"/>`;
  for (let i = 1; i < 6; i++) s += `<rect x="${x0 + i * 23}" y="${top}" width="2" height="${400 - top}" fill="#000" opacity=".05"/>`;
  s += `<rect x="${x0 + 30}" y="${top + 4}" width="${x1 - x0 - 60}" height="6" rx="3" fill="#FFF6D6" stroke="${C.ink}" stroke-width="2"/>`;
  s += `<rect x="${x0 + 44}" y="318" width="${x1 - x0 - 44}" height="5" rx="2.5" fill="#B08A5A" stroke="${C.ink}" stroke-width="2"/>`;
  // panel tombol di dinding belakang dekat pintu
  s += `<rect x="${x0 + 10}" y="220" width="28" height="92" rx="4" fill="#C9CFD5" stroke="${C.ink}" stroke-width="3"/>`;
  for (let i = 0; i < 10; i++) { const [bx, by] = liftBtn(i); s += (lit[i] ? `<circle cx="${bx}" cy="${by}" r="6.5" fill="#FFD23F" opacity=".4"/>` : '') + `<circle cx="${bx}" cy="${by}" r="4" fill="${lit[i] ? '#FFD23F' : '#F3F3F3'}" stroke="${C.ink}" stroke-width="1.8"/>`; }
  const [cbx, cby] = liftBtn(10);
  s += `<circle cx="${cbx}" cy="${cby}" r="5" fill="#F3F3F3" stroke="${C.ink}" stroke-width="1.8"/><path d="M${cbx - 3.5},${cby - 3} l2.6,3 l-2.6,3 M${cbx + 3.5},${cby - 3} l-2.6,3 l2.6,3" fill="none" stroke="${C.ink}" stroke-width="1.5"/>`;
  s += inner;
  // lantai kabin, dinding kanan, pintu kiri (geser ke atas)
  s += `<rect x="${x0}" y="400" width="${x1 - x0}" height="14" fill="#7C6C5E" stroke="${C.ink}" stroke-width="3.5"/>`;
  s += `<rect x="${x1 - 6}" y="${top}" width="8" height="${400 - top}" fill="#B9AE98" stroke="${C.ink}" stroke-width="3"/>`;
  const dh = (400 - top) * (1 - open);
  s += `<rect x="${x0 - 4}" y="${top}" width="9" height="${dh}" fill="url(#doorG)" stroke="${C.ink}" stroke-width="3"/>`;
  s += `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${400 - top}" fill="none" stroke="${C.ink}" stroke-width="4"/>`;
  return s;
}
// posisi tombol: 0..9 (2 kolom x 5 baris, dari bawah), 10 = tutup pintu
export const liftBtn = (i) => i === 10 ? [LIFT.x0 + 24, 301] : [LIFT.x0 + 18 + (i % 2) * 12, 287 - Math.floor(i / 2) * 14];

// ===== EP08 Alarm Clock: jam weker, kamar tidur (tampak depan), ranjang =====
// JAM WEKER: (x,y) = pusat badan. ring 0..1 = getaran + garis bunyi; f = frame (untuk getar)
export function alarmClock(x, y, s = 1, o: any = {}) {
  const {ring = 0, f = 0, rot = 0, sq = 1, hand = 0} = o;
  const jit = ring ? Math.sin(f * 2.7) * 9 * ring : 0;
  let g = L(-10, 14, -15, 22, 4) + L(10, 14, 15, 22, 4);
  for (const bx of [-11, 11]) g += `<path d="M${bx - 9},-14 A9,9 0 0 1 ${bx + 9},-14 Z" transform="rotate(${bx < 0 ? -18 : 18},${bx},-14) translate(0,${ring ? Math.sin(f * 3.1 + bx) * 1.5 : 0})" fill="#FFD23F" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>`;
  g += L(0, -18, 0, -24, 3) + `<rect x="-6" y="-27" width="12" height="5" rx="2" fill="#bbb" stroke="${C.ink}" stroke-width="2"/>`;
  g += `<circle cx="0" cy="0" r="17" fill="#E63946" stroke="${C.ink}" stroke-width="4"/><circle cx="0" cy="0" r="12" fill="#fff" stroke="${C.ink}" stroke-width="2"/>`;
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g += `<circle cx="${Math.cos(a) * 9.5}" cy="${Math.sin(a) * 9.5}" r="${i % 3 ? 0.7 : 1.2}" fill="${C.ink}"/>`; }
  g += L(0, 0, Math.cos(hand - Math.PI / 2) * 5, Math.sin(hand - Math.PI / 2) * 5, 2.5) + L(0, 0, Math.cos(hand * 12 - Math.PI / 2) * 8, Math.sin(hand * 12 - Math.PI / 2) * 8, 1.8) + `<circle cx="0" cy="0" r="1.8" fill="${C.ink}"/>`;
  g += `<path d="M-12,-8 A13,13 0 0 1 -4,-13" fill="none" stroke="#fff" stroke-width="2.5" opacity=".7"/>`;
  let out = `<g transform="translate(${x},${y}) rotate(${rot + jit}) scale(${s / Math.sqrt(sq)},${s * sq})">${g}</g>`;
  if (ring) for (const side of [-1, 1]) for (let k = 0; k < 2; k++) {
    const r = (18 + k * 8 + ((f * 2) % 8)) * s;
    out += `<path d="M${x + side * r * 0.75},${y - r * 0.85} q${side * r * 0.35},${r * 0.55} 0,${r * 1.1}" fill="none" stroke="${C.ink}" stroke-width="${2.5 * s}" stroke-linecap="round" opacity="${ring * (1 - k * 0.4)}"/>`;
  }
  return out;
}
export const bedDefs = `<defs><linearGradient id="roomW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9D7F2"/><stop offset="1" stop-color="#A9BBE0"/></linearGradient>
<linearGradient id="woodF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B98A5C"/><stop offset="1" stop-color="#946A43"/></linearGradient>
<linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB37A"/><stop offset="1" stop-color="#FFE3A1"/></linearGradient>
<linearGradient id="blanketG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FB3E6"/><stop offset="1" stop-color="#5E8FC8"/></linearGradient></defs>`;
// KAMAR: dinding bergaris, jendela (subuh), lampu gantung, lantai kayu; meja kecil di kiri
export function bedroom(f) {
  let s = `<rect x="-400" y="-400" width="1100" height="800" fill="url(#roomW)"/>`;
  for (let i = -6; i < 12; i++) s += `<rect x="${i * 30}" y="-400" width="12" height="800" fill="#fff" opacity=".12"/>`;
  s += `<rect x="150" y="160" width="62" height="72" fill="url(#dawn)" stroke="${C.ink}" stroke-width="4"/><circle cx="192" cy="222" r="12" fill="#FFD23F"/>` + L(181, 160, 181, 232, 3) + L(150, 196, 212, 196, 3);
  s += `<path d="M144,154 q10,40 0,88 l-10,0 q8,-44 0,-88z" fill="#E86A6A" stroke="${C.ink}" stroke-width="3"/><path d="M218,154 q-10,40 0,88 l10,0 q-8,-44 0,-88z" fill="#E86A6A" stroke="${C.ink}" stroke-width="3"/>` + L(136, 154, 226, 154, 4);
  s += L(80, -400, 80, 138, 2) + `<path d="M64,152 q16,-24 32,0z" fill="#FFE27A" stroke="${C.ink}" stroke-width="3"/>`;
  s += `<rect x="-400" y="400" width="1100" height="400" fill="url(#woodF)"/>` + L(-400, 400, 700, 400, 4);
  for (let i = -6; i < 12; i++) s += L(i * 44, 400, i * 70 - 60, 800, 2, 'rgba(0,0,0,.12)');
  s += `<rect x="6" y="334" width="46" height="66" rx="3" fill="#C98B3B" stroke="${C.ink}" stroke-width="4"/><rect x="12" y="350" width="34" height="18" rx="2" fill="#B37A30" stroke="${C.ink}" stroke-width="2.5"/><circle cx="29" cy="359" r="2" fill="${C.ink}"/>`;
  return s;
}
// RANJANG: belakang (sandaran + bantal) dan depan (selimut) terpisah agar karakter bisa "di dalam"
export const bedBack = (pillowY = 0) => `<rect x="62" y="232" width="150" height="120" rx="14" fill="#8C5A3C" stroke="${C.ink}" stroke-width="4"/><rect x="72" y="244" width="130" height="10" rx="5" fill="#000" opacity=".15"/>` +
  `<rect x="96" y="${286 + pillowY}" width="82" height="40" rx="18" fill="#fff" stroke="${C.ink}" stroke-width="3.5"/><path d="M104,${300 + pillowY} q33,-8 66,0" fill="none" stroke="#ddd" stroke-width="3"/>`;
export const bedFront = (bump = 0) => `<path d="M58,${336 - bump} Q137,${326 - bump * 1.6} 216,${336 - bump} L220,392 L54,392Z" fill="url(#blanketG)" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>` +
  `<path d="M70,${348 - bump} q66,-8 136,0" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>` + [80, 120, 160, 196].map(x => `<circle cx="${x}" cy="${370 - bump * 0.3}" r="4" fill="#fff" opacity=".35"/>`).join('') +
  `<rect x="54" y="388" width="10" height="14" fill="#8C5A3C" stroke="${C.ink}" stroke-width="3"/><rect x="210" y="388" width="10" height="14" fill="#8C5A3C" stroke="${C.ink}" stroke-width="3"/>`;
// gelembung dengkur (tanpa teks)
export const snore = (x, y, f) => { const p = (f % 36) / 36, r = 3 + Math.sin(p * Math.PI) * 9; return `<circle cx="${x + r * 0.6}" cy="${y - r * 0.3}" r="${r}" fill="#E8F6FF" stroke="${C.ink}" stroke-width="2" opacity=".9"/><circle cx="${x + r * 0.3}" cy="${y - r * 0.7}" r="${r * 0.25}" fill="#fff"/>`; };
