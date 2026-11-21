// רשימת כל התוכניות באתר.
// כדי להוסיף תוכנית חדשה: יוצרים קובץ חדש בתיקייה הזאת (אפשר להעתיק קובץ קיים),
// ומוסיפים אותו כאן לרשימה. את כל השאר (עמוד, חיפוש, PDF, מפת אתר) האתר בונה לבד.
import type { Program } from '../../types';
import familyBingo from './family-bingo';
import generalTrivia from './general-trivia';
import friendsIcebreaker from './friends-icebreaker';
import teamChallenge from './team-challenge';
import birthdayQuiz from './birthday-quiz';
import shabbatTable from './shabbat-table';
import funnyTasks from './funny-tasks';
import describeAndGuess from './describe-and-guess';
import couplesQuiz from './couples-quiz';
import treasureHunt from './treasure-hunt';
import peopleBingo from './people-bingo';
import whoKnowsWho from './who-knows-who';

export const programs: Program[] = [
  familyBingo,
  generalTrivia,
  friendsIcebreaker,
  teamChallenge,
  birthdayQuiz,
  shabbatTable,
  funnyTasks,
  describeAndGuess,
  couplesQuiz,
  treasureHunt,
  peopleBingo,
  whoKnowsWho,
];

const ids = new Set<string>();
for (const p of programs) {
  if (ids.has(p.id)) throw new Error(`מזהה תוכנית כפול: ${p.id}`);
  if (!/^[a-z0-9-]+$/.test(p.id)) throw new Error(`מזהה לא תקין (רק אותיות באנגלית, מספרים ומקפים): ${p.id}`);
  ids.add(p.id);
}

export const programById = (id: string | undefined): Program | undefined =>
  programs.find((p) => p.id === id);
