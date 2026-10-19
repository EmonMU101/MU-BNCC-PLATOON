import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { ApplyModal } from './components/ApplyModal';
import { BackToTop } from './components/BackToTop';
import { HomePage } from './pages/HomePage';
import { HowToJoinPage } from './pages/HowToJoinPage';
import { FrameworksPage } from './pages/FrameworksPage';
import { EventsPage } from './pages/EventsPage';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { CadetDashboardPage } from './pages/CadetDashboardPage';
import { GalleryPage } from './pages/GalleryPage';
import { PublicCadetProfilePage } from './pages/PublicCadetProfilePage';

import { logPageView } from './services/analyticsService';

// Scroll to top and log page analytics automatically when location changes
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    logPageView(pathname);
  }, [pathname]);

  return null;
};

const AppContent: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <ScrollToTop />
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenApply={() => setIsApplyOpen(true)}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage onOpenApply={() => setIsApplyOpen(true)} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/how-to-join"
            element={<HowToJoinPage onOpenApply={() => setIsApplyOpen(true)} />}
          />
          <Route
            path="/frameworks"
            element={<FrameworksPage initialTab="benefits" onOpenApply={() => setIsApplyOpen(true)} />}
          />
          <Route
            path="/frameworks/:tab"
            element={<FrameworksPage onOpenApply={() => setIsApplyOpen(true)} />}
          />
          <Route
            path="/frameworks/:tab/:subId"
            element={<FrameworksPage onOpenApply={() => setIsApplyOpen(true)} />}
          />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/blog" element={<GalleryPage />} />
          <Route path="/stories" element={<GalleryPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/dashboard" element={<CadetDashboardPage />} />
          <Route path="/cadet-portal" element={<CadetDashboardPage />} />
          <Route path="/cadet/:cadetId" element={<PublicCadetProfilePage />} />
          <Route path="/cadets/:cadetId" element={<PublicCadetProfilePage />} />
          {/* Catch-all fallback */}
          <Route path="*" element={<HomePage onOpenApply={() => setIsApplyOpen(true)} />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Search Dialog */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Global Application Dossier Form */}
      <ApplyModal isOpen={isApplyOpen} onClose={() => setIsApplyOpen(false)} />

      {/* Floating Back to Top Button */}
      <BackToTop />
    </div>
  );
};

export default function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <ThemeProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ThemeProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}
