import type { Difficulty, Program } from '../types';

export const difficultyLabels: Record<Difficulty, string> = {
  easy: 'קל',
  medium: 'בינוני',
  hard: 'מאתגר',
};

export function participantsLabel(p: Program): string {
  const { min, max } = p.participants;
  if (min === max) return `${min} משתתפים`;
  if (min === 1) return `עד ${max} משתתפים`;
  return `${min}-${max} משתתפים`;
}

export function durationLabel(p: Program): string {
  const { min, max } = p.durationMinutes;
  const fmt = (m: number) => (m >= 60 && m % 60 === 0 ? (m === 60 ? 'שעה' : `${m / 60} שעות`) : `${m}`);
  if (min === max) return `${fmt(min)} דקות`;
  if (max >= 60 && max % 60 === 0 && max > 60) return `${min} דקות עד ${fmt(max)}`;
  if (max === 60) return `${min} דקות עד שעה`;
  return `${min}-${max} דקות`;
}

export function agesLabel(p: Program): string {
  const { min, max } = p.ages;
  if (max) return `גילאי ${min}-${max}`;
  if (min >= 18) return 'מבוגרים';
  return `מגיל ${min}`;
}

export function priceLabel(p: Program): string {
  return p.price === 0 ? 'חינם' : `${p.price} ₪`;
}

/** שם קובץ ידידותי להורדה */
export function downloadName(p: Program): string {
  const clean = p.name.replace(/[:"/\\?*<>|]/g, '').replace(/\s+/g, ' ').trim();
  return `${clean} - תוכניות בכיס.pdf`;
}
