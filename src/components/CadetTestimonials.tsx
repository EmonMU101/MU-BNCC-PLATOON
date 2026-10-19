import React, { useState, useEffect } from 'react';
import {
  Quote,
  CheckCircle2,
  Award,
  ChevronRight,
  ChevronLeft,
  Send,
  X,
  Shield,
  MessageSquare,
  UserCheck,
  LayoutGrid,
  SlidersHorizontal,
  Flame,
  User,
  Medal,
  Briefcase,
  Heart,
  Sparkles,
} from 'lucide-react';
import { CADET_TESTIMONIALS, TestimonialItem } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';
import { createStory } from '../services/cadetPortalService';
import { sanitizeText, sanitizeUrl } from '../lib/sanitize';

interface CadetTestimonialsProps {
  onOpenApply?: () => void;
  className?: string;
  spotlightOnly?: boolean;
}

// Avatar Placeholder component with rank indicator and image error handling
const CadetAvatar: React.FC<{
  src: string;
  name: string;
  rank: string;
  isVisitor?: boolean;
  size?: 'md' | 'lg';
}> = ({ src, name, rank, isVisitor, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);

  // Derive initials for avatar placeholder
  const getInitials = (fullName: string) => {
    const parts = fullName
      .replace(/^(Cadet|CUO|C\/SGT|C\/CPL|C\/LCPL|Former|Dr\.|Prof\.|Mr\.|Ms\.)\s+/i, '')
      .trim()
      .split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const getRankShort = (rankStr: string) => {
    if (isVisitor || rankStr.includes('Visitor') || rankStr.includes('Supporter') || rankStr.includes('Community')) return 'VOICE';
    if (rankStr.includes('Under Officer') || rankStr.includes('CUO')) return 'CUO';
    if (rankStr.includes('Sergeant') || rankStr.includes('C/SGT')) return 'SGT';
    if (rankStr.includes('Corporal') || rankStr.includes('C/CPL')) return 'CPL';
    if (rankStr.includes('Lance') || rankStr.includes('C/LCPL')) return 'LCPL';
    return 'CDT';
  };

  const isLarge = size === 'lg';

  return (
    <div
      className={`relative rounded-2xl overflow-hidden shrink-0 border-2 ${
        isVisitor
          ? 'border-teal-500/50 dark:border-teal-400/50'
          : 'border-red-600/30 dark:border-red-500/40'
      } shadow-md ${
        isLarge ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-14 h-14'
      }`}
    >
      {!imgError && src ? (
        <img
          src={src}
          alt={`${name} avatar`}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        /* Military or Community Avatar Placeholder */
        <div
          className={`w-full h-full ${
            isVisitor
              ? 'bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950'
              : 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950'
          } flex flex-col items-center justify-center text-white p-1`}
        >
          <User className={`${isLarge ? 'w-10 h-10' : 'w-6 h-6'} text-slate-300`} />
          <span
            className={`font-mono font-extrabold text-[10px] tracking-wider ${
              isVisitor ? 'text-teal-400' : 'text-red-400'
            }`}
          >
            {getInitials(name)}
          </span>
        </div>
      )}

      {/* Cadet Rank or Community Badge Overlay */}
      <span
        className={`absolute bottom-0 inset-x-0 ${
          isVisitor ? 'bg-teal-700/95 text-teal-50' : 'bg-red-700/90 text-white'
        } font-mono font-bold uppercase text-center backdrop-blur-xs tracking-wider ${
          isLarge ? 'text-[10px] py-1' : 'text-[9px] py-0.5'
        }`}
      >
        {getRankShort(rank)}
      </span>
    </div>
  );
};

const PROFESSIONS_LIST = [
  { id: 'Student', en: 'Student (University / College)', bn: 'শিক্ষার্থী (বিশ্ববিদ্যালয় / কলেজ)' },
  { id: 'Software Engineer', en: 'Software Engineer / IT Professional', bn: 'সফটওয়্যার প্রকৌশলী / আইটি' },
  { id: 'Teacher / Professor', en: 'Teacher / Professor / Academic', bn: 'শিক্ষক / অধ্যাপক / শিক্ষাবিদ' },
  { id: 'Doctor / Healthcare', en: 'Doctor / Medical Professional', bn: 'চিকিৎসক / স্বাস্থ্যকর্মী' },
  { id: 'Banker / Finance', en: 'Banker / Finance Professional', bn: 'ব্যাংকার / অর্থ বিভাগ' },
  { id: 'Armed Forces / Police', en: 'Armed Forces / Police / Defense Personnel', bn: 'প্রতিরক্ষা ও পুলিশ বাহিনী' },
  { id: 'Government Official', en: 'Government Official / Civil Service', bn: 'সরকারি কর্মকর্তা' },
  { id: 'Lawyer / Legal', en: 'Lawyer / Legal Professional', bn: 'আইনজীবী / আইনবিদ' },
  { id: 'Journalist / Media', en: 'Journalist / Media Professional', bn: 'সাংবাদিক / গণমাধ্যম' },
  { id: 'Business / Entrepreneur', en: 'Businessperson / Entrepreneur', bn: 'ব্যবসায়ী / উদ্যোক্তা' },
  { id: 'NGO / Social Worker', en: 'NGO / Social Worker', bn: 'এনজিও / সমাজকর্মী' },
  { id: 'Ex-Cadet / Alumni', en: 'Ex-Cadet / Alumni Veteran', bn: 'প্রাক্তন ক্যাডেট / অ্যালামনাই' },
  { id: 'Active Cadet', en: 'Active BNCC Cadet', bn: 'বর্তমান বিএনসিসি ক্যাডেট' },
  { id: 'Defense & BNCC Aspirant', en: 'Defense & BNCC Aspirant', bn: 'প্রতিরক্ষা ও বিএনসিসি প্রত্যাশী' },
  { id: 'Freelancer / Creative', en: 'Freelancer / Creative Professional', bn: 'ফ্রিল্যান্সার / ক্রিয়েটিভ' },
  { id: 'Homemaker', en: 'Homemaker', bn: 'গৃহিণী' },
  { id: 'Other', en: 'Other Profession', bn: 'অন্যান্য পেশা' },
];

const STORY_AVATARS = [
  {
    id: 'av-1',
    name: 'Professional',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'av-2',
    name: 'Scholar',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'av-3',
    name: 'Student',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'av-4',
    name: 'Friend',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'av-5',
    name: 'Leader',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  },
];

export const CadetTestimonials: React.FC<CadetTestimonialsProps> = ({
  onOpenApply,
  className = '',
  spotlightOnly = false,
}) => {
  const { isBn, t } = useLanguage();
  const [layoutMode, setLayoutMode] = useState<'carousel' | 'grid'>('carousel');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [testimonialsList, setTestimonialsList] = useState<TestimonialItem[]>(CADET_TESTIMONIALS);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    userType: 'visitor' as 'visitor' | 'cadet',
    profession: 'Student',
    customProfession: '',
    organization: '',
    rank: 'Cadet (C/CDT)',
    department: '',
    batch: '',
    category: 'Community & Visitors' as TestimonialItem['category'],
    quote: '',
    keyTakeaway: '',
    honorOrAchievement: '',
    avatarUrl: STORY_AVATARS[0].url,
  });

  const categories = [
    'All',
    'Community & Visitors',
    'Senior NCOs',
    'Female Cadets Wing',
    'Intake 2025–26',
    'Alumni & Officers',
  ];

  const filteredTestimonials = testimonialsList.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  // Reset carousel index when category changes
  useEffect(() => {
    setCarouselIndex(0);
  }, [selectedCategory]);

  // Auto-advance carousel every 6 seconds, pausing on hover
  useEffect(() => {
    if (layoutMode !== 'carousel' || isPaused || filteredTestimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev < filteredTestimonials.length - 1 ? prev + 1 : 0));
    }, 6000);

    return () => clearInterval(interval);
  }, [layoutMode, isPaused, filteredTestimonials.length]);

  const featuredCadet = testimonialsList.find((item) => item.isFeatured) || testimonialsList[0];

  const handlePrev = () => {
    setCarouselIndex((prev) => (prev > 0 ? prev - 1 : filteredTestimonials.length - 1));
  };

  const handleNext = () => {
    setCarouselIndex((prev) => (prev < filteredTestimonials.length - 1 ? prev + 1 : 0));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawName = formData.name.trim();
    const rawQuote = formData.quote.trim();
    if (!rawName || !rawQuote) return;

    const isVisitor = formData.userType === 'visitor';
    const rawProfession =
      formData.profession === 'Other' && formData.customProfession.trim()
        ? formData.customProfession.trim()
        : formData.profession;

    // Strict sanitization against XSS & script injection
    const sanitizedName = sanitizeText(rawName, { maxLength: 100, allowMultiline: false });
    const sanitizedProfession = sanitizeText(rawProfession, { maxLength: 80, allowMultiline: false });
    const sanitizedQuote = sanitizeText(rawQuote, { maxLength: 1500, allowMultiline: true });
    const sanitizedOrg = sanitizeText(formData.organization, { maxLength: 120, allowMultiline: false });
    const sanitizedDept = sanitizeText(formData.department, { maxLength: 100, allowMultiline: false });
    const sanitizedBatch = sanitizeText(formData.batch, { maxLength: 50, allowMultiline: false });
    const sanitizedKeyTakeaway = sanitizeText(formData.keyTakeaway, { maxLength: 300, allowMultiline: false });
    const sanitizedHonor = sanitizeText(formData.honorOrAchievement, { maxLength: 300, allowMultiline: false });
    const sanitizedAvatarUrl = sanitizeUrl(formData.avatarUrl) || STORY_AVATARS[0].url;

    const displayRank = isVisitor
      ? sanitizedProfession
      : sanitizeText(formData.rank || 'Cadet', { maxLength: 60, allowMultiline: false });

    const displayDepartment =
      sanitizedOrg ||
      (isVisitor ? 'Community Supporter' : sanitizedDept || 'Metropolitan University');

    const newTestimonial: TestimonialItem = {
      id: `user-${Date.now()}`,
      name: sanitizedName,
      rank: displayRank,
      profession: sanitizedProfession,
      isVisitor: isVisitor,
      department: displayDepartment,
      batch: isVisitor ? 'Community Voice' : (sanitizedBatch || 'Current Batch'),
      intake: isVisitor ? 'Community Contributor' : 'Active Cadet',
      category: isVisitor ? 'Community & Visitors' : formData.category,
      quote: sanitizedQuote,
      keyTakeaway:
        sanitizedKeyTakeaway ||
        (isVisitor ? `Reflections shared by ${sanitizedName}` : 'Exemplary dedication to platoon discipline.'),
      honorOrAchievement:
        sanitizedHonor ||
        (isVisitor ? `${sanitizedProfession} · Community Voice` : 'Verified MU BNCC Platoon Member'),
      avatarUrl: sanitizedAvatarUrl,
      serviceYears: isVisitor ? 'Community Voice' : 'Active Platoon Cadet',
      isFeatured: false,
    };

    setTestimonialsList([newTestimonial, ...testimonialsList]);

    // Persist to Firebase Firestore cadet_stories
    try {
      await createStory({
        authorName: sanitizedName,
        authorRank: displayRank,
        authorRole: isVisitor ? 'Site Visitor / Community' : 'Cadet',
        authorProfession: sanitizedProfession,
        authorInstitution: sanitizedOrg || undefined,
        authorAvatar: sanitizedAvatarUrl,
        content: sanitizedQuote,
        cadetId: isVisitor ? 'COMMUNITY' : 'CADET',
      });
    } catch (err) {
      console.warn('Could not persist story to Firestore:', err);
    }

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsSubmitModalOpen(false);
      setFormData({
        name: '',
        userType: 'visitor',
        profession: 'Student',
        customProfession: '',
        organization: '',
        rank: 'Cadet (C/CDT)',
        department: '',
        batch: '',
        category: 'Community & Visitors',
        quote: '',
        keyTakeaway: '',
        honorOrAchievement: '',
        avatarUrl: STORY_AVATARS[0].url,
      });
    }, 2200);
  };

  if (spotlightOnly) {
    if (!featuredCadet) return null;
    return (
      <section className={`space-y-6 ${className}`}>
        {/* Featured Cadet Spotlight Banner */}
        <div className="rounded-3xl border border-red-200/60 dark:border-red-950/80 bg-gradient-to-br from-red-50/40 via-white to-amber-50/20 dark:from-red-950/20 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-red-600/5 dark:bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                <Flame className="w-4 h-4 fill-red-600 text-red-600" />
                <span>
                  {isBn ? 'স্পটলাইট প্রতিক্রিয়া · ' : 'Spotlight Reflection · '}
                  {isBn ? (featuredCadet.categoryBn || featuredCadet.category) : featuredCadet.category}
                </span>
              </div>

              <blockquote className="font-heading text-xl sm:text-2xl md:text-3xl font-bold uppercase text-slate-950 dark:text-white leading-tight">
                "{isBn ? (featuredCadet.quoteBn || featuredCadet.quote) : featuredCadet.quote}"
              </blockquote>

              {/* Cadet Name & Rank Details */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400 font-sans">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {isBn ? (featuredCadet.nameBn || featuredCadet.name) : featuredCadet.name}
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="font-mono text-red-600 dark:text-red-400 font-bold uppercase">
                  {isBn ? (featuredCadet.rankBn || featuredCadet.rank) : featuredCadet.rank}
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span>{isBn ? (featuredCadet.departmentBn || featuredCadet.department) : featuredCadet.department}</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="font-mono">{isBn ? (featuredCadet.batchBn || featuredCadet.batch) : featuredCadet.batch}</span>
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 font-mono">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{isBn ? (featuredCadet.honorOrAchievementBn || featuredCadet.honorOrAchievement) : featuredCadet.honorOrAchievement}</span>
              </div>
            </div>

            {/* Avatar Placeholder with Rank Badge */}
            <div className="shrink-0 flex flex-col items-center sm:items-start lg:items-center text-center gap-3">
              <CadetAvatar
                src={featuredCadet.avatarUrl}
                name={isBn ? (featuredCadet.nameBn || featuredCadet.name) : featuredCadet.name}
                rank={isBn ? (featuredCadet.rankBn || featuredCadet.rank) : featuredCadet.rank}
                size="lg"
              />
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                {isBn ? (featuredCadet.serviceYearsBn || featuredCadet.serviceYears) : featuredCadet.serviceYears}
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`space-y-10 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
            <Shield className="w-3.5 h-3.5" />
            <span>{isBn ? 'ক্যাডেট অনুভূতি ও অভিজ্ঞতা' : 'Cadet Reflections & Community Voice'}</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white mt-1">
            {isBn ? 'ক্যাডেটদের অভিজ্ঞতা ও কণ্ঠস্বর' : 'Voices From The Ranks'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-1.5 leading-relaxed">
            {isBn
              ? 'এমইউ বিএনসিসির বর্তমান ক্যাডেট, সিনিয়র এনসিও এবং প্রাক্তন ক্যাডেটদের শৃঙ্খলা, নেতৃত্ব ও মানসিক পরিবর্তনের বাস্তব অভিজ্ঞতা।'
              : 'Real testimonies and personal transformation stories from current MU BNCC cadets, non-commissioned officers, and alumni veterans.'}
          </p>
        </div>

        {/* Layout Toggle & Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Carousel vs Grid View Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setLayoutMode('carousel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                layoutMode === 'carousel'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Carousel Mode"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isBn ? 'ক্যারোজল' : 'Carousel'}</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                layoutMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{isBn ? 'গ্রিড ভিউ' : 'Grid'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-red-600 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isBn ? 'আপনার অনুভূতি' : 'Share Your'}</span>
            <span>{isBn ? 'শেয়ার করুন' : 'Story'}</span>
          </button>
        </div>
      </div>

      {/* Featured Cadet Spotlight Banner */}
      {featuredCadet && (
        <div className="rounded-3xl border border-red-200/60 dark:border-red-950/80 bg-gradient-to-br from-red-50/40 via-white to-amber-50/20 dark:from-red-950/20 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-red-600/5 dark:bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                <Flame className="w-4 h-4 fill-red-600 text-red-600" />
                <span>
                  {isBn ? 'স্পটলাইট প্রতিক্রিয়া · ' : 'Spotlight Reflection · '}
                  {isBn ? (featuredCadet.categoryBn || featuredCadet.category) : featuredCadet.category}
                </span>
              </div>

              <blockquote className="font-heading text-xl sm:text-2xl md:text-3xl font-bold uppercase text-slate-950 dark:text-white leading-tight">
                "{isBn ? (featuredCadet.quoteBn || featuredCadet.quote) : featuredCadet.quote}"
              </blockquote>

              {/* Cadet Name & Rank Details */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400 font-sans">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {isBn ? (featuredCadet.nameBn || featuredCadet.name) : featuredCadet.name}
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="font-mono text-red-600 dark:text-red-400 font-bold uppercase">
                  {isBn ? (featuredCadet.rankBn || featuredCadet.rank) : featuredCadet.rank}
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span>{isBn ? (featuredCadet.departmentBn || featuredCadet.department) : featuredCadet.department}</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="font-mono">{isBn ? (featuredCadet.batchBn || featuredCadet.batch) : featuredCadet.batch}</span>
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 font-mono">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{isBn ? (featuredCadet.honorOrAchievementBn || featuredCadet.honorOrAchievement) : featuredCadet.honorOrAchievement}</span>
              </div>
            </div>

            {/* Avatar Placeholder with Rank Badge */}
            <div className="shrink-0 flex flex-col items-center sm:items-start lg:items-center text-center gap-3">
              <CadetAvatar
                src={featuredCadet.avatarUrl}
                name={isBn ? (featuredCadet.nameBn || featuredCadet.name) : featuredCadet.name}
                rank={isBn ? (featuredCadet.rankBn || featuredCadet.rank) : featuredCadet.rank}
                size="lg"
              />
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                {isBn ? (featuredCadet.serviceYearsBn || featuredCadet.serviceYears) : featuredCadet.serviceYears}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Navigation Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {categories.map((cat) => {
            let label = cat;
            if (isBn) {
              if (cat === 'All') label = 'সকল';
              else if (cat === 'Community & Visitors') label = 'কমিউনিটি ও দর্শনার্থী';
              else if (cat === 'Senior NCOs') label = 'সিনিয়র এনসিও';
              else if (cat === 'Female Cadets Wing') label = 'ছাত্রী ক্যাডেট উইং';
              else if (cat === 'Intake 2025–26') label = 'ইনটেক ২০২৫–২৬';
              else if (cat === 'Alumni & Officers') label = 'প্রাক্তন ও কর্মকর্তা';
            }

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  selectedCategory === cat
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Carousel Navigation Arrows & Slide Count (when in carousel mode) */}
        {layoutMode === 'carousel' && filteredTestimonials.length > 1 && (
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs font-mono text-slate-400">
              {carouselIndex + 1} of {filteredTestimonials.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 transition-colors"
                aria-label="Previous testimony"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 transition-colors"
                aria-label="Next testimony"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. CAROUSEL LAYOUT MODE */}
      {/* ======================================================== */}
      {layoutMode === 'carousel' && (
        <div
          className="relative space-y-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {filteredTestimonials.length > 0 && (
            <div className="overflow-hidden">
              <div
                className="transition-transform duration-500 ease-out flex"
                style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
              >
                {filteredTestimonials.map((item) => {
                  const isVisitorItem =
                    item.isVisitor || !!item.profession || item.category === 'Community & Visitors';

                  return (
                    <div key={item.id} className="w-full shrink-0 px-1">
                      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-8 hover:border-red-500/40 transition-colors">
                        <div className="space-y-5 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 shrink-0">
                              <Quote className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                              {isBn ? (item.categoryBn || item.category) : item.category}
                            </span>
                            {isVisitorItem && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                                <Heart className="w-2.5 h-2.5 text-teal-500 fill-teal-500" />
                                {isBn ? 'কমিউনিটি কণ্ঠস্বর' : 'Community Voice'}
                              </span>
                            )}
                          </div>

                          <blockquote className="font-heading text-xl sm:text-2xl font-bold uppercase text-slate-950 dark:text-white leading-relaxed">
                            "{isBn ? (item.quoteBn || item.quote) : item.quote}"
                          </blockquote>

                          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 space-y-1 max-w-xl">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block">
                              {isBn ? 'মূল শিক্ষা ও উপলব্ধি:' : 'Core Reflection / Takeaway:'}
                            </span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {isBn ? (item.keyTakeawayBn || item.keyTakeaway) : item.keyTakeaway}
                            </span>
                          </div>
                        </div>

                        {/* Profile with Avatar, Name, and Profession / Rank */}
                        <div className="shrink-0 flex flex-col items-center md:items-end text-center md:text-right gap-3 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-8 w-full md:w-auto">
                          <CadetAvatar
                            src={item.avatarUrl}
                            name={isBn ? (item.nameBn || item.name) : item.name}
                            rank={isBn ? (item.rankBn || item.rank) : item.rank}
                            isVisitor={isVisitorItem}
                            size="lg"
                          />

                          <div>
                            <h4 className="font-heading text-lg font-bold uppercase text-slate-900 dark:text-white">
                              {isBn ? (item.nameBn || item.name) : item.name}
                            </h4>

                            {item.profession ? (
                              <div className="flex items-center justify-center md:justify-end gap-1.5 mt-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-[11px] font-bold text-teal-700 dark:text-teal-300">
                                  <Briefcase className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                                  {isBn ? (item.professionBn || item.profession) : item.profession}
                                </span>
                              </div>
                            ) : (
                              <div className="text-xs font-mono font-bold text-red-600 dark:text-red-400 uppercase mt-0.5">
                                {isBn ? (item.rankBn || item.rank) : item.rank}
                              </div>
                            )}

                            <div className="text-xs text-slate-500 mt-1">
                              {isBn ? (item.departmentBn || item.department) : item.department}
                              {!item.isVisitor && item.batch && ` · ${isBn ? (item.batchBn || item.batch) : item.batch}`}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                            <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{isBn ? (item.honorOrAchievementBn || item.honorOrAchievement) : item.honorOrAchievement}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Carousel Pagination Dots */}
          {filteredTestimonials.length > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              {filteredTestimonials.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCarouselIndex(dotIdx)}
                  className={`h-2 rounded-full transition-all ${
                    carouselIndex === dotIdx
                      ? 'w-8 bg-red-600'
                      : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                  }`}
                  aria-label={`Jump to slide ${dotIdx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. GRID LAYOUT MODE */}
      {/* ======================================================== */}
      {layoutMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {filteredTestimonials.map((item) => {
            const isVisitorItem =
              item.isVisitor || !!item.profession || item.category === 'Community & Visitors';

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 hover:border-red-500/40 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                      <Quote className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isVisitorItem && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                          <Heart className="w-2.5 h-2.5 text-teal-500 fill-teal-500" />
                          {isBn ? 'কমিউনিটি' : 'Community'}
                        </span>
                      )}
                      <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                        {isBn ? (item.categoryBn || item.category) : item.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans italic">
                    "{isBn ? (item.quoteBn || item.quote) : item.quote}"
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block">
                      {isBn ? 'মূল উপলব্ধি:' : 'Core Reflection:'}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {isBn ? (item.keyTakeawayBn || item.keyTakeaway) : item.keyTakeaway}
                    </span>
                  </div>
                </div>

                {/* Profile Avatar, Name, and Profession / Rank */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-3">
                    <CadetAvatar
                      src={item.avatarUrl}
                      name={isBn ? (item.nameBn || item.name) : item.name}
                      rank={isBn ? (item.rankBn || item.rank) : item.rank}
                      isVisitor={isVisitorItem}
                      size="md"
                    />

                    <div className="min-w-0 flex-1">
                      <h4 className="font-heading text-base font-bold uppercase text-slate-900 dark:text-white truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {isBn ? (item.nameBn || item.name) : item.name}
                      </h4>

                      {item.profession ? (
                        <div className="flex items-center gap-1 mt-0.5 truncate">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-[10px] font-bold text-teal-700 dark:text-teal-300 truncate">
                            <Briefcase className="w-2.5 h-2.5 shrink-0 text-teal-600 dark:text-teal-400" />
                            <span className="truncate">{isBn ? (item.professionBn || item.profession) : item.profession}</span>
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11px] font-mono font-bold text-red-600 dark:text-red-400 uppercase truncate">
                          {isBn ? (item.rankBn || item.rank) : item.rank}
                        </div>
                      )}

                      <div className="text-[11px] text-slate-500 font-sans truncate mt-0.5">
                        {isBn ? (item.departmentBn || item.department) : item.department}
                        {!item.isVisitor && item.batch && ` · ${isBn ? (item.batchBn || item.batch) : item.batch}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 truncate">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{isBn ? (item.honorOrAchievementBn || item.honorOrAchievement) : item.honorOrAchievement}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Community Encouragement Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-heading text-lg font-bold uppercase text-slate-900 dark:text-white">
              {t('testimonials.ctaTitle') || (isBn ? 'নিজের ক্যাডেট গল্প রচনায় অনুপ্রাণিত?' : 'Inspired to write your own cadet story?')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('testimonials.ctaSubtitle') || (isBn ? 'সকল একাডেমিক বিভাগের নিয়মিত শিক্ষার্থীদের জন্য ভর্তি প্রক্রিয়া উন্মুক্ত রয়েছে।' : 'Recruitment is open for regular students across all academic departments.')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenApply}
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
        >
          <span>{t('testimonials.ctaButton') || (isBn ? 'ক্যাডেট বাহিনীতে যুক্ত হোন' : 'Step Into The Ranks')}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modal: Share Story (Open to Everyone - Visitors & Cadets Alike) */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4 shadow-sm text-slate-900 dark:text-white max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400 block">
                    {isBn ? 'সবার জন্য উন্মুক্ত প্ল্যাটফর্ম' : 'Open Community Platform'}
                  </span>
                  <h3 className="font-heading text-lg sm:text-xl font-bold uppercase mt-0.5">
                    {isBn ? 'বিএনসিসি সম্পর্কে আপনার গল্প শেয়ার করুন' : 'Share Your Story About BNCC'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explanatory Visitor Welcome Banner */}
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Heart className="w-4 h-4 text-red-500 fill-red-500 shrink-0 mt-0.5" />
              <span>
                {isBn ? (
                  <>
                    <strong>ক্যাডেট হওয়ার প্রয়োজন নেই:</strong> যেকোনো দর্শনার্থী, শিক্ষার্থী, অভিভাবক, শিক্ষক কিংবা শুভাকাঙ্ক্ষী নিজেদের নাম ও বর্তমান পেশা বেছে নিয়ে মুক্তভাবে অনুভূতি বা গল্প শেয়ার করতে পারেন!
                  </>
                ) : (
                  <>
                    <strong>You don't need to be a cadet:</strong> Any visitor, university student, teacher, alumnus, or supporter can identify themselves with their name & current profession to share their story about BNCC!
                  </>
                )}
              </span>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="inline-flex p-3 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-heading text-xl font-bold uppercase">
                  {isBn ? 'আপনার গল্প সফলভাবে প্রকাশিত হয়েছে!' : 'Story Published Successfully!'}
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {isBn
                    ? 'আপনার গল্পটি হোমপেজ ও বিএনসিসি কমিউনিটি ফিডে যুক্ত হয়েছে। সবাইকে অনুপ্রাণিত করার জন্য ধন্যবাদ!'
                    : 'Your story has been featured in the reflections feed. Thank you for inspiring our community!'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
                {/* User Type Selector */}
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {isBn ? 'আপনার পরিচয় নির্বাচন করুন *' : 'Select Your Identity *'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, userType: 'visitor', category: 'Community & Visitors' })}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                        formData.userType === 'visitor'
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-teal-500'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>{isBn ? 'দর্শনার্থী / শুভাকাঙ্ক্ষী' : 'Visitor / Supporter'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, userType: 'cadet', category: 'Intake 2025–26' })}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                        formData.userType === 'cadet'
                          ? 'bg-red-700 text-white border-red-700 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-red-500'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>{isBn ? 'ক্যাডেট / প্রাক্তন ক্যাডেট' : 'Cadet / Veteran'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {isBn ? 'আপনার পূর্ণ নাম *' : 'Your Full Name *'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder={isBn ? 'উদা: সাদিয়া চৌধুরী' : 'e.g. Sadia Chowdhury'}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                  </div>

                  {/* CURRENT PROFESSION FIELD (Core Requirement) */}
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {isBn ? 'আপনার বর্তমান পেশা *' : 'Current Profession *'}
                    </label>
                    <select
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      {PROFESSIONS_LIST.map((p) => (
                        <option key={p.id} value={p.id}>
                          {isBn ? p.bn : p.en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.profession === 'Other' && (
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {isBn ? 'আপনার পেশা নির্দিষ্ট করুন *' : 'Specify Your Profession *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isBn ? 'উদা: স্থপতি / আলোকচিত্রী / ফ্রিল্যান্সার' : 'e.g. Architect / Photographer / Consultant'}
                      value={formData.customProfession}
                      onChange={(e) => setFormData({ ...formData, customProfession: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {isBn ? 'প্রতিষ্ঠান / কর্মস্থল / বিশ্ববিদ্যালয়' : 'Institution / Workplace / University'}
                    </label>
                    <input
                      type="text"
                      placeholder={isBn ? 'উদা: মেট্রোপলিটন ইউনিভার্সিটি / গ্রামীণফোন' : 'e.g. Metropolitan University / Tech Firm'}
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>

                  {formData.userType === 'cadet' ? (
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                        {isBn ? 'পদবী / পদমর্যাদা' : 'Rank / Position'}
                      </label>
                      <input
                        type="text"
                        placeholder={isBn ? 'উদা: ক্যাডেট কর্পোরাল' : 'e.g. Cadet Corporal'}
                        value={formData.rank}
                        onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                        {isBn ? 'কমিউনিটি ট্যাগ' : 'Community Tag'}
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as TestimonialItem['category'] })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 font-semibold"
                      >
                        <option value="Community & Visitors">{isBn ? 'কমিউনিটি ও দর্শনার্থী' : 'Community & Visitors'}</option>
                        <option value="Alumni & Officers">{isBn ? 'প্রাক্তন ও কর্মকর্তা' : 'Alumni & Officers'}</option>
                        <option value="Senior NCOs">{isBn ? 'সিনিয়র এনসিও' : 'Senior NCOs'}</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'প্রোফাইল অবতার নির্বাচন করুন' : 'Choose Your Display Avatar'}
                  </label>
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {STORY_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarUrl: av.url })}
                        className={`p-1 rounded-full border-2 transition-all shrink-0 ${
                          formData.avatarUrl === av.url
                            ? 'border-red-600 scale-105 shadow-md ring-2 ring-red-400/40'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={av.url}
                          alt={av.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Story Content */}
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'বিএনসিসি সম্পর্কে আপনার গল্প বা অনুভূতি *' : 'Your Story, Reflection or Memory About BNCC *'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder={
                      isBn
                        ? 'মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসির ড্রিল দেখা, কুচকাওয়াজ, রক্তদান কার্যক্রম, বন্যার্তদের সাহায্য কিংবা আপনার ব্যক্তিগত অভিজ্ঞতা ও শ্রদ্ধা প্রকাশ করুন...'
                        : 'Share your memory of seeing the platoon in action, drill discipline, disaster relief, national days, or what BNCC means to you...'
                    }
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'প্রধান শিক্ষা বা বার্তা (ঐচ্ছিক)' : 'Key Takeaway / Inspiring Thought (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      isBn
                        ? 'উদা: তরুণ প্রজন্মের দেশপ্রেম ও শৃঙ্খলার অনন্য উদাহরণ'
                        : 'e.g. Unmatched discipline and patriotic youth leadership'
                    }
                    value={formData.keyTakeaway}
                    onChange={(e) => setFormData({ ...formData, keyTakeaway: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isBn ? 'গল্প প্রকাশ করুন' : 'Share Story'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default CadetTestimonials;
