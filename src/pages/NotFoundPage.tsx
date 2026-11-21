import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo';

export function NotFoundPage() {
  useSeo({
    title: 'העמוד לא נמצא',
    description: 'העמוד שחיפשתם לא קיים. אפשר לחזור לעמוד הבית או לחפש פעילות.',
    path: '404.html',
    noindex: true,
  });
  return (
    <div className="container page not-found">
      <h1>אופס, העמוד הזה לא נמצא</h1>
      <p>ייתכן שהקישור השתנה. אבל יש לנו הרבה פעילויות שמחכות לכם.</p>
      <div className="hero-actions">
        <Link to="/" className="btn btn-primary btn-lg">
          לעמוד הבית
        </Link>
        <Link to="/programs/" className="btn btn-ghost btn-lg">
          לכל הפעילויות
        </Link>
      </div>
    </div>
  );
}
