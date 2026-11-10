// Ternyata Leluhur: 3D diorama engine (three.js r149, classic build in vendor/).
// The page has <canvas id="c"> (2D composite that render.js grabs) and this file creates
// a hidden WebGL canvas. An episode file defines  function scene(t)  and uses the API
// below; renderFrame(t) is deterministic for any t (stills can jump anywhere).
//
// Episode pattern (see tl00.js):
//   const H1 = makeChar({...});  const RUMAH = build('rumah', () => rumahPanggung({...}));
//   function scene(t) {
//     const k = sceneIndex(t);                 // which beat / cut we are in
//     show(RUMAH); cast(H1);                   // what is visible this frame
//     pose(H1, t, {x:0, z:0, expr:'talk', talk:true});
//     shot(t, CUT[k], CUT[k+1], [0,1.4,4], [0,0.9,0]);   // slow push-in camera
//     chip('TIDAK DITANAM', 540, 300, t0);     // 2D overlays (queued, drawn after 3D)
//   }

const W = 1080, H = 1920, FONT = "'Baloo 2', Montserrat";
// TL v3 "sinematik": rounded Baloo 2 is loaded by the engine itself (episode pages only need Montserrat as fallback)
window.prepare = async () => {
  for (const [w, f] of [['latin', 'U+0000-00FF,U+2000-206F'], ['latin-ext', 'U+0100-024F']]) { const F = new FontFace('Baloo 2', `url(vendor/baloo-2-${w}-800-normal.woff2)`, { weight: '800', unicodeRange: f }); document.fonts.add(await F.load()); }
  await document.fonts.ready;
};
const OL = '#17120F';
const cv = document.getElementById('c'), g = cv.getContext('2d');

// ── math ──────────────────────────────────────────────────────
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = k => k * k * (3 - 2 * k);
const easeOut = k => 1 - Math.pow(1 - k, 3);
const back = k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp3 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));

// ── VO timing (same helpers as Mas Kharis story.js) ───────────
const WORDS = VO.words;
const DURATION = Math.round((VO.duration + 0.8) * 10) / 10;
const norm = s => s.toLowerCase().replace(/[^a-z0-9-]/g, '');
function at(txt, n = 0) {
  let c = 0;
  for (const w of WORDS) if (norm(w.w) === norm(txt)) { if (c === n) return w.s; c++; }
  throw new Error('VO word not found: ' + txt + ' #' + n);
}
function atEnd(txt, n = 0) {
  let c = 0;
  for (const w of WORDS) if (norm(w.w) === norm(txt)) { if (c === n) return w.e; c++; }
  throw new Error('VO word not found: ' + txt + ' #' + n);
}
const NSEC = Math.max(...WORDS.map(w => w.sec)) + 1;
const secS = [...Array(NSEC)].map((_, i) => WORDS.find(w => w.sec === i).s);
const secE = [...Array(NSEC)].map((_, i) => WORDS.filter(w => w.sec === i).pop().e);
const CUT = [0, ...secS.slice(1).map((s, i) => (secE[i] + s) / 2), DURATION];
const beatOf = t => { let k = 0; for (let i = 0; i < NSEC; i++) if (t >= CUT[i]) k = i; return k; };
// a word is being spoken now → mouth flaps (≈ syllables)
function mouthOpen(t) {
  for (const w of WORDS) if (t >= w.s - 0.02 && t <= w.e + 0.02) {
    const syl = Math.max(1, (w.w.match(/[aiueo]+/gi) || []).length);
    const k = seg(t, w.s, w.e);
    return 0.25 + 0.75 * Math.abs(Math.sin(k * Math.PI * syl));
  }
  return 0;
}

// ── three setup ───────────────────────────────────────────────
const glc = document.createElement('canvas'); glc.width = W; glc.height = H;
const R = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
R.setPixelRatio(1); R.setSize(W, H, false);
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
const SCN = new THREE.Scene();
const CAM = new THREE.PerspectiveCamera(54, W / H, 0.05, 200);
const HEMI = new THREE.HemisphereLight(0xffffff, 0x9c8a6c, 0.48); SCN.add(HEMI);
const AMB = new THREE.AmbientLight(0xffffff, 0.16); SCN.add(AMB);
const SUN = new THREE.DirectionalLight(0xfff0d8, 0.55);
SUN.castShadow = true; SUN.shadow.mapSize.set(2048, 2048);
Object.assign(SUN.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 0.5, far: 40 });
SUN.shadow.bias = -0.0006; SUN.shadow.normalBias = 0.02; SUN.shadow.radius = 4;
SCN.add(SUN); SCN.add(SUN.target);
const SUN_DIR = V3(4, 9, 5).normalize();

// sky presets: [top, bottom]
const SKY = {
  pantai: ['#4C93C9', '#F1E3C8'], desa: ['#5E9CCB', '#F3E4C6'], sore: ['#F08A5D', '#FFD9A0'],
  malam: ['#0F1838', '#2C3D73'], dalam: ['#C9A777', '#E9D3AE'], lab: ['#BFE4EC', '#EEF8FA'],
};
const skyCache = {};
function sky(name) {
  const key = Array.isArray(name) ? name.join() : name;
  if (!skyCache[key]) {
    const [a, b] = Array.isArray(name) ? name : SKY[name];
    const c = document.createElement('canvas'); c.width = 4; c.height = 256;
    const x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, a); gr.addColorStop(1, b); x.fillStyle = gr; x.fillRect(0, 0, 4, 256);
    skyCache[key] = { tex: new THREE.CanvasTexture(c), fog: new THREE.Color(b) };
  }
  SCN.background = skyCache[key].tex;
  SCN.fog = new THREE.Fog(skyCache[key].fog, 18, 60);
}
// lighting mood: 'siang' (default), 'sore', 'malam', 'dalam'
function mood(m) {
  const L = {
    siang: [0xdfe8ff, 0.42, 0.12, 0xffe2b8, 0.78], sore: [0xffd8b0, 0.36, 0.12, 0xff9f55, 0.82],
    malam: [0x5f70b0, 0.32, 0.1, 0x9fb2ff, 0.25], dalam: [0xfff0dc, 0.5, 0.24, 0xffd9a0, 0.5],
  }[m || 'siang'];
  HEMI.color.setHex(L[0]); HEMI.intensity = L[1]; AMB.intensity = L[2]; SUN.color.setHex(L[3]); SUN.intensity = L[4];
}

// ── materials & primitives ────────────────────────────────────
const matCache = {};
function mat(col, o = {}) {
  if (MATMODE === 'toon' && !o.basic) return toonMat(col, o);
  const key = col + JSON.stringify(o, (k, v) => (v && v.isTexture ? v.uuid : v));
  if (!matCache[key]) {
    matCache[key] = o.basic
      ? new THREE.MeshBasicMaterial({ color: col, transparent: o.opacity != null, opacity: o.opacity ?? 1, map: o.map || null, side: o.side || THREE.FrontSide, depthWrite: o.opacity == null })
      : new THREE.MeshStandardMaterial({ color: col, roughness: o.rough ?? 0.85, metalness: 0, map: o.map || null, emissive: o.emissive || 0x000000, emissiveIntensity: o.ei ?? 1, transparent: o.opacity != null, opacity: o.opacity ?? 1, side: o.side || THREE.FrontSide, flatShading: !!o.flat });
  }
  return matCache[key];
}
const olCache = {};
function olMat(w) {
  if (!olCache[w]) olCache[w] = new THREE.ShaderMaterial({
    uniforms: { w: { value: w } }, side: THREE.BackSide,
    vertexShader: 'uniform float w; void main(){ vec3 p = position + normal * w; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
    fragmentShader: 'void main(){ gl_FragColor = vec4(0.09, 0.07, 0.06, 1.0); }',
  });
  return olCache[w];
}
function mesh(geo, m, o = {}) {
  const me = new THREE.Mesh(geo, typeof m === 'string' || typeof m === 'number' ? mat(m) : m);
  me.castShadow = o.cast !== false; me.receiveShadow = o.recv !== false;
  if (o.ol) me.add(new THREE.Mesh(geo, olMat(o.ol)));
  return me;
}
const at3 = (obj, x, y, z, rx = 0, ry = 0, rz = 0) => { obj.position.set(x, y, z); obj.rotation.set(rx, ry, rz); return obj; };
const box = (w, h, d, c, o) => mesh(new THREE.BoxGeometry(w, h, d), c, o);
const rbox = (w, h, d, c, o) => mesh(roundBoxGeo(w, h, d, Math.min(w, h, d) * 0.18), c, o);
const sph = (r, c, o, ws = 32, hs = 20) => mesh(new THREE.SphereGeometry(r, ws, hs), c, o);
const cyl = (rt, rb, h, c, o, s = 24) => mesh(new THREE.CylinderGeometry(rt, rb, h, s), c, o);
const capsule = (r, len, c, o) => mesh(new THREE.CapsuleGeometry(r, len, 8, 20), c, o);
const cone = (r, h, c, o, s = 24) => mesh(new THREE.ConeGeometry(r, h, s), c, o);
const torus = (r, tube, c, arc = Math.PI * 2, o) => mesh(new THREE.TorusGeometry(r, tube, 10, 32, arc), c, o);
const grp = (...kids) => { const G = new THREE.Group(); kids.forEach(k => k && G.add(k)); return G; };
function roundBoxGeo(w, h, d, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const geo = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r * 0.6, bevelEnabled: true, bevelSize: r * 0.6, bevelThickness: r * 0.6, bevelSegments: 3, curveSegments: 6 });
  geo.translate(0, 0, -(d - 2 * r * 0.6) / 2); return geo;
}

// ── canvas textures ───────────────────────────────────────────
const texCache = {};
function canvasTex(key, w, h, draw, rep) {
  if (!texCache[key]) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const tx = new THREE.CanvasTexture(c); tx.anisotropy = 8;
    if (rep) { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(rep[0], rep[1]); }
    texCache[key] = tx;
  }
  return texCache[key];
}
const PAT = {
  // Nusantara textiles + realistic ground textures (TL v3)
  kawung: (a, b) => canvasTex('kawung' + a + b, 128, 128, (x, w, h) => { x.fillStyle = a; x.fillRect(0, 0, w, h); x.fillStyle = b;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const u = i * 64, v = j * 64; [[0, -16], [16, 0], [0, 16], [-16, 0]].forEach(([dx, dy]) => { x.beginPath(); x.ellipse(u + dx, v + dy, dy ? 9 : 14, dy ? 14 : 9, 0, 0, 7); x.fill(); }); x.fillStyle = a; x.beginPath(); x.arc(u, v, 3, 0, 7); x.fill(); x.fillStyle = b; } }, [3, 3]),
  parang: (a, b) => canvasTex('parang' + a + b, 128, 128, (x, w, h) => { x.fillStyle = a; x.fillRect(0, 0, w, h); x.strokeStyle = b; x.lineWidth = 9;
    for (let i = -2; i < 4; i++) { x.beginPath(); for (let k = 0; k <= 8; k++) { const u = i * 48 + k * 16, v = k * 16; x.lineTo(u + Math.sin(k * 1.6) * 6, v); } x.stroke(); }
    x.fillStyle = b; for (let i = -2; i < 4; i++) for (let k = 0; k < 4; k++) { x.beginPath(); x.arc(i * 48 + 24 + k * 32, k * 32 + 12, 4, 0, 7); x.fill(); } }, [3, 3]),
  lurik: (a, b) => canvasTex('lurik' + a + b, 64, 64, (x, w, h) => { x.fillStyle = a; x.fillRect(0, 0, w, h); x.fillStyle = b; [4, 10, 13, 30, 36, 39, 52].forEach((u, i) => x.fillRect(u, 0, i % 3 ? 2 : 4, h)); }, [5, 1]),
  tenun: (a, b) => canvasTex('tenun' + a + b, 128, 128, (x, w, h) => { x.fillStyle = a; x.fillRect(0, 0, w, h); x.fillStyle = b;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const u = c * 32 + 16, v = r * 32 + 16; x.beginPath(); x.moveTo(u, v - 12); x.lineTo(u + 12, v); x.lineTo(u, v + 12); x.lineTo(u - 12, v); x.closePath(); x.fill(); x.fillStyle = a; x.fillRect(u - 3, v - 3, 6, 6); x.fillStyle = b; }
    x.fillRect(0, 0, w, 4); x.fillRect(0, 62, w, 4); }, [3, 3]),
  batik: (a, b) => canvasTex('batik' + a + b, 128, 128, (x, w, h) => { x.fillStyle = a; x.fillRect(0, 0, w, h); x.strokeStyle = b; x.fillStyle = b; x.lineWidth = 4;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const u = 32 + i * 64, v = 32 + j * 64; for (let k = 0; k < 6; k++) { const an = k / 6 * Math.PI * 2; x.beginPath(); x.ellipse(u + Math.cos(an) * 13, v + Math.sin(an) * 13, 9, 4, an, 0, 7); x.fill(); } x.beginPath(); x.arc(u, v, 5, 0, 7); x.stroke(); }
    for (let k = 0; k < 30; k++) { x.fillRect(rnd(k) * w, rnd(k + 3) * h, 2.5, 2.5); } }, [3, 3]),
  kotak: (a, b) => canvasTex('kotak' + a + b, 64, 64, (x, w, h) => { x.fillStyle = a; x.fillRect(0, 0, w, h); x.fillStyle = b; x.globalAlpha = 0.6; for (let i = 0; i < 4; i++) { x.fillRect(i * 16, 0, 6, h); x.fillRect(0, i * 16, w, 6); } x.globalAlpha = 0.3; x.fillStyle = '#fff'; for (let i = 0; i < 4; i++) x.fillRect(i * 16 + 10, 0, 2, h); }, [4, 2]),
  genteng: (a, b) => canvasTex('genteng' + a + b, 128, 128, (x, w, h) => { x.fillStyle = b; x.fillRect(0, 0, w, h);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) { const u = c * 22 + (r % 2 ? 11 : 0), v = r * 22; const gr = x.createLinearGradient(0, v, 0, v + 22); gr.addColorStop(0, a); gr.addColorStop(1, b); x.fillStyle = gr; x.beginPath(); x.moveTo(u, v); x.lineTo(u + 20, v); x.quadraticCurveTo(u + 20, v + 22, u + 10, v + 21); x.quadraticCurveTo(u, v + 22, u, v); x.fill(); } }, [6, 4]),
  rumput2: (a, b) => canvasTex('rumput2' + a + b, 256, 256, (x, w, h) => { x.fillStyle = a; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const u = rnd(i) * w, v = rnd(i + 7) * h, l = 4 + rnd(i + 3) * 9; x.strokeStyle = rnd(i + 1) > 0.5 ? b : 'rgba(255,255,230,.18)'; x.globalAlpha = 0.5 + rnd(i + 2) * 0.5; x.lineWidth = 1.5; x.beginPath(); x.moveTo(u, v); x.lineTo(u + (rnd(i + 5) - 0.5) * 4, v - l); x.stroke(); }
    x.globalAlpha = 0.18; for (let i = 0; i < 40; i++) { x.fillStyle = rnd(i) > 0.5 ? '#3A5A28' : '#9DB070'; x.beginPath(); x.ellipse(rnd(i * 3) * w, rnd(i * 5) * h, 12 + rnd(i) * 20, 8 + rnd(i + 1) * 12, 0, 0, 7); x.fill(); } }, [10, 10]),
  kerikil: (a, b) => canvasTex('kerikil' + a + b, 256, 256, (x, w, h) => { x.fillStyle = a; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 520; i++) { const u = rnd(i) * w, v = rnd(i + 9) * h, r = 2 + rnd(i + 4) * 5; const c = ['#8E8A82', '#B4A48A', '#6E665C', '#C9B898', '#7A6A58', '#A39C90'][i % 6]; x.fillStyle = c; x.beginPath(); x.ellipse(u, v, r * 1.3, r, rnd(i) * 3, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.25)'; x.beginPath(); x.ellipse(u - r * 0.3, v - r * 0.3, r * 0.5, r * 0.3, 0, 0, 7); x.fill(); }
    x.globalAlpha = 0.25; x.fillStyle = b; for (let i = 0; i < 30; i++) { x.beginPath(); x.ellipse(rnd(i * 2) * w, rnd(i * 3) * h, 20 + rnd(i) * 25, 12 + rnd(i) * 14, 0, 0, 7); x.fill(); } }, [10, 10]),
  plaid: (a, b) => canvasTex('plaid' + a + b, 128, 128, (x, w, h) => {
    x.fillStyle = a; x.fillRect(0, 0, w, h); x.fillStyle = b; x.globalAlpha = 0.55;
    for (let i = 0; i < 4; i++) { x.fillRect(i * 32 + 4, 0, 10, h); x.fillRect(0, i * 32 + 4, w, 10); }
    x.globalAlpha = 0.25; x.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { x.fillRect(i * 32 + 20, 0, 3, h); x.fillRect(0, i * 32 + 20, w, 3); }
  }, [3, 3]),
  stripe: (a, b) => canvasTex('stripe' + a + b, 64, 64, (x, w, h) => { x.fillStyle = a; x.fillRect(0, 0, w, h); x.fillStyle = b; x.fillRect(0, 0, w, 22); }, [1, 5]),
  dots: (a, b) => canvasTex('dots' + a + b, 64, 64, (x, w, h) => {
    x.fillStyle = a; x.fillRect(0, 0, w, h); x.fillStyle = b;
    [[16, 16], [48, 48]].forEach(([u, v]) => { x.beginPath(); x.arc(u, v, 7, 0, 7); x.fill(); });
  }, [4, 4]),
  gold: (a, b) => canvasTex('gold' + a + b, 128, 128, (x, w, h) => {
    x.fillStyle = a; x.fillRect(0, 0, w, h); x.strokeStyle = b; x.lineWidth = 5;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const u = 32 + i * 64, v = 32 + j * 64; x.beginPath(); x.moveTo(u, v - 18); x.lineTo(u + 18, v); x.lineTo(u, v + 18); x.lineTo(u - 18, v); x.closePath(); x.stroke();
      x.beginPath(); x.arc(u, v, 4, 0, 7); x.fillStyle = b; x.fill();
    }
  }, [3, 3]),
  weave: (a, b) => canvasTex('weave' + a + b, 128, 128, (x, w, h) => {
    x.fillStyle = a; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      x.fillStyle = (i + j) % 2 ? b : a; const hor = (i + j) % 2;
      x.fillRect(i * 16 + (hor ? 0 : 3), j * 16 + (hor ? 3 : 0), hor ? 16 : 10, hor ? 10 : 16);
    }
    x.strokeStyle = 'rgba(0,0,0,0.18)'; x.lineWidth = 1.5; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * 16, 0); x.lineTo(i * 16, h); x.moveTo(0, i * 16); x.lineTo(w, i * 16); x.stroke(); }
  }, [4, 3]),
  planks: (a, b) => canvasTex('planks' + a + b, 128, 128, (x, w, h) => {
    x.fillStyle = a; x.fillRect(0, 0, w, h); x.strokeStyle = b; x.lineWidth = 4;
    for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32, h); x.stroke(); }
    x.globalAlpha = 0.25; for (let i = 0; i < 18; i++) { x.beginPath(); const u = rnd(i) * w; x.moveTo(u, rnd(i + 3) * h); x.lineTo(u + 2, rnd(i + 3) * h + 30); x.stroke(); }
  }, [3, 2]),
  speckle: (a, b) => canvasTex('speckle' + a + b, 256, 256, (x, w, h) => {
    x.fillStyle = a; x.fillRect(0, 0, w, h); x.fillStyle = b;
    for (let i = 0; i < 700; i++) { x.globalAlpha = 0.25 + rnd(i) * 0.4; x.fillRect(rnd(i * 2) * w, rnd(i * 3 + 1) * h, 2 + rnd(i) * 3, 2 + rnd(i * 5) * 3); }
  }, [10, 10]),
};
function texMat(kind, a, b, rep) {
  const tx = PAT[kind](a, b);
  if (rep) { const t2 = tx.clone(); t2.needsUpdate = true; t2.repeat.set(rep[0], rep[1]); return mat('#ffffff', { map: t2 }); }
  return mat('#ffffff', { map: tx });
}
// text panel texture (boards, signs, cards in 3D)
function textTex(key, lines, o = {}) {
  return canvasTex('txt' + key, o.w || 512, o.h || 320, (x, w, h) => {
    x.fillStyle = o.bg || '#1E5A45'; x.fillRect(0, 0, w, h);
    x.fillStyle = o.fg || '#FFF7E6'; x.textAlign = 'center'; x.textBaseline = 'middle';
    const n = lines.length, size = o.size || Math.min(90, h / (n + 0.6));
    lines.forEach((L, i) => { x.font = `900 ${size}px ${FONT}`; x.fillStyle = (o.hi && o.hi.includes(i)) ? '#FFD84A' : (o.fg || '#FFF7E6'); x.fillText(L, w / 2, h / 2 + (i - (n - 1) / 2) * size * 1.15); });
  });
}

// ── build cache & per-frame visibility ────────────────────────
const SETS = {};          // name -> Group (environment pieces)
const UPD = [];           // per-frame animators: fn(t) of visible objects
function build(name, fn) { if (!SETS[name]) { const G = fn(); G.visible = false; G.name = name; SCN.add(G); SETS[name] = G; } return SETS[name]; }
function show(...gs) { gs.forEach(G => { G.visible = true; }); }
let CHARS = [];
function cast(...cs) { cs.forEach(c => { c.visible = true; }); }
let PROPS = [];
function prop(obj) { PROPS.push(obj); obj.visible = false; SCN.add(obj); return obj; }
function place(obj, x, y, z, ry = 0, s = 1) { obj.visible = true; obj.position.set(x, y, z); obj.rotation.set(0, ry, 0); obj.scale.setScalar(s); return obj; }

// ── characters (TL v3 "sinematik"): big round head, cel-shaded toon skin & clothes, thick ink outline,
//    ears + nose, shirt collar / buttons / pocket, Nusantara textile patterns (kawung, parang, lurik, tenun, batik)
// o: {skin, shirt, pattern:'plaid|stripe|dots|gold|kawung|parang|lurik|tenun|batik', pat2, pants, sarung, hair:'none|short|white|grey|bun|black',
//     beard, mustache, hat:'headband|straw|peci|kerudung|cap|caping|blangkon', hatCol, glasses, kid, fat, sandal, collar:false}
const SKIN = '#B87A4B', PINK = '#E58A72';
var MATMODE = null;                         // 'toon' while a character is being built (see mat())
const TOON_RAMP = (() => { const d = new Uint8Array([150, 150, 150, 255, 205, 205, 205, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toonCache = {};
function toonMat(col, o = {}) {
  const key = col + (o.map ? o.map.uuid : '') + (o.opacity ?? '') + (o.side || '');
  if (!toonCache[key]) toonCache[key] = new THREE.MeshToonMaterial({ color: col, gradientMap: TOON_RAMP, map: o.map || null, transparent: o.opacity != null, opacity: o.opacity ?? 1, side: o.side || THREE.FrontSide });
  return toonCache[key];
}
function makeChar(o = {}) {
  MATMODE = 'toon';
  const C = new THREE.Group(); C.userData.o = o; C.visible = false; SCN.add(C); CHARS.push(C);
  const s = o.kid ? 0.78 : 1, skin = o.skin || SKIN, ol = 0.02;
  const root = new THREE.Group(); C.add(root); root.scale.setScalar(s); C.userData.root = root;
  const fat = o.fat || 1;
  const shade = (c, k) => '#' + new THREE.Color(c).multiplyScalar(k).getHexString();
  // legs + sandals
  const legs = [-1, 1].map(sd => {
    const L = new THREE.Group(); at3(L, sd * 0.07 * fat, 0.16, 0);
    L.add(at3(cyl(0.05, 0.048, 0.14, o.pants || '#3A3F5C', { ol }), 0, -0.07, 0));
    L.add(at3(rbox(0.1, 0.04, 0.17, o.sandal || '#5A3A22', { ol }), 0, -0.145, 0.03));
    root.add(L); return L;
  });
  // body (clothes)
  const shirtMat = o.pattern ? texMat(o.pattern, o.shirt || '#1F5FBF', o.pat2 || '#ffffff') : mat(o.shirt || '#1F5FBF');
  const body = capsule(0.16, 0.15, shirtMat, { ol }); at3(body, 0, 0.36, 0); body.scale.set(fat, 1, fat * 0.9); root.add(body);
  if (o.sarung) { const sr = cyl(0.17 * fat, 0.2 * fat, 0.2, texMat('kotak', o.sarung, shade(o.sarung, 0.6)), { ol }); at3(sr, 0, 0.2, 0); sr.scale.z = 0.92; root.add(sr); }
  else { const pb = cyl(0.165 * fat, 0.165 * fat, 0.05, o.pants || '#3A3F5C'); at3(pb, 0, 0.215, 0); pb.scale.z = 0.92; root.add(pb); }
  // collar, buttons, pocket (front = +z)
  if (o.collar !== false && o.hat !== 'kerudung') {
    [-1, 1].forEach(sd => { const cl = rbox(0.1, 0.02, 0.07, shade(o.pattern ? (o.pat2 || '#ffffff') : (o.shirt || '#1F5FBF'), 0.95), { ol: 0.006 }); at3(cl, sd * 0.055, 0.5, 0.115, 0.5, sd * 0.5, sd * 0.35); root.add(cl); });
    [0.43, 0.36, 0.29].forEach(y => { const b = sph(0.011, '#F4EEDF', { cast: false }); at3(b, 0, y, 0.15 * fat + 0.004); root.add(b); });
    const pk = box(0.06, 0.05, 0.01, shade(o.shirt || '#1F5FBF', 0.82), { cast: false }); at3(pk, -0.075, 0.4, 0.14 * fat); root.add(pk);
  }
  // arms (pivot at shoulder)
  const arms = [-1, 1].map(sd => {
    const A = new THREE.Group(); at3(A, sd * 0.165 * fat, 0.5, 0);
    A.add(at3(capsule(0.046, 0.14, shirtMat, { ol }), 0, -0.09, 0));
    const hand = sph(0.052, skin, { ol }); at3(hand, 0, -0.2, 0); A.add(hand);
    const holder = new THREE.Group(); at3(holder, 0, -0.225, 0.02); A.add(holder);
    A.userData.holder = holder; root.add(A); return A;
  });
  // head: big & round (≈ body width × 2), ears, nose
  const head = new THREE.Group(); at3(head, 0, 0.86, 0); root.add(head);
  const HR = 0.33;
  head.add(sph(HR, skin, { ol: 0.026 }, 44, 30));
  const onHead = (obj, lat, lon, lift = 0) => {
    const d = V3(Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon));
    obj.position.copy(d.clone().multiplyScalar(HR + lift));
    obj.quaternion.setFromUnitVectors(V3(0, 0, 1), d); head.add(obj); return obj;
  };
  [-1, 1].forEach(sd => { const ear = sph(0.07, skin, { ol: 0.012 }, 16, 12); ear.scale.set(0.55, 1, 0.8); at3(ear, sd * HR * 0.98, -0.02, -0.02); head.add(ear); });
  const nose = sph(0.032, shade(skin, 0.88), { cast: false }); nose.scale.set(1.1, 0.8, 0.8); onHead(nose, -0.12, 0, -0.008);
  const eyes = [-1, 1].map(sd => {
    const E = new THREE.Group();
    const white = sph(0.062, '#FFFFFF', { cast: false, ol: 0.008 }); white.scale.set(0.9, 1.05, 0.4); white.visible = false; E.add(white);
    const ball = sph(0.054, OL, { cast: false }); ball.scale.set(0.78, 1.12, 0.45); E.add(ball);
    const hl = sph(0.017, '#ffffff', { cast: false }); at3(hl, 0.016, 0.024, 0.022); E.add(hl);
    const shut = torus(0.036, 0.011, OL, Math.PI, { cast: false }); shut.visible = false; E.add(shut);
    E.userData = { ball, hl, shut, white };
    return onHead(E, 0.07, sd * 0.34, -0.004);
  });
  const brows = [-1, 1].map(sd => { const B = new THREE.Group(); B.add(rbox(0.1, 0.028, 0.024, o.hair === 'white' || o.hair === 'grey' ? '#8E8A84' : OL, { cast: false })); return onHead(B, 0.33, sd * 0.34, 0.008); });
  [-1, 1].forEach(sd => { const ck = mesh(new THREE.CircleGeometry(0.046, 20), mat(PINK, { opacity: 0.55 }), { cast: false }); onHead(ck, -0.16, sd * 0.55, 0.003); });
  // mouth variants
  const mouth = new THREE.Group(); onHead(mouth, -0.34, 0, 0.002);
  const smile = torus(0.05, 0.012, OL, Math.PI, { cast: false }); smile.rotation.z = Math.PI; mouth.add(smile);
  const open = new THREE.Group();
  const cav = sph(0.055, '#5B1A1A', { cast: false }); cav.scale.set(1, 0.85, 0.35); open.add(cav);
  const tongue = sph(0.028, '#D9605F', { cast: false }); at3(tongue, 0, -0.024, 0.008); tongue.scale.set(1.2, 0.6, 0.4); open.add(tongue);
  open.add(at3(mesh(new THREE.TorusGeometry(0.055, 0.009, 8, 28), OL, { cast: false }), 0, 0, 0.004)).scale.set(1, 0.85, 1);
  mouth.add(open);
  const flat = rbox(0.07, 0.014, 0.012, OL, { cast: false }); mouth.add(flat);
  // hair / hats
  const hairCol = { white: '#EDEAE2', grey: '#A9A6A0', black: '#1E1A18', short: '#1E1A18' }[o.hair] || o.hairCol || '#1E1A18';
  if (o.hair && o.hair !== 'none' && o.hat !== 'kerudung') {
    const cap = mesh(new THREE.SphereGeometry(HR * 1.05, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.42), hairCol, { ol: 0.016 });
    cap.rotation.x = -0.3; head.add(cap);
    const fringe = mesh(new THREE.SphereGeometry(HR * 1.055, 30, 8, Math.PI * 0.62, Math.PI * 0.76, Math.PI * 0.2, Math.PI * 0.1), hairCol, {}); fringe.rotation.y = Math.PI; head.add(fringe);
    [-1, 1].forEach(sd => { const sb = rbox(0.05, 0.12, 0.08, hairCol, { cast: false }); at3(sb, sd * HR * 0.93, 0.07, 0.04); head.add(sb); });
    if (o.hair === 'bun') head.add(at3(sph(0.12, hairCol, { ol: 0.014 }), 0, 0.2, -0.24));
    if (o.hair === 'white' || o.hair === 'grey') [-1, 1].forEach(sd => head.add(at3(sph(0.075, hairCol, { ol: 0.012 }), sd * 0.3, 0.05, -0.05)));
  }
  if (o.beard) {
    const bd = mesh(new THREE.SphereGeometry(HR * 1.03, 32, 12, Math.PI / 2 - 0.8, 1.6, Math.PI * 0.7, Math.PI * 0.24), o.beardCol || hairCol, { ol: 0.012 });
    head.add(bd); mouth.position.multiplyScalar(1.04);
  }
  if (o.mustache) [-1, 1].forEach(sd => { const m = capsule(0.016, 0.05, o.beardCol || (o.beard ? hairCol : '#1E1A18'), { cast: false }); onHead(m, -0.2, sd * 0.09, 0.012); m.rotateZ(Math.PI / 2 + sd * 0.35); });
  if (o.glasses) {
    eyes.forEach((E, i) => { const r = torus(0.072, 0.01, OL, Math.PI * 2, { cast: false }); onHead(r, 0.07, (i ? 1 : -1) * 0.34, 0.035); });
    onHead(box(0.08, 0.012, 0.012, OL, { cast: false }), 0.09, 0, 0.035);
  }
  const hc = o.hatCol;
  if (o.hat === 'headband') {
    const hb = torus(Math.sqrt(HR * HR - 0.14 * 0.14) + 0.014, 0.035, hc || '#EE7A1F', Math.PI * 2, { ol: 0.01 }); at3(hb, 0, 0.14, 0, Math.PI / 2, 0, 0); head.add(hb);
    const knot = sph(0.05, hc || '#EE7A1F', { ol: 0.01 }); at3(knot, 0.07, 0.06, -0.32); head.add(knot);
  } else if (o.hat === 'straw' || o.hat === 'caping') {   // caping: wide conical farmer hat
    const sm = texMat('weave', hc || '#E2C26A', '#C9A44C', [8, 2]);
    head.add(at3(cone(0.62, 0.3, sm, { ol: 0.014 }, 40), 0, 0.33, 0));
  } else if (o.hat === 'peci') {
    head.add(at3(cyl(0.27, 0.29, 0.17, hc || '#1A1A1E', { ol: 0.014 }), 0, 0.27, -0.03, -0.16, 0, 0));
  } else if (o.hat === 'blangkon') {
    head.add(at3(mesh(new THREE.SphereGeometry(HR * 1.06, 32, 14, 0, Math.PI * 2, 0, Math.PI * 0.45), texMat('parang', hc || '#5A3A22', '#E8C27A'), { ol: 0.014 }), 0, 0.01, 0, -0.18, 0, 0));
    head.add(at3(sph(0.09, hc || '#5A3A22', { ol: 0.012 }), 0, 0.02, -0.34));
  } else if (o.hat === 'cap') {
    head.add(at3(mesh(new THREE.SphereGeometry(HR * 1.06, 32, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), hc || '#2E8B57', { ol: 0.012 }), 0, 0.01, 0, -0.2, 0, 0));
    head.add(at3(rbox(0.3, 0.03, 0.2, hc || '#2E8B57', { ol: 0.01 }), 0, 0.18, 0.31, -0.15, 0, 0));
  } else if (o.hat === 'kerudung') {
    const kc = hc || '#E9A92B';
    head.add(mesh(new THREE.SphereGeometry(HR * 1.08, 40, 26, Math.PI / 2 + 0.8, Math.PI * 2 - 1.6, 0, Math.PI), kc, { ol: 0.016 }));
    head.add(mesh(new THREE.SphereGeometry(HR * 1.08, 40, 12, 0, Math.PI * 2, 0, Math.PI * 0.27), kc, { ol: 0.016 }));
    const pin = sph(0.018, '#FFD84A', { cast: false }); at3(pin, 0, -HR * 0.92, HR * 0.42); head.add(pin);
    const drape = cyl(0.21, 0.3, 0.24, kc, { ol: 0.014 }); at3(drape, 0, 0.6, -0.02); root.add(drape);
  }
  // soft contact shadow
  const blob = mesh(new THREE.CircleGeometry(0.28 * fat, 24), mat('#000000', { basic: true, opacity: 0.2 }), { cast: false, recv: false });
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.004; root.add(blob);
  Object.assign(C.userData, { legs, arms, head, body, eyes, brows, mouth: { smile, open, flat, g: mouth }, s, fat, seed: CHARS.length * 1.7 });
  MATMODE = null;
  return C;
}

// arm presets: [shoulder rx (forward +), rz (out +)]
const ARMS = {
  down: [[0, 0.12], [0, 0.12]], hips: [[-0.3, 0.75], [-0.3, 0.75]], wave: [[0, 0.12], [0.2, 2.6]],
  point: [[0, 0.12], [-1.45, 0.15]], up: [[0, 2.7], [0, 2.7]], hold: [[-1.1, 0.25], [-1.1, 0.25]],
  carry: [[-0.6, 0.35], [-0.6, 0.35]], shrug: [[-0.5, 0.9], [-0.5, 0.9]], cheer: [[0.1, 2.4], [0.1, 2.4]],
  stir: [[0, 0.12], [-1.0, 0.3]], chin: [[0, 0.12], [-2.1, 0.45]], cross: [[-1.2, -0.35], [-1.2, -0.35]],
  pointL: [[-1.45, 0.15], [0, 0.12]], reach: [[-1.3, 0.2], [-1.3, 0.2]],
};
// pose(C, t, {x,y,z,ry, walk, run, arms:'preset'|[[rx,rz],[rx,rz]], expr, talk, look, tilt, lean, jump, shake})
// expr: smile | talk | happy (eyes ^) | shock | angry | worried | laugh | closed | flat
function pose(C, t, o = {}) {
  const U = C.userData; C.visible = true;
  const sp = o.run ? 15 : 9, ph = (o.walk || o.run) ? t * sp : 0, mv = (o.walk || o.run) ? (o.run ? 0.75 : 0.45) : 0;
  let bob = Math.abs(Math.sin(ph)) * 0.035 * (mv ? 1 : 0) + Math.sin(t * 2.2 + U.seed) * 0.006;
  if (o.jump) bob += Math.max(0, Math.sin(seg(t, o.jump[0], o.jump[0] + 0.45) * Math.PI)) * 0.28;
  C.position.set(o.x || 0, (o.y || 0) + bob, o.z || 0);
  C.rotation.set(0, o.ry || 0, 0);
  C.scale.setScalar(o.s || 1);
  U.legs.forEach((L, i) => { L.rotation.x = Math.sin(ph + i * Math.PI) * mv; });
  let A = typeof o.arms === 'string' ? ARMS[o.arms] : (o.arms || ARMS.down);
  U.arms.forEach((Ar, i) => {
    const sd = i ? 1 : -1; let [rx, rz] = A[i];
    if (mv && (!o.arms || o.arms === 'down')) rx = Math.sin(ph + i * Math.PI + Math.PI) * mv * 0.9;
    if (o.arms === 'wave' && i === 1) rz += Math.sin(t * 12) * 0.3;
    if (o.arms === 'stir' && i === 1) { rx += Math.sin(t * 5) * 0.25; rz += Math.cos(t * 5) * 0.2; }
    Ar.rotation.set(-rx, 0, sd * rz);
  });
  const laugh = o.expr === 'laugh';
  U.body.rotation.z = laugh ? Math.sin(t * 34) * 0.05 : 0;
  C.userData.root.rotation.x = o.lean || 0;
  C.userData.root.rotation.z = (laugh ? Math.sin(t * 34) * 0.04 : 0) + (o.shake ? Math.sin(t * 50) * 0.05 * o.shake : 0);
  U.head.rotation.set(o.nod ? Math.sin(t * 6) * 0.1 : (laugh ? -0.15 : 0), o.look || 0, o.tilt || 0);
  // face
  const e = o.expr || 'smile';
  const blinkK = ((t + U.seed * 1.3) % 3.4) < 0.12;
  const happyEyes = e === 'happy' || e === 'laugh', shut = e === 'closed' || blinkK;
  U.eyes.forEach(E => {
    const d = E.userData;
    d.ball.visible = d.hl.visible = !happyEyes && !shut;
    d.shut.visible = happyEyes || shut;
    d.shut.rotation.z = happyEyes ? 0 : Math.PI;
    d.ball.scale.set(e === 'shock' ? 0.5 : 0.78, e === 'shock' ? 0.62 : 1.12, 0.45);
    if (d.white) { d.white.visible = e === 'shock' && !shut; d.ball.position.z = d.hl.position.z = e === 'shock' ? 0.03 : 0; d.hl.position.z += 0.022; }
  });
  U.brows.forEach((B, i) => {
    const sd = i ? 1 : -1;
    B.position.y = (B.userData.y0 ??= B.position.y) + (e === 'shock' ? 0.04 : e === 'angry' ? -0.012 : 0);
    B.children[0].rotation.z = e === 'angry' ? sd * 0.45 : e === 'worried' ? -sd * 0.4 : 0;
  });
  const mo = o.talk ? mouthOpen(t) : 0, M = U.mouth;
  const isOpen = e === 'shock' || laugh || mo > 0;
  M.open.visible = isOpen; M.smile.visible = !isOpen && e !== 'flat' && e !== 'angry' && e !== 'worried'; M.flat.visible = !isOpen && !M.smile.visible;
  M.open.scale.set(e === 'shock' ? 0.8 : 1, e === 'shock' ? 1.25 : laugh ? 0.85 + Math.abs(Math.sin(t * 17)) * 0.3 : 0.25 + mo * 0.8, 1);
  return C;
}
const hold = (C, side, obj) => { const H = C.userData.arms[side === 'L' ? 0 : 1].userData.holder; H.add(obj); obj.visible = true; return obj; };

// ── environment builders ──────────────────────────────────────
function ground(kind = 'rumput', size = 60) {
  const k = { rumput: ['#6F9548', '#4E7334'], pasir: ['#D9BE8C', '#B89D70'], tanah: ['#A88560', '#7E6244'], lantai: ['#A87E52', '#7E5A36'], lab: ['#E2E6E4', '#C2CBCB'], kerikil: ['#9C8E78', '#6E6252'] }[kind];
  const m = kind === 'lantai' ? texMat('planks', k[0], k[1], [size / 2, size / 2]) : kind === 'rumput' ? texMat('rumput2', k[0], k[1], [size / 3, size / 3]) : kind === 'lab' ? texMat('speckle', k[0], k[1], [size / 4, size / 4]) : texMat('kerikil', k[0], k[1], [size / 3, size / 3]);
  return flat(size, size, m);
}
function path(w, len, col = '#B0916A') { return flat(w, len, texMat('kerikil', col, '#7E6244', [w / 1.5, len / 3]), 0.005); }
// horizontal plane wrapped in a group, so at3()/place() can move it without undoing the -90° tilt
function flat(w, d, m, y = 0) { const P = mesh(new THREE.PlaneGeometry(w, d), m, { cast: false }); P.rotation.x = -Math.PI / 2; P.position.y = y; return grp(P); }
function tree(h = 2.2, col = '#3AA951') {
  const T = grp(at3(cyl(0.09, 0.13, h * 0.55, '#7A4E27', { ol: 0.01 }), 0, h * 0.27, 0));
  [[0, 0.7, 0, 0.62], [0.35, 0.58, 0.1, 0.45], [-0.32, 0.6, -0.05, 0.48], [0.05, 0.9, -0.1, 0.42]].forEach(([x, y, z, r], i) =>
    T.add(at3(sph(r * h / 2.2, i % 2 ? col : '#2F9B48', { ol: 0.012 }, 20, 14), x * h / 2.2, y * h, z)));
  return T;
}
function bush(r = 0.35, col = '#3AA951') { return grp(...[[0, 0, 0, 1], [0.3, -0.05, 0.05, 0.75], [-0.3, -0.05, 0, 0.8]].map(([x, y, z, k]) => at3(sph(r * k, col, { ol: 0.01 }, 16, 12), x * r * 2, r * k * 0.8 + y, z))); }
function palm(h = 3.2, lean = 0.25) {
  const T = new THREE.Group(); let x = 0, y = 0;
  for (let i = 0; i < 7; i++) { const sgm = cyl(0.09, 0.11, h / 7 + 0.02, i % 2 ? '#8A6239' : '#7A5430', { ol: 0.008 }, 12); x = Math.sin(i / 6 * lean * 2) * i * h / 7 * 0.25; y = i * h / 7 + h / 14; at3(sgm, x, y, 0, 0, 0, -lean * i / 6); T.add(sgm); }
  const top = V3(x + 0.05, h, 0);
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2, leaf = sph(0.5, i % 2 ? '#3AA951' : '#2F9B48', { ol: 0.008 }, 12, 8);
    leaf.scale.set(1.25, 0.06, 0.32); leaf.position.copy(top).add(V3(Math.cos(a) * 0.55, -0.15, Math.sin(a) * 0.55));
    leaf.rotation.set(0, -a, -0.45); T.add(leaf);
  }
  T.add(at3(sph(0.12, '#5A3C1E'), top.x, top.y - 0.05, 0.05));
  return T;
}
function hill(r = 4, h = 2, col = '#66B84F') { const M = sph(r, col, { recv: true }, 40, 20); M.scale.set(1, h / r, 0.8); return M; }
function cloud(s = 1) { const C = grp(...[[0, 0, 0.55], [0.55, -0.08, 0.42], [-0.55, -0.1, 0.45], [0.2, 0.25, 0.4]].map(([x, y, r]) => at3(sph(r * s, '#ffffff', { cast: false }, 16, 12), x * s, y * s, 0))); C.children.forEach(m => { m.material = mat('#ffffff', { emissive: 0xffffff, ei: 0.35 }); }); return C; }
function sea(w = 60, d = 30, col = '#25AFC6') {
  const geo = new THREE.PlaneGeometry(w, d, 60, 30); geo.rotateX(-Math.PI / 2);
  const M = mesh(geo, mat(col, { rough: 0.35 }), { cast: false });
  const base = geo.attributes.position.array.slice();
  M.userData.update = (t, amp = 0.06) => {
    const p = geo.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) p[i + 1] = base[i + 1] + Math.sin(base[i] * 0.9 + t * 1.6) * amp + Math.cos(base[i + 2] * 1.3 + t * 1.2) * amp * 0.7;
    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
  };
  return M;
}
function stone(r = 0.18, col = '#8E8A82') { const S = sph(r, col, { ol: 0.008 }, 12, 8); S.scale.set(1.15, 0.65, 1); S.material = mat(col, { flat: true }); return S; }
function gableRoof(w, d, h, col, over = 0.25) {
  // two slanted slabs + triangular gable ends
  const R0 = new THREE.Group(), half = d / 2 + over, slope = Math.hypot(half, h);
  const ang = Math.atan2(h, half);
  const gm = texMat('genteng', col, '#' + new THREE.Color(col).multiplyScalar(0.6).getHexString(), [Math.max(1, (w + over * 2) * 1.5), Math.max(1, slope * 1.5)]);
  [-1, 1].forEach(sd => { const sl = box(w + over * 2, 0.08, slope, gm, { ol: 0.01 }); at3(sl, 0, h / 2, sd * half / 2, sd * ang, 0, 0); R0.add(sl); });
  const sh = new THREE.Shape(); sh.moveTo(-d / 2, 0); sh.lineTo(d / 2, 0); sh.lineTo(0, h * (d / 2) / half); sh.closePath();
  [-1, 1].forEach(sd => { const gb = mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: false }), texMat('planks', '#9C6B3C', '#6E4A28', [2, 1])); gb.rotation.y = Math.PI / 2; gb.position.set(sd * (w / 2) - (sd > 0 ? 0.05 : 0), 0, 0); R0.add(gb); });
  return R0;
}
// rumah panggung: stilts on umpak stones (planted:false) or dug in (planted:true)
function rumahPanggung(o = {}) {
  const w = o.w || 3.2, d = o.d || 2.4, sh = o.stilt ?? 0.9, wh = o.wallH || 1.25;
  const G = new THREE.Group();
  const cols = o.cols || 3, rows = 2;
  const tiang = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const x = -w / 2 + 0.15 + i * (w - 0.3) / (cols - 1), z = -d / 2 + 0.15 + j * (d - 0.3);
    if (!o.planted) G.add(at3(stone(0.2, '#8E8A82'), x, 0.08, z));
    const P = cyl(0.075, 0.085, sh + (o.planted ? 0 : -0.1), '#6E4A28', { ol: 0.01 }, 10);
    at3(P, x, (o.planted ? sh / 2 : 0.13 + (sh - 0.1) / 2), z); G.add(P); tiang.push(P);
  }
  const floor = box(w + 0.2, 0.14, d + 0.2, '#7A5430', { ol: 0.01 }); at3(floor, 0, sh + 0.07, 0); G.add(floor);
  const wallMat = o.weave ? texMat('weave', '#C89A58', '#A77A3E', [w, wh]) : texMat('planks', o.wall || '#B07A45', '#7A5430', [w * 1.3, 1]);
  const walls = box(w, wh, d, wallMat, { ol: 0.012 }); at3(walls, 0, sh + 0.14 + wh / 2, 0); G.add(walls);
  // door + windows on the front (+z)
  G.add(at3(box(0.5, 0.85, 0.04, '#5A3C1E', { ol: 0.008 }), 0, sh + 0.14 + 0.43, d / 2 + 0.02));
  [-1, 1].forEach(sd => { G.add(at3(box(0.42, 0.34, 0.04, '#3A2A1C', { ol: 0.008 }), sd * w * 0.3, sh + 0.14 + wh * 0.6, d / 2 + 0.02)); G.add(at3(box(0.46, 0.05, 0.08, '#E8D2A6'), sd * w * 0.3, sh + 0.14 + wh * 0.6 - 0.2, d / 2 + 0.04)); });
  // ladder
  const lad = new THREE.Group(); [-1, 1].forEach(sd => lad.add(at3(box(0.05, sh * 1.25, 0.05, '#7A5430'), sd * 0.22, sh * 0.55, 0)));
  for (let i = 0; i < 4; i++) lad.add(at3(box(0.48, 0.035, 0.08, '#8A6239'), 0, 0.12 + i * sh / 4, 0));
  at3(lad, 0, 0, d / 2 + 0.35, -0.38, 0, 0); G.add(lad);
  const roof = o.gonjong ? gonjongRoof(w, d, o.roof || '#3A2A20') : gableRoof(w, d, 0.95, o.roof || '#6E3B23');
  roof.rotation.y = Math.PI / 2 * (o.gonjong ? 0 : 0); roof.position.y = sh + 0.14 + wh; G.add(roof);
  G.userData = { tiang, floorY: sh + 0.14, w, d };
  return G;
}
function gonjongRoof(w, d, col) {
  const R0 = gableRoof(w, d, 0.9, col, 0.3);
  const curve = new THREE.CatmullRomCurve3([V3(-w / 2 - 0.3, 0.95, 0), V3(-w / 4, 0.78, 0), V3(0, 0.74, 0), V3(w / 4, 0.78, 0), V3(w / 2 + 0.3, 0.95, 0)]);
  const ridge = mesh(new THREE.TubeGeometry(curve, 30, 0.07, 8), col, { ol: 0.01 }); R0.add(ridge);
  [-1, 1].forEach(sd => {
    const horn = new THREE.CatmullRomCurve3([V3(sd * (w / 2 + 0.2), 0.9, 0), V3(sd * (w / 2 + 0.55), 1.25, 0), V3(sd * (w / 2 + 0.7), 1.75, 0)]);
    const hm = mesh(new THREE.TubeGeometry(horn, 16, 0.08, 8), col, { ol: 0.01 }); R0.add(hm);
    R0.add(at3(cone(0.08, 0.3, '#C9A44C', { ol: 0.008 }, 10), sd * (w / 2 + 0.7), 1.9, 0));
  });
  return R0;
}
// concrete house (for "modern" contrast): box + flat roof
function rumahBeton(o = {}) {
  const w = o.w || 2.6, d = o.d || 2.2, h = o.h || 1.6;
  const G = grp(at3(box(w, h, d, o.col || '#D9D3C7', { ol: 0.012 }), 0, h / 2, 0), at3(box(w + 0.25, 0.15, d + 0.25, '#8C8C8C', { ol: 0.01 }), 0, h + 0.075, 0));
  G.add(at3(box(0.5, 0.9, 0.04, '#6D7B86', { ol: 0.008 }), -w * 0.2, 0.45, d / 2 + 0.02));
  G.add(at3(box(0.6, 0.45, 0.04, '#9FC6DA', { ol: 0.008 }), w * 0.22, h * 0.6, d / 2 + 0.02));
  return G;
}
// green board with wooden frame (text drawn as texture)
function board(key, lines, o = {}) {
  const w = o.w || 1.6, h = o.h || 1.0;
  const G = grp(at3(box(w + 0.12, h + 0.12, 0.06, '#7A4E27', { ol: 0.01 }), 0, 0, -0.03),
    at3(mesh(new THREE.PlaneGeometry(w, h), mat('#ffffff', { map: textTex(key, lines, { w: 512, h: Math.round(512 * h / w), bg: '#1E5A45', hi: o.hi }) }), { cast: false }), 0, 0, 0.005));
  if (o.legs !== false) [-1, 1].forEach(sd => G.add(at3(box(0.06, (o.legH || 1.0), 0.06, '#7A4E27'), sd * w * 0.4, -h / 2 - (o.legH || 1.0) / 2 + 0.05, -0.04)));
  return G;
}
// small props
const PROP = {
  ember: (c = '#2F7FD6') => grp(cyl(0.16, 0.12, 0.24, c, { ol: 0.01 }), at3(torus(0.13, 0.008, '#555', Math.PI), 0, 0.12, 0)),
  ikan: (c = '#8FB8C9') => { const f = sph(0.12, c, { ol: 0.008 }, 16, 10); f.scale.set(1.6, 0.7, 0.45); const tl = cone(0.07, 0.12, c, { ol: 0.008 }, 6); at3(tl, -0.22, 0, 0, 0, 0, Math.PI / 2); return grp(f, tl, at3(sph(0.018, OL), 0.12, 0.03, 0.045)); },
  kuali: (fill) => { const k = mesh(new THREE.SphereGeometry(0.4, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat('#2A2A2E', { side: THREE.DoubleSide }), { ol: 0.01 }); const G = grp(k); if (fill) { const f = cyl(0.36, 0.36, 0.02, fill); at3(f, 0, -0.12, 0); G.add(f); G.userData.fill = f; } return G; },
  sendok: () => grp(at3(cyl(0.015, 0.015, 0.6, '#8A6239'), 0, 0.3, 0), at3(sph(0.05, '#8A6239'), 0, 0, 0)),
  tungku: () => grp(at3(rbox(0.9, 0.5, 0.7, '#8E8A82', { ol: 0.01 }), 0, 0.25, 0), at3(box(0.4, 0.25, 0.05, '#2A1A12'), 0, 0.2, 0.34)),
  api: () => { const G = new THREE.Group(); for (let i = 0; i < 5; i++) { const f = cone(0.07 + rnd(i) * 0.05, 0.25 + rnd(i + 2) * 0.15, i % 2 ? '#FFD84A' : '#EE7A1F', { cast: false }, 8); f.material = mat(i % 2 ? '#FFD84A' : '#EE7A1F', { emissive: i % 2 ? 0xffc040 : 0xff6a10, ei: 1 }); at3(f, (i - 2) * 0.06, 0.12, rnd(i + 5) * 0.06); G.add(f); } G.userData.update = t => G.children.forEach((f, i) => { f.scale.y = 0.8 + Math.abs(Math.sin(t * 9 + i * 1.7)) * 0.45; }); return G; },
  rantang: () => grp(...[0, 1, 2].map(i => at3(cyl(0.12, 0.12, 0.1, i % 2 ? '#D33A2C' : '#E9D3AE', { ol: 0.008 }), 0, i * 0.105, 0)), at3(torus(0.08, 0.01, '#888', Math.PI), 0, 0.33, 0)),
  bungkusDaun: () => { const b = rbox(0.24, 0.12, 0.18, '#3AA951', { ol: 0.008 }); return grp(b, at3(box(0.26, 0.02, 0.02, '#C9A44C'), 0, 0.06, 0)); },
  kendi: () => { const k = sph(0.16, '#B5653A', { ol: 0.008 }, 20, 14); k.scale.y = 1.1; return grp(k, at3(cyl(0.04, 0.06, 0.12, '#B5653A', { ol: 0.008 }), 0, 0.2, 0)); },
  meja: (w = 1.2, d = 0.7, h = 0.6) => grp(at3(box(w, 0.06, d, '#8A6239', { ol: 0.01 }), 0, h, 0), ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => at3(box(0.06, h, 0.06, '#6E4A28'), a * (w / 2 - 0.06), h / 2, b * (d / 2 - 0.06)))),
  tikar: (w = 1.6, d = 1.2) => flat(w, d, texMat('weave', '#E2C26A', '#C9A44C', [w * 2, d * 2]), 0.01),
  lampu: () => { const G = grp(at3(cyl(0.08, 0.1, 0.2, '#FFE9A8', { cast: false }), 0, 0, 0)); G.children[0].material = mat('#FFE9A8', { emissive: 0xffd27a, ei: 1 }); const L = new THREE.PointLight(0xffc870, 0.9, 4); G.add(L); return G; },
  kalender: (key, big, small) => grp(at3(box(0.5, 0.62, 0.03, '#ffffff', { ol: 0.008 }), 0, 0, 0), at3(box(0.5, 0.14, 0.035, '#D5301F'), 0, 0.24, 0.005),
    at3(mesh(new THREE.PlaneGeometry(0.46, 0.44), mat('#ffffff', { map: textTex('kal' + key, [big, small].filter(Boolean), { w: 256, h: 256, bg: '#ffffff', fg: '#17120F', size: 70 }) }), { cast: false }), 0, -0.07, 0.02)),
  batu: () => stone(0.22),
  palu: () => grp(at3(cyl(0.02, 0.02, 0.35, '#8A6239'), 0, 0, 0), at3(box(0.14, 0.07, 0.07, '#666', { ol: 0.006 }), 0, 0.17, 0)),
  paku: () => grp(at3(cyl(0.012, 0.004, 0.18, '#B8B8C0'), 0, 0, 0), at3(cyl(0.03, 0.03, 0.01, '#B8B8C0'), 0, 0.09, 0)),
};

// ── camera ────────────────────────────────────────────────────
let SHAKE = 0, FOV0 = 50;
// closeUp(t, C, t0, t1, {side, dist, up, push, fov}): frames a character's FACE (the big-head look of TL v3).
//   side: angle around the face (0 = straight on, + = from the character's left), dist: metres from the head
function closeUp(t, C, t0, t1, o = {}) {
  C.updateMatrixWorld(true); const hp = new THREE.Vector3(); C.userData.head.getWorldPosition(hp);
  const a = C.rotation.y + (o.side ?? 0.35), d = (o.dist ?? 1.85) * C.scale.x, up = (o.up ?? 0.05) * C.scale.x;
  const eye = [hp.x + Math.sin(a) * d, hp.y + up, hp.z + Math.cos(a) * d], tg = [hp.x, hp.y - 0.16 * C.scale.x, hp.z];
  shot(t, t0, t1, eye, tg, { push: o.push ?? 0.1, drift: o.drift ?? 0.04, fov: o.fov || 40 });
}
// shot: from eye→eye2 looking target→target2 between t0..t1 (default: slow 12% push-in + slight drift)
function shot(t, t0, t1, eye, target, o = {}) {
  const k = ease(seg(t, t0, t1));
  const e2 = o.eye2 || eye.map((v, i) => v + (target[i] - v) * (o.push ?? 0.12) + (i === 0 ? (o.drift ?? 0.15) : 0));
  const tg2 = o.target2 || target;
  const E = lerp3(eye, e2, k), T = lerp3(target, tg2, k);
  CAM.fov = o.fov || FOV0; CAM.updateProjectionMatrix();
  const sh = (o.shake || 0) + SHAKE;
  CAM.position.set(E[0] + (sh ? (rnd(Math.floor(t * 30)) - 0.5) * sh : 0), E[1] + (sh ? (rnd(Math.floor(t * 30) + 9) - 0.5) * sh : 0), E[2]);
  CAM.lookAt(T[0], T[1], T[2]);
  // shadow box follows the subject
  SUN.target.position.set(T[0], 0, T[2]); SUN.position.copy(SUN.target.position).add(SUN_DIR.clone().multiplyScalar(14));
}

// ── 2D overlays (queued during scene(), drawn after the 3D frame) ──
let UI = [], SEPIA = 0, NOCAP = false, CAPY = 1320;
const ui = fn => UI.push(fn);
function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function strokeText(txt, x, y, size, col, sw) {
  g.font = `800 ${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.miterLimit = 2; g.strokeStyle = OL; g.lineWidth = sw ?? size * 0.22; g.strokeText(txt, x, y);
  g.fillStyle = col; g.fillText(txt, x, y);
}
function fitSize(txt, size, maxW) { g.font = `800 ${size}px ${FONT}`; const w = g.measureText(txt).width; return w > maxW ? Math.floor(size * maxW / w) : size; }
const SFX = [];   // audio cues collected for the mixer: {t, type}
const cue = (t, type, gain, d) => { if (!SFX.some(c => c.type === type && Math.abs(c.t - t) < 0.05)) SFX.push({ t: +t.toFixed(3), type, gain: gain ?? 1, d }); };
// chip: uppercase label with black frame; stamp-in at t0 (until t1)
function chip(txt, x, y, t0, o = {}) {
  cue(t0, o.stamp ? 'stamp' : 'pop');
  ui(t => {
    if (t < t0 || (o.t1 && t > o.t1)) return;
    const k = o.stamp ? 1 + 0.6 * (1 - easeOut(seg(t, t0, t0 + 0.18))) : back(seg(t, t0, t0 + 0.28));
    const size = fitSize(txt.toUpperCase(), o.size || 64, (o.maxW || 900) - 60);
    g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(k, k);
    g.font = `800 ${size}px ${FONT}`; const w = g.measureText(txt.toUpperCase()).width + size * 0.9, h = size * 1.45;
    g.shadowColor = 'rgba(20,12,6,.45)'; g.shadowBlur = 18; g.shadowOffsetY = 8;
    rr(-w / 2, -h / 2, w, h, h * 0.5); g.fillStyle = o.bg || '#F6E7C8'; g.fill(); g.shadowColor = 'transparent';
    g.lineWidth = 6; g.strokeStyle = OL; g.stroke(); rr(-w / 2 + 9, -h / 2 + 9, w - 18, h - 18, h * 0.4); g.lineWidth = 2; g.strokeStyle = 'rgba(122,74,30,.45)'; g.setLineDash([8, 7]); g.stroke(); g.setLineDash([]);
    g.fillStyle = o.fg || '#3A2414'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt.toUpperCase(), 0, size * 0.1);
    g.restore();
  });
}
// paper card (krem) with lines; first line bold title
function card(lines, x, y, t0, o = {}) {
  cue(t0, 'pop');
  ui(t => {
    if (t < t0 || (o.t1 && t > o.t1)) return;
    const k = back(seg(t, t0, t0 + 0.3)), size = o.size || 52, w = o.w || 760, h = size * 1.3 * lines.length + size * 0.9;
    g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.02); g.scale(k, k);
    g.shadowColor = 'rgba(20,12,6,.45)'; g.shadowBlur = 22; g.shadowOffsetY = 10;
    rr(-w / 2, -h / 2, w, h, 34); g.fillStyle = '#FFF8EA'; g.fill(); g.shadowColor = 'transparent'; g.lineWidth = 6; g.strokeStyle = OL; g.stroke();
    // speech-bubble tail
    g.beginPath(); g.moveTo(-40, h / 2 - 3); g.lineTo(-70, h / 2 + 46); g.lineTo(10, h / 2 - 3); g.closePath(); g.fillStyle = '#FFF8EA'; g.fill(); g.stroke(); g.fillRect(-44, h / 2 - 9, 58, 8);
    lines.forEach((L, i) => { const s2 = fitSize(L, i ? size * 0.85 : size, w - 70); g.font = `800 ${s2}px ${FONT}`; g.fillStyle = i ? '#3B2F27' : (o.titleCol || '#C7301F'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(L, 0, -h / 2 + size * 0.95 + i * size * 1.3); });
    g.restore();
  });
}
// big word (e.g. "SMONG!") — also hides the caption while shown
function bigWord(txt, t0, t1, o = {}) {
  cue(t0, 'stamp');
  ui(t => {
    if (t < t0 || t > t1) return;
    const k = 1 + 0.5 * (1 - easeOut(seg(t, t0, t0 + 0.2))), size = fitSize(txt, o.size || 190, 980);
    g.save(); g.translate(540 + (o.shake ? Math.sin(t * 60) * 6 : 0), o.y || 760); g.rotate(o.rot ?? -0.04); g.scale(k, k);
    g.shadowColor = 'rgba(20,12,6,.55)'; g.shadowBlur = 24; g.shadowOffsetY = 12; strokeText(txt, 0, 0, size, o.col || '#FFC23C', 26); g.shadowColor = 'transparent'; g.restore();
  });
  if (!bigWord.spans) bigWord.spans = []; if (!bigWord.spans.some(([a]) => a === t0)) bigWord.spans.push([t0, t1]);
}
// arrow pointing at a screen position
function arrow(x, y, ang, t0, t1, col = '#FFD84A') {
  ui(t => {
    if (t < t0 || (t1 && t > t1)) return;
    const k = back(seg(t, t0, t0 + 0.25)), bob = Math.sin(t * 8) * 10;
    g.save(); g.translate(x + Math.cos(ang) * bob, y + Math.sin(ang) * bob); g.rotate(ang); g.scale(k, k);
    g.beginPath(); g.moveTo(-110, -22); g.lineTo(-10, -22); g.lineTo(-10, -50); g.lineTo(50, 0); g.lineTo(-10, 50); g.lineTo(-10, 22); g.lineTo(-110, 22); g.closePath();
    g.fillStyle = col; g.fill(); g.lineWidth = 8; g.lineJoin = 'round'; g.strokeStyle = OL; g.stroke(); g.restore();
  });
}

// ── captions: word by word (sometimes 2 short words), keywords yellow ──
let KEYWORDS = new Set();
const CAPS = [];
{
  for (let i = 0; i < WORDS.length; i++) {
    const w = WORDS[i], n = WORDS[i + 1];
    const clean = s => s.replace(/[“”"]/g, '');
    if (n && n.sec === w.sec && clean(w.w).length <= 3 && clean(n.w).length <= 6 && !/[.,?!…:]$/.test(w.w) && n.s - w.e < 0.15) { CAPS.push({ txt: clean(w.w) + ' ' + clean(n.w), s: w.s, e: n.e, words: [w, n] }); i++; }
    else CAPS.push({ txt: clean(w.w), s: w.s, e: w.e, words: [w] });
  }
}
function drawCaption(t) {
  if (NOCAP || (bigWord.spans || []).some(([a, b]) => t >= a && t <= b)) return;
  let c = null;
  for (const C of CAPS) if (t >= C.s - 0.04) c = C;
  if (!c || t > c.e + 0.35) return;
  const nxt = CAPS[CAPS.indexOf(c) + 1]; if (nxt && t >= nxt.s - 0.04) c = nxt;
  const k = 0.72 + 0.28 * easeOut(seg(t, c.s - 0.04, c.s + 0.08));
  const txt = c.txt.replace(/[.,!?…:;]+$/, ''), key = c.words.some(w => KEYWORDS.has(norm(w.w))) || /\d/.test(txt), size = fitSize(txt, key ? 92 : 82, 900);
  g.save(); g.translate(540, CAPY); g.scale(k, k);
  if (key) { g.font = `800 ${size}px ${FONT}`; const w = g.measureText(txt).width; g.beginPath(); g.moveTo(-w / 2 - 6, size * 0.5); g.quadraticCurveTo(0, size * 0.62, w / 2 + 10, size * 0.44); g.lineCap = 'round'; g.lineWidth = 12; g.strokeStyle = '#C8552E'; g.stroke(); }
  g.shadowColor = 'rgba(15,8,4,.6)'; g.shadowBlur = 14; g.shadowOffsetY = 6; strokeText(txt, 0, 0, size, key ? '#FFC23C' : '#FFFFFF', 15); g.restore();
}

// ── frame ─────────────────────────────────────────────────────
function renderFrame(t) {
  UI = []; SEPIA = 0; NOCAP = false; SHAKE = 0;
  Object.values(SETS).forEach(G => { G.visible = false; });
  CHARS.forEach(C => { C.visible = false; });
  PROPS.forEach(P => { P.visible = false; });
  sky('desa'); mood('siang');
  scene(t);
  SCN.traverse(o => { if (o.userData && o.userData.update && isShown(o)) o.userData.update(t); });
  CAM.position.x += Math.sin(t * 0.8) * 0.006; CAM.position.y += Math.sin(t * 1.1 + 2) * 0.005;   // breathing hand-held camera
  R.render(SCN, CAM);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.filter = SEPIA ? `sepia(${SEPIA}) contrast(1.05)` : 'saturate(0.9) contrast(1.07) brightness(1.02)';
  g.drawImage(glc, 0, 0); g.filter = 'none';
  grade(t);
  if (SEPIA) { for (let i = 0; i < 60; i++) { const k = Math.floor(t * 24); g.fillStyle = `rgba(70,45,20,${0.22 * rnd(i + k * 7)})`; g.fillRect(rnd(i * 3 + k) * W, rnd(i * 5 + k * 3) * H, 3, 3); } }
  UI.forEach(f => f(t));
  drawCaption(t);
}
// TL v3 look: warm golden light leak from the top, deep vignette, fine film grain
const TLGRAIN = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), d = x.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) { const v = rnd(i * 0.29) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 26; } x.putImageData(d, 0, 0); return c; })();
function grade(t) {
  g.save();
  g.globalCompositeOperation = 'soft-light'; const lk = g.createLinearGradient(0, 0, 0, H); lk.addColorStop(0, 'rgba(255,190,110,.45)'); lk.addColorStop(0.5, 'rgba(255,220,170,0)'); lk.addColorStop(1, 'rgba(70,40,90,.35)'); g.fillStyle = lk; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'source-over'; const vg = g.createRadialGradient(540, 900, 480, 540, 960, 1200); vg.addColorStop(0, 'rgba(20,10,4,0)'); vg.addColorStop(1, 'rgba(20,10,4,.42)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  const f = Math.floor(t * 24); g.globalCompositeOperation = 'overlay'; g.fillStyle = g.createPattern(TLGRAIN, 'repeat'); g.translate(rnd(f) * 256, rnd(f + 3) * 256); g.fillRect(-256, -256, W + 512, H + 512);
  g.restore();
}
function isShown(o) { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; }
// for the audio mixer: whooshes on every cut + cues from overlays across the whole video
function collectCues(step = 1 / 30) {
  SFX.length = 0;
  let prev = null;
  for (let t = 0; t < DURATION; t += step) {
    UI = []; try { scene(t); } catch (e) {}
    const p = CAM.position.clone();
    if (prev && p.distanceTo(prev) > 0.35) cue(t, 'whoosh', 0.8);   // every hard cut gets a whoosh
    prev = p;
  }
  (window.EXTRA_SFX || []).forEach(c => cue(c.t, c.type, c.gain, c.d));
  return { duration: DURATION, cues: SFX.slice().sort((a, b) => a.t - b.t) };
}
