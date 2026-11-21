// חלוקת תוכנית לדפי A4 קבועים.
// כל דף נבנה מראש בקוד, כך שאף כרטיס או טקסט לא נחתך בין דפים,
// ומספרי העמודים זהים בתצוגה המקדימה, בהדפסה ובקובץ ה-PDF.
// בזמן יצירת ה-PDF יש בדיקה אוטומטית שאף דף לא גולש (scripts/generate-pdfs.mjs).
import type { Card, PrintSection, Program, QuizQuestion } from '../types';
import { seededShuffle } from '../lib/random';

type SectionOf<K extends PrintSection['kind']> = Extract<PrintSection, { kind: K }>;

export type CoverBlock =
  | { type: 'intro' }
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[]; ordered: boolean; start: number }
  | { type: 'contents' };

export type QuizItem =
  | { type: 'round'; title: string }
  | { type: 'question'; n: number; q: QuizQuestion }
  | { type: 'tie'; q: QuizQuestion };

export type Sheet =
  | { type: 'cover'; blocks: CoverBlock[]; part: number }
  | { type: 'cards'; section: SectionOf<'cards'>; cards: (Card | null)[]; startIndex: number }
  | { type: 'bingo'; section: SectionOf<'bingo'>; boards: { number: number; items: string[] }[] }
  | { type: 'quiz'; section: SectionOf<'quiz'>; items: QuizItem[]; first: boolean }
  | { type: 'answerSheet'; section: SectionOf<'answerSheet'>; copy: number }
  | { type: 'form'; section: SectionOf<'form'>; count: number }
  | { type: 'scoreboard'; section: SectionOf<'scoreboard'> }
  | { type: 'table'; section: SectionOf<'table'> }
  | { type: 'certificate'; section: SectionOf<'certificate'>; count: number };

export interface ContentsEntry {
  title: string;
  from: number;
  to: number;
}

export interface PrintPlan {
  sheets: Sheet[];
  contents: ContentsEntry[];
}

// מידות הדף במילימטרים. חייבות להתאים ל-print.css
export const PAGE = {
  width: 210,
  height: 297,
  padding: 12,
  header: 9,
  footer: 8,
};
export const CONTENT_HEIGHT = PAGE.height - PAGE.padding * 2 - PAGE.header - PAGE.footer; // 256

// הערכת גובה טקסט. הערכים שמרניים בכוונה, כדי שהתוכן תמיד ייכנס.
const LINE_MM = 5.15; // שורה בגופן 10pt עם ריווח 1.45
const CHARS_PER_LINE = 116;

const lines = (text: string, chars = CHARS_PER_LINE) =>
  text.split('\n').reduce((sum, part) => sum + Math.max(1, Math.ceil(part.length / chars)), 0);

function coverBlockHeight(block: CoverBlock, contentsCount: number, program: Program): number {
  switch (block.type) {
    case 'intro':
      return 10.5 + lines(program.shortDescription, 85) * 6 + 3 + 15.5 + lines(program.description) * LINE_MM + 1.5;
    case 'heading':
      return 11.5;
    case 'paragraph':
      return lines(block.text) * LINE_MM + 3;
    case 'list':
      return block.items.reduce((s, item) => s + lines(item, CHARS_PER_LINE - 4) * LINE_MM + 1, 0) + 1.5;
    case 'contents':
      return 11.5 + contentsCount * 6.4 + 2;
  }
}

function buildCoverBlocks(program: Program): CoverBlock[] {
  const blocks: CoverBlock[] = [{ type: 'intro' }];
  const addList = (title: string, items: string[] | undefined, ordered: boolean) => {
    if (!items || items.length === 0) return;
    blocks.push({ type: 'heading', text: title });
    blocks.push({ type: 'list', items, ordered, start: 1 });
  };
  addList('מה צריך', program.equipment, false);
  addList('הכנה מראש', program.preparation, true);
  addList('איך משחקים', program.instructions, true);
  addList('טיפים ורעיונות', program.tips, false);
  blocks.push({ type: 'contents' });
  return blocks;
}

/** מחלק בלוקים לדפים. רשימה ארוכה מתפצלת בין דפים, אבל כותרת אף פעם לא נשארת לבד בתחתית דף. */
function packCover(program: Program, contentsCount: number): CoverBlock[][] {
  const pages: CoverBlock[][] = [[]];
  let used = 0;
  const source = buildCoverBlocks(program);
  const newPage = () => {
    pages.push([]);
    used = 0;
  };
  const push = (b: CoverBlock) => {
    pages[pages.length - 1].push(b);
    used += coverBlockHeight(b, contentsCount, program);
  };

  for (let i = 0; i < source.length; i++) {
    const block = source[i];
    const h = coverBlockHeight(block, contentsCount, program);

    if (block.type === 'heading') {
      // כותרת צריכה לפחות מקום לפריט אחד אחריה
      const next = source[i + 1];
      const firstItem =
        next && next.type === 'list'
          ? coverBlockHeight({ ...next, items: [next.items[0]] }, contentsCount, program)
          : 0;
      if (used + h + firstItem > CONTENT_HEIGHT) newPage();
      push(block);
      continue;
    }

    if (block.type === 'list' && used + h > CONTENT_HEIGHT) {
      let start = block.start;
      let remaining = [...block.items];
      while (remaining.length > 0) {
        const fit: string[] = [];
        for (const item of remaining) {
          const test = coverBlockHeight({ ...block, items: [...fit, item] }, contentsCount, program);
          if (used + test > CONTENT_HEIGHT) break;
          fit.push(item);
        }
        if (fit.length === 0) {
          newPage();
          continue;
        }
        push({ ...block, items: fit, start });
        start += fit.length;
        remaining = remaining.slice(fit.length);
        if (remaining.length > 0) newPage();
      }
      continue;
    }

    if (used + h > CONTENT_HEIGHT && pages[pages.length - 1].length > 0) newPage();
    push(block);
  }
  return pages;
}

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

const QUIZ_FIRST_INTRO = 14;

function quizItemHeight(item: QuizItem): number {
  if (item.type === 'round') return 13;
  const text = item.type === 'tie' ? item.q.q : `${item.n}. ${item.q.q}`;
  return lines(text, 80) * 5.6 + lines(item.q.a, 80) * 5.2 + 4.5 + (item.type === 'tie' ? 10 : 0);
}

function sectionSheets(program: Program, section: PrintSection): Sheet[] {
  switch (section.kind) {
    case 'cards': {
      const perPage = section.columns * section.rows;
      return chunk(section.cards, perPage).map((cards, i) => {
        const padded: (Card | null)[] = [...cards];
        while (padded.length < perPage) padded.push(null);
        return { type: 'cards', section, cards: padded, startIndex: i * perPage };
      });
    }
    case 'bingo': {
      const cellCount = section.size * section.size;
      if (section.items.length < cellCount) {
        throw new Error(`${program.id}: צריך לפחות ${cellCount} פריטים ללוח בינגו`);
      }
      const boards = Array.from({ length: section.boards }, (_, i) => ({
        number: i + 1,
        items: seededShuffle(section.items, `${program.id}-${i}`).slice(0, cellCount),
      }));
      return chunk(boards, 2).map((pair) => ({ type: 'bingo', section, boards: pair }));
    }
    case 'quiz': {
      const items: QuizItem[] = [];
      let n = 0;
      for (const round of section.rounds) {
        items.push({ type: 'round', title: round.title });
        for (const q of round.questions) items.push({ type: 'question', n: ++n, q });
      }
      if (section.tieBreaker) items.push({ type: 'tie', q: section.tieBreaker });

      const pages: QuizItem[][] = [[]];
      let used = QUIZ_FIRST_INTRO;
      items.forEach((item, idx) => {
        const h = quizItemHeight(item);
        const next = items[idx + 1];
        const needed = item.type === 'round' && next ? h + quizItemHeight(next) : h;
        if (used + needed > CONTENT_HEIGHT) {
          pages.push([]);
          used = 0;
        }
        pages[pages.length - 1].push(item);
        used += h;
      });
      return pages.map((pageItems, i) => ({ type: 'quiz', section, items: pageItems, first: i === 0 }));
    }
    case 'answerSheet':
      return Array.from({ length: section.copies }, (_, i) => ({ type: 'answerSheet', section, copy: i + 1 }));
    case 'form': {
      const pages = Math.ceil(section.copies / section.perPage);
      return Array.from({ length: pages }, (_, i) => ({
        type: 'form',
        section,
        count: Math.min(section.perPage, section.copies - i * section.perPage),
      }));
    }
    case 'scoreboard':
      return [{ type: 'scoreboard', section }];
    case 'table':
      return [{ type: 'table', section }];
    case 'certificate': {
      const pages = Math.ceil(section.copies / 2);
      return Array.from({ length: pages }, (_, i) => ({
        type: 'certificate',
        section,
        count: Math.min(2, section.copies - i * 2),
      }));
    }
  }
}

/** בונה את כל הדפים של תוכנית, כולל דף המארגן ותוכן העניינים */
export function buildPrintPlan(program: Program): PrintPlan {
  const contentsCount = program.sections.length + 1;
  const coverPages = packCover(program, contentsCount);
  const sheets: Sheet[] = coverPages.map((blocks, i) => ({ type: 'cover', blocks, part: i + 1 }));

  const contents: ContentsEntry[] = [{ title: 'הוראות למארגן', from: 1, to: coverPages.length }];
  for (const section of program.sections) {
    const from = sheets.length + 1;
    const s = sectionSheets(program, section);
    sheets.push(...s);
    contents.push({ title: section.title, from, to: sheets.length });
  }
  return { sheets, contents };
}

const planCache = new Map<string, PrintPlan>();
export function getPrintPlan(program: Program): PrintPlan {
  let plan = planCache.get(program.id);
  if (!plan) {
    plan = buildPrintPlan(program);
    planCache.set(program.id, plan);
  }
  return plan;
}
