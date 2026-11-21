// מבנה הנתונים של האתר. כל תוכנית חדשה היא קובץ אחד בתיקייה src/data/programs.

export type CategoryId =
  | 'family'
  | 'friends'
  | 'work'
  | 'shabbat-holidays'
  | 'birthdays'
  | 'events'
  | 'kids'
  | 'trivia';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Category {
  id: CategoryId;
  name: string;
  /** כותרת לגוגל, למשל "משחקים למשפחה להדפסה" */
  seoTitle: string;
  description: string;
  /** שם אייקון מתוך src/components/CategoryIcon.tsx */
  icon: 'family' | 'friends' | 'work' | 'shabbat' | 'birthday' | 'events' | 'kids' | 'trivia';
  /** צבע רקע עדין לכרטיס הקטגוריה */
  tint: string;
}

export interface Card {
  /** תווית קטנה בראש הכרטיס, למשל "2 נקודות" או "חידה" */
  tag?: string;
  title?: string;
  text: string;
  /** תשובה שמודפסת הפוך בתחתית הכרטיס (לחידות) */
  answer?: string;
}

export interface QuizQuestion {
  q: string;
  a: string;
}

/** כל סוגי העמודים שאפשר להכניס לקובץ ההדפסה */
export type PrintSection =
  | {
      kind: 'cards';
      title: string;
      intro?: string;
      cards: Card[];
      columns: 2 | 3 | 4 | 5;
      rows: number;
      /** גודל טקסט בכרטיס */
      size?: 'sm' | 'md' | 'lg' | 'xl';
      numbered?: boolean;
    }
  | {
      kind: 'bingo';
      title: string;
      intro?: string;
      items: string[];
      boards: number;
      size: 4 | 5;
      /** כותרת מעל הלוח, למשל "מצאו מישהו ש..." */
      boardHeading: string;
      /** האם בכל משבצת יש קו לכתיבת שם */
      nameLine?: boolean;
    }
  | {
      kind: 'quiz';
      title: string;
      intro?: string;
      rounds: { title: string; questions: QuizQuestion[] }[];
      tieBreaker?: QuizQuestion;
    }
  | {
      kind: 'answerSheet';
      title: string;
      intro?: string;
      /** שדות כותרת, למשל "שם הקבוצה" */
      headerFields: string[];
      rounds: { title: string; count: number }[];
      copies: number;
    }
  | {
      kind: 'form';
      title: string;
      intro?: string;
      headerFields?: string[];
      questions: string[];
      /** כמה טפסים בדף: 1, 2 (חצי דף) או 4 (רבע דף) */
      perPage: 1 | 2 | 4;
      copies: number;
      /** שורות כתיבה לכל שאלה */
      lines?: number;
    }
  | {
      kind: 'scoreboard';
      title: string;
      intro?: string;
      rowLabel: string;
      rows: string[];
      columns: string[];
      totalLabel?: string;
    }
  | {
      kind: 'table';
      title: string;
      intro?: string;
      headers: string[];
      rows: string[][];
    }
  | {
      kind: 'certificate';
      title: string;
      text: string;
      copies: number;
    };

export interface Program {
  /** מזהה ייחודי באנגלית, משמש גם בכתובת העמוד ובשם קובץ ה-PDF */
  id: string;
  name: string;
  /** משפט אחד שמופיע בכרטיס התוכנית */
  shortDescription: string;
  /** תיאור מזמין לעמוד התוכנית */
  description: string;
  categories: CategoryId[];
  participants: { min: number; max: number };
  durationMinutes: { min: number; max: number };
  ages: { min: number; max?: number };
  difficulty: Difficulty;
  equipment: string[];
  preparation: string[];
  instructions: string[];
  tips?: string[];
  keywords: string[];
  /** קובץ ה-PDF בתוך public/pdfs */
  pdfFile: string;
  /** תמונת המחשה בתוך public/images/programs */
  image: string;
  /** מחיר בשקלים. 0 = חינם */
  price: number;
  /** ככל שהמספר גבוה יותר, התוכנית מופיעה גבוה יותר ב"פופולריות" */
  popularity: number;
  /** תאריך הוספה בפורמט YYYY-MM-DD */
  addedAt: string;
  /** תוכן קובץ ההדפסה */
  sections: PrintSection[];
}
