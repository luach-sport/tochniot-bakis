import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import { programs } from '../data/programs';
import {
  emptyAnswers,
  nextQuestion,
  questions,
  recommend,
  understand,
  type Answers,
  type Question,
  type Recommendation,
} from './engine';

export const OPEN_ASSISTANT_EVENT = 'open-assistant';
const SEEN_KEY = 'tb-assistant-seen';
const AUTO_OPEN_MS = 5000;

type Message =
  | { id: number; from: 'bot' | 'user'; text: string }
  | { id: number; from: 'bot'; recs: Recommendation[] };

let nextId = 1;
const bot = (text: string): Message => ({ id: nextId++, from: 'bot', text });
const user = (text: string): Message => ({ id: nextId++, from: 'user', text });

const ageText = { young: 'ילדים קטנים', kids: 'ילדים ונוער', adults: 'מבוגרים', mixed: 'כל הגילאים' } as const;
const durationText = { short: 'עד חצי שעה', medium: 'חצי שעה עד שעה', long: 'יותר משעה' } as const;
const vibeText = { funny: 'צחוק', social: 'היכרות ושיחה', competitive: 'תחרות', calm: 'אווירה רגועה' } as const;

/** משפט קצר שמסכם מה העוזר הבין */
const occasionText = {
  family: 'ערב משפחתי',
  friends: 'מפגש חברים',
  work: 'גיבוש בעבודה',
  'shabbat-holidays': 'שבת או חג',
  birthdays: 'יום הולדת',
  events: 'אירוע או מסיבה',
  kids: 'פעילות לילדים',
  trivia: 'ערב חידון',
} as const;

function summarize(a: Answers): string {
  const parts: string[] = [];
  if (a.occasion && a.occasion !== 'any') parts.push(occasionText[a.occasion]);
  if (typeof a.participants === 'number') parts.push(`${a.participants} משתתפים`);
  if (a.ages && a.ages !== 'any') parts.push(ageText[a.ages]);
  if (a.duration && a.duration !== 'any') parts.push(durationText[a.duration]);
  if (a.vibe && a.vibe !== 'any') parts.push(vibeText[a.vibe]);
  if (a.shabbat) parts.push('בלי כתיבה');
  return parts.join(' · ');
}

const storage = {
  get(key: string) {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      /* לא נורא */
    }
  },
};

const greeting = (): Message[] => [
  bot('היי! אני העוזר של תוכניות בכיס, ואמצא לכם את התוכנית המושלמת.'),
  bot('ספרו לי במשפט אחד בשביל מה אתם צריכים פעילות. למשל: "יום הולדת ל-15 ילדים בני 7" או "ערב צוות של שעה, משהו מצחיק". אפשר גם ללחוץ על אחת האפשרויות:'),
];

export function Assistant() {
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [messages, setMessages] = useState<Message[]>(greeting);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [question, setQuestion] = useState<Question | null>(questions[0]);
  const [intro, setIntro] = useState(true);
  const [done, setDone] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);

  const show = useCallback(() => {
    setOpen(true);
    setTeaser(false);
    storage.set(SEEN_KEY, '1');
  }, []);

  // קופץ אוטומטית פעם אחת בביקור, וניתן לפתיחה מכל כפתור באתר
  useEffect(() => {
    const onOpen = () => show();
    window.addEventListener(OPEN_ASSISTANT_EVENT, onOpen);
    let timer: number | undefined;
    if (!storage.get(SEEN_KEY)) {
      timer = window.setTimeout(() => {
        storage.set(SEEN_KEY, '1');
        if (window.matchMedia('(max-width: 560px)').matches) setTeaser(true);
        else setOpen(true);
      }, AUTO_OPEN_MS);
    }
    return () => {
      window.removeEventListener(OPEN_ASSISTANT_EVENT, onOpen);
      if (timer) window.clearTimeout(timer);
    };
  }, [show]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => inputRef.current?.focus(), 150);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  /** העוזר "מקליד" ואז עונה */
  const reply = (items: Message[], after?: () => void) => {
    setTyping(true);
    const t = window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, ...items]);
      after?.();
    }, 650);
    timers.current.push(t);
  };

  const advance = (a: Answers, opening: string[] = []) => {
    setAnswers(a);
    setIntro(false);
    const q = nextQuestion(a);
    if (q) {
      setQuestion(q);
      reply([...opening.map(bot), bot(q.text)]);
    } else {
      setQuestion(null);
      const recs = recommend(programs, a);
      reply([
        ...opening.map(bot),
        bot('מצוין! הנה 3 התוכניות שהכי מתאימות לכם:'),
        { id: nextId++, from: 'bot', recs },
        bot('כל תוכנית מוכנה להורדה ולהדפסה. רוצים לחפש משהו אחר? אפשר להתחיל מחדש.'),
      ]);
      setDone(true);
    }
  };

  const choose = (label: string, apply: (a: Answers) => Answers) => {
    if (typing) return;
    setMessages((m) => [...m, user(label)]);
    advance(apply(answers));
  };

  const skipToResults = () => {
    if (typing) return;
    setMessages((m) => [...m, user('תראו לי כבר המלצות')]);
    const a = { ...answers };
    for (const q of questions) {
      if (q.key === 'shabbat') continue;
      if (a[q.key] === undefined) (a as unknown as Record<string, unknown>)[q.key] = 'any';
    }
    advance(a);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing) return;
    setInput('');
    setMessages((m) => [...m, user(text)]);
    if (done) {
      // אחרי המלצות: טקסט חדש = חיפוש חדש
      const a = understand(text, emptyAnswers());
      setDone(false);
      advance(a, summarize(a) ? [`הבנתי: ${summarize(a)}.`] : []);
      return;
    }
    const before = summarize(answers);
    const a = understand(text, answers);
    // ענו על שאלה בטקסט שלא הבנתי: מתייחסים כ"לא משנה" כדי לא להיתקע
    if (!intro && question && a[question.key] === undefined) {
      if (question.key === 'shabbat') a.shabbat = /כן|שבת|חג/.test(text);
      else (a as unknown as Record<string, unknown>)[question.key] = 'any';
    }
    const after = summarize(a);
    const opening = after && after !== before ? [`הבנתי: ${after}.`] : intro ? ['נשמע כיף! כמה שאלות קצרות:'] : [];
    advance(a, opening);
  };

  const restart = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    setTyping(false);
    setMessages(greeting());
    setAnswers(emptyAnswers());
    setQuestion(questions[0]);
    setIntro(true);
    setDone(false);
  };

  const answeredCount = questions.filter((q) => answers[q.key] !== undefined).length;

  return (
    <>
      {!open && (
        <div className="assistant-launcher-wrap">
          {teaser && (
            <div className="assistant-teaser" role="status">
              <button type="button" className="teaser-close" aria-label="סגירה" onClick={() => setTeaser(false)}>
                <X size={14} />
              </button>
              <button type="button" className="teaser-body" onClick={show}>
                <strong>היי! מחפשים פעילות?</strong>
                <span>ספרו לי למה, ואמצא לכם את 3 התוכניות המושלמות.</span>
              </button>
            </div>
          )}
          <button type="button" className="assistant-launcher" onClick={show} aria-label="פתיחת העוזר לבחירת תוכנית">
            <Sparkles size={22} aria-hidden="true" />
            <span>עזרו לי לבחור</span>
          </button>
        </div>
      )}

      {open && (
        <section className="assistant" role="dialog" aria-modal="false" aria-label="העוזר לבחירת תוכנית">
          <header className="assistant-head">
            <span className="assistant-avatar" aria-hidden="true">
              <Sparkles size={20} />
            </span>
            <div className="assistant-title">
              <strong>העוזר לבחירת תוכנית</strong>
              <span>אמצא לכם תוכנית מושלמת בדקה</span>
            </div>
            <button type="button" className="assistant-icon-btn" onClick={restart} aria-label="התחלה מחדש" title="התחלה מחדש">
              <RotateCcw size={18} />
            </button>
            <button type="button" className="assistant-icon-btn" onClick={() => setOpen(false)} aria-label="סגירה">
              <X size={20} />
            </button>
          </header>

          <div className="assistant-messages" ref={listRef} aria-live="polite">
            {messages.map((m) =>
              'recs' in m ? (
                <div key={m.id} className="assistant-recs">
                  {m.recs.map((r, i) => (
                    <article key={r.program.id} className="assistant-rec">
                      <span className="rec-num">{i + 1}</span>
                      <div className="rec-body">
                        <Link to={`/program/${r.program.id}/`} className="rec-title" onClick={() => setOpen(false)}>
                          {r.program.name}
                        </Link>
                        <p>{r.program.shortDescription}</p>
                        {r.reasons.length > 0 && (
                          <ul className="rec-reasons">
                            {r.reasons.map((reason) => (
                              <li key={reason}>{reason}</li>
                            ))}
                          </ul>
                        )}
                        <Link to={`/program/${r.program.id}/`} className="rec-link" onClick={() => setOpen(false)}>
                          לתוכנית <ArrowLeft size={15} aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div key={m.id} className={`bubble ${m.from}`}>
                  {m.text}
                </div>
              ),
            )}
            {typing && (
              <div className="bubble bot typing" aria-label="העוזר כותב">
                <span />
                <span />
                <span />
              </div>
            )}
            {!typing && question && !done && (
              <div className="assistant-chips">
                {question.choices.map((c) => (
                  <button key={c.label} type="button" onClick={() => choose(c.label, c.apply)}>
                    {c.label}
                  </button>
                ))}
                {!intro && answeredCount >= 2 && (
                  <button type="button" className="skip" onClick={skipToResults}>
                    תראו לי כבר המלצות
                  </button>
                )}
              </div>
            )}
            {!typing && done && (
              <div className="assistant-chips">
                <button type="button" onClick={restart}>
                  חיפוש חדש
                </button>
                <Link to="/programs/" className="chip-btn" onClick={() => setOpen(false)}>
                  לכל הפעילויות
                </Link>
              </div>
            )}
          </div>

          <form className="assistant-input" onSubmit={submit}>
            <label htmlFor="assistant-text" className="sr-only">
              כתבו לעוזר
            </label>
            <input
              id="assistant-text"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={done ? 'אפשר לתאר מפגש אחר...' : 'כתבו כאן במילים שלכם...'}
              autoComplete="off"
            />
            <button type="submit" aria-label="שליחה" disabled={!input.trim() || typing}>
              <Send size={18} />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
