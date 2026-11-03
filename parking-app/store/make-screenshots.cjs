// Takes Google Play screenshots (1080x1920) of the real game in Arabic and English,
// with a caption band on top. Needs a local server on :8765 serving the repo root and Playwright.
const { chromium } = require('playwright');
const { join } = require('path');
const fs = require('fs');

const CAP = {
  ar: ['اركن بدقة واجمع النجوم', 'مقود ودواسات وناقل حركة', '7 سيارات تشتريها بالعملات', '30 مستوى نهاراً وليلاً', 'حساسات ركن بصوت حقيقي', 'مستويات ليلية بالمصابيح'],
  fr: ['Gare-toi parfaitement', 'Volant, pédales et levier', '7 voitures à acheter', '30 niveaux, de jour et de nuit', 'Radars de recul', 'Niveaux de nuit avec phares'],
  en: ['Park perfectly, earn stars', 'Wheel, pedals and gears', '7 cars to buy with coins', '30 levels, by day and night', 'Beeping parking sensors', 'Night levels with headlights'],
};
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const lang of ['ar', 'en', 'fr']) {
    const dir = join(__dirname, 'screenshots', lang);
    fs.mkdirSync(dir, { recursive: true });
    const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 });
    await p.goto('http://localhost:8765/parking/');
    await p.evaluate(l => localStorage.setItem('parking3d-v2', JSON.stringify({ unlocked: 16, stars: [3, 3, 2, 3, 1, 2, 3, 3, 2, 3, 3, 2, 3, 3, 2], car: 0, color: 0, coins: 1450, owned: [0, 1, 2, 3], lang: l, daily: { last: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0'), day: 1, run: 1 } })), lang);
    await p.reload(); await p.waitForTimeout(2500);
    const caption = async (i) => p.evaluate(([t]) => {
      let c = document.getElementById('shotcap');
      if (!c) { c = document.createElement('div'); c.id = 'shotcap'; document.body.appendChild(c); }
      c.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:99;padding:18px 14px 26px;text-align:center;font:900 22px Cairo,sans-serif;color:#fff;background:linear-gradient(#0b1220 55%,rgba(11,18,32,0));text-shadow:0 2px 6px #000';
      c.textContent = t;
    }, [CAP[lang][i]]);
    const hud = v => p.evaluate(v => { const h = document.querySelector('#hud .tl'), r = document.querySelector('#hud .tr'), c = document.querySelector('#hud .chips'); for (const e of [h, r, c]) e.style.visibility = v ? '' : 'hidden'; }, v);
    const shot = async i => { await caption(i); await p.waitForTimeout(400); await p.screenshot({ path: join(dir, `0${i + 1}.png`) }); };
    // 1: car inside the spot with the hold ring, level 3 (reverse)
    await p.evaluate(() => { game.startLevel(0); Object.assign(game.car, { x: .4, z: 1.5, th: -.06, v: 0 }); });
    await p.evaluate(() => document.getElementById('banner').classList.remove('show'));
    await p.waitForTimeout(1500); await hud(false); await shot(0);
    // 2: driving with the wheel turned, level 2
    await p.evaluate(() => { game.startLevel(1); Object.assign(game.car, { x: -2, z: 1, th: 1.0, v: 0 }); document.getElementById('banner').classList.remove('show'); });
    await p.waitForTimeout(1500); await p.evaluate(() => document.getElementById('wheelG').setAttribute('transform', 'rotate(-120)')); await shot(1);
    // 3: garage with the SUV
    await p.evaluate(() => document.querySelector('#bPause').click()); await p.evaluate(() => document.querySelector('#bPLevels').click());
    await p.evaluate(() => document.querySelector('#sLevels [data-back]').click()); await p.evaluate(() => document.querySelector('#bGarage').click());
    for (let k = 0; k < 2; k++) await p.evaluate(() => document.querySelector('#cNext').click());
    await p.waitForTimeout(1800); await shot(2);
    // 4: level select
    await p.evaluate(() => document.querySelector('#sGarage [data-back]').click()); await p.evaluate(() => { document.querySelector('#bPlay').click(); document.getElementById('sLevels').style.paddingTop = '76px'; });
    await p.waitForTimeout(800); await shot(3);
    // 5: sensors close to a car, level 7 (tight lot)
    await p.evaluate(() => { game.startLevel(6); const s = game.spot; Object.assign(game.car, { x: s.x, z: s.z - 3.4, th: s.rot + Math.PI, v: 0 }); document.getElementById('banner').classList.remove('show'); });
    await p.waitForTimeout(400); await p.evaluate(() => document.querySelector('#gR').dispatchEvent(new PointerEvent('pointerdown')));
    await p.waitForTimeout(1500); await hud(true); await shot(4);
    // 6: a night level with the headlights on
    await p.evaluate(() => { game.startLevel(14); Object.assign(game.car, { x: -5, z: 1.5, th: 0.35, v: 0 }); document.getElementById('banner').classList.remove('show'); });
    await p.waitForTimeout(2000); await shot(5);
    await p.close();
  }
  await b.close();
  console.log('screenshots written');
})();
