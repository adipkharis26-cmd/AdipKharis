// Sistem visual v2: pemeran baru (Dot, Brick), bayangan, shading, latar berlapis, efek. Semua orisinal.
import {C, L, P, eyes, brows, mouth} from './draw.js';
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
  g += arms === 'none' ? '' : (ar[arms] || ar.down);
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

// ===== EP09 Escalator: eskalator (tampak samping), mal dua lantai, panel tombol, gerobak es krim, kaki berlari =====
export const ESC = {x0: 40, y0: 400, x1: 200, y1: 200};          // bawah-kiri -> atas-kanan
export const escPt = (s) => [ESC.x0 + (ESC.x1 - ESC.x0) * s, ESC.y0 + (ESC.y1 - ESC.y0) * s];
export const mallDefs = `<defs><linearGradient id="mallW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDF0E2"/><stop offset="1" stop-color="#F1D9C2"/></linearGradient>
<linearGradient id="tileF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7E2DA"/><stop offset="1" stop-color="#CBC4B8"/></linearGradient>
<linearGradient id="escG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7C8794"/><stop offset="1" stop-color="#5B6570"/></linearGradient></defs>`;
// MAL: dinding, etalase toko lantai bawah, lantai atas (pelat + pagar kaca) di kanan, lantai keramik
export function mall() {
  let s = `<rect x="-400" y="-400" width="1100" height="800" fill="url(#mallW)"/>`;
  for (const [x, c] of [[-70, '#9ED8FF'], [96, '#FFB5C8']]) s += `<rect x="${x}" y="296" width="110" height="104" fill="${c}" opacity=".55" stroke="${C.ink}" stroke-width="3"/><rect x="${x}" y="282" width="110" height="16" fill="${c}" stroke="${C.ink}" stroke-width="3"/>` + L(x + 55, 298, x + 55, 400, 2, 'rgba(0,0,0,.25)');
  s += `<rect x="196" y="-400" width="500" height="600" fill="#F6E3CC"/><rect x="196" y="40" width="500" height="160" fill="#FFF6EA" opacity=".6"/>`;
  s += `<rect x="196" y="200" width="500" height="18" fill="#C9B9A6" stroke="${C.ink}" stroke-width="4"/>`;
  s += `<rect x="-400" y="400" width="1100" height="400" fill="url(#tileF)"/>` + L(-400, 400, 700, 400, 4);
  for (let i = -8; i < 12; i++) s += L(i * 46, 400, i * 80 - 70, 800, 2, 'rgba(0,0,0,.08)');
  return s;
}
// ESKALATOR: phase = posisi anak tangga (satuan panjang lintasan); spark = panel rusak
export function escalator(phase) {
  const {x0, y0, x1, y1} = ESC;
  const n = 18, gap = 1 / n;
  let s = `<path d="M${x0 - 24},${y0} L${x0},${y0} L${x1},${y1} L${x1 + 12},${y1} L${x1 + 12},${y1 + 26} L${x0 + 30},${y0 + 4} Z" fill="url(#escG)" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>`;
  // anak tangga (tapak datar) bergerak sepanjang lintasan
  for (let k = -1; k <= n; k++) {
    const t = ((k * gap + phase) % 1 + 1) % 1, [x, y] = escPt(t), w = (x1 - x0) * gap;
    s += `<path d="M${x - w * 0.5},${y} h${w} v${(y1 - y0) * gap * -1}" fill="none" stroke="#D8DEE4" stroke-width="2.5"/>`;
  }
  s += L(x0, y0, x1, y1, 3);
  // pegangan tangan (pita gelap) di atas lintasan, melingkar di kedua ujung
  s += `<path d="M${x0 - 20},${y0 - 34} L${x1 - 6},${y1 - 34} q16,0 16,14" fill="none" stroke="#2b2b33" stroke-width="7" stroke-linecap="round"/><path d="M${x0 - 20},${y0 - 34} q-14,0 -14,16" fill="none" stroke="#2b2b33" stroke-width="7" stroke-linecap="round"/>`;
  s += `<path d="M${x0 - 12},${y0 - 30} L${x1 - 4},${y1 - 30}" fill="none" stroke="#9AD0F5" stroke-width="10" opacity=".35"/>`;
  return s;
}
// PANEL tombol arah (piktogram panah, tanpa teks). dir 1 = naik, -1 = turun; spark 0..1
export function escPanel(x, y, o: any = {}) {
  const {dir = -1, spark = 0, press = 0} = o;
  let s = `<rect x="${x - 7}" y="${y}" width="14" height="${400 - y < 0 ? 30 : 30}" fill="#9AA3AF" stroke="${C.ink}" stroke-width="3"/>` +
    `<rect x="${x - 11}" y="${y - 22}" width="22" height="22" rx="4" fill="#3A3A46" stroke="${C.ink}" stroke-width="3"/>` +
    `<circle cx="${x}" cy="${y - 11 + press}" r="6" fill="${spark ? '#FFD23F' : '#FF5A5A'}" stroke="${C.ink}" stroke-width="2"/>` +
    `<path d="M${x - 3},${y - 11 + dir * 2.5} l3,${-dir * 4} l3,${dir * 4}" fill="none" stroke="#fff" stroke-width="2"/>`;
  if (spark) for (let i = 0; i < 6; i++) { const a = i * 1.05 + spark * 3, r = 8 + spark * 12; s += L(x + Math.cos(a) * r * 0.6, y - 11 + Math.sin(a) * r * 0.6, x + Math.cos(a) * r, y - 11 + Math.sin(a) * r, 2.5, '#FFB400'); }
  return s;
}
// GEROBAK ES KRIM (berpayung garis)
export function iceCart(x, y, cones = 1) {
  let s = L(x - 26, y - 46, x - 26, y - 100, 3) + `<path d="M${x - 60},${y - 100} Q${x - 26},${y - 128} ${x + 8},${y - 100}Z" fill="#FF8FC7" stroke="${C.ink}" stroke-width="3"/><path d="M${x - 37},${y - 103} Q${x - 26},${y - 124} ${x - 15},${y - 103}Z" fill="#fff"/>`;
  s += `<rect x="${x - 44}" y="${y - 46}" width="58" height="40" rx="4" fill="#fff" stroke="${C.ink}" stroke-width="3.5"/><rect x="${x - 44}" y="${y - 32}" width="58" height="8" fill="#FF8FC7"/>`;
  s += `<circle cx="${x - 34}" cy="${y - 4}" r="6" fill="#555" stroke="${C.ink}" stroke-width="2.5"/><circle cx="${x + 4}" cy="${y - 4}" r="6" fill="#555" stroke="${C.ink}" stroke-width="2.5"/>`;
  for (let i = 0; i < cones; i++) s += `<g transform="translate(${x - 26 + i * 12},${y - 58})">${P.cone(0.6)}</g>`;
  return s;
}
// KAKI BERLARI (dipakai Quibble & Snick agar close-up identik). (x,y) = titik lantai; ph = fase langkah
export function runLegs(x, y, ph, s = 1, amp = 1) {
  let g = '';
  for (const k of [0, 1]) {
    const a = Math.sin(ph + k * Math.PI) * 0.7 * amp, lift = Math.max(0, Math.cos(ph + k * Math.PI)) * 6 * amp;
    const hx = x + (k ? 5 : -5) * s, hy = y - 20 * s, fx = hx + Math.sin(a) * 18 * s, fy = y - lift * s;
    g += L(hx, hy, fx, fy, 5 * s) + L(fx, fy, fx + 8 * s, fy, 5 * s);
  }
  return g;
}

// ===== EP10 Popcorn: dapur, microwave, popcorn, panci, pemanggang roti, kulkas =====
export const kitDefs = `<defs><linearGradient id="kitW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8F0E4"/><stop offset="1" stop-color="#B5DCC9"/></linearGradient>
<linearGradient id="kitF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9C9A3"/><stop offset="1" stop-color="#CFA67A"/></linearGradient>
<radialGradient id="mwGlow" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#FFD98A"/><stop offset="1" stop-color="#E8A23A"/></radialGradient></defs>`;
const rnd = (i) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
// satu popcorn: gumpalan putih bergerigi + sedikit kuning
export const pop = (x, y, s = 1, rot = 0) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><path d="M-7,2 a5,5 0 0 1 2,-8 a5,5 0 0 1 8,-2 a5,5 0 0 1 6,6 a5,5 0 0 1 -2,8 a5,5 0 0 1 -8,2 a5,5 0 0 1 -6,-6Z" fill="#FFFDF4" stroke="${C.ink}" stroke-width="2"/><circle cx="1" cy="2" r="2.4" fill="#F6C445"/></g>`;
export const kernel = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M0,-5 Q5,-2 3,4 Q0,6 -3,4 Q-5,-2 0,-5Z" fill="#F2B632" stroke="${C.ink}" stroke-width="1.6"/></g>`;
// massa popcorn: dari x0..x1, permukaan atas di yTop (gelombang), dasar yBot
export function popMass(x0, x1, yTop, yBot, f = 0, seed = 0, amp = 6) {
  if (x1 - x0 < 2 || yBot - yTop < 1) return '';
  let d = `M${x0},${yBot}`; const n = Math.max(2, Math.round((x1 - x0) / 12));
  for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; d += ` L${x},${yTop + Math.sin(i * 1.7 + f * 0.25 + seed) * amp * 0.5}`; }
  let g = `<path d="${d} L${x1},${yBot}Z" fill="#FFF6DC" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>`;
  for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; g += pop(x + (rnd(i + seed) - 0.5) * 6, yTop + Math.sin(i * 1.7 + f * 0.25 + seed) * amp * 0.5, 1 + rnd(i + seed + 9) * 0.5, rnd(i + seed + 3) * 360); }
  const m = Math.min(40, Math.round((x1 - x0) * (yBot - yTop) / 500));
  for (let i = 0; i < m; i++) g += pop(x0 + 6 + rnd(i * 3 + seed) * (x1 - x0 - 12), yTop + 10 + rnd(i * 5 + seed + 1) * (yBot - yTop - 12), 0.9, rnd(i + seed + 7) * 360);
  return g;
}
export const MW = {x: 50, y: 236, w: 100, h: 56, dial: [136, 262]};
// microwave: dial(deg) · fill(0..1 popcorn dalam jendela) · door(0..1 terlempar) · on(lampu dalam) · shk(goyang) · n(popcorn tunggal di piring)
export function microwave(o: any = {}) {
  const {dial = 30, fill = 0, door = 0, on = true, shk = 0, n = 0, f = 0, bulge = 0} = o; const {x, y, w, h} = MW;
  let g = `<rect x="${x - bulge}" y="${y - bulge}" width="${w + bulge * 2}" height="${h + bulge}" rx="8" fill="#E9EEF2" stroke="${C.ink}" stroke-width="4"/>` +
    `<rect x="${x + 8}" y="${y + 8}" width="62" height="40" rx="4" fill="${on ? 'url(#mwGlow)' : '#3A3440'}" stroke="${C.ink}" stroke-width="3"/>`;
  if (n && fill < 0.2) g += pop(x + 39, y + 40 - Math.abs(Math.sin(f * 0.35)) * 8, 1, f * 9);
  if (fill > 0) { const ft = y + 48 - 40 * Math.min(1, fill); g += `<clipPath id="mwc"><rect x="${x + 8}" y="${y + 8}" width="62" height="40" rx="4"/></clipPath><g clip-path="url(#mwc)">${popMass(x + 6, x + 72, ft, y + 50, f, 2, 5)}</g>`; }
  g += `<rect x="${x + 76}" y="${y + 8}" width="18" height="40" rx="3" fill="#CFD8DF" stroke="${C.ink}" stroke-width="2.5"/>` +
    `<g transform="translate(${MW.dial[0]},${MW.dial[1]}) rotate(${dial})"><circle r="7" fill="#fff" stroke="${C.ink}" stroke-width="2.5"/>${L(0, 0, 0, -6, 3, '#E4572E')}</g>` +
    `<circle cx="${x + 85}" cy="${y + 40}" r="3.5" fill="#7BD389" stroke="${C.ink}" stroke-width="2"/>`;
  if (door > 0) { // pintu terlempar ke kanan-depan sambil berputar
    const dx = door * 160, dy = -Math.sin(door * Math.PI) * 60 + door * 90;
    g += `<rect x="${x + 8}" y="${y + 8}" width="62" height="40" rx="4" fill="#2A2530" stroke="${C.ink}" stroke-width="3"/>` +
      `<g transform="translate(${x + 39 + dx},${y + 28 + dy}) rotate(${door * 540})"><rect x="-34" y="-22" width="68" height="44" rx="5" fill="#E9EEF2" stroke="${C.ink}" stroke-width="3.5"/><rect x="-28" y="-16" width="56" height="32" rx="3" fill="#A9D8EA" stroke="${C.ink}" stroke-width="2"/></g>`;
  }
  return `<g transform="translate(${shk},${-Math.abs(shk) * 0.4})">${g}</g>`;
}
export const panK = (x, y, rot = 0, c = '#5B7DB1', s = 1) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><path d="M-18,-16 L18,-16 L15,0 L-15,0Z" fill="${c}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>${L(18, -12, 28, -14, 4)}${L(-18, -12, -28, -14, 4)}<rect x="-20" y="-19" width="40" height="4" rx="2" fill="${C.ink}"/></g>`;
export function toaster(x, y, o: any = {}) {
  const {lever = 0, toast = 0} = o; // toast: 0 di dalam .. 1 terbang tinggi
  const ty = -Math.sin(Math.min(1, toast) * Math.PI) * 140 - toast * 10;
  const tst = (dx, r) => `<g transform="translate(${x + dx + toast * dx * 3},${y - 30 + (toast ? ty : 0)}) rotate(${toast * r})"><rect x="-8" y="-11" width="16" height="20" rx="5" fill="#E7B26A" stroke="${C.ink}" stroke-width="2.5"/><rect x="-5" y="-8" width="10" height="14" rx="3" fill="#F6D59A"/></g>`;
  return tst(-9, -300) + tst(9, 340) + `<rect x="${x - 26}" y="${y - 34}" width="52" height="34" rx="10" fill="#E4572E" stroke="${C.ink}" stroke-width="3.5"/>` +
    `<rect x="${x - 18}" y="${y - 30}" width="36" height="6" rx="3" fill="#fff" opacity=".35"/>${L(x + 26, y - 20 + lever * 10, x + 33, y - 20 + lever * 10, 4)}`;
}
export function fridge(x, y, o: any = {}) {
  const {sq = 0} = o;
  return `<g transform="translate(${x},${y}) scale(${1 + sq * 0.04},${1 - sq * 0.03}) translate(${-x},${-y})"><rect x="${x - 42}" y="${y - 210}" width="84" height="210" rx="12" fill="#F4F7FA" stroke="${C.ink}" stroke-width="4"/>` +
    `<rect x="${x + 20}" y="${y - 210}" width="22" height="210" rx="0" fill="#000" opacity=".06"/>${L(x - 42, y - 140, x + 42, y - 140, 3)}${L(x - 30, y - 186, x - 30, y - 160, 5)}${L(x - 30, y - 124, x - 30, y - 80, 5)}` +
    `<circle cx="${x + 14}" cy="${y - 180}" r="6" fill="#FFD23F" stroke="${C.ink}" stroke-width="2"/><rect x="${x + 6}" y="${y - 120}" width="14" height="18" rx="2" fill="#FF8FA3" stroke="${C.ink}" stroke-width="2"/></g>`;
}
export function kitchen() {
  let g = `<rect x="-400" y="-300" width="1600" height="1100" fill="url(#kitW)"/>`;
  for (let i = 0; i < 40; i++) for (let j = 0; j < 3; j++) g += `<rect x="${-80 + i * 22}" y="${226 + j * 22 - (i % 2) * 0}" width="20" height="20" rx="3" fill="#fff" opacity=".35"/>`;
  g += `<rect x="-400" y="400" width="1600" height="400" fill="url(#kitF)"/>${L(-400, 400, 1200, 400, 4)}`;
  for (const cx of [210, 330, 450]) g += `<rect x="${cx - 54}" y="118" width="108" height="78" rx="8" fill="#F2A65A" stroke="${C.ink}" stroke-width="4"/><rect x="${cx - 6}" y="150" width="12" height="4" rx="2" fill="${C.ink}"/>`;
  g += `<rect x="-60" y="60" width="90" height="120" rx="8" fill="#9ED8FF" stroke="${C.ink}" stroke-width="4"/>${L(-15, 60, -15, 180, 3)}${L(-60, 120, 30, 120, 3)}`;
  g += `<rect x="-40" y="300" width="600" height="100" fill="#F2A65A" stroke="${C.ink}" stroke-width="4"/>`;
  for (let i = 0; i < 6; i++) g += `<rect x="${-34 + i * 98}" y="310" width="88" height="82" rx="6" fill="#F7B977" stroke="${C.ink}" stroke-width="3"/><rect x="${-34 + i * 98 + 38}" y="318" width="12" height="4" rx="2" fill="${C.ink}"/>`;
  g += `<rect x="-46" y="290" width="612" height="12" rx="4" fill="#FFF7EA" stroke="${C.ink}" stroke-width="4"/>`;
  return g;
}

// ===== EP11 Snowman: halaman bersalju (siang<->malam), boneka salju, wortel, es loli, kelinci salju, tampak atas, kaca pembesar =====
export const lerpC = (a, b, t) => { const p = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * Math.max(0, Math.min(1, t))).toString(16).padStart(2, '0')).join(''); };
export const snowDefs = (n = 0) => `<defs><linearGradient id="skyS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lerpC('#8CCBF2', '#10173A', n)}"/><stop offset="1" stop-color="${lerpC('#FFE1C4', '#33437A', n)}"/></linearGradient>
<linearGradient id="snowG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D3E3F4"/></linearGradient>
<radialGradient id="ballG" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".65" stop-color="#F2F7FD"/><stop offset="1" stop-color="#C6D8EE"/></radialGradient></defs>`;
// salju turun: tepat 3 putaran vertikal per 420 frame (seamless)
export const snowfall = (f, n = 34, op = 0.9) => Array.from({length: n}, (_, i) => {
  const x = (rnd(i + 3) * 300 - 15) + Math.sin(f * Math.PI * 2 * (1 + (i % 3)) / 420 + i) * 6, y = ((rnd(i + 40) * 520 + f * 520 * 3 / 420) % 520) - 20;
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${1 + rnd(i + 7) * 1.6}" fill="#fff" opacity="${op}"/>`;
}).join('');
// latar samping: langit (n=0 pagi, 1 malam), matahari/bulan, bintang, bukit salju, pinus. Panggil nightTint(n) setelah semua objek.
export function winter(n = 0) {
  let s = `<rect x="-600" y="-500" width="1600" height="900" fill="url(#skyS)"/>`;
  const sy = 192 + n * 240;
  s += `<circle cx="196" cy="${sy}" r="20" fill="#FFD66B" stroke="${C.ink}" stroke-width="4"/><circle cx="196" cy="${sy}" r="30" fill="#FFE9A8" opacity=".35"/>`;
  s += `<path d="M-600,350 Q-150,282 70,330 T380,318 T1000,340 V420 H-600Z" fill="${lerpC('#E4EEF9', '#5C6C9E', n)}" stroke="${C.ink}" stroke-width="3"/>`;
  for (const [tx, th, tw] of [[-14, 170, 46], [262, 150, 42], [300, 190, 50]]) {
    s += `<rect x="${tx - 6}" y="${400 - 30}" width="12" height="30" fill="#7A5230" stroke="${C.ink}" stroke-width="4"/>`;
    for (let k = 0; k < 3; k++) { const yy = 400 - 30 - k * th * 0.28, w = tw * (1 - k * 0.24); s += `<path d="M${tx - w},${yy} L${tx},${yy - th * 0.46} L${tx + w},${yy}Z" fill="#2F7D5B" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/><path d="M${tx - w * 0.55},${yy - th * 0.2} L${tx},${yy - th * 0.46} L${tx + w * 0.55},${yy - th * 0.2} q-${w * 0.28},8 -${w * 0.55},0 q-${w * 0.28},8 -${w * 0.55},0Z" fill="#fff"/>`; }
  }
  s += `<path d="M-600,398 Q-200,392 60,399 T400,397 T1000,398 V800 H-600Z" fill="url(#snowG)"/>` + `<path d="M-600,398 Q-200,392 60,399 T400,397 T1000,398" fill="none" stroke="${C.ink}" stroke-width="4"/>`;
  for (let i = -8; i < 14; i++) s += `<ellipse cx="${i * 41 + 12}" cy="${414 + (((i % 3) + 3) % 3) * 18}" rx="9" ry="2.4" fill="#BFD3EA" opacity=".8"/>`;
  return s;
}
export function nightTint(n = 0) {
  if (n <= 0.01) return '';
  let s = `<rect x="-600" y="-500" width="1600" height="1400" fill="#26306B" opacity="${(n * 0.55).toFixed(3)}" style="mix-blend-mode:multiply"/>`;
  for (let i = 0; i < 26; i++) { const x = rnd(i + 90) * 250, y = rnd(i + 130) * 160 + 120; s += `<circle cx="${x}" cy="${y}" r="${0.8 + rnd(i) * 1.3}" fill="#FFF6C8" opacity="${(n * (0.6 + 0.4 * rnd(i + 5))).toFixed(2)}"/>`; }
  const my = 330 - n * 140;
  s += `<g opacity="${Math.max(0, Math.min(1, (n - 0.2) * 1.6)).toFixed(2)}"><circle cx="64" cy="${my}" r="34" fill="#FFF8D6" opacity=".18"/><circle cx="64" cy="${my}" r="20" fill="#FFF3C0" stroke="${C.ink}" stroke-width="4"/><circle cx="72" cy="${my - 4}" r="17" fill="${lerpC('#33437A', '#10173A', 0.5)}"/></g>`;
  return s;
}
export const carrot = (x, y, s = 1, rot = 0, bite = 0) => { const t = 26 * (1 - bite), w = 5 * (1 - bite * 0.6); return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">${bite < 1 ? `<path d="M0,-5 Q${t * 0.5},-4.5 ${t},${-w * 0.25} L${t},${w * 0.25} Q${t * 0.5},4.5 0,5Z" fill="#FF8C2B" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round"/>` + L(7, -3, 9, -1, 1.6) + (t > 16 ? L(15, 1, 17, 3, 1.6) : '') : ''}<path d="M0,0 q-8,-10 -12,-6 M0,0 q-10,-2 -12,4 M0,0 q-6,6 -4,10" fill="none" stroke="#3FA34D" stroke-width="3" stroke-linecap="round"/></g>`; };
export const popsicle = (x, y, s = 1, rot = 0, bite = 0) => { const h = 30 * (1 - bite); return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-2.5" y="-2" width="5" height="15" rx="2.5" fill="#E3B778" stroke="${C.ink}" stroke-width="2"/><rect x="-8" y="${-h}" width="16" height="${h}" rx="${Math.min(8, h / 2)}" fill="#FF9F43" stroke="${C.ink}" stroke-width="2.6"/><rect x="-5" y="${-h + 4}" width="3" height="${Math.max(0, h - 10)}" rx="1.5" fill="#fff" opacity=".5"/></g>`; };
// boneka salju: (x,y)=dasar; nose: carrot|none|pop
export function snowman(x, y, s = 1, o: any = {}) {
  const {nose = 'carrot', tilt = 0, bite = 0} = o;
  let g = `<ellipse cx="0" cy="-2" rx="44" ry="7" fill="${C2.shadow}"/>`;
  g += L(-26, -98, -58, -122, 4, '#6B4423') + L(-46, -112, -54, -126, 3, '#6B4423') + L(26, -98, 58, -124, 4, '#6B4423') + L(48, -116, 58, -110, 3, '#6B4423');
  for (const [cy, r] of [[-36, 40], [-98, 29], [-146, 21]]) g += `<circle cx="0" cy="${cy}" r="${r}" fill="url(#ballG)" stroke="${C.ink}" stroke-width="4.5"/>`;
  g += [-108, -94, -80].map(cy => `<circle cx="0" cy="${cy}" r="3.2" fill="${C.ink}"/>`).join('');
  g += `<path d="M-21,-128 Q0,-120 21,-128 L22,-120 Q0,-112 -22,-120Z" fill="#E63946" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/><path d="M10,-122 l6,22 l-9,1 l-4,-21Z" fill="#E63946" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>`;
  g += `<g transform="rotate(${tilt},0,-160)"><rect x="-22" y="-167" width="44" height="6" rx="3" fill="${C.ink}"/><rect x="-14" y="-192" width="28" height="27" rx="3" fill="#2A2A33" stroke="${C.ink}" stroke-width="3"/><rect x="-14" y="-172" width="28" height="5" fill="#3D7DD8"/></g>`;
  g += `<circle cx="-8" cy="-151" r="3.2" fill="${C.ink}"/><circle cx="8" cy="-151" r="3.2" fill="${C.ink}"/>` + [-8, -4, 0, 4, 8].map((dx, i) => `<circle cx="${dx}" cy="${-136 + Math.abs(dx) * -0.25}" r="1.7" fill="${C.ink}"/>`).join('');
  if (nose === 'carrot') g += carrot(2, -144, 0.8, 4, bite);
  else if (nose === 'pop') g += popsicle(2, -144, 0.62, 90, bite);
  else g += `<ellipse cx="2" cy="-144" rx="3" ry="2.6" fill="#8BA3C4" stroke="${C.ink}" stroke-width="1.6"/>`;
  return `<g transform="translate(${x},${y}) scale(${s})">${g}</g>`;
}
// kelinci salju: putih, telinga panjang, pipi menggembung saat mengunyah. (x,y)=kaki, menghadap kanan
export function bunny(x, y, s = 1, o: any = {}) {
  const {chew = 0, ear = 0, blink = false, flip = false, hold = '', sq = 1} = o;
  let g = `<ellipse cx="0" cy="1" rx="16" ry="3" fill="${C2.shadow}"/><circle cx="-16" cy="-16" r="6" fill="#fff" stroke="${C.ink}" stroke-width="3"/>`;
  g += `<g transform="rotate(${-14 + ear * 10},8,-38)"><ellipse cx="6" cy="-52" rx="4.6" ry="13" fill="#fff" stroke="${C.ink}" stroke-width="3"/><ellipse cx="6" cy="-52" rx="2" ry="8.5" fill="#FFB3C6"/></g>`;
  g += `<ellipse cx="0" cy="-14" rx="16" ry="13" fill="#fff" stroke="${C.ink}" stroke-width="3.2"/><ellipse cx="-6" cy="-1" rx="6" ry="3" fill="#fff" stroke="${C.ink}" stroke-width="2.6"/><ellipse cx="8" cy="-1" rx="6" ry="3" fill="#fff" stroke="${C.ink}" stroke-width="2.6"/>`;
  g += `<g transform="rotate(${12 - ear * 12},14,-38)"><ellipse cx="16" cy="-52" rx="4.6" ry="13" fill="#fff" stroke="${C.ink}" stroke-width="3"/><ellipse cx="16" cy="-52" rx="2" ry="8.5" fill="#FFB3C6"/></g>`;
  g += `<circle cx="11" cy="-30" r="11.5" fill="#fff" stroke="${C.ink}" stroke-width="3.2"/>`;
  g += blink ? L(13, -33, 19, -33, 2.2) : `<circle cx="16" cy="-33" r="2.6" fill="${C.ink}"/><circle cx="16.8" cy="-34" r=".9" fill="#fff"/>`;
  g += `<ellipse cx="17" cy="-25" rx="${3.6 + chew * 1.8}" ry="${2.6 + chew}" fill="#FFB3C6" opacity=".75"/><ellipse cx="22.5" cy="-29" rx="1.8" ry="1.5" fill="#FF6F91"/>`;
  if (hold) g += `<g transform="translate(22,-25)">${hold}</g>`;
  return `<g transform="translate(${x},${y}) scale(${flip ? -s : s},${s * sq})">${g}</g>`;
}
export function bush(x, y, s = 1, shk = 0) {
  const r = Math.sin(shk * 2.2) * 6 * Math.min(1, shk / 4 + 0.001) * (shk > 0 ? 1 : 0);
  return `<g transform="translate(${x},${y}) scale(${s}) rotate(${r.toFixed(2)},0,0)"><path d="M-34,0 q-8,-26 14,-30 q6,-22 28,-14 q22,-10 30,14 q16,4 6,30Z" fill="#3E8C5A" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/><path d="M-22,-28 q8,-6 14,-4 q6,-16 22,-10 q14,-4 20,8 q-12,-4 -18,2 q-10,-6 -18,2 q-10,-4 -20,2Z" fill="#fff"/><circle cx="-12" cy="-12" r="3" fill="#E63946"/><circle cx="14" cy="-8" r="3" fill="#E63946"/></g>`;
}
// TAMPAK ATAS (koordinat dunia biasa 270x480 dilihat dari atas)
export function topYard() {
  let s = `<rect x="-400" y="-400" width="1100" height="1300" fill="#F3F8FE"/>`;
  for (let i = 0; i < 70; i++) s += `<ellipse cx="${(rnd(i + 200) * 560 - 140).toFixed(1)}" cy="${(rnd(i + 300) * 760 - 140).toFixed(1)}" rx="${6 + rnd(i) * 10}" ry="${2 + rnd(i + 1) * 3}" fill="#D9E6F5" opacity=".9"/>`;
  return s;
}
const SM = [135, 245];
export function topTracks() {
  let s = '';
  // Quibble: jejak oval berpasangan dari kiri bawah
  for (let i = 0; i < 6; i++) { const t = i / 5, x = 40 + (108 - 40) * t, y = 400 - (400 - 288) * t; s += `<ellipse cx="${x + (i % 2 ? 6 : -6)}" cy="${y}" rx="4.5" ry="7" fill="#C5D6EB" transform="rotate(${-30},${x},${y})"/>`; }
  // Snick: jejak segitiga dari kanan, berhenti dekat boneka salju
  for (let i = 0; i < 5; i++) { const t = i / 4, x = 262 - (262 - 178) * t, y = 318 - (318 - 270) * t + (i % 2 ? 5 : -5); s += `<path d="M${x - 5},${y + 4} L${x + 5},${y + 4} L${x},${y - 6}Z" fill="#C5D6EB" transform="rotate(-60,${x},${y})"/>`; }
  // Dot: alur gelinding dari boneka salju ke semak + remah wortel
  const d = `M118,224 C100,200 78,178 62,140`;
  s += `<path d="${d}" fill="none" stroke="#B9CCE4" stroke-width="20" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#E2ECF8" stroke-width="10" stroke-linecap="round"/>`;
  for (const [x, y] of [[112, 214], [96, 194], [82, 176], [70, 156]]) s += `<circle cx="${x}" cy="${y}" r="2.6" fill="#FF8C2B" stroke="${C.ink}" stroke-width="1.2"/>`;
  // kelinci: jejak Y kecil dekat semak
  for (const [x, y, r] of [[22, 92, -30], [10, 72, -20], [34, 76, -40]]) s += `<g transform="translate(${x},${y}) rotate(${r})"><ellipse cx="-3" cy="0" rx="2" ry="3" fill="#C5D6EB"/><ellipse cx="3" cy="0" rx="2" ry="3" fill="#C5D6EB"/><ellipse cx="0" cy="8" rx="2.2" ry="4.5" fill="#C5D6EB"/></g>`;
  return s;
}
export function topSnowman() {
  const [x, y] = SM;
  return `<g transform="translate(${x},${y})"><ellipse cx="8" cy="8" rx="44" ry="42" fill="${C2.shadow}"/><line x1="-30" y1="0" x2="-64" y2="-8" stroke="#6B4423" stroke-width="4" stroke-linecap="round"/><line x1="30" y1="0" x2="64" y2="6" stroke="#6B4423" stroke-width="4" stroke-linecap="round"/>
<circle r="40" fill="url(#ballG)" stroke="${C.ink}" stroke-width="4.5"/><circle r="29" fill="url(#ballG)" stroke="${C.ink}" stroke-width="3.5"/><circle r="23" fill="none" stroke="#E63946" stroke-width="6"/><circle r="19" fill="${C.ink}"/><circle r="13" fill="#2A2A33" stroke="#3D7DD8" stroke-width="3"/><circle cx="-4" cy="-4" r="3" fill="#fff" opacity=".35"/></g>`;
}
export const topBush = (x, y) => `<g transform="translate(${x},${y})"><ellipse cx="6" cy="6" rx="30" ry="26" fill="${C2.shadow}"/><path d="M-26,4 q-6,-22 14,-24 q10,-16 28,-4 q18,0 12,22 q4,18 -16,20 q-12,10 -26,0 q-16,2 -12,-14Z" fill="#3E8C5A" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/><circle cx="-6" cy="-6" r="7" fill="#fff"/><circle cx="10" cy="4" r="5" fill="#fff"/><circle cx="-12" cy="8" r="2.6" fill="#E63946"/><circle cx="12" cy="-10" r="2.6" fill="#E63946"/></g>`;
export const topPine = (x, y, r = 34) => `<g transform="translate(${x},${y})"><circle cx="8" cy="8" r="${r}" fill="${C2.shadow}"/><path d="${Array.from({length: 16}, (_, i) => { const a = i * Math.PI / 8, rr = i % 2 ? r * 0.62 : r; return (i ? 'L' : 'M') + (Math.cos(a) * rr).toFixed(1) + ',' + (Math.sin(a) * rr).toFixed(1); }).join('')}Z" fill="#2F7D5B" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/><circle r="${r * 0.38}" fill="#fff"/><circle r="${r * 0.12}" fill="#7A5230"/></g>`;
// karakter dilihat dari atas, wajah menengadah ke kamera. kind q|s|d
export function topChar(kind, x, y, s = 1, o: any = {}) {
  const {look = [0, 0], brow = 'flat', m = 'smile', blink = false, rot = 0, arm = 0} = o;
  let g = '';
  if (kind === 'q') {
    g += `<ellipse cx="7" cy="9" rx="38" ry="36" fill="${C2.shadow}"/>` + L(-34, 6, -50, 18 - arm * 30, 6) + L(34, 6, 50 + arm * 6, 18 - arm * 10, 6);
    g += `<circle r="37" fill="${C.q}" stroke="${C.ink}" stroke-width="5"/><ellipse cx="-16" cy="-18" rx="9" ry="6" fill="#fff" opacity=".45"/>` + eyes(0, -6, 14, 11, look, false, blink) + brows(0, -25, 14, 18, brow) + mouth(0, 16, m, 18);
  } else if (kind === 's') {
    g += `<path d="M7,-30 L43,40 L-29,40Z" fill="${C2.shadow}"/>` + L(-24, 14, -40 - arm * 6, 26 - arm * 26, 5) + L(24, 14, 40, 26, 5);
    g += `<path d="M0,-40 L36,32 L-36,32Z" fill="${C.s}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M0,-40 q-4,-12 6,-18 q-2,9 6,11" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>` + eyes(0, 4, 9, 8, look, false, blink) + brows(0, -10, 9, 12, brow) + mouth(0, 20, m, 14);
  } else {
    g += `<circle cx="6" cy="7" r="32" fill="${C2.shadow}"/><circle r="32" fill="${C2.dot}" stroke="${C.ink}" stroke-width="5"/><ellipse cx="-14" cy="-16" rx="6" ry="9" fill="#fff" opacity=".45"/>` + eyes(0, -6, 12, 10, look, false, blink) + brows(0, -24, 12, 12, brow) + mouth(0, 12, m, 14) + `<ellipse cx="-22" cy="8" rx="6" ry="3.5" fill="#FF8FA3" opacity=".8"/><ellipse cx="22" cy="8" rx="6" ry="3.5" fill="#FF8FA3" opacity=".8"/>`;
  }
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">${g}</g>`;
}
export const lensIcon = (s = 1) => `<g transform="scale(${s})"><line x1="6" y1="6" x2="16" y2="16" stroke="#6B4423" stroke-width="5" stroke-linecap="round"/><circle r="9" fill="#CFEFFF" fill-opacity=".7" stroke="${C.ink}" stroke-width="3.5"/><path d="M-5,-3 q2,-4 6,-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>`;
// POV kaca pembesar (koordinat LAYAR): gelap di luar lensa, bingkai + gagang
export const magnifier = (cx, cy, r) => `<path fill-rule="evenodd" d="M-20,-20 H290 V500 H-20Z M${cx - r},${cy} a${r},${r} 0 1 0 ${2 * r},0 a${r},${r} 0 1 0 ${-2 * r},0Z" fill="#141826" opacity=".94"/>
<line x1="${cx - r * 0.42}" y1="${cy + r * 0.92}" x2="${cx - r * 0.75}" y2="${cy + r * 1.9}" stroke="${C.ink}" stroke-width="24" stroke-linecap="round"/><line x1="${cx - r * 0.42}" y1="${cy + r * 0.92}" x2="${cx - r * 0.75}" y2="${cy + r * 1.9}" stroke="#8A5A2B" stroke-width="16" stroke-linecap="round"/>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.ink}" stroke-width="16"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#D9A93A" stroke-width="9"/><path d="M${cx - r * 0.7},${cy - r * 0.35} q${r * 0.2},${-r * 0.4} ${r * 0.55},${-r * 0.5}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".55"/>`;
export const note = (x, y, s = 1, rot = 0) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><ellipse cx="0" cy="0" rx="4.5" ry="3.5" fill="${C.ink}" transform="rotate(-20)"/><path d="M4,-1 V-16 q5,2 7,7" fill="none" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round"/></g>`;

// ===== EP12 Balloon: taman pasar malam siang hari, palet pastel kuning-pink =====
export const BAL = ['#FF8FB8', '#FFD54F', '#8FE3C8', '#B9A2F5', '#FFB38A', '#8CCBF2', '#FF6F91', '#C5E86C', '#FFC6E0', '#7FD1E8'];
// posisi balon relatif titik genggam G (urutan isi; dipecahkan dari indeks terbesar)
export const BSLOT = [[0, -56], [-19, -50], [19, -50], [0, -78], [-34, -66], [34, -66], [-17, -84], [17, -84], [-38, -44], [38, -44]];
export const balloon = (x, y, c, sq = 1, rot = 0) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${1 / Math.sqrt(sq)},${sq})"><path d="M0,12 l-3.5,5 h7z" fill="${c}" stroke="${C.ink}" stroke-width="1.8" stroke-linejoin="round"/><ellipse cx="0" cy="0" rx="11" ry="13" fill="${c}" stroke="${C.ink}" stroke-width="2.6"/><ellipse cx="-4.5" cy="-5" rx="2.4" ry="4.2" fill="#fff" opacity=".75" transform="rotate(20 -4.5 -5)"/></g>`;
export const bstr = (x1, y1, x2, y2, wig = 0) => `<path d="M${x1},${y1} Q${(x1 + x2) / 2 + wig},${(y1 + y2) / 2} ${x2},${y2}" fill="none" stroke="${C.ink}" stroke-width="1.3" opacity=".85"/>`;
// letusan balon p 0..1
export const balPop = (x, y, c, p) => { const r = 10 + p * 16, o = 1 - p; let d = ''; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, rr = i % 2 ? r * 0.5 : r; d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ',' + (y + Math.sin(a) * rr).toFixed(1); }
  return `<g opacity="${o}"><path d="${d}Z" fill="#FFF7C2" stroke="${C.ink}" stroke-width="2.4" stroke-linejoin="round"/>` + [0, 1, 2, 3].map(i => { const a = i * 1.7 + 0.4, q = 8 + p * 22; return `<path d="M${x + Math.cos(a) * q},${y + Math.sin(a) * q + p * 8} q3,-3 6,0" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`; }).join('') + `</g>`; };
export const heart = (x, y, s = 1, op = 1) => `<path transform="translate(${x},${y}) scale(${s})" opacity="${op}" d="M0,6 C-10,-2 -8,-10 -3,-10 C-1,-10 0,-8 0,-7 C0,-8 1,-10 3,-10 C8,-10 10,-2 0,6Z" fill="#FF6F91" stroke="${C.ink}" stroke-width="2" stroke-linejoin="round"/>`;
export function cloud(x, y, s = 1) {
  const cs = [[-22, 4, 12], [-8, -6, 16], [10, -4, 14], [24, 5, 10], [0, 8, 13]];
  return `<g transform="translate(${x},${y}) scale(${s})">` + cs.map(([a, b, r]) => `<circle cx="${a}" cy="${b}" r="${r + 2.6}" fill="${C.ink}"/>`).join('') + cs.map(([a, b, r]) => `<circle cx="${a}" cy="${b}" r="${r}" fill="#fff"/>`).join('') + `<ellipse cx="2" cy="12" rx="26" ry="4" fill="#F9D3E3" opacity=".7"/></g>`;
}
export const birdie = (x, y, s = 1, flap = 0, flip = false) => `<g transform="translate(${x},${y}) scale(${flip ? -s : s},${s})"><path d="M6,-2 l8,2 l-8,3z" fill="#FFB347" stroke="${C.ink}" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="0" cy="0" rx="9" ry="7.5" fill="#8CCBF2" stroke="${C.ink}" stroke-width="2.4"/><path d="M-3,-1 q-8,${-10 * Math.cos(flap)} -12,${-2 - 6 * Math.cos(flap)} q6,6 12,4z" fill="#5FA8D8" stroke="${C.ink}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="3" cy="-2.5" r="1.6" fill="${C.ink}"/>${L(-2, 7, -3, 10, 1.6)}${L(2, 7, 2, 10, 1.6)}</g>`;
// arum manis: (x,y)=pangkal tongkat; eat 0..1 (habis)
export const cotton = (x, y, s = 1, rot = 0, eat = 0) => { const r = 11 * (1 - eat); return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">${L(0, 0, 0, -26, 3, '#F4E3C1')}<line x1="0" y1="0" x2="0" y2="-26" stroke="${C.ink}" stroke-width="1" opacity=".5"/>${r > 1 ? `<circle cx="0" cy="-30" r="${r + 2.5}" fill="${C.ink}"/><circle cx="-4" cy="-33" r="${r * 0.7 + 2.5}" fill="${C.ink}"/><circle cx="0" cy="-30" r="${r}" fill="#FFB3D1"/><circle cx="-4" cy="-33" r="${r * 0.7}" fill="#FFC9E0"/><circle cx="3" cy="-28" r="${r * 0.35}" fill="#fff" opacity=".6"/>` : ''}</g>`; };
export const fairDefs = `<defs><linearGradient id="skyF" gradientUnits="userSpaceOnUse" x1="0" y1="-300" x2="0" y2="420"><stop offset="0" stop-color="#F6A9CC"/><stop offset=".5" stop-color="#FFD0DF"/><stop offset="1" stop-color="#FFF2B3"/></linearGradient>
<linearGradient id="grF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE7A8"/><stop offset="1" stop-color="#F2CF86"/></linearGradient></defs>`;
// lapisan jauh (paralaks): langit, matahari, bukit, awan jauh
export function fairFar() {
  let s = `<rect x="-900" y="-1600" width="2400" height="2600" fill="url(#skyF)"/><circle cx="40" cy="60" r="34" fill="#FFF7D6" opacity=".9"/><circle cx="40" cy="60" r="50" fill="#FFF7D6" opacity=".35"/>`;
  for (const [x, y, k] of [[-60, 130, 0.8], [190, 40, 0.7], [380, 150, 0.9], [100, -120, 0.8], [300, -60, 0.6], [-20, -260, 0.9], [240, -300, 0.8], [520, -180, 0.7]]) s += `<g opacity=".55">${cloud(x, y, k)}</g>`;
  s += `<path d="M-900,420 L-900,352 Q-700,300 -480,350 Q-300,318 -120,352 Q60,312 230,350 Q400,316 580,352 Q760,320 1000,350 L1500,352 L1500,420Z" fill="#FAD4B8" stroke="${C.ink}" stroke-width="3" opacity=".9"/>`;
  return s;
}
export function ferris(cx, cy, R, rot, swing = 0, swingIdx = -1) {
  let s = L(cx, cy, cx - 58, 400, 10) + L(cx, cy, cx - 58, 400, 5, '#F7B5CF') + L(cx, cy, cx + 58, 400, 10) + L(cx, cy, cx + 58, 400, 5, '#F7B5CF');
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.ink}" stroke-width="8"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#FFE07A" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="${R * 0.62}" fill="none" stroke="#F7B5CF" stroke-width="2.5"/>`;
  for (let i = 0; i < 8; i++) { const a = (rot + i * 45) * Math.PI / 180; s += L(cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R, 2.5, '#E59BB9'); }
  s += `<circle cx="${cx}" cy="${cy}" r="9" fill="#FF8FB8" stroke="${C.ink}" stroke-width="3"/>`;
  for (let i = 0; i < 8; i++) {
    const a = (rot + i * 45) * Math.PI / 180, px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R;
    s += `<g transform="rotate(${i === swingIdx ? swing : 0} ${px} ${py})">${L(px, py, px, py + 9, 2.5)}<path d="M${px - 12},${py + 9} h24 v6 q0,10 -12,10 q-12,0 -12,-10z" fill="${BAL[(i * 3) % BAL.length]}" stroke="${C.ink}" stroke-width="2.6" stroke-linejoin="round"/><rect x="${px - 12}" y="${py + 8}" width="24" height="3" fill="${C.ink}" opacity=".25"/></g>`;
  }
  return s;
}
// bendera segitiga di tali melengkung; flut(i) = sudut kibar per bendera
export function bunting(x0, x1, y, sag, flut = (i) => 0) {
  let s = `<path d="M${x0},${y} Q${(x0 + x1) / 2},${y + sag * 2} ${x1},${y}" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
  const n = Math.round((x1 - x0) / 18);
  for (let i = 1; i < n; i++) { const u = i / n, x = x0 + (x1 - x0) * u, yy = y + sag * 4 * u * (1 - u); s += `<path transform="rotate(${flut(i)} ${x} ${yy})" d="M${x - 6},${yy} h12 l-6,13z" fill="${BAL[i % 4 === 0 ? 0 : i % 4 === 1 ? 1 : i % 4 === 2 ? 8 : 3]}" stroke="${C.ink}" stroke-width="1.8" stroke-linejoin="round"/>`; }
  return s;
}
export const pole = (x, top = 230) => `<rect x="${x - 3}" y="${top}" width="6" height="${400 - top}" fill="#F7B5CF" stroke="${C.ink}" stroke-width="2.5"/><circle cx="${x}" cy="${top}" r="6" fill="#FFE07A" stroke="${C.ink}" stroke-width="2.5"/>`;
export function tent(x, w, h, c1 = '#FF8FB8', c2 = '#FFF3C4') {
  let s = `<rect x="${x}" y="${400 - h}" width="${w}" height="${h}" fill="${c2}" stroke="${C.ink}" stroke-width="3"/>`;
  for (let i = 0; i < w / 14; i += 2) s += `<rect x="${x + i * 14}" y="${400 - h}" width="14" height="${h}" fill="${c1}" opacity=".85"/>`;
  s += `<rect x="${x}" y="${400 - h}" width="${w}" height="${h}" fill="none" stroke="${C.ink}" stroke-width="3"/><path d="M${x - 6},${400 - h} L${x + w / 2},${400 - h - h * 0.6} L${x + w + 6},${400 - h}Z" fill="${c1}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/><path d="M${x + w * 0.3},${400 - h * 0.2} v${h * 0.2} M${x + w * 0.7},${400 - h * 0.2} v${h * 0.2}" stroke="${C.ink}" stroke-width="2"/><rect x="${x + w * 0.3}" y="${400 - h * 0.55}" width="${w * 0.4}" height="${h * 0.55}" fill="#5A3C55" opacity=".55"/>`;
  return s;
}
// gerobak balon; titik ikat balon = CART_G(x)
export const CART_G = (x) => [x + 22, 330];
export function balloonCart(x) {
  return L(x + 22, 330, x + 22, 362, 4) + `<rect x="${x - 6}" y="360" width="56" height="26" rx="5" fill="#FFE07A" stroke="${C.ink}" stroke-width="3.5"/><rect x="${x - 6}" y="360" width="56" height="7" fill="#FF8FB8" stroke="${C.ink}" stroke-width="2.5"/>` +
    [0, 1, 2].map(i => `<circle cx="${x + 6 + i * 16}" cy="374" r="3" fill="#fff" stroke="${C.ink}" stroke-width="1.6"/>`).join('') + L(x - 6, 366, x - 18, 352, 4) +
    [x + 2, x + 40].map(cx => `<circle cx="${cx}" cy="391" r="8" fill="#B9A2F5" stroke="${C.ink}" stroke-width="3"/><circle cx="${cx}" cy="391" r="2.5" fill="${C.ink}"/>`).join('');
}
// kastil balon tiup (x0..x0+140); lantai atas = 372 - dent; menara kanan ujung (x0+136, 246)
export const CASTLE = {x0: 300, floor: 372, g: [436, 244]};
export function castle(dent = 0, f = 0) {
  const x0 = CASTLE.x0, fl = CASTLE.floor - dent;
  let s = `<rect x="${x0 + 8}" y="${296 + dent * 0.3}" width="124" height="${fl - 292 - dent * 0.3}" rx="10" fill="#FFC6E0" stroke="${C.ink}" stroke-width="4"/>`;
  for (let i = 0; i < 6; i++) s += `<rect x="${x0 + 14 + i * 20}" y="${300 + dent * 0.3}" width="9" height="${fl - 300 - dent * 0.3}" rx="4.5" fill="#FFE07A" opacity=".9"/>`;
  for (let i = 0; i < 5; i++) s += `<circle cx="${x0 + 20 + i * 25}" cy="${296 + dent * 0.3}" r="9" fill="#FF8FB8" stroke="${C.ink}" stroke-width="3"/>`;
  for (const tx of [x0 + 4, x0 + 136]) s += `<rect x="${tx - 13}" y="${256 + dent * 0.4}" width="26" height="${fl - 252 - dent * 0.4}" rx="10" fill="#FF8FB8" stroke="${C.ink}" stroke-width="4"/><rect x="${tx - 9}" y="${262 + dent * 0.4}" width="6" height="${fl - 270}" rx="3" fill="#fff" opacity=".45"/><circle cx="${tx}" cy="${252 + dent * 0.4}" r="10" fill="#FFE07A" stroke="${C.ink}" stroke-width="3.5"/>`;
  s += `<rect x="${x0 - 8}" y="${fl - 2}" width="156" height="${402 - fl}" rx="12" fill="#B9A2F5" stroke="${C.ink}" stroke-width="4"/><rect x="${x0}" y="${fl + 3}" width="140" height="5" rx="2.5" fill="#fff" opacity=".45"/>`;
  return s;
}
// efek rewind (koordinat layar): garis scan, pita tracking, ikon ◀◀ (bukan teks)
export function rewindFx(f, p) {
  if (p <= 0) return '';
  let s = `<rect width="270" height="480" fill="#5B4B8A" opacity="${0.14 * p}"/>`;
  for (let y = 0; y < 480; y += 6) s += `<rect x="0" y="${y}" width="270" height="2" fill="#000" opacity="${0.08 * p}"/>`;
  const by = (f * 53) % 520 - 30;
  s += `<rect x="0" y="${by}" width="270" height="16" fill="#fff" opacity="${0.28 * p}"/><rect x="0" y="${(by + 190) % 520 - 20}" width="270" height="7" fill="#fff" opacity="${0.18 * p}"/>`;
  s += `<g opacity="${p}" transform="translate(26,40)"><path d="M0,10 L16,0 L16,20Z M16,10 L32,0 L32,20Z" fill="#fff" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round"/></g>`;
  return s;
}
export const speedLines = (f, p) => p <= 0 ? '' : Array.from({length: 14}, (_, i) => { const x = (i * 47 + 13) % 270, y = ((i * 131 + f * 90) % 700) - 110; return `<rect x="${x}" y="${y}" width="3" height="${60 + (i % 3) * 30}" rx="1.5" fill="#fff" opacity="${0.55 * p}"/>`; }).join('');
