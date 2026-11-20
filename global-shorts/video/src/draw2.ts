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
