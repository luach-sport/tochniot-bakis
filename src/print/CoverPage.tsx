import type { Program } from '../types';
import { agesLabel, difficultyLabels, durationLabel, participantsLabel } from '../lib/format';
import type { ContentsEntry, CoverBlock } from './paginate';

export function CoverPage({
  program,
  blocks,
  contents,
}: {
  program: Program;
  blocks: CoverBlock[];
  contents: ContentsEntry[];
}) {
  return (
    <div className="cover">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'intro':
            return (
              <div key={i} className="cover-intro">
                <h1 className="cover-title">{program.name}</h1>
                <p className="cover-subtitle">{program.shortDescription}</p>
                <dl className="cover-meta">
                  <div>
                    <dt>משתתפים</dt>
                    <dd>{participantsLabel(program)}</dd>
                  </div>
                  <div>
                    <dt>משך</dt>
                    <dd>{durationLabel(program)}</dd>
                  </div>
                  <div>
                    <dt>גילאים</dt>
                    <dd>{agesLabel(program)}</dd>
                  </div>
                  <div>
                    <dt>רמת קושי</dt>
                    <dd>{difficultyLabels[program.difficulty]}</dd>
                  </div>
                </dl>
                <p className="cover-description">{program.description}</p>
              </div>
            );
          case 'heading':
            return (
              <h2 key={i} className="cover-heading">
                {block.text}
              </h2>
            );
          case 'paragraph':
            return (
              <p key={i} className="cover-paragraph">
                {block.text}
              </p>
            );
          case 'list':
            return block.ordered ? (
              <ol key={i} className="cover-list ordered" start={block.start}>
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="cover-list">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          case 'contents':
            return (
              <div key={i} className="cover-contents">
                <h2 className="cover-heading">מה יש בקובץ</h2>
                <table>
                  <tbody>
                    {contents.map((c) => (
                      <tr key={c.title}>
                        <td>{c.title}</td>
                        <td className="pages">{c.from === c.to ? `עמוד ${c.from}` : `עמודים ${c.from}-${c.to}`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
