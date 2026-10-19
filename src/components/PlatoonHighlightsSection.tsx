import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Target,
  HeartHandshake,
  Award,
  Star,
  Activity,
  Flame,
  Shield,
  Sparkles,
  LucideIcon,
  ChevronRight,
  Flag,
  Medal,
  Calendar,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  PlatoonHighlightItem,
  PlatoonMilestoneItem,
  RegimentalHonorItem,
  subscribeHighlights,
  subscribeMilestones,
  subscribeRegimentalHonors,
  DEFAULT_HIGHLIGHTS,
  DEFAULT_MILESTONES,
  DEFAULT_HONORS,
} from '../services/platoonCmsService';
import { StatsCounter } from './StatsCounter';

const HIGHLIGHT_ICONS: Record<string, LucideIcon> = {
  Trophy,
  Target,
  HeartHandshake,
  Award,
  Star,
  Activity,
  Flame,
  Shield,
  Sparkles,
};

export const PlatoonHighlightsSection: React.FC = () => {
  const { t, isBn } = useLanguage();
  const [activeTab, setActiveTab] = useState<'milestones' | 'honors' | 'highlights'>('milestones');
  const [highlights, setHighlights] = useState<PlatoonHighlightItem[]>(DEFAULT_HIGHLIGHTS);
  const [milestones, setMilestones] = useState<PlatoonMilestoneItem[]>(DEFAULT_MILESTONES);
  const [honors, setHonors] = useState<RegimentalHonorItem[]>(DEFAULT_HONORS);

  useEffect(() => {
    // Only subscribe to deployed items on public frontend
    const unsubHl = subscribeHighlights((items) => {
      setHighlights(items);
    });
    const unsubMs = subscribeMilestones((items) => {
      setMilestones(items);
    }, true);
    const unsubHn = subscribeRegimentalHonors((items) => {
      setHonors(items);
    }, true);

    return () => {
      unsubHl();
      unsubMs();
      unsubHn();
    };
  }, []);

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            <span>{t('stats.badge') || (isBn ? 'অফিসিয়াল অপারেশনাল পরিসংখ্যান' : 'Official Operational Metrics')}</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wide text-slate-900 dark:text-white mt-1">
            {t('stats.title') || (isBn ? 'প্লাটুনের অর্জন ও মাঠপর্যায়ের রেকর্ড' : 'Platoon Highlights & Field Record')}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm text-left sm:text-right">
          {t('stats.subtitle') || (isBn ? 'প্রতিষ্ঠালগ্ন থেকেই ময়নামতি রেজিমেন্টের অধীনে দেশসেবায় নিয়োজিত।' : 'Serving under Mainamati Regiment, Sylhet Sector since inception.')}
        </p>
      </div>

      {/* Dynamic Quantitative Field Records (Numerical Animated Counters) */}
      <StatsCounter />

      {/* Interactive Tabs for Milestones, Honors, and Highlights */}
      <div className="pt-4 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('milestones')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'milestones'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{isBn ? `মূল মাইলফলক (${milestones.length})` : `Key Milestones (${milestones.length})`}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('honors')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'honors'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Medal className="w-3.5 h-3.5" />
              <span>{isBn ? `রেজিমেন্ট সম্মাননা (${honors.length})` : `Regimental Honors (${honors.length})`}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('highlights')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'highlights'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{isBn ? `বিশেষ অর্জন (${highlights.length})` : `Highlights (${highlights.length})`}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>{isBn ? 'সরাসরি হেডকোয়ার্টার্স ডাটাবেস থেকে সিঙ্ক' : 'Live Sync from Command HQ'}</span>
          </div>
        </div>

        {/* 1. KEY PLATOON MILESTONES (DEPLOYED TIMELINE CARDS) */}
        {activeTab === 'milestones' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
            {milestones.map((ms, idx) => {
              const titleText = isBn ? (ms.titleBn || ms.title) : ms.title;
              const descText = isBn ? (ms.descriptionBn || ms.description) : ms.description;
              const dateText = isBn ? (ms.dateBn || ms.date) : ms.date;
              const catText = isBn ? (ms.categoryBn || ms.category) : ms.category;
              const locText = isBn ? (ms.locationBn || ms.location) : ms.location;
              const badgeText = isBn ? (ms.badgeBn || ms.badge) : ms.badge;

              return (
                <div
                  key={ms.id || idx}
                  className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-red-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-600 dark:text-red-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateText}</span>
                      </div>
                      {badgeText && (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {badgeText}
                        </span>
                      )}
                    </div>

                    <div>
                      {catText && (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                          {catText}
                        </span>
                      )}
                      <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {titleText}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {descText}
                    </p>
                  </div>

                  {locText && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{locText}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 2. REGIMENTAL HONORS & AWARDS (DEPLOYED CARDS) */}
        {activeTab === 'honors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
            {honors.map((hn, idx) => {
              const titleText = isBn ? (hn.titleBn || hn.title) : hn.title;
              const citationText = isBn ? (hn.citationBn || hn.citation) : hn.citation;
              const awardeeText = isBn ? (hn.recipientOrPlatoonBn || hn.recipientOrPlatoon) : hn.recipientOrPlatoon;
              const authorityText = isBn ? (hn.conferredByBn || hn.conferredBy) : hn.conferredBy;
              const yearText = isBn ? (hn.awardYearBn || hn.awardYear) : hn.awardYear;

              return (
                <div
                  key={hn.id || idx}
                  className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-red-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="rounded-lg p-2 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 group-hover:scale-105 transition-transform">
                        <Medal className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-red-600 px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/60">
                          {isBn ? `সাল ${yearText}` : `Year ${yearText}`}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                          {hn.medalType}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {titleText}
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1">
                        <span className="text-slate-400 font-normal">{isBn ? 'প্রাপক: ' : 'Awardee: '}</span>
                        {awardeeText}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      "{citationText}"
                    </p>
                  </div>

                  {authorityText && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate">{authorityText}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 3. PLATOON HIGHLIGHTS (TACTICAL NARRATIVES) */}
        {activeTab === 'highlights' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-200">
            {highlights.map((hl, idx) => {
              const Icon = (hl.iconName && HIGHLIGHT_ICONS[hl.iconName]) || Trophy;
              const titleText = isBn ? (hl.titleBn || hl.title) : hl.title;
              const descText = isBn ? (hl.descriptionBn || hl.description) : hl.description;
              const badgeText = isBn ? (hl.badgeBn || hl.badge) : hl.badge;
              const metricText = isBn ? (hl.metricValueBn || hl.metricValue) : hl.metricValue;
              const catText = isBn ? (hl.categoryBn || hl.category) : hl.category;

              return (
                <div
                  key={hl.id || idx}
                  className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-red-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="rounded-lg p-2.5 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      {badgeText && (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {badgeText}
                        </span>
                      )}
                    </div>

                    <div>
                      {catText && (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                          {catText}
                        </span>
                      )}
                      <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white uppercase group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {titleText}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {descText}
                    </p>
                  </div>

                  {metricText && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-red-600 dark:text-red-400">
                        {metricText}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
