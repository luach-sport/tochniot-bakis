// "המוח" של העוזר לבחירת תוכנית.
// מבין טקסט חופשי בעברית, יודע אילו פרטים חסרים, ומדרג את התוכניות.
// הכול רץ בדפדפן, בלי שרת ובלי עלות.
import type { CategoryId, Program, Vibe } from '../types';
import { normalize } from '../lib/search';
import { agesLabel, durationLabel, participantsLabel } from '../lib/format';
import { categoryById } from '../data/categories';

export type AgeGroup = 'young' | 'kids' | 'adults' | 'mixed';
export type DurationPref = 'short' | 'medium' | 'long';

export interface Answers {
  occasion?: CategoryId | 'any';
  participants?: number | 'any';
  ages?: AgeGroup | 'any';
  duration?: DurationPref | 'any';
  vibe?: Vibe | 'any';
  shabbat?: boolean;
  /** מילים מהטקסט החופשי, לחיפוש בתוכן התוכניות */
  words: string[];
}

export const emptyAnswers = (): Answers => ({ words: [] });

// ---------- הבנת טקסט חופשי ----------

const has = (text: string, list: string[]) => list.some((w) => text.includes(normalize(w)));

const occasionWords: [CategoryId, string[]][] = [
  ['birthdays', ['יום הולדת', 'יומולדת', 'יום ההולדת', 'הולדת']],
  ['shabbat-holidays', ['שבת', 'סעודה', 'שולחן שבת', 'חג', 'פסח', 'סוכות', 'חנוכה', 'פורים', 'ליל הסדר', 'שבועות', 'ראש השנה']],
  ['work', ['עבודה', 'עובדים', 'צוות', 'גיבוש', 'משרד', 'חברה שלנו', 'כנס', 'הנהלה', 'יום כיף']],
  ['events', ['אירוע', 'מסיבה', 'חתונה', 'שבע ברכות', 'אירוסין', 'בר מצווה', 'בת מצווה', 'חינה', 'זוגות', 'זוגי', 'יום נישואין', 'מחזור', 'איחוד']],
  ['trivia', ['חידון', 'טריוויה', 'ידע כללי']],
  ['family', ['משפחה', 'משפחתי', 'משפחתית', 'הורים', 'סבא', 'סבתא', 'אחים', 'בני דודים', 'ההורים']],
  ['kids', ['ילדים', 'ילד', 'גן', 'קייטנה', 'כיתה', 'תלמידים', 'נכדים', 'ילדות']],
  ['friends', ['חברים', 'חברות', 'חבר\'ה', 'חברה', 'שותפים', 'שכנים']],
];

const vibeWords: [Vibe, string[]][] = [
  ['funny', ['צחוק', 'מצחיק', 'לצחוק', 'שטויות', 'קליל', 'כיף', 'משוגע', 'מטורף']],
  ['social', ['היכרות', 'להכיר', 'לשבור את הקרח', 'שבירת קרח', 'שיחה', 'לדבר', 'לחבר', 'מכירים']],
  ['competitive', ['תחרות', 'תחרותי', 'להתחרות', 'מנצח', 'ניקוד', 'חידון', 'קבוצות']],
  ['calm', ['רגוע', 'שקט', 'מעמיק', 'משמעותי', 'ערכים', 'נעים', 'שלו']],
];

const peopleUnits = ['איש', 'אנשים', 'משתתפים', 'ילדים', 'חברים', 'חברות', 'עובדים', 'אורחים', 'נפשות', 'בני משפחה', 'נכדים', 'תלמידים', 'בנות', 'בנים'];

// מספרים במילים (אחרי נרמול: אותיות סופיות הופכות לרגילות)
const numberWords: Record<string, number> = Object.fromEntries(
  Object.entries({
    שלושה: 3, שלוש: 3, ארבעה: 4, ארבע: 4, חמישה: 5, חמש: 5, שישה: 6, שש: 6, שבעה: 7, שבע: 7,
    שמונה: 8, תשעה: 9, תשע: 9, עשרה: 10, עשר: 10, עשרים: 20, שלושים: 30, ארבעים: 40, חמישים: 50,
  }).map(([k, v]) => [normalize(k), v]),
);

const STOP = new Set(
  ['אני', 'אנחנו', 'אתה', 'צריך', 'צריכה', 'צריכים', 'רוצה', 'רוצים', 'משהו', 'משחק', 'פעילות', 'תוכנית', 'בשביל', 'עבור', 'שלנו', 'שלי', 'יהיה', 'יש', 'לנו', 'לי', 'עם', 'של', 'על', 'את', 'מה', 'איזה', 'כמה', 'הרבה', 'מאוד', 'טוב', 'אפשר', 'בערך', 'קצת', 'גם', 'או', 'כל', 'זה', 'הם', 'היא', 'הוא', 'אבל', 'כי', 'לא', 'כן', 'עוד', 'שם', 'פה', 'אחד', 'אחת'].map(normalize),
);

/** מחלץ כמה שיותר פרטים ממשפט חופשי */
export function understand(text: string, prev: Answers): Answers {
  const t = normalize(text);
  const a: Answers = { ...prev, words: [...prev.words] };

  if (!a.occasion || a.occasion === 'any') {
    const found = occasionWords.find(([, words]) => has(t, words));
    if (found) a.occasion = found[0];
  }

  // שבת ויום טוב (לא חנוכה ופורים, שבהם מותר לכתוב)
  if (a.shabbat === undefined && has(t, ['שבת', 'יום טוב', 'סעודת שבת', 'סעודת חג', 'ליל הסדר', 'סוכות', 'שבועות', 'ראש השנה'])) {
    a.shabbat = true;
  }

  // מספר משתתפים: "15 ילדים", "כ-20 איש", "4 זוגות"
  if (a.participants === undefined || a.participants === 'any') {
    const units = peopleUnits.map(normalize).join('|');
    const words = Object.keys(numberWords).join('|');
    const m = t.match(new RegExp(`(\\d{1,3}|${words})\\s*(?:${units})`));
    const couples = t.match(new RegExp(`(\\d{1,2}|${words})\\s*זוגות`));
    const toNum = (x: string) => numberWords[x] ?? Number(x);
    if (couples) a.participants = toNum(couples[1]) * 2;
    else if (m) a.participants = toNum(m[1]);
    else if (has(t, ['זוג', 'שנינו'])) a.participants = 2;
  }

  // גילאים
  if (a.ages === undefined || a.ages === 'any') {
    const ageNum = t.match(/(?:בני|בנות|בגיל|גילאי|גיל)\s*(\d{1,2})/);
    if (ageNum) {
      const n = Number(ageNum[1]);
      a.ages = n <= 8 ? 'young' : n <= 15 ? 'kids' : 'adults';
    } else if (has(t, ['קטנים', 'פעוטות', 'גן', 'גננת'])) a.ages = 'young';
    else if (has(t, ['נוער', 'נערים', 'נערות', 'תיכון'])) a.ages = 'kids';
    else if (has(t, ['כל הגילאים', 'כל המשפחה', 'סבא', 'סבתא', 'נכדים'])) a.ages = 'mixed';
    else if (has(t, ['מבוגרים', 'עובדים', 'צוות', 'זוגות', 'נשואים', 'חתונה'])) a.ages = 'adults';
    else if (a.occasion === 'work') a.ages = 'adults';
  }

  // זמן
  if (a.duration === undefined || a.duration === 'any') {
    const mins = t.match(/(\d{1,3})\s*דקות/);
    if (mins) {
      const n = Number(mins[1]);
      a.duration = n <= 30 ? 'short' : n <= 60 ? 'medium' : 'long';
    } else if (has(t, ['רבע שעה', 'חצי שעה', 'משהו קצר', 'קצר'])) a.duration = 'short';
    else if (has(t, ['שעתיים', 'שעה וחצי', 'ערב שלם', 'יום שלם', 'הרבה זמן'])) a.duration = 'long';
    else if (has(t, ['שעה'])) a.duration = 'medium';
  }

  if (a.vibe === undefined || a.vibe === 'any') {
    const found = vibeWords.find(([, words]) => has(t, words));
    if (found) a.vibe = found[0];
  }

  for (const w of t.split(' ')) if (w.length >= 3 && !STOP.has(w) && !/^\d+$/.test(w)) a.words.push(w);
  return a;
}

// ---------- שאלות ----------

export interface Choice {
  label: string;
  apply: (a: Answers) => Answers;
}

export interface Question {
  key: keyof Omit<Answers, 'words'>;
  text: string;
  choices: Choice[];
}

const set =
  <K extends keyof Answers>(key: K, value: Answers[K]) =>
  (a: Answers): Answers => ({ ...a, [key]: value });

export const questions: Question[] = [
  {
    key: 'occasion',
    text: 'לאיזה מפגש אתם מתכוננים?',
    choices: [
      { label: 'ערב משפחתי', apply: set('occasion', 'family') },
      { label: 'שולחן שבת או חג', apply: (a) => ({ ...a, occasion: 'shabbat-holidays' }) },
      { label: 'יום הולדת', apply: set('occasion', 'birthdays') },
      { label: 'מפגש חברים', apply: set('occasion', 'friends') },
      { label: 'גיבוש בעבודה', apply: (a) => ({ ...a, occasion: 'work', ages: a.ages ?? 'adults' }) },
      { label: 'אירוע או מסיבה', apply: set('occasion', 'events') },
      { label: 'פעילות לילדים', apply: set('occasion', 'kids') },
      { label: 'ערב חידון', apply: set('occasion', 'trivia') },
    ],
  },
  {
    key: 'participants',
    text: 'כמה משתתפים יהיו בערך?',
    choices: [
      { label: '2-4', apply: set('participants', 3) },
      { label: '5-10', apply: set('participants', 8) },
      { label: '11-20', apply: set('participants', 15) },
      { label: 'יותר מ-20', apply: set('participants', 30) },
    ],
  },
  {
    key: 'ages',
    text: 'מי משתתף?',
    choices: [
      { label: 'ילדים קטנים (עד 8)', apply: set('ages', 'young') },
      { label: 'ילדים ונוער', apply: set('ages', 'kids') },
      { label: 'מבוגרים', apply: set('ages', 'adults') },
      { label: 'כל הגילאים ביחד', apply: set('ages', 'mixed') },
    ],
  },
  {
    key: 'duration',
    text: 'כמה זמן יש לכם?',
    choices: [
      { label: 'עד חצי שעה', apply: set('duration', 'short') },
      { label: 'חצי שעה עד שעה', apply: set('duration', 'medium') },
      { label: 'יותר משעה', apply: set('duration', 'long') },
      { label: 'לא משנה', apply: set('duration', 'any') },
    ],
  },
  {
    key: 'vibe',
    text: 'איזו אווירה אתם רוצים?',
    choices: [
      { label: 'צחוק ושטויות', apply: set('vibe', 'funny') },
      { label: 'היכרות ושיחה', apply: set('vibe', 'social') },
      { label: 'תחרות וניצחון', apply: set('vibe', 'competitive') },
      { label: 'רגוע ומעמיק', apply: set('vibe', 'calm') },
      { label: 'קצת מהכול', apply: set('vibe', 'any') },
    ],
  },
  {
    key: 'shabbat',
    text: 'זה בשבת או בחג, בלי כתיבה?',
    choices: [
      { label: 'כן, בלי לכתוב', apply: set('shabbat', true) },
      { label: 'לא, אפשר לכתוב', apply: set('shabbat', false) },
    ],
  },
];

/** השאלה הבאה שעוד לא נענתה, או null אם אפשר להמליץ */
export function nextQuestion(a: Answers): Question | null {
  for (const q of questions) {
    if (q.key === 'shabbat') {
      if (a.shabbat === undefined && a.occasion === 'shabbat-holidays') return q;
      continue;
    }
    if (a[q.key] === undefined) return q;
  }
  return null;
}

// ---------- דירוג ----------

const durationRanges: Record<DurationPref, [number, number]> = {
  short: [0, 30],
  medium: [30, 60],
  long: [61, 600],
};

const vibeLabels: Record<Vibe, string> = {
  funny: 'הרבה צחוק',
  social: 'מעולה להיכרות ולשיחה',
  competitive: 'יש תחרות וניקוד',
  calm: 'אווירה רגועה ונעימה',
};

export interface Recommendation {
  program: Program;
  score: number;
  reasons: string[];
}

function ageFit(p: Program, ages: AgeGroup): number {
  const { min, max } = p.ages;
  switch (ages) {
    case 'young':
      if (min > 7) return -40;
      return p.categories.includes('kids') ? 10 : 2;
    case 'kids':
      if (min > 12) return -30;
      if (max !== undefined && max < 9) return -8;
      return 4;
    case 'adults':
      if (max !== undefined && max <= 12) return -40;
      return min >= 10 ? 4 : 2;
    case 'mixed':
      if (min > 10) return -25;
      if (max !== undefined && max <= 12) return -10;
      return min <= 6 ? 6 : 3;
  }
}

export function recommend(programs: Program[], a: Answers, count = 3): Recommendation[] {
  const results = programs.map((p) => {
    let score = p.popularity / 50; // שובר שוויון קטן
    const reasons: string[] = [];

    if (a.occasion && a.occasion !== 'any') {
      const idx = p.categories.indexOf(a.occasion);
      if (idx === 0) score += 14;
      else if (idx > 0) score += 10;
      if (idx >= 0) reasons.push(`מתאים ל${categoryById[a.occasion].name}`);
      else score -= 8;
    }

    if (typeof a.participants === 'number') {
      const n = a.participants;
      if (n >= p.participants.min && n <= p.participants.max) {
        score += 8;
        reasons.push(participantsLabel(p));
      } else {
        const off = n < p.participants.min ? p.participants.min - n : n - p.participants.max;
        // קצת יותר מדי משתתפים: אפשר לשחק בזוגות או בקבוצות
        const nearMax = n > p.participants.max && n <= p.participants.max * 1.6;
        score -= nearMax ? 5 : Math.min(25, 4 + off * 1.5);
      }
    }

    if (a.ages && a.ages !== 'any') {
      const fit = ageFit(p, a.ages);
      score += fit;
      if (fit > 0) reasons.push(agesLabel(p));
    }

    if (a.duration && a.duration !== 'any') {
      const [lo, hi] = durationRanges[a.duration];
      if (p.durationMinutes.min <= hi && p.durationMinutes.max >= lo) {
        score += 6;
        reasons.push(durationLabel(p));
      } else score -= 6;
    }

    if (a.vibe && a.vibe !== 'any') {
      const idx = p.vibes.indexOf(a.vibe);
      if (idx >= 0) {
        score += idx === 0 ? 9 : 6;
        reasons.push(vibeLabels[a.vibe]);
      } else score -= 5;
    }

    if (a.shabbat === true) {
      if (p.shabbatFriendly) {
        score += 5;
        reasons.push('אפשר לשחק בשבת בלי לכתוב');
      } else score -= 40;
    }

    // מילים מהטקסט החופשי שמופיעות בתוכנית
    if (a.words.length) {
      const text = normalize([p.name, p.shortDescription, p.keywords.join(' ')].join(' '));
      const hits = new Set(a.words.filter((w) => text.includes(w) || (w.length > 4 && text.includes(w.slice(1)))));
      score += Math.min(9, hits.size * 3);
    }

    return { program: p, score, reasons: [...new Set(reasons)].slice(0, 3) };
  });

  return results.sort((x, y) => y.score - x.score).slice(0, count);
}
