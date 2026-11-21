import type { Category, CategoryId } from '../types';

export const categories: Category[] = [
  {
    id: 'family',
    seoTitle: 'משחקים ופעילויות למשפחה להדפסה',
    name: 'משפחה',
    description: 'משחקים שכל המשפחה משחקת יחד, מהקטנים ועד סבא וסבתא.',
    icon: 'family',
    tint: '#e6f3fd',
  },
  {
    id: 'friends',
    seoTitle: 'משחקים לחברים להדפסה',
    name: 'חברים',
    description: 'פעילויות למפגש חברים: שוברים קרח, צוחקים ומכירים לעומק.',
    icon: 'friends',
    tint: '#fff1e3',
  },
  {
    id: 'work',
    seoTitle: 'משחקי גיבוש לעובדים להדפסה',
    name: 'עבודה וגיבוש',
    description: 'אתגרים ומשחקי היכרות לצוותים, ימי גיבוש וישיבות צוות.',
    icon: 'work',
    tint: '#eaf6ef',
  },
  {
    id: 'shabbat-holidays',
    seoTitle: 'משחקים ושאלות לשולחן שבת וחג',
    name: 'שבתות וחגים',
    description: 'שאלות, חידות וחידונים לשולחן השבת ולסעודות החג.',
    icon: 'shabbat',
    tint: '#fdf6e0',
  },
  {
    id: 'birthdays',
    seoTitle: 'משחקים ליום הולדת להדפסה',
    name: 'ימי הולדת',
    description: 'חידונים ומשחקים שהופכים יום הולדת לחגיגה של ממש.',
    icon: 'birthday',
    tint: '#fdeef3',
  },
  {
    id: 'events',
    seoTitle: 'משחקים לאירועים ומסיבות',
    name: 'אירועים ומסיבות',
    description: 'משחקי היכרות ופעילויות לאירועים, ערבי זוגות ומסיבות.',
    icon: 'events',
    tint: '#efeefd',
  },
  {
    id: 'kids',
    seoTitle: 'פעילויות לילדים להדפסה',
    name: 'ילדים',
    description: 'ציד אוצרות, בינגו ומשימות מצחיקות שילדים פשוט אוהבים.',
    icon: 'kids',
    tint: '#e8f8fa',
  },
  {
    id: 'trivia',
    seoTitle: 'חידונים וידע כללי להדפסה',
    name: 'חידונים וידע כללי',
    description: 'חידוני ידע בקבוצות, עם דפי תשובות ולוח ניקוד מוכן.',
    icon: 'trivia',
    tint: '#f1f4f8',
  },
];

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>;
