import { Link } from 'react-router-dom';
import type { Program } from '../types';
import { categoryById } from '../data/categories';
import { priceLabel } from '../lib/format';
import { ProgramMeta } from './ProgramMeta';

export function ProgramCard({ program }: { program: Program }) {
  const base = import.meta.env.BASE_URL;
  return (
    <article className="program-card">
      <Link to={`/program/${program.id}/`} className="program-card-link">
        <div className="program-card-image">
          <img src={`${base}${program.image}`} alt="" loading="lazy" width={640} height={400} />
          <span className={`price-badge${program.price === 0 ? ' free' : ''}`}>{priceLabel(program)}</span>
        </div>
        <div className="program-card-body">
          <div className="program-card-cats">
            {program.categories.slice(0, 2).map((c) => (
              <span key={c} className="chip">
                {categoryById[c].name}
              </span>
            ))}
          </div>
          <h3>{program.name}</h3>
          <p>{program.shortDescription}</p>
          <ProgramMeta program={program} compact />
        </div>
      </Link>
    </article>
  );
}

export function ProgramGrid({ programs }: { programs: Program[] }) {
  return (
    <div className="program-grid">
      {programs.map((p) => (
        <ProgramCard key={p.id} program={p} />
      ))}
    </div>
  );
}
