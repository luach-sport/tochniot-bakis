import { Brain, Briefcase, Cake, Flame, House, PartyPopper, Puzzle, Smile, type LucideProps } from 'lucide-react';
import type { Category } from '../types';

const icons = {
  family: House,
  friends: Smile,
  work: Briefcase,
  shabbat: Flame,
  birthday: Cake,
  events: PartyPopper,
  kids: Puzzle,
  trivia: Brain,
} satisfies Record<Category['icon'], unknown>;

export function CategoryIcon({ icon, ...props }: { icon: Category['icon'] } & LucideProps) {
  const Icon = icons[icon];
  return <Icon aria-hidden="true" {...props} />;
}
