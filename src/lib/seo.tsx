// ניהול כותרות ותגיות meta לכל עמוד.
// בבנייה, התגיות נכתבות לתוך קובץ ה-HTML של כל עמוד (בשביל גוגל ושיתוף בווטסאפ).
// בדפדפן, הן מתעדכנות במעבר בין עמודים.
import { createContext, useContext, useEffect } from 'react';
import siteConfig from '../../site.config.json';

export interface SeoData {
  title: string;
  description: string;
  /** נתיב יחסי, למשל "program/family-bingo/" */
  path: string;
  image?: string;
  noindex?: boolean;
  jsonLd?: object | object[];
}

export const SeoContext = createContext<{ current?: SeoData }>({});

export const absoluteUrl = (path: string) =>
  `${siteConfig.siteUrl}${siteConfig.basePath}${path.replace(/^\//, '')}`;

export function fullTitle(title: string) {
  return title === siteConfig.siteName ? `${siteConfig.siteName} | ${siteConfig.slogan}` : `${title} | ${siteConfig.siteName}`;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** HTML של התגיות, לשימוש בזמן הבנייה */
export function renderSeoTags(seo: SeoData): string {
  const url = absoluteUrl(seo.path);
  const image = absoluteUrl(seo.image ?? 'og/default.png');
  const title = escapeHtml(fullTitle(seo.title));
  const desc = escapeHtml(seo.description);
  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${desc}" />`,
    `<link rel="canonical" href="${url}" />`,
    seo.noindex ? '<meta name="robots" content="noindex, follow" />' : '<meta name="robots" content="index, follow" />',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="he_IL" />`,
    `<meta property="og:site_name" content="${escapeHtml(siteConfig.siteName)}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${desc}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];
  const ld = seo.jsonLd ? (Array.isArray(seo.jsonLd) ? seo.jsonLd : [seo.jsonLd]) : [];
  for (const item of ld) {
    tags.push(`<script type="application/ld+json">${JSON.stringify(item).replace(/</g, '\\u003c')}</script>`);
  }
  return tags.join('\n    ');
}

function setMeta(selector: string, attr: string, key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

export function useSeo(seo: SeoData) {
  const ctx = useContext(SeoContext);
  if (typeof window === 'undefined') ctx.current = seo;

  useEffect(() => {
    document.title = fullTitle(seo.title);
    setMeta('meta[name="description"]', 'name', 'description', seo.description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle(seo.title));
    setMeta('meta[property="og:description"]', 'property', 'og:description', seo.description);
    setMeta('meta[name="robots"]', 'name', 'robots', seo.noindex ? 'noindex, follow' : 'index, follow');
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = absoluteUrl(seo.path);
  }, [seo.title, seo.description, seo.path, seo.noindex]);
}
