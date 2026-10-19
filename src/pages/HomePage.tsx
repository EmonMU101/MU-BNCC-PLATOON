import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  BookOpen,
  Calendar,
  Award,
  ShieldAlert,
  UserCheck,
  ChevronRight,
  Flame,
  CheckCircle2,
  Target,
  Compass,
  Clock,
  MapPin,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { BnccCrest } from '../components/BnccCrest';
import { PlatoonHighlightsSection } from '../components/PlatoonHighlightsSection';
import { UrgentNoticeBar } from '../components/UrgentNoticeBar';
import { Rotating3DCarousel } from '../components/Rotating3DCarousel';
import { CadetShortStoriesSection } from '../components/CadetShortStoriesSection';
import { CadetOfTheSemester } from '../components/CadetOfTheMonth';
import { QUICK_ACCESS_HUB, UPCOMING_EVENTS, EventItem } from '../data/siteData';
import { subscribeEvents } from '../services/portalService';
import { useTranslation } from '../hooks/useTranslation';
import { SEOHead } from '../components/SEOHead';

interface HomePageProps {
  onOpenApply: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenApply }) => {
  const { t, isBn } = useTranslation();
  const [events, setEvents] = useState<EventItem[]>(UPCOMING_EVENTS);

  // Subscribe to live Firestore events so admin updates appear instantly on homepage
  useEffect(() => {
    const unsubscribe = subscribeEvents((liveEvents) => {
      if (liveEvents && liveEvents.length > 0) {
        setEvents(liveEvents);
      }
    });

    return () => unsubscribe();
  }, []);

  const iconMap: Record<string, React.ElementType> = {
    UserCheck,
    Award,
    ShieldAlert,
    BookOpen,
    Calendar,
  };

  return (
    <div className="space-y-16 pb-20">
      <SEOHead
        title="MU BNCC Platoon | Metropolitan University Cadet Corps"
        titleBn="এমইউ বিএনসিসি প্লাটুন | মেট্রোপলিটন ইউনিভার্সিটি ক্যাডেট কোর"
        description="Official web portal of Metropolitan University Bangladesh National Cadet Corps (MU BNCC) Platoon under Moinamati Regiment, 7 BNCC Battalion. Grooming future leaders through academic excellence, discipline, and voluntary service."
        descriptionBn="মেট্রোপলিটন ইউনিভার্সিটি বাংলাদেশ ন্যাশনাল ক্যাডেট কোর (এমইউ বিএনসিসি) প্লাটুনের অফিসিয়াল ওয়েব পোর্টাল। ময়নামতি রেজিমেন্ট ও ৭ বিএনসিসি ব্যাটালিয়নের অধীনে শৃঙ্খলা, জ্ঞান ও স্বেচ্ছাসেবার মাধ্যমে ভবিষ্যৎ নেতৃত্ব গঠন।"
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Metropolitan University BNCC Platoon',
          alternateName: 'MU BNCC',
          url: 'https://mubncc.metrouni.edu.bd',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://mubncc.metrouni.edu.bd/events?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        }}
      />

      {/* ======================================================== */}
      {/* 1. HERO SECTION: PLATOON IDENTITY & URGENT BROADCAST */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950">
        {/* Subtle military grid background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            {/* Tag / Badge: ESTD. 4th May 2025 */}
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-4 py-1.5 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
              <span className="text-xs font-mono font-bold tracking-widest text-slate-800 dark:text-slate-200 uppercase">
                {t('brand.estd')}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 tracking-wider uppercase">
                {t('brand.officialPortal')}
              </span>
            </div>

            {/* Platoon Crest Centerpiece */}
            <div className="pt-2">
              <BnccCrest size="xl" />
            </div>

            {/* Catchphrase */}
            <div className="space-y-3">
              <h2 className="font-heading text-lg sm:text-xl font-bold tracking-widest text-red-600 dark:text-red-500 uppercase">
                {t('hero.groomingLeaders')}
              </h2>

              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-slate-950 dark:text-white text-balance leading-none">
                {t('hero.universityTitle')} <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-amber-600 to-red-700 dark:from-red-400 dark:via-amber-300 dark:to-red-500">
                  {t('hero.platoonTitle')}
                </span>
              </h1>
            </div>

            {/* Mission Statement */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal text-balance">
              {t('hero.mission')}
            </p>

            {/* Primary Action Triggers */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
              <Link
                to="/how-to-join"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white px-8 py-3.5 text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-red-700/25 transition-all active:scale-95"
              >
                <span>{t('common.clickToJoin')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/frameworks/guidelines"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-6 py-3.5 text-sm font-semibold transition-colors"
              >
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span>{t('hero.cadetGuidelines')}</span>
              </Link>
            </div>

            {/* Military Ethos Triad */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {t('hero.ethosKnowledge')}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {t('hero.ethosDiscipline')}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {t('hero.ethosVoluntary')}
              </span>
            </div>

            {/* Reusable Urgent Notice Bar - Directly Below The Mottos */}
            <div className="w-full max-w-4xl pt-3">
              <UrgentNoticeBar />
            </div>

            {/* Interactive 3D Cylindrical Carousel - Directly Below The Urgent Notice Box */}
            <div className="w-full max-w-5xl pt-4 pb-2">
              <Rotating3DCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* MAIN CONTENT BODY */}
      {/* ======================================================== */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 sm:space-y-20">

        {/* ======================================================== */}
        {/* 2. DYNAMIC PLATOON HIGHLIGHTS & FIELD RECORD CMS */}
        {/* ======================================================== */}
        <PlatoonHighlightsSection />

        {/* ======================================================== */}
        {/* 3. QUICK ACCESS HUB: 5 CORE DIRECTIVES & PATHWAYS */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="space-y-1 text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
              {t('quickAccess.badge')}
            </span>
            <h2 className="font-heading text-3xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">
              {t('quickAccess.title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t('quickAccess.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {QUICK_ACCESS_HUB.map((item) => {
              const Icon = iconMap[item.iconName] || Shield;
              const isMarquee = item.id === 'how-to-join';

              // Dynamic localized content for quick access cards
              let cardTitle = isBn ? (item.titleBn || item.title) : item.title;
              let cardSubtitle = isBn ? (item.subtitleBn || item.subtitle) : item.subtitle;
              let cardDesc = isBn ? (item.descriptionBn || item.description) : item.description;
              let cardBadge = isBn ? (item.badgeTextBn || item.badgeText) : item.badgeText;
              let localizedCategory = isBn ? (item.categoryBn || item.category) : item.category;

              if (item.id === 'how-to-join') {
                if (isBn) {
                  cardTitle = t('quickAccess.howToJoinTitle') || cardTitle;
                  cardSubtitle = t('quickAccess.howToJoinSubtitle') || cardSubtitle;
                  cardDesc = t('quickAccess.howToJoinDesc') || cardDesc;
                  cardBadge = t('quickAccess.howToJoinBadge') || cardBadge;
                }
              } else if (item.id === 'benefits') {
                if (isBn) {
                  cardTitle = t('quickAccess.benefitsTitle') || cardTitle;
                  cardSubtitle = t('quickAccess.benefitsSubtitle') || cardSubtitle;
                  cardDesc = t('quickAccess.benefitsDesc') || cardDesc;
                  cardBadge = t('quickAccess.benefitsBadge') || cardBadge;
                }
              } else if (item.id === 'policies') {
                if (isBn) {
                  cardTitle = t('quickAccess.policiesTitle') || cardTitle;
                  cardSubtitle = t('quickAccess.policiesSubtitle') || cardSubtitle;
                  cardDesc = t('quickAccess.policiesDesc') || cardDesc;
                  cardBadge = t('quickAccess.policiesBadge') || cardBadge;
                }
              } else if (item.id === 'guidelines') {
                if (isBn) {
                  cardTitle = t('quickAccess.guidelinesTitle') || cardTitle;
                  cardSubtitle = t('quickAccess.guidelinesSubtitle') || cardSubtitle;
                  cardDesc = t('quickAccess.guidelinesDesc') || cardDesc;
                  cardBadge = t('quickAccess.guidelinesBadge') || cardBadge;
                }
              } else if (item.id === 'events') {
                if (isBn) {
                  cardTitle = t('quickAccess.eventsTitle') || cardTitle;
                  cardSubtitle = t('quickAccess.eventsSubtitle') || cardSubtitle;
                  cardDesc = t('quickAccess.eventsDesc') || cardDesc;
                  cardBadge = t('quickAccess.eventsBadge') || cardBadge;
                }
              }

              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-all hover:border-red-500/50 ${
                    isMarquee
                      ? 'md:col-span-2 lg:col-span-1 bg-gradient-to-br from-red-50/50 via-white to-white dark:from-red-950/20 dark:via-slate-900 dark:to-slate-900 border-red-200 dark:border-red-900/40'
                      : ''
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="rounded-xl p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-red-700 group-hover:text-white dark:group-hover:bg-red-700 transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {localizedCategory}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {cardTitle}
                      </h3>
                      <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-0.5">
                        {cardSubtitle}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {cardDesc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400">
                    <span className="font-mono text-[11px]">{cardBadge}</span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>{t('common.accessDetails')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. LIVE PARADE & DRILL ROSTER (REAL-TIME CLOUD STORAGE) */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
                {t('events.badge')}
              </span>
              <h3 className="font-heading text-2xl font-bold uppercase text-slate-900 dark:text-white">
                {t('events.title')}
              </h3>
            </div>
            <Link
              to="/events"
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1 font-mono uppercase tracking-wider"
            >
              <span>{t('events.viewFullCalendar', undefined, { count: events.length })}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center text-xs text-slate-500">
              {t('events.noEvents')}{' '}
              <Link to="/admin" className="text-red-600 dark:text-red-400 font-bold hover:underline">
                {t('admin.title')}
              </Link>.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {events.slice(0, 4).map((evt) => {
                const eTitle = isBn ? (evt.titleBn || evt.title) : evt.title;
                const eCat = isBn ? (evt.categoryBn || evt.category) : evt.category;
                const eDisplayDate = isBn ? (evt.displayDateBn || evt.displayDate || evt.date) : (evt.displayDate || evt.date);
                const eDesc = isBn ? (evt.descriptionBn || evt.description) : evt.description;
                const eTime = isBn ? (evt.timeBn || evt.time) : evt.time;
                const eVenue = isBn ? (evt.venueBn || evt.venue) : evt.venue;
                const eTurnout = isBn ? (evt.mandatoryTurnoutBn || evt.mandatoryTurnout) : evt.mandatoryTurnout;

                return (
                  <div
                    key={evt.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-red-500/40 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                        <span className="font-bold text-red-600 dark:text-red-400 uppercase">
                          {eCat}
                        </span>
                        <span>{eDisplayDate}</span>
                      </div>

                      <h4 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white">
                        {eTitle}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {eDesc}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono">{eTime}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">{eVenue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono text-slate-400">
                        {t('events.turnoutLabel')} <strong className="text-slate-600 dark:text-slate-300 font-normal">{eTurnout}</strong>
                      </span>
                      <Link
                        to="/events"
                        className="font-bold text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>{t('common.details')}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* 5. CADET OF THE SEMESTER SPOTLIGHT */}
        {/* ======================================================== */}
        <CadetOfTheSemester />

        {/* ======================================================== */}
        {/* 6. INSPIRATIONAL CADET SHORT STORIES */}
        {/* ======================================================== */}
        <CadetShortStoriesSection onOpenApply={onOpenApply} />



        {/* ======================================================== */}
        {/* 8. CADET CREED & FAST-TRACK APPLICATION TRIGGER */}
        {/* ======================================================== */}
        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-100/90 via-white to-slate-50 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950 p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
            <Flame className="w-7 h-7" />
          </div>

          <blockquote className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-slate-900 dark:text-white max-w-3xl mx-auto leading-relaxed">
            {t('creed.quote')}
          </blockquote>

          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {t('creed.author')}
          </div>

          {/* Fast-Track Recruitment CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onOpenApply}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-red-700/25 transition-all active:scale-95"
            >
              <span>{t('creed.submitDossier')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span>{t('creed.readHistory')}</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};
