import { Link } from 'react-router-dom';
import { useSiteConfig } from '../../context/SiteConfigContext';

const SOCIAL_ICONS = {
  instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>,
  facebook: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>,
  youtube: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
};

// Footer nav links gated by features
const NAV_LINKS = [
  { path: '/shows', label: 'Upcoming Shows' },
  { path: '/songs', label: 'Songs', feature: 'songs' },
  { path: '/archive', label: 'Gig Archive', feature: 'archive' },
  { path: '/media', label: 'Media', feature: 'media' },
  { path: '/blog', label: 'Blog', feature: 'blog' },
];

const BAND_LINKS = [
  { path: '/about', label: 'About Us' },
  { path: '/timeline', label: 'Our Story', feature: 'timeline' },
  { path: '/stats', label: 'Stats', feature: 'stats' },
  { path: '/contact', label: 'Book Us' },
  { path: '/merch', label: 'Merch', feature: 'merch' },
];

export default function Footer() {
  const config = useSiteConfig();
  const features = config.features;

  const navLinks = NAV_LINKS.filter(l => !l.feature || features[l.feature]);
  const bandLinks = BAND_LINKS.filter(l => !l.feature || features[l.feature]);

  // Split band name for accent coloring on first word
  const nameParts = config.band.name.split(' ');
  const firstName = nameParts[0];
  const restName = nameParts.slice(1).join(' ');

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <h3>
              <span style={{ color: 'var(--color-red)' }}>{firstName}</span>{restName ? ` ${restName}` : ''}
            </h3>
            <p>{config.band.description}</p>
            <div className="footer__socials" style={{ marginTop: 'var(--space-lg)' }}>
              {(config.social || []).map(s => (
                <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" className="footer__social" aria-label={s.label}>
                  {SOCIAL_ICONS[s.platform] || s.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="footer__heading">Navigate</h4>
            <div className="footer__links">
              {navLinks.map(l => (
                <Link key={l.path} to={l.path} className="footer__link">{l.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="footer__heading">Band</h4>
            <div className="footer__links">
              {bandLinks.map(l => (
                <Link key={l.path} to={l.path} className="footer__link">{l.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function FooterBar() {
  const config = useSiteConfig();
  const year = new Date().getFullYear();

  return (
    <div className="footer-bar">
      <div className="footer-bar__inner">
        <img src={config.images.logo} alt={config.band.name} className="footer-bar__logo" />
        <span className="footer-bar__divider" />
        <Link to="/privacy" className="footer-bar__link">Privacy Policy</Link>
        <span className="footer-bar__divider" />
        <Link to="/cookies" className="footer-bar__link">Cookie Policy</Link>
        <span className="footer-bar__divider hide-mobile" />
        <span className="footer-bar__text hide-mobile">Feedback</span>
        <span className="footer-bar__divider" />
        <span className="footer-bar__text">&copy; {year} {config.band.name}</span>
        <span className="footer-bar__divider hide-mobile" />
        <span className="footer-bar__text hide-mobile">All rights reserved</span>
        <span className="footer-bar__divider hide-mobile" />
        <span className="footer-bar__version hide-mobile">v{__APP_VERSION__}</span>
      </div>
    </div>
  );
}
