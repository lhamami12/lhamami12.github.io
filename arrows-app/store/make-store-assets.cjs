// Generates Google Play screenshots (1080x1920) and feature graphics (1024x500)
// for every language, from the real game in ../../arrows.
// Usage (needs Playwright + Chromium):  node store/make-store-assets.cjs [lang ...]
const path = require('path');
const fs = require('fs');
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');

const ROOT = path.join(__dirname, '..', '..');
const GAME = 'file://' + path.join(ROOT, 'arrows', 'index.html');
const FONTS = 'file://' + path.join(ROOT, 'arrows', 'fonts');
const ICON = 'file://' + path.join(__dirname, '..', 'assets', 'icon-only.png');
const OUT = path.join(__dirname);
const TMP = fs.mkdtempSync(path.join(require('os').tmpdir(), 'ae-store-'));

const HEAD = {
  en: ['Tap the arrows.\nClear the board!', '21 beautiful shapes', 'Locks, keys & path preview', 'Daily rewards & a new puzzle every day', 'Unlock stylish arrows', '4 game modes · 37 achievements'],
  fr: ['Touchez les flèches.\nVidez le plateau !', '21 formes magnifiques', 'Cadenas, clés et aperçu du trajet', 'Récompenses et nouveau puzzle chaque jour', 'Débloquez des styles de flèches', '4 modes de jeu · 37 succès'],
  ar: ['اضغط على الأسهم.\nنظّف اللوحة!', '21 شكلًا جميلًا', 'أقفال ومفاتيح ومعاينة المسار', 'مكافآت يومية ولغز جديد كل يوم', 'افتح أشكالًا مميزة للأسهم', '4 أوضاع لعب · 37 إنجازًا'],
  es: ['Toca las flechas.\n¡Despeja el tablero!', '21 formas preciosas', 'Candados, llaves y vista previa', 'Recompensas y un puzle nuevo cada día', 'Desbloquea estilos de flecha', '4 modos de juego · 37 logros'],
  pt: ['Toque nas setas.\nLimpe o tabuleiro!', '21 formas lindas', 'Cadeados, chaves e prévia do caminho', 'Recompensas e um desafio novo todo dia', 'Desbloqueie estilos de seta', '4 modos de jogo · 37 conquistas'],
  de: ['Tippe auf die Pfeile.\nLeere das Brett!', '21 schöne Formen', 'Schlösser, Schlüssel & Wegvorschau', 'Tagesbelohnungen & jeden Tag ein neues Rätsel', 'Schalte Pfeil-Stile frei', '4 Spielmodi · 37 Erfolge'],
  it: ['Tocca le frecce.\nLibera la griglia!', '21 forme bellissime', 'Lucchetti, chiavi e anteprima', 'Ricompense e un nuovo puzzle ogni giorno', 'Sblocca stili di frecce', '4 modalità · 37 obiettivi'],
  tr: ['Oklara dokun.\nTahtayı temizle!', '21 güzel şekil', 'Kilitler, anahtarlar ve yol önizleme', 'Günlük ödüller ve her gün yeni bulmaca', 'Şık ok stillerinin kilidini aç', '4 oyun modu · 37 başarım'],
  ru: ['Нажимай на стрелки.\nОчисти поле!', '21 красивая фигура', 'Замки, ключи и предпросмотр пути', 'Ежедневные награды и новая головоломка', 'Открывай стили стрелок', '4 режима · 37 достижений'],
  id: ['Ketuk panahnya.\nBersihkan papan!', '21 bentuk yang indah', 'Gembok, kunci & pratinjau jalur', 'Hadiah harian & teka-teki baru tiap hari', 'Buka gaya panah keren', '4 mode permainan · 37 pencapaian'],
};
const BG = [['#2f6bff', '#6c9bff'], ['#7c3aed', '#b07cff'], ['#0f9d82', '#3fd0b2'], ['#f08a00', '#ffb547'], ['#db2777', '#ff6fae'], ['#1e293b', '#475569']];

const today = new Date(), dk = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const yesterday = dk(new Date(Date.now() - 864e5));

// Each scene: saved progress to start from, then what to do on screen before the capture.
const SCENES = [
  { save: { theme: 'light', skin: 'classic' }, run: () => { startGame('levels', 33); } },
  { save: { theme: 'light', skin: 'rainbow' }, run: () => { startGame('levels', 75); } },
  { save: { theme: 'light', skin: 'classic' }, run: () => { startGame('levels', 41); setTimeout(() => {
      const a = G.arrows.find(a => a.alive && a.lock == null && rayInfo(G, a).block >= 0 && rayInfo(G, a).cells.length > 1) || G.arrows[0];
      preview = a.id; G.hint = freeArrows(G).find(b => b.id !== a.id).id; }, 900); } },
  { save: { theme: 'light', skin: 'classic', dr: { last: yesterday, day: 3, run: 3 } }, run: () => { show('home'); openDaily(); } },
  { save: { theme: 'dark', skin: 'neon', owned: ['classic', 'rainbow', 'neon', 'candy', 'beads'] }, run: () => { show('home'); openShop(); } },
  { save: { theme: 'light', skin: 'classic' }, run: () => { show('home'); } },
];

function shotHTML(lang, i, img) {
  const [c1, c2] = BG[i], rtl = lang === 'ar';
  const text = HEAD[lang][i].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>');
  return `<!doctype html><html dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
  @font-face{font-family:Rubik;font-weight:400 700;src:url(${FONTS}/rubik-latin.woff2)}
  @font-face{font-family:Rubik;font-weight:400 700;src:url(${FONTS}/rubik-latin-ext.woff2);unicode-range:U+0100-02BA,U+1E00-1EFF}
  @font-face{font-family:Rubik;font-weight:400 700;src:url(${FONTS}/rubik-arabic.woff2);unicode-range:U+0600-06FF,U+FB50-FDFF,U+FE70-FEFC}
  @font-face{font-family:Rubik;font-weight:400 700;src:url(${FONTS}/rubik-cyrillic.woff2);unicode-range:U+0400-045F}
  html,body{margin:0;width:1080px;height:1920px;overflow:hidden}
  body{background:linear-gradient(160deg,${c1},${c2});font-family:Rubik,sans-serif;position:relative}
  body::before{content:"";position:absolute;inset:0;background:radial-gradient(70% 40% at 50% 0%,rgba(255,255,255,.25),transparent 70%)}
  h1{position:absolute;top:0;left:60px;right:60px;height:360px;margin:0;display:flex;align-items:center;justify-content:center;text-align:center;
     color:#fff;font-weight:700;font-size:${HEAD[lang][i].length > 34 ? 66 : 76}px;line-height:1.15;letter-spacing:-.5px;text-shadow:0 4px 18px rgba(0,0,0,.18)}
  .phone{position:absolute;left:50%;top:380px;transform:translateX(-50%);width:700px;height:1515px;border-radius:84px;background:#0b0f1e;padding:18px;
     box-shadow:0 40px 80px rgba(0,0,0,.35),inset 0 0 0 3px rgba(255,255,255,.08)}
  .phone img{width:100%;height:100%;border-radius:68px;display:block;object-fit:cover;object-position:top}
  </style></head><body><h1>${text}</h1><div class="phone"><img src="file://${img}"></div></body></html>`;
}

function featureHTML(lang, title, tagline, img) {
  const rtl = lang === 'ar';
  return `<!doctype html><html dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
  @font-face{font-family:Rubik;font-weight:400 700;src:url(${FONTS}/rubik-latin.woff2)}
  @font-face{font-family:Rubik;font-weight:400 700;src:url(${FONTS}/rubik-latin-ext.woff2);unicode-range:U+0100-02BA,U+1E00-1EFF}
  @font-face{font-family:Rubik;font-weight:400 700;src:url(${FONTS}/rubik-arabic.woff2);unicode-range:U+0600-06FF,U+FB50-FDFF,U+FE70-FEFC}
  @font-face{font-family:Rubik;font-weight:400 700;src:url(${FONTS}/rubik-cyrillic.woff2);unicode-range:U+0400-045F}
  html,body{margin:0;width:1024px;height:500px;overflow:hidden}
  body{background:linear-gradient(120deg,#2f6bff,#6c9bff);font-family:Rubik,sans-serif;color:#fff;display:flex;align-items:center;gap:40px;padding:0 60px;box-sizing:border-box;position:relative}
  .txt{flex:1;z-index:1}.txt img{width:110px;height:110px;border-radius:26px;box-shadow:0 10px 30px rgba(0,0,0,.2)}
  h1{margin:22px 0 8px;font-size:62px;font-weight:700;letter-spacing:-1px;line-height:1.05}p{margin:0;font-size:26px;opacity:.92;max-width:470px}
  .card{width:380px;height:440px;border-radius:36px;background:#f5f7fb;overflow:hidden;transform:rotate(${rtl ? 5 : -5}deg) translateY(30px);box-shadow:0 30px 60px rgba(0,0,0,.3)}
  .card img{width:100%;height:100%;object-fit:cover;object-position:50% 46%}
  </style></head><body><div class="txt"><img src="${ICON}"><h1>${title}</h1><p>${tagline}</p></div><div class="card"><img src="file://${img}"></div></body></html>`;
}

(async () => {
  const langs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(HEAD);
  const browser = await chromium.launch();
  const game = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  const page = await game.newPage();
  const comp = await (await browser.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();
  for (const lang of langs) {
    const dir = path.join(OUT, 'screenshots', lang);
    fs.mkdirSync(dir, { recursive: true });
    let boardShot = null, meta = null;
    for (let i = 0; i < SCENES.length; i++) {
      const sc = SCENES[i];
      const save = Object.assign({ rev: 1, lang, level: 47, coins: 1250, hints: 5, bombs: 2, tut: 3, dailyDone: dk(today), streak: 4,
        dr: { last: dk(today), day: 4, run: 4 }, stars: Object.fromEntries(Array.from({ length: 46 }, (_, k) => [k + 1, 2 + (k % 2)])),
        st: { levels: 46, perfect: 21, arrows: 2900, combo: 9, shapes: ['heart', 'diamond', 'star', 'circle', 'house', 'cross', 'hexagon', 'tree'], daily: 9, streak: 4, login: 4, rush: 31, zen: 6, keys: 40, gold: 60 },
        ach: { levels0: 1, perfect0: 1, arrows0: 1, arrows1: 1, combo0: 1, shapes0: 1, daily0: 1, streak0: 1, login0: 1, rush0: 1, zen0: 1, keys0: 1, gold0: 1 } }, sc.save);
      await page.goto('about:blank');
      await page.goto(GAME);
      await page.evaluate(s => { localStorage.setItem('arrowEscape.v1', JSON.stringify(s)); }, save);
      await page.goto(GAME);
      await page.waitForTimeout(500);
      await page.evaluate(sc.run);
      await page.waitForTimeout(1600);
      const raw = path.join(TMP, `${lang}-${i}.png`);
      await page.screenshot({ path: raw });
      if (i === 1) { boardShot = raw; meta = await page.evaluate(() => [t('title'), t('tagline')]); }
      await comp.setViewportSize({ width: 1080, height: 1920 });
      const html = path.join(TMP, `${lang}-${i}.html`);
      fs.writeFileSync(html, shotHTML(lang, i, raw));
      await comp.goto('file://' + html);
      await comp.evaluate(() => document.fonts.ready);
      await comp.evaluate(() => Promise.all([...document.images].map(i => i.decode())));
      await comp.screenshot({ path: path.join(dir, String(i + 1).padStart(2, '0') + '.jpg'), type: 'jpeg', quality: 88 });
    }
    await comp.setViewportSize({ width: 1024, height: 500 });
    const fhtml = path.join(TMP, `${lang}-feature.html`);
    fs.writeFileSync(fhtml, featureHTML(lang, meta[0], meta[1], boardShot));
    await comp.goto('file://' + fhtml);
    await comp.evaluate(() => document.fonts.ready);
    await comp.evaluate(() => Promise.all([...document.images].map(i => i.decode())));
    await comp.screenshot({ path: path.join(OUT, 'screenshots', lang, 'feature-graphic.jpg'), type: 'jpeg', quality: 90 });
    console.log('done', lang);
  }
  await browser.close();
})();
