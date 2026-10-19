import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Medal,
  Star,
  Shield,
  Trophy,
  Crown,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Flame,
  ArrowRight,
  Quote,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  X,
  User,
  ExternalLink,
  RefreshCw,
  Database,
  Calendar,
} from 'lucide-react';
import {
  FeaturedCadetDoc,
  subscribeFeaturedCadets,
  getFeaturedCadets,
} from '../services/featuredCadetService';
import { useLanguage } from '../context/LanguageContext';

export const CadetOfTheSemester: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t, isBn } = useLanguage();
  const [cadets, setCadets] = useState<FeaturedCadetDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [imgError, setImgError] = useState<boolean>(false);
  const [isNominateModalOpen, setIsNominateModalOpen] = useState<boolean>(false);
  const [nominateSubmitted, setNominateSubmitted] = useState<boolean>(false);
  const [nominateForm, setNominateForm] = useState({
    nomineeName: '',
    nomineeRank: 'Cadet',
    reason: '',
    yourName: '',
  });

  // Fetch featured cadet data from Firestore with real-time updates
  useEffect(() => {
    let isMounted = true;

    getFeaturedCadets().then((initialCadets) => {
      if (isMounted) {
        setCadets(initialCadets);
        setLoading(false);
      }
    });

    const unsubscribe = subscribeFeaturedCadets((liveCadets) => {
      if (isMounted) {
        setCadets(liveCadets);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const featured: FeaturedCadetDoc | undefined = cadets[currentIndex];

  const formatSemester = (str?: string) => {
    if (!str) return isBn ? 'চলতি সেমিস্টার' : 'Current Semester';
    if (!isBn) return str;
    let res = str;
    const semMap: Record<string, string> = {
      Spring: 'স্প্রিং',
      Summer: 'সামার',
      Fall: 'ফল',
      Winter: 'উইন্টার',
      Semester: 'সেমিস্টার',
    };
    Object.entries(semMap).forEach(([en, bn]) => {
      res = res.replace(en, bn);
    });
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return res.replace(/\d/g, (d) => bengaliDigits[parseInt(d, 10)] || d);
  };

  const formatNum = (num: number | string) => {
    if (!isBn || num === undefined || num === null) return String(num);
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d, 10)] || d);
  };

  const formatRank = (r: string) => {
    if (!isBn || !r) return r;
    if (r === 'Cadet') return 'ক্যাডেট';
    if (r === 'Cadet Lance Corporal') return 'ক্যাডেট ল্যান্স কর্পোরাল';
    if (r === 'Cadet Corporal') return 'ক্যাডেট কর্পোরাল';
    if (r === 'Cadet Sergeant') return 'ক্যাডেট সার্জেন্ট';
    if (r === 'Cadet Under Officer') return 'ক্যাডেট আন্ডার অফিসার';
    return r;
  };

  const formatRankAbbr = (abbr: string) => {
    if (!isBn || !abbr) return abbr;
    if (abbr === 'C/SGT') return 'সি/সার্জেন্ট';
    if (abbr === 'C/CPL') return 'সি/কর্পোরাল';
    if (abbr === 'C/LCPL') return 'সি/এলসিপিএল';
    if (abbr === 'CDT') return 'সিডিটি';
    if (abbr === 'CUO') return 'সিইউও';
    return abbr;
  };

  const handlePrev = () => {
    setImgError(false);
    setCurrentIndex((prev) => (prev === 0 ? cadets.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setImgError(false);
    setCurrentIndex((prev) => (prev === cadets.length - 1 ? 0 : prev + 1));
  };

  const handleNominateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNominateSubmitted(true);
    setTimeout(() => {
      setNominateSubmitted(false);
      setIsNominateModalOpen(false);
      setNominateForm({ nomineeName: '', nomineeRank: 'Cadet', reason: '', yourName: '' });
    }, 2500);
  };

  if (loading && cadets.length === 0) {
    return (
      <div className={`rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center space-y-4 ${className}`}>
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-red-600 border-t-transparent mx-auto" />
        <p className="text-xs font-mono uppercase tracking-wider text-slate-500">
          {isBn ? 'ক্লাউড ডেটাবেস থেকে সেমিস্টার সেরা ক্যাডেটের তথ্য লোড হচ্ছে...' : 'Fetching Cadet of the Semester from Cloud Database...'}
        </p>
      </div>
    );
  }

  // Graceful state when mock data is removed and no honoree has been published yet
  if (!featured || cadets.length === 0) {
    return (
      <section className={`space-y-6 ${className}`} aria-labelledby="cadet-of-the-semester-title">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
                {isBn ? 'সেরা ক্যাডেট স্পটলাইট' : 'Cadet Spotlight'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/60 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                {isBn ? 'সেমিস্টার সম্মাননা তালিকা' : 'Semester Roll of Honor'}
              </span>
            </div>

            <h2
              id="cadet-of-the-semester-title"
              className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 dark:text-white mt-1"
            >
              {isBn ? 'সেমিস্টার সেরা ক্যাডেট' : 'Cadet of the Semester'}
            </h2>
          </div>
        </div>

        {/* Elegant Notice / Evaluation Card */}
        <div className="rounded-3xl border-2 border-dashed border-amber-300/80 dark:border-amber-600/40 bg-gradient-to-br from-amber-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 text-white flex items-center justify-center mx-auto shadow-lg">
            <Crown className="w-8 h-8 text-amber-100" />
          </div>

          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{isBn ? 'চলতি সেমিস্টার মূল্যায়ন কার্যক্রম চলমান' : 'Current Semester Evaluation in Progress'}</span>
            </span>

            <h3 className="font-heading text-2xl font-black uppercase text-slate-900 dark:text-white">
              {isBn ? 'প্লাটুন কমান্ড সম্মাননা ঘোষণা' : 'Platoon Command Roll of Honor'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {isBn
                ? 'মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুনে ড্রিল উৎকর্ষতা, শৃংখলা, একাডেমিক নিষ্ঠা ও সমাজকল্যাণমূলক সেবার ভিত্তিতে প্রতি সেমিস্টারে সেরা ক্যাডেট নির্বাচিত করা হয়। অ্যাডমিন পোর্টাল থেকে চলতি সেমিস্টারের ফলাফল প্রকাশিত হলে এখানে প্রদর্শিত হবে।'
                : 'Metropolitan University BNCC Platoon awards the prestigious Cadet of the Semester distinction based on drill precision, tactical discipline, academic consistency, and voluntary community service. Official results will be published here upon Platoon Command review.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => setIsNominateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-800 hover:to-amber-800 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{isBn ? 'ক্যাডেট মনোনয়ন দিন' : 'Nominate Outstanding Peer'}</span>
            </button>

            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Shield className="w-4 h-4 text-red-600" />
              <span>{isBn ? 'অফিসার পোর্টাল থেকে প্রকাশ করুন' : 'Officer Portal: Publish Honoree'}</span>
            </Link>
          </div>
        </div>

        {/* Nomination Modal */}
        {renderNominateModal()}
      </section>
    );
  }

  const displayName = isBn ? (featured.fullNameBn || featured.fullName) : featured.fullName;
  const displayRank = isBn ? (featured.rankBn || formatRank(featured.rank)) : featured.rank;
  const displayRankAbbr = isBn ? (featured.rankAbbrBn || formatRankAbbr(featured.rankAbbr || 'CDT')) : (featured.rankAbbr || 'CDT');
  const displayDept = isBn ? (featured.departmentBn || featured.department) : featured.department;
  const displayBatch = isBn ? (featured.batchBn || featured.batch) : featured.batch;
  const displaySection = isBn ? (featured.sectionBn || featured.section || 'প্লাটুন ১ (আলফা সেকশন)') : (featured.section || 'Platoon 1 (Alpha Section)');
  const displayQuote = isBn ? (featured.quoteBn || featured.quote) : featured.quote;
  const displayCitation = isBn ? (featured.citationBn || featured.citation) : featured.citation;
  const displayAchievement = isBn ? (featured.achievementSummaryBn || featured.achievementSummary) : featured.achievementSummary;
  const displayBadge = isBn ? (featured.distinctionBadgeBn || featured.distinctionBadge) : featured.distinctionBadge;
  const displaySemester = isBn ? (featured.semesterBn || formatSemester(featured.semester)) : (featured.semester || featured.month || 'Current Semester');
  const displayCadetNo = isBn ? formatNum(featured.cadetNumber) : featured.cadetNumber;

  function renderNominateModal() {
    if (!isNominateModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
        <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
          <button
            type="button"
            onClick={() => setIsNominateModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isBn ? 'বন্ধ করুন' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              {isBn ? 'প্লাটুন কমান্ড কাউন্সিল' : 'Platoon Command Council'}
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-bold uppercase text-slate-900 dark:text-white">
              {isBn ? 'সেমিস্টার সেরা ক্যাডেট মনোনয়ন দিন' : 'Nominate Cadet of the Semester'}
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              {isBn
                ? 'যে সহযোদ্ধা ড্রিল উৎকর্ষতা, প্যারেড নেতৃত্ব, শৃঙ্খলা ও একাডেমিক নিষ্ঠায় অনন্য দৃষ্টান্ত স্থাপন করেছেন তাকে মনোনীত করুন।'
                : 'Submit a recommendation for an outstanding peer who demonstrated exceptional tactical discipline, academic consistency, or voluntary leadership during this semester.'}
            </p>
          </div>

          {nominateSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h4 className="font-heading text-lg font-bold uppercase text-emerald-900 dark:text-emerald-200">
                {isBn ? 'মনোনয়ন গৃহীত হয়েছে' : 'Nomination Received'}
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                {isBn
                  ? 'ধন্যবাদ! সেমিস্টার অনার রোল মূল্যায়নের সময় প্লাটুন কমান্ডার আপনার মনোনয়ন পর্যালোচনা করবেন।'
                  : 'Thank you. Your nomination will be reviewed by the Platoon Commander during the semester Roll of Honor evaluation.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleNominateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'মনোনীত ক্যাডেটের পূর্ণ নাম *' : 'Candidate Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isBn ? 'যেমন: তানভীর হাসান' : 'e.g. Tanvir Hasan'}
                  value={nominateForm.nomineeName}
                  onChange={(e) => setNominateForm({ ...nominateForm, nomineeName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'বর্তমান পদবী *' : 'Current Rank *'}
                </label>
                <select
                  value={nominateForm.nomineeRank}
                  onChange={(e) => setNominateForm({ ...nominateForm, nomineeRank: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="Cadet">Cadet (ক্যাডেট)</option>
                  <option value="Cadet Lance Corporal">Cadet Lance Corporal (ল্যান্স কর্পোরাল)</option>
                  <option value="Cadet Corporal">Cadet Corporal (কর্পোরাল)</option>
                  <option value="Cadet Sergeant">Cadet Sergeant (সার্জেন্ট)</option>
                  <option value="Cadet Under Officer">Cadet Under Officer (আন্ডার অফিসার)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'মনোনয়নের কারণ ও নেতৃত্বের স্বীকৃতি *' : 'Leadership Citation / Reason for Nomination *'}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={isBn ? 'কী কারণে তিনি এই সেমিস্টারে দৃষ্টান্ত স্থাপন করেছেন...' : 'Describe peer accomplishments, drill turnout, and leadership contributions...'}
                  value={nominateForm.reason}
                  onChange={(e) => setNominateForm({ ...nominateForm, reason: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'আপনার নাম / ক্যাডেট আইডি (ঐচ্ছিক)' : 'Your Name / Cadet ID (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isBn ? 'যেমন: MU-BNCC-2024-012' : 'e.g. MU-BNCC-2024-012'}
                  value={nominateForm.yourName}
                  onChange={(e) => setNominateForm({ ...nominateForm, yourName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNominateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold uppercase tracking-wider shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isBn ? 'মনোনয়নপত্র জমা দিন' : 'Submit Recommendation'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className={`space-y-6 ${className}`} aria-labelledby="cadet-of-the-semester-title">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
              {isBn ? 'সেরা ক্যাডেট স্পটলাইট' : 'Cadet Spotlight'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/60 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              {isBn ? 'সেমিস্টার সম্মাননা তালিকা' : 'Semester Roll of Honor'}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              <Database className="w-3 h-3" />
              {isBn ? 'লাইভ ডেটাবেস' : 'Firestore Live'}
            </span>
          </div>

          <h2
            id="cadet-of-the-semester-title"
            className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 dark:text-white mt-1"
          >
            {isBn ? 'সেমিস্টার সেরা ক্যাডেট' : 'Cadet of the Semester'}
          </h2>
        </div>

        {/* Carousel Semester Switcher Controls */}
        {cadets.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isBn ? 'পূর্ববর্তী সেমিস্টার সেরা ক্যাডেট' : 'Previous Cadet of the Semester'}
              title={isBn ? 'পূর্ববর্তী সেমিস্টারের সম্মাননা' : 'Previous semester honoree'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
              {displaySemester}
            </span>

            <button
              type="button"
              onClick={handleNext}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isBn ? 'পরবর্তী সেমিস্টার সেরা ক্যাডেট' : 'Next Cadet of the Semester'}
              title={isBn ? 'পরবর্তী সেমিস্টারের সম্মাননা' : 'Next semester honoree'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Spotlight Container */}
      <div className="rounded-3xl border-2 border-amber-300/60 dark:border-amber-500/30 bg-gradient-to-br from-amber-50/40 via-white to-red-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 p-6 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/10 dark:bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Col 1: Cadet Image & Metrics (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Featured Cadet Image */}
            <div className="relative group rounded-2xl overflow-hidden border-2 border-amber-400 dark:border-amber-500/50 shadow-lg bg-slate-900 aspect-4/5 max-w-md mx-auto lg:max-w-none">
              {!imgError && featured.photoUrl ? (
                <img
                  src={featured.photoUrl}
                  alt={`${displayName} - Cadet of the Semester`}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-b from-slate-800 to-slate-950">
                  <User className="w-20 h-20 text-slate-500 mb-2" />
                  <span className="font-heading text-xl font-bold uppercase">{displayName}</span>
                  <span className="text-xs font-mono text-red-400">{displayRank}</span>
                </div>
              )}

              {/* Overlay Ribbon Badge */}
              <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-red-600 text-white font-mono font-extrabold text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-200" />
                <span>{displaySemester} {isBn ? 'সম্মাননাপ্রাপ্ত' : 'Honoree'}</span>
              </div>

              {/* Bottom Card Title Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-5 text-white">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300">
                  {displayRank} ({displayRankAbbr})
                </div>
                <h3 className="font-heading text-2xl font-black uppercase tracking-wide">
                  {displayName}
                </h3>
                <div className="text-xs text-slate-300 font-mono mt-0.5">
                  {displayCadetNo} {displayBatch ? `· ${displayBatch}` : ''}
                </div>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
                <span className="text-[9px] uppercase text-slate-400 block">{isBn ? 'ড্রিল ঘণ্টা' : 'Drill Hours'}</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {formatNum(featured.trainingHours || 0)}h
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
                <span className="text-[9px] uppercase text-slate-400 block">{isBn ? 'সেবামূলক কাজ' : 'Civic Duty'}</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatNum(featured.communityHours || 0)}h
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
                <span className="text-[9px] uppercase text-slate-400 block">{isBn ? 'বিশেষ সম্মাননা' : 'Honors / Badge'}</span>
                <span className="text-xs font-bold text-amber-500 truncate block">
                  {displayBadge || 'Exemplary Service'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 shadow-2xs">
                <span className="text-[9px] uppercase text-red-600 dark:text-red-400 block font-bold">{isBn ? 'মেরিট স্কোর' : 'Merit'}</span>
                <span className="text-sm font-black text-red-700 dark:text-red-300">
                  {formatNum(featured.meritScore || 300)}
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Achievement Summary, Quote & Citation (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Platoon Section & Academic Unit */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 font-bold uppercase">
                  {displaySection}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600 dark:text-slate-300 font-semibold">
                  {displayDept}
                </span>
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-slate-900 dark:text-white tracking-wide">
                {isBn ? 'অনুকরণীয় দায়িত্ব ও নেতৃত্বের স্বীকৃতি' : 'Exemplary Duty & Leadership Citation'}
              </h3>
            </div>

            {/* 1. ACHIEVEMENT SUMMARY */}
            <div className="rounded-2xl border-2 border-amber-300/80 dark:border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/30 p-5 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{isBn ? 'উল্লেখযোগ্য অর্জনসমূহ' : 'Notable Achievements'}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                {displayAchievement}
              </p>
              {displayBadge && (
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 font-mono text-[11px] font-bold text-amber-700 dark:text-amber-300 shadow-2xs">
                    <Medal className="w-3.5 h-3.5 text-amber-500" />
                    <span>{displayBadge}</span>
                  </span>
                </div>
              )}
            </div>

            {/* 2. CADET QUOTE */}
            <div className="relative rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs space-y-2">
              <Quote className="w-8 h-8 text-red-500/20 absolute top-3 right-3" />
              <div className="text-[11px] font-mono font-bold uppercase text-red-600 dark:text-red-400 tracking-wider flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5" />
                <span>{isBn ? 'ক্যাডেটের বাণী' : 'Cadet Statement'}</span>
              </div>
              <blockquote className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 italic font-sans leading-relaxed pl-2 border-l-3 border-red-600">
                "{displayQuote}"
              </blockquote>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                — {displayName}, {displayRank} ({displaySemester})
              </div>
            </div>

            {/* 3. Official Command Citation */}
            {displayCitation && (
              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>{isBn ? 'প্লাটুন কমান্ড সাইটেশন' : 'Platoon Command Citation'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  "{displayCitation}"
                </p>
              </div>
            )}

            {/* Action Triggers */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>{isBn ? 'ক্যাডেট লিডারবোর্ড দেখুন' : 'View Full Cadet Leaderboard'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setIsNominateModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isBn ? 'পরবর্তী ক্যাডেটকে মনোনীত করুন' : 'Nominate Next Cadet'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Nominate */}
      {renderNominateModal()}
    </section>
  );
};

// Also export as CadetOfTheMonth for backward-compatible imports
export const CadetOfTheMonth = CadetOfTheSemester;
export default CadetOfTheSemester;
