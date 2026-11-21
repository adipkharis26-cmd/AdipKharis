// Pustaka bersama Ohhiyaa! untuk episode BARU (oh10+): memangkas kode per episode. Dimuat setelah ohhiyaa3d.js
// (episode lama oh01–oh09 tidak memuatnya dan tidak berubah). Semua fungsi di sini = versi yang sudah teruji di oh05–oh09.
// hOf(t, [[t,v],...])           interpolasi halus (ease) antar titik waktu → nilai (tinggi menara, nomor lipatan, dst.)
// towerOf(id, h, {w, c1, c2})   menara bertekstur lapisan, tinggi h berubah tiap frame; c1 dasar, c2 garis
// follow(h, cx)                 kamera mengikuti puncak menara (gaya oh01/oh05)
// lane(kind, n, gap, x, t, t0, t1, S)  barisan mainan menjauhi kamera (-z), tumbuh t0..t1 (alur duel)
// counterUI(t0, t1, fn, y)      penghitung teks dinamis (mis. 'LIPATAN KE-N') bergaya chip kuning
function hOf(t, pts) { if (t <= pts[0][0]) return pts[0][1]; for (let i = 0; i < pts.length - 1; i++) if (t < pts[i + 1][0]) return lerp(pts[i][1], pts[i + 1][1], ease(seg(t, pts[i][0], pts[i + 1][0]))); return pts[pts.length - 1][1]; }
function towerOf(id, h, o = {}) {
  const G = build('tw-' + id, () => {
    const c1 = o.c1 || '#DDE4F6', c2 = o.c2 || '#5A68A0';
    const side = canvasTex('tw-side-' + id, 64, 128, (x, ww, hh) => {
      x.fillStyle = c1; x.fillRect(0, 0, ww, hh);
      for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? 'rgba(255,255,255,.6)' : c2 + '66'; x.fillRect(0, i * 8, ww, 3); }
    }, [1, 1]);
    const m = PLASTIK('#ffffff', { map: side, rough: 0.5, coat: 0.3 }), top = PLASTIK(c2, { rough: 0.5 });
    const B = mesh(new THREE.BoxGeometry(1, 1, 1), [m, m, top, m, m, m], { ol: 0.008 });
    const g2 = grp(B); g2.userData.B = B; g2.userData.side = side; return g2;
  });
  show(G); const hh = Math.max(0.002, h), w = o.w || 0.7;
  G.userData.B.scale.set(w, hh, w); G.userData.B.position.y = hh / 2; G.userData.side.repeat.set(1, hh * 1.5);
  return G;
}
function follow(h, cx = 0) {
  CAM.fov = 54; CAM.updateProjectionMatrix();
  CAM.position.set(cx + 1.2 + h * 0.08, 1.4 + h * 0.4, 4.6 + h * 1.15); CAM.lookAt(cx, 0.4 + h * 0.62, 0);
  SUN.target.position.set(0, 0, 0); SUN.position.copy(SUN_DIR).multiplyScalar(14);
}
function lane(kind, n, gap, x, t, t0, t1, S = 1.6) {
  const G = stack(kind, n, { cols: 1, rows: n, gap });
  if (!G.userData.r) { G.userData.r = 1; G.children.forEach(m => { m.rotation.y += Math.PI / 2; m.userData.home.z = -m.userData.home.z; }); }
  grow(G, t, t0, t1, x, 3 - (n * gap * S) / 2, S);
}
function counterUI(t0, t1, fn, y = 1250) {
  ui(t => {
    if (t < t0 || t > t1) return;
    const k = back(seg(t, t0, t0 + 0.3)), txt = fn(t);
    g.save(); g.translate(540, y); g.scale(k, k);
    g.font = `900 64px ${FONT}`; const w = g.measureText(txt).width + 80;
    rr(-w / 2 + 6, -42, w, 100, 50); g.fillStyle = OL; g.fill(); rr(-w / 2, -50, w, 100, 50); g.fillStyle = '#FFC93C'; g.fill(); g.lineWidth = 7; g.strokeStyle = OL; g.stroke();
    g.fillStyle = OL; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 3); g.restore();
  });
}
