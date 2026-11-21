// Pemeriksa SEBELUM render (murah ±30 dtk, mencegah render 15 menit yang gagal/salah).
// Usage (dari video/src):  EP=ohNN node ohlint.js
// Memeriksa: halaman termuat tanpa error, DURATION 40–55 dtk, setiap ±1,5 dtk renderFrame() tanpa exception (kata VO yang
// dicari at() harus ada, mainan TOY harus ada), OHHIYAA! tepat 1 kali, posisi OHHIYAA! di dalam durasi. Keluaran 1–4 baris.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const ep = process.env.EP; if (!ep) { console.log('LINT GAGAL: set EP=ohNN'); process.exit(1); }
  const b = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-dev-shm-usage', '--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push('page: ' + e.message));
  await p.goto('file://' + path.join(__dirname, ep + '.html')); await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(() => {
    const out = { dur: DURATION, err: [], n: 0 };
    for (let t = 0.2; t < DURATION; t += 1.5) { try { renderFrame(t); out.n++; } catch (e) { out.err.push(t.toFixed(1) + 's: ' + e.message); if (out.err.length > 3) break; } }
    const U = typeof OHH_SPANS !== 'undefined' ? [...new Set(OHH_SPANS.map(s => (s[0] + 0.1).toFixed(2)))] : []; out.ohh = U.length; out.ohhT = U.length ? parseFloat(U[0]) : null;
    return out;
  });
  const bad = [...errs, ...r.err];
  if (r.dur < 40 || r.dur > 55) bad.push(`durasi ${r.dur} dtk di luar 40–55`);
  if (r.ohh !== 1) bad.push(`OHHIYAA! harus tepat 1×, terdeteksi ${r.ohh}`);
  if (bad.length) { console.log('LINT GAGAL:\n - ' + bad.join('\n - ')); await b.close(); process.exit(1); }
  console.log(`LINT OK ${ep}: ${r.n} frame diuji, durasi ${r.dur} dtk, OHHIYAA! @${r.ohhT.toFixed(1)}s`); await b.close();
})();
