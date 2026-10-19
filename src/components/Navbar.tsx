import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Search,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  Award,
  BookOpen,
  ShieldAlert,
  ArrowRight,
  Languages,
} from 'lucide-react';
import { BnccCrest } from './BnccCrest';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenApply: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, onOpenApply }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, setLanguage, t, isBn } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [frameworksDropdownOpen, setFrameworksDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();

  // Close dropdown and mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setFrameworksDropdownOpen(false);
  }, [location.pathname]);

  // Clean up any pending timer on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setFrameworksDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // 300ms grace window prevents menu from disappearing during cursor transition
    timeoutRef.current = setTimeout(() => {
      setFrameworksDropdownOpen(false);
    }, 300);
  };

  const closeDropdown = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setFrameworksDropdownOpen(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setFrameworksDropdownOpen((prev) => !prev);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinkStyle = ({ isActive }: { isActive: boolean }) =>
    `text-xs xl:text-sm font-medium transition-colors whitespace-nowrap py-1 relative ${
      isActive
        ? 'text-red-600 dark:text-red-400 font-semibold'
        : 'text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400'
    }`;

  const isFrameworkActive = location.pathname.startsWith('/frameworks');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-2 lg:gap-4">
        {/* Left Side: Brand Wordmark & Navigation Links */}
        <div className="flex items-center min-w-0 gap-2.5 lg:gap-3 xl:gap-5 flex-1">
          {/* Zone 1: Brand Wordmark */}
          <Link
            to="/"
            className="brand-logo-link flex items-center gap-2 sm:gap-2.5 text-slate-900 dark:text-white transition-opacity hover:opacity-90 shrink-0"
          >
            <BnccCrest size="sm" />
            <span className="font-heading text-xs sm:text-sm lg:text-xs xl:text-sm 2xl:text-base font-bold uppercase tracking-wider leading-tight text-slate-900 dark:text-white whitespace-nowrap">
              {t('brand.name')}
            </span>
          </Link>

          {/* Zone 2: Navigation Links (Desktop & Laptop Screens) */}
          <nav className="hidden lg:flex items-center gap-1.5 lg:gap-2.5 xl:gap-4 py-1 min-w-0">
            <NavLink
              to="/"
              className={navLinkStyle}
            >
              {t('nav.home')}
            </NavLink>

            <NavLink to="/about" className={navLinkStyle}>
              {t('nav.about')}
            </NavLink>

            {/* Frameworks Dropdown */}
            <div
              className="relative py-1"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={toggleDropdown}
                className={`flex items-center gap-1 text-xs xl:text-sm font-medium transition-colors py-1 px-1.5 rounded-md ${
                  isFrameworkActive
                    ? 'text-red-600 dark:text-red-400 font-semibold bg-red-50/60 dark:bg-red-950/30'
                    : 'text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400'
                }`}
                aria-expanded={frameworksDropdownOpen}
              >
                <span>{t('nav.frameworks')}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    frameworksDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {frameworksDropdownOpen && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-1.5 z-50 w-[720px] max-w-[92vw]"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Invisible continuous hover bridge between trigger button and menu */}
                  <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent pointer-events-auto" />

                  <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-md animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="grid grid-cols-3 gap-5">
                      {/* Column 1: Benefits */}
                      <div className="space-y-2">
                        <Link
                          to="/frameworks/benefits"
                          onClick={closeDropdown}
                          className="flex items-center gap-2 pb-2 border-b border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider group"
                        >
                          <Award className="w-4 h-4 text-amber-600" />
                          <span className="group-hover:underline">{t('nav.benefits')}</span>
                        </Link>
                        <div className="space-y-1">
                          <Link
                            to="/frameworks/benefits/defense-quota"
                            onClick={closeDropdown}
                            className="block text-[11px] text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 px-2 py-1 rounded-md transition-colors"
                          >
                            {isBn ? 'সশস্ত্র বাহিনীতে কমিশন কোটা' : 'Armed Forces Quota'}
                          </Link>
                          <Link
                            to="/frameworks/benefits/leadership"
                            onClick={closeDropdown}
                            className="block text-[11px] text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 px-2 py-1 rounded-md transition-colors"
                          >
                            {isBn ? 'বাস্তব নেতৃত্ব ও কমান্ড' : 'Executive Leadership'}
                          </Link>
                          <Link
                            to="/frameworks/benefits/national-camps"
                            onClick={closeDropdown}
                            className="block text-[11px] text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 px-2 py-1 rounded-md transition-colors"
                          >
                            {isBn ? 'জাতীয় ও বৈশ্বিক ইয়ুথ ক্যাম্প' : 'National & Global Camps'}
                          </Link>
                          <Link
                            to="/frameworks/benefits/physical-tactical"
                            onClick={closeDropdown}
                            className="block text-[11px] text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 px-2 py-1 rounded-md transition-colors"
                          >
                            {isBn ? 'শারীরিক সক্ষমতা ও সারভাইভাল' : 'Physical & Survival'}
                          </Link>
                          <Link
                            to="/frameworks/benefits/academic-prestige"
                            onClick={closeDropdown}
                            className="block text-[11px] text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 px-2 py-1 rounded-md transition-colors"
                          >
                            {isBn ? 'একাডেমিক ও ক্যাম্পাস সম্মান' : 'Academic Distinction'}
                          </Link>
                          <Link
                            to="/frameworks/benefits/humanitarian-service"
                            onClick={closeDropdown}
                            className="block text-[11px] text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 px-2 py-1 rounded-md transition-colors"
                          >
                            {isBn ? 'মানবিক সহায়তা ও দেশসেবা' : 'Humanitarian Relief'}
                          </Link>
                        </div>
                      </div>

                      {/* Column 2: Guidelines */}
                      <div className="space-y-2">
                        <Link
                          to="/frameworks/guidelines"
                          onClick={closeDropdown}
                          className="flex items-center gap-2 pb-2 border-b border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider group"
                        >
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                          <span className="group-hover:underline">{t('nav.guidelines')}</span>
                        </Link>
                        <div className="space-y-1">
                          <Link
                            to="/frameworks/guidelines/drill-syllabus"
                            onClick={closeDropdown}
                            className="block text-[11px] text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-2 py-1 rounded-md transition-colors"
                          >
                            {isBn ? 'ড্রিল ও কুচকাওয়াজ সিলেবাস' : 'Parade & Drill Syllabus'}
                          </Link>
                          <Link
                            to="/frameworks/guidelines/rank-ladder"
                            onClick={closeDropdown}
                            className="block text-[11px] text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-2 py-1 rounded-md transition-colors"
                          >
                            {isBn ? 'পদমর্যাদা ও পদোন্নতি কাঠামো' : 'Rank Hierarchy Matrix'}
                          </Link>
                          <Link
                            to="/frameworks/guidelines/uniform-code"
                            onClick={closeDropdown}
                            className="block text-[11px] text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-2 py-1 rounded-md transition-colors"
                          >
                            {isBn ? 'ইউনিফর্ম ও টার্নআউট বিধি' : 'Uniform & Turnout Code'}
                          </Link>
                          <Link
                            to="/frameworks/guidelines/camp-protocols"
                            onClick={closeDropdown}
                            className="block text-[11px] text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-2 py-1 rounded-md transition-colors"
                          >
                            {isBn ? 'ফিল্ড ক্রাফট ও ক্যাম্পিং প্রটোকল' : 'Field Craft & Camps'}
                          </Link>
                        </div>
                      </div>

                      {/* Column 3: Policies */}
                      <div className="space-y-2">
                        <Link
                          to="/frameworks/policies"
                          onClick={closeDropdown}
                          className="flex items-center gap-2 pb-2 border-b border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 font-bold text-xs uppercase tracking-wider group"
                        >
                          <ShieldAlert className="w-4 h-4 text-red-600" />
                          <span className="group-hover:underline">{t('nav.policies')}</span>
                        </Link>
                        <div className="space-y-1">
                          <Link
                            to="/frameworks/policies/honor-code"
                            onClick={closeDropdown}
                            className="block text-[11px] text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-1 rounded-md transition-colors"
                          >
                            {isBn ? 'সম্মান কোড ও সততার মানদণ্ড' : 'Honor Code & Integrity'}
                          </Link>
                          <Link
                            to="/frameworks/policies/attendance-policy"
                            onClick={closeDropdown}
                            className="block text-[11px] text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-1 rounded-md transition-colors"
                          >
                            {isBn ? '৮০% প্যারেড উপস্থিতি নীতিমালা' : '80% Attendance Policy'}
                          </Link>
                          <Link
                            to="/frameworks/policies/anti-ragging"
                            onClick={closeDropdown}
                            className="block text-[11px] text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-1 rounded-md transition-colors"
                          >
                            {isBn ? 'র‍্যাগিং বিরোধী জিরো-টলারেন্স' : 'Anti-Ragging Directives'}
                          </Link>
                          <Link
                            to="/frameworks/policies/chain-of-command"
                            onClick={closeDropdown}
                            className="block text-[11px] text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-1 rounded-md transition-colors"
                          >
                            {isBn ? 'চেইন অব কমান্ড ও প্রটোকল' : 'Chain of Command'}
                          </Link>
                          <Link
                            to="/frameworks/policies/social-media"
                            onClick={closeDropdown}
                            className="block text-[11px] text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-1 rounded-md transition-colors"
                          >
                            {isBn ? 'সামাজিক যোগাযোগ মাধ্যম নির্দেশিকা' : 'Social Media Directives'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/events" className={navLinkStyle}>
              {t('nav.events')}
            </NavLink>

            <NavLink to="/blog" className={navLinkStyle}>
              {isBn ? 'ব্লগ ও গল্প সম্ভার' : 'Blog & Stories'}
            </NavLink>

            <NavLink to="/dashboard" className={navLinkStyle}>
              {t('nav.cadetPortal')}
            </NavLink>
          </nav>
        </div>

        {/* Zone 3: Primary Actions (Search, Language Toggle, Dark Mode, Join CTA) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto z-10">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="shrink-0 flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
            title={`${t('nav.search')} (${t('nav.searchShortcut')})`}
            aria-label={t('nav.search')}
          >
            <Search className="w-4 h-4 shrink-0" />
            <span className="hidden xl:inline">{t('nav.search')}</span>
            <kbd className="hidden 2xl:inline font-mono text-[10px] text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1">
              {t('nav.searchShortcut')}
            </kbd>
          </button>

          {/* Bilingual Language Switcher (EN / বাং) */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="group relative flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-red-400 dark:hover:border-red-500 transition-all shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 active:scale-95"
            aria-label={isBn ? 'Switch to English' : 'বাংলায় রূপান্তর করুন'}
            title={isBn ? 'Switch to English' : 'বাংলায় রূপান্তর করুন'}
          >
            <Languages className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
            <div className="flex items-center text-[11px] font-mono uppercase tracking-wider">
              <span className={!isBn ? 'text-red-600 dark:text-red-400 font-extrabold' : 'text-slate-400 font-normal'}>
                EN
              </span>
              <span className="text-slate-300 dark:text-slate-700 mx-0.5">/</span>
              <span className={isBn ? 'text-red-600 dark:text-red-400 font-extrabold' : 'text-slate-400 font-normal'}>
                বাং
              </span>
            </div>
          </button>

          {/* Persistent Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="group relative flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 active:scale-95"
            aria-label={theme === 'dark' ? t('nav.themeToggleLight') : t('nav.themeToggleDark')}
            title={theme === 'dark' ? t('nav.themeToggleLight') : t('nav.themeToggleDark')}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 group-hover:-rotate-12 transition-transform duration-300" />
            )}
            <span className="sr-only">Toggle theme</span>
          </button>

          {/* Join CTA (Prominent Military Red Button) */}
          <Link
            to="/how-to-join"
            className="hidden xl:inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:shadow active:scale-95 whitespace-nowrap"
          >
            <span>{t('nav.howToJoin')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('nav.about')}
            </Link>
            <div className="py-2 border-y border-slate-200/60 dark:border-slate-800/80 my-1">
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 font-mono">
                {t('nav.frameworksDirectives')}
              </span>
              <div className="mt-2 pl-2 space-y-3">
                {/* Benefits */}
                <div>
                  <Link
                    to="/frameworks/benefits"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    ★ {t('nav.benefits')}
                  </Link>
                  <div className="pl-4 space-y-0.5 mt-0.5">
                    <Link
                      to="/frameworks/benefits/defense-quota"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[11px] text-slate-600 dark:text-slate-400 hover:text-amber-600 px-2 py-0.5"
                    >
                      • {isBn ? 'সশস্ত্র বাহিনীতে কমিশন কোটা' : 'Armed Forces Quota'}
                    </Link>
                    <Link
                      to="/frameworks/benefits/leadership"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[11px] text-slate-600 dark:text-slate-400 hover:text-amber-600 px-2 py-0.5"
                    >
                      • {isBn ? 'বাস্তব নেতৃত্ব ও কমান্ড' : 'Executive Leadership'}
                    </Link>
                    <Link
                      to="/frameworks/benefits/national-camps"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[11px] text-slate-600 dark:text-slate-400 hover:text-amber-600 px-2 py-0.5"
                    >
                      • {isBn ? 'জাতীয় ও বৈশ্বিক ইয়ুথ ক্যাম্প' : 'Youth Camps (CATC & YEP)'}
                    </Link>
                    <Link
                      to="/frameworks/benefits/physical-tactical"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[11px] text-slate-600 dark:text-slate-400 hover:text-amber-600 px-2 py-0.5"
                    >
                      • {isBn ? 'শারীরিক সক্ষমতা ও সারভাইভাল' : 'Physical & Survival'}
                    </Link>
                  </div>
                </div>

                {/* Guidelines */}
                <div>
                  <Link
                    to="/frameworks/guidelines"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    ★ {t('nav.guidelines')}
                  </Link>
                  <div className="pl-4 space-y-0.5 mt-0.5">
                    <Link
                      to="/frameworks/guidelines/drill-syllabus"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[11px] text-slate-600 dark:text-slate-400 hover:text-emerald-600 px-2 py-0.5"
                    >
                      • {isBn ? 'ড্রিল ও কুচকাওয়াজ সিলেবাস' : 'Parade & Drill Syllabus'}
                    </Link>
                    <Link
                      to="/frameworks/guidelines/rank-ladder"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[11px] text-slate-600 dark:text-slate-400 hover:text-emerald-600 px-2 py-0.5"
                    >
                      • {isBn ? 'পদমর্যাদা ও পদোন্নতি কাঠামো' : 'Rank Hierarchy Ladder'}
                    </Link>
                    <Link
                      to="/frameworks/guidelines/uniform-code"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[11px] text-slate-600 dark:text-slate-400 hover:text-emerald-600 px-2 py-0.5"
                    >
                      • {isBn ? 'ইউনিফর্ম ও টার্নআউট বিধিমালা' : 'Uniform & Turnout Regulations'}
                    </Link>
                    <Link
                      to="/frameworks/guidelines/camp-protocols"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[11px] text-slate-600 dark:text-slate-400 hover:text-emerald-600 px-2 py-0.5"
                    >
                      • {isBn ? 'ফিল্ড ক্রাফট ও ক্যাম্পিং প্রটোকল' : 'Field Craft & Camp Protocols'}
                    </Link>
                  </div>
                </div>

                {/* Policies */}
                <div>
                  <Link
                    to="/frameworks/policies"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-1 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    ★ {t('nav.policies')}
                  </Link>
                  <div className="pl-4 space-y-0.5 mt-0.5">
                    <Link
                      to="/frameworks/policies/honor-code"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[11px] text-slate-600 dark:text-slate-400 hover:text-red-600 px-2 py-0.5"
                    >
                      • {isBn ? 'সম্মান কোড ও সততার মানদণ্ড' : 'Honor Code & Integrity'}
                    </Link>
                    <Link
                      to="/frameworks/policies/attendance-policy"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[11px] text-slate-600 dark:text-slate-400 hover:text-red-600 px-2 py-0.5"
                    >
                      • {isBn ? '৮০% প্যারেড উপস্থিতি নীতিমালা' : '80% Attendance Policy'}
                    </Link>
                    <Link
                      to="/frameworks/policies/anti-ragging"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[11px] text-slate-600 dark:text-slate-400 hover:text-red-600 px-2 py-0.5"
                    >
                      • {isBn ? 'র‍্যাগিং বিরোধী জিরো-টলারেন্স' : 'Anti-Ragging Directives'}
                    </Link>
                    <Link
                      to="/frameworks/policies/chain-of-command"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[11px] text-slate-600 dark:text-slate-400 hover:text-red-600 px-2 py-0.5"
                    >
                      • {isBn ? 'চেইন অব কমান্ড ও প্রটোকল' : 'Chain of Command'}
                    </Link>
                    <Link
                      to="/frameworks/policies/social-media"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[11px] text-slate-600 dark:text-slate-400 hover:text-red-600 px-2 py-0.5"
                    >
                      • {isBn ? 'সামাজিক যোগাযোগ মাধ্যম নির্দেশিকা' : 'Social Media Directives'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('nav.events')}
            </Link>
            <Link
              to="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isBn ? 'ব্লগ ও গল্প সম্ভার' : 'Blog & Stories'}
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('nav.cadetPortal')}
            </Link>
          </div>

          {/* Mobile Language Selector */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {isBn ? 'ভাষা (Language)' : 'Language'}
              </span>
            </div>
            <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded ${
                  !isBn
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`px-2.5 py-1 text-xs font-bold rounded ${
                  isBn
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>

          {/* Mobile Theme Appearance Toggle */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {isBn ? 'থিম কালার' : 'Appearance'}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-mono font-bold uppercase text-slate-900 dark:text-white shadow-xs hover:border-red-500 transition-colors"
            >
              <span>{theme === 'dark' ? (isBn ? 'ডার্ক' : 'Dark') : (isBn ? 'লাইট' : 'Light')}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <Link
              to="/how-to-join"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-700 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white shadow"
            >
              <span>{t('common.clickToJoin')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
