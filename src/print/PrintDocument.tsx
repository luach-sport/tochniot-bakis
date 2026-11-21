import type { ReactNode } from 'react';
import type { Program } from '../types';
import siteConfig from '../../site.config.json';
import { getPrintPlan, type Sheet } from './paginate';
import {
  AnswerSheetPage,
  BingoPage,
  CardsPage,
  CertificatePage,
  FormPage,
  QuizPage,
  ScoreboardPage,
  TablePage,
} from './SheetPages';
import { CoverPage } from './CoverPage';

function SheetFrame({
  program,
  page,
  total,
  title,
  children,
}: {
  program: Program;
  page: number;
  total: number;
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="sheet" aria-label={`עמוד ${page} מתוך ${total}`}>
      <header className="sheet-header">
        <span className="sheet-brand">{siteConfig.siteName}</span>
        <span className="sheet-program">
          {program.name}
          {title ? ` · ${title}` : ''}
        </span>
      </header>
      <div className="sheet-body">{children}</div>
      <footer className="sheet-footer">
        <span>{siteConfig.printDomain}</span>
        <span className="sheet-page">
          עמוד {page} מתוך {total}
        </span>
      </footer>
    </section>
  );
}

function renderSheet(program: Program, sheet: Sheet, contents: ReturnType<typeof getPrintPlan>['contents']) {
  switch (sheet.type) {
    case 'cover':
      return <CoverPage program={program} blocks={sheet.blocks} contents={contents} />;
    case 'cards':
      return <CardsPage sheet={sheet} />;
    case 'bingo':
      return <BingoPage sheet={sheet} />;
    case 'quiz':
      return <QuizPage sheet={sheet} />;
    case 'answerSheet':
      return <AnswerSheetPage sheet={sheet} />;
    case 'form':
      return <FormPage sheet={sheet} />;
    case 'scoreboard':
      return <ScoreboardPage sheet={sheet} />;
    case 'table':
      return <TablePage sheet={sheet} />;
    case 'certificate':
      return <CertificatePage sheet={sheet} programName={program.name} />;
  }
}

function sheetTitle(sheet: Sheet): string {
  return sheet.type === 'cover' ? 'הוראות למארגן' : sheet.section.title;
}

export function PrintDocument({ program, limit }: { program: Program; limit?: number }) {
  const { sheets, contents } = getPrintPlan(program);
  const visible = limit ? sheets.slice(0, limit) : sheets;
  return (
    <div className="print-doc" dir="rtl" lang="he">
      {visible.map((sheet, i) => (
        <SheetFrame key={i} program={program} page={i + 1} total={sheets.length} title={sheetTitle(sheet)}>
          {renderSheet(program, sheet, contents)}
        </SheetFrame>
      ))}
    </div>
  );
}
