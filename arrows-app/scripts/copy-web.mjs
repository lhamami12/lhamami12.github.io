// Copies the game from ../arrows into www/ for Capacitor. The web version on
// GitHub Pages and the Android app are built from the same files.
import { cpSync, rmSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, '..', 'arrows');
const www = join(root, 'www');

rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });
cpSync(join(src, 'index.html'), join(www, 'index.html'));
cpSync(join(src, 'fonts'), join(www, 'fonts'), { recursive: true });
console.log('Copied game into www/');
