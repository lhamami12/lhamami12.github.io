// Copies the game from ../parking into www/ for Capacitor. The web version on
// GitHub Pages and the Android app are built from the same files.
import { cpSync, rmSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, '..', 'parking');
const www = join(root, 'www');

rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });
for (const f of ['index.html', 'three.module.min.js', 'three-LICENSE.txt']) cpSync(join(src, f), join(www, f));
console.log('Copied game into www/');
