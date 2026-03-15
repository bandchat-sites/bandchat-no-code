import { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSiteConfig } from '../../context/SiteConfigContext';

function changeFontSize(delta) {
  const root = document.documentElement;
  const current = parseFloat(getComputedStyle(root).fontSize);
  const next = Math.min(Math.max(current + delta, 12), 24);
  root.style.fontSize = next + 'px';
}

// Core pages always shown
const CORE_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/shows', label: 'Shows' },
  { path: '/about', label: 'About' },
];

// Optional pages gated by feature flags
const OPTIONAL_LINKS = [
  { path: '/songs', label: 'Songs', feature: 'songs' },
  { path: '/archive', label: 'Archive', feature: 'archive' },
  { path: '/timeline', label: 'Timeline', feature: 'timeline' },
  { path: '/media', label: 'Media', feature: 'media' },
  { path: '/stats', label: 'Stats', feature: 'stats' },
  { path: '/blog', label: 'Blog', feature: 'blog' },
];

const CONTACT_LINK = { path: '/contact', label: 'Contact' };

export default function Header() {
  const config = useSiteConfig();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const navLinks = useMemo(() => {
    const optional = OPTIONAL_LINKS.filter(l => config.features[l.feature]);
    return [...CORE_LINKS, ...optional, CONTACT_LINK];
  }, [config.features]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const headerClass = `header ${
    scrolled || menuOpen || !isHome ? 'header--solid' : 'header--transparent'
  }`;

  return (
    <>
      <header className={headerClass}>
        <div className="header__inner">
          <nav className="nav">
            {navLinks.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `nav__link ${isActive ? 'nav__link--active' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="header__font-size">
            <button className="header__font-btn" onClick={() => changeFontSize(-1)} aria-label="Decrease font size">A-</button>
            <button className="header__font-btn" onClick={() => changeFontSize(1)} aria-label="Increase font size">A+</button>
          </div>

          <button
            className={`header__menu-btn ${menuOpen ? 'header__menu-btn--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <nav className={`mobile-nav ${menuOpen ? 'mobile-nav--open' : ''}`}>
        {navLinks.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `mobile-nav__link ${isActive ? 'mobile-nav__link--active' : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
