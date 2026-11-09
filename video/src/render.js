// Usage (EP=ep01|ep02 picks the episode page, default ep01):
//   node render.js video <out.mp4> [fps] [audio]   render full DURATION to mp4 (optional VO audio)
//   node render.js stills <dir> t1 t2 ...          render single frames as PNG
//   node render.js cues <out.json>                 dump audio cues (3D channels: collectCues())
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] }); // lets canvases use local images (emoji, mascot) without tainting
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); });
  await page.goto('file://' + path.join(__dirname, (process.env.EP || 'ep01') + '.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => (window.prepare ? window.prepare() : null));

  const grab = t => page.evaluate(t => { renderFrame(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, t);

  if (mode === 'cues') {
    fs.writeFileSync(out, JSON.stringify(await page.evaluate(() => collectCues()), null, 1));
  } else if (mode === 'stills') {
    fs.mkdirSync(out, { recursive: true });
    for (const t of rest) fs.writeFileSync(path.join(out, `f_${t}.png`), Buffer.from(await grab(parseFloat(t)), 'base64'));
  } else {
    const fps = parseInt(rest[0] || '30', 10), audio = rest[1];
    const dur = await page.evaluate(() => DURATION);
    const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-'];
    if (audio) args.push('-i', audio); else args.push('-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo');
    args.push('-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '192k', '-t', String(dur), '-movflags', '+faststart', out);
    const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
    const total = Math.round(dur * fps);
    for (let i = 0; i < total; i++) {
      const buf = Buffer.from(await grab(i / fps), 'base64');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 60 === 0) process.stdout.write(`frame ${i}/${total}\n`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
