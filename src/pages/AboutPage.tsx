import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Award,
  BookOpen,
  Calendar,
  Users,
  Compass,
  ArrowRight,
  Flame,
  CheckCircle2,
  Building,
  GraduationCap,
  Languages,
  Search,
  Filter,
  Star,
  Medal,
  CalendarCheck,
  Network,
  UserCheck,
  Flag,
} from 'lucide-react';
import { BnccCrest } from '../components/BnccCrest';
import { FaqAccordion } from '../components/FaqAccordion';
import { CADETS_LIST, PLATOON_STATS_DATA, MAJOR_ACTIVITIES, Cadet } from '../data/cadetsData';
import {
  CadetProfileData,
  subscribeVerifiedCadets,
  sortCadetsByHierarchy,
} from '../services/cadetPortalService';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';

export const AboutPage: React.FC = () => {
  const { language, toggleLanguage, isBn, t } = useLanguage();
  const lang = language;
  const [searchCadet, setSearchCadet] = useState('');
  const [rankFilter, setRankFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'cadet' | 'excadet'>('all');
  const [verifiedCadets, setVerifiedCadets] = useState<CadetProfileData[]>([]);

  // Subscribe to live verified cadets from database
  useEffect(() => {
    const unsubscribe = subscribeVerifiedCadets((list) => {
      setVerifiedCadets(list);
    });
    return () => unsubscribe();
  }, []);

  // Filtered Verified Cadets (already sorted by Rank Hierarchy and Cadet ID)
  const filteredCadets = verifiedCadets.filter((cadet) => {
    const q = searchCadet.toLowerCase();
    const matchesSearch =
      cadet.fullName.toLowerCase().includes(q) ||
      cadet.cadetId.toLowerCase().includes(q) ||
      cadet.department.toLowerCase().includes(q) ||
      cadet.currentRank.toLowerCase().includes(q) ||
      cadet.currentSemester.toLowerCase().includes(q) ||
      cadet.bloodGroup.toLowerCase().includes(q);

    const matchesRank =
      rankFilter === 'All'
        ? true
        : rankFilter === 'Under Officer'
        ? cadet.currentRank.toLowerCase().includes('under officer')
        : rankFilter === 'Sergeant'
        ? cadet.currentRank.toLowerCase().includes('sergeant')
        : rankFilter === 'Corporal'
        ? cadet.currentRank.toLowerCase().includes('corporal') && !cadet.currentRank.toLowerCase().includes('lance')
        : rankFilter === 'Lance Corporal'
        ? cadet.currentRank.toLowerCase().includes('lance corporal')
        : rankFilter === 'Cadet'
        ? cadet.currentRank.trim() === 'Cadet'
        : cadet.currentRank === rankFilter;

    const matchesCategory =
      categoryFilter === 'all'
        ? true
        : categoryFilter === 'excadet'
        ? cadet.cadetType === 'excadet'
        : cadet.cadetType !== 'excadet';

    return matchesSearch && matchesRank && matchesCategory;
  });

  return (
    <div className="space-y-16 pb-20">
      <SEOHead
        title="About Us | Platoon History, Cadets & Leadership"
        titleBn="আমাদের সম্পর্কে | প্লাটুন ইতিহাস, ক্যাডেট ও নেতৃত্ব"
        description="Learn about Metropolitan University BNCC Platoon under 7 BNCC Battalion & Moinamati Regiment. Explore platoon history, parade commanders, ranks roster, and FAQ."
        descriptionBn="৭ বিএনসিসি ব্যাটালিয়ন ও ময়নামতি রেজিমেন্টের অধীনে মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুনের ইতিহাস, পদমর্যাদা কাঠামো, ক্যাডেট রোস্টার ও প্রশ্নোত্তর।"
        path="/about"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'About Metropolitan University BNCC Platoon',
          description: 'Official history, leadership structure, and cadet roster of MU BNCC Platoon.',
          publisher: {
            '@type': 'EducationalOrganization',
            name: 'Metropolitan University BNCC Platoon',
          },
        }}
      />

      {/* Hero Header Banner */}
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 py-12 sm:py-16">
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-4 py-1.5 shadow-xs text-xs font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-red-600" />
            <span>{lang === 'en' ? '7 BNCC Battalion' : '৭ বিএনসিসি ব্যাটালিয়ন'}</span>
            <span className="text-slate-400">·</span>
            <span>{lang === 'en' ? 'Moinamati Regiment' : 'ময়নামতি রেজিমেন্ট'}</span>
            <span className="text-slate-400">·</span>
            <span className="text-red-600 dark:text-red-400 font-bold">{lang === 'en' ? 'ESTD. 4 May 2025' : 'প্রতিষ্ঠিত: ৪ মে ২০২৫'}</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-slate-950 dark:text-white">
            {lang === 'en' ? 'Metropolitan University BNCC Platoon' : 'মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুন'}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            {lang === 'en'
              ? 'A dedicated university cadet fraternity attached to Moinamati Regiment under 7 BNCC Battalion, fostering tactical discipline, military acumen, and civic leadership.'
              : '৭ বিএনসিসি ব্যাটালিয়নের অধীনে ও ময়নামতি রেজিমেন্টের সাথে সংযুক্ত সম্মিলিত প্লাটুন, যা শৃঙ্খলা, সামরিক প্রজ্ঞা ও নেতৃত্বের মাধ্যমে ভবিষ্যৎ নেতৃত্ব গঠনে অঙ্গীকারবদ্ধ।'}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 sm:space-y-20">
        {/* Statistics Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {PLATOON_STATS_DATA.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-xs hover:border-red-500/40 transition-colors"
            >
              <div className="font-heading text-3xl sm:text-4xl font-extrabold text-red-600 dark:text-red-400 tabular-nums mb-1">
                {item.count}
              </div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {lang === 'en' ? item.labelEn : item.labelBn}
              </div>
            </div>
          ))}
        </section>

        {/* Section 1: About the Platoon & Command Structure */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
              {lang === 'en' ? 'Institutional Profile' : 'প্রাতিষ্ঠানিক বিবরণ'}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-slate-900 dark:text-white">
              {lang === 'en' ? 'About Us' : 'আমাদের সম্পর্কে'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* About the Platoon */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    {lang === 'en' ? 'Origins & Growth' : 'উৎপত্তি ও বিকাশ'}
                  </span>
                  <h3 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white">
                    {lang === 'en' ? 'About the Platoon' : 'প্লাটুন সম্পর্কে'}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                <p>
                  {lang === 'en'
                    ? 'Established on 4th of May 2025, the Metropolitan University BNCC Platoon is a combined platoon operating under the 7 BNCC Battalion and attached to the Moinamati Regiment. Since its inception, the platoon has been committed to developing disciplined, knowledgeable, and patriotic young leaders through military training, leadership development, and community engagement.'
                    : '৪ মে ২০২৫ তারিখে প্রতিষ্ঠিত, মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুন ৭ বিএনসিসি ব্যাটালিয়নের অধীনে পরিচালিত এবং ময়নামতি রেজিমেন্টের সাথে সংযুক্ত একটি সম্মিলিত প্লাটুন। প্রতিষ্ঠার পর থেকেই এই প্লাটুন সামরিক প্রশিক্ষণ, নেতৃত্ব বিকাশ এবং সামাজিক সম্পৃক্ততার মাধ্যমে সুশৃঙ্খল, জ্ঞানী এবং দেশপ্রেমিক তরুণ নেতা তৈরিতে প্রতিশ্রুতিবদ্ধ।'}
                </p>
                <p>
                  {lang === 'en'
                    ? 'The platoon began its journey with nearly one hundred applicants, from which only twenty-four cadets were selected through a rigorous recruitment process. What started as a newly formed unit has rapidly grown into a well-structured and highly active platoon, earning recognition at battalion, regimental, and national levels. Guided by the motto "Knowledge & Discipline," the platoon continues to uphold the values of leadership, responsibility, teamwork, and service to the nation.'
                    : 'প্লাটুনটি প্রায় একশত আবেদনকারী নিয়ে যাত্রা শুরু করে, যেখান থেকে কঠোর নিয়োগ প্রক্রিয়ার মাধ্যমে মাত্র চব্বিশজন ক্যাডেট নির্বাচিত হয়। একটি নবগঠিত ইউনিট হিসেবে শুরু হলেও এটি দ্রুত একটি সুগঠিত এবং অত্যন্ত সক্রিয় প্লাটুন হিসেবে বিকশিত হয়েছে। \'জ্ঞান ও শৃঙ্খলা\' মূলমন্ত্রে পরিচালিত এই প্লাটুন নেতৃত্ব, দায়িত্ববোধ, দলবদ্ধ কাজ এবং দেশসেবার মূল্যবোধ সমুন্নত রেখে চলেছে।'}
                </p>
              </div>
            </div>

            {/* The Command Structure */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-3 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400">
                  <Network className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                    {lang === 'en' ? 'Hierarchy & Order' : 'নেতৃত্ব ও শৃঙ্খলা'}
                  </span>
                  <h3 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white">
                    {lang === 'en' ? 'The Command Structure' : 'কমান্ড কাঠামো'}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                <p>
                  {lang === 'en'
                    ? 'The Metropolitan University BNCC Platoon follows a structured leadership hierarchy under the guidance of PUO Abu Yusuf Musa and Army Staff Instructor CPL Jewel. The cadet leadership is headed by Cadet Sergeant Md. Shafiul Alam Chowdhury, supported by three Cadet Corporals—Soleman Hossen Ashik, Shrimoti Pritela Rani Das, and Rahad Ahmed Emon. Assisting them are three Cadet Lance Corporals—Rafat Ahmed Chowdhury, Shahriar Rahman Sakib, and Abdullah Abu Sayad. Together, they lead and mentor the platoon cadets while ensuring discipline, teamwork, and effective execution of all activities and responsibilities.'
                    : 'মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুন পিইউও আবু ইউসুফ মুসা এবং আর্মি স্টাফ ইনস্ট্রাক্টর সিপএল জুয়েলের নির্দেশনায় একটি সুগঠিত নেতৃত্ব কাঠামো অনুসরণ করে। ক্যাডেট নেতৃত্বের শীর্ষে রয়েছেন ক্যাডেট সার্জেন্ট মোঃ শাফিউল আলম চৌধুরী, এবং তাকে সহায়তা করছেন তিনজন ক্যাডেট কর্পোরাল—সোলেমান হোসেন আশিক, শ্রীমতি প্রীতিলা রানী দাস এবং রাহাদ আহমদ ইমন। তাদের সহযোগিতা করছেন তিনজন ক্যাডেট ল্যান্স কর্পোরাল—রাফাত আহমদ চৌধুরী, শাহরিয়ার রহমান সাকিব এবং আব্দুল্লাহ আবু সায়াদ। তারা একত্রে প্লাটুনের ক্যাডেটদের নেতৃত্ব ও দিকনির্দেশনা প্রদান করেন।'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-2 text-xs font-mono">
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-1 text-slate-700 dark:text-slate-300">
                  {lang === 'en' ? 'PUO Abu Yusuf Musa' : 'পিইউও আবু ইউসুফ মুসা'}
                </span>
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-1 text-slate-700 dark:text-slate-300">
                  {lang === 'en' ? 'CPL Jewel (Army Staff)' : 'সিপএল জুয়েল (আর্মি স্টাফ)'}
                </span>
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-1 text-slate-700 dark:text-slate-300">
                  {lang === 'en' ? 'Cadet Sergeant & NCOs' : 'ক্যাডেট সার্জেন্ট ও এনসিওবৃন্দ'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Leadership & Guidance */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
              {lang === 'en' ? 'Officer & Instructor Corps' : 'অফিসার ও ইনস্ট্রাক্টর বৃন্দ'}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-slate-900 dark:text-white">
              {lang === 'en' ? 'Leadership & Guidance' : 'নেতৃত্ব ও নির্দেশনা'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Leader 1: Abu Yusuf Musa */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-3 hover:border-amber-600/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 px-3 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-400 uppercase font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  {lang === 'en' ? 'Current Leadership' : 'বর্তমান নেতৃত্ব'}
                </span>
                <span className="text-xs font-mono text-slate-400">01</span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white">
                  Abu Yusuf Musa
                </h3>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-400 mt-0.5">
                  {lang === 'en' ? 'Professor Under Officer (PUO)' : 'প্রফেসর আন্ডার অফিসার (পিইউও)'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'en' ? 'Lecturer, Department of English' : 'প্রভাষক, ইংরেজি বিভাগ'}
                </p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang === 'en'
                  ? "Abu Yusuf Musa serves as the current Professor Under Officer of the Metropolitan University BNCC Platoon. As the principal coordinator between the university and the Bangladesh National Cadet Corps, he provides strategic guidance, administrative oversight, and mentorship to the cadets. His leadership continues to strengthen the platoon's culture of discipline, responsibility, and excellence. He has completed his BA in 'English for Speakers of other Languages (ESOL)' from Institute of Modern Languages, University of Dhaka, in 2023 and pursued his MA in TESOL from the same institution in 2024. He was involved in the BNCC Army wing under the Ramna Regiment. His last serving designation was LCPL, and he served from 2018-2020 in BNCC Army wing."
                  : 'আবু ইউসুফ মুসা মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুনের বর্তমান প্রফেসর আন্ডার অফিসার হিসেবে দায়িত্ব পালন করছেন। বিশ্ববিদ্যালয় এবং বিএনসিসির মধ্যে প্রধান সমন্বয়কারী হিসেবে তিনি ক্যাডেটদের কৌশলগত দিকনির্দেশনা এবং প্রশাসনিক তত্ত্বাবধান প্রদান করেন। তিনি ২০২৩ সালে ঢাকা বিশ্ববিদ্যালয় থেকে ইএসওএল-এ বিএ এবং ২০২৪ সালে টেসল-এ এমএ সম্পন্ন করেন। ২০১৮-২০২০ সাল পর্যন্ত তিনি রমনা রেজিমেন্টের অধীনে বিএনসিসি সেনা শাখায় ল্যান্স কর্পোরাল হিসেবে যুক্ত ছিলেন।'}
              </p>
            </div>

            {/* Current Leader 2: CORPORAL Jewel */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-3 hover:border-amber-600/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 px-3 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-400 uppercase font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  {lang === 'en' ? 'Current Leadership' : 'বর্তমান নেতৃত্ব'}
                </span>
                <span className="text-xs font-mono text-slate-400">02</span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white">
                  CORPORAL Jewel
                </h3>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-400 mt-0.5">
                  {lang === 'en' ? 'Army Staff Instructor' : 'আর্মি স্টাফ ইনস্ট্রাক্টর'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'en' ? 'BNCC Army Staff' : 'বিএনসিসি আর্মি স্টাফ'}
                </p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang === 'en'
                  ? 'Corporal Jewel serves as the platoon Army Staff Instructor, responsible for conducting military training, drill sessions, field exercises, and discipline development programs. His professional guidance equips cadets with practical skills, confidence, and the ability to perform effectively in various national events and official duties. Through continuous mentorship and training, he helps maintain the high standards of professionalism and discipline that define the Metropolitan University BNCC Platoon.'
                  : 'কর্পোরাল জুয়েল প্লাটুনের আর্মি স্টাফ ইনস্ট্রাক্টর হিসেবে দায়িত্ব পালন করছেন। তিনি সামরিক প্রশিক্ষণ, ড্রিল, মাঠ পর্যায়ের অনুশীলন এবং শৃঙ্খলা উন্নয়ন কর্মসূচী পরিচালনার দায়িত্বে রয়েছেন। তার পেশাদার দিকনির্দেশনা ক্যাডেটদের ব্যবহারিক দক্ষতা এবং আত্মবিশ্বাস অর্জন করতে সাহায্য করে, যা তাদের বিভিন্ন জাতীয় অনুষ্ঠান এবং সরকারি দায়িত্ব পালনে সক্ষম করে তোলে।'}
              </p>
            </div>

            {/* Founding Leader 1: Syeda Nazmur Siha Muna */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-3 opacity-95">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase font-mono">
                  {lang === 'en' ? 'Founding Leadership' : 'প্রতিষ্ঠাতা নেতৃত্ব'}
                </span>
                <span className="text-xs font-mono text-slate-400">{lang === 'en' ? 'Pioneer' : 'অগ্রপথিক'}</span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white">
                  Syeda Nazmur Siha Muna
                </h3>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                  {lang === 'en' ? 'Former Professor Under Officer (PUO)' : 'প্রাক্তন প্রফেসর আন্ডার অফিসার (পিইউও)'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'en' ? 'Lecturer, Department of Law and Justice' : 'প্রভাষক, আইন ও বিচার বিভাগ'}
                </p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang === 'en'
                  ? 'The foundation of the Metropolitan University BNCC Platoon was laid under the leadership of Syeda Nazmur Siha Muna, Lecturer of the Department of Law and Justice. As the founding PUO, she played a pivotal role in establishing the platoon, guiding its early development, and fostering a culture of discipline, commitment, and leadership among the pioneer cadets. Her dedication and vision were instrumental in shaping the identity and values that continue to define the platoon today.'
                  : 'আইন ও বিচার বিভাগের প্রভাষক সৈয়দা নাজমুর সিহা মুনার নেতৃত্বে মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুনের ভিত্তি স্থাপিত হয়। প্রতিষ্ঠাতা পিইউও হিসেবে তিনি প্লাটুন প্রতিষ্ঠা এবং এর প্রাথমিক উন্নয়নে অগ্রণী ভূমিকা পালন করেন। তার নিষ্ঠা এবং দূরদর্শিতা প্লাটুনের পরিচয় এবং মূল্যবোধ গঠনে অত্যন্ত গুরুত্বপূর্ণ ছিল, যা আজও প্লাটুনকে সংজ্ঞায়িত করে।'}
              </p>
            </div>

            {/* Founding Leader 2: SERGEANT Md. Nazrul Islam */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-3 opacity-95">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase font-mono">
                  {lang === 'en' ? 'Founding Leadership' : 'প্রতিষ্ঠাতা নেতৃত্ব'}
                </span>
                <span className="text-xs font-mono text-slate-400">{lang === 'en' ? 'Pioneer' : 'অগ্রপথিক'}</span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white">
                  SERGEANT Md. Nazrul Islam
                </h3>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                  {lang === 'en' ? 'Former Army Staff Instructor' : 'প্রাক্তন আর্মি স্টাফ ইনস্ট্রাক্টর'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'en' ? 'BNCC Army Staff' : 'বিএনসিসি আর্মি স্টাফ'}
                </p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang === 'en'
                  ? 'Sergeant Md. Nazrul Islam served as the founding Army Staff Instructor of the Metropolitan University BNCC Platoon. Through his professional guidance, military training, and unwavering support, he helped transform a newly formed group of cadets into a disciplined and capable unit. His contributions during the formative stages of the platoon played a significant role in building its operational strength and preparing cadets for future success.'
                  : 'সার্জেন্ট মোঃ নজরুল ইসলাম মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুনের প্রতিষ্ঠাতা আর্মি স্টাফ ইনস্ট্রাক্টর হিসেবে দায়িত্ব পালন করেছেন। তার পেশাদার দিকনির্দেশনা এবং নিরন্তর সমর্থনের মাধ্যমে তিনি নবগঠিত ক্যাডেটদের একটি সুশৃঙ্খল এবং সক্ষম ইউনিটে রূপান্তরিত করতে সাহায্য করেছিলেন। প্লাটুনের গঠনমূলক পর্যায়ে তার অবদান এর অপারেশনাল শক্তি বৃদ্ধিতে উল্লেখযোগ্য ভূমিকা পালন করে।'}
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Cadet List / Roster Table */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
                {lang === 'en' ? 'Platoon Roll & Service Roster' : 'প্লাটুন ক্যাডেট রোল ও তালিকা'}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-slate-900 dark:text-white">
                {lang === 'en' ? 'Cadet List' : 'ক্যাডেট তালিকা'}
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-500">
              {lang === 'en'
                ? `Verified Cadets: ${verifiedCadets.length} Active Official Members`
                : `যাচাইকৃত ক্যাডেট: ${verifiedCadets.length} জন (অফিসিয়াল সদস্য)`}
            </div>
          </div>

          {/* Search & Rank Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'en' ? 'Search by name, ID, rank, dept...' : 'নাম, আইডি, পদবি বা বিভাগ খুঁজুন...'}
                value={searchCadet}
                onChange={(e) => setSearchCadet(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Cadet Type Filter Segmented Control */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    categoryFilter === 'all'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'All' : 'সকল'}
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('cadet')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    categoryFilter === 'cadet'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'Cadets' : 'ক্যাডেট'}
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('excadet')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    categoryFilter === 'excadet'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'Ex-Cadets' : 'প্রাক্তন'}
                </button>
              </div>

              {/* Rank Filter */}
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { en: 'All', bn: 'সকল' },
                { en: 'Under Officer', bn: 'আন্ডার অফিসার' },
                { en: 'Sergeant', bn: 'সার্জেন্ট' },
                { en: 'Corporal', bn: 'কর্পোরাল' },
                { en: 'Lance Corporal', bn: 'ল্যান্স কর্পোরাল' },
                { en: 'Cadet', bn: 'ক্যাডেট' },
              ].map((r) => (
                <button
                  key={r.en}
                  onClick={() => setRankFilter(r.en)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    rankFilter === r.en
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  {lang === 'en' ? r.en : r.bn}
                </button>
              ))}
            </div>
          </div>
        </div>

          {/* The Roster Table with Public Masked Fields */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-[11px] font-mono uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold tracking-wider font-mono">
                      {lang === 'en' ? 'Cadet ID' : 'ক্যাডেট আইডি'}
                    </th>
                    <th className="py-3.5 px-4 font-semibold tracking-wider">
                      {lang === 'en'
                        ? (categoryFilter === 'excadet' ? 'Rank' : 'Current Rank')
                        : (categoryFilter === 'excadet' ? 'পদবি' : 'বর্তমান পদবি')}
                    </th>
                    <th className="py-3.5 px-4 font-semibold tracking-wider">
                      {lang === 'en' ? 'Full Name' : 'পূর্ণ নাম'}
                    </th>
                    <th className="py-3.5 px-4 font-semibold tracking-wider">
                      {lang === 'en' ? 'Department' : 'একাডেমিক বিভাগ'}
                    </th>
                    <th className="py-3.5 px-4 font-semibold tracking-wider font-mono">
                      {lang === 'en' ? 'Year: Semester' : 'বছর: সেমিস্টার'}
                    </th>
                    <th className="py-3.5 px-4 font-semibold tracking-wider text-center">
                      {lang === 'en' ? 'Blood Group' : 'রক্তের গ্রুপ'}
                    </th>
                    <th className="py-3.5 px-4 font-semibold tracking-wider text-right">
                      {lang === 'en' ? 'Public Dossier' : 'প্রোফাইল'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredCadets.length > 0 ? (
                    filteredCadets.map((c, i) => (
                      <tr
                        key={c.uid || c.cadetId}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                          i % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-950/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-red-700 dark:text-red-400">
                          <Link
                            to={`/cadet/${c.cadetId}`}
                            className="hover:underline hover:text-red-600 transition-colors"
                            title={lang === 'en' ? 'View Cadet Profile' : 'ক্যাডেট প্রোফাইল দেখুন'}
                          >
                            {c.cadetId}
                          </Link>
                        </td>
                        <td className="py-3 px-4 font-semibold text-amber-800 dark:text-amber-400">
                          {c.currentRank}
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/cadet/${c.cadetId}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors block"
                          >
                            {c.fullName}
                          </Link>
                          <div className="mt-0.5">
                            {c.cadetType === 'excadet' ? (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                {lang === 'en' ? 'Ex-Cadet / Alumni' : 'প্রাক্তন ক্যাডেট'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {lang === 'en' ? 'Cadet' : 'ক্যাডেট'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {c.department}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300 font-bold">
                          {c.currentSemester}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60">
                            {c.bloodGroup || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/cadet/${c.cadetId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-colors shadow-2xs"
                          >
                            <span>{lang === 'en' ? 'View Profile' : 'প্রোফাইল'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        {lang === 'en' ? 'No verified cadets found matching search criteria.' : 'কোনো যাচাইকৃত ক্যাডেট পাওয়া যায়নি।'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 4: The Cadet Lifecycle */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
              {lang === 'en' ? 'Service Principles' : 'সেবার মূলনীতি'}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-slate-900 dark:text-white">
              {lang === 'en' ? 'The Cadet Lifecycle' : 'ক্যাডেট জীবনচক্র'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Eligibility Criteria */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-3 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white">
                    {lang === 'en' ? 'Eligibility Criteria' : 'যোগ্যতার মানদণ্ড'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'en'
                      ? 'Students interested in joining the Metropolitan University BNCC Platoon must:'
                      : 'মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুনে যোগদানে আগ্রহী শিক্ষার্থীদের অবশ্যই:'}
                  </p>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'en'
                      ? 'Be a currently enrolled student at Metropolitan University.'
                      : 'মেট্রোপলিটন ইউনিভার্সিটির বর্তমান শিক্ষার্থী হতে হবে।'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'en'
                      ? 'Maintain satisfactory academic performance and disciplinary standing.'
                      : 'সন্তোষজনক একাডেমিক ফলাফল এবং শৃঙ্খলামূলক অবস্থান বজায় রাখতে হবে।'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'en'
                      ? 'Meet the required physical fitness standards.'
                      : 'প্রয়োজনীয় শারীরিক যোগ্যতার মানদণ্ড পূরণ করতে হবে।'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'en'
                      ? 'Successfully pass the BNCC recruitment and selection process.'
                      : 'বিএনসিসি নিয়োগ ও বাছাই প্রক্রিয়ায় সফলভাবে উত্তীর্ণ হতে হবে।'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'en'
                      ? 'Demonstrate dedication, discipline, and commitment towards training and organizational activities.'
                      : 'প্রশিক্ষণ এবং সাংগঠনিক কার্যক্রমের প্রতি একাগ্রতা, শৃঙ্খলা এবং প্রতিশ্রুতি প্রদর্শন করতে হবে।'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Benefits of Joining */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white">
                    {lang === 'en' ? 'Benefits of Joining' : 'যোগদানের সুবিধাসমূহ'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'en'
                      ? 'Joining BNCC provides students with opportunities to:'
                      : 'বিএনসিসিতে যোগদান শিক্ষার্থীদের যে সুযোগগুলো প্রদান করে:'}
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'en'
                      ? 'Develop leadership and communication skills.'
                      : 'নেতৃত্ব ও যোগাযোগের দক্ষতা বিকাশ।'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'en'
                      ? 'Participate in military and tactical training.'
                      : 'সামরিক এবং কৌশলগত প্রশিক্ষণে অংশগ্রহণ।'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'en'
                      ? 'Build confidence, discipline, and teamwork abilities.'
                      : 'আত্মবিশ্বাস, শৃঙ্খলা এবং দলবদ্ধভাবে কাজ করার ক্ষমতা বৃদ্ধি।'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'en'
                      ? 'Represent the university at national camps and competitions.'
                      : 'জাতীয় ক্যাম্প এবং প্রতিযোগিতায় বিশ্ববিদ্যালয়ের প্রতিনিধিত্ব করা।'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'en'
                      ? 'Participate in official government and military duties.'
                      : 'সরকারি ও সামরিক দাপ্তরিক দায়িত্ব পালনে অংশগ্রহণ।'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'en'
                      ? 'Engage in social welfare and community service programs.'
                      : 'সমাজকল্যাণমূলক এবং স্বেচ্ছাসেবী কার্যক্রমে সম্পৃক্ত হওয়া।'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'en'
                      ? 'Gain valuable experience in disaster response and emergency management.'
                      : 'দুর্যোগ মোকাবিলা এবং জরুরি ব্যবস্থাপনায় মূল্যবান অভিজ্ঞতা অর্জন।'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'en'
                      ? 'Build lifelong networks and friendships with cadets across Bangladesh.'
                      : 'সারা দেশের ক্যাডেটদের সাথে আজীবন নেটওয়ার্ক এবং বন্ধুত্ব গড়ে তোলা।'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 5: Achievement & Activities Tracker */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
              {lang === 'en' ? 'Field Deployments & Medals' : 'মাঠপর্যায়ের তৎপরতা ও অর্জন'}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-slate-900 dark:text-white">
              {lang === 'en' ? 'Achievement & Activities Tracker' : 'অর্জন এবং কার্যক্রম ট্র্যাকার'}
            </h2>
          </div>

          <div className="space-y-6">
            {/* Major Activities & Participation */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-3 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white">
                    {lang === 'en' ? 'Major Activities and Participation' : 'প্রধান কার্যক্রম এবং অংশগ্রহণ'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'en'
                      ? 'Since its establishment, the platoon has actively represented Metropolitan University in numerous national and institutional programs, including:'
                      : 'প্রতিষ্ঠার পর থেকে প্লাটুনটি অসংখ্য জাতীয় ও প্রাতিষ্ঠানিক কর্মসূচিতে মেট্রোপলিটন ইউনিভার্সিটির সক্রিয় প্রতিনিধিত্ব করেছে, যার মধ্যে রয়েছে:'}
                  </p>
                </div>
              </div>

              {/* 3-Column List of 15 Activities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {MAJOR_ACTIVITIES.map((act, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-amber-600/40 transition-colors"
                  >
                    <Star className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{lang === 'en' ? act.en : act.bn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recognition and Achievements */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400">
                  <Medal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white">
                    {lang === 'en' ? 'Recognition and Achievements' : 'স্বীকৃতি এবং অর্জন'}
                  </h3>
                  <span className="text-xs font-mono font-semibold uppercase text-amber-800 dark:text-amber-400">
                    {lang === 'en' ? 'Awards & Honors Record' : 'পুরস্কার ও প্রশংসাপত্র'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                <p>
                  {lang === 'en'
                    ? 'Despite being one of the newest platoons under the battalion, Metropolitan University BNCC Platoon has consistently demonstrated exceptional performance. During the GOC Visit, the platoon Guard of Honor received special appreciation, with senior military officials expressing admiration for the standard of performance achieved by such a newly established unit.'
                    : 'ব্যাটালিয়নের অন্যতম নতুন প্লাটুন হওয়া সত্ত্বেও মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুন ধারাবাহিকভাবে ব্যতিক্রমী পারফরম্যান্স প্রদর্শন করেছে। জিওসি পরিদর্শনের সময়, প্লাটুনের গার্ড অফ অনার বিশেষ প্রশংসা অর্জন করে এবং ঊর্ধ্বতন সামরিক কর্মকর্তারা এত নতুন ইউনিটের এমন উচ্চমানের পারফরম্যান্সে মুগ্ধতা প্রকাশ করেন।'}
                </p>
                <p>
                  {lang === 'en'
                    ? 'The platoon has also earned multiple medals and accolades at Battalion and Central Camps, securing Champion and Runner-Up positions in drill competitions while achieving recognition in cultural events. Through every camp, competition, parade, and official assignment, the platoon has successfully represented Metropolitan University with pride, discipline, and excellence.'
                    : 'প্লাটুনটি ব্যাটালিয়ন এবং সেন্ট্রাল ক্যাম্পে একাধিক পদক ও সম্মাননা অর্জন করেছে, ড্রিল প্রতিযোগিতায় চ্যাম্পিয়ন এবং রানার-আপ স্থান অধিকার করার পাশাপাশি সাংস্কৃতিক অনুষ্ঠানে স্বীকৃতি লাভ করেছে। প্রতিটি ক্যাম্প, প্রতিযোগিতা, কুচকাওয়াজ এবং সরকারি দায়িত্বে, প্লাটুনটি গর্ব, শৃঙ্খলা এবং শ্রেষ্ঠত্বের সাথে মেট্রোপলিটন ইউনিভার্সিটির প্রতিনিধিত্ব করে চলেছে।'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Frequently Asked Questions (FAQ) Accordion */}
        <section id="faq" className="scroll-mt-20">
          <FaqAccordion lang={lang} />
        </section>



        {/* Call to action */}
        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-100/90 via-white to-slate-50 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950 p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <h3 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-950 dark:text-white">
            {lang === 'en' ? 'Join the MU BNCC Cadet Corps' : 'মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি ক্যাডেট কর্পসে যোগ দিন'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            {lang === 'en'
              ? 'Become part of an elite university fraternity that blends rigorous military discipline with academic leadership.'
              : 'একটি সুশৃঙ্খল এবং দেশপ্রেমিক বিশ্ববিদ্যালয় ইউনিটের অংশ হোন যা সামরিক শৃঙ্খলার সাথে নেতৃত্ব ও একাডেমিক শ্রেষ্ঠত্বকে সংযুক্ত করে।'}
          </p>
          <div className="pt-2">
            <Link
              to="/how-to-join"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm hover:shadow-red-700/25 transition-all active:scale-95"
            >
              <span>{lang === 'en' ? 'Check Eligibility & Apply' : 'যোগ্যতা যাচাই ও আবেদন করুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
