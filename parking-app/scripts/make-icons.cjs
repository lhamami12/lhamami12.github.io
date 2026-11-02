// Draws the launcher icon and splash screen into assets/ (run: node scripts/make-icons.cjs),
// then `npm run assets` turns them into every Android size.
const { chromium } = require('playwright');
const { join } = require('path');
const out = join(__dirname, '..', 'assets');

const car = `
  <defs>
    <linearGradient id="paint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a5f"/><stop offset=".55" stop-color="#e63946"/><stop offset="1" stop-color="#a4161a"/></linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b7da8"/><stop offset=".5" stop-color="#1b2a3a"/><stop offset="1" stop-color="#0e1620"/></linearGradient>
    <radialGradient id="rim"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#9aa3ad"/></radialGradient>
  </defs>
  <ellipse cx="528" cy="690" rx="390" ry="26" fill="rgba(0,0,0,.45)"/>
  <path d="M150,640 Q150,585 205,574 L335,558 Q392,470 472,455 L640,452 Q718,456 778,538 L862,558 Q902,570 906,612 L906,650 Q906,672 884,674 L172,674 Q150,672 150,650 Z" fill="url(#paint)"/>
  <path d="M190,600 L880,600" stroke="rgba(255,255,255,.35)" stroke-width="8" stroke-linecap="round"/>
  <path d="M385,558 Q424,490 482,480 L560,478 L560,558 Z" fill="url(#glass)"/>
  <path d="M586,478 L642,478 Q690,486 728,558 L586,558 Z" fill="url(#glass)"/>
  <rect x="868" y="586" width="36" height="22" rx="6" fill="#fff6c8"/>
  <rect x="150" y="590" width="26" height="22" rx="6" fill="#ff2a2a"/>
  ${[300, 760].map(x => `<circle cx="${x}" cy="672" r="74" fill="#15171a"/><circle cx="${x}" cy="672" r="42" fill="url(#rim)"/><circle cx="${x}" cy="672" r="12" fill="#5b636e"/>`).join('')}
  <g transform="translate(168,150)">
    <rect width="260" height="260" rx="44" fill="#1d4ed8" stroke="#fff" stroke-width="16"/>
    <text x="130" y="200" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="210" fill="#fff">P</text>
  </g>`;
const bg = `<defs><radialGradient id="bg" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#2b4c7e"/><stop offset="1" stop-color="#0b1220"/></radialGradient></defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <path d="M90,760 L934,760" stroke="#ffb703" stroke-width="18" stroke-linecap="round"/>`;
const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 1024 1024">${body}</svg>`;

(async () => {
  const b = await chromium.launch();
  const shot = async (name, size, html, transparent = false) => {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    await p.setContent(`<html><body style="margin:0;background:${transparent ? 'transparent' : '#0b1220'}">${html}</body></html>`);
    await p.screenshot({ path: join(out, name), omitBackground: transparent });
    await p.close();
  };
  await shot('icon-only.png', 1024, svg(1024, 1024, bg + car));
  await shot('icon-background.png', 1024, svg(1024, 1024, bg));
  // adaptive icon foreground: keep the art inside the central safe zone
  await shot('icon-foreground.png', 1024, svg(1024, 1024, `<g transform="translate(512,512) scale(.66) translate(-512,-480)">${car}</g>`), true);
  const splash = `<div style="width:2732px;height:2732px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(#1d2f52,#0b1220 70%)">
    ${svg(900, 900, car)}
    <div style="font:900 220px Arial Black,Arial,sans-serif;letter-spacing:12px;background:linear-gradient(#fff 20%,#ffd36b 60%,#fb8500);-webkit-background-clip:text;color:transparent;margin-top:-40px">PARKING 3D</div></div>`;
  await shot('splash.png', 2732, splash);
  await shot('splash-dark.png', 2732, splash);
  await b.close();
  console.log('icons written to', out);
})();
