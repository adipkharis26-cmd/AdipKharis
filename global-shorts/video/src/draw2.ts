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
    up: L(-w / 2, top + h * 0.4, -w / 2 - 24, top + h * 0.05, 10) + L(w / 2, top + h * 0.4, w / 2 + 24, top + h * 0.05, 10)};
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
