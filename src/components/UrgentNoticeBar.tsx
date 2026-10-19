import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Compass,
  Bell,
  ShieldAlert,
  Info,
  Activity,
  Flame,
} from 'lucide-react';
import {
  subscribeActiveNotice,
  NoticeCategory,
  DEFAULT_NOTICE_CATEGORY,
} from '../services/portalService';
import { useLanguage } from '../context/LanguageContext';

export type UrgentNoticeCategory = NoticeCategory;

export interface UrgentNoticeBarProps {
  /** Optional remote text or CSV URL to fetch urgent notice from (e.g. Google Sheets 'Publish to Web' CSV URL) */
  sourceUrl?: string;
  /** Default fallback broadcast notice text when no sourceUrl is provided or during fetch fallback */
  defaultNotice?: string;
  /** Explicit category override ('Emergency', 'General', 'Training Update') */
  category?: UrgentNoticeCategory;
  /** Default category fallback when not specified */
  defaultCategory?: UrgentNoticeCategory;
  /** Optional interval in milliseconds to re-poll the sourceUrl for live updates */
  pollIntervalMs?: number;
  /** Custom additional CSS class names */
  className?: string;
}

interface CategoryStyleConfig {
  badgeLabel: string;
  tagPrefix: string;
  badgeClasses: string;
  badgeText: string;
  pingDotClasses: string;
  solidDotClasses: string;
  containerBorder: string;
  containerShadow: string;
  tagBadgeBg: string;
  tagBadgeText: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORY_STYLES: Record<UrgentNoticeCategory, CategoryStyleConfig> = {
  Emergency: {
    badgeLabel: 'EMERGENCY',
    tagPrefix: 'EMERGENCY BROADCAST',
    badgeClasses:
      'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-sm shadow-red-500/20',
    badgeText: 'text-white',
    pingDotClasses: 'bg-red-400 opacity-75',
    solidDotClasses: 'bg-red-500',
    containerBorder:
      'border-red-300/80 dark:border-red-900/80 hover:border-red-500/80',
    containerShadow:
      'shadow-[-4px_-4px_6px_#ffffff,4px_4px_8px_rgba(239,68,68,0.15)] dark:shadow-[0_4px_16px_rgba(239,68,68,0.2)]',
    tagBadgeBg: 'bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800',
    tagBadgeText: 'text-red-700 dark:text-red-300',
    icon: AlertTriangle,
  },
  'Training Update': {
    badgeLabel: 'TRAINING UPDATE',
    tagPrefix: 'TACTICAL DIRECTIVE',
    badgeClasses:
      'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-sm shadow-amber-500/20',
    badgeText: 'text-white',
    pingDotClasses: 'bg-amber-300 opacity-75',
    solidDotClasses: 'bg-amber-400',
    containerBorder:
      'border-amber-300/80 dark:border-amber-900/80 hover:border-amber-500/80',
    containerShadow:
      'shadow-[-4px_-4px_6px_#ffffff,4px_4px_8px_rgba(245,158,11,0.15)] dark:shadow-[0_4px_16px_rgba(245,158,11,0.2)]',
    tagBadgeBg:
      'bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800',
    tagBadgeText: 'text-amber-800 dark:text-amber-300',
    icon: Compass,
  },
  General: {
    badgeLabel: 'GENERAL BULLETIN',
    tagPrefix: 'PLATOON NOTICE',
    badgeClasses:
      'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white shadow-sm shadow-blue-500/20',
    badgeText: 'text-white',
    pingDotClasses: 'bg-sky-300 opacity-75',
    solidDotClasses: 'bg-sky-400',
    containerBorder:
      'border-sky-300/80 dark:border-sky-900/80 hover:border-sky-500/80',
    containerShadow:
      'shadow-[-4px_-4px_6px_#ffffff,4px_4px_8px_rgba(14,165,233,0.15)] dark:shadow-[0_4px_16px_rgba(14,165,233,0.2)]',
    tagBadgeBg:
      'bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800',
    tagBadgeText: 'text-sky-800 dark:text-sky-300',
    icon: Bell,
  },
};

/**
 * Helper to auto-infer category from text content if not explicitly designated
 */
const inferCategoryFromText = (
  text: string,
  fallback: UrgentNoticeCategory = 'Emergency'
): UrgentNoticeCategory => {
  const lower = text.toLowerCase();
  if (lower.includes('training') || lower.includes('drill') || lower.includes('parade') || lower.includes('firing') || lower.includes('fitness') || lower.includes('obstacle')) {
    return 'Training Update';
  }
  if (lower.includes('general') || lower.includes('bulletin') || lower.includes('holiday') || lower.includes('uniform') || lower.includes('academic') || lower.includes('advisory')) {
    return 'General';
  }
  if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('alert') || lower.includes('immediate') || lower.includes('flood') || lower.includes('warning')) {
    return 'Emergency';
  }
  return fallback;
};

export const UrgentNoticeBar: React.FC<UrgentNoticeBarProps> = ({
  sourceUrl = '',
  defaultNotice,
  category: explicitCategory,
  defaultCategory = DEFAULT_NOTICE_CATEGORY,
  pollIntervalMs,
  className = '',
}) => {
  const { t, isBn } = useLanguage();
  const fallbackNotice = defaultNotice || (isBn
    ? '*** জরুরি নোটিশ: এমইউ বিএনসিসি প্লাটুন ইনটেক ২০২৫–২০২৬ আবেদনপত্রসমূহ যাচাই-বাছাই চলছে। প্রাথমিক শারীরিক বাছাইয়ের জন্য প্রবেশপত্র ও ক্রীড়া পোশাক পরিধান করে বিশ্ববিদ্যালয়ের কেন্দ্রীয় খেলার মাঠে উপস্থিত হতে নির্দেশ দেয়া হচ্ছে। নিয়মিত প্যারেড প্রতি রবিবার ও বুধবার সকাল ০৬:৪৫ টায় অনুষ্ঠিত হবে। ***'
    : '*** URGENT NOTICE: MU BNCC Platoon Intake 2025–2026 application dossiers are currently under review. Candidates must report with original Student ID and physical training sportswear for preliminary fitness screening at the MU Central Sports Ground. Regular university parade drills scheduled every Sunday & Wednesday at 06:45 AM sharp. ***');

  const [notice, setNotice] = useState<string>(fallbackNotice);
  const [activeCategory, setActiveCategory] = useState<UrgentNoticeCategory>(
    explicitCategory || defaultCategory
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Update fallback when language switches if using default notice
  useEffect(() => {
    if (!defaultNotice && (!notice || notice.includes('URGENT NOTICE') || notice.includes('জরুরি নোটিশ'))) {
      setNotice(fallbackNotice);
    }
  }, [fallbackNotice, defaultNotice]);

  useEffect(() => {
    // If sourceUrl is specified, prioritize fetching from sourceUrl
    if (sourceUrl) {
      setIsLoading(true);
      let isMounted = true;

      const fetchNotice = async () => {
        try {
          const response = await fetch(sourceUrl);
          if (!response.ok) throw new Error(`HTTP error ${response.status}`);
          const text = await response.text();

          if (isMounted) {
            if (text && !text.includes('<!DOCTYPE html>')) {
              const cleanText = text.trim();
              setNotice(cleanText.startsWith('***') ? cleanText : `*** ${cleanText} ***`);
              if (!explicitCategory) {
                setActiveCategory(inferCategoryFromText(cleanText, defaultCategory));
              }
            } else {
              setNotice(defaultNotice || fallbackNotice);
              if (!explicitCategory) {
                setActiveCategory(defaultCategory);
              }
            }
            setIsLoading(false);
          }
        } catch {
          if (isMounted) {
            setNotice(defaultNotice || fallbackNotice);
            if (!explicitCategory) {
              setActiveCategory(defaultCategory);
            }
            setIsLoading(false);
          }
        }
      };

      fetchNotice();

      if (pollIntervalMs && pollIntervalMs > 0) {
        const intervalId = setInterval(fetchNotice, pollIntervalMs);
        return () => {
          isMounted = false;
          clearInterval(intervalId);
        };
      }

      return () => {
        isMounted = false;
      };
    }

    // Otherwise, subscribe to live persistent notices from Firestore
    const unsubscribe = subscribeActiveNotice((liveNotice, liveCategory) => {
      if (liveNotice) {
        const cleanText = liveNotice.trim();
        setNotice(cleanText.startsWith('***') ? cleanText : `*** ${cleanText} ***`);
        if (!explicitCategory) {
          setActiveCategory(liveCategory || inferCategoryFromText(cleanText, defaultCategory));
        }
      } else {
        setNotice(defaultNotice || fallbackNotice);
        if (!explicitCategory) {
          setActiveCategory(defaultCategory);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [sourceUrl, defaultNotice, pollIntervalMs, explicitCategory, defaultCategory]);

  // Synchronize category if explicit prop updates
  useEffect(() => {
    if (explicitCategory) {
      setActiveCategory(explicitCategory);
    }
  }, [explicitCategory]);

  const styleConfig = CATEGORY_STYLES[activeCategory] || CATEGORY_STYLES.Emergency;
  const CategoryIcon = styleConfig.icon;

  const localizedBadgeLabel = isBn
    ? (activeCategory === 'Emergency'
        ? t('notice.labelEmergency')
        : activeCategory === 'Training Update'
        ? t('notice.labelTraining')
        : t('notice.labelGeneral'))
    : styleConfig.badgeLabel;

  return (
    <div
      className={`news-ticker-container flex w-full items-center overflow-hidden rounded-full bg-white dark:bg-slate-900 border p-1 sm:p-1.5 transition-all shadow-xs hover:shadow-sm ${styleConfig.containerBorder} ${className}`}
      role="region"
      aria-label={`${activeCategory} platoon announcements`}
    >
      {/* Category-Coded Badge */}
      <div
        className={`news-ticker-title flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider font-heading z-10 whitespace-nowrap transition-colors duration-300 ${styleConfig.badgeClasses}`}
        title={`Category: ${activeCategory}`}
      >
        <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${styleConfig.pingDotClasses}`}
          />
          <span
            className={`relative inline-flex h-full w-full rounded-full ${styleConfig.solidDotClasses}`}
          />
        </span>

        <CategoryIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
        <span className="tracking-[1px]">{localizedBadgeLabel}</span>
      </div>

      {/* The Scrolling Area - Clean seamless ticker flow within the single notice bar */}
      <div className="news-ticker-content relative flex w-full items-center overflow-hidden px-3 sm:px-4 py-1">
        <div className="ticker-text-scroll text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 font-sans tracking-wide flex items-center">
          <span title="Hover to pause notice">
            {isLoading ? (isBn ? 'নোটিশ লোড হচ্ছে...' : 'Loading latest notices...') : notice}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UrgentNoticeBar;
