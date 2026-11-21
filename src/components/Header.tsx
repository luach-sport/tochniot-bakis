import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { Logo } from './Logo';

const nav = [
  { to: '/', label: 'בית', end: true },
  { to: '/programs/', label: 'כל הפעילויות', end: false },
  { to: '/categories/', label: 'קטגוריות', end: false },
  { to: '/about/', label: 'איך זה עובד', end: false },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    navigate(query ? `/programs/?q=${encodeURIComponent(query)}` : '/programs/');
    setQ('');
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="header-logo" aria-label="תוכניות בכיס - לעמוד הבית">
          <Logo />
        </Link>

        <nav className={`main-nav${open ? ' open' : ''}`} aria-label="ניווט ראשי">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <form className="header-search" role="search" onSubmit={submit}>
          <label htmlFor="header-q" className="sr-only">
            חיפוש פעילות
          </label>
          <input
            id="header-q"
            type="search"
            placeholder="חיפוש פעילות..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" aria-label="חיפוש">
            <Search size={18} />
          </button>
        </form>

        <button
          type="button"
          className="menu-toggle"
          aria-label={open ? 'סגירת תפריט' : 'פתיחת תפריט'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
