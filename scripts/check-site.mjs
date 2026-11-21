// בדיקת האתר הבנוי: אין קישורים שבורים, לכל תוכנית יש PDF ותמונה, ולכל עמוד יש כותרת ותיאור.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const base = config.basePath;

const htmlFiles = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(entry.name)) htmlFiles.push(full);
  }
})(dist);

const errors = [];
const resolveTarget = (url) => {
  const clean = decodeURIComponent(url.split('#')[0].split('?')[0]);
  if (!clean.startsWith(base)) return null;
  let file = path.join(dist, clean.slice(base.length));
  if (clean.endsWith('/')) file = path.join(file, 'index.html');
  return file;
};

let linkCount = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(dist, file);
  if (!/<title>[^<]{5,}<\/title>/.test(html)) errors.push(`${rel}: חסרה כותרת`);
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) errors.push(`${rel}: חסר תיאור`);
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|#|data:)/.test(url)) continue;
    linkCount++;
    if (url === base.replace(/\/$/, '')) continue; // קישור לעמוד הבית בלי לוכסן בסוף, תקין
    if (!url.startsWith(base)) {
      errors.push(`${rel}: קישור שלא מתחיל ב-${base}: ${url}`);
      continue;
    }
    const target = resolveTarget(url);
    if (!target || !fs.existsSync(target)) errors.push(`${rel}: קישור שבור: ${url}`);
  }
}

// כל התוכניות
for (const id of fs.readdirSync(path.join(dist, 'program'))) {
  const pdf = path.join(dist, 'pdfs', `${id}.pdf`);
  if (!fs.existsSync(pdf)) errors.push(`חסר PDF לתוכנית ${id} (הריצו npm run pdf)`);
  else if (fs.statSync(pdf).size < 10_000) errors.push(`ה-PDF של ${id} קטן מדי`);
  if (!fs.existsSync(path.join(dist, 'images', 'programs', `${id}.svg`)) &&
      !fs.readdirSync(path.join(dist, 'images', 'programs')).some((f) => f.startsWith(id + '.')))
    errors.push(`חסרה תמונה לתוכנית ${id}`);
  if (!fs.existsSync(path.join(dist, 'og', `${id}.png`))) errors.push(`חסרה תמונת שיתוף לתוכנית ${id}`);
}

// מפת האתר
const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
const siteRoot = `${config.siteUrl}${base}`;
for (const [, loc] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const target = resolveTarget(base + loc.slice(siteRoot.length));
  if (!target || !fs.existsSync(target)) errors.push(`במפת האתר יש עמוד שלא קיים: ${loc}`);
}

if (errors.length) {
  console.error(`✗ נמצאו ${errors.length} בעיות:`);
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log(`✓ נבדקו ${htmlFiles.length} עמודים ו-${linkCount} קישורים. הכול תקין.`);
