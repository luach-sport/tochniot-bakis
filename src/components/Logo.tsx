import siteConfig from '../../site.config.json';

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect x="13" y="4" width="22" height="28" rx="3" fill="#fff" stroke="#1f7ac4" strokeWidth="2.5" />
      <path d="M18 12h12M18 17h12M18 22h8" stroke="#f28c28" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M7 20h34v14a10 10 0 0 1-10 10H17A10 10 0 0 1 7 34z" fill="#1f7ac4" />
      <path d="M13 27h22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo-text">
        <span className="logo-name">{siteConfig.siteName}</span>
        <span className="logo-slogan">{siteConfig.slogan}</span>
      </span>
    </span>
  );
}
