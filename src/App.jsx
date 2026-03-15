import { Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import Layout from './components/layout/Layout';
import { FooterBar } from './components/layout/Footer';
import { useSiteConfig } from './context/SiteConfigContext';

// Pages - eager load (core)
import HomePage from './components/pages/HomePage';
import AboutPage from './components/pages/AboutPage';
import GigsPage from './components/pages/GigsPage';
import ContactPage from './components/pages/ContactPage';

// Pages - lazy load (optional, gated by features)
const GigDetailPage = lazy(() => import('./components/pages/GigDetailPage'));
const ArchivePage = lazy(() => import('./components/pages/ArchivePage'));
const SetlistsPage = lazy(() => import('./components/pages/SetlistsPage'));
const TimelinePage = lazy(() => import('./components/pages/TimelinePage'));
const MediaPage = lazy(() => import('./components/pages/MediaPage'));
const BlogPage = lazy(() => import('./components/pages/BlogPage'));
const BlogPostPage = lazy(() => import('./components/pages/BlogPostPage'));
const CommunityPage = lazy(() => import('./components/pages/CommunityPage'));
const MerchPage = lazy(() => import('./components/pages/MerchPage'));
const SongsPage = lazy(() => import('./components/pages/SongsPage'));
const StatsPage = lazy(() => import('./components/pages/StatsPage'));
const PrivacyPage = lazy(() => import('./components/pages/PrivacyPage'));
const CookiePage = lazy(() => import('./components/pages/CookiePage'));
const NotFoundPage = lazy(() => import('./components/pages/NotFoundPage'));

// Admin - lazy load
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const ContentManager = lazy(() => import('./components/admin/ContentManager'));
const GuestListManager = lazy(() => import('./components/admin/GuestListManager'));
const BlogEditor = lazy(() => import('./components/admin/BlogEditor'));
const MerchManager = lazy(() => import('./components/admin/MerchManager'));
const AgentPanel = lazy(() => import('./components/admin/AgentPanel'));

function Loading() {
  return (
    <div className="loading">
      <div className="loading-spinner" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/backstage');
  const { features } = useSiteConfig();

  return (
    <Suspense fallback={<Loading />}>
      <ScrollToTop />
      {!isAdmin && <FooterBar />}
      <Routes>
        <Route element={<Layout />}>
          {/* Core pages — always present */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/shows" element={<GigsPage />} />
          <Route path="/shows/:id" element={<GigDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/cookies" element={<CookiePage />} />

          {/* Optional pages — gated by feature flags */}
          {features.songs && <Route path="/songs" element={<SongsPage />} />}
          {features.archive && <Route path="/archive" element={<ArchivePage />} />}
          {features.setlists && <Route path="/setlists" element={<SetlistsPage />} />}
          {features.timeline && <Route path="/timeline" element={<TimelinePage />} />}
          {features.media && <Route path="/media" element={<MediaPage />} />}
          {features.stats && <Route path="/stats" element={<StatsPage />} />}
          {features.blog && <Route path="/blog" element={<BlogPage />} />}
          {features.blog && <Route path="/blog/:slug" element={<BlogPostPage />} />}
          {features.community && <Route path="/community" element={<CommunityPage />} />}
          {features.merch && <Route path="/merch" element={<MerchPage />} />}

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin (no public layout) */}
        <Route path="/backstage" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="content" element={<ContentManager />} />
          <Route path="guests" element={<GuestListManager />} />
          {features.blog && <Route path="blog/new" element={<BlogEditor />} />}
          {features.blog && <Route path="blog/:id/edit" element={<BlogEditor />} />}
          {features.merch && <Route path="merch" element={<MerchManager />} />}
          {features.aiAgents && <Route path="agents" element={<AgentPanel />} />}
        </Route>
      </Routes>
    </Suspense>
  );
}
