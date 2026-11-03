// Draws the launcher icon, splash screen and Google Play feature graphic from real renders of the game.
// Needs a local server on :8765 serving the repo root (python3 -m http.server 8765) and Playwright.
// Run: node scripts/make-art.cjs   then   npm run assets
const { chromium } = require('playwright');
const { join } = require('path');
const fs = require('fs');
const assets = join(__dirname, '..', 'assets'), store = join(__dirname, '..', 'store');

async function render(b, w, h, arg) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('http://localhost:8765/drive/');
  await p.waitForTimeout(2500);
  await p.evaluate(pose, arg);
  await p.waitForTimeout(2500);
  const buf = await p.screenshot();
  await p.close();
  return 'data:image/png;base64,' + buf.toString('base64');
}
// Hides the menus, puts the sports car on the avenue and places the camera
const pose = ([tod, model, color, cam, look, fov, z]) => {
  document.querySelectorAll('.screen,#coinChip,#loading').forEach(e => e.style.display = 'none');
  game.setTOD(tod); game.setPlayerModel(model); game.P().paint.color.setHex(color);
  Object.assign(game.car, { x: -1.75, z, th: 0, v: 0 });
  game.holdCam(true); game.freeze();
  game.P().root.traverse(o => { if (o.isSpotLight) o.intensity = 0; });
  const c = game.camera, x = game.car.x;
  c.fov = fov; c.position.set(x + cam[0], cam[1], z + cam[2]); c.lookAt(x + look[0], look[1], z + look[2]); c.updateProjectionMatrix();
};
async function compose(b, w, h, html, file, transparent = false) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent(`<html><head><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@900&display=swap" rel="stylesheet"></head><body style="margin:0;background:${transparent ? 'transparent' : '#0b1220'}">${html}</body></html>`);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: file, omitBackground: transparent });
  await p.close();
}

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const sq = await render(b, 1024, 1024, ['sunset', 4, 0xe63946, [3.6, 1.5, 7.4], [-.7, .55, .3], 40, 60]);
  const wide = await render(b, 1024, 500, ['sunset', 4, 0xe63946, [4.6, 1.3, 7.2], [-1.8, 1.2, 0], 40, 60]);
  const badge = s => `<div style="position:absolute;top:${s * .07}px;right:${s * .07}px;padding:${s * .012}px ${s * .03}px;border-radius:${s * .03}px;background:linear-gradient(#ffc933,#fb8500);font:900 ${s * .075}px Cairo,Arial Black,sans-serif;color:#241500;box-shadow:0 ${s * .01}px 0 #9a4f00">3D</div>`;
  const art = s => `<div style="position:relative;width:${s}px;height:${s}px;background:url(${sq}) center/cover">
    <div style="position:absolute;inset:0;background:linear-gradient(transparent 55%,rgba(5,10,20,.35))"></div>${badge(s)}</div>`;
  // legacy icon, adaptive icon (art inside the launcher safe zone) and its background
  await compose(b, 1024, 1024, art(1024), join(assets, 'icon-only.png'));
  await compose(b, 1024, 1024, `<div style="width:1024px;height:1024px;background:url(${sq}) center/cover;filter:blur(30px) brightness(.7)"></div>`, join(assets, 'icon-background.png'));
  await compose(b, 1024, 1024, `<div style="width:1024px;height:1024px;display:grid;place-items:center"><div style="border-radius:110px;overflow:hidden;width:700px;height:700px">${art(700)}</div></div>`, join(assets, 'icon-foreground.png'), true);
  await compose(b, 512, 512, art(512), join(store, 'icon-512.png'));
  const title = (s, c = '#ffb703') => `<div style="font:900 ${s}px Cairo,Arial Black,sans-serif;letter-spacing:${s * .04}px;color:${c};text-shadow:0 ${s * .06}px 0 #9a4f00,0 0 ${s * .4}px rgba(0,0,0,.6);line-height:1">CITY DRIVER<sup style="font-size:.45em">3D</sup></div>`;
  const splash = `<div style="width:2732px;height:2732px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:110px;background:radial-gradient(circle at 50% 40%,#1d2b52,#0b1220 62%)">
    <div style="border-radius:170px;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,.6)">${art(860)}</div>${title(190)}</div>`;
  await compose(b, 2732, 2732, splash, join(assets, 'splash.png'));
  await compose(b, 2732, 2732, splash, join(assets, 'splash-dark.png'));
  await compose(b, 1024, 500, `<div style="position:relative;width:1024px;height:500px;background:url(${wide}) center/cover">
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,10,20,.85),rgba(5,10,20,.2) 55%,transparent)"></div>
    <div style="position:absolute;left:56px;top:150px">${title(76)}<div style="font:900 30px Cairo,sans-serif;color:#fff;margin-top:18px;text-shadow:0 2px 8px #000">🚦 Traffic · Missions · Parking</div></div></div>`, join(store, 'feature-graphic.png'));
  await b.close();
  console.log('art written');
})();
