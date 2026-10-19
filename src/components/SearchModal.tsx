import React, { useState, useEffect } from 'react';
import { Search, X, ChevronRight, BookOpen, Award, ShieldAlert, Calendar, UserCheck, Star, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BENEFITS_DATA, GUIDELINES_DATA, POLICIES_DATA, UPCOMING_EVENTS } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { isBn, t } = useLanguage();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Search logic across all sections
  const lowerQuery = query.toLowerCase().trim();

  const matchingBenefits = lowerQuery
    ? BENEFITS_DATA.filter(
        (b) =>
          b.title.toLowerCase().includes(lowerQuery) ||
          b.shortDesc.toLowerCase().includes(lowerQuery)
      ).map((b) => ({
        type: 'Benefit',
        title: b.title,
        desc: b.shortDesc,
        path: '/frameworks/benefits',
        icon: Award,
      }))
    : [];

  const matchingGuidelines = lowerQuery
    ? GUIDELINES_DATA.filter(
        (g) =>
          g.title.toLowerCase().includes(lowerQuery) ||
          g.summary.toLowerCase().includes(lowerQuery)
      ).map((g) => ({
        type: 'Guideline',
        title: g.title,
        desc: g.summary,
        path: '/frameworks/guidelines',
        icon: BookOpen,
      }))
    : [];

  const matchingPolicies = lowerQuery
    ? POLICIES_DATA.filter(
        (p) =>
          p.title.toLowerCase().includes(lowerQuery) ||
          p.content.toLowerCase().includes(lowerQuery)
      ).map((p) => ({
        type: 'Policy',
        title: p.title,
        desc: p.content,
        path: '/frameworks/policies',
        icon: ShieldAlert,
      }))
    : [];

  const matchingEvents = lowerQuery
    ? UPCOMING_EVENTS.filter(
        (e) =>
          e.title.toLowerCase().includes(lowerQuery) ||
          e.description.toLowerCase().includes(lowerQuery) ||
          e.venue.toLowerCase().includes(lowerQuery)
      ).map((e) => ({
        type: 'Event',
        title: e.title,
        desc: `${e.displayDate} · ${e.venue}`,
        path: '/events',
        icon: Calendar,
      }))
    : [];

  const staticLinks = [
    { type: 'Page', title: 'Home - Metropolitan University Platoon', desc: 'Main briefing, quick access hub, and highlights', path: '/', icon: ChevronRight },
    { type: 'Recruitment', title: 'How to Join MU BNCC', desc: 'Eligibility checker, step-by-step sequence & registration', path: '/how-to-join', icon: UserCheck },
    { type: 'Frameworks', title: 'BNCC Frameworks, Benefits & Guidelines', desc: 'Training syllabus, ranks, uniform code, and honor system', path: '/frameworks', icon: BookOpen },
    { type: 'Schedule', title: 'Upcoming Events & Parade Drills', desc: 'Parades, inspection, annual camp & blood drives', path: '/events', icon: Calendar },
    { type: 'Gallery', title: 'Photo Gallery, Cadet Blogs & Stories', desc: 'Archived photographs, reflective camp dispatches, and inspirational cadet stories', path: '/gallery', icon: Star },
    { type: 'About', title: 'About MU BNCC History & Leadership', desc: 'Established 31 July 2025 under Mainamati Regiment', path: '/about', icon: ChevronRight },
    { type: 'FAQ', title: 'Frequently Asked Questions (FAQ)', desc: 'Answers on BNCC membership, training commitment, and platoon activities', path: '/about#faq', icon: HelpCircle },
    { type: 'Spotlight', title: 'Cadet of the Semester Spotlight', desc: 'Featured cadet achievements, leadership citation & voluntary service contributions', path: '/', icon: Star },
    { type: 'Leaderboard', title: 'Cadet Leaderboard & Merit Roll', desc: 'Rankings based on training drill hours and community service participation in Firestore', path: '/dashboard', icon: Award },
    { type: 'Portal', title: 'Cadet Member Dashboard', desc: 'Training syllabus progress, assigned duties, and personal ID dossier', path: '/dashboard', icon: UserCheck },
    { type: 'Admin', title: 'Platoon Officer Admin Portal', desc: 'Post urgent announcements, manage events & update ticker notices', path: '/admin', icon: ShieldAlert },
  ];

  const filteredStatic = lowerQuery
    ? staticLinks.filter(
        (s) =>
          s.title.toLowerCase().includes(lowerQuery) ||
          s.desc.toLowerCase().includes(lowerQuery)
      )
    : staticLinks;

  const totalResults = [
    ...matchingBenefits,
    ...matchingGuidelines,
    ...matchingPolicies,
    ...matchingEvents,
    ...filteredStatic,
  ];

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-4 py-3.5">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder={isBn ? 'নির্দেশিকা, সুবিধা, প্যারেডের সময়সূচি ও নীতিমালা খুঁজুন...' : 'Search guidelines, benefits, drill schedule, policies...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              {isBn ? 'মুছুন' : 'Clear'}
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs uppercase"
          >
            <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">ESC</span>
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {totalResults.length > 0 ? (
            totalResults.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={`${item.title}-${index}`}
                  onClick={() => handleSelect(item.path)}
                  className="w-full text-left flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
                >
                  <div className="mt-0.5 rounded p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-red-50 group-hover:text-red-600 dark:group-hover:bg-red-950/60 dark:group-hover:text-red-400 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-600 dark:text-slate-400">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0" />
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {isBn
                ? `"${query}" এর জন্য কোনো ক্যাডেট নির্দেশিকা, নীতিমালা বা ইভেন্ট পাওয়া যায়নি।`
                : `No matching cadet directives, policies or events found for "${query}".`}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-4 py-2 text-[11px] text-slate-500 flex items-center justify-between">
          <span>{isBn ? 'পোর্টাল নীতিমালা ও সময়সূচি অনুসন্ধান' : 'Search portal directives & schedules'}</span>
          <span className="font-mono">{isBn ? 'বন্ধ করতে ESC চাপুন' : 'Press ESC to close'}</span>
        </div>
      </div>
    </div>
  );
};
