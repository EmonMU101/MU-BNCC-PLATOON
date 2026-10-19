import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Award,
  BookOpen,
  ShieldAlert,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  Compass,
  Globe,
  Activity,
  GraduationCap,
  HeartHandshake,
  FileCheck,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { BENEFITS_DATA, GUIDELINES_DATA, POLICIES_DATA } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';

interface FrameworksPageProps {
  initialTab?: 'benefits' | 'guidelines' | 'policies';
  onOpenApply: () => void;
}

export const FrameworksPage: React.FC<FrameworksPageProps> = ({
  initialTab = 'benefits',
  onOpenApply,
}) => {
  const { t, isBn } = useLanguage();
  const { tab, subId } = useParams<{ tab?: string; subId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'benefits' | 'guidelines' | 'policies'>(
    (tab as any) || initialTab
  );

  // Sync state if url changes or sub-links are clicked
  useEffect(() => {
    if (tab === 'benefits' || tab === 'guidelines' || tab === 'policies') {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab('benefits');
    }

    const targetSub = subId || window.location.hash.replace('#', '');
    if (targetSub) {
      if (POLICIES_DATA.some((p) => p.id === targetSub)) {
        setActiveTab('policies');
        setActivePolicyId(targetSub);
        setTimeout(() => {
          const el = document.getElementById(targetSub);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else if (GUIDELINES_DATA.some((g) => g.id === targetSub)) {
        setActiveTab('guidelines');
        setOpenGuideline(targetSub);
        setTimeout(() => {
          const el = document.getElementById(targetSub);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else if (BENEFITS_DATA.some((b) => b.id === targetSub)) {
        setActiveTab('benefits');
        setTimeout(() => {
          const el = document.getElementById(targetSub);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [tab, subId, location.hash]);

  const handleTabChange = (newTab: 'benefits' | 'guidelines' | 'policies') => {
    setActiveTab(newTab);
    navigate(`/frameworks/${newTab}`);
  };

  // Accordion state for Guidelines
  const [openGuideline, setOpenGuideline] = useState<string | null>(GUIDELINES_DATA[0].id);

  const toggleGuideline = (id: string) => {
    setOpenGuideline((prev) => (prev === id ? null : id));
  };

  // Active Policy for Policies Document TOC
  const [activePolicyId, setActivePolicyId] = useState<string>(POLICIES_DATA[0].id);

  const iconMap: Record<string, React.ElementType> = {
    ShieldCheck,
    Compass,
    Globe,
    Activity,
    GraduationCap,
    HeartHandshake,
  };

  const getMetaForTab = () => {
    switch (activeTab) {
      case 'guidelines':
        return {
          title: 'Cadet Guidelines & Syllabus | Uniforms, Turnout & Ranks',
          titleBn: 'ক্যাডেট নির্দেশিকা ও সিলেবাস | ইউনিফর্ম ও পদবী কাঠামো',
          desc: 'Official training syllabus, uniform standards, badge accoutrements, and promotion ladders for MU BNCC Cadets.',
          descBn: 'এমইউ বিএনসিসি ক্যাডেটদের আনুষ্ঠানিক প্রশিক্ষণ সিলেবাস, পোশাক বিধিমালা এবং পদমর্যাদা বিন্যাস।',
        };
      case 'policies':
        return {
          title: 'Policies & Regulations | Honor Code, Attendance & Conduct',
          titleBn: 'নীতিমালা ও আচরণবিধি | সম্মানবিধি, ৮০% উপস্থিতি ও শৃঙ্খলা',
          desc: 'Directives covering 80% parade attendance, honor code, military discipline, anti-ragging mandates, and chain of command.',
          descBn: 'প্যারেডে ৮০% উপস্থিতি বাধ্যবাধকতা, সম্মান কোড, সামরিক শৃঙ্খলা এবং র‍্যাগিং বিরোধী কঠোর নীতিমালা।',
        };
      case 'benefits':
      default:
        return {
          title: 'Benefits of BNCC | Armed Forces Advantage & Leadership',
          titleBn: 'বিএনসিসির সুবিধাসমূহ | প্রতিরক্ষা কোটা, আইএসএসবি ও নেতৃত্ব',
          desc: 'Explore official defense commission quotas, Inter-Services Selection Board (ISSB) grooming, and leadership opportunities.',
          descBn: 'বাংলাদেশ সশস্ত্র বাহিনীতে অফিসার নিয়োগ কোটা, আইএসএসবি সুবিধা এবং আন্তর্জাতিক যুব বিনিময় প্রোগ্রামের সুযোগ।',
        };
    }
  };

  const meta = getMetaForTab();

  return (
    <div className="space-y-16 pb-20">
      <SEOHead
        title={meta.title}
        titleBn={meta.titleBn}
        description={meta.desc}
        descriptionBn={meta.descBn}
        path={`/frameworks/${activeTab}`}
      />

      {/* Header */}
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 py-12 sm:py-16">
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-4 py-1.5 shadow-xs text-xs font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-red-600" />
            <span>{isBn ? 'বিএনসিসি প্রাতিষ্ঠানিক অনুশাসন' : 'BNCC Institutional Governance'}</span>
            <span className="text-slate-400">·</span>
            <span>{isBn ? 'প্লাটুন নীতিমালা ও কাঠামো' : 'Platoon Frameworks'}</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-slate-950 dark:text-white">
            {t('frameworks.title')}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            {t('frameworks.subtitle')}
          </p>

          {/* Segmented Tab Bar */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleTabChange('benefits')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'benefits'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>{t('frameworks.tabBenefits')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('guidelines')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'guidelines'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{t('frameworks.tabGuidelines')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('policies')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'policies'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{t('frameworks.tabPolicies')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Sub-Links Bar for the Active Framework */}
      <div className="sticky top-16 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
              <Layers className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>{isBn ? 'উপ-বিষয়সমূহ:' : 'Sub-Topics:'}</span>
            </span>

            {/* "All Topics" Reset Button */}
            <button
              type="button"
              onClick={() => navigate(`/frameworks/${activeTab}`)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !subId
                  ? 'bg-red-700 text-white font-bold shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              <span>{isBn ? '★ সকল বিষয়' : '★ All Topics'}</span>
            </button>

            {/* Specific Sub Links for Active Tab */}
            {activeTab === 'benefits' &&
              BENEFITS_DATA.map((benefit) => {
                const title = isBn ? (benefit.titleBn || benefit.title) : benefit.title;
                const isSelected = subId === benefit.id;
                return (
                  <button
                    key={benefit.id}
                    type="button"
                    onClick={() => {
                      navigate(`/frameworks/benefits/${benefit.id}`);
                      const el = document.getElementById(benefit.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs ${
                      isSelected
                        ? 'bg-red-700 text-white font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                  >
                    <span>{title}</span>
                  </button>
                );
              })}

            {activeTab === 'guidelines' &&
              GUIDELINES_DATA.map((g) => {
                const title = isBn ? (g.titleBn || g.title) : g.title;
                const isSelected = subId === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      navigate(`/frameworks/guidelines/${g.id}`);
                      setOpenGuideline(g.id);
                      const el = document.getElementById(g.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-red-700 text-white font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                  >
                    <span>{title}</span>
                  </button>
                );
              })}

            {activeTab === 'policies' &&
              POLICIES_DATA.map((p) => {
                const title = isBn ? (p.titleBn || p.title) : p.title;
                const isSelected = activePolicyId === p.id || subId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setActivePolicyId(p.id);
                      navigate(`/frameworks/policies/${p.id}`);
                      const el = document.getElementById(p.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-red-700 text-white font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-75">{isBn ? (p.sectionBn || p.section) : p.section}:</span>
                    <span>{title}</span>
                  </button>
                );
              })}
          </div>

          {subId && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400">
                {isBn ? 'সক্রিয় উপ-বিষয়:' : 'Focused on:'}
              </span>
              <button
                type="button"
                onClick={() => navigate(`/frameworks/${activeTab}`)}
                className="text-red-600 dark:text-red-400 hover:underline font-bold flex items-center gap-1"
              >
                <span>{subId}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">✕</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* TAB 1: BENEFITS */}
        {activeTab === 'benefits' && (
          <section className="space-y-8 animate-in fade-in duration-200">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  {isBn ? 'ক্যাডেট সুযোগ-সুবিধা ও জাতীয় সম্মান' : 'Cadet Privileges & National Advantage'}
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-slate-900 dark:text-white">
                  {isBn ? 'কেন ক্যাডেট কোরে যোগ দেবেন?' : 'Why Join the Cadet Corps'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-xs text-left sm:text-right">
                {isBn
                  ? 'বাংলাদেশ সশস্ত্র বাহিনী ও বিশ্ববিদ্যালয় সিন্ডিকেট কর্তৃক স্বীকৃত আনুষ্ঠানিক দক্ষতা ও বিশেষ সুবিধাসমূহ।'
                  : 'Official competencies recognized by the Bangladesh Armed Forces & University Syndicate.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BENEFITS_DATA.map((benefit) => {
                const Icon = iconMap[benefit.icon] || Award;
                const bTitle = isBn ? (benefit.titleBn || benefit.title) : benefit.title;
                const bDesc = isBn ? (benefit.longDescBn || benefit.longDesc) : benefit.longDesc;
                const bCat = isBn ? (benefit.categoryBn || benefit.category) : benefit.category;
                const bBullets = isBn ? (benefit.bulletPointsBn || benefit.bulletPoints) : benefit.bulletPoints;
                const isSelected = subId === benefit.id;

                return (
                  <div
                    key={benefit.id}
                    id={benefit.id}
                    className={`scroll-mt-32 rounded-2xl border p-6 shadow-xs flex flex-col justify-between space-y-4 transition-all duration-200 ${
                      isSelected
                        ? 'border-red-600 dark:border-red-500 ring-2 ring-red-500/20 bg-red-50/10 dark:bg-red-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-red-500/40'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="rounded-xl p-2.5 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-red-700 text-white shadow-2xs">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{isBn ? 'সক্রিয় বিষয়' : 'Active'}</span>
                            </span>
                          )}
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {bCat}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                        {bTitle}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                        {bDesc}
                      </p>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                        <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block font-mono">
                          {isBn ? 'মূল প্রাপ্তিসমূহ:' : 'Key Deliverables:'}
                        </span>
                        {bBullets.map((point, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading uppercase">
                  {isBn
                    ? 'মেট্রোপলিটন ইউনিভার্সিটিতে এই নেতৃত্ব ও সামরিক সুবিধাগুলো পেতে চান?'
                    : 'Ready to unlock these leadership privileges at Metropolitan University?'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isBn
                    ? '২০২৫–২০২৬ ইনটেক চক্রের জন্য ক্যাডেট ভর্তি আবেদন বর্তমানে সক্রিয় রয়েছে।'
                    : 'Applications for the 2025–2026 intake cycle are actively being reviewed.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenApply}
                className="w-full sm:w-auto rounded-xl bg-red-700 hover:bg-red-800 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-red-700/20 active:scale-95 shrink-0"
              >
                {isBn ? 'ক্যাডেট ভর্তির আবেদন করুন' : 'Apply for Cadet Intake'}
              </button>
            </div>
          </section>
        )}

        {/* TAB 2: GUIDELINES ACCORDION */}
        {activeTab === 'guidelines' && (
          <section className="space-y-8 animate-in fade-in duration-200">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  {isBn ? 'সিলেবাস ও মানদণ্ড' : 'Curriculum & Standards'}
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-slate-900 dark:text-white">
                  {isBn ? 'বিএনসিসি প্রশিক্ষণ নির্দেশিকা ও বিধিমালা' : 'Guideline of BNCC Training & Standards'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-xs text-left sm:text-right">
                {isBn
                  ? 'বাংলাদেশ ন্যাশনাল ক্যাডেট কোর সদর দপ্তরের নির্দেশিকা অনুযায়ী প্রণীত প্রমিত সিলেবাস।'
                  : 'Standardised syllabus conforming to Bangladesh National Cadet Corps Headquarters guidelines.'}
              </p>
            </div>

            <div className="space-y-4">
              {GUIDELINES_DATA.map((g) => {
                const isSelectedSub = subId === g.id;
                const isOpen = openGuideline === g.id || isSelectedSub;
                const gTitle = isBn ? (g.titleBn || g.title) : g.title;
                const gCat = isBn ? (g.categoryBn || g.category) : g.category;
                const gSummary = isBn ? (g.summaryBn || g.summary) : g.summary;
                const gDetails = isBn ? (g.detailsBn || g.details) : g.details;
                const gSched = isBn ? (g.scheduleOrRequirementBn || g.scheduleOrRequirement) : g.scheduleOrRequirement;

                return (
                  <div
                    key={g.id}
                    id={g.id}
                    className={`scroll-mt-32 rounded-2xl border overflow-hidden shadow-xs transition-all duration-200 ${
                      isSelectedSub
                        ? 'border-red-600 dark:border-red-500 ring-2 ring-red-500/20 bg-red-50/10 dark:bg-red-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-red-500/40'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleGuideline(g.id)}
                      className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl p-2.5 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {isSelectedSub && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-red-700 text-white shadow-2xs">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{isBn ? 'সক্রিয় সিলেবাস' : 'Active'}</span>
                              </span>
                            )}
                            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                              {gCat}
                            </div>
                          </div>
                          <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                            {gTitle}
                          </h3>
                        </div>
                      </div>

                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-red-600 dark:text-red-400' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-4 text-xs">
                        <p className="text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                          {gSummary}
                        </p>

                        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-4 border border-slate-200/80 dark:border-slate-800 space-y-2">
                          <div className="font-mono text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                            {isBn ? 'প্রটোকল ও নির্দেশনাবলী:' : 'Protocol Breakdown:'}
                          </div>
                          <ul className="space-y-2">
                            {gDetails.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                                <span className="font-mono text-red-600 dark:text-red-400 font-bold shrink-0">
                                  {idx + 1}.
                                </span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {gSched && (
                          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {isBn ? 'সময়সূচি / শর্ত:' : 'Schedule:'}
                            </span>
                            <span>{gSched}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 3: POLICIES DOCUMENT WITH STICKY TABLE OF CONTENTS */}
        {activeTab === 'policies' && (
          <section className="space-y-8 animate-in fade-in duration-200">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
                  {isBn ? 'শৃঙ্খলা আদেশ ও সম্মান কোড' : 'Legal Directives & Honor Code'}
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-slate-900 dark:text-white">
                  {isBn ? 'এমইউ বিএনসিসি নীতিমালা ও বিধিমালা' : 'Policies & Regulations of MU BNCC'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-xs text-left sm:text-right">
                {isBn
                  ? 'প্লাটুন কমান্ড ও বিশ্ববিদ্যালয় প্রক্টরিয়াল বডি কর্তৃক কার্যকর বাধ্যতামূলক পরিচালনা বিধিমালা।'
                  : 'Binding operational guidelines enacted by Platoon Command & University Proctorial Board.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Sticky Table of Contents (4 cols) */}
              <div className="lg:col-span-4 sticky top-24 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-heading">
                  {isBn ? 'নীতিমালার সূচিপত্র' : 'Document Table of Contents'}
                </div>
                <nav className="space-y-1">
                  {POLICIES_DATA.map((p) => {
                    const pSec = isBn ? (p.sectionBn || p.section) : p.section;
                    const pTitle = isBn ? (p.titleBn || p.title) : p.title;

                    return (
                      <a
                        key={p.id}
                        href={`#${p.id}`}
                        onClick={() => setActivePolicyId(p.id)}
                        className={`block rounded-lg px-3 py-2 text-xs transition-colors ${
                          activePolicyId === p.id
                            ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <div className="font-mono text-[10px] uppercase text-slate-400">
                          {pSec}
                        </div>
                        <div className="truncate">{pTitle}</div>
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Policy Articles Document (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {POLICIES_DATA.map((policy) => {
                  const isSelected = activePolicyId === policy.id || subId === policy.id;
                  const pSec = isBn ? (policy.sectionBn || policy.section) : policy.section;
                  const pTitle = isBn ? (policy.titleBn || policy.title) : policy.title;
                  const pContent = isBn ? (policy.contentBn || policy.content) : policy.content;
                  const pSubrules = isBn ? (policy.subrulesBn || policy.subrules) : policy.subrules;
                  const pEnforcement = isBn ? (policy.enforcementBn || policy.enforcement) : policy.enforcement;

                  return (
                    <article
                      key={policy.id}
                      id={policy.id}
                      className={`scroll-mt-32 rounded-2xl border p-6 sm:p-8 shadow-xs space-y-4 transition-all duration-200 ${
                        isSelected
                          ? 'border-red-600 dark:border-red-500 ring-2 ring-red-500/20 bg-red-50/10 dark:bg-red-950/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold uppercase text-red-600 dark:text-red-400">
                            {pSec}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-red-600 text-white shadow-2xs">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{isBn ? 'সক্রিয় অনুচ্ছেদ' : 'Active'}</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono uppercase text-slate-400">
                          {isBn ? 'স্থায়ী প্রশাসনিক আদেশ' : 'Directive Standing Order'}
                        </span>
                      </div>

                      <h3 className="font-heading text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                        {pTitle}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {pContent}
                      </p>

                      <div className="space-y-2 pt-2">
                        <span className="text-[11px] font-bold uppercase font-mono text-slate-500">
                          {isBn ? 'প্রযোজ্য বিধিসমূহ:' : 'Enacted Provisions:'}
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                          {pSubrules.map((sub, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-red-500 font-bold">•</span>
                              <span>{sub}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 rounded-lg bg-slate-50 dark:bg-slate-950/60 p-3 text-[11px]">
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {isBn ? 'শৃঙ্খলা প্রয়োগ ও শাস্তি:' : 'Enforcement & Penalty:'}
                        </span>{' '}
                        <span className="text-slate-600 dark:text-slate-400">
                          {pEnforcement}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
