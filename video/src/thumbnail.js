// Thumbnail High CTA for every division.
// Usage (from video/src):  node thumbnail.js <ep>
//   reads  video/thumb/<ep>.json   { "ep": "tl01", "varian": [ {nama:"A", latar:{frame:41.2, zoom:1.2, fokus:[540,900]}, teks:[...], ...}, ... ] }
//   writes video/out/thumb/<ep>-<nama>.png (1080×1920) and video/out/thumb/<ep>-cek.png (review sheet incl. feed size)
// The channel (and its look) is found from the episode prefix in workflow/config.json → channels.<id>.thumbnail.
// A variant with latar.frame takes that moment of the episode as background, without captions/hook text.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ep = process.argv[2];
if (!ep) { console.error('usage: node thumbnail.js <ep>'); process.exit(1); }
const ROOT = path.join(__dirname, '..', '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'workflow', 'config.json'), 'utf8'));
const [chId, ch] = Object.entries(cfg.channels).find(([, c]) => new RegExp('^' + c.prefix + '\\d').test(ep)) || [null, {}];
const preset = { ...(cfg.thumbnail_default || {}), ...(ch.thumbnail || {}) };
preset.warna = { ...((cfg.thumbnail_default || {}).warna || {}), ...((ch.thumbnail || {}).warna || {}) };
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'video', 'thumb', ep + '.json'), 'utf8'));
const outDir = path.join(ROOT, 'video', 'out', 'thumb');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const fail = e => { console.error('PAGE ERROR', e.message); process.exit(1); };
  let epPage = null;
  async function frameAt(t) {
    if (!epPage) {
      epPage = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
      epPage.on('pageerror', fail);
      await epPage.goto('file://' + path.join(__dirname, ep + '.html'));
      await epPage.evaluate(() => document.fonts.ready);
      await epPage.evaluate(() => (window.prepare ? window.prepare() : null));
      // clean plate: no VO captions / hook title (Mas Kharis); the 3D channel is read from its WebGL canvas directly
      await epPage.evaluate(() => { if (typeof voCaption === 'function') window.voCaption = () => {}; if (typeof hookTitle === 'function') window.hookTitle = () => {}; if (typeof topLines === 'function') window.topLines = () => {}; });
    }
    return epPage.evaluate(t => { renderFrame(t); const src = typeof glc !== 'undefined' ? glc : document.getElementById('c'); return src.toDataURL('image/png'); }, t);
  }
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', fail);
  page.on('console', m => { if (m.type() === 'error') console.error('page:', m.text()); });
  await page.goto('file://' + path.join(__dirname, 'thumb.html'));
  await page.evaluate(() => window.prepare());

  const files = [], names = [];
  for (const v of spec.varian) {
    const frame = v.latar && v.latar.frame != null ? await frameAt(v.latar.frame) : null;
    const b64 = await page.evaluate(([v, p, f]) => window.compose(v, p, f), [v, preset, frame]);
    const f = path.join(outDir, `${ep}-${v.nama}.png`); fs.writeFileSync(f, Buffer.from(b64, 'base64'));
    files.push('data:image/png;base64,' + b64); names.push(`${ep}-${v.nama}`); console.log('thumbnail', path.relative(ROOT, f));
  }
  const sheet = await page.evaluate(([u, n]) => window.sheet(u, n), [files, names]);
  fs.writeFileSync(path.join(outDir, `${ep}-cek.png`), Buffer.from(sheet, 'base64'));
  console.log('cek', path.relative(ROOT, path.join(outDir, `${ep}-cek.png`)), '| channel', chId || '(default)');
  await browser.close();
})();
