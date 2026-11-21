import { Baby, Clock, Gauge, Users } from 'lucide-react';
import type { Program } from '../types';
import { agesLabel, difficultyLabels, durationLabel, participantsLabel } from '../lib/format';

export function ProgramMeta({ program, compact = false }: { program: Program; compact?: boolean }) {
  const size = compact ? 15 : 18;
  return (
    <ul className={`program-meta${compact ? ' compact' : ''}`}>
      <li>
        <Users size={size} aria-hidden="true" />
        <span>{participantsLabel(program)}</span>
      </li>
      <li>
        <Clock size={size} aria-hidden="true" />
        <span>{durationLabel(program)}</span>
      </li>
      <li>
        <Baby size={size} aria-hidden="true" />
        <span>{agesLabel(program)}</span>
      </li>
      {!compact && (
        <li>
          <Gauge size={size} aria-hidden="true" />
          <span>רמת קושי: {difficultyLabels[program.difficulty]}</span>
        </li>
      )}
    </ul>
  );
}
