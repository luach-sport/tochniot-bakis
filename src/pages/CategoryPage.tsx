import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { categories, categoryById } from '../data/categories';
import { programs } from '../data/programs';
import type { CategoryId } from '../types';
import { Breadcrumbs, breadcrumbJsonLd } from '../components/Breadcrumbs';
import { CategoryIcon } from '../components/CategoryIcon';
import { FiltersPanel } from '../components/FiltersPanel';
import { ProgramGrid } from '../components/ProgramCard';
import { emptyFilters, filterPrograms, type Filters } from '../lib/search';
import { absoluteUrl, useSeo } from '../lib/seo';
import { NotFoundPage } from './NotFoundPage';

export function CategoryPage() {
  const { id } = useParams();
  const category = categoryById[id as CategoryId];
  if (!category) return <NotFoundPage />;
  return <CategoryView key={category.id} categoryId={category.id} />;
}

function CategoryView({ categoryId }: { categoryId: CategoryId }) {
  const category = categoryById[categoryId];
  const [filters, setFilters] = useState<Filters>({ ...emptyFilters, category: categoryId });
  const results = useMemo(() => filterPrograms(programs, filters), [filters]);
  const all = useMemo(() => filterPrograms(programs, { ...emptyFilters, category: categoryId }), [categoryId]);

  useSeo({
    title: category.seoTitle,
    description: `${category.description} ${all.length} תוכניות מוכנות להורדה ולהדפסה, עם הוראות מלאות.`,
    path: `category/${category.id}/`,
    jsonLd: [
      breadcrumbJsonLd([
        { label: 'קטגוריות', to: '/categories/' },
        { label: category.name, to: `/category/${category.id}/` },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: category.name,
        itemListElement: all.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: absoluteUrl(`program/${p.id}/`),
          name: p.name,
        })),
      },
    ],
  });

  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'קטגוריות', to: '/categories/' }, { label: category.name }]} />
      <header className="page-head category-head" style={{ background: category.tint }}>
        <span className="category-icon big">
          <CategoryIcon icon={category.icon} size={36} strokeWidth={1.8} />
        </span>
        <div>
          <h1>{category.name}</h1>
          <p>{category.description}</p>
        </div>
      </header>
      <FiltersPanel filters={filters} onChange={setFilters} hideCategory />
      <p className="results-count" aria-live="polite">
        {results.length === 1 ? 'פעילות אחת' : `${results.length} פעילויות`}
      </p>
      {results.length > 0 ? (
        <ProgramGrid programs={results} />
      ) : (
        <div className="empty-state">
          <h2>אין פעילות שמתאימה לכל הסינונים</h2>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setFilters({ ...emptyFilters, category: categoryId })}
          >
            הצגת כל הפעילויות בקטגוריה
          </button>
        </div>
      )}

      <section className="other-categories">
        <h2>קטגוריות נוספות</h2>
        <div className="chip-row">
          {categories
            .filter((c) => c.id !== categoryId)
            .map((c) => (
              <Link key={c.id} to={`/category/${c.id}/`} className="chip chip-link">
                <CategoryIcon icon={c.icon} size={16} />
                {c.name}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
