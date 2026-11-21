import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { programs } from '../data/programs';
import { Breadcrumbs, breadcrumbJsonLd } from '../components/Breadcrumbs';
import { FiltersPanel } from '../components/FiltersPanel';
import { ProgramGrid } from '../components/ProgramCard';
import { emptyFilters, filterPrograms, filtersFromParams, filtersToParams, type Filters } from '../lib/search';
import { useSeo } from '../lib/seo';

export function ProgramsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // בשרת מוצגות כל הפעילויות; בדפדפן הסינון נקרא מהכתובת אחרי הטעינה
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  useEffect(() => {
    setFilters(filtersFromParams(new URLSearchParams(location.search)));
  }, [location.search]);

  const update = (f: Filters) => {
    setFilters(f);
    const qs = filtersToParams(f).toString();
    navigate({ pathname: location.pathname, search: qs ? `?${qs}` : '' }, { replace: true });
  };

  const results = useMemo(() => filterPrograms(programs, filters), [filters]);

  useSeo({
    title: 'כל הפעילויות',
    description: `${programs.length} תוכניות ופעילויות מוכנות להדפסה: חידונים, בינגו, משחקי היכרות, ציד אוצר ועוד. חיפוש וסינון לפי משתתפים, זמן ורמת קושי.`,
    path: 'programs/',
    jsonLd: breadcrumbJsonLd([{ label: 'כל הפעילויות', to: '/programs/' }]),
  });

  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'כל הפעילויות' }]} />
      <header className="page-head">
        <h1>כל הפעילויות</h1>
        <p>חפשו לפי שם או מילת מפתח, וסננו לפי מה שמתאים לכם.</p>
      </header>
      <FiltersPanel filters={filters} onChange={update} />
      <p className="results-count" aria-live="polite">
        {results.length === 0
          ? 'לא נמצאו פעילויות'
          : results.length === 1
            ? 'נמצאה פעילות אחת'
            : `נמצאו ${results.length} פעילויות`}
      </p>
      {results.length > 0 ? (
        <ProgramGrid programs={results} />
      ) : (
        <div className="empty-state">
          <SearchX size={44} aria-hidden="true" />
          <h2>לא מצאנו פעילות שמתאימה בדיוק</h2>
          <p>נסו מילה אחרת, או הסירו חלק מהסינונים.</p>
          <button type="button" className="btn btn-primary" onClick={() => update(emptyFilters)}>
            הצגת כל הפעילויות
          </button>
        </div>
      )}
    </div>
  );
}
