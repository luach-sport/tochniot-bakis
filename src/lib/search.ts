// חיפוש וסינון בעברית, שעובדים כולם בדפדפן.
import type { CategoryId, Difficulty, Program } from '../types';
import { categoryById } from '../data/categories';

const FINAL_LETTERS: Record<string, string> = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' };

/** מנרמל טקסט עברי: בלי ניקוד, בלי סימני פיסוק, ואותיות סופיות כרגילות */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[֑-ׇ]/g, '') // ניקוד וטעמים
    .replace(/[ךםןףץ]/g, (ch) => FINAL_LETTERS[ch])
    .replace(/["'`״׳\-–—_.,:;!?()[\]{}/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// תחיליות נפוצות: "למשפחה" ימצא "משפחה", "והחברים" ימצא "חברים"
const PREFIXES = ['וה', 'שה', 'כש', 'מה', 'לה', 'בה', 'ו', 'ה', 'ל', 'ב', 'מ', 'ש', 'כ'];

function tokenVariants(token: string): string[] {
  const variants = new Set([token]);
  for (const p of PREFIXES) {
    if (token.length - p.length >= 3 && token.startsWith(p)) variants.add(token.slice(p.length));
  }
  return [...variants];
}

const indexCache = new Map<string, string>();
function searchText(p: Program): string {
  let text = indexCache.get(p.id);
  if (!text) {
    text = normalize(
      [
        p.name,
        p.shortDescription,
        p.description,
        p.keywords.join(' '),
        p.categories.map((c) => categoryById[c].name).join(' '),
        p.equipment.join(' '),
      ].join(' '),
    );
    indexCache.set(p.id, text);
  }
  return text;
}

function nameText(p: Program): string {
  return normalize(`${p.name} ${p.keywords.join(' ')}`);
}

/** מחזיר ציון התאמה. 0 = לא מתאים */
export function scoreProgram(p: Program, query: string): number {
  const tokens = normalize(query).split(' ').filter(Boolean);
  if (tokens.length === 0) return 1;
  const full = searchText(p);
  const name = nameText(p);
  let score = 0;
  for (const token of tokens) {
    const variants = tokenVariants(token);
    const inName = variants.some((v) => name.includes(v));
    const inText = inName || variants.some((v) => full.includes(v));
    if (!inText) return 0; // כל מילה בחיפוש חייבת להופיע
    score += inName ? 3 : 1;
  }
  return score;
}

export type ParticipantsFilter = '' | '1-4' | '5-10' | '11-20' | '21+';
export type DurationFilter = '' | 'short' | 'medium' | 'long';

export interface Filters {
  q: string;
  category: CategoryId | '';
  participants: ParticipantsFilter;
  duration: DurationFilter;
  difficulty: Difficulty | '';
}

export const emptyFilters: Filters = { q: '', category: '', participants: '', duration: '', difficulty: '' };

export const participantsOptions: { value: ParticipantsFilter; label: string; range: [number, number] }[] = [
  { value: '1-4', label: 'עד 4 משתתפים', range: [1, 4] },
  { value: '5-10', label: '5–10 משתתפים', range: [5, 10] },
  { value: '11-20', label: '11–20 משתתפים', range: [11, 20] },
  { value: '21+', label: 'יותר מ-20', range: [21, 10000] },
];

export const durationOptions: { value: DurationFilter; label: string; range: [number, number] }[] = [
  { value: 'short', label: 'עד חצי שעה', range: [0, 30] },
  { value: 'medium', label: 'חצי שעה עד שעה', range: [30, 60] },
  { value: 'long', label: 'יותר משעה', range: [61, 10000] },
];

const overlaps = (a: [number, number], min: number, max: number) => min <= a[1] && max >= a[0];

export function filterPrograms(list: Program[], f: Filters): Program[] {
  const scored = list
    .map((p) => ({ p, score: scoreProgram(p, f.q) }))
    .filter(({ p, score }) => {
      if (score === 0) return false;
      if (f.category && !p.categories.includes(f.category)) return false;
      if (f.difficulty && p.difficulty !== f.difficulty) return false;
      if (f.participants) {
        const opt = participantsOptions.find((o) => o.value === f.participants);
        if (opt && !overlaps(opt.range, p.participants.min, p.participants.max)) return false;
      }
      if (f.duration) {
        const opt = durationOptions.find((o) => o.value === f.duration);
        if (opt && !overlaps(opt.range, p.durationMinutes.min, p.durationMinutes.max)) return false;
      }
      return true;
    });
  if (f.q.trim()) scored.sort((a, b) => b.score - a.score || b.p.popularity - a.p.popularity);
  else scored.sort((a, b) => b.p.popularity - a.p.popularity);
  return scored.map((s) => s.p);
}

export function filtersFromParams(params: URLSearchParams): Filters {
  const get = (k: string) => params.get(k) ?? '';
  return {
    q: get('q'),
    category: get('category') as Filters['category'],
    participants: get('participants') as ParticipantsFilter,
    duration: get('duration') as DurationFilter,
    difficulty: get('difficulty') as Filters['difficulty'],
  };
}

export function filtersToParams(f: Filters): URLSearchParams {
  const params = new URLSearchParams();
  (Object.keys(f) as (keyof Filters)[]).forEach((k) => {
    if (f[k]) params.set(k, f[k]);
  });
  return params;
}
