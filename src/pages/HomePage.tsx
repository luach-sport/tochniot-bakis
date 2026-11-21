import { Link } from 'react-router-dom';
import { ArrowLeft, Download, MousePointerClick, Printer, Sparkles } from 'lucide-react';
import siteConfig from '../../site.config.json';
import { categories } from '../data/categories';
import { programs } from '../data/programs';
import { CategoryCard } from '../components/CategoryCard';
import { ProgramGrid } from '../components/ProgramCard';
import { absoluteUrl, useSeo } from '../lib/seo';

const popular = [...programs].sort((a, b) => b.popularity - a.popularity).slice(0, 6);
const recent = programs
  .map((p, i) => ({ p, i }))
  .sort((a, b) => b.p.addedAt.localeCompare(a.p.addedAt) || b.i - a.i)
  .slice(0, 3)
  .map(({ p }) => p);

export function HomePage() {
  useSeo({
    title: siteConfig.siteName,
    description: siteConfig.description,
    path: '',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteConfig.siteName,
        url: absoluteUrl(''),
        inLanguage: 'he',
        description: siteConfig.description,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${absoluteUrl('programs/')}?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteConfig.siteName,
        url: absoluteUrl(''),
        logo: absoluteUrl('favicon.svg'),
        slogan: siteConfig.slogan,
      },
    ],
  });

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="hero-kicker">
              <Sparkles size={16} aria-hidden="true" />
              {siteConfig.slogan}
            </span>
            <h1>מחפשים פעילות שתעשה לכם את היום?</h1>
            <p>כל מה שצריך בשביל משחק מוצלח, כבר מוכן על הדף. בוחרים, מדפיסים ונהנים.</p>
            <div className="hero-actions">
              <Link to="/programs/" className="btn btn-primary btn-lg">
                בואו למצוא פעילות
                <ArrowLeft size={20} aria-hidden="true" />
              </Link>
              <Link to="/about/" className="btn btn-ghost btn-lg">
                איך זה עובד?
              </Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <img src={`${import.meta.env.BASE_URL}images/hero.svg`} alt="" width={520} height={420} />
          </div>
        </div>
      </section>

      <section className="steps container" aria-label="איך זה עובד">
        <div className="step">
          <span className="step-icon">
            <MousePointerClick size={26} aria-hidden="true" />
          </span>
          <div>
            <h2>בוחרים</h2>
            <p>מוצאים פעילות לפי קטגוריה, מספר משתתפים או זמן.</p>
          </div>
        </div>
        <div className="step">
          <span className="step-icon">
            <Download size={26} aria-hidden="true" />
          </span>
          <div>
            <h2>מורידים ומדפיסים</h2>
            <p>קובץ PDF מסודר, בשחור-לבן, מוכן למדפסת הביתית.</p>
          </div>
        </div>
        <div className="step">
          <span className="step-icon">
            <Printer size={26} aria-hidden="true" />
          </span>
          <div>
            <h2>משחקים ונהנים</h2>
            <p>הוראות ברורות למארגן, בלי הכנות מסובכות.</p>
          </div>
        </div>
      </section>

      <section className="section container" id="categories">
        <div className="section-head">
          <h2>לאיזה מפגש אתם מתכוננים?</h2>
          <Link to="/categories/" className="section-link">
            כל הקטגוריות <ArrowLeft size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>הפעילויות הפופולריות ביותר</h2>
          <Link to="/programs/" className="section-link">
            לכל הפעילויות <ArrowLeft size={16} aria-hidden="true" />
          </Link>
        </div>
        <ProgramGrid programs={popular} />
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>התווספו לאחרונה</h2>
        </div>
        <ProgramGrid programs={recent} />
      </section>

      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <h2>עוד חמש דקות יש לכם פעילות מוכנה</h2>
            <p>כל התוכניות כוללות הוראות למארגן, כרטיסים מוכנים לגזירה ודפי ניקוד.</p>
          </div>
          <Link to="/programs/" className="btn btn-accent btn-lg">
            לבחירת פעילות
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
