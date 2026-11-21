import { Link } from 'react-router-dom';
import { Breadcrumbs, breadcrumbJsonLd } from '../components/Breadcrumbs';
import { useSeo } from '../lib/seo';

const faq = [
  {
    q: 'האם התוכניות באמת מוכנות להדפסה?',
    a: 'כן. כל תוכנית היא קובץ PDF בגודל A4, עם דף הוראות למארגן ועם כל הכרטיסים, הלוחות ודפי הניקוד. מדפיסים, גוזרים לאורך הקווים המקווקווים ומתחילים.',
  },
  {
    q: 'צריך מדפסת צבעונית?',
    a: 'לא. כל הקבצים מעוצבים בשחור-לבן ובקווים דקים, כדי לחסוך בדיו. הם נראים טוב גם במדפסת ביתית פשוטה.',
  },
  {
    q: 'אפשר לשחק בשבת ובחג?',
    a: 'כן, אם מכינים מראש. מדפיסים וגוזרים לפני שבת, ובשבת משתמשים בכרטיסים בלי לכתוב. בכל תוכנית שמתאימה לכך יש הסבר איך משחקים בלי כתיבה.',
  },
  {
    q: 'הטקסט בקובץ נחתך בהדפסה. מה לעשות?',
    a: 'בחלון ההדפסה בחרו גודל דף A4 והגדרת "התאמה לדף" או "גודל אמיתי" (100%). השוליים בקבצים כבר מותאמים למדפסת ביתית.',
  },
  {
    q: 'כמה זה עולה?',
    a: 'כל התוכניות שבאתר כרגע חינמיות. בעתיד יתווספו גם תוכניות מורחבות בתשלום סמלי.',
  },
  {
    q: 'אפשר להדפיס כמה עותקים?',
    a: 'בוודאי. בדפי התשובות ובלוחות אפשר להדפיס כמה עותקים שצריך. בדף ההוראות של כל תוכנית כתוב אילו עמודים כדאי לשכפל.',
  },
];

export function AboutPage() {
  useSeo({
    title: 'איך זה עובד',
    description:
      'בוחרים פעילות, מורידים PDF, מדפיסים ומשחקים. כל מה שצריך לדעת על תוכניות בכיס, ותשובות לשאלות נפוצות על ההדפסה.',
    path: 'about/',
    jsonLd: [
      breadcrumbJsonLd([{ label: 'איך זה עובד', to: '/about/' }]),
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  });

  return (
    <div className="container page narrow">
      <Breadcrumbs items={[{ label: 'איך זה עובד' }]} />
      <header className="page-head">
        <h1>איך זה עובד</h1>
        <p>
          תוכניות בכיס נולד מתוך רצון פשוט: שכל אחד יוכל להפעיל ערב משפחתי, מפגש חברים או יום גיבוש, בלי לבזבז
          שעות על הכנות.
        </p>
      </header>

      <section className="panel">
        <h2>שלושה צעדים וזהו</h2>
        <ol className="steps-list">
          <li>
            <strong>בוחרים פעילות.</strong> לפי סוג המפגש, מספר המשתתפים או הזמן שיש לכם. בכל עמוד תוכנית יש הסבר
            מלא ותצוגה מקדימה של כל הדפים.
          </li>
          <li>
            <strong>מורידים ומדפיסים.</strong> לוחצים על "הורדת PDF" או על "הדפסה". הקבצים בגודל A4, בשחור-לבן,
            עם מספרי עמודים.
          </li>
          <li>
            <strong>משחקים.</strong> בעמוד הראשון של כל קובץ יש הוראות למארגן: מה צריך, מה מכינים מראש ואיך
            משחקים, צעד אחר צעד.
          </li>
        </ol>
      </section>

      <section className="panel">
        <h2>שאלות נפוצות</h2>
        <div className="faq">
          {faq.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="hero-actions center">
        <Link to="/programs/" className="btn btn-primary btn-lg">
          בואו למצוא פעילות
        </Link>
      </div>
    </div>
  );
}
