// Builds the launcher icon and splash screen in assets/ from the Canva icon
// (assets/canva/icon-1024.png), then `npm run assets` turns them into every Android size.
// Run: node scripts/make-icons.cjs   (needs Playwright)
const { chromium } = require('playwright');
const { join } = require('path');
const { readFileSync } = require('fs');
const out = join(__dirname, '..', 'assets');
const icon = 'data:image/png;base64,' + readFileSync(join(out, 'canva', 'icon-1024.png')).toString('base64');
const BG = '#020a1f';

(async () => {
  const b = await chromium.launch();
  const shot = async (name, size, html, transparent = false) => {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    await p.setContent(`<html><body style="margin:0;background:${transparent ? 'transparent' : BG}">${html}</body></html>`);
    await p.waitForTimeout(200);
    await p.screenshot({ path: join(out, name), omitBackground: transparent });
    await p.close();
  };
  // Legacy icon: the artwork as is
  await shot('icon-only.png', 1024, `<img src="${icon}" style="width:1024px;height:1024px;display:block">`);
  // Adaptive icon: the art, with its own rounded corners, inside the launcher's safe zone on a matching background
  await shot('icon-background.png', 1024, `<div style="width:1024px;height:1024px;background:radial-gradient(circle at 50% 35%,#0b2a6b,${BG} 75%)"></div>`);
  await shot('icon-foreground.png', 1024, `<div style="width:1024px;height:1024px;display:grid;place-items:center">
    <img src="${icon}" style="width:700px;height:700px;border-radius:92px;clip-path:inset(4px round 88px)"></div>`, true);
  const splash = `<div style="width:2732px;height:2732px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:90px;background:radial-gradient(circle at 50% 40%,#0b2a6b,${BG} 60%)">
    <img src="${icon}" style="width:880px;height:880px;clip-path:inset(6px round 150px)">
    <div style="font:900 210px Arial Black,Arial,sans-serif;letter-spacing:10px;color:#ffb703;text-shadow:0 10px 0 #9a4f00">PARKING 3D</div></div>`;
  await shot('splash.png', 2732, splash);
  await shot('splash-dark.png', 2732, splash);
  await b.close();
  console.log('icons written to', out);
})();
