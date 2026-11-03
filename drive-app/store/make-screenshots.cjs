// Takes Google Play screenshots (1080x1920) of the real game in Arabic, English and French,
// with a caption band on top. Needs a local server on :8765 serving the repo root and Playwright.
const { chromium } = require('playwright');
const { join } = require('path');
const fs = require('fs');

const CAP = {
  ar: ['قُد في زحمة المدينة', 'توقف عند الضوء الأحمر', 'نهار، غروب وليل', 'القيادة من داخل السيارة', 'اركن في المكان الصحيح', '20 مهمة متنوعة', '7 سيارات تفتحها بالعملات'],
  en: ['Drive through city traffic', 'Stop at the red lights', 'Day, sunset and night', 'Drive from the seat', 'Park in the right bay', '20 varied missions', '7 cars to unlock'],
  fr: ['Roule dans la circulation', 'Arrête-toi au feu rouge', 'Jour, coucher de soleil, nuit', 'Vue depuis le siège', 'Gare-toi au bon endroit', '20 missions variées', '7 voitures à débloquer'],
};
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const lang of Object.keys(CAP)) {
    const dir = join(__dirname, 'screenshots', lang);
    fs.mkdirSync(dir, { recursive: true });
    const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 });
    await p.goto('http://localhost:8765/drive/');
    await p.evaluate(l => localStorage.setItem('citydriver3d-v1', JSON.stringify({ unlocked: 12, stars: [3, 3, 2, 3, 3, 2, 1, 3, 2, 3, 2], car: 4, color: 0, coins: 1850, owned: [0, 1, 4], lang: l })), lang);
    await p.reload(); await p.waitForTimeout(2500);
    const shot = async i => {
      await p.evaluate(t => {
        let c = document.getElementById('shotcap');
        if (!c) { c = document.createElement('div'); c.id = 'shotcap'; document.body.appendChild(c); }
        c.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:99;padding:16px 14px 30px;text-align:center;font:900 24px Cairo,sans-serif;color:#fff;background:linear-gradient(#0b1220 60%,rgba(11,18,32,0));text-shadow:0 2px 6px #000';
        c.textContent = t;
        document.getElementById('banner').classList.remove('show');
      }, CAP[lang][i]);
      await p.waitForTimeout(1200);
      await p.screenshot({ path: join(dir, `0${i + 1}.jpg`), quality: 90 });
    };
    // drive for a while so the traffic settles around the car, then hold still for the picture
    const drive = (lvl, z, x, v, cam, wait = 3) => p.evaluate(([lvl, z, x, v, cam, wait]) => {
      game.startLevel(lvl); game.setCam(cam);
      game.step(2.7);
      Object.assign(game.car, { z, x, v });
      game.step(wait, () => { game.car.v = v; game.car.x = x; game.car.th = 0; });
    }, [lvl, z, x, v, cam, wait]);
    const hud = v => p.evaluate(v => { document.querySelectorAll('#hud .tl,#hud .tr,#hud .chips,#prog').forEach(e => e.style.visibility = v ? '' : 'hidden'); }, v);
    await hud(false);
    await drive(10, 300, -1.75, 13, 0); await shot(0);
    const ints = await p.evaluate(() => { game.startLevel(5); return game.INTS.map(i => i.z); });
    await p.evaluate(z => {
      game.step(2.7);
      // wait for a red light at the second crossroads, stopped at the line
      const I = game.INTS[1];
      for (let k = 0; k < 40 && game.phase(I) !== 'R'; k++) game.step(.5, () => { Object.assign(game.car, { z: I.z - 19, x: -1.75, v: 0, th: 0 }); });
      game.step(3, () => { Object.assign(game.car, { z: I.z - 19, x: -1.75, v: 0, th: 0 }); });
    }, ints[1]);
    await shot(1);
    await drive(9, 250, -5.25, 10, 0); await shot(2);
    await drive(15, 400, -1.75, 12, 1); await shot(3);
    await p.evaluate(() => { game.startLevel(3); game.setCam(0); game.step(2.7); Object.assign(game.car, { z: 386, x: -6.6, th: -.32, v: 0 }); game.step(1, () => { game.car.v = 0; }); });
    await shot(4);
    await hud(true);
    await p.evaluate(() => { game.finish(false, 'hits'); }); await p.waitForTimeout(1800);
    await p.evaluate(() => { document.querySelector('#bResLevels').click(); }); await p.waitForTimeout(1500);
    await shot(5);
    await p.evaluate(() => { document.querySelector('#sLevels [data-back]').click(); document.querySelector('#bGarage').click(); }); await p.waitForTimeout(2500);
    await shot(6);
    await p.close();
  }
  await b.close();
  console.log('screenshots written');
})();
