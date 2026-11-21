import type { CSSProperties } from 'react';
import type { Sheet } from './paginate';

type SheetOf<K extends Sheet['type']> = Extract<Sheet, { type: K }>;

function Scissors() {
  return (
    <svg className="scissors" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <circle cx="6" cy="6" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.1 8.1 20 20M8.1 15.9 20 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function SheetTitle({ title, intro, cut }: { title: string; intro?: string; cut?: boolean }) {
  return (
    <div className="sheet-title">
      <h2>{title}</h2>
      {intro && (
        <p>
          {cut && <Scissors />}
          {intro}
        </p>
      )}
    </div>
  );
}

export function CardsPage({ sheet }: { sheet: SheetOf<'cards'> }) {
  const { section } = sheet;
  const style = {
    gridTemplateColumns: `repeat(${section.columns}, 1fr)`,
    gridTemplateRows: `repeat(${section.rows}, 1fr)`,
  } as CSSProperties;
  return (
    <div className="cards-page">
      <SheetTitle title={section.title} intro={section.intro} cut />
      <div className={`cards-grid size-${section.size ?? 'md'}`} style={style}>
        {sheet.cards.map((card, i) =>
          card ? (
            <div className="print-card" key={i}>
              {(card.tag || section.numbered) && (
                <div className="card-tag">
                  {section.numbered && <span className="card-number">{sheet.startIndex + i + 1}</span>}
                  {card.tag}
                </div>
              )}
              {card.title && <div className="card-title">{card.title}</div>}
              {card.text ? (
                <div className="card-text">{card.text}</div>
              ) : (
                <div className="card-blank" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              )}
              {card.answer && <div className="card-answer">תשובה: {card.answer}</div>}
            </div>
          ) : (
            <div className="print-card empty" key={i} aria-hidden="true" />
          ),
        )}
      </div>
    </div>
  );
}

export function BingoPage({ sheet }: { sheet: SheetOf<'bingo'> }) {
  const { section } = sheet;
  return (
    <div className="bingo-page">
      <SheetTitle title={section.title} intro={section.intro} cut />
      <div className="bingo-boards">
        {sheet.boards.map((board) => (
          <div className="bingo-board" key={board.number}>
            <div className="bingo-head">
              <strong>{section.boardHeading}</strong>
              <span>לוח {board.number}</span>
              <span className="bingo-name">שם: ______________</span>
            </div>
            <div
              className={`bingo-grid cols-${section.size}${section.nameLine ? ' with-names' : ''}`}
              style={{ gridTemplateColumns: `repeat(${section.size}, 1fr)` }}
            >
              {board.items.map((item, i) => (
                <div className="bingo-cell" key={i}>
                  <span>{item}</span>
                  {section.nameLine && <span className="bingo-line" />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuizPage({ sheet }: { sheet: SheetOf<'quiz'> }) {
  const { section } = sheet;
  return (
    <div className="quiz-page">
      {sheet.first && <SheetTitle title={section.title} intro={section.intro} />}
      {sheet.items.map((item, i) => {
        if (item.type === 'round') return <h3 key={i} className="quiz-round">{item.title}</h3>;
        if (item.type === 'tie')
          return (
            <div key={i} className="quiz-item tie">
              <div className="quiz-q">{item.q.q}</div>
              <div className="quiz-a">תשובה: {item.q.a}</div>
            </div>
          );
        return (
          <div key={i} className="quiz-item">
            <div className="quiz-q">
              <span className="quiz-n">{item.n}.</span> {item.q.q}
            </div>
            <div className="quiz-a">תשובה: {item.q.a}</div>
          </div>
        );
      })}
    </div>
  );
}

function HeaderFields({ fields }: { fields: string[] }) {
  return (
    <div className="header-fields">
      {fields.map((f) => (
        <div className="field" key={f}>
          <span>{f}:</span>
          <span className="line" />
        </div>
      ))}
    </div>
  );
}

export function AnswerSheetPage({ sheet }: { sheet: SheetOf<'answerSheet'> }) {
  const { section } = sheet;
  let n = 0;
  return (
    <div className="answer-page">
      <SheetTitle title={`${section.title} (עותק ${sheet.copy})`} intro={section.intro} />
      <HeaderFields fields={section.headerFields} />
      <div className="answer-rounds">
        {section.rounds.map((round) => (
          <div className="answer-round" key={round.title}>
            <h3>{round.title}</h3>
            <ol>
              {Array.from({ length: round.count }, () => {
                n += 1;
                return (
                  <li key={n}>
                    <span className="num">{n}.</span>
                    <span className="line" />
                  </li>
                );
              })}
            </ol>
            <div className="round-score">ניקוד בסבב: ______</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormPage({ sheet }: { sheet: SheetOf<'form'> }) {
  const { section } = sheet;
  const longest = Math.max(...section.questions.map((q) => q.length));
  const stacked = section.perPage !== 4 && longest > 24;
  const columns = section.perPage === 2 ? 2 : 1;
  return (
    <div className={`form-page per-${section.perPage}`}>
      {Array.from({ length: section.perPage }, (_, i) =>
        i < sheet.count ? (
          <div className="form-copy" key={i}>
            <div className="form-head">
              <h2>{section.title}</h2>
              {section.intro && <p>{section.intro}</p>}
            </div>
            {section.headerFields && <HeaderFields fields={section.headerFields} />}
            <ol
              className={`form-grid${stacked ? ' stacked' : ''}`}
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {section.questions.map((q, j) => (
                <li key={j}>
                  <span className="q">
                    <span className="num">{j + 1}.</span> {q}
                  </span>
                  <span className="line" />
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="form-copy empty" key={i} aria-hidden="true" />
        ),
      )}
    </div>
  );
}

export function ScoreboardPage({ sheet }: { sheet: SheetOf<'scoreboard'> }) {
  const { section } = sheet;
  const rowCount = section.rows.length + 2;
  const rowHeight = Math.min(16, Math.floor((200 / rowCount) * 10) / 10);
  return (
    <div className="scoreboard-page">
      <SheetTitle title={section.title} intro={section.intro} />
      <table className="score-table" style={{ '--row-h': `${rowHeight}mm` } as CSSProperties}>
        <thead>
          <tr>
            <th className="label-col">{section.rowLabel}</th>
            {section.columns.map((c, i) => (
              <th key={i}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {section.rows.map((r, i) => (
            <tr key={i}>
              <td className="label-col">{r}</td>
              {section.columns.map((_, j) => (
                <td key={j} />
              ))}
            </tr>
          ))}
          {section.totalLabel && (
            <tr className="total">
              <td className="label-col">{section.totalLabel}</td>
              {section.columns.map((_, j) => (
                <td key={j} />
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function TablePage({ sheet }: { sheet: SheetOf<'table'> }) {
  const { section } = sheet;
  return (
    <div className="table-page">
      <SheetTitle title={section.title} intro={section.intro} />
      <table className="info-table">
        <thead>
          <tr>
            {section.headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {section.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CertificatePage({ sheet, programName }: { sheet: SheetOf<'certificate'>; programName: string }) {
  const { section } = sheet;
  return (
    <div className="certificate-page">
      {Array.from({ length: 2 }, (_, i) =>
        i < sheet.count ? (
          <div className="certificate" key={i}>
            <div className="certificate-inner">
              <div className="certificate-stars" aria-hidden="true">
                {[0, 1, 2].map((k) => (
                  <svg key={k} viewBox="0 0 24 24" width="22" height="22">
                    <path
                      d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                  </svg>
                ))}
              </div>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
              <div className="certificate-sign">
                <span>תאריך: ____________</span>
                <span>חתימה: ____________</span>
              </div>
              <div className="certificate-foot">{programName}</div>
            </div>
          </div>
        ) : (
          <div className="certificate empty" key={i} aria-hidden="true" />
        ),
      )}
    </div>
  );
}
