// Channel branding for every division: 3 profile logos (800×800) + YouTube banner (2560×1440) + review sheets.
// Usage (from video/src):  node brand.js <channel-id>       e.g. node brand.js ternyata-leluhur
//   reads  video/brand/<channel-id>.json   (nama, tagline, jadwal, warna, pola, art, logo[3], banner, bio)
//   writes video/out/brand/<channel-id>/logo-A.png … banner.png, cek-logo.png, cek-banner.png
// Art sources: {"kharis": {...}} (vector Mas Kharis), {"frame": {"ep":"tl01","t":9.5}} (clean episode frame),
// {"maskot": "senang"} (Dari 1 mnt mascot), or none.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const id = process.argv[2];
if (!id) { console.error('usage: node brand.js <channel-id>'); process.exit(1); }
const ROOT = path.join(__dirname, '..', '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'workflow', 'config.json'), 'utf8'));
const ch = cfg.channels[id] || {};
const preset = { ...(cfg.thumbnail_default || {}), ...(ch.thumbnail || {}) };
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'video', 'brand', id + '.json'), 'utf8'));
const out = path.join(ROOT, 'video', 'out', 'brand', id); fs.mkdirSync(out, { recursive: true });
const save = (name, b64) => { fs.writeFileSync(path.join(out, name), Buffer.from(b64, 'base64')); console.log('brand', path.relative(ROOT, path.join(out, name))); };

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const fail = e => { console.error('PAGE ERROR', e.message); process.exit(1); };
  async function artUrl() {
    const A = spec.art || {};
    if (A.kharis) {
      const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } }); p.on('pageerror', fail);
      await p.goto('file://' + path.join(__dirname, 'brand-mk.html'));
      return p.evaluate(a => art(a.exp, a.look), A.kharis);
    }
    if (A.frame) {
      const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } }); p.on('pageerror', fail);
      await p.goto('file://' + path.join(__dirname, A.frame.ep + '.html'));
      await p.evaluate(() => document.fonts.ready); await p.evaluate(() => (window.prepare ? window.prepare() : null));
      await p.evaluate(() => { ['voCaption', 'hookTitle', 'topLines'].forEach(n => { if (typeof window[n] === 'function') window[n] = () => {}; }); });
      return p.evaluate(t => { renderFrame(t); return (typeof glc !== 'undefined' ? glc : document.getElementById('c')).toDataURL('image/png'); }, A.frame.t);
    }
    return null;
  }
  const art = await artUrl();
  if (art && process.env.ART) fs.writeFileSync(path.join(out, 'art.png'), Buffer.from(art.split(',')[1], 'base64'));
  const page = await browser.newPage({ viewport: { width: 2560, height: 1440 } }); page.on('pageerror', fail);
  page.on('console', m => { if (m.type() === 'error') console.error('page:', m.text()); });
  await page.goto('file://' + path.join(__dirname, 'brand.html')); await page.evaluate(() => window.prepare());
  const urls = [], names = [];
  for (const L of spec.logo) {
    const b64 = await page.evaluate(([s, p, a, l]) => window.logo(s, p, a, l), [spec, preset, art, L]);
    save(`logo-${L.nama}.png`, b64); urls.push('data:image/png;base64,' + b64); names.push(`Logo ${L.nama}`);
  }
  const bn = await page.evaluate(([s, p, a, b]) => window.banner(s, p, a, b), [spec, preset, art, spec.banner || {}]);
  save('banner.png', bn);
  save('cek-logo.png', await page.evaluate(([u, n]) => window.cekLogo(u, n), [urls, names]));
  save('cek-banner.png', await page.evaluate(u => window.cekBanner(u), 'data:image/png;base64,' + bn));
  await browser.close();
})();
