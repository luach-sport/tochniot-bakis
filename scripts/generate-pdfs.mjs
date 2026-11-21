// יוצר קובצי PDF אמיתיים (טקסט, לא צילום מסך) לכל התוכניות, ותמונות שיתוף (og).
// משתמש בדפדפן Chrome/Edge שמותקן במחשב. מריצים אחרי npm run build.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { startServer } from './static-server.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'),
  ].filter(Boolean);
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) throw new Error('לא נמצא דפדפן Chrome או Edge. אפשר להגדיר CHROME_PATH עם הנתיב לדפדפן.');
  return found;
}

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('קודם צריך להריץ npm run build');
  process.exit(1);
}

// רשימת התוכניות נקראת ממפת האתר שנבנתה
const programIds = fs
  .readdirSync(path.join(dist, 'print'))
  .filter((d) => fs.existsSync(path.join(dist, 'print', d, 'index.html')));

const { server, origin } = await startServer(dist, config.basePath);
const browser = await puppeteer.launch({
  executablePath: findBrowser(),
  headless: true,
  args: ['--no-sandbox', '--font-render-hinting=none'],
});

const pdfDir = path.join(root, 'public', 'pdfs');
const ogDir = path.join(root, 'public', 'og');
fs.mkdirSync(pdfDir, { recursive: true });
fs.mkdirSync(ogDir, { recursive: true });

const problems = [];

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 1400 });

  for (const id of programIds) {
    await page.goto(`${origin}${config.basePath}print/${id}/`, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');
    await page.evaluate(() => document.fonts.ready);

    // בדיקה שאף דף, כרטיס או טופס לא גולש מעבר לגבולות שלו
    const report = await page.evaluate(() => {
      const issues = [];
      const sheets = [...document.querySelectorAll('.print-doc .sheet')];
      sheets.forEach((sheet, i) => {
        const check = (el, what) => {
          if (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1) {
            issues.push(`עמוד ${i + 1}: ${what} גולש (${el.scrollHeight}px מתוך ${el.clientHeight}px)`);
          }
        };
        check(sheet.querySelector('.sheet-body'), 'התוכן');
        sheet.querySelectorAll('.print-card, .form-copy, .bingo-cell, .certificate').forEach((el) => check(el, el.className));
      });
      const fontsOk = document.fonts.check('16px "Heebo Variable"') && document.fonts.check('700 16px Rubik');
      return { pages: sheets.length, issues, fontsOk, title: document.title };
    });

    if (!report.fontsOk) problems.push(`${id}: הגופנים לא נטענו`);
    report.issues.forEach((issue) => problems.push(`${id}: ${issue}`));

    const file = path.join(pdfDir, `${id}.pdf`);
    await page.pdf({
      path: file,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    const pdfPages = (fs.readFileSync(file, 'latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
    if (pdfPages !== report.pages) problems.push(`${id}: ב-PDF יש ${pdfPages} עמודים במקום ${report.pages}`);
    const kb = Math.round(fs.statSync(file).size / 1024);
    console.log(`✓ ${id}.pdf  ${report.pages} עמודים  ${kb}KB`);
  }

  // תמונות שיתוף לווטסאפ/פייסבוק (1200x630)
  await page.goto(`${origin}${config.basePath}`, { waitUntil: 'load' });
  await page.emulateMediaType('screen');
  await page.setViewport({ width: 1200, height: 630 });
  const og = async (name, title, image) => {
    const html = `<!doctype html><html dir="rtl" lang="he"><head><meta charset="utf-8">
      <base href="${origin}${config.basePath}">
      <link rel="stylesheet" href="${await cssHref()}">
      <style>
        body{margin:0;width:1200px;height:630px;display:flex;align-items:center;gap:48px;padding:0 70px;box-sizing:border-box;
          background:linear-gradient(135deg,#eef7fe,#fff 70%);font-family:'Heebo Variable',sans-serif;color:#17242f}
        .t{flex:1} .brand{font-family:Rubik;font-weight:700;color:#1f7ac4;font-size:34px}
        .slogan{color:#c9650c;font-weight:700;font-size:26px;margin-top:4px}
        h1{font-family:Rubik;font-weight:700;font-size:58px;line-height:1.15;margin:28px 0 0}
        img{width:500px;height:312px;border-radius:28px;box-shadow:0 18px 40px rgba(20,45,70,.18);object-fit:cover}
      </style></head><body><div class="t"><div class="brand">${config.siteName}</div><div class="slogan">${config.slogan}</div><h1>${title}</h1></div>
      <img src="${image}"></body></html>`;
    await page.setContent(html, { waitUntil: 'load', timeout: 60000 });
    await page.evaluate(async () => {
      await document.fonts.load('700 58px Rubik', 'אבג');
      await document.fonts.load('16px "Heebo Variable"', 'אבג');
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
    });
    await page.screenshot({ path: path.join(ogDir, `${name}.png`) });
  };

  let cssCache;
  async function cssHref() {
    if (!cssCache) {
      const indexHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
      cssCache = indexHtml.match(/href="([^"]+\.css)"/)[1];
    }
    return cssCache;
  }

  await og('default', 'פעילויות ותוכניות מוכנות להדפסה', 'images/hero.svg');
  for (const id of programIds) {
    const html = fs.readFileSync(path.join(dist, 'program', id, 'index.html'), 'utf8');
    const name = html.match(/<h1>([^<]+)<\/h1>/)?.[1] ?? id;
    await og(id, name, `images/programs/${id}.svg`);
  }
  console.log(`✓ ${programIds.length + 1} תמונות שיתוף`);
} finally {
  await browser.close();
  server.close();
}

// העתקה לתיקיית הבנייה, כדי שהקבצים יעלו לאתר
for (const dir of ['pdfs', 'og']) {
  fs.mkdirSync(path.join(dist, dir), { recursive: true });
  for (const f of fs.readdirSync(path.join(root, 'public', dir))) {
    fs.copyFileSync(path.join(root, 'public', dir, f), path.join(dist, dir, f));
  }
}

if (problems.length) {
  console.error('\n✗ נמצאו בעיות בדפי ההדפסה:');
  problems.forEach((p) => console.error('  - ' + p));
  process.exit(1);
}
console.log('✓ כל הדפים נכנסים במלואם, בלי חיתוך');
