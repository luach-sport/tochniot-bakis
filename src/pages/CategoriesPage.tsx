import { categories } from '../data/categories';
import { Breadcrumbs, breadcrumbJsonLd } from '../components/Breadcrumbs';
import { CategoryCard } from '../components/CategoryCard';
import { useSeo } from '../lib/seo';

export function CategoriesPage() {
  useSeo({
    title: 'קטגוריות',
    description:
      'פעילויות להדפסה לפי סוג המפגש: משפחה, חברים, עבודה וגיבוש, שבתות וחגים, ימי הולדת, אירועים, ילדים וחידונים.',
    path: 'categories/',
    jsonLd: breadcrumbJsonLd([{ label: 'קטגוריות', to: '/categories/' }]),
  });

  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'קטגוריות' }]} />
      <header className="page-head">
        <h1>קטגוריות</h1>
        <p>בחרו את סוג המפגש, ונציג לכם את הפעילויות שהכי מתאימות לו.</p>
      </header>
      <div className="category-grid">
        {categories.map((c) => (
          <CategoryCard key={c.id} category={c} />
        ))}
      </div>
    </div>
  );
}
