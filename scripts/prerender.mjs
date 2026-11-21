// אחרי vite build: בונה קובץ HTML מלא לכל עמוד, מפת אתר (sitemap.xml) ו-robots.txt.
// כך גוגל רואה את כל התוכן של כל עמוד, גם בלי להריץ JavaScript.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const server = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);

const fill = (head, html) => template.replace('<!--app-head-->', head).replace('<!--app-html-->', html);

const routes = server.getRoutes();
for (const route of routes) {
  const { html, head } = server.render(route.path);
  if (!head) throw new Error(`לעמוד ${route.path} אין כותרת (useSeo)`);
  const outDir = path.join(dist, route.path);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), fill(head, html));
}

// עמוד 404 עבור GitHub Pages
{
  const { html, head } = server.render('/__not-found__/');
  fs.writeFileSync(path.join(dist, '404.html'), fill(head, html));
}

// מפת אתר
const today = new Date().toISOString().slice(0, 10);
const siteRoot = `${config.siteUrl}${config.basePath}`;
const urls = routes
  .filter((r) => !r.noindex)
  .map(
    (r) =>
      `  <url><loc>${siteRoot}${r.path.replace(/^\//, '')}</loc><lastmod>${today}</lastmod><priority>${r.priority}</priority></url>`,
  );
fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
);

fs.writeFileSync(
  path.join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: ${config.basePath}print/\n\nSitemap: ${siteRoot}sitemap.xml\n`,
);

fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`✓ נבנו ${routes.length + 1} עמודים, sitemap.xml ו-robots.txt`);
