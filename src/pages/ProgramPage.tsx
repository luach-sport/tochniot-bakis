import { Link, useParams } from 'react-router-dom';
import { Check, Download, Eye, FileText, Lightbulb, ListChecks, Package, Printer } from 'lucide-react';
import { categoryById } from '../data/categories';
import { programById, programs } from '../data/programs';
import type { Program } from '../types';
import { Breadcrumbs, breadcrumbJsonLd } from '../components/Breadcrumbs';
import { ProgramGrid } from '../components/ProgramCard';
import { ProgramMeta } from '../components/ProgramMeta';
import { PrintDocument } from '../print/PrintDocument';
import { getPrintPlan } from '../print/paginate';
import { downloadName, priceLabel } from '../lib/format';
import { absoluteUrl, useSeo } from '../lib/seo';
import { NotFoundPage } from './NotFoundPage';

export function ProgramPage() {
  const { id } = useParams();
  const program = programById(id);
  if (!program) return <NotFoundPage />;
  return <ProgramView key={program.id} program={program} />;
}

function related(program: Program): Program[] {
  return programs
    .filter((p) => p.id !== program.id)
    .map((p) => ({ p, shared: p.categories.filter((c) => program.categories.includes(c)).length }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || b.p.popularity - a.p.popularity)
    .slice(0, 3)
    .map((x) => x.p);
}

function ProgramView({ program }: { program: Program }) {
  const base = import.meta.env.BASE_URL;
  const plan = getPrintPlan(program);
  const pages = plan.sheets.length;
  const mainCategory = categoryById[program.categories[0]];
  const pdfUrl = `${base}${program.pdfFile}`;

  useSeo({
    title: `${program.name} - להורדה ולהדפסה`,
    description: `${program.shortDescription} קובץ PDF של ${pages} עמודים, עם הוראות מלאות, מוכן להדפסה.`,
    path: `program/${program.id}/`,
    image: `og/${program.id}.png`,
    jsonLd: [
      breadcrumbJsonLd([
        { label: mainCategory.name, to: `/category/${mainCategory.id}/` },
        { label: program.name, to: `/program/${program.id}/` },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: program.name,
        description: program.description,
        image: absoluteUrl(`og/${program.id}.png`),
        inLanguage: 'he',
        totalTime: `PT${program.durationMinutes.max}M`,
        estimatedCost: { '@type': 'MonetaryAmount', currency: 'ILS', value: String(program.price) },
        supply: program.equipment.map((name) => ({ '@type': 'HowToSupply', name })),
        step: program.instructions.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text })),
      },
    ],
  });

  const more = related(program);

  return (
    <div className="container page program-page">
      <Breadcrumbs
        items={[{ label: mainCategory.name, to: `/category/${mainCategory.id}/` }, { label: program.name }]}
      />

      <section className="program-hero">
        <div className="program-hero-image">
          <img src={`${base}${program.image}`} alt={`איור: ${program.name}`} width={640} height={400} />
        </div>
        <div className="program-hero-text">
          <div className="chip-row">
            {program.categories.map((c) => (
              <Link key={c} to={`/category/${c}/`} className="chip chip-link">
                {categoryById[c].name}
              </Link>
            ))}
          </div>
          <h1>{program.name}</h1>
          <p className="lead">{program.description}</p>
          <ProgramMeta program={program} />
          <div className="program-actions">
            <a className="btn btn-primary btn-lg" href={pdfUrl} download={downloadName(program)}>
              <Download size={20} aria-hidden="true" />
              הורדת PDF
            </a>
            <a className="btn btn-accent btn-lg" href={`${base}print/${program.id}/?print=1`} target="_blank" rel="noopener">
              <Printer size={20} aria-hidden="true" />
              הדפסה
            </a>
            <a className="btn btn-ghost btn-lg" href="#preview">
              <Eye size={20} aria-hidden="true" />
              תצוגה מקדימה
            </a>
          </div>
          <p className="file-note">
            <FileText size={16} aria-hidden="true" />
            {priceLabel(program)} · קובץ PDF של {pages} עמודים בגודל A4 · שחור-לבן, חוסך דיו
          </p>
        </div>
      </section>

      <div className="program-layout">
        <div className="program-main">
          <section className="panel">
            <h2>
              <ListChecks size={22} aria-hidden="true" />
              איך משחקים
            </h2>
            <ol className="steps-list">
              {program.instructions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </section>

          {program.tips && program.tips.length > 0 && (
            <section className="panel tips">
              <h2>
                <Lightbulb size={22} aria-hidden="true" />
                טיפים ורעיונות
              </h2>
              <ul>
                {program.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="program-side">
          <section className="panel">
            <h2>
              <Package size={22} aria-hidden="true" />
              מה צריך
            </h2>
            <ul className="check-list">
              {program.equipment.map((e, i) => (
                <li key={i}>
                  <Check size={18} aria-hidden="true" />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="panel">
            <h2>הכנה מראש</h2>
            <ol className="steps-list small">
              {program.preparation.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </section>
          <section className="panel">
            <h2>מה יש בקובץ</h2>
            <ul className="contents-list">
              {plan.contents.map((c) => (
                <li key={c.title}>
                  <span>{c.title}</span>
                  <span className="muted">{c.from === c.to ? `עמוד ${c.from}` : `עמודים ${c.from}–${c.to}`}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <section className="preview-section" id="preview">
        <div className="section-head">
          <h2>תצוגה מקדימה של הקובץ</h2>
          <div className="preview-actions">
            <a className="btn btn-primary" href={pdfUrl} download={downloadName(program)}>
              <Download size={18} aria-hidden="true" />
              הורדת PDF
            </a>
            <a className="btn btn-ghost" href={`${base}print/${program.id}/?print=1`} target="_blank" rel="noopener">
              <Printer size={18} aria-hidden="true" />
              הדפסה
            </a>
          </div>
        </div>
        <p className="muted">כך ייראו הדפים כשתדפיסו. {pages} עמודים, גלילה לצפייה בכולם.</p>
        <div className="preview-frame">
          <PrintDocument program={program} />
        </div>
      </section>

      {more.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>אולי תאהבו גם</h2>
          </div>
          <ProgramGrid programs={more} />
        </section>
      )}
    </div>
  );
}
