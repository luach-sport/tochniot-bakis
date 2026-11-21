import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowRight, Download, Printer } from 'lucide-react';
import { programById } from '../data/programs';
import { PrintDocument } from '../print/PrintDocument';
import { downloadName } from '../lib/format';
import { useSeo } from '../lib/seo';
import { NotFoundPage } from './NotFoundPage';

export function PrintPage() {
  const { id } = useParams();
  const location = useLocation();
  const program = programById(id);

  useSeo({
    title: program ? `${program.name} - גרסה להדפסה` : 'גרסה להדפסה',
    description: program?.shortDescription ?? '',
    path: `print/${id ?? ''}/`,
    noindex: true,
  });

  useEffect(() => {
    if (!program) return;
    if (new URLSearchParams(location.search).get('print') !== '1') return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setTimeout(() => window.print(), 300);
    });
    return () => {
      cancelled = true;
    };
  }, [program, location.search]);

  if (!program) return <NotFoundPage />;
  const base = import.meta.env.BASE_URL;

  return (
    <div className="print-page">
      <div className="print-toolbar no-print">
        <Link to={`/program/${program.id}/`} className="btn btn-ghost">
          <ArrowRight size={18} aria-hidden="true" />
          חזרה לתוכנית
        </Link>
        <span className="print-toolbar-title">{program.name}</span>
        <div className="print-toolbar-actions">
          <a className="btn btn-ghost" href={`${base}${program.pdfFile}`} download={downloadName(program)}>
            <Download size={18} aria-hidden="true" />
            PDF
          </a>
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={18} aria-hidden="true" />
            הדפסה
          </button>
        </div>
      </div>
      <p className="print-hint no-print">
        טיפ: בחלון ההדפסה בחרו גודל דף A4 ו"שוליים: ללא" או "ברירת מחדל". אפשר לבחור הדפסה בשחור-לבן.
      </p>
      <PrintDocument program={program} />
    </div>
  );
}
