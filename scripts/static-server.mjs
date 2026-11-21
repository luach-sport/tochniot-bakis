// שרת קטן שמגיש את תיקיית dist תחת basePath, לשימוש בסקריפטים ובבדיקות.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
};

export function startServer(dist, basePath, port = 0) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (!url.startsWith(basePath)) {
        res.writeHead(302, { Location: basePath });
        return res.end();
      }
      let file = path.join(dist, url.slice(basePath.length));
      if (url.endsWith('/')) file = path.join(file, 'index.html');
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404, { 'Content-Type': types['.html'] });
        return res.end(fs.readFileSync(path.join(dist, '404.html')));
      }
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(port, '127.0.0.1', () => {
      const { port: actual } = server.address();
      resolve({ server, origin: `http://127.0.0.1:${actual}` });
    });
  });
}

// הרצה ישירה: node scripts/static-server.mjs  → צפייה באתר הבנוי
if (import.meta.url === `file://${process.argv[1]}`) {
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
  const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
  const { origin } = await startServer(path.join(root, 'dist'), config.basePath, Number(process.env.PORT ?? 4173));
  console.log(`האתר זמין בכתובת ${origin}${config.basePath}`);
}
