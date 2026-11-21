import { RotateCcw, Search } from 'lucide-react';
import { categories } from '../data/categories';
import { difficultyLabels } from '../lib/format';
import { durationOptions, emptyFilters, participantsOptions, type Filters } from '../lib/search';
import type { Difficulty } from '../types';

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  hideCategory?: boolean;
}

export function FiltersPanel({ filters, onChange, hideCategory }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });
  const active = Object.entries(filters).some(([k, v]) => v && !(hideCategory && k === 'category'));

  return (
    <div className="filters" role="search">
      <div className="filter-search">
        <Search size={20} aria-hidden="true" />
        <label htmlFor="filter-q" className="sr-only">
          חיפוש לפי שם או מילת מפתח
        </label>
        <input
          id="filter-q"
          type="search"
          placeholder="חפשו לפי שם או מילה, למשל: שבת, חידון, ילדים"
          value={filters.q}
          onChange={(e) => set('q', e.target.value)}
        />
      </div>
      <div className="filter-row">
        {!hideCategory && (
          <label className="filter-select">
            <span>קטגוריה</span>
            <select value={filters.category} onChange={(e) => set('category', e.target.value as Filters['category'])}>
              <option value="">הכול</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="filter-select">
          <span>מספר משתתפים</span>
          <select
            value={filters.participants}
            onChange={(e) => set('participants', e.target.value as Filters['participants'])}
          >
            <option value="">הכול</option>
            {participantsOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-select">
          <span>משך הפעילות</span>
          <select value={filters.duration} onChange={(e) => set('duration', e.target.value as Filters['duration'])}>
            <option value="">הכול</option>
            {durationOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-select">
          <span>רמת קושי</span>
          <select
            value={filters.difficulty}
            onChange={(e) => set('difficulty', e.target.value as Filters['difficulty'])}
          >
            <option value="">הכול</option>
            {(Object.keys(difficultyLabels) as Difficulty[]).map((d) => (
              <option key={d} value={d}>
                {difficultyLabels[d]}
              </option>
            ))}
          </select>
        </label>
        {active && (
          <button
            type="button"
            className="btn btn-ghost reset"
            onClick={() => onChange({ ...emptyFilters, category: hideCategory ? filters.category : '' })}
          >
            <RotateCcw size={16} aria-hidden="true" />
            ניקוי
          </button>
        )}
      </div>
    </div>
  );
}
