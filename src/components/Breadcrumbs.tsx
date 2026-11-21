import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import siteConfig from '../../site.config.json';
import { absoluteUrl } from '../lib/seo';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumbs" aria-label="מיקום באתר">
      <ol>
        <li>
          <Link to="/">בית</Link>
        </li>
        {items.map((item) => (
          <li key={item.label}>
            <ChevronLeft size={14} aria-hidden="true" />
            {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** נתונים מובנים לגוגל עבור שביל הניווט */
export function breadcrumbJsonLd(items: Crumb[]) {
  const all = [{ label: siteConfig.siteName, to: '/' }, ...items];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.to ? { item: absoluteUrl(item.to) } : {}),
    })),
  };
}
