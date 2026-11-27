// Ekspor file .drawio menjadi PNG memakai mesin render resmi draw.io (export3.html)
// yang dijalankan di Chromium lewat Playwright.
//
// Pemakaian:
//   DRAWIO_WEBAPP=/path/ke/drawio/src/main/webapp node tools/export_drawio.js diagram/02-use-case.drawio assets/02-use-case.png
//
// DRAWIO_WEBAPP = folder "webapp" dari draw.io desktop (isi app.asar) atau repo jgraph/drawio.
// Di laptop sendiri cukup pakai menu draw.io: File > Export as > PNG (zoom 250%, border 20).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const [input, output, scaleArg] = process.argv.slice(2);
  const webapp = process.env.DRAWIO_WEBAPP;
  if (!input || !output || !webapp) {
    console.error('Pemakaian: DRAWIO_WEBAPP=... node tools/export_drawio.js <input.drawio> <output.png> [skala]');
    process.exit(1);
  }
  const xml = fs.readFileSync(input, 'utf8');
  const scale = Number(scaleArg || 2.5);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1200 } });
  await page.goto('file://' + path.join(webapp, 'export3.html'));
  await page.waitForFunction(() => typeof render === 'function');
  await page.evaluate(({ xml, scale }) => render({ xml, format: 'png', scale, border: 20, w: 0, h: 0 }), { xml, scale });
  await page.waitForSelector('#LoadingComplete', { state: 'attached', timeout: 60000 });
  const b = JSON.parse(await page.getAttribute('#LoadingComplete', 'bounds'));
  const w = Math.ceil(b.width + b.x), h = Math.ceil(b.height + b.y);
  await page.setViewportSize({ width: Math.max(w, 100), height: Math.max(h, 100) });
  await page.screenshot({ path: output, clip: { x: 0, y: 0, width: w, height: h }, omitBackground: false });
  await browser.close();
  console.log('OK:', output, `${w}x${h}`);
})().catch((e) => { console.error(e); process.exit(1); });
