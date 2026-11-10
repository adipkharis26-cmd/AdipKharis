// Ohhiyaa!: "miniatur 3D mainan" engine — a fork of the 3D diorama base (three.js r149), restyled:
// pastel studio table, glossy plastic toy props, mascot OHI (a little water gallon), Nunito captions,
// and number overlays (angka, tebak 3-2-1, OHHIYAA! burst). Ternyata Leluhur keeps its own engine untouched.
// Episode pattern: see oh00.js —  function scene(t) { studio(); stack(...); ohi(t,{...}); shot(...); angka(...) }

const W = 1080, H = 1920, FONT = 'Nunito';
const OL = '#24204A';
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
  pantai: ['#3F9BE8', '#CFEAF7'], desa: ['#4FA8EC', '#D6EEF8'], sore: ['#F08A5D', '#FFD9A0'],
  malam: ['#0F1838', '#2C3D73'], dalam: ['#C9A777', '#E9D3AE'], lab: ['#BFE4EC', '#EEF8FA'],
  studio: ['#FFD6E5', '#FFF4E8'], mint: ['#BFF3E4', '#F4FFF9'], langit: ['#BFDFFF', '#F3F8FF'], ungu: ['#E3D6FF', '#FFF4FB'], angkasa: ['#141436', '#3A2E7A'],
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
    siang: [0xffffff, 0.48, 0.16, 0xfff0d8, 0.55], sore: [0xffe0c0, 0.42, 0.15, 0xffb46b, 0.6],
    malam: [0x6f80c0, 0.35, 0.12, 0x9fb2ff, 0.22], dalam: [0xfff3e0, 0.55, 0.28, 0xffe2b0, 0.45],
    studio: [0xffffff, 0.34, 0.06, 0xfff6ee, 0.8],
  }[m || 'siang'];
  HEMI.color.setHex(L[0]); HEMI.intensity = L[1]; AMB.intensity = L[2]; SUN.color.setHex(L[3]); SUN.intensity = L[4];
}

// ── materials & primitives ────────────────────────────────────
const matCache = {};
function mat(col, o = {}) {
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

// ── characters ────────────────────────────────────────────────
// o: {skin, shirt, pattern:'plaid|stripe|dots|gold', pat2, pants, hair:'none|short|white|grey|bun|black',
//     beard, mustache, hat:'headband|straw|peci|kerudung|cap', hatCol, glasses, kid, fat, sandal}
const SKIN = '#B87A4B', PINK = '#EF8F80';
function makeChar(o = {}) {
  const C = new THREE.Group(); C.userData.o = o; C.visible = false; SCN.add(C); CHARS.push(C);
  const s = o.kid ? 0.74 : 1, skin = o.skin || SKIN, ol = 0.012;
  const root = new THREE.Group(); C.add(root); root.scale.setScalar(s); C.userData.root = root;
  const fat = o.fat || 1;
  // legs + sandals
  const legs = [-1, 1].map(sd => {
    const L = new THREE.Group(); at3(L, sd * 0.075 * fat, 0.17, 0);
    L.add(at3(cyl(0.052, 0.05, 0.15, o.pants || '#3A3F5C', { ol }), 0, -0.075, 0));
    L.add(at3(rbox(0.1, 0.035, 0.17, o.sandal || '#7A4E27', { ol }), 0, -0.155, 0.03));
    root.add(L); return L;
  });
  // body (clothes)
  const shirtMat = o.pattern ? texMat(o.pattern, o.shirt || '#1F5FBF', o.pat2 || '#ffffff') : mat(o.shirt || '#1F5FBF');
  const body = capsule(0.165, 0.17, shirtMat, { ol }); at3(body, 0, 0.385, 0); body.scale.set(fat, 1, fat * 0.92); root.add(body);
  const pantsBand = cyl(0.17 * fat, 0.17 * fat, 0.06, o.pants || '#3A3F5C'); at3(pantsBand, 0, 0.215, 0); pantsBand.scale.z = 0.92; root.add(pantsBand);
  // arms (pivot at shoulder)
  const arms = [-1, 1].map(sd => {
    const A = new THREE.Group(); at3(A, sd * 0.175 * fat, 0.53, 0);
    A.add(at3(capsule(0.048, 0.16, shirtMat, { ol }), 0, -0.1, 0));
    const hand = sph(0.055, skin, { ol }); at3(hand, 0, -0.215, 0); A.add(hand);
    const holder = new THREE.Group(); at3(holder, 0, -0.24, 0.02); A.add(holder);
    A.userData.holder = holder; root.add(A); return A;
  });
  // head
  const head = new THREE.Group(); at3(head, 0, 0.84, 0); root.add(head);
  const HR = 0.27;
  head.add(sph(HR, skin, { ol: 0.016 }, 40, 28));
  const onHead = (obj, lat, lon, lift = 0) => {
    const d = V3(Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon));
    obj.position.copy(d.clone().multiplyScalar(HR + lift));
    obj.quaternion.setFromUnitVectors(V3(0, 0, 1), d); head.add(obj); return obj;
  };
  const eyes = [-1, 1].map(sd => {
    const E = new THREE.Group();
    const ball = sph(0.042, OL, { cast: false }); ball.scale.set(0.82, 1.15, 0.45); E.add(ball);
    const hl = sph(0.012, '#ffffff', { cast: false }); at3(hl, 0.012, 0.018, 0.018); E.add(hl);
    const shut = torus(0.03, 0.009, OL, Math.PI, { cast: false }); shut.visible = false; E.add(shut);
    E.userData = { ball, hl, shut };
    return onHead(E, 0.06, sd * 0.36, -0.004);
  });
  const brows = [-1, 1].map(sd => { const B = new THREE.Group(); B.add(box(0.075, 0.02, 0.02, OL, { cast: false })); return onHead(B, 0.3, sd * 0.36, 0.006); });
  onHead(sph(0.021, '#A5653B', { cast: false }), -0.1, 0, 0.002);
  [-1, 1].forEach(sd => { const ck = mesh(new THREE.CircleGeometry(0.04, 20), mat(PINK, { opacity: 0.8 }), { cast: false }); onHead(ck, -0.14, sd * 0.56, 0.003); });
  // mouth variants
  const mouth = new THREE.Group(); onHead(mouth, -0.36, 0, 0.002);
  const smile = torus(0.045, 0.011, OL, Math.PI, { cast: false }); smile.rotation.z = Math.PI; mouth.add(smile);
  const open = new THREE.Group();
  const cav = sph(0.05, '#6B1E1E', { cast: false }); cav.scale.set(1, 0.8, 0.35); open.add(cav);
  const tongue = sph(0.025, '#E06C6C', { cast: false }); at3(tongue, 0, -0.022, 0.008); tongue.scale.set(1.2, 0.6, 0.4); open.add(tongue);
  open.add(at3(mesh(new THREE.TorusGeometry(0.05, 0.008, 8, 28), OL, { cast: false }), 0, 0, 0.004)).scale.set(1, 0.8, 1);
  mouth.add(open);
  const flat = box(0.06, 0.012, 0.01, OL, { cast: false }); mouth.add(flat);
  // hair / hats
  const hairCol = { white: '#F4F1EA', grey: '#A9A6A0', black: '#1E1A18', short: '#1E1A18' }[o.hair] || o.hairCol || '#1E1A18';
  if (o.hair && o.hair !== 'none' && o.hat !== 'kerudung') {
    const cap = mesh(new THREE.SphereGeometry(HR * 1.045, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4), hairCol, { ol: 0.012 });
    cap.rotation.x = -0.32; head.add(cap);
    if (o.hair === 'bun') head.add(at3(sph(0.1, hairCol, { ol: 0.012 }), 0, 0.17, -0.2));
    if (o.hair === 'white' || o.hair === 'grey') [-1, 1].forEach(sd => head.add(at3(sph(0.06, hairCol, { ol: 0.01 }), sd * 0.25, 0.04, -0.04)));
  }
  if (o.beard) {
    const bd = mesh(new THREE.SphereGeometry(HR * 1.035, 32, 12, Math.PI / 2 - 0.95, 1.9, Math.PI * 0.6, Math.PI * 0.32), o.beardCol || hairCol, { ol: 0.01 });
    head.add(bd); mouth.position.multiplyScalar(1.04);
  }
  if (o.mustache) [-1, 1].forEach(sd => { const m = capsule(0.014, 0.045, o.beardCol || (o.beard ? hairCol : '#1E1A18'), { cast: false }); onHead(m, -0.215, sd * 0.09, 0.01); m.rotateZ(Math.PI / 2 + sd * 0.35); });
  if (o.glasses) {
    eyes.forEach((E, i) => { const r = torus(0.06, 0.008, OL, Math.PI * 2, { cast: false }); onHead(r, 0.06, (i ? 1 : -1) * 0.36, 0.03); });
    onHead(box(0.07, 0.01, 0.01, OL, { cast: false }), 0.08, 0, 0.03);
  }
  const hc = o.hatCol;
  if (o.hat === 'headband') {
    const hb = torus(Math.sqrt(HR * HR - 0.12 * 0.12) + 0.012, 0.03, hc || '#EE7A1F', Math.PI * 2, { ol: 0.008 }); at3(hb, 0, 0.12, 0, Math.PI / 2, 0, 0); head.add(hb);
    const knot = sph(0.045, hc || '#EE7A1F', { ol: 0.008 }); at3(knot, 0.06, 0.05, -0.27); head.add(knot);
    [0.25, -0.2].forEach(a => { const tail = rbox(0.05, 0.16, 0.02, hc || '#EE7A1F', { ol: 0.006 }); at3(tail, 0.08 + a * 0.15, -0.04, -0.29, 0, 0, a); head.add(tail); });
  } else if (o.hat === 'straw') {
    const sm = texMat('weave', hc || '#E2C26A', '#C9A44C', [6, 1]);
    head.add(at3(cyl(0.5, 0.52, 0.025, sm, { ol: 0.01 }, 40), 0, 0.17, 0, -0.12, 0, 0));
    head.add(at3(cyl(0.17, 0.25, 0.17, sm, { ol: 0.01 }), 0, 0.26, -0.02, -0.12, 0, 0));
    head.add(at3(cyl(0.252, 0.252, 0.04, '#8B3A2E'), 0, 0.205, -0.01, -0.12, 0, 0));
  } else if (o.hat === 'peci') {
    head.add(at3(cyl(0.22, 0.235, 0.15, hc || '#1A1A1E', { ol: 0.01 }), 0, 0.22, -0.03, -0.18, 0, 0));
  } else if (o.hat === 'cap') {
    head.add(at3(mesh(new THREE.SphereGeometry(HR * 1.05, 32, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), hc || '#2E8B57', { ol: 0.01 }), 0, 0.01, 0, -0.2, 0, 0));
    head.add(at3(rbox(0.26, 0.025, 0.18, hc || '#2E8B57', { ol: 0.008 }), 0, 0.15, 0.26, -0.15, 0, 0));
  } else if (o.hat === 'kerudung') {
    const kc = hc || '#E9A92B';
    head.add(mesh(new THREE.SphereGeometry(HR * 1.07, 36, 24, Math.PI / 2 + 0.78, Math.PI * 2 - 1.56, 0, Math.PI), kc, { ol: 0.012 }));
    head.add(mesh(new THREE.SphereGeometry(HR * 1.07, 36, 12, 0, Math.PI * 2, 0, Math.PI * 0.27), kc, { ol: 0.012 }));
    const drape = cyl(0.2, 0.3, 0.26, kc, { ol: 0.012 }); at3(drape, 0, 0.66, -0.02); root.add(drape);
  }
  // shadow blob under feet (soft contact)
  const blob = mesh(new THREE.CircleGeometry(0.26 * fat, 24), mat('#000000', { basic: true, opacity: 0.18 }), { cast: false, recv: false });
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.004; root.add(blob);
  Object.assign(C.userData, { legs, arms, head, body, eyes, brows, mouth: { smile, open, flat, g: mouth }, s, fat, seed: CHARS.length * 1.7 });
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
    d.ball.scale.set(0.82, e === 'shock' ? 1.45 : 1.15, 0.45);
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
  const k = { rumput: ['#56B04E', '#3E9440'], pasir: ['#ECCD92', '#D2B27C'], tanah: ['#C79A62', '#A57C4A'], lantai: ['#B88A55', '#8F6638'], lab: ['#E8EEF0', '#C9D4D8'] }[kind];
  const m = kind === 'lantai' ? texMat('planks', k[0], k[1], [size / 2, size / 2]) : texMat('speckle', k[0], k[1], [size / 4, size / 4]);
  return flat(size, size, m);
}
function path(w, len, col = '#C79A62') { return flat(w, len, texMat('speckle', col, '#A57C4A', [w, len / 2]), 0.005); }
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
  [-1, 1].forEach(sd => { const sl = box(w + over * 2, 0.08, slope, col, { ol: 0.01 }); at3(sl, 0, h / 2, sd * half / 2, sd * ang, 0, 0); R0.add(sl); });
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
let SHAKE = 0;
// shot: from eye→eye2 looking target→target2 between t0..t1 (default: slow 12% push-in + slight drift)
function shot(t, t0, t1, eye, target, o = {}) {
  const k = ease(seg(t, t0, t1));
  const e2 = o.eye2 || eye.map((v, i) => v + (target[i] - v) * (o.push ?? 0.12) + (i === 0 ? (o.drift ?? 0.15) : 0));
  const tg2 = o.target2 || target;
  const E = lerp3(eye, e2, k), T = lerp3(target, tg2, k);
  CAM.fov = o.fov || 54; CAM.updateProjectionMatrix();
  const sh = (o.shake || 0) + SHAKE;
  CAM.position.set(E[0] + (sh ? (rnd(Math.floor(t * 30)) - 0.5) * sh : 0), E[1] + (sh ? (rnd(Math.floor(t * 30) + 9) - 0.5) * sh : 0), E[2]);
  CAM.lookAt(T[0], T[1], T[2]);
  // shadow box follows the subject
  SUN.target.position.set(T[0], 0, T[2]); SUN.position.copy(SUN.target.position).add(SUN_DIR.clone().multiplyScalar(14));
}

// ── 2D overlays (queued during scene(), drawn after the 3D frame) ──
let UI = [], SEPIA = 0, NOCAP = false, CAPY = 1500;
const ui = fn => UI.push(fn);
function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function strokeText(txt, x, y, size, col, sw) {
  g.font = `900 ${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.miterLimit = 2; g.strokeStyle = OL; g.lineWidth = sw ?? size * 0.22; g.strokeText(txt, x, y);
  g.fillStyle = col; g.fillText(txt, x, y);
}
function fitSize(txt, size, maxW) { g.font = `900 ${size}px ${FONT}`; const w = g.measureText(txt).width; return w > maxW ? Math.floor(size * maxW / w) : size; }
const SFX = [];   // audio cues collected for the mixer: {t, type}
const cue = (t, type, gain, d) => { if (!SFX.some(c => c.type === type && Math.abs(c.t - t) < 0.05)) SFX.push({ t: +t.toFixed(3), type, gain: gain ?? 1, d }); };
// chip: uppercase label with black frame; stamp-in at t0 (until t1)
function chip(txt, x, y, t0, o = {}) {
  cue(t0, o.stamp ? 'stamp' : 'pop'); punch(t0, o.punch ?? 2);
  ui(t => {
    if (t < t0 || (o.t1 && t > o.t1)) return;
    const k = o.stamp ? 1 + 0.6 * (1 - easeOut(seg(t, t0, t0 + 0.18))) : back(seg(t, t0, t0 + 0.28));
    const size = fitSize(txt.toUpperCase(), o.size || 64, (o.maxW || 900) - 60);
    g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(k, k);
    g.font = `900 ${size}px ${FONT}`; const w = g.measureText(txt.toUpperCase()).width + size * 0.9, h = size * 1.45;
    rr(-w / 2 + 6, -h / 2 + 8, w, h, h * 0.28); g.fillStyle = OL; g.fill();
    rr(-w / 2, -h / 2, w, h, h * 0.28); g.fillStyle = o.bg || '#7EE8CF'; g.fill(); g.lineWidth = 7; g.strokeStyle = OL; g.stroke();
    g.fillStyle = o.fg || OL; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt.toUpperCase(), 0, size * 0.04);
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
    rr(-w / 2 + 8, -h / 2 + 10, w, h, 26); g.fillStyle = 'rgba(23,18,15,0.9)'; g.fill();
    rr(-w / 2, -h / 2, w, h, 26); g.fillStyle = '#FFFFFF'; g.fill(); g.lineWidth = 7; g.strokeStyle = OL; g.stroke();
    lines.forEach((L, i) => { const s2 = fitSize(L, i ? size * 0.85 : size, w - 70); g.font = `900 ${s2}px ${FONT}`; g.fillStyle = i ? '#3B3760' : (o.titleCol || '#FF4F8B'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(L, 0, -h / 2 + size * 0.95 + i * size * 1.3); });
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
    strokeText(txt, 0, 0, size, o.col || '#FFC93C', 30); g.restore();
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
  const txt = c.txt.replace(/[.,!?…:;]+$/, '').toUpperCase();
  const key = c.words.some(w => KEYWORDS.has(norm(w.w))) || /\d/.test(txt), size = fitSize(txt, key ? 108 : 92, 950);
  const idx = CAPS.indexOf(c), kb = back(seg(t, c.s - 0.04, c.s + 0.16));
  g.save(); g.translate(540, CAPY); g.rotate((idx % 2 ? 1 : -1) * (key ? 0.04 : 0.015)); g.scale(k * (0.6 + 0.4 * kb), k * (0.6 + 0.4 * kb));
  if (key) { g.font = `900 ${size}px ${FONT}`; const w = g.measureText(txt).width + 70; rr(-w / 2 + 8, -size * 0.62 + 10, w, size * 1.24, 30); g.fillStyle = OL; g.fill(); rr(-w / 2, -size * 0.62, w, size * 1.24, 30); g.fillStyle = '#FFC93C'; g.fill(); g.lineWidth = 8; g.strokeStyle = OL; g.stroke(); strokeText(txt, 0, 4, size, '#FF4F8B', 16); }
  else strokeText(txt, 0, 0, size, '#FFFFFF', 20);
  g.restore();
}

// ── frame ─────────────────────────────────────────────────────
let TNOW = 0, PUNCH = [];
// punch(t0, deg): quick zoom-in kick of the camera on a beat (overlays call it themselves)
function punch(t0, amt = 3) { PUNCH.push([t0, amt]); }
function renderFrame(t) {
  UI = []; SEPIA = 0; NOCAP = false; SHAKE = 0; TNOW = t; PUNCH = []; DOME.visible = false;
  Object.values(SETS).forEach(G => { G.visible = false; });
  CHARS.forEach(C => { C.visible = false; });
  PROPS.forEach(P => { P.visible = false; });
  sky('studio'); mood('studio');
  scene(t);
  SCN.traverse(o => { if (o.userData && o.userData.update && isShown(o)) o.userData.update(t); });
  if (typeof ohiFaceUpdate === 'function') ohiFaceUpdate(t);
  // camera life: hand-held float + punch-in zoom on beats + a tiny roll
  let kick = 0; PUNCH.forEach(([p, a]) => { if (t >= p - 0.05) kick = Math.max(kick, a * (t < p + 0.06 ? seg(t, p - 0.05, p + 0.06) : 1 - ease(seg(t, p + 0.06, p + 0.45)))); });
  const fov0 = CAM.fov; CAM.fov = fov0 - kick; CAM.updateProjectionMatrix();
  const fl = [Math.sin(t * 0.9) * 0.025, Math.sin(t * 1.3 + 1) * 0.02, 0]; CAM.position.x += fl[0]; CAM.position.y += fl[1];
  CAM.rotateZ(Math.sin(t * 0.7) * 0.008);
  R.render(SCN, CAM); CAM.fov = fov0;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.filter = SEPIA ? `sepia(${SEPIA}) contrast(1.05)` : 'none';
  g.drawImage(glc, 0, 0); g.filter = 'none';
  if (SEPIA) { for (let i = 0; i < 60; i++) { const k = Math.floor(t * 24); g.fillStyle = `rgba(70,45,20,${0.22 * rnd(i + k * 7)})`; g.fillRect(rnd(i * 3 + k) * W, rnd(i * 5 + k * 3) * H, 3, 3); } }
  post(t);
  UI.forEach(f => f(t));
  drawCaption(t);
  wipe(t);
}
// soft vignette + film grain (cached noise tile, shifted every frame) for a "real camera" look
const GRAIN = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), d = x.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) { const v = rnd(i * 0.37) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 22; } x.putImageData(d, 0, 0); return c; })();
function post(t) {
  const vg = g.createRadialGradient(540, 900, 520, 540, 960, 1250); vg.addColorStop(0, 'rgba(36,32,74,0)'); vg.addColorStop(1, 'rgba(36,32,74,0.28)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  const f = Math.floor(t * 30); g.save(); g.globalCompositeOperation = 'overlay'; g.fillStyle = g.createPattern(GRAIN, 'repeat'); g.translate(rnd(f) * 256, rnd(f + 1) * 256); g.fillRect(-256, -256, W + 512, H + 512); g.restore();
}
// section transition: a candy-stripe swipe in channel colours hides every hard cut (CUT[1..])
function wipe(t) {
  if (window.NO_WIPE) return;
  for (let i = 1; i < CUT.length - 1; i++) {
    const p = seg(t, CUT[i] - 0.2, CUT[i] + 0.2); if (p <= 0 || p >= 1) continue;
    const x = lerp(-2300, 2300, p * p * (3 - 2 * p));
    g.save(); g.translate(540 + x, 960); g.rotate(-0.35);
    ['#FF6FAE', '#FFC93C', '#7EE8CF', '#8FB8FF'].forEach((c, j) => { g.fillStyle = c; g.fillRect(-1100 + j * 550, -1500, 560, 3000); });
    g.strokeStyle = OL; g.lineWidth = 14; [-1100, 1100].forEach(u => { g.beginPath(); g.moveTo(u, -1500); g.lineTo(u, 1500); g.stroke(); });
    g.restore();
  }
}
// speed lines while something rises/flies (t0..t1); dir 'naik' (lines stream down) | 'zoom' (radial)
function garisCepat(t0, t1, dir = 'naik') {
  ui(t => {
    if (t < t0 || t > t1) return; const a = Math.min(seg(t, t0, t0 + 0.3), 1 - seg(t, t1 - 0.3, t1)) * 0.55;
    g.save(); g.globalAlpha = a; g.strokeStyle = '#FFFFFF'; g.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      if (dir === 'zoom') { const an = rnd(i) * 7, r0 = 380 + ((t * 1600 + rnd(i + 2) * 900) % 900); g.lineWidth = 6 + rnd(i) * 6; g.beginPath(); g.moveTo(540 + Math.cos(an) * r0, 960 + Math.sin(an) * r0); g.lineTo(540 + Math.cos(an) * (r0 + 160), 960 + Math.sin(an) * (r0 + 160)); g.stroke(); }
      else { const x = 60 + rnd(i) * 960, y = ((t * (1800 + rnd(i + 5) * 900) + rnd(i + 3) * 2200) % 2300) - 200; g.lineWidth = 4 + rnd(i + 1) * 8; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 140 + rnd(i) * 160); g.stroke(); }
    }
    g.restore();
  });
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


// ══════════════ Ohhiyaa! toy kit (v3 "wow": glossy plastic + studio dome + detailed toys) ══════════════
// glossy toy plastic: clearcoat + the soft-box reflections from ENV below
const physCache = {};
const PLASTIK = (col, o = {}) => {
  const key = col + JSON.stringify(o);
  if (!physCache[key]) physCache[key] = new THREE.MeshPhysicalMaterial({
    color: col, roughness: o.rough ?? 0.32, metalness: o.metal ?? 0, clearcoat: o.coat ?? 0.9, clearcoatRoughness: 0.12,
    map: o.map || null, emissive: o.emissive || 0x000000, emissiveIntensity: o.ei ?? 1,
    transparent: o.opacity != null, opacity: o.opacity ?? 1, depthWrite: o.opacity == null || o.opacity > 0.7, side: o.side || THREE.FrontSide, flatShading: !!o.flat,
  });
  return physCache[key];
};
// studio reflections: a little room of soft boxes baked into an environment map (gives every toy a shiny highlight)
const ENV = (() => {
  const S = new THREE.Scene(), pm = new THREE.PMREMGenerator(R);
  S.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.42, 0.40, 0.48), side: THREE.BackSide })));
  const panel = (p, w, h, c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(...p); m.lookAt(0, 0, 0); S.add(m); };
  panel([0, 14, 4], 16, 8, new THREE.Color(2.6, 2.6, 2.6));      // top soft box
  panel([12, 5, 8], 6, 10, new THREE.Color(2.0, 1.85, 1.9));      // key (warm)
  panel([-12, 4, 6], 5, 9, new THREE.Color(1.3, 1.6, 2.0));       // fill (cool)
  panel([0, 6, -14], 14, 5, new THREE.Color(2.2, 1.5, 1.9));      // pink rim
  const tx = pm.fromScene(S, 0.035).texture; pm.dispose(); return tx;
})();
SCN.environment = ENV;
// back/rim light: makes toys pop off the backdrop
const RIM = new THREE.DirectionalLight(0xffe2f0, 0.55); RIM.position.set(-4, 6, -8); SCN.add(RIM);

// seamless cyclorama dome: gradient by elevation (horizon = floor colour = fog colour → no hard horizon line)
const DOME = (() => {
  const m = new THREE.ShaderMaterial({
    uniforms: { top: { value: new THREE.Color() }, bot: { value: new THREE.Color() }, stars: { value: 0 } },
    side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 bot; uniform float stars; varying vec3 vp;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){ float e = clamp(vp.y, 0.0, 1.0); vec3 c = mix(bot, top, smoothstep(0.0, 0.5, e));
        if (stars > 0.0) { vec2 q = floor(vec2(atan(vp.z, vp.x) * 160.0, asin(clamp(vp.y,-1.0,1.0)) * 160.0)); c += step(0.993, h(q)) * smoothstep(0.03, 0.25, e) * stars * (0.5 + 0.5 * h(q + 7.0)); }
        gl_FragColor = vec4(c, 1.0); }`,
  });
  const D = new THREE.Mesh(new THREE.SphereGeometry(95, 48, 24), m); D.frustumCulled = false; D.renderOrder = -10; D.visible = false; SCN.add(D); return D;
})();
// cutting-mat table: fine grid + bold grid every 5 + speckle (the channel "measures" things)
const MEJA = build('meja', () => {
  const tex = canvasTex('meja-mat', 512, 512, (x, w, h) => {
    x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(36,32,74,${0.015 + rnd(i) * 0.03})`; x.fillRect(rnd(i * 3) * w, rnd(i * 7 + 2) * h, 2, 2); }
    x.strokeStyle = 'rgba(36,32,74,.07)'; x.lineWidth = 2;
    for (let i = 0; i <= 10; i++) { x.beginPath(); x.moveTo(i * 51.2, 0); x.lineTo(i * 51.2, h); x.stroke(); x.beginPath(); x.moveTo(0, i * 51.2); x.lineTo(w, i * 51.2); x.stroke(); }
    x.strokeStyle = 'rgba(36,32,74,.16)'; x.lineWidth = 5; x.strokeRect(0, 0, w, h);
    x.lineWidth = 3; for (let i = 1; i < 10; i++) { x.beginPath(); x.moveTo(i * 51.2, 0); x.lineTo(i * 51.2, i % 5 ? 10 : 22); x.stroke(); x.beginPath(); x.moveTo(0, i * 51.2); x.lineTo(i % 5 ? 10 : 22, i * 51.2); x.stroke(); }
    x.fillStyle = 'rgba(36,32,74,.18)'; x.font = '900 22px Nunito'; x.fillText('5', 262, 40); x.fillText('10', 474, 40);
  }, [48, 48]);
  return grp(flat(240, 240, new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, roughness: 0.85, envMapIntensity: 0.22 }), 0));
});
// floating pastel toys far behind the table: depth + "toy studio" mood (soft in the fog)
const DEKO = build('deko', () => {
  const G = new THREE.Group(), cols = ['#FF6FAE', '#FFC93C', '#7EE8CF', '#8FB8FF', '#C9A8FF', '#FFFFFF'];
  const star = () => { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.45 : 1, a = i / 10 * Math.PI * 2 + Math.PI / 2; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } s.closePath(); return new THREE.ExtrudeGeometry(s, { depth: 0.35, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 2 }); };
  const shapes = [() => new THREE.SphereGeometry(0.9, 24, 16), () => new THREE.TorusGeometry(0.8, 0.32, 14, 28), star, () => roundBoxGeo(1.5, 1.5, 1.5, 0.3), () => new THREE.CapsuleGeometry(0.5, 1, 6, 14)];
  for (let i = 0; i < 30; i++) {
    const a = Math.PI * (1.05 + 0.9 * i / 29) + rnd(i) * 0.08, r = 26 + rnd(i + 4) * 18;
    const m = mesh(shapes[i % shapes.length](), PLASTIK(cols[i % cols.length]), { cast: false, recv: false });
    m.position.set(Math.cos(a) * r * 1.3, 1 + rnd(i + 9) * 22, Math.sin(a) * r - 6); m.scale.setScalar(0.7 + rnd(i + 2) * 1.1);
    m.userData.p = [m.position.y, rnd(i) * 6, 0.3 + rnd(i + 1) * 0.5]; G.add(m);
  }
  G.userData.update = t => G.children.forEach(m => { const [y, ph, sp] = m.userData.p; m.position.y = y + Math.sin(t * sp + ph) * 0.6; m.rotation.set(t * sp * 0.4 + ph, t * sp * 0.6, 0); });
  return G;
});
// studio(sky): the table takes the colour of the backdrop's bottom; fog melts it into the dome
function studio(skyName = 'studio') {
  show(MEJA, DEKO); sky(skyName); mood('studio'); SCN.background = null;
  const [top, bottom] = Array.isArray(skyName) ? skyName : SKY[skyName];
  const dark = skyName === 'angkasa';
  DOME.visible = true; DOME.material.uniforms.top.value.set(top); DOME.material.uniforms.bot.value.set(bottom); DOME.material.uniforms.stars.value = dark ? 0.9 : 0;
  MEJA.children[0].children[0].material.color.set(bottom).offsetHSL(0, 0.25, dark ? 0.05 : -0.22);
  SCN.fog.color.set(bottom); SCN.fog.near = 22; SCN.fog.far = 75;
  if (dark) { HEMI.intensity = 0.5; SUN.intensity = 0.75; }
}

// ── props (y = 0 is the table; sizes in "toy metres") ──
const lathe = (pts, seg = 40) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const glow = (col, s = 1) => { const tx = canvasTex('glow' + col, 128, 128, (x, w) => { const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, w); });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 })); sp.scale.setScalar(s); return sp; };
// window grid texture for buildings: glass + a few lit windows
const jendela = (key, base, glass, cols, rows) => canvasTex('win' + key, 256, 512, (x, w, h) => {
  x.fillStyle = base; x.fillRect(0, 0, w, h); const cw = w / cols, rh = h / rows;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { x.fillStyle = rnd(i * 31 + j * 7) > 0.8 ? '#FFE9A8' : glass; x.fillRect(i * cw + cw * 0.18, j * rh + rh * 0.2, cw * 0.64, rh * 0.6); x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(i * cw + cw * 0.18, j * rh + rh * 0.2, cw * 0.2, rh * 0.6); }
});
// galon profile: rounded foot, 3 grip ribs, shoulder, neck (radius, y)
const GALON_PROF = [[0, 0], [0.13, 0], [0.155, 0.012], [0.163, 0.04], [0.163, 0.09], [0.152, 0.1], [0.163, 0.11], [0.163, 0.2], [0.152, 0.21], [0.163, 0.22], [0.163, 0.33], [0.152, 0.34], [0.163, 0.35], [0.162, 0.39], [0.14, 0.43], [0.095, 0.465], [0.062, 0.48], [0.058, 0.51], [0, 0.51]];
const TOY = {
  galon: () => { const G = new THREE.Group();
    const body = mesh(lathe(GALON_PROF), PLASTIK('#9FDBFF', { opacity: 0.62, rough: 0.08 }), { ol: 0.008 });
    const air = mesh(lathe(GALON_PROF.slice(0, 13).map(([r, y]) => [r * 0.9, y + 0.006]).concat([[0, 0.326]])), PLASTIK('#3FA7FF', { opacity: 0.55, rough: 0.05 }), { cast: false });
    const label = mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.085, 32, 1, true), PLASTIK('#ffffff', { map: canvasTex('galon-label', 512, 96, (x, w, h) => {
      x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, w, h); x.fillStyle = '#1E6EFF'; x.fillRect(0, 0, w, 10); x.fillRect(0, h - 10, w, 10);
      for (const u of [70, 326]) { x.beginPath(); x.moveTo(u, 22); x.quadraticCurveTo(u + 22, 52, u, 76); x.quadraticCurveTo(u - 22, 52, u, 22); x.fill(); x.font = '900 40px Nunito'; x.textBaseline = 'middle'; x.fillText('19 L', u + 34, h / 2 + 2); }
    }) }), { cast: false }); label.position.y = 0.27;
    const cap = cyl(0.068, 0.068, 0.045, PLASTIK('#1E6EFF'), { ol: 0.006 }, 24); cap.position.y = 0.53;
    const tab = torus(0.035, 0.009, PLASTIK('#1E6EFF')); tab.position.set(0, 0.56, 0); tab.rotation.y = Math.PI / 2;
    G.add(air, body, label, cap, tab); return G; },
  motor: () => { const G = new THREE.Group(), c = ['#E84545', '#1E6EFF', '#111827', '#F5B82E'][Math.floor(rnd(TOY._n = (TOY._n || 0) + 1) * 4)];
    [-0.2, 0.2].forEach(x => { const w = torus(0.09, 0.035, PLASTIK('#24204A', { rough: 0.6 })); w.position.set(x, 0.11, 0); G.add(w); const hub = cyl(0.045, 0.045, 0.05, PLASTIK('#C8CDD8', { metal: 0.6 }), {}, 12); hub.rotation.x = Math.PI / 2; hub.position.set(x, 0.11, 0); G.add(hub); });
    const b = rbox(0.42, 0.14, 0.12, PLASTIK(c), { ol: 0.006 }); b.position.set(0, 0.22, 0);
    const seat = rbox(0.2, 0.05, 0.11, PLASTIK('#24204A', { rough: 0.7 })); seat.position.set(-0.05, 0.31, 0);
    const bar = box(0.03, 0.16, 0.2, PLASTIK('#9AA0B4', { metal: 0.5 })); bar.position.set(0.2, 0.33, 0);
    const lamp = sph(0.035, PLASTIK('#FFF4C2', { emissive: 0xffe08a, ei: 0.8 })); lamp.position.set(0.24, 0.27, 0);
    G.add(b, seat, bar, lamp); return G; },
  nasi: () => { const G = new THREE.Group();
    const paper = PLASTIK('#ffffff', { rough: 0.85, coat: 0.1, map: canvasTex('nasi-kertas', 128, 128, (x, w, h) => { x.fillStyle = '#D9B47C'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(120,80,40,.35)'; x.lineWidth = 3; for (let i = 0; i < 10; i++) { x.beginPath(); x.moveTo(0, i * 14); x.lineTo(w, i * 14 + 6); x.stroke(); } x.fillStyle = 'rgba(200,60,50,.55)'; x.font = '900 26px Nunito'; x.fillText('NASI', 30, 70); }) });
    const b = rbox(0.22, 0.12, 0.18, paper, { ol: 0.006 }); b.position.y = 0.06;
    const k = cone(0.09, 0.06, PLASTIK('#E9C995', { rough: 0.85, coat: 0.1 }), {}, 4); k.position.y = 0.15; k.rotation.y = Math.PI / 4;
    const tie = torus(0.075, 0.009, PLASTIK('#E84545')); tie.rotation.x = Math.PI / 2; tie.position.y = 0.11;
    G.add(b, k, tie); return G; },
  angkot: () => { const G = new THREE.Group();
    const b = rbox(0.7, 0.34, 0.32, PLASTIK('#2FB5E8'), { ol: 0.008 }); b.position.y = 0.26;
    const stripe = box(0.71, 0.04, 0.325, PLASTIK('#FFC93C')); stripe.position.y = 0.2;
    const win = rbox(0.5, 0.12, 0.33, PLASTIK('#E8F7FF', { rough: 0.05 })); win.position.set(-0.05, 0.34, 0);
    [-0.22, 0.22].forEach(x => [-0.16, 0.16].forEach(z => { const w = cyl(0.08, 0.08, 0.05, PLASTIK('#24204A', { rough: 0.6 }), {}, 16); w.rotation.x = Math.PI / 2; w.position.set(x, 0.08, z); G.add(w); }));
    G.add(b, stripe, win); return G; },
  monas: () => { const G = new THREE.Group(), putih = PLASTIK('#F6F2EA', { rough: 0.4 });
    const plaza = rbox(1.5, 0.05, 1.5, PLASTIK('#BFE3B0', { rough: 0.7 }), { ol: 0.008 }); plaza.position.y = 0.025;
    const step = rbox(1.15, 0.06, 1.15, putih, { ol: 0.008 }); step.position.y = 0.08;
    const cawan = mesh(lathe([[0, 0], [0.4, 0], [0.56, 0.16], [0.52, 0.19], [0, 0.19]], 4), putih, { ol: 0.01 }); cawan.rotation.y = Math.PI / 4; cawan.position.y = 0.11;
    const tugu = mesh(lathe([[0, 0], [0.13, 0], [0.06, 2.1], [0, 2.1]], 4), PLASTIK('#ffffff', { rough: 0.4, map: canvasTex('monas-tugu', 64, 256, (x, w, h) => { x.fillStyle = '#F6F2EA'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(36,32,74,.10)'; for (let i = 0; i < 16; i++) x.fillRect(0, i * 16, w, 2); x.fillRect(w / 2 - 1, 0, 2, h); }) }), { ol: 0.008 }); tugu.rotation.y = Math.PI / 4; tugu.position.y = 0.28;
    const puncak = mesh(lathe([[0, 0], [0.06, 0], [0.12, 0.08], [0.1, 0.1], [0, 0.1]], 4), putih, { ol: 0.006 }); puncak.rotation.y = Math.PI / 4; puncak.position.y = 2.36;
    const gold = PLASTIK('#FFC93C', { emissive: 0xffa800, ei: 0.55, metal: 0.4, rough: 0.2 });
    const api = mesh(lathe([[0, 0], [0.07, 0.02], [0.09, 0.09], [0.06, 0.2], [0.03, 0.28], [0, 0.34]], 16), gold, { ol: 0.006 }); api.position.y = 2.45;
    const gl = glow('rgba(255,210,90,1)', 0.7); gl.position.y = 2.6;
    G.add(plaza, step, cawan, tugu, puncak, api, gl); return G; },
  orang: () => { const G = new THREE.Group(), c = ['#FF6FAE', '#7EE8CF', '#FFC93C', '#8FB8FF'][Math.floor(rnd(TOY._p = (TOY._p || 0) + 1) * 4)];
    const b = capsule(0.06, 0.1, PLASTIK(c), { ol: 0.005 }); b.position.y = 0.12;
    const h = sph(0.06, PLASTIK('#F2C9A0'), { ol: 0.005 }, 16, 12); h.position.y = 0.27;
    const hair = mesh(new THREE.SphereGeometry(0.064, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.45), PLASTIK('#2A2230')); hair.position.y = 0.275; G.add(b, h, hair); return G; },
  rumah: () => { const G = new THREE.Group();   // rumah 2 lantai ±7 m
    const wall = rbox(0.55, 0.5, 0.45, PLASTIK('#ffffff', { map: jendela('rumah', '#FFF1D6', '#8FC8F0', 3, 2) }), { ol: 0.008 }); wall.position.y = 0.25;
    const roof = cone(0.46, 0.26, PLASTIK('#E8454E'), { ol: 0.008 }, 4); roof.rotation.y = Math.PI / 4; roof.position.y = 0.63; roof.scale.z = 0.85;
    const door = box(0.12, 0.2, 0.02, PLASTIK('#8A5A3C')); door.position.set(0, 0.1, 0.23);
    G.add(wall, roof, door); return G; },
  gedung: () => { const G = new THREE.Group();
    const b = rbox(0.5, 1.8, 0.5, PLASTIK('#ffffff', { map: jendela('gedung', '#B9C3FF', '#5A78D8', 4, 12) }), { ol: 0.008 }); b.position.y = 0.9;
    const top = rbox(0.42, 0.08, 0.42, PLASTIK('#8F9BEA')); top.position.y = 1.83;
    const ant = cyl(0.01, 0.01, 0.25, PLASTIK('#9AA0B4')); ant.position.y = 1.98;
    G.add(b, top, ant); return G; },
  // pencakar langit (Autograph Tower style: tapered tiers + crown), height ±2 units at s=1
  pencakar: () => { const G = new THREE.Group(), win = PLASTIK('#ffffff', { map: jendela('pencakar', '#C9D6F2', '#3E66C8', 5, 16), rough: 0.15, metal: 0.2 });
    [[0.5, 0.9, 0], [0.42, 0.6, 0.9], [0.34, 0.35, 1.5]].forEach(([w, h, y]) => { const t = rbox(w, h, w, win, { ol: 0.008 }); t.position.y = y + h / 2; G.add(t); });
    const crown = cone(0.16, 0.25, PLASTIK('#FFC93C', { metal: 0.3 }), { ol: 0.006 }, 4); crown.rotation.y = Math.PI / 4; crown.position.y = 1.97;
    G.add(crown); return G; },
  gunung: () => { const G = new THREE.Group(); const m = cone(0.9, 1.4, PLASTIK('#6E8B5E', { flat: true, rough: 0.7 }), { ol: 0.01 }, 7); m.position.y = 0.7; const sn = cone(0.33, 0.52, PLASTIK('#FFFFFF', { flat: true }), {}, 7); sn.position.y = 1.15; G.add(m, sn); return G; },
  awan: () => cloud(0.6),
  pesawat: () => { const G = new THREE.Group(); const b = capsule(0.07, 0.6, PLASTIK('#FFFFFF'), { ol: 0.006 }); b.rotation.z = Math.PI / 2; const w = rbox(0.18, 0.02, 0.8, PLASTIK('#1E6EFF')); const t = rbox(0.1, 0.16, 0.02, PLASTIK('#FF6FAE')); t.position.set(-0.32, 0.1, 0);
    const jet = [-0.22, 0.22].map(z => { const e = cyl(0.03, 0.03, 0.1, PLASTIK('#9AA0B4'), {}, 12); e.rotation.z = Math.PI / 2; e.position.set(0.02, -0.04, z); return e; }); G.add(b, w, t, ...jet); return G; },
  satelit: () => { const G = new THREE.Group(); const b = rbox(0.18, 0.18, 0.18, PLASTIK('#FFC93C', { metal: 0.4 }), { ol: 0.006 }); [-1, 1].forEach(sd => { const p = box(0.36, 0.01, 0.16, PLASTIK('#1E6EFF', { rough: 0.1, metal: 0.3 }), { ol: 0.004 }); p.position.x = sd * 0.3; G.add(p); }); const d = cone(0.08, 0.08, PLASTIK('#FFFFFF'), {}, 16); d.position.y = 0.14; G.add(b, d); return G; },
  bumi: () => { const tex = canvasTex('bumi', 512, 256, (x, w, h) => { x.fillStyle = '#3FA7FF'; x.fillRect(0, 0, w, h); x.fillStyle = '#5BD38A';
      for (let i = 0; i < 38; i++) { x.beginPath(); x.ellipse(rnd(i) * w, 30 + rnd(i + 5) * (h - 60), 18 + rnd(i + 9) * 46, 10 + rnd(i + 2) * 26, rnd(i) * 3, 0, 7); x.fill(); }
      x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, w, 14); x.fillRect(0, h - 14, w, 14); });
    const s = sph(1, PLASTIK('#ffffff', { map: tex, rough: 0.4 }), { ol: 0.012 }, 48, 32); const atm = glow('rgba(140,200,255,1)', 3.2); return grp(atm, s); },
  bulan: () => grp(sph(1, PLASTIK('#D9D6E4', { rough: 0.9, coat: 0.1, map: canvasTex('bulan', 256, 128, (x, w, h) => { x.fillStyle = '#E2DFEC'; x.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(120,110,150,.25)'; x.beginPath(); x.arc(rnd(i) * w, rnd(i + 3) * h, 3 + rnd(i + 5) * 12, 0, 7); x.fill(); } }) }), { ol: 0.012 }, 40, 28)),
  penggaris: (len = 3) => { const tex = canvasTex('ruler' + len, 1024, 64, (x, w, h) => { x.fillStyle = '#FFD84A'; x.fillRect(0, 0, w, h); x.fillStyle = '#24204A';
      for (let i = 0; i <= 100; i++) x.fillRect(i * w / 100, 0, 3, i % 10 ? 18 : 36); x.font = '900 18px Nunito'; for (let i = 1; i < 10; i++) x.fillText(String(i), i * w / 10 + 5, 54); });
    const r = box(len, 0.04, 0.22, PLASTIK('#ffffff', { map: tex }), { ol: 0.006 }); r.position.y = 0.02; return grp(r); },
  // uang kertas mainan (warna = pecahan): TOY.uang() merah 100rb; uangTex(col, label) for others
  uang: () => uangLembar('#E8454E', '100.000'),
  // gepok: a banded bundle of bills (100 lembar) — great for "dropping piles" with grow(stack('gepok', n, …))
  gepok: () => { const col = '#E8454E', side = canvasTex('gepok-side', 64, 64, (x, w, h) => { x.fillStyle = col; x.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.12)'; x.fillRect(0, i * 4, w, 1.5); } });
    const sm = PLASTIK('#ffffff', { map: side, rough: 0.6, coat: 0.25 }), tm = PLASTIK('#ffffff', { map: uangTex(col, '100.000'), rough: 0.6, coat: 0.3 });
    const b = mesh(new THREE.BoxGeometry(0.6, 0.11, 0.3), [sm, sm, tm, sm, sm, sm], { ol: 0.005 }); b.position.y = 0.055;
    const strap = box(0.1, 0.116, 0.306, PLASTIK('#FFF6E2', { rough: 0.7 })); strap.position.y = 0.055; return grp(b, strap); },
};
function uangTex(col, label) {
  return canvasTex('uang' + col + label, 512, 256, (x, w, h) => {
    x.fillStyle = col; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = 2; for (let i = 0; i < 26; i++) { x.beginPath(); for (let u = 0; u <= w; u += 8) x.lineTo(u, 30 + i * 8 + Math.sin(u / 24 + i) * 6); x.stroke(); }
    x.strokeStyle = '#FFE9A8'; x.lineWidth = 9; x.strokeRect(14, 14, w - 28, h - 28);
    const gr = x.createRadialGradient(110, h / 2, 6, 110, h / 2, 62); gr.addColorStop(0, '#FFF6D8'); gr.addColorStop(1, '#F2C866'); x.fillStyle = gr; x.beginPath(); x.arc(110, h / 2, 58, 0, 7); x.fill();
    x.fillStyle = 'rgba(0,0,0,.18)'; x.beginPath(); x.arc(110, h / 2 - 12, 20, 0, 7); x.fill(); x.fillRect(84, h / 2 + 10, 52, 30);
    x.fillStyle = '#FFFFFF'; x.font = '900 80px Nunito'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(label, 340, h / 2 + 4);
    x.font = '900 26px Nunito'; x.fillText('RUPIAH', 340, h / 2 + 62);
  });
}
function uangLembar(col, label) { const b = box(0.6, 0.02, 0.3, [PLASTIK(col, { rough: 0.7, coat: 0.2 }), PLASTIK(col, { rough: 0.7, coat: 0.2 }), PLASTIK('#ffffff', { map: uangTex(col, label), rough: 0.6, coat: 0.3 }), PLASTIK(col), PLASTIK(col), PLASTIK(col)], { ol: 0.004 }); b.position.y = 0.01; return grp(b); }

// pilar(id, h, o): a tall stack (uang/kertas/galon…) whose texture keeps its real layer size while it grows.
//   o = {w, d, sisi:'uang'|'galon'|colour, atas: material top texture, col, label}
// Returns the group; call every frame with the current height (units). Paper straps every ~0.5 unit.
function pilar(id, h, o = {}) {
  const P = build('pilar-' + id, () => {
    const col = o.col || '#E8454E', w = o.w || 0.62, d = o.d || 0.32;
    const side = canvasTex('pilar-side' + id, 64, 256, (x, W2, H2) => {
      x.fillStyle = col; x.fillRect(0, 0, W2, H2);
      for (let i = 0; i < 64; i++) { x.fillStyle = i % 2 ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.10)'; x.fillRect(0, i * 4, W2, 1.5); }
      x.fillStyle = '#FFF6E2'; x.fillRect(0, 108, W2, 40); x.fillStyle = 'rgba(36,32,74,.25)'; x.fillRect(0, 108, W2, 3); x.fillRect(0, 145, W2, 3);
    }, [1, 1]);
    const sideM = PLASTIK('#ffffff', { map: side, rough: 0.6, coat: 0.25 });
    const topM = PLASTIK('#ffffff', { map: uangTex(col, o.label || '100.000'), rough: 0.6, coat: 0.3 });
    const B = mesh(new THREE.BoxGeometry(w, 1, d), [sideM, sideM, topM, sideM, sideM, sideM], { ol: 0.008 }); B.position.y = 0.5;
    const G = grp(B); G.userData.B = B; G.userData.side = side; return G;
  });
  show(P); const hh = Math.max(0.002, h);
  P.userData.B.scale.y = hh; P.userData.B.position.y = hh / 2; P.userData.side.repeat.set(1, hh * (o.per || 2));
  return P;
}
// a stack / grid of n toy copies: o = {cols, rows (per layer), gap, layers auto}. Cached by key.
function stack(kind, n, o = {}) {
  const key = 'stack-' + kind + '-' + n + '-' + JSON.stringify(o);
  return build(key, () => {
    const G = new THREE.Group(), cols = o.cols || Math.ceil(Math.sqrt(n)), rows = o.rows || cols, gap = o.gap || 0.38, lh = o.layer || 0.55;
    for (let i = 0; i < n; i++) {
      const c = i % cols, r = Math.floor(i / cols) % rows, l = Math.floor(i / (cols * rows));
      const m = TOY[kind](); m.position.set((c - (cols - 1) / 2) * gap, l * lh, (r - (rows - 1) / 2) * gap); m.rotation.y = (rnd(i) - 0.5) * 0.4; m.userData.home = m.position.clone(); G.add(m);
    }
    return G;
  });
}
// a single toy that can be moved every frame
const ONE = {};
function toy(kind, id = '') { const k = kind + id; if (!ONE[k]) ONE[k] = prop(TOY[kind]()); return ONE[k]; }
// grow: the stack builds up item by item — each toy DROPS in from above with a bounce (instead of stretching)
const bounce = k => { const n = 7.5625, d = 2.75; if (k < 1 / d) return n * k * k; if (k < 2 / d) return n * (k -= 1.5 / d) * k + 0.75; if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + 0.9375; return n * (k -= 2.625 / d) * k + 0.984375; };
function grow(G, t, t0, t1, x = 0, z = 0, s = 1) {
  show(G); G.position.set(x, 0, z); G.scale.setScalar(s);
  const n = G.children.length;
  G.children.forEach((m, i) => {
    const ti = t0 + (t1 - t0) * (i / Math.max(1, n)), k = seg(t, ti, ti + 0.35), h = m.userData.home || m.position;
    m.visible = t >= ti; m.position.set(h.x, h.y + (1 - bounce(k)) * 1.6, h.z);
    if (i < 12) cue(ti + 0.3, 'tick', 0.35);
  });
}
// muncul: squash-and-stretch pop-in for any placed object (call after place)
function muncul(obj, t, t0, d = 0.4) {
  cue(t0, 'pop', 0.7); const s = obj.scale.x;
  if (t < t0) { obj.visible = false; return obj; }
  const k = seg(t, t0, t0 + d), sq = Math.sin(k * Math.PI * 2.2) * (1 - k) * 0.25;
  obj.scale.set(s * back(k) * (1 + sq), s * back(k) * (1 - sq), s * back(k) * (1 + sq)); return obj;
}

// ── mascot OHI: a little water gallon with a face, arms and feet ──
function ohiFace(expr) {
  return canvasTex('ohi-' + expr, 256, 256, (x, w, h) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#24204A'; x.strokeStyle = '#24204A'; x.lineCap = 'round'; x.lineWidth = 14;
    const eye = (ex, ey, r) => { x.beginPath(); x.ellipse(ex, ey, r * 0.8, r, 0, 0, 7); x.fillStyle = '#24204A'; x.fill(); x.beginPath(); x.arc(ex + r * 0.25, ey - r * 0.35, r * 0.32, 0, 7); x.fillStyle = '#fff'; x.fill(); };
    if (expr === 'kaget') { [[90, 110], [166, 110]].forEach(([ex, ey]) => { x.beginPath(); x.arc(ex, ey, 28, 0, 7); x.fillStyle = '#fff'; x.fill(); x.stroke(); x.beginPath(); x.arc(ex, ey, 11, 0, 7); x.fillStyle = '#24204A'; x.fill(); }); x.beginPath(); x.ellipse(128, 182, 22, 28, 0, 0, 7); x.fillStyle = '#7A1E3A'; x.fill(); x.stroke(); }
    else if (expr === 'mikir') { eye(90, 112, 18); eye(166, 112, 18); x.beginPath(); x.moveTo(150, 74); x.lineTo(188, 64); x.stroke(); x.beginPath(); x.moveTo(104, 182); x.quadraticCurveTo(128, 170, 152, 176); x.stroke(); }
    else if (expr === 'kedip') { [90, 166].forEach(ex => { x.beginPath(); x.moveTo(ex - 20, 116); x.lineTo(ex + 20, 116); x.stroke(); }); x.beginPath(); x.arc(128, 160, 34, 0.2, Math.PI - 0.2); x.stroke(); }
    else if (expr === 'wow') {   // star eyes + big open mouth (OHHIYAA! moment)
      [[88, 108], [168, 108]].forEach(([ex, ey]) => { x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 13 : 32, a = i / 10 * Math.PI * 2 - Math.PI / 2; x.lineTo(ex + Math.cos(a) * r, ey + Math.sin(a) * r); } x.closePath(); x.fillStyle = '#FFC93C'; x.fill(); x.lineWidth = 8; x.stroke(); });
      x.lineWidth = 12; x.beginPath(); x.ellipse(128, 176, 36, 32, 0, 0, 7); x.fillStyle = '#7A1E3A'; x.fill(); x.stroke(); x.beginPath(); x.ellipse(128, 192, 18, 10, 0, 0, 7); x.fillStyle = '#FF6F8E'; x.fill(); }
    else { eye(90, 114, 20); eye(166, 114, 20); x.beginPath(); x.arc(128, 160, 36, 0.15, Math.PI - 0.15); x.closePath(); x.fillStyle = '#7A1E3A'; x.fill(); x.stroke(); }
    x.fillStyle = 'rgba(255,111,174,.6)'; [[58, 152], [198, 152]].forEach(([cx, cy]) => { x.beginPath(); x.ellipse(cx, cy, 20, 12, 0, 0, 7); x.fill(); });
  });
}
const OHI = (() => {
  const C = new THREE.Group(); C.visible = false; SCN.add(C); CHARS.push(C);
  const inner = new THREE.Group(); C.add(inner); C.userData.inner = inner;
  const body = TOY.galon(); body.scale.setScalar(2.2); inner.add(body);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.44), new THREE.MeshBasicMaterial({ transparent: true, map: ohiFace('senang') }));
  face.position.set(0, 0.5, 0.362); inner.add(face); C.userData.face = face;
  const arms = [-1, 1].map(sd => { const P = new THREE.Group(); P.position.set(sd * 0.36, 0.5, 0); const a = capsule(0.04, 0.18, PLASTIK('#1E6EFF'), { ol: 0.006 }); a.position.y = -0.12; P.add(a); const h = sph(0.065, PLASTIK('#FFFFFF'), { ol: 0.006 }, 12, 10); h.position.y = -0.27; P.add(h); inner.add(P); return P; });
  [-1, 1].forEach(sd => { const f = rbox(0.15, 0.07, 0.22, PLASTIK('#1E6EFF'), { ol: 0.006 }); f.position.set(sd * 0.12, 0.035, 0.04); C.add(f); });
  const blob = mesh(new THREE.CircleGeometry(0.42, 24), mat('#24204A', { basic: true, opacity: 0.16 }), { cast: false, recv: false }); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.005; C.add(blob);
  C.userData.arms = arms; return C;
})();
// ohi(t, {x, z, ry, s, expr:'senang'|'kaget'|'mikir'|'wow', wave, jump, point})
// blinks by itself; switches to star eyes ('wow') during the OHHIYAA! burst automatically.
function ohi(t, o = {}) {
  const C = OHI; C.visible = true; const s = o.s || 1;
  const ph = (t * 7) % Math.PI, jumpY = o.jump ? Math.abs(Math.sin(t * 7)) * 0.2 * s : 0;
  const land = o.jump ? Math.max(0, 1 - Math.abs(Math.sin(t * 7)) * 4) : 0;            // squash on landing
  C.position.set(o.x || 0, jumpY, o.z || 0); C.rotation.set(0, o.ry || 0, Math.sin(t * 2.4) * 0.03); C.scale.setScalar(s);
  const breathe = 1 + Math.sin(t * 3.1) * 0.015;
  C.userData.inner.scale.set(1 + land * 0.12, breathe * (1 - land * 0.14), 1 + land * 0.12);
  C.userData.expr = o.expr || 'senang';
  const [L, R] = C.userData.arms;
  L.rotation.z = o.wave ? -2.4 + Math.sin(t * 10) * 0.4 : -0.25 - Math.sin(t * 2) * 0.05; R.rotation.z = o.point ? 1.9 : o.jump ? 2.3 + Math.sin(t * 14) * 0.2 : 0.25 + Math.sin(t * 2) * 0.05;
  void ph;
}
function ohiFaceUpdate(t) {
  if (!OHI.visible) return;
  let e = OHI.userData.expr || 'senang';
  if ((OHH_SPANS || []).some(([a, b]) => t >= a && t <= b)) e = 'wow';
  else if ((e === 'senang' || e === 'mikir') && (t % 3.3) < 0.12) e = 'kedip';
  const M = OHI.userData.face.material; if (M.map !== ohiFace(e)) { M.map = ohiFace(e); M.needsUpdate = true; }
}
let OHH_SPANS = [];

// ── 2D overlays ──
// big number badge
function angka(txt, y, t0, o = {}) {
  cue(t0, 'stamp'); for (let i = 0; i < 6; i++) cue(t0 + i * 0.07, 'tick', 0.4); punch(t0, 4);
  const full = txt, m = /\d[\d.]*(?:,\d+)?/.exec(txt), val = m && !m[0].includes(',') ? parseInt(m[0].replace(/\./g, ''), 10) : 0;
  ui(t => {
    if (t < t0 || (o.t1 && t > o.t1)) return;
    // numbers roll up from 0 (slot-machine feel); decimals and small numbers appear as they are
    const txt = (o.hitung !== false && val >= 10 && t < t0 + 0.6) ? full.replace(m[0], Math.round(val * easeOut(seg(t, t0, t0 + 0.6))).toLocaleString('id-ID')) : full;
    const k = back(seg(t, t0, t0 + 0.3)), size = fitSize(full, o.size || 150, 900);
    g.save(); g.translate(540, y); g.rotate(o.rot ?? -0.03); g.scale(k, k);
    g.font = `900 ${size}px ${FONT}`; const w = g.measureText(full).width + size * 0.7, h = size * 1.3;
    if (t < t0 + 0.6) { g.save(); g.globalAlpha = 1 - seg(t, t0, t0 + 0.6); g.beginPath(); for (let i = 0; i < 16; i++) { const r = (i % 2 ? 0.55 : 0.9) * w * (0.7 + seg(t, t0, t0 + 0.6) * 0.5), an = i / 16 * Math.PI * 2; g.lineTo(Math.cos(an) * r, Math.sin(an) * r * 0.45); } g.closePath(); g.fillStyle = o.col || '#FF6FAE'; g.fill(); g.restore(); }
    rr(-w / 2 + 10, -h / 2 + 14, w, h, h * 0.3); g.fillStyle = OL; g.fill();
    rr(-w / 2, -h / 2, w, h, h * 0.3); g.fillStyle = '#FFFFFF'; g.fill(); g.lineWidth = 10; g.strokeStyle = o.col || '#FF6FAE'; g.stroke();
    g.fillStyle = OL; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, size * 0.05);
    if (o.sub) { const ss = fitSize(o.sub, 54, w - 40); g.font = `900 ${ss}px ${FONT}`; g.fillStyle = o.col || '#FF6FAE'; g.fillText(o.sub, 0, h / 2 + ss * 0.9); }
    g.restore();
  });
}
// "TEBAK DULU!" + 3-2-1 countdown ring between t0..t1 (viewer guesses in the comments)
// o.opsi = ['A. Setengah jalan', 'B. Pas sampai', 'C. Lewat!'] → multiple choice under the ring (easy one-letter comments)
function tebak(t0, t1, o = {}) {
  cue(t0, 'pop'); [0, 1, 2].forEach(i => { cue(t0 + (t1 - t0) * i / 3 + 0.05, 'tick', 0.8); punch(t0 + (t1 - t0) * i / 3, 2.5); });
  ui(t => {
    if (t < t0 || t > t1) return;
    const k = back(seg(t, t0, t0 + 0.25)), left = 3 - Math.floor((t - t0) / ((t1 - t0) / 3)), frac = ((t - t0) / ((t1 - t0) / 3)) % 1;
    g.save(); g.translate(540, o.y || 360); g.scale(k, k);
    rr(-300, -70, 600, 140, 70); g.fillStyle = OL; g.fill(); g.fillStyle = '#FFC93C'; g.font = `900 72px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.txt || 'TEBAK DULU!', 0, 4);
    g.translate(0, 190); g.beginPath(); g.arc(0, 0, 90, 0, 7); g.fillStyle = '#FFFFFF'; g.fill(); g.lineWidth = 10; g.strokeStyle = OL; g.stroke();
    g.beginPath(); g.arc(0, 0, 90, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - frac)); g.lineWidth = 16; g.strokeStyle = '#FF6FAE'; g.stroke();
    g.fillStyle = OL; g.font = `900 110px ${FONT}`; g.fillText(String(Math.max(1, left)), 0, 6);
    (o.opsi || []).forEach((txt, i) => { const ti = t0 + 0.25 + i * 0.35; if (t < ti) return; const kk = back(seg(t, ti, ti + 0.25)), y = 170 + i * 120;
      g.save(); g.translate(0, y); g.scale(kk, kk); const col = ['#FF6FAE', '#7EE8CF', '#FFC93C'][i % 3]; g.font = `900 58px ${FONT}`; const w = Math.max(520, g.measureText(txt).width + 80);
      rr(-w / 2 + 6, -44, w, 92, 46); g.fillStyle = OL; g.fill(); rr(-w / 2, -50, w, 92, 46); g.fillStyle = col; g.fill(); g.lineWidth = 7; g.strokeStyle = OL; g.stroke();
      g.fillStyle = OL; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, -2); g.restore(); });
    g.restore();
  });
}
// the signature moment: starburst + "OHHIYAA!"
function ohhiyaa(t0, o = {}) {
  cue(t0, 'boom', 0.8); cue(t0, 'stamp'); punch(t0, 8);
  const d0 = o.d || 1.4; if (!OHH_SPANS.some(([a]) => a === t0)) OHH_SPANS.push([t0 - 0.1, t0 + d0 + 0.6]);
  if (t0 <= TNOW && TNOW < t0 + 0.5) SHAKE = Math.max(SHAKE, 0.25 * (1 - seg(TNOW, t0, t0 + 0.5)));
  ui(t => {   // white flash + rotating sun rays behind the burst
    if (t < t0 - 0.02 || t > t0 + d0) return;
    const f = 1 - seg(t, t0, t0 + 0.18); if (f > 0) { g.fillStyle = `rgba(255,255,255,${0.85 * f})`; g.fillRect(0, 0, W, H); }
    g.save(); g.globalAlpha = 0.28 * (1 - seg(t, t0 + d0 - 0.3, t0 + d0)); g.translate(540, o.y || 640); g.rotate(t * 0.8);
    for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(0, 0); g.lineTo(1400, -110); g.lineTo(1400, 110); g.closePath(); g.fillStyle = i % 2 ? '#FFC93C' : '#FFFFFF'; g.fill(); }
    g.restore();
  });
  ui(t => {
    const d = o.d || 1.4; if (t < t0 || t > t0 + d) return;
    const k = 1 + 0.6 * (1 - easeOut(seg(t, t0, t0 + 0.22))), a = 1 - seg(t, t0 + d - 0.25, t0 + d);
    g.save(); g.globalAlpha = a; g.translate(540, o.y || 640); g.rotate(-0.06); g.scale(k, k);
    g.beginPath(); for (let i = 0; i < 24; i++) { const r = i % 2 ? 230 : 330, an = i / 24 * Math.PI * 2 + t * 0.6; g.lineTo(Math.cos(an) * r, Math.sin(an) * r * 0.62); } g.closePath();
    g.fillStyle = '#FFC93C'; g.fill(); g.lineWidth = 10; g.strokeStyle = OL; g.stroke();
    strokeText(o.txt || 'OHHIYAA!', 0, 4, fitSize(o.txt || 'OHHIYAA!', 150, 560), '#FF4F8B', 26);
    g.restore();
    g.save(); g.globalAlpha = a; for (let i = 0; i < 30; i++) { const an = rnd(i) * 7, sp = 300 + rnd(i + 3) * 500, kk = easeOut(seg(t, t0, t0 + 0.9)); g.fillStyle = ['#FF6FAE', '#7EE8CF', '#FFC93C', '#8FB8FF'][i % 4]; g.fillRect(540 + Math.cos(an) * sp * kk - 8, (o.y || 640) + Math.sin(an) * sp * kk + 300 * kk * kk - 5, 16, 10); } g.restore();
  });
  if (!bigWord.spans) bigWord.spans = []; if (!bigWord.spans.some(([a]) => a === t0)) bigWord.spans.push([t0, t0 + (o.d || 1.4)]);
}

// landmark ladder: a vertical altimeter on the left; each checkpoint lights up when passed.
// items = [{label, sub, t}] from bottom to top
function tangga(items, o = {}) {
  items.forEach(it => cue(it.t, 'pop', 0.8));
  ui(t => {
    if (t < items[0].t - 0.2 || (o.t1 && t > o.t1)) return;
    const x = o.x || 120, y0 = o.y0 || 1380, y1 = o.y1 || 330, n = items.length, step = (y0 - y1) / (n - 1);
    let k = 0; items.forEach((it, i) => { if (t >= it.t) k = i; });
    const prog = k + clamp((t - items[k].t) / Math.max(0.3, ((items[k + 1] || items[k]).t - items[k].t)), 0, 1) * (k < n - 1 ? 1 : 0);
    g.save(); rr(x - 16, y1 - 20, 32, y0 - y1 + 40, 16); g.fillStyle = 'rgba(255,255,255,.9)'; g.fill(); g.lineWidth = 6; g.strokeStyle = OL; g.stroke();
    const yp = y0 - prog * step; rr(x - 10, yp, 20, y0 - yp + 14, 10); g.fillStyle = '#FF6FAE'; g.fill();
    items.forEach((it, i) => {
      const y = y0 - i * step, on = t >= it.t, kk = on ? back(seg(t, it.t, it.t + 0.25)) : 1;
      g.beginPath(); g.arc(x, y, 20 * (on ? kk : 0.8), 0, 7); g.fillStyle = on ? '#FFC93C' : '#FFFFFF'; g.fill(); g.lineWidth = 5; g.strokeStyle = OL; g.stroke();
      if (!on && i > k + 1) return;
      g.save(); g.translate(x + 40, y); g.scale(on ? kk : 0.9, on ? kk : 0.9); g.globalAlpha = on ? 1 : 0.55;
      const size = i === k ? 54 : 40; g.font = `900 ${size}px ${FONT}`; const w = g.measureText(it.label).width + 40;
      rr(0, -size * 0.75, w, size * 1.5, 18); g.fillStyle = i === k ? OL : 'rgba(36,32,74,.75)'; g.fill();
      g.fillStyle = i === k ? '#FFC93C' : '#FFFFFF'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(it.label, 20, 2);
      if (it.sub && i === k) { g.font = `900 34px ${FONT}`; g.fillStyle = OL; g.fillText(it.sub, 20, size * 1.25); }
      g.restore();
    });
    g.restore();
  });
}
