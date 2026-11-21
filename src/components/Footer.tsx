import { Link } from 'react-router-dom';
import siteConfig from '../../site.config.json';
import { categories } from '../data/categories';
import { LogoMark } from './Logo';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <LogoMark size={34} />
            <strong>{siteConfig.siteName}</strong>
          </div>
          <p>{siteConfig.slogan}</p>
          <p className="muted">תוכניות ופעילויות מוכנות להדפסה, לכל מפגש ולכל גיל.</p>
        </div>
        <div>
          <h2>קטגוריות</h2>
          <ul>
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/category/${c.id}/`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>האתר</h2>
          <ul>
            <li>
              <Link to="/programs/">כל הפעילויות</Link>
            </li>
            <li>
              <Link to="/categories/">כל הקטגוריות</Link>
            </li>
            <li>
              <Link to="/about/">איך זה עובד</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        © {new Date().getFullYear()} {siteConfig.siteName}. כל הזכויות שמורות.
      </div>
    </footer>
  );
}
