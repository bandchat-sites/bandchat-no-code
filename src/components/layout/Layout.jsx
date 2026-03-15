import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import TriviaPopup from '../trivia/TriviaPopup';
import { useSiteConfig } from '../../context/SiteConfigContext';

export default function Layout() {
  const config = useSiteConfig();

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      <main className="main" id="main-content">
        <Outlet />
      </main>
      <Footer />
      {config.features.trivia && <TriviaPopup />}
    </>
  );
}
