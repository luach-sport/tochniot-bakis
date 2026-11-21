// בניית HTML מוכן לכל עמוד בזמן הבנייה (בשביל גוגל ומהירות טעינה).
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { App } from './App';
import { categories } from './data/categories';
import { programs } from './data/programs';
import { SeoContext, renderSeoTags, type SeoData } from './lib/seo';
import { getPrintPlan } from './print/paginate';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export function render(path: string) {
  const seo: { current?: SeoData } = {};
  const html = renderToString(
    <StrictMode>
      <SeoContext.Provider value={seo}>
        <StaticRouter location={`${basename}${path}`} basename={basename}>
          <App />
        </StaticRouter>
      </SeoContext.Provider>
    </StrictMode>,
  );
  return { html, head: seo.current ? renderSeoTags(seo.current) : '', seo: seo.current };
}

/** כל העמודים באתר. noindex = לא נכנס למפת האתר */
export function getRoutes(): { path: string; noindex?: boolean; priority: number }[] {
  return [
    { path: '/', priority: 1 },
    { path: '/programs/', priority: 0.9 },
    { path: '/categories/', priority: 0.7 },
    { path: '/about/', priority: 0.5 },
    ...categories.map((c) => ({ path: `/category/${c.id}/`, priority: 0.8 })),
    ...programs.map((p) => ({ path: `/program/${p.id}/`, priority: 0.9 })),
    ...programs.map((p) => ({ path: `/print/${p.id}/`, noindex: true, priority: 0 })),
  ];
}

export function getProgramsForAssets() {
  return programs.map((p) => ({
    id: p.id,
    name: p.name,
    pdfFile: p.pdfFile,
    image: p.image,
    pages: getPrintPlan(p).sheets.length,
  }));
}
